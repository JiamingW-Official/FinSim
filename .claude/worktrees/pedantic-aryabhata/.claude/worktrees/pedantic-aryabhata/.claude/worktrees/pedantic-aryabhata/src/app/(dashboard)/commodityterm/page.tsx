"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
 TrendingUp,
 TrendingDown,
 BarChart2,
 RefreshCw,
 DollarSign,
 Activity,
 Layers,
 ArrowRight,
 Info,
 Warehouse,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 801;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};

// Pre-generate stable values
const _vals = Array.from({ length: 2000 }, () => rand());
let _vi = 0;
const sv = () => _vals[_vi++ % _vals.length];

// ── Format helpers ─────────────────────────────────────────────────────────────
function fmt(n: number, d = 2): string {
 return n.toLocaleString("en-US", {
 minimumFractionDigits: d,
 maximumFractionDigits: d,
 });
}
function fmtPct(n: number, sign = true): string {
 const prefix = sign && n >= 0 ? "+" : "";
 return prefix + n.toFixed(2) + "%";
}

const pos = (v: number) => (v >= 0 ? "text-emerald-400" : "text-red-400");
const posBg = (v: number) => (v >= 0 ? "bg-emerald-500/5" : "bg-red-500/5");

// ── DATA ───────────────────────────────────────────────────────────────────────

// Futures curve: 12 months, contango shape
const FRONT_PRICE = 78.42;
const CURVE_MONTHS = [
 "Mar", "Apr", "May", "Jun", "Jul", "Aug",
 "Sep", "Oct", "Nov", "Dec", "Jan", "Feb",
];
// Generate contango forward curve with slight noise
const CURVE_PRICES: number[] = CURVE_MONTHS.map((_, i) => {
 const base = FRONT_PRICE * Math.pow(1 + 0.004, i); // ~4.8% annualized carry
 const noise = (sv() - 0.5) * 0.4;
 return parseFloat((base + noise).toFixed(2));
});

// Roll yield per roll: negative in contango (you buy higher)
function rollYield(near: number, far: number, daysToExpiry: number): number {
 return ((near - far) / near) * (365 / daysToExpiry) * 100;
}

// Monthly historical roll yield 2020-2024 (WTI simulated)
const HIST_MONTHS = [
 "Jan-20","Feb-20","Mar-20","Apr-20","May-20","Jun-20",
 "Jul-20","Aug-20","Sep-20","Oct-20","Nov-20","Dec-20",
 "Jan-21","Feb-21","Mar-21","Apr-21","May-21","Jun-21",
 "Jul-21","Aug-21","Sep-21","Oct-21","Nov-21","Dec-21",
 "Jan-22","Feb-22","Mar-22","Apr-22","May-22","Jun-22",
 "Jul-22","Aug-22","Sep-22","Oct-22","Nov-22","Dec-22",
 "Jan-23","Feb-23","Mar-23","Apr-23","May-23","Jun-23",
 "Jul-23","Aug-23","Sep-23","Oct-23","Nov-23","Dec-23",
 "Jan-24","Feb-24","Mar-24","Apr-24","May-24","Jun-24",
];
const HIST_ROLL: number[] = (() => {
 // 2020 deep contango (COVID crash), 2021-2022 backwardation, 2023-2024 mixed
 const profile = [
 // 2020 - deep contango
 -2.1,-1.8,-4.2,-8.5,-3.1,-1.9,-1.4,-1.2,-0.9,-0.7,-0.5,-0.3,
 // 2021 - shifting to backwardation
 0.2, 0.8, 1.4, 2.1, 2.8, 3.1, 3.4, 2.9, 2.4, 2.1, 1.8, 1.5,
 // 2022 - strong backwardation (Russia/Ukraine)
 2.2, 3.1, 4.8, 5.2, 4.9, 4.1, 3.4, 2.8, 2.1, 1.6, 1.0, 0.5,
 // 2023 - mild contango returns
 -0.3,-0.7,-1.1,-0.9,-0.6,-0.4,-0.8,-1.2,-1.5,-1.1,-0.7,-0.4,
 // 2024 - mixed
 -0.2, 0.3, 0.8, 0.4,-0.3,-0.8,
 ];
 return profile.map((v, i) => v + (sv() - 0.5) * 0.3 * (i % 3 === 0 ? 1 : 0.5));
})();

// 3-year performance: Spot ETF vs Futures ETF vs Roll-Optimized ETF
const PERF_LABELS = Array.from({ length: 37 }, (_, i) => {
 const year = 2022 + Math.floor(i / 12);
 const month = (i % 12) + 1;
 return `${year}-${String(month).padStart(2, "0")}`;
});

const PERF_SERIES = (() => {
 let spot = 100, futures = 100, optimized = 100;
 const spotArr: number[] = [100];
 const futArr: number[] = [100];
 const optArr: number[] = [100];
 for (let i = 1; i < 37; i++) {
 const mktRet = (sv() - 0.48) * 0.06;
 spot *= 1 + mktRet;
 futures *= 1 + mktRet - 0.008 + (sv() - 0.5) * 0.002; // ~-0.8% monthly roll drag
 optimized *= 1 + mktRet - 0.003 + (sv() - 0.5) * 0.002; // ~-0.3% optimized
 spotArr.push(parseFloat(spot.toFixed(2)));
 futArr.push(parseFloat(futures.toFixed(2)));
 optArr.push(parseFloat(optimized.toFixed(2)));
 }
 return { spot: spotArr, futures: futArr, optimized: optArr };
})();

// Storage cost model data
const STORAGE_COMPONENTS = [
 { label: "Physical Storage", pctAnnual: 1.2, color: "#f59e0b" },
 { label: "Insurance", pctAnnual: 0.3, color: "#3b82f6" },
 { label: "Financing (Risk-Free)", pctAnnual: 5.1, color: "#8b5cf6" },
 { label: "Convenience Yield", pctAnnual: -2.8, color: "#10b981" },
];

// Inventory level (0-100)
const INVENTORY_LEVEL = 62;

// ── Helper: SVG viewport utils ────────────────────────────────────────────────
function scaleX(i: number, total: number, w: number, pad = 40): number {
 return pad + (i / (total - 1)) * (w - pad * 2);
}
function scaleY(v: number, min: number, max: number, h: number, padT = 30, padB = 30): number {
 return padT + (1 - (v - min) / (max - min)) * (h - padT - padB);
}
function linePath(points: [number, number][]): string {
 return points
 .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
 .join("");
}

// ── Components ─────────────────────────────────────────────────────────────────

function FadeIn({
 children,
 delay = 0,
}: {
 children: React.ReactNode;
 delay?: number;
}) {
 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4, delay }}
 >
 {children}
 </motion.div>
 );
}

// ── Futures Curve SVG ─────────────────────────────────────────────────────────
function FuturesCurveChart() {
 const W = 560;
 const H = 240;
 const PAD_L = 60;
 const PAD_R = 20;
 const PAD_T = 20;
 const PAD_B = 40;

 const minP = Math.min(...CURVE_PRICES) - 0.5;
 const maxP = Math.max(...CURVE_PRICES) + 0.5;

 const xScale = (i: number) =>
 PAD_L + (i / (CURVE_PRICES.length - 1)) * (W - PAD_L - PAD_R);
 const yScale = (v: number) =>
 PAD_T + (1 - (v - minP) / (maxP - minP)) * (H - PAD_T - PAD_B);

 const pts: [number, number][] = CURVE_PRICES.map((p, i) => [xScale(i), yScale(p)]);
 const path = linePath(pts);

 // Filled area under curve
 const areaPath =
 path +
 ` L ${xScale(CURVE_PRICES.length - 1).toFixed(1)} ${(H - PAD_B).toFixed(1)} L ${PAD_L} ${(H - PAD_B).toFixed(1)} Z`;

 const yTicks = 5;
 const yStep = (maxP - minP) / (yTicks - 1);

 return (
 <div className="w-full overflow-x-auto">
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 320 }}>
 {/* Grid lines */}
 {Array.from({ length: yTicks }).map((_, i) => {
 const v = minP + i * yStep;
 const y = yScale(v);
 return (
 <g key={i}>
 <line
 x1={PAD_L}
 x2={W - PAD_R}
 y1={y}
 y2={y}
 stroke="rgba(255,255,255,0.07)"
 strokeWidth={1}
 />
 <text
 x={PAD_L - 6}
 y={y + 4}
 fontSize={10}
 fill="rgba(255,255,255,0.45)"
 textAnchor="end"
 >
 ${v.toFixed(1)}
 </text>
 </g>
 );
 })}

 {/* Area fill */}
 <path d={areaPath} fill="rgba(245,158,11,0.08)" />

 {/* Curve line */}
 <path d={path} fill="none" stroke="#f59e0b" strokeWidth={2.5} />

 {/* Front month marker */}
 <circle cx={xScale(0)} cy={yScale(CURVE_PRICES[0])} r={5} fill="#f59e0b" />
 <text
 x={xScale(0)}
 y={yScale(CURVE_PRICES[0]) - 10}
 fontSize={10}
 fill="#f59e0b"
 textAnchor="middle"
 fontWeight="600"
 >
 Front ${CURVE_PRICES[0].toFixed(2)}
 </text>

 {/* Month labels */}
 {CURVE_MONTHS.map((m, i) => (
 <text
 key={m}
 x={xScale(i)}
 y={H - PAD_B + 16}
 fontSize={9}
 fill="rgba(255,255,255,0.4)"
 textAnchor="middle"
 >
 {m}
 </text>
 ))}

 {/* Contango annotation arrow */}
 <defs>
 <marker
 id="arrowhead"
 markerWidth="6"
 markerHeight="6"
 refX="3"
 refY="3"
 orient="auto"
 >
 <path d="M0,0 L0,6 L6,3 z" fill="#f59e0b" opacity={0.7} />
 </marker>
 </defs>
 <line
 x1={xScale(0) + 8}
 y1={yScale(CURVE_PRICES[0]) - 2}
 x2={xScale(11) - 8}
 y2={yScale(CURVE_PRICES[11]) + 2}
 stroke="#f59e0b"
 strokeWidth={1}
 strokeDasharray="4 3"
 opacity={0.5}
 markerEnd="url(#arrowhead)"
 />
 <text
 x={(xScale(0) + xScale(11)) / 2}
 y={yScale((CURVE_PRICES[0] + CURVE_PRICES[11]) / 2) - 10}
 fontSize={10}
 fill="#f59e0b"
 textAnchor="middle"
 opacity={0.8}
 >
 CONTANGO +{((CURVE_PRICES[11] / CURVE_PRICES[0] - 1) * 100).toFixed(1)}%
 </text>
 </svg>
 </div>
 );
}

// ── Historical Roll Yield Bar Chart ──────────────────────────────────────────
function RollYieldBarChart() {
 const W = 680;
 const H = 220;
 const PAD_L = 52;
 const PAD_R = 12;
 const PAD_T = 20;
 const PAD_B = 56;

 const minV = Math.min(...HIST_ROLL) - 0.5;
 const maxV = Math.max(...HIST_ROLL) + 0.5;

 const innerW = W - PAD_L - PAD_R;
 const innerH = H - PAD_T - PAD_B;
 const barW = innerW / HIST_ROLL.length;
 const zeroY = PAD_T + (1 - (0 - minV) / (maxV - minV)) * innerH;

 const yTicks = [-8, -6, -4, -2, 0, 2, 4, 6].filter((v) => v >= minV - 0.5 && v <= maxV + 0.5);

 // Show every 6th label
 const labelInterval = 6;

 return (
 <div className="w-full overflow-x-auto">
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 400 }}>
 {/* Grid + Y-axis labels */}
 {yTicks.map((v) => {
 const y = PAD_T + (1 - (v - minV) / (maxV - minV)) * innerH;
 return (
 <g key={v}>
 <line
 x1={PAD_L}
 x2={W - PAD_R}
 y1={y}
 y2={y}
 stroke={v === 0 ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.07)"}
 strokeWidth={v === 0 ? 1.5 : 1}
 />
 <text
 x={PAD_L - 6}
 y={y + 4}
 fontSize={9}
 fill="rgba(255,255,255,0.4)"
 textAnchor="end"
 >
 {v > 0 ? "+" : ""}
 {v}%
 </text>
 </g>
 );
 })}

 {/* Bars */}
 {HIST_ROLL.map((v, i) => {
 const x = PAD_L + i * barW + barW * 0.1;
 const bw = barW * 0.8;
 const barH = Math.abs(v / (maxV - minV)) * innerH;
 const barY = v >= 0 ? zeroY - barH : zeroY;
 const color = v >= 0 ? "#10b981" : "#ef4444";
 return (
 <rect
 key={i}
 x={x}
 y={barY}
 width={bw}
 height={Math.max(barH, 1)}
 fill={color}
 opacity={0.75}
 rx={1}
 />
 );
 })}

 {/* X-axis labels */}
 {HIST_ROLL.map((_, i) => {
 if (i % labelInterval !== 0) return null;
 const x = PAD_L + i * barW + barW / 2;
 return (
 <text
 key={i}
 x={x}
 y={H - PAD_B + 14}
 fontSize={8}
 fill="rgba(255,255,255,0.4)"
 textAnchor="middle"
 transform={`rotate(-30,${x},${H - PAD_B + 14})`}
 >
 {HIST_MONTHS[i]}
 </text>
 );
 })}

 {/* Legend */}
 <rect x={PAD_L} y={H - 14} width={10} height={8} fill="#10b981" opacity={0.8} rx={1} />
 <text x={PAD_L + 14} y={H - 7} fontSize={9} fill="rgba(255,255,255,0.5)">
 Backwardation (positive)
 </text>
 <rect x={PAD_L + 155} y={H - 14} width={10} height={8} fill="#ef4444" opacity={0.8} rx={1} />
 <text x={PAD_L + 169} y={H - 7} fontSize={9} fill="rgba(255,255,255,0.5)">
 Contango (negative)
 </text>
 </svg>
 </div>
 );
}

// ── Performance Line Chart ───────────────────────────────────────────────────
function PerformanceChart() {
 const W = 600;
 const H = 240;
 const PAD_L = 52;
 const PAD_R = 16;
 const PAD_T = 20;
 const PAD_B = 40;

 const allVals = [...PERF_SERIES.spot, ...PERF_SERIES.futures, ...PERF_SERIES.optimized];
 const minV = Math.min(...allVals) - 2;
 const maxV = Math.max(...allVals) + 2;
 const n = PERF_SERIES.spot.length;

 const xS = (i: number) => PAD_L + (i / (n - 1)) * (W - PAD_L - PAD_R);
 const yS = (v: number) =>
 PAD_T + (1 - (v - minV) / (maxV - minV)) * (H - PAD_T - PAD_B);

 const makePath = (arr: number[]) =>
 linePath(arr.map((v, i) => [xS(i), yS(v)]));

 const yTicks = [80, 90, 100, 110, 120, 130].filter(
 (v) => v >= minV && v <= maxV
 );

 const lastIdx = n - 1;

 return (
 <div className="w-full overflow-x-auto">
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 360 }}>
 {/* Grid */}
 {yTicks.map((v) => {
 const y = yS(v);
 return (
 <g key={v}>
 <line
 x1={PAD_L}
 x2={W - PAD_R}
 y1={y}
 y2={y}
 stroke={v === 100 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)"}
 strokeWidth={v === 100 ? 1.2 : 1}
 />
 <text
 x={PAD_L - 6}
 y={y + 4}
 fontSize={9}
 fill="rgba(255,255,255,0.4)"
 textAnchor="end"
 >
 {v}
 </text>
 </g>
 );
 })}

 {/* Series */}
 <path d={makePath(PERF_SERIES.spot)} fill="none" stroke="#6366f1" strokeWidth={2} />
 <path d={makePath(PERF_SERIES.futures)} fill="none" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 3" />
 <path d={makePath(PERF_SERIES.optimized)} fill="none" stroke="#10b981" strokeWidth={2} />

 {/* End labels */}
 {[
 { arr: PERF_SERIES.spot, color: "#6366f1", label: `Spot ${PERF_SERIES.spot[lastIdx].toFixed(0)}` },
 { arr: PERF_SERIES.futures, color: "#ef4444", label: `Futures ${PERF_SERIES.futures[lastIdx].toFixed(0)}` },
 { arr: PERF_SERIES.optimized, color: "#10b981", label: `Opt. ${PERF_SERIES.optimized[lastIdx].toFixed(0)}` },
 ].map(({ arr, color, label }) => (
 <text
 key={label}
 x={xS(lastIdx) + 4}
 y={yS(arr[lastIdx]) + 4}
 fontSize={9}
 fill={color}
 fontWeight={600}
 >
 {label}
 </text>
 ))}

 {/* X-axis labels (yearly) */}
 {[0, 12, 24, 36].map((i) => (
 <text
 key={i}
 x={xS(i)}
 y={H - PAD_B + 14}
 fontSize={9}
 fill="rgba(255,255,255,0.4)"
 textAnchor="middle"
 >
 {PERF_LABELS[i]}
 </text>
 ))}

 {/* Legend */}
 {[
 { color: "#6366f1", label: "Spot ETF", dash: false },
 { color: "#ef4444", label: "Futures ETF", dash: true },
 { color: "#10b981", label: "Roll-Optimized ETF", dash: false },
 ].map(({ color, label, dash }, idx) => {
 const lx = PAD_L + idx * 160;
 return (
 <g key={label}>
 <line
 x1={lx}
 x2={lx + 16}
 y1={H - 10}
 y2={H - 10}
 stroke={color}
 strokeWidth={2}
 strokeDasharray={dash ? "4 2" : undefined}
 />
 <text x={lx + 20} y={H - 6} fontSize={9} fill="rgba(255,255,255,0.5)">
 {label}
 </text>
 </g>
 );
 })}
 </svg>
 </div>
 );
}

// ── Roll Yield Calculator ─────────────────────────────────────────────────────
function RollYieldCalculator() {
 const [days, setDays] = useState(28);
 const nearPrice = CURVE_PRICES[0];
 const farPrice = CURVE_PRICES[1];
 const annualRoll = rollYield(nearPrice, farPrice, days);
 const rollCost = farPrice - nearPrice;
 const rollCostPct = ((farPrice - nearPrice) / nearPrice) * 100;

 return (
 <div className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <Card className="bg-muted/30 border-border">
 <CardContent className="pt-4">
 <p className="text-xs text-muted-foreground mb-1">Near-Month (Front)</p>
 <p className="text-xl font-semibold text-foreground">${fmt(nearPrice)}</p>
 <p className="text-xs text-muted-foreground mt-1">{CURVE_MONTHS[0]} contract</p>
 </CardContent>
 </Card>
 <Card className="bg-muted/30 border-border">
 <CardContent className="pt-4">
 <p className="text-xs text-muted-foreground mb-1">Next-Month (Far)</p>
 <p className="text-xl font-semibold text-foreground">${fmt(farPrice)}</p>
 <p className="text-xs text-muted-foreground mt-1">{CURVE_MONTHS[1]} contract</p>
 </CardContent>
 </Card>
 <Card className="bg-muted/30 border-border">
 <CardContent className="pt-4">
 <p className="text-xs text-muted-foreground mb-1">Roll Cost</p>
 <p className={cn("text-xl font-medium", rollCost > 0 ? "text-red-400" : "text-emerald-400")}>
 {rollCost > 0 ? "-" : "+"}${Math.abs(rollCost).toFixed(2)}
 </p>
 <p className="text-xs text-muted-foreground mt-1">
 {fmtPct(rollCostPct)} per roll
 </p>
 </CardContent>
 </Card>
 </div>

 {/* Days to expiry slider */}
 <Card className="bg-muted/30 border-border">
 <CardContent className="pt-4">
 <div className="flex items-center justify-between mb-3">
 <span className="text-sm text-muted-foreground">Days to expiry: <span className="text-foreground font-semibold">{days}</span></span>
 <Badge className={cn("text-xs", annualRoll < 0 ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400")}>
 {fmtPct(annualRoll)} annualized
 </Badge>
 </div>
 <input
 type="range"
 min={1}
 max={90}
 value={days}
 onChange={(e) => setDays(Number(e.target.value))}
 className="w-full accent-amber-400 h-1.5"
 />
 <div className="flex justify-between text-xs text-muted-foreground mt-1">
 <span>1 day</span>
 <span>90 days</span>
 </div>

 <div className="mt-4 p-3 rounded-lg bg-background/50 border border-border">
 <p className="text-xs text-muted-foreground mb-2 font-medium">Roll P&L Breakdown (per 1,000 bbl contract)</p>
 <div className="space-y-1.5">
 {[
 { label: "Roll cost (price diff)", value: -rollCost * 1000, color: rollCost > 0 ? "text-red-400" : "text-emerald-400" },
 { label: "Annualized drag", value: annualRoll, isBps: true, color: annualRoll < 0 ? "text-red-400" : "text-emerald-400" },
 { label: "Monthly equivalent", value: annualRoll / 12, isBps: true, color: annualRoll / 12 < 0 ? "text-red-400" : "text-emerald-400" },
 ].map(({ label, value, isBps, color }) => (
 <div key={label} className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">{label}</span>
 <span className={cn("font-mono font-semibold", color)}>
 {isBps
 ? fmtPct(value)
 : `${value < 0 ? "-" : "+"}$${Math.abs(value).toFixed(0)}`}
 </span>
 </div>
 ))}
 </div>
 </div>
 </CardContent>
 </Card>
 </div>
 );
}

// ── Storage & Carry Model ─────────────────────────────────────────────────────
function StorageCarryModel() {
 const totalCarry = STORAGE_COMPONENTS.reduce((a, c) => a + c.pctAnnual, 0);
 const impliedFwdPrice = FRONT_PRICE * (1 + totalCarry / 100);

 return (
 <div className="space-y-4">
 {/* Cost of Carry Formula */}
 <Card className="bg-muted/30 border-border">
 <CardContent className="pt-4">
 <p className="text-xs text-muted-foreground mb-3 font-medium">Cost-of-Carry Formula</p>
 <div className="flex flex-wrap items-center gap-2 text-sm font-mono">
 <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400">F = S × e^(r+u-y)T</span>
 <span className="text-muted-foreground">where</span>
 <span className="text-xs text-muted-foreground">r = risk-free, u = storage, y = convenience yield, T = time</span>
 </div>
 <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
 {STORAGE_COMPONENTS.map((c) => (
 <div key={c.label} className="text-center p-2 rounded-lg" style={{ background: c.color + "18" }}>
 <p className="text-xs text-muted-foreground">{c.label}</p>
 <p className="font-medium text-sm" style={{ color: c.color }}>
 {c.pctAnnual > 0 ? "+" : ""}{c.pctAnnual.toFixed(1)}%/yr
 </p>
 </div>
 ))}
 </div>
 <div className="mt-3 flex items-center justify-between p-2 rounded-lg bg-background/50 border border-border">
 <span className="text-xs text-muted-foreground">Net carry cost (annualized)</span>
 <span className={cn("font-medium text-sm", totalCarry > 0 ? "text-red-400" : "text-emerald-400")}>
 {totalCarry > 0 ? "+" : ""}{totalCarry.toFixed(1)}%/yr
 </span>
 </div>
 <div className="mt-2 flex items-center justify-between p-2 rounded-lg bg-background/50 border border-border">
 <span className="text-xs text-muted-foreground">Implied 12M forward (theory)</span>
 <span className="font-medium text-sm text-amber-400">${impliedFwdPrice.toFixed(2)}</span>
 </div>
 <div className="mt-2 flex items-center justify-between p-2 rounded-lg bg-background/50 border border-border">
 <span className="text-xs text-muted-foreground">Actual 12M futures price</span>
 <span className="font-medium text-sm text-foreground">${CURVE_PRICES[11].toFixed(2)}</span>
 </div>
 </CardContent>
 </Card>

 {/* Inventory Level Impact */}
 <Card className="bg-muted/30 border-border">
 <CardContent className="pt-4">
 <div className="flex items-center gap-2 mb-3">
 <span className="text-sm font-medium">Inventory Level Impact</span>
 <Badge className="ml-auto bg-muted/10 text-foreground text-xs">
 {INVENTORY_LEVEL}% full
 </Badge>
 </div>

 {/* Inventory bar */}
 <div className="relative h-3 bg-muted rounded-full overflow-hidden mb-1">
 <div
 className="absolute left-0 top-0 h-full rounded-full bg-amber-500 transition-colors"
 style={{ width: `${INVENTORY_LEVEL}%` }}
 />
 </div>
 <div className="flex justify-between text-xs text-muted-foreground mb-4">
 <span>Low (backwardation)</span>
 <span>High (contango)</span>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
 <p className="text-xs font-semibold text-emerald-400 mb-1">Low Inventory</p>
 <p className="text-xs text-muted-foreground">
 Tight supply creates immediate demand premium. Spot price trades above futures
 (backwardation). Positive roll yield for long holders.
 </p>
 </div>
 <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/5">
 <p className="text-xs font-medium text-red-400 mb-1">High Inventory</p>
 <p className="text-xs text-muted-foreground">
 Ample supply reduces convenience yield. Storage costs dominate. Futures trade
 at premium to spot (contango). Negative roll yield for long holders.
 </p>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>
 );
}

// ── Strategy Comparison ───────────────────────────────────────────────────────
function StrategyComparison() {
 const finalSpot = PERF_SERIES.spot[PERF_SERIES.spot.length - 1];
 const finalFut = PERF_SERIES.futures[PERF_SERIES.futures.length - 1];
 const finalOpt = PERF_SERIES.optimized[PERF_SERIES.optimized.length - 1];

 const strategies = [
 {
 name: "Spot ETF",
 description: "Holds physical commodity or spot contracts. Zero roll cost but limited liquidity and storage costs passed through.",
 returnPct: finalSpot - 100,
 color: "#6366f1",
 pros: ["No roll drag", "Pure price exposure", "Simple to understand"],
 cons: ["Physical storage costs", "Limited for all commodities", "Liquidity constraints"],
 },
 {
 name: "Futures ETF",
 description: "Rolls front-month contracts monthly. Subject to full roll yield impact — negative in contango markets.",
 returnPct: finalFut - 100,
 color: "#ef4444",
 pros: ["High liquidity", "Available for all commodities", "Easy to trade"],
 cons: ["Full roll drag in contango", "Tracking error accumulates", "Benchmark deviation"],
 },
 {
 name: "Roll-Optimized ETF",
 description: "Selects contracts with least contango or most backwardation. Reduces roll cost by ~60–70% vs standard rolling.",
 returnPct: finalOpt - 100,
 color: "#10b981",
 pros: ["Minimized roll drag", "Better long-term tracking", "Active curve selection"],
 cons: ["Slightly complex execution", "May deviate from benchmarks", "Smaller fund sizes"],
 },
 ];

 return (
 <div className="space-y-4">
 <PerformanceChart />

 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
 {strategies.map((strat, i) => (
 <FadeIn key={strat.name} delay={i * 0.08}>
 <Card className="bg-muted/30 border-border h-full">
 <CardHeader className="pb-2 pt-4">
 <div className="flex items-center justify-between">
 <CardTitle className="text-sm" style={{ color: strat.color }}>
 {strat.name}
 </CardTitle>
 <Badge
 className={cn(
 "text-xs text-muted-foreground font-mono",
 strat.returnPct >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
 )}
 >
 {fmtPct(strat.returnPct)} 3yr
 </Badge>
 </div>
 </CardHeader>
 <CardContent>
 <p className="text-xs text-muted-foreground mb-3">{strat.description}</p>
 <div className="space-y-1 mb-2">
 <p className="text-xs font-medium text-emerald-400">Pros</p>
 {strat.pros.map((p) => (
 <p key={p} className="text-xs text-muted-foreground flex gap-1">
 <span className="text-emerald-400 mt-px">+</span> {p}
 </p>
 ))}
 </div>
 <div className="space-y-1">
 <p className="text-xs font-medium text-red-400">Cons</p>
 {strat.cons.map((c) => (
 <p key={c} className="text-xs text-muted-foreground flex gap-1">
 <span className="text-red-400 mt-px">−</span> {c}
 </p>
 ))}
 </div>
 </CardContent>
 </Card>
 </FadeIn>
 ))}
 </div>
 </div>
 );
}

// ── Key Metrics Bar ───────────────────────────────────────────────────────────
function MetricChip({
 icon: Icon,
 label,
 value,
 valueClass,
}: {
 icon: React.ElementType;
 label: string;
 value: string;
 valueClass?: string;
}) {
 return (
 <Card className="bg-muted/30 border-border">
 <CardContent className="pt-3 pb-3">
 <div className="flex items-center gap-2 mb-0.5">
 <span className="text-xs text-muted-foreground">{label}</span>
 </div>
 <p className={cn("text-base font-medium leading-tight", valueClass ?? "text-foreground")}>
 {value}
 </p>
 </CardContent>
 </Card>
 );
}

// ── Roll Yield Tab ────────────────────────────────────────────────────────────
function RollYieldTab() {
 return (
 <div className="space-y-4">
 <RollYieldCalculator />
 <Card className="bg-muted/30 border-border">
 <CardHeader className="pb-2 pt-4">
 <CardTitle className="text-sm">WTI Crude Monthly Roll Yield (2020–2024)</CardTitle>
 </CardHeader>
 <CardContent>
 <RollYieldBarChart />
 </CardContent>
 </Card>
 </div>
 );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function CommodityTermPage() {
 const [tab, setTab] = useState("curve");

 const isContango = CURVE_PRICES[11] > CURVE_PRICES[0];
 const annRollYield = rollYield(CURVE_PRICES[0], CURVE_PRICES[1], 28);

 return (
 <div className="p-4 md:p-4 space-y-4 max-w-6xl mx-auto">
 {/* HERO Header */}
 <FadeIn>
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4 border-l-primary rounded-md bg-card p-6">
 <div>
 <h1 className="text-xl font-semibold text-foreground">
 Commodity Term Structure &amp; Roll Yield
 </h1>
 <p className="text-sm text-muted-foreground mt-0.5">
 Contango, backwardation, roll costs &amp; storage carry — WTI Crude Oil
 </p>
 </div>
 <div className="flex items-center gap-2">
 <Badge className={cn("text-xs font-medium", isContango ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400")}>
 {isContango ? "CONTANGO" : "BACKWARDATION"}
 </Badge>
 <Badge className="bg-amber-500/20 text-amber-400 text-xs">WTI Crude</Badge>
 </div>
 </div>
 </FadeIn>

 {/* Key Metrics */}
 <FadeIn delay={0.05}>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 <MetricChip
 icon={DollarSign}
 label="Front-Month Price"
 value={`$${fmt(FRONT_PRICE)}/bbl`}
 valueClass="text-amber-400"
 />
 <MetricChip
 icon={RefreshCw}
 label="Ann. Roll Yield"
 value={fmtPct(annRollYield)}
 valueClass={pos(annRollYield)}
 />
 <MetricChip
 icon={isContango ? TrendingUp : TrendingDown}
 label="12M Futures Premium"
 value={fmtPct(((CURVE_PRICES[11] / CURVE_PRICES[0]) - 1) * 100)}
 valueClass={isContango ? "text-red-400" : "text-emerald-400"}
 />
 <MetricChip
 icon={Activity}
 label="Inventory Level"
 value={`${INVENTORY_LEVEL}% Full`}
 valueClass="text-foreground"
 />
 </div>
 </FadeIn>

 {/* Info callout */}
 <FadeIn delay={0.1}>
 <div className="flex gap-3 p-3 rounded-md border border-amber-500/30 bg-amber-500/5 text-xs text-muted-foreground">
 <span>
 <strong className="text-amber-400">Roll yield</strong> is the gain or loss from rolling an expiring futures contract into a later-dated one.
 In <strong className="text-red-400">contango</strong>, futures trade at a premium to spot — rolling forward means buying higher, causing a negative drag.
 In <strong className="text-emerald-400">backwardation</strong>, futures trade at a discount to spot — rolling creates a positive yield.
 </span>
 </div>
 </FadeIn>

 {/* Tabs */}
 <FadeIn delay={0.12}>
 <Tabs value={tab} onValueChange={setTab}>
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
 <TabsTrigger value="curve" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Futures Curve
 </TabsTrigger>
 <TabsTrigger value="roll" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Roll Yield
 </TabsTrigger>
 <TabsTrigger value="storage" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Storage &amp; Carry
 </TabsTrigger>
 <TabsTrigger value="strategy" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Strategy Impact
 </TabsTrigger>
 </TabsList>

 {/* Futures Curve Tab */}
 <TabsContent value="curve" className="data-[state=inactive]:hidden mt-4 space-y-4">
 <Card className="bg-muted/30 border-border">
 <CardHeader className="pb-2 pt-4">
 <CardTitle className="text-sm">WTI Crude Oil Forward Curve — 12 Contract Months</CardTitle>
 </CardHeader>
 <CardContent>
 <FuturesCurveChart />
 </CardContent>
 </Card>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {CURVE_MONTHS.slice(0, 12).map((m, i) => {
 const price = CURVE_PRICES[i];
 const chg = i === 0 ? 0 : ((price / CURVE_PRICES[0]) - 1) * 100;
 return (
 <div
 key={m}
 className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/20 border border-border hover:bg-muted/40 transition-colors"
 >
 <div className="flex items-center gap-2">
 <span className="text-xs font-mono text-muted-foreground w-6">{i + 1}</span>
 <span className="text-sm font-medium">{m} &apos;25</span>
 </div>
 <div className="flex items-center gap-3">
 <span className="text-sm font-mono">${fmt(price)}</span>
 {i > 0 && (
 <Badge className={cn("text-xs font-mono w-16 justify-center", chg > 0 ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400")}>
 {fmtPct(chg)}
 </Badge>
 )}
 {i === 0 && (
 <Badge className="text-xs bg-amber-500/20 text-amber-400 w-16 justify-center">FRONT</Badge>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </TabsContent>

 {/* Roll Yield Tab */}
 <TabsContent value="roll" className="data-[state=inactive]:hidden mt-4">
 <RollYieldTab />
 </TabsContent>

 {/* Storage & Carry Tab */}
 <TabsContent value="storage" className="data-[state=inactive]:hidden mt-4">
 <StorageCarryModel />
 </TabsContent>

 {/* Strategy Impact Tab */}
 <TabsContent value="strategy" className="data-[state=inactive]:hidden mt-4">
 <StrategyComparison />
 </TabsContent>
 </Tabs>
 </FadeIn>

 {/* Educational footer */}
 <FadeIn delay={0.15}>
 <Card className="bg-muted/30 border-border">
 <CardContent className="pt-4 pb-4">
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-muted-foreground">
 <div>
 <p className="font-medium text-amber-400 mb-1">Contango</p>
 <p className="text-muted-foreground">
 Futures price {">"} spot price. Occurs when storage costs exceed convenience yield.
 Long futures holders pay a rolling penalty each month. Common in oil when inventories are high.
 </p>
 </div>
 <div>
 <p className="font-medium text-emerald-400 mb-1">Backwardation</p>
 <p className="text-muted-foreground">
 Spot price {">"} futures price. Occurs when current demand outstrips immediate supply.
 Rolling forward earns a positive yield. Natural state for commodities with high convenience yield.
 </p>
 </div>
 <div>
 <p className="font-medium text-foreground mb-1">Roll Optimization</p>
 <p className="text-muted-foreground">
 By selecting contracts with the smallest contango premium, sophisticated ETFs and funds
 can reduce roll drag by 50–80%, significantly improving long-term performance vs. naive rolling.
 </p>
 </div>
 </div>
 </CardContent>
 </Card>
 </FadeIn>
 </div>
 );
}
