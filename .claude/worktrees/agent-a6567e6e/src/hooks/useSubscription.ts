"use client";

import { useState, useEffect, useCallback } from "react";

export type SubscriptionTier = "free" | "pro" | "alpha";

const STORAGE_KEY = "finsim_subscription_tier";
const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 1,
  alpha: 2,
};

export function useSubscription() {
  const [currentTier, setCurrentTierState] = useState<SubscriptionTier>("free");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as SubscriptionTier | null;
      if (stored && stored in TIER_RANK) {
        setCurrentTierState(stored);
      }
    } catch {
      // localStorage unavailable (SSR / private browsing)
    }
  }, []);

  const setTier = useCallback((tier: SubscriptionTier) => {
    try {
      localStorage.setItem(STORAGE_KEY, tier);
    } catch {
      // ignore
    }
    setCurrentTierState(tier);
  }, []);

  const hasAccess = useCallback(
    (requiredTier: SubscriptionTier): boolean => {
      return TIER_RANK[currentTier] >= TIER_RANK[requiredTier];
    },
    [currentTier]
  );

  return { currentTier, setTier, hasAccess };
}
