"use client";

import { useState, useMemo } from "react";
import {
 TrendingUp,
 TrendingDown,
 BarChart3,
 Activity,
 Brain,
 Target,
 AlertTriangle,
 ChevronRight,
 ChevronDown,
 Zap,
 Shield,
 Clock,
 Award,
 RefreshCw,
 Eye,
 Layers,
 Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Mulberry32 seeded PRNG (seed = 3141) ─────────────────────────────────────

function mulberry32(seed: number) {
 let s = seed;
 return function () {
 s += 0x6d2b79f5;
 let t = s;
 t = Math.imul(t ^ (t >>> 15), t | 1);
 t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
 return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
 };
}

// ── Shared SVG helpers ────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number) {
 return Math.max(lo, Math.min(hi, v));
}

// ── Data generation (seed = 3141) ─────────────────────────────────────────────

function generateAllData() {
 const rng = mulberry32(3141);

 // 252 days of return data
 const N = 252;

 // Portfolio and benchmark daily returns
 const portReturns: number[] = [];
 const benchReturns: number[] = [];
 for (let i = 0; i < N; i++) {
 const mkt = (rng() - 0.47) * 1.8;
 const alpha = (rng() - 0.46) * 0.6;
 portReturns.push(mkt + alpha);
 benchReturns.push(mkt + (rng() - 0.48) * 0.4);
 }

 // Waterfall decomposition (percentages, sum ≈ total)
 const waterfallItems = [
 { label: "Market Beta", value: 12.4, color: "#6366f1" },
 { label: "Alpha", value: 4.7, color: "#22c55e" },
 { label: "Sector Allocation", value: 2.1, color: "#f59e0b" },
 { label: "Stock Selection", value: 3.8, color: "#06b6d4" },
 { label: "Timing", value: -1.2, color: "#ef4444" },
 ];

 // Rolling 12M alpha
 const rollingAlpha: number[] = [];
 for (let i = 0; i < N; i++) {
 const a = (rng() - 0.44) * 3 + 0.8;
 rollingAlpha.push(a);
 }

 // IC scatter: predicted vs actual returns (50 data points)
 const icScatter: { pred: number; actual: number }[] = [];
 for (let i = 0; i < 50; i++) {
 const pred = (rng() - 0.5) * 4;
 const noise = (rng() - 0.5) * 2;
 icScatter.push({ pred, actual: pred * 0.45 + noise });
 }

 // Batting metrics
 const hitRatio = 0.54 + rng() * 0.08;
 const battingAvg = 0.52 + rng() * 0.1;
 const sluggingPct = 1.1 + rng() * 0.5;

 // Factor betas
 const factorBetas = [
 { factor: "Market (β)", beta: 0.92, tStat: 14.2, pct: 45 },
 { factor: "Size (SMB)", beta: 0.31, tStat: 2.8, pct: 8 },
 { factor: "Value (HML)", beta: 0.44, tStat: 3.9, pct: 12 },
 { factor: "Momentum (MOM)", beta: 0.22, tStat: 2.1, pct: 7 },
 { factor: "Idiosyncratic", beta: 0.0, tStat: 0.0, pct: 28 },
 ];

 // Drawdown events
 const drawdownEvents = [
 {
 id: 0,
 label: "Tech Selloff Q1",
 peak: 100,
 trough: 88.3,
 maxLoss: -11.7,
 duration: 18,
 recovery: 24,
 cause: "Rate hike fears triggered growth stock rotation",
 regime: "Rising rates",
 },
 {
 id: 1,
 label: "Earnings Miss Shock",
 peak: 100,
 trough: 93.1,
 maxLoss: -6.9,
 duration: 7,
 recovery: 11,
 cause: "Core holding NVDA missed estimates by 8%",
 regime: "Neutral",
 },
 {
 id: 2,
 label: "Macro Volatility Spike",
 peak: 100,
 trough: 85.6,
 maxLoss: -14.4,
 duration: 31,
 recovery: 47,
 cause: "CPI surprise + Fed hawkish pivot caused broad de-risking",
 regime: "High vol / bear",
 },
 {
 id: 3,
 label: "Sector Concentration Unwind",
 peak: 100,
 trough: 91.2,
 maxLoss: -8.8,
 duration: 12,
 recovery: 19,
 cause: "Overweight tech sector rotated to value/energy",
 regime: "Sector rotation",
 },
 {
 id: 4,
 label: "Liquidity Crunch",
 peak: 100,
 trough: 78.9,
 maxLoss: -21.1,
 duration: 45,
 recovery: 68,
 cause: "Margin calls forced liquidations during flash crash",
 regime: "Crisis / panic",
 },
 ];

 // Scenario comparisons
 const equityCurveActual: number[] = [100];
 const equityCurveHold2x: number[] = [100];
 const equityCurveCutLosers: number[] = [100];
 const equityCurveAddWinners: number[] = [100];
 const equityCurveHedged: number[] = [100];
 const equityCurveOptimal: number[] = [100];

 for (let i = 0; i < N; i++) {
 const r = portReturns[i] / 100;
 const mr = benchReturns[i] / 100;
 equityCurveActual.push(equityCurveActual[i] * (1 + r));
 equityCurveHold2x.push(equityCurveHold2x[i] * (1 + r * 1.18));
 equityCurveCutLosers.push(equityCurveCutLosers[i] * (1 + (r < -0.005 ? r * 0.4 : r)));
 equityCurveAddWinners.push(equityCurveAddWinners[i] * (1 + (r > 0.005 ? r * 1.35 : r)));
 equityCurveHedged.push(equityCurveHedged[i] * (1 + r - mr * 0.5));
 equityCurveOptimal.push(equityCurveOptimal[i] * (1 + Math.abs(r) * 1.1 * (rng() > 0.2 ? 1 : -0.15)));
 }

 // Behavioral scores (0–100)
 const behavioralScores = {
 patience: Math.round(58 + rng() * 20),
 discipline: Math.round(62 + rng() * 22),
 timing: Math.round(55 + rng() * 25),
 exit: Math.round(48 + rng() * 28),
 };

 // Bias scores (lower = less biased, 0–100 scale where 100 = worst bias)
 const biasScores = {
 disposition: Math.round(42 + rng() * 30),
 homeBias: Math.round(35 + rng() * 35),
 recency: Math.round(55 + rng() * 25),
 concentration: Math.round(60 + rng() * 28),
 };

 // Behavioral alpha lost
 const behavioralAlphaLost = -(2.1 + rng() * 1.8);

 return {
 portReturns,
 benchReturns,
 waterfallItems,
 rollingAlpha,
 icScatter,
 hitRatio,
 battingAvg,
 sluggingPct,
 factorBetas,
 drawdownEvents,
 equityCurveActual,
 equityCurveHold2x,
 equityCurveCutLosers,
 equityCurveAddWinners,
 equityCurveHedged,
 equityCurveOptimal,
 behavioralScores,
 biasScores,
 behavioralAlphaLost,
 };
}

// ── SVG: Waterfall chart ───────────────────────────────────────────────────────

function WaterfallChart({ items }: { items: { label: string; value: number; color: string }[] }) {
 const W = 560;
 const H = 220;
 const pad = { l: 50, r: 20, t: 20, b: 40 };
 const gW = W - pad.l - pad.r;
 const gH = H - pad.t - pad.b;

 const total = items.reduce((s, i) => s + i.value, 0);
 const allVals = items.map((i) => i.value);
 const minY = Math.min(0, ...allVals) - 1;
 const maxY = Math.max(0, total, ...allVals) + 1;

 const barW = (gW / (items.length + 1)) * 0.6;
 const barGap = gW / (items.length + 1);

 function toY(v: number) {
 return pad.t + ((maxY - v) / (maxY - minY)) * gH;
 }

 // Build running total
 let running = 0;
 const bars = items.map((item, i) => {
 const x = pad.l + barGap * (i + 0.5) - barW / 2;
 const base = running;
 running += item.value;
 const yTop = toY(item.value >= 0 ? running : base);
 const yBot = toY(item.value >= 0 ? base : running);
 return { ...item, x, yTop, yBot, base, end: running };
 });

 // Connector lines between bars
 const connectors = bars.slice(0, -1).map((bar, i) => {
 const nextBar = bars[i + 1];
 const cy = toY(bar.end);
 return (
 <line
 key={i}
 x1={bar.x + barW}
 y1={cy}
 x2={nextBar.x}
 y2={cy}
 stroke="#374151"
 strokeDasharray="3 3"
 strokeWidth={1}
 />
 );
 });

 const yZero = toY(0);
 const yLabels: number[] = [];
 for (let v = Math.ceil(minY); v <= Math.floor(maxY); v += Math.ceil((maxY - minY) / 5)) {
 yLabels.push(v);
 }

 return (
 <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
 {/* Y grid */}
 {yLabels.map((v) => (
 <g key={v}>
 <line x1={pad.l} x2={W - pad.r} y1={toY(v)} y2={toY(v)} stroke="#1f2937" strokeWidth={1} />
 <text x={pad.l - 4} y={toY(v) + 4} textAnchor="end" fontSize={9} fill="#6b7280">
 {v > 0 ? "+" : ""}{v}%
 </text>
 </g>
 ))}
 {/* Zero line */}
 <line x1={pad.l} x2={W - pad.r} y1={yZero} y2={yZero} stroke="#374151" strokeWidth={1.5} />
 {/* Connectors */}
 {connectors}
 {/* Bars */}
 {bars.map((bar) => (
 <g key={bar.label}>
 <rect
 x={bar.x}
 y={bar.yTop}
 width={barW}
 height={Math.max(1, bar.yBot - bar.yTop)}
 fill={bar.color}
 fillOpacity={0.85}
 rx={2}
 />
 <text
 x={bar.x + barW / 2}
 y={bar.value >= 0 ? bar.yTop - 4 : bar.yBot + 11}
 textAnchor="middle"
 fontSize={9}
 fill={bar.color}
 fontWeight="600"
 >
 {bar.value >= 0 ? "+" : ""}{bar.value.toFixed(1)}%
 </text>
 <text
 x={bar.x + barW / 2}
 y={H - 6}
 textAnchor="middle"
 fontSize={8}
 fill="#9ca3af"
 >
 {bar.label.split(" ").map((w, wi) => (
 <tspan key={wi} x={bar.x + barW / 2} dy={wi === 0 ? 0 : 9}>
 {w}
 </tspan>
 ))}
 </text>
 </g>
 ))}
 {/* Total bar */}
 <g>
 <rect
 x={pad.l + barGap * (items.length + 0.5) - barW / 2}
 y={toY(Math.max(0, total))}
 width={barW}
 height={Math.max(1, Math.abs(toY(0) - toY(total)))}
 fill={total >= 0 ? "#22c55e" : "#ef4444"}
 fillOpacity={0.9}
 rx={2}
 />
 <text
 x={pad.l + barGap * (items.length + 0.5)}
 y={toY(Math.max(0, total)) - 5}
 textAnchor="middle"
 fontSize={9}
 fill={total >= 0 ? "#22c55e" : "#ef4444"}
 fontWeight="700"
 >
 {total >= 0 ? "+" : ""}{total.toFixed(1)}%
 </text>
 <text
 x={pad.l + barGap * (items.length + 0.5)}
 y={H - 6}
 textAnchor="middle"
 fontSize={8}
 fill="#9ca3af"
 fontWeight="600"
 >
 Total
 </text>
 </g>
 </svg>
 );
}

// ── SVG: Rolling Alpha Line ───────────────────────────────────────────────────

function RollingAlphaChart({ data }: { data: number[] }) {
 const W = 560;
 const H = 140;
 const pad = { l: 44, r: 16, t: 16, b: 28 };
 const gW = W - pad.l - pad.r;
 const gH = H - pad.t - pad.b;

 const minV = Math.min(...data) - 0.5;
 const maxV = Math.max(...data) + 0.5;

 function toX(i: number) {
 return pad.l + (i / (data.length - 1)) * gW;
 }
 function toY(v: number) {
 return pad.t + ((maxV - v) / (maxV - minV)) * gH;
 }

 const linePath = data.map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(v)}`).join(" ");
 const areaPath = `${linePath} L ${toX(data.length - 1)} ${toY(0)} L ${toX(0)} ${toY(0)} Z`;

 const yZero = toY(0);

 return (
 <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
 <defs>
 <linearGradient id="alphaGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
 <stop offset="100%" stopColor="#6366f1" stopOpacity={0.0} />
 </linearGradient>
 </defs>
 {/* Grid */}
 {[-2, 0, 2, 4].map((v) => (
 <g key={v}>
 <line x1={pad.l} x2={W - pad.r} y1={toY(v)} y2={toY(v)} stroke="#1f2937" strokeWidth={1} />
 <text x={pad.l - 4} y={toY(v) + 4} textAnchor="end" fontSize={9} fill="#6b7280">
 {v > 0 ? "+" : ""}{v}%
 </text>
 </g>
 ))}
 {/* Zero line */}
 <line x1={pad.l} x2={W - pad.r} y1={yZero} y2={yZero} stroke="#374151" strokeWidth={1.5} />
 {/* Area */}
 <path d={areaPath} fill="url(#alphaGrad)" />
 {/* Line */}
 <path d={linePath} fill="none" stroke="#6366f1" strokeWidth={1.5} />
 {/* X labels */}
 {["Q1", "Q2", "Q3", "Q4"].map((q, i) => (
 <text
 key={q}
 x={pad.l + gW * ((i * 63 + 31) / (data.length - 1))}
 y={H - 6}
 textAnchor="middle"
 fontSize={9}
 fill="#6b7280"
 >
 {q}
 </text>
 ))}
 </svg>
 );
}

// ── SVG: IC Scatter Plot ──────────────────────────────────────────────────────

function ICScatterPlot({ data }: { data: { pred: number; actual: number }[] }) {
 const W = 280;
 const H = 220;
 const pad = { l: 40, r: 16, t: 16, b: 36 };
 const gW = W - pad.l - pad.r;
 const gH = H - pad.t - pad.b;

 const allX = data.map((d) => d.pred);
 const allY = data.map((d) => d.actual);
 const xMin = Math.min(...allX) - 0.5;
 const xMax = Math.max(...allX) + 0.5;
 const yMin = Math.min(...allY) - 0.5;
 const yMax = Math.max(...allY) + 0.5;

 function toX(v: number) {
 return pad.l + ((v - xMin) / (xMax - xMin)) * gW;
 }
 function toY(v: number) {
 return pad.t + ((yMax - v) / (yMax - yMin)) * gH;
 }

 // Linear regression
 const n = data.length;
 const sumX = allX.reduce((s, v) => s + v, 0);
 const sumY = allY.reduce((s, v) => s + v, 0);
 const sumXY = data.reduce((s, d) => s + d.pred * d.actual, 0);
 const sumX2 = allX.reduce((s, v) => s + v * v, 0);
 const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
 const intercept = (sumY - slope * sumX) / n;

 const regLine = [
 { x: xMin, y: slope * xMin + intercept },
 { x: xMax, y: slope * xMax + intercept },
 ];

 return (
 <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
 {/* Axes */}
 <line x1={pad.l} x2={W - pad.r} y1={toY(0)} y2={toY(0)} stroke="#374151" strokeWidth={1} />
 <line x1={toX(0)} x2={toX(0)} y1={pad.t} y2={H - pad.b} stroke="#374151" strokeWidth={1} />
 {/* Regression line */}
 <line
 x1={toX(regLine[0].x)}
 y1={toY(regLine[0].y)}
 x2={toX(regLine[1].x)}
 y2={toY(regLine[1].y)}
 stroke="#f59e0b"
 strokeWidth={1.5}
 strokeDasharray="4 2"
 />
 {/* Points */}
 {data.map((d, i) => (
 <circle
 key={i}
 cx={toX(d.pred)}
 cy={toY(d.actual)}
 r={3}
 fill="#6366f1"
 fillOpacity={0.7}
 stroke="#818cf8"
 strokeWidth={0.5}
 />
 ))}
 {/* Labels */}
 <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={8} fill="#6b7280">
 Predicted Return
 </text>
 <text
 x={8}
 y={H / 2}
 textAnchor="middle"
 fontSize={8}
 fill="#6b7280"
 transform={`rotate(-90, 8, ${H / 2})`}
 >
 Actual Return
 </text>
 {/* IC label */}
 <text x={W - pad.r - 2} y={pad.t + 10} textAnchor="end" fontSize={8} fill="#f59e0b" fontWeight="600">
 IC = {slope.toFixed(2)}
 </text>
 </svg>
 );
}

// ── SVG: Donut Chart ──────────────────────────────────────────────────────────

function DonutChart({
 slices,
}: {
 slices: { label: string; pct: number; color: string }[];
}) {
 const R = 70;
 const r = 40;
 const cx = 100;
 const cy = 100;
 const W = 200;
 const H = 200;

 let angle = -Math.PI / 2;
 const paths = slices.map((slice) => {
 const a = (slice.pct / 100) * 2 * Math.PI;
 const x1 = cx + R * Math.cos(angle);
 const y1 = cy + R * Math.sin(angle);
 const x2 = cx + R * Math.cos(angle + a);
 const y2 = cy + R * Math.sin(angle + a);
 const xi1 = cx + r * Math.cos(angle);
 const yi1 = cy + r * Math.sin(angle);
 const xi2 = cx + r * Math.cos(angle + a);
 const yi2 = cy + r * Math.sin(angle + a);
 const large = a > Math.PI ? 1 : 0;
 const d = `M ${xi1} ${yi1} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${r} ${r} 0 ${large} 0 ${xi1} ${yi1} Z`;
 const midAngle = angle + a / 2;
 angle += a;
 return { ...slice, d, midAngle };
 });

 return (
 <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
 {paths.map((p) => (
 <path key={p.label} d={p.d} fill={p.color} fillOpacity={0.85} stroke="#111827" strokeWidth={1.5} />
 ))}
 <text x={cx} y={cy - 4} textAnchor="middle" fontSize={11} fill="#f9fafb" fontWeight="700">
 Risk
 </text>
 <text x={cx} y={cy + 12} textAnchor="middle" fontSize={10} fill="#9ca3af">
 Sources
 </text>
 </svg>
 );
}

// ── SVG: Gauge ────────────────────────────────────────────────────────────────

function Gauge({ value, color, label }: { value: number; color: string; label: string }) {
 // value 0–100
 const cx = 60;
 const cy = 60;
 const R = 45;
 const startAngle = Math.PI;
 const endAngle = 2 * Math.PI;
 const angle = startAngle + (value / 100) * Math.PI;

 const arcX = (a: number, rad: number) => cx + rad * Math.cos(a);
 const arcY = (a: number, rad: number) => cy + rad * Math.sin(a);

 const bgPath = `M ${arcX(startAngle, R)} ${arcY(startAngle, R)} A ${R} ${R} 0 1 1 ${arcX(endAngle, R)} ${arcY(endAngle, R)}`;
 const valPath = `M ${arcX(startAngle, R)} ${arcY(startAngle, R)} A ${R} ${R} 0 ${value > 50 ? 1 : 0} 1 ${arcX(angle, R)} ${arcY(angle, R)}`;

 const needleX = cx + (R - 10) * Math.cos(angle);
 const needleY = cy + (R - 10) * Math.sin(angle);

 return (
 <svg width="120" height="80" viewBox="0 0 120 80">
 <path d={bgPath} fill="none" stroke="#1f2937" strokeWidth={10} />
 <path d={valPath} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" />
 <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#f9fafb" strokeWidth={2} strokeLinecap="round" />
 <circle cx={cx} cy={cy} r={4} fill="#f9fafb" />
 <text x={cx} y={cy + 20} textAnchor="middle" fontSize={13} fill={color} fontWeight="700">
 {value}
 </text>
 <text x={cx} y={cy + 32} textAnchor="middle" fontSize={7.5} fill="#6b7280">
 {label}
 </text>
 </svg>
 );
}

// ── SVG: Equity Curve Comparison ─────────────────────────────────────────────

interface CurveDef {
 label: string;
 data: number[];
 color: string;
 dashed?: boolean;
}

function EquityCurveChart({ curves }: { curves: CurveDef[] }) {
 const W = 560;
 const H = 200;
 const pad = { l: 48, r: 16, t: 16, b: 28 };
 const gW = W - pad.l - pad.r;
 const gH = H - pad.t - pad.b;

 const allVals = curves.flatMap((c) => c.data);
 const minV = Math.min(...allVals);
 const maxV = Math.max(...allVals);
 const N = curves[0].data.length;

 function toX(i: number) {
 return pad.l + (i / (N - 1)) * gW;
 }
 function toY(v: number) {
 return pad.t + ((maxV - v) / (maxV - minV)) * gH;
 }

 return (
 <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
 {/* Grid */}
 {[minV, (minV + maxV) / 2, maxV].map((v, i) => (
 <g key={i}>
 <line x1={pad.l} x2={W - pad.r} y1={toY(v)} y2={toY(v)} stroke="#1f2937" strokeWidth={1} />
 <text x={pad.l - 4} y={toY(v) + 4} textAnchor="end" fontSize={8} fill="#6b7280">
 {v.toFixed(0)}
 </text>
 </g>
 ))}
 {/* Curves */}
 {curves.map((curve) => {
 const path = curve.data
 .map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(v)}`)
 .join(" ");
 return (
 <path
 key={curve.label}
 d={path}
 fill="none"
 stroke={curve.color}
 strokeWidth={curve.label === "Actual" ? 2 : 1.5}
 strokeDasharray={curve.dashed ? "5 3" : undefined}
 strokeOpacity={curve.label === "Actual" ? 1 : 0.8}
 />
 );
 })}
 {/* Legend */}
 {curves.map((curve, i) => (
 <g key={curve.label} transform={`translate(${pad.l + i * 90}, ${H - 10})`}>
 <line x1={0} y1={0} x2={14} y2={0} stroke={curve.color} strokeWidth={2} strokeDasharray={curve.dashed ? "4 2" : undefined} />
 <text x={17} y={3} fontSize={7.5} fill="#9ca3af">
 {curve.label}
 </text>
 </g>
 ))}
 </svg>
 );
}

// ── SVG: Drawdown Chart ───────────────────────────────────────────────────────

function DrawdownChart({ actual, benchmark }: { actual: number[]; benchmark: number[] }) {
 const W = 560;
 const H = 160;
 const pad = { l: 44, r: 16, t: 16, b: 28 };
 const gW = W - pad.l - pad.r;
 const gH = H - pad.t - pad.b;

 // Compute drawdown series
 function toDD(series: number[]) {
 let peak = series[0];
 return series.map((v) => {
 if (v > peak) peak = v;
 return ((v - peak) / peak) * 100;
 });
 }

 const portDD = toDD(actual);
 const benchDD = toDD(benchmark);
 const allDD = [...portDD, ...benchDD];
 const minV = Math.min(...allDD) - 1;
 const N = actual.length;

 function toX(i: number) {
 return pad.l + (i / (N - 1)) * gW;
 }
 function toY(v: number) {
 return pad.t + ((0 - v) / (0 - minV)) * gH;
 }

 const portPath = portDD.map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(v)}`).join(" ");
 const areaPath = `${portPath} L ${toX(N - 1)} ${toY(0)} L ${toX(0)} ${toY(0)} Z`;
 const benchPath = benchDD.map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(v)}`).join(" ");

 const yLabels: number[] = [];
 for (let v = 0; v >= minV; v -= Math.ceil(Math.abs(minV) / 4)) {
 yLabels.push(v);
 }

 return (
 <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
 <defs>
 <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
 <stop offset="100%" stopColor="#ef4444" stopOpacity={0.0} />
 </linearGradient>
 </defs>
 {yLabels.map((v) => (
 <g key={v}>
 <line x1={pad.l} x2={W - pad.r} y1={toY(v)} y2={toY(v)} stroke="#1f2937" strokeWidth={1} />
 <text x={pad.l - 4} y={toY(v) + 4} textAnchor="end" fontSize={9} fill="#6b7280">
 {v}%
 </text>
 </g>
 ))}
 <path d={areaPath} fill="url(#ddGrad)" />
 <path d={portPath} fill="none" stroke="#ef4444" strokeWidth={1.5} />
 <path d={benchPath} fill="none" stroke="#6366f1" strokeWidth={1} strokeDasharray="4 2" />
 {/* Legend */}
 <g transform={`translate(${pad.l + 8}, ${H - 10})`}>
 <line x1={0} y1={0} x2={12} y2={0} stroke="#ef4444" strokeWidth={2} />
 <text x={15} y={3} fontSize={7.5} fill="#9ca3af">Portfolio Drawdown</text>
 </g>
 <g transform={`translate(${pad.l + 130}, ${H - 10})`}>
 <line x1={0} y1={0} x2={12} y2={0} stroke="#6366f1" strokeWidth={1.5} strokeDasharray="4 2" />
 <text x={15} y={3} fontSize={7.5} fill="#9ca3af">Benchmark Drawdown</text>
 </g>
 </svg>
 );
}

// ── Stat Chip ─────────────────────────────────────────────────────────────────

function StatChip({
 label,
 value,
 positive,
}: {
 label: string;
 value: string;
 positive?: boolean;
}) {
 return (
 <div className="flex flex-col gap-0.5 rounded-lg bg-card border border-border px-3 py-2 min-w-[100px]">
 <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
 <span
 className={cn(
 "text-sm font-semibold tabular-nums",
 positive === true ? "text-green-400" : positive === false ? "text-red-400" : "text-foreground"
 )}
 >
 {value}
 </span>
 </div>
 );
}

// ── Score Bar ─────────────────────────────────────────────────────────────────

function ScoreBar({ label, score, max = 100 }: { label: string; score: number; max?: number }) {
 const pct = (score / max) * 100;
 const color = pct >= 70 ? "bg-green-500" : pct >= 45 ? "bg-amber-500" : "bg-red-500";
 return (
 <div className="flex items-center gap-3">
 <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
 <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
 <div className={cn("h-full rounded-full transition-colors", color)} style={{ width: `${pct}%` }} />
 </div>
 <span className="text-xs font-semibold text-foreground w-8 text-right tabular-nums">{score}</span>
 </div>
 );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
 const data = useMemo(() => generateAllData(), []);
 const [selectedDrawdown, setSelectedDrawdown] = useState<number>(0);
 const [scenarioVisible, setScenarioVisible] = useState<Record<string, boolean>>({
 "Hold 2×": true,
 "Cut Losers": true,
 "Add Winners": true,
 "Hedged": false,
 "Optimal": true,
 });

 const totalReturn = data.waterfallItems.reduce((s, i) => s + i.value, 0);
 const selectedDD = data.drawdownEvents[selectedDrawdown];

 const donutSlices = [
 { label: "Market Risk", pct: 45, color: "#6366f1" },
 { label: "Size Factor", pct: 8, color: "#22c55e" },
 { label: "Value Factor", pct: 12, color: "#f59e0b" },
 { label: "Momentum", pct: 7, color: "#06b6d4" },
 { label: "Idiosyncratic", pct: 28, color: "#8b5cf6" },
 ];

 // Equity curves for scenario tab
 const scenarioCurves: CurveDef[] = [
 { label: "Actual", data: data.equityCurveActual, color: "#f9fafb" },
 ...(scenarioVisible["Hold 2×"]
 ? [{ label: "Hold 2×", data: data.equityCurveHold2x, color: "#22c55e", dashed: true }]
 : []),
 ...(scenarioVisible["Cut Losers"]
 ? [{ label: "Cut Losers", data: data.equityCurveCutLosers, color: "#06b6d4", dashed: true }]
 : []),
 ...(scenarioVisible["Add Winners"]
 ? [{ label: "Add Winners", data: data.equityCurveAddWinners, color: "#f59e0b", dashed: true }]
 : []),
 ...(scenarioVisible["Hedged"]
 ? [{ label: "Hedged", data: data.equityCurveHedged, color: "#a855f7", dashed: true }]
 : []),
 ...(scenarioVisible["Optimal"]
 ? [{ label: "Optimal", data: data.equityCurveOptimal, color: "#ef4444", dashed: true }]
 : []),
 ];

 const scenarioResults = [
 {
 key: "Hold 2×",
 label: "Hold every trade 2× longer",
 final: data.equityCurveHold2x[data.equityCurveHold2x.length - 1],
 color: "#22c55e",
 },
 {
 key: "Cut Losers",
 label: "Cut losers at −5%",
 final: data.equityCurveCutLosers[data.equityCurveCutLosers.length - 1],
 color: "#06b6d4",
 },
 {
 key: "Add Winners",
 label: "Add to winners on breakout",
 final: data.equityCurveAddWinners[data.equityCurveAddWinners.length - 1],
 color: "#f59e0b",
 },
 {
 key: "Hedged",
 label: "Market-hedge via SPY short",
 final: data.equityCurveHedged[data.equityCurveHedged.length - 1],
 color: "#a855f7",
 },
 {
 key: "Optimal",
 label: "Hindsight-optimal (oracle)",
 final: data.equityCurveOptimal[data.equityCurveOptimal.length - 1],
 color: "#ef4444",
 },
 ];

 const actualFinal = data.equityCurveActual[data.equityCurveActual.length - 1];

 const biasItems = [
 {
 key: "disposition",
 label: "Disposition Effect",
 score: data.biasScores.disposition,
 description: "Selling winners too early, holding losers too long",
 recommendation: "Set mechanical stop-losses and profit targets before entering trades",
 icon: TrendingUp,
 },
 {
 key: "homeBias",
 label: "Home Bias",
 score: data.biasScores.homeBias,
 description: "Over-concentration in familiar sectors/names",
 recommendation: "Diversify across sectors — allocate at least 30% outside top 2 sectors",
 icon: Target,
 },
 {
 key: "recency",
 label: "Recency Bias",
 score: data.biasScores.recency,
 description: "Chasing recent top performers, ignoring mean reversion",
 recommendation: "Apply a 6-month cooling-off rule before buying recent 52W highs",
 icon: Clock,
 },
 {
 key: "concentration",
 label: "Concentration Bias",
 score: data.biasScores.concentration,
 description: "Top 3 positions exceed 50% of portfolio",
 recommendation: "Cap single position at 15%; rebalance quarterly to target weights",
 icon: Layers,
 },
 ];

 return (
  <div className="flex h-full flex-col overflow-y-auto">
   <div className="mx-auto w-full max-w-5xl px-6 py-8 flex-1 flex flex-col">
    <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Analytics</h1>
    <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-6">PERFORMANCE · ATTRIBUTION · STATISTICS</p>

    <Tabs defaultValue="attribution">
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
 <TabsTrigger value="attribution" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Performance Attribution</TabsTrigger>
 <TabsTrigger value="risk" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Risk Decomposition</TabsTrigger>
 <TabsTrigger value="behavioral" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Behavioral Analytics</TabsTrigger>
 <TabsTrigger value="drawdown" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Drawdown Intelligence</TabsTrigger>
 <TabsTrigger value="scenario" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Scenario Backtesting</TabsTrigger>
 </TabsList>

 {/* ── TAB 1: Performance Attribution ──────────────────────────────────── */}
 <TabsContent value="attribution" className="data-[state=inactive]:hidden space-y-4">
 <div
 className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-2"
 >
 <StatChip label="Total Return" value={`+${totalReturn.toFixed(1)}%`} positive={true} />
 <StatChip label="Hit Ratio" value={`${(data.hitRatio * 100).toFixed(1)}%`} positive={data.hitRatio >= 0.5} />
 <StatChip label="Batting Avg" value={data.battingAvg.toFixed(3)} />
 <StatChip label="Slugging %" value={data.sluggingPct.toFixed(2)} positive={data.sluggingPct >= 1.0} />
 </div>

 {/* Waterfall */}
 <div
 >
 <Card className="bg-card border-border p-4">
 <div className="flex items-center justify-between mb-3">
 <div>
 <h3 className="text-sm font-medium text-foreground">Return Decomposition Waterfall</h3>
 <p className="text-xs text-muted-foreground mt-0.5">Total return broken into alpha sources and drags</p>
 </div>
 <Badge className="bg-green-500/15 text-green-400 border-0 text-xs">
 +{totalReturn.toFixed(1)}% Total
 </Badge>
 </div>
 <WaterfallChart items={data.waterfallItems} />
 <div className="mt-3 flex flex-wrap gap-2">
 {data.waterfallItems.map((item) => (
 <div key={item.label} className="flex items-center gap-1.5">
 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
 <span className="text-xs text-muted-foreground">{item.label}</span>
 <span className="text-xs font-medium" style={{ color: item.color }}>
 {item.value >= 0 ? "+" : ""}{item.value.toFixed(1)}%
 </span>
 </div>
 ))}
 </div>
 </Card>
 </div>

 {/* Rolling Alpha + IC Scatter */}
 <div
 className="grid grid-cols-1 lg:grid-cols-3 gap-4"
 >
 <div className="lg:col-span-2">
 <Card className="bg-card border-border p-4 h-full">
 <h3 className="text-sm font-medium text-foreground mb-1">Rolling 12-Month Alpha</h3>
 <p className="text-xs text-muted-foreground mb-3">Annualized excess return vs benchmark (252 trading days)</p>
 <RollingAlphaChart data={data.rollingAlpha} />
 </Card>
 </div>
 <div>
 <Card className="bg-card border-border p-4 h-full">
 <h3 className="text-sm font-medium text-foreground mb-1">IC Analysis</h3>
 <p className="text-xs text-muted-foreground mb-3">Predicted vs actual returns scatter</p>
 <ICScatterPlot data={data.icScatter} />
 <div className="mt-2 text-xs text-muted-foreground text-center">
 Higher IC slope = better forecasting skill
 </div>
 </Card>
 </div>
 </div>

 {/* Batting stats detail */}
 <div
 >
 <Card className="bg-card border-border p-4">
 <h3 className="text-sm font-medium text-foreground mb-3">Baseball-Style Performance Metrics</h3>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 {[
 {
 label: "Hit Ratio",
 value: `${(data.hitRatio * 100).toFixed(1)}%`,
 description: "% of active bets generating positive alpha",
 benchmark: "Good: >52%",
 good: data.hitRatio >= 0.52,
 },
 {
 label: "Batting Average",
 value: data.battingAvg.toFixed(3),
 description: "Wins ÷ total trades (like baseball batting avg)",
 benchmark: "Good: >.500",
 good: data.battingAvg >= 0.5,
 },
 {
 label: "Slugging %",
 value: data.sluggingPct.toFixed(2),
 description: "Avg gain on wins ÷ avg loss on losses",
 benchmark: "Good: >1.0",
 good: data.sluggingPct >= 1.0,
 },
 {
 label: "OPS",
 value: (data.battingAvg + data.sluggingPct).toFixed(3),
 description: "On-base + slugging (combined skill score)",
 benchmark: "Good: >1.5",
 good: data.battingAvg + data.sluggingPct >= 1.5,
 },
 ].map((m) => (
 <div key={m.label} className="rounded-lg bg-background border border-border p-3">
 <div className="flex items-center justify-between mb-1">
 <span className="text-xs text-muted-foreground uppercase tracking-wide">{m.label}</span>
 <Badge
 className={cn(
 "text-[11px] border-0 px-1.5 py-0",
 m.good ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
 )}
 >
 {m.good ? "Strong" : "Weak"}
 </Badge>
 </div>
 <div className={cn("text-xl font-semibold tabular-nums", m.good ? "text-green-400" : "text-red-400")}>
 {m.value}
 </div>
 <p className="text-xs text-muted-foreground mt-1">{m.description}</p>
 <p className="text-xs text-muted-foreground mt-0.5">{m.benchmark}</p>
 </div>
 ))}
 </div>
 </Card>
 </div>
 </TabsContent>

 {/* ── TAB 2: Risk Decomposition ────────────────────────────────────────── */}
 <TabsContent value="risk" className="data-[state=inactive]:hidden space-y-4">
 <div
 className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-2"
 >
 <StatChip label="Active Risk (TE)" value="4.2%" />
 <StatChip label="Info Ratio" value="1.12" positive={true} />
 <StatChip label="Systematic %" value="72%" />
 <StatChip label="Idiosyncratic %" value="28%" />
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 {/* Donut */}
 <div
 >
 <Card className="bg-card border-border p-4 h-full">
 <h3 className="text-sm font-medium text-foreground mb-1">Portfolio Variance Decomposition</h3>
 <p className="text-xs text-muted-foreground mb-4">Sources of total portfolio risk</p>
 <div className="flex items-center gap-3">
 <div className="w-[200px] shrink-0">
 <DonutChart slices={donutSlices} />
 </div>
 <div className="flex flex-col gap-2.5 flex-1">
 {donutSlices.map((s) => (
 <div key={s.label} className="flex items-center gap-2">
 <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
 <span className="text-xs text-muted-foreground flex-1">{s.label}</span>
 <div className="flex-1 max-w-[80px]">
 <Progress value={s.pct} className="h-1.5 bg-muted" />
 </div>
 <span className="text-xs font-medium text-foreground tabular-nums w-8 text-right">
 {s.pct}%
 </span>
 </div>
 ))}
 </div>
 </div>
 </Card>
 </div>

 {/* Factor betas table */}
 <div
 >
 <Card className="bg-card border-border p-4 h-full">
 <h3 className="text-sm font-medium text-foreground mb-1">Factor Beta Loadings</h3>
 <p className="text-xs text-muted-foreground mb-3">t-stat &gt; 2.0 indicates statistical significance</p>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left py-2 text-muted-foreground font-medium">Factor</th>
 <th className="text-right py-2 text-muted-foreground font-medium">Beta</th>
 <th className="text-right py-2 text-muted-foreground font-medium">t-stat</th>
 <th className="text-right py-2 text-muted-foreground font-medium">Sig.</th>
 <th className="text-right py-2 text-muted-foreground font-medium">% Variance</th>
 </tr>
 </thead>
 <tbody>
 {data.factorBetas.map((f) => (
 <tr key={f.factor} className="border-b border-border">
 <td className="py-2 text-foreground font-medium">{f.factor}</td>
 <td className="py-2 text-right text-foreground tabular-nums">
 {f.factor === "Idiosyncratic" ? "—" : f.beta.toFixed(2)}
 </td>
 <td className="py-2 text-right tabular-nums">
 <span
 className={cn(
 f.tStat === 0 ? "text-muted-foreground" : f.tStat >= 2.0 ? "text-green-400" : "text-amber-400"
 )}
 >
 {f.tStat === 0 ? "—" : f.tStat.toFixed(1)}
 </span>
 </td>
 <td className="py-2 text-right">
 {f.tStat === 0 ? (
 <span className="text-muted-foreground text-xs">—</span>
 ) : f.tStat >= 2.0 ? (
 <Badge className="bg-green-500/15 text-green-400 border-0 text-[11px] px-1.5 py-0">***</Badge>
 ) : (
 <Badge className="bg-amber-500/15 text-amber-400 border-0 text-[11px] px-1.5 py-0">*</Badge>
 )}
 </td>
 <td className="py-2 text-right text-muted-foreground tabular-nums">{f.pct}%</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </Card>
 </div>
 </div>

 {/* TE Decomposition */}
 <div
 >
 <Card className="bg-card border-border p-4">
 <h3 className="text-sm font-medium text-foreground mb-1">Tracking Error Decomposition</h3>
 <p className="text-xs text-muted-foreground mb-4">
 Active risk (TE = 4.2% annualized) broken into sources vs benchmark
 </p>
 <div className="grid grid-cols-3 gap-4">
 {[
 { label: "Sector Bets", te: 1.8, pct: 43, color: "#6366f1", description: "Over/underweight sector allocation vs index" },
 { label: "Stock Bets", te: 1.6, pct: 38, color: "#22c55e", description: "Individual stock selection vs benchmark constituents" },
 { label: "Factor Tilts", te: 0.8, pct: 19, color: "#f59e0b", description: "Style/factor exposure mismatch (value, momentum, size)" },
 ].map((item) => (
 <div key={item.label} className="rounded-lg bg-background border border-border p-3 text-center">
 <div className="text-xs text-muted-foreground mb-2">{item.label}</div>
 <div className="text-2xl font-semibold tabular-nums" style={{ color: item.color }}>
 {item.te.toFixed(1)}%
 </div>
 <div className="text-xs text-muted-foreground mt-0.5">TE contribution</div>
 <div className="mt-2">
 <Progress value={item.pct} className="h-1.5 bg-muted" />
 </div>
 <div className="text-xs text-muted-foreground mt-1">{item.pct}% of total TE</div>
 <p className="text-xs text-muted-foreground mt-2 leading-tight">{item.description}</p>
 </div>
 ))}
 </div>
 </Card>
 </div>
 </TabsContent>

 {/* ── TAB 3: Behavioral Analytics ─────────────────────────────────────── */}
 <TabsContent value="behavioral" className="data-[state=inactive]:hidden space-y-4">
 <div
 >
 <Card className="bg-card border-border p-4">
 <div className="flex items-center justify-between mb-4">
 <div>
 <h3 className="text-sm font-medium text-foreground">Trading Behavior Scorecards</h3>
 <p className="text-xs text-muted-foreground mt-0.5">Derived from simulated trade history analysis</p>
 </div>
 <div className="text-right">
 <div className="text-xs text-muted-foreground">Behavioral Alpha Lost</div>
 <div className="text-lg font-medium text-red-400 tabular-nums">
 {data.behavioralAlphaLost.toFixed(1)}%
 </div>
 </div>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
 {[
 {
 label: "Patience",
 score: data.behavioralScores.patience,
 description: "Avg holding period vs optimal",
 icon: Clock,
 },
 {
 label: "Discipline",
 score: data.behavioralScores.discipline,
 description: "% trades matching stated strategy rules",
 icon: Shield,
 },
 {
 label: "Timing",
 score: data.behavioralScores.timing,
 description: "Buy timing vs support levels",
 icon: Target,
 },
 {
 label: "Exit Quality",
 score: data.behavioralScores.exit,
 description: "% profits captured (vs leaving on table)",
 icon: Award,
 },
 ].map((item) => {
 const Icon = item.icon;
 const color =
 item.score >= 70 ? "text-green-400" : item.score >= 50 ? "text-amber-400" : "text-red-400";
 const bgColor =
 item.score >= 70
 ? "bg-green-500/10 border-green-800/50"
 : item.score >= 50
 ? "bg-amber-500/10 border-amber-800/50"
 : "bg-red-500/5 border-red-800/50";
 return (
 <div key={item.label} className={cn("rounded-md border p-3 text-center", bgColor)}>
 <Icon className={cn("w-4 h-4 mx-auto mb-1.5", color)} />
 <div className={cn("text-lg font-medium tabular-nums", color)}>{item.score}</div>
 <div className="text-xs font-medium text-foreground mt-0.5">{item.label}</div>
 <p className="text-xs text-muted-foreground mt-1 leading-tight">{item.description}</p>
 </div>
 );
 })}
 </div>
 <div className="space-y-2.5">
 <ScoreBar label="Patience" score={data.behavioralScores.patience} />
 <ScoreBar label="Discipline" score={data.behavioralScores.discipline} />
 <ScoreBar label="Timing" score={data.behavioralScores.timing} />
 <ScoreBar label="Exit Quality" score={data.behavioralScores.exit} />
 </div>
 </Card>
 </div>

 {/* Bias Detection */}
 <div
 >
 <Card className="bg-card border-border p-4">
 <div className="flex items-center gap-2 mb-4">
 <AlertTriangle className="w-4 h-4 text-amber-400" />
 <h3 className="text-sm font-medium text-foreground">Cognitive Bias Detection Dashboard</h3>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {biasItems.map((bias) => {
 const Icon = bias.icon;
 const isHighBias = bias.score >= 60;
 const isMedBias = bias.score >= 40 && bias.score < 60;
 const gaugeColor = isHighBias ? "#ef4444" : isMedBias ? "#f59e0b" : "#22c55e";
 const biasLabel = isHighBias ? "High Bias" : isMedBias ? "Moderate" : "Low Bias";
 return (
 <div
 key={bias.key}
 className="rounded-lg bg-background border border-border p-3 flex gap-3 items-start"
 >
 <div className="shrink-0">
 <Gauge value={bias.score} color={gaugeColor} label={biasLabel} />
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1">
 <Icon className="w-3.5 h-3.5 text-muted-foreground" />
 <span className="text-xs font-medium text-foreground">{bias.label}</span>
 <Badge
 className={cn(
 "text-[11px] border-0 px-1.5 py-0 ml-auto",
 isHighBias
 ? "bg-red-500/15 text-red-400"
 : isMedBias
 ? "bg-amber-500/15 text-amber-400"
 : "bg-green-500/15 text-green-400"
 )}
 >
 {biasLabel}
 </Badge>
 </div>
 <p className="text-xs text-muted-foreground leading-tight mb-2">{bias.description}</p>
 <div className="rounded bg-indigo-500/10 border border-indigo-800/40 p-2">
 <p className="text-xs text-indigo-300 leading-tight">
 <span className="font-medium">Fix: </span>
 {bias.recommendation}
 </p>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </Card>
 </div>

 {/* Behavioral Alpha Summary */}
 <div
 >
 <Card className="bg-card border-border p-4">
 <h3 className="text-sm font-medium text-foreground mb-3">Behavioral Alpha Estimate</h3>
 <div className="grid grid-cols-3 gap-3">
 {[
 {
 label: "Disposition Cost",
 value: "-0.8%",
 color: "text-red-400",
 description: "Lost from selling winners early",
 },
 {
 label: "Recency Chasing",
 value: "-0.6%",
 color: "text-red-400",
 description: "Buying recent highfliers at peak",
 },
 {
 label: "Concentration Drag",
 value: "-0.7%",
 color: "text-red-400",
 description: "Excess risk without commensurate return",
 },
 ].map((item) => (
 <div key={item.label} className="rounded-lg bg-background border border-red-900/30 p-3">
 <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{item.label}</div>
 <div className={cn("text-xl font-medium tabular-nums", item.color)}>{item.value}</div>
 <p className="text-xs text-muted-foreground mt-1 leading-tight">{item.description}</p>
 </div>
 ))}
 </div>
 <div className="mt-3 rounded-lg bg-red-500/5 border border-red-800/40 p-3 flex items-center gap-3">
 <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
 <div>
 <p className="text-xs font-medium text-red-300">
 Total behavioral alpha drag: {data.behavioralAlphaLost.toFixed(1)}% annualized
 </p>
 <p className="text-xs text-muted-foreground mt-0.5">
 Correcting cognitive biases could recover approximately this much return per year
 </p>
 </div>
 </div>
 </Card>
 </div>
 </TabsContent>

 {/* ── TAB 4: Drawdown Intelligence ────────────────────────────────────── */}
 <TabsContent value="drawdown" className="data-[state=inactive]:hidden space-y-4">
 <div
 className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-2"
 >
 <StatChip label="Max Drawdown" value="-21.1%" positive={false} />
 <StatChip label="Avg Recovery (days)" value="33.8" />
 <StatChip label="Recovery Ratio" value="0.68" />
 <StatChip label="PTSD Metric" value="2.4×" positive={false} />
 </div>

 {/* Drawdown chart */}
 <div
 >
 <Card className="bg-card border-border p-4">
 <h3 className="text-sm font-medium text-foreground mb-1">Peak-to-Trough Drawdown Analysis</h3>
 <p className="text-xs text-muted-foreground mb-3">Portfolio vs benchmark drawdown profile over 252-day window</p>
 <DrawdownChart actual={data.equityCurveActual} benchmark={data.equityCurveHedged} />
 </Card>
 </div>

 {/* Drawdown event selector */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 <div
 >
 <Card className="bg-card border-border p-4 h-full">
 <h3 className="text-sm font-medium text-foreground mb-3">Top 5 Drawdown Events</h3>
 <div className="space-y-2">
 {data.drawdownEvents.map((evt, i) => (
 <button
 key={evt.id}
 onClick={() => setSelectedDrawdown(i)}
 className={cn(
 "w-full rounded-lg border p-2.5 text-left transition-colors",
 selectedDrawdown === i
 ? "bg-indigo-500/15 border-indigo-600/50"
 : "bg-background border-border hover:border-border"
 )}
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <span
 className={cn(
 "text-xs text-muted-foreground font-medium w-5 h-5 rounded flex items-center justify-center",
 selectedDrawdown === i ? "bg-indigo-600 text-foreground" : "bg-muted text-muted-foreground"
 )}
 >
 {i + 1}
 </span>
 <span className="text-xs font-medium text-foreground">{evt.label}</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-xs font-medium text-red-400 tabular-nums">{evt.maxLoss.toFixed(1)}%</span>
 <ChevronRight
 className={cn(
 "w-3 h-3 transition-transform",
 selectedDrawdown === i ? "text-indigo-400 rotate-90" : "text-muted-foreground"
 )}
 />
 </div>
 </div>
 <div className="flex items-center gap-3 mt-1.5 pl-7">
 <span className="text-xs text-muted-foreground">{evt.duration}d duration</span>
 <span className="text-xs text-muted-foreground">•</span>
 <span className="text-xs text-muted-foreground">{evt.recovery}d recovery</span>
 <Badge className="bg-muted text-muted-foreground border-0 text-[11px] px-1.5 py-0 ml-auto">
 {evt.regime}
 </Badge>
 </div>
 </button>
 ))}
 </div>
 </Card>
 </div>

 {/* Selected drawdown detail */}
 <div
 >
 
 <div
 key={selectedDrawdown}
 >
 <Card className="bg-card border-border p-4 h-full">
 <div className="flex items-center gap-2 mb-3">
 <TrendingDown className="w-4 h-4 text-red-400" />
 <h3 className="text-sm font-medium text-foreground">{selectedDD.label}</h3>
 </div>
 <div className="grid grid-cols-2 gap-2 mb-4">
 {[
 { label: "Max Loss", value: `${selectedDD.maxLoss.toFixed(1)}%`, color: "text-red-400" },
 { label: "Duration", value: `${selectedDD.duration} days`, color: "text-foreground" },
 { label: "Recovery Time", value: `${selectedDD.recovery} days`, color: "text-amber-400" },
 { label: "Market Regime", value: selectedDD.regime, color: "text-indigo-400" },
 ].map((m) => (
 <div key={m.label} className="rounded bg-background border border-border p-2">
 <div className="text-xs text-muted-foreground">{m.label}</div>
 <div className={cn("text-sm font-medium mt-0.5", m.color)}>{m.value}</div>
 </div>
 ))}
 </div>
 <div className="rounded-lg bg-background border border-border p-3 mb-3">
 <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Root Cause</div>
 <p className="text-xs text-muted-foreground leading-relaxed">{selectedDD.cause}</p>
 </div>
 <div className="space-y-2">
 <div className="flex items-center gap-2">
 <Eye className="w-3.5 h-3.5 text-muted-foreground" />
 <span className="text-xs text-muted-foreground">Recovery Ratio vs Market</span>
 <span className="text-xs font-medium text-foreground ml-auto">
 {(selectedDD.duration / selectedDD.recovery).toFixed(2)}×
 </span>
 </div>
 <div className="h-1.5 bg-muted rounded-full overflow-hidden">
 <div
 className="h-full rounded-full bg-indigo-500"
 style={{ width: `${clamp((selectedDD.duration / selectedDD.recovery) * 60, 5, 100)}%` }}
 />
 </div>
 <p className="text-xs text-muted-foreground">
 Higher ratio = faster recovery relative to how long drawdown lasted
 </p>
 </div>
 </Card>
 </div>
 
 </div>
 </div>

 {/* Drawdown clustering */}
 <div
 >
 <Card className="bg-card border-border p-4">
 <h3 className="text-sm font-medium text-foreground mb-1">Drawdown Clustering by Market Regime</h3>
 <p className="text-xs text-muted-foreground mb-3">
 PTSD (Peak-to-Subsequent-Drawdown) metric: 2.4× — you are taking more risk than realized max loss suggests
 </p>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 {[
 { regime: "Rising Rates", count: 1, avgLoss: 11.7, color: "#f59e0b" },
 { regime: "High Vol / Bear", count: 2, avgLoss: 17.8, color: "#ef4444" },
 { regime: "Sector Rotation", count: 1, avgLoss: 8.8, color: "#6366f1" },
 { regime: "Crisis / Panic", count: 1, avgLoss: 21.1, color: "#dc2626" },
 ].map((r) => (
 <div key={r.regime} className="rounded-lg bg-background border border-border p-3">
 <div className="flex items-center gap-1.5 mb-1">
 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
 <span className="text-xs text-muted-foreground">{r.regime}</span>
 </div>
 <div className="text-lg font-medium text-red-400 tabular-nums">−{r.avgLoss.toFixed(1)}%</div>
 <div className="text-xs text-muted-foreground mt-0.5">avg max loss</div>
 <div className="text-xs text-muted-foreground mt-1">{r.count} event{r.count > 1 ? "s" : ""}</div>
 </div>
 ))}
 </div>
 </Card>
 </div>
 </TabsContent>

 {/* ── TAB 5: Scenario Backtesting ──────────────────────────────────────── */}
 <TabsContent value="scenario" className="data-[state=inactive]:hidden space-y-4">
 <div
 >
 <Card className="bg-card border-border p-4">
 <div className="flex items-center justify-between mb-4">
 <div>
 <h3 className="text-sm font-medium text-foreground">What-If Machine — Scenario Equity Curves</h3>
 <p className="text-xs text-muted-foreground mt-0.5">Toggle scenarios to compare against your actual performance</p>
 </div>
 <div className="flex flex-wrap gap-1.5">
 {scenarioResults.map((s) => (
 <button
 key={s.key}
 onClick={() =>
 setScenarioVisible((prev) => ({ ...prev, [s.key]: !prev[s.key] }))
 }
 className={cn(
 "text-xs text-muted-foreground rounded-full px-2.5 py-0.5 border transition-colors font-medium",
 scenarioVisible[s.key]
 ? "border-transparent text-foreground"
 : "bg-background border-border text-muted-foreground"
 )}
 style={
 scenarioVisible[s.key]
 ? { backgroundColor: s.color + "33", borderColor: s.color, color: s.color }
 : undefined
 }
 >
 {s.key}
 </button>
 ))}
 </div>
 </div>
 <EquityCurveChart curves={scenarioCurves} />
 </Card>
 </div>

 {/* Scenario results table */}
 <div
 >
 <Card className="bg-card border-border p-4">
 <h3 className="text-sm font-medium text-foreground mb-3">Scenario Return Comparison</h3>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left py-2 text-muted-foreground font-medium">Scenario</th>
 <th className="text-right py-2 text-muted-foreground font-medium">Final Value</th>
 <th className="text-right py-2 text-muted-foreground font-medium">Return</th>
 <th className="text-right py-2 text-muted-foreground font-medium">vs Actual</th>
 <th className="text-left py-2 text-muted-foreground font-medium">Rule</th>
 </tr>
 </thead>
 <tbody>
 {/* Actual row */}
 <tr className="border-b border-border bg-muted/20">
 <td className="py-2.5">
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 rounded-full bg-muted-foreground" />
 <span className="font-medium text-foreground">Actual</span>
 </div>
 </td>
 <td className="py-2.5 text-right tabular-nums text-foreground">${actualFinal.toFixed(2)}</td>
 <td className="py-2.5 text-right tabular-nums text-foreground">
 {((actualFinal / 100 - 1) * 100).toFixed(1)}%
 </td>
 <td className="py-2.5 text-right text-muted-foreground">—</td>
 <td className="py-2.5 text-muted-foreground">Baseline (your trades)</td>
 </tr>
 {scenarioResults.map((s) => {
 const ret = ((s.final / 100 - 1) * 100).toFixed(1);
 const diff = ((s.final - actualFinal) / actualFinal) * 100;
 const pos = diff >= 0;
 return (
 <tr key={s.key} className="border-b border-border">
 <td className="py-2.5">
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
 <span className="text-foreground">{s.key}</span>
 </div>
 </td>
 <td className="py-2.5 text-right tabular-nums text-foreground">${s.final.toFixed(2)}</td>
 <td className="py-2.5 text-right tabular-nums text-foreground">{ret}%</td>
 <td className={cn("py-2.5 text-right tabular-nums font-medium", pos ? "text-green-400" : "text-red-400")}>
 {pos ? "+" : ""}{diff.toFixed(1)}%
 </td>
 <td className="py-2.5 text-muted-foreground text-xs">{s.label}</td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </Card>
 </div>

 {/* Regret minimization */}
 <div
 >
 <Card className="bg-card border-border p-4">
 <h3 className="text-sm font-medium text-foreground mb-3">Regret Minimization — Key Decision Impact</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {[
 {
 decision: "Sold NVDA after +18%",
 impact: "+6.4%",
 type: "cost",
 detail: "Position ran to +42% over next 60 days. Missed $2,840 gain.",
 label: "Opportunity Cost",
 },
 {
 decision: "Held TSLA through -22%",
 impact: "-3.8%",
 type: "cost",
 detail: "Stop loss at -10% would have saved $1,520 on this position.",
 label: "Risk Management Miss",
 },
 {
 decision: "Added to AAPL at breakout",
 impact: "+2.1%",
 type: "gain",
 detail: "Correctly sized up on confirmation. Added $940 in return.",
 label: "Best Decision",
 },
 {
 decision: "Concentrated 40% in tech Q1",
 impact: "-4.2%",
 type: "cost",
 detail: "Sector rotation would have been mitigated with 20% max sector cap.",
 label: "Concentration Cost",
 },
 ].map((item) => (
 <div
 key={item.decision}
 className={cn(
 "rounded-lg border p-3",
 item.type === "cost"
 ? "bg-red-500/5 border-red-900/40"
 : "bg-green-500/5 border-green-900/40"
 )}
 >
 <div className="flex items-center justify-between mb-1">
 <Badge
 className={cn(
 "text-[11px] border-0 px-1.5 py-0",
 item.type === "cost" ? "bg-red-500/15 text-red-400" : "bg-green-500/15 text-green-400"
 )}
 >
 {item.label}
 </Badge>
 <span
 className={cn(
 "text-sm font-medium tabular-nums",
 item.type === "cost" ? "text-red-400" : "text-green-400"
 )}
 >
 {item.impact}
 </span>
 </div>
 <div className="text-xs font-medium text-foreground mb-1">{item.decision}</div>
 <p className="text-xs text-muted-foreground leading-tight">{item.detail}</p>
 </div>
 ))}
 </div>
 <div className="mt-3 rounded-lg bg-indigo-500/10 border border-indigo-800/40 p-3">
 <div className="flex items-center gap-2 mb-1">
 <Cpu className="w-3.5 h-3.5 text-indigo-400" />
 <span className="text-xs font-medium text-indigo-300">Optimal Hindsight Strategy</span>
 <span className="text-xs font-medium text-green-400 ml-auto tabular-nums">
 +{(((data.equityCurveOptimal[data.equityCurveOptimal.length - 1] / 100 - 1) * 100)).toFixed(1)}% return
 </span>
 </div>
 <p className="text-xs text-muted-foreground leading-tight">
 With perfect hindsight over 252 days. The gap between this and your actual return ({((actualFinal / 100 - 1) * 100).toFixed(1)}%) represents the maximum possible improvement from better decisions.
 </p>
 </div>
 </Card>
 </div>
 </TabsContent>
 </Tabs>
 </div>
 </div>
 );
}
