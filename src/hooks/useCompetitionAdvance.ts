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
 *
 * NOTE: allData is read imperatively via getState() instead of being
 * subscribed reactively to avoid re-renders on every data load cycle.
 */
export function useCompetitionAdvance() {
  const tradingDayIndex = useClockStore((s) => s.tradingDayIndex);
  const advanceDay = useCompetitionStore((s) => s.advanceDay);
  const isSeasonActive = useCompetitionStore((s) => s.isSeasonActive);
  const ticker = useChartStore((s) => s.currentTicker);

  // Track the last index we processed so we fire exactly once per day
  const lastProcessedRef = useRef<number>(-1);

  useEffect(() => {
    if (!isSeasonActive) return;
    if (tradingDayIndex <= lastProcessedRef.current) return;

    lastProcessedRef.current = tradingDayIndex;

    // Read allData imperatively — no need to subscribe reactively since we
    // only access a single element by index when tradingDayIndex changes.
    const allData = useMarketDataStore.getState().allData;

    // Build a bars record for this day's closing bar, keyed by ticker.
    // The competition-store & strategy-engine accept any Record<string, OHLCVBar>.
    const bar = allData[tradingDayIndex] ?? null;
    const dailyBars = bar && ticker ? { [ticker]: bar } : {};

    advanceDay(dailyBars, tradingDayIndex);
  }, [tradingDayIndex, isSeasonActive, ticker, advanceDay]);
}
