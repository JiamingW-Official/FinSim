// Black-Scholes Option Pricing Model
// Full analytical solution with Greeks and implied volatility solver

export interface BSResult {
  price: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

export function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

// Abramowitz & Stegun approximation (error < 7.5e-8)
export function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1 / (1 + p * absX);
  const y =
    1 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) *
      t *
      Math.exp(-absX * absX / 2);
  return 0.5 * (1 + sign * y);
}

// Beasley-Springer-Moro inverse normal CDF
export function normalInvCDF(p: number): number {
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

/**
 * Black-Scholes analytical option pricing with full Greeks
 * @param S - Spot price
 * @param K - Strike price
 * @param T - Time to expiration (years)
 * @param r - Risk-free rate (annualized, e.g. 0.05 for 5%)
 * @param sigma - Volatility (annualized, e.g. 0.30 for 30%)
 * @param type - 'call' or 'put'
 */
export function calculateBS(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  type: "call" | "put"
): BSResult {
  // At or past expiration
  if (T <= 0 || sigma <= 0) {
    const intrinsic = type === "call" ? Math.max(S - K, 0) : Math.max(K - S, 0);
    return {
      price: intrinsic,
      delta: type === "call" ? (S > K ? 1 : 0) : (S < K ? -1 : 0),
      gamma: 0,
      theta: 0,
      vega: 0,
      rho: 0,
    };
  }

  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;
  const nd1 = normalCDF(d1);
  const nd2 = normalCDF(d2);
  const nNd1 = normalCDF(-d1);
  const nNd2 = normalCDF(-d2);
  const npd1 = normalPDF(d1);
  const expRT = Math.exp(-r * T);

  if (type === "call") {
    return {
      price: S * nd1 - K * expRT * nd2,
      delta: nd1,
      gamma: npd1 / (S * sigma * sqrtT),
      theta: (-S * npd1 * sigma / (2 * sqrtT) - r * K * expRT * nd2) / 365,
      vega: S * npd1 * sqrtT / 100,
      rho: K * T * expRT * nd2 / 100,
    };
  } else {
    return {
      price: K * expRT * nNd2 - S * nNd1,
      delta: nd1 - 1,
      gamma: npd1 / (S * sigma * sqrtT),
      theta: (-S * npd1 * sigma / (2 * sqrtT) + r * K * expRT * nNd2) / 365,
      vega: S * npd1 * sqrtT / 100,
      rho: -K * T * expRT * nNd2 / 100,
    };
  }
}

/**
 * Newton-Raphson implied volatility solver
 * @param marketPrice - Observed market price
 * @param S - Spot price
 * @param K - Strike price
 * @param T - Time to expiration (years)
 * @param r - Risk-free rate
 * @param type - 'call' or 'put'
 * @returns Implied volatility (annualized)
 */
export function solveIV(
  marketPrice: number,
  S: number,
  K: number,
  T: number,
  r: number,
  type: "call" | "put"
): number {
  let sigma = 0.3; // Initial guess
  const maxIter = 100;
  const tolerance = 1e-6;

  for (let i = 0; i < maxIter; i++) {
    const bs = calculateBS(S, K, T, r, sigma, type);
    const diff = bs.price - marketPrice;
    if (Math.abs(diff) < tolerance) return sigma;

    // Vega in actual units (not /100)
    const vega = bs.vega * 100;
    if (vega < 1e-10) break;

    sigma -= diff / vega;
    sigma = Math.max(0.001, Math.min(5, sigma)); // Clamp to reasonable range
  }

  return sigma;
}

/**
 * Put-Call Parity check: C - P = S - K*e^(-rT)
 */
export function putCallParity(
  callPrice: number,
  putPrice: number,
  S: number,
  K: number,
  T: number,
  r: number
) {
  const lhs = callPrice - putPrice;
  const rhs = S - K * Math.exp(-r * T);
  return {
    callMinusPut: lhs,
    spotMinusPV: rhs,
    difference: Math.abs(lhs - rhs),
    arbitrage: Math.abs(lhs - rhs) > 0.01,
  };
}

/**
 * Calculate option Greeks surface for a range of spots and vols
 */
export function greeksSurface(
  K: number,
  T: number,
  r: number,
  type: "call" | "put",
  spotRange: [number, number],
  volRange: [number, number],
  steps: number = 20
): { spot: number; vol: number; greeks: BSResult }[] {
  const results: { spot: number; vol: number; greeks: BSResult }[] = [];
  const spotStep = (spotRange[1] - spotRange[0]) / steps;
  const volStep = (volRange[1] - volRange[0]) / steps;

  for (let i = 0; i <= steps; i++) {
    for (let j = 0; j <= steps; j++) {
      const spot = spotRange[0] + i * spotStep;
      const vol = volRange[0] + j * volStep;
      results.push({ spot, vol, greeks: calculateBS(spot, K, T, r, vol, type) });
    }
  }
  return results;
}
