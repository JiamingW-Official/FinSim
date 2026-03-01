"use client";

import { useTradingStore } from "@/stores/trading-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { X, Briefcase } from "lucide-react";
import { toast } from "sonner";

export function PositionsTable() {
  const positions = useTradingStore((s) => s.positions);
  const placeSellOrder = useTradingStore((s) => s.placeSellOrder);
  const coverShortOrder = useTradingStore((s) => s.coverShortOrder);
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);
  const currentBar =
    allData.length > 0 && revealedCount > 0
      ? allData[revealedCount - 1]
      : null;

  const handleClose = (
    ticker: string,
    quantity: number,
    price: number,
    side: "long" | "short",
  ) => {
    const simDate = currentBar?.timestamp ?? Date.now();
    const order =
      side === "long"
        ? placeSellOrder(ticker, quantity, price, simDate)
        : coverShortOrder(ticker, quantity, price, simDate);
    if (order) {
      toast.success(`Closed ${ticker} ${side} position`);
    }
  };

  if (positions.length === 0) {
    return (
      <div className="flex h-24 flex-col items-center justify-center gap-1.5">
        <Briefcase className="h-5 w-5 text-muted-foreground/40" />
        <span className="text-xs font-medium text-muted-foreground">
          No open positions
        </span>
        <span className="text-[10px] text-muted-foreground/60">
          Place a buy order to open your first position
        </span>
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="px-2 py-1.5 text-left font-medium">Ticker</th>
            <th className="px-2 py-1.5 text-center font-medium">Side</th>
            <th className="px-2 py-1.5 text-right font-medium">Qty</th>
            <th className="px-2 py-1.5 text-right font-medium">Avg</th>
            <th className="px-2 py-1.5 text-right font-medium">Price</th>
            <th className="px-2 py-1.5 text-right font-medium">P&L</th>
            <th className="w-8 px-1 py-1.5"></th>
          </tr>
        </thead>
        <tbody>
          {positions.map((pos) => (
            <tr
              key={`${pos.ticker}-${pos.side}`}
              className={cn(
                "border-b border-border/50 transition-colors duration-150 hover:bg-accent/30",
                pos.side === "long"
                  ? "border-l-2 border-l-[#10b981]/40"
                  : "border-l-2 border-l-[#ef4444]/40",
              )}
            >
              <td className="px-2 py-1.5 font-semibold">{pos.ticker}</td>
              <td className="px-2 py-1.5 text-center">
                <Badge
                  variant="outline"
                  className={cn(
                    "px-1.5 py-0 text-[10px]",
                    pos.side === "long"
                      ? "border-[#10b981]/30 text-[#10b981]"
                      : "border-[#ef4444]/30 text-[#ef4444]",
                  )}
                >
                  {pos.side.toUpperCase()}
                </Badge>
              </td>
              <td className="px-2 py-1.5 text-right tabular-nums">
                {pos.quantity}
              </td>
              <td className="px-2 py-1.5 text-right tabular-nums text-muted-foreground">
                {formatCurrency(pos.avgPrice)}
              </td>
              <td className="px-2 py-1.5 text-right tabular-nums">
                {formatCurrency(pos.currentPrice)}
              </td>
              <td
                className={cn(
                  "px-2 py-1.5 text-right tabular-nums",
                  pos.unrealizedPnL >= 0 ? "text-[#10b981]" : "text-[#ef4444]",
                )}
              >
                <div>{formatCurrency(pos.unrealizedPnL)}</div>
                <div className="text-[10px]">
                  {formatPercent(pos.unrealizedPnLPercent)}
                </div>
              </td>
              <td className="px-1 py-1.5">
                <button
                  type="button"
                  onClick={() =>
                    handleClose(
                      pos.ticker,
                      pos.quantity,
                      pos.currentPrice,
                      pos.side,
                    )
                  }
                  className="rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
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
