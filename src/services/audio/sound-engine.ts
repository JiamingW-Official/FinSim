import {
  playBuySound,
  playSellSound,
  playAchievementSound,
  playLevelUpSound,
  playXPSound,
  playOrderFillSound,
  playErrorSound,
  playClickSound,
  playComboSound,
  playCorrectSound,
  playWrongSound,
  playLessonCompleteSound,
  playCardFlipSound,
  playStreakSound,
  playClaimSound,
  playQuestCompleteSound,
  playArenaWinSound,
  playArenaLoseSound,
  playMatchFoundSound,
  playSeasonClaimSound,
  playMarketBellSound,
} from "./synth-sounds";

class SoundEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;

    if (!this.ctx) {
      this.ctx = new AudioContext();
    }

    // Resume if suspended (browser autoplay policy)
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    return this.ctx;
  }

  private getSettings(): { enabled: boolean; volume: number } {
    try {
      const raw = localStorage.getItem("alpha-deck-settings");
      if (raw) {
        const parsed = JSON.parse(raw);
        const state = parsed?.state ?? parsed;
        return {
          enabled: state?.soundEnabled ?? true,
          volume: state?.volume ?? 0.5,
        };
      }
    } catch {
      // ignore
    }
    return { enabled: true, volume: 0.5 };
  }

  private play(fn: (ctx: AudioContext, volume: number) => void) {
    const { enabled, volume } = this.getSettings();
    if (!enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      fn(ctx, volume);
    } catch {
      // Ignore audio errors silently
    }
  }

  playBuy() {
    this.play(playBuySound);
  }
  playSell() {
    this.play(playSellSound);
  }
  playAchievement() {
    this.play(playAchievementSound);
  }
  playLevelUp() {
    this.play(playLevelUpSound);
  }
  playXP() {
    this.play(playXPSound);
  }
  playOrderFill() {
    this.play(playOrderFillSound);
  }
  playError() {
    this.play(playErrorSound);
  }
  playClick() {
    this.play(playClickSound);
  }
  playCorrect() {
    this.play(playCorrectSound);
  }
  playWrong() {
    this.play(playWrongSound);
  }
  playLessonComplete() {
    this.play(playLessonCompleteSound);
  }
  playCombo(level: number) {
    const { enabled, volume } = this.getSettings();
    if (!enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      playComboSound(ctx, volume, level);
    } catch {
      // ignore
    }
  }
  playCardFlip() {
    this.play(playCardFlipSound);
  }
  playStreak() {
    this.play(playStreakSound);
  }
  playClaim() {
    this.play(playClaimSound);
  }
  playQuestComplete() {
    this.play(playQuestCompleteSound);
  }
  playArenaWin() {
    this.play(playArenaWinSound);
  }
  playArenaLose() {
    this.play(playArenaLoseSound);
  }
  playMatchFound() {
    this.play(playMatchFoundSound);
  }
  playSeasonClaim() {
    this.play(playSeasonClaimSound);
  }
  playMarketBell() {
    this.play(playMarketBellSound);
  }
}

export const soundEngine = new SoundEngine();
