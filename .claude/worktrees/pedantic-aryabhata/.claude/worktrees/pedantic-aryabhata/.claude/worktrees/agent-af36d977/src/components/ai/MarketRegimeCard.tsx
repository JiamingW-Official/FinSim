"use client";

import { useMemo } from "react";
import type { OHLCVBar } from "@/types/market";
import { calculateADX, calculateATR, calculateSMA } from "@/services/indicators";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────

type RegimeType = "Trending Up" | "Trending Down" | "Ranging" | "Volatile" | "Breakout";
type Conviction = "High" | "Medium" | "Low";

interface RegimeResult {
  type: RegimeType;
  conviction: Conviction;
  reasons: [string, string];
}

// ─── Regime Computation ────────────────────────────────────────────────────

function computeRegime(bars: OHLCVBar[]): RegimeResult | null {
  if (bars.length < 30) return null;

  const adxPoints = calculateADX(bars, 14);
  const atrPoints = calculateATR(bars, 14);
  const sma20Points = calculateSMA(bars, 20);

  const lastBar = bars[bars.length - 1];
  const close = lastBar.close;

  const adx = adxPoints.length > 0 ? adxPoints[adxPoints.length - 1].value : 0;
  const atr = atrPoints.length > 0 ? atrPoints[atrPoints.length - 1].value : 0;
  const sma20 = sma20Points.length > 0 ? sma20Points[sma20Points.length - 1].value : 0;

  // Check for breakout: price broke above 20-day high in last 3 bars
  const lookback = bars.slice(-23); // last 23 bars: 20-day high uses bars prior to last 3
  const priorHigh20 =
    lookback.length >= 23
      ? Math.max(...lookback.slice(0, 20).map((b) => b.high))
      : 0;
  const recent3 = bars.slice(-3);
  const breakoutOccurred =
    priorHigh20 > 0 && recent3.some((b) => b.close > priorHigh20);

  // Volatile: ATR/price > 2%
  const atrRatio = close > 0 ? atr / close : 0;
  const isVolatile = atrRatio > 0.02;

  // Trend conditions
  const isTrendingUp = adx > 25 && sma20 > 0 && close > sma20;
  const isTrendingDown = adx > 25 && sma20 > 0 && close < sma20;
  const isRanging = adx < 20;

  // Priority: Breakout > Volatile > Trending > Ranging
  if (breakoutOccurred) {
    const pctAbove =
      priorHigh20 > 0
        ? (((close - priorHigh20) / priorHigh20) * 100).toFixed(1)
        : "0.0";
    return {
      type: "Breakout",
      conviction: adx > 20 ? "High" : "Medium",
      reasons: [
        `Price broke above 20-day high of ${priorHigh20.toFixed(2)} within the last 3 bars`,
        `Currently ${pctAbove}% above prior resistance; ADX at ${adx.toFixed(1)}`,
      ],
    };
  }

  if (isVolatile) {
    const pctVol = (atrRatio * 100).toFixed(2);
    return {
      type: "Volatile",
      conviction: atrRatio > 0.035 ? "High" : "Medium",
      reasons: [
        `ATR is ${pctVol}% of price, above the 2% volatility threshold`,
        `Elevated intraday swings; reduce position size and widen stops`,
      ],
    };
  }

  if (isTrendingUp) {
    const pctAboveSma = sma20 > 0 ? (((close - sma20) / sma20) * 100).toFixed(1) : "0.0";
    return {
      type: "Trending Up",
      conviction: adx >= 35 ? "High" : adx >= 25 ? "Medium" : "Low",
      reasons: [
        `ADX ${adx.toFixed(1)} confirms trend strength; price ${pctAboveSma}% above SMA20`,
        `Momentum is directional — favor long entries on pullbacks to SMA20`,
      ],
    };
  }

  if (isTrendingDown) {
    const pctBelowSma = sma20 > 0 ? (((sma20 - close) / sma20) * 100).toFixed(1) : "0.0";
    return {
      type: "Trending Down",
      conviction: adx >= 35 ? "High" : adx >= 25 ? "Medium" : "Low",
      reasons: [
        `ADX ${adx.toFixed(1)} signals a downtrend; price ${pctBelowSma}% below SMA20`,
        `Avoid counter-trend longs; short rallies toward SMA20`,
      ],
    };
  }

  if (isRanging) {
    const rangeHigh = Math.max(...bars.slice(-20).map((b) => b.high));
    const rangeLow = Math.min(...bars.slice(-20).map((b) => b.low));
    return {
      type: "Ranging",
      conviction: adx < 15 ? "High" : "Medium",
      reasons: [
        `ADX ${adx.toFixed(1)} indicates no trending structure; 20-day range ${rangeLow.toFixed(2)}–${rangeHigh.toFixed(2)}`,
        `Fade extremes near range boundaries; avoid trend-following entries`,
      ],
    };
  }

  // Transitional — ADX 20–25, ambiguous
  return {
    type: close > (sma20 || close) ? "Trending Up" : "Trending Down",
    conviction: "Low",
    reasons: [
      `ADX ${adx.toFixed(1)} is transitional — trend is developing but not yet confirmed`,
      `Wait for ADX to exceed 25 or price to retake SMA20 before committing`,
    ],
  };
}

// ─── Styling Maps ──────────────────────────────────────────────────────────

const BORDER_COLOR: Record<RegimeType, string> = {
  "Trending Up": "border-l-green-500",
  "Trending Down": "border-l-red-500",
  Ranging: "border-l-amber-500",
  Volatile: "border-l-purple-500",
  Breakout: "border-l-sky-500",
};

const BADGE_COLOR: Record<RegimeType, string> = {
  "Trending Up": "bg-green-500/15 text-green-400",
  "Trending Down": "bg-red-500/15 text-red-400",
  Ranging: "bg-amber-500/15 text-amber-400",
  Volatile: "bg-purple-500/15 text-purple-400",
  Breakout: "bg-sky-500/15 text-sky-400",
};

const CONVICTION_COLOR: Record<Conviction, string> = {
  High: "text-green-400",
  Medium: "text-amber-400",
  Low: "text-muted-foreground",
};

// ─── Component ─────────────────────────────────────────────────────────────

interface Props {
  bars: OHLCVBar[];
  ticker: string;
}

export function MarketRegimeCard({ bars, ticker }: Props) {
  const regime = useMemo(() => computeRegime(bars), [bars]);

  if (!regime) {
    return (
      <div className="mx-2 my-1.5 rounded border border-border bg-card px-3 py-2 text-[10px] text-muted-foreground">
        Advance more bars to detect market regime.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mx-2 my-1.5 rounded border border-border border-l-2 bg-card px-3 py-2",
        BORDER_COLOR[regime.type],
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", BADGE_COLOR[regime.type])}>
          {regime.type}
        </span>
        <span className="text-[9px] text-muted-foreground">{ticker}</span>
        <span className={cn("text-[9px] font-medium", CONVICTION_COLOR[regime.conviction])}>
          {regime.conviction} conviction
        </span>
      </div>

      {/* Reason bullets */}
      <ul className="mt-1.5 space-y-0.5">
        {regime.reasons.map((reason, i) => (
          <li key={i} className="flex items-start gap-1 text-[10px] leading-snug text-muted-foreground">
            <span className="mt-[3px] h-1 w-1 shrink-0 rounded-full bg-muted-foreground/50" />
            {reason}
          </li>
        ))}
      </ul>
    </div>
  );
}
