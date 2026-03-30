"use client";

import { useMemo, useCallback } from "react";
import { Bell, BellOff, Trash2, TrendingUp, TrendingDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWatchlistStore } from "@/stores/watchlist-store";
import type { WatchlistItem } from "@/stores/watchlist-store";

import { simulateTickerPrice, getDaySeed } from "@/services/market-data/simulate-price";

function simulatedPrice(ticker: string): number {
 return simulateTickerPrice(ticker, getDaySeed()).price;
}

interface ActiveAlert {
 ticker: string;
 direction: "above" | "below";
 targetPrice: number;
 currentPrice: number;
 distancePct: number;
 enabled: boolean;
}

function buildAlerts(watchlist: WatchlistItem[]): ActiveAlert[] {
 const alerts: ActiveAlert[] = [];
 for (const item of watchlist) {
 const currentPrice = simulatedPrice(item.ticker);
 if (item.alertAbove !== undefined) {
 const distancePct = ((item.alertAbove - currentPrice) / currentPrice) * 100;
 alerts.push({
 ticker: item.ticker,
 direction: "above",
 targetPrice: item.alertAbove,
 currentPrice,
 distancePct,
 enabled: item.alertAboveEnabled !== false,
 });
 }
 if (item.alertBelow !== undefined) {
 const distancePct = ((currentPrice - item.alertBelow) / currentPrice) * 100;
 alerts.push({
 ticker: item.ticker,
 direction: "below",
 targetPrice: item.alertBelow,
 currentPrice,
 distancePct,
 enabled: item.alertBelowEnabled !== false,
 });
 }
 }
 // Sort by proximity (smallest absolute distance first)
 return alerts.sort((a, b) => Math.abs(a.distancePct) - Math.abs(b.distancePct));
}

function ProximityBar({ distancePct, direction }: { distancePct: number; direction: "above" | "below" }) {
 // Fill from 0% (very far) to 100% (at the level)
 const fillPct = Math.max(0, Math.min(100, 100 - Math.abs(distancePct) * 5));
 const isClose = Math.abs(distancePct) < 2;

 return (
 <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
 <div
 className={cn(
 "h-full rounded-full transition-colors duration-300",
 isClose
 ? "bg-amber-500"
 : direction === "above"
 ? "bg-green-500/60"
 : "bg-red-500/60",
 )}
 style={{ width: `${fillPct}%` }}
 />
 </div>
 );
}

interface AlertRowProps {
 alert: ActiveAlert;
 onToggle: (ticker: string, direction: "above" | "below", enabled: boolean) => void;
 onRemove: (ticker: string, direction: "above" | "below") => void;
}

function AlertRow({ alert, onToggle, onRemove }: AlertRowProps) {
 const { ticker, direction, targetPrice, currentPrice, distancePct, enabled } = alert;
 const isClose = Math.abs(distancePct) < 2;
 const crossed = distancePct < 0;

 return (
 <div
 className={cn(
 "group px-3 py-2.5 border-b border-border last:border-0 transition-colors",
 !enabled && "opacity-50",
 isClose && enabled && "bg-amber-500/5",
 )}
 >
 {/* Row header */}
 <div className="flex items-center gap-2 mb-1.5">
 <div className="flex items-center gap-1.5 flex-1 min-w-0">
 <span className="text-xs font-semibold text-foreground">{ticker}</span>
 <span
 className={cn(
 "flex items-center gap-0.5 text-xs font-medium",
 direction === "above" ? "text-green-500" : "text-red-500",
 )}
 >
 {direction === "above" ? (
 <TrendingUp className="h-2.5 w-2.5" />
 ) : (
 <TrendingDown className="h-2.5 w-2.5" />
 )}
 {direction === "above" ? "Above" : "Below"}
 </span>
 {isClose && enabled && (
 <span className="text-[11px] font-medium text-amber-500 border border-amber-500/30 rounded px-1 py-0.5 leading-none">
 NEAR
 </span>
 )}
 {crossed && enabled && (
 <span className="text-[11px] font-medium text-primary border border-primary/30 rounded px-1 py-0.5 leading-none">
 PASSED
 </span>
 )}
 </div>

 {/* Controls */}
 <button
 onClick={() => onToggle(ticker, direction, !enabled)}
 title={enabled ? "Disable alert" : "Enable alert"}
 className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
 >
 {enabled ? (
 <Bell className="h-3 w-3 text-primary/70" />
 ) : (
 <BellOff className="h-3 w-3" />
 )}
 </button>
 <button
 onClick={() => onRemove(ticker, direction)}
 title="Remove alert"
 className="shrink-0 rounded p-1 text-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-colors"
 >
 <X className="h-3 w-3" />
 </button>
 </div>

 {/* Description */}
 <div className="text-xs text-muted-foreground mb-1.5 leading-relaxed">
 Alert fires when{" "}
 <span className="font-semibold text-foreground">{ticker}</span>{" "}
 {direction === "above" ? "rises above" : "drops below"}{" "}
 <span className="font-mono tabular-nums text-foreground">${targetPrice.toFixed(2)}</span>
 {" "}
 <span className="text-muted-foreground/60">
 (currently{" "}
 <span className="font-mono tabular-nums">${currentPrice.toFixed(2)}</span>,{" "}
 {Math.abs(distancePct).toFixed(1)}% away)
 </span>
 </div>

 {/* Proximity bar */}
 <ProximityBar distancePct={distancePct} direction={direction} />
 </div>
 );
}

export function PriceAlerts() {
 const { watchlist, setAlert, clearAlert, toggleAlertAbove, toggleAlertBelow } =
 useWatchlistStore();

 const alerts = useMemo(() => buildAlerts(watchlist), [watchlist]);

 const handleToggle = useCallback(
 (ticker: string, direction: "above" | "below", enabled: boolean) => {
 if (direction === "above") {
 toggleAlertAbove(ticker, enabled);
 } else {
 toggleAlertBelow(ticker, enabled);
 }
 },
 [toggleAlertAbove, toggleAlertBelow],
 );

 const handleRemove = useCallback(
 (ticker: string, direction: "above" | "below") => {
 const item = watchlist.find((w) => w.ticker === ticker);
 if (!item) return;
 if (direction === "above") {
 setAlert(ticker, undefined, item.alertBelow);
 } else {
 setAlert(ticker, item.alertAbove, undefined);
 }
 },
 [watchlist, setAlert],
 );

 const handleClearAll = useCallback(() => {
 for (const item of watchlist) {
 clearAlert(item.ticker);
 }
 }, [watchlist, clearAlert]);

 const activeCount = alerts.filter((a) => a.enabled).length;

 return (
 <div className="flex flex-col h-full bg-card">
 {/* Header */}
 <div className="flex items-center justify-between border-b border-border px-3 py-2 shrink-0">
 <div className="flex items-center gap-2">
 <span className="text-xs font-medium text-muted-foreground">
 Price Alerts
 </span>
 {activeCount > 0 && (
 <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[11px] font-medium text-primary">
 {activeCount} active
 </span>
 )}
 </div>
 {alerts.length > 0 && (
 <button
 onClick={handleClearAll}
 className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
 title="Clear all alerts"
 >
 <Trash2 className="h-3 w-3" />
 Clear all
 </button>
 )}
 </div>

 {/* Alert list */}
 <div className="flex-1 overflow-y-auto">
 {alerts.length === 0 ? (
 <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
 <BellOff className="h-7 w-7 text-muted-foreground/30" />
 <p className="text-xs text-muted-foreground">No price alerts set.</p>
 <p className="text-xs text-muted-foreground/60">
 Add tickers to your watchlist, then tap the bell icon to set alerts.
 </p>
 </div>
 ) : (
 alerts.map((alert) => (
 <AlertRow
 key={`${alert.ticker}-${alert.direction}`}
 alert={alert}
 onToggle={handleToggle}
 onRemove={handleRemove}
 />
 ))
 )}
 </div>
 </div>
 );
}
