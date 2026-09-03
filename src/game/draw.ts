import { CATALOG } from "./catalog";
import { WORLD_SIZE } from "./constants";
import { angleOf } from "./math";
import type { World } from "./types";

const cache = new Map<string, HTMLImageElement>();
const keyed = new Map<string, HTMLCanvasElement>();

export const GRASS = "/sprites/classic/boards/board512_grass.png";
export const BOLT_FRAMES = ["/sprites/vfx/bolt01.png", "/sprites/vfx/bolt02.png"];
export const ENEMY_BOLT = "/sprites/classic/fx/lightning.png";

export function loadImage(src: string): HTMLImageElement {
  let img = cache.get(src);
  if (img) return img;
  img = new Image();
  img.src = src;
  cache.set(src, img);
  return img;
}

export function preload(urls: readonly string[]): void {
  for (const url of urls) loadImage(url);
}

function ready(img: HTMLImageElement): boolean {
  return img.complete && img.naturalWidth > 0;
}

function keyEdgeBlack(img: HTMLImageElement): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const c2 = c.getContext("2d");
  if (!c2) return c;
  c2.drawImage(img, 0, 0);
  const frame = c2.getImageData(0, 0, c.width, c.height);
  const { data, width: w, height: h } = frame;
  const seen = new Uint8Array(w * h);
  const bg = (p: number) => {
    const i = p * 4;
    return data[i]! < 22 && data[i + 1]! < 22 && data[i + 2]! < 22;
  };
  const stack: number[] = [];
  for (let x = 0; x < w; x++) {
    stack.push(x, (h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    stack.push(y * w, y * w + w - 1);
  }
  while (stack.length) {
    const p = stack.pop()!;
    if (p < 0 || p >= w * h || seen[p]) continue;
    seen[p] = 1;
    if (!bg(p)) continue;
    data[p * 4 + 3] = 0;
    stack.push(p - 1, p + 1, p - w, p + w);
  }
  c2.putImageData(frame, 0, 0);
  return c;
}

function source(src: string, img: HTMLImageElement): HTMLImageElement | HTMLCanvasElement {
  if (!src.includes("/classic/") || !ready(img)) return img;
  let sheet = keyed.get(src);
  if (!sheet) {
    sheet = keyEdgeBlack(img);
    keyed.set(src, sheet);
  }
  return sheet;
}

function blit(
  ctx: CanvasRenderingContext2D,
  src: string,
  x: number,
  y: number,
  size: number,
  angle = 0,
  alpha = 1,
): void {
  const img = loadImage(src);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  if (angle) ctx.rotate(angle);
  if (ready(img)) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(source(src, img), -size / 2, -size / 2, size, size);
  } else {
    ctx.fillStyle = "#e8c36a";
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function blanket(ctx: CanvasRenderingContext2D): void {
  const size = 88;
  const x = WORLD_SIZE / 2 - size / 2;
  const y = WORLD_SIZE / 2 - size / 2 - 8;
  const cell = 11;
  for (let i = 0; i < size / cell; i++) {
    for (let j = 0; j < size / cell; j++) {
      ctx.fillStyle = (i + j) % 2 === 0 ? "#c94a3a" : "#f3e4c8";
      ctx.fillRect(x + i * cell, y + j * cell, cell, cell);
    }
  }
  ctx.strokeStyle = "rgba(40,20,10,0.45)";
  ctx.strokeRect(x, y, size, size);
}

export function drawWorld(canvas: HTMLCanvasElement, world: World): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  if (canvas.width !== WORLD_SIZE) {
    canvas.width = WORLD_SIZE;
    canvas.height = WORLD_SIZE;
  }
  ctx.imageSmoothingEnabled = false;
  const grass = loadImage(GRASS);
  if (ready(grass)) ctx.drawImage(grass, 0, 0, WORLD_SIZE, WORLD_SIZE);
  else {
    ctx.fillStyle = "#2d6b2a";
    ctx.fillRect(0, 0, WORLD_SIZE, WORLD_SIZE);
  }

  blanket(ctx);

  for (const puddle of world.puddles) {
    ctx.fillStyle = `rgba(80, 200, 70, ${0.25 + puddle.life * 0.08})`;
    ctx.beginPath();
    ctx.arc(puddle.pos.x, puddle.pos.y, puddle.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const m of world.monsters) {
    if (m.phase === "windup") {
      ctx.strokeStyle = "rgba(255, 140, 40, 0.85)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(m.pos.x, m.pos.y, m.radius + 10 + Math.sin(world.time * 14) * 3, 0, Math.PI * 2);
      ctx.stroke();
    }
    blit(ctx, m.sprite, m.pos.x, m.pos.y, m.size);
    if (m.hp < m.maxHp || CATALOG[m.kind].boss) {
      const w = m.size;
      const h = 4;
      const x = m.pos.x - w / 2;
      const y = m.pos.y - m.size / 2 - 8;
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = m.hp / m.maxHp > 0.4 ? "#7bd36a" : "#e05a4f";
      ctx.fillRect(x, y, w * Math.max(0, m.hp / m.maxHp), h);
    }
  }

  const flash =
    world.player.iframes > 0 ? 0.4 + 0.6 * Math.abs(Math.sin(world.time * 22)) : 1;
  blit(ctx, world.player.sprite, world.player.pos.x, world.player.pos.y, 48, 0, flash);

  for (const b of world.bolts) {
    const frame = BOLT_FRAMES[Math.floor(b.frame) % BOLT_FRAMES.length]!;
    blit(ctx, frame, b.pos.x, b.pos.y, 28, angleOf(b.vel));
  }

  for (const s of world.shots) {
    blit(ctx, ENEMY_BOLT, s.pos.x, s.pos.y, 22, angleOf(s.vel));
  }
}

export function fitCanvas(canvas: HTMLCanvasElement): void {
  const avail = Math.min(window.innerWidth - 24, window.innerHeight - 200);
  const raw = avail / WORLD_SIZE;
  const scale =
    raw >= 1 ? Math.min(2, Math.floor(raw * 2) / 2) : Math.max(0.5, Math.round(raw * 4) / 4);
  canvas.style.width = `${Math.round(WORLD_SIZE * scale)}px`;
  canvas.style.height = `${Math.round(WORLD_SIZE * scale)}px`;
}

export function allSpriteUrls(): string[] {
  const urls = new Set<string>([GRASS, ENEMY_BOLT, ...BOLT_FRAMES]);
  for (const spec of Object.values(CATALOG)) urls.add(spec.sprite);
  return [...urls];
}
