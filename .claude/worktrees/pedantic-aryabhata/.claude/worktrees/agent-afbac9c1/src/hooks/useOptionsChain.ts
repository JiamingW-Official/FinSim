import { useMemo } from "react";
import { useMarketDataStore } from "@/stores/market-data-store";
import { useChartStore } from "@/stores/chart-store";
import { calculateHistoricalVolatility } from "@/services/options/historical-volatility";
import { generateOptionChain } from "@/services/options/chain-generator";
import type { OptionChainExpiry } from "@/types/options";

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
    if (visibleBars.length === 0) {
      return { chain: [], spotPrice: 0, historicalVolatility: 0.3 };
    }

    const closes = visibleBars.map((b) => b.close);
    const spotPrice = closes[closes.length - 1];
    const historicalVolatility = calculateHistoricalVolatility(closes, 30);
    const simulationDate =
      visibleBars[visibleBars.length - 1].timestamp;

    const chain = generateOptionChain({
      ticker: currentTicker,
      spotPrice,
      historicalVolatility,
      simulationDate,
    });

    return { chain, spotPrice, historicalVolatility };
  }, [allData, revealedCount, currentTicker]);

  return result;
}
