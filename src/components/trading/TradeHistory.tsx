"use client";

import { useTradingStore } from "@/stores/trading-store";
import { formatCurrency, cn } from "@/lib/utils";

function formatShortDay(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function TradeHistory() {
  const tradeHistory = useTradingStore((s) => s.tradeHistory);

  const sells = tradeHistory.filter((t) => t.side === "sell");
  const totalPnl = sells.reduce((s, t) => s + t.realizedPnL, 0);
  const wins = sells.filter((t) => t.realizedPnL > 0).length;
  const winRate = sells.length > 0 ? ((wins / sells.length) * 100).toFixed(0) : "—";

  return (
    <div className="flex flex-col h-full">
      {/* Summary stats row */}
      <div className="flex items-center gap-2 px-2 py-1.5 border-b border-border/30 shrink-0">
        <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/30">
          {tradeHistory.length} trades
        </span>
        <span className="text-muted-foreground/20 text-[9px]">·</span>
        <span className="text-[9px] font-mono text-muted-foreground/40">
          <span className="text-foreground/50">{winRate}%</span>
          {" "}win rate
        </span>
        {sells.length > 0 && (
          <>
            <span className="text-muted-foreground/20 text-[9px]">·</span>
            <span
              className={cn(
                "text-[9px] font-mono font-semibold",
                totalPnl >= 0 ? "text-emerald-400" : "text-rose-400",
              )}
            >
              {totalPnl >= 0 ? "+" : ""}
              {formatCurrency(totalPnl)}
            </span>
          </>
        )}
      </div>

      {/* Trade list */}
      {tradeHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-16 gap-1">
          <span className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest">
            No Trades Yet
          </span>
        </div>
      ) : (
        <div className="overflow-auto h-full">
          <table className="w-full" role="table">
            <thead className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
              <tr className="border-b border-border/40">
                <th
                  scope="col"
                  className="px-2 py-1 text-left text-[9px] font-mono uppercase tracking-widest text-muted-foreground/30 whitespace-nowrap"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-2 py-1 text-left text-[9px] font-mono uppercase tracking-widest text-muted-foreground/30 whitespace-nowrap"
                >
                  Ticker
                </th>
                <th
                  scope="col"
                  className="px-2 py-1 text-center text-[9px] font-mono uppercase tracking-widest text-muted-foreground/30 whitespace-nowrap"
                >
                  Side
                </th>
                <th
                  scope="col"
                  className="px-2 py-1 text-right text-[9px] font-mono uppercase tracking-widest text-muted-foreground/30 whitespace-nowrap"
                >
                  Qty × Price
                </th>
                <th
                  scope="col"
                  className="px-2 py-1 text-right text-[9px] font-mono uppercase tracking-widest text-muted-foreground/30 whitespace-nowrap"
                >
                  P&amp;L
                </th>
              </tr>
            </thead>
            <tbody>
              {tradeHistory.slice(0, 50).map((trade, i) => (
                <tr
                  key={trade.id}
                  className={cn(
                    "border-b border-border/20 hover:bg-muted/5 transition-colors duration-100",
                    i % 2 === 1 && "bg-muted/[0.02]",
                  )}
                >
                  <td className="px-2 py-1.5 text-[10px] font-mono tabular-nums text-muted-foreground/50 whitespace-nowrap">
                    {formatShortDay(trade.simulationDate)}
                  </td>
                  <td className="px-2 py-1.5 text-[10px] font-medium font-mono whitespace-nowrap text-foreground/80">
                    {trade.ticker}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <span
                      className={cn(
                        "text-[9px] font-mono font-medium px-1.5 py-0.5 rounded-sm",
                        trade.side === "buy"
                          ? "text-emerald-400/80 bg-emerald-500/10"
                          : "text-rose-400/80 bg-rose-500/10",
                      )}
                    >
                      {trade.side === "buy" ? "B" : "S"}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-right text-[10px] font-mono tabular-nums text-muted-foreground/70 whitespace-nowrap">
                    {trade.quantity} × {formatCurrency(trade.price)}
                  </td>
                  <td
                    className={cn(
                      "px-2 py-1.5 text-right text-[10px] font-mono tabular-nums whitespace-nowrap font-semibold",
                      trade.side === "sell"
                        ? trade.realizedPnL > 0
                          ? "text-emerald-400"
                          : trade.realizedPnL < 0
                            ? "text-rose-400"
                            : "text-muted-foreground/50"
                        : "text-muted-foreground/25",
                    )}
                  >
                    {trade.side === "sell"
                      ? (trade.realizedPnL >= 0 ? "+" : "") +
                        formatCurrency(trade.realizedPnL)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
