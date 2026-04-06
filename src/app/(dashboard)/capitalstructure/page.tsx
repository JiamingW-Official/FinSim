"use client";

import { useState, useMemo } from "react";
import {
 Layers,
 TrendingDown,
 AlertTriangle,
 ShieldCheck,
 BarChart2,
 DollarSign,
 Activity,
 Target,
 ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 973;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};

// Pre-generate stable values
const _pool = Array.from({ length: 500 }, () => rand());
let _pi = 0;
const sv = () => _pool[_pi++ % _pool.length];

// ── Types ──────────────────────────────────────────────────────────────────────
interface Tranche {
 name: string;
 amount: number; // $M face value
 color: string;
 bgColor: string;
 priority: number; // 1 = highest (paid first)
 coupon: number; // %
 rating: string;
}

interface DistressedCompany {
 name: string;
 ticker: string;
 price: number; // cents on the dollar
 ytm: number; // yield to maturity %
 duration: number; // years
 situation: string;
 industry: string;
 ebitda: number; // $M
 leverage: number; // x
 badge: "covenant" | "maturity" | "liquidity" | "restructuring";
}

interface Covenant {
 name: string;
 metric: string;
 current: number;
 limit: number;
 direction: "below" | "above"; // below = bad if current > limit
 unit: string;
}

// ── Static Data (seeded) ───────────────────────────────────────────────────────
const TRANCHES: Tranche[] = [
 {
 name: "Senior Secured (TLB)",
 amount: 350,
 color: "#22c55e",
 bgColor: "rgba(34,197,94,0.12)",
 priority: 1,
 coupon: 5.5 + sv() * 1.5,
 rating: "B+",
 },
 {
 name: "Senior Secured (RCF)",
 amount: 100,
 color: "#4ade80",
 bgColor: "rgba(74,222,128,0.10)",
 priority: 2,
 coupon: 4.5 + sv() * 1.0,
 rating: "B+",
 },
 {
 name: "Senior Unsecured Notes",
 amount: 250,
 color: "#facc15",
 bgColor: "rgba(250,204,21,0.12)",
 priority: 3,
 coupon: 7.5 + sv() * 2.0,
 rating: "B-",
 },
 {
 name: "Subordinated Notes",
 amount: 150,
 color: "#f97316",
 bgColor: "rgba(249,115,22,0.12)",
 priority: 4,
 coupon: 10.0 + sv() * 3.0,
 rating: "CCC",
 },
 {
 name: "Equity",
 amount: 200,
 color: "#f43f5e",
 bgColor: "rgba(244,63,94,0.10)",
 priority: 5,
 coupon: 0,
 rating: "N/A",
 },
];

const TOTAL_CAPITAL = TRANCHES.reduce((a, t) => a + t.amount, 0); // $1050M

const DISTRESSED_COMPANIES: DistressedCompany[] = [
 {
 name: "Redwood Media Group",
 ticker: "RWMG",
 price: 38 + sv() * 12,
 ytm: 28 + sv() * 8,
 duration: 1.8 + sv() * 0.8,
 situation: "Secular revenue decline; ad market contraction accelerating",
 industry: "Media",
 ebitda: 85 + sv() * 20,
 leverage: 7.8 + sv() * 1.2,
 badge: "covenant",
 },
 {
 name: "Cascade Retail Holdings",
 ticker: "CSRT",
 price: 42 + sv() * 15,
 ytm: 31 + sv() * 6,
 duration: 2.2 + sv() * 0.5,
 situation: "Lease obligations + e-commerce headwinds; 14 store closures announced",
 industry: "Retail",
 ebitda: 120 + sv() * 30,
 leverage: 6.5 + sv() * 1.0,
 badge: "liquidity",
 },
 {
 name: "Apex Offshore Drilling",
 ticker: "APXO",
 price: 52 + sv() * 8,
 ytm: 22 + sv() * 5,
 duration: 3.1 + sv() * 0.7,
 situation: "Day-rate compression; $400M term loan matures in 18 months",
 industry: "Energy",
 ebitda: 210 + sv() * 40,
 leverage: 5.9 + sv() * 0.8,
 badge: "maturity",
 },
 {
 name: "Vantage Hospital Systems",
 ticker: "VNHS",
 price: 61 + sv() * 7,
 ytm: 18 + sv() * 4,
 duration: 4.0 + sv() * 0.9,
 situation: "Reimbursement cuts + staffing costs; Chapter 11 pre-packaged filing likely",
 industry: "Healthcare",
 ebitda: 160 + sv() * 25,
 leverage: 8.2 + sv() * 0.6,
 badge: "restructuring",
 },
 {
 name: "Ironbark Chemicals",
 ticker: "IRNB",
 price: 46 + sv() * 10,
 ytm: 25 + sv() * 7,
 duration: 2.7 + sv() * 0.6,
 situation: "Environmental liability + capex overrun; covenant waiver expired",
 industry: "Chemicals",
 ebitda: 95 + sv() * 15,
 leverage: 7.1 + sv() * 1.1,
 badge: "covenant",
 },
];

const COVENANTS: Covenant[] = [
 {
 name: "Total Leverage",
 metric: "Net Debt / EBITDA",
 current: 6.8,
 limit: 7.0,
 direction: "below",
 unit: "x",
 },
 {
 name: "Interest Coverage",
 metric: "EBITDA / Interest",
 current: 1.9,
 limit: 2.0,
 direction: "above",
 unit: "x",
 },
 {
 name: "Fixed Charge Coverage",
 metric: "EBITDA - Capex / Fixed Charges",
 current: 1.1,
 limit: 1.1,
 direction: "above",
 unit: "x",
 },
 {
 name: "Senior Secured Leverage",
 metric: "Sr Secured Debt / EBITDA",
 current: 3.2,
 limit: 3.5,
 direction: "below",
 unit: "x",
 },
 {
 name: "Minimum Liquidity",
 metric: "Cash + Revolver Availability",
 current: 42,
 limit: 25,
 direction: "above",
 unit: "$M",
 },
];

// ── Normal CDF approximation ───────────────────────────────────────────────────
function normCdf(x: number): number {
 const t = 1 / (1 + 0.2316419 * Math.abs(x));
 const poly =
 t *
 (0.319381530 +
 t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
 const result = 1 - (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x) * poly;
 return x >= 0 ? result : 1 - result;
}

// ── Waterfall Chart SVG ────────────────────────────────────────────────────────
function WaterfallChart({ ev }: { ev: number }) {
 const W = 560;
 const H = 300;
 const PAD = { l: 120, r: 20, t: 20, b: 40 };
 const chartW = W - PAD.l - PAD.r;
 const chartH = H - PAD.t - PAD.b;

 // Calculate recovery at given EV
 let remaining = ev;
 const recoveries = TRANCHES.map((t) => {
 const rec = Math.min(t.amount, Math.max(0, remaining));
 remaining -= rec;
 return { ...t, recovery: rec, pct: (rec / t.amount) * 100 };
 });

 const maxAmount = TOTAL_CAPITAL;
 const barHeight = (chartH / TRANCHES.length) * 0.72;
 const barGap = chartH / TRANCHES.length;

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 320 }}>
 {/* Grid lines */}
 {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
 const x = PAD.l + frac * chartW;
 const val = frac * maxAmount;
 return (
 <g key={`grid-${frac}`}>
 <line x1={x} x2={x} y1={PAD.t} y2={H - PAD.b} stroke="#27272a" strokeWidth="1" />
 <text x={x} y={H - PAD.b + 16} textAnchor="middle" fill="#71717a" fontSize="10">
 ${val === 0 ? "0" : val >= 1000 ? (val / 1000).toFixed(1) + "B" : val + "M"}
 </text>
 </g>
 );
 })}

 {/* X-axis */}
 <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} stroke="#3f3f46" strokeWidth="1" />

 {/* EV line */}
 {ev <= maxAmount && (
 <g>
 <line
 x1={PAD.l + (ev / maxAmount) * chartW}
 x2={PAD.l + (ev / maxAmount) * chartW}
 y1={PAD.t}
 y2={H - PAD.b}
 stroke="#60a5fa"
 strokeWidth="2"
 strokeDasharray="5,3"
 />
 <text
 x={PAD.l + (ev / maxAmount) * chartW + 4}
 y={PAD.t + 12}
 fill="#60a5fa"
 fontSize="9"
 fontWeight="600"
 >
 EV ${ev}M
 </text>
 </g>
 )}

 {/* Bars */}
 {recoveries.map((t, i) => {
 const y = PAD.t + i * barGap + (barGap - barHeight) / 2;
 const fullW = (t.amount / maxAmount) * chartW;
 const recW = (t.recovery / maxAmount) * chartW;
 const isFulcrum = t.recovery > 0 && t.recovery < t.amount;

 return (
 <g key={`bar-${i}`}>
 {/* Label */}
 <text x={PAD.l - 8} y={y + barHeight / 2 + 4} textAnchor="end" fill="#a1a1aa" fontSize="10">
 {t.name.split(" ").slice(0, 2).join(" ")}
 </text>
 {/* Face value bar (gray background) */}
 <rect
 x={PAD.l}
 y={y}
 width={fullW}
 height={barHeight}
 fill="#27272a"
 rx="3"
 />
 {/* Recovery bar */}
 {recW > 0 && (
 <rect
 x={PAD.l}
 y={y}
 width={recW}
 height={barHeight}
 fill={t.color}
 fillOpacity={0.85}
 rx="3"
 />
 )}
 {/* Fulcrum indicator */}
 {isFulcrum && (
 <>
 <rect
 x={PAD.l}
 y={y - 3}
 width={fullW}
 height={barHeight + 6}
 fill="none"
 stroke="#60a5fa"
 strokeWidth="2"
 rx="4"
 strokeDasharray="4,2"
 />
 <text
 x={PAD.l + recW + 4}
 y={y + barHeight / 2 + 4}
 fill="#60a5fa"
 fontSize="9"
 fontWeight="700"
 >
 FULCRUM
 </text>
 </>
 )}
 {/* Pct label */}
 <text
 x={PAD.l + recW + (isFulcrum ? 60 : 4)}
 y={y + barHeight / 2 + 4}
 fill="#d4d4d8"
 fontSize="9"
 >
 {t.recovery === 0 ? "0¢" : t.pct >= 100 ? "Par" : t.pct.toFixed(0) + "¢"}
 </text>
 </g>
 );
 })}

 {/* X-axis label */}
 <text x={PAD.l + chartW / 2} y={H - 4} textAnchor="middle" fill="#71717a" fontSize="10">
 Face Value / Recovery ($M)
 </text>
 </svg>
 );
}

// ── Merton Model ───────────────────────────────────────────────────────────────
interface MertonResult {
 pd: number; // probability of default %
 spread: number; // credit spread bps
 d1: number;
 d2: number;
 distanceToDefault: number;
}

function computeMerton(assetValue: number, debtFace: number, assetVol: number, tenor: number): MertonResult {
 const r = 0.04; // risk-free 4%
 if (assetValue <= 0 || debtFace <= 0 || assetVol <= 0) {
 return { pd: 0, spread: 0, d1: 0, d2: 0, distanceToDefault: 0 };
 }
 const d1 =
 (Math.log(assetValue / debtFace) + (r + 0.5 * assetVol * assetVol) * tenor) /
 (assetVol * Math.sqrt(tenor));
 const d2 = d1 - assetVol * Math.sqrt(tenor);
 const pd = normCdf(-d2) * 100;
 // Credit spread: simplified as pd * lgd / tenor (LGD = 40%)
 const lgd = 0.4;
 const spread = ((pd / 100) * lgd) / tenor * 10000; // bps
 return { pd, spread, d1, d2, distanceToDefault: d2 };
}

function MertonPanel() {
 const [assetValue, setAssetValue] = useState(800);
 const [debtFace, setDebtFace] = useState(500);
 const [assetVol, setAssetVol] = useState(30);

 const result = useMemo(
 () => computeMerton(assetValue, debtFace, assetVol / 100, 3),
 [assetValue, debtFace, assetVol]
 );

 const pdColor =
 result.pd < 5 ? "text-emerald-400" : result.pd < 20 ? "text-yellow-400" : "text-red-400";
 const dtdColor =
 result.distanceToDefault > 2 ? "text-emerald-400" : result.distanceToDefault > 0.5 ? "text-yellow-400" : "text-red-400";

 // Gauge-style SVG for PD
 const GW = 200;
 const GH = 110;
 const cx = GW / 2;
 const cy = GH - 10;
 const R = 80;
 const startAngle = Math.PI;
 const endAngle = 0;
 const pdAngle = startAngle + ((100 - result.pd) / 100) * (startAngle - endAngle);

 function arcPath(startA: number, endA: number, r: number): string {
 const x1 = cx + r * Math.cos(startA);
 const y1 = cy + r * Math.sin(startA);
 const x2 = cx + r * Math.cos(endA);
 const y2 = cy + r * Math.sin(endA);
 const large = Math.abs(endA - startA) > Math.PI ? 1 : 0;
 return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
 }

 return (
 <div className="space-y-5">
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 {/* Asset Value */}
 <div className="space-y-2">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">Asset Value</span>
 <span className="text-foreground font-semibold">${assetValue}M</span>
 </div>
 <Slider
 value={[assetValue]}
 min={200}
 max={1500}
 step={10}
 onValueChange={(v) => setAssetValue(v[0])}
 className="w-full"
 />
 <div className="flex justify-between text-xs text-muted-foreground">
 <span>$200M</span><span>$1,500M</span>
 </div>
 </div>

 {/* Debt Face */}
 <div className="space-y-2">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">Debt Face Value</span>
 <span className="text-foreground font-semibold">${debtFace}M</span>
 </div>
 <Slider
 value={[debtFace]}
 min={100}
 max={1200}
 step={10}
 onValueChange={(v) => setDebtFace(v[0])}
 className="w-full"
 />
 <div className="flex justify-between text-xs text-muted-foreground">
 <span>$100M</span><span>$1,200M</span>
 </div>
 </div>

 {/* Asset Volatility */}
 <div className="space-y-2">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">Asset Volatility</span>
 <span className="text-foreground font-semibold">{assetVol}%</span>
 </div>
 <Slider
 value={[assetVol]}
 min={5}
 max={80}
 step={1}
 onValueChange={(v) => setAssetVol(v[0])}
 className="w-full"
 />
 <div className="flex justify-between text-xs text-muted-foreground">
 <span>5%</span><span>80%</span>
 </div>
 </div>
 </div>

 {/* Results */}
 <div className="grid grid-cols-2 gap-3">
 {/* PD Gauge */}
 <div className="bg-muted/50 rounded-lg p-3 flex flex-col items-center">
 <p className="text-xs text-muted-foreground mb-1">Probability of Default</p>
 <svg viewBox={`0 0 ${GW} ${GH}`} className="w-40">
 <defs>
 <linearGradient id="gaugeGrad" x1="1" y1="0" x2="0" y2="0">
 <stop offset="0%" stopColor="#22c55e" />
 <stop offset="50%" stopColor="#facc15" />
 <stop offset="100%" stopColor="#ef4444" />
 </linearGradient>
 </defs>
 {/* Background arc */}
 <path d={arcPath(Math.PI, 0, R)} fill="none" stroke="#3f3f46" strokeWidth="14" />
 {/* Value arc */}
 <path
 d={arcPath(Math.PI, pdAngle, R)}
 fill="none"
 stroke="url(#gaugeGrad)"
 strokeWidth="14"
 strokeLinecap="round"
 />
 {/* Needle */}
 <line
 x1={cx}
 y1={cy}
 x2={cx + (R - 20) * Math.cos(Math.PI - (result.pd / 100) * Math.PI)}
 y2={cy + (R - 20) * Math.sin(Math.PI - (result.pd / 100) * Math.PI)}
 stroke="#f4f4f5"
 strokeWidth="2"
 strokeLinecap="round"
 />
 <circle cx={cx} cy={cy} r="4" fill="#f4f4f5" />
 <text x={cx} y={cy - 20} textAnchor="middle" fill="#f4f4f5" fontSize="18" fontWeight="700">
 {result.pd.toFixed(1)}%
 </text>
 </svg>
 </div>

 {/* Key Metrics */}
 <div className="bg-muted/50 rounded-lg p-3 space-y-2">
 <p className="text-xs text-muted-foreground font-medium mb-2">Merton Outputs</p>
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">Distance-to-Default</span>
 <span className={`font-medium ${dtdColor}`}>{result.distanceToDefault.toFixed(2)}σ</span>
 </div>
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">Credit Spread</span>
 <span className="text-foreground font-medium">{result.spread.toFixed(0)} bps</span>
 </div>
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">d₁</span>
 <span className="text-muted-foreground">{result.d1.toFixed(3)}</span>
 </div>
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">d₂</span>
 <span className="text-muted-foreground">{result.d2.toFixed(3)}</span>
 </div>
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">Asset / Debt Ratio</span>
 <span className={assetValue >= debtFace ? "text-emerald-400 font-medium" : "text-red-400 font-medium"}>
 {(assetValue / debtFace).toFixed(2)}x
 </span>
 </div>
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">Default Signal</span>
 <span className={pdColor + " font-medium"}>
 {result.pd < 5 ? "Safe" : result.pd < 20 ? "Watch" : result.pd < 50 ? "At Risk" : "Distressed"}
 </span>
 </div>
 </div>
 </div>

 <div className="bg-muted/30 rounded p-3 text-xs text-muted-foreground leading-relaxed">
 <span className="text-foreground font-medium">Merton (1974) Structural Model: </span>
 Treats equity as a call option on firm assets with strike = debt face. When asset value
 falls below debt at maturity, default occurs. Distance-to-Default (d₂) measures standard
 deviations between current asset value and default threshold — a key input to credit ratings.
 </div>
 </div>
 );
}

// ── Covenant Tracker ───────────────────────────────────────────────────────────
function CovenantTracker() {
 const getStatus = (c: Covenant) => {
 if (c.direction === "below") {
 const headroom = ((c.limit - c.current) / c.limit) * 100;
 if (headroom < 0) return "breach";
 if (headroom < 8) return "tight";
 return "ok";
 } else {
 const headroom = ((c.current - c.limit) / c.limit) * 100;
 if (headroom < 0) return "breach";
 if (headroom < 5) return "tight";
 return "ok";
 }
 };

 const statusBadge = (status: string) => {
 if (status === "breach") return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">BREACH</Badge>;
 if (status === "tight") return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">TIGHT</Badge>;
 return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">OK</Badge>;
 };

 return (
 <div className="space-y-3">
 {COVENANTS.map((c, i) => {
 const status = getStatus(c);
 const isBreached = status === "breach";
 const isTight = status === "tight";

 // Progress bar: show current vs limit
 let pct = 0;
 if (c.direction === "below") {
 pct = Math.min((c.current / c.limit) * 100, 120);
 } else {
 pct = Math.min((c.current / (c.limit * 2)) * 100, 100);
 }
 const barColor = isBreached ? "#ef4444" : isTight ? "#eab308" : "#22c55e";

 return (
 <div
 key={i}
 className={`rounded-lg p-3 border ${
 isBreached
 ? "bg-red-950/20 border-red-500/20"
 : isTight
 ? "bg-yellow-950/20 border-yellow-500/20"
 : "bg-muted/40 border-border"
 }`}
 >
 <div className="flex items-center justify-between mb-1">
 <div>
 <span className="text-sm font-medium text-foreground">{c.name}</span>
 <span className="text-xs text-muted-foreground ml-2">{c.metric}</span>
 </div>
 {statusBadge(status)}
 </div>
 <div className="flex items-center gap-3 mt-2">
 <div className="flex-1 bg-muted/40 rounded-full h-2 overflow-hidden">
 <div
 className="h-2 rounded-full transition-colors"
 style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }}
 />
 </div>
 <div className="text-xs text-muted-foreground w-32 text-right">
 <span className={isBreached ? "text-red-400 font-medium" : isTight ? "text-yellow-400 font-medium" : "text-emerald-400"}>
 {c.current}{c.unit}
 </span>
 <span className="text-muted-foreground mx-1">/</span>
 <span className="text-muted-foreground">
 {c.direction === "below" ? "max " : "min "}
 {c.limit}{c.unit}
 </span>
 </div>
 </div>
 </div>
 );
 })}

 <div className="bg-muted/30 rounded p-3 text-xs text-muted-foreground leading-relaxed mt-2">
 <span className="text-foreground font-medium">Covenant headroom</span> — the buffer between
 current metrics and covenant limits. Tight headroom often precedes distressed exchanges or
 waivers. Maintenance covenants are tested quarterly; incurrence covenants only upon taking
 an action (e.g., additional debt issuance).
 </div>
 </div>
 );
}

// ── Distressed Screener ────────────────────────────────────────────────────────
const BADGE_META: Record<string, { label: string; color: string }> = {
 covenant: { label: "Covenant Stress", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
 maturity: { label: "Near Maturity", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
 liquidity: { label: "Liquidity Squeeze", color: "bg-red-500/20 text-red-400 border-red-500/30" },
 restructuring: { label: "Restructuring", color: "bg-muted/10 text-primary border-border" },
};

function DistressedScreener() {
 const [selected, setSelected] = useState<number | null>(null);

 return (
 <div className="space-y-3">
 {DISTRESSED_COMPANIES.map((co, i) => {
 const isSelected = selected === i;
 const meta = BADGE_META[co.badge];
 const priceColor = co.price < 50 ? "text-red-400" : co.price < 65 ? "text-yellow-400" : "text-orange-400";

 return (
 <div
 key={i}
 className={`rounded-lg border cursor-pointer transition-colors ${
 isSelected
 ? "bg-muted/40 border-muted-foreground/50"
 : "bg-muted/40 border-border hover:border-border"
 }`}
 onClick={() => setSelected(isSelected ? null : i)}
 >
 <div className="p-3">
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-2">
 <div>
 <span className="text-sm font-medium text-foreground">{co.name}</span>
 <span className="text-xs text-muted-foreground ml-2 font-mono">{co.ticker}</span>
 </div>
 <Badge className={`text-xs text-muted-foreground px-1.5 ${meta.color}`}>{meta.label}</Badge>
 </div>
 <ChevronRight
 className={`w-4 h-4 text-muted-foreground transition-transform ${isSelected ? "rotate-90" : ""}`}
 />
 </div>
 <div className="flex items-center gap-4 mt-2 flex-wrap">
 <div className="text-xs text-muted-foreground">
 <span className="text-muted-foreground">Price </span>
 <span className={`font-medium ${priceColor}`}>{co.price.toFixed(1)}¢</span>
 </div>
 <div className="text-xs text-muted-foreground">
 <span className="text-muted-foreground">YTM </span>
 <span className="text-red-400 font-medium">{co.ytm.toFixed(1)}%</span>
 </div>
 <div className="text-xs text-muted-foreground">
 <span className="text-muted-foreground">Duration </span>
 <span className="text-muted-foreground">{co.duration.toFixed(1)}yr</span>
 </div>
 <div className="text-xs text-muted-foreground">
 <span className="text-muted-foreground">Lev </span>
 <span className="text-muted-foreground">{co.leverage.toFixed(1)}x</span>
 </div>
 <div className="text-xs text-muted-foreground">
 <span className="text-muted-foreground">EBITDA </span>
 <span className="text-muted-foreground">${co.ebitda.toFixed(0)}M</span>
 </div>
 <Badge className="text-xs bg-muted/50 text-muted-foreground border-border">{co.industry}</Badge>
 </div>
 </div>
 {isSelected && (
 <div className="border-t border-border px-3 py-2 space-y-2">
 <p className="text-xs text-muted-foreground leading-relaxed">{co.situation}</p>
 <div className="flex gap-2 flex-wrap">
 <div className="bg-muted/60 rounded p-2 text-xs text-muted-foreground flex-1 min-w-24">
 <p className="text-muted-foreground mb-0.5">Implied Recovery</p>
 <p className={`font-medium ${priceColor}`}>{co.price.toFixed(1)}¢ on $</p>
 </div>
 <div className="bg-muted/60 rounded p-2 text-xs text-muted-foreground flex-1 min-w-24">
 <p className="text-muted-foreground mb-0.5">Distress Ratio</p>
 <p className="text-red-400 font-medium">{(co.ytm - 10).toFixed(0)} bps over HY</p>
 </div>
 <div className="bg-muted/60 rounded p-2 text-xs text-muted-foreground flex-1 min-w-24">
 <p className="text-muted-foreground mb-0.5">Coverage at EV</p>
 <p className="text-muted-foreground font-medium">{((co.ebitda * 6) / (co.leverage * co.ebitda) * 100).toFixed(0)}%</p>
 </div>
 </div>
 </div>
 )}
 </div>
 );
 })}
 </div>
 );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function CapitalStructurePage() {
 const [ev, setEv] = useState(650);
 const [activeTab, setActiveTab] = useState("waterfall");

 // Compute fulcrum security
 const fulcrumInfo = useMemo(() => {
 let remaining = ev;
 let fulcrumName = "None (Equity)";
 for (const t of TRANCHES) {
 if (remaining <= 0) {
 fulcrumName = `${t.name} — 0¢ recovery`;
 break;
 }
 if (remaining < t.amount) {
 const cents = (remaining / t.amount) * 100;
 fulcrumName = `${t.name} — ${cents.toFixed(1)}¢ on $`;
 break;
 }
 remaining -= t.amount;
 }
 return fulcrumName;
 }, [ev]);

 // Summary stats
 const debtCapital = TRANCHES.filter((t) => t.priority < 5).reduce((a, t) => a + t.amount, 0);
 const equityCapital = TRANCHES.find((t) => t.priority === 5)?.amount ?? 0;
 const leverage = (debtCapital / (ev * 0.12)).toFixed(1); // simplified EBITDA est
 const ltv = ((debtCapital / ev) * 100).toFixed(0);

 return (
 <div
 className="p-4 sm:p-4 space-y-5 max-w-5xl mx-auto"
 >
 {/* HERO Header */}
 <div className="flex items-start justify-between gap-4 flex-wrap border-l-4 border-l-primary rounded-md bg-card p-6">
 <div>
 <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
 <Layers className="w-6 h-6 text-primary" />
 Capital Structure &amp; Distressed Investing
 </h1>
 <p className="text-muted-foreground text-sm mt-1">
 Waterfall analysis, Merton credit model, covenant tracking, and distressed debt screening
 </p>
 </div>
 <div className="flex gap-2 flex-wrap">
 <Badge className="bg-muted/10 text-primary border-border text-xs">
 <BarChart2 className="w-3 h-3 mr-1" /> EV ${ev}M
 </Badge>
 <Badge className="bg-muted/60 text-muted-foreground border-border text-xs">
 <ShieldCheck className="w-3 h-3 mr-1" /> LTV {ltv}%
 </Badge>
 </div>
 </div>

 {/* KPI strip */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 {[
 { label: "Total Debt", value: `$${debtCapital}M`, icon: DollarSign, color: "text-yellow-400" },
 { label: "Equity", value: `$${equityCapital}M`, icon: TrendingDown, color: "text-rose-400" },
 { label: "Est. Leverage", value: `${leverage}x`, icon: Activity, color: "text-orange-400" },
 { label: "Fulcrum Security", value: fulcrumInfo.split("—")[0].trim(), icon: Target, color: "text-primary" },
 ].map((k) => (
 <Card key={k.label} className="bg-muted/60 border-border">
 <CardContent className="p-3 flex items-center gap-2">
 <k.icon className={`w-4 h-4 ${k.color} shrink-0`} />
 <div>
 <p className="text-xs text-muted-foreground">{k.label}</p>
 <p className="text-sm font-medium text-foreground leading-tight">{k.value}</p>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>

 {/* Fulcrum callout */}
 <div className="flex items-center gap-3 bg-muted/40 border border-border rounded-lg px-4 py-2.5">
 <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
 <div className="text-xs text-muted-foreground">
 <span className="text-muted-foreground">Fulcrum Security at EV ${ev}M: </span>
 <span className="text-primary font-medium">{fulcrumInfo}</span>
 </div>
 </div>

 {/* EV Slider */}
 <Card className="bg-muted/60 border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm flex items-center gap-2 text-foreground">
 <DollarSign className="w-4 h-4 text-emerald-400" />
 Enterprise Value Scenario
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4 space-y-3">
 <div className="flex items-center gap-4">
 <span className="text-xs text-muted-foreground w-16">$100M</span>
 <Slider
 value={[ev]}
 min={100}
 max={1100}
 step={10}
 onValueChange={(v) => setEv(v[0])}
 className="flex-1"
 />
 <span className="text-xs text-muted-foreground w-16 text-right">$1,100M</span>
 </div>
 <div className="flex justify-between text-[11px] text-muted-foreground px-1">
 {[200, 400, 600, 800, 1000].map((v) => (
 <button
 key={v}
 onClick={() => setEv(v)}
 className={`px-2 py-0.5 rounded transition-colors ${
 Math.abs(ev - v) < 50 ? "bg-muted text-foreground" : "hover:text-foreground"
 }`}
 >
 ${v}M
 </button>
 ))}
 </div>
 {/* Capital stack legend */}
 <div className="flex flex-wrap gap-2 pt-1">
 {TRANCHES.map((t) => (
 <div key={t.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
 <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: t.color }} />
 <span>{t.name.split(" ").slice(0, 2).join(" ")}</span>
 <span className="text-muted-foreground">${t.amount}M</span>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* Tabs */}
 <Tabs value={activeTab} onValueChange={setActiveTab}>
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
 <TabsTrigger value="waterfall" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Waterfall
 </TabsTrigger>
 <TabsTrigger value="merton" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Merton Model
 </TabsTrigger>
 <TabsTrigger value="covenants" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Covenants
 </TabsTrigger>
 <TabsTrigger value="screener" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Distressed Screener
 </TabsTrigger>
 </TabsList>

 {/* Waterfall Tab */}
 <TabsContent value="waterfall" className="data-[state=inactive]:hidden mt-4">
 <Card className="bg-muted/60 border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm text-foreground flex items-center gap-2">
 <Layers className="w-4 h-4 text-emerald-400" />
 Recovery Waterfall at EV ${ev}M
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4 space-y-4">
 <WaterfallChart ev={ev} />

 {/* Tranche table */}
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left py-1.5 text-muted-foreground font-medium">Tranche</th>
 <th className="text-right py-1.5 text-muted-foreground font-medium">Face ($M)</th>
 <th className="text-right py-1.5 text-muted-foreground font-medium">Coupon</th>
 <th className="text-right py-1.5 text-muted-foreground font-medium">Rating</th>
 <th className="text-right py-1.5 text-muted-foreground font-medium">Recovery</th>
 <th className="text-right py-1.5 text-muted-foreground font-medium">¢ on $</th>
 </tr>
 </thead>
 <tbody>
 {(() => {
 let rem = ev;
 return TRANCHES.map((t) => {
 const rec = Math.min(t.amount, Math.max(0, rem));
 rem -= rec;
 const cents = t.amount > 0 ? (rec / t.amount) * 100 : 0;
 const isFulcrum = rec > 0 && rec < t.amount;
 return (
 <tr key={t.name} className={`border-b border-border ${isFulcrum ? "bg-muted/30" : ""}`}>
 <td className="py-1.5 flex items-center gap-1.5">
 <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: t.color }} />
 <span className={isFulcrum ? "text-primary font-medium" : "text-muted-foreground"}>{t.name}</span>
 {isFulcrum && (
 <Badge className="text-[11px] bg-muted/10 text-primary border-border px-1 py-0">
 FULCRUM
 </Badge>
 )}
 </td>
 <td className="py-1.5 text-right text-muted-foreground">${t.amount}</td>
 <td className="py-1.5 text-right text-muted-foreground">
 {t.coupon > 0 ? t.coupon.toFixed(1) + "%" : "—"}
 </td>
 <td className="py-1.5 text-right text-muted-foreground">{t.rating}</td>
 <td className="py-1.5 text-right text-muted-foreground">${rec.toFixed(0)}</td>
 <td className={`py-1.5 text-right font-medium ${cents >= 100 ? "text-emerald-400" : cents > 0 ? "text-yellow-400" : "text-red-400"}`}>
 {cents >= 100 ? "100¢" : cents > 0 ? cents.toFixed(1) + "¢" : "0¢"}
 </td>
 </tr>
 );
 });
 })()}
 </tbody>
 </table>
 </div>

 <div className="bg-muted/30 rounded p-3 text-xs text-muted-foreground leading-relaxed">
 <span className="text-foreground font-medium">Absolute Priority Rule (APR): </span>
 In bankruptcy, each class must be paid in full before junior creditors receive
 anything. The &quot;fulcrum security&quot; (highlighted in blue) is the pivotal tranche
 that receives partial recovery — it drives reorganization negotiations and often
 converts to equity in a restructuring.
 </div>
 </CardContent>
 </Card>
 </TabsContent>

 {/* Merton Model Tab */}
 <TabsContent value="merton" className="data-[state=inactive]:hidden mt-4">
 <Card className="bg-muted/60 border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm text-foreground flex items-center gap-2">
 <Activity className="w-3.5 h-3.5 text-muted-foreground/50" />
 Merton Structural Credit Model
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <MertonPanel />
 </CardContent>
 </Card>
 </TabsContent>

 {/* Covenants Tab */}
 <TabsContent value="covenants" className="data-[state=inactive]:hidden mt-4">
 <Card className="bg-muted/60 border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm text-foreground flex items-center gap-2">
 <ShieldCheck className="w-4 h-4 text-yellow-400" />
 Debt Covenants Dashboard
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <CovenantTracker />
 </CardContent>
 </Card>
 </TabsContent>

 {/* Distressed Screener Tab */}
 <TabsContent value="screener" className="data-[state=inactive]:hidden mt-4">
 <Card className="bg-muted/60 border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm text-foreground flex items-center gap-2">
 <TrendingDown className="w-4 h-4 text-red-400" />
 Distressed Debt Screener
 <Badge className="ml-auto text-xs bg-red-500/15 text-red-400 border-red-500/25">
 Price &lt;70¢
 </Badge>
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <DistressedScreener />
 </CardContent>
 </Card>
 </TabsContent>
 </Tabs>

 {/* Footer education strip */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 {[
 {
 icon: Layers,
 color: "text-emerald-400",
 title: "Seniority & Priority",
 body: "Senior secured lenders have first claim on specific collateral. Unsecured creditors share remaining assets. Equity absorbs losses last.",
 },
 {
 icon: Target,
 color: "text-primary",
 title: "Fulcrum Security",
 body: "The tranche that transitions from full to zero recovery as enterprise value changes. These holders control restructuring outcomes.",
 },
 {
 icon: Activity,
 color: "text-primary",
 title: "Distressed Returns",
 body: "Distressed debt can yield 20–40%+ if the investor correctly assesses recovery value — a blend of credit analysis and legal expertise.",
 },
 ].map((tip) => (
 <div key={tip.title} className="bg-muted/40 border border-border rounded-lg p-3">
 <div className="flex items-center gap-2 mb-1.5">
 <tip.icon className={`w-4 h-4 ${tip.color} shrink-0`} />
 <span className="text-xs font-medium text-foreground">{tip.title}</span>
 </div>
 <p className="text-[11px] text-muted-foreground leading-relaxed">{tip.body}</p>
 </div>
 ))}
 </div>

 {/* Quick action buttons */}
 <div className="flex gap-2 flex-wrap">
 <Button
 size="sm"
 variant="outline"
 className="text-xs border-border text-muted-foreground hover:text-foreground"
 onClick={() => setEv(TOTAL_CAPITAL)}
 >
 Full Recovery EV
 </Button>
 <Button
 size="sm"
 variant="outline"
 className="text-xs border-border text-muted-foreground hover:text-foreground"
 onClick={() => setEv(450)}
 >
 Stress Case EV
 </Button>
 <Button
 size="sm"
 variant="outline"
 className="text-xs border-border text-muted-foreground hover:text-foreground"
 onClick={() => setEv(250)}
 >
 Liquidation EV
 </Button>
 </div>
 </div>
 );
}
