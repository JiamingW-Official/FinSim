"use client";

import { useChartStore, type IndicatorType } from "@/stores/chart-store";
import { TIMEFRAME_OPTIONS, WATCHLIST_STOCKS } from "@/types/market";
import type { Timeframe } from "@/types/market";
import { cn } from "@/lib/utils";
import { LineChart } from "lucide-react";

const INDICATOR_OPTIONS: { value: IndicatorType; label: string }[] = [
  { value: "sma20", label: "SMA 20" },
  { value: "sma50", label: "SMA 50" },
  { value: "ema12", label: "EMA 12" },
  { value: "ema26", label: "EMA 26" },
  { value: "bollinger", label: "BB" },
  { value: "rsi", label: "RSI" },
];

export function ChartToolbar() {
  const {
    currentTicker,
    currentTimeframe,
    activeIndicators,
    setTicker,
    setTimeframe,
    toggleIndicator,
  } = useChartStore();

  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-3 py-1.5">
      <div className="flex items-center gap-1">
        {TIMEFRAME_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setTimeframe(opt.value as Timeframe)}
            className={cn(
              "rounded px-2.5 py-1 text-xs font-medium transition-colors",
              currentTimeframe === opt.value
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
            )}
          >
            {opt.label}
          </button>
        ))}

        {/* Indicators */}
        <div className="ml-2 flex items-center gap-1 border-l border-border pl-2">
          <LineChart className="mr-0.5 h-3 w-3 text-muted-foreground" />
          {INDICATOR_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggleIndicator(opt.value)}
              className={cn(
                "rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
                activeIndicators.includes(opt.value)
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <select
        value={currentTicker}
        onChange={(e) => setTicker(e.target.value)}
        className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
      >
        {WATCHLIST_STOCKS.map((stock) => (
          <option key={stock.ticker} value={stock.ticker}>
            {stock.ticker} — {stock.name}
          </option>
        ))}
      </select>
    </div>
  );
}
