"use client";

import { useState } from "react";
import { useChartStore, type IndicatorType } from "@/stores/chart-store";
import { TIMEFRAME_OPTIONS, WATCHLIST_STOCKS } from "@/types/market";
import type { Timeframe } from "@/types/market";
import { cn } from "@/lib/utils";
import { LineChart, ChevronDown } from "lucide-react";
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
  { value: "adx", label: "ADX" },
  { value: "obv", label: "OBV" },
  { value: "cci", label: "CCI" },
  { value: "williams_r", label: "%R" },
  { value: "psar", label: "PSAR" },
];

const intradayOptions = TIMEFRAME_OPTIONS.filter((o) => o.group === "intraday");
const dailyOptions = TIMEFRAME_OPTIONS.filter((o) => o.group === "daily");

export function ChartToolbar() {
  const {
    currentTicker,
    currentTimeframe,
    activeIndicators,
    setTicker,
    setTimeframe,
    toggleIndicator,
  } = useChartStore();

  const [showIndicators, setShowIndicators] = useState(false);

  return (
    <div className="border-b border-border bg-card">
      {/* Top row: timeframes + ticker + indicator toggle */}
      <div className="flex items-center justify-between px-2 py-1">
        <div className="flex items-center gap-0.5">
          {/* Timeframes */}
          {intradayOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTimeframe(opt.value as Timeframe)}
              className={cn(
                "rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
                currentTimeframe === opt.value
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
          <div className="mx-0.5 h-3 w-px bg-border/40" />
          {dailyOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTimeframe(opt.value as Timeframe)}
              className={cn(
                "rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
                currentTimeframe === opt.value
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          {/* Indicator toggle button */}
          <button
            type="button"
            onClick={() => setShowIndicators(!showIndicators)}
            className={cn(
              "flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
              showIndicators || activeIndicators.length > 0
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LineChart className="h-3 w-3" />
            <span className="hidden sm:inline">Indicators</span>
            {activeIndicators.length > 0 && (
              <span className="ml-0.5 rounded-full bg-primary/20 px-1 text-[9px]">
                {activeIndicators.length}
              </span>
            )}
            <ChevronDown className={cn("h-2.5 w-2.5 transition-transform", showIndicators && "rotate-180")} />
          </button>

          {/* Ticker selector */}
          <select
            value={currentTicker}
            onChange={(e) => setTicker(e.target.value)}
            title="Select ticker"
            aria-label="Select ticker"
            className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-foreground outline-none focus:ring-1 focus:ring-primary"
          >
            {WATCHLIST_STOCKS.map((stock) => (
              <option key={stock.ticker} value={stock.ticker}>
                {stock.ticker} — {stock.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Collapsible indicator panel */}
      {showIndicators && (
        <div className="flex flex-wrap items-center gap-1 border-t border-border/40 px-2 py-1.5">
          {INDICATOR_OPTIONS.map((opt) => (
            <Tooltip key={opt.value}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => toggleIndicator(opt.value)}
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors",
                    activeIndicators.includes(opt.value)
                      ? "bg-primary/15 text-primary"
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
      )}
    </div>
  );
}
