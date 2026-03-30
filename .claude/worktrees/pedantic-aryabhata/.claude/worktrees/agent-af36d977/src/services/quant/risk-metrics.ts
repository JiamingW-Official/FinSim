import type { TradeRecord } from "@/types/trading";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RiskMetrics {
  // Return metrics
  totalReturn: number;
  annualizedReturn: number;
  dailyMeanReturn: number;
  dailyStdDev: number;
  annualizedVolatility: number;

  // Risk-adjusted returns
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  informationRatio: number;

  // Drawdown metrics
  maxDrawdown: number;
  maxDrawdownDuration: number;
  currentDrawdown: number;

  // Risk metrics
  valueAtRisk95: number;
  valueAtRisk99: number;
  conditionalVaR95: number;
  beta: number;
  alpha: number;

  // Trade statistics
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  payoffRatio: number;
  expectancy: number;
  kellyFraction: number;

  // Distribution
  skewness: number;
  kurtosis: number;
}

export interface EquityPoint {
  timestamp: number;
  value: number;
}

export interface DrawdownPoint {
  timestamp: number;
  drawdown: number;
}

export interface RollingMetricPoint {
  timestamp: number;
  sharpe: number;
  volatility: number;
  drawdown: number;
}

// ─── Math Helpers ───────────────────────────────────────────────────────────

const TRADING_DAYS_PER_YEAR = 252;
const SQRT_252 = Math.sqrt(TRADING_DAYS_PER_YEAR);

/** Standard normal PDF: phi(x) = (1/sqrt(2pi)) * exp(-x^2/2) */
function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/** Standard normal CDF approximation (Abramowitz & Stegun 26.2.17) */
function normalCDF(x: number): number {
  if (x < -8) return 0;
  if (x > 8) return 1;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const t = 1 / (1 + p * Math.abs(x));
  const y =
    1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x / 2);
  return 0.5 * (1 + sign * y);
}

/** Inverse standard normal CDF (rational approximation, Beasley-Springer-Moro) */
function normalInvCDF(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p === 0.5) return 0;

  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.383577518672690e2, -3.066479806614716e1, 2.506628277459239e0,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838e0,
    -2.549732539343734e0, 4.374664141464968e0, 2.938163982698783e0,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996e0,
    3.754408661907416e0,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  let q: number, r: number;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return (
      -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
}

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < arr.length; i++) sum += arr[i];
  return sum / arr.length;
}

function stdDev(arr: number[], m?: number): number {
  if (arr.length < 2) return 0;
  const mu = m ?? mean(arr);
  let sumSq = 0;
  for (let i = 0; i < arr.length; i++) {
    const d = arr[i] - mu;
    sumSq += d * d;
  }
  return Math.sqrt(sumSq / (arr.length - 1)); // sample std dev
}

function downsideDev(arr: number[], threshold: number): number {
  if (arr.length < 2) return 0;
  let sumSq = 0;
  let count = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < threshold) {
      const d = arr[i] - threshold;
      sumSq += d * d;
      count++;
    }
  }
  return count > 0 ? Math.sqrt(sumSq / (arr.length - 1)) : 0;
}

// ─── Core Calculations ──────────────────────────────────────────────────────

function equityToReturns(equity: EquityPoint[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < equity.length; i++) {
    if (equity[i - 1].value !== 0) {
      returns.push((equity[i].value - equity[i - 1].value) / equity[i - 1].value);
    }
  }
  return returns;
}

/**
 * Calculate comprehensive risk metrics from equity history and trade records.
 *
 * @param equityHistory - Time series of portfolio values
 * @param trades - Completed trade records (sell-side trades with realizedPnL)
 * @param riskFreeRate - Annual risk-free rate (default 5%)
 */
export function calculateRiskMetrics(
  equityHistory: EquityPoint[],
  trades: TradeRecord[],
  riskFreeRate: number = 0.05,
): RiskMetrics {
  const defaults: RiskMetrics = {
    totalReturn: 0,
    annualizedReturn: 0,
    dailyMeanReturn: 0,
    dailyStdDev: 0,
    annualizedVolatility: 0,
    sharpeRatio: 0,
    sortinoRatio: 0,
    calmarRatio: 0,
    informationRatio: 0,
    maxDrawdown: 0,
    maxDrawdownDuration: 0,
    currentDrawdown: 0,
    valueAtRisk95: 0,
    valueAtRisk99: 0,
    conditionalVaR95: 0,
    beta: 1,
    alpha: 0,
    winRate: 0,
    profitFactor: 0,
    avgWin: 0,
    avgLoss: 0,
    payoffRatio: 0,
    expectancy: 0,
    kellyFraction: 0,
    skewness: 0,
    kurtosis: 0,
  };

  if (equityHistory.length < 2) return defaults;

  // ── Daily returns ─────────────────────────────────────────────────────
  const dailyReturns = equityToReturns(equityHistory);
  if (dailyReturns.length === 0) return defaults;

  const startValue = equityHistory[0].value;
  const endValue = equityHistory[equityHistory.length - 1].value;

  // ── Return metrics ────────────────────────────────────────────────────
  const totalReturn = startValue !== 0 ? (endValue - startValue) / startValue : 0;
  const nDays = dailyReturns.length;
  const years = nDays / TRADING_DAYS_PER_YEAR;

  // CAGR: (endValue/startValue)^(1/years) - 1
  const annualizedReturn =
    years > 0 && startValue > 0 && endValue > 0
      ? Math.pow(endValue / startValue, 1 / years) - 1
      : 0;

  const dailyMeanReturn = mean(dailyReturns);
  const dailyStd = stdDev(dailyReturns, dailyMeanReturn);
  const annualizedVolatility = dailyStd * SQRT_252;

  // ── Risk-free rate in daily terms ─────────────────────────────────────
  const dailyRf = Math.pow(1 + riskFreeRate, 1 / TRADING_DAYS_PER_YEAR) - 1;

  // ── Sharpe Ratio ──────────────────────────────────────────────────────
  // (annualizedReturn - riskFreeRate) / annualizedVolatility
  const sharpeRatio =
    annualizedVolatility !== 0
      ? (annualizedReturn - riskFreeRate) / annualizedVolatility
      : 0;

  // ── Sortino Ratio ─────────────────────────────────────────────────────
  // (annualizedReturn - riskFreeRate) / annualizedDownsideDev
  const dailyDownside = downsideDev(dailyReturns, dailyRf);
  const annualizedDownside = dailyDownside * SQRT_252;
  const sortinoRatio =
    annualizedDownside !== 0
      ? (annualizedReturn - riskFreeRate) / annualizedDownside
      : 0;

  // ── Drawdown series ───────────────────────────────────────────────────
  let peak = equityHistory[0].value;
  let maxDD = 0;
  let maxDDDuration = 0;
  let currentDDDuration = 0;
  let currentDD = 0;

  for (let i = 0; i < equityHistory.length; i++) {
    const v = equityHistory[i].value;
    if (v > peak) {
      peak = v;
      currentDDDuration = 0;
    }
    const dd = peak !== 0 ? (peak - v) / peak : 0;
    if (dd > maxDD) maxDD = dd;
    if (dd > 0) {
      currentDDDuration++;
      if (currentDDDuration > maxDDDuration) maxDDDuration = currentDDDuration;
    }
    if (i === equityHistory.length - 1) currentDD = dd;
  }

  // ── Calmar Ratio ──────────────────────────────────────────────────────
  // annualizedReturn / maxDrawdown
  const calmarRatio = maxDD !== 0 ? annualizedReturn / maxDD : 0;

  // ── Information Ratio (vs benchmark = risk-free) ──────────────────────
  // (portfolioReturn - benchmarkReturn) / trackingError
  const excessReturns = dailyReturns.map((r) => r - dailyRf);
  const trackingError = stdDev(excessReturns) * SQRT_252;
  const informationRatio =
    trackingError !== 0 ? (annualizedReturn - riskFreeRate) / trackingError : 0;

  // ── VaR (parametric, normal distribution) ─────────────────────────────
  // VaR_alpha = -(mu + z_alpha * sigma) as percentage loss
  const z95 = normalInvCDF(0.05); // ~ -1.6449
  const z99 = normalInvCDF(0.01); // ~ -2.3263
  const valueAtRisk95 = -(dailyMeanReturn + z95 * dailyStd);
  const valueAtRisk99 = -(dailyMeanReturn + z99 * dailyStd);

  // ── CVaR / Expected Shortfall at 95% ──────────────────────────────────
  // CVaR = -mu + sigma * phi(Phi^{-1}(alpha)) / alpha
  const conditionalVaR95 =
    dailyStd !== 0
      ? -dailyMeanReturn + dailyStd * normalPDF(z95) / 0.05
      : 0;

  // ── Beta & Alpha (vs market proxy: assume market return = risk-free + 8% equity premium) ──
  // Since we don't have benchmark returns, use simplified approach:
  // Beta = Cov(Rp, Rm) / Var(Rm) ~ 1 when no benchmark available
  // For simulation, estimate beta from volatility ratio
  const marketAnnualVol = 0.16; // ~16% annual vol for S&P proxy
  const marketDailyVol = marketAnnualVol / SQRT_252;
  const marketAnnualReturn = riskFreeRate + 0.06; // equity risk premium
  // Correlation assumption: 0.7 with market
  const rho = 0.7;
  const betaEstimate =
    marketDailyVol !== 0 ? (rho * dailyStd) / marketDailyVol : 1;
  // Jensen's alpha: Rp - (Rf + beta * (Rm - Rf))
  const alphaEstimate =
    annualizedReturn -
    (riskFreeRate + betaEstimate * (marketAnnualReturn - riskFreeRate));

  // ── Trade Statistics ──────────────────────────────────────────────────
  // Filter to sell trades that have realized P&L
  const closingTrades = trades.filter(
    (t) => t.side === "sell" && t.realizedPnL !== 0,
  );
  const wins = closingTrades.filter((t) => t.realizedPnL > 0);
  const losses = closingTrades.filter((t) => t.realizedPnL < 0);

  const winRate = closingTrades.length > 0 ? wins.length / closingTrades.length : 0;
  const grossProfit = wins.reduce((s, t) => s + t.realizedPnL, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.realizedPnL, 0));
  const profitFactor = grossLoss !== 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

  const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
  const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
  const payoffRatio = avgLoss !== 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0;

  // Expectancy: (winRate * avgWin) - ((1-winRate) * avgLoss)
  const expectancy = winRate * avgWin - (1 - winRate) * avgLoss;

  // Kelly Criterion: (p*b - q) / b where p=winRate, b=payoffRatio, q=1-p
  const kellyFraction =
    payoffRatio !== 0 && isFinite(payoffRatio)
      ? (winRate * payoffRatio - (1 - winRate)) / payoffRatio
      : 0;

  // ── Distribution Moments ──────────────────────────────────────────────
  const mu = dailyMeanReturn;
  const sigma = dailyStd;
  let m3 = 0;
  let m4 = 0;
  if (sigma > 0 && dailyReturns.length >= 3) {
    for (let i = 0; i < dailyReturns.length; i++) {
      const z = (dailyReturns[i] - mu) / sigma;
      m3 += z * z * z;
      m4 += z * z * z * z;
    }
    const n = dailyReturns.length;
    // Sample skewness with bias correction: n/((n-1)(n-2)) * sum(z^3)
    m3 = (n / ((n - 1) * (n - 2))) * m3;
    // Sample excess kurtosis with bias correction
    m4 =
      ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * m4 -
      (3 * (n - 1) * (n - 1)) / ((n - 2) * (n - 3));
  }

  return {
    totalReturn: totalReturn * 100,
    annualizedReturn: annualizedReturn * 100,
    dailyMeanReturn: dailyMeanReturn * 100,
    dailyStdDev: dailyStd * 100,
    annualizedVolatility: annualizedVolatility * 100,
    sharpeRatio,
    sortinoRatio,
    calmarRatio,
    informationRatio,
    maxDrawdown: maxDD * 100,
    maxDrawdownDuration: maxDDDuration,
    currentDrawdown: currentDD * 100,
    valueAtRisk95: valueAtRisk95 * 100,
    valueAtRisk99: valueAtRisk99 * 100,
    conditionalVaR95: conditionalVaR95 * 100,
    beta: betaEstimate,
    alpha: alphaEstimate * 100,
    winRate: winRate * 100,
    profitFactor,
    avgWin,
    avgLoss,
    payoffRatio,
    expectancy,
    kellyFraction: kellyFraction * 100,
    skewness: m3,
    kurtosis: m4,
  };
}

/**
 * Calculate drawdown series from equity history.
 * Returns drawdown as a positive percentage (0 = at peak).
 */
export function calculateDrawdownSeries(
  equityHistory: EquityPoint[],
): DrawdownPoint[] {
  if (equityHistory.length === 0) return [];

  const result: DrawdownPoint[] = [];
  let peak = equityHistory[0].value;

  for (let i = 0; i < equityHistory.length; i++) {
    const v = equityHistory[i].value;
    if (v > peak) peak = v;
    const dd = peak !== 0 ? ((peak - v) / peak) * 100 : 0;
    result.push({ timestamp: equityHistory[i].timestamp, drawdown: dd });
  }

  return result;
}

/**
 * Calculate rolling metrics over a sliding window.
 *
 * @param equityHistory - Time series of portfolio values
 * @param windowDays - Rolling window size in trading days
 */
export function calculateRollingMetrics(
  equityHistory: EquityPoint[],
  windowDays: number,
): RollingMetricPoint[] {
  if (equityHistory.length < windowDays + 1) return [];

  const results: RollingMetricPoint[] = [];
  const dailyRf = Math.pow(1.05, 1 / TRADING_DAYS_PER_YEAR) - 1;

  for (let i = windowDays; i < equityHistory.length; i++) {
    const window = equityHistory.slice(i - windowDays, i + 1);
    const returns = equityToReturns(window);

    if (returns.length === 0) continue;

    const mu = mean(returns);
    const sigma = stdDev(returns, mu);
    const annualVol = sigma * SQRT_252;
    const annualReturn = mu * TRADING_DAYS_PER_YEAR;
    const sharpe =
      annualVol !== 0 ? (annualReturn - 0.05) / annualVol : 0;

    // Current drawdown within window
    let peak = window[0].value;
    let dd = 0;
    for (let j = 0; j < window.length; j++) {
      if (window[j].value > peak) peak = window[j].value;
      const curDD = peak !== 0 ? (peak - window[j].value) / peak : 0;
      if (curDD > dd) dd = curDD;
    }

    results.push({
      timestamp: equityHistory[i].timestamp,
      sharpe,
      volatility: annualVol * 100,
      drawdown: dd * 100,
    });
  }

  return results;
}
