"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Trophy, DollarSign, Target, TrendingUp, Flame,
  Zap, ShieldCheck, Star, Crown, Medal, Gem, Lightbulb,
  Calendar,
} from "lucide-react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { PlayerStatsCard } from "@/components/leaderboard/PlayerStatsCard";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { LeagueBadge } from "@/components/leaderboard/LeagueBadge";
import { ComparePanel } from "@/components/leaderboard/ComparePanel";
import { SeasonBanner } from "@/components/season/SeasonBanner";
import { SeasonRewardTrack } from "@/components/season/SeasonRewardTrack";
import { DIMENSIONS, LEAGUES, getLeagueForLevel } from "@/types/leaderboard";
import { useGameStore } from "@/stores/game-store";
import type { LeaderboardDimension, LeagueTier, RankedEntry } from "@/types/leaderboard";

// ── Primary 3-tab view definition ───────────────────────────────

type PrimaryTab = "all_time" | "this_week" | "win_rate";

interface PrimaryTabConfig {
  id: PrimaryTab;
  label: string;
  dimension: LeaderboardDimension;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const PRIMARY_TABS: PrimaryTabConfig[] = [
  {
    id: "all_time",
    label: "All Time",
    dimension: "total_pnl",
    icon: DollarSign,
    description: "Sorted by total P&L",
  },
  {
    id: "this_week",
    label: "This Week",
    dimension: "weekly_pnl",
    icon: Calendar,
    description: "Sorted by 7-day P&L",
  },
  {
    id: "win_rate",
    label: "Win Rate",
    dimension: "win_rate",
    icon: Target,
    description: "Min. 10 trades",
  },
];

// ── Secondary dimension tabs (advanced) ─────────────────────────

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

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
} as const;
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 25 } },
};

export default function LeaderboardPage() {
  const [primaryTab, setPrimaryTab] = useState<PrimaryTab>("all_time");
  const [dimension, setDimension] = useState<LeaderboardDimension>("total_pnl");
  const [seasonExpanded, setSeasonExpanded] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState<RankedEntry | null>(null);
  const [useAdvancedTabs, setUseAdvancedTabs] = useState(false);

  // Resolve active dimension from primary tab or advanced override
  const activeDimension: LeaderboardDimension = useAdvancedTabs
    ? dimension
    : PRIMARY_TABS.find((t) => t.id === primaryTab)!.dimension;

  const { ranked, userRank } = useLeaderboard(activeDimension);
  const level = useGameStore((s) => s.level);
  const league = getLeagueForLevel(level);

  const dimConfig = DIMENSIONS.find((d) => d.id === activeDimension)!;

  // Apply win-rate filter: hide players with <10 trades when on win_rate tab
  const displayRanked = useMemo(() => {
    if (activeDimension === "win_rate") {
      return ranked.filter((e) => e.totalTrades >= 10);
    }
    return ranked;
  }, [ranked, activeDimension]);

  // Re-derive userRank from displayRanked (may have shifted after filter)
  const displayUserRank = useMemo(
    () => displayRanked.find((e) => e.isUser) ?? userRank,
    [displayRanked, userRank],
  );

  const top3 = displayRanked.slice(0, 3);

  const leagueDistribution = useMemo(() => {
    const counts: Record<LeagueTier, number> = { bronze: 0, silver: 0, gold: 0, diamond: 0, alpha: 0 };
    for (const e of displayRanked) counts[e.league]++;
    return counts;
  }, [displayRanked]);

  const tipIndex = useMemo(() => Math.floor(Date.now() / 1800000) % TIPS.length, []);

  function handleSelectOpponent(entry: RankedEntry) {
    if (selectedOpponent?.id === entry.id) {
      setSelectedOpponent(null);
    } else {
      setSelectedOpponent(entry);
    }
  }

  function handlePrimaryTabChange(tab: PrimaryTab) {
    setPrimaryTab(tab);
    setUseAdvancedTabs(false);
    setSelectedOpponent(null);
  }

  function handleDimensionChange(dim: LeaderboardDimension) {
    setDimension(dim);
    setUseAdvancedTabs(true);
    setSelectedOpponent(null);
  }

  return (
    <div className="flex h-full flex-col">
      {/* ===== HEADER ===== */}
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10"
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <Trophy className="h-5 w-5 text-purple-400" />
          </motion.div>
          <div>
            <h1 className="text-lg font-black">Leaderboard</h1>
            <p className="text-[11px] text-muted-foreground">
              Compete with other traders
            </p>
          </div>
          <div className="flex-1" />
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 400, damping: 15 }}
          >
            <LeagueBadge tier={league} size="lg" />
          </motion.div>
        </div>

        {/* Rank badge */}
        <div className="flex items-center gap-2 mt-3">
          <motion.div
            className="flex items-center gap-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 px-3 py-1.5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className="text-[11px] font-black tabular-nums text-purple-400">
              Rank #{displayUserRank?.rank ?? "-"}
            </span>
            <span className="text-[10px] text-muted-foreground">
              of {displayRanked.length}
            </span>
          </motion.div>
        </div>
      </div>

      {/* ===== PRIMARY 3-TAB VIEW ===== */}
      <div className="border-b border-border px-4">
        <div className="flex gap-0">
          {PRIMARY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = !useAdvancedTabs && primaryTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handlePrimaryTabChange(tab.id)}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-bold whitespace-nowrap transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                {isActive && (
                  <motion.span
                    layoutId="primary-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}

          {/* Divider */}
          <div className="flex items-center px-2">
            <div className="h-4 w-px bg-border/50" />
          </div>

          {/* Advanced toggle */}
          <button
            type="button"
            onClick={() => setUseAdvancedTabs((v) => !v)}
            className={cn(
              "relative flex items-center gap-1.5 px-2 py-2.5 text-[10px] font-bold whitespace-nowrap transition-colors",
              useAdvancedTabs
                ? "text-purple-400"
                : "text-muted-foreground/60 hover:text-muted-foreground",
            )}
          >
            More
            {useAdvancedTabs && (
              <motion.span
                layoutId="primary-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400 rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        </div>
      </div>

      {/* ===== ADVANCED DIMENSION TABS (shown when useAdvancedTabs) ===== */}
      <AnimatePresence>
        {useAdvancedTabs && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b border-border/50 bg-muted/5 overflow-hidden"
          >
            <div className="flex gap-0 px-4 overflow-x-auto">
              {DIMENSIONS.filter((d) => d.id !== "weekly_pnl").map((dim) => {
                const Icon = ICON_MAP[dim.icon];
                const isActive = dimension === dim.id;
                return (
                  <button
                    key={dim.id}
                    type="button"
                    onClick={() => handleDimensionChange(dim.id)}
                    className={cn(
                      "relative flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold whitespace-nowrap transition-colors",
                      isActive
                        ? "text-purple-400"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {Icon && <Icon className="h-3 w-3" />}
                    {dim.shortLabel}
                    {isActive && (
                      <motion.span
                        layoutId="advanced-tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400 rounded-full"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== CONTENT — two-column layout ===== */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Season Pass */}
        <div className="mb-4 space-y-0">
          <SeasonBanner expanded={seasonExpanded} onToggle={() => setSeasonExpanded((v) => !v)} />
          <AnimatePresence>
            {seasonExpanded && <SeasonRewardTrack />}
          </AnimatePresence>
        </div>

        <div className="flex gap-5">
          {/* Left column — main leaderboard */}
          <motion.div
            className="flex-1 min-w-0 space-y-4"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={fadeUp}>
              <PlayerStatsCard />
            </motion.div>

            <motion.div variants={fadeUp}>
              <LeaderboardTable
                ranked={displayRanked}
                dimension={activeDimension}
                onSelectOpponent={handleSelectOpponent}
                selectedOpponentId={selectedOpponent?.id ?? null}
              />
            </motion.div>

            {/* ── Compare section ── */}
            <AnimatePresence mode="wait">
              {selectedOpponent && displayUserRank && (
                <motion.div
                  key={selectedOpponent.id}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, y: 8 }}
                >
                  <ComparePanel
                    userEntry={displayUserRank}
                    opponent={selectedOpponent}
                    onClose={() => setSelectedOpponent(null)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Compare hint when nothing selected */}
            <AnimatePresence>
              {!selectedOpponent && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-dashed border-border/50 bg-muted/5 px-4 py-3 text-center"
                >
                  <p className="text-[11px] text-muted-foreground/60">
                    Click any player in the table to compare stats head-to-head.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right column — sidebar panels */}
          <motion.div
            className="hidden lg:flex w-72 shrink-0 flex-col gap-4"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {/* ── Podium: Top 3 ── */}
            <motion.div
              variants={fadeUp}
              className="rounded-xl border border-border bg-card/50 p-4 hover:border-border/60 transition-colors"
            >
              <div className="flex items-center gap-2 mb-4">
                <Crown className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-black">Top 3 — {dimConfig.label}</span>
              </div>

              <div className="flex items-end justify-center gap-3">
                {/* 2nd place */}
                {top3[1] && (
                  <PodiumSlot entry={top3[1]} dimConfig={dimConfig} place={2} />
                )}
                {/* 1st place */}
                {top3[0] && (
                  <PodiumSlot entry={top3[0]} dimConfig={dimConfig} place={1} />
                )}
                {/* 3rd place */}
                {top3[2] && (
                  <PodiumSlot entry={top3[2]} dimConfig={dimConfig} place={3} />
                )}
              </div>
            </motion.div>

            {/* ── League Distribution ── */}
            <motion.div
              variants={fadeUp}
              className="rounded-xl border border-border bg-card/50 p-4 hover:border-border/60 transition-colors"
            >
              <div className="flex items-center gap-2 mb-3">
                <Gem className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-black">Leagues</span>
              </div>

              <div className="space-y-2">
                {(["alpha", "diamond", "gold", "silver", "bronze"] as LeagueTier[]).map((tier) => {
                  const info = LEAGUES[tier];
                  const count = leagueDistribution[tier];
                  const pct = displayRanked.length > 0 ? (count / displayRanked.length) * 100 : 0;
                  const isUserLeague = tier === league;

                  return (
                    <motion.div
                      key={tier}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors",
                        isUserLeague && "bg-purple-500/5 border border-purple-500/20",
                      )}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <span className="text-sm">{info.emoji}</span>
                      <span className={cn("text-[11px] font-bold flex-1", info.color)}>
                        {info.label}
                      </span>
                      <span className="text-[10px] font-bold tabular-nums text-muted-foreground">
                        {count}
                      </span>
                      {/* Mini bar */}
                      <div className="w-12 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                        <motion.div
                          className={cn("h-full rounded-full", {
                            "bg-purple-400": tier === "alpha",
                            "bg-cyan-400": tier === "diamond",
                            "bg-amber-400": tier === "gold",
                            "bg-gray-300": tier === "silver",
                            "bg-orange-400": tier === "bronze",
                          })}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.5, duration: 0.6 }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* ── Your Next Goal ── */}
            <motion.div
              variants={fadeUp}
              className="rounded-xl border border-border bg-card/50 p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Medal className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-black">Your Next Goal</span>
              </div>

              <NextGoalContent userRank={displayUserRank} dimConfig={dimConfig} ranked={displayRanked} />
            </motion.div>

            {/* ── Trading Tip ── */}
            <motion.div
              variants={fadeUp}
              className="rounded-xl border border-primary/15 bg-primary/5 p-4"
            >
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">
                    Pro Tip
                  </span>
                  <p className="text-[11px] text-primary/80 leading-relaxed mt-1">
                    {TIPS[tipIndex]}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ── Podium slot ── */
function PodiumSlot({
  entry,
  dimConfig,
  place,
}: {
  entry: RankedEntry;
  dimConfig: (typeof DIMENSIONS)[number];
  place: 1 | 2 | 3;
}) {
  const medals = ["🥇", "🥈", "🥉"];
  const heights = { 1: "h-20", 2: "h-14", 3: "h-11" };
  const sizes = { 1: "h-11 w-11 text-sm", 2: "h-9 w-9 text-[11px]", 3: "h-9 w-9 text-[11px]" };
  const AVATAR_COLORS = [
    "bg-blue-500", "bg-green-500", "bg-amber-500", "bg-rose-500",
    "bg-purple-500", "bg-cyan-500", "bg-pink-500", "bg-indigo-500",
  ];
  const color = AVATAR_COLORS[entry.avatarSeed % AVATAR_COLORS.length];
  const initials = entry.name.split(/\s+/).length >= 2
    ? (entry.name[0] + entry.name.split(/\s+/)[1][0]).toUpperCase()
    : entry.name.slice(0, 2).toUpperCase();

  return (
    <motion.div
      className="flex flex-col items-center gap-1.5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: place === 1 ? 0.2 : place === 2 ? 0.3 : 0.4, type: "spring" as const, stiffness: 300, damping: 25 }}
    >
      {/* Medal */}
      <span className={cn("text-lg", place === 1 && "medal-shimmer")}>{medals[place - 1]}</span>

      {/* Avatar */}
      <div className={cn(
        "flex items-center justify-center rounded-xl font-black text-white",
        sizes[place],
        entry.isUser ? "bg-primary" : color,
      )}>
        {entry.isUser ? "You" : initials}
      </div>

      {/* Name */}
      <span className={cn("text-[10px] font-bold truncate max-w-[72px] text-center", entry.isUser && "text-primary")}>
        {entry.name}
      </span>

      {/* Value */}
      <span className="text-[10px] font-black tabular-nums text-muted-foreground">
        {dimConfig.format(dimConfig.getValue(entry))}
      </span>

      {/* Podium block */}
      <div className={cn(
        "w-16 rounded-t-lg",
        heights[place],
        place === 1 ? "bg-amber-500/15 border border-amber-500/30" :
        place === 2 ? "bg-gray-400/10 border border-gray-400/30" :
                      "bg-orange-400/10 border border-orange-400/30",
      )} />
    </motion.div>
  );
}

/* ── Next Goal content ── */
function NextGoalContent({
  userRank,
  dimConfig,
  ranked,
}: {
  userRank: RankedEntry;
  dimConfig: (typeof DIMENSIONS)[number];
  ranked: RankedEntry[];
}) {
  if (!userRank) return null;

  if (userRank.rank === 1) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
        <span className="text-lg">👑</span>
        <div>
          <span className="text-xs font-black text-amber-400">You&apos;re #1!</span>
          <p className="text-[10px] text-muted-foreground">Defend your title.</p>
        </div>
      </div>
    );
  }

  // Find the player just above the user
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
          Beat <span className="font-bold text-foreground">{target.name}</span>
        </span>
        <span className="text-[10px] font-bold text-muted-foreground">#{targetRank}</span>
      </div>
      <div className="flex items-center justify-between rounded-lg bg-muted/15 px-3 py-2">
        <span className="text-[10px] text-muted-foreground">Gap</span>
        <span className="text-sm font-black tabular-nums text-purple-400">
          {dimConfig.format(Math.abs(diff))}
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
        {dimConfig.sortDescending
          ? `Increase your ${dimConfig.label.toLowerCase()} by ${dimConfig.format(Math.abs(diff))} to rank up.`
          : `Reduce your ${dimConfig.label.toLowerCase()} by ${dimConfig.format(Math.abs(diff))} to rank up.`}
      </p>
    </div>
  );
}
