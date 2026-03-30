"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Mulberry32 seeded PRNG (same pattern as intraday-generator)        */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashDate(dateStr: string): number {
  let h = 0x9e3779b9;
  for (let i = 0; i < dateStr.length; i++) {
    h = (Math.imul(h, 31) + dateStr.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const TICKER_UNIVERSE = [
  "AAPL", "MSFT", "GOOG", "AMZN", "NVDA",
  "TSLA", "META", "JPM", "SPY", "QQQ",
  "AMD", "NFLX", "DIS", "BABA", "V",
  "MA", "UNH", "XOM", "CVX", "BA",
];

interface Mover {
  ticker: string;
  pct: number;
}

function generateMovers(dateStr: string): { gainers: Mover[]; losers: Mover[] } {
  const rand = mulberry32(hashDate(dateStr));

  // Assign each ticker a random daily change between -8% and +8%
  const moves: Mover[] = TICKER_UNIVERSE.map((ticker) => ({
    ticker,
    pct: (rand() - 0.5) * 16, // -8 to +8
  }));

  // Sort descending
  moves.sort((a, b) => b.pct - a.pct);

  const gainers = moves.slice(0, 5);
  const losers = moves.slice(-5).reverse();

  return { gainers, losers };
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                      */
/* ------------------------------------------------------------------ */

function MoverRow({ ticker, pct }: { ticker: string; pct: number }) {
  const isUp = pct >= 0;
  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <span className="text-[11px] font-semibold tabular-nums tracking-tight w-10">
        {ticker}
      </span>
      <div className="flex items-center gap-1">
        {isUp ? (
          <TrendingUp className="h-3 w-3 text-green-400 shrink-0" />
        ) : (
          <TrendingDown className="h-3 w-3 text-red-400 shrink-0" />
        )}
        <span
          className={cn(
            "text-[11px] tabular-nums font-medium",
            isUp ? "text-green-400" : "text-red-400",
          )}
        >
          {isUp ? "+" : ""}
          {pct.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function MarketMovers() {
  const today = new Date().toISOString().slice(0, 10);

  const { gainers, losers } = useMemo(() => generateMovers(today), [today]);

  return (
    <div className="surface-card p-4">
      <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Market Movers
      </h2>
      <div className="grid grid-cols-2 gap-x-4">
        {/* Gainers */}
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-green-400/70">
            Top Gainers
          </p>
          <div className="divide-y divide-border/20">
            {gainers.map((m) => (
              <MoverRow key={m.ticker} ticker={m.ticker} pct={m.pct} />
            ))}
          </div>
        </div>

        {/* Losers */}
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-red-400/70">
            Top Losers
          </p>
          <div className="divide-y divide-border/20">
            {losers.map((m) => (
              <MoverRow key={m.ticker} ticker={m.ticker} pct={m.pct} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
