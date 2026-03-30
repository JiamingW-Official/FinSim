// Black-Litterman model and risk budgeting optimizer

export interface BLView {
  asset: string;
  expectedReturn: number;
  confidence: number;
}

export interface BLResult {
  weights: Record<string, number>;
  expectedReturn: number;
  risk: number;
  sharpe: number;
}

/**
 * Simple matrix utilities for the BL computation.
 */
function matMul(A: number[][], B: number[][]): number[][] {
  const rows = A.length;
  const cols = B[0].length;
  const inner = B.length;
  const C: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(0));
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      for (let k = 0; k < inner; k++) {
        C[i][j] += A[i][k] * B[k][j];
      }
    }
  }
  return C;
}

function matTranspose(A: number[][]): number[][] {
  const rows = A.length;
  const cols = A[0].length;
  const T: number[][] = Array.from({ length: cols }, () => new Array(rows).fill(0));
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      T[j][i] = A[i][j];
    }
  }
  return T;
}

function matScale(A: number[][], s: number): number[][] {
  return A.map((row) => row.map((v) => v * s));
}

function matAdd(A: number[][], B: number[][]): number[][] {
  return A.map((row, i) => row.map((v, j) => v + B[i][j]));
}

function matInverse(M: number[][]): number[][] {
  const n = M.length;
  // Augmented matrix [M | I]
  const aug: number[][] = M.map((row, i) => {
    const augRow = [...row];
    for (let j = 0; j < n; j++) augRow.push(i === j ? 1 : 0);
    return augRow;
  });

  for (let col = 0; col < n; col++) {
    // Partial pivoting
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

    const pivot = aug[col][col];
    if (Math.abs(pivot) < 1e-12) {
      // Singular matrix fallback: return identity
      return Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (__, j) => (i === j ? 1 : 0))
      );
    }

    for (let j = 0; j < 2 * n; j++) aug[col][j] /= pivot;

    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = aug[row][col];
      for (let j = 0; j < 2 * n; j++) {
        aug[row][j] -= factor * aug[col][j];
      }
    }
  }

  return aug.map((row) => row.slice(n));
}

function vecToCol(v: number[]): number[][] {
  return v.map((x) => [x]);
}

function colToVec(M: number[][]): number[] {
  return M.map((row) => row[0]);
}

/**
 * Black-Litterman model implementation.
 *
 * Formula:
 *   posteriorMean = inv(inv(tau*Sigma) + P'*inv(Omega)*P) * (inv(tau*Sigma)*Pi + P'*inv(Omega)*Q)
 *   posteriorWeights = inv(riskAversion * Sigma) * posteriorMean
 *
 * Where:
 *   Pi = implied equilibrium returns (from market cap weights)
 *   P = pick matrix (views matrix)
 *   Q = view returns vector
 *   Omega = diagonal confidence matrix
 *   tau = scalar (typically 0.025-0.05)
 */
export function blackLitterman(
  marketCaps: Record<string, number>,
  riskAversion: number,
  views: BLView[],
  covMatrix: number[][],
  tickers: string[]
): BLResult {
  const n = tickers.length;
  const tau = 0.05;

  // Market cap weights
  const totalCap = Object.values(marketCaps).reduce((s, v) => s + v, 0);
  const mktWeights = tickers.map((t) => (marketCaps[t] || 0) / totalCap);

  // Implied equilibrium returns: Pi = riskAversion * Sigma * w_mkt
  const wCol = vecToCol(mktWeights);
  const piCol = matScale(matMul(covMatrix, wCol), riskAversion);
  const pi = colToVec(piCol);

  // If no views, just return equilibrium weights
  if (views.length === 0) {
    const weights: Record<string, number> = {};
    tickers.forEach((t, i) => {
      weights[t] = Math.round(mktWeights[i] * 10000) / 10000;
    });
    const expRet = mktWeights.reduce((s, w, i) => s + w * pi[i], 0);
    const risk = computePortfolioRisk(mktWeights, covMatrix);
    return {
      weights,
      expectedReturn: Math.round(expRet * 10000) / 10000,
      risk: Math.round(risk * 10000) / 10000,
      sharpe: risk > 0 ? Math.round((expRet / risk) * 100) / 100 : 0,
    };
  }

  // Build P matrix (k views x n assets) and Q vector (k x 1)
  const k = views.length;
  const P: number[][] = Array.from({ length: k }, () => new Array(n).fill(0));
  const Q: number[] = [];
  const omegaDiag: number[] = [];

  for (let v = 0; v < k; v++) {
    const assetIdx = tickers.indexOf(views[v].asset);
    if (assetIdx >= 0) {
      P[v][assetIdx] = 1;
    }
    Q.push(views[v].expectedReturn);
    // Omega diagonal: lower confidence = higher uncertainty
    const viewVariance =
      (1 / Math.max(views[v].confidence, 0.01)) * tau * (covMatrix[assetIdx >= 0 ? assetIdx : 0]?.[assetIdx >= 0 ? assetIdx : 0] ?? 0.04);
    omegaDiag.push(Math.max(viewVariance, 1e-8));
  }

  // Omega = diagonal matrix
  const Omega: number[][] = Array.from({ length: k }, (_, i) =>
    Array.from({ length: k }, (__, j) => (i === j ? omegaDiag[i] : 0))
  );

  // tau * Sigma
  const tauSigma = matScale(covMatrix, tau);
  const tauSigmaInv = matInverse(tauSigma);

  // P' * Omega^-1 * P
  const OmegaInv = matInverse(Omega);
  const Pt = matTranspose(P);
  const PtOmegaInv = matMul(Pt, OmegaInv);
  const PtOmegaInvP = matMul(PtOmegaInv, P);

  // Left side: inv(tau*Sigma^-1 + P'*Omega^-1*P)
  const leftInv = matAdd(tauSigmaInv, PtOmegaInvP);
  const left = matInverse(leftInv);

  // Right side: tau*Sigma^-1 * Pi + P'*Omega^-1 * Q
  const rightA = colToVec(matMul(tauSigmaInv, vecToCol(pi)));
  const rightB = colToVec(matMul(PtOmegaInv, vecToCol(Q)));
  const rightVec = rightA.map((v, i) => v + rightB[i]);

  // Posterior mean
  const posteriorMean = colToVec(matMul(left, vecToCol(rightVec)));

  // Posterior weights: inv(riskAversion * Sigma) * posteriorMean
  const sigmaScaled = matScale(covMatrix, riskAversion);
  const sigmaScaledInv = matInverse(sigmaScaled);
  const rawWeights = colToVec(matMul(sigmaScaledInv, vecToCol(posteriorMean)));

  // Normalize weights to sum to 1 (long-only constraint approximation)
  const sumW = rawWeights.reduce((s, w) => s + Math.max(0, w), 0);
  const normalizedWeights = rawWeights.map((w) =>
    sumW > 0 ? Math.max(0, w) / sumW : 1 / n
  );

  const weights: Record<string, number> = {};
  tickers.forEach((t, i) => {
    weights[t] = Math.round(normalizedWeights[i] * 10000) / 10000;
  });

  const expRet = normalizedWeights.reduce(
    (s, w, i) => s + w * posteriorMean[i],
    0
  );
  const risk = computePortfolioRisk(normalizedWeights, covMatrix);

  return {
    weights,
    expectedReturn: Math.round(expRet * 10000) / 10000,
    risk: Math.round(risk * 10000) / 10000,
    sharpe: risk > 0 ? Math.round((expRet / risk) * 100) / 100 : 0,
  };
}

function computePortfolioRisk(weights: number[], cov: number[][]): number {
  let variance = 0;
  for (let i = 0; i < weights.length; i++) {
    for (let j = 0; j < weights.length; j++) {
      variance += weights[i] * weights[j] * (cov[i]?.[j] ?? 0);
    }
  }
  return Math.sqrt(Math.max(0, variance));
}

// --- Risk Budgeting Optimizer ---

export interface RiskBudgetResult {
  weights: Record<string, number>;
  riskContributions: Record<string, number>;
  totalRisk: number;
}

/**
 * Risk budgeting (risk parity) optimizer.
 * Finds weights such that each asset contributes equally to portfolio risk.
 *
 * Uses iterative algorithm:
 *   w_i = budget_i / (marginalRisk_i * totalRisk)
 *   then normalize
 */
export function riskBudgetOptimize(
  covMatrix: number[][],
  tickers: string[],
  riskBudgets?: Record<string, number>
): RiskBudgetResult {
  const n = tickers.length;

  // Default: equal risk budget
  const budgets = tickers.map((t) =>
    riskBudgets?.[t] !== undefined ? riskBudgets[t] : 1 / n
  );

  // Normalize budgets
  const budgetSum = budgets.reduce((s, b) => s + b, 0);
  const normBudgets = budgets.map((b) => b / budgetSum);

  // Start with equal weights
  let weights = new Array(n).fill(1 / n);

  // Iterative optimization (50 iterations)
  for (let iter = 0; iter < 50; iter++) {
    const marginalRisk = computeMarginalRisk(weights, covMatrix);
    const totalRisk = computePortfolioRisk(weights, covMatrix);

    if (totalRisk < 1e-12) break;

    const newWeights = normBudgets.map((b, i) =>
      marginalRisk[i] > 1e-12 ? b / (marginalRisk[i] * totalRisk) : 1 / n
    );

    // Normalize
    const sumW = newWeights.reduce((s, w) => s + w, 0);
    weights = newWeights.map((w) => (sumW > 0 ? w / sumW : 1 / n));
  }

  const totalRisk = computePortfolioRisk(weights, covMatrix);
  const marginalRisk = computeMarginalRisk(weights, covMatrix);

  const result: RiskBudgetResult = {
    weights: {},
    riskContributions: {},
    totalRisk: Math.round(totalRisk * 10000) / 10000,
  };

  tickers.forEach((t, i) => {
    result.weights[t] = Math.round(weights[i] * 10000) / 10000;
    result.riskContributions[t] =
      totalRisk > 0
        ? Math.round(((weights[i] * marginalRisk[i]) / totalRisk) * 10000) / 10000
        : 0;
  });

  return result;
}

function computeMarginalRisk(weights: number[], cov: number[][]): number[] {
  const n = weights.length;
  const totalRisk = computePortfolioRisk(weights, cov);
  if (totalRisk < 1e-12) return new Array(n).fill(0);

  const marginal: number[] = [];
  for (let i = 0; i < n; i++) {
    let covContrib = 0;
    for (let j = 0; j < n; j++) {
      covContrib += weights[j] * (cov[i]?.[j] ?? 0);
    }
    marginal.push(covContrib / totalRisk);
  }
  return marginal;
}
