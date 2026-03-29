"use client";

import { motion } from "framer-motion";
import { Star, Check, Lock, ChevronRight, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentSeason, getSeasonTier, getNextTierXP } from "@/data/seasons/current-season";
import { useSeasonStore } from "@/stores/season-store";
import { useGameStore } from "@/stores/game-store";

// ── Only show 10 tiers (first half) for the tease ───────────────

const PREVIEW_TIER_COUNT = 10;

function rewardIcon(type: string): string {
  switch (type) {
    case "xp":       return "★";
    case "title":    return "T";
    case "badge":    return "B";
    case "xp_boost": return "⚡";
    default:         return "?";
  }
}

function rewardColor(type: string): string {
  switch (type) {
    case "xp":       return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "title":    return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
    case "badge":    return "text-violet-400 bg-violet-500/10 border-violet-500/20";
    case "xp_boost": return "text-green-400 bg-green-500/10 border-green-500/20";
    default:         return "text-zinc-400 bg-white/5 border-white/10";
  }
}

export function SeasonPreview() {
  const season = getCurrentSeason();
  const seasonXP = useSeasonStore((s) => s.progress.seasonXP);
  const highestTierClaimed = useSeasonStore((s) => s.progress.highestTierClaimed);
  const claimRewardTier = useSeasonStore((s) => s.claimRewardTier);
  const awardXP = useGameStore((s) => s.awardXP);

  const currentTier = getSeasonTier(seasonXP);
  const nextTierInfo = getNextTierXP(seasonXP);

  const tiers = season.rewardTiers.slice(0, PREVIEW_TIER_COUNT);

  function handleClaim(tier: number, xpValue: number | string) {
    claimRewardTier(tier);
    if (typeof xpValue === "number") {
      awardXP(xpValue);
    }
  }

  return (
    <div className="space-y-4">
      {/* Season header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-zinc-600">Season Pass</p>
            <h3 className="mt-0.5 text-sm font-bold text-zinc-100">{season.name}</h3>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs text-zinc-600">Season XP</p>
            <p className="text-lg font-bold tabular-nums text-zinc-200">{seasonXP.toLocaleString()}</p>
          </div>
        </div>

        {/* Progress to next tier */}
        {nextTierInfo && (
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-600">Tier {currentTier} → Tier {nextTierInfo.tierNumber}</span>
              <span className="font-bold text-zinc-400">
                {nextTierInfo.current.toLocaleString()} / {nextTierInfo.required.toLocaleString()} XP
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
              <motion.div
                className="h-full rounded-full bg-cyan-500"
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(100, (nextTierInfo.current / nextTierInfo.required) * 100)}%`,
                }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {!nextTierInfo && (
          <p className="mt-2 text-xs font-bold text-amber-400">Max tier reached for preview!</p>
        )}
      </motion.div>

      {/* Tier list */}
      <div className="space-y-2">
        {tiers.map((tier, i) => {
          const isUnlocked = seasonXP >= tier.xpRequired;
          const isCurrent = tier.tier === currentTier + 1 || (currentTier === 0 && tier.tier === 1);
          const isClaimed = highestTierClaimed >= tier.tier;
          const canClaim = isUnlocked && !isClaimed;

          return (
            <motion.div
              key={tier.tier}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 transition-all",
                isClaimed
                  ? "border-green-500/15 bg-green-500/5"
                  : canClaim
                    ? "border-amber-500/25 bg-amber-500/5"
                    : isCurrent
                      ? "border-cyan-500/20 bg-cyan-500/5"
                      : "border-white/5 bg-white/[0.01]",
              )}
            >
              {/* Tier number */}
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[11px] font-bold",
                  isClaimed
                    ? "border-green-500/30 bg-green-500/15 text-green-400"
                    : isUnlocked
                      ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                      : "border-zinc-800 bg-zinc-900 text-zinc-700",
                )}
              >
                {isClaimed ? <Check className="h-3.5 w-3.5" /> : tier.tier}
              </div>

              {/* XP threshold */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "text-[11px] font-bold",
                      isUnlocked ? "text-zinc-300" : "text-zinc-700",
                    )}
                  >
                    {tier.xpRequired.toLocaleString()} Season XP
                  </span>
                  {isCurrent && !isClaimed && (
                    <span className="rounded px-1 py-0.5 text-[11px] font-bold bg-cyan-500/15 text-cyan-400 uppercase tracking-wide">
                      Current
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs",
                    isUnlocked ? "text-zinc-500" : "text-zinc-800",
                  )}
                >
                  {tier.reward.label}
                </span>
              </div>

              {/* Reward pill */}
              <div
                className={cn(
                  "flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold",
                  isUnlocked ? rewardColor(tier.reward.type) : "text-zinc-800 bg-transparent border-zinc-800",
                )}
              >
                <span>{rewardIcon(tier.reward.type)}</span>
                <span className="hidden sm:inline">{tier.reward.type === "xp" ? `+${tier.reward.value} XP` : String(tier.reward.value).slice(0, 14)}</span>
              </div>

              {/* Lock / claim */}
              {!isUnlocked && (
                <Lock className="h-3.5 w-3.5 shrink-0 text-zinc-800" />
              )}

              {canClaim && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleClaim(tier.tier, tier.reward.value)}
                  className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1.5 text-xs font-bold text-black shadow-sm transition-colors hover:bg-amber-400"
                >
                  <Gift className="h-3 w-3" />
                  Claim
                </motion.button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* More tiers hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-1.5 py-2 text-[11px] text-zinc-700"
      >
        <span>+{season.rewardTiers.length - PREVIEW_TIER_COUNT} more tiers</span>
        <ChevronRight className="h-3 w-3" />
        <span>visible in Season Progress</span>
      </motion.div>
    </div>
  );
}
