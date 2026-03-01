"use client";

import { useMemo } from "react";
import { useChartStore } from "@/stores/chart-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { WATCHLIST_STOCKS } from "@/types/market";
import { formatCurrency, cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { MiniSparkline } from "./MiniSparkline";

export function Watchlist() {
  const { currentTicker, setTicker } = useChartStore();
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);
  const currentBar =
    allData.length > 0 && revealedCount > 0
      ? allData[revealedCount - 1]
      : null;

  // Calculate previous bar for change indicator
  const prevBar =
    allData.length > 0 && revealedCount > 1
      ? allData[revealedCount - 2]
      : null;

  const priceChange =
    currentBar && prevBar
      ? ((currentBar.close - prevBar.close) / prevBar.close) * 100
      : 0;

  // Last 20 close prices for sparkline
  const sparkData = useMemo(() => {
    if (revealedCount < 2) return [];
    const start = Math.max(0, revealedCount - 20);
    return allData.slice(start, revealedCount).map((b) => b.close);
  }, [allData, revealedCount]);

  return (
    <div className="flex w-48 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Watchlist
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {WATCHLIST_STOCKS.map((stock) => {
          const isActive = stock.ticker === currentTicker;
          const showPrice = isActive && currentBar;

          return (
            <button
              key={stock.ticker}
              onClick={() => setTicker(stock.ticker)}
              className={cn(
                "group flex w-full items-center justify-between px-3 py-2 text-left transition-all duration-150",
                isActive
                  ? "bg-primary/5 border-l-2 border-primary"
                  : "border-l-2 border-transparent hover:bg-accent/50",
              )}
            >
              <div>
                <div
                  className={cn(
                    "text-xs font-semibold transition-colors",
                    isActive ? "text-primary" : "text-foreground group-hover:text-primary/80",
                  )}
                >
                  {stock.ticker}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {stock.sector}
                </div>
              </div>
              {showPrice && (
                <div className="flex flex-col items-end gap-0.5">
                  <div className="text-xs tabular-nums font-medium">
                    {formatCurrency(currentBar.close)}
                  </div>
                  <MiniSparkline data={sparkData} />
                  <div
                    className={cn(
                      "flex items-center justify-end gap-0.5 text-[10px] tabular-nums",
                      priceChange > 0
                        ? "text-[#10b981]"
                        : priceChange < 0
                          ? "text-[#ef4444]"
                          : "text-muted-foreground",
                    )}
                  >
                    {priceChange > 0 ? (
                      <TrendingUp className="h-2.5 w-2.5" />
                    ) : priceChange < 0 ? (
                      <TrendingDown className="h-2.5 w-2.5" />
                    ) : (
                      <Minus className="h-2.5 w-2.5" />
                    )}
                    {priceChange >= 0 ? "+" : ""}
                    {priceChange.toFixed(2)}%
                  </div>
                </div>
              )}
              {!isActive && (
                <div className="text-[10px] text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100">
                  Click
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
