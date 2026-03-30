"use client";

import { useEffect } from "react";
import { useGameStore } from "@/stores/game-store";

/**
 * Level-up notification is disabled per user preference.
 * Still clears the store signal so it doesn't accumulate.
 */
export function LevelUpOverlay() {
  const lastLevelUp = useGameStore((s) => s.lastLevelUp);
  const clearLevelUp = useGameStore((s) => s.clearLevelUp);

  useEffect(() => {
    if (lastLevelUp !== null) clearLevelUp();
  }, [lastLevelUp, clearLevelUp]);

  return null;
}
