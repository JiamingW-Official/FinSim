"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
 Activity,
 Brain,
 Zap,
 BarChart3,
 TrendingUp,
 TrendingDown,
 Target,
 Layers,
 Cpu,
 GitMerge,
 AlertTriangle,
 CheckCircle,
 Clock,
 DollarSign,
 ArrowRight,
 Shuffle,
 SlidersHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 951;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};
function resetSeed() {
 s = 951;
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface PairData {
 ticker1: string;
 ticker2: string;
 correlation: number;
 cointegP: number;
 halfLife: number;
 sharpe: number;
 hitRate: number;
 avgHoldDays: number;
}

interface MLModel {
 name: string;
 features: string[];
 ic: number;
 icir: number;
 sharpe: number;
 maxDD: number;
 overfit: "low" | "medium" | "high";
 color: string;
}

interface ExecutionAlgo {
 name: string;
 fullName: string;
 objective: string;
 bestFor: string;
 avgPI: number;
 complexity: "low" | "medium" | "high";
 color: string;
}

interface MMRegime {
 regime: string;
 spread: number;
 inventory: number;
 pnl: number;
 adverseSelCost: number;
 color: string;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const PAIRS: PairData[] = [
 { ticker1: "GS", ticker2: "MS", correlation: 0.91, cointegP: 0.018, halfLife: 8.3, sharpe: 1.42, hitRate: 0.61, avgHoldDays: 6.2 },
 { ticker1: "XOM", ticker2: "CVX", correlation: 0.88, cointegP: 0.031, halfLife: 12.1, sharpe: 1.18, hitRate: 0.58, avgHoldDays: 9.4 },
 { ticker1: "JPM", ticker2: "BAC", correlation: 0.86, cointegP: 0.044, halfLife: 15.7, sharpe: 0.97, hitRate: 0.56, avgHoldDays: 11.8 },
 { ticker1: "COST", ticker2: "WMT", correlation: 0.79, cointegP: 0.067, halfLife: 22.4, sharpe: 0.74, hitRate: 0.53, avgHoldDays: 18.3 },
 { ticker1: "AMZN", ticker2: "MSFT", correlation: 0.74, cointegP: 0.112, halfLife: 31.6, sharpe: 0.48, hitRate: 0.51, avgHoldDays: 25.1 },
];

const ML_MODELS: MLModel[] = [
 {
 name: "Gradient Boosting (XGBoost)",
 features: ["12m-1m momentum", "book-to-market", "ROE", "realised vol"],
 ic: 0.048,
 icir: 1.31,
 sharpe: 1.54,
 maxDD: -8.2,
 overfit: "medium",
 color: "text-emerald-400",
 },
 {
 name: "Random Forest",
 features: ["3m momentum", "gross margin", "accruals", "short interest"],
 ic: 0.039,
 icir: 1.12,
 sharpe: 1.28,
 maxDD: -9.7,
 overfit: "low",
 color: "text-sky-400",
 },
 {
 name: "LSTM Neural Net",
 features: ["price sequence (60d)", "volume", "macd", "rsi"],
 ic: 0.031,
 icir: 0.84,
 sharpe: 0.92,
 maxDD: -14.3,
 overfit: "high",
 color: "text-primary",
 },
 {
 name: "FinBERT Sentiment",
 features: ["news tone", "earnings call tone", "analyst revision", "social vol"],
 ic: 0.029,
 icir: 0.76,
 sharpe: 0.81,
 maxDD: -11.6,
 overfit: "medium",
 color: "text-amber-400",
 },
];

const EXEC_ALGOS: ExecutionAlgo[] = [
 {
 name: "VWAP",
 fullName: "Volume-Weighted Average Price",
 objective: "Match VWAP benchmark",
 bestFor: "Medium orders, liquid names",
 avgPI: 4.2,
 complexity: "low",
 color: "text-sky-400",
 },
 {
 name: "TWAP",
 fullName: "Time-Weighted Average Price",
 objective: "Slice evenly over time",
 bestFor: "Illiquid names, reduce signalling",
 avgPI: 5.8,
 complexity: "low",
 color: "text-emerald-400",
 },
 {
 name: "IS",
 fullName: "Implementation Shortfall",
 objective: "Minimise total cost vs arrival",
 bestFor: "Urgent alpha, large cap",
 avgPI: 3.1,
 complexity: "high",
 color: "text-primary",
 },
 {
 name: "POV",
 fullName: "Percentage of Volume",
 objective: "Participate at X% of market vol",
 bestFor: "Stealth liquidations",
 avgPI: 4.9,
 complexity: "medium",
 color: "text-amber-400",
 },
 {
 name: "Almgren-Chriss",
 fullName: "Optimal Execution (AC Model)",
 objective: "Minimise E[cost] + λ·Var[cost]",
 bestFor: "Block liquidations with risk budget",
 avgPI: 2.7,
 complexity: "high",
 color: "text-rose-400",
 },
];

const MM_REGIMES: MMRegime[] = [
 { regime: "Low-Vol Trending", spread: 0.8, inventory: 12, pnl: 1840, adverseSelCost: 310, color: "text-emerald-400" },
 { regime: "Range-Bound", spread: 1.1, inventory: 7, pnl: 2640, adverseSelCost: 210, color: "text-sky-400" },
 { regime: "High-Vol Trending", spread: 2.4, inventory: 34, pnl: -420, adverseSelCost: 1860, color: "text-rose-400" },
 { regime: "News Shock", spread: 5.8, inventory: 52, pnl: -1940, adverseSelCost: 3420, color: "text-red-500" },
];

// ── Helper ────────────────────────────────────────────────────────────────────

function complexityColor(c: "low" | "medium" | "high") {
 return c === "low" ? "text-emerald-400" : c === "medium" ? "text-amber-400" : "text-rose-400";
}

function overfitColor(o: "low" | "medium" | "high") {
 return o === "low" ? "text-emerald-400" : o === "medium" ? "text-amber-400" : "text-rose-400";
}

// ── Z-Score SVG ───────────────────────────────────────────────────────────────

function ZScoreSVG() {
 const W = 520;
 const H = 180;
 const pad = { l: 40, r: 16, t: 16, b: 32 };
 const iW = W - pad.l - pad.r;
 const iH = H - pad.t - pad.b;

 const points = useMemo(() => {
 resetSeed();
 const pts: number[] = [];
 let z = 0;
 for (let i = 0; i < 120; i++) {
 z = z * 0.88 + (rand() - 0.5) * 1.2;
 pts.push(z);
 }
 return pts;
 }, []);

 const minZ = -3.2;
 const maxZ = 3.2;
 const scaleX = (i: number) => pad.l + (i / (points.length - 1)) * iW;
 const scaleY = (v: number) => pad.t + ((maxZ - v) / (maxZ - minZ)) * iH;

 const polyline = points.map((v, i) => `${scaleX(i)},${scaleY(v)}`).join(" ");

 const entryLong = points.map((v, i) => ({ i, v })).filter((p) => p.v < -2.0);
 const exitLong = points.map((v, i) => ({ i, v })).filter((p) => p.v > -0.5 && p.v < 0.5 && p.i > 10);

 const yLevels = [
 { label: "+2σ", v: 2.0, color: "#f87171", dash: "4 2" },
 { label: "+1σ", v: 1.0, color: "#94a3b8", dash: "2 2" },
 { label: "0", v: 0, color: "#64748b", dash: "" },
 { label: "-1σ", v: -1.0, color: "#94a3b8", dash: "2 2" },
 { label: "-2σ", v: -2.0, color: "#34d399", dash: "4 2" },
 ];

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
 {/* Grid lines */}
 {yLevels.map(({ label, v, color, dash }) => {
 const y = scaleY(v);
 return (
 <g key={label}>
 <line
 x1={pad.l}
 y1={y}
 x2={W - pad.r}
 y2={y}
 stroke={color}
 strokeWidth={v === 0 ? 1.5 : 0.8}
 strokeDasharray={dash}
 opacity={0.6}
 />
 <text x={pad.l - 4} y={y + 4} fill={color} fontSize={9} textAnchor="end">
 {label}
 </text>
 </g>
 );
 })}

 {/* Entry / exit bands */}
 <rect
 x={pad.l}
 y={scaleY(-2.0)}
 width={iW}
 height={scaleY(-3.2) - scaleY(-2.0)}
 fill="#34d399"
 opacity={0.08}
 />
 <rect
 x={pad.l}
 y={scaleY(3.2)}
 width={iW}
 height={scaleY(2.0) - scaleY(3.2)}
 fill="#f87171"
 opacity={0.08}
 />

 {/* Z-score line */}
 <polyline
 points={polyline}
 fill="none"
 stroke="#818cf8"
 strokeWidth={1.6}
 strokeLinejoin="round"
 strokeLinecap="round"
 />

 {/* Entry markers */}
 {entryLong.slice(0, 4).map(({ i, v }) => (
 <circle key={`e${i}`} cx={scaleX(i)} cy={scaleY(v)} r={3.5} fill="#34d399" opacity={0.9} />
 ))}

 {/* Exit markers */}
 {exitLong.slice(0, 3).map(({ i, v }) => (
 <circle key={`x${i}`} cx={scaleX(i)} cy={scaleY(v)} r={3.5} fill="#fb923c" opacity={0.9} />
 ))}

 {/* X axis label */}
 <text x={W / 2} y={H - 4} fill="#64748b" fontSize={9} textAnchor="middle">
 Time (bars)
 </text>

 {/* Legend */}
 <circle cx={pad.l + 8} cy={H - 6} r={3} fill="#34d399" />
 <text x={pad.l + 14} y={H - 3} fill="#94a3b8" fontSize={8}>
 Enter Long
 </text>
 <circle cx={pad.l + 80} cy={H - 6} r={3} fill="#fb923c" />
 <text x={pad.l + 86} y={H - 3} fill="#94a3b8" fontSize={8}>
 Exit
 </text>
 </svg>
 );
}

// ── Inventory SVG ─────────────────────────────────────────────────────────────

function InventorySVG() {
 const W = 520;
 const H = 160;
 const pad = { l: 44, r: 16, t: 16, b: 28 };
 const iW = W - pad.l - pad.r;
 const iH = H - pad.t - pad.b;

 const pts = useMemo(() => {
 resetSeed();
 const arr: number[] = [];
 let inv = 0;
 for (let i = 0; i < 100; i++) {
 const trade = (rand() - 0.48) * 6;
 inv = inv * 0.92 + trade;
 inv = Math.max(-50, Math.min(50, inv));
 arr.push(inv);
 }
 return arr;
 }, []);

 const minV = -55;
 const maxV = 55;
 const scaleX = (i: number) => pad.l + (i / (pts.length - 1)) * iW;
 const scaleY = (v: number) => pad.t + ((maxV - v) / (maxV - minV)) * iH;

 const areaAbove =
 `M${scaleX(0)},${scaleY(0)} ` +
 pts
 .map((v, i) => (v >= 0 ? `L${scaleX(i)},${scaleY(v)}` : `L${scaleX(i)},${scaleY(0)}`))
 .join(" ") +
 ` L${scaleX(pts.length - 1)},${scaleY(0)} Z`;

 const areaBelow =
 `M${scaleX(0)},${scaleY(0)} ` +
 pts
 .map((v, i) => (v <= 0 ? `L${scaleX(i)},${scaleY(v)}` : `L${scaleX(i)},${scaleY(0)}`))
 .join(" ") +
 ` L${scaleX(pts.length - 1)},${scaleY(0)} Z`;

 const line = pts.map((v, i) => `${scaleX(i)},${scaleY(v)}`).join(" ");

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
 {/* Zero line */}
 <line
 x1={pad.l}
 y1={scaleY(0)}
 x2={W - pad.r}
 y2={scaleY(0)}
 stroke="#64748b"
 strokeWidth={1.2}
 />

 {/* Limit bands */}
 {([-20, 20] as const).map((lim) => (
 <line
 key={lim}
 x1={pad.l}
 y1={scaleY(lim)}
 x2={W - pad.r}
 y2={scaleY(lim)}
 stroke="#f59e0b"
 strokeWidth={0.8}
 strokeDasharray="4 3"
 opacity={0.6}
 />
 ))}

 {/* Risk limit band */}
 {([-40, 40] as const).map((lim) => (
 <line
 key={`r${lim}`}
 x1={pad.l}
 y1={scaleY(lim)}
 x2={W - pad.r}
 y2={scaleY(lim)}
 stroke="#f87171"
 strokeWidth={0.8}
 strokeDasharray="2 3"
 opacity={0.5}
 />
 ))}

 {/* Filled areas */}
 <path d={areaAbove} fill="#34d399" opacity={0.15} />
 <path d={areaBelow} fill="#f87171" opacity={0.15} />

 {/* Inventory line */}
 <polyline
 points={line}
 fill="none"
 stroke="#818cf8"
 strokeWidth={1.8}
 strokeLinejoin="round"
 />

 {/* Y axis labels */}
 {[-40, -20, 0, 20, 40].map((v) => (
 <text
 key={v}
 x={pad.l - 4}
 y={scaleY(v) + 3}
 fill="#94a3b8"
 fontSize={8}
 textAnchor="end"
 >
 {v}
 </text>
 ))}

 {/* Legend */}
 <line x1={pad.l + 2} y1={H - 8} x2={pad.l + 14} y2={H - 8} stroke="#f59e0b" strokeDasharray="4 3" strokeWidth={1} />
 <text x={pad.l + 18} y={H - 5} fill="#94a3b8" fontSize={8}>
 Soft limit
 </text>
 <line x1={pad.l + 72} y1={H - 8} x2={pad.l + 84} y2={H - 8} stroke="#f87171" strokeDasharray="2 3" strokeWidth={1} />
 <text x={pad.l + 88} y={H - 5} fill="#94a3b8" fontSize={8}>
 Kill switch
 </text>
 <text x={pad.l - 4} y={scaleY(0) - 6} fill="#64748b" fontSize={7} textAnchor="end">
 Long
 </text>
 <text x={pad.l - 4} y={scaleY(0) + 14} fill="#64748b" fontSize={7} textAnchor="end">
 Short
 </text>
 </svg>
 );
}

// ── AC Optimal Execution SVG ──────────────────────────────────────────────────

function ACExecutionSVG() {
 const W = 520;
 const H = 180;
 const pad = { l: 48, r: 20, t: 16, b: 36 };
 const iW = W - pad.l - pad.r;
 const iH = H - pad.t - pad.b;

 const T = 60; // time steps

 // Aggressive (front-loaded) execution
 const aggressive = Array.from({ length: T }, (_, i) => {
 const frac = (T - i) / T;
 return 1000 * (1 - (1 - frac) ** 2);
 }).reverse();

 // Passive (back-loaded)
 const passive = Array.from({ length: T }, (_, i) => {
 const frac = i / T;
 return 1000 * frac ** 2;
 });

 // AC optimal (risk-balanced)
 const optimal = Array.from({ length: T }, (_, i) => {
 const frac = i / (T - 1);
 // sinh-based AC trajectory
 const kappa = 0.06;
 return (
 1000 *
 (Math.sinh(kappa * (T - i)) / Math.sinh(kappa * T))
 );
 });

 const scaleX = (i: number) => pad.l + (i / (T - 1)) * iW;
 const scaleY = (v: number) => pad.t + ((1000 - v) / 1000) * iH;

 const toPolyline = (arr: number[]) =>
 arr.map((v, i) => `${scaleX(i)},${scaleY(v)}`).join(" ");

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
 {/* Grid */}
 {[0, 250, 500, 750, 1000].map((v) => (
 <g key={v}>
 <line
 x1={pad.l}
 y1={scaleY(v)}
 x2={W - pad.r}
 y2={scaleY(v)}
 stroke="#1e293b"
 strokeWidth={0.8}
 />
 <text x={pad.l - 4} y={scaleY(v) + 3} fill="#64748b" fontSize={8} textAnchor="end">
 {v}
 </text>
 </g>
 ))}

 {/* Trajectories */}
 <polyline
 points={toPolyline(aggressive)}
 fill="none"
 stroke="#f87171"
 strokeWidth={1.6}
 strokeDasharray="5 2"
 />
 <polyline
 points={toPolyline(passive)}
 fill="none"
 stroke="#94a3b8"
 strokeWidth={1.6}
 strokeDasharray="2 3"
 />
 <polyline
 points={toPolyline(optimal)}
 fill="none"
 stroke="#34d399"
 strokeWidth={2.2}
 />

 {/* Axes labels */}
 <text x={W / 2} y={H - 6} fill="#64748b" fontSize={9} textAnchor="middle">
 Time to deadline (bars)
 </text>
 <text
 x={14}
 y={H / 2}
 fill="#64748b"
 fontSize={9}
 textAnchor="middle"
 transform={`rotate(-90, 14, ${H / 2})`}
 >
 Shares remaining
 </text>

 {/* Legend */}
 <line x1={pad.l} y1={H - 8} x2={pad.l + 14} y2={H - 8} stroke="#f87171" strokeDasharray="5 2" strokeWidth={1.5} />
 <text x={pad.l + 18} y={H - 5} fill="#94a3b8" fontSize={8}>
 Aggressive
 </text>
 <line x1={pad.l + 80} y1={H - 8} x2={pad.l + 94} y2={H - 8} stroke="#94a3b8" strokeDasharray="2 3" strokeWidth={1.5} />
 <text x={pad.l + 98} y={H - 5} fill="#94a3b8" fontSize={8}>
 Passive
 </text>
 <line x1={pad.l + 158} y1={H - 8} x2={pad.l + 172} y2={H - 8} stroke="#34d399" strokeWidth={2} />
 <text x={pad.l + 176} y={H - 5} fill="#94a3b8" fontSize={8}>
 AC Optimal
 </text>
 </svg>
 );
}

// ── Feature Importance Bar Chart ──────────────────────────────────────────────

function FeatureImportanceSVG() {
 const features = [
 { name: "12m-1m Momentum", shap: 0.142, color: "#818cf8" },
 { name: "Realised Vol (21d)", shap: 0.118, color: "#818cf8" },
 { name: "Gross Margin", shap: 0.097, color: "#34d399" },
 { name: "Book-to-Market", shap: 0.089, color: "#34d399" },
 { name: "Short Interest", shap: 0.074, color: "#f59e0b" },
 { name: "3m Rev Revision", shap: 0.068, color: "#f59e0b" },
 { name: "Earnings Surprise", shap: 0.061, color: "#f87171" },
 { name: "Accruals Ratio", shap: 0.053, color: "#f87171" },
 ];

 const W = 520;
 const rowH = 22;
 const labelW = 140;
 const barMaxW = 310;
 const H = features.length * rowH + 20;
 const maxShap = features[0].shap;

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
 {features.map(({ name, shap, color }, i) => {
 const y = i * rowH + 10;
 const barW = (shap / maxShap) * barMaxW;
 return (
 <g key={name}>
 <text x={labelW - 4} y={y + 10} fill="#94a3b8" fontSize={9} textAnchor="end">
 {name}
 </text>
 <rect x={labelW} y={y + 2} width={barW} height={14} fill={color} rx={2} opacity={0.85} />
 <text x={labelW + barW + 4} y={y + 12} fill="#cbd5e1" fontSize={9}>
 {shap.toFixed(3)}
 </text>
 </g>
 );
 })}
 <text x={labelW + barMaxW / 2} y={H - 2} fill="#475569" fontSize={8} textAnchor="middle">
 Mean |SHAP| value
 </text>
 </svg>
 );
}

// ── Market Impact SVG ─────────────────────────────────────────────────────────

function MarketImpactSVG() {
 const W = 520;
 const H = 160;
 const pad = { l: 48, r: 16, t: 16, b: 32 };
 const iW = W - pad.l - pad.r;
 const iH = H - pad.t - pad.b;

 // market impact = η * (Q/ADV)^0.6, η = 0.1 (bps)
 const eta = 0.1;
 const xVals = Array.from({ length: 100 }, (_, i) => (i + 1) / 100); // Q/ADV from 0.01 to 1.0

 // Three curves: low, medium, high impact regimes
 const curves = [
 { label: "Low-impact (η=0.05)", eta: 0.05, color: "#34d399" },
 { label: "Base (η=0.10)", eta: 0.10, color: "#818cf8" },
 { label: "High-impact (η=0.20)", eta: 0.20, color: "#f87171" },
 ];

 const maxMI = curves[curves.length - 1].eta * 1.0 ** 0.6; // max at Q/ADV=1
 const scaleX = (x: number) => pad.l + x * iW;
 const scaleY = (v: number) => pad.t + ((maxMI - v) / maxMI) * iH;

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
 {/* Grid */}
 {[0, 0.05, 0.10, 0.15, 0.20].map((v) => (
 <g key={v}>
 <line x1={pad.l} y1={scaleY(v)} x2={W - pad.r} y2={scaleY(v)} stroke="#1e293b" strokeWidth={0.7} />
 <text x={pad.l - 4} y={scaleY(v) + 3} fill="#64748b" fontSize={8} textAnchor="end">
 {(v * 100).toFixed(0)}bp
 </text>
 </g>
 ))}

 {curves.map(({ label, eta: e, color }) => {
 const pts = xVals.map((x) => `${scaleX(x)},${scaleY(e * x ** 0.6)}`).join(" ");
 return (
 <polyline
 key={label}
 points={pts}
 fill="none"
 stroke={color}
 strokeWidth={1.8}
 />
 );
 })}

 <text x={W / 2} y={H - 6} fill="#64748b" fontSize={9} textAnchor="middle">
 Q / ADV (participation rate)
 </text>
 <text x={14} y={H / 2} fill="#64748b" fontSize={9} textAnchor="middle" transform={`rotate(-90, 14, ${H / 2})`}>
 Market Impact (bps)
 </text>

 {/* Legend */}
 {curves.map(({ label, color }, i) => (
 <g key={label}>
 <line x1={pad.l + i * 150} y1={H - 8} x2={pad.l + i * 150 + 12} y2={H - 8} stroke={color} strokeWidth={1.8} />
 <text x={pad.l + i * 150 + 16} y={H - 5} fill="#94a3b8" fontSize={7.5}>
 {label}
 </text>
 </g>
 ))}
 </svg>
 );
}

// ── OrnsteinUhlenbeck formula card ────────────────────────────────────────────

function OUFormulaCard() {
 return (
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <Activity className="w-3.5 h-3.5 text-muted-foreground/50" />
 Ornstein-Uhlenbeck Spread Model
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3 text-xs text-muted-foreground">
 <div className="bg-muted/60 rounded-md px-3 py-2 font-mono text-muted-foreground text-[11px] leading-5">
 <p>dS_t = κ(μ - S_t)dt + σ dW_t</p>
 <p className="text-muted-foreground mt-1">κ = mean-reversion speed, μ = long-run mean</p>
 <p className="text-muted-foreground">σ = diffusion, W_t = Brownian motion</p>
 </div>
 <div className="grid grid-cols-2 gap-2">
 <div className="bg-muted/40 rounded p-2">
 <p className="text-muted-foreground mb-0.5">Half-life of reversion</p>
 <p className="font-mono text-emerald-400">t₁/₂ = ln(2) / κ</p>
 </div>
 <div className="bg-muted/40 rounded p-2">
 <p className="text-muted-foreground mb-0.5">Entry threshold (±)</p>
 <p className="font-mono text-primary">|z| &gt; 2.0σ</p>
 </div>
 </div>
 <div className="bg-muted/40 rounded p-2">
 <p className="text-muted-foreground mb-0.5">Kalman Filter hedge ratio update</p>
 <p className="font-mono text-sky-400 text-xs">
 K_t = P_t H^T (H P_t H^T + R)⁻¹ ; β_t = β_{"{t-1}"} + K_t(y_t - H·β_{"{t-1}"})
 </p>
 </div>
 </CardContent>
 </Card>
 );
}

// ── Tab 1: Statistical Arbitrage ──────────────────────────────────────────────

function StatArbTab() {
 const [selectedPair, setSelectedPair] = useState<PairData | null>(null);

 return (
 <div className="space-y-4">
 {/* Concept pills */}
 <div className="flex flex-wrap gap-2">
 {[
 "Cointegration Test",
 "Pairs Z-Score",
 "Mean Reversion vs Momentum",
 "OU Process",
 "Kalman Filter",
 "PCA Eigenportfolios",
 "Distance Method",
 "Regime Detection",
 "Crowding Risk",
 ].map((c) => (
 <Badge key={c} variant="outline" className="text-xs text-muted-foreground border-border">
 {c}
 </Badge>
 ))}
 </div>

 {/* Z-Score chart */}
 <Card className="bg-card border-border border-l-4 border-l-primary">
 <CardHeader className="pb-2 p-4">
 <CardTitle className="text-lg text-muted-foreground flex items-center gap-2">
 <Shuffle className="w-3.5 h-3.5 text-muted-foreground/50" />
 Spread Z-Score — Entry &amp; Exit Signals
 </CardTitle>
 </CardHeader>
 <CardContent>
 <ZScoreSVG />
 <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
 <span>
 <span className="text-emerald-400">●</span> Enter long spread at z &lt; −2σ
 </span>
 <span>
 <span className="text-rose-400">●</span> Enter short spread at z &gt; +2σ
 </span>
 <span>
 <span className="text-amber-400">●</span> Exit at z ≈ 0
 </span>
 </div>
 </CardContent>
 </Card>

 {/* OU model */}
 <OUFormulaCard />

 {/* Pairs performance table */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <Target className="w-4 h-4 text-sky-400" />
 Cointegrated Pairs — Performance Metrics
 </CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border text-muted-foreground">
 <th className="text-left px-4 py-2">Pair</th>
 <th className="text-right px-3 py-2">Corr</th>
 <th className="text-right px-3 py-2">Coint p</th>
 <th className="text-right px-3 py-2">Half-life</th>
 <th className="text-right px-3 py-2">Sharpe</th>
 <th className="text-right px-3 py-2">Hit Rate</th>
 <th className="text-right px-3 py-2">Avg Hold</th>
 </tr>
 </thead>
 <tbody>
 {PAIRS.map((p) => (
 <tr
 key={`${p.ticker1}-${p.ticker2}`}
 className="border-b border-border hover:bg-muted/40 cursor-pointer transition-colors"
 onClick={() => setSelectedPair(selectedPair?.ticker1 === p.ticker1 ? null : p)}
 >
 <td className="px-4 py-2 text-foreground font-medium">
 {p.ticker1} / {p.ticker2}
 </td>
 <td className="px-3 py-2 text-right text-emerald-400">{p.correlation.toFixed(2)}</td>
 <td className={`px-3 py-2 text-right ${p.cointegP < 0.05 ? "text-emerald-400" : "text-amber-400"}`}>
 {p.cointegP.toFixed(3)}
 </td>
 <td className="px-3 py-2 text-right text-muted-foreground">{p.halfLife.toFixed(1)}d</td>
 <td className={`px-3 py-2 text-right ${p.sharpe > 1 ? "text-emerald-400" : "text-amber-400"}`}>
 {p.sharpe.toFixed(2)}
 </td>
 <td className="px-3 py-2 text-right text-sky-400">{(p.hitRate * 100).toFixed(0)}%</td>
 <td className="px-3 py-2 text-right text-muted-foreground">{p.avgHoldDays.toFixed(1)}d</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 <AnimatePresence>
 {selectedPair && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: "auto" }}
 exit={{ opacity: 0, height: 0 }}
 className="overflow-hidden"
 >
 <div className="px-4 py-3 bg-muted/40 border-t border-border grid grid-cols-3 gap-3 text-xs text-muted-foreground">
 <div>
 <p className="text-muted-foreground">Cointegration Status</p>
 <p className={`font-medium mt-0.5 ${selectedPair.cointegP < 0.05 ? "text-emerald-400" : "text-amber-400"}`}>
 {selectedPair.cointegP < 0.05 ? "Cointegrated (p < 5%)" : "Weak cointegration"}
 </p>
 </div>
 <div>
 <p className="text-muted-foreground">Reversion speed</p>
 <p className="text-primary font-medium mt-0.5">
 κ = {(Math.log(2) / selectedPair.halfLife).toFixed(4)} /day
 </p>
 </div>
 <div>
 <p className="text-muted-foreground">Crowding risk</p>
 <p className={`font-medium mt-0.5 ${selectedPair.correlation > 0.88 ? "text-rose-400" : "text-muted-foreground"}`}>
 {selectedPair.correlation > 0.88 ? "High — popular pair" : "Moderate"}
 </p>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </CardContent>
 </Card>

 {/* Distance vs Cointegration comparison */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground">Distance Method</CardTitle>
 </CardHeader>
 <CardContent className="space-y-2 text-xs text-muted-foreground">
 <p>Ranks pairs by sum of squared price-ratio deviations from historical mean.</p>
 <ul className="space-y-1 list-disc list-inside text-muted-foreground">
 <li>No statistical assumptions required</li>
 <li>Simple to implement, low overfitting risk</li>
 <li>Breaks down in trending regimes</li>
 <li>Does not estimate mean-reversion speed</li>
 </ul>
 <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 text-xs">
 Best for: large-universe screening
 </Badge>
 </CardContent>
 </Card>
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground">Cointegration Method</CardTitle>
 </CardHeader>
 <CardContent className="space-y-2 text-xs text-muted-foreground">
 <p>Engle-Granger / Johansen test for long-run equilibrium relationship between price series.</p>
 <ul className="space-y-1 list-disc list-inside text-muted-foreground">
 <li>Statistically rigorous p-value threshold</li>
 <li>Estimates hedge ratio from OLS regression</li>
 <li>Dynamic via Kalman Filter updates</li>
 <li>Sensitive to structural breaks</li>
 </ul>
 <Badge variant="outline" className="text-sky-400 border-sky-400/30 text-xs">
 Best for: single-pair deep analysis
 </Badge>
 </CardContent>
 </Card>
 </div>

 {/* PCA Stat Arb note */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <Layers className="w-4 h-4 text-amber-400" />
 PCA Eigenportfolios
 </CardTitle>
 </CardHeader>
 <CardContent className="text-xs text-muted-foreground space-y-2">
 <p>
 Decompose the returns covariance matrix into principal components. The residual (idiosyncratic)
 returns of each stock against the first 5–10 eigenvectors form mean-reverting spreads.
 </p>
 <div className="grid grid-cols-3 gap-2 mt-2">
 {[
 { label: "PC1 (Market)", var: "38.4%", color: "text-muted-foreground" },
 { label: "PC2 (Size)", var: "11.2%", color: "text-sky-400" },
 { label: "PC3 (Value)", var: "7.8%", color: "text-primary" },
 ].map(({ label, var: v, color }) => (
 <div key={label} className="bg-muted/40 rounded p-2 text-center">
 <p className={`font-medium text-[11px] ${color}`}>{label}</p>
 <p className="text-muted-foreground text-xs">Explains {v}</p>
 </div>
 ))}
 </div>
 <p className="text-muted-foreground text-xs mt-1">
 Residuals from the first k PCs exhibit half-lives of 3–15 days, suitable for stat arb strategies.
 </p>
 </CardContent>
 </Card>
 </div>
 );
}

// ── Tab 2: ML in Finance ──────────────────────────────────────────────────────

function MLFinanceTab() {
 const [activeModel, setActiveModel] = useState<MLModel>(ML_MODELS[0]);

 return (
 <div className="space-y-4">
 {/* Concept pills */}
 <div className="flex flex-wrap gap-2">
 {[
 "Return Prediction",
 "Overfitting Traps",
 "Walk-Forward Val",
 "SHAP Values",
 "XGBoost / LightGBM",
 "FinBERT",
 "LSTM",
 "Transformers",
 "RL Execution",
 "MLOps",
 ].map((c) => (
 <Badge key={c} variant="outline" className="text-xs text-muted-foreground border-border">
 {c}
 </Badge>
 ))}
 </div>

 {/* Feature importance */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <Brain className="w-3.5 h-3.5 text-muted-foreground/50" />
 Feature Importance — Mean |SHAP| Values
 </CardTitle>
 </CardHeader>
 <CardContent>
 <FeatureImportanceSVG />
 <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
 <span><span className="text-primary">■</span> Momentum factors</span>
 <span><span className="text-emerald-400">■</span> Quality / value</span>
 <span><span className="text-amber-400">■</span> Alternative</span>
 <span><span className="text-rose-400">■</span> Accounting</span>
 </div>
 </CardContent>
 </Card>

 {/* Model comparison */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <BarChart3 className="w-4 h-4 text-sky-400" />
 Model Comparison — IC / ICIR / Sharpe
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 <div className="flex flex-wrap gap-2">
 {ML_MODELS.map((m) => (
 <button
 key={m.name}
 onClick={() => setActiveModel(m)}
 className={`px-3 py-1 rounded text-xs text-muted-foreground border transition-colors ${
 activeModel.name === m.name
 ? "border-primary bg-primary/10 text-primary"
 : "border-border text-muted-foreground hover:border-border"
 }`}
 >
 {m.name}
 </button>
 ))}
 </div>

 <AnimatePresence mode="wait">
 <motion.div
 key={activeModel.name}
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -8 }}
 className="grid grid-cols-2 md:grid-cols-4 gap-3"
 >
 {[
 { label: "IC (daily)", value: activeModel.ic.toFixed(3), color: "text-emerald-400" },
 { label: "IC/IR", value: activeModel.icir.toFixed(2), color: "text-sky-400" },
 { label: "Sharpe", value: activeModel.sharpe.toFixed(2), color: "text-primary" },
 { label: "Max DD", value: `${activeModel.maxDD.toFixed(1)}%`, color: "text-rose-400" },
 ].map(({ label, value, color }) => (
 <div key={label} className="bg-muted/50 rounded-lg p-3 text-center">
 <p className="text-muted-foreground text-xs mb-1">{label}</p>
 <p className={`text-lg font-bold ${color}`}>{value}</p>
 </div>
 ))}
 </motion.div>
 </AnimatePresence>

 <div className="bg-muted/30 rounded p-3 text-xs text-muted-foreground space-y-1">
 <p className="text-muted-foreground">
 <span className="text-foreground">Features: </span>
 {activeModel.features.join(", ")}
 </p>
 <p className="text-muted-foreground">
 <span className="text-foreground">Overfitting risk: </span>
 <span className={overfitColor(activeModel.overfit)}>{activeModel.overfit.toUpperCase()}</span>
 </p>
 </div>
 </CardContent>
 </Card>

 {/* Validation methods */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <AlertTriangle className="w-4 h-4 text-amber-400" />
 Overfitting Traps
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-2 text-xs text-muted-foreground">
 {[
 { trap: "Backtest overfitting", fix: "Out-of-sample holdout + combinatorial purging" },
 { trap: "Multiple testing problem", fix: "Bonferroni / BHY correction on p-values" },
 { trap: "Look-ahead bias", fix: "Point-in-time data, embargo period" },
 { trap: "Survivorship bias", fix: "Include delisted tickers in universe" },
 { trap: "Feature leakage", fix: "Strict temporal train/test splits" },
 ].map(({ trap, fix }) => (
 <div key={trap} className="flex gap-2">
 <AlertTriangle className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
 <div>
 <p className="text-muted-foreground">{trap}</p>
 <p className="text-muted-foreground text-xs">{fix}</p>
 </div>
 </div>
 ))}
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <CheckCircle className="w-4 h-4 text-emerald-400" />
 Walk-Forward vs K-Fold
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3 text-xs text-muted-foreground">
 <div className="bg-muted/40 rounded p-2">
 <p className="text-emerald-400 font-medium mb-1">Walk-Forward (Correct)</p>
 <p>Train on t₀→t; test on t+1→t+k. Roll forward. Respects time causality. Recommended for finance.</p>
 </div>
 <div className="bg-muted/40 rounded p-2">
 <p className="text-rose-400 font-medium mb-1">K-Fold (Problematic)</p>
 <p>Random fold splits leak future information into training set. Produces optimistic in-sample metrics.</p>
 </div>
 <div className="bg-muted/40 rounded p-2">
 <p className="text-sky-400 font-medium mb-1">Combinatorial Purged CV</p>
 <p>Removes overlapping windows and embargo periods. State-of-the-art for financial ML.</p>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* NLP + RL note */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground">FinBERT Sentiment</CardTitle>
 </CardHeader>
 <CardContent className="text-xs text-muted-foreground space-y-2">
 <p>Fine-tuned BERT model on financial news, earnings calls, and analyst reports.</p>
 <div className="space-y-1">
 {[
 { label: "IC (news tone)", v: 0.031, max: 0.05 },
 { label: "IC (earnings call)", v: 0.027, max: 0.05 },
 { label: "IC (analyst revision)", v: 0.024, max: 0.05 },
 ].map(({ label, v, max }) => (
 <div key={label}>
 <div className="flex justify-between mb-0.5">
 <span className="text-muted-foreground">{label}</span>
 <span className="text-sky-400">{v.toFixed(3)}</span>
 </div>
 <Progress value={(v / max) * 100} className="h-1.5" />
 </div>
 ))}
 </div>
 <p className="text-muted-foreground text-xs">Signals decay within 1–3 days post-publication.</p>
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground">RL for Execution</CardTitle>
 </CardHeader>
 <CardContent className="text-xs text-muted-foreground space-y-2">
 <p>Agent learns execution policy to minimise implementation shortfall + market impact.</p>
 <div className="bg-muted/40 rounded p-2 font-mono text-xs text-muted-foreground">
 <p>State: (inventory, time_remaining, spread, vol)</p>
 <p>Action: quantity_to_trade ∈ [0, max_slice]</p>
 <p>Reward: −(impact_cost + timing_risk)</p>
 </div>
 <p className="text-muted-foreground text-xs">
 Outperforms TWAP/VWAP by 15–30% in simulated environments with intraday vol patterns.
 </p>
 </CardContent>
 </Card>
 </div>

 {/* MLOps */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <SlidersHorizontal className="w-4 h-4 text-sky-400" />
 MLOps for Finance — Production Lifecycle
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
 {[
 { step: "Feature Store", color: "bg-primary/20 text-primary" },
 { step: "Model Registry", color: "bg-sky-500/20 text-sky-300" },
 { step: "Champion/Challenger", color: "bg-emerald-500/20 text-emerald-300" },
 { step: "Drift Detection", color: "bg-amber-500/20 text-amber-300" },
 { step: "Scheduled Retrain", color: "bg-rose-500/20 text-rose-300" },
 { step: "Shadow Mode", color: "bg-muted-foreground/20 text-muted-foreground" },
 ].map(({ step, color }, i) => (
 <div key={step} className="flex items-center gap-1">
 <span className={`px-2 py-0.5 rounded text-xs text-muted-foreground font-medium ${color}`}>{step}</span>
 {i < 5 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
 </div>
 ))}
 </div>
 <p className="text-xs text-muted-foreground mt-3">
 IC degradation &gt;20% over 60-day rolling window triggers retraining pipeline.
 Model weights are versioned; rollback in &lt;2 minutes.
 </p>
 </CardContent>
 </Card>
 </div>
 );
}

// ── Tab 3: HFT Market-Making ──────────────────────────────────────────────────

function HFTMarketMakingTab() {
 const [selectedRegime, setSelectedRegime] = useState<MMRegime>(MM_REGIMES[1]);

 return (
 <div className="space-y-4">
 {/* Concept pills */}
 <div className="flex flex-wrap gap-2">
 {[
 "Avellaneda-Stoikov",
 "Inventory Management",
 "Adverse Selection",
 "P&L Decomposition",
 "Co-location",
 "FPGA vs GPU",
 "OBI Signal",
 "Kill Switch",
 "Regime Awareness",
 ].map((c) => (
 <Badge key={c} variant="outline" className="text-xs text-muted-foreground border-border">
 {c}
 </Badge>
 ))}
 </div>

 {/* AS Model */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <Zap className="w-4 h-4 text-amber-400" />
 Avellaneda-Stoikov Optimal Spread
 </CardTitle>
 </CardHeader>
 <CardContent className="text-xs text-muted-foreground space-y-3">
 <div className="bg-muted/60 rounded-md px-3 py-2 font-mono text-muted-foreground text-[11px] leading-5">
 <p>δ* = γ·σ²·(T-t) + (2/γ)·ln(1 + γ/κ)</p>
 <p className="text-muted-foreground mt-1">δ* = optimal half-spread</p>
 <p className="text-muted-foreground">γ = risk aversion, σ² = variance, κ = order arrival rate</p>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 {[
 { label: "Risk aversion ↑", effect: "Wider spread, less inventory", dir: "up" },
 { label: "Volatility ↑", effect: "Wider spread, faster reversion", dir: "up" },
 { label: "Time remaining ↓", effect: "Wider spread (urgency)", dir: "down" },
 { label: "Order flow ↑", effect: "Tighter spread, more fills", dir: "up" },
 ].map(({ label, effect, dir }) => (
 <div key={label} className="bg-muted/40 rounded p-2 text-center">
 <div className="flex items-center justify-center gap-1 mb-1">
 {dir === "up" ? (
 <TrendingUp className="w-3 h-3 text-emerald-400" />
 ) : (
 <TrendingDown className="w-3 h-3 text-rose-400" />
 )}
 <p className="text-muted-foreground text-xs font-medium">{label}</p>
 </div>
 <p className="text-muted-foreground text-xs">{effect}</p>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* Inventory chart */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <Activity className="w-3.5 h-3.5 text-muted-foreground/50" />
 Inventory Position Over Time — Mean Reversion Control
 </CardTitle>
 </CardHeader>
 <CardContent>
 <InventorySVG />
 <p className="text-xs text-muted-foreground mt-2">
 Market maker skews quotes to attract order flow that reduces inventory. Soft limits trigger
 spread widening; hard limits (kill switch) halt quoting.
 </p>
 </CardContent>
 </Card>

 {/* Regime table */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <BarChart3 className="w-4 h-4 text-sky-400" />
 P&amp;L by Market Regime — Per 1,000 quotes
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-2">
 {MM_REGIMES.map((r) => (
 <div
 key={r.regime}
 className={`rounded-lg p-3 border cursor-pointer transition-colors ${
 selectedRegime.regime === r.regime
 ? "border-primary/50 bg-muted/60"
 : "border-border hover:bg-muted/30"
 }`}
 onClick={() => setSelectedRegime(r)}
 >
 <div className="flex items-center justify-between">
 <span className={`text-sm font-medium ${r.color}`}>{r.regime}</span>
 <span className={`text-sm font-bold ${r.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
 ${r.pnl.toLocaleString()}
 </span>
 </div>
 <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-muted-foreground">
 <span>Spread: <span className="text-muted-foreground">{r.spread.toFixed(1)}bp</span></span>
 <span>Inventory: <span className="text-amber-400">{r.inventory}</span></span>
 <span>Adv-sel: <span className="text-rose-400">${r.adverseSelCost}</span></span>
 </div>
 </div>
 ))}
 <p className="text-xs text-muted-foreground pt-1">
 P&amp;L = Spread Earned − Adverse Selection Cost − Inventory Risk. Trending/shock regimes
 flip P&amp;L negative due to adverse selection dominating.
 </p>
 </CardContent>
 </Card>

 {/* Technology stack */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <Cpu className="w-4 h-4 text-sky-400" />
 Hardware Latency Budget
 </CardTitle>
 </CardHeader>
 <CardContent className="text-xs text-muted-foreground space-y-2">
 {[
 { stage: "NIC → kernel", lat: "100 ns", tech: "FPGA kernel bypass", color: "text-emerald-400" },
 { stage: "Order book update", lat: "200 ns", tech: "FPGA co-processor", color: "text-emerald-400" },
 { stage: "Signal compute", lat: "500 ns", tech: "FPGA / GPU", color: "text-sky-400" },
 { stage: "Decision logic", lat: "1 μs", tech: "CPU (optimised C++)", color: "text-amber-400" },
 { stage: "Order encode + send", lat: "2 μs", tech: "Kernel bypass (DPDK)", color: "text-amber-400" },
 { stage: "Exchange ACK", lat: "30–200 μs", tech: "Co-location advantage", color: "text-primary" },
 ].map(({ stage, lat, tech, color }) => (
 <div key={stage} className="flex items-center justify-between border-b border-border pb-1">
 <span className="text-muted-foreground">{stage}</span>
 <div className="text-right">
 <span className={`font-mono font-medium ${color}`}>{lat}</span>
 <p className="text-[11px] text-muted-foreground">{tech}</p>
 </div>
 </div>
 ))}
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <AlertTriangle className="w-4 h-4 text-rose-400" />
 Risk Controls &amp; Kill Switch
 </CardTitle>
 </CardHeader>
 <CardContent className="text-xs space-y-2 text-muted-foreground">
 {[
 { ctrl: "Order rate limiter", desc: "Max N orders/sec per venue" },
 { ctrl: "Fat-finger check", desc: "Price ±X% from NBBO rejected" },
 { ctrl: "Inventory hard limit", desc: "Halt quoting if |inv| > max" },
 { ctrl: "P&L stop-loss", desc: "Kill switch at −$X daily loss" },
 { ctrl: "Stale-price detection", desc: "Pause if market data >500ms old" },
 { ctrl: "Exchange disconnect", desc: "Cancel-on-disconnect (COD) orders" },
 ].map(({ ctrl, desc }) => (
 <div key={ctrl} className="flex gap-2">
 <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
 <div>
 <p className="text-muted-foreground">{ctrl}</p>
 <p className="text-muted-foreground text-xs">{desc}</p>
 </div>
 </div>
 ))}
 </CardContent>
 </Card>
 </div>

 {/* OBI signal */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground">Order Book Imbalance Signal</CardTitle>
 </CardHeader>
 <CardContent className="text-xs text-muted-foreground space-y-2">
 <div className="bg-muted/60 rounded px-3 py-2 font-mono text-[11px] text-muted-foreground">
 OBI = (BidVol − AskVol) / (BidVol + AskVol) ∈ [−1, +1]
 </div>
 <p>
 OBI &gt; +0.3 predicts upward mid-price movement over next 10ms with 58% accuracy.
 Combined with trade flow imbalance, predictive power rises to 64%.
 </p>
 <div className="grid grid-cols-3 gap-2 mt-2">
 {[
 { range: "OBI &gt; 0.3", signal: "Lean ask (buy)", color: "text-emerald-400" },
 { range: "OBI ≈ 0", signal: "Symmetric quotes", color: "text-muted-foreground" },
 { range: "OBI &lt; −0.3", signal: "Lean bid (sell)", color: "text-rose-400" },
 ].map(({ range, signal, color }) => (
 <div key={range} className="bg-muted/40 rounded p-2 text-center">
 <p className="font-mono text-xs text-muted-foreground">{range}</p>
 <p className={`text-xs text-muted-foreground mt-0.5 font-medium ${color}`}>{signal}</p>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>
 );
}

// ── Tab 4: Execution & Transaction Costs ──────────────────────────────────────

function ExecutionTab() {
 const [selectedAlgo, setSelectedAlgo] = useState<ExecutionAlgo>(EXEC_ALGOS[2]);

 return (
 <div className="space-y-4">
 {/* Concept pills */}
 <div className="flex flex-wrap gap-2">
 {[
 "Almgren-Chriss",
 "Market Impact",
 "Implementation Shortfall",
 "VWAP / TWAP / IS / POV",
 "Dynamic Programming",
 "Venue Selection",
 "Dark Pools",
 "Pre-Trade Analytics",
 "Post-Trade TCA",
 ].map((c) => (
 <Badge key={c} variant="outline" className="text-xs text-muted-foreground border-border">
 {c}
 </Badge>
 ))}
 </div>

 {/* AC optimal execution chart */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <GitMerge className="w-4 h-4 text-emerald-400" />
 Almgren-Chriss: Optimal Execution Trajectory (1,000 shares)
 </CardTitle>
 </CardHeader>
 <CardContent>
 <ACExecutionSVG />
 <p className="text-xs text-muted-foreground mt-2">
 The AC model minimises E[cost] + λ·Var[cost]. Higher risk aversion (λ) accelerates
 execution (more front-loading). Lower λ allows passive execution, reducing market impact at
 the cost of higher timing risk.
 </p>
 </CardContent>
 </Card>

 {/* Market impact curve */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <DollarSign className="w-4 h-4 text-amber-400" />
 Market Impact Model: η × (Q/ADV)^0.6
 </CardTitle>
 </CardHeader>
 <CardContent>
 <MarketImpactSVG />
 <div className="grid grid-cols-3 gap-3 mt-3 text-xs text-muted-foreground">
 {[
 { q: "1% ADV", imp: "~5bp", note: "Routine order" },
 { q: "10% ADV", imp: "~18bp", note: "Large block" },
 { q: "25% ADV", imp: "~30bp", note: "Significant market move" },
 ].map(({ q, imp, note }) => (
 <div key={q} className="bg-muted/40 rounded p-2 text-center">
 <p className="text-muted-foreground">{q}</p>
 <p className="text-primary font-medium">{imp}</p>
 <p className="text-muted-foreground text-xs">{note}</p>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* IS Breakdown */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <Layers className="w-3.5 h-3.5 text-muted-foreground/50" />
 Implementation Shortfall Decomposition
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-2">
 {[
 { component: "Delay Cost", bps: 3.1, pct: 18, color: "bg-amber-500", desc: "Price drift between decision and order submission" },
 { component: "Market Impact", bps: 8.4, pct: 49, color: "bg-rose-500", desc: "Price move caused by own order flow" },
 { component: "Timing Risk", bps: 3.8, pct: 22, color: "bg-primary", desc: "Opportunity cost of phased execution" },
 { component: "Commissions", bps: 1.9, pct: 11, color: "bg-muted-foreground", desc: "Explicit brokerage fees" },
 ].map(({ component, bps, pct, color, desc }) => (
 <div key={component}>
 <div className="flex items-center justify-between mb-1 text-xs text-muted-foreground">
 <span className="text-muted-foreground">{component}</span>
 <div className="flex gap-3 text-right">
 <span className="text-muted-foreground">{bps.toFixed(1)}bp</span>
 <span className="text-muted-foreground w-8">{pct}%</span>
 </div>
 </div>
 <div className="h-2 bg-muted rounded-full overflow-hidden">
 <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
 </div>
 <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
 </div>
 ))}
 </div>
 <p className="text-xs text-muted-foreground mt-3">
 Total IS: <span className="text-rose-400 font-medium">17.2 bps</span> vs arrival price.
 Post-trade TCA benchmarks this against VWAP, close, and PWP (pre-weighted price).
 </p>
 </CardContent>
 </Card>

 {/* Algo comparison table */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <Clock className="w-4 h-4 text-sky-400" />
 Execution Algorithm Comparison
 </CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border text-muted-foreground">
 <th className="text-left px-4 py-2">Algorithm</th>
 <th className="text-left px-3 py-2">Objective</th>
 <th className="text-left px-3 py-2">Best For</th>
 <th className="text-right px-3 py-2">Avg PI (bps)</th>
 <th className="text-right px-3 py-2">Complexity</th>
 </tr>
 </thead>
 <tbody>
 {EXEC_ALGOS.map((a) => (
 <tr
 key={a.name}
 className={`border-b border-border cursor-pointer transition-colors ${
 selectedAlgo.name === a.name ? "bg-muted/60" : "hover:bg-muted/30"
 }`}
 onClick={() => setSelectedAlgo(a)}
 >
 <td className="px-4 py-2">
 <p className={`font-medium ${a.color}`}>{a.name}</p>
 <p className="text-muted-foreground text-xs">{a.fullName}</p>
 </td>
 <td className="px-3 py-2 text-muted-foreground">{a.objective}</td>
 <td className="px-3 py-2 text-muted-foreground">{a.bestFor}</td>
 <td className={`px-3 py-2 text-right font-mono font-medium ${a.avgPI < 4 ? "text-emerald-400" : "text-amber-400"}`}>
 {a.avgPI.toFixed(1)}
 </td>
 <td className={`px-3 py-2 text-right font-medium ${complexityColor(a.complexity)}`}>
 {a.complexity}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>

 {/* Venue selection + dark pools */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground">Venue Selection</CardTitle>
 </CardHeader>
 <CardContent className="text-xs space-y-2 text-muted-foreground">
 {[
 {
 venue: "Lit Exchange (NYSE/NASDAQ)",
 fill: "100%",
 impact: "High",
 color: "text-rose-400",
 note: "Transparent, post-trade reported, high market impact",
 },
 {
 venue: "Dark Pool (ATS)",
 fill: "~40%",
 impact: "Low",
 color: "text-emerald-400",
 note: "Price improvement possible; adverse selection risk",
 },
 {
 venue: "Internalization (STP)",
 fill: "~60%",
 impact: "Very Low",
 color: "text-emerald-400",
 note: "Broker matches against inventory; PFOF concerns",
 },
 {
 venue: "Midpoint Peg",
 fill: "~25%",
 impact: "Minimal",
 color: "text-sky-400",
 note: "Executes at NBBO midpoint; zero explicit spread cost",
 },
 ].map(({ venue, fill, impact, color, note }) => (
 <div key={venue} className="border-b border-border pb-2">
 <div className="flex justify-between items-center">
 <span className="text-muted-foreground font-medium">{venue}</span>
 <div className="flex gap-2 text-right">
 <span className="text-sky-400">{fill} fill</span>
 <span className={color}>{impact} impact</span>
 </div>
 </div>
 <p className="text-muted-foreground text-xs mt-0.5">{note}</p>
 </div>
 ))}
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground">Pre/Post Trade Analytics</CardTitle>
 </CardHeader>
 <CardContent className="text-xs space-y-3 text-muted-foreground">
 <div className="bg-muted/40 rounded p-2">
 <p className="text-sky-400 font-medium mb-1">Pre-Trade Cost Estimate</p>
 <p>Estimate expected IS, market impact, and spread cost before order submission.
 Input: order size, urgency, historical ADV, intraday vol profile.</p>
 </div>
 <div className="bg-muted/40 rounded p-2">
 <p className="text-primary font-medium mb-1">Post-Trade TCA Attribution</p>
 <p>Decompose realised IS into delay, impact, timing, commissions.
 Compare vs VWAP, arrival price, close. Broker toxicity scored by adverse selection.</p>
 </div>
 <div className="bg-muted/40 rounded p-2">
 <p className="text-amber-400 font-medium mb-1">Broker Toxicity Score</p>
 <p>Measures fraction of fills where price moved adversely within 30s.
 High toxicity suggests information leakage or predatory routing.</p>
 </div>
 </CardContent>
 </Card>
 </div>
 </div>
 );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function QuantStrategies2Page() {
 const [tab, setTab] = useState("statarb");

 const tabItems = [
 { id: "statarb", label: "Statistical Arbitrage", icon: Shuffle },
 { id: "ml", label: "ML in Finance", icon: Brain },
 { id: "hft", label: "HFT Market-Making", icon: Zap },
 { id: "execution", label: "Execution & Costs", icon: DollarSign },
 ];

 return (
 <div className="min-h-screen bg-background text-foreground p-4">
 {/* Header */}
 <motion.div
 initial={{ opacity: 0, y: -16 }}
 animate={{ opacity: 1, y: 0 }}
 className="mb-6"
 >
 <div className="flex items-center gap-3 mb-2">
 <div className="p-2 bg-primary/10 rounded-lg border border-border">
 <Activity className="w-6 h-6 text-primary" />
 </div>
 <div>
 <h1 className="text-2xl font-bold text-foreground">Advanced Quantitative Strategies II</h1>
 <p className="text-sm text-muted-foreground">
 Statistical arbitrage · Machine learning · HFT market-making · Optimal execution
 </p>
 </div>
 </div>

 {/* Quick-stat chips */}
 <div className="flex flex-wrap gap-2 mt-3">
 {[
 { label: "Stat Arb Sharpe", value: "1.42", color: "text-emerald-400" },
 { label: "XGBoost IC", value: "0.048", color: "text-sky-400" },
 { label: "HFT Spread", value: "1.1bp", color: "text-primary" },
 { label: "IS (avg)", value: "17.2bp", color: "text-amber-400" },
 ].map(({ label, value, color }) => (
 <div
 key={label}
 className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-muted-foreground"
 >
 <span className="text-muted-foreground">{label}</span>
 <span className={`font-medium ${color}`}>{value}</span>
 </div>
 ))}
 </div>
 </motion.div>

 {/* Tabs */}
 <Tabs value={tab} onValueChange={setTab} className="w-full">
 <TabsList className="bg-card border border-border p-1 h-auto flex flex-wrap gap-1 mb-4">
 {tabItems.map(({ id, label, icon: Icon }) => (
 <TabsTrigger
 key={id}
 value={id}
 className="text-xs data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground px-3 py-1.5 flex items-center gap-1.5"
 >
 <Icon className="w-3.5 h-3.5" />
 {label}
 </TabsTrigger>
 ))}
 </TabsList>

 <TabsContent value="statarb" className="data-[state=inactive]:hidden">
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
 <StatArbTab />
 </motion.div>
 </TabsContent>

 <TabsContent value="ml" className="data-[state=inactive]:hidden">
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
 <MLFinanceTab />
 </motion.div>
 </TabsContent>

 <TabsContent value="hft" className="data-[state=inactive]:hidden">
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
 <HFTMarketMakingTab />
 </motion.div>
 </TabsContent>

 <TabsContent value="execution" className="data-[state=inactive]:hidden">
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
 <ExecutionTab />
 </motion.div>
 </TabsContent>
 </Tabs>
 </div>
 );
}
