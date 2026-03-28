"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMarketDataStore } from "@/stores/market-data-store";

/**
 * Vim-style navigation map: press "g" then a second key within 500ms to
 * navigate to the corresponding route.
 */
const VIM_NAV: Record<string, string> = {
  t: "/trade",
  l: "/learn",
  m: "/market",
  p: "/portfolio",
  o: "/options",
  a: "/arena",
  q: "/quests",
  b: "/backtest",
  r: "/risk",
};

const VIM_TIMEOUT_MS = 500;

function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

/**
 * Global keyboard shortcuts hook.
 *
 * Shortcuts handled here (not already handled by GlobalSearchProvider):
 *  - Space         → emit tt:toggle  (play/pause time travel)
 *  - ArrowLeft     → emit tt:prev    (step back one bar)
 *  - ArrowRight    → emit tt:next    (step forward one bar)
 *  - Escape        → emit modal:close (close any open modal/drawer)
 *  - /             → emit search:open (open CMD+K global search modal)
 *  - ?             → emit shortcuts:open (open keyboard shortcuts modal)
 *  - g + <key>     → navigate (same map as GlobalSearchProvider's VIM_NAV)
 *
 * Note: g-key navigation intentionally duplicates GlobalSearchProvider's
 * behaviour so this hook can be used standalone on pages outside the
 * dashboard layout. Within the dashboard the GlobalSearchProvider also
 * handles it, but duplicate calls are idempotent (same router.push target).
 */
export function useGlobalKeyboardShortcuts() {
  const router = useRouter();
  const gPressedRef = useRef(false);
  const gTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Always allow Escape regardless of focus
      if (e.key === "Escape") {
        window.dispatchEvent(new CustomEvent("modal:close"));
        return;
      }

      // Ignore when typing inside an input / textarea / select / contenteditable
      if (isEditableTarget(e.target)) return;

      // Do not fire on modifier combos (except plain keys)
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key) {
        case " ": {
          // Space → toggle play/pause
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("tt:toggle"));
          break;
        }
        case "ArrowLeft": {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("tt:prev"));
          break;
        }
        case "ArrowRight": {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("tt:next"));
          break;
        }
        case "/": {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("search:open"));
          break;
        }
        case "?": {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("shortcuts:open"));
          break;
        }
        case "g": {
          // Start vim-style chord sequence
          gPressedRef.current = true;
          if (gTimerRef.current) clearTimeout(gTimerRef.current);
          gTimerRef.current = setTimeout(() => {
            gPressedRef.current = false;
          }, VIM_TIMEOUT_MS);
          break;
        }
        default: {
          if (gPressedRef.current) {
            const dest = VIM_NAV[e.key.toLowerCase()];
            if (dest) {
              e.preventDefault();
              gPressedRef.current = false;
              if (gTimerRef.current) clearTimeout(gTimerRef.current);
              router.push(dest);
            }
          }
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      if (gTimerRef.current) clearTimeout(gTimerRef.current);
    };
  }, [router]);
}

/**
 * Convenience component wrapper — mount once in the dashboard layout.
 * Returns null (renders nothing), just activates the hook.
 */
export function GlobalKeyboardShortcuts() {
  useGlobalKeyboardShortcuts();

  // Wire tt:* custom events to market data store actions
  useEffect(() => {
    const onToggle = () => {
      const state = useMarketDataStore.getState();
      state.setIsPlaying(!state.isPlaying);
    };
    const onNext = () => {
      const state = useMarketDataStore.getState();
      if (state.revealedCount < state.allData.length) {
        state.incrementRevealed();
      }
    };
    const onPrev = () => {
      const state = useMarketDataStore.getState();
      if (state.revealedCount > 1) {
        state.setRevealedCount(state.revealedCount - 1);
      }
    };

    window.addEventListener("tt:toggle", onToggle);
    window.addEventListener("tt:next", onNext);
    window.addEventListener("tt:prev", onPrev);

    return () => {
      window.removeEventListener("tt:toggle", onToggle);
      window.removeEventListener("tt:next", onNext);
      window.removeEventListener("tt:prev", onPrev);
    };
  }, []);

  return null;
}
