import { create } from "svenjs";
import { playSfx, setPaused, setScene, unlockAudio } from "../game/audio";
import { WIZARD_SKINS } from "../game/constants";
import { allSpriteUrls, drawWorld, fitCanvas, preload } from "../game/draw";
import { hudStore, resetHud, syncHud } from "../game/hud-store";
import { Input } from "../game/input";
import { startLoop } from "../game/loop";
import type { World } from "../game/types";
import { createWorld, stepWorld, togglePause } from "../game/world";
import { Hud } from "./hud";
import { SiteFooter } from "./svenjs-stamp";
import { TouchPad } from "./touch-pad";

type Props = {
  onExit: () => void;
  onHighScore: (score: number) => void;
};

type State = { ready: boolean };

export const GameScreen = create<Props, State>({
  initialState: { ready: false },
  onMount() {
    this.observe(hudStore);
    void unlockAudio();
    setScene("game");
    const canvas = this._canvas as HTMLCanvasElement | undefined;
    if (!canvas) return;
    preload([...allSpriteUrls(), ...WIZARD_SKINS]);
    const world = createWorld();
    const input = new Input();
    this._world = world;
    this._input = input;
    input.attach(canvas);
    fitCanvas(canvas);
    this._onResize = () => fitCanvas(canvas);
    window.addEventListener("resize", this._onResize);
    this._stop = startLoop({
      update: (dt) => {
        const w = this._world as World;
        const before = w.status;
        stepWorld(w, this._input as Input, dt);
        for (const ev of w.events) {
          playSfx(ev);
          if (ev === "pause" || ev === "lose") setPaused(true);
          if (ev === "resume" || ev === "win") setPaused(false);
        }
        w.events.length = 0;
        if (before === "playing" && (w.status === "lost" || w.status === "won")) {
          this.props.onHighScore(w.score);
        }
        syncHud(w, dt, w.status !== before);
      },
      draw: () => {
        const el = this._canvas as HTMLCanvasElement | undefined;
        if (el) drawWorld(el, this._world as World);
      },
    });
    syncHud(world, 0, true);
    this.setState({ ready: true });
  },
  onDestroy() {
    (this._stop as (() => void) | undefined)?.();
    (this._input as Input | undefined)?.detach();
    if (this._onResize) window.removeEventListener("resize", this._onResize);
    resetHud();
    setScene("title");
    setPaused(false);
  },
  restart() {
    this._world = createWorld();
    syncHud(this._world as World, 0, true);
  },
  resume() {
    togglePause(this._world as World);
    syncHud(this._world as World, 0, true);
  },
  render() {
    const hud = hudStore.get();
    return (
      <div className="page play">
        <Hud />
        <div className="stage">
          <canvas
            className="board"
            width="720"
            height="720"
            ref={(el: HTMLCanvasElement | null) => {
              this._canvas = el;
            }}
          >
            Sorry, your browser doesn't support canvas.
          </canvas>
          {hud.banner && hud.status === "playing" ? (
            <p className="banner">{hud.banner}</p>
          ) : null}
          {hud.status === "paused" ? (
            <div className="overlay">
              <h2>Paused</h2>
              <p>The ants are waiting.</p>
              <div className="overlay-actions">
                <button type="button" onClick={() => this.resume()}>
                  Resume
                </button>
                <button type="button" className="ghost" onClick={() => this.props.onExit()}>
                  Title
                </button>
              </div>
            </div>
          ) : null}
          {hud.status === "lost" || hud.status === "won" ? (
            <div className="overlay">
              <h2>{hud.status === "won" ? "Picnic saved" : "Game over"}</h2>
              <p>
                {hud.status === "won"
                  ? "You can finally enjoy your picnic!"
                  : "The picnic is ruined."}
              </p>
              <p className="overlay-score">
                Score {hud.score}
                {hud.highScore > 0 ? ` · best ${hud.highScore}` : ""}
              </p>
              <div className="overlay-actions">
                <button type="button" onClick={() => this.restart()}>
                  Again
                </button>
                <button type="button" className="ghost" onClick={() => this.props.onExit()}>
                  Title
                </button>
              </div>
            </div>
          ) : null}
        </div>
        {this.state.ready ? <TouchPad input={this._input as Input} /> : null}
        <p className="hint">WASD move · arrows shoot · space/click fire · Esc pause · M mute</p>
        <SiteFooter />
      </div>
    );
  },
});
