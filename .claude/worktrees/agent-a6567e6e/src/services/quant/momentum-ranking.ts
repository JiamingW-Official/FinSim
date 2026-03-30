// ---------------------------------------------------------------------------
// Momentum Factor Ranking — Multi-Timeframe Composite Scoring
// ---------------------------------------------------------------------------

export interface MomentumRank {
  ticker: string;
  momentum12m: number;
  momentum6m: number;
  momentum1m: number;
  compositeScore: number;
  rank: number;
  signal: "strong" | "moderate" | "weak" | "negative";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Calculate return over N periods from end of array. Returns 0 if insufficient data. */
function periodReturn(prices: number[], periods: number): number {
  if (prices.length < periods + 1) return 0;
  const current = prices[prices.length - 1];
  const past = prices[prices.length - 1 - periods];
  if (past === 0) return 0;
  return (current - past) / past;
}

// ─── Main Ranking ────────────────────────────────────────────────────────────

export function rankByMomentum(
  priceHistories: Record<string, number[]>,
  weights: { m12: number; m6: number; m1: number } = { m12: 0.4, m6: 0.4, m1: 0.2 },
): MomentumRank[] {
  const tickers = Object.keys(priceHistories);

  // Approximate bar counts for daily data:
  // 12 months ~ 252 trading days
  // 6 months ~ 126 trading days
  // 1 month ~ 21 trading days
  const results: MomentumRank[] = tickers.map((ticker) => {
    const prices = priceHistories[ticker];

    const momentum12m = periodReturn(prices, 252) * 100;
    const momentum6m = periodReturn(prices, 126) * 100;
    const momentum1m = periodReturn(prices, 21) * 100;

    const compositeScore =
      weights.m12 * momentum12m +
      weights.m6 * momentum6m +
      weights.m1 * momentum1m;

    let signal: MomentumRank["signal"];
    if (compositeScore >= 20) signal = "strong";
    else if (compositeScore >= 5) signal = "moderate";
    else if (compositeScore >= 0) signal = "weak";
    else signal = "negative";

    return {
      ticker,
      momentum12m: Math.round(momentum12m * 100) / 100,
      momentum6m: Math.round(momentum6m * 100) / 100,
      momentum1m: Math.round(momentum1m * 100) / 100,
      compositeScore: Math.round(compositeScore * 100) / 100,
      rank: 0, // Filled in below
      signal,
    };
  });

  // Sort by composite score descending and assign ranks
  results.sort((a, b) => b.compositeScore - a.compositeScore);
  for (let i = 0; i < results.length; i++) {
    results[i].rank = i + 1;
  }

  return results;
}
