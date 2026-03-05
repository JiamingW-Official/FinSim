"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMarketDataStore } from "@/stores/market-data-store";
import { useTradingStore } from "@/stores/trading-store";
import { useChartStore } from "@/stores/chart-store";
import { useGameStore } from "@/stores/game-store";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

// Speed intervals in ms per 15m bar
const SPEED_INTERVALS: Record<number, number> = {
  1: 500,
  2: 250,
  5: 100,
  10: 50,
};

function getDateKey(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

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

    const prevBar = store.allData[store.revealedCount - 1];
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

      // Day boundary detection — toast when a new trading day starts
      if (prevBar && getDateKey(prevBar.timestamp) !== getDateKey(newBar.timestamp)) {
        const dayLabel = new Date(prevBar.timestamp).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
        toast.info(`Day complete: ${dayLabel}`, { duration: 2500 });
      }
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

  // Skip to start of next trading day
  const skipToNextDay = useCallback(() => {
    const store = useMarketDataStore.getState();
    if (store.revealedCount >= store.allData.length) return;

    const currentDate = store.allData[store.revealedCount - 1]
      ? getDateKey(store.allData[store.revealedCount - 1].timestamp)
      : null;

    let target = store.revealedCount;
    while (target < store.allData.length) {
      if (getDateKey(store.allData[target].timestamp) !== currentDate) break;
      target++;
    }

    if (target < store.allData.length) {
      setRevealedCount(target + 1);
      const bar = store.allData[target];
      if (bar) {
        updatePositionPrice(currentTicker, bar.close);

        // Process any pending orders for the skipped bars
        const tradingStore = useTradingStore.getState();
        tradingStore.recordEquitySnapshot(bar.timestamp);
      }
    }
  }, [setRevealedCount, updatePositionPrice, currentTicker]);

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
      const ms = SPEED_INTERVALS[speed] ?? 500;
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
    allData,
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
    skipToNextDay,
    reset,
  };
}
