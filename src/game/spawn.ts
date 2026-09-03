import { CATALOG, type EnemyId } from "./catalog";
import { FINAL_WAVE } from "./constants";

export type WavePlan = {
  wave: number;
  ids: EnemyId[];
  interval: number;
  banner: string;
};

function many(id: EnemyId, n: number): EnemyId[] {
  return Array.from({ length: n }, () => id);
}

const TABLES: Record<number, EnemyId[]> = {
  1: [...many("ant_column", 4), ...many("rat", 2)],
  2: [...many("ant_column", 5), ...many("giant_mite", 3), ...many("boring_beetle", 2)],
  3: [...many("wasp", 4), ...many("ooze", 2), ...many("ant_column", 4)],
  4: [...many("hobgoblin", 4), ...many("orc_warrior", 3), ...many("rat", 3)],
  5: ["hill_giant", ...many("hobgoblin", 4), ...many("boring_beetle", 3)],
  6: [...many("raven", 4), ...many("harpy", 3), ...many("wasp", 2)],
  7: [...many("sandwich_slime", 3), ...many("acid_blob", 3), ...many("ooze", 2)],
  8: [...many("goblin_thief", 3), ...many("guardian_serpent", 3), ...many("ant_column", 4)],
  9: [...many("storm_sprite", 3), ...many("demonspawn", 2), ...many("wasp", 3)],
  10: ["dragon", ...many("harpy", 3), ...many("raven", 3)],
  11: [...many("basket_mimic", 2), "bear", ...many("goblin_thief", 3)],
  12: ["hell_knight", ...many("pulsating_lump", 3), ...many("storm_sprite", 2)],
  13: [
    "bear",
    ...many("sandwich_slime", 2),
    ...many("raven", 2),
    ...many("goblin_thief", 2),
    ...many("wasp", 2),
    "griffon",
  ],
  14: ["golden_dragon", ...many("storm_sprite", 4), ...many("raven", 4), "hydra"],
};

export function wavePlan(wave: number): WavePlan {
  const ids = TABLES[wave] ?? TABLES[FINAL_WAVE]!;
  const boss = ids.find((id) => CATALOG[id].boss);
  const banner = boss ? `Wave ${wave} — ${CATALOG[boss].name}` : `Wave ${wave}`;
  const interval = wave <= 3 ? 0.45 : wave >= 12 ? 0.7 : 0.55;
  return { wave, ids: [...ids], interval, banner };
}

export function canSplit(id: EnemyId, generation: number): boolean {
  return Boolean(CATALOG[id].split) && generation === 0;
}
