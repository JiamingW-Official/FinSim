"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
 Globe,
 TrendingUp,
 TrendingDown,
 DollarSign,
 Calculator,
 BarChart2,
 ArrowUpDown,
 Info,
 Zap,
 ShieldCheck,
 Target,
 Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 632002;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};

// Reset seed helper for deterministic sequences
function resetSeed() {
 s = 632002;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface FxPair {
 symbol: string;
 base: string;
 quote: string;
 price: number;
 bid: number;
 ask: number;
 spreadPips: number;
 change1d: number;
 rangeLow: number;
 rangeHigh: number;
 weeklyChange: number;
 sparkline: number[];
 flag1: string;
 flag2: string;
 isJpy: boolean;
}

interface CarryPair {
 symbol: string;
 baseRate: number;
 quoteRate: number;
 differential: number;
 annualizedCarry: number;
 rollYieldDaily: number;
 spotReturn: number;
 totalReturn: number;
 flag1: string;
 flag2: string;
}

interface SRLevel {
 price: number;
 type: "support" | "resistance";
 strength: number;
}

interface TechPair {
 symbol: string;
 price: number;
 trend: "bullish" | "bearish" | "neutral";
 pattern: string;
 rsi: number;
 macdSignal: "bullish" | "bearish" | "neutral";
 srLevels: SRLevel[];
 candles: { o: number; h: number; l: number; c: number }[];
}

interface MacroDriver {
 pair: string;
 pppFair: number;
 currentSpot: number;
 pppDeviation: number;
 interestDiff: number;
 currentAccount: number;
 cbDivergence: "hawkish" | "dovish" | "neutral";
 outlook: "overvalued" | "undervalued" | "fair";
}

// ── Data generation ───────────────────────────────────────────────────────────

function generateSparkline(basePrice: number, points: number, isJpy: boolean): number[] {
 const result: number[] = [basePrice];
 const step = isJpy ? 0.3 : 0.0015;
 for (let i = 1; i < points; i++) {
 const delta = (rand() - 0.5) * 2 * step;
 result.push(result[i - 1] + delta);
 }
 return result;
}

function generateCandles(basePrice: number, count: number, isJpy: boolean): { o: number; h: number; l: number; c: number }[] {
 const unit = isJpy ? 0.25 : 0.0012;
 let price = basePrice;
 return Array.from({ length: count }, () => {
 const o = price;
 const move = (rand() - 0.48) * unit * 2;
 const c = o + move;
 const h = Math.max(o, c) + rand() * unit;
 const l = Math.min(o, c) - rand() * unit;
 price = c;
 return { o, h, l, c };
 });
}

const MAJOR_PAIRS: FxPair[] = (() => {
 resetSeed();
 const defs = [
 { symbol: "EUR/USD", base: "EUR", quote: "USD", baseRate: 1.0842, isJpy: false, flag1: "🇪🇺", flag2: "🇺🇸" },
 { symbol: "GBP/USD", base: "GBP", quote: "USD", baseRate: 1.2654, isJpy: false, flag1: "🇬🇧", flag2: "🇺🇸" },
 { symbol: "USD/JPY", base: "USD", quote: "JPY", baseRate: 151.42, isJpy: true, flag1: "🇺🇸", flag2: "🇯🇵" },
 { symbol: "USD/CHF", base: "USD", quote: "CHF", baseRate: 0.8923, isJpy: false, flag1: "🇺🇸", flag2: "🇨🇭" },
 ];
 return defs.map((d) => {
 const change1d = (rand() - 0.5) * 0.006;
 const price = d.baseRate * (1 + change1d);
 const spreadPips = d.isJpy ? (rand() * 0.5 + 0.8) : (rand() * 0.3 + 0.8);
 const spreadUnit = d.isJpy ? spreadPips * 0.01 : spreadPips * 0.0001;
 const rangePct = (rand() * 0.003 + 0.003);
 return {
 ...d,
 price,
 bid: price - spreadUnit / 2,
 ask: price + spreadUnit / 2,
 spreadPips: Math.round(spreadPips * 10) / 10,
 change1d,
 rangeLow: price * (1 - rangePct),
 rangeHigh: price * (1 + rangePct),
 weeklyChange: (rand() - 0.5) * 0.012,
 sparkline: generateSparkline(price, 24, d.isJpy),
 };
 });
})();

// Central bank rates
const CB_RATES: Record<string, number> = {
 USD: 5.25,
 EUR: 4.00,
 GBP: 5.00,
 JPY: 0.10,
 CHF: 1.75,
 AUD: 4.35,
 NZD: 5.25,
 CAD: 5.00,
 MXN: 11.00,
 ZAR: 8.25,
};

const CARRY_PAIRS: CarryPair[] = (() => {
 resetSeed();
 const defs = [
 { symbol: "USD/JPY", base: "USD", quote: "JPY", flag1: "🇺🇸", flag2: "🇯🇵" },
 { symbol: "AUD/JPY", base: "AUD", quote: "JPY", flag1: "🇦🇺", flag2: "🇯🇵" },
 { symbol: "NZD/JPY", base: "NZD", quote: "JPY", flag1: "🇳🇿", flag2: "🇯🇵" },
 { symbol: "GBP/JPY", base: "GBP", quote: "JPY", flag1: "🇬🇧", flag2: "🇯🇵" },
 { symbol: "USD/MXN", base: "USD", quote: "MXN", flag1: "🇺🇸", flag2: "🇲🇽" },
 { symbol: "AUD/CHF", base: "AUD", quote: "CHF", flag1: "🇦🇺", flag2: "🇨🇭" },
 ];
 return defs.map((d) => {
 const br = CB_RATES[d.base] ?? 3.0;
 const qr = CB_RATES[d.quote] ?? 3.0;
 const differential = br - qr;
 const annualizedCarry = differential * (1 - rand() * 0.08);
 const rollYieldDaily = annualizedCarry / 365;
 const spotReturn = (rand() - 0.45) * 8;
 const totalReturn = spotReturn + annualizedCarry;
 return {
 symbol: d.symbol,
 baseRate: br,
 quoteRate: qr,
 differential,
 annualizedCarry: Math.round(annualizedCarry * 100) / 100,
 rollYieldDaily: Math.round(rollYieldDaily * 10000) / 10000,
 spotReturn: Math.round(spotReturn * 100) / 100,
 totalReturn: Math.round(totalReturn * 100) / 100,
 flag1: d.flag1,
 flag2: d.flag2,
 };
 });
})();

const TECH_PAIRS: TechPair[] = (() => {
 resetSeed();
 const defs = [
 { symbol: "EUR/USD", baseRate: 1.0842, isJpy: false },
 { symbol: "GBP/USD", baseRate: 1.2654, isJpy: false },
 { symbol: "USD/JPY", baseRate: 151.42, isJpy: true },
 { symbol: "USD/CHF", baseRate: 0.8923, isJpy: false },
 ];
 const patterns = ["Double Bottom", "Head & Shoulders", "Ascending Triangle", "Flag Continuation", "Wedge Breakout", "Pin Bar Reversal"];
 const trends: ("bullish" | "bearish" | "neutral")[] = ["bullish", "bearish", "neutral", "bullish"];
 const macds: ("bullish" | "bearish" | "neutral")[] = ["bullish", "bearish", "bullish", "neutral"];
 return defs.map((d, i) => {
 const candles = generateCandles(d.baseRate, 20, d.isJpy);
 const lastPrice = candles[candles.length - 1].c;
 const unit = d.isJpy ? 1.0 : 0.005;
 return {
 symbol: d.symbol,
 price: lastPrice,
 trend: trends[i],
 pattern: patterns[i % patterns.length],
 rsi: Math.round(30 + rand() * 50),
 macdSignal: macds[i],
 srLevels: [
 { price: lastPrice - unit * (1 + rand()), type: "support" as const, strength: Math.round(50 + rand() * 50) },
 { price: lastPrice - unit * (0.3 + rand() * 0.5), type: "support" as const, strength: Math.round(40 + rand() * 40) },
 { price: lastPrice + unit * (0.3 + rand() * 0.5), type: "resistance" as const, strength: Math.round(50 + rand() * 40) },
 { price: lastPrice + unit * (1 + rand()), type: "resistance" as const, strength: Math.round(50 + rand() * 50) },
 ],
 candles,
 };
 });
})();

const MACRO_DRIVERS: MacroDriver[] = [
 {
 pair: "EUR/USD",
 pppFair: 1.12,
 currentSpot: 1.0842,
 pppDeviation: -3.2,
 interestDiff: -1.25,
 currentAccount: -2.1,
 cbDivergence: "dovish",
 outlook: "undervalued",
 },
 {
 pair: "GBP/USD",
 pppFair: 1.31,
 currentSpot: 1.2654,
 pppDeviation: -3.4,
 interestDiff: -0.25,
 currentAccount: -3.8,
 cbDivergence: "neutral",
 outlook: "undervalued",
 },
 {
 pair: "USD/JPY",
 pppFair: 130.0,
 currentSpot: 151.42,
 pppDeviation: 16.5,
 interestDiff: 5.15,
 currentAccount: 3.2,
 cbDivergence: "hawkish",
 outlook: "overvalued",
 },
 {
 pair: "USD/CHF",
 pppFair: 0.94,
 currentSpot: 0.8923,
 pppDeviation: -5.1,
 interestDiff: 3.5,
 currentAccount: 5.8,
 cbDivergence: "neutral",
 outlook: "undervalued",
 },
];

// Pair correlations
const CORR_PAIRS = ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "USD/CAD"];
const CORR_MATRIX: number[][] = [
 [ 1.00, 0.87, -0.74, -0.89, 0.82, -0.68],
 [ 0.87, 1.00, -0.61, -0.78, 0.76, -0.58],
 [-0.74, -0.61, 1.00, 0.71, -0.55, 0.62],
 [-0.89, -0.78, 0.71, 1.00, -0.77, 0.61],
 [ 0.82, 0.76, -0.55, -0.77, 1.00, -0.49],
 [-0.68, -0.58, 0.62, 0.61, -0.49, 1.00],
];

// ── Utility helpers ────────────────────────────────────────────────────────────

function fmt(n: number, decimals: number): string {
 return n.toFixed(decimals);
}

function pctFmt(n: number): string {
 return (n >= 0 ? "+" : "") + (n * 100).toFixed(2) + "%";
}

function corrColor(v: number): string {
 if (v >= 0.7) return "bg-emerald-500/80";
 if (v >= 0.4) return "bg-emerald-500/40";
 if (v >= 0.1) return "bg-emerald-500/20";
 if (v <= -0.7) return "bg-rose-500/80";
 if (v <= -0.4) return "bg-rose-500/40";
 if (v <= -0.1) return "bg-rose-500/20";
 return "bg-muted/40";
}

// ── SVG helpers ────────────────────────────────────────────────────────────────

function sparkPath(values: number[], w: number, h: number): string {
 const min = Math.min(...values);
 const max = Math.max(...values);
 const range = max - min || 1;
 const pts = values.map((v, i) => {
 const x = (i / (values.length - 1)) * w;
 const y = h - ((v - min) / range) * h;
 return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
 });
 return pts.join(" ");
}

function candlestickSvg(
 candles: { o: number; h: number; l: number; c: number }[],
 w: number,
 h: number
): { x: number; wickTop: number; wickBot: number; bodyTop: number; bodyH: number; bullish: boolean }[] {
 const all = candles.flatMap((c) => [c.h, c.l]);
 const min = Math.min(...all);
 const max = Math.max(...all);
 const range = max - min || 1;
 const barW = w / candles.length;
 return candles.map((c, i) => {
 const x = i * barW + barW * 0.1;
 const scaleY = (v: number) => h - ((v - min) / range) * h;
 const bullish = c.c >= c.o;
 return {
 x,
 wickTop: scaleY(c.h),
 wickBot: scaleY(c.l),
 bodyTop: scaleY(Math.max(c.o, c.c)),
 bodyH: Math.max(1, Math.abs(scaleY(c.o) - scaleY(c.c))),
 bullish,
 };
 });
}

// ── Animation variants ─────────────────────────────────────────────────────────

const fadeUp = {
 hidden: { opacity: 0, y: 16 },
 visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }),
};

// ══════════════════════════════════════════════════════════════════════════════
// Tab 1 — Major Pairs
// ══════════════════════════════════════════════════════════════════════════════

function MajorPairsTab() {
 const [selectedPair, setSelectedPair] = useState<string>("EUR/USD");
 const selected = MAJOR_PAIRS.find((p) => p.symbol === selectedPair) ?? MAJOR_PAIRS[0];

 return (
 <div className="space-y-4">
 {/* Quote table */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 <Globe className="w-3.5 h-3.5 text-muted-foreground/50" />
 Major FX Pairs — Live Quotes
 </CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="text-muted-foreground border-b border-border">
 <th className="px-4 py-2 text-left">Pair</th>
 <th className="px-4 py-2 text-right">Bid</th>
 <th className="px-4 py-2 text-right">Ask</th>
 <th className="px-4 py-2 text-right">Spread</th>
 <th className="px-4 py-2 text-right">1D Chg</th>
 <th className="px-4 py-2 text-right">Daily Range</th>
 <th className="px-4 py-2 text-right w-28">24H Chart</th>
 </tr>
 </thead>
 <tbody>
 {MAJOR_PAIRS.map((pair, i) => {
 const isUp = pair.change1d >= 0;
 const isSelected = pair.symbol === selectedPair;
 const decimals = pair.isJpy ? 3 : 5;
 const rangePct = ((pair.price - pair.rangeLow) / (pair.rangeHigh - pair.rangeLow)) * 100;
 return (
 <motion.tr
 key={pair.symbol}
 custom={i}
 variants={fadeUp}
 initial="hidden"
 animate="visible"
 onClick={() => setSelectedPair(pair.symbol)}
 className={cn(
 "border-b border-border cursor-pointer transition-colors",
 isSelected ? "bg-muted" : "hover:bg-muted/60"
 )}
 >
 <td className="px-4 py-3">
 <div className="flex items-center gap-2">
 <span className="text-base">{pair.flag1}{pair.flag2}</span>
 <span className="font-semibold text-foreground">{pair.symbol}</span>
 </div>
 </td>
 <td className="px-4 py-3 text-right font-mono text-foreground">{fmt(pair.bid, decimals)}</td>
 <td className="px-4 py-3 text-right font-mono text-foreground">{fmt(pair.ask, decimals)}</td>
 <td className="px-4 py-3 text-right">
 <Badge variant="outline" className="text-xs border-border text-muted-foreground">
 {fmt(pair.spreadPips, 1)} pips
 </Badge>
 </td>
 <td className={cn("px-4 py-3 text-right font-mono font-semibold", isUp ? "text-emerald-400" : "text-rose-400")}>
 {isUp ? "+" : ""}{(pair.change1d * 100).toFixed(2)}%
 </td>
 <td className="px-4 py-3 text-right">
 <div className="flex flex-col items-end gap-1">
 <div className="text-xs text-muted-foreground">
 {fmt(pair.rangeLow, decimals)} — {fmt(pair.rangeHigh, decimals)}
 </div>
 <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
 <div
 className="h-full bg-primary rounded-full"
 style={{ width: `${Math.max(2, Math.min(98, rangePct))}%` }}
 />
 </div>
 </div>
 </td>
 <td className="px-4 py-3">
 <svg width="110" height="32" viewBox={`0 0 110 32`}>
 <path
 d={sparkPath(pair.sparkline, 110, 32)}
 fill="none"
 stroke={isUp ? "#34d399" : "#f87171"}
 strokeWidth="1.5"
 />
 </svg>
 </td>
 </motion.tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>

 {/* Detail panel for selected pair */}
 <motion.div
 key={selectedPair}
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3 }}
 >
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 <Activity className="w-3.5 h-3.5 text-muted-foreground/50" />
 {selected.flag1}{selected.flag2} {selected.symbol} — Detailed View
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
 {[
 { label: "Mid Price", value: fmt(selected.price, selected.isJpy ? 3 : 5) },
 { label: "Spread (pips)", value: fmt(selected.spreadPips, 1) },
 { label: "Daily Range %", value: ((selected.rangeHigh - selected.rangeLow) / selected.price * 100).toFixed(2) + "%" },
 { label: "Weekly Change", value: pctFmt(selected.weeklyChange) },
 ].map((item) => (
 <div key={item.label} className="bg-muted rounded-lg p-3">
 <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
 <div className="text-sm font-semibold text-foreground">{item.value}</div>
 </div>
 ))}
 </div>
 <svg width="100%" height="60" viewBox="0 0 400 60" preserveAspectRatio="none" className="rounded-md overflow-hidden">
 <defs>
 <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor={selected.change1d >= 0 ? "#34d399" : "#f87171"} stopOpacity="0.3" />
 <stop offset="100%" stopColor={selected.change1d >= 0 ? "#34d399" : "#f87171"} stopOpacity="0" />
 </linearGradient>
 </defs>
 {/* Area fill */}
 <path
 d={sparkPath(selected.sparkline, 400, 60) + ` L400,60 L0,60 Z`}
 fill="url(#sparkGrad)"
 />
 <path
 d={sparkPath(selected.sparkline, 400, 60)}
 fill="none"
 stroke={selected.change1d >= 0 ? "#34d399" : "#f87171"}
 strokeWidth="2"
 />
 </svg>
 </CardContent>
 </Card>
 </motion.div>

 {/* FX Market Info */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {[
 {
 title: "Market Sessions",
 icon: <Globe className="w-3.5 h-3.5 text-muted-foreground/50" />,
 items: [
 { label: "Tokyo", status: "Open", color: "text-emerald-400" },
 { label: "London", status: "Open", color: "text-emerald-400" },
 { label: "New York", status: "Open", color: "text-emerald-400" },
 { label: "Sydney", status: "Closed", color: "text-muted-foreground" },
 ],
 },
 {
 title: "Liquidity Conditions",
 icon: <Activity className="w-4 h-4 text-amber-400" />,
 items: [
 { label: "EUR/USD Depth", status: "High", color: "text-emerald-400" },
 { label: "GBP/USD Depth", status: "High", color: "text-emerald-400" },
 { label: "USD/JPY Depth", status: "Medium", color: "text-amber-400" },
 { label: "USD/CHF Depth", status: "Medium", color: "text-amber-400" },
 ],
 },
 {
 title: "Key Levels Today",
 icon: <Target className="w-4 h-4 text-rose-400" />,
 items: [
 { label: "EUR/USD Pivot", status: "1.0820", color: "text-muted-foreground" },
 { label: "GBP/USD Pivot", status: "1.2640", color: "text-muted-foreground" },
 { label: "USD/JPY Pivot", status: "150.80", color: "text-muted-foreground" },
 { label: "USD/CHF Pivot", status: "0.8910", color: "text-muted-foreground" },
 ],
 },
 ].map((card, i) => (
 <motion.div key={card.title} custom={i} variants={fadeUp} initial="hidden" animate="visible">
 <Card className="bg-card border-border h-full">
 <CardHeader className="pb-2">
 <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
 {card.icon}
 {card.title}
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-2">
 {card.items.map((item) => (
 <div key={item.label} className="flex justify-between items-center text-xs text-muted-foreground">
 <span className="text-muted-foreground">{item.label}</span>
 <span className={cn("font-medium", item.color)}>{item.status}</span>
 </div>
 ))}
 </CardContent>
 </Card>
 </motion.div>
 ))}
 </div>
 </div>
 );
}

// ══════════════════════════════════════════════════════════════════════════════
// Tab 2 — Carry Trade
// ══════════════════════════════════════════════════════════════════════════════

function CarryTradeTab() {
 const [sortBy, setSortBy] = useState<"differential" | "totalReturn">("differential");

 const sorted = useMemo(() => {
 return [...CARRY_PAIRS].sort((a, b) => Math.abs(b[sortBy]) - Math.abs(a[sortBy]));
 }, [sortBy]);

 // Carry chart data: plot carry return decomposition
 const maxAbs = Math.max(...CARRY_PAIRS.map((p) => Math.abs(p.totalReturn)));

 return (
 <div className="space-y-4">
 {/* Rate table */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <div className="flex items-center justify-between">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 <DollarSign className="w-3.5 h-3.5 text-muted-foreground/50" />
 Interest Rate Differential Table
 </CardTitle>
 <div className="flex gap-2">
 <Button
 size="sm"
 variant={sortBy === "differential" ? "default" : "ghost"}
 className="h-6 text-xs text-muted-foreground"
 onClick={() => setSortBy("differential")}
 >
 By Differential
 </Button>
 <Button
 size="sm"
 variant={sortBy === "totalReturn" ? "default" : "ghost"}
 className="h-6 text-xs text-muted-foreground"
 onClick={() => setSortBy("totalReturn")}
 >
 By Total Return
 </Button>
 </div>
 </div>
 </CardHeader>
 <CardContent className="p-0">
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="text-muted-foreground border-b border-border">
 <th className="px-4 py-2 text-left">Pair</th>
 <th className="px-4 py-2 text-right">Base Rate</th>
 <th className="px-4 py-2 text-right">Quote Rate</th>
 <th className="px-4 py-2 text-right">Differential</th>
 <th className="px-4 py-2 text-right">Ann. Carry %</th>
 <th className="px-4 py-2 text-right">Daily Roll (pips)</th>
 <th className="px-4 py-2 text-right">Spot Return %</th>
 <th className="px-4 py-2 text-right">Total Return %</th>
 </tr>
 </thead>
 <tbody>
 {sorted.map((pair, i) => {
 const isPositive = pair.differential >= 0;
 const totalPos = pair.totalReturn >= 0;
 return (
 <motion.tr
 key={pair.symbol}
 custom={i}
 variants={fadeUp}
 initial="hidden"
 animate="visible"
 className="border-b border-border hover:bg-muted/40"
 >
 <td className="px-4 py-3">
 <div className="flex items-center gap-2">
 <span>{pair.flag1}{pair.flag2}</span>
 <span className="font-medium text-foreground">{pair.symbol}</span>
 </div>
 </td>
 <td className="px-4 py-3 text-right font-mono text-muted-foreground">{pair.baseRate.toFixed(2)}%</td>
 <td className="px-4 py-3 text-right font-mono text-muted-foreground">{pair.quoteRate.toFixed(2)}%</td>
 <td className={cn("px-4 py-3 text-right font-mono font-medium", isPositive ? "text-emerald-400" : "text-rose-400")}>
 {isPositive ? "+" : ""}{pair.differential.toFixed(2)}%
 </td>
 <td className="px-4 py-3 text-right font-mono text-muted-foreground">{pair.annualizedCarry.toFixed(2)}%</td>
 <td className="px-4 py-3 text-right font-mono text-muted-foreground">
 {(pair.rollYieldDaily * 10000).toFixed(2)}
 </td>
 <td className={cn("px-4 py-3 text-right font-mono", pair.spotReturn >= 0 ? "text-emerald-400" : "text-rose-400")}>
 {pair.spotReturn >= 0 ? "+" : ""}{pair.spotReturn.toFixed(2)}%
 </td>
 <td className={cn("px-4 py-3 text-right font-mono font-semibold", totalPos ? "text-emerald-400" : "text-rose-400")}>
 {totalPos ? "+" : ""}{pair.totalReturn.toFixed(2)}%
 </td>
 </motion.tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>

 {/* Carry decomposition chart */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
 <BarChart2 className="w-3.5 h-3.5 text-muted-foreground/50" />
 Carry Return Decomposition
 </CardTitle>
 </CardHeader>
 <CardContent>
 <svg width="100%" height="200" viewBox="0 0 360 200">
 {CARRY_PAIRS.map((pair, i) => {
 const barH = 20;
 const gap = 12;
 const y = i * (barH + gap) + 10;
 const maxW = 140;
 const carryW = (Math.abs(pair.annualizedCarry) / maxAbs) * maxW;
 const spotW = (Math.abs(pair.spotReturn) / maxAbs) * maxW;
 const carryColor = pair.annualizedCarry >= 0 ? "#34d399" : "#f87171";
 const spotColor = pair.spotReturn >= 0 ? "#60a5fa" : "#f87171";
 return (
 <g key={pair.symbol}>
 <text x="5" y={y + barH * 0.7} fontSize="9" fill="#71717a">{pair.symbol}</text>
 {/* Carry bar */}
 <rect x="70" y={y} width={carryW} height={barH * 0.45} rx="2" fill={carryColor} opacity="0.85" />
 {/* Spot bar */}
 <rect x="70" y={y + barH * 0.55} width={spotW} height={barH * 0.45} rx="2" fill={spotColor} opacity="0.65" />
 <text x={70 + carryW + 4} y={y + barH * 0.38} fontSize="8" fill={carryColor}>
 {pair.annualizedCarry.toFixed(1)}%
 </text>
 <text x={70 + spotW + 4} y={y + barH * 0.95} fontSize="8" fill={spotColor}>
 {pair.spotReturn >= 0 ? "+" : ""}{pair.spotReturn.toFixed(1)}%
 </text>
 </g>
 );
 })}
 {/* Legend */}
 <rect x="220" y="170" width="10" height="8" rx="1" fill="#34d399" opacity="0.85" />
 <text x="234" y="178" fontSize="9" fill="#a1a1aa">Carry</text>
 <rect x="270" y="170" width="10" height="8" rx="1" fill="#60a5fa" opacity="0.65" />
 <text x="284" y="178" fontSize="9" fill="#a1a1aa">Spot</text>
 </svg>
 </CardContent>
 </Card>

 {/* Roll yield explanation */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
 <Info className="w-4 h-4 text-amber-400" />
 Roll Yield Mechanics
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3 text-xs text-muted-foreground">
 <div className="bg-muted rounded-lg p-3 space-y-2">
 <div className="font-medium text-foreground text-sm">What is Carry Trade?</div>
 <p>
 Borrow in a low-interest-rate currency and invest in a high-interest-rate currency.
 The daily roll yield accrues as long as you hold the position overnight.
 </p>
 </div>
 <div className="space-y-2">
 {[
 { label: "USD vs JPY differential", value: "5.15%", note: "Highest major pair carry" },
 { label: "Optimal risk-adj. carry", value: "AUD/JPY", note: "Sharpe ~0.62 historically" },
 { label: "Break-even move (daily)", value: "±0.014%", note: "Carry must exceed FX loss" },
 { label: "Unwinding risk", value: "High", note: "JPY carry unwind = sharp reversal" },
 ].map((item) => (
 <div key={item.label} className="flex items-start justify-between bg-muted/50 rounded p-2">
 <div>
 <div className="text-muted-foreground font-medium">{item.label}</div>
 <div className="text-muted-foreground text-xs">{item.note}</div>
 </div>
 <span className="text-primary font-medium ml-2">{item.value}</span>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>

 {/* CB Rate comparison */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
 <Zap className="w-4 h-4 text-amber-400" />
 Central Bank Policy Rates
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-2">
 {Object.entries(CB_RATES).sort(([, a], [, b]) => b - a).map(([ccy, rate]) => (
 <div key={ccy} className="flex items-center gap-3">
 <span className="text-xs text-muted-foreground w-8 font-mono">{ccy}</span>
 <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
 <motion.div
 initial={{ width: 0 }}
 animate={{ width: `${(rate / 12) * 100}%` }}
 transition={{ duration: 0.6, delay: 0.1 }}
 className={cn("h-full rounded", rate >= 5 ? "bg-emerald-500" : rate >= 3 ? "bg-amber-500" : "bg-muted-foreground")}
 />
 </div>
 <span className="text-xs font-medium text-foreground w-12 text-right">{rate.toFixed(2)}%</span>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>
 );
}

// ══════════════════════════════════════════════════════════════════════════════
// Tab 3 — Technical Analysis
// ══════════════════════════════════════════════════════════════════════════════

function TechnicalAnalysisTab() {
 const [activePair, setActivePair] = useState<string>("EUR/USD");
 const tech = TECH_PAIRS.find((p) => p.symbol === activePair) ?? TECH_PAIRS[0];

 const barW = 360 / tech.candles.length;
 const candleData = candlestickSvg(tech.candles, 360, 120);

 // S/R level Y positions
 const allPrices = tech.candles.flatMap((c) => [c.h, c.l]);
 const priceMin = Math.min(...allPrices);
 const priceMax = Math.max(...allPrices);
 const priceRange = priceMax - priceMin || 1;
 const scaleY = (v: number) => 120 - ((v - priceMin) / priceRange) * 120;

 return (
 <div className="space-y-4">
 {/* Pair selector */}
 <div className="flex gap-2 flex-wrap">
 {TECH_PAIRS.map((p) => (
 <Button
 key={p.symbol}
 size="sm"
 variant={activePair === p.symbol ? "default" : "outline"}
 onClick={() => setActivePair(p.symbol)}
 className="text-xs text-muted-foreground"
 >
 {p.symbol}
 </Button>
 ))}
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {/* Candlestick chart */}
 <Card className="bg-card border-border md:col-span-2">
 <CardHeader className="pb-2">
 <div className="flex items-center justify-between">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 <BarChart2 className="w-3.5 h-3.5 text-muted-foreground/50" />
 {tech.symbol} — 20-Bar Candlestick
 </CardTitle>
 <Badge
 className={cn(
 "text-xs text-muted-foreground",
 tech.trend === "bullish" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
 tech.trend === "bearish" ? "bg-rose-500/20 text-rose-400 border-rose-500/30" :
 "bg-muted text-muted-foreground"
 )}
 >
 {tech.trend.toUpperCase()}
 </Badge>
 </div>
 </CardHeader>
 <CardContent>
 <svg width="100%" height="140" viewBox="0 0 360 140">
 {/* S/R level lines */}
 {tech.srLevels.map((lvl, i) => {
 const y = scaleY(lvl.price);
 if (y < 0 || y > 120) return null;
 return (
 <line
 key={i}
 x1="0" y1={y} x2="360" y2={y}
 stroke={lvl.type === "support" ? "#34d399" : "#f87171"}
 strokeWidth="1"
 strokeDasharray="4 3"
 opacity="0.6"
 />
 );
 })}
 {/* Candles */}
 {candleData.map((c, i) => (
 <g key={i}>
 {/* Wick */}
 <line
 x1={c.x + barW * 0.4}
 y1={c.wickTop}
 x2={c.x + barW * 0.4}
 y2={c.wickBot}
 stroke={c.bullish ? "#34d399" : "#f87171"}
 strokeWidth="1"
 />
 {/* Body */}
 <rect
 x={c.x}
 y={c.bodyTop}
 width={barW * 0.7}
 height={c.bodyH}
 fill={c.bullish ? "#34d399" : "#f87171"}
 opacity="0.85"
 rx="0.5"
 />
 </g>
 ))}
 {/* S/R labels */}
 {tech.srLevels.map((lvl, i) => {
 const y = scaleY(lvl.price);
 if (y < 0 || y > 120) return null;
 const decimals = tech.symbol.includes("JPY") ? 2 : 4;
 return (
 <text key={`lbl${i}`} x="2" y={y - 2} fontSize="8" fill={lvl.type === "support" ? "#34d399" : "#f87171"} opacity="0.9">
 {lvl.price.toFixed(decimals)}
 </text>
 );
 })}
 </svg>
 {/* Legend */}
 <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
 <div className="flex items-center gap-1">
 <div className="w-4 h-px border-b border-dashed border-emerald-400" />
 <span>Support</span>
 </div>
 <div className="flex items-center gap-1">
 <div className="w-4 h-px border-b border-dashed border-rose-400" />
 <span>Resistance</span>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Indicators panel */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
 <Activity className="w-4 h-4 text-amber-400" />
 Technical Signals
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 {/* Pattern */}
 <div className="bg-muted rounded-lg p-3">
 <div className="text-xs text-muted-foreground mb-1">Detected Pattern</div>
 <div className="text-sm font-medium text-amber-300">{tech.pattern}</div>
 </div>
 {/* RSI */}
 <div className="bg-muted rounded-lg p-3">
 <div className="flex justify-between text-xs text-muted-foreground mb-1">
 <span>RSI(14)</span>
 <span className={cn(tech.rsi > 70 ? "text-rose-400" : tech.rsi < 30 ? "text-emerald-400" : "text-muted-foreground")}>
 {tech.rsi > 70 ? "Overbought" : tech.rsi < 30 ? "Oversold" : "Neutral"}
 </span>
 </div>
 <Progress value={tech.rsi} className="h-2" />
 <div className="text-sm font-medium text-foreground mt-1">{tech.rsi}</div>
 </div>
 {/* MACD */}
 <div className="bg-muted rounded-lg p-3">
 <div className="text-xs text-muted-foreground mb-1">MACD Signal</div>
 <Badge
 className={cn(
 "text-xs text-muted-foreground",
 tech.macdSignal === "bullish" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
 tech.macdSignal === "bearish" ? "bg-rose-500/20 text-rose-400 border-rose-500/30" :
 "bg-muted text-muted-foreground"
 )}
 >
 {tech.macdSignal.toUpperCase()} CROSSOVER
 </Badge>
 </div>
 {/* Support/Resistance levels */}
 <div className="bg-muted rounded-lg p-3">
 <div className="text-xs text-muted-foreground mb-2">Key S/R Levels</div>
 <div className="space-y-1">
 {tech.srLevels.map((lvl, i) => {
 const decimals = tech.symbol.includes("JPY") ? 2 : 4;
 return (
 <div key={i} className="flex justify-between items-center text-xs text-muted-foreground">
 <div className="flex items-center gap-1.5">
 <div className={cn("w-1.5 h-1.5 rounded-full", lvl.type === "support" ? "bg-emerald-400" : "bg-rose-400")} />
 <span className="text-muted-foreground capitalize">{lvl.type}</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="font-mono text-muted-foreground">{lvl.price.toFixed(decimals)}</span>
 <div className="w-10 h-1 bg-muted rounded">
 <div
 className={cn("h-full rounded", lvl.type === "support" ? "bg-emerald-500" : "bg-rose-500")}
 style={{ width: `${lvl.strength}%` }}
 />
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* All pairs summary */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
 <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/50" />
 Technical Summary — All Major Pairs
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 {TECH_PAIRS.map((p) => (
 <div
 key={p.symbol}
 onClick={() => setActivePair(p.symbol)}
 className={cn(
 "bg-muted rounded-lg p-3 cursor-pointer transition-colors hover:bg-muted",
 activePair === p.symbol && "ring-1 ring-primary"
 )}
 >
 <div className="text-xs font-medium text-foreground mb-2">{p.symbol}</div>
 <div className="space-y-1 text-xs text-muted-foreground">
 <div className="flex justify-between">
 <span className="text-muted-foreground">Trend</span>
 <span className={p.trend === "bullish" ? "text-emerald-400" : p.trend === "bearish" ? "text-rose-400" : "text-muted-foreground"}>
 {p.trend}
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">RSI</span>
 <span className="text-muted-foreground">{p.rsi}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">MACD</span>
 <span className={p.macdSignal === "bullish" ? "text-emerald-400" : p.macdSignal === "bearish" ? "text-rose-400" : "text-muted-foreground"}>
 {p.macdSignal}
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Pattern</span>
 <span className="text-amber-300 truncate max-w-[80px] text-right">{p.pattern.split(" ").slice(0, 2).join(" ")}</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>
 );
}

// ══════════════════════════════════════════════════════════════════════════════
// Tab 4 — Macro Drivers
// ══════════════════════════════════════════════════════════════════════════════

function MacroDriversTab() {
 // Scatter plot: interest diff (x) vs PPP deviation (y)
 const scatterW = 340;
 const scatterH = 180;
 const xMin = -2, xMax = 6;
 const yMin = -8, yMax = 20;
 const toSvgX = (v: number) => ((v - xMin) / (xMax - xMin)) * (scatterW - 60) + 30;
 const toSvgY = (v: number) => scatterH - ((v - yMin) / (yMax - yMin)) * (scatterH - 40) - 20;

 return (
 <div className="space-y-4">
 {/* PPP and interest rate parity */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 <Globe className="w-3.5 h-3.5 text-muted-foreground/50" />
 PPP Valuation &amp; Interest Rate Parity
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="text-muted-foreground border-b border-border">
 <th className="py-2 text-left">Pair</th>
 <th className="py-2 text-right">Spot</th>
 <th className="py-2 text-right">PPP Fair</th>
 <th className="py-2 text-right">Deviation</th>
 <th className="py-2 text-right">Outlook</th>
 </tr>
 </thead>
 <tbody>
 {MACRO_DRIVERS.map((d, i) => (
 <motion.tr
 key={d.pair}
 custom={i}
 variants={fadeUp}
 initial="hidden"
 animate="visible"
 className="border-b border-border"
 >
 <td className="py-2 font-medium text-foreground">{d.pair}</td>
 <td className="py-2 text-right font-mono text-muted-foreground">{d.currentSpot.toFixed(4)}</td>
 <td className="py-2 text-right font-mono text-muted-foreground">{d.pppFair.toFixed(4)}</td>
 <td className={cn("py-2 text-right font-mono font-medium", d.pppDeviation >= 0 ? "text-rose-400" : "text-emerald-400")}>
 {d.pppDeviation >= 0 ? "+" : ""}{d.pppDeviation.toFixed(1)}%
 </td>
 <td className="py-2 text-right">
 <Badge
 className={cn(
 "text-xs text-muted-foreground",
 d.outlook === "overvalued" ? "bg-rose-500/20 text-rose-400 border-rose-500/30" :
 d.outlook === "undervalued" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
 "bg-muted text-muted-foreground"
 )}
 >
 {d.outlook}
 </Badge>
 </td>
 </motion.tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>

 {/* Scatter: interest diff vs PPP deviation */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
 <BarChart2 className="w-3.5 h-3.5 text-muted-foreground/50" />
 Interest Differential vs PPP Deviation
 </CardTitle>
 </CardHeader>
 <CardContent>
 <svg width="100%" height={scatterH} viewBox={`0 0 ${scatterW} ${scatterH}`}>
 {/* Grid */}
 {[0, 5, 10, 15].map((v) => (
 <line key={v} x1="30" y1={toSvgY(v)} x2={scatterW - 10} y2={toSvgY(v)} stroke="#3f3f46" strokeWidth="0.5" />
 ))}
 {[-1, 0, 1, 2, 3, 4, 5].map((v) => (
 <line key={v} x1={toSvgX(v)} y1="10" x2={toSvgX(v)} y2={scatterH - 20} stroke="#3f3f46" strokeWidth="0.5" />
 ))}
 {/* Zero lines */}
 <line x1="30" y1={toSvgY(0)} x2={scatterW - 10} y2={toSvgY(0)} stroke="#71717a" strokeWidth="1" />
 <line x1={toSvgX(0)} y1="10" x2={toSvgX(0)} y2={scatterH - 20} stroke="#71717a" strokeWidth="1" />
 {/* Axis labels */}
 <text x={scatterW / 2} y={scatterH - 2} fontSize="8" fill="#71717a" textAnchor="middle">Interest Rate Differential (%)</text>
 <text x="8" y={scatterH / 2} fontSize="8" fill="#71717a" textAnchor="middle" transform={`rotate(-90 8 ${scatterH / 2})`}>PPP Deviation (%)</text>
 {/* Points */}
 {MACRO_DRIVERS.map((d) => {
 const cx = toSvgX(d.interestDiff);
 const cy = toSvgY(d.pppDeviation);
 const color = d.outlook === "overvalued" ? "#f87171" : d.outlook === "undervalued" ? "#34d399" : "#60a5fa";
 return (
 <g key={d.pair}>
 <circle cx={cx} cy={cy} r="6" fill={color} opacity="0.7" />
 <text x={cx + 8} y={cy + 4} fontSize="9" fill={color}>{d.pair}</text>
 </g>
 );
 })}
 </svg>
 </CardContent>
 </Card>
 </div>

 {/* Central bank divergence & current account */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 <Zap className="w-4 h-4 text-amber-400" />
 Central Bank Divergence &amp; Current Account Balance
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 <div className="space-y-3">
 <div className="text-xs text-muted-foreground font-medium mb-2">CB Policy Stance</div>
 {MACRO_DRIVERS.map((d) => (
 <div key={d.pair} className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
 <span className="text-xs font-medium text-foreground">{d.pair}</span>
 <div className="flex items-center gap-2">
 <Badge
 className={cn(
 "text-xs text-muted-foreground",
 d.cbDivergence === "hawkish" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
 d.cbDivergence === "dovish" ? "bg-rose-500/20 text-rose-400 border-rose-500/30" :
 "bg-muted text-muted-foreground"
 )}
 >
 {d.cbDivergence.toUpperCase()}
 </Badge>
 <span className="text-xs text-muted-foreground">Int. Diff: {d.interestDiff >= 0 ? "+" : ""}{d.interestDiff.toFixed(2)}%</span>
 </div>
 </div>
 ))}
 </div>
 <div className="space-y-3">
 <div className="text-xs text-muted-foreground font-medium mb-2">Current Account (% GDP)</div>
 {MACRO_DRIVERS.map((d) => {
 const isPositive = d.currentAccount >= 0;
 const barPct = Math.abs(d.currentAccount) / 8 * 100;
 return (
 <div key={d.pair} className="space-y-1">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">{d.pair}</span>
 <span className={cn("font-medium", isPositive ? "text-emerald-400" : "text-rose-400")}>
 {isPositive ? "+" : ""}{d.currentAccount.toFixed(1)}%
 </span>
 </div>
 <div className="h-2 bg-muted rounded overflow-hidden">
 <motion.div
 initial={{ width: 0 }}
 animate={{ width: `${barPct}%` }}
 transition={{ duration: 0.6 }}
 className={cn("h-full rounded", isPositive ? "bg-emerald-500" : "bg-rose-500")}
 />
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Theory cards */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {[
 {
 title: "Purchasing Power Parity",
 icon: <Globe className="w-3.5 h-3.5 text-muted-foreground/50" />,
 body: "PPP states that exchange rates should equalize the price of identical goods across countries. In the long run (5–10 years) currencies revert toward PPP fair value, making it useful for valuation but not timing.",
 stat: "Avg reversion: ~6–8 years",
 },
 {
 title: "Interest Rate Parity",
 icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
 body: "Covered IRP: forward discount/premium = interest differential. Uncovered IRP assumes spot rates adjust to offset yield differences. In practice, the carry trade profits from IRP violations over medium timeframes.",
 stat: "USD/JPY IRP gap: +5.15%",
 },
 {
 title: "Current Account Dynamics",
 icon: <ArrowUpDown className="w-4 h-4 text-amber-400" />,
 body: "Surplus countries (e.g., CHF, JPY) attract safe-haven demand. Deficit countries face persistent currency depreciation pressure unless offset by capital account inflows or high interest rates.",
 stat: "CHF CA surplus: +5.8% GDP",
 },
 ].map((card, i) => (
 <motion.div key={card.title} custom={i} variants={fadeUp} initial="hidden" animate="visible">
 <Card className="bg-card border-border h-full">
 <CardHeader className="pb-2">
 <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
 {card.icon}
 {card.title}
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 <p className="text-xs text-muted-foreground leading-relaxed">{card.body}</p>
 <div className="bg-muted rounded px-3 py-2 text-xs font-medium text-primary">{card.stat}</div>
 </CardContent>
 </Card>
 </motion.div>
 ))}
 </div>
 </div>
 );
}

// ══════════════════════════════════════════════════════════════════════════════
// Tab 5 — Risk Management
// ══════════════════════════════════════════════════════════════════════════════

function RiskManagementTab() {
 const [accountSize, setAccountSize] = useState<number>(10000);
 const [riskPct, setRiskPct] = useState<number>(1);
 const [stopPips, setStopPips] = useState<number>(30);
 const [pair, setPair] = useState<string>("EUR/USD");

 const selectedPairDef = MAJOR_PAIRS.find((p) => p.symbol === pair) ?? MAJOR_PAIRS[0];
 const isJpy = selectedPairDef.isJpy;
 const pipValue = isJpy ? 0.01 : 0.0001;
 const riskAmount = (accountSize * riskPct) / 100;
 const positionSizeLots = riskAmount / (stopPips * pipValue * 100000);
 const pipValuePerLot = isJpy ? (0.01 / selectedPairDef.price) * 100000 : 0.0001 * 100000;
 const dollarPerPip = positionSizeLots * pipValuePerLot;

 return (
 <div className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Pip value calculator */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 <Calculator className="w-3.5 h-3.5 text-muted-foreground/50" />
 Pip Value &amp; Position Size Calculator
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 {/* Pair selector */}
 <div>
 <label className="text-xs text-muted-foreground mb-1 block">Currency Pair</label>
 <div className="flex gap-2 flex-wrap">
 {MAJOR_PAIRS.map((p) => (
 <Button
 key={p.symbol}
 size="sm"
 variant={pair === p.symbol ? "default" : "outline"}
 className="text-xs text-muted-foreground h-7"
 onClick={() => setPair(p.symbol)}
 >
 {p.symbol}
 </Button>
 ))}
 </div>
 </div>

 {/* Inputs */}
 <div className="grid grid-cols-3 gap-3">
 {[
 {
 label: "Account Size ($)",
 value: accountSize,
 onChange: (v: number) => setAccountSize(Math.max(1000, v)),
 step: 1000,
 min: 1000,
 max: 1000000,
 },
 {
 label: "Risk Per Trade (%)",
 value: riskPct,
 onChange: (v: number) => setRiskPct(Math.max(0.1, Math.min(5, v))),
 step: 0.1,
 min: 0.1,
 max: 5,
 },
 {
 label: "Stop Loss (pips)",
 value: stopPips,
 onChange: (v: number) => setStopPips(Math.max(1, v)),
 step: 5,
 min: 5,
 max: 200,
 },
 ].map((input) => (
 <div key={input.label}>
 <label className="text-xs text-muted-foreground block mb-1">{input.label}</label>
 <input
 type="number"
 value={input.value}
 step={input.step}
 min={input.min}
 max={input.max}
 onChange={(e) => input.onChange(parseFloat(e.target.value) || 0)}
 className="w-full bg-muted border border-border rounded px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
 />
 </div>
 ))}
 </div>

 {/* Results */}
 <div className="grid grid-cols-2 gap-3">
 {[
 { label: "Risk Amount", value: `$${riskAmount.toFixed(2)}`, color: "text-amber-400" },
 { label: "Position Size", value: `${positionSizeLots.toFixed(4)} lots`, color: "text-primary" },
 { label: "Units", value: `${Math.round(positionSizeLots * 100000).toLocaleString()}`, color: "text-foreground" },
 { label: "$ per Pip", value: `$${dollarPerPip.toFixed(2)}`, color: "text-emerald-400" },
 { label: "Pip Size", value: isJpy ? "0.01" : "0.0001", color: "text-muted-foreground" },
 { label: "Stop Distance", value: `${stopPips} pips`, color: "text-rose-400" },
 ].map((r) => (
 <div key={r.label} className="bg-muted rounded-lg p-3">
 <div className="text-xs text-muted-foreground">{r.label}</div>
 <div className={cn("text-sm font-medium mt-0.5", r.color)}>{r.value}</div>
 </div>
 ))}
 </div>

 {/* Risk scale */}
 <div>
 <div className="flex justify-between text-xs text-muted-foreground mb-1">
 <span>Risk Level</span>
 <span className={cn(
 riskPct <= 1 ? "text-emerald-400" : riskPct <= 2 ? "text-amber-400" : "text-rose-400"
 )}>
 {riskPct <= 1 ? "Conservative" : riskPct <= 2 ? "Moderate" : "Aggressive"}
 </span>
 </div>
 <Progress value={(riskPct / 5) * 100} className="h-2" />
 </div>
 </CardContent>
 </Card>

 {/* Correlation heatmap */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 <BarChart2 className="w-3.5 h-3.5 text-muted-foreground/50" />
 Pair Correlation Matrix
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <table className="text-xs text-muted-foreground">
 <thead>
 <tr>
 <th className="w-16" />
 {CORR_PAIRS.map((p) => (
 <th key={p} className="px-1 py-1 text-muted-foreground font-normal w-14 text-center">
 {p.replace("/", "/")}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {CORR_MATRIX.map((row, i) => (
 <tr key={CORR_PAIRS[i]}>
 <td className="pr-2 text-muted-foreground text-right py-0.5 whitespace-nowrap">
 {CORR_PAIRS[i]}
 </td>
 {row.map((val, j) => (
 <td key={j} className="px-0.5 py-0.5">
 <div
 className={cn(
 "w-12 h-7 rounded flex items-center justify-center text-[11px] font-medium",
 corrColor(val),
 Math.abs(val) >= 0.5 ? "text-foreground" : "text-muted-foreground"
 )}
 >
 {val.toFixed(2)}
 </div>
 </td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 <div className="flex gap-3 mt-3 text-xs text-muted-foreground flex-wrap">
 <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500/80" /><span className="text-muted-foreground">Strong +</span></div>
 <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500/40" /><span className="text-muted-foreground">Moderate +</span></div>
 <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-muted/40" /><span className="text-muted-foreground">Neutral</span></div>
 <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-rose-500/40" /><span className="text-muted-foreground">Moderate −</span></div>
 <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-rose-500/80" /><span className="text-muted-foreground">Strong −</span></div>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Hedging strategies */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 <ShieldCheck className="w-4 h-4 text-emerald-400" />
 FX Hedging Strategies
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
 {[
 {
 name: "Direct Hedge",
 description: "Open equal and opposite position in same pair. Locks in current P&L, no net exposure.",
 cost: "Spread only",
 effectiveness: 100,
 color: "text-emerald-400",
 },
 {
 name: "Correlation Hedge",
 description: "Use negatively correlated pair to reduce exposure. EUR/USD + USD/CHF (-0.89 corr.) reduces EUR exposure ~89%.",
 cost: "Low",
 effectiveness: 85,
 color: "text-primary",
 },
 {
 name: "Options Hedge",
 description: "Buy protective puts or calls to cap downside while preserving upside. Ideal for uncertain macro events.",
 cost: "Premium paid",
 effectiveness: 95,
 color: "text-amber-400",
 },
 {
 name: "Forward Contract",
 description: "Lock in exchange rate for future settlement. Eliminates FX risk for known future cash flows.",
 cost: "Bid-ask spread",
 effectiveness: 100,
 color: "text-rose-400",
 },
 ].map((strat, i) => (
 <motion.div key={strat.name} custom={i} variants={fadeUp} initial="hidden" animate="visible">
 <div className="bg-muted rounded-lg p-4 h-full space-y-2">
 <div className={cn("text-sm font-medium", strat.color)}>{strat.name}</div>
 <p className="text-[11px] text-muted-foreground leading-relaxed">{strat.description}</p>
 <div className="space-y-1 pt-1">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">Cost</span>
 <span className="text-muted-foreground">{strat.cost}</span>
 </div>
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">Effectiveness</span>
 <span className="text-muted-foreground">{strat.effectiveness}%</span>
 </div>
 <div className="h-1.5 bg-muted rounded overflow-hidden mt-1">
 <motion.div
 initial={{ width: 0 }}
 animate={{ width: `${strat.effectiveness}%` }}
 transition={{ duration: 0.6, delay: i * 0.1 }}
 className="h-full bg-primary rounded"
 />
 </div>
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* Risk rules */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
 <Info className="w-4 h-4 text-amber-400" />
 Professional FX Risk Rules
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {[
 { rule: "1% Rule", detail: "Never risk more than 1–2% of account per trade. Allows 50+ consecutive losses before account wipeout." },
 { rule: "Correlation Limit", detail: "Treat EUR/USD + GBP/USD as one position when sizing — correlation 0.87 means double exposure." },
 { rule: "Leverage Control", detail: "Retail FX allows up to 30:1 (EU) or 50:1 (US). Professionals typically use 3:1–10:1 max." },
 { rule: "Session Risk", detail: "Reduce size during low-liquidity periods (post-NY close, holiday sessions) — wider spreads and gaps." },
 { rule: "News Event Protocol", detail: "Close or hedge positions before high-impact events (NFP, FOMC, rate decisions) to avoid slippage." },
 { rule: "Daily Drawdown Limit", detail: "Set a hard stop at -3% to -5% daily loss. If hit, stop trading for the day regardless of conviction." },
 ].map((r) => (
 <div key={r.rule} className="flex gap-3 bg-muted/50 rounded-lg p-3">
 <div className="w-1 rounded-full bg-primary flex-shrink-0" />
 <div>
 <div className="text-xs font-medium text-foreground mb-0.5">{r.rule}</div>
 <div className="text-[11px] text-muted-foreground leading-relaxed">{r.detail}</div>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>
 );
}

// ══════════════════════════════════════════════════════════════════════════════
// Page root
// ══════════════════════════════════════════════════════════════════════════════

export default function ForexPage() {
 return (
 <div className="p-4 md:p-4 space-y-4 min-h-screen">
 {/* Header */}
 <motion.div
 initial={{ opacity: 0, y: -12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 className="border-l-4 border-l-primary rounded-lg bg-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
 >
 <div>
 <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
 <Globe className="w-3.5 h-3.5 text-muted-foreground/50" />
 Foreign Exchange
 </h1>
 <p className="text-sm text-muted-foreground mt-0.5">
 Major pairs, carry trade, technical analysis, macro fundamentals &amp; risk management
 </p>
 </div>
 <div className="flex items-center gap-2 text-xs text-muted-foreground">
 <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
 <span>London &amp; New York sessions open</span>
 </div>
 </motion.div>

 {/* Summary stat chips */}
 <motion.div
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4, delay: 0.08 }}
 className="flex flex-wrap gap-2"
 >
 {[
 { icon: <TrendingUp className="w-3 h-3" />, label: "EUR/USD", value: fmt(MAJOR_PAIRS[0].price, 5), color: MAJOR_PAIRS[0].change1d >= 0 ? "text-emerald-400" : "text-rose-400" },
 { icon: <TrendingDown className="w-3 h-3" />, label: "GBP/USD", value: fmt(MAJOR_PAIRS[1].price, 5), color: MAJOR_PAIRS[1].change1d >= 0 ? "text-emerald-400" : "text-rose-400" },
 { icon: <ArrowUpDown className="w-3 h-3" />, label: "USD/JPY", value: fmt(MAJOR_PAIRS[2].price, 3), color: MAJOR_PAIRS[2].change1d >= 0 ? "text-emerald-400" : "text-rose-400" },
 { icon: <DollarSign className="w-3 h-3" />, label: "USD/CHF", value: fmt(MAJOR_PAIRS[3].price, 5), color: MAJOR_PAIRS[3].change1d >= 0 ? "text-emerald-400" : "text-rose-400" },
 { icon: <Zap className="w-3 h-3" />, label: "Fed Rate", value: "5.25%", color: "text-amber-400" },
 { icon: <Activity className="w-3 h-3" />, label: "Daily Vol", value: "High", color: "text-emerald-400" },
 ].map((chip) => (
 <div
 key={chip.label}
 className="flex items-center gap-1.5 bg-muted/70 border border-border rounded-full px-3 py-1 text-xs text-muted-foreground"
 >
 <span className={chip.color}>{chip.icon}</span>
 <span className="text-muted-foreground">{chip.label}</span>
 <span className={cn("font-medium", chip.color)}>{chip.value}</span>
 </div>
 ))}
 </motion.div>

 {/* Tabs */}
 <Tabs defaultValue="pairs" className="mt-8">
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
 <TabsTrigger value="pairs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Major Pairs
 </TabsTrigger>
 <TabsTrigger value="carry" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Carry Trade
 </TabsTrigger>
 <TabsTrigger value="technical" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Technical Analysis
 </TabsTrigger>
 <TabsTrigger value="macro" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Macro Drivers
 </TabsTrigger>
 <TabsTrigger value="risk" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Risk Management
 </TabsTrigger>
 </TabsList>

 <TabsContent value="pairs" className="mt-4 data-[state=inactive]:hidden">
 <MajorPairsTab />
 </TabsContent>
 <TabsContent value="carry" className="mt-4 data-[state=inactive]:hidden">
 <CarryTradeTab />
 </TabsContent>
 <TabsContent value="technical" className="mt-4 data-[state=inactive]:hidden">
 <TechnicalAnalysisTab />
 </TabsContent>
 <TabsContent value="macro" className="mt-4 data-[state=inactive]:hidden">
 <MacroDriversTab />
 </TabsContent>
 <TabsContent value="risk" className="mt-4 data-[state=inactive]:hidden">
 <RiskManagementTab />
 </TabsContent>
 </Tabs>
 </div>
 );
}
