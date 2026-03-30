// Walk-Forward Optimization for the simple backtesting engine.
// Splits a price series into in-sample (IS) and out-of-sample (OOS) windows,
// tests multiple SMA periods on IS data, picks the best, and reports OOS performance.
// This reveals overfitting: if IS Sharpe >> OOS Sharpe, the strategy is curve-fitted.

import { runSimpleBacktest } from "./simple-engine";
import type { StrategyId } from "./strategies";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface WalkForwardFold {
  /** Window number, 0-indexed */
  foldIndex: number;
  /** Start bar of the IS window */
  isStart: number;
  /** End bar of the IS window (exclusive) */
  isEnd: number;
  /** Start bar of the OOS window */
  oosStart: number;
  /** End bar of the OOS window (exclusive) */
  oosEnd: number;
  /** Best SMA period chosen from IS optimization */
  bestPeriod: number;
  /** All IS results keyed by period, for reporting */
  isResults: { period: number; sharpe: number; totalReturn: number; trades: number }[];
  /** IS metrics with the best period */
  isSharpe: number;
  isReturn: number;
  isTrades: number;
  /** OOS metrics with the best period */
  oosSharpe: number;
  oosReturn: number;
  oosTrades: number;
  /** Degradation: (IS Sharpe - OOS Sharpe) / |IS Sharpe|, clamped to [-2, 2] */
  degradationPct: number;
}

export interface WalkForwardReport {
  strategyId: StrategyId;
  ticker: string;
  totalBars: number;
  isFraction: number;
  oosFraction: number;
  testedPeriods: number[];
  folds: WalkForwardFold[];
  /** Average IS Sharpe across folds */
  avgIsSharpe: number;
  /** Average OOS Sharpe across folds */
  avgOosSharpe: number;
  /** Average IS return across folds */
  avgIsReturn: number;
  /** Average OOS return across folds */
  avgOosReturn: number;
  /** Average degradation % across folds */
  avgDegradationPct: number;
  /** Fraction of folds where OOS Sharpe >= IS Sharpe * 0.5 (robustness score 0-100) */
  robustnessScore: number;
  /** Verdict text */
  verdict: string;
}

// ── Implementation ────────────────────────────────────────────────────────────

// Mulberry32 PRNG — same implementation used in simple-engine.ts
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generate the same synthetic price series that simple-engine uses for a given ticker + strategyId
function generatePrices(ticker: string, strategyId: string, bars: number): number[] {
  const rng = mulberry32(ticker.charCodeAt(0) * 1000 + strategyId.length * 37);
  const prices: number[] = [100];
  for (let i = 1; i < bars; i++) {
    const change = (rng() - 0.49) * 0.025;
    prices.push(prices[i - 1] * (1 + change));
  }
  return prices;
}

// SMA helper
function sma(arr: number[], period: number, i: number): number {
  if (i < period - 1) return arr[i];
  let sum = 0;
  for (let k = i - period + 1; k <= i; k++) sum += arr[k];
  return sum / period;
}

// Compute Sharpe from an equity curve
function computeSharpe(equity: { bar: number; equity: number }[]): number {
  if (equity.length < 2) return 0;
  const returns: number[] = [];
  for (let i = 1; i < equity.length; i++) {
    const prev = equity[i - 1].equity;
    if (prev > 0) returns.push((equity[i].equity - prev) / prev);
  }
  if (returns.length === 0) return 0;
  const avg = returns.reduce((s, v) => s + v, 0) / returns.length;
  const variance = returns.reduce((s, v) => s + (v - avg) ** 2, 0) / returns.length;
  const std = Math.sqrt(variance);
  return std > 0 ? (avg / std) * Math.sqrt(252) : 0;
}

/**
 * Run a single SMA crossover backtest on a price slice using the given fast period.
 * The slow period is always fast * 2.5 (rounded), which is a reasonable ratio.
 * Returns { sharpe, totalReturn, trades }.
 */
function runSmaOnSlice(
  priceSlice: number[],
  fastPeriod: number,
): { sharpe: number; totalReturn: number; trades: number } {
  const slowPeriod = Math.round(fastPeriod * 2.5);
  const bars = priceSlice.length;

  let cash = 10000;
  let position: { entry: number; bar: number } | null = null;
  const equity: { bar: number; equity: number }[] = [{ bar: 0, equity: 10000 }];
  let tradeCount = 0;

  for (let i = Math.max(slowPeriod, 20); i < bars; i++) {
    const price = priceSlice[i];
    const fast = sma(priceSlice, fastPeriod, i);
    const fastPrev = sma(priceSlice, fastPeriod, i - 1);
    const slow = sma(priceSlice, slowPeriod, i);
    const slowPrev = sma(priceSlice, slowPeriod, i - 1);

    const shouldBuy = fastPrev < slowPrev && fast > slow;
    const shouldSell = fastPrev > slowPrev && fast < slow;

    if (shouldBuy && !position) {
      position = { entry: price, bar: i };
    } else if (shouldSell && position) {
      const pnlPct = ((price - position.entry) / position.entry) * 100;
      cash *= 1 + pnlPct / 100;
      position = null;
      tradeCount++;
    }

    equity.push({ bar: i, equity: Math.round(cash) });
  }

  // Close open position
  if (position) {
    const price = priceSlice[bars - 1];
    const pnlPct = ((price - position.entry) / position.entry) * 100;
    cash *= 1 + pnlPct / 100;
    equity[equity.length - 1] = { bar: bars - 1, equity: Math.round(cash) };
    tradeCount++;
  }

  const totalReturn = ((cash - 10000) / 10000) * 100;
  const sharpe = computeSharpe(equity);

  return {
    sharpe: Math.round(sharpe * 100) / 100,
    totalReturn: Math.round(totalReturn * 100) / 100,
    trades: tradeCount,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Run walk-forward optimization for SMA Crossover strategy.
 *
 * @param ticker    Ticker symbol (used to generate synthetic price data)
 * @param bars      Total number of bars to simulate (default 504 = ~2 years)
 * @param isFraction  Fraction of each window used for IS optimization (default 0.7)
 * @param testedPeriods  Fast SMA periods to test on IS data (default [10, 20, 50])
 * @param foldCount  Number of rolling windows (default 3)
 */
export function runWalkForwardOptimization(
  ticker: string,
  bars: number = 504,
  isFraction: number = 0.7,
  testedPeriods: number[] = [10, 20, 50],
  foldCount: number = 3,
): WalkForwardReport {
  const strategyId: StrategyId = "sma_crossover";
  const prices = generatePrices(ticker, strategyId, bars);

  // Window size: divide total bars evenly across folds + IS overhead
  // Each fold is (bars / foldCount) wide; IS is 70%, OOS is 30% of each fold
  const foldSize = Math.floor(bars / (foldCount + 0.5));
  const isSize = Math.floor(foldSize * isFraction);
  const oosSize = foldSize - isSize;

  const folds: WalkForwardFold[] = [];

  for (let f = 0; f < foldCount; f++) {
    const isStart = f * oosSize;
    const isEnd = isStart + isSize;
    const oosStart = isEnd;
    const oosEnd = Math.min(oosStart + oosSize, bars);

    if (oosEnd <= oosStart || isEnd > bars) break;

    const isSlice = prices.slice(isStart, isEnd);
    const oosSlice = prices.slice(oosStart, oosEnd);

    // Test all periods on IS data
    const isResults = testedPeriods.map((period) => {
      const r = runSmaOnSlice(isSlice, period);
      return { period, ...r };
    });

    // Pick best by IS Sharpe
    const best = isResults.reduce(
      (best, r) => (r.sharpe > best.sharpe ? r : best),
      isResults[0],
    );

    // Run OOS with the best period
    const oosResult = runSmaOnSlice(oosSlice, best.period);

    const isSharpe = best.sharpe;
    const oosSharpe = oosResult.sharpe;
    const degradationPct =
      Math.abs(isSharpe) > 0.01
        ? Math.max(-200, Math.min(200, ((isSharpe - oosSharpe) / Math.abs(isSharpe)) * 100))
        : 0;

    folds.push({
      foldIndex: f,
      isStart,
      isEnd,
      oosStart,
      oosEnd,
      bestPeriod: best.period,
      isResults,
      isSharpe,
      isReturn: best.totalReturn,
      isTrades: best.trades,
      oosSharpe,
      oosReturn: oosResult.totalReturn,
      oosTrades: oosResult.trades,
      degradationPct: Math.round(degradationPct * 10) / 10,
    });
  }

  if (folds.length === 0) {
    return {
      strategyId,
      ticker,
      totalBars: bars,
      isFraction,
      oosFraction: 1 - isFraction,
      testedPeriods,
      folds: [],
      avgIsSharpe: 0,
      avgOosSharpe: 0,
      avgIsReturn: 0,
      avgOosReturn: 0,
      avgDegradationPct: 0,
      robustnessScore: 0,
      verdict: "Insufficient data for walk-forward analysis.",
    };
  }

  const avgIsSharpe = folds.reduce((s, f) => s + f.isSharpe, 0) / folds.length;
  const avgOosSharpe = folds.reduce((s, f) => s + f.oosSharpe, 0) / folds.length;
  const avgIsReturn = folds.reduce((s, f) => s + f.isReturn, 0) / folds.length;
  const avgOosReturn = folds.reduce((s, f) => s + f.oosReturn, 0) / folds.length;
  const avgDegradationPct = folds.reduce((s, f) => s + f.degradationPct, 0) / folds.length;

  // Robustness: fraction of folds where OOS Sharpe >= 50% of IS Sharpe
  const robustFolds = folds.filter((f) => f.oosSharpe >= f.isSharpe * 0.5).length;
  const robustnessScore = Math.round((robustFolds / folds.length) * 100);

  // Verdict
  let verdict: string;
  if (avgDegradationPct < 20 && avgOosSharpe > 0.3) {
    verdict = "Strategy shows good out-of-sample robustness. Low degradation suggests genuine edge.";
  } else if (avgDegradationPct < 50 && avgOosSharpe > 0) {
    verdict =
      "Moderate IS-to-OOS degradation. Strategy has some edge but may be partially curve-fitted.";
  } else if (avgOosSharpe > 0) {
    verdict =
      "High IS-to-OOS degradation. Strategy likely overfits the in-sample period. Use caution.";
  } else {
    verdict =
      "OOS performance is negative. Strategy appears curve-fitted with no genuine out-of-sample edge.";
  }

  return {
    strategyId,
    ticker,
    totalBars: bars,
    isFraction,
    oosFraction: 1 - isFraction,
    testedPeriods,
    folds,
    avgIsSharpe: Math.round(avgIsSharpe * 100) / 100,
    avgOosSharpe: Math.round(avgOosSharpe * 100) / 100,
    avgIsReturn: Math.round(avgIsReturn * 100) / 100,
    avgOosReturn: Math.round(avgOosReturn * 100) / 100,
    avgDegradationPct: Math.round(avgDegradationPct * 10) / 10,
    robustnessScore,
    verdict,
  };
}
