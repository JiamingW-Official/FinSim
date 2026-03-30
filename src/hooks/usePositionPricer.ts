"use client";
/**
 * usePositionPricer
 *
 * Re-prices open positions using the latest revealed bar from market-data-store.
 * Runs on its OWN setInterval (every 1 second) — does NOT subscribe to any
 * Zustand store reactively, which avoids causing TradePage to re-render on
 * every bar advance and prevents the Radix UI compose-refs infinite-loop.
 *
 * Reads all state imperatively via getState() — same pattern as useGameClockBarSync.
 */
import { useEffect } from "react";
import { useMarketDataStore } from "@/stores/market-data-store";
import { useTradingStore } from "@/stores/trading-store";

export function usePositionPricer() {
  useEffect(() => {
    const price = () => {
      const { allData, revealedCount } = useMarketDataStore.getState();
      if (revealedCount <= 0) return;

      const currentBar = allData[revealedCount - 1];
      if (!currentBar) return;

      const currentPrice = currentBar.close;
      const { positions, updateAllPositionPrices } = useTradingStore.getState();

      if (positions.length === 0) return;

      // Determine the chart ticker imperatively to avoid circular dep subscription
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { useChartStore } = require("@/stores/chart-store") as typeof import("@/stores/chart-store");
      const chartTicker = useChartStore.getState().currentTicker as string;

      updateAllPositionPrices((ticker: string) => {
        if (ticker === chartTicker) return currentPrice;
        return null; // other tickers: keep last known price
      });
    };

    // Run once immediately, then every 1 second
    price();
    const interval = setInterval(price, 1000);
    return () => clearInterval(interval);
  }, []); // empty deps — never re-subscribes, all reads are imperative
}
