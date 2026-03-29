"use client";

import { useTradingStore } from "@/stores/trading-store";
import { formatCurrency, formatShortDate, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";

export function TradeHistory() {
  const tradeHistory = useTradingStore((s) => s.tradeHistory);

  if (tradeHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BarChart3 className="h-8 w-8 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">No trades yet</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Place your first practice trade to see history here</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto max-h-64">
      <table className="w-full text-[11px]" role="table">
        <thead className="sticky top-0 z-10 bg-card">
          <tr className="border-b border-border/20">
            <th scope="col" className="px-3 py-2 text-left text-[11px] font-medium text-muted-foreground whitespace-nowrap">Date</th>
            <th scope="col" className="px-3 py-2 text-left text-[11px] font-medium text-muted-foreground whitespace-nowrap">Ticker</th>
            <th scope="col" className="px-3 py-2 text-center text-[11px] font-medium text-muted-foreground whitespace-nowrap">Side</th>
            <th scope="col" className="px-3 py-2 text-right text-[11px] font-medium text-muted-foreground whitespace-nowrap">Qty</th>
            <th scope="col" className="px-3 py-2 text-right text-[11px] font-medium text-muted-foreground whitespace-nowrap">Price</th>
            <th scope="col" className="px-3 py-2 text-right text-[11px] font-medium text-muted-foreground whitespace-nowrap">Fees</th>
            <th scope="col" className="px-3 py-2 text-right text-[11px] font-medium text-muted-foreground whitespace-nowrap">Net P&amp;L</th>
          </tr>
        </thead>
        <tbody>
          {tradeHistory.slice(0, 50).map((trade) => (
            <tr
              key={trade.id}
              className="border-b border-border/20 transition-colors hover:bg-muted/50"
            >
              <td className="px-3 py-2 font-mono tabular-nums text-muted-foreground">
                {formatShortDate(trade.simulationDate)}
              </td>
              <td className="px-3 py-2 font-medium">{trade.ticker}</td>
              <td className="px-3 py-2 text-center">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs px-1.5 py-0",
                    trade.side === "buy"
                      ? "border-emerald-500/30 text-emerald-500"
                      : "border-red-500/30 text-red-500",
                  )}
                >
                  {trade.side.toUpperCase()}
                </Badge>
              </td>
              <td className="px-3 py-2 text-right font-mono tabular-nums">
                {trade.quantity}
              </td>
              <td className="px-3 py-2 text-right font-mono tabular-nums">
                {formatCurrency(trade.price)}
              </td>
              <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">
                {(trade.fees ?? 0) > 0
                  ? formatCurrency(trade.fees)
                  : "—"}
              </td>
              <td
                className={cn(
                  "px-3 py-2 text-right font-mono tabular-nums",
                  trade.realizedPnL > 0
                    ? "text-emerald-500"
                    : trade.realizedPnL < 0
                      ? "text-red-500"
                      : "text-muted-foreground",
                )}
              >
                {trade.side === "sell"
                  ? formatCurrency(trade.realizedPnL)
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
