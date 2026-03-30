import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { NotificationType } from "./notification-store";

export type Difficulty = "easy" | "normal" | "hard";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type TradingStyle =
  | "day_trader"
  | "swing_trader"
  | "options_trader"
  | "long_term_investor";
export type LearningGoal =
  | "technical_analysis"
  | "options_practice"
  | "risk_management"
  | "leaderboard";

interface PreferencesState {
  difficulty: Difficulty;
  colorblindMode: boolean;
  notificationPreferences: Record<NotificationType, boolean>;

  // Onboarding selections
  experienceLevel: ExperienceLevel | null;
  tradingStyle: TradingStyle | null;
  learningGoals: LearningGoal[];

  setDifficulty: (d: Difficulty) => void;
  setColorblindMode: (enabled: boolean) => void;
  setNotificationPreference: (type: NotificationType, enabled: boolean) => void;
  getVolatilityMultiplier: () => number;

  // Onboarding setters
  setExperienceLevel: (level: ExperienceLevel) => void;
  setTradingStyle: (style: TradingStyle) => void;
  toggleLearningGoal: (goal: LearningGoal) => void;
  setLearningGoals: (goals: LearningGoal[]) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      difficulty: "normal",
      colorblindMode: false,
      experienceLevel: null,
      tradingStyle: null,
      learningGoals: [],
      notificationPreferences: {
        achievement: true,
        level_up: true,
        trade: true,
        quest: true,
        arena: true,
        challenge: true,
        xp: true,
        signal: true,
        system: true,
        alert: true,
      },

      setDifficulty: (d) => set({ difficulty: d }),
      setColorblindMode: (enabled) => set({ colorblindMode: enabled }),
      setNotificationPreference: (type, enabled) =>
        set((s) => ({
          notificationPreferences: {
            ...s.notificationPreferences,
            [type]: enabled,
          },
        })),
      getVolatilityMultiplier: () => {
        const d = get().difficulty;
        return d === "easy" ? 0.6 : d === "hard" ? 1.5 : 1.0;
      },

      setExperienceLevel: (level) => set({ experienceLevel: level }),
      setTradingStyle: (style) => set({ tradingStyle: style }),
      toggleLearningGoal: (goal) =>
        set((s) => ({
          learningGoals: s.learningGoals.includes(goal)
            ? s.learningGoals.filter((g) => g !== goal)
            : [...s.learningGoals, goal],
        })),
      setLearningGoals: (goals) => set({ learningGoals: goals }),
    }),
    { name: "alpha-deck-preferences" },
  ),
);
