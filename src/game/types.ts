import type { EnemyId } from "./catalog";
import type { Vec } from "./math";

export type Status = "playing" | "paused" | "won" | "lost";

export type GameEvent =
  | "shoot"
  | "hit"
  | "hurt"
  | "kill"
  | "wave"
  | "pause"
  | "resume"
  | "lose"
  | "win";

export type Player = {
  name: string;
  sprite: string;
  pos: Vec;
  facing: Vec;
  radius: number;
  hp: number;
  maxHp: number;
  cooldown: number;
  iframes: number;
};

export type Bolt = {
  id: number;
  pos: Vec;
  vel: Vec;
  radius: number;
  damage: number;
  life: number;
  frame: number;
};

export type Monster = {
  id: number;
  kind: EnemyId;
  pos: Vec;
  vel: Vec;
  radius: number;
  size: number;
  hp: number;
  maxHp: number;
  speed: number;
  contact: number;
  score: number;
  sprite: string;
  generation: number;
  phase: "idle" | "windup" | "burst" | "recover" | "flee";
  timer: number;
  axis: "x" | "y";
  tick: number;
};

export type Shot = {
  id: number;
  pos: Vec;
  vel: Vec;
  radius: number;
  damage: number;
  life: number;
};

export type Puddle = {
  id: number;
  pos: Vec;
  radius: number;
  life: number;
  damage: number;
};

export type World = {
  status: Status;
  time: number;
  wave: number;
  score: number;
  player: Player;
  monsters: Monster[];
  bolts: Bolt[];
  shots: Shot[];
  puddles: Puddle[];
  queue: EnemyId[];
  spawnTimer: number;
  spawnInterval: number;
  wavePause: number;
  banner: string;
  bannerTimer: number;
  nextId: number;
  events: GameEvent[];
};
