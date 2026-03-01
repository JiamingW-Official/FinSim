"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useMarketData } from "@/hooks/useMarketData";
import { ChartToolbar } from "@/components/chart/ChartToolbar";
import { TimeTravelControls } from "@/components/chart/TimeTravelControls";
import { OrderEntry } from "@/components/trading/OrderEntry";
import { PositionsTable } from "@/components/trading/PositionsTable";
import { TradeHistory } from "@/components/trading/TradeHistory";
import { PendingOrders } from "@/components/trading/PendingOrders";
import { Watchlist } from "@/components/layout/Watchlist";
import { OnboardingHint } from "@/components/game/OnboardingHint";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useTradingStore } from "@/stores/trading-store";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const CandlestickChart = dynamic(
  () =>
    import("@/components/chart/CandlestickChart").then(
      (mod) => mod.CandlestickChart,
    ),
  { ssr: false },
);

export default function TradePage() {
  const { isLoading, error } = useMarketData();
  useKeyboardShortcuts();
  const pendingCount = useTradingStore((s) => s.pendingOrders.length);
  const { shouldShow, dismiss } = useOnboarding();

  // Trade execution flash
  const lastTradeFlash = useTradingStore((s) => s.lastTradeFlash);
  const clearTradeFlash = useTradingStore((s) => s.clearTradeFlash);
  const [flashClass, setFlashClass] = useState("");

  useEffect(() => {
    if (!lastTradeFlash) return;
    setFlashClass(
      lastTradeFlash.side === "buy"
        ? "chart-border-flash-buy"
        : "chart-border-flash-sell",
    );
    const timer = setTimeout(() => {
      setFlashClass("");
      clearTradeFlash();
    }, 500);
    return () => clearTimeout(timer);
  }, [lastTradeFlash, clearTradeFlash]);

  // Determine which onboarding hint to show (sequential)
  const showTimeTravel = shouldShow("time-travel");
  const showOrderEntry = !showTimeTravel && shouldShow("order-entry");
  const showWatchlist = !showTimeTravel && !showOrderEntry && shouldShow("watchlist");

  return (
    <div className="flex h-full">
      {/* Left: Watchlist */}
      <div className="relative">
        <Watchlist />
        {showWatchlist && (
          <OnboardingHint
            title="Watchlist"
            description="Switch between stocks to analyze different tickers. Click any stock to load its chart."
            visible
            onDismiss={() => dismiss("watchlist")}
            position="bottom"
            className="left-2 top-10"
          />
        )}
      </div>

      {/* Center: Chart + Time Travel + Positions/History */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <ChartToolbar />

        <div className={cn("relative flex-1", flashClass)}>
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          {error && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
              <p className="text-sm text-destructive">
                Failed to load data. Please try again.
              </p>
            </div>
          )}
          <CandlestickChart />
        </div>

        <div className="relative">
          <TimeTravelControls />
          {showTimeTravel && (
            <OnboardingHint
              title="Time Travel"
              description="Use the slider or play button to advance through historical market data, one bar at a time."
              visible
              onDismiss={() => dismiss("time-travel")}
              position="top"
              className="left-4"
            />
          )}
        </div>

        {/* Bottom panel: Positions & History tabs */}
        <div className="h-48 shrink-0 overflow-hidden border-t border-border">
          <Tabs defaultValue="positions" className="h-full flex flex-col">
            <TabsList className="h-7 w-full justify-start rounded-none border-b border-border bg-card px-2">
              <TabsTrigger
                value="positions"
                className="h-6 rounded-none border-b-2 border-transparent px-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Positions
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="h-6 rounded-none border-b-2 border-transparent px-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                History
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="h-6 rounded-none border-b-2 border-transparent px-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Pending{pendingCount > 0 && ` (${pendingCount})`}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="positions" className="flex-1 overflow-auto mt-0">
              <PositionsTable />
            </TabsContent>
            <TabsContent value="history" className="flex-1 overflow-auto mt-0">
              <TradeHistory />
            </TabsContent>
            <TabsContent value="pending" className="flex-1 overflow-auto mt-0">
              <PendingOrders />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right: Order Entry */}
      <div className="relative w-64 shrink-0 overflow-y-auto border-l border-border bg-card">
        <OrderEntry />
        {showOrderEntry && (
          <OnboardingHint
            title="Place Orders"
            description="Enter quantity and choose order type. Try a market buy to get started, or use limit orders for more control."
            visible
            onDismiss={() => dismiss("order-entry")}
            position="bottom"
            className="left-2 top-12"
          />
        )}
      </div>
    </div>
  );
}
