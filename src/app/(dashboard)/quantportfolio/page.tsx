"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
 TrendingUp,
 BarChart3,
 Layers,
 Target,
 SlidersHorizontal,
 RefreshCw,
 Info,
 ChevronDown,
 ChevronUp,
 Shield,
 ArrowRightLeft,
 DollarSign,
 PieChart,
 Activity,
 GitMerge,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 913;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};

function resetSeed(seed = 913) {
 s = seed;
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface Portfolio {
 x: number;
 y: number;
 sharpe: number;
 weights: number[];
 isMinVar?: boolean;
 isMaxSharpe?: boolean;
}

interface BLView {
 id: string;
 asset: string;
 type: "absolute" | "relative";
 confidence: number;
 view: string;
 expectedReturn: number;
}

interface RiskParityAsset {
 name: string;
 ticker: string;
 vol: number;
 mktWeight: number;
 equalWeight: number;
 ercWeight: number;
 color: string;
}

interface CrisisPeriod {
 name: string;
 start: number;
 end: number;
 rp: number;
 mkt: number;
 ew: number;
}

interface TurnoverPoint {
 lambda: number;
 sharpe: number;
 annualTurnover: number;
}

interface StrategyTurnover {
 name: string;
 turnover: number;
 color: string;
}

interface BandPoint {
 x: number;
 target: number;
 lower: number;
 upper: number;
 actual: number;
}

interface PerfPoint {
 t: number;
 rp: number;
 sixtForty: number;
 ew: number;
}

// ── Static data ────────────────────────────────────────────────────────────────

const BL_VIEWS: BLView[] = [
 {
 id: "v1",
 asset: "US Equity",
 type: "absolute",
 confidence: 0.72,
 view: "Outperform equilibrium by 200 bps",
 expectedReturn: 8.2,
 },
 {
 id: "v2",
 asset: "Emerging Markets",
 type: "relative",
 confidence: 0.55,
 view: "EM outperforms Intl DM by 150 bps",
 expectedReturn: 7.6,
 },
 {
 id: "v3",
 asset: "Commodities",
 type: "absolute",
 confidence: 0.40,
 view: "Inflation hedge — 300 bps premium",
 expectedReturn: 6.1,
 },
];

const RISK_PARITY_ASSETS: RiskParityAsset[] = [
 { name: "US Equity", ticker: "SPY", vol: 16.2, mktWeight: 36.0, equalWeight: 20.0, ercWeight: 10.8, color: "#6366f1" },
 { name: "Intl Equity", ticker: "EFA", vol: 17.8, mktWeight: 22.0, equalWeight: 20.0, ercWeight: 9.8, color: "#22c55e" },
 { name: "EM Equity", ticker: "EEM", vol: 22.4, mktWeight: 12.0, equalWeight: 20.0, ercWeight: 7.8, color: "#f59e0b" },
 { name: "US Bonds", ticker: "AGG", vol: 5.4, mktWeight: 24.0, equalWeight: 20.0, ercWeight: 32.4, color: "#38bdf8" },
 { name: "Commodities", ticker: "DJP", vol: 14.6, mktWeight: 6.0, equalWeight: 20.0, ercWeight: 39.2, color: "#ec4899" },
];

const CRISIS_PERIODS: CrisisPeriod[] = [
 { name: "GFC 2008", start: 0, end: 12, rp: -18.2, mkt: -28.6, ew: -35.4 },
 { name: "EU Debt 2011", start: 15, end: 21, rp: -6.4, mkt: -11.2, ew: -13.1 },
 { name: "Q4 Selloff 2018", start: 28, end: 33, rp: -5.1, mkt: -9.4, ew: -11.8 },
 { name: "COVID 2020", start: 42, end: 48, rp: -10.3, mkt: -17.1, ew: -22.6 },
 { name: "Rate Shock 2022", start: 54, end: 60, rp: -14.8, mkt: -16.2, ew: -18.4 },
];

const STRATEGY_TURNOVER: StrategyTurnover[] = [
 { name: "Buy & Hold", turnover: 3, color: "#22c55e" },
 { name: "Annual Rebal", turnover: 15, color: "#38bdf8" },
 { name: "Threshold (5%)", turnover: 22, color: "#6366f1" },
 { name: "Black-Litterman", turnover: 35, color: "#a78bfa" },
 { name: "Risk Parity", turnover: 40, color: "#f59e0b" },
 { name: "Factor Tilt", turnover: 65, color: "#ec4899" },
 { name: "HFT Arb", turnover: 800, color: "#ef4444" },
];

// ── Data generators ───────────────────────────────────────────────────────────

function generatePortfolios(): Portfolio[] {
 resetSeed(913);
 const portfolios: Portfolio[] = [];
 for (let i = 0; i < 20; i++) {
 const raw = [rand(), rand(), rand(), rand(), rand()];
 const sum = raw.reduce((a, b) => a + b, 0);
 const weights = raw.map((w) => w / sum);
 const baseVol = 7 + rand() * 14;
 const baseRet = 3 + rand() * 10;
 portfolios.push({ x: baseVol, y: baseRet, sharpe: (baseRet - 2.5) / baseVol, weights });
 }
 portfolios.push({
 x: 6.2, y: 5.1, sharpe: (5.1 - 2.5) / 6.2,
 weights: [0.05, 0.05, 0.03, 0.72, 0.15], isMinVar: true,
 });
 portfolios.push({
 x: 11.4, y: 9.8, sharpe: (9.8 - 2.5) / 11.4,
 weights: [0.45, 0.22, 0.13, 0.10, 0.10], isMaxSharpe: true,
 });
 return portfolios;
}

function generateFrontierCurve(): Array<{ x: number; y: number }> {
 const pts: Array<{ x: number; y: number }> = [];
 for (let i = 0; i <= 40; i++) {
 const t = i / 40;
 const x = 6.2 + (22.0 - 6.2) * t;
 const y = 5.1 + 8.0 * Math.sqrt(Math.max(0, (x - 6.2) / 15.8));
 pts.push({ x, y });
 }
 return pts;
}

function generateTurnoverPoints(): TurnoverPoint[] {
 resetSeed(920);
 const pts: TurnoverPoint[] = [];
 for (let i = 0; i <= 20; i++) {
 const lambda = i / 20;
 const raw = 0.82 - 0.35 * Math.pow(lambda - 0.35, 2) / 0.12;
 const sharpe = Math.max(0.2, raw + (rand() - 0.5) * 0.04);
 const annualTurnover = 120 - (120 - 8) * lambda;
 pts.push({ lambda, sharpe, annualTurnover });
 }
 return pts;
}

function generateNoBandData(): BandPoint[] {
 resetSeed(924);
 const pts: BandPoint[] = [];
 let actual = 0.30;
 const target = 0.30;
 const half = 0.03;
 for (let i = 0; i < 24; i++) {
 const drift = (rand() - 0.48) * 0.02;
 actual = Math.max(0.10, Math.min(0.55, actual + drift));
 if (actual > target + half) actual = target + half - 0.005;
 if (actual < target - half) actual = target - half + 0.005;
 pts.push({ x: i, target, lower: target - half, upper: target + half, actual });
 }
 return pts;
}

function generateAllWeatherSeries(): PerfPoint[] {
 resetSeed(916);
 const pts: PerfPoint[] = [];
 let rp = 100, sf = 100, ew = 100;
 for (let i = 0; i < 64; i++) {
 const shock = i === 0 ? 0 : (rand() - 0.48) * 3.2;
 rp = rp * (1 + 0.065 / 12 + shock * 0.006);
 sf = sf * (1 + 0.075 / 12 + shock * 0.011);
 ew = ew * (1 + 0.080 / 12 + shock * 0.015);
 pts.push({ t: i, rp, sixtForty: sf, ew });
 }
 return pts;
}

// ── SVG layout constants ──────────────────────────────────────────────────────

const SVG_W = 480;
const SVG_H = 280;
const PAD = { top: 20, right: 20, bottom: 40, left: 48 };

function scaleX(val: number, min: number, max: number) {
 return PAD.left + ((val - min) / (max - min)) * (SVG_W - PAD.left - PAD.right);
}
function scaleY(val: number, min: number, max: number) {
 return SVG_H - PAD.bottom - ((val - min) / (max - min)) * (SVG_H - PAD.top - PAD.bottom);
}

// ── SVG components ────────────────────────────────────────────────────────────

function EfficientFrontierSVG() {
 const portfolios = useMemo(() => generatePortfolios(), []);
 const frontier = useMemo(() => generateFrontierCurve(), []);
 const xMin = 5, xMax = 24, yMin = 2, yMax = 14;

 const minVar = portfolios.find((p) => p.isMinVar)!;
 const maxSharpe = portfolios.find((p) => p.isMaxSharpe)!;
 const regular = portfolios.filter((p) => !p.isMinVar && !p.isMaxSharpe);

 const frontierPath = frontier
 .map((pt, i) => `${i === 0 ? "M" : "L"} ${scaleX(pt.x, xMin, xMax).toFixed(1)} ${scaleY(pt.y, yMin, yMax).toFixed(1)}`)
 .join("");

 const rf = 2.5;
 const cmlX2 = 23;
 const cmlY2 = Math.min(rf + maxSharpe.sharpe * cmlX2, yMax);

 return (
 <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-auto">
 {[4, 6, 8, 10, 12].map((v) => (
 <line key={`hy${v}`} x1={PAD.left} x2={SVG_W - PAD.right} y1={scaleY(v, yMin, yMax)} y2={scaleY(v, yMin, yMax)} stroke="#1e293b" strokeDasharray="4 4" />
 ))}
 {[8, 12, 16, 20].map((v) => (
 <line key={`vx${v}`} x1={scaleX(v, xMin, xMax)} x2={scaleX(v, xMin, xMax)} y1={PAD.top} y2={SVG_H - PAD.bottom} stroke="#1e293b" strokeDasharray="4 4" />
 ))}
 {/* Capital Market Line */}
 <line
 x1={scaleX(0, xMin, xMax)} y1={scaleY(rf, yMin, yMax)}
 x2={scaleX(cmlX2, xMin, xMax)} y2={scaleY(cmlY2, yMin, yMax)}
 stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="6 3" opacity={0.7}
 />
 <text x={scaleX(21, xMin, xMax) + 2} y={scaleY(rf + maxSharpe.sharpe * 21, yMin, yMax) - 5} fill="#fbbf24" fontSize={9} opacity={0.9}>CML</text>
 {/* Efficient frontier */}
 <path d={frontierPath} fill="none" stroke="#6366f1" strokeWidth={2.5} />
 {/* Random portfolios */}
 {regular.map((p, i) => (
 <circle key={i} cx={scaleX(p.x, xMin, xMax)} cy={scaleY(p.y, yMin, yMax)} r={4} fill="#334155" stroke="#475569" strokeWidth={1} opacity={0.85} />
 ))}
 {/* Min-variance circle */}
 <circle cx={scaleX(minVar.x, xMin, xMax)} cy={scaleY(minVar.y, yMin, yMax)} r={7} fill="#38bdf8" stroke="#0ea5e9" strokeWidth={1.5} />
 <text x={scaleX(minVar.x, xMin, xMax) + 10} y={scaleY(minVar.y, yMin, yMax) + 4} fill="#38bdf8" fontSize={9}>Min-Var</text>
 {/* Max-Sharpe triangle */}
 <polygon
 points={`${scaleX(maxSharpe.x, xMin, xMax)},${scaleY(maxSharpe.y, yMin, yMax) - 8} ${scaleX(maxSharpe.x, xMin, xMax) - 7},${scaleY(maxSharpe.y, yMin, yMax) + 5} ${scaleX(maxSharpe.x, xMin, xMax) + 7},${scaleY(maxSharpe.y, yMin, yMax) + 5}`}
 fill="#22c55e" stroke="#16a34a" strokeWidth={1.5}
 />
 <text x={scaleX(maxSharpe.x, xMin, xMax) + 10} y={scaleY(maxSharpe.y, yMin, yMax) + 4} fill="#22c55e" fontSize={9}>Max Sharpe</text>
 {/* Axes */}
 <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={SVG_H - PAD.bottom} stroke="#475569" />
 <line x1={PAD.left} y1={SVG_H - PAD.bottom} x2={SVG_W - PAD.right} y2={SVG_H - PAD.bottom} stroke="#475569" />
 {[4, 6, 8, 10, 12].map((v) => (
 <text key={`yl${v}`} x={PAD.left - 6} y={scaleY(v, yMin, yMax) + 4} fill="#64748b" fontSize={9} textAnchor="end">{v}%</text>
 ))}
 {[8, 12, 16, 20].map((v) => (
 <text key={`xl${v}`} x={scaleX(v, xMin, xMax)} y={SVG_H - PAD.bottom + 14} fill="#64748b" fontSize={9} textAnchor="middle">{v}%</text>
 ))}
 <text x={SVG_W / 2} y={SVG_H - 2} fill="#94a3b8" fontSize={10} textAnchor="middle">Portfolio Volatility (σ)</text>
 <text x={12} y={SVG_H / 2} fill="#94a3b8" fontSize={10} textAnchor="middle" transform={`rotate(-90,12,${SVG_H / 2})`}>Expected Return</text>
 </svg>
 );
}

function BLProcessSVG() {
 const steps = [
 { label: "Market\nEquilibrium", sub: "Reverse-optimize\nfrom cap weights", color: "#6366f1", x: 60 },
 { label: "Investor\nViews", sub: "Absolute &\nrelative views", color: "#f59e0b", x: 200 },
 { label: "Posterior\nDistribution", sub: "Bayesian\nblend (tau)", color: "#22c55e", x: 340 },
 { label: "Optimal\nWeights", sub: "MVO on\nposterior", color: "#ec4899", x: 440 },
 ];
 return (
 <svg viewBox="0 0 480 140" className="w-full h-auto">
 <defs>
 <marker id="bl-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
 <path d="M0,0 L0,6 L8,3 z" fill="#475569" />
 </marker>
 </defs>
 {[0, 1, 2].map((i) => (
 <line key={i} x1={steps[i].x + 42} y1={60} x2={steps[i + 1].x - 42} y2={60} stroke="#475569" strokeWidth={1.5} markerEnd="url(#bl-arrow)" />
 ))}
 {steps.map((step) => (
 <g key={step.label}>
 <rect x={step.x - 40} y={30} width={80} height={58} rx={6} fill={step.color} fillOpacity={0.15} stroke={step.color} strokeWidth={1.5} />
 {step.label.split("\n").map((line, li) => (
 <text key={li} x={step.x} y={52 + li * 13} fill={step.color} fontSize={10} fontWeight={600} textAnchor="middle">{line}</text>
 ))}
 {step.sub.split("\n").map((line, li) => (
 <text key={li} x={step.x} y={78 + li * 11} fill="#94a3b8" fontSize={8} textAnchor="middle">{line}</text>
 ))}
 </g>
 ))}
 <text x={270} y={48} fill="#64748b" fontSize={8} textAnchor="middle">tau (confidence)</text>
 <line x1={270} y1={50} x2={270} y2={30} stroke="#64748b" strokeWidth={1} strokeDasharray="3 2" />
 </svg>
 );
}

function BLWeightsChart() {
 const assets = ["US Eq", "Intl Eq", "EM Eq", "Bonds", "Commod"];
 const capWeights = [36, 22, 12, 24, 6];
 const blWeights = [42, 19, 17, 14, 8];
 const W = 480, H = 220;
 const barW = 28, gap = 12, groupGap = 20;
 const yMax = 50, baseY = H - 40, chartH = H - 60;
 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
 {[10, 20, 30, 40].map((v) => (
 <g key={v}>
 <line x1={30} x2={W - 10} y1={baseY - (v / yMax) * chartH} y2={baseY - (v / yMax) * chartH} stroke="#1e293b" strokeDasharray="4 4" />
 <text x={24} y={baseY - (v / yMax) * chartH + 4} fill="#64748b" fontSize={8} textAnchor="end">{v}%</text>
 </g>
 ))}
 {assets.map((name, i) => {
 const gx = 45 + i * (barW * 2 + gap + groupGap);
 const capH = (capWeights[i] / yMax) * chartH;
 const blH = (blWeights[i] / yMax) * chartH;
 return (
 <g key={name}>
 <rect x={gx} y={baseY - capH} width={barW} height={capH} rx={2} fill="#475569" opacity={0.8} />
 <rect x={gx + barW + gap} y={baseY - blH} width={barW} height={blH} rx={2} fill="#6366f1" opacity={0.9} />
 <text x={gx + barW / 2} y={baseY - capH - 3} fill="#94a3b8" fontSize={7} textAnchor="middle">{capWeights[i]}%</text>
 <text x={gx + barW + gap + barW / 2} y={baseY - blH - 3} fill="#a5b4fc" fontSize={7} textAnchor="middle">{blWeights[i]}%</text>
 <text x={gx + barW + gap / 2} y={baseY + 12} fill="#94a3b8" fontSize={8} textAnchor="middle">{name}</text>
 </g>
 );
 })}
 <rect x={W - 160} y={10} width={12} height={10} rx={2} fill="#475569" />
 <text x={W - 144} y={19} fill="#94a3b8" fontSize={9}>Cap Weight</text>
 <rect x={W - 80} y={10} width={12} height={10} rx={2} fill="#6366f1" />
 <text x={W - 64} y={19} fill="#a5b4fc" fontSize={9}>BL Weight</text>
 </svg>
 );
}

function RiskParityComparisonSVG() {
 const W = 480, H = 220;
 const methods: Array<{ name: string; key: keyof RiskParityAsset; color: string }> = [
 { name: "Market Cap", key: "mktWeight", color: "#475569" },
 { name: "Equal Weight", key: "equalWeight", color: "#38bdf8" },
 { name: "Risk Parity", key: "ercWeight", color: "#6366f1" },
 ];
 const barW = 26, gapBar = 3, groupGap = 18;
 const yMax = 50, baseY = H - 40, chartH = H - 60;
 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
 {[10, 20, 30, 40].map((v) => (
 <g key={v}>
 <line x1={30} x2={W - 10} y1={baseY - (v / yMax) * chartH} y2={baseY - (v / yMax) * chartH} stroke="#1e293b" strokeDasharray="4 4" />
 <text x={24} y={baseY - (v / yMax) * chartH + 4} fill="#64748b" fontSize={8} textAnchor="end">{v}%</text>
 </g>
 ))}
 {RISK_PARITY_ASSETS.map((asset, ai) => {
 const groupX = 36 + ai * ((barW + gapBar) * 3 + groupGap);
 return (
 <g key={asset.ticker}>
 {methods.map((method, mi) => {
 const val = asset[method.key] as number;
 const bH = (val / yMax) * chartH;
 const bX = groupX + mi * (barW + gapBar);
 return (
 <g key={method.name}>
 <rect x={bX} y={baseY - bH} width={barW} height={bH} rx={2} fill={method.color} opacity={0.85} />
 <text x={bX + barW / 2} y={baseY - bH - 3} fill="#94a3b8" fontSize={6.5} textAnchor="middle">{val.toFixed(0)}%</text>
 </g>
 );
 })}
 <text x={groupX + (barW + gapBar)} y={baseY + 12} fill="#94a3b8" fontSize={8} textAnchor="middle">{asset.ticker}</text>
 </g>
 );
 })}
 {methods.map((m, i) => (
 <g key={m.name}>
 <rect x={20 + i * 110} y={H - 18} width={10} height={8} rx={2} fill={m.color} />
 <text x={34 + i * 110} y={H - 11} fill="#94a3b8" fontSize={8}>{m.name}</text>
 </g>
 ))}
 </svg>
 );
}

function AllWeatherSVG() {
 const data = useMemo(() => generateAllWeatherSeries(), []);
 const W = SVG_W, H = 220;
 const padL = 50, padR = 16, padT = 16, padB = 36;
 const tMax = 63, yMin = 80, yMax = 240;

 function sx(t: number) { return padL + (t / tMax) * (W - padL - padR); }
 function sy(v: number) { return H - padB - ((v - yMin) / (yMax - yMin)) * (H - padT - padB); }
 function mkPath(vals: number[]) {
 return vals.map((v, i) => `${i === 0 ? "M" : "L"} ${sx(i).toFixed(1)} ${sy(v).toFixed(1)}`).join("");
 }

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
 {CRISIS_PERIODS.map((cp) => (
 <rect key={cp.name} x={sx(cp.start)} y={padT} width={sx(cp.end) - sx(cp.start)} height={H - padT - padB} fill="#ef4444" opacity={0.07} />
 ))}
 {[100, 120, 140, 160, 180, 200].map((v) => (
 <g key={v}>
 <line x1={padL} x2={W - padR} y1={sy(v)} y2={sy(v)} stroke="#1e293b" strokeDasharray="4 4" />
 <text x={padL - 6} y={sy(v) + 4} fill="#64748b" fontSize={8} textAnchor="end">{v}</text>
 </g>
 ))}
 <path d={mkPath(data.map((d) => d.rp))} fill="none" stroke="#6366f1" strokeWidth={2} />
 <path d={mkPath(data.map((d) => d.sixtForty))} fill="none" stroke="#22c55e" strokeWidth={1.5} strokeDasharray="5 3" />
 <path d={mkPath(data.map((d) => d.ew))} fill="none" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" />
 <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="#475569" />
 <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="#475569" />
 {([0, 16, 32, 48, 63] as const).map((t, i) => (
 <text key={t} x={sx(t)} y={H - padB + 14} fill="#64748b" fontSize={8} textAnchor="middle">
 {(["2008", "2010", "2013", "2016", "2019"] as const)[i]}
 </text>
 ))}
 <line x1={10} y1={12} x2={26} y2={12} stroke="#6366f1" strokeWidth={2} />
 <text x={29} y={16} fill="#a5b4fc" fontSize={8}>Risk Parity</text>
 <line x1={100} y1={12} x2={116} y2={12} stroke="#22c55e" strokeWidth={1.5} strokeDasharray="5 3" />
 <text x={119} y={16} fill="#86efac" fontSize={8}>60/40</text>
 <line x1={170} y1={12} x2={186} y2={12} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" />
 <text x={189} y={16} fill="#fcd34d" fontSize={8}>Equal Weight</text>
 </svg>
 );
}

function TurnoverSharpeSVG() {
 const data = useMemo(() => generateTurnoverPoints(), []);
 const W = SVG_W, H = 220;
 const padL = 50, padR = 20, padT = 16, padB = 40;
 const xMin = 0, xMax = 130, yMin = 0.1, yMax = 1.0;
 function sx(v: number) { return padL + ((v - xMin) / (xMax - xMin)) * (W - padL - padR); }
 function sy(v: number) { return H - padB - ((v - yMin) / (yMax - yMin)) * (H - padT - padB); }

 const path = data.map((d, i) => `${i === 0 ? "M" : "L"} ${sx(d.annualTurnover).toFixed(1)} ${sy(d.sharpe).toFixed(1)}`).join("");
 const optX1 = sx(20), optX2 = sx(55);

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
 <rect x={optX1} y={padT} width={optX2 - optX1} height={H - padT - padB} fill="#22c55e" opacity={0.06} />
 <text x={(optX1 + optX2) / 2} y={padT + 12} fill="#22c55e" fontSize={8} textAnchor="middle" opacity={0.8}>Optimal Zone</text>
 {[0.3, 0.5, 0.7, 0.9].map((v) => (
 <g key={v}>
 <line x1={padL} x2={W - padR} y1={sy(v)} y2={sy(v)} stroke="#1e293b" strokeDasharray="4 4" />
 <text x={padL - 6} y={sy(v) + 4} fill="#64748b" fontSize={8} textAnchor="end">{v.toFixed(1)}</text>
 </g>
 ))}
 <path d={path} fill="none" stroke="#6366f1" strokeWidth={2.5} />
 {data.map((d, i) => (
 <circle key={i} cx={sx(d.annualTurnover)} cy={sy(d.sharpe)} r={3} fill="#6366f1" opacity={0.7} />
 ))}
 <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="#475569" />
 <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="#475569" />
 {[0, 30, 60, 90, 120].map((v) => (
 <text key={v} x={sx(v)} y={H - padB + 14} fill="#64748b" fontSize={8} textAnchor="middle">{v}%</text>
 ))}
 <text x={W / 2} y={H - 2} fill="#94a3b8" fontSize={9} textAnchor="middle">Annual Turnover</text>
 <text x={12} y={H / 2} fill="#94a3b8" fontSize={9} textAnchor="middle" transform={`rotate(-90,12,${H / 2})`}>Sharpe Ratio</text>
 </svg>
 );
}

function NoTradeBandSVG() {
 const data = useMemo(() => generateNoBandData(), []);
 const W = 480, H = 180;
 const padL = 44, padR = 16, padT = 16, padB = 30;
 const xMin = 0, xMax = 23, yMin = 0.15, yMax = 0.45;
 function sx(v: number) { return padL + ((v - xMin) / (xMax - xMin)) * (W - padL - padR); }
 function sy(v: number) { return H - padB - ((v - yMin) / (yMax - yMin)) * (H - padT - padB); }

 const upperPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${sx(d.x).toFixed(1)} ${sy(d.upper).toFixed(1)}`).join("");
 const lowerPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${sx(d.x).toFixed(1)} ${sy(d.lower).toFixed(1)}`).join("");
 const actualPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${sx(d.x).toFixed(1)} ${sy(d.actual).toFixed(1)}`).join("");
 const targetPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${sx(d.x).toFixed(1)} ${sy(d.target).toFixed(1)}`).join("");
 const bandFill = [
 ...data.map((d, i) => `${i === 0 ? "M" : "L"} ${sx(d.x).toFixed(1)} ${sy(d.upper).toFixed(1)}`),
 ...data.slice().reverse().map((d) => `L ${sx(d.x).toFixed(1)} ${sy(d.lower).toFixed(1)}`),
 "Z",
 ].join("");

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
 <path d={bandFill} fill="#6366f1" opacity={0.08} />
 <path d={upperPath} fill="none" stroke="#6366f1" strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
 <path d={lowerPath} fill="none" stroke="#6366f1" strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
 <path d={targetPath} fill="none" stroke="#94a3b8" strokeWidth={1} strokeDasharray="6 3" />
 <path d={actualPath} fill="none" stroke="#22c55e" strokeWidth={2} />
 {[0.20, 0.25, 0.30, 0.35, 0.40].map((v) => (
 <g key={v}>
 <line x1={padL} x2={W - padR} y1={sy(v)} y2={sy(v)} stroke="#1e293b" strokeDasharray="3 3" />
 <text x={padL - 6} y={sy(v) + 4} fill="#64748b" fontSize={7.5} textAnchor="end">{(v * 100).toFixed(0)}%</text>
 </g>
 ))}
 <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="#475569" />
 <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="#475569" />
 {[0, 6, 12, 18, 23].map((v) => (
 <text key={v} x={sx(v)} y={H - padB + 12} fill="#64748b" fontSize={7.5} textAnchor="middle">M{v + 1}</text>
 ))}
 <line x1={padL} y1={H - 6} x2={padL + 16} y2={H - 6} stroke="#22c55e" strokeWidth={2} />
 <text x={padL + 20} y={H - 3} fill="#86efac" fontSize={7.5}>Actual Weight</text>
 <line x1={padL + 100} y1={H - 6} x2={padL + 116} y2={H - 6} stroke="#94a3b8" strokeWidth={1} strokeDasharray="6 3" />
 <text x={padL + 120} y={H - 3} fill="#94a3b8" fontSize={7.5}>Target</text>
 <rect x={padL + 190} y={H - 12} width={14} height={8} rx={2} fill="#6366f1" opacity={0.25} />
 <text x={padL + 208} y={H - 5} fill="#a5b4fc" fontSize={7.5}>No-Trade Band</text>
 </svg>
 );
}

function StrategyTurnoverSVG() {
 const W = 480;
 const padL = 62, padR = 16, padT = 20, padB = 20;
 const xMax = 900;
 const barH = 18, barGap = 8;
 const totalH = STRATEGY_TURNOVER.length * (barH + barGap);
 const chartW = W - padL - padR;
 const svgH = padT + totalH + padB;

 function bw(v: number) { return (v / xMax) * chartW; }

 return (
 <svg viewBox={`0 0 ${W} ${svgH}`} className="w-full h-auto">
 {[100, 200, 400, 600, 800].map((v) => (
 <g key={v}>
 <line x1={padL + bw(v)} y1={padT - 4} x2={padL + bw(v)} y2={padT + totalH} stroke="#1e293b" strokeDasharray="3 3" />
 <text x={padL + bw(v)} y={padT + totalH + 14} fill="#64748b" fontSize={7.5} textAnchor="middle">{v}%</text>
 </g>
 ))}
 {STRATEGY_TURNOVER.map((st, i) => {
 const y = padT + i * (barH + barGap);
 const w = bw(st.turnover);
 return (
 <g key={st.name}>
 <text x={padL - 6} y={y + barH / 2 + 4} fill="#94a3b8" fontSize={8.5} textAnchor="end">{st.name}</text>
 <rect x={padL} y={y} width={Math.max(w, 2)} height={barH} rx={3} fill={st.color} opacity={0.85} />
 <text x={padL + w + 4} y={y + barH / 2 + 4} fill={st.color} fontSize={8} opacity={0.9}>{st.turnover}%</text>
 </g>
 );
 })}
 <line x1={padL} y1={padT - 4} x2={padL} y2={padT + totalH} stroke="#475569" />
 </svg>
 );
}

// ── Shared UI ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
 return (
 <div className="flex items-start justify-between py-2 border-b border-border last:border-0">
 <span className="text-muted-foreground text-sm">{label}</span>
 <div className="text-right">
 <span className="text-foreground text-sm font-medium">{value}</span>
 {sub && <p className="text-muted-foreground text-xs mt-0.5">{sub}</p>}
 </div>
 </div>
 );
}

interface ConceptCardProps {
 title: string;
 description: string;
 details: string[];
 accent: string;
 icon: React.ReactNode;
}

function ConceptCard({ title, description, details, accent, icon }: ConceptCardProps) {
 const [expanded, setExpanded] = useState(false);
 return (
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <div className="flex items-start justify-between gap-3">
 <div className="flex items-center gap-2">
 <div className={`p-1.5 rounded ${accent}`}>{icon}</div>
 <CardTitle className="text-sm text-foreground">{title}</CardTitle>
 </div>
 <button
 onClick={() => setExpanded((e) => !e)}
 className="text-muted-foreground hover:text-muted-foreground transition-colors flex-shrink-0"
 >
 {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
 </button>
 </div>
 <p className="text-muted-foreground text-xs mt-1">{description}</p>
 </CardHeader>
 <AnimatePresence initial={false}>
 {expanded && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: "auto", opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 transition={{ duration: 0.2 }}
 className="overflow-hidden"
 >
 <CardContent className="pt-0 pb-3">
 <ul className="space-y-1.5">
 {details.map((d, i) => (
 <li key={i} className="flex items-start gap-2 text-muted-foreground text-xs">
 <span className="text-muted-foreground mt-0.5">&#x2022;</span>
 <span>{d}</span>
 </li>
 ))}
 </ul>
 </CardContent>
 </motion.div>
 )}
 </AnimatePresence>
 </Card>
 );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function QuantPortfolioPage() {
 const [activeTab, setActiveTab] = useState("mvo");
 const [selectedConstraint, setSelectedConstraint] = useState<"long-only" | "unconstrained">("long-only");
 const [covMethod, setCovMethod] = useState<"sample" | "shrinkage" | "factor">("shrinkage");
 const [selectedView, setSelectedView] = useState<string | null>(null);

 const selectedViewObj = BL_VIEWS.find((v) => v.id === selectedView) ?? null;

 return (
 <div className="flex h-full flex-col overflow-y-auto">
  <div className="mx-auto w-full max-w-5xl px-6 py-8 flex-1 flex flex-col">
  <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Quant Portfolio</h1>
  <p className="text-sm text-muted-foreground mb-6">OPTIMIZATION · RISK · FACTOR · CONSTRAINTS</p>

 <Tabs value={activeTab} onValueChange={setActiveTab}>
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto mb-6">
 <TabsTrigger value="mvo" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Mean-Variance
 </TabsTrigger>
 <TabsTrigger value="bl" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Black-Litterman
 </TabsTrigger>
 <TabsTrigger value="rp" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Risk Parity
 </TabsTrigger>
 <TabsTrigger value="tc" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Txn Cost Opt
 </TabsTrigger>
 </TabsList>

 {/* ═══════════════════════════════════════════════
 TAB 1 — Mean-Variance Optimization
 ═══════════════════════════════════════════════ */}
 <TabsContent value="mvo" className="data-[state=inactive]:hidden">
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
 {/* Controls */}
 <div className="space-y-4">
 <Card className="bg-card border-border border-l-4 border-l-primary">
 <CardHeader className="pb-2 p-4">
 <CardTitle className="text-lg flex items-center gap-2">
 Optimization Settings
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <div>
 <p className="text-xs text-muted-foreground mb-2">Constraint Mode</p>
 <div className="flex gap-2">
 {(["long-only", "unconstrained"] as const).map((c) => (
 <button
 key={c}
 onClick={() => setSelectedConstraint(c)}
 className={`flex-1 py-1.5 rounded text-xs text-muted-foreground font-medium border transition-colors ${
 selectedConstraint === c
 ? "bg-indigo-600 border-indigo-500 text-foreground"
 : "bg-muted border-border text-muted-foreground hover:text-foreground"
 }`}
 >
 {c === "long-only" ? "Long-Only" : "Unconstrained"}
 </button>
 ))}
 </div>
 {selectedConstraint === "unconstrained" && (
 <p className="text-amber-400 text-xs mt-1.5 flex items-start gap-1">
 Short positions produce higher in-sample Sharpe but severe out-of-sample degradation due to estimation error amplification.
 </p>
 )}
 </div>
 <div>
 <p className="text-xs text-muted-foreground mb-2">Covariance Estimator</p>
 <div className="space-y-1.5">
 {(
 [
 { key: "sample" as const, label: "Sample Covariance", sub: "Noisy for small T/N, overfits" },
 { key: "shrinkage" as const, label: "Ledoit-Wolf Shrinkage", sub: "Oracle shrinkage toward identity" },
 { key: "factor" as const, label: "Factor Model (Barra)", sub: "Structured: Sigma = B*F*B' + D" },
 ]
 ).map((m) => (
 <button
 key={m.key}
 onClick={() => setCovMethod(m.key)}
 className={`w-full text-left px-3 py-2 rounded border text-xs text-muted-foreground transition-colors ${
 covMethod === m.key
 ? "bg-muted border-indigo-500/50 text-foreground"
 : "bg-card border-border text-muted-foreground hover:border-border"
 }`}
 >
 <span className="font-medium block">{m.label}</span>
 <span className="text-muted-foreground">{m.sub}</span>
 </button>
 ))}
 </div>
 </div>
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center gap-2">
 Key Portfolios
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-0">
 <InfoRow label="Min-Variance" value="sigma=6.2%, mu=5.1%" sub="Max bonds / defensive tilt" />
 <InfoRow label="Max Sharpe (Tangency)" value="SR=0.64" sub="sigma=11.4%, mu=9.8%" />
 <InfoRow label="Equal Weight" value="sigma=14.1%, mu=8.3%" sub="1/N naive baseline" />
 <InfoRow
 label="Constraint"
 value={selectedConstraint === "long-only" ? "w >= 0" : "w in R"}
 sub={selectedConstraint === "long-only" ? "Stable, implementable" : "Extreme positions, lever possible"}
 />
 <InfoRow
 label="Cov Estimator"
 value={covMethod === "sample" ? "Sample" : covMethod === "shrinkage" ? "Shrinkage" : "Factor"}
 sub={covMethod === "sample" ? "High estimation error" : covMethod === "shrinkage" ? "Noise reduced ~40%" : "Structured + residual"}
 />
 </CardContent>
 </Card>
 </div>

 {/* Frontier + concept cards */}
 <div className="lg:col-span-2 space-y-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center gap-2">
 Efficient Frontier — 5-Asset Universe (Seed 913)
 </CardTitle>
 <p className="text-muted-foreground text-xs">
 20 random feasible portfolios (grey). Indigo curve = efficient frontier. Circle = Min-Var. Triangle = Max Sharpe. Yellow dashed = CML (rf=2.5%).
 </p>
 </CardHeader>
 <CardContent>
 <EfficientFrontierSVG />
 </CardContent>
 </Card>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <ConceptCard
 title="Input Sensitivity"
 description="MVO is an error-maximizer — small return changes drive large weight swings."
 accent="bg-amber-500/10"
 icon={<SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />}
 details={[
 "A 1% change in expected return estimates can shift portfolio weights by 20-30%.",
 "Estimation error in returns is ~10x more impactful than errors in covariances.",
 "Resampling: average weights across 500 simulated frontiers for stability.",
 "Black-Litterman addresses this by shrinking views toward market priors.",
 "Robust MVO uses worst-case return scenarios — a deterministic alternative.",
 ]}
 />
 <ConceptCard
 title="Corner Portfolios"
 description="Points where an asset enters or exits the long-only efficient frontier."
 accent="bg-indigo-500/10"
 icon={<GitMerge className="w-3.5 h-3.5 text-indigo-400" />}
 details={[
 "The entire long-only frontier is described exactly by corner portfolios.",
 "Weights change linearly between consecutive corner portfolios.",
 "At most N+1 corner portfolios for N assets under the long-only constraint.",
 "Critical path algorithm (Markowitz 1956) traces the frontier efficiently.",
 ]}
 />
 <ConceptCard
 title="Resampling (Michaud)"
 description="Monte Carlo over input uncertainty — average frontiers for robustness."
 accent="bg-green-500/10"
 icon={<RefreshCw className="w-3.5 h-3.5 text-green-400" />}
 details={[
 "Draw 500 perturbed (mu, Sigma) pairs from their sampling distributions.",
 "Optimize each and average corresponding target-return weights.",
 "Produces smoother, more diversified allocations than single-run MVO.",
 "Out-of-sample Sharpe improvement of ~15-25% vs classic MVO in studies.",
 ]}
 />
 <ConceptCard
 title="Factor Model Covariance"
 description="Decompose Sigma = B*F*B' + D for structured, low-noise estimation."
 accent="bg-sky-500/10"
 icon={<Layers className="w-3.5 h-3.5 text-sky-400" />}
 details={[
 "B = NxK factor loadings, F = KxK factor covariance, D = diagonal idiosyncratic.",
 "Reduces free parameters from N(N+1)/2 to K(K+1)/2 + N.",
 "For N=500, K=5 factors: from 125,250 to just 510 parameters to estimate.",
 "Commercial providers: MSCI Barra, Axioma, FactSet.",
 ]}
 />
 </div>
 </div>
 </div>
 </TabsContent>

 {/* ═══════════════════════════════════════════════
 TAB 2 — Black-Litterman
 ═══════════════════════════════════════════════ */}
 <TabsContent value="bl" className="data-[state=inactive]:hidden">
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
 <div className="space-y-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center gap-2">
 Investor Views
 </CardTitle>
 <p className="text-muted-foreground text-xs">Click a view to inspect confidence and weight impact</p>
 </CardHeader>
 <CardContent className="space-y-2">
 {BL_VIEWS.map((view) => (
 <button
 key={view.id}
 onClick={() => setSelectedView(selectedView === view.id ? null : view.id)}
 className={`w-full text-left px-3 py-2.5 rounded border text-xs text-muted-foreground transition-colors ${
 selectedView === view.id
 ? "bg-indigo-600/20 border-indigo-500/50"
 : "bg-muted border-border hover:border-border"
 }`}
 >
 <div className="flex items-center justify-between mb-1">
 <span className="font-medium text-foreground">{view.asset}</span>
 <Badge
 variant="outline"
 className={`text-xs ${view.type === "absolute" ? "border-sky-500/50 text-sky-400" : "border-primary/50 text-foreground"}`}
 >
 {view.type}
 </Badge>
 </div>
 <p className="text-muted-foreground">{view.view}</p>
 <div className="flex items-center gap-2 mt-1.5">
 <span className="text-muted-foreground">Confidence:</span>
 <Progress value={view.confidence * 100} className="h-1.5 flex-1" />
 <span className="text-muted-foreground font-medium">{(view.confidence * 100).toFixed(0)}%</span>
 </div>
 </button>
 ))}
 </CardContent>
 </Card>

 <AnimatePresence>
 {selectedViewObj && (
 <motion.div
 initial={{ opacity: 0, y: -8 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -8 }}
 transition={{ duration: 0.18 }}
 >
 <Card className="bg-indigo-950/40 border-indigo-500/30">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-indigo-300">View Detail: {selectedViewObj.asset}</CardTitle>
 </CardHeader>
 <CardContent className="space-y-0">
 <InfoRow label="Expected Return" value={`${selectedViewObj.expectedReturn}%`} />
 <InfoRow label="View Type" value={selectedViewObj.type === "absolute" ? "Absolute (P=e_i)" : "Relative (P=e_i minus e_j)"} />
 <InfoRow label="Confidence (1-tau*Omega)" value={`${(selectedViewObj.confidence * 100).toFixed(0)}%`} />
 <InfoRow
 label="Weight Impact"
 value={selectedViewObj.confidence > 0.6 ? "High" : selectedViewObj.confidence > 0.45 ? "Moderate" : "Low"}
 sub="Deviation from equilibrium cap weight"
 />
 </CardContent>
 </Card>
 </motion.div>
 )}
 </AnimatePresence>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center gap-2">
 Tau Parameter
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-0">
 <InfoRow label="Typical Range" value="0.01 to 0.10" sub="Scalar scaling view uncertainty Omega" />
 <InfoRow label="tau to 0" value="Ignore views" sub="Pure market equilibrium portfolio" />
 <InfoRow label="tau to inf" value="Trust views" sub="Converges to naive MVO" />
 <InfoRow label="Rule of thumb" value="tau = 1/T" sub="T = estimation sample length in months" />
 </CardContent>
 </Card>
 </div>

 <div className="lg:col-span-2 space-y-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center gap-2">
 BL Process Flow
 </CardTitle>
 <p className="text-muted-foreground text-xs">
 Reverse optimization extracts implied returns from cap weights. Views are blended via Bayes. tau governs how strongly views override equilibrium.
 </p>
 </CardHeader>
 <CardContent>
 <BLProcessSVG />
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center gap-2">
 Output Weights: BL vs Cap Weight Benchmark
 </CardTitle>
 <p className="text-muted-foreground text-xs">
 Views boost US Equity (+6%) and EM (+5%). Bonds cut 10% on inflation view. All positions remain within implementable range.
 </p>
 </CardHeader>
 <CardContent>
 <BLWeightsChart />
 </CardContent>
 </Card>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <ConceptCard
 title="Advantages over Naive MVO"
 description="BL produces more stable, intuitive, and implementable portfolios."
 accent="bg-green-500/10"
 icon={<TrendingUp className="w-3.5 h-3.5 text-green-400" />}
 details={[
 "No extreme long/short positions from small changes in return estimates.",
 "Cap-weight equilibrium serves as a sensible Bayesian prior.",
 "Assets without views remain at equilibrium — only active tilts shift.",
 "Lower turnover vs naive MVO re-runs, reducing transaction costs.",
 "Outputs interpretable: tilt = f(view strength, confidence, tau).",
 ]}
 />
 <ConceptCard
 title="Reverse Optimization"
 description="Extract implied returns Pi = delta*Sigma*w_mkt from market cap weights."
 accent="bg-sky-500/10"
 icon={<RefreshCw className="w-3.5 h-3.5 text-sky-400" />}
 details={[
 "delta = risk aversion = (E[rm]-rf) / sigma^2_mkt, typically 2.5 to 4.",
 "Sigma is the asset covariance matrix (prefer shrinkage or factor model).",
 "w_mkt = float-adjusted global market cap weights.",
 "Without any views, BL reproduces exactly the market-cap portfolio.",
 "Handles illiquid assets by using proxy weights in the equilibrium step.",
 ]}
 />
 </div>
 </div>
 </div>
 </TabsContent>

 {/* ═══════════════════════════════════════════════
 TAB 3 — Risk Parity & Alternatives
 ═══════════════════════════════════════════════ */}
 <TabsContent value="rp" className="data-[state=inactive]:hidden">
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
 <div className="space-y-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center gap-2">
 Asset Risk Contributions
 </CardTitle>
 <p className="text-muted-foreground text-xs">ERC targets equal 20% risk contribution per asset regardless of weight</p>
 </CardHeader>
 <CardContent className="space-y-3">
 {RISK_PARITY_ASSETS.map((asset) => (
 <div key={asset.ticker} className="space-y-1">
 <div className="flex items-center justify-between text-xs text-muted-foreground">
 <span className="font-medium" style={{ color: asset.color }}>{asset.ticker}</span>
 <span className="text-muted-foreground">{asset.name}</span>
 </div>
 <div className="grid grid-cols-3 gap-1 text-xs text-muted-foreground text-center">
 {[
 { label: "Mkt Cap", val: `${asset.mktWeight}%`, cls: "text-muted-foreground" },
 { label: "Equal", val: "20%", cls: "text-sky-400" },
 { label: "ERC", val: `${asset.ercWeight}%`, cls: "text-indigo-400" },
 ].map((cell) => (
 <div key={cell.label}>
 <div className="text-muted-foreground text-xs">{cell.label}</div>
 <div className={`font-medium ${cell.cls}`}>{cell.val}</div>
 </div>
 ))}
 </div>
 <div className="h-1 bg-muted rounded-full overflow-hidden">
 <div className="h-full rounded-full" style={{ width: `${asset.ercWeight * 2}%`, backgroundColor: asset.color }} />
 </div>
 </div>
 ))}
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm">Crisis Period Comparison</CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 {CRISIS_PERIODS.map((cp) => (
 <div key={cp.name}>
 <p className="text-xs font-medium text-muted-foreground mb-1">{cp.name}</p>
 <div className="grid grid-cols-3 gap-1 text-xs text-muted-foreground text-center">
 {[
 { label: "Risk Parity", val: cp.rp },
 { label: "60/40", val: cp.mkt },
 { label: "Equal Wt", val: cp.ew },
 ].map((cell) => (
 <div key={cell.label}>
 <div className="text-muted-foreground text-xs">{cell.label}</div>
 <div className={`font-medium ${cell.val >= 0 ? "text-green-400" : "text-red-400"}`}>
 {cell.val >= 0 ? "+" : ""}{cell.val}%
 </div>
 </div>
 ))}
 </div>
 </div>
 ))}
 </CardContent>
 </Card>
 </div>

 <div className="lg:col-span-2 space-y-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center gap-2">
 Weight Comparison: Market Cap vs Equal Weight vs ERC
 </CardTitle>
 <p className="text-muted-foreground text-xs">
 ERC heavily overweights Bonds and Commodities vs cap weight because their low volatility means each dollar contributes less portfolio risk.
 </p>
 </CardHeader>
 <CardContent>
 <RiskParityComparisonSVG />
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center gap-2">
 All-Weather Performance (Indexed 100, 2008 to 2019)
 </CardTitle>
 <p className="text-muted-foreground text-xs">
 Red shading = crisis periods. Risk Parity uses leverage on bonds to equalize risk. Shallower drawdowns in most crises except rate shocks.
 </p>
 </CardHeader>
 <CardContent>
 <AllWeatherSVG />
 </CardContent>
 </Card>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <ConceptCard
 title="Hierarchical Risk Parity (HRP)"
 description="Cluster assets hierarchically, allocate inverse-variance within clusters."
 accent="bg-indigo-500/10"
 icon={<GitMerge className="w-3.5 h-3.5 text-indigo-400" />}
 details={[
 "Step 1: Compute Ledoit-Wolf correlation matrix.",
 "Step 2: Hierarchical cluster by distance d = sqrt((1-rho)/2).",
 "Step 3: Recursive bisection, inverse-variance weight within each cluster.",
 "No matrix inversion — avoids near-singular covariance instability.",
 "Lopez de Prado (2016): HRP beats MVO OOS on Sharpe and turnover.",
 ]}
 />
 <ConceptCard
 title="Volatility Targeting"
 description="Scale leverage to maintain a constant realized portfolio volatility."
 accent="bg-amber-500/10"
 icon={<Target className="w-3.5 h-3.5 text-amber-400" />}
 details={[
 "Multiplier = sigma_target / sigma_realized; applied to base weights.",
 "Reduces leverage in high-vol regimes, increases in calm periods.",
 "Improves Sharpe by 15-25% vs static weights via risk timing.",
 "EWMA vol (lambda=0.94) is standard; GARCH more accurate but complex.",
 "Key risk: leverage drawdown if realized vol spikes faster than adjustment.",
 ]}
 />
 <ConceptCard
 title="Maximum Diversification"
 description="Maximize DR = weighted-avg vol divided by portfolio vol."
 accent="bg-green-500/10"
 icon={<Layers className="w-3.5 h-3.5 text-green-400" />}
 details={[
 "DR = sum(w_i * sigma_i) / sigma_p, always >= 1; higher = better.",
 "Choueifat & Coignard (2008): MDP maximizes pairwise diversification.",
 "Equivalent to Max-Sharpe when all assets have equal Sharpe ratios.",
 "In practice, tilts heavily toward low-correlation defensive assets.",
 ]}
 />
 <ConceptCard
 title="Inverse-Volatility Weighting"
 description="w_i = (1/sigma_i) / sum(1/sigma_j) — simplest risk parity approximation."
 accent="bg-sky-500/10"
 icon={<Activity className="w-3.5 h-3.5 text-sky-400" />}
 details={[
 "Ignores correlations — sets all cross-terms to zero implicitly.",
 "Performs surprisingly well because correlation instability dominates.",
 "Computationally trivial, easy to explain to non-quant stakeholders.",
 "Most effective when assets have very different volatility levels.",
 ]}
 />
 </div>
 </div>
 </div>
 </TabsContent>

 {/* ═══════════════════════════════════════════════
 TAB 4 — Transaction Cost Optimization
 ═══════════════════════════════════════════════ */}
 <TabsContent value="tc" className="data-[state=inactive]:hidden">
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
 <div className="space-y-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center gap-2">
 Market Impact Models
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-0">
 <InfoRow label="Linear" value="TC = c * x" sub="Suitable for small / liquid trades" />
 <InfoRow label="Square Root" value="TC = c * sqrt(x/ADV)" sub="Almgren-Chriss; standard > 1% ADV" />
 <InfoRow label="Three-Fifths" value="TC = c * (x/ADV)^0.6" sub="Empirical fit for mid-cap stocks" />
 <InfoRow label="Bid-Ask Spread" value="0.5 * spread * x" sub="Fixed component, unavoidable" />
 <InfoRow label="Timing Risk" value="sigma * sqrt(T)" sub="Price moves during execution" />
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center gap-2">
 Rebalancing Triggers
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-2">
 {[
 { name: "Calendar", period: "Monthly/Quarterly", pro: "Simple, predictable", con: "Rebalances unnecessarily" },
 { name: "Threshold Band", period: "Drift > 5%", pro: "Cost-efficient, risk-aware", con: "Requires continuous monitoring" },
 { name: "Factor Drift", period: "Factor exposure", pro: "Maintains factor purity", con: "Complex, model-dependent" },
 { name: "Vol Target", period: "Vol regime shift", pro: "Dynamic risk management", con: "High turnover in vol spikes" },
 ].map((t) => (
 <div key={t.name} className="px-3 py-2 rounded bg-muted border border-border text-xs text-muted-foreground">
 <div className="flex items-center justify-between mb-1">
 <span className="font-medium text-foreground">{t.name}</span>
 <Badge variant="outline" className="text-xs border-border text-muted-foreground">{t.period}</Badge>
 </div>
 <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
 <span className="text-green-400">+ {t.pro}</span>
 <span className="text-red-400">- {t.con}</span>
 </div>
 </div>
 ))}
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center gap-2">
 Tax Lot Optimization
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-0">
 <InfoRow label="HIFO Method" value="Highest-In-First-Out" sub="Minimize realized capital gains" />
 <InfoRow label="Tax-Loss Harvest" value="Sell losers in Dec" sub="Realize losses to offset gains" />
 <InfoRow label="Wash Sale Rule" value="30-day window" sub="Cannot repurchase same security" />
 <InfoRow label="Long-Term Rate" value="> 1 year hold" sub="15-20% vs 37% short-term rate" />
 <InfoRow label="After-Tax Alpha" value="+0.5 to 2.0% p.a." sub="Direct indexing advantage" />
 </CardContent>
 </Card>
 </div>

 <div className="lg:col-span-2 space-y-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center gap-2">
 Turnover vs Net Sharpe Tradeoff
 </CardTitle>
 <p className="text-muted-foreground text-xs">
 Adding a turnover penalty lambda reduces churn but compresses net Sharpe. Green zone = optimal range (~20-55% annual turnover for typical institutional strategies).
 </p>
 </CardHeader>
 <CardContent>
 <TurnoverSharpeSVG />
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center gap-2">
 No-Trade Band: Asset Weight Drift vs Target
 </CardTitle>
 <p className="text-muted-foreground text-xs">
 Green = actual weight. Indigo band = ±3% no-trade zone. Rebalancing only triggers when weight exits the band, dramatically reducing unnecessary turnover.
 </p>
 </CardHeader>
 <CardContent>
 <NoTradeBandSVG />
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center gap-2">
 Annual Turnover by Strategy Type
 </CardTitle>
 <p className="text-muted-foreground text-xs">
 Higher turnover erodes alpha through market impact, commissions, and bid-ask spread. Even 100 bps/year in frictions compounds to materially lower terminal wealth.
 </p>
 </CardHeader>
 <CardContent>
 <StrategyTurnoverSVG />
 </CardContent>
 </Card>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <ConceptCard
 title="Multi-Period Optimization"
 description="Plan T steps ahead to avoid costly round-trips from myopic single-period solves."
 accent="bg-indigo-500/10"
 icon={<Layers className="w-3.5 h-3.5 text-indigo-400" />}
 details={[
 "Single-period MVO is myopic — ignores that today's trade sets up future costs.",
 "MPC plans T steps ahead but only executes step 1, then re-solves.",
 "Reduces round-trip trades by ~30% vs myopic approach in backtests.",
 "Requires return forecasts over the planning horizon — adds model risk.",
 "Boyd et al. (2017) 'Multi-Period Trading via Convex Optimization' is the reference.",
 ]}
 />
 <ConceptCard
 title="Cost-Aware Objective"
 description="Maximize alpha minus lambda_risk*sigma^2 minus lambda_TC*TC(trade) in one convex problem."
 accent="bg-green-500/10"
 icon={<DollarSign className="w-3.5 h-3.5 text-green-400" />}
 details={[
 "lambda_TC is the turnover aversion calibrated to actual cost structure.",
 "TC includes linear spread + sqrt market impact + fixed commissions.",
 "Soft turnover constraint: penalize in objective vs hard cap on max trades.",
 "Convex if TC model is convex (linear or sqrt) — standard QP solvers apply.",
 "Enables simultaneous long/short netting within the same optimization solve.",
 ]}
 />
 </div>
 </div>
 </div>
 </TabsContent>
 </Tabs>
 </div>
  </div>
 );
}
