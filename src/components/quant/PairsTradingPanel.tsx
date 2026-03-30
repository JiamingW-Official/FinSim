"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
 findBestPairs,
 type PairAnalysis,
} from "@/services/quant/pairs-trading";
import { WATCHLIST_STOCKS } from "@/types/market";

// ─── Synthetic Price Generator ───────────────────────────────────────────────

function generatePrices(ticker: string, bars: number = 120): number[] {
 let seed = 0;
 for (let i = 0; i < ticker.length; i++) {
 seed = (seed * 31 + ticker.charCodeAt(i)) | 0;
 }
 const prices: number[] = [];
 let price = 80 + (Math.abs(seed) % 200);
 for (let i = 0; i < bars; i++) {
 seed = (seed * 1103515245 + 12345) & 0x7fffffff;
 const change = ((seed / 0x7fffffff) - 0.5) * 2.5;
 price = Math.max(10, price + change);
 prices.push(Math.round(price * 100) / 100);
 }
 return prices;
}

// ─── Spread Chart (SVG) ─────────────────────────────────────────────────────

function SpreadChart({
 prices1,
 prices2,
}: {
 prices1: number[];
 prices2: number[];
}) {
 const w = 280;
 const h = 80;
 const padding = 4;

 const n = Math.min(prices1.length, prices2.length);
 if (n < 2) return null;

 // Compute log spread
 const spread: number[] = [];
 for (let i = 0; i < n; i++) {
 spread.push(Math.log(prices1[i] / prices2[i]));
 }

 const mean = spread.reduce((s, v) => s + v, 0) / spread.length;
 let sumSq = 0;
 for (const v of spread) sumSq += (v - mean) * (v - mean);
 const sd = Math.sqrt(sumSq / (spread.length - 1));

 const minV = Math.min(...spread);
 const maxV = Math.max(...spread);
 const range = maxV - minV || 1;

 const points = spread
 .map((v, i) => {
 const x = padding + (i / (n - 1)) * (w - padding * 2);
 const y = padding + (1 - (v - minV) / range) * (h - padding * 2);
 return `${x},${y}`;
 })
 .join(" ");

 // Mean and +/- 1SD lines
 const meanY = padding + (1 - (mean - minV) / range) * (h - padding * 2);
 const upperY = padding + (1 - (mean + sd - minV) / range) * (h - padding * 2);
 const lowerY = padding + (1 - (mean - sd - minV) / range) * (h - padding * 2);

 return (
 <svg width={w} height={h} className="w-full">
 {/* Bands */}
 <rect
 x={padding}
 y={Math.min(upperY, lowerY)}
 width={w - padding * 2}
 height={Math.abs(upperY - lowerY)}
 fill="currentColor"
 fillOpacity={0.05}
 />
 {/* Mean line */}
 <line
 x1={padding}
 x2={w - padding}
 y1={meanY}
 y2={meanY}
 stroke="currentColor"
 strokeOpacity={0.3}
 strokeWidth={0.5}
 strokeDasharray="4 2"
 />
 {/* Spread line */}
 <polyline
 points={points}
 fill="none"
 stroke="rgb(99, 102, 241)"
 strokeWidth={1.5}
 />
 </svg>
 );
}

// ─── Signal Badge ────────────────────────────────────────────────────────────

function SignalBadge({ signal }: { signal: PairAnalysis["signal"] }) {
 const config = {
 long_spread: { text: "Long Spread", className: "bg-emerald-500/5 text-emerald-500" },
 short_spread: { text: "Short Spread", className: "bg-red-500/5 text-red-500" },
 neutral: { text: "Neutral", className: "bg-muted text-muted-foreground" },
 };
 const c = config[signal];
 return (
 <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", c.className)}>
 {c.text}
 </span>
 );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function PairsTradingPanel() {
 const [selectedPair, setSelectedPair] = useState<string | null>(null);

 const { pairs, priceMap } = useMemo(() => {
 const tickers = WATCHLIST_STOCKS.map((s) => s.ticker);
 const priceHistories: Record<string, number[]> = {};
 for (const t of tickers) {
 priceHistories[t] = generatePrices(t);
 }
 return {
 pairs: findBestPairs(priceHistories, tickers),
 priceMap: priceHistories,
 };
 }, []);

 const selected = selectedPair
 ? pairs.find(
 (p) => `${p.ticker1}-${p.ticker2}` === selectedPair,
 )
 : null;

 return (
 <div className="rounded-lg border bg-card p-4 space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-semibold">Pairs Trading Scanner</h3>
 <span className="text-xs text-muted-foreground">
 {pairs.length} pairs
 </span>
 </div>

 {/* Pairs table */}
 <div className="overflow-x-auto">
 <table className="w-full text-xs">
 <thead>
 <tr className="border-b text-muted-foreground">
 <th className="text-left py-1 px-1 font-medium">Pair</th>
 <th className="text-right py-1 px-1 font-medium">Correl.</th>
 <th className="text-right py-1 px-1 font-medium">Z-Score</th>
 <th className="text-center py-1 px-1 font-medium">Coint.</th>
 <th className="text-right py-1 px-1 font-medium">Half-Life</th>
 <th className="text-left py-1 px-1 font-medium">Signal</th>
 </tr>
 </thead>
 <tbody>
 {pairs.map((pair) => {
 const key = `${pair.ticker1}-${pair.ticker2}`;
 const absZ = Math.abs(pair.spreadZScore);
 return (
 <tr
 key={key}
 className={cn(
 "border-b border-muted/50 cursor-pointer transition-colors",
 selectedPair === key
 ? "bg-muted/40"
 : "hover:bg-muted/30",
 )}
 onClick={() =>
 setSelectedPair(selectedPair === key ? null : key)
 }
 >
 <td className="py-1.5 px-1 font-medium">
 {pair.ticker1}/{pair.ticker2}
 </td>
 <td
 className={cn(
 "py-1.5 px-1 text-right font-mono tabular-nums",
 pair.correlation > 0.7
 ? "text-emerald-500"
 : pair.correlation > 0.4
 ? "text-amber-500"
 : "text-muted-foreground",
 )}
 >
 {pair.correlation.toFixed(3)}
 </td>
 <td
 className={cn(
 "py-1.5 px-1 text-right font-mono tabular-nums",
 absZ > 2
 ? "text-red-500 font-medium"
 : absZ > 1
 ? "text-amber-500"
 : "text-muted-foreground",
 )}
 >
 {pair.spreadZScore.toFixed(2)}
 </td>
 <td className="py-1.5 px-1 text-center">
 {pair.cointegration ? (
 <span className="text-emerald-500 font-medium">Yes</span>
 ) : (
 <span className="text-muted-foreground">No</span>
 )}
 </td>
 <td className="py-1.5 px-1 text-right font-mono tabular-nums">
 {pair.halfLife > 0 ? `${pair.halfLife}` : "--"}
 </td>
 <td className="py-1.5 px-1">
 <SignalBadge signal={pair.signal} />
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>

 {/* Selected pair detail */}
 {selected && (
 <div className="border-t pt-3 space-y-3">
 <div className="flex items-center justify-between">
 <span className="text-xs font-medium">
 Spread: {selected.ticker1}/{selected.ticker2}
 </span>
 <span className="text-xs text-muted-foreground">
 Half-life: {selected.halfLife > 0 ? `${selected.halfLife} bars` : "N/A"}
 </span>
 </div>

 {/* Spread chart */}
 <SpreadChart
 prices1={priceMap[selected.ticker1]}
 prices2={priceMap[selected.ticker2]}
 />

 {/* Explanation */}
 <p className="text-xs text-muted-foreground leading-relaxed">
 {selected.explanation}
 </p>
 </div>
 )}
 </div>
 );
}
