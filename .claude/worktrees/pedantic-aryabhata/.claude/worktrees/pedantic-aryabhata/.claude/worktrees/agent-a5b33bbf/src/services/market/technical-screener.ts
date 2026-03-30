// ---------------------------------------------------------------------------
// Technical Pattern Screener — Multi-Pattern Scanner Across Tickers
// ---------------------------------------------------------------------------

export interface TechnicalPattern {
  ticker: string;
  pattern: string;
  type: "bullish" | "bearish" | "neutral";
  reliability: number;
  priceTarget?: number;
  stopLoss?: number;
  description: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sma(prices: number[], period: number): number {
  if (prices.length < period) return NaN;
  const window = prices.slice(-period);
  return window.reduce((s, v) => s + v, 0) / period;
}

function ema(prices: number[], period: number): number[] {
  const result: number[] = [];
  if (prices.length === 0) return result;
  const multiplier = 2 / (period + 1);
  result.push(prices[0]);
  for (let i = 1; i < prices.length; i++) {
    result.push((prices[i] - result[i - 1]) * multiplier + result[i - 1]);
  }
  return result;
}

function computeRSI(closes: number[], period: number = 14): number {
  if (closes.length < period + 1) return 50;
  let avgGain = 0;
  let avgLoss = 0;
  const start = closes.length - period - 1;
  for (let i = start + 1; i <= start + period; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) avgGain += change;
    else avgLoss += Math.abs(change);
  }
  avgGain /= period;
  avgLoss /= period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function rollingStdDev(prices: number[], period: number): number {
  if (prices.length < period) return 0;
  const window = prices.slice(-period);
  const avg = window.reduce((s, v) => s + v, 0) / period;
  let sumSq = 0;
  for (const v of window) {
    const d = v - avg;
    sumSq += d * d;
  }
  return Math.sqrt(sumSq / (period - 1));
}

function avgVolume(volumes: number[], period: number): number {
  if (volumes.length < period) return 0;
  const window = volumes.slice(-period);
  return window.reduce((s, v) => s + v, 0) / period;
}

// ─── Pattern Detectors ───────────────────────────────────────────────────────

function detectGoldenCross(
  ticker: string,
  prices: number[],
): TechnicalPattern | null {
  if (prices.length < 210) return null;
  const sma50Now = sma(prices, 50);
  const sma200Now = sma(prices, 200);
  const prev = prices.slice(0, -1);
  const sma50Prev = sma(prev, 50);
  const sma200Prev = sma(prev, 200);

  if (sma50Prev <= sma200Prev && sma50Now > sma200Now) {
    const current = prices[prices.length - 1];
    return {
      ticker,
      pattern: "Golden Cross",
      type: "bullish",
      reliability: 0.72,
      priceTarget: Math.round(current * 1.12 * 100) / 100,
      stopLoss: Math.round(current * 0.95 * 100) / 100,
      description:
        "The 50-day SMA has crossed above the 200-day SMA, signaling a potential long-term uptrend. Historically reliable when confirmed by volume.",
    };
  }
  return null;
}

function detectDeathCross(
  ticker: string,
  prices: number[],
): TechnicalPattern | null {
  if (prices.length < 210) return null;
  const sma50Now = sma(prices, 50);
  const sma200Now = sma(prices, 200);
  const prev = prices.slice(0, -1);
  const sma50Prev = sma(prev, 50);
  const sma200Prev = sma(prev, 200);

  if (sma50Prev >= sma200Prev && sma50Now < sma200Now) {
    const current = prices[prices.length - 1];
    return {
      ticker,
      pattern: "Death Cross",
      type: "bearish",
      reliability: 0.68,
      priceTarget: Math.round(current * 0.88 * 100) / 100,
      stopLoss: Math.round(current * 1.05 * 100) / 100,
      description:
        "The 50-day SMA has crossed below the 200-day SMA, signaling potential long-term weakness. Often a lagging indicator but significant for trend-followers.",
    };
  }
  return null;
}

function detectBollingerSqueeze(
  ticker: string,
  prices: number[],
): TechnicalPattern | null {
  if (prices.length < 30) return null;
  const current = prices[prices.length - 1];
  const avg = sma(prices, 20);
  const sd = rollingStdDev(prices, 20);
  const bandwidth = sd / avg;

  // Compare to historical bandwidth
  const historicalBandwidths: number[] = [];
  for (let i = 30; i <= prices.length; i++) {
    const windowPrices = prices.slice(i - 20, i);
    const windowAvg = windowPrices.reduce((s, v) => s + v, 0) / 20;
    const windowSd = rollingStdDev(windowPrices, 20);
    if (windowAvg > 0) historicalBandwidths.push(windowSd / windowAvg);
  }

  if (historicalBandwidths.length < 5) return null;

  const sortedBW = [...historicalBandwidths].sort((a, b) => a - b);
  const pctile =
    sortedBW.findIndex((v) => v >= bandwidth) / sortedBW.length;

  if (pctile < 0.1) {
    return {
      ticker,
      pattern: "Bollinger Squeeze",
      type: "neutral",
      reliability: 0.65,
      priceTarget: Math.round((current + sd * 2) * 100) / 100,
      stopLoss: Math.round((current - sd * 2) * 100) / 100,
      description:
        "Bollinger Bands are at their narrowest in recent history, indicating extremely low volatility. A significant move (direction unknown) often follows a squeeze.",
    };
  }
  return null;
}

function detectRSIDivergence(
  ticker: string,
  prices: number[],
): TechnicalPattern | null {
  if (prices.length < 30) return null;
  const n = prices.length;
  const current = prices[n - 1];

  // Check for bullish divergence: price making lower lows, RSI making higher lows
  const priceLow1 = Math.min(...prices.slice(-15, -5));
  const priceLow2 = Math.min(...prices.slice(-5));
  const rsi1 = computeRSI(prices.slice(0, -5));
  const rsi2 = computeRSI(prices);

  if (priceLow2 < priceLow1 && rsi2 > rsi1 && rsi2 < 40) {
    return {
      ticker,
      pattern: "Bullish RSI Divergence",
      type: "bullish",
      reliability: 0.62,
      priceTarget: Math.round(current * 1.08 * 100) / 100,
      stopLoss: Math.round(priceLow2 * 0.98 * 100) / 100,
      description:
        "Price is making lower lows while RSI is making higher lows. This divergence suggests bearish momentum is weakening and a reversal may follow.",
    };
  }

  // Bearish divergence: price making higher highs, RSI making lower highs
  const priceHigh1 = Math.max(...prices.slice(-15, -5));
  const priceHigh2 = Math.max(...prices.slice(-5));

  if (priceHigh2 > priceHigh1 && rsi2 < rsi1 && rsi2 > 60) {
    return {
      ticker,
      pattern: "Bearish RSI Divergence",
      type: "bearish",
      reliability: 0.60,
      priceTarget: Math.round(current * 0.92 * 100) / 100,
      stopLoss: Math.round(priceHigh2 * 1.02 * 100) / 100,
      description:
        "Price is making higher highs while RSI is making lower highs. Bullish momentum is fading and a pullback may be imminent.",
    };
  }

  return null;
}

function detectMACDCrossover(
  ticker: string,
  prices: number[],
): TechnicalPattern | null {
  if (prices.length < 30) return null;
  const current = prices[prices.length - 1];
  const ema12 = ema(prices, 12);
  const ema26 = ema(prices, 26);

  if (ema12.length < 2 || ema26.length < 2) return null;

  const n = ema12.length;
  const macdNow = ema12[n - 1] - ema26[n - 1];
  const macdPrev = ema12[n - 2] - ema26[n - 2];

  // Signal line (9-period EMA of MACD)
  const macdLine: number[] = [];
  for (let i = 0; i < n; i++) {
    macdLine.push(ema12[i] - ema26[i]);
  }
  const signalLine = ema(macdLine, 9);
  if (signalLine.length < 2) return null;

  const signalNow = signalLine[n - 1];
  const signalPrev = signalLine[n - 2];

  // Bullish crossover
  if (macdPrev <= signalPrev && macdNow > signalNow && macdNow < 0) {
    return {
      ticker,
      pattern: "MACD Bullish Crossover",
      type: "bullish",
      reliability: 0.63,
      priceTarget: Math.round(current * 1.06 * 100) / 100,
      stopLoss: Math.round(current * 0.97 * 100) / 100,
      description:
        "MACD has crossed above its signal line below zero, suggesting upward momentum is building. Most reliable when it occurs below the zero line.",
    };
  }

  // Bearish crossover
  if (macdPrev >= signalPrev && macdNow < signalNow && macdNow > 0) {
    return {
      ticker,
      pattern: "MACD Bearish Crossover",
      type: "bearish",
      reliability: 0.61,
      priceTarget: Math.round(current * 0.94 * 100) / 100,
      stopLoss: Math.round(current * 1.03 * 100) / 100,
      description:
        "MACD has crossed below its signal line above zero, suggesting downward momentum is building. Most reliable when it occurs above the zero line.",
    };
  }

  return null;
}

function detectVolumeBreakout(
  ticker: string,
  prices: number[],
): TechnicalPattern | null {
  if (prices.length < 25) return null;
  const n = prices.length;
  const current = prices[n - 1];
  const prev = prices[n - 2];
  const sma20val = sma(prices, 20);

  // Check for price breakout above 20-day high with momentum
  const recent20High = Math.max(...prices.slice(-21, -1));
  const recent20Low = Math.min(...prices.slice(-21, -1));

  if (current > recent20High && current > prev) {
    return {
      ticker,
      pattern: "Volume Breakout (High)",
      type: "bullish",
      reliability: 0.58,
      priceTarget: Math.round((current + (current - recent20Low) * 0.5) * 100) / 100,
      stopLoss: Math.round(sma20val * 100) / 100,
      description:
        "Price has broken above the 20-day high, signaling potential trend acceleration. Volume confirmation would strengthen this signal.",
    };
  }

  if (current < recent20Low && current < prev) {
    return {
      ticker,
      pattern: "Volume Breakout (Low)",
      type: "bearish",
      reliability: 0.56,
      priceTarget: Math.round((current - (recent20High - current) * 0.5) * 100) / 100,
      stopLoss: Math.round(sma20val * 100) / 100,
      description:
        "Price has broken below the 20-day low, signaling potential trend reversal to the downside.",
    };
  }

  return null;
}

function detectCupAndHandle(
  ticker: string,
  prices: number[],
): TechnicalPattern | null {
  if (prices.length < 60) return null;
  const n = prices.length;
  const current = prices[n - 1];

  // Simplified cup & handle: price was at a high, dipped, recovered, then small pullback
  const peak1 = Math.max(...prices.slice(-60, -40));
  const trough = Math.min(...prices.slice(-40, -15));
  const peak2 = Math.max(...prices.slice(-15, -5));
  const handleLow = Math.min(...prices.slice(-5));

  const peak1Idx = prices.slice(-60, -40).indexOf(peak1) + (n - 60);
  const peak2Idx = prices.slice(-15, -5).indexOf(peak2) + (n - 15);

  // Cup: peak1 and peak2 within 5%, trough at least 10% below
  const peakDiff = Math.abs(peak1 - peak2) / peak1;
  const cupDepth = (peak1 - trough) / peak1;
  const handleDepth = (peak2 - handleLow) / peak2;

  if (
    peakDiff < 0.05 &&
    cupDepth > 0.1 &&
    cupDepth < 0.35 &&
    handleDepth > 0.02 &&
    handleDepth < 0.1 &&
    current > handleLow
  ) {
    return {
      ticker,
      pattern: "Cup & Handle",
      type: "bullish",
      reliability: 0.67,
      priceTarget: Math.round((peak2 + (peak2 - trough) * 0.5) * 100) / 100,
      stopLoss: Math.round(handleLow * 0.98 * 100) / 100,
      description:
        "A U-shaped recovery followed by a small consolidation forms the classic cup and handle pattern. A breakout above the handle high suggests continuation higher.",
    };
  }

  return null;
}

function detectHeadAndShoulders(
  ticker: string,
  prices: number[],
): TechnicalPattern | null {
  if (prices.length < 50) return null;
  const n = prices.length;
  const current = prices[n - 1];

  // Simplified H&S: three peaks where middle is highest
  const seg1 = prices.slice(-50, -35);
  const seg2 = prices.slice(-35, -20);
  const seg3 = prices.slice(-20, -5);

  const leftShoulder = Math.max(...seg1);
  const head = Math.max(...seg2);
  const rightShoulder = Math.max(...seg3);

  // Neckline: average of troughs between peaks
  const trough1 = Math.min(...prices.slice(-45, -30));
  const trough2 = Math.min(...prices.slice(-25, -10));
  const neckline = (trough1 + trough2) / 2;

  // Validate: head > both shoulders, shoulders roughly equal, price breaking neckline
  const shoulderDiff = Math.abs(leftShoulder - rightShoulder) / leftShoulder;

  if (
    head > leftShoulder * 1.02 &&
    head > rightShoulder * 1.02 &&
    shoulderDiff < 0.08 &&
    current < neckline * 1.02
  ) {
    const patternHeight = head - neckline;
    return {
      ticker,
      pattern: "Head & Shoulders",
      type: "bearish",
      reliability: 0.70,
      priceTarget: Math.round((neckline - patternHeight) * 100) / 100,
      stopLoss: Math.round(rightShoulder * 1.02 * 100) / 100,
      description:
        "A head and shoulders pattern with a left shoulder, higher head, and right shoulder of similar height. A break below the neckline confirms the bearish reversal.",
    };
  }

  return null;
}

// ─── Main Scanner ────────────────────────────────────────────────────────────

/**
 * Scan multiple tickers for technical patterns.
 *
 * @param tickerPrices - Map of ticker -> daily close prices (oldest first)
 */
export function scanTechnicalPatterns(
  tickerPrices: Record<string, number[]>,
): TechnicalPattern[] {
  const results: TechnicalPattern[] = [];

  for (const [ticker, prices] of Object.entries(tickerPrices)) {
    if (prices.length < 20) continue;

    const detectors = [
      detectGoldenCross,
      detectDeathCross,
      detectBollingerSqueeze,
      detectRSIDivergence,
      detectMACDCrossover,
      detectVolumeBreakout,
      detectCupAndHandle,
      detectHeadAndShoulders,
    ];

    for (const detector of detectors) {
      const pattern = detector(ticker, prices);
      if (pattern) results.push(pattern);
    }
  }

  // Sort by reliability descending
  results.sort((a, b) => b.reliability - a.reliability);

  return results;
}
