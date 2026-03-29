"use client";

import { useMemo } from "react";
import { useChartStore } from "@/stores/chart-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { analyzeTradeSetup } from "@/services/ai/engine";
import { useTradingStore } from "@/stores/trading-store";
import { cn } from "@/lib/utils";
import type { IndicatorType } from "@/stores/chart-store";

// ─── Color helpers ────────────────────────────────────────────────────────────

const REGIME_BORDER: Record<string, string> = {
  strong_bull: "border-emerald-500/50",
  bull:        "border-green-500/40",
  ranging:     "border-amber-500/40",
  bear:        "border-orange-500/40",
  strong_bear: "border-red-500/50",
};

const REGIME_LABEL_COLOR: Record<string, string> = {
  strong_bull: "text-emerald-400",
  bull:        "text-green-400",
  ranging:     "text-amber-400",
  bear:        "text-orange-400",
  strong_bear: "text-red-400",
};

const REGIME_DOT: Record<string, string> = {
  strong_bull: "bg-emerald-400",
  bull:        "bg-green-400",
  ranging:     "bg-amber-400",
  bear:        "bg-orange-400",
  strong_bear: "bg-red-400",
};

const BIAS_COLOR: Record<string, string> = {
  bullish: "text-green-400",
  bearish: "text-red-400",
  neutral: "text-amber-400",
};

const CONVICTION_COLOR: Record<string, string> = {
  high:   "text-primary",
  medium: "text-orange-400",
  low:    "text-muted-foreground",
};

// ─── Regime description map ───────────────────────────────────────────────────

const REGIME_WHY: Record<string, string> = {
  strong_bull: "ADX confirms a strong directional trend with price above rising moving averages. Trend-following setups have the highest statistical edge in this regime. Avoid counter-trend fades.",
  bull:        "Price is holding above SMA20 with moderate trend strength. Momentum trades outperform mean-reversion here. Pullbacks to the moving average are buyable.",
  ranging:     "Low ADX and price oscillating between support and resistance. Oscillator-based entries at extremes are more reliable than breakout trades. Wait for volume-confirmed direction.",
  bear:        "Price is trading below SMA20 and momentum is rolling over. Selling rallies into resistance has higher probability than buying dips. Reduce long exposure.",
  strong_bear: "Strong downtrend confirmed by ADX and price below declining moving averages. Counter-trend longs carry high failure rates. Capital preservation is priority.",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function MarketRegimeCard() {
  const currentTicker = useChartStore((s) => s.currentTicker);
  const activeIndicators = useChartStore((s) => s.activeIndicators);
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);
  const positions = useTradingStore((s) => s.positions);
  const tradeHistory = useTradingStore((s) => s.tradeHistory);

  const result = useMemo(() => {
    const visibleData = allData.slice(0, revealedCount);
    if (visibleData.length < 5) return null;
    try {
      return analyzeTradeSetup({
        visibleData,
        activeIndicators: activeIndicators as IndicatorType[],
        positions,
        currentTicker,
        tradeHistory,
      });
    } catch {
      return null;
    }
  }, [allData, revealedCount, activeIndicators, positions, currentTicker, tradeHistory]);

  if (!result) {
    return (
      <div className="border-b border-border/40 px-3 py-2 text-xs text-muted-foreground">
        Advance the chart to detect market regime.
      </div>
    );
  }

  const { regime, bias, conviction } = result;
  const borderCls = REGIME_BORDER[regime.regime] ?? "border-border/40";
  const labelCls  = REGIME_LABEL_COLOR[regime.regime] ?? "text-foreground";
  const dotCls    = REGIME_DOT[regime.regime] ?? "bg-muted-foreground";
  const biasCls   = BIAS_COLOR[bias] ?? "text-foreground";
  const convCls   = CONVICTION_COLOR[conviction] ?? "text-muted-foreground";
  const why       = REGIME_WHY[regime.regime] ?? "Insufficient data for regime analysis.";

  return (
    <div
      className={cn(
        "border-b px-3 py-2.5 bg-card/60 space-y-1.5",
        borderCls,
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-2">
        <div className={cn("h-2 w-2 rounded-full shrink-0", dotCls)} />
        <span className={cn("text-[11px] font-bold tracking-wide", labelCls)}>
          {regime.label}
        </span>
        <span className="text-[11px] text-muted-foreground font-medium ml-auto">
          {currentTicker} regime
        </span>
      </div>

      {/* Bias / Conviction chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span
          className={cn(
            "rounded border px-1.5 py-0.5 text-[11px] font-bold leading-none",
            bias === "bullish"
              ? "bg-green-500/10 border-green-500/25"
              : bias === "bearish"
              ? "bg-red-500/5 border-red-500/25"
              : "bg-amber-500/10 border-amber-500/25",
            biasCls,
          )}
        >
          {bias.toUpperCase()}
        </span>
        <span
          className={cn(
            "rounded border px-1.5 py-0.5 text-[11px] font-bold leading-none",
            conviction === "high"
              ? "bg-primary/10 border-primary/25"
              : conviction === "medium"
              ? "bg-orange-500/10 border-orange-500/25"
              : "bg-muted border-border/40",
            convCls,
          )}
        >
          {conviction.toUpperCase()} CONVICTION
        </span>
        <span
          className={cn(
            "rounded border px-1.5 py-0.5 text-[11px] font-bold leading-none text-muted-foreground border-border/40 bg-muted",
          )}
        >
          ADX: {regime.adxLevel}
        </span>
      </div>

      {/* Why explanation */}
      <p className="text-[11px] text-muted-foreground leading-snug">{why}</p>

    </div>
  );
}
