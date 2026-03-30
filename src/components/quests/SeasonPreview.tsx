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
 case "xp": return "★";
 case "title": return "T";
 case "badge": return "B";
 case "xp_boost": return "";
 default: return "?";
 }
}

function rewardColor(type: string): string {
 switch (type) {
 case "xp": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
 case "title": return "text-muted-foreground bg-cyan-500/10 border-cyan-500/20";
 case "badge": return "text-primary bg-primary/10 border-border";
 case "xp_boost": return "text-green-400 bg-green-500/10 border-green-500/20";
 default: return "text-muted-foreground bg-foreground/5 border-border";
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
 <div className="space-y-5">
 {/* Season header */}
 <motion.div
 initial={{ opacity: 0, y: -6 }}
 animate={{ opacity: 1, y: 0 }}
 className="rounded-md border border-border bg-card p-4"
 >
 <div className="flex items-start justify-between gap-3">
 <div>
 <p className="text-xs font-semibold text-muted-foreground">Season Pass</p>
 <h3 className="mt-0.5 text-sm font-semibold text-foreground">{season.name}</h3>
 </div>
 <div className="shrink-0 text-right">
 <p className="text-xs text-muted-foreground">Season pts</p>
 <p className="text-lg font-semibold tabular-nums text-foreground">{seasonXP.toLocaleString()}</p>
 </div>
 </div>

 {/* Progress to next tier */}
 {nextTierInfo && (
 <div className="mt-4 space-y-1.5">
 <div className="flex items-center justify-between text-xs">
 <span className="text-muted-foreground">Tier {currentTier} → Tier {nextTierInfo.tierNumber}</span>
 <span className="font-semibold text-foreground/70">
 {nextTierInfo.current.toLocaleString()} / {nextTierInfo.required.toLocaleString()} pts
 </span>
 </div>
 <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
 <motion.div
 className="h-full rounded-full bg-primary"
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
 <p className="mt-2 text-xs font-semibold text-primary">Max tier reached for preview!</p>
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
 "flex items-center gap-3 rounded-lg border p-3 transition-colors",
 isClaimed
 ? "border-emerald-500/15 bg-emerald-500/5"
 : canClaim
 ? "border-amber-500/25 bg-amber-500/5"
 : isCurrent
 ? "border-primary/20 bg-primary/5"
 : "border-border bg-card",
 )}
 >
 {/* Tier number */}
 <div
 className={cn(
 "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[11px] font-semibold",
 isClaimed
 ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
 : isUnlocked
 ? "border-primary/30 bg-primary/10 text-primary"
 : "border-border bg-muted text-muted-foreground",
 )}
 >
 {isClaimed ? <Check className="h-3.5 w-3.5" /> : tier.tier}
 </div>

 {/* XP threshold */}
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-1.5">
 <span
 className={cn(
 "text-[11px] font-semibold",
 isUnlocked ? "text-foreground" : "text-muted-foreground",
 )}
 >
 {tier.xpRequired.toLocaleString()} Season pts
 </span>
 {isCurrent && !isClaimed && (
 <span className="rounded px-1 py-0.5 text-[11px] font-semibold bg-primary/15 text-primary">
 Current
 </span>
 )}
 </div>
 <span
 className={cn(
 "text-xs",
 isUnlocked ? "text-muted-foreground" : "text-muted-foreground/50",
 )}
 >
 {tier.reward.label}
 </span>
 </div>

 {/* Reward pill */}
 <div
 className={cn(
 "flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold",
 isUnlocked ? rewardColor(tier.reward.type) : "text-muted-foreground/40 bg-transparent border-border",
 )}
 >
 <span>{rewardIcon(tier.reward.type)}</span>
 <span className="hidden sm:inline">{tier.reward.type === "xp" ? `+${tier.reward.value} pts` : String(tier.reward.value).slice(0, 14)}</span>
 </div>

 {/* Lock / claim */}
 {!isUnlocked && (
 <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
 )}

 {canClaim && (
 <motion.button
 type="button"
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 onClick={() => handleClaim(tier.tier, tier.reward.value)}
 className="flex shrink-0 items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
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
 className="flex items-center justify-center gap-1.5 py-2 text-[11px] text-muted-foreground"
 >
 <span>+{season.rewardTiers.length - PREVIEW_TIER_COUNT} more tiers</span>
 <ChevronRight className="h-3 w-3" />
 <span>visible in Season Progress</span>
 </motion.div>
 </div>
 );
}
