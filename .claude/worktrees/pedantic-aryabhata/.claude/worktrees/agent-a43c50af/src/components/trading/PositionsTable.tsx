"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTradingStore } from "@/stores/trading-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { Badge } from "@/components/ui/badge";
import { X, Briefcase } from "lucide-react";
import { toast } from "sonner";

function PnLMilestoneBadge({ pct }: { pct: number }) {
  const milestone =
    pct >= 20 ? { label: "!!",  color: "text-cyan-400" }
    : pct >= 10 ? { label: "!",  color: "text-green-400" }
    : pct >= 5  ? { label: "+",  color: "text-primary" }
    : pct <= -5 ? { label: "!",  color: "text-red-400" }
    : null;

  return (
    <AnimatePresence>
      {milestone && (
        <motion.span
          key={milestone.label}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.3, 1], opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.35, type: "tween" }}
          title={
            pct >= 20 ? "Exceptional gain!" :
            pct >= 10 ? "Excellent gain!" :
            pct >= 5  ? "Nice gain!" :
            "Down 5%+ — watch your stop"
          }
          className={cn("ml-0.5 text-[10px] font-bold cursor-default", milestone.color)}
        >
          {milestone.label}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

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
        <span className="text-xs font-medium text-muted-foreground/50">
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
      <table className="w-full text-xs min-w-[500px]">
        <thead>
          <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            <th className="px-2 py-1.5 text-left">Ticker</th>
            <th className="px-2 py-1.5 text-center">Side</th>
            <th className="px-2 py-1.5 text-right">Qty</th>
            <th className="px-2 py-1.5 text-right">Avg</th>
            <th className="px-2 py-1.5 text-right">Price</th>
            <th className="px-2 py-1.5 text-right">P&L</th>
            <th className="w-8 px-1 py-1.5"></th>
          </tr>
        </thead>
        <tbody>
          {positions.map((pos, index) => (
            <motion.tr
              key={`${pos.ticker}-${pos.side}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              className={cn(
                "border-b border-border/50 hover:bg-accent/20",
                pos.side === "long"
                  ? "border-l-2 border-l-green-500/40"
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
                      ? "border-green-500/30 text-green-500"
                      : "border-[#ef4444]/30 text-[#ef4444]",
                  )}
                >
                  {pos.side.toUpperCase()}
                </Badge>
              </td>
              <td className="px-2 py-1.5 text-right font-mono tabular-nums">
                {pos.quantity}
              </td>
              <td className="px-2 py-1.5 text-right font-mono tabular-nums text-muted-foreground">
                {formatCurrency(pos.avgPrice)}
              </td>
              <td className="px-2 py-1.5 text-right font-mono tabular-nums">
                {formatCurrency(pos.currentPrice)}
              </td>
              <td
                className={cn(
                  "px-2 py-1.5 text-right font-mono tabular-nums",
                  pos.unrealizedPnL >= 0 ? "text-green-500" : "text-[#ef4444]",
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
                  title="Close position"
                >
                  <X className="h-3 w-3" />
                </motion.button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
