// ---------------------------------------------------------------------------
// Order Book Generator — realistic Level 2 market data simulation
// ---------------------------------------------------------------------------

export interface OrderBookLevel {
  price: number;
  size: number; // shares
  orders: number; // number of orders at this level
  total: number; // cumulative size
}

export interface OrderBook {
  bids: OrderBookLevel[]; // sorted desc by price (highest first)
  asks: OrderBookLevel[]; // sorted asc by price (lowest first)
  spread: number; // ask[0].price - bid[0].price
  spreadPct: number; // spread / midpoint * 100
  midpoint: number;
  imbalance: number; // (total bid size - total ask size) / (total bid + total ask), -1 to +1
}

// Mulberry32 seeded PRNG — matches intraday-generator.ts
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashTickerPrice(ticker: string, price: number): number {
  let h = Math.floor(price * 100) * 2654435761;
  for (let i = 0; i < ticker.length; i++) {
    h = (Math.imul(h, 31) + ticker.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

// Tick size based on price level (penny stocks vs blue chips)
function tickSize(price: number): number {
  if (price < 1) return 0.0001;
  return 0.01;
}

// Spread characteristics per ticker
const SPREAD_TICKS: Record<string, number> = {
  AAPL: 1,
  MSFT: 1,
  GOOG: 1,
  AMZN: 1,
  META: 1,
  NVDA: 2,
  TSLA: 3,
  JPM: 1,
  SPY: 1,
  QQQ: 1,
};

/**
 * Generate a realistic order book from current price.
 * Uses seeded PRNG for determinism per ticker+price combination.
 *
 * Realistic patterns:
 * - Bid/ask sizes follow power law (larger at round numbers)
 * - Spread proportional to price (tighter for liquid stocks)
 * - More depth near the current price, thins out further away
 * - Round-number clustering ($190.00 has more orders than $190.07)
 */
export function generateOrderBook(
  ticker: string,
  currentPrice: number,
  depth: number = 20,
): OrderBook {
  const rng = mulberry32(hashTickerPrice(ticker, currentPrice));
  const tick = tickSize(currentPrice);
  const halfSpreadTicks = SPREAD_TICKS[ticker] ?? 2;

  // Round current price to nearest tick
  const roundedPrice = Math.round(currentPrice / tick) * tick;
  const halfSpread = halfSpreadTicks * tick;

  const bestBid = roundedPrice - halfSpread;
  const bestAsk = roundedPrice + halfSpread;

  // Base size depends on stock price (lower-priced stocks trade more shares)
  const baseSize = currentPrice > 500 ? 50 : currentPrice > 100 ? 200 : 500;

  const bids: OrderBookLevel[] = [];
  const asks: OrderBookLevel[] = [];

  for (let i = 0; i < depth; i++) {
    const bidPrice = parseFloat((bestBid - i * tick).toFixed(4));
    const askPrice = parseFloat((bestAsk + i * tick).toFixed(4));

    // Power law: more size close to mid, less further away
    const distanceFactor = 1 / (1 + i * 0.15);

    // Round number bonus: prices ending in .00 or .50 get more orders
    const bidCents = Math.round((bidPrice % 1) * 100);
    const askCents = Math.round((askPrice % 1) * 100);
    const bidRoundBonus =
      bidCents === 0 ? 3.0 : bidCents === 50 ? 2.0 : bidCents % 25 === 0 ? 1.5 : 1.0;
    const askRoundBonus =
      askCents === 0 ? 3.0 : askCents === 50 ? 2.0 : askCents % 25 === 0 ? 1.5 : 1.0;

    // Random variation
    const bidRand = 0.4 + rng() * 1.2;
    const askRand = 0.4 + rng() * 1.2;

    const bidSize = Math.round(baseSize * distanceFactor * bidRoundBonus * bidRand);
    const askSize = Math.round(baseSize * distanceFactor * askRoundBonus * askRand);

    // Orders per level: roughly proportional to size, but with a floor
    const bidOrders = Math.max(1, Math.round((bidSize / baseSize) * 15 + rng() * 10));
    const askOrders = Math.max(1, Math.round((askSize / baseSize) * 15 + rng() * 10));

    bids.push({ price: bidPrice, size: bidSize, orders: bidOrders, total: 0 });
    asks.push({ price: askPrice, size: askSize, orders: askOrders, total: 0 });
  }

  // Calculate cumulative totals
  let cumBid = 0;
  for (const level of bids) {
    cumBid += level.size;
    level.total = cumBid;
  }
  let cumAsk = 0;
  for (const level of asks) {
    cumAsk += level.size;
    level.total = cumAsk;
  }

  const spread = parseFloat((bestAsk - bestBid).toFixed(4));
  const midpoint = parseFloat(((bestAsk + bestBid) / 2).toFixed(4));
  const totalBidSize = cumBid;
  const totalAskSize = cumAsk;
  const imbalance =
    totalBidSize + totalAskSize > 0
      ? (totalBidSize - totalAskSize) / (totalBidSize + totalAskSize)
      : 0;

  return {
    bids,
    asks,
    spread,
    spreadPct: midpoint > 0 ? (spread / midpoint) * 100 : 0,
    midpoint,
    imbalance,
  };
}
