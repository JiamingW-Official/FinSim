import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type TradingStyle = "day" | "swing" | "options" | "longterm";

interface OnboardingState {
  // Modal flow state
  completed: boolean;
  skipped: boolean;
  currentStep: number; // 0-4

  // Personalization choices
  experienceLevel: ExperienceLevel | null;
  tradingStyle: TradingStyle | null;
  goals: string[];

  // Legacy field kept for backward-compat with layout.tsx
  hasCompletedOnboarding: boolean;

  // Actions
  complete: () => void;
  skip: () => void;
  nextStep: () => void;
  prevStep: () => void;
  setExperienceLevel: (level: ExperienceLevel) => void;
  setTradingStyle: (style: TradingStyle) => void;
  toggleGoal: (goal: string) => void;
  reset: () => void;

  // Legacy actions
  completeOnboarding: () => void;
  setStep: (step: number) => void;
  nextModalStep: () => void;
  prevModalStep: () => void;
  resetModal: () => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      completed: false,
      skipped: false,
      currentStep: 0,
      experienceLevel: null,
      tradingStyle: null,
      goals: [],
      hasCompletedOnboarding: false,

      complete: () =>
        set({ completed: true, skipped: false, hasCompletedOnboarding: true }),
      skip: () =>
        set({ skipped: true, hasCompletedOnboarding: true }),
      nextStep: () =>
        set((s) => ({ currentStep: Math.min(4, s.currentStep + 1) })),
      prevStep: () =>
        set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
      setExperienceLevel: (level) => set({ experienceLevel: level }),
      setTradingStyle: (style) => set({ tradingStyle: style }),
      toggleGoal: (goal) =>
        set((s) => ({
          goals: s.goals.includes(goal)
            ? s.goals.filter((g) => g !== goal)
            : [...s.goals, goal],
        })),
      reset: () =>
        set({
          completed: false,
          skipped: false,
          currentStep: 0,
          experienceLevel: null,
          tradingStyle: null,
          goals: [],
          hasCompletedOnboarding: false,
        }),

      // Legacy aliases
      completeOnboarding: () =>
        set({ completed: true, hasCompletedOnboarding: true }),
      setStep: (step) => set({ currentStep: step }),
      nextModalStep: () =>
        set((s) => ({ currentStep: Math.min(4, s.currentStep + 1) })),
      prevModalStep: () =>
        set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
      resetModal: () =>
        set({ completed: false, skipped: false, currentStep: 0 }),
      resetOnboarding: () =>
        set({ hasCompletedOnboarding: false, currentStep: 0 }),
    }),
    { name: "finsim-onboarding-v2" }
  )
);
