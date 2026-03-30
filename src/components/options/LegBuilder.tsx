"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { StrategyLeg } from "@/types/options";
import { CONTRACT_MULTIPLIER } from "@/types/options";

interface LegBuilderProps {
 leg: StrategyLeg;
 index: number;
 onRemove: (index: number) => void;
}

export function LegBuilder({ leg, index, onRemove }: LegBuilderProps) {
 const isLong = leg.side === "buy";
 const cost = leg.price * leg.quantity * CONTRACT_MULTIPLIER;

 return (
 <motion.div
 className="rounded-lg border border-border/20 bg-card/30 p-2 flex items-center gap-2"
 initial={{ opacity: 0, x: -8 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: 8 }}
 layout
 >
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-1.5">
 {/* Buy/Sell pill */}
 <span
 className={cn(
 "rounded-full px-1.5 py-0.5 text-[8px] font-mono font-medium",
 isLong
 ? "bg-emerald-500/10 text-emerald-400/80"
 : "bg-rose-500/10 text-rose-400/80",
 )}
 >
 {leg.side.toUpperCase()}
 </span>
 <span className="text-[10px] font-mono tabular-nums text-muted-foreground/60">
 {leg.quantity}x
 </span>
 {/* Call/Put badge */}
 <span
 className={cn(
 "rounded-full px-1.5 py-0.5 text-[8px] font-mono font-medium",
 leg.type === "call"
 ? "bg-emerald-500/10 text-emerald-400/80"
 : "bg-rose-500/10 text-rose-400/80",
 )}
 >
 {leg.type.toUpperCase()}
 </span>
 {/* Strike */}
 <span className="text-[10px] font-mono tabular-nums font-medium">
 ${leg.strike}
 </span>
 </div>
 <div className="flex items-center gap-2 mt-0.5">
 {/* Expiry */}
 <span className="text-[10px] font-mono tabular-nums text-muted-foreground/50">
 {new Date(leg.expiry + "T12:00:00").toLocaleDateString("en-US", {
 month: "short",
 day: "numeric",
 })}
 </span>
 <span className="text-[10px] font-mono tabular-nums text-muted-foreground/50">@${leg.price.toFixed(2)}</span>
 <span className={cn("text-[10px] font-mono tabular-nums font-medium", isLong ? "text-rose-400/80" : "text-emerald-400/80")}>
 {isLong ? "-" : "+"}${cost.toFixed(0)}
 </span>
 </div>
 </div>
 <button
 onClick={() => onRemove(index)}
 className="rounded p-0.5 text-muted-foreground/40 hover:bg-rose-500/10 hover:text-rose-400 transition-colors text-base leading-none"
 >
 ×
 </button>
 </motion.div>
 );
}
