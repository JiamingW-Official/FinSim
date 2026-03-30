"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
 calculateRebalance,
 type RebalanceResult,
 type RebalanceAction,
} from "@/services/quant/rebalancing";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDollar(v: number): string {
 if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
 if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
 return `$${v.toFixed(2)}`;
}

// ─── Pie Chart (SVG) ─────────────────────────────────────────────────────────

const COLORS = [
 "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6",
 "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#6366f1",
];

function PieChart({
 slices,
 label,
}: {
 slices: { name: string; value: number }[];
 label: string;
}) {
 const total = slices.reduce((s, sl) => s + sl.value, 0);
 if (total === 0) return null;

 const r = 40;
 const cx = 50;
 const cy = 50;
 let cumAngle = -Math.PI / 2;

 const arcs = slices.map((sl, i) => {
 const fraction = sl.value / total;
 const angle = fraction * Math.PI * 2;
 const startX = cx + r * Math.cos(cumAngle);
 const startY = cy + r * Math.sin(cumAngle);
 cumAngle += angle;
 const endX = cx + r * Math.cos(cumAngle);
 const endY = cy + r * Math.sin(cumAngle);
 const largeArc = angle > Math.PI ? 1 : 0;
 const d = `M${cx},${cy} L${startX},${startY} A${r},${r} 0 ${largeArc} 1 ${endX},${endY} Z`;
 return <path key={i} d={d} fill={COLORS[i % COLORS.length]} />;
 });

 return (
 <div className="text-center">
 <svg viewBox="0 0 100 100" className="w-24 h-24 mx-auto">
 {arcs}
 <circle cx={cx} cy={cy} r={20} className="fill-card" />
 </svg>
 <p className="text-xs text-muted-foreground mt-1">{label}</p>
 </div>
 );
}

// ─── Deviation Bar ───────────────────────────────────────────────────────────

function DeviationBar({ deviation }: { deviation: number }) {
 const maxDev = 20;
 const absDev = Math.min(Math.abs(deviation), maxDev);
 const pct = (absDev / maxDev) * 50;
 const isOver = deviation > 0;

 return (
 <div className="flex items-center gap-1">
 <div className="relative w-24 h-1.5 rounded-full bg-muted">
 <div className="absolute left-1/2 top-0 w-px h-full bg-muted-foreground/30" />
 {isOver ? (
 <div
 className="absolute h-full bg-red-500 rounded-r-full transition-colors duration-300"
 style={{ left: "50%", width: `${pct}%` }}
 />
 ) : (
 <div
 className="absolute h-full bg-emerald-500 rounded-l-full transition-colors duration-300"
 style={{ right: "50%", width: `${pct}%` }}
 />
 )}
 </div>
 <span
 className={cn(
 "font-mono tabular-nums text-xs w-12 text-right",
 deviation > 2
 ? "text-red-500"
 : deviation < -2
 ? "text-emerald-500"
 : "text-muted-foreground",
 )}
 >
 {deviation >= 0 ? "+" : ""}
 {deviation.toFixed(1)}%
 </span>
 </div>
 );
}

// ─── Action Badge ────────────────────────────────────────────────────────────

function ActionBadge({ action }: { action: RebalanceAction["action"] }) {
 const config = {
 buy: { text: "BUY", className: "bg-emerald-500/5 text-emerald-500" },
 sell: { text: "SELL", className: "bg-red-500/5 text-red-500" },
 hold: { text: "HOLD", className: "bg-muted text-muted-foreground" },
 };
 const c = config[action];
 return (
 <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", c.className)}>
 {c.text}
 </span>
 );
}

// ─── Default Positions ───────────────────────────────────────────────────────

const DEFAULT_POSITIONS = [
 { ticker: "AAPL", value: 25000 },
 { ticker: "MSFT", value: 22000 },
 { ticker: "GOOG", value: 18000 },
 { ticker: "AMZN", value: 15000 },
 { ticker: "NVDA", value: 12000 },
 { ticker: "TSLA", value: 8000 },
];

const DEFAULT_TARGETS: Record<string, number> = {
 AAPL: 0.2,
 MSFT: 0.2,
 GOOG: 0.18,
 AMZN: 0.17,
 NVDA: 0.15,
 TSLA: 0.1,
};

// ─── Main Component ──────────────────────────────────────────────────────────

export function RebalancingPanel() {
 const [threshold, setThreshold] = useState(5);

 const portfolioValue = DEFAULT_POSITIONS.reduce(
 (s, p) => s + p.value,
 0,
 );

 const result: RebalanceResult = useMemo(
 () =>
 calculateRebalance(
 DEFAULT_POSITIONS,
 DEFAULT_TARGETS,
 portfolioValue,
 threshold,
 ),
 [threshold, portfolioValue],
 );

 // Slices for pie charts
 const currentSlices = DEFAULT_POSITIONS.map((p) => ({
 name: p.ticker,
 value: p.value,
 }));

 const targetSlices = Object.entries(DEFAULT_TARGETS).map(
 ([ticker, weight]) => ({
 name: ticker,
 value: weight * portfolioValue,
 }),
 );

 return (
 <div className="rounded-lg border bg-card p-4 space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-semibold">Portfolio Rebalancing</h3>
 <span
 className={cn(
 "text-xs px-1.5 py-0.5 rounded font-medium",
 result.needsRebalance
 ? "bg-amber-500/10 text-amber-500"
 : "bg-emerald-500/5 text-emerald-500",
 )}
 >
 {result.needsRebalance ? "Rebalance Needed" : "Balanced"}
 </span>
 </div>

 {/* Pie charts */}
 <div className="flex items-center justify-center gap-8">
 <PieChart slices={currentSlices} label="Current" />
 <div className="text-muted-foreground">
 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
 <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
 </svg>
 </div>
 <PieChart slices={targetSlices} label="Target" />
 </div>

 {/* Legend */}
 <div className="flex flex-wrap gap-2 justify-center">
 {DEFAULT_POSITIONS.map((p, i) => (
 <div key={p.ticker} className="flex items-center gap-1">
 <div
 className="w-2 h-2 rounded-sm"
 style={{ backgroundColor: COLORS[i % COLORS.length] }}
 />
 <span className="text-xs text-muted-foreground">
 {p.ticker}
 </span>
 </div>
 ))}
 </div>

 {/* Threshold slider */}
 <div className="flex items-center gap-3">
 <span className="text-xs text-muted-foreground">Threshold:</span>
 <input
 type="range"
 min={1}
 max={15}
 value={threshold}
 onChange={(e) => setThreshold(Number(e.target.value))}
 className="flex-1 h-1 accent-primary"
 />
 <span className="font-mono tabular-nums text-xs font-medium w-8 text-right">
 {threshold}%
 </span>
 </div>

 {/* Actions table */}
 <div className="border-t pt-3">
 <p className="text-xs font-medium text-muted-foreground mb-2">
 Recommended Trades
 </p>
 <div className="overflow-x-auto">
 <table className="w-full text-xs">
 <thead>
 <tr className="border-b text-muted-foreground">
 <th className="text-left py-1 px-1 font-medium">Ticker</th>
 <th className="text-right py-1 px-1 font-medium">Current</th>
 <th className="text-right py-1 px-1 font-medium">Target</th>
 <th className="text-left py-1 px-2 font-medium">Deviation</th>
 <th className="text-left py-1 px-1 font-medium">Action</th>
 <th className="text-right py-1 px-1 font-medium">Amount</th>
 </tr>
 </thead>
 <tbody>
 {result.actions.map((action) => (
 <tr
 key={action.ticker}
 className="border-b border-muted/50"
 >
 <td className="py-1.5 px-1 font-medium">
 {action.ticker}
 </td>
 <td className="py-1.5 px-1 text-right font-mono tabular-nums">
 {action.currentWeight.toFixed(1)}%
 </td>
 <td className="py-1.5 px-1 text-right font-mono tabular-nums">
 {action.targetWeight.toFixed(1)}%
 </td>
 <td className="py-1.5 px-2">
 <DeviationBar deviation={action.deviation} />
 </td>
 <td className="py-1.5 px-1">
 <ActionBadge action={action.action} />
 </td>
 <td className="py-1.5 px-1 text-right font-mono tabular-nums">
 {action.action !== "hold"
 ? formatDollar(action.dollarAmount)
 : "--"}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 {/* Summary */}
 <div className="grid grid-cols-3 gap-3">
 <div className="space-y-0.5">
 <p className="text-xs text-muted-foreground">Turnover</p>
 <p className="font-mono tabular-nums text-xs font-medium">
 {result.totalTurnover.toFixed(1)}%
 </p>
 </div>
 <div className="space-y-0.5">
 <p className="text-xs text-muted-foreground">Est. Cost</p>
 <p className="font-mono tabular-nums text-xs font-medium">
 {formatDollar(result.estimatedCost)}
 </p>
 </div>
 <div className="space-y-0.5">
 <p className="text-xs text-muted-foreground">Portfolio</p>
 <p className="font-mono tabular-nums text-xs font-medium">
 {formatDollar(portfolioValue)}
 </p>
 </div>
 </div>

 {/* Educational note */}
 <p className="text-xs text-muted-foreground leading-relaxed">
 {result.educationalNote}
 </p>
 </div>
 );
}
