"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useChartStore } from "@/stores/chart-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { useTradingStore } from "@/stores/trading-store";
import { analyzeTradeSetup } from "@/services/ai/engine";
import { cn } from "@/lib/utils";
import type { IndicatorType } from "@/stores/chart-store";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TradeIdea {
  id: string;
  ticker: string;
  direction: "long" | "short" | "neutral";
  score: number;
  setupName: string | null;
  conviction: "low" | "medium" | "high";
  summary: string;
  // Price levels (synthetic per ticker + time bucket)
  entryPrice: number;
  targetPrice: number;
  stopPrice: number;
  rrRatio: number;
  confidence: number; // 0–100
  timestamp: number;
}

type FilterMode = "all" | "long" | "short" | "high_conf";

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_TICKERS = [
  "AAPL",
  "MSFT",
  "GOOG",
  "AMZN",
  "NVDA",
  "TSLA",
  "META",
  "SPY",
  "QQQ",
  "GLD",
];

const TICKER_BASE_PRICES: Record<string, number> = {
  AAPL: 185,
  MSFT: 370,
  GOOG: 155,
  AMZN: 178,
  NVDA: 460,
  TSLA: 190,
  META: 475,
  SPY: 490,
  QQQ: 420,
  GLD: 185,
};

const SETUP_NAMES_BULL = [
  "Bull Confluence",
  "Momentum Breakout",
  "Oversold Bounce",
  "VWAP Reclaim",
  "Golden Cross",
  "RSI Recovery",
  "Trend Continuation",
];

const SETUP_NAMES_BEAR = [
  "Bear Momentum",
  "Resistance Rejection",
  "Overbought Fade",
  "VWAP Breakdown",
  "Death Cross",
  "RSI Exhaustion",
  "Trend Breakdown",
];

// Seeded PRNG — mulberry32
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Simple string hash for seeding per ticker name
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// Build synthetic price levels deterministically for a ticker + time bucket
function buildPriceLevels(
  ticker: string,
  timeBucket: number,
  score: number,
): { entry: number; target: number; stop: number; rr: number } {
  const base = TICKER_BASE_PRICES[ticker] ?? 100;
  const seed = hashStr(ticker) + timeBucket * 137;
  const rng = mulberry32(seed);

  // Entry: base ± small noise (~±2%)
  const noise = (rng() - 0.5) * 0.04;
  const entry = parseFloat((base * (1 + noise)).toFixed(2));

  const isBull = score >= 15;
  const isBear = score <= -15;

  if (isBull) {
    // target above entry, stop below entry
    const targetPct = 0.03 + rng() * 0.04; // 3–7%
    const stopPct = 0.01 + rng() * 0.015; // 1–2.5%
    const target = parseFloat((entry * (1 + targetPct)).toFixed(2));
    const stop = parseFloat((entry * (1 - stopPct)).toFixed(2));
    const rr = parseFloat(((target - entry) / (entry - stop)).toFixed(1));
    return { entry, target, stop, rr };
  } else if (isBear) {
    const targetPct = 0.03 + rng() * 0.04;
    const stopPct = 0.01 + rng() * 0.015;
    const target = parseFloat((entry * (1 - targetPct)).toFixed(2));
    const stop = parseFloat((entry * (1 + stopPct)).toFixed(2));
    const rr = parseFloat(((entry - target) / (stop - entry)).toFixed(1));
    return { entry, target, stop, rr };
  } else {
    const targetPct = 0.02 + rng() * 0.02;
    const stopPct = 0.01 + rng() * 0.01;
    const target = parseFloat((entry * (1 + targetPct)).toFixed(2));
    const stop = parseFloat((entry * (1 - stopPct)).toFixed(2));
    const rr = parseFloat(((target - entry) / (entry - stop)).toFixed(1));
    return { entry, target, stop, rr };
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DirectionBadge({ direction }: { direction: TradeIdea["direction"] }) {
  if (direction === "long")
    return (
      <span className="inline-flex items-center gap-0.5 rounded border border-emerald-500/40 bg-emerald-500/15 px-1.5 py-0.5 text-[8px] font-bold text-emerald-400 leading-none uppercase">
        <TrendingUp className="h-2.5 w-2.5" />
        Long
      </span>
    );
  if (direction === "short")
    return (
      <span className="inline-flex items-center gap-0.5 rounded border border-red-500/40 bg-red-500/15 px-1.5 py-0.5 text-[8px] font-bold text-red-400 leading-none uppercase">
        <TrendingDown className="h-2.5 w-2.5" />
        Short
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[8px] font-bold text-muted-foreground leading-none uppercase">
      <Minus className="h-2.5 w-2.5" />
      Wait
    </span>
  );
}

function RRBadge({ rr }: { rr: number }) {
  const cls =
    rr >= 2.5
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      : rr >= 1.5
      ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
      : "bg-red-500/15 text-red-400 border-red-500/30";
  return (
    <span
      className={cn(
        "inline-flex rounded border px-1.5 py-0.5 text-[8px] font-bold leading-none",
        cls,
      )}
    >
      {rr}:1
    </span>
  );
}

function ConfidenceBadge({ conf }: { conf: number }) {
  const cls =
    conf >= 70
      ? "text-emerald-400"
      : conf >= 50
      ? "text-amber-400"
      : "text-muted-foreground";
  return (
    <span className={cn("text-[8px] font-bold font-mono", cls)}>
      {conf}%
    </span>
  );
}

function IdeaCard({
  idea,
  index,
}: {
  idea: TradeIdea;
  index: number;
}) {
  const router = useRouter();

  const isBull = idea.direction === "long";
  const isBear = idea.direction === "short";

  const ageMs = Date.now() - idea.timestamp;
  const ageSec = Math.floor(ageMs / 1000);
  const ageLabel = ageSec < 60 ? `${ageSec}s ago` : `${Math.floor(ageSec / 60)}m ago`;

  return (
    <motion.div
      key={idea.id}
      layout
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      className={cn(
        "rounded-lg border px-2.5 py-2 space-y-1.5",
        isBull
          ? "border-emerald-500/20 bg-emerald-500/5"
          : isBear
          ? "border-red-500/20 bg-red-500/5"
          : "border-border/40 bg-background/40",
      )}
    >
      {/* Row 1: direction + ticker + setup + age */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <DirectionBadge direction={idea.direction} />
        <span className="text-[11px] font-bold text-foreground">
          {idea.ticker}
        </span>
        {idea.setupName && (
          <span className="text-[8px] text-muted-foreground/70 truncate flex-1">
            {idea.setupName}
          </span>
        )}
        <span className="text-[7.5px] text-muted-foreground/40 ml-auto shrink-0">
          {ageLabel}
        </span>
      </div>

      {/* Row 2: price levels */}
      <div className="grid grid-cols-3 gap-1 text-[8px]">
        <div className="space-y-0.5">
          <div className="text-muted-foreground/50 uppercase text-[6.5px] font-bold tracking-wide">
            Entry
          </div>
          <div className="font-mono font-bold text-foreground">
            ${idea.entryPrice.toFixed(2)}
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="text-muted-foreground/50 uppercase text-[6.5px] font-bold tracking-wide">
            Target
          </div>
          <div className="font-mono font-bold text-emerald-400">
            ${idea.targetPrice.toFixed(2)}
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="text-muted-foreground/50 uppercase text-[6.5px] font-bold tracking-wide">
            Stop
          </div>
          <div className="font-mono font-bold text-red-400">
            ${idea.stopPrice.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Row 3: R:R + confidence + Trade This button */}
      <div className="flex items-center gap-1.5">
        <RRBadge rr={idea.rrRatio} />
        <ConfidenceBadge conf={idea.confidence} />
        <span className="text-[7.5px] text-muted-foreground/40 flex-1">
          conf.
        </span>
        <button
          type="button"
          onClick={() => router.push("/trade")}
          className={cn(
            "flex items-center gap-0.5 rounded border px-1.5 py-0.5 text-[8px] font-bold leading-none transition-all",
            isBull
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
              : isBear
              ? "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
              : "border-border bg-muted text-muted-foreground hover:bg-accent",
          )}
        >
          Trade This
          <ExternalLink className="h-2.5 w-2.5" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface TradeIdeaFeedProps {
  maxItems?: number;
  /** When true, only shows top 3 ideas with a "See all" toggle (kept for backward compat) */
  compact?: boolean;
}

export function TradeIdeaFeed({ maxItems = 10, compact = false }: TradeIdeaFeedProps) {
  const [filter, setFilter] = useState<FilterMode>("all");
  const [ideas, setIdeas] = useState<TradeIdea[]>([]);
  const generationRef = useRef(0);

  const activeIndicators = useChartStore((s) => s.activeIndicators);
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);
  const positions = useTradingStore((s) => s.positions);
  const tradeHistory = useTradingStore((s) => s.tradeHistory);

  // Generate trade ideas from current data + time bucket
  const generateIdeas = useCallback(() => {
    const visibleData = allData.slice(0, revealedCount);
    if (visibleData.length < 5) return;

    const timeBucket = Math.floor(Date.now() / 30000);
    const prng = mulberry32(revealedCount * 31337 + timeBucket);
    const newIdeas: TradeIdea[] = [];

    for (const ticker of ALL_TICKERS) {
      try {
        let score: number;
        let bias: "bullish" | "bearish" | "neutral";
        let conviction: "low" | "medium" | "high";
        let setupName: string | null;
        let summary: string;

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
          const raw = (prng() - 0.5) * 160;
          score = Math.round(Math.max(-100, Math.min(100, raw)));
          bias = score >= 15 ? "bullish" : score <= -15 ? "bearish" : "neutral";
          conviction =
            Math.abs(score) >= 50
              ? "high"
              : Math.abs(score) >= 25
              ? "medium"
              : "low";
          const names = score >= 15 ? SETUP_NAMES_BULL : SETUP_NAMES_BEAR;
          const nameIdx = Math.floor(prng() * names.length);
          setupName = names[nameIdx] ?? null;
          summary = `Synthetic signal for ${ticker}.`;
        }

        const direction: TradeIdea["direction"] =
          bias === "bullish" ? "long" : bias === "bearish" ? "short" : "neutral";

        const { entry, target, stop, rr } = buildPriceLevels(
          ticker,
          timeBucket,
          score,
        );

        // Confidence: map |score| 0..100 → 30..95
        const confidence = Math.round(30 + (Math.abs(score) / 100) * 65);

        newIdeas.push({
          id: `${ticker}-${timeBucket}`,
          ticker,
          direction,
          score,
          setupName,
          conviction,
          summary,
          entryPrice: entry,
          targetPrice: target,
          stopPrice: stop,
          rrRatio: rr,
          confidence,
          timestamp: timeBucket * 30000,
        });
      } catch {
        // skip
      }
    }

    // Sort by |score| descending, newest-first (all same timeBucket so order is stable)
    const sorted = newIdeas
      .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
      .slice(0, maxItems);

    setIdeas(sorted);
  }, [allData, revealedCount, activeIndicators, positions, tradeHistory, maxItems]);

  // Initial generation + 30s refresh
  useEffect(() => {
    generationRef.current += 1;
    generateIdeas();

    const interval = setInterval(() => {
      generateIdeas();
    }, 30000);

    return () => clearInterval(interval);
  }, [generateIdeas]);

  // Filter chips
  const filterOptions: { value: FilterMode; label: string }[] = [
    { value: "all", label: "All" },
    { value: "long", label: "Long Only" },
    { value: "short", label: "Short Only" },
    { value: "high_conf", label: "High Conf" },
  ];

  const filtered = ideas.filter((idea) => {
    if (filter === "long") return idea.direction === "long";
    if (filter === "short") return idea.direction === "short";
    if (filter === "high_conf") return idea.confidence > 70;
    return true;
  });

  const displayIdeas = compact ? filtered.slice(0, 3) : filtered;

  if (ideas.length === 0) {
    return (
      <p className="text-[11px] text-muted-foreground text-center py-2">
        Advance the chart to generate trade ideas.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {/* Filter chips */}
      <div className="flex gap-0.5 flex-wrap">
        {filterOptions.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded border px-1.5 py-0.5 text-[8px] font-bold leading-none transition-all",
              filter === f.value
                ? "bg-primary/15 border-primary/30 text-primary"
                : "border-border bg-muted text-muted-foreground hover:text-foreground hover:bg-accent",
            )}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-[7.5px] text-muted-foreground/40 self-center pr-0.5">
          Refreshes every 30s
        </span>
      </div>

      {/* Ideas list */}
      <div className="space-y-1.5">
        <AnimatePresence mode="popLayout" initial={false}>
          {displayIdeas.map((idea, i) => (
            <IdeaCard key={idea.id + filter} idea={idea} index={i} />
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <p className="text-[11px] text-muted-foreground text-center py-1.5">
          No results for current filter.
        </p>
      )}
    </div>
  );
}
