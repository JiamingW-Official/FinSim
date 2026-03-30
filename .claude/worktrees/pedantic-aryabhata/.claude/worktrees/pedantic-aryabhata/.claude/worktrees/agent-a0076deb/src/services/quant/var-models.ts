// Value at Risk (VaR) Models
// Historical, Parametric, Monte Carlo, Cornish-Fisher

export interface VaRResult {
  var: number; // Value at Risk (positive = loss)
  cvar: number; // Conditional VaR (Expected Shortfall)
  confidence: number;
  method: string;
}

export interface StressTestResult {
  scenario: string;
  description: string;
  date: string;
  marketReturn: number;
  portfolioImpact: number;
  portfolioLoss: number;
}

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stddev(arr: number[]): number {
  const m = mean(arr);
  const variance = arr.reduce((a, b) => a + (b - m) ** 2, 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

function skewness(arr: number[]): number {
  const n = arr.length;
  const m = mean(arr);
  const s = stddev(arr);
  if (s === 0) return 0;
  const m3 = arr.reduce((a, b) => a + ((b - m) / s) ** 3, 0) / n;
  return (n * (n - 1)) / (n - 2) ? m3 * (n / ((n - 1) * (n - 2))) * n : m3;
}

function kurtosis(arr: number[]): number {
  const n = arr.length;
  const m = mean(arr);
  const s = stddev(arr);
  if (s === 0) return 0;
  const m4 = arr.reduce((a, b) => a + ((b - m) / s) ** 4, 0) / n;
  return m4 - 3; // Excess kurtosis
}

// Normal inverse CDF (Beasley-Springer-Moro)
function normalInvCDF(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.383577518672690e2, -3.066479806614716e1, 2.506628277459239e0];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838e0, -2.549732539343734e0, 4.374664141464968e0, 2.938163982698783e0];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996e0, 3.754408661907416e0];

  const pLow = 0.02425;
  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= 1 - pLow) {
    const q = p - 0.5;
    const r = q * q;
    return ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
}

/**
 * Historical VaR — sorts returns and picks the percentile
 */
export function historicalVaR(returns: number[], confidence: number = 0.95): VaRResult {
  const sorted = [...returns].sort((a, b) => a - b);
  const idx = Math.floor(sorted.length * (1 - confidence));
  const varValue = -sorted[idx];
  const tailReturns = sorted.slice(0, idx + 1);
  const cvar = tailReturns.length > 0 ? -mean(tailReturns) : varValue;

  return { var: varValue, cvar, confidence, method: "Historical" };
}

/**
 * Parametric VaR — assumes normal distribution
 */
export function parametricVaR(returns: number[], confidence: number = 0.95): VaRResult {
  const mu = mean(returns);
  const sigma = stddev(returns);
  const z = normalInvCDF(1 - confidence);
  const varValue = -(mu + z * sigma);
  // CVaR for normal: mu + sigma * phi(z) / (1-confidence)
  const phi = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
  const cvar = -(mu - sigma * phi / (1 - confidence));

  return { var: varValue, cvar, confidence, method: "Parametric (Normal)" };
}

/**
 * Monte Carlo VaR — simulates returns using fitted normal
 */
export function monteCarloVaR(
  returns: number[],
  confidence: number = 0.95,
  simulations: number = 10000
): VaRResult {
  const mu = mean(returns);
  const sigma = stddev(returns);
  const simReturns: number[] = [];

  // Box-Muller for normal random variates
  for (let i = 0; i < simulations; i++) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    simReturns.push(mu + sigma * z);
  }

  return { ...historicalVaR(simReturns, confidence), method: "Monte Carlo" };
}

/**
 * Cornish-Fisher VaR — adjusts for skewness and kurtosis
 */
export function cornishFisherVaR(returns: number[], confidence: number = 0.95): VaRResult {
  const mu = mean(returns);
  const sigma = stddev(returns);
  const S = skewness(returns);
  const K = kurtosis(returns);
  const z = normalInvCDF(1 - confidence);

  // Cornish-Fisher expansion
  const zCF =
    z +
    (1 / 6) * (z * z - 1) * S +
    (1 / 24) * (z ** 3 - 3 * z) * K -
    (1 / 36) * (2 * z ** 3 - 5 * z) * S * S;

  const varValue = -(mu + zCF * sigma);

  // Approximate CVaR
  const sorted = [...returns].sort((a, b) => a - b);
  const idx = Math.max(0, Math.floor(sorted.length * (1 - confidence)));
  const tailReturns = sorted.slice(0, idx + 1);
  const cvar = tailReturns.length > 0 ? -mean(tailReturns) : varValue;

  return { var: varValue, cvar, confidence, method: "Cornish-Fisher" };
}

/**
 * Stress test against historical crisis scenarios
 */
export function stressTest(
  portfolioValue: number,
  returns: number[],
  beta: number = 1.0
): StressTestResult[] {
  const scenarios = [
    { scenario: "2008 GFC", description: "Global Financial Crisis — Lehman collapse, credit freeze", date: "Sep 2008 – Mar 2009", marketReturn: -0.38 },
    { scenario: "COVID Crash", description: "Pandemic selloff — fastest 30% drop in history", date: "Feb – Mar 2020", marketReturn: -0.34 },
    { scenario: "Dot-Com Bust", description: "Tech bubble burst — NASDAQ lost 78%", date: "Mar 2000 – Oct 2002", marketReturn: -0.49 },
    { scenario: "Black Monday", description: "Single-day 22% crash on Oct 19, 1987", date: "Oct 1987", marketReturn: -0.22 },
    { scenario: "2022 Bear Market", description: "Fed rate hikes + inflation — growth stocks crushed", date: "Jan – Oct 2022", marketReturn: -0.25 },
    { scenario: "1997 Asian Crisis", description: "Thai baht collapse triggers global contagion", date: "Jul – Oct 1997", marketReturn: -0.13 },
    { scenario: "2018 Volmageddon", description: "VIX spike, XIV liquidation, quant unwind", date: "Feb 2018", marketReturn: -0.10 },
    { scenario: "Flash Crash 2010", description: "DJIA drops 1000 points in minutes", date: "May 2010", marketReturn: -0.09 },
  ];

  return scenarios.map((s) => {
    const portfolioReturn = s.marketReturn * beta;
    return {
      ...s,
      portfolioImpact: portfolioReturn,
      portfolioLoss: portfolioValue * Math.abs(portfolioReturn),
    };
  });
}

/**
 * Calculate all VaR methods at once
 */
export function calculateAllVaR(
  returns: number[],
  confidence: number = 0.95
): { historical: VaRResult; parametric: VaRResult; monteCarlo: VaRResult; cornishFisher: VaRResult } {
  return {
    historical: historicalVaR(returns, confidence),
    parametric: parametricVaR(returns, confidence),
    monteCarlo: monteCarloVaR(returns, confidence),
    cornishFisher: cornishFisherVaR(returns, confidence),
  };
}
