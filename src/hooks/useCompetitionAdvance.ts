"use client";

import { useEffect, useRef } from "react";
import { useClockStore } from "@/stores/clock-store";
import { useCompetitionStore } from "@/stores/competition-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { useChartStore } from "@/stores/chart-store";

/**
 * Subscribes to the trading day index from clock-store and calls
 * competition-store's advanceDay() whenever the day changes.
 *
 * Bars are sourced from market-data-store (allData) and filtered to
 * the current ticker. When no bar data is available for the day, an
 * empty record is passed — strategy-engine guards against this safely.
 */
export function useCompetitionAdvance() {
  const tradingDayIndex = useClockStore((s) => s.tradingDayIndex);
  const advanceDay = useCompetitionStore((s) => s.advanceDay);
  const isSeasonActive = useCompetitionStore((s) => s.isSeasonActive);
  const allData = useMarketDataStore((s) => s.allData);
  const ticker = useChartStore((s) => s.currentTicker);

  // Track the last index we processed so we fire exactly once per day
  const lastProcessedRef = useRef<number>(-1);

  useEffect(() => {
    if (!isSeasonActive) return;
    if (tradingDayIndex <= lastProcessedRef.current) return;

    lastProcessedRef.current = tradingDayIndex;

    // Build a bars record for this day's closing bar, keyed by ticker.
    // The competition-store & strategy-engine accept any Record<string, OHLCVBar>.
    const bar = allData[tradingDayIndex] ?? null;
    const dailyBars = bar && ticker ? { [ticker]: bar } : {};

    advanceDay(dailyBars, tradingDayIndex);
  }, [tradingDayIndex, isSeasonActive, allData, ticker, advanceDay]);
}
