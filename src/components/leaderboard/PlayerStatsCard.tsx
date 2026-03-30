"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Trophy, TrendingUp, Target, Flame, Award } from "lucide-react";
import { LeagueBadge } from "./LeagueBadge";
import { useGameStore } from "@/stores/game-store";
import { useTradingStore } from "@/stores/trading-store";
import { getLeagueForLevel } from "@/types/leaderboard";
import { INITIAL_CAPITAL } from "@/types/trading";
import { getXPForNextLevel } from "@/types/game";

export function PlayerStatsCard() {
 const xp = useGameStore((s) => s.xp);
 const level = useGameStore((s) => s.level);
 const title = useGameStore((s) => s.title);
 const stats = useGameStore((s) => s.stats);
 const achievements = useGameStore((s) => s.achievements);
 const portfolioValue = useTradingStore((s) => s.portfolioValue);

 const league = getLeagueForLevel(level);
 const totalPnL = portfolioValue - INITIAL_CAPITAL;
 const winRate = stats.totalTrades > 0 ? (stats.profitableTrades / stats.totalTrades) * 100 : 0;
 const nextLevelXP = getXPForNextLevel(level);
 const xpProgress = level >= 50 ? 1 : xp / nextLevelXP;
 const unlockedCount = achievements.filter((a) => a.unlockedAt > 0).length;

 const statItems = [
 {
 label: "Total P&L",
 value: `${totalPnL >= 0 ? "+" : ""}$${Math.abs(totalPnL).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
 color: totalPnL >= 0 ? "text-emerald-400" : "text-red-400",
 icon: TrendingUp,
 },
 {
 label: "Win Rate",
 value: `${winRate.toFixed(1)}%`,
 color: winRate >= 50 ? "text-emerald-400" : "text-muted-foreground",
 icon: Target,
 },
 {
 label: "Win Streak",
 value: `${stats.consecutiveWins}`,
 color: stats.consecutiveWins >= 5 ? "text-amber-400" : "text-muted-foreground",
 icon: Flame,
 },
 {
 label: "Achievements",
 value: `${unlockedCount}`,
 color: unlockedCount >= 5 ? "text-primary" : "text-muted-foreground",
 icon: Award,
 },
 ];

 return (
 <motion.div
 className={cn(
 "card-hover-glow rounded-md border p-4",
 league === "alpha" || league === "diamond"
 ? "border-primary/20"
 : "border-border bg-card/50",
 )}
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ type: "spring" as const, stiffness: 300, damping: 25 }}
 >
 {/* Top row: avatar + info */}
 <div className="flex items-center gap-3">
 {/* Avatar */}
 <motion.div
 className={cn(
 "flex h-12 w-12 shrink-0 items-center justify-center rounded-md text-xl font-semibold text-primary-foreground bg-primary",
 (league === "alpha" || league === "diamond") && "rotating-border",
 )}
 initial={{ scale: 0, rotate: -15 }}
 animate={{ scale: 1, rotate: 0 }}
 transition={{ type: "spring" as const, stiffness: 400, damping: 15 }}
 >
 
 </motion.div>

 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2">
 <span className="text-sm font-semibold">You</span>
 <LeagueBadge tier={league} size="sm" />
 </div>
 <div className="text-[11px] text-muted-foreground">
 Lv.{level} {title}
 </div>
 {/* XP progress bar */}
 <div className="mt-1.5 flex items-center gap-2">
 <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
 <motion.div
 className="h-full rounded-full bg-primary"
 initial={{ width: 0 }}
 animate={{ width: `${Math.min(xpProgress * 100, 100)}%` }}
 transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
 />
 </div>
 <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">
 {xp.toLocaleString()} pts
 </span>
 </div>
 </div>
 </div>

 {/* Stats grid */}
 <div className="mt-3 grid grid-cols-4 gap-2">
 {statItems.map((item, i) => (
 <motion.div
 key={item.label}
 className="flex flex-col items-center gap-0.5 rounded-lg bg-muted/15 px-2 py-2"
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.2 + i * 0.06 }}
 >
 <item.icon className="h-3.5 w-3.5 text-muted-foreground/50" />
 <span className={cn("text-sm font-semibold tabular-nums", item.color)}>
 {item.value}
 </span>
 <span className="text-[11px] font-semibold text-muted-foreground/60">
 {item.label}
 </span>
 </motion.div>
 ))}
 </div>
 </motion.div>
 );
}
