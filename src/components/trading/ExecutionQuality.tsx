"use client";

import { useMemo } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { formatCurrency, cn } from "@/lib/utils";

const MIN_TRADES = 5;

function MetricCell({
  label,
  value,
  positive,
  negative,
}: {
  label: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="flex flex-col p-2 border border-border/20 rounded-lg">
      <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/35">
        {label}
      </span>
      <span
        className={cn(
          "text-[13px] font-mono tabular-nums font-semibold",
          positive
            ? "text-emerald-500/80"
            : negative
            ? "text-red-400/80"
            : "text-foreground/80",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function ExecutionQuality() {
  const realTrades = useTradingStore((s) => s.tradeHistory);

  const stats = useMemo(() => {
    const closed = realTrades.filter(
      (t) => t.realizedPnL !== undefined && t.side === "sell",
    );
    if (closed.length < MIN_TRADES) return null;

    const wins = closed.filter((t) => (t.realizedPnL ?? 0) > 0);
    const losses = closed.filter((t) => (t.realizedPnL ?? 0) <= 0);

    const winRate = (wins.length / closed.length) * 100;
    const avgWin =
      wins.length > 0
        ? wins.reduce((s, t) => s + (t.realizedPnL ?? 0), 0) / wins.length
        : 0;
    const avgLoss =
      losses.length > 0
        ? losses.reduce((s, t) => s + (t.realizedPnL ?? 0), 0) / losses.length
        : 0;

    const grossWin = wins.reduce((s, t) => s + (t.realizedPnL ?? 0), 0);
    const grossLoss = Math.abs(
      losses.reduce((s, t) => s + (t.realizedPnL ?? 0), 0),
    );
    const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? 999 : 0;

    return {
      totalTrades: closed.length,
      winRate,
      avgWin,
      avgLoss,
      profitFactor,
    };
  }, [realTrades]);

  const closedCount = realTrades.filter(
    (t) => t.realizedPnL !== undefined && t.side === "sell",
  ).length;

  return (
    <div className="px-3 py-2 border-t border-border/20">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/30">
          Execution Stats
        </span>
        {stats && (
          <span className="text-[9px] font-mono text-muted-foreground/30">
            {stats.totalTrades} trades
          </span>
        )}
      </div>

      {!stats ? (
        <p className="text-[10px] font-mono text-muted-foreground/30 py-0.5">
          Need {MIN_TRADES - closedCount > 0 ? MIN_TRADES - closedCount : MIN_TRADES}+ trades for stats
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <MetricCell
            label="Win Rate"
            value={`${stats.winRate.toFixed(0)}%`}
            positive={stats.winRate >= 50}
            negative={stats.winRate < 40}
          />
          <MetricCell
            label="Profit Factor"
            value={
              stats.profitFactor >= 999
                ? "∞"
                : stats.profitFactor.toFixed(2) + "x"
            }
            positive={stats.profitFactor >= 1}
            negative={stats.profitFactor < 1}
          />
          <MetricCell
            label="Avg Win"
            value={`+${formatCurrency(stats.avgWin)}`}
            positive
          />
          <MetricCell
            label="Avg Loss"
            value={formatCurrency(stats.avgLoss)}
            negative={stats.avgLoss < 0}
          />
        </div>
      )}
    </div>
  );
}
