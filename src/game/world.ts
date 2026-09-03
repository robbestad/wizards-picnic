import { CATALOG, scaledHp, scaledSpeed } from "./catalog";
import { circlesOverlap } from "./collision";
import {
  BOLT_DAMAGE,
  BOLT_LIFE,
  BOLT_RADIUS,
  BOLT_SPEED,
  COOLDOWN,
  FINAL_WAVE,
  IFRAMES,
  MARGIN,
  PLAYER_HP,
  PLAYER_RADIUS,
  PLAYER_SPEED,
  WAVE_GRACE,
  WIZARD_NAMES,
  WIZARD_SKINS,
  WORLD_SIZE,
} from "./constants";
import { spawnVelocity, stepMonster } from "./ai";
import type { InputView } from "./input";
import { add, clamp, len, pick, randRange, scale, sub, type Vec } from "./math";
import { canSplit, wavePlan } from "./spawn";
import type { Bolt, Monster, Player, Status, World } from "./types";
import type { EnemyId } from "./catalog";

function clampPos(pos: Vec, radius: number): Vec {
  return {
    x: clamp(pos.x, MARGIN + radius, WORLD_SIZE - MARGIN - radius),
    y: clamp(pos.y, MARGIN + radius, WORLD_SIZE - MARGIN - radius),
  };
}

function edgePos(): Vec {
  const side = Math.floor(randRange(0, 4));
  const t = randRange(MARGIN, WORLD_SIZE - MARGIN);
  if (side === 0) return { x: t, y: -24 };
  if (side === 1) return { x: t, y: WORLD_SIZE + 24 };
  if (side === 2) return { x: -24, y: t };
  return { x: WORLD_SIZE + 24, y: t };
}

function makePlayer(): Player {
  return {
    name: pick(WIZARD_NAMES),
    sprite: pick(WIZARD_SKINS),
    pos: { x: WORLD_SIZE / 2, y: WORLD_SIZE / 2 + 40 },
    facing: { x: 0, y: -1 },
    radius: PLAYER_RADIUS,
    hp: PLAYER_HP,
    maxHp: PLAYER_HP,
    cooldown: 0,
    iframes: 0,
  };
}

function beginWave(world: World, wave: number): void {
  const plan = wavePlan(wave);
  world.wave = wave;
  world.queue = plan.ids;
  world.spawnInterval = plan.interval;
  world.spawnTimer = 0.55;
  world.banner = plan.banner;
  world.bannerTimer = 2.2;
  world.player.iframes = Math.max(world.player.iframes, WAVE_GRACE);
  if (wave > 1) world.events.push("wave");
}

export function createWorld(): World {
  const world: World = {
    status: "playing",
    time: 0,
    wave: 1,
    score: 0,
    player: makePlayer(),
    monsters: [],
    bolts: [],
    shots: [],
    puddles: [],
    queue: [],
    spawnTimer: 0,
    spawnInterval: 0.5,
    wavePause: 0,
    banner: "",
    bannerTimer: 0,
    nextId: 1,
    events: [],
  };
  beginWave(world, 1);
  return world;
}

function hurtPlayer(world: World, amount: number, from: Vec): void {
  if (world.player.iframes > 0 || world.status !== "playing") return;
  world.player.hp -= amount;
  world.player.iframes = IFRAMES;
  world.events.push("hurt");
  const push = sub(world.player.pos, from);
  const n = len(push) < 0.1 ? { x: 1, y: 0 } : push;
  world.player.pos = clampPos(add(world.player.pos, scale(n, 18 / Math.max(len(n), 1))), world.player.radius);
}

function fireBolt(world: World, dir: Vec): void {
  const origin = add(world.player.pos, scale(dir, 8));
  const bolt: Bolt = {
    id: world.nextId++,
    pos: origin,
    vel: scale(dir, BOLT_SPEED),
    radius: BOLT_RADIUS,
    damage: BOLT_DAMAGE,
    life: BOLT_LIFE,
    frame: 0,
  };
  world.bolts.push(bolt);
  world.player.cooldown = COOLDOWN;
  world.player.facing = dir;
  world.events.push("shoot");
}

function spawnOne(world: World, kind: EnemyId, pos: Vec, generation: number): void {
  const spec = CATALOG[kind];
  const hp = Math.max(4, Math.round(scaledHp(spec, world.wave) / (generation + 1)));
  const size = generation > 0 ? spec.size * 0.65 : spec.size;
  const monster: Monster = {
    id: world.nextId++,
    kind,
    pos: { ...pos },
    vel: spawnVelocity(kind),
    radius: generation > 0 ? spec.radius * 0.7 : spec.radius,
    size,
    hp,
    maxHp: hp,
    speed: scaledSpeed(spec, world.wave) * (generation > 0 ? 1.15 : 1),
    contact: spec.contact,
    score: generation > 0 ? Math.max(1, Math.floor(spec.score / 2)) : spec.score,
    sprite: spec.sprite,
    generation,
    phase: "idle",
    timer: 0,
    axis: "x",
    tick: 0.2,
  };
  world.monsters.push(monster);
}

function killMonster(world: World, monster: Monster): void {
  world.score += monster.score;
  world.monsters = world.monsters.filter((m) => m.id !== monster.id);
  world.events.push("kill");
  if (canSplit(monster.kind, monster.generation)) {
    spawnOne(world, monster.kind, add(monster.pos, { x: -12, y: 0 }), 1);
    spawnOne(world, monster.kind, add(monster.pos, { x: 12, y: 0 }), 1);
  }
}

function stepPlayer(world: World, input: InputView, dt: number): void {
  const p = world.player;
  const mv = input.moveVec();
  if (len(mv) > 0.05) {
    p.facing = mv;
    p.pos = clampPos(add(p.pos, scale(mv, PLAYER_SPEED * dt)), p.radius);
  }
  p.cooldown = Math.max(0, p.cooldown - dt);
  p.iframes = Math.max(0, p.iframes - dt);
  if (input.wantsFire() && p.cooldown <= 0) {
    fireBolt(world, input.fireDir(p.facing, p.pos));
  }
}

function stepSpawns(world: World, dt: number): void {
  if (world.wavePause > 0) {
    world.wavePause -= dt;
    if (world.wavePause <= 0) {
      if (world.wave >= FINAL_WAVE) {
        world.status = "won";
        world.banner = "You can finally enjoy your picnic!";
        world.bannerTimer = 8;
        world.events.push("win");
        return;
      }
      beginWave(world, world.wave + 1);
    }
    return;
  }
  world.spawnTimer -= dt;
  if (world.queue.length > 0 && world.spawnTimer <= 0) {
    const kind = world.queue.shift()!;
    spawnOne(world, kind, edgePos(), 0);
    world.spawnTimer = world.spawnInterval;
  }
  if (world.queue.length === 0 && world.monsters.length === 0) {
    world.wavePause = 2;
    world.banner = world.wave >= FINAL_WAVE ? "The ants retreat..." : "The picnic is quiet...";
    world.bannerTimer = 2;
  }
}

export function stepWorld(world: World, input: InputView, dt: number): void {
  if (world.status === "paused") {
    if (input.consumePause()) {
      world.status = "playing";
      world.events.push("resume");
    }
    return;
  }
  if (world.status !== "playing") return;
  if (input.consumePause()) {
    world.status = "paused";
    world.events.push("pause");
    return;
  }

  world.time += dt;
  world.bannerTimer = Math.max(0, world.bannerTimer - dt);

  stepPlayer(world, input, dt);

  for (const b of world.bolts) {
    b.pos = add(b.pos, scale(b.vel, dt));
    b.life -= dt;
    b.frame += dt * 12;
  }
  world.bolts = world.bolts.filter(
    (b) =>
      b.life > 0 &&
      b.pos.x > -40 &&
      b.pos.y > -40 &&
      b.pos.x < WORLD_SIZE + 40 &&
      b.pos.y < WORLD_SIZE + 40,
  );

  for (const m of world.monsters) stepMonster(world, m, dt);

  for (const s of world.shots) {
    s.pos = add(s.pos, scale(s.vel, dt));
    s.life -= dt;
  }
  world.shots = world.shots.filter((s) => s.life > 0);

  for (const p of world.puddles) p.life -= dt;
  world.puddles = world.puddles.filter((p) => p.life > 0);

  for (const bolt of [...world.bolts]) {
    for (const monster of [...world.monsters]) {
      if (!circlesOverlap(bolt.pos, bolt.radius, monster.pos, monster.radius)) continue;
      monster.hp -= bolt.damage;
      world.bolts = world.bolts.filter((b) => b.id !== bolt.id);
      world.events.push("hit");
      if (monster.hp <= 0) killMonster(world, monster);
      break;
    }
  }

  const p = world.player;
  for (const monster of world.monsters) {
    if (circlesOverlap(p.pos, p.radius, monster.pos, monster.radius)) {
      hurtPlayer(world, monster.contact, monster.pos);
    }
  }
  for (const shot of [...world.shots]) {
    if (circlesOverlap(p.pos, p.radius, shot.pos, shot.radius)) {
      hurtPlayer(world, shot.damage, shot.pos);
      world.shots = world.shots.filter((s) => s.id !== shot.id);
    }
  }
  for (const puddle of world.puddles) {
    if (circlesOverlap(p.pos, p.radius, puddle.pos, puddle.radius)) {
      hurtPlayer(world, puddle.damage, puddle.pos);
    }
  }

  stepSpawns(world, dt);

  if (p.hp <= 0) {
    p.hp = 0;
    world.status = "lost";
    world.banner = "The picnic is ruined.";
    world.bannerTimer = 8;
    world.events.push("lose");
  }
}

export function togglePause(world: World): void {
  if (world.status === "playing") {
    world.status = "paused";
    world.events.push("pause");
  } else if (world.status === "paused") {
    world.status = "playing";
    world.events.push("resume");
  }
}

export type { Status };
