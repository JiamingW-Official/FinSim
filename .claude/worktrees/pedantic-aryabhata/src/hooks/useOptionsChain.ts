import { useMemo } from "react";
import { useMarketDataStore } from "@/stores/market-data-store";
import { useChartStore } from "@/stores/chart-store";
import { calculateHistoricalVolatility } from "@/services/options/historical-volatility";
import { generateOptionChain } from "@/services/options/chain-generator";
import type { OptionChainExpiry } from "@/types/options";

// Fallback spot prices so the options chain renders immediately while market
// data is still loading.  Values are approximate and will be replaced once
// the real feed arrives.
const FALLBACK_SPOT: Record<string, number> = {
  AAPL: 178,
  MSFT: 415,
  GOOG: 155,
  AMZN: 185,
  NVDA: 880,
  TSLA: 175,
  JPM: 195,
  SPY: 520,
  QQQ: 445,
  META: 505,
};

const DEFAULT_HV = 0.3;

export function useOptionsChain(): {
  chain: OptionChainExpiry[];
  spotPrice: number;
  historicalVolatility: number;
} {
  const allData = useMarketDataStore((s) => s.allData);
  const revealedCount = useMarketDataStore((s) => s.revealedCount);
  const currentTicker = useChartStore((s) => s.currentTicker);

  const result = useMemo(() => {
    const visibleBars = allData.slice(0, revealedCount);

    // When real market data is available, use it
    if (visibleBars.length > 0) {
      const closes = visibleBars.map((b) => b.close);
      const spotPrice = closes[closes.length - 1];
      const historicalVolatility = calculateHistoricalVolatility(closes, 30);
      const simulationDate = visibleBars[visibleBars.length - 1].timestamp;

      const chain = generateOptionChain({
        ticker: currentTicker,
        spotPrice,
        historicalVolatility,
        simulationDate,
      });

      return { chain, spotPrice, historicalVolatility };
    }

    // Fallback: generate a chain from approximate spot prices so the Options
    // page never shows all-zero stats while waiting for the data feed.
    const fallbackSpot = FALLBACK_SPOT[currentTicker] ?? 100;
    const chain = generateOptionChain({
      ticker: currentTicker,
      spotPrice: fallbackSpot,
      historicalVolatility: DEFAULT_HV,
      simulationDate: Date.now(),
    });

    return { chain, spotPrice: fallbackSpot, historicalVolatility: DEFAULT_HV };
  }, [allData, revealedCount, currentTicker]);

  return result;
}
