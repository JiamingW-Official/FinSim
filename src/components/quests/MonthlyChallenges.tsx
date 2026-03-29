"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, FlaskConical, GraduationCap, Star, Gift, Check, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { MONTHLY_CHALLENGES } from "@/data/monthly-challenges";
import { useGameStore } from "@/stores/game-store";
import { useLearnStore } from "@/stores/learn-store";
import { getCurrentSeason, getSeasonDaysRemaining } from "@/data/seasons/current-season";

// ── Icon map ────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ReactNode> = {
  TrendingUp: <TrendingUp className="h-5 w-5" />,
  FlaskConical: <FlaskConical className="h-5 w-5" />,
  GraduationCap: <GraduationCap className="h-5 w-5" />,
};

// ── Metric computation ──────────────────────────────────────────

function useMonthlyMetrics() {
  const stats = useGameStore((s) => s.stats);
  const learnState = useLearnStore();

  return useMemo(() => {
    // Monthly return %: approximate from totalPnL vs starting 10k
    // We track it simply as totalPnL / 10000 * 100 (rough sim value)
    const monthlyReturnPct = Math.max(0, (stats.totalPnL / 10000) * 100);

    // Options profitable count
    const optionsProfitableCount = stats.optionsTradesCount > 0
      ? Math.round((stats.optionsTotalPnL > 0 ? stats.optionsTradesCount : 0))
      : 0;

    // A-grade lessons (grade A = score >= 85, but we track S-rank — use completedLessons with grade check)
    let aGradeLessons = 0;
    for (const score of Object.values(learnState.lessonScores)) {
      if (typeof score === "object" && (score.grade === "S" || score.grade === "A")) {
        aGradeLessons++;
      }
    }

    return {
      monthlyReturnPct: parseFloat(monthlyReturnPct.toFixed(1)),
      optionsProfitableCount,
      aGradeLessons,
    };
  }, [stats, learnState.lessonScores]);
}

// ── Claimed state — persisted in localStorage per month ─────────

function getMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getClaimedSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem("mc_claimed_" + getMonthKey());
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function persistClaim(id: string) {
  if (typeof window === "undefined") return;
  const key = "mc_claimed_" + getMonthKey();
  const set = getClaimedSet();
  set.add(id);
  localStorage.setItem(key, JSON.stringify([...set]));
}

// ── Component ───────────────────────────────────────────────────

export function MonthlyChallenges() {
  const metrics = useMonthlyMetrics();
  const awardXP = useGameStore((s) => s.awardXP);
  const daysRemaining = getSeasonDaysRemaining();
  const season = getCurrentSeason();

  // Simple local claimed tracking (re-renders on claim via key trick)
  // We use a stable ref approach — re-read each render (no useState needed
  // because the only mutation is from within this component).
  const claimedSet = getClaimedSet();

  function getProgress(metric: string): number {
    switch (metric) {
      case "monthlyReturnPct":      return metrics.monthlyReturnPct;
      case "optionsProfitableCount": return metrics.optionsProfitableCount;
      case "aGradeLessons":          return metrics.aGradeLessons;
      default:                       return 0;
    }
  }

  function handleClaim(id: string, xpReward: number) {
    persistClaim(id);
    awardXP(xpReward);
    // Force re-render via a lightweight trick — state free, just re-read localStorage next render.
    // In practice the XP award triggers a store update which re-renders anyway.
  }

  return (
    <div className="space-y-4">
      {/* Month header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between rounded-lg border border-border/20 bg-foreground/[0.02] px-4 py-2.5"
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          <span className="truncate max-w-[180px]">{season.name}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">{daysRemaining}d</span>
          <span className="text-xs text-muted-foreground/70">remaining</span>
        </div>
      </motion.div>

      {/* Challenge cards */}
      <div className="space-y-3">
        {MONTHLY_CHALLENGES.map((challenge, i) => {
          const progress = getProgress(challenge.metric);
          const pct = Math.min(100, (progress / challenge.target) * 100);
          const isComplete = progress >= challenge.target;
          const isClaimed = claimedSet.has(challenge.id);

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "rounded-md border p-4 transition-colors",
                isClaimed
                  ? "border-green-500/20 bg-green-500/5"
                  : isComplete
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-border/20 bg-foreground/[0.02]",
              )}
            >
              {/* Top row */}
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-md border",
                    isClaimed
                      ? "border-green-500/30 bg-green-500/10 text-green-400"
                      : isComplete
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                        : "border-border/20 bg-foreground/[0.03] text-muted-foreground",
                  )}
                >
                  {isClaimed ? <Check className="h-5 w-5" /> : (ICON_MAP[challenge.icon] ?? <Star className="h-5 w-5" />)}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      className={cn(
                        "text-sm font-semibold",
                        isClaimed ? "text-green-300" : "text-foreground",
                      )}
                    >
                      {challenge.title}
                    </h3>
                    {/* EPIC badge */}
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[11px] font-semibold shrink-0",
                        isClaimed
                          ? "bg-green-500/15 text-green-400"
                          : "bg-amber-500/15 text-amber-400",
                      )}
                    >
                      EPIC
                    </span>
                    {isClaimed && (
                      <span className="text-xs font-semibold text-green-400 shrink-0">CLAIMED</span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                    {challenge.description}
                  </p>
                </div>

                {/* XP pill */}
                <div
                  className={cn(
                    "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1",
                    isClaimed ? "bg-green-500/10" : "bg-amber-500/10",
                  )}
                >
                  <Star className={cn("h-3 w-3", isClaimed ? "text-green-400" : "text-amber-400")} />
                  <span
                    className={cn(
                      "text-[11px] font-semibold tabular-nums",
                      isClaimed ? "text-green-400" : "text-amber-400",
                    )}
                  >
                    {challenge.xpReward.toLocaleString()} XP
                  </span>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    {progress.toFixed(challenge.metric === "monthlyReturnPct" ? 1 : 0)}
                    {challenge.metric === "monthlyReturnPct" ? "%" : ""}
                    {" / "}
                    {challenge.target}
                    {challenge.metric === "monthlyReturnPct" ? "%" : ""}{" "}
                    {challenge.unit}
                  </span>
                  <span
                    className={cn(
                      "text-[11px] font-semibold tabular-nums",
                      isComplete ? "text-amber-400" : "text-muted-foreground/70",
                    )}
                  >
                    {Math.round(pct)}%
                  </span>
                </div>

                {/* Large progress bar */}
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-foreground/5">
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      isClaimed
                        ? "bg-green-500"
                        : isComplete
                          ? "bg-amber-400"
                          : "bg-muted",
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.1 }}
                  />
                </div>
              </div>

              {/* Claim button */}
              {isComplete && !isClaimed && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleClaim(challenge.id, challenge.xpReward)}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 py-2 text-sm font-semibold text-black shadow-sm transition-colors hover:bg-amber-400"
                >
                  <Gift className="h-4 w-4" />
                  Claim {challenge.xpReward.toLocaleString()} XP Reward
                </motion.button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
