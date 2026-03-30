"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTimeTravel } from "@/hooks/useTimeTravel";
import { useChartStore } from "@/stores/chart-store";
import { useTradingStore } from "@/stores/trading-store";
import type { Timeframe } from "@/types/market";

export interface KeyboardShortcut {
  key: string;
  description: string;
  handler: () => void;
  modifier?: "ctrl" | "shift" | "alt";
}

/** Register arbitrary shortcut definitions (used by KeyboardShortcutsHelp display). */
export function useKeyboardShortcutList(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      )
        return;

      for (const shortcut of shortcuts) {
        const modifierMatch =
          !shortcut.modifier ||
          (shortcut.modifier === "ctrl" && e.ctrlKey) ||
          (shortcut.modifier === "shift" && e.shiftKey) ||
          (shortcut.modifier === "alt" && e.altKey);

        if (modifierMatch && e.key.toLowerCase() === shortcut.key.toLowerCase()) {
          e.preventDefault();
          shortcut.handler();
          return;
        }
      }
    },
    [shortcuts],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

/** TIMEFRAME_MAP: digit keys 1-5 → timeframe values */
const TIMEFRAME_MAP: Record<string, Timeframe> = {
  "1": "5m",
  "2": "15m",
  "3": "1h",
  "4": "1d",
  "5": "1wk",
};

/**
 * POSITION_SIZE_MAP: digit keys 1-9 → portfolio percentage for quick sizing.
 * Keys 1-5 are dual-purpose: if chart mode is active they switch timeframes,
 * but finsim:position-size event is also dispatched so OrderEntry can respond.
 * Keys 6-9 are position-size only (25%, 33%, 50%, 100%).
 */
const POSITION_SIZE_MAP: Record<string, number> = {
  "1": 1,
  "2": 2,
  "3": 5,
  "4": 10,
  "5": 25,
  "6": 25,
  "7": 33,
  "8": 50,
  "9": 100,
};

/**
 * Primary hook used by TradePageClient.
 * Handles all trade-page keyboard shortcuts:
 *   Space       — play / pause time travel
 *   →           — advance one bar
 *   ←           — step back one bar
 *   1-5         — switch timeframe AND dispatch position-size event
 *   6-9         — quick position size (25/33/50/100% of portfolio)
 *   B           — toggle to buy side in order entry
 *   S           — focus ticker search input
 *   I           — toggle indicators panel (dispatches custom event)
 *   ?           — toggle keyboard shortcuts help modal
 *   Cmd/Ctrl+K  — open command palette
 *   Escape      — close any open modal/panel
 *   g h         — navigate to /home  (g then h within 1 second)
 *   g t         — navigate to /trade
 *   g p         — navigate to /portfolio
 *   g l         — navigate to /learn
 *   g o         — navigate to /options
 */
export function useKeyboardShortcuts() {
  const { isPlaying, play, pause, advance, stepBack } = useTimeTravel();
  const setTimeframe = useChartStore((s) => s.setTimeframe);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);
  const router = useRouter();

  // "g-key" sequence tracking: store the timestamp of last "g" press
  const gPressedAtRef = useRef<number>(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip if user is typing in any form element
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // ── Cmd/Ctrl+K → open command palette ─────────────────────────────────
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("finsim:open-command-palette"));
        return;
      }

      // Skip remaining shortcuts when meta/ctrl are held (avoid browser conflicts)
      if (e.metaKey || e.ctrlKey) return;

      // ── Escape ─────────────────────────────────────────────────────────────
      if (e.key === "Escape") {
        window.dispatchEvent(new CustomEvent("finsim:close-panels"));
        return;
      }

      // ── ? → toggle shortcuts help ──────────────────────────────────────────
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("finsim:toggle-shortcuts-help"));
        return;
      }

      // ── g-sequence navigation ──────────────────────────────────────────────
      if (e.key === "g" || e.key === "G") {
        e.preventDefault();
        gPressedAtRef.current = Date.now();
        return;
      }

      const timeSinceG = Date.now() - gPressedAtRef.current;
      if (timeSinceG < 1000) {
        // Within 1 second of pressing g — check second key
        const NAV_MAP: Record<string, string> = {
          h: "/home",
          H: "/home",
          t: "/trade",
          T: "/trade",
          p: "/portfolio",
          P: "/portfolio",
          l: "/learn",
          L: "/learn",
          o: "/options",
          O: "/options",
        };
        if (NAV_MAP[e.key]) {
          e.preventDefault();
          gPressedAtRef.current = 0;
          router.push(NAV_MAP[e.key]);
          return;
        }
      }

      // ── Timeframe switcher: digits 1–5 ─────────────────────────────────────
      if (TIMEFRAME_MAP[e.key]) {
        e.preventDefault();
        setTimeframe(TIMEFRAME_MAP[e.key]);
        // Also dispatch position-size (dual use: 1=1%, 2=2%, 3=5%, 4=10%, 5=25%)
        window.dispatchEvent(
          new CustomEvent("finsim:position-size", {
            detail: { pct: POSITION_SIZE_MAP[e.key] },
          }),
        );
        return;
      }

      // ── Position size keys 6-9 ─────────────────────────────────────────────
      if (["6", "7", "8", "9"].includes(e.key)) {
        e.preventDefault();
        window.dispatchEvent(
          new CustomEvent("finsim:position-size", {
            detail: { pct: POSITION_SIZE_MAP[e.key] },
          }),
        );
        return;
      }

      switch (e.key) {
        case " ":
          e.preventDefault();
          isPlaying ? pause() : play();
          break;
        case "ArrowRight":
          e.preventDefault();
          if (!isPlaying) advance();
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (!isPlaying) stepBack();
          break;
        case "b":
        case "B":
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("finsim:focus-buy"));
          break;
        case "s":
        case "S":
          e.preventDefault();
          // Focus the ticker select / any search input tagged with data-shortcut="ticker-search"
          window.dispatchEvent(new CustomEvent("finsim:focus-search"));
          break;
        case "i":
        case "I":
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("finsim:toggle-indicators"));
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isPlaying, play, pause, advance, stepBack, setTimeframe, portfolioValue, router]);
}
