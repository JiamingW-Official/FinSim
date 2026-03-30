"use client";

import { useEffect, useRef } from "react";
import { useAnalyticsStore } from "@/stores/analytics-store";

const ALL_FEATURES = [
  "trade",
  "learn",
  "backtest",
  "options",
  "predictions",
  "portfolio",
  "market",
  "leaderboard",
  "arena",
  "ai-coach",
];

const FEATURE_SUGGESTIONS: Record<string, string> = {
  trade: "Place your first trade in the Trade section to start building your portfolio.",
  learn: "Try a lesson in Learn to improve your trading knowledge.",
  backtest: "Test your strategy in Backtest before risking simulated capital.",
  options: "Explore the Options chain to understand derivatives trading.",
  predictions: "Make a market prediction to practice your directional bias.",
  portfolio: "Review your Portfolio analytics to track your performance.",
  market: "Check the Market overview for current sector trends.",
  leaderboard: "Visit the Leaderboard to see how you rank against other traders.",
  arena: "Compete in the Arena for head-to-head trading challenges.",
  "ai-coach": "Enable the AI Coach on the Trade page for real-time signal analysis.",
};

export function useAnalytics() {
  const startSession = useAnalyticsStore((s) => s.startSession);
  const endSession = useAnalyticsStore((s) => s.endSession);
  const trackFeatureUseStore = useAnalyticsStore((s) => s.trackFeatureUse);
  const featureUsage = useAnalyticsStore((s) => s.featureUsage);
  const checkRetention = useAnalyticsStore((s) => s.checkRetention);

  // Track session start on mount, end on unmount
  const sessionStarted = useRef(false);

  const trackSession = () => {
    if (sessionStarted.current) return;
    sessionStarted.current = true;
    startSession();
    checkRetention();
  };

  const trackFeatureUse = (feature: string) => {
    trackFeatureUseStore(feature);
  };

  const getPersonalizedSuggestion = (): string => {
    // Find the first feature the user hasn't used yet
    const unused = ALL_FEATURES.find((f) => !featureUsage[f] || featureUsage[f] === 0);
    if (unused) {
      return FEATURE_SUGGESTIONS[unused] ?? `Try the ${unused} feature to expand your skills.`;
    }

    // Find least used feature
    const leastUsed = ALL_FEATURES.reduce((min, f) => {
      const cur = featureUsage[f] ?? 0;
      const minVal = featureUsage[min] ?? 0;
      return cur < minVal ? f : min;
    }, ALL_FEATURES[0]);

    return (
      FEATURE_SUGGESTIONS[leastUsed] ??
      "Keep trading and learning to improve your performance metrics."
    );
  };

  return {
    trackFeatureUse,
    trackSession,
    getPersonalizedSuggestion,
  };
}

/**
 * Lightweight hook to call trackSession() once on layout mount.
 * Place in layout.tsx via a client component wrapper.
 */
export function useSessionTracker() {
  const startSession = useAnalyticsStore((s) => s.startSession);
  const checkRetention = useAnalyticsStore((s) => s.checkRetention);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    startSession();
    checkRetention();
  }, [startSession, checkRetention]);
}
