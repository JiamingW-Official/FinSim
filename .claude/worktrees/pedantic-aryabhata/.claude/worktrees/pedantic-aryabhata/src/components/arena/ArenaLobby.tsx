"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
 Zap, TrendingUp, Shield, RefreshCw, Target,
 Trophy, Crosshair, Flame,
} from "lucide-react";
import { ArenaRankBadge } from "./ArenaRankBadge";
import { ARENA_TYPES } from "@/data/arena/arena-config";
import { useArenaStore } from "@/stores/arena-store";
import type { ArenaType, ArenaTypeConfig } from "@/types/arena";

const ARENA_ICONS: Record<string, React.ReactNode> = {
 Zap: <Zap className="h-5 w-5" />,
 TrendingUp: <TrendingUp className="h-5 w-5" />,
 Shield: <Shield className="h-5 w-5" />,
 RefreshCw: <RefreshCw className="h-5 w-5" />,
 Target: <Target className="h-5 w-5" />,
};

const WEIGHT_COLORS: Record<string, string> = {
 pnl: "bg-emerald-500/40",
 riskControl: "bg-primary/40",
 efficiency: "bg-amber-500/40",
 speed: "bg-red-500/40",
};

interface ArenaLobbyProps {
 onSelectType: (config: ArenaTypeConfig) => void;
}

export function ArenaLobby({ onSelectType }: ArenaLobbyProps) {
 const elo = useArenaStore((s) => s.elo);
 const rank = useArenaStore((s) => s.rank);
 const totalMatches = useArenaStore((s) => s.totalMatches);
 const totalWins = useArenaStore((s) => s.totalWins);
 const currentStreak = useArenaStore((s) => s.currentStreak);
 const bestStreak = useArenaStore((s) => s.bestStreak);
 const typeStats = useArenaStore((s) => s.typeStats);

 const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

 return (
 <div className="space-y-6">
 {/* Player stats banner */}
 <motion.div
 initial={{ opacity: 0, y: -12 }}
 animate={{ opacity: 1, y: 0 }}
 className="rounded-lg bg-card border border-border p-3 text-xs"
 >
 <div className="flex items-center gap-4">
 <ArenaRankBadge rank={rank} size="lg" />

 <div className="flex-1">
 <div className="flex items-baseline gap-2">
 <span className="text-2xl font-semibold tabular-nums text-foreground">{elo}</span>
 <span className="text-xs text-muted-foreground">ELO</span>
 </div>
 {totalMatches === 0 && (
 <p className="text-xs text-muted-foreground/70 mt-0.5">Play your first match to start ranking!</p>
 )}
 </div>

 <div className="flex items-center gap-4 text-xs">
 <div className="text-center">
 <div className="font-semibold tabular-nums text-foreground">{totalWins}/{totalMatches}</div>
 <div className="text-muted-foreground/70">W/L</div>
 </div>
 <div className="text-center">
 <div className="font-semibold tabular-nums text-foreground">{winRate}%</div>
 <div className="text-muted-foreground/70">Win Rate</div>
 </div>
 {currentStreak > 0 && (
 <motion.div
 className="text-center"
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 transition={{ type: "spring", stiffness: 400, damping: 15 }}
 >
 <div className="flex items-center gap-0.5 font-semibold tabular-nums text-orange-400">
 <Flame className="h-3 w-3" />
 {currentStreak}
 </div>
 <div className="text-muted-foreground/70">Streak</div>
 </motion.div>
 )}
 {bestStreak > 0 && currentStreak === 0 && (
 <div className="text-center">
 <div className="font-semibold tabular-nums text-muted-foreground">{bestStreak}</div>
 <div className="text-muted-foreground/70">Best</div>
 </div>
 )}
 </div>
 </div>
 </motion.div>

 {/* Arena type cards */}
 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
 {ARENA_TYPES.map((config, i) => {
 const stats = typeStats[config.id as ArenaType];
 return (
 <motion.button
 type="button"
 key={config.id}
 initial={{ opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.05 }}
 whileHover={{ y: -2, scale: 1.01 }}
 whileTap={{ scale: 0.98 }}
 onClick={() => onSelectType(config)}
 className={cn(
 "group relative overflow-hidden rounded-lg p-4 text-left cursor-pointer",
 "hover:bg-muted/20 transition-colors duration-150",
 "border border-border",
 )}
 >
 {/* Colored top accent */}
 <div className={cn("absolute inset-x-0 top-0 h-0.5", config.bgColor.replace("/10", "/50"))} />

 {/* Icon + title */}
 <div className="flex items-center gap-3 mb-2">
 <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", config.bgColor, config.color)}>
 {ARENA_ICONS[config.icon] ?? <Crosshair className="h-5 w-5" />}
 </div>
 <div>
 <h3 className={cn("text-sm font-semibold", config.color)}>{config.name}</h3>
 <span className="text-xs text-muted-foreground/70">{config.timeLimitSeconds}s</span>
 </div>
 </div>

 <p className="text-xs text-muted-foreground mb-3">{config.description}</p>

 {/* Scoring weights mini-bar */}
 <div className="space-y-1">
 {Object.entries(config.scoringWeights).map(([key, weight]) => (
 <div key={key} className="flex items-center gap-2">
 <span className="text-[11px] w-12 text-muted-foreground/70 capitalize">{key === "riskControl" ? "Risk" : key}</span>
 <div className="flex-1 h-1 rounded-full bg-foreground/5">
 <motion.div
 className={cn("h-full rounded-full", WEIGHT_COLORS[key] ?? "bg-muted")}
 initial={{ width: 0 }}
 animate={{ width: `${weight * 100}%` }}
 transition={{ duration: 0.4, delay: i * 0.05 + 0.2 }}
 />
 </div>
 </div>
 ))}
 </div>

 {/* Stats if played */}
 {stats && stats.matches > 0 && (
 <div className="mt-3 pt-2 border-t border-border flex items-center gap-3 text-xs text-muted-foreground">
 <span>{stats.wins}/{stats.matches} W</span>
 <span className="text-muted-foreground/70">|</span>
 <span>Best: {stats.bestScore}</span>
 </div>
 )}

 {/* Hover CTA */}
 <div className="absolute inset-x-0 bottom-0 flex items-center justify-center rounded-b-xl bg-gradient-to-t from-black/40 to-transparent py-3 opacity-0 transition-opacity group-hover:opacity-100">
 <span className={cn("flex items-center gap-1.5 text-xs font-semibold", config.color)}>
 <Crosshair className="h-3 w-3" />
 Find Match
 </span>
 </div>
 </motion.button>
 );
 })}
 </div>

 {/* Recent matches */}
 {totalMatches > 0 && <RecentMatches />}
 </div>
 );
}

function RecentMatches() {
 const history = useArenaStore((s) => s.matchHistory);
 const recent = history.slice(0, 5);

 if (recent.length === 0) return null;

 return (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="bg-transparent p-0"
 >
 <h3 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
 <Trophy className="h-3 w-3" />
 Recent Matches
 </h3>

 <div className="divide-y divide-border/20">
 {recent.map((m, i) => (
 <motion.div
 key={m.matchId}
 initial={{ opacity: 0, x: -8 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: i * 0.03 }}
 className="flex items-center gap-3 py-1.5 text-xs"
 >
 <span className={cn(
 "flex h-5 w-5 items-center justify-center rounded text-xs font-semibold",
 m.playerWon ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400",
 )}>
 {m.playerWon ? "W" : "L"}
 </span>
 <span className="text-muted-foreground flex-1 truncate">vs {m.opponentName}</span>
 <span className="text-muted-foreground/70 tabular-nums">{m.playerScore} - {m.opponentScore}</span>
 <span className={cn("tabular-nums font-semibold", m.eloChange >= 0 ? "text-emerald-400" : "text-red-400")}>
 {m.eloChange >= 0 ? "+" : ""}{m.eloChange}
 </span>
 </motion.div>
 ))}
 </div>
 </motion.div>
 );
}
