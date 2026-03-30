"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTradingStore } from "@/stores/trading-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { calculateATR } from "@/services/indicators";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { Badge } from "@/components/ui/badge";
import { X, Briefcase, ChevronDown, ChevronRight, ArrowDownLeft } from "lucide-react";
import { toast } from "sonner";

function PnLMilestoneBadge({ pct }: { pct: number }) {
 const milestone =
 pct >= 20 ? ""
 : pct >= 10 ? ""
 : pct >= 5 ? ""
 : pct <= -5 ? ""
 : null;

 return (
 <AnimatePresence>
 {milestone && (
 <motion.span
 key={milestone}
 initial={{ scale: 0, opacity: 0 }}
 animate={{ scale: [0, 1.3, 1], opacity: 1 }}
 exit={{ scale: 0, opacity: 0 }}
 transition={{ duration: 0.35, type: "tween" }}
 title={
 pct >= 20 ? "Diamond gain — exceptional!" :
 pct >= 10 ? "Rocket gain — excellent!" :
 pct >= 5 ? "On target — nice gain!" :
 "Down 5%+ — watch your stop"
 }
 className="ml-0.5 text-[11px] cursor-default"
 >
 {milestone}
 </motion.span>
 )}
 </AnimatePresence>
 );
}

export function PositionsTable() {
 const positions = useTradingStore((s) => s.positions);
 const placeSellOrder = useTradingStore((s) => s.placeSellOrder);
 const coverShortOrder = useTradingStore((s) => s.coverShortOrder);
 const borrowRates = useTradingStore((s) => s.borrowRates);
 const allData = useMarketDataStore((s) => s.allData);
 const revealedCount = useMarketDataStore((s) => s.revealedCount);

 const [expandedRow, setExpandedRow] = useState<string | null>(null);

 const currentBar =
 allData.length > 0 && revealedCount > 0
 ? allData[revealedCount - 1]
 : null;

 // Compute ATR(14) from visible bars
 const atrValue = useMemo(() => {
 const visibleData = allData.slice(0, revealedCount);
 if (visibleData.length < 15) return null;
 const pts = calculateATR(visibleData, 14);
 return pts.length > 0 ? pts[pts.length - 1].value : null;
 }, [allData, revealedCount]);

 // Bars held since entry per position
 const barsHeldMap = useMemo(() => {
 const visibleData = allData.slice(0, revealedCount);
 const map: Record<string, number> = {};
 for (const pos of positions) {
 if (pos.openedAtTimestamp) {
 map[`${pos.ticker}-${pos.side}`] = visibleData.filter(
 (b) => b.timestamp >= pos.openedAtTimestamp!,
 ).length;
 } else {
 map[`${pos.ticker}-${pos.side}`] = 0;
 }
 }
 return map;
 }, [allData, revealedCount, positions]);

 const handleClose = (
 ticker: string,
 quantity: number,
 price: number,
 side: "long" | "short",
 ) => {
 const simDate = currentBar?.timestamp ?? Date.now();
 const order =
 side === "long"
 ? placeSellOrder(ticker, quantity, price, simDate)
 : coverShortOrder(ticker, quantity, price, simDate);
 if (order) {
 toast.success(`Closed ${ticker} ${side} position`);
 }
 };

 if (positions.length === 0) {
 return (
 <div className="flex h-24 flex-col items-center justify-center gap-1.5">
 <Briefcase className="h-5 w-5 text-muted-foreground/40" />
 <span className="text-xs font-medium text-muted-foreground">
 No open positions
 </span>
 <span className="text-xs text-muted-foreground/60">
 Place a buy order to open your first position
 </span>
 </div>
 );
 }

 return (
 <div className="overflow-x-auto">
 <table className="w-full text-xs" role="table">
 <thead>
 <tr className="border-b border-border text-muted-foreground">
 <th scope="col" className="w-4 px-1 py-1.5" />
 <th scope="col" className="px-2 py-1.5 text-left font-medium whitespace-nowrap">Ticker</th>
 <th scope="col" className="px-2 py-1.5 text-right font-medium whitespace-nowrap">P&amp;L</th>
 <th scope="col" className="px-2 py-1.5 text-right font-medium whitespace-nowrap">ATR Stop</th>
 <th scope="col" className="px-2 py-1.5 text-right font-medium whitespace-nowrap">Dist%</th>
 <th scope="col" className="px-2 py-1.5 text-right font-medium whitespace-nowrap">Bars</th>
 <th scope="col" className="px-2 py-1.5 text-right font-medium whitespace-nowrap">Borrow</th>
 <th scope="col" className="w-8 px-1 py-1.5"><span className="sr-only">Actions</span></th>
 </tr>
 </thead>
 <tbody>
 {positions.map((pos, index) => {
 const rowKey = `${pos.ticker}-${pos.side}`;
 const isExpanded = expandedRow === rowKey;

 const rate = borrowRates[pos.ticker] ?? 1.0;
 const dailyBorrowCost =
 pos.side === "short"
 ? pos.quantity * pos.currentPrice * (rate / 100 / 365)
 : 0;

 // ATR trailing stop (2× ATR)
 const atrStop =
 atrValue !== null
 ? pos.side === "long"
 ? pos.currentPrice - atrValue * 2
 : pos.currentPrice + atrValue * 2
 : null;

 // Distance to stop as %
 const distToStop =
 atrStop !== null
 ? Math.abs(pos.currentPrice - atrStop) / pos.currentPrice * 100
 : null;

 // Row urgency based on distance to stop
 const urgencyRowClass =
 distToStop !== null && distToStop <= 1
 ? "bg-red-500/8"
 : distToStop !== null && distToStop <= 3
 ? "bg-amber-500/8"
 : "";

 const leftBorderClass =
 distToStop !== null && distToStop <= 1
 ? "border-l-[#ef4444]"
 : distToStop !== null && distToStop <= 3
 ? "border-l-amber-500"
 : pos.side === "long"
 ? "border-l-[#10b981]/40"
 : "border-l-[#a855f7]/40";

 const barsHeld = barsHeldMap[rowKey] ?? 0;

 return (
 <>
 <motion.tr
 key={rowKey}
 initial={{ opacity: 0, x: -8 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: 8 }}
 transition={{ delay: index * 0.05, duration: 0.2 }}
 className={cn(
 "border-b border-border hover:bg-muted/10 border-l-2 transition-colors duration-150",
 urgencyRowClass,
 leftBorderClass,
 isExpanded && "bg-muted/10",
 )}
 >
 {/* Expand toggle */}
 <td className="px-1 py-1.5">
 <button
 type="button"
 onClick={() => setExpandedRow(isExpanded ? null : rowKey)}
 className="text-muted-foreground hover:text-foreground"
 >
 {isExpanded
 ? <ChevronDown className="h-3 w-3" />
 : <ChevronRight className="h-3 w-3" />
 }
 </button>
 </td>

 {/* Ticker + side badge stacked */}
 <td className="px-2 py-1.5">
 <div className="font-semibold">{pos.ticker}</div>
 <Badge
 variant="outline"
 className={cn(
 "mt-0.5 px-1 py-0 text-[11px] inline-flex items-center gap-0.5",
 pos.side === "long"
 ? "border-profit/30 text-profit"
 : "border-short/30 text-short",
 )}
 >
 {pos.side === "short" && <ArrowDownLeft className="h-2 w-2" />}
 {pos.side.toUpperCase()}
 </Badge>
 </td>

 {/* P&L */}
 <td
 className={cn(
 "px-2 py-1.5 text-right tabular-nums",
 pos.unrealizedPnL >= 0 ? "text-profit" : "text-loss",
 )}
 >
 <div className="flex items-center justify-end gap-0.5">
 <AnimatedNumber
 value={pos.unrealizedPnL}
 format={(n) => formatCurrency(n)}
 />
 <PnLMilestoneBadge pct={pos.unrealizedPnLPercent} />
 </div>
 <div className="text-[11px]">
 {formatPercent(pos.unrealizedPnLPercent)}
 </div>
 </td>

 {/* ATR Stop */}
 <td className="px-2 py-1.5 text-right tabular-nums">
 {atrStop !== null ? (
 <span
 className={cn(
 "text-xs",
 distToStop !== null && distToStop <= 1
 ? "text-loss font-semibold"
 : distToStop !== null && distToStop <= 3
 ? "text-amber-500"
 : "text-muted-foreground",
 )}
 >
 {formatCurrency(atrStop)}
 </span>
 ) : (
 <span className="text-xs text-muted-foreground/40">—</span>
 )}
 </td>

 {/* Distance to stop */}
 <td className="px-2 py-1.5 text-right tabular-nums">
 {distToStop !== null ? (
 <span
 className={cn(
 "text-xs",
 distToStop <= 1
 ? "text-loss font-semibold"
 : distToStop <= 3
 ? "text-amber-500"
 : "text-muted-foreground",
 )}
 >
 {distToStop.toFixed(1)}%
 </span>
 ) : (
 <span className="text-xs text-muted-foreground/40">—</span>
 )}
 </td>

 {/* Bars held */}
 <td className="px-2 py-1.5 text-right tabular-nums">
 <span
 className={cn(
 "text-xs",
 barsHeld > 20 ? "text-primary font-semibold" : "text-muted-foreground",
 )}
 >
 {barsHeld > 0 ? barsHeld : "—"}
 </span>
 </td>

 {/* Borrow cost (shorts only) */}
 <td className="px-2 py-1.5 text-right tabular-nums">
 {pos.side === "short" ? (
 <span className="text-xs text-amber-500" title={`${rate.toFixed(2)}%/yr borrow rate`}>
 {formatCurrency(dailyBorrowCost)}/d
 </span>
 ) : (
 <span className="text-xs text-muted-foreground/40">—</span>
 )}
 </td>

 {/* Close button */}
 <td className="px-1 py-1.5">
 <motion.button
 type="button"
 onClick={() =>
 handleClose(
 pos.ticker,
 pos.quantity,
 pos.currentPrice,
 pos.side,
 )
 }
 whileTap={{ rotate: 90, scale: 0.8 }}
 transition={{ type: "spring", stiffness: 500, damping: 20 }}
 className="rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
 title={pos.side === "short" ? "Cover short" : "Close position"}
 >
 <X className="h-3 w-3" />
 </motion.button>
 </td>
 </motion.tr>

 {/* Expanded detail row */}
 <AnimatePresence>
 {isExpanded && (
 <motion.tr
 key={`${rowKey}-detail`}
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.15 }}
 >
 <td colSpan={8} className="px-3 pb-2 pt-0">
 <div className="rounded border border-border bg-accent/10 p-2 text-xs space-y-1">
 {/* Entry + current price */}
 <div className="flex gap-4 flex-wrap">
 <div>
 <span className="text-muted-foreground">Entry: </span>
 <span className="font-medium tabular-nums">
 {formatCurrency(pos.avgPrice)}
 </span>
 </div>
 <div>
 <span className="text-muted-foreground">Current: </span>
 <span className="font-medium tabular-nums">
 {formatCurrency(pos.currentPrice)}
 </span>
 </div>
 <div>
 <span className="text-muted-foreground">Qty: </span>
 <span className="font-medium">{pos.quantity}</span>
 </div>
 </div>

 {/* ATR detail */}
 {atrValue !== null && (
 <div className="flex gap-4 flex-wrap">
 <div>
 <span className="text-muted-foreground">ATR(14): </span>
 <span className="font-medium tabular-nums">
 {formatCurrency(atrValue)}
 </span>
 </div>
 {atrStop !== null && (
 <div>
 <span className="text-muted-foreground">ATR Stop 2×: </span>
 <span
 className={cn(
 "font-medium tabular-nums",
 distToStop !== null && distToStop <= 1
 ? "text-loss"
 : distToStop !== null && distToStop <= 3
 ? "text-amber-500"
 : "",
 )}
 >
 {formatCurrency(atrStop)}
 </span>
 {distToStop !== null && (
 <span className="text-muted-foreground ml-1">
 ({distToStop.toFixed(1)}% away)
 </span>
 )}
 </div>
 )}
 </div>
 )}

 {/* Entry reason */}
 {pos.entryReason ? (
 <div>
 <span className="text-muted-foreground">Entry reason: </span>
 <span className="text-foreground/80">{pos.entryReason}</span>
 </div>
 ) : (
 <div className="text-muted-foreground/50 italic">
 No entry reason recorded — use AI Coach before trading for setup insights
 </div>
 )}

 {/* Time in trade */}
 <div>
 <span className="text-muted-foreground">Time in trade: </span>
 <span
 className={cn(
 "font-medium",
 barsHeld > 20 ? "text-primary" : "",
 )}
 >
 {barsHeld > 0 ? `${barsHeld} bars` : "Just opened"}
 </span>
 {barsHeld > 20 && (
 <span className="text-muted-foreground ml-1">
 — consider re-evaluating thesis
 </span>
 )}
 </div>
 </div>
 </td>
 </motion.tr>
 )}
 </AnimatePresence>
 </>
 );
 })}
 </tbody>
 </table>
 </div>
 );
}
