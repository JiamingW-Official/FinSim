"use client";

import { useTradingStore } from "@/stores/trading-store";
import { formatCurrency, formatShortDate, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";

export function TradeHistory() {
  const tradeHistory = useTradingStore((s) => s.tradeHistory);

  if (tradeHistory.length === 0) {
    return (
      <div className="flex h-24 flex-col items-center justify-center gap-1.5">
        <BarChart3 className="h-5 w-5 text-muted-foreground/40" />
        <span className="text-xs font-medium text-muted-foreground">
          No trades yet
        </span>
        <span className="text-xs text-muted-foreground/60">
          Your completed trades will appear here
        </span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto max-h-64">
      <table className="w-full text-xs" role="table">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th scope="col" className="px-2 py-1.5 text-left font-medium whitespace-nowrap">Date</th>
            <th scope="col" className="px-2 py-1.5 text-left font-medium whitespace-nowrap">Ticker</th>
            <th scope="col" className="px-2 py-1.5 text-center font-medium whitespace-nowrap">Side</th>
            <th scope="col" className="px-2 py-1.5 text-right font-medium whitespace-nowrap">Qty</th>
            <th scope="col" className="px-2 py-1.5 text-right font-medium whitespace-nowrap">Price</th>
            <th scope="col" className="px-2 py-1.5 text-right font-medium whitespace-nowrap">Fees</th>
            <th scope="col" className="px-2 py-1.5 text-right font-medium whitespace-nowrap">Net P&amp;L</th>
          </tr>
        </thead>
        <tbody>
          {tradeHistory.slice(0, 50).map((trade) => (
            <tr
              key={trade.id}
              className={cn(
                "border-b border-border/50 transition-colors duration-150 hover:bg-accent/30",
                trade.side === "sell" && trade.realizedPnL > 0
                  ? "border-l-2 border-l-[#10b981]/40"
                  : trade.side === "sell" && trade.realizedPnL < 0
                    ? "border-l-2 border-l-[#ef4444]/40"
                    : "border-l-2 border-l-transparent",
              )}
            >
              <td className="px-2 py-1.5 text-muted-foreground tabular-nums">
                {formatShortDate(trade.simulationDate)}
              </td>
              <td className="px-2 py-1.5 font-semibold">{trade.ticker}</td>
              <td className="px-2 py-1.5 text-center">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs px-1.5 py-0",
                    trade.side === "buy"
                      ? "border-[#10b981]/30 text-[#10b981]"
                      : "border-[#ef4444]/30 text-[#ef4444]",
                  )}
                >
                  {trade.side.toUpperCase()}
                </Badge>
              </td>
              <td className="px-2 py-1.5 text-right tabular-nums">
                {trade.quantity}
              </td>
              <td className="px-2 py-1.5 text-right tabular-nums">
                {formatCurrency(trade.price)}
              </td>
              <td className="px-2 py-1.5 text-right tabular-nums text-muted-foreground">
                {(trade.fees ?? 0) > 0
                  ? formatCurrency(trade.fees)
                  : "—"}
              </td>
              <td
                className={cn(
                  "px-2 py-1.5 text-right tabular-nums",
                  trade.realizedPnL > 0
                    ? "text-[#10b981]"
                    : trade.realizedPnL < 0
                      ? "text-[#ef4444]"
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
