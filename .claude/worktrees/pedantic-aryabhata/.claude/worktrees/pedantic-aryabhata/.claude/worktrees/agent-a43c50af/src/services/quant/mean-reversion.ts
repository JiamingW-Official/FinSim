// ---------------------------------------------------------------------------
// Mean Reversion Scanner — Z-Score, RSI, Bollinger Position
// ---------------------------------------------------------------------------

export interface MeanReversionSignal {
  ticker: string;
  score: number;        // -100 to +100 (negative = oversold, positive = overbought)
  zScore: number;
  rsiLevel: number;
  bollingerPosition: number; // 0-1, position within bands
  signal: "strong_buy" | "buy" | "neutral" | "sell" | "strong_sell";
  explanation: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += arr[i];
  return s / arr.length;
}

function stdDev(arr: number[], avg: number): number {
  if (arr.length < 2) return 0;
  let sumSq = 0;
  for (let i = 0; i < arr.length; i++) {
    const d = arr[i] - avg;
    sumSq += d * d;
  }
  return Math.sqrt(sumSq / (arr.length - 1));
}

function computeRSI(closes: number[], period: number = 14): number {
  if (closes.length < period + 1) return 50;

  let avgGain = 0;
  let avgLoss = 0;
  const start = closes.length - period - 1;

  // Initial average
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

function computeBollingerPosition(
  closes: number[],
  period: number = 20,
): number {
  if (closes.length < period) return 0.5;

  const window = closes.slice(-period);
  const avg = mean(window);
  const sd = stdDev(window, avg);

  if (sd === 0) return 0.5;

  const upper = avg + 2 * sd;
  const lower = avg - 2 * sd;
  const current = closes[closes.length - 1];
  const bandwidth = upper - lower;

  if (bandwidth === 0) return 0.5;
  return Math.max(0, Math.min(1, (current - lower) / bandwidth));
}

// ─── Main Scanner ────────────────────────────────────────────────────────────

export function scanMeanReversion(
  ticker: string,
  closes: number[],
  lookback: number = 20,
): MeanReversionSignal {
  if (closes.length < lookback + 1) {
    return {
      ticker,
      score: 0,
      zScore: 0,
      rsiLevel: 50,
      bollingerPosition: 0.5,
      signal: "neutral",
      explanation: "Insufficient data for mean reversion analysis.",
    };
  }

  const window = closes.slice(-lookback);
  const avg = mean(window);
  const sd = stdDev(window, avg);
  const current = closes[closes.length - 1];

  // Z-Score: how many standard deviations from the mean
  const zScore = sd > 0 ? (current - avg) / sd : 0;

  // RSI
  const rsiLevel = computeRSI(closes);

  // Bollinger position (0 = at lower band, 1 = at upper band)
  const bollingerPosition = computeBollingerPosition(closes, lookback);

  // Composite score: weighted average, scaled to -100..+100
  // Z-score component: z capped at [-3, 3] -> mapped to [-100, 100]
  const zComponent = Math.max(-100, Math.min(100, (zScore / 3) * 100));
  // RSI component: 50 is neutral, 30 = -100, 70 = +100
  const rsiComponent = Math.max(-100, Math.min(100, ((rsiLevel - 50) / 20) * 100));
  // Bollinger component: 0.5 is neutral, 0 = -100, 1 = +100
  const bbComponent = (bollingerPosition - 0.5) * 200;

  // Weighted composite
  const score = Math.round(
    zComponent * 0.4 + rsiComponent * 0.35 + bbComponent * 0.25,
  );
  const clampedScore = Math.max(-100, Math.min(100, score));

  // Determine signal
  let signal: MeanReversionSignal["signal"];
  if (clampedScore <= -60) signal = "strong_buy";
  else if (clampedScore <= -25) signal = "buy";
  else if (clampedScore >= 60) signal = "strong_sell";
  else if (clampedScore >= 25) signal = "sell";
  else signal = "neutral";

  // Build explanation
  const direction = clampedScore < 0 ? "oversold" : clampedScore > 0 ? "overbought" : "neutral";
  const absZ = Math.abs(zScore);

  let explanation =
    `${ticker} is currently ${direction} with a composite score of ${clampedScore}. `;

  if (absZ > 2) {
    explanation +=
      `The price is ${absZ.toFixed(1)} standard deviations ${zScore < 0 ? "below" : "above"} ` +
      `its ${lookback}-bar mean ($${avg.toFixed(2)}), which is statistically extreme. `;
  } else {
    explanation +=
      `The price is ${absZ.toFixed(1)} standard deviations ${zScore < 0 ? "below" : "above"} ` +
      `its ${lookback}-bar mean ($${avg.toFixed(2)}). `;
  }

  explanation += `RSI is at ${rsiLevel.toFixed(0)}`;
  if (rsiLevel < 30) explanation += " (oversold territory)";
  else if (rsiLevel > 70) explanation += " (overbought territory)";
  explanation += `. `;

  explanation += `Bollinger position: ${(bollingerPosition * 100).toFixed(0)}% `;
  if (bollingerPosition < 0.1) explanation += "(near lower band — potential bounce).";
  else if (bollingerPosition > 0.9) explanation += "(near upper band — potential pullback).";
  else explanation += "(within bands).";

  return {
    ticker,
    score: clampedScore,
    zScore: Math.round(zScore * 100) / 100,
    rsiLevel: Math.round(rsiLevel * 100) / 100,
    bollingerPosition: Math.round(bollingerPosition * 1000) / 1000,
    signal,
    explanation,
  };
}
