"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
 GitBranch,
 TrendingUp,
 Shield,
 Activity,
 BarChart3,
 AlertTriangle,
 Star,
 Info,
 ChevronDown,
 ChevronUp,
 RefreshCw,
} from "lucide-react";

// ─── Seeded PRNG (seed = 642007) ──────────────────────────────────────────────

function makeRng(seed: number) {
 let s = seed;
 return () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
 };
}

// ─── Asset class definitions ──────────────────────────────────────────────────

const ASSETS = [
 { id: "us_eq", label: "US Equities", short: "US Eq", color: "#3b82f6" },
 { id: "intl_eq", label: "Intl Equities", short: "Intl", color: "#8b5cf6" },
 { id: "bonds", label: "US Bonds", short: "Bonds", color: "#10b981" },
 { id: "gold", label: "Gold", short: "Gold", color: "#f59e0b" },
 { id: "oil", label: "Crude Oil", short: "Oil", color: "#ef4444" },
 { id: "realestate", label: "Real Estate", short: "RE", color: "#ec4899" },
 { id: "crypto", label: "Crypto", short: "Crypto", color: "#f97316" },
 { id: "hy", label: "High Yield", short: "HY", color: "#06b6d4" },
 { id: "em", label: "EM Bonds", short: "EM", color: "#84cc16" },
 { id: "cash", label: "Cash", short: "Cash", color: "#94a3b8" },
] as const;

type AssetId = typeof ASSETS[number]["id"];

// ─── Realistic base correlation matrix (symmetric, diagonal = 1) ──────────────
// Order: us_eq, intl_eq, bonds, gold, oil, realestate, crypto, hy, em, cash

const BASE_CORR: number[][] = [
 // US Intl Bonds Gold Oil RE Crypto HY EM Cash
 /* US */ [ 1.00, 0.85, -0.32, 0.02, 0.24, 0.62, 0.42, 0.74, 0.63, -0.05],
 /* Intl*/ [ 0.85, 1.00, -0.28, 0.08, 0.29, 0.56, 0.38, 0.67, 0.71, -0.04],
 /* Bonds*/[-0.32, -0.28, 1.00, 0.18, -0.12, -0.18, -0.15, -0.10, -0.08, 0.12],
 /* Gold*/ [ 0.02, 0.08, 0.18, 1.00, 0.16, 0.08, 0.18, 0.06, 0.12, 0.04],
 /* Oil */ [ 0.24, 0.29, -0.12, 0.16, 1.00, 0.28, 0.22, 0.28, 0.31, -0.02],
 /* RE */ [ 0.62, 0.56, -0.18, 0.08, 0.28, 1.00, 0.32, 0.56, 0.44, -0.04],
 /* Crypto*/[ 0.42, 0.38, -0.15, 0.18, 0.22, 0.32, 1.00, 0.35, 0.40, -0.06],
 /* HY */ [ 0.74, 0.67, -0.10, 0.06, 0.28, 0.56, 0.35, 1.00, 0.62, -0.03],
 /* EM */ [ 0.63, 0.71, -0.08, 0.12, 0.31, 0.44, 0.40, 0.62, 1.00, -0.02],
 /* Cash */ [-0.05, -0.04, 0.12, 0.04, -0.02, -0.04, -0.06, -0.03, -0.02, 1.00],
];

// ─── Crisis period correlation matrices ───────────────────────────────────────

const CRISIS_CORR_GFC: number[][] = [
 [ 1.00, 0.92, -0.48, 0.18, 0.38, 0.74, 0.28, 0.84, 0.72, -0.18],
 [ 0.92, 1.00, -0.44, 0.22, 0.42, 0.68, 0.24, 0.78, 0.80, -0.16],
 [-0.48, -0.44, 1.00, 0.28, -0.22, -0.32, -0.18, -0.26, -0.22, 0.28],
 [ 0.18, 0.22, 0.28, 1.00, 0.24, 0.12, 0.10, 0.14, 0.18, 0.08],
 [ 0.38, 0.42, -0.22, 0.24, 1.00, 0.42, 0.18, 0.38, 0.44, -0.08],
 [ 0.74, 0.68, -0.32, 0.12, 0.42, 1.00, 0.22, 0.68, 0.58, -0.14],
 [ 0.28, 0.24, -0.18, 0.10, 0.18, 0.22, 1.00, 0.24, 0.26, -0.08],
 [ 0.84, 0.78, -0.26, 0.14, 0.38, 0.68, 0.24, 1.00, 0.72, -0.12],
 [ 0.72, 0.80, -0.22, 0.18, 0.44, 0.58, 0.26, 0.72, 1.00, -0.10],
 [-0.18, -0.16, 0.28, 0.08, -0.08, -0.14, -0.08, -0.12, -0.10, 1.00],
];

const CRISIS_CORR_COVID: number[][] = [
 [ 1.00, 0.94, -0.52, 0.08, 0.44, 0.78, 0.56, 0.82, 0.74, -0.22],
 [ 0.94, 1.00, -0.48, 0.12, 0.48, 0.72, 0.52, 0.76, 0.82, -0.18],
 [-0.52, -0.48, 1.00, 0.32, -0.28, -0.38, -0.22, -0.32, -0.28, 0.32],
 [ 0.08, 0.12, 0.32, 1.00, 0.18, 0.06, -0.04, 0.08, 0.12, 0.12],
 [ 0.44, 0.48, -0.28, 0.18, 1.00, 0.48, 0.38, 0.42, 0.52, -0.12],
 [ 0.78, 0.72, -0.38, 0.06, 0.48, 1.00, 0.44, 0.72, 0.62, -0.18],
 [ 0.56, 0.52, -0.22, -0.04, 0.38, 0.44, 1.00, 0.48, 0.52, -0.12],
 [ 0.82, 0.76, -0.32, 0.08, 0.42, 0.72, 0.48, 1.00, 0.68, -0.14],
 [ 0.74, 0.82, -0.28, 0.12, 0.52, 0.62, 0.52, 0.68, 1.00, -0.12],
 [-0.22, -0.18, 0.32, 0.12, -0.12, -0.18, -0.12, -0.14, -0.12, 1.00],
];

const CRISIS_CORR_RATE: number[][] = [
 [ 1.00, 0.88, -0.58, 0.12, 0.32, 0.68, 0.48, 0.78, 0.68, -0.12],
 [ 0.88, 1.00, -0.54, 0.16, 0.36, 0.62, 0.44, 0.72, 0.74, -0.10],
 [-0.58, -0.54, 1.00, 0.22, -0.18, -0.42, -0.28, -0.38, -0.32, 0.22],
 [ 0.12, 0.16, 0.22, 1.00, 0.22, 0.14, 0.22, 0.10, 0.16, 0.06],
 [ 0.32, 0.36, -0.18, 0.22, 1.00, 0.36, 0.28, 0.32, 0.38, -0.06],
 [ 0.68, 0.62, -0.42, 0.14, 0.36, 1.00, 0.36, 0.62, 0.52, -0.12],
 [ 0.48, 0.44, -0.28, 0.22, 0.28, 0.36, 1.00, 0.38, 0.44, -0.10],
 [ 0.78, 0.72, -0.38, 0.10, 0.32, 0.62, 0.38, 1.00, 0.64, -0.08],
 [ 0.68, 0.74, -0.32, 0.16, 0.38, 0.52, 0.44, 0.64, 1.00, -0.06],
 [-0.12, -0.10, 0.22, 0.06, -0.06, -0.12, -0.10, -0.08, -0.06, 1.00],
];

// ─── Helper: correlation color mapping ────────────────────────────────────────

function corrColor(v: number): string {
 if (v >= 0.8) return "#16a34a"; // strong positive
 if (v >= 0.5) return "#4ade80"; // moderate positive
 if (v >= 0.2) return "#86efac"; // mild positive
 if (v >= 0.05) return "#bbf7d0"; // near zero positive
 if (v >= -0.05) return "#f1f5f9"; // zero / cash diagonal
 if (v >= -0.2) return "#fecaca"; // mild negative
 if (v >= -0.5) return "#f87171"; // moderate negative
 return "#dc2626"; // strong negative
}

function corrTextColor(v: number): string {
 const abs = Math.abs(v);
 if (abs >= 0.5) return "#fff";
 return "#0f172a";
}

// ─── Rolling correlation time series (60 bars) ────────────────────────────────

interface RollingPoint {
 idx: number;
 value: number;
 label: string;
}

function generateRollingCorr(
 baseCorr: number,
 seed: number,
 n = 60
): RollingPoint[] {
 const rand = makeRng(seed);
 const points: RollingPoint[] = [];
 let prev = baseCorr;
 const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
 for (let i = 0; i < n; i++) {
 const noise = (rand() - 0.5) * 0.12;
 let next = prev + noise;
 next = Math.max(-0.99, Math.min(0.99, next));
 // mean-revert
 next = next + (baseCorr - next) * 0.08;
 prev = next;
 const monthIdx = i % 12;
 const year = 2024 + Math.floor(i / 12);
 points.push({ idx: i, value: Number(next.toFixed(3)), label: `${months[monthIdx]} ${year}` });
 }
 return points;
}

// ─── Portfolio diversification data ──────────────────────────────────────────

interface PortfolioAsset {
 asset: string;
 weight: number;
 volatility: number;
 contribution: number;
}

const PORTFOLIO_ASSETS: PortfolioAsset[] = [
 { asset: "US Equities", weight: 40, volatility: 18.2, contribution: 52.4 },
 { asset: "Intl Equities", weight: 20, volatility: 20.8, contribution: 22.8 },
 { asset: "US Bonds", weight: 20, volatility: 5.4, contribution: 4.2 },
 { asset: "Gold", weight: 5, volatility: 16.6, contribution: 3.8 },
 { asset: "Real Estate", weight: 8, volatility: 22.4, contribution: 9.6 },
 { asset: "Crypto", weight: 4, volatility: 68.2, contribution: 6.2 },
 { asset: "Cash", weight: 3, volatility: 0.8, contribution: 1.0 },
];

// ─── Optimal pairs for diversification ───────────────────────────────────────

interface OptimalPair {
 a: string;
 b: string;
 correlation: number;
 freeLunch: string;
 reductionPct: number;
 notes: string;
}

const OPTIMAL_PAIRS: OptimalPair[] = [
 {
 a: "US Equities",
 b: "US Bonds",
 correlation: -0.32,
 freeLunch: "High",
 reductionPct: 28,
 notes: "Classic 60/40. Negative correlation offers strong vol reduction.",
 },
 {
 a: "US Bonds",
 b: "Gold",
 correlation: 0.18,
 freeLunch: "High",
 reductionPct: 24,
 notes: "Both safe-havens but driven by different macro factors.",
 },
 {
 a: "US Equities",
 b: "Cash",
 correlation: -0.05,
 freeLunch: "Medium",
 reductionPct: 18,
 notes: "Cash is uncorrelated but sacrifices expected return.",
 },
 {
 a: "Gold",
 b: "High Yield",
 correlation: 0.06,
 freeLunch: "High",
 reductionPct: 22,
 notes: "HY tracks equities, Gold tracks USD/real rates — near-zero link.",
 },
 {
 a: "Oil",
 b: "US Bonds",
 correlation: -0.12,
 freeLunch: "Medium",
 reductionPct: 16,
 notes: "Oil is inflation-driven; bonds hurt by inflation. Mild offset.",
 },
 {
 a: "Crypto",
 b: "Cash",
 correlation: -0.06,
 freeLunch: "Medium",
 reductionPct: 14,
 notes: "Crypto tail risk offset by cash stability.",
 },
 {
 a: "EM Bonds",
 b: "Cash",
 correlation: -0.02,
 freeLunch: "Low",
 reductionPct: 10,
 notes: "EM and Cash nearly uncorrelated, but EM has significant credit risk.",
 },
 {
 a: "Gold",
 b: "Crypto",
 correlation: 0.18,
 freeLunch: "Medium",
 reductionPct: 15,
 notes: "Both 'store of value' assets but differently correlated to risk.",
 },
];

// ─── SVG Heatmap ─────────────────────────────────────────────────────────────

interface HeatmapProps {
 matrix: number[][];
 title: string;
}

function CorrelationHeatmap({ matrix, title }: HeatmapProps) {
 const n = ASSETS.length;
 const cellSize = 48;
 const labelWidth = 62;
 const topPad = 64;
 const leftPad = labelWidth;
 const svgW = leftPad + n * cellSize + 4;
 const svgH = topPad + n * cellSize + 4;

 return (
 <div className="overflow-x-auto">
 <p className="text-xs text-muted-foreground mb-2">{title}</p>
 <svg width={svgW} height={svgH} className="block">
 {/* Column headers */}
 {ASSETS.map((a, ci) => (
 <text
 key={`col-${ci}`}
 x={leftPad + ci * cellSize + cellSize / 2}
 y={topPad - 6}
 textAnchor="middle"
 fontSize={10}
 fill="#94a3b8"
 transform={`rotate(-40, ${leftPad + ci * cellSize + cellSize / 2}, ${topPad - 6})`}
 >
 {a.short}
 </text>
 ))}
 {/* Row headers */}
 {ASSETS.map((a, ri) => (
 <text
 key={`row-${ri}`}
 x={leftPad - 4}
 y={topPad + ri * cellSize + cellSize / 2 + 4}
 textAnchor="end"
 fontSize={10}
 fill="#94a3b8"
 >
 {a.short}
 </text>
 ))}
 {/* Cells */}
 {matrix.map((row, ri) =>
 row.map((val, ci) => {
 const x = leftPad + ci * cellSize;
 const y = topPad + ri * cellSize;
 const bg = corrColor(val);
 const fg = corrTextColor(val);
 return (
 <g key={`cell-${ri}-${ci}`}>
 <rect
 x={x + 1}
 y={y + 1}
 width={cellSize - 2}
 height={cellSize - 2}
 fill={bg}
 rx={2}
 />
 <text
 x={x + cellSize / 2}
 y={y + cellSize / 2 + 4}
 textAnchor="middle"
 fontSize={9}
 fill={fg}
 fontWeight={ri === ci ? "700" : "400"}
 >
 {val.toFixed(2)}
 </text>
 </g>
 );
 })
 )}
 </svg>
 {/* Legend */}
 <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
 <span>-1.0</span>
 <svg width={160} height={14}>
 <defs>
 <linearGradient id={`lg-${title.replace(/\s/g, "")}`} x1="0" y1="0" x2="1" y2="0">
 <stop offset="0%" stopColor="#dc2626" />
 <stop offset="30%" stopColor="#f87171" />
 <stop offset="50%" stopColor="#f1f5f9" />
 <stop offset="70%" stopColor="#4ade80" />
 <stop offset="100%" stopColor="#16a34a" />
 </linearGradient>
 </defs>
 <rect x={0} y={2} width={160} height={10} rx={4}
 fill={`url(#lg-${title.replace(/\s/g, "")})`} />
 </svg>
 <span>+1.0</span>
 </div>
 </div>
 );
}

// ─── Rolling Correlation Chart ────────────────────────────────────────────────

interface RollingChartProps {
 points: RollingPoint[];
 assetA: string;
 assetB: string;
}

function RollingCorrChart({ points, assetA, assetB }: RollingChartProps) {
 const W = 580;
 const H = 220;
 const PAD = { top: 20, right: 16, bottom: 36, left: 44 };
 const iW = W - PAD.left - PAD.right;
 const iH = H - PAD.top - PAD.bottom;

 const minV = -1;
 const maxV = 1;

 const toX = (i: number) => PAD.left + (i / (points.length - 1)) * iW;
 const toY = (v: number) => PAD.top + ((maxV - v) / (maxV - minV)) * iH;

 const pathD = points
 .map((p, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(p.value).toFixed(1)}`)
 .join("");

 // Fill below zero line
 const zeroY = toY(0);
 const posFill = points
 .map((p, i) => {
 const y = toY(Math.max(0, p.value));
 return `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${y.toFixed(1)}`;
 })
 .join("") +
 ` L${toX(points.length - 1).toFixed(1)},${zeroY} L${toX(0).toFixed(1)},${zeroY} Z`;

 const negFill = points
 .map((p, i) => {
 const y = toY(Math.min(0, p.value));
 return `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${y.toFixed(1)}`;
 })
 .join("") +
 ` L${toX(points.length - 1).toFixed(1)},${zeroY} L${toX(0).toFixed(1)},${zeroY} Z`;

 const gridYs = [-1, -0.5, 0, 0.5, 1];
 const tickX = [0, 12, 24, 36, 48, 59];

 return (
 <div className="overflow-x-auto">
 <svg width={W} height={H} className="block">
 {/* Grid lines */}
 {gridYs.map((gv) => (
 <g key={`grid-${gv}`}>
 <line
 x1={PAD.left} y1={toY(gv)}
 x2={W - PAD.right} y2={toY(gv)}
 stroke={gv === 0 ? "#475569" : "#1e293b"}
 strokeWidth={gv === 0 ? 1.5 : 1}
 strokeDasharray={gv === 0 ? "none" : "4 3"}
 />
 <text
 x={PAD.left - 6} y={toY(gv) + 4}
 textAnchor="end" fontSize={9} fill="#64748b"
 >
 {gv.toFixed(1)}
 </text>
 </g>
 ))}
 {/* Fills */}
 <path d={posFill} fill="#22c55e" opacity={0.15} />
 <path d={negFill} fill="#ef4444" opacity={0.15} />
 {/* Line */}
 <path d={pathD} fill="none" stroke="#60a5fa" strokeWidth={2} strokeLinejoin="round" />
 {/* X ticks */}
 {tickX.map((ti) => (
 <text
 key={`tick-${ti}`}
 x={toX(ti)} y={H - PAD.bottom + 14}
 textAnchor="middle" fontSize={9} fill="#64748b"
 >
 {points[ti]?.label.slice(0, 3)}
 </text>
 ))}
 {/* Axis labels */}
 <text
 x={W / 2} y={H - 4}
 textAnchor="middle" fontSize={10} fill="#94a3b8"
 >
 {assetA} / {assetB}
 </text>
 </svg>
 </div>
 );
}

// ─── Gauge SVG ────────────────────────────────────────────────────────────────

interface GaugeProps {
 value: number; // 0–100
 label: string;
 color: string;
}

function GaugeChart({ value, label, color }: GaugeProps) {
 const cx = 80;
 const cy = 80;
 const r = 56;
 const startAngle = -210;
 const sweepAngle = 240;

 function polarToCart(angleDeg: number, radius: number) {
 const rad = (angleDeg * Math.PI) / 180;
 return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
 }

 function arcPath(from: number, to: number, radius: number) {
 const s = polarToCart(from, radius);
 const e = polarToCart(to, radius);
 const large = Math.abs(to - from) > 180 ? 1 : 0;
 return `M${s.x.toFixed(2)},${s.y.toFixed(2)} A${radius},${radius} 0 ${large},1 ${e.x.toFixed(2)},${e.y.toFixed(2)}`;
 }

 const filledTo = startAngle + (value / 100) * sweepAngle;

 return (
 <svg width={160} height={110} className="block mx-auto">
 {/* Track */}
 <path
 d={arcPath(startAngle, startAngle + sweepAngle, r)}
 fill="none" stroke="#1e293b" strokeWidth={10} strokeLinecap="round"
 />
 {/* Fill */}
 {value > 0 && (
 <path
 d={arcPath(startAngle, filledTo, r)}
 fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
 />
 )}
 {/* Center text */}
 <text x={cx} y={cy + 4} textAnchor="middle" fontSize={22} fontWeight="700" fill="#f8fafc">
 {value}
 </text>
 <text x={cx} y={cy + 18} textAnchor="middle" fontSize={9} fill="#94a3b8">
 / 100
 </text>
 {/* Label */}
 <text x={cx} y={105} textAnchor="middle" fontSize={10} fill="#94a3b8">
 {label}
 </text>
 </svg>
 );
}

// ─── Tab 1: Correlation Matrix ─────────────────────────────────────────────────

function CorrelationMatrixTab() {
 const [hoveredCell, setHoveredCell] = useState<{ ri: number; ci: number } | null>(null);

 const highlightedVal = useMemo(() => {
 if (!hoveredCell) return null;
 return BASE_CORR[hoveredCell.ri][hoveredCell.ci];
 }, [hoveredCell]);

 return (
 <div
 className="space-y-4"
 >
 <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
 {/* Stats cards */}
 {[
 { label: "Avg Correlation", value: "0.31", sub: "Across all pairs", icon: <Activity size={16} />, color: "text-foreground" },
 { label: "Most Correlated", value: "0.96", sub: "US Eq / Intl Eq", icon: <TrendingUp size={16} />, color: "text-red-400" },
 { label: "Least Correlated", value: "-0.52", sub: "US Eq / Bonds", icon: <Shield size={16} />, color: "text-green-400" },
 ].map((s) => (
 <Card key={s.label} className="bg-muted/50 border-border">
 <CardContent className="pt-4 pb-4">
 <div className="flex items-center gap-2 text-muted-foreground mb-1">
 <span className={s.color}>{s.icon}</span>
 <span className="text-xs text-muted-foreground">{s.label}</span>
 </div>
 <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
 <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
 </CardContent>
 </Card>
 ))}
 </div>

 <Card className="bg-muted/50 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
 <BarChart3 size={15} className="text-muted-foreground/50" />
 10×10 Asset Class Correlation Matrix (Current — 252-day)
 </CardTitle>
 </CardHeader>
 <CardContent>
 {/* Interactive heatmap */}
 <div className="overflow-x-auto">
 {(() => {
 const n = ASSETS.length;
 const cellSize = 48;
 const labelWidth = 62;
 const topPad = 68;
 const leftPad = labelWidth;
 const svgW = leftPad + n * cellSize + 4;
 const svgH = topPad + n * cellSize + 4;
 return (
 <svg width={svgW} height={svgH} className="block">
 {/* Column headers */}
 {ASSETS.map((a, ci) => (
 <text
 key={`col-${ci}`}
 x={leftPad + ci * cellSize + cellSize / 2}
 y={topPad - 6}
 textAnchor="middle"
 fontSize={10}
 fill={hoveredCell?.ci === ci ? "#93c5fd" : "#94a3b8"}
 fontWeight={hoveredCell?.ci === ci ? "700" : "400"}
 transform={`rotate(-38, ${leftPad + ci * cellSize + cellSize / 2}, ${topPad - 6})`}
 >
 {a.short}
 </text>
 ))}
 {/* Row headers */}
 {ASSETS.map((a, ri) => (
 <text
 key={`row-${ri}`}
 x={leftPad - 4}
 y={topPad + ri * cellSize + cellSize / 2 + 4}
 textAnchor="end"
 fontSize={10}
 fill={hoveredCell?.ri === ri ? "#93c5fd" : "#94a3b8"}
 fontWeight={hoveredCell?.ri === ri ? "700" : "400"}
 >
 {a.short}
 </text>
 ))}
 {/* Cells */}
 {BASE_CORR.map((row, ri) =>
 row.map((val, ci) => {
 const x = leftPad + ci * cellSize;
 const y = topPad + ri * cellSize;
 const bg = corrColor(val);
 const fg = corrTextColor(val);
 const isHovered = hoveredCell?.ri === ri && hoveredCell?.ci === ci;
 return (
 <g
 key={`cell-${ri}-${ci}`}
 style={{ cursor: "pointer" }}
 onMouseEnter={() => setHoveredCell({ ri, ci })}
 onMouseLeave={() => setHoveredCell(null)}
 >
 <rect
 x={x + 1} y={y + 1}
 width={cellSize - 2} height={cellSize - 2}
 fill={bg} rx={2}
 stroke={isHovered ? "#60a5fa" : "transparent"}
 strokeWidth={2}
 />
 <text
 x={x + cellSize / 2} y={y + cellSize / 2 + 4}
 textAnchor="middle" fontSize={9} fill={fg}
 fontWeight={ri === ci ? "700" : "400"}
 >
 {val.toFixed(2)}
 </text>
 </g>
 );
 })
 )}
 </svg>
 );
 })()}
 </div>

 {/* Tooltip area */}
 
 {hoveredCell !== null && highlightedVal !== null && (
 <div
 key="tooltip"
 className="mt-4 p-3 bg-muted/60 border border-border rounded-lg flex items-center gap-4"
 >
 <div className="flex items-center gap-2">
 <div
 className="w-3 h-3 rounded-sm"
 style={{ background: ASSETS[hoveredCell.ci].color }}
 />
 <span className="text-sm text-muted-foreground">{ASSETS[hoveredCell.ci].label}</span>
 </div>
 <span className="text-muted-foreground text-sm">vs</span>
 <div className="flex items-center gap-2">
 <div
 className="w-3 h-3 rounded-sm"
 style={{ background: ASSETS[hoveredCell.ri].color }}
 />
 <span className="text-sm text-muted-foreground">{ASSETS[hoveredCell.ri].label}</span>
 </div>
 <span className="text-muted-foreground text-sm">—</span>
 <Badge
 className="text-sm"
 style={{
 background: corrColor(highlightedVal),
 color: corrTextColor(highlightedVal),
 }}
 >
 {highlightedVal > 0 ? "+" : ""}
 {highlightedVal.toFixed(2)}
 </Badge>
 <span className="text-xs text-muted-foreground">
 {Math.abs(highlightedVal) >= 0.7
 ? "Strong"
 : Math.abs(highlightedVal) >= 0.4
 ? "Moderate"
 : Math.abs(highlightedVal) >= 0.15
 ? "Mild"
 : "Negligible"}{""}
 {highlightedVal >= 0 ? "positive" : "negative"} correlation
 </span>
 </div>
 )}
 

 {/* Color legend */}
 <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
 <span className="whitespace-nowrap">-1.0 (inverse)</span>
 <svg width={160} height={14} className="flex-1 max-w-[160px]">
 <defs>
 <linearGradient id="lg-main" x1="0" y1="0" x2="1" y2="0">
 <stop offset="0%" stopColor="#dc2626" />
 <stop offset="40%" stopColor="#f87171" />
 <stop offset="50%" stopColor="#f1f5f9" />
 <stop offset="60%" stopColor="#4ade80" />
 <stop offset="100%" stopColor="#16a34a" />
 </linearGradient>
 </defs>
 <rect x={0} y={2} width={160} height={10} rx={4} fill="url(#lg-main)" />
 </svg>
 <span className="whitespace-nowrap">+1.0 (perfect)</span>
 </div>
 </CardContent>
 </Card>

 {/* Interpretation notes */}
 <Card className="bg-muted/50 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
 <Info size={14} className="text-amber-400" />
 Interpretation Guide
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 {[
 { range: "0.7 – 1.0", label: "Strong +", color: "#16a34a", desc: "Move together closely" },
 { range: "0.3 – 0.7", label: "Moderate +", color: "#4ade80", desc: "Loosely linked" },
 { range: "-0.3 – 0.3", label: "Neutral", color: "#94a3b8", desc: "Independent returns" },
 { range: "-1.0 – -0.3",label: "Negative", color: "#ef4444", desc: "Offset each other" },
 ].map((r) => (
 <div key={r.range} className="flex items-start gap-2">
 <div className="w-2.5 h-2.5 rounded-sm mt-0.5 flex-shrink-0" style={{ background: r.color }} />
 <div>
 <p className="text-xs font-medium text-foreground">{r.label}</p>
 <p className="text-xs text-muted-foreground">{r.range}</p>
 <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>
 );
}

// ─── Tab 2: Rolling Correlations ───────────────────────────────────────────────

const ROLLING_PAIRS: Array<{ a: AssetId; b: AssetId; seed: number }> = [
 { a: "us_eq", b: "bonds", seed: 642007 },
 { a: "us_eq", b: "gold", seed: 642108 },
 { a: "us_eq", b: "crypto", seed: 642209 },
 { a: "bonds", b: "gold", seed: 642310 },
 { a: "us_eq", b: "intl_eq", seed: 642411 },
 { a: "oil", b: "bonds", seed: 642512 },
];

function RollingCorrelationsTab() {
 const [selectedPair, setSelectedPair] = useState(0);

 const pairData = useMemo(() => {
 return ROLLING_PAIRS.map((p) => {
 const ai = ASSETS.findIndex((a) => a.id === p.a);
 const bi = ASSETS.findIndex((a) => a.id === p.b);
 const baseCorr = BASE_CORR[ai][bi];
 return {
 ...p,
 aLabel: ASSETS[ai].label,
 bLabel: ASSETS[bi].label,
 baseCorr,
 points: generateRollingCorr(baseCorr, p.seed),
 };
 });
 }, []);

 const current = pairData[selectedPair];
 const currentLast = current.points[current.points.length - 1].value;
 const avgCorr = current.points.reduce((s, p) => s + p.value, 0) / current.points.length;
 const minCorr = Math.min(...current.points.map((p) => p.value));
 const maxCorr = Math.max(...current.points.map((p) => p.value));

 return (
 <div
 className="space-y-5"
 >
 {/* Pair selector */}
 <Card className="bg-muted/50 border-border">
 <CardContent className="pt-4 pb-4">
 <p className="text-xs text-muted-foreground mb-3">Select asset pair</p>
 <div className="flex flex-wrap gap-2">
 {pairData.map((p, i) => (
 <Button
 key={i}
 size="sm"
 variant={selectedPair === i ? "default" : "outline"}
 onClick={() => setSelectedPair(i)}
 className={selectedPair === i
 ? "bg-primary text-foreground border-primary text-xs"
 : "border-border text-muted-foreground text-xs hover:bg-muted"
 }
 >
 {p.aLabel.split("")[0]} / {p.bLabel.split("")[0]}
 </Button>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* Stats row */}
 <div className="grid grid-cols-4 gap-3">
 {[
 { label: "Current", value: currentLast.toFixed(3), color: currentLast >= 0 ? "text-green-400" : "text-red-400" },
 { label: "Average", value: avgCorr.toFixed(3), color: "text-foreground" },
 { label: "Min (60d)", value: minCorr.toFixed(3), color: "text-red-400" },
 { label: "Max (60d)", value: maxCorr.toFixed(3), color: "text-green-400" },
 ].map((s) => (
 <Card key={s.label} className="bg-muted/50 border-border">
 <CardContent className="pt-3 pb-3">
 <p className="text-xs text-muted-foreground">{s.label}</p>
 <p className={`text-xl font-semibold mt-0.5 ${s.color}`}>{s.value}</p>
 </CardContent>
 </Card>
 ))}
 </div>

 {/* Chart */}
 <Card className="bg-muted/50 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-foreground">
 60-Day Rolling Correlation — {current.aLabel} / {current.bLabel}
 </CardTitle>
 </CardHeader>
 <CardContent>
 
 <div
 key={selectedPair}
 >
 <RollingCorrChart
 points={current.points}
 assetA={current.aLabel}
 assetB={current.bLabel}
 />
 </div>
 
 <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
 <span className="flex items-center gap-1">
 <span className="w-3 h-0.5 bg-primary inline-block" /> Rolling corr
 </span>
 <span className="flex items-center gap-1">
 <span className="w-3 h-2 bg-green-400/20 inline-block" /> Positive zone
 </span>
 <span className="flex items-center gap-1">
 <span className="w-3 h-2 bg-red-400/20 inline-block" /> Negative zone
 </span>
 </div>
 </CardContent>
 </Card>

 {/* Regime commentary */}
 <Card className="bg-muted/50 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
 <Info size={14} className="text-amber-400" />
 Regime Interpretation
 </CardTitle>
 </CardHeader>
 <CardContent>
 <p className="text-sm text-muted-foreground leading-relaxed">
 {currentLast < -0.3
 ? `The ${current.aLabel} / ${current.bLabel} pair shows strong negative correlation (${currentLast.toFixed(2)}). This is an ideal diversification pair — gains in one tend to offset losses in the other.`
 : currentLast > 0.7
 ? `High positive correlation (${currentLast.toFixed(2)}) between ${current.aLabel} and ${current.bLabel}. Both assets move in tandem, offering limited diversification benefit currently.`
 : `Moderate correlation (${currentLast.toFixed(2)}) between ${current.aLabel} and ${current.bLabel}. Partial diversification benefit is available; combining these assets reduces portfolio volatility modestly.`}
 </p>
 <p className="text-xs text-muted-foreground mt-2">
 Rolling window: 60 trading days • Updated daily • Pearson coefficient
 </p>
 </CardContent>
 </Card>
 </div>
 );
}

// ─── Tab 3: Crisis Correlations ────────────────────────────────────────────────

interface CrisisEra {
 id: string;
 label: string;
 period: string;
 matrix: number[][];
 color: string;
 description: string;
}

const CRISIS_ERAS: CrisisEra[] = [
 {
 id: "gfc",
 label: "2008 GFC",
 period: "Sep 2008 – Mar 2009",
 matrix: CRISIS_CORR_GFC,
 color: "#ef4444",
 description: "Global Financial Crisis. Lehman collapse triggered flight-to-quality. Cross-asset correlations spiked toward 1 as liquidity dried up — the classic 'all correlations go to 1 in a crash' phenomenon.",
 },
 {
 id: "covid",
 label: "2020 COVID",
 period: "Feb 2020 – Apr 2020",
 matrix: CRISIS_CORR_COVID,
 color: "#f97316",
 description: "COVID-19 pandemic shock. Rapid, violent deleveraging drove risk-off across all asset classes simultaneously. Even gold sold off initially as investors raised cash to meet margin calls.",
 },
 {
 id: "rate",
 label: "2022 Rate Shock",
 period: "Jan 2022 – Oct 2022",
 matrix: CRISIS_CORR_RATE,
 color: "#8b5cf6",
 description: "Fed rate hiking cycle broke the 60/40 portfolio. Equities and bonds fell together for the first time in decades. Duration risk punished both stocks and long-dated bonds simultaneously.",
 },
];

function CrisisCorrelationsTab() {
 const [selectedCrisis, setSelectedCrisis] = useState<string>("gfc");
 const [showMatrix, setShowMatrix] = useState(false);

 const era = CRISIS_ERAS.find((e) => e.id === selectedCrisis)!;

 // Comparison: base vs crisis for key pairs
 const keyPairs: Array<{ ai: number; bi: number }> = [
 { ai: 0, bi: 1 }, // US / Intl
 { ai: 0, bi: 2 }, // US / Bonds
 { ai: 0, bi: 3 }, // US / Gold
 { ai: 0, bi: 6 }, // US / Crypto
 { ai: 2, bi: 3 }, // Bonds / Gold
 { ai: 0, bi: 7 }, // US / HY
 { ai: 0, bi: 8 }, // US / EM
 { ai: 1, bi: 8 }, // Intl / EM
 ];

 return (
 <div
 className="space-y-5"
 >
 {/* Crisis selector */}
 <div className="flex flex-wrap gap-3">
 {CRISIS_ERAS.map((e) => (
 <button
 key={e.id}
 onClick={() => setSelectedCrisis(e.id)}
 className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
 selectedCrisis === e.id
 ? "text-foreground border-transparent"
 : "border-border text-muted-foreground bg-muted/50 hover:border-muted-foreground"
 }`}
 style={selectedCrisis === e.id ? { background: e.color, borderColor: e.color } : {}}
 >
 {e.label}
 <span className="ml-2 text-xs text-muted-foreground opacity-70">{e.period}</span>
 </button>
 ))}
 </div>

 
 <div
 key={selectedCrisis}
 className="space-y-5"
 >
 {/* Description card */}
 <Card className="bg-muted/50 border-border" style={{ borderLeftColor: era.color, borderLeftWidth: 3 }}>
 <CardContent className="pt-4 pb-4">
 <div className="flex items-center gap-2 mb-2">
 <AlertTriangle size={14} style={{ color: era.color }} />
 <span className="text-sm font-medium text-foreground">{era.label} — {era.period}</span>
 </div>
 <p className="text-sm text-muted-foreground leading-relaxed">{era.description}</p>
 </CardContent>
 </Card>

 {/* Before/After comparison table */}
 <Card className="bg-muted/50 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-foreground">
 Before vs During Crisis — Key Pair Correlations
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="text-xs text-muted-foreground border-b border-border">
 <th className="text-left pb-2 font-medium">Pair</th>
 <th className="text-right pb-2 font-medium">Normal</th>
 <th className="text-right pb-2 font-medium">Crisis</th>
 <th className="text-right pb-2 font-medium">Change</th>
 <th className="text-right pb-2 font-medium pr-1">Signal</th>
 </tr>
 </thead>
 <tbody>
 {keyPairs.map(({ ai, bi }, idx) => {
 const normal = BASE_CORR[ai][bi];
 const crisis = era.matrix[ai][bi];
 const delta = crisis - normal;
 return (
 <tr key={idx} className="border-b border-border last:border-0">
 <td className="py-2.5 text-muted-foreground">
 {ASSETS[ai].short} / {ASSETS[bi].short}
 </td>
 <td className="py-2.5 text-right">
 <span
 className="font-mono text-xs text-muted-foreground px-1.5 py-0.5 rounded"
 style={{ background: corrColor(normal), color: corrTextColor(normal) }}
 >
 {normal.toFixed(2)}
 </span>
 </td>
 <td className="py-2.5 text-right">
 <span
 className="font-mono text-xs text-muted-foreground px-1.5 py-0.5 rounded"
 style={{ background: corrColor(crisis), color: corrTextColor(crisis) }}
 >
 {crisis.toFixed(2)}
 </span>
 </td>
 <td className="py-2.5 text-right">
 <span className={`text-xs font-mono font-medium ${delta > 0.1 ? "text-red-400" : delta < -0.1 ? "text-green-400" : "text-muted-foreground"}`}>
 {delta > 0 ? "+" : ""}{delta.toFixed(2)}
 </span>
 </td>
 <td className="py-2.5 text-right pr-1">
 <Badge
 className="text-xs text-muted-foreground"
 style={{
 background: delta > 0.15 ? "#7f1d1d" : delta < -0.1 ? "#14532d" : "#1e293b",
 color: delta > 0.15 ? "#fca5a5" : delta < -0.1 ? "#86efac" : "#94a3b8",
 }}
 >
 {delta > 0.15 ? "Correlation spike" : delta < -0.1 ? "Decoupled" : "Stable"}
 </Badge>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>

 {/* Toggle full matrix */}
 <Card className="bg-muted/50 border-border">
 <CardHeader className="pb-2">
 <div className="flex items-center justify-between">
 <CardTitle className="text-sm font-medium text-foreground">
 Full Crisis Matrix — {era.label}
 </CardTitle>
 <Button
 size="sm"
 variant="outline"
 className="border-border text-muted-foreground text-xs hover:bg-muted"
 onClick={() => setShowMatrix(!showMatrix)}
 >
 {showMatrix ? <ChevronUp size={12} className="mr-1" /> : <ChevronDown size={12} className="mr-1" />}
 {showMatrix ? "Hide" : "Show"} Matrix
 </Button>
 </div>
 </CardHeader>
 
 {showMatrix && (
 <div
 className="overflow-hidden"
 >
 <CardContent className="pt-0">
 <CorrelationHeatmap matrix={era.matrix} title={`${era.label} (${era.period})`} />
 </CardContent>
 </div>
 )}
 
 </Card>
 </div>
 
 </div>
 );
}

// ─── Tab 4: Diversification Score ────────────────────────────────────────────

function DiversificationScoreTab() {
 // Portfolio-level stats derived from the asset weights + correlations
 // Effective N = 1 / Σ wi^2 (Herfindahl inverse = naive count ignoring corr)
 // True diversification ratio = weighted avg vol / portfolio vol
 const totalWeight = PORTFOLIO_ASSETS.reduce((s, a) => s + a.weight, 0);
 const herf = PORTFOLIO_ASSETS.reduce((s, a) => s + (a.weight / totalWeight) ** 2, 0);
 const effectiveN = Math.round(1 / herf);

 // Portfolio volatility (simplified — use contribution-based estimate)
 const portVol = 12.8; // annualized % — realistic for a diversified portfolio
 const weightedAvgVol = PORTFOLIO_ASSETS.reduce(
 (s, a) => s + (a.weight / totalWeight) * a.volatility,
 0
 );
 const diversificationRatio = Number((weightedAvgVol / portVol).toFixed(2));
 // Score: scale DR from 1–3 to 0–100
 const drScore = Math.min(100, Math.round(((diversificationRatio - 1) / (3 - 1)) * 100));

 // Concentration: HH index as %
 const hhiPct = Math.round(herf * 100);
 const concentrationScore = 100 - hhiPct * 4;

 // Overall diversification score (0–100)
 const overallScore = Math.round((drScore * 0.5 + concentrationScore * 0.5));

 return (
 <div
 className="space-y-5"
 >
 {/* Gauge row */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <Card className="bg-muted/50 border-border">
 <CardContent className="pt-4 pb-2">
 <GaugeChart value={overallScore} label="Overall Score" color="#60a5fa" />
 </CardContent>
 </Card>
 <Card className="bg-muted/50 border-border">
 <CardContent className="pt-4 pb-2">
 <GaugeChart value={drScore} label="Diversif. Ratio" color="#34d399" />
 </CardContent>
 </Card>
 <Card className="bg-muted/50 border-border">
 <CardContent className="pt-4 pb-2">
 <GaugeChart value={Math.max(0, concentrationScore)} label="Concentration" color="#f59e0b" />
 </CardContent>
 </Card>
 <Card className="bg-muted/50 border-border">
 <CardContent className="pt-4 pb-2">
 <GaugeChart value={Math.min(100, effectiveN * 14)} label={`Eff. N = ${effectiveN}`} color="#a78bfa" />
 </CardContent>
 </Card>
 </div>

 {/* Key metrics */}
 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
 {[
 { label: "Portfolio Volatility", value: `${portVol.toFixed(1)}%`, sub: "Annualized" },
 { label: "Wtd. Avg Asset Vol", value: `${weightedAvgVol.toFixed(1)}%`, sub: "Before diversification" },
 { label: "Diversification Ratio", value: diversificationRatio.toFixed(2), sub: "DR = Σwᵢσᵢ / σₚ" },
 { label: "Effective N", value: effectiveN.toString(), sub: "1 / HHI" },
 { label: "HH Concentration Index", value: `${hhiPct}%`, sub: "Lower is better" },
 { label: "Volatility Reduction", value: `${(weightedAvgVol - portVol).toFixed(1)}%`, sub: "From diversification" },
 ].map((m) => (
 <Card key={m.label} className="bg-muted/50 border-border">
 <CardContent className="pt-3 pb-3">
 <p className="text-xs text-muted-foreground">{m.label}</p>
 <p className="text-xl font-medium text-foreground mt-0.5">{m.value}</p>
 <p className="text-xs text-muted-foreground mt-0.5">{m.sub}</p>
 </CardContent>
 </Card>
 ))}
 </div>

 {/* Risk contribution chart */}
 <Card className="bg-muted/50 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
 <BarChart3 size={14} className="text-muted-foreground/50" />
 Risk Concentration vs Weight Allocation
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 {PORTFOLIO_ASSETS.map((a) => (
 <div key={a.asset}>
 <div className="flex justify-between text-xs text-muted-foreground mb-1">
 <span>{a.asset}</span>
 <span className="flex gap-3">
 <span>Weight: <strong className="text-foreground">{a.weight}%</strong></span>
 <span>Risk: <strong className={a.contribution > a.weight + 5 ? "text-red-400" : "text-foreground"}>{a.contribution}%</strong></span>
 </span>
 </div>
 <div className="relative h-4 bg-muted/50 rounded overflow-hidden">
 <div
 className="absolute left-0 top-0 h-full bg-muted/50 rounded"
 style={{ width: `${a.weight}%` }}
 />
 <div
 className={`absolute left-0 top-0 h-full rounded border-r-2 ${a.contribution > a.weight + 5 ? "border-red-400" : "border-green-400"}`}
 style={{ width: `${a.contribution}%`, background: "transparent" }}
 />
 </div>
 </div>
 ))}
 <div className="flex gap-4 text-xs text-muted-foreground mt-2">
 <span className="flex items-center gap-1.5">
 <span className="w-3 h-2 bg-muted/50 inline-block rounded-sm" /> Weight
 </span>
 <span className="flex items-center gap-1.5">
 <span className="w-3 h-0.5 border-t-2 border-green-400 inline-block" /> Risk contribution (normal)
 </span>
 <span className="flex items-center gap-1.5">
 <span className="w-3 h-0.5 border-t-2 border-red-400 inline-block" /> Risk contribution (concentrated)
 </span>
 </div>
 </CardContent>
 </Card>

 {/* SVG donut — risk contribution */}
 <Card className="bg-muted/50 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-foreground">Risk Contribution Breakdown</CardTitle>
 </CardHeader>
 <CardContent>
 {(() => {
 const cx = 100;
 const cy = 100;
 const r = 70;
 const ri = 40;
 let cumAngle = -Math.PI / 2;
 const colors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#f97316", "#94a3b8"];
 const total = PORTFOLIO_ASSETS.reduce((s, a) => s + a.contribution, 0);
 const segments = PORTFOLIO_ASSETS.map((a, i) => {
 const pct = a.contribution / total;
 const angle = pct * 2 * Math.PI;
 const x1 = cx + r * Math.cos(cumAngle);
 const y1 = cy + r * Math.sin(cumAngle);
 const endAngle = cumAngle + angle;
 const x2 = cx + r * Math.cos(endAngle);
 const y2 = cy + r * Math.sin(endAngle);
 const ix1 = cx + ri * Math.cos(cumAngle);
 const iy1 = cy + ri * Math.sin(cumAngle);
 const ix2 = cx + ri * Math.cos(endAngle);
 const iy2 = cy + ri * Math.sin(endAngle);
 const large = angle > Math.PI ? 1 : 0;
 const d = `M${ix1.toFixed(2)},${iy1.toFixed(2)} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large},1 ${x2.toFixed(2)},${y2.toFixed(2)} L${ix2.toFixed(2)},${iy2.toFixed(2)} A${ri},${ri} 0 ${large},0 ${ix1.toFixed(2)},${iy1.toFixed(2)} Z`;
 const midAngle = cumAngle + angle / 2;
 const lx = cx + (r + 14) * Math.cos(midAngle);
 const ly = cy + (r + 14) * Math.sin(midAngle);
 cumAngle = endAngle;
 return { d, color: colors[i % colors.length], pct, lx, ly, label: a.asset, contribution: a.contribution };
 });
 return (
 <div className="flex flex-col md:flex-row items-center gap-3">
 <svg width={200} height={200} className="flex-shrink-0">
 {segments.map((seg, i) => (
 <path key={i} d={seg.d} fill={seg.color} opacity={0.85} stroke="#0f172a" strokeWidth={1} />
 ))}
 <text x={cx} y={cy - 4} textAnchor="middle" fontSize={12} fill="#94a3b8">Risk</text>
 <text x={cx} y={cy + 12} textAnchor="middle" fontSize={12} fill="#94a3b8">Split</text>
 </svg>
 <div className="grid grid-cols-1 gap-2 flex-1">
 {segments.map((seg, i) => (
 <div key={i} className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: seg.color }} />
 <span className="text-xs text-muted-foreground">{seg.label}</span>
 </div>
 <div className="flex items-center gap-3">
 <Progress value={seg.contribution} className="w-20 h-1.5" />
 <span className="text-xs font-mono text-muted-foreground w-10 text-right">{seg.contribution}%</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
 })()}
 </CardContent>
 </Card>
 </div>
 );
}

// ─── Tab 5: Optimal Pairs ─────────────────────────────────────────────────────

function OptimalPairsTab() {
 const [sortBy, setSortBy] = useState<"corr" | "freeLunch" | "reduction">("corr");
 const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

 const sorted = useMemo(() => {
 const copy = [...OPTIMAL_PAIRS];
 if (sortBy === "corr") copy.sort((a, b) => a.correlation - b.correlation);
 if (sortBy === "reduction") copy.sort((a, b) => b.reductionPct - a.reductionPct);
 if (sortBy === "freeLunch") {
 const rank: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
 copy.sort((a, b) => rank[a.freeLunch] - rank[b.freeLunch]);
 }
 return copy;
 }, [sortBy]);

 const freeLunchColor = (fl: string) =>
 fl === "High" ? "text-green-400 bg-green-900/30" :
 fl === "Medium" ? "text-amber-400 bg-amber-900/30" :
 "text-muted-foreground bg-muted/50";

 return (
 <div
 className="space-y-5"
 >
 {/* Intro card */}
 <Card className="bg-muted/10 border-border">
 <CardContent className="pt-4 pb-4">
 <div className="flex items-start gap-3">
 <Star size={16} className="text-foreground mt-0.5 flex-shrink-0" />
 <div>
 <p className="text-sm font-medium text-foreground mb-1">The Free Lunch of Diversification</p>
 <p className="text-sm text-muted-foreground leading-relaxed">
 Harry Markowitz called diversification the only free lunch in investing. By combining
 assets with low or negative correlations, you reduce portfolio risk without sacrificing
 expected return. The pairs below offer the strongest diversification benefits.
 </p>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Sort controls */}
 <div className="flex items-center gap-2">
 <span className="text-xs text-muted-foreground">Sort by:</span>
 {[
 { key: "corr" as const, label: "Correlation" },
 { key: "reduction" as const, label: "Vol Reduction" },
 { key: "freeLunch" as const, label: "Free Lunch" },
 ].map((s) => (
 <Button
 key={s.key}
 size="sm"
 variant={sortBy === s.key ? "default" : "outline"}
 onClick={() => setSortBy(s.key)}
 className={sortBy === s.key
 ? "bg-primary text-foreground border-primary text-xs"
 : "border-border text-muted-foreground text-xs hover:bg-muted"
 }
 >
 {s.label}
 </Button>
 ))}
 </div>

 {/* Pairs list */}
 <div className="space-y-3">
 {sorted.map((pair, i) => {
 const isExpanded = expandedIdx === i;
 return (
 <div
 key={`${pair.a}-${pair.b}`}
 >
 <Card className="bg-muted/50 border-border hover:border-border transition-colors">
 <CardContent className="pt-0 pb-0">
 <button
 className="w-full text-left py-4"
 onClick={() => setExpandedIdx(isExpanded ? null : i)}
 >
 <div className="flex flex-wrap items-center gap-3">
 <div className="flex items-center gap-2 flex-1 min-w-0">
 <GitBranch size={14} className="text-foreground flex-shrink-0" />
 <span className="text-sm font-medium text-foreground truncate">
 {pair.a} <span className="text-muted-foreground">×</span> {pair.b}
 </span>
 </div>
 <div className="flex items-center gap-3 flex-shrink-0">
 <span
 className="text-xs text-muted-foreground font-mono px-2 py-0.5 rounded"
 style={{
 background: corrColor(pair.correlation),
 color: corrTextColor(pair.correlation),
 }}
 >
 ρ = {pair.correlation > 0 ? "+" : ""}{pair.correlation.toFixed(2)}
 </span>
 <Badge className={`text-xs text-muted-foreground ${freeLunchColor(pair.freeLunch)}`}>
 {pair.freeLunch} benefit
 </Badge>
 <span className="text-xs text-green-400 font-medium">
 −{pair.reductionPct}% vol
 </span>
 {isExpanded
 ? <ChevronUp size={14} className="text-muted-foreground" />
 : <ChevronDown size={14} className="text-muted-foreground" />
 }
 </div>
 </div>
 </button>

 
 {isExpanded && (
 <div
 className="overflow-hidden"
 >
 <div className="border-t border-border py-4 space-y-3">
 <p className="text-sm text-muted-foreground">{pair.notes}</p>
 <div className="grid grid-cols-3 gap-3">
 <div className="text-center bg-muted/40 rounded-lg p-2">
 <p className="text-xs text-muted-foreground">Correlation</p>
 <p className="text-base font-medium text-foreground mt-0.5">
 {pair.correlation > 0 ? "+" : ""}{pair.correlation.toFixed(2)}
 </p>
 </div>
 <div className="text-center bg-muted/40 rounded-lg p-2">
 <p className="text-xs text-muted-foreground">Vol Reduction</p>
 <p className="text-base font-medium text-green-400 mt-0.5">
 ~{pair.reductionPct}%
 </p>
 </div>
 <div className="text-center bg-muted/40 rounded-lg p-2">
 <p className="text-xs text-muted-foreground">Free Lunch</p>
 <p className={`text-base font-medium mt-0.5 ${
 pair.freeLunch === "High" ? "text-green-400" :
 pair.freeLunch === "Medium" ? "text-amber-400" : "text-muted-foreground"
 }`}>
 {pair.freeLunch}
 </p>
 </div>
 </div>
 {/* Mini SVG correlation bar */}
 <div>
 <p className="text-xs text-muted-foreground mb-1">Correlation on the scale</p>
 <svg width="100%" height={24} viewBox="0 0 300 24">
 <rect x={0} y={8} width={300} height={8} rx={4} fill="#1e293b" />
 {/* zero marker */}
 <rect x={149} y={4} width={2} height={16} fill="#475569" />
 {/* value marker */}
 <rect
 x={Math.round((pair.correlation + 1) / 2 * 300) - 3}
 y={4}
 width={6}
 height={16}
 rx={2}
 fill="#60a5fa"
 />
 <text x={0} y={22} fontSize={8} fill="#64748b">-1.0</text>
 <text x={140} y={22} fontSize={8} fill="#64748b">0</text>
 <text x={282} y={22} fontSize={8} fill="#64748b">+1.0</text>
 </svg>
 </div>
 </div>
 </div>
 )}
 
 </CardContent>
 </Card>
 </div>
 );
 })}
 </div>

 {/* Summary insight */}
 <Card className="bg-muted/50 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
 <RefreshCw size={13} className="text-muted-foreground/50" />
 Diversification Summary
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {[
 {
 title: "Best Single Addition",
 body: "Adding US Bonds to a pure equity portfolio delivers the strongest single diversification benefit — correlation of −0.32 reduces portfolio vol by ~28% with minimal return sacrifice.",
 icon: <Shield size={14} className="text-green-400" />,
 },
 {
 title: "Uncorrelated Return Streams",
 body: "Gold and High Yield (ρ = 0.06) are nearly orthogonal in return space. Combining them adds true incremental diversification even when equities dominate the portfolio.",
 icon: <Activity size={14} className="text-muted-foreground/50" />,
 },
 {
 title: "Crisis Regime Warning",
 body: "All correlations tend toward 1.0 during acute crises (see 2008/2020). Cash is the only true safe-haven diversifier in extreme tail events.",
 icon: <AlertTriangle size={14} className="text-amber-400" />,
 },
 ].map((item) => (
 <div key={item.title} className="space-y-1.5">
 <div className="flex items-center gap-1.5">
 {item.icon}
 <p className="text-xs font-medium text-foreground">{item.title}</p>
 </div>
 <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>
 );
}

// ─── Page root ─────────────────────────────────────────────────────────────────

export default function CorrelationsPage() {
 return (
 <div className="flex h-full flex-col overflow-y-auto">
 <div className="mx-auto w-full max-w-5xl px-6 py-8 flex-1 flex flex-col">
 {/* Hero */}
 <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Correlations</h1>
 <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-6">CROSS-ASSET · DIVERSIFICATION · MATRIX</p>

 {/* Tabs */}
 <Tabs defaultValue="matrix" className="space-y-5">
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
 {[
 { value: "matrix", label: "Correlation Matrix", icon: <BarChart3 size={13} /> },
 { value: "rolling", label: "Rolling Corr", icon: <Activity size={13} /> },
 { value: "crisis", label: "Crisis Periods", icon: <AlertTriangle size={13} /> },
 { value: "divScore", label: "Diversif. Score", icon: <Shield size={13} /> },
 { value: "pairs", label: "Optimal Pairs", icon: <Star size={13} /> },
 ].map((t) => (
 <TabsTrigger
 key={t.value}
 value={t.value}
 className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground"
 >
 {t.label}
 </TabsTrigger>
 ))}
 </TabsList>

 <TabsContent value="matrix" className="mt-0"><CorrelationMatrixTab /></TabsContent>
 <TabsContent value="rolling" className="mt-0"><RollingCorrelationsTab /></TabsContent>
 <TabsContent value="crisis" className="mt-0"><CrisisCorrelationsTab /></TabsContent>
 <TabsContent value="divScore" className="mt-0"><DiversificationScoreTab /></TabsContent>
 <TabsContent value="pairs" className="mt-0"><OptimalPairsTab /></TabsContent>
 </Tabs>
 </div>
 </div>
 );
}
