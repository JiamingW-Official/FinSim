"use client";

/**
 * MarketSentimentBar
 *
 * Shows 5 sentiment buckets for the current bar:
 *   Bulls%, Bears%, Neutral%, Institutional%, Retail%
 *
 * All values are seeded from mulberry32(ticker hash + barIndex) so they are
 * deterministic and update automatically whenever bars advance.
 */

import { useMemo } from "react";
import { useChartStore } from "@/stores/chart-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { cn } from "@/lib/utils";

// ── Seeded PRNG (mulberry32) ──────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashTicker(ticker: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < ticker.length; i++) {
    h = Math.imul(h ^ ticker.charCodeAt(i), 0x01000193) | 0;
  }
  return h >>> 0;
}

// ── Derived sentiment from bar data + PRNG ────────────────────────────────────

interface SentimentValues {
  bulls: number;
  bears: number;
  neutral: number;
  institutional: number;
  retail: number;
}

function computeSentiment(
  ticker: string,
  barIndex: number,
  priceChangePct: number,
  recentVolPct: number,
): SentimentValues {
  const seed = (hashTicker(ticker) + barIndex * 2654435761) | 0;
  const rand = mulberry32(seed);

  // Base bias from price direction
  const bias = Math.max(-1, Math.min(1, priceChangePct * 40));

  // Bulls and bears: bias shifts their base proportions
  const baseBulls = 0.38 + bias * 0.18 + (rand() - 0.5) * 0.12;
  const baseBears = 0.38 - bias * 0.18 + (rand() - 0.5) * 0.12;

  // Clamp to [0.1, 0.8]
  const bulls = Math.max(0.1, Math.min(0.8, baseBulls));
  const bears = Math.max(0.1, Math.min(0.8, baseBears));
  const neutral = Math.max(0.05, 1 - bulls - bears);

  // Total always 1 — normalize
  const total = bulls + bears + neutral;
  const nBulls = bulls / total;
  const nBears = bears / total;
  const nNeutral = neutral / total;

  // Institutional vs Retail: institutional is calmer, inversely related to vol
  const instBase = 0.35 - recentVolPct * 10 + (rand() - 0.5) * 0.1;
  const institutional = Math.max(0.15, Math.min(0.65, instBase));
  const retail = 1 - institutional;

  return {
    bulls: nBulls,
    bears: nBears,
    neutral: nNeutral,
    institutional,
    retail,
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface SentimentRowProps {
  label: string;
  value: number;
  fillClass: string;
  textClass: string;
}

function SentimentRow({ label, value, fillClass, textClass }: SentimentRowProps) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-[10px] text-muted-foreground">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", fillClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn("w-7 shrink-0 text-right text-[10px] tabular-nums font-medium", textClass)}>
        {pct}%
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function MarketSentimentBar() {
  const ticker = useChartStore((s) => s.currentTicker);
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);

  const sentiment = useMemo(() => {
    if (allData.length === 0 || revealedCount < 2) {
      return {
        bulls: 0.33,
        bears: 0.33,
        neutral: 0.34,
        institutional: 0.4,
        retail: 0.6,
      };
    }
    const currentBar = allData[revealedCount - 1];
    const prevBar = allData[revealedCount - 2];
    const priceChangePct =
      prevBar.close > 0
        ? (currentBar.close - prevBar.close) / prevBar.close
        : 0;

    // Realized vol over last 10 bars
    const window = allData.slice(Math.max(0, revealedCount - 10), revealedCount);
    const returns = window
      .slice(1)
      .map((b, i) =>
        window[i].close > 0 ? (b.close - window[i].close) / window[i].close : 0,
      );
    const mean = returns.reduce((s, r) => s + r, 0) / (returns.length || 1);
    const recentVolPct =
      returns.length > 1
        ? Math.sqrt(
            returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length,
          )
        : 0.008;

    return computeSentiment(ticker, revealedCount, priceChangePct, recentVolPct);
  }, [ticker, allData, revealedCount]);

  const bullPct = Math.round(sentiment.bulls * 100);
  const bearPct = Math.round(sentiment.bears * 100);

  // Overall lean label
  const leanLabel =
    bullPct > bearPct + 10
      ? "Bullish"
      : bearPct > bullPct + 10
        ? "Bearish"
        : "Mixed";
  const leanColor =
    leanLabel === "Bullish"
      ? "text-green-500"
      : leanLabel === "Bearish"
        ? "text-red-500"
        : "text-muted-foreground";

  return (
    <div className="px-3 py-2.5 border-b border-border">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          Market Sentiment
        </span>
        <span className={cn("text-[10px] font-semibold", leanColor)}>
          {leanLabel}
        </span>
      </div>

      <div className="space-y-1.5">
        <SentimentRow
          label="Bulls"
          value={sentiment.bulls}
          fillClass="bg-green-500"
          textClass="text-green-500"
        />
        <SentimentRow
          label="Bears"
          value={sentiment.bears}
          fillClass="bg-red-500"
          textClass="text-red-500"
        />
        <SentimentRow
          label="Neutral"
          value={sentiment.neutral}
          fillClass="bg-muted-foreground/50"
          textClass="text-muted-foreground"
        />
        <SentimentRow
          label="Institutional"
          value={sentiment.institutional}
          fillClass="bg-violet-500"
          textClass="text-violet-400"
        />
        <SentimentRow
          label="Retail"
          value={sentiment.retail}
          fillClass="bg-amber-500"
          textClass="text-amber-400"
        />
      </div>
    </div>
  );
}
