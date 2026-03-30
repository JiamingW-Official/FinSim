"use client";

import { AnimatePresence } from "framer-motion";
import { useOptionsStore } from "@/stores/options-store";
import { useTradingStore } from "@/stores/trading-store";
import { LegBuilder } from "./LegBuilder";
import { GreeksPanel } from "./GreeksPanel";
import { CONTRACT_MULTIPLIER, type ChainAnalytics } from "@/types/options";
import { calculateOptionFees } from "@/services/options/fees";
import { computeProbabilityOfProfit } from "@/services/options/analytics";
import { calculateBreakevens, calculateMaxProfitLoss } from "@/services/options/payoff";
import { formatCurrency, cn } from "@/lib/utils";
import { Activity, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

// Suppress unused import warning — CONTRACT_MULTIPLIER used indirectly via store
void CONTRACT_MULTIPLIER;

interface OptionsOrderEntryProps {
 spotPrice: number;
 analytics?: ChainAnalytics;
}

export function OptionsOrderEntry({ spotPrice, analytics }: OptionsOrderEntryProps) {
 const selectedLegs = useOptionsStore((s) => s.selectedLegs);
 const activeStrategy = useOptionsStore((s) => s.activeStrategy);
 const removeLeg = useOptionsStore((s) => s.removeLeg);
 const clearLegs = useOptionsStore((s) => s.clearLegs);
 const executeOptionsTrade = useOptionsStore((s) => s.executeOptionsTrade);
 const getNetDebit = useOptionsStore((s) => s.getNetDebit);
 const getTotalGreeks = useOptionsStore((s) => s.getTotalGreeks);
 const chainData = useOptionsStore((s) => s.chainData);
 const selectedExpiry = useOptionsStore((s) => s.selectedExpiry);
 const cash = useTradingStore((s) => s.cash);
 const deductCash = useTradingStore((s) => s.deductCash);
 const addCash = useTradingStore((s) => s.addCash);

 const netDebit = selectedLegs.length > 0 ? getNetDebit() : 0;
 const totalGreeks = selectedLegs.length > 0 ? getTotalGreeks() : null;
 const totalContracts = selectedLegs.reduce((sum, l) => sum + l.quantity, 0);
 const { commission } = calculateOptionFees(totalContracts);
 const totalCost = netDebit + commission;
 const isDebit = netDebit > 0;
 const canAfford = !isDebit || totalCost <= cash;

 // Analytics derived values
 const frontExpiry = chainData.find((c) => c.expiry === selectedExpiry) ?? chainData[0];
 const dte = frontExpiry?.daysToExpiry ?? 30;
 const atmIV = analytics?.atmIV ?? 0.3;

 const pop =
 selectedLegs.length > 0 && spotPrice > 0
 ? computeProbabilityOfProfit(selectedLegs, spotPrice, atmIV, dte)
 : null;

 const breakevens =
 selectedLegs.length > 0 && spotPrice > 0
 ? calculateBreakevens(selectedLegs, spotPrice)
 : [];

 const { maxProfit, maxLoss } =
 selectedLegs.length > 0 && spotPrice > 0
 ? calculateMaxProfitLoss(selectedLegs, spotPrice)
 : { maxProfit: 0 as number | "unlimited", maxLoss: 0 as number | "unlimited" };

 const rorDisplay =
 maxProfit === "unlimited" || maxLoss === "unlimited"
 ? "∞ : 1"
 : typeof maxProfit === "number" && typeof maxLoss === "number" && maxLoss !== 0
 ? `${(maxProfit / Math.abs(maxLoss)).toFixed(1)} : 1`
 : "—";

 const handleExecute = () => {
 const simDate = Date.now();
 const result = executeOptionsTrade(cash, simDate);
 if (!result.success) {
 toast.error("Insufficient funds for this trade");
 return;
 }

 if (result.debit > 0) {
 deductCash(result.debit);
 } else {
 addCash(-result.debit);
 }

 try {
 const { useGameStore } = require("@/stores/game-store");
 useGameStore.getState().recordOptionsTrade(
 0,
 result.position?.ticker ?? "",
 activeStrategy ?? "Custom",
 selectedLegs.length,
 );
 } catch {
 /* game store not loaded */
 }

 toast.success(`${activeStrategy ?? "Custom"} position opened`, {
 description: `${isDebit ? "Debit" : "Credit"}: ${formatCurrency(Math.abs(netDebit))}`,
 });
 };

 return (
 <div className="flex flex-col p-3 gap-3">
 {/* Header */}
 <div className="flex items-center gap-1.5">
 <Activity className="h-3.5 w-3.5 text-muted-foreground" />
 <span className="text-xs font-medium">Order Entry</span>
 </div>

 {/* Strategy name */}
 {activeStrategy && (
 <div className="rounded-md bg-muted/50 px-2 py-1 text-center text-xs font-medium text-foreground">
 {activeStrategy}
 </div>
 )}

 {/* Legs list */}
 <div className="space-y-1.5">
 <AnimatePresence mode="popLayout">
 {selectedLegs.map((leg, i) => (
 <LegBuilder
 key={`${leg.type}-${leg.strike}-${leg.side}-${i}`}
 leg={leg}
 index={i}
 onRemove={removeLeg}
 />
 ))}
 </AnimatePresence>
 </div>

 {selectedLegs.length === 0 && (
 <div className="flex flex-col items-center gap-1 py-6 text-muted-foreground">
 <Activity className="h-5 w-5 opacity-30" />
 <p className="text-xs">No legs selected</p>
 <p className="text-[11px] opacity-60">Click any contract in the chain to add legs</p>
 </div>
 )}

 {selectedLegs.length > 0 && (
 <>
 {/* Probability of Profit & Risk Stats */}
 {pop !== null && (
 <div className="border border-border p-2 space-y-1.5">
 <div className="flex items-center justify-between text-xs">
 <span className="text-muted-foreground font-medium">Prob of Profit</span>
 <span
 className={cn(
 "font-semibold",
 pop > 50 ? "text-emerald-400" : pop < 40 ? "text-red-400" : "text-amber-400",
 )}
 >
 {pop.toFixed(0)}%
 </span>
 </div>
 <div className="w-full h-1 bg-muted/30 rounded overflow-hidden">
 <div
 className={cn(
 "h-full rounded transition-colors",
 pop > 50 ? "bg-emerald-500" : pop < 40 ? "bg-red-500" : "bg-amber-500",
 )}
 style={{ width: `${Math.min(100, Math.max(0, pop))}%` }}
 />
 </div>
 <div className="flex items-center justify-between text-xs">
 <span className="text-muted-foreground font-medium">Risk / Reward</span>
 <span className="font-semibold text-foreground">{rorDisplay}</span>
 </div>
 {breakevens.length > 0 && (
 <div className="flex flex-wrap items-center gap-1">
 <span className="text-[11px] text-muted-foreground">BE:</span>
 {breakevens.map((be) => (
 <span
 key={be}
 className="text-[11px] font-semibold bg-muted/30 rounded px-1 py-0.5 text-foreground"
 >
 ${be.toFixed(2)}
 </span>
 ))}
 </div>
 )}
 </div>
 )}

 {/* Greeks */}
 {totalGreeks && <GreeksPanel greeks={totalGreeks} />}

 {/* Cost summary */}
 <div className="space-y-1 border border-border p-2.5">
 <div className="flex items-center justify-between text-xs">
 <span className="text-muted-foreground">
 {isDebit ? "Net Debit" : "Net Credit"}
 </span>
 <span
 className={cn("font-semibold", isDebit ? "text-red-400" : "text-emerald-400")}
 >
 {formatCurrency(Math.abs(netDebit))}
 </span>
 </div>
 <div className="flex items-center justify-between text-xs">
 <span className="text-muted-foreground">Commission</span>
 <span className="text-muted-foreground font-medium">
 {formatCurrency(commission)}
 </span>
 </div>
 <div className="border-t border-border" />
 <div className="flex items-center justify-between text-[11px]">
 <span className="font-medium">Total</span>
 <span
 className={cn(
 "font-semibold",
 totalCost > 0 ? "text-red-400" : "text-emerald-400",
 )}
 >
 {totalCost > 0 ? "-" : "+"}
 {formatCurrency(Math.abs(totalCost))}
 </span>
 </div>
 </div>

 {/* Cash check */}
 {!canAfford && (
 <div className="flex items-center gap-1.5 rounded-md bg-red-500/5 px-2 py-1.5 text-xs text-red-400">
 <AlertTriangle className="h-3 w-3" />
 Insufficient funds ({formatCurrency(cash)} available)
 </div>
 )}

 {/* Action buttons */}
 <div className="flex gap-2">
 <button
 onClick={clearLegs}
 className="flex items-center gap-1 border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/30"
 >
 <Trash2 className="h-3 w-3" />
 Clear
 </button>
 <button
 onClick={handleExecute}
 disabled={!canAfford}
 className={cn(
 "flex-1 px-3 py-2 text-xs font-medium transition-colors",
 canAfford
 ? "bg-foreground text-background hover:bg-foreground/90"
 : "cursor-not-allowed bg-muted text-muted-foreground/50",
 )}
 >
 Execute Trade
 </button>
 </div>
 </>
 )}
 </div>
 );
}
