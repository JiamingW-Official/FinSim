"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LeagueBadge } from "./LeagueBadge";
import type { RankedEntry, DimensionConfig } from "@/types/leaderboard";

interface RankRowProps {
 entry: RankedEntry;
 dimConfig: DimensionConfig;
 index: number;
}

/** Deterministic avatar color from seed */
const AVATAR_COLORS = [
 "bg-primary", "bg-emerald-500", "bg-amber-500", "bg-rose-500",
 "bg-primary", "bg-cyan-500", "bg-pink-500", "bg-indigo-500",
 "bg-teal-500", "bg-orange-500",
];

function getInitials(name: string): string {
 const parts = name.split(/\s+/);
 if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
 return name.slice(0, 2).toUpperCase();
}

function RankMedal({ rank }: { rank: number }) {
 if (rank === 1) {
 return (
 <span className="text-xs font-bold text-amber-400">1st</span>
 );
 }
 if (rank === 2) return <span className="text-xs font-bold text-zinc-400">2nd</span>;
 if (rank === 3) return <span className="text-xs font-bold text-amber-600">3rd</span>;
 return (
 <span className="text-xs font-semibold tabular-nums text-muted-foreground">
 {rank}
 </span>
 );
}

export function RankRow({ entry, dimConfig, index }: RankRowProps) {
 const value = dimConfig.getValue(entry);
 const formatted = dimConfig.format(value);
 const colorClass = AVATAR_COLORS[entry.avatarSeed % AVATAR_COLORS.length];

 return (
 <motion.div
 initial={{ opacity: 0, x: -12 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: index * 0.025, type: "spring" as const, stiffness: 300, damping: 25 }}
 className={cn(
 "flex items-center gap-3 rounded-md px-4 py-3 transition-colors",
 entry.isUser
 ? "rank-highlight"
 : "hover:bg-foreground/[0.02]",
 )}
 >
 {/* Rank */}
 <div className="flex w-7 shrink-0 items-center justify-center">
 <RankMedal rank={entry.rank} />
 </div>

 {/* Avatar */}
 <div
 className={cn(
 "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-primary-foreground",
 entry.isUser ? "bg-primary" : colorClass,
 )}
 >
 {entry.isUser ? "You" : getInitials(entry.name)}
 </div>

 {/* Name + meta */}
 <div className="flex flex-1 flex-col min-w-0">
 <div className="flex items-center gap-1.5">
 <span className={cn("text-sm font-semibold truncate", entry.isUser && "text-primary")}>
 {entry.name}
 </span>
 {entry.isUser && (
 <span className="shrink-0 rounded-full bg-primary/15 px-1.5 py-0.5 text-[11px] font-semibold text-primary">
 You
 </span>
 )}
 </div>
 <div className="flex items-center gap-1.5">
 <span className="text-xs text-muted-foreground">
 Lv.{entry.level} {entry.title}
 </span>
 <LeagueBadge tier={entry.league} size="sm" />
 </div>
 </div>

 {/* Stat value */}
 <div className="shrink-0 text-right">
 <span
 className={cn(
 "text-sm font-semibold tabular-nums",
 dimConfig.id === "total_pnl"
 ? value >= 0 ? "text-emerald-400" : "text-red-400"
 : dimConfig.id === "risk_control"
 ? value <= 15 ? "text-emerald-400" : value <= 30 ? "text-amber-400" : "text-red-400"
 : "text-foreground",
 )}
 >
 {formatted}
 </span>
 </div>
 </motion.div>
 );
}
