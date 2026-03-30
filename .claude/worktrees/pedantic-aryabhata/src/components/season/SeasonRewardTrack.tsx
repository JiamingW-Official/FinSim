"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, Lock, ChevronLeft, ChevronRight } from "lucide-react";
import { useSeasonStore } from "@/stores/season-store";
import { getCurrentSeason, getSeasonTier } from "@/data/seasons/current-season";
import { soundEngine } from "@/services/audio/sound-engine";

export function SeasonRewardTrack() {
 const progress = useSeasonStore((s) => s.progress);
 const claimRewardTier = useSeasonStore((s) => s.claimRewardTier);
 const season = getCurrentSeason();
 const currentTier = getSeasonTier(progress.seasonXP);
 const scrollRef = useRef<HTMLDivElement>(null);

 const handleClaim = (tier: number) => {
 claimRewardTier(tier);
 soundEngine.playSeasonClaim();
 };

 // Auto-scroll to current tier on mount
 useEffect(() => {
 if (!scrollRef.current) return;
 const nodeWidth = 48 + 16; // w-12 + w-4 connector
 const scrollTo = Math.max(0, currentTier * nodeWidth - scrollRef.current.clientWidth / 2);
 scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
 }, [currentTier]);

 return (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: "auto" }}
 exit={{ opacity: 0, height: 0 }}
 className="relative overflow-hidden"
 >
 {/* Scroll hint gradients */}
 <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-8 items-center bg-gradient-to-r from-background to-transparent">
 <ChevronLeft className="h-4 w-4 text-muted-foreground" />
 </div>
 <div className="pointer-events-none absolute inset-y-0 right-0 z-10 flex w-8 items-center justify-end bg-gradient-to-l from-background to-transparent">
 <ChevronRight className="h-4 w-4 text-muted-foreground" />
 </div>

 <div
 ref={scrollRef}
 className="flex gap-0 overflow-x-auto py-4 px-6 scrollbar-hide"
 >
 {season.rewardTiers.map((tier, i) => {
 const isClaimed = tier.tier <= progress.highestTierClaimed;
 const isAvailable = !isClaimed && progress.seasonXP >= tier.xpRequired;
 const isLocked = !isClaimed && !isAvailable;
 const isCurrent = tier.tier === currentTier + 1;

 return (
 <div key={tier.tier} className="flex items-center">
 {/* Connector line */}
 {i > 0 && (
 <div
 className={cn(
 "h-0.5 w-4 shrink-0",
 isClaimed ? "bg-primary/50" : isAvailable ? "bg-primary/30" : "bg-border",
 )}
 />
 )}

 {/* Tier node */}
 <div className="group relative">
 <motion.button
 disabled={!isAvailable}
 onClick={() => isAvailable && handleClaim(tier.tier)}
 whileHover={isAvailable ? { scale: 1.1 } : {}}
 whileTap={isAvailable ? { scale: 0.95 } : {}}
 className={cn(
 "season-tier-unlock relative flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-md border-2 transition-colors",
 isClaimed
 ? "border-primary/50 bg-primary/10 text-primary"
 : isAvailable
 ? "border-primary bg-primary/20 text-primary cursor-pointer"
 : isCurrent
 ? "border-border bg-muted/50 text-muted-foreground"
 : "border-border bg-muted/30 text-muted-foreground/50 cursor-not-allowed",
 )}
 >
 {isClaimed ? (
 <Check className="h-4 w-4" />
 ) : isLocked ? (
 <Lock className="h-3 w-3" />
 ) : (
 <span className="text-sm">{tier.reward.icon}</span>
 )}
 <span className="text-[11px] font-semibold mt-0.5">{tier.tier}</span>
 </motion.button>

 {/* Tooltip on hover — group class on parent div enables group-hover */}
 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
 <div className="rounded-lg border border-border bg-card px-3 py-2 whitespace-nowrap text-center">
 <p className="text-xs font-semibold text-foreground">{tier.reward.label}</p>
 <p className="text-[11px] text-muted-foreground mt-0.5">{tier.xpRequired} pts required</p>
 </div>
 </div>
 </div>
 </div>
 );
 })}
 {/* Padding at end for scroll */}
 <div className="w-6 shrink-0" />
 </div>
 </motion.div>
 );
}
