"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useClockStore } from "@/stores/clock-store";
import { soundEngine } from "@/services/audio/sound-engine";
import type { MarketSession } from "@/services/game-clock/engine";

/**
 * Sentinel component that fires Sonner toasts on market session transitions.
 * Mount once alongside the clock driver (e.g., in the dashboard layout).
 */
export function MarketBell() {
  const marketSession = useClockStore((s) => s.marketSession);
  const isMarketDay = useClockStore((s) => s.isMarketDay);
  const seasonStartRealMs = useClockStore((s) => s.seasonStartRealMs);
  const prevSessionRef = useRef<MarketSession | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (seasonStartRealMs === null) return;

    // Skip the very first render to avoid spurious notification on mount
    if (!mountedRef.current) {
      mountedRef.current = true;
      prevSessionRef.current = marketSession;
      return;
    }

    const prev = prevSessionRef.current;
    prevSessionRef.current = marketSession;

    // Only fire on actual transitions
    if (prev === marketSession) return;
    // Only fire on market days
    if (!isMarketDay) return;

    if (marketSession === "open" && prev !== "open") {
      playBell();
      toast("Market Open — 9:30 AM", {
        position: "top-right",
        duration: 4000,
      });
    }

    if (marketSession === "after-hours" && prev === "open") {
      playBell();
      toast("Market Closed — 4:00 PM", {
        position: "top-right",
        duration: 4000,
      });
    }
  }, [marketSession, isMarketDay, seasonStartRealMs]);

  return null;
}

function playBell(): void {
  // Primary: try the audio file
  try {
    const audio = new Audio("/sounds/bell.mp3");
    audio.volume = 0.3;
    audio.play().catch(() => {
      // File unavailable or browser blocked autoplay — use synth fallback
      soundEngine.playMarketBell();
    });
  } catch {
    // Audio constructor unavailable (SSR or restricted env) — use synth fallback
    soundEngine.playMarketBell();
  }
}
