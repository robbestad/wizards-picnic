import { CATALOG } from "./catalog";
import { WORLD_SIZE } from "./constants";
import { add, len, norm, rand, randRange, scale, sub, type Vec } from "./math";
import type { Monster, World } from "./types";

function toward(from: Vec, to: Vec, speed: number, dt: number): Vec {
  const d = sub(to, from);
  const n = norm(d);
  return add(from, scale(n, speed * dt));
}

function bounce(m: Monster): void {
  const pad = m.radius;
  if (m.pos.x < pad) {
    m.pos.x = pad;
    m.vel.x = Math.abs(m.vel.x);
  } else if (m.pos.x > WORLD_SIZE - pad) {
    m.pos.x = WORLD_SIZE - pad;
    m.vel.x = -Math.abs(m.vel.x);
  }
  if (m.pos.y < pad) {
    m.pos.y = pad;
    m.vel.y = Math.abs(m.vel.y);
  } else if (m.pos.y > WORLD_SIZE - pad) {
    m.pos.y = WORLD_SIZE - pad;
    m.vel.y = -Math.abs(m.vel.y);
  }
}

function wander(m: Monster, dt: number): void {
  m.tick -= dt;
  if (m.tick <= 0) {
    m.axis = rand() < 0.5 ? "x" : "y";
    m.tick = randRange(0.4, 1.2);
    const s = m.speed * (rand() < 0.5 ? -1 : 1);
    if (m.axis === "x") m.vel = { x: s, y: 0 };
    else m.vel = { x: 0, y: s };
  }
  m.pos = add(m.pos, scale(m.vel, dt));
  bounce(m);
}

export function stepMonster(world: World, m: Monster, dt: number): void {
  const player = world.player.pos;
  const spec = CATALOG[m.kind];
  const delta = sub(player, m.pos);
  const dist = len(delta);
  const dir = norm(delta);
  m.timer = Math.max(0, m.timer - dt);

  switch (spec.ai) {
    case "wander":
      wander(m, dt);
      return;
    case "swarm":
      if (dist < 260) m.pos = toward(m.pos, player, m.speed, dt);
      else wander(m, dt);
      bounce(m);
      return;
    case "chase":
      m.pos = toward(m.pos, player, m.speed, dt);
      bounce(m);
      return;
    case "puddle":
      wander(m, dt);
      if (m.timer <= 0) {
        world.puddles.push({
          id: world.nextId++,
          pos: { ...m.pos },
          radius: 22,
          life: 2.8,
          damage: 8,
        });
        m.timer = 0.9;
      }
      return;
    case "zigzag": {
      const side = { x: -dir.y, y: dir.x };
      const wiggle = Math.sin(world.time * 7 + m.id) * 90;
      const aim = add(scale(dir, m.speed), scale(side, wiggle));
      m.pos = add(m.pos, scale(norm(aim), m.speed * dt));
      bounce(m);
      return;
    }
    case "swoop": {
      const orbit = { x: Math.cos(world.time * 2 + m.id), y: Math.sin(world.time * 2 + m.id) };
      const target = add(player, scale(orbit, 90));
      m.pos = toward(m.pos, target, m.speed, dt);
      bounce(m);
      return;
    }
    case "flyby": {
      if (len(m.vel) < 10) {
        const left = m.pos.x < WORLD_SIZE / 2;
        m.vel = { x: (left ? 1 : -1) * m.speed, y: randRange(-40, 40) };
      }
      m.pos = add(m.pos, scale(m.vel, dt));
      m.pos.y += Math.sin(world.time * 5 + m.id) * 40 * dt;
      if (m.pos.x < -40) m.pos.x = WORLD_SIZE + 20;
      if (m.pos.x > WORLD_SIZE + 40) m.pos.x = -20;
      if (m.pos.y < 20) m.pos.y = 20;
      if (m.pos.y > WORLD_SIZE - 20) m.pos.y = WORLD_SIZE - 20;
      return;
    }
    case "thief": {
      if (dist < 88) m.phase = "flee";
      else if (dist > 170) m.phase = "idle";
      if (m.phase === "flee") {
        m.pos = add(m.pos, scale(dir, -m.speed * 1.25 * dt));
      } else {
        const side = { x: -dir.y, y: dir.x };
        const aim = add(scale(dir, 0.6), scale(side, Math.sin(world.time * 3) * 0.8));
        m.pos = add(m.pos, scale(norm(aim), m.speed * dt));
      }
      bounce(m);
      return;
    }
    case "ranged": {
      if (dist < 150) m.pos = add(m.pos, scale(dir, -m.speed * dt));
      else if (dist > 260) m.pos = toward(m.pos, player, m.speed, dt);
      else if (m.timer <= 0) {
        const n = norm(delta);
        world.shots.push({
          id: world.nextId++,
          pos: add(m.pos, scale(n, m.radius + 8)),
          vel: scale(n, 240),
          radius: 8,
          damage: 12,
          life: 2.4,
        });
        m.timer = 1.35;
      }
      bounce(m);
      return;
    }
    case "dash":
    case "charge":
    case "lunge": {
      const wind = spec.ai === "charge" ? 0.7 : spec.ai === "lunge" ? 0.55 : 0.32;
      const burst = spec.ai === "charge" ? 0.42 : spec.ai === "lunge" ? 0.28 : 0.22;
      const recover = spec.ai === "lunge" ? 1.1 : 0.7;
      const range = spec.ai === "lunge" ? 150 : 200;
      const burstSpeed = spec.ai === "charge" ? 380 : spec.ai === "lunge" ? 420 : 360;
      if (m.phase === "idle") {
        if (spec.ai === "lunge" && dist > range) wander(m, dt);
        else m.pos = toward(m.pos, player, m.speed * 0.55, dt);
        if (dist < range && m.timer <= 0) {
          m.phase = "windup";
          m.timer = wind;
        }
      } else if (m.phase === "windup") {
        if (m.timer <= 0) {
          m.phase = "burst";
          m.timer = burst;
          m.vel = scale(norm(sub(player, m.pos)), burstSpeed);
        }
      } else if (m.phase === "burst") {
        m.pos = add(m.pos, scale(m.vel, dt));
        if (m.timer <= 0) {
          m.phase = "recover";
          m.timer = recover;
          m.vel = { x: 0, y: 0 };
        }
      } else {
        if (m.timer <= 0) m.phase = "idle";
      }
      bounce(m);
      return;
    }
    default:
      m.pos = toward(m.pos, player, m.speed, dt);
      bounce(m);
  }
}

export function spawnVelocity(kind: Monster["kind"]): Vec {
  const spec = CATALOG[kind];
  if (spec.ai === "flyby") return { x: 0, y: 0 };
  const a = randRange(0, Math.PI * 2);
  return { x: Math.cos(a) * spec.speed, y: Math.sin(a) * spec.speed };
}
