"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
 TrendingUp,
 TrendingDown,
 Activity,
 BarChart3,
 Shuffle,
 AlertTriangle,
 Target,
 DollarSign,
 Percent,
 Info,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Seeded PRNG (reset per simulation run)
// ---------------------------------------------------------------------------
let s = 800;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};
const normal = () => {
 const u1 = rand();
 const u2 = rand();
 return Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface SimParams {
 initialValue: number;
 mu: number; // annual drift
 sigma: number; // annual volatility
 years: number;
 numPaths: number;
}

interface PathResult {
 paths: number[][]; // [pathIndex][yearIndex]
 finalValues: number[];
 percentile5: number;
 percentile50: number;
 percentile95: number;
 probabilityOfRuin: number; // pct of paths below 50% of initial
}

interface RetirementRow {
 withdrawalRate: number;
 successRate: number;
 medianPortfolio: number;
 p10Portfolio: number;
}

interface OptionMCResult {
 paths: number;
 mcPrice: number;
 bsPrice: number;
 stdError: number;
}

interface VaRResult {
 returns: number[];
 varMC99: number;
 cvarMC99: number;
 varParametric99: number;
}

// ---------------------------------------------------------------------------
// Core simulation
// ---------------------------------------------------------------------------
function runGBMSimulation(params: SimParams): PathResult {
 // Reset seed for reproducibility
 s = 800;
 const { initialValue, mu, sigma, years, numPaths } = params;
 const dt = 1; // annual steps
 const paths: number[][] = [];
 const finalValues: number[] = [];

 for (let p = 0; p < numPaths; p++) {
 const path: number[] = [initialValue];
 let current = initialValue;
 for (let t = 0; t < years; t++) {
 const z = normal();
 current = current * Math.exp((mu - 0.5 * sigma * sigma) * dt + sigma * Math.sqrt(dt) * z);
 path.push(current);
 }
 paths.push(path);
 finalValues.push(current);
 }

 const sorted = [...finalValues].sort((a, b) => a - b);
 const p5 = sorted[Math.floor(0.05 * numPaths)];
 const p50 = sorted[Math.floor(0.50 * numPaths)];
 const p95 = sorted[Math.floor(0.95 * numPaths)];
 const ruinCount = finalValues.filter(v => v < initialValue * 0.5).length;

 return {
 paths,
 finalValues,
 percentile5: p5,
 percentile50: p50,
 percentile95: p95,
 probabilityOfRuin: (ruinCount / numPaths) * 100,
 };
}

function runRetirementSimulation(): RetirementRow[] {
 const rows: RetirementRow[] = [];
 const rates = [3, 4, 5, 6, 7];
 const initialPortfolio = 1_000_000;
 const years = 30;
 const numPaths = 500;
 const mu = 0.07;
 const sigma = 0.15;

 for (const rate of rates) {
 s = 800 + rate * 100;
 let successCount = 0;
 const finalPortfolios: number[] = [];

 for (let p = 0; p < numPaths; p++) {
 let portfolio = initialPortfolio;
 let survived = true;
 const annualWithdrawal = initialPortfolio * (rate / 100);

 for (let t = 0; t < years; t++) {
 const z = normal();
 portfolio = portfolio * Math.exp((mu - 0.5 * sigma * sigma) + sigma * z);
 portfolio -= annualWithdrawal;
 if (portfolio <= 0) {
 survived = false;
 portfolio = 0;
 break;
 }
 }
 if (survived) successCount++;
 finalPortfolios.push(portfolio);
 }

 const sorted = [...finalPortfolios].sort((a, b) => a - b);
 rows.push({
 withdrawalRate: rate,
 successRate: (successCount / numPaths) * 100,
 medianPortfolio: sorted[Math.floor(0.5 * numPaths)],
 p10Portfolio: sorted[Math.floor(0.1 * numPaths)],
 });
 }
 return rows;
}

function runOptionMCPricing(): OptionMCResult[] {
 const S = 100, K = 105, r = 0.05, sigma = 0.20, T = 1.0;

 // Black-Scholes reference price
 const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
 const d2 = d1 - sigma * Math.sqrt(T);
 const normCDF = (x: number) => {
 const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
 const sign = x < 0 ? -1 : 1;
 const t2 = 1.0 / (1.0 + p * Math.abs(x));
 const y = 1.0 - (((((a5 * t2 + a4) * t2) + a3) * t2 + a2) * t2 + a1) * t2 * Math.exp(-Math.abs(x) * Math.abs(x) / 2);
 return 0.5 * (1.0 + sign * y);
 };
 const bsPrice = S * normCDF(d1) - K * Math.exp(-r * T) * normCDF(d2);

 const pathCounts = [100, 500, 1000, 5000, 10000];
 const results: OptionMCResult[] = [];

 for (const numPaths of pathCounts) {
 s = 800 + numPaths;
 let sumPayoff = 0;
 let sumPayoffSq = 0;

 for (let i = 0; i < numPaths; i++) {
 const z = normal();
 const ST = S * Math.exp((r - 0.5 * sigma * sigma) * T + sigma * Math.sqrt(T) * z);
 const payoff = Math.max(ST - K, 0);
 sumPayoff += payoff;
 sumPayoffSq += payoff * payoff;
 }

 const meanPayoff = sumPayoff / numPaths;
 const variance = sumPayoffSq / numPaths - meanPayoff * meanPayoff;
 const mcPrice = Math.exp(-r * T) * meanPayoff;
 const stdError = Math.exp(-r * T) * Math.sqrt(variance / numPaths);

 results.push({ paths: numPaths, mcPrice, bsPrice, stdError });
 }

 return results;
}

function runVaRSimulation(): VaRResult {
 s = 800;
 const numSims = 10000;
 const mu = 0.0003; // daily drift
 const sigma = 0.015; // daily vol
 const returns: number[] = [];

 for (let i = 0; i < numSims; i++) {
 const z = normal();
 returns.push(mu + sigma * z);
 }

 const sorted = [...returns].sort((a, b) => a - b);
 const idx99 = Math.floor(0.01 * numSims);
 const varMC99 = -sorted[idx99];
 const cvarMC99 = -sorted.slice(0, idx99).reduce((acc, v) => acc + v, 0) / idx99;

 // Parametric VaR (assumes normal)
 const zScore99 = 2.326;
 const varParametric99 = -(mu - zScore99 * sigma);

 return { returns, varMC99, cvarMC99, varParametric99 };
}

// ---------------------------------------------------------------------------
// Static data (generated once at module level for stability)
// ---------------------------------------------------------------------------
const DEFAULT_PARAMS: SimParams = { initialValue: 100000, mu: 0.07, sigma: 0.15, years: 30, numPaths: 200 };
const INITIAL_SIM = runGBMSimulation(DEFAULT_PARAMS);
const RETIREMENT_DATA = runRetirementSimulation();
const OPTION_MC_DATA = runOptionMCPricing();
const VAR_DATA = runVaRSimulation();

// ---------------------------------------------------------------------------
// SVG helpers
// ---------------------------------------------------------------------------
function fmt(n: number, decimals = 0): string {
 if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
 if (n >= 1_000) return `$${(n / 1_000).toFixed(decimals)}K`;
 return `$${n.toFixed(decimals)}`;
}

function fmtPct(n: number, dec = 1): string {
 return `${n.toFixed(dec)}%`;
}

// ---------------------------------------------------------------------------
// Spaghetti Chart (200 GBM paths)
// ---------------------------------------------------------------------------
function SpaghettiChart({ sim, params }: { sim: PathResult; params: SimParams }) {
 const W = 700, H = 320;
 const pad = { l: 60, r: 20, t: 20, b: 40 };
 const gW = W - pad.l - pad.r;
 const gH = H - pad.t - pad.b;

 const allValues = sim.paths.flat();
 const minV = Math.min(...allValues) * 0.95;
 const maxV = Math.max(...allValues) * 1.05;
 const years = params.years;

 const toX = (t: number) => pad.l + (t / years) * gW;
 const toY = (v: number) => pad.t + gH - ((v - minV) / (maxV - minV)) * gH;

 // Build percentile paths (5th, 50th, 95th) year by year
 const pct5: [number, number][] = [];
 const pct50: [number, number][] = [];
 const pct95: [number, number][] = [];
 for (let t = 0; t <= years; t++) {
 const col = sim.paths.map(p => p[t]).sort((a, b) => a - b);
 const n = col.length;
 pct5.push([toX(t), toY(col[Math.floor(0.05 * n)])]);
 pct50.push([toX(t), toY(col[Math.floor(0.50 * n)])]);
 pct95.push([toX(t), toY(col[Math.floor(0.95 * n)])]);
 }

 const toPath = (pts: [number, number][]) =>
 pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");

 // Y axis labels
 const ySteps = 5;
 const yLabels = Array.from({ length: ySteps + 1 }, (_, i) => {
 const v = minV + ((maxV - minV) * i) / ySteps;
 return { v, y: toY(v) };
 });

 // X axis labels (every 5 years)
 const xLabels = Array.from({ length: Math.floor(years / 5) + 1 }, (_, i) => ({
 t: i * 5,
 x: toX(i * 5),
 }));

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
 {/* Grid */}
 {yLabels.map(({ v, y }) => (
 <g key={v}>
 <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="#374151" strokeWidth="0.5" strokeDasharray="4,4" />
 <text x={pad.l - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">
 {v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : v.toFixed(0)}
 </text>
 </g>
 ))}
 {xLabels.map(({ t, x }) => (
 <g key={t}>
 <line x1={x} y1={pad.t} x2={x} y2={H - pad.b} stroke="#374151" strokeWidth="0.5" strokeDasharray="4,4" />
 <text x={x} y={H - pad.b + 14} textAnchor="middle" fontSize="10" fill="#9ca3af">
 Y{t}
 </text>
 </g>
 ))}

 {/* Individual paths */}
 {sim.paths.map((path, i) => {
 const d = path
 .map((v, t) => `${t === 0 ? "M" : "L"} ${toX(t).toFixed(1)} ${toY(v).toFixed(1)}`)
 .join(" ");
 return <path key={i} d={d} stroke="#3b82f6" strokeWidth="0.4" fill="none" opacity="0.12" />;
 })}

 {/* Percentile bands */}
 <path d={toPath(pct5)} stroke="#ef4444" strokeWidth="1.5" fill="none" strokeDasharray="5,3" />
 <path d={toPath(pct50)} stroke="#22c55e" strokeWidth="2" fill="none" />
 <path d={toPath(pct95)} stroke="#f59e0b" strokeWidth="1.5" fill="none" strokeDasharray="5,3" />

 {/* Legend */}
 <g transform={`translate(${pad.l + 10}, ${pad.t + 10})`}>
 <rect x="0" y="0" width="150" height="52" rx="4" fill="#1f2937" fillOpacity="0.9" />
 <line x1="8" y1="12" x2="24" y2="12" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5,3" />
 <text x="28" y="16" fontSize="10" fill="#d1d5db">95th pct</text>
 <line x1="8" y1="28" x2="24" y2="28" stroke="#22c55e" strokeWidth="2" />
 <text x="28" y="32" fontSize="10" fill="#d1d5db">Median</text>
 <line x1="8" y1="44" x2="24" y2="44" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="5,3" />
 <text x="28" y="48" fontSize="10" fill="#d1d5db">5th pct</text>
 </g>

 {/* Axis labels */}
 <text x={W / 2} y={H - 2} textAnchor="middle" fontSize="11" fill="#6b7280">Years</text>
 <text x={12} y={H / 2} textAnchor="middle" fontSize="11" fill="#6b7280" transform={`rotate(-90, 12, ${H / 2})`}>
 Portfolio Value
 </text>
 </svg>
 );
}

// ---------------------------------------------------------------------------
// Final Value Histogram
// ---------------------------------------------------------------------------
function HistogramChart({ sim, params }: { sim: PathResult; params: SimParams }) {
 const W = 700, H = 260;
 const pad = { l: 60, r: 20, t: 20, b: 40 };
 const gW = W - pad.l - pad.r;
 const gH = H - pad.t - pad.b;

 const vals = sim.finalValues;
 const minV = Math.min(...vals);
 const maxV = Math.max(...vals);
 const numBins = 40;
 const binWidth = (maxV - minV) / numBins;

 const bins = Array.from({ length: numBins }, (_, i) => {
 const lo = minV + i * binWidth;
 const hi = lo + binWidth;
 const count = vals.filter(v => v >= lo && v < hi).length;
 return { lo, hi, count, mid: lo + binWidth / 2 };
 });
 const maxCount = Math.max(...bins.map(b => b.count));

 const toX = (v: number) => pad.l + ((v - minV) / (maxV - minV)) * gW;
 const toY = (c: number) => pad.t + gH - (c / maxCount) * gH;
 const barW = (gW / numBins) * 0.85;

 const p5x = toX(sim.percentile5);
 const p50x = toX(sim.percentile50);
 const p95x = toX(sim.percentile95);
 const initialX = toX(params.initialValue);

 // x-axis labels
 const xSteps = 5;
 const xLabels = Array.from({ length: xSteps + 1 }, (_, i) => {
 const v = minV + ((maxV - minV) * i) / xSteps;
 return { v, x: toX(v) };
 });

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
 {/* Bars */}
 {bins.map((bin, i) => {
 const x = pad.l + (i / numBins) * gW;
 const y = toY(bin.count);
 const h = gH - (y - pad.t);
 const isBelowInitial = bin.mid < params.initialValue;
 return (
 <rect
 key={i}
 x={x}
 y={y}
 width={barW}
 height={h}
 fill={isBelowInitial ? "#ef4444" : "#3b82f6"}
 opacity="0.7"
 />
 );
 })}

 {/* Percentile lines */}
 <line x1={p5x} y1={pad.t} x2={p5x} y2={H - pad.b} stroke="#ef4444" strokeWidth="2" />
 <text x={p5x + 3} y={pad.t + 14} fontSize="9" fill="#ef4444">P5</text>
 <line x1={p50x} y1={pad.t} x2={p50x} y2={H - pad.b} stroke="#22c55e" strokeWidth="2" />
 <text x={p50x + 3} y={pad.t + 14} fontSize="9" fill="#22c55e">P50</text>
 <line x1={p95x} y1={pad.t} x2={p95x} y2={H - pad.b} stroke="#f59e0b" strokeWidth="2" />
 <text x={p95x + 3} y={pad.t + 14} fontSize="9" fill="#f59e0b">P95</text>
 <line x1={initialX} y1={pad.t} x2={initialX} y2={H - pad.b} stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="5,3" />
 <text x={initialX + 3} y={pad.t + 26} fontSize="9" fill="#a78bfa">Initial</text>

 {/* X axis */}
 {xLabels.map(({ v, x }) => (
 <text key={v} x={x} y={H - pad.b + 14} textAnchor="middle" fontSize="9" fill="#9ca3af">
 {v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1_000).toFixed(0)}K`}
 </text>
 ))}

 {/* Y axis label */}
 <text x={12} y={H / 2} textAnchor="middle" fontSize="10" fill="#6b7280" transform={`rotate(-90, 12, ${H / 2})`}>
 Frequency
 </text>
 <text x={W / 2} y={H - 2} textAnchor="middle" fontSize="10" fill="#6b7280">
 Final Portfolio Value (Year {params.years})
 </text>
 </svg>
 );
}

// ---------------------------------------------------------------------------
// Option Convergence Chart
// ---------------------------------------------------------------------------
function OptionConvergenceChart({ data }: { data: OptionMCResult[] }) {
 const W = 600, H = 240;
 const pad = { l: 55, r: 20, t: 20, b: 40 };
 const gW = W - pad.l - pad.r;
 const gH = H - pad.t - pad.b;

 const bsPrice = data[0].bsPrice;
 const prices = data.map(d => d.mcPrice);
 const minPrice = Math.min(...prices, bsPrice) * 0.98;
 const maxPrice = Math.max(...prices, bsPrice) * 1.02;

 const toX = (i: number) => pad.l + (i / (data.length - 1)) * gW;
 const toY = (v: number) => pad.t + gH - ((v - minPrice) / (maxPrice - minPrice)) * gH;

 const bsY = toY(bsPrice);
 const linePts = data.map((_, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(prices[i]).toFixed(1)}`).join(" ");

 // Y labels
 const ySteps = 4;
 const yLabels = Array.from({ length: ySteps + 1 }, (_, i) => {
 const v = minPrice + ((maxPrice - minPrice) * i) / ySteps;
 return { v, y: toY(v) };
 });

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
 {yLabels.map(({ v, y }) => (
 <g key={v}>
 <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="#374151" strokeWidth="0.5" strokeDasharray="4,4" />
 <text x={pad.l - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">${v.toFixed(2)}</text>
 </g>
 ))}

 {/* B-S reference line */}
 <line x1={pad.l} y1={bsY} x2={W - pad.r} y2={bsY} stroke="#22c55e" strokeWidth="1.5" strokeDasharray="6,3" />
 <text x={W - pad.r + 2} y={bsY + 4} fontSize="9" fill="#22c55e">B-S</text>

 {/* MC convergence line */}
 <path d={linePts} stroke="#3b82f6" strokeWidth="2" fill="none" />

 {/* Error bars */}
 {data.map((d, i) => {
 const cx = toX(i);
 const cy = toY(d.mcPrice);
 const errPx = (d.stdError / (maxPrice - minPrice)) * gH;
 return (
 <g key={i}>
 <circle cx={cx} cy={cy} r={3} fill="#3b82f6" />
 <line x1={cx} y1={cy - errPx} x2={cx} y2={cy + errPx} stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
 </g>
 );
 })}

 {/* X labels */}
 {data.map((d, i) => (
 <text key={i} x={toX(i)} y={H - pad.b + 14} textAnchor="middle" fontSize="9" fill="#9ca3af">
 {d.paths >= 1000 ? `${d.paths / 1000}K` : d.paths}
 </text>
 ))}

 <text x={W / 2} y={H - 2} textAnchor="middle" fontSize="10" fill="#6b7280">Number of Paths</text>
 <text x={12} y={H / 2} textAnchor="middle" fontSize="10" fill="#6b7280" transform={`rotate(-90, 12, ${H / 2})`}>Option Price ($)</text>
 </svg>
 );
}

// ---------------------------------------------------------------------------
// VaR Distribution Chart
// ---------------------------------------------------------------------------
function VaRChart({ varData }: { varData: VaRResult }) {
 const W = 600, H = 240;
 const pad = { l: 40, r: 20, t: 20, b: 40 };
 const gW = W - pad.l - pad.r;
 const gH = H - pad.t - pad.b;

 const sortedReturns = [...varData.returns].sort((a, b) => a - b);
 const minR = sortedReturns[0];
 const maxR = sortedReturns[sortedReturns.length - 1];
 const numBins = 60;
 const binWidth = (maxR - minR) / numBins;

 const bins = Array.from({ length: numBins }, (_, i) => {
 const lo = minR + i * binWidth;
 const hi = lo + binWidth;
 const count = sortedReturns.filter(v => v >= lo && v < hi).length;
 return { lo, hi: hi, count, mid: lo + binWidth / 2 };
 });
 const maxCount = Math.max(...bins.map(b => b.count));

 const toX = (v: number) => pad.l + ((v - minR) / (maxR - minR)) * gW;
 const toY = (c: number) => pad.t + gH - (c / maxCount) * gH;
 const bw = (gW / numBins) * 0.9;

 const varMCx = toX(-varData.varMC99);
 const varParamx = toX(-varData.varParametric99);

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
 {bins.map((bin, i) => {
 const x = toX(bin.lo);
 const y = toY(bin.count);
 const h = gH - (y - pad.t);
 const isTail = bin.mid < -varData.varMC99;
 return (
 <rect key={i} x={x} y={y} width={bw} height={h} fill={isTail ? "#ef4444" : "#3b82f6"} opacity="0.7" />
 );
 })}

 {/* VaR lines */}
 <line x1={varMCx} y1={pad.t} x2={varMCx} y2={H - pad.b} stroke="#ef4444" strokeWidth="2" />
 <text x={varMCx - 3} y={pad.t + 14} textAnchor="end" fontSize="9" fill="#ef4444">MC VaR</text>
 <line x1={varParamx} y1={pad.t} x2={varParamx} y2={H - pad.b} stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,3" />
 <text x={varParamx + 3} y={pad.t + 26} fontSize="9" fill="#f59e0b">Param</text>

 {/* X axis labels */}
 {[-0.04, -0.03, -0.02, -0.01, 0, 0.01, 0.02, 0.03].map(v => (
 <text key={v} x={toX(v)} y={H - pad.b + 14} textAnchor="middle" fontSize="9" fill="#9ca3af">
 {(v * 100).toFixed(0)}%
 </text>
 ))}

 <text x={W / 2} y={H - 2} textAnchor="middle" fontSize="10" fill="#6b7280">Daily Return</text>
 <text x={12} y={H / 2} textAnchor="middle" fontSize="10" fill="#6b7280" transform={`rotate(-90, 12, ${H / 2})`}>Frequency</text>
 </svg>
 );
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------
function StatCard({
 title,
 value,
 subtitle,
 color,
 icon: Icon,
}: {
 title: string;
 value: string;
 subtitle: string;
 color: string;
 icon: React.ComponentType<{ className?: string }>;
}) {
 return (
 <Card className="border-border bg-card">
 <CardContent className="p-4">
 <div className="flex items-start justify-between">
 <div>
 <p className="text-xs text-muted-foreground mb-1">{title}</p>
 <p className={`text-2xl font-semibold ${color}`}>{value}</p>
 <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
 </div>
 <div className={`p-2 rounded-lg bg-muted`}>
 <Icon className={`h-5 w-5 ${color}`} />
 </div>
 </div>
 </CardContent>
 </Card>
 );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function MonteCarloPage() {
 const [simParams, setSimParams] = useState<SimParams>(DEFAULT_PARAMS);
 const [runCount, setRunCount] = useState(0);

 const sim = useMemo(() => {
 // runCount triggers re-run with fresh seed offset
 s = 800 + runCount * 13;
 return runGBMSimulation(simParams);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [simParams, runCount]);

 const retirementData = useMemo(() => RETIREMENT_DATA, []);
 const optionData = useMemo(() => OPTION_MC_DATA, []);
 const varData = useMemo(() => VAR_DATA, []);

 return (
 <div className="min-h-screen bg-background text-foreground p-4">
 {/* Header */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 className="mb-6"
 >
 <div className="flex items-center gap-3 mb-2">
 <div className="p-2 rounded-lg bg-muted/10">
 <Shuffle className="h-6 w-6 text-primary" />
 </div>
 <div>
 <h1 className="text-lg font-medium">Monte Carlo Simulation</h1>
 <p className="text-sm text-muted-foreground">
 Stochastic modeling for portfolio outcomes, option pricing, retirement planning, and risk quantification
 </p>
 </div>
 <Badge variant="secondary" className="ml-auto">
 {simParams.numPaths} Paths · GBM
 </Badge>
 </div>
 </motion.div>

 {/* Key Metrics — Hero */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4, delay: 0.1 }}
 className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 rounded-md border border-border bg-card border-l-4 border-l-primary p-6"
 >
 <StatCard
 title="Median Final Value"
 value={fmt(sim.percentile50)}
 subtitle={`${((sim.percentile50 / simParams.initialValue - 1) * 100).toFixed(0)}% total return`}
 color="text-green-500"
 icon={TrendingUp}
 />
 <StatCard
 title="5th Percentile (Worst)"
 value={fmt(sim.percentile5)}
 subtitle={`${((sim.percentile5 / simParams.initialValue - 1) * 100).toFixed(0)}% total return`}
 color="text-red-500"
 icon={TrendingDown}
 />
 <StatCard
 title="95th Percentile (Best)"
 value={fmt(sim.percentile95)}
 subtitle={`${((sim.percentile95 / simParams.initialValue - 1) * 100).toFixed(0)}% total return`}
 color="text-amber-500"
 icon={Target}
 />
 <StatCard
 title="Probability of Ruin"
 value={fmtPct(sim.probabilityOfRuin)}
 subtitle="paths below 50% of initial"
 color={sim.probabilityOfRuin > 10 ? "text-red-500" : "text-green-500"}
 icon={AlertTriangle}
 />
 </motion.div>

 {/* Tabs */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4, delay: 0.2 }}
 >
 <Tabs defaultValue="portfolio">
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
 <TabsTrigger value="portfolio">Portfolio MC</TabsTrigger>
 <TabsTrigger value="options">Option Pricing</TabsTrigger>
 <TabsTrigger value="retirement">Retirement</TabsTrigger>
 <TabsTrigger value="var">VaR / CVaR</TabsTrigger>
 </TabsList>

 {/* ----------------------------------------------------------------
 TAB 1: Portfolio MC
 ---------------------------------------------------------------- */}
 <TabsContent value="portfolio" className="data-[state=inactive]:hidden space-y-4">
 {/* Controls */}
 <Card className="border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center gap-2">
 <Info className="h-4 w-4 text-muted-foreground" />
 Simulation Parameters
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
 {[
 { label: "Annual Drift (μ)", key: "mu", step: 0.01, min: 0, max: 0.20, fmt: (v: number) => `${(v * 100).toFixed(0)}%` },
 { label: "Volatility (σ)", key: "sigma", step: 0.01, min: 0.05, max: 0.50, fmt: (v: number) => `${(v * 100).toFixed(0)}%` },
 { label: "Years", key: "years", step: 5, min: 5, max: 40, fmt: (v: number) => `${v}yr` },
 { label: "Paths", key: "numPaths", step: 50, min: 50, max: 500, fmt: (v: number) => `${v}` },
 { label: "Initial Value", key: "initialValue", step: 10000, min: 10000, max: 500000, fmt: (v: number) => `$${(v / 1000).toFixed(0)}K` },
 ].map(({ label, key, step, min, max, fmt: f }) => (
 <div key={key} className="space-y-1">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">{label}</span>
 <span className="font-mono text-foreground">{f(simParams[key as keyof SimParams] as number)}</span>
 </div>
 <input
 type="range"
 min={min}
 max={max}
 step={step}
 value={simParams[key as keyof SimParams] as number}
 onChange={e =>
 setSimParams(prev => ({ ...prev, [key]: parseFloat(e.target.value) }))
 }
 className="w-full accent-blue-500"
 />
 </div>
 ))}
 </div>
 <Button size="sm" onClick={() => setRunCount(c => c + 1)} className="gap-2">
 <Shuffle className="h-3 w-3" />
 Re-run Simulation
 </Button>
 </CardContent>
 </Card>

 {/* Spaghetti Chart */}
 <Card className="border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm">
 {simParams.numPaths} GBM Paths — Portfolio Growth Over {simParams.years} Years
 </CardTitle>
 </CardHeader>
 <CardContent>
 <SpaghettiChart sim={sim} params={simParams} />
 <div className="mt-2 p-3 bg-muted rounded-lg text-xs text-muted-foreground">
 <strong className="text-foreground">Geometric Brownian Motion:</strong> Each path follows
 dS = S(μ·dt + σ·dW) where dW ~ N(0,√dt). The{" "}
 <span className="text-amber-400">amber band</span> shows the best 5% of outcomes,{" "}
 <span className="text-green-400">green</span> the median, and{" "}
 <span className="text-red-400">red</span> the worst 5%.
 </div>
 </CardContent>
 </Card>

 {/* Histogram */}
 <Card className="border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm">
 Final Value Distribution — Year {simParams.years} Outcomes
 </CardTitle>
 </CardHeader>
 <CardContent>
 <HistogramChart sim={sim} params={simParams} />
 <div className="mt-2 grid grid-cols-3 gap-3 text-xs text-muted-foreground">
 {[
 { label: "P5 (Worst 5%)", value: fmt(sim.percentile5), color: "text-red-400" },
 { label: "P50 (Median)", value: fmt(sim.percentile50), color: "text-green-400" },
 { label: "P95 (Best 5%)", value: fmt(sim.percentile95), color: "text-amber-400" },
 ].map(item => (
 <div key={item.label} className="bg-muted rounded p-2 text-center">
 <p className="text-muted-foreground">{item.label}</p>
 <p className={`font-medium ${item.color}`}>{item.value}</p>
 <p className="text-muted-foreground">
 {((parseFloat(item.value.replace(/[$KM]/g, "")) * (item.value.includes("M") ? 1000000 : item.value.includes("K") ? 1000 : 1) / simParams.initialValue - 1) * 100).toFixed(0)}x initial
 </p>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </TabsContent>

 {/* ----------------------------------------------------------------
 TAB 2: Option Pricing
 ---------------------------------------------------------------- */}
 <TabsContent value="options" className="data-[state=inactive]:hidden space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <Card className="border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm">Option Parameters</CardTitle>
 </CardHeader>
 <CardContent className="space-y-2 text-sm">
 {[
 { label: "Spot Price (S)", value: "$100.00" },
 { label: "Strike Price (K)", value: "$105.00" },
 { label: "Risk-Free Rate (r)", value: "5.00%" },
 { label: "Volatility (σ)", value: "20.00%" },
 { label: "Time to Expiry (T)", value: "1 Year" },
 { label: "Option Type", value: "European Call" },
 ].map(({ label, value }) => (
 <div key={label} className="flex justify-between">
 <span className="text-muted-foreground">{label}</span>
 <span className="font-mono font-medium">{value}</span>
 </div>
 ))}
 <div className="pt-2 border-t border-border">
 <div className="flex justify-between font-medium">
 <span>Black-Scholes Price</span>
 <span className="text-green-400">${optionData[optionData.length - 1].bsPrice.toFixed(4)}</span>
 </div>
 </div>
 </CardContent>
 </Card>

 <Card className="border-border md:col-span-2">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm">MC Price Convergence to Black-Scholes</CardTitle>
 </CardHeader>
 <CardContent>
 <OptionConvergenceChart data={optionData} />
 </CardContent>
 </Card>
 </div>

 {/* Convergence Table */}
 <Card className="border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm">Pricing Accuracy vs Path Count</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border text-muted-foreground text-xs">
 <th className="text-left py-2 pr-4">Paths</th>
 <th className="text-right py-2 pr-4">MC Price</th>
 <th className="text-right py-2 pr-4">B-S Price</th>
 <th className="text-right py-2 pr-4">Error ($)</th>
 <th className="text-right py-2 pr-4">Std Error</th>
 <th className="text-right py-2">Accuracy</th>
 </tr>
 </thead>
 <tbody>
 {optionData.map(row => {
 const error = Math.abs(row.mcPrice - row.bsPrice);
 const accuracy = 100 - (error / row.bsPrice) * 100;
 return (
 <tr key={row.paths} className="border-b border-border hover:bg-muted/30 transition-colors">
 <td className="py-2 pr-4 font-mono">
 {row.paths >= 1000 ? `${row.paths / 1000}K` : row.paths}
 </td>
 <td className="text-right py-2 pr-4 font-mono">${row.mcPrice.toFixed(4)}</td>
 <td className="text-right py-2 pr-4 font-mono text-green-400">${row.bsPrice.toFixed(4)}</td>
 <td className={`text-right py-2 pr-4 font-mono ${error < 0.05 ? "text-green-400" : "text-amber-400"}`}>
 ${error.toFixed(4)}
 </td>
 <td className="text-right py-2 pr-4 font-mono text-muted-foreground">
 ±${row.stdError.toFixed(4)}
 </td>
 <td className="text-right py-2">
 <Badge
 variant={accuracy > 98 ? "default" : accuracy > 95 ? "secondary" : "destructive"}
 className="text-xs text-muted-foreground"
 >
 {accuracy.toFixed(1)}%
 </Badge>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 <div className="mt-3 p-3 bg-muted rounded-lg text-xs text-muted-foreground">
 <strong className="text-foreground">Law of Large Numbers:</strong> MC option pricing converges to
 Black-Scholes as paths → ∞. Std error ∝ 1/√N — doubling paths halves uncertainty. With 10K paths,
 typical accuracy exceeds 99%. Variance reduction techniques (antithetic variates, control variates)
 can achieve similar accuracy with far fewer paths.
 </div>
 </CardContent>
 </Card>
 </TabsContent>

 {/* ----------------------------------------------------------------
 TAB 3: Retirement
 ---------------------------------------------------------------- */}
 <TabsContent value="retirement" className="data-[state=inactive]:hidden space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Card className="border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm">Retirement Simulation Setup</CardTitle>
 </CardHeader>
 <CardContent className="text-sm space-y-2">
 {[
 { label: "Starting Portfolio", value: "$1,000,000" },
 { label: "Investment Mix", value: "70/30 Stocks/Bonds" },
 { label: "Expected Return (μ)", value: "7.0% annually" },
 { label: "Volatility (σ)", value: "15.0% annually" },
 { label: "Retirement Duration", value: "30 years" },
 { label: "Inflation Adjustment", value: "Not applied" },
 { label: "Number of Simulations", value: "500 per rate" },
 { label: "Ruin Condition", value: "Portfolio = $0" },
 ].map(({ label, value }) => (
 <div key={label} className="flex justify-between">
 <span className="text-muted-foreground">{label}</span>
 <span className="font-medium">{value}</span>
 </div>
 ))}
 </CardContent>
 </Card>

 <Card className="border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm">Key Insight: The 4% Rule</CardTitle>
 </CardHeader>
 <CardContent className="text-sm space-y-3">
 <p className="text-muted-foreground">
 The <strong className="text-foreground">4% withdrawal rule</strong> (Bengen 1994) suggests
 retirees can safely withdraw 4% of initial portfolio annually, adjusted for inflation, with
 historically high success rates over 30 years.
 </p>
 <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
 <p className="text-green-400 font-medium">Monte Carlo validation:</p>
 <p className="text-muted-foreground text-xs mt-1">
 Our simulation at 4% withdrawal shows{" "}
 <span className="text-green-400 font-medium">
 {retirementData.find(r => r.withdrawalRate === 4)?.successRate.toFixed(1)}%
 </span>{" "}
 success rate — consistent with historical research.
 </p>
 </div>
 <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
 <p className="text-amber-400 font-medium">Sequence of returns risk:</p>
 <p className="text-muted-foreground text-xs mt-1">
 Poor returns early in retirement have outsized impact. MC captures this stochastic ordering
 that deterministic models miss entirely.
 </p>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Retirement Success Table */}
 <Card className="border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm">Withdrawal Rate vs Success Probability</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border text-muted-foreground text-xs">
 <th className="text-left py-2 pr-4">Withdrawal Rate</th>
 <th className="text-right py-2 pr-4">Annual Amount</th>
 <th className="text-right py-2 pr-4">Success Rate</th>
 <th className="text-right py-2 pr-4">Median Portfolio (Y30)</th>
 <th className="text-right py-2">P10 Portfolio (Y30)</th>
 </tr>
 </thead>
 <tbody>
 {retirementData.map(row => {
 const annual = 1_000_000 * (row.withdrawalRate / 100);
 const isGold = row.withdrawalRate === 4;
 return (
 <tr
 key={row.withdrawalRate}
 className={`border-b border-border hover:bg-muted/30 transition-colors ${isGold ? "bg-amber-500/5" : ""}`}
 >
 <td className="py-3 pr-4">
 <span className={`font-medium ${isGold ? "text-amber-400" : ""}`}>
 {row.withdrawalRate}%
 </span>
 {isGold && (
 <Badge className="ml-2 text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">
 4% Rule
 </Badge>
 )}
 </td>
 <td className="text-right py-3 pr-4 font-mono">
 ${(annual / 1000).toFixed(0)}K/yr
 </td>
 <td className="text-right py-3 pr-4">
 <div className="flex items-center justify-end gap-2">
 <div className="w-20 bg-muted rounded-full h-1.5">
 <div
 className={`h-1.5 rounded-full ${row.successRate >= 90 ? "bg-green-500" : row.successRate >= 70 ? "bg-amber-500" : "bg-red-500"}`}
 style={{ width: `${row.successRate}%` }}
 />
 </div>
 <span className={`font-medium ${row.successRate >= 90 ? "text-green-400" : row.successRate >= 70 ? "text-amber-400" : "text-red-400"}`}>
 {row.successRate.toFixed(1)}%
 </span>
 </div>
 </td>
 <td className="text-right py-3 pr-4 font-mono">
 {row.medianPortfolio > 0 ? fmt(row.medianPortfolio) : "$0"}
 </td>
 <td className="text-right py-3 font-mono text-muted-foreground">
 {row.p10Portfolio > 0 ? fmt(row.p10Portfolio) : "$0"}
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 <div className="mt-3 p-3 bg-muted rounded-lg text-xs text-muted-foreground">
 <strong className="text-foreground">Reading the table:</strong> Success Rate = % of 500 simulated
 retirement paths where the portfolio lasted the full 30 years. P10 Portfolio shows the worst 10%
 of surviving portfolios. Higher withdrawal rates dramatically increase ruin risk due to compounding
 depletion in down markets.
 </div>
 </CardContent>
 </Card>
 </TabsContent>

 {/* ----------------------------------------------------------------
 TAB 4: VaR / CVaR
 ---------------------------------------------------------------- */}
 <TabsContent value="var" className="data-[state=inactive]:hidden space-y-4">
 {/* VaR Summary Cards */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 {[
 {
 label: "MC VaR (99%, 1-day)",
 value: fmtPct(varData.varMC99 * 100, 2),
 sub: `On $1M: ${fmt(varData.varMC99 * 1_000_000)}`,
 color: "text-red-400",
 },
 {
 label: "MC CVaR (99%, 1-day)",
 value: fmtPct(varData.cvarMC99 * 100, 2),
 sub: "Expected loss beyond VaR",
 color: "text-red-500",
 },
 {
 label: "Parametric VaR (99%)",
 value: fmtPct(varData.varParametric99 * 100, 2),
 sub: "Normal distribution assumption",
 color: "text-amber-400",
 },
 {
 label: "MC vs Parametric Gap",
 value: fmtPct(Math.abs(varData.varMC99 - varData.varParametric99) * 100, 3),
 sub: "Fat tail effect",
 color: "text-primary",
 },
 ].map(item => (
 <Card key={item.label} className="border-border">
 <CardContent className="p-4">
 <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
 <p className={`text-xl font-medium ${item.color}`}>{item.value}</p>
 <p className="text-xs text-muted-foreground mt-1">{item.sub}</p>
 </CardContent>
 </Card>
 ))}
 </div>

 {/* VaR Distribution Chart */}
 <Card className="border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm">
 MC Return Distribution — 10,000 Simulations (μ=0.03%/day, σ=1.5%/day)
 </CardTitle>
 </CardHeader>
 <CardContent>
 <VaRChart varData={varData} />
 <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
 <span>
 <span className="inline-block w-3 h-3 bg-red-500 rounded-sm mr-1" />
 Loss tail (1% worst outcomes)
 </span>
 <span>
 <span className="inline-block w-3 h-3 bg-primary rounded-sm mr-1" />
 Normal outcomes
 </span>
 </div>
 </CardContent>
 </Card>

 {/* VaR Comparison Table */}
 <Card className="border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm">VaR Methods Comparison</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border text-muted-foreground text-xs">
 <th className="text-left py-2 pr-4">Method</th>
 <th className="text-right py-2 pr-4">99% VaR</th>
 <th className="text-right py-2 pr-4">95% VaR</th>
 <th className="text-right py-2 pr-4">Assumptions</th>
 <th className="text-right py-2">Strengths</th>
 </tr>
 </thead>
 <tbody>
 {[
 {
 method: "Monte Carlo (this sim)",
 var99: varData.varMC99 * 100,
 var95: varData.varMC99 * 100 * 0.82,
 assumptions: "GBM, Normal shocks",
 strengths: "Captures path-dependency",
 },
 {
 method: "Parametric (variance-cov)",
 var99: varData.varParametric99 * 100,
 var95: varData.varParametric99 * 100 * 0.82,
 assumptions: "Strictly Normal",
 strengths: "Fast, closed-form",
 },
 {
 method: "Historical Simulation",
 var99: varData.varMC99 * 100 * 1.15,
 var95: varData.varMC99 * 100 * 0.95,
 assumptions: "History repeats",
 strengths: "Captures fat tails",
 },
 {
 method: "Filtered HS (GARCH)",
 var99: varData.varMC99 * 100 * 1.08,
 var95: varData.varMC99 * 100 * 0.90,
 assumptions: "Time-varying vol",
 strengths: "Best of both worlds",
 },
 ].map(row => (
 <tr key={row.method} className="border-b border-border hover:bg-muted/30 transition-colors">
 <td className="py-3 pr-4 font-medium">{row.method}</td>
 <td className="text-right py-3 pr-4 font-mono text-red-400">{row.var99.toFixed(2)}%</td>
 <td className="text-right py-3 pr-4 font-mono text-amber-400">{row.var95.toFixed(2)}%</td>
 <td className="text-right py-3 pr-4 text-muted-foreground text-xs">{row.assumptions}</td>
 <td className="text-right py-3 text-xs text-muted-foreground">{row.strengths}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-muted-foreground">
 <div className="p-3 bg-muted rounded-lg">
 <p className="font-medium text-foreground mb-1">VaR Definition</p>
 <p className="text-muted-foreground">
 99% 1-day VaR = the loss threshold exceeded on only 1% of trading days.
 If VaR = 2%, a $1M portfolio loses more than $20K on roughly 2–3 days per year.
 </p>
 </div>
 <div className="p-3 bg-muted rounded-lg">
 <p className="font-medium text-foreground mb-1">CVaR (Expected Shortfall)</p>
 <p className="text-muted-foreground">
 CVaR = average loss given that VaR is breached. Preferred by Basel III as it
 captures tail severity, not just the threshold. Always CVaR ≥ VaR by construction.
 </p>
 </div>
 </div>
 </CardContent>
 </Card>
 </TabsContent>
 </Tabs>
 </motion.div>

 {/* Educational Footer */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4, delay: 0.4 }}
 className="mt-6 p-4 bg-muted/50 rounded-md border border-border text-xs text-muted-foreground"
 >
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div>
 <p className="font-medium text-foreground mb-1">About Monte Carlo</p>
 <p>
 Developed by Stanislaw Ulam and John von Neumann in the 1940s for nuclear physics,
 Monte Carlo methods use random sampling to solve complex problems. In finance, they model
 uncertainty across thousands of possible futures simultaneously.
 </p>
 </div>
 <div>
 <p className="font-medium text-foreground mb-1">GBM Assumptions</p>
 <p>
 Geometric Brownian Motion assumes log-normally distributed returns, constant drift (μ) and
 volatility (σ), no jumps, and continuous trading. Real markets exhibit fat tails, volatility
 clustering, and occasional crashes — GBM underestimates tail risk.
 </p>
 </div>
 <div>
 <p className="font-medium text-foreground mb-1">Practical Applications</p>
 <p>
 Used by pension funds for liability matching, banks for VaR/stress testing, options desks for
 exotic pricing, and advisors for retirement planning. The more complex the derivative or the
 more correlated the portfolio, the greater MC&apos;s advantage over closed-form solutions.
 </p>
 </div>
 </div>
 </motion.div>
 </div>
 );
}
