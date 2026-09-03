import { create } from "svenjs";
import { COOLDOWN } from "../game/constants";
import { hudStore } from "../game/hud-store";
import { MuteButton } from "./mute-button";

export const Hud = create({
  onMount() {
    this.observe(hudStore);
  },
  render() {
    const { score, highScore, hp, maxHp, wave, cooldown, playerName, remaining, status } =
      hudStore.get();
    const hpPct = Math.max(0, Math.round((hp / maxHp) * 100));
    const cooling = cooldown > 0.04;
    const cdPct = Math.max(0, Math.round((1 - cooldown / COOLDOWN) * 100));
    return (
      <div className="hud" aria-live="polite">
        <div className="hud-row">
          <span className="hud-name">{playerName}</span>
          <span>Wave {wave}</span>
          <span>
            Score {score}
            {highScore > score ? ` · best ${highScore}` : ""}
          </span>
          <MuteButton />
        </div>
        <div className="bar" title="Health">
          <div className="bar-fill hp" style={{ width: `${hpPct}%` }} />
          <span>
            {hp} / {maxHp}
          </span>
        </div>
        {cooling ? (
          <div className="cd-line" title="Spell">
            <span className="cd-fill" style={{ width: `${cdPct}%` }} />
          </div>
        ) : (
          <div className="cd-line cd-line-idle" />
        )}
        {status === "playing" ? (
          <p className="hud-left">{remaining} left on the lawn</p>
        ) : null}
      </div>
    );
  },
});
