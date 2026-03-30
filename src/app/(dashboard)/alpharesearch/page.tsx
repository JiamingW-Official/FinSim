"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
 TrendingUp,
 TrendingDown,
 BarChart3,
 Activity,
 Layers,
 Target,
 Zap,
 Brain,
 Clock,
 AlertTriangle,
 CheckCircle,
 FlaskConical,
 GitBranch,
 ChevronUp,
 ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 803;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};

function resetSeed() {
 s = 803;
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface Signal {
 id: string;
 name: string;
 category: "momentum" | "value" | "quality" | "sentiment" | "technical" | "alternative";
 ic: number;
 icStd: number;
 ir: number;
 decayRate: number; // half-life in days
 hitRate: number;
 status: "live" | "research" | "deprecated";
}

interface FactorEntry {
 name: string;
 year: number;
 category: string;
 tStat: number;
 replicated: boolean;
}

// ── Static Data ────────────────────────────────────────────────────────────────

const SIGNALS: Signal[] = [
 { id: "s1", name: "12M-1M Price Momentum", category: "momentum", ic: 0.043, icStd: 0.112, ir: 0.38, decayRate: 45, hitRate: 0.542, status: "live" },
 { id: "s2", name: "1M Short-Term Reversal", category: "momentum", ic: 0.031, icStd: 0.098, ir: 0.32, decayRate: 8, hitRate: 0.528, status: "live" },
 { id: "s3", name: "Earnings Momentum (SUE)", category: "momentum", ic: 0.052, icStd: 0.089, ir: 0.58, decayRate: 60, hitRate: 0.561, status: "live" },
 { id: "s4", name: "Book-to-Market (Value)", category: "value", ic: 0.028, icStd: 0.118, ir: 0.24, decayRate: 180, hitRate: 0.515, status: "live" },
 { id: "s5", name: "Earnings Yield (E/P)", category: "value", ic: 0.034, icStd: 0.105, ir: 0.32, decayRate: 120, hitRate: 0.531, status: "live" },
 { id: "s6", name: "Free Cash Flow Yield", category: "value", ic: 0.039, icStd: 0.097, ir: 0.40, decayRate: 150, hitRate: 0.540, status: "live" },
 { id: "s7", name: "Return on Equity (ROE)", category: "quality", ic: 0.047, icStd: 0.082, ir: 0.57, decayRate: 240, hitRate: 0.558, status: "live" },
 { id: "s8", name: "Accruals Ratio", category: "quality", ic: 0.035, icStd: 0.091, ir: 0.38, decayRate: 200, hitRate: 0.535, status: "research" },
 { id: "s9", name: "Short Interest Ratio", category: "sentiment", ic: 0.041, icStd: 0.104, ir: 0.39, decayRate: 20, hitRate: 0.548, status: "live" },
 { id: "s10", name: "Analyst Revision Score", category: "sentiment", ic: 0.055, icStd: 0.093, ir: 0.59, decayRate: 30, hitRate: 0.563, status: "live" },
 { id: "s11", name: "RSI Divergence", category: "technical", ic: 0.019, icStd: 0.121, ir: 0.16, decayRate: 5, hitRate: 0.511, status: "deprecated" },
 { id: "s12", name: "News Sentiment NLP", category: "alternative", ic: 0.038, icStd: 0.099, ir: 0.38, decayRate: 3, hitRate: 0.541, status: "research" },
];

const CATEGORY_COLORS: Record<string, string> = {
 momentum: "#6366f1",
 value: "#22c55e",
 quality: "#f59e0b",
 sentiment: "#ec4899",
 technical: "#06b6d4",
 alternative: "#a855f7",
};

const FACTOR_ZOO: FactorEntry[] = [
 { name: "Price Momentum", year: 1993, category: "Momentum", tStat: 4.21, replicated: true },
 { name: "Book-to-Market", year: 1992, category: "Value", tStat: 3.87, replicated: true },
 { name: "Size (SMB)", year: 1992, category: "Size", tStat: 2.84, replicated: true },
 { name: "Profitability (RMW)", year: 2015, category: "Quality", tStat: 3.54, replicated: true },
 { name: "Investment (CMA)", year: 2015, category: "Investment", tStat: 3.21, replicated: true },
 { name: "Short-Term Reversal", year: 1990, category: "Reversal", tStat: 3.45, replicated: true },
 { name: "Long-Term Reversal", year: 1985, category: "Reversal", tStat: 2.98, replicated: true },
 { name: "Accruals", year: 1996, category: "Quality", tStat: 3.12, replicated: true },
 { name: "Net Share Issuance", year: 2006, category: "Quality", tStat: 2.65, replicated: false },
 { name: "Idiosyncratic Vol", year: 2006, category: "Risk", tStat: 2.41, replicated: false },
 { name: "Earnings Quality", year: 2008, category: "Quality", tStat: 3.01, replicated: true },
 { name: "Asset Growth", year: 2008, category: "Investment", tStat: 2.89, replicated: true },
 { name: "Earnings Announcement Ret",year: 1987, category: "Earnings", tStat: 4.55, replicated: true },
 { name: "Post-Earnings Drift", year: 1992, category: "Earnings", tStat: 3.78, replicated: true },
 { name: "52-Week High", year: 2004, category: "Momentum", tStat: 3.22, replicated: true },
 { name: "Industry Momentum", year: 1999, category: "Momentum", tStat: 2.91, replicated: true },
 { name: "Short Interest", year: 2005, category: "Sentiment", tStat: 3.44, replicated: true },
 { name: "Analyst Revision", year: 2000, category: "Sentiment", tStat: 3.88, replicated: true },
 { name: "Composite Issuance", year: 2008, category: "Quality", tStat: 2.55, replicated: false },
 { name: "Return on Assets", year: 1995, category: "Quality", tStat: 3.19, replicated: true },
 { name: "Cash-Based Profitability", year: 2016, category: "Quality", tStat: 3.67, replicated: true },
 { name: "R&D Intensity", year: 2001, category: "Investment", tStat: 2.34, replicated: false },
 { name: "Insider Trading", year: 1998, category: "Alternative", tStat: 2.78, replicated: true },
 { name: "Employee Growth", year: 2003, category: "Investment", tStat: 1.98, replicated: false },
 { name: "Customer Concentration", year: 2012, category: "Risk", tStat: 2.11, replicated: false },
 { name: "Seasonality", year: 2013, category: "Alternative", tStat: 3.01, replicated: true },
 { name: "Q-Factor Model", year: 2015, category: "Composite", tStat: 3.45, replicated: true },
 { name: "Mispricing Factor", year: 2016, category: "Composite", tStat: 3.22, replicated: true },
 { name: "Betting Against Beta", year: 2014, category: "Risk", tStat: 4.12, replicated: true },
 { name: "Quality Minus Junk", year: 2019, category: "Quality", tStat: 3.88, replicated: true },
 { name: "Piotroski F-Score", year: 2000, category: "Quality", tStat: 3.02, replicated: true },
 { name: "Overnight Return", year: 2018, category: "Alternative", tStat: 2.67, replicated: false },
];

// ── Helper: compute decay curve points ───────────────────────────────────────

function decayCurve(halfLifeDays: number, icPeak: number, points: number = 60): { t: number; ic: number }[] {
 return Array.from({ length: points }, (_, i) => {
 const t = i;
 const ic = icPeak * Math.pow(0.5, t / halfLifeDays);
 return { t, ic };
 });
}

// ── Helper: backtest equity curve ─────────────────────────────────────────────

function generateEquityCurve(seed: number, drift: number, vol: number, n: number): number[] {
 let localS = seed;
 const localRand = () => {
 localS = (localS * 1103515245 + 12345) & 0x7fffffff;
 return localS / 0x7fffffff;
 };
 const curve: number[] = [100];
 for (let i = 1; i < n; i++) {
 const r = (localRand() - 0.5) * 2;
 const ret = drift / 252 + vol / Math.sqrt(252) * r;
 curve.push(curve[i - 1] * (1 + ret));
 }
 return curve;
}

// ── SVG helpers ───────────────────────────────────────────────────────────────

function polyline(points: { x: number; y: number }[]): string {
 return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join("");
}

function mapToSVG(
 values: number[],
 svgW: number,
 svgH: number,
 padX: number,
 padY: number,
 minVal?: number,
 maxVal?: number
): { x: number; y: number }[] {
 const min = minVal ?? Math.min(...values);
 const max = maxVal ?? Math.max(...values);
 const range = max - min || 1;
 return values.map((v, i) => ({
 x: padX + (i / (values.length - 1)) * (svgW - padX * 2),
 y: padY + (1 - (v - min) / range) * (svgH - padY * 2),
 }));
}

// ── Metric Card ───────────────────────────────────────────────────────────────

function MetricCard({
 icon: Icon,
 label,
 value,
 sub,
 color,
 delay,
}: {
 icon: React.ElementType;
 label: string;
 value: string;
 sub: string;
 color: string;
 delay: number;
}) {
 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay, duration: 0.4 }}
 >
 <Card className="bg-card border-border">
 <CardContent className="pt-5 pb-4">
 <div className="flex items-start justify-between">
 <div>
 <p className="text-xs text-muted-foreground mb-1">{label}</p>
 <p className="text-2xl font-semibold" style={{ color }}>{value}</p>
 <p className="text-xs text-muted-foreground mt-1">{sub}</p>
 </div>
 <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + "22" }}>
 <Icon className="w-5 h-5" style={{ color }} />
 </div>
 </div>
 </CardContent>
 </Card>
 </motion.div>
 );
}

// ── Alpha Decay Chart ─────────────────────────────────────────────────────────

const DECAY_SIGNALS = [
 { label: "Momentum (Fast)", halfLife: 8, icPeak: 0.055, color: "#6366f1" },
 { label: "Momentum (Slow)", halfLife: 45, icPeak: 0.043, color: "#818cf8" },
 { label: "Value", halfLife: 150, icPeak: 0.034, color: "#22c55e" },
 { label: "Quality", halfLife: 240, icPeak: 0.047, color: "#f59e0b" },
 { label: "Sentiment (NLP)", halfLife: 3, icPeak: 0.038, color: "#ec4899" },
];

function AlphaDecayChart() {
 const W = 560; const H = 220; const PX = 44; const PY = 16;
 const maxT = 60;
 const maxIC = 0.06;

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
 {/* Grid */}
 {[0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06].map((v) => {
 const y = PY + (1 - v / maxIC) * (H - PY * 2);
 return (
 <g key={v}>
 <line x1={PX} y1={y} x2={W - PX} y2={y} stroke="#ffffff10" strokeWidth={1} />
 <text x={PX - 4} y={y + 4} fill="#6b7280" fontSize={9} textAnchor="end">{v.toFixed(2)}</text>
 </g>
 );
 })}
 {/* X ticks */}
 {[0, 10, 20, 30, 40, 50, 60].map((t) => {
 const x = PX + (t / maxT) * (W - PX * 2);
 return (
 <g key={t}>
 <line x1={x} y1={PY} x2={x} y2={H - PY} stroke="#ffffff08" strokeWidth={1} />
 <text x={x} y={H - 3} fill="#6b7280" fontSize={9} textAnchor="middle">{t}d</text>
 </g>
 );
 })}
 {/* Axes */}
 <line x1={PX} y1={PY} x2={PX} y2={H - PY} stroke="#374151" strokeWidth={1} />
 <line x1={PX} y1={H - PY} x2={W - PX} y2={H - PY} stroke="#374151" strokeWidth={1} />
 {/* Decay curves */}
 {DECAY_SIGNALS.map((ds) => {
 const pts = decayCurve(ds.halfLife, ds.icPeak, maxT + 1);
 const svgPts = pts.map((p) => ({
 x: PX + (p.t / maxT) * (W - PX * 2),
 y: PY + (1 - p.ic / maxIC) * (H - PY * 2),
 }));
 return (
 <path
 key={ds.label}
 d={polyline(svgPts)}
 fill="none"
 stroke={ds.color}
 strokeWidth={2}
 strokeLinecap="round"
 />
 );
 })}
 {/* Axis labels */}
 <text x={W / 2} y={H} fill="#9ca3af" fontSize={9} textAnchor="middle">Days Held</text>
 <text x={8} y={H / 2} fill="#9ca3af" fontSize={9} textAnchor="middle" transform={`rotate(-90,8,${H / 2})`}>IC</text>
 </svg>
 );
}

// ── Backtest Equity Curve ─────────────────────────────────────────────────────

function BacktestEquityCurve() {
 const W = 560; const H = 240; const PX = 48; const PY = 16;
 const longShort = generateEquityCurve(803, 0.14, 0.08, 252);
 const longOnly = generateEquityCurve(902, 0.10, 0.18, 252);
 const benchmark = generateEquityCurve(1100, 0.07, 0.16, 252);

 const allVals = [...longShort, ...longOnly, ...benchmark];
 const minV = Math.min(...allVals) * 0.98;
 const maxV = Math.max(...allVals) * 1.02;

 const lsPts = mapToSVG(longShort, W, H, PX, PY, minV, maxV);
 const loPts = mapToSVG(longOnly, W, H, PX, PY, minV, maxV);
 const bmPts = mapToSVG(benchmark, W, H, PX, PY, minV, maxV);

 const yTicks = [minV, minV + (maxV - minV) * 0.25, minV + (maxV - minV) * 0.5, minV + (maxV - minV) * 0.75, maxV];

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
 {yTicks.map((v, i) => {
 const y = PY + (1 - (v - minV) / (maxV - minV)) * (H - PY * 2);
 return (
 <g key={i}>
 <line x1={PX} y1={y} x2={W - PX} y2={y} stroke="#ffffff08" strokeWidth={1} />
 <text x={PX - 4} y={y + 4} fill="#6b7280" fontSize={9} textAnchor="end">{v.toFixed(0)}</text>
 </g>
 );
 })}
 {/* Quarter lines */}
 {[0, 63, 126, 189, 252].map((t) => {
 const x = PX + (t / 251) * (W - PX * 2);
 const qLabels = ["Jan", "Apr", "Jul", "Oct", "Dec"];
 return (
 <g key={t}>
 <line x1={x} y1={PY} x2={x} y2={H - PY} stroke="#ffffff08" strokeWidth={1} />
 <text x={x} y={H - 3} fill="#6b7280" fontSize={9} textAnchor="middle">{qLabels[Math.floor(t / 63)]}</text>
 </g>
 );
 })}
 <line x1={PX} y1={PY} x2={PX} y2={H - PY} stroke="#374151" strokeWidth={1} />
 <line x1={PX} y1={H - PY} x2={W - PX} y2={H - PY} stroke="#374151" strokeWidth={1} />
 {/* Benchmark */}
 <path d={polyline(bmPts)} fill="none" stroke="#6b7280" strokeWidth={1.5} strokeDasharray="4 3" />
 {/* Long Only */}
 <path d={polyline(loPts)} fill="none" stroke="#22c55e" strokeWidth={1.5} />
 {/* Long-Short (filled area under) */}
 <path
 d={`${polyline(lsPts)} L ${lsPts[lsPts.length - 1].x.toFixed(2)} ${(H - PY).toFixed(2)} L ${PX} ${(H - PY).toFixed(2)} Z`}
 fill="#6366f118"
 />
 <path d={polyline(lsPts)} fill="none" stroke="#6366f1" strokeWidth={2} />
 {/* Legend */}
 {[
 { label: "L/S Quant", color: "#6366f1", dash: false },
 { label: "Long Only", color: "#22c55e", dash: false },
 { label: "Benchmark", color: "#6b7280", dash: true },
 ].map((leg, i) => (
 <g key={leg.label} transform={`translate(${PX + 8 + i * 90}, ${PY + 8})`}>
 <line x1={0} y1={6} x2={16} y2={6} stroke={leg.color} strokeWidth={2} strokeDasharray={leg.dash ? "4 3" : undefined} />
 <text x={20} y={10} fill="#9ca3af" fontSize={9}>{leg.label}</text>
 </g>
 ))}
 </svg>
 );
}

// ── IC Autocorrelation Chart ──────────────────────────────────────────────────

function ICAutocorrelationChart() {
 resetSeed();
 const W = 560; const H = 200; const PX = 44; const PY = 16;
 const lags = 24; // months
 const acf: number[] = Array.from({ length: lags }, (_, i) => {
 const base = Math.exp(-i * 0.18) * 0.62;
 const noise = (rand() - 0.5) * 0.12;
 return base + noise;
 });
 const maxAbs = 0.7;

 const barW = (W - PX * 2) / lags - 2;
 const zeroY = PY + (1 - 0 / maxAbs) * ((H - PY * 2) * 0.5 + (H - PY * 2) * 0.5);
 const centerY = PY + (H - PY * 2) / 2;
 // 95% CI line: 1.96/sqrt(n) approx 0.15 for n=170
 const ci95 = 0.15;
 const ciY1 = centerY - (ci95 / maxAbs) * (H - PY * 2) / 2;
 const ciY2 = centerY + (ci95 / maxAbs) * (H - PY * 2) / 2;

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
 {/* CI band */}
 <rect x={PX} y={ciY1} width={W - PX * 2} height={ciY2 - ciY1} fill="#6366f110" />
 <line x1={PX} y1={ciY1} x2={W - PX} y2={ciY1} stroke="#6366f140" strokeWidth={1} strokeDasharray="4 3" />
 <line x1={PX} y1={ciY2} x2={W - PX} y2={ciY2} stroke="#6366f140" strokeWidth={1} strokeDasharray="4 3" />
 {/* Zero line */}
 <line x1={PX} y1={centerY} x2={W - PX} y2={centerY} stroke="#374151" strokeWidth={1} />
 {/* Y ticks */}
 {[-0.6, -0.3, 0, 0.3, 0.6].map((v) => {
 const y = centerY - (v / maxAbs) * (H - PY * 2) / 2;
 return (
 <g key={v}>
 <line x1={PX} y1={y} x2={W - PX} y2={y} stroke="#ffffff08" strokeWidth={1} />
 <text x={PX - 4} y={y + 4} fill="#6b7280" fontSize={9} textAnchor="end">{v.toFixed(1)}</text>
 </g>
 );
 })}
 {/* Bars */}
 {acf.map((val, i) => {
 const x = PX + i * (barW + 2);
 const barH = Math.abs(val) / maxAbs * (H - PY * 2) / 2;
 const y = val >= 0 ? centerY - barH : centerY;
 const color = val >= 0 ? "#6366f1" : "#ef4444";
 return (
 <g key={i}>
 <rect x={x} y={y} width={barW} height={barH} fill={color} rx={1} opacity={0.8} />
 {i % 4 === 0 && (
 <text x={x + barW / 2} y={H - 3} fill="#6b7280" fontSize={9} textAnchor="middle">{i + 1}m</text>
 )}
 </g>
 );
 })}
 {/* Axes */}
 <line x1={PX} y1={PY} x2={PX} y2={H - PY} stroke="#374151" strokeWidth={1} />
 <text x={W / 2} y={H} fill="#9ca3af" fontSize={9} textAnchor="middle">Lag (months)</text>
 <text x={8} y={H / 2} fill="#9ca3af" fontSize={9} textAnchor="middle" transform={`rotate(-90,8,${H / 2})`}>Autocorr.</text>
 {/* CI label */}
 <text x={W - PX - 2} y={ciY1 - 3} fill="#6366f170" fontSize={8} textAnchor="end">95% CI</text>
 </svg>
 );
}

// ── Signal Status Badge ───────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Signal["status"] }) {
 if (status === "live") return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Live</Badge>;
 if (status === "research") return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">Research</Badge>;
 return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">Deprecated</Badge>;
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AlphaResearchPage() {
 const [sortField, setSortField] = useState<keyof Signal>("ir");
 const [sortAsc, setSortAsc] = useState(false);
 const [activeCategory, setActiveCategory] = useState<string>("all");

 const filteredSignals = useMemo(() => {
 const filtered = activeCategory === "all"
 ? SIGNALS
 : SIGNALS.filter((s) => s.category === activeCategory);
 return [...filtered].sort((a, b) => {
 const av = a[sortField] as number;
 const bv = b[sortField] as number;
 return sortAsc ? av - bv : bv - av;
 });
 }, [sortField, sortAsc, activeCategory]);

 const avgIC = (SIGNALS.reduce((a, s) => a + s.ic, 0) / SIGNALS.length).toFixed(4);
 const avgIR = (SIGNALS.reduce((a, s) => a + s.ir, 0) / SIGNALS.length).toFixed(2);
 const avgHL = Math.round(SIGNALS.reduce((a, s) => a + s.decayRate, 0) / SIGNALS.length);
 const avgHit = ((SIGNALS.reduce((a, s) => a + s.hitRate, 0) / SIGNALS.length) * 100).toFixed(1);

 const handleSort = (field: keyof Signal) => {
 if (field === sortField) setSortAsc(!sortAsc);
 else { setSortField(field); setSortAsc(false); }
 };

 const replicatedCount = FACTOR_ZOO.filter((f) => f.replicated).length;
 const notReplicated = FACTOR_ZOO.length - replicatedCount;

 const categories = ["all", "momentum", "value", "quality", "sentiment", "technical", "alternative"];

 return (
 <div className="flex h-full flex-col overflow-y-auto">
 <div className="mx-auto w-full max-w-5xl px-6 py-8 flex-1 flex flex-col">

 {/* Hero */}
 <div className="mb-6">
 <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Alpha Research</h1>
 <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40">EDGE · SIGNAL DISCOVERY · ALPHA GENERATION</p>
 </div>

 <div className="border-t border-border mb-6" />

 {/* Key Metrics */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
 <MetricCard icon={Activity} label="Avg IC (Mean)" value={avgIC} sub="Portfolio IC average" color="#6366f1" delay={0.05} />
 <MetricCard icon={Target} label="Avg IR" value={avgIR} sub="Information Ratio avg" color="#22c55e" delay={0.10} />
 <MetricCard icon={Clock} label="Decay Half-Life" value={`${avgHL}d`} sub="Days until IC halves" color="#f59e0b" delay={0.15} />
 <MetricCard icon={CheckCircle} label="Avg Hit Rate" value={`${avgHit}%`}sub="Directional accuracy" color="#ec4899" delay={0.20} />
 </div>

 {/* Tabs */}
 <Tabs defaultValue="library" className="flex-1 flex flex-col">
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto mb-6">
 <TabsTrigger value="library" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Signal Library</TabsTrigger>
 <TabsTrigger value="backtest" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Backtesting</TabsTrigger>
 <TabsTrigger value="decay" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Alpha Decay</TabsTrigger>
 <TabsTrigger value="zoo" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Factor Zoo</TabsTrigger>
 </TabsList>

 {/* ── Signal Library ── */}
 <TabsContent value="library" className="space-y-4">
 {/* Category filter */}
 <div className="flex gap-2 flex-wrap">
 {categories.map((cat) => (
 <Button
 key={cat}
 variant={activeCategory === cat ? "default" : "outline"}
 size="sm"
 onClick={() => setActiveCategory(cat)}
 className="capitalize text-xs text-muted-foreground h-7"
 style={
 activeCategory === cat && cat !== "all"
 ? { backgroundColor: CATEGORY_COLORS[cat] + "33", borderColor: CATEGORY_COLORS[cat] + "66", color: CATEGORY_COLORS[cat] }
 : undefined
 }
 >
 {cat}
 </Button>
 ))}
 </div>

 <Card className="border-border bg-card">
 <CardContent className="p-0">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="border-b border-border bg-muted/30 sticky top-0">
 <tr>
 <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Signal</th>
 <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Category</th>
 {(["ic","icStd","ir","decayRate","hitRate"] as (keyof Signal)[]).map((col) => {
 const labels: Record<string, string> = { ic: "IC", icStd: "IC σ", ir: "IR", decayRate: "Half-Life", hitRate: "Hit Rate" };
 return (
 <th
 key={col}
 className="text-right px-4 py-3 text-xs text-muted-foreground font-medium cursor-pointer hover:text-foreground select-none"
 onClick={() => handleSort(col)}
 >
 <span className="flex items-center justify-end gap-1">
 {labels[col]}
 {sortField === col
 ? (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
 : <ChevronDown className="w-3 h-3 opacity-30" />}
 </span>
 </th>
 );
 })}
 <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium">Status</th>
 </tr>
 </thead>
 <tbody>
 {filteredSignals.map((sig, i) => {
 const catColor = CATEGORY_COLORS[sig.category];
 return (
 <tr key={sig.id} className={`border-b border-border hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
 <td className="px-4 py-2.5 font-medium text-sm">{sig.name}</td>
 <td className="px-4 py-2.5">
 <span className="text-xs px-2 py-0.5 rounded-full capitalize font-medium" style={{ backgroundColor: catColor + "22", color: catColor }}>
 {sig.category}
 </span>
 </td>
 <td className="px-4 py-2.5 text-right tabular-nums">
 <span className={sig.ic >= 0.04 ? "text-green-400" : sig.ic >= 0.03 ? "text-amber-400" : "text-muted-foreground"}>
 {sig.ic.toFixed(3)}
 </span>
 </td>
 <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{sig.icStd.toFixed(3)}</td>
 <td className="px-4 py-2.5 text-right tabular-nums">
 <span className={sig.ir >= 0.5 ? "text-green-400" : sig.ir >= 0.3 ? "text-amber-400" : "text-red-400"}>
 {sig.ir.toFixed(2)}
 </span>
 </td>
 <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{sig.decayRate}d</td>
 <td className="px-4 py-2.5 text-right tabular-nums">
 <span className={sig.hitRate >= 0.55 ? "text-green-400" : sig.hitRate >= 0.52 ? "text-amber-400" : "text-muted-foreground"}>
 {(sig.hitRate * 100).toFixed(1)}%
 </span>
 </td>
 <td className="px-4 py-2.5 text-center"><StatusBadge status={sig.status} /></td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>

 {/* IC formula explainer */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {[
 { label: "IC (Information Coefficient)", desc: "Rank correlation between signal values and subsequent returns. IC > 0.05 is considered strong; 0.02–0.05 is typical for well-constructed signals.", color: "#6366f1" },
 { label: "IR (Information Ratio)", desc: "IC mean divided by IC standard deviation (IC_IR = μ_IC / σ_IC). Analogous to a Sharpe ratio for signal quality. IR > 0.5 indicates a robust signal.", color: "#22c55e" },
 { label: "Decay Half-Life", desc: "The time it takes for a signal's predictive IC to fall to 50% of its peak. Momentum signals decay in days; value signals may persist for months.", color: "#f59e0b" },
 ].map((item) => (
 <Card key={item.label} className="border-border bg-card">
 <CardContent className="pt-4 pb-3">
 <div className="flex gap-2 items-start">
 <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: item.color }} />
 <div>
 <p className="text-xs font-semibold mb-1" style={{ color: item.color }}>{item.label}</p>
 <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
 </div>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 </TabsContent>

 {/* ── Backtesting ── */}
 <TabsContent value="backtest" className="space-y-4">
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
 {[
 { label: "L/S Annual Return", value: "+14.2%", sub: "Top vs Bottom quintile", color: "#6366f1" },
 { label: "Sharpe Ratio", value: "1.74", sub: "Annualized L/S portfolio", color: "#22c55e" },
 { label: "Max Drawdown", value: "-8.3%", sub: "Worst peak-to-trough", color: "#ef4444" },
 ].map((m) => (
 <Card key={m.label} className="border-border bg-card">
 <CardContent className="pt-4 pb-3 flex items-center gap-3">
 <div className="w-2 h-8 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
 <div>
 <p className="text-lg font-medium" style={{ color: m.color }}>{m.value}</p>
 <p className="text-xs text-muted-foreground">{m.label}</p>
 <p className="text-xs text-muted-foreground/60">{m.sub}</p>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>

 <Card className="border-border bg-card">
 <CardHeader className="pb-2">
 <CardTitle className="text-base">Long-Short Equity Curve (1-Year Simulation)</CardTitle>
 <p className="text-xs text-muted-foreground">Top quintile long / bottom quintile short based on composite signal score. Equal-weighted rebalanced monthly.</p>
 </CardHeader>
 <CardContent>
 <BacktestEquityCurve />
 </CardContent>
 </Card>

 <Card className="border-border bg-card">
 <CardHeader className="pb-2">
 <CardTitle className="text-base">IC Autocorrelation</CardTitle>
 <p className="text-xs text-muted-foreground">Autocorrelation of monthly IC values for the composite signal. Shaded band = 95% confidence interval.</p>
 </CardHeader>
 <CardContent>
 <ICAutocorrelationChart />
 </CardContent>
 </Card>

 <Card className="border-border bg-card border-amber-500/20">
 <CardContent className="pt-4 pb-3">
 <div className="flex gap-2">
 <div>
 <p className="text-xs font-semibold text-amber-400 mb-1">Backtesting Caveats</p>
 <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
 <li>Look-ahead bias: ensure all signal data is point-in-time (PIT)</li>
 <li>Survivorship bias: use delisted securities in the universe</li>
 <li>Transaction costs: apply realistic bid-ask spreads and market impact</li>
 <li>Overfitting: use out-of-sample validation and walk-forward testing</li>
 </ul>
 </div>
 </div>
 </CardContent>
 </Card>
 </TabsContent>

 {/* ── Alpha Decay ── */}
 <TabsContent value="decay" className="space-y-4">
 <Card className="border-border bg-card">
 <CardHeader className="pb-2">
 <CardTitle className="text-base">Alpha Decay Curves by Signal Type</CardTitle>
 <p className="text-xs text-muted-foreground">
 IC as a function of holding period. Exponential decay model: IC(t) = IC₀ × 2^(−t / t½)
 </p>
 </CardHeader>
 <CardContent>
 <AlphaDecayChart />
 {/* Legend */}
 <div className="flex flex-wrap gap-4 mt-3">
 {DECAY_SIGNALS.map((ds) => (
 <div key={ds.label} className="flex items-center gap-1.5">
 <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: ds.color }} />
 <span className="text-xs text-muted-foreground">{ds.label}</span>
 <span className="text-xs text-muted-foreground/60">(t½={ds.halfLife}d)</span>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Card className="border-border bg-card">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center gap-2">
 Decay by Category
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-3">
 {[
 { cat: "Alternative (NLP/News)", hl: 3, color: "#ec4899" },
 { cat: "Technical", hl: 5, color: "#06b6d4" },
 { cat: "Momentum (Fast)", hl: 8, color: "#6366f1" },
 { cat: "Sentiment", hl: 20, color: "#a855f7" },
 { cat: "Momentum (Slow)", hl: 45, color: "#818cf8" },
 { cat: "Value", hl: 150, color: "#22c55e" },
 { cat: "Quality", hl: 240, color: "#f59e0b" },
 ].map((row) => (
 <div key={row.cat}>
 <div className="flex justify-between text-xs text-muted-foreground mb-1">
 <span className="text-muted-foreground">{row.cat}</span>
 <span className="font-medium" style={{ color: row.color }}>{row.hl}d half-life</span>
 </div>
 <div className="h-1.5 bg-muted rounded-full overflow-hidden">
 <div
 className="h-full rounded-full"
 style={{ width: `${Math.min((row.hl / 250) * 100, 100)}%`, backgroundColor: row.color }}
 />
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 <Card className="border-border bg-card">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center gap-2">
 Optimal Holding Period
 </CardTitle>
 </CardHeader>
 <CardContent>
 <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
 Each signal has an optimal rebalancing frequency determined by its decay rate, transaction costs, and portfolio turnover constraints.
 </p>
 <div className="space-y-2">
 {[
 { signal: "News NLP", freq: "Daily", cost: "High TC", net: "+", color: "#ec4899" },
 { signal: "Short Interest", freq: "Weekly", cost: "Mod TC", net: "+", color: "#6366f1" },
 { signal: "12M Momentum", freq: "Monthly", cost: "Low TC", net: "++",color: "#818cf8" },
 { signal: "Analyst Revision", freq: "Monthly", cost: "Low TC", net: "++",color: "#a855f7" },
 { signal: "B/M Value", freq: "Quarterly","cost":"Low TC", net: "+", color: "#22c55e" },
 { signal: "ROE Quality", freq: "Quarterly","cost":"Low TC", net: "++",color: "#f59e0b" },
 ].map((row) => (
 <div key={row.signal} className="flex items-center justify-between py-1 border-b border-border last:border-0">
 <span className="text-xs font-medium" style={{ color: row.color }}>{row.signal}</span>
 <div className="flex gap-2 items-center">
 <Badge variant="outline" className="text-xs text-muted-foreground h-5">{row.freq}</Badge>
 <Badge variant="outline" className="text-xs h-5 text-muted-foreground">{row.cost}</Badge>
 <span className="text-xs font-medium text-green-400">{row.net}</span>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>
 </TabsContent>

 {/* ── Factor Zoo ── */}
 <TabsContent value="zoo" className="space-y-4">
 {/* Stats bar */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 {[
 { label: "Published Factors", value: "400+", sub: "Academic literature", color: "#6366f1" },
 { label: "In Sample Set", value: String(FACTOR_ZOO.length), sub: "Representative sample", color: "#22c55e" },
 { label: "Out-of-Sample Survive", value: String(replicatedCount), sub: `${((replicatedCount/FACTOR_ZOO.length)*100).toFixed(0)}% replication rate`, color: "#f59e0b" },
 { label: "Failed Replication", value: String(notReplicated), sub: "Data mining artifacts", color: "#ef4444" },
 ].map((m) => (
 <Card key={m.label} className="border-border bg-card">
 <CardContent className="pt-4 pb-3 flex items-center gap-3">
 <div className="w-2 h-8 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
 <div>
 <p className="text-xl font-medium" style={{ color: m.color }}>{m.value}</p>
 <p className="text-xs text-muted-foreground">{m.label}</p>
 <p className="text-xs text-muted-foreground/60">{m.sub}</p>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>

 {/* Multiple testing chart */}
 <Card className="border-border bg-card">
 <CardHeader className="pb-2">
 <CardTitle className="text-base flex items-center gap-2">
 The Multiple-Testing Problem
 </CardTitle>
 <p className="text-xs text-muted-foreground">
 With 400+ published factors, the minimum t-statistic required to claim significance rises substantially. Harvey, Liu & Zhu (2016) argue the threshold should be ≥ 3.0.
 </p>
 </CardHeader>
 <CardContent>
 {/* Inline t-stat distribution visualization */}
 <MultipleTestingChart />
 </CardContent>
 </Card>

 {/* Factor table */}
 <Card className="border-border bg-card">
 <CardHeader className="pb-2">
 <CardTitle className="text-base">Factor Library (Sample)</CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="border-b border-border bg-muted/30">
 <tr>
 <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Factor</th>
 <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Category</th>
 <th className="text-right px-4 py-2.5 text-xs text-muted-foreground font-medium">First Published</th>
 <th className="text-right px-4 py-2.5 text-xs text-muted-foreground font-medium">t-Stat</th>
 <th className="text-center px-4 py-2.5 text-xs text-muted-foreground font-medium">Replicated</th>
 </tr>
 </thead>
 <tbody>
 {FACTOR_ZOO.map((f, i) => (
 <tr key={f.name} className={`border-b border-border hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
 <td className="px-4 py-2 text-sm font-medium">{f.name}</td>
 <td className="px-4 py-2">
 <span className="text-xs text-muted-foreground">{f.category}</span>
 </td>
 <td className="px-4 py-2 text-right text-xs text-muted-foreground tabular-nums">{f.year}</td>
 <td className="px-4 py-2 text-right tabular-nums">
 <span className={f.tStat >= 3 ? "text-green-400" : f.tStat >= 2.5 ? "text-amber-400" : "text-red-400"}>
 {f.tStat.toFixed(2)}
 </span>
 </td>
 <td className="px-4 py-2 text-center">
 {f.replicated
 ? <CheckCircle className="w-3.5 h-3.5 text-green-400 inline" />
 : <AlertTriangle className="w-3.5 h-3.5 text-red-400 inline" />}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>

 <Card className="border-border bg-card border-border">
 <CardContent className="pt-4 pb-3">
 <div className="flex gap-2">
 <div>
 <p className="text-xs font-semibold text-foreground mb-1">Researcher&apos;s Dilemma</p>
 <p className="text-xs text-muted-foreground leading-relaxed">
 With hundreds of tested factors, a 5% false discovery rate (FDR) implies roughly 20 spurious signals per 400 tested. The Bonferroni correction or Benjamini-Hochberg procedure should be applied when reporting multi-factor discoveries. Machine learning approaches (e.g., LASSO, elastic net) can help manage the multiple-testing burden by regularizing factor selection.
 </p>
 </div>
 </div>
 </CardContent>
 </Card>
 </TabsContent>
 </Tabs>
 </div>
 </div>
 );
}

// ── Multiple Testing Chart ────────────────────────────────────────────────────

function MultipleTestingChart() {
 const W = 560; const H = 180; const PX = 44; const PY = 16;
 const maxT = 6; const minT = 0;
 const totalBars = 30;
 // Generate a mock t-stat distribution (skewed right, many low t-stats)
 const bins: number[] = Array.from({ length: totalBars }, (_, i) => {
 const t = (i / (totalBars - 1)) * maxT;
 const height = 80 * Math.exp(-0.5 * Math.pow((t - 1.2) / 0.9, 2)) + 5;
 return height;
 });
 const maxH = Math.max(...bins);
 const barW = (W - PX * 2) / totalBars - 1;

 const sig196 = (1.96 / maxT) * (W - PX * 2) + PX;
 const sig300 = (3.00 / maxT) * (W - PX * 2) + PX;

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
 {/* Bars */}
 {bins.map((h, i) => {
 const t = (i / (totalBars - 1)) * maxT;
 const x = PX + i * (barW + 1);
 const barHeight = (h / maxH) * (H - PY * 2 - 20);
 const y = H - PY - 20 - barHeight;
 const color = t >= 3.0 ? "#22c55e" : t >= 1.96 ? "#f59e0b" : "#6366f140";
 return <rect key={i} x={x} y={y} width={barW} height={barHeight} fill={color} rx={1} />;
 })}
 {/* t=1.96 line */}
 <line x1={sig196} y1={PY} x2={sig196} y2={H - PY - 20} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 3" />
 <text x={sig196 + 3} y={PY + 12} fill="#f59e0b" fontSize={9}>t=1.96</text>
 <text x={sig196 + 3} y={PY + 22} fill="#f59e0b80" fontSize={8}>(p&lt;0.05)</text>
 {/* t=3.0 line */}
 <line x1={sig300} y1={PY} x2={sig300} y2={H - PY - 20} stroke="#22c55e" strokeWidth={1.5} strokeDasharray="4 3" />
 <text x={sig300 + 3} y={PY + 12} fill="#22c55e" fontSize={9}>t=3.0</text>
 <text x={sig300 + 3} y={PY + 22} fill="#22c55e80" fontSize={8}>(HLZ threshold)</text>
 {/* X axis */}
 <line x1={PX} y1={H - PY - 20} x2={W - PX} y2={H - PY - 20} stroke="#374151" strokeWidth={1} />
 {[0, 1, 2, 3, 4, 5, 6].map((t) => {
 const x = PX + (t / maxT) * (W - PX * 2);
 return (
 <g key={t}>
 <text x={x} y={H - PY - 6} fill="#6b7280" fontSize={9} textAnchor="middle">{t}</text>
 </g>
 );
 })}
 <text x={W / 2} y={H - 1} fill="#9ca3af" fontSize={9} textAnchor="middle">|t-statistic|</text>
 {/* Legend */}
 <rect x={PX + 4} y={H - PY - 18} width={8} height={8} fill="#6366f140" rx={1} />
 <text x={PX + 15} y={H - PY - 11} fill="#9ca3af" fontSize={8}>Fails t=1.96</text>
 <rect x={PX + 80} y={H - PY - 18} width={8} height={8} fill="#f59e0b" rx={1} />
 <text x={PX + 91} y={H - PY - 11} fill="#9ca3af" fontSize={8}>Passes 1.96, fails HLZ</text>
 <rect x={PX + 210} y={H - PY - 18} width={8} height={8} fill="#22c55e" rx={1} />
 <text x={PX + 221} y={H - PY - 11} fill="#9ca3af" fontSize={8}>Passes HLZ threshold</text>
 {/* Y label */}
 <line x1={PX} y1={PY} x2={PX} y2={H - PY - 20} stroke="#374151" strokeWidth={1} />
 <text x={8} y={(H - 20) / 2} fill="#9ca3af" fontSize={9} textAnchor="middle" transform={`rotate(-90,8,${(H - 20) / 2})`}>Count</text>
 </svg>
 );
}
