"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useChartStore } from "@/stores/chart-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { useTradingStore } from "@/stores/trading-store";
import { analyzeTradeSetup } from "@/services/ai/engine";
import { cn } from "@/lib/utils";
import type { IndicatorType } from "@/stores/chart-store";

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_TICKERS = ["AAPL", "MSFT", "GOOG", "AMZN", "NVDA", "TSLA", "META", "SPY", "QQQ", "GLD"];

// Seeded PRNG (same algorithm as TradeIdeaFeed for consistency)
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface ScanRow {
  ticker: string;
  score: number;
  direction: "long" | "short" | "neutral";
  conviction: "low" | "medium" | "high";
}

// ─── Score bar ────────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const pct = Math.abs(score); // 0–100
  const isBull = score > 0;

  return (
    <div className="flex items-center gap-1 flex-1 min-w-0">
      {/* Negative side */}
      <div className="flex-1 flex justify-end">
        <div
          className="h-1.5 rounded-sm bg-red-500/60 transition-all duration-500"
          style={{ width: !isBull ? `${pct}%` : "0%" }}
        />
      </div>
      {/* Center tick */}
      <div className="h-2.5 w-px bg-border/60 shrink-0" />
      {/* Positive side */}
      <div className="flex-1">
        <div
          className="h-1.5 rounded-sm bg-emerald-500/60 transition-all duration-500"
          style={{ width: isBull ? `${pct}%` : "0%" }}
        />
      </div>
    </div>
  );
}

// ─── Direction badge ──────────────────────────────────────────────────────────

function DirectionBadge({ direction, score }: { direction: ScanRow["direction"]; score: number }) {
  if (direction === "long") {
    return (
      <span className="flex items-center gap-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 px-1 py-0.5 text-[8px] font-black text-emerald-400">
        <TrendingUp className="h-2.5 w-2.5" />
        {score > 0 ? "+" : ""}{score}
      </span>
    );
  }
  if (direction === "short") {
    return (
      <span className="flex items-center gap-0.5 rounded border border-red-500/30 bg-red-500/10 px-1 py-0.5 text-[8px] font-black text-red-400">
        <TrendingDown className="h-2.5 w-2.5" />
        {score}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-0.5 rounded border border-border bg-muted px-1 py-0.5 text-[8px] font-black text-muted-foreground">
      <Minus className="h-2.5 w-2.5" />
      {score}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OpportunityScanner() {
  const activeIndicators = useChartStore((s) => s.activeIndicators);
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);
  const positions = useTradingStore((s) => s.positions);
  const tradeHistory = useTradingStore((s) => s.tradeHistory);

  const rows = useMemo<ScanRow[]>(() => {
    const visibleData = allData.slice(0, revealedCount);
    if (visibleData.length < 5) return [];

    const prng = mulberry32(revealedCount * 99991);
    const results: ScanRow[] = [];

    for (const ticker of ALL_TICKERS) {
      try {
        const liveResult = (() => {
          try {
            return analyzeTradeSetup({
              visibleData,
              activeIndicators: activeIndicators as IndicatorType[],
              positions,
              currentTicker: ticker,
              tradeHistory,
            });
          } catch {
            return null;
          }
        })();

        let score: number;
        let conviction: "low" | "medium" | "high";

        if (liveResult) {
          score = liveResult.score;
          conviction = liveResult.conviction;
        } else {
          const raw = (prng() - 0.5) * 160;
          score = Math.round(Math.max(-100, Math.min(100, raw)));
          conviction = Math.abs(score) >= 50 ? "high" : Math.abs(score) >= 25 ? "medium" : "low";
        }

        const direction: ScanRow["direction"] =
          score >= 15 ? "long" : score <= -15 ? "short" : "neutral";

        results.push({ ticker, score, direction, conviction });
      } catch {
        // skip
      }
    }

    // Sort by absolute score descending, take top 5
    return results.sort((a, b) => Math.abs(b.score) - Math.abs(a.score)).slice(0, 5);
  }, [allData, revealedCount, activeIndicators, positions, tradeHistory]);

  if (rows.length === 0) {
    return (
      <p className="text-[9px] text-muted-foreground text-center py-2">
        Advance the chart to scan for opportunities.
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="grid grid-cols-[3rem_1fr_4rem] gap-1 px-1">
        <span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-wide">Ticker</span>
        <span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-wide text-center">Score</span>
        <span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-wide text-right">Dir.</span>
      </div>

      {rows.map((row, i) => (
        <motion.div
          key={row.ticker}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.18 }}
          className="grid grid-cols-[3rem_1fr_4rem] items-center gap-1 rounded border border-border/30 bg-background/30 px-1.5 py-1"
        >
          <span className="text-[10px] font-black text-foreground">{row.ticker}</span>
          <ScoreBar score={row.score} />
          <div className="flex justify-end">
            <DirectionBadge direction={row.direction} score={row.score} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
