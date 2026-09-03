import { describe, expect, it } from "vitest";
import { circlesOverlap } from "../src/game/collision";

describe("circlesOverlap", () => {
  it("detects overlapping circles", () => {
    expect(circlesOverlap({ x: 0, y: 0 }, 10, { x: 15, y: 0 }, 6)).toBe(true);
  });

  it("rejects separated circles", () => {
    expect(circlesOverlap({ x: 0, y: 0 }, 10, { x: 30, y: 0 }, 6)).toBe(false);
  });

  it("counts exact touch as a hit", () => {
    expect(circlesOverlap({ x: 0, y: 0 }, 10, { x: 20, y: 0 }, 10)).toBe(true);
  });
});
