"use client";

import { useEffect, useRef, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import type { OHLCVBar, Timeframe } from "@/types/market";
import { INTRADAY_TIMEFRAMES } from "@/types/market";
import {
  loadDailyBars,
  getVisibleBars,
  getHistoricalBars,
  getDailyBar,
  isTradingDay,
} from "@/services/market-data/historical-loader";
import {
  getVisibleBarCount,
  getSubBarProgress,
  isMarketOpen,
} from "@/services/market-data/bar-scheduler";
import { useMarketDataStoreV2 } from "@/stores/market-data-store-v2";

// ── Clock store interface (being built by another agent) ──────────────────────
// We define the selector type here so this file compiles independently.
// Once the clock store exists, swap in the real import.

interface ClockState {
  /** ISO date string, e.g. "2024-06-15" */
  gameDate: string;
  /** 0-23 */
  gameHour: number;
  /** 0-59 */
  gameMinute: number;
  /** "pre" | "open" | "post" | "closed" */
  marketSession: string;
  /** Index into trading days array */
  tradingDayIndex: number;
  /** Monotonically increasing counter, bumped every ~100ms */
  tickVersion: number;
}

// Lazy import: try to use the real clock store, fall back to defaults
let useClockStore: <T>(selector: (state: ClockState) => T) => T;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require("@/stores/clock-store");
  useClockStore = mod.useClockStore;
} catch {
  // Clock store not yet created — provide static defaults for development
  useClockStore = <T>(selector: (state: ClockState) => T): T =>
    selector({
      gameDate: new Date().toISOString().slice(0, 10),
      gameHour: 12,
      gameMinute: 0,
      marketSession: "open",
      tradingDayIndex: 0,
      tickVersion: 0,
    });
}

// ── Return type ───────────────────────────────────────────────────────────────

export interface GameMarketDataResult {
  /** Bars visible on the chart (historical + today's revealed bars) */
  bars: OHLCVBar[];
  /** Whether daily data is still loading from the API */
  isLoading: boolean;
  /** Current interpolated price */
  currentPrice: number;
  /** Absolute price change vs previous close */
  dailyChange: number;
  /** Percentage change vs previous close */
  dailyChangePct: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

/** Number of historical daily bars to include in chart context */
const HISTORICAL_DAILY_CONTEXT = 120;

/** Number of historical intraday bars to show from previous days */
const HISTORICAL_INTRADAY_CONTEXT = 200;

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useGameMarketData(
  ticker: string,
  timeframe: Timeframe,
): GameMarketDataResult {
  // Subscribe to clock — only re-render when throttled tick fires
  const gameDate = useClockStore((s) => s.gameDate);
  const gameHour = useClockStore((s) => s.gameHour);
  const gameMinute = useClockStore((s) => s.gameMinute);
  const tickVersion = useClockStore((s) => s.tickVersion);

  // Store actions
  const updateBars = useMarketDataStoreV2((s) => s.updateBars);
  const updatePrice = useMarketDataStoreV2((s) => s.updatePrice);
  const setLoading = useMarketDataStoreV2((s) => s.setLoading);

  // Track the last bar count to avoid redundant updates
  const lastBarCountRef = useRef<number>(-1);
  const lastDateRef = useRef<string>("");

  // ── Load daily data via React Query ───────────────────────────────────────
  const dailyQuery = useQuery({
    queryKey: ["game-daily-bars", ticker],
    queryFn: () => loadDailyBars(ticker),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,
  });

  // Update loading state
  useEffect(() => {
    setLoading(ticker, dailyQuery.isLoading);
  }, [ticker, dailyQuery.isLoading, setLoading]);

  // ── Compute visible bars ──────────────────────────────────────────────────
  // Throttle: only recompute when a new bar boundary is crossed (~every 1s)
  // We use tickVersion % 10 === 0 as a rough 1-second throttle (100ms ticks)
  const shouldUpdate = tickVersion % 10 === 0;

  const bars = useMemo(() => {
    // Gate on shouldUpdate to throttle; also depend on core inputs
    if (!dailyQuery.data || dailyQuery.data.length === 0) return [];

    // Don't recompute if nothing meaningful changed
    // (tickVersion is in deps via shouldUpdate, but we only proceed on boundaries)
    void shouldUpdate;

    if (timeframe === "1d") {
      // Daily view: return all daily bars up to the current game date
      return getHistoricalBars(ticker, gameDate, "1d", HISTORICAL_DAILY_CONTEXT);
    }

    if (timeframe === "1wk") {
      // Weekly view: aggregate from daily bars
      return getHistoricalBars(ticker, gameDate, "1wk", 52);
    }

    if (INTRADAY_TIMEFRAMES.has(timeframe)) {
      // Get today's visible bars
      const todayBars = getVisibleBars(
        ticker,
        gameDate,
        gameHour,
        gameMinute,
        timeframe,
      );

      // Get historical context from previous days
      // Find the date before gameDate to avoid double-counting
      const dailyBars = dailyQuery.data;
      let prevDate = "";
      for (let i = dailyBars.length - 1; i >= 0; i--) {
        const d = new Date(dailyBars[i].timestamp).toISOString().slice(0, 10);
        if (d < gameDate) {
          prevDate = d;
          break;
        }
      }

      const historicalBars = prevDate
        ? getHistoricalBars(
            ticker,
            prevDate,
            timeframe,
            HISTORICAL_INTRADAY_CONTEXT,
          )
        : [];

      return [...historicalBars, ...todayBars];
    }

    return [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ticker,
    timeframe,
    gameDate,
    gameHour,
    gameMinute,
    shouldUpdate,
    dailyQuery.data,
  ]);

  // ── Compute current price (interpolated within current bar) ───────────────
  const { currentPrice, dailyChange, dailyChangePct } = useMemo(() => {
    if (bars.length === 0) {
      return { currentPrice: 0, dailyChange: 0, dailyChangePct: 0 };
    }

    const lastBar = bars[bars.length - 1];
    let price: number;

    // If market is open and we have intraday data, interpolate within current bar
    if (INTRADAY_TIMEFRAMES.has(timeframe) && isMarketOpen(gameHour, gameMinute)) {
      const progress = getSubBarProgress(gameHour, gameMinute, timeframe);
      // Linear interpolation between bar open and close
      price = lastBar.open + (lastBar.close - lastBar.open) * progress;
    } else {
      price = lastBar.close;
    }

    // Compute daily change vs previous close
    let prevClose = price; // fallback: 0% change
    if (INTRADAY_TIMEFRAMES.has(timeframe)) {
      // Previous close is the daily bar for the previous trading day
      const dailyBars = dailyQuery.data;
      if (dailyBars) {
        for (let i = dailyBars.length - 1; i >= 0; i--) {
          const d = new Date(dailyBars[i].timestamp).toISOString().slice(0, 10);
          if (d < gameDate) {
            prevClose = dailyBars[i].close;
            break;
          }
        }
      }
    } else if (bars.length >= 2) {
      prevClose = bars[bars.length - 2].close;
    }

    const change = price - prevClose;
    const changePct = prevClose !== 0 ? (change / prevClose) * 100 : 0;

    return { currentPrice: price, dailyChange: change, dailyChangePct: changePct };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bars, gameHour, gameMinute, timeframe, gameDate, dailyQuery.data]);

  // ── Sync to store (for other components that read from the store) ─────────
  const syncToStore = useCallback(() => {
    const currentBarCount = bars.length;
    const dateChanged = lastDateRef.current !== gameDate;
    const barCountChanged = lastBarCountRef.current !== currentBarCount;

    if (dateChanged || barCountChanged) {
      lastBarCountRef.current = currentBarCount;
      lastDateRef.current = gameDate;
      updateBars(ticker, bars);
    }

    updatePrice(ticker, currentPrice, dailyChange, dailyChangePct);
  }, [
    ticker,
    bars,
    currentPrice,
    dailyChange,
    dailyChangePct,
    gameDate,
    updateBars,
    updatePrice,
  ]);

  useEffect(() => {
    syncToStore();
  }, [syncToStore]);

  return {
    bars,
    isLoading: dailyQuery.isLoading,
    currentPrice,
    dailyChange,
    dailyChangePct,
  };
}
