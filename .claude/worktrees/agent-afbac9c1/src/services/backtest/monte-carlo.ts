// Monte Carlo simulation for the simple backtesting engine.
// Takes the realized trade P&L sequence, shuffles it randomly 1000 times (seeded),
// and builds an ensemble of equity paths. Reports 10th/50th/90th percentile curves
// and a 95% confidence interval for the final portfolio value.

import type { SimpleBacktestTrade } from "./simple-engine";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PercentileCurve {
  /** Percentile label, e.g. 10, 50, 90 */
  percentile: number;
  /** Equity values indexed by trade number (0 = starting equity) */
  equity: number[];
}

export interface MonteCarloReport {
  /** Number of simulations run */
  simulations: number;
  /** Starting capital */
  startingEquity: number;
  /** Number of trades reshuffled per simulation */
  tradeCount: number;
  /** Percentile equity curves: p10, p50, p90 */
  curves: PercentileCurve[];
  /** Final equity at each percentile */
  p5Final: number;
  p10Final: number;
  p25Final: number;
  p50Final: number;
  p75Final: number;
  p90Final: number;
  p95Final: number;
  /** 95% confidence interval for final portfolio value */
  ci95Low: number;
  ci95High: number;
  /** Final return at each percentile */
  p10ReturnPct: number;
  p50ReturnPct: number;
  p90ReturnPct: number;
  /** Probability of ruin (equity < 50% of starting) */
  ruinProbabilityPct: number;
  /** Probability of profit */
  profitProbabilityPct: number;
  /** Median max drawdown across all simulations */
  medianMaxDrawdownPct: number;
}

// ── Implementation ────────────────────────────────────────────────────────────

// Mulberry32 PRNG — fast, seeded, portable
function mulberry32(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fisher-Yates shuffle using a provided rng function
function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Compute max drawdown of an equity array
function maxDrawdown(equity: number[]): number {
  let peak = equity[0];
  let maxDD = 0;
  for (const e of equity) {
    if (e > peak) peak = e;
    const dd = peak > 0 ? ((peak - e) / peak) * 100 : 0;
    if (dd > maxDD) maxDD = dd;
  }
  return maxDD;
}

// Percentile of a sorted array
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.max(0, Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length)));
  return sorted[idx];
}

/**
 * Run Monte Carlo simulation by reshuffling the trade P&L sequence.
 *
 * @param trades        Trade list from runSimpleBacktest
 * @param simulations   Number of random reshuffle runs (default 1000)
 * @param startingEquity  Starting portfolio value (default 10000)
 * @param seed          PRNG seed (default 42)
 */
export function runMonteCarlo(
  trades: SimpleBacktestTrade[],
  simulations: number = 1000,
  startingEquity: number = 10000,
  seed: number = 42,
): MonteCarloReport {
  const rng = mulberry32(seed);

  if (trades.length === 0) {
    const empty: MonteCarloReport = {
      simulations: 0,
      startingEquity,
      tradeCount: 0,
      curves: [],
      p5Final: startingEquity,
      p10Final: startingEquity,
      p25Final: startingEquity,
      p50Final: startingEquity,
      p75Final: startingEquity,
      p90Final: startingEquity,
      p95Final: startingEquity,
      ci95Low: startingEquity,
      ci95High: startingEquity,
      p10ReturnPct: 0,
      p50ReturnPct: 0,
      p90ReturnPct: 0,
      ruinProbabilityPct: 0,
      profitProbabilityPct: 0,
      medianMaxDrawdownPct: 0,
    };
    return empty;
  }

  // Extract per-trade fractional returns (pnlPct already as %)
  const tradeReturns = trades.map((t) => t.pnlPct / 100);
  const n = tradeReturns.length;

  // Run simulations: each is a shuffled sequence of trade returns
  // Store all final equities and equity paths
  const allPaths: number[][] = [];
  const allFinalEquities: number[] = [];
  const allMaxDrawdowns: number[] = [];

  for (let sim = 0; sim < simulations; sim++) {
    const shuffled = shuffle(tradeReturns, rng);
    let equity = startingEquity;
    const path: number[] = [equity];

    for (const r of shuffled) {
      equity = equity * (1 + r);
      path.push(equity);
    }

    allPaths.push(path);
    allFinalEquities.push(equity);
    allMaxDrawdowns.push(maxDrawdown(path));
  }

  // Sort final equities for percentile calculation
  const sortedFinals = [...allFinalEquities].sort((a, b) => a - b);

  const p5Final = percentile(sortedFinals, 5);
  const p10Final = percentile(sortedFinals, 10);
  const p25Final = percentile(sortedFinals, 25);
  const p50Final = percentile(sortedFinals, 50);
  const p75Final = percentile(sortedFinals, 75);
  const p90Final = percentile(sortedFinals, 90);
  const p95Final = percentile(sortedFinals, 95);

  // Build percentile equity curves (p10, p50, p90) at each trade step
  // At each step t, collect the t-th value from all paths and take the percentile
  const curves: PercentileCurve[] = [10, 50, 90].map((pct) => {
    const equity: number[] = [];
    for (let t = 0; t <= n; t++) {
      const vals = allPaths.map((path) => path[t] ?? path[path.length - 1]).sort((a, b) => a - b);
      equity.push(percentile(vals, pct));
    }
    return { percentile: pct, equity };
  });

  // Probability of ruin: final equity < 50% of starting
  const ruinCount = allFinalEquities.filter((e) => e < startingEquity * 0.5).length;
  const ruinProbabilityPct = (ruinCount / simulations) * 100;

  // Probability of profit
  const profitCount = allFinalEquities.filter((e) => e > startingEquity).length;
  const profitProbabilityPct = (profitCount / simulations) * 100;

  // Median max drawdown
  const sortedDDs = [...allMaxDrawdowns].sort((a, b) => a - b);
  const medianMaxDrawdownPct = percentile(sortedDDs, 50);

  return {
    simulations,
    startingEquity,
    tradeCount: n,
    curves,
    p5Final: Math.round(p5Final),
    p10Final: Math.round(p10Final),
    p25Final: Math.round(p25Final),
    p50Final: Math.round(p50Final),
    p75Final: Math.round(p75Final),
    p90Final: Math.round(p90Final),
    p95Final: Math.round(p95Final),
    ci95Low: Math.round(p5Final),
    ci95High: Math.round(p95Final),
    p10ReturnPct: Math.round(((p10Final - startingEquity) / startingEquity) * 10000) / 100,
    p50ReturnPct: Math.round(((p50Final - startingEquity) / startingEquity) * 10000) / 100,
    p90ReturnPct: Math.round(((p90Final - startingEquity) / startingEquity) * 10000) / 100,
    ruinProbabilityPct: Math.round(ruinProbabilityPct * 10) / 10,
    profitProbabilityPct: Math.round(profitProbabilityPct * 10) / 10,
    medianMaxDrawdownPct: Math.round(medianMaxDrawdownPct * 10) / 10,
  };
}
