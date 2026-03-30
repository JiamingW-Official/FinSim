"use client";

/**
 * useMarketCountdown
 *
 * Computes a live countdown to the next market session transition.
 * - pre-market  → "Opens in MM:SS"
 * - open        → "Closes in MM:SS"
 * - after-hours → "Opens in H:MM"
 * - closed      → "Opens in H:MM"
 *
 * Runs its own setInterval(500ms) and reads the clock imperatively —
 * NEVER subscribes to Zustand, so it never causes TradePage re-renders.
 * The returned state object only updates when the formatted string changes.
 */

import { useState, useEffect } from "react";
import { useClockStore } from "@/stores/clock-store";
import { getGameTime } from "@/services/game-clock/engine";

export interface CountdownInfo {
  /** "Opens in" | "Closes in" | "" */
  label: string;
  /** Formatted time string: "MM:SS" or "H:MM" */
  display: string;
  /** true when < 5 game minutes remain */
  urgent: boolean;
  /** Which session the countdown targets */
  target: "open" | "close" | "none";
}

// Session boundary times in seconds from midnight UTC
const PRE_MARKET_SEC = 4 * 3600;           // 04:00 UTC
const OPEN_SEC       = 9 * 3600 + 30 * 60; // 09:30 UTC (14:30 UTC = 9:30 ET)
const CLOSE_SEC      = 16 * 3600;          // 16:00 UTC (21:00 UTC = 16:00 ET)
const AH_END_SEC     = 20 * 3600;          // 20:00 UTC

// 5 game minutes = 50 real seconds (at 6×). Urgent threshold.
const URGENT_GAME_SEC = 5 * 60;

function formatCountdown(totalSec: number): string {
  if (totalSec <= 0) return "00:00";
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function computeCountdown(seasonStartRealMs: number): CountdownInfo {
  const state = getGameTime(seasonStartRealMs);
  const { gameDate, marketSession, isMarketDay: isMktDay, isSeasonOver } = state;

  if (isSeasonOver) {
    return { label: "", display: "", urgent: false, target: "none" };
  }

  const h = gameDate.getUTCHours();
  const m = gameDate.getUTCMinutes();
  const s = gameDate.getUTCSeconds();
  const currentSec = h * 3600 + m * 60 + s;

  // Non-trading day: count to next 9:30 AM (next calendar day — ignores holidays
  // for simplicity, but is always correct directionally)
  if (!isMktDay) {
    const secsToMidnight = 86400 - currentSec;
    const remaining = secsToMidnight + OPEN_SEC;
    return {
      label: "Opens in",
      display: formatCountdown(remaining),
      urgent: false,
      target: "open",
    };
  }

  switch (marketSession) {
    case "closed": {
      // Either early morning (before pre-market) or late night (after AH)
      if (currentSec < PRE_MARKET_SEC) {
        // Before 4 AM — count to 9:30 AM open
        const remaining = OPEN_SEC - currentSec;
        return {
          label: "Opens in",
          display: formatCountdown(remaining),
          urgent: remaining < URGENT_GAME_SEC,
          target: "open",
        };
      }
      // After AH (>= 20:00) — count to next day 9:30
      const secsToMidnight = 86400 - currentSec;
      return {
        label: "Opens in",
        display: formatCountdown(secsToMidnight + OPEN_SEC),
        urgent: false,
        target: "open",
      };
    }

    case "pre-market": {
      const remaining = OPEN_SEC - currentSec;
      return {
        label: "Opens in",
        display: formatCountdown(remaining),
        urgent: remaining < URGENT_GAME_SEC,
        target: "open",
      };
    }

    case "open": {
      const remaining = CLOSE_SEC - currentSec;
      return {
        label: "Closes in",
        display: formatCountdown(remaining),
        urgent: remaining < URGENT_GAME_SEC,
        target: "close",
      };
    }

    case "after-hours": {
      const remaining = AH_END_SEC - currentSec;
      return {
        label: "AH ends in",
        display: formatCountdown(remaining),
        urgent: false,
        target: "close",
      };
    }
  }

  return { label: "", display: "--:--", urgent: false, target: "none" };
}

const EMPTY: CountdownInfo = { label: "Opens in", display: "--:--", urgent: false, target: "open" };

export function useMarketCountdown(): CountdownInfo {
  const [info, setInfo] = useState<CountdownInfo>(EMPTY);

  useEffect(() => {
    const update = () => {
      const { seasonStartRealMs } = useClockStore.getState();
      if (!seasonStartRealMs) return;
      const next = computeCountdown(seasonStartRealMs);
      // Only trigger re-render when the displayed string changes (~every 10s)
      setInfo((prev) =>
        prev.label === next.label && prev.display === next.display && prev.urgent === next.urgent
          ? prev
          : next,
      );
    };

    update();
    const interval = setInterval(update, 500);
    return () => clearInterval(interval);
  }, []);

  return info;
}
