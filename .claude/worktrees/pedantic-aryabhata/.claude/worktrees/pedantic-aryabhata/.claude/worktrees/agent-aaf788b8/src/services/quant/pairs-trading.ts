// ---------------------------------------------------------------------------
// Pairs Trading / Statistical Arbitrage — Spread Analysis & Cointegration
// ---------------------------------------------------------------------------

export interface PairAnalysis {
  ticker1: string;
  ticker2: string;
  correlation: number;
  cointegration: boolean;
  spreadZScore: number;
  halfLife: number;
  signal: "long_spread" | "short_spread" | "neutral";
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

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
    sumY2 += y[i] * y[i];
  }

  const denom = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY),
  );
  if (denom === 0) return 0;
  return (n * sumXY - sumX * sumY) / denom;
}

/**
 * Estimate mean-reversion half-life via OLS regression.
 * Regress spread changes on lagged spread levels: delta_S(t) = a + b * S(t-1) + e
 * Half-life = -ln(2) / b
 */
function estimateHalfLife(spread: number[]): number {
  if (spread.length < 3) return Infinity;

  const n = spread.length - 1;
  // y = delta spread, x = lagged spread
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

  for (let i = 1; i <= n; i++) {
    const x = spread[i - 1];
    const y = spread[i] - spread[i - 1];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  const denom = n * sumX2 - sumX * sumX;
  if (Math.abs(denom) < 1e-12) return Infinity;

  const b = (n * sumXY - sumX * sumY) / denom;

  // Half-life is only meaningful if b < 0 (mean-reverting)
  if (b >= 0) return Infinity;

  const halfLife = -Math.log(2) / b;
  return Math.max(1, Math.round(halfLife * 10) / 10);
}

// ─── Analyze a Single Pair ───────────────────────────────────────────────────

export function analyzePair(
  ticker1: string,
  prices1: number[],
  ticker2: string,
  prices2: number[],
  lookback: number = 60,
): PairAnalysis {
  const n = Math.min(prices1.length, prices2.length);

  if (n < 20) {
    return {
      ticker1,
      ticker2,
      correlation: 0,
      cointegration: false,
      spreadZScore: 0,
      halfLife: Infinity,
      signal: "neutral",
      explanation: "Insufficient data to analyze this pair.",
    };
  }

  // Use the most recent `lookback` bars (or all available)
  const len = Math.min(n, lookback);
  const p1 = prices1.slice(-len);
  const p2 = prices2.slice(-len);

  // Log returns for correlation
  const logRet1: number[] = [];
  const logRet2: number[] = [];
  for (let i = 1; i < len; i++) {
    logRet1.push(Math.log(p1[i] / p1[i - 1]));
    logRet2.push(Math.log(p2[i] / p2[i - 1]));
  }

  const correlation = pearsonCorrelation(logRet1, logRet2);

  // Log price ratio as the spread
  const spread: number[] = [];
  for (let i = 0; i < len; i++) {
    spread.push(Math.log(p1[i] / p2[i]));
  }

  const spreadMean = mean(spread);
  const spreadStd = stdDev(spread, spreadMean);
  const currentSpread = spread[spread.length - 1];
  const spreadZScore = spreadStd > 0 ? (currentSpread - spreadMean) / spreadStd : 0;

  // Half-life of mean reversion
  const halfLife = estimateHalfLife(spread);

  // Simplified cointegration check:
  // High correlation (> 0.7) + finite half-life (< lookback/2) + |z-score| at some point > 1
  const cointegration = Math.abs(correlation) > 0.7 && halfLife < lookback / 2 && isFinite(halfLife);

  // Signal
  let signal: PairAnalysis["signal"];
  if (spreadZScore <= -1.5 && cointegration) signal = "long_spread";
  else if (spreadZScore >= 1.5 && cointegration) signal = "short_spread";
  else signal = "neutral";

  // Explanation
  let explanation = `${ticker1}/${ticker2} pair has a correlation of ${correlation.toFixed(2)}. `;

  if (cointegration) {
    explanation +=
      `The spread appears cointegrated with a half-life of ${halfLife.toFixed(1)} bars. `;
  } else {
    explanation += `The spread does not show strong cointegration. `;
  }

  explanation += `Current spread z-score: ${spreadZScore.toFixed(2)}. `;

  if (signal === "long_spread") {
    explanation +=
      `The spread is ${Math.abs(spreadZScore).toFixed(1)} std devs below its mean, ` +
      `suggesting ${ticker1} is undervalued relative to ${ticker2}. ` +
      `Consider: long ${ticker1} / short ${ticker2}.`;
  } else if (signal === "short_spread") {
    explanation +=
      `The spread is ${spreadZScore.toFixed(1)} std devs above its mean, ` +
      `suggesting ${ticker1} is overvalued relative to ${ticker2}. ` +
      `Consider: short ${ticker1} / long ${ticker2}.`;
  } else {
    explanation += `No actionable signal at this time.`;
  }

  return {
    ticker1,
    ticker2,
    correlation: Math.round(correlation * 1000) / 1000,
    cointegration,
    spreadZScore: Math.round(spreadZScore * 100) / 100,
    halfLife: isFinite(halfLife) ? halfLife : -1,
    signal,
    explanation,
  };
}

// ─── Find Best Pairs ─────────────────────────────────────────────────────────

export function findBestPairs(
  priceHistories: Record<string, number[]>,
  tickers: string[],
): PairAnalysis[] {
  const results: PairAnalysis[] = [];

  for (let i = 0; i < tickers.length; i++) {
    for (let j = i + 1; j < tickers.length; j++) {
      const t1 = tickers[i];
      const t2 = tickers[j];
      if (priceHistories[t1] && priceHistories[t2]) {
        results.push(analyzePair(t1, priceHistories[t1], t2, priceHistories[t2]));
      }
    }
  }

  // Sort by absolute spread z-score descending (most extreme signals first)
  results.sort((a, b) => Math.abs(b.spreadZScore) - Math.abs(a.spreadZScore));

  return results;
}
