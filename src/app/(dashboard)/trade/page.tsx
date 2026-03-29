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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useTradingStore } from "@/stores/trading-store";
import { useChartStore } from "@/stores/chart-store";
import { useMarketDataStore } from "@/stores/market-data-store";
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
import { TradeReplay } from "@/components/trading/TradeReplay";
import { MarginDashboard } from "@/components/trading/MarginDashboard";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";

// ── Shared tab trigger style ────────────────────────────────────────────────
const tabTrigger =
  "h-5 rounded-none border-b border-transparent px-1.5 text-[10px] font-mono tracking-tight text-muted-foreground/50 data-[state=active]:border-foreground/40 data-[state=active]:text-foreground/80 data-[state=active]:bg-transparent transition-colors";

// ── Chart area wrapper with DrawingOverlay ────────────────────────────────────

function ChartWithDrawing({ children, flashClass }: { children: React.ReactNode; flashClass: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 0, height: 0 });

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
      <div className="p-2 text-[10px] font-mono text-muted-foreground/60">Loading...</div>
    );
  return <OrderBookDisplay ticker={ticker} currentPrice={currentPrice} />;
}

export default function TradePage() {
  const { isLoading, error } = useMarketData();
  useKeyboardShortcuts();
  const pendingCount = useTradingStore((s) => s.pendingOrders.length);

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

  // Main view: "trade" or "replay"
  const [mainView, setMainView] = useState<"trade" | "replay">("trade");

  return (
    <>
      {/* ── Desktop layout (md+): 3-panel columns ── */}
      <div className="hidden md:flex h-full flex-col">
        <TradeShareCard />
        <AlphaBotAlerts />
        <PositionAlerts />

        {/* ── Top view switcher — minimal, monochrome ── */}
        <div className="flex items-center gap-0.5 border-b border-border/10 px-3 py-0.5 shrink-0">
          <button
            onClick={() => setMainView("trade")}
            className={cn(
              "rounded px-2 py-0.5 text-[10px] font-mono tracking-tight transition-colors",
              mainView === "trade"
                ? "bg-foreground/10 text-foreground/80"
                : "text-muted-foreground/40 hover:text-muted-foreground/70",
            )}
          >
            Trade
          </button>
          <button
            onClick={() => setMainView("replay")}
            className={cn(
              "flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono tracking-tight transition-colors",
              mainView === "replay"
                ? "bg-foreground/10 text-foreground/80"
                : "text-muted-foreground/40 hover:text-muted-foreground/70",
            )}
          >
            <RefreshCw className="h-2.5 w-2.5" />
            Replay
          </button>
        </div>

        {/* ── Replay view ── */}
        {mainView === "replay" && (
          <div className="flex-1 overflow-hidden">
            <TradeReplay />
          </div>
        )}

        {/* ── Trade view ── */}
        <div className={cn("flex flex-1 overflow-hidden", mainView !== "trade" && "hidden")}>

        {/* ── Left sidebar (180px): Watchlist + PriceAlerts ── */}
        <div
          className="flex flex-col border-r border-border/10 shrink-0"
          style={{ width: 180 }}
        >
          <div className="flex flex-col border-b border-border/10" style={{ flex: "3 3 0" }}>
            <WatchlistPanel />
          </div>
          <div className="flex flex-col overflow-hidden" style={{ flex: "2 2 0" }}>
            <PriceAlerts />
          </div>
        </div>

        {/* ── Center: Chart + Controls (chart is king) ── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <ChartToolbar data-tutorial="indicators" />
          <IndicatorInfoPanel />

          {/* Chart row: DrawingToolbar (left strip) + chart area */}
          <div className="flex flex-1 overflow-hidden">
            <DrawingToolbar />
            <ChartWithDrawing flashClass={flashClass}>
              {isLoading && (
                <div className="absolute inset-0 z-10 flex flex-col gap-1 bg-background/80 p-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <div className="flex flex-1 items-end gap-[2px] px-1">
                    {Array.from({ length: 48 }).map((_, i) => (
                      <Skeleton
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{ height: `${25 + Math.sin(i * 0.4) * 20 + Math.random() * 30}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-2.5 w-10" />
                    ))}
                  </div>
                </div>
              )}
              {error && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
                  <p className="text-xs font-mono text-destructive">
                    Failed to load data.
                  </p>
                </div>
              )}
              <ErrorBoundary name="Chart">
                <Suspense fallback={<div className="animate-pulse h-6 bg-muted/30 rounded" />}>
                  <CandlestickChart />
                </Suspense>
              </ErrorBoundary>
            </ChartWithDrawing>
          </div>

          <div className="relative" data-tutorial="time-travel">
            <TimeTravelControls />
          </div>

          <NewsTicker />

          {/* Bottom panel: Fundamentals / Order Book / Compare */}
          <div
            className="h-28 shrink-0 overflow-hidden border-t border-border/10"
            data-tutorial="positions"
          >
            <Tabs defaultValue="fundamentals" className="h-full flex flex-col">
              <TabsList className="h-5 w-full justify-start rounded-none border-b border-border/10 bg-transparent px-2 shrink-0">
                <TabsTrigger value="fundamentals" className={tabTrigger}>
                  Fundamentals
                </TabsTrigger>
                <TabsTrigger value="orderbook" className={tabTrigger}>
                  Book
                </TabsTrigger>
                <TabsTrigger value="compare" className={tabTrigger}>
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

        {/* ── Right sidebar (240px): Order Entry + tabs ── */}
        <div
          className="flex flex-col border-l border-border/10 shrink-0"
          style={{ width: 240 }}
          data-tutorial="order-entry"
        >
          <Tabs defaultValue="order" className="flex flex-col h-full">
            {/* Tab bar */}
            <TabsList className="h-5 w-full justify-start rounded-none border-b border-border/10 bg-transparent px-1 shrink-0">
              <TabsTrigger value="order" className={tabTrigger}>
                Order
              </TabsTrigger>
              <TabsTrigger value="positions" className={tabTrigger}>
                Pos
              </TabsTrigger>
              <TabsTrigger value="pending" className={tabTrigger}>
                Ord{pendingCount > 0 && <span className="ml-0.5 font-mono text-[9px] text-muted-foreground/40">{pendingCount}</span>}
              </TabsTrigger>
              <TabsTrigger value="history" className={tabTrigger}>
                Hist
              </TabsTrigger>
              <TabsTrigger value="execution" className={tabTrigger}>
                Exec
              </TabsTrigger>
              <TabsTrigger value="margin" className={tabTrigger}>
                Mgn
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
                <div className="mx-2 my-1 border-t border-border/10" />
                <div className="px-2 pb-2 space-y-1">
                  <ErrorBoundary name="ShortSqueezeAlert">
                    <ShortSqueezeAlert />
                  </ErrorBoundary>
                  <ErrorBoundary name="MarginPanel">
                    <MarginPanel />
                  </ErrorBoundary>
                </div>
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
              <div className="border-t border-border/10 mt-1 pt-1">
                <ErrorBoundary name="PortfolioHeatmap">
                  <PortfolioHeatmap />
                </ErrorBoundary>
              </div>
              <div className="px-2 pb-2 space-y-1 mt-1">
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

            {/* History tab */}
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

            {/* Margin Dashboard tab */}
            <TabsContent
              value="margin"
              className="flex-1 overflow-auto mt-0 data-[state=inactive]:hidden p-1.5"
            >
              <MarginDashboard />
            </TabsContent>
          </Tabs>
        </div>
        </div>{/* end trade view wrapper */}
        <p className="shrink-0 border-t border-border/10 px-3 py-0.5 text-center text-[9px] font-mono text-muted-foreground/30">
          Simulated trading -- not financial advice
        </p>
      </div>

      {/* ── Mobile layout (< md): vertical stack ── */}
      <div className="flex flex-col h-full md:hidden overflow-y-auto">
        <TradeShareCard />
        <AlphaBotAlerts />
        <PositionAlerts />

        {/* Chart toolbar */}
        <ChartToolbar data-tutorial="indicators" />
        <IndicatorInfoPanel />

        {/* Chart */}
        <div className="relative h-[300px] shrink-0 flex" data-tutorial="chart">
          <DrawingToolbar />
          <ChartWithDrawing flashClass={flashClass}>
            {isLoading && (
              <div className="absolute inset-0 z-10 flex flex-col gap-1 bg-background/80 p-2">
                <Skeleton className="h-3 w-16" />
                <div className="flex flex-1 items-end gap-[2px]">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{ height: `${25 + Math.sin(i * 0.4) * 20 + Math.random() * 30}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-2.5 w-8" />
                  ))}
                </div>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
                <p className="text-xs font-mono text-destructive">
                  Failed to load data.
                </p>
              </div>
            )}
            <CandlestickChart />
          </ChartWithDrawing>
        </div>

        <div className="relative" data-tutorial="time-travel">
          <TimeTravelControls />
        </div>

        <NewsTicker />

        {/* Mobile tab panel */}
        <div className="border-t border-border/10">
          <Tabs defaultValue="order">
            <TabsList className="h-7 w-full justify-start rounded-none border-b border-border/10 bg-transparent px-1 overflow-x-auto flex-nowrap">
              {["order", "positions", "history", "pending", "watchlist", "ai", "replay"].map((val) => (
                <TabsTrigger
                  key={val}
                  value={val}
                  className="h-5 shrink-0 rounded-none border-b border-transparent px-2 text-[10px] font-mono text-muted-foreground/50 data-[state=active]:border-foreground/40 data-[state=active]:text-foreground/80 data-[state=active]:bg-transparent"
                >
                  {val === "order" ? "Order" :
                   val === "positions" ? "Positions" :
                   val === "history" ? "History" :
                   val === "pending" ? `Pending${pendingCount > 0 ? ` ${pendingCount}` : ""}` :
                   val === "watchlist" ? "Watch" :
                   val === "ai" ? "Analysis" : "Replay"}
                </TabsTrigger>
              ))}
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
            <TabsContent value="watchlist" className="mt-0 h-72">
              <WatchlistPanel />
            </TabsContent>
            <TabsContent value="ai" className="mt-0">
              <AICoachPanel />
            </TabsContent>
            <TabsContent value="replay" className="mt-0 h-[600px]">
              <TradeReplay />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <p className="shrink-0 border-t border-border/10 px-3 py-0.5 text-center text-[9px] font-mono text-muted-foreground/30 md:hidden">
        Simulated trading -- not financial advice
      </p>
    </>
  );
}
