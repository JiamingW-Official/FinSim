"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { rankByMomentum, type MomentumRank } from "@/services/quant/momentum-ranking";
import { WATCHLIST_STOCKS } from "@/types/market";

// ─── Synthetic Price Generator ───────────────────────────────────────────────

function generatePrices(ticker: string, bars: number = 260): number[] {
  let seed = 0;
  for (let i = 0; i < ticker.length; i++) {
    seed = (seed * 31 + ticker.charCodeAt(i)) | 0;
  }
  const prices: number[] = [];
  let price = 80 + (Math.abs(seed) % 200);
  for (let i = 0; i < bars; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const change = ((seed / 0x7fffffff) - 0.5) * 3;
    price = Math.max(10, price + change);
    prices.push(Math.round(price * 100) / 100);
  }
  return prices;
}

// ─── Signal Badge ────────────────────────────────────────────────────────────

function SignalBadge({ signal }: { signal: MomentumRank["signal"] }) {
  const config = {
    strong: { text: "Strong", className: "bg-green-500/10 text-green-500" },
    moderate: { text: "Moderate", className: "bg-blue-500/10 text-blue-500" },
    weak: { text: "Weak", className: "bg-amber-500/10 text-amber-500" },
    negative: { text: "Negative", className: "bg-red-500/10 text-red-500" },
  };
  const c = config[signal];
  return (
    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", c.className)}>
      {c.text}
    </span>
  );
}

// ─── Score Bar ───────────────────────────────────────────────────────────────

function ScoreBar({ score, maxScore }: { score: number; maxScore: number }) {
  const absMax = Math.max(Math.abs(maxScore), 1);
  const pct = Math.min(100, (Math.abs(score) / absMax) * 100);
  const color = score >= 0 ? "bg-green-500" : "bg-red-500";

  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={cn(
          "font-mono tabular-nums text-[10px] w-12 text-right",
          score >= 0 ? "text-green-500" : "text-red-500",
        )}
      >
        {score >= 0 ? "+" : ""}
        {score.toFixed(1)}
      </span>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function MomentumTable() {
  const rankings: MomentumRank[] = useMemo(() => {
    const priceHistories: Record<string, number[]> = {};
    for (const stock of WATCHLIST_STOCKS) {
      priceHistories[stock.ticker] = generatePrices(stock.ticker);
    }
    return rankByMomentum(priceHistories);
  }, []);

  const maxScore = useMemo(() => {
    let max = 0;
    for (const r of rankings) {
      if (Math.abs(r.compositeScore) > max) max = Math.abs(r.compositeScore);
    }
    return max;
  }, [rankings]);

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4 hover:border-border/60 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Momentum Rankings</h3>
        <span className="text-xs text-muted-foreground">
          {rankings.length} tickers
        </span>
      </div>

      {/* Rankings table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="text-center py-1 px-1 font-medium w-8">Rank</th>
              <th className="text-left py-1 px-1 font-medium">Ticker</th>
              <th className="text-right py-1 px-1 font-medium">12M</th>
              <th className="text-right py-1 px-1 font-medium">6M</th>
              <th className="text-right py-1 px-1 font-medium">1M</th>
              <th className="text-left py-1 px-2 font-medium">Score</th>
              <th className="text-left py-1 px-1 font-medium">Signal</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((rank) => (
              <tr
                key={rank.ticker}
                className="border-b border-muted/50 hover:bg-muted/30 transition-colors"
              >
                <td className="py-1.5 px-1 text-center font-mono tabular-nums text-muted-foreground">
                  {rank.rank}
                </td>
                <td className="py-1.5 px-1 font-medium">{rank.ticker}</td>
                <td
                  className={cn(
                    "py-1.5 px-1 text-right font-mono tabular-nums",
                    rank.momentum12m >= 0
                      ? "text-green-500"
                      : "text-red-500",
                  )}
                >
                  {rank.momentum12m >= 0 ? "+" : ""}
                  {rank.momentum12m.toFixed(1)}%
                </td>
                <td
                  className={cn(
                    "py-1.5 px-1 text-right font-mono tabular-nums",
                    rank.momentum6m >= 0
                      ? "text-green-500"
                      : "text-red-500",
                  )}
                >
                  {rank.momentum6m >= 0 ? "+" : ""}
                  {rank.momentum6m.toFixed(1)}%
                </td>
                <td
                  className={cn(
                    "py-1.5 px-1 text-right font-mono tabular-nums",
                    rank.momentum1m >= 0
                      ? "text-green-500"
                      : "text-red-500",
                  )}
                >
                  {rank.momentum1m >= 0 ? "+" : ""}
                  {rank.momentum1m.toFixed(1)}%
                </td>
                <td className="py-1.5 px-2">
                  <ScoreBar
                    score={rank.compositeScore}
                    maxScore={maxScore}
                  />
                </td>
                <td className="py-1.5 px-1">
                  <SignalBadge signal={rank.signal} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Educational footer */}
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Composite momentum score weights: 40% 12-month, 40% 6-month, 20%
        1-month returns. Strong momentum tends to persist in the short term
        but can reverse sharply. Use as one factor among many.
      </p>
    </div>
  );
}
