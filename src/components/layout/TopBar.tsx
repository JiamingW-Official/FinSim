"use client";

import { useChartStore } from "@/stores/chart-store";
import { useTradingStore } from "@/stores/trading-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { WATCHLIST_STOCKS } from "@/types/market";
import { formatCurrency, formatPercent, formatDate } from "@/lib/utils";
import { usePriceFlash, useAnimatedNumber } from "@/hooks/usePriceFlash";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { LevelBadge } from "@/components/game/LevelBadge";
import { XPBar } from "@/components/game/XPBar";

export function TopBar() {
  const { currentTicker } = useChartStore();
  const portfolioValue = useTradingStore((s) => s.portfolioValue);
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);
  const isPlaying = useMarketDataStore((s) => s.isPlaying);
  const currentBar =
    allData.length > 0 && revealedCount > 0
      ? allData[revealedCount - 1]
      : null;

  const stockInfo = WATCHLIST_STOCKS.find((s) => s.ticker === currentTicker);
  const price = currentBar?.close ?? 0;
  const priceFlash = usePriceFlash(price || undefined);
  const animatedPrice = useAnimatedNumber(price, 250);
  const animatedPortfolio = useAnimatedNumber(portfolioValue, 350);

  const dayChange =
    currentBar && currentBar.open > 0
      ? ((currentBar.close - currentBar.open) / currentBar.open) * 100
      : 0;

  const priceDisplay = price > 0 ? formatCurrency(animatedPrice) : "---";

  return (
    <div className="flex h-10 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-bold tracking-wider text-primary">
          <span className="inline-flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            ALPHA DECK
          </span>
        </span>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold">{currentTicker}</span>
          <span className="text-muted-foreground">
            {stockInfo?.name ?? ""}
          </span>
          <span
            className={cn(
              "font-bold tabular-nums transition-colors duration-300",
              priceFlash === "up" && "price-flash-up",
              priceFlash === "down" && "price-flash-down",
            )}
          >
            {priceDisplay}
          </span>
          {currentBar && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium",
                dayChange >= 0
                  ? "bg-[#10b981]/10 text-[#10b981]"
                  : "bg-[#ef4444]/10 text-[#ef4444]",
              )}
            >
              {dayChange >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {formatPercent(dayChange)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <LevelBadge />
        <XPBar />
        <div className="h-4 w-px bg-border" />
        {currentBar && (
          <span className="text-muted-foreground">
            {formatDate(currentBar.timestamp)}
          </span>
        )}
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Portfolio</span>
          <span className="font-semibold tabular-nums">
            {formatCurrency(animatedPortfolio)}
          </span>
        </div>
        {isPlaying && (
          <div className="flex items-center gap-1">
            <div className="pulse-dot h-2 w-2 rounded-full bg-[#10b981]" />
            <span className="text-xs text-[#10b981]">LIVE</span>
          </div>
        )}
      </div>
    </div>
  );
}
