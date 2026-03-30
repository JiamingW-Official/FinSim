import YahooFinance from "yahoo-finance2";
import type { OHLCVBar, Timeframe } from "@/types/market";

const yahooFinance = new YahooFinance();

export async function getHistoricalData(
  ticker: string,
  from: string,
  to: string,
  interval: Timeframe = "1d",
): Promise<OHLCVBar[]> {
  const result = await yahooFinance.chart(ticker, {
    period1: from,
    period2: to,
    interval,
  });

  if (!result.quotes || result.quotes.length === 0) {
    return [];
  }

  return result.quotes
    .filter(
      (q) =>
        q.open != null &&
        q.high != null &&
        q.low != null &&
        q.close != null &&
        q.volume != null,
    )
    .map((q) => ({
      timestamp: new Date(q.date).getTime(),
      open: q.open!,
      high: q.high!,
      low: q.low!,
      close: q.close!,
      volume: q.volume!,
      ticker,
      timeframe: interval,
    }));
}
