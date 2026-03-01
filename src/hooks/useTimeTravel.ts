"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMarketDataStore } from "@/stores/market-data-store";
import { useTradingStore } from "@/stores/trading-store";
import { useChartStore } from "@/stores/chart-store";
import { useGameStore } from "@/stores/game-store";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

const SPEED_INTERVALS: Record<number, number> = {
  1: 1000,
  2: 500,
  5: 200,
  10: 100,
};

export function useTimeTravel() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);
  const isPlaying = useMarketDataStore((s) => s.isPlaying);
  const speed = useMarketDataStore((s) => s.speed);
  const incrementRevealed = useMarketDataStore((s) => s.incrementRevealed);
  const setRevealedCount = useMarketDataStore((s) => s.setRevealedCount);
  const setIsPlaying = useMarketDataStore((s) => s.setIsPlaying);
  const setSpeed = useMarketDataStore((s) => s.setSpeed);
  const resetMarketData = useMarketDataStore((s) => s.reset);

  const updatePositionPrice = useTradingStore((s) => s.updatePositionPrice);
  const currentTicker = useChartStore((s) => s.currentTicker);

  const totalBars = allData.length;
  const progress = totalBars > 0 ? (revealedCount / totalBars) * 100 : 0;
  const atEnd = revealedCount >= totalBars;
  const currentBar =
    allData.length > 0 && revealedCount > 0
      ? allData[revealedCount - 1]
      : null;

  const advance = useCallback(() => {
    const store = useMarketDataStore.getState();
    if (store.revealedCount >= store.allData.length) {
      setIsPlaying(false);
      return;
    }
    incrementRevealed();
    const newBar = store.allData[store.revealedCount];
    if (newBar) {
      updatePositionPrice(currentTicker, newBar.close);

      // Check pending orders against this bar
      const tradingStore = useTradingStore.getState();
      const filledOrders = tradingStore.checkPendingOrders(
        newBar,
        newBar.timestamp,
      );
      for (const order of filledOrders) {
        const typeLabel = order.type.replace("_", " ").toUpperCase();
        toast.success(
          `${typeLabel} filled: ${order.side.toUpperCase()} ${order.filledQty} ${order.ticker} @ ${formatCurrency(order.avgFillPrice)}`,
        );
        // Award XP for pending order fills
        useGameStore
          .getState()
          .recordTrade(0, order.ticker, false, order.type === "limit");
      }

      // Record equity snapshot
      tradingStore.recordEquitySnapshot(newBar.timestamp);
    }
  }, [incrementRevealed, setIsPlaying, updatePositionPrice, currentTicker]);

  const play = useCallback(() => {
    if (atEnd) return;
    setIsPlaying(true);
  }, [setIsPlaying, atEnd]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, [setIsPlaying]);

  const changeSpeed = useCallback(
    (newSpeed: number) => {
      setSpeed(newSpeed);
    },
    [setSpeed],
  );

  const jumpTo = useCallback(
    (index: number) => {
      setRevealedCount(index);
      const bar = allData[index - 1];
      if (bar) {
        updatePositionPrice(currentTicker, bar.close);
      }
    },
    [setRevealedCount, allData, updatePositionPrice, currentTicker],
  );

  const reset = useCallback(() => {
    resetMarketData();
  }, [resetMarketData]);

  // Manage interval for auto-play
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isPlaying) {
      const ms = SPEED_INTERVALS[speed] ?? 1000;
      intervalRef.current = setInterval(advance, ms);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, speed, advance]);

  // Stop playing when reaching end
  useEffect(() => {
    if (atEnd && isPlaying) {
      setIsPlaying(false);
    }
  }, [atEnd, isPlaying, setIsPlaying]);

  return {
    currentBar,
    isPlaying,
    speed,
    progress,
    totalBars,
    revealedCount,
    atEnd,
    advance,
    play,
    pause,
    changeSpeed,
    jumpTo,
    reset,
  };
}
