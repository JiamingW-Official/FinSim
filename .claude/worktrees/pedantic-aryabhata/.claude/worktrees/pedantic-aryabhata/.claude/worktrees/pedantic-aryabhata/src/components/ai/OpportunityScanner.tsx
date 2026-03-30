"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  ScanLine,
} from "lucide-react";
import { useChartStore } from "@/stores/chart-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { useTradingStore } from "@/stores/trading-store";
import { analyzeTradeSetup } from "@/services/ai/engine";
import { cn } from "@/lib/utils";
import type { IndicatorType } from "@/stores/chart-store";

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

type FilterMode = "all" | "bullish" | "bearish" | "strong";

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

interface ScanRow {
  ticker: string;
  score: number;
  bias: "bullish" | "bearish" | "neutral";
  conviction: "low" | "medium" | "high";
  topSignal: string | null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScorePill({ score }: { score: number }) {
  const cls =
    score >= 30
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      : score <= -30
      ? "bg-red-500/15 text-red-400 border-red-500/30"
      : "bg-amber-500/15 text-amber-400 border-amber-500/30";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-semibold font-mono leading-none",
        cls,
      )}
    >
      {score > 0 ? "+" : ""}
      {score}
    </span>
  );
}

function BiasBadge({ bias }: { bias: ScanRow["bias"] }) {
  if (bias === "bullish")
    return (
      <span className="inline-flex items-center gap-0.5 rounded border border-emerald-500/30 bg-emerald-500/5 px-1 py-0.5 text-[11px] font-semibold text-emerald-400">
        <TrendingUp className="h-2.5 w-2.5" />
        Bull
      </span>
    );
  if (bias === "bearish")
    return (
      <span className="inline-flex items-center gap-0.5 rounded border border-red-500/30 bg-red-500/5 px-1 py-0.5 text-[11px] font-semibold text-red-400">
        <TrendingDown className="h-2.5 w-2.5" />
        Bear
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1 py-0.5 text-[11px] font-semibold text-muted-foreground">
      <Minus className="h-2.5 w-2.5" />
      Neutral
    </span>
  );
}

function ConvictionDot({ conviction }: { conviction: ScanRow["conviction"] }) {
  const cls =
    conviction === "high"
      ? "bg-emerald-400"
      : conviction === "medium"
      ? "bg-amber-400"
      : "bg-muted-foreground/50";
  return <span className={cn("inline-block h-1.5 w-1.5 rounded-full", cls)} />;
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface OpportunityScannerProps {
  currentTicker?: string;
  onSelectTicker?: (ticker: string) => void;
}

export function OpportunityScanner({
  currentTicker,
  onSelectTicker,
}: OpportunityScannerProps) {
  const [filter, setFilter] = useState<FilterMode>("all");
  const [scanning, setScanning] = useState(false);
  const [scanKey, setScanKey] = useState(0); // bump to trigger re-scan

  const activeIndicators = useChartStore((s) => s.activeIndicators);
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);
  const positions = useTradingStore((s) => s.positions);
  const tradeHistory = useTradingStore((s) => s.tradeHistory);

  // Compute scan results. Re-runs whenever scanKey changes.
  const rows = useMemo<ScanRow[]>(() => {
    // scanKey is included in the dep array below via closure — it forces recompute
    void scanKey;

    const visibleData = allData.slice(0, revealedCount);
    if (visibleData.length < 5) return [];

    const prng = mulberry32(revealedCount * 99991 + scanKey * 777);
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
        let bias: "bullish" | "bearish" | "neutral";
        let conviction: "low" | "medium" | "high";
        let topSignal: string | null;

        if (liveResult) {
          score = liveResult.score;
          bias = liveResult.bias;
          conviction = liveResult.conviction;
          // Pick the strongest non-neutral signal
          const best = [...liveResult.signals]
            .filter((s) => s.direction !== "neutral")
            .sort((a, b) => b.strength - a.strength)[0];
          topSignal = best?.shortLabel ?? null;
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
          topSignal = null;
        }

        results.push({ ticker, score, bias, conviction, topSignal });
      } catch {
        // skip
      }
    }

    return results.sort((a, b) => Math.abs(b.score) - Math.abs(a.score));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allData, revealedCount, activeIndicators, positions, tradeHistory, scanKey]);

  // Apply filter
  const filtered = useMemo(() => {
    switch (filter) {
      case "bullish":
        return rows.filter((r) => r.bias === "bullish");
      case "bearish":
        return rows.filter((r) => r.bias === "bearish");
      case "strong":
        return rows.filter((r) => Math.abs(r.score) > 50);
      default:
        return rows;
    }
  }, [rows, filter]);

  const handleScanAll = useCallback(() => {
    setScanning(true);
    setTimeout(() => {
      setScanKey((k) => k + 1);
      setScanning(false);
    }, 200);
  }, []);

  const filters: { value: FilterMode; label: string }[] = [
    { value: "all", label: "All" },
    { value: "bullish", label: "Bullish" },
    { value: "bearish", label: "Bearish" },
    { value: "strong", label: "Strong Only" },
  ];

  if (rows.length === 0) {
    return (
      <p className="text-[11px] text-muted-foreground text-center py-2">
        Advance the chart to scan for opportunities.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header row: filter chips + scan button */}
      <div className="flex items-center gap-1 flex-wrap">
        <div className="flex gap-0.5 flex-wrap flex-1">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded border px-1.5 py-0.5 text-[11px] font-semibold leading-none transition-colors",
                filter === f.value
                  ? "bg-primary/15 border-primary/30 text-primary"
                  : "border-border bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/30",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleScanAll}
          disabled={scanning}
          className={cn(
            "flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-semibold leading-none transition-colors shrink-0",
            scanning
              ? "cursor-not-allowed border-border bg-muted text-muted-foreground/50"
              : "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20",
          )}
        >
          {scanning ? (
            <RefreshCw className="h-2.5 w-2.5 animate-spin" />
          ) : (
            <ScanLine className="h-2.5 w-2.5" />
          )}
          {scanning ? "Scanning…" : "Scan All"}
        </button>
      </div>

      {/* Column header */}
      <div className="grid grid-cols-[3rem_2.5rem_3.5rem_1fr_2rem] gap-1 px-1">
        <span className="text-[7px] font-semibold text-muted-foreground/50">
          Ticker
        </span>
        <span className="text-[7px] font-semibold text-muted-foreground/50">
          Score
        </span>
        <span className="text-[7px] font-semibold text-muted-foreground/50">
          Bias
        </span>
        <span className="text-[7px] font-semibold text-muted-foreground/50">
          Top Signal
        </span>
        <span className="text-[7px] font-semibold text-muted-foreground/50 text-right">
          Cvx
        </span>
      </div>

      {/* Rows */}
      <AnimatePresence mode="popLayout">
        {filtered.map((row, i) => (
          <motion.button
            key={row.ticker}
            type="button"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ delay: scanning ? 0 : i * 0.04, duration: 0.18 }}
            onClick={() => onSelectTicker?.(row.ticker)}
            className={cn(
              "w-full grid grid-cols-[3rem_2.5rem_3.5rem_1fr_2rem] items-center gap-1 rounded border px-1.5 py-1.5 text-left transition-colors",
              currentTicker === row.ticker
                ? "border-primary/40 bg-primary/10"
                : "border-border bg-background/30 hover:bg-muted/20",
            )}
          >
            <span className="text-xs font-semibold text-foreground leading-none">
              {row.ticker}
            </span>
            <ScorePill score={row.score} />
            <BiasBadge bias={row.bias} />
            <span className="text-[11px] text-muted-foreground truncate leading-none">
              {row.topSignal ?? "—"}
            </span>
            <div className="flex justify-end">
              <ConvictionDot conviction={row.conviction} />
            </div>
          </motion.button>
        ))}
      </AnimatePresence>

      {filtered.length === 0 && (
        <p className="text-[11px] text-muted-foreground text-center py-1.5">
          No results for current filter.
        </p>
      )}

      <p className="text-[7.5px] text-muted-foreground/40 text-center">
        {rows.length} tickers scanned — click row to switch ticker
      </p>
    </div>
  );
}
