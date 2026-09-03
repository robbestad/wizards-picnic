import { create } from "svenjs";
import { audioStore, toggleMute, unlockAudio } from "../game/audio";

export const MuteButton = create({
  onMount() {
    this.observe(audioStore);
  },
  async flip() {
    await unlockAudio();
    toggleMute();
  },
  render() {
    const muted = audioStore.get().muted;
    return (
      <button
        type="button"
        className="mute"
        aria-pressed={muted}
        aria-label={muted ? "Unmute" : "Mute"}
        title="M"
        onClick={() => this.flip()}
      >
        {muted ? "Sound off" : "Sound on"}
      </button>
    );
  },
});
