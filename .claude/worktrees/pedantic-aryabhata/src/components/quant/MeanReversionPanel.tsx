"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
 scanMeanReversion,
 type MeanReversionSignal,
} from "@/services/quant/mean-reversion";
import { WATCHLIST_STOCKS } from "@/types/market";

// ─── Synthetic Price Generator ───────────────────────────────────────────────

function generatePrices(ticker: string, bars: number = 60): number[] {
 let seed = 0;
 for (let i = 0; i < ticker.length; i++) {
 seed = (seed * 31 + ticker.charCodeAt(i)) | 0;
 }
 const prices: number[] = [];
 let price = 80 + (Math.abs(seed) % 200);
 for (let i = 0; i < bars; i++) {
 seed = (seed * 1103515245 + 12345) & 0x7fffffff;
 const change = ((seed / 0x7fffffff) - 0.5) * 3;
 price = Math.max(10, price + change);
 prices.push(Math.round(price * 100) / 100);
 }
 return prices;
}

// ─── Signal Badge ────────────────────────────────────────────────────────────

function SignalBadge({ signal }: { signal: MeanReversionSignal["signal"] }) {
 const config = {
 strong_buy: { text: "Strong Buy", className: "bg-emerald-500/5 text-emerald-500" },
 buy: { text: "Buy", className: "bg-emerald-500/5 text-emerald-500" },
 neutral: { text: "Neutral", className: "bg-muted text-muted-foreground" },
 sell: { text: "Sell", className: "bg-red-500/5 text-red-500" },
 strong_sell: { text: "Strong Sell", className: "bg-red-500/5 text-red-500" },
 };
 const c = config[signal];
 return (
 <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", c.className)}>
 {c.text}
 </span>
 );
}

// ─── Z-Score Indicator ───────────────────────────────────────────────────────

function ZScoreIndicator({ zScore }: { zScore: number }) {
 // Map z-score from [-3, 3] to [0, 100]
 const pct = Math.max(0, Math.min(100, ((zScore + 3) / 6) * 100));
 const color =
 zScore < -1.5
 ? "bg-emerald-500"
 : zScore > 1.5
 ? "bg-red-500"
 : "bg-amber-500";

 return (
 <div className="flex items-center gap-1.5">
 <div className="relative w-full h-1.5 rounded-full bg-muted">
 {/* Center marker */}
 <div className="absolute left-1/2 top-0 w-px h-full bg-muted-foreground/30" />
 {/* Position dot */}
 <div
 className={cn(
 "absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-colors duration-300",
 color,
 )}
 style={{ left: `calc(${pct}% - 4px)` }}
 />
 </div>
 <span
 className={cn(
 "font-mono tabular-nums text-xs w-8 text-right shrink-0",
 zScore < -1 ? "text-emerald-500" : zScore > 1 ? "text-red-500" : "text-muted-foreground",
 )}
 >
 {zScore >= 0 ? "+" : ""}
 {zScore.toFixed(1)}
 </span>
 </div>
 );
}

// ─── Bollinger Position Bar ──────────────────────────────────────────────────

function BollingerBar({ position }: { position: number }) {
 const pct = Math.max(0, Math.min(100, position * 100));
 const color =
 position < 0.2
 ? "text-emerald-500"
 : position > 0.8
 ? "text-red-500"
 : "text-muted-foreground";

 return (
 <div className="flex items-center gap-1.5">
 <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
 <div
 className={cn(
 "h-full rounded-full transition-colors duration-300",
 position < 0.3
 ? "bg-emerald-500"
 : position > 0.7
 ? "bg-red-500"
 : "bg-muted-foreground/50",
 )}
 style={{ width: `${pct}%` }}
 />
 </div>
 <span className={cn("font-mono tabular-nums text-xs w-8 text-right shrink-0", color)}>
 {pct.toFixed(0)}%
 </span>
 </div>
 );
}

// ─── Signal Card ─────────────────────────────────────────────────────────────

function SignalCard({ data }: { data: MeanReversionSignal }) {
 const scoreColor =
 data.score < -30
 ? "text-emerald-500 border-emerald-500/30"
 : data.score > 30
 ? "text-red-500 border-red-500/30"
 : "text-muted-foreground border-muted";

 const bgColor =
 data.score < -30
 ? "bg-emerald-500/5"
 : data.score > 30
 ? "bg-red-500/5"
 : "";

 return (
 <div className={cn("rounded-lg border p-3 space-y-2", bgColor)}>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <span className="text-sm font-semibold">{data.ticker}</span>
 <SignalBadge signal={data.signal} />
 </div>
 <span
 className={cn(
 "font-mono tabular-nums text-sm font-medium px-1.5 py-0.5 rounded border",
 scoreColor,
 )}
 >
 {data.score}
 </span>
 </div>

 <div className="grid grid-cols-3 gap-3">
 <div className="space-y-1">
 <p className="text-xs text-muted-foreground">Z-Score</p>
 <ZScoreIndicator zScore={data.zScore} />
 </div>
 <div className="space-y-1">
 <p className="text-xs text-muted-foreground">RSI</p>
 <p
 className={cn(
 "font-mono tabular-nums text-xs font-medium",
 data.rsiLevel < 30
 ? "text-emerald-500"
 : data.rsiLevel > 70
 ? "text-red-500"
 : "text-muted-foreground",
 )}
 >
 {data.rsiLevel.toFixed(1)}
 </p>
 </div>
 <div className="space-y-1">
 <p className="text-xs text-muted-foreground">BB Position</p>
 <BollingerBar position={data.bollingerPosition} />
 </div>
 </div>
 </div>
 );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function MeanReversionPanel() {
 const signals: MeanReversionSignal[] = useMemo(() => {
 const results: MeanReversionSignal[] = [];
 for (const stock of WATCHLIST_STOCKS) {
 const prices = generatePrices(stock.ticker);
 results.push(scanMeanReversion(stock.ticker, prices));
 }
 // Sort by absolute score descending (most extreme first)
 results.sort((a, b) => Math.abs(b.score) - Math.abs(a.score));
 return results;
 }, []);

 const oversold = signals.filter((s) => s.score < -25);
 const overbought = signals.filter((s) => s.score > 25);

 return (
 <div className="rounded-lg border bg-card p-4 space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-semibold">Mean Reversion Scanner</h3>
 <div className="flex items-center gap-2 text-xs">
 {oversold.length > 0 && (
 <span className="text-emerald-500 font-medium">
 {oversold.length} oversold
 </span>
 )}
 {overbought.length > 0 && (
 <span className="text-red-500 font-medium">
 {overbought.length} overbought
 </span>
 )}
 </div>
 </div>

 {/* Signal cards */}
 <div className="space-y-2">
 {signals.map((signal) => (
 <SignalCard key={signal.ticker} data={signal} />
 ))}
 </div>

 {/* Educational footer */}
 <p className="text-xs text-muted-foreground leading-relaxed">
 Mean reversion scores combine Z-score (40%), RSI (35%), and
 Bollinger position (25%). Negative scores indicate oversold
 conditions (potential buy), positive scores indicate overbought
 (potential sell). Extreme readings (&gt;60 or &lt;-60) historically
 precede reversals, but strongly trending markets can stay extreme
 for extended periods.
 </p>
 </div>
 );
}
