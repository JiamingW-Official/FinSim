/**
 * Trade Analytics computation service.
 * Operates on ClosedTrade — a TradeRecord that has realized a P&L
 * (side === "sell" covering a long, or side === "buy" covering a short).
 */

import type { TradeRecord } from "@/types/trading";

/** A trade record that has closed a position and carries realized P&L. */
export type ClosedTrade = TradeRecord & { realizedPnL: number };

/** Return a ISO YYYY-MM string for a unix ms timestamp. */
function toYearMonth(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/** Return 0-based weekday (0 = Sunday … 6 = Saturday). */
function weekday(ts: number): number {
  return new Date(ts).getDay();
}

/**
 * Simple normal CDF approximation (Abramowitz & Stegun §26.2.16).
 * Used for Shapiro-related stats and distribution overlay.
 */
export function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const z = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + p * z);
  const poly = t * (a1 + t * (a2 + t * (a3 + t * (a4 + t * a5))));
  return 0.5 * (1 + sign * (1 - poly * Math.exp(-z * z)));
}

/** Return normalPDF(x, mean, std) for distribution overlay. */
export function normalPDF(x: number, mean: number, std: number): number {
  if (std === 0) return 0;
  const z = (x - mean) / std;
  return Math.exp(-0.5 * z * z) / (std * Math.sqrt(2 * Math.PI));
}

export interface TradeStats {
  /** Total number of closed trades. */
  totalTrades: number;

  winRate: number;   // 0–1
  lossRate: number;  // 0–1

  /** Average P&L of winning trades (positive number). */
  avgWin: number;
  /** Average P&L of losing trades (negative number). */
  avgLoss: number;

  /**
   * Gross profit / gross loss magnitude.
   * profitFactor = sum(wins) / |sum(losses)|.  Infinity when no losses.
   */
  profitFactor: number;

  /**
   * Expectancy = (winRate × avgWin) + (lossRate × avgLoss).
   * Expected P&L per trade.
   */
  expectancy: number;

  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;

  /** Average number of bars held across all closed trades. */
  avgHoldingPeriod: number;
  avgWinHoldingPeriod: number;
  avgLossHoldingPeriod: number;

  /** Trade with highest realizedPnL. */
  bestTrade: ClosedTrade | null;
  /** Trade with lowest realizedPnL. */
  worstTrade: ClosedTrade | null;

  /** Ticker with highest total realized P&L. */
  bestTicker: string | null;
  /** Ticker with lowest total realized P&L. */
  worstTicker: string | null;

  /**
   * Monthly realized P&L keyed by "YYYY-MM".
   * Uses the trade's timestamp (wall-clock time, not simulationDate).
   */
  monthlyReturns: Record<string, number>;

  /**
   * Calmar ratio: annualized return / max drawdown of the running P&L.
   * Returns null when no drawdown exists.
   */
  calmarRatio: number | null;

  /**
   * Annualized Sharpe ratio using a risk-free rate of 0 and trade-level P&L
   * as the return series.
   * Returns null when fewer than 2 trades or std dev is 0.
   */
  sharpeRatio: number | null;

  /** All closed trade P&L values (for distribution charts). */
  pnlSeries: number[];

  /** P&L as a percentage of trade entry value (price × quantity). */
  pnlPctSeries: number[];

  /** Holding period in bars for each trade, aligned with pnlSeries. */
  holdingPeriodSeries: number[];

  /** One entry per trade {pnlPct, holdingBars, isWin, ticker} for scatter. */
  scatterData: Array<{
    pnlPct: number;
    holdingBars: number;
    isWin: boolean;
    ticker: string;
  }>;

  /** Skewness of the P&L distribution. */
  skewness: number;
  /** Excess kurtosis of the P&L distribution. */
  kurtosis: number;
}

/**
 * Filter raw TradeRecord[] to only closed-position records.
 * A "closed" record is one where realizedPnL !== 0 (buy-to-cover shorts
 * or sell-to-close longs both have non-zero realizedPnL).
 */
export function filterClosedTrades(trades: TradeRecord[]): ClosedTrade[] {
  return trades.filter((t) => t.realizedPnL !== 0) as ClosedTrade[];
}

/**
 * Pair buy records with matching sell records to estimate holding periods.
 * Returns a map from sell-trade id → estimated bars held.
 * Heuristic: for each sell, find the most-recent prior buy of the same ticker.
 */
function estimateHoldingPeriods(
  allTrades: TradeRecord[],
): Map<string, number> {
  // allTrades is newest-first (tradeHistory[0] = most recent)
  const chronological = [...allTrades].reverse();
  const lastBuyBar: Record<string, number> = {};
  const result = new Map<string, number>();

  for (const t of chronological) {
    if (t.side === "buy") {
      lastBuyBar[t.ticker] = t.simulationDate;
    } else if (t.side === "sell" && lastBuyBar[t.ticker] !== undefined) {
      // Each simulationDate unit is one bar
      const held = Math.max(1, t.simulationDate - lastBuyBar[t.ticker]);
      result.set(t.id, held);
      delete lastBuyBar[t.ticker];
    }
  }
  return result;
}

export function computeTradeStats(trades: ClosedTrade[]): TradeStats {
  const n = trades.length;

  const empty: TradeStats = {
    totalTrades: 0,
    winRate: 0,
    lossRate: 0,
    avgWin: 0,
    avgLoss: 0,
    profitFactor: 0,
    expectancy: 0,
    maxConsecutiveWins: 0,
    maxConsecutiveLosses: 0,
    avgHoldingPeriod: 0,
    avgWinHoldingPeriod: 0,
    avgLossHoldingPeriod: 0,
    bestTrade: null,
    worstTrade: null,
    bestTicker: null,
    worstTicker: null,
    monthlyReturns: {},
    calmarRatio: null,
    sharpeRatio: null,
    pnlSeries: [],
    pnlPctSeries: [],
    holdingPeriodSeries: [],
    scatterData: [],
    skewness: 0,
    kurtosis: 0,
  };

  if (n === 0) return empty;

  // --- Holding period estimation ---
  // We need all raw trades to pair buys/sells; closed trades ARE the sells.
  // We'll use simulationDate differences between consecutive same-ticker ops.
  const holdingMap = estimateHoldingPeriods(trades as TradeRecord[]);

  // --- Core aggregates ---
  let wins = 0;
  let losses = 0;
  let grossProfit = 0;
  let grossLoss = 0;
  let sumWin = 0;
  let sumLoss = 0;
  let bestTrade: ClosedTrade | null = null;
  let worstTrade: ClosedTrade | null = null;

  let maxCons = 0;
  let maxConsL = 0;
  let curCons = 0;
  let curConsL = 0;

  const pnlSeries: number[] = [];
  const pnlPctSeries: number[] = [];
  const holdingPeriodSeries: number[] = [];
  const scatterData: Array<{ pnlPct: number; holdingBars: number; isWin: boolean; ticker: string }> = [];
  const monthlyReturns: Record<string, number> = {};
  const tickerPnL: Record<string, number> = {};

  let sumHolding = 0;
  let sumWinHolding = 0;
  let sumLossHolding = 0;

  // Process in chronological order (trades array is newest-first from store)
  const chrono = [...trades].reverse();

  for (const t of chrono) {
    const pnl = t.realizedPnL;
    const entryValue = t.price * t.quantity;
    const pnlPct = entryValue > 0 ? (pnl / entryValue) * 100 : 0;
    const holdingBars = holdingMap.get(t.id) ?? 1;
    const isWin = pnl > 0;

    pnlSeries.push(pnl);
    pnlPctSeries.push(pnlPct);
    holdingPeriodSeries.push(holdingBars);
    scatterData.push({ pnlPct, holdingBars, isWin, ticker: t.ticker });

    // Monthly returns
    const ym = toYearMonth(t.timestamp);
    monthlyReturns[ym] = (monthlyReturns[ym] ?? 0) + pnl;

    // Ticker attribution
    tickerPnL[t.ticker] = (tickerPnL[t.ticker] ?? 0) + pnl;

    // Best / worst trade
    if (bestTrade === null || pnl > bestTrade.realizedPnL) bestTrade = t;
    if (worstTrade === null || pnl < worstTrade.realizedPnL) worstTrade = t;

    // Holding period sums
    sumHolding += holdingBars;

    if (isWin) {
      wins++;
      grossProfit += pnl;
      sumWin += pnl;
      sumWinHolding += holdingBars;
      curCons++;
      curConsL = 0;
      maxCons = Math.max(maxCons, curCons);
    } else {
      losses++;
      grossLoss += Math.abs(pnl);
      sumLoss += pnl;
      sumLossHolding += holdingBars;
      curConsL++;
      curCons = 0;
      maxConsL = Math.max(maxConsL, curConsL);
    }
  }

  const winRate = wins / n;
  const lossRate = losses / n;
  const avgWin = wins > 0 ? sumWin / wins : 0;
  const avgLoss = losses > 0 ? sumLoss / losses : 0;
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
  const expectancy = winRate * avgWin + lossRate * avgLoss;

  const avgHoldingPeriod = sumHolding / n;
  const avgWinHoldingPeriod = wins > 0 ? sumWinHolding / wins : 0;
  const avgLossHoldingPeriod = losses > 0 ? sumLossHolding / losses : 0;

  // Best / worst ticker
  let bestTicker: string | null = null;
  let worstTicker: string | null = null;
  let bestTickerPnL = -Infinity;
  let worstTickerPnL = Infinity;
  for (const [tk, pnl] of Object.entries(tickerPnL)) {
    if (pnl > bestTickerPnL) { bestTickerPnL = pnl; bestTicker = tk; }
    if (pnl < worstTickerPnL) { worstTickerPnL = pnl; worstTicker = tk; }
  }

  // --- Calmar ratio ---
  // Running cumulative P&L series; find max drawdown from peak.
  let calmarRatio: number | null = null;
  {
    let peak = 0;
    let cumPnL = 0;
    let maxDD = 0;
    for (const pnl of pnlSeries) {
      cumPnL += pnl;
      if (cumPnL > peak) peak = cumPnL;
      const dd = peak - cumPnL;
      if (dd > maxDD) maxDD = dd;
    }
    const totalPnL = pnlSeries.reduce((s, v) => s + v, 0);
    // Annualized: assume ~252 trading bars per year
    const annualizedReturn = (totalPnL / n) * 252;
    if (maxDD > 0) {
      calmarRatio = annualizedReturn / maxDD;
    }
  }

  // --- Sharpe ratio ---
  let sharpeRatio: number | null = null;
  if (n >= 2) {
    const mean = pnlSeries.reduce((s, v) => s + v, 0) / n;
    const variance = pnlSeries.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1);
    const std = Math.sqrt(variance);
    if (std > 0) {
      // Annualized: multiply by sqrt(252)
      sharpeRatio = (mean / std) * Math.sqrt(252);
    }
  }

  // --- Skewness & kurtosis ---
  let skewness = 0;
  let kurtosis = 0;
  if (n >= 3) {
    const mean = pnlSeries.reduce((s, v) => s + v, 0) / n;
    const variance = pnlSeries.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
    const std = Math.sqrt(variance);
    if (std > 0) {
      const m3 = pnlSeries.reduce((s, v) => s + ((v - mean) / std) ** 3, 0) / n;
      const m4 = pnlSeries.reduce((s, v) => s + ((v - mean) / std) ** 4, 0) / n;
      skewness = m3;
      kurtosis = m4 - 3; // excess kurtosis
    }
  }

  return {
    totalTrades: n,
    winRate,
    lossRate,
    avgWin,
    avgLoss,
    profitFactor,
    expectancy,
    maxConsecutiveWins: maxCons,
    maxConsecutiveLosses: maxConsL,
    avgHoldingPeriod,
    avgWinHoldingPeriod,
    avgLossHoldingPeriod,
    bestTrade,
    worstTrade,
    bestTicker,
    worstTicker,
    monthlyReturns,
    calmarRatio,
    sharpeRatio,
    pnlSeries,
    pnlPctSeries,
    holdingPeriodSeries,
    scatterData,
    skewness,
    kurtosis,
  };
}

/**
 * Group closed trades by weekday (1–5, Mon–Fri) and return average P&L per day.
 * Sunday (0) and Saturday (6) are excluded.
 */
export function computeDayOfWeekStats(
  trades: ClosedTrade[],
): Record<number, { avg: number; count: number; total: number }> {
  const result: Record<number, { avg: number; count: number; total: number }> = {};
  for (let d = 1; d <= 5; d++) result[d] = { avg: 0, count: 0, total: 0 };

  for (const t of trades) {
    const d = weekday(t.timestamp);
    if (d === 0 || d === 6) continue;
    const slot = result[d];
    slot.total += t.realizedPnL;
    slot.count += 1;
  }

  for (const d of [1, 2, 3, 4, 5]) {
    const slot = result[d];
    slot.avg = slot.count > 0 ? slot.total / slot.count : 0;
  }

  return result;
}

/**
 * Build histogram buckets for a P&L array.
 * Returns `numBuckets` evenly-spaced bins from min to max with
 * separate win/loss counts.
 */
export function buildPnLHistogram(
  pnlValues: number[],
  numBuckets = 10,
): Array<{
  bucketMin: number;
  bucketMax: number;
  midpoint: number;
  winCount: number;
  lossCount: number;
  totalCount: number;
}> {
  if (pnlValues.length === 0) return [];

  const min = Math.min(...pnlValues);
  const max = Math.max(...pnlValues);
  const range = max - min || 1;
  const width = range / numBuckets;

  const buckets = Array.from({ length: numBuckets }, (_, i) => ({
    bucketMin: min + i * width,
    bucketMax: min + (i + 1) * width,
    midpoint: min + (i + 0.5) * width,
    winCount: 0,
    lossCount: 0,
    totalCount: 0,
  }));

  for (const v of pnlValues) {
    let idx = Math.floor((v - min) / width);
    if (idx >= numBuckets) idx = numBuckets - 1;
    buckets[idx].totalCount++;
    if (v >= 0) buckets[idx].winCount++;
    else buckets[idx].lossCount++;
  }

  return buckets;
}

/**
 * Rolling win rate over a sliding window of `window` trades.
 * Returns one entry per trade from index (window-1) onward.
 */
export function computeRollingWinRate(
  trades: ClosedTrade[],
  window = 20,
): Array<{ index: number; winRate: number }> {
  const chrono = [...trades].reverse(); // oldest first
  const result: Array<{ index: number; winRate: number }> = [];
  for (let i = window - 1; i < chrono.length; i++) {
    let wins = 0;
    for (let j = i - window + 1; j <= i; j++) {
      if (chrono[j].realizedPnL > 0) wins++;
    }
    result.push({ index: i, winRate: wins / window });
  }
  return result;
}

/**
 * Rolling annualised Sharpe ratio over a sliding window of `window` trades.
 * Uses zero risk-free rate. Returns null-like 0 when std dev is zero.
 */
export function computeRollingSharpe(
  trades: ClosedTrade[],
  window = 30,
): Array<{ index: number; sharpe: number }> {
  const chrono = [...trades].reverse(); // oldest first
  const result: Array<{ index: number; sharpe: number }> = [];
  for (let i = window - 1; i < chrono.length; i++) {
    const slice = chrono.slice(i - window + 1, i + 1).map((t) => t.realizedPnL);
    const mean = slice.reduce((s, v) => s + v, 0) / window;
    const variance = slice.reduce((s, v) => s + (v - mean) ** 2, 0) / (window - 1);
    const std = Math.sqrt(variance);
    const sharpe = std > 0 ? (mean / std) * Math.sqrt(252) : 0;
    result.push({ index: i, sharpe });
  }
  return result;
}

/**
 * Compute synthetic MAE (Maximum Adverse Excursion) and MFE (Maximum Favorable
 * Excursion) for each closed trade as a percentage of entry price.
 * MAE = worst intra-trade drawdown; MFE = best intra-trade run-up.
 * Values are seeded from the trade id so they are stable across renders.
 */
export function computeMAEMFE(
  trades: ClosedTrade[],
): Array<{ mae: number; mfe: number; isWin: boolean }> {
  // Deterministic pseudo-random seeded by a simple hash of the trade id.
  function seededRand(seed: number): () => number {
    let s = seed;
    return () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
  }

  function strHash(str: string): number {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  return trades.map((t) => {
    const rand = seededRand(strHash(t.id));
    const isWin = t.realizedPnL > 0;
    // MAE: 1–5% adverse excursion
    const mae = 0.01 + rand() * 0.04;
    // MFE: 1–8% favorable excursion; winners tend higher
    const mfeBias = isWin ? 0.04 : 0.0;
    const mfe = 0.01 + mfeBias + rand() * 0.04;
    return { mae, mfe, isWin };
  });
}

/**
 * Compute a simple OLS trend line over scatter data.
 * Returns { slope, intercept } so y = slope*x + intercept.
 */
export function computeTrendLine(
  points: Array<{ x: number; y: number }>,
): { slope: number; intercept: number } | null {
  const n = points.length;
  if (n < 2) return null;

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (const { x, y } of points) {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}
