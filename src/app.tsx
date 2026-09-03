import { create } from "svenjs";
import { toggleMute, unlockAudio } from "./game/audio";
import { readHighScore, writeHighScore } from "./game/highscore";
import { GameScreen } from "./stamps/game-screen";
import { TitleScreen } from "./stamps/title-screen";

type Scene = "title" | "game";

type AppState = {
  scene: Scene;
  highScore: number;
};

export const App = create<Record<string, never>, AppState>({
  initialState() {
    return { scene: "title", highScore: readHighScore() };
  },
  onMount() {
    this._abort = new AbortController();
    window.addEventListener(
      "keydown",
      (e: KeyboardEvent) => {
        if (e.code !== "KeyM" || e.repeat) return;
        e.preventDefault();
        void unlockAudio();
        toggleMute();
      },
      { signal: (this._abort as AbortController).signal },
    );
  },
  onDestroy() {
    (this._abort as AbortController | undefined)?.abort();
  },
  go(scene: Scene) {
    this.setState((s: AppState) => ({ ...s, scene }));
  },
  setHighScore(score: number) {
    const highScore = writeHighScore(score);
    this.setState((s: AppState) => ({ ...s, highScore }));
  },
  render() {
    const { scene, highScore } = this.state;
    if (scene === "title") {
      return <TitleScreen onStart={() => this.go("game")} highScore={highScore} />;
    }
    return (
      <GameScreen
        onExit={() => this.go("title")}
        onHighScore={(n: number) => this.setHighScore(n)}
      />
    );
  },
});
