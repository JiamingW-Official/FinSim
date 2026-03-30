"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTradingStore } from "@/stores/trading-store";
import { formatCurrency, cn } from "@/lib/utils";
import { AlertTriangle, TrendingDown, DollarSign, BarChart2 } from "lucide-react";

/**
 * MarginPanel — displays margin account metrics for short positions.
 *
 * - Buying power = 2× account equity (50% margin requirement)
 * - Margin used = current market value of all short positions
 * - Margin call when equity falls below 25% of short notional
 * - Daily interest accrual on borrowed notional
 */
export function MarginPanel() {
 const cash = useTradingStore((s) => s.cash);
 const positions = useTradingStore((s) => s.positions);
 const portfolioValue = useTradingStore((s) => s.portfolioValue);
 const marginUsed = useTradingStore((s) => s.marginUsed);
 const marginLimit = useTradingStore((s) => s.marginLimit);
 const borrowRates = useTradingStore((s) => s.borrowRates);
 const updateMarginMetrics = useTradingStore((s) => s.updateMarginMetrics);
 const accrueMarginInterest = useTradingStore((s) => s.accrueMarginInterest);

 const shortPositions = positions.filter((p) => p.side === "short");

 // Recompute margin metrics whenever positions change
 useEffect(() => {
 updateMarginMetrics();
 }, [positions, updateMarginMetrics]);

 if (shortPositions.length === 0) return null;

 // Buying power = 2× equity
 const equity = portfolioValue;
 const buyingPower = equity * 2;

 // Margin utilisation %
 const marginPct = marginLimit > 0 ? (marginUsed / marginLimit) * 100 : 0;

 // Margin call threshold: equity < 25% of borrowed notional
 const shortNotional = shortPositions.reduce(
 (s, p) => s + p.quantity * p.currentPrice,
 0,
 );
 const maintenanceRequirement = shortNotional * 0.25;
 const isMarginCall = equity < maintenanceRequirement && shortNotional > 0;
 const isMarginWarning = !isMarginCall && equity < maintenanceRequirement * 1.5;

 // Total daily interest across all short positions
 const totalDailyInterest = shortPositions.reduce((sum, p) => {
 const rate = borrowRates[p.ticker] ?? 1.0;
 return sum + p.quantity * p.currentPrice * (rate / 100 / 365);
 }, 0);

 const barColor =
 isMarginCall
 ? "#ef4444"
 : isMarginWarning
 ? "#f59e0b"
 : marginPct > 60
 ? "#f59e0b"
 : "#10b981";

 return (
 <div
 className={cn(
 "rounded-md border p-3 space-y-2.5",
 isMarginCall
 ? "border-loss/50 bg-loss/5"
 : "border-border bg-muted/20",
 )}
 >
 {/* Header */}
 <div className="flex items-center justify-between">
 <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
 <BarChart2 className="h-3.5 w-3.5" />
 Margin Account
 </span>
 {isMarginCall && (
 <AnimatePresence>
 <motion.span
 initial={{ scale: 0.8, opacity: 0 }}
 animate={{ scale: [1, 1.05, 1], opacity: 1 }}
 transition={{ repeat: Infinity, duration: 1.2 }}
 className="rounded bg-loss px-1.5 py-0.5 text-xs font-semibold text-foreground"
 >
 MARGIN CALL!
 </motion.span>
 </AnimatePresence>
 )}
 {isMarginWarning && !isMarginCall && (
 <span className="rounded bg-warning/20 px-1.5 py-0.5 text-xs font-semibold text-warning">
 WARNING
 </span>
 )}
 </div>

 {/* Margin call explanation */}
 {isMarginCall && (
 <div className="flex items-start gap-1.5 rounded-md bg-loss/10 px-2 py-1.5 text-xs text-loss">
 <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
 <span>
 Equity ({formatCurrency(equity)}) is below 25% maintenance requirement ({formatCurrency(maintenanceRequirement)}).
 Cover short positions to restore margin.
 </span>
 </div>
 )}

 {/* Key metrics */}
 <div className="space-y-1.5 text-xs">
 <div className="flex items-center justify-between">
 <span className="flex items-center gap-1 text-muted-foreground">
 <DollarSign className="h-3 w-3" />
 Account Equity
 </span>
 <span className={cn("tabular-nums font-medium", equity < 0 ? "text-loss" : "")}>
 {formatCurrency(equity)}
 </span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-muted-foreground">Buying Power (2×)</span>
 <span className="tabular-nums font-medium">{formatCurrency(buyingPower)}</span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-muted-foreground">Margin Used</span>
 <span className="tabular-nums font-medium">{formatCurrency(marginUsed)}</span>
 </div>
 <div className="flex items-center justify-between">
 <span className="flex items-center gap-1 text-muted-foreground">
 <TrendingDown className="h-3 w-3" />
 Short Notional
 </span>
 <span className="tabular-nums font-medium text-short">{formatCurrency(shortNotional)}</span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-muted-foreground">Maint. Requirement</span>
 <span
 className={cn(
 "tabular-nums font-medium",
 isMarginCall ? "text-loss" : "text-muted-foreground",
 )}
 >
 {formatCurrency(maintenanceRequirement)}
 </span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-muted-foreground">Daily Borrow Interest</span>
 <span className="tabular-nums text-warning">
 {formatCurrency(totalDailyInterest)}/day
 </span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-muted-foreground">Cash Available</span>
 <span className="tabular-nums font-medium">{formatCurrency(cash)}</span>
 </div>
 </div>

 {/* Margin utilisation bar */}
 <div>
 <div className="mb-1 flex items-center justify-between text-xs">
 <span className="text-muted-foreground">Margin Utilisation</span>
 <span
 className="tabular-nums font-semibold"
 style={{ color: barColor }}
 >
 {marginPct.toFixed(1)}%
 </span>
 </div>
 <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
 <motion.div
 className="h-full rounded-full"
 style={{ background: barColor }}
 initial={{ width: 0 }}
 animate={{ width: `${Math.min(100, marginPct)}%` }}
 transition={{ duration: 0.4, ease: "easeOut" }}
 />
 </div>
 <div className="mt-0.5 flex justify-between text-[11px] text-muted-foreground/60">
 <span>0%</span>
 <span className="text-warning">Warning 60%</span>
 <span className="text-loss">Limit 100%</span>
 </div>
 </div>

 {/* Per-position borrow rates */}
 {shortPositions.length > 0 && (
 <div className="space-y-1">
 <div className="text-xs font-medium text-muted-foreground">Short Positions — Borrow Rates</div>
 {shortPositions.map((p) => {
 const rate = borrowRates[p.ticker] ?? 1.0;
 const dailyCost = p.quantity * p.currentPrice * (rate / 100 / 365);
 return (
 <div
 key={`${p.ticker}-short`}
 className="flex items-center justify-between rounded bg-muted/40 px-2 py-1 text-xs"
 >
 <span className="font-semibold text-short">{p.ticker}</span>
 <span className="text-muted-foreground">{p.quantity} sh</span>
 <span className="tabular-nums text-warning">{rate.toFixed(2)}%/yr</span>
 <span className="tabular-nums text-muted-foreground">
 {formatCurrency(dailyCost)}/day
 </span>
 </div>
 );
 })}
 </div>
 )}

 {/* Accrue interest button (manual for simulation) */}
 <button
 type="button"
 onClick={accrueMarginInterest}
 className="w-full rounded border border-border py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
 >
 Accrue 1 Day Interest ({formatCurrency(totalDailyInterest)})
 </button>
 </div>
 );
}
