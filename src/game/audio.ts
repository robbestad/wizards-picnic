import { createStore } from "svenjs";

export type Sfx =
  | "shoot"
  | "hit"
  | "hurt"
  | "kill"
  | "wave"
  | "pause"
  | "resume"
  | "lose"
  | "win"
  | "ui";

const MUTE_KEY = "awizardspicnic.muted";

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export const audioStore = createStore<{ muted: boolean }>({
  state: { muted: readMuted() },
});

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let musicTimer = 0;
let nextBeat = 0;
let beatIndex = 0;
let scene: "title" | "game" = "title";
let running = false;

const BEAT = 60 / 132;

function midi(n: number): number {
  return 440 * 2 ** ((n - 69) / 12);
}

function ensure(): AudioContext | null {
  if (typeof window === "undefined" || !window.AudioContext) return null;
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    musicGain = ctx.createGain();
    sfxGain = ctx.createGain();
    master.gain.value = audioStore.get().muted ? 0 : 1;
    musicGain.gain.value = 0.07;
    sfxGain.gain.value = 0.22;
    musicGain.connect(master);
    sfxGain.connect(master);
    master.connect(ctx.destination);
  }
  return ctx;
}

export async function unlockAudio(): Promise<void> {
  const ac = ensure();
  if (!ac) return;
  if (ac.state === "suspended") await ac.resume();
  if (!running) startClock();
}

function env(
  ac: AudioContext,
  dest: AudioNode,
  start: number,
  dur: number,
  peak: number,
): GainNode {
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(peak, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  g.connect(dest);
  return g;
}

function tone(
  ac: AudioContext,
  dest: AudioNode,
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType,
  peak: number,
  slide?: number,
): void {
  const o = ac.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, start + dur);
  const g = env(ac, dest, start, dur, peak);
  o.connect(g);
  o.start(start);
  o.stop(start + dur + 0.03);
  o.onended = () => {
    o.disconnect();
    g.disconnect();
  };
}

function noise(ac: AudioContext, dest: AudioNode, start: number, dur: number, peak: number): void {
  const n = Math.ceil(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, n, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const g = env(ac, dest, start, dur, peak);
  src.connect(g);
  src.start(start);
  src.stop(start + dur + 0.02);
  src.onended = () => {
    src.disconnect();
    g.disconnect();
  };
}

export function playSfx(kind: Sfx): void {
  const ac = ensure();
  if (!ac || !sfxGain || audioStore.get().muted) return;
  if (ac.state === "suspended") void ac.resume();
  const t = ac.currentTime + 0.01;
  const out = sfxGain;
  switch (kind) {
    case "shoot":
      tone(ac, out, 880, t, 0.07, "square", 0.12, 1480);
      break;
    case "hit":
      tone(ac, out, 1480, t, 0.05, "triangle", 0.1);
      noise(ac, out, t, 0.04, 0.08);
      break;
    case "kill":
      tone(ac, out, 523, t, 0.08, "square", 0.14);
      tone(ac, out, 784, t + 0.07, 0.16, "square", 0.12, 392);
      break;
    case "hurt":
      tone(ac, out, 196, t, 0.2, "sawtooth", 0.16, 90);
      noise(ac, out, t, 0.08, 0.06);
      break;
    case "wave":
      tone(ac, out, 784, t, 0.12, "triangle", 0.12);
      tone(ac, out, 1046, t + 0.1, 0.16, "triangle", 0.1);
      break;
    case "pause":
      tone(ac, out, 330, t, 0.08, "sine", 0.08);
      break;
    case "resume":
      tone(ac, out, 523, t, 0.07, "sine", 0.08);
      break;
    case "lose":
      tone(ac, out, 392, t, 0.16, "square", 0.14);
      tone(ac, out, 311, t + 0.16, 0.18, "square", 0.12);
      tone(ac, out, 196, t + 0.34, 0.35, "square", 0.12, 110);
      break;
    case "win":
      tone(ac, out, 523, t, 0.12, "triangle", 0.14);
      tone(ac, out, 659, t + 0.12, 0.12, "triangle", 0.14);
      tone(ac, out, 784, t + 0.24, 0.12, "triangle", 0.14);
      tone(ac, out, 1046, t + 0.36, 0.28, "triangle", 0.16);
      break;
    case "ui":
      tone(ac, out, 1200, t, 0.04, "sine", 0.06);
      break;
  }
}

const LEAD: Array<[number, number]> = [
  [67, 1], [71, 1], [74, 1],
  [72, 1], [69, 1], [67, 1],
  [71, 2], [67, 1],
  [62, 3],
  [67, 1], [69, 1], [71, 1],
  [72, 1], [74, 1], [76, 1],
  [74, 2], [71, 1],
  [67, 3],
];

const BASS = [43, 43, 43, 38, 38, 38, 43, 43, 43, 38, 38, 38, 41, 41, 41, 38, 38, 38, 43, 43, 43, 36, 36, 36];

function scheduleBeat(ac: AudioContext, dest: GainNode, step: number, time: number): void {
  const quiet = scene === "title" ? 0.55 : 1;
  const bass = BASS[step % BASS.length]!;
  tone(ac, dest, midi(bass), time, BEAT * 0.9, "triangle", 0.09 * quiet);

  let cursor = 0;
  const total = LEAD.reduce((s, n) => s + n[1], 0);
  const pos = step % total;
  for (const [note, len] of LEAD) {
    if (pos === cursor) {
      tone(ac, dest, midi(note), time, BEAT * len * 0.92, "square", 0.045 * quiet);
      break;
    }
    cursor += len;
  }

  if (step % 3 === 2) noise(ac, dest, time, 0.04, 0.03 * quiet);
}

function startClock(): void {
  const ac = ensure();
  if (!ac || running) return;
  running = true;
  nextBeat = ac.currentTime + 0.05;
  beatIndex = 0;
  const tick = () => {
    if (!running || !ctx || !musicGain) return;
    if (ctx.state === "running" && !audioStore.get().muted) {
      while (nextBeat < ctx.currentTime + 0.18) {
        scheduleBeat(ctx, musicGain, beatIndex, nextBeat);
        beatIndex += 1;
        nextBeat += BEAT;
      }
    } else {
      nextBeat = Math.max(nextBeat, ctx.currentTime + 0.05);
    }
    if (musicTimer) window.clearTimeout(musicTimer);
    musicTimer = window.setTimeout(tick, 40);
  };
  tick();
}

export function setScene(next: "title" | "game"): void {
  scene = next;
  const ac = ctx;
  if (!ac || !musicGain) return;
  const target = next === "title" ? 0.045 : 0.08;
  musicGain.gain.cancelScheduledValues(ac.currentTime);
  musicGain.gain.linearRampToValueAtTime(target, ac.currentTime + 0.2);
}

export function setPaused(paused: boolean): void {
  const ac = ctx;
  if (!ac || !musicGain) return;
  const base = scene === "title" ? 0.045 : 0.08;
  musicGain.gain.cancelScheduledValues(ac.currentTime);
  musicGain.gain.linearRampToValueAtTime(paused ? 0.015 : base, ac.currentTime + 0.12);
}

export function setMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    /* ignore */
  }
  audioStore.set({ muted });
  const ac = ensure();
  if (!ac || !master) return;
  master.gain.cancelScheduledValues(ac.currentTime);
  master.gain.linearRampToValueAtTime(muted ? 0 : 1, ac.currentTime + 0.05);
  if (!muted) void ac.resume();
}

export function toggleMute(): void {
  setMuted(!audioStore.get().muted);
}

export function isMuted(): boolean {
  return audioStore.get().muted;
}
