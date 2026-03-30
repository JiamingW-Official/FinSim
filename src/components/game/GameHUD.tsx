"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import {
  MarketSessionBadge,
  type MarketSession,
} from "@/components/game/MarketSessionBadge";
import { useMarketCountdown } from "@/hooks/useMarketCountdown";
import { useCompetitionStore } from "@/stores/competition-store";

interface GameHUDProps {
  /** Current game date as ISO string or timestamp */
  gameDate?: string;
  /** Current game hour (0-23) */
  gameHour?: number;
  /** Current game minute (0-59) */
  gameMinute?: number;
  /** Market session state */
  marketSession?: MarketSession;
  /** User portfolio total value */
  portfolioValue?: number;
  /** User daily P&L */
  dailyPnL?: number;
  /** Season progress 0-1 */
  seasonProgress?: number;
  /** Whether the season is over */
  isSeasonOver?: boolean;
  className?: string;
}

function formatTime(h: number, m: number): string {
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function formatGameDate(dateStr?: string): string {
  if (!dateStr) return "---";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Shows total return % vs the $100K starting capital */
function VsStartChip({ portfolioValue }: { portfolioValue: number }) {
  const pct = ((portfolioValue - 100_000) / 100_000) * 100;
  const isPositive = pct >= 0;
  const color = isPositive ? "text-emerald-400/90" : "text-rose-400/80";
  return (
    <span className={cn("tabular-nums text-[10px]", color)}>
      {isPositive ? "+" : ""}
      {pct.toFixed(2)}%
    </span>
  );
}

function RankBadge({ rank, total }: { rank: number; total: number }) {
  const color =
    rank === 1
      ? "text-amber-400"
      : rank === 2
        ? "text-muted-foreground"
        : rank === 3
          ? "text-orange-400/80"
          : "text-muted-foreground/60";

  return (
    <span className={cn("font-mono text-[11px] tabular-nums", color)}>
      #{rank}
      <span className="text-muted-foreground/40"> / {total}</span>
    </span>
  );
}

/** Inline countdown chip — uses its own interval, never re-renders GameHUD parent */
function CountdownChip() {
  const countdown = useMarketCountdown();
  if (!countdown.display || countdown.display === "--:--") return null;

  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded px-1.5 py-0.5",
      "font-mono text-[9px] tabular-nums ring-1 ring-inset",
      countdown.urgent
        ? "bg-amber-400/10 text-amber-400/90 ring-amber-400/20 animate-pulse"
        : countdown.target === "close"
          ? "bg-rose-500/[0.07] text-rose-400/60 ring-rose-500/10"
          : "bg-emerald-500/[0.07] text-emerald-400/50 ring-emerald-500/10",
    )}>
      <span className="font-semibold">{countdown.currentLabel}</span>
      <span className="opacity-40 mx-0.5">·</span>
      <span className="opacity-50">{countdown.label} {countdown.action} </span>
      <span className="font-semibold">{countdown.display}</span>
    </span>
  );
}

export function GameHUD({
  gameDate,
  gameHour = 9,
  gameMinute = 30,
  marketSession = "closed",
  portfolioValue = 100_000,
  dailyPnL = 0,
  seasonProgress = 0,
  isSeasonOver = false,
  className,
}: GameHUDProps) {
  const { userRank, leaderboard, isSeasonActive } = useCompetitionStore();
  const totalPlayers = leaderboard.length || 26;

  const pnlColor =
    dailyPnL > 0
      ? "text-emerald-400/80"
      : dailyPnL < 0
        ? "text-rose-400/70"
        : "text-muted-foreground/60";

  const pnlSign = dailyPnL >= 0 ? "+" : "";

  const progressPct = useMemo(
    () => Math.round(seasonProgress * 100),
    [seasonProgress],
  );

  if (!isSeasonActive) return null;

  // Season-over banner replaces the live HUD
  if (isSeasonOver) {
    return (
      <div
        className={cn(
          "flex h-9 items-center justify-between gap-4 border-b border-border/30",
          "bg-rose-500/5 backdrop-blur px-4",
          "font-mono text-[11px]",
          className,
        )}
      >
        <span className="font-semibold uppercase tracking-widest text-rose-400/80">
          Season Ended
        </span>
        <span className="tabular-nums text-foreground/80">
          {formatCurrency(portfolioValue)}
        </span>
        {userRank > 0 && (
          <RankBadge rank={userRank} total={totalPlayers} />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-9 items-center justify-between gap-4 border-b border-border/30",
        "bg-background/80 backdrop-blur px-4",
        "font-mono text-[11px]",
        className,
      )}
    >
      {/* LEFT: Game clock + countdown */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground/60 tabular-nums hidden lg:inline">
          {formatGameDate(gameDate)}
        </span>
        <span className="text-foreground/85 tabular-nums font-bold text-[13px]">
          {formatTime(gameHour, gameMinute)}
        </span>
        <MarketSessionBadge session={marketSession} />
        <CountdownChip />
      </div>

      {/* CENTER: Portfolio value + vs-start % + daily P&L */}
      <div className="flex items-center gap-3">
        <span className="text-foreground/90 tabular-nums">
          {formatCurrency(portfolioValue)}
        </span>
        <VsStartChip portfolioValue={portfolioValue} />
        <span className={cn("tabular-nums hidden sm:inline", pnlColor)}>
          {pnlSign}
          {formatCurrency(Math.abs(dailyPnL))}
        </span>
      </div>

      {/* RIGHT: Rank + season progress */}
      <div className="flex items-center gap-3">
        {userRank > 0 && (
          <RankBadge rank={userRank} total={totalPlayers} />
        )}
        <div className="flex items-center gap-1.5">
          <div className="h-1 w-16 rounded-full bg-foreground/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-foreground/20 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-muted-foreground/40 tabular-nums">
            {progressPct}%
          </span>
        </div>
      </div>
    </div>
  );
}
