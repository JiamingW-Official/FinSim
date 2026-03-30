import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  soundEnabled: boolean;
  volume: number;
  tutorialCompleted: boolean;
  tutorialStep: number | null;

  toggleSound: () => void;
  setVolume: (v: number) => void;
  setTutorialCompleted: (v: boolean) => void;
  setTutorialStep: (step: number | null) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      volume: 0.5,
      tutorialCompleted: false,
      tutorialStep: null,

      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      setVolume: (v) => set({ volume: v }),
      setTutorialCompleted: (v) => set({ tutorialCompleted: v }),
      setTutorialStep: (step) => set({ tutorialStep: step }),
    }),
    {
      name: "alpha-deck-settings",
    },
  ),
);
