import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SeasonProgress, SeasonXPSource } from "@/types/season";
import { SEASON_XP_SOURCES } from "@/types/season";
import { getCurrentSeason, getSeasonTier } from "@/data/seasons/current-season";
import { useGameStore } from "./game-store";

// ── Store interface ────────────────────────────────────────────

interface SeasonState {
  currentSeasonId: string;
  progress: SeasonProgress;
  lastSeasonXPGain: { source: SeasonXPSource; amount: number } | null;

  // Actions
  awardSeasonXP: (source: SeasonXPSource) => void;
  claimRewardTier: (tier: number) => void;
  checkSeasonReset: () => void;
  clearSeasonXPGain: () => void;
}

function freshProgress(seasonId: string): SeasonProgress {
  return {
    seasonId,
    seasonXP: 0,
    highestTierClaimed: 0,
    achievements: [],
    weeklyXPHistory: [],
  };
}

export const useSeasonStore = create<SeasonState>()(
  persist(
    (set, get) => ({
      currentSeasonId: "",
      progress: freshProgress(""),
      lastSeasonXPGain: null,

      awardSeasonXP: (source) => {
        const state = get();
        const season = getCurrentSeason();
        const amount = SEASON_XP_SOURCES[source];

        // If season changed, auto-reset
        if (state.currentSeasonId !== season.id) {
          set({
            currentSeasonId: season.id,
            progress: freshProgress(season.id),
          });
        }

        set((s) => ({
          progress: {
            ...s.progress,
            seasonXP: s.progress.seasonXP + amount,
          },
          lastSeasonXPGain: { source, amount },
        }));

        // Check season tier achievements
        const newXP = get().progress.seasonXP;
        const tier = getSeasonTier(newXP);
        checkSeasonAchievements(tier);
      },

      claimRewardTier: (tier) => {
        const state = get();
        if (tier <= state.progress.highestTierClaimed) return;

        const season = getCurrentSeason();
        const rewardTier = season.rewardTiers.find((t) => t.tier === tier);
        if (!rewardTier) return;

        // Check if player has enough XP
        if (state.progress.seasonXP < rewardTier.xpRequired) return;

        set((s) => ({
          progress: {
            ...s.progress,
            highestTierClaimed: tier,
          },
        }));

        // Apply reward
        if (rewardTier.reward.type === "xp") {
          useGameStore.getState().awardXP(rewardTier.reward.value as number);
        }
        // Titles and badges are purely cosmetic — no store action needed
      },

      checkSeasonReset: () => {
        const state = get();
        const season = getCurrentSeason();
        if (state.currentSeasonId !== season.id) {
          set({
            currentSeasonId: season.id,
            progress: freshProgress(season.id),
          });
        }
      },

      clearSeasonXPGain: () => {
        set({ lastSeasonXPGain: null });
      },
    }),
    {
      name: "alpha-deck-season",
      partialize: (state) => ({
        currentSeasonId: state.currentSeasonId,
        progress: state.progress,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const season = getCurrentSeason();
        if (state.currentSeasonId !== season.id) {
          useSeasonStore.setState({
            currentSeasonId: season.id,
            progress: freshProgress(season.id),
          });
        }
      },
    },
  ),
);

// ── Season achievements ────────────────────────────────────────

function checkSeasonAchievements(tier: number) {
  const gameState = useGameStore.getState();
  const existingIds = new Set(gameState.achievements.map((a) => a.id));
  const pending: Array<{ id: string; name: string; description: string; icon: string; unlockedAt: number }> = [];

  if (tier >= 10 && !existingIds.has("season_tier_10")) {
    pending.push({
      id: "season_tier_10",
      name: "Season Veteran",
      description: "Reach tier 10 in a season",
      icon: "Star",
      unlockedAt: Date.now(),
    });
  }

  if (tier >= 20 && !existingIds.has("season_tier_20")) {
    pending.push({
      id: "season_tier_20",
      name: "Season Champion",
      description: "Reach tier 20 in a season",
      icon: "Trophy",
      unlockedAt: Date.now(),
    });
  }

  if (pending.length > 0) {
    useGameStore.setState((s) => ({
      achievements: [...s.achievements, ...pending],
      pendingAchievements: [...s.pendingAchievements, ...pending],
    }));
  }
}
