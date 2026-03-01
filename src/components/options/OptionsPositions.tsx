"use client";

import { motion } from "framer-motion";
import { useOptionsStore } from "@/stores/options-store";
import { useTradingStore } from "@/stores/trading-store";
import { formatCurrency, cn } from "@/lib/utils";
import { X, Activity } from "lucide-react";
import { toast } from "sonner";
import type { OptionChainExpiry } from "@/types/options";

interface OptionsPositionsProps {
  chain: OptionChainExpiry[];
}

export function OptionsPositions({ chain }: OptionsPositionsProps) {
  const positions = useOptionsStore((s) => s.positions);
  const closePosition = useOptionsStore((s) => s.closePosition);
  const addCash = useTradingStore((s) => s.addCash);
  const deductCash = useTradingStore((s) => s.deductCash);

  const handleClose = (positionId: string) => {
    const simDate = Date.now();
    const result = closePosition(positionId, chain, simDate);
    if (!result.success) {
      toast.error("Failed to close position");
      return;
    }

    if (result.pnl > 0) {
      addCash(result.pnl);
    } else if (result.pnl < 0) {
      deductCash(-result.pnl);
    }

    toast.success("Position closed", {
      description: `P&L: ${result.pnl >= 0 ? "+" : ""}${formatCurrency(result.pnl)}`,
    });
  };

  if (positions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1.5 py-6 text-muted-foreground">
        <Activity className="h-5 w-5 opacity-30" />
        <p className="text-[11px]">No open options positions</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/50">
      {positions.map((pos) => (
        <motion.div
          key={pos.id}
          className="flex items-center justify-between px-3 py-2 hover:bg-accent/20"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold">{pos.ticker}</span>
                <span className="text-[9px] font-bold text-orange-400">
                  {pos.strategyName}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                {pos.legs.map((leg, i) => (
                  <span key={i}>
                    {leg.side === "buy" ? "+" : "-"}
                    {leg.quantity}{" "}
                    <span
                      className={
                        leg.type === "call"
                          ? "text-emerald-400"
                          : "text-red-400"
                      }
                    >
                      ${leg.strike}
                      {leg.type[0].toUpperCase()}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Greeks summary */}
            <div className="hidden md:flex items-center gap-2 text-[9px] text-muted-foreground">
              <span>
                <span className="text-blue-400">D</span>{" "}
                {pos.totalGreeks.delta.toFixed(2)}
              </span>
              <span>
                <span className="text-red-400">T</span>{" "}
                {pos.totalGreeks.theta.toFixed(2)}
              </span>
            </div>

            {/* P&L */}
            <div className="text-right">
              <div
                className={cn(
                  "text-[11px] font-black tabular-nums",
                  pos.unrealizedPnL >= 0
                    ? "text-emerald-400"
                    : "text-red-400",
                )}
              >
                {pos.unrealizedPnL >= 0 ? "+" : ""}
                {formatCurrency(pos.unrealizedPnL)}
              </div>
              <div
                className={cn(
                  "text-[9px] font-bold tabular-nums",
                  pos.unrealizedPnLPercent >= 0
                    ? "text-emerald-400/70"
                    : "text-red-400/70",
                )}
              >
                {pos.unrealizedPnLPercent >= 0 ? "+" : ""}
                {pos.unrealizedPnLPercent.toFixed(1)}%
              </div>
            </div>

            {/* Close button */}
            <motion.button
              onClick={() => handleClose(pos.id)}
              className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Close position"
            >
              <X className="h-3.5 w-3.5" />
            </motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
