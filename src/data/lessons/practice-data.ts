import type { PracticeBar } from "./types";

/* ============================================
   SEEDED PRNG + NORMAL DISTRIBUTION
   ============================================ */

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Box-Muller transform: two uniform randoms → one standard normal */
function normalRandom(rng: () => number): number {
  const u1 = Math.max(rng(), 1e-10);
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/* ============================================
   CANDLESTICK PATTERN TYPES
   ============================================ */

export type CandlePattern =
  | "doji"
  | "hammer"
  | "shooting-star"
  | "bullish-engulfing"
  | "bearish-engulfing";

interface PatternInjection {
  bar: number;
  type: CandlePattern;
}

/* ============================================
   REALISTIC BAR GENERATION CONFIG
   ============================================ */

export interface BarGenConfig {
  count: number;
  startPrice: number;
  seed: number;
  drift: number;       // per-bar drift (e.g. 0.003 = 0.3% per bar)
  volatility: number;  // per-bar sigma (e.g. 0.015 = 1.5%)
  meanReversion: number; // kappa: 0 = none, 0.1 = moderate
  target: number;        // mean-reversion target price
  momentumBias?: number; // 0-1: probability of same-direction continuation
  consolidation?: Array<{ start: number; end: number; tightness: number }>;
  support?: number[];
  resistance?: number[];
  patterns?: PatternInjection[];
  baseVolume?: number;
}

/* ============================================
   CORE ENGINE: Ornstein-Uhlenbeck with patterns
   ============================================ */

export function generateRealisticBars(config: BarGenConfig): PracticeBar[] {
  const {
    count, startPrice, seed, drift, volatility,
    meanReversion, target,
    momentumBias = 0.5,
    consolidation = [],
    support = [],
    resistance = [],
    patterns = [],
    baseVolume = 60000,
  } = config;

  const rng = seededRandom(seed);
  const bars: PracticeBar[] = [];
  let price = startPrice;
  let prevDirection = 0; // -1 bearish, 0 neutral, +1 bullish

  for (let i = 0; i < count; i++) {
    // Determine effective volatility (consolidation reduces it)
    let sigma = volatility;
    for (const c of consolidation) {
      if (i >= c.start && i <= c.end) {
        sigma *= c.tightness;
      }
    }

    // Mean-reverting log return (Ornstein-Uhlenbeck)
    let z = normalRandom(rng);

    // Momentum bias: if previous bar moved in a direction,
    // bias this bar to continue with probability = momentumBias
    if (prevDirection !== 0 && rng() < momentumBias) {
      z = Math.abs(z) * prevDirection;
    }

    let logReturn = drift + meanReversion * (Math.log(target) - Math.log(price)) + sigma * z;

    // Support/resistance bounce
    const nextPrice = price * Math.exp(logReturn);
    for (const s of support) {
      if (nextPrice < s && price >= s * 0.99) {
        // Approaching support from above — bounce probability
        if (rng() < 0.7) {
          logReturn = Math.abs(logReturn) * 0.5; // reverse to bounce
        }
      }
    }
    for (const r of resistance) {
      if (nextPrice > r && price <= r * 1.01) {
        if (rng() < 0.7) {
          logReturn = -Math.abs(logReturn) * 0.5;
        }
      }
    }

    const open = price;
    const close = open * Math.exp(logReturn);
    const pctChange = Math.abs(close - open) / open;

    // Asymmetric wicks based on direction
    const isBullish = close >= open;
    const wickSigma = sigma * 0.8;

    // Bullish candles tend to have longer lower wicks (buying pressure)
    // Bearish candles tend to have longer upper wicks (selling pressure)
    const upperWickFactor = isBullish
      ? Math.abs(normalRandom(rng)) * wickSigma * 0.4
      : Math.abs(normalRandom(rng)) * wickSigma * 0.8;
    const lowerWickFactor = isBullish
      ? Math.abs(normalRandom(rng)) * wickSigma * 0.8
      : Math.abs(normalRandom(rng)) * wickSigma * 0.4;

    let high = Math.max(open, close) * (1 + upperWickFactor);
    let low = Math.min(open, close) * (1 - lowerWickFactor);

    // Add rejection wicks near support/resistance
    for (const s of support) {
      if (low <= s * 1.005 && low >= s * 0.99) {
        low = s * (1 - rng() * 0.002); // wick touches support
      }
    }
    for (const r of resistance) {
      if (high >= r * 0.995 && high <= r * 1.01) {
        high = r * (1 + rng() * 0.002); // wick touches resistance
      }
    }

    // Volume correlated with price change magnitude
    const volMultiplier = 1 + pctChange * 4;
    const volume = Math.floor(baseVolume * volMultiplier * (0.8 + rng() * 0.4));

    bars.push({
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume,
    });

    price = close;
    prevDirection = close > open ? 1 : close < open ? -1 : 0;
  }

  // Inject specific candlestick patterns
  for (const p of patterns) {
    if (p.bar < 0 || p.bar >= bars.length) continue;
    injectPattern(bars, p.bar, p.type);
  }

  return bars;
}

/* ============================================
   PATTERN INJECTION (post-process specific bars)
   ============================================ */

function injectPattern(bars: PracticeBar[], idx: number, type: CandlePattern) {
  const bar = bars[idx];
  const avgPrice = (bar.open + bar.close) / 2;
  const range = Math.max(bar.high - bar.low, avgPrice * 0.005);

  switch (type) {
    case "doji": {
      // Tiny body, extended wicks both directions
      const mid = avgPrice;
      bar.open = +(mid + range * 0.01).toFixed(2);
      bar.close = +(mid - range * 0.01).toFixed(2);
      bar.high = +(mid + range * 0.6).toFixed(2);
      bar.low = +(mid - range * 0.6).toFixed(2);
      break;
    }
    case "hammer": {
      // Small body at top, long lower wick (≥2x body)
      const body = range * 0.15;
      bar.close = +(bar.high - range * 0.05).toFixed(2);
      bar.open = +(bar.close - body).toFixed(2);
      bar.low = +(bar.open - body * 3).toFixed(2);
      break;
    }
    case "shooting-star": {
      // Small body at bottom, long upper wick
      const body = range * 0.15;
      bar.open = +(bar.low + range * 0.05).toFixed(2);
      bar.close = +(bar.open + body).toFixed(2);
      bar.high = +(bar.close + body * 3).toFixed(2);
      break;
    }
    case "bullish-engulfing": {
      // Previous bar must be small red, this bar is large green covering it
      if (idx < 1) break;
      const prev = bars[idx - 1];
      const prevBody = Math.abs(prev.close - prev.open);
      // Make previous bar a small red candle
      prev.close = +(prev.open - prevBody * 0.3).toFixed(2);
      prev.low = +(Math.min(prev.open, prev.close) - prevBody * 0.1).toFixed(2);
      // Make this bar a large green candle engulfing previous
      bar.open = +(prev.close - prevBody * 0.1).toFixed(2);
      bar.close = +(prev.open + prevBody * 0.3).toFixed(2);
      bar.low = +(Math.min(bar.open, prev.low)).toFixed(2);
      bar.high = +(bar.close + prevBody * 0.15).toFixed(2);
      break;
    }
    case "bearish-engulfing": {
      if (idx < 1) break;
      const prev = bars[idx - 1];
      const prevBody = Math.abs(prev.close - prev.open);
      prev.close = +(prev.open + prevBody * 0.3).toFixed(2);
      prev.high = +(Math.max(prev.open, prev.close) + prevBody * 0.1).toFixed(2);
      bar.open = +(prev.close + prevBody * 0.1).toFixed(2);
      bar.close = +(prev.open - prevBody * 0.3).toFixed(2);
      bar.high = +(Math.max(bar.open, prev.high)).toFixed(2);
      bar.low = +(bar.close - prevBody * 0.15).toFixed(2);
      break;
    }
  }

  // Ensure OHLC consistency
  bar.high = +Math.max(bar.open, bar.close, bar.high).toFixed(2);
  bar.low = +Math.min(bar.open, bar.close, bar.low).toFixed(2);
}

/* ============================================
   SCENARIO DATASETS
   ============================================ */

/** Gentle uptrend — good for first buy practice */
export const PRACTICE_UPTREND = {
  bars: generateRealisticBars({
    count: 30, startPrice: 100, seed: 42,
    drift: 0.004, volatility: 0.014,
    meanReversion: 0.03, target: 108,
    momentumBias: 0.6,
    patterns: [{ bar: 8, type: "hammer" }, { bar: 22, type: "bullish-engulfing" }],
    support: [98],
  }),
  initialReveal: 15,
};

/** Up then down — for buy + sell cycle */
export const PRACTICE_UP_DOWN = {
  bars: generateRealisticBars({
    count: 30, startPrice: 100, seed: 101,
    drift: 0.001, volatility: 0.015,
    meanReversion: 0.06, target: 104,
    momentumBias: 0.55,
    patterns: [
      { bar: 12, type: "shooting-star" },
      { bar: 13, type: "bearish-engulfing" },
    ],
    resistance: [108],
  }),
  initialReveal: 10,
};

/** High volatility — for stop-loss / risk lessons */
export const PRACTICE_VOLATILE = {
  bars: generateRealisticBars({
    count: 30, startPrice: 150, seed: 200,
    drift: -0.002, volatility: 0.028,
    meanReversion: 0.02, target: 145,
    momentumBias: 0.45,
    patterns: [{ bar: 5, type: "doji" }, { bar: 18, type: "hammer" }],
  }),
  initialReveal: 12,
};

/** Price dips below a level then recovers — for limit orders */
export const PRACTICE_LIMIT_DIP = {
  bars: generateRealisticBars({
    count: 30, startPrice: 100, seed: 301,
    drift: 0.001, volatility: 0.012,
    meanReversion: 0.08, target: 100,
    momentumBias: 0.5,
    consolidation: [{ start: 0, end: 8, tightness: 0.6 }],
    patterns: [{ bar: 14, type: "hammer" }, { bar: 15, type: "bullish-engulfing" }],
    support: [96],
  }),
  initialReveal: 10,
};

/** Clear SMA crossover pattern — for moving averages lesson */
export const PRACTICE_SMA_CROSS = {
  bars: generateRealisticBars({
    count: 30, startPrice: 100, seed: 401,
    drift: 0.002, volatility: 0.013,
    meanReversion: 0.05, target: 103,
    momentumBias: 0.6,
    consolidation: [{ start: 10, end: 15, tightness: 0.4 }],
    patterns: [{ bar: 16, type: "bullish-engulfing" }],
    support: [97],
  }),
  initialReveal: 15,
};

/** RSI extremes — oversold bounce */
export const PRACTICE_RSI_BOUNCE = {
  bars: generateRealisticBars({
    count: 30, startPrice: 120, seed: 501,
    drift: -0.001, volatility: 0.018,
    meanReversion: 0.04, target: 112,
    momentumBias: 0.55,
    patterns: [
      { bar: 10, type: "hammer" },
      { bar: 11, type: "bullish-engulfing" },
      { bar: 20, type: "doji" },
    ],
    support: [108],
  }),
  initialReveal: 12,
};

/** MACD crossover — bearish to bullish */
export const PRACTICE_MACD_SIGNAL = {
  bars: generateRealisticBars({
    count: 30, startPrice: 100, seed: 601,
    drift: 0.001, volatility: 0.014,
    meanReversion: 0.06, target: 100,
    momentumBias: 0.5,
    patterns: [
      { bar: 8, type: "doji" },
      { bar: 15, type: "hammer" },
      { bar: 16, type: "bullish-engulfing" },
    ],
    support: [95],
  }),
  initialReveal: 14,
};

/** Bollinger squeeze — narrow bands then breakout */
export const PRACTICE_BB_SQUEEZE = {
  bars: generateRealisticBars({
    count: 30, startPrice: 100, seed: 701,
    drift: 0.002, volatility: 0.018,
    meanReversion: 0.03, target: 104,
    momentumBias: 0.55,
    consolidation: [{ start: 2, end: 14, tightness: 0.25 }],
    patterns: [
      { bar: 14, type: "doji" },
      { bar: 15, type: "bullish-engulfing" },
    ],
  }),
  initialReveal: 15,
};

/** Basic explore — gentle mixed movement */
export const PRACTICE_BASIC = {
  bars: generateRealisticBars({
    count: 30, startPrice: 100, seed: 800,
    drift: 0.001, volatility: 0.013,
    meanReversion: 0.04, target: 102,
    momentumBias: 0.5,
    patterns: [{ bar: 18, type: "doji" }, { bar: 25, type: "hammer" }],
  }),
  initialReveal: 15,
};

/** For observing candlestick patterns */
export const PRACTICE_CANDLES = {
  bars: generateRealisticBars({
    count: 30, startPrice: 100, seed: 900,
    drift: 0.002, volatility: 0.018,
    meanReversion: 0.03, target: 105,
    momentumBias: 0.5,
    patterns: [
      { bar: 4, type: "hammer" },
      { bar: 8, type: "doji" },
      { bar: 14, type: "shooting-star" },
      { bar: 18, type: "bullish-engulfing" },
      { bar: 24, type: "bearish-engulfing" },
    ],
  }),
  initialReveal: 10,
};

/** For volume observation */
export const PRACTICE_VOLUME = {
  bars: generateRealisticBars({
    count: 30, startPrice: 100, seed: 1000,
    drift: 0.002, volatility: 0.016,
    meanReversion: 0.03, target: 104,
    momentumBias: 0.55,
    patterns: [{ bar: 12, type: "bullish-engulfing" }, { bar: 22, type: "shooting-star" }],
  }),
  initialReveal: 12,
};

/** Market order practice */
export const PRACTICE_MARKET_ORDER = {
  bars: generateRealisticBars({
    count: 30, startPrice: 150, seed: 1100,
    drift: 0.003, volatility: 0.012,
    meanReversion: 0.02, target: 155,
    momentumBias: 0.6,
    patterns: [{ bar: 20, type: "hammer" }],
    support: [148],
  }),
  initialReveal: 15,
};

/** Position sizing practice */
export const PRACTICE_POSITION_SIZE = {
  bars: generateRealisticBars({
    count: 30, startPrice: 50, seed: 1200,
    drift: 0.002, volatility: 0.015,
    meanReversion: 0.04, target: 52,
    momentumBias: 0.55,
    patterns: [{ bar: 10, type: "doji" }, { bar: 22, type: "hammer" }],
    support: [48],
  }),
  initialReveal: 15,
};

/** Support & Resistance — clear bounces between S/R levels */
export const PRACTICE_SUPPORT_RESISTANCE = {
  bars: generateRealisticBars({
    count: 30, startPrice: 101, seed: 1300,
    drift: 0.0005, volatility: 0.012,
    meanReversion: 0.08, target: 101,
    momentumBias: 0.45,
    support: [98],
    resistance: [104],
    patterns: [
      { bar: 6, type: "hammer" },
      { bar: 12, type: "shooting-star" },
      { bar: 18, type: "hammer" },
      { bar: 24, type: "shooting-star" },
    ],
  }),
  initialReveal: 10,
};

/** Risk/Reward — dip then recovery for R:R practice */
export const PRACTICE_RISK_REWARD = {
  bars: generateRealisticBars({
    count: 30, startPrice: 100, seed: 1400,
    drift: 0.001, volatility: 0.016,
    meanReversion: 0.07, target: 103,
    momentumBias: 0.55,
    patterns: [
      { bar: 8, type: "hammer" },
      { bar: 9, type: "bullish-engulfing" },
    ],
    support: [96],
  }),
  initialReveal: 10,
};

/** Drawdown — sharp decline for stop-loss discipline */
export const PRACTICE_DRAWDOWN = {
  bars: generateRealisticBars({
    count: 30, startPrice: 100, seed: 1500,
    drift: -0.004, volatility: 0.022,
    meanReversion: 0.02, target: 90,
    momentumBias: 0.6,
    patterns: [
      { bar: 4, type: "shooting-star" },
      { bar: 5, type: "bearish-engulfing" },
      { bar: 20, type: "hammer" },
    ],
    resistance: [102],
  }),
  initialReveal: 12,
};
