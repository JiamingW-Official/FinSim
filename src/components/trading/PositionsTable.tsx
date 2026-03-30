"use client";

import { useMemo } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { calculateATR } from "@/services/indicators";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { X } from "lucide-react";
import { toast } from "sonner";

export function PositionsTable() {
  const positions = useTradingStore((s) => s.positions);
  const placeSellOrder = useTradingStore((s) => s.placeSellOrder);
  const coverShortOrder = useTradingStore((s) => s.coverShortOrder);
  const borrowRates = useTradingStore((s) => s.borrowRates);
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);

  const currentBar =
    allData.length > 0 && revealedCount > 0
      ? allData[revealedCount - 1]
      : null;

  // Compute ATR(14) from visible bars (kept for close logic)
  const atrValue = useMemo(() => {
    const visibleData = allData.slice(0, revealedCount);
    if (visibleData.length < 15) return null;
    const pts = calculateATR(visibleData, 14);
    return pts.length > 0 ? pts[pts.length - 1].value : null;
  }, [allData, revealedCount]);

  // Suppress unused-variable lint — atrValue is available for future stop logic
  void atrValue;

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

  // Portfolio summary
  const { totalValue, totalPnl } = useMemo(() => {
    let value = 0;
    let pnl = 0;
    for (const pos of positions) {
      value += pos.quantity * pos.currentPrice;
      pnl += pos.unrealizedPnL;
    }
    return { totalValue: value, totalPnl: pnl };
  }, [positions]);

  if (positions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-20 gap-1">
        <span className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest">
          No Open Positions
        </span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {/* Portfolio summary header */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/40 bg-muted/5">
        <span className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-wider">
          {positions.length} Position{positions.length !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-muted-foreground/50">
            Mkt Value{" "}
            <span className="text-foreground/70">
              {formatCurrency(totalValue)}
            </span>
          </span>
          <span
            className={cn(
              "text-[10px] font-mono font-semibold",
              totalPnl >= 0 ? "text-emerald-400" : "text-rose-400",
            )}
          >
            {totalPnl >= 0 ? "+" : ""}
            {formatCurrency(totalPnl)}
          </span>
        </div>
      </div>

      {/* Table */}
      <table className="w-full" role="table">
        <thead>
          <tr className="border-b border-border/30">
            <th
              scope="col"
              className="px-2 py-1 text-left text-[9px] font-mono uppercase tracking-widest text-muted-foreground/30"
            >
              Ticker
            </th>
            <th
              scope="col"
              className="px-2 py-1 text-right text-[9px] font-mono uppercase tracking-widest text-muted-foreground/30"
            >
              Qty
            </th>
            <th
              scope="col"
              className="px-2 py-1 text-right text-[9px] font-mono uppercase tracking-widest text-muted-foreground/30"
            >
              Avg
            </th>
            <th
              scope="col"
              className="px-2 py-1 text-right text-[9px] font-mono uppercase tracking-widest text-muted-foreground/30"
            >
              Last
            </th>
            <th
              scope="col"
              className="px-2 py-1 text-right text-[9px] font-mono uppercase tracking-widest text-muted-foreground/30"
            >
              P&amp;L
            </th>
            <th
              scope="col"
              className="px-2 py-1 text-right text-[9px] font-mono uppercase tracking-widest text-muted-foreground/30"
            >
              %
            </th>
            <th scope="col" className="w-7 px-1 py-1">
              <span className="sr-only">Close</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {positions.map((pos) => {
            const rate = borrowRates[pos.ticker] ?? 1.0;
            void rate; // available for borrow display if needed

            const pnlPositive = pos.unrealizedPnL >= 0;
            const pnlColor = pnlPositive
              ? "text-emerald-400"
              : "text-rose-400";

            return (
              <tr
                key={`${pos.ticker}-${pos.side}`}
                className="border-b border-border/20 hover:bg-muted/5 transition-colors duration-100"
              >
                {/* Ticker + side badge */}
                <td className="px-2 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-foreground font-mono">
                      {pos.ticker}
                    </span>
                    <span
                      className={cn(
                        "text-[8px] px-1 py-0 rounded font-mono font-semibold",
                        pos.side === "long"
                          ? "bg-emerald-500/10 text-emerald-400/80"
                          : "bg-amber-500/10 text-amber-400/80",
                      )}
                    >
                      {pos.side === "long" ? "LONG" : "SHORT"}
                    </span>
                  </div>
                </td>

                {/* Qty */}
                <td className="px-2 py-1.5 text-right">
                  <span className="text-[11px] font-mono tabular-nums text-foreground/80">
                    {pos.quantity}
                  </span>
                </td>

                {/* Avg entry */}
                <td className="px-2 py-1.5 text-right">
                  <span className="text-[11px] font-mono tabular-nums text-foreground/80">
                    {formatCurrency(pos.avgPrice)}
                  </span>
                </td>

                {/* Last / current price */}
                <td className="px-2 py-1.5 text-right">
                  <span className="text-[11px] font-mono tabular-nums text-foreground/80">
                    {formatCurrency(pos.currentPrice)}
                  </span>
                </td>

                {/* P&L dollar */}
                <td className="px-2 py-1.5 text-right">
                  <span
                    className={cn(
                      "text-[11px] font-mono tabular-nums font-semibold",
                      pnlColor,
                    )}
                  >
                    {pnlPositive ? "+" : ""}
                    {formatCurrency(pos.unrealizedPnL)}
                  </span>
                </td>

                {/* P&L % */}
                <td className="px-2 py-1.5 text-right">
                  <span
                    className={cn(
                      "text-[11px] font-mono tabular-nums",
                      pnlColor,
                    )}
                  >
                    {pnlPositive ? "+" : ""}
                    {formatPercent(pos.unrealizedPnLPercent)}
                  </span>
                </td>

                {/* Close button */}
                <td className="px-1 py-1.5 text-center">
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
                    className="h-5 w-5 inline-flex items-center justify-center rounded text-muted-foreground/30 hover:bg-rose-500/10 hover:text-rose-400 transition-colors duration-100"
                    title={pos.side === "short" ? "Cover short" : "Close position"}
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
