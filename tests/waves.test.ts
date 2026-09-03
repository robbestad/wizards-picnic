import { describe, expect, it } from "vitest";
import { CATALOG } from "../src/game/catalog";
import { FINAL_WAVE } from "../src/game/constants";
import { canSplit, wavePlan } from "../src/game/spawn";

describe("wavePlan", () => {
  it("builds 14 unique waves with known catalog ids", () => {
    for (let wave = 1; wave <= FINAL_WAVE; wave++) {
      const plan = wavePlan(wave);
      expect(plan.ids.length).toBeGreaterThan(3);
      for (const id of plan.ids) {
        expect(CATALOG[id]).toBeTruthy();
      }
    }
  });

  it("opens with picnic ants and closes with the golden dragon", () => {
    expect(wavePlan(1).ids.filter((id) => id === "ant_column").length).toBe(4);
    expect(wavePlan(14).ids).toContain("golden_dragon");
  });

  it("spaces later waves farther apart", () => {
    expect(wavePlan(14).interval).toBeGreaterThan(wavePlan(1).interval);
  });
});

describe("canSplit", () => {
  it("splits only generation-zero sandwich slime", () => {
    expect(canSplit("sandwich_slime", 0)).toBe(true);
    expect(canSplit("sandwich_slime", 1)).toBe(false);
    expect(canSplit("rat", 0)).toBe(false);
  });
});
