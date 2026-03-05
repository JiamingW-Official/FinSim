"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMarketDataStore } from "@/stores/market-data-store";
import { useTradingStore } from "@/stores/trading-store";
import { useChartStore } from "@/stores/chart-store";
import { useGameStore } from "@/stores/game-store";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

// Fixed interval: 2 seconds per 15m bar.
// In 5m view, subdivided into 3 ticks (~667ms each) for smooth 5m bar reveal.
const PLAY_INTERVAL_MS = 2000;
const SUB_BAR_COUNT = 3; // 3 five-minute bars per 15m bar

function getDateKey(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export function useTimeTravel() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);
  const isPlaying = useMarketDataStore((s) => s.isPlaying);
  const subBarStep = useMarketDataStore((s) => s.subBarStep);
  const incrementRevealed = useMarketDataStore((s) => s.incrementRevealed);
  const setRevealedCount = useMarketDataStore((s) => s.setRevealedCount);
  const setIsPlaying = useMarketDataStore((s) => s.setIsPlaying);
  const setSubBarStep = useMarketDataStore((s) => s.setSubBarStep);
  const resetMarketData = useMarketDataStore((s) => s.reset);

  const updatePositionPrice = useTradingStore((s) => s.updatePositionPrice);
  const currentTicker = useChartStore((s) => s.currentTicker);
  const currentTimeframe = useChartStore((s) => s.currentTimeframe);

  const totalBars = allData.length;
  const progress = totalBars > 0 ? (revealedCount / totalBars) * 100 : 0;
  const atEnd = revealedCount >= totalBars;
  const currentBar =
    allData.length > 0 && revealedCount > 0
      ? allData[revealedCount - 1]
      : null;

  // Advance one full 15m bar (with order execution, day boundary checks, etc.)
  const advanceFull = useCallback(() => {
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
        useGameStore
          .getState()
          .recordTrade(0, order.ticker, false, order.type === "limit");
      }

      // Record equity snapshot
      tradingStore.recordEquitySnapshot(newBar.timestamp);

      // Day boundary detection
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

  // Advance one step — respects 5m sub-stepping when in 5m view
  const advance = useCallback(() => {
    const tf = useChartStore.getState().currentTimeframe;
    if (tf === "5m") {
      const step = useMarketDataStore.getState().subBarStep;
      if (step < SUB_BAR_COUNT - 1) {
        // Reveal next 5m sub-bar within current 15m bar
        setSubBarStep(step + 1);
      } else {
        // All 3 sub-bars shown → advance to next 15m bar, reset sub-step
        setSubBarStep(0);
        advanceFull();
      }
    } else {
      // Non-5m views: always advance a full 15m bar
      setSubBarStep(2); // keep fully revealed
      advanceFull();
    }
  }, [advanceFull, setSubBarStep]);

  // Step backward — respects 5m sub-stepping
  const stepBack = useCallback(() => {
    const tf = useChartStore.getState().currentTimeframe;
    if (tf === "5m") {
      const step = useMarketDataStore.getState().subBarStep;
      if (step > 0) {
        setSubBarStep(step - 1);
      } else {
        // At sub-step 0 → go to previous 15m bar, sub-step 2
        const rc = useMarketDataStore.getState().revealedCount;
        if (rc > 1) {
          setRevealedCount(rc - 1);
          setSubBarStep(2);
        }
      }
    } else {
      const rc = useMarketDataStore.getState().revealedCount;
      if (rc > 1) {
        setRevealedCount(rc - 1);
      }
    }
  }, [setSubBarStep, setRevealedCount]);

  const play = useCallback(() => {
    if (atEnd) return;
    setIsPlaying(true);
  }, [setIsPlaying, atEnd]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, [setIsPlaying]);

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
        const tradingStore = useTradingStore.getState();
        tradingStore.recordEquitySnapshot(bar.timestamp);
      }
    }
  }, [setRevealedCount, updatePositionPrice, currentTicker]);

  const reset = useCallback(() => {
    resetMarketData();
  }, [resetMarketData]);

  // Manage interval for auto-play — 5m view ticks 3× faster
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isPlaying) {
      const is5m = currentTimeframe === "5m";
      const ms = is5m ? PLAY_INTERVAL_MS / SUB_BAR_COUNT : PLAY_INTERVAL_MS;
      intervalRef.current = setInterval(advance, ms);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, advance, currentTimeframe]);

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
    progress,
    totalBars,
    revealedCount,
    subBarStep,
    atEnd,
    advance,
    stepBack,
    play,
    pause,
    jumpTo,
    skipToNextDay,
    reset,
  };
}
