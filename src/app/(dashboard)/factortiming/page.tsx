"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
 TrendingUp,
 TrendingDown,
 Minus,
 BarChart3,
 Activity,
 Layers,
 Target,
 Shield,
 Zap,
 Info,
 RefreshCw,
 AlertTriangle,
 CheckCircle,
 DollarSign,
 Clock,
 ArrowUpRight,
 ArrowDownRight,
 ChevronRight,
 Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Seeded PRNG (seed=722005) ─────────────────────────────────────────────────
let s = 722005;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};
function resetSeed(seed: number) {
 s = seed;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type FactorName = "Value" | "Momentum" | "Quality" | "Low-Vol" | "Size";
type Trend = "up" | "down" | "flat";
type Weight = "overweight" | "neutral" | "underweight";
type Regime = "Recovery" | "Expansion" | "Slowdown" | "Contraction";
type AssetClass = "Equities" | "Bonds" | "Commodities" | "FX";

interface FactorSignal {
 name: FactorName;
 zScore: number;
 trend: Trend;
 weight: Weight;
 color: string;
 description: string;
 crowding: number; // 0-1
}

interface CrossAssetItem {
 ticker: string;
 name: string;
 assetClass: AssetClass;
 momentum12m: number; // percent
 momentum3m: number;
 signal: "buy" | "hold" | "sell";
}

interface FactorCycleEntry {
 regime: Regime;
 value: number;
 momentum: number;
 quality: number;
 lowVol: number;
 size: number;
}

interface FactorCorr {
 a: FactorName;
 b: FactorName;
 corr: number;
}

interface TacticalRule {
 asset: string;
 ticker: string;
 price: number;
 ma200: number;
 signal: "above" | "below";
 stratReturn: number; // cumulative %
 bHReturn: number;
 color: string;
}

interface FactorETF {
 ticker: string;
 name: string;
 factor: FactorName | "Size";
 aum: number; // billions
 expense: number; // %/yr
 turnover: number; // %/yr
 taxDrag: number; // basis points estimate
 ytd: number; // %
 inception: number; // year
 description: string;
}

// ── Static Data (seeded) ───────────────────────────────────────────────────────

function buildData() {
 resetSeed(722005);

 const factorSignals: FactorSignal[] = [
 {
 name: "Value",
 zScore: +(rand() * 3 - 1.5).toFixed(2),
 trend: (["up", "flat", "down"] as Trend[])[Math.floor(rand() * 3)],
 weight: "overweight",
 color: "#3b82f6",
 description: "Cheap vs expensive stocks — P/E, P/B, EV/EBITDA spreads",
 crowding: +(rand() * 0.5 + 0.2).toFixed(2),
 },
 {
 name: "Momentum",
 zScore: +(rand() * 3 - 0.5).toFixed(2),
 trend: (["up", "flat", "down"] as Trend[])[Math.floor(rand() * 3)],
 weight: "overweight",
 color: "#10b981",
 description: "12-1 month price momentum with skip-month effect",
 crowding: +(rand() * 0.5 + 0.3).toFixed(2),
 },
 {
 name: "Quality",
 zScore: +(rand() * 2 - 0.5).toFixed(2),
 trend: (["up", "flat", "down"] as Trend[])[Math.floor(rand() * 3)],
 weight: "neutral",
 color: "#8b5cf6",
 description: "High ROE, stable earnings, low leverage composites",
 crowding: +(rand() * 0.4 + 0.15).toFixed(2),
 },
 {
 name: "Low-Vol",
 zScore: +(rand() * 2 - 1.2).toFixed(2),
 trend: (["up", "flat", "down"] as Trend[])[Math.floor(rand() * 3)],
 weight: "underweight",
 color: "#f59e0b",
 description: "Minimum variance / beta-weighted low-risk securities",
 crowding: +(rand() * 0.6 + 0.35).toFixed(2),
 },
 {
 name: "Size",
 zScore: +(rand() * 2.5 - 1.0).toFixed(2),
 trend: (["up", "flat", "down"] as Trend[])[Math.floor(rand() * 3)],
 weight: "neutral",
 color: "#ec4899",
 description: "Small-cap premium over large-cap (Fama-French SMB)",
 crowding: +(rand() * 0.45 + 0.1).toFixed(2),
 },
 ];

 const crossAssets: CrossAssetItem[] = [
 // Equities
 { ticker: "SPY", name: "US Large Cap", assetClass: "Equities", momentum12m: +(rand() * 40 - 5).toFixed(1), momentum3m: +(rand() * 20 - 5).toFixed(1), signal: "buy" },
 { ticker: "EEM", name: "Emerging Markets", assetClass: "Equities", momentum12m: +(rand() * 30 - 10).toFixed(1), momentum3m: +(rand() * 15 - 5).toFixed(1), signal: "hold" },
 { ticker: "VGK", name: "European Equities", assetClass: "Equities", momentum12m: +(rand() * 25 - 8).toFixed(1), momentum3m: +(rand() * 12 - 4).toFixed(1), signal: "hold" },
 { ticker: "EWJ", name: "Japan Equities", assetClass: "Equities", momentum12m: +(rand() * 20 - 5).toFixed(1), momentum3m: +(rand() * 10 - 3).toFixed(1), signal: "buy" },
 // Bonds
 { ticker: "TLT", name: "US Long Treasuries", assetClass: "Bonds", momentum12m: +(rand() * 20 - 15).toFixed(1), momentum3m: +(rand() * 12 - 8).toFixed(1), signal: "sell" },
 { ticker: "HYG", name: "US High Yield", assetClass: "Bonds", momentum12m: +(rand() * 15 - 3).toFixed(1), momentum3m: +(rand() * 8 - 2).toFixed(1), signal: "hold" },
 { ticker: "EMB", name: "EM Bonds", assetClass: "Bonds", momentum12m: +(rand() * 15 - 6).toFixed(1), momentum3m: +(rand() * 8 - 4).toFixed(1), signal: "hold" },
 // Commodities
 { ticker: "GLD", name: "Gold", assetClass: "Commodities", momentum12m: +(rand() * 30 + 5).toFixed(1), momentum3m: +(rand() * 15 + 2).toFixed(1), signal: "buy" },
 { ticker: "USO", name: "Oil", assetClass: "Commodities", momentum12m: +(rand() * 40 - 20).toFixed(1), momentum3m: +(rand() * 20 - 10).toFixed(1), signal: "sell" },
 { ticker: "DBA", name: "Agriculture", assetClass: "Commodities", momentum12m: +(rand() * 20 - 8).toFixed(1), momentum3m: +(rand() * 10 - 4).toFixed(1), signal: "hold" },
 // FX
 { ticker: "UUP", name: "US Dollar", assetClass: "FX", momentum12m: +(rand() * 15 - 5).toFixed(1), momentum3m: +(rand() * 8 - 3).toFixed(1), signal: "hold" },
 { ticker: "FXE", name: "Euro", assetClass: "FX", momentum12m: +(rand() * 12 - 8).toFixed(1), momentum3m: +(rand() * 6 - 4).toFixed(1), signal: "sell" },
 { ticker: "FXY", name: "Japanese Yen", assetClass: "FX", momentum12m: +(rand() * 15 - 10).toFixed(1), momentum3m: +(rand() * 8 - 5).toFixed(1), signal: "hold" },
 ];

 // Re-assign signals based on momentum values
 crossAssets.forEach((a) => {
 if (a.momentum12m > 12) a.signal = "buy";
 else if (a.momentum12m < -5) a.signal = "sell";
 else a.signal = "hold";
 });

 const cycleData: FactorCycleEntry[] = [
 { regime: "Recovery", value: +(rand() * 4 + 0.5).toFixed(1), momentum: +(rand() * 3 + 0.5).toFixed(1), quality: +(rand() * 2 + 0.5).toFixed(1), lowVol: +(rand() * 1 - 0.5).toFixed(1), size: +(rand() * 3 + 1).toFixed(1) },
 { regime: "Expansion", value: +(rand() * 2 + 0).toFixed(1), momentum: +(rand() * 4 + 1).toFixed(1), quality: +(rand() * 2 + 0).toFixed(1), lowVol: +(rand() * 1 - 0.8).toFixed(1), size: +(rand() * 2 + 0.5).toFixed(1) },
 { regime: "Slowdown", value: +(rand() * 2 - 0.5).toFixed(1), momentum: +(rand() * 2 - 0.5).toFixed(1), quality: +(rand() * 3 + 0.5).toFixed(1), lowVol: +(rand() * 3 + 0.5).toFixed(1), size: +(rand() * 2 - 1).toFixed(1) },
 { regime: "Contraction", value: +(rand() * 2 - 1.5).toFixed(1), momentum: +(rand() * 2 - 1.5).toFixed(1), quality: +(rand() * 3 + 0.5).toFixed(1), lowVol: +(rand() * 4 + 1).toFixed(1), size: +(rand() * 2 - 1.5).toFixed(1) },
 ];

 const factorNames: FactorName[] = ["Value", "Momentum", "Quality", "Low-Vol", "Size"];
 const corrMatrix: FactorCorr[] = [];
 for (let i = 0; i < factorNames.length; i++) {
 for (let j = i + 1; j < factorNames.length; j++) {
 corrMatrix.push({
 a: factorNames[i],
 b: factorNames[j],
 corr: +(rand() * 1.2 - 0.6).toFixed(2),
 });
 }
 }

 // Tactical allocation rules — 24 months of simulated equity curves
 const tacticalRules: TacticalRule[] = [
 { asset: "US Equities", ticker: "SPY", price: +(rand() * 100 + 450).toFixed(2), ma200: +(rand() * 80 + 420).toFixed(2), signal: "above", stratReturn: +(rand() * 40 + 60).toFixed(1), bHReturn: +(rand() * 50 + 50).toFixed(1), color: "#3b82f6" },
 { asset: "Intl Equities", ticker: "EFA", price: +(rand() * 20 + 70).toFixed(2), ma200: +(rand() * 15 + 68).toFixed(2), signal: "above", stratReturn: +(rand() * 25 + 20).toFixed(1), bHReturn: +(rand() * 30 + 15).toFixed(1), color: "#10b981" },
 { asset: "EM Equities", ticker: "EEM", price: +(rand() * 15 + 40).toFixed(2), ma200: +(rand() * 15 + 42).toFixed(2), signal: "below", stratReturn: +(rand() * 15 + 5).toFixed(1), bHReturn: +(rand() * 20 - 5).toFixed(1), color: "#f59e0b" },
 { asset: "US Bonds", ticker: "AGG", price: +(rand() * 5 + 92).toFixed(2), ma200: +(rand() * 4 + 94).toFixed(2), signal: "below", stratReturn: +(rand() * 5 + 2).toFixed(1), bHReturn: +(rand() * 8 - 3).toFixed(1), color: "#8b5cf6" },
 { asset: "Commodities", ticker: "DJP", price: +(rand() * 5 + 27).toFixed(2), ma200: +(rand() * 4 + 26).toFixed(2), signal: "above", stratReturn: +(rand() * 20 + 15).toFixed(1), bHReturn: +(rand() * 22 + 10).toFixed(1), color: "#ec4899" },
 { asset: "Gold", ticker: "GLD", price: +(rand() * 30 + 185).toFixed(2), ma200: +(rand() * 25 + 172).toFixed(2), signal: "above", stratReturn: +(rand() * 30 + 20).toFixed(1), bHReturn: +(rand() * 28 + 18).toFixed(1), color: "#f97316" },
 ];

 // Fix signal consistency
 tacticalRules.forEach((r) => {
 r.signal = r.price >= r.ma200 ? "above" : "below";
 });

 const factorETFs: FactorETF[] = [
 { ticker: "MTUM", name: "iShares MSCI USA Momentum", factor: "Momentum", aum: +(rand() * 5 + 12).toFixed(1), expense: 0.15, turnover: +(rand() * 80 + 100).toFixed(0), taxDrag: +(rand() * 20 + 35).toFixed(0), ytd: +(rand() * 20 - 2).toFixed(1), inception: 2013, description: "Tracks stocks with recent strong relative performance using 6 & 12m returns" },
 { ticker: "VLUE", name: "iShares MSCI USA Value", factor: "Value", aum: +(rand() * 3 + 4).toFixed(1), expense: 0.15, turnover: +(rand() * 30 + 25).toFixed(0), taxDrag: +(rand() * 10 + 10).toFixed(0), ytd: +(rand() * 18 - 4).toFixed(1), inception: 2013, description: "Low-price-to-fundamentals stocks: P/E, P/B, EV/CFO blend" },
 { ticker: "QUAL", name: "iShares MSCI USA Quality", factor: "Quality", aum: +(rand() * 8 + 30).toFixed(1), expense: 0.15, turnover: +(rand() * 20 + 12).toFixed(0), taxDrag: +(rand() * 8 + 6).toFixed(0), ytd: +(rand() * 15 + 2).toFixed(1), inception: 2013, description: "High ROE, stable EPS growth, low financial leverage composite" },
 { ticker: "USMV", name: "iShares MSCI USA Min Vol", factor: "Low-Vol", aum: +(rand() * 10 + 25).toFixed(1), expense: 0.15, turnover: +(rand() * 25 + 20).toFixed(0), taxDrag: +(rand() * 8 + 8).toFixed(0), ytd: +(rand() * 10 + 1).toFixed(1), inception: 2011, description: "Portfolio of US stocks with lowest realized volatility in a mean-variance optimization" },
 { ticker: "IWM", name: "iShares Russell 2000", factor: "Size", aum: +(rand() * 20 + 50).toFixed(1), expense: 0.19, turnover: +(rand() * 20 + 15).toFixed(0), taxDrag: +(rand() * 12 + 10).toFixed(0), ytd: +(rand() * 20 - 8).toFixed(1), inception: 2000, description: "Benchmark small-cap exposure; captures the size premium over large-caps" },
 ];

 // Generate 36 monthly equity curve points for Tactical vs B&H
 const equityCurvePoints: { month: number; strat: number; bh: number }[] = [];
 let stratVal = 100;
 let bhVal = 100;
 for (let i = 0; i < 36; i++) {
 const bhChg = rand() * 0.06 - 0.02;
 // Strat underperforms slightly in up months, outperforms in down months
 const stratChg = bhChg > 0 ? bhChg * (0.7 + rand() * 0.5) : bhChg * (0.3 + rand() * 0.4);
 bhVal *= 1 + bhChg;
 stratVal *= 1 + stratChg;
 equityCurvePoints.push({
 month: i + 1,
 strat: +stratVal.toFixed(2),
 bh: +bhVal.toFixed(2),
 });
 }

 return { factorSignals, crossAssets, cycleData, corrMatrix, tacticalRules, factorETFs, equityCurvePoints };
}

const DATA = buildData();

// ── Helper formatters ──────────────────────────────────────────────────────────

function fmtPct(v: number, decimals = 1) {
 return `${v >= 0 ? "+" : ""}${v.toFixed(decimals)}%`;
}
function fmtZ(v: number) {
 return `${v >= 0 ? "+" : ""}${v.toFixed(2)}σ`;
}

function trendIcon(t: Trend) {
 if (t === "up") return <TrendingUp className="w-4 h-4 text-emerald-400" />;
 if (t === "down") return <TrendingDown className="w-4 h-4 text-red-400" />;
 return <Minus className="w-4 h-4 text-muted-foreground" />;
}

function weightBadge(w: Weight) {
 if (w === "overweight")
 return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">Overweight</Badge>;
 if (w === "underweight")
 return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">Underweight</Badge>;
 return <Badge className="bg-muted-foreground/20 text-muted-foreground border-border text-xs">Neutral</Badge>;
}

function signalBadge(sig: "buy" | "hold" | "sell") {
 if (sig === "buy")
 return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">Buy</Badge>;
 if (sig === "sell")
 return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">Sell</Badge>;
 return <Badge className="bg-muted-foreground/20 text-muted-foreground border-border text-xs">Hold</Badge>;
}

function corrColor(v: number) {
 if (v > 0.4) return "#ef4444";
 if (v > 0.1) return "#f97316";
 if (v < -0.4) return "#3b82f6";
 if (v < -0.1) return "#6366f1";
 return "#6b7280";
}

function assetClassColor(ac: AssetClass) {
 const map: Record<AssetClass, string> = {
 Equities: "#3b82f6",
 Bonds: "#8b5cf6",
 Commodities: "#f59e0b",
 FX: "#10b981",
 };
 return map[ac];
}

// ── SVG: Factor Signal Bar Chart ──────────────────────────────────────────────

function FactorSignalChart({ factors }: { factors: FactorSignal[] }) {
 const W = 520;
 const H = 220;
 const barH = 28;
 const gap = 12;
 const axisX = 160;
 const maxZ = 3;

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: H }}>
 {/* Axis */}
 <line x1={axisX} y1={8} x2={axisX} y2={H - 8} stroke="#374151" strokeWidth={1} />
 {/* Grid ticks */}
 {[-3, -2, -1, 0, 1, 2, 3].map((v) => {
 const x = axisX + (v / maxZ) * ((W - axisX - 16) / 2);
 return (
 <g key={v}>
 <line x1={x} y1={8} x2={x} y2={H - 8} stroke="#1f2937" strokeWidth={1} strokeDasharray="4,3" />
 <text x={x} y={H - 2} textAnchor="middle" fontSize={9} fill="#6b7280">
 {v === 0 ? "0" : `${v > 0 ? "+" : ""}${v}σ`}
 </text>
 </g>
 );
 })}

 {factors.map((f, i) => {
 const y = i * (barH + gap) + 20;
 const halfW = (W - axisX - 16) / 2;
 const barWidth = Math.abs(f.zScore / maxZ) * halfW;
 const barX = f.zScore >= 0 ? axisX : axisX - barWidth;

 return (
 <g key={f.name}>
 <text x={axisX - 8} y={y + barH / 2 + 4} textAnchor="end" fontSize={11} fill="#d1d5db" fontWeight={600}>
 {f.name}
 </text>
 <rect
 x={barX}
 y={y}
 width={barWidth}
 height={barH}
 rx={4}
 fill={f.zScore >= 0 ? f.color : "#ef4444"}
 opacity={0.75}
 />
 {/* Crowding indicator */}
 <rect
 x={W - 30}
 y={y + 4}
 width={20 * f.crowding}
 height={barH - 8}
 rx={3}
 fill="#f59e0b"
 opacity={0.5}
 />
 <text x={W - 8} y={y + barH / 2 + 4} textAnchor="end" fontSize={9} fill="#9ca3af">
 {Math.round(f.crowding * 100)}%
 </text>
 <text
 x={f.zScore >= 0 ? axisX + 4 : axisX - 4}
 y={y + barH / 2 + 4}
 textAnchor={f.zScore >= 0 ? "start" : "end"}
 fontSize={9}
 fill="#f9fafb"
 fontWeight={700}
 >
 {fmtZ(f.zScore)}
 </text>
 </g>
 );
 })}

 {/* Legend */}
 <rect x={W - 85} y={8} width={12} height={12} rx={2} fill="#3b82f6" opacity={0.75} />
 <text x={W - 70} y={18} fontSize={9} fill="#9ca3af">
 Z-Score
 </text>
 <rect x={W - 85} y={26} width={12} height={12} rx={2} fill="#f59e0b" opacity={0.5} />
 <text x={W - 70} y={36} fontSize={9} fill="#9ca3af">
 Crowding
 </text>
 </svg>
 );
}

// ── SVG: Momentum Ranking Chart ────────────────────────────────────────────────

function MomentumRankChart({ assets }: { assets: CrossAssetItem[] }) {
 const sorted = [...assets].sort((a, b) => b.momentum12m - a.momentum12m);
 const W = 540;
 const H = 300;
 const barH = 18;
 const gap = 5;
 const labelW = 120;
 const maxAbs = Math.max(...sorted.map((a) => Math.abs(a.momentum12m)), 1);

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: H }}>
 {/* Axis */}
 <line x1={labelW} y1={10} x2={labelW} y2={H - 18} stroke="#374151" strokeWidth={1} />
 <text x={labelW} y={H - 4} textAnchor="middle" fontSize={9} fill="#6b7280">
 0%
 </text>

 {sorted.map((a, i) => {
 const y = i * (barH + gap) + 14;
 const maxBarW = W - labelW - 16;
 const barW = Math.abs(a.momentum12m / maxAbs) * (maxBarW / 2);
 const barX = a.momentum12m >= 0 ? labelW : labelW - barW;
 const col = assetClassColor(a.assetClass);
 const dim = a.momentum12m < 0;

 return (
 <g key={a.ticker}>
 <text x={labelW - 6} y={y + barH / 2 + 4} textAnchor="end" fontSize={10} fill="#d1d5db">
 {a.ticker}
 </text>
 <rect
 x={barX}
 y={y}
 width={barW}
 height={barH}
 rx={3}
 fill={dim ? "#ef4444" : col}
 opacity={0.8}
 />
 <text
 x={a.momentum12m >= 0 ? labelW + barW + 3 : labelW - barW - 3}
 y={y + barH / 2 + 4}
 textAnchor={a.momentum12m >= 0 ? "start" : "end"}
 fontSize={9}
 fill="#f9fafb"
 fontWeight={600}
 >
 {fmtPct(a.momentum12m)}
 </text>
 </g>
 );
 })}

 {/* Asset class legend */}
 {(["Equities", "Bonds", "Commodities", "FX"] as AssetClass[]).map((ac, i) => (
 <g key={ac}>
 <rect x={i * 120 + 4} y={H - 14} width={10} height={10} rx={2} fill={assetClassColor(ac)} opacity={0.8} />
 <text x={i * 120 + 18} y={H - 5} fontSize={9} fill="#9ca3af">
 {ac}
 </text>
 </g>
 ))}
 </svg>
 );
}

// ── SVG: Heatmap (Factor × Regime) ────────────────────────────────────────────

function FactorHeatmap({ data }: { data: FactorCycleEntry[] }) {
 const W = 500;
 const H = 200;
 const cols = ["value", "momentum", "quality", "lowVol", "size"] as const;
 const colLabels = ["Value", "Momentum", "Quality", "Low-Vol", "Size"];
 const cellW = 72;
 const cellH = 36;
 const offsetX = 90;
 const offsetY = 28;

 function heatColor(v: number) {
 const norm = Math.max(-3, Math.min(3, v));
 if (norm > 0) {
 const t = norm / 3;
 return `rgb(${Math.round(16 + (52 - 16) * (1 - t))},${Math.round(185 + (211 - 185) * t * 0.5)},${Math.round(129 + (175 - 129) * t * 0.5)})`;
 } else {
 const t = -norm / 3;
 return `rgb(${Math.round(239 + (30 - 239) * t)},${Math.round(68 + (40 - 68) * t)},${Math.round(68 + (40 - 68) * t)})`;
 }
 }

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: H }}>
 {colLabels.map((lbl, j) => (
 <text key={lbl} x={offsetX + j * cellW + cellW / 2} y={18} textAnchor="middle" fontSize={10} fill="#9ca3af">
 {lbl}
 </text>
 ))}
 {data.map((row, i) => (
 <g key={row.regime}>
 <text x={offsetX - 6} y={offsetY + i * cellH + cellH / 2 + 4} textAnchor="end" fontSize={10} fill="#d1d5db">
 {row.regime}
 </text>
 {cols.map((col, j) => {
 const val = row[col];
 return (
 <g key={col}>
 <rect
 x={offsetX + j * cellW + 1}
 y={offsetY + i * cellH + 1}
 width={cellW - 2}
 height={cellH - 2}
 rx={4}
 fill={heatColor(val)}
 opacity={0.9}
 />
 <text
 x={offsetX + j * cellW + cellW / 2}
 y={offsetY + i * cellH + cellH / 2 + 4}
 textAnchor="middle"
 fontSize={11}
 fill="#f9fafb"
 fontWeight={700}
 >
 {val > 0 ? `+${val}` : val}
 </text>
 </g>
 );
 })}
 </g>
 ))}
 </svg>
 );
}

// ── SVG: Equity Curve Comparison ──────────────────────────────────────────────

function EquityCurveChart({
 points,
}: {
 points: { month: number; strat: number; bh: number }[];
}) {
 const W = 560;
 const H = 220;
 const pad = { top: 16, right: 24, bottom: 32, left: 52 };
 const chartW = W - pad.left - pad.right;
 const chartH = H - pad.top - pad.bottom;

 const allVals = points.flatMap((p) => [p.strat, p.bh]);
 const minV = Math.min(...allVals) * 0.98;
 const maxV = Math.max(...allVals) * 1.02;

 function toX(month: number) {
 return pad.left + ((month - 1) / (points.length - 1)) * chartW;
 }
 function toY(v: number) {
 return pad.top + chartH - ((v - minV) / (maxV - minV)) * chartH;
 }

 const stratPath = points.map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.month)},${toY(p.strat)}`).join("");
 const bhPath = points.map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.month)},${toY(p.bh)}`).join("");

 const yTicks = [minV, (minV + maxV) / 2, maxV];

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: H }}>
 {/* Axes */}
 <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + chartH} stroke="#374151" strokeWidth={1} />
 <line x1={pad.left} y1={pad.top + chartH} x2={W - pad.right} y2={pad.top + chartH} stroke="#374151" strokeWidth={1} />

 {/* Grid + y-labels */}
 {yTicks.map((v, i) => (
 <g key={i}>
 <line x1={pad.left} y1={toY(v)} x2={W - pad.right} y2={toY(v)} stroke="#1f2937" strokeWidth={1} strokeDasharray="4,3" />
 <text x={pad.left - 4} y={toY(v) + 4} textAnchor="end" fontSize={9} fill="#6b7280">
 {v.toFixed(0)}
 </text>
 </g>
 ))}

 {/* X-labels */}
 {[1, 7, 13, 19, 25, 31, 36].map((m) => {
 const pt = points[m - 1];
 if (!pt) return null;
 return (
 <text key={m} x={toX(m)} y={H - 6} textAnchor="middle" fontSize={9} fill="#6b7280">
 M{m}
 </text>
 );
 })}

 {/* Area fills */}
 <path
 d={`${stratPath} L${toX(points.length)},${pad.top + chartH} L${toX(1)},${pad.top + chartH} Z`}
 fill="#3b82f6"
 opacity={0.08}
 />
 <path
 d={`${bhPath} L${toX(points.length)},${pad.top + chartH} L${toX(1)},${pad.top + chartH} Z`}
 fill="#6b7280"
 opacity={0.06}
 />

 {/* Lines */}
 <path d={stratPath} fill="none" stroke="#3b82f6" strokeWidth={2} />
 <path d={bhPath} fill="none" stroke="#6b7280" strokeWidth={2} strokeDasharray="5,4" />

 {/* Labels */}
 <circle cx={W - pad.right - 90} cy={pad.top + 8} r={4} fill="#3b82f6" />
 <text x={W - pad.right - 82} y={pad.top + 12} fontSize={9} fill="#9ca3af">
 200d MA Strategy
 </text>
 <circle cx={W - pad.right - 90} cy={pad.top + 22} r={4} fill="#6b7280" />
 <text x={W - pad.right - 82} y={pad.top + 26} fontSize={9} fill="#9ca3af">
 Buy &amp; Hold
 </text>
 </svg>
 );
}

// ── Tab 1: Factor Dashboard ────────────────────────────────────────────────────

function FactorDashboard() {
 const { factorSignals } = DATA;
 const [selected, setSelected] = useState<FactorName | null>(null);
 const sel = factorSignals.find((f) => f.name === selected);

 return (
 <div className="space-y-4">
 {/* Summary cards */}
 <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
 {factorSignals.map((f) => (
 <button
 key={f.name}
 onClick={() => setSelected(selected === f.name ? null : f.name)}
 className={cn(
 "text-left p-3 rounded-lg border transition-colors",
 selected === f.name
 ? "border-primary/60 bg-muted/10"
 : "border-border bg-card hover:border-muted-foreground"
 )}
 >
 <div className="flex items-center justify-between mb-1">
 <span className="text-xs font-semibold text-muted-foreground">{f.name}</span>
 {trendIcon(f.trend)}
 </div>
 <div
 className="text-lg font-semibold"
 style={{ color: f.zScore >= 0 ? "#10b981" : "#ef4444" }}
 >
 {fmtZ(f.zScore)}
 </div>
 <div className="mt-1">{weightBadge(f.weight)}</div>
 </button>
 ))}
 </div>

 {/* Detail panel */}
 <AnimatePresence>
 {sel && (
 <motion.div
 key={sel.name}
 initial={{ opacity: 0, y: -8 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -8 }}
 className="rounded-lg border border-border bg-card p-4"
 >
 <div className="flex items-start justify-between">
 <div>
 <h3 className="text-base font-semibold text-foreground">{sel.name} Factor</h3>
 <p className="text-sm text-muted-foreground mt-0.5">{sel.description}</p>
 </div>
 <div className="text-right text-xs text-muted-foreground">
 <div>Crowding: <span className="font-semibold text-amber-400">{Math.round(sel.crowding * 100)}%</span></div>
 <div className="mt-1">Trend: <span className="font-medium text-muted-foreground">{sel.trend}</span></div>
 </div>
 </div>
 <div className="mt-3 flex items-center gap-4">
 <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
 <div
 className="h-full rounded-full transition-colors"
 style={{
 width: `${Math.min(100, ((sel.zScore + 3) / 6) * 100)}%`,
 backgroundColor: sel.color,
 }}
 />
 </div>
 <span className="text-sm font-semibold" style={{ color: sel.color }}>
 {fmtZ(sel.zScore)}
 </span>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Chart */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Factor Z-Score &amp; Crowding
 </CardTitle>
 </CardHeader>
 <CardContent>
 <FactorSignalChart factors={factorSignals} />
 <p className="text-xs text-muted-foreground mt-2">
 Bar length = z-score magnitude. Amber bars (right) = crowding %. Z-score above +1.5σ suggests factor richness; below -1.5σ suggests cheapness.
 </p>
 </CardContent>
 </Card>

 {/* Signal table */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Factor Signal Table
 </CardTitle>
 </CardHeader>
 <CardContent className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="text-muted-foreground border-b border-border">
 <th className="text-left py-2 pr-3">Factor</th>
 <th className="text-right py-2 pr-3">Z-Score</th>
 <th className="text-center py-2 pr-3">Trend</th>
 <th className="text-center py-2 pr-3">Weight</th>
 <th className="text-right py-2">Crowding</th>
 </tr>
 </thead>
 <tbody>
 {factorSignals.map((f) => (
 <tr key={f.name} className="border-b border-border hover:bg-muted/40 transition-colors">
 <td className="py-2 pr-3">
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
 <span className="font-medium text-foreground">{f.name}</span>
 </div>
 </td>
 <td className="text-right py-2 pr-3 font-mono font-medium" style={{ color: f.zScore >= 0 ? "#10b981" : "#ef4444" }}>
 {fmtZ(f.zScore)}
 </td>
 <td className="text-center py-2 pr-3">
 <div className="flex justify-center">{trendIcon(f.trend)}</div>
 </td>
 <td className="text-center py-2 pr-3">{weightBadge(f.weight)}</td>
 <td className="text-right py-2">
 <div className="flex items-center justify-end gap-1">
 <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
 <div
 className="h-full rounded-full"
 style={{
 width: `${f.crowding * 100}%`,
 backgroundColor: f.crowding > 0.6 ? "#ef4444" : f.crowding > 0.4 ? "#f59e0b" : "#10b981",
 }}
 />
 </div>
 <span className="text-muted-foreground w-8 text-right">{Math.round(f.crowding * 100)}%</span>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </CardContent>
 </Card>
 </div>
 );
}

// ── Tab 2: Cross-Asset Momentum ────────────────────────────────────────────────

function CrossAssetMomentum() {
 const { crossAssets } = DATA;
 const sorted = useMemo(() => [...crossAssets].sort((a, b) => b.momentum12m - a.momentum12m), []);
 const top5 = sorted.slice(0, 5);
 const bot5 = sorted.slice(-5).reverse();

 return (
 <div className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-emerald-400 flex items-center gap-2">
 Top 5 — Strongest Momentum
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-2">
 {top5.map((a) => (
 <div key={a.ticker} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
 <div>
 <div className="flex items-center gap-2">
 <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: assetClassColor(a.assetClass) }} />
 <span className="text-sm font-medium text-foreground">{a.ticker}</span>
 <span className="text-xs text-muted-foreground">{a.name}</span>
 </div>
 <div className="text-xs text-muted-foreground mt-0.5">{a.assetClass} · 3m: <span className="text-muted-foreground">{fmtPct(a.momentum3m)}</span></div>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-sm font-medium text-emerald-400">{fmtPct(a.momentum12m)}</span>
 {signalBadge(a.signal)}
 </div>
 </div>
 ))}
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-red-400 flex items-center gap-2">
 Bottom 5 — Weakest Momentum
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-2">
 {bot5.map((a) => (
 <div key={a.ticker} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
 <div>
 <div className="flex items-center gap-2">
 <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: assetClassColor(a.assetClass) }} />
 <span className="text-sm font-medium text-foreground">{a.ticker}</span>
 <span className="text-xs text-muted-foreground">{a.name}</span>
 </div>
 <div className="text-xs text-muted-foreground mt-0.5">{a.assetClass} · 3m: <span className="text-muted-foreground">{fmtPct(a.momentum3m)}</span></div>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-sm font-medium text-red-400">{fmtPct(a.momentum12m)}</span>
 {signalBadge(a.signal)}
 </div>
 </div>
 ))}
 </CardContent>
 </Card>
 </div>

 {/* Ranking chart */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 12-Month Momentum Ranking (All Assets)
 </CardTitle>
 </CardHeader>
 <CardContent>
 <MomentumRankChart assets={crossAssets} />
 <p className="text-xs text-muted-foreground mt-2">
 Bars show 12-month price momentum. Blue = Equities · Purple = Bonds · Amber = Commodities · Green = FX. Long top-ranked, short bottom-ranked per cross-asset momentum rules.
 </p>
 </CardContent>
 </Card>

 {/* Full table */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Full Cross-Asset Momentum Table
 </CardTitle>
 </CardHeader>
 <CardContent className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="text-muted-foreground border-b border-border">
 <th className="text-left py-2 pr-3">Ticker</th>
 <th className="text-left py-2 pr-3">Name</th>
 <th className="text-left py-2 pr-3">Class</th>
 <th className="text-right py-2 pr-3">12m Mom</th>
 <th className="text-right py-2 pr-3">3m Mom</th>
 <th className="text-center py-2">Signal</th>
 </tr>
 </thead>
 <tbody>
 {sorted.map((a) => (
 <tr key={a.ticker} className="border-b border-border hover:bg-muted/40 transition-colors">
 <td className="py-2 pr-3 font-mono font-medium text-foreground">{a.ticker}</td>
 <td className="py-2 pr-3 text-muted-foreground">{a.name}</td>
 <td className="py-2 pr-3">
 <span className="px-1.5 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: assetClassColor(a.assetClass) + "22", color: assetClassColor(a.assetClass) }}>
 {a.assetClass}
 </span>
 </td>
 <td className={cn("text-right py-2 pr-3 font-medium font-mono", a.momentum12m >= 0 ? "text-emerald-400" : "text-red-400")}>
 {fmtPct(a.momentum12m)}
 </td>
 <td className={cn("text-right py-2 pr-3 font-mono", a.momentum3m >= 0 ? "text-emerald-400/80" : "text-red-400/80")}>
 {fmtPct(a.momentum3m)}
 </td>
 <td className="text-center py-2">{signalBadge(a.signal)}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </CardContent>
 </Card>
 </div>
 );
}

// ── Tab 3: Factor Cycle ────────────────────────────────────────────────────────

function FactorCycle() {
 const { cycleData, corrMatrix } = DATA;
 const factorNames: FactorName[] = ["Value", "Momentum", "Quality", "Low-Vol", "Size"];

 return (
 <div className="space-y-4">
 {/* Heatmap */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Factor Performance by Economic Regime (annualised %)
 </CardTitle>
 </CardHeader>
 <CardContent>
 <FactorHeatmap data={cycleData} />
 <p className="text-xs text-muted-foreground mt-2">
 Green = positive excess return vs market. Red = negative. Values shown as annualised factor premium (%).
 Current regime: <span className="text-amber-400 font-medium">Slowdown</span>
 </p>
 </CardContent>
 </Card>

 {/* Regime descriptions */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 {(["Recovery", "Expansion", "Slowdown", "Contraction"] as Regime[]).map((r) => {
 const clr: Record<Regime, string> = {
 Recovery: "#10b981",
 Expansion: "#3b82f6",
 Slowdown: "#f59e0b",
 Contraction: "#ef4444",
 };
 const desc: Record<Regime, string> = {
 Recovery: "GDP rising from trough · credit spreads tightening · Value & Size lead",
 Expansion: "Sustained growth · low inflation · Momentum & Quality lead",
 Slowdown: "Decelerating growth · margin pressure · Quality & Low-Vol defensive",
 Contraction: "GDP contraction · risk-off · Low-Vol & Quality outperform",
 };
 return (
 <div key={r} className="p-3 rounded-lg border border-border bg-card">
 <div className="text-xs font-medium mb-1" style={{ color: clr[r] }}>
 {r}
 </div>
 <p className="text-xs text-muted-foreground leading-relaxed">{desc[r]}</p>
 </div>
 );
 })}
 </div>

 {/* Correlation matrix */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Factor Correlation Matrix (trailing 3Y)
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <table className="text-xs text-muted-foreground w-full">
 <thead>
 <tr className="text-muted-foreground">
 <th className="py-1.5 pr-3 text-left" />
 {factorNames.map((fn) => (
 <th key={fn} className="py-1.5 pr-2 text-center min-w-[70px]">
 {fn}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {factorNames.map((rowFactor) => (
 <tr key={rowFactor} className="border-t border-border">
 <td className="py-2 pr-3 font-medium text-muted-foreground whitespace-nowrap">{rowFactor}</td>
 {factorNames.map((colFactor) => {
 if (rowFactor === colFactor) {
 return (
 <td key={colFactor} className="py-2 pr-2 text-center">
 <span className="text-muted-foreground font-mono">1.00</span>
 </td>
 );
 }
 const pair = corrMatrix.find(
 (c) =>
 (c.a === rowFactor && c.b === colFactor) ||
 (c.a === colFactor && c.b === rowFactor)
 );
 const v = pair?.corr ?? 0;
 return (
 <td key={colFactor} className="py-2 pr-2 text-center">
 <span
 className="font-mono font-medium"
 style={{ color: corrColor(v) }}
 >
 {v >= 0 ? "+" : ""}
 {v.toFixed(2)}
 </span>
 </td>
 );
 })}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 <p className="text-xs text-muted-foreground mt-3">
 Red = positive correlation (factors move together, less diversification). Blue = negative correlation (diversifying). Pairs above |0.4| warrant monitoring for portfolio concentration risk.
 </p>
 </CardContent>
 </Card>

 {/* Crowding indicators */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Crowding Indicators
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-3">
 {DATA.factorSignals.map((f) => {
 const risk = f.crowding > 0.6 ? "High" : f.crowding > 0.4 ? "Moderate" : "Low";
 const riskColor = f.crowding > 0.6 ? "text-red-400" : f.crowding > 0.4 ? "text-amber-400" : "text-emerald-400";
 return (
 <div key={f.name} className="flex items-center gap-3">
 <div className="w-20 text-xs text-muted-foreground font-medium">{f.name}</div>
 <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
 <div
 className="h-full rounded-full transition-colors"
 style={{
 width: `${f.crowding * 100}%`,
 backgroundColor: f.crowding > 0.6 ? "#ef4444" : f.crowding > 0.4 ? "#f59e0b" : "#10b981",
 }}
 />
 </div>
 <div className={cn("w-14 text-xs text-muted-foreground font-medium text-right", riskColor)}>{risk}</div>
 <div className="w-8 text-xs text-right text-muted-foreground">{Math.round(f.crowding * 100)}%</div>
 </div>
 );
 })}
 </div>
 <p className="text-xs text-muted-foreground mt-3">
 Crowding measures concentration of institutional positioning in each factor strategy. High crowding (&gt;60%) signals potential for sharp reversals if positions unwind simultaneously.
 </p>
 </CardContent>
 </Card>
 </div>
 );
}

// ── Tab 4: Tactical Allocation ─────────────────────────────────────────────────

function TacticalAllocation() {
 const { tacticalRules, equityCurvePoints } = DATA;

 const finalStrat = equityCurvePoints[equityCurvePoints.length - 1]?.strat ?? 100;
 const finalBH = equityCurvePoints[equityCurvePoints.length - 1]?.bh ?? 100;
 const stratReturn = ((finalStrat - 100) / 100) * 100;
 const bhReturn = ((finalBH - 100) / 100) * 100;

 return (
 <div className="space-y-4">
 {/* MA rules table */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 200-Day Moving Average Rules — Current Signals
 </CardTitle>
 </CardHeader>
 <CardContent className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="text-muted-foreground border-b border-border">
 <th className="text-left py-2 pr-3">Asset</th>
 <th className="text-left py-2 pr-3">ETF</th>
 <th className="text-right py-2 pr-3">Price</th>
 <th className="text-right py-2 pr-3">200d MA</th>
 <th className="text-center py-2 pr-3">Signal</th>
 <th className="text-right py-2 pr-3">Strat Return</th>
 <th className="text-right py-2">B&amp;H Return</th>
 </tr>
 </thead>
 <tbody>
 {tacticalRules.map((r) => (
 <tr key={r.ticker} className="border-b border-border hover:bg-muted/40 transition-colors">
 <td className="py-2 pr-3">
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
 <span className="font-medium text-foreground">{r.asset}</span>
 </div>
 </td>
 <td className="py-2 pr-3 font-mono text-muted-foreground">{r.ticker}</td>
 <td className="py-2 pr-3 text-right font-mono text-foreground">${r.price}</td>
 <td className="py-2 pr-3 text-right font-mono text-muted-foreground">${r.ma200}</td>
 <td className="py-2 pr-3 text-center">
 {r.signal === "above" ? (
 <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
 Above MA
 </Badge>
 ) : (
 <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
 Below MA
 </Badge>
 )}
 </td>
 <td className={cn("py-2 pr-3 text-right font-mono font-medium", r.stratReturn >= 0 ? "text-emerald-400" : "text-red-400")}>
 {fmtPct(r.stratReturn)}
 </td>
 <td className={cn("py-2 text-right font-mono", r.bHReturn >= 0 ? "text-muted-foreground" : "text-red-400/70")}>
 {fmtPct(r.bHReturn)}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </CardContent>
 </Card>

 {/* Equity curve comparison */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <div className="flex items-start justify-between">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 200d MA Strategy vs Buy &amp; Hold (36-Month Sim)
 </CardTitle>
 <div className="flex items-center gap-3 text-xs text-muted-foreground">
 <div>
 <span className="text-muted-foreground">Strategy: </span>
 <span className={cn("font-medium", stratReturn >= 0 ? "text-emerald-400" : "text-red-400")}>
 {fmtPct(stratReturn)}
 </span>
 </div>
 <div>
 <span className="text-muted-foreground">B&amp;H: </span>
 <span className={cn("font-medium", bhReturn >= 0 ? "text-muted-foreground" : "text-red-400")}>
 {fmtPct(bhReturn)}
 </span>
 </div>
 </div>
 </div>
 </CardHeader>
 <CardContent>
 <EquityCurveChart points={equityCurvePoints} />
 <p className="text-xs text-muted-foreground mt-2">
 Simulated 36-month equity curves. Strategy = invest when price &gt; 200d MA, hold cash otherwise. Risk-adjusted returns typically improve despite lower raw returns due to smaller drawdowns.
 </p>
 </CardContent>
 </Card>

 {/* Strategy description */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 {[
 { icon: <Shield className="w-3.5 h-3.5 text-muted-foreground/50" />, title: "Signal Logic", body: "Enter long when closing price crosses above its 200-day simple moving average. Exit to cash when price crosses below. Apply per asset class independently." },
 { icon: <Clock className="w-4 h-4 text-amber-400" />, title: "Rebalance Frequency", body: "Daily monitoring, monthly execution to reduce friction. Signal lags by 1 trading day to avoid look-ahead bias. Transaction costs assumed at 5bps round-trip." },
 { icon: <DollarSign className="w-4 h-4 text-emerald-400" />, title: "Risk Controls", body: "Max allocation 40% per asset class. Position sizing via equal-weight among passing signals. Cash held in short-term T-bills yielding estimated 4.8%." },
 ].map((item) => (
 <Card key={item.title} className="bg-card border-border">
 <CardContent className="p-4">
 <div className="flex items-center gap-2 mb-2">
 {item.icon}
 <span className="text-sm font-medium text-foreground">{item.title}</span>
 </div>
 <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 );
}

// ── Tab 5: Implementation ──────────────────────────────────────────────────────

function Implementation() {
 const { factorETFs } = DATA;
 const [selected, setSelected] = useState<string | null>(null);
 const sel = factorETFs.find((e) => e.ticker === selected);

 const factorColors: Record<string, string> = {
 Momentum: "#10b981",
 Value: "#3b82f6",
 Quality: "#8b5cf6",
 "Low-Vol": "#f59e0b",
 Size: "#ec4899",
 };

 return (
 <div className="space-y-4">
 {/* ETF universe table */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Factor ETF Universe
 </CardTitle>
 </CardHeader>
 <CardContent className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="text-muted-foreground border-b border-border">
 <th className="text-left py-2 pr-3">ETF</th>
 <th className="text-left py-2 pr-3">Factor</th>
 <th className="text-right py-2 pr-3">AUM ($B)</th>
 <th className="text-right py-2 pr-3">Expense</th>
 <th className="text-right py-2 pr-3">Turnover</th>
 <th className="text-right py-2 pr-3">Tax Drag</th>
 <th className="text-right py-2 pr-3">YTD</th>
 <th className="text-right py-2">Since</th>
 </tr>
 </thead>
 <tbody>
 {factorETFs.map((e) => (
 <tr
 key={e.ticker}
 onClick={() => setSelected(selected === e.ticker ? null : e.ticker)}
 className={cn(
 "border-b border-border cursor-pointer transition-colors",
 selected === e.ticker ? "bg-muted/10" : "hover:bg-muted/40"
 )}
 >
 <td className="py-2 pr-3">
 <div className="flex items-center gap-2">
 <ChevronRight className={cn("w-3 h-3 text-muted-foreground transition-transform", selected === e.ticker && "rotate-90")} />
 <span className="font-mono font-medium text-foreground">{e.ticker}</span>
 </div>
 </td>
 <td className="py-2 pr-3">
 <span
 className="px-1.5 py-0.5 rounded text-xs text-muted-foreground font-medium"
 style={{
 backgroundColor: (factorColors[e.factor] ?? "#6b7280") + "22",
 color: factorColors[e.factor] ?? "#6b7280",
 }}
 >
 {e.factor}
 </span>
 </td>
 <td className="py-2 pr-3 text-right text-muted-foreground">${e.aum}B</td>
 <td className="py-2 pr-3 text-right text-muted-foreground">{e.expense}%</td>
 <td className="py-2 pr-3 text-right text-muted-foreground">{e.turnover}%</td>
 <td className="py-2 pr-3 text-right">
 <span className={e.taxDrag > 30 ? "text-amber-400" : "text-muted-foreground"}>{e.taxDrag}bps</span>
 </td>
 <td className={cn("py-2 pr-3 text-right font-mono font-medium", e.ytd >= 0 ? "text-emerald-400" : "text-red-400")}>
 {fmtPct(e.ytd)}
 </td>
 <td className="py-2 text-right text-muted-foreground">{e.inception}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </CardContent>
 </Card>

 {/* ETF detail panel */}
 <AnimatePresence>
 {sel && (
 <motion.div
 key={sel.ticker}
 initial={{ opacity: 0, y: -6 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -6 }}
 className="rounded-lg border border-border bg-muted/5 p-4"
 >
 <div className="flex items-start justify-between mb-3">
 <div>
 <div className="flex items-center gap-2">
 <span className="font-mono font-medium text-lg text-foreground">{sel.ticker}</span>
 <span
 className="px-2 py-0.5 rounded text-xs text-muted-foreground font-medium"
 style={{
 backgroundColor: (factorColors[sel.factor] ?? "#6b7280") + "22",
 color: factorColors[sel.factor] ?? "#6b7280",
 }}
 >
 {sel.factor}
 </span>
 </div>
 <div className="text-sm text-muted-foreground mt-0.5">{sel.name}</div>
 </div>
 <div className="text-right">
 <div className={cn("text-lg font-medium", sel.ytd >= 0 ? "text-emerald-400" : "text-red-400")}>
 {fmtPct(sel.ytd)} YTD
 </div>
 <div className="text-xs text-muted-foreground">AUM: ${sel.aum}B</div>
 </div>
 </div>
 <p className="text-sm text-muted-foreground mb-3">{sel.description}</p>
 <div className="grid grid-cols-4 gap-3">
 {[
 { label: "Expense Ratio", value: `${sel.expense}%/yr` },
 { label: "Annual Turnover", value: `${sel.turnover}%` },
 { label: "Tax Drag Est.", value: `${sel.taxDrag}bps` },
 { label: "Inception", value: sel.inception.toString() },
 ].map((item) => (
 <div key={item.label} className="text-center p-2 bg-card rounded border border-border">
 <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
 <div className="text-sm font-medium text-foreground">{item.value}</div>
 </div>
 ))}
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* ETF vs mutual fund comparison */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Factor ETF vs Mutual Fund: Key Trade-offs
 </CardTitle>
 </CardHeader>
 <CardContent className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="text-muted-foreground border-b border-border">
 <th className="text-left py-2 pr-3">Dimension</th>
 <th className="text-left py-2 pr-3">Factor ETF</th>
 <th className="text-left py-2">Smart Beta Fund</th>
 </tr>
 </thead>
 <tbody>
 {[
 { dim: "Expense Ratio", etf: "0.10–0.20%", fund: "0.35–0.75%" },
 { dim: "Tax Efficiency", etf: "High (in-kind creation)", fund: "Lower (capital gains dist.)" },
 { dim: "Transparency", etf: "Daily holdings published", fund: "Quarterly disclosure" },
 { dim: "Intraday Trading", etf: "Yes — real-time pricing", fund: "EOD NAV only" },
 { dim: "Minimum Investment", etf: "1 share (~$50–$500)", fund: "Often $1,000–$10,000" },
 { dim: "Factor Purity", etf: "Moderate — index rules", fund: "Higher — active risk mgmt" },
 { dim: "Turnover Control", etf: "Limited by index rules", fund: "Manager discretion" },
 { dim: "Rebalance Frequency", etf: "Semi-annual reconstitution", fund: "Continuous / quarterly" },
 ].map((row) => (
 <tr key={row.dim} className="border-b border-border hover:bg-muted/30 transition-colors">
 <td className="py-2 pr-3 font-medium text-muted-foreground">{row.dim}</td>
 <td className="py-2 pr-3 text-muted-foreground">{row.etf}</td>
 <td className="py-2 text-muted-foreground">{row.fund}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </CardContent>
 </Card>

 {/* Cost breakdown visual */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
 Estimated Total Cost of Ownership (per $100k invested, 1 year)
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 {factorETFs.map((e) => {
 const expCost = e.aum > 0 ? Math.round(100000 * (e.expense / 100)) : 0;
 const taxCost = Math.round(100000 * (e.taxDrag / 10000));
 const tradeCost = Math.round(100000 * (e.turnover / 100) * 0.0005);
 const total = expCost + taxCost + tradeCost;
 return (
 <div key={e.ticker} className="space-y-1">
 <div className="flex items-center justify-between text-xs text-muted-foreground">
 <span className="font-mono font-medium text-muted-foreground">{e.ticker}</span>
 <span className="text-muted-foreground">Total: <span className="font-medium text-foreground">${total}/yr</span></span>
 </div>
 <div className="flex h-3 rounded-full overflow-hidden bg-muted gap-px">
 <div
 className="bg-primary"
 style={{ width: `${(expCost / total) * 100}%` }}
 title={`Expense: $${expCost}`}
 />
 <div
 className="bg-amber-500"
 style={{ width: `${(taxCost / total) * 100}%` }}
 title={`Tax drag: $${taxCost}`}
 />
 <div
 className="bg-primary"
 style={{ width: `${(tradeCost / total) * 100}%` }}
 title={`Trade cost: $${tradeCost}`}
 />
 </div>
 <div className="flex gap-4 text-xs text-muted-foreground">
 <span><span className="inline-block w-2 h-2 rounded-full bg-primary mr-1" />Expense ${expCost}</span>
 <span><span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1" />Tax ${taxCost}</span>
 <span><span className="inline-block w-2 h-2 rounded-full bg-primary mr-1" />Trade ${tradeCost}</span>
 </div>
 </div>
 );
 })}
 </CardContent>
 </Card>
 </div>
 );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function FactorTimingPage() {
 const [activeTab, setActiveTab] = useState("dashboard");

 const tabs = [
 { id: "dashboard", label: "Factor Dashboard" },
 { id: "momentum", label: "Cross-Asset Momentum" },
 { id: "cycle", label: "Factor Cycle" },
 { id: "tactical", label: "Tactical Allocation" },
 { id: "implementation", label: "Implementation" },
 ];

 return (
 <div className="min-h-screen bg-background text-foreground p-4 md:p-4">
 {/* Header */}
 <motion.div
 initial={{ opacity: 0, y: -12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.35 }}
 className="mb-6 border-l-4 border-l-primary rounded-lg bg-card p-6"
 >
 <div className="flex items-center gap-3 mb-1">
 <h1 className="text-xl font-semibold tracking-tight text-foreground">Factor Timing</h1>
 <Badge className="bg-muted/10 text-foreground border-border text-xs ml-2">Quant</Badge>
 </div>
 <p className="text-sm text-muted-foreground">
 Cross-asset momentum signals · Factor z-scores &amp; crowding · Economic regime heatmap · 200d MA tactical rules · Factor ETF universe
 </p>
 </motion.div>

 {/* Tabs */}
 <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-8">
 <TabsList className="bg-transparent border-b border-border/20 rounded-none p-0 h-auto mb-6">
 {tabs.map((t) => (
 <TabsTrigger
 key={t.id}
 value={t.id}
 className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground"
 >
 {t.label}
 </TabsTrigger>
 ))}
 </TabsList>

 <AnimatePresence mode="wait">
 <motion.div
 key={activeTab}
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -8 }}
 transition={{ duration: 0.2 }}
 >
 <TabsContent value="dashboard" className="mt-0 data-[state=inactive]:hidden">
 <FactorDashboard />
 </TabsContent>
 <TabsContent value="momentum" className="mt-0 data-[state=inactive]:hidden">
 <CrossAssetMomentum />
 </TabsContent>
 <TabsContent value="cycle" className="mt-0 data-[state=inactive]:hidden">
 <FactorCycle />
 </TabsContent>
 <TabsContent value="tactical" className="mt-0 data-[state=inactive]:hidden">
 <TacticalAllocation />
 </TabsContent>
 <TabsContent value="implementation" className="mt-0 data-[state=inactive]:hidden">
 <Implementation />
 </TabsContent>
 </motion.div>
 </AnimatePresence>
 </Tabs>
 </div>
 );
}
