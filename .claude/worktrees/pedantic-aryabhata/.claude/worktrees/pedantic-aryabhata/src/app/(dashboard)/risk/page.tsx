"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useTradingStore } from "@/stores/trading-store";
import { INITIAL_CAPITAL } from "@/types/trading";
import RiskScenariosTimeline from "@/components/education/RiskScenariosTimeline";
import VaRCalculator from "@/components/risk/VaRCalculator";
import CorrelationAnalysis from "@/components/risk/CorrelationAnalysis";

// ---------------------------------------------------------------------------
// Demo / synthetic fallback data
// ---------------------------------------------------------------------------

// DEMO_POSITIONS declared after RiskPosition interface below

const TICKER_BETA: Record<string, number> = {
 AAPL: 1.2, MSFT: 0.9, TSLA: 2.1, SPY: 1.0,
 GOOGL: 1.1, AMZN: 1.3, NVDA: 1.8, META: 1.4, AMD: 1.9, QQQ: 1.05,
};

const STRESS_SCENARIOS = [
 { name: "2008 Financial Crisis", drop: -50, vix: 80, context: "Subprime mortgage collapse & credit freeze" },
 { name: "COVID-19 Crash (2020)", drop: -34, vix: 82, context: "Global pandemic, fastest bear market in history" },
 { name: "2022 Bear Market", drop: -25, vix: 36, context: "Fed rate hikes to combat 40-year high inflation" },
 { name: "Interest Rate Spike +300bps", drop: -18, vix: 40, context: "Aggressive tightening compresses valuations" },
 { name: "Crypto Winter / Tech Rout", drop: -45, vix: 55, context: "Speculative assets repriced; NASDAQ -78% scenario" },
];

// ---------------------------------------------------------------------------
// Pure SVG helpers
// ---------------------------------------------------------------------------

function normalPDF(x: number): number {
 return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/** Bell-curve with shaded loss tail */
function BellCurve({ var95Pct, var99Pct }: { var95Pct: number; var99Pct: number }) {
 const W = 400;
 const H = 120;
 const pad = { l: 20, r: 20, t: 10, b: 20 };
 const gW = W - pad.l - pad.r;
 const gH = H - pad.t - pad.b;

 // x from -4 to +4
 const xMin = -4;
 const xMax = 4;
 const steps = 200;
 const pts: { x: number; y: number }[] = [];
 for (let i = 0; i <= steps; i++) {
 const xVal = xMin + (xMax - xMin) * (i / steps);
 pts.push({ x: xVal, y: normalPDF(xVal) });
 }
 const maxY = normalPDF(0);

 function toSVG(xVal: number, yVal: number) {
 const sx = pad.l + ((xVal - xMin) / (xMax - xMin)) * gW;
 const sy = pad.t + (1 - yVal / maxY) * gH;
 return { sx, sy };
 }

 // Full curve path
 const curvePath = pts
 .map((p, i) => {
 const { sx, sy } = toSVG(p.x, p.y);
 return i === 0 ? `M ${sx} ${sy}` : `L ${sx} ${sy}`;
 })
 .join("");

 // Shade tail for 95% VaR (z = -1.645) to left edge
 const z95 = -1.645;
 const z99 = -2.326;
 const baseline = pad.t + gH;

 function tailArea(zFrom: number, zTo: number) {
 const tailPts = pts.filter((p) => p.x >= zFrom && p.x <= zTo);
 if (tailPts.length === 0) return "";
 const first = toSVG(tailPts[0].x, tailPts[0].y);
 const last = toSVG(tailPts[tailPts.length - 1].x, tailPts[tailPts.length - 1].y);
 const interior = tailPts
 .map((p) => {
 const { sx, sy } = toSVG(p.x, p.y);
 return `L ${sx} ${sy}`;
 })
 .join("");
 return `M ${first.sx} ${baseline} ${interior} L ${last.sx} ${baseline} Z`;
 }

 const tail95 = tailArea(xMin, z95);
 const tail99 = tailArea(xMin, z99);

 // Labels
 const { sx: sx95 } = toSVG(z95, 0);
 const { sx: sx99 } = toSVG(z99, 0);

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
 {/* 95% tail (lighter red) */}
 <path d={tail95} fill="rgba(239,68,68,0.25)" />
 {/* 99% tail (deeper red) */}
 <path d={tail99} fill="rgba(239,68,68,0.5)" />
 {/* Bell curve */}
 <path d={curvePath} fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" />
 {/* VaR lines */}
 <line x1={sx95} y1={pad.t} x2={sx95} y2={baseline} stroke="rgb(239,68,68)" strokeWidth="1" strokeDasharray="3,2" />
 <line x1={sx99} y1={pad.t} x2={sx99} y2={baseline} stroke="rgb(220,38,38)" strokeWidth="1" strokeDasharray="3,2" />
 {/* Labels */}
 <text x={sx95 - 2} y={pad.t - 2} fill="rgb(239,68,68)" fontSize="8" textAnchor="end">
 95% VaR {var95Pct.toFixed(1)}%
 </text>
 <text x={sx99 - 2} y={pad.t + 8} fill="rgb(220,38,38)" fontSize="8" textAnchor="end">
 99% VaR {var99Pct.toFixed(1)}%
 </text>
 </svg>
 );
}

/** Correlation heatmap 4x4 */
function CorrelationMatrix({ tickers }: { tickers: string[] }) {
 const display = tickers.slice(0, 4);
 // Synthetic correlation matrix
 const corr: number[][] = display.map((a, i) =>
 display.map((b, j) => {
 if (i === j) return 1.0;
 const seed = (i + 1) * 7 + (j + 1) * 13;
 // Rough heuristic
 if ((a === "SPY" || b === "SPY") && a !== b) return 0.65 + ((seed % 10) - 5) * 0.02;
 if (a === "AAPL" && b === "MSFT") return 0.82;
 if (a === "MSFT" && b === "AAPL") return 0.82;
 if ((a === "TSLA" || b === "TSLA") && a !== b) return 0.45 + ((seed % 10) - 5) * 0.03;
 return 0.5 + ((seed % 20) - 10) * 0.02;
 }),
 );

 const cellSize = 52;
 const labelW = 36;
 const W = labelW + display.length * cellSize;
 const H = labelW + display.length * cellSize;

 function corrColor(v: number): string {
 if (v >= 0.8) return "rgba(239,68,68,0.85)";
 if (v >= 0.6) return "rgba(249,115,22,0.7)";
 if (v >= 0.4) return "rgba(234,179,8,0.55)";
 if (v >= 0.2) return "rgba(34,197,94,0.45)";
 return "rgba(59,130,246,0.45)";
 }

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[260px]" preserveAspectRatio="xMidYMid meet">
 {display.map((t, i) => (
 <text key={`col-${i}`} x={labelW + i * cellSize + cellSize / 2} y={labelW - 6} textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">
 {t}
 </text>
 ))}
 {display.map((t, j) => (
 <text key={`row-${j}`} x={labelW - 4} y={labelW + j * cellSize + cellSize / 2 + 3} textAnchor="end" fontSize="9" fill="hsl(var(--muted-foreground))">
 {t}
 </text>
 ))}
 {corr.map((row, j) =>
 row.map((v, i) => (
 <g key={`${i}-${j}`}>
 <rect
 x={labelW + i * cellSize}
 y={labelW + j * cellSize}
 width={cellSize - 2}
 height={cellSize - 2}
 rx={2}
 fill={corrColor(v)}
 />
 <text
 x={labelW + i * cellSize + (cellSize - 2) / 2}
 y={labelW + j * cellSize + (cellSize - 2) / 2 + 4}
 textAnchor="middle"
 fontSize="9"
 fontWeight="600"
 fill="white"
 >
 {v.toFixed(2)}
 </text>
 </g>
 )),
 )}
 </svg>
 );
}

/** Equity curve with drawdown overlay */
function EquityCurveChart({ snapshots, initialCapital }: {
 snapshots: { portfolioValue: number; timestamp: number }[];
 initialCapital: number;
}) {
 const W = 500;
 const H = 160;
 const pad = { l: 50, r: 10, t: 10, b: 30 };
 const gW = W - pad.l - pad.r;
 const gH = H - pad.t - pad.b;

 const data = snapshots.length >= 2 ? snapshots : (() => {
 // Generate synthetic equity curve
 const base = initialCapital;
 return Array.from({ length: 30 }, (_, i) => {
 const noise = Math.sin(i * 0.4) * 3000 + Math.cos(i * 0.7) * 1500;
 return { portfolioValue: base + noise + i * 200, timestamp: Date.now() - (30 - i) * 86400000 };
 });
 })();

 const minV = Math.min(...data.map((d) => d.portfolioValue));
 const maxV = Math.max(...data.map((d) => d.portfolioValue));
 const range = maxV - minV || 1;

 // Compute drawdown series
 let peak = data[0].portfolioValue;
 const ddSeries = data.map((d) => {
 peak = Math.max(peak, d.portfolioValue);
 return peak > 0 ? ((d.portfolioValue - peak) / peak) * 100 : 0;
 });
 const maxDD = Math.min(...ddSeries);

 function sx(i: number) { return pad.l + (i / (data.length - 1)) * gW; }
 function sy(v: number) { return pad.t + (1 - (v - minV) / range) * gH; }

 const equityCurvePath = data
 .map((d, i) => `${i === 0 ? "M" : "L"} ${sx(i)} ${sy(d.portfolioValue)}`)
 .join("");

 // Drawdown area (scale -30..0 to top portion)
 const ddH = gH * 0.3;
 const ddY0 = pad.t; // baseline (0% DD)
 function ddY(dd: number) {
 return ddY0 + ((-dd) / Math.max(1, -maxDD)) * ddH;
 }
 const ddPath = ddSeries
 .map((dd, i) => `${i === 0 ? "M" : "L"} ${sx(i)} ${ddY(dd)}`)
 .join("");
 const ddArea = `${ddPath} L ${sx(data.length - 1)} ${ddY0} L ${sx(0)} ${ddY0} Z`;

 const baseline = pad.t + gH;

 // Y axis ticks
 const ticks = [minV, (minV + maxV) / 2, maxV].map((v) => ({
 v,
 y: sy(v),
 label: `$${(v / 1000).toFixed(0)}k`,
 }));

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
 {/* Grid */}
 {ticks.map((t) => (
 <g key={t.label}>
 <line x1={pad.l} y1={t.y} x2={W - pad.r} y2={t.y} stroke="hsl(var(--border))" strokeWidth="0.5" />
 <text x={pad.l - 4} y={t.y + 3} textAnchor="end" fontSize="8" fill="hsl(var(--muted-foreground))">{t.label}</text>
 </g>
 ))}
 {/* Drawdown area */}
 <path d={ddArea} fill="rgba(239,68,68,0.15)" />
 <path d={ddPath} fill="none" stroke="rgba(239,68,68,0.6)" strokeWidth="1" />
 {/* Equity curve */}
 <path d={equityCurvePath} fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" />
 {/* Baseline */}
 <line x1={pad.l} y1={baseline} x2={W - pad.r} y2={baseline} stroke="hsl(var(--border))" strokeWidth="0.5" />
 {/* Max DD label */}
 <text x={W - pad.r} y={ddY0 + ddH + 4} textAnchor="end" fontSize="8" fill="rgba(239,68,68,0.8)">
 Max DD: {maxDD.toFixed(1)}%
 </text>
 </svg>
 );
}

/** Underwater plot */
function UnderwaterPlot({ snapshots, initialCapital }: {
 snapshots: { portfolioValue: number; timestamp: number }[];
 initialCapital: number;
}) {
 const W = 500;
 const H = 100;
 const pad = { l: 40, r: 10, t: 10, b: 20 };
 const gW = W - pad.l - pad.r;
 const gH = H - pad.t - pad.b;

 const data = snapshots.length >= 2 ? snapshots : (() => {
 const base = initialCapital;
 return Array.from({ length: 30 }, (_, i) => {
 const noise = Math.sin(i * 0.4) * 3000 + Math.cos(i * 0.7) * 1500;
 return { portfolioValue: base + noise + i * 200, timestamp: Date.now() - (30 - i) * 86400000 };
 });
 })();

 let peak = data[0].portfolioValue;
 const ddSeries = data.map((d) => {
 peak = Math.max(peak, d.portfolioValue);
 return peak > 0 ? ((d.portfolioValue - peak) / peak) * 100 : 0;
 });
 const maxDD = Math.min(...ddSeries) || -1;

 function sx(i: number) { return pad.l + (i / (data.length - 1)) * gW; }
 function sy(dd: number) { return pad.t + (dd / maxDD) * gH; }

 const baseline = pad.t;
 const areaPath =
 ddSeries.map((dd, i) => `${i === 0 ? "M" : "L"} ${sx(i)} ${sy(dd)}`).join("") +
 ` L ${sx(data.length - 1)} ${baseline} L ${sx(0)} ${baseline} Z`;

 const ticks = [0, maxDD / 2, maxDD].map((v) => ({ v, y: sy(v) }));

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
 {ticks.map((t, i) => (
 <g key={i}>
 <line x1={pad.l} y1={t.y} x2={W - pad.r} y2={t.y} stroke="hsl(var(--border))" strokeWidth="0.5" />
 <text x={pad.l - 4} y={t.y + 3} textAnchor="end" fontSize="8" fill="hsl(var(--muted-foreground))">{t.v.toFixed(1)}%</text>
 </g>
 ))}
 <path d={areaPath} fill="rgba(239,68,68,0.3)" />
 <line x1={pad.l} y1={baseline} x2={W - pad.r} y2={baseline} stroke="hsl(var(--border))" strokeWidth="0.5" />
 </svg>
 );
}

// ---------------------------------------------------------------------------
// Shared position type + demo data
// ---------------------------------------------------------------------------

interface RiskPosition {
 ticker: string;
 quantity: number;
 avgPrice: number;
 currentPrice: number;
 side: "long" | "short";
 beta: number;
 weight: number;
}

const DEMO_POSITIONS: RiskPosition[] = [
 { ticker: "AAPL", quantity: 50, avgPrice: 178, currentPrice: 182, side: "long", beta: 1.2, weight: 0.30 },
 { ticker: "MSFT", quantity: 30, avgPrice: 415, currentPrice: 420, side: "long", beta: 0.9, weight: 0.28 },
 { ticker: "TSLA", quantity: 20, avgPrice: 220, currentPrice: 215, side: "long", beta: 2.1, weight: 0.15 },
 { ticker: "SPY", quantity: 40, avgPrice: 510, currentPrice: 515, side: "long", beta: 1.0, weight: 0.27 },
];

// ---------------------------------------------------------------------------
// Risk calculation helpers
// ---------------------------------------------------------------------------

function calcPortfolioStats(
 positions: RiskPosition[],
 tradeHistory: { realizedPnL: number; timestamp: number }[],
 portfolioValue: number,
) {
 // Beta
 const totalValue = positions.reduce((s, p) => s + p.currentPrice * p.quantity, 0) || portfolioValue;
 const beta = positions.reduce((s, p) => {
 const posValue = p.currentPrice * p.quantity;
 const w = posValue / totalValue;
 const b = TICKER_BETA[p.ticker] ?? 1.0;
 return s + w * b;
 }, 0) || 1.0;

 // Parametric VaR — normal distribution
 const dailyVolEstimate = 0.012; // 1.2% daily vol
 const var95 = portfolioValue * dailyVolEstimate * 1.645;
 const var99 = portfolioValue * dailyVolEstimate * 2.326;
 const var95Pct = dailyVolEstimate * 1.645 * 100;
 const var99Pct = dailyVolEstimate * 2.326 * 100;

 // Sharpe ratio from trade history
 let sharpe = 0;
 if (tradeHistory.length >= 3) {
 const pnls = tradeHistory.map((t) => t.realizedPnL / portfolioValue);
 const mean = pnls.reduce((a, b) => a + b, 0) / pnls.length;
 const variance = pnls.reduce((a, b) => a + (b - mean) ** 2, 0) / pnls.length;
 const stdDev = Math.sqrt(variance);
 const riskFreeDaily = 0.05 / 252;
 sharpe = stdDev > 0 ? ((mean - riskFreeDaily) / stdDev) * Math.sqrt(252) : 0;
 } else {
 sharpe = 1.42; // demo fallback
 }

 // Max drawdown
 let peak = INITIAL_CAPITAL;
 let maxDD = 0;
 let maxDDDollar = 0;
 const equitySamples = tradeHistory.length >= 2
 ? tradeHistory.map((t, i) => {
 const partial = tradeHistory.slice(0, i + 1).reduce((s, x) => s + x.realizedPnL, INITIAL_CAPITAL);
 return partial;
 })
 : [INITIAL_CAPITAL, portfolioValue];

 for (const v of equitySamples) {
 if (v > peak) peak = v;
 const dd = (peak - v) / peak;
 if (dd > maxDD) {
 maxDD = dd;
 maxDDDollar = peak - v;
 }
 }

 // Risk score 0-100
 const betaScore = Math.min(beta / 2, 1) * 30;
 const ddScore = Math.min(maxDD * 2, 1) * 40;
 const sharpeScore = Math.max(0, 1 - sharpe / 3) * 30;
 const riskScore = Math.round(betaScore + ddScore + sharpeScore);

 return { beta, var95, var99, var95Pct, var99Pct, sharpe, maxDD, maxDDDollar, riskScore };
}

function riskLevel(score: number): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } {
 if (score < 25) return { label: "Low", variant: "secondary" };
 if (score < 50) return { label: "Medium", variant: "default" };
 if (score < 75) return { label: "High", variant: "destructive" };
 return { label: "Extreme", variant: "destructive" };
}

// ---------------------------------------------------------------------------
// Tab 1: Overview
// ---------------------------------------------------------------------------

function OverviewTab() {
 const { positions: rawPositions, portfolioValue, tradeHistory, equityHistory } = useTradingStore();

 const positions: RiskPosition[] = (rawPositions.length > 0
 ? rawPositions.map((p) => ({
 ticker: p.ticker,
 quantity: p.quantity,
 avgPrice: p.avgPrice,
 currentPrice: p.currentPrice,
 side: p.side as "long" | "short",
 beta: TICKER_BETA[p.ticker] ?? 1.0,
 weight: (p.currentPrice * p.quantity) / (portfolioValue || 1),
 }))
 : DEMO_POSITIONS) as RiskPosition[];

 const pv = portfolioValue > 0 ? portfolioValue : INITIAL_CAPITAL;
 const tickers = positions.map((p) => p.ticker);

 const stats = useMemo(
 () => calcPortfolioStats(positions, tradeHistory, pv),
 [positions, tradeHistory, pv],
 );

 const rl = riskLevel(stats.riskScore);
 const isDemoData = rawPositions.length === 0;

 return (
 <div className="space-y-4">
 {isDemoData && (
 <div className="rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
 Showing demo portfolio (AAPL/MSFT/TSLA/SPY). Open positions in the trade tab to see live data.
 </div>
 )}

 {/* Top KPI row */}
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
 <Card>
 <CardContent className="p-4">
 <p className="text-xs text-muted-foreground">Portfolio Beta</p>
 <p className="mt-1 text-2xl font-semibold">{stats.beta.toFixed(2)}</p>
 <p className="text-xs text-muted-foreground">vs S&amp;P 500</p>
 </CardContent>
 </Card>
 <Card>
 <CardContent className="p-4">
 <p className="text-xs text-muted-foreground">Sharpe Ratio</p>
 <p className={`mt-1 text-lg font-medium ${stats.sharpe >= 1 ? "text-green-500" : stats.sharpe >= 0 ? "text-amber-500" : "text-red-500"}`}>
 {stats.sharpe.toFixed(2)}
 </p>
 <p className="text-xs text-muted-foreground">Annualized</p>
 </CardContent>
 </Card>
 <Card>
 <CardContent className="p-4">
 <p className="text-xs text-muted-foreground">Max Drawdown</p>
 <p className="mt-1 text-lg font-medium text-red-500">
 {(stats.maxDD * 100).toFixed(1)}%
 </p>
 <p className="text-xs text-muted-foreground">
 ${stats.maxDDDollar.toFixed(0)}
 </p>
 </CardContent>
 </Card>
 <Card>
 <CardContent className="p-4">
 <p className="text-xs text-muted-foreground">Risk Score</p>
 <div className="mt-1 flex items-center gap-2">
 <p className="text-lg font-medium">{stats.riskScore}</p>
 <Badge variant={rl.variant} className="text-xs text-muted-foreground">{rl.label}</Badge>
 </div>
 <Progress value={stats.riskScore} className="mt-2 h-1.5" />
 </CardContent>
 </Card>
 </div>

 {/* VaR */}
 <Card className="border-l-4 border-l-primary">
 <CardHeader className="p-4 pb-2">
 <CardTitle className="text-lg font-semibold">Value at Risk (VaR) — 1 Day Parametric</CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 <div className="grid grid-cols-2 gap-3">
 <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
 <p className="text-xs text-muted-foreground">95% Confidence</p>
 <p className="mt-1 text-xl font-medium text-red-500">
 ${stats.var95.toLocaleString("en-US", { maximumFractionDigits: 0 })}
 </p>
 <p className="text-xs text-muted-foreground">{stats.var95Pct.toFixed(2)}% of portfolio</p>
 </div>
 <div className="rounded-lg border border-red-700/20 bg-red-700/5 p-3">
 <p className="text-xs text-muted-foreground">99% Confidence</p>
 <p className="mt-1 text-xl font-medium text-red-700">
 ${stats.var99.toLocaleString("en-US", { maximumFractionDigits: 0 })}
 </p>
 <p className="text-xs text-muted-foreground">{stats.var99Pct.toFixed(2)}% of portfolio</p>
 </div>
 </div>
 <BellCurve var95Pct={stats.var95Pct} var99Pct={stats.var99Pct} />
 <p className="text-[11px] text-muted-foreground">
 Parametric VaR assumes normally distributed returns. Red shaded areas represent potential 1-day losses
 at given confidence levels. Actual losses may exceed VaR in fat-tail events.
 </p>
 </CardContent>
 </Card>

 {/* Correlation matrix */}
 <Card>
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-semibold">Position Correlation Matrix</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="flex gap-4 flex-wrap">
 <CorrelationMatrix tickers={tickers.length >= 2 ? tickers : ["AAPL", "MSFT", "TSLA", "SPY"]} />
 <div className="flex-1 min-w-[160px] space-y-2 text-xs text-muted-foreground">
 <p className="font-medium text-foreground text-xs">Reading the heatmap</p>
 <div className="space-y-1">
 <div className="flex items-center gap-2"><div className="h-3 w-6 rounded bg-red-500/80" /><span>0.8–1.0 High correlation</span></div>
 <div className="flex items-center gap-2"><div className="h-3 w-6 rounded bg-orange-500/70" /><span>0.6–0.8 Moderate-high</span></div>
 <div className="flex items-center gap-2"><div className="h-3 w-6 rounded bg-yellow-500/55" /><span>0.4–0.6 Moderate</span></div>
 <div className="flex items-center gap-2"><div className="h-3 w-6 rounded bg-green-500/45" /><span>0.2–0.4 Low</span></div>
 <div className="flex items-center gap-2"><div className="h-3 w-6 rounded bg-primary/45" /><span>0.0–0.2 Very low</span></div>
 </div>
 <p className="pt-1">High correlations reduce diversification benefit — positions move together in stress scenarios.</p>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Position breakdown */}
 <Card>
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-semibold">Position Risk Breakdown</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-2">
 {positions.slice(0, 6).map((p) => {
 const posValue = p.currentPrice * p.quantity;
 const pctOfPortfolio = (posValue / pv) * 100;
 const posVaR = posValue * 0.012 * 1.645;
 return (
 <div key={p.ticker} className="flex items-center gap-3">
 <span className="w-12 text-xs text-muted-foreground font-medium">{p.ticker}</span>
 <div className="flex-1">
 <Progress value={pctOfPortfolio} className="h-1.5" />
 </div>
 <span className="w-12 text-right text-xs text-muted-foreground">{pctOfPortfolio.toFixed(1)}%</span>
 <span className="w-20 text-right text-xs text-red-500">VaR ${posVaR.toFixed(0)}</span>
 <span className="w-14 text-right text-xs text-muted-foreground">β {(TICKER_BETA[p.ticker] ?? 1).toFixed(1)}</span>
 </div>
 );
 })}
 </div>
 </CardContent>
 </Card>
 </div>
 );
}

// ---------------------------------------------------------------------------
// Tab 2: Scenarios
// ---------------------------------------------------------------------------

function ScenariosTab() {
 const { portfolioValue, positions: rawPositions } = useTradingStore();
 const pv = portfolioValue > 0 ? portfolioValue : INITIAL_CAPITAL;
 const positions: RiskPosition[] = rawPositions.length > 0
 ? rawPositions.map((p) => ({
 ticker: p.ticker,
 quantity: p.quantity,
 avgPrice: p.avgPrice,
 currentPrice: p.currentPrice,
 side: p.side,
 beta: TICKER_BETA[p.ticker] ?? 1.0,
 weight: (p.currentPrice * p.quantity) / (pv || 1),
 }))
 : DEMO_POSITIONS;

 const [customDrop, setCustomDrop] = useState(20);
 const [rateChange, setRateChange] = useState(100);
 const [vixSpike, setVixSpike] = useState(40);

 const customImpact = -(pv * customDrop) / 100;
 const rateImpact = -(pv * (rateChange / 100) * 0.08);
 const vixImpact = -(pv * (vixSpike / 80) * 0.15);
 const totalCustomImpact = customImpact + rateImpact + vixImpact;

 return (
 <div className="space-y-5">
 {/* Historical timeline */}
 <RiskScenariosTimeline />

 {/* Custom scenario builder */}
 <Card>
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium">Custom Scenario Builder — What If?</CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
 <div className="space-y-2">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">Portfolio Drop</span>
 <span className="font-medium text-red-500">-{customDrop}%</span>
 </div>
 <Slider
 value={[customDrop]}
 onValueChange={(vals: number[]) => setCustomDrop(vals[0])}
 min={0} max={80} step={1}
 />
 </div>
 <div className="space-y-2">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">Rate Change (bps)</span>
 <span className="font-medium">+{rateChange}bps</span>
 </div>
 <Slider
 value={[rateChange]}
 onValueChange={(vals: number[]) => setRateChange(vals[0])}
 min={0} max={500} step={25}
 />
 </div>
 <div className="space-y-2">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">VIX Spike</span>
 <span className="font-medium">{vixSpike}</span>
 </div>
 <Slider
 value={[vixSpike]}
 onValueChange={(vals: number[]) => setVixSpike(vals[0])}
 min={15} max={90} step={5}
 />
 </div>
 </div>

 <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
 <p className="text-xs text-muted-foreground font-medium">Estimated Impact</p>
 <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
 <div>
 <p className="text-muted-foreground">Price shock</p>
 <p className="font-medium text-red-500">${customImpact.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
 </div>
 <div>
 <p className="text-muted-foreground">Rate impact</p>
 <p className="font-medium text-red-500">${rateImpact.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
 </div>
 <div>
 <p className="text-muted-foreground">Vol impact</p>
 <p className="font-medium text-red-500">${vixImpact.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
 </div>
 </div>
 <div className="flex items-center justify-between border-t border-border pt-2">
 <span className="text-xs text-muted-foreground font-medium">Total Estimated Loss</span>
 <span className="text-sm font-medium text-red-500">
 ${totalCustomImpact.toLocaleString("en-US", { maximumFractionDigits: 0 })}
 &nbsp;({((totalCustomImpact / pv) * 100).toFixed(1)}%)
 </span>
 </div>
 </div>

 {/* Position-level impact */}
 <div className="space-y-1.5">
 <p className="text-xs text-muted-foreground font-medium">Position Impact</p>
 {positions.slice(0, 5).map((p) => {
 const posValue = p.currentPrice * p.quantity;
 const impact = -(posValue * customDrop) / 100;
 return (
 <div key={p.ticker} className="flex items-center justify-between text-xs text-muted-foreground">
 <span className="font-medium">{p.ticker}</span>
 <span className="text-muted-foreground">${posValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
 <span className="text-red-500">{impact.toLocaleString("en-US", { maximumFractionDigits: 0, style: "currency", currency: "USD" })}</span>
 </div>
 );
 })}
 </div>
 </CardContent>
 </Card>
 </div>
 );
}

// ---------------------------------------------------------------------------
// Tab 3: Position Sizing
// ---------------------------------------------------------------------------

function PositionSizingTab() {
 const { portfolioValue } = useTradingStore();
 const pv = portfolioValue > 0 ? portfolioValue : INITIAL_CAPITAL;

 // Kelly
 const [winRate, setWinRate] = useState(55);
 const [avgWin, setAvgWin] = useState(500);
 const [avgLoss, setAvgLoss] = useState(250);

 const kellyFraction = useMemo(() => {
 const w = winRate / 100;
 const b = avgWin / Math.max(avgLoss, 1);
 return Math.max(0, w - (1 - w) / b);
 }, [winRate, avgWin, avgLoss]);

 const fullKellyDollar = pv * kellyFraction;
 const halfKellyDollar = pv * kellyFraction * 0.5;
 const quarterKellyDollar = pv * kellyFraction * 0.25;
 const pricePerShare = 180; // demo
 const halfKellyShares = Math.floor(halfKellyDollar / pricePerShare);

 // Fixed fractional
 const [riskPct, setRiskPct] = useState(1);
 const [accountSize, setAccountSize] = useState(pv.toString());
 const [stopPct, setStopPct] = useState(5);
 const [stockPrice, setStockPrice] = useState("180");

 const acctVal = parseFloat(accountSize) || pv;
 const riskDollar = acctVal * (riskPct / 100);
 const stopDollar = (parseFloat(stockPrice) || 180) * (stopPct / 100);
 const ffShares = stopDollar > 0 ? Math.floor(riskDollar / stopDollar) : 0;
 const ffPositionSize = ffShares * (parseFloat(stockPrice) || 180);

 // ATR sizing
 const [atr, setAtr] = useState(4.5);
 const [atrMultiplier, setAtrMultiplier] = useState(2);
 const [riskPerTrade, setRiskPerTrade] = useState(500);
 const atrShares = Math.floor(riskPerTrade / (atr * atrMultiplier));
 const atrPositionSize = atrShares * (parseFloat(stockPrice) || 180);

 return (
 <div className="space-y-4">
 {/* Kelly */}
 <Card>
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium">Kelly Criterion Calculator</CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
 <div className="space-y-1.5">
 <label className="text-xs text-muted-foreground">Win Rate (%)</label>
 <div className="flex items-center gap-2">
 <Slider value={[winRate]} onValueChange={(vals: number[]) => setWinRate(vals[0])} min={1} max={99} step={1} className="flex-1" />
 <span className="w-10 text-right text-sm font-medium">{winRate}%</span>
 </div>
 </div>
 <div className="space-y-1.5">
 <label className="text-xs text-muted-foreground">Avg Win ($)</label>
 <Input
 type="number"
 value={avgWin}
 onChange={(e) => setAvgWin(Number(e.target.value))}
 className="h-8 text-sm"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs text-muted-foreground">Avg Loss ($)</label>
 <Input
 type="number"
 value={avgLoss}
 onChange={(e) => setAvgLoss(Number(e.target.value))}
 className="h-8 text-sm"
 />
 </div>
 </div>

 <div className="grid grid-cols-3 gap-3">
 <div className="rounded-lg border border-border p-3 text-center">
 <p className="text-[11px] text-muted-foreground">Full Kelly</p>
 <p className="text-lg font-medium">{(kellyFraction * 100).toFixed(1)}%</p>
 <p className="text-xs text-muted-foreground">${fullKellyDollar.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
 </div>
 <div className="rounded-lg border border-border bg-muted/5 p-3 text-center">
 <p className="text-[11px] text-muted-foreground">Half Kelly</p>
 <p className="text-lg font-medium text-foreground">{(kellyFraction * 50).toFixed(1)}%</p>
 <p className="text-xs text-muted-foreground">${halfKellyDollar.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
 <p className="text-xs text-muted-foreground mt-0.5">{halfKellyShares} shares @ ${pricePerShare}</p>
 </div>
 <div className="rounded-lg border border-border p-3 text-center">
 <p className="text-[11px] text-muted-foreground">Quarter Kelly</p>
 <p className="text-lg font-medium">{(kellyFraction * 25).toFixed(1)}%</p>
 <p className="text-xs text-muted-foreground">${quarterKellyDollar.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
 </div>
 </div>

 <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
 Full Kelly maximizes long-run growth but leads to extreme variance and large drawdowns.
 Half Kelly is recommended for real trading — it sacrifices ~25% of growth for significant variance reduction.
 </div>
 </CardContent>
 </Card>

 {/* Fixed Fractional */}
 <Card>
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium">Fixed Fractional Position Sizing</CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
 <div className="space-y-1.5">
 <label className="text-xs text-muted-foreground">Account Size ($)</label>
 <Input
 type="number"
 value={accountSize}
 onChange={(e) => setAccountSize(e.target.value)}
 className="h-8 text-sm"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs text-muted-foreground">Stock Price ($)</label>
 <Input
 type="number"
 value={stockPrice}
 onChange={(e) => setStockPrice(e.target.value)}
 className="h-8 text-sm"
 />
 </div>
 <div className="space-y-1.5 col-span-2">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">Risk per Trade</span>
 <span className="font-medium">{riskPct}% = ${riskDollar.toFixed(0)}</span>
 </div>
 <Slider value={[riskPct]} onValueChange={(vals: number[]) => setRiskPct(vals[0])} min={0.5} max={5} step={0.5} />
 </div>
 </div>
 <div className="space-y-1.5">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">Stop Distance</span>
 <span className="font-medium">{stopPct}% = ${stopDollar.toFixed(2)}/share</span>
 </div>
 <Slider value={[stopPct]} onValueChange={(vals: number[]) => setStopPct(vals[0])} min={0.5} max={20} step={0.5} />
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div className="rounded-lg border border-border p-3">
 <p className="text-xs text-muted-foreground">Position Size</p>
 <p className="text-xl font-medium">${ffPositionSize.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
 </div>
 <div className="rounded-lg border border-border p-3">
 <p className="text-xs text-muted-foreground">Number of Shares</p>
 <p className="text-xl font-medium">{ffShares.toLocaleString()}</p>
 <p className="text-xs text-muted-foreground">Max loss: ${riskDollar.toFixed(0)}</p>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* ATR sizing */}
 <Card>
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium">ATR-Based Position Sizing</CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <p className="text-xs text-muted-foreground">
 Uses Average True Range (ATR) to set stop distance. Position = Risk $ ÷ (ATR × Multiplier).
 </p>
 <div className="grid grid-cols-3 gap-3">
 <div className="space-y-1.5">
 <label className="text-xs text-muted-foreground">ATR ($)</label>
 <Input
 type="number"
 value={atr}
 onChange={(e) => setAtr(Number(e.target.value))}
 className="h-8 text-sm"
 step="0.1"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs text-muted-foreground">ATR Multiplier</label>
 <Input
 type="number"
 value={atrMultiplier}
 onChange={(e) => setAtrMultiplier(Number(e.target.value))}
 className="h-8 text-sm"
 step="0.5"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs text-muted-foreground">Risk per Trade ($)</label>
 <Input
 type="number"
 value={riskPerTrade}
 onChange={(e) => setRiskPerTrade(Number(e.target.value))}
 className="h-8 text-sm"
 />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div className="rounded-lg border border-border p-3">
 <p className="text-xs text-muted-foreground">Stop Distance</p>
 <p className="text-xl font-medium">${(atr * atrMultiplier).toFixed(2)}</p>
 <p className="text-xs text-muted-foreground">ATR × {atrMultiplier}</p>
 </div>
 <div className="rounded-lg border border-border p-3">
 <p className="text-xs text-muted-foreground">Shares to Buy</p>
 <p className="text-xl font-medium">{atrShares}</p>
 <p className="text-xs text-muted-foreground">
 ${atrPositionSize.toLocaleString("en-US", { maximumFractionDigits: 0 })} position
 </p>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>
 );
}

// ---------------------------------------------------------------------------
// Tab 4: Drawdown
// ---------------------------------------------------------------------------

function DrawdownTab() {
 const { equityHistory, tradeHistory, portfolioValue } = useTradingStore();
 const pv = portfolioValue > 0 ? portfolioValue : INITIAL_CAPITAL;

 const snapshots = equityHistory.length >= 2 ? equityHistory : [];

 // Drawdown stats
 let peak = INITIAL_CAPITAL;
 let currentDD = 0;
 let maxDD = 0;
 let maxDDDur = 0;
 let currDDStart = 0;

 const values = snapshots.length >= 2
 ? snapshots.map((s) => s.portfolioValue)
 : (() => {
 return Array.from({ length: 30 }, (_, i) => {
 const noise = Math.sin(i * 0.4) * 3000 + Math.cos(i * 0.7) * 1500;
 return INITIAL_CAPITAL + noise + i * 200;
 });
 })();

 let totalDDPeriods = 0;
 let ddCount = 0;
 let longestDur = 0;
 let currStreak = 0;

 for (let i = 0; i < values.length; i++) {
 const v = values[i];
 if (v >= peak) {
 peak = v;
 if (currStreak > longestDur) longestDur = currStreak;
 currStreak = 0;
 } else {
 const dd = (peak - v) / peak;
 if (dd > maxDD) maxDD = dd;
 currStreak++;
 totalDDPeriods++;
 if (i === 0 || values[i - 1] >= (peak || v)) ddCount++;
 }
 }
 if (currStreak > longestDur) longestDur = currStreak;

 currentDD = peak > 0 ? ((peak - pv) / peak) * 100 : 0;
 const avgDDPct = ddCount > 0 ? (totalDDPeriods / ddCount) * 0.8 : 0;

 const ddStats = [
 { label: "Current Drawdown", value: `${Math.abs(currentDD).toFixed(2)}%`, sub: `$${Math.abs((peak - pv)).toFixed(0)} from peak` },
 { label: "Max Drawdown", value: `${(maxDD * 100).toFixed(2)}%`, sub: `Worst peak-to-trough` },
 { label: "Avg Drawdown Period", value: `${avgDDPct.toFixed(1)} days`, sub: "Typical drawdown duration" },
 { label: "Longest Drawdown", value: `${longestDur} bars`, sub: "Bars spent underwater" },
 { label: "Recovery Estimate", value: `${Math.ceil(longestDur * 1.2)} bars`, sub: "Historical avg recovery" },
 ];

 return (
 <div className="space-y-4">
 <Card>
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium">Equity Curve with Drawdown Overlay</CardTitle>
 </CardHeader>
 <CardContent>
 <EquityCurveChart snapshots={snapshots} initialCapital={INITIAL_CAPITAL} />
 <div className="mt-2 flex gap-4 text-[11px] text-muted-foreground">
 <span className="flex items-center gap-1"><span className="inline-block h-2 w-6 rounded border border-primary bg-primary/30" />Equity curve</span>
 <span className="flex items-center gap-1"><span className="inline-block h-2 w-6 rounded border border-red-500/60 bg-red-500/20" />Drawdown depth</span>
 </div>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium">Drawdown Statistics</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
 {ddStats.map((s) => (
 <div key={s.label} className="rounded-lg border border-border p-3">
 <p className="text-[11px] text-muted-foreground">{s.label}</p>
 <p className="mt-1 text-base font-medium">{s.value}</p>
 <p className="text-[11px] text-muted-foreground">{s.sub}</p>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium">Underwater Plot — % Below All-Time High</CardTitle>
 </CardHeader>
 <CardContent>
 <UnderwaterPlot snapshots={snapshots} initialCapital={INITIAL_CAPITAL} />
 <p className="mt-2 text-[11px] text-muted-foreground">
 Shows the percentage below all-time high at each point in time. Extended periods underwater indicate
 slow recovery and high psychological stress for position-holders.
 </p>
 </CardContent>
 </Card>
 </div>
 );
}

// ---------------------------------------------------------------------------
// Tab 5: Stress Tests
// ---------------------------------------------------------------------------

function StressTestsTab() {
 const { portfolioValue } = useTradingStore();
 const pv = portfolioValue > 0 ? portfolioValue : INITIAL_CAPITAL;

 const [customPct, setCustomPct] = useState(30);
 const [customResult, setCustomResult] = useState<number | null>(null);

 function stressRiskLevel(drop: number): { label: string; cls: string } {
 const abs = Math.abs(drop);
 if (abs < 20) return { label: "Moderate", cls: "bg-amber-500/20 text-amber-600 dark:text-amber-400" };
 if (abs < 35) return { label: "Severe", cls: "bg-orange-500/20 text-orange-600 dark:text-orange-400" };
 return { label: "Extreme", cls: "bg-red-500/20 text-red-600 dark:text-red-400" };
 }

 return (
 <div className="space-y-4">
 <div className="rounded-lg border border-border bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground">
 Stress tests apply historical drawdown percentages to the current portfolio value. All scenarios assume
 market-wide selloff; individual position betas may amplify or dampen actual impact.
 </div>

 {/* Pre-built scenarios grid */}
 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
 {STRESS_SCENARIOS.map((s) => {
 const dollarImpact = (pv * s.drop) / 100;
 const rl = stressRiskLevel(s.drop);
 const newPortfolioValue = pv + dollarImpact;
 return (
 <Card key={s.name} className="overflow-hidden">
 <CardContent className="p-4 space-y-2">
 <div className="flex items-start justify-between gap-2">
 <p className="text-sm font-medium leading-tight">{s.name}</p>
 <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs text-muted-foreground font-medium ${rl.cls}`}>{rl.label}</span>
 </div>
 <p className="text-[11px] text-muted-foreground leading-relaxed">{s.context}</p>
 <div className="border-t border-border pt-2 space-y-1">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">Market Drop</span>
 <span className="font-medium text-red-500">{s.drop}%</span>
 </div>
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">Portfolio Impact</span>
 <span className="font-medium text-red-500">
 ${dollarImpact.toLocaleString("en-US", { maximumFractionDigits: 0 })}
 </span>
 </div>
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">Remaining Value</span>
 <span className="font-medium">
 ${newPortfolioValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
 </span>
 </div>
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">VIX Peak</span>
 <span className="font-medium">{s.vix}</span>
 </div>
 </div>
 {/* Mini progress bar */}
 <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
 <div
 className="h-full bg-red-500 rounded-full"
 style={{ width: `${Math.min(Math.abs(s.drop), 100)}%` }}
 />
 </div>
 </CardContent>
 </Card>
 );
 })}
 </div>

 {/* Custom stress test */}
 <Card>
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium">Custom Stress Test</CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 <div className="space-y-2">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">Portfolio Change (%)</span>
 <span className="font-medium text-red-500">-{customPct}%</span>
 </div>
 <Slider
 value={[customPct]}
 onValueChange={(vals: number[]) => setCustomPct(vals[0])}
 min={0}
 max={100}
 step={1}
 />
 </div>
 <Button
 size="sm"
 onClick={() => setCustomResult(-(pv * customPct) / 100)}
 className="w-full sm:w-auto"
 >
 Run Stress Test
 </Button>
 {customResult !== null && (
 <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 space-y-1.5">
 <p className="text-xs text-muted-foreground font-medium">Stress Test Result</p>
 <div className="flex justify-between text-sm">
 <span className="text-muted-foreground">Estimated Loss</span>
 <span className="font-medium text-red-500">
 ${customResult.toLocaleString("en-US", { maximumFractionDigits: 0 })}
 </span>
 </div>
 <div className="flex justify-between text-sm">
 <span className="text-muted-foreground">Portfolio After Shock</span>
 <span className="font-medium">
 ${(pv + customResult).toLocaleString("en-US", { maximumFractionDigits: 0 })}
 </span>
 </div>
 <div className="flex justify-between text-sm">
 <span className="text-muted-foreground">Recovery Needed</span>
 <span className="font-medium">
 +{customPct > 0 ? ((100 / (100 - customPct) - 1) * 100).toFixed(1) : "0"}%
 </span>
 </div>
 </div>
 )}
 <p className="text-[11px] text-muted-foreground">
 Note: To recover from a -{customPct}% loss, the portfolio must gain +
 {customPct > 0 ? ((100 / (100 - customPct) - 1) * 100).toFixed(1) : "0"}% —
 losses are mathematically harder to recover from than gains.
 </p>
 </CardContent>
 </Card>
 </div>
 );
}

// ---------------------------------------------------------------------------
// Tab 6: VaR Calculator
// ---------------------------------------------------------------------------

function VaRCalculatorTab() {
 const { portfolioValue } = useTradingStore();
 const pv = portfolioValue > 0 ? portfolioValue : INITIAL_CAPITAL;
 return <VaRCalculator portfolioValue={pv} />;
}

// ---------------------------------------------------------------------------
// Tab 7: Correlation Analysis
// ---------------------------------------------------------------------------

function CorrelationAnalysisTab() {
 const { portfolioValue, positions: rawPositions } = useTradingStore();
 const pv = portfolioValue > 0 ? portfolioValue : INITIAL_CAPITAL;

 const positions =
 rawPositions.length >= 2
 ? rawPositions.map((p) => ({
 ticker: p.ticker,
 weight: (p.currentPrice * p.quantity) / (pv || 1),
 sigma: 0.25, // annualized vol placeholder
 }))
 : undefined;

 return <CorrelationAnalysis positions={positions} portfolioValue={pv} />;
}

// ---------------------------------------------------------------------------
// Page root
// ---------------------------------------------------------------------------

export default function RiskPage() {
 return (
 <div className="flex flex-col gap-4 p-4 md:p-4">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-xl font-medium">Risk Management</h1>
 <p className="mt-0.5 text-sm text-muted-foreground">
 Portfolio risk analytics, position sizing, and stress testing
 </p>
 </div>
 </div>

 <Tabs defaultValue="overview" className="space-y-4">
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
 {[
 { value: "overview", label: "Overview" },
 { value: "scenarios", label: "Scenarios" },
 { value: "sizing", label: "Position Sizing" },
 { value: "drawdown", label: "Drawdown" },
 { value: "stress", label: "Stress Tests" },
 { value: "var", label: "VaR Calculator" },
 { value: "correlation", label: "Correlation" },
 ].map((t) => (
 <TabsTrigger
 key={t.value}
 value={t.value}
 className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground"
 >
 {t.label}
 </TabsTrigger>
 ))}
 </TabsList>

 <TabsContent value="overview"><OverviewTab /></TabsContent>
 <TabsContent value="scenarios"><ScenariosTab /></TabsContent>
 <TabsContent value="sizing"><PositionSizingTab /></TabsContent>
 <TabsContent value="drawdown"><DrawdownTab /></TabsContent>
 <TabsContent value="stress"><StressTestsTab /></TabsContent>
 <TabsContent value="var"><VaRCalculatorTab /></TabsContent>
 <TabsContent value="correlation"><CorrelationAnalysisTab /></TabsContent>
 </Tabs>
 </div>
 );
}
