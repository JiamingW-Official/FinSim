import type { OHLCVBar } from "@/types/market";

interface CacheEntry {
  data: OHLCVBar[];
  expires: number;
}

class MarketDataCache {
  private store = new Map<string, CacheEntry>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  private makeKey(
    ticker: string,
    timeframe: string,
    from: string,
    to: string,
  ): string {
    return `${ticker}:${timeframe}:${from}:${to}`;
  }

  get(
    ticker: string,
    timeframe: string,
    from: string,
    to: string,
  ): OHLCVBar[] | null {
    const key = this.makeKey(ticker, timeframe, from, to);
    const entry = this.store.get(key);

    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return null;
    }

    return entry.data;
  }

  set(
    ticker: string,
    timeframe: string,
    from: string,
    to: string,
    data: OHLCVBar[],
  ): void {
    const key = this.makeKey(ticker, timeframe, from, to);
    this.store.set(key, {
      data,
      expires: Date.now() + this.defaultTTL,
    });
  }
}

export const marketDataCache = new MarketDataCache();
