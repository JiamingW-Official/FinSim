"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Calendar, ChevronDown, ChevronUp, Star } from "lucide-react";
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
 className="w-full rounded-md border border-border bg-card p-3 text-left transition-colors hover:bg-muted/50"
 >
 <div className="flex items-center gap-3">
 {/* Season icon */}
 <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-lg">
 <Star className="h-4 w-4 text-primary" />
 </div>

 {/* Info */}
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2">
 <h3 className="text-xs font-semibold text-foreground truncate">{season.name}</h3>
 <span className={cn(
 "text-xs font-semibold",
 currentTier >= 20 ? "text-primary" : "text-muted-foreground",
 )}>
 Tier {currentTier}/20
 </span>
 </div>

 {/* Progress bar */}
 <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
 <motion.div
 className="h-full rounded-full bg-primary"
 initial={{ width: 0 }}
 animate={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
 transition={{ duration: 0.5, ease: "easeOut" }}
 />
 </div>

 <div className="mt-1 flex items-center gap-2 text-xs">
 <span className="text-primary/70 tabular-nums">{progress.seasonXP} pts</span>
 {nextTier && (
 <span className="text-muted-foreground">/ {nextTier.required} for Tier {nextTier.tierNumber}</span>
 )}
 {currentTier >= 20 && (
 <span className="text-primary font-semibold">MAX TIER</span>
 )}
 </div>
 </div>

 {/* Days left + toggle */}
 <div className="flex flex-col items-end gap-1">
 <div className={cn(
 "flex items-center gap-1 text-xs",
 daysUrgent ? "text-red-400 font-semibold" : "text-muted-foreground",
 )}>
 <Calendar className="h-3 w-3" />
 {daysDisplay}
 </div>
 <motion.div
 animate={{ rotate: expanded ? 180 : 0 }}
 transition={{ duration: 0.2 }}
 >
 <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
 </motion.div>
 </div>
 </div>
 </motion.button>
 );
}
