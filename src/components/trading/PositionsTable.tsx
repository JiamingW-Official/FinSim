"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTradingStore } from "@/stores/trading-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { Badge } from "@/components/ui/badge";
import { X, Briefcase, ArrowDownLeft } from "lucide-react";
import { toast } from "sonner";

function PnLMilestoneBadge({ pct }: { pct: number }) {
  const milestone =
    pct >= 20 ? "💎"
    : pct >= 10 ? "🚀"
    : pct >= 5  ? "🎯"
    : pct <= -5 ? "⚠️"
    : null;

  return (
    <AnimatePresence>
      {milestone && (
        <motion.span
          key={milestone}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.3, 1], opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.35, type: "tween" }}
          title={
            pct >= 20 ? "Diamond gain — exceptional!" :
            pct >= 10 ? "Rocket gain — excellent!" :
            pct >= 5  ? "On target — nice gain!" :
            "Down 5%+ — watch your stop"
          }
          className="ml-0.5 text-[11px] cursor-default"
        >
          {milestone}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

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
    <div className="overflow-x-auto">
      <table className="w-full text-xs" role="table">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th scope="col" className="px-2 py-1.5 text-left font-medium whitespace-nowrap">Ticker</th>
            <th scope="col" className="px-2 py-1.5 text-center font-medium whitespace-nowrap">Side</th>
            <th scope="col" className="px-2 py-1.5 text-right font-medium whitespace-nowrap">Qty</th>
            <th scope="col" className="px-2 py-1.5 text-right font-medium whitespace-nowrap">Avg</th>
            <th scope="col" className="px-2 py-1.5 text-right font-medium whitespace-nowrap">Price</th>
            <th scope="col" className="px-2 py-1.5 text-right font-medium whitespace-nowrap">P&amp;L</th>
            <th scope="col" className="px-2 py-1.5 text-right font-medium whitespace-nowrap">Borrow</th>
            <th scope="col" className="w-8 px-1 py-1.5"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {positions.map((pos, index) => {
            const rate = borrowRates[pos.ticker] ?? 1.0;
            const dailyBorrowCost =
              pos.side === "short"
                ? pos.quantity * pos.currentPrice * (rate / 100 / 365)
                : 0;

            return (
              <motion.tr
                key={`${pos.ticker}-${pos.side}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                className={cn(
                  "border-b border-border/50 hover:bg-accent/30",
                  pos.side === "long"
                    ? "border-l-2 border-l-[#10b981]/40"
                    : "border-l-2 border-l-[#a855f7]/40",
                )}
              >
                <td className="px-2 py-1.5 font-semibold">{pos.ticker}</td>
                <td className="px-2 py-1.5 text-center">
                  <Badge
                    variant="outline"
                    className={cn(
                      "px-1.5 py-0 text-[10px] inline-flex items-center gap-0.5",
                      pos.side === "long"
                        ? "border-[#10b981]/30 text-[#10b981]"
                        : "border-[#a855f7]/30 text-[#a855f7]",
                    )}
                  >
                    {pos.side === "short" && (
                      <ArrowDownLeft className="h-2 w-2" />
                    )}
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
                  <div className="flex items-center justify-end gap-0.5">
                    <AnimatedNumber
                      value={pos.unrealizedPnL}
                      format={(n) => formatCurrency(n)}
                    />
                    <PnLMilestoneBadge pct={pos.unrealizedPnLPercent} />
                  </div>
                  <div className="text-[10px]">
                    {formatPercent(pos.unrealizedPnLPercent)}
                  </div>
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums">
                  {pos.side === "short" ? (
                    <span className="text-[10px] text-[#f59e0b]" title={`${rate.toFixed(2)}%/yr borrow rate`}>
                      {formatCurrency(dailyBorrowCost)}/d
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground/40">—</span>
                  )}
                </td>
                <td className="px-1 py-1.5">
                  <motion.button
                    type="button"
                    onClick={() =>
                      handleClose(
                        pos.ticker,
                        pos.quantity,
                        pos.currentPrice,
                        pos.side,
                      )
                    }
                    whileTap={{ rotate: 90, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    title={pos.side === "short" ? "Cover short" : "Close position"}
                  >
                    <X className="h-3 w-3" />
                  </motion.button>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
