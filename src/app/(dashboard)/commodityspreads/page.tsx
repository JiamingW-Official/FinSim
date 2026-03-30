"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
 Flame,
 Zap,
 Wheat,
 Calendar,
 CloudRain,
 TrendingUp,
 TrendingDown,
 BarChart2,
 ArrowUpDown,
 Activity,
 DollarSign,
 AlertTriangle,
 CheckCircle,
 Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 974;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};

// Pre-generate stable values
const _vals = Array.from({ length: 4000 }, () => rand());
let _vi = 0;
const sv = () => _vals[_vi++ % _vals.length];

// ── Format helpers ─────────────────────────────────────────────────────────────
function fmtDollar(n: number, decimals = 2): string {
 return `$${n.toFixed(decimals)}`;
}
function fmtChg(n: number): string {
 return (n >= 0 ? "+" : "") + n.toFixed(2);
}
const posColor = (v: number) => (v >= 0 ? "text-emerald-400" : "text-red-400");
const posBg = (v: number) => (v >= 0 ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" : "bg-red-400/10 text-red-400 border-red-400/20");

// ── Data generation ────────────────────────────────────────────────────────────

// Crack Spread data
interface SpreadBar {
 label: string;
 value: number;
 chg: number;
}

function genBars(base: number, count: number, labels: string[]): SpreadBar[] {
 return labels.map((label) => {
 const value = base + (sv() - 0.5) * base * 0.4;
 const chg = (sv() - 0.5) * 4;
 return { label, value, chg };
 });
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const CRACK_321_BARS = genBars(22, 12, MONTH_LABELS);
const CRACK_532_BARS = genBars(18, 12, MONTH_LABELS);
const SPARK_NG_BARS = genBars(14, 12, MONTH_LABELS);
const DARK_SPREAD_BARS = genBars(8, 12, MONTH_LABELS);
const CLEAN_DARK_BARS = genBars(5, 12, MONTH_LABELS);
const CRUSH_BARS = genBars(55, 12, MONTH_LABELS);

// Calendar spread data
interface CalendarSpread {
 commodity: string;
 frontMonth: string;
 backMonth: string;
 frontPrice: number;
 backPrice: number;
 spread: number;
 structure: "contango" | "backwardation";
 icon: string;
}

const CALENDAR_SPREADS: CalendarSpread[] = [
 {
 commodity: "WTI Crude Oil",
 frontMonth: "Apr 2026",
 backMonth: "Oct 2026",
 frontPrice: 72.4 + (sv() - 0.5) * 4,
 backPrice: 74.8 + (sv() - 0.5) * 4,
 spread: 0,
 structure: "contango",
 icon: "️",
 },
 {
 commodity: "Natural Gas",
 frontMonth: "Apr 2026",
 backMonth: "Oct 2026",
 frontPrice: 3.2 + (sv() - 0.5) * 0.4,
 backPrice: 2.8 + (sv() - 0.5) * 0.4,
 spread: 0,
 structure: "backwardation",
 icon: "",
 },
 {
 commodity: "Gasoline RBOB",
 frontMonth: "Apr 2026",
 backMonth: "Oct 2026",
 frontPrice: 2.48 + (sv() - 0.5) * 0.2,
 backPrice: 2.38 + (sv() - 0.5) * 0.2,
 spread: 0,
 structure: "backwardation",
 icon: "",
 },
 {
 commodity: "Heating Oil",
 frontMonth: "Apr 2026",
 backMonth: "Oct 2026",
 frontPrice: 2.62 + (sv() - 0.5) * 0.2,
 backPrice: 2.74 + (sv() - 0.5) * 0.2,
 spread: 0,
 structure: "contango",
 icon: "️",
 },
 {
 commodity: "Corn",
 frontMonth: "May 2026",
 backMonth: "Dec 2026",
 frontPrice: 448 + (sv() - 0.5) * 20,
 backPrice: 462 + (sv() - 0.5) * 20,
 spread: 0,
 structure: "contango",
 icon: "",
 },
].map((c) => ({
 ...c,
 spread: parseFloat((c.backPrice - c.frontPrice).toFixed(2)),
 structure: c.backPrice > c.frontPrice ? "contango" : "backwardation",
}));

// Weather impact data
interface WeatherImpact {
 event: string;
 spread: string;
 direction: "bullish" | "bearish" | "mixed";
 magnitude: string;
 reason: string;
 season: string;
}

const WEATHER_IMPACTS: WeatherImpact[] = [
 {
 event: "Arctic Blast / Polar Vortex",
 spread: "Natural Gas Spark Spread",
 direction: "bullish",
 magnitude: "High (+$8–12/MWh)",
 reason: "Surge in heating demand spikes nat gas prices faster than power prices adjusts",
 season: "Dec–Feb",
 },
 {
 event: "Hurricane (Gulf Coast)",
 spread: "3-2-1 Crack Spread",
 direction: "mixed",
 magnitude: "Med (+$5–8)",
 reason: "Refinery shutdowns reduce product supply; crude may fall or rise depending on path",
 season: "Jun–Nov",
 },
 {
 event: "Summer Heat Wave",
 spread: "Spark Spread (Gas→Power)",
 direction: "bullish",
 magnitude: "High (+$6–10/MWh)",
 reason: "Peak cooling demand drives electricity spot prices above natural gas input cost",
 season: "Jun–Aug",
 },
 {
 event: "La Niña Drought",
 spread: "Soybean Crush Spread",
 direction: "bullish",
 magnitude: "High (+$10–20/bu)",
 reason: "South American crop failure tightens soybean supply, widening processing margins",
 season: "Nov–Feb",
 },
 {
 event: "El Niño Rainfall",
 spread: "Dark Spread (Coal→Power)",
 direction: "bearish",
 magnitude: "Med (–$3–6/MWh)",
 reason: "Increased hydro generation reduces thermal coal demand for power generation",
 season: "Sep–Mar",
 },
 {
 event: "Mild Winter",
 spread: "Cal Spread (NG front/back)",
 direction: "bearish",
 magnitude: "Med (–$0.20–0.40)",
 reason: "Low heating demand leaves storage full; front month weakens vs deferred contracts",
 season: "Dec–Feb",
 },
 {
 event: "Spring Flooding",
 spread: "Corn Calendar Spread",
 direction: "bullish",
 magnitude: "Low (+$8–15/bu)",
 reason: "Planting delays reduce expected harvest; front-month basis strengthens",
 season: "Mar–May",
 },
 {
 event: "Refinery Maintenance Season",
 spread: "5-3-2 Crack Spread",
 direction: "bearish",
 magnitude: "Low (–$3–6)",
 reason: "Scheduled turnarounds reduce crude throughput; crude accumulates, cracks narrow",
 season: "Sep–Oct",
 },
];

// Strategy data
interface SpreadStrategy {
 name: string;
 type: string;
 description: string;
 entry: string;
 exit: string;
 risk: string;
 reward: string;
 rrRatio: string;
 edge: string;
 color: string;
}

const SPREAD_STRATEGIES: SpreadStrategy[] = [
 {
 name: "Intermarket Energy Spread",
 type: "Intermarket",
 description:
 "Long WTI Crude / Short Brent Crude (or vice versa). Exploits temporary dislocations in the WTI–Brent differential driven by pipeline bottlenecks, storage levels, or geopolitical risk premiums.",
 entry: "Enter when WTI-Brent spread deviates >$3 from 90-day average; direction based on fundamental driver",
 exit: "Exit when spread reverts to 90-day mean or at +/–$2 profit target / –$1.50 stop-loss",
 risk: "Moderate — correlated assets limit catastrophic loss; residual risk from basis shocks",
 reward: "Steady mean-reversion income; typical trade duration 5–15 days",
 rrRatio: "1.5 : 1",
 edge: "Statistical mean-reversion in structurally linked markets",
 color: "#6366f1",
 },
 {
 name: "Calendar Bull Spread (Backwardation Play)",
 type: "Intramarket Calendar",
 description:
 "Buy front-month natural gas futures, sell deferred (6-month) contract. Profits when supply tightens and the curve shifts into backwardation or steepens existing backwardation.",
 entry: "Enter when storage is below 5-year average AND winter forecast is above-normal demand",
 exit: "Unwind 2 weeks before front-month expiry; target +$0.30/MMBtu profit; stop at –$0.18",
 risk: "Low–Moderate — maximum loss limited to spread width; no outright price exposure",
 reward: "High in backwardation regimes; front month premium can expand $0.50–$1.50 rapidly",
 rrRatio: "2.0 : 1",
 edge: "Storage deficit + weather catalyst creates convex payoff in tight supply environments",
 color: "#f59e0b",
 },
 {
 name: "Soybean Crush Margin Trade",
 type: "Processing Margin",
 description:
 "Buy soybean futures, sell soybean oil and soybean meal futures in 1:0.11:0.022 ratio. Represents the gross processing margin of a crush facility; profitable when crush exceeds breakeven cost.",
 entry: "Enter long crush when board crush falls below $40/bushel (below estimated processing cost of ~$45)",
 exit: "Exit when crush recovers to $60+ or fundamental disruption resolves; stop –$8/bushel",
 risk: "Low — spread position; basis risk between physical and futures; correlation breakdown risk",
 reward: "Seasonal crush cycles offer 3–5 opportunities per year; avg trade = +$15–25/bushel",
 rrRatio: "2.5 : 1",
 edge: "Periodic dislocation between raw input and processed outputs creates exploitable inefficiency",
 color: "#22c55e",
 },
];

// ── SVG Bar Chart ──────────────────────────────────────────────────────────────
interface BarChartProps {
 bars: SpreadBar[];
 color: string;
 unit: string;
 gradId: string;
 yMax?: number;
}

function SpreadBarChart({ bars, color, unit, gradId, yMax }: BarChartProps) {
 const W = 500;
 const H = 160;
 const PAD = { l: 44, r: 12, t: 16, b: 32 };
 const chartW = W - PAD.l - PAD.r;
 const chartH = H - PAD.t - PAD.b;
 const maxVal = yMax ?? Math.max(...bars.map((b) => b.value)) * 1.15;
 const barW = (chartW / bars.length) * 0.65;
 const barGap = chartW / bars.length;
 const toY = (v: number) => PAD.t + chartH - (v / maxVal) * chartH;
 const yTicks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
 <defs>
 <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor={color} stopOpacity="0.85" />
 <stop offset="100%" stopColor={color} stopOpacity="0.3" />
 </linearGradient>
 </defs>
 {yTicks.map((v, i) => (
 <g key={`yt-${i}`}>
 <line x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke="#27272a" strokeWidth="1" />
 <text x={PAD.l - 4} y={toY(v) + 4} fill="#71717a" fontSize="9" textAnchor="end">
 {v < 1 ? v.toFixed(1) : Math.round(v)}
 </text>
 </g>
 ))}
 {bars.map((b, i) => {
 const cx = PAD.l + i * barGap + barGap / 2;
 const bH = Math.max(2, (b.value / maxVal) * chartH);
 return (
 <g key={`br-${i}`}>
 <rect
 x={cx - barW / 2}
 y={toY(b.value)}
 width={barW}
 height={bH}
 rx="2"
 fill={`url(#${gradId})`}
 stroke={color}
 strokeWidth="0.5"
 strokeOpacity="0.6"
 />
 <text x={cx} y={H - 4} fill="#71717a" fontSize="8" textAnchor="middle">
 {b.label}
 </text>
 </g>
 );
 })}
 <text x={W - PAD.r} y={PAD.t - 4} fill="#71717a" fontSize="8" textAnchor="end">
 {unit}
 </text>
 </svg>
 );
}

// ── Spark Line Chart ───────────────────────────────────────────────────────────
interface LineChartProps {
 bars: SpreadBar[];
 color: string;
 unit: string;
 gradId: string;
}

function SpreadLineChart({ bars, color, unit, gradId }: LineChartProps) {
 const W = 500;
 const H = 160;
 const PAD = { l: 44, r: 12, t: 16, b: 32 };
 const chartW = W - PAD.l - PAD.r;
 const chartH = H - PAD.t - PAD.b;
 const minVal = Math.min(...bars.map((b) => b.value)) * 0.85;
 const maxVal = Math.max(...bars.map((b) => b.value)) * 1.1;
 const range = maxVal - minVal;
 const toX = (i: number) => PAD.l + (i / (bars.length - 1)) * chartW;
 const toY = (v: number) => PAD.t + chartH - ((v - minVal) / range) * chartH;
 const pts = bars.map((b, i) => `${toX(i)},${toY(b.value)}`).join(" ");
 const area = [
 `${toX(0)},${PAD.t + chartH}`,
 ...bars.map((b, i) => `${toX(i)},${toY(b.value)}`),
 `${toX(bars.length - 1)},${PAD.t + chartH}`,
 ].join(" ");
 const yTicks = [minVal, minVal + range * 0.25, minVal + range * 0.5, minVal + range * 0.75, maxVal];

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
 <defs>
 <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor={color} stopOpacity="0.25" />
 <stop offset="100%" stopColor={color} stopOpacity="0.02" />
 </linearGradient>
 </defs>
 {yTicks.map((v, i) => (
 <g key={`yt-${i}`}>
 <line x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke="#27272a" strokeWidth="1" />
 <text x={PAD.l - 4} y={toY(v) + 4} fill="#71717a" fontSize="9" textAnchor="end">
 {v < 5 ? v.toFixed(1) : Math.round(v)}
 </text>
 </g>
 ))}
 {bars.map((b, i) => (
 <text key={`xl-${i}`} x={toX(i)} y={H - 4} fill="#71717a" fontSize="8" textAnchor="middle">
 {b.label}
 </text>
 ))}
 <polygon points={area} fill={`url(#${gradId})`} />
 <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
 {bars.map((b, i) => (
 <circle key={`dot-${i}`} cx={toX(i)} cy={toY(b.value)} r="3" fill={color} />
 ))}
 <text x={W - PAD.r} y={PAD.t - 4} fill="#71717a" fontSize="8" textAnchor="end">
 {unit}
 </text>
 </svg>
 );
}

// ── Crack Spread Formula SVG ────────────────────────────────────────────────────
function CrackFormulaSVG({ type }: { type: "321" | "532" }) {
 const is321 = type === "321";
 const ratio = is321 ? "3-2-1" : "5-3-2";
 const color1 = "#f59e0b";
 const color2 = "#6366f1";
 const color3 = "#34d399";
 const steps = is321
 ? [
 { label: "3 Crude\n(WTI/Brent)", color: color1 },
 { label: "2 Gasoline\n(RBOB)", color: color2 },
 { label: "1 Heating\nOil/Diesel", color: color3 },
 ]
 : [
 { label: "5 Crude\n(WTI)", color: color1 },
 { label: "3 Gasoline\n(RBOB)", color: color2 },
 { label: "2 Heating\nOil", color: color3 },
 ];

 return (
 <svg viewBox="0 0 480 100" className="w-full h-24">
 <rect x="10" y="20" width="90" height="60" rx="6" fill="#18181b" stroke={color1} strokeWidth="1.5" />
 {steps[0].label.split("\n").map((line, j) => (
 <text key={`s0-${j}`} x="55" y={42 + j * 14} fill={color1} fontSize="9" textAnchor="middle" fontWeight="bold">
 {line}
 </text>
 ))}
 <text x="125" y="54" fill="#71717a" fontSize="18" textAnchor="middle">
 →
 </text>
 <rect x="150" y="20" width="90" height="60" rx="6" fill="#18181b" stroke={color2} strokeWidth="1.5" />
 {steps[1].label.split("\n").map((line, j) => (
 <text key={`s1-${j}`} x="195" y={42 + j * 14} fill={color2} fontSize="9" textAnchor="middle" fontWeight="bold">
 {line}
 </text>
 ))}
 <text x="260" y="54" fill="#71717a" fontSize="16" textAnchor="middle">
 +
 </text>
 <rect x="280" y="20" width="90" height="60" rx="6" fill="#18181b" stroke={color3} strokeWidth="1.5" />
 {steps[2].label.split("\n").map((line, j) => (
 <text key={`s2-${j}`} x="325" y={42 + j * 14} fill={color3} fontSize="9" textAnchor="middle" fontWeight="bold">
 {line}
 </text>
 ))}
 <text x="390" y="54" fill="#71717a" fontSize="14" textAnchor="middle">
 =
 </text>
 <rect x="405" y="20" width="70" height="60" rx="6" fill="#18181b" stroke="#f87171" strokeWidth="1.5" />
 <text x="440" y="45" fill="#f87171" fontSize="9" textAnchor="middle" fontWeight="bold">
 {ratio}
 </text>
 <text x="440" y="59" fill="#f87171" fontSize="8" textAnchor="middle">
 Crack $
 </text>
 </svg>
 );
}

// ── Calendar Spread Curve SVG ──────────────────────────────────────────────────
function CalendarCurveSVG({
 isContango,
 commodity,
}: {
 isContango: boolean;
 commodity: string;
}) {
 const W = 320;
 const H = 100;
 const PAD = { l: 40, r: 16, t: 16, b: 28 };
 const chartW = W - PAD.l - PAD.r;
 const chartH = H - PAD.t - PAD.b;
 const months = 6;
 const basePrice = 70;
 const slope = isContango ? 1 : -1;
 const pts = Array.from({ length: months }, (_, i) => {
 const x = PAD.l + (i / (months - 1)) * chartW;
 const y = PAD.t + chartH / 2 - slope * (i / (months - 1)) * (chartH * 0.35);
 return `${x},${y}`;
 }).join(" ");
 const color = isContango ? "#6366f1" : "#f59e0b";
 const label = isContango ? "Contango" : "Backwardation";
 const yPrices = Array.from(
 { length: months },
 (_, i) => basePrice + slope * i * 2
 );

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-24">
 <defs>
 <linearGradient id={`curve-${commodity.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor={color} stopOpacity="0.2" />
 <stop offset="100%" stopColor={color} stopOpacity="0" />
 </linearGradient>
 </defs>
 {[0, 1, 2, 3, 4, 5].map((i) => (
 <text
 key={`mo-${i}`}
 x={PAD.l + (i / 5) * chartW}
 y={H - 4}
 fill="#71717a"
 fontSize="8"
 textAnchor="middle"
 >
 M{i + 1}
 </text>
 ))}
 <polygon
 points={`${PAD.l},${PAD.t + chartH} ${pts} ${PAD.l + chartW},${PAD.t + chartH}`}
 fill={`url(#curve-${commodity.replace(/\s/g, "")})`}
 />
 <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
 {yPrices.map((p, i) => (
 <circle
 key={`cp-${i}`}
 cx={PAD.l + (i / (months - 1)) * chartW}
 cy={PAD.t + chartH / 2 - slope * (i / (months - 1)) * (chartH * 0.35)}
 r="3"
 fill={color}
 />
 ))}
 <rect x={PAD.l + chartW - 70} y={PAD.t} width={66} height={18} rx="3" fill="#18181b" stroke={color} strokeWidth="1" />
 <text x={PAD.l + chartW - 37} y={PAD.t + 12} fill={color} fontSize="8" textAnchor="middle" fontWeight="bold">
 {label}
 </text>
 </svg>
 );
}

// ── Crush Margin Flow SVG ──────────────────────────────────────────────────────
function CrushFlowSVG() {
 return (
 <svg viewBox="0 0 480 110" className="w-full h-28">
 <defs>
 <marker id="crushArrow" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
 <path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" />
 </marker>
 <marker id="crushArrow2" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
 <path d="M0,0 L6,3 L0,6 Z" fill="#22c55e" />
 </marker>
 <marker id="crushArrow3" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
 <path d="M0,0 L6,3 L0,6 Z" fill="#06b6d4" />
 </marker>
 </defs>
 {/* Soybeans */}
 <rect x="10" y="35" width="90" height="40" rx="6" fill="#18181b" stroke="#f59e0b" strokeWidth="1.5" />
 <text x="55" y="52" fill="#fcd34d" fontSize="9" textAnchor="middle" fontWeight="bold">SOYBEANS</text>
 <text x="55" y="66" fill="#fcd34d" fontSize="8" textAnchor="middle">Input Cost</text>
 {/* Arrow to Processor */}
 <line x1="100" y1="55" x2="140" y2="55" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#crushArrow)" />
 {/* Processor */}
 <rect x="140" y="25" width="90" height="60" rx="6" fill="#18181b" stroke="#71717a" strokeWidth="1.5" />
 <text x="185" y="47" fill="#a1a1aa" fontSize="9" textAnchor="middle" fontWeight="bold">CRUSH</text>
 <text x="185" y="61" fill="#a1a1aa" fontSize="8" textAnchor="middle">PROCESSOR</text>
 <text x="185" y="74" fill="#a1a1aa" fontSize="7" textAnchor="middle">(ADM, Bunge)</text>
 {/* Output arrows */}
 <line x1="230" y1="42" x2="280" y2="28" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#crushArrow2)" />
 <line x1="230" y1="68" x2="280" y2="82" stroke="#06b6d4" strokeWidth="1.5" markerEnd="url(#crushArrow3)" />
 {/* Soybean Meal */}
 <rect x="280" y="10" width="95" height="38" rx="6" fill="#18181b" stroke="#22c55e" strokeWidth="1.5" />
 <text x="327" y="26" fill="#6ee7b7" fontSize="9" textAnchor="middle" fontWeight="bold">SOY MEAL</text>
 <text x="327" y="38" fill="#6ee7b7" fontSize="8" textAnchor="middle">~79% of crush</text>
 {/* Soybean Oil */}
 <rect x="280" y="62" width="95" height="38" rx="6" fill="#18181b" stroke="#06b6d4" strokeWidth="1.5" />
 <text x="327" y="78" fill="#67e8f9" fontSize="9" textAnchor="middle" fontWeight="bold">SOY OIL</text>
 <text x="327" y="90" fill="#67e8f9" fontSize="8" textAnchor="middle">~21% of crush</text>
 {/* Margin label */}
 <text x="395" y="55" fill="#f87171" fontSize="8" textAnchor="middle" fontWeight="bold">Crush</text>
 <text x="395" y="67" fill="#f87171" fontSize="8" textAnchor="middle">Margin</text>
 <text x="395" y="78" fill="#f87171" fontSize="7" textAnchor="middle">(Revenue – Cost)</text>
 </svg>
 );
}

// ── Metric chip ────────────────────────────────────────────────────────────────
function MetricChip({
 label,
 value,
 chg,
}: {
 label: string;
 value: string;
 chg: number;
}) {
 return (
 <div className="flex flex-col gap-0.5 bg-card border border-border rounded-lg px-3 py-2 min-w-[100px]">
 <span className="text-xs text-muted-foreground truncate">{label}</span>
 <span className="text-sm font-semibold text-foreground">{value}</span>
 <span className={`text-xs text-muted-foreground font-medium ${posColor(chg)}`}>
 {fmtChg(chg)}
 </span>
 </div>
 );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function CommoditySpreadsPage() {
 const [activeStrategy, setActiveStrategy] = useState<number | null>(null);
 const [calendarView, setCalendarView] = useState<"table" | "chart">("table");

 // Compute current spread values (last bar)
 const crack321Current = CRACK_321_BARS[CRACK_321_BARS.length - 1];
 const crack532Current = CRACK_532_BARS[CRACK_532_BARS.length - 1];
 const sparkCurrent = SPARK_NG_BARS[SPARK_NG_BARS.length - 1];
 const darkCurrent = DARK_SPREAD_BARS[DARK_SPREAD_BARS.length - 1];
 const cleanDarkCurrent = CLEAN_DARK_BARS[CLEAN_DARK_BARS.length - 1];
 const crushCurrent = CRUSH_BARS[CRUSH_BARS.length - 1];

 return (
 <div className="flex h-full flex-col overflow-y-auto">
 <div className="mx-auto w-full max-w-5xl px-6 py-8 flex-1 flex flex-col">
 {/* HERO Header */}
 <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Commodity Spreads</h1>
 <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-6">CRACK · CRUSH · CALENDAR · BASIS</p>

 {/* Live Summary Chips */}
 <div className="flex flex-wrap gap-2">
 <MetricChip label="3-2-1 Crack" value={fmtDollar(crack321Current.value)} chg={crack321Current.chg} />
 <MetricChip label="5-3-2 Crack" value={fmtDollar(crack532Current.value)} chg={crack532Current.chg} />
 <MetricChip label="Spark Spread" value={`${sparkCurrent.value.toFixed(1)}/MWh`} chg={sparkCurrent.chg} />
 <MetricChip label="Dark Spread" value={`${darkCurrent.value.toFixed(1)}/MWh`} chg={darkCurrent.chg} />
 <MetricChip label="Clean Dark" value={`${cleanDarkCurrent.value.toFixed(1)}/MWh`} chg={cleanDarkCurrent.chg} />
 <MetricChip label="Crush Spread" value={`${crushCurrent.value.toFixed(1)}¢/bu`} chg={crushCurrent.chg} />
 </div>

 {/* Main Tabs */}
 <Tabs defaultValue="crack">
 <TabsList className="bg-card border border-border flex-wrap h-auto gap-1 p-1">
 <TabsTrigger value="crack" className="flex items-center gap-1.5 text-xs text-muted-foreground">
 <Flame className="w-3.5 h-3.5" />
 Crack Spreads
 </TabsTrigger>
 <TabsTrigger value="spark" className="flex items-center gap-1.5 text-xs text-muted-foreground">
 <Zap className="w-3.5 h-3.5" />
 Spark Spreads
 </TabsTrigger>
 <TabsTrigger value="crush" className="flex items-center gap-1.5 text-xs text-muted-foreground">
 <Wheat className="w-3.5 h-3.5" />
 Crush Spread
 </TabsTrigger>
 <TabsTrigger value="calendar" className="flex items-center gap-1.5 text-xs text-muted-foreground">
 <Calendar className="w-3.5 h-3.5" />
 Calendar Spreads
 </TabsTrigger>
 <TabsTrigger value="weather" className="flex items-center gap-1.5 text-xs text-muted-foreground">
 <CloudRain className="w-3.5 h-3.5" />
 Weather &amp; Seasonality
 </TabsTrigger>
 <TabsTrigger value="strategies" className="flex items-center gap-1.5 text-xs text-muted-foreground">
 <BarChart2 className="w-3.5 h-3.5" />
 Strategies
 </TabsTrigger>
 </TabsList>

 {/* ── Crack Spreads Tab ─────────────────────────────────────────────── */}
 <TabsContent value="crack" className="data-[state=inactive]:hidden mt-4 space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* 3-2-1 */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-semibold flex items-center gap-2">
 <Flame className="w-4 h-4 text-amber-400" />
 3-2-1 Crack Spread
 <Badge className={`ml-auto text-xs text-muted-foreground ${posBg(crack321Current.chg)}`}>
 {fmtDollar(crack321Current.value)} ({fmtChg(crack321Current.chg)})
 </Badge>
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 <CrackFormulaSVG type="321" />
 <SpreadBarChart
 bars={CRACK_321_BARS}
 color="#f59e0b"
 unit="$/bbl"
 gradId="crack321Grad"
 />
 <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
 <p className="text-muted-foreground font-medium">Formula</p>
 <p>Spread = (2 × Gasoline + 1 × Heating Oil – 3 × Crude) ÷ 3</p>
 <p className="mt-1">
 <span className="text-amber-400">Typical range:</span> $10–35/bbl. Refinery economics improve when spread widens above ~$18.
 </p>
 </div>
 </CardContent>
 </Card>

 {/* 5-3-2 */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-semibold flex items-center gap-2">
 <Flame className="w-4 h-4 text-indigo-400" />
 5-3-2 Crack Spread
 <Badge className={`ml-auto text-xs text-muted-foreground ${posBg(crack532Current.chg)}`}>
 {fmtDollar(crack532Current.value)} ({fmtChg(crack532Current.chg)})
 </Badge>
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 <CrackFormulaSVG type="532" />
 <SpreadBarChart
 bars={CRACK_532_BARS}
 color="#6366f1"
 unit="$/bbl"
 gradId="crack532Grad"
 />
 <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
 <p className="text-muted-foreground font-medium">Formula</p>
 <p>Spread = (3 × Gasoline + 2 × Heating Oil – 5 × Crude) ÷ 5</p>
 <p className="mt-1">
 <span className="text-indigo-400">More balanced:</span> Higher heating oil ratio makes this more sensitive to diesel/distillate demand cycles.
 </p>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Refinery context */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 <Info className="w-4 h-4 text-muted-foreground" />
 Crack Spread Context &amp; Drivers
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 {[
 {
 title: "Seasonal Demand",
 desc: "Driving season (May–Sep) widens gasoline crack. Heating season (Nov–Feb) widens distillate crack.",
 icon: <Activity className="w-4 h-4 text-emerald-400" />,
 color: "text-emerald-400",
 },
 {
 title: "Refinery Outages",
 desc: "Unplanned refinery disruptions reduce product output, widening cracks sharply. Gulf Coast storms are key risk.",
 icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
 color: "text-amber-400",
 },
 {
 title: "Crude Quality",
 desc: "Light sweet crude yields more gasoline per barrel vs heavy sour crude. WTI–Brent differential affects cost basis.",
 icon: <DollarSign className="w-4 h-4 text-indigo-400" />,
 color: "text-indigo-400",
 },
 ].map((item) => (
 <div key={item.title} className="bg-muted/50 rounded-lg p-3 space-y-1">
 <div className="flex items-center gap-1.5">
 {item.icon}
 <span className={`text-xs text-muted-foreground font-medium ${item.color}`}>{item.title}</span>
 </div>
 <p className="text-xs text-muted-foreground">{item.desc}</p>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </TabsContent>

 {/* ── Spark Spreads Tab ─────────────────────────────────────────────── */}
 <TabsContent value="spark" className="data-[state=inactive]:hidden mt-4 space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {[
 {
 label: "Natural Gas Spark Spread",
 subtitle: "Natural Gas → Power",
 bars: SPARK_NG_BARS,
 current: sparkCurrent,
 color: "#f87171",
 gradId: "sparkNGGrad",
 unit: "$/MWh",
 formula: "Spark = Power Price – (Heat Rate × Gas Price)",
 detail: "Typical heat rate 7–8 MMBtu/MWh. Spread > $5/MWh needed for economic dispatch.",
 accentColor: "text-red-400",
 badgeClass: posBg(sparkCurrent.chg),
 },
 {
 label: "Dark Spread",
 subtitle: "Coal → Power",
 bars: DARK_SPREAD_BARS,
 current: darkCurrent,
 color: "#71717a",
 gradId: "darkGrad",
 unit: "$/MWh",
 formula: "Dark = Power Price – (Coal Efficiency × Coal Price)",
 detail: "Coal plant efficiency ~35–40%. Dark spread signals coal plant profitability.",
 accentColor: "text-muted-foreground",
 badgeClass: posBg(darkCurrent.chg),
 },
 {
 label: "Clean Dark Spread",
 subtitle: "Carbon-Adjusted Coal→Power",
 bars: CLEAN_DARK_BARS,
 current: cleanDarkCurrent,
 color: "#22c55e",
 gradId: "cleanDarkGrad",
 unit: "$/MWh",
 formula: "Clean Dark = Dark Spread – (Emission Factor × CO₂ Price)",
 detail: "Accounts for EU ETS/carbon cost. Negative = coal plants uneconomic; accelerates coal retirement.",
 accentColor: "text-emerald-400",
 badgeClass: posBg(cleanDarkCurrent.chg),
 },
 ].map((sp) => (
 <Card key={sp.label} className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium flex flex-col gap-1">
 <div className="flex items-center gap-2">
 <Zap className="w-4 h-4" style={{ color: sp.color }} />
 <span className="truncate">{sp.label}</span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-xs text-muted-foreground font-normal">{sp.subtitle}</span>
 <Badge className={`text-xs text-muted-foreground ${sp.badgeClass}`}>
 {sp.current.value.toFixed(1)} ({fmtChg(sp.current.chg)})
 </Badge>
 </div>
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 <SpreadLineChart bars={sp.bars} color={sp.color} unit={sp.unit} gradId={sp.gradId} />
 <div className="bg-muted/50 rounded-lg p-2.5 space-y-1">
 <p className={`text-xs text-muted-foreground font-medium ${sp.accentColor}`}>Formula</p>
 <p className="text-xs text-muted-foreground">{sp.formula}</p>
 <p className="text-xs text-muted-foreground mt-1">{sp.detail}</p>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>

 {/* Spark spread comparison */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 <BarChart2 className="w-4 h-4 text-muted-foreground" />
 Fuel Switching Dynamics
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-2">
 <p className="text-xs text-muted-foreground font-medium">When Spark Spread Widens vs Dark Spread</p>
 <div className="space-y-1.5">
 {[
 { label: "Gas plants dispatch first", positive: true },
 { label: "Coal utilization falls", positive: false },
 { label: "Gas demand increases", positive: true },
 { label: "Carbon emissions from power sector fall", positive: true },
 ].map((item) => (
 <div key={item.label} className="flex items-center gap-2 text-xs text-muted-foreground">
 {item.positive ? (
 <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
 ) : (
 <TrendingDown className="w-3.5 h-3.5 text-red-400 shrink-0" />
 )}
 {item.label}
 </div>
 ))}
 </div>
 </div>
 <div className="space-y-2">
 <p className="text-xs text-muted-foreground font-medium">Clean Dark Spread Policy Impact</p>
 <div className="space-y-1.5">
 {[
 "EU ETS carbon price >€60/t makes most coal uneconomic",
 "Clean dark spread drives coal-to-gas fuel switching",
 "UK & EU targeting coal phase-out by 2025–2030",
 "Negative clean dark = stranded asset risk for coal plants",
 ].map((text, i) => (
 <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
 <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
 {text}
 </div>
 ))}
 </div>
 </div>
 </div>
 </CardContent>
 </Card>
 </TabsContent>

 {/* ── Crush Spread Tab ───────────────────────────────────────────────── */}
 <TabsContent value="crush" className="data-[state=inactive]:hidden mt-4 space-y-4">
 <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
 <Card className="bg-card border-border lg:col-span-3">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 <Wheat className="w-4 h-4 text-yellow-400" />
 Board Crush Spread (12-Month History)
 <Badge className={`ml-auto text-xs text-muted-foreground ${posBg(crushCurrent.chg)}`}>
 {crushCurrent.value.toFixed(1)}¢/bu ({fmtChg(crushCurrent.chg)})
 </Badge>
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 <CrushFlowSVG />
 <SpreadLineChart
 bars={CRUSH_BARS}
 color="#eab308"
 unit="¢/bu"
 gradId="crushGrad"
 />
 </CardContent>
 </Card>

 <Card className="bg-card border-border lg:col-span-2">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground">
 Crush Economics
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 <div className="space-y-2">
 {[
 {
 label: "Soybean Input",
 value: `${(CRUSH_BARS[11].value * 0.018 + 9.2).toFixed(2)}/bu`,
 color: "text-amber-400",
 bg: "bg-amber-400/10",
 },
 {
 label: "Soybean Meal Output",
 value: `${(CRUSH_BARS[11].value * 0.0075 + 3.4).toFixed(2)}/bu`,
 color: "text-emerald-400",
 bg: "bg-emerald-400/10",
 },
 {
 label: "Soybean Oil Output",
 value: `${(CRUSH_BARS[11].value * 0.003 + 0.55).toFixed(3)}/lb`,
 color: "text-muted-foreground",
 bg: "bg-cyan-400/10",
 },
 {
 label: "Processing Cost",
 value: "~$0.35–0.45/bu",
 color: "text-red-400",
 bg: "bg-red-400/10",
 },
 {
 label: "Board Crush",
 value: `${crushCurrent.value.toFixed(1)}¢/bu`,
 color: "text-yellow-400",
 bg: "bg-yellow-400/10",
 },
 {
 label: "Net Margin",
 value: `${(crushCurrent.value - 40).toFixed(1)}¢/bu`,
 color: posColor(crushCurrent.value - 40),
 bg: crushCurrent.value - 40 >= 0 ? "bg-emerald-400/10" : "bg-red-400/10",
 },
 ].map((row) => (
 <div key={row.label} className={`flex items-center justify-between rounded-md px-2.5 py-1.5 ${row.bg}`}>
 <span className="text-xs text-muted-foreground">{row.label}</span>
 <span className={`text-xs text-muted-foreground font-medium ${row.color}`}>{row.value}</span>
 </div>
 ))}
 </div>
 <div className="bg-muted/50 rounded-lg p-2.5 text-xs text-muted-foreground space-y-1">
 <p className="text-muted-foreground font-medium">Crush Formula</p>
 <p>Board Crush = (0.022 × Oil Price × 100) + (0.48 × Meal Price) – Bean Price</p>
 <p className="text-muted-foreground mt-1">
 CBOT units: Beans in ¢/bu, Meal in $/ton, Oil in ¢/lb
 </p>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Crush factors */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground">Key Crush Spread Drivers</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 {[
 {
 icon: <CloudRain className="w-3.5 h-3.5 text-muted-foreground/50" />,
 title: "South American Weather",
 desc: "Brazil & Argentina produce ~55% of world soybeans. La Niña = drought = bullish crush",
 color: "text-primary",
 },
 {
 icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
 title: "Biofuel Policy",
 desc: "RVO mandates boost soy oil demand (biodiesel). Higher policy = wider crush margins",
 color: "text-emerald-400",
 },
 {
 icon: <Activity className="w-3.5 h-3.5 text-muted-foreground/50" />,
 title: "Chinese Demand",
 desc: "China buys 60%+ of global soybean exports for hog feed. Swine herd size is key metric",
 color: "text-primary",
 },
 {
 icon: <DollarSign className="w-4 h-4 text-amber-400" />,
 title: "USDA Crop Reports",
 desc: "WASDE monthly estimates move crush dramatically. Key dates: Mar, Jun, Sep, Nov",
 color: "text-amber-400",
 },
 ].map((d) => (
 <div key={d.title} className="bg-muted/50 rounded-lg p-2.5 space-y-1">
 <div className="flex items-center gap-1.5">
 {d.icon}
 <span className={`text-xs text-muted-foreground font-medium ${d.color}`}>{d.title}</span>
 </div>
 <p className="text-xs text-muted-foreground">{d.desc}</p>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </TabsContent>

 {/* ── Calendar Spreads Tab ───────────────────────────────────────────── */}
 <TabsContent value="calendar" className="data-[state=inactive]:hidden mt-4 space-y-4">
 <div className="flex items-center gap-2 mb-2">
 <Button
 variant={calendarView === "table" ? "default" : "outline"}
 size="sm"
 onClick={() => setCalendarView("table")}
 className="text-xs text-muted-foreground h-7"
 >
 Table View
 </Button>
 <Button
 variant={calendarView === "chart" ? "default" : "outline"}
 size="sm"
 onClick={() => setCalendarView("chart")}
 className="text-xs text-muted-foreground h-7"
 >
 Curve Charts
 </Button>
 </div>

 {calendarView === "table" ? (
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 <Calendar className="w-4 h-4 text-muted-foreground" />
 Energy &amp; Ag Calendar Spreads
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 {["Commodity", "Front Month", "Front Price", "Back Month", "Back Price", "Spread", "Structure", "Bull/Bear"].map(
 (h) => (
 <th key={h} className="text-left text-muted-foreground font-medium py-2 pr-4 whitespace-nowrap">
 {h}
 </th>
 )
 )}
 </tr>
 </thead>
 <tbody>
 {CALENDAR_SPREADS.map((cs) => (
 <tr key={cs.commodity} className="border-b border-border hover:bg-muted/30 transition-colors">
 <td className="py-2.5 pr-4 font-medium text-foreground whitespace-nowrap">
 {cs.icon} {cs.commodity}
 </td>
 <td className="py-2.5 pr-4 text-muted-foreground">{cs.frontMonth}</td>
 <td className="py-2.5 pr-4 text-foreground font-mono">
 {cs.frontPrice < 10 ? cs.frontPrice.toFixed(3) : cs.frontPrice.toFixed(2)}
 </td>
 <td className="py-2.5 pr-4 text-muted-foreground">{cs.backMonth}</td>
 <td className="py-2.5 pr-4 text-foreground font-mono">
 {cs.backPrice < 10 ? cs.backPrice.toFixed(3) : cs.backPrice.toFixed(2)}
 </td>
 <td className={`py-2.5 pr-4 font-mono font-medium ${posColor(cs.spread)}`}>
 {cs.spread > 0 ? "+" : ""}
 {cs.spread < 1 && cs.spread > -1 ? cs.spread.toFixed(3) : cs.spread.toFixed(2)}
 </td>
 <td className="py-2.5 pr-4">
 <Badge
 className={
 cs.structure === "contango"
 ? "bg-indigo-400/10 text-indigo-400 border-indigo-400/20 text-xs"
 : "bg-amber-400/10 text-amber-400 border-amber-400/20 text-xs"
 }
 >
 {cs.structure}
 </Badge>
 </td>
 <td className="py-2.5">
 {cs.structure === "contango" ? (
 <span className="flex items-center gap-1 text-red-400 text-xs">
 <TrendingDown className="w-3.5 h-3.5" /> Bear (deferred premium)
 </span>
 ) : (
 <span className="flex items-center gap-1 text-emerald-400 text-xs">
 <TrendingUp className="w-3.5 h-3.5" /> Bull (spot premium)
 </span>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {CALENDAR_SPREADS.map((cs) => (
 <Card key={cs.commodity} className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 <span>{cs.icon}</span>
 <span className="truncate">{cs.commodity}</span>
 <Badge
 className={`ml-auto text-xs text-muted-foreground shrink-0 ${
 cs.structure === "contango"
 ? "bg-indigo-400/10 text-indigo-400 border-indigo-400/20"
 : "bg-amber-400/10 text-amber-400 border-amber-400/20"
 }`}
 >
 {cs.structure}
 </Badge>
 </CardTitle>
 </CardHeader>
 <CardContent>
 <CalendarCurveSVG isContango={cs.structure === "contango"} commodity={cs.commodity} />
 <div className="flex justify-between text-xs text-muted-foreground mt-2">
 <span className="text-muted-foreground">
 Front: <span className="text-foreground font-mono">{cs.frontPrice.toFixed(2)}</span>
 </span>
 <span className={`font-mono font-medium ${posColor(cs.spread)}`}>
 Spread: {cs.spread > 0 ? "+" : ""}{cs.spread.toFixed(2)}
 </span>
 <span className="text-muted-foreground">
 Back: <span className="text-foreground font-mono">{cs.backPrice.toFixed(2)}</span>
 </span>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 )}

 {/* Calendar spread education */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 <TrendingUp className="w-4 h-4 text-amber-400" />
 Backwardation
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-2 text-xs text-muted-foreground">
 <p>Front-month price trades <span className="text-amber-400 font-medium">above</span> deferred contracts. Signals tight current supply or strong spot demand.</p>
 <ul className="space-y-1 list-none">
 {[
 "Storage near full → holders demand a premium to hold spot",
 "Inventory draw-down drives urgency to buy now",
 "Positive roll yield for long futures holders",
 "Signal: bulls buy front / sell back (bull spread)",
 ].map((pt, i) => (
 <li key={i} className="flex items-start gap-2">
 <span className="text-amber-400 shrink-0">•</span>
 {pt}
 </li>
 ))}
 </ul>
 </CardContent>
 </Card>
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 <TrendingDown className="w-4 h-4 text-indigo-400" />
 Contango
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-2 text-xs text-muted-foreground">
 <p>Deferred contracts trade <span className="text-indigo-400 font-medium">above</span> front-month. Reflects storage costs, financing, and surplus supply expectations.</p>
 <ul className="space-y-1 list-none">
 {[
 "Ample supply → deferred reflects carrying costs",
 "Negative roll yield erodes returns for long ETF holders",
 "Incentivizes storage (cash-and-carry arbitrage)",
 "Signal: bears sell front / buy back (bear spread)",
 ].map((pt, i) => (
 <li key={i} className="flex items-start gap-2">
 <span className="text-indigo-400 shrink-0">•</span>
 {pt}
 </li>
 ))}
 </ul>
 </CardContent>
 </Card>
 </div>
 </TabsContent>

 {/* ── Weather & Seasonality Tab ──────────────────────────────────────── */}
 <TabsContent value="weather" className="data-[state=inactive]:hidden mt-4 space-y-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 <CloudRain className="w-4 h-4 text-sky-400" />
 Weather Event Impact on Commodity Spreads
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 {["Weather Event", "Affected Spread", "Direction", "Magnitude", "Season", "Mechanism"].map((h) => (
 <th key={h} className="text-left text-muted-foreground font-medium py-2 pr-3 whitespace-nowrap">
 {h}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {WEATHER_IMPACTS.map((w, i) => (
 <tr key={i} className="border-b border-border hover:bg-muted/30 transition-colors">
 <td className="py-2.5 pr-3 font-medium text-foreground whitespace-nowrap">{w.event}</td>
 <td className="py-2.5 pr-3 text-muted-foreground whitespace-nowrap">{w.spread}</td>
 <td className="py-2.5 pr-3">
 <Badge
 className={
 w.direction === "bullish"
 ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20 text-xs"
 : w.direction === "bearish"
 ? "bg-red-400/10 text-red-400 border-red-400/20 text-xs"
 : "bg-amber-400/10 text-amber-400 border-amber-400/20 text-xs"
 }
 >
 {w.direction}
 </Badge>
 </td>
 <td className="py-2.5 pr-3 text-muted-foreground whitespace-nowrap">{w.magnitude}</td>
 <td className="py-2.5 pr-3">
 <Badge className="bg-muted/50 text-muted-foreground border-border text-xs">
 {w.season}
 </Badge>
 </td>
 <td className="py-2.5 text-muted-foreground max-w-[240px]">{w.reason}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>

 {/* Seasonality summary */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground">Energy Seasonality Calendar</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-1.5">
 {[
 { months: "Jan–Feb", event: "Winter peak demand → Nat Gas backwardation", color: "text-sky-400" },
 { months: "Mar–Apr", event: "Spring shoulder → Cracks narrow, storage builds", color: "text-emerald-400" },
 { months: "May–Jun", event: "Driving season begins → Gasoline cracks widen", color: "text-amber-400" },
 { months: "Jul–Aug", event: "Peak cooling demand → Spark spreads surge", color: "text-red-400" },
 { months: "Sep–Oct", event: "Refinery maintenance → Transitional crack spread", color: "text-primary" },
 { months: "Nov–Dec", event: "Pre-winter storage → Heating oil/gas premium", color: "text-sky-400" },
 ].map((s) => (
 <div key={s.months} className="flex items-center gap-3 bg-muted/40 rounded px-2.5 py-1.5">
 <span className={`text-xs text-muted-foreground font-mono font-medium w-16 shrink-0 ${s.color}`}>{s.months}</span>
 <span className="text-xs text-muted-foreground">{s.event}</span>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground">Agricultural Seasonality Calendar</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-1.5">
 {[
 { months: "Jan–Feb", event: "South American harvest outlook → Soy crush volatile", color: "text-yellow-400" },
 { months: "Mar–May", event: "US planting season → Corn/soy spread widens on acreage", color: "text-emerald-400" },
 { months: "Jun–Jul", event: "Pollination weather → Corn yield risk premium", color: "text-amber-400" },
 { months: "Aug–Sep", event: "Crop condition reports → Pre-harvest basis narrows", color: "text-red-400" },
 { months: "Oct–Nov", event: "Harvest pressure → Front contracts weaken vs deferred", color: "text-muted-foreground" },
 { months: "Dec", event: "USDA supply/demand estimates → Re-pricing spreads", color: "text-indigo-400" },
 ].map((s) => (
 <div key={s.months} className="flex items-center gap-3 bg-muted/40 rounded px-2.5 py-1.5">
 <span className={`text-xs text-muted-foreground font-mono font-medium w-16 shrink-0 ${s.color}`}>{s.months}</span>
 <span className="text-xs text-muted-foreground">{s.event}</span>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>
 </TabsContent>

 {/* ── Strategies Tab ─────────────────────────────────────────────────── */}
 <TabsContent value="strategies" className="data-[state=inactive]:hidden mt-4 space-y-4">
 <div className="grid grid-cols-1 gap-4">
 {SPREAD_STRATEGIES.map((strat, i) => (
 <motion.div
 key={strat.name}
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3, delay: i * 0.08 }}
 >
 <Card
 className="bg-card border-border cursor-pointer hover:border-border transition-colors"
 onClick={() => setActiveStrategy(activeStrategy === i ? null : i)}
 >
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 <div
 className="w-3 h-3 rounded-full shrink-0"
 style={{ backgroundColor: strat.color }}
 />
 {strat.name}
 <Badge
 className="text-xs text-muted-foreground"
 style={{
 backgroundColor: `${strat.color}15`,
 color: strat.color,
 borderColor: `${strat.color}30`,
 }}
 >
 {strat.type}
 </Badge>
 <div className="ml-auto flex items-center gap-3">
 <span className="text-xs text-muted-foreground hidden sm:block">R:R {strat.rrRatio}</span>
 <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
 </div>
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 <p className="text-xs text-muted-foreground">{strat.description}</p>

 {activeStrategy === i && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: "auto" }}
 exit={{ opacity: 0, height: 0 }}
 transition={{ duration: 0.25 }}
 className="space-y-3"
 >
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {[
 {
 label: "Entry Conditions",
 value: strat.entry,
 icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />,
 color: "text-emerald-400",
 bg: "bg-emerald-400/5 border-emerald-400/20",
 },
 {
 label: "Exit Plan",
 value: strat.exit,
 icon: <TrendingDown className="w-3.5 h-3.5 text-red-400" />,
 color: "text-red-400",
 bg: "bg-red-400/5 border-red-400/20",
 },
 {
 label: "Risk Profile",
 value: strat.risk,
 icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
 color: "text-amber-400",
 bg: "bg-amber-400/5 border-amber-400/20",
 },
 {
 label: "Reward Profile",
 value: strat.reward,
 icon: <DollarSign className="w-3.5 h-3.5 text-indigo-400" />,
 color: "text-indigo-400",
 bg: "bg-indigo-400/5 border-indigo-400/20",
 },
 ].map((field) => (
 <div
 key={field.label}
 className={`rounded-lg border p-2.5 space-y-1 ${field.bg}`}
 >
 <div className="flex items-center gap-1.5">
 {field.icon}
 <span className={`text-xs text-muted-foreground font-medium ${field.color}`}>{field.label}</span>
 </div>
 <p className="text-xs text-muted-foreground">{field.value}</p>
 </div>
 ))}
 </div>

 <div className="flex items-center gap-4 bg-muted/60 rounded-lg px-3 py-2">
 <div className="flex items-center gap-2">
 <BarChart2 className="w-3.5 h-3.5 text-muted-foreground" />
 <span className="text-xs text-muted-foreground">Risk/Reward</span>
 <span
 className="text-xs text-muted-foreground font-medium"
 style={{ color: strat.color }}
 >
 {strat.rrRatio}
 </span>
 </div>
 <div className="flex items-center gap-2 ml-4">
 <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
 <span className="text-xs text-muted-foreground">Edge:</span>
 <span className="text-xs text-muted-foreground">{strat.edge}</span>
 </div>
 </div>
 </motion.div>
 )}

 {activeStrategy !== i && (
 <div className="flex items-center gap-4 text-xs text-muted-foreground">
 <span>Click to expand strategy details</span>
 <span className="flex items-center gap-1 ml-auto" style={{ color: strat.color }}>
 R:R {strat.rrRatio}
 </span>
 </div>
 )}
 </CardContent>
 </Card>
 </motion.div>
 ))}
 </div>

 {/* Risk warning */}
 <Card className="bg-card border-amber-900/40">
 <CardContent className="pt-4">
 <div className="flex gap-3">
 <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
 <div className="space-y-1">
 <p className="text-sm font-medium text-amber-400">Spread Trading Risk Disclosure</p>
 <p className="text-xs text-muted-foreground">
 While spread trades have lower outright price exposure than directional futures, they carry significant risks including: basis risk (spread does not revert as expected), liquidity risk in deferred months, margin amplification (both legs require margin), and correlation breakdown during market stress. Commodity spreads can move violently during supply shocks, weather events, or regulatory changes. This is a simulation environment for educational purposes only.
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
