const STEP = 1 / 60;
const MAX_FRAME = 0.25;

export function startLoop(handlers: {
  update: (dt: number) => void;
  draw: () => void;
}): () => void {
  let last = performance.now();
  let acc = 0;
  let id = 0;
  let stopped = false;

  const frame = (now: number) => {
    if (stopped) return;
    let dt = (now - last) / 1000;
    last = now;
    if (dt > MAX_FRAME) dt = MAX_FRAME;
    acc += dt;
    let steps = 0;
    while (acc >= STEP && steps < 8) {
      handlers.update(STEP);
      acc -= STEP;
      steps += 1;
    }
    handlers.draw();
    id = requestAnimationFrame(frame);
  };

  id = requestAnimationFrame(frame);
  return () => {
    stopped = true;
    cancelAnimationFrame(id);
  };
}
