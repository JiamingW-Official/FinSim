"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
 ScanLine,
 RefreshCw,
 TrendingUp,
 TrendingDown,
 Minus,
 Star,
 ChevronUp,
 ChevronDown,
 Filter,
 Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useChartStore } from "@/stores/chart-store";
import { WATCHLIST_STOCKS } from "@/types/market";
import { PatternLibrary } from "@/components/scanner/PatternLibrary";
import type { OHLCVBar } from "@/types/market";
import { detectCandlePatterns } from "@/services/ai/patterns";
import { analyzeTradeSetup } from "@/services/ai/engine";
import {
 calculateRSI,
 calculateMACD,
 calculateEMA,
 calculateBollingerBands,
 calculateATR,
} from "@/services/indicators";
import type { IndicatorType } from "@/stores/chart-store";

// ─── Stable base prices ───────────────────────────────────────────────────────

const BASE_PRICES: Record<string, number> = {
 AAPL: 213,
 MSFT: 415,
 GOOG: 178,
 AMZN: 204,
 NVDA: 870,
 TSLA: 248,
 JPM: 225,
 SPY: 548,
 QQQ: 468,
 META: 568,
};

// ─── Seeded PRNG (mulberry32) ─────────────────────────────────────────────────

function mulberry32(seed: number) {
 let s = seed;
 return function () {
 s |= 0;
 s = (s + 0x6d2b79f5) | 0;
 let t = Math.imul(s ^ (s >>> 15), 1 | s);
 t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
 return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
 };
}

function tickerSeed(ticker: string, salt = ""): number {
 let h = 0x811c9dc5;
 const str = ticker + salt;
 for (let i = 0; i < str.length; i++) {
 h ^= str.charCodeAt(i);
 h = Math.imul(h, 0x01000193) >>> 0;
 }
 return h;
}

// ─── Synthetic bar generator (50 bars, seeded per ticker) ─────────────────────

function generateSyntheticBars(ticker: string, count = 50): OHLCVBar[] {
 const base = BASE_PRICES[ticker] ?? 100;
 const rand = mulberry32(tickerSeed(ticker, "scanner2026"));
 const bars: OHLCVBar[] = [];
 let price = base;
 const now = Date.now();

 for (let i = 0; i < count; i++) {
 const drift = (rand() - 0.48) * 0.025; // slight upward drift
 const volatility = rand() * 0.02 + 0.005;
 const open = price;
 const close = Math.max(open * (1 + drift + (rand() - 0.5) * volatility), 0.01);
 const high = Math.max(open, close) * (1 + rand() * 0.008);
 const low = Math.min(open, close) * (1 - rand() * 0.008);
 const volume = Math.round(1_000_000 * (0.5 + rand() * 1.5));

 bars.push({
 timestamp: now - (count - i) * 24 * 60 * 60 * 1000,
 open,
 high,
 low,
 close,
 volume,
 ticker,
 timeframe: "1d",
 });

 price = close;
 }

 return bars;
}

// ─── All indicator types for Setup Finder ────────────────────────────────────

const ALL_INDICATORS: IndicatorType[] = [
 "rsi", "macd", "bollinger", "sma20", "sma50",
 "ema12", "ema26", "adx", "obv", "cci",
 "williams_r", "psar", "vwap", "atr", "stochastic",
];

// ─── Pattern Scanner Types ────────────────────────────────────────────────────

interface PatternResult {
 ticker: string;
 name: string;
 direction: "bullish" | "bearish" | "neutral";
 strength: 1 | 2 | 3;
 reliability: number; // 0-100
 currentPrice: number;
 changePct: number;
}

// Map pattern strength to reliability score
function strengthToReliability(
 strength: 1 | 2 | 3,
 direction: "bullish" | "bearish" | "neutral",
): number {
 const base = strength === 3 ? 80 : strength === 2 ? 65 : 45;
 // neutral patterns (Doji) are inherently less reliable
 const dirBonus = direction === "neutral" ? -10 : 0;
 return Math.min(95, base + dirBonus);
}

// ─── Technical Scanner Types ──────────────────────────────────────────────────

type TechConditionId =
 | "rsi_oversold"
 | "rsi_overbought"
 | "macd_bull_cross"
 | "macd_bear_cross"
 | "price_above_ema20"
 | "price_below_ema20"
 | "bb_squeeze"
 | "volume_spike";

interface TechCondition {
 id: TechConditionId;
 label: string;
 direction: "bullish" | "bearish" | "neutral";
}

const TECH_CONDITIONS: TechCondition[] = [
 { id: "rsi_oversold", label: "RSI Oversold (<30)", direction: "bullish" },
 { id: "rsi_overbought", label: "RSI Overbought (>70)", direction: "bearish" },
 { id: "macd_bull_cross", label: "MACD Bullish Cross", direction: "bullish" },
 { id: "macd_bear_cross", label: "MACD Bearish Cross", direction: "bearish" },
 { id: "price_above_ema20", label: "Price > EMA20", direction: "bullish" },
 { id: "price_below_ema20", label: "Price < EMA20", direction: "bearish" },
 { id: "bb_squeeze", label: "Bollinger Squeeze", direction: "neutral" },
 { id: "volume_spike", label: "Volume Spike (>2× avg)", direction: "bullish" },
];

interface TechResult {
 ticker: string;
 condition: TechConditionId;
 conditionLabel: string;
 currentValue: string;
 signalStrength: 1 | 2 | 3;
 direction: "bullish" | "bearish" | "neutral";
 currentPrice: number;
 changePct: number;
 signalCount: number; // total active signals for this ticker (for sorting)
}

function scanTechnical(ticker: string, bars: OHLCVBar[]): TechResult[] {
 const results: TechResult[] = [];
 if (bars.length < 35) return results;

 const lastBar = bars[bars.length - 1];
 const currentPrice = lastBar.close;

 // Compute indicator snapshot
 const rsiData = calculateRSI(bars, 14);
 const macdData = calculateMACD(bars);
 const ema20Data = calculateEMA(bars, 20);
 const bbData = calculateBollingerBands(bars, 20, 2);
 const atrData = calculateATR(bars, 14);

 const rsi = rsiData.length ? rsiData[rsiData.length - 1].value : null;
 const prevRsi = rsiData.length >= 2 ? rsiData[rsiData.length - 2].value : null;
 const macdLine = macdData.macdLine.length ? macdData.macdLine[macdData.macdLine.length - 1].value : null;
 const macdSignal = macdData.signalLine.length ? macdData.signalLine[macdData.signalLine.length - 1].value : null;
 const prevMacdLine = macdData.macdLine.length >= 2 ? macdData.macdLine[macdData.macdLine.length - 2].value : null;
 const prevMacdSignal = macdData.signalLine.length >= 2 ? macdData.signalLine[macdData.signalLine.length - 2].value : null;
 const ema20 = ema20Data.length ? ema20Data[ema20Data.length - 1].value : null;
 const bbUpper = bbData.upper.length ? bbData.upper[bbData.upper.length - 1].value : null;
 const bbLower = bbData.lower.length ? bbData.lower[bbData.lower.length - 1].value : null;
 const prevBbUpper = bbData.upper.length >= 2 ? bbData.upper[bbData.upper.length - 2].value : null;
 const prevBbLower = bbData.lower.length >= 2 ? bbData.lower[bbData.lower.length - 2].value : null;

 // Volume spike: compare last volume to avg of prior 10 bars
 const volSlice = bars.slice(-11, -1);
 const avgVol = volSlice.length ? volSlice.reduce((s, b) => s + b.volume, 0) / volSlice.length : 0;
 const volRatio = avgVol > 0 ? lastBar.volume / avgVol : 0;

 // Compute changePct
 const prevClose = bars.length >= 2 ? bars[bars.length - 2].close : currentPrice;
 const changePct = prevClose > 0 ? ((currentPrice - prevClose) / prevClose) * 100 : 0;

 let signalCount = 0;
 const push = (c: TechResult) => { results.push(c); signalCount++; };

 // RSI oversold
 if (rsi !== null && rsi < 30) {
 const strength: 1 | 2 | 3 = rsi < 20 ? 3 : rsi < 25 ? 2 : 1;
 push({
 ticker, conditionLabel: "RSI Oversold (<30)", condition: "rsi_oversold",
 currentValue: rsi.toFixed(1), signalStrength: strength,
 direction: "bullish", currentPrice, changePct, signalCount: 0,
 });
 }

 // RSI overbought
 if (rsi !== null && rsi > 70) {
 const strength: 1 | 2 | 3 = rsi > 80 ? 3 : rsi > 75 ? 2 : 1;
 push({
 ticker, conditionLabel: "RSI Overbought (>70)", condition: "rsi_overbought",
 currentValue: rsi.toFixed(1), signalStrength: strength,
 direction: "bearish", currentPrice, changePct, signalCount: 0,
 });
 }

 // MACD bull cross: macd crosses above signal
 if (
 macdLine !== null && macdSignal !== null &&
 prevMacdLine !== null && prevMacdSignal !== null &&
 prevMacdLine <= prevMacdSignal && macdLine > macdSignal
 ) {
 const spread = Math.abs(macdLine - macdSignal);
 const strength: 1 | 2 | 3 = spread > 1 ? 3 : spread > 0.3 ? 2 : 1;
 push({
 ticker, conditionLabel: "MACD Bullish Cross", condition: "macd_bull_cross",
 currentValue: `MACD ${macdLine.toFixed(2)} > Sig ${macdSignal.toFixed(2)}`,
 signalStrength: strength, direction: "bullish", currentPrice, changePct, signalCount: 0,
 });
 }

 // MACD bear cross
 if (
 macdLine !== null && macdSignal !== null &&
 prevMacdLine !== null && prevMacdSignal !== null &&
 prevMacdLine >= prevMacdSignal && macdLine < macdSignal
 ) {
 const spread = Math.abs(macdLine - macdSignal);
 const strength: 1 | 2 | 3 = spread > 1 ? 3 : spread > 0.3 ? 2 : 1;
 push({
 ticker, conditionLabel: "MACD Bearish Cross", condition: "macd_bear_cross",
 currentValue: `MACD ${macdLine.toFixed(2)} < Sig ${macdSignal.toFixed(2)}`,
 signalStrength: strength, direction: "bearish", currentPrice, changePct, signalCount: 0,
 });
 }

 // Price above EMA20
 if (ema20 !== null && currentPrice > ema20) {
 const pctAbove = ((currentPrice - ema20) / ema20) * 100;
 const strength: 1 | 2 | 3 = pctAbove > 3 ? 3 : pctAbove > 1 ? 2 : 1;
 push({
 ticker, conditionLabel: "Price > EMA20", condition: "price_above_ema20",
 currentValue: `+${pctAbove.toFixed(1)}% above EMA`,
 signalStrength: strength, direction: "bullish", currentPrice, changePct, signalCount: 0,
 });
 }

 // Price below EMA20
 if (ema20 !== null && currentPrice < ema20) {
 const pctBelow = ((ema20 - currentPrice) / ema20) * 100;
 const strength: 1 | 2 | 3 = pctBelow > 3 ? 3 : pctBelow > 1 ? 2 : 1;
 push({
 ticker, conditionLabel: "Price < EMA20", condition: "price_below_ema20",
 currentValue: `-${pctBelow.toFixed(1)}% below EMA`,
 signalStrength: strength, direction: "bearish", currentPrice, changePct, signalCount: 0,
 });
 }

 // Bollinger Squeeze: band width narrowing (current < prev)
 if (bbUpper !== null && bbLower !== null && prevBbUpper !== null && prevBbLower !== null) {
 const currWidth = bbUpper - bbLower;
 const prevWidth = prevBbUpper - prevBbLower;
 const midPrice = (bbUpper + bbLower) / 2;
 const widthPct = midPrice > 0 ? (currWidth / midPrice) * 100 : 100;
 if (currWidth < prevWidth && widthPct < 4) {
 const strength: 1 | 2 | 3 = widthPct < 2 ? 3 : widthPct < 3 ? 2 : 1;
 push({
 ticker, conditionLabel: "Bollinger Squeeze", condition: "bb_squeeze",
 currentValue: `Band width ${widthPct.toFixed(1)}%`,
 signalStrength: strength, direction: "neutral", currentPrice, changePct, signalCount: 0,
 });
 }
 }

 // Volume spike
 if (volRatio >= 2) {
 const strength: 1 | 2 | 3 = volRatio >= 4 ? 3 : volRatio >= 3 ? 2 : 1;
 push({
 ticker, conditionLabel: "Volume Spike (>2× avg)", condition: "volume_spike",
 currentValue: `${volRatio.toFixed(1)}× avg volume`,
 signalStrength: strength, direction: "bullish", currentPrice, changePct, signalCount: 0,
 });
 }

 // Fill signalCount into each result
 return results.map((r) => ({ ...r, signalCount }));
}

// ─── Setup Finder Types ───────────────────────────────────────────────────────

interface SetupResult {
 ticker: string;
 setupName: string;
 entryLow: number;
 entryHigh: number;
 target1: number;
 target2: number;
 stopLoss: number;
 riskReward: number;
 qualityScore: number; // 1-5 stars
 bias: "bullish" | "bearish" | "neutral";
 currentPrice: number;
 changePct: number;
}

function convictionToScore(conviction: "low" | "medium" | "high", score: number): number {
 const base = conviction === "high" ? 4 : conviction === "medium" ? 3 : 1;
 const bonus = Math.abs(score) >= 60 ? 1 : 0;
 return Math.min(5, base + bonus);
}

// ─── Shared scanning helpers ──────────────────────────────────────────────────

function useTickerBars(): Record<string, OHLCVBar[]> {
 return useMemo(() => {
 const map: Record<string, OHLCVBar[]> = {};
 for (const { ticker } of WATCHLIST_STOCKS) {
 map[ticker] = generateSyntheticBars(ticker, 50);
 }
 return map;
 }, []);
}

// ─── Dot signal strength indicator ───────────────────────────────────────────

function SignalDots({ strength }: { strength: 1 | 2 | 3 }) {
 return (
 <span className="flex gap-0.5">
 {[1, 2, 3].map((i) => (
 <span
 key={i}
 className={cn(
 "inline-block h-1.5 w-1.5 rounded-full",
 i <= strength ? "bg-primary" : "bg-muted-foreground/20",
 )}
 />
 ))}
 </span>
 );
}

// ─── Star quality score ───────────────────────────────────────────────────────

function StarScore({ score }: { score: number }) {
 return (
 <span className="flex gap-0.5">
 {[1, 2, 3, 4, 5].map((i) => (
 <Star
 key={i}
 className={cn(
 "h-3 w-3",
 i <= score
 ? "fill-amber-400 text-amber-400"
 : "fill-none text-muted-foreground/20",
 )}
 />
 ))}
 </span>
 );
}

// ─── Direction badge ──────────────────────────────────────────────────────────

function DirectionBadge({ direction }: { direction: "bullish" | "bearish" | "neutral" }) {
 if (direction === "bullish") {
 return (
 <span className="inline-flex items-center gap-1 rounded-sm bg-emerald-500/5 px-1.5 py-0.5 text-xs font-semibold text-emerald-500">
 <TrendingUp className="h-2.5 w-2.5" />
 Bullish
 </span>
 );
 }
 if (direction === "bearish") {
 return (
 <span className="inline-flex items-center gap-1 rounded-sm bg-rose-500/10 px-1.5 py-0.5 text-xs font-semibold text-rose-500">
 <TrendingDown className="h-2.5 w-2.5" />
 Bearish
 </span>
 );
 }
 return (
 <span className="inline-flex items-center gap-1 rounded-sm bg-amber-500/10 px-1.5 py-0.5 text-xs font-semibold text-amber-500">
 <Minus className="h-2.5 w-2.5" />
 Neutral
 </span>
 );
}

// ─── Tab 1: Pattern Scanner ───────────────────────────────────────────────────

type PatternFilter = "all" | "bullish" | "bearish" | "high_reliability";

function PatternScannerTab() {
 const router = useRouter();
 const setTicker = useChartStore((s) => s.setTicker);
 const barsByTicker = useTickerBars();

 const [filter, setFilter] = useState<PatternFilter>("all");
 const [scanning, setScanning] = useState(false);
 const [scanKey, setScanKey] = useState(0); // bump to re-run

 const allResults = useMemo<PatternResult[]>(() => {
 const out: PatternResult[] = [];
 for (const { ticker } of WATCHLIST_STOCKS) {
 const bars = barsByTicker[ticker];
 if (!bars || bars.length < 3) continue;

 const patterns = detectCandlePatterns(bars, 10);
 const lastBar = bars[bars.length - 1];
 const prevClose = bars.length >= 2 ? bars[bars.length - 2].close : lastBar.close;
 const changePct = prevClose > 0 ? ((lastBar.close - prevClose) / prevClose) * 100 : 0;

 for (const p of patterns) {
 out.push({
 ticker,
 name: p.name,
 direction: p.direction,
 strength: p.strength,
 reliability: strengthToReliability(p.strength, p.direction),
 currentPrice: lastBar.close,
 changePct,
 });
 }
 }
 return out;
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [barsByTicker, scanKey]);

 const filteredResults = useMemo(() => {
 return allResults.filter((r) => {
 if (filter === "bullish") return r.direction === "bullish";
 if (filter === "bearish") return r.direction === "bearish";
 if (filter === "high_reliability") return r.reliability > 70;
 return true;
 });
 }, [allResults, filter]);

 const handleScan = useCallback(() => {
 setScanning(true);
 setTimeout(() => {
 setScanKey((k) => k + 1);
 setScanning(false);
 }, 300);
 }, []);

 const handleRowClick = useCallback(
 (ticker: string) => {
 setTicker(ticker);
 router.push("/trade");
 },
 [setTicker, router],
 );

 const FILTER_OPTIONS: { id: PatternFilter; label: string }[] = [
 { id: "all", label: "All" },
 { id: "bullish", label: "Bullish" },
 { id: "bearish", label: "Bearish" },
 { id: "high_reliability", label: "High Reliability (>70%)" },
 ];

 return (
 <div className="space-y-4">
 {/* Controls */}
 <div className="flex flex-wrap items-center gap-2">
 <button
 type="button"
 onClick={handleScan}
 disabled={scanning}
 className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-foreground-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
 >
 <RefreshCw className={cn("h-3 w-3", scanning && "animate-spin")} />
 {scanning ? "Scanning…" : "Scan All"}
 </button>

 <div className="flex items-center gap-1 rounded-md border border-border/20 p-0.5">
 {FILTER_OPTIONS.map((opt) => (
 <button
 key={opt.id}
 type="button"
 onClick={() => setFilter(opt.id)}
 className={cn(
 "rounded px-2.5 py-1 text-[11px] font-medium transition-colors",
 filter === opt.id
 ? "bg-muted/10 text-foreground"
 : "text-muted-foreground hover:text-foreground",
 )}
 >
 {opt.label}
 </button>
 ))}
 </div>

 <span className="ml-auto text-[11px] text-muted-foreground">
 {filteredResults.length} pattern{filteredResults.length !== 1 ? "s" : ""} found
 </span>
 </div>

 {/* Table */}
 {filteredResults.length === 0 ? (
 <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/20 py-16 text-center">
 <ScanLine className="h-8 w-8 text-muted-foreground/30" />
 <p className="text-sm text-muted-foreground">No patterns found for this filter.</p>
 <p className="text-[11px] text-muted-foreground/60">Try "All" or click "Scan All" to refresh.</p>
 </div>
 ) : (
 <div className="overflow-hidden rounded-lg border border-border/20">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border/20 bg-muted/30">
 <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Ticker</th>
 <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Pattern</th>
 <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Direction</th>
 <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Reliability</th>
 <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Price</th>
 <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">% Change</th>
 </tr>
 </thead>
 <tbody>
 {filteredResults.map((r, i) => (
 <tr
 key={`${r.ticker}-${r.name}-${i}`}
 onClick={() => handleRowClick(r.ticker)}
 className="cursor-pointer border-b border-border/20 transition-colors last:border-0 hover:bg-muted/10"
 >
 <td className="px-3 py-2.5">
 <span className="font-medium text-foreground">{r.ticker}</span>
 </td>
 <td className="px-3 py-2.5">
 <span className="text-xs text-foreground/80">{r.name}</span>
 </td>
 <td className="px-3 py-2.5">
 <DirectionBadge direction={r.direction} />
 </td>
 <td className="px-3 py-2.5 text-right">
 <span
 className={cn(
 "text-xs text-muted-foreground font-medium tabular-nums",
 r.reliability >= 70
 ? "text-emerald-500"
 : r.reliability >= 50
 ? "text-amber-500"
 : "text-muted-foreground",
 )}
 >
 {r.reliability}%
 </span>
 </td>
 <td className="px-3 py-2.5 text-right">
 <span className="tabular-nums text-xs text-foreground">${r.currentPrice.toFixed(2)}</span>
 </td>
 <td className="px-3 py-2.5 text-right">
 <span
 className={cn(
 "tabular-nums text-xs text-muted-foreground font-medium",
 r.changePct >= 0 ? "text-emerald-500" : "text-rose-500",
 )}
 >
 {r.changePct >= 0 ? "+" : ""}
 {r.changePct.toFixed(2)}%
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>
 );
}

// ─── Tab 2: Technical Scanner ─────────────────────────────────────────────────

type SortKey = "ticker" | "signalCount" | "strength";

function TechnicalScannerTab() {
 const router = useRouter();
 const setTicker = useChartStore((s) => s.setTicker);
 const barsByTicker = useTickerBars();

 const [selectedConditions, setSelectedConditions] = useState<Set<TechConditionId>>(
 new Set<TechConditionId>(),
 );
 const [scanning, setScanning] = useState(false);
 const [scanKey, setScanKey] = useState(0);
 const [sortKey, setSortKey] = useState<SortKey>("signalCount");
 const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

 const allResults = useMemo<TechResult[]>(() => {
 const out: TechResult[] = [];
 for (const { ticker } of WATCHLIST_STOCKS) {
 const bars = barsByTicker[ticker];
 if (!bars) continue;
 const tickerResults = scanTechnical(ticker, bars);
 out.push(...tickerResults);
 }
 return out;
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [barsByTicker, scanKey]);

 const filteredResults = useMemo(() => {
 let rows = allResults;
 if (selectedConditions.size > 0) {
 rows = rows.filter((r) => selectedConditions.has(r.condition));
 }
 return [...rows].sort((a, b) => {
 let cmp = 0;
 if (sortKey === "ticker") cmp = a.ticker.localeCompare(b.ticker);
 else if (sortKey === "signalCount") cmp = a.signalCount - b.signalCount;
 else if (sortKey === "strength") cmp = a.signalStrength - b.signalStrength;
 return sortDir === "desc" ? -cmp : cmp;
 });
 }, [allResults, selectedConditions, sortKey, sortDir]);

 const handleScan = useCallback(() => {
 setScanning(true);
 setTimeout(() => {
 setScanKey((k) => k + 1);
 setScanning(false);
 }, 300);
 }, []);

 const toggleCondition = useCallback((id: TechConditionId) => {
 setSelectedConditions((prev) => {
 const next = new Set(prev);
 if (next.has(id)) next.delete(id);
 else next.add(id);
 return next;
 });
 }, []);

 const handleSort = (key: SortKey) => {
 if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
 else { setSortKey(key); setSortDir("desc"); }
 };

 const SortIcon = ({ col }: { col: SortKey }) => {
 if (sortKey !== col) return <ChevronDown className="h-3 w-3 opacity-20" />;
 return sortDir === "desc"
 ? <ChevronDown className="h-3 w-3 text-foreground" />
 : <ChevronUp className="h-3 w-3 text-foreground" />;
 };

 const handleRowClick = useCallback(
 (ticker: string) => {
 setTicker(ticker);
 router.push("/trade");
 },
 [setTicker, router],
 );

 return (
 <div className="space-y-4">
 {/* Controls */}
 <div className="flex flex-wrap items-center gap-2">
 <button
 type="button"
 onClick={handleScan}
 disabled={scanning}
 className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-foreground-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
 >
 <RefreshCw className={cn("h-3 w-3", scanning && "animate-spin")} />
 {scanning ? "Scanning…" : "Scan All"}
 </button>
 <span className="ml-auto text-[11px] text-muted-foreground">
 {filteredResults.length} signal{filteredResults.length !== 1 ? "s" : ""} found
 </span>
 </div>

 {/* Condition filter chips */}
 <div className="flex flex-wrap gap-1.5">
 <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
 <Filter className="h-3 w-3" />
 Filter:
 </span>
 {TECH_CONDITIONS.map((c) => (
 <button
 key={c.id}
 type="button"
 onClick={() => toggleCondition(c.id)}
 className={cn(
 "rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground font-medium transition-colors",
 selectedConditions.has(c.id)
 ? c.direction === "bullish"
 ? "border-emerald-500/50 bg-emerald-500/5 text-emerald-500"
 : c.direction === "bearish"
 ? "border-rose-500/50 bg-rose-500/10 text-rose-500"
 : "border-amber-500/50 bg-amber-500/10 text-amber-500"
 : "border-border/20 text-muted-foreground hover:border-border hover:text-foreground",
 )}
 >
 {c.label}
 </button>
 ))}
 {selectedConditions.size > 0 && (
 <button
 type="button"
 onClick={() => setSelectedConditions(new Set())}
 className="rounded-full border border-border/20 px-2.5 py-0.5 text-xs text-muted-foreground hover:text-foreground"
 >
 Clear
 </button>
 )}
 </div>

 {/* Table */}
 {filteredResults.length === 0 ? (
 <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/20 py-16 text-center">
 <Zap className="h-8 w-8 text-muted-foreground/30" />
 <p className="text-sm text-muted-foreground">No conditions triggered.</p>
 <p className="text-[11px] text-muted-foreground/60">Adjust filters or click "Scan All" to refresh.</p>
 </div>
 ) : (
 <div className="overflow-hidden rounded-lg border border-border/20">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border/20 bg-muted/30">
 <th
 className="cursor-pointer px-3 py-2 text-left text-xs font-medium text-muted-foreground hover:text-foreground"
 onClick={() => handleSort("ticker")}
 >
 <span className="flex items-center gap-0.5">Ticker <SortIcon col="ticker" /></span>
 </th>
 <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Condition</th>
 <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Value</th>
 <th
 className="cursor-pointer px-3 py-2 text-center text-xs font-medium text-muted-foreground hover:text-foreground"
 onClick={() => handleSort("strength")}
 >
 <span className="flex items-center justify-center gap-0.5">Strength <SortIcon col="strength" /></span>
 </th>
 <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Price</th>
 <th
 className="cursor-pointer px-3 py-2 text-right text-xs font-medium text-muted-foreground hover:text-foreground"
 onClick={() => handleSort("signalCount")}
 >
 <span className="flex items-center justify-end gap-0.5">Signals <SortIcon col="signalCount" /></span>
 </th>
 </tr>
 </thead>
 <tbody>
 {filteredResults.map((r, i) => (
 <tr
 key={`${r.ticker}-${r.condition}-${i}`}
 onClick={() => handleRowClick(r.ticker)}
 className="cursor-pointer border-b border-border/20 transition-colors last:border-0 hover:bg-muted/10"
 >
 <td className="px-3 py-2.5">
 <div className="flex flex-col gap-0.5">
 <span className="font-medium text-foreground">{r.ticker}</span>
 <span className="text-xs tabular-nums text-muted-foreground">${r.currentPrice.toFixed(2)}</span>
 </div>
 </td>
 <td className="px-3 py-2.5">
 <div className="flex flex-col gap-0.5">
 <DirectionBadge direction={r.direction} />
 <span className="text-xs text-muted-foreground">{r.conditionLabel}</span>
 </div>
 </td>
 <td className="px-3 py-2.5">
 <span className="font-mono text-[11px] text-foreground/80">{r.currentValue}</span>
 </td>
 <td className="px-3 py-2.5 text-center">
 <SignalDots strength={r.signalStrength} />
 </td>
 <td className="px-3 py-2.5 text-right">
 <span
 className={cn(
 "tabular-nums text-xs text-muted-foreground font-medium",
 r.changePct >= 0 ? "text-emerald-500" : "text-rose-500",
 )}
 >
 {r.changePct >= 0 ? "+" : ""}
 {r.changePct.toFixed(2)}%
 </span>
 </td>
 <td className="px-3 py-2.5 text-right">
 <span
 className={cn(
 "inline-flex h-5 w-5 items-center justify-center rounded-full text-xs text-muted-foreground font-semibold",
 r.signalCount >= 4
 ? "bg-muted/10 text-foreground"
 : r.signalCount >= 2
 ? "bg-amber-500/15 text-amber-500"
 : "bg-muted text-muted-foreground",
 )}
 >
 {r.signalCount}
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>
 );
}

// ─── Tab 3: Setup Finder ──────────────────────────────────────────────────────

function SetupFinderTab() {
 const router = useRouter();
 const setTicker = useChartStore((s) => s.setTicker);
 const barsByTicker = useTickerBars();

 const [scanning, setScanning] = useState(false);
 const [scanKey, setScanKey] = useState(0);

 const setups = useMemo<SetupResult[]>(() => {
 const out: SetupResult[] = [];
 for (const { ticker } of WATCHLIST_STOCKS) {
 const bars = barsByTicker[ticker];
 if (!bars || bars.length < 5) continue;

 const result = analyzeTradeSetup({
 visibleData: bars,
 activeIndicators: ALL_INDICATORS,
 positions: [],
 currentTicker: ticker,
 tradeHistory: [],
 });

 if (!result.setupName || !result.tradePlan) continue;
 if (result.bias === "neutral" || result.conviction === "low") continue;

 const lastBar = bars[bars.length - 1];
 const prevClose = bars.length >= 2 ? bars[bars.length - 2].close : lastBar.close;
 const changePct = prevClose > 0 ? ((lastBar.close - prevClose) / prevClose) * 100 : 0;

 out.push({
 ticker,
 setupName: result.setupName,
 entryLow: result.tradePlan.entryZone[0],
 entryHigh: result.tradePlan.entryZone[1],
 target1: result.tradePlan.target1,
 target2: result.tradePlan.target2,
 stopLoss: result.tradePlan.stopLoss,
 riskReward: result.tradePlan.riskRewardRatio,
 qualityScore: convictionToScore(result.conviction, result.score),
 bias: result.bias,
 currentPrice: lastBar.close,
 changePct,
 });
 }
 return out.sort((a, b) => b.qualityScore - a.qualityScore);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [barsByTicker, scanKey]);

 const handleScan = useCallback(() => {
 setScanning(true);
 setTimeout(() => {
 setScanKey((k) => k + 1);
 setScanning(false);
 }, 300);
 }, []);

 const handleRowClick = useCallback(
 (ticker: string) => {
 setTicker(ticker);
 router.push("/trade");
 },
 [setTicker, router],
 );

 return (
 <div className="space-y-4">
 {/* Controls */}
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={handleScan}
 disabled={scanning}
 className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-foreground-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
 >
 <RefreshCw className={cn("h-3 w-3", scanning && "animate-spin")} />
 {scanning ? "Scanning…" : "Scan All"}
 </button>
 <span className="text-[11px] text-muted-foreground">
 {setups.length} active setup{setups.length !== 1 ? "s" : ""} found
 </span>
 <span className="ml-auto text-[11px] text-muted-foreground">Sorted by quality score</span>
 </div>

 {/* Table */}
 {setups.length === 0 ? (
 <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/20 py-16 text-center">
 <ScanLine className="h-8 w-8 text-muted-foreground/30" />
 <p className="text-sm text-muted-foreground">No high-conviction setups detected.</p>
 <p className="text-[11px] text-muted-foreground/60">Market may be in low-conviction ranging state.</p>
 </div>
 ) : (
 <div className="overflow-hidden rounded-lg border border-border/20">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border/20 bg-muted/30">
 <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Ticker</th>
 <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Setup</th>
 <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Entry Zone</th>
 <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Target</th>
 <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Stop</th>
 <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">R:R</th>
 <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">Quality</th>
 </tr>
 </thead>
 <tbody>
 {setups.map((s, i) => (
 <tr
 key={`${s.ticker}-${s.setupName}-${i}`}
 onClick={() => handleRowClick(s.ticker)}
 className="cursor-pointer border-b border-border/20 transition-colors last:border-0 hover:bg-muted/10"
 >
 <td className="px-3 py-2.5">
 <div className="flex flex-col gap-0.5">
 <span className="font-medium text-foreground">{s.ticker}</span>
 <DirectionBadge direction={s.bias} />
 </div>
 </td>
 <td className="px-3 py-2.5">
 <span className="text-xs font-medium text-foreground/90">{s.setupName}</span>
 </td>
 <td className="px-3 py-2.5 text-right">
 <span className="font-mono text-[11px] text-foreground">
 ${s.entryLow.toFixed(2)}–${s.entryHigh.toFixed(2)}
 </span>
 </td>
 <td className="px-3 py-2.5 text-right">
 <div className="flex flex-col items-end gap-0.5">
 <span className="font-mono text-[11px] text-emerald-500">${s.target1.toFixed(2)}</span>
 <span className="font-mono text-xs text-emerald-400/60">${s.target2.toFixed(2)}</span>
 </div>
 </td>
 <td className="px-3 py-2.5 text-right">
 <span className="font-mono text-[11px] text-rose-500">${s.stopLoss.toFixed(2)}</span>
 </td>
 <td className="px-3 py-2.5 text-right">
 <span
 className={cn(
 "tabular-nums text-xs text-muted-foreground font-medium",
 s.riskReward >= 2 ? "text-emerald-500" : s.riskReward >= 1 ? "text-amber-500" : "text-rose-500",
 )}
 >
 {s.riskReward > 0 ? `${s.riskReward.toFixed(1)}:1` : "N/A"}
 </span>
 </td>
 <td className="px-3 py-2.5">
 <div className="flex justify-center">
 <StarScore score={s.qualityScore} />
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>
 );
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS = [
 { id: "patterns", label: "Pattern Scanner" },
 { id: "technical", label: "Technical Scanner" },
 { id: "setups", label: "Setup Finder" },
 { id: "library", label: "Pattern Library" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ScannerPage() {
 const [activeTab, setActiveTab] = useState<TabId>("patterns");

 return (
 <div className="flex flex-col h-full overflow-hidden">
 {/* Header */}
 <div className="flex shrink-0 items-center gap-3 border-b border-border/20 px-6 py-6 border-l-4 border-l-primary">
 <ScanLine className="h-3.5 w-3.5 text-muted-foreground/50" />
 <div>
 <h1 className="text-base font-medium leading-none">Scanner</h1>
 <p className="mt-1 text-[11px] text-muted-foreground">
 Scan all 10 tickers for patterns, technical conditions, and high-conviction setups
 </p>
 </div>
 </div>

 {/* Tab bar */}
 <div className="shrink-0 border-b border-border/20 px-6">
 <div className="flex gap-1">
 {TABS.map((tab) => (
 <button
 key={tab.id}
 type="button"
 onClick={() => setActiveTab(tab.id)}
 className={cn(
 "relative border-b-2 px-3 py-2.5 text-xs text-muted-foreground font-medium transition-colors",
 activeTab === tab.id
 ? "border-primary text-foreground"
 : "border-transparent text-muted-foreground hover:text-foreground",
 )}
 >
 {tab.label}
 </button>
 ))}
 </div>
 </div>

 {/* Tab content */}
 <div className="flex-1 overflow-y-auto px-6 py-5">
 {activeTab === "patterns" && <PatternScannerTab />}
 {activeTab === "technical" && <TechnicalScannerTab />}
 {activeTab === "setups" && <SetupFinderTab />}
 {activeTab === "library" && <PatternLibrary />}
 </div>
 </div>
 );
}
