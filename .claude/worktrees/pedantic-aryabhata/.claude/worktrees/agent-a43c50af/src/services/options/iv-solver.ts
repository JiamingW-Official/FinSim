import type { OptionType } from "@/types/options";
import { blackScholes } from "./black-scholes";
import { calculateGreeks } from "./greeks";

/**
 * Solve for implied volatility using Newton-Raphson iteration
 * @param marketPrice Observed market price of the option
 * @param S Spot price
 * @param K Strike price
 * @param T Time to expiry (years)
 * @param r Risk-free rate
 * @param type 'call' or 'put'
 * @returns Implied volatility as decimal (e.g. 0.35 = 35%)
 */
export function solveIV(
  marketPrice: number,
  S: number,
  K: number,
  T: number,
  r: number,
  type: OptionType,
): number {
  let sigma = 0.3; // initial guess

  for (let i = 0; i < 100; i++) {
    const price = blackScholes(S, K, T, r, sigma, type);
    // vega from calculateGreeks is per 1% IV, multiply by 100 to get actual vega
    const vega = calculateGreeks(S, K, T, r, sigma, type).vega * 100;

    const diff = price - marketPrice;
    if (Math.abs(diff) < 0.001) break;
    if (vega === 0) break;

    sigma -= diff / vega;
    sigma = Math.max(0.01, Math.min(5, sigma)); // clamp range
  }

  return sigma;
}
