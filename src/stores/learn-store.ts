import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useGameStore } from "./game-store";
import { LEARNING_ACHIEVEMENT_DEFS, calculateGrade } from "@/types/game";
import type { Achievement, LessonScoreBreakdown } from "@/types/game";

function migrateScore(v: number | LessonScoreBreakdown): LessonScoreBreakdown {
  if (typeof v === "number") {
    return {
      quizPoints: v,
      quizMaxPoints: 100,
      speedBonus: 0,
      comboBonus: 0,
      practiceBonus: 0,
      totalPoints: v,
      maxPoints: 100,
      grade: calculateGrade(v / 100),
      accuracy: v,
      bestCombo: 0,
    };
  }
  return v;
}

interface LearnState {
  completedLessons: string[];
  lessonScores: Record<string, LessonScoreBreakdown>;
  hearts: number; // 0-5
  lastHeartLoss: number; // timestamp
  learningStreak: number;
  lastLearnDate: string; // YYYY-MM-DD
  dailyLessonsCompleted: number;
  dailyGoal: number;
  currentLesson: string | null;
  currentStep: number;

  completeLesson: (lessonId: string, breakdown: LessonScoreBreakdown, xpReward: number) => void;
  loseHeart: () => void;
  setCurrentLesson: (lessonId: string | null, step?: number) => void;
  setCurrentStep: (step: number) => void;
  setDailyGoal: (goal: number) => void;
  resetLearnProgress: () => void;
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function getYesterday(): string {
  return new Date(Date.now() - 86400000).toISOString().slice(0, 10);
}

export function computeHearts(currentHearts: number, lastHeartLoss: number): number {
  if (currentHearts >= 5) return 5;
  if (lastHeartLoss === 0) return 5;
  const elapsed = Date.now() - lastHeartLoss;
  const hoursElapsed = Math.floor(elapsed / (1000 * 60 * 60));
  return Math.min(5, currentHearts + hoursElapsed);
}

export const useLearnStore = create<LearnState>()(
  persist(
    (set, get) => ({
      completedLessons: [],
      lessonScores: {},
      hearts: 5,
      lastHeartLoss: 0,
      learningStreak: 0,
      lastLearnDate: "",
      dailyLessonsCompleted: 0,
      dailyGoal: 3,
      currentLesson: null,
      currentStep: 0,

      completeLesson: (lessonId, breakdown, xpReward) => {
        const state = get();
        const today = getToday();
        const yesterday = getYesterday();

        // Update streak
        let newStreak = state.learningStreak;
        let dailyCount = state.dailyLessonsCompleted;
        if (state.lastLearnDate === today) {
          dailyCount += 1;
        } else if (state.lastLearnDate === yesterday) {
          newStreak += 1;
          dailyCount = 1;
        } else {
          newStreak = 1;
          dailyCount = 1;
        }

        // Update best score (keep highest by totalPoints)
        const prev = state.lessonScores[lessonId];
        const newScores = {
          ...state.lessonScores,
          [lessonId]: prev && prev.totalPoints >= breakdown.totalPoints ? prev : breakdown,
        };

        const newCompleted = state.completedLessons.includes(lessonId)
          ? state.completedLessons
          : [...state.completedLessons, lessonId];

        set({
          completedLessons: newCompleted,
          lessonScores: newScores,
          learningStreak: newStreak,
          lastLearnDate: today,
          dailyLessonsCompleted: dailyCount,
          currentLesson: null,
          currentStep: 0,
        });

        // Award XP via game store — grade multiplier
        const gradeMultiplier = breakdown.grade === "S" ? 1.5 : breakdown.grade === "A" ? 1.2 : 1;
        useGameStore.getState().awardXP(Math.round(xpReward * gradeMultiplier));

        // Check learning achievements
        const gameState = useGameStore.getState();
        const existingIds = new Set(gameState.achievements.map((a: Achievement) => a.id));
        const newAchievements: Achievement[] = [];

        for (const def of LEARNING_ACHIEVEMENT_DEFS) {
          if (!existingIds.has(def.id) && def.condition(newCompleted, newScores, newStreak)) {
            newAchievements.push({
              id: def.id,
              name: def.name,
              description: def.description,
              icon: def.icon,
              unlockedAt: Date.now(),
            });
          }
        }

        if (newAchievements.length > 0) {
          useGameStore.setState((gs) => ({
            achievements: [...gs.achievements, ...newAchievements],
            pendingAchievements: [...gs.pendingAchievements, ...newAchievements],
          }));
        }

        // Quest + Season hooks
        try {
          const { useQuestStore } = require("./quest-store");
          useQuestStore.getState().incrementSession("sessionLessonsCompleted");
          if (breakdown.grade === "S") useQuestStore.getState().incrementSession("sessionSRankLessons");
        } catch { /* quest store not loaded yet */ }

        try {
          const { useSeasonStore } = require("./season-store");
          useSeasonStore.getState().awardSeasonXP("lesson_completed");
          if (breakdown.grade === "S") useSeasonStore.getState().awardSeasonXP("lesson_s_rank");
        } catch { /* season store not loaded yet */ }
      },

      loseHeart: () => {
        const state = get();
        const regenHearts = computeHearts(state.hearts, state.lastHeartLoss);
        set({
          hearts: Math.max(0, regenHearts - 1),
          lastHeartLoss: Date.now(),
        });
      },

      setCurrentLesson: (lessonId, step = 0) => {
        set({ currentLesson: lessonId, currentStep: step });
      },

      setCurrentStep: (step) => {
        set({ currentStep: step });
      },

      setDailyGoal: (goal) => {
        set({ dailyGoal: goal });
      },

      resetLearnProgress: () => {
        set({
          completedLessons: [],
          lessonScores: {},
          hearts: 5,
          lastHeartLoss: 0,
          learningStreak: 0,
          lastLearnDate: "",
          dailyLessonsCompleted: 0,
          dailyGoal: 3,
          currentLesson: null,
          currentStep: 0,
        });
      },
    }),
    {
      name: "alpha-deck-learn",
      partialize: (state) => ({
        completedLessons: state.completedLessons,
        lessonScores: state.lessonScores,
        hearts: state.hearts,
        lastHeartLoss: state.lastHeartLoss,
        learningStreak: state.learningStreak,
        lastLearnDate: state.lastLearnDate,
        dailyLessonsCompleted: state.dailyLessonsCompleted,
        dailyGoal: state.dailyGoal,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Zustand v5 persist: direct mutations to `state` here do NOT
        // propagate to the store. We must call setState() explicitly.
        const updates: Record<string, unknown> = {};

        // Regenerate hearts on rehydrate
        const regenHearts = computeHearts(state.hearts, state.lastHeartLoss);
        if (regenHearts !== state.hearts) {
          updates.hearts = regenHearts;
        }
        // Reset daily count if not today
        const today = getToday();
        if (state.lastLearnDate !== today) {
          updates.dailyLessonsCompleted = 0;
        }
        // Migrate old number-based scores to LessonScoreBreakdown
        if (state.lessonScores) {
          let needsMigration = false;
          const migrated: Record<string, LessonScoreBreakdown> = {};
          for (const [id, val] of Object.entries(state.lessonScores)) {
            const m = migrateScore(val as number | LessonScoreBreakdown);
            if (m !== val) needsMigration = true;
            migrated[id] = m;
          }
          if (needsMigration) {
            updates.lessonScores = migrated;
          }
        }

        if (Object.keys(updates).length > 0) {
          useLearnStore.setState(updates);
        }
      },
    },
  ),
);
