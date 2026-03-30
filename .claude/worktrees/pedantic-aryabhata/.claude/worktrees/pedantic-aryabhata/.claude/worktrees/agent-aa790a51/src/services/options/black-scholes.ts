import type { OptionType } from "@/types/options";

// Standard normal distribution CDF (Abramowitz & Stegun approximation)
export function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1 / (1 + (p * absX) / Math.sqrt(2));
  const y =
    1 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) *
      t *
      Math.exp((-x * x) / 2);
  return 0.5 * (1 + sign * y);
}

// Standard normal distribution PDF
export function normalPDF(x: number): number {
  return Math.exp((-x * x) / 2) / Math.sqrt(2 * Math.PI);
}

/**
 * Black-Scholes option pricing
 * @param S Spot price (underlying)
 * @param K Strike price
 * @param T Time to expiry (years)
 * @param r Risk-free rate
 * @param sigma Volatility (IV)
 * @param type 'call' or 'put'
 */
export function blackScholes(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  type: OptionType,
): number {
  // At or past expiry — return intrinsic value
  if (T <= 0) return Math.max(type === "call" ? S - K : K - S, 0);

  const d1 =
    (Math.log(S / K) + (r + (sigma * sigma) / 2) * T) /
    (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  if (type === "call") {
    return S * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2);
  } else {
    return K * Math.exp(-r * T) * normalCDF(-d2) - S * normalCDF(-d1);
  }
}
