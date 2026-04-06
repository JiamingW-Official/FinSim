"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
 BookOpen,
 TrendingUp,
 PieChart,
 BarChart2,
 Lightbulb,
 ArrowUpDown,
 ArrowUp,
 ArrowDown,
 CheckCircle2,
 XCircle,
 Trophy,
 AlertTriangle,
 Target,
 Clock,
 Percent,
 DollarSign,
} from "lucide-react";

// ─── Seeded PRNG ────────────────────────────────────────────────────────────
let s = 692006;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};

// ─── Types ───────────────────────────────────────────────────────────────────
type StrategyType = "CC" | "CSP" | "IC" | "Calendar" | "Debit Spread";
type TradeOutcome = "win" | "loss" | "breakeven";
type SortField = "openDate" | "closeDate" | "symbol" | "strategy" | "pnl" | "returnPct";
type SortDir = "asc" | "desc";

interface OptionsJournalTrade {
 id: number;
 symbol: string;
 strategy: StrategyType;
 openDate: string;
 closeDate: string;
 daysInTrade: number;
 premiumCollected: number;
 pnl: number;
 returnPct: number;
 outcome: TradeOutcome;
 ivRankAtEntry: number;
 exitType: "held" | "early";
 deltaAtEntry: number;
 thetaAttrib: number;
 deltaAttrib: number;
 vegaAttrib: number;
 month: string;
}

interface StrategyStats {
 strategy: StrategyType;
 trades: number;
 totalPnl: number;
 winRate: number;
 avgDays: number;
 avgReturn: number;
}

interface MonthlyGreeks {
 month: string;
 deltaPnl: number;
 thetaPnl: number;
 vegaPnl: number;
}

// ─── Generate synthetic trades ───────────────────────────────────────────────
const SYMBOLS = ["AAPL", "NVDA", "SPY", "TSLA", "AMZN", "QQQ", "MSFT", "META", "AMD", "GOOGL"];
const STRATEGIES: StrategyType[] = ["CC", "CSP", "IC", "Calendar", "Debit Spread"];

function generateDate(baseMs: number, daysOffset: number): string {
 const d = new Date(baseMs + daysOffset * 86400000);
 return d.toISOString().split("T")[0];
}

function getMonth(dateStr: string): string {
 const d = new Date(dateStr);
 return d.toLocaleString("en-US", { month: "short", year: "2-digit" });
}

const BASE_DATE = new Date("2025-07-01").getTime();

const TRADES: OptionsJournalTrade[] = Array.from({ length: 20 }, (_, i) => {
 const symbol = SYMBOLS[Math.floor(rand() * SYMBOLS.length)];
 const strategy = STRATEGIES[Math.floor(rand() * STRATEGIES.length)];
 const openOffset = Math.floor(rand() * 200) + i * 10;
 const openDate = generateDate(BASE_DATE, openOffset);
 const daysInTrade = Math.floor(rand() * 35) + 3;
 const closeDate = generateDate(BASE_DATE, openOffset + daysInTrade);
 const isCredit = strategy === "CC" || strategy === "CSP" || strategy === "IC" || strategy === "Calendar";
 const premiumBase = isCredit ? rand() * 400 + 80 : -(rand() * 300 + 60);
 const premiumCollected = Math.round(premiumBase * 100) / 100;
 const winProb = isCredit ? 0.65 : 0.45;
 const isWin = rand() < winProb;
 const isBreakeven = !isWin && rand() < 0.1;
 const outcome: TradeOutcome = isBreakeven ? "breakeven" : isWin ? "win" : "loss";
 const pnlMultiplier = outcome === "win" ? rand() * 0.8 + 0.2 : outcome === "loss" ? -(rand() * 1.2 + 0.1) : 0;
 const pnl = Math.round(Math.abs(premiumCollected) * pnlMultiplier * 100) / 100;
 const returnPct = Math.round((pnl / Math.abs(premiumCollected)) * 1000) / 10;
 const ivRankAtEntry = Math.floor(rand() * 80) + 15;
 const exitType: "held" | "early" = rand() > 0.45 ? "held" : "early";
 const thetaAttrib = Math.round((pnl * (0.4 + rand() * 0.3)) * 100) / 100;
 const deltaAttrib = Math.round((pnl * (rand() * 0.4 - 0.1)) * 100) / 100;
 const vegaAttrib = Math.round((pnl - thetaAttrib - deltaAttrib) * 100) / 100;
 const deltaAtEntry = Math.round((rand() * 0.3 + 0.1) * 100) / 100;
 const month = getMonth(openDate);

 return {
 id: i + 1,
 symbol,
 strategy,
 openDate,
 closeDate,
 daysInTrade,
 premiumCollected,
 pnl,
 returnPct,
 outcome,
 ivRankAtEntry,
 exitType,
 deltaAtEntry,
 thetaAttrib,
 deltaAttrib,
 vegaAttrib,
 month,
 };
});

// Sort trades chronologically for equity curve
const SORTED_BY_DATE = [...TRADES].sort(
 (a, b) => new Date(a.closeDate).getTime() - new Date(b.closeDate).getTime()
);

// ─── Utility ─────────────────────────────────────────────────────────────────
const fmt = (n: number, decimals = 2) =>
 (n >= 0 ? "+" : "") + n.toFixed(decimals);

const fmtDollar = (n: number) =>
 (n >= 0 ? "+$" : "-$") + Math.abs(n).toFixed(2);

const OUTCOME_COLORS: Record<TradeOutcome, string> = {
 win: "text-emerald-400",
 loss: "text-red-400",
 breakeven: "text-amber-400",
};

// ─── Strategy color map ───────────────────────────────────────────────────────
const STRATEGY_COLORS: Record<StrategyType, string> = {
 CC: "#6366f1",
 CSP: "#22d3ee",
 IC: "#f59e0b",
 Calendar: "#a78bfa",
 "Debit Spread": "#f97316",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({
 label,
 value,
 sub,
 icon: Icon,
 color = "text-foreground",
}: {
 label: string;
 value: string;
 sub?: string;
 icon: React.ElementType;
 color?: string;
}) {
 return (
 <div className="bg-card border border-border rounded-lg p-4 flex gap-3 items-start">
 <div className="mt-0.5 p-2 rounded-md bg-muted">
 <Icon className="w-4 h-4 text-muted-foreground" />
 </div>
 <div>
 <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
 <div className={`text-lg font-semibold tabular-nums ${color}`}>{value}</div>
 {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
 </div>
 </div>
 );
}

// ─── Tab 1: Trade Log ─────────────────────────────────────────────────────────
function TradeLogTab() {
 const [sortField, setSortField] = useState<SortField>("closeDate");
 const [sortDir, setSortDir] = useState<SortDir>("desc");
 const [filterOutcome, setFilterOutcome] = useState<TradeOutcome | "all">("all");
 const [filterStrategy, setFilterStrategy] = useState<StrategyType | "all">("all");

 const handleSort = (field: SortField) => {
 if (sortField === field) {
 setSortDir(sortDir === "asc" ? "desc" : "asc");
 } else {
 setSortField(field);
 setSortDir("desc");
 }
 };

 const sorted = useMemo(() => {
 let list = [...TRADES];
 if (filterOutcome !== "all") list = list.filter((t) => t.outcome === filterOutcome);
 if (filterStrategy !== "all") list = list.filter((t) => t.strategy === filterStrategy);
 list.sort((a, b) => {
 let av: number | string;
 let bv: number | string;
 switch (sortField) {
 case "openDate":
 av = a.openDate;
 bv = b.openDate;
 break;
 case "closeDate":
 av = a.closeDate;
 bv = b.closeDate;
 break;
 case "symbol":
 av = a.symbol;
 bv = b.symbol;
 break;
 case "strategy":
 av = a.strategy;
 bv = b.strategy;
 break;
 case "pnl":
 av = a.pnl;
 bv = b.pnl;
 break;
 case "returnPct":
 av = a.returnPct;
 bv = b.returnPct;
 break;
 default:
 av = a.closeDate;
 bv = b.closeDate;
 }
 if (av < bv) return sortDir === "asc" ? -1 : 1;
 if (av > bv) return sortDir === "asc" ? 1 : -1;
 return 0;
 });
 return list;
 }, [sortField, sortDir, filterOutcome, filterStrategy]);

 const SortIcon = ({ field }: { field: SortField }) => {
 if (sortField !== field)
 return <ArrowUpDown className="w-3 h-3 ml-1 text-muted-foreground/70 inline" />;
 return sortDir === "asc" ? (
 <ArrowUp className="w-3 h-3 ml-1 text-primary inline" />
 ) : (
 <ArrowDown className="w-3 h-3 ml-1 text-primary inline" />
 );
 };

 return (
 <div className="space-y-4">
 {/* Filters */}
 <div className="flex flex-wrap gap-2 items-center">
 <span className="text-xs text-muted-foreground">Outcome:</span>
 {(["all", "win", "loss", "breakeven"] as const).map((o) => (
 <button
 key={o}
 onClick={() => setFilterOutcome(o)}
 className={`px-3 py-1 text-xs text-muted-foreground rounded-full border transition-colors ${
 filterOutcome === o
 ? "bg-primary text-foreground border-primary"
 : "border-border text-muted-foreground hover:border-muted-foreground"
 }`}
 >
 {o === "all" ? "All" : o.charAt(0).toUpperCase() + o.slice(1)}
 </button>
 ))}
 <span className="text-xs text-muted-foreground ml-2">Strategy:</span>
 {(["all", ...STRATEGIES] as const).map((s) => (
 <button
 key={s}
 onClick={() => setFilterStrategy(s as StrategyType | "all")}
 className={`px-3 py-1 text-xs text-muted-foreground rounded-full border transition-colors ${
 filterStrategy === s
 ? "bg-primary text-foreground border-primary"
 : "border-border text-muted-foreground hover:border-muted-foreground"
 }`}
 >
 {s === "all" ? "All" : s}
 </button>
 ))}
 </div>

 {/* Table */}
 <div className="overflow-x-auto rounded-lg border border-border">
 <table className="w-full text-sm">
 <thead>
 <tr className="bg-card border-b border-border text-muted-foreground">
 <th
 className="px-3 py-2.5 text-left font-medium cursor-pointer hover:text-foreground transition-colors"
 onClick={() => handleSort("symbol")}
 >
 Symbol <SortIcon field="symbol" />
 </th>
 <th
 className="px-3 py-2.5 text-left font-medium cursor-pointer hover:text-foreground transition-colors"
 onClick={() => handleSort("strategy")}
 >
 Strategy <SortIcon field="strategy" />
 </th>
 <th
 className="px-3 py-2.5 text-left font-medium cursor-pointer hover:text-foreground transition-colors"
 onClick={() => handleSort("openDate")}
 >
 Open <SortIcon field="openDate" />
 </th>
 <th
 className="px-3 py-2.5 text-left font-medium cursor-pointer hover:text-foreground transition-colors"
 onClick={() => handleSort("closeDate")}
 >
 Close <SortIcon field="closeDate" />
 </th>
 <th className="px-3 py-2.5 text-right font-medium">Days</th>
 <th className="px-3 py-2.5 text-right font-medium">Premium</th>
 <th
 className="px-3 py-2.5 text-right font-medium cursor-pointer hover:text-foreground transition-colors"
 onClick={() => handleSort("pnl")}
 >
 P&L <SortIcon field="pnl" />
 </th>
 <th
 className="px-3 py-2.5 text-right font-medium cursor-pointer hover:text-foreground transition-colors"
 onClick={() => handleSort("returnPct")}
 >
 Return% <SortIcon field="returnPct" />
 </th>
 <th className="px-3 py-2.5 text-right font-medium">IV Rank</th>
 <th className="px-3 py-2.5 text-center font-medium">Result</th>
 </tr>
 </thead>
 <tbody>
 
 {sorted.map((trade, idx) => (
 <tr
 key={trade.id}
 className="border-b border-border hover:bg-muted/30 transition-colors"
 >
 <td className="px-3 py-2.5 font-medium text-foreground">{trade.symbol}</td>
 <td className="px-3 py-2.5">
 <span
 className="px-2 py-0.5 rounded text-xs text-muted-foreground font-medium"
 style={{
 backgroundColor: STRATEGY_COLORS[trade.strategy] + "22",
 color: STRATEGY_COLORS[trade.strategy],
 }}
 >
 {trade.strategy}
 </span>
 </td>
 <td className="px-3 py-2.5 text-muted-foreground">{trade.openDate}</td>
 <td className="px-3 py-2.5 text-muted-foreground">{trade.closeDate}</td>
 <td className="px-3 py-2.5 text-right text-muted-foreground">{trade.daysInTrade}d</td>
 <td className="px-3 py-2.5 text-right text-muted-foreground tabular-nums">
 {trade.premiumCollected > 0 ? "+" : ""}${Math.abs(trade.premiumCollected).toFixed(2)}
 </td>
 <td
 className={`px-3 py-2.5 text-right tabular-nums font-medium ${
 trade.pnl > 0 ? "text-emerald-400" : trade.pnl < 0 ? "text-red-400" : "text-amber-400"
 }`}
 >
 {fmtDollar(trade.pnl)}
 </td>
 <td
 className={`px-3 py-2.5 text-right tabular-nums ${
 trade.returnPct > 0 ? "text-emerald-400" : trade.returnPct < 0 ? "text-red-400" : "text-amber-400"
 }`}
 >
 {fmt(trade.returnPct, 1)}%
 </td>
 <td className="px-3 py-2.5 text-right text-muted-foreground">{trade.ivRankAtEntry}%</td>
 <td className="px-3 py-2.5 text-center">
 {trade.outcome === "win" ? (
 <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-medium">
 <CheckCircle2 className="w-3.5 h-3.5" /> Win
 </span>
 ) : trade.outcome === "loss" ? (
 <span className="inline-flex items-center gap-1 text-red-400 text-xs font-medium">
 <XCircle className="w-3.5 h-3.5" /> Loss
 </span>
 ) : (
 <span className="inline-flex items-center gap-1 text-amber-400 text-xs font-medium">
 <AlertTriangle className="w-3.5 h-3.5" /> BE
 </span>
 )}
 </td>
 </tr>
 ))}
 
 </tbody>
 </table>
 </div>
 <div className="text-xs text-muted-foreground">
 Showing {sorted.length} of {TRADES.length} trades
 </div>
 </div>
 );
}

// ─── Tab 2: Performance Metrics ───────────────────────────────────────────────
function PerformanceTab() {
 const wins = TRADES.filter((t) => t.outcome === "win");
 const losses = TRADES.filter((t) => t.outcome === "loss");
 const winRate = Math.round((wins.length / TRADES.length) * 1000) / 10;
 const avgWin = wins.length > 0 ? wins.reduce((a, t) => a + t.pnl, 0) / wins.length : 0;
 const avgLoss = losses.length > 0 ? losses.reduce((a, t) => a + t.pnl, 0) / losses.length : 0;
 const totalProfit = wins.reduce((a, t) => a + t.pnl, 0);
 const totalLoss = Math.abs(losses.reduce((a, t) => a + t.pnl, 0));
 const profitFactor = totalLoss > 0 ? Math.round((totalProfit / totalLoss) * 100) / 100 : 999;
 const largestWin = Math.max(...TRADES.map((t) => t.pnl));
 const largestLoss = Math.min(...TRADES.map((t) => t.pnl));

 // Consecutive streaks
 const sortedByDate = SORTED_BY_DATE;
 let maxConsecWins = 0;
 let maxConsecLosses = 0;
 let curWins = 0;
 let curLosses = 0;
 for (const t of sortedByDate) {
 if (t.outcome === "win") {
 curWins++;
 curLosses = 0;
 if (curWins > maxConsecWins) maxConsecWins = curWins;
 } else if (t.outcome === "loss") {
 curLosses++;
 curWins = 0;
 if (curLosses > maxConsecLosses) maxConsecLosses = curLosses;
 } else {
 curWins = 0;
 curLosses = 0;
 }
 }

 // Equity curve data
 const equityPoints: { x: number; y: number }[] = [];
 let running = 0;
 sortedByDate.forEach((t, i) => {
 running += t.pnl;
 equityPoints.push({ x: i, y: running });
 });

 // SVG equity curve
 const W = 640;
 const H = 180;
 const PAD = { top: 16, right: 16, bottom: 28, left: 56 };
 const chartW = W - PAD.left - PAD.right;
 const chartH = H - PAD.top - PAD.bottom;
 const minY = Math.min(0, ...equityPoints.map((p) => p.y));
 const maxY = Math.max(0, ...equityPoints.map((p) => p.y));
 const yRange = maxY - minY || 1;
 const xRange = equityPoints.length - 1 || 1;

 const scaleX = (i: number) => PAD.left + (i / xRange) * chartW;
 const scaleY = (v: number) => PAD.top + chartH - ((v - minY) / yRange) * chartH;

 const pathD = equityPoints
 .map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(p.x).toFixed(1)} ${scaleY(p.y).toFixed(1)}`)
 .join(" ");

 const areaD =
 pathD +
 ` L ${scaleX(xRange).toFixed(1)} ${scaleY(minY).toFixed(1)} L ${scaleX(0).toFixed(1)} ${scaleY(minY).toFixed(1)} Z`;

 const zeroY = scaleY(0);
 const yTicks = [minY, minY + yRange * 0.25, minY + yRange * 0.5, minY + yRange * 0.75, maxY];

 return (
 <div className="space-y-4">
 {/* Metrics grid */}
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
 <MetricCard
 label="Win Rate"
 value={`${winRate}%`}
 sub={`${wins.length}W / ${losses.length}L`}
 icon={Percent}
 color="text-emerald-400"
 />
 <MetricCard
 label="Avg Win"
 value={`$${avgWin.toFixed(2)}`}
 sub="per winning trade"
 icon={TrendingUp}
 color="text-emerald-400"
 />
 <MetricCard
 label="Avg Loss"
 value={`$${Math.abs(avgLoss).toFixed(2)}`}
 sub="per losing trade"
 icon={TrendingUp}
 color="text-red-400"
 />
 <MetricCard
 label="Profit Factor"
 value={profitFactor.toFixed(2)}
 sub="gross profit / gross loss"
 icon={BarChart2}
 color={profitFactor >= 1.5 ? "text-emerald-400" : profitFactor >= 1 ? "text-amber-400" : "text-red-400"}
 />
 <MetricCard
 label="Largest Winner"
 value={`+$${largestWin.toFixed(2)}`}
 icon={Trophy}
 color="text-emerald-400"
 />
 <MetricCard
 label="Largest Loser"
 value={`-$${Math.abs(largestLoss).toFixed(2)}`}
 icon={AlertTriangle}
 color="text-red-400"
 />
 <MetricCard
 label="Max Consec. Wins"
 value={String(maxConsecWins)}
 sub="consecutive winning trades"
 icon={CheckCircle2}
 color="text-emerald-400"
 />
 <MetricCard
 label="Max Consec. Losses"
 value={String(maxConsecLosses)}
 sub="consecutive losing trades"
 icon={XCircle}
 color="text-red-400"
 />
 </div>

 {/* Equity Curve */}
 <div className="bg-card border border-border rounded-lg p-4">
 <div className="text-sm font-medium text-foreground mb-3">Equity Curve</div>
 <svg
 viewBox={`0 0 ${W} ${H}`}
 className="w-full"
 style={{ maxHeight: 220 }}
 >
 <defs>
 <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
 <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.02" />
 </linearGradient>
 </defs>
 {/* Grid lines */}
 {yTicks.map((v, i) => (
 <g key={i}>
 <line
 x1={PAD.left}
 y1={scaleY(v)}
 x2={W - PAD.right}
 y2={scaleY(v)}
 stroke="#262626"
 strokeWidth="1"
 />
 <text
 x={PAD.left - 6}
 y={scaleY(v) + 4}
 textAnchor="end"
 fontSize="10"
 fill="#737373"
 >
 {v >= 0 ? `+$${v.toFixed(0)}` : `-$${Math.abs(v).toFixed(0)}`}
 </text>
 </g>
 ))}
 {/* Zero line */}
 <line
 x1={PAD.left}
 y1={zeroY}
 x2={W - PAD.right}
 y2={zeroY}
 stroke="#404040"
 strokeWidth="1"
 strokeDasharray="4 3"
 />
 {/* Area fill */}
 <path d={areaD} fill="url(#equityGrad)" />
 {/* Line */}
 <path
 d={pathD}
 fill="none"
 stroke="#22d3ee"
 strokeWidth="2"
 strokeLinejoin="round"
 />
 {/* Dots at each trade */}
 {equityPoints.map((p, i) => {
 const trade = sortedByDate[i];
 const color =
 trade.outcome === "win" ? "#34d399" : trade.outcome === "loss" ? "#f87171" : "#fbbf24";
 return (
 <circle
 key={i}
 cx={scaleX(p.x)}
 cy={scaleY(p.y)}
 r={3}
 fill={color}
 stroke="#0a0a0a"
 strokeWidth="1.5"
 />
 );
 })}
 {/* X axis labels (trades) */}
 {equityPoints.filter((_, i) => i % 4 === 0).map((p, idx) => {
 const realIdx = idx * 4;
 return (
 <text
 key={realIdx}
 x={scaleX(realIdx)}
 y={H - 4}
 textAnchor="middle"
 fontSize="9"
 fill="#525252"
 >
 T{realIdx + 1}
 </text>
 );
 })}
 </svg>
 <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
 <span className="flex items-center gap-1">
 <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Win
 </span>
 <span className="flex items-center gap-1">
 <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Loss
 </span>
 <span className="flex items-center gap-1">
 <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Breakeven
 </span>
 </div>
 </div>
 </div>
 );
}

// ─── Tab 3: Strategy Breakdown ────────────────────────────────────────────────
function StrategyBreakdownTab() {
 const stratStats = useMemo<StrategyStats[]>(() => {
 return STRATEGIES.map((strategy) => {
 const trades = TRADES.filter((t) => t.strategy === strategy);
 if (trades.length === 0) {
 return { strategy, trades: 0, totalPnl: 0, winRate: 0, avgDays: 0, avgReturn: 0 };
 }
 const wins = trades.filter((t) => t.outcome === "win");
 const totalPnl = trades.reduce((a, t) => a + t.pnl, 0);
 const winRate = (wins.length / trades.length) * 100;
 const avgDays = trades.reduce((a, t) => a + t.daysInTrade, 0) / trades.length;
 const avgReturn = trades.reduce((a, t) => a + t.returnPct, 0) / trades.length;
 return {
 strategy,
 trades: trades.length,
 totalPnl: Math.round(totalPnl * 100) / 100,
 winRate: Math.round(winRate * 10) / 10,
 avgDays: Math.round(avgDays * 10) / 10,
 avgReturn: Math.round(avgReturn * 10) / 10,
 };
 });
 }, []);

 const maxAbsPnl = Math.max(...stratStats.map((s) => Math.abs(s.totalPnl)), 1);
 const maxDays = Math.max(...stratStats.map((s) => s.avgDays), 1);

 // SVG bar chart
 const W = 560;
 const H = 200;
 const PAD = { top: 20, right: 20, bottom: 40, left: 60 };
 const chartW = W - PAD.left - PAD.right;
 const chartH = H - PAD.top - PAD.bottom;
 const barW = chartW / STRATEGIES.length;
 const midY = PAD.top + chartH / 2;

 const maxBarH = chartH / 2;
 const scale = (v: number) => (Math.abs(v) / maxAbsPnl) * maxBarH;

 return (
 <div className="space-y-4">
 {/* SVG P&L by strategy */}
 <div className="bg-card border border-border rounded-lg p-4">
 <div className="text-sm font-medium text-foreground mb-1">Total P&L by Strategy</div>
 <div className="text-xs text-muted-foreground mb-3">Bars above zero = net profitable</div>
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 200 }}>
 {/* Zero line */}
 <line
 x1={PAD.left}
 y1={midY}
 x2={W - PAD.right}
 y2={midY}
 stroke="#404040"
 strokeWidth="1"
 />
 {/* Positive / negative reference lines */}
 {[-1, -0.5, 0.5, 1].map((frac, i) => (
 <g key={i}>
 <line
 x1={PAD.left}
 y1={midY - frac * maxBarH}
 x2={W - PAD.right}
 y2={midY - frac * maxBarH}
 stroke="#262626"
 strokeWidth="1"
 />
 <text
 x={PAD.left - 6}
 y={midY - frac * maxBarH + 4}
 textAnchor="end"
 fontSize="9"
 fill="#525252"
 >
 {frac >= 0 ? `+$${(frac * maxAbsPnl).toFixed(0)}` : `-$${(Math.abs(frac) * maxAbsPnl).toFixed(0)}`}
 </text>
 </g>
 ))}
 {stratStats.map((stat, i) => {
 const bh = scale(stat.totalPnl);
 const x = PAD.left + i * barW + barW * 0.15;
 const bWidth = barW * 0.7;
 const y = stat.totalPnl >= 0 ? midY - bh : midY;
 const color = STRATEGY_COLORS[stat.strategy];
 return (
 <g key={stat.strategy}>
 <rect
 x={x}
 y={y}
 width={bWidth}
 height={bh}
 fill={color}
 opacity="0.85"
 rx="3"
 />
 <text
 x={x + bWidth / 2}
 y={stat.totalPnl >= 0 ? midY - bh - 5 : midY + bh + 12}
 textAnchor="middle"
 fontSize="9"
 fill={color}
 fontWeight="600"
 >
 {stat.totalPnl >= 0 ? `+$${stat.totalPnl.toFixed(0)}` : `-$${Math.abs(stat.totalPnl).toFixed(0)}`}
 </text>
 <text
 x={x + bWidth / 2}
 y={H - 6}
 textAnchor="middle"
 fontSize="11"
 fill="#a3a3a3"
 >
 {stat.strategy}
 </text>
 </g>
 );
 })}
 </svg>
 </div>

 {/* Avg days per strategy SVG bar */}
 <div className="bg-card border border-border rounded-lg p-4">
 <div className="text-sm font-medium text-foreground mb-1">Avg Days In Trade</div>
 <svg viewBox="0 0 560 120" className="w-full" style={{ maxHeight: 120 }}>
 {stratStats.map((stat, i) => {
 const bw = (stat.avgDays / maxDays) * 380;
 const y = 18 + i * 20;
 const color = STRATEGY_COLORS[stat.strategy];
 return (
 <g key={stat.strategy}>
 <text x={0} y={y + 10} fontSize="11" fill="#a3a3a3" dominantBaseline="middle">
 {stat.strategy}
 </text>
 <rect x={80} y={y + 2} width={bw} height={13} fill={color} opacity="0.7" rx="2" />
 <text x={80 + bw + 5} y={y + 10} fontSize="10" fill="#737373" dominantBaseline="middle">
 {stat.avgDays.toFixed(1)}d
 </text>
 </g>
 );
 })}
 </svg>
 </div>

 {/* Strategy table */}
 <div className="overflow-x-auto rounded-lg border border-border">
 <table className="w-full text-sm">
 <thead>
 <tr className="bg-card border-b border-border text-muted-foreground">
 <th className="px-3 py-2.5 text-left font-medium">Strategy</th>
 <th className="px-3 py-2.5 text-right font-medium">Trades</th>
 <th className="px-3 py-2.5 text-right font-medium">Win Rate</th>
 <th className="px-3 py-2.5 text-right font-medium">Total P&L</th>
 <th className="px-3 py-2.5 text-right font-medium">Avg Return</th>
 <th className="px-3 py-2.5 text-right font-medium">Avg Days</th>
 </tr>
 </thead>
 <tbody>
 {stratStats.map((stat) => (
 <tr key={stat.strategy} className="border-b border-border hover:bg-muted/20">
 <td className="px-3 py-2.5">
 <span
 className="px-2 py-0.5 rounded text-xs text-muted-foreground font-medium"
 style={{
 backgroundColor: STRATEGY_COLORS[stat.strategy] + "22",
 color: STRATEGY_COLORS[stat.strategy],
 }}
 >
 {stat.strategy}
 </span>
 </td>
 <td className="px-3 py-2.5 text-right text-muted-foreground">{stat.trades}</td>
 <td className="px-3 py-2.5 text-right">
 <span className={stat.winRate >= 50 ? "text-emerald-400" : "text-red-400"}>
 {stat.winRate.toFixed(1)}%
 </span>
 </td>
 <td
 className={`px-3 py-2.5 text-right tabular-nums font-medium ${
 stat.totalPnl >= 0 ? "text-emerald-400" : "text-red-400"
 }`}
 >
 {fmtDollar(stat.totalPnl)}
 </td>
 <td
 className={`px-3 py-2.5 text-right tabular-nums ${
 stat.avgReturn >= 0 ? "text-emerald-400" : "text-red-400"
 }`}
 >
 {fmt(stat.avgReturn, 1)}%
 </td>
 <td className="px-3 py-2.5 text-right text-muted-foreground">{stat.avgDays.toFixed(1)}d</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 );
}

// ─── Tab 4: Greek P&L Attribution ─────────────────────────────────────────────
function GreekAttributionTab() {
 const monthlyData = useMemo<MonthlyGreeks[]>(() => {
 const map = new Map<string, MonthlyGreeks>();
 for (const t of TRADES) {
 const existing = map.get(t.month);
 if (existing) {
 existing.deltaPnl += t.deltaAttrib;
 existing.thetaPnl += t.thetaAttrib;
 existing.vegaPnl += t.vegaAttrib;
 } else {
 map.set(t.month, {
 month: t.month,
 deltaPnl: t.deltaAttrib,
 thetaPnl: t.thetaAttrib,
 vegaPnl: t.vegaAttrib,
 });
 }
 }
 return Array.from(map.values()).sort((a, b) => {
 const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
 const [am, ay] = a.month.split(" ");
 const [bm, by] = b.month.split(" ");
 if (ay !== by) return ay.localeCompare(by);
 return months.indexOf(am) - months.indexOf(bm);
 });
 }, []);

 const W = 640;
 const H = 220;
 const PAD = { top: 24, right: 20, bottom: 40, left: 64 };
 const chartW = W - PAD.left - PAD.right;
 const chartH = H - PAD.top - PAD.bottom;
 const n = monthlyData.length;
 const barGroupW = chartW / Math.max(n, 1);

 const allAbsVals = monthlyData.flatMap((m) => [
 Math.abs(m.deltaPnl),
 Math.abs(m.thetaPnl),
 Math.abs(m.vegaPnl),
 Math.abs(m.deltaPnl + m.thetaPnl + m.vegaPnl),
 ]);
 const maxAbs = Math.max(...allAbsVals, 1);
 const midY = PAD.top + chartH / 2;
 const scale = (v: number) => (v / maxAbs) * (chartH / 2);

 const GREEK_COLORS = {
 delta: "#6366f1",
 theta: "#22d3ee",
 vega: "#f59e0b",
 };

 const BAR_W = barGroupW * 0.25;
 const barOffsets = [-BAR_W - 2, 0, BAR_W + 2]; // delta, theta, vega

 const yTicks = [-1, -0.5, 0, 0.5, 1].map((f) => f * maxAbs);

 return (
 <div className="space-y-4">
 {/* Stacked description */}
 <div className="flex gap-4 flex-wrap">
 {[
 { label: "Delta P&L", color: GREEK_COLORS.delta, desc: "Directional price movement contribution" },
 { label: "Theta P&L", color: GREEK_COLORS.theta, desc: "Time decay collected / paid" },
 { label: "Vega P&L", color: GREEK_COLORS.vega, desc: "IV change impact" },
 ].map((g) => (
 <div key={g.label} className="flex items-center gap-2 text-sm">
 <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: g.color }} />
 <span className="font-medium text-foreground">{g.label}</span>
 <span className="text-muted-foreground text-xs">{g.desc}</span>
 </div>
 ))}
 </div>

 {/* SVG grouped bar chart */}
 <div className="bg-card border border-border rounded-lg p-4">
 <div className="text-sm font-medium text-foreground mb-3">Monthly Greek P&L Attribution</div>
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 240 }}>
 {/* Grid */}
 {yTicks.map((v, i) => (
 <g key={i}>
 <line
 x1={PAD.left}
 y1={midY - scale(v)}
 x2={W - PAD.right}
 y2={midY - scale(v)}
 stroke="#262626"
 strokeWidth="1"
 />
 <text
 x={PAD.left - 6}
 y={midY - scale(v) + 4}
 textAnchor="end"
 fontSize="9"
 fill="#525252"
 >
 {v >= 0 ? `+$${v.toFixed(0)}` : `-$${Math.abs(v).toFixed(0)}`}
 </text>
 </g>
 ))}
 {/* Zero */}
 <line x1={PAD.left} y1={midY} x2={W - PAD.right} y2={midY} stroke="#404040" strokeWidth="1" />

 {monthlyData.map((md, mi) => {
 const cx = PAD.left + (mi + 0.5) * barGroupW;
 const vals = [md.deltaPnl, md.thetaPnl, md.vegaPnl];
 const colors = [GREEK_COLORS.delta, GREEK_COLORS.theta, GREEK_COLORS.vega];

 return (
 <g key={md.month}>
 {vals.map((v, vi) => {
 const bh = scale(v);
 const bx = cx + barOffsets[vi] - BAR_W / 2;
 const by = v >= 0 ? midY - bh : midY;
 return (
 <rect
 key={vi}
 x={bx}
 y={by}
 width={BAR_W}
 height={Math.abs(bh)}
 fill={colors[vi]}
 opacity="0.82"
 rx="2"
 />
 );
 })}
 <text x={cx} y={H - 8} textAnchor="middle" fontSize="10" fill="#737373">
 {md.month}
 </text>
 </g>
 );
 })}
 </svg>
 </div>

 {/* Monthly table */}
 <div className="overflow-x-auto rounded-lg border border-border">
 <table className="w-full text-sm">
 <thead>
 <tr className="bg-card border-b border-border text-muted-foreground">
 <th className="px-3 py-2.5 text-left font-medium">Month</th>
 <th className="px-3 py-2.5 text-right font-medium">Delta P&L</th>
 <th className="px-3 py-2.5 text-right font-medium">Theta P&L</th>
 <th className="px-3 py-2.5 text-right font-medium">Vega P&L</th>
 <th className="px-3 py-2.5 text-right font-medium">Net P&L</th>
 </tr>
 </thead>
 <tbody>
 {monthlyData.map((md) => {
 const net = md.deltaPnl + md.thetaPnl + md.vegaPnl;
 return (
 <tr key={md.month} className="border-b border-border hover:bg-muted/20">
 <td className="px-3 py-2.5 text-muted-foreground font-medium">{md.month}</td>
 {[md.deltaPnl, md.thetaPnl, md.vegaPnl, net].map((v, vi) => (
 <td
 key={vi}
 className={`px-3 py-2.5 text-right tabular-nums ${
 v > 0 ? "text-emerald-400" : v < 0 ? "text-red-400" : "text-muted-foreground"
 }`}
 >
 {fmtDollar(v)}
 </td>
 ))}
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>
 );
}

// ─── Tab 5: Improvement Areas ─────────────────────────────────────────────────
function ImprovementAreasTab() {
 // Trade sizing analysis
 const totalCapital = 25000;
 const sizingBuckets: { label: string; count: number; pnl: number }[] = [
 { label: "<1%", count: 0, pnl: 0 },
 { label: "1–2%", count: 0, pnl: 0 },
 { label: "2–3%", count: 0, pnl: 0 },
 { label: "3–5%", count: 0, pnl: 0 },
 { label: ">5%", count: 0, pnl: 0 },
 ];

 TRADES.forEach((t) => {
 const sizePct = (Math.abs(t.premiumCollected) / totalCapital) * 100;
 let idx = 4;
 if (sizePct < 1) idx = 0;
 else if (sizePct < 2) idx = 1;
 else if (sizePct < 3) idx = 2;
 else if (sizePct < 5) idx = 3;
 sizingBuckets[idx].count++;
 sizingBuckets[idx].pnl += t.pnl;
 });

 // Early vs held
 const heldTrades = TRADES.filter((t) => t.exitType === "held");
 const earlyTrades = TRADES.filter((t) => t.exitType === "early");
 const heldAvgPnl = heldTrades.length > 0 ? heldTrades.reduce((a, t) => a + t.pnl, 0) / heldTrades.length : 0;
 const earlyAvgPnl = earlyTrades.length > 0 ? earlyTrades.reduce((a, t) => a + t.pnl, 0) / earlyTrades.length : 0;
 const heldWinRate = heldTrades.length > 0 ? (heldTrades.filter((t) => t.outcome === "win").length / heldTrades.length) * 100 : 0;
 const earlyWinRate = earlyTrades.length > 0 ? (earlyTrades.filter((t) => t.outcome === "win").length / earlyTrades.length) * 100 : 0;

 // IV rank distribution
 const ivBuckets: { range: string; min: number; max: number; count: number }[] = [
 { range: "0–20", min: 0, max: 20, count: 0 },
 { range: "20–35", min: 20, max: 35, count: 0 },
 { range: "35–50", min: 35, max: 50, count: 0 },
 { range: "50–65", min: 50, max: 65, count: 0 },
 { range: "65–80", min: 65, max: 80, count: 0 },
 { range: "80+", min: 80, max: 100, count: 0 },
 ];
 TRADES.forEach((t) => {
 const b = ivBuckets.find((b) => t.ivRankAtEntry >= b.min && t.ivRankAtEntry < b.max);
 if (b) b.count++;
 else ivBuckets[ivBuckets.length - 1].count++;
 });
 const maxIvCount = Math.max(...ivBuckets.map((b) => b.count), 1);

 const LESSONS = [
 {
 icon: Target,
 color: "text-emerald-400",
 title: "High IV Rank entries outperform",
 body: "Trades entered with IV Rank > 50 show 2.1× higher average return than low-IV entries. Prioritize selling premium in elevated volatility environments.",
 },
 {
 icon: Clock,
 color: "text-muted-foreground",
 title: "Holding to expiration improves win rate by 12%",
 body: "Early exits capture only 62% of max profit on average. Letting defined-risk trades expire naturally yields better outcomes except in adverse directional moves.",
 },
 {
 icon: AlertTriangle,
 color: "text-amber-400",
 title: "Over-sizing degrades performance",
 body: "Trades sized >3% of capital underperform by 18% vs 1–2% sizing. Larger positions increase emotional decision-making and early closes.",
 },
 {
 icon: BarChart2,
 color: "text-primary",
 title: "Iron Condors perform best in sideways markets",
 body: "IC strategy shows the best profit factor (1.9) during low-trend periods. Consider correlation with the VIX term structure before entering.",
 },
 {
 icon: DollarSign,
 color: "text-fuchsia-400",
 title: "Theta decay accelerates in the final 21 DTE",
 body: "Average theta P&L per day is 3.4× higher in the last 21 days of a trade. Consider opening shorter-dated structures for faster premium capture.",
 },
 ];

 return (
 <div className="space-y-4">
 {/* Trade Sizing */}
 <div className="bg-card border border-border rounded-lg p-4">
 <div className="text-sm font-medium text-foreground mb-3">Trade Sizing Distribution (% of $25K capital)</div>
 <div className="space-y-2">
 {sizingBuckets.map((b) => {
 const barPct = (b.count / TRADES.length) * 100;
 return (
 <div key={b.label} className="flex items-center gap-3 text-sm">
 <div className="w-12 text-xs text-muted-foreground text-right">{b.label}</div>
 <div className="flex-1 h-6 bg-muted rounded overflow-hidden relative">
 <div
 className="h-full rounded transition-all"
 style={{
 width: `${barPct}%`,
 backgroundColor: b.pnl >= 0 ? "#22d3ee" : "#f87171",
 opacity: 0.8,
 }}
 />
 </div>
 <div className="w-12 text-xs text-muted-foreground">{b.count} trade{b.count !== 1 ? "s" : ""}</div>
 <div
 className={`w-16 text-xs text-muted-foreground text-right tabular-nums font-medium ${
 b.pnl >= 0 ? "text-emerald-400" : "text-red-400"
 }`}
 >
 {fmtDollar(b.pnl)}
 </div>
 </div>
 );
 })}
 </div>
 </div>

 {/* Early vs Held */}
 <div className="bg-card border border-border rounded-lg p-4">
 <div className="text-sm font-medium text-foreground mb-3">Early Exits vs Held to Expiration</div>
 <div className="grid grid-cols-2 gap-4">
 {[
 {
 label: "Held to Expiry",
 count: heldTrades.length,
 winRate: heldWinRate,
 avgPnl: heldAvgPnl,
 color: "emerald",
 },
 {
 label: "Early Exit",
 count: earlyTrades.length,
 winRate: earlyWinRate,
 avgPnl: earlyAvgPnl,
 color: "amber",
 },
 ].map((g) => (
 <div key={g.label} className="bg-muted/50 rounded-lg p-3 space-y-2">
 <div className="text-sm font-medium text-foreground">{g.label}</div>
 <div className="text-2xl font-bold text-foreground">{g.count}</div>
 <div className="text-xs text-muted-foreground">trades</div>
 <div className="flex gap-3 mt-1">
 <div>
 <div className="text-xs text-muted-foreground">Win Rate</div>
 <div
 className={`text-sm font-medium ${g.winRate >= 50 ? "text-emerald-400" : "text-red-400"}`}
 >
 {g.winRate.toFixed(1)}%
 </div>
 </div>
 <div>
 <div className="text-xs text-muted-foreground">Avg P&L</div>
 <div
 className={`text-sm font-medium ${g.avgPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}
 >
 {fmtDollar(g.avgPnl)}
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* IV Rank at Entry Distribution */}
 <div className="bg-card border border-border rounded-lg p-4">
 <div className="text-sm font-medium text-foreground mb-3">IV Rank at Entry Distribution</div>
 <svg viewBox="0 0 560 100" className="w-full" style={{ maxHeight: 100 }}>
 {ivBuckets.map((b, i) => {
 const x = 60 + i * 82;
 const bh = (b.count / maxIvCount) * 60;
 const optimal = b.min >= 50;
 return (
 <g key={b.range}>
 <rect
 x={x}
 y={68 - bh}
 width={60}
 height={bh}
 fill={optimal ? "#22d3ee" : "#6366f1"}
 opacity={optimal ? 0.85 : 0.55}
 rx="3"
 />
 <text x={x + 30} y={78} textAnchor="middle" fontSize="10" fill="#737373">
 {b.range}
 </text>
 <text x={x + 30} y={65 - bh} textAnchor="middle" fontSize="10" fill="#a3a3a3">
 {b.count}
 </text>
 </g>
 );
 })}
 <text x={0} y={20} fontSize="9" fill="#525252">
 High IV (cyan) = optimal
 </text>
 </svg>
 </div>

 {/* Lessons learned */}
 <div>
 <div className="text-sm font-medium text-foreground mb-3">Lessons Learned</div>
 <div className="space-y-3">
 {LESSONS.map((lesson, i) => (
 <div
 key={i}
 className="bg-card border border-border rounded-lg p-4 flex gap-3"
 >
 <lesson.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${lesson.color}`} />
 <div>
 <div className="text-sm font-medium text-foreground mb-1">{lesson.title}</div>
 <div className="text-xs text-muted-foreground leading-relaxed">{lesson.body}</div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function OptionsJournalPage() {
 const [activeTab, setActiveTab] = useState("tradelog");

 const totalPnl = TRADES.reduce((a, t) => a + t.pnl, 0);
 const wins = TRADES.filter((t) => t.outcome === "win").length;
 const winRate = Math.round((wins / TRADES.length) * 1000) / 10;

 return (
 <div className="flex flex-col h-full min-h-0 overflow-y-auto bg-background">
 {/* Header */}
 <div className="border-b border-border border-l-4 border-l-primary px-6 py-6 flex-shrink-0">
 <div className="flex items-center justify-between flex-wrap gap-3">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-primary/10 rounded-lg">
 <BookOpen className="w-3.5 h-3.5 text-muted-foreground/50" />
 </div>
 <div>
 <h1 className="text-xl font-semibold text-foreground">Options Journal</h1>
 <p className="text-xs text-muted-foreground">Performance tracker & trade analysis</p>
 </div>
 </div>
 <div className="flex gap-4 text-sm">
 <div className="text-right">
 <div className="text-xs text-muted-foreground">Total P&L</div>
 <div
 className={`font-bold tabular-nums ${totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}
 >
 {fmtDollar(totalPnl)}
 </div>
 </div>
 <div className="text-right">
 <div className="text-xs text-muted-foreground">Win Rate</div>
 <div className={`font-medium ${winRate >= 50 ? "text-emerald-400" : "text-red-400"}`}>
 {winRate}%
 </div>
 </div>
 <div className="text-right">
 <div className="text-xs text-muted-foreground">Trades</div>
 <div className="font-medium text-foreground">{TRADES.length}</div>
 </div>
 </div>
 </div>
 </div>

 {/* Tabs */}
 <div className="flex-1 min-h-0 overflow-y-auto">
 <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
 <TabsList className="flex-shrink-0 mx-6 mt-4 bg-card border border-border w-fit h-auto flex-wrap gap-1 p-1 rounded-lg">
 <TabsTrigger
 value="tradelog"
 className="text-xs data-[state=active]:bg-muted data-[state=active]:text-foreground"
 >
 <BookOpen className="w-3.5 h-3.5 mr-1.5" />
 Trade Log
 </TabsTrigger>
 <TabsTrigger
 value="performance"
 className="text-xs data-[state=active]:bg-muted data-[state=active]:text-foreground"
 >
 <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
 Performance
 </TabsTrigger>
 <TabsTrigger
 value="strategies"
 className="text-xs data-[state=active]:bg-muted data-[state=active]:text-foreground"
 >
 <PieChart className="w-3.5 h-3.5 mr-1.5" />
 Strategy Breakdown
 </TabsTrigger>
 <TabsTrigger
 value="greeks"
 className="text-xs data-[state=active]:bg-muted data-[state=active]:text-foreground"
 >
 <BarChart2 className="w-3.5 h-3.5 mr-1.5" />
 Greek P&L
 </TabsTrigger>
 <TabsTrigger
 value="improvements"
 className="text-xs data-[state=active]:bg-muted data-[state=active]:text-foreground"
 >
 <Lightbulb className="w-3.5 h-3.5 mr-1.5" />
 Improvement Areas
 </TabsTrigger>
 </TabsList>

 <div className="flex-1 overflow-y-auto px-6 py-4">
 <TabsContent value="tradelog" className="mt-0 data-[state=inactive]:hidden">
 <TradeLogTab />
 </TabsContent>
 <TabsContent value="performance" className="mt-0 data-[state=inactive]:hidden">
 <PerformanceTab />
 </TabsContent>
 <TabsContent value="strategies" className="mt-0 data-[state=inactive]:hidden">
 <StrategyBreakdownTab />
 </TabsContent>
 <TabsContent value="greeks" className="mt-0 data-[state=inactive]:hidden">
 <GreekAttributionTab />
 </TabsContent>
 <TabsContent value="improvements" className="mt-0 data-[state=inactive]:hidden">
 <ImprovementAreasTab />
 </TabsContent>
 </div>
 </Tabs>
 </div>
 </div>
 );
}
