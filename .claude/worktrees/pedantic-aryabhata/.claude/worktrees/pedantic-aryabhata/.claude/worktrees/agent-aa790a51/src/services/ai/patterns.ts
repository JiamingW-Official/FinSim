import type { OHLCVBar } from "@/types/market";
import type { SignalDirection } from "./signals";

export interface CandlePattern {
  name: string;
  direction: SignalDirection;
  strength: 1 | 2 | 3;
  description: string;
}

function bodySize(bar: OHLCVBar): number {
  return Math.abs(bar.close - bar.open);
}

function totalRange(bar: OHLCVBar): number {
  return bar.high - bar.low;
}

function upperWick(bar: OHLCVBar): number {
  return bar.high - Math.max(bar.open, bar.close);
}

function lowerWick(bar: OHLCVBar): number {
  return Math.min(bar.open, bar.close) - bar.low;
}

function isGreen(bar: OHLCVBar): boolean {
  return bar.close >= bar.open;
}

function isRed(bar: OHLCVBar): boolean {
  return bar.close < bar.open;
}

export function detectCandlePatterns(
  bars: OHLCVBar[],
  lookback = 10,
): CandlePattern[] {
  const patterns: CandlePattern[] = [];
  if (bars.length < 3) return patterns;

  const n = bars.length;
  const recent = bars.slice(Math.max(0, n - lookback));
  const curr = recent[recent.length - 1];
  const prev = recent.length >= 2 ? recent[recent.length - 2] : null;
  const prev2 = recent.length >= 3 ? recent[recent.length - 3] : null;

  if (!curr) return patterns;

  const currBody = bodySize(curr);
  const currRange = totalRange(curr);
  const currUpper = upperWick(curr);
  const currLower = lowerWick(curr);

  // ── 1. Hammer ───────────────────────────────────────────────────────────
  // Long lower wick ≥ 2× body, small upper wick, after downtrend
  if (currRange > 0 && currBody > 0) {
    const lowerWickRatio = currLower / currBody;
    const upperWickRatio = currUpper / currBody;
    const recentTrend =
      recent.length >= 3
        ? recent[recent.length - 3].close > recent[recent.length - 2].close
        : false;

    if (lowerWickRatio >= 2 && upperWickRatio <= 0.3 && recentTrend) {
      patterns.push({
        name: "Hammer",
        direction: "bullish",
        strength: 3,
        description: `Hammer pattern — strong lower wick signals potential reversal`,
      });
    }
  }

  // ── 2. Shooting Star ────────────────────────────────────────────────────
  // Long upper wick ≥ 2× body, small lower wick, after uptrend
  if (currRange > 0 && currBody > 0) {
    const upperWickRatio = currUpper / currBody;
    const lowerWickRatio = currLower / currBody;
    const recentUptrend =
      recent.length >= 3
        ? recent[recent.length - 3].close < recent[recent.length - 2].close
        : false;

    if (upperWickRatio >= 2 && lowerWickRatio <= 0.3 && recentUptrend) {
      patterns.push({
        name: "Shooting Star",
        direction: "bearish",
        strength: 3,
        description: `Shooting Star — rejection at highs signals potential reversal`,
      });
    }
  }

  // ── 3. Bullish Engulfing ─────────────────────────────────────────────────
  // Current green body fully covers previous red body
  if (prev && isGreen(curr) && isRed(prev)) {
    const prevBody = bodySize(prev);
    if (currBody > prevBody && curr.open < prev.close && curr.close > prev.open) {
      patterns.push({
        name: "Bullish Engulfing",
        direction: "bullish",
        strength: 2,
        description: `Bullish Engulfing — buyers overwhelmed sellers`,
      });
    }
  }

  // ── 4. Bearish Engulfing ─────────────────────────────────────────────────
  // Current red body fully covers previous green body
  if (prev && isRed(curr) && isGreen(prev)) {
    const prevBody = bodySize(prev);
    if (currBody > prevBody && curr.open > prev.close && curr.close < prev.open) {
      patterns.push({
        name: "Bearish Engulfing",
        direction: "bearish",
        strength: 2,
        description: `Bearish Engulfing — sellers overwhelmed buyers`,
      });
    }
  }

  // ── 5. Doji ──────────────────────────────────────────────────────────────
  // Body < 5% of range
  if (currRange > 0 && currBody / currRange < 0.05) {
    patterns.push({
      name: "Doji",
      direction: "neutral",
      strength: 1,
      description: `Doji — indecision between buyers and sellers`,
    });
  }

  // ── 6. Three White Soldiers ──────────────────────────────────────────────
  // 3 consecutive green candles, each opening within prior body
  if (prev && prev2 && isGreen(curr) && isGreen(prev) && isGreen(prev2)) {
    const opensInBody =
      prev.open >= prev2.open &&
      prev.open <= prev2.close &&
      curr.open >= prev.open &&
      curr.open <= prev.close;
    const eachHigher = curr.close > prev.close && prev.close > prev2.close;
    if (opensInBody && eachHigher) {
      patterns.push({
        name: "Three White Soldiers",
        direction: "bullish",
        strength: 3,
        description: `Three White Soldiers — sustained buying pressure`,
      });
    }
  }

  // ── 7. Three Black Crows ─────────────────────────────────────────────────
  // 3 consecutive red candles, each opening within prior body
  if (prev && prev2 && isRed(curr) && isRed(prev) && isRed(prev2)) {
    const opensInBody =
      prev.open <= prev2.open &&
      prev.open >= prev2.close &&
      curr.open <= prev.open &&
      curr.open >= prev.close;
    const eachLower = curr.close < prev.close && prev.close < prev2.close;
    if (opensInBody && eachLower) {
      patterns.push({
        name: "Three Black Crows",
        direction: "bearish",
        strength: 3,
        description: `Three Black Crows — sustained selling pressure`,
      });
    }
  }

  // ── 8. Morning Star ──────────────────────────────────────────────────────
  // Red candle, then small-body candle (gap or doji), then large green
  if (prev && prev2 && isRed(prev2) && isGreen(curr)) {
    const middleSmall = bodySize(prev) < bodySize(prev2) * 0.3;
    const greenRecovers = curr.close > (prev2.open + prev2.close) / 2;
    if (middleSmall && greenRecovers) {
      patterns.push({
        name: "Morning Star",
        direction: "bullish",
        strength: 3,
        description: `Morning Star — bullish reversal after downtrend`,
      });
    }
  }

  // ── 9. Evening Star ──────────────────────────────────────────────────────
  // Green candle, then small-body candle, then large red
  if (prev && prev2 && isGreen(prev2) && isRed(curr)) {
    const middleSmall = bodySize(prev) < bodySize(prev2) * 0.3;
    const redRecovers = curr.close < (prev2.open + prev2.close) / 2;
    if (middleSmall && redRecovers) {
      patterns.push({
        name: "Evening Star",
        direction: "bearish",
        strength: 3,
        description: `Evening Star — bearish reversal after uptrend`,
      });
    }
  }

  // ── 10. Pin Bar ──────────────────────────────────────────────────────────
  // One wick ≥ 3× body, strong rejection
  if (currRange > 0 && currBody > 0) {
    const lowerRatio = currLower / currBody;
    const upperRatio = currUpper / currBody;
    if (lowerRatio >= 3) {
      patterns.push({
        name: "Bullish Pin Bar",
        direction: "bullish",
        strength: 2,
        description: `Bullish Pin Bar — strong rejection of lower prices`,
      });
    } else if (upperRatio >= 3) {
      patterns.push({
        name: "Bearish Pin Bar",
        direction: "bearish",
        strength: 2,
        description: `Bearish Pin Bar — strong rejection of higher prices`,
      });
    }
  }

  return patterns;
}
