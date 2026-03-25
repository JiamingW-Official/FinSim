"use client";

import { useMemo, useCallback } from "react";
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
import { cn } from "@/lib/utils";

function ImpliedMoveCard({ move }: { move: ImpliedMove }) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Implied Move: {move.ticker}</h3>
        <span className="text-xs text-muted-foreground">
          {move.daysToExpiry}d to expiry
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
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
          <p className="font-mono tabular-nums text-sm font-medium text-emerald-500">
            ${move.upperBound.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Visual range bar */}
      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="absolute inset-y-0 bg-gradient-to-r from-red-500/40 via-yellow-500/40 to-emerald-500/40"
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
  useMarketData();

  const currentTicker = useChartStore((s) => s.currentTicker);
  const setTicker = useChartStore((s) => s.setTicker);
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);

  // Extract daily close prices from the 15m bar data.
  // Group by day and take the last close of each day.
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

  // Sentiment from SPY-like prices (use current ticker data as proxy)
  const sentiment = useMemo(
    () => calculateMarketSentiment(dailyCloses),
    [dailyCloses],
  );

  // Market breadth from all tickers (simulated from current data)
  // We create synthetic price arrays for each ticker using the daily close
  // pattern scaled by fundamentals beta.
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
      // Simulate this ticker's price path using beta-scaled returns
      const prices: number[] = [100]; // normalized starting price
      for (let i = 1; i < baseReturn.length; i++) {
        const ret = baseReturn[i] * beta + (fund.revenueGrowthYoY / 25200); // tiny drift from growth
        prices.push(prices[i - 1] * (1 + ret));
      }
      tickerPrices[stock.ticker] = prices;
    }
    return calculateMarketBreadth(tickerPrices);
  }, [dailyCloses]);

  // Implied move for current ticker
  const impliedMove = useMemo(() => {
    if (currentPrice === 0) return null;
    const fund = FUNDAMENTALS[currentTicker];
    // Simulate IV from historical volatility * 1.1
    const returns = dailyCloses.slice(-30).map((p, i, arr) =>
      i === 0 ? 0 : Math.log(p / arr[i - 1]),
    ).slice(1);
    const mean = returns.length > 0 ? returns.reduce((s, r) => s + r, 0) / returns.length : 0;
    const variance = returns.length > 1
      ? returns.reduce((s, r) => s + (r - mean) ** 2, 0) / (returns.length - 1)
      : 0.04;
    const hv = Math.sqrt(variance * 252);
    const iv = Math.max(0.15, Math.min(0.80, hv * 1.1)); // IV is typically > HV
    const daysToExpiry = fund ? 30 : 30;
    void daysToExpiry;
    return calculateImpliedMove(currentTicker, currentPrice, iv, 30);
  }, [currentTicker, currentPrice, dailyCloses]);

  // Dark pool data
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Market Intelligence</h1>
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

      {/* Main 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left column: Sentiment + Breadth */}
        <div className="flex flex-col gap-4">
          <SentimentGauge sentiment={sentiment} />
          <MarketBreadthPanel breadth={breadth} />
        </div>

        {/* Right column: Screener */}
        <div className="flex flex-col gap-4">
          <ScreenerPanel onSelectTicker={handleSelectTicker} />
          {impliedMove && <ImpliedMoveCard move={impliedMove} />}
        </div>
      </div>

      {/* Dark Pool Feed (full width below) */}
      {currentPrice > 0 && (
        <DarkPoolFeed
          ticker={currentTicker}
          currentPrice={currentPrice}
          dailyVolume={dailyVolume}
        />
      )}
    </div>
  );
}
