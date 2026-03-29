"use client";

import { useState, useMemo } from "react";
import {
 Leaf,
 Users,
 Shield,
 TrendingUp,
 TrendingDown,
 AlertTriangle,
 CheckCircle,
 XCircle,
 Globe,
 Droplets,
 Wind,
 Zap,
 BarChart2,
 Filter,
 Info,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────

let s = 622005;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};

function randBetween(lo: number, hi: number) {
 return lo + rand() * (hi - lo);
}
function randInt(lo: number, hi: number) {
 return Math.floor(randBetween(lo, hi + 1));
}

// ── Interfaces ─────────────────────────────────────────────────────────────────

interface EsgCompany {
 ticker: string;
 name: string;
 sector: string;
 eScore: number;
 sScore: number;
 gScore: number;
 total: number;
 rating: string;
 ratingColor: string;
 controversyLevel: "Low" | "Medium" | "High" | "Severe";
 controversyDesc: string;
 carbonIntensity: number;
 waterUsage: number;
 boardDiversity: number;
 employeeSat: number;
 renewableEnergy: number;
}

interface PerfPoint {
 year: string;
 esg: number;
 nonEsg: number;
 sp500: number;
}

interface ClimateRisk {
 company: string;
 ticker: string;
 physicalRisk: number;
 transitionRisk: number;
 carbonFootprint: number;
 tcfdAligned: boolean;
 netZeroTarget: string;
 scienceBasedTarget: boolean;
}

interface ThematicEtf {
 ticker: string;
 name: string;
 theme: string;
 aum: number;
 ytdReturn: number;
 expenseRatio: number;
 sdgAlignment: number[];
 esgScore: number;
}

interface ScreeningCriteria {
 id: string;
 label: string;
 type: "positive" | "negative";
 active: boolean;
}

// ── Rating helper ──────────────────────────────────────────────────────────────

function getRating(score: number): { label: string; color: string } {
 if (score >= 80) return { label: "AAA", color: "text-emerald-400" };
 if (score >= 70) return { label: "AA", color: "text-green-400" };
 if (score >= 60) return { label: "A", color: "text-lime-400" };
 if (score >= 50) return { label: "BBB", color: "text-yellow-400" };
 if (score >= 40) return { label: "BB", color: "text-orange-400" };
 if (score >= 30) return { label: "B", color: "text-red-400" };
 return { label: "CCC", color: "text-red-600" };
}

function getControversy(score: number): { level: EsgCompany["controversyLevel"]; desc: string } {
 if (score < 0.25)
 return { level: "Low", desc: "No significant ESG controversies reported in past 12 months." };
 if (score < 0.5)
 return { level: "Medium", desc: "Minor labor practices concerns flagged by NGO watchdog." };
 if (score < 0.75)
 return { level: "High", desc: "Ongoing regulatory investigation into supply chain emissions." };
 return { level: "Severe", desc: "Class-action lawsuit over deceptive greenwashing disclosures." };
}

// ── Data ──────────────────────────────────────────────────────────────────────

const COMPANIES_RAW: { ticker: string; name: string; sector: string }[] = [
 { ticker: "MSFT", name: "Microsoft", sector: "Technology" },
 { ticker: "AAPL", name: "Apple", sector: "Technology" },
 { ticker: "NVDA", name: "NVIDIA", sector: "Technology" },
 { ticker: "JPM", name: "JPMorgan Chase", sector: "Financials" },
 { ticker: "JNJ", name: "Johnson & Johnson", sector: "Healthcare" },
 { ticker: "NEE", name: "NextEra Energy", sector: "Utilities" },
 { ticker: "PG", name: "Procter & Gamble", sector: "Consumer Staples" },
 { ticker: "HD", name: "Home Depot", sector: "Consumer Discretionary" },
 { ticker: "UNH", name: "UnitedHealth", sector: "Healthcare" },
 { ticker: "CAT", name: "Caterpillar", sector: "Industrials" },
 { ticker: "XOM", name: "ExxonMobil", sector: "Energy" },
 { ticker: "TSLA", name: "Tesla", sector: "Consumer Discretionary" },
];

const COMPANIES: EsgCompany[] = COMPANIES_RAW.map((c) => {
 const e = Math.round(randBetween(30, 95));
 const sScore = Math.round(randBetween(30, 95));
 const g = Math.round(randBetween(30, 95));
 const total = Math.round((e * 0.35 + sScore * 0.35 + g * 0.3));
 const { label, color } = getRating(total);
 const controversyRoll = rand();
 const { level, desc } = getControversy(controversyRoll);
 return {
 ...c,
 eScore: e,
 sScore,
 gScore: g,
 total,
 rating: label,
 ratingColor: color,
 controversyLevel: level,
 controversyDesc: desc,
 carbonIntensity: Math.round(randBetween(5, 280)),
 waterUsage: Math.round(randBetween(10, 900)),
 boardDiversity: Math.round(randBetween(25, 75)),
 employeeSat: Math.round(randBetween(55, 95)),
 renewableEnergy: Math.round(randBetween(20, 100)),
 };
});

// Sort by total ESG descending (stable)
COMPANIES.sort((a, b) => b.total - a.total);

const PERF_YEARS = ["2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"];
let cumEsg = 100;
let cumNonEsg = 100;
let cumSp = 100;
const PERF_DATA: PerfPoint[] = PERF_YEARS.map((year) => {
 const esgRet = randBetween(-8, 22);
 const nonEsgRet = randBetween(-12, 20);
 const spRet = randBetween(-10, 18);
 cumEsg *= 1 + esgRet / 100;
 cumNonEsg *= 1 + nonEsgRet / 100;
 cumSp *= 1 + spRet / 100;
 return {
 year,
 esg: Math.round(cumEsg * 10) / 10,
 nonEsg: Math.round(cumNonEsg * 10) / 10,
 sp500: Math.round(cumSp * 10) / 10,
 };
});

const CLIMATE_RISKS: ClimateRisk[] = COMPANIES_RAW.slice(0, 8).map((c) => ({
 company: c.name,
 ticker: c.ticker,
 physicalRisk: Math.round(randBetween(5, 85)),
 transitionRisk: Math.round(randBetween(5, 85)),
 carbonFootprint: Math.round(randBetween(50, 3000)),
 tcfdAligned: rand() > 0.4,
 netZeroTarget: [2030, 2035, 2040, 2045, 2050][randInt(0, 4)].toString(),
 scienceBasedTarget: rand() > 0.45,
}));

const THEMATIC_ETFS: ThematicEtf[] = [
 {
 ticker: "ICLN",
 name: "iShares Global Clean Energy",
 theme: "Clean Energy",
 aum: 3.2,
 ytdReturn: randBetween(-5, 18),
 expenseRatio: 0.4,
 sdgAlignment: [7, 13],
 esgScore: Math.round(randBetween(70, 90)),
 },
 {
 ticker: "ESGU",
 name: "iShares MSCI USA ESG Optimized",
 theme: "Broad ESG",
 aum: 22.1,
 ytdReturn: randBetween(-3, 15),
 expenseRatio: 0.1,
 sdgAlignment: [8, 9, 13, 16],
 esgScore: Math.round(randBetween(65, 85)),
 },
 {
 ticker: "VSGX",
 name: "Vanguard ESG International Stock",
 theme: "Intl ESG",
 aum: 5.7,
 ytdReturn: randBetween(-4, 14),
 expenseRatio: 0.12,
 sdgAlignment: [8, 10, 16],
 esgScore: Math.round(randBetween(62, 82)),
 },
 {
 ticker: "SUSL",
 name: "iShares MSCI USA ESG Select",
 theme: "ESG Select",
 aum: 1.8,
 ytdReturn: randBetween(-2, 16),
 expenseRatio: 0.1,
 sdgAlignment: [8, 12, 13],
 esgScore: Math.round(randBetween(68, 88)),
 },
 {
 ticker: "GRNB",
 name: "VanEck Green Bond ETF",
 theme: "Green Bonds",
 aum: 0.4,
 ytdReturn: randBetween(-2, 8),
 expenseRatio: 0.2,
 sdgAlignment: [11, 13, 15],
 esgScore: Math.round(randBetween(72, 92)),
 },
 {
 ticker: "WOMN",
 name: "Impact Shares YWCA Women's",
 theme: "Gender Diversity",
 aum: 0.08,
 ytdReturn: randBetween(-3, 14),
 expenseRatio: 0.75,
 sdgAlignment: [5, 8, 10],
 esgScore: Math.round(randBetween(65, 82)),
 },
];

const INITIAL_SCREENING: ScreeningCriteria[] = [
 { id: "renewable", label: "Renewable Energy Focus", type: "positive", active: true },
 { id: "diversity", label: "Workforce Diversity Programs", type: "positive", active: true },
 { id: "ethics", label: "Strong Governance & Ethics Code", type: "positive", active: false },
 { id: "emissions", label: "Emissions Reduction Targets", type: "positive", active: true },
 { id: "weapons", label: "Controversial Weapons", type: "negative", active: true },
 { id: "tobacco", label: "Tobacco Production", type: "negative", active: true },
 { id: "gambling", label: "Gambling Operations", type: "negative", active: false },
 { id: "fossil", label: "Thermal Coal Extraction", type: "negative", active: true },
 { id: "nuclear", label: "Nuclear Weapons", type: "negative", active: true },
 { id: "deforestation", label: "Deforestation Activities", type: "negative", active: false },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function controversyBadge(level: EsgCompany["controversyLevel"]) {
 const map: Record<EsgCompany["controversyLevel"], string> = {
 Low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
 Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
 High: "bg-orange-500/20 text-orange-400 border-orange-500/30",
 Severe: "bg-red-500/20 text-red-400 border-red-500/30",
 };
 return map[level];
}

function ScoreBar({ value, color }: { value: number; color: string }) {
 return (
 <div className="flex items-center gap-2">
 <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
 <div
 className="h-full rounded-full transition-colors"
 style={{ width: `${value}%`, backgroundColor: color }}
 />
 </div>
 <span className="text-xs text-muted-foreground w-7 text-right">{value}</span>
 </div>
 );
}

// Radar SVG for a single company's E/S/G breakdown
function RadarChart({ e, sVal, g }: { e: number; sVal: number; g: number }) {
 const cx = 80;
 const cy = 80;
 const maxR = 60;
 // 3 axes: E at top (270°), S at bottom-right (30°), G at bottom-left (150°)
 const angles = [-90, 30, 150].map((a) => (a * Math.PI) / 180);
 const values = [e / 100, sVal / 100, g / 100];
 const pts = angles.map((a, i) => ({
 x: cx + maxR * values[i] * Math.cos(a),
 y: cy + maxR * values[i] * Math.sin(a),
 bx: cx + maxR * Math.cos(a),
 by: cy + maxR * Math.sin(a),
 label: ["E", "S", "G"][i],
 value: [e, sVal, g][i],
 }));
 const polygon = pts.map((p) => `${p.x},${p.y}`).join("");
 const outerPolygon = pts.map((p) => `${p.bx},${p.by}`).join("");

 return (
 <svg viewBox="0 0 160 160" className="w-full h-full">
 {/* grid rings */}
 {[0.25, 0.5, 0.75, 1].map((r) => (
 <polygon
 key={r}
 points={angles.map((a) => `${cx + maxR * r * Math.cos(a)},${cy + maxR * r * Math.sin(a)}`).join("")}
 fill="none"
 stroke="hsl(var(--border))"
 strokeWidth="0.5"
 />
 ))}
 {/* axis lines */}
 {pts.map((p, i) => (
 <line key={i} x1={cx} y1={cy} x2={p.bx} y2={p.by} stroke="hsl(var(--border))" strokeWidth="0.5" />
 ))}
 {/* outer reference */}
 <polygon points={outerPolygon} fill="none" stroke="hsl(var(--border))" strokeWidth="0.8" />
 {/* filled area */}
 <polygon points={polygon} fill="rgba(16,185,129,0.25)" stroke="#10b981" strokeWidth="1.5" />
 {/* dots */}
 {pts.map((p, i) => (
 <circle key={i} cx={p.x} cy={p.y} r="3" fill="#10b981" />
 ))}
 {/* labels */}
 {pts.map((p, i) => (
 <text
 key={i}
 x={p.bx + (p.bx - cx) * 0.22}
 y={p.by + (p.by - cy) * 0.22}
 textAnchor="middle"
 dominantBaseline="middle"
 fontSize="10"
 fill="hsl(var(--foreground))"
 fontWeight="600"
 >
 {p.label}
 </text>
 ))}
 {/* value labels */}
 {pts.map((p, i) => (
 <text
 key={`v${i}`}
 x={p.x + (p.x - cx) * 0.18}
 y={p.y + (p.y - cy) * 0.18}
 textAnchor="middle"
 dominantBaseline="middle"
 fontSize="7"
 fill="#10b981"
 >
 {p.value}
 </text>
 ))}
 </svg>
 );
}

// ESG vs non-ESG line chart
function PerfLineChart({ data }: { data: PerfPoint[] }) {
 const allVals = data.flatMap((d) => [d.esg, d.nonEsg, d.sp500]);
 const minV = Math.min(...allVals) - 5;
 const maxV = Math.max(...allVals) + 5;
 const W = 560;
 const H = 200;
 const padL = 45;
 const padR = 16;
 const padT = 12;
 const padB = 28;
 const chartW = W - padL - padR;
 const chartH = H - padT - padB;
 const n = data.length;

 const xPos = (i: number) => padL + (i / (n - 1)) * chartW;
 const yPos = (v: number) => padT + chartH - ((v - minV) / (maxV - minV)) * chartH;

 function linePath(key: "esg" | "nonEsg" | "sp500") {
 return data.map((d, i) => `${i === 0 ? "M" : "L"}${xPos(i).toFixed(1)},${yPos(d[key]).toFixed(1)}`).join("");
 }

 const yTicks = 5;
 const yStep = (maxV - minV) / yTicks;

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
 {/* grid */}
 {Array.from({ length: yTicks + 1 }, (_, i) => {
 const v = minV + i * yStep;
 const y = yPos(v);
 return (
 <g key={i}>
 <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="3,3" />
 <text x={padL - 4} y={y} textAnchor="end" dominantBaseline="middle" fontSize="8" fill="hsl(var(--muted-foreground))">
 {Math.round(v)}
 </text>
 </g>
 );
 })}
 {/* x labels */}
 {data.map((d, i) => (
 <text key={i} x={xPos(i)} y={H - padB + 12} textAnchor="middle" fontSize="8" fill="hsl(var(--muted-foreground))">
 {d.year}
 </text>
 ))}
 {/* lines */}
 <path d={linePath("nonEsg")} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,2" />
 <path d={linePath("sp500")} fill="none" stroke="#6366f1" strokeWidth="1.5" />
 <path d={linePath("esg")} fill="none" stroke="#10b981" strokeWidth="2" />
 {/* legend */}
 <g transform={`translate(${padL + 10}, ${padT + 8})`}>
 {[
 { color: "#10b981", label: "ESG Portfolio" },
 { color: "#6366f1", label: "S&P 500" },
 { color: "#ef4444", label: "Non-ESG" },
 ].map((l, i) => (
 <g key={i} transform={`translate(${i * 110}, 0)`}>
 <line x1="0" y1="5" x2="14" y2="5" stroke={l.color} strokeWidth="2" />
 <text x="18" y="9" fontSize="8" fill="hsl(var(--foreground))">{l.label}</text>
 </g>
 ))}
 </g>
 </svg>
 );
}

// Climate Risk Heatmap
function ClimateHeatmap({ data }: { data: ClimateRisk[] }) {
 const cellW = 58;
 const cellH = 38;
 const padL = 100;
 const padT = 30;
 const cols = ["Physical", "Transition"];

 function riskColor(v: number) {
 if (v >= 70) return "#ef4444";
 if (v >= 50) return "#f97316";
 if (v >= 30) return "#f59e0b";
 return "#10b981";
 }

 const W = padL + cols.length * cellW + 20;
 const H = padT + data.length * cellH + 16;

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: `${H}px` }}>
 {/* col headers */}
 {cols.map((c, ci) => (
 <text
 key={ci}
 x={padL + ci * cellW + cellW / 2}
 y={padT - 8}
 textAnchor="middle"
 fontSize="9"
 fill="hsl(var(--muted-foreground))"
 fontWeight="600"
 >
 {c}
 </text>
 ))}
 {data.map((row, ri) => {
 const y = padT + ri * cellH;
 const vals = [row.physicalRisk, row.transitionRisk];
 return (
 <g key={ri}>
 <text x={padL - 6} y={y + cellH / 2} textAnchor="end" dominantBaseline="middle" fontSize="9" fill="hsl(var(--foreground))">
 {row.ticker}
 </text>
 {vals.map((v, ci) => (
 <g key={ci}>
 <rect
 x={padL + ci * cellW + 2}
 y={y + 3}
 width={cellW - 4}
 height={cellH - 6}
 rx="3"
 fill={riskColor(v)}
 opacity="0.8"
 />
 <text
 x={padL + ci * cellW + cellW / 2}
 y={y + cellH / 2}
 textAnchor="middle"
 dominantBaseline="middle"
 fontSize="9"
 fill="white"
 fontWeight="600"
 >
 {v}
 </text>
 </g>
 ))}
 </g>
 );
 })}
 {/* legend */}
 {[
 { color: "#10b981", label: "Low (<30)" },
 { color: "#f59e0b", label: "Mod (30-50)" },
 { color: "#f97316", label: "High (50-70)" },
 { color: "#ef4444", label: "Severe (>70)" },
 ].map((l, i) => (
 <g key={i} transform={`translate(${padL + i * 62}, ${H - 10})`}>
 <rect x="0" y="-6" width="10" height="10" rx="2" fill={l.color} opacity="0.8" />
 <text x="13" y="2" fontSize="7" fill="hsl(var(--muted-foreground))">{l.label}</text>
 </g>
 ))}
 </svg>
 );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function EsgPage() {
 const [selectedCompany, setSelectedCompany] = useState<EsgCompany>(COMPANIES[0]);
 const [screening, setScreening] = useState<ScreeningCriteria[]>(INITIAL_SCREENING);
 const [activeTab, setActiveTab] = useState("scores");

 const toggleCriteria = (id: string) => {
 setScreening((prev) =>
 prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
 );
 };

 const screened = useMemo(() => {
 const negActive = screening.filter((c) => c.type === "negative" && c.active).map((c) => c.id);
 // For demo purposes filter companies that "fail" based on controversy level
 return COMPANIES.filter((c) => {
 if (negActive.includes("fossil") && c.sector === "Energy") return false;
 if (negActive.includes("weapons") && c.controversyLevel === "Severe") return false;
 return true;
 });
 }, [screening]);

 // Risk metrics computed from performance data
 const lastEsg = PERF_DATA[PERF_DATA.length - 1].esg;
 const lastNonEsg = PERF_DATA[PERF_DATA.length - 1].nonEsg;
 const esgTotalReturn = ((lastEsg - 100) / 100) * 100;
 const nonEsgTotalReturn = ((lastNonEsg - 100) / 100) * 100;
 const esgAnnReturn = (Math.pow(lastEsg / 100, 1 / 9) - 1) * 100;
 const nonEsgAnnReturn = (Math.pow(lastNonEsg / 100, 1 / 9) - 1) * 100;

 const fadeUp = {
 initial: { opacity: 0, y: 20 },
 animate: { opacity: 1, y: 0 },
 transition: { duration: 0.4 },
 };

 return (
 <div className="p-4 md:p-4 space-y-4 min-h-screen bg-background text-foreground">
 {/* Header */}
 <motion.div {...fadeUp} className="border-l-4 border-l-primary rounded-lg bg-card p-6 flex items-start justify-between flex-wrap gap-2">
 <div>
 <h1 className="text-xl font-semibold flex items-center gap-2">
 ESG & Sustainable Investing
 </h1>
 <p className="text-sm text-muted-foreground mt-0.5">
 Environmental, Social &amp; Governance analysis — data as of Mar 2026
 </p>
 </div>
 <div className="flex gap-2 flex-wrap">
 <Badge variant="outline" className="text-emerald-400 border-emerald-500/40">
 MSCI ESG Data
 </Badge>
 <Badge variant="outline" className="text-foreground border-primary/40">
 TCFD Aligned
 </Badge>
 <Badge variant="outline" className="text-foreground border-primary/40">
 SDG Framework
 </Badge>
 </div>
 </motion.div>

 {/* Summary chips */}
 <motion.div
 initial={{ opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4, delay: 0.1 }}
 className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3"
 >
 {[
 { icon: <Leaf className="w-4 h-4 text-emerald-400" />, label: "Avg E Score", value: Math.round(COMPANIES.reduce((a, c) => a + c.eScore, 0) / COMPANIES.length) },
 { icon: <Users className="w-3.5 h-3.5 text-muted-foreground/50" />, label: "Avg S Score", value: Math.round(COMPANIES.reduce((a, c) => a + c.sScore, 0) / COMPANIES.length) },
 { icon: <Shield className="w-3.5 h-3.5 text-muted-foreground/50" />, label: "Avg G Score", value: Math.round(COMPANIES.reduce((a, c) => a + c.gScore, 0) / COMPANIES.length) },
 { icon: <BarChart2 className="w-4 h-4 text-amber-400" />, label: "Avg ESG Total", value: Math.round(COMPANIES.reduce((a, c) => a + c.total, 0) / COMPANIES.length) },
 ].map((item, i) => (
 <Card key={i} className="bg-card border-border">
 <CardContent className="p-3 flex items-center gap-3">
 {item.icon}
 <div>
 <div className="text-xs text-muted-foreground">{item.label}</div>
 <div className="text-lg font-semibold">{item.value}<span className="text-xs text-muted-foreground">/100</span></div>
 </div>
 </CardContent>
 </Card>
 ))}
 </motion.div>

 {/* Tabs */}
 <motion.div
 initial={{ opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4, delay: 0.15 }}
 >
 <Tabs value={activeTab} onValueChange={setActiveTab}>
 <TabsList className="bg-transparent border-b border-border/20 rounded-none p-0 h-auto">
 <TabsTrigger value="scores" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">ESG Scores</TabsTrigger>
 <TabsTrigger value="performance" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Performance</TabsTrigger>
 <TabsTrigger value="climate" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Climate Risk</TabsTrigger>
 <TabsTrigger value="impact" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Impact Metrics</TabsTrigger>
 <TabsTrigger value="screening" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Screening</TabsTrigger>
 </TabsList>

 {/* ── Tab 1: ESG Scores ─────────────────────────────────────────────── */}
 <TabsContent value="scores" className="mt-4 space-y-4 data-[state=inactive]:hidden">
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
 {/* Company table */}
 <div className="lg:col-span-2">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm">Company ESG Rankings</CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 <th className="px-3 py-2 text-left text-muted-foreground font-medium">Company</th>
 <th className="px-2 py-2 text-center text-muted-foreground font-medium">Rating</th>
 <th className="px-2 py-2 text-right text-muted-foreground font-medium">E</th>
 <th className="px-2 py-2 text-right text-muted-foreground font-medium">S</th>
 <th className="px-2 py-2 text-right text-muted-foreground font-medium">G</th>
 <th className="px-2 py-2 text-right text-muted-foreground font-medium">Total</th>
 <th className="px-3 py-2 text-center text-muted-foreground font-medium">Controversy</th>
 </tr>
 </thead>
 <tbody>
 {COMPANIES.map((c, i) => (
 <tr
 key={c.ticker}
 className={`border-b border-border/20 cursor-pointer transition-colors hover:bg-muted/10 ${selectedCompany.ticker === c.ticker ? "bg-emerald-500/5" : ""}`}
 onClick={() => setSelectedCompany(c)}
 >
 <td className="px-3 py-2">
 <div className="font-medium">{c.ticker}</div>
 <div className="text-muted-foreground truncate max-w-[110px]">{c.name}</div>
 </td>
 <td className="px-2 py-2 text-center">
 <span className={`font-medium text-sm ${c.ratingColor}`}>{c.rating}</span>
 </td>
 <td className="px-2 py-2 text-right">
 <span className="text-emerald-400">{c.eScore}</span>
 </td>
 <td className="px-2 py-2 text-right">
 <span className="text-foreground">{c.sScore}</span>
 </td>
 <td className="px-2 py-2 text-right">
 <span className="text-foreground">{c.gScore}</span>
 </td>
 <td className="px-2 py-2 text-right font-medium">{c.total}</td>
 <td className="px-3 py-2 text-center">
 <span className={`inline-block px-1.5 py-0.5 rounded border text-xs text-muted-foreground font-medium ${controversyBadge(c.controversyLevel)}`}>
 {c.controversyLevel}
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Detail panel */}
 <div className="space-y-3">
 <Card className="bg-card border-border">
 <CardHeader className="pb-1">
 <CardTitle className="text-sm flex items-center gap-2">
 <span className={`font-medium text-base ${selectedCompany.ratingColor}`}>{selectedCompany.rating}</span>
 {selectedCompany.ticker}
 <span className="text-muted-foreground font-normal text-xs">— {selectedCompany.sector}</span>
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3 pt-1">
 <div className="w-24 h-24 mx-auto">
 <RadarChart e={selectedCompany.eScore} sVal={selectedCompany.sScore} g={selectedCompany.gScore} />
 </div>
 <div className="space-y-1.5">
 <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
 Environmental
 </div>
 <ScoreBar value={selectedCompany.eScore} color="#10b981" />
 <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1 mb-1">
 Social
 </div>
 <ScoreBar value={selectedCompany.sScore} color="#3b82f6" />
 <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1 mb-1">
 Governance
 </div>
 <ScoreBar value={selectedCompany.gScore} color="#8b5cf6" />
 </div>
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-1">
 <CardTitle className="text-xs text-muted-foreground flex items-center gap-1.5">
 Controversy Tracker
 </CardTitle>
 </CardHeader>
 <CardContent className="pt-1">
 <div className="flex items-center gap-2 mb-2">
 <span className={`px-2 py-0.5 rounded border text-xs text-muted-foreground font-semibold ${controversyBadge(selectedCompany.controversyLevel)}`}>
 {selectedCompany.controversyLevel} Risk
 </span>
 </div>
 <p className="text-xs text-muted-foreground leading-relaxed">{selectedCompany.controversyDesc}</p>
 <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
 <div>
 <div className="text-muted-foreground">Carbon Intensity</div>
 <div className="font-semibold">{selectedCompany.carbonIntensity} tCO₂/$M</div>
 </div>
 <div>
 <div className="text-muted-foreground">Renewable Energy</div>
 <div className="font-semibold text-emerald-400">{selectedCompany.renewableEnergy}%</div>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>
 </div>
 </TabsContent>

 {/* ── Tab 2: Performance ───────────────────────────────────────────── */}
 <TabsContent value="performance" className="mt-4 space-y-4 data-[state=inactive]:hidden">
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
 <div className="lg:col-span-2">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm">ESG vs Non-ESG vs S&amp;P 500 (Cumulative, 2016–2025)</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="h-52">
 <PerfLineChart data={PERF_DATA} />
 </div>
 </CardContent>
 </Card>
 </div>
 <div>
 <Card className="bg-card border-border h-full">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm">Risk-Adjusted Metrics</CardTitle>
 </CardHeader>
 <CardContent className="space-y-3 text-xs text-muted-foreground">
 {[
 {
 label: "Total Return",
 esg: `${esgTotalReturn.toFixed(1)}%`,
 nonEsg: `${nonEsgTotalReturn.toFixed(1)}%`,
 esgPos: esgTotalReturn > nonEsgTotalReturn,
 },
 {
 label: "Ann. Return",
 esg: `${esgAnnReturn.toFixed(1)}%`,
 nonEsg: `${nonEsgAnnReturn.toFixed(1)}%`,
 esgPos: esgAnnReturn > nonEsgAnnReturn,
 },
 { label: "Sharpe Ratio", esg: "0.84", nonEsg: "0.71", esgPos: true },
 { label: "Max Drawdown", esg: "-18.2%", nonEsg: "-24.7%", esgPos: true },
 { label: "Volatility (Ann)", esg: "14.1%", nonEsg: "17.8%", esgPos: true },
 { label: "Beta vs SPX", esg: "0.91", nonEsg: "1.08", esgPos: true },
 { label: "Sortino Ratio", esg: "1.12", nonEsg: "0.88", esgPos: true },
 ].map((row, i) => (
 <div key={i} className="flex items-center justify-between pb-2 border-b border-border/20 last:border-0">
 <span className="text-muted-foreground">{row.label}</span>
 <div className="flex gap-3">
 <span className={row.esgPos ? "text-emerald-400 font-medium" : "text-red-400 font-medium"}>
 ESG: {row.esg}
 </span>
 <span className="text-muted-foreground">|</span>
 <span className={!row.esgPos ? "text-emerald-400" : "text-muted-foreground"}>
 Non: {row.nonEsg}
 </span>
 </div>
 </div>
 ))}
 </CardContent>
 </Card>
 </div>
 </div>

 {/* Annual returns table */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm">Annual Cumulative Index Values (Base 100)</CardTitle>
 </CardHeader>
 <CardContent className="p-0 overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 <th className="px-3 py-2 text-left text-muted-foreground font-medium">Year</th>
 {PERF_DATA.map((d) => (
 <th key={d.year} className="px-3 py-2 text-right text-muted-foreground font-medium">{d.year}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {(["esg", "nonEsg", "sp500"] as const).map((key, ki) => {
 const labels = ["ESG Portfolio", "Non-ESG", "S&P 500"];
 const colors = ["text-emerald-400", "text-red-400", "text-indigo-400"];
 return (
 <tr key={key} className="border-b border-border/20">
 <td className={`px-3 py-2 font-medium ${colors[ki]}`}>{labels[ki]}</td>
 {PERF_DATA.map((d) => (
 <td key={d.year} className={`px-3 py-2 text-right ${colors[ki]}`}>{d[key].toFixed(1)}</td>
 ))}
 </tr>
 );
 })}
 </tbody>
 </table>
 </CardContent>
 </Card>
 </TabsContent>

 {/* ── Tab 3: Climate Risk ───────────────────────────────────────────── */}
 <TabsContent value="climate" className="mt-4 space-y-4 data-[state=inactive]:hidden">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center gap-2">
 Climate Risk Heatmap
 </CardTitle>
 </CardHeader>
 <CardContent>
 <ClimateHeatmap data={CLIMATE_RISKS} />
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center gap-2">
 TCFD &amp; Net Zero Alignment
 </CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 <th className="px-3 py-2 text-left text-muted-foreground font-medium">Company</th>
 <th className="px-2 py-2 text-center text-muted-foreground font-medium">TCFD</th>
 <th className="px-2 py-2 text-center text-muted-foreground font-medium">SBTi</th>
 <th className="px-2 py-2 text-right text-muted-foreground font-medium">Net Zero</th>
 <th className="px-3 py-2 text-right text-muted-foreground font-medium">CO₂ (kt)</th>
 </tr>
 </thead>
 <tbody>
 {CLIMATE_RISKS.map((r) => (
 <tr key={r.ticker} className="border-b border-border/20">
 <td className="px-3 py-2">
 <div className="font-medium">{r.ticker}</div>
 <div className="text-muted-foreground">{r.company}</div>
 </td>
 <td className="px-2 py-2 text-center">
 {r.tcfdAligned
 ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 inline" />
 : <XCircle className="w-3.5 h-3.5 text-red-400 inline" />}
 </td>
 <td className="px-2 py-2 text-center">
 {r.scienceBasedTarget
 ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 inline" />
 : <XCircle className="w-3.5 h-3.5 text-red-400 inline" />}
 </td>
 <td className="px-2 py-2 text-right font-medium text-sky-400">{r.netZeroTarget}</td>
 <td className="px-3 py-2 text-right text-muted-foreground">{r.carbonFootprint.toLocaleString()}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </CardContent>
 </Card>
 </div>

 {/* Carbon + Transition explanation cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center gap-2">
 Physical Risk Drivers
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-2 text-xs text-muted-foreground">
 {[
 { label: "Extreme weather events", value: 72 },
 { label: "Sea level rise exposure", value: 48 },
 { label: "Water stress (supply chain)", value: 61 },
 { label: "Heat stress (operations)", value: 55 },
 { label: "Flood risk (facilities)", value: 39 },
 ].map((item, i) => (
 <div key={i}>
 <div className="flex justify-between mb-0.5">
 <span>{item.label}</span>
 <span className="font-medium text-foreground">{item.value}%</span>
 </div>
 <Progress value={item.value} className="h-1.5" />
 </div>
 ))}
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center gap-2">
 Transition Risk Factors
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-2 text-xs text-muted-foreground">
 {[
 { label: "Carbon pricing exposure", value: 68 },
 { label: "Stranded asset risk", value: 44 },
 { label: "Technology disruption", value: 57 },
 { label: "Policy/regulatory shift", value: 79 },
 { label: "Market demand shift", value: 63 },
 ].map((item, i) => (
 <div key={i}>
 <div className="flex justify-between mb-0.5">
 <span>{item.label}</span>
 <span className="font-medium text-foreground">{item.value}%</span>
 </div>
 <Progress value={item.value} className="h-1.5" />
 </div>
 ))}
 </CardContent>
 </Card>
 </div>
 </TabsContent>

 {/* ── Tab 4: Impact Metrics ─────────────────────────────────────────── */}
 <TabsContent value="impact" className="mt-4 space-y-4 data-[state=inactive]:hidden">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 {/* Carbon intensity */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center gap-2">
 Carbon Intensity (tCO₂e per $M revenue)
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-2">
 {COMPANIES.map((c) => {
 const max = Math.max(...COMPANIES.map((x) => x.carbonIntensity));
 const pct = (c.carbonIntensity / max) * 100;
 const color = c.carbonIntensity < 50 ? "#10b981" : c.carbonIntensity < 120 ? "#f59e0b" : "#ef4444";
 return (
 <div key={c.ticker} className="text-xs text-muted-foreground">
 <div className="flex justify-between mb-0.5">
 <span className="text-muted-foreground">{c.ticker}</span>
 <span className="font-medium" style={{ color }}>{c.carbonIntensity}</span>
 </div>
 <div className="h-1.5 bg-border rounded-full overflow-hidden">
 <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
 </div>
 </div>
 );
 })}
 </CardContent>
 </Card>

 {/* Water usage */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center gap-2">
 Water Usage (ML per $M revenue)
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-2">
 {COMPANIES.map((c) => {
 const max = Math.max(...COMPANIES.map((x) => x.waterUsage));
 const pct = (c.waterUsage / max) * 100;
 const color = c.waterUsage < 100 ? "#10b981" : c.waterUsage < 400 ? "#3b82f6" : "#ef4444";
 return (
 <div key={c.ticker} className="text-xs text-muted-foreground">
 <div className="flex justify-between mb-0.5">
 <span className="text-muted-foreground">{c.ticker}</span>
 <span className="font-medium" style={{ color }}>{c.waterUsage}</span>
 </div>
 <div className="h-1.5 bg-border rounded-full overflow-hidden">
 <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
 </div>
 </div>
 );
 })}
 </CardContent>
 </Card>

 {/* Board diversity */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center gap-2">
 Board Diversity (% women &amp; minorities)
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-2">
 {COMPANIES.map((c) => (
 <div key={c.ticker} className="text-xs text-muted-foreground">
 <div className="flex justify-between mb-0.5">
 <span className="text-muted-foreground">{c.ticker}</span>
 <span className={`font-medium ${c.boardDiversity >= 50 ? "text-emerald-400" : c.boardDiversity >= 35 ? "text-yellow-400" : "text-red-400"}`}>
 {c.boardDiversity}%
 </span>
 </div>
 <Progress value={c.boardDiversity} className="h-1.5" />
 </div>
 ))}
 </CardContent>
 </Card>

 {/* Employee satisfaction */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center gap-2">
 Employee Satisfaction Score (0–100)
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-2">
 {COMPANIES.map((c) => (
 <div key={c.ticker} className="text-xs text-muted-foreground">
 <div className="flex justify-between mb-0.5">
 <span className="text-muted-foreground">{c.ticker}</span>
 <span className={`font-medium ${c.employeeSat >= 80 ? "text-emerald-400" : c.employeeSat >= 65 ? "text-yellow-400" : "text-red-400"}`}>
 {c.employeeSat}
 </span>
 </div>
 <Progress value={c.employeeSat} className="h-1.5" />
 </div>
 ))}
 </CardContent>
 </Card>
 </div>

 {/* Renewable energy spotlight */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center gap-2">
 Renewable Energy Procurement (% of total energy)
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
 {COMPANIES.map((c) => {
 const color = c.renewableEnergy >= 80 ? "#10b981" : c.renewableEnergy >= 50 ? "#f59e0b" : "#ef4444";
 const r = 22;
 const circumference = 2 * Math.PI * r;
 const dash = (c.renewableEnergy / 100) * circumference;
 return (
 <div key={c.ticker} className="flex flex-col items-center gap-1">
 <svg viewBox="0 0 60 60" className="w-14 h-14">
 <circle cx="30" cy="30" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="5" />
 <circle
 cx="30"
 cy="30"
 r={r}
 fill="none"
 stroke={color}
 strokeWidth="5"
 strokeDasharray={`${dash} ${circumference}`}
 strokeLinecap="round"
 transform="rotate(-90 30 30)"
 />
 <text x="30" y="34" textAnchor="middle" fontSize="10" fontWeight="700" fill={color}>
 {c.renewableEnergy}%
 </text>
 </svg>
 <span className="text-xs text-muted-foreground font-medium">{c.ticker}</span>
 <span className="text-xs text-muted-foreground">{c.sector}</span>
 </div>
 );
 })}
 </div>
 </CardContent>
 </Card>
 </TabsContent>

 {/* ── Tab 5: Screening ─────────────────────────────────────────────── */}
 <TabsContent value="screening" className="mt-4 space-y-4 data-[state=inactive]:hidden">
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
 {/* Screening criteria */}
 <div className="lg:col-span-1 space-y-3">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center gap-2">
 Positive Screens
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-2">
 {screening.filter((c) => c.type === "positive").map((c) => (
 <label key={c.id} className="flex items-center gap-2 cursor-pointer group">
 <button
 onClick={() => toggleCriteria(c.id)}
 className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${c.active ? "bg-emerald-500 border-emerald-500" : "border-border"}`}
 >
 {c.active && <CheckCircle className="w-3 h-3 text-foreground" />}
 </button>
 <span className={`text-xs ${c.active ? "text-foreground" : "text-muted-foreground"}`}>{c.label}</span>
 </label>
 ))}
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center gap-2">
 Negative Screens (Exclusions)
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-2">
 {screening.filter((c) => c.type === "negative").map((c) => (
 <label key={c.id} className="flex items-center gap-2 cursor-pointer group">
 <button
 onClick={() => toggleCriteria(c.id)}
 className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${c.active ? "bg-red-500 border-red-500" : "border-border"}`}
 >
 {c.active && <XCircle className="w-3 h-3 text-foreground" />}
 </button>
 <span className={`text-xs ${c.active ? "text-foreground" : "text-muted-foreground"}`}>{c.label}</span>
 </label>
 ))}
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm">Screening Summary</CardTitle>
 </CardHeader>
 <CardContent className="text-xs text-muted-foreground space-y-1.5">
 <div className="flex justify-between">
 <span className="text-muted-foreground">Universe</span>
 <span className="font-medium">{COMPANIES.length} companies</span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">After screening</span>
 <span className="font-medium text-emerald-400">{screened.length} companies</span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Excluded</span>
 <span className="font-medium text-red-400">{COMPANIES.length - screened.length}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Active positive screens</span>
 <span className="font-medium">{screening.filter((c) => c.type === "positive" && c.active).length}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Active exclusions</span>
 <span className="font-medium">{screening.filter((c) => c.type === "negative" && c.active).length}</span>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Results + Thematic ETFs */}
 <div className="lg:col-span-2 space-y-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm">Screened Universe ({screened.length} holdings)</CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 <th className="px-3 py-2 text-left text-muted-foreground font-medium">Company</th>
 <th className="px-2 py-2 text-center text-muted-foreground font-medium">Rating</th>
 <th className="px-2 py-2 text-right text-muted-foreground font-medium">Total</th>
 <th className="px-2 py-2 text-center text-muted-foreground font-medium">Controversy</th>
 <th className="px-3 py-2 text-right text-muted-foreground font-medium">Renewable</th>
 </tr>
 </thead>
 <tbody>
 {screened.map((c) => (
 <tr key={c.ticker} className="border-b border-border/20">
 <td className="px-3 py-2">
 <span className="font-medium">{c.ticker}</span>
 <span className="text-muted-foreground ml-1">{c.name}</span>
 </td>
 <td className="px-2 py-2 text-center">
 <span className={`font-medium ${c.ratingColor}`}>{c.rating}</span>
 </td>
 <td className="px-2 py-2 text-right font-medium">{c.total}</td>
 <td className="px-2 py-2 text-center">
 <span className={`px-1.5 py-0.5 rounded border text-xs text-muted-foreground font-medium ${controversyBadge(c.controversyLevel)}`}>
 {c.controversyLevel}
 </span>
 </td>
 <td className="px-3 py-2 text-right text-emerald-400 font-medium">{c.renewableEnergy}%</td>
 </tr>
 ))}
 </tbody>
 </table>
 </CardContent>
 </Card>

 {/* Thematic ETFs */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center gap-2">
 Thematic ESG ETFs &amp; SDG Alignment
 </CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 <th className="px-3 py-2 text-left text-muted-foreground font-medium">ETF</th>
 <th className="px-2 py-2 text-right text-muted-foreground font-medium">AUM ($B)</th>
 <th className="px-2 py-2 text-right text-muted-foreground font-medium">YTD</th>
 <th className="px-2 py-2 text-right text-muted-foreground font-medium">Exp %</th>
 <th className="px-2 py-2 text-right text-muted-foreground font-medium">ESG</th>
 <th className="px-3 py-2 text-left text-muted-foreground font-medium">SDGs</th>
 </tr>
 </thead>
 <tbody>
 {THEMATIC_ETFS.map((e) => (
 <tr key={e.ticker} className="border-b border-border/20">
 <td className="px-3 py-2">
 <div className="font-medium">{e.ticker}</div>
 <div className="text-muted-foreground truncate max-w-[130px]">{e.name}</div>
 <Badge variant="outline" className="text-xs text-muted-foreground mt-0.5 px-1 py-0">{e.theme}</Badge>
 </td>
 <td className="px-2 py-2 text-right font-medium">{e.aum.toFixed(1)}</td>
 <td className={`px-2 py-2 text-right font-medium ${e.ytdReturn >= 0 ? "text-emerald-400" : "text-red-400"}`}>
 {e.ytdReturn >= 0 ? "+" : ""}{e.ytdReturn.toFixed(1)}%
 </td>
 <td className="px-2 py-2 text-right text-muted-foreground">{e.expenseRatio.toFixed(2)}%</td>
 <td className={`px-2 py-2 text-right font-medium ${getRating(e.esgScore).color}`}>{e.esgScore}</td>
 <td className="px-3 py-2">
 <div className="flex gap-1 flex-wrap">
 {e.sdgAlignment.map((sdg) => (
 <span key={sdg} className="text-xs bg-muted/10 text-foreground border border-border rounded px-1">SDG {sdg}</span>
 ))}
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </CardContent>
 </Card>

 {/* Engagement vs Exclusion info */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center gap-2">
 Engagement vs Exclusion Strategy
 </CardTitle>
 </CardHeader>
 <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
 <div>
 <div className="font-medium text-emerald-400 mb-1.5 flex items-center gap-1">
 Active Engagement
 </div>
 <ul className="space-y-1 text-muted-foreground">
 <li>• Shareholder voting on ESG resolutions</li>
 <li>• Direct dialogue with management</li>
 <li>• Collaborative engagement via PRI</li>
 <li>• Push for TCFD disclosure adoption</li>
 <li>• Board diversity improvement targets</li>
 <li>• Science-based emissions commitments</li>
 </ul>
 </div>
 <div>
 <div className="font-medium text-red-400 mb-1.5 flex items-center gap-1">
 Exclusion Approach
 </div>
 <ul className="space-y-1 text-muted-foreground">
 <li>• Hard exclusion of weapons/tobacco</li>
 <li>• Revenue threshold screens (&gt;5%)</li>
 <li>• UN Global Compact violations</li>
 <li>• Controversy severity &gt; Level 4</li>
 <li>• Thermal coal &gt;25% of revenue</li>
 <li>• Arctic oil exploration activities</li>
 </ul>
 </div>
 </CardContent>
 </Card>
 </div>
 </div>
 </TabsContent>
 </Tabs>
 </motion.div>
 </div>
 );
}
