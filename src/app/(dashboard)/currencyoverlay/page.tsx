"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
 Globe,
 TrendingUp,
 TrendingDown,
 DollarSign,
 Calculator,
 BarChart2,
 Shield,
 AlertTriangle,
 ArrowUpDown,
 Info,
 RefreshCw,
 Layers,
 Activity,
 ChevronDown,
 ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────

let s = 99;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};

// Reset seed for deterministic generation
const resetSeed = () => { s = 99; };

// ── Types ──────────────────────────────────────────────────────────────────────

interface CurrencyExposure {
 currency: string;
 flag: string;
 exposure: number; // USD equivalent
 pctPortfolio: number;
 hedged: boolean;
 hedgeRatio: number;
 spotRate: number; // vs USD
 interestRate: number; // %
 onePercentImpact: number;
}

interface CarryPair {
 pair: string;
 base: string;
 quote: string;
 carryYield: number; // %
 spotReturn: number; // % ytd
 totalReturn: number; // %
 rollingSharpe: number;
 carryRisk: "low" | "medium" | "high" | "crash";
}

interface PPPData {
 country: string;
 currency: string;
 bigMacPrice: number; // local currency
 impliedRate: number; // vs USD
 actualRate: number;
 deviation: number; // % over/under valued
}

interface REERData {
 currency: string;
 currentREER: number;
 tenYrAvg: number;
 zScore: number;
 signal: "strong_sell" | "sell" | "neutral" | "buy" | "strong_buy";
}

interface CIPDeviation {
 pair: string;
 theoreticalForward: number;
 marketForward: number;
 basisPts: number;
 impliedUSDRate: number; // via FX swap
 fedFundsRate: number;
 fundingStress: boolean;
}

// ── Static Data Generation ─────────────────────────────────────────────────────

function generateExposures(): CurrencyExposure[] {
 resetSeed();
 const currencies = [
 { currency: "EUR", flag: "🇪🇺", spotRate: 1.085, interestRate: 3.75 },
 { currency: "GBP", flag: "🇬🇧", spotRate: 1.264, interestRate: 5.25 },
 { currency: "JPY", flag: "🇯🇵", spotRate: 0.0067, interestRate: 0.1 },
 { currency: "CHF", flag: "🇨🇭", spotRate: 1.124, interestRate: 1.5 },
 { currency: "CAD", flag: "🇨🇦", spotRate: 0.735, interestRate: 4.25 },
 { currency: "AUD", flag: "🇦🇺", spotRate: 0.651, interestRate: 4.35 },
 { currency: "HKD", flag: "🇭🇰", spotRate: 0.128, interestRate: 5.5 },
 { currency: "SGD", flag: "🇸🇬", spotRate: 0.744, interestRate: 3.68 },
 ];
 const totalPortfolio = 2_500_000;
 return currencies.map((c) => {
 const pct = 4 + rand() * 14;
 const exposure = Math.round((pct / 100) * totalPortfolio);
 return {
 ...c,
 exposure,
 pctPortfolio: parseFloat(pct.toFixed(1)),
 hedged: rand() > 0.5,
 hedgeRatio: Math.round(30 + rand() * 60),
 onePercentImpact: Math.round(exposure * 0.01),
 };
 });
}

function generateCarryPairs(): CarryPair[] {
 resetSeed();
 const pairs = [
 { pair: "AUD/JPY", base: "AUD", quote: "JPY", carryYield: 4.25 },
 { pair: "NZD/JPY", base: "NZD", quote: "JPY", carryYield: 4.9 },
 { pair: "GBP/CHF", base: "GBP", quote: "CHF", carryYield: 3.75 },
 { pair: "USD/JPY", base: "USD", quote: "JPY", carryYield: 5.15 },
 { pair: "AUD/CHF", base: "AUD", quote: "CHF", carryYield: 2.85 },
 { pair: "NZD/CHF", base: "NZD", quote: "CHF", carryYield: 3.4 },
 { pair: "EUR/JPY", base: "EUR", quote: "JPY", carryYield: 3.65 },
 { pair: "CAD/JPY", base: "CAD", quote: "JPY", carryYield: 4.15 },
 ].sort((a, b) => b.carryYield - a.carryYield);

 return pairs.map((p) => {
 const spotReturn = -5 + rand() * 14;
 const totalReturn = spotReturn + p.carryYield * 0.75;
 const sharpe = 0.2 + rand() * 1.8;
 return {
 ...p,
 spotReturn: parseFloat(spotReturn.toFixed(2)),
 totalReturn: parseFloat(totalReturn.toFixed(2)),
 rollingSharpe: parseFloat(sharpe.toFixed(2)),
 carryRisk:
 sharpe < 0.5
 ? "crash"
 : sharpe < 0.8
 ? "high"
 : sharpe < 1.2
 ? "medium"
 : "low",
 };
 });
}

function generatePPPData(): PPPData[] {
 return [
 { country: "Eurozone", currency: "EUR", bigMacPrice: 4.77, impliedRate: 1.157, actualRate: 1.085 },
 { country: "United Kingdom", currency: "GBP", bigMacPrice: 4.19, impliedRate: 1.018, actualRate: 1.264 },
 { country: "Japan", currency: "JPY", bigMacPrice: 450, impliedRate: 0.00588, actualRate: 0.0067 },
 { country: "Switzerland", currency: "CHF", bigMacPrice: 6.7, impliedRate: 1.627, actualRate: 1.124 },
 { country: "Canada", currency: "CAD", bigMacPrice: 6.77, impliedRate: 0.833, actualRate: 0.735 },
 { country: "Australia", currency: "AUD", bigMacPrice: 6.7, impliedRate: 0.820, actualRate: 0.651 },
 { country: "China", currency: "CNY", bigMacPrice: 24.4, impliedRate: 0.162, actualRate: 0.138 },
 { country: "Brazil", currency: "BRL", bigMacPrice: 19.9, impliedRate: 0.296, actualRate: 0.196 },
 { country: "India", currency: "INR", bigMacPrice: 200, impliedRate: 0.028, actualRate: 0.012 },
 { country: "Mexico", currency: "MXN", bigMacPrice: 79.0, impliedRate: 0.100, actualRate: 0.058 },
 ].map((d) => ({
 ...d,
 deviation: parseFloat(((d.impliedRate / d.actualRate - 1) * 100).toFixed(1)),
 }));
}

function generateREER(): REERData[] {
 const data: REERData[] = [
 { currency: "USD", currentREER: 112.4, tenYrAvg: 102.1, zScore: 1.84, signal: "strong_sell" },
 { currency: "EUR", currentREER: 96.2, tenYrAvg: 100.3, zScore: -0.74, signal: "neutral" },
 { currency: "GBP", currentREER: 81.3, tenYrAvg: 92.7, zScore: -2.05, signal: "strong_buy" },
 { currency: "JPY", currentREER: 64.1, tenYrAvg: 82.5, zScore: -3.21, signal: "strong_buy" },
 { currency: "CHF", currentREER: 119.7, tenYrAvg: 108.2, zScore: 2.04, signal: "strong_sell" },
 { currency: "CAD", currentREER: 99.1, tenYrAvg: 100.8, zScore: -0.30, signal: "neutral" },
 { currency: "AUD", currentREER: 91.6, tenYrAvg: 96.4, zScore: -0.88, signal: "buy" },
 { currency: "CNY", currentREER: 108.3, tenYrAvg: 101.5, zScore: 1.23, signal: "sell" },
 ];
 return data;
}

function generateCIPData(): CIPDeviation[] {
 return [
 {
 pair: "EUR/USD",
 theoreticalForward: 1.0812,
 marketForward: 1.0794,
 basisPts: -17,
 impliedUSDRate: 5.67,
 fedFundsRate: 5.33,
 fundingStress: false,
 },
 {
 pair: "USD/JPY",
 theoreticalForward: 156.23,
 marketForward: 155.87,
 basisPts: -23,
 impliedUSDRate: 5.89,
 fedFundsRate: 5.33,
 fundingStress: true,
 },
 {
 pair: "GBP/USD",
 theoreticalForward: 1.2598,
 marketForward: 1.2582,
 basisPts: -13,
 impliedUSDRate: 5.51,
 fedFundsRate: 5.33,
 fundingStress: false,
 },
 {
 pair: "AUD/USD",
 theoreticalForward: 0.6484,
 marketForward: 0.6472,
 basisPts: -18,
 impliedUSDRate: 5.71,
 fedFundsRate: 5.33,
 fundingStress: false,
 },
 ];
}

// ── SVG Chart Components ───────────────────────────────────────────────────────

function BarChart({
 data,
 width = 280,
 height = 120,
 color = "#6366f1",
}: {
 data: { label: string; value: number }[];
 width?: number;
 height?: number;
 color?: string;
}) {
 const max = Math.max(...data.map((d) => Math.abs(d.value)));
 const barW = (width - 20) / data.length - 4;
 const mid = height / 2;

 return (
 <svg width={width} height={height} className="overflow-visible">
 <line x1={10} y1={mid} x2={width - 10} y2={mid} stroke="#374151" strokeWidth={1} />
 {data.map((d, i) => {
 const bh = max > 0 ? (Math.abs(d.value) / max) * (height / 2 - 8) : 0;
 const positive = d.value >= 0;
 const x = 12 + i * (barW + 4);
 return (
 <g key={i}>
 <rect
 x={x}
 y={positive ? mid - bh : mid}
 width={barW}
 height={bh}
 fill={positive ? color : "#ef4444"}
 rx={2}
 opacity={0.85}
 />
 <text
 x={x + barW / 2}
 y={height - 2}
 textAnchor="middle"
 fontSize={8}
 fill="#9ca3af"
 >
 {d.label}
 </text>
 </g>
 );
 })}
 </svg>
 );
}

function LineChart({
 series,
 width = 320,
 height = 100,
 showGrid = true,
}: {
 series: { data: number[]; color: string; label: string }[];
 width?: number;
 height?: number;
 showGrid?: boolean;
}) {
 const allVals = series.flatMap((s) => s.data);
 const minV = Math.min(...allVals);
 const maxV = Math.max(...allVals);
 const range = maxV - minV || 1;
 const pad = { top: 8, bottom: 8, left: 8, right: 8 };
 const w = width - pad.left - pad.right;
 const h = height - pad.top - pad.bottom;
 const n = series[0]?.data.length ?? 1;

 const toPath = (data: number[]) =>
 data
 .map((v, i) => {
 const x = pad.left + (i / (n - 1)) * w;
 const y = pad.top + h - ((v - minV) / range) * h;
 return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
 })
 .join("");

 const gridLines = 4;
 return (
 <svg width={width} height={height}>
 {showGrid &&
 Array.from({ length: gridLines }).map((_, i) => {
 const y = pad.top + (i / (gridLines - 1)) * h;
 return (
 <line
 key={i}
 x1={pad.left}
 y1={y}
 x2={pad.left + w}
 y2={y}
 stroke="#1f2937"
 strokeWidth={1}
 />
 );
 })}
 {series.map((s, si) => (
 <path
 key={si}
 d={toPath(s.data)}
 fill="none"
 stroke={s.color}
 strokeWidth={1.5}
 strokeLinejoin="round"
 />
 ))}
 </svg>
 );
}

function PayoffDiagram({
 strategies,
 spot,
 width = 340,
 height = 160,
}: {
 strategies: { label: string; color: string; payoff: (x: number) => number }[];
 spot: number;
 width?: number;
 height?: number;
}) {
 const steps = 80;
 const xMin = spot * 0.88;
 const xMax = spot * 1.12;
 const xRange = xMax - xMin;

 const allPayoffs = strategies.flatMap((st) =>
 Array.from({ length: steps + 1 }, (_, i) => st.payoff(xMin + (i / steps) * xRange))
 );
 const minP = Math.min(...allPayoffs, -spot * 0.06);
 const maxP = Math.max(...allPayoffs, spot * 0.06);
 const pRange = maxP - minP || 1;

 const pad = { top: 10, bottom: 20, left: 40, right: 10 };
 const w = width - pad.left - pad.right;
 const h = height - pad.top - pad.bottom;

 const toX = (x: number) => pad.left + ((x - xMin) / xRange) * w;
 const toY = (p: number) => pad.top + h - ((p - minP) / pRange) * h;
 const zeroY = toY(0);

 return (
 <svg width={width} height={height}>
 <line x1={pad.left} y1={zeroY} x2={pad.left + w} y2={zeroY} stroke="#374151" strokeWidth={1} strokeDasharray="4,3" />
 <line x1={toX(spot)} y1={pad.top} x2={toX(spot)} y2={pad.top + h} stroke="#6b7280" strokeWidth={1} strokeDasharray="2,2" />
 <text x={toX(spot)} y={pad.top + h + 14} textAnchor="middle" fontSize={8} fill="#6b7280">Spot</text>
 {[-0.04, -0.02, 0, 0.02, 0.04].map((pct) => {
 const val = (minP + (maxP - minP) * ((pct - minP / (spot)) / ((maxP - minP) / spot)));
 const label = (pct * 100).toFixed(0) + "%";
 const yPos = toY(spot * pct);
 if (yPos < pad.top || yPos > pad.top + h) return null;
 return (
 <g key={pct}>
 <line x1={pad.left - 3} y1={yPos} x2={pad.left} y2={yPos} stroke="#374151" strokeWidth={1} />
 <text x={pad.left - 4} y={yPos + 3} textAnchor="end" fontSize={7} fill="#6b7280">{label}</text>
 </g>
 );
 })}
 {strategies.map((st, si) => {
 const pts = Array.from({ length: steps + 1 }, (_, i) => {
 const x = xMin + (i / steps) * xRange;
 return `${i === 0 ? "M" : "L"}${toX(x).toFixed(1)},${toY(st.payoff(x)).toFixed(1)}`;
 }).join("");
 return (
 <path key={si} d={pts} fill="none" stroke={st.color} strokeWidth={2} strokeLinejoin="round" />
 );
 })}
 </svg>
 );
}

function BubbleScatter({
 points,
 width = 300,
 height = 180,
}: {
 points: { x: number; y: number; label: string; color: string; size?: number }[];
 width?: number;
 height?: number;
}) {
 const xs = points.map((p) => p.x);
 const ys = points.map((p) => p.y);
 const minX = Math.min(...xs);
 const maxX = Math.max(...xs);
 const minY = Math.min(...ys);
 const maxY = Math.max(...ys);
 const pad = { top: 10, bottom: 24, left: 32, right: 10 };
 const w = width - pad.left - pad.right;
 const h = height - pad.top - pad.bottom;
 const toX = (x: number) => pad.left + ((x - minX) / (maxX - minX || 1)) * w;
 const toY = (y: number) => pad.top + h - ((y - minY) / (maxY - minY || 1)) * h;
 const zeroX = toX(0);
 const zeroY = toY(0);

 return (
 <svg width={width} height={height}>
 <line x1={zeroX} y1={pad.top} x2={zeroX} y2={pad.top + h} stroke="#374151" strokeWidth={1} strokeDasharray="3,2" />
 <line x1={pad.left} y1={zeroY} x2={pad.left + w} y2={zeroY} stroke="#374151" strokeWidth={1} strokeDasharray="3,2" />
 <text x={pad.left - 4} y={pad.top + h + 14} textAnchor="middle" fontSize={7} fill="#6b7280">CA Bal%</text>
 <text x={pad.left + w / 2} y={height - 2} textAnchor="middle" fontSize={7} fill="#6b7280">→ Current Account Balance (%GDP)</text>
 {points.map((p, i) => (
 <g key={i}>
 <circle cx={toX(p.x)} cy={toY(p.y)} r={p.size ?? 5} fill={p.color} opacity={0.75} />
 <text x={toX(p.x)} y={toY(p.y) - 7} textAnchor="middle" fontSize={7} fill="#d1d5db">{p.label}</text>
 </g>
 ))}
 </svg>
 );
}

// ── Helper Components ──────────────────────────────────────────────────────────

function SectionTitle({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
 return (
 <div className="flex items-center gap-3 mb-4">
 <div className="p-2 rounded-lg bg-muted/10">
 </div>
 <div>
 <h2 className="text-base font-semibold text-foreground">{title}</h2>
 {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
 </div>
 </div>
 );
}

function StatChip({ label, value, sub, color = "default" }: { label: string; value: string; sub?: string; color?: "default" | "green" | "red" | "amber" }) {
 const colorMap = {
 default: "bg-secondary text-foreground",
 green: "bg-emerald-500/5 text-emerald-400",
 red: "bg-red-500/5 text-red-400",
 amber: "bg-amber-500/10 text-amber-400",
 };
 return (
 <div className={cn("px-3 py-2 rounded-lg text-center", colorMap[color])}>
 <p className="text-xs text-muted-foreground">{label}</p>
 <p className="font-semibold text-sm">{value}</p>
 {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
 </div>
 );
}

// ── Section 1: FX Exposure Monitor ────────────────────────────────────────────

function FXExposureMonitor() {
 const [exposures, setExposures] = useState<CurrencyExposure[]>(() => generateExposures());
 const [showHedgeSlider, setShowHedgeSlider] = useState<string | null>(null);
 const USD_RATE = 5.33;

 const totalExposure = exposures.reduce((a, b) => a + b.exposure, 0);
 const totalHedged = exposures.reduce((a, b) => a + (b.hedged ? (b.exposure * b.hedgeRatio) / 100 : 0), 0);
 const netUnhedged = totalExposure - totalHedged;
 const totalOnePctImpact = exposures.reduce(
 (a, b) => a + (b.hedged ? (b.onePercentImpact * (100 - b.hedgeRatio)) / 100 : b.onePercentImpact),
 0
 );

 const toggleHedge = (currency: string) => {
 setExposures((prev) =>
 prev.map((e) => (e.currency === currency ? { ...e, hedged: !e.hedged } : e))
 );
 };

 const updateHedgeRatio = (currency: string, ratio: number) => {
 setExposures((prev) =>
 prev.map((e) => (e.currency === currency ? { ...e, hedgeRatio: ratio } : e))
 );
 };

 // Carrying cost vs USD
 const costOfHedge = (e: CurrencyExposure) => {
 const fwdPts = (e.interestRate - USD_RATE) / 100;
 return fwdPts * e.exposure * (e.hedgeRatio / 100);
 };

 return (
 <div className="space-y-4">
 <SectionTitle icon={Globe} title="FX Exposure Monitor" subtitle="Portfolio currency exposures vs USD — hedged and unhedged positions" />

 {/* Summary chips */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 <StatChip label="Total FX Exposure" value={`$${(totalExposure / 1e6).toFixed(2)}M`} />
 <StatChip label="Hedged Value" value={`$${(totalHedged / 1e6).toFixed(2)}M`} color="green" />
 <StatChip label="Net Unhedged" value={`$${(netUnhedged / 1e6).toFixed(2)}M`} color={netUnhedged > totalExposure * 0.5 ? "amber" : "default"} />
 <StatChip label="1% FX Move Impact" value={`-$${totalOnePctImpact.toLocaleString()}`} color="red" />
 </div>

 {/* Exposure table */}
 <Card className="bg-card border-border">
 <CardContent className="p-0">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border text-muted-foreground text-xs">
 <th className="text-left py-3 px-4">Currency</th>
 <th className="text-right py-3 px-4">Exposure (USD)</th>
 <th className="text-right py-3 px-4">% Portfolio</th>
 <th className="text-center py-3 px-4">Hedged</th>
 <th className="text-right py-3 px-4">Ratio</th>
 <th className="text-right py-3 px-4">Net Exposure</th>
 <th className="text-right py-3 px-4">1% Impact</th>
 <th className="text-right py-3 px-4">Hedge Cost/yr</th>
 </tr>
 </thead>
 <tbody>
 {exposures.map((e) => {
 const netExp = e.hedged ? e.exposure * (1 - e.hedgeRatio / 100) : e.exposure;
 const hcost = e.hedged ? costOfHedge(e) : 0;
 const isExpanded = showHedgeSlider === e.currency;
 return (
 <>
 <motion.tr
 key={e.currency}
 className="border-b border-border/20 hover:bg-secondary/30 cursor-pointer transition-colors"
 onClick={() => setShowHedgeSlider(isExpanded ? null : e.currency)}
 layout
 >
 <td className="py-3 px-4">
 <span className="flex items-center gap-2 font-medium">
 <span className="text-base">{e.flag}</span>
 <span>{e.currency}</span>
 </span>
 </td>
 <td className="py-3 px-4 text-right font-mono">${e.exposure.toLocaleString()}</td>
 <td className="py-3 px-4 text-right">
 <div className="flex items-center justify-end gap-2">
 <div className="w-16 bg-secondary rounded-full h-1.5">
 <div
 className="bg-primary h-1.5 rounded-full"
 style={{ width: `${Math.min(e.pctPortfolio / 20 * 100, 100)}%` }}
 />
 </div>
 <span>{e.pctPortfolio}%</span>
 </div>
 </td>
 <td className="py-3 px-4 text-center" onClick={(ev) => { ev.stopPropagation(); toggleHedge(e.currency); }}>
 <Switch checked={e.hedged} onCheckedChange={() => toggleHedge(e.currency)} />
 </td>
 <td className="py-3 px-4 text-right">
 {e.hedged ? (
 <Badge variant="secondary" className="text-xs text-muted-foreground">{e.hedgeRatio}%</Badge>
 ) : (
 <span className="text-muted-foreground text-xs">—</span>
 )}
 </td>
 <td className="py-3 px-4 text-right font-mono">
 <span className={netExp > e.exposure * 0.5 ? "text-amber-400" : "text-emerald-400"}>
 ${Math.round(netExp).toLocaleString()}
 </span>
 </td>
 <td className="py-3 px-4 text-right font-mono text-red-400">
 -${Math.round(e.hedged ? (e.onePercentImpact * (100 - e.hedgeRatio)) / 100 : e.onePercentImpact).toLocaleString()}
 </td>
 <td className="py-3 px-4 text-right font-mono text-xs text-muted-foreground">
 {e.hedged ? (
 <span className={hcost < 0 ? "text-emerald-400" : "text-red-400"}>
 {hcost < 0 ? "+" : ""}${Math.abs(Math.round(hcost)).toLocaleString()}
 </span>
 ) : (
 <span className="text-muted-foreground">—</span>
 )}
 </td>
 </motion.tr>
 <AnimatePresence>
 {isExpanded && (
 <motion.tr
 key={`${e.currency}-expanded`}
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 >
 <td colSpan={8} className="px-6 py-3 bg-secondary/20">
 <div className="flex items-center gap-4">
 <span className="text-xs text-muted-foreground w-24">Hedge Ratio:</span>
 <div className="flex-1 max-w-xs">
 <Slider
 value={[e.hedgeRatio]}
 min={0}
 max={100}
 step={5}
 onValueChange={([v]) => updateHedgeRatio(e.currency, v)}
 />
 </div>
 <span className="text-xs font-mono text-foreground w-10">{e.hedgeRatio}%</span>
 <span className="text-xs text-muted-foreground">
 IR Diff: {(e.interestRate - USD_RATE).toFixed(2)}% | Spot: {e.spotRate.toFixed(4)}
 </span>
 </div>
 </td>
 </motion.tr>
 )}
 </AnimatePresence>
 </>
 );
 })}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>

 {/* Forward points explanation */}
 <Card className="bg-card border-border">
 <CardContent className="p-4">
 <p className="text-xs text-muted-foreground flex items-start gap-2">
 <span>
 <strong className="text-foreground">Hedging Cost Formula:</strong> Forward Points = (Foreign IR − USD IR) × Notional. Positive when foreign rates &gt; USD rate (you receive carry while hedging). Negative means hedging costs you the interest differential.
 </span>
 </p>
 </CardContent>
 </Card>
 </div>
 );
}

// ── Section 2: Hedging Strategy Builder ───────────────────────────────────────

type HedgeType = "none" | "static" | "dynamic" | "overlay";
type InstrumentType = "forwards" | "options" | "swaps";

function HedgingStrategyBuilder() {
 const [hedgeType, setHedgeType] = useState<HedgeType>("static");
 const [instrument, setInstrument] = useState<InstrumentType>("forwards");
 const [hedgeRatio, setHedgeRatio] = useState(75);
 const [notional, setNotional] = useState(1_000_000);
 const [fxVolatility, setFxVolatility] = useState(8.5);
 const [tenor, setTenor] = useState(12);

 const USD_RATE = 5.33;
 const EUR_RATE = 3.75;
 const irDiff = EUR_RATE - USD_RATE;
 const forwardPoints = irDiff / 100;
 const forwardCost = forwardPoints * notional * (hedgeRatio / 100) * (tenor / 12);
 const optionPremium = (fxVolatility / 100) * notional * (hedgeRatio / 100) * 0.35; // rough ATM vol-based
 const swapCost = forwardCost * 0.85;

 const costMap: Record<InstrumentType, number> = {
 forwards: forwardCost,
 options: optionPremium,
 swaps: swapCost,
 };

 const cost = costMap[instrument];
 const breakeven = cost / (notional * (hedgeRatio / 100)) * 100;

 const hedgeTypeDescriptions: Record<HedgeType, string> = {
 none: "No hedging — fully exposed to FX movements. Suitable when FX exposure is small or when you want to benefit from favorable moves.",
 static: "Fixed hedge ratio maintained throughout the period. Simple to implement, predictable cost, but inflexible to changing exposures.",
 dynamic: "Hedge ratio adjusted based on market signals, rolling delta hedging. Higher cost but better risk-adjusted outcomes.",
 overlay: "Tactical overlay on top of strategic hedges — uses options to enhance returns while maintaining downside protection.",
 };

 const instrumentDescriptions: Record<InstrumentType, string> = {
 forwards: "Lock in today's forward rate. Zero premium cost. Eliminates upside AND downside. Most common corporate hedging tool.",
 options: "Buy right (not obligation) at strike. Pay premium upfront. Protects downside while retaining upside. Best for uncertain exposure.",
 swaps: "Exchange cash flows in different currencies over the tenor. Ideal for multi-year exposures and balance sheet hedging.",
 };

 return (
 <div className="space-y-4">
 <SectionTitle icon={Calculator} title="Hedging Strategy Builder" subtitle="Configure FX hedge strategy, instrument selection, and cost-benefit analysis" />

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 {/* Configuration panel */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium">Strategy Configuration</CardTitle>
 </CardHeader>
 <CardContent className="space-y-5">
 {/* Hedge Type */}
 <div>
 <p className="text-xs text-muted-foreground mb-2">Hedge Program Type</p>
 <div className="grid grid-cols-2 gap-2">
 {(["none", "static", "dynamic", "overlay"] as HedgeType[]).map((t) => (
 <Button
 key={t}
 variant={hedgeType === t ? "default" : "outline"}
 size="sm"
 onClick={() => setHedgeType(t)}
 className="capitalize text-xs text-muted-foreground"
 >
 {t === "overlay" ? "Overlay Program" : t.charAt(0).toUpperCase() + t.slice(1) + " Hedge"}
 </Button>
 ))}
 </div>
 <p className="text-xs text-muted-foreground mt-2 italic">{hedgeTypeDescriptions[hedgeType]}</p>
 </div>

 {/* Instrument */}
 <div>
 <p className="text-xs text-muted-foreground mb-2">Hedging Instrument</p>
 <div className="grid grid-cols-3 gap-2">
 {(["forwards", "options", "swaps"] as InstrumentType[]).map((i) => (
 <Button
 key={i}
 variant={instrument === i ? "default" : "outline"}
 size="sm"
 onClick={() => setInstrument(i)}
 className="capitalize text-xs text-muted-foreground"
 >
 {i === "forwards" ? "Forwards" : i === "options" ? "Options" : "CCS"}
 </Button>
 ))}
 </div>
 <p className="text-xs text-muted-foreground mt-2 italic">{instrumentDescriptions[instrument]}</p>
 </div>

 {/* Hedge Ratio */}
 <div>
 <div className="flex justify-between mb-2">
 <p className="text-xs text-muted-foreground">Hedge Ratio</p>
 <span className="text-xs font-mono text-foreground">{hedgeRatio}%</span>
 </div>
 <Slider
 value={[hedgeRatio]}
 min={0}
 max={100}
 step={5}
 onValueChange={([v]) => setHedgeRatio(v)}
 />
 <div className="flex justify-between mt-1">
 <span className="text-xs text-muted-foreground">Unhedged (0%)</span>
 <span className="text-xs text-muted-foreground">Fully Hedged (100%)</span>
 </div>
 </div>

 {/* Tenor */}
 <div>
 <div className="flex justify-between mb-2">
 <p className="text-xs text-muted-foreground">Tenor (months)</p>
 <span className="text-xs font-mono text-foreground">{tenor}M</span>
 </div>
 <Slider
 value={[tenor]}
 min={1}
 max={24}
 step={1}
 onValueChange={([v]) => setTenor(v)}
 />
 </div>

 {/* FX Volatility */}
 <div>
 <div className="flex justify-between mb-2">
 <p className="text-xs text-muted-foreground">Assumed FX Volatility</p>
 <span className="text-xs font-mono text-foreground">{fxVolatility}%</span>
 </div>
 <Slider
 value={[fxVolatility]}
 min={2}
 max={25}
 step={0.5}
 onValueChange={([v]) => setFxVolatility(v)}
 />
 </div>
 </CardContent>
 </Card>

 {/* Cost analysis */}
 <div className="space-y-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium">Cost of Hedging Calculator</CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 <div className="grid grid-cols-2 gap-3">
 <StatChip
 label="Notional Hedged"
 value={`$${((notional * hedgeRatio) / 100 / 1000).toFixed(0)}K`}
 color="default"
 />
 <StatChip
 label="IR Differential"
 value={`${irDiff.toFixed(2)}%`}
 color={irDiff > 0 ? "green" : "red"}
 sub="EUR - USD"
 />
 <StatChip
 label="Forward Points"
 value={`${(forwardPoints * 100).toFixed(2)}%`}
 color={forwardPoints < 0 ? "red" : "green"}
 sub={`${tenor}M tenor`}
 />
 <StatChip
 label="Hedge Cost"
 value={`$${Math.abs(Math.round(cost)).toLocaleString()}`}
 color={cost < 0 ? "green" : "amber"}
 sub={cost < 0 ? "You earn carry" : "You pay carry"}
 />
 </div>
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium">Breakeven Analysis</CardTitle>
 </CardHeader>
 <CardContent>
 <p className="text-xs text-muted-foreground mb-3">
 FX must move by <strong className="text-foreground">{Math.abs(breakeven).toFixed(2)}%</strong> against you to justify the hedging cost.
 </p>
 <div className="space-y-2">
 {(["forwards", "options", "swaps"] as InstrumentType[]).map((inst) => {
 const c = costMap[inst];
 const be = (c / (notional * (hedgeRatio / 100))) * 100;
 return (
 <div key={inst} className="flex items-center gap-3">
 <span className="text-xs w-20 capitalize text-muted-foreground">
 {inst === "forwards" ? "Forwards" : inst === "options" ? "Options" : "Swaps"}
 </span>
 <div className="flex-1 bg-secondary rounded-full h-2">
 <div
 className={cn(
 "h-2 rounded-full",
 inst === "options" ? "bg-primary" : inst === "forwards" ? "bg-primary" : "bg-primary"
 )}
 style={{ width: `${Math.min(Math.abs(be) / 5 * 100, 100)}%` }}
 />
 </div>
 <span className="text-xs text-muted-foreground font-mono w-16 text-right">
 {Math.abs(be).toFixed(2)}% FX
 </span>
 </div>
 );
 })}
 </div>
 <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1">
 At current {fxVolatility}% FX vol, expected annual move ≈ {(fxVolatility * Math.sqrt(tenor / 12)).toFixed(1)}% (1 std dev over {tenor}M). Cost is {Math.abs(breakeven) < fxVolatility * Math.sqrt(tenor / 12) / 2 ? "justified" : "marginal"}.
 </p>
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium">Cost Comparison</CardTitle>
 </CardHeader>
 <CardContent>
 <BarChart
 data={Object.entries(costMap).map(([k, v]) => ({ label: k === "forwards" ? "Fwd" : k === "options" ? "Opts" : "CCS", value: -Math.abs(v) / 1000 }))}
 width={260}
 height={100}
 color="#ef4444"
 />
 <p className="text-xs text-muted-foreground text-center mt-1">Cost in $000s (negative = expense)</p>
 </CardContent>
 </Card>
 </div>
 </div>
 </div>
 );
}

// ── Section 3: Carry Trade Analyzer ───────────────────────────────────────────

function CarryTradeAnalyzer() {
 const carryPairs = useMemo(() => generateCarryPairs(), []);
 const [selectedPair, setSelectedPair] = useState("AUD/JPY");

 resetSeed();
 const generateAUDJPYHistory = () => {
 const years = ["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024"];
 return years.map((yr) => {
 const spot = -8 + rand() * 20;
 const carry = 2 + rand() * 4;
 return { year: yr, spot, carry, total: spot + carry };
 });
 };
 const audJpyHistory = useMemo(() => generateAUDJPYHistory(), []);

 const riskColors = {
 low: "text-emerald-400",
 medium: "text-yellow-400",
 high: "text-orange-400",
 crash: "text-red-400",
 };
 const riskBg = {
 low: "bg-emerald-500/5",
 medium: "bg-yellow-500/10",
 high: "bg-orange-500/10",
 crash: "bg-red-500/5",
 };

 const selected = carryPairs.find((p) => p.pair === selectedPair);

 const positionSize = (equity: number, stopPct: number) =>
 Math.round((equity * 0.02) / (stopPct / 100));

 return (
 <div className="space-y-4">
 <SectionTitle icon={TrendingUp} title="Carry Trade Analyzer" subtitle="Yield differentials, carry return decomposition, and crash risk monitoring" />

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 {/* Carry table */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium">Carry Rankings — 8 Pairs by Yield Differential</CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border text-muted-foreground">
 <th className="text-left py-2 px-3">Pair</th>
 <th className="text-right py-2 px-3">Carry %</th>
 <th className="text-right py-2 px-3">Spot Rtn</th>
 <th className="text-right py-2 px-3">Total</th>
 <th className="text-right py-2 px-3">Sharpe</th>
 <th className="text-center py-2 px-3">Risk</th>
 </tr>
 </thead>
 <tbody>
 {carryPairs.map((p) => (
 <tr
 key={p.pair}
 className={cn(
 "border-b border-border/20 cursor-pointer transition-colors",
 selectedPair === p.pair ? "bg-muted/10" : "hover:bg-secondary/30"
 )}
 onClick={() => setSelectedPair(p.pair)}
 >
 <td className="py-2 px-3 font-medium">{p.pair}</td>
 <td className="py-2 px-3 text-right text-emerald-400">+{p.carryYield.toFixed(2)}%</td>
 <td className={cn("py-2 px-3 text-right", p.spotReturn >= 0 ? "text-emerald-400" : "text-red-400")}>
 {p.spotReturn >= 0 ? "+" : ""}{p.spotReturn.toFixed(2)}%
 </td>
 <td className={cn("py-2 px-3 text-right font-medium", p.totalReturn >= 0 ? "text-emerald-400" : "text-red-400")}>
 {p.totalReturn >= 0 ? "+" : ""}{p.totalReturn.toFixed(2)}%
 </td>
 <td className={cn("py-2 px-3 text-right", riskColors[p.carryRisk])}>
 {p.rollingSharpe.toFixed(2)}
 </td>
 <td className="py-2 px-3 text-center">
 <span className={cn("px-1.5 py-0.5 rounded text-xs text-muted-foreground ", riskBg[p.carryRisk], riskColors[p.carryRisk])}>
 {p.carryRisk === "crash" ? "⚠ CRASH" : p.carryRisk}
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </CardContent>
 </Card>

 {/* AUD/JPY decomposition + selected detail */}
 <div className="space-y-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium">AUD/JPY Return Decomposition (2015–2024)</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="mb-2">
 <div className="flex gap-4 text-xs text-muted-foreground mb-2">
 <span className="flex items-center gap-1"><span className="inline-block w-3 h-1 bg-primary rounded" />Total Return</span>
 <span className="flex items-center gap-1"><span className="inline-block w-3 h-1 bg-emerald-400 rounded" />Carry</span>
 <span className="flex items-center gap-1"><span className="inline-block w-3 h-1 bg-primary rounded" />Spot</span>
 </div>
 </div>
 <LineChart
 series={[
 { data: audJpyHistory.map((d) => d.total), color: "#6366f1", label: "Total" },
 { data: audJpyHistory.map((d) => d.carry), color: "#10b981", label: "Carry" },
 { data: audJpyHistory.map((d) => d.spot), color: "#60a5fa", label: "Spot" },
 ]}
 width={320}
 height={110}
 />
 <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
 {audJpyHistory.map((d) => (
 <div key={d.year} className="flex flex-col items-center text-center shrink-0">
 <span className="text-xs text-muted-foreground">{d.year}</span>
 <span className={cn("text-xs font-mono", d.total >= 0 ? "text-emerald-400" : "text-red-400")}>
 {d.total >= 0 ? "+" : ""}{d.total.toFixed(1)}%
 </span>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 {selected && (
 <Card className="bg-card border-border">
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium">{selected.pair} — Risk Management</CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 {selected.rollingSharpe < 0.5 && (
 <div className="flex items-start gap-2 p-2 rounded bg-red-500/5 text-red-400 text-xs">
 <span>3M rolling Sharpe {selected.rollingSharpe.toFixed(2)} — carry crash risk elevated. Reduce position by 50-75%.</span>
 </div>
 )}
 <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
 <div className="p-2 rounded bg-secondary/50">
 <p className="text-muted-foreground">Recommended Stop-Loss</p>
 <p className="font-medium text-foreground">1.5% — 2.0% of notional</p>
 </div>
 <div className="p-2 rounded bg-secondary/50">
 <p className="text-muted-foreground">Position Size ($100K equity, 1.5% stop)</p>
 <p className="font-medium text-foreground">${positionSize(100_000, 1.5).toLocaleString()}</p>
 </div>
 <div className="p-2 rounded bg-secondary/50">
 <p className="text-muted-foreground">Equity Correlation (S&P 500)</p>
 <p className="font-medium text-amber-400">+0.62 — Risk-on asset</p>
 </div>
 <div className="p-2 rounded bg-secondary/50">
 <p className="text-muted-foreground">VIX Correlation</p>
 <p className="font-medium text-red-400">-0.74 — Unwinds in spikes</p>
 </div>
 </div>
 </CardContent>
 </Card>
 )}
 </div>
 </div>
 </div>
 );
}

// ── Section 4: FX Valuation Models ────────────────────────────────────────────

function FXValuationModels() {
 const pppData = useMemo(() => generatePPPData(), []);
 const reerData = useMemo(() => generateREER(), []);
 const [showMeanRev, setShowMeanRev] = useState(false);

 // IRP calculation
 const [spotRate, setSpotRate] = useState(1.085);
 const [domesticRate, setDomesticRate] = useState(5.33);
 const [foreignRate, setForeignRate] = useState(3.75);
 const [tenorMonths, setTenorMonths] = useState(12);
 const forwardRate = spotRate * Math.pow((1 + domesticRate / 100) / (1 + foreignRate / 100), tenorMonths / 12);

 const signalColors = {
 strong_sell: "text-red-400",
 sell: "text-orange-400",
 neutral: "text-muted-foreground",
 buy: "text-emerald-400",
 strong_buy: "text-green-400",
 };
 const signalBg = {
 strong_sell: "bg-red-500/5",
 sell: "bg-orange-500/10",
 neutral: "bg-secondary/50",
 buy: "bg-emerald-500/5",
 strong_buy: "bg-green-500/10",
 };
 const signalLabel = {
 strong_sell: "Strong Sell",
 sell: "Sell",
 neutral: "Neutral",
 buy: "Buy",
 strong_buy: "Strong Buy",
 };

 const caBalanceData = [
 { x: -7.5, y: -28, label: "JPY", color: "#60a5fa" },
 { x: -3.2, y: -14, label: "USD", color: "#10b981" },
 { x: 3.1, y: 8, label: "EUR", color: "#a78bfa" },
 { x: 1.8, y: 15, label: "CHF", color: "#f59e0b" },
 { x: -2.5, y: -8, label: "GBP", color: "#f97316" },
 { x: 2.4, y: 12, label: "CNY", color: "#ef4444" },
 { x: 1.2, y: 5, label: "SGD", color: "#06b6d4" },
 { x: -1.9, y: -4, label: "AUD", color: "#84cc16" },
 ];

 return (
 <div className="space-y-4">
 <SectionTitle icon={BarChart2} title="FX Valuation Models" subtitle="PPP, REER, IRP, and mean-reversion trade signals" />

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 {/* Big Mac Index */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium">Big Mac Index — PPP Deviation vs USD</CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border text-muted-foreground">
 <th className="text-left py-2 px-3">Country</th>
 <th className="text-right py-2 px-3">Big Mac (local)</th>
 <th className="text-right py-2 px-3">Implied Rate</th>
 <th className="text-right py-2 px-3">Actual Rate</th>
 <th className="text-right py-2 px-3">Over/Under %</th>
 </tr>
 </thead>
 <tbody>
 {pppData.map((d) => (
 <tr key={d.country} className="border-b border-border/20 hover:bg-secondary/30">
 <td className="py-2 px-3 font-medium">{d.country} <span className="text-muted-foreground">({d.currency})</span></td>
 <td className="py-2 px-3 text-right font-mono">{d.bigMacPrice}</td>
 <td className="py-2 px-3 text-right font-mono">{d.impliedRate.toFixed(4)}</td>
 <td className="py-2 px-3 text-right font-mono">{d.actualRate.toFixed(4)}</td>
 <td className={cn(
 "py-2 px-3 text-right font-medium font-mono",
 d.deviation > 5 ? "text-red-400" : d.deviation < -5 ? "text-emerald-400" : "text-muted-foreground"
 )}>
 {d.deviation > 0 ? "+" : ""}{d.deviation}%
 <span className="ml-1 text-muted-foreground font-normal">{d.deviation > 5 ? "Over" : d.deviation < -5 ? "Under" : "Fair"}</span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 <p className="text-xs text-muted-foreground p-3 border-t border-border">
 Positive = overvalued vs USD (currency expensive relative to purchasing power). Based on $4.11 USD Big Mac price.
 </p>
 </CardContent>
 </Card>

 {/* REER Z-Scores */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-3 flex-row items-center justify-between">
 <CardTitle className="text-sm font-medium">REER 10-Year Z-Score + Mean Reversion Signals</CardTitle>
 <Button variant="outline" size="sm" className="text-xs text-muted-foreground h-7" onClick={() => setShowMeanRev(!showMeanRev)}>
 {showMeanRev ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
 Signals
 </Button>
 </CardHeader>
 <CardContent className="space-y-2">
 {reerData.map((r) => (
 <div key={r.currency} className="flex items-center gap-3">
 <span className="text-xs text-muted-foreground font-medium w-8">{r.currency}</span>
 <div className="flex-1 relative h-5">
 <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-secondary rounded-full" />
 <div
 className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 border-background"
 style={{
 left: `calc(${Math.min(Math.max((r.zScore + 3.5) / 7 * 100, 2), 98)}% - 6px)`,
 backgroundColor:
 r.zScore > 1.5 ? "#ef4444" : r.zScore < -1.5 ? "#10b981" : "#6366f1",
 }}
 />
 </div>
 <div className="flex items-center gap-2 w-48">
 <span className={cn("text-xs font-mono", r.zScore > 0 ? "text-red-400" : "text-emerald-400")}>
 z={r.zScore > 0 ? "+" : ""}{r.zScore.toFixed(2)}
 </span>
 <span className={cn("text-xs text-muted-foreground px-1.5 rounded", signalBg[r.signal], signalColors[r.signal])}>
 {signalLabel[r.signal]}
 </span>
 </div>
 </div>
 ))}
 <div className="flex justify-between text-xs text-muted-foreground mt-1">
 <span>-3.5σ (deeply cheap)</span>
 <span>0 (fair)</span>
 <span>+3.5σ (deeply rich)</span>
 </div>
 <AnimatePresence>
 {showMeanRev && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: "auto", opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 className="overflow-hidden"
 >
 <div className="pt-3 border-t border-border mt-3 space-y-2">
 <p className="text-xs text-muted-foreground font-medium">Mean Reversion Trade Ideas:</p>
 {reerData.filter((r) => Math.abs(r.zScore) > 1.5).map((r) => (
 <div key={r.currency} className={cn("p-2 rounded text-xs text-muted-foreground", signalBg[r.signal])}>
 <span className={cn("font-medium", signalColors[r.signal])}>{r.currency}</span>
 <span className="text-muted-foreground ml-2">
 z={r.zScore.toFixed(2)} — {r.zScore > 1.5 ? `Short ${r.currency}/USD — REER ${((r.currentREER / r.tenYrAvg - 1) * 100).toFixed(1)}% above LTA. Target z=0 implies ${((r.tenYrAvg / r.currentREER - 1) * 100).toFixed(1)}% depreciation.` : `Long ${r.currency}/USD — REER ${((1 - r.currentREER / r.tenYrAvg) * 100).toFixed(1)}% below LTA. Target z=0 implies ${((r.tenYrAvg / r.currentREER - 1) * 100).toFixed(1)}% appreciation.`}
 </span>
 </div>
 ))}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </CardContent>
 </Card>

 {/* IRP Calculator */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium">Interest Rate Parity — Forward Rate Calculator</CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
 <div>
 <p className="text-muted-foreground mb-1">Spot Rate (EUR/USD)</p>
 <Slider value={[spotRate]} min={0.9} max={1.25} step={0.001} onValueChange={([v]) => setSpotRate(v)} />
 <p className="font-mono text-foreground mt-1">{spotRate.toFixed(4)}</p>
 </div>
 <div>
 <p className="text-muted-foreground mb-1">Tenor (months)</p>
 <Slider value={[tenorMonths]} min={1} max={24} step={1} onValueChange={([v]) => setTenorMonths(v)} />
 <p className="font-mono text-foreground mt-1">{tenorMonths}M</p>
 </div>
 <div>
 <p className="text-muted-foreground mb-1">USD Interest Rate (%)</p>
 <Slider value={[domesticRate]} min={0} max={8} step={0.25} onValueChange={([v]) => setDomesticRate(v)} />
 <p className="font-mono text-foreground mt-1">{domesticRate.toFixed(2)}%</p>
 </div>
 <div>
 <p className="text-muted-foreground mb-1">EUR Interest Rate (%)</p>
 <Slider value={[foreignRate]} min={0} max={8} step={0.25} onValueChange={([v]) => setForeignRate(v)} />
 <p className="font-mono text-foreground mt-1">{foreignRate.toFixed(2)}%</p>
 </div>
 </div>
 <div className="p-3 rounded-lg bg-muted/5 border border-border">
 <p className="text-xs text-muted-foreground">IRP Forward Rate Formula: F = S × (1 + r_d)^t / (1 + r_f)^t</p>
 <p className="text-lg font-semibold font-mono text-foreground mt-1">{forwardRate.toFixed(5)}</p>
 <p className="text-xs text-muted-foreground">
 {forwardRate > spotRate ? "EUR at forward discount" : "EUR at forward premium"} — {((forwardRate / spotRate - 1) * 100).toFixed(3)}% vs spot
 </p>
 </div>
 </CardContent>
 </Card>

 {/* CA Balance Scatter */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium">Current Account Balance vs REER Deviation</CardTitle>
 </CardHeader>
 <CardContent>
 <BubbleScatter points={caBalanceData} width={320} height={200} />
 <div className="grid grid-cols-4 gap-1 mt-2">
 {caBalanceData.map((p) => (
 <div key={p.label} className="flex items-center gap-1 text-xs text-muted-foreground">
 <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
 <span className="text-muted-foreground">{p.label}</span>
 </div>
 ))}
 </div>
 <p className="text-xs text-muted-foreground mt-2">
 Positive CA surplus + undervalued REER = strongest appreciation signal. X-axis = CA balance % GDP; Y-axis = REER % deviation.
 </p>
 </CardContent>
 </Card>
 </div>
 </div>
 );
}

// ── Section 5: Options-Based FX Hedging ───────────────────────────────────────

function OptionsFXHedging() {
 const spot = 1.085;
 const [strikeOffset, setStrikeOffset] = useState(2);
 const premium = 0.0148; // ATM option premium
 const putStrike = spot * (1 - strikeOffset / 100);
 const callStrike = spot * (1 + strikeOffset / 100);
 const lowerPutStrike = spot * (1 - (strikeOffset + 1.5) / 100);
 const barrierKI = spot * 0.96;
 const barrierKO = spot * 0.98;

 // Strategy payoffs
 const riskReversal = (S: number) => {
 const longPut = Math.max(putStrike - S, 0);
 const shortCall = -Math.max(S - callStrike, 0);
 return (longPut + shortCall) / spot;
 };
 const seagull = (S: number) => {
 const longPut = Math.max(putStrike - S, 0);
 const shortLowerPut = -Math.max(lowerPutStrike - S, 0);
 const shortCall = -Math.max(S - callStrike, 0);
 return (longPut + shortLowerPut + shortCall) / spot;
 };
 const knockIn = (S: number) => {
 if (S > barrierKI) return 0;
 return Math.max(putStrike - S, 0) / spot;
 };
 const knockOut = (S: number) => {
 if (S < barrierKO) return 0;
 return Math.max(putStrike - S, 0) / spot;
 };
 const vanillaForward = (S: number) => (spot - S) / spot;

 const costData = [
 { instrument: "FX Forward", cost: "0.00%", protection: "Full", upside: "None", complexity: "Low" },
 { instrument: "Vanilla Put", cost: "~1.5%", protection: "Below Strike", upside: "Full", complexity: "Low" },
 { instrument: "Risk Reversal", cost: "~0.3%", protection: "Below Put Strike", upside: "Limited", complexity: "Medium" },
 { instrument: "Seagull", cost: "~0.1%", protection: "Between Strikes", upside: "Limited", complexity: "Medium" },
 { instrument: "Knock-In Put", cost: "~0.7%", protection: "If Barrier Breached", upside: "Full", complexity: "High" },
 { instrument: "Knock-Out Put", cost: "~0.9%", protection: "Until Barrier Hit", upside: "Full", complexity: "High" },
 ];

 return (
 <div className="space-y-4">
 <SectionTitle icon={Shield} title="Options-Based FX Hedging" subtitle="Exotic structures for cost-efficient FX downside protection" />

 <div className="grid grid-cols-1 gap-4">
 {/* Strike configuration */}
 <Card className="bg-card border-border">
 <CardContent className="p-4">
 <div className="flex items-center gap-4 flex-wrap">
 <div className="flex-1 min-w-48">
 <p className="text-xs text-muted-foreground mb-1">OTM Strike Offset (±{strikeOffset}% from spot {spot})</p>
 <Slider value={[strikeOffset]} min={1} max={6} step={0.5} onValueChange={([v]) => setStrikeOffset(v)} />
 </div>
 <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
 <StatChip label="Put Strike" value={putStrike.toFixed(4)} />
 <StatChip label="Call Strike" value={callStrike.toFixed(4)} />
 <StatChip label="KI Barrier" value={barrierKI.toFixed(4)} color="amber" />
 </div>
 </div>
 </CardContent>
 </Card>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 {/* Risk Reversal */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-xs font-medium text-foreground">Risk Reversal</CardTitle>
 <p className="text-xs text-muted-foreground">Buy OTM put + Sell OTM call</p>
 </CardHeader>
 <CardContent>
 <PayoffDiagram
 strategies={[
 { label: "Risk Reversal", color: "#6366f1", payoff: riskReversal },
 { label: "Forward", color: "#374151", payoff: vanillaForward },
 ]}
 spot={spot}
 width={220}
 height={140}
 />
 <p className="text-xs text-muted-foreground mt-2">Subsidize put with call sale. Net cost ~0.3%. Caps upside at call strike.</p>
 </CardContent>
 </Card>

 {/* Seagull */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-xs font-medium text-foreground">Seagull Structure</CardTitle>
 <p className="text-xs text-muted-foreground">Put spread + sell OTM call</p>
 </CardHeader>
 <CardContent>
 <PayoffDiagram
 strategies={[
 { label: "Seagull", color: "#60a5fa", payoff: seagull },
 { label: "Forward", color: "#374151", payoff: vanillaForward },
 ]}
 spot={spot}
 width={220}
 height={140}
 />
 <p className="text-xs text-muted-foreground mt-2">Zero-cost structure typical. Protection between two put strikes. Sell call to fund.</p>
 </CardContent>
 </Card>

 {/* Knock-In */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-xs font-medium text-amber-400">Knock-In Put</CardTitle>
 <p className="text-xs text-muted-foreground">Activates only if barrier hit</p>
 </CardHeader>
 <CardContent>
 <PayoffDiagram
 strategies={[
 { label: "KI Put", color: "#f59e0b", payoff: knockIn },
 { label: "Forward", color: "#374151", payoff: vanillaForward },
 ]}
 spot={spot}
 width={220}
 height={140}
 />
 <p className="text-xs text-muted-foreground mt-2">Cheaper than vanilla (~50% premium). Dangerous if spot trades near barrier — gap risk.</p>
 </CardContent>
 </Card>

 {/* Knock-Out */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-xs font-medium text-orange-400">Knock-Out Put</CardTitle>
 <p className="text-xs text-muted-foreground">Deactivates if barrier hit</p>
 </CardHeader>
 <CardContent>
 <PayoffDiagram
 strategies={[
 { label: "KO Put", color: "#f97316", payoff: knockOut },
 { label: "Forward", color: "#374151", payoff: vanillaForward },
 ]}
 spot={spot}
 width={220}
 height={140}
 />
 <p className="text-xs text-muted-foreground mt-2">Protection vanishes if spot rallies through barrier. ~40% cheaper than vanilla put.</p>
 </CardContent>
 </Card>
 </div>

 {/* Cost comparison table */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium">Instrument Cost Comparison</CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border text-muted-foreground">
 <th className="text-left py-2 px-4">Instrument</th>
 <th className="text-center py-2 px-4">Upfront Cost</th>
 <th className="text-center py-2 px-4">Protection</th>
 <th className="text-center py-2 px-4">Upside Participation</th>
 <th className="text-center py-2 px-4">Complexity</th>
 </tr>
 </thead>
 <tbody>
 {costData.map((row, i) => (
 <tr key={i} className="border-b border-border/20 hover:bg-secondary/30">
 <td className="py-2 px-4 font-medium">{row.instrument}</td>
 <td className="py-2 px-4 text-center font-mono text-amber-400">{row.cost}</td>
 <td className="py-2 px-4 text-center text-muted-foreground">{row.protection}</td>
 <td className={cn("py-2 px-4 text-center", row.upside === "Full" ? "text-emerald-400" : row.upside === "None" ? "text-red-400" : "text-amber-400")}>
 {row.upside}
 </td>
 <td className={cn("py-2 px-4 text-center", row.complexity === "High" ? "text-red-400" : row.complexity === "Medium" ? "text-amber-400" : "text-emerald-400")}>
 {row.complexity}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </CardContent>
 </Card>
 </div>
 </div>
 );
}

// ── Section 6: Cross-Currency Swap Analytics ──────────────────────────────────

function CrossCurrencySwapAnalytics() {
 const cipData = useMemo(() => generateCIPData(), []);

 resetSeed();
 // Generate historical CIP deviation series
 const generateCIPSeries = (baseOffset: number, volatility: number) => {
 const pts: number[] = [baseOffset];
 for (let i = 1; i < 48; i++) {
 pts.push(pts[i - 1] + (rand() - 0.5) * volatility * 2 - (pts[i - 1] - baseOffset) * 0.08);
 }
 return pts;
 };
 const eurUSDBasis = useMemo(() => generateCIPSeries(-17, 8), []);
 const usdJPYBasis = useMemo(() => generateCIPSeries(-23, 12), []);

 // USD Funding stress index
 const generateFundingStress = () => {
 const pts: number[] = [15];
 for (let i = 1; i < 48; i++) {
 pts.push(Math.max(0, pts[i - 1] + (rand() - 0.45) * 8 - (pts[i - 1] - 20) * 0.05));
 }
 return pts;
 };
 const fundingStress = useMemo(() => generateFundingStress(), []);
 const currentStress = fundingStress[fundingStress.length - 1];
 const stressLevel = currentStress > 50 ? "high" : currentStress > 25 ? "medium" : "low";

 const basisPairData = [
 { pair: "EUR/USD", tenor: "3M", basis: -17, ois: 5.33, swapImplied: 5.67, stress: false },
 { pair: "EUR/USD", tenor: "1Y", basis: -21, ois: 5.33, swapImplied: 5.71, stress: false },
 { pair: "USD/JPY", tenor: "3M", basis: -23, ois: 5.33, swapImplied: 5.89, stress: true },
 { pair: "USD/JPY", tenor: "1Y", basis: -31, ois: 5.33, swapImplied: 5.98, stress: true },
 { pair: "GBP/USD", tenor: "3M", basis: -13, ois: 5.33, swapImplied: 5.51, stress: false },
 { pair: "AUD/USD", tenor: "3M", basis: -18, ois: 5.33, swapImplied: 5.71, stress: false },
 ];

 return (
 <div className="space-y-4">
 <SectionTitle icon={Activity} title="Cross-Currency Swap Analytics" subtitle="CCS basis spreads, USD funding stress, and covered interest parity violations" />

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 {/* Basis spread table */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium">Cross-Currency Basis Spread (bps)</CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border text-muted-foreground">
 <th className="text-left py-2 px-3">Pair</th>
 <th className="text-center py-2 px-3">Tenor</th>
 <th className="text-right py-2 px-3">Basis (bps)</th>
 <th className="text-right py-2 px-3">OIS Rate</th>
 <th className="text-right py-2 px-3">Swap-Implied USD</th>
 <th className="text-center py-2 px-3">USD Demand</th>
 </tr>
 </thead>
 <tbody>
 {basisPairData.map((row, i) => (
 <tr key={i} className="border-b border-border/20 hover:bg-secondary/30">
 <td className="py-2 px-3 font-medium">{row.pair}</td>
 <td className="py-2 px-3 text-center text-muted-foreground">{row.tenor}</td>
 <td className={cn("py-2 px-3 text-right font-mono", row.basis < -20 ? "text-red-400" : "text-amber-400")}>
 {row.basis}
 </td>
 <td className="py-2 px-3 text-right font-mono">{row.ois.toFixed(2)}%</td>
 <td className={cn("py-2 px-3 text-right font-mono", row.swapImplied > row.ois + 0.3 ? "text-red-400" : "text-amber-400")}>
 {row.swapImplied.toFixed(2)}%
 </td>
 <td className="py-2 px-3 text-center">
 {row.stress ? (
 <span className="px-1.5 py-0.5 rounded bg-red-500/5 text-red-400 text-xs">High</span>
 ) : (
 <span className="px-1.5 py-0.5 rounded bg-secondary text-muted-foreground text-xs">Normal</span>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 <p className="text-xs text-muted-foreground p-3 border-t border-border">
 CCS basis = excess cost of borrowing USD via FX swap vs OIS. Negative basis means USD scarce. CIP violation = swap-implied rate &gt; OIS rate.
 </p>
 </CardContent>
 </Card>

 {/* CIP Deviation Charts */}
 <div className="space-y-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium">Historical CIP Deviations (48M)</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="mb-2 flex gap-4 text-xs text-muted-foreground">
 <span className="flex items-center gap-1">
 <span className="inline-block w-3 h-1 bg-primary rounded" />EUR/USD basis
 </span>
 <span className="flex items-center gap-1">
 <span className="inline-block w-3 h-1 bg-orange-400 rounded" />USD/JPY basis
 </span>
 </div>
 <LineChart
 series={[
 { data: eurUSDBasis, color: "#60a5fa", label: "EUR/USD" },
 { data: usdJPYBasis, color: "#f97316", label: "USD/JPY" },
 ]}
 width={320}
 height={110}
 />
 <p className="text-xs text-muted-foreground mt-1">Monthly basis spread in bps. 0 = CIP holds (theoretical). Deviations = arbitrage opportunity or funding stress.</p>
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium">USD Funding Stress Index</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="flex items-center gap-3 mb-3">
 <div className={cn(
 "px-3 py-1.5 rounded-lg text-sm font-semibold",
 stressLevel === "high" ? "bg-red-500/5 text-red-400" :
 stressLevel === "medium" ? "bg-amber-500/10 text-amber-400" :
 "bg-emerald-500/5 text-emerald-400"
 )}>
 {stressLevel === "high" ? "High Stress" : stressLevel === "medium" ? "Moderate" : "Low Stress"}
 </div>
 <span className="text-xs text-muted-foreground">Index: {currentStress.toFixed(1)} / 100</span>
 </div>
 <LineChart
 series={[{ data: fundingStress, color: stressLevel === "high" ? "#ef4444" : stressLevel === "medium" ? "#f59e0b" : "#10b981", label: "Stress" }]}
 width={320}
 height={80}
 />
 <p className="text-xs text-muted-foreground mt-1">
 Composite of: FX swap spreads, LIBOR-OIS spread, repo fails, reserve levels. &gt;50 = systemic USD shortage.
 </p>
 </CardContent>
 </Card>
 </div>

 {/* CCS Structure Explainer */}
 <Card className="bg-card border-border lg:col-span-2">
 <CardHeader className="pb-3">
 <CardTitle className="text-sm font-medium">CCS Structure — How Cross-Currency Swaps Work</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="space-y-2">
 <div className="p-3 rounded-lg bg-muted/5 border border-border">
 <p className="text-xs font-medium text-foreground mb-1">Step 1: Initial Exchange</p>
 <p className="text-xs text-muted-foreground">At inception, parties exchange notional in two currencies at the current spot rate. E.g., Party A gives $100M, receives €92M at 1.085.</p>
 </div>
 <div className="p-3 rounded-lg bg-muted/5 border border-border">
 <p className="text-xs font-medium text-foreground mb-1">Step 2: Periodic Payments</p>
 <p className="text-xs text-muted-foreground">Over the life of the swap, parties exchange floating interest payments in their respective currencies. USD SOFR vs EUR €STR + spread.</p>
 </div>
 <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
 <p className="text-xs font-medium text-emerald-400 mb-1">Step 3: Final Re-Exchange</p>
 <p className="text-xs text-muted-foreground">At maturity, notional is re-exchanged at the original spot rate — not market rate. This eliminates FX revaluation risk on principal.</p>
 </div>
 </div>

 <div className="space-y-2">
 <p className="text-xs font-medium text-foreground mb-2">CIP Violation Math</p>
 {cipData.map((row) => (
 <div key={row.pair} className="p-2 rounded bg-secondary/50 text-xs text-muted-foreground">
 <div className="flex justify-between mb-1">
 <span className="font-medium">{row.pair}</span>
 <span className={cn(row.fundingStress ? "text-red-400" : "text-muted-foreground")}>
 {row.fundingStress ? "⚠ Stress" : "Normal"}
 </span>
 </div>
 <div className="grid grid-cols-2 gap-x-3 text-muted-foreground">
 <span>Theory F: {row.theoreticalForward.toFixed(4)}</span>
 <span>Market F: {row.marketForward.toFixed(4)}</span>
 <span className="text-amber-400">Basis: {row.basisPts}bps</span>
 <span className={row.impliedUSDRate > row.fedFundsRate + 0.3 ? "text-red-400" : "text-emerald-400"}>
 Impl. USD: {row.impliedUSDRate.toFixed(2)}%
 </span>
 </div>
 </div>
 ))}
 </div>

 <div className="space-y-2">
 <p className="text-xs font-medium text-foreground mb-2">Key Concepts</p>
 {[
 { term: "Basis Spread", def: "Deviation from CIP. Negative = USD commanding premium in swap market. Persistent since 2008 GFC due to bank balance sheet constraints." },
 { term: "USD Funding Premium", def: "When FX-swap implied USD rate exceeds OIS, it reflects demand for USD liquidity. Spikes during risk-off events (GFC, COVID, 2023 banking stress)." },
 { term: "Hedged Return", def: "Non-US investors buying USD assets earn: yield + basis. Basis being negative reduces hedged return for foreigners buying Treasuries." },
 { term: "Arbitrage Limits", def: "CIP violations persist because arbitrageurs face balance sheet constraints, counterparty risk, and regulatory costs that prevent full arbitrage." },
 ].map((item, i) => (
 <div key={i} className="p-2 rounded bg-secondary/30 text-xs text-muted-foreground">
 <p className="font-medium text-foreground">{item.term}</p>
 <p className="text-muted-foreground mt-0.5">{item.def}</p>
 </div>
 ))}
 </div>
 </div>
 </CardContent>
 </Card>
 </div>
 </div>
 );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function CurrencyOverlayPage() {
 const [activeTab, setActiveTab] = useState("exposure");

 const tabs = [
 { id: "exposure", label: "FX Exposure" },
 { id: "hedging", label: "Hedge Builder" },
 { id: "carry", label: "Carry Trade" },
 { id: "valuation", label: "FX Valuation" },
 { id: "options", label: "Options Hedging" },
 { id: "ccs", label: "CCS Analytics" },
 ];

 return (
 <div className="min-h-screen bg-background text-foreground">
 {/* HERO Header */}
 <div className="border-b border-border border-l-4 border-l-primary bg-card/50 backdrop-blur-sm sticky top-0 z-10">
 <div className="px-6 py-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-md bg-muted/10">
 </div>
 <div>
 <h1 className="text-lg font-semibold">Currency Overlay</h1>
 <p className="text-xs text-muted-foreground">FX Exposure Management & Hedging Strategy Platform</p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <Badge variant="secondary" className="text-xs text-muted-foreground">
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1.5" />
 Live Rates
 </Badge>
 <Button
 variant="outline"
 size="sm"
 className="text-xs text-muted-foreground"
 onClick={() => toast.info("Rates refreshed", { description: "FX data updated to latest market close." })}
 >
 Refresh
 </Button>
 </div>
 </div>
 </div>
 </div>

 {/* Navigation Tabs */}
 <div className="px-6 py-4">
 <Tabs value={activeTab} onValueChange={setActiveTab}>
 <TabsList className="bg-transparent border-b border-border/20 rounded-none p-0 h-auto mb-6">
 {tabs.map((tab) => (
 <TabsTrigger
 key={tab.id}
 value={tab.id}
 className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground"
 >
 <span className="hidden sm:inline">{tab.label}</span>
 </TabsTrigger>
 ))}
 </TabsList>

 <TabsContent value="exposure">
 <AnimatePresence mode="wait">
 {activeTab === "exposure" && (
 <motion.div key="exposure" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
 <FXExposureMonitor />
 </motion.div>
 )}
 </AnimatePresence>
 </TabsContent>
 <TabsContent value="hedging">
 <AnimatePresence mode="wait">
 {activeTab === "hedging" && (
 <motion.div key="hedging" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
 <HedgingStrategyBuilder />
 </motion.div>
 )}
 </AnimatePresence>
 </TabsContent>
 <TabsContent value="carry">
 <AnimatePresence mode="wait">
 {activeTab === "carry" && (
 <motion.div key="carry" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
 <CarryTradeAnalyzer />
 </motion.div>
 )}
 </AnimatePresence>
 </TabsContent>
 <TabsContent value="valuation">
 <AnimatePresence mode="wait">
 {activeTab === "valuation" && (
 <motion.div key="valuation" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
 <FXValuationModels />
 </motion.div>
 )}
 </AnimatePresence>
 </TabsContent>
 <TabsContent value="options">
 <AnimatePresence mode="wait">
 {activeTab === "options" && (
 <motion.div key="options" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
 <OptionsFXHedging />
 </motion.div>
 )}
 </AnimatePresence>
 </TabsContent>
 <TabsContent value="ccs">
 <AnimatePresence mode="wait">
 {activeTab === "ccs" && (
 <motion.div key="ccs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
 <CrossCurrencySwapAnalytics />
 </motion.div>
 )}
 </AnimatePresence>
 </TabsContent>
 </Tabs>
 </div>
 </div>
 );
}
