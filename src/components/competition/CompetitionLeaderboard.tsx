"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import {
  useCompetitionStore,
  type CompetitionEntry,
} from "@/stores/competition-store";

// ── Sort keys ────────────────────────────────────────────────────────────────

type SortKey = "rank" | "portfolioValue" | "dailyPnL" | "totalReturn" | "tradeCount";

const COLUMNS: { key: SortKey; label: string; align: "left" | "right" }[] = [
  { key: "rank", label: "Rank", align: "left" },
  { key: "portfolioValue", label: "Portfolio Value", align: "right" },
  { key: "dailyPnL", label: "Daily P&L", align: "right" },
  { key: "totalReturn", label: "Total Return", align: "right" },
  { key: "tradeCount", label: "Trades", align: "right" },
];

// ── Strategy label ───────────────────────────────────────────────────────────

const STRATEGY_LABELS: Record<string, string> = {
  momentum: "MOM",
  value: "VAL",
  swing: "SWG",
  index: "IDX",
  contrarian: "CTR",
  random: "RND",
  Manual: "YOU",
};

// ── Rank color ───────────────────────────────────────────────────────────────

function rankColor(rank: number): string {
  if (rank === 1) return "text-amber-400";
  if (rank === 2) return "text-muted-foreground";
  if (rank === 3) return "text-orange-400/80";
  return "text-muted-foreground/50";
}

// ── Component ────────────────────────────────────────────────────────────────

interface CompetitionLeaderboardProps {
  className?: string;
}

export function CompetitionLeaderboard({
  className,
}: CompetitionLeaderboardProps) {
  const { leaderboard, isSeasonActive } = useCompetitionStore();
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDesc, setSortDesc] = useState(false);

  const sorted = useMemo(() => {
    if (!leaderboard.length) return [];
    const copy = [...leaderboard];
    copy.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const cmp = typeof aVal === "number" && typeof bVal === "number" ? aVal - bVal : 0;
      return sortDesc ? -cmp : cmp;
    });
    return copy;
  }, [leaderboard, sortKey, sortDesc]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDesc(!sortDesc);
    } else {
      setSortKey(key);
      setSortDesc(key !== "rank");
    }
  };

  if (!isSeasonActive || sorted.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center py-12 text-sm text-muted-foreground/40",
          className,
        )}
      >
        No active season
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border/30">
            {/* Player column (not sortable) */}
            <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50 font-normal">
              Player
            </th>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50 font-normal cursor-pointer select-none hover:text-muted-foreground/80 transition-colors",
                  col.align === "right" && "text-right",
                )}
                onClick={() => handleSort(col.key)}
              >
                {col.label}
                {sortKey === col.key && (
                  <span className="ml-0.5">{sortDesc ? "\u2193" : "\u2191"}</span>
                )}
              </th>
            ))}
            <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50 font-normal text-right">
              Strategy
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/20">
          {sorted.map((entry) => (
            <LeaderboardRow key={entry.id} entry={entry} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Row ──────────────────────────────────────────────────────────────────────

function LeaderboardRow({ entry }: { entry: CompetitionEntry }) {
  const pnlColor =
    entry.dailyPnL > 0
      ? "text-emerald-400/80"
      : entry.dailyPnL < 0
        ? "text-rose-400/70"
        : "text-muted-foreground/40";

  const returnColor =
    entry.totalReturn > 0
      ? "text-emerald-400/80"
      : entry.totalReturn < 0
        ? "text-rose-400/70"
        : "text-muted-foreground/40";

  const podiumBg =
    entry.rank === 1
      ? "bg-amber-400/[0.06]"
      : entry.rank === 2
        ? "bg-foreground/[0.03]"
        : entry.rank === 3
          ? "bg-orange-400/[0.04]"
          : "";

  const rankMedal =
    entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : null;

  return (
    <tr
      className={cn(
        "transition-colors hover:bg-foreground/[0.02]",
        entry.isUser && "bg-primary/[0.06] ring-1 ring-inset ring-primary/10",
        podiumBg,
      )}
    >
      {/* Player */}
      <td className="px-3 py-2">
        <span
          className={cn(
            "text-sm",
            entry.isUser
              ? "text-foreground font-semibold"
              : "text-foreground/70",
          )}
        >
          {entry.name}
          {entry.isUser && (
            <span className="ml-1.5 font-mono text-[9px] uppercase tracking-widest text-primary/60">
              you
            </span>
          )}
        </span>
      </td>

      {/* Rank */}
      <td className="px-3 py-2">
        <span
          className={cn(
            "font-mono text-[11px] tabular-nums font-medium",
            rankColor(entry.rank),
          )}
        >
          {rankMedal ? (
            <span className="mr-0.5">{rankMedal}</span>
          ) : null}
          #{entry.rank}
        </span>
      </td>

      {/* Portfolio Value */}
      <td className="px-3 py-2 text-right">
        <span className="font-mono text-[11px] tabular-nums text-foreground/80">
          {formatCurrency(entry.portfolioValue)}
        </span>
      </td>

      {/* Daily P&L */}
      <td className="px-3 py-2 text-right">
        <span className={cn("font-mono text-[11px] tabular-nums", pnlColor)}>
          {entry.dailyPnL >= 0 ? "+" : ""}
          {formatCurrency(Math.abs(entry.dailyPnL))}
        </span>
      </td>

      {/* Total Return */}
      <td className="px-3 py-2 text-right">
        <span
          className={cn("font-mono text-[11px] tabular-nums", returnColor)}
        >
          {entry.totalReturn >= 0 ? "+" : ""}
          {entry.totalReturn.toFixed(2)}%
        </span>
      </td>

      {/* Trades */}
      <td className="px-3 py-2 text-right">
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground/50">
          {entry.tradeCount}
        </span>
      </td>

      {/* Strategy */}
      <td className="px-3 py-2 text-right">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40">
          {STRATEGY_LABELS[entry.strategy] ?? entry.strategy}
        </span>
      </td>
    </tr>
  );
}
