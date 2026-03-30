// Portfolio-level backtesting: run the same strategy across multiple tickers simultaneously,
// combine equity curves into a portfolio curve, and compute a strategy correlation matrix.

import { runSimpleBacktest, type SimpleBacktestResult } from "./simple-engine";
import { BACKTEST_STRATEGIES, type StrategyId } from "./strategies";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TickerResult {
  ticker: string;
  result: SimpleBacktestResult;
  /** Equal-weighted allocation fraction */
  weight: number;
  /** Contribution to portfolio equity curve */
  portfolioEquity: { bar: number; equity: number }[];
}

export interface PortfolioBacktestResult {
  strategyId: StrategyId;
  tickers: string[];
  tickerResults: TickerResult[];
  /** Combined equal-weighted portfolio equity curve */
  portfolioCurve: { bar: number; equity: number }[];
  portfolioTotalReturn: number;
  portfolioSharpe: number;
  portfolioMaxDrawdown: number;
  /** Starting capital per ticker (total / n) */
  capitalPerTicker: number;
  totalCapital: number;
  bars: number;
}

export interface CorrelationEntry {
  tickerA: string;
  tickerB: string;
  correlation: number;
}

export interface StrategyCorrelationMatrix {
  /** Correlation matrix: strategies vs strategies */
  strategies: string[];
  strategyNames: string[];
  /** All pairwise correlations */
  entries: CorrelationEntry[];
  /** Matrix[i][j] = correlation between strategies[i] and strategies[j] */
  matrix: number[][];
  ticker: string;
  bars: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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
  return std > 0 ? Math.round(((avg / std) * Math.sqrt(252)) * 100) / 100 : 0;
}

function computeMaxDrawdown(equity: { bar: number; equity: number }[]): number {
  let peak = equity[0]?.equity ?? 0;
  let maxDD = 0;
  for (const e of equity) {
    if (e.equity > peak) peak = e.equity;
    const dd = peak > 0 ? ((peak - e.equity) / peak) * 100 : 0;
    if (dd > maxDD) maxDD = dd;
  }
  return Math.round(maxDD * 100) / 100;
}

/**
 * Compute Pearson correlation between two equal-length numeric arrays.
 */
function pearsonCorrelation(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 2) return 0;

  let sumA = 0, sumB = 0, sumAB = 0, sumA2 = 0, sumB2 = 0;
  for (let i = 0; i < n; i++) {
    sumA += a[i];
    sumB += b[i];
    sumAB += a[i] * b[i];
    sumA2 += a[i] * a[i];
    sumB2 += b[i] * b[i];
  }

  const num = n * sumAB - sumA * sumB;
  const denA = Math.sqrt(n * sumA2 - sumA * sumA);
  const denB = Math.sqrt(n * sumB2 - sumB * sumB);
  const den = denA * denB;

  if (den === 0) return 0;
  return Math.round((num / den) * 1000) / 1000;
}

/**
 * Extract daily returns from an equity curve, aligned by bar index.
 */
function extractDailyReturns(
  equity: { bar: number; equity: number }[],
  totalBars: number,
): number[] {
  // Build bar-indexed map
  const map = new Map<number, number>();
  for (const e of equity) map.set(e.bar, e.equity);

  // Fill gaps by forward-filling
  const series: number[] = new Array(totalBars).fill(0);
  let lastEquity = 10000;
  for (let i = 0; i < totalBars; i++) {
    if (map.has(i)) lastEquity = map.get(i)!;
    series[i] = lastEquity;
  }

  // Convert to returns
  const returns: number[] = new Array(totalBars - 1).fill(0);
  for (let i = 1; i < totalBars; i++) {
    const prev = series[i - 1];
    returns[i - 1] = prev > 0 ? (series[i] - prev) / prev : 0;
  }
  return returns;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Run the same strategy across all provided tickers and combine into a portfolio.
 * Uses equal weighting. Each ticker starts with (totalCapital / n).
 */
export function runPortfolioBacktest(
  strategyId: StrategyId,
  tickers: string[],
  params: Record<string, number>,
  bars: number = 252,
  totalCapital: number = 100000,
): PortfolioBacktestResult {
  const n = tickers.length;
  const capitalPerTicker = totalCapital / n;
  const weight = 1 / n;

  const tickerResults: TickerResult[] = tickers.map((ticker) => {
    const result = runSimpleBacktest(strategyId, ticker, params, bars);

    // Scale the equity curve from $10k base to the per-ticker allocation
    const scaleFactor = capitalPerTicker / 10000;
    const portfolioEquity = result.equityCurve.map((e) => ({
      bar: e.bar,
      equity: Math.round(e.equity * scaleFactor),
    }));

    return { ticker, result, weight, portfolioEquity };
  });

  // Combine equity curves into portfolio curve
  // At each bar, sum all tickers' equity
  const barSet = new Set<number>();
  for (const tr of tickerResults) {
    for (const e of tr.portfolioEquity) barSet.add(e.bar);
  }
  const allBars = Array.from(barSet).sort((a, b) => a - b);

  // Build forward-filled maps per ticker
  const filledMaps = tickerResults.map((tr) => {
    const map = new Map<number, number>();
    for (const e of tr.portfolioEquity) map.set(e.bar, e.equity);
    return map;
  });

  const portfolioCurve: { bar: number; equity: number }[] = [];
  const lastEquities = tickerResults.map((tr) => capitalPerTicker);

  for (const bar of allBars) {
    let total = 0;
    for (let i = 0; i < tickerResults.length; i++) {
      const val = filledMaps[i].get(bar);
      if (val !== undefined) lastEquities[i] = val;
      total += lastEquities[i];
    }
    portfolioCurve.push({ bar, equity: Math.round(total) });
  }

  const startEquity = portfolioCurve[0]?.equity ?? totalCapital;
  const endEquity = portfolioCurve[portfolioCurve.length - 1]?.equity ?? totalCapital;
  const portfolioTotalReturn = startEquity > 0 ? ((endEquity - startEquity) / startEquity) * 100 : 0;
  const portfolioSharpe = computeSharpe(portfolioCurve);
  const portfolioMaxDrawdown = computeMaxDrawdown(portfolioCurve);

  return {
    strategyId,
    tickers,
    tickerResults,
    portfolioCurve,
    portfolioTotalReturn: Math.round(portfolioTotalReturn * 100) / 100,
    portfolioSharpe,
    portfolioMaxDrawdown,
    capitalPerTicker: Math.round(capitalPerTicker),
    totalCapital,
    bars,
  };
}

/**
 * Compute the correlation matrix of daily returns for all 10 strategies on a single ticker.
 * Low correlation between strategies = good diversification.
 */
export function computeStrategyCorrelationMatrix(
  ticker: string,
  bars: number = 252,
): StrategyCorrelationMatrix {
  // Run all strategies and collect return series
  const strategyReturns: { id: string; name: string; returns: number[] }[] =
    BACKTEST_STRATEGIES.map((s) => {
      const result = runSimpleBacktest(s.id, ticker, s.defaultParams, bars);
      return {
        id: s.id,
        name: s.name,
        returns: extractDailyReturns(result.equityCurve, bars),
      };
    });

  const n = strategyReturns.length;
  const matrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  const entries: CorrelationEntry[] = [];

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1;
      } else if (j > i) {
        const corr = pearsonCorrelation(strategyReturns[i].returns, strategyReturns[j].returns);
        matrix[i][j] = corr;
        matrix[j][i] = corr;
        entries.push({
          tickerA: strategyReturns[i].id,
          tickerB: strategyReturns[j].id,
          correlation: corr,
        });
      }
    }
  }

  return {
    strategies: strategyReturns.map((s) => s.id),
    strategyNames: strategyReturns.map((s) => s.name),
    entries,
    matrix,
    ticker,
    bars,
  };
}
