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
    <div className="rounded-md border border-border bg-card p-3">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Crown className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">{season.name}</span>
        </div>
        <span className="text-xs font-semibold tabular-nums text-muted-foreground">
          Tier {currentTier}/{totalTiers}
        </span>
      </div>

      {/* Progress bar to next tier */}
      <div className="mb-1 h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(tierProgress, 100)}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      {/* XP text */}
      <div className="mb-2 flex items-center justify-between text-[11px] tabular-nums">
        <span className="text-primary/70">{progress.seasonXP} pts</span>
        {nextTier ? (
          <span className="text-muted-foreground">
            {nextTier.required} pts for Tier {nextTier.tierNumber}
          </span>
        ) : (
          <span className="flex items-center gap-0.5 text-primary">
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
                ? "bg-primary"
                : t.tier <= currentTier
                  ? "bg-primary/40"
                  : "bg-muted",
            )}
          />
        ))}
      </div>
    </div>
  );
}
