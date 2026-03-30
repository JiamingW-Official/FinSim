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
  let prevAbsReturn = volatility; // for GARCH-like volatility clustering

  for (let i = 0; i < count; i++) {
    // ── Effective volatility ──
    // Start with base volatility, then apply GARCH clustering + consolidation
    let sigma = volatility;

    // GARCH-like volatility clustering: large moves beget large moves
    const garchBlend = 0.25;
    const volRatio = Math.min(prevAbsReturn / volatility, 2.5);
    sigma *= (1 - garchBlend) + garchBlend * volRatio;

    // Consolidation zones reduce volatility
    for (const c of consolidation) {
      if (i >= c.start && i <= c.end) {
        sigma *= c.tightness;
      }
    }

    // ── Mean-reverting log return (Ornstein-Uhlenbeck) ──
    let z = normalRandom(rng);

    // Momentum bias: previous direction continues with given probability
    if (prevDirection !== 0 && rng() < momentumBias) {
      z = Math.abs(z) * prevDirection;
    }

    let logReturn = drift + meanReversion * (Math.log(target) - Math.log(price)) + sigma * z;

    // ── Support/resistance bounce (zone-based) ──
    const nextPrice = price * Math.exp(logReturn);
    for (const s of support) {
      const dist = (nextPrice - s) / s;
      // Activate when approaching from above within 2% zone
      if (dist < 0.02 && dist > -0.01) {
        const proximity = Math.max(0, 1 - dist / 0.02); // 0=far, 1=at level
        if (rng() < 0.5 + proximity * 0.3) {
          logReturn = Math.abs(logReturn) * (0.3 + proximity * 0.3);
        }
      }
    }
    for (const r of resistance) {
      const dist = (r - nextPrice) / r;
      if (dist < 0.02 && dist > -0.01) {
        const proximity = Math.max(0, 1 - dist / 0.02);
        if (rng() < 0.5 + proximity * 0.3) {
          logReturn = -Math.abs(logReturn) * (0.3 + proximity * 0.3);
        }
      }
    }

    // ── Opening gap: real candles don't always open at prev close ──
    const gapFactor = normalRandom(rng) * sigma * 0.12;
    const open = i === 0 ? startPrice : price * (1 + gapFactor);
    const close = open * Math.exp(logReturn);
    const pctChange = Math.abs(close - open) / open;

    // Track for next bar's GARCH clustering
    prevAbsReturn = Math.abs(logReturn);

    // ── Asymmetric wicks based on direction ──
    const isBullish = close >= open;
    const wickSigma = sigma * 0.8;

    // Bullish: longer lower wicks (buying pressure). Bearish: longer upper wicks.
    const upperWickFactor = isBullish
      ? Math.abs(normalRandom(rng)) * wickSigma * 0.4
      : Math.abs(normalRandom(rng)) * wickSigma * 0.8;
    const lowerWickFactor = isBullish
      ? Math.abs(normalRandom(rng)) * wickSigma * 0.8
      : Math.abs(normalRandom(rng)) * wickSigma * 0.4;

    // Occasional long pin bars (5% chance of extended wick)
    const pinMultiplier = rng() < 0.05 ? 2.0 : 1.0;

    let high = Math.max(open, close) * (1 + upperWickFactor * pinMultiplier);
    let low = Math.min(open, close) * (1 - lowerWickFactor * pinMultiplier);

    // Rejection wicks near S/R: wick extends to touch level
    for (const s of support) {
      if (low <= s * 1.005 && low >= s * 0.99) {
        low = s * (1 - rng() * 0.002);
      }
    }
    for (const r of resistance) {
      if (high >= r * 0.995 && high <= r * 1.01) {
        high = r * (1 + rng() * 0.002);
      }
    }

    // ── Volume: realistic correlation with price + context ──
    let volBase = baseVolume;
    // Volume dries up in consolidation (squeeze = low volume)
    for (const c of consolidation) {
      if (i >= c.start && i <= c.end) {
        volBase *= 0.55;
      }
    }
    // Volume spikes on large moves (6x multiplier vs old 4x)
    const volMultiplier = 1 + pctChange * 6;
    // Near S/R levels = higher volume (contested zones)
    let srBoost = 1.0;
    for (const s of support) {
      if (Math.abs(close - s) / s < 0.015) srBoost = Math.max(srBoost, 1.4);
    }
    for (const r of resistance) {
      if (Math.abs(close - r) / r < 0.015) srBoost = Math.max(srBoost, 1.4);
    }
    const volume = Math.floor(volBase * volMultiplier * srBoost * (0.7 + rng() * 0.6));

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

/** Gentle uptrend — AAPL ~$195 (mid-2024) */
export const PRACTICE_UPTREND = {
  bars: generateRealisticBars({
    count: 60, startPrice: 192, seed: 42,
    drift: 0.004, volatility: 0.014,
    meanReversion: 0.03, target: 215,
    momentumBias: 0.6,
    consolidation: [{ start: 20, end: 28, tightness: 0.4 }],
    patterns: [
      { bar: 12, type: "hammer" },
      { bar: 28, type: "doji" },
      { bar: 30, type: "bullish-engulfing" },
      { bar: 45, type: "shooting-star" },
      { bar: 52, type: "hammer" },
    ],
    support: [188, 198],
    resistance: [220],
  }),
  initialReveal: 20,
};

/** Up then down — GOOG ~$175 (mid-2024) */
export const PRACTICE_UP_DOWN = {
  bars: generateRealisticBars({
    count: 60, startPrice: 173, seed: 101,
    drift: 0.001, volatility: 0.015,
    meanReversion: 0.06, target: 180,
    momentumBias: 0.55,
    consolidation: [{ start: 35, end: 42, tightness: 0.45 }],
    patterns: [
      { bar: 10, type: "bullish-engulfing" },
      { bar: 24, type: "shooting-star" },
      { bar: 25, type: "bearish-engulfing" },
      { bar: 40, type: "doji" },
      { bar: 50, type: "hammer" },
    ],
    support: [166],
    resistance: [187],
  }),
  initialReveal: 15,
};

/** High volatility — TSLA ~$180 (mid-2024) */
export const PRACTICE_VOLATILE = {
  bars: generateRealisticBars({
    count: 60, startPrice: 178, seed: 200,
    drift: -0.002, volatility: 0.028,
    meanReversion: 0.02, target: 165,
    momentumBias: 0.45,
    patterns: [
      { bar: 8, type: "doji" },
      { bar: 15, type: "bearish-engulfing" },
      { bar: 30, type: "hammer" },
      { bar: 31, type: "bullish-engulfing" },
      { bar: 48, type: "shooting-star" },
    ],
    support: [160],
    resistance: [185],
  }),
  initialReveal: 15,
};

/** Price dips below a level then recovers — MSFT ~$420 (mid-2024) */
export const PRACTICE_LIMIT_DIP = {
  bars: generateRealisticBars({
    count: 60, startPrice: 418, seed: 301,
    drift: 0.001, volatility: 0.012,
    meanReversion: 0.08, target: 420,
    momentumBias: 0.5,
    consolidation: [
      { start: 0, end: 15, tightness: 0.5 },
      { start: 40, end: 48, tightness: 0.45 },
    ],
    patterns: [
      { bar: 18, type: "bearish-engulfing" },
      { bar: 26, type: "hammer" },
      { bar: 28, type: "bullish-engulfing" },
      { bar: 50, type: "doji" },
    ],
    support: [402, 410],
    resistance: [432],
  }),
  initialReveal: 15,
};

/** Clear SMA crossover pattern — META ~$505 (mid-2024) */
export const PRACTICE_SMA_CROSS = {
  bars: generateRealisticBars({
    count: 60, startPrice: 502, seed: 401,
    drift: 0.002, volatility: 0.013,
    meanReversion: 0.05, target: 530,
    momentumBias: 0.6,
    consolidation: [
      { start: 15, end: 28, tightness: 0.35 },
    ],
    patterns: [
      { bar: 10, type: "doji" },
      { bar: 28, type: "doji" },
      { bar: 30, type: "bullish-engulfing" },
      { bar: 45, type: "shooting-star" },
      { bar: 50, type: "hammer" },
    ],
    support: [488, 500],
    resistance: [540],
  }),
  initialReveal: 20,
};

/** RSI extremes — NVDA ~$125 (mid-2024 post-split) */
export const PRACTICE_RSI_BOUNCE = {
  bars: generateRealisticBars({
    count: 60, startPrice: 126, seed: 501,
    drift: -0.001, volatility: 0.018,
    meanReversion: 0.04, target: 117,
    momentumBias: 0.55,
    consolidation: [{ start: 35, end: 42, tightness: 0.4 }],
    patterns: [
      { bar: 8, type: "shooting-star" },
      { bar: 18, type: "hammer" },
      { bar: 20, type: "bullish-engulfing" },
      { bar: 38, type: "doji" },
      { bar: 48, type: "shooting-star" },
    ],
    support: [113, 118],
    resistance: [130],
  }),
  initialReveal: 15,
};

/** MACD crossover — AMZN ~$185 (mid-2024) */
export const PRACTICE_MACD_SIGNAL = {
  bars: generateRealisticBars({
    count: 60, startPrice: 183, seed: 601,
    drift: 0.001, volatility: 0.014,
    meanReversion: 0.06, target: 185,
    momentumBias: 0.5,
    consolidation: [{ start: 20, end: 30, tightness: 0.4 }],
    patterns: [
      { bar: 12, type: "shooting-star" },
      { bar: 15, type: "doji" },
      { bar: 30, type: "hammer" },
      { bar: 32, type: "bullish-engulfing" },
      { bar: 48, type: "doji" },
    ],
    support: [174, 178],
    resistance: [192],
  }),
  initialReveal: 18,
};

/** Bollinger squeeze — JPM ~$205 (mid-2024) */
export const PRACTICE_BB_SQUEEZE = {
  bars: generateRealisticBars({
    count: 60, startPrice: 203, seed: 701,
    drift: 0.002, volatility: 0.018,
    meanReversion: 0.03, target: 215,
    momentumBias: 0.55,
    consolidation: [{ start: 5, end: 30, tightness: 0.22 }],
    patterns: [
      { bar: 15, type: "doji" },
      { bar: 25, type: "doji" },
      { bar: 30, type: "doji" },
      { bar: 32, type: "bullish-engulfing" },
      { bar: 45, type: "shooting-star" },
      { bar: 50, type: "hammer" },
    ],
    support: [197],
    resistance: [212, 220],
  }),
  initialReveal: 20,
};

/** Basic explore — AAPL ~$195 gentle mixed movement */
export const PRACTICE_BASIC = {
  bars: generateRealisticBars({
    count: 60, startPrice: 194, seed: 800,
    drift: 0.001, volatility: 0.013,
    meanReversion: 0.04, target: 200,
    momentumBias: 0.5,
    consolidation: [{ start: 25, end: 32, tightness: 0.45 }],
    patterns: [
      { bar: 12, type: "hammer" },
      { bar: 30, type: "doji" },
      { bar: 42, type: "shooting-star" },
      { bar: 50, type: "bullish-engulfing" },
    ],
    support: [190],
    resistance: [204],
  }),
  initialReveal: 18,
};

/** For observing candlestick patterns — GOOG ~$175 */
export const PRACTICE_CANDLES = {
  bars: generateRealisticBars({
    count: 60, startPrice: 174, seed: 900,
    drift: 0.002, volatility: 0.018,
    meanReversion: 0.03, target: 185,
    momentumBias: 0.5,
    consolidation: [{ start: 30, end: 38, tightness: 0.4 }],
    patterns: [
      { bar: 6, type: "hammer" },
      { bar: 14, type: "doji" },
      { bar: 22, type: "shooting-star" },
      { bar: 28, type: "bullish-engulfing" },
      { bar: 36, type: "doji" },
      { bar: 42, type: "bearish-engulfing" },
      { bar: 48, type: "hammer" },
      { bar: 55, type: "shooting-star" },
    ],
    support: [169],
    resistance: [188],
  }),
  initialReveal: 12,
};

/** For volume observation — TSLA ~$180 */
export const PRACTICE_VOLUME = {
  bars: generateRealisticBars({
    count: 60, startPrice: 179, seed: 1000,
    drift: 0.002, volatility: 0.016,
    meanReversion: 0.03, target: 188,
    momentumBias: 0.55,
    consolidation: [{ start: 20, end: 28, tightness: 0.35 }],
    patterns: [
      { bar: 10, type: "hammer" },
      { bar: 22, type: "doji" },
      { bar: 30, type: "bullish-engulfing" },
      { bar: 42, type: "shooting-star" },
      { bar: 50, type: "bearish-engulfing" },
    ],
    support: [173],
    resistance: [191],
    baseVolume: 75000,
  }),
  initialReveal: 15,
};

/** Market order practice — AAPL ~$195 */
export const PRACTICE_MARKET_ORDER = {
  bars: generateRealisticBars({
    count: 60, startPrice: 193, seed: 1100,
    drift: 0.003, volatility: 0.012,
    meanReversion: 0.02, target: 205,
    momentumBias: 0.6,
    consolidation: [{ start: 25, end: 32, tightness: 0.4 }],
    patterns: [
      { bar: 15, type: "doji" },
      { bar: 32, type: "bullish-engulfing" },
      { bar: 42, type: "shooting-star" },
      { bar: 48, type: "hammer" },
    ],
    support: [189, 195],
    resistance: [210],
  }),
  initialReveal: 18,
};

/** Position sizing practice — AMD ~$165 (mid-2024) */
export const PRACTICE_POSITION_SIZE = {
  bars: generateRealisticBars({
    count: 60, startPrice: 163, seed: 1200,
    drift: 0.002, volatility: 0.015,
    meanReversion: 0.04, target: 172,
    momentumBias: 0.55,
    consolidation: [{ start: 22, end: 30, tightness: 0.4 }],
    patterns: [
      { bar: 15, type: "doji" },
      { bar: 30, type: "hammer" },
      { bar: 35, type: "bullish-engulfing" },
      { bar: 50, type: "shooting-star" },
    ],
    support: [157],
    resistance: [175],
  }),
  initialReveal: 18,
};

/** Support & Resistance — MSFT ~$420 clear bounces between S/R levels */
export const PRACTICE_SUPPORT_RESISTANCE = {
  bars: generateRealisticBars({
    count: 60, startPrice: 419, seed: 1300,
    drift: 0.0005, volatility: 0.012,
    meanReversion: 0.08, target: 420,
    momentumBias: 0.45,
    consolidation: [
      { start: 25, end: 32, tightness: 0.5 },
      { start: 48, end: 54, tightness: 0.45 },
    ],
    support: [406, 410],
    resistance: [432, 436],
    patterns: [
      { bar: 8, type: "hammer" },
      { bar: 16, type: "shooting-star" },
      { bar: 24, type: "hammer" },
      { bar: 32, type: "doji" },
      { bar: 40, type: "shooting-star" },
      { bar: 48, type: "hammer" },
      { bar: 55, type: "shooting-star" },
    ],
  }),
  initialReveal: 12,
};

/** Risk/Reward — GOOG ~$175 dip then recovery for R:R practice */
export const PRACTICE_RISK_REWARD = {
  bars: generateRealisticBars({
    count: 60, startPrice: 174, seed: 1400,
    drift: 0.001, volatility: 0.016,
    meanReversion: 0.07, target: 181,
    momentumBias: 0.55,
    consolidation: [{ start: 30, end: 38, tightness: 0.4 }],
    patterns: [
      { bar: 10, type: "shooting-star" },
      { bar: 16, type: "hammer" },
      { bar: 18, type: "bullish-engulfing" },
      { bar: 38, type: "doji" },
      { bar: 48, type: "shooting-star" },
    ],
    support: [167, 170],
    resistance: [184],
  }),
  initialReveal: 12,
};

/** Drawdown — TSLA ~$180 sharp decline for stop-loss discipline */
export const PRACTICE_DRAWDOWN = {
  bars: generateRealisticBars({
    count: 60, startPrice: 182, seed: 1500,
    drift: -0.004, volatility: 0.022,
    meanReversion: 0.02, target: 155,
    momentumBias: 0.6,
    consolidation: [{ start: 30, end: 38, tightness: 0.45 }],
    patterns: [
      { bar: 6, type: "shooting-star" },
      { bar: 8, type: "bearish-engulfing" },
      { bar: 25, type: "hammer" },
      { bar: 35, type: "doji" },
      { bar: 40, type: "bearish-engulfing" },
      { bar: 52, type: "hammer" },
    ],
    support: [158, 165],
    resistance: [180, 184],
  }),
  initialReveal: 15,
};
