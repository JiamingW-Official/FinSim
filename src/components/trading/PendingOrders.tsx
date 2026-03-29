"use client";

import { useTradingStore } from "@/stores/trading-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { formatCurrency, cn } from "@/lib/utils";
import { X, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function PendingOrders() {
  const pendingOrders = useTradingStore((s) => s.pendingOrders);
  const cancelPendingOrder = useTradingStore((s) => s.cancelPendingOrder);
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);

  const currentPrice =
    allData.length > 0 && revealedCount > 0
      ? allData[revealedCount - 1].close
      : null;

  if (pendingOrders.length === 0) {
    return (
      <div className="flex h-24 flex-col items-center justify-center gap-1.5">
        <Clock className="h-5 w-5 text-muted-foreground/40" />
        <span className="text-xs font-medium text-muted-foreground">
          No pending orders
        </span>
        <span className="text-xs text-muted-foreground/60">
          Set limit, stop-loss, or take-profit orders
        </span>
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border/40 text-muted-foreground">
            <th className="px-2 py-1.5 text-left font-medium">Ticker</th>
            <th className="px-2 py-1.5 text-center font-medium">Type</th>
            <th className="px-2 py-1.5 text-center font-medium">Side</th>
            <th className="px-2 py-1.5 text-right font-medium">Qty</th>
            <th className="px-2 py-1.5 text-right font-medium">Price</th>
            <th className="px-2 py-1.5 text-right font-medium">Dist.</th>
            <th className="w-8 px-1 py-1.5"></th>
          </tr>
        </thead>
        <tbody>
          {pendingOrders.map((order) => {
            const triggerPrice =
              order.limitPrice ?? order.stopPrice ?? order.takeProfitPrice ?? 0;

            // Proximity calculation
            let proximityPct: number | null = null;
            if (currentPrice && triggerPrice > 0) {
              proximityPct =
                Math.abs(currentPrice - triggerPrice) / currentPrice * 100;
            }

            const isVeryNear = proximityPct !== null && proximityPct < 0.5;
            const isNear = proximityPct !== null && proximityPct < 2;

            return (
              <tr
                key={order.id}
                className={cn(
                  "border-b border-border/50 border-l-2 border-l-amber-500/40 transition-colors duration-150 hover:bg-muted/10",
                  isVeryNear && "bg-red-500/5",
                )}
              >
                <td className="px-2 py-1.5 font-semibold">{order.ticker}</td>
                <td className="px-2 py-1.5 text-center">
                  <Badge
                    variant="outline"
                    className="border-yellow-500/30 px-1.5 py-0 text-xs text-yellow-500"
                  >
                    <Clock className="mr-0.5 h-2.5 w-2.5" />
                    {order.type.replace("_", " ").toUpperCase()}
                  </Badge>
                </td>
                <td className="px-2 py-1.5 text-center">
                  <Badge
                    variant="outline"
                    className={cn(
                      "px-1.5 py-0 text-xs",
                      order.side === "buy"
                        ? "border-profit/30 text-profit"
                        : "border-loss/30 text-loss",
                    )}
                  >
                    {order.side.toUpperCase()}
                  </Badge>
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums">
                  {order.quantity}
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums">
                  {formatCurrency(triggerPrice)}
                </td>
                <td className="px-2 py-1.5 text-right">
                  {proximityPct !== null && isNear ? (
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-xs font-medium tabular-nums",
                        isVeryNear
                          ? "bg-red-500/15 text-red-400 proximity-pulse"
                          : "bg-amber-500/15 text-amber-400",
                      )}
                    >
                      {isVeryNear && <AlertTriangle className="h-2.5 w-2.5" />}
                      {proximityPct.toFixed(1)}%
                    </span>
                  ) : proximityPct !== null ? (
                    <span className="text-xs tabular-nums text-muted-foreground/50">
                      {proximityPct.toFixed(1)}%
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-1 py-1.5">
                  <button
                    type="button"
                    onClick={() => cancelPendingOrder(order.id)}
                    className="rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    title="Cancel order"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
