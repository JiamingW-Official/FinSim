import type { OHLCVBar, Timeframe } from "@/types/market";
import {
  INTRADAY_BARS_PER_DAY,
  INTRADAY_INTERVAL_MS,
  MARKET_OPEN_OFFSET_MS,
} from "@/types/market";

// Mulberry32 seeded PRNG — fast, good distribution
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(timestamp: number, ticker: string): number {
  let h = ((timestamp / 86400000) | 0) * 2654435761;
  for (let i = 0; i < ticker.length; i++) {
    h = (Math.imul(h, 31) + ticker.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

/**
 * Generate synthetic intraday (5m / 15m / 1h) bars from daily bars
 * using a Brownian-bridge price path anchored to [open, close].
 */
export function generateIntradayBars(
  dailyBars: OHLCVBar[],
  timeframe: Timeframe,
): OHLCVBar[] {
  const n = INTRADAY_BARS_PER_DAY[timeframe];
  const intervalMs = INTRADAY_INTERVAL_MS[timeframe];
  if (!n || !intervalMs) return dailyBars;

  const result: OHLCVBar[] = [];

  for (const day of dailyBars) {
    const { open, high, low, close, volume, ticker, timestamp } = day;
    const range = high - low || Math.abs(close) * 0.005 || 0.01; // avoid 0
    const rand = mulberry32(hashSeed(timestamp, ticker));

    // ── Brownian bridge: generate n+1 price anchor points ──────────────────
    const pts = new Array<number>(n + 1);
    pts[0] = open;
    pts[n] = close;

    // Intermediate points: linear interpolation + noise
    const sigma = range * 0.14; // controls wiggle amplitude
    for (let i = 1; i < n; i++) {
      const t = i / n;
      const drift = open + (close - open) * t;
      const noise = (rand() - 0.5) * 2 * sigma * Math.sqrt(t * (1 - t) * 4);
      pts[i] = drift + noise;
    }

    // ── Normalize pts to stay within [low, high] ───────────────────────────
    let minPt = pts[0];
    let maxPt = pts[0];
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
      // Flat day
      for (let i = 0; i <= n; i++) pts[i] = open + (close - open) * (i / n);
    }

    // ── U-shaped volume distribution (heavier at open & close) ────────────
    const volWeights = Array.from({ length: n }, (_, i) => {
      const x = i / Math.max(n - 1, 1);
      return 1.5 + Math.cos(Math.PI * x) ** 2 * 2;
    });
    const totalWeight = volWeights.reduce((s, w) => s + w, 0);

    // ── Build OHLCV bars ───────────────────────────────────────────────────
    const dayStart = timestamp + MARKET_OPEN_OFFSET_MS;
    for (let i = 0; i < n; i++) {
      const bOpen = pts[i];
      const bClose = pts[i + 1];
      const bMin = Math.min(bOpen, bClose);
      const bMax = Math.max(bOpen, bClose);
      const wick = range * 0.015 * rand();
      const bHigh = Math.min(bMax + wick, high);
      const bLow = Math.max(bMin - wick, low);
      const bVol = Math.round((volume * volWeights[i]) / totalWeight);

      result.push({
        timestamp: dayStart + i * intervalMs,
        open: bOpen,
        high: bHigh,
        low: bLow,
        close: bClose,
        volume: bVol,
        ticker,
        timeframe,
      });
    }
  }

  return result;
}

/**
 * Aggregate 15m bars back into daily bars (group by UTC date).
 */
export function aggregateDailyBars(bars: OHLCVBar[]): OHLCVBar[] {
  if (bars.length === 0) return [];

  const dayGroups = new Map<string, OHLCVBar[]>();
  for (const bar of bars) {
    const dateKey = new Date(bar.timestamp).toISOString().slice(0, 10);
    if (!dayGroups.has(dateKey)) dayGroups.set(dateKey, []);
    dayGroups.get(dateKey)!.push(bar);
  }

  const result: OHLCVBar[] = [];
  const sortedKeys = Array.from(dayGroups.keys()).sort();

  for (const dateKey of sortedKeys) {
    const group = dayGroups.get(dateKey)!;
    const first = group[0];
    const last = group[group.length - 1];
    let hi = first.high,
      lo = first.low,
      vol = 0;
    for (const b of group) {
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
      timeframe: "1d",
    });
  }
  return result;
}

/**
 * Aggregate 15m bars into hourly bars (group by hour boundary).
 */
export function aggregateHourlyBars(bars: OHLCVBar[]): OHLCVBar[] {
  if (bars.length === 0) return [];

  const hourGroups = new Map<number, OHLCVBar[]>();
  for (const bar of bars) {
    // Floor to hour boundary
    const hourKey = Math.floor(bar.timestamp / 3600000) * 3600000;
    if (!hourGroups.has(hourKey)) hourGroups.set(hourKey, []);
    hourGroups.get(hourKey)!.push(bar);
  }

  const result: OHLCVBar[] = [];
  const sortedKeys = Array.from(hourGroups.keys()).sort((a, b) => a - b);

  for (const hourKey of sortedKeys) {
    const group = hourGroups.get(hourKey)!;
    const first = group[0];
    const last = group[group.length - 1];
    let hi = first.high,
      lo = first.low,
      vol = 0;
    for (const b of group) {
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
      timeframe: "1h",
    });
  }
  return result;
}

/**
 * Expand 15m bars to 5m bars (3 sub-bars per 15m bar via mini Brownian bridge).
 */
export function expand15mTo5m(bars15m: OHLCVBar[]): OHLCVBar[] {
  if (bars15m.length === 0) return [];

  const result: OHLCVBar[] = [];
  const intervalMs = 5 * 60 * 1000;

  for (const bar of bars15m) {
    const { open, high, low, close, volume, ticker, timestamp } = bar;
    const range = high - low || Math.abs(close) * 0.002 || 0.01;
    const rand = mulberry32(hashSeed(timestamp, ticker + "5m"));

    // 3 sub-bars: anchored open→mid1→mid2→close
    const mid1 = open + (close - open) * 0.33 + (rand() - 0.5) * range * 0.3;
    const mid2 = open + (close - open) * 0.67 + (rand() - 0.5) * range * 0.3;
    const pts = [open, mid1, mid2, close];

    for (let i = 0; i < 3; i++) {
      const bOpen = pts[i];
      const bClose = pts[i + 1];
      const bMin = Math.min(bOpen, bClose);
      const bMax = Math.max(bOpen, bClose);
      const wick = range * 0.02 * rand();
      result.push({
        timestamp: timestamp + i * intervalMs,
        open: bOpen,
        high: Math.min(bMax + wick, high),
        low: Math.max(bMin - wick, low),
        close: bClose,
        volume: Math.round(volume / 3),
        ticker,
        timeframe: "5m",
      });
    }
  }
  return result;
}

/**
 * Aggregate daily bars into weekly bars (Monday-anchored).
 */
export function aggregateWeeklyBars(dailyBars: OHLCVBar[]): OHLCVBar[] {
  if (dailyBars.length === 0) return [];

  const weekGroups = new Map<number, OHLCVBar[]>();

  for (const bar of dailyBars) {
    const d = new Date(bar.timestamp);
    const dow = d.getUTCDay(); // 0=Sun … 6=Sat
    const diffToMonday = dow === 0 ? -6 : 1 - dow;
    const monday = bar.timestamp + diffToMonday * 86400000;

    if (!weekGroups.has(monday)) weekGroups.set(monday, []);
    weekGroups.get(monday)!.push(bar);
  }

  const result: OHLCVBar[] = [];
  const sortedKeys = Array.from(weekGroups.keys()).sort((a, b) => a - b);

  for (const weekStart of sortedKeys) {
    const bars = weekGroups.get(weekStart)!;
    const first = bars[0];
    const last = bars[bars.length - 1];
    let hi = first.high;
    let lo = first.low;
    let vol = 0;
    for (const b of bars) {
      if (b.high > hi) hi = b.high;
      if (b.low < lo) lo = b.low;
      vol += b.volume;
    }
    result.push({
      timestamp: first.timestamp, // first trading day of week
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
