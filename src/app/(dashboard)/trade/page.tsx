"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useMarketData } from "@/hooks/useMarketData";
import { ChartToolbar } from "@/components/chart/ChartToolbar";
import { GameStatusBar } from "@/components/game/GameStatusBar";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useCompetitionAdvance } from "@/hooks/useCompetitionAdvance";
import { useGameClockBarSync } from "@/hooks/useGameClockBarSync";
import { useGameClock } from "@/hooks/useGameClock";
import { usePositionPricer } from "@/hooks/usePositionPricer";
import { useTradingStore } from "@/stores/trading-store";
import { useChartStore } from "@/stores/chart-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { useClockStore } from "@/stores/clock-store";
import { useCompetitionStore } from "@/stores/competition-store";
import { LobbyScreen } from "@/components/game/LobbyScreen";
import { SeasonSummary } from "@/components/game/SeasonSummary";
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

// ── Live info bar helpers ────────────────────────────────────────────────────
function formatLiveDate(iso: string): string {
 const [y, m, d] = iso.split("-").map(Number);
 const date = new Date(Date.UTC(y, m - 1, d));
 return date.toLocaleDateString("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
 });
}

// ── Live info bar ────────────────────────────────────────────────────────────
function LiveInfoBar() {
 // Three separate primitive selectors — Zustand compares primitives with Object.is,
 // so these never cause spurious re-renders. An object selector would create a new
 // reference every call → forceStoreRerender loop.
 const price = useMarketDataStore((s) => {
  const idx = s.revealedCount > 0 ? s.revealedCount - 1 : s.allData.length - 1;
  return s.allData[idx]?.close ?? 0;
 });
 const prevClose = useMarketDataStore((s) => {
  const idx = s.revealedCount > 0 ? s.revealedCount - 1 : s.allData.length - 1;
  return s.allData[idx - 1]?.close ?? 0;
 });
 const change = prevClose > 0 ? price - prevClose : 0;
 const changePct = prevClose > 0 ? (change / prevClose) * 100 : 0;
 const ticker = useChartStore((s) => s.currentTicker);
 const portfolioValue = useTradingStore((s) => s.portfolioValue);
 const cash = useTradingStore((s) => s.cash);
 const gameDate = useClockStore((s) => s.gameDate);

 const isUp = change >= 0;

 if (price === 0) return (
  <div className="flex shrink-0 h-9 border-b border-border/30 px-3 items-center gap-0 bg-background/95 backdrop-blur-sm">
   <div className="h-3 w-24 rounded animate-pulse bg-muted/30" />
  </div>
 );

 const pnlVsStart = ((portfolioValue - 100_000) / 100_000) * 100;

 return (
  <div className="flex shrink-0 h-9 border-b border-border/30 px-3 items-center gap-0 bg-background/95 backdrop-blur-sm">

   {/* Group 1: Ticker + Price + Change */}
   <div className="flex items-center gap-2 px-4 pr-4 border-r border-border/20">
    <span className="text-[11px] font-bold tracking-tight text-foreground/90">{ticker}</span>
    <span className="text-[12px] font-mono font-bold tabular-nums text-foreground">${price.toFixed(2)}</span>
    <span className={cn(
     "text-[10px] font-mono tabular-nums",
     isUp ? "text-emerald-400/80" : "text-rose-400/70"
    )}>
     {isUp ? "+" : ""}{change.toFixed(2)} ({isUp ? "+" : ""}{changePct.toFixed(2)}%)
    </span>
   </div>

   {/* Group 2: Portfolio + Cash */}
   <div className="flex items-center gap-4 px-3 border-r border-border/20">
    <div className="flex items-baseline gap-1">
     <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/20">Equity</span>
     <span className="text-[12px] font-mono font-semibold tabular-nums text-foreground/80">${portfolioValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
    </div>
    <div className="flex items-baseline gap-1">
     <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/20">Cash</span>
     <span className="text-[11px] font-mono tabular-nums text-foreground/60">${cash.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
    </div>
   </div>

   {/* Group 3: Season P&L + date */}
   <div className="flex items-center gap-3 px-4">
    <span className={cn(
     "text-[10px] font-mono tabular-nums font-semibold",
     pnlVsStart >= 0 ? "text-emerald-400/70" : "text-rose-400/70"
    )}>
     {pnlVsStart >= 0 ? "+" : ""}{pnlVsStart.toFixed(2)}%
    </span>
    <span className="text-[9px] font-mono text-muted-foreground/30 tabular-nums">
     {formatLiveDate(gameDate)}
    </span>
   </div>

  </div>
 );
}

// ── Shared tab trigger style ────────────────────────────────────────────────
const tabCls =
 "rounded-none border-b-2 border-transparent data-[state=active]:border-primary/70 " +
 "data-[state=active]:bg-transparent data-[state=active]:shadow-none " +
 "px-2.5 py-1.5 text-[10px] font-mono tracking-wider uppercase " +
 "text-muted-foreground/35 data-[state=active]:text-foreground/85 data-[state=active]:font-semibold " +
 "transition-colors duration-150";

// ── Chart area wrapper with DrawingOverlay ────────────────────────────────────

function ChartWithDrawing({ children, flashClass }: { children: React.ReactNode; flashClass: string }) {
 const containerRef = useRef<HTMLDivElement>(null);
 const [dims, setDims] = useState({ width: 0, height: 0 });

 const measure = useCallback(() => {
  if (containerRef.current) {
   setDims({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight });
  }
 }, []);

 useEffect(() => {
  measure();
  const ro = new ResizeObserver(measure);
  if (containerRef.current) ro.observe(containerRef.current);
  return () => ro.disconnect();
 }, [measure]);

 return (
  <div ref={containerRef} className={cn("relative flex-1", flashClass)} data-tutorial="chart">
   {children}
   <DrawingOverlay width={dims.width} height={dims.height} />
  </div>
 );
}

const CandlestickChart = dynamic(
 () => import("@/components/chart/CandlestickChart").then((mod) => mod.CandlestickChart),
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
  return <div className="p-2 text-[10px] font-mono text-muted-foreground/40">Loading...</div>;
 return <OrderBookDisplay ticker={ticker} currentPrice={currentPrice} />;
}

// ── Loading skeleton ────────────────────────────────────────────────────────
function ChartSkeleton({ bars = 48 }: { bars?: number }) {
 return (
  <div className="absolute inset-0 z-10 flex flex-col gap-1 bg-background/80 p-3">
   <div className="flex items-center justify-between">
    <Skeleton className="h-3 w-12" />
   </div>
   <div className="flex flex-1 items-end gap-[2px] px-1">
    {Array.from({ length: bars }).map((_, i) => (
     <Skeleton
      key={i}
      className="flex-1 rounded-sm"
      style={{ height: `${25 + Math.sin(i * 0.4) * 20 + ((i * 17 + 7) % 30)}%` }}
     />
    ))}
   </div>
   <div className="flex justify-between">
    {Array.from({ length: Math.min(bars / 8, 6) }).map((_, i) => (
     <Skeleton key={i} className="h-2.5 w-10" />
    ))}
   </div>
  </div>
 );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function TradePage() {
 const { isLoading, error } = useMarketData();
 useKeyboardShortcuts();
 useGameClock();          // drives setInterval(tick, 500) — clock must run
 useCompetitionAdvance();
 // Sync chart revealedCount to game clock — prevents showing future bars
 useGameClockBarSync();
 // Re-price all open positions on each new bar
 usePositionPricer();
 const pendingCount = useTradingStore((s) => s.pendingOrders.length);
 const isSeasonActive = useCompetitionStore((s) => s.isSeasonActive);
 const updateLeaderboard = useCompetitionStore((s) => s.updateLeaderboard);

 const isSeasonOver = useClockStore((s) => s.isSeasonOver);

 // Portfolio value — used for leaderboard sync and SeasonSummary
 const portfolioValue = useTradingStore((s) => s.portfolioValue);

 // Throttle leaderboard updates to at most once per game minute (~6 real seconds).
 // portfolioValue can change every tick (10x/sec); running updateLeaderboard that
 // frequently would cause unnecessary competition-store churn and re-renders.
 const lastLeaderboardUpdateRef = useRef<number>(0);
 useEffect(() => {
  if (!isSeasonActive) return;
  const now = Date.now();
  // 6_000 ms real time ≈ 1 game minute at 6x speed
  if (now - lastLeaderboardUpdateRef.current < 6_000) return;
  lastLeaderboardUpdateRef.current = now;
  updateLeaderboard(portfolioValue);
 }, [portfolioValue, isSeasonActive, updateLeaderboard]);

 const lastTradeFlash = useTradingStore((s) => s.lastTradeFlash);
 const clearTradeFlash = useTradingStore((s) => s.clearTradeFlash);
 const [flashClass, setFlashClass] = useState("");

 useEffect(() => {
  if (!lastTradeFlash) return;
  setFlashClass(lastTradeFlash.side === "buy" ? "chart-border-flash-buy" : "chart-border-flash-sell");
  const timer = setTimeout(() => { setFlashClass(""); clearTradeFlash(); }, 500);
  return () => clearTimeout(timer);
 }, [lastTradeFlash, clearTradeFlash]);


 return (
  <>
   {/* ── Lobby overlay — shown when no season is active ── */}
   {!isSeasonActive && <LobbyScreen />}
   {/* ── Season summary — shown when season has ended ── */}
   {isSeasonActive && isSeasonOver && (
     <SeasonSummary userPortfolioValue={portfolioValue} />
   )}

   {/* ══════════════════════════════════════════════════════════════════════ */}
   {/* ── DESKTOP LAYOUT (md+) ─────────────────────────────────────────── */}
   {/* ══════════════════════════════════════════════════════════════════════ */}
   <div className="hidden md:flex h-full flex-col">
    <TradeShareCard />
    <AlphaBotAlerts />
    <PositionAlerts />

    <LiveInfoBar />

    {/* ── Trade view: 3-column layout ── */}
    <div className="flex flex-1 overflow-hidden">

     {/* ── LEFT: Watchlist (176px) ── */}
     <div className="flex flex-col border-r border-border/40 shrink-0 overflow-hidden" style={{ width: 176 }}>
      <WatchlistPanel />
     </div>

     {/* ── CENTER: Chart + Info panels ── */}
     <div className="flex flex-1 flex-col overflow-hidden">
      <ChartToolbar data-tutorial="indicators" />
      <IndicatorInfoPanel />

      {/* Chart area — flex-[5] gives it ~62% of remaining height */}
      <div className="flex flex-[5] min-h-0 overflow-hidden border-t border-border/20">
       <DrawingToolbar />
       <ChartWithDrawing flashClass={flashClass}>
        {isLoading && <ChartSkeleton />}
        {error && (
         <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
          <p className="text-xs font-mono text-destructive">Failed to load data.</p>
         </div>
        )}
        <ErrorBoundary name="Chart">
         <Suspense fallback={<div className="animate-pulse h-6 bg-muted/30 rounded" />}>
          <CandlestickChart />
         </Suspense>
        </ErrorBoundary>
       </ChartWithDrawing>
      </div>

      <GameStatusBar />

      <NewsTicker />

      {/* Bottom panel — flex-[2] gives chart more vertical space, min 160px */}
      <div
       className="flex-[2] min-h-[160px] shrink-0 overflow-hidden border-t border-border/40"
       data-tutorial="positions"
      >
       <Tabs defaultValue="fundamentals" className="h-full flex flex-col">
        <TabsList className="bg-muted/5 border-b border-border/20 rounded-none p-0 h-auto shrink-0 w-full flex">
         <TabsTrigger value="fundamentals" className={tabCls}>Fundamentals</TabsTrigger>
         <TabsTrigger value="orderbook" className={tabCls}>Book</TabsTrigger>
         <TabsTrigger value="compare" className={tabCls}>Compare</TabsTrigger>
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

     {/* ── RIGHT: Order + Analysis sidebar (300px) ── */}
     <div
      className="flex flex-col border-l border-border/40 shrink-0 overflow-hidden"
      style={{ width: 300 }}
      data-tutorial="order-entry"
     >
      <Tabs defaultValue="order" className="flex flex-col h-full">
       <TabsList className="bg-muted/5 border-b border-border/30 rounded-none p-0 h-auto shrink-0 w-full flex">
        <TabsTrigger value="order" className={tabCls}>Order</TabsTrigger>
        <TabsTrigger value="analysis" className={tabCls}>Analysis</TabsTrigger>
        <TabsTrigger value="positions" className={tabCls}>Pos</TabsTrigger>
        <TabsTrigger value="history" className={tabCls}>Hist</TabsTrigger>
        <TabsTrigger value="pending" className={tabCls}>
         Ord{pendingCount > 0 && <span className="ml-0.5 font-mono text-[9px] tabular-nums text-muted-foreground/30">{pendingCount}</span>}
        </TabsTrigger>
        <TabsTrigger value="margin" className={tabCls}>Mgn</TabsTrigger>
        <TabsTrigger value="replay" className={tabCls}>Replay</TabsTrigger>
       </TabsList>

       {/* Order tab */}
       <TabsContent value="order" className="flex-1 overflow-y-auto mt-0 data-[state=inactive]:hidden">
        <ErrorBoundary name="OrderEntry">
         <OrderEntry />
        </ErrorBoundary>
        <div className="mx-2 my-1 border-t border-border/20" />
        <div className="px-2 pb-2 space-y-1">
         <ErrorBoundary name="ShortSqueezeAlert">
          <ShortSqueezeAlert />
         </ErrorBoundary>
         <ErrorBoundary name="MarginPanel">
          <MarginPanel />
         </ErrorBoundary>
        </div>
       </TabsContent>

       {/* Analysis tab — AI Coach gets its own full-height tab */}
       <TabsContent value="analysis" className="flex-1 flex flex-col overflow-hidden mt-0 data-[state=inactive]:hidden">
        <ErrorBoundary name="AICoachPanel">
         <AICoachPanel />
        </ErrorBoundary>
       </TabsContent>

       {/* Positions tab */}
       <TabsContent value="positions" className="flex-1 overflow-auto mt-0 data-[state=inactive]:hidden">
        <PositionsTable />
        <div className="border-t border-border/20 mt-1 pt-1">
         <ErrorBoundary name="PortfolioHeatmap">
          <PortfolioHeatmap />
         </ErrorBoundary>
        </div>
       </TabsContent>

       {/* History tab */}
       <TabsContent value="history" className="flex-1 overflow-auto mt-0 data-[state=inactive]:hidden">
        <TradeHistory />
       </TabsContent>

       {/* Pending Orders tab */}
       <TabsContent value="pending" className="flex-1 overflow-auto mt-0 data-[state=inactive]:hidden">
        <PendingOrders />
       </TabsContent>

       {/* Margin tab */}
       <TabsContent value="margin" className="flex-1 overflow-auto mt-0 data-[state=inactive]:hidden">
        <div className="p-2 space-y-2">
         <MarginDashboard />
         <ErrorBoundary name="ExecutionQuality">
          <ExecutionQuality />
         </ErrorBoundary>
        </div>
       </TabsContent>

       {/* Replay tab */}
       <TabsContent value="replay" className="flex-1 overflow-hidden mt-0 data-[state=inactive]:hidden">
        <TradeReplay />
       </TabsContent>
      </Tabs>
     </div>
    </div>

    <p className="shrink-0 border-t border-border/30 px-3 py-0.5 text-center text-[9px] font-mono text-muted-foreground/20">
     Simulated trading — not financial advice
    </p>
   </div>

   {/* ══════════════════════════════════════════════════════════════════════ */}
   {/* ── MOBILE LAYOUT (< md) ─────────────────────────────────────────── */}
   {/* ══════════════════════════════════════════════════════════════════════ */}
   <div className="flex flex-col h-full md:hidden overflow-y-auto">
    <TradeShareCard />
    <AlphaBotAlerts />
    <PositionAlerts />

    <ChartToolbar data-tutorial="indicators" />
    <IndicatorInfoPanel />

    <div className="relative h-[300px] shrink-0 flex" data-tutorial="chart">
     <DrawingToolbar />
     <ChartWithDrawing flashClass={flashClass}>
      {isLoading && <ChartSkeleton bars={32} />}
      {error && (
       <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
        <p className="text-xs font-mono text-destructive">Failed to load data.</p>
       </div>
      )}
      <CandlestickChart />
     </ChartWithDrawing>
    </div>

    <GameStatusBar />

    <NewsTicker />

    <div className="border-t border-border">
     <Tabs defaultValue="order">
      <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto overflow-x-auto">
       {["order", "positions", "history", "pending", "watchlist", "analysis", "replay"].map((val) => (
        <TabsTrigger key={val} value={val} className={tabCls}>
         {val === "order" ? "Order" :
          val === "positions" ? "Positions" :
          val === "history" ? "History" :
          val === "pending" ? `Pending${pendingCount > 0 ? ` ${pendingCount}` : ""}` :
          val === "watchlist" ? "Watch" :
          val === "analysis" ? "Analysis" : "Replay"}
        </TabsTrigger>
       ))}
      </TabsList>
      <TabsContent value="order" className="mt-0"><OrderEntry /></TabsContent>
      <TabsContent value="positions" className="mt-0"><PositionsTable /></TabsContent>
      <TabsContent value="history" className="mt-0"><TradeHistory /></TabsContent>
      <TabsContent value="pending" className="mt-0"><PendingOrders /></TabsContent>
      <TabsContent value="watchlist" className="mt-0 h-72"><WatchlistPanel /></TabsContent>
      <TabsContent value="analysis" className="mt-0"><AICoachPanel /></TabsContent>
      <TabsContent value="replay" className="mt-0 h-[600px]"><TradeReplay /></TabsContent>
     </Tabs>
    </div>
   </div>

   <p className="shrink-0 border-t border-border/30 px-3 py-0.5 text-center text-[9px] font-mono text-muted-foreground/20 md:hidden">
    Simulated trading — not financial advice
   </p>
  </>
 );
}
