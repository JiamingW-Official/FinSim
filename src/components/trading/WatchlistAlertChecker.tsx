"use client";

/**
 * WatchlistAlertChecker
 *
 * Sentinel (no-render) component that watches bar advances and fires
 * Sonner toasts + notification-store entries when a watchlist price alert
 * level is crossed.
 *
 * Deduplication: each (ticker, direction, priceLevel) combination is only
 * fired once per session using the watchlist-store's firedAlerts Set.
 */

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useMarketDataStore } from "@/stores/market-data-store";
import { useChartStore } from "@/stores/chart-store";
import { useWatchlistStore } from "@/stores/watchlist-store";
import { useNotificationStore } from "@/stores/notification-store";

export function WatchlistAlertChecker() {
 const revealedCount = useMarketDataStore((s) => s.revealedCount);
 const allData = useMarketDataStore((s) => s.allData);
 const currentTicker = useChartStore((s) => s.currentTicker);
 const watchlist = useWatchlistStore((s) => s.watchlist);
 const markAlertFired = useWatchlistStore((s) => s.markAlertFired);
 const hasAlertFired = useWatchlistStore((s) => s.hasAlertFired);
 const addNotification = useNotificationStore((s) => s.addNotification);

 // Track previous price per ticker to detect crossings
 const prevPriceRef = useRef<Record<string, number>>({});

 useEffect(() => {
 if (allData.length === 0 || revealedCount === 0) return;

 // Current bar's close is the "live" price for the chart ticker
 const currentBar = allData[Math.min(revealedCount - 1, allData.length - 1)];
 if (!currentBar) return;

 // Only check alerts for the currently charted ticker in real-time;
 // for other watchlist tickers we check using a simulated price proxy
 // (same mulberry32 seed used in WatchlistPanel) — but to keep bar-advance
 // alerts meaningful and free of complexity, we only fire for the active ticker.
 const livePrice = currentBar.close;
 const prevPrice = prevPriceRef.current[currentTicker] ?? livePrice;
 prevPriceRef.current[currentTicker] = livePrice;

 // Find watchlist items for the current ticker with enabled alerts
 for (const item of watchlist) {
 if (item.ticker !== currentTicker) continue;

 // Alert ABOVE
 if (
 item.alertAbove !== undefined &&
 item.alertAboveEnabled !== false
 ) {
 const alertAbove = item.alertAbove;
 const crossed = prevPrice < alertAbove && livePrice >= alertAbove;
 const alertKey = `above:${item.ticker}:${alertAbove.toFixed(2)}`;
 if (crossed && !hasAlertFired(alertKey)) {
 markAlertFired(alertKey);

 toast.custom(
 () => (
 <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
 <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/15 border border-green-500/30">
 <TrendingUp className="h-4 w-4 text-green-500" />
 </div>
 <div className="min-w-0">
 <div className="text-sm font-semibold text-foreground">
 Alert: {item.ticker} crossed ${alertAbove.toFixed(2)}
 </div>
 <div className="text-[11px] text-muted-foreground">
 Price rose to{" "}
 <span className="font-mono tabular-nums text-green-500">
 ${livePrice.toFixed(2)}
 </span>
 </div>
 </div>
 </div>
 ),
 { duration: 6000, position: "top-right" },
 );

 addNotification({
 type: "trade",
 title: `${item.ticker} above $${alertAbove.toFixed(2)}`,
 description: `Price crossed $${alertAbove.toFixed(2)} — now at $${livePrice.toFixed(2)}`,
 icon: "TrendingUp",
 color: "text-green-500",
 });
 }
 }

 // Alert BELOW
 if (
 item.alertBelow !== undefined &&
 item.alertBelowEnabled !== false
 ) {
 const alertBelow = item.alertBelow;
 const crossed = prevPrice > alertBelow && livePrice <= alertBelow;
 const alertKey = `below:${item.ticker}:${alertBelow.toFixed(2)}`;
 if (crossed && !hasAlertFired(alertKey)) {
 markAlertFired(alertKey);

 toast.custom(
 () => (
 <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
 <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/15 border border-red-500/30">
 <TrendingDown className="h-4 w-4 text-red-500" />
 </div>
 <div className="min-w-0">
 <div className="text-sm font-semibold text-foreground">
 Alert: {item.ticker} crossed ${alertBelow.toFixed(2)}
 </div>
 <div className="text-[11px] text-muted-foreground">
 Price fell to{" "}
 <span className="font-mono tabular-nums text-red-500">
 ${livePrice.toFixed(2)}
 </span>
 </div>
 </div>
 </div>
 ),
 { duration: 6000, position: "top-right" },
 );

 addNotification({
 type: "trade",
 title: `${item.ticker} below $${alertBelow.toFixed(2)}`,
 description: `Price crossed $${alertBelow.toFixed(2)} — now at $${livePrice.toFixed(2)}`,
 icon: "TrendingDown",
 color: "text-red-500",
 });
 }
 }
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [revealedCount]);

 return null;
}
