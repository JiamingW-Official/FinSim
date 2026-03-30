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
    // Only normalize intermediate points (1..n-1) so that pts[0]=open and
    // pts[n]=close are preserved exactly, matching the daily bar anchors.
    let minPt = pts[0];
    let maxPt = pts[0];
    for (let i = 1; i <= n; i++) {
      if (pts[i] < minPt) minPt = pts[i];
      if (pts[i] > maxPt) maxPt = pts[i];
    }
    const ptRange = maxPt - minPt;
    if (ptRange > 0) {
      for (let i = 1; i < n; i++) {
        // Scale interior points into [low, high]; clamp to guard against float drift
        pts[i] = Math.min(high, Math.max(low, low + ((pts[i] - minPt) / ptRange) * range));
      }
      // Restore anchors exactly — normalization must not drift the endpoints
      pts[0] = open;
      pts[n] = close;
    } else {
      // Flat day: linear interpolation preserves open→close
      for (let i = 0; i <= n; i++) pts[i] = open + (close - open) * (i / n);
    }

    // ── Realistic volume distribution ──────────────────────────────────────
    // Layer 1: U-shape (open/close heavier)
    // Layer 2: price-move correlation (big candles = big volume)
    // Layer 3: random spikes (news/order flow)
    // Layer 4: clustering (high-vol bars tend to neighbor each other)

    const rawVolWeights = new Array<number>(n);

    // Pre-compute body sizes for price-move correlation
    const bodies = new Array<number>(n);
    for (let i = 0; i < n; i++) {
      bodies[i] = Math.abs(pts[i + 1] - pts[i]);
    }
    const avgBody = bodies.reduce((s, b) => s + b, 0) / n || 1;

    // Generate random spike layer
    const spikes = new Array<number>(n);
    for (let i = 0; i < n; i++) {
      const r = rand();
      // ~8% chance of a volume spike (2-4x), log-normal tail
      spikes[i] = r < 0.03 ? 3.0 + rand() * 1.5 : r < 0.08 ? 1.8 + rand() * 0.7 : 0.6 + rand() * 0.8;
    }

    for (let i = 0; i < n; i++) {
      const x = i / Math.max(n - 1, 1);
      // U-shape: heavier at market open (first 3 bars) and close (last 3 bars)
      const uShape = i < 3 ? 2.0 + (3 - i) * 0.4 : i >= n - 3 ? 1.6 + (i - (n - 3)) * 0.3 : 0.7 + Math.cos(Math.PI * x) ** 2 * 0.5;

      // Price-move: large body → more volume (1.0 to 2.5x)
      const moveRatio = Math.min(bodies[i] / avgBody, 3.0);
      const moveFactor = 0.5 + moveRatio * 0.7;

      // Combine
      rawVolWeights[i] = uShape * moveFactor * spikes[i];
    }

    // Clustering: smooth with neighbors (high-vol bars cluster)
    const volWeights = new Array<number>(n);
    for (let i = 0; i < n; i++) {
      const prev = i > 0 ? rawVolWeights[i - 1] : rawVolWeights[i];
      const next = i < n - 1 ? rawVolWeights[i + 1] : rawVolWeights[i];
      volWeights[i] = rawVolWeights[i] * 0.6 + prev * 0.2 + next * 0.2;
    }
    const totalWeight = volWeights.reduce((s, w) => s + w, 0);

    // ── Build OHLCV bars with realistic wicks ───────────────────────────────
    const dayStart = timestamp + MARKET_OPEN_OFFSET_MS;
    for (let i = 0; i < n; i++) {
      const bOpen = pts[i];
      const bClose = pts[i + 1];
      const body = Math.abs(bOpen - bClose);
      const bMax = Math.max(bOpen, bClose);
      const bMin = Math.min(bOpen, bClose);

      // Independent upper/lower wicks with power-law distribution
      const r1 = rand();
      const r2 = rand();
      const r3 = rand();

      // Base wick size scales with both body and daily range
      const wickBase = Math.max(body * 0.3, range * 0.012);

      // Occasionally (r3 < 0.12) create a long wick candle
      const longWickMultiplier = r3 < 0.06 ? 3.5 : r3 < 0.12 ? 2.2 : 1.0;

      const upperWickRaw =
        wickBase * (0.2 + Math.sqrt(r1) * 1.8) *
        (r3 < 0.06 ? longWickMultiplier : r3 < 0.12 ? 1.0 : longWickMultiplier * (r1 > 0.5 ? 1 : 0.3));

      const lowerWickRaw =
        wickBase * (0.2 + Math.sqrt(r2) * 1.8) *
        (r3 < 0.06 ? 1.0 : r3 < 0.12 ? longWickMultiplier : longWickMultiplier * (r2 > 0.5 ? 1 : 0.3));

      const bHigh = Math.min(bMax + upperWickRaw, high);
      const bLow = Math.max(bMin - lowerWickRaw, low);
      const bVol = Math.max(1, Math.round((volume * volWeights[i]) / totalWeight));

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
    // More varied midpoints — allow overshoot/undershoot for realistic movement
    const direction = close >= open ? 1 : -1;
    const r1 = rand();
    const r2 = rand();

    // Mid1: sometimes retraces against direction, sometimes extends
    const mid1Bias = r1 < 0.3 ? -0.15 * direction : r1 < 0.7 ? 0.33 : 0.55;
    const mid1 = open + (close - open) * mid1Bias + (rand() - 0.5) * range * 0.45;

    // Mid2: closer to close but with independent variance
    const mid2Bias = r2 < 0.25 ? 0.5 : r2 < 0.75 ? 0.67 : 0.85;
    const mid2 = open + (close - open) * mid2Bias + (rand() - 0.5) * range * 0.35;

    // Clamp midpoints within parent's high/low
    const clamp = (v: number) => Math.max(low, Math.min(high, v));
    const pts = [open, clamp(mid1), clamp(mid2), close];

    // Build 3 sub-bars with realistic volume and wicks
    // Pre-compute body sizes for volume correlation
    const subBodies = [
      Math.abs(pts[1] - pts[0]),
      Math.abs(pts[2] - pts[1]),
      Math.abs(pts[3] - pts[2]),
    ];
    const avgSubBody = (subBodies[0] + subBodies[1] + subBodies[2]) / 3 || 1;

    // Volume weights: body-size correlation + random variance + spike chance
    const vWeights = subBodies.map((b) => {
      const moveW = 0.4 + (b / avgSubBody) * 0.8; // big move = more vol
      const rv = rand();
      const spike = rv < 0.06 ? 2.5 + rand() : rv < 0.12 ? 1.5 + rand() * 0.5 : 0.5 + rand() * 0.8;
      return moveW * spike;
    });
    const vTotal = vWeights[0] + vWeights[1] + vWeights[2];

    for (let i = 0; i < 3; i++) {
      const bOpen = pts[i];
      const bClose = pts[i + 1];
      const body = Math.abs(bOpen - bClose);
      const bMax = Math.max(bOpen, bClose);
      const bMin = Math.min(bOpen, bClose);

      // Independent wicks with variety
      const rU = rand();
      const rL = rand();
      const rType = rand();
      const wickBase = Math.max(body * 0.25, range * 0.02);

      // Occasional long wick (hammer/shooting star in 5m)
      const longMult = rType < 0.08 ? 3.0 : rType < 0.15 ? 2.0 : 1.0;

      const upperWick = wickBase * (0.15 + Math.sqrt(rU) * 1.5) *
        (rType < 0.08 ? longMult : rType < 0.15 ? 1.0 : (rU > 0.5 ? longMult : 0.4));
      const lowerWick = wickBase * (0.15 + Math.sqrt(rL) * 1.5) *
        (rType < 0.08 ? 1.0 : rType < 0.15 ? longMult : (rL > 0.5 ? longMult : 0.4));

      result.push({
        timestamp: timestamp + i * intervalMs,
        open: bOpen,
        high: Math.min(bMax + upperWick, high),
        low: Math.max(bMin - lowerWick, low),
        close: bClose,
        volume: Math.max(1, Math.round((volume * vWeights[i]) / vTotal)),
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
