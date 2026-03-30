"use client";

import { useChartStore } from "@/stores/chart-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { WATCHLIST_STOCKS } from "@/types/market";
import { formatCurrency, cn } from "@/lib/utils";

export function Watchlist() {
 const { currentTicker, setTicker } = useChartStore();
 const allData = useMarketDataStore((s) => s.allData);
 const revealedCount = useMarketDataStore((s) => s.revealedCount);
 const currentBar =
 allData.length > 0 && revealedCount > 0
 ? allData[revealedCount - 1]
 : null;

 const prevBar =
 allData.length > 0 && revealedCount > 1
 ? allData[revealedCount - 2]
 : null;

 const priceChange =
 currentBar && prevBar
 ? ((currentBar.close - prevBar.close) / prevBar.close) * 100
 : 0;

 return (
 <div className="flex w-44 flex-col border-r border-border bg-card">
 <div className="border-b border-border px-3 py-1.5">
 <span className="text-[10px] font-medium text-muted-foreground/50">
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
 type="button"
 onClick={() => setTicker(stock.ticker)}
 className={cn(
 "flex w-full items-center justify-between px-3 py-1.5 text-left transition-colors duration-100",
 isActive
 ? "bg-muted/20"
 : "hover:bg-muted/10",
 )}
 >
 <span
 className={cn(
 "text-xs transition-colors",
 isActive ? "text-foreground font-medium" : "text-muted-foreground",
 )}
 >
 {stock.ticker}
 </span>
 {showPrice ? (
 <div className="flex items-center gap-1.5">
 <span className="text-xs tabular-nums text-foreground">
 {formatCurrency(currentBar.close)}
 </span>
 <span
 className={cn(
 "text-xs tabular-nums",
 priceChange > 0
 ? "text-emerald-500"
 : priceChange < 0
 ? "text-red-500"
 : "text-muted-foreground",
 )}
 >
 {priceChange >= 0 ? "+" : ""}
 {priceChange.toFixed(2)}%
 </span>
 </div>
 ) : (
 <span className="text-xs text-muted-foreground/40">--</span>
 )}
 </button>
 );
 })}
 </div>
 </div>
 );
}
