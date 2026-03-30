export interface ImpliedMove {
  ticker: string;
  currentPrice: number;
  impliedMovePercent: number;
  impliedMoveAbsolute: number;
  upperBound: number;
  lowerBound: number;
  daysToExpiry: number;
  iv: number;
  explanation: string;
}

/**
 * Calculate options-implied expected move.
 *
 * Formula: Expected Move = Price * IV * sqrt(DTE / 365)
 *
 * This represents approximately 1 standard deviation move
 * that the options market is pricing in over the given time period.
 */
export function calculateImpliedMove(
  ticker: string,
  currentPrice: number,
  iv: number, // implied volatility as decimal (e.g. 0.30 for 30%)
  daysToExpiry: number,
): ImpliedMove {
  const timeComponent = Math.sqrt(daysToExpiry / 365);
  const impliedMoveAbsolute = currentPrice * iv * timeComponent;
  const impliedMovePercent = iv * timeComponent * 100;
  const upperBound = currentPrice + impliedMoveAbsolute;
  const lowerBound = currentPrice - impliedMoveAbsolute;

  const ivPct = (iv * 100).toFixed(1);
  const movePct = impliedMovePercent.toFixed(1);
  const moveAbs = impliedMoveAbsolute.toFixed(2);

  let explanation: string;
  if (daysToExpiry <= 7) {
    explanation =
      `Options are pricing in a +/-$${moveAbs} (${movePct}%) move for ${ticker} over the next ${daysToExpiry} day${daysToExpiry === 1 ? "" : "s"}, ` +
      `based on ${ivPct}% implied volatility. ` +
      `This means the market expects ${ticker} to trade between $${lowerBound.toFixed(2)} and $${upperBound.toFixed(2)} with ~68% probability (1 standard deviation).`;
  } else if (daysToExpiry <= 30) {
    explanation =
      `With ${ivPct}% IV and ${daysToExpiry} days to expiry, the options market implies a +/-${movePct}% expected move for ${ticker}. ` +
      `The 1-sigma range is $${lowerBound.toFixed(2)} to $${upperBound.toFixed(2)}. ` +
      `Straddle or strangle sellers collect premium by betting the stock stays within this range.`;
  } else {
    explanation =
      `Over ${daysToExpiry} days, ${ticker}'s ${ivPct}% IV implies a +/-${movePct}% expected move ($${moveAbs}). ` +
      `Expected range: $${lowerBound.toFixed(2)} to $${upperBound.toFixed(2)}. ` +
      `For longer durations, consider that IV tends to overestimate actual moves, making options slightly expensive on average.`;
  }

  return {
    ticker,
    currentPrice,
    impliedMovePercent,
    impliedMoveAbsolute,
    upperBound,
    lowerBound,
    daysToExpiry,
    iv,
    explanation,
  };
}
