"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { useSeasonStore } from "@/stores/season-store";
import { getCurrentSeason, getSeasonDaysRemaining, getSeasonTier, getNextTierXP } from "@/data/seasons/current-season";

interface SeasonBannerProps {
  expanded: boolean;
  onToggle: () => void;
}

export function SeasonBanner({ expanded, onToggle }: SeasonBannerProps) {
  const progress = useSeasonStore((s) => s.progress);
  const season = getCurrentSeason();
  const daysLeft = getSeasonDaysRemaining();
  const currentTier = getSeasonTier(progress.seasonXP);
  const nextTier = getNextTierXP(progress.seasonXP);

  // Progress within current tier
  const currentTierXP = currentTier > 0 ? season.rewardTiers[currentTier - 1]?.xpRequired ?? 0 : 0;
  const nextTierXP = nextTier?.required ?? currentTierXP;
  const tierRange = nextTierXP - currentTierXP;
  const progressPercent = nextTier && tierRange > 0
    ? ((progress.seasonXP - currentTierXP) / tierRange) * 100
    : 100;

  // Days left display
  const daysDisplay = daysLeft <= 0
    ? "Last day!"
    : daysLeft === 1
      ? "1 day left"
      : `${daysLeft}d left`;
  const daysUrgent = daysLeft <= 3;

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
      className="w-full rounded-xl border border-amber-500/20 bg-card p-3 text-left transition-colors hover:bg-muted/50"
    >
      <div className="flex items-center gap-3">
        {/* Season icon */}
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-lg">
          🏆
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-amber-300 truncate">{season.name}</h3>
            <span className={cn(
              "text-xs font-bold",
              currentTier >= 20 ? "text-amber-400" : "text-zinc-600",
            )}>
              Tier {currentTier}/20
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full rounded-full bg-amber-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          <div className="mt-1 flex items-center gap-2 text-xs">
            <span className="text-amber-400/70 tabular-nums">{progress.seasonXP} XP</span>
            {nextTier && (
              <span className="text-zinc-600">/ {nextTier.required} for Tier {nextTier.tierNumber}</span>
            )}
            {currentTier >= 20 && (
              <span className="text-amber-400 font-bold">MAX TIER</span>
            )}
          </div>
        </div>

        {/* Days left + toggle */}
        <div className="flex flex-col items-end gap-1">
          <div className={cn(
            "flex items-center gap-1 text-xs",
            daysUrgent ? "text-red-400 font-bold" : "text-zinc-500",
          )}>
            <Calendar className="h-3 w-3" />
            {daysDisplay}
          </div>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-3.5 w-3.5 text-zinc-600" />
          </motion.div>
        </div>
      </div>
    </motion.button>
  );
}
