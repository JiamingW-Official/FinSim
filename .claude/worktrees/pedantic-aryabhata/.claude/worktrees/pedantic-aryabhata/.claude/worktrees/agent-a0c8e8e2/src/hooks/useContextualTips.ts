"use client";

import { useMemo } from "react";
import { useGameStore } from "@/stores/game-store";
import { useChartStore } from "@/stores/chart-store";
import { useOnboarding } from "./useOnboarding";

interface ContextualTip {
  id: string;
  message: string;
  dismiss: () => void;
}

export function useContextualTips(): ContextualTip | null {
  const stats = useGameStore((s) => s.stats);
  const activeIndicators = useChartStore((s) => s.activeIndicators);
  const { shouldShow, dismiss } = useOnboarding();

  const tip = useMemo(() => {
    // First loss → suggest stop-loss
    if (
      stats.consecutiveLosses >= 1 &&
      stats.totalTrades >= 2 &&
      shouldShow("tip-stop-loss")
    ) {
      return {
        id: "tip-stop-loss",
        message: "Consider using Stop-Loss orders to limit your downside risk.",
      };
    }

    // No indicators after 5 trades
    if (
      stats.totalTrades >= 5 &&
      activeIndicators.length === 0 &&
      shouldShow("tip-indicators")
    ) {
      return {
        id: "tip-indicators",
        message: "Try adding MACD or RSI indicators to spot trends and reversals!",
      };
    }

    // No limit orders after 10 trades
    if (
      stats.totalTrades >= 10 &&
      stats.limitOrdersUsed === 0 &&
      shouldShow("tip-limit-orders")
    ) {
      return {
        id: "tip-limit-orders",
        message: "Limit orders let you buy/sell at specific prices. Try one!",
      };
    }

    // 3+ consecutive losses
    if (
      stats.consecutiveLosses >= 3 &&
      shouldShow("tip-review-trades")
    ) {
      return {
        id: "tip-review-trades",
        message: "Tough streak! Review your trades in the History tab to learn from them.",
      };
    }

    // Big win
    if (
      stats.largestWin >= 1000 &&
      shouldShow("tip-take-profits")
    ) {
      return {
        id: "tip-take-profits",
        message: "Nice win! Consider setting take-profit orders to lock in gains.",
      };
    }

    return null;
  }, [stats, activeIndicators, shouldShow]);

  return tip ? { ...tip, dismiss: () => dismiss(tip.id) } : null;
}
