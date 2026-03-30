"use client";

import { useCallback, useEffect, useState } from "react";
import { useSettingsStore } from "@/stores/settings-store";
import { useOnboardingStore } from "@/stores/onboarding-store";

export interface TutorialStepDef {
  target: string; // data-tutorial attribute value
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
}

export const TUTORIAL_STEPS: TutorialStepDef[] = [
  {
    target: "welcome",
    title: "Welcome to Alpha Deck!",
    description: "A stock trading simulator where you can practice without risking real money. Let's take a quick tour!",
  },
  {
    target: "watchlist",
    title: "Watchlist",
    description: "Browse and select stocks to trade. Click any stock to view its chart.",
    position: "right",
  },
  {
    target: "chart",
    title: "Price Chart",
    description: "Real candlestick chart with historical data. Zoom, scroll, and analyze price action.",
  },
  {
    target: "indicators",
    title: "Technical Indicators",
    description: "Add indicators like SMA, RSI, MACD, and Bollinger Bands to analyze trends.",
  },
  {
    target: "time-travel",
    title: "Time Travel",
    description: "Control time! Play, pause, or step through market days. Adjust speed to fast-forward.",
  },
  {
    target: "order-entry",
    title: "Order Entry",
    description: "Place market, limit, stop-loss, or take-profit orders. Start with a market buy!",
    position: "left",
  },
  {
    target: "positions",
    title: "Positions & Orders",
    description: "Track your open positions, pending orders, and trade history here.",
  },
  {
    target: "portfolio",
    title: "Portfolio Value",
    description: "Watch your portfolio grow (or shrink). Your goal: beat the market!",
  },
  {
    target: "xp-level",
    title: "XP & Levels",
    description: "Earn XP for every trade. Level up, unlock titles, and earn achievements!",
  },
  {
    target: "complete",
    title: "You're Ready!",
    description: "Start trading and have fun! Tip: Try adding MACD or RSI indicators for better analysis.",
  },
];

export function useTutorial() {
  const tutorialCompleted = useSettingsStore((s) => s.tutorialCompleted);
  const tutorialStep = useSettingsStore((s) => s.tutorialStep);
  const setTutorialStep = useSettingsStore((s) => s.setTutorialStep);
  const setTutorialCompleted = useSettingsStore((s) => s.setTutorialCompleted);
  const hasCompletedOnboarding = useOnboardingStore((s) => s.hasCompletedOnboarding);
  const onboardingHydrated = useOnboardingStore((s) => s._hasHydrated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-start tutorial on first visit — only after onboarding is done
  // Wait for onboarding store hydration to avoid flash of tutorial before
  // persisted state loads
  useEffect(() => {
    if (mounted && onboardingHydrated && hasCompletedOnboarding && !tutorialCompleted && tutorialStep === null) {
      setTutorialStep(0);
    }
  }, [mounted, onboardingHydrated, hasCompletedOnboarding, tutorialCompleted, tutorialStep, setTutorialStep]);

  const currentStep = tutorialStep !== null ? TUTORIAL_STEPS[tutorialStep] : null;
  // Never show tutorial if onboarding hasn't been completed
  const isActive = tutorialStep !== null && !tutorialCompleted && hasCompletedOnboarding;
  const totalSteps = TUTORIAL_STEPS.length;

  const next = useCallback(() => {
    if (tutorialStep === null) return;
    if (tutorialStep >= TUTORIAL_STEPS.length - 1) {
      setTutorialStep(null);
      setTutorialCompleted(true);
    } else {
      setTutorialStep(tutorialStep + 1);
    }
  }, [tutorialStep, setTutorialStep, setTutorialCompleted]);

  const prev = useCallback(() => {
    if (tutorialStep === null || tutorialStep <= 0) return;
    setTutorialStep(tutorialStep - 1);
  }, [tutorialStep, setTutorialStep]);

  const skip = useCallback(() => {
    setTutorialStep(null);
    setTutorialCompleted(true);
  }, [setTutorialStep, setTutorialCompleted]);

  const restart = useCallback(() => {
    setTutorialCompleted(false);
    setTutorialStep(0);
  }, [setTutorialCompleted, setTutorialStep]);

  return {
    isActive,
    currentStep,
    stepIndex: tutorialStep ?? 0,
    totalSteps,
    next,
    prev,
    skip,
    restart,
    mounted,
  };
}
