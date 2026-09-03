export type AiKind =
  | "wander"
  | "chase"
  | "swarm"
  | "dash"
  | "charge"
  | "lunge"
  | "flyby"
  | "thief"
  | "ranged"
  | "zigzag"
  | "swoop"
  | "puddle";

export type EnemyId =
  | "ant_column"
  | "wasp"
  | "basket_mimic"
  | "raven"
  | "bear"
  | "goblin_thief"
  | "storm_sprite"
  | "sandwich_slime"
  | "rat"
  | "giant_mite"
  | "boring_beetle"
  | "acid_blob"
  | "ooze"
  | "pulsating_lump"
  | "orc_warrior"
  | "hobgoblin"
  | "hill_giant"
  | "harpy"
  | "griffon"
  | "demonspawn"
  | "hell_knight"
  | "guardian_serpent"
  | "hydra"
  | "dragon"
  | "golden_dragon";

export type EnemySpec = {
  id: EnemyId;
  name: string;
  sprite: string;
  hp: number;
  speed: number;
  radius: number;
  size: number;
  contact: number;
  score: number;
  ai: AiKind;
  split?: boolean;
  boss?: boolean;
};

const beast = (file: string) => `/sprites/classic/beasts/${file}.png`;
const picnic = (file: string) => `/sprites/enemies/${file}.png`;

export const CATALOG: Record<EnemyId, EnemySpec> = {
  ant_column: {
    id: "ant_column",
    name: "Picnic ant",
    sprite: picnic("ant_column"),
    hp: 8,
    speed: 108,
    radius: 14,
    size: 40,
    contact: 6,
    score: 1,
    ai: "swarm",
  },
  wasp: {
    id: "wasp",
    name: "Wasp",
    sprite: picnic("wasp"),
    hp: 18,
    speed: 165,
    radius: 14,
    size: 48,
    contact: 12,
    score: 3,
    ai: "dash",
  },
  basket_mimic: {
    id: "basket_mimic",
    name: "Basket mimic",
    sprite: picnic("basket_mimic"),
    hp: 48,
    speed: 42,
    radius: 20,
    size: 58,
    contact: 18,
    score: 8,
    ai: "lunge",
  },
  raven: {
    id: "raven",
    name: "Sandwich raven",
    sprite: picnic("raven"),
    hp: 16,
    speed: 210,
    radius: 14,
    size: 52,
    contact: 10,
    score: 4,
    ai: "flyby",
  },
  bear: {
    id: "bear",
    name: "Picnic bear",
    sprite: picnic("bear"),
    hp: 90,
    speed: 70,
    radius: 24,
    size: 72,
    contact: 22,
    score: 12,
    ai: "charge",
    boss: true,
  },
  goblin_thief: {
    id: "goblin_thief",
    name: "Goblin thief",
    sprite: picnic("goblin_thief"),
    hp: 26,
    speed: 145,
    radius: 15,
    size: 52,
    contact: 12,
    score: 5,
    ai: "thief",
  },
  storm_sprite: {
    id: "storm_sprite",
    name: "Storm sprite",
    sprite: picnic("storm_sprite"),
    hp: 22,
    speed: 115,
    radius: 14,
    size: 48,
    contact: 8,
    score: 6,
    ai: "ranged",
  },
  sandwich_slime: {
    id: "sandwich_slime",
    name: "Sandwich slime",
    sprite: picnic("sandwich_slime"),
    hp: 34,
    speed: 72,
    radius: 18,
    size: 56,
    contact: 14,
    score: 6,
    ai: "chase",
    split: true,
  },
  rat: {
    id: "rat",
    name: "Rat",
    sprite: beast("rat"),
    hp: 10,
    speed: 100,
    radius: 12,
    size: 40,
    contact: 6,
    score: 1,
    ai: "swarm",
  },
  giant_mite: {
    id: "giant_mite",
    name: "Giant mite",
    sprite: beast("giant_mite"),
    hp: 12,
    speed: 155,
    radius: 12,
    size: 40,
    contact: 8,
    score: 2,
    ai: "swarm",
  },
  boring_beetle: {
    id: "boring_beetle",
    name: "Beetle",
    sprite: beast("boring_beetle"),
    hp: 18,
    speed: 85,
    radius: 14,
    size: 44,
    contact: 10,
    score: 2,
    ai: "wander",
  },
  acid_blob: {
    id: "acid_blob",
    name: "Acid blob",
    sprite: beast("acid_blob"),
    hp: 28,
    speed: 48,
    radius: 16,
    size: 48,
    contact: 16,
    score: 4,
    ai: "puddle",
  },
  ooze: {
    id: "ooze",
    name: "Ooze",
    sprite: beast("ooze"),
    hp: 32,
    speed: 44,
    radius: 16,
    size: 48,
    contact: 16,
    score: 4,
    ai: "puddle",
  },
  pulsating_lump: {
    id: "pulsating_lump",
    name: "Pulsating lump",
    sprite: beast("pulsating_lump"),
    hp: 36,
    speed: 40,
    radius: 17,
    size: 50,
    contact: 18,
    score: 5,
    ai: "puddle",
  },
  orc_warrior: {
    id: "orc_warrior",
    name: "Orc warrior",
    sprite: beast("orc_warrior"),
    hp: 34,
    speed: 95,
    radius: 16,
    size: 52,
    contact: 14,
    score: 5,
    ai: "chase",
  },
  hobgoblin: {
    id: "hobgoblin",
    name: "Hobgoblin",
    sprite: beast("hobgoblin"),
    hp: 30,
    speed: 100,
    radius: 15,
    size: 50,
    contact: 13,
    score: 4,
    ai: "chase",
  },
  hill_giant: {
    id: "hill_giant",
    name: "Hill giant",
    sprite: beast("hill_giant"),
    hp: 80,
    speed: 55,
    radius: 24,
    size: 72,
    contact: 22,
    score: 12,
    ai: "chase",
    boss: true,
  },
  harpy: {
    id: "harpy",
    name: "Harpy",
    sprite: beast("harpy"),
    hp: 22,
    speed: 175,
    radius: 14,
    size: 48,
    contact: 11,
    score: 5,
    ai: "swoop",
  },
  griffon: {
    id: "griffon",
    name: "Griffon",
    sprite: beast("griffon"),
    hp: 40,
    speed: 160,
    radius: 18,
    size: 58,
    contact: 16,
    score: 8,
    ai: "swoop",
  },
  demonspawn: {
    id: "demonspawn",
    name: "Demonspawn",
    sprite: beast("demonspawn"),
    hp: 48,
    speed: 88,
    radius: 17,
    size: 54,
    contact: 16,
    score: 8,
    ai: "chase",
  },
  hell_knight: {
    id: "hell_knight",
    name: "Hell knight",
    sprite: beast("hell_knight"),
    hp: 85,
    speed: 72,
    radius: 20,
    size: 64,
    contact: 20,
    score: 14,
    ai: "charge",
    boss: true,
  },
  guardian_serpent: {
    id: "guardian_serpent",
    name: "Guardian serpent",
    sprite: beast("guardian_serpent"),
    hp: 36,
    speed: 125,
    radius: 16,
    size: 54,
    contact: 14,
    score: 6,
    ai: "zigzag",
  },
  hydra: {
    id: "hydra",
    name: "Hydra",
    sprite: beast("hydra"),
    hp: 130,
    speed: 62,
    radius: 24,
    size: 76,
    contact: 20,
    score: 20,
    ai: "chase",
    boss: true,
  },
  dragon: {
    id: "dragon",
    name: "Dragon",
    sprite: beast("dragon"),
    hp: 150,
    speed: 78,
    radius: 24,
    size: 80,
    contact: 22,
    score: 24,
    ai: "swoop",
    boss: true,
  },
  golden_dragon: {
    id: "golden_dragon",
    name: "Golden dragon",
    sprite: beast("golden_dragon"),
    hp: 210,
    speed: 86,
    radius: 26,
    size: 88,
    contact: 24,
    score: 36,
    ai: "swoop",
    boss: true,
  },
};

export function waveScale(wave: number): number {
  return 1 + (wave - 1) * 0.06;
}

export function scaledHp(spec: EnemySpec, wave: number): number {
  return Math.round(spec.hp * waveScale(wave));
}

export function scaledSpeed(spec: EnemySpec, wave: number): number {
  return spec.speed * (1 + (wave - 1) * 0.03);
}
