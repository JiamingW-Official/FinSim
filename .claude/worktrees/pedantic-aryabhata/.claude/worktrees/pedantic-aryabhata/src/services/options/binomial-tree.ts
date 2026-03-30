import type { OptionType } from "@/types/options";

/**
 * Cox-Ross-Rubinstein binomial tree model
 * Supports both American and European exercise
 * @param S Spot price
 * @param K Strike price
 * @param T Time to expiry (years)
 * @param r Risk-free rate
 * @param sigma Volatility
 * @param type 'call' or 'put'
 * @param steps Number of tree steps (default 100)
 * @param american Whether to allow early exercise (default true)
 */
export function binomialTree(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  type: OptionType,
  steps: number = 100,
  american: boolean = true,
): number {
  if (T <= 0) return Math.max(type === "call" ? S - K : K - S, 0);

  const dt = T / steps;
  const u = Math.exp(sigma * Math.sqrt(dt));
  const d = 1 / u;
  const p = (Math.exp(r * dt) - d) / (u - d);
  const disc = Math.exp(-r * dt);

  // Build terminal node values
  const prices: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const spotAtNode = S * Math.pow(u, steps - i) * Math.pow(d, i);
    prices[i] =
      type === "call"
        ? Math.max(spotAtNode - K, 0)
        : Math.max(K - spotAtNode, 0);
  }

  // Backward induction
  for (let step = steps - 1; step >= 0; step--) {
    for (let i = 0; i <= step; i++) {
      const hold = disc * (p * prices[i] + (1 - p) * prices[i + 1]);
      if (american) {
        const spotAtNode = S * Math.pow(u, step - i) * Math.pow(d, i);
        const exercise =
          type === "call"
            ? Math.max(spotAtNode - K, 0)
            : Math.max(K - spotAtNode, 0);
        prices[i] = Math.max(hold, exercise);
      } else {
        prices[i] = hold;
      }
    }
  }

  return prices[0];
}
