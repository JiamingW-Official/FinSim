"use client";

import { useTradingStore } from "@/stores/trading-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

export function PendingOrders() {
  const pendingOrders = useTradingStore((s) => s.pendingOrders);
  const cancelPendingOrder = useTradingStore((s) => s.cancelPendingOrder);
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);

  const currentPrice =
    allData.length > 0 && revealedCount > 0
      ? allData[revealedCount - 1].close
      : null;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/20 shrink-0">
        <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/30">
          Pending Orders ({pendingOrders.length})
        </span>
      </div>

      {/* Empty state */}
      {pendingOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-16 gap-1">
          <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/25">
            No pending orders
          </span>
        </div>
      ) : (
        <div className="overflow-auto">
          {pendingOrders.map((order) => {
            const triggerPrice =
              order.limitPrice ?? order.stopPrice ?? order.takeProfitPrice ?? 0;

            let proximityPct: number | null = null;
            if (currentPrice && triggerPrice > 0) {
              proximityPct =
                Math.abs(currentPrice - triggerPrice) / currentPrice * 100;
            }

            const isVeryNear = proximityPct !== null && proximityPct < 0.5;
            const isNear = proximityPct !== null && proximityPct < 2;

            // Compact order type chip label
            const typeMap: Record<string, string> = {
              market: "MKT",
              limit: "LMT",
              stop: "SL",
              stop_limit: "SL",
              take_profit: "TP",
            };
            const typeLabel = typeMap[order.type] ?? order.type.replace("_", "").toUpperCase().slice(0, 3);

            return (
              <div
                key={order.id}
                className={cn(
                  "flex items-center px-2 py-2 border-b border-border/10 gap-2 transition-colors hover:bg-muted/5",
                  isVeryNear && "bg-rose-500/5",
                )}
              >
                {/* Ticker — prominent */}
                <span className="text-[11px] font-mono font-semibold text-foreground/80 w-10 shrink-0">
                  {order.ticker}
                </span>

                {/* Order type chip */}
                <span className="text-[8px] font-mono uppercase tracking-wider px-1 py-0.5 rounded bg-muted/20 text-muted-foreground/50 shrink-0">
                  {typeLabel}
                </span>

                {/* Side chip */}
                <span
                  className={cn(
                    "text-[8px] font-mono uppercase px-1 py-0.5 rounded shrink-0",
                    order.side === "buy"
                      ? "text-emerald-400/70 bg-emerald-500/10"
                      : "text-rose-400/70 bg-rose-500/10",
                  )}
                >
                  {order.side}
                </span>

                {/* Qty × Price */}
                <span className="flex-1 text-[10px] font-mono tabular-nums text-muted-foreground/60 truncate">
                  {order.quantity} × ${triggerPrice > 0 ? triggerPrice.toFixed(2) : "MKT"}
                </span>

                {/* Proximity indicator */}
                {proximityPct !== null && isNear && (
                  <span
                    className={cn(
                      "flex items-center gap-0.5 text-[8px] font-mono tabular-nums shrink-0",
                      isVeryNear ? "text-rose-400/80" : "text-amber-400/70",
                    )}
                  >
                    {isVeryNear && <AlertTriangle className="h-2 w-2" />}
                    {proximityPct.toFixed(1)}%
                  </span>
                )}
                {proximityPct !== null && !isNear && (
                  <span className="text-[8px] font-mono tabular-nums text-muted-foreground/30 shrink-0">
                    {proximityPct.toFixed(1)}%
                  </span>
                )}

                {/* Cancel — × in rose on hover */}
                <button
                  type="button"
                  onClick={() => cancelPendingOrder(order.id)}
                  className="text-[12px] font-mono text-muted-foreground/25 hover:text-rose-400 transition-colors shrink-0 leading-none px-0.5"
                  title="Cancel order"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
