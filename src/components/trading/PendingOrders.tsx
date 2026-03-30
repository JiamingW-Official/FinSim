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
          Pending Orders
        </span>
        <span className="text-[9px] font-mono text-muted-foreground/30 tabular-nums">
          {pendingOrders.length}
        </span>
      </div>

      {/* Empty state */}
      {pendingOrders.length === 0 ? (
        <div className="flex items-center justify-center h-16">
          <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/25">
            No Pending Orders
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

            const typeLabel = order.type.replace("_", " ").toUpperCase();

            return (
              <div
                key={order.id}
                className={cn(
                  "flex items-center px-2 py-1.5 border-b border-border/10 gap-2 text-[10px] font-mono transition-colors hover:bg-muted/5",
                  isVeryNear && "bg-rose-500/5",
                )}
              >
                {/* Ticker */}
                <span className="font-semibold text-foreground/80 w-10 shrink-0">
                  {order.ticker}
                </span>

                {/* Order type */}
                <span className="text-muted-foreground/40 text-[8px] uppercase shrink-0">
                  {typeLabel}
                </span>

                {/* Side */}
                <span
                  className={cn(
                    "text-[8px] uppercase px-1 py-0.5 rounded shrink-0",
                    order.side === "buy"
                      ? "text-emerald-400/70 bg-emerald-500/10"
                      : "text-rose-400/70 bg-rose-500/10",
                  )}
                >
                  {order.side}
                </span>

                {/* Qty × Price */}
                <span className="flex-1 text-muted-foreground/60 tabular-nums truncate">
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

                {/* Cancel */}
                <button
                  type="button"
                  onClick={() => cancelPendingOrder(order.id)}
                  className="text-[10px] font-mono text-muted-foreground/25 hover:text-rose-400/70 transition-colors shrink-0 leading-none"
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
