"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Mulberry32 seeded PRNG                                             */
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

function hashDate(dateStr: string, salt: number): number {
  let h = (0x9e3779b9 + salt) | 0;
  for (let i = 0; i < dateStr.length; i++) {
    h = (Math.imul(h, 31) + dateStr.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

/* ------------------------------------------------------------------ */
/*  Signal database                                                    */
/* ------------------------------------------------------------------ */

interface SignalEntry {
  ticker: string;
  type: string;
  direction: "bullish" | "bearish" | "neutral";
  rationale: string;
}

const SIGNALS: SignalEntry[] = [
  { ticker: "AAPL", type: "RSI Oversold Bounce", direction: "bullish", rationale: "RSI dipped below 30 and is recovering, suggesting exhausted selling pressure near a key support level." },
  { ticker: "NVDA", type: "Momentum Breakout", direction: "bullish", rationale: "NVDA broke above its 20-day high on above-average volume — a classic continuation pattern in AI momentum." },
  { ticker: "TSLA", type: "Bearish Divergence", direction: "bearish", rationale: "Price made a new high but MACD histogram declined, signaling weakening bullish momentum and elevated reversal risk." },
  { ticker: "MSFT", type: "Golden Cross", direction: "bullish", rationale: "The 50-day MA crossed above the 200-day MA, historically a strong intermediate-term bullish signal for the stock." },
  { ticker: "SPY", type: "Overbought Alert", direction: "bearish", rationale: "SPY RSI reached 75 while breadth indicators weakened — a near-term pullback or consolidation is likely before the next leg." },
  { ticker: "META", type: "Volume Accumulation", direction: "bullish", rationale: "OBV has trended sharply higher over the past week, suggesting institutions are quietly accumulating shares." },
  { ticker: "GOOG", type: "Range Compression", direction: "neutral", rationale: "ATR has contracted to a 3-month low with price coiling near the 50-day MA — expect an impending directional breakout." },
  { ticker: "AMZN", type: "Support Hold", direction: "bullish", rationale: "AMZN bounced precisely from its prior earnings gap-up level, a zone of strong historical demand and institutional interest." },
  { ticker: "JPM", type: "Rate Sensitivity Setup", direction: "bullish", rationale: "JPM historically outperforms 2 weeks after Fed hold decisions — today's rate news creates a favorable short-term catalyst." },
  { ticker: "QQQ", type: "Death Cross Risk", direction: "bearish", rationale: "The 50-day MA is converging toward the 200-day MA from above. A confirmed cross would signal regime change for tech." },
  { ticker: "AMD", type: "EPS Catalyst", direction: "bullish", rationale: "AMD is 8 sessions from earnings with rising implied volatility — historical patterns favor buying 5 sessions before the event." },
  { ticker: "MSFT", type: "Cloud Revenue Momentum", direction: "bullish", rationale: "Azure growth estimates were raised by 3 analysts this week. Sector rotation into profitable cloud leaders continues." },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const DIRECTION_COLORS = {
  bullish: "text-green-400",
  bearish: "text-red-400",
  neutral: "text-amber-400",
};

const DIRECTION_BG = {
  bullish: "bg-green-500/8 border-green-500/20",
  bearish: "bg-red-500/8 border-red-500/20",
  neutral: "bg-amber-500/8 border-amber-500/20",
};

function strengthFromSeed(rand: () => number): number {
  return Math.floor(rand() * 40 + 60); // 60–99
}

export function AlphaSignal() {
  const today = new Date().toISOString().slice(0, 10);

  const { signal, strength } = useMemo(() => {
    const rand = mulberry32(hashDate(today, 0x4c1fa));
    const idx = Math.floor(rand() * SIGNALS.length);
    const str = strengthFromSeed(rand);
    return { signal: SIGNALS[idx], strength: str };
  }, [today]);

  const colorClass = DIRECTION_COLORS[signal.direction];
  const bgClass = DIRECTION_BG[signal.direction];
  const dirLabel =
    signal.direction === "bullish"
      ? "Bullish"
      : signal.direction === "bearish"
        ? "Bearish"
        : "Neutral";

  return (
    <div className={cn("surface-card p-4 border", bgClass)}>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Zap className={cn("h-3.5 w-3.5", colorClass)} />
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Alpha Signal of the Day
          </h2>
        </div>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
            colorClass,
          )}
        >
          {dirLabel}
        </span>
      </div>

      {/* Signal details */}
      <div className="mb-3 flex items-baseline gap-2">
        <span className="text-base font-bold tabular-nums">{signal.ticker}</span>
        <span className="text-xs text-muted-foreground">{signal.type}</span>
      </div>

      {/* Strength bar */}
      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Signal Strength</span>
          <span className={cn("text-[11px] font-semibold tabular-nums", colorClass)}>
            {strength}/100
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/20">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              signal.direction === "bullish"
                ? "bg-green-500"
                : signal.direction === "bearish"
                  ? "bg-red-500"
                  : "bg-amber-500",
            )}
            style={{ width: `${strength}%` }}
          />
        </div>
      </div>

      {/* Rationale */}
      <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground">
        {signal.rationale}
      </p>

      {/* CTA */}
      <Link
        href="/trade"
        className={cn(
          "flex items-center gap-1 text-[11px] font-medium transition-opacity hover:opacity-80",
          colorClass,
        )}
      >
        Open chart for {signal.ticker}
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
