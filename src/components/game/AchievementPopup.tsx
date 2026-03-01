"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/stores/game-store";
import {
  Trophy,
  Zap,
  TrendingUp,
  TrendingDown,
  Flame,
  BarChart3,
  Award,
  Target,
  DollarSign,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  Trophy,
  Zap,
  TrendingUp,
  TrendingDown,
  Flame,
  BarChart3,
  Award,
  Target,
  DollarSign,
  Layers,
};

export function AchievementPopup() {
  const pendingAchievements = useGameStore((s) => s.pendingAchievements);
  const achievements = useGameStore((s) => s.achievements);
  const dismissAchievement = useGameStore((s) => s.dismissAchievement);
  const [visible, setVisible] = useState(false);

  const current = pendingAchievements[0];

  useEffect(() => {
    if (!current) {
      setVisible(false);
      return;
    }

    // Animate in
    const showTimer = setTimeout(() => setVisible(true), 50);

    // Auto-dismiss after 4s
    const dismissTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(dismissAchievement, 300); // Wait for exit animation
    }, 4000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, [current, dismissAchievement]);

  if (!current) return null;

  const IconComponent = ICON_MAP[current.icon] ?? Trophy;

  return (
    <div
      className={cn(
        "fixed bottom-12 right-4 z-50 transition-all duration-300",
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-8 opacity-0",
      )}
    >
      <div
        className="achievement-glow achievement-confetti relative flex items-center gap-3 rounded-lg border border-amber-500/30 bg-card px-4 py-3 shadow-lg"
        onClick={() => {
          setVisible(false);
          setTimeout(dismissAchievement, 300);
        }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15">
          <IconComponent className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <Trophy className="h-3 w-3 text-amber-500" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-amber-500">
              Achievement Unlocked
            </span>
          </div>
          <div className="text-sm font-semibold text-foreground">
            {current.name}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {current.description}
            </span>
            <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-amber-400">
              {achievements.length}/9
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
