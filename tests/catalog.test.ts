import { describe, expect, it } from "vitest";
import { CATALOG, scaledHp, type EnemyId } from "../src/game/catalog";

const PICNIC: EnemyId[] = [
  "ant_column",
  "wasp",
  "basket_mimic",
  "raven",
  "bear",
  "goblin_thief",
  "storm_sprite",
  "sandwich_slime",
];

describe("catalog", () => {
  it("gives every picnic crasher a unique sprite and AI", () => {
    const ais = new Set(PICNIC.map((id) => CATALOG[id].ai));
    const sprites = new Set(PICNIC.map((id) => CATALOG[id].sprite));
    expect(ais.size).toBeGreaterThanOrEqual(6);
    expect(sprites.size).toBe(PICNIC.length);
  });

  it("scales hit points gently with wave", () => {
    expect(scaledHp(CATALOG.rat, 1)).toBe(CATALOG.rat.hp);
    expect(scaledHp(CATALOG.rat, 10)).toBeGreaterThan(CATALOG.rat.hp);
    expect(scaledHp(CATALOG.rat, 10)).toBeLessThan(CATALOG.rat.hp * 2);
  });
});
