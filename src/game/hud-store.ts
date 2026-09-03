import { createStore } from "svenjs";
import { readHighScore } from "./highscore";
import type { Status, World } from "./types";

export type HudState = {
  score: number;
  highScore: number;
  hp: number;
  maxHp: number;
  wave: number;
  cooldown: number;
  iframes: number;
  status: Status;
  banner: string;
  playerName: string;
  remaining: number;
};

const empty: HudState = {
  score: 0,
  highScore: 0,
  hp: 100,
  maxHp: 100,
  wave: 1,
  cooldown: 0,
  iframes: 0,
  status: "playing",
  banner: "",
  playerName: "",
  remaining: 0,
};

export const hudStore = createStore<HudState>({ state: empty });

let acc = 0;

export function snapshot(world: World): HudState {
  return {
    score: world.score,
    highScore: Math.max(readHighScore(), world.score),
    hp: Math.max(0, world.player.hp),
    maxHp: world.player.maxHp,
    wave: world.wave,
    cooldown: world.player.cooldown,
    iframes: world.player.iframes,
    status: world.status,
    banner: world.bannerTimer > 0 ? world.banner : "",
    playerName: world.player.name,
    remaining: world.monsters.length + world.queue.length,
  };
}

export function syncHud(world: World, dt: number, force = false): void {
  acc += dt;
  const statusChanged = hudStore.get().status !== world.status;
  if (!force && !statusChanged && acc < 0.08) return;
  acc = 0;
  hudStore.set(snapshot(world));
}

export function resetHud(): void {
  acc = 1;
  hudStore.set(empty);
}
