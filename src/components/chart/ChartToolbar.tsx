"use client";

import { useChartStore, type IndicatorType, type ChartType } from "@/stores/chart-store";
import { TIMEFRAME_OPTIONS, WATCHLIST_STOCKS } from "@/types/market";
import type { Timeframe } from "@/types/market";
import { cn } from "@/lib/utils";
import {
 LineChart,
 CandlestickChart,
 BarChart2,
 AreaChart,
 BarChart,
 Grid,
 TrendingUp,
 Calendar,
 DollarSign,
} from "lucide-react";
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

const CHART_TYPE_OPTIONS: { value: ChartType; label: string; title: string }[] = [
 { value: "candlestick", label: "Candle", title: "Candlestick chart" },
 { value: "heikin_ashi", label: "HA", title: "Heikin Ashi — smoothed candles" },
 { value: "line", label: "Line", title: "Line chart (close prices)" },
 { value: "area", label: "Area", title: "Area chart (filled)" },
];

const intradayOptions = TIMEFRAME_OPTIONS.filter((o) => o.group === "intraday");
const dailyOptions = TIMEFRAME_OPTIONS.filter((o) => o.group === "daily");

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
 <div className="flex flex-wrap items-center justify-between gap-y-0.5 border-b border-border bg-transparent px-3 py-1">
 <div className="flex flex-wrap items-center gap-1">
 {/* Intraday timeframes */}
 <div className="flex items-center gap-0.5">
 {intradayOptions.map((opt) => (
 <button
 key={opt.value}
 type="button"
 onClick={() => setTimeframe(opt.value as Timeframe)}
 className={cn(
 "rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors",
 currentTimeframe === opt.value
 ? "bg-foreground/[0.06] text-foreground"
 : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-foreground/[0.03]",
 )}
 >
 {opt.label}
 </button>
 ))}
 </div>

 {/* Separator */}
 <div className="mx-0.5 h-3 w-px bg-border" />

 {/* Daily / weekly timeframes */}
 <div className="flex items-center gap-0.5">
 {dailyOptions.map((opt) => (
 <button
 key={opt.value}
 type="button"
 onClick={() => setTimeframe(opt.value as Timeframe)}
 className={cn(
 "rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors",
 currentTimeframe === opt.value
 ? "bg-foreground/[0.06] text-foreground"
 : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-foreground/[0.03]",
 )}
 >
 {opt.label}
 </button>
 ))}
 </div>

 {/* Separator */}
 <div className="mx-0.5 h-3 w-px bg-border" />

 {/* Chart Type Selector */}
 <div className="flex items-center gap-0.5">
 {CHART_TYPE_OPTIONS.map((opt) => (
 <Tooltip key={opt.value}>
 <TooltipTrigger asChild>
 <button
 type="button"
 onClick={() => setChartType(opt.value)}
 className={cn(
 "rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors",
 chartType === opt.value
 ? "bg-foreground/[0.06] text-foreground"
 : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-foreground/[0.03]",
 )}
 >
 {opt.label}
 </button>
 </TooltipTrigger>
 <TooltipContent side="bottom" sideOffset={4}>
 {opt.title}
 </TooltipContent>
 </Tooltip>
 ))}
 </div>

 {/* Separator */}
 <div className="mx-0.5 h-3 w-px bg-border" />

 {/* Display Options */}
 <div className="flex items-center gap-0.5">
 <Tooltip>
 <TooltipTrigger asChild>
 <button
 type="button"
 onClick={() => setShowVolume(!showVolume)}
 className={cn(
 "rounded p-0.5 transition-colors",
 showVolume
 ? "text-foreground"
 : "text-muted-foreground/30 hover:text-muted-foreground hover:bg-foreground/[0.03]",
 )}
 aria-label="Toggle volume"
 >
 <BarChart className="h-3 w-3" />
 </button>
 </TooltipTrigger>
 <TooltipContent side="bottom" sideOffset={4}>
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
 ? "text-foreground"
 : "text-muted-foreground/30 hover:text-muted-foreground hover:bg-foreground/[0.03]",
 )}
 aria-label="Toggle grid"
 >
 <Grid className="h-3 w-3" />
 </button>
 </TooltipTrigger>
 <TooltipContent side="bottom" sideOffset={4}>
 {showGrid ? "Hide grid lines" : "Show grid lines"}
 </TooltipContent>
 </Tooltip>

 <Tooltip>
 <TooltipTrigger asChild>
 <button
 type="button"
 onClick={() => setUseLog(!useLog)}
 className={cn(
 "rounded px-1 py-0.5 text-[11px] font-medium transition-colors",
 useLog
 ? "bg-foreground/[0.06] text-foreground"
 : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-foreground/[0.03]",
 )}
 aria-label="Toggle log scale"
 >
 Log
 </button>
 </TooltipTrigger>
 <TooltipContent side="bottom" sideOffset={4}>
 {useLog ? "Switch to linear scale" : "Switch to logarithmic scale"}
 </TooltipContent>
 </Tooltip>
 </div>

 {/* Separator */}
 <div className="mx-0.5 h-3 w-px bg-border" />

 {/* Annotation Toggles */}
 <div className="flex items-center gap-0.5">
 <Tooltip>
 <TooltipTrigger asChild>
 <button
 type="button"
 onClick={() => setShowEarnings(!showEarnings)}
 className={cn(
 "flex items-center gap-0.5 rounded px-1 py-0.5 text-[11px] font-medium transition-colors",
 showEarnings
 ? "bg-foreground/[0.06] text-foreground"
 : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-foreground/[0.03]",
 )}
 aria-label="Toggle earnings markers"
 >
 <Calendar className="h-2.5 w-2.5" />
 <span>E</span>
 </button>
 </TooltipTrigger>
 <TooltipContent side="bottom" sideOffset={4}>
 {showEarnings ? "Hide earnings dates" : "Show earnings dates"}
 </TooltipContent>
 </Tooltip>

 <Tooltip>
 <TooltipTrigger asChild>
 <button
 type="button"
 onClick={() => setShowDividends(!showDividends)}
 className={cn(
 "flex items-center gap-0.5 rounded px-1 py-0.5 text-[11px] font-medium transition-colors",
 showDividends
 ? "bg-foreground/[0.06] text-foreground"
 : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-foreground/[0.03]",
 )}
 aria-label="Toggle dividend markers"
 >
 <DollarSign className="h-2.5 w-2.5" />
 <span>D</span>
 </button>
 </TooltipTrigger>
 <TooltipContent side="bottom" sideOffset={4}>
 {showDividends ? "Hide dividend markers" : "Show ex-dividend dates"}
 </TooltipContent>
 </Tooltip>
 </div>

 {/* Indicators */}
 <div className="ml-1 flex flex-wrap items-center gap-0.5 border-l border-border pl-2">
 {INDICATOR_OPTIONS.map((opt) => (
 <Tooltip key={opt.value}>
 <TooltipTrigger asChild>
 <button
 type="button"
 onClick={() => toggleIndicator(opt.value)}
 className={cn(
 "rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors",
 activeIndicators.includes(opt.value)
 ? "bg-foreground/[0.06] text-foreground"
 : "text-muted-foreground/30 hover:text-muted-foreground hover:bg-foreground/[0.03]",
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
 title="Select ticker"
 aria-label="Select ticker"
 className="rounded border border-border bg-transparent px-2 py-0.5 text-[11px] text-muted-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring/50"
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
