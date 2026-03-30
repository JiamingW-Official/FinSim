"use client";

import { useTradingStore } from "@/stores/trading-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { useClockStore } from "@/stores/clock-store";
import { INITIAL_CAPITAL } from "@/types/trading";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { useAnimatedNumber } from "@/hooks/usePriceFlash";
import { cn } from "@/lib/utils";

export function StatusBar() {
  const { cash, portfolioValue } = useTradingStore();
  const pendingCount = useTradingStore((s) => s.pendingOrders.length);
  const isPlaying = useMarketDataStore((s) => s.isPlaying);
  const gameTimeDisplay = useClockStore((s) => s.gameTimeDisplay);

  const totalPnL = portfolioValue - INITIAL_CAPITAL;
  const totalPnLPercent = (totalPnL / INITIAL_CAPITAL) * 100;
  const animatedPnL = useAnimatedNumber(totalPnL, 300);
  const animatedCash = useAnimatedNumber(cash, 300);

  return (
    <div className="flex h-6 items-center justify-between border-t border-border bg-background px-4 text-[10px] text-muted-foreground/50">
      <div className="flex items-center gap-4">
        <span className="tabular-nums">
          Cash: <span className="text-foreground">{formatCurrency(animatedCash)}</span>
        </span>
        <div className="h-3 w-px bg-border/20" />
        <span>
          P&L:{" "}
          <span
            className={cn(
              "font-medium tabular-nums",
              totalPnL >= 0 ? "text-profit" : "text-loss",
            )}
          >
            {formatCurrency(animatedPnL)} ({formatPercent(totalPnLPercent)})
          </span>
        </span>
      </div>
      <div className="flex items-center gap-4">
        {pendingCount > 0 && (
          <span>{pendingCount} pending</span>
        )}
        <span className="font-mono tabular-nums">{gameTimeDisplay} ET</span>
        <div className="flex items-center gap-1">
          <span className={cn(
            "h-1.5 w-1.5 rounded-full",
            isPlaying ? "bg-muted-foreground" : "bg-muted-foreground/40",
          )} />
          <span>{isPlaying ? "Playing" : "Paused"}</span>
        </div>
      </div>
    </div>
  );
}
