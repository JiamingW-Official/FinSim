"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useMarketData } from "@/hooks/useMarketData";
import { ChartToolbar } from "@/components/chart/ChartToolbar";
import { TimeTravelControls } from "@/components/chart/TimeTravelControls";
import { DrawingToolbar } from "@/components/chart/DrawingToolbar";
import { DrawingOverlay } from "@/components/chart/DrawingOverlay";
import { OrderEntry } from "@/components/trading/OrderEntry";
import { PositionsTable } from "@/components/trading/PositionsTable";
import { MarginPanel } from "@/components/trading/MarginPanel";
import { ShortSqueezeAlert } from "@/components/trading/ShortSqueezeAlert";
import { TradeHistory } from "@/components/trading/TradeHistory";
import { PendingOrders } from "@/components/trading/PendingOrders";
import { ExecutionQuality } from "@/components/trading/ExecutionQuality";
import { WatchlistPanel } from "@/components/trading/WatchlistPanel";
import { PriceAlerts } from "@/components/trading/PriceAlerts";
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
import { ComparisonChart } from "@/components/chart/ComparisonChart";
import { NewsTicker } from "@/components/layout/NewsTicker";
import { AICoachPanel } from "@/components/ai/AICoachPanel";
import { AlphaBotAlerts } from "@/components/ai/AlphaBotAlerts";
import { PositionAlerts } from "@/components/trading/PositionAlerts";
import { PortfolioHeatmap } from "@/components/trading/PortfolioHeatmap";
import { TradeShareCard } from "@/components/trading/TradeShareCard";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// ── Chart area wrapper with DrawingOverlay ────────────────────────────────────

function ChartWithDrawing({ children, flashClass }: { children: React.ReactNode; flashClass: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 0, height: 0 });

  // Measure container
  const measure = useCallback(() => {
    if (containerRef.current) {
      setDims({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      });
    }
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [measure]);

  // Derive price range from visible bars
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);
  const visibleBars = revealedCount > 0 ? allData.slice(0, revealedCount) : allData;

  let priceHigh = 0;
  let priceLow = Infinity;
  for (const bar of visibleBars) {
    if (bar.high > priceHigh) priceHigh = bar.high;
    if (bar.low < priceLow) priceLow = bar.low;
  }
  if (priceLow === Infinity) priceLow = 0;
  // Add 5% padding to match chart's visible scale
  const range = priceHigh - priceLow;
  priceHigh = priceHigh + range * 0.05;
  priceLow = Math.max(0, priceLow - range * 0.05);

  return (
    <div ref={containerRef} className={cn("relative flex-1", flashClass)} data-tutorial="chart">
      {children}
      <DrawingOverlay
        width={dims.width}
        height={dims.height}
        priceHigh={priceHigh}
        priceLow={priceLow}
      />
    </div>
  );
}

const CandlestickChart = dynamic(
  () =>
    import("@/components/chart/CandlestickChart").then(
      (mod) => mod.CandlestickChart,
    ),
  { ssr: false },
);

function ComparePanel() {
  const ticker = useChartStore((s) => s.currentTicker);
  return <ComparisonChart defaultTicker={ticker} />;
}

function OrderBookPanel() {
  const ticker = useChartStore((s) => s.currentTicker);
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);
  const currentPrice =
    allData.length > 0 && revealedCount > 0
      ? allData[Math.min(revealedCount - 1, allData.length - 1)]?.close ?? 0
      : 0;
  if (currentPrice === 0)
    return (
      <div className="p-4 text-xs text-muted-foreground">Loading...</div>
    );
  return <OrderBookDisplay ticker={ticker} currentPrice={currentPrice} />;
}

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
    <>
      {/* ── Desktop layout (md+): 3-panel columns ── */}
      <div className="hidden md:flex h-full">
        <TradeShareCard />
        <AlphaBotAlerts />
        <PositionAlerts />

        {/* ── Left sidebar (220px): Watchlist + PriceAlerts ── */}
        <div
          className="relative flex flex-col border-r border-border bg-card shrink-0"
          style={{ width: 220 }}
          data-tutorial="watchlist"
        >
          {/* WatchlistPanel takes top 60% */}
          <div className="flex flex-col border-b border-border" style={{ flex: "3 3 0" }}>
            <WatchlistPanel />
          </div>
          {/* PriceAlerts takes bottom 40% */}
          <div className="flex flex-col overflow-hidden" style={{ flex: "2 2 0" }}>
            <PriceAlerts />
          </div>

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

        {/* ── Center: Chart + Controls ── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <ChartToolbar data-tutorial="indicators" />
          <IndicatorInfoPanel />

          {/* Chart row: DrawingToolbar (left strip) + chart area */}
          <div className="flex flex-1 overflow-hidden">
            <DrawingToolbar />
            <ChartWithDrawing flashClass={flashClass}>
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
              <ErrorBoundary name="Chart">
                <Suspense fallback={<div className="animate-pulse h-8 bg-muted rounded" />}>
                  <CandlestickChart />
                </Suspense>
              </ErrorBoundary>
            </ChartWithDrawing>
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

          <ContextualTip />
          <NewsTicker />

          {/* Bottom panel: Fundamentals / Order Book / Compare tabs */}
          <div
            className="h-40 shrink-0 overflow-hidden border-t border-border"
            data-tutorial="positions"
          >
            <Tabs defaultValue="fundamentals" className="h-full flex flex-col">
              <TabsList className="h-7 w-full justify-start rounded-none border-b border-border bg-card px-2">
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
                  value="compare"
                  className="h-6 rounded-none border-b-2 border-transparent px-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Compare
                </TabsTrigger>
              </TabsList>
              <TabsContent value="fundamentals" className="flex-1 overflow-auto mt-0">
                <FundamentalsPanel />
              </TabsContent>
              <TabsContent value="orderbook" className="flex-1 overflow-auto mt-0">
                <OrderBookPanel />
              </TabsContent>
              <TabsContent value="compare" className="flex-1 overflow-auto mt-0 data-[state=inactive]:hidden">
                <ComparePanel />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* ── Right sidebar (280px): Order Entry + Tabs ── */}
        <div
          className="relative flex flex-col border-l border-border bg-card shrink-0"
          style={{ width: 280 }}
          data-tutorial="order-entry"
        >
          <Tabs defaultValue="order" className="flex flex-col h-full">
            {/* Tab bar */}
            <TabsList className="h-7 w-full justify-start rounded-none border-b border-border bg-card px-1 shrink-0">
              <TabsTrigger
                value="order"
                className="h-6 rounded-none border-b-2 border-transparent px-2 text-[10px] data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Order
              </TabsTrigger>
              <TabsTrigger
                value="positions"
                className="h-6 rounded-none border-b-2 border-transparent px-2 text-[10px] data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Positions
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="h-6 rounded-none border-b-2 border-transparent px-2 text-[10px] data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Orders{pendingCount > 0 && ` (${pendingCount})`}
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="h-6 rounded-none border-b-2 border-transparent px-2 text-[10px] data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                History
              </TabsTrigger>
              <TabsTrigger
                value="execution"
                className="h-6 rounded-none border-b-2 border-transparent px-2 text-[10px] data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Exec
              </TabsTrigger>
            </TabsList>

            {/* Order tab: OrderEntry + AI Coach stacked */}
            <TabsContent
              value="order"
              className="flex-1 flex flex-col overflow-hidden mt-0 data-[state=inactive]:hidden"
            >
              <div className="flex-1 min-h-0 overflow-y-auto">
                <ErrorBoundary name="OrderEntry">
                  <OrderEntry />
                </ErrorBoundary>
                <div className="px-3 pb-3 space-y-2">
                  <ErrorBoundary name="ShortSqueezeAlert">
                    <ShortSqueezeAlert />
                  </ErrorBoundary>
                  <ErrorBoundary name="MarginPanel">
                    <MarginPanel />
                  </ErrorBoundary>
                </div>
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
              <ErrorBoundary name="AICoachPanel">
                <AICoachPanel />
              </ErrorBoundary>
            </TabsContent>

            {/* Positions tab */}
            <TabsContent
              value="positions"
              className="flex-1 overflow-auto mt-0 data-[state=inactive]:hidden"
            >
              <PositionsTable />
              <div className="border-t border-border/50 mt-2 pt-2">
                <ErrorBoundary name="PortfolioHeatmap">
                  <PortfolioHeatmap />
                </ErrorBoundary>
              </div>
              <div className="px-3 pb-3 space-y-2 mt-2">
                <ErrorBoundary name="MarginPanelPositions">
                  <MarginPanel />
                </ErrorBoundary>
              </div>
            </TabsContent>

            {/* Pending Orders tab */}
            <TabsContent
              value="pending"
              className="flex-1 overflow-auto mt-0 data-[state=inactive]:hidden"
            >
              <PendingOrders />
            </TabsContent>

            {/* History tab — last 10 trades */}
            <TabsContent
              value="history"
              className="flex-1 overflow-auto mt-0 data-[state=inactive]:hidden"
            >
              <TradeHistory />
            </TabsContent>

            {/* Execution Quality tab */}
            <TabsContent
              value="execution"
              className="flex-1 overflow-auto mt-0 data-[state=inactive]:hidden"
            >
              <ExecutionQuality />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ── Mobile layout (< md): vertical stack ── */}
      <div className="flex flex-col h-full md:hidden overflow-y-auto">
        <TradeShareCard />
        <AlphaBotAlerts />
        <PositionAlerts />

        {/* Chart toolbar */}
        <ChartToolbar data-tutorial="indicators" />
        <IndicatorInfoPanel />

        {/* Chart — fixed height on mobile */}
        <div className="relative h-[300px] shrink-0 flex" data-tutorial="chart">
          <DrawingToolbar />
          <ChartWithDrawing flashClass={flashClass}>
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
          </ChartWithDrawing>
        </div>

        <div className="relative" data-tutorial="time-travel">
          <TimeTravelControls />
        </div>

        <ContextualTip />
        <NewsTicker />

        {/* Mobile tab panel */}
        <div className="border-t border-border">
          <Tabs defaultValue="order">
            <TabsList className="h-9 w-full justify-start rounded-none border-b border-border bg-card px-2 overflow-x-auto flex-nowrap">
              <TabsTrigger
                value="order"
                className="h-7 shrink-0 rounded-none border-b-2 border-transparent px-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Order
              </TabsTrigger>
              <TabsTrigger
                value="positions"
                className="h-7 shrink-0 rounded-none border-b-2 border-transparent px-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Positions
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="h-7 shrink-0 rounded-none border-b-2 border-transparent px-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                History
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="h-7 shrink-0 rounded-none border-b-2 border-transparent px-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Pending{pendingCount > 0 && ` (${pendingCount})`}
              </TabsTrigger>
              <TabsTrigger
                value="watchlist"
                className="h-7 shrink-0 rounded-none border-b-2 border-transparent px-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Watchlist
              </TabsTrigger>
              <TabsTrigger
                value="ai"
                className="h-7 shrink-0 rounded-none border-b-2 border-transparent px-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                AI Coach
              </TabsTrigger>
            </TabsList>
            <TabsContent value="order" className="mt-0">
              <OrderEntry />
            </TabsContent>
            <TabsContent value="positions" className="mt-0">
              <PositionsTable />
            </TabsContent>
            <TabsContent value="history" className="mt-0">
              <TradeHistory />
            </TabsContent>
            <TabsContent value="pending" className="mt-0">
              <PendingOrders />
            </TabsContent>
            <TabsContent value="watchlist" className="mt-0 h-80">
              <WatchlistPanel />
            </TabsContent>
            <TabsContent value="ai" className="mt-0">
              <AICoachPanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
