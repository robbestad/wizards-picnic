import { WORLD_SIZE } from "./constants";
import { len, norm, type Vec } from "./math";

const GAME_CODES = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Space",
  "Escape",
  "KeyP",
]);

export type InputView = {
  consumePause(): boolean;
  moveVec(): Vec;
  wantsFire(): boolean;
  fireDir(facing: Vec, origin: Vec): Vec;
};

export class Input implements InputView {
  readonly keys = new Set<string>();
  pointer: Vec = { x: WORLD_SIZE / 2, y: WORLD_SIZE / 2 };
  pointerDown = false;
  pointerAim = false;
  touchMove: Vec = { x: 0, y: 0 };
  touchFire = false;
  private pauseEdge = false;
  private shotQueue: Vec | null = null;
  private abort?: AbortController;
  private canvas?: HTMLCanvasElement;

  attach(canvas: HTMLCanvasElement): void {
    this.detach();
    this.canvas = canvas;
    this.abort = new AbortController();
    const s = { signal: this.abort.signal };
    window.addEventListener("keydown", (e) => this.onKey(e, true), s);
    window.addEventListener("keyup", (e) => this.onKey(e, false), s);
    canvas.addEventListener("pointerdown", (e) => this.onPointer(e, true), s);
    canvas.addEventListener("pointerup", (e) => this.onPointer(e, false), s);
    canvas.addEventListener("pointermove", (e) => this.onPointer(e, this.pointerDown), s);
    canvas.addEventListener("pointerleave", () => {
      this.pointerDown = false;
    }, s);
    canvas.addEventListener("contextmenu", (e) => e.preventDefault(), s);
  }

  detach(): void {
    this.abort?.abort();
    this.abort = undefined;
    this.keys.clear();
    this.pointerDown = false;
    this.touchFire = false;
    this.touchMove = { x: 0, y: 0 };
  }

  consumePause(): boolean {
    const hit = this.pauseEdge;
    this.pauseEdge = false;
    return hit;
  }

  moveVec(): Vec {
    let x = this.touchMove.x;
    let y = this.touchMove.y;
    if (this.keys.has("KeyA")) x -= 1;
    if (this.keys.has("KeyD")) x += 1;
    if (this.keys.has("KeyW")) y -= 1;
    if (this.keys.has("KeyS")) y += 1;
    const v = { x, y };
    const l = len(v);
    return l > 1 ? norm(v) : v;
  }

  arrowShoot(): Vec | null {
    let x = 0;
    let y = 0;
    if (this.keys.has("ArrowLeft")) x -= 1;
    if (this.keys.has("ArrowRight")) x += 1;
    if (this.keys.has("ArrowUp")) y -= 1;
    if (this.keys.has("ArrowDown")) y += 1;
    if (x === 0 && y === 0) return null;
    return norm({ x, y });
  }

  wantsFire(): boolean {
    return (
      this.shotQueue !== null ||
      this.keys.has("Space") ||
      this.pointerDown ||
      this.touchFire ||
      this.arrowShoot() !== null
    );
  }

  fireDir(facing: Vec, origin: Vec): Vec {
    const queued = this.shotQueue;
    this.shotQueue = null;
    if (queued && len(queued) > 0.2) return queued;
    const arrows = this.arrowShoot();
    if (arrows) return arrows;
    if (this.pointerAim || this.pointerDown) {
      const aim = norm({ x: this.pointer.x - origin.x, y: this.pointer.y - origin.y });
      if (len(aim) > 0.2) return aim;
    }
    if (len(facing) > 0.2) return facing;
    return { x: 1, y: 0 };
  }

  setTouchMove(x: number, y: number): void {
    this.touchMove = { x, y };
  }

  setTouchFire(on: boolean): void {
    this.touchFire = on;
    if (on) this.shotQueue = { x: 0, y: 0 };
  }

  pulseFire(): void {
    this.shotQueue = { x: 0, y: 0 };
  }

  private onKey(e: KeyboardEvent, down: boolean): void {
    if (e.repeat && down) return;
    if (!GAME_CODES.has(e.code)) return;
    e.preventDefault();
    if (down) {
      this.keys.add(e.code);
      const arrows = this.arrowShoot();
      if (arrows) this.shotQueue = arrows;
      else if (e.code === "Space") this.shotQueue = { x: 0, y: 0 };
    } else this.keys.delete(e.code);
    if (down && (e.code === "Escape" || e.code === "KeyP")) this.pauseEdge = true;
  }

  private onPointer(e: PointerEvent, down: boolean): void {
    const canvas = this.canvas;
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    this.pointer = {
      x: ((e.clientX - r.left) / r.width) * WORLD_SIZE,
      y: ((e.clientY - r.top) / r.height) * WORLD_SIZE,
    };
    this.pointerDown = down;
    this.pointerAim = true;
    if (down) this.shotQueue = { x: 0, y: 0 };
  }
}
