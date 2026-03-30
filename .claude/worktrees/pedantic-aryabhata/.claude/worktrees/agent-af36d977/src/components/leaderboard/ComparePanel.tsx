"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, Target, BarChart2, Zap, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeagueBadge } from "./LeagueBadge";
import type { RankedEntry } from "@/types/leaderboard";

interface ComparePanelProps {
  userEntry: RankedEntry;
  opponent: RankedEntry;
  onClose: () => void;
}

const AVATAR_COLORS = [
  "bg-blue-500", "bg-green-500", "bg-amber-500", "bg-rose-500",
  "bg-purple-500", "bg-cyan-500", "bg-pink-500", "bg-indigo-500",
  "bg-teal-500", "bg-orange-500",
];

function getInitials(name: string): string {
  const parts = name.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatCurrency(v: number): string {
  const abs = Math.abs(v);
  const sign = v >= 0 ? "+" : "-";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

interface MetricRowProps {
  label: string;
  userVal: number;
  opponentVal: number;
  format: (v: number) => string;
  higherIsBetter: boolean;
  icon: React.ComponentType<{ className?: string }>;
  colorClass?: (v: number) => string;
}

function MetricRow({
  label,
  userVal,
  opponentVal,
  format,
  higherIsBetter,
  icon: Icon,
  colorClass,
}: MetricRowProps) {
  const userWins = higherIsBetter ? userVal >= opponentVal : userVal <= opponentVal;
  const total = Math.abs(userVal) + Math.abs(opponentVal);
  const userBarPct = total === 0 ? 50 : Math.min(100, (Math.abs(userVal) / total) * 100);
  const opponentBarPct = 100 - userBarPct;

  const userColor = colorClass ? colorClass(userVal) : userWins ? "text-green-400" : "text-red-400";
  const opponentColor = colorClass ? colorClass(opponentVal) : !userWins ? "text-green-400" : "text-red-400";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-muted-foreground/60" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        {userWins && (
          <span className="ml-auto text-[8px] font-black uppercase tracking-widest rounded-full bg-primary/15 text-primary px-1.5 py-0.5">
            You win
          </span>
        )}
      </div>

      {/* Values row */}
      <div className="flex items-center justify-between gap-2">
        <span className={cn("text-sm font-black tabular-nums", userColor)}>
          {format(userVal)}
        </span>
        <span className="text-[9px] text-muted-foreground/40 font-bold">vs</span>
        <span className={cn("text-sm font-black tabular-nums", opponentColor)}>
          {format(opponentVal)}
        </span>
      </div>

      {/* Bar chart */}
      <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
        <motion.div
          className={cn("h-full rounded-l-full", userWins ? "bg-primary" : "bg-muted/40")}
          initial={{ width: 0 }}
          animate={{ width: `${userBarPct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        <motion.div
          className={cn("h-full rounded-r-full", !userWins ? "bg-purple-400" : "bg-muted/40")}
          initial={{ width: 0 }}
          animate={{ width: `${opponentBarPct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export function ComparePanel({ userEntry, opponent, onClose }: ComparePanelProps) {
  const opponentColor = AVATAR_COLORS[opponent.avatarSeed % AVATAR_COLORS.length];

  // Count wins
  const metrics = [
    { uv: userEntry.totalPnL, ov: opponent.totalPnL, higher: true },
    { uv: userEntry.winRate, ov: opponent.winRate, higher: true },
    { uv: userEntry.totalTrades, ov: opponent.totalTrades, higher: true },
    { uv: userEntry.sharpeRatio, ov: opponent.sharpeRatio, higher: true },
    { uv: userEntry.maxDrawdownPct, ov: opponent.maxDrawdownPct, higher: false },
  ];
  const userWinCount = metrics.filter((m) =>
    m.higher ? m.uv >= m.ov : m.uv <= m.ov,
  ).length;
  const opponentWinCount = metrics.length - userWinCount;

  return (
    <AnimatePresence>
      <motion.div
        key="compare-panel"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="rounded-xl border border-border bg-card overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
          <BarChart2 className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-black flex-1">Head-to-Head</span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"
            aria-label="Close comparison"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Player headers */}
        <div className="grid grid-cols-2 gap-0 border-b border-border/50">
          {/* You */}
          <div className="flex flex-col items-center gap-1.5 px-4 py-3 border-r border-border/50 bg-primary/5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-black text-white">
              You
            </div>
            <span className="text-xs font-black text-primary">You</span>
            <LeagueBadge tier={userEntry.league} size="sm" />
            <span className="text-[9px] text-muted-foreground">Lv.{userEntry.level}</span>
          </div>

          {/* Opponent */}
          <div className="flex flex-col items-center gap-1.5 px-4 py-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl text-[10px] font-black text-white",
                opponentColor,
              )}
            >
              {getInitials(opponent.name)}
            </div>
            <span className="text-xs font-black truncate max-w-[96px] text-center">
              {opponent.name}
            </span>
            <LeagueBadge tier={opponent.league} size="sm" />
            <span className="text-[9px] text-muted-foreground">Lv.{opponent.level}</span>
          </div>
        </div>

        {/* Score banner */}
        <div className="flex items-center justify-center gap-4 px-4 py-3 bg-muted/10 border-b border-border/50">
          <span
            className={cn(
              "text-2xl font-black tabular-nums",
              userWinCount > opponentWinCount ? "text-primary" : "text-muted-foreground",
            )}
          >
            {userWinCount}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            wins
          </span>
          <span className="text-xs font-bold text-muted-foreground/50">—</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            wins
          </span>
          <span
            className={cn(
              "text-2xl font-black tabular-nums",
              opponentWinCount > userWinCount ? "text-purple-400" : "text-muted-foreground",
            )}
          >
            {opponentWinCount}
          </span>
        </div>

        {/* Metric rows */}
        <div className="p-4 space-y-4">
          <MetricRow
            label="Total P&L"
            userVal={userEntry.totalPnL}
            opponentVal={opponent.totalPnL}
            format={formatCurrency}
            higherIsBetter={true}
            icon={TrendingUp}
            colorClass={(v) => (v >= 0 ? "text-green-400" : "text-red-400")}
          />
          <MetricRow
            label="Win Rate"
            userVal={userEntry.winRate}
            opponentVal={opponent.winRate}
            format={(v) => `${v.toFixed(1)}%`}
            higherIsBetter={true}
            icon={Target}
          />
          <MetricRow
            label="Total Trades"
            userVal={userEntry.totalTrades}
            opponentVal={opponent.totalTrades}
            format={(v) => `${v}`}
            higherIsBetter={true}
            icon={Zap}
          />
          <MetricRow
            label="Sharpe Ratio"
            userVal={userEntry.sharpeRatio}
            opponentVal={opponent.sharpeRatio}
            format={(v) => v.toFixed(2)}
            higherIsBetter={true}
            icon={BarChart2}
          />
          <MetricRow
            label="Max Drawdown"
            userVal={userEntry.maxDrawdownPct}
            opponentVal={opponent.maxDrawdownPct}
            format={(v) => `${v.toFixed(1)}%`}
            higherIsBetter={false}
            icon={Award}
            colorClass={(v) => (v <= 15 ? "text-green-400" : v <= 30 ? "text-amber-400" : "text-red-400")}
          />
        </div>

        {/* Rank row */}
        <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-border/50 bg-muted/5">
          <div className="flex flex-col items-center gap-0.5 flex-1">
            <span className="text-[10px] text-muted-foreground font-bold">Your Rank</span>
            <span className="text-lg font-black tabular-nums text-primary">#{userEntry.rank}</span>
          </div>
          <div className="h-8 w-px bg-border/50" />
          <div className="flex flex-col items-center gap-0.5 flex-1">
            <span className="text-[10px] text-muted-foreground font-bold">Their Rank</span>
            <span className="text-lg font-black tabular-nums">#{opponent.rank}</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
