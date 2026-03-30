"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Activity,
  BarChart2,
  BarChart3,
  CheckCircle2,
  Clock,
  Crosshair,
  DollarSign,
  Flame,
  FlaskConical,
  GitBranch,
  Layers,
  Rocket,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  getWeeklyChallenges,
  getWeekKey,
  getMsUntilMonday,
  type WeeklyChallenge,
} from "@/data/weekly-challenges";
import { useWeeklyChallengeStore } from "@/stores/weekly-challenge-store";
import { useGameStore } from "@/stores/game-store";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h ${mins}m`;
}

const DIFFICULTY_LABEL: Record<WeeklyChallenge["difficulty"], string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

const DIFFICULTY_COLOR: Record<WeeklyChallenge["difficulty"], string> = {
  easy: "text-emerald-400 bg-emerald-400/10",
  medium: "text-amber-400 bg-amber-400/10",
  hard: "text-red-400 bg-red-400/10",
};

// Map lucide icon name strings to actual components
function ChallengeIcon({ name, className }: { name: string; className?: string }) {
  const cls = cn("h-4 w-4", className);
  switch (name) {
    case "BarChart2":     return <BarChart2 className={cls} />;
    case "BarChart3":     return <BarChart3 className={cls} />;
    case "Activity":      return <Activity className={cls} />;
    case "TrendingUp":    return <TrendingUp className={cls} />;
    case "DollarSign":    return <DollarSign className={cls} />;
    case "Rocket":        return <Rocket className={cls} />;
    case "Target":        return <Target className={cls} />;
    case "Crosshair":     return <Crosshair className={cls} />;
    case "Layers":        return <Layers className={cls} />;
    case "GitBranch":     return <GitBranch className={cls} />;
    case "Flame":         return <Flame className={cls} />;
    case "FlaskConical":  return <FlaskConical className={cls} />;
    default:              return <Zap className={cls} />;
  }
}

// ---------------------------------------------------------------------------
// Compute current progress from game-store stats for a given metric
// ---------------------------------------------------------------------------

function useMetricProgress(
  metric: WeeklyChallenge["metric"],
  target: number,
): number {
  const stats = useGameStore((s) => s.stats);

  return useMemo(() => {
    switch (metric) {
      case "trades":
        return stats.totalTrades;
      case "pnl":
        return Math.max(0, stats.totalPnL);
      case "winRate": {
        if (stats.totalTrades < 1) return 0;
        const rate =
          Math.round((stats.profitableTrades / stats.totalTrades) * 100);
        return rate;
      }
      case "options":
        return stats.optionsTradesCount;
      case "streak":
        return stats.consecutiveWins;
      case "backtests":
        // backtests are not yet tracked in PlayerStats — return 0 until wired
        return 0;
      default:
        return 0;
    }
  }, [metric, stats, target]);
}

// ---------------------------------------------------------------------------
// Single challenge card
// ---------------------------------------------------------------------------

function ChallengeCard({
  challenge,
  isClaimed,
  onClaim,
  index,
}: {
  challenge: WeeklyChallenge;
  isClaimed: boolean;
  onClaim: (id: string) => void;
  index: number;
}) {
  const progress = useMetricProgress(challenge.metric, challenge.target);
  const isComplete = progress >= challenge.target;
  const canClaim = isComplete && !isClaimed;
  const pct = Math.min(100, (progress / challenge.target) * 100);

  // Format progress label depending on metric
  function formatProgress(v: number): string {
    if (challenge.metric === "pnl") return `$${v.toLocaleString()}`;
    if (challenge.metric === "winRate") return `${v}%`;
    return String(v);
  }

  return (
    <motion.div
      className={cn(
        "rounded-lg border bg-card p-3 flex flex-col gap-2 transition-colors",
        isClaimed
          ? "border-emerald-500/30 bg-emerald-500/5"
          : isComplete
            ? "border-cyan-500/30 bg-cyan-500/5"
            : "border-border hover:border-border/80",
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      {/* Top row */}
      <div className="flex items-start gap-2">
        {/* Icon */}
        <div
          className={cn(
            "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
            isClaimed
              ? "bg-emerald-500/10"
              : isComplete
                ? "bg-cyan-500/10"
                : "bg-white/[0.04]",
          )}
        >
          {isClaimed ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : (
            <ChallengeIcon
              name={challenge.icon}
              className={isComplete ? "text-cyan-400" : "text-muted-foreground"}
            />
          )}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-[13px] font-bold leading-tight",
              isClaimed && "line-through text-muted-foreground",
            )}
          >
            {challenge.title}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
            {challenge.description}
          </p>
        </div>

        {/* XP badge */}
        <div className="flex items-center gap-0.5 rounded-full bg-cyan-500/10 px-2 py-0.5 flex-shrink-0">
          <Zap className="h-2.5 w-2.5 text-cyan-400" />
          <span className="text-[10px] font-black text-cyan-400">
            +{challenge.xpReward}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <div className="relative h-1.5 flex-1 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full",
              isClaimed ? "bg-emerald-400" : "bg-cyan-400",
            )}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <span className="text-[10px] tabular-nums text-muted-foreground whitespace-nowrap">
          {formatProgress(Math.min(progress, challenge.target))}/
          {formatProgress(challenge.target)}
        </span>
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-[9px] font-bold",
            DIFFICULTY_COLOR[challenge.difficulty],
          )}
        >
          {DIFFICULTY_LABEL[challenge.difficulty]}
        </span>
      </div>

      {/* Claim button */}
      {canClaim && (
        <motion.button
          type="button"
          onClick={() => onClaim(challenge.id)}
          className="mt-0.5 w-full rounded-md border border-cyan-500/40 bg-cyan-500/10 py-1.5 text-[11px] font-bold text-cyan-400 hover:bg-cyan-500/20 transition-colors"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          Claim reward
        </motion.button>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function WeeklyChallenges() {
  const weekKey = useMemo(() => getWeekKey(), []);
  const challenges = useMemo(() => getWeeklyChallenges(weekKey), [weekKey]);

  const claimChallenge = useWeeklyChallengeStore((s) => s.claimChallenge);
  const getClaimedIds = useWeeklyChallengeStore((s) => s.getClaimedIds);
  const claimedIds = useMemo(() => getClaimedIds(), [getClaimedIds]);

  const awardXP = useGameStore((s) => s.awardXP);

  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    function tick() {
      setCountdown(formatCountdown(getMsUntilMonday()));
    }
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  function handleClaim(id: string) {
    const challenge = challenges.find((c) => c.id === id);
    if (!challenge) return;
    claimChallenge(id);
    awardXP(challenge.xpReward);
  }

  const completedCount = challenges.filter((c) => claimedIds.includes(c.id)).length;

  return (
    <div className="mb-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-black">Weekly Challenges</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">{weekKey}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-1">
            <span className="text-[10px] font-bold tabular-nums">
              {completedCount}/{challenges.length}
            </span>
            <span className="text-[10px] text-muted-foreground">claimed</span>
          </div>
          {countdown && (
            <div className="flex items-center gap-1 rounded-full border border-border bg-card px-2 py-1">
              <Clock className="h-2.5 w-2.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">
                Resets in {countdown}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Challenge cards — single column to give each card room for the claim button */}
      <div className="flex flex-col gap-2">
        {challenges.map((challenge, i) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            isClaimed={claimedIds.includes(challenge.id)}
            onClaim={handleClaim}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
