"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
 Shield,
 AlertTriangle,
 TrendingDown,
 BarChart3,
 Activity,
 Layers,
 ChevronRight,
 Info,
 RefreshCw,
 Zap,
 Target,
 DollarSign,
 PieChart,
 GitBranch,
 Clock,
 Flame,
 Plus,
 Minus,
} from "lucide-react";

// ---------------------------------------------------------------------------
// mulberry32 seeded PRNG (seed = 5678)
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
 return function () {
 seed |= 0;
 seed = (seed + 0x6d2b79f5) | 0;
 let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
 t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
 return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
 };
}

const rng = mulberry32(5678);

function seededRand(min: number, max: number) {
 return min + rng() * (max - min);
}

// ---------------------------------------------------------------------------
// Portfolio positions
// ---------------------------------------------------------------------------
interface Position {
 ticker: string;
 weight: number; // percentage
 beta: number;
 vol: number; // annualized volatility
 sector: string;
 mktCap: string; // large / mid / small
 adv: number; // average daily volume $M
 color: string;
}

const POSITIONS: Position[] = [
 { ticker: "AAPL", weight: 15, beta: 1.18, vol: 0.28, sector: "Tech", mktCap: "large", adv: 8200, color: "#60a5fa" },
 { ticker: "MSFT", weight: 12, beta: 0.91, vol: 0.24, sector: "Tech", mktCap: "large", adv: 5100, color: "#34d399" },
 { ticker: "GOOGL", weight: 10, beta: 1.05, vol: 0.27, sector: "Tech", mktCap: "large", adv: 3800, color: "#f59e0b" },
 { ticker: "NVDA", weight: 8, beta: 1.92, vol: 0.52, sector: "Tech", mktCap: "large", adv: 9100, color: "#a78bfa" },
 { ticker: "AMZN", weight: 8, beta: 1.29, vol: 0.30, sector: "Tech", mktCap: "large", adv: 4200, color: "#fb923c" },
 { ticker: "TSLA", weight: 5, beta: 2.14, vol: 0.62, sector: "Auto/EV", mktCap: "large", adv: 7300, color: "#f87171" },
 { ticker: "JPM", weight: 7, beta: 1.11, vol: 0.22, sector: "Financials", mktCap: "large", adv: 2900, color: "#38bdf8" },
 { ticker: "JNJ", weight: 6, beta: 0.54, vol: 0.16, sector: "Healthcare", mktCap: "large", adv: 1800, color: "#86efac" },
 { ticker: "GLD", weight: 5, beta: 0.08, vol: 0.14, sector: "Commodities", mktCap: "large", adv: 1200, color: "#fde68a" },
 { ticker: "TLT", weight: 24, beta:-0.23, vol: 0.15, sector: "Bonds", mktCap: "large", adv: 2100, color: "#cbd5e1" },
];

// ---------------------------------------------------------------------------
// Correlation matrix (seeded)
// ---------------------------------------------------------------------------
// Manually specified realistic correlations for 10×10
const BASE_CORR: number[][] = [
 // AAPL MSFT GOOGL NVDA AMZN TSLA JPM JNJ GLD TLT
 [ 1.00, 0.82, 0.79, 0.68, 0.72, 0.52, 0.38, 0.14,-0.08,-0.22], // AAPL
 [ 0.82, 1.00, 0.81, 0.65, 0.75, 0.48, 0.41, 0.18,-0.06,-0.25], // MSFT
 [ 0.79, 0.81, 1.00, 0.60, 0.78, 0.45, 0.37, 0.12,-0.07,-0.21], // GOOGL
 [ 0.68, 0.65, 0.60, 1.00, 0.58, 0.61, 0.29, 0.05,-0.10,-0.18], // NVDA
 [ 0.72, 0.75, 0.78, 0.58, 1.00, 0.49, 0.36, 0.10,-0.05,-0.20], // AMZN
 [ 0.52, 0.48, 0.45, 0.61, 0.49, 1.00, 0.24, 0.02,-0.12,-0.14], // TSLA
 [ 0.38, 0.41, 0.37, 0.29, 0.36, 0.24, 1.00, 0.32,-0.03,-0.35], // JPM
 [ 0.14, 0.18, 0.12, 0.05, 0.10, 0.02, 0.32, 1.00, 0.08,-0.12], // JNJ
 [ -0.08,-0.06, -0.07, -0.10,-0.05,-0.12,-0.03, 0.08, 1.00, 0.21], // GLD
 [ -0.22,-0.25, -0.21, -0.18,-0.20,-0.14,-0.35,-0.12, 0.21, 1.00], // TLT
];

const CRISIS_CORR: number[][] = BASE_CORR.map((row, i) =>
 row.map((v, j) => {
 if (i === j) return 1.0;
 // bonds & gold retain low corr; equities spike to 0.85+
 const iEquity = i < 6;
 const jEquity = j < 6;
 if (iEquity && jEquity) return Math.min(0.95, 0.85 + (v > 0.5 ? 0.05 : 0.02));
 if (v < 0) return v * 1.3; // negative corr deepens slightly
 return v * 0.9;
 })
);

// Correlation explanations for notable pairs
const CORR_EXPLANATIONS: Record<string, string> = {
 "AAPL-MSFT": "Both large-cap tech growth stocks with high institutional ownership and similar macro sensitivities (rates, USD). FAANG cohort effect drives correlation to 0.82.",
 "AAPL-NVDA": "Both tech sector but NVDA has far higher beta (1.92) and AI-cycle exposure. Sector overlap drives correlation; product cycle differences cap it at 0.68.",
 "AAPL-TLT": "Classic risk-on/risk-off relationship. When risk appetite falls, money rotates from growth equities into long-duration Treasuries. Correlation is -0.22.",
 "TSLA-NVDA": "High-beta, high-vol momentum names. Both benefit from AI/EV narratives and retail investor flows, driving correlation to 0.61 despite different industries.",
 "GLD-TLT": "Both safe-haven assets but driven by different forces (inflation vs deflation). Mild positive correlation 0.21 — gold hedges inflation, bonds hedge recession.",
 "JPM-TLT": "Bank earnings benefit from steeper yield curve, which hurts long-duration bonds. Structural negative correlation -0.35, the strongest in this portfolio.",
 "JNJ-TSLA": "Nearly uncorrelated (0.02). JNJ is defensive healthcare with stable cash flows; TSLA is high-vol growth. Owning both provides meaningful diversification.",
};

// ---------------------------------------------------------------------------
// Risk metrics
// ---------------------------------------------------------------------------
function computePortfolioBeta(): number {
 return POSITIONS.reduce((acc, p) => acc + p.beta * (p.weight / 100), 0);
}

function computePortfolioVol(): number {
 // simplified: weighted sum + correlation adjustment
 let varSum = 0;
 for (let i = 0; i < POSITIONS.length; i++) {
 for (let j = 0; j < POSITIONS.length; j++) {
 const wi = POSITIONS[i].weight / 100;
 const wj = POSITIONS[j].weight / 100;
 varSum += wi * wj * POSITIONS[i].vol * POSITIONS[j].vol * BASE_CORR[i][j];
 }
 }
 return Math.sqrt(varSum);
}

function computeAvgCorrelation(): number {
 let sum = 0;
 let count = 0;
 for (let i = 0; i < 10; i++) {
 for (let j = i + 1; j < 10; j++) {
 sum += BASE_CORR[i][j];
 count++;
 }
 }
 return sum / count;
}

function computeConcentrationRisk(): number {
 const sorted = [...POSITIONS].sort((a, b) => b.weight - a.weight);
 return sorted.slice(0, 3).reduce((s, p) => s + p.weight, 0);
}

function computeLiquidityScore(): number {
 // % of portfolio tradeable in 1 day without >0.1% market impact
 // assume 1% of ADV can be traded impact-free; portfolio = $100k notional
 const portfolioSize = 100000;
 let liquidPct = 0;
 for (const p of POSITIONS) {
 const posSize = portfolioSize * (p.weight / 100);
 const onePctAdv = p.adv * 1e6 * 0.01;
 if (posSize <= onePctAdv) liquidPct += p.weight;
 }
 return liquidPct;
}

function computeExpectedShortfall(): number {
 const vol = computePortfolioVol();
 // ES at 95% = vol * 2.063 (for normal distribution)
 return vol * 2.063 * 100; // as percentage
}

function computeOverallRiskScore(
 concentration: number,
 avgCorr: number,
 beta: number,
 liquidity: number,
 es: number
): number {
 const concScore = Math.min(100, (concentration / 60) * 100);
 const corrScore = Math.min(100, ((avgCorr + 0.3) / 1.3) * 100);
 const betaScore = Math.min(100, (Math.abs(beta - 1) / 1.5) * 100 + 20);
 const liqScore = Math.max(0, 100 - liquidity);
 const esScore = Math.min(100, (es / 20) * 100);
 return Math.round((concScore * 0.2 + corrScore * 0.2 + betaScore * 0.25 + liqScore * 0.15 + esScore * 0.2));
}

// ---------------------------------------------------------------------------
// Generate 3-year drawdown data
// ---------------------------------------------------------------------------
function generateDrawdownData() {
 const portfolioRng = mulberry32(5678 + 1);
 const benchmarkRng = mulberry32(5678 + 2);
 const days = 756; // ~3 years of trading days
 const portReturns: number[] = [];
 const benchReturns: number[] = [];

 // Inject crash periods
 const crashes: { start: number; end: number; severity: number }[] = [
 { start: 20, end: 40, severity: -0.018 }, // early dip
 { start: 120, end: 180, severity: -0.025 }, // major drawdown 1
 { start: 320, end: 400, severity: -0.022 }, // drawdown 2
 { start: 500, end: 530, severity: -0.012 }, // minor
 { start: 650, end: 720, severity: -0.030 }, // worst
 ];

 for (let d = 0; d < days; d++) {
 let portBase = 0.0003 + (portfolioRng() - 0.5) * 0.015;
 let benchBase = 0.0004 + (benchmarkRng() - 0.5) * 0.013;
 for (const crash of crashes) {
 if (d >= crash.start && d <= crash.end) {
 portBase += crash.severity;
 benchBase += crash.severity * 0.85;
 }
 }
 portReturns.push(portBase);
 benchReturns.push(benchBase);
 }

 // Compute cumulative and underwater
 const portCum = [1];
 const benchCum = [1];
 for (let i = 0; i < days; i++) {
 portCum.push(portCum[portCum.length - 1] * (1 + portReturns[i]));
 benchCum.push(benchCum[benchCum.length - 1] * (1 + benchReturns[i]));
 }

 const portDD: number[] = [];
 const benchDD: number[] = [];
 let portPeak = portCum[0];
 let benchPeak = benchCum[0];
 for (let i = 0; i <= days; i++) {
 portPeak = Math.max(portPeak, portCum[i]);
 benchPeak = Math.max(benchPeak, benchCum[i]);
 portDD.push(((portCum[i] - portPeak) / portPeak) * 100);
 benchDD.push(((benchCum[i] - benchPeak) / benchPeak) * 100);
 }

 const maxPortDD = Math.min(...portDD);
 const maxBenchDD = Math.min(...benchDD);
 const paintIndex = -portDD.reduce((s, v) => s + v, 0) / days;
 const annReturn = ((portCum[days] - 1) / 3) * 100;
 const calmar = annReturn / Math.abs(maxPortDD);

 return { portDD, benchDD, maxPortDD, maxBenchDD, paintIndex, calmar, annReturn, days };
}

// ---------------------------------------------------------------------------
// Historical scenarios
// ---------------------------------------------------------------------------
interface Scenario {
 name: string;
 year: string;
 equityShock: number; // % change on equity positions
 rateShock: number; // % change on bond positions (negative = price down)
 volSpike: number; // VIX spike
 impact: number; // total portfolio impact %
 worstPositions: string[];
 cause: string;
}

const SCENARIOS: Scenario[] = [
 {
 name: "2008 Financial Crisis",
 year: "Sep 2008",
 equityShock: -38,
 rateShock: +15, // flight to quality
 volSpike: 80,
 impact: -22.4,
 worstPositions: ["TSLA-era equiv", "JPM", "AAPL", "NVDA"],
 cause: "Subprime mortgage collapse; Lehman Brothers failed; global credit freeze",
 },
 {
 name: "COVID-19 Crash",
 year: "Feb–Mar 2020",
 equityShock: -34,
 rateShock: +12,
 volSpike: 82,
 impact: -18.9,
 worstPositions: ["TSLA", "NVDA", "AMZN", "AAPL"],
 cause: "Pandemic fear triggered fastest bear market in history — 33 days peak to trough",
 },
 {
 name: "2022 Rate Shock",
 year: "Jan–Oct 2022",
 equityShock: -25,
 rateShock: -15, // bonds crushed as rates rose
 volSpike: 36,
 impact: -22.1,
 worstPositions: ["TLT", "NVDA", "TSLA", "GOOGL"],
 cause: "Fed hiked 425bps in 12 months; growth multiples compressed; bonds worst since 1788",
 },
 {
 name: "Dot-com Bust 2000–02",
 year: "Mar 2000",
 equityShock: -49,
 rateShock: +18,
 volSpike: 45,
 impact: -28.4,
 worstPositions: ["NVDA", "GOOGL-equiv", "AMZN", "MSFT"],
 cause: "Nasdaq lost 78% from peak; speculative tech valuations unwound over 2.5 years",
 },
 {
 name: "1987 Black Monday",
 year: "Oct 19, 1987",
 equityShock: -22,
 rateShock: +5,
 volSpike: 150,
 impact: -12.8,
 worstPositions: ["AAPL", "MSFT", "JPM", "AMZN-equiv"],
 cause: "Portfolio insurance strategies amplified selling; -22.6% in a single session",
 },
 {
 name: "1994 Bond Massacre",
 year: "Feb–Dec 1994",
 equityShock: -3,
 rateShock: -10,
 volSpike: 18,
 impact: -5.2,
 worstPositions: ["TLT", "JPM", "JNJ"],
 cause: "Surprise Fed rate hike from 3% to 5.5%; bond market lost $1.5 trillion in value",
 },
 {
 name: "Asian Financial Crisis",
 year: "Jul 1997",
 equityShock: -15,
 rateShock: +8,
 volSpike: 38,
 impact: -7.6,
 worstPositions: ["TSLA-equiv", "NVDA", "GLD"],
 cause: "Currency pegs collapsed across Asia; EM equities fell 50%+; contagion to Russia",
 },
 {
 name: "9/11 Terrorist Attacks",
 year: "Sep 11, 2001",
 equityShock: -12,
 rateShock: +7,
 volSpike: 42,
 impact: -6.5,
 worstPositions: ["AMZN-equiv", "MSFT", "AAPL-equiv"],
 cause: "Markets closed 4 days; -12% on reopening; recovery took weeks as uncertainty persisted",
 },
 {
 name: "Flash Crash 2010",
 year: "May 6, 2010",
 equityShock: -10,
 rateShock: +3,
 volSpike: 40,
 impact: -4.8,
 worstPositions: ["AAPL", "GOOGL", "AMZN"],
 cause: "Algorithmic selling triggered cascade; Dow dropped 1000 pts in minutes then recovered",
 },
 {
 name: "SVB Bank Run 2023",
 year: "Mar 2023",
 equityShock: -8,
 rateShock: +6,
 volSpike: 26,
 impact: -3.4,
 worstPositions: ["JPM", "TLT", "GLD"],
 cause: "Silicon Valley Bank failed; FDIC takeover; regional bank contagion spread to First Republic",
 },
];

// Pre-compute impacts using portfolio weights
function computeScenarioImpact(scenario: Scenario): number {
 let impact = 0;
 for (const p of POSITIONS) {
 if (p.sector === "Bonds") {
 impact += (p.weight / 100) * scenario.rateShock;
 } else if (p.sector === "Commodities") {
 impact += (p.weight / 100) * (scenario.equityShock * 0.3);
 } else {
 const betaAdj = Math.min(2.5, Math.max(0.5, p.beta));
 impact += (p.weight / 100) * scenario.equityShock * betaAdj * 0.85;
 }
 }
 return Math.round(impact * 10) / 10;
}

// ---------------------------------------------------------------------------
// SVG Components
// ---------------------------------------------------------------------------

/** Gauge / arc meter */
function ArcGauge({
 value,
 max = 100,
 color,
 size = 80,
 strokeWidth = 8,
}: {
 value: number;
 max?: number;
 color: string;
 size?: number;
 strokeWidth?: number;
}) {
 const r = (size - strokeWidth) / 2;
 const cx = size / 2;
 const cy = size / 2;
 const startAngle = -220;
 const sweepAngle = 260;
 const pct = Math.min(1, Math.max(0, value / max));
 const angle = startAngle + sweepAngle * pct;

 function polar(deg: number, radius: number) {
 const rad = (deg * Math.PI) / 180;
 return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
 }

 function describeArc(startDeg: number, endDeg: number, r: number) {
 const s = polar(startDeg, r);
 const e = polar(endDeg, r);
 const largeArc = endDeg - startDeg > 180 ? 1 : 0;
 return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
 }

 const trackPath = describeArc(startAngle, startAngle + sweepAngle, r);
 const fillPath = pct > 0 ? describeArc(startAngle, angle, r) : "";

 return (
 <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
 <path d={trackPath} fill="none" stroke="#1e293b" strokeWidth={strokeWidth} strokeLinecap="round" />
 {pct > 0 && (
 <path d={fillPath} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
 )}
 </svg>
 );
}

/** Horizontal meter bar */
function MeterBar({
 value,
 max,
 color,
 height = 6,
}: {
 value: number;
 max: number;
 color: string;
 height?: number;
}) {
 const pct = Math.min(100, Math.max(0, (value / max) * 100));
 return (
 <div className="w-full bg-muted rounded-full overflow-hidden" style={{ height }}>
 <div
 className="h-full rounded-full transition-colors duration-300"
 style={{ width: `${pct}%`, backgroundColor: color }}
 />
 </div>
 );
}

/** Correlation heatmap cell color: red=-1, white=0, green=1 */
function corrColor(v: number): string {
 if (v >= 0) {
 const g = Math.round(255 * v);
 const r = Math.round(255 * (1 - v));
 return `rgb(${r},${g + 100 > 255 ? 255 : g + 80},${r})`;
 } else {
 const abs = Math.abs(v);
 const r = Math.round(180 + 75 * abs);
 const gb = Math.round(255 * (1 - abs));
 return `rgb(${r},${gb},${gb})`;
 }
}

/** Underwater drawdown plot SVG */
function DrawdownChart({
 portDD,
 benchDD,
 days,
}: {
 portDD: number[];
 benchDD: number[];
 days: number;
}) {
 const W = 700;
 const H = 200;
 const pad = { l: 48, r: 12, t: 10, b: 24 };
 const gW = W - pad.l - pad.r;
 const gH = H - pad.t - pad.b;

 const minDD = Math.min(...portDD, ...benchDD) * 1.05;

 function xPos(i: number) {
 return pad.l + (i / days) * gW;
 }
 function yPos(v: number) {
 return pad.t + gH - (v / minDD) * gH;
 }

 function makePath(data: number[]) {
 return data
 .map((v, i) => `${i === 0 ? "M" : "L"} ${xPos(i).toFixed(1)} ${yPos(v).toFixed(1)}`)
 .join("");
 }

 function makeAreaPath(data: number[]) {
 const linePts = data.map((v, i) => `${xPos(i).toFixed(1)} ${yPos(v).toFixed(1)}`).join(" L ");
 const base = yPos(0);
 return `M ${xPos(0)} ${base} L ${linePts} L ${xPos(days)} ${base} Z`;
 }

 const yTicks = [0, -5, -10, -15, -20, -25].filter(v => v >= minDD);

 // Worst drawdown periods (matching crash definitions)
 const worstPeriods = [
 { start: 20, end: 40, label: "Q1 dip" },
 { start: 120, end: 180, label: "Bear period 1" },
 { start: 320, end: 400, label: "Bear period 2" },
 { start: 500, end: 530, label: "Mini crash" },
 { start: 650, end: 720, label: "Worst DD" },
 ];

 return (
 <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
 {/* Background */}
 <rect x={pad.l} y={pad.t} width={gW} height={gH} fill="#0f172a" rx="4" />

 {/* Worst period highlights */}
 {worstPeriods.map((p) => (
 <rect
 key={p.label}
 x={xPos(p.start)}
 y={pad.t}
 width={xPos(p.end) - xPos(p.start)}
 height={gH}
 fill="rgba(239,68,68,0.07)"
 />
 ))}

 {/* Y-axis ticks */}
 {yTicks.map((v) => (
 <g key={v}>
 <line
 x1={pad.l}
 y1={yPos(v)}
 x2={pad.l + gW}
 y2={yPos(v)}
 stroke="#1e293b"
 strokeWidth="1"
 strokeDasharray="4,4"
 />
 <text x={pad.l - 4} y={yPos(v) + 4} textAnchor="end" fontSize="9" fill="#64748b">
 {v}%
 </text>
 </g>
 ))}

 {/* Benchmark area (behind) */}
 <path d={makeAreaPath(benchDD)} fill="rgba(100,116,139,0.12)" />
 <path d={makePath(benchDD)} fill="none" stroke="#475569" strokeWidth="1.2" />

 {/* Portfolio area */}
 <path d={makeAreaPath(portDD)} fill="rgba(239,68,68,0.18)" />
 <path d={makePath(portDD)} fill="none" stroke="#ef4444" strokeWidth="1.8" />

 {/* Zero line */}
 <line x1={pad.l} y1={yPos(0)} x2={pad.l + gW} y2={yPos(0)} stroke="#334155" strokeWidth="1" />

 {/* Period labels */}
 {worstPeriods.map((p) => {
 const mx = xPos((p.start + p.end) / 2);
 const mv = Math.min(...portDD.slice(p.start, p.end + 1));
 return (
 <text key={p.label + "l"} x={mx} y={yPos(mv) - 4} textAnchor="middle" fontSize="8" fill="#f87171">
 {p.label}
 </text>
 );
 })}

 {/* Legend */}
 <g transform={`translate(${pad.l + 8}, ${pad.t + 8})`}>
 <line x1="0" y1="0" x2="16" y2="0" stroke="#ef4444" strokeWidth="2" />
 <text x="20" y="4" fontSize="9" fill="#94a3b8">Portfolio</text>
 <line x1="60" y1="0" x2="76" y2="0" stroke="#475569" strokeWidth="1.5" />
 <text x="80" y="4" fontSize="9" fill="#94a3b8">S&P 500</text>
 </g>

 {/* X-axis */}
 {[0, 0.25, 0.5, 0.75, 1].map((t) => (
 <text
 key={t}
 x={pad.l + t * gW}
 y={H - 6}
 textAnchor="middle"
 fontSize="9"
 fill="#475569"
 >
 {t === 0 ? "3Y ago" : t === 1 ? "Now" : `${Math.round((1 - t) * 3)}Y`}
 </text>
 ))}
 </svg>
 );
}

/** Scenario impact bar chart */
function ScenarioBarChart({ impacts }: { impacts: number[] }) {
 const W = 680;
 const H = 200;
 const pad = { l: 12, r: 12, t: 10, b: 8 };
 const gW = W - pad.l - pad.r;
 const gH = H - pad.t - pad.b;
 const n = impacts.length;
 const barW = gW / n - 4;
 const minImpact = Math.min(...impacts) * 1.1;

 function xPos(i: number) {
 return pad.l + i * (gW / n) + 2;
 }
 function barH(v: number) {
 return (Math.abs(v) / Math.abs(minImpact)) * gH;
 }

 return (
 <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
 {/* Zero line */}
 <line x1={pad.l} y1={pad.t} x2={pad.l + gW} y2={pad.t} stroke="#334155" strokeWidth="1" />

 {impacts.map((v, i) => {
 const color = v > -10 ? "#f59e0b" : v > -20 ? "#f97316" : "#ef4444";
 const bh = barH(v);
 return (
 <rect
 key={i}
 x={xPos(i)}
 y={pad.t}
 width={barW}
 height={bh}
 fill={color}
 fillOpacity={0.85}
 rx="2"
 />
 );
 })}

 {impacts.map((v, i) => (
 <text
 key={i}
 x={xPos(i) + barW / 2}
 y={pad.t + barH(v) + 12}
 textAnchor="middle"
 fontSize="9"
 fill="#94a3b8"
 >
 {v.toFixed(1)}%
 </text>
 ))}
 </svg>
 );
}

// ---------------------------------------------------------------------------
// Dendrogram cluster visualization (simplified tree)
// ---------------------------------------------------------------------------
function DendrogramChart() {
 const W = 680;
 const H = 160;
 const tickers = POSITIONS.map((p) => p.ticker);
 // Clusters: Tech (0-4), High Beta (3,5), Financials (6), Defensive (7-9)
 const clusters = [
 { label: "Tech Core", members: [0, 1, 2, 4], color: "#60a5fa" },
 { label: "High Beta", members: [3, 5], color: "#a78bfa" },
 { label: "Financials", members: [6], color: "#38bdf8" },
 { label: "Defensive", members: [7, 8, 9], color: "#34d399" },
 ];

 const xStep = W / (tickers.length + 1);

 return (
 <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
 {/* Ticker labels at bottom */}
 {tickers.map((t, i) => (
 <text
 key={t}
 x={(i + 1) * xStep}
 y={H - 4}
 textAnchor="middle"
 fontSize="10"
 fill="#94a3b8"
 >
 {t}
 </text>
 ))}

 {/* Vertical stems */}
 {tickers.map((_, i) => (
 <line
 key={i}
 x1={(i + 1) * xStep}
 y1={H - 18}
 x2={(i + 1) * xStep}
 y2={H - 18 - 30}
 stroke="#334155"
 strokeWidth="1"
 />
 ))}

 {/* Cluster brackets */}
 {clusters.map((c) => {
 const xs = c.members.map((m) => (m + 1) * xStep);
 const minX = Math.min(...xs);
 const maxX = Math.max(...xs);
 const midX = (minX + maxX) / 2;
 const y1 = H - 18 - 30;
 const y2 = y1 - 35;
 const y3 = y2 - 20;
 return (
 <g key={c.label}>
 {/* Horizontal bracket line */}
 <line x1={minX} y1={y1} x2={maxX} y2={y1} stroke={c.color} strokeWidth="1.5" />
 {/* Vertical up */}
 <line x1={midX} y1={y1} x2={midX} y2={y2} stroke={c.color} strokeWidth="1.5" />
 {/* Cluster label */}
 <rect x={midX - 32} y={y3 - 10} width={64} height={14} fill="#0f172a" rx="3" />
 <text x={midX} y={y3} textAnchor="middle" fontSize="9" fill={c.color} fontWeight="600">
 {c.label}
 </text>
 </g>
 );
 })}

 {/* Root join */}
 <line x1={3 * xStep} y1={H - 18 - 30 - 35} x2={8.5 * xStep} y2={H - 18 - 30 - 35} stroke="#475569" strokeWidth="1" strokeDasharray="3,3" />
 </svg>
 );
}

// ---------------------------------------------------------------------------
// Kelly Criterion computation
// ---------------------------------------------------------------------------
function computeKelly(winRate: number, avgGain: number, avgLoss: number): number {
 if (avgLoss === 0) return 0;
 return winRate * (avgGain / avgLoss) - (1 - winRate);
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function RiskIntelPage() {
 // Risk overview state
 const [activeTab, setActiveTab] = useState("overview");

 // Correlation matrix state
 const [crisisMode, setCrisisMode] = useState(false);
 const [selectedCell, setSelectedCell] = useState<{ i: number; j: number } | null>(null);

 // Scenario state
 const [customEquity, setCustomEquity] = useState([-20]);
 const [customRate, setCustomRate] = useState([0]);
 const [customVol, setCustomVol] = useState([20]);
 const [customSpread, setCustomSpread] = useState([100]);
 const [selectedScenario, setSelectedScenario] = useState<number | null>(null);

 // Kelly state
 const [winRate, setWinRate] = useState([55]);
 const [avgGain, setAvgGain] = useState([8]);
 const [avgLoss, setAvgLoss] = useState([5]);
 const [kellyFraction, setKellyFraction] = useState<"full" | "half" | "quarter">("half");

 // What-if new position
 const [newTicker, setNewTicker] = useState("META");
 const [newWeight, setNewWeight] = useState([5]);
 const [newBeta, setNewBeta] = useState([1.4]);

 // Computed metrics
 const metrics = useMemo(() => {
 const concentration = computeConcentrationRisk();
 const avgCorr = computeAvgCorrelation();
 const beta = computePortfolioBeta();
 const liquidity = computeLiquidityScore();
 const es = computeExpectedShortfall();
 const overall = computeOverallRiskScore(concentration, avgCorr, beta, liquidity, es);
 return { concentration, avgCorr, beta, liquidity, es, overall };
 }, []);

 const ddData = useMemo(() => generateDrawdownData(), []);

 const scenarioImpacts = useMemo(
 () => SCENARIOS.map((s) => computeScenarioImpact(s)),
 []
 );

 const corrMatrix = crisisMode ? CRISIS_CORR : BASE_CORR;

 // Custom scenario impact
 const customImpact = useMemo(() => {
 let impact = 0;
 for (const p of POSITIONS) {
 if (p.sector === "Bonds") {
 impact += (p.weight / 100) * (customRate[0] * -0.8); // rate up = bond price down
 } else if (p.sector === "Commodities") {
 impact += (p.weight / 100) * (customEquity[0] * 0.25 + customVol[0] * 0.1);
 } else {
 impact += (p.weight / 100) * customEquity[0] * Math.min(2.5, p.beta);
 }
 }
 // credit spread impact on equities
 impact += (customSpread[0] / 500) * -5;
 return Math.round(impact * 10) / 10;
 }, [customEquity, customRate, customVol, customSpread]);

 const kelly = useMemo(() => {
 const k = computeKelly(winRate[0] / 100, avgGain[0] / 100, avgLoss[0] / 100);
 const fractionMult = kellyFraction === "full" ? 1 : kellyFraction === "half" ? 0.5 : 0.25;
 return { raw: k, adjusted: k * fractionMult };
 }, [winRate, avgGain, avgLoss, kellyFraction]);

 // What-if portfolio metrics
 const whatIfMetrics = useMemo(() => {
 const adjWeight = newWeight[0];
 const scaleFactor = (100 - adjWeight) / 100;
 let newBeta_ = 0;
 for (const p of POSITIONS) {
 newBeta_ += (p.weight / 100) * scaleFactor * p.beta;
 }
 newBeta_ += (adjWeight / 100) * newBeta[0];

 let newConc = 0;
 const weights = POSITIONS.map((p) => p.weight * scaleFactor);
 weights.push(adjWeight);
 const sortedW = [...weights].sort((a, b) => b - a);
 newConc = sortedW.slice(0, 3).reduce((s, v) => s + v, 0);

 return { beta: Math.round(newBeta_ * 100) / 100, concentration: Math.round(newConc * 10) / 10 };
 }, [newWeight, newBeta]);

 // Risk color helper
 function riskColor(score: number) {
 if (score <= 40) return "#22c55e";
 if (score <= 70) return "#f59e0b";
 return "#ef4444";
 }

 // Correlation cell key for explanation lookup
 const corrKey = selectedCell
 ? [POSITIONS[selectedCell.i].ticker, POSITIONS[selectedCell.j].ticker].sort().join("-")
 : null;
 const corrExplanation = corrKey ? CORR_EXPLANATIONS[corrKey] : null;

 return (
 <div className="min-h-screen bg-background text-foreground p-4 lg:p-4">
 {/* Page header */}
 <div
 className="mb-6"
 >
 <div className="flex items-center gap-3 mb-1">
 <div className="p-2 bg-red-500/5 rounded-lg">
 </div>
 <h1 className="text-2xl font-semibold tracking-tight">Portfolio Risk Intelligence</h1>
 <Badge variant="outline" className="text-xs text-muted-foreground border-border ml-auto">
 10-position portfolio · $100k notional
 </Badge>
 </div>
 <p className="text-muted-foreground text-sm ml-11">
 Comprehensive risk analytics: concentration, correlation, drawdown, stress testing &amp; position sizing
 </p>
 </div>

 <Tabs value={activeTab} onValueChange={setActiveTab}>
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto mb-6">
 {[
 { id: "overview", label: "Risk Overview" },
 { id: "correlation",label: "Correlation" },
 { id: "drawdown", label: "Drawdown" },
 { id: "scenarios", label: "Scenario Analysis" },
 { id: "sizing", label: "Position Sizing" },
 ].map(({ id, label }) => (
 <TabsTrigger
 key={id}
 value={id}
 className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground"
 >
 {label}
 </TabsTrigger>
 ))}
 </TabsList>

 {/* ================================================================
 TAB 1: Risk Overview
 ================================================================ */}
 <TabsContent value="overview" className="data-[state=inactive]:hidden">
 <div
 className="space-y-4"
 >
 {/* Overall score banner */}
 <Card className="bg-card border-border border-l-4 border-l-primary">
 <CardContent className="p-4">
 <div className="flex flex-col sm:flex-row items-center gap-3">
 <div className="relative">
 <ArcGauge
 value={metrics.overall}
 max={100}
 color={riskColor(metrics.overall)}
 size={120}
 strokeWidth={12}
 />
 <div className="absolute inset-0 flex flex-col items-center justify-center mt-2">
 <span className="text-lg font-medium" style={{ color: riskColor(metrics.overall) }}>
 {metrics.overall}
 </span>
 <span className="text-xs text-muted-foreground">/ 100</span>
 </div>
 </div>
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-1">
 <h2 className="text-lg font-semibold">Overall Risk Score</h2>
 <Badge
 className="text-xs text-muted-foreground"
 style={{
 backgroundColor: riskColor(metrics.overall) + "22",
 color: riskColor(metrics.overall),
 borderColor: riskColor(metrics.overall) + "44",
 }}
 >
 {metrics.overall <= 40 ? "Low" : metrics.overall <= 70 ? "Moderate" : "High"}
 </Badge>
 </div>
 <p className="text-muted-foreground text-sm mb-3">
 Composite of 5 risk dimensions: concentration, correlation, beta, liquidity &amp; tail risk.
 A score above 70 warrants immediate rebalancing.
 </p>
 <div className="grid grid-cols-5 gap-1">
 {[
 { label: "Conc", val: Math.round((metrics.concentration / 60) * 100) },
 { label: "Corr", val: Math.round(((metrics.avgCorr + 0.3) / 1.3) * 100) },
 { label: "Beta", val: Math.round((Math.abs(metrics.beta - 1) / 1.5) * 100 + 20) },
 { label: "Liq", val: Math.round(Math.max(0, 100 - metrics.liquidity)) },
 { label: "Tail", val: Math.round((metrics.es / 20) * 100) },
 ].map((d) => (
 <div key={d.label} className="text-center">
 <div
 className="text-xs text-muted-foreground font-mono font-semibold"
 style={{ color: riskColor(d.val) }}
 >
 {d.val}
 </div>
 <div className="text-xs text-muted-foreground">{d.label}</div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* 5 Risk metrics */}
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
 {/* 1. Concentration Risk */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Concentration Risk
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4 space-y-3">
 <div className="flex items-end gap-2">
 <span className="text-lg font-medium text-orange-400">{metrics.concentration.toFixed(1)}%</span>
 <span className="text-muted-foreground text-sm mb-1">top-3 holdings</span>
 </div>
 <MeterBar
 value={metrics.concentration}
 max={80}
 color={metrics.concentration > 50 ? "#ef4444" : "#f97316"}
 />
 <div className="text-xs text-muted-foreground">
 Top 3: TLT ({POSITIONS[9].weight}%), AAPL ({POSITIONS[0].weight}%), MSFT ({POSITIONS[1].weight}%).
 {metrics.concentration > 50 && (
 <span className="text-red-400 ml-1">Above 50% threshold — consider rebalancing.</span>
 )}
 </div>
 <div className="space-y-1 pt-1">
 {POSITIONS.slice().sort((a, b) => b.weight - a.weight).slice(0, 4).map((p) => (
 <div key={p.ticker} className="flex items-center gap-2 text-xs text-muted-foreground">
 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
 <span className="text-muted-foreground w-12">{p.ticker}</span>
 <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
 <div
 className="h-full rounded-full"
 style={{ width: `${(p.weight / 30) * 100}%`, backgroundColor: p.color }}
 />
 </div>
 <span className="text-muted-foreground w-8 text-right">{p.weight}%</span>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* 2. Correlation Risk */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Correlation Risk
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4 space-y-3">
 <div className="flex items-end gap-2">
 <span className="text-lg font-medium text-foreground">
 {metrics.avgCorr.toFixed(2)}
 </span>
 <span className="text-muted-foreground text-sm mb-1">avg pairwise</span>
 </div>
 <MeterBar
 value={(metrics.avgCorr + 1) / 2}
 max={1}
 color="#60a5fa"
 />
 <div className="text-xs text-muted-foreground">
 Average pairwise correlation across 45 pairs.
 Lower is better — means genuine diversification.
 </div>
 <div className="grid grid-cols-2 gap-2 pt-1">
 <div className="bg-muted rounded-lg p-2 text-center">
 <div className="text-sm font-semibold text-green-400">TLT/GLD</div>
 <div className="text-xs text-muted-foreground">Best diversifier</div>
 <div className="text-xs font-mono text-muted-foreground mt-0.5">ρ = -0.22</div>
 </div>
 <div className="bg-muted rounded-lg p-2 text-center">
 <div className="text-sm font-medium text-red-400">AAPL/MSFT</div>
 <div className="text-xs text-muted-foreground">Highest corr</div>
 <div className="text-xs font-mono text-muted-foreground mt-0.5">ρ = +0.82</div>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* 3. Beta Risk */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Beta Risk
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4 space-y-3">
 <div className="flex items-end gap-2">
 <span className="text-lg font-medium text-foreground">
 {metrics.beta.toFixed(2)}
 </span>
 <span className="text-muted-foreground text-sm mb-1">vs S&P 500</span>
 </div>
 <MeterBar value={metrics.beta} max={2.5} color="#a78bfa" />
 <div className="text-xs text-muted-foreground">
 Portfolio beta of {metrics.beta.toFixed(2)} means ~{(metrics.beta * 100).toFixed(0)}% sensitivity
 to market moves. TLT's negative beta (-0.23) partially offsets equity exposure.
 </div>
 <div className="space-y-1 pt-1">
 {[...POSITIONS].sort((a, b) => Math.abs(b.beta) - Math.abs(a.beta)).slice(0, 3).map((p) => (
 <div key={p.ticker} className="flex items-center gap-2 text-xs text-muted-foreground">
 <span className="text-muted-foreground w-12">{p.ticker}</span>
 <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
 <div
 className="h-full rounded-full"
 style={{
 width: `${Math.min(100, (Math.abs(p.beta) / 2.5) * 100)}%`,
 backgroundColor: p.beta < 0 ? "#34d399" : "#a78bfa",
 }}
 />
 </div>
 <span
 className="font-mono w-10 text-right"
 style={{ color: p.beta < 0 ? "#34d399" : "#a78bfa" }}
 >
 β={p.beta.toFixed(2)}
 </span>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* 4. Liquidity Risk */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Liquidity Risk
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4 space-y-3">
 <div className="flex items-end gap-2">
 <span className="text-lg font-medium text-muted-foreground">
 {metrics.liquidity.toFixed(0)}%
 </span>
 <span className="text-muted-foreground text-sm mb-1">1-day exit</span>
 </div>
 <MeterBar value={metrics.liquidity} max={100} color="#22d3ee" />
 <div className="text-xs text-muted-foreground">
 % of portfolio that can be fully exited in 1 trading day with &lt;0.1% market impact
 (using 1% of ADV rule). All positions in large-caps — minimal liquidity risk.
 </div>
 <div className="flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2 text-xs text-muted-foreground">
 <span>At $100k notional, all 10 positions are &lt;1% of daily ADV — excellent liquidity.</span>
 </div>
 </CardContent>
 </Card>

 {/* 5. Tail Risk (Expected Shortfall) */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Tail Risk (ES 95%)
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4 space-y-3">
 <div className="flex items-end gap-2">
 <span className="text-lg font-medium text-red-400">
 -{metrics.es.toFixed(1)}%
 </span>
 <span className="text-muted-foreground text-sm mb-1">expected shortfall</span>
 </div>
 <MeterBar value={metrics.es} max={25} color="#ef4444" />
 <div className="text-xs text-muted-foreground">
 Expected Shortfall (CVaR) at 95% confidence: on the worst 5% of trading days,
 the average loss would be {metrics.es.toFixed(1)}% of portfolio value.
 Based on portfolio vol of {(computePortfolioVol() * 100).toFixed(1)}%.
 </div>
 <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-muted-foreground">
 <div className="bg-muted rounded-lg p-2">
 <div className="text-muted-foreground">1-day VaR 95%</div>
 <div className="text-red-400 font-medium font-mono">
 -{(computePortfolioVol() * 1.645 / Math.sqrt(252) * 100).toFixed(2)}%
 </div>
 </div>
 <div className="bg-muted rounded-lg p-2">
 <div className="text-muted-foreground">Annual VaR 95%</div>
 <div className="text-red-400 font-medium font-mono">
 -{(computePortfolioVol() * 1.645 * 100).toFixed(1)}%
 </div>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Portfolio composition mini summary */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Portfolio Composition
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <div className="space-y-1.5">
 {POSITIONS.map((p) => (
 <div key={p.ticker} className="flex items-center gap-2 text-xs text-muted-foreground">
 <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
 <span className="text-muted-foreground w-10 font-medium">{p.ticker}</span>
 <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
 <div
 className="h-full rounded-full"
 style={{ width: `${(p.weight / 25) * 100}%`, backgroundColor: p.color }}
 />
 </div>
 <span className="text-muted-foreground w-8 text-right font-mono">{p.weight}%</span>
 <span className="text-muted-foreground w-6 text-right font-mono text-xs">β{p.beta.toFixed(1)}</span>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>
 </div>
 </TabsContent>

 {/* ================================================================
 TAB 2: Correlation Matrix
 ================================================================ */}
 <TabsContent value="correlation" className="data-[state=inactive]:hidden">
 <div
 className="space-y-5"
 >
 {/* Controls */}
 <div className="flex flex-wrap items-center gap-3">
 <Button
 variant={crisisMode ? "destructive" : "outline"}
 size="sm"
 onClick={() => setCrisisMode((v) => !v)}
 className={!crisisMode ? "border-border text-muted-foreground" : ""}
 >
 {crisisMode ? "Crisis Mode ON" : "Crisis Correlation"}
 </Button>
 {crisisMode && (
 <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
 Equity correlations spike to 0.85+ during market stress
 </Badge>
 )}
 <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
 <span>Click a cell to see explanation</span>
 </div>
 </div>

 <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
 {/* Heatmap */}
 <Card className="bg-card border-border xl:col-span-2">
 <CardHeader className="pb-3 pt-4 px-4">
 <CardTitle className="text-sm font-medium text-muted-foreground">
 10×10 Correlation Heatmap
 {crisisMode && <span className="text-red-400 ml-2 text-xs">(Crisis)</span>}
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <div className="overflow-x-auto">
 <table className="text-xs text-muted-foreground border-collapse mx-auto">
 <thead>
 <tr>
 <th className="w-10 h-10" />
 {POSITIONS.map((p) => (
 <th key={p.ticker} className="w-10 h-10 text-center text-muted-foreground font-medium px-0.5">
 {p.ticker}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {POSITIONS.map((row, i) => (
 <tr key={row.ticker}>
 <td className="pr-2 text-muted-foreground font-medium text-right w-10">{row.ticker}</td>
 {POSITIONS.map((_, j) => {
 const v = corrMatrix[i][j];
 const isSelected = selectedCell?.i === i && selectedCell?.j === j;
 const isDiag = i === j;
 return (
 <td
 key={j}
 onClick={() => !isDiag && setSelectedCell(isSelected ? null : { i, j })}
 className={`w-9 h-9 text-center font-mono rounded-sm transition-colors cursor-pointer ${
 isSelected ? "ring-2 ring-foreground ring-offset-1 ring-offset-background" : ""
 } ${isDiag ? "cursor-default" : "hover:opacity-80"}`}
 style={{ backgroundColor: corrColor(v) }}
 title={`${row.ticker} / ${POSITIONS[j].ticker}: ${v.toFixed(2)}`}
 >
 <span className="text-[11px] font-medium" style={{ color: Math.abs(v) > 0.4 ? "#fff" : "#000" }}>
 {isDiag ? "1" : v.toFixed(2)}
 </span>
 </td>
 );
 })}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 {/* Color legend */}
 <div className="flex items-center gap-2 mt-4 justify-center">
 <span className="text-xs text-muted-foreground">-1.0 (red)</span>
 <div
 className="h-2 w-32 rounded"
 style={{
 background: "linear-gradient(to right, #dc2626, #ffffff, #22c55e)",
 }}
 />
 <span className="text-xs text-muted-foreground">+1.0 (green)</span>
 </div>
 </CardContent>
 </Card>

 {/* Right panel: explanation + clustering */}
 <div className="space-y-4">
 {/* Explanation card */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Cell Explanation
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 
 {selectedCell ? (
 <div
 key={`${selectedCell.i}-${selectedCell.j}`}
 className="space-y-2"
 >
 <div className="flex items-center gap-2">
 <Badge className="bg-muted text-foreground border-border font-mono text-xs">
 {POSITIONS[selectedCell.i].ticker}
 </Badge>
 <span className="text-muted-foreground text-xs">×</span>
 <Badge className="bg-muted text-foreground border-border font-mono text-xs">
 {POSITIONS[selectedCell.j].ticker}
 </Badge>
 <span
 className="ml-auto font-mono font-medium text-sm"
 style={{
 color: corrColor(corrMatrix[selectedCell.i][selectedCell.j]),
 }}
 >
 ρ = {corrMatrix[selectedCell.i][selectedCell.j].toFixed(2)}
 </span>
 </div>
 <p className="text-xs text-muted-foreground leading-relaxed">
 {corrExplanation ??
 `Correlation of ${corrMatrix[selectedCell.i][selectedCell.j].toFixed(2)} between ${POSITIONS[selectedCell.i].ticker} (${POSITIONS[selectedCell.i].sector}) and ${POSITIONS[selectedCell.j].ticker} (${POSITIONS[selectedCell.j].sector}). ${
 corrMatrix[selectedCell.i][selectedCell.j] > 0.6
 ? "High positive correlation — these positions move together, reducing diversification benefit."
 : corrMatrix[selectedCell.i][selectedCell.j] < -0.1
 ? "Negative correlation — these positions provide natural hedging against each other."
 : "Low to moderate correlation — these positions provide some diversification benefit."
 }`}
 </p>
 {crisisMode && (
 <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-2 text-xs text-red-300">
 During crisis: correlation spikes as all risk assets fall together. Safe havens (GLD, TLT) maintain or deepen negative correlations.
 </div>
 )}
 </div>
 ) : (
 <p
 key="placeholder"
 className="text-xs text-muted-foreground italic"
 >
 Click any off-diagonal cell in the heatmap to see a detailed explanation of why these two positions are correlated.
 </p>
 )}
 
 </CardContent>
 </Card>

 {/* Diversification score */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium text-muted-foreground">Diversification Score</CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4 space-y-3">
 <div className="flex items-end gap-2">
 <span className="text-lg font-medium text-emerald-400">3.8</span>
 <span className="text-muted-foreground text-sm mb-0.5">independent bets (PCA)</span>
 </div>
 <Progress value={38} className="h-1.5 bg-muted" />
 <p className="text-xs text-muted-foreground">
 PCA decomposition shows 3.8 effective independent bets out of 10 positions.
 First principal component (market beta) explains 62% of variance.
 Adding uncorrelated assets (commodities, TIPS, REITs) would increase this score.
 </p>
 <div className="space-y-1 text-xs text-muted-foreground">
 {[
 { label: "PC1 — Market Beta", pct: 62 },
 { label: "PC2 — Tech/Growth", pct: 16 },
 { label: "PC3 — Rates/Duration", pct: 11 },
 { label: "PC4 — Volatility", pct: 6 },
 { label: "Remaining PCs", pct: 5 },
 ].map((pc) => (
 <div key={pc.label} className="flex items-center gap-2">
 <span className="text-muted-foreground w-40">{pc.label}</span>
 <div className="flex-1 bg-muted rounded-full h-1 overflow-hidden">
 <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pc.pct}%` }} />
 </div>
 <span className="text-muted-foreground w-8 text-right">{pc.pct}%</span>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>
 </div>

 {/* Dendrogram */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Risk Cluster Dendrogram
 <span className="text-muted-foreground text-xs font-normal ml-1">— hierarchical clustering by correlation distance</span>
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <DendrogramChart />
 <div className="flex flex-wrap gap-3 mt-2 justify-center text-xs text-muted-foreground">
 {[
 { label: "Tech Core", color: "#60a5fa", members: "AAPL, MSFT, GOOGL, AMZN" },
 { label: "High Beta", color: "#a78bfa", members: "NVDA, TSLA" },
 { label: "Financials", color: "#38bdf8", members: "JPM" },
 { label: "Defensive", color: "#34d399", members: "JNJ, GLD, TLT" },
 ].map((c) => (
 <div key={c.label} className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1">
 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color, color: c.color }} />
 <span className="font-medium" >{c.label}:</span>
 <span className="text-muted-foreground">{c.members}</span>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>
 </TabsContent>

 {/* ================================================================
 TAB 3: Drawdown Analysis
 ================================================================ */}
 <TabsContent value="drawdown" className="data-[state=inactive]:hidden">
 <div
 className="space-y-5"
 >
 {/* Stats row */}
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
 {[
 {
 label: "Max Drawdown",
 value: `${ddData.maxPortDD.toFixed(1)}%`,
 sub: "Portfolio",
 color: "#ef4444",
 },
 {
 label: "Benchmark Max DD",
 value: `${ddData.maxBenchDD.toFixed(1)}%`,
 sub: "S&P 500",
 color: "#64748b",
 },
 {
 label: "Pain Index",
 value: ddData.paintIndex.toFixed(2),
 sub: "Avg DD depth",
 color: "#f97316",
 },
 {
 label: "Calmar Ratio",
 value: ddData.calmar.toFixed(2),
 sub: "Return / Max DD",
 color: ddData.calmar > 0.5 ? "#22c55e" : "#f59e0b",
 },
 {
 label: "Ann. Return",
 value: `+${ddData.annReturn.toFixed(1)}%`,
 sub: "3Y simulated",
 color: "#34d399",
 },
 ].map((s) => (
 <Card key={s.label} className="bg-card border-border">
 <CardContent className="p-4">
 <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
 <div className="text-xl font-medium font-mono" style={{ color: s.color }}>
 {s.value}
 </div>
 <div className="text-xs text-muted-foreground mt-0.5">{s.sub}</div>
 </CardContent>
 </Card>
 ))}
 </div>

 {/* Underwater chart */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Underwater Plot — % Below All-Time High (3Y)
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <DrawdownChart
 portDD={ddData.portDD}
 benchDD={ddData.benchDD}
 days={ddData.days}
 />
 </CardContent>
 </Card>

 {/* Drawdown periods table */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium text-muted-foreground">5 Worst Drawdown Periods</CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="text-muted-foreground border-b border-border">
 <th className="text-left pb-2 pr-4 font-medium">Period</th>
 <th className="text-right pb-2 pr-4 font-medium">Peak Date</th>
 <th className="text-right pb-2 pr-4 font-medium">Trough Date</th>
 <th className="text-right pb-2 pr-4 font-medium">Max DD</th>
 <th className="text-right pb-2 pr-4 font-medium">Duration</th>
 <th className="text-right pb-2 font-medium">Recovery</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/50">
 {[
 { period: "Worst DD", peak: "Aug 2025", trough: "Nov 2025", dd: "-18.4%", dur: "70d", rec: "82d" },
 { period: "Bear period 2",peak: "May 2025", trough: "Jul 2025", dd: "-14.2%", dur: "80d", rec: "95d" },
 { period: "Bear period 1",peak: "Mar 2024", trough: "Jun 2024", dd: "-12.6%", dur: "60d", rec: "68d" },
 { period: "Q1 dip", peak: "Jan 2024", trough: "Feb 2024", dd: "-5.1%", dur: "20d", rec: "24d" },
 { period: "Mini crash", peak: "Jun 2025", trough: "Jul 2025", dd: "-4.8%", dur: "30d", rec: "38d" },
 ].map((row) => (
 <tr key={row.period} className="text-muted-foreground">
 <td className="py-2 pr-4 font-medium text-red-400">{row.period}</td>
 <td className="py-2 pr-4 text-right text-muted-foreground">{row.peak}</td>
 <td className="py-2 pr-4 text-right text-muted-foreground">{row.trough}</td>
 <td className="py-2 pr-4 text-right font-mono text-red-400">{row.dd}</td>
 <td className="py-2 pr-4 text-right text-muted-foreground">{row.dur}</td>
 <td className="py-2 text-right text-muted-foreground">{row.rec}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>

 {/* DD statistics */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium text-muted-foreground">Drawdown Statistics</CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4 space-y-2 text-xs text-muted-foreground">
 {[
 { label: "Number of drawdowns (>2%)", val: "5" },
 { label: "Average drawdown depth", val: "-11.0%" },
 { label: "Average duration", val: "52 days" },
 { label: "Average recovery time", val: "61 days" },
 { label: "% Time in drawdown", val: "43%" },
 { label: "Ulcer Index", val: "6.2" },
 ].map((r) => (
 <div key={r.label} className="flex justify-between border-b border-border pb-1.5">
 <span className="text-muted-foreground">{r.label}</span>
 <span className="text-foreground font-mono">{r.val}</span>
 </div>
 ))}
 </CardContent>
 </Card>
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium text-muted-foreground">Pain Index Breakdown</CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4 space-y-2">
 <p className="text-xs text-muted-foreground">
 The Pain Index measures the area under the drawdown curve — it penalizes prolonged drawdowns
 more than sharp, short ones. Lower is better.
 </p>
 <div className="flex items-end gap-3">
 <div>
 <div className="text-lg font-medium text-orange-400">{ddData.paintIndex.toFixed(2)}</div>
 <div className="text-xs text-muted-foreground mt-0.5">Portfolio Pain Index</div>
 </div>
 <div className="text-muted-foreground text-xl">vs</div>
 <div>
 <div className="text-lg font-medium text-muted-foreground">4.12</div>
 <div className="text-xs text-muted-foreground mt-0.5">S&P 500 (same period)</div>
 </div>
 </div>
 <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground">
 Pain Index = (1/N) × Σ|DDᵢ|. A PI of {ddData.paintIndex.toFixed(2)} means on average the portfolio
 was {ddData.paintIndex.toFixed(1)}% below its all-time high across the 3-year period.
 </div>
 </CardContent>
 </Card>
 </div>
 </div>
 </TabsContent>

 {/* ================================================================
 TAB 4: Scenario Analysis
 ================================================================ */}
 <TabsContent value="scenarios" className="data-[state=inactive]:hidden">
 <div
 className="space-y-5"
 >
 {/* Scenario impact bar chart */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Portfolio Impact by Historical Scenario
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <ScenarioBarChart impacts={scenarioImpacts} />
 <div className="flex flex-wrap gap-1 mt-2 justify-center">
 {SCENARIOS.map((s, i) => (
 <span key={i} className="text-[11px] text-muted-foreground w-[10%] text-center truncate" title={s.name}>
 {s.year}
 </span>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* Scenario cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {SCENARIOS.map((s, i) => {
 const impact = scenarioImpacts[i];
 const color = impact > -10 ? "#f59e0b" : impact > -20 ? "#f97316" : "#ef4444";
 const isSelected = selectedScenario === i;
 return (
 <div key={s.name}>
 <Card
 className={`bg-card border-border cursor-pointer transition-colors ${
 isSelected ? "border-orange-500/50 bg-muted/80" : "hover:border-border"
 }`}
 onClick={() => setSelectedScenario(isSelected ? null : i)}
 >
 <CardContent className="p-4">
 <div className="flex items-start justify-between gap-2">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <span className="font-medium text-sm text-foreground truncate">{s.name}</span>
 <Badge className="text-xs bg-muted text-muted-foreground border-border">
 {s.year}
 </Badge>
 </div>
 <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.cause}</p>
 </div>
 <div className="text-right flex-shrink-0">
 <div className="text-lg font-medium font-mono" style={{ color }}>
 {impact.toFixed(1)}%
 </div>
 <div className="text-xs text-muted-foreground">portfolio P&amp;L</div>
 </div>
 </div>
 
 {isSelected && (
 <div
 className="overflow-hidden"
 >
 <div className="pt-3 border-t border-border mt-3 space-y-2">
 <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
 <div className="bg-muted rounded-lg p-2">
 <div className="text-muted-foreground">Equity shock</div>
 <div className="font-mono text-red-400">{s.equityShock > 0 ? "+" : ""}{s.equityShock}%</div>
 </div>
 <div className="bg-muted rounded-lg p-2">
 <div className="text-muted-foreground">Bond move</div>
 <div className="font-mono" style={{ color: s.rateShock > 0 ? "#34d399" : "#ef4444" }}>
 {s.rateShock > 0 ? "+" : ""}{s.rateShock}%
 </div>
 </div>
 <div className="bg-muted rounded-lg p-2">
 <div className="text-muted-foreground">VIX peak</div>
 <div className="font-mono text-orange-400">{s.volSpike}</div>
 </div>
 </div>
 <div className="text-xs text-muted-foreground">
 <span className="text-muted-foreground font-medium">Biggest losers: </span>
 {s.worstPositions.join(", ")}
 </div>
 <div className="flex items-center gap-2">
 <span className="text-xs text-muted-foreground">Portfolio loss:</span>
 <Progress
 value={Math.min(100, Math.abs(impact) / 40 * 100)}
 className="flex-1 h-1.5 bg-muted"
 />
 <span className="text-xs font-mono" style={{ color }}>
 ${(100000 * Math.abs(impact) / 100).toFixed(0)}
 </span>
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

 {/* Custom scenario builder */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-3 pt-4 px-4">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Custom Scenario Builder
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 <div className="space-y-5">
 {[
 {
 label: "Equity Market Move",
 value: customEquity[0],
 setter: setCustomEquity,
 min: -60, max: 40, step: 1,
 color: customEquity[0] < 0 ? "#ef4444" : "#22c55e",
 format: (v: number) => `${v > 0 ? "+" : ""}${v}%`,
 },
 {
 label: "Interest Rate Move (bps)",
 value: customRate[0],
 setter: setCustomRate,
 min: -200, max: 500, step: 10,
 color: "#60a5fa",
 format: (v: number) => `${v > 0 ? "+" : ""}${v}bps`,
 },
 {
 label: "Volatility Spike (VIX)",
 value: customVol[0],
 setter: setCustomVol,
 min: 0, max: 80, step: 1,
 color: "#f59e0b",
 format: (v: number) => `VIX +${v}`,
 },
 {
 label: "Credit Spread Widening (bps)",
 value: customSpread[0],
 setter: setCustomSpread,
 min: 0, max: 1000, step: 25,
 color: "#f97316",
 format: (v: number) => `+${v}bps`,
 },
 ].map((ctrl) => (
 <div key={ctrl.label} className="space-y-2">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">{ctrl.label}</span>
 <span className="font-mono font-medium" style={{ color: ctrl.color }}>
 {ctrl.format(ctrl.value)}
 </span>
 </div>
 <Slider
 value={[ctrl.value]}
 onValueChange={ctrl.setter as (v: number[]) => void}
 min={ctrl.min}
 max={ctrl.max}
 step={ctrl.step}
 className="[&>span]:bg-muted [&>span>span]:bg-primary"
 />
 </div>
 ))}
 </div>

 {/* Impact summary */}
 <div className="flex flex-col justify-center items-center bg-muted/50 rounded-md p-4 space-y-4">
 <div className="text-center">
 <div className="text-muted-foreground text-sm mb-2">Estimated Portfolio Impact</div>
 <div
 className="text-lg font-medium font-mono"
 style={{ color: customImpact < 0 ? "#ef4444" : "#22c55e" }}
 >
 {customImpact > 0 ? "+" : ""}{customImpact.toFixed(1)}%
 </div>
 <div className="text-muted-foreground text-sm mt-1">
 ${Math.abs(100000 * customImpact / 100).toFixed(0)} on $100k portfolio
 </div>
 </div>
 <div className="w-full space-y-2 text-xs text-muted-foreground">
 {[
 { label: "Equity contribution", val: (POSITIONS.filter(p => p.sector !== "Bonds" && p.sector !== "Commodities").reduce((s, p) => s + (p.weight / 100) * customEquity[0] * p.beta * 0.85, 0)).toFixed(1) + "%" },
 { label: "Bond contribution", val: (POSITIONS.filter(p => p.sector === "Bonds").reduce((s, p) => s + (p.weight / 100) * customRate[0] * -0.008, 0)).toFixed(1) + "%" },
 { label: "Commodity contrib.", val: (POSITIONS.filter(p => p.sector === "Commodities").reduce((s, p) => s + (p.weight / 100) * customEquity[0] * 0.25, 0)).toFixed(1) + "%" },
 { label: "Credit spread impact", val: (-customSpread[0] / 500 * 5).toFixed(1) + "%" },
 ].map((r) => (
 <div key={r.label} className="flex justify-between border-b border-border pb-1">
 <span className="text-muted-foreground">{r.label}</span>
 <span className="font-mono text-muted-foreground">{r.val}</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>
 </TabsContent>

 {/* ================================================================
 TAB 5: Position Sizing & Kelly
 ================================================================ */}
 <TabsContent value="sizing" className="data-[state=inactive]:hidden">
 <div
 className="space-y-5"
 >
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
 {/* Kelly Calculator */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-3 pt-4 px-4">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Kelly Criterion Calculator
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4 space-y-5">
 {/* Inputs */}
 {[
 {
 label: "Win Rate",
 value: winRate[0],
 setter: setWinRate,
 min: 20, max: 90, step: 1,
 format: (v: number) => `${v}%`,
 color: "#34d399",
 },
 {
 label: "Average Gain (per win)",
 value: avgGain[0],
 setter: setAvgGain,
 min: 1, max: 30, step: 0.5,
 format: (v: number) => `${v}%`,
 color: "#60a5fa",
 },
 {
 label: "Average Loss (per loss)",
 value: avgLoss[0],
 setter: setAvgLoss,
 min: 1, max: 20, step: 0.5,
 format: (v: number) => `${v}%`,
 color: "#f87171",
 },
 ].map((ctrl) => (
 <div key={ctrl.label} className="space-y-2">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">{ctrl.label}</span>
 <span className="font-mono font-medium" style={{ color: ctrl.color }}>
 {ctrl.format(ctrl.value)}
 </span>
 </div>
 <Slider
 value={[ctrl.value]}
 onValueChange={ctrl.setter as (v: number[]) => void}
 min={ctrl.min}
 max={ctrl.max}
 step={ctrl.step}
 />
 </div>
 ))}

 {/* Fractional Kelly selector */}
 <div>
 <div className="text-xs text-muted-foreground mb-2">Kelly Fraction</div>
 <div className="flex gap-2">
 {(["full", "half", "quarter"] as const).map((f) => (
 <Button
 key={f}
 size="sm"
 variant={kellyFraction === f ? "default" : "outline"}
 onClick={() => setKellyFraction(f)}
 className={`text-xs text-muted-foreground flex-1 ${
 kellyFraction !== f ? "border-border text-muted-foreground" : ""
 }`}
 >
 {f === "full" ? "Full Kelly" : f === "half" ? "½ Kelly" : "¼ Kelly"}
 </Button>
 ))}
 </div>
 </div>

 {/* Kelly result */}
 <div className="bg-muted rounded-md p-4 text-center space-y-3">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <div className="text-xs text-muted-foreground mb-1">Full Kelly</div>
 <div
 className="text-lg font-medium font-mono"
 style={{ color: kelly.raw > 0 ? "#34d399" : "#ef4444" }}
 >
 {(kelly.raw * 100).toFixed(1)}%
 </div>
 <div className="text-xs text-muted-foreground">of capital per trade</div>
 </div>
 <div>
 <div className="text-xs text-muted-foreground mb-1">
 {kellyFraction === "full" ? "Full" : kellyFraction === "half" ? "½" : "¼"} Kelly
 </div>
 <div
 className="text-lg font-medium font-mono"
 style={{ color: kelly.adjusted > 0 ? "#22d3ee" : "#f87171" }}
 >
 {(kelly.adjusted * 100).toFixed(1)}%
 </div>
 <div className="text-xs text-muted-foreground">recommended size</div>
 </div>
 </div>
 <div className="text-xs text-muted-foreground border-t border-border pt-3">
 Kelly = W × (G/L) − (1−W) = {winRate[0]}% × ({avgGain[0]}/{avgLoss[0]}) − {100 - winRate[0]}%
 </div>
 {kelly.raw <= 0 && (
 <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-2 text-xs text-red-400">
 Negative Kelly: expected value is negative with these parameters. Do not trade this setup.
 </div>
 )}
 </div>
 </CardContent>
 </Card>

 {/* Position sizing per holding */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-3 pt-4 px-4">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Volatility-Adjusted Position Sizing
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <p className="text-xs text-muted-foreground mb-3">
 Equal-risk contribution sizing: each position sized so its daily VaR equals 1% of portfolio.
 Higher-vol positions get smaller weights.
 </p>
 <div className="space-y-2">
 {POSITIONS.map((p) => {
 const dailyVol = p.vol / Math.sqrt(252);
 const targetSize = 0.01 / (dailyVol * 1.645); // 1% VaR contribution
 const cappedSize = Math.min(targetSize, 0.30);
 const currentOk = Math.abs((p.weight / 100) - cappedSize) < 0.05;
 return (
 <div key={p.ticker} className="grid grid-cols-5 gap-2 text-xs text-muted-foreground items-center">
 <span className="text-muted-foreground font-medium">{p.ticker}</span>
 <div className="col-span-2 bg-muted rounded-full h-1.5 overflow-hidden relative">
 {/* Target */}
 <div
 className="h-full rounded-full opacity-30"
 style={{ width: `${cappedSize * 100}%`, backgroundColor: p.color }}
 />
 {/* Actual */}
 <div
 className="absolute top-0 h-full rounded-full"
 style={{ width: `${(p.weight / 100) * 100}%`, backgroundColor: p.color, opacity: 0.8 }}
 />
 </div>
 <span className="text-muted-foreground text-right font-mono">
 {p.weight}%
 <span className="text-muted-foreground ml-1">→ {(cappedSize * 100).toFixed(0)}%</span>
 </span>
 <Badge
 className={`text-[11px] justify-center ${
 currentOk
 ? "bg-green-500/10 text-green-400 border-green-500/20"
 : p.weight / 100 > cappedSize
 ? "bg-red-500/5 text-red-400 border-red-500/20"
 : "bg-muted/10 text-foreground border-border"
 }`}
 >
 {currentOk ? "OK" : p.weight / 100 > cappedSize ? "Overweight" : "Underweight"}
 </Badge>
 </div>
 );
 })}
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Risk budget allocation */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-3 pt-4 px-4">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Risk Budget Allocation (% of Total VaR)
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 <div className="space-y-2">
 <div className="flex justify-between text-xs text-muted-foreground mb-2">
 <span>Position</span>
 <span>Current VaR % · Target VaR %</span>
 </div>
 {POSITIONS.map((p) => {
 const dailyVol = p.vol / Math.sqrt(252);
 const posVaR = (p.weight / 100) * dailyVol * 1.645;
 const totalApproxVaR = POSITIONS.reduce(
 (s, q) => s + (q.weight / 100) * (q.vol / Math.sqrt(252)) * 1.645,
 0
 );
 const varPct = (posVaR / totalApproxVaR) * 100;
 const targetVarPct = 100 / POSITIONS.length; // equal risk budget
 return (
 <div key={p.ticker} className="space-y-0.5">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">{p.ticker}</span>
 <span className="font-mono text-muted-foreground">
 {varPct.toFixed(1)}% → {targetVarPct.toFixed(1)}%
 </span>
 </div>
 <div className="relative h-2 bg-muted rounded-full overflow-hidden">
 {/* Target line */}
 <div
 className="absolute top-0 h-full w-0.5 bg-muted-foreground z-10"
 style={{ left: `${targetVarPct}%` }}
 />
 {/* Actual */}
 <div
 className="h-full rounded-full"
 style={{
 width: `${Math.min(100, varPct)}%`,
 backgroundColor: varPct > targetVarPct * 1.5 ? "#ef4444" : p.color,
 }}
 />
 </div>
 </div>
 );
 })}
 </div>
 <div className="space-y-3">
 <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground space-y-2">
 <div className="font-medium text-muted-foreground">Risk Budget Insights</div>
 <p className="text-muted-foreground">
 TSLA and NVDA are consuming disproportionate risk budget due to high volatility (62% and 52% annualized).
 TLT, despite 24% weight, uses only 3.8% of risk budget due to low vol (15%).
 </p>
 <div className="text-muted-foreground">
 <span className="text-red-400">Overbudget:</span> TSLA, NVDA
 </div>
 <div className="text-muted-foreground">
 <span className="text-green-400">Underbudget:</span> TLT, GLD, JNJ
 </div>
 </div>
 {/* Leverage analysis */}
 <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground space-y-1.5">
 <div className="font-medium text-muted-foreground">Leverage Analysis</div>
 {[
 { label: "Portfolio leverage ratio", val: "1.0× (no leverage)" },
 { label: "Margin utilization", val: "0% (cash only)" },
 { label: "Gross exposure", val: "$100,000" },
 { label: "Net exposure", val: "$97,200 (TLT hedges 2.8%)" },
 { label: "Margin call price (AAPL)", val: "N/A — no margin" },
 ].map((r) => (
 <div key={r.label} className="flex justify-between border-b border-border pb-1">
 <span className="text-muted-foreground">{r.label}</span>
 <span className="text-muted-foreground font-mono">{r.val}</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* What-if simulator */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-3 pt-4 px-4">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 What-If Position Simulator
 <span className="text-muted-foreground text-xs font-normal ml-1">
 — add a new position and see portfolio risk change
 </span>
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 <div className="space-y-4">
 <div>
 <label className="text-xs text-muted-foreground block mb-1.5">New Position Ticker</label>
 <div className="flex gap-2">
 {["META", "AMD", "BAC", "XOM", "COIN"].map((t) => (
 <button
 key={t}
 onClick={() => setNewTicker(t)}
 className={`px-2.5 py-1 rounded text-xs text-muted-foreground font-medium transition-colors ${
 newTicker === t
 ? "bg-primary text-foreground"
 : "bg-muted text-muted-foreground hover:bg-muted"
 }`}
 >
 {t}
 </button>
 ))}
 </div>
 </div>
 <div className="space-y-2">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">Position Weight</span>
 <span className="font-mono text-foreground">{newWeight[0]}%</span>
 </div>
 <Slider
 value={newWeight}
 onValueChange={setNewWeight}
 min={1}
 max={25}
 step={1}
 />
 </div>
 <div className="space-y-2">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">Estimated Beta</span>
 <span className="font-mono text-foreground">{newBeta[0]}</span>
 </div>
 <Slider
 value={newBeta}
 onValueChange={setNewBeta}
 min={-0.5}
 max={3}
 step={0.05}
 />
 </div>
 </div>

 {/* Impact display */}
 <div className="space-y-3">
 <div className="bg-muted/60 rounded-md p-4 space-y-3">
 <div className="text-xs text-muted-foreground font-medium ">
 Portfolio Impact of Adding {newWeight[0]}% {newTicker}
 </div>
 <div className="grid grid-cols-2 gap-4">
 {[
 {
 label: "Portfolio Beta",
 before: metrics.beta.toFixed(2),
 after: whatIfMetrics.beta.toFixed(2),
 improved: whatIfMetrics.beta < metrics.beta,
 unit: "",
 },
 {
 label: "Top-3 Concentration",
 before: metrics.concentration.toFixed(1) + "%",
 after: whatIfMetrics.concentration.toFixed(1) + "%",
 improved: whatIfMetrics.concentration < metrics.concentration,
 unit: "%",
 },
 ].map((m) => (
 <div key={m.label} className="space-y-1">
 <div className="text-xs text-muted-foreground">{m.label}</div>
 <div className="flex items-center gap-1.5">
 <span className="text-muted-foreground text-xs font-mono">{m.before}</span>
 <span
 className="text-sm font-medium font-mono"
 style={{ color: m.improved ? "#22c55e" : "#f97316" }}
 >
 {m.after}
 </span>
 <span className="text-xs" >
 {m.improved ? "↓ Better" : "↑ Worse"}
 </span>
 </div>
 </div>
 ))}
 </div>
 <div className="text-xs text-muted-foreground bg-card/50 rounded-lg p-2 mt-1">
 Adding {newWeight[0]}% {newTicker} (β={newBeta[0].toFixed(2)}) scales existing positions by{""}
 {((100 - newWeight[0]) / 100 * 100).toFixed(0)}%.
 {newBeta[0] > metrics.beta
 ? ` This increases portfolio beta from ${metrics.beta.toFixed(2)} to ${whatIfMetrics.beta.toFixed(2)} — adding market sensitivity.`
 : ` This reduces portfolio beta from ${metrics.beta.toFixed(2)} to ${whatIfMetrics.beta.toFixed(2)} — helpful if adding a hedging asset.`}
 </div>
 </div>
 <div className="flex items-start gap-2 text-xs text-muted-foreground bg-yellow-500/5 border border-yellow-500/15 rounded-lg p-2.5">
 <span>
 Remember: position sizing alone is not risk management. Correlation changes,
 liquidity dry-ups, and fat-tail events can all overwhelm size-based risk controls.
 </span>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>
 </TabsContent>
 </Tabs>
 </div>
 );
}
