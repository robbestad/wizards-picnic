import { describe, expect, it } from "vitest";
import { CATALOG } from "../src/game/catalog";
import type { InputView } from "../src/game/input";
import { createWorld, stepWorld } from "../src/game/world";
import type { Monster } from "../src/game/types";

function idleInput(fire = false): InputView {
  return {
    consumePause: () => false,
    moveVec: () => ({ x: 0, y: 0 }),
    wantsFire: () => fire,
    fireDir: () => ({ x: 1, y: 0 }),
  };
}

function dummyAnt(world: ReturnType<typeof createWorld>, x: number, y: number): Monster {
  const spec = CATALOG.ant_column;
  const m: Monster = {
    id: world.nextId++,
    kind: "ant_column",
    pos: { x, y },
    vel: { x: 0, y: 0 },
    radius: spec.radius,
    size: spec.size,
    hp: spec.hp,
    maxHp: spec.hp,
    speed: spec.speed,
    contact: spec.contact,
    score: spec.score,
    sprite: spec.sprite,
    generation: 0,
    phase: "idle",
    timer: 0,
    axis: "x",
    tick: 1,
  };
  world.monsters.push(m);
  return m;
}

describe("wave grace", () => {
  it("starts a run with spawn i-frames", () => {
    const world = createWorld();
    expect(world.player.iframes).toBeGreaterThan(1);
    dummyAnt(world, world.player.pos.x, world.player.pos.y);
    const hp = world.player.hp;
    stepWorld(world, idleInput(false), 1 / 60);
    expect(world.player.hp).toBe(hp);
  });
});

describe("bolts", () => {
  it("kills a monster standing in the shot line", () => {
    const world = createWorld();
    world.queue = [];
    world.monsters = [];
    world.player.pos = { x: 200, y: 200 };
    world.player.facing = { x: 1, y: 0 };
    world.player.cooldown = 0;
    dummyAnt(world, 230, 200);
    for (let i = 0; i < 20; i++) stepWorld(world, idleInput(true), 1 / 60);
    expect(world.score).toBeGreaterThan(0);
    expect(world.monsters.length).toBe(0);
    expect(world.events).toContain("shoot");
    expect(world.events).toContain("hit");
    expect(world.events).toContain("kill");
  });
});
