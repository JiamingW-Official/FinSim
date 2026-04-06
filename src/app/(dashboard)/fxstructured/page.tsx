"use client";

import { useState, useMemo } from "react";
import {
 Globe,
 TrendingUp,
 TrendingDown,
 Shield,
 AlertTriangle,
 BarChart3,
 DollarSign,
 Layers,
 Activity,
 Info,
 ArrowLeftRight,
 Calculator,
 Target,
 Zap,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ──────────────────────────────────────────────────────────────
let s = 871;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};
const resetSeed = () => {
 s = 871;
};

// ── Types ────────────────────────────────────────────────────────────────────

interface PayoffPoint {
 spot: number;
 pnl: number;
}

interface AccumulatorBar {
 day: number;
 fixing: number;
 knocked: boolean;
 accumulated: number;
}

interface TARFCashflow {
 period: number;
 spot: number;
 notional: number;
 pnl: number;
 cumulativeProfit: number;
 redeemed: boolean;
}

interface DCDScenario {
 name: string;
 endSpot: number;
 depositReturn: number;
 fxReturn: number;
 totalReturn: number;
 converted: boolean;
}

interface HedgeStrategy {
 name: string;
 color: string;
 points: PayoffPoint[];
 cost: number;
 description: string;
}

// ── Helper: generate spot path ────────────────────────────────────────────────
function generateSpotPath(seed: number, start: number, steps: number, drift: number, vol: number): number[] {
 s = seed;
 const path: number[] = [start];
 for (let i = 1; i < steps; i++) {
 const r = rand();
 const z = Math.sqrt(-2 * Math.log(Math.max(r, 1e-10))) * Math.cos(2 * Math.PI * rand());
 path.push(path[i - 1] * Math.exp(drift + vol * z));
 }
 return path;
}

// ── Tab 1: FX Options Strategies ─────────────────────────────────────────────

const SPOT = 1.0850; // EUR/USD
const STRIKE_PUT = 1.0650;
const STRIKE_CALL = 1.1050;
const TENOR = 90; // days
const NOTIONAL = 1_000_000;

function computeRiskReversalPayoff(): PayoffPoint[] {
 const points: PayoffPoint[] = [];
 for (let i = 0; i <= 40; i++) {
 const spot = 1.02 + i * 0.005;
 // Long call at 1.1050, short put at 1.0650 (25-delta risk reversal for exporter)
 const callPnl = Math.max(spot - STRIKE_CALL, 0);
 const putPnl = -Math.max(STRIKE_PUT - spot, 0);
 points.push({ spot, pnl: (callPnl + putPnl) * NOTIONAL });
 }
 return points;
}

function computeRangeForwardPayoff(): PayoffPoint[] {
 const points: PayoffPoint[] = [];
 for (let i = 0; i <= 40; i++) {
 const spot = 1.02 + i * 0.005;
 // Sell if below floor 1.06, buy if above cap 1.11, otherwise market
 let effectiveRate: number;
 if (spot < 1.06) effectiveRate = 1.06;
 else if (spot > 1.11) effectiveRate = 1.11;
 else effectiveRate = spot;
 const pnl = (effectiveRate - spot) * NOTIONAL;
 points.push({ spot, pnl });
 }
 return points;
}

function computeParticipatingForwardPayoff(): PayoffPoint[] {
 const points: PayoffPoint[] = [];
 for (let i = 0; i <= 40; i++) {
 const spot = 1.02 + i * 0.005;
 // 50% participation above 1.08 strike, full downside protection at 1.08
 const forward = 1.08;
 const participation = 0.5;
 let pnl: number;
 if (spot > forward) {
 pnl = (forward - spot) * NOTIONAL + participation * (spot - forward) * NOTIONAL;
 } else {
 pnl = (forward - spot) * NOTIONAL;
 }
 points.push({ spot, pnl });
 }
 return points;
}

function MiniPayoffChart({
 points,
 color,
 label,
 height = 100,
}: {
 points: PayoffPoint[];
 color: string;
 label: string;
 height?: number;
}) {
 const width = 240;
 const pad = { t: 8, r: 8, b: 24, l: 48 };
 const innerW = width - pad.l - pad.r;
 const innerH = height - pad.t - pad.b;

 const minSpot = Math.min(...points.map((p) => p.spot));
 const maxSpot = Math.max(...points.map((p) => p.spot));
 const minPnl = Math.min(...points.map((p) => p.pnl));
 const maxPnl = Math.max(...points.map((p) => p.pnl));
 const pnlRange = maxPnl - minPnl || 1;

 const toX = (spot: number) =>
 pad.l + ((spot - minSpot) / (maxSpot - minSpot)) * innerW;
 const toY = (pnl: number) =>
 pad.t + ((maxPnl - pnl) / pnlRange) * innerH;

 const zero = toY(0);
 const polyPos = points
 .filter((p) => p.pnl >= 0)
 .map((p) => `${toX(p.spot)},${toY(p.pnl)}`)
 .join(" ");
 const polyNeg = points
 .filter((p) => p.pnl <= 0)
 .map((p) => `${toX(p.spot)},${toY(p.pnl)}`)
 .join(" ");

 const pathData = points
 .map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.spot).toFixed(1)},${toY(p.pnl).toFixed(1)}`)
 .join(" ");

 return (
 <div className="flex flex-col gap-1">
 <span className="text-xs text-muted-foreground font-medium">{label}</span>
 <svg width={width} height={height} className="overflow-visible">
 {/* Zero line */}
 <line
 x1={pad.l}
 x2={width - pad.r}
 y1={zero}
 y2={zero}
 stroke="#52525b"
 strokeWidth={1}
 strokeDasharray="3,3"
 />
 {/* Fill positive */}
 {polyPos && (
 <polyline
 points={`${pad.l},${zero} ${polyPos} ${width - pad.r},${zero}`}
 fill={`${color}22`}
 stroke="none"
 />
 )}
 {/* Fill negative */}
 {polyNeg && (
 <polyline
 points={`${pad.l},${zero} ${polyNeg} ${width - pad.r},${zero}`}
 fill="#ef444422"
 stroke="none"
 />
 )}
 {/* Payoff line */}
 <path d={pathData} fill="none" stroke={color} strokeWidth={2} />
 {/* Axes */}
 <line
 x1={pad.l}
 x2={width - pad.r}
 y1={height - pad.b}
 y2={height - pad.b}
 stroke="#3f3f46"
 strokeWidth={1}
 />
 <line
 x1={pad.l}
 x2={pad.l}
 y1={pad.t}
 y2={height - pad.b}
 stroke="#3f3f46"
 strokeWidth={1}
 />
 {/* Labels */}
 <text
 x={pad.l - 2}
 y={toY(maxPnl)}
 textAnchor="end"
 fill="#a1a1aa"
 fontSize={8}
 dominantBaseline="middle"
 >
 {(maxPnl / 1000).toFixed(0)}k
 </text>
 <text
 x={pad.l - 2}
 y={toY(minPnl)}
 textAnchor="end"
 fill="#a1a1aa"
 fontSize={8}
 dominantBaseline="middle"
 >
 {(minPnl / 1000).toFixed(0)}k
 </text>
 <text
 x={toX(minSpot)}
 y={height - 4}
 textAnchor="middle"
 fill="#a1a1aa"
 fontSize={8}
 >
 {minSpot.toFixed(2)}
 </text>
 <text
 x={toX(maxSpot)}
 y={height - 4}
 textAnchor="middle"
 fill="#a1a1aa"
 fontSize={8}
 >
 {maxSpot.toFixed(2)}
 </text>
 <text
 x={toX((minSpot + maxSpot) / 2)}
 y={height - 4}
 textAnchor="middle"
 fill="#52525b"
 fontSize={8}
 >
 EUR/USD
 </text>
 </svg>
 </div>
 );
}

const COST_COMPARISON = [
 {
 strategy: "Plain Vanilla Call",
 type: "Vanilla",
 upfront: 12_500,
 maxGain: "Unlimited",
 maxLoss: "Premium only",
 suitability: "Importers",
 complexity: "Low",
 },
 {
 strategy: "Risk Reversal (25Δ)",
 type: "Zero-cost",
 upfront: 0,
 maxGain: "Unlimited",
 maxLoss: "Short put loss",
 suitability: "Exporters",
 complexity: "Medium",
 },
 {
 strategy: "Range Forward",
 type: "Zero-cost",
 upfront: 0,
 maxGain: "Capped at 1.11",
 maxLoss: "Floored at 1.06",
 suitability: "Both",
 complexity: "Low",
 },
 {
 strategy: "Participating Forward",
 type: "Low cost",
 upfront: 4_200,
 maxGain: "50% participation",
 maxLoss: "Premium only",
 suitability: "Exporters",
 complexity: "Medium",
 },
 {
 strategy: "Knock-In Call",
 type: "Exotic",
 upfront: 7_800,
 maxGain: "Unlimited (if KI)",
 maxLoss: "Premium only",
 suitability: "Sophisticated",
 complexity: "High",
 },
 {
 strategy: "Knock-Out Put",
 type: "Exotic",
 upfront: 6_100,
 maxGain: "Capped put payout",
 maxLoss: "Worthless if KO",
 suitability: "Sophisticated",
 complexity: "High",
 },
];

function FXOptionsTab() {
 const rrPoints = useMemo(() => computeRiskReversalPayoff(), []);
 const rfPoints = useMemo(() => computeRangeForwardPayoff(), []);
 const pfPoints = useMemo(() => computeParticipatingForwardPayoff(), []);
 const [showExporter, setShowExporter] = useState(true);

 return (
 <div className="space-y-4">
 {/* Header */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 <TrendingUp className="w-4 h-4 text-emerald-400" />
 Exporter Perspective
 </CardTitle>
 </CardHeader>
 <CardContent className="text-xs text-muted-foreground space-y-1">
 <p>Receives foreign currency (e.g., EUR) and must convert to USD.</p>
 <p className="text-amber-400">Risk: EUR depreciates → fewer USD received.</p>
 <p className="text-emerald-400">
 Strategy: Buy put / risk reversal to lock in minimum conversion rate.
 </p>
 </CardContent>
 </Card>
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 <TrendingDown className="w-4 h-4 text-red-400" />
 Importer Perspective
 </CardTitle>
 </CardHeader>
 <CardContent className="text-xs text-muted-foreground space-y-1">
 <p>Pays in foreign currency (e.g., EUR) and converts from USD.</p>
 <p className="text-amber-400">Risk: EUR appreciates → more USD needed.</p>
 <p className="text-emerald-400">
 Strategy: Buy call / range forward to cap maximum conversion cost.
 </p>
 </CardContent>
 </Card>
 </div>

 {/* Toggle */}
 <div className="flex items-center gap-3">
 <span className="text-xs text-muted-foreground">Perspective:</span>
 <button
 onClick={() => setShowExporter(true)}
 className={cn(
 "px-3 py-1 rounded text-xs text-muted-foreground font-medium transition-colors",
 showExporter
 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
 : "text-muted-foreground hover:text-muted-foreground",
 )}
 >
 Exporter (Sell EUR)
 </button>
 <button
 onClick={() => setShowExporter(false)}
 className={cn(
 "px-3 py-1 rounded text-xs text-muted-foreground font-medium transition-colors",
 !showExporter
 ? "bg-muted/10 text-primary border border-primary/40"
 : "text-muted-foreground hover:text-muted-foreground",
 )}
 >
 Importer (Buy EUR)
 </button>
 </div>

 {/* Payoff diagrams */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground">
 Payoff Diagrams — EUR/USD Spot: {SPOT.toFixed(4)} | Notional: $1M
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div className="space-y-2">
 <MiniPayoffChart
 points={rrPoints}
 color="#34d399"
 label="25Δ Risk Reversal"
 height={120}
 />
 <p className="text-xs text-muted-foreground">
 Long 25Δ call at 1.1050, short 25Δ put at 1.0650. Zero net premium. Exporter
 participates in EUR upside but has downside floor risk below 1.0650.
 </p>
 </div>
 <div className="space-y-2">
 <MiniPayoffChart
 points={rfPoints}
 color="#60a5fa"
 label="Range Forward"
 height={120}
 />
 <p className="text-xs text-muted-foreground">
 Locks EUR/USD between 1.06–1.11. Zero premium. Both parties capped. Best for
 corporates seeking predictability over upside.
 </p>
 </div>
 <div className="space-y-2">
 <MiniPayoffChart
 points={pfPoints}
 color="#c084fc"
 label="Participating Forward"
 height={120}
 />
 <p className="text-xs text-muted-foreground">
 Guaranteed worst case at 1.08 forward rate. 50% participation in EUR rally above
 strike. Small premium (~$4,200). Popular with mid-cap exporters.
 </p>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Cost comparison table */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 <BarChart3 className="w-3.5 h-3.5 text-muted-foreground/50" />
 Vanilla vs Exotic Cost Comparison — $1M Notional, 90-day Tenor
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 {["Strategy", "Type", "Upfront Cost", "Max Gain", "Max Loss", "Suitable For", "Complexity"].map(
 (h) => (
 <th key={h} className="pb-2 pr-4 text-left text-muted-foreground font-medium">
 {h}
 </th>
 ),
 )}
 </tr>
 </thead>
 <tbody>
 {COST_COMPARISON.map((row, i) => (
 <tr key={i} className="border-b border-border hover:bg-muted/30 transition-colors">
 <td className="py-2 pr-4 text-foreground font-medium">{row.strategy}</td>
 <td className="py-2 pr-4">
 <Badge
 variant="outline"
 className={cn(
 "text-xs text-muted-foreground",
 row.type === "Zero-cost"
 ? "border-emerald-500/40 text-emerald-400"
 : row.type === "Exotic"
 ? "border-amber-500/40 text-amber-400"
 : row.type === "Vanilla"
 ? "border-primary/40 text-primary"
 : "border-border text-muted-foreground",
 )}
 >
 {row.type}
 </Badge>
 </td>
 <td className="py-2 pr-4 text-muted-foreground">
 {row.upfront === 0 ? (
 <span className="text-emerald-400">$0</span>
 ) : (
 <span className="text-amber-400">${row.upfront.toLocaleString()}</span>
 )}
 </td>
 <td className="py-2 pr-4 text-muted-foreground">{row.maxGain}</td>
 <td className="py-2 pr-4 text-muted-foreground">{row.maxLoss}</td>
 <td className="py-2 pr-4 text-muted-foreground">{row.suitability}</td>
 <td className="py-2 pr-4">
 <Badge
 variant="outline"
 className={cn(
 "text-xs text-muted-foreground",
 row.complexity === "High"
 ? "border-red-500/40 text-red-400"
 : row.complexity === "Medium"
 ? "border-amber-500/40 text-amber-400"
 : "border-emerald-500/40 text-emerald-400",
 )}
 >
 {row.complexity}
 </Badge>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>

 {/* Key concepts */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {[
 {
 title: "25Δ Risk Reversal",
 icon: ArrowLeftRight,
 color: "emerald",
 points: [
 "Delta of ±25 roughly means 25% probability of expiry in-the-money",
 "25Δ RR = implied vol of 25Δ call minus 25Δ put",
 "Positive RR → market skewed toward USD strength",
 "Used as a sentiment indicator for currency pairs",
 ],
 },
 {
 title: "Exotic Option Risks",
 icon: AlertTriangle,
 color: "amber",
 points: [
 "Barrier events can create discontinuous payoffs",
 "Vega risk is concentrated near barrier levels",
 "Liquidity is thinner for exotics — wider bid/ask",
 "Model risk: Black-Scholes inadequate for barrier pricing",
 ],
 },
 {
 title: "Hedging Motivation",
 icon: Shield,
 color: "blue",
 points: [
 "Earnings certainty: remove FX volatility from P&L",
 "Budgeting: lock in rates for financial planning",
 "Debt service: protect against currency-denominated obligations",
 "Competitive positioning: maintain pricing power",
 ],
 },
 ].map(({ title, icon: Icon, color, points }) => (
 <Card key={title} className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle
 className={cn(
 "text-sm font-medium flex items-center gap-2",
 color === "emerald"
 ? "text-emerald-300"
 : color === "amber"
 ? "text-amber-300"
 : "text-primary",
 )}
 >
 <Icon
 className={cn(
 "w-4 h-4",
 color === "emerald"
 ? "text-emerald-400"
 : color === "amber"
 ? "text-amber-400"
 : "text-primary",
 )}
 />
 {title}
 </CardTitle>
 </CardHeader>
 <CardContent>
 <ul className="space-y-1">
 {points.map((p, i) => (
 <li key={i} className="text-xs text-muted-foreground flex gap-2">
 <span
 className={cn(
 "mt-0.5 shrink-0",
 color === "emerald"
 ? "text-emerald-500"
 : color === "amber"
 ? "text-amber-500"
 : "text-primary",
 )}
 >
 •
 </span>
 {p}
 </li>
 ))}
 </ul>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 );
}

// ── Tab 2: Accumulators & TARFs ───────────────────────────────────────────────

function generateAccumulatorBars(): AccumulatorBar[] {
 resetSeed();
 const bars: AccumulatorBar[] = [];
 let spot = 1.0850;
 const koBarrier = 1.1050;
 let accumulated = 0;
 let knocked = false;

 for (let day = 1; day <= 60; day++) {
 const r = rand();
 const z = Math.sqrt(-2 * Math.log(Math.max(r, 1e-10))) * Math.cos(2 * Math.PI * rand());
 spot = spot * Math.exp(-0.0001 + 0.005 * z);

 if (!knocked && spot >= koBarrier) knocked = true;

 if (!knocked) {
 accumulated += 100_000;
 }

 bars.push({ day, fixing: spot, knocked, accumulated });
 }
 return bars;
}

function generateTARFCashflows(): TARFCashflow[] {
 resetSeed();
 const flows: TARFCashflow[] = [];
 const forwardRate = 1.08;
 const targetProfit = 50_000;
 let cumProfit = 0;
 let spot = 1.0850;
 let redeemed = false;

 for (let period = 1; period <= 12; period++) {
 for (let i = 0; i < 5; i++) {
 const r = rand();
 const z = Math.sqrt(-2 * Math.log(Math.max(r, 1e-10))) * Math.cos(2 * Math.PI * rand());
 spot = spot * Math.exp(-0.0002 + 0.008 * z);
 }

 const notional = 100_000;
 const pnl = redeemed ? 0 : (forwardRate - spot) * notional;
 const prevCum = cumProfit;
 if (!redeemed) {
 cumProfit = Math.min(prevCum + pnl, targetProfit);
 if (cumProfit >= targetProfit) redeemed = true;
 }

 flows.push({ period, spot, notional, pnl: redeemed && prevCum >= targetProfit ? 0 : pnl, cumulativeProfit: cumProfit, redeemed: redeemed && prevCum < targetProfit ? true : false });
 }
 return flows;
}

function AccumulatorSVG() {
 const bars = useMemo(() => generateAccumulatorBars(), []);
 const width = 520;
 const height = 160;
 const pad = { t: 16, r: 16, b: 40, l: 56 };
 const innerW = width - pad.l - pad.r;
 const innerH = height - pad.t - pad.b;

 const minSpot = Math.min(...bars.map((b) => b.fixing)) * 0.998;
 const maxSpot = Math.max(...bars.map((b) => b.fixing)) * 1.002;
 const koY = pad.t + ((maxSpot - 1.1050) / (maxSpot - minSpot)) * innerH;
 const fwdY = pad.t + ((maxSpot - 1.08) / (maxSpot - minSpot)) * innerH;

 const toX = (day: number) => pad.l + ((day - 1) / 59) * innerW;
 const toY = (spot: number) => pad.t + ((maxSpot - spot) / (maxSpot - minSpot)) * innerH;

 const pathData = bars
 .map((b, i) => `${i === 0 ? "M" : "L"}${toX(b.day).toFixed(1)},${toY(b.fixing).toFixed(1)}`)
 .join(" ");

 const knockDay = bars.find((b) => b.knocked)?.day;

 return (
 <svg width={width} height={height} className="overflow-visible w-full max-w-lg">
 {/* KO barrier */}
 <line x1={pad.l} x2={width - pad.r} y1={koY} y2={koY} stroke="#ef4444" strokeWidth={1} strokeDasharray="4,3" />
 <text x={width - pad.r + 2} y={koY} fill="#ef4444" fontSize={9} dominantBaseline="middle">KO 1.1050</text>
 {/* Forward rate */}
 <line x1={pad.l} x2={width - pad.r} y1={fwdY} y2={fwdY} stroke="#fbbf24" strokeWidth={1} strokeDasharray="4,3" />
 <text x={width - pad.r + 2} y={fwdY} fill="#fbbf24" fontSize={9} dominantBaseline="middle">Fwd 1.080</text>
 {/* Spot path — color segments */}
 {bars.map((b, i) => {
 if (i === 0) return null;
 const prev = bars[i - 1];
 const color = b.knocked ? "#ef4444" : "#34d399";
 return (
 <line
 key={i}
 x1={toX(prev.day)}
 y1={toY(prev.fixing)}
 x2={toX(b.day)}
 y2={toY(b.fixing)}
 stroke={color}
 strokeWidth={1.5}
 />
 );
 })}
 {/* KO event marker */}
 {knockDay && (
 <>
 <line
 x1={toX(knockDay)}
 x2={toX(knockDay)}
 y1={pad.t}
 y2={height - pad.b}
 stroke="#ef4444"
 strokeWidth={1}
 strokeDasharray="2,2"
 />
 <text x={toX(knockDay)} y={height - pad.b + 10} textAnchor="middle" fill="#ef4444" fontSize={8}>
 KO Day {knockDay}
 </text>
 </>
 )}
 {/* Axes */}
 <line x1={pad.l} x2={width - pad.r} y1={height - pad.b} y2={height - pad.b} stroke="#3f3f46" />
 <line x1={pad.l} x2={pad.l} y1={pad.t} y2={height - pad.b} stroke="#3f3f46" />
 {/* Y labels */}
 {[minSpot, (minSpot + maxSpot) / 2, maxSpot].map((v, i) => (
 <text key={i} x={pad.l - 4} y={toY(v)} textAnchor="end" fill="#71717a" fontSize={8} dominantBaseline="middle">
 {v.toFixed(3)}
 </text>
 ))}
 {/* X labels */}
 {[1, 20, 40, 60].map((d) => (
 <text key={d} x={toX(d)} y={height - pad.b + 10} textAnchor="middle" fill="#71717a" fontSize={8}>
 Day {d}
 </text>
 ))}
 <text x={width / 2} y={height - 4} textAnchor="middle" fill="#52525b" fontSize={9}>Daily Fixing (EUR/USD)</text>
 </svg>
 );
}

function TARFWaterfallSVG() {
 const flows = useMemo(() => generateTARFCashflows(), []);
 const width = 480;
 const height = 180;
 const pad = { t: 16, r: 16, b: 40, l: 64 };
 const innerW = width - pad.l - pad.r;
 const innerH = height - pad.t - pad.b;
 const target = 50_000;

 const barW = innerW / flows.length - 2;
 const maxPnl = Math.max(...flows.map((f) => Math.abs(f.pnl)));

 const toX = (i: number) => pad.l + (i / flows.length) * innerW;
 const toBarH = (v: number) => (Math.abs(v) / (maxPnl || 1)) * (innerH * 0.6);

 const cumMax = target;
 const cumLineY = (cum: number) => pad.t + (1 - cum / cumMax) * innerH;

 return (
 <svg width={width} height={height} className="overflow-visible w-full max-w-lg">
 {/* Target line */}
 <line x1={pad.l} x2={width - pad.r} y1={pad.t} y2={pad.t} stroke="#fbbf24" strokeWidth={1} strokeDasharray="4,3" />
 <text x={pad.l - 4} y={pad.t} textAnchor="end" fill="#fbbf24" fontSize={8} dominantBaseline="middle">Target $50k</text>
 {/* Bars */}
 {flows.map((f, i) => {
 const barH = toBarH(f.pnl);
 const barColor = f.pnl >= 0 ? "#34d399" : "#ef4444";
 const midY = height - pad.b;
 return (
 <g key={i}>
 <rect
 x={toX(i) + 1}
 y={f.pnl >= 0 ? midY - barH : midY}
 width={barW}
 height={barH}
 fill={barColor}
 opacity={f.redeemed ? 0.3 : 0.7}
 />
 </g>
 );
 })}
 {/* Cumulative profit line */}
 {flows.map((f, i) => {
 if (i === 0) return null;
 const prev = flows[i - 1];
 return (
 <line
 key={`cum-${i}`}
 x1={toX(i - 1) + barW / 2}
 y1={cumLineY(Math.min(prev.cumulativeProfit, cumMax))}
 x2={toX(i) + barW / 2}
 y2={cumLineY(Math.min(f.cumulativeProfit, cumMax))}
 stroke="#60a5fa"
 strokeWidth={1.5}
 />
 );
 })}
 {/* Axes */}
 <line x1={pad.l} x2={width - pad.r} y1={height - pad.b} y2={height - pad.b} stroke="#3f3f46" />
 <line x1={pad.l} x2={pad.l} y1={pad.t} y2={height - pad.b} stroke="#3f3f46" />
 {/* Period labels */}
 {flows.map((f, i) => (
 <text key={i} x={toX(i) + barW / 2} y={height - pad.b + 10} textAnchor="middle" fill="#71717a" fontSize={7}>
 {f.period}
 </text>
 ))}
 <text x={width / 2} y={height - 4} textAnchor="middle" fill="#52525b" fontSize={9}>
 Period (months) — Bars: period P&L | Blue line: cumulative profit
 </text>
 </svg>
 );
}

const TARF_SCENARIOS = [
 { name: "EUR Weakens Steadily", path: "1.085 → 1.045", result: "Buyer profits each period, hits $50k target early (month 6). TARF redeems.", color: "emerald", outcome: "Early Redemption" },
 { name: "EUR Stable", path: "1.085 → 1.082", result: "Small gains each period. Runs full 12 months. Modest total profit near target.", color: "blue", outcome: "Full Term" },
 { name: "EUR Rallies Sharply", path: "1.085 → 1.145", result: "Losses each period. No redemption trigger. Buyer locked in buying EUR above market. TARF acts like a forward.", color: "red", outcome: "Loss Scenario" },
 { name: "EUR Volatile (mean-rev)", path: "1.085 ± 0.04", result: "Mixed periods. Partial profit accumulation. May redeem late or not at all.", color: "amber", outcome: "Uncertain" },
];

function AccumulatorsTab() {
 const [activeScenario, setActiveScenario] = useState(0);

 return (
 <div className="space-y-4">
 {/* Danger badge */}
 <div className="flex items-start gap-3 p-4 bg-red-950/30 border border-red-800/40 rounded-lg">
 <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
 <div>
 <p className="text-sm font-medium text-red-300">&ldquo;I Kill You Later&rdquo; Products</p>
 <p className="text-xs text-muted-foreground mt-1">
 Accumulators earned this infamous nickname during the 2008 financial crisis when the AUD and other EM
 currencies crashed. Clients who purchased accumulators at tight forward rates were forced to buy currencies
 at far-above-market prices, suffering massive losses. The lesson: understand path-dependency and worst-case
 scenarios before entering structured products.
 </p>
 </div>
 </div>

 {/* Accumulator mechanics */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 <Activity className="w-4 h-4 text-emerald-400" />
 Accumulator: Daily Fixing vs Knock-Out Barrier
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 <AccumulatorSVG />
 <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
 <div className="bg-muted/50 rounded p-2">
 <div className="text-muted-foreground">Structure</div>
 <div className="text-foreground">Buy EUR daily at 1.08 forward</div>
 </div>
 <div className="bg-muted/50 rounded p-2">
 <div className="text-muted-foreground">KO Barrier</div>
 <div className="text-red-400">1.1050 — stops accumulation</div>
 </div>
 <div className="bg-muted/50 rounded p-2">
 <div className="text-muted-foreground">Benefit</div>
 <div className="text-emerald-400">Below-market forward rate</div>
 </div>
 </div>
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 <Target className="w-3.5 h-3.5 text-muted-foreground/50" />
 TARF: Cash Flow Waterfall
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 <TARFWaterfallSVG />
 <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
 <div className="bg-muted/50 rounded p-2">
 <div className="text-muted-foreground">Target Profit</div>
 <div className="text-amber-400">$50,000 cumulative</div>
 </div>
 <div className="bg-muted/50 rounded p-2">
 <div className="text-muted-foreground">Redemption</div>
 <div className="text-primary">Auto-redeems at target</div>
 </div>
 <div className="bg-muted/50 rounded p-2">
 <div className="text-muted-foreground">Tenor</div>
 <div className="text-foreground">12 monthly periods</div>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* P&L Scenarios */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 <Layers className="w-3.5 h-3.5 text-muted-foreground/50" />
 P&L Scenarios Under Different Spot Paths
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 {TARF_SCENARIOS.map((s, i) => (
 <button
 key={i}
 onClick={() => setActiveScenario(i)}
 className={cn(
 "text-left p-3 rounded-lg border transition-colors",
 activeScenario === i
 ? s.color === "emerald"
 ? "bg-emerald-500/5 border-emerald-500/50"
 : s.color === "blue"
 ? "bg-muted/10 border-primary/50"
 : s.color === "red"
 ? "bg-red-500/5 border-red-500/50"
 : "bg-amber-500/10 border-amber-500/50"
 : "bg-muted/30 border-border hover:border-border",
 )}
 >
 <div className="text-xs font-medium text-foreground">{s.name}</div>
 <div className="text-xs text-muted-foreground mt-1">{s.path}</div>
 <Badge
 variant="outline"
 className={cn(
 "mt-2 text-xs text-muted-foreground",
 s.color === "emerald"
 ? "border-emerald-500/40 text-emerald-400"
 : s.color === "blue"
 ? "border-primary/40 text-primary"
 : s.color === "red"
 ? "border-red-500/40 text-red-400"
 : "border-amber-500/40 text-amber-400",
 )}
 >
 {s.outcome}
 </Badge>
 </button>
 ))}
 </div>
 
 <div
 key={activeScenario}
 className="p-4 bg-muted/40 rounded-lg border border-border"
 >
 <p className="text-sm font-medium text-foreground">{TARF_SCENARIOS[activeScenario].name}</p>
 <p className="text-xs text-muted-foreground mt-2">{TARF_SCENARIOS[activeScenario].result}</p>
 </div>
 
 </CardContent>
 </Card>

 {/* Key terms */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground">Accumulator Key Terms</CardTitle>
 </CardHeader>
 <CardContent>
 <dl className="space-y-2 text-xs text-muted-foreground">
 {[
 ["Strike Price", "The below-market rate at which you accumulate the currency daily"],
 ["Knock-Out Barrier", "If spot trades above this level, the entire contract terminates immediately"],
 ["Leverage Factor", "Often 2x — you must buy twice as much if spot is below strike"],
 ["Tenor", "Typical structures: 3–12 months, with daily or weekly fixing dates"],
 ["Upside Participation", "Zero — if currency rallies past KO, contract dies with no compensation"],
 ].map(([term, def]) => (
 <div key={term as string} className="flex gap-2">
 <dt className="text-primary shrink-0 w-32">{term}</dt>
 <dd className="text-muted-foreground">{def}</dd>
 </div>
 ))}
 </dl>
 </CardContent>
 </Card>
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground">TARF Mechanics</CardTitle>
 </CardHeader>
 <CardContent>
 <dl className="space-y-2 text-xs text-muted-foreground">
 {[
 ["Target Profit", "Cumulative profit cap — once reached, contract automatically terminates"],
 ["Forward Rate", "The rate at which buyer transacts each period (below market)"],
 ["Leverage", "If spot goes against buyer, they may be obligated to transact at 2x notional"],
 ["Profit Cap", "Buyer cannot earn more than the target — asymmetric: unlimited loss, capped gain"],
 ["Early Redemption", "Can occur any period once cumulative profit hits target amount"],
 ].map(([term, def]) => (
 <div key={term as string} className="flex gap-2">
 <dt className="text-primary shrink-0 w-32">{term}</dt>
 <dd className="text-muted-foreground">{def}</dd>
 </div>
 ))}
 </dl>
 </CardContent>
 </Card>
 </div>
 </div>
 );
}

// ── Tab 3: Dual Currency Deposits ────────────────────────────────────────────

function DCDYieldSVG() {
 resetSeed();
 const width = 400;
 const height = 160;
 const pad = { t: 16, r: 16, b: 40, l: 56 };
 const innerW = width - pad.l - pad.r;
 const innerH = height - pad.t - pad.b;

 const strikeOffsets = [-3, -2, -1, 0, 1, 2, 3]; // % away from spot
 const plainYield = 4.5; // %
 const dcdYields = strikeOffsets.map((o) => plainYield + 1.5 + (3 - Math.abs(o)) * 0.8 + rand() * 0.3);

 const maxY = Math.max(...dcdYields) + 0.5;
 const minY = plainYield - 0.5;

 const toX = (i: number) => pad.l + (i / (strikeOffsets.length - 1)) * innerW;
 const toY = (y: number) => pad.t + ((maxY - y) / (maxY - minY)) * innerH;

 const plainY = toY(plainYield);
 const barW = innerW / strikeOffsets.length - 4;

 return (
 <svg width={width} height={height} className="overflow-visible w-full max-w-sm">
 {/* Plain deposit line */}
 <line x1={pad.l} x2={width - pad.r} y1={plainY} y2={plainY} stroke="#60a5fa" strokeWidth={1.5} strokeDasharray="4,3" />
 <text x={width - pad.r + 2} y={plainY} fill="#60a5fa" fontSize={8} dominantBaseline="middle">Plain {plainYield}%</text>
 {/* DCD bars */}
 {dcdYields.map((y, i) => {
 const bH = toY(plainYield) - toY(y);
 return (
 <g key={i}>
 {/* Plain portion */}
 <rect
 x={toX(i) - barW / 2}
 y={toY(plainYield)}
 width={barW}
 height={innerH - (toY(plainYield) - pad.t)}
 fill="#1e3a5f"
 />
 {/* Enhancement portion */}
 <rect
 x={toX(i) - barW / 2}
 y={toY(y)}
 width={barW}
 height={bH}
 fill="#34d399"
 opacity={0.8}
 />
 </g>
 );
 })}
 {/* Axes */}
 <line x1={pad.l} x2={width - pad.r} y1={height - pad.b} y2={height - pad.b} stroke="#3f3f46" />
 <line x1={pad.l} x2={pad.l} y1={pad.t} y2={height - pad.b} stroke="#3f3f46" />
 {/* Y labels */}
 {[plainYield, (plainYield + maxY) / 2, maxY].map((v, i) => (
 <text key={i} x={pad.l - 4} y={toY(v)} textAnchor="end" fill="#71717a" fontSize={8} dominantBaseline="middle">
 {v.toFixed(1)}%
 </text>
 ))}
 {/* X labels */}
 {strikeOffsets.map((o, i) => (
 <text key={i} x={toX(i)} y={height - pad.b + 10} textAnchor="middle" fill="#71717a" fontSize={8}>
 {o > 0 ? `+${o}%` : `${o}%`}
 </text>
 ))}
 <text x={width / 2} y={height - 4} textAnchor="middle" fill="#52525b" fontSize={9}>
 Strike Offset from Spot — Green: yield enhancement
 </text>
 </svg>
 );
}

const DCD_SCENARIOS: DCDScenario[] = [
 { name: "USD/JPY stays below strike", endSpot: 148.5, depositReturn: 5.8, fxReturn: 0, totalReturn: 5.8, converted: false },
 { name: "USD/JPY weakly above strike", endSpot: 150.8, depositReturn: 5.8, fxReturn: -1.2, totalReturn: 4.6, converted: true },
 { name: "USD/JPY moderately above strike", endSpot: 153.0, depositReturn: 5.8, fxReturn: -3.5, totalReturn: 2.3, converted: true },
 { name: "USD/JPY sharply above strike", endSpot: 158.0, depositReturn: 5.8, fxReturn: -6.8, totalReturn: -1.0, converted: true },
];

function DCDScenarioBar({ scenario }: { scenario: DCDScenario }) {
 const maxAbs = 8;
 const depositW = (scenario.depositReturn / maxAbs) * 100;
 const fxW = (Math.abs(scenario.fxReturn) / maxAbs) * 100;

 return (
 <div className="space-y-1">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">{scenario.name}</span>
 <span className={cn("font-medium", scenario.totalReturn >= 0 ? "text-emerald-400" : "text-red-400")}>
 {scenario.totalReturn >= 0 ? "+" : ""}{scenario.totalReturn.toFixed(1)}%
 </span>
 </div>
 <div className="flex h-4 rounded overflow-hidden gap-0.5">
 <div
 className="bg-emerald-500/70 flex items-center justify-center text-xs text-foreground"
 style={{ width: `${depositW}%` }}
 >
 {depositW > 15 ? `+${scenario.depositReturn.toFixed(1)}%` : ""}
 </div>
 {scenario.fxReturn < 0 && (
 <div
 className="bg-red-500/70 flex items-center justify-center text-xs text-foreground"
 style={{ width: `${fxW}%` }}
 >
 {fxW > 15 ? `${scenario.fxReturn.toFixed(1)}%` : ""}
 </div>
 )}
 </div>
 <div className="flex gap-2 text-xs text-muted-foreground">
 <span>Spot: {scenario.endSpot}</span>
 <span>•</span>
 <span className={scenario.converted ? "text-amber-400" : "text-emerald-400"}>
 {scenario.converted ? "Converted to JPY" : "USD returned"}
 </span>
 </div>
 </div>
 );
}

function DualCurrencyTab() {
 return (
 <div className="space-y-4">
 {/* Mechanics overview */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 <DollarSign className="w-4 h-4 text-emerald-400" />
 DCD Mechanics — How It Works
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3 text-xs text-muted-foreground">
 <div className="flex gap-3 items-start">
 <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-semibold shrink-0">1</div>
 <p>Investor deposits USD (or other base currency) for a fixed tenor (typically 1–4 weeks).</p>
 </div>
 <div className="flex gap-3 items-start">
 <div className="w-6 h-6 rounded-full bg-muted/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">2</div>
 <p>Bank pays an enhanced interest rate because investor has sold a put option to the bank (embedded option).</p>
 </div>
 <div className="flex gap-3 items-start">
 <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-medium shrink-0">3</div>
 <p>At maturity: if spot USD/JPY is below strike (e.g., 150.0), USD principal + enhanced interest is returned.</p>
 </div>
 <div className="flex gap-3 items-start">
 <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs font-medium shrink-0">4</div>
 <p>If spot is above strike at maturity, principal is converted to JPY at the strike rate. Investor receives JPY — regardless of current market rate.</p>
 </div>
 <div className="p-3 bg-muted/60 rounded text-muted-foreground border-l-2 border-amber-400">
 <strong className="text-amber-300">Key Risk:</strong> The enhanced yield compensates for accepting FX conversion risk. If the currency moves sharply against you, the conversion loss can exceed the yield pickup.
 </div>
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 <Calculator className="w-3.5 h-3.5 text-muted-foreground/50" />
 Yield Enhancement vs Strike Selection
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 <DCDYieldSVG />
 <div className="text-xs text-muted-foreground space-y-1">
 <p><span className="text-emerald-400">ATM strike (0%):</span> highest enhancement (deepest option premium)</p>
 <p><span className="text-primary">Far OTM strike (±3%):</span> lower enhancement but less conversion risk</p>
 <p className="text-muted-foreground">Strike selection is the key trade-off between yield and safety.</p>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Scenario analysis */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 <BarChart3 className="w-3.5 h-3.5 text-muted-foreground/50" />
 Worst-Case Scenario Analysis — USD/JPY DCD, Strike: 150.0, Yield: 5.8% p.a. (28-day)
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 {DCD_SCENARIOS.map((sc, i) => (
 <DCDScenarioBar key={i} scenario={sc} />
 ))}
 <p className="text-xs text-muted-foreground pt-2 border-t border-border">
 Green = deposit yield earned. Red = FX conversion loss. Total return can turn negative if FX move is large enough.
 </p>
 </CardContent>
 </Card>

 {/* Suitability and structure */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground">Suitability Considerations</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-2">
 <div className="flex items-start gap-2 text-xs text-muted-foreground">
 <span className="text-emerald-400 mt-0.5">✓</span>
 <span className="text-muted-foreground">Investors comfortable holding either currency at maturity</span>
 </div>
 <div className="flex items-start gap-2 text-xs text-muted-foreground">
 <span className="text-emerald-400 mt-0.5">✓</span>
 <span className="text-muted-foreground">Those who need currency anyway (natural hedge users)</span>
 </div>
 <div className="flex items-start gap-2 text-xs text-muted-foreground">
 <span className="text-emerald-400 mt-0.5">✓</span>
 <span className="text-muted-foreground">Yield-enhancement seekers in low-rate environments</span>
 </div>
 <div className="flex items-start gap-2 text-xs text-muted-foreground">
 <span className="text-red-400 mt-0.5">✗</span>
 <span className="text-muted-foreground">Investors who need their principal in specific currency at maturity</span>
 </div>
 <div className="flex items-start gap-2 text-xs text-muted-foreground">
 <span className="text-red-400 mt-0.5">✗</span>
 <span className="text-muted-foreground">Those without FX risk tolerance or diversified FX portfolio</span>
 </div>
 <div className="flex items-start gap-2 text-xs text-muted-foreground">
 <span className="text-red-400 mt-0.5">✗</span>
 <span className="text-muted-foreground">Retail investors without structured product experience</span>
 </div>
 </div>
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground">DCD vs Plain Deposit — Key Facts</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 <th className="pb-2 text-left text-muted-foreground">Feature</th>
 <th className="pb-2 text-left text-muted-foreground">Plain Deposit</th>
 <th className="pb-2 text-left text-muted-foreground">DCD</th>
 </tr>
 </thead>
 <tbody className="space-y-1">
 {[
 ["Principal risk", "None", "FX conversion risk"],
 ["Yield", "4.5% p.a.", "5.8–8.5% p.a."],
 ["Tenor", "Flexible", "1–4 weeks typical"],
 ["Deposit insurance", "Yes (bank guarantee)", "No — structured product"],
 ["Early exit", "Possible (penalty)", "Generally not permitted"],
 ["Regulatory status", "Deposit", "Investment product"],
 ].map(([feat, plain, dcd]) => (
 <tr key={feat as string} className="border-b border-border">
 <td className="py-1.5 pr-4 text-muted-foreground">{feat}</td>
 <td className="py-1.5 pr-4 text-muted-foreground">{plain}</td>
 <td className="py-1.5 text-muted-foreground">{dcd}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>
 </div>
 </div>
 );
}

// ── Tab 4: Corporate Hedging ──────────────────────────────────────────────────

function HedgeCostSVG() {
 const strategies: HedgeStrategy[] = useMemo(() => {
 resetSeed();
 const spots: number[] = [];
 for (let i = 0; i <= 40; i++) spots.push(1.02 + i * 0.005);
 const fwdRate = 1.083;
 const putStrike = 1.07;
 const putPremium = 0.008;
 const callStrike = 1.095;
 const putStrikeZC = 1.065;

 return [
 {
 name: "Forward Contract",
 color: "#60a5fa",
 cost: 0,
 description: "Lock rate at 1.083 forward. Certain outcome, zero optionality.",
 points: spots.map((s) => ({ spot: s, pnl: (fwdRate - s) * NOTIONAL })),
 },
 {
 name: "Vanilla Put Option",
 color: "#34d399",
 cost: putPremium * NOTIONAL,
 description: "Downside protection at 1.07 strike, full upside. Costs $8,000 premium.",
 points: spots.map((s) => ({
 spot: s,
 pnl: Math.max(putStrike - s, 0) * NOTIONAL - putPremium * NOTIONAL,
 })),
 },
 {
 name: "Zero-Cost Collar",
 color: "#c084fc",
 cost: 0,
 description: "Long put 1.065, short call 1.095. Bounded range, no premium.",
 points: spots.map((s) => {
 let rate = s;
 if (s < putStrikeZC) rate = putStrikeZC;
 if (s > callStrike) rate = callStrike;
 return { spot: s, pnl: (rate - s) * NOTIONAL };
 }),
 },
 ];
 }, []);

 const width = 440;
 const height = 180;
 const pad = { t: 8, r: 100, b: 36, l: 56 };
 const innerW = width - pad.l - pad.r;
 const innerH = height - pad.t - pad.b;

 const allPnl = strategies.flatMap((s) => s.points.map((p) => p.pnl));
 const minPnl = Math.min(...allPnl);
 const maxPnl = Math.max(...allPnl);
 const pnlRange = maxPnl - minPnl;
 const spots = strategies[0].points.map((p) => p.spot);
 const minSpot = spots[0];
 const maxSpot = spots[spots.length - 1];

 const toX = (s: number) => pad.l + ((s - minSpot) / (maxSpot - minSpot)) * innerW;
 const toY = (p: number) => pad.t + ((maxPnl - p) / pnlRange) * innerH;

 const zeroY = toY(0);

 return (
 <svg width={width} height={height} className="overflow-visible w-full max-w-xl">
 {/* Zero line */}
 <line x1={pad.l} x2={width - pad.r} y1={zeroY} y2={zeroY} stroke="#52525b" strokeWidth={1} strokeDasharray="3,3" />
 {/* Strategy lines */}
 {strategies.map((strat) => {
 const d = strat.points.map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.spot).toFixed(1)},${toY(p.pnl).toFixed(1)}`).join(" ");
 return <path key={strat.name} d={d} fill="none" stroke={strat.color} strokeWidth={2} />;
 })}
 {/* Legend */}
 {strategies.map((strat, i) => (
 <g key={strat.name}>
 <line x1={width - pad.r + 8} x2={width - pad.r + 20} y1={20 + i * 20} y2={20 + i * 20} stroke={strat.color} strokeWidth={2} />
 <text x={width - pad.r + 24} y={20 + i * 20} fill={strat.color} fontSize={8} dominantBaseline="middle">{strat.name}</text>
 </g>
 ))}
 {/* Axes */}
 <line x1={pad.l} x2={width - pad.r} y1={height - pad.b} y2={height - pad.b} stroke="#3f3f46" />
 <line x1={pad.l} x2={pad.l} y1={pad.t} y2={height - pad.b} stroke="#3f3f46" />
 {/* Labels */}
 {[minPnl, 0, maxPnl].map((v, i) => (
 <text key={i} x={pad.l - 4} y={toY(v)} textAnchor="end" fill="#71717a" fontSize={8} dominantBaseline="middle">
 {(v / 1000).toFixed(0)}k
 </text>
 ))}
 {[minSpot, 1.085, maxSpot].map((v, i) => (
 <text key={i} x={toX(v)} y={height - pad.b + 10} textAnchor="middle" fill="#71717a" fontSize={8}>
 {v.toFixed(3)}
 </text>
 ))}
 <text x={pad.l + innerW / 2} y={height - 4} textAnchor="middle" fill="#52525b" fontSize={9}>
 EUR/USD at Maturity — P&L ($)
 </text>
 </svg>
 );
}

const EXPOSURE_TYPES = [
 {
 type: "Transactional",
 color: "blue",
 examples: ["Accounts receivable in foreign currency", "Future purchase commitments", "Cross-border loan repayments"],
 horizon: "Short-term (0–12 months)",
 tool: "Forward contracts, vanilla options",
 },
 {
 type: "Translational",
 color: "purple",
 examples: ["Consolidation of foreign subsidiary P&L", "Balance sheet restatement of foreign assets", "Reported earnings sensitivity"],
 horizon: "Periodic (quarterly/annual)",
 tool: "Balance sheet hedging, cross-currency swaps",
 },
 {
 type: "Economic",
 color: "amber",
 examples: ["Long-term competitiveness vs foreign rivals", "Pricing power in export markets", "Supply chain cost sensitivity to FX"],
 horizon: "Long-term (1–5 years)",
 tool: "Natural hedging, structural diversification",
 },
];

const HEDGE_RATIOS = [
 { ratio: "0%", label: "No hedge", risk: "Full FX exposure", benefit: "Maximum upside if favorable move" },
 { ratio: "25%", label: "Partial hedge", risk: "75% exposed", benefit: "Partial protection, low cost" },
 { ratio: "50%", label: "Half hedge", risk: "Balanced approach", benefit: "Industry-standard for many sectors" },
 { ratio: "75%", label: "Core hedge", risk: "25% residual", benefit: "High certainty, some optionality" },
 { ratio: "100%", label: "Full hedge", risk: "Zero FX risk", benefit: "Complete certainty for budgeting" },
];

function CorporateHedgingTab() {
 const [selectedRatio, setSelectedRatio] = useState(2);

 return (
 <div className="space-y-4">
 {/* Exposure types */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 <Globe className="w-3.5 h-3.5 text-muted-foreground/50" />
 FX Risk Exposure Mapping
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {EXPOSURE_TYPES.map((exp) => (
 <div
 key={exp.type}
 className={cn(
 "p-4 rounded-lg border",
 exp.color === "blue"
 ? "bg-muted/5 border-border"
 : exp.color === "purple"
 ? "bg-muted/5 border-border"
 : "bg-amber-500/5 border-amber-500/30",
 )}
 >
 <div
 className={cn(
 "text-sm font-semibold mb-3",
 exp.color === "blue"
 ? "text-primary"
 : exp.color === "purple"
 ? "text-primary"
 : "text-amber-300",
 )}
 >
 {exp.type} Exposure
 </div>
 <ul className="space-y-1 mb-3">
 {exp.examples.map((e) => (
 <li key={e} className="text-xs text-muted-foreground flex gap-1.5">
 <span
 className={cn(
 exp.color === "blue"
 ? "text-primary"
 : exp.color === "purple"
 ? "text-primary"
 : "text-amber-500",
 )}
 >
 •
 </span>
 {e}
 </li>
 ))}
 </ul>
 <div className="text-xs text-muted-foreground">
 <div className="text-muted-foreground">Horizon: <span className="text-muted-foreground">{exp.horizon}</span></div>
 <div className="text-muted-foreground mt-1">Tool: <span className="text-muted-foreground">{exp.tool}</span></div>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* Cost comparison SVG */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 <BarChart3 className="w-3.5 h-3.5 text-muted-foreground/50" />
 Cost of Carry Comparison — Forward vs Option vs Zero-Cost Collar
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <HedgeCostSVG />
 <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
 {[
 { name: "Forward Contract", color: "text-primary", pros: "Zero cost, certain outcome", cons: "No upside participation" },
 { name: "Vanilla Put Option", color: "text-emerald-400", pros: "Full upside retained", cons: "$8,000 upfront premium" },
 { name: "Zero-Cost Collar", color: "text-primary", pros: "No premium, downside floor", cons: "Upside capped at strike" },
 ].map((s) => (
 <div key={s.name} className="bg-muted/40 rounded p-3 space-y-1">
 <div className={cn("font-medium", s.color)}>{s.name}</div>
 <div className="text-muted-foreground"><span className="text-emerald-500">+</span> {s.pros}</div>
 <div className="text-muted-foreground"><span className="text-red-500">−</span> {s.cons}</div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* Hedge ratio framework */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 <Target className="w-4 h-4 text-emerald-400" />
 Hedge Ratio Decision Framework
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 <div className="flex gap-2 flex-wrap">
 {HEDGE_RATIOS.map((h, i) => (
 <button
 key={i}
 onClick={() => setSelectedRatio(i)}
 className={cn(
 "px-3 py-1.5 rounded text-xs text-muted-foreground font-medium transition-colors border",
 selectedRatio === i
 ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
 : "text-muted-foreground border-border hover:border-muted-foreground",
 )}
 >
 {h.ratio}
 </button>
 ))}
 </div>
 
 <div
 key={selectedRatio}
 className="p-4 bg-muted/40 rounded-lg border border-border"
 >
 <div className="text-sm font-medium text-foreground">{HEDGE_RATIOS[selectedRatio].ratio} — {HEDGE_RATIOS[selectedRatio].label}</div>
 <div className="mt-2 space-y-1 text-xs text-muted-foreground">
 <div className="text-muted-foreground"><span className="text-amber-400">Risk: </span>{HEDGE_RATIOS[selectedRatio].risk}</div>
 <div className="text-muted-foreground"><span className="text-emerald-400">Benefit: </span>{HEDGE_RATIOS[selectedRatio].benefit}</div>
 </div>
 </div>
 
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 <Zap className="w-4 h-4 text-amber-400" />
 Natural Hedging Strategies
 </CardTitle>
 </CardHeader>
 <CardContent>
 <ul className="space-y-3">
 {[
 {
 title: "Revenue/Cost Matching",
 desc: "Invoice customers in same currency as costs. E.g., if manufacturing in EUR, sell in EUR.",
 tag: "Operational",
 },
 {
 title: "Local Currency Financing",
 desc: "Borrow in the currency of your revenues to create a natural liability offset.",
 tag: "Financial",
 },
 {
 title: "Geographic Diversification",
 desc: "Spread operations across multiple currency zones to reduce concentration risk.",
 tag: "Strategic",
 },
 {
 title: "Netting Centers",
 desc: "Aggregate intercompany FX flows through a central treasury to reduce gross hedging needs.",
 tag: "Treasury",
 },
 ].map((item) => (
 <li key={item.title} className="flex gap-3 items-start">
 <Badge
 variant="outline"
 className="border-border text-muted-foreground text-xs shrink-0 mt-0.5"
 >
 {item.tag}
 </Badge>
 <div>
 <div className="text-xs font-medium text-foreground">{item.title}</div>
 <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
 </div>
 </li>
 ))}
 </ul>
 </CardContent>
 </Card>
 </div>

 {/* P&L impact analysis */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 <Activity className="w-4 h-4 text-red-400" />
 P&L Impact Analysis — 3 Hedging Strategies, $10M EUR Revenue, EUR/USD moves -5% (1.085 → 1.030)
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 {["Strategy", "Effective Rate", "USD Revenue", "FX Gain/Loss", "Net P&L Impact", "Verdict"].map((h) => (
 <th key={h} className="pb-2 pr-4 text-left text-muted-foreground font-medium">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {[
 {
 strategy: "No Hedge",
 effectiveRate: "1.030 (market)",
 usdRevenue: "$10.30M",
 fxGL: "-$550K",
 pnl: "−$550,000",
 verdict: "Exposed",
 pnlColor: "text-red-400",
 verdictColor: "text-red-400",
 },
 {
 strategy: "Full Forward Hedge",
 effectiveRate: "1.083 (locked)",
 usdRevenue: "$10.83M",
 fxGL: "$0",
 pnl: "+$530,000 vs unhedged",
 verdict: "Fully Protected",
 pnlColor: "text-emerald-400",
 verdictColor: "text-emerald-400",
 },
 {
 strategy: "50% Forward + 50% Put",
 effectiveRate: "1.068 (blended)",
 usdRevenue: "$10.68M",
 fxGL: "+$275K hedge / −$275K exposed",
 pnl: "+$380,000 vs unhedged",
 verdict: "Balanced",
 pnlColor: "text-primary",
 verdictColor: "text-primary",
 },
 ].map((row) => (
 <tr key={row.strategy} className="border-b border-border hover:bg-muted/20 transition-colors">
 <td className="py-2.5 pr-4 text-foreground font-medium">{row.strategy}</td>
 <td className="py-2.5 pr-4 text-muted-foreground">{row.effectiveRate}</td>
 <td className="py-2.5 pr-4 text-muted-foreground">{row.usdRevenue}</td>
 <td className="py-2.5 pr-4 text-muted-foreground">{row.fxGL}</td>
 <td className={cn("py-2.5 pr-4 font-medium", row.pnlColor)}>{row.pnl}</td>
 <td className={cn("py-2.5 font-medium", row.verdictColor)}>{row.verdict}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>
 </div>
 );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function FXStructuredPage() {
 return (
 <div className="max-w-5xl px-6 py-8 mx-auto space-y-6">
 {/* Header — Hero */}
 <div className="rounded-lg border border-border bg-card p-5">
 <div className="flex items-center gap-3 mb-2">
 <div className="p-2 bg-muted/10 rounded-lg border border-border">
 <Globe className="w-3.5 h-3.5 text-muted-foreground/50" />
 </div>
 <div>
 <h1 className="text-3xl font-bold tracking-tight">FX Structured Products</h1>
 <p className="text-sm text-muted-foreground">
 Options strategies, accumulators, TARFs, dual currency deposits & corporate hedging
 </p>
 </div>
 </div>
 <div className="flex flex-wrap gap-2 mt-3">
 {[
 { label: "EUR/USD Spot", value: "1.0850", color: "text-muted-foreground" },
 { label: "3M Forward", value: "1.0832", color: "text-muted-foreground" },
 { label: "3M ATM IV", value: "6.2%", color: "text-amber-400" },
 { label: "25Δ RR", value: "+0.45%", color: "text-emerald-400" },
 ].map((item) => (
 <div key={item.label} className="flex items-center gap-1.5 bg-card border border-border rounded px-2.5 py-1 text-xs text-muted-foreground">
 <span className="text-muted-foreground">{item.label}</span>
 <span className={cn("font-medium", item.color)}>{item.value}</span>
 </div>
 ))}
 </div>
 </div>

 {/* Tabs */}
 <Tabs defaultValue="options" className="mt-8 space-y-4">
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
 <TabsTrigger
 value="options"
 className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:text-foreground rounded-none bg-transparent text-muted-foreground text-xs px-3 py-1.5 flex items-center gap-1.5"
 >FX Options Strategies</TabsTrigger>
 <TabsTrigger
 value="accumulators"
 className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:text-foreground rounded-none bg-transparent text-muted-foreground text-xs px-3 py-1.5 flex items-center gap-1.5"
 >Accumulators & TARFs</TabsTrigger>
 <TabsTrigger
 value="dcd"
 className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:text-foreground rounded-none bg-transparent text-muted-foreground text-xs px-3 py-1.5 flex items-center gap-1.5"
 >Dual Currency Deposits</TabsTrigger>
 <TabsTrigger
 value="corporate"
 className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:text-foreground rounded-none bg-transparent text-muted-foreground text-xs px-3 py-1.5 flex items-center gap-1.5"
 >Corporate Hedging</TabsTrigger>
 </TabsList>

 <TabsContent value="options" className="data-[state=inactive]:hidden">
 <div
 >
 <FXOptionsTab />
 </div>
 </TabsContent>

 <TabsContent value="accumulators" className="data-[state=inactive]:hidden">
 <div
 >
 <AccumulatorsTab />
 </div>
 </TabsContent>

 <TabsContent value="dcd" className="data-[state=inactive]:hidden">
 <div
 >
 <DualCurrencyTab />
 </div>
 </TabsContent>

 <TabsContent value="corporate" className="data-[state=inactive]:hidden">
 <div
 >
 <CorporateHedgingTab />
 </div>
 </TabsContent>
 </Tabs>
 </div>
 );
}
