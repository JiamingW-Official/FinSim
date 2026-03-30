"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Kelly Criterion Calculator ────────────────────────────────────────────────
// K = (b*p - q) / b
// where b = decimal odds - 1, p = win rate (0-1), q = 1 - p

function computeKelly(winRate: number, odds: number): number | null {
 const p = winRate / 100;
 const q = 1 - p;
 const b = odds - 1;
 if (b <= 0) return null;
 const k = (b * p - q) / b;
 return k;
}

// ── Bankroll bar ─────────────────────────────────────────────────────────────

function BankrollBar({
 fraction,
 label,
 color,
 danger,
}: {
 fraction: number; // 0-1
 label: string;
 color: string;
 danger?: boolean;
}) {
 const pct = Math.max(0, Math.min(100, fraction * 100));
 return (
 <div>
 <div className="mb-1 flex items-center justify-between text-xs">
 <span className="text-muted-foreground">{label}</span>
 <span
 className={cn(
 "font-mono tabular-nums font-semibold",
 danger ? "text-red-400" : color,
 )}
 >
 {pct.toFixed(1)}% of bankroll
 </span>
 </div>
 <div className="h-2 w-full overflow-hidden rounded-full bg-muted/40">
 <div
 className={cn(
 "h-full rounded-full transition-colors duration-300",
 danger ? "bg-red-500/60" : color === "text-green-400" ? "bg-green-500/60" : color === "text-primary" ? "bg-primary/60" : "bg-amber-500/60",
 )}
 style={{ width: `${Math.min(pct, 100)}%` }}
 />
 </div>
 </div>
 );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function KellyCalculator() {
 const [edge, setEdge] = useState<string>("10");
 const [winRate, setWinRate] = useState<string>("55");
 const [odds, setOdds] = useState<string>("2.0");

 const edgeNum = parseFloat(edge) || 0;
 const winRateNum = parseFloat(winRate) || 0;
 const oddsNum = parseFloat(odds) || 0;

 const kelly = useMemo(() => {
 if (winRateNum <= 0 || winRateNum >= 100 || oddsNum <= 1) return null;
 return computeKelly(winRateNum, oddsNum);
 }, [winRateNum, oddsNum]);

 const fullKelly = kelly !== null ? Math.max(0, kelly) : null;
 const halfKelly = fullKelly !== null ? fullKelly / 2 : null;
 const quarterKelly = fullKelly !== null ? fullKelly / 4 : null;

 const isOverbetting = fullKelly !== null && fullKelly > 0.25;
 const isNegativeEdge = fullKelly !== null && fullKelly <= 0;

 // Expected value from edge input
 const ev = useMemo(() => {
 if (winRateNum <= 0 || oddsNum <= 1) return null;
 const p = winRateNum / 100;
 const q = 1 - p;
 const b = oddsNum - 1;
 return p * b - q; // per unit wagered
 }, [winRateNum, oddsNum]);

 return (
 <div className="space-y-4">
 {/* Input grid */}
 <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
 {/* Win Rate */}
 <div>
 <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
 Win Rate (%)
 </label>
 <input
 type="number"
 min={1}
 max={99}
 step={1}
 value={winRate}
 onChange={(e) => setWinRate(e.target.value)}
 placeholder="55"
 className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 font-mono text-sm text-foreground placeholder-muted-foreground/50 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
 />
 <div className="mt-0.5 text-[11px] text-muted-foreground">
 Probability of winning (1–99)
 </div>
 </div>

 {/* Decimal Odds */}
 <div>
 <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
 Decimal Odds
 </label>
 <input
 type="number"
 min={1.01}
 step={0.1}
 value={odds}
 onChange={(e) => setOdds(e.target.value)}
 placeholder="2.0"
 className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 font-mono text-sm text-foreground placeholder-muted-foreground/50 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
 />
 <div className="mt-0.5 text-[11px] text-muted-foreground">
 2.0 = even money, 3.0 = 2:1
 </div>
 </div>

 {/* Edge (optional display) */}
 <div>
 <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
 Edge (%)
 </label>
 <input
 type="number"
 min={-100}
 max={100}
 step={0.5}
 value={edge}
 onChange={(e) => setEdge(e.target.value)}
 placeholder="10"
 className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 font-mono text-sm text-foreground placeholder-muted-foreground/50 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
 />
 <div className="mt-0.5 text-[11px] text-muted-foreground">
 Your estimated advantage
 </div>
 </div>
 </div>

 {/* Formula reminder */}
 <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
 <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
 <Info className="h-3 w-3 shrink-0" />
 <span className="font-mono">
 K = (b&times;p &minus; q) / b &nbsp;|&nbsp; b = odds&minus;1,
 p = win rate, q = 1&minus;p
 </span>
 </div>
 </div>

 {/* Results */}
 {fullKelly === null && (
 <div className="flex h-24 items-center justify-center rounded-lg border border-border bg-card text-[11px] text-muted-foreground">
 Enter valid win rate (1–99) and decimal odds (&gt;1) to calculate.
 </div>
 )}

 {fullKelly !== null && (
 <div className="space-y-3">
 {/* Negative edge warning */}
 {isNegativeEdge && (
 <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-[11px] text-red-400">
 <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
 <span>
 Negative edge detected. Kelly says bet 0% — this trade has no mathematical advantage.
 </span>
 </div>
 )}

 {/* Overbetting warning */}
 {isOverbetting && !isNegativeEdge && (
 <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-[11px] text-amber-400">
 <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
 <span>
 Full Kelly exceeds 25% — high variance territory. Most professionals cap at Half or Quarter Kelly.
 </span>
 </div>
 )}

 {/* Kelly recommendations */}
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="mb-3 text-xs font-semibold text-muted-foreground">
 Recommended Bet Size
 </div>
 <div className="space-y-3">
 <BankrollBar
 fraction={fullKelly}
 label="Full Kelly"
 color="text-green-400"
 danger={isOverbetting}
 />
 {halfKelly !== null && (
 <BankrollBar
 fraction={halfKelly}
 label="Half Kelly (recommended)"
 color="text-primary"
 danger={false}
 />
 )}
 {quarterKelly !== null && (
 <BankrollBar
 fraction={quarterKelly}
 label="Quarter Kelly (conservative)"
 color="text-amber-400"
 danger={false}
 />
 )}
 </div>
 </div>

 {/* Metrics row */}
 <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
 <MetricChip
 label="Full Kelly"
 value={
 fullKelly > 0
 ? `${(fullKelly * 100).toFixed(1)}%`
 : "0% (no bet)"
 }
 highlight={!isNegativeEdge && !isOverbetting}
 />
 <MetricChip
 label="Half Kelly"
 value={
 halfKelly !== null && halfKelly > 0
 ? `${(halfKelly * 100).toFixed(1)}%`
 : "0%"
 }
 />
 <MetricChip
 label="Quarter Kelly"
 value={
 quarterKelly !== null && quarterKelly > 0
 ? `${(quarterKelly * 100).toFixed(1)}%`
 : "0%"
 }
 />
 <MetricChip
 label="Expected Value"
 value={
 ev !== null
 ? `${ev >= 0 ? "+" : ""}${(ev * 100).toFixed(1)}% / unit`
 : "--"
 }
 positive={ev !== null && ev > 0}
 negative={ev !== null && ev < 0}
 />
 </div>

 {/* Educational note */}
 <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
 <span className="font-semibold text-foreground">
 Kelly Criterion
 </span>{" "}
 maximizes the log-growth of wealth over time. Betting the full
 Kelly fraction is theoretically optimal but causes high short-term
 variance. Half Kelly retains ~75% of the growth rate with
 significantly smoother results. Quarter Kelly is recommended when
 edge estimates are uncertain.
 </div>
 </div>
 )}
 </div>
 );
}

// ── Sub-component ─────────────────────────────────────────────────────────────

function MetricChip({
 label,
 value,
 highlight,
 positive,
 negative,
}: {
 label: string;
 value: string;
 highlight?: boolean;
 positive?: boolean;
 negative?: boolean;
}) {
 return (
 <div
 className={cn(
 "rounded-lg border px-3 py-2",
 highlight
 ? "border-primary/20 bg-primary/5"
 : "border-border bg-card",
 )}
 >
 <div className="text-[11px] text-muted-foreground">{label}</div>
 <div
 className={cn(
 "font-mono tabular-nums text-sm font-semibold",
 positive
 ? "text-green-400"
 : negative
 ? "text-red-400"
 : highlight
 ? "text-primary"
 : "text-foreground",
 )}
 >
 {value}
 </div>
 </div>
 );
}
