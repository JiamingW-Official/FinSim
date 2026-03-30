"use client";

import { useMemo } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { cn } from "@/lib/utils";
import { BarChart3 } from "lucide-react";

const BUCKETS = [
 { label: "< -$500", min: -Infinity, max: -500 },
 { label: "-$500\nto\n-$100", min: -500, max: -100 },
 { label: "-$100\nto\n$0", min: -100, max: 0 },
 { label: "$0\nto\n$100", min: 0, max: 100 },
 { label: "$100\nto\n$500", min: 100, max: 500 },
 { label: "> $500", min: 500, max: Infinity },
];

export function PnLHistogram() {
 const tradeHistory = useTradingStore((s) => s.tradeHistory);

 const { counts, maxCount } = useMemo(() => {
 const sellTrades = tradeHistory.filter(
 (t) => t.side === "sell" && t.realizedPnL !== 0,
 );
 const c = BUCKETS.map((bucket) => ({
 ...bucket,
 count: sellTrades.filter(
 (t) => t.realizedPnL >= bucket.min && t.realizedPnL < bucket.max,
 ).length,
 }));
 // Fix: last bucket should include its max
 c[c.length - 1].count = sellTrades.filter(
 (t) => t.realizedPnL >= 500,
 ).length;
 const m = Math.max(...c.map((b) => b.count), 1);
 return { counts: c, maxCount: m };
 }, [tradeHistory]);

 const hasTrades = counts.some((b) => b.count > 0);

 if (!hasTrades) {
 return (
 <div className="flex flex-col items-center gap-1.5 py-6 text-muted-foreground">
 <BarChart3 className="h-5 w-5 opacity-30" />
 <p className="text-[11px]">Complete sells to see P&L distribution</p>
 </div>
 );
 }

 return (
 <div className="flex items-end gap-1.5 h-28">
 {counts.map((bucket, i) => {
 const isNeg = i < 3;
 const pct = bucket.count > 0 ? (bucket.count / maxCount) * 100 : 0;
 return (
 <div
 key={bucket.label}
 className="flex flex-1 flex-col items-center gap-1"
 >
 <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">
 {bucket.count > 0 ? bucket.count : ""}
 </span>
 <div
 className={cn(
 "w-full rounded-t transition-colors",
 isNeg ? "bg-red-500/50" : "bg-emerald-500/50",
 )}
 style={{
 height: `${pct}%`,
 minHeight: bucket.count > 0 ? "4px" : "0px",
 }}
 />
 <span className="text-[7px] leading-tight text-center text-muted-foreground/60 whitespace-pre-line">
 {bucket.label}
 </span>
 </div>
 );
 })}
 </div>
 );
}
