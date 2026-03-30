// ---------------------------------------------------------------------------
// Mean-Variance Portfolio Optimizer
// ---------------------------------------------------------------------------
// Provides: computeEfficientFrontier, computeMinVarianceWeights,
//           computeMaxSharpeWeights, computeRiskContributions

export interface EfficientFrontierPoint {
  expectedReturn: number;  // annualised decimal, e.g. 0.12 = 12%
  risk: number;            // annualised std-dev decimal, e.g. 0.18 = 18%
  weights: Record<string, number>;
  sharpe: number;
  isMinVariance?: boolean;
  isMaxSharpe?: boolean;
}

export interface RiskContribution {
  ticker: string;
  weight: number;           // portfolio weight 0..1
  marginalContribution: number;  // marginal risk contribution 0..1
  absoluteContribution: number;  // absolute $ risk contribution (fraction of total vol)
  contributionPct: number;  // percentage of total portfolio risk (0..100)
}

export interface RebalanceTrade {
  ticker: string;
  currentWeight: number;    // 0..1
  targetWeight: number;     // 0..1
  drift: number;            // currentWeight - targetWeight
  action: "buy" | "sell" | "hold";
  tradeValueDollar: number; // positive = buy dollars, negative = sell dollars
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function portfolioReturn(weights: number[], returns: number[]): number {
  let r = 0;
  for (let i = 0; i < weights.length; i++) r += weights[i] * returns[i];
  return r;
}

function portfolioVariance(weights: number[], cov: number[][]): number {
  const n = weights.length;
  let v = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      v += weights[i] * weights[j] * cov[i][j];
    }
  }
  return v;
}

function portfolioRisk(weights: number[], cov: number[][]): number {
  return Math.sqrt(Math.max(0, portfolioVariance(weights, cov)));
}

/**
 * Project a vector onto the probability simplex (sum = 1, all >= 0).
 * Uses the O(n log n) algorithm by Duchi et al.
 */
function projectToSimplex(v: number[]): number[] {
  const n = v.length;
  const sorted = v.slice().sort((a, b) => b - a);
  let cumSum = 0;
  let rho = 0;
  for (let i = 0; i < n; i++) {
    cumSum += sorted[i];
    if (sorted[i] - (cumSum - 1) / (i + 1) > 0) rho = i;
  }
  cumSum = 0;
  for (let i = 0; i <= rho; i++) cumSum += sorted[i];
  const theta = (cumSum - 1) / (rho + 1);
  return v.map((vi) => Math.max(vi - theta, 0));
}

/**
 * Gradient descent to minimise portfolio variance subject to a return target.
 * Constraints: w >= 0, sum(w) = 1 (long-only, fully-invested).
 */
function optimiseForTargetReturn(
  targetRet: number,
  returns: number[],
  cov: number[][],
  maxIter = 600,
): number[] {
  const n = returns.length;
  let w = new Array(n).fill(1 / n);
  let lr = 0.4;
  const lambda = 60; // penalty weight for return constraint

  for (let iter = 0; iter < maxIter; iter++) {
    // Gradient of variance: 2 * Σ w
    const gVar = new Array(n).fill(0);
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) gVar[i] += 2 * cov[i][j] * w[j];

    // Gradient of return penalty: lambda * 2 * (portRet - target) * returns[i]
    const portRet = portfolioReturn(w, returns);
    const diff = portRet - targetRet;
    const g = gVar.map((gi, i) => gi + lambda * 2 * diff * returns[i]);

    const wNew = projectToSimplex(w.map((wi, i) => wi - lr * g[i]));
    w = wNew;
    if (iter % 120 === 119) lr *= 0.65;
  }

  return w;
}

/** Minimise variance without a return target. */
function minimiseVariance(returns: number[], cov: number[][], maxIter = 600): number[] {
  const n = returns.length;
  let w = new Array(n).fill(1 / n);
  let lr = 0.4;

  for (let iter = 0; iter < maxIter; iter++) {
    const g = new Array(n).fill(0);
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) g[i] += 2 * cov[i][j] * w[j];

    w = projectToSimplex(w.map((wi, i) => wi - lr * g[i]));
    if (iter % 120 === 119) lr *= 0.65;
  }

  return w;
}

/** Maximise Sharpe ratio via gradient ascent on the Sharpe objective. */
function maximiseSharpe(
  returns: number[],
  cov: number[][],
  riskFreeRate: number,
  seed: number[],
  maxIter = 400,
): number[] {
  const n = returns.length;
  let w = seed.slice();
  let lr = 0.08;

  for (let iter = 0; iter < maxIter; iter++) {
    const portRet = portfolioReturn(w, returns);
    const portRisk = portfolioRisk(w, cov);
    if (portRisk < 1e-12) break;

    const excess = portRet - riskFreeRate;
    const sharpe = excess / portRisk;

    // d(Sharpe)/dw_i
    const g = new Array(n);
    for (let i = 0; i < n; i++) {
      let covW = 0;
      for (let j = 0; j < n; j++) covW += cov[i][j] * w[j];
      const dRisk = covW / portRisk;
      g[i] = (returns[i] - sharpe * dRisk) / portRisk;
    }

    w = projectToSimplex(w.map((wi, i) => wi + lr * g[i]));
    if (iter % 80 === 79) lr *= 0.7;
  }

  return w;
}

function makePoint(
  weights: number[],
  tickers: string[],
  returns: number[],
  cov: number[][],
  riskFreeRate: number,
): EfficientFrontierPoint {
  const ret = portfolioReturn(weights, returns);
  const risk = portfolioRisk(weights, cov);
  const sharpe = risk > 0 ? (ret - riskFreeRate) / risk : 0;
  const weightMap: Record<string, number> = {};
  for (let i = 0; i < tickers.length; i++) {
    weightMap[tickers[i]] = Math.round(weights[i] * 10000) / 10000;
  }
  return { expectedReturn: ret, risk, weights: weightMap, sharpe };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Compute a 20-point efficient frontier plus the two highlighted portfolios.
 *
 * @param tickers   Asset identifiers (same order as `returns` rows and `covMatrix` rows/cols)
 * @param returns   Annualised expected return per asset (decimal)
 * @param covMatrix Annualised covariance matrix (n×n)
 * @param riskFreeRate Risk-free rate for Sharpe calculation (default 4.5%)
 * @returns Array of 20 frontier points; the min-variance and max-Sharpe points are
 *          flagged with `isMinVariance` and `isMaxSharpe` respectively.
 */
export function computeEfficientFrontier(
  tickers: string[],
  returns: number[],
  covMatrix: number[][],
  riskFreeRate = 0.045,
): EfficientFrontierPoint[] {
  if (tickers.length < 2) return [];

  // Minimum-variance portfolio
  const mvWeights = minimiseVariance(returns, covMatrix);
  const mvRet = portfolioReturn(mvWeights, returns);

  // Upper bound: best single-asset return
  const maxRet = Math.max(...returns);

  // Build 20 frontier points (from min-variance return to max return)
  const NUM_POINTS = 20;
  const rawFrontierData: { weights: number[]; ret: number; risk: number }[] = [];

  for (let i = 0; i < NUM_POINTS; i++) {
    const targetRet = mvRet + (i / (NUM_POINTS - 1)) * (maxRet - mvRet);
    const w = optimiseForTargetReturn(targetRet, returns, covMatrix);
    rawFrontierData.push({
      weights: w,
      ret: portfolioReturn(w, returns),
      risk: portfolioRisk(w, covMatrix),
    });
  }

  // Max-Sharpe portfolio seeded from frontier's best Sharpe point
  let bestSharpe = -Infinity;
  let bestSeed = rawFrontierData[0].weights;
  for (const pt of rawFrontierData) {
    const s = pt.risk > 0 ? (pt.ret - riskFreeRate) / pt.risk : 0;
    if (s > bestSharpe) { bestSharpe = s; bestSeed = pt.weights; }
  }
  const msWeights = maximiseSharpe(returns, covMatrix, riskFreeRate, bestSeed);

  // Build output points
  const points: EfficientFrontierPoint[] = rawFrontierData.map((d) =>
    makePoint(d.weights, tickers, returns, covMatrix, riskFreeRate),
  );

  // Flag min-variance (first point, by construction)
  points[0] = { ...points[0], isMinVariance: true };

  // Find the frontier point closest to max-Sharpe and flag it
  const msRisk = portfolioRisk(msWeights, covMatrix);
  const msRet = portfolioReturn(msWeights, returns);
  let closestIdx = 0;
  let closestDist = Infinity;
  for (let i = 0; i < points.length; i++) {
    const d = (points[i].risk - msRisk) ** 2 + (points[i].expectedReturn - msRet) ** 2;
    if (d < closestDist) { closestDist = d; closestIdx = i; }
  }
  // Replace with the true max-Sharpe result
  points[closestIdx] = {
    ...makePoint(msWeights, tickers, returns, covMatrix, riskFreeRate),
    isMaxSharpe: true,
  };

  return points;
}

/**
 * Compute the minimum-variance weights for the given covariance matrix.
 */
export function computeMinVarianceWeights(
  tickers: string[],
  returns: number[],
  covMatrix: number[][],
): Record<string, number> {
  const w = minimiseVariance(returns, covMatrix);
  const map: Record<string, number> = {};
  for (let i = 0; i < tickers.length; i++) map[tickers[i]] = w[i];
  return map;
}

/**
 * Compute the maximum-Sharpe weights.
 */
export function computeMaxSharpeWeights(
  tickers: string[],
  returns: number[],
  covMatrix: number[][],
  riskFreeRate = 0.045,
): Record<string, number> {
  const mvW = minimiseVariance(returns, covMatrix);
  const msW = maximiseSharpe(returns, covMatrix, riskFreeRate, mvW);
  const map: Record<string, number> = {};
  for (let i = 0; i < tickers.length; i++) map[tickers[i]] = msW[i];
  return map;
}

/**
 * Compute per-asset risk contributions for a portfolio.
 *
 * The marginal contribution of asset i to portfolio volatility is:
 *   MC_i = (Σ w)_i / σ_p = Cov(r_i, r_p) / σ_p
 *
 * The component contribution is w_i * MC_i (sums to σ_p).
 *
 * @param tickers   Asset tickers
 * @param weights   Portfolio weights (values 0..1, should sum to 1)
 * @param covMatrix Annualised covariance matrix
 * @param portfolioValueDollar Total portfolio $ value (for absolute trades)
 */
export function computeRiskContributions(
  tickers: string[],
  weights: number[],
  covMatrix: number[][],
): RiskContribution[] {
  const n = tickers.length;
  const portRisk = portfolioRisk(weights, covMatrix);

  if (portRisk < 1e-12) {
    return tickers.map((t, i) => ({
      ticker: t,
      weight: weights[i],
      marginalContribution: 0,
      absoluteContribution: 0,
      contributionPct: 0,
    }));
  }

  // Σ w  (covariance matrix times weight vector)
  const covW = new Array(n).fill(0);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) covW[i] += covMatrix[i][j] * weights[j];

  // Marginal contribution to risk = (Σ w)_i / σ_p
  const mc = covW.map((v) => v / portRisk);

  // Component contribution = w_i * MC_i
  const cc = mc.map((mci, i) => weights[i] * mci);

  // Total component contributions should sum to portRisk
  const totalCC = cc.reduce((s, v) => s + v, 0);

  return tickers.map((t, i) => ({
    ticker: t,
    weight: weights[i],
    marginalContribution: mc[i],
    absoluteContribution: cc[i],
    contributionPct: totalCC > 0 ? (cc[i] / totalCC) * 100 : 0,
  }));
}

/**
 * Compute rebalancing trades to move from current weights to target weights.
 *
 * @param tickers        Asset tickers
 * @param currentWeights Current portfolio weights (0..1)
 * @param targetWeights  Target weights (0..1, should sum to 1)
 * @param portfolioValueDollar Total portfolio $ value
 * @param commissionPerTrade $ commission per trade (default $0)
 * @returns Per-asset trade plan and total estimated cost
 */
export function computeRebalanceTrades(
  tickers: string[],
  currentWeights: number[],
  targetWeights: number[],
  portfolioValueDollar: number,
  commissionPerTrade = 0,
): { trades: RebalanceTrade[]; totalCommission: number; totalTurnover: number } {
  const trades: RebalanceTrade[] = tickers.map((t, i) => {
    const drift = currentWeights[i] - targetWeights[i];
    const tradeDollar = (targetWeights[i] - currentWeights[i]) * portfolioValueDollar;
    const action: "buy" | "sell" | "hold" =
      Math.abs(tradeDollar) < 1 ? "hold" : tradeDollar > 0 ? "buy" : "sell";
    return {
      ticker: t,
      currentWeight: currentWeights[i],
      targetWeight: targetWeights[i],
      drift,
      action,
      tradeValueDollar: tradeDollar,
    };
  });

  const activeTrades = trades.filter((t) => t.action !== "hold");
  const totalCommission = activeTrades.length * commissionPerTrade;
  const totalTurnover = trades.reduce((s, t) => s + Math.abs(t.tradeValueDollar), 0) / 2;

  return { trades, totalCommission, totalTurnover };
}
