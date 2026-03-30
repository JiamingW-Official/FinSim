/* ─────────────────────────────────────────────
   Shared synthetic price utility

   All pages MUST import from here to ensure
   the same ticker shows the same price everywhere.
───────────────────────────────────────────── */

/** Seeded PRNG (mulberry32) */
export function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a hash for ticker strings */
export function tickerHash(ticker: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < ticker.length; i++) {
    h ^= ticker.charCodeAt(i);
    h = (Math.imul(h, 0x01000193)) >>> 0;
  }
  return h;
}

/* ─────────────────────────────────────────────
   Market data constants
───────────────────────────────────────────── */

export const ALL_TICKERS = ["AAPL", "MSFT", "GOOG", "AMZN", "NVDA", "TSLA", "JPM", "SPY", "QQQ", "META"] as const;

export const BASE_PRICES: Record<string, number> = {
  AAPL: 213,
  MSFT: 415,
  GOOG: 178,
  AMZN: 204,
  NVDA: 870,
  TSLA: 248,
  JPM: 225,
  SPY: 548,
  QQQ: 468,
  META: 568,
  BTC: 68420,
  Gold: 2340,
  VIX: 14.8,
};

/** Returns a day-level seed: same value for the entire UTC day */
export function getDaySeed(): number {
  return Math.floor(Date.now() / 86400000);
}

/**
 * Deterministic price simulation for a ticker on a given day.
 * Every page that displays a synthetic stock price MUST use this function
 * to guarantee consistency across the app.
 */
export function simulateTickerPrice(
  ticker: string,
  daySeed: number,
): { price: number; changePct: number } {
  const base = BASE_PRICES[ticker] ?? 100;
  const seed = tickerHash(ticker) ^ daySeed;
  const rand = mulberry32(seed);
  const volatility = ticker === "VIX" ? 6 : ticker === "BTC" ? 5 : 4;
  const changePct = (rand() - 0.5) * volatility; // +/-volatility/2 %
  const price = base * (1 + changePct / 100);
  return { price: Math.max(price, 0.01), changePct };
}
