import type { OHLCVBar } from "@/types/market";
import type { IndicatorPoint } from "@/services/indicators";
import type { MACDHistogramPoint } from "@/services/indicators";

export interface Divergence {
  type: "bullish" | "bearish";
  indicator: "rsi" | "macd";
  strength: 2 | 3;
  description: string;
  barsAgo: number;
}

// Build a time-indexed lookup from indicator arrays
function buildTimeIndex(
  points: { time: number; value: number }[],
): Map<number, number> {
  const map = new Map<number, number>();
  for (const p of points) {
    map.set(Math.round(p.time), p.value);
  }
  return map;
}

// Find swing lows in the last `lookback` bars
// Returns indices (relative to the original bars array)
function findSwingLows(bars: OHLCVBar[], startIdx: number, endIdx: number): number[] {
  const lows: number[] = [];
  for (let i = startIdx + 1; i < endIdx - 1; i++) {
    if (
      bars[i].low < bars[i - 1].low &&
      bars[i].low < bars[i + 1].low
    ) {
      lows.push(i);
    }
  }
  return lows;
}

// Find swing highs in the last `lookback` bars
function findSwingHighs(bars: OHLCVBar[], startIdx: number, endIdx: number): number[] {
  const highs: number[] = [];
  for (let i = startIdx + 1; i < endIdx - 1; i++) {
    if (
      bars[i].high > bars[i - 1].high &&
      bars[i].high > bars[i + 1].high
    ) {
      highs.push(i);
    }
  }
  return highs;
}

export function detectDivergences(params: {
  bars: OHLCVBar[];
  rsiValues: IndicatorPoint[];
  macdHistValues: MACDHistogramPoint[];
  lookback?: number;
}): Divergence[] {
  const { bars, rsiValues, macdHistValues, lookback = 25 } = params;
  const divergences: Divergence[] = [];

  if (bars.length < 10) return divergences;

  const startIdx = Math.max(0, bars.length - lookback - 1);
  const endIdx = bars.length - 1; // exclude current (last) bar

  // Build time-indexed lookups (time in seconds)
  const rsiByTime = buildTimeIndex(rsiValues);
  const macdHistByTime = buildTimeIndex(macdHistValues);

  // ─── RSI Divergence ──────────────────────────────────────────────────────
  if (rsiValues.length >= 5) {
    // --- Bullish RSI Divergence ---
    const swingLows = findSwingLows(bars, startIdx, endIdx);
    if (swingLows.length >= 2) {
      // Take the 2 most recent swing lows
      const idx0 = swingLows[swingLows.length - 2]; // older
      const idx1 = swingLows[swingLows.length - 1]; // newer (closer to present)

      // Must be at least 3 bars apart
      if (idx1 - idx0 >= 3) {
        const t0 = Math.round(bars[idx0].timestamp / 1000);
        const t1 = Math.round(bars[idx1].timestamp / 1000);
        const rsi0 = rsiByTime.get(t0);
        const rsi1 = rsiByTime.get(t1);

        if (rsi0 !== undefined && rsi1 !== undefined) {
          // Price: lower low (bearish), but RSI: higher low (bullish) → bullish divergence
          if (bars[idx1].low < bars[idx0].low && rsi1 > rsi0) {
            const gap = idx1 - idx0;
            divergences.push({
              type: "bullish",
              indicator: "rsi",
              strength: gap >= 8 ? 3 : 2,
              description: `RSI bullish divergence — price lower low (${bars[idx1].low.toFixed(2)}) but RSI higher low (${rsi1.toFixed(1)} vs ${rsi0.toFixed(1)})`,
              barsAgo: bars.length - 1 - idx0,
            });
          }
        }
      }
    }

    // --- Bearish RSI Divergence ---
    const swingHighs = findSwingHighs(bars, startIdx, endIdx);
    if (swingHighs.length >= 2) {
      const idx0 = swingHighs[swingHighs.length - 2];
      const idx1 = swingHighs[swingHighs.length - 1];

      if (idx1 - idx0 >= 3) {
        const t0 = Math.round(bars[idx0].timestamp / 1000);
        const t1 = Math.round(bars[idx1].timestamp / 1000);
        const rsi0 = rsiByTime.get(t0);
        const rsi1 = rsiByTime.get(t1);

        if (rsi0 !== undefined && rsi1 !== undefined) {
          // Price: higher high (bullish), but RSI: lower high (bearish) → bearish divergence
          if (bars[idx1].high > bars[idx0].high && rsi1 < rsi0) {
            const gap = idx1 - idx0;
            divergences.push({
              type: "bearish",
              indicator: "rsi",
              strength: gap >= 8 ? 3 : 2,
              description: `RSI bearish divergence — price higher high (${bars[idx1].high.toFixed(2)}) but RSI lower high (${rsi1.toFixed(1)} vs ${rsi0.toFixed(1)})`,
              barsAgo: bars.length - 1 - idx0,
            });
          }
        }
      }
    }
  }

  // ─── MACD Histogram Divergence ────────────────────────────────────────────
  if (macdHistValues.length >= 5) {
    // --- Bullish MACD Divergence ---
    const swingLows = findSwingLows(bars, startIdx, endIdx);
    if (swingLows.length >= 2) {
      const idx0 = swingLows[swingLows.length - 2];
      const idx1 = swingLows[swingLows.length - 1];

      if (idx1 - idx0 >= 3) {
        const t0 = Math.round(bars[idx0].timestamp / 1000);
        const t1 = Math.round(bars[idx1].timestamp / 1000);
        const macd0 = macdHistByTime.get(t0);
        const macd1 = macdHistByTime.get(t1);

        if (macd0 !== undefined && macd1 !== undefined) {
          // Both histogram values should be negative (bearish territory)
          if (
            bars[idx1].low < bars[idx0].low &&
            macd1 > macd0 &&
            macd0 < 0 &&
            macd1 < 0
          ) {
            const gap = idx1 - idx0;
            divergences.push({
              type: "bullish",
              indicator: "macd",
              strength: gap >= 8 ? 3 : 2,
              description: `MACD bullish divergence — price lower low but histogram less negative (${macd1.toFixed(3)} vs ${macd0.toFixed(3)})`,
              barsAgo: bars.length - 1 - idx0,
            });
          }
        }
      }
    }

    // --- Bearish MACD Divergence ---
    const swingHighs = findSwingHighs(bars, startIdx, endIdx);
    if (swingHighs.length >= 2) {
      const idx0 = swingHighs[swingHighs.length - 2];
      const idx1 = swingHighs[swingHighs.length - 1];

      if (idx1 - idx0 >= 3) {
        const t0 = Math.round(bars[idx0].timestamp / 1000);
        const t1 = Math.round(bars[idx1].timestamp / 1000);
        const macd0 = macdHistByTime.get(t0);
        const macd1 = macdHistByTime.get(t1);

        if (macd0 !== undefined && macd1 !== undefined) {
          // Both should be positive (bullish territory)
          if (
            bars[idx1].high > bars[idx0].high &&
            macd1 < macd0 &&
            macd0 > 0 &&
            macd1 > 0
          ) {
            const gap = idx1 - idx0;
            divergences.push({
              type: "bearish",
              indicator: "macd",
              strength: gap >= 8 ? 3 : 2,
              description: `MACD bearish divergence — price higher high but histogram weakening (${macd1.toFixed(3)} vs ${macd0.toFixed(3)})`,
              barsAgo: bars.length - 1 - idx0,
            });
          }
        }
      }
    }
  }

  return divergences;
}
