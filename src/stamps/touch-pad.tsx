import { create } from "svenjs";
import type { Input } from "../game/input";

type Props = {
  input: Input | null;
};

export const TouchPad = create<Props, Record<string, never>>({
  initialState: {},
  nudge(x: number, y: number, e?: PointerEvent) {
    e?.preventDefault();
    this.props.input?.setTouchMove(x, y);
  },
  render() {
    return (
      <div className="touch">
        <div className="dpad" aria-hidden="true">
          <button
            type="button"
            className="pad n"
            onPointerDown={(e: PointerEvent) => this.nudge(0, -1, e)}
            onPointerUp={() => this.nudge(0, 0)}
            onPointerLeave={() => this.nudge(0, 0)}
          >
            ▲
          </button>
          <button
            type="button"
            className="pad w"
            onPointerDown={(e: PointerEvent) => this.nudge(-1, 0, e)}
            onPointerUp={() => this.nudge(0, 0)}
            onPointerLeave={() => this.nudge(0, 0)}
          >
            ◀
          </button>
          <button
            type="button"
            className="pad e"
            onPointerDown={(e: PointerEvent) => this.nudge(1, 0, e)}
            onPointerUp={() => this.nudge(0, 0)}
            onPointerLeave={() => this.nudge(0, 0)}
          >
            ▶
          </button>
          <button
            type="button"
            className="pad s"
            onPointerDown={(e: PointerEvent) => this.nudge(0, 1, e)}
            onPointerUp={() => this.nudge(0, 0)}
            onPointerLeave={() => this.nudge(0, 0)}
          >
            ▼
          </button>
        </div>
        <button
          type="button"
          className="fire"
          onPointerDown={(e: PointerEvent) => {
            e.preventDefault();
            this.props.input?.setTouchFire(true);
          }}
          onPointerUp={() => this.props.input?.setTouchFire(false)}
          onPointerLeave={() => this.props.input?.setTouchFire(false)}
        >
          Fire
        </button>
      </div>
    );
  },
});
