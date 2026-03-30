"use client";

import { useEffect, useRef } from "react";
import { useClockStore } from "@/stores/clock-store";
import { useCompetitionStore } from "@/stores/competition-store";

/**
 * Drives the game clock at 2 ticks/sec (every 500ms).
 *
 * At 6x speed, 1 game minute = 10 real seconds.
 * 500ms ticks give sub-minute precision without hammering React.
 *
 * Syncs with /api/game-time on mount to correct any client clock drift.
 * Mount ONCE in TradePage.
 *
 * IMPORTANT: the clock only starts/syncs if a season is already active.
 * For new users, the clock stays at zero until they click "Start Season"
 * in LobbyScreen (which calls initializeSeason + startSeasonClock).
 *
 * NOTE: Returns void intentionally — TradePage subscribes to individual clock
 * values it needs directly. Returning a store selector object here would cause
 * TradePage to re-render every 500ms tick due to object reference inequality.
 */
export function useGameClock(): void {
  // Subscribe to `tick` only — it's a stable function reference from Zustand.
  // This does NOT cause TradePage to re-render because `tick` never changes.
  const tick = useClockStore((s) => s.tick);
  const syncedRef = useRef(false);

  // Server-time sync on mount — runs exactly once, only for returning users
  useEffect(() => {
    if (syncedRef.current) return;
    syncedRef.current = true;

    // Only sync/correct the clock if a season is already active (returning user).
    // New users have isSeasonActive=false; they must click "Start Season" first.
    const { isSeasonActive } = useCompetitionStore.getState();
    if (!isSeasonActive) return;

    fetch("/api/game-time")
      .then((r) => r.json())
      .then((data: { serverUtcMs: number; lastMidnightESTasUTC: number }) => {
        const drift = Math.abs(data.serverUtcMs - Date.now());
        // Correct client clock if drifted more than 10 seconds
        if (drift > 10_000) {
          useClockStore.setState({
            seasonStartRealMs: data.lastMidnightESTasUTC,
          });
        } else {
          const { seasonStartRealMs } = useClockStore.getState();
          if (seasonStartRealMs === null) {
            useClockStore.setState({
              seasonStartRealMs: data.lastMidnightESTasUTC,
            });
          }
        }
        useClockStore.getState().tick();
      })
      .catch(() => {
        // API unavailable — tick with whatever seasonStartRealMs we have (may be null)
        useClockStore.getState().tick();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tick loop — 2x/sec is sufficient (1 game minute = 10 real seconds)
  useEffect(() => {
    const interval = setInterval(tick, 500);
    return () => clearInterval(interval);
  }, [tick]);
}
