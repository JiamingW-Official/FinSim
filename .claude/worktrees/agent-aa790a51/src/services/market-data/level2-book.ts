// ---------------------------------------------------------------------------
// Level 2 Order Book Simulation — 10 bid/ask levels with mulberry32 PRNG
// ---------------------------------------------------------------------------

export interface L2Level {
  price: number;   // quoted price
  size: number;    // total shares at this level (in lots)
  orders: number;  // number of resting orders
  total: number;   // cumulative depth from best bid/ask outward
}

export interface L2Book {
  ticker: string;
  midPrice: number;
  bestBid: number;
  bestAsk: number;
  spread: number;
  spreadPct: number;
  bids: L2Level[];  // 10 levels, sorted descending by price (best first)
  asks: L2Level[];  // 10 levels, sorted ascending by price (best first)
  totalBidDepth: number;
  totalAskDepth: number;
  imbalance: number; // -1 (all asks) to +1 (all bids)
}

// Mulberry32 seeded PRNG — matches intraday-generator.ts
function mulberry32(seed: number) {
  return function (): number {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Combine ticker + bar-level seed into a single uint32
function hashTickerSeed(ticker: string, seed: number): number {
  let h = (seed * 2654435761) >>> 0;
  for (let i = 0; i < ticker.length; i++) {
    h = (Math.imul(h, 31) + ticker.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

// Minimum tick size
function tickSize(price: number): number {
  if (price < 1) return 0.0001;
  return 0.01;
}

// Spread in ticks (half-spread each side from mid)
const HALF_SPREAD_TICKS: Record<string, number> = {
  AAPL: 1,
  MSFT: 1,
  GOOG: 1,
  AMZN: 1,
  META: 1,
  NVDA: 2,
  TSLA: 3,
  JPM:  1,
  SPY:  1,
  QQQ:  1,
};

// Base lot size (shares) per price tier
function baseLotSize(price: number): number {
  if (price > 500) return 50;
  if (price > 200) return 100;
  if (price > 100) return 200;
  return 500;
}

/**
 * Generate a 10-level L2 order book seeded by ticker + bar seed.
 * Using the same seed for the same ticker+bar yields identical results,
 * making the book consistent across renders without external state.
 *
 * Realistic patterns:
 * - Best bid/ask derived from rounded mid ± half-spread
 * - Size follows power law: heavier near best, thinner away
 * - Round-number clustering ($150.00 attracts more resting orders)
 * - Random variation layered on top
 */
export function generateL2Book(
  ticker: string,
  midPrice: number,
  seed: number,
  levels: number = 10,
): L2Book {
  const rng = mulberry32(hashTickerSeed(ticker, seed));
  const tick = tickSize(midPrice);
  const halfTicks = HALF_SPREAD_TICKS[ticker] ?? 2;

  const roundedMid = Math.round(midPrice / tick) * tick;
  const halfSpread = halfTicks * tick;

  const bestBid = parseFloat((roundedMid - halfSpread).toFixed(4));
  const bestAsk = parseFloat((roundedMid + halfSpread).toFixed(4));
  const spread = parseFloat((bestAsk - bestBid).toFixed(4));
  const spreadPct = roundedMid > 0 ? (spread / roundedMid) * 100 : 0;

  const baseSize = baseLotSize(midPrice);

  const bids: L2Level[] = [];
  const asks: L2Level[] = [];

  for (let i = 0; i < levels; i++) {
    const bidPrice = parseFloat((bestBid - i * tick).toFixed(4));
    const askPrice = parseFloat((bestAsk + i * tick).toFixed(4));

    // Power-law depth decay: more liquidity near best
    const decay = 1 / (1 + i * 0.18);

    // Round-number bonus for prices ending at .00, .50, .25
    function roundBonus(price: number): number {
      const cents = Math.round((price % 1) * 100);
      if (cents === 0) return 2.8;
      if (cents === 50) return 1.9;
      if (cents === 25 || cents === 75) return 1.4;
      return 1.0;
    }

    const bidRand = 0.35 + rng() * 1.3;
    const askRand = 0.35 + rng() * 1.3;

    const bidSize = Math.max(
      100,
      Math.round(baseSize * decay * roundBonus(bidPrice) * bidRand / 100) * 100,
    );
    const askSize = Math.max(
      100,
      Math.round(baseSize * decay * roundBonus(askPrice) * askRand / 100) * 100,
    );

    // Orders per level: roughly proportional to size with minimum of 1
    const bidOrders = Math.max(1, Math.round((bidSize / baseSize) * 12 + rng() * 8));
    const askOrders = Math.max(1, Math.round((askSize / baseSize) * 12 + rng() * 8));

    bids.push({ price: bidPrice, size: bidSize, orders: bidOrders, total: 0 });
    asks.push({ price: askPrice, size: askSize, orders: askOrders, total: 0 });
  }

  // Compute cumulative depth
  let cumBid = 0;
  for (const lvl of bids) {
    cumBid += lvl.size;
    lvl.total = cumBid;
  }
  let cumAsk = 0;
  for (const lvl of asks) {
    cumAsk += lvl.size;
    lvl.total = cumAsk;
  }

  const totalBidDepth = cumBid;
  const totalAskDepth = cumAsk;
  const imbalance =
    totalBidDepth + totalAskDepth > 0
      ? (totalBidDepth - totalAskDepth) / (totalBidDepth + totalAskDepth)
      : 0;

  return {
    ticker,
    midPrice: parseFloat(roundedMid.toFixed(4)),
    bestBid,
    bestAsk,
    spread,
    spreadPct: parseFloat(spreadPct.toFixed(4)),
    bids,
    asks,
    totalBidDepth,
    totalAskDepth,
    imbalance,
  };
}
