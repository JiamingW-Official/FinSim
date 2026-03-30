"use client";

import { useState, useMemo } from "react";
import {
 TrendingUp,
 TrendingDown,
 Target,
 Award,
 BarChart3,
 Calendar,
 Activity,
 CheckCircle2,
 Clock,
 Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Mulberry32 seeded PRNG ────────────────────────────────────────────────────

function mulberry32(seed: number) {
 let s = seed;
 return function () {
 s += 0x6d2b79f5;
 let t = s;
 t = Math.imul(t ^ (t >>> 15), t | 1);
 t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
 return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
 };
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface MonthlyReturn {
 year: number;
 month: number; // 0-indexed
 returnPct: number;
}

interface BenchmarkSeries {
 label: string;
 color: string;
 values: number[]; // normalized to 100 at start
}

interface TradeResult {
 pnlPct: number;
 pnlDollar: number;
 side: "win" | "loss" | "breakeven";
 hour: number; // 9–15
 dayOfWeek: number; // 0=Mon
 streak: number; // streak index
}

interface Milestone {
 label: string;
 date: string;
 achieved: boolean;
 icon: string;
}

// ── Synthetic data generation (seed = 8888) ───────────────────────────────────

function generateAllData() {
 const rng = mulberry32(8888);

 // Monthly returns: 3 years × 12 months
 const monthlyReturns: MonthlyReturn[] = [];
 const currentYear = 2026;
 for (let y = 0; y < 3; y++) {
 for (let m = 0; m < 12; m++) {
 const r = (rng() - 0.42) * 14; // skewed slightly positive
 monthlyReturns.push({ year: currentYear - 2 + y, month: m, returnPct: r });
 }
 }

 // Equity curve (portfolio) – 252 trading days
 const portfolioValues: number[] = [100];
 for (let i = 1; i < 252; i++) {
 const drift = 0.0004;
 const vol = 0.012;
 const ret = drift + vol * (rng() * 2 - 1);
 portfolioValues.push(portfolioValues[i - 1] * (1 + ret));
 }

 // Benchmark series
 const benchmarkConfigs = [
 { label: "S&P 500", color: "#3b82f6", drift: 0.00035, vol: 0.010 },
 { label: "Nasdaq 100", color: "#8b5cf6", drift: 0.00045, vol: 0.013 },
 { label: "Dow Jones", color: "#10b981", drift: 0.00028, vol: 0.008 },
 { label: "Gold", color: "#f59e0b", drift: 0.00015, vol: 0.006 },
 { label: "60/40 Portfolio",color: "#6b7280", drift: 0.00022, vol: 0.006 },
 ];

 const benchmarkSeries: BenchmarkSeries[] = benchmarkConfigs.map((cfg) => {
 const vals = [100];
 for (let i = 1; i < 252; i++) {
 const ret = cfg.drift + cfg.vol * (rng() * 2 - 1);
 vals.push(vals[i - 1] * (1 + ret));
 }
 return { label: cfg.label, color: cfg.color, values: vals };
 });

 // Trade results (120 trades)
 const trades: TradeResult[] = [];
 let streak = 0;
 for (let i = 0; i < 120; i++) {
 const r = rng();
 const pnlPct = (rng() - 0.38) * 18;
 const side: "win" | "loss" | "breakeven" =
 pnlPct > 0.5 ? "win" : pnlPct < -0.5 ? "loss" : "breakeven";
 if (i === 0) {
 streak = side === "win" ? 1 : side === "loss" ? -1 : 0;
 } else {
 const prev = trades[i - 1];
 if (side === "win") streak = prev.streak > 0 ? prev.streak + 1 : 1;
 else if (side === "loss") streak = prev.streak < 0 ? prev.streak - 1 : -1;
 else streak = 0;
 }
 trades.push({
 pnlPct,
 pnlDollar: pnlPct * 100,
 side,
 hour: 9 + Math.floor(r * 7),
 dayOfWeek: Math.floor(rng() * 5),
 streak,
 });
 }

 return { monthlyReturns, portfolioValues, benchmarkSeries, trades };
}

// ── Derived statistics ─────────────────────────────────────────────────────────

function computeStats(portfolioValues: number[], trades: TradeResult[]) {
 const finalValue = portfolioValues[portfolioValues.length - 1];
 const totalReturn = (finalValue - 100) / 100;

 // Drawdown
 let peak = 100;
 let maxDD = 0;
 for (const v of portfolioValues) {
 if (v > peak) peak = v;
 const dd = (peak - v) / peak;
 if (dd > maxDD) maxDD = dd;
 }

 // Daily returns for vol/Sharpe
 const dailyReturns: number[] = [];
 for (let i = 1; i < portfolioValues.length; i++) {
 dailyReturns.push((portfolioValues[i] - portfolioValues[i - 1]) / portfolioValues[i - 1]);
 }
 const meanRet = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
 const variance =
 dailyReturns.reduce((a, b) => a + (b - meanRet) ** 2, 0) / dailyReturns.length;
 const vol = Math.sqrt(variance * 252);
 const annRet = meanRet * 252;
 const sharpe = annRet / vol;
 const cagr = (finalValue / 100) ** (1 / (252 / 252)) - 1; // ~1 year

 const wins = trades.filter((t) => t.side === "win").length;
 const losses = trades.filter((t) => t.side === "loss").length;
 const breakevens = trades.filter((t) => t.side === "breakeven").length;
 const winRate = wins / trades.length;

 const totalTrades = trades.length;
 const avgHold = 2.4; // days (synthetic)

 return {
 totalReturn: totalReturn * 100,
 cagr: annRet * 100,
 vol: vol * 100,
 sharpe,
 maxDD: maxDD * 100,
 winRate: winRate * 100,
 avgHold,
 totalTrades,
 wins,
 losses,
 breakevens,
 };
}

// ── Color helpers ─────────────────────────────────────────────────────────────

function returnColor(val: number): string {
 if (val > 5) return "#16a34a";
 if (val > 2) return "#4ade80";
 if (val > 0) return "#86efac";
 if (val > -2) return "#fca5a5";
 if (val > -5) return "#ef4444";
 return "#b91c1c";
}

function returnBg(val: number): string {
 if (val > 5) return "bg-green-700/80";
 if (val > 2) return "bg-green-600/60";
 if (val > 0) return "bg-green-500/40";
 if (val > -2) return "bg-red-400/40";
 if (val > -5) return "bg-red-600/60";
 return "bg-red-700/80";
}

// ── SVG helpers ───────────────────────────────────────────────────────────────

function pathD(points: [number, number][]): string {
 return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
}

function normalize(values: number[], width: number, height: number, pad = 8): [number, number][] {
 const min = Math.min(...values);
 const max = Math.max(...values);
 const range = max - min || 1;
 return values.map((v, i) => [
 pad + (i / (values.length - 1)) * (width - pad * 2),
 height - pad - ((v - min) / range) * (height - pad * 2),
 ]);
}

// ── Sparkline component ───────────────────────────────────────────────────────

function Sparkline({
 values,
 width = 120,
 height = 40,
 color = "#3b82f6",
}: {
 values: number[];
 width?: number;
 height?: number;
 color?: string;
}) {
 const pts = normalize(values, width, height, 2);
 return (
 <svg width={width} height={height} className="overflow-visible">
 <path d={pathD(pts)} fill="none" stroke={color} strokeWidth={1.5} />
 </svg>
 );
}

// ── Monthly returns heatmap ───────────────────────────────────────────────────

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function MonthlyHeatmap({ data }: { data: MonthlyReturn[] }) {
 const years = [...new Set(data.map((d) => d.year))].sort();
 const cellW = 44;
 const cellH = 28;
 const labelW = 40;
 const headerH = 22;
 const svgW = labelW + cellW * 12 + 4;
 const svgH = headerH + cellH * years.length + 4;

 return (
 <svg width={svgW} height={svgH} className="overflow-visible">
 {/* Month headers */}
 {MONTH_LABELS.map((m, mi) => (
 <text
 key={m}
 x={labelW + mi * cellW + cellW / 2}
 y={14}
 textAnchor="middle"
 className="fill-muted-foreground"
 style={{ fontSize: 9 }}
 >
 {m}
 </text>
 ))}
 {years.map((yr, yi) => (
 <g key={yr}>
 {/* Year label */}
 <text
 x={labelW - 6}
 y={headerH + yi * cellH + cellH / 2 + 4}
 textAnchor="end"
 className="fill-muted-foreground"
 style={{ fontSize: 10 }}
 >
 {yr}
 </text>
 {MONTH_LABELS.map((_m, mi) => {
 const entry = data.find((d) => d.year === yr && d.month === mi);
 const val = entry?.returnPct ?? 0;
 const bg = returnColor(val);
 return (
 <g key={mi}>
 <rect
 x={labelW + mi * cellW + 1}
 y={headerH + yi * cellH + 1}
 width={cellW - 2}
 height={cellH - 2}
 rx={3}
 fill={bg}
 opacity={0.85}
 />
 <text
 x={labelW + mi * cellW + cellW / 2}
 y={headerH + yi * cellH + cellH / 2 + 4}
 textAnchor="middle"
 fill="white"
 style={{ fontSize: 9, fontWeight: 600 }}
 >
 {val > 0 ? "+" : ""}{val.toFixed(1)}%
 </text>
 </g>
 );
 })}
 </g>
 ))}
 </svg>
 );
}

// ── Multi-line benchmark chart ────────────────────────────────────────────────

function BenchmarkChart({
 portfolio,
 benchmarks,
}: {
 portfolio: number[];
 benchmarks: BenchmarkSeries[];
}) {
 const W = 600;
 const H = 250;
 const PAD = { top: 16, right: 16, bottom: 24, left: 44 };
 const innerW = W - PAD.left - PAD.right;
 const innerH = H - PAD.top - PAD.bottom;

 // Sample every 2nd point for performance
 const step = 2;
 const sampled = (vals: number[]) =>
 vals.filter((_, i) => i % step === 0);

 const allSeries = [
 { label: "Portfolio", color: "#f97316", values: portfolio },
 ...benchmarks,
 ];

 const allVals = allSeries.flatMap((s) => sampled(s.values));
 const minV = Math.min(...allVals);
 const maxV = Math.max(...allVals);
 const range = maxV - minV || 1;

 function toXY(vals: number[]): [number, number][] {
 const sv = sampled(vals);
 return sv.map((v, i) => [
 PAD.left + (i / (sv.length - 1)) * innerW,
 PAD.top + (1 - (v - minV) / range) * innerH,
 ]);
 }

 // Y-axis labels
 const yTicks = [minV, (minV + maxV) / 2, maxV];

 // X-axis labels (months)
 const xTicks = Array.from({ length: 13 }, (_, i) => ({
 x: PAD.left + (i / 12) * innerW,
 label: MONTH_LABELS[i % 12] ?? "Jan",
 }));

 return (
 <svg width={W} height={H} className="w-full overflow-visible" viewBox={`0 0 ${W} ${H}`}>
 {/* Grid lines */}
 {yTicks.map((tick, i) => {
 const y = PAD.top + (1 - (tick - minV) / range) * innerH;
 return (
 <g key={i}>
 <line
 x1={PAD.left}
 x2={W - PAD.right}
 y1={y}
 y2={y}
 stroke="currentColor"
 strokeOpacity={0.08}
 strokeWidth={1}
 />
 <text
 x={PAD.left - 4}
 y={y + 4}
 textAnchor="end"
 fill="currentColor"
 fillOpacity={0.5}
 style={{ fontSize: 9 }}
 >
 {tick.toFixed(0)}
 </text>
 </g>
 );
 })}
 {/* X labels */}
 {xTicks.map((t, i) => (
 <text
 key={i}
 x={t.x}
 y={H - 4}
 textAnchor="middle"
 fill="currentColor"
 fillOpacity={0.4}
 style={{ fontSize: 9 }}
 >
 {t.label}
 </text>
 ))}
 {/* Series lines */}
 {allSeries.map((s, si) => (
 <path
 key={si}
 d={pathD(toXY(s.values))}
 fill="none"
 stroke={s.color}
 strokeWidth={si === 0 ? 2.5 : 1.5}
 strokeOpacity={si === 0 ? 1 : 0.75}
 />
 ))}
 </svg>
 );
}

// ── Alpha bars chart ──────────────────────────────────────────────────────────

function AlphaBars({ portfolio, benchmark }: { portfolio: number[]; benchmark: number[] }) {
 const rng = mulberry32(9999);
 const months = 12;
 const alphas = Array.from({ length: months }, () => (rng() - 0.45) * 8);
 const W = 400;
 const H = 120;
 const barW = (W - 40) / months;

 return (
 <svg width={W} height={H} className="w-full overflow-visible" viewBox={`0 0 ${W} ${H}`}>
 <line x1={20} x2={W - 20} y1={H / 2} y2={H / 2} stroke="currentColor" strokeOpacity={0.2} />
 {alphas.map((a, i) => {
 const barH = Math.abs(a) * 4;
 const isPos = a >= 0;
 return (
 <g key={i}>
 <rect
 x={20 + i * barW + 2}
 y={isPos ? H / 2 - barH : H / 2}
 width={barW - 4}
 height={barH}
 rx={2}
 fill={isPos ? "#22c55e" : "#ef4444"}
 opacity={0.8}
 />
 <text
 x={20 + i * barW + barW / 2}
 y={H - 4}
 textAnchor="middle"
 fill="currentColor"
 fillOpacity={0.4}
 style={{ fontSize: 8 }}
 >
 {MONTH_LABELS[i]}
 </text>
 </g>
 );
 })}
 </svg>
 );
}

// ── Donut chart (win/loss/BE) ─────────────────────────────────────────────────

function DonutChart({
 wins,
 losses,
 breakevens,
}: {
 wins: number;
 losses: number;
 breakevens: number;
}) {
 const total = wins + losses + breakevens;
 const R = 70;
 const r = 42;
 const cx = 90;
 const cy = 90;

 function slice(start: number, end: number, color: string, label: string, pct: number) {
 const a1 = ((start / total) * 360 - 90) * (Math.PI / 180);
 const a2 = ((end / total) * 360 - 90) * (Math.PI / 180);
 const x1 = cx + R * Math.cos(a1);
 const y1 = cy + R * Math.sin(a1);
 const x2 = cx + R * Math.cos(a2);
 const y2 = cy + R * Math.sin(a2);
 const xi1 = cx + r * Math.cos(a1);
 const yi1 = cy + r * Math.sin(a1);
 const xi2 = cx + r * Math.cos(a2);
 const yi2 = cy + r * Math.sin(a2);
 const large = end - start > total / 2 ? 1 : 0;
 const mid = (a1 + a2) / 2;
 const lx = cx + (R + 14) * Math.cos(mid);
 const ly = cy + (R + 14) * Math.sin(mid);
 return (
 <g key={label}>
 <path
 d={`M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${r} ${r} 0 ${large} 0 ${xi1} ${yi1} Z`}
 fill={color}
 opacity={0.85}
 />
 {pct > 8 && (
 <text
 x={lx}
 y={ly + 4}
 textAnchor="middle"
 fill="currentColor"
 fillOpacity={0.7}
 style={{ fontSize: 9 }}
 >
 {pct.toFixed(0)}%
 </text>
 )}
 </g>
 );
 }

 return (
 <svg width={180} height={180}>
 {slice(0, wins, "#22c55e", "Wins", (wins / total) * 100)}
 {slice(wins, wins + losses, "#ef4444", "Losses", (losses / total) * 100)}
 {slice(wins + losses, total, "#6b7280", "BE", (breakevens / total) * 100)}
 <text x={cx} y={cy - 6} textAnchor="middle" fill="currentColor" style={{ fontSize: 18, fontWeight: 700 }}>
 {((wins / total) * 100).toFixed(0)}%
 </text>
 <text x={cx} y={cy + 12} textAnchor="middle" fill="currentColor" fillOpacity={0.5} style={{ fontSize: 10 }}>
 win rate
 </text>
 </svg>
 );
}

// ── P&L histogram ─────────────────────────────────────────────────────────────

function PnLHistogram({ trades }: { trades: TradeResult[] }) {
 const buckets = 20;
 const vals = trades.map((t) => t.pnlPct);
 const min = Math.min(...vals);
 const max = Math.max(...vals);
 const step = (max - min) / buckets;
 const counts = Array.from({ length: buckets }, (_, i) => {
 const lo = min + i * step;
 const hi = lo + step;
 return vals.filter((v) => v >= lo && (i === buckets - 1 ? v <= hi : v < hi)).length;
 });
 const maxCount = Math.max(...counts);

 const W = 380;
 const H = 140;
 const barW = (W - 40) / buckets;

 // Normal curve overlay
 const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
 const std = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length);
 const normPts: [number, number][] = Array.from({ length: 100 }, (_, i) => {
 const x = min + (i / 99) * (max - min);
 const y = (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mean) / std) ** 2);
 return [x, y];
 });
 const maxNorm = Math.max(...normPts.map((p) => p[1]));

 function toSVGX(x: number) {
 return 20 + ((x - min) / (max - min)) * (W - 40);
 }
 function toSVGY(y: number) {
 return H - 20 - (y / maxNorm) * (H - 35);
 }

 return (
 <svg width={W} height={H} className="w-full overflow-visible" viewBox={`0 0 ${W} ${H}`}>
 {counts.map((c, i) => {
 const x = min + i * step;
 const isPos = x + step / 2 >= 0;
 return (
 <rect
 key={i}
 x={toSVGX(x) + 1}
 y={H - 20 - (c / maxCount) * (H - 35)}
 width={barW - 2}
 height={(c / maxCount) * (H - 35)}
 rx={1}
 fill={isPos ? "#22c55e" : "#ef4444"}
 opacity={0.6}
 />
 );
 })}
 {/* Bell curve */}
 <path
 d={normPts.map((p, i) => `${i === 0 ? "M" : "L"} ${toSVGX(p[0])} ${toSVGY(p[1])}`).join(" ")}
 fill="none"
 stroke="#f97316"
 strokeWidth={1.5}
 opacity={0.8}
 />
 {/* Zero line */}
 <line
 x1={toSVGX(0)}
 x2={toSVGX(0)}
 y1={H - 20}
 y2={10}
 stroke="currentColor"
 strokeOpacity={0.3}
 strokeDasharray="3 3"
 />
 </svg>
 );
}

// ── Lollipop streak chart ─────────────────────────────────────────────────────

function StreakChart({ trades }: { trades: TradeResult[] }) {
 const W = 380;
 const H = 120;
 const padX = 20;
 const midY = H / 2;
 const vals = trades.map((t) => t.streak);
 const maxAbs = Math.max(...vals.map(Math.abs), 1);

 const step = (W - padX * 2) / trades.length;

 return (
 <svg width={W} height={H} className="w-full overflow-visible" viewBox={`0 0 ${W} ${H}`}>
 <line x1={padX} x2={W - padX} y1={midY} y2={midY} stroke="currentColor" strokeOpacity={0.2} />
 {trades.map((t, i) => {
 const x = padX + i * step + step / 2;
 const barH = (Math.abs(t.streak) / maxAbs) * (midY - 10);
 const isPos = t.streak >= 0;
 const y1 = midY;
 const y2 = isPos ? midY - barH : midY + barH;
 return (
 <g key={i}>
 <line
 x1={x}
 x2={x}
 y1={y1}
 y2={y2}
 stroke={isPos ? "#22c55e" : "#ef4444"}
 strokeWidth={1.5}
 opacity={0.7}
 />
 <circle cx={x} cy={y2} r={2} fill={isPos ? "#22c55e" : "#ef4444"} opacity={0.9} />
 </g>
 );
 })}
 </svg>
 );
}

// ── Time-of-day heatmap ───────────────────────────────────────────────────────

const HOURS = [9, 10, 11, 12, 13, 14, 15];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

function TimeHeatmap({ trades }: { trades: TradeResult[] }) {
 // Build grid: [day][hour] => avg pnl
 const grid: Record<string, number[]> = {};
 for (const t of trades) {
 const key = `${t.dayOfWeek}-${t.hour}`;
 if (!grid[key]) grid[key] = [];
 grid[key].push(t.pnlPct);
 }
 function avg(key: string) {
 const arr = grid[key] ?? [];
 if (!arr.length) return 0;
 return arr.reduce((a, b) => a + b, 0) / arr.length;
 }

 const cellW = 52;
 const cellH = 28;
 const labelW = 34;
 const headerH = 20;
 const svgW = labelW + cellW * HOURS.length + 4;
 const svgH = headerH + cellH * DAYS.length + 4;

 return (
 <svg width={svgW} height={svgH} className="overflow-visible">
 {HOURS.map((h, hi) => (
 <text
 key={h}
 x={labelW + hi * cellW + cellW / 2}
 y={14}
 textAnchor="middle"
 className="fill-muted-foreground"
 style={{ fontSize: 9 }}
 >
 {h}:00
 </text>
 ))}
 {DAYS.map((day, di) => (
 <g key={day}>
 <text
 x={labelW - 4}
 y={headerH + di * cellH + cellH / 2 + 4}
 textAnchor="end"
 className="fill-muted-foreground"
 style={{ fontSize: 10 }}
 >
 {day}
 </text>
 {HOURS.map((h, hi) => {
 const val = avg(`${di}-${h}`);
 const bg = returnColor(val);
 return (
 <g key={hi}>
 <rect
 x={labelW + hi * cellW + 1}
 y={headerH + di * cellH + 1}
 width={cellW - 2}
 height={cellH - 2}
 rx={3}
 fill={bg}
 opacity={0.75}
 />
 <text
 x={labelW + hi * cellW + cellW / 2}
 y={headerH + di * cellH + cellH / 2 + 4}
 textAnchor="middle"
 fill="white"
 style={{ fontSize: 8, fontWeight: 600 }}
 >
 {val !== 0 ? (val > 0 ? "+" : "") + val.toFixed(1) : "—"}
 </text>
 </g>
 );
 })}
 </g>
 ))}
 </svg>
 );
}

// ── Circular gauge ────────────────────────────────────────────────────────────

function CircularGauge({
 value,
 target,
 label,
}: {
 value: number;
 target: number;
 label: string;
}) {
 const pct = Math.min(value / target, 1.2);
 const R = 72;
 const cx = 90;
 const cy = 90;
 const startAngle = -220;
 const sweepAngle = 260;
 const endAngleDeg = startAngle + sweepAngle * Math.min(pct, 1);

 function toXY(angleDeg: number, r: number) {
 const rad = angleDeg * (Math.PI / 180);
 return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
 }

 const [bx1, by1] = toXY(startAngle, R);
 const [bx2, by2] = toXY(startAngle + sweepAngle, R);
 const [fx1, fy1] = toXY(startAngle, R);
 const [fx2, fy2] = toXY(endAngleDeg, R);

 const trackD = `M ${bx1} ${by1} A ${R} ${R} 0 1 1 ${bx2} ${by2}`;
 const fillD = pct <= 0.5
 ? `M ${fx1} ${fy1} A ${R} ${R} 0 0 1 ${fx2} ${fy2}`
 : `M ${fx1} ${fy1} A ${R} ${R} 0 1 1 ${fx2} ${fy2}`;

 const color = pct >= 1 ? "#22c55e" : pct >= 0.6 ? "#f59e0b" : "#ef4444";

 return (
 <svg width={180} height={180}>
 <path d={trackD} fill="none" stroke="currentColor" strokeOpacity={0.1} strokeWidth={10} strokeLinecap="round" />
 <path d={fillD} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" />
 <text x={cx} y={cy - 6} textAnchor="middle" fill="currentColor" style={{ fontSize: 26, fontWeight: 700 }}>
 {(pct * 100).toFixed(0)}%
 </text>
 <text x={cx} y={cy + 12} textAnchor="middle" fill="currentColor" fillOpacity={0.5} style={{ fontSize: 10 }}>
 {label}
 </text>
 <text x={cx} y={cy + 28} textAnchor="middle" fill={color} style={{ fontSize: 11, fontWeight: 600 }}>
 {value.toFixed(1)}% / {target}%
 </text>
 </svg>
 );
}

// ── Milestone timeline ────────────────────────────────────────────────────────

function MilestoneTimeline({ milestones }: { milestones: Milestone[] }) {
 const W = 560;
 const H = 80;
 const padX = 30;
 const midY = 36;
 const step = (W - padX * 2) / (milestones.length - 1);

 return (
 <svg width={W} height={H} className="w-full overflow-visible" viewBox={`0 0 ${W} ${H}`}>
 <line x1={padX} x2={W - padX} y1={midY} y2={midY} stroke="currentColor" strokeOpacity={0.2} strokeWidth={2} />
 {milestones.map((m, i) => {
 const x = padX + i * step;
 const color = m.achieved ? "#22c55e" : "#6b7280";
 return (
 <g key={i}>
 <circle cx={x} cy={midY} r={10} fill={m.achieved ? "#22c55e22" : "#6b728022"} stroke={color} strokeWidth={1.5} />
 <text x={x} y={midY + 4} textAnchor="middle" style={{ fontSize: 10 }}>
 {m.icon}
 </text>
 <text
 x={x}
 y={midY + 22}
 textAnchor="middle"
 fill="currentColor"
 fillOpacity={m.achieved ? 0.8 : 0.4}
 style={{ fontSize: 8 }}
 >
 {m.label}
 </text>
 <text
 x={x}
 y={H - 2}
 textAnchor="middle"
 fill="currentColor"
 fillOpacity={0.35}
 style={{ fontSize: 7 }}
 >
 {m.date}
 </text>
 </g>
 );
 })}
 </svg>
 );
}

// ── Fan chart (projections) ───────────────────────────────────────────────────

function FanChart({ startValue }: { startValue: number }) {
 const W = 420;
 const H = 160;
 const PAD = { top: 12, right: 20, bottom: 24, left: 44 };
 const innerW = W - PAD.left - PAD.right;
 const innerH = H - PAD.top - PAD.bottom;
 const months = 12;

 const scenarios = {
 bear: Array.from({ length: months + 1 }, (_, i) => startValue * (1 - 0.08 * (i / months))),
 base: Array.from({ length: months + 1 }, (_, i) => startValue * (1 + 0.18 * (i / months))),
 bull: Array.from({ length: months + 1 }, (_, i) => startValue * (1 + 0.38 * (i / months))),
 };

 const allVals = [...scenarios.bear, ...scenarios.base, ...scenarios.bull];
 const minV = Math.min(...allVals);
 const maxV = Math.max(...allVals);
 const range = maxV - minV || 1;

 function toXY(vals: number[]): [number, number][] {
 return vals.map((v, i) => [
 PAD.left + (i / months) * innerW,
 PAD.top + (1 - (v - minV) / range) * innerH,
 ]);
 }

 const bearPts = toXY(scenarios.bear);
 const basePts = toXY(scenarios.base);
 const bullPts = toXY(scenarios.bull);

 const fanPath = [
 ...bullPts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`),
 ...bearPts.slice().reverse().map((p) => `L ${p[0]} ${p[1]}`),
 "Z",
 ].join(" ");

 const yTicks = [minV, (minV + maxV) / 2, maxV];

 return (
 <svg width={W} height={H} className="w-full overflow-visible" viewBox={`0 0 ${W} ${H}`}>
 {/* Grid */}
 {yTicks.map((tick, i) => {
 const y = PAD.top + (1 - (tick - minV) / range) * innerH;
 return (
 <g key={i}>
 <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="currentColor" strokeOpacity={0.08} />
 <text x={PAD.left - 4} y={y + 4} textAnchor="end" fill="currentColor" fillOpacity={0.4} style={{ fontSize: 9 }}>
 ${tick.toFixed(0)}
 </text>
 </g>
 );
 })}
 {/* Fan fill */}
 <path d={fanPath} fill="#3b82f6" opacity={0.08} />
 {/* Lines */}
 <path d={pathD(bearPts)} fill="none" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 3" />
 <path d={pathD(basePts)} fill="none" stroke="#3b82f6" strokeWidth={2} />
 <path d={pathD(bullPts)} fill="none" stroke="#22c55e" strokeWidth={1.5} strokeDasharray="4 3" />
 {/* Labels */}
 {[
 { pts: bearPts, label: "Bear", color: "#ef4444" },
 { pts: basePts, label: "Base", color: "#3b82f6" },
 { pts: bullPts, label: "Bull", color: "#22c55e" },
 ].map(({ pts, label, color }) => {
 const last = pts[pts.length - 1];
 return (
 <text key={label} x={last[0] + 4} y={last[1] + 4} fill={color} style={{ fontSize: 9, fontWeight: 600 }}>
 {label}
 </text>
 );
 })}
 {/* X axis */}
 {Array.from({ length: 13 }, (_, i) => (
 <text key={i} x={PAD.left + (i / 12) * innerW} y={H - 4} textAnchor="middle" fill="currentColor" fillOpacity={0.4} style={{ fontSize: 8 }}>
 {MONTH_LABELS[i % 12]}
 </text>
 ))}
 </svg>
 );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
 label,
 value,
 sub,
 positive,
}: {
 label: string;
 value: string;
 sub?: string;
 positive?: boolean;
}) {
 return (
 <Card className="p-3 space-y-0.5">
 <p className="text-xs text-muted-foreground">{label}</p>
 <p
 className={cn(
 "text-xl font-bold tabular-nums",
 positive === true && "text-green-500",
 positive === false && "text-red-400",
 )}
 >
 {value}
 </p>
 {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
 </Card>
 );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PerformancePage() {
 const [targetReturn, setTargetReturn] = useState(20);

 const { monthlyReturns, portfolioValues, benchmarkSeries, trades } = useMemo(
 () => generateAllData(),
 [],
 );

 const stats = useMemo(
 () => computeStats(portfolioValues, trades),
 [portfolioValues, trades],
 );

 const milestones: Milestone[] = [
 { label: "First Trade", date: "Jan '26", achieved: true, icon: "" },
 { label: "$100 Gain", date: "Jan '26", achieved: true, icon: "" },
 { label: "Win Streak 3",date: "Feb '26", achieved: true, icon: "" },
 { label: "Winning Week", date: "Feb '26", achieved: true, icon: "" },
 { label: "10% Return", date: "Mar '26", achieved: true, icon: "" },
 { label: "$1K Gain", date: "Apr '26", achieved: false, icon: "" },
 { label: "25% Return", date: "Jun '26", achieved: false, icon: "" },
 { label: "Sharpe > 2", date: "Dec '26", achieved: false, icon: "" },
 ];

 // Benchmark stats table
 const benchmarkStats = benchmarkSeries.map((b) => {
 const finalVal = b.values[b.values.length - 1];
 const ret = ((finalVal - 100) / 100) * 100;
 const dailyRets = b.values.slice(1).map((v, i) => (v - b.values[i]) / b.values[i]);
 const mean = dailyRets.reduce((a, c) => a + c, 0) / dailyRets.length;
 const variance = dailyRets.reduce((a, c) => a + (c - mean) ** 2, 0) / dailyRets.length;
 const vol = Math.sqrt(variance * 252) * 100;
 const sharpe = (mean * 252) / Math.sqrt(variance * 252);
 let peak = 100, maxDD = 0;
 for (const v of b.values) {
 if (v > peak) peak = v;
 const dd = (peak - v) / peak;
 if (dd > maxDD) maxDD = dd;
 }
 const beta = 0.7 + Math.random() * 0.6;
 return { label: b.label, color: b.color, ret, vol, sharpe, maxDD: maxDD * 100, beta };
 });

 const portfolioFinalVal = portfolioValues[portfolioValues.length - 1];

 // Sample sparkline (last 60 points)
 const sparklineVals = portfolioValues.filter((_, i) => i % 4 === 0);

 const pace = stats.totalReturn; // simplified: YTD return as pace estimate
 const willHitTarget = pace >= targetReturn;

 return (
 <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4">
 {/* Page header */}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <TrendingUp className="h-3.5 w-3.5 text-muted-foreground/50" />
 <h1 className="text-lg font-semibold">Performance</h1>
 <Badge variant="outline" className="text-xs text-muted-foreground">YTD 2026</Badge>
 </div>
 <div className="flex items-center gap-2">
 <Button variant="outline" size="sm" className="text-xs text-muted-foreground h-7">
 <Calendar className="h-3 w-3 mr-1" />
 Export
 </Button>
 </div>
 </div>

 <Tabs defaultValue="overview" className="flex-1">
 <TabsList className="mb-4">
 <TabsTrigger value="overview">Overview</TabsTrigger>
 <TabsTrigger value="benchmarks">vs Benchmarks</TabsTrigger>
 <TabsTrigger value="analytics">Trade Analytics</TabsTrigger>
 <TabsTrigger value="goals">Goals</TabsTrigger>
 </TabsList>

 {/* ── TAB 1: OVERVIEW ───────────────────────────────────────────────── */}
 <TabsContent value="overview" className="space-y-4 data-[state=inactive]:hidden">
 {/* Hero */}
 <Card className="p-6 border-l-4 border-l-primary">
 <div className="flex items-start justify-between gap-4">
 <div>
 <p className="text-lg text-muted-foreground mb-1">Total Return</p>
 <div className="flex items-end gap-3">
 <span
 className={cn(
 "text-2xl font-bold tabular-nums",
 stats.totalReturn >= 0 ? "text-green-500" : "text-red-400",
 )}
 >
 {stats.totalReturn >= 0 ? "+" : ""}
 {stats.totalReturn.toFixed(2)}%
 </span>
 <div className="flex items-center gap-1 mb-2">
 {stats.totalReturn >= 0 ? (
 <TrendingUp className="h-4 w-4 text-green-500" />
 ) : (
 <TrendingDown className="h-4 w-4 text-red-400" />
 )}
 <span className="text-sm text-muted-foreground">
 ${((portfolioFinalVal - 100) * 100).toFixed(0)} P&L
 </span>
 </div>
 </div>
 <p className="text-sm text-muted-foreground mt-1">
 Portfolio value: <span className="font-semibold text-foreground">${(portfolioFinalVal * 100).toFixed(0)}</span>
 </p>
 </div>
 <div className="flex-shrink-0">
 <Sparkline
 values={sparklineVals}
 width={160}
 height={60}
 color={stats.totalReturn >= 0 ? "#22c55e" : "#ef4444"}
 />
 </div>
 </div>

 {/* You vs Market */}
 <div className="mt-4 pt-4 border-t border-border">
 <p className="text-xs text-muted-foreground mb-2 font-medium">You vs Market</p>
 <div className="flex flex-wrap gap-2">
 {[
 { label: "You", val: stats.totalReturn, color: "text-orange-400" },
 { label: "S&P 500", val: (benchmarkSeries[0].values[benchmarkSeries[0].values.length - 1] - 100), color: "text-primary" },
 { label: "Nasdaq", val: (benchmarkSeries[1].values[benchmarkSeries[1].values.length - 1] - 100), color: "text-primary" },
 { label: `Goal (${targetReturn}%)`, val: targetReturn, color: "text-yellow-400" },
 ].map((item) => (
 <div key={item.label} className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm">
 <span className="text-muted-foreground">{item.label}</span>
 <span className={cn("font-medium tabular-nums", item.color)}>
 {item.val >= 0 ? "+" : ""}{item.val.toFixed(1)}%
 </span>
 </div>
 ))}
 </div>
 </div>
 </Card>

 {/* Stats grid */}
 <div className="grid grid-cols-4 gap-3">
 <StatCard label="Total Return" value={`${stats.totalReturn.toFixed(2)}%`} positive={stats.totalReturn >= 0} />
 <StatCard label="CAGR" value={`${stats.cagr.toFixed(2)}%`} positive={stats.cagr >= 0} />
 <StatCard label="Volatility" value={`${stats.vol.toFixed(2)}%`} sub="annualized" />
 <StatCard label="Sharpe Ratio" value={stats.sharpe.toFixed(2)} positive={stats.sharpe >= 1} />
 <StatCard label="Max Drawdown" value={`-${stats.maxDD.toFixed(2)}%`} positive={false} />
 <StatCard label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} positive={stats.winRate >= 50} />
 <StatCard label="Avg Hold" value={`${stats.avgHold.toFixed(1)}d`} sub="per trade" />
 <StatCard label="Total Trades" value={String(stats.totalTrades)} sub="executed" />
 </div>

 {/* Monthly heatmap */}
 <Card className="p-4">
 <div className="flex items-center gap-2 mb-3">
 <Calendar className="h-4 w-4 text-muted-foreground" />
 <h3 className="text-sm font-medium">Monthly Returns Heatmap</h3>
 <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
 <span className="inline-block w-3 h-3 rounded bg-green-600 opacity-80" /> Positive
 <span className="inline-block w-3 h-3 rounded bg-red-600 opacity-80 ml-2" /> Negative
 </div>
 </div>
 <div className="overflow-x-auto">
 <MonthlyHeatmap data={monthlyReturns} />
 </div>
 </Card>
 </TabsContent>

 {/* ── TAB 2: VS BENCHMARKS ──────────────────────────────────────────── */}
 <TabsContent value="benchmarks" className="space-y-4 data-[state=inactive]:hidden">
 {/* Chart */}
 <Card className="p-4">
 <div className="flex items-center gap-2 mb-3">
 <BarChart3 className="h-4 w-4 text-muted-foreground" />
 <h3 className="text-sm font-medium">Portfolio vs Benchmarks (Normalized to 100)</h3>
 </div>
 {/* Legend */}
 <div className="flex flex-wrap gap-3 mb-3">
 {[
 { label: "Portfolio", color: "#f97316" },
 ...benchmarkSeries.map((b) => ({ label: b.label, color: b.color })),
 ].map((item) => (
 <div key={item.label} className="flex items-center gap-1 text-xs text-muted-foreground">
 <span className="inline-block w-4 h-0.5 rounded" style={{ backgroundColor: item.color }} />
 {item.label}
 </div>
 ))}
 </div>
 <div className="overflow-x-auto">
 <BenchmarkChart portfolio={portfolioValues} benchmarks={benchmarkSeries} />
 </div>
 </Card>

 {/* Stats table */}
 <Card className="p-4">
 <h3 className="text-sm font-medium mb-3">Comparison Table</h3>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left pb-2 text-muted-foreground font-medium">Metric</th>
 <th className="text-right pb-2 font-semibold text-orange-400">Portfolio</th>
 {benchmarkStats.map((b) => (
 <th key={b.label} className="text-right pb-2 text-muted-foreground font-medium" style={{ color: b.color }}>
 {b.label}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {[
 {
 metric: "Return",
 portfolio: `${stats.totalReturn.toFixed(2)}%`,
 fn: (b: typeof benchmarkStats[0]) => `${b.ret.toFixed(2)}%`,
 better: (bv: number) => stats.totalReturn > bv,
 bv: (b: typeof benchmarkStats[0]) => b.ret,
 },
 {
 metric: "Volatility",
 portfolio: `${stats.vol.toFixed(2)}%`,
 fn: (b: typeof benchmarkStats[0]) => `${b.vol.toFixed(2)}%`,
 better: (bv: number) => stats.vol < bv,
 bv: (b: typeof benchmarkStats[0]) => b.vol,
 },
 {
 metric: "Sharpe",
 portfolio: stats.sharpe.toFixed(2),
 fn: (b: typeof benchmarkStats[0]) => b.sharpe.toFixed(2),
 better: (bv: number) => stats.sharpe > bv,
 bv: (b: typeof benchmarkStats[0]) => b.sharpe,
 },
 {
 metric: "Max DD",
 portfolio: `-${stats.maxDD.toFixed(2)}%`,
 fn: (b: typeof benchmarkStats[0]) => `-${b.maxDD.toFixed(2)}%`,
 better: (bv: number) => stats.maxDD < bv,
 bv: (b: typeof benchmarkStats[0]) => b.maxDD,
 },
 {
 metric: "Beta",
 portfolio: "1.00",
 fn: (b: typeof benchmarkStats[0]) => b.beta.toFixed(2),
 better: (_bv: number) => false,
 bv: (b: typeof benchmarkStats[0]) => b.beta,
 },
 ].map((row) => (
 <tr key={row.metric} className="border-b border-border hover:bg-muted/20">
 <td className="py-2 text-muted-foreground">{row.metric}</td>
 <td className="py-2 text-right font-medium text-orange-400">{row.portfolio}</td>
 {benchmarkStats.map((b) => {
 const isBetter = row.better(row.bv(b));
 return (
 <td
 key={b.label}
 className={cn(
 "py-2 text-right",
 isBetter ? "text-green-500 font-medium" : "text-muted-foreground",
 )}
 >
 {row.fn(b)}
 </td>
 );
 })}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </Card>

 {/* Alpha bars */}
 <Card className="p-4">
 <div className="flex items-center gap-2 mb-3">
 <Activity className="h-4 w-4 text-muted-foreground" />
 <h3 className="text-sm font-medium">Monthly Alpha vs S&P 500</h3>
 </div>
 <div className="overflow-x-auto">
 <AlphaBars portfolio={portfolioValues} benchmark={benchmarkSeries[0].values} />
 </div>
 </Card>

 {/* Best/worst relative months */}
 <div className="grid grid-cols-2 gap-3">
 <Card className="p-4">
 <div className="flex items-center gap-2 mb-2">
 <TrendingUp className="h-4 w-4 text-green-500" />
 <h3 className="text-sm font-medium">Best Relative Month</h3>
 </div>
 <p className="text-lg font-medium text-green-500">+4.8%</p>
 <p className="text-xs text-muted-foreground mt-1">Feb 2026 — outperformed S&P by 4.8%</p>
 </Card>
 <Card className="p-4">
 <div className="flex items-center gap-2 mb-2">
 <TrendingDown className="h-4 w-4 text-red-400" />
 <h3 className="text-sm font-medium">Worst Relative Month</h3>
 </div>
 <p className="text-lg font-medium text-red-400">-3.2%</p>
 <p className="text-xs text-muted-foreground mt-1">Nov 2025 — underperformed S&P by 3.2%</p>
 </Card>
 </div>
 </TabsContent>

 {/* ── TAB 3: TRADE ANALYTICS ────────────────────────────────────────── */}
 <TabsContent value="analytics" className="space-y-4 data-[state=inactive]:hidden">
 <div className="grid grid-cols-2 gap-4">
 {/* Donut */}
 <Card className="p-4">
 <div className="flex items-center gap-2 mb-3">
 <Activity className="h-4 w-4 text-muted-foreground" />
 <h3 className="text-sm font-medium">Win / Loss / Breakeven</h3>
 </div>
 <div className="flex items-center gap-4">
 <DonutChart wins={stats.wins} losses={stats.losses} breakevens={stats.breakevens} />
 <div className="space-y-2 text-sm">
 <div className="flex items-center gap-2">
 <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
 <span className="text-muted-foreground">Wins</span>
 <span className="font-medium ml-auto">{stats.wins}</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
 <span className="text-muted-foreground">Losses</span>
 <span className="font-medium ml-auto">{stats.losses}</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="w-3 h-3 rounded-full bg-muted-foreground inline-block" />
 <span className="text-muted-foreground">Breakeven</span>
 <span className="font-medium ml-auto">{stats.breakevens}</span>
 </div>
 </div>
 </div>
 </Card>

 {/* P&L histogram */}
 <Card className="p-4">
 <div className="flex items-center gap-2 mb-3">
 <BarChart3 className="h-4 w-4 text-muted-foreground" />
 <h3 className="text-sm font-medium">P&L Distribution</h3>
 </div>
 <div className="overflow-x-auto">
 <PnLHistogram trades={trades} />
 </div>
 <p className="text-xs text-muted-foreground mt-1">Orange curve = normal distribution overlay</p>
 </Card>
 </div>

 {/* Streak chart */}
 <Card className="p-4">
 <div className="flex items-center gap-2 mb-3">
 <Flame className="h-4 w-4 text-muted-foreground" />
 <h3 className="text-sm font-medium">Win / Loss Streaks</h3>
 <span className="text-xs text-muted-foreground ml-auto">Each lollipop = streak length</span>
 </div>
 <div className="overflow-x-auto">
 <StreakChart trades={trades} />
 </div>
 </Card>

 {/* Time heatmap */}
 <Card className="p-4">
 <div className="flex items-center gap-2 mb-3">
 <Clock className="h-4 w-4 text-muted-foreground" />
 <h3 className="text-sm font-medium">Performance by Time of Day</h3>
 </div>
 <div className="overflow-x-auto">
 <TimeHeatmap trades={trades} />
 </div>
 </Card>

 {/* Best conditions */}
 <Card className="p-4">
 <div className="flex items-center gap-2 mb-3">
 <Award className="h-3.5 w-3.5 text-muted-foreground/50" />
 <h3 className="text-sm font-medium">Best Trading Conditions</h3>
 </div>
 <div className="grid grid-cols-3 gap-3 text-sm">
 {[
 {
 label: "Best Day of Week",
 value: "Tuesday",
 sub: "+3.2% avg P&L",
 icon: <Calendar className="h-3.5 w-3.5 text-muted-foreground/50" />,
 },
 {
 label: "Best Hour",
 value: "10:00–11:00",
 sub: "+2.8% avg P&L",
 icon: <Clock className="h-4 w-4 text-green-400" />,
 },
 {
 label: "Best Vol Regime",
 value: "Low Vol",
 sub: "VIX 12–18",
 icon: <Activity className="h-3.5 w-3.5 text-muted-foreground/50" />,
 },
 ].map((c) => (
 <div key={c.label} className="rounded-lg bg-muted/30 p-3 space-y-1">
 <div className="flex items-center gap-2">
 {c.icon}
 <span className="text-xs text-muted-foreground">{c.label}</span>
 </div>
 <p className="font-medium">{c.value}</p>
 <p className="text-xs text-muted-foreground">{c.sub}</p>
 </div>
 ))}
 </div>
 </Card>
 </TabsContent>

 {/* ── TAB 4: GOALS ──────────────────────────────────────────────────── */}
 <TabsContent value="goals" className="space-y-4 data-[state=inactive]:hidden">
 {/* Annual target slider */}
 <Card className="p-4">
 <div className="flex items-center gap-2 mb-4">
 <Target className="h-3.5 w-3.5 text-muted-foreground/50" />
 <h3 className="text-sm font-medium">Annual Return Target</h3>
 </div>
 <div className="flex items-center gap-4">
 <div className="flex-1">
 <div className="flex justify-between text-xs text-muted-foreground mb-2">
 <span>5%</span>
 <span className="font-medium text-foreground">{targetReturn}%</span>
 <span>100%</span>
 </div>
 <Slider
 value={[targetReturn]}
 onValueChange={(v) => setTargetReturn(v[0])}
 min={5}
 max={100}
 step={1}
 className="w-full"
 />
 <div className="flex justify-between text-xs text-muted-foreground mt-1">
 <span>Conservative</span>
 <span>Moderate (20%)</span>
 <span>Aggressive</span>
 </div>
 </div>
 </div>
 </Card>

 {/* Gauge + pace */}
 <div className="grid grid-cols-2 gap-4">
 <Card className="p-4 flex flex-col items-center">
 <h3 className="text-sm font-medium mb-2">Progress to Goal</h3>
 <CircularGauge
 value={stats.totalReturn}
 target={targetReturn}
 label="of target"
 />
 </Card>

 <Card className="p-4 flex flex-col justify-between">
 <div>
 <div className="flex items-center gap-2 mb-2">
 <TrendingUp className="h-4 w-4 text-muted-foreground" />
 <h3 className="text-sm font-medium">Pace to Goal</h3>
 </div>
 <div className="space-y-3">
 <div>
 <p className="text-xs text-muted-foreground">Current YTD Return</p>
 <p className={cn("text-lg font-medium", stats.totalReturn >= 0 ? "text-green-500" : "text-red-400")}>
 {stats.totalReturn >= 0 ? "+" : ""}{stats.totalReturn.toFixed(2)}%
 </p>
 </div>
 <div>
 <p className="text-xs text-muted-foreground">Target</p>
 <p className="text-xl font-medium text-foreground">{targetReturn}%</p>
 </div>
 <div className={cn("rounded-lg p-3 text-sm font-medium", willHitTarget ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500")}>
 {willHitTarget
 ? `On track — projected to exceed target by ${(stats.totalReturn - targetReturn).toFixed(1)}%`
 : `Behind pace — need ${(targetReturn - stats.totalReturn).toFixed(1)}% more to reach goal`}
 </div>
 </div>
 </div>
 </Card>
 </div>

 {/* Milestone timeline */}
 <Card className="p-4">
 <div className="flex items-center gap-2 mb-3">
 <Award className="h-3.5 w-3.5 text-muted-foreground/50" />
 <h3 className="text-sm font-medium">Achievement Timeline</h3>
 <Badge variant="outline" className="ml-auto text-xs text-muted-foreground">
 {milestones.filter((m) => m.achieved).length} / {milestones.length} achieved
 </Badge>
 </div>
 <div className="overflow-x-auto">
 <MilestoneTimeline milestones={milestones} />
 </div>
 {/* Grid of milestone badges */}
 <div className="mt-3 flex flex-wrap gap-2">
 {milestones.map((m) => (
 <div
 key={m.label}
 className={cn(
 "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-muted-foreground border",
 m.achieved
 ? "border-green-500/40 bg-green-500/10 text-green-400"
 : "border-border bg-muted/30 text-muted-foreground",
 )}
 >
 <span>{m.icon}</span>
 <span>{m.label}</span>
 {m.achieved && <CheckCircle2 className="h-3 w-3 text-green-500" />}
 </div>
 ))}
 </div>
 </Card>

 {/* Fan chart */}
 <Card className="p-4">
 <div className="flex items-center gap-2 mb-3">
 <BarChart3 className="h-4 w-4 text-muted-foreground" />
 <h3 className="text-sm font-medium">12-Month Projection Scenarios</h3>
 <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
 <span className="text-red-400">— Bear (-8%)</span>
 <span className="text-primary">— Base (+18%)</span>
 <span className="text-green-400">— Bull (+38%)</span>
 </div>
 </div>
 <div className="overflow-x-auto">
 <FanChart startValue={portfolioFinalVal * 100} />
 </div>
 </Card>
 </TabsContent>
 </Tabs>
 </div>
 );
}
