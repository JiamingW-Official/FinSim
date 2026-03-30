// ---------------------------------------------------------------------------
// Correlation Matrix — Pearson correlation on daily log returns
// ---------------------------------------------------------------------------

export interface CorrelationMatrix {
  tickers: string[];
  matrix: number[][]; // NxN correlation coefficients (-1 to +1)
}

/**
 * Calculate Pearson correlation between two arrays of equal length.
 */
function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 2) return 0;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
    sumY2 += y[i] * y[i];
  }

  const denom = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY),
  );
  if (denom === 0) return 0;

  return (n * sumXY - sumX * sumY) / denom;
}

/**
 * Convert close prices to log returns.
 */
function logReturns(prices: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] > 0 && prices[i] > 0) {
      returns.push(Math.log(prices[i] / prices[i - 1]));
    }
  }
  return returns;
}

/**
 * Calculate correlation matrix from price histories.
 * Uses Pearson correlation on daily log returns.
 */
export function calculateCorrelationMatrix(
  priceHistories: Record<string, number[]>,
): CorrelationMatrix {
  const tickers = Object.keys(priceHistories);
  const n = tickers.length;

  // Convert all to log returns
  const returnsMap: Record<string, number[]> = {};
  for (const ticker of tickers) {
    returnsMap[ticker] = logReturns(priceHistories[ticker]);
  }

  // Find the minimum shared length (align returns)
  let minLen = Infinity;
  for (const ticker of tickers) {
    if (returnsMap[ticker].length < minLen) {
      minLen = returnsMap[ticker].length;
    }
  }
  if (minLen === Infinity) minLen = 0;

  // Trim all to the same length (use most recent data)
  for (const ticker of tickers) {
    const arr = returnsMap[ticker];
    if (arr.length > minLen) {
      returnsMap[ticker] = arr.slice(arr.length - minLen);
    }
  }

  // Build NxN matrix
  const matrix: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        row.push(1.0);
      } else if (j < i && matrix[j]) {
        // Symmetric — reuse already-computed value
        row.push(matrix[j][i]);
      } else {
        const corr = pearsonCorrelation(
          returnsMap[tickers[i]],
          returnsMap[tickers[j]],
        );
        row.push(parseFloat(corr.toFixed(4)));
      }
    }
    matrix.push(row);
  }

  return { tickers, matrix };
}

// ---------------------------------------------------------------------------
// Default fallback correlation matrix — based on real mid-2024 correlations
// ---------------------------------------------------------------------------
export const DEFAULT_CORRELATIONS: CorrelationMatrix = {
  tickers: ["AAPL", "MSFT", "GOOG", "AMZN", "NVDA", "TSLA", "JPM", "SPY", "QQQ", "META"],
  matrix: [
    //       AAPL  MSFT  GOOG  AMZN  NVDA  TSLA  JPM   SPY   QQQ   META
    /* AAPL */ [1.00, 0.85, 0.80, 0.78, 0.72, 0.45, 0.52, 0.82, 0.88, 0.76],
    /* MSFT */ [0.85, 1.00, 0.82, 0.80, 0.78, 0.42, 0.50, 0.84, 0.90, 0.78],
    /* GOOG */ [0.80, 0.82, 1.00, 0.76, 0.70, 0.40, 0.48, 0.78, 0.85, 0.82],
    /* AMZN */ [0.78, 0.80, 0.76, 1.00, 0.74, 0.48, 0.45, 0.80, 0.86, 0.74],
    /* NVDA */ [0.72, 0.78, 0.70, 0.74, 1.00, 0.50, 0.38, 0.76, 0.90, 0.68],
    /* TSLA */ [0.45, 0.42, 0.40, 0.48, 0.50, 1.00, 0.28, 0.55, 0.58, 0.44],
    /* JPM  */ [0.52, 0.50, 0.48, 0.45, 0.38, 0.28, 1.00, 0.75, 0.55, 0.46],
    /* SPY  */ [0.82, 0.84, 0.78, 0.80, 0.76, 0.55, 0.75, 1.00, 0.95, 0.78],
    /* QQQ  */ [0.88, 0.90, 0.85, 0.86, 0.90, 0.58, 0.55, 0.95, 1.00, 0.84],
    /* META */ [0.76, 0.78, 0.82, 0.74, 0.68, 0.44, 0.46, 0.78, 0.84, 1.00],
  ],
};
