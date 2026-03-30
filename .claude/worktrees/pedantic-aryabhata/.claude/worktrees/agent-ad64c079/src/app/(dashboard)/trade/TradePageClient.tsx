"use client";

import { useState, useEffect, useMemo } from "react";
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
import { useChartStore } from "@/stores/chart-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { ContextualTip } from "@/components/game/ContextualTip";
import { IndicatorInfoPanel } from "@/components/education/IndicatorInfoPanel";
import { FundamentalsPanel } from "@/components/trading/FundamentalsPanel";
import { OrderBookDisplay } from "@/components/trading/OrderBookDisplay";
import { VolumeProfileChart } from "@/components/market/VolumeProfileChart";
import { AlertsPanel } from "@/components/trading/AlertsPanel";
import { JournalPanel } from "@/components/trading/JournalPanel";
import { calculateVolumeProfile } from "@/services/market/volume-profile";
import { NewsTicker } from "@/components/layout/NewsTicker";
import { AICoachPanel } from "@/components/ai/AICoachPanel";
import { AlphaBotAlerts } from "@/components/ai/AlphaBotAlerts";
import { TradeShareCard } from "@/components/trading/TradeShareCard";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const CandlestickChart = dynamic(
  () =>
    import("@/components/chart/CandlestickChart").then(
      (mod) => mod.CandlestickChart,
    ),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading chart...</div> },
);

function OrderBookPanel() {
  const ticker = useChartStore((s) => s.currentTicker);
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);
  const currentPrice = allData.length > 0 && revealedCount > 0
    ? allData[Math.min(revealedCount - 1, allData.length - 1)]?.close ?? 0
    : 0;
  if (currentPrice === 0) return <div className="flex items-center justify-center gap-2 p-4 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading order book...</div>;
  return <OrderBookDisplay ticker={ticker} currentPrice={currentPrice} />;
}

function VolumeProfilePanel() {
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);

  const profile = useMemo(() => {
    const visible = allData.slice(0, revealedCount);
    if (visible.length < 5) return null;
    const bars = visible.map((b) => ({
      open: b.open,
      high: b.high,
      low: b.low,
      close: b.close,
      volume: b.volume,
    }));
    return calculateVolumeProfile(bars);
  }, [allData, revealedCount]);

  const currentPrice = useMemo(() => {
    if (allData.length === 0 || revealedCount === 0) return 0;
    return allData[Math.min(revealedCount - 1, allData.length - 1)]?.close ?? 0;
  }, [allData, revealedCount]);

  if (!profile || currentPrice === 0) {
    return <div className="p-4 text-xs text-muted-foreground">Advance more bars to see volume profile</div>;
  }
  return <VolumeProfileChart profile={profile} currentPrice={currentPrice} />;
}

export function TradePageClient() {
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

  // Determine which onboarding hint to show (sequential) — time-travel removed
  const showTimeTravel = false;
  const showOrderEntry = false; // disabled — popup blocks order entry UX
  const showWatchlist = false; // disabled — all onboarding hints auto-dismissed

  const [mobilePanel, setMobilePanel] = useState<"chart" | "order" | "watchlist">("chart");

  return (
    <div className="flex h-full">
      <TradeShareCard />
      <AlphaBotAlerts />

      {/* Mobile tab bar */}
      <div className="fixed bottom-14 left-0 right-0 z-30 flex items-center border-t border-border bg-card/95 backdrop-blur-sm md:hidden">
        <button
          onClick={() => setMobilePanel("chart")}
          className={cn("flex-1 py-2 text-[11px] font-medium transition-colors", mobilePanel === "chart" ? "text-primary" : "text-muted-foreground")}
        >
          Chart
        </button>
        <button
          onClick={() => setMobilePanel("order")}
          className={cn("flex-1 py-2 text-[11px] font-medium transition-colors", mobilePanel === "order" ? "text-primary" : "text-muted-foreground")}
        >
          Order
        </button>
        <button
          onClick={() => setMobilePanel("watchlist")}
          className={cn("flex-1 py-2 text-[11px] font-medium transition-colors", mobilePanel === "watchlist" ? "text-primary" : "text-muted-foreground")}
        >
          Watchlist
        </button>
      </div>

      {/* Left: Watchlist — hidden on mobile unless selected */}
      <div className={cn("relative", mobilePanel !== "watchlist" && "hidden md:block")} data-tutorial="watchlist">
        <Watchlist />
      </div>

      {/* Center: Chart + Time Travel + Positions/History */}
      <div className={cn("flex flex-1 flex-col overflow-hidden", mobilePanel !== "chart" && "hidden md:flex")}>
        <ChartToolbar data-tutorial="indicators" />
        <div className="hidden md:block">
          <IndicatorInfoPanel />
        </div>

        <div className={cn("relative flex-1", flashClass)} data-tutorial="chart">
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

        <div className="relative" data-tutorial="time-travel">
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

        <div className="hidden md:block">
          <ContextualTip />
          <NewsTicker />
        </div>

        {/* Bottom panel: Positions & History tabs */}
        <div className="h-32 md:h-48 shrink-0 overflow-hidden border-t border-border" data-tutorial="positions">
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
              <TabsTrigger
                value="fundamentals"
                className="h-6 rounded-none border-b-2 border-transparent px-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Fundamentals
              </TabsTrigger>
              <TabsTrigger
                value="orderbook"
                className="h-6 rounded-none border-b-2 border-transparent px-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Order Book
              </TabsTrigger>
              <TabsTrigger
                value="volume-profile"
                className="h-6 rounded-none border-b-2 border-transparent px-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Volume Profile
              </TabsTrigger>
              <TabsTrigger
                value="alerts"
                className="h-6 rounded-none border-b-2 border-transparent px-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Alerts
              </TabsTrigger>
              <TabsTrigger
                value="journal"
                className="h-6 rounded-none border-b-2 border-transparent px-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Journal
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
            <TabsContent value="fundamentals" className="flex-1 overflow-auto mt-0">
              <FundamentalsPanel />
            </TabsContent>
            <TabsContent value="orderbook" className="flex-1 overflow-auto mt-0">
              <OrderBookPanel />
            </TabsContent>
            <TabsContent value="volume-profile" className="flex-1 overflow-auto mt-0">
              <VolumeProfilePanel />
            </TabsContent>
            <TabsContent value="alerts" className="flex-1 overflow-auto mt-0">
              <AlertsPanel />
            </TabsContent>
            <TabsContent value="journal" className="flex-1 overflow-auto mt-0">
              <JournalPanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right: Order Entry + AI Coach */}
      <div className={cn("relative w-full md:w-64 shrink-0 flex flex-col border-l border-border bg-card", mobilePanel !== "order" && "hidden md:flex")} data-tutorial="order-entry">
        <div className="flex-1 min-h-0 overflow-y-auto">
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
        <AICoachPanel />
      </div>
    </div>
  );
}
