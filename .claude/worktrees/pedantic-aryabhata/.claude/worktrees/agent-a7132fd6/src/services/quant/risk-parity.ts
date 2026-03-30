// ---------------------------------------------------------------------------
// Risk Parity Portfolio Construction — Equal Risk Contribution Weighting
// ---------------------------------------------------------------------------

export interface RiskParityResult {
  weights: Record<string, number>;
  riskContributions: Record<string, number>;
  portfolioVol: number;
  equalRiskCheck: boolean;
  explanation: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function matMul(a: number[][], b: number[][]): number[][] {
  const rows = a.length;
  const cols = b[0].length;
  const inner = b.length;
  const result: number[][] = Array.from({ length: rows }, () =>
    new Array(cols).fill(0),
  );
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let s = 0;
      for (let k = 0; k < inner; k++) {
        s += a[i][k] * b[k][j];
      }
      result[i][j] = s;
    }
  }
  return result;
}

function portfolioVariance(
  weights: number[],
  covMatrix: number[][],
): number {
  const n = weights.length;
  let variance = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      variance += weights[i] * weights[j] * covMatrix[i][j];
    }
  }
  return variance;
}

function normalizeWeights(w: number[]): number[] {
  const sum = w.reduce((s, v) => s + v, 0);
  if (sum === 0) return w.map(() => 1 / w.length);
  return w.map((v) => v / sum);
}

// ─── Main ────────────────────────────────────────────────────────────────────

/**
 * Risk parity portfolio construction.
 *
 * Starts with inverse-volatility weights, then iteratively adjusts
 * to equalize marginal risk contributions across all assets.
 *
 * @param tickers - Asset ticker symbols
 * @param volatilities - Annual volatility per ticker (decimal, e.g. 0.25 = 25%)
 * @param correlationMatrix - NxN correlation matrix (diagonal = 1)
 */
export function calculateRiskParity(
  tickers: string[],
  volatilities: Record<string, number>,
  correlationMatrix: number[][],
): RiskParityResult {
  const n = tickers.length;

  if (n === 0) {
    return {
      weights: {},
      riskContributions: {},
      portfolioVol: 0,
      equalRiskCheck: true,
      explanation: "No assets provided.",
    };
  }

  if (n === 1) {
    const t = tickers[0];
    return {
      weights: { [t]: 1 },
      riskContributions: { [t]: 1 },
      portfolioVol: volatilities[t] ?? 0,
      equalRiskCheck: true,
      explanation: `Single asset portfolio: 100% ${t}.`,
    };
  }

  // Build covariance matrix from volatilities and correlations
  const vols = tickers.map((t) => volatilities[t] ?? 0.2);
  const covMatrix: number[][] = Array.from({ length: n }, () =>
    new Array(n).fill(0),
  );
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const corr =
        i < correlationMatrix.length && j < correlationMatrix[i].length
          ? correlationMatrix[i][j]
          : i === j
            ? 1
            : 0.5;
      covMatrix[i][j] = vols[i] * vols[j] * corr;
    }
  }

  // Step 1: Inverse volatility starting weights
  const invVols = vols.map((v) => (v > 0 ? 1 / v : 1));
  let weights = normalizeWeights(invVols);

  // Step 2: Iterative risk parity optimization (simplified gradient descent)
  const maxIter = 200;
  const lr = 0.1;

  for (let iter = 0; iter < maxIter; iter++) {
    const portVar = portfolioVariance(weights, covMatrix);
    const portVol = Math.sqrt(Math.max(portVar, 1e-12));

    // Marginal risk contribution for each asset: MRC_i = (Sigma * w)_i / portVol
    const sigmaW: number[] = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        sigmaW[i] += covMatrix[i][j] * weights[j];
      }
    }

    // Risk contribution: RC_i = w_i * MRC_i / portVol
    const rc: number[] = new Array(n);
    let totalRC = 0;
    for (let i = 0; i < n; i++) {
      rc[i] = weights[i] * sigmaW[i] / portVol;
      totalRC += rc[i];
    }

    // Normalize risk contributions to fractions
    const rcFrac = totalRC > 0 ? rc.map((r) => r / totalRC) : rc.map(() => 1 / n);

    // Target: equal risk contribution = 1/n each
    const targetRC = 1 / n;

    // Gradient: adjust weights to reduce deviation from target
    const newWeights = new Array(n);
    let maxDeviation = 0;
    for (let i = 0; i < n; i++) {
      const deviation = rcFrac[i] - targetRC;
      maxDeviation = Math.max(maxDeviation, Math.abs(deviation));
      // Reduce weight of over-contributing assets, increase under-contributing
      newWeights[i] = Math.max(0.001, weights[i] * (1 - lr * deviation * n));
    }

    weights = normalizeWeights(newWeights);

    // Early convergence check
    if (maxDeviation < 0.001) break;
  }

  // Calculate final metrics
  const finalVar = portfolioVariance(weights, covMatrix);
  const finalVol = Math.sqrt(Math.max(finalVar, 1e-12));

  // Final risk contributions
  const sigmaW: number[] = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      sigmaW[i] += covMatrix[i][j] * weights[j];
    }
  }

  const rcFinal: number[] = new Array(n);
  let totalRCFinal = 0;
  for (let i = 0; i < n; i++) {
    rcFinal[i] = weights[i] * sigmaW[i] / finalVol;
    totalRCFinal += rcFinal[i];
  }

  const rcFracFinal =
    totalRCFinal > 0
      ? rcFinal.map((r) => r / totalRCFinal)
      : rcFinal.map(() => 1 / n);

  // Build result maps
  const weightsMap: Record<string, number> = {};
  const rcMap: Record<string, number> = {};
  const targetRC = 1 / n;
  let allWithinTolerance = true;

  for (let i = 0; i < n; i++) {
    weightsMap[tickers[i]] = Math.round(weights[i] * 10000) / 10000;
    rcMap[tickers[i]] = Math.round(rcFracFinal[i] * 10000) / 10000;
    if (Math.abs(rcFracFinal[i] - targetRC) > 0.02) {
      allWithinTolerance = false;
    }
  }

  // Build explanation
  const sorted = tickers
    .map((t, i) => ({ ticker: t, weight: weights[i], rc: rcFracFinal[i] }))
    .sort((a, b) => b.weight - a.weight);

  const topAlloc = sorted
    .slice(0, 3)
    .map(
      (s) =>
        `${s.ticker}: ${(s.weight * 100).toFixed(1)}% weight, ${(s.rc * 100).toFixed(1)}% risk`,
    )
    .join("; ");

  let explanation =
    `Risk parity portfolio with ${(finalVol * 100).toFixed(1)}% annualized volatility. ` +
    `Top allocations: ${topAlloc}. `;

  if (allWithinTolerance) {
    explanation +=
      "All risk contributions are within 2% of equal — the portfolio is well-balanced.";
  } else {
    explanation +=
      "Some risk contributions deviate from equal. This can occur when correlations make perfect equalization infeasible.";
  }

  return {
    weights: weightsMap,
    riskContributions: rcMap,
    portfolioVol: Math.round(finalVol * 10000) / 10000,
    equalRiskCheck: allWithinTolerance,
    explanation,
  };
}
