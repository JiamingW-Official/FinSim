"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useCompetitionStore } from "@/stores/competition-store";
import { useClockStore } from "@/stores/clock-store";

// ── Sparkline ────────────────────────────────────────────────────────────────

function MiniSparkline({
  values,
  color,
  className,
}: {
  values: number[];
  color: string;
  className?: string;
}) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 200;
  const h = 48;

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn("w-full", className)}
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

interface SeasonSummaryProps {
  /** User's final portfolio value */
  userPortfolioValue?: number;
  /** User's equity history for sparkline */
  userEquityHistory?: number[];
  onNewSeason?: () => void;
  className?: string;
}

export function SeasonSummary({
  userPortfolioValue = 100_000,
  userEquityHistory = [],
  onNewSeason,
  className,
}: SeasonSummaryProps) {
  const {
    userRank,
    leaderboard,
    lobbyName,
    aiPortfolios,
    aiPlayers,
    resetSeason,
    initializeSeason,
  } = useCompetitionStore();
  const startSeason = useClockStore((s) => s.startSeason);

  const totalPlayers = leaderboard.length || 26;
  const userReturn = ((userPortfolioValue - 100_000) / 100_000) * 100;

  // Find top AI player for comparison
  const topAI = useMemo(() => {
    let best: { name: string; value: number; returns: number[] } | null = null;
    for (const player of aiPlayers) {
      const portfolio = aiPortfolios[player.id];
      if (portfolio && (!best || portfolio.totalValue > best.value)) {
        best = {
          name: player.name,
          value: portfolio.totalValue,
          returns: [], // We don't track history for AI sparklines
        };
      }
    }
    return best;
  }, [aiPlayers, aiPortfolios]);

  const handleNewSeason = () => {
    resetSeason();
    initializeSeason();
    startSeason();
    onNewSeason?.();
  };

  const rankColor =
    userRank === 1
      ? "text-amber-400"
      : userRank === 2
        ? "text-muted-foreground"
        : userRank === 3
          ? "text-orange-400/80"
          : "text-foreground/80";

  const returnColor =
    userReturn > 0
      ? "text-emerald-400/80"
      : userReturn < 0
        ? "text-rose-400/70"
        : "text-muted-foreground/60";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "w-full max-w-lg rounded-lg border border-border/40 bg-background p-8",
        className,
      )}
    >
      {/* Header */}
      <div className="mb-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1">
          Season Complete
        </p>
        <h2 className="text-xl font-semibold text-foreground/90">
          {lobbyName || "Trading Season"}
        </h2>
      </div>

      {/* Final rank */}
      <div className="mb-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-1">
          Final Rank
        </p>
        <p className={cn("text-4xl font-semibold tabular-nums", rankColor)}>
          #{userRank}
        </p>
        <p className="text-xs text-muted-foreground/40">
          of {totalPlayers} players
        </p>
      </div>

      {/* Stats grid */}
      <div className="mb-6 grid grid-cols-2 gap-px bg-border/20 rounded overflow-hidden">
        <StatCell
          label="Portfolio Value"
          value={formatCurrency(userPortfolioValue)}
        />
        <StatCell
          label="Total Return"
          value={`${userReturn >= 0 ? "+" : ""}${userReturn.toFixed(2)}%`}
          className={returnColor}
        />
        {topAI && (
          <>
            <StatCell label="Top AI Player" value={topAI.name} />
            <StatCell
              label="Top AI Value"
              value={formatCurrency(topAI.value)}
            />
          </>
        )}
      </div>

      {/* Equity sparkline */}
      {userEquityHistory.length > 1 && (
        <div className="mb-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-2">
            Your Equity Curve
          </p>
          <div className="h-12 rounded border border-border/20 bg-foreground/[0.02] px-2 py-1">
            <MiniSparkline
              values={userEquityHistory}
              color={
                userReturn >= 0
                  ? "rgb(52, 211, 153)"
                  : "rgb(251, 113, 133)"
              }
            />
          </div>
        </div>
      )}

      {/* New season button */}
      <Button
        onClick={handleNewSeason}
        className="w-full h-10 font-mono text-xs uppercase tracking-widest"
      >
        Play Again
      </Button>
    </motion.div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function StatCell({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="bg-background px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-0.5">
        {label}
      </p>
      <p
        className={cn(
          "font-mono text-sm tabular-nums text-foreground/80",
          className,
        )}
      >
        {value}
      </p>
    </div>
  );
}
