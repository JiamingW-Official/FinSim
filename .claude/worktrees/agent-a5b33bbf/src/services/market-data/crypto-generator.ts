/**
 * Crypto price data generator.
 *
 * Key differences from stock generator:
 * - Higher volatility: sigma multiplier of 2.5× stock baseline
 * - 24/7 continuous bars — no market-open offset, no overnight gaps
 * - More extreme pump/dump candles (fat-tailed distribution via power-law wicks)
 * - Seeded with mulberry32 PRNG for determinism
 */

import type { OHLCVBar } from "@/types/market";

// ---------------------------------------------------------------------------
// Mulberry32 seeded PRNG
// ---------------------------------------------------------------------------
function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(value: number, label: string): number {
  let h = (value * 2654435761) | 0;
  for (let i = 0; i < label.length; i++) {
    h = (Math.imul(h, 31) + label.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

// ---------------------------------------------------------------------------
// Crypto metadata
// ---------------------------------------------------------------------------
export interface CryptoAsset {
  ticker: string;
  name: string;
  basePrice: number;
  /** Daily annualised volatility (fraction, e.g. 0.75 = 75% pa) */
  annualVol: number;
  /** Average 24 h volume in USD */
  avgUsdVolume: number;
  /** CoinGecko-style category */
  category: string;
}

export const CRYPTO_ASSETS: CryptoAsset[] = [
  { ticker: "BTC",  name: "Bitcoin",        basePrice: 65000, annualVol: 0.70, avgUsdVolume: 28_000_000_000, category: "Layer-1" },
  { ticker: "ETH",  name: "Ethereum",       basePrice: 3500,  annualVol: 0.85, avgUsdVolume: 14_000_000_000, category: "Layer-1" },
  { ticker: "SOL",  name: "Solana",         basePrice: 145,   annualVol: 1.10, avgUsdVolume:  3_200_000_000, category: "Layer-1" },
  { ticker: "BNB",  name: "BNB",            basePrice: 420,   annualVol: 0.80, avgUsdVolume:  1_800_000_000, category: "Exchange" },
  { ticker: "XRP",  name: "XRP",            basePrice: 0.58,  annualVol: 0.95, avgUsdVolume:  2_100_000_000, category: "Payments" },
  { ticker: "ADA",  name: "Cardano",        basePrice: 0.45,  annualVol: 1.00, avgUsdVolume:    820_000_000, category: "Layer-1" },
  { ticker: "AVAX", name: "Avalanche",      basePrice: 36,    annualVol: 1.20, avgUsdVolume:    950_000_000, category: "Layer-1" },
  { ticker: "LINK", name: "Chainlink",      basePrice: 14.5,  annualVol: 1.05, avgUsdVolume:    670_000_000, category: "Oracle" },
  { ticker: "UNI",  name: "Uniswap",        basePrice: 9.8,   annualVol: 1.15, avgUsdVolume:    420_000_000, category: "DeFi" },
  { ticker: "MATIC",name: "Polygon",        basePrice: 0.72,  annualVol: 1.10, avgUsdVolume:    580_000_000, category: "Layer-2" },
];

// ---------------------------------------------------------------------------
// DeFi protocol metadata (seeded / hardcoded — no external calls)
// ---------------------------------------------------------------------------
export interface DefiMetrics {
  ticker: string;
  protocol: string;
  tvlUsd: number;
  stakingYieldPct: number;
  onChainVolume7dUsd: number;
  dominancePct: number;
}

export function getDefiMetrics(ticker: string, seed?: number): DefiMetrics {
  const s = seed ?? hashSeed(Date.now(), ticker);
  const rand = mulberry32(hashSeed(s, ticker + "defi"));

  const map: Record<string, Omit<DefiMetrics, "ticker">> = {
    BTC:  { protocol: "Bitcoin Network",     tvlUsd: 0,                  stakingYieldPct: 0,   onChainVolume7dUsd: 198_000_000_000, dominancePct: 52.4 },
    ETH:  { protocol: "Ethereum / Lido",     tvlUsd: 48_700_000_000,     stakingYieldPct: 3.8, onChainVolume7dUsd:  82_000_000_000, dominancePct: 17.2 },
    SOL:  { protocol: "Solana / Marinade",   tvlUsd:  8_200_000_000,     stakingYieldPct: 7.1, onChainVolume7dUsd:  11_400_000_000, dominancePct: 3.1  },
    BNB:  { protocol: "BNB Chain / Venus",   tvlUsd:  5_800_000_000,     stakingYieldPct: 4.2, onChainVolume7dUsd:   9_200_000_000, dominancePct: 3.8  },
    XRP:  { protocol: "XRP Ledger / XRPL",  tvlUsd:    820_000_000,     stakingYieldPct: 0,   onChainVolume7dUsd:  14_700_000_000, dominancePct: 2.6  },
    ADA:  { protocol: "Cardano / Minswap",   tvlUsd:    430_000_000,     stakingYieldPct: 3.4, onChainVolume7dUsd:   2_100_000_000, dominancePct: 1.4  },
    AVAX: { protocol: "Avalanche / BENQI",   tvlUsd:  1_780_000_000,     stakingYieldPct: 8.3, onChainVolume7dUsd:   3_600_000_000, dominancePct: 1.2  },
    LINK: { protocol: "Chainlink / Staking", tvlUsd:    650_000_000,     stakingYieldPct: 5.0, onChainVolume7dUsd:   4_700_000_000, dominancePct: 0.9  },
    UNI:  { protocol: "Uniswap v3",          tvlUsd:  6_400_000_000,     stakingYieldPct: 0,   onChainVolume7dUsd:  12_300_000_000, dominancePct: 0.6  },
    MATIC:{ protocol: "Polygon / zkEVM",     tvlUsd:  1_100_000_000,     stakingYieldPct: 5.6, onChainVolume7dUsd:   2_900_000_000, dominancePct: 0.7  },
  };

  const base = map[ticker] ?? {
    protocol: ticker,
    tvlUsd: 0,
    stakingYieldPct: 0,
    onChainVolume7dUsd: 0,
    dominancePct: 0,
  };

  // Add a small seeded jitter so values feel live
  const jitter = (base: number, pct: number) =>
    base * (1 + (rand() - 0.5) * 2 * pct);

  return {
    ticker,
    protocol: base.protocol,
    tvlUsd: base.tvlUsd > 0 ? Math.round(jitter(base.tvlUsd, 0.04)) : 0,
    stakingYieldPct: base.stakingYieldPct > 0
      ? parseFloat(jitter(base.stakingYieldPct, 0.06).toFixed(2))
      : 0,
    onChainVolume7dUsd: Math.round(jitter(base.onChainVolume7dUsd, 0.08)),
    dominancePct: parseFloat(jitter(base.dominancePct, 0.03).toFixed(2)),
  };
}

// ---------------------------------------------------------------------------
// Funding rate (perpetual futures style)
// ---------------------------------------------------------------------------
export function getFundingRate(ticker: string, barTimestamp: number): number {
  const rand = mulberry32(hashSeed(Math.floor(barTimestamp / 28800000), ticker + "fr"));
  // Range: roughly -0.05% to +0.10% (slightly long-biased market)
  const base = (rand() - 0.4) * 0.15;
  return parseFloat(base.toFixed(4));
}

// ---------------------------------------------------------------------------
// Open interest (synthetic, seeded per ticker + day)
// ---------------------------------------------------------------------------
export function getOpenInterest(asset: CryptoAsset, barTimestamp: number): number {
  const dayKey = Math.floor(barTimestamp / 86400000);
  const rand = mulberry32(hashSeed(dayKey, asset.ticker + "oi"));
  // OI ≈ 3–8% of 24 h market volume
  const oiRatio = 0.03 + rand() * 0.05;
  return Math.round(asset.avgUsdVolume * oiRatio);
}

// ---------------------------------------------------------------------------
// Core price series generator (daily bars, crypto-native)
// ---------------------------------------------------------------------------

/**
 * Generate N synthetic daily OHLCV bars for a crypto asset.
 *
 * Crypto specifics:
 * - No market hours — timestamps are UTC midnight, continuous
 * - Higher vol via fat-tailed GBM (Laplace-like distro via sum of two exponentials)
 * - Pump / dump regimes: every ~20 days there is a ±15–40% move regime
 * - Volatility clustering: high-vol days follow high-vol days
 */
export function generateCryptoDailyBars(
  asset: CryptoAsset,
  numDays: number = 500,
  endTimestamp?: number,
): OHLCVBar[] {
  const end = endTimestamp ?? Date.UTC(2026, 2, 27); // 2026-03-27
  const startTimestamp = end - (numDays - 1) * 86400000;

  const rand = mulberry32(hashSeed(startTimestamp, asset.ticker));

  // Daily vol from annual vol (252 trading days)
  const dailyVol = asset.annualVol / Math.sqrt(252);

  const bars: OHLCVBar[] = [];
  let price = asset.basePrice;

  // Regime state
  let regimeMomentum = 0; // positive = bull run, negative = bear run
  let regimeDaysLeft = 0;
  let volatilityMult = 1.0;

  for (let day = 0; day < numDays; day++) {
    const ts = startTimestamp + day * 86400000;
    const dayRand = mulberry32(hashSeed(ts, asset.ticker + "day"));

    // ── Regime transitions ───────────────────────────────────────────────
    if (regimeDaysLeft <= 0) {
      const r = rand();
      if (r < 0.07) {
        // Pump regime
        regimeMomentum = 0.012 + rand() * 0.018;
        regimeDaysLeft = Math.floor(3 + rand() * 12);
        volatilityMult = 1.8 + rand() * 1.4;
      } else if (r < 0.13) {
        // Dump regime
        regimeMomentum = -(0.015 + rand() * 0.022);
        regimeDaysLeft = Math.floor(2 + rand() * 8);
        volatilityMult = 2.0 + rand() * 1.6;
      } else {
        // Ranging / mild trend
        regimeMomentum = (rand() - 0.5) * 0.006;
        regimeDaysLeft = Math.floor(4 + rand() * 10);
        volatilityMult = 0.7 + rand() * 0.6;
      }
    }
    regimeDaysLeft--;

    // ── Fat-tailed daily return ──────────────────────────────────────────
    // Use Box-Muller for base normal
    const u1 = Math.max(1e-9, dayRand());
    const u2 = dayRand();
    const normal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

    // Mix normal with a Laplace tail for crypto fat tails
    const tail = dayRand() < 0.12
      ? (dayRand() < 0.5 ? 1 : -1) * (2 + dayRand() * 4) * dailyVol
      : 0;

    const effectiveVol = dailyVol * volatilityMult;
    const drift = regimeMomentum;
    const ret = drift + normal * effectiveVol + tail;

    const open = price;
    const close = Math.max(asset.basePrice * 0.01, price * (1 + ret));

    // Intraday range: crypto can swing 3–12% intraday
    const intradayRangeFactor = (0.03 + dayRand() * 0.09) * volatilityMult;
    const rangeUsd = Math.abs(close - open) + price * intradayRangeFactor;

    // High/Low with directional bias
    const upBias = dayRand();
    const high = Math.max(open, close) + rangeUsd * upBias * 0.6;
    const low = Math.min(open, close) - rangeUsd * (1 - upBias) * 0.6;

    // Volume: higher vol days = more volume; spike on regime starts
    const regimeVolBoost = regimeDaysLeft === 0 ? 2.0 : 1.0;
    const volNoise = 0.5 + dayRand() * 1.5;
    const volumeUsd = asset.avgUsdVolume * volNoise * regimeVolBoost * Math.abs(1 + ret * 3);
    const volumeCoins = Math.round(volumeUsd / ((open + close) / 2));

    bars.push({
      timestamp: ts,
      open: parseFloat(open.toPrecision(8)),
      high: parseFloat(Math.max(open, high).toPrecision(8)),
      low: parseFloat(Math.min(open, low).toPrecision(8)),
      close: parseFloat(close.toPrecision(8)),
      volume: Math.max(1, volumeCoins),
      ticker: asset.ticker,
      timeframe: "1d",
    });

    price = close;
  }

  return bars;
}

// ---------------------------------------------------------------------------
// 24/7 intraday crypto bars (1h resolution — 24 bars per day)
// ---------------------------------------------------------------------------
const CRYPTO_BARS_PER_DAY = 24; // 1 h bars
const CRYPTO_INTERVAL_MS = 60 * 60 * 1000; // 1 h

/**
 * Expand daily crypto bars into 1-hour bars using a Brownian bridge.
 * Crypto has no market open/close — bars run from UTC midnight continuously.
 * Volatility is 2.5× the equity intraday generator baseline.
 */
export function generateCryptoHourlyBars(dailyBars: OHLCVBar[]): OHLCVBar[] {
  const result: OHLCVBar[] = [];

  for (let dayIdx = 0; dayIdx < dailyBars.length; dayIdx++) {
    const day = dailyBars[dayIdx];
    const { open, high, low, close, volume, ticker, timestamp } = day;
    const range = high - low || Math.abs(close) * 0.01 || 0.01;
    const rand = mulberry32(hashSeed(timestamp, ticker + "1h"));

    const n = CRYPTO_BARS_PER_DAY;

    // No overnight gap adjustment — crypto is continuous
    const effectiveOpen = open;

    // Brownian bridge with crypto-grade sigma (2.5× equity baseline)
    const sigma = range * 0.35; // ≈2.5× the 0.14 used in equity intraday
    const pts = new Array<number>(n + 1);
    pts[0] = effectiveOpen;
    pts[n] = close;

    for (let i = 1; i < n; i++) {
      const t = i / n;
      const drift = effectiveOpen + (close - effectiveOpen) * t;
      const noise = (rand() - 0.5) * 2 * sigma * Math.sqrt(t * (1 - t) * 4);
      pts[i] = drift + noise;
    }

    // Normalize into [low, high]
    let minPt = pts[0], maxPt = pts[0];
    for (let i = 1; i <= n; i++) {
      if (pts[i] < minPt) minPt = pts[i];
      if (pts[i] > maxPt) maxPt = pts[i];
    }
    const ptRange = maxPt - minPt;
    if (ptRange > 0) {
      for (let i = 0; i <= n; i++) {
        pts[i] = low + ((pts[i] - minPt) / ptRange) * range;
      }
    } else {
      for (let i = 0; i <= n; i++) {
        pts[i] = effectiveOpen + (close - effectiveOpen) * (i / n);
      }
    }

    // Volume distribution: crypto has no U-shape — relatively flat with spikes
    const rawVolWeights = new Array<number>(n);
    for (let i = 0; i < n; i++) {
      const body = Math.abs(pts[i + 1] - pts[i]);
      const bodyRatio = Math.min(body / (range / n || 1), 4);
      const rv = rand();
      const spike = rv < 0.04 ? 3.5 + rand() * 2 : rv < 0.10 ? 1.8 + rand() * 0.8 : 0.5 + rand() * 1.0;
      rawVolWeights[i] = (0.8 + bodyRatio * 0.4) * spike;
    }
    const totalWeight = rawVolWeights.reduce((s, w) => s + w, 0);

    // Build bars — timestamps start at UTC midnight (no MARKET_OPEN_OFFSET_MS)
    for (let i = 0; i < n; i++) {
      const bOpen = pts[i];
      const bClose = pts[i + 1];
      const body = Math.abs(bOpen - bClose);
      const bMax = Math.max(bOpen, bClose);
      const bMin = Math.min(bOpen, bClose);

      const r1 = rand();
      const r2 = rand();
      const r3 = rand();

      // Crypto wicks: fatter tails — long wick probability is higher
      const wickBase = Math.max(body * 0.5, range * 0.02);
      const longWickMult = r3 < 0.10 ? 4.5 : r3 < 0.20 ? 2.5 : 1.0;

      const upperWick = wickBase * (0.2 + Math.sqrt(r1) * 2.0) * longWickMult;
      const lowerWick = wickBase * (0.2 + Math.sqrt(r2) * 2.0) * longWickMult;

      let bHigh = Math.min(bMax + upperWick, high);
      let bLow = Math.max(bMin - lowerWick, low);
      bHigh = Math.max(bHigh, bMax);
      bLow = Math.min(bLow, bMin);

      const bVol = Math.max(1, Math.round((volume * rawVolWeights[i]) / totalWeight));

      result.push({
        timestamp: timestamp + i * CRYPTO_INTERVAL_MS,
        open: bOpen,
        high: bHigh,
        low: bLow,
        close: bClose,
        volume: bVol,
        ticker,
        timeframe: "1h",
      });
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Weekly aggregation (same pattern as equity generator)
// ---------------------------------------------------------------------------
export function aggregateCryptoWeeklyBars(dailyBars: OHLCVBar[]): OHLCVBar[] {
  if (dailyBars.length === 0) return [];

  const weekGroups = new Map<number, OHLCVBar[]>();
  for (const bar of dailyBars) {
    const d = new Date(bar.timestamp);
    const dow = d.getUTCDay();
    const diffToMonday = dow === 0 ? -6 : 1 - dow;
    const monday = bar.timestamp + diffToMonday * 86400000;
    if (!weekGroups.has(monday)) weekGroups.set(monday, []);
    weekGroups.get(monday)!.push(bar);
  }

  const result: OHLCVBar[] = [];
  for (const weekStart of Array.from(weekGroups.keys()).sort((a, b) => a - b)) {
    const bars = weekGroups.get(weekStart)!;
    const first = bars[0];
    const last = bars[bars.length - 1];
    let hi = first.high, lo = first.low, vol = 0;
    for (const b of bars) {
      if (b.high > hi) hi = b.high;
      if (b.low < lo) lo = b.low;
      vol += b.volume;
    }
    result.push({
      timestamp: first.timestamp,
      open: first.open,
      high: hi,
      low: lo,
      close: last.close,
      volume: vol,
      ticker: first.ticker,
      timeframe: "1wk",
    });
  }
  return result;
}
