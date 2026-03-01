"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/stores/game-store";
import { getTitleForLevel } from "@/types/game";
import { Shield, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function LevelUpOverlay() {
  const lastLevelUp = useGameStore((s) => s.lastLevelUp);
  const clearLevelUp = useGameStore((s) => s.clearLevelUp);
  const [show, setShow] = useState(false);
  const [levelNum, setLevelNum] = useState<number | null>(null);

  useEffect(() => {
    if (lastLevelUp === null) return;
    setLevelNum(lastLevelUp);
    setShow(true);

    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(clearLevelUp, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [lastLevelUp, clearLevelUp]);

  if (!show || levelNum === null) return null;

  const title = getTitleForLevel(levelNum);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
      <div className="level-up-entrance relative flex flex-col items-center gap-3 rounded-xl border border-primary/30 bg-card px-10 py-8 shadow-2xl">
        {/* Sparkles */}
        <Sparkles className="level-up-sparkle absolute -top-3 -left-3 h-6 w-6 text-amber-400" />
        <Sparkles className="level-up-sparkle absolute -top-2 -right-4 h-5 w-5 text-primary" style={{ animationDelay: "0.3s" }} />
        <Sparkles className="level-up-sparkle absolute -bottom-2 -right-3 h-4 w-4 text-amber-400" style={{ animationDelay: "0.6s" }} />

        <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
          Level Up!
        </span>

        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-3xl font-black tabular-nums text-foreground">
            {levelNum}
          </span>
        </div>

        <span className={cn(
          "text-sm font-semibold",
          "bg-gradient-to-r from-primary to-emerald-300 bg-clip-text text-transparent",
        )}>
          {title}
        </span>

        <p className="text-[10px] text-muted-foreground">
          Keep trading to unlock new titles!
        </p>
      </div>
    </div>
  );
}
