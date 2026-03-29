"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useChartStore } from "@/stores/chart-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { WATCHLIST_STOCKS } from "@/types/market";
import { formatCurrency, cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { MiniSparkline } from "./MiniSparkline";
import { FUNDAMENTALS } from "@/data/fundamentals";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

function MarketMoodOrb({ close, open }: { close: number; open: number }) {
  const pct = open > 0 ? ((close - open) / open) * 100 : 0;
  const isBull = pct > 0.2;
  const isBear = pct < -0.2;
  const label = isBull ? "Bull" : isBear ? "Bear" : "Flat";
  const orbColor = isBull ? "bg-emerald-400" : isBear ? "bg-red-400" : "bg-amber-400";
  const orbGlow = "";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1 cursor-default">
          <div
            className={cn("h-2.5 w-2.5 rounded-full shrink-0", orbColor)}
          />
          <span className="text-[8px] text-muted-foreground font-medium">{label}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={6} className="text-xs max-w-40 bg-card border border-border p-2">
        Market mood based on current bar price action ({pct >= 0 ? "+" : ""}{pct.toFixed(2)}%)
      </TooltipContent>
    </Tooltip>
  );
}

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
      <div className="border-b border-border px-3 py-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">
          Watchlist
        </span>
        {currentBar && (
          <MarketMoodOrb close={currentBar.close} open={currentBar.open} />
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {WATCHLIST_STOCKS.map((stock) => {
          const isActive = stock.ticker === currentTicker;
          const showPrice = isActive && currentBar;
          const fund = FUNDAMENTALS[stock.ticker];

          return (
            <Tooltip key={stock.ticker}>
              <TooltipTrigger asChild>
                <motion.button
                  type="button"
                  onClick={() => setTicker(stock.ticker)}
                  whileHover={{ x: 2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={cn(
                    "group flex w-full items-center justify-between px-3 py-2 text-left",
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
                    <div className="text-xs text-muted-foreground">
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
                          "flex items-center justify-end gap-0.5 text-xs tabular-nums",
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
                </motion.button>
              </TooltipTrigger>
              {fund && (
                <TooltipContent
                  side="right"
                  sideOffset={8}
                  className="max-w-[200px] space-y-0.5 bg-card text-card-foreground border border-border p-2"
                >
                  <div className="text-xs font-semibold">{stock.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {fund.sector} | P/E: {fund.peRatio} | MCap: {fund.marketCap}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Beta: {fund.beta} | Div: {fund.dividendYield > 0 ? `${fund.dividendYield}%` : "N/A"}
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
