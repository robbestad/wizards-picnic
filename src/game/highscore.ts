import { HIGH_SCORE_KEY } from "./constants";

export function readHighScore(): number {
  try {
    const raw = localStorage.getItem(HIGH_SCORE_KEY);
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export function writeHighScore(score: number): number {
  const next = Math.max(readHighScore(), score);
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(next));
  } catch {
    /* ignore quota / private mode */
  }
  return next;
}
