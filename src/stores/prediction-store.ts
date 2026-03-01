import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useGameStore } from "./game-store";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

interface PredictionState {
  totalPredictions: number;
  correctPredictions: number;
  currentStreak: number;
  bestStreak: number;
  dailyPlayed: number;
  lastPlayDate: string;

  /** Record a prediction result. Returns XP earned. */
  recordPrediction: (correct: boolean) => number;
  /** Get overall accuracy percentage */
  getAccuracy: () => number;
}

export const usePredictionStore = create<PredictionState>()(
  persist(
    (set, get) => ({
      totalPredictions: 0,
      correctPredictions: 0,
      currentStreak: 0,
      bestStreak: 0,
      dailyPlayed: 0,
      lastPlayDate: "",

      recordPrediction: (correct) => {
        const state = get();
        const today = todayStr();
        const isNewDay = state.lastPlayDate !== today;

        let xp = 0;
        let newStreak = state.currentStreak;
        let newBest = state.bestStreak;

        if (correct) {
          xp = 10;
          newStreak = state.currentStreak + 1;
          if (newStreak > newBest) newBest = newStreak;

          // Streak bonuses
          if (newStreak === 5) xp += 50;
          if (newStreak === 10) xp += 150;
          if (newStreak > 0 && newStreak % 5 === 0 && newStreak > 10) xp += 75;
        } else {
          newStreak = 0;
        }

        set({
          totalPredictions: state.totalPredictions + 1,
          correctPredictions: state.correctPredictions + (correct ? 1 : 0),
          currentStreak: newStreak,
          bestStreak: newBest,
          dailyPlayed: isNewDay ? 1 : state.dailyPlayed + 1,
          lastPlayDate: today,
        });

        const gameStore = useGameStore.getState();
        if (xp > 0) {
          gameStore.awardXP(xp);
        }

        // Check prediction achievements
        if (correct) {
          const existingIds = new Set(gameStore.achievements.map((a) => a.id));

          if (newStreak >= 5 && !existingIds.has("prediction_streak_5")) {
            const pending = {
              id: "prediction_streak_5",
              name: "Crystal Ball",
              description: "Predict 5 candles correctly in a row",
              icon: "Eye",
              unlockedAt: Date.now(),
            };
            useGameStore.setState((s) => ({
              achievements: [...s.achievements, pending],
              pendingAchievements: [...s.pendingAchievements, pending],
            }));
          }

          if (newStreak >= 10 && !existingIds.has("prediction_streak_10")) {
            const pending = {
              id: "prediction_streak_10",
              name: "Market Oracle",
              description: "Predict 10 candles correctly in a row",
              icon: "Sparkles",
              unlockedAt: Date.now(),
            };
            useGameStore.setState((s) => ({
              achievements: [...s.achievements, pending],
              pendingAchievements: [...s.pendingAchievements, pending],
            }));
          }
        }

        return xp;
      },

      getAccuracy: () => {
        const { totalPredictions, correctPredictions } = get();
        return totalPredictions > 0
          ? Math.round((correctPredictions / totalPredictions) * 100)
          : 0;
      },
    }),
    {
      name: "alpha-deck-prediction",
      partialize: (state) => ({
        totalPredictions: state.totalPredictions,
        correctPredictions: state.correctPredictions,
        currentStreak: state.currentStreak,
        bestStreak: state.bestStreak,
        dailyPlayed: state.dailyPlayed,
        lastPlayDate: state.lastPlayDate,
      }),
    },
  ),
);
