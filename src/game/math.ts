export type Vec = { x: number; y: number };

export function add(a: Vec, b: Vec): Vec {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a: Vec, b: Vec): Vec {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scale(a: Vec, s: number): Vec {
  return { x: a.x * s, y: a.y * s };
}

export function len(a: Vec): number {
  return Math.hypot(a.x, a.y);
}

export function norm(a: Vec): Vec {
  const l = len(a);
  if (l < 1e-6) return { x: 0, y: 0 };
  return { x: a.x / l, y: a.y / l };
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

export function rand(): number {
  return Math.random();
}

export function randRange(lo: number, hi: number): number {
  return lo + rand() * (hi - lo);
}

export function pick<T>(items: readonly T[]): T {
  return items[Math.floor(rand() * items.length)]!;
}

export function angleOf(v: Vec): number {
  return Math.atan2(v.y, v.x);
}
