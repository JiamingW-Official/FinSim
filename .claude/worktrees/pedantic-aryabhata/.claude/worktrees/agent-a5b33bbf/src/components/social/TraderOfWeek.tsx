"use client";

import { useState } from "react";
import { Swords, TrendingUp, BarChart3 } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { toast } from "sonner";

// mulberry32 PRNG — same pattern used throughout the codebase
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TRADER_NAMES = [
  "Marcus Chen",
  "Aria Patel",
  "Jake Morrison",
  "Sofia Reyes",
  "Liam Nakamura",
  "Priya Singh",
  "Noah Williams",
  "Camila Torres",
  "Ethan Park",
  "Zoe Hamilton",
];

const STRATEGY_STYLES = [
  "Momentum Trading",
  "Swing Trading",
  "Options Spreads",
  "Value Investing",
  "Trend Following",
  "Mean Reversion",
  "Iron Condor",
  "Earnings Plays",
];

const QUOTES = [
  "The trend is your friend — until it bends.",
  "Risk management is the only edge that lasts.",
  "Patience separates the professionals from the gamblers.",
  "Cut losses short. Let winners run. Repeat.",
  "Every great trade starts with a well-defined plan.",
  "The market rewards discipline, not prediction.",
  "Size your positions for survival, not glory.",
  "Process over outcome — every single time.",
  "Study your losers harder than your winners.",
  "Consistency beats brilliance over any time frame.",
];

const BEST_TRADE_TICKERS = ["AAPL", "TSLA", "NVDA", "SPY", "MSFT", "AMZN", "META", "GOOGL"];

interface TraderProfile {
  name: string;
  initials: string;
  level: number;
  winRate: number;
  bestTrade: { ticker: string; pnl: number };
  strategyStyle: string;
  quote: string;
}

function generateTraderOfWeek(weekSeed: number): TraderProfile {
  const rng = mulberry32(weekSeed);

  const nameIndex = Math.floor(rng() * TRADER_NAMES.length);
  const name = TRADER_NAMES[nameIndex];
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const level = Math.floor(rng() * 30) + 10; // 10–39
  const winRate = Math.floor(rng() * 30) + 52; // 52–81%
  const tickerIndex = Math.floor(rng() * BEST_TRADE_TICKERS.length);
  const pnl = Math.floor(rng() * 9500) + 500; // $500–$10,000
  const strategyIndex = Math.floor(rng() * STRATEGY_STYLES.length);
  const quoteIndex = Math.floor(rng() * QUOTES.length);

  return {
    name,
    initials,
    level,
    winRate,
    bestTrade: { ticker: BEST_TRADE_TICKERS[tickerIndex], pnl },
    strategyStyle: STRATEGY_STYLES[strategyIndex],
    quote: QUOTES[quoteIndex],
  };
}

// Seed changes each calendar week (ISO week number)
function getWeekSeed(): number {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.floor(
    (now.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000),
  );
  return now.getFullYear() * 100 + weekNumber;
}

export function TraderOfWeek() {
  const [challenged, setChallenged] = useState(false);

  const weekSeed = getWeekSeed();
  const trader = generateTraderOfWeek(weekSeed);

  const handleChallenge = () => {
    if (challenged) return;
    setChallenged(true);
    toast.success(`Challenge sent to ${trader.name}!`, {
      description: `Match starts when they accept. Good luck.`,
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold">Trader of the Week</span>
          <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">
            FEATURED
          </span>
        </div>
      </div>

      {/* Trader info */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/30">
            <span className="text-sm font-black text-foreground">{trader.initials}</span>
          </div>

          {/* Name + title */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold leading-tight">{trader.name}</p>
            <p className="text-[10px] text-muted-foreground">{trader.strategyStyle}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                Lv.{trader.level}
              </span>
            </div>
          </div>

          {/* Win rate */}
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Win Rate</p>
            <p className="text-base font-black tabular-nums text-green-400">{trader.winRate}%</p>
          </div>
        </div>

        {/* Best trade */}
        <div className="mt-3 flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Best trade this week</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold">{trader.bestTrade.ticker}</span>
            <span className="text-[10px] font-black tabular-nums text-green-400">
              +{formatCurrency(trader.bestTrade.pnl)}
            </span>
          </div>
        </div>

        {/* Quote */}
        <blockquote className="mt-3 border-l-2 border-primary/30 pl-3">
          <p className="text-[11px] italic leading-relaxed text-muted-foreground">
            &ldquo;{trader.quote}&rdquo;
          </p>
          <cite className="mt-0.5 block text-[9px] not-italic text-muted-foreground/60">
            — {trader.name}
          </cite>
        </blockquote>
      </div>

      {/* Challenge button */}
      <div className="border-t border-border px-4 py-3">
        <button
          onClick={handleChallenge}
          disabled={challenged}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors",
            challenged
              ? "border border-border bg-muted/30 text-muted-foreground"
              : "bg-primary text-white hover:bg-primary/90 active:bg-primary/80",
          )}
        >
          <Swords className="h-3.5 w-3.5" />
          {challenged ? "Challenge sent" : "Challenge them"}
        </button>
      </div>
    </div>
  );
}
