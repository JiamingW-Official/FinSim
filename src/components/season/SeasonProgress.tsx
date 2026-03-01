"use client";

import { motion } from "framer-motion";
import { Crown, Sparkles } from "lucide-react";
import { useSeasonStore } from "@/stores/season-store";
import { getCurrentSeason, getSeasonTier, getNextTierXP } from "@/data/seasons/current-season";
import { cn } from "@/lib/utils";

export function SeasonProgress() {
  const progress = useSeasonStore((s) => s.progress);
  const season = getCurrentSeason();
  const currentTier = getSeasonTier(progress.seasonXP);
  const nextTier = getNextTierXP(progress.seasonXP);
  const totalTiers = season.rewardTiers.length;

  // Progress between current and next tier
  const currentTierXP = currentTier > 0
    ? (season.rewardTiers.find((t) => t.tier === currentTier)?.xpRequired ?? 0)
    : 0;
  const nextTierXP = nextTier?.required ?? currentTierXP;
  const tierProgress = nextTier
    ? ((progress.seasonXP - currentTierXP) / (nextTierXP - currentTierXP)) * 100
    : 100;

  return (
    <div className="card-hover-glow rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-card p-3">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Crown className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-xs font-bold text-amber-300">{season.name}</span>
        </div>
        <span className="text-[10px] font-bold tabular-nums text-muted-foreground">
          Tier {currentTier}/{totalTiers}
        </span>
      </div>

      {/* Progress bar to next tier */}
      <div className="mb-1 h-2 overflow-hidden rounded-full bg-muted/20">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(tierProgress, 100)}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      {/* XP text */}
      <div className="mb-2 flex items-center justify-between text-[9px] tabular-nums">
        <span className="text-amber-400/70">{progress.seasonXP} XP</span>
        {nextTier ? (
          <span className="text-muted-foreground">
            {nextTier.required} XP for Tier {nextTier.tierNumber}
          </span>
        ) : (
          <span className="flex items-center gap-0.5 text-amber-400">
            <Sparkles className="h-2.5 w-2.5" />
            Max Tier!
          </span>
        )}
      </div>

      {/* Mini tier dots */}
      <div className="flex gap-[3px]">
        {season.rewardTiers.map((t) => (
          <div
            key={t.tier}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              t.tier <= progress.highestTierClaimed
                ? "bg-amber-500"
                : t.tier <= currentTier
                  ? "bg-amber-500/40"
                  : "bg-muted/15",
            )}
          />
        ))}
      </div>
    </div>
  );
}
