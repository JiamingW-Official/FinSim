// ---------------------------------------------------------------------------
// Tick-Level Price Simulation — bid/ask spread around mid price
// ---------------------------------------------------------------------------

export interface Tick {
  bid: number;
  ask: number;
  mid: number;
  size: number;     // shares in this tick
  exchange: string; // simulated exchange
}

// Exchanges weighted by market share (approximate)
const EXCHANGES = [
  { name: "NASDAQ", weight: 0.32 },
  { name: "NYSE",   weight: 0.24 },
  { name: "CBOE",   weight: 0.16 },
  { name: "ARCA",   weight: 0.14 },
  { name: "EDGX",   weight: 0.08 },
  { name: "IEX",    weight: 0.06 },
] as const;

// Precomputed cumulative weights for exchange sampling
const EXCHANGE_CDF: { name: string; cdf: number }[] = (() => {
  let cum = 0;
  return EXCHANGES.map((e) => {
    cum += e.weight;
    return { name: e.name, cdf: cum };
  });
})();

// Per-ticker spread parameters (in dollars)
const SPREAD_CONFIG: Record<
  string,
  { baseSpread: number; volSpread: number; minSpread: number; maxSpread: number }
> = {
  AAPL: { baseSpread: 0.01, volSpread: 0.005, minSpread: 0.01, maxSpread: 0.03 },
  MSFT: { baseSpread: 0.01, volSpread: 0.005, minSpread: 0.01, maxSpread: 0.03 },
  GOOG: { baseSpread: 0.01, volSpread: 0.008, minSpread: 0.01, maxSpread: 0.04 },
  AMZN: { baseSpread: 0.01, volSpread: 0.008, minSpread: 0.01, maxSpread: 0.04 },
  META: { baseSpread: 0.02, volSpread: 0.010, minSpread: 0.01, maxSpread: 0.05 },
  NVDA: { baseSpread: 0.02, volSpread: 0.015, minSpread: 0.02, maxSpread: 0.08 },
  TSLA: { baseSpread: 0.05, volSpread: 0.040, minSpread: 0.05, maxSpread: 0.15 },
  JPM:  { baseSpread: 0.01, volSpread: 0.005, minSpread: 0.01, maxSpread: 0.03 },
  SPY:  { baseSpread: 0.01, volSpread: 0.003, minSpread: 0.01, maxSpread: 0.02 },
  QQQ:  { baseSpread: 0.01, volSpread: 0.003, minSpread: 0.01, maxSpread: 0.02 },
};

const DEFAULT_SPREAD_CONFIG = {
  baseSpread: 0.03,
  volSpread: 0.020,
  minSpread: 0.02,
  maxSpread: 0.10,
};

// Typical trade sizes (lots of 100 shares)
const SIZE_CONFIG: Record<string, { base: number; range: number }> = {
  AAPL: { base: 200, range: 800 },
  MSFT: { base: 150, range: 600 },
  GOOG: { base: 50,  range: 150 },
  AMZN: { base: 50,  range: 150 },
  META: { base: 100, range: 400 },
  NVDA: { base: 100, range: 400 },
  TSLA: { base: 200, range: 600 },
  JPM:  { base: 200, range: 500 },
  SPY:  { base: 500, range: 2000 },
  QQQ:  { base: 300, range: 1200 },
};

const DEFAULT_SIZE_CONFIG = { base: 100, range: 300 };

// Simple LCG for fast inline use (no closure needed for caller)
function lcg(seed: number): number {
  return ((seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
}

function pickExchange(rand: number): string {
  for (const e of EXCHANGE_CDF) {
    if (rand < e.cdf) return e.name;
  }
  return "NASDAQ";
}

/**
 * Generate a single tick (bid/ask/mid/size/exchange) for a given mid price.
 *
 * @param ticker   - Stock symbol
 * @param midPrice - Reference mid price (e.g. last bar close)
 * @param sigma    - Realized volatility (fraction, e.g. 0.015 for 1.5% daily vol)
 * @param seed     - Deterministic seed; vary per tick index for sequence generation
 */
export function generateTick(
  ticker: string,
  midPrice: number,
  sigma: number,
  seed: number,
): Tick {
  const cfg = SPREAD_CONFIG[ticker] ?? DEFAULT_SPREAD_CONFIG;
  const sizeCfg = SIZE_CONFIG[ticker] ?? DEFAULT_SIZE_CONFIG;

  // Seed-derived randoms (three LCG steps to get independent values)
  const r1 = lcg(seed);
  const r2 = lcg(seed + 1);
  const r3 = lcg(seed + 2);
  const r4 = lcg(seed + 3);

  // Spread = base + vol component, clamped to [min, max]
  const rawSpread = cfg.baseSpread + cfg.volSpread * sigma * (0.5 + r1 * 1.5);
  const spread = Math.max(cfg.minSpread, Math.min(cfg.maxSpread, rawSpread));
  const halfSpread = spread / 2;

  // Slight mid-price jitter (sub-cent noise around quoted mid)
  const jitter = (r2 - 0.5) * 0.005;
  const mid = Math.max(0.01, midPrice + jitter);

  const bid = Math.max(0.01, mid - halfSpread);
  const ask = bid + spread;

  // Trade size: base + random range, rounded to nearest lot (100)
  const rawSize = sizeCfg.base + Math.floor(r3 * sizeCfg.range);
  const size = Math.max(1, Math.round(rawSize / 100) * 100);

  const exchange = pickExchange(r4);

  return {
    bid: parseFloat(bid.toFixed(2)),
    ask: parseFloat(ask.toFixed(2)),
    mid: parseFloat(mid.toFixed(2)),
    size,
    exchange,
  };
}

/**
 * Generate a sequence of ticks for a given bar.
 * Useful for building Time & Sales feeds.
 *
 * @param ticker     - Stock symbol
 * @param barClose   - Close price of the current bar (used as mid anchor)
 * @param barOpen    - Open price of the current bar (path start)
 * @param barHigh    - High of the current bar
 * @param barLow     - Low of the current bar
 * @param volume     - Approximate total volume (controls tick count)
 * @param sigma      - Realized volatility fraction
 * @param barSeed    - Unique seed for this bar
 * @param count      - Number of ticks to generate
 */
export function generateTickSequence(
  ticker: string,
  barOpen: number,
  barClose: number,
  barHigh: number,
  barLow: number,
  volume: number,
  sigma: number,
  barSeed: number,
  count: number = 20,
): Tick[] {
  const ticks: Tick[] = [];
  const range = barHigh - barLow || Math.abs(barClose) * 0.002 || 0.01;

  for (let i = 0; i < count; i++) {
    // Interpolate mid price linearly from open → close with noise
    const t = i / Math.max(count - 1, 1);
    const linPrice = barOpen + (barClose - barOpen) * t;
    // Add bounded noise within bar range
    const noise = (lcg(barSeed + i * 7) - 0.5) * range * 0.4;
    const midPrice = Math.max(barLow, Math.min(barHigh, linPrice + noise));

    const tick = generateTick(ticker, midPrice, sigma, barSeed + i * 13 + 1000);
    ticks.push(tick);
  }

  return ticks;
}
