"use client";

import { useMemo } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { formatCurrency, formatShortDate, cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { PnLHistogram } from "./PnLHistogram";

export function StatsBreakdown() {
  const tradeHistory = useTradingStore((s) => s.tradeHistory);

  const { tickerStats, bestTrades, worstTrades, mostTraded, avgSize } = useMemo(() => {
    const sellTrades = tradeHistory.filter((t) => t.side === "sell");

    // Win rate by ticker
    const byTicker = new Map<string, { total: number; wins: number }>();
    for (const t of sellTrades) {
      const entry = byTicker.get(t.ticker) ?? { total: 0, wins: 0 };
      entry.total++;
      if (t.realizedPnL > 0) entry.wins++;
      byTicker.set(t.ticker, entry);
    }
    const tStats = Array.from(byTicker.entries())
      .map(([ticker, s]) => ({
        ticker,
        total: s.total,
        winRate: s.total > 0 ? (s.wins / s.total) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);

    // Best & worst trades
    const sorted = [...sellTrades].sort((a, b) => b.realizedPnL - a.realizedPnL);
    const best = sorted.slice(0, 3);
    const worst = sorted.slice(-3).reverse();

    // Most traded
    const most = tStats[0]?.ticker ?? "—";

    // Average position size
    const allTrades = tradeHistory.filter((t) => t.side === "buy");
    const avg =
      allTrades.length > 0
        ? allTrades.reduce((sum, t) => sum + t.quantity * t.price, 0) / allTrades.length
        : 0;

    return {
      tickerStats: tStats,
      bestTrades: best,
      worstTrades: worst,
      mostTraded: most,
      avgSize: avg,
    };
  }, [tradeHistory]);

  const hasSells = tradeHistory.some((t) => t.side === "sell");

  if (!hasSells) {
    return (
      <div className="flex flex-col items-center gap-1.5 py-8 text-muted-foreground">
        <BarChart3 className="h-5 w-5 opacity-30" />
        <p className="text-[11px]">Complete sells to see detailed stats</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="flex gap-3">
        <div className="flex-1 rounded-lg border border-border/50 bg-card/50 p-2">
          <p className="text-[9px] text-muted-foreground">Most Traded</p>
          <p className="text-sm font-black">{mostTraded}</p>
        </div>
        <div className="flex-1 rounded-lg border border-border/50 bg-card/50 p-2">
          <p className="text-[9px] text-muted-foreground">Avg Position Size</p>
          <p className="text-sm font-black tabular-nums">{formatCurrency(avgSize)}</p>
        </div>
      </div>

      {/* Win Rate by Ticker */}
      {tickerStats.length > 0 && (
        <div>
          <p className="mb-1.5 text-[10px] font-bold text-muted-foreground">
            Win Rate by Ticker
          </p>
          <div className="space-y-1.5">
            {tickerStats.map((s) => (
              <div key={s.ticker} className="flex items-center gap-2">
                <span className="w-10 text-[11px] font-bold">{s.ticker}</span>
                <div className="flex-1 h-2.5 rounded-full bg-muted/20 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      s.winRate >= 50 ? "bg-green-500/70" : "bg-red-500/50",
                    )}
                    style={{ width: `${Math.max(s.winRate, 2)}%` }}
                  />
                </div>
                <span className="w-10 text-right text-[10px] tabular-nums text-muted-foreground">
                  {s.winRate.toFixed(0)}%
                </span>
                <span className="w-6 text-right text-[9px] tabular-nums text-muted-foreground/50">
                  ({s.total})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best & Worst Trades */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <p className="mb-1.5 flex items-center gap-1 text-[10px] font-bold text-green-400">
            <TrendingUp className="h-3 w-3" />
            Best Trades
          </p>
          <div className="space-y-1">
            {bestTrades.map((t, i) => (
              <div
                key={`best-${i}`}
                className="rounded-lg border border-green-500/20 bg-green-500/5 px-2 py-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold">{t.ticker}</span>
                  <span className="text-[11px] font-bold tabular-nums text-green-400">
                    +{formatCurrency(t.realizedPnL)}
                  </span>
                </div>
                <p className="text-[9px] text-muted-foreground">
                  {formatShortDate(t.simulationDate)}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 flex items-center gap-1 text-[10px] font-bold text-red-400">
            <TrendingDown className="h-3 w-3" />
            Worst Trades
          </p>
          <div className="space-y-1">
            {worstTrades.map((t, i) => (
              <div
                key={`worst-${i}`}
                className="rounded-lg border border-red-500/20 bg-red-500/5 px-2 py-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold">{t.ticker}</span>
                  <span className="text-[11px] font-bold tabular-nums text-red-400">
                    {formatCurrency(t.realizedPnL)}
                  </span>
                </div>
                <p className="text-[9px] text-muted-foreground">
                  {formatShortDate(t.simulationDate)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* P&L Distribution */}
      <div>
        <p className="mb-1.5 text-[10px] font-bold text-muted-foreground">
          P&L Distribution
        </p>
        <div className="rounded-lg border border-border bg-card/50 p-3">
          <PnLHistogram />
        </div>
      </div>
    </div>
  );
}
