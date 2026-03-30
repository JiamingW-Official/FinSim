// ---------------------------------------------------------------------------
// Markowitz Efficient Frontier — Numerical Portfolio Optimization
// ---------------------------------------------------------------------------

export interface EfficientFrontierPoint {
  return: number;
  risk: number;
  weights: Record<string, number>;
  sharpe: number;
}

export interface EfficientFrontierResult {
  frontier: EfficientFrontierPoint[];
  minVariance: EfficientFrontierPoint;
  maxSharpe: EfficientFrontierPoint;
  equalWeight: EfficientFrontierPoint;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function portfolioReturn(
  weights: number[],
  returns: number[],
): number {
  let r = 0;
  for (let i = 0; i < weights.length; i++) r += weights[i] * returns[i];
  return r;
}

function portfolioVariance(
  weights: number[],
  cov: number[][],
): number {
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

/** Project weights onto the simplex (sum=1, all >= 0) via sorting-based algorithm */
function projectToSimplex(v: number[]): number[] {
  const n = v.length;
  const sorted = v.slice().sort((a, b) => b - a);
  let cumSum = 0;
  let t = 0;
  for (let i = 0; i < n; i++) {
    cumSum += sorted[i];
    const ti = (cumSum - 1) / (i + 1);
    if (sorted[i] - ti > 0) {
      t = ti;
    }
  }
  return v.map((vi) => Math.max(vi - t, 0));
}

/**
 * Find minimum-variance portfolio for a target return using projected gradient descent.
 * Constraints: sum(w) = 1, w_i >= 0 (long-only).
 */
function optimizeForTargetReturn(
  targetRet: number,
  returns: number[],
  cov: number[][],
  maxIter: number = 500,
): number[] {
  const n = returns.length;
  // Start with equal weights
  let weights = new Array(n).fill(1 / n);
  let lr = 0.5;
  const penalty = 50; // Lagrange penalty for return constraint

  for (let iter = 0; iter < maxIter; iter++) {
    // Gradient of variance: 2 * cov * w
    const gradVar: number[] = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        gradVar[i] += 2 * cov[i][j] * weights[j];
      }
    }

    // Gradient of penalty for return constraint: penalty * 2 * (portRet - targetRet) * returns[i]
    const portRet = portfolioReturn(weights, returns);
    const retDiff = portRet - targetRet;

    const grad: number[] = new Array(n);
    for (let i = 0; i < n; i++) {
      grad[i] = gradVar[i] + penalty * 2 * retDiff * returns[i];
    }

    // Gradient step
    const newWeights = new Array(n);
    for (let i = 0; i < n; i++) {
      newWeights[i] = weights[i] - lr * grad[i];
    }

    // Project to simplex (ensures sum=1, w>=0)
    weights = projectToSimplex(newWeights);

    // Decay learning rate
    if (iter % 100 === 99) lr *= 0.7;
  }

  return weights;
}

/** Find minimum variance portfolio (no return constraint) */
function findMinVariance(
  returns: number[],
  cov: number[][],
  maxIter: number = 500,
): number[] {
  const n = returns.length;
  let weights = new Array(n).fill(1 / n);
  let lr = 0.5;

  for (let iter = 0; iter < maxIter; iter++) {
    const grad: number[] = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        grad[i] += 2 * cov[i][j] * weights[j];
      }
    }

    const newWeights = new Array(n);
    for (let i = 0; i < n; i++) {
      newWeights[i] = weights[i] - lr * grad[i];
    }

    weights = projectToSimplex(newWeights);
    if (iter % 100 === 99) lr *= 0.7;
  }

  return weights;
}

/** Find maximum Sharpe ratio portfolio via grid search + gradient refinement */
function findMaxSharpe(
  returns: number[],
  cov: number[][],
  riskFreeRate: number,
  frontierPoints: { weights: number[]; ret: number; risk: number }[],
): number[] {
  // Start from the frontier point with highest Sharpe
  let bestSharpe = -Infinity;
  let bestWeights = frontierPoints[0].weights;

  for (const pt of frontierPoints) {
    const sharpe = pt.risk > 0 ? (pt.ret - riskFreeRate) / pt.risk : 0;
    if (sharpe > bestSharpe) {
      bestSharpe = sharpe;
      bestWeights = pt.weights;
    }
  }

  // Refine with gradient ascent on Sharpe ratio
  const n = returns.length;
  let weights = bestWeights.slice();
  let lr = 0.1;

  for (let iter = 0; iter < 300; iter++) {
    const portRet = portfolioReturn(weights, returns);
    const portRisk = portfolioRisk(weights, cov);
    if (portRisk < 1e-10) break;

    const excess = portRet - riskFreeRate;
    const sharpe = excess / portRisk;

    // d(Sharpe)/dw_i = (1/risk) * (returns[i] - sharpe * d(risk)/dw_i)
    // d(risk)/dw_i = (1/risk) * sum_j(cov[i][j] * w[j])
    const grad: number[] = new Array(n);
    for (let i = 0; i < n; i++) {
      let covWi = 0;
      for (let j = 0; j < n; j++) {
        covWi += cov[i][j] * weights[j];
      }
      const dRisk = covWi / portRisk;
      grad[i] = (returns[i] - sharpe * dRisk) / portRisk;
    }

    // Ascent (maximize Sharpe)
    const newWeights = new Array(n);
    for (let i = 0; i < n; i++) {
      newWeights[i] = weights[i] + lr * grad[i];
    }

    weights = projectToSimplex(newWeights);
    if (iter % 80 === 79) lr *= 0.7;
  }

  return weights;
}

function makePoint(
  weights: number[],
  returns: number[],
  cov: number[][],
  tickers: string[],
  riskFreeRate: number,
): EfficientFrontierPoint {
  const ret = portfolioReturn(weights, returns);
  const risk = portfolioRisk(weights, cov);
  const sharpe = risk > 0 ? (ret - riskFreeRate) / risk : 0;
  const weightMap: Record<string, number> = {};
  for (let i = 0; i < tickers.length; i++) {
    weightMap[tickers[i]] = Math.round(weights[i] * 10000) / 10000;
  }
  return { return: ret, risk, weights: weightMap, sharpe };
}

// ─── Main ────────────────────────────────────────────────────────────────────

export function calculateEfficientFrontier(
  expectedReturns: Record<string, number>,
  covarianceMatrix: number[][],
  tickers: string[],
  riskFreeRate: number = 0.05,
): EfficientFrontierResult {
  const n = tickers.length;
  const returns = tickers.map((t) => expectedReturns[t]);

  // 1. Equal-weight portfolio
  const eqWeights = new Array(n).fill(1 / n);
  const equalWeight = makePoint(eqWeights, returns, covarianceMatrix, tickers, riskFreeRate);

  // 2. Minimum variance portfolio
  const mvWeights = findMinVariance(returns, covarianceMatrix);
  const minVariance = makePoint(mvWeights, returns, covarianceMatrix, tickers, riskFreeRate);

  // 3. Generate frontier points
  const minRet = Math.min(...returns);
  const maxRet = Math.max(...returns);
  // Frontier range from min-variance return to max individual return
  const mvRet = portfolioReturn(mvWeights, returns);
  const frontierMin = mvRet;
  const frontierMax = maxRet;
  const numPoints = 20;

  const frontierData: { weights: number[]; ret: number; risk: number }[] = [];
  const frontier: EfficientFrontierPoint[] = [];

  for (let i = 0; i < numPoints; i++) {
    const targetRet = frontierMin + (i / (numPoints - 1)) * (frontierMax - frontierMin);
    const w = optimizeForTargetReturn(targetRet, returns, covarianceMatrix);
    const actualRet = portfolioReturn(w, returns);
    const actualRisk = portfolioRisk(w, covarianceMatrix);
    frontierData.push({ weights: w, ret: actualRet, risk: actualRisk });
    frontier.push(makePoint(w, returns, covarianceMatrix, tickers, riskFreeRate));
  }

  // 4. Maximum Sharpe ratio portfolio
  const msWeights = findMaxSharpe(returns, covarianceMatrix, riskFreeRate, frontierData);
  const maxSharpe = makePoint(msWeights, returns, covarianceMatrix, tickers, riskFreeRate);

  return { frontier, minVariance, maxSharpe, equalWeight };
}
