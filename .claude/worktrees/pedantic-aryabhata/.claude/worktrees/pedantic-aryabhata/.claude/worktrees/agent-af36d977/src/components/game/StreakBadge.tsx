"use client";

import { useGameStore } from "@/stores/game-store";
import { Flame } from "lucide-react";

export function StreakBadge() {
  const dailyStreak = useGameStore((s) => s.stats.dailyStreak);

  if (dailyStreak < 1) return null;

  return (
    <div className="flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5">
      <Flame className="h-3 w-3 text-orange-500" />
      <span className="text-[10px] font-bold tabular-nums text-orange-500">
        {dailyStreak}
      </span>
    </div>
  );
}
