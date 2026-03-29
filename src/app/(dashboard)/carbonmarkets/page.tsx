"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
 Leaf,
 Globe,
 ShieldCheck,
 TrendingUp,
 BarChart2,
 AlertTriangle,
 CheckCircle,
 ChevronDown,
 ChevronUp,
 Activity,
 DollarSign,
 Target,
 Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 933;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};
// Pre-generate stable values; consumed only if needed for extensions
const _vals = Array.from({ length: 3000 }, () => rand());
let _vi = 0;
const _sv = () => _vals[_vi++ % _vals.length];
void _sv; // suppress unused warning

// ── Format helpers ─────────────────────────────────────────────────────────────
function fmtPct(n: number): string {
 return (n >= 0 ? "+" : "") + n.toFixed(1) + "%";
}
const posColor = (v: number) => (v >= 0 ? "text-emerald-400" : "text-red-400");

// ── EUA Price Chart 2018–2024 ──────────────────────────────────────────────────
const EUA_PRICE_DATA: { year: string; price: number }[] = [
 { year: "2018", price: 16 },
 { year: "2019", price: 25 },
 { year: "2020", price: 24 },
 { year: "2021", price: 53 },
 { year: "2022", price: 82 },
 { year: "2023", price: 90 },
 { year: "2024", price: 62 },
];

function EuaPriceChart() {
 const W = 480;
 const H = 160;
 const PAD = { l: 40, r: 16, t: 16, b: 32 };
 const chartW = W - PAD.l - PAD.r;
 const chartH = H - PAD.t - PAD.b;
 const maxP = 100;
 const toX = (i: number) => PAD.l + (i / (EUA_PRICE_DATA.length - 1)) * chartW;
 const toY = (v: number) => PAD.t + chartH - (v / maxP) * chartH;
 const pts = EUA_PRICE_DATA.map((d, i) => `${toX(i)},${toY(d.price)}`).join("");
 const area = [
 `${toX(0)},${PAD.t + chartH}`,
 ...EUA_PRICE_DATA.map((d, i) => `${toX(i)},${toY(d.price)}`),
 `${toX(EUA_PRICE_DATA.length - 1)},${PAD.t + chartH}`,
 ].join("");
 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
 <defs>
 <linearGradient id="euaGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#34d399" stopOpacity="0.3" />
 <stop offset="100%" stopColor="#34d399" stopOpacity="0.02" />
 </linearGradient>
 </defs>
 {[0, 25, 50, 75, 100].map((v) => (
 <line key={`gl-${v}`} x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke="#27272a" strokeWidth="1" />
 ))}
 {[0, 25, 50, 75, 100].map((v) => (
 <text key={`gy-${v}`} x={PAD.l - 4} y={toY(v) + 4} fill="#71717a" fontSize="9" textAnchor="end">
 {`\u20AC${v}`}
 </text>
 ))}
 <polygon points={area} fill="url(#euaGrad)" />
 <polyline points={pts} fill="none" stroke="#34d399" strokeWidth="2" strokeLinejoin="round" />
 {EUA_PRICE_DATA.map((d, i) => (
 <circle key={`dot-${i}`} cx={toX(i)} cy={toY(d.price)} r="3" fill="#34d399" />
 ))}
 {EUA_PRICE_DATA.map((d, i) => (
 <text key={`xl-${i}`} x={toX(i)} y={H - 4} fill="#71717a" fontSize="9" textAnchor="middle">
 {d.year}
 </text>
 ))}
 {EUA_PRICE_DATA.map((d, i) => (
 <text key={`pl-${i}`} x={toX(i)} y={toY(d.price) - 6} fill="#a1a1aa" fontSize="8" textAnchor="middle">
 {`\u20AC${d.price}`}
 </text>
 ))}
 </svg>
 );
}

// ── Cap-and-Trade Mechanic SVG ─────────────────────────────────────────────────
function CapTradeSVG() {
 return (
 <svg viewBox="0 0 480 160" className="w-full h-40">
 <defs>
 <marker id="ctA1" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
 <path d="M0,0 L6,3 L0,6 Z" fill="#6366f1" />
 </marker>
 <marker id="ctA2" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
 <path d="M0,0 L6,3 L0,6 Z" fill="#34d399" />
 </marker>
 <marker id="ctA3" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
 <path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" />
 </marker>
 </defs>
 <rect x="10" y="60" width="80" height="40" rx="6" fill="#1e1e2e" stroke="#6366f1" strokeWidth="1.5" />
 <text x="50" y="78" fill="#a5b4fc" fontSize="9" textAnchor="middle" fontWeight="bold">REGULATOR</text>
 <text x="50" y="91" fill="#a5b4fc" fontSize="8" textAnchor="middle">Sets Cap</text>
 <line x1="90" y1="80" x2="130" y2="80" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#ctA1)" />
 <rect x="130" y="55" width="90" height="50" rx="6" fill="#1e1e2e" stroke="#34d399" strokeWidth="1.5" />
 <text x="175" y="75" fill="#6ee7b7" fontSize="9" textAnchor="middle" fontWeight="bold">ALLOWANCES</text>
 <text x="175" y="88" fill="#6ee7b7" fontSize="8" textAnchor="middle">Auctioned /</text>
 <text x="175" y="98" fill="#6ee7b7" fontSize="8" textAnchor="middle">Free Alloc.</text>
 <line x1="220" y1="80" x2="270" y2="80" stroke="#34d399" strokeWidth="1.5" markerEnd="url(#ctA2)" />
 <rect x="270" y="55" width="90" height="50" rx="6" fill="#1e1e2e" stroke="#f59e0b" strokeWidth="1.5" />
 <text x="315" y="75" fill="#fcd34d" fontSize="9" textAnchor="middle" fontWeight="bold">CARBON MKT</text>
 <text x="315" y="88" fill="#fcd34d" fontSize="8" textAnchor="middle">Price Discovery</text>
 <text x="315" y="98" fill="#fcd34d" fontSize="8" textAnchor="middle">EUA Trading</text>
 <line x1="360" y1="80" x2="400" y2="80" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#ctA3)" />
 <rect x="400" y="55" width="70" height="50" rx="6" fill="#1e1e2e" stroke="#f87171" strokeWidth="1.5" />
 <text x="435" y="75" fill="#fca5a5" fontSize="9" textAnchor="middle" fontWeight="bold">EMITTERS</text>
 <text x="435" y="88" fill="#fca5a5" fontSize="8" textAnchor="middle">Surrender</text>
 <text x="435" y="98" fill="#fca5a5" fontSize="8" textAnchor="middle">Allowances</text>
 <text x="240" y="20" fill="#71717a" fontSize="9" textAnchor="middle">Annual Cap declining ~2.2% p.a.</text>
 <line x1="130" y1="25" x2="360" y2="25" stroke="#27272a" strokeWidth="1" strokeDasharray="4,3" />
 </svg>
 );
}

// ── Regional ETS data ──────────────────────────────────────────────────────────
interface EtsSystem {
 name: string;
 region: string;
 launched: number;
 price: string;
 coverage: string;
 sectors: string;
 phase: string;
}
const ETS_SYSTEMS: EtsSystem[] = [
 { name: "EU ETS", region: "European Union", launched: 2005, price: "EUR 60-65/t", coverage: "~40% EU GHG", sectors: "Power, Industry, Aviation, Shipping", phase: "Phase 4 (2021-30)" },
 { name: "UK ETS", region: "United Kingdom", launched: 2021, price: "GBP 35-45/t", coverage: "~25% UK GHG", sectors: "Power, Industry, Aviation", phase: "Post-Brexit" },
 { name: "CA Cap-Trade", region: "California, USA", launched: 2013, price: "$30-35/t", coverage: "~85% CA GHG", sectors: "Power, Industry, Transport, Fuel", phase: "2021-30 program" },
 { name: "RGGI", region: "NE United States", launched: 2009, price: "$12-15/t", coverage: "~20% RGGI GHG", sectors: "Power sector only", phase: "2021-30 program" },
 { name: "China ETS", region: "China", launched: 2021, price: "CNY 50-70/t", coverage: "~40% China GHG", sectors: "Power sector only (expanding)", phase: "Phase 1" },
];

// ── Credit lifecycle SVG ───────────────────────────────────────────────────────
function CreditLifecycleSVG() {
 const steps = [
 { label: "Project\nDev", color: "#6366f1" },
 { label: "MRV\nMeasure", color: "#8b5cf6" },
 { label: "3rd Party\nVerify", color: "#a855f7" },
 { label: "Credit\nIssuance", color: "#34d399" },
 { label: "Credit\nRetirement", color: "#f59e0b" },
 ];
 const W = 480;
 const H = 110;
 const boxW = 72;
 const boxH = 48;
 const gap = (W - steps.length * boxW) / (steps.length + 1);
 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-28">
 <defs>
 {steps.map((st, i) => (
 <marker key={`lcm-${i}`} id={`arLC${i}`} markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
 <path d="M0,0 L6,3 L0,6 Z" fill={st.color} />
 </marker>
 ))}
 </defs>
 {steps.map((st, i) => {
 const cx = gap + i * (boxW + gap) + boxW / 2;
 const cy = H / 2;
 return (
 <g key={`lcs-${i}`}>
 <rect x={cx - boxW / 2} y={cy - boxH / 2} width={boxW} height={boxH} rx="6" fill="#18181b" stroke={st.color} strokeWidth="1.5" />
 {st.label.split("\n").map((line, j) => (
 <text key={`lct-${i}-${j}`} x={cx} y={cy - 6 + j * 14} fill={st.color} fontSize="8.5" textAnchor="middle" fontWeight="bold">{line}</text>
 ))}
 {i < steps.length - 1 && (
 <line x1={cx + boxW / 2 + 2} y1={cy} x2={cx + boxW / 2 + gap - 4} y2={cy} stroke={steps[i + 1].color} strokeWidth="1.5" markerEnd={`url(#arLC${i + 1})`} />
 )}
 </g>
 );
 })}
 </svg>
 );
}

// ── Credit price bar chart ─────────────────────────────────────────────────────
interface ProjectType { type: string; minPrice: number; maxPrice: number; color: string; }
const PROJECT_TYPES: ProjectType[] = [
 { type: "REDD+ Forest", minPrice: 5, maxPrice: 18, color: "#22c55e" },
 { type: "Renewable Energy", minPrice: 3, maxPrice: 8, color: "#f59e0b" },
 { type: "Methane Capture", minPrice: 8, maxPrice: 20, color: "#8b5cf6" },
 { type: "Blue Carbon", minPrice: 15, maxPrice: 50, color: "#06b6d4" },
 { type: "Cookstoves", minPrice: 6, maxPrice: 15, color: "#f97316" },
 { type: "Soil Carbon", minPrice: 10, maxPrice: 35, color: "#a16207" },
];
function CreditPriceChart() {
 const W = 480; const H = 180;
 const PAD = { l: 110, r: 16, t: 16, b: 28 };
 const chartW = W - PAD.l - PAD.r;
 const chartH = H - PAD.t - PAD.b;
 const maxP = 55;
 const rowH = chartH / PROJECT_TYPES.length;
 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48">
 {[0, 10, 20, 30, 40, 50].map((v) => {
 const x = PAD.l + (v / maxP) * chartW;
 return (
 <g key={`cg-${v}`}>
 <line x1={x} y1={PAD.t} x2={x} y2={H - PAD.b} stroke="#27272a" strokeWidth="1" />
 <text x={x} y={H - 10} fill="#71717a" fontSize="9" textAnchor="middle">${v}</text>
 </g>
 );
 })}
 {PROJECT_TYPES.map((pt, i) => {
 const y = PAD.t + i * rowH;
 const x2 = PAD.l + (pt.maxPrice / maxP) * chartW;
 return (
 <g key={`cr-${i}`}>
 <text x={PAD.l - 6} y={y + rowH / 2 + 4} fill="#a1a1aa" fontSize="9" textAnchor="end">{pt.type}</text>
 <rect x={PAD.l} y={y + rowH * 0.25} width={x2 - PAD.l} height={rowH * 0.5} fill={pt.color} fillOpacity="0.7" rx="2" />
 <text x={x2 + 4} y={y + rowH / 2 + 4} fill={pt.color} fontSize="8">${pt.minPrice}-${pt.maxPrice}</text>
 </g>
 );
 })}
 </svg>
 );
}

// ── Double-counting SVG ────────────────────────────────────────────────────────
function DoubleCountingSVG() {
 return (
 <svg viewBox="0 0 480 130" className="w-full h-32">
 <defs>
 <marker id="dcA" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
 <path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" />
 </marker>
 </defs>
 <rect x="20" y="30" width="130" height="70" rx="8" fill="#1e1e2e" stroke="#6366f1" strokeWidth="1.5" />
 <text x="85" y="52" fill="#a5b4fc" fontSize="10" textAnchor="middle" fontWeight="bold">Country A</text>
 <text x="85" y="67" fill="#a5b4fc" fontSize="8" textAnchor="middle">(Credit Seller)</text>
 <text x="85" y="82" fill="#a5b4fc" fontSize="8" textAnchor="middle">Claims -1 tCO2</text>
 <text x="85" y="94" fill="#a5b4fc" fontSize="8" textAnchor="middle">in NDC</text>
 <line x1="150" y1="65" x2="200" y2="65" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#dcA)" />
 <text x="175" y="58" fill="#fcd34d" fontSize="8" textAnchor="middle">Credit</text>
 <text x="175" y="70" fill="#fcd34d" fontSize="8" textAnchor="middle">Transfer</text>
 <rect x="200" y="30" width="130" height="70" rx="8" fill="#1e1e2e" stroke="#34d399" strokeWidth="1.5" />
 <text x="265" y="52" fill="#6ee7b7" fontSize="10" textAnchor="middle" fontWeight="bold">Country B</text>
 <text x="265" y="67" fill="#6ee7b7" fontSize="8" textAnchor="middle">(Credit Buyer)</text>
 <text x="265" y="82" fill="#6ee7b7" fontSize="8" textAnchor="middle">Claims -1 tCO2</text>
 <text x="265" y="94" fill="#6ee7b7" fontSize="8" textAnchor="middle">in NDC</text>
 <rect x="350" y="15" width="122" height="100" rx="8" fill="#1e1e2e" stroke="#f87171" strokeWidth="1.5" />
 <text x="411" y="38" fill="#fca5a5" fontSize="9" textAnchor="middle" fontWeight="bold">PROBLEM</text>
 <text x="411" y="54" fill="#fca5a5" fontSize="8" textAnchor="middle">Same tonne</text>
 <text x="411" y="66" fill="#fca5a5" fontSize="8" textAnchor="middle">counted TWICE</text>
 <text x="411" y="82" fill="#f59e0b" fontSize="8" textAnchor="middle">Article 6 fix:</text>
 <text x="411" y="94" fill="#f59e0b" fontSize="8" textAnchor="middle">Corresponding</text>
 <text x="411" y="106" fill="#f59e0b" fontSize="8" textAnchor="middle">Adjustment</text>
 </svg>
 );
}

// ── Carbon Price Forecast Chart ────────────────────────────────────────────────
function PriceForecastChart() {
 const W = 480; const H = 160;
 const PAD = { l: 44, r: 16, t: 16, b: 32 };
 const chartW = W - PAD.l - PAD.r;
 const chartH = H - PAD.t - PAD.b;
 const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
 const sdsData = [65, 78, 96, 115, 128, 138, 150];
 const nzeData = [65, 90, 120, 160, 195, 225, 250];
 const stepsData = [65, 70, 75, 82, 90, 100, 110];
 const maxP = 280;
 const toX = (i: number) => PAD.l + (i / (years.length - 1)) * chartW;
 const toY = (v: number) => PAD.t + chartH - (v / maxP) * chartH;
 const lpts = (data: number[]) => data.map((v, i) => `${toX(i)},${toY(v)}`).join("");
 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-44">
 {[0, 50, 100, 150, 200, 250].map((v) => (
 <g key={`pfg-${v}`}>
 <line x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke="#27272a" strokeWidth="1" />
 <text x={PAD.l - 4} y={toY(v) + 4} fill="#71717a" fontSize="9" textAnchor="end">${v}</text>
 </g>
 ))}
 {years.map((y, i) => (
 <text key={`pfy-${i}`} x={toX(i)} y={H - 4} fill="#71717a" fontSize="9" textAnchor="middle">{y}</text>
 ))}
 <polyline points={lpts(stepsData)} fill="none" stroke="#71717a" strokeWidth="1.5" strokeDasharray="4,3" />
 <polyline points={lpts(sdsData)} fill="none" stroke="#f59e0b" strokeWidth="2" />
 <polyline points={lpts(nzeData)} fill="none" stroke="#34d399" strokeWidth="2" />
 <line x1="50" y1="18" x2="70" y2="18" stroke="#34d399" strokeWidth="2" />
 <text x="74" y="22" fill="#6ee7b7" fontSize="9">NZE ($250/t)</text>
 <line x1="160" y1="18" x2="180" y2="18" stroke="#f59e0b" strokeWidth="2" />
 <text x="184" y="22" fill="#fcd34d" fontSize="9">SDS ($150/t)</text>
 <line x1="270" y1="18" x2="290" y2="18" stroke="#71717a" strokeWidth="1.5" strokeDasharray="4,3" />
 <text x="294" y="22" fill="#71717a" fontSize="9">STEPS ($110/t)</text>
 </svg>
 );
}

// ── MSR SVG ────────────────────────────────────────────────────────────────────
function MsrSVG() {
 return (
 <svg viewBox="0 0 480 140" className="w-full h-36">
 <defs>
 <marker id="msrA1" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
 <path d="M0,0 L6,3 L0,6 Z" fill="#f87171" />
 </marker>
 <marker id="msrA2" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
 <path d="M0,0 L6,3 L0,6 Z" fill="#34d399" />
 </marker>
 </defs>
 <rect x="20" y="20" width="120" height="60" rx="6" fill="#1e1e2e" stroke="#f87171" strokeWidth="1.5" />
 <text x="80" y="42" fill="#fca5a5" fontSize="9" textAnchor="middle" fontWeight="bold">SURPLUS ZONE</text>
 <text x="80" y="57" fill="#fca5a5" fontSize="8" textAnchor="middle">&gt;833M allowances</text>
 <text x="80" y="70" fill="#fca5a5" fontSize="8" textAnchor="middle">in circulation</text>
 <rect x="185" y="15" width="110" height="70" rx="6" fill="#1e1e2e" stroke="#6366f1" strokeWidth="2" />
 <text x="240" y="38" fill="#a5b4fc" fontSize="10" textAnchor="middle" fontWeight="bold">MSR</text>
 <text x="240" y="52" fill="#a5b4fc" fontSize="8" textAnchor="middle">Market Stability</text>
 <text x="240" y="64" fill="#a5b4fc" fontSize="8" textAnchor="middle">Reserve</text>
 <text x="240" y="76" fill="#a5b4fc" fontSize="8" textAnchor="middle">~2.7B allowances</text>
 <rect x="340" y="20" width="120" height="60" rx="6" fill="#1e1e2e" stroke="#34d399" strokeWidth="1.5" />
 <text x="400" y="42" fill="#6ee7b7" fontSize="9" textAnchor="middle" fontWeight="bold">DEFICIT ZONE</text>
 <text x="400" y="57" fill="#6ee7b7" fontSize="8" textAnchor="middle">&lt;400M allowances</text>
 <text x="400" y="70" fill="#6ee7b7" fontSize="8" textAnchor="middle">in circulation</text>
 <line x1="140" y1="50" x2="183" y2="50" stroke="#f87171" strokeWidth="1.5" markerEnd="url(#msrA1)" />
 <text x="162" y="44" fill="#f87171" fontSize="7" textAnchor="middle">Absorb 24%/yr</text>
 <line x1="297" y1="50" x2="338" y2="50" stroke="#34d399" strokeWidth="1.5" markerEnd="url(#msrA2)" />
 <text x="318" y="44" fill="#34d399" fontSize="7" textAnchor="middle">Release 100M/yr</text>
 <rect x="155" y="100" width="170" height="30" rx="4" fill="#27272a" />
 <text x="240" y="116" fill="#71717a" fontSize="8" textAnchor="middle">Excess MSR holdings cancelled from 2023</text>
 </svg>
 );
}

// ── VCM standards data ─────────────────────────────────────────────────────────
interface VcmStandard { name: string; fullName: string; founded: number; credits: string; focus: string; color: string; }
const VCM_STANDARDS: VcmStandard[] = [
 { name: "Verra VCS", fullName: "Verified Carbon Standard", founded: 2005, credits: "1B+ credits", focus: "Largest registry; broad project types", color: "#22c55e" },
 { name: "Gold Standard", fullName: "Gold Standard for Global Goals", founded: 2003, credits: "200M+ credits", focus: "SDG co-benefits focus; strict additionality", color: "#f59e0b" },
 { name: "ACR", fullName: "American Carbon Registry", founded: 1996, credits: "100M+ credits", focus: "US-focused; compliance and voluntary", color: "#60a5fa" },
 { name: "CAR", fullName: "Climate Action Reserve", founded: 2001, credits: "80M+ credits", focus: "North American protocols; CARB offset acceptance", color: "#a855f7" },
];

// ── Calyx ratings data ─────────────────────────────────────────────────────────
const CALYX_RATINGS = [
 { rating: "AAA", label: "Highest Integrity", color: "#22c55e", pct: 8 },
 { rating: "AA", label: "Very High Integrity", color: "#4ade80", pct: 12 },
 { rating: "A", label: "High Integrity", color: "#86efac", pct: 20 },
 { rating: "BBB", label: "Good Integrity", color: "#fcd34d", pct: 25 },
 { rating: "BB", label: "Moderate Integrity", color: "#fb923c", pct: 18 },
 { rating: "B", label: "Below Average", color: "#f87171", pct: 11 },
 { rating: "CCC/D", label: "Questionable", color: "#ef4444", pct: 6 },
];

// ── Permanence risk data ───────────────────────────────────────────────────────
interface PermanenceRow { type: string; risk: number; color: string; note: string; }
const PERMANENCE_DATA: PermanenceRow[] = [
 { type: "REDD+ Tropical Forest", risk: 72, color: "#f87171", note: "Wildfire, deforestation reversal" },
 { type: "Temperate Forest", risk: 58, color: "#fb923c", note: "Drought, beetle infestations" },
 { type: "Blue Carbon (Mangrove)", risk: 65, color: "#60a5fa", note: "Storm surge, sea-level rise" },
 { type: "Blue Carbon (Seagrass)", risk: 70, color: "#38bdf8", note: "Pollution, warming waters" },
 { type: "Soil Carbon", risk: 50, color: "#a78bfa", note: "Tillage practice reversal" },
 { type: "Renewable Energy", risk: 12, color: "#34d399", note: "Low -- energy generated, not stored" },
 { type: "Methane Destruction", risk: 8, color: "#4ade80", note: "Very low -- immediate destruction" },
];

// ── Carbon ETF data ────────────────────────────────────────────────────────────
interface CarbonFund { ticker: string; name: string; aum: string; exposure: string; ytd: number; expense: string; }
const CARBON_FUNDS: CarbonFund[] = [
 { ticker: "KRBN", name: "KraneShares Global Carbon Strategy ETF", aum: "$750M", exposure: "EUA + RGGI + CCA futures", ytd: -18.3, expense: "0.79%" },
 { ticker: "CARB", name: "iPath Series B Carbon ETN", aum: "$35M", exposure: "EUA futures only", ytd: -14.7, expense: "0.45%" },
 { ticker: "GRN", name: "iPath Global Carbon ETN", aum: "$28M", exposure: "EUA + certified", ytd: -16.2, expense: "0.75%" },
 { ticker: "WCLD", name: "WisdomTree Carbon EUA Fund", aum: "$90M", exposure: "Physical EUA", ytd: -15.8, expense: "0.22%" },
];

// ── Reusable components ────────────────────────────────────────────────────────
function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
 const [open, setOpen] = useState(false);
 return (
 <div className="border border-border rounded-lg overflow-hidden">
 <button
 className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-muted transition-colors text-left"
 onClick={() => setOpen((v) => !v)}
 >
 <span className="text-sm font-medium text-foreground">{title}</span>
 {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
 </button>
 <AnimatePresence>
 {open && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: "auto", opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 transition={{ duration: 0.2 }}
 className="overflow-hidden"
 >
 <div className="px-4 py-3 bg-background text-sm text-muted-foreground space-y-2">{children}</div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}

function StatChip({ label, value, sub, color = "text-foreground" }: { label: string; value: string; sub?: string; color?: string }) {
 return (
 <div className="bg-card border border-border rounded-lg p-3 space-y-1">
 <div className="text-xs text-muted-foreground">{label}</div>
 <div className={cn("text-lg font-semibold font-mono", color)}>{value}</div>
 {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
 </div>
 );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1: Compliance Carbon Markets
// ══════════════════════════════════════════════════════════════════════════════
function ComplianceTab() {
 const euPhases = [
 { phase: "Phase 1", years: "2005-07", cap: "Grandfathering", price: "EUR 0-30/t", note: "Pilot; over-allocation crashed prices to near zero" },
 { phase: "Phase 2", years: "2008-12", cap: "Slight reduction", price: "EUR 5-30/t", note: "Financial crisis caused surplus; ~2B tonne overhang" },
 { phase: "Phase 3", years: "2013-20", cap: "EU-wide (-1.74%/yr)", price: "EUR 3-30/t", note: "Back-loading; MSR introduced 2019" },
 { phase: "Phase 4", years: "2021-30", cap: "-2.2%/yr; MSR active", price: "EUR 25-100+/t", note: "REPowerEU raised LRF to 4.3%; aviation + shipping added" },
 ];
 const sectorCoverage = [
 { name: "Power & Heat", pct: 38, color: "#f87171" },
 { name: "Heavy Industry", pct: 30, color: "#fb923c" },
 { name: "Aviation", pct: 14, color: "#fcd34d" },
 { name: "Maritime Shipping", pct: 10, color: "#60a5fa" },
 { name: "Other Industrial", pct: 8, color: "#a855f7" },
 ];

 return (
 <div className="space-y-4">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <StatChip label="EUA Price (Mar 2026)" value="EUR 62/t" sub="Per tonne CO2eq" color="text-emerald-400" />
 <StatChip label="EU ETS Annual Cap" value="1.39 Bt" sub="2024 cap; declining" color="text-foreground" />
 <StatChip label="MSR Holdings" value="2.7 Bt" sub="Withheld from market" color="text-foreground" />
 <StatChip label="2025 Auction Revenue" value="EUR 37B" sub="EU member states" color="text-amber-400" />
 </div>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Cap-and-Trade Mechanism
 </CardTitle>
 </CardHeader>
 <CardContent>
 <CapTradeSVG />
 <p className="text-xs text-muted-foreground mt-2">
 Regulators set an annual emission cap which declines each year. Allowances are auctioned or freely allocated to emitters, who must surrender one allowance per tonne of CO2 emitted. Those who reduce emissions below their allocation can sell surplus permits.
 </p>
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 EU Carbon Allowance (EUA) Price 2018-2024
 </CardTitle>
 </CardHeader>
 <CardContent>
 <EuaPriceChart />
 <p className="text-xs text-muted-foreground mt-2">
 EUA prices rose from single digits to over EUR 100/t in 2023, driven by the energy crisis and MSR tightening, before falling back on weaker industrial demand and gas price declines.
 </p>
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground">EU ETS Phase Evolution</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 {["Phase", "Years", "Cap Design", "Price Range", "Key Developments"].map((h) => (
 <th key={h} className="text-left py-2 px-3 text-muted-foreground font-medium">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {euPhases.map((row, i) => (
 <tr key={i} className="border-b border-border/60 hover:bg-muted/30">
 <td className="py-2 px-3 text-indigo-400 font-medium">{row.phase}</td>
 <td className="py-2 px-3 text-muted-foreground">{row.years}</td>
 <td className="py-2 px-3 text-muted-foreground">{row.cap}</td>
 <td className="py-2 px-3 text-emerald-400 font-mono">{row.price}</td>
 <td className="py-2 px-3 text-muted-foreground">{row.note}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Market Stability Reserve (MSR) Mechanism
 </CardTitle>
 </CardHeader>
 <CardContent>
 <MsrSVG />
 <p className="text-xs text-muted-foreground mt-2">
 The MSR automatically adjusts supply by absorbing allowances when total supply exceeds 833M (at 24%/yr) and releasing 100M/yr when supply falls below 400M. Since 2023, excess MSR holdings above the prior year auction volume are permanently cancelled.
 </p>
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Global ETS Comparison
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 {["System", "Region", "Year", "Price", "GHG Coverage", "Sectors", "Status"].map((h) => (
 <th key={h} className="text-left py-2 px-3 text-muted-foreground font-medium">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {ETS_SYSTEMS.map((ets, i) => (
 <tr key={i} className="border-b border-border/60 hover:bg-muted/30">
 <td className="py-2 px-3 text-foreground font-medium">{ets.name}</td>
 <td className="py-2 px-3 text-muted-foreground">{ets.region}</td>
 <td className="py-2 px-3 text-muted-foreground">{ets.launched}</td>
 <td className="py-2 px-3 text-emerald-400 font-mono">{ets.price}</td>
 <td className="py-2 px-3 text-muted-foreground">{ets.coverage}</td>
 <td className="py-2 px-3 text-muted-foreground">{ets.sectors}</td>
 <td className="py-2 px-3 text-muted-foreground">{ets.phase}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground">EU ETS Sectoral Coverage</CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 {sectorCoverage.map((sec) => (
 <div key={sec.name} className="space-y-1">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">{sec.name}</span>
 <span className="text-muted-foreground">{sec.pct}%</span>
 </div>
 <div className="h-2 bg-muted rounded-full overflow-hidden">
 <motion.div initial={{ width: 0 }} animate={{ width: `${sec.pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full rounded-full" style={{ backgroundColor: sec.color }} />
 </div>
 </div>
 ))}
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground">Key Policy Mechanisms</CardTitle>
 </CardHeader>
 <CardContent className="space-y-3 text-xs text-muted-foreground">
 {[
 { label: "Free Allocation", desc: "Given to carbon-leakage-risk industries (cement, steel, chemicals). Being phased out 2026-34 alongside CBAM." },
 { label: "CBAM (Carbon Border Adjustment)", desc: "From 2026, importers of steel/cement/aluminium/fertilisers must buy CBAM certificates at EUA price." },
 { label: "EUA Futures Market", desc: "ICE exchange hosts most EUA futures liquidity. Dec expiry contract is benchmark; daily volume ~35-50M EUAs." },
 { label: "Carbon Leakage Risk", desc: "Risk that ETS pushes production to non-regulated regions. High-risk sectors receive benchmark-based free allocation." },
 { label: "ETS Linking", desc: "EU-Swiss ETS linked 2020. California-Quebec linked since 2014. Linked systems share one carbon price." },
 ].map((item) => (
 <div key={item.label} className="border-l-2 border-indigo-600 pl-3">
 <div className="text-foreground font-medium mb-0.5">{item.label}</div>
 <div className="text-muted-foreground">{item.desc}</div>
 </div>
 ))}
 </CardContent>
 </Card>
 </div>
 </div>
 );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2: Voluntary Carbon Markets
// ══════════════════════════════════════════════════════════════════════════════
function VoluntaryTab() {
 const vcmVsCompliance = [
 { aspect: "Purpose", voluntary: "Corporate net-zero pledges", compliance: "Legal regulatory requirement" },
 { aspect: "Buyers", voluntary: "Companies, individuals", compliance: "Industrial emitters under cap" },
 { aspect: "Standards", voluntary: "Verra, Gold Standard, ACR", compliance: "Government regulations" },
 { aspect: "Price range", voluntary: "$3-50/tCO2", compliance: "$12-100+/tCO2" },
 { aspect: "Verification", voluntary: "Third-party (SCS, DNV, BV)", compliance: "Regulatory/government" },
 { aspect: "Fungibility", voluntary: "Limited (project-specific)", compliance: "Fully fungible within system" },
 { aspect: "Retirement", voluntary: "Permanent registry cancellation", compliance: "Annual surrender to regulator" },
 ];

 return (
 <div className="space-y-4">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <StatChip label="VCM Size 2023" value="$2.0B" color="text-emerald-400" />
 <StatChip label="VCM Target 2030" value="$50B" color="text-foreground" />
 <StatChip label="Credits Retired 2023" value="195Mt" color="text-amber-400" />
 <StatChip label="REDD+ Share" value="~30%" color="text-green-400" />
 </div>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Carbon Credit Lifecycle
 </CardTitle>
 </CardHeader>
 <CardContent>
 <CreditLifecycleSVG />
 <div className="grid grid-cols-5 gap-2 mt-3 text-center text-xs text-muted-foreground">
 {["Design PDD, baseline study, registry enrollment", "Measure, Report, Verify actual reductions", "Accredited auditor confirms claims", "Registry issues unique serial numbers", "Buyer cancels credit; removes from circulation"].map((d, i) => (
 <div key={i}>{d}</div>
 ))}
 </div>
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Carbon Credit Price Range by Project Type ($/tCO2)
 </CardTitle>
 </CardHeader>
 <CardContent>
 <CreditPriceChart />
 <p className="text-xs text-muted-foreground mt-2">
 Prices vary widely by co-benefits, project type, vintage, and standard. Blue carbon and high-quality nature-based solutions command premiums. Commodity renewable energy credits trade near floor prices.
 </p>
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground">VCM vs Compliance Market Comparison</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left py-2 px-3 text-muted-foreground">Aspect</th>
 <th className="text-left py-2 px-3 text-emerald-400">Voluntary (VCM)</th>
 <th className="text-left py-2 px-3 text-foreground">Compliance (ETS)</th>
 </tr>
 </thead>
 <tbody>
 {vcmVsCompliance.map((row, i) => (
 <tr key={i} className="border-b border-border/60 hover:bg-muted/30">
 <td className="py-2 px-3 text-muted-foreground font-medium">{row.aspect}</td>
 <td className="py-2 px-3 text-muted-foreground">{row.voluntary}</td>
 <td className="py-2 px-3 text-muted-foreground">{row.compliance}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {VCM_STANDARDS.map((std) => (
 <div key={std.name} className="border border-border rounded-lg p-4 bg-card">
 <div className="flex items-center gap-2 mb-2">
 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: std.color }} />
 <span className="text-sm font-semibold" style={{ color: std.color }}>{std.name}</span>
 <Badge variant="outline" className="text-xs text-muted-foreground ml-auto">{std.founded}</Badge>
 </div>
 <div className="text-xs text-muted-foreground font-medium mb-1">{std.fullName}</div>
 <div className="text-xs text-muted-foreground mb-2">{std.focus}</div>
 <Badge className="text-xs" style={{ backgroundColor: std.color + "22", color: std.color, borderColor: std.color + "44" }}>
 {std.credits} issued
 </Badge>
 </div>
 ))}
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <InfoCard title="Article 6 Paris Agreement -- Corresponding Adjustments">
 <p className="text-muted-foreground">Article 6.4 establishes a UN-supervised carbon market. Credits traded internationally must be accompanied by a Corresponding Adjustment (CA) where the host country adjusts its NDC by the amount exported, preventing double counting.</p>
 <p className="text-muted-foreground mt-2">Credits without CAs can still be used for corporate voluntary claims but cannot count toward national climate targets (ITMOs -- Internationally Transferred Mitigation Outcomes).</p>
 </InfoCard>
 <InfoCard title="ICVCM Core Carbon Principles (CCPs)">
 <ul className="list-disc list-inside space-y-1 text-muted-foreground">
 <li>Effective governance of standard</li>
 <li>Tracking (unique serial numbers)</li>
 <li>Transparency (public disclosure)</li>
 <li>Robust independent third-party validation and verification</li>
 <li>Additionality (reductions would not occur without carbon finance)</li>
 <li>Permanence (durable storage or adequate risk buffer)</li>
 <li>Quantification (conservative, well-established methodologies)</li>
 <li>No net harm, sustainable development, and net mitigation impact</li>
 </ul>
 </InfoCard>
 </div>
 </div>
 );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3: Credit Quality & Integrity
// ══════════════════════════════════════════════════════════════════════════════
function QualityTab() {
 const additionalityTests = [
 { test: "Financial Additionality", desc: "Without carbon revenue, project IRR is below hurdle rate. Common barrier for small renewables where grid parity already achieved.", pass: false },
 { test: "Regulatory Surplus", desc: "Emission reduction must exceed legal requirements. If mandated by law, not additional. Key for industrial efficiency projects.", pass: true },
 { test: "Common Practice Test", desc: "Similar projects without carbon finance are rare. If >20% of sector uses the technology without incentives, fails common practice.", pass: true },
 { test: "Investment Analysis", desc: "Benchmark alternative scenario compared. Carbon revenue must be the deciding factor, not merely beneficial to finances.", pass: false },
 { test: "Barrier Analysis", desc: "Demonstrate credible barriers (financial, technological, social) overcome specifically by carbon finance.", pass: true },
 ];
 const leakageTypes = [
 { type: "Activity Shifting", example: "Protecting forest A causes deforestation at unprotected forest B. REDD+ jurisdictional accounting addresses this.", severity: "High" },
 { type: "Market Leakage", example: "Reducing timber harvest raises timber prices, incentivizing harvest elsewhere. Typically 5-20% leakage deduction applied.", severity: "Medium" },
 { type: "Upstream Leakage", example: "Shutting coal mine reduces supply; other mines increase output. Difficult to quantify; often excluded from project boundaries.", severity: "Medium" },
 { type: "Carbon Leakage (ETS)", example: "Energy-intensive industry relocates from ETS zone to non-ETS region. CBAM mechanism designed to prevent this.", severity: "High" },
 ];

 return (
 <div className="space-y-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Permanence Risk by Project Type (higher bar = riskier)
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 {PERMANENCE_DATA.map((row) => (
 <div key={row.type} className="space-y-1">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">{row.type}</span>
 <span className="text-muted-foreground text-right max-w-[200px]">{row.note}</span>
 </div>
 <div className="h-2 bg-muted rounded-full overflow-hidden">
 <motion.div initial={{ width: 0 }} animate={{ width: `${row.risk}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full rounded-full" style={{ backgroundColor: row.color }} />
 </div>
 </div>
 ))}
 <p className="text-xs text-muted-foreground mt-2">
 Nature-based solutions carry high reversal risk from wildfires, storms, and land-use change. Buffer pools (20-30% of credits withheld) cover reversals.
 </p>
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 The Double Counting Problem
 </CardTitle>
 </CardHeader>
 <CardContent>
 <DoubleCountingSVG />
 <p className="text-xs text-muted-foreground mt-2">
 Without corresponding adjustments, both the host country and credit buyer claim the same emission reduction. Article 6 requires host countries to apply corresponding adjustments to their NDC accounting for any credits exported internationally.
 </p>
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground">Additionality Testing Methods</CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 {additionalityTests.map((test) => (
 <div key={test.test} className="flex gap-3 text-xs text-muted-foreground">
 <div className={cn("mt-0.5 shrink-0", test.pass ? "text-emerald-400" : "text-red-400")}>
 {test.pass ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
 </div>
 <div>
 <div className="text-foreground font-medium">{test.test}</div>
 <div className="text-muted-foreground">{test.desc}</div>
 </div>
 </div>
 ))}
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground">Leakage Types and Mitigation</CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 {leakageTypes.map((lt) => (
 <div key={lt.type} className="border border-border rounded p-3 space-y-1">
 <div className="flex items-center gap-2">
 <span className="text-xs font-medium text-foreground">{lt.type}</span>
 <Badge
 className="text-xs text-muted-foreground ml-auto"
 style={{
 backgroundColor: lt.severity === "High" ? "#f8717122" : "#fb923c22",
 color: lt.severity === "High" ? "#f87171" : "#fb923c",
 borderColor: lt.severity === "High" ? "#f8717144" : "#fb923c44",
 }}
 >
 {lt.severity} Risk
 </Badge>
 </div>
 <div className="text-xs text-muted-foreground">{lt.example}</div>
 </div>
 ))}
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground">Calyx Global Credit Rating Distribution</CardTitle>
 </CardHeader>
 <CardContent className="space-y-2">
 {CALYX_RATINGS.map((r) => (
 <div key={r.rating} className="space-y-1">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="font-mono font-medium" style={{ color: r.color }}>{r.rating}</span>
 <span className="text-muted-foreground">{r.label}</span>
 <span className="text-muted-foreground">{r.pct}% of rated credits</span>
 </div>
 <div className="h-1.5 bg-muted rounded-full overflow-hidden">
 <motion.div initial={{ width: 0 }} animate={{ width: `${r.pct * 4}%` }} transition={{ duration: 0.6, ease: "easeOut" }} className="h-full rounded-full" style={{ backgroundColor: r.color }} />
 </div>
 </div>
 ))}
 <p className="text-xs text-muted-foreground mt-2">
 Only ~20% of VCM credits rated AAA/AA -- highlighting widespread quality concerns. Low-quality credits have faced scrutiny for overstated baselines and inadequate permanence provisions.
 </p>
 </CardContent>
 </Card>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <InfoCard title="Independent Verification Bodies (VVBs)">
 <ul className="list-disc list-inside space-y-1 text-muted-foreground">
 <li><span className="text-muted-foreground font-medium">SCS Global Services</span> -- largest VVB; audits REDD+, agriculture, renewable</li>
 <li><span className="text-muted-foreground font-medium">Bureau Veritas</span> -- global accreditation; strong in industrial projects</li>
 <li><span className="text-muted-foreground font-medium">DNV</span> -- strong in maritime, energy, and Gold Standard projects</li>
 <li><span className="text-muted-foreground font-medium">South Pole / Karbon</span> -- developer-verifier conflicts of interest flagged in press</li>
 </ul>
 <p className="text-muted-foreground mt-2 text-xs">VVBs must be ICROA-approved and accredited under each standard to issue validation/verification statements.</p>
 </InfoCard>
 <InfoCard title="Greenwashing vs Genuine Offsetting">
 <p className="text-muted-foreground">Red flags for greenwashing:</p>
 <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-1">
 <li>Using cheap, low-quality offsets without internal emission reductions</li>
 <li>Claiming "carbon neutral" without scope 3 accounting</li>
 <li>Double-counting before Article 6 CAs established</li>
 <li>Vintage manipulation (selling old, non-additional credits)</li>
 </ul>
 <p className="text-muted-foreground mt-2">Best practice: reduce first (SBTi targets), use high-quality offsets for residuals only, disclose project details, prioritize beyond-value-chain mitigation (BVCM) separately.</p>
 </InfoCard>
 </div>
 </div>
 );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 4: Investment Strategies
// ══════════════════════════════════════════════════════════════════════════════
function InvestmentTab() {
 const arbitrageOps = [
 { desc: "EU-UK price spread", current: "EUR 15-25", note: "Brexit divergence; partial alignment expected on re-linking" },
 { desc: "EU-California spread", current: "EUR 30-35", note: "California price capped by floor/ceiling; structural discount" },
 { desc: "Voluntary premium", current: "+$8-15", note: "AAA-rated NBS vs commodity renewable credits" },
 { desc: "Seasonal basis", current: "Q1 rally", note: "Compliance deadline drives Q1 demand; Q3 often softer" },
 ];
 const politicalRisks = [
 { risk: "Policy Reversal", example: "Australia abolished its carbon tax in 2014. ETS rules can be weakened or cap raised by new governments.", severity: 75 },
 { risk: "Windfall Profit Tax", example: "EU debated capping EUA profits for power generators. Political pressure to suspend carbon pricing during energy crises.", severity: 60 },
 { risk: "Over-Allocation", example: "EU Phase 1 and 2 crashed to near zero. Phase 3 required back-loading 900M allowances to avoid repeat.", severity: 55 },
 { risk: "ETS Expansion Delay", example: "EU buildings and transport ETS (ETS II) delayed to 2027; political pushback on fuel cost pass-through.", severity: 45 },
 { risk: "VCM Regulatory Risk", example: "SEC scrutiny of greenwashing claims; SBTi methodology disputes reducing corporate demand.", severity: 50 },
 ];

 return (
 <div className="space-y-4">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <StatChip label="KRBN YTD" value={fmtPct(-18.3)} sub="Global carbon ETF" color="text-red-400" />
 <StatChip label="EUA vs S&P500 Corr" value="0.12" sub="Low correlation benefit" color="text-foreground" />
 <StatChip label="EUA Roll Yield" value="+2-4%" sub="Contango structure" color="text-emerald-400" />
 <StatChip label="Carbon Beta" value="0.31" sub="vs MSCI World" color="text-foreground" />
 </div>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Carbon Price Forecast Scenarios to 2030 ($/tCO2 equivalent)
 </CardTitle>
 </CardHeader>
 <CardContent>
 <PriceForecastChart />
 <div className="grid grid-cols-3 gap-3 mt-3 text-xs text-muted-foreground">
 <div className="border border-border rounded p-2">
 <div className="text-emerald-400 font-medium">NZE Scenario</div>
 <div className="text-muted-foreground">$250/t by 2030</div>
 <div className="text-muted-foreground">Net Zero Emissions pathway; rapid policy tightening globally</div>
 </div>
 <div className="border border-border rounded p-2">
 <div className="text-amber-400 font-medium">SDS Scenario</div>
 <div className="text-muted-foreground">$150/t by 2030</div>
 <div className="text-muted-foreground">Sustainable Development; Paris-aligned with current pledges</div>
 </div>
 <div className="border border-border rounded p-2">
 <div className="text-muted-foreground font-medium">STEPS Baseline</div>
 <div className="text-muted-foreground">$110/t by 2030</div>
 <div className="text-muted-foreground">Stated policies only; modest tightening of existing systems</div>
 </div>
 </div>
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Carbon-Focused ETFs and Funds
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 {["Ticker", "Name", "AUM", "Exposure", "YTD", "Expense"].map((h) => (
 <th key={h} className="text-left py-2 px-3 text-muted-foreground font-medium">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {CARBON_FUNDS.map((fund, i) => (
 <tr key={i} className="border-b border-border/60 hover:bg-muted/30">
 <td className="py-2 px-3 text-foreground font-mono font-medium">{fund.ticker}</td>
 <td className="py-2 px-3 text-muted-foreground">{fund.name}</td>
 <td className="py-2 px-3 text-muted-foreground">{fund.aum}</td>
 <td className="py-2 px-3 text-muted-foreground">{fund.exposure}</td>
 <td className={cn("py-2 px-3 font-mono", posColor(fund.ytd))}>{fmtPct(fund.ytd)}</td>
 <td className="py-2 px-3 text-muted-foreground">{fund.expense}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground">EUA Futures Market Structure</CardTitle>
 </CardHeader>
 <CardContent className="space-y-3 text-xs text-muted-foreground">
 {[
 { label: "Benchmark Contract", value: "ICE EUA Dec expiry; ~90% market share" },
 { label: "Roll Yield", value: "Typical contango of 2-4% p.a. (cost of carry)" },
 { label: "Seasonal Pattern", value: "Q1 demand surge (compliance deadline); Q3 typically soft" },
 { label: "Market Hours", value: "7:00-17:00 CET; high volume at open/close" },
 { label: "Open Interest", value: "~900M EUAs; dominated by financial investors" },
 { label: "Backwardation Events", value: "Rare; occurred in 2022 energy crisis when spot premiums spiked" },
 { label: "Margin", value: "ICE posts daily VaR-based margin; ~8-12% of notional" },
 ].map((item) => (
 <div key={item.label} className="flex justify-between gap-2">
 <span className="text-muted-foreground">{item.label}</span>
 <span className="text-muted-foreground text-right">{item.value}</span>
 </div>
 ))}
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground">Carbon Arbitrage Opportunities</CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 {arbitrageOps.map((arb, i) => (
 <div key={i} className="border border-border rounded p-2 text-xs text-muted-foreground space-y-1">
 <div className="flex justify-between items-center">
 <span className="text-foreground font-medium">{arb.desc}</span>
 <Badge className="text-xs bg-emerald-900/40 text-emerald-400 border-emerald-700">{arb.current}</Badge>
 </div>
 <div className="text-muted-foreground">{arb.note}</div>
 </div>
 ))}
 </CardContent>
 </Card>
 </div>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Political Risk in Carbon Markets
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 {politicalRisks.map((pr) => (
 <div key={pr.risk} className="space-y-1">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground font-medium">{pr.risk}</span>
 <span className="text-muted-foreground">Risk Score: {pr.severity}/100</span>
 </div>
 <div className="h-1.5 bg-muted rounded-full overflow-hidden">
 <motion.div initial={{ width: 0 }} animate={{ width: `${pr.severity}%` }} transition={{ duration: 0.7, ease: "easeOut" }} className="h-full rounded-full bg-red-500/70" />
 </div>
 <div className="text-xs text-muted-foreground">{pr.example}</div>
 </div>
 ))}
 </CardContent>
 </Card>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <InfoCard title="Physical vs Derivative Carbon Exposure">
 <div className="space-y-2 text-muted-foreground">
 <div><span className="text-foreground font-medium">Physical EUAs</span> -- held in EU Compliance Registry. No roll cost, no counterparty risk. Illiquid. Some ETP managers hold physically (e.g., WisdomTree EUA).</div>
 <div><span className="text-foreground font-medium">Futures (ETFs like KRBN)</span> -- liquid, exchange-traded, subject to roll cost (contango 2-4%/yr). Tracking error vs spot price.</div>
 <div><span className="text-foreground font-medium">Carbon Royalty Companies</span> -- invest in project development rights and receive a royalty on each credit issued. Lower volatility, exposure to VCM growth.</div>
 </div>
 </InfoCard>
 <InfoCard title="2025-2026 Market Outlook">
 <div className="space-y-2 text-muted-foreground text-xs">
 <div><span className="text-foreground font-medium">Bullish factors:</span> ETS II implementation 2027 (buildings/transport), CBAM full enforcement 2026, declining cap under LRF 4.3%, MSR cancellations, expanding China ETS to cement/steel.</div>
 <div><span className="text-foreground font-medium">Bearish risks:</span> Weak industrial output in Europe suppressing demand, political pressure on energy costs, potential ETS reform delay, warm winters reducing power sector demand.</div>
 <div><span className="text-foreground font-medium">Base case:</span> EUA price range EUR 55-80 in 2025-26, with upside breakout above EUR 100 if industrial recovery accelerates and MSR cancellation effect materialises.</div>
 </div>
 </InfoCard>
 </div>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Transition Risk Hedging with Carbon
 </CardTitle>
 </CardHeader>
 <CardContent className="text-xs space-y-3 text-muted-foreground">
 <p>Carbon prices and the transition to a low-carbon economy create systematic risks for carbon-intensive sectors. Investors can hedge transition risk by holding long carbon positions:</p>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
 {[
 { title: "Portfolio Hedge", desc: "Long carbon futures offset losses in carbon-intensive equity holdings when regulation tightens. Positive correlation with policy risk." },
 { title: "Corporate Hedging", desc: "Energy-intensive companies buy EUA forwards to lock in compliance costs and reduce P&L volatility. Airlines hedge 50-70% of expected exposure." },
 { title: "Carbon as Inflation Hedge", desc: "Carbon prices historically rise with energy costs. Low correlation (0.12) with broad equity, positive with commodities. Useful in real-asset portfolios." },
 ].map((item) => (
 <div key={item.title} className="border border-border rounded p-3 space-y-1">
 <div className="text-foreground font-medium">{item.title}</div>
 <div className="text-muted-foreground">{item.desc}</div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>
 );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function CarbonMarketsPage() {
 return (
 <div className="min-h-screen bg-background text-foreground p-4 md:p-4">
 <div className="mb-8 border-l-4 border-l-primary rounded-md bg-card p-6">
 <div className="flex items-center gap-3 mb-2 flex-wrap">
 <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
 </div>
 <div>
 <h1 className="text-xl font-semibold text-foreground">Carbon Markets</h1>
 <p className="text-sm text-muted-foreground">ETS compliance, voluntary credits, quality assessment, and investment strategies</p>
 </div>
 <div className="ml-auto flex gap-2 flex-wrap">
 <Badge className="bg-emerald-900/40 text-emerald-400 border-emerald-700 text-xs">EUA EUR 62/t</Badge>
 <Badge className="bg-muted/60 text-foreground border-border text-xs">VCM $2B market</Badge>
 <Badge className="bg-amber-900/40 text-amber-400 border-amber-700 text-xs">2030 target $150-250/t</Badge>
 </div>
 </div>
 </div>

 <Tabs defaultValue="compliance">
 <TabsList className="bg-transparent border-b border-border/20 rounded-none p-0 h-auto mb-6">
 <TabsTrigger value="compliance" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Compliance Markets
 </TabsTrigger>
 <TabsTrigger value="voluntary" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Voluntary Markets
 </TabsTrigger>
 <TabsTrigger value="quality" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Credit Quality
 </TabsTrigger>
 <TabsTrigger value="investment" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Investment Strategies
 </TabsTrigger>
 </TabsList>

 <TabsContent value="compliance" className="data-[state=inactive]:hidden">
 <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
 <ComplianceTab />
 </motion.div>
 </TabsContent>

 <TabsContent value="voluntary" className="data-[state=inactive]:hidden">
 <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
 <VoluntaryTab />
 </motion.div>
 </TabsContent>

 <TabsContent value="quality" className="data-[state=inactive]:hidden">
 <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
 <QualityTab />
 </motion.div>
 </TabsContent>

 <TabsContent value="investment" className="data-[state=inactive]:hidden">
 <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
 <InvestmentTab />
 </motion.div>
 </TabsContent>
 </Tabs>
 </div>
 );
}
