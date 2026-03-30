"use client";

/**
 * useGameClockBarSync
 *
 * Bridges the game clock to the legacy chart pipeline (market-data-store / revealedCount).
 * Runs on its OWN setInterval (every 1 second) — does NOT subscribe to tickVersion,
 * which would cause TradePage to re-render 10x/sec.
 *
 * Reads clock state imperatively via useClockStore.getState() to avoid re-render churn.
 */

import { useEffect, useRef } from "react";
import { useClockStore } from "@/stores/clock-store";
import { useMarketDataStore } from "@/stores/market-data-store";

const ET_TO_UTC_OFFSET_HOURS = 5; // EST = UTC-5

function gameTimeToUtcMs(gameDate: string, gameHour: number, gameMinute: number): number {
  const [y, m, d] = gameDate.split("-").map(Number);
  const dayStartMs = Date.UTC(y, m - 1, d);
  const gameTimeUtcMs =
    (gameHour + ET_TO_UTC_OFFSET_HOURS) * 60 * 60 * 1000 + gameMinute * 60 * 1000;
  return dayStartMs + gameTimeUtcMs;
}

export function useGameClockBarSync(): void {
  const lastRevealedRef = useRef<number>(-1);

  useEffect(() => {
    const sync = () => {
      // Read clock state imperatively — no subscription, no re-renders
      const { gameDate, gameHour, gameMinute, seasonStartRealMs } =
        useClockStore.getState();

      if (!seasonStartRealMs) return;

      const { allData, setRevealedCount } = useMarketDataStore.getState();
      if (allData.length === 0) return;

      const cutoffMs = gameTimeToUtcMs(gameDate, gameHour, gameMinute);

      // Binary search for rightmost bar with timestamp <= cutoffMs
      let lo = 0;
      let hi = allData.length - 1;
      let lastVisible = -1;

      while (lo <= hi) {
        const mid = (lo + hi) >>> 1;
        if (allData[mid].timestamp <= cutoffMs) {
          lastVisible = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }

      const newCount = lastVisible + 1;
      if (newCount !== lastRevealedRef.current && newCount >= 0) {
        lastRevealedRef.current = newCount;
        setRevealedCount(newCount);
      }
    };

    // Run once immediately, then every 1 second
    sync();
    const interval = setInterval(sync, 1000);
    return () => clearInterval(interval);
  }, []); // empty deps — never re-subscribes, reads state imperatively
}
