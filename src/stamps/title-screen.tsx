import { create } from "svenjs";
import { playSfx, setScene, unlockAudio } from "../game/audio";
import { MuteButton } from "./mute-button";
import { SiteFooter } from "./svenjs-stamp";

type Props = {
  onStart: () => void;
  highScore: number;
};

export const TitleScreen = create<Props, Record<string, never>>({
  initialState: {},
  onMount() {
    this._abort = new AbortController();
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        void this.begin();
      }
    };
    window.addEventListener("keydown", onKey, { signal: this._abort.signal });
  },
  async begin() {
    await unlockAudio();
    setScene("game");
    playSfx("ui");
    this.props.onStart();
  },
  onDestroy() {
    (this._abort as AbortController | undefined)?.abort();
  },
  render() {
    const { highScore } = this.props;
    return (
      <div className="page title-page">
        <div className="title-card">
          <div className="title-art" role="img" aria-label="A picnic blanket on the grass" />
          <div className="title-copy">
            <p className="eyebrow">You're a wizard. You're on a picnic.</p>
            <h1>
              A Wizard's <em>Picnic</em>
            </h1>
            <p className="noise">You hear a noise...</p>
            <ul className="controls">
              <li>
                <kbd>WASD</kbd> move
              </li>
              <li>
                <kbd>Arrows</kbd> shoot
              </li>
              <li>
                <kbd>Space</kbd> / click fire
              </li>
              <li>
                <kbd>Esc</kbd> pause
              </li>
            </ul>
            {highScore > 0 ? <p className="best">Best picnic: {highScore}</p> : null}
            <div className="title-actions">
              <button type="button" className="start" onClick={() => this.begin()}>
                Pack the basket
              </button>
              <MuteButton />
            </div>
            <p className="sound-hint">Comic toots and a picnic waltz · M mutes</p>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  },
});
