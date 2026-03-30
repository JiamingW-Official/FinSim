"use client";

/**
 * useMarketCountdown
 *
 * Computes a live countdown to the next market session transition.
 * All durations are always shown to the second (H:MM:SS or MM:SS).
 *
 * Session labels (what opens/closes next):
 *  closed (before 4AM)  → Pre-Market opens in
 *  closed (after 8PM)   → Pre-Market opens in (next day)
 *  pre-market           → Market Open Market opens in
 *  open                 → Market Close Market closes in
 *  after-hours          → After-Hours AH ends in
 *
 * Runs its own setInterval(500ms) and reads the clock imperatively —
 * NEVER subscribes to Zustand, so it never causes TradePage re-renders.
 */

import { useState, useEffect } from "react";
import { useClockStore } from "@/stores/clock-store";
import { getGameTime } from "@/services/game-clock/engine";

export interface CountdownInfo {
  /** Short verb phrase, e.g. "Pre-Market" or "Market Open" */
  label: string;
  /** Action word: "opens in" | "closes in" | "ends in" */
  action: string;
  /** Formatted time string: always H:MM:SS or MM:SS */
  display: string;
  /** true when < 5 game minutes remain */
  urgent: boolean;
  /** Which session the countdown targets */
  target: "open" | "close" | "none";
}

// Session boundary times in seconds from midnight (game time = UTC)
const PRE_MARKET_SEC = 4 * 3600;            // 04:00 ET
const OPEN_SEC       = 9 * 3600 + 30 * 60;  // 09:30 ET
const CLOSE_SEC      = 16 * 3600;           // 16:00 ET
const AH_END_SEC     = 20 * 3600;           // 20:00 ET

// 5 game minutes = 50 real seconds (at 6×). Urgent threshold.
const URGENT_GAME_SEC = 5 * 60;

/** Always seconds-precise: H:MM:SS when ≥ 1 hour, MM:SS otherwise */
function formatCountdown(totalSec: number): string {
  if (totalSec <= 0) return "00:00";
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function computeCountdown(seasonStartRealMs: number): CountdownInfo {
  const state = getGameTime(seasonStartRealMs);
  const { gameDate, marketSession, isMarketDay: isMktDay, isSeasonOver } = state;

  if (isSeasonOver) {
    return { label: "", action: "", display: "", urgent: false, target: "none" };
  }

  const h = gameDate.getUTCHours();
  const m = gameDate.getUTCMinutes();
  const s = gameDate.getUTCSeconds();
  const currentSec = h * 3600 + m * 60 + s;

  // Non-trading day: count to next day's pre-market (4AM)
  if (!isMktDay) {
    const secsToMidnight = 86400 - currentSec;
    const remaining = secsToMidnight + PRE_MARKET_SEC;
    return {
      label: "Pre-Market",
      action: "opens in",
      display: formatCountdown(remaining),
      urgent: false,
      target: "open",
    };
  }

  switch (marketSession) {
    case "closed": {
      if (currentSec < PRE_MARKET_SEC) {
        // Before 4AM — count to pre-market open
        const remaining = PRE_MARKET_SEC - currentSec;
        return {
          label: "Pre-Market",
          action: "opens in",
          display: formatCountdown(remaining),
          urgent: remaining < URGENT_GAME_SEC,
          target: "open",
        };
      }
      // After 8PM (AH ended) — count to next day 4AM pre-market
      const secsToMidnight = 86400 - currentSec;
      return {
        label: "Pre-Market",
        action: "opens in",
        display: formatCountdown(secsToMidnight + PRE_MARKET_SEC),
        urgent: false,
        target: "open",
      };
    }

    case "pre-market": {
      const remaining = OPEN_SEC - currentSec;
      return {
        label: "Market Open",
        action: "opens in",
        display: formatCountdown(remaining),
        urgent: remaining < URGENT_GAME_SEC,
        target: "open",
      };
    }

    case "open": {
      const remaining = CLOSE_SEC - currentSec;
      return {
        label: "Market Close",
        action: "closes in",
        display: formatCountdown(remaining),
        urgent: remaining < URGENT_GAME_SEC,
        target: "close",
      };
    }

    case "after-hours": {
      const remaining = AH_END_SEC - currentSec;
      return {
        label: "After-Hours",
        action: "ends in",
        display: formatCountdown(remaining),
        urgent: remaining < URGENT_GAME_SEC,
        target: "close",
      };
    }
  }

  return { label: "", action: "", display: "--:--", urgent: false, target: "none" };
}

const EMPTY: CountdownInfo = {
  label: "Pre-Market",
  action: "opens in",
  display: "--:--",
  urgent: false,
  target: "open",
};

export function useMarketCountdown(): CountdownInfo {
  const [info, setInfo] = useState<CountdownInfo>(EMPTY);

  useEffect(() => {
    const update = () => {
      const { seasonStartRealMs } = useClockStore.getState();
      if (!seasonStartRealMs) return;
      const next = computeCountdown(seasonStartRealMs);
      // Only trigger re-render when the displayed string changes (every second)
      setInfo((prev) =>
        prev.label === next.label &&
        prev.action === next.action &&
        prev.display === next.display &&
        prev.urgent === next.urgent
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
