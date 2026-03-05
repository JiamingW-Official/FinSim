"use client";

import { useChartStore, type IndicatorType } from "@/stores/chart-store";
import { TIMEFRAME_OPTIONS, WATCHLIST_STOCKS, INTRADAY_TIMEFRAMES } from "@/types/market";
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

  const isIntraday = INTRADAY_TIMEFRAMES.has(currentTimeframe as Timeframe);

  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-3 py-1.5">
      <div className="flex items-center gap-1">
        {/* Intraday timeframes */}
        <div className="flex items-center gap-0.5">
          {intradayOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTimeframe(opt.value as Timeframe)}
              className={cn(
                "rounded px-2 py-0.5 text-[10px] font-medium transition-colors",
                currentTimeframe === opt.value
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className="mx-0.5 h-4 w-px bg-border/60" />

        {/* Daily / weekly timeframes */}
        <div className="flex items-center gap-0.5">
          {dailyOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTimeframe(opt.value as Timeframe)}
              className={cn(
                "rounded px-2 py-0.5 text-[10px] font-medium transition-colors",
                currentTimeframe === opt.value
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Indicators — only shown in daily/weekly view */}
        {!isIntraday && (
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
        )}

        {/* Intraday label */}
        {isIntraday && (
          <span className="ml-3 text-[9px] text-muted-foreground/60 italic">
            Simulated intraday · Indicators available in 1D / 1W view
          </span>
        )}
      </div>

      <select
        value={currentTicker}
        onChange={(e) => setTicker(e.target.value)}
        title="Select ticker"
        aria-label="Select ticker"
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
