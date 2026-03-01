"use client";

import { useChartStore, type IndicatorType } from "@/stores/chart-store";
import { TIMEFRAME_OPTIONS, WATCHLIST_STOCKS } from "@/types/market";
import type { Timeframe } from "@/types/market";
import { cn } from "@/lib/utils";
import { LineChart } from "lucide-react";
import { INDICATOR_EXPLANATIONS } from "@/data/indicator-explanations";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const INDICATOR_OPTIONS: { value: IndicatorType; label: string }[] = [
  { value: "sma20", label: "SMA 20" },
  { value: "sma50", label: "SMA 50" },
  { value: "ema12", label: "EMA 12" },
  { value: "ema26", label: "EMA 26" },
  { value: "bollinger", label: "BB" },
  { value: "rsi", label: "RSI" },
  { value: "macd", label: "MACD" },
  { value: "stochastic", label: "STOCH" },
  { value: "atr", label: "ATR" },
  { value: "vwap", label: "VWAP" },
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
        <div className="ml-2 flex flex-wrap items-center gap-1 border-l border-border pl-2">
          <LineChart className="mr-0.5 h-3 w-3 text-muted-foreground" />
          {INDICATOR_OPTIONS.map((opt) => (
            <Tooltip key={opt.value}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => toggleIndicator(opt.value)}
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium transition-all duration-200",
                    activeIndicators.includes(opt.value)
                      ? "bg-primary/15 text-primary shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  {opt.label}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={4}>
                {INDICATOR_EXPLANATIONS[opt.value].shortDesc}
              </TooltipContent>
            </Tooltip>
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
