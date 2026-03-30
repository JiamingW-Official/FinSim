"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useChartStore } from "@/stores/chart-store";
import { useMarketDataStore } from "@/stores/market-data-store";
import type { OHLCVBar } from "@/types/market";
import { generateIntradayBars } from "@/services/market-data/intraday-generator";

function getDateRange() {
  // Game season: 2023-01-01 → 2026-03-01.
  // "from" is 2022-12-01 — one month before season start — so the chart
  // shows 30 days of context bars before the game clock begins.
  // "to" is today so the full season range is covered.
  const to = new Date();
  return {
    from: "2022-12-01",
    to: to.toISOString().split("T")[0],
  };
}

async function fetchBars(
  ticker: string,
  timeframe: string,
  from: string,
  to: string,
): Promise<OHLCVBar[]> {
  const params = new URLSearchParams({ ticker, timeframe, from, to });
  const res = await fetch(`/api/market-data?${params}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch data: ${res.statusText}`);
  }
  return res.json();
}

export function useMarketData() {
  const { currentTicker, currentTimeframe } = useChartStore();
  const setAllData = useMarketDataStore((s) => s.setAllData);
  const { from, to } = getDateRange();

  // Always fetch daily bars; intraday/weekly views are derived client-side.
  const query = useQuery({
    queryKey: ["market-data", currentTicker, from, to],
    queryFn: () => fetchBars(currentTicker, "1d", from, to),
  });

  // Expand daily bars → 15m bars before storing. 15m is the core trading unit.
  useEffect(() => {
    if (query.data && query.data.length > 0) {
      const intradayBars = generateIntradayBars(query.data, "15m");
      setAllData(intradayBars);
    }
  }, [query.data, setAllData]);

  return query;
}
