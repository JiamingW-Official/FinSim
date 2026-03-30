"use client";

import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/stores/game-store";
import { getTitleForLevel } from "@/types/game";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Shows a toast-style level-up banner for 3 seconds then auto-dismisses.
 *
 * Bug fix: clearLevelUp() sets lastLevelUp→null, re-running the effect and
 * triggering cleanup which cancelled the setTimeout. Fix: store timer in a
 * ref so it survives the dependency re-run.
 */
export function LevelUpOverlay() {
  const lastLevelUp = useGameStore((s) => s.lastLevelUp);
  const clearLevelUp = useGameStore((s) => s.clearLevelUp);

  const [show, setShow] = useState(false);
  const [levelNum, setLevelNum] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (lastLevelUp === null) return;

    setLevelNum(lastLevelUp);
    setShow(true);
    clearLevelUp(); // clear store immediately — prevents re-trigger on re-mount

    // Cancel any prior timer, schedule fresh 3s dismiss
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShow(false);
      timerRef.current = null;
    }, 3000);
    // Intentionally no cleanup here — timer must outlive dependency changes
  }, [lastLevelUp, clearLevelUp]);

  // Cleanup on unmount only
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const title = levelNum !== null ? getTitleForLevel(levelNum) : "";

  return (
    <AnimatePresence>
      {show && levelNum !== null && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="fixed right-4 top-12 z-[100] flex items-center gap-3 rounded-md border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur-sm"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted/30 text-sm font-semibold tabular-nums text-foreground">
            {levelNum}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-foreground">{title}</span>
            <span className="text-[10px] text-muted-foreground">Level {levelNum} reached</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
