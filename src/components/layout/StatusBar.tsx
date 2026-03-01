"use client";

import { useTradingStore } from "@/stores/trading-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { INITIAL_CAPITAL } from "@/types/trading";
import { formatCurrency, formatPercent, formatDate } from "@/lib/utils";
import { useAnimatedNumber } from "@/hooks/usePriceFlash";
import { useGameStore } from "@/stores/game-store";
import { cn } from "@/lib/utils";

export function StatusBar() {
  const { cash, portfolioValue } = useTradingStore();
  const pendingCount = useTradingStore((s) => s.pendingOrders.length);
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);
  const isPlaying = useMarketDataStore((s) => s.isPlaying);
  const speed = useMarketDataStore((s) => s.speed);
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
    <div className="glass-subtle flex h-7 items-center justify-between border-t border-border/50 px-4 text-xs text-muted-foreground">
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
              totalPnL >= 0 ? "text-[#10b981]" : "text-[#ef4444]",
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
          <span>Sim: {formatDate(currentBar.timestamp)}</span>
        )}
        {isPlaying && (
          <span className="tabular-nums text-primary">{speed}x</span>
        )}
        <div className="flex items-center gap-1">
          <div
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-colors",
              isPlaying ? "bg-[#10b981] pulse-dot" : "bg-[#6b7280]",
            )}
          />
          <span className={cn(isPlaying && "text-[#10b981]")}>
            {isPlaying ? "Playing" : "Paused"}
          </span>
        </div>
      </div>
    </div>
  );
}
