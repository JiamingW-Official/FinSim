"use client";

import { useTradingStore } from "@/stores/trading-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { INITIAL_CAPITAL } from "@/types/trading";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { useAnimatedNumber } from "@/hooks/usePriceFlash";
import { useGameStore } from "@/stores/game-store";
import { cn } from "@/lib/utils";

export function StatusBar() {
  const { cash, portfolioValue } = useTradingStore();
  const pendingCount = useTradingStore((s) => s.pendingOrders.length);
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);
  const isPlaying = useMarketDataStore((s) => s.isPlaying);
  const level = useGameStore((s) => s.level);
  const title = useGameStore((s) => s.title);
  const currentBar =
    allData.length > 0 && revealedCount > 0
      ? allData[revealedCount - 1]
      : null;

  const totalPnL = portfolioValue - INITIAL_CAPITAL;
  const totalPnLPercent = (totalPnL / INITIAL_CAPITAL) * 100;
  const animatedPnL = useAnimatedNumber(totalPnL, 300);
  const animatedCash = useAnimatedNumber(cash, 300);

  return (
    <div className="flex h-7 items-center justify-between border-t border-border/30 bg-sidebar/80 px-4 text-xs text-muted-foreground/70 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <span className="tabular-nums">
          Cash: <span className="text-foreground">{formatCurrency(animatedCash)}</span>
        </span>
        <div className="h-3 w-px bg-border" />
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
          <span className="text-amber-500">
            {pendingCount} pending
          </span>
        )}
        <span className="tabular-nums">
          Lv.{level} {title}
        </span>
        {currentBar && (
          <span>Sim: {new Date(currentBar.timestamp).toLocaleString("en-US", {
            month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
            hour12: true, timeZone: "America/New_York",
          })} ET</span>
        )}
        <div className="flex items-center gap-1">
          <div
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-colors",
              isPlaying ? "bg-profit pulse-dot" : "bg-muted-foreground",
            )}
          />
          <span className={cn(isPlaying && "text-profit")}>
            {isPlaying ? "Playing" : "Paused"}
          </span>
        </div>
      </div>
    </div>
  );
}
