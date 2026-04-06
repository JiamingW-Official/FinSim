"use client";

import { useState, useMemo } from "react";
import {
 Globe,
 TrendingUp,
 TrendingDown,
 Activity,
 BarChart2,
 Calendar,
 DollarSign,
 Users,
 Briefcase,
 AlertCircle,
 ChevronUp,
 ChevronDown,
 Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 794;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};

function randBetween(min: number, max: number): number {
 return min + rand() * (max - min);
}

function resetSeed() {
 s = 794;
}

// ── Generate time-series data ──────────────────────────────────────────────────
function generateMonthlyDates(months: number): string[] {
 const dates: string[] = [];
 const now = new Date(2026, 2, 1); // March 2026
 for (let i = months - 1; i >= 0; i--) {
 const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
 dates.push(
 d.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
 );
 }
 return dates;
}

// ── PMI Data ───────────────────────────────────────────────────────────────────
interface PMISeries {
 label: string;
 color: string;
 values: number[];
}

function generatePMISeries(): { dates: string[]; series: PMISeries[] } {
 resetSeed();
 const dates = generateMonthlyDates(24);

 const series: PMISeries[] = [
 { label: "US Mfg", color: "#3b82f6", values: [] },
 { label: "US Svc", color: "#60a5fa", values: [] },
 { label: "EU Mfg", color: "#22c55e", values: [] },
 { label: "EU Svc", color: "#4ade80", values: [] },
 { label: "CN Mfg", color: "#f97316", values: [] },
 { label: "CN Svc", color: "#fb923c", values: [] },
 ];

 const bases = [52.1, 54.3, 46.2, 51.8, 50.4, 53.1];
 const volatilities = [1.8, 1.5, 2.1, 1.9, 1.6, 1.4];

 bases.forEach((base, si) => {
 let current = base;
 for (let i = 0; i < 24; i++) {
 current += (rand() - 0.5) * volatilities[si] * 2;
 current = Math.max(44, Math.min(58, current));
 series[si].values.push(parseFloat(current.toFixed(1)));
 }
 });

 return { dates, series };
}

// ── CPI Components ─────────────────────────────────────────────────────────────
interface CPIComponent {
 name: string;
 weight: number;
 yoy: number;
 color: string;
}

function generateCPIComponents(): { months: string[]; components: CPIComponent[]; monthlyData: number[][] } {
 resetSeed();

 const components: CPIComponent[] = [
 { name: "Shelter", weight: 35, yoy: 5.2, color: "#3b82f6" },
 { name: "Food", weight: 14, yoy: 2.8, color: "#22c55e" },
 { name: "Energy", weight: 7, yoy: -1.4, color: "#f97316" },
 { name: "Services ex-Housing", weight: 24, yoy: 3.9, color: "#a855f7" },
 { name: "Goods ex-Food&Energy", weight: 20, yoy: 0.6, color: "#06b6d4" },
 ];

 const months = generateMonthlyDates(12);
 const monthlyData: number[][] = components.map((comp) => {
 const data: number[] = [];
 let current = comp.yoy - (rand() * 1.5);
 for (let i = 0; i < 12; i++) {
 current += (rand() - 0.5) * 0.6;
 data.push(parseFloat(current.toFixed(2)));
 }
 return data;
 });

 return { months, components, monthlyData };
}

// ── NFP Data ───────────────────────────────────────────────────────────────────
interface NFPBar {
 month: string;
 actual: number;
 consensus: number;
}

function generateNFPData(): NFPBar[] {
 resetSeed();
 const months = generateMonthlyDates(18);
 return months.map((m) => {
 const consensus = Math.round(randBetween(160, 230));
 const actual = Math.round(consensus + (rand() - 0.5) * 120);
 return { month: m, actual, consensus };
 });
}

// ── GDP Comparison ─────────────────────────────────────────────────────────────
interface GDPCountry {
 country: string;
 flag: string;
 gdp: number;
 color: string;
}

const GDP_COUNTRIES: GDPCountry[] = [
 { country: "India", flag: "🇮🇳", gdp: 6.8, color: "#f97316" },
 { country: "Indonesia", flag: "🇮🇩", gdp: 5.1, color: "#22c55e" },
 { country: "China", flag: "🇨🇳", gdp: 4.6, color: "#ef4444" },
 { country: "USA", flag: "🇺🇸", gdp: 2.9, color: "#3b82f6" },
 { country: "Brazil", flag: "🇧🇷", gdp: 3.1, color: "#06b6d4" },
 { country: "Canada", flag: "🇨🇦", gdp: 1.4, color: "#a855f7" },
 { country: "Australia", flag: "🇦🇺", gdp: 1.5, color: "#84cc16" },
 { country: "UK", flag: "🇬🇧", gdp: 0.8, color: "#f59e0b" },
 { country: "Eurozone", flag: "🇪🇺", gdp: 0.4, color: "#64748b" },
 { country: "Japan", flag: "🇯🇵", gdp: 1.2, color: "#ec4899" },
];

// ── Economic Calendar ──────────────────────────────────────────────────────────
interface CalendarEvent {
 date: string;
 indicator: string;
 country: string;
 importance: "high" | "medium" | "low";
 consensus: string;
 prior: string;
}

const CALENDAR_EVENTS: CalendarEvent[] = [
 { date: "Apr 1", indicator: "ISM Manufacturing PMI", country: "US", importance: "high", consensus: "52.5", prior: "52.1" },
 { date: "Apr 3", indicator: "Initial Jobless Claims", country: "US", importance: "medium", consensus: "218K", prior: "215K" },
 { date: "Apr 4", indicator: "Non-Farm Payrolls", country: "US", importance: "high", consensus: "195K", prior: "187K" },
 { date: "Apr 4", indicator: "Unemployment Rate", country: "US", importance: "high", consensus: "4.1%", prior: "4.1%" },
 { date: "Apr 8", indicator: "CPI YoY", country: "US", importance: "high", consensus: "2.8%", prior: "3.0%" },
 { date: "Apr 10", indicator: "Core CPI MoM", country: "US", importance: "high", consensus: "0.3%", prior: "0.3%" },
 { date: "Apr 11", indicator: "Flash Manufacturing PMI", country: "EU", importance: "medium", consensus: "47.0", prior: "46.8" },
 { date: "Apr 14", indicator: "Industrial Production MoM", country: "US", importance: "medium", consensus: "0.2%", prior: "-0.1%" },
 { date: "Apr 17", indicator: "GDP QoQ (Advance)", country: "US", importance: "high", consensus: "2.4%", prior: "2.9%" },
 { date: "Apr 22", indicator: "Retail Sales MoM", country: "US", importance: "high", consensus: "0.3%", prior: "0.6%" },
];

// ── SVG Line Chart for PMI ─────────────────────────────────────────────────────
function PMILineChart({ dates, series }: { dates: string[]; series: PMISeries[] }) {
 const W = 700;
 const H = 240;
 const PAD = { top: 20, right: 20, bottom: 40, left: 44 };
 const chartW = W - PAD.left - PAD.right;
 const chartH = H - PAD.top - PAD.bottom;

 const allValues = series.flatMap((s) => s.values);
 const minVal = Math.floor(Math.min(...allValues)) - 1;
 const maxVal = Math.ceil(Math.max(...allValues)) + 1;

 const xScale = (i: number) => PAD.left + (i / (dates.length - 1)) * chartW;
 const yScale = (v: number) => PAD.top + ((maxVal - v) / (maxVal - minVal)) * chartH;

 const yTicks = [46, 48, 50, 52, 54, 56, 58].filter((t) => t >= minVal && t <= maxVal);
 const xTickStep = Math.ceil(dates.length / 6);

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
 {/* Gridlines */}
 {yTicks.map((tick) => (
 <line
 key={tick}
 x1={PAD.left}
 y1={yScale(tick)}
 x2={W - PAD.right}
 y2={yScale(tick)}
 stroke={tick === 50 ? "rgba(234,179,8,0.5)" : "rgba(255,255,255,0.07)"}
 strokeWidth={tick === 50 ? 1.5 : 1}
 strokeDasharray={tick === 50 ? "4,3" : undefined}
 />
 ))}

 {/* Y labels */}
 {yTicks.map((tick) => (
 <text
 key={tick}
 x={PAD.left - 6}
 y={yScale(tick) + 4}
 textAnchor="end"
 fontSize={9}
 fill="rgba(255,255,255,0.45)"
 >
 {tick}
 </text>
 ))}

 {/* X labels */}
 {dates.map((d, i) => {
 if (i % xTickStep !== 0 && i !== dates.length - 1) return null;
 return (
 <text
 key={i}
 x={xScale(i)}
 y={H - 6}
 textAnchor="middle"
 fontSize={8}
 fill="rgba(255,255,255,0.45)"
 >
 {d}
 </text>
 );
 })}

 {/* "50" label */}
 <text x={PAD.left + 4} y={yScale(50) - 4} fontSize={8} fill="rgba(234,179,8,0.7)">
 50 (expansion)
 </text>

 {/* Series lines */}
 {series.map((serie) => {
 const pts = serie.values.map((v, i) => `${xScale(i)},${yScale(v)}`).join(" ");
 return (
 <polyline
 key={serie.label}
 points={pts}
 fill="none"
 stroke={serie.color}
 strokeWidth={1.5}
 opacity={0.85}
 />
 );
 })}

 {/* Legend */}
 {series.map((serie, i) => (
 <g key={serie.label} transform={`translate(${PAD.left + i * 112}, ${H - PAD.bottom + 18})`}>
 <line x1={0} y1={4} x2={14} y2={4} stroke={serie.color} strokeWidth={2} />
 <text x={18} y={8} fontSize={8} fill="rgba(255,255,255,0.7)">
 {serie.label}
 </text>
 </g>
 ))}
 </svg>
 );
}

// ── Stacked Bar Chart for CPI Components ──────────────────────────────────────
function CPIStackedBar({
 months,
 components,
 monthlyData,
}: {
 months: string[];
 components: { name: string; weight: number; yoy: number; color: string }[];
 monthlyData: number[][];
}) {
 const W = 700;
 const H = 220;
 const PAD = { top: 20, right: 20, bottom: 50, left: 44 };
 const chartW = W - PAD.left - PAD.right;
 const chartH = H - PAD.top - PAD.bottom;

 // Compute weighted contributions per month
 const contributions: number[][] = months.map((_, mi) =>
 components.map((comp, ci) => (monthlyData[ci][mi] * comp.weight) / 100)
 );

 const totals = contributions.map((row) => row.reduce((a, b) => a + b, 0));
 const maxTot = Math.max(...totals);
 const minTot = Math.min(0, Math.min(...totals));

 const barW = chartW / months.length - 3;
 const xScale = (i: number) => PAD.left + i * (chartW / months.length) + barW / 2;
 const yZero = PAD.top + (maxTot / (maxTot - minTot)) * chartH;
 const yScale = (v: number) => PAD.top + ((maxTot - v) / (maxTot - minTot)) * chartH;

 const yTicks = [-0.5, 0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0].filter(
 (t) => t >= minTot - 0.1 && t <= maxTot + 0.1
 );

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
 {/* Gridlines */}
 {yTicks.map((tick) => (
 <line
 key={tick}
 x1={PAD.left}
 y1={yScale(tick)}
 x2={W - PAD.right}
 y2={yScale(tick)}
 stroke={tick === 0 ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.06)"}
 strokeWidth={1}
 />
 ))}
 {yTicks.map((tick) => (
 <text
 key={tick}
 x={PAD.left - 6}
 y={yScale(tick) + 4}
 textAnchor="end"
 fontSize={9}
 fill="rgba(255,255,255,0.45)"
 >
 {tick.toFixed(1)}%
 </text>
 ))}

 {/* Zero line */}
 <line
 x1={PAD.left}
 y1={yZero}
 x2={W - PAD.right}
 y2={yZero}
 stroke="rgba(255,255,255,0.25)"
 strokeWidth={1}
 />

 {/* Stacked bars */}
 {contributions.map((row, mi) => {
 let posY = yZero;
 let negY = yZero;
 return (
 <g key={mi}>
 {row.map((val, ci) => {
 if (val === 0) return null;
 const h = Math.abs(yScale(val) - yScale(0));
 let rect;
 if (val > 0) {
 rect = (
 <rect
 key={ci}
 x={xScale(mi) - barW / 2}
 y={posY - h}
 width={barW}
 height={h}
 fill={components[ci].color}
 opacity={0.8}
 />
 );
 posY -= h;
 } else {
 rect = (
 <rect
 key={ci}
 x={xScale(mi) - barW / 2}
 y={negY}
 width={barW}
 height={h}
 fill={components[ci].color}
 opacity={0.5}
 />
 );
 negY += h;
 }
 return rect;
 })}
 </g>
 );
 })}

 {/* X labels */}
 {months.map((m, i) => {
 if (i % 2 !== 0) return null;
 return (
 <text
 key={i}
 x={xScale(i)}
 y={H - PAD.bottom + 14}
 textAnchor="middle"
 fontSize={8}
 fill="rgba(255,255,255,0.45)"
 >
 {m}
 </text>
 );
 })}

 {/* Legend */}
 {components.map((comp, i) => (
 <g key={comp.name} transform={`translate(${PAD.left + i * 130}, ${H - 14})`}>
 <rect x={0} y={0} width={10} height={10} fill={comp.color} opacity={0.8} rx={2} />
 <text x={14} y={9} fontSize={8} fill="rgba(255,255,255,0.65)">
 {comp.name}
 </text>
 </g>
 ))}
 </svg>
 );
}

// ── NFP Bar Chart ─────────────────────────────────────────────────────────────
function NFPBarChart({ data }: { data: NFPBar[] }) {
 const W = 700;
 const H = 200;
 const PAD = { top: 20, right: 20, bottom: 40, left: 52 };
 const chartW = W - PAD.left - PAD.right;
 const chartH = H - PAD.top - PAD.bottom;

 const maxVal = Math.max(...data.map((d) => Math.max(d.actual, d.consensus)));
 const minVal = Math.min(0, Math.min(...data.map((d) => Math.min(d.actual, d.consensus))));

 const barW = (chartW / data.length) * 0.6;
 const xScale = (i: number) => PAD.left + i * (chartW / data.length) + (chartW / data.length) / 2;
 const yScale = (v: number) => PAD.top + ((maxVal - v) / (maxVal - minVal)) * chartH;
 const yZero = yScale(0);

 const yTicks = [0, 100, 200, 300, 400].filter((t) => t >= minVal && t <= maxVal + 50);

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
 {yTicks.map((tick) => (
 <line
 key={tick}
 x1={PAD.left}
 y1={yScale(tick)}
 x2={W - PAD.right}
 y2={yScale(tick)}
 stroke="rgba(255,255,255,0.06)"
 strokeWidth={1}
 />
 ))}
 {yTicks.map((tick) => (
 <text
 key={tick}
 x={PAD.left - 6}
 y={yScale(tick) + 4}
 textAnchor="end"
 fontSize={9}
 fill="rgba(255,255,255,0.45)"
 >
 {tick}K
 </text>
 ))}

 <line
 x1={PAD.left}
 y1={yZero}
 x2={W - PAD.right}
 y2={yZero}
 stroke="rgba(255,255,255,0.2)"
 strokeWidth={1}
 />

 {data.map((d, i) => {
 const isBelow = d.actual < d.consensus;
 const barH = Math.abs(yScale(d.actual) - yZero);
 const barY = d.actual >= 0 ? yScale(d.actual) : yZero;
 return (
 <g key={i}>
 <rect
 x={xScale(i) - barW / 2}
 y={barY}
 width={barW}
 height={Math.max(barH, 1)}
 fill={isBelow ? "#ef4444" : "#22c55e"}
 opacity={0.75}
 rx={1}
 />
 {/* Consensus marker */}
 <line
 x1={xScale(i) - barW / 2 - 2}
 y1={yScale(d.consensus)}
 x2={xScale(i) + barW / 2 + 2}
 y2={yScale(d.consensus)}
 stroke="rgba(234,179,8,0.8)"
 strokeWidth={1.5}
 />
 </g>
 );
 })}

 {/* X labels */}
 {data.map((d, i) => {
 if (i % 3 !== 0 && i !== data.length - 1) return null;
 return (
 <text
 key={i}
 x={xScale(i)}
 y={H - 4}
 textAnchor="middle"
 fontSize={8}
 fill="rgba(255,255,255,0.45)"
 >
 {d.month}
 </text>
 );
 })}

 {/* Legend */}
 <g transform={`translate(${PAD.left}, ${H - PAD.bottom + 18})`}>
 <rect x={0} y={0} width={10} height={10} fill="#22c55e" opacity={0.75} rx={1} />
 <text x={14} y={9} fontSize={8} fill="rgba(255,255,255,0.65)">
 Beat est.
 </text>
 <rect x={80} y={0} width={10} height={10} fill="#ef4444" opacity={0.75} rx={1} />
 <text x={94} y={9} fontSize={8} fill="rgba(255,255,255,0.65)">
 Missed est.
 </text>
 <line x1={180} y1={5} x2={194} y2={5} stroke="rgba(234,179,8,0.8)" strokeWidth={1.5} />
 <text x={198} y={9} fontSize={8} fill="rgba(255,255,255,0.65)">
 Consensus
 </text>
 </g>
 </svg>
 );
}

// ── Unemployment Rate Line ────────────────────────────────────────────────────
function UnemploymentLine({ dates, values }: { dates: string[]; values: number[] }) {
 const W = 700;
 const H = 140;
 const PAD = { top: 16, right: 20, bottom: 36, left: 44 };
 const chartW = W - PAD.left - PAD.right;
 const chartH = H - PAD.top - PAD.bottom;

 const minVal = Math.min(...values) - 0.3;
 const maxVal = Math.max(...values) + 0.3;

 const xScale = (i: number) => PAD.left + (i / (values.length - 1)) * chartW;
 const yScale = (v: number) => PAD.top + ((maxVal - v) / (maxVal - minVal)) * chartH;

 const pts = values.map((v, i) => `${xScale(i)},${yScale(v)}`).join(" ");
 const fillPts = `${xScale(0)},${H - PAD.bottom} ${pts} ${xScale(values.length - 1)},${H - PAD.bottom}`;

 const yTicks = [3.5, 4.0, 4.5, 5.0].filter((t) => t >= minVal && t <= maxVal);
 const xTickStep = Math.ceil(dates.length / 6);

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
 {yTicks.map((tick) => (
 <line
 key={tick}
 x1={PAD.left}
 y1={yScale(tick)}
 x2={W - PAD.right}
 y2={yScale(tick)}
 stroke="rgba(255,255,255,0.06)"
 strokeWidth={1}
 />
 ))}
 {yTicks.map((tick) => (
 <text
 key={tick}
 x={PAD.left - 6}
 y={yScale(tick) + 4}
 textAnchor="end"
 fontSize={9}
 fill="rgba(255,255,255,0.45)"
 >
 {tick.toFixed(1)}%
 </text>
 ))}

 <defs>
 <linearGradient id="urate-fill" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
 <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
 </linearGradient>
 </defs>

 <polygon points={fillPts} fill="url(#urate-fill)" />
 <polyline points={pts} fill="none" stroke="#a855f7" strokeWidth={2} />

 {/* Latest dot */}
 <circle
 cx={xScale(values.length - 1)}
 cy={yScale(values[values.length - 1])}
 r={3}
 fill="#a855f7"
 />

 {dates.map((d, i) => {
 if (i % xTickStep !== 0 && i !== dates.length - 1) return null;
 return (
 <text
 key={i}
 x={xScale(i)}
 y={H - 4}
 textAnchor="middle"
 fontSize={8}
 fill="rgba(255,255,255,0.45)"
 >
 {d}
 </text>
 );
 })}
 </svg>
 );
}

// ── GDP Horizontal Bar Chart ───────────────────────────────────────────────────
function GDPBarChart({ countries }: { countries: GDPCountry[] }) {
 const sorted = [...countries].sort((a, b) => b.gdp - a.gdp);
 const maxGDP = Math.max(...sorted.map((c) => Math.abs(c.gdp)));
 const W = 560;
 const barH = 24;
 const gap = 8;
 const H = sorted.length * (barH + gap) + 20;
 const labelW = 110;
 const chartW = W - labelW - 60;

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
 {sorted.map((c, i) => {
 const y = i * (barH + gap);
 const barLen = (Math.abs(c.gdp) / maxGDP) * chartW;
 const isNeg = c.gdp < 0;
 return (
 <g key={c.country} transform={`translate(0, ${y})`}>
 <text x={0} y={barH / 2 + 5} fontSize={12} fill="rgba(255,255,255,0.9)">
 {c.flag}
 </text>
 <text x={22} y={barH / 2 + 4} fontSize={10} fill="rgba(255,255,255,0.8)">
 {c.country}
 </text>
 <rect
 x={labelW}
 y={4}
 width={barLen}
 height={barH - 8}
 fill={isNeg ? "#ef4444" : c.color}
 opacity={0.8}
 rx={3}
 />
 <text
 x={labelW + barLen + 6}
 y={barH / 2 + 4}
 fontSize={10}
 fill={isNeg ? "#ef4444" : "#22c55e"}
 fontWeight="600"
 >
 {c.gdp > 0 ? "+" : ""}
 {c.gdp.toFixed(1)}%
 </text>
 </g>
 );
 })}
 </svg>
 );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function EconIndicatorsPage() {
 const [selectedPMIView, setSelectedPMIView] = useState<"all" | "us" | "eu" | "cn">("all");

 const pmiData = useMemo(() => generatePMISeries(), []);
 const cpiData = useMemo(() => generateCPIComponents(), []);
 const nfpData = useMemo(() => generateNFPData(), []);

 // Generate unemployment series
 const unempDates = useMemo(() => generateMonthlyDates(24), []);
 const unempValues = useMemo(() => {
 resetSeed();
 rand(); rand(); rand(); rand(); rand(); // offset seed
 let v = 4.1;
 return Array.from({ length: 24 }, () => {
 v += (rand() - 0.52) * 0.12;
 v = Math.max(3.7, Math.min(4.8, v));
 return parseFloat(v.toFixed(1));
 });
 }, []);

 const filteredPMISeries = useMemo(() => {
 if (selectedPMIView === "all") return pmiData.series;
 const prefix = selectedPMIView.toUpperCase();
 return pmiData.series.filter((s) => s.label.startsWith(prefix));
 }, [pmiData.series, selectedPMIView]);

 const keyMetrics = [
 {
 label: "US Composite PMI",
 value: "53.2",
 change: "+0.8",
 positive: true,
 icon: Activity,
 description: "Expansion territory",
 color: "text-primary",
 },
 {
 label: "CPI YoY",
 value: "3.0%",
 change: "-0.2%",
 positive: true,
 icon: DollarSign,
 description: "Cooling trend",
 color: "text-green-400",
 },
 {
 label: "Unemployment",
 value: "4.1%",
 change: "+0.1%",
 positive: false,
 icon: Users,
 description: "Near full employment",
 color: "text-primary",
 },
 {
 label: "GDP Growth QoQ",
 value: "2.9%",
 change: "+0.3%",
 positive: true,
 icon: BarChart2,
 description: "Above trend",
 color: "text-orange-400",
 },
 ];

 const importanceColor = {
 high: "bg-red-500/20 text-red-400 border-red-500/30",
 medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
 low: "bg-primary/20 text-primary border-border",
 };

 return (
 <div className="min-h-screen bg-background text-foreground p-4 space-y-4">
 {/* Header */}
 <div
 className="flex items-start justify-between"
 >
 <div>
 <div className="flex items-center gap-3 mb-1">
 <Globe className="h-6 w-6 text-primary" />
 <h1 className="text-2xl font-bold tracking-tight">Global Economic Indicators</h1>
 </div>
 <p className="text-muted-foreground text-sm">
 PMI · CPI · NFP · GDP · Leading indicators — real-time macro pulse
 </p>
 </div>
 <Badge variant="outline" className="text-xs text-muted-foreground border-border">
 <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block mr-1.5 animate-pulse" />
 Live data
 </Badge>
 </div>

 {/* Key Metrics Row — Hero */}
 <div
 className="border-l-4 border-l-primary rounded-lg bg-card p-6 grid grid-cols-2 md:grid-cols-4 gap-4"
 >
 {keyMetrics.map((m, i) => {
 const Icon = m.icon;
 return (
 <Card key={i} className="bg-card border-border">
 <CardContent className="p-4">
 <div className="flex items-center gap-2 mb-2">
 <Icon className={cn("h-4 w-4", m.color)} />
 <span className="text-xs text-muted-foreground">{m.label}</span>
 </div>
 <div className="flex items-end gap-2">
 <span className="text-lg font-medium">{m.value}</span>
 <span
 className={cn(
 "text-xs text-muted-foreground font-medium flex items-center gap-0.5 mb-0.5",
 m.positive ? "text-green-400" : "text-red-400"
 )}
 >
 {m.positive ? (
 <ChevronUp className="h-3 w-3" />
 ) : (
 <ChevronDown className="h-3 w-3" />
 )}
 {m.change}
 </span>
 </div>
 <p className="text-xs text-muted-foreground mt-1">{m.description}</p>
 </CardContent>
 </Card>
 );
 })}
 </div>

 {/* Main Tabs */}
 <div
 className="mt-8"
 >
 <Tabs defaultValue="leading">
 <TabsList className="mb-4">
 <TabsTrigger value="leading">Leading Indicators</TabsTrigger>
 <TabsTrigger value="inflation">Inflation</TabsTrigger>
 <TabsTrigger value="labor">Labor Market</TabsTrigger>
 <TabsTrigger value="global">Global Comparison</TabsTrigger>
 </TabsList>

 {/* ── Leading Indicators Tab ─────────────────────────────────────── */}
 <TabsContent value="leading">
 <div className="space-y-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <div className="flex items-center justify-between">
 <CardTitle className="text-base flex items-center gap-2">
 <Activity className="h-3.5 w-3.5 text-muted-foreground/50" />
 PMI Composite — Manufacturing &amp; Services
 </CardTitle>
 <div className="flex gap-1">
 {(["all", "us", "eu", "cn"] as const).map((v) => (
 <Button
 key={v}
 variant={selectedPMIView === v ? "secondary" : "ghost"}
 size="sm"
 className="h-6 px-2 text-xs text-muted-foreground"
 onClick={() => setSelectedPMIView(v)}
 >
 {v.toUpperCase()}
 </Button>
 ))}
 </div>
 </div>
 <p className="text-xs text-muted-foreground mt-1">
 Values above 50 indicate expansion; below 50 indicate contraction
 </p>
 </CardHeader>
 <CardContent>
 <PMILineChart dates={pmiData.dates} series={filteredPMISeries} />
 </CardContent>
 </Card>

 {/* PMI Summary Cards */}
 <div className="grid grid-cols-3 gap-3">
 {[
 {
 region: "United States",
 flag: "🇺🇸",
 mfg: 52.1,
 svc: 54.3,
 trend: "up" as const,
 color: "border-border",
 },
 {
 region: "Eurozone",
 flag: "🇪🇺",
 mfg: 46.2,
 svc: 51.8,
 trend: "down" as const,
 color: "border-green-500/30",
 },
 {
 region: "China",
 flag: "🇨🇳",
 mfg: 50.4,
 svc: 53.1,
 trend: "neutral" as const,
 color: "border-orange-500/30",
 },
 ].map((r) => (
 <Card key={r.region} className={cn("bg-card border", r.color)}>
 <CardContent className="p-4">
 <div className="flex items-center gap-2 mb-3">
 <span className="text-xl">{r.flag}</span>
 <div>
 <p className="text-sm font-semibold">{r.region}</p>
 <p className="text-xs text-muted-foreground">PMI Latest</p>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-2">
 <div className="bg-muted/30 rounded p-2">
 <p className="text-xs text-muted-foreground">Manufacturing</p>
 <p
 className={cn(
 "text-lg font-medium",
 r.mfg >= 50 ? "text-green-400" : "text-red-400"
 )}
 >
 {r.mfg.toFixed(1)}
 </p>
 </div>
 <div className="bg-muted/30 rounded p-2">
 <p className="text-xs text-muted-foreground">Services</p>
 <p
 className={cn(
 "text-lg font-medium",
 r.svc >= 50 ? "text-green-400" : "text-red-400"
 )}
 >
 {r.svc.toFixed(1)}
 </p>
 </div>
 </div>
 <div className="mt-2 flex items-center gap-1">
 {r.trend === "up" && <TrendingUp className="h-3 w-3 text-green-400" />}
 {r.trend === "down" && <TrendingDown className="h-3 w-3 text-red-400" />}
 {r.trend === "neutral" && <Minus className="h-3 w-3 text-amber-400" />}
 <span
 className={cn(
 "text-xs text-muted-foreground",
 r.trend === "up"
 ? "text-green-400"
 : r.trend === "down"
 ? "text-red-400"
 : "text-amber-400"
 )}
 >
 {r.trend === "up"
 ? "Momentum improving"
 : r.trend === "down"
 ? "Contraction risk"
 : "Stabilizing"}
 </span>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 </TabsContent>

 {/* ── Inflation Tab ─────────────────────────────────────────────── */}
 <TabsContent value="inflation">
 <div className="space-y-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-base flex items-center gap-2">
 <DollarSign className="h-4 w-4 text-orange-400" />
 CPI Component Contributions (Weighted, YoY %)
 </CardTitle>
 <p className="text-xs text-muted-foreground">
 Stacked bars show each component&apos;s contribution to overall CPI
 </p>
 </CardHeader>
 <CardContent>
 <CPIStackedBar
 months={cpiData.months}
 components={cpiData.components}
 monthlyData={cpiData.monthlyData}
 />
 </CardContent>
 </Card>

 {/* CPI Breakdown Table */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-base">CPI Component Breakdown</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-3">
 {cpiData.components.map((comp) => (
 <div key={comp.name} className="flex items-center gap-3">
 <div
 className="w-3 h-3 rounded-sm flex-shrink-0"
 style={{ backgroundColor: comp.color }}
 />
 <div className="flex-1 min-w-0">
 <div className="flex items-center justify-between mb-0.5">
 <span className="text-sm text-foreground">{comp.name}</span>
 <div className="flex items-center gap-2">
 <span className="text-xs text-muted-foreground">
 Weight: {comp.weight}%
 </span>
 <span
 className={cn(
 "text-sm font-semibold",
 comp.yoy > 3
 ? "text-red-400"
 : comp.yoy < 0
 ? "text-green-400"
 : "text-amber-400"
 )}
 >
 {comp.yoy > 0 ? "+" : ""}
 {comp.yoy.toFixed(1)}% YoY
 </span>
 </div>
 </div>
 <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
 <div
 className="h-full rounded-full transition-all"
 style={{
 width: `${Math.min(Math.abs(comp.yoy) * 12, 100)}%`,
 backgroundColor: comp.color,
 opacity: 0.7,
 }}
 />
 </div>
 </div>
 </div>
 ))}
 </div>
 <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
 <span className="text-sm font-medium">Headline CPI YoY</span>
 <span className="text-xl font-medium text-amber-400">3.0%</span>
 </div>
 <div className="flex items-center justify-between mt-1">
 <span className="text-sm font-medium">Core CPI YoY (ex-Food &amp; Energy)</span>
 <span className="text-lg font-semibold text-primary">3.6%</span>
 </div>
 </CardContent>
 </Card>
 </div>
 </TabsContent>

 {/* ── Labor Market Tab ───────────────────────────────────────────── */}
 <TabsContent value="labor">
 <div className="space-y-4">
 {/* NFP Chart */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-base flex items-center gap-2">
 <Briefcase className="h-4 w-4 text-green-400" />
 Non-Farm Payrolls (Thousands) — Last 18 Months
 </CardTitle>
 <p className="text-xs text-muted-foreground">
 Green = beat consensus · Red = missed · Yellow line = consensus estimate
 </p>
 </CardHeader>
 <CardContent>
 <NFPBarChart data={nfpData} />
 </CardContent>
 </Card>

 {/* Unemployment Rate */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-base flex items-center gap-2">
 <Users className="h-3.5 w-3.5 text-muted-foreground/50" />
 Unemployment Rate — 24 Month Trend
 </CardTitle>
 </CardHeader>
 <CardContent>
 <UnemploymentLine dates={unempDates} values={unempValues} />
 </CardContent>
 </Card>

 {/* Labor Stats Grid */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 {[
 { label: "Unemployment Rate", value: "4.1%", sub: "Near 50-yr low", color: "text-primary" },
 { label: "Participation Rate", value: "62.7%", sub: "+0.2% MoM", color: "text-primary" },
 { label: "Avg. Hourly Earnings", value: "+4.2%", sub: "YoY growth", color: "text-green-400" },
 { label: "JOLTS Job Openings", value: "8.7M", sub: "-0.3M MoM", color: "text-amber-400" },
 ].map((stat) => (
 <Card key={stat.label} className="bg-card border-border">
 <CardContent className="p-4">
 <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
 <p className={cn("text-lg font-medium", stat.color)}>{stat.value}</p>
 <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 </TabsContent>

 {/* ── Global Comparison Tab ─────────────────────────────────────── */}
 <TabsContent value="global">
 <div className="space-y-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-base flex items-center gap-2">
 <Globe className="h-4 w-4 text-muted-foreground" />
 GDP Growth Rate by Country — 2025 Estimate
 </CardTitle>
 <p className="text-xs text-muted-foreground">
 Annual real GDP growth (%). Sorted highest to lowest.
 </p>
 </CardHeader>
 <CardContent>
 <GDPBarChart countries={GDP_COUNTRIES} />
 </CardContent>
 </Card>

 {/* Country Detail Table */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-base">Key Country Metrics</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left py-2 text-xs text-muted-foreground font-medium">Country</th>
 <th className="text-right py-2 text-xs text-muted-foreground font-medium">GDP</th>
 <th className="text-right py-2 text-xs text-muted-foreground font-medium">CPI</th>
 <th className="text-right py-2 text-xs text-muted-foreground font-medium">CB Rate</th>
 <th className="text-right py-2 text-xs text-muted-foreground font-medium">Outlook</th>
 </tr>
 </thead>
 <tbody>
 {[
 { flag: "🇺🇸", name: "USA", gdp: 2.9, cpi: 3.0, rate: 5.25, outlook: "neutral" as const },
 { flag: "🇪🇺", name: "Eurozone", gdp: 0.4, cpi: 2.6, rate: 3.50, outlook: "bearish" as const },
 { flag: "🇨🇳", name: "China", gdp: 4.6, cpi: 0.2, rate: 3.45, outlook: "bearish" as const },
 { flag: "🇯🇵", name: "Japan", gdp: 1.2, cpi: 2.8, rate: 0.10, outlook: "bullish" as const },
 { flag: "🇬🇧", name: "UK", gdp: 0.8, cpi: 3.8, rate: 5.00, outlook: "neutral" as const },
 { flag: "🇮🇳", name: "India", gdp: 6.8, cpi: 5.0, rate: 6.50, outlook: "bullish" as const },
 { flag: "🇧🇷", name: "Brazil", gdp: 3.1, cpi: 4.7, rate: 10.50, outlook: "bullish" as const },
 { flag: "🇨🇦", name: "Canada", gdp: 1.4, cpi: 2.8, rate: 4.75, outlook: "neutral" as const },
 ].map((row) => (
 <tr key={row.name} className="border-b border-border hover:bg-muted/20">
 <td className="py-2">
 <span className="mr-1">{row.flag}</span>
 {row.name}
 </td>
 <td className="text-right py-2">
 <span
 className={cn(
 "font-medium",
 row.gdp >= 3 ? "text-green-400" : row.gdp >= 1.5 ? "text-amber-400" : "text-red-400"
 )}
 >
 {row.gdp.toFixed(1)}%
 </span>
 </td>
 <td className="text-right py-2">
 <span
 className={cn(
 "font-medium",
 row.cpi <= 2.5 ? "text-green-400" : row.cpi <= 4 ? "text-amber-400" : "text-red-400"
 )}
 >
 {row.cpi.toFixed(1)}%
 </span>
 </td>
 <td className="text-right py-2 text-foreground">{row.rate.toFixed(2)}%</td>
 <td className="text-right py-2">
 <Badge
 variant="outline"
 className={cn(
 "text-xs text-muted-foreground",
 row.outlook === "bullish"
 ? "border-green-500/40 text-green-400"
 : row.outlook === "bearish"
 ? "border-red-500/40 text-red-400"
 : "border-amber-500/40 text-amber-400"
 )}
 >
 {row.outlook}
 </Badge>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>
 </div>
 </TabsContent>
 </Tabs>
 </div>

 {/* Economic Calendar */}
 <div
 >
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-base flex items-center gap-2">
 <Calendar className="h-3.5 w-3.5 text-muted-foreground/50" />
 Economic Calendar — Next Major Releases
 </CardTitle>
 <p className="text-xs text-muted-foreground">
 Upcoming data releases with consensus estimates and prior readings
 </p>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left py-2 text-xs text-muted-foreground font-medium w-20">Date</th>
 <th className="text-left py-2 text-xs text-muted-foreground font-medium">Indicator</th>
 <th className="text-center py-2 text-xs text-muted-foreground font-medium w-16">Country</th>
 <th className="text-center py-2 text-xs text-muted-foreground font-medium w-20">Impact</th>
 <th className="text-right py-2 text-xs text-muted-foreground font-medium w-24">Consensus</th>
 <th className="text-right py-2 text-xs text-muted-foreground font-medium w-24">Prior</th>
 </tr>
 </thead>
 <tbody>
 {CALENDAR_EVENTS.map((evt, i) => (
 <tr key={i} className="border-b border-border hover:bg-muted/20">
 <td className="py-2 text-muted-foreground text-xs">{evt.date}</td>
 <td className="py-2 font-medium">{evt.indicator}</td>
 <td className="py-2 text-center text-xs text-muted-foreground">{evt.country}</td>
 <td className="py-2 text-center">
 <Badge
 variant="outline"
 className={cn("text-xs text-muted-foreground", importanceColor[evt.importance])}
 >
 {evt.importance}
 </Badge>
 </td>
 <td className="py-2 text-right font-mono text-sm">{evt.consensus}</td>
 <td className="py-2 text-right font-mono text-sm text-muted-foreground">
 {evt.prior}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
 <AlertCircle className="h-3 w-3" />
 <span>High-impact releases often cause significant market moves. Monitor volatility around release times.</span>
 </div>
 </CardContent>
 </Card>
 </div>
 </div>
 );
}
