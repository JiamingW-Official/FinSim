"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
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
      className={cn(
        "flex items-center gap-2 rounded-lg border px-2.5 py-1.5",
        isLong
          ? "border-emerald-500/20 bg-emerald-500/5"
          : "border-red-500/20 bg-red-500/5",
      )}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      layout
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "text-[11px] font-bold uppercase",
              isLong ? "text-emerald-400" : "text-red-400",
            )}
          >
            {leg.side}
          </span>
          <span className="text-xs font-bold">
            {leg.quantity}x
          </span>
          <span
            className={cn(
              "text-xs font-semibold",
              leg.type === "call" ? "text-emerald-400" : "text-red-400",
            )}
          >
            ${leg.strike} {leg.type.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>
            {new Date(leg.expiry + "T12:00:00").toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
          <span>@${leg.price.toFixed(2)}</span>
          <span className={cn("font-bold", isLong ? "text-red-400" : "text-emerald-400")}>
            {isLong ? "-" : "+"}${cost.toFixed(0)}
          </span>
        </div>
      </div>
      <button
        onClick={() => onRemove(index)}
        className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <X className="h-3 w-3" />
      </button>
    </motion.div>
  );
}
