import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { NotificationType } from "./notification-store";

export type Difficulty = "easy" | "normal" | "hard";

interface PreferencesState {
  difficulty: Difficulty;
  colorblindMode: boolean;
  notificationPreferences: Record<NotificationType, boolean>;

  setDifficulty: (d: Difficulty) => void;
  setColorblindMode: (enabled: boolean) => void;
  setNotificationPreference: (type: NotificationType, enabled: boolean) => void;
  getVolatilityMultiplier: () => number;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      difficulty: "normal",
      colorblindMode: false,
      notificationPreferences: {
        achievement: true,
        level_up: true,
        trade: true,
        quest: true,
        arena: true,
        challenge: true,
        xp: true,
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
    }),
    { name: "alpha-deck-preferences" },
  ),
);
