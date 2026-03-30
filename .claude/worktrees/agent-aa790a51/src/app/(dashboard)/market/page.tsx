"use client";

import { useState, useMemo, useCallback } from "react";
import { useChartStore } from "@/stores/chart-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import { useMarketData } from "@/hooks/useMarketData";
import { WATCHLIST_STOCKS } from "@/types/market";
import { FUNDAMENTALS } from "@/data/fundamentals";
import { calculateMarketSentiment } from "@/services/market/sentiment";
import { calculateMarketBreadth } from "@/services/market/breadth";
import { calculateImpliedMove, type ImpliedMove } from "@/services/market/implied-move";
import { SentimentGauge } from "@/components/market/SentimentGauge";
import { MarketBreadthPanel } from "@/components/market/MarketBreadthPanel";
import { ScreenerPanel } from "@/components/market/ScreenerPanel";
import { DarkPoolFeed } from "@/components/market/DarkPoolFeed";
import { OptionsFlowPanel } from "@/components/market/OptionsFlowPanel";
import { SectorRotationPanel } from "@/components/market/SectorRotationPanel";
import { SectorRotationClock } from "@/components/market/SectorRotationClock";
import { SectorMomentum } from "@/components/market/SectorMomentum";
import { IntermarketAnalysis } from "@/components/market/IntermarketAnalysis";
import { EarningsPanel } from "@/components/market/EarningsPanel";
import { MacroDashboard } from "@/components/market/MacroDashboard";
import { ScenarioSimulator } from "@/components/market/ScenarioSimulator";
import { MacroCalibrationPanel } from "@/components/market/MacroCalibrationPanel";
import { EconomicCalendar } from "@/components/market/EconomicCalendar";
import { FearGreedIndex } from "@/components/market/FearGreedIndex";
import NewsFeed from "@/components/market/NewsFeed";
import InsiderTradingPanel from "@/components/market/InsiderTradingPanel";
import InstitutionalHoldingsPanel from "@/components/market/InstitutionalHoldingsPanel";
import { YieldCurve } from "@/components/market/YieldCurve";
import { CreditSpreads } from "@/components/market/CreditSpreads";
import { cn } from "@/lib/utils";

type MarketTab = "overview" | "macro" | "earnings" | "sector-rotation" | "options-flow" | "news" | "insiders" | "institutions" | "economic-calendar" | "fear-greed" | "fixed-income";

const TABS: { value: MarketTab; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "news", label: "News" },
  { value: "macro", label: "Macro" },
  { value: "earnings", label: "Earnings" },
  { value: "sector-rotation", label: "Sectors" },
  { value: "options-flow", label: "Options Flow" },
  { value: "insiders", label: "Insiders" },
  { value: "institutions", label: "Institutions" },
  { value: "economic-calendar", label: "Economic Calendar" },
  { value: "fear-greed", label: "Fear & Greed" },
  { value: "fixed-income", label: "Fixed Income" },
];

function ImpliedMoveCard({ move }: { move: ImpliedMove }) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3 hover:border-border/60 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Implied Move: {move.ticker}</h3>
        <span className="text-xs text-muted-foreground">
          {move.daysToExpiry}d to expiry
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-[10px] text-muted-foreground">Lower Bound</p>
          <p className="font-mono tabular-nums text-sm font-medium text-red-500">
            ${move.lowerBound.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Current</p>
          <p className="font-mono tabular-nums text-sm font-semibold">
            ${move.currentPrice.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Upper Bound</p>
          <p className="font-mono tabular-nums text-sm font-medium text-green-500">
            ${move.upperBound.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Visual range bar */}
      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="absolute inset-y-0 bg-gradient-to-r from-red-500/40 via-yellow-500/40 to-green-500/40"
          style={{ left: "0%", right: "0%" }}
        />
        {/* Current price marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-foreground"
          style={{ left: "50%" }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Expected Move:{" "}
          <span className="font-mono tabular-nums font-medium text-foreground">
            +/-{move.impliedMovePercent.toFixed(1)}%
          </span>
        </span>
        <span>
          IV:{" "}
          <span className="font-mono tabular-nums font-medium text-foreground">
            {(move.iv * 100).toFixed(1)}%
          </span>
        </span>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        {move.explanation}
      </p>
    </div>
  );
}

export default function MarketIntelligencePage() {
  const { isLoading, error } = useMarketData();
  const [activeTab, setActiveTab] = useState<MarketTab>("overview");

  const currentTicker = useChartStore((s) => s.currentTicker);
  const setTicker = useChartStore((s) => s.setTicker);
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);

  const dailyCloses = useMemo(() => {
    const visible = allData.slice(0, revealedCount);
    if (visible.length === 0) return [] as number[];
    const dailyMap = new Map<string, number>();
    for (const bar of visible) {
      const dateKey = new Date(bar.timestamp).toISOString().slice(0, 10);
      dailyMap.set(dateKey, bar.close);
    }
    return Array.from(dailyMap.values());
  }, [allData, revealedCount]);

  const currentPrice = useMemo(() => {
    if (allData.length === 0 || revealedCount === 0) return 0;
    return allData[Math.min(revealedCount - 1, allData.length - 1)]?.close ?? 0;
  }, [allData, revealedCount]);

  const sentiment = useMemo(
    () => calculateMarketSentiment(dailyCloses),
    [dailyCloses],
  );

  const breadth = useMemo(() => {
    if (dailyCloses.length < 5) {
      return calculateMarketBreadth({});
    }
    const tickerPrices: Record<string, number[]> = {};
    const basePrices = dailyCloses;
    const baseReturn = basePrices.length > 1
      ? basePrices.map((p, i) => (i === 0 ? 0 : (p - basePrices[i - 1]) / basePrices[i - 1]))
      : [0];

    for (const stock of WATCHLIST_STOCKS) {
      const fund = FUNDAMENTALS[stock.ticker];
      if (!fund) continue;
      const beta = fund.beta || 1;
      const prices: number[] = [100];
      for (let i = 1; i < baseReturn.length; i++) {
        const ret = baseReturn[i] * beta + (fund.revenueGrowthYoY / 25200);
        prices.push(prices[i - 1] * (1 + ret));
      }
      tickerPrices[stock.ticker] = prices;
    }
    return calculateMarketBreadth(tickerPrices);
  }, [dailyCloses]);

  const impliedMove = useMemo(() => {
    if (currentPrice === 0) return null;
    const fund = FUNDAMENTALS[currentTicker];
    const returns = dailyCloses.slice(-30).map((p, i, arr) =>
      i === 0 ? 0 : Math.log(p / arr[i - 1]),
    ).slice(1);
    const mean = returns.length > 0 ? returns.reduce((s, r) => s + r, 0) / returns.length : 0;
    const variance = returns.length > 1
      ? returns.reduce((s, r) => s + (r - mean) ** 2, 0) / (returns.length - 1)
      : 0.04;
    const hv = Math.sqrt(variance * 252);
    const iv = Math.max(0.15, Math.min(0.80, hv * 1.1));
    const daysToExpiry = fund ? 30 : 30;
    void daysToExpiry;
    return calculateImpliedMove(currentTicker, currentPrice, iv, 30);
  }, [currentTicker, currentPrice, dailyCloses]);

  const fund = FUNDAMENTALS[currentTicker];
  const dailyVolume = fund ? fund.avgVolume30d * 1_000_000 : 10_000_000;

  const handleSelectTicker = useCallback(
    (ticker: string) => {
      setTicker(ticker);
    },
    [setTicker],
  );

  return (
    <div className="flex flex-col gap-4 p-4 max-w-[1400px] mx-auto">
      {/* Loading/error overlay */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card/80 p-3 text-xs text-muted-foreground">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          Loading market data...
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
          Failed to load market data. Some panels may show incomplete information.
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Market Intelligence</h1>
          <p className="text-xs text-muted-foreground">
            Sentiment, breadth, screening, and institutional flow analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Viewing:</span>
          <select
            value={currentTicker}
            onChange={(e) => setTicker(e.target.value)}
            className="text-xs font-mono bg-muted border rounded-lg px-2 py-1 outline-none"
          >
            {WATCHLIST_STOCKS.map((s) => (
              <option key={s.ticker} value={s.ticker}>
                {s.ticker} - {s.name}
              </option>
            ))}
          </select>
          {currentPrice > 0 && (
            <span className="font-mono tabular-nums text-sm font-medium">
              ${currentPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto whitespace-nowrap">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium border-b-2 transition-colors -mb-px shrink-0",
              activeTab === tab.value
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <>
          {/* Main 2-column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex flex-col gap-4">
              <SentimentGauge sentiment={sentiment} />
              <MarketBreadthPanel breadth={breadth} />
            </div>
            <div className="flex flex-col gap-4">
              <ScreenerPanel onSelectTicker={handleSelectTicker} />
              {impliedMove && <ImpliedMoveCard move={impliedMove} />}
            </div>
          </div>
          {currentPrice > 0 && (
            <DarkPoolFeed
              ticker={currentTicker}
              currentPrice={currentPrice}
              dailyVolume={dailyVolume}
            />
          )}
        </>
      )}

      {activeTab === "macro" && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MacroCalibrationPanel />
            <ScenarioSimulator />
          </div>
          <MacroDashboard />
        </div>
      )}

      {activeTab === "earnings" && <EarningsPanel />}

      {activeTab === "sector-rotation" && (
        <div className="flex flex-col gap-6">
          {/* Sub-header */}
          <div>
            <h2 className="text-sm font-semibold">Sector Strategy</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Business cycle positioning, sector momentum, and cross-asset correlations
            </p>
          </div>

          {/* Clock + cycle model side-by-side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SectorRotationClock />
            <SectorRotationPanel />
          </div>

          {/* Sector momentum table */}
          <SectorMomentum />

          {/* Intermarket analysis */}
          <IntermarketAnalysis />
        </div>
      )}

      {activeTab === "options-flow" && currentPrice > 0 && (
        <OptionsFlowPanel ticker={currentTicker} currentPrice={currentPrice} />
      )}
      {activeTab === "options-flow" && currentPrice === 0 && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground p-8">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          Loading options flow data...
        </div>
      )}

      {activeTab === "news" && (
        <NewsFeed ticker={currentTicker} />
      )}

      {activeTab === "insiders" && (
        <InsiderTradingPanel ticker={currentTicker} />
      )}

      {activeTab === "institutions" && (
        <InstitutionalHoldingsPanel ticker={currentTicker} />
      )}

      {activeTab === "economic-calendar" && <EconomicCalendar />}

      {activeTab === "fear-greed" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <FearGreedIndex />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-4">
            <SentimentGauge sentiment={sentiment} />
            <MarketBreadthPanel breadth={breadth} />
          </div>
        </div>
      )}

      {activeTab === "fixed-income" && (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-semibold">Fixed Income</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Yield curve shape and credit spread conditions
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <YieldCurve />
            <CreditSpreads />
          </div>
        </div>
      )}
    </div>
  );
}
