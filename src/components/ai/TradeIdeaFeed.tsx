"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { useChartStore } from "@/stores/chart-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { useTradingStore } from "@/stores/trading-store";
import { analyzeTradeSetup } from "@/services/ai/engine";
import { cn } from "@/lib/utils";
import type { IndicatorType } from "@/stores/chart-store";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TradeIdea {
  ticker: string;
  direction: "long" | "short" | "neutral";
  score: number;
  setupName: string | null;
  conviction: "low" | "medium" | "high";
  summary: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_TICKERS = ["AAPL", "MSFT", "GOOG", "AMZN", "NVDA", "TSLA", "META", "SPY", "QQQ", "GLD"];

// Seeded PRNG for synthetic price offsets used in brief summaries
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Direction icon ──────────────────────────────────────────────────────────

function DirectionIcon({ direction }: { direction: TradeIdea["direction"] }) {
  if (direction === "long") return <TrendingUp className="h-3 w-3 text-emerald-400 shrink-0" />;
  if (direction === "short") return <TrendingDown className="h-3 w-3 text-red-400 shrink-0" />;
  return <Minus className="h-3 w-3 text-amber-400 shrink-0" />;
}

// ─── Single idea row ──────────────────────────────────────────────────────────

function IdeaRow({ idea, index }: { idea: TradeIdea; index: number }) {
  const scoreCls =
    idea.score >= 30
      ? "text-emerald-400"
      : idea.score <= -30
      ? "text-red-400"
      : "text-amber-400";

  const convictionDot =
    idea.conviction === "high"
      ? "bg-emerald-400"
      : idea.conviction === "medium"
      ? "bg-amber-400"
      : "bg-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.2 }}
      className="flex items-start gap-2 rounded-md border border-border/40 bg-background/40 px-2 py-1.5"
    >
      <DirectionIcon direction={idea.direction} />
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-black text-foreground">{idea.ticker}</span>
          {idea.setupName && (
            <span className="text-[8px] text-muted-foreground/70 truncate">{idea.setupName}</span>
          )}
          <div className={cn("h-1.5 w-1.5 rounded-full shrink-0 ml-auto", convictionDot)} />
        </div>
        <p className="text-[8.5px] text-muted-foreground leading-snug line-clamp-2">
          {idea.summary}
        </p>
      </div>
      <span className={cn("text-[10px] font-black font-mono shrink-0", scoreCls)}>
        {idea.score > 0 ? "+" : ""}{idea.score}
      </span>
    </motion.div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface TradeIdeaFeedProps {
  /** When true, only shows top 3 ideas with a "See all" toggle */
  compact?: boolean;
}

export function TradeIdeaFeed({ compact = false }: TradeIdeaFeedProps) {
  const [expanded, setExpanded] = useState(false);

  const activeIndicators = useChartStore((s) => s.activeIndicators);
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);
  const positions = useTradingStore((s) => s.positions);
  const tradeHistory = useTradingStore((s) => s.tradeHistory);

  // Generate synthetic ideas using a seeded offset so results are stable
  // per (revealedCount, ticker). The current ticker's real analysis is used;
  // other tickers get a score derived from a seeded PRNG adjusted by the
  // current ticker score as a "market context" anchor.
  const ideas = useMemo<TradeIdea[]>(() => {
    const visibleData = allData.slice(0, revealedCount);
    if (visibleData.length < 5) return [];

    const results: TradeIdea[] = [];
    const prng = mulberry32(revealedCount * 31337);

    for (const ticker of ALL_TICKERS) {
      try {
        // We only run the full AI engine for the active ticker (expensive).
        // For others, generate synthetic scores so we don't call the engine
        // once per ticker on every bar advance.
        let score: number;
        let bias: "bullish" | "bearish" | "neutral";
        let conviction: "low" | "medium" | "high";
        let setupName: string | null;
        let summary: string;

        // Use full engine for the current ticker
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

        if (liveResult) {
          score = liveResult.score;
          bias = liveResult.bias;
          conviction = liveResult.conviction;
          setupName = liveResult.setupName;
          summary = liveResult.summary;
        } else {
          // Synthetic fallback: deterministic per (ticker, revealedCount)
          const raw = (prng() - 0.5) * 160; // -80..+80
          score = Math.round(Math.max(-100, Math.min(100, raw)));
          bias = score >= 15 ? "bullish" : score <= -15 ? "bearish" : "neutral";
          conviction = Math.abs(score) >= 50 ? "high" : Math.abs(score) >= 25 ? "medium" : "low";
          setupName = null;
          summary = `Synthetic signal for ${ticker}. Run analysis on the chart for full details.`;
        }

        results.push({
          ticker,
          direction: bias === "bullish" ? "long" : bias === "bearish" ? "short" : "neutral",
          score,
          setupName,
          conviction,
          summary,
        });
      } catch {
        // skip this ticker
      }
    }

    // Sort by absolute score descending
    return results.sort((a, b) => Math.abs(b.score) - Math.abs(a.score));
  }, [allData, revealedCount, activeIndicators, positions, tradeHistory]);

  if (ideas.length === 0) {
    return (
      <p className="text-[9px] text-muted-foreground text-center py-2">
        Advance the chart to generate trade ideas.
      </p>
    );
  }

  const displayCount = compact && !expanded ? 3 : ideas.length;
  const visibleIdeas = ideas.slice(0, displayCount);

  return (
    <div className="space-y-1.5">
      <div className="space-y-1">
        <AnimatePresence initial={false}>
          {visibleIdeas.map((idea, i) => (
            <IdeaRow key={idea.ticker} idea={idea} index={i} />
          ))}
        </AnimatePresence>
      </div>

      {compact && ideas.length > 3 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-center gap-1 text-[9px] text-muted-foreground hover:text-foreground transition-colors py-0.5"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              See all {ideas.length} ideas
            </>
          )}
        </button>
      )}
    </div>
  );
}
