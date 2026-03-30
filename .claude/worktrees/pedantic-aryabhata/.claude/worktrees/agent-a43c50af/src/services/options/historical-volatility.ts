/**
 * Calculate annualized historical volatility from close prices
 * @param closes Array of close prices (chronological order)
 * @param period Lookback period (default 30)
 * @returns Annualized volatility as decimal (e.g. 0.35 = 35%)
 */
export function calculateHistoricalVolatility(
  closes: number[],
  period: number = 30,
): number {
  if (closes.length < 2) return 0.3; // fallback

  const window = closes.slice(-Math.min(period + 1, closes.length));
  if (window.length < 2) return 0.3;

  // Calculate log returns
  const logReturns: number[] = [];
  for (let i = 1; i < window.length; i++) {
    if (window[i - 1] > 0) {
      logReturns.push(Math.log(window[i] / window[i - 1]));
    }
  }

  if (logReturns.length < 2) return 0.3;

  // Standard deviation of log returns
  const mean = logReturns.reduce((s, r) => s + r, 0) / logReturns.length;
  const variance =
    logReturns.reduce((s, r) => s + (r - mean) ** 2, 0) /
    (logReturns.length - 1);
  const stdDev = Math.sqrt(variance);

  // Annualize: multiply by sqrt(252 trading days)
  const annualized = stdDev * Math.sqrt(252);

  // Clamp to reasonable range
  return Math.max(0.05, Math.min(2.0, annualized));
}
