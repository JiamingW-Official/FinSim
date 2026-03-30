"use client";

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
        <p className="text-[10px] font-mono">No open options positions</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-10 bg-card">
          <tr className="border-b border-border/20">
            {["Position", "Legs", "Delta", "Theta", "P&L", ""].map((h, i) => (
              <th
                key={`${h}-${i}`}
                className={cn(
                  "px-3 py-1.5 text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground/35 font-medium",
                  i >= 2 ? "text-right" : "text-left",
                  i === 5 ? "w-8" : "",
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {positions.map((pos) => (
            <tr
              key={pos.id}
              className="border-b border-border/20 hover:bg-muted/10 transition-colors"
            >
              {/* Position name */}
              <td className="px-3 py-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-mono font-medium">{pos.ticker}</span>
                  <span className="text-[9px] font-mono text-orange-400">{pos.strategyName}</span>
                </div>
              </td>

              {/* Legs */}
              <td className="px-3 py-2">
                <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                  {pos.legs.map((leg, i) => (
                    <span key={i} className="text-[9px] font-mono text-muted-foreground">
                      {leg.side === "buy" ? "+" : "-"}{leg.quantity}{" "}
                      <span className={leg.type === "call" ? "text-emerald-500" : "text-red-500"}>
                        ${leg.strike}{leg.type[0].toUpperCase()}
                      </span>
                    </span>
                  ))}
                </div>
              </td>

              {/* Delta */}
              <td className="px-3 py-2 text-right">
                <span className="text-[10px] font-mono tabular-nums text-muted-foreground">
                  {pos.totalGreeks.delta.toFixed(2)}
                </span>
              </td>

              {/* Theta */}
              <td className="px-3 py-2 text-right">
                <span className="text-[10px] font-mono tabular-nums text-red-400/70">
                  {pos.totalGreeks.theta.toFixed(2)}
                </span>
              </td>

              {/* P&L */}
              <td className="px-3 py-2 text-right">
                <div className="flex flex-col items-end gap-0.5">
                  <span
                    className={cn(
                      "text-[10px] font-mono tabular-nums font-medium",
                      pos.unrealizedPnL >= 0 ? "text-emerald-400" : "text-red-400",
                    )}
                  >
                    {pos.unrealizedPnL >= 0 ? "+" : ""}
                    {formatCurrency(pos.unrealizedPnL)}
                  </span>
                  <span
                    className={cn(
                      "text-[9px] font-mono tabular-nums",
                      pos.unrealizedPnLPercent >= 0 ? "text-emerald-400/60" : "text-red-400/60",
                    )}
                  >
                    {pos.unrealizedPnLPercent >= 0 ? "+" : ""}
                    {pos.unrealizedPnLPercent.toFixed(1)}%
                  </span>
                </div>
              </td>

              {/* Close button */}
              <td className="px-3 py-2">
                <button
                  onClick={() => handleClose(pos.id)}
                  className="rounded p-1 text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive transition-colors"
                  title="Close position"
                >
                  <X className="h-3 w-3" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
