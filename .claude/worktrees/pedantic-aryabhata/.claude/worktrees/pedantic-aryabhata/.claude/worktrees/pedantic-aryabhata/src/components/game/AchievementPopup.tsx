"use client";

import { useEffect } from "react";
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
import { motion, AnimatePresence } from "framer-motion";
import { soundEngine } from "@/services/audio/sound-engine";

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

  const current = pendingAchievements[0];

  useEffect(() => {
    if (!current) return;
    soundEngine.playAchievement();

    const dismissTimer = setTimeout(() => {
      dismissAchievement();
    }, 4000);

    return () => clearTimeout(dismissTimer);
  }, [current, dismissAchievement]);

  const IconComponent = current ? (ICON_MAP[current.icon] ?? Trophy) : Trophy;

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="fixed bottom-12 right-4 z-50"
        >
          <div
            className="relative flex items-center gap-3 rounded-md border border-amber-500/30 bg-card px-4 py-3 cursor-pointer"
            onClick={dismissAchievement}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
              <IconComponent className="h-5 w-5 text-amber-500/80" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Trophy className="h-3 w-3 text-amber-500" />
                <span className="text-xs font-medium text-amber-500">
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
                <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-xs font-medium tabular-nums text-amber-400">
                  {achievements.length}/12
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
