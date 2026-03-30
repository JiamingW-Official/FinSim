"use client";

import { useChartStore, type IndicatorType, type ChartType } from "@/stores/chart-store";
import { TIMEFRAME_OPTIONS, WATCHLIST_STOCKS } from "@/types/market";
import type { Timeframe } from "@/types/market";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Grid,
  Calendar,
  DollarSign,
} from "lucide-react";
import { INDICATOR_EXPLANATIONS } from "@/data/indicator-explanations";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const INDICATOR_OPTIONS: { value: IndicatorType; label: string }[] = [
  { value: "sma20", label: "SMA20" },
  { value: "sma50", label: "SMA50" },
  { value: "ema12", label: "EMA12" },
  { value: "ema26", label: "EMA26" },
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

const CHART_TYPE_OPTIONS: { value: ChartType; label: string; title: string }[] = [
  { value: "candlestick", label: "Candle", title: "Candlestick chart" },
  { value: "heikin_ashi", label: "HA", title: "Heikin Ashi — smoothed candles" },
  { value: "line", label: "Line", title: "Line chart (close prices)" },
  { value: "area", label: "Area", title: "Area chart (filled)" },
];

const intradayOptions = TIMEFRAME_OPTIONS.filter((o) => o.group === "intraday");
const dailyOptions = TIMEFRAME_OPTIONS.filter((o) => o.group === "daily");

function Sep() {
  return <span className="h-3 w-px bg-border/30 mx-1 shrink-0" />;
}

export function ChartToolbar() {
  const {
    currentTicker,
    currentTimeframe,
    activeIndicators,
    chartType,
    showVolume,
    showGrid,
    useLog,
    showEarnings,
    showDividends,
    setTicker,
    setTimeframe,
    toggleIndicator,
    setChartType,
    setShowVolume,
    setShowGrid,
    setUseLog,
    setShowEarnings,
    setShowDividends,
  } = useChartStore();

  return (
    <div className="flex h-8 items-center justify-between border-b border-border/30 bg-transparent px-2 gap-1 overflow-x-auto scrollbar-none">
      {/* LEFT: controls */}
      <div className="flex items-center gap-1 min-w-0 shrink-0">

        {/* Timeframe pill group — intraday */}
        <div className="flex items-center rounded border border-border/30 overflow-hidden">
          {intradayOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTimeframe(opt.value as Timeframe)}
              className={cn(
                "px-2 py-1 text-[9px] font-mono uppercase transition-colors border-r border-border/20 last:border-r-0",
                currentTimeframe === opt.value
                  ? "bg-foreground/10 text-foreground/80 font-semibold"
                  : "text-muted-foreground/30 hover:text-muted-foreground/60 bg-transparent",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Timeframe pill group — daily */}
        <div className="flex items-center rounded border border-border/30 overflow-hidden">
          {dailyOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTimeframe(opt.value as Timeframe)}
              className={cn(
                "px-2 py-1 text-[9px] font-mono uppercase transition-colors border-r border-border/20 last:border-r-0",
                currentTimeframe === opt.value
                  ? "bg-foreground/10 text-foreground/80 font-semibold"
                  : "text-muted-foreground/30 hover:text-muted-foreground/60 bg-transparent",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <Sep />

        {/* Chart type */}
        <div className="flex items-center gap-0.5">
          {CHART_TYPE_OPTIONS.map((opt) => (
            <Tooltip key={opt.value}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setChartType(opt.value)}
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[9px] font-mono uppercase transition-colors",
                    chartType === opt.value
                      ? "bg-foreground/10 text-foreground/80 font-semibold"
                      : "text-muted-foreground/30 hover:text-muted-foreground/60",
                  )}
                >
                  {opt.label}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={4} className="text-[10px]">
                {opt.title}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <Sep />

        {/* Display toggles: Vol, Grid, Log */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setShowVolume(!showVolume)}
                className={cn(
                  "rounded p-0.5 transition-colors",
                  showVolume
                    ? "text-foreground/70"
                    : "text-muted-foreground/25 hover:text-muted-foreground/50",
                )}
                aria-label="Toggle volume"
              >
                <BarChart className="h-3 w-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={4} className="text-[10px]">
              {showVolume ? "Hide volume" : "Show volume"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setShowGrid(!showGrid)}
                className={cn(
                  "rounded p-0.5 transition-colors",
                  showGrid
                    ? "text-foreground/70"
                    : "text-muted-foreground/25 hover:text-muted-foreground/50",
                )}
                aria-label="Toggle grid"
              >
                <Grid className="h-3 w-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={4} className="text-[10px]">
              {showGrid ? "Hide grid lines" : "Show grid lines"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setUseLog(!useLog)}
                className={cn(
                  "rounded px-1.5 py-0.5 text-[9px] font-mono uppercase transition-colors",
                  useLog
                    ? "bg-foreground/10 text-foreground/80 font-semibold"
                    : "text-muted-foreground/25 hover:text-muted-foreground/50",
                )}
                aria-label="Toggle log scale"
              >
                Log
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={4} className="text-[10px]">
              {useLog ? "Switch to linear scale" : "Switch to logarithmic scale"}
            </TooltipContent>
          </Tooltip>
        </div>

        <Sep />

        {/* Annotation toggles: Earnings, Dividends */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setShowEarnings(!showEarnings)}
                className={cn(
                  "flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-mono uppercase transition-colors",
                  showEarnings
                    ? "bg-foreground/10 text-foreground/80 font-semibold"
                    : "text-muted-foreground/25 hover:text-muted-foreground/50",
                )}
                aria-label="Toggle earnings markers"
              >
                <Calendar className="h-2.5 w-2.5" />
                <span>E</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={4} className="text-[10px]">
              {showEarnings ? "Hide earnings dates" : "Show earnings dates"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setShowDividends(!showDividends)}
                className={cn(
                  "flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-mono uppercase transition-colors",
                  showDividends
                    ? "bg-foreground/10 text-foreground/80 font-semibold"
                    : "text-muted-foreground/25 hover:text-muted-foreground/50",
                )}
                aria-label="Toggle dividend markers"
              >
                <DollarSign className="h-2.5 w-2.5" />
                <span>D</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={4} className="text-[10px]">
              {showDividends ? "Hide dividend markers" : "Show ex-dividend dates"}
            </TooltipContent>
          </Tooltip>
        </div>

        <Sep />

        {/* Indicators */}
        <div className="flex flex-wrap items-center gap-0.5">
          {INDICATOR_OPTIONS.map((opt) => (
            <Tooltip key={opt.value}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => toggleIndicator(opt.value)}
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[9px] font-mono transition-colors",
                    activeIndicators.includes(opt.value)
                      ? "bg-primary/10 text-primary/70"
                      : "text-muted-foreground/25 hover:text-muted-foreground/50",
                  )}
                >
                  {opt.label}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={4} className="text-[10px]">
                {INDICATOR_EXPLANATIONS[opt.value].shortDesc}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* RIGHT: Ticker selector */}
      <select
        value={currentTicker}
        onChange={(e) => setTicker(e.target.value)}
        title="Select ticker"
        aria-label="Select ticker"
        className="shrink-0 rounded border border-border/30 bg-transparent px-2 py-0.5 text-[11px] font-bold text-foreground/80 outline-none focus-visible:ring-1 focus-visible:ring-ring/50 cursor-pointer"
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
