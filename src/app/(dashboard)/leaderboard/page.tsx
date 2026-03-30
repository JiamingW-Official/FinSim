"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
 Trophy, DollarSign, Target, TrendingUp, Flame,
 Zap, ShieldCheck, Star, Crown, Medal, Gem, Lightbulb,
 Users, BarChart2, Lock, ChevronUp, ChevronDown,
} from "lucide-react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { PlayerStatsCard } from "@/components/leaderboard/PlayerStatsCard";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { LeagueBadge } from "@/components/leaderboard/LeagueBadge";
import { BeatTheBestPanel } from "@/components/leaderboard/BeatTheBestPanel";
import { SeasonBanner } from "@/components/season/SeasonBanner";
import { SeasonRewardTrack } from "@/components/season/SeasonRewardTrack";
import { DIMENSIONS, LEAGUES, getLeagueForLevel } from "@/types/leaderboard";
import { useGameStore } from "@/stores/game-store";
import { useTradingStore } from "@/stores/trading-store";
import { INITIAL_CAPITAL } from "@/types/trading";
import { ACHIEVEMENT_DEFS } from "@/types/game";
import type { LeaderboardDimension, LeagueTier, RankedEntry } from "@/types/leaderboard";

// ── Types ─────────────────────────────────────────────────────────────────────

type MainTab = "global" | "friends" | "stats" | "trophies";
type TimePeriod = "week" | "month" | "all";


const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
 DollarSign,
 Target,
 TrendingUp,
 Flame,
 Zap,
 ShieldCheck,
 Star,
};

const TIPS = [
 "Consistency beats luck — small daily wins compound into big results.",
 "The best traders manage risk first and profit second.",
 "Focus on your win rate — even small edges add up over time.",
 "A good Sharpe ratio means higher returns per unit of risk.",
 "Don't chase losses. Stick to your strategy and stay disciplined.",
 "Diversify across tickers to reduce your max drawdown.",
];

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

function seededRng(seed: number) {
 let s = seed === 0 ? 1 : Math.abs(seed);
 return () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
 };
}

// ── Synthetic friends data ────────────────────────────────────────────────────

const FRIEND_NAMES = ["Alex Chen", "Maya Patel", "Jordan Kim", "Sam Rivera", "Taylor Wu"];

interface FriendEntry {
 id: string;
 name: string;
 level: number;
 portfolioValue: number;
 returnPct: number;
 winRate: number;
 trades: number;
 avatarSeed: number;
 league: LeagueTier;
}

function generateFriends(): FriendEntry[] {
 return FRIEND_NAMES.map((name, i) => {
 const rng = seededRng(i * 777 + 42);
 const level = Math.floor(rng() * 30) + 5;
 const returnPct = (rng() - 0.3) * 40;
 const portfolioValue = INITIAL_CAPITAL * (1 + returnPct / 100);
 const winRate = 35 + rng() * 40;
 const trades = Math.floor(rng() * 150) + 10;
 const avatarSeed = Math.floor(rng() * 1000);
 const league = getLeagueForLevel(level);
 return { id: `friend-${i}`, name, level, portfolioValue, returnPct, winRate, trades, avatarSeed, league };
 });
}

// ── Historical rank data (30 days synthetic) ──────────────────────────────────

function generateRankHistory(currentRank: number, totalPlayers: number): number[] {
 const rng = seededRng(currentRank * 13 + totalPlayers);
 const history: number[] = [];
 let rank = Math.min(totalPlayers, currentRank + Math.floor(rng() * 10) + 5);
 for (let i = 0; i < 30; i++) {
 const delta = Math.floor((rng() - 0.45) * 4);
 rank = Math.max(1, Math.min(totalPlayers, rank + delta));
 history.push(rank);
 }
 history[29] = currentRank;
 return history;
}

// ── Avatar helpers ────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
 "bg-primary", "bg-emerald-500", "bg-amber-500", "bg-rose-500",
 "bg-primary", "bg-cyan-500", "bg-pink-500", "bg-indigo-500",
];

function getInitials(name: string): string {
 const parts = name.split(/\s+/);
 if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
 return name.slice(0, 2).toUpperCase();
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
 const [mainTab, setMainTab] = useState<MainTab>("global");
 const [dimension, setDimension] = useState<LeaderboardDimension>("total_pnl");
 const [timePeriod, setTimePeriod] = useState<TimePeriod>("all");
 const [seasonExpanded, setSeasonExpanded] = useState(false);

 const { ranked, userRank } = useLeaderboard(dimension);
 const level = useGameStore((s) => s.level);
 const achievements = useGameStore((s) => s.achievements);
 const league = getLeagueForLevel(level);

 const dimConfig = DIMENSIONS.find((d) => d.id === dimension)!;

 // Top 3 for podium
 const top3 = ranked.slice(0, 3);

 // League distribution
 const leagueDistribution = useMemo(() => {
 const counts: Record<LeagueTier, number> = { bronze: 0, silver: 0, gold: 0, diamond: 0, alpha: 0 };
 for (const e of ranked) counts[e.league]++;
 return counts;
 }, [ranked]);

 // Rotating tip
 const tipIndex = useMemo(() => Math.floor(Date.now() / 1800000) % TIPS.length, []);

 // Time-period filtered ranks (synthetic offset for week/month)
 const filteredRanked = useMemo(() => {
 if (timePeriod === "all") return ranked;
 // Apply deterministic offsets for week/month
 const offsetSeed = timePeriod === "week" ? 111 : 222;
 return [...ranked]
 .map((e) => ({ ...e, _sort: e.isUser ? dimConfig.getValue(e) : dimConfig.getValue(e) * (0.7 + seededRng(e.avatarSeed + offsetSeed)() * 0.6) }))
 .sort((a, b) => dimConfig.sortDescending ? b._sort - a._sort : a._sort - b._sort)
 .map((e, i) => ({ ...e, rank: i + 1 }));
 }, [ranked, timePeriod, dimConfig]);

 const friends = useMemo(() => generateFriends(), []);

 const mainTabs: { id: MainTab; label: string; icon: React.ReactNode }[] = [
 { id: "global", label: "Global", icon: <Trophy className="h-3 w-3" /> },
 { id: "friends", label: "Friends", icon: <Users className="h-3 w-3" /> },
 { id: "stats", label: "Your Stats", icon: <BarChart2 className="h-3 w-3" /> },
 { id: "trophies", label: "Trophies", icon: <Medal className="h-3 w-3" /> },
 ];

 return (
 <div className="flex h-full flex-col">
 {/* Header */}
 <div className="border-b border-border px-4 py-5">
 <div className="flex items-center gap-3">
 <div>
 <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/40 mb-2">Rankings</p>
 <h1 className="text-xl font-bold tracking-tight">Leaderboard</h1>
 </div>
 <div className="flex-1" />
 <div className="flex items-center gap-2">
 <LeagueBadge tier={league} size="lg" />
 <div className="flex items-center gap-1.5 rounded-lg border border-border/50 px-4 py-2">
 <span className="text-sm font-bold font-mono tabular-nums text-foreground">
 #{userRank?.rank ?? "-"}
 </span>
 <span className="text-xs text-muted-foreground">
 of <span className="font-mono tabular-nums">{ranked.length}</span>
 </span>
 </div>
 </div>
 </div>
 </div>

 {/* ===== MAIN TABS ===== */}
 <div className="border-b border-border px-4 overflow-x-auto">
 <div className="flex gap-0">
 {mainTabs.map((tab) => {
 const isActive = mainTab === tab.id;
 return (
 <button
 key={tab.id}
 type="button"
 onClick={() => setMainTab(tab.id)}
 className={cn(
 "relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors",
 isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
 )}
 >
 {tab.icon}
 {tab.label}
 {isActive && (
 <motion.span
 layoutId="leaderboard-main-tab"
 className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
 transition={{ type: "spring", stiffness: 400, damping: 30 }}
 />
 )}
 </button>
 );
 })}
 </div>
 </div>

 {/* ===== CONTENT ===== */}
 <div className="flex-1 overflow-y-auto px-4 py-4">
 <AnimatePresence mode="wait">
 {mainTab === "global" && (
 <motion.div
 key="global"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.15 }}
 >
 {/* Season Pass */}
 <div className="mb-4 space-y-0">
 <SeasonBanner expanded={seasonExpanded} onToggle={() => setSeasonExpanded((v) => !v)} />
 <AnimatePresence>
 {seasonExpanded && <SeasonRewardTrack />}
 </AnimatePresence>
 </div>

 {/* Dimension + Time Period filters */}
 <div className="mb-4 flex flex-wrap items-center gap-3">
 {/* Dimension pills */}
 <div className="flex overflow-x-auto gap-1 flex-wrap">
 {DIMENSIONS.map((dim) => {
 const Icon = ICON_MAP[dim.icon];
 const isActive = dimension === dim.id;
 return (
 <button
 key={dim.id}
 type="button"
 onClick={() => setDimension(dim.id)}
 className={cn(
 "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs text-muted-foreground font-medium transition-colors whitespace-nowrap",
 isActive
 ? "bg-primary/5 border border-primary/40 text-primary"
 : "bg-muted/20 border border-border text-muted-foreground hover:text-foreground",
 )}
 >
 {Icon && <Icon className="h-2.5 w-2.5" />}
 {dim.shortLabel}
 </button>
 );
 })}
 </div>

 <div className="flex-1" />

 {/* Time period filter */}
 <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/10 p-0.5">
 {(["week", "month", "all"] as TimePeriod[]).map((p) => {
 const labels = { week: "Week", month: "Month", all: "All Time" };
 return (
 <button
 key={p}
 type="button"
 onClick={() => setTimePeriod(p)}
 className={cn(
 "rounded-md px-2.5 py-1 text-xs text-muted-foreground font-medium transition-colors",
 timePeriod === p
 ? "bg-card text-foreground"
 : "text-muted-foreground hover:text-foreground",
 )}
 >
 {labels[p]}
 </button>
 );
 })}
 </div>
 </div>

 {/* Top 3 Podium */}
 <div className="rounded-md border border-border bg-card p-6 pb-2 mb-4">
 <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/35 mb-4 block">Top 3 — {dimConfig.label}</span>

 <div className="flex items-end justify-center gap-6">
 {top3[1] && <PodiumSlot entry={top3[1]} dimConfig={dimConfig} place={2} />}
 {top3[0] && <PodiumSlot entry={top3[0]} dimConfig={dimConfig} place={1} />}
 {top3[2] && <PodiumSlot entry={top3[2]} dimConfig={dimConfig} place={3} />}
 </div>
 </div>

 <div className="flex gap-5">
 {/* Left column — main leaderboard */}
 <div className="flex-1 min-w-0 space-y-4">
 <div>
 <PlayerStatsCard />
 </div>

 <div>
 <LeaderboardTable ranked={filteredRanked} dimension={dimension} />
 </div>

 <div>
 <BeatTheBestPanel top3={top3} />
 </div>
 </div>

 {/* Right column — sidebar panels (compact) */}
 <div className="hidden lg:flex w-64 shrink-0 flex-col gap-3">


 {/* League Distribution */}
 <div className="rounded-md border border-border bg-card/50 p-3">
 <div className="flex items-center gap-2 mb-2">
 <Gem className="h-3.5 w-3.5 text-muted-foreground" />
 <span className="text-xs text-muted-foreground font-medium">Leagues</span>
 </div>

 <div className="space-y-2">
 {(["alpha", "diamond", "gold", "silver", "bronze"] as LeagueTier[]).map((tier) => {
 const info = LEAGUES[tier];
 const count = leagueDistribution[tier];
 const pct = ranked.length > 0 ? (count / ranked.length) * 100 : 0;
 const isUserLeague = tier === league;

 return (
 <div
 key={tier}
 className={cn(
 "flex items-center gap-2 rounded-lg px-3 py-2.5 transition-colors",
 isUserLeague && "bg-muted/30 border border-border",
 )}
 >
 <span className="text-sm">{info.emoji}</span>
 <span className={cn("text-[11px] font-medium flex-1", info.color)}>
 {info.label}
 </span>
 <span className="text-xs font-medium font-mono tabular-nums text-muted-foreground">
 {count}
 </span>
 <div className="w-12 h-1.5 rounded-full bg-muted/30 overflow-hidden">
 <div
 className={cn("h-full rounded-full transition-colors duration-200", {
 "bg-primary": tier === "alpha",
 "bg-cyan-400": tier === "diamond",
 "bg-amber-400": tier === "gold",
 "bg-muted-foreground/60": tier === "silver",
 "bg-orange-400": tier === "bronze",
 })}
 style={{ width: `${pct}%` }}
 />
 </div>
 </div>
 );
 })}
 </div>
 </div>

 {/* Your Next Goal */}
 <div
 className="rounded-md border border-border bg-card/50 p-4"
 >
 <div className="flex items-center gap-2 mb-3">
 <Medal className="h-3.5 w-3.5 text-muted-foreground/50" />
 <span className="text-sm font-medium">Your Next Goal</span>
 </div>
 <NextGoalContent userRank={userRank} dimConfig={dimConfig} ranked={filteredRanked} />
 </div>

 {/* Trading Tip */}
 <div
 className="rounded-md border border-border bg-card p-4"
 >
 <div className="flex items-start gap-2">
 <Lightbulb className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
 <div>
 <span className="text-xs font-medium text-foreground/70">
 Pro Tip
 </span>
 <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
 {TIPS[tipIndex]}
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 </motion.div>
 )}

 {mainTab === "friends" && (
 <motion.div
 key="friends"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.15 }}
 >
 <FriendsTab friends={friends} />
 </motion.div>
 )}

 {mainTab === "stats" && (
 <motion.div
 key="stats"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.15 }}
 >
 <YourStatsTab ranked={ranked} userRank={userRank} />
 </motion.div>
 )}

 {mainTab === "trophies" && (
 <motion.div
 key="trophies"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.15 }}
 >
 <TrophyCaseTab achievements={achievements} />
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 );
}

// ── Friends Tab ───────────────────────────────────────────────────────────────

function FriendsTab({ friends }: { friends: FriendEntry[] }) {
 const [challenged, setChallenged] = useState<Set<string>>(new Set());

 return (
 <div className="space-y-4">
 <div className="flex items-center gap-2 mb-2">
 <Users className="h-4 w-4 text-muted-foreground" />
 <h2 className="text-sm font-medium">Friends Leaderboard</h2>
 <span className="rounded-full bg-muted/30 px-2 py-0.5 text-xs font-medium text-muted-foreground">
 {friends.length}
 </span>
 </div>

 {/* Column headers */}
 <div className="rounded-md border border-border bg-card/50 overflow-hidden">
 <div className="grid grid-cols-[2rem_1fr_5rem_4rem_4rem_5rem] gap-2 px-3 py-2 border-b border-border">
 <span className="text-[11px] font-medium text-muted-foreground text-center">#</span>
 <span className="text-[11px] font-medium text-muted-foreground">Player</span>
 <span className="text-[11px] font-medium text-muted-foreground text-right">Portfolio</span>
 <span className="text-[11px] font-medium text-muted-foreground text-right">Return</span>
 <span className="text-[11px] font-medium text-muted-foreground text-right">Win %</span>
 <span className="text-[11px] font-medium text-muted-foreground text-center">Action</span>
 </div>

 {friends.map((friend, i) => {
 const colorClass = AVATAR_COLORS[friend.avatarSeed % AVATAR_COLORS.length];
 const isChallenged = challenged.has(friend.id);

 return (
 <div
 key={friend.id}
 className="grid grid-cols-[2rem_1fr_5rem_4rem_4rem_5rem] gap-2 items-center px-3 py-2.5 hover:bg-muted/10 transition-colors duration-150 border-b border-border last:border-0"
 >
 <span className="text-[11px] font-medium text-muted-foreground text-center">{i + 1}</span>

 <div className="flex items-center gap-2 min-w-0">
 <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-medium text-foreground", colorClass)}>
 {getInitials(friend.name)}
 </div>
 <div className="min-w-0">
 <span className="text-[11px] font-medium truncate block">{friend.name}</span>
 <div className="flex items-center gap-1">
 <span className="text-[11px] text-muted-foreground">Lv.{friend.level}</span>
 <LeagueBadge tier={friend.league} size="sm" />
 </div>
 </div>
 </div>

 <span className="text-[11px] font-medium font-mono tabular-nums text-right">
 ${(friend.portfolioValue / 1000).toFixed(1)}K
 </span>

 <span className={cn("text-[11px] font-medium font-mono tabular-nums text-right",
 friend.returnPct >= 0 ? "text-emerald-400" : "text-red-400")}>
 {friend.returnPct >= 0 ? "+" : ""}{friend.returnPct.toFixed(1)}%
 </span>

 <span className="text-[11px] font-medium font-mono tabular-nums text-right">
 {friend.winRate.toFixed(0)}%
 </span>

 <div className="flex justify-center">
 <button
 type="button"
 onClick={() => setChallenged((prev) => new Set([...prev, friend.id]))}
 disabled={isChallenged}
 className={cn(
 "rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
 isChallenged
 ? "bg-muted/20 text-muted-foreground cursor-default"
 : "bg-primary/5 border border-primary/20 text-primary hover:bg-primary/10",
 )}
 >
 {isChallenged ? "Sent" : "Challenge"}
 </button>
 </div>
 </div>
 );
 })}
 </div>

 <div className="border border-foreground/15 bg-foreground/[0.03] rounded-xl px-5 py-3">
 <p className="text-[11px] text-muted-foreground leading-relaxed">
 Challenge friends to head-to-head competitions. Win to earn bonus points and climb the ranks faster.
 </p>
 </div>
 </div>
 );
}

// ── Your Stats Tab ────────────────────────────────────────────────────────────

function YourStatsTab({ ranked, userRank }: { ranked: RankedEntry[]; userRank: RankedEntry }) {
 const portfolioValue = useTradingStore((s) => s.portfolioValue);
 const stats = useGameStore((s) => s.stats);

 const totalPlayers = ranked.length;
 const rank = userRank?.rank ?? totalPlayers;
 const percentile = Math.round(((totalPlayers - rank) / totalPlayers) * 100);

 // Historical rank (30-day synthetic)
 const rankHistory = useMemo(() => generateRankHistory(rank, totalPlayers), [rank, totalPlayers]);

 // Stats comparisons
 const top10 = ranked.slice(0, 10);
 const top10AvgPnL = top10.reduce((s, e) => s + e.totalPnL, 0) / top10.length;
 const top10AvgWR = top10.reduce((s, e) => s + e.winRate, 0) / top10.length;
 const top10AvgSharpe = top10.reduce((s, e) => s + e.sharpeRatio, 0) / top10.length;
 const top10AvgTrades = top10.reduce((s, e) => s + e.totalTrades, 0) / top10.length;

 const allAvgPnL = ranked.reduce((s, e) => s + e.totalPnL, 0) / ranked.length;
 const allAvgWR = ranked.reduce((s, e) => s + e.winRate, 0) / ranked.length;
 const allAvgSharpe = ranked.reduce((s, e) => s + e.sharpeRatio, 0) / ranked.length;
 const allAvgTrades = ranked.reduce((s, e) => s + e.totalTrades, 0) / ranked.length;

 const userPnL = portfolioValue - INITIAL_CAPITAL;
 const userWR = stats.totalTrades > 0 ? (stats.profitableTrades / stats.totalTrades) * 100 : 0;
 const userSharpe = userRank?.sharpeRatio ?? 0;
 const userTrades = stats.totalTrades;

 // SVG rank chart
 const chartW = 280;
 const chartH = 80;
 const minRank = Math.min(...rankHistory);
 const maxRank = Math.max(...rankHistory);
 const range = maxRank - minRank || 1;

 const points = rankHistory.map((r, i) => {
 const x = (i / (rankHistory.length - 1)) * chartW;
 // Lower rank = higher on chart (inverted Y)
 const y = chartH - ((maxRank - r) / range) * chartH * 0.8 - chartH * 0.1;
 return `${x.toFixed(1)},${y.toFixed(1)}`;
 }).join(" ");

 const compRows = [
 {
 label: "Total P&L",
 user: `${userPnL >= 0 ? "+" : ""}$${Math.abs(userPnL).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
 top10: `+$${Math.abs(top10AvgPnL).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
 all: `${allAvgPnL >= 0 ? "+" : ""}$${Math.abs(allAvgPnL).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
 userBetter: userPnL > allAvgPnL,
 },
 {
 label: "Win Rate",
 user: `${userWR.toFixed(1)}%`,
 top10: `${top10AvgWR.toFixed(1)}%`,
 all: `${allAvgWR.toFixed(1)}%`,
 userBetter: userWR > allAvgWR,
 },
 {
 label: "Sharpe",
 user: userSharpe.toFixed(2),
 top10: top10AvgSharpe.toFixed(2),
 all: allAvgSharpe.toFixed(2),
 userBetter: userSharpe > allAvgSharpe,
 },
 {
 label: "Trades",
 user: `${userTrades}`,
 top10: `${Math.round(top10AvgTrades)}`,
 all: `${Math.round(allAvgTrades)}`,
 userBetter: userTrades > allAvgTrades,
 },
 ];

 return (
 <div className="space-y-4">
 {/* Rank + Percentile */}
 <div className="grid grid-cols-2 gap-4">
 <div className="rounded-xl border border-border/50 bg-card/30 p-5">
 <div className="flex items-center gap-2 mb-1">
 <Trophy className="h-3.5 w-3.5 text-muted-foreground/50" />
 <span className="text-[11px] font-medium text-muted-foreground">Global Rank</span>
 </div>
 <div className="text-3xl font-bold tracking-tight font-mono tabular-nums text-foreground">#{rank}</div>
 <p className="text-xs text-muted-foreground mt-0.5">out of {totalPlayers} players</p>
 </div>

 <div className="rounded-xl border border-border/50 bg-card/30 p-5">
 <div className="flex items-center gap-2 mb-1">
 <Star className="h-4 w-4 text-amber-400" />
 <span className="text-[11px] font-medium text-muted-foreground">Percentile</span>
 </div>
 <div className="text-3xl font-bold tracking-tight font-mono tabular-nums text-amber-400">Top {Math.max(1, 100 - percentile)}%</div>
 <div className="mt-2 h-2 rounded-full bg-muted/30 overflow-hidden">
 <div
 className="h-full rounded-full bg-amber-400 transition-colors duration-200"
 style={{ width: `${percentile}%` }}
 />
 </div>
 <p className="text-xs text-muted-foreground mt-1">Better than {percentile}% of players</p>
 </div>
 </div>

 {/* Historical rank chart */}
 <div className="rounded-md border border-border bg-card/50 p-4">
 <div className="flex items-center gap-2 mb-3">
 <TrendingUp className="h-3.5 w-3.5 text-muted-foreground/50" />
 <span className="text-sm font-medium">Rank History</span>
 <span className="text-xs text-muted-foreground ml-auto">Last 30 days</span>
 </div>

 <div className="relative">
 <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} className="overflow-visible">
 {/* Grid lines */}
 {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => (
 <line
 key={i}
 x1={0} y1={chartH * frac}
 x2={chartW} y2={chartH * frac}
 stroke="currentColor"
 strokeOpacity={0.08}
 strokeWidth={1}
 />
 ))}

 {/* Area fill */}
 <defs>
 <linearGradient id="rank-area-grad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
 <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
 </linearGradient>
 </defs>
 <polyline
 points={`0,${chartH} ${points} ${chartW},${chartH}`}
 fill="url(#rank-area-grad)"
 stroke="none"
 />

 {/* Line */}
 <polyline
 points={points}
 fill="none"
 stroke="hsl(var(--primary))"
 strokeWidth={1.5}
 strokeLinejoin="round"
 />

 {/* Current rank dot */}
 {rankHistory.length > 0 && (() => {
 const lastPt = points.split(" ").pop() ?? "";
 const [lx, ly] = lastPt.split(",").map(Number);
 return (
 <circle cx={lx} cy={ly} r={3} fill="hsl(var(--primary))" />
 );
 })()}
 </svg>

 <div className="flex justify-between mt-1">
 <span className="text-[11px] text-muted-foreground">30 days ago</span>
 <span className="text-[11px] text-muted-foreground">Today</span>
 </div>
 </div>

 <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
 {rankHistory[0] > rank ? (
 <ChevronUp className="h-3 w-3 text-emerald-400" />
 ) : (
 <ChevronDown className="h-3 w-3 text-red-400" />
 )}
 <span>
 {rankHistory[0] > rank
 ? `Moved up ${rankHistory[0] - rank} spots this month`
 : rankHistory[0] < rank
 ? `Moved down ${rank - rankHistory[0]} spots this month`
 : "Rank unchanged this month"}
 </span>
 </div>
 </div>

 {/* Comparison table */}
 <div className="rounded-md border border-border bg-card/50 overflow-hidden">
 <div className="px-4 py-3 border-b border-border">
 <span className="text-sm font-medium">Performance Comparison</span>
 </div>

 <div className="grid grid-cols-4 px-4 py-2 border-b border-border">
 <span className="text-[11px] font-medium text-muted-foreground">Metric</span>
 <span className="text-[11px] font-medium text-muted-foreground text-center">You</span>
 <span className="text-[11px] font-medium text-muted-foreground text-center">Top 10 Avg</span>
 <span className="text-[11px] font-medium text-muted-foreground text-center">All Avg</span>
 </div>

 {compRows.map((row, i) => (
 <div
 key={row.label}
 className={cn("grid grid-cols-4 px-4 py-2.5 items-center", i % 2 === 0 ? "bg-muted/5" : "")}
 >
 <span className="text-[11px] font-medium text-muted-foreground">{row.label}</span>
 <span className={cn("text-[11px] font-medium font-mono tabular-nums text-center", row.userBetter ? "text-emerald-400" : "text-foreground")}>
 {row.user}
 </span>
 <span className="text-[11px] font-mono tabular-nums text-muted-foreground text-center">{row.top10}</span>
 <span className="text-[11px] font-mono tabular-nums text-muted-foreground text-center">{row.all}</span>
 </div>
 ))}
 </div>
 </div>
 );
}

// ── Trophy Case Tab ───────────────────────────────────────────────────────────

function TrophyCaseTab({ achievements }: { achievements: { id: string; name: string; description: string; icon: string; unlockedAt: number }[] }) {
 const unlockedIds = new Set(achievements.filter((a) => a.unlockedAt > 0).map((a) => a.id));
 const unlockedCount = unlockedIds.size;

 // Merge achievement defs with unlock status
 const allDefs = ACHIEVEMENT_DEFS.map((def) => {
 const unlocked = unlockedIds.has(def.id);
 const achievement = achievements.find((a) => a.id === def.id);
 return {
 ...def,
 unlocked,
 unlockedAt: achievement?.unlockedAt ?? 0,
 };
 });

 const unlocked = allDefs.filter((a) => a.unlocked);
 const locked = allDefs.filter((a) => !a.unlocked);

 return (
 <div className="space-y-4">
 {/* Progress summary */}
 <div className="rounded-md border border-border bg-card/50 p-4">
 <div className="flex items-center justify-between mb-3">
 <div>
 <span className="text-sm font-medium">Trophy Case</span>
 <p className="text-xs text-muted-foreground mt-0.5">{unlockedCount} of {allDefs.length} unlocked</p>
 </div>
 <div className="text-right">
 <span className="text-sm font-medium font-mono tabular-nums text-amber-400">{unlockedCount}</span>
 <span className="text-xs text-muted-foreground">/{allDefs.length}</span>
 </div>
 </div>
 <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
 <div
 className="h-full rounded-full bg-amber-400 transition-colors duration-200"
 style={{ width: `${(unlockedCount / allDefs.length) * 100}%` }}
 />
 </div>
 </div>

 {/* Unlocked achievements */}
 {unlocked.length > 0 && (
 <div>
 <h3 className="text-[11px] font-medium text-muted-foreground mb-3">Earned</h3>
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
 {unlocked.map((a, i) => (
 <div
 key={a.id}
 className="rounded-md border border-amber-500/20 bg-amber-500/5 p-3"
 >
 <div className="flex items-center gap-2 mb-1.5">
 <Trophy className="h-4 w-4 text-amber-400 shrink-0" />
 <span className="text-[11px] font-medium text-amber-400 truncate">{a.name}</span>
 </div>
 <p className="text-xs text-muted-foreground leading-relaxed mb-1">{a.description}</p>
 {a.unlockedAt > 0 && (
 <p className="text-[11px] text-muted-foreground/60">
 {new Date(a.unlockedAt).toLocaleDateString()}
 </p>
 )}
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Locked achievements */}
 {locked.length > 0 && (
 <div>
 <h3 className="text-[11px] font-medium text-muted-foreground mb-3">Locked</h3>
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
 {locked.map((a, i) => (
 <div
 key={a.id}
 className="rounded-md border border-border bg-muted/5 p-3 opacity-50 grayscale"
 >
 <div className="flex items-center gap-2 mb-1.5">
 <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
 <span className="text-[11px] font-medium text-muted-foreground truncate">{a.name}</span>
 </div>
 <p className="text-xs text-muted-foreground/70 leading-relaxed">{a.description}</p>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 );
}

// ── Podium slot ───────────────────────────────────────────────────────────────

function PodiumSlot({
 entry,
 dimConfig,
 place,
}: {
 entry: RankedEntry;
 dimConfig: (typeof DIMENSIONS)[number];
 place: 1 | 2 | 3;
}) {
 const placeLabels = ["#1", "#2", "#3"];
 const heights = { 1: "h-28", 2: "h-16", 3: "h-11" };
 const sizes = { 1: "h-11 w-11 text-sm", 2: "h-9 w-9 text-[11px]", 3: "h-9 w-9 text-[11px]" };
 const color = AVATAR_COLORS[entry.avatarSeed % AVATAR_COLORS.length];
 const initials = getInitials(entry.name);

 return (
 <div
 className="flex flex-col items-center gap-1.5"
 >
 {/* Place label (no emoji) */}
 <span className={cn(
 "text-xs text-muted-foreground font-medium font-mono tabular-nums",
 place === 1 ? "text-amber-400" : place === 2 ? "text-muted-foreground" : "text-orange-400",
 )}>{placeLabels[place - 1]}</span>

 {/* Avatar */}
 <div className={cn(
 "flex items-center justify-center rounded-md font-medium text-foreground",
 sizes[place],
 entry.isUser ? "bg-primary" : color,
 )}>
 {entry.isUser ? "ME" : initials}
 </div>

 {/* Name */}
 <span className={cn("text-xs font-medium truncate max-w-[72px] text-center", entry.isUser && "text-foreground")}>
 {entry.name}
 </span>

 {/* Value */}
 <span className="text-xs font-medium font-mono tabular-nums text-muted-foreground">
 {dimConfig.format(dimConfig.getValue(entry))}
 </span>

 {/* Podium block */}
 <div className={cn(
 "w-16 rounded-t-lg",
 heights[place],
 place === 1 ? "bg-amber-500/15 border border-amber-500/30" :
 place === 2 ? "bg-muted-foreground/10 border border-muted-foreground/30" :
 "bg-orange-400/10 border border-orange-400/30",
 )} />
 </div>
 );
}

// ── Next Goal content ─────────────────────────────────────────────────────────

function NextGoalContent({
 userRank,
 dimConfig,
 ranked,
}: {
 userRank: RankedEntry;
 dimConfig: (typeof DIMENSIONS)[number];
 ranked: RankedEntry[];
}) {
 if (userRank.rank === 1) {
 return (
 <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
 <Crown className="h-4 w-4 text-amber-400 shrink-0" />
 <div>
 <span className="text-xs font-medium text-amber-400">You&apos;re #1!</span>
 <p className="text-xs text-muted-foreground">Defend your title.</p>
 </div>
 </div>
 );
 }

 const targetRank = userRank.rank - 1;
 const target = ranked.find((e) => e.rank === targetRank);
 if (!target) return null;

 const userVal = dimConfig.getValue(userRank);
 const targetVal = dimConfig.getValue(target);
 const diff = dimConfig.sortDescending ? targetVal - userVal : userVal - targetVal;

 return (
 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <span className="text-[11px] text-muted-foreground">
 Beat <span className="font-medium text-foreground">{target.name}</span>
 </span>
 <span className="text-xs font-medium text-muted-foreground">#{targetRank}</span>
 </div>
 <div className="flex items-center justify-between rounded-lg bg-muted/15 px-3 py-2">
 <span className="text-xs text-muted-foreground">Gap</span>
 <span className="text-sm font-medium font-mono tabular-nums text-foreground">
 {dimConfig.format(Math.abs(diff))}
 </span>
 </div>
 <p className="text-xs text-muted-foreground/70 leading-relaxed">
 {dimConfig.sortDescending
 ? `Increase your ${dimConfig.label.toLowerCase()} by ${dimConfig.format(Math.abs(diff))} to rank up.`
 : `Reduce your ${dimConfig.label.toLowerCase()} by ${dimConfig.format(Math.abs(diff))} to rank up.`}
 </p>
 </div>
 );
}
