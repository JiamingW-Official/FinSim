import type { OptionType, Greeks } from "@/types/options";
import { normalCDF, normalPDF } from "./black-scholes";

/**
 * Calculate all Greeks (first + second order) for a European option
 * @param S Spot price
 * @param K Strike price
 * @param T Time to expiry (years)
 * @param r Risk-free rate
 * @param sigma Volatility
 * @param type 'call' or 'put'
 */
export function calculateGreeks(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  type: OptionType,
): Greeks {
  const safeT = Math.max(T, 0.001);
  const sqrtT = Math.sqrt(safeT);
  const d1 =
    (Math.log(S / K) + (r + (sigma * sigma) / 2) * safeT) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;
  const nd1 = normalPDF(d1);
  const Nd1 = normalCDF(d1);
  const Nd2 = normalCDF(d2);

  // First-order Greeks
  const delta = type === "call" ? Nd1 : Nd1 - 1;
  const gamma = nd1 / (S * sigma * sqrtT);

  const thetaCall =
    (-(S * nd1 * sigma) / (2 * sqrtT) -
      r * K * Math.exp(-r * safeT) * Nd2) /
    365;
  const thetaPut =
    (-(S * nd1 * sigma) / (2 * sqrtT) +
      r * K * Math.exp(-r * safeT) * normalCDF(-d2)) /
    365;
  const theta = type === "call" ? thetaCall : thetaPut;

  const vega = (S * nd1 * sqrtT) / 100;

  const rho =
    type === "call"
      ? (K * safeT * Math.exp(-r * safeT) * Nd2) / 100
      : (-K * safeT * Math.exp(-r * safeT) * normalCDF(-d2)) / 100;

  // Second-order Greeks
  const vanna = (-nd1 * d2) / sigma;
  const charm =
    (-nd1 * (2 * r * safeT - d2 * sigma * sqrtT)) /
    (2 * safeT * sigma * sqrtT);
  const vomma = (vega * d1 * d2) / sigma;
  const speed = (-gamma / S) * (d1 / (sigma * sqrtT) + 1);

  return { delta, gamma, theta, vega, rho, vanna, charm, vomma, speed };
}
