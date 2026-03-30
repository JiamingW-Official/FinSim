"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
 TrendingUp,
 BarChart3,
 Layers,
 Target,
 Activity,
 DollarSign,
 ChevronUp,
 ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 983;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};

// Pre-generate deterministic pool
const POOL = Array.from({ length: 2000 }, () => rand());
let pi = 0;
const pr = () => POOL[pi++ % POOL.length];

// ── Format helpers ─────────────────────────────────────────────────────────────
const fmtPct = (n: number, decimals = 1) =>
 (n >= 0 ? "+" : "") + n.toFixed(decimals) + "%";
const posColor = (v: number) =>
 v >= 0 ? "text-emerald-400" : "text-red-400";
const fmtB = (n: number) => `$${n.toFixed(0)}B`;

// ── Data: Factor Performance ───────────────────────────────────────────────────
interface FactorData {
 name: string;
 color: string;
 colorHex: string;
 ret1y: number;
 ret3y: number;
 ret5y: number;
 ret10y: number;
 sharpe: number;
 maxDd: number;
 betaToMkt: number;
 desc: string;
}

const FACTORS: FactorData[] = [
 {
 name: "Value",
 color: "bg-primary",
 colorHex: "#3b82f6",
 ret1y: 11.4,
 ret3y: 9.2,
 ret5y: 7.8,
 ret10y: 8.9,
 sharpe: 0.61,
 maxDd: -38.2,
 betaToMkt: 1.08,
 desc: "Buy cheap stocks (low P/E, P/B) — cyclical, mean-reverting",
 },
 {
 name: "Momentum",
 color: "bg-primary",
 colorHex: "#8b5cf6",
 ret1y: 18.7,
 ret3y: 14.3,
 ret5y: 12.1,
 ret10y: 11.6,
 sharpe: 0.82,
 maxDd: -44.5,
 betaToMkt: 0.94,
 desc: "Buy recent winners — trend-following, prone to crashes",
 },
 {
 name: "Quality",
 color: "bg-emerald-500",
 colorHex: "#10b981",
 ret1y: 13.2,
 ret5y: 10.4,
 ret3y: 11.8,
 ret10y: 10.9,
 sharpe: 0.89,
 maxDd: -26.1,
 betaToMkt: 0.85,
 desc: "High ROE, low leverage, stable earnings — defensive tilt",
 },
 {
 name: "Low Vol",
 color: "bg-amber-500",
 colorHex: "#f59e0b",
 ret1y: 8.9,
 ret3y: 8.1,
 ret5y: 7.2,
 ret10y: 7.8,
 sharpe: 0.93,
 maxDd: -18.4,
 betaToMkt: 0.62,
 desc: "Low beta / volatility stocks — anomalous risk-adjusted returns",
 },
 {
 name: "Size",
 color: "bg-rose-500",
 colorHex: "#f43f5e",
 ret1y: 6.3,
 ret3y: 5.9,
 ret5y: 5.4,
 ret10y: 6.1,
 sharpe: 0.45,
 maxDd: -52.8,
 betaToMkt: 1.22,
 desc: "Small-cap premium — illiquidity & distress risk compensation",
 },
];

// ── Data: Stock Factor Loadings (z-scores) ─────────────────────────────────────
interface StockLoading {
 ticker: string;
 sector: string;
 value: number;
 momentum: number;
 quality: number;
 lowVol: number;
 size: number;
}

const STOCKS: StockLoading[] = [
 { ticker: "AAPL", sector: "Tech", value: -0.8, momentum: 1.4, quality: 1.9, lowVol: 0.3, size: -2.1 },
 { ticker: "BRK.B", sector: "Finance", value: 1.7, momentum: 0.6, quality: 2.1, lowVol: 0.8, size: -1.8 },
 { ticker: "JPM", sector: "Finance", value: 1.2, momentum: 0.9, quality: 0.7, lowVol: -0.5, size: -1.6 },
 { ticker: "JNJ", sector: "Health", value: 0.4, momentum: -0.3, quality: 1.6, lowVol: 1.4, size: -1.4 },
 { ticker: "TSLA", sector: "Auto", value: -2.1, momentum: 2.3, quality: -0.8, lowVol: -2.4, size: -1.1 },
 { ticker: "WMT", sector: "Retail", value: 0.9, momentum: 0.4, quality: 1.1, lowVol: 1.2, size: -1.3 },
 { ticker: "XOM", sector: "Energy", value: 1.9, momentum: 1.1, quality: 0.3, lowVol: 0.1, size: -1.5 },
 { ticker: "IWM", sector: "SmallCap", value: 0.3, momentum: 0.2, quality: -0.4, lowVol: -1.1, size: 2.8 },
];

// ── Data: Smart Beta ETFs ──────────────────────────────────────────────────────
interface SmartBetaETF {
 ticker: string;
 name: string;
 strategy: string;
 er: number;
 aum: number;
 valueExp: number;
 momExp: number;
 qualExp: number;
 lvExp: number;
 sizeExp: number;
 ytdReturn: number;
}

const ETFS: SmartBetaETF[] = [
 { ticker: "VLUE", name: "iShares MSCI USA Value", strategy: "Pure Value", er: 0.15, aum: 8.4, valueExp: 0.82, momExp: -0.12, qualExp: 0.11, lvExp: 0.04, sizeExp: -0.05, ytdReturn: 9.8 },
 { ticker: "MTUM", name: "iShares MSCI USA Momentum", strategy: "Pure Momentum", er: 0.15, aum: 12.1, valueExp: -0.31, momExp: 0.88, qualExp: 0.19, lvExp: -0.22, sizeExp: -0.14, ytdReturn: 16.2 },
 { ticker: "QUAL", name: "iShares MSCI USA Quality", strategy: "Pure Quality", er: 0.15, aum: 34.2, valueExp: -0.08, momExp: 0.24, qualExp: 0.79, lvExp: 0.31, sizeExp: -0.27, ytdReturn: 11.9 },
 { ticker: "USMV", name: "iShares MSCI Min Vol USA", strategy: "Low Volatility", er: 0.15, aum: 28.7, valueExp: 0.14, momExp: -0.08, qualExp: 0.44, lvExp: 0.86, sizeExp: 0.12, ytdReturn: 7.4 },
 { ticker: "LRGF", name: "iShares MSCI Multifactor", strategy: "Multi-Factor", er: 0.20, aum: 6.3, valueExp: 0.41, momExp: 0.38, qualExp: 0.45, lvExp: 0.22, sizeExp: 0.18, ytdReturn: 13.1 },
 { ticker: "RSP", name: "Invesco S&P 500 Equal Wt", strategy: "Equal Weight", er: 0.20, aum: 51.8, valueExp: 0.28, momExp: 0.07, qualExp: -0.11, lvExp: 0.03, sizeExp: 0.62, ytdReturn: 8.6 },
];

// ── Generate Factor Cycle Data (36M rolling) ───────────────────────────────────
function genFactorCycleSeries(): { month: number; [key: string]: number }[] {
 const N = 36;
 const series: { month: number; [key: string]: number }[] = [];
 const state: Record<string, number> = { Value: 0, Momentum: 0, Quality: 0, "Low Vol": 0, Size: 0 };
 const drift: Record<string, number> = { Value: 0.003, Momentum: 0.006, Quality: 0.004, "Low Vol": 0.002, Size: 0.001 };
 const vol: Record<string, number> = { Value: 0.04, Momentum: 0.055, Quality: 0.032, "Low Vol": 0.022, Size: 0.05 };
 for (let m = 0; m < N; m++) {
 const row: { month: number; [key: string]: number } = { month: m };
 for (const f of Object.keys(state)) {
 state[f] = state[f] + drift[f] + (pr() - 0.5) * vol[f];
 row[f] = state[f];
 }
 series.push(row);
 }
 return series;
}

const CYCLE_DATA = genFactorCycleSeries();

// ── Components ─────────────────────────────────────────────────────────────────

function SectionHeading({ title, sub }: { title: string; sub?: string }) {
 return (
 <div className="mb-4">
 <h3 className="text-base font-semibold text-foreground">{title}</h3>
 {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
 </div>
 );
}

function StatCard({
 label, value, sub, highlight,
}: {
 label: string;
 value: string;
 sub?: string;
 highlight?: "pos" | "neg" | "neutral";
}) {
 const valClass =
 highlight === "pos" ? "text-emerald-400" :
 highlight === "neg" ? "text-rose-400" : "text-foreground";
 return (
 <div className="rounded-md border border-border bg-foreground/5 p-4">
 <p className="text-xs text-muted-foreground mb-1">{label}</p>
 <p className={cn("text-xl font-semibold", valClass)}>{value}</p>
 {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
 </div>
 );
}

// ── Tab 1: Factor Performance Dashboard ───────────────────────────────────────

type PeriodKey = "ret1y" | "ret3y" | "ret5y" | "ret10y";

function FactorPerfTab() {
 const [period, setPeriod] = useState<PeriodKey>("ret5y");

 const periodLabels: Record<PeriodKey, string> = {
 ret1y: "1Y Return", ret3y: "3Y Ann. Return", ret5y: "5Y Ann. Return", ret10y: "10Y Ann. Return",
 };

 const maxRet = Math.max(...FACTORS.map((f) => Math.abs(f[period])));

 return (
 <div className="space-y-4">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <StatCard label="Factors Tracked" value="5" sub="MSCI definitions" />
 <StatCard label="Best Sharpe" value="0.93" sub="Low Volatility" highlight="pos" />
 <StatCard label="Worst Drawdown" value="-52.8%" sub="Size factor" highlight="neg" />
 <StatCard label="Market Correlation" value="0.62–1.22" sub="Beta range" />
 </div>

 {/* Period selector */}
 <div className="flex gap-2">
 {(["ret1y", "ret3y", "ret5y", "ret10y"] as const).map((p) => (
 <button
 key={p}
 onClick={() => setPeriod(p)}
 className={cn(
 "px-3 py-1.5 rounded-lg text-xs text-muted-foreground font-medium transition-colors",
 period === p
 ? "bg-indigo-600 text-foreground"
 : "bg-foreground/5 text-muted-foreground hover:bg-muted/50"
 )}
 >
 {periodLabels[p].split("")[0]}
 </button>
 ))}
 </div>

 {/* Animated bar chart */}
 <div className="rounded-md border border-border bg-foreground/5 p-5">
 <SectionHeading title={periodLabels[period]} sub="Annualized factor returns vs market-cap benchmark" />
 <div className="space-y-4">
 {FACTORS.map((f, idx) => {
 const val = f[period];
 const widthPct = (Math.abs(val) / (maxRet * 1.15)) * 100;
 return (
 <div key={f.name}>
 <div className="flex justify-between items-center mb-1.5">
 <div className="flex items-center gap-2">
 <div className={cn("w-2.5 h-2.5 rounded-full", f.color)} />
 <span className="text-sm font-medium text-foreground">{f.name}</span>
 </div>
 <span className={cn("text-sm font-semibold tabular-nums", posColor(val))}>
 {fmtPct(val)}
 </span>
 </div>
 <div className="h-5 rounded bg-foreground/5 overflow-hidden">
 <motion.div
 key={period + f.name}
 initial={{ width: 0 }}
 animate={{ width: `${widthPct}%` }}
 transition={{ duration: 0.6, ease: "easeOut", delay: idx * 0.07 }}
 className={cn("h-full rounded", f.color, "opacity-80")}
 />
 </div>
 <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
 </div>
 );
 })}
 </div>
 </div>

 {/* Metrics table */}
 <div className="rounded-md border border-border bg-foreground/5 p-5 overflow-x-auto">
 <SectionHeading title="Risk-Adjusted Metrics" sub="Sharpe ratio, max drawdown, and market beta" />
 <table className="w-full text-sm">
 <thead>
 <tr className="text-xs text-muted-foreground border-b border-border">
 <th className="text-left pb-2">Factor</th>
 <th className="text-right pb-2">Sharpe</th>
 <th className="text-right pb-2">Max DD</th>
 <th className="text-right pb-2">Beta</th>
 <th className="text-right pb-2">10Y Ann.</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-white/5">
 {FACTORS.map((f) => (
 <tr key={f.name} className="hover:bg-muted/30 transition-colors">
 <td className="py-2.5">
 <div className="flex items-center gap-2">
 <div className={cn("w-2 h-2 rounded-full", f.color)} />
 <span className="text-foreground font-medium">{f.name}</span>
 </div>
 </td>
 <td className="py-2.5 text-right text-emerald-400 font-semibold">{f.sharpe.toFixed(2)}</td>
 <td className="py-2.5 text-right text-red-400">{f.maxDd.toFixed(1)}%</td>
 <td className="py-2.5 text-right text-muted-foreground">{f.betaToMkt.toFixed(2)}</td>
 <td className={cn("py-2.5 text-right font-medium", posColor(f.ret10y))}>
 {fmtPct(f.ret10y)}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 );
}

// ── Tab 2: Factor Exposure Heatmap ─────────────────────────────────────────────

function heatColor(z: number): string {
 const clamped = Math.max(-2.5, Math.min(2.5, z));
 if (clamped >= 0) {
 const t = clamped / 2.5;
 const g = Math.round(185 + t * (255 - 185));
 const b = Math.round(129 + t * (0 - 129));
 return `rgb(16,${g},${b})`;
 } else {
 const t = (-clamped) / 2.5;
 const r = Math.round(16 + t * (239 - 16));
 const g = Math.round(185 + t * (68 - 185));
 const b2 = Math.round(129 + t * (68 - 129));
 return `rgb(${r},${g},${b2})`;
 }
}

type FactorKey = "value" | "momentum" | "quality" | "lowVol" | "size";

const FACTOR_KEYS: FactorKey[] = ["value", "momentum", "quality", "lowVol", "size"];
const FACTOR_LABELS: Record<FactorKey, string> = {
 value: "Value", momentum: "Momentum", quality: "Quality", lowVol: "Low Vol", size: "Size",
};

function ExposureAnalyzerTab() {
 const [selected, setSelected] = useState<StockLoading | null>(null);

 return (
 <div className="space-y-4">
 <div className="rounded-md border border-border bg-foreground/5 p-5">
 <SectionHeading
 title="Factor Loading Heatmap"
 sub="Z-scores relative to universe — green = positive exposure, red = negative exposure"
 />
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="text-xs text-muted-foreground border-b border-border">
 <th className="text-left pb-2 pr-4">Ticker</th>
 <th className="text-left pb-2 pr-3">Sector</th>
 {FACTOR_KEYS.map((k) => (
 <th key={k} className="text-center pb-2 px-3">{FACTOR_LABELS[k]}</th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-white/5">
 {STOCKS.map((stock) => (
 <tr
 key={stock.ticker}
 className={cn(
 "cursor-pointer transition-colors hover:bg-muted/30",
 selected?.ticker === stock.ticker && "bg-foreground/10"
 )}
 onClick={() => setSelected(selected?.ticker === stock.ticker ? null : stock)}
 >
 <td className="py-2.5 pr-4 font-medium text-foreground">{stock.ticker}</td>
 <td className="py-2.5 pr-3 text-muted-foreground text-xs">{stock.sector}</td>
 {FACTOR_KEYS.map((k) => {
 const z = stock[k];
 return (
 <td key={k} className="py-2.5 px-3 text-center">
 <span
 className="inline-block px-2 py-0.5 rounded text-xs text-muted-foreground font-semibold tabular-nums"
 style={{
 background: heatColor(z) + "30",
 color: heatColor(z),
 border: `1px solid ${heatColor(z)}40`,
 }}
 >
 {z >= 0 ? "+" : ""}{z.toFixed(1)}
 </span>
 </td>
 );
 })}
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 {/* Scale legend */}
 <div className="mt-4 flex items-center gap-3">
 <span className="text-xs text-muted-foreground">Scale:</span>
 {[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((z) => (
 <div key={z} className="flex items-center gap-1">
 <div
 className="w-6 h-3 rounded"
 style={{ background: heatColor(z) + "50", border: `1px solid ${heatColor(z)}60` }}
 />
 <span className="text-xs text-muted-foreground">{z >= 0 ? "+" : ""}{z}</span>
 </div>
 ))}
 </div>
 </div>

 {selected && (
 <motion.div
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 className="rounded-md border border-indigo-500/30 bg-indigo-900/20 p-5"
 >
 <div className="flex items-center gap-3 mb-4">
 <Badge className="bg-indigo-600/30 text-indigo-300 border-indigo-500/30">
 {selected.ticker}
 </Badge>
 <span className="text-foreground font-medium">Factor Profile</span>
 <span className="text-xs text-muted-foreground">{selected.sector}</span>
 </div>
 <div className="grid grid-cols-5 gap-3">
 {FACTOR_KEYS.map((k) => {
 const z = selected[k];
 const label = z >= 1.5 ? "Strong +" : z >= 0.5 ? "Moderate +" : z >= -0.5 ? "Neutral" : z >= -1.5 ? "Moderate −" : "Strong −";
 return (
 <div key={k} className="rounded-lg border border-border bg-foreground/5 p-3 text-center">
 <p className="text-xs text-muted-foreground mb-1">{FACTOR_LABELS[k]}</p>
 <p
 className="text-lg font-medium tabular-nums"
 style={{ color: heatColor(z) }}
 >
 {z >= 0 ? "+" : ""}{z.toFixed(1)}
 </p>
 <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
 </div>
 );
 })}
 </div>
 </motion.div>
 )}
 </div>
 );
}

// ── Tab 3: Factor Cycle Visualization ─────────────────────────────────────────

function FactorCycleTab() {
 const [hoveredFactor, setHoveredFactor] = useState<string | null>(null);

 const W = 560;
 const H = 220;
 const PAD = { l: 44, r: 16, t: 16, b: 36 };
 const cW = W - PAD.l - PAD.r;
 const cH = H - PAD.t - PAD.b;

 const allVals = CYCLE_DATA.flatMap((d) =>
 FACTORS.map((f) => d[f.name] as number)
 );
 const minV = Math.min(...allVals) - 0.01;
 const maxV = Math.max(...allVals) + 0.01;
 const N = CYCLE_DATA.length;

 const toX = (i: number) => PAD.l + (i / (N - 1)) * cW;
 const toY = (v: number) => PAD.t + cH - ((v - minV) / (maxV - minV)) * cH;

 const gridVals = [minV, (minV + maxV) / 2, maxV];

 const factorPaths = FACTORS.map((f) => {
 const pts = CYCLE_DATA.map((d, i) =>
 `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(d[f.name] as number).toFixed(1)}`
 ).join("");
 const fill = [
 pts,
 `L${toX(N - 1).toFixed(1)},${(PAD.t + cH).toFixed(1)}`,
 `L${toX(0).toFixed(1)},${(PAD.t + cH).toFixed(1)}`,
 "Z",
 ].join("");
 return { ...f, pts, fill };
 });

 const monthLabels = [0, 6, 12, 18, 24, 30, 35];

 return (
 <div className="space-y-4">
 <div className="rounded-md border border-border bg-foreground/5 p-5">
 <SectionHeading
 title="36-Month Rolling Factor Performance"
 sub="Cumulative return of each factor over simulated 3-year window"
 />

 {/* Legend */}
 <div className="flex flex-wrap gap-3 mb-4">
 {FACTORS.map((f) => (
 <button
 key={f.name}
 className={cn(
 "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs text-muted-foreground font-medium transition-colors",
 hoveredFactor === null || hoveredFactor === f.name
 ? "opacity-100"
 : "opacity-30",
 "bg-foreground/5 border border-border hover:bg-muted/50"
 )}
 onMouseEnter={() => setHoveredFactor(f.name)}
 onMouseLeave={() => setHoveredFactor(null)}
 >
 <div className="w-2 h-2 rounded-full" style={{ background: f.colorHex }} />
 <span className="text-muted-foreground">{f.name}</span>
 </button>
 ))}
 </div>

 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 240 }}>
 <defs>
 {factorPaths.map((f) => (
 <linearGradient key={`grad-${f.name}`} id={`cycleGrad-${f.name}`} x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor={f.colorHex} stopOpacity="0.25" />
 <stop offset="100%" stopColor={f.colorHex} stopOpacity="0.02" />
 </linearGradient>
 ))}
 </defs>

 {/* Grid */}
 {gridVals.map((v, i) => (
 <line key={`gl-${i}`} x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke="#ffffff12" strokeWidth={1} />
 ))}
 {gridVals.map((v, i) => (
 <text key={`gt-${i}`} x={PAD.l - 4} y={toY(v) + 4} fontSize={9} fill="#71717a" textAnchor="end">
 {(v * 100).toFixed(0)}%
 </text>
 ))}

 {/* Area fills */}
 {factorPaths.map((f) => (
 <path
 key={`fill-${f.name}`}
 d={f.fill}
 fill={`url(#cycleGrad-${f.name})`}
 opacity={hoveredFactor === null || hoveredFactor === f.name ? 1 : 0.1}
 />
 ))}

 {/* Lines */}
 {factorPaths.map((f) => (
 <path
 key={`line-${f.name}`}
 d={f.pts}
 fill="none"
 stroke={f.colorHex}
 strokeWidth={hoveredFactor === f.name ? 2.5 : 1.5}
 strokeLinejoin="round"
 opacity={hoveredFactor === null || hoveredFactor === f.name ? 1 : 0.15}
 />
 ))}

 {/* X-axis labels */}
 {monthLabels.map((m) => (
 <text key={`xt-${m}`} x={toX(m)} y={H - 6} fontSize={9} fill="#71717a" textAnchor="middle">
 M{m + 1}
 </text>
 ))}

 {/* Baseline */}
 <line
 x1={PAD.l} x2={W - PAD.r}
 y1={toY(0)} y2={toY(0)}
 stroke="#ffffff25" strokeWidth={1} strokeDasharray="4,3"
 />
 </svg>
 </div>

 {/* Cycle insights */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="rounded-md border border-border bg-foreground/5 p-4">
 <p className="text-xs text-muted-foreground mb-2 font-medium">Regime Dependency</p>
 <p className="text-sm text-muted-foreground">Value outperforms in early recovery; Momentum dominates late-cycle expansion; Quality leads in downturns.</p>
 </div>
 <div className="rounded-md border border-border bg-foreground/5 p-4">
 <p className="text-xs text-muted-foreground mb-2 font-medium">Factor Crashes</p>
 <p className="text-sm text-muted-foreground">Momentum is prone to sharp reversals (2009, 2020). Diversifying across factors smooths the cycle.</p>
 </div>
 <div className="rounded-md border border-border bg-foreground/5 p-4">
 <p className="text-xs text-muted-foreground mb-2 font-medium">Correlation Shifts</p>
 <p className="text-sm text-muted-foreground">Value and Momentum are historically negatively correlated (~-0.4), making them natural diversifiers.</p>
 </div>
 </div>
 </div>
 );
}

// ── Tab 4: Portfolio Tilt Builder ─────────────────────────────────────────────

const BASE_RETURN = 10.2;
const BASE_VOL = 15.8;
const BASE_SHARPE = 0.65;

const FACTOR_RET_MAP: Record<string, number> = {
 Value: 8.9, Momentum: 12.1, Quality: 10.4, "Low Vol": 7.2, Size: 5.4,
};
const FACTOR_VOL_MAP: Record<string, number> = {
 Value: 16.2, Momentum: 19.1, Quality: 13.8, "Low Vol": 10.4, Size: 21.3,
};

function TiltBuilderTab() {
 const [weights, setWeights] = useState<Record<string, number>>({
 Value: 20, Momentum: 20, Quality: 20, "Low Vol": 20, Size: 20,
 });

 const totalWeight = useMemo(
 () => Object.values(weights).reduce((a, b) => a + b, 0),
 [weights]
 );

 const expectedReturn = useMemo(() => {
 const w = totalWeight > 0 ? 1 / totalWeight : 0;
 return Object.entries(weights).reduce(
 (sum, [k, v]) => sum + (FACTOR_RET_MAP[k] ?? 0) * v * w, 0
 );
 }, [weights, totalWeight]);

 const expectedVol = useMemo(() => {
 const corrAdj = 0.85;
 const w = totalWeight > 0 ? 1 / totalWeight : 0;
 const varSum = Object.entries(weights).reduce(
 (sum, [k, v]) => sum + Math.pow((FACTOR_VOL_MAP[k] ?? 15) * v * w, 2), 0
 );
 return Math.sqrt(varSum) * corrAdj;
 }, [weights, totalWeight]);

 const sharpe = expectedVol > 0 ? (expectedReturn - 4.5) / expectedVol : 0;
 const retDelta = expectedReturn - BASE_RETURN;
 const sharpeDelta = sharpe - BASE_SHARPE;

 return (
 <div className="space-y-4">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <StatCard
 label="Expected Return"
 value={`${expectedReturn.toFixed(1)}%`}
 sub={`vs benchmark ${fmtPct(retDelta)}`}
 highlight={retDelta >= 0 ? "pos" : "neg"}
 />
 <StatCard
 label="Expected Vol"
 value={`${expectedVol.toFixed(1)}%`}
 sub={`Benchmark ${BASE_VOL}%`}
 />
 <StatCard
 label="Est. Sharpe"
 value={sharpe.toFixed(2)}
 sub={`vs ${BASE_SHARPE} benchmark`}
 highlight={sharpeDelta >= 0 ? "pos" : "neg"}
 />
 <StatCard
 label="Total Weight"
 value={`${totalWeight}%`}
 sub={totalWeight === 100 ? "Balanced" : totalWeight > 100 ? "Over-allocated" : "Under-allocated"}
 highlight={totalWeight === 100 ? "pos" : "neg"}
 />
 </div>

 <div className="rounded-md border border-border bg-foreground/5 p-5">
 <SectionHeading title="Factor Weight Sliders" sub="Adjust your portfolio's factor tilt — 100% total recommended" />
 <div className="space-y-5">
 {FACTORS.map((f) => (
 <div key={f.name}>
 <div className="flex justify-between items-center mb-2">
 <div className="flex items-center gap-2">
 <div className={cn("w-2.5 h-2.5 rounded-full", f.color)} />
 <span className="text-sm font-medium text-foreground">{f.name}</span>
 <span className="text-xs text-muted-foreground hidden sm:inline">{f.desc.split(" — ")[0]}</span>
 </div>
 <span className="text-sm font-medium text-foreground tabular-nums">{weights[f.name]}%</span>
 </div>
 <Slider
 value={[weights[f.name]]}
 onValueChange={([v]) => setWeights((prev) => ({ ...prev, [f.name]: v }))}
 min={0}
 max={100}
 step={5}
 />
 </div>
 ))}
 </div>
 </div>

 {/* Comparison bars */}
 <div className="rounded-md border border-border bg-foreground/5 p-5">
 <SectionHeading title="Your Portfolio vs Benchmark" sub="Side-by-side comparison of key metrics" />
 <div className="space-y-4">
 {[
 { label: "Annualized Return", yours: expectedReturn, bench: BASE_RETURN, max: 20, suffix: "%" as const, displayYours: undefined as string | undefined, displayBench: undefined as string | undefined },
 { label: "Volatility (Risk)", yours: expectedVol, bench: BASE_VOL, max: 25, suffix: "%" as const, displayYours: undefined, displayBench: undefined },
 { label: "Sharpe Ratio", yours: sharpe * 10, bench: BASE_SHARPE * 10, max: 12, suffix: "" as const, displayYours: sharpe.toFixed(2), displayBench: BASE_SHARPE.toFixed(2) },
 ].map((row) => (
 <div key={row.label}>
 <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
 <span>{row.label}</span>
 <span>
 <span className="text-indigo-400">You: {row.displayYours ?? row.yours.toFixed(1)}{row.suffix}</span>
 {" · "}
 <span className="text-muted-foreground">Bench: {row.displayBench ?? row.bench.toFixed(1)}{row.suffix}</span>
 </span>
 </div>
 <div className="relative h-4 rounded bg-foreground/5 overflow-hidden">
 <div
 className="absolute h-full rounded bg-muted/60"
 style={{ width: `${Math.min(100, (row.bench / row.max) * 100)}%` }}
 />
 <motion.div
 key={row.yours}
 initial={{ width: 0 }}
 animate={{ width: `${Math.min(100, (row.yours / row.max) * 100)}%` }}
 transition={{ duration: 0.5 }}
 className="absolute h-full rounded bg-indigo-500/70"
 />
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}

// ── Tab 5: Fama-French 3-Factor Model ─────────────────────────────────────────

interface FFTicker {
 ticker: string;
 alpha: number;
 beta: number;
 smb: number;
 hml: number;
 r2: number;
}

const FF_TICKERS: FFTicker[] = [
 { ticker: "AAPL", alpha: 2.1, beta: 1.12, smb: -0.41, hml: -0.72, r2: 0.72 },
 { ticker: "JPM", alpha: 0.8, beta: 1.18, smb: 0.14, hml: 0.68, r2: 0.81 },
 { ticker: "JNJ", alpha: 1.4, beta: 0.71, smb: -0.22, hml: 0.31, r2: 0.68 },
 { ticker: "TSLA", alpha: 8.3, beta: 1.74, smb: 0.22, hml: -1.42, r2: 0.48 },
 { ticker: "XOM", alpha: -0.3,beta: 0.89, smb: -0.08, hml: 0.94, r2: 0.76 },
];

type FFCoefKey = "alpha" | "smb" | "hml";

function FamaFrenchTab() {
 const [selectedTicker, setSelectedTicker] = useState<FFTicker>(FF_TICKERS[0]);

 const coefDefs = [
 { key: "alpha" as FFCoefKey, label: "Alpha (α)", suffix: "%/yr", colorFn: (v: number) => v > 0 ? "text-emerald-400" : "text-red-400", desc: "Unexplained excess return" },
 { key: "smb" as FFCoefKey, label: "SMB Loading (s)", suffix: "", colorFn: (v: number) => v > 0 ? "text-rose-400" : "text-muted-foreground", desc: "Small-cap tilt" },
 { key: "hml" as FFCoefKey, label: "HML Loading (h)", suffix: "", colorFn: (v: number) => v > 0 ? "text-amber-400" : "text-foreground", desc: "Value tilt" },
 ] as const;

 const barColors: Record<FFCoefKey, string> = {
 alpha: "bg-emerald-500",
 smb: "bg-rose-500",
 hml: "bg-amber-500",
 };

 return (
 <div className="space-y-4">
 <div className="rounded-md border border-border bg-foreground/5 p-5">
 <SectionHeading
 title="Fama-French 3-Factor Regression"
 sub="Rᵢ − Rᶠ = α + β·(Rₘ − Rᶠ) + s·SMB + h·HML + ε"
 />
 <p className="text-xs text-muted-foreground mb-4">
 SMB (Small Minus Big) captures the size premium. HML (High Minus Low) captures the value premium.
 Alpha is the unexplained excess return.
 </p>

 {/* Ticker selector */}
 <div className="flex flex-wrap gap-2 mb-6">
 {FF_TICKERS.map((t) => (
 <button
 key={t.ticker}
 onClick={() => setSelectedTicker(t)}
 className={cn(
 "px-3 py-1.5 rounded-lg text-xs text-muted-foreground font-medium transition-colors",
 selectedTicker.ticker === t.ticker
 ? "bg-indigo-600 text-foreground"
 : "bg-foreground/5 text-muted-foreground hover:bg-muted/50"
 )}
 >
 {t.ticker}
 </button>
 ))}
 </div>

 {/* Coefficient cards */}
 <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
 {[
 { label: "Alpha (α)", value: selectedTicker.alpha, suffix: "%/yr", colorClass: selectedTicker.alpha > 0 ? "text-emerald-400" : "text-red-400", desc: "Unexplained excess return", showSign: true },
 { label: "Market Beta (β)", value: selectedTicker.beta, suffix: "", colorClass: "text-foreground", desc: "Mkt sensitivity", showSign: false },
 { label: "SMB Loading (s)", value: selectedTicker.smb, suffix: "", colorClass: selectedTicker.smb > 0 ? "text-rose-400" : "text-muted-foreground", desc: "Small-cap tilt", showSign: true },
 { label: "HML Loading (h)", value: selectedTicker.hml, suffix: "", colorClass: selectedTicker.hml > 0 ? "text-amber-400" : "text-foreground", desc: "Value tilt", showSign: true },
 { label: "R² (fit)", value: selectedTicker.r2 * 100, suffix: "%", colorClass: "text-foreground", desc: "Model explanatory power", showSign: false },
 ].map((coef) => (
 <div key={coef.label} className="rounded-md border border-border bg-foreground/5 p-3 text-center">
 <p className="text-xs text-muted-foreground mb-1">{coef.label}</p>
 <p className={cn("text-xl font-medium tabular-nums", coef.colorClass)}>
 {coef.showSign && coef.value >= 0 ? "+" : ""}{coef.value.toFixed(2)}{coef.suffix}
 </p>
 <p className="text-xs text-muted-foreground mt-0.5">{coef.desc}</p>
 </div>
 ))}
 </div>

 {/* Bar charts for each coefficient */}
 <div className="mt-6 space-y-5">
 {coefDefs.map((coefDef) => {
 const maxAbs = Math.max(...FF_TICKERS.map((t) => Math.abs(t[coefDef.key])));
 return (
 <div key={coefDef.key}>
 <p className="text-xs text-muted-foreground mb-2">{coefDef.label} — all tickers</p>
 <div className="flex items-end gap-2">
 {FF_TICKERS.map((t) => {
 const val = t[coefDef.key];
 const heightPct = (Math.abs(val) / (maxAbs * 1.1)) * 100;
 const isSelected = t.ticker === selectedTicker.ticker;
 return (
 <div
 key={t.ticker}
 className="flex-1 flex flex-col items-center gap-1 cursor-pointer"
 onClick={() => setSelectedTicker(t)}
 >
 <div className="w-full h-12 flex items-end justify-center">
 <motion.div
 key={t.ticker + String(val)}
 initial={{ height: 0 }}
 animate={{ height: `${heightPct}%` }}
 transition={{ duration: 0.4 }}
 className={cn(
 "w-full rounded-t",
 barColors[coefDef.key],
 val < 0 ? "opacity-35" : "opacity-80",
 isSelected && "ring-2 ring-foreground/40"
 )}
 style={{ minHeight: 2 }}
 />
 </div>
 <span className="text-xs text-muted-foreground">{t.ticker}</span>
 <span className={cn("text-xs text-muted-foreground font-medium", coefDef.colorFn(val))}>
 {val >= 0 ? "+" : ""}{val.toFixed(1)}
 </span>
 </div>
 );
 })}
 </div>
 </div>
 );
 })}
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="rounded-md border border-border bg-foreground/5 p-4">
 <p className="text-xs text-amber-400 font-medium mb-1">SMB — Size Factor</p>
 <p className="text-xs text-muted-foreground">Positive SMB loading = small-cap exposure. Historically ~3% annual premium but highly variable. Negative = large-cap tilt (tech, mega-caps).</p>
 </div>
 <div className="rounded-md border border-border bg-foreground/5 p-4">
 <p className="text-xs text-foreground font-medium mb-1">HML — Value Factor</p>
 <p className="text-xs text-muted-foreground">Positive HML = value tilt (high book-to-price). Negative = growth/glamour tilt. TSLA shows -1.42 HML — extreme growth premium.</p>
 </div>
 <div className="rounded-md border border-border bg-foreground/5 p-4">
 <p className="text-xs text-emerald-400 font-medium mb-1">Alpha Interpretation</p>
 <p className="text-xs text-muted-foreground">Alpha above zero after controlling for 3 factors suggests genuine stock-selection skill or undiscovered risk. TSLA&apos;s +8.3% may reflect momentum/narrative premium.</p>
 </div>
 </div>
 </div>
 );
}

// ── Tab 6: Smart Beta ETF Comparison ──────────────────────────────────────────

type ETFSortKey = keyof SmartBetaETF;

function SmartBetaTab() {
 const [sortKey, setSortKey] = useState<ETFSortKey>("ytdReturn");
 const [sortAsc, setSortAsc] = useState(false);

 const sorted = useMemo(
 () =>
 [...ETFS].sort((a, b) => {
 const av = a[sortKey] as number;
 const bv = b[sortKey] as number;
 return sortAsc ? av - bv : bv - av;
 }),
 [sortKey, sortAsc]
 );

 const handleSort = (key: ETFSortKey) => {
 if (sortKey === key) setSortAsc((x) => !x);
 else { setSortKey(key); setSortAsc(false); }
 };

 const SortIcon = ({ col }: { col: ETFSortKey }) => {
 if (sortKey !== col) return <span className="text-muted-foreground text-xs ml-0.5">↕</span>;
 return sortAsc
 ? <ChevronUp className="inline h-3 w-3 text-indigo-400 ml-0.5" />
 : <ChevronDown className="inline h-3 w-3 text-indigo-400 ml-0.5" />;
 };

 const expColor = (v: number) =>
 v >= 0.6 ? "text-emerald-400" : v >= 0.3 ? "text-amber-400" : v <= -0.3 ? "text-red-400" : "text-muted-foreground";

 return (
 <div className="space-y-4">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <StatCard label="ETFs Analyzed" value="6" sub="US Smart Beta universe" />
 <StatCard label="Avg Expense Ratio" value="0.17%" sub="vs 0.03% plain S&P" highlight="neutral" />
 <StatCard label="Largest AUM" value={fmtB(ETFS.reduce((m, e) => Math.max(m, e.aum), 0))} sub="RSP Equal Weight" />
 <StatCard label="Best YTD" value={fmtPct(Math.max(...ETFS.map((e) => e.ytdReturn)))} sub="MTUM Momentum" highlight="pos" />
 </div>

 <div className="rounded-md border border-border bg-foreground/5 p-5 overflow-x-auto">
 <SectionHeading title="Smart Beta ETF Comparison" sub="Click column headers to sort — factor exposures are beta coefficients" />
 <table className="w-full text-sm">
 <thead>
 <tr className="text-xs text-muted-foreground border-b border-border">
 <th className="text-left pb-2 pr-3">ETF</th>
 <th className="text-left pb-2 pr-3">Strategy</th>
 <th className="text-right pb-2 px-2 cursor-pointer select-none hover:text-foreground" onClick={() => handleSort("er")}>ER<SortIcon col="er" /></th>
 <th className="text-right pb-2 px-2 cursor-pointer select-none hover:text-foreground" onClick={() => handleSort("aum")}>AUM<SortIcon col="aum" /></th>
 <th className="text-right pb-2 px-2 cursor-pointer select-none hover:text-foreground" onClick={() => handleSort("valueExp")}>Value<SortIcon col="valueExp" /></th>
 <th className="text-right pb-2 px-2 cursor-pointer select-none hover:text-foreground" onClick={() => handleSort("momExp")}>Mktm<SortIcon col="momExp" /></th>
 <th className="text-right pb-2 px-2 cursor-pointer select-none hover:text-foreground" onClick={() => handleSort("qualExp")}>Qual<SortIcon col="qualExp" /></th>
 <th className="text-right pb-2 px-2 cursor-pointer select-none hover:text-foreground" onClick={() => handleSort("lvExp")}>LV<SortIcon col="lvExp" /></th>
 <th className="text-right pb-2 pl-2 cursor-pointer select-none hover:text-foreground" onClick={() => handleSort("ytdReturn")}>YTD<SortIcon col="ytdReturn" /></th>
 </tr>
 </thead>
 <tbody className="divide-y divide-white/5">
 {sorted.map((etf) => (
 <tr key={etf.ticker} className="hover:bg-muted/30 transition-colors">
 <td className="py-2.5 pr-3">
 <div>
 <p className="font-medium text-foreground">{etf.ticker}</p>
 <p className="text-xs text-muted-foreground">{etf.name}</p>
 </div>
 </td>
 <td className="py-2.5 pr-3">
 <Badge className="text-xs bg-foreground/10 text-muted-foreground border-border">{etf.strategy}</Badge>
 </td>
 <td className="py-2.5 px-2 text-right text-muted-foreground">{etf.er.toFixed(2)}%</td>
 <td className="py-2.5 px-2 text-right text-muted-foreground">{fmtB(etf.aum)}</td>
 <td className={cn("py-2.5 px-2 text-right font-medium", expColor(etf.valueExp))}>{etf.valueExp >= 0 ? "+" : ""}{etf.valueExp.toFixed(2)}</td>
 <td className={cn("py-2.5 px-2 text-right font-medium", expColor(etf.momExp))}>{etf.momExp >= 0 ? "+" : ""}{etf.momExp.toFixed(2)}</td>
 <td className={cn("py-2.5 px-2 text-right font-medium", expColor(etf.qualExp))}>{etf.qualExp >= 0 ? "+" : ""}{etf.qualExp.toFixed(2)}</td>
 <td className={cn("py-2.5 px-2 text-right font-medium", expColor(etf.lvExp))}>{etf.lvExp >= 0 ? "+" : ""}{etf.lvExp.toFixed(2)}</td>
 <td className={cn("py-2.5 pl-2 text-right font-medium", posColor(etf.ytdReturn))}>
 {fmtPct(etf.ytdReturn)}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 {/* Strategy cards */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {[
 {
 title: "Pure Factor ETFs",
 color: "text-indigo-400",
 pts: [
 "Single-factor exposure (VLUE, MTUM, QUAL)",
 "High factor purity, lower cost",
 "Requires active timing / rotation",
 "Best for tactical tilts",
 ],
 },
 {
 title: "Multi-Factor ETFs",
 color: "text-emerald-400",
 pts: [
 "Diversified across multiple factors",
 "Reduces factor crash risk",
 "Slightly higher ER (0.20%)",
 "Suitable for core allocation",
 ],
 },
 {
 title: "Equal / Risk Parity",
 color: "text-amber-400",
 pts: [
 "Removes market-cap concentration",
 "Implicit small-cap & value tilt",
 "RSP: 0.20% ER, $52B AUM",
 "Useful as diversification vehicle",
 ],
 },
 ].map((card) => (
 <div key={card.title} className="rounded-md border border-border bg-foreground/5 p-4">
 <p className={cn("text-sm font-medium mb-2", card.color)}>{card.title}</p>
 <ul className="space-y-1">
 {card.pts.map((pt) => (
 <li key={pt} className="text-xs text-muted-foreground flex gap-2">
 <span className="text-muted-foreground mt-0.5">•</span>
 <span>{pt}</span>
 </li>
 ))}
 </ul>
 </div>
 ))}
 </div>
 </div>
 );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function FactorInvestingPage() {
 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 className="p-4 space-y-4 min-h-screen"
 >
 {/* Header */}
 <div className="flex items-start justify-between">
 <div>
 <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
 Factor Investing &amp; Smart Beta
 </h1>
 <p className="text-muted-foreground text-sm mt-1">
 Explore systematic factor premiums, portfolio tilts, and the Fama-French model
 </p>
 </div>
 <div className="flex gap-2 flex-wrap justify-end">
 <Badge className="bg-indigo-600/20 text-indigo-300 border-indigo-500/30 text-xs">
 Systematic
 </Badge>
 <Badge className="bg-emerald-600/20 text-emerald-300 border-emerald-500/30 text-xs">
 5 Factors
 </Badge>
 </div>
 </div>

 {/* Overview stats — Hero */}
 <div className="border-l-4 border-l-primary rounded-lg bg-card p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
 <Card className="border-border bg-foreground/5">
 <CardContent className="p-4">
 <div className="flex items-center gap-2 mb-1">
 <span className="text-xs text-muted-foreground">Smart Beta AUM</span>
 </div>
 <p className="text-xl font-medium text-foreground">$1.4T</p>
 <p className="text-xs text-muted-foreground mt-0.5">Global smart beta ETFs</p>
 </CardContent>
 </Card>
 <Card className="border-border bg-foreground/5">
 <CardContent className="p-4">
 <div className="flex items-center gap-2 mb-1">
 <span className="text-xs text-muted-foreground">Avg Factor Premium</span>
 </div>
 <p className="text-xl font-medium text-emerald-400">+2–4%</p>
 <p className="text-xs text-muted-foreground mt-0.5">Annualized over market-cap</p>
 </CardContent>
 </Card>
 <Card className="border-border bg-foreground/5">
 <CardContent className="p-4">
 <div className="flex items-center gap-2 mb-1">
 <span className="text-xs text-muted-foreground">Research Origin</span>
 </div>
 <p className="text-xl font-medium text-foreground">1992</p>
 <p className="text-xs text-muted-foreground mt-0.5">Fama &amp; French 3-Factor</p>
 </CardContent>
 </Card>
 <Card className="border-border bg-foreground/5">
 <CardContent className="p-4">
 <div className="flex items-center gap-2 mb-1">
 <span className="text-xs text-muted-foreground">Factor Crowding Risk</span>
 </div>
 <p className="text-xl font-medium text-amber-400">Medium</p>
 <p className="text-xs text-muted-foreground mt-0.5">Momentum most crowded</p>
 </CardContent>
 </Card>
 </div>

 {/* Main tabs */}
 <Tabs defaultValue="performance" className="mt-8">
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
 <TabsTrigger value="performance" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Performance
 </TabsTrigger>
 <TabsTrigger value="exposure" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Exposure
 </TabsTrigger>
 <TabsTrigger value="cycle" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Factor Cycle
 </TabsTrigger>
 <TabsTrigger value="builder" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Tilt Builder
 </TabsTrigger>
 <TabsTrigger value="famafrench" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Fama-French
 </TabsTrigger>
 <TabsTrigger value="smartbeta" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Smart Beta ETFs
 </TabsTrigger>
 </TabsList>

 <TabsContent value="performance" className="data-[state=inactive]:hidden mt-4">
 <FactorPerfTab />
 </TabsContent>
 <TabsContent value="exposure" className="data-[state=inactive]:hidden mt-4">
 <ExposureAnalyzerTab />
 </TabsContent>
 <TabsContent value="cycle" className="data-[state=inactive]:hidden mt-4">
 <FactorCycleTab />
 </TabsContent>
 <TabsContent value="builder" className="data-[state=inactive]:hidden mt-4">
 <TiltBuilderTab />
 </TabsContent>
 <TabsContent value="famafrench" className="data-[state=inactive]:hidden mt-4">
 <FamaFrenchTab />
 </TabsContent>
 <TabsContent value="smartbeta" className="data-[state=inactive]:hidden mt-4">
 <SmartBetaTab />
 </TabsContent>
 </Tabs>
 </motion.div>
 );
}
