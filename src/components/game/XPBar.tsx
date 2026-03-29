"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/stores/game-store";
import { getXPForNextLevel, LEVEL_THRESHOLDS } from "@/types/game";
import { cn } from "@/lib/utils";
import { soundEngine } from "@/services/audio/sound-engine";

export function XPBar() {
  const xp = useGameStore((s) => s.xp);
  const level = useGameStore((s) => s.level);
  const lastXPGain = useGameStore((s) => s.lastXPGain);
  const clearXPGain = useGameStore((s) => s.clearXPGain);
  const [floatXP, setFloatXP] = useState<number | null>(null);
  const [pulse, setPulse] = useState(false);

  const currentLevelXP = level > 1 ? LEVEL_THRESHOLDS[level - 2] : 0;
  const nextLevelXP = getXPForNextLevel(level);
  const progressXP = xp - currentLevelXP;
  const neededXP = nextLevelXP - currentLevelXP;
  const percent = level >= 50 ? 100 : Math.min((progressXP / neededXP) * 100, 100);

  useEffect(() => {
    if (lastXPGain === null) return;
    setFloatXP(lastXPGain);
    setPulse(true);
    soundEngine.playXP();
    const timer = setTimeout(() => {
      setFloatXP(null);
      setPulse(false);
      clearXPGain();
    }, 1200);
    return () => clearTimeout(timer);
  }, [lastXPGain, clearXPGain]);

  return (
    <div className="relative flex items-center gap-2">
      <span className="text-xs tabular-nums text-muted-foreground">
        Lv.{level}
      </span>
      <div
        className={cn(
          "relative h-1.5 w-20 overflow-hidden rounded-full bg-muted",
          pulse && "xp-bar-pulse",
        )}
      >
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-colors duration-300 ease-out",
            "bg-primary/60",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">
        {progressXP}/{neededXP} pts
      </span>
      {floatXP !== null && (
        <span className="xp-float-up absolute -top-4 left-1/2 -translate-x-1/2 text-xs font-semibold text-emerald-400">
          +{floatXP} pts
        </span>
      )}
    </div>
  );
}
