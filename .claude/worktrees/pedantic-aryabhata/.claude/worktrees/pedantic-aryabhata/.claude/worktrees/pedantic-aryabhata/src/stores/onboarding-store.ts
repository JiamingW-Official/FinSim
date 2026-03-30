import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OnboardingState {
  _hasHydrated: boolean;
  hasCompletedOnboarding: boolean;
  currentStep: number;
  completeOnboarding: () => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      _hasHydrated: false,
      hasCompletedOnboarding: false,
      currentStep: 0,
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      setStep: (step: number) => set({ currentStep: step }),
      nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
      resetOnboarding: () =>
        set({ hasCompletedOnboarding: false, currentStep: 0 }),
    }),
    {
      name: "alpha-deck-onboarding",
      onRehydrateStorage: () => () => {
        useOnboardingStore.setState({ _hasHydrated: true });
      },
    }
  )
);
