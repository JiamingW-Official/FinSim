// ---------------------------------------------------------------------------
// Market Regime Classification — HMM-Inspired Approach Using Trend, Vol, Momentum
// ---------------------------------------------------------------------------

export type MarketRegime =
  | "bull_trend"
  | "bear_trend"
  | "high_vol"
  | "low_vol"
  | "mean_reversion"
  | "breakout";

export interface RegimeClassification {
  currentRegime: MarketRegime;
  confidence: number;
  regimeHistory: { date: number; regime: MarketRegime }[];
  suggestedStrategy: string;
  explanation: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sma(arr: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
      continue;
    }
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += arr[j];
    result.push(sum / period);
  }
  return result;
}

function rollingStdDev(arr: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
      continue;
    }
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += arr[j];
    const mean = sum / period;
    let sumSq = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const d = arr[j] - mean;
      sumSq += d * d;
    }
    result.push(Math.sqrt(sumSq / (period - 1)));
  }
  return result;
}

function percentileRank(value: number, history: number[]): number {
  const valid = history.filter((v) => !isNaN(v));
  if (valid.length === 0) return 50;
  let below = 0;
  for (let i = 0; i < valid.length; i++) {
    if (valid[i] < value) below++;
  }
  return (below / valid.length) * 100;
}

function rateOfChange(prices: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < period) {
      result.push(0);
    } else {
      const prev = prices[i - period];
      result.push(prev !== 0 ? ((prices[i] - prev) / prev) * 100 : 0);
    }
  }
  return result;
}

function computeATR(
  prices: number[],
  period: number = 14,
): number[] {
  if (prices.length < 2) return prices.map(() => 0);
  const trueRanges: number[] = [0];
  for (let i = 1; i < prices.length; i++) {
    // Approximation: use close-to-close range as proxy when no OHLC
    trueRanges.push(Math.abs(prices[i] - prices[i - 1]));
  }
  // Wilder smoothing
  const atr: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < period) {
      atr.push(NaN);
      continue;
    }
    if (i === period) {
      let sum = 0;
      for (let j = 1; j <= period; j++) sum += trueRanges[j];
      atr.push(sum / period);
    } else {
      const prev = atr[atr.length - 1];
      atr.push((prev * (period - 1) + trueRanges[i]) / period);
    }
  }
  return atr;
}

// ─── Regime Detection ────────────────────────────────────────────────────────

function classifySingleBar(
  trendScore: number,
  volPercentile: number,
  roc: number,
  atrNorm: number,
): { regime: MarketRegime; confidence: number } {
  // Score each regime
  const scores: Record<MarketRegime, number> = {
    bull_trend: 0,
    bear_trend: 0,
    high_vol: 0,
    low_vol: 0,
    mean_reversion: 0,
    breakout: 0,
  };

  // Trend component (SMA20 vs SMA50 cross)
  if (trendScore > 0.5) {
    scores.bull_trend += trendScore * 40;
  } else if (trendScore < -0.5) {
    scores.bear_trend += Math.abs(trendScore) * 40;
  }

  // Volatility component
  if (volPercentile > 80) {
    scores.high_vol += (volPercentile - 50) * 0.5;
  } else if (volPercentile < 20) {
    scores.low_vol += (50 - volPercentile) * 0.5;
  }

  // Momentum component (ROC)
  if (roc > 5) {
    scores.bull_trend += Math.min(roc, 20);
    if (volPercentile < 30 && roc > 10) scores.breakout += roc * 1.5;
  } else if (roc < -5) {
    scores.bear_trend += Math.min(Math.abs(roc), 20);
    if (volPercentile < 30 && roc < -10) scores.breakout += Math.abs(roc) * 1.5;
  }

  // Mean reversion signals: low trend + moderate vol + small ROC
  if (Math.abs(trendScore) < 0.3 && volPercentile > 30 && volPercentile < 70 && Math.abs(roc) < 3) {
    scores.mean_reversion += 25;
  }

  // Breakout: low vol + sudden ATR expansion
  if (volPercentile < 25 && atrNorm > 1.5) {
    scores.breakout += 30;
  }

  // Find winning regime
  let bestRegime: MarketRegime = "low_vol";
  let bestScore = -Infinity;
  let totalScore = 0;
  for (const [regime, score] of Object.entries(scores)) {
    totalScore += score;
    if (score > bestScore) {
      bestScore = score;
      bestRegime = regime as MarketRegime;
    }
  }

  const confidence =
    totalScore > 0
      ? Math.min(0.99, Math.max(0.2, bestScore / totalScore))
      : 0.25;

  return { regime: bestRegime, confidence };
}

// ─── Strategy Mapping ────────────────────────────────────────────────────────

const STRATEGY_MAP: Record<MarketRegime, string> = {
  bull_trend:
    "Trend following: buy breakouts, use trailing stops, add to winners. Moving average crossovers work well.",
  bear_trend:
    "Defensive: reduce position sizes, consider hedges, sell rallies. Inverse ETFs or put protection.",
  high_vol:
    "Volatility strategies: sell premium (iron condors), widen stops, reduce position sizes. Mean reversion may fail.",
  low_vol:
    "Range trading: sell at resistance, buy at support. Breakout strategies on standby. Options are cheap — buy straddles.",
  mean_reversion:
    "Mean reversion: buy oversold, sell overbought. RSI and Bollinger bands are effective. Tight stops.",
  breakout:
    "Breakout trading: buy above resistance, sell below support. Volume confirmation is critical. Wide initial stops.",
};

// ─── Main ────────────────────────────────────────────────────────────────────

/**
 * Classify market regime using trend, volatility, and momentum features.
 *
 * @param prices - Daily close prices (oldest first)
 * @param volumes - Daily volumes (oldest first, same length as prices)
 */
export function classifyRegime(
  prices: number[],
  volumes: number[],
): RegimeClassification {
  const n = prices.length;

  if (n < 60) {
    return {
      currentRegime: "low_vol",
      confidence: 0.2,
      regimeHistory: [],
      suggestedStrategy: STRATEGY_MAP.low_vol,
      explanation: "Insufficient data (need at least 60 bars) for regime classification.",
    };
  }

  // Compute features
  const sma20 = sma(prices, 20);
  const sma50 = sma(prices, 50);
  const roc20 = rateOfChange(prices, 20);
  const atrSeries = computeATR(prices, 14);

  // Daily returns for rolling volatility
  const returns: number[] = [0];
  for (let i = 1; i < n; i++) {
    returns.push(prices[i - 1] !== 0 ? (prices[i] - prices[i - 1]) / prices[i - 1] : 0);
  }
  const rollingVol = rollingStdDev(returns, 20);
  const allValidVol = rollingVol.filter((v) => !isNaN(v));

  // Classify each bar (from bar 50 onward)
  const regimeHistory: { date: number; regime: MarketRegime }[] = [];
  const startIdx = 50;

  for (let i = startIdx; i < n; i++) {
    // Trend score: normalized SMA20 - SMA50 difference
    const sma20v = sma20[i];
    const sma50v = sma50[i];
    let trendScore = 0;
    if (!isNaN(sma20v) && !isNaN(sma50v) && sma50v > 0) {
      trendScore = ((sma20v - sma50v) / sma50v) * 100;
      trendScore = Math.max(-3, Math.min(3, trendScore));
    }

    // Volatility percentile
    const currentVol = rollingVol[i];
    const volPct = !isNaN(currentVol)
      ? percentileRank(currentVol, allValidVol)
      : 50;

    // ROC
    const currentROC = roc20[i];

    // ATR normalized by its own 50-period average
    const atrVal = atrSeries[i];
    let atrNorm = 1;
    if (!isNaN(atrVal) && i >= 50) {
      const atrWindow = atrSeries.slice(Math.max(0, i - 50), i).filter((v) => !isNaN(v));
      if (atrWindow.length > 0) {
        const avgATR = atrWindow.reduce((s, v) => s + v, 0) / atrWindow.length;
        atrNorm = avgATR > 0 ? atrVal / avgATR : 1;
      }
    }

    const { regime } = classifySingleBar(trendScore, volPct, currentROC, atrNorm);

    // Use index as proxy timestamp (caller can map)
    regimeHistory.push({ date: i, regime });
  }

  // Current regime: use smoothed classification (majority of last 5 bars)
  const recentRegimes = regimeHistory.slice(-5);
  const regimeCounts: Record<string, number> = {};
  for (const r of recentRegimes) {
    regimeCounts[r.regime] = (regimeCounts[r.regime] ?? 0) + 1;
  }

  let currentRegime: MarketRegime = "low_vol";
  let maxCount = 0;
  for (const [regime, count] of Object.entries(regimeCounts)) {
    if (count > maxCount) {
      maxCount = count;
      currentRegime = regime as MarketRegime;
    }
  }

  const confidence = Math.round((maxCount / recentRegimes.length) * 100) / 100;

  // Build explanation
  const lastReturn = n >= 2 ? ((prices[n - 1] - prices[n - 2]) / prices[n - 2]) * 100 : 0;
  const roc20Current = roc20[n - 1];
  const volPctCurrent = !isNaN(rollingVol[n - 1])
    ? percentileRank(rollingVol[n - 1], allValidVol)
    : 50;

  const regimeLabel = currentRegime.replace("_", " ");
  let explanation =
    `Market is currently in a ${regimeLabel} regime (${(confidence * 100).toFixed(0)}% confidence). `;

  explanation += `20-day momentum: ${roc20Current >= 0 ? "+" : ""}${roc20Current.toFixed(1)}%. `;
  explanation += `Volatility is at the ${volPctCurrent.toFixed(0)}th percentile of recent history. `;

  if (currentRegime === "bull_trend") {
    explanation += "Prices are above key moving averages with positive momentum.";
  } else if (currentRegime === "bear_trend") {
    explanation += "Prices are below key moving averages with negative momentum.";
  } else if (currentRegime === "high_vol") {
    explanation += "Elevated volatility suggests uncertainty and wider price swings.";
  } else if (currentRegime === "low_vol") {
    explanation += "Compressed volatility often precedes a significant move.";
  } else if (currentRegime === "mean_reversion") {
    explanation += "Range-bound conditions favor buying dips and selling rallies.";
  } else {
    explanation += "A volatility expansion from compressed levels suggests a new trend may be forming.";
  }

  return {
    currentRegime,
    confidence,
    regimeHistory,
    suggestedStrategy: STRATEGY_MAP[currentRegime],
    explanation,
  };
}
