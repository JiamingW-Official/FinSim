"use client";

import { useState, useMemo } from "react";
import {
 TrendingUp,
 TrendingDown,
 BarChart3,
 Activity,
 Layers,
 Target,
 Globe,
 Zap,
 Scale,
 ArrowUpRight,
 ArrowDownRight,
 RefreshCw,
 AlertTriangle,
 DollarSign,
 PieChart,
 GitMerge,
 Repeat,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 632005;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};
function resetSeed() {
 s = 632005;
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface PairPosition {
 longTicker: string;
 shortTicker: string;
 sector: string;
 longWeight: number;
 shortWeight: number;
 spread: number;
 zScore: number;
 pnl: number;
}

interface MacroTheme {
 id: string;
 name: string;
 category: "rates" | "fx" | "commodities" | "equities";
 position: "long" | "short";
 notional: number;
 currentPnl: number;
 conviction: "high" | "medium" | "low";
 rationale: string;
 color: string;
}

interface MergerDeal {
 acquirer: string;
 target: string;
 dealPrice: number;
 currentPrice: number;
 spread: number;
 expectedClose: string;
 probability: number;
 annualizedReturn: number;
 dealType: "cash" | "stock" | "mixed";
 status: "pending" | "approved" | "at_risk";
}

interface DistressedCredit {
 issuer: string;
 coupon: number;
 maturity: string;
 currentYield: number;
 spread: number;
 distressRatio: number;
 recoveryEst: number;
 catalyst: string;
 rating: string;
}

interface ConvertibleArb {
 issuer: string;
 conversionPremium: number;
 theoreticalValue: number;
 marketPrice: number;
 mispricing: number;
 delta: number;
 gamma: number;
 impliedVol: number;
}

interface FactorAttribution {
 factor: string;
 contribution: number;
 tStat: number;
 color: string;
}

interface DrawdownPoint {
 month: string;
 nav: number;
 drawdown: number;
}

// ── Static data (seeded) ───────────────────────────────────────────────────────

function buildPairPositions(): PairPosition[] {
 resetSeed();
 const pairs: PairPosition[] = [
 { longTicker: "JPM", shortTicker: "WFC", sector: "Banks", longWeight: 4.2, shortWeight: -3.8, spread: 0.0, zScore: 0.0, pnl: 0.0 },
 { longTicker: "MSFT", shortTicker: "ORCL", sector: "Software", longWeight: 5.1, shortWeight: -4.9, spread: 0.0, zScore: 0.0, pnl: 0.0 },
 { longTicker: "HD", shortTicker: "LOW", sector: "Retail", longWeight: 3.3, shortWeight: -3.1, spread: 0.0, zScore: 0.0, pnl: 0.0 },
 { longTicker: "CVX", shortTicker: "XOM", sector: "Energy", longWeight: 2.8, shortWeight: -2.5, spread: 0.0, zScore: 0.0, pnl: 0.0 },
 { longTicker: "UNH", shortTicker: "CVS", sector: "Healthcare", longWeight: 3.6, shortWeight: -3.4, spread: 0.0, zScore: 0.0, pnl: 0.0 },
 { longTicker: "AMZN", shortTicker: "EBAY", sector: "E-Commerce", longWeight: 4.5, shortWeight: -4.0, spread: 0.0, zScore: 0.0, pnl: 0.0 },
 ];
 return pairs.map((p) => ({
 ...p,
 spread: +(rand() * 4 - 2).toFixed(2),
 zScore: +(rand() * 4 - 2).toFixed(2),
 pnl: +(rand() * 600000 - 200000),
 }));
}

function buildMacroThemes(): MacroTheme[] {
 resetSeed();
 rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand();
 return [
 { id: "t1", name: "Fed Rate Cut Cycle", category: "rates", position: "long", notional: 250, currentPnl: 3.4, conviction: "high", rationale: "Core PCE trending toward 2% target; labor market softening", color: "#22c55e" },
 { id: "t2", name: "USD Weakness vs EM", category: "fx", position: "short", notional: 180, currentPnl: -1.2, conviction: "medium", rationale: "US fiscal deficit widening; EM rate differentials narrowing", color: "#f59e0b" },
 { id: "t3", name: "Gold Breakout", category: "commodities", position: "long", notional: 120, currentPnl: 5.8, conviction: "high", rationale: "Central bank buying, de-dollarization trend, negative real rates", color: "#a78bfa" },
 { id: "t4", name: "Crude Oil Short", category: "commodities", position: "short", notional: 95, currentPnl: 2.1, conviction: "medium", rationale: "OPEC+ supply discipline weakening; EV adoption accelerating", color: "#f97316" },
 { id: "t5", name: "JPY Long vs USD", category: "fx", position: "long", notional: 200, currentPnl: 4.3, conviction: "high", rationale: "BoJ policy normalization; carry unwind risk materializing", color: "#06b6d4" },
 { id: "t6", name: "China A-Shares", category: "equities", position: "long", notional: 75, currentPnl: -2.8, conviction: "low", rationale: "Policy stimulus; valuations at decade lows vs. developed markets", color: "#ec4899" },
 ];
}

function buildMergerDeals(): MergerDeal[] {
 resetSeed();
 rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand();
 return [
 { acquirer: "Pfizer", target: "Seagen", dealPrice: 229.00, currentPrice: 226.80, spread: 2.20, expectedClose: "Q2 2026", probability: 94, annualizedReturn: 8.2, dealType: "cash", status: "approved" },
 { acquirer: "Microsoft", target: "Activision", dealPrice: 95.00, currentPrice: 93.40, spread: 1.60, expectedClose: "Q1 2026", probability: 97, annualizedReturn: 6.8, dealType: "cash", status: "approved" },
 { acquirer: "Broadcom", target: "VMware", dealPrice: 142.50, currentPrice: 139.80, spread: 2.70, expectedClose: "Q3 2026", probability: 82, annualizedReturn: 11.4, dealType: "mixed", status: "pending" },
 { acquirer: "Chevron", target: "Hess", dealPrice: 171.00, currentPrice: 162.30, spread: 8.70, expectedClose: "Q4 2026", probability: 71, annualizedReturn: 14.8, dealType: "stock", status: "at_risk" },
 { acquirer: "Capital One", target: "Discover", dealPrice: 140.00, currentPrice: 134.50, spread: 5.50, expectedClose: "Q2 2026", probability: 78, annualizedReturn: 12.1, dealType: "stock", status: "pending" },
 { acquirer: "Juniper", target: "HPE", dealPrice: 14.00, currentPrice: 13.70, spread: 0.30, expectedClose: "Q1 2026", probability: 88, annualizedReturn: 5.9, dealType: "cash", status: "approved" },
 ];
}

function buildDistressedCredits(): DistressedCredit[] {
 resetSeed();
 rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand();
 return [
 { issuer: "Bed Bath & Beyond", coupon: 4.915, maturity: "2034", currentYield: 28.4, spread: 2640, distressRatio: 78, recoveryEst: 32, catalyst: "Liquidation proceeds", rating: "D" },
 { issuer: "WeWork Inc.", coupon: 7.875, maturity: "2025", currentYield: 45.2, spread: 4320, distressRatio: 92, recoveryEst: 18, catalyst: "Restructuring plan", rating: "D" },
 { issuer: "Carvana Co.", coupon: 10.25, maturity: "2030", currentYield: 19.8, spread: 1780, distressRatio: 62, recoveryEst: 51, catalyst: "Debt exchange offer", rating: "CCC+" },
 { issuer: "AMC Networks", coupon: 4.25, maturity: "2029", currentYield: 15.6, spread: 1360, distressRatio: 48, recoveryEst: 65, catalyst: "Asset sale / refi", rating: "B-" },
 { issuer: "Spirit Airlines", coupon: 8.00, maturity: "2025", currentYield: 38.7, spread: 3670, distressRatio: 88, recoveryEst: 22, catalyst: "Ch. 11 reorganization", rating: "D" },
 ];
}

function buildConvertibleArb(): ConvertibleArb[] {
 resetSeed();
 rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand();
 return [
 { issuer: "Tesla 2.00% 2024", conversionPremium: 22.4, theoreticalValue: 108.2, marketPrice: 105.6, mispricing: -2.6, delta: 0.52, gamma: 0.018, impliedVol: 48.2 },
 { issuer: "Airbnb 0.00% 2026", conversionPremium: 35.1, theoreticalValue: 112.8, marketPrice: 110.3, mispricing: -2.5, delta: 0.38, gamma: 0.021, impliedVol: 42.7 },
 { issuer: "Snap 0.125% 2028", conversionPremium: 18.6, theoreticalValue: 95.4, marketPrice: 93.1, mispricing: -2.3, delta: 0.61, gamma: 0.024, impliedVol: 58.3 },
 { issuer: "Uber 0.00% 2025", conversionPremium: 14.2, theoreticalValue: 103.7, marketPrice: 105.9, mispricing: +2.2, delta: 0.73, gamma: 0.012, impliedVol: 36.8 },
 { issuer: "Block 0.125% 2027", conversionPremium: 28.9, theoreticalValue: 98.1, marketPrice: 96.4, mispricing: -1.7, delta: 0.44, gamma: 0.019, impliedVol: 52.1 },
 ];
}

function buildEquityCurve(): DrawdownPoint[] {
 resetSeed();
 rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand();
 const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr"];
 let nav = 100;
 let peak = 100;
 return months.map((m, i) => {
 const r = (rand() - 0.38) * 3.2;
 nav = nav * (1 + r / 100);
 if (nav > peak) peak = nav;
 const dd = ((nav - peak) / peak) * 100;
 return { month: i % 12 === 0 && i > 0 ? m + (i >= 12 ? "'" + (24 + Math.floor(i / 12)) : "'24") : m, nav: +nav.toFixed(2), drawdown: +dd.toFixed(2) };
 });
}

function buildFactorAttribution(): FactorAttribution[] {
 resetSeed();
 rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand();
 return [
 { factor: "Alpha (Idiosyncratic)", contribution: 4.82, tStat: 3.21, color: "#22c55e" },
 { factor: "Market Beta", contribution: 2.14, tStat: 8.74, color: "#3b82f6" },
 { factor: "Size (SMB)", contribution: 0.38, tStat: 1.42, color: "#a78bfa" },
 { factor: "Value (HML)", contribution: 1.12, tStat: 2.87, color: "#f59e0b" },
 { factor: "Momentum (MOM)", contribution: 1.95, tStat: 3.54, color: "#06b6d4" },
 { factor: "Quality (QMJ)", contribution: 0.71, tStat: 2.11, color: "#ec4899" },
 { factor: "Low Volatility", contribution: -0.32, tStat: -0.98, color: "#ef4444" },
 ];
}

// ── SVG Charts ─────────────────────────────────────────────────────────────────

function ExposureBarChart({ pairs }: { pairs: PairPosition[] }) {
 const w = 480;
 const barH = 22;
 const gap = 8;
 const totalH = pairs.length * (barH * 2 + gap + 12) + 40;
 const maxW = 5.5;

 return (
 <svg viewBox={`0 0 ${w} ${totalH}`} className="w-full" style={{ height: totalH }}>
 <text x={w / 2} y={16} textAnchor="middle" fill="#94a3b8" fontSize={11}>Net Exposure by Pair (%)</text>
 {pairs.map((p, i) => {
 const y = 28 + i * (barH * 2 + gap + 12);
 const longPx = (p.longWeight / maxW) * (w / 2 - 80);
 const shortPx = (Math.abs(p.shortWeight) / maxW) * (w / 2 - 80);
 return (
 <g key={p.longTicker}>
 <text x={80} y={y + barH - 4} textAnchor="end" fill="#cbd5e1" fontSize={10}>{p.longTicker}</text>
 <rect x={84} y={y} width={longPx} height={barH} rx={3} fill="#22c55e" opacity={0.8} />
 <text x={84 + longPx + 4} y={y + barH - 4} fill="#22c55e" fontSize={9}>{p.longWeight.toFixed(1)}%</text>
 <text x={80} y={y + barH + gap + barH - 4} textAnchor="end" fill="#cbd5e1" fontSize={10}>{p.shortTicker}</text>
 <rect x={84} y={y + barH + gap} width={shortPx} height={barH} rx={3} fill="#ef4444" opacity={0.8} />
 <text x={84 + shortPx + 4} y={y + barH + gap + barH - 4} fill="#ef4444" fontSize={9}>{p.shortWeight.toFixed(1)}%</text>
 </g>
 );
 })}
 </svg>
 );
}

function CorrelationMatrix({ themes }: { themes: MacroTheme[] }) {
 const labels = themes.map((t) => t.name.split(" ").slice(0, 2).join(" "));
 const n = labels.length;
 const cellSize = 54;
 const labelW = 100;
 const w = labelW + n * cellSize + 16;
 const h = 40 + n * cellSize + 16;

 resetSeed();
 rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand();
 const matrix: number[][] = Array.from({ length: n }, (_, i) =>
 Array.from({ length: n }, (_, j) => {
 if (i === j) return 1.0;
 const v = +(rand() * 1.6 - 0.8).toFixed(2);
 return v;
 })
 );

 function corrColor(v: number): string {
 if (v >= 0.8) return "#22c55e";
 if (v >= 0.4) return "#86efac";
 if (v >= 0.0) return "#166534";
 if (v >= -0.4) return "#7f1d1d";
 if (v >= -0.8) return "#ef4444";
 return "#dc2626";
 }

 return (
 <svg viewBox={`0 0 ${w} ${h}`} className="w-full overflow-visible" style={{ height: Math.min(h, 380) }}>
 {labels.map((l, i) => (
 <g key={l}>
 <text x={labelW - 6} y={52 + i * cellSize + cellSize / 2} textAnchor="end" fill="#94a3b8" fontSize={9} dominantBaseline="middle">{l}</text>
 <text x={labelW + i * cellSize + cellSize / 2} y={34} textAnchor="middle" fill="#94a3b8" fontSize={9}>{labels[i].split(" ")[0]}</text>
 </g>
 ))}
 {matrix.map((row, i) =>
 row.map((v, j) => (
 <g key={`${i}-${j}`}>
 <rect x={labelW + j * cellSize + 2} y={40 + i * cellSize + 2} width={cellSize - 4} height={cellSize - 4} rx={4} fill={corrColor(v)} opacity={0.7} />
 <text x={labelW + j * cellSize + cellSize / 2} y={40 + i * cellSize + cellSize / 2} textAnchor="middle" dominantBaseline="middle" fill="#f1f5f9" fontSize={10} fontWeight="600">{v.toFixed(2)}</text>
 </g>
 ))
 )}
 </svg>
 );
}

function EquityCurveSVG({ data }: { data: DrawdownPoint[] }) {
 const w = 520;
 const h = 160;
 const ddH = 60;
 const padL = 48;
 const padR = 12;
 const padTop = 10;
 const padBot = 10;
 const innerW = w - padL - padR;
 const innerH = h - padTop - padBot;
 const ddInnerH = ddH - padTop - padBot;

 const navMin = Math.min(...data.map((d) => d.nav));
 const navMax = Math.max(...data.map((d) => d.nav));
 const ddMin = Math.min(...data.map((d) => d.drawdown));

 const xScale = (i: number) => padL + (i / (data.length - 1)) * innerW;
 const yNavScale = (v: number) => padTop + innerH - ((v - navMin) / (navMax - navMin)) * innerH;
 const yDdScale = (v: number) => h + padTop + ddInnerH - ((v - ddMin) / (0 - ddMin)) * ddInnerH;

 const navPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yNavScale(d.nav)}`).join(" ");
 const ddPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yDdScale(d.drawdown)}`).join(" ");
 const areaPath = `${navPath} L ${xScale(data.length - 1)} ${padTop + innerH} L ${padL} ${padTop + innerH} Z`;
 const ddAreaPath = `${ddPath} L ${xScale(data.length - 1)} ${h + padTop + ddInnerH} L ${padL} ${h + padTop + ddInnerH} Z`;

 const gridLines = [100, 105, 110, 115, 120].filter((v) => v >= navMin && v <= navMax);
 const totalH = h + ddH + 24;

 return (
 <svg viewBox={`0 0 ${w} ${totalH}`} className="w-full" style={{ height: totalH }}>
 {/* NAV Grid */}
 {gridLines.map((v) => (
 <g key={v}>
 <line x1={padL} x2={w - padR} y1={yNavScale(v)} y2={yNavScale(v)} stroke="#334155" strokeWidth={0.5} strokeDasharray="3,3" />
 <text x={padL - 4} y={yNavScale(v)} textAnchor="end" fill="#64748b" fontSize={9} dominantBaseline="middle">{v}</text>
 </g>
 ))}
 {/* NAV area */}
 <path d={areaPath} fill="url(#navGrad)" opacity={0.3} />
 <path d={navPath} fill="none" stroke="#22c55e" strokeWidth={1.5} />
 {/* Drawdown area */}
 <path d={ddAreaPath} fill="#ef4444" opacity={0.2} />
 <path d={ddPath} fill="none" stroke="#ef4444" strokeWidth={1.2} />
 {/* Zero line for DD */}
 <line x1={padL} x2={w - padR} y1={h + padTop + ddInnerH} y2={h + padTop + ddInnerH} stroke="#475569" strokeWidth={0.5} />
 {/* Labels */}
 <text x={padL} y={padTop - 2} fill="#94a3b8" fontSize={9}>NAV</text>
 <text x={padL} y={h + padTop - 2} fill="#94a3b8" fontSize={9}>Drawdown</text>
 {/* X-axis labels */}
 {data.filter((_, i) => i % 4 === 0).map((d, idx) => (
 <text key={idx} x={xScale(idx * 4)} y={totalH - 2} textAnchor="middle" fill="#64748b" fontSize={8}>{d.month}</text>
 ))}
 <defs>
 <linearGradient id="navGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#22c55e" />
 <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
 </linearGradient>
 </defs>
 </svg>
 );
}

function FactorBarChart({ factors }: { factors: FactorAttribution[] }) {
 const w = 420;
 const barH = 24;
 const gap = 6;
 const totalH = factors.length * (barH + gap) + 40;
 const maxAbs = Math.max(...factors.map((f) => Math.abs(f.contribution)));
 const midX = 160;
 const scale = 120 / maxAbs;

 return (
 <svg viewBox={`0 0 ${w} ${totalH}`} className="w-full" style={{ height: totalH }}>
 <text x={midX} y={14} textAnchor="middle" fill="#94a3b8" fontSize={10}>Factor Contribution (%)</text>
 <line x1={midX} x2={midX} y1={20} y2={totalH - 10} stroke="#475569" strokeWidth={0.5} />
 {factors.map((f, i) => {
 const y = 22 + i * (barH + gap);
 const barW = Math.abs(f.contribution) * scale;
 const isPos = f.contribution >= 0;
 return (
 <g key={f.factor}>
 <text x={midX - 6} y={y + barH / 2} textAnchor="end" fill="#cbd5e1" fontSize={9} dominantBaseline="middle">{f.factor}</text>
 <rect
 x={isPos ? midX : midX - barW}
 y={y}
 width={barW}
 height={barH}
 rx={3}
 fill={f.color}
 opacity={0.8}
 />
 <text
 x={isPos ? midX + barW + 4 : midX - barW - 4}
 y={y + barH / 2}
 textAnchor={isPos ? "start" : "end"}
 fill={f.color}
 fontSize={9}
 dominantBaseline="middle"
 >
 {f.contribution > 0 ? "+" : ""}{f.contribution.toFixed(2)}%
 </text>
 </g>
 );
 })}
 </svg>
 );
}

function ScenarioPnLChart({ themes }: { themes: MacroTheme[] }) {
 const scenarios = ["Bull", "Base", "Bear", "Shock"];
 const w = 440;
 const h = 160;
 const barW = 44;
 const gap = 16;
 const groupW = scenarios.length * (barW + 4);
 const groupGap = 24;
 const padL = 48;
 const padTop = 24;
 const innerH = h - padTop - 24;
 const midY = padTop + innerH / 2;

 resetSeed();
 rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand();

 const scenarioMultipliers: number[] = [1.8, 1.0, -0.6, -1.4];
 const maxVal = themes.reduce((sum, t) => sum + Math.abs(t.notional * 0.08), 0);

 return (
 <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: h }}>
 {[-20, -10, 0, 10, 20].map((v) => {
 const y = midY - (v / 25) * (innerH / 2);
 return (
 <g key={v}>
 <line x1={padL - 4} x2={w - 8} y1={y} y2={y} stroke="#334155" strokeWidth={0.5} strokeDasharray="3,3" />
 <text x={padL - 6} y={y} textAnchor="end" fill="#64748b" fontSize={8} dominantBaseline="middle">{v > 0 ? "+" : ""}{v}%</text>
 </g>
 );
 })}
 <line x1={padL} x2={w - 8} y1={midY} y2={midY} stroke="#475569" strokeWidth={1} />
 {scenarios.map((sc, si) => {
 const mult = scenarioMultipliers[si];
 const x = padL + si * (groupW / scenarios.length + groupGap);
 return (
 <g key={sc}>
 <text x={x + barW / 2} y={h - 6} textAnchor="middle" fill="#94a3b8" fontSize={9}>{sc}</text>
 {themes.map((t, ti) => {
 const raw = (t.notional * 0.08 * mult * (t.position === "long" ? 1 : -1));
 const pct = (raw / maxVal) * 22;
 const bH = Math.abs(pct) * 2;
 const isPos = pct >= 0;
 return (
 <rect
 key={t.id}
 x={x + ti * 4}
 y={isPos ? midY - bH : midY}
 width={7}
 height={bH || 1}
 rx={1}
 fill={t.color}
 opacity={0.85}
 />
 );
 })}
 </g>
 );
 })}
 <text x={padL} y={14} fill="#94a3b8" fontSize={9}>Scenario P&L by Theme</text>
 </svg>
 );
}

// ── Stat pill component ────────────────────────────────────────────────────────

function StatPill({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean }) {
 return (
 <div className="flex flex-col gap-0.5 bg-muted/60 rounded-lg px-3 py-2 border border-border">
 <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
 <span className={`text-sm font-semibold ${positive === undefined ? "text-foreground" : positive ? "text-green-400" : "text-red-400"}`}>{value}</span>
 {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
 </div>
 );
}

// ── Tab 1: Long/Short Equity ───────────────────────────────────────────────────

function LongShortTab() {
 const pairs = useMemo(() => buildPairPositions(), []);
 const [selected, setSelected] = useState<number | null>(null);

 const totalLong = pairs.reduce((s, p) => s + p.longWeight, 0);
 const totalShort = pairs.reduce((s, p) => s + Math.abs(p.shortWeight), 0);
 const netExposure = totalLong - totalShort;
 const grossExposure = totalLong + totalShort;
 const totalPnl = pairs.reduce((s, p) => s + p.pnl, 0);

 const sectorGroups = Array.from(new Set(pairs.map((p) => p.sector)));

 return (
 <div className="space-y-4">
 {/* Summary stats */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 <StatPill label="Gross Exposure" value={`${grossExposure.toFixed(1)}%`} sub="of NAV" />
 <StatPill label="Net Exposure" value={`${netExposure.toFixed(1)}%`} positive={netExposure > 0} sub="long bias" />
 <StatPill label="Long/Short Ratio" value={`${(totalLong / totalShort).toFixed(2)}×`} sub="L/S" />
 <StatPill label="Pair P&L (YTD)" value={`$${(totalPnl / 1000).toFixed(0)}K`} positive={totalPnl > 0} sub="6 pairs" />
 </div>

 {/* Sector neutrality */}
 <Card className="bg-card/60 border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <Scale className="w-3.5 h-3.5 text-muted-foreground/50" />
 Sector Neutrality Check
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4 space-y-2">
 {sectorGroups.map((sector) => {
 const sp = pairs.filter((p) => p.sector === sector);
 const net = sp.reduce((s, p) => s + p.longWeight + p.shortWeight, 0);
 const isNeutral = Math.abs(net) < 0.3;
 return (
 <div key={sector} className="flex items-center gap-3">
 <span className="text-xs text-muted-foreground w-28 truncate">{sector}</span>
 <Progress value={50 + net * 8} className="flex-1 h-1.5" />
 <Badge variant="outline" className={`text-xs px-1.5 py-0 ${isNeutral ? "border-green-700 text-green-400" : "border-amber-700 text-amber-400"}`}>
 {net > 0 ? "+" : ""}{net.toFixed(1)}% {isNeutral ? "✓" : "!"}
 </Badge>
 </div>
 );
 })}
 </CardContent>
 </Card>

 {/* Pair positions table */}
 <Card className="bg-card/60 border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <Repeat className="w-3.5 h-3.5 text-muted-foreground/50" />
 Active Pair Trades
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 {["Long", "Short", "Sector", "Spread", "Z-Score", "P&L"].map((h) => (
 <th key={h} className="text-left py-2 text-muted-foreground font-medium pr-4">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {pairs.map((p, i) => (
 <tr
 key={p.longTicker}
 className={`border-b border-border cursor-pointer transition-colors ${selected === i ? "bg-muted/50" : "hover:bg-muted/30"}`}
 onClick={() => setSelected(selected === i ? null : i)}
 >
 <td className="py-2 pr-4 text-green-400 font-medium">{p.longTicker}</td>
 <td className="py-2 pr-4 text-red-400 font-medium">{p.shortTicker}</td>
 <td className="py-2 pr-4 text-muted-foreground">{p.sector}</td>
 <td className="py-2 pr-4 text-foreground">{p.spread > 0 ? "+" : ""}{p.spread}σ</td>
 <td className={`py-2 pr-4 font-medium ${Math.abs(p.zScore) > 1.5 ? "text-amber-400" : "text-muted-foreground"}`}>
 {p.zScore > 0 ? "+" : ""}{p.zScore.toFixed(2)}
 </td>
 <td className={`py-2 font-semibold ${p.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
 {p.pnl >= 0 ? "+" : ""}${(p.pnl / 1000).toFixed(0)}K
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>

 {/* SVG Exposure chart */}
 <Card className="bg-card/60 border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <BarChart3 className="w-3.5 h-3.5 text-muted-foreground/50" />
 Gross Exposure by Pair
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <ExposureBarChart pairs={pairs} />
 </CardContent>
 </Card>
 </div>
 );
}

// ── Tab 2: Global Macro ────────────────────────────────────────────────────────

function GlobalMacroTab() {
 const themes = useMemo(() => buildMacroThemes(), []);
 const [activeTheme, setActiveTheme] = useState<string | null>(null);

 const totalNotional = themes.reduce((s, t) => s + t.notional, 0);
 const totalPnlPct = themes.reduce((s, t) => s + t.currentPnl * (t.notional / totalNotional), 0);
 const longCount = themes.filter((t) => t.position === "long").length;

 const categoryColors: Record<string, string> = { rates: "#3b82f6", fx: "#a78bfa", commodities: "#f59e0b", equities: "#22c55e" };

 return (
 <div className="space-y-4">
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 <StatPill label="Total Notional" value={`$${totalNotional}M`} sub="6 themes" />
 <StatPill label="Weighted P&L" value={`${totalPnlPct > 0 ? "+" : ""}${totalPnlPct.toFixed(2)}%`} positive={totalPnlPct > 0} sub="YTD" />
 <StatPill label="Long Themes" value={`${longCount} / ${themes.length}`} sub="macro positions" />
 <StatPill label="Avg Conviction" value="Medium-High" sub="portfolio level" />
 </div>

 {/* Theme builder */}
 <Card className="bg-card/60 border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <Globe className="w-3.5 h-3.5 text-muted-foreground/50" />
 Macro Theme Book
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4 space-y-2">
 {themes.map((t) => (
 <div
 key={t.id}
 className={`rounded-lg border p-3 cursor-pointer transition-colors ${activeTheme === t.id ? "border-muted-foreground bg-muted/70" : "border-border bg-muted/20 hover:border-border"}`}
 onClick={() => setActiveTheme(activeTheme === t.id ? null : t.id)}
 >
 <div className="flex items-start justify-between gap-2">
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 rounded-full mt-0.5" style={{ backgroundColor: t.color }} />
 <div>
 <div className="text-sm font-medium text-foreground">{t.name}</div>
 <div className="flex items-center gap-2 mt-0.5">
 <Badge variant="outline" className="text-xs py-0 px-1.5" style={{ borderColor: categoryColors[t.category], color: categoryColors[t.category] }}>
 {t.category.toUpperCase()}
 </Badge>
 <Badge variant="outline" className={`text-xs py-0 px-1.5 ${t.position === "long" ? "border-green-700 text-green-400" : "border-red-700 text-red-400"}`}>
 {t.position.toUpperCase()}
 </Badge>
 <Badge variant="outline" className={`text-xs py-0 px-1.5 ${t.conviction === "high" ? "border-border text-primary" : t.conviction === "medium" ? "border-amber-700 text-amber-400" : "border-border text-muted-foreground"}`}>
 {t.conviction}
 </Badge>
 </div>
 </div>
 </div>
 <div className="text-right">
 <div className={`text-sm font-semibold ${t.currentPnl >= 0 ? "text-green-400" : "text-red-400"}`}>{t.currentPnl > 0 ? "+" : ""}{t.currentPnl.toFixed(1)}%</div>
 <div className="text-xs text-muted-foreground">${t.notional}M notional</div>
 </div>
 </div>
 {activeTheme === t.id && (
 <div className="mt-2 pt-2 border-t border-border">
 <p className="text-xs text-muted-foreground">{t.rationale}</p>
 </div>
 )}
 </div>
 ))}
 </CardContent>
 </Card>

 {/* Correlation matrix */}
 <Card className="bg-card/60 border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <Activity className="w-3.5 h-3.5 text-muted-foreground/50" />
 Theme Correlation Matrix
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4 overflow-x-auto">
 <CorrelationMatrix themes={themes} />
 </CardContent>
 </Card>

 {/* Scenario P&L */}
 <Card className="bg-card/60 border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <Zap className="w-4 h-4 text-amber-400" />
 Scenario Analysis
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <ScenarioPnLChart themes={themes} />
 <div className="flex gap-3 flex-wrap mt-2">
 {themes.map((t) => (
 <div key={t.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
 {t.name.split(" ").slice(0, 2).join(" ")}
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>
 );
}

// ── Tab 3: Event Driven ────────────────────────────────────────────────────────

function EventDrivenTab() {
 const deals = useMemo(() => buildMergerDeals(), []);
 const distressed = useMemo(() => buildDistressedCredits(), []);
 const [subTab, setSubTab] = useState<"merger" | "distressed" | "special">("merger");

 const specialSituations = [
 { name: "Icahn vs. Crown Holdings", type: "Activist", catalyst: "Board seats + capital return", upside: "+18%", probability: 68, stage: "Active" },
 { name: "GE Aerospace Spin-Off", type: "Spin-off", catalyst: "Vernova & Aerospace separation", upside: "+24%", probability: 85, stage: "Complete" },
 { name: "Kohl's Real Estate", type: "Asset Sale", catalyst: "Monetize owned store portfolio", upside: "+31%", probability: 52, stage: "Exploratory" },
 { name: "Danaher Life Sciences", type: "Restructuring", catalyst: "Water/environmental split", upside: "+16%", probability: 74, stage: "Announced" },
 { name: "SolarEdge Chapter 11", type: "Distressed Equity", catalyst: "Pre-packaged bankruptcy plan", upside: "+42%", probability: 41, stage: "Monitoring" },
 ];

 const statusColors: Record<string, string> = { approved: "border-green-700 text-green-400", pending: "border-amber-700 text-amber-400", at_risk: "border-red-700 text-red-400" };

 return (
 <div className="space-y-4">
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 <StatPill label="Active Deals" value={`${deals.length}`} sub="merger arb" />
 <StatPill label="Avg Annualized" value="9.9%" positive={true} sub="deal spread" />
 <StatPill label="Distressed Pos." value={`${distressed.length}`} sub="credits held" />
 <StatPill label="Catalyst Events" value="5" sub="special sits" />
 </div>

 <div className="flex gap-2">
 {(["merger", "distressed", "special"] as const).map((t) => (
 <Button key={t} size="sm" variant={subTab === t ? "default" : "outline"} onClick={() => setSubTab(t)} className={`text-xs capitalize ${subTab === t ? "bg-primary hover:bg-primary/80" : "border-border text-muted-foreground hover:text-foreground"}`}>
 {t === "merger" ? "Merger Arb" : t === "distressed" ? "Distressed Debt" : "Special Situations"}
 </Button>
 ))}
 </div>

 <>
 {subTab === "merger" && (
 <div>
 <Card className="bg-card/60 border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <GitMerge className="w-4 h-4 text-green-400" />
 Merger Arbitrage Spread Tracker
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 {["Acquirer", "Target", "Spread", "Deal Close", "Probability", "Ann. Return", "Type", "Status"].map((h) => (
 <th key={h} className="text-left py-2 text-muted-foreground font-medium pr-3">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {deals.map((d) => (
 <tr key={d.target} className="border-b border-border hover:bg-muted/20 transition-colors">
 <td className="py-2 pr-3 text-muted-foreground">{d.acquirer}</td>
 <td className="py-2 pr-3 text-foreground font-medium">{d.target}</td>
 <td className="py-2 pr-3 text-green-400 font-medium">${d.spread.toFixed(2)}</td>
 <td className="py-2 pr-3 text-muted-foreground">{d.expectedClose}</td>
 <td className="py-2 pr-3">
 <div className="flex items-center gap-2">
 <Progress value={d.probability} className="w-16 h-1.5" />
 <span className="text-muted-foreground">{d.probability}%</span>
 </div>
 </td>
 <td className="py-2 pr-3 text-primary font-medium">{d.annualizedReturn.toFixed(1)}%</td>
 <td className="py-2 pr-3">
 <Badge variant="outline" className="text-xs py-0 px-1.5 border-border text-muted-foreground">{d.dealType}</Badge>
 </td>
 <td className="py-2">
 <Badge variant="outline" className={`text-xs text-muted-foreground py-0 px-1.5 ${statusColors[d.status]}`}>{d.status.replace("_", " ")}</Badge>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>
 </div>
 )}

 {subTab === "distressed" && (
 <div>
 <Card className="bg-card/60 border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <AlertTriangle className="w-4 h-4 text-amber-400" />
 Distressed Debt Yield Table
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 {["Issuer", "Coupon", "Maturity", "YTM", "Spread (bps)", "Distress %", "Recovery Est.", "Catalyst", "Rating"].map((h) => (
 <th key={h} className="text-left py-2 text-muted-foreground font-medium pr-3">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {distressed.map((d) => (
 <tr key={d.issuer} className="border-b border-border hover:bg-muted/20 transition-colors">
 <td className="py-2 pr-3 text-foreground font-medium">{d.issuer}</td>
 <td className="py-2 pr-3 text-muted-foreground">{d.coupon.toFixed(3)}%</td>
 <td className="py-2 pr-3 text-muted-foreground">{d.maturity}</td>
 <td className="py-2 pr-3 text-red-400 font-medium">{d.currentYield.toFixed(1)}%</td>
 <td className="py-2 pr-3 text-red-300">{d.spread}</td>
 <td className="py-2 pr-3">
 <div className="flex items-center gap-2">
 <Progress value={d.distressRatio} className="w-12 h-1.5" />
 <span className="text-red-400">{d.distressRatio}%</span>
 </div>
 </td>
 <td className="py-2 pr-3 text-green-400">${d.recoveryEst}¢</td>
 <td className="py-2 pr-3 text-muted-foreground max-w-24">{d.catalyst}</td>
 <td className="py-2">
 <Badge variant="outline" className="text-xs py-0 px-1.5 border-red-800 text-red-400">{d.rating}</Badge>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>
 </div>
 )}

 {subTab === "special" && (
 <div>
 <Card className="bg-card/60 border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <Target className="w-3.5 h-3.5 text-muted-foreground/50" />
 Special Situations Screener
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4 space-y-3">
 {specialSituations.map((ss) => (
 <div key={ss.name} className="rounded-lg border border-border bg-muted/20 p-3">
 <div className="flex items-start justify-between">
 <div>
 <div className="text-sm font-medium text-foreground">{ss.name}</div>
 <div className="flex items-center gap-2 mt-1">
 <Badge variant="outline" className="text-xs py-0 px-1.5 border-border text-primary">{ss.type}</Badge>
 <Badge variant="outline" className="text-xs py-0 px-1.5 border-border text-muted-foreground">{ss.stage}</Badge>
 </div>
 <p className="text-xs text-muted-foreground mt-1.5">{ss.catalyst}</p>
 </div>
 <div className="text-right">
 <div className="text-sm font-medium text-green-400">{ss.upside}</div>
 <div className="flex items-center justify-end gap-1.5 mt-1">
 <Progress value={ss.probability} className="w-16 h-1" />
 <span className="text-xs text-muted-foreground">{ss.probability}%</span>
 </div>
 </div>
 </div>
 </div>
 ))}
 </CardContent>
 </Card>
 </div>
 )}
 </>
 </div>
 );
}

// ── Tab 4: Relative Value ──────────────────────────────────────────────────────

function RelativeValueTab() {
 const convertibles = useMemo(() => buildConvertibleArb(), []);
 const [rvMode, setRvMode] = useState<"convertible" | "capstructure" | "statarb">("convertible");

 const capStructureDeals = [
 { name: "Ford Motor Credit vs. Ford Equity", longLeg: "Ford 6.2% Sr. Notes", shortLeg: "F Equity", expectedCapture: 185, currentSpread: 210, edge: 25, riskRating: "Medium" },
 { name: "Macy's Sr. vs. Sub Debt", longLeg: "M 5.875% 2030", shortLeg: "M 8.375% 2037", expectedCapture: 95, currentSpread: 115, edge: 20, riskRating: "Low" },
 { name: "Sprint vs. T-Mobile Yields", longLeg: "TMUS 3.5% 2025", shortLeg: "SPRINTUS 7.1% 2034", expectedCapture: 130, currentSpread: 155, edge: 25, riskRating: "Low" },
 { name: "Carnival Corp CDS vs. Cash Bond", longLeg: "CCL 10.5% 2030 Cash", shortLeg: "CCL 5Y CDS", expectedCapture: 65, currentSpread: 82, edge: 17, riskRating: "High" },
 ];

 const statArbPairs = [
 { name: "Gold vs. Gold Miners (GDX)", asset1: "GLD", asset2: "GDX", correlation: 0.87, zScore: 2.14, halfLife: 12, signal: "Long GDX / Short GLD", expectedReturn: 4.2 },
 { name: "Oil vs. Energy ETF", asset1: "CL1", asset2: "XLE", correlation: 0.91, zScore: -1.82, halfLife: 8, signal: "Long CL1 / Short XLE", expectedReturn: 3.1 },
 { name: "SPX vs. ES Futures", asset1: "SPY", asset2: "ES1", correlation: 0.997, zScore: 0.34, halfLife: 2, signal: "Monitor (no trade)", expectedReturn: 0.2 },
 { name: "10Y Treasury vs. TLT ETF", asset1: "TLT", asset2: "ZN1", correlation: 0.994, zScore: 1.21, halfLife: 3, signal: "Long TLT / Short ZN1", expectedReturn: 1.8 },
 { name: "Brent vs. WTI Crude", asset1: "BNO", asset2: "USO", correlation: 0.96, zScore: 1.65, halfLife: 5, signal: "Short BNO / Long USO", expectedReturn: 2.9 },
 ];

 return (
 <div className="space-y-4">
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 <StatPill label="Conv. Arb Book" value="$342M" sub="5 positions" />
 <StatPill label="Avg Mispricing" value="-2.1%" positive={false} sub="delta-hedged" />
 <StatPill label="Cap Struct. Arb" value="4 trades" sub="bond/equity" />
 <StatPill label="Stat Arb Signals" value="4 active" positive={true} sub="mean reversion" />
 </div>

 <div className="flex gap-2 flex-wrap">
 {([["convertible", "Convertible Arb"], ["capstructure", "Capital Structure Arb"], ["statarb", "Stat Arb"]] as const).map(([key, label]) => (
 <Button key={key} size="sm" variant={rvMode === key ? "default" : "outline"} onClick={() => setRvMode(key)} className={`text-xs ${rvMode === key ? "bg-primary hover:bg-primary/80" : "border-border text-muted-foreground hover:text-foreground"}`}>
 {label}
 </Button>
 ))}
 </div>

 <>
 {rvMode === "convertible" && (
 <div>
 <Card className="bg-card/60 border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <Layers className="w-3.5 h-3.5 text-muted-foreground/50" />
 Convertible Arbitrage — Delta-Hedged Book
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 {["Instrument", "Conv. Prem.", "Theory Val.", "Mkt Price", "Mispricing", "Delta", "Gamma", "Imp. Vol"].map((h) => (
 <th key={h} className="text-left py-2 text-muted-foreground font-medium pr-3">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {convertibles.map((c) => (
 <tr key={c.issuer} className="border-b border-border hover:bg-muted/20 transition-colors">
 <td className="py-2 pr-3 text-foreground font-medium text-[11px]">{c.issuer}</td>
 <td className="py-2 pr-3 text-muted-foreground">{c.conversionPremium.toFixed(1)}%</td>
 <td className="py-2 pr-3 text-muted-foreground">{c.theoreticalValue.toFixed(1)}</td>
 <td className="py-2 pr-3 text-muted-foreground">{c.marketPrice.toFixed(1)}</td>
 <td className={`py-2 pr-3 font-medium ${c.mispricing < 0 ? "text-green-400" : "text-red-400"}`}>
 {c.mispricing > 0 ? "+" : ""}{c.mispricing.toFixed(1)}
 </td>
 <td className="py-2 pr-3 text-primary">{c.delta.toFixed(2)}</td>
 <td className="py-2 pr-3 text-primary">{c.gamma.toFixed(3)}</td>
 <td className="py-2 text-amber-400">{c.impliedVol.toFixed(1)}%</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 <p className="text-xs text-muted-foreground mt-2">* Negative mispricing = bond undervalued relative to theoretical — long opportunity after delta hedge</p>
 </CardContent>
 </Card>
 </div>
 )}

 {rvMode === "capstructure" && (
 <div>
 <Card className="bg-card/60 border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <DollarSign className="w-4 h-4 text-green-400" />
 Capital Structure Arbitrage
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4 space-y-3">
 {capStructureDeals.map((d) => (
 <div key={d.name} className="rounded-lg border border-border bg-muted/20 p-3">
 <div className="flex items-start justify-between gap-2">
 <div>
 <div className="text-sm font-medium text-foreground">{d.name}</div>
 <div className="text-xs text-muted-foreground mt-0.5">Long: <span className="text-green-400">{d.longLeg}</span></div>
 <div className="text-xs text-muted-foreground">Short: <span className="text-red-400">{d.shortLeg}</span></div>
 </div>
 <div className="text-right">
 <Badge variant="outline" className={`text-xs py-0 px-1.5 mb-1 ${d.riskRating === "Low" ? "border-green-700 text-green-400" : d.riskRating === "Medium" ? "border-amber-700 text-amber-400" : "border-red-700 text-red-400"}`}>
 {d.riskRating} Risk
 </Badge>
 <div className="text-xs text-muted-foreground">Current: <span className="text-foreground">{d.currentSpread}bps</span></div>
 <div className="text-xs text-green-400 font-medium">Edge: +{d.edge}bps</div>
 </div>
 </div>
 <div className="mt-2">
 <div className="flex justify-between text-xs text-muted-foreground mb-1">
 <span>Expected: {d.expectedCapture}bps</span>
 <span>Current: {d.currentSpread}bps</span>
 </div>
 <Progress value={(d.expectedCapture / d.currentSpread) * 100} className="h-1.5" />
 </div>
 </div>
 ))}
 </CardContent>
 </Card>
 </div>
 )}

 {rvMode === "statarb" && (
 <div>
 <Card className="bg-card/60 border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <RefreshCw className="w-4 h-4 text-muted-foreground" />
 Statistical Arbitrage Framework
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 {["Pair", "Correlation", "Z-Score", "Half-Life (d)", "Signal", "Exp. Return"].map((h) => (
 <th key={h} className="text-left py-2 text-muted-foreground font-medium pr-3">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {statArbPairs.map((p) => (
 <tr key={p.name} className="border-b border-border hover:bg-muted/20 transition-colors">
 <td className="py-2 pr-3 text-foreground font-medium">{p.name}</td>
 <td className="py-2 pr-3 text-primary">{p.correlation.toFixed(3)}</td>
 <td className={`py-2 pr-3 font-medium ${Math.abs(p.zScore) > 1.5 ? "text-amber-400" : "text-muted-foreground"}`}>
 {p.zScore > 0 ? "+" : ""}{p.zScore.toFixed(2)}
 </td>
 <td className="py-2 pr-3 text-muted-foreground">{p.halfLife}d</td>
 <td className="py-2 pr-3 text-primary text-[11px]">{p.signal}</td>
 <td className={`py-2 font-medium ${p.expectedReturn > 1 ? "text-green-400" : "text-muted-foreground"}`}>{p.expectedReturn.toFixed(1)}%</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>
 </div>
 )}
 </>
 </div>
 );
}

// ── Tab 5: Performance Attribution ────────────────────────────────────────────

function PerformanceTab() {
 const curve = useMemo(() => buildEquityCurve(), []);
 const factors = useMemo(() => buildFactorAttribution(), []);

 const finalNav = curve[curve.length - 1]?.nav ?? 100;
 const totalReturn = finalNav - 100;
 const maxDD = Math.min(...curve.map((d) => d.drawdown));
 const alpha = factors.find((f) => f.factor.startsWith("Alpha"))?.contribution ?? 0;
 const beta = factors.find((f) => f.factor === "Market Beta")?.contribution ?? 0;
 const totalFactorReturn = factors.reduce((s, f) => s + f.contribution, 0);

 const monthlyReturns = [3.2, -1.1, 2.8, 1.4, -0.6, 3.7, -2.1, 4.2, 1.8, -1.3, 2.9, 1.6, 0.8, -1.8, 3.1, 1.2];
 const winMonths = monthlyReturns.filter((r) => r > 0).length;

 return (
 <div className="space-y-4">
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 <StatPill label="Total Return" value={`+${totalReturn.toFixed(1)}%`} positive={true} sub="28 months" />
 <StatPill label="Max Drawdown" value={`${maxDD.toFixed(1)}%`} positive={false} sub="peak-to-trough" />
 <StatPill label="Pure Alpha" value={`+${alpha.toFixed(2)}%`} positive={true} sub="idiosyncratic" />
 <StatPill label="Win Rate" value={`${((winMonths / monthlyReturns.length) * 100).toFixed(0)}%`} positive={true} sub="monthly returns" />
 </div>

 {/* Equity curve */}
 <Card className="bg-card/60 border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <TrendingUp className="w-4 h-4 text-green-400" />
 NAV & Drawdown — 28 Month Track Record
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <EquityCurveSVG data={curve} />
 </CardContent>
 </Card>

 {/* Alpha/Beta decomposition */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <Card className="bg-card/60 border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <PieChart className="w-3.5 h-3.5 text-muted-foreground/50" />
 Alpha vs Beta Decomposition
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <div className="space-y-3">
 {[
 { label: "Pure Alpha", value: alpha, color: "#22c55e", pct: (alpha / totalFactorReturn) * 100 },
 { label: "Market Beta", value: beta, color: "#3b82f6", pct: (beta / totalFactorReturn) * 100 },
 { label: "Factor Premia", value: totalFactorReturn - alpha - beta, color: "#a78bfa", pct: ((totalFactorReturn - alpha - beta) / totalFactorReturn) * 100 },
 ].map((item) => (
 <div key={item.label}>
 <div className="flex justify-between text-xs text-muted-foreground mb-1">
 <span className="text-muted-foreground">{item.label}</span>
 <span style={{ color: item.color }} className="font-medium">+{item.value.toFixed(2)}%</span>
 </div>
 <Progress value={Math.max(0, item.pct)} className="h-2" />
 </div>
 ))}
 </div>
 <div className="mt-4 pt-3 border-t border-border">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">Total Attributed Return</span>
 <span className="text-green-400 font-medium">+{totalFactorReturn.toFixed(2)}%</span>
 </div>
 <div className="flex justify-between text-xs text-muted-foreground mt-1">
 <span className="text-muted-foreground">Information Ratio (alpha)</span>
 <span className="text-green-400 font-medium">{(alpha / 1.82).toFixed(2)}</span>
 </div>
 <div className="flex justify-between text-xs text-muted-foreground mt-1">
 <span className="text-muted-foreground">Portfolio Beta (equity)</span>
 <span className="text-primary font-medium">0.38</span>
 </div>
 </div>
 </CardContent>
 </Card>

 <Card className="bg-card/60 border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <BarChart3 className="w-3.5 h-3.5 text-muted-foreground/50" />
 Factor Attribution
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <FactorBarChart factors={factors} />
 </CardContent>
 </Card>
 </div>

 {/* Monthly return heatmap */}
 <Card className="bg-card/60 border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <Activity className="w-4 h-4 text-amber-400" />
 Monthly Return Calendar
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
 {monthlyReturns.map((r, i) => (
 <div
 key={i}
 className={`rounded-md p-2 text-center border ${r >= 0 ? "bg-green-950/40 border-green-900/40" : "bg-red-950/40 border-red-900/40"}`}
 >
 <div className="text-[11px] text-muted-foreground mb-0.5">M{i + 1}</div>
 <div className={`text-xs font-medium ${r >= 0 ? "text-green-400" : "text-red-400"}`}>
 {r > 0 ? "+" : ""}{r.toFixed(1)}%
 </div>
 </div>
 ))}
 </div>
 <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
 <div className="flex gap-4 text-xs text-muted-foreground">
 <span>Best Month: <span className="text-green-400">+4.2%</span></span>
 <span>Worst Month: <span className="text-red-400">-2.1%</span></span>
 </div>
 <div className="text-xs text-muted-foreground">
 Win Rate: <span className="text-muted-foreground font-medium">{((winMonths / monthlyReturns.length) * 100).toFixed(0)}%</span>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Risk metrics */}
 <Card className="bg-card/60 border-border">
 <CardHeader className="pb-2 pt-4 px-4">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <Scale className="w-4 h-4 text-muted-foreground" />
 Risk &amp; Return Metrics
 </CardTitle>
 </CardHeader>
 <CardContent className="px-4 pb-4">
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 {[
 { label: "Sharpe Ratio", value: "1.82", positive: true },
 { label: "Sortino Ratio", value: "2.41", positive: true },
 { label: "Calmar Ratio", value: "1.34", positive: true },
 { label: "Omega Ratio", value: "1.67", positive: true },
 { label: "Annualized Vol", value: "8.4%", positive: undefined },
 { label: "Downside Dev.", value: "5.1%", positive: undefined },
 { label: "Skewness", value: "+0.32", positive: true },
 { label: "Kurtosis", value: "3.12", positive: undefined },
 ].map((m) => (
 <div key={m.label} className="bg-muted/40 rounded-lg p-2.5 border border-border">
 <div className="text-xs text-muted-foreground mb-0.5">{m.label}</div>
 <div className={`text-sm font-medium ${m.positive === true ? "text-green-400" : m.positive === false ? "text-red-400" : "text-foreground"}`}>
 {m.value}
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>
 );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function HFStrategiesPage() {
 return (
 <div className="flex h-full flex-col overflow-y-auto">
 <div className="mx-auto w-full max-w-5xl px-6 py-8 flex-1 flex flex-col">
 {/* Header */}
 <h1 className="text-3xl font-bold tracking-tight mb-1">Hedge Fund Strategies</h1>
 <p className="text-sm text-muted-foreground">Professional-grade strategy simulator — Long/Short, Global Macro, Event Driven, Relative Value</p>
 <div className="flex items-center gap-2 mt-2">
 <Badge variant="outline" className="border-green-700 text-green-400 text-xs">AUM: $2.4B</Badge>
 <Badge variant="outline" className="border-border text-primary text-xs">Sharpe: 1.82</Badge>
 <Badge variant="outline" className="border-border text-primary text-xs">YTD: +11.3%</Badge>
 </div>
 <div className="border-t border-border my-6" />

 {/* Fund overview bar */}
 <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 p-6 rounded-lg border border-border bg-muted/30 mb-6">
 {[
 { label: "Strategy", value: "Multi-Strat" },
 { label: "Gross Leverage", value: "1.8×" },
 { label: "Net Exposure", value: "42%" },
 { label: "Inception Return", value: "+38.4%" },
 { label: "Max Drawdown", value: "-7.2%" },
 { label: "S&P 500 Corr", value: "0.31" },
 ].map((item) => (
 <div key={item.label} className="flex flex-col items-center text-center">
 <span className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-0.5">{item.label}</span>
 <span className="text-sm font-medium text-foreground">{item.value}</span>
 </div>
 ))}
 </div>

 {/* Main tabs */}
 <Tabs defaultValue="longshort">
 <TabsList className="border-b border-border bg-transparent p-0 h-auto w-full flex gap-4">
 <TabsTrigger value="longshort" className="rounded-none px-0 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground text-muted-foreground">Long/Short Equity</TabsTrigger>
 <TabsTrigger value="globalmacro" className="rounded-none px-0 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground text-muted-foreground">Global Macro</TabsTrigger>
 <TabsTrigger value="eventdriven" className="rounded-none px-0 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground text-muted-foreground">Event Driven</TabsTrigger>
 <TabsTrigger value="relvalue" className="rounded-none px-0 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground text-muted-foreground">Relative Value</TabsTrigger>
 <TabsTrigger value="performance" className="rounded-none px-0 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground text-muted-foreground">Performance Attribution</TabsTrigger>
 </TabsList>

 <TabsContent value="longshort" className="mt-4 data-[state=inactive]:hidden">
 <LongShortTab />
 </TabsContent>
 <TabsContent value="globalmacro" className="mt-4 data-[state=inactive]:hidden">
 <GlobalMacroTab />
 </TabsContent>
 <TabsContent value="eventdriven" className="mt-4 data-[state=inactive]:hidden">
 <EventDrivenTab />
 </TabsContent>
 <TabsContent value="relvalue" className="mt-4 data-[state=inactive]:hidden">
 <RelativeValueTab />
 </TabsContent>
 <TabsContent value="performance" className="mt-4 data-[state=inactive]:hidden">
 <PerformanceTab />
 </TabsContent>
 </Tabs>
 </div>
 </div>
 );
}
