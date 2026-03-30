// ---------------------------------------------------------------------------
// Position Sizing Calculators — 5 Methods with Educational Explanations
// ---------------------------------------------------------------------------

export interface PositionSizeResult {
  method: string;
  shares: number;
  dollarAmount: number;
  riskAmount: number;
  percentOfPortfolio: number;
  explanation: string;
}

// ─── Kelly Criterion ─────────────────────────────────────────────────────────

export function kellyPositionSize(
  winRate: number,
  avgWin: number,
  avgLoss: number,
  portfolioValue: number,
  currentPrice: number,
): PositionSizeResult {
  // Kelly fraction: f = (p * b - q) / b
  // where p = win probability, q = loss probability, b = win/loss ratio
  const p = Math.max(0, Math.min(1, winRate));
  const q = 1 - p;
  const b = avgLoss > 0 ? avgWin / avgLoss : 0;

  let kellyFraction = b > 0 ? (p * b - q) / b : 0;
  // Cap at 25% for safety (half-Kelly is common in practice)
  kellyFraction = Math.max(0, Math.min(0.25, kellyFraction));

  const dollarAmount = portfolioValue * kellyFraction;
  const shares = currentPrice > 0 ? Math.floor(dollarAmount / currentPrice) : 0;
  const actualDollar = shares * currentPrice;

  return {
    method: "Kelly Criterion",
    shares,
    dollarAmount: actualDollar,
    riskAmount: actualDollar, // Full position is at risk in Kelly context
    percentOfPortfolio: portfolioValue > 0 ? (actualDollar / portfolioValue) * 100 : 0,
    explanation:
      `The Kelly Criterion calculates the mathematically optimal bet size to maximize ` +
      `long-term growth. With a ${(p * 100).toFixed(0)}% win rate and a ` +
      `${b.toFixed(2)}:1 reward-to-risk ratio, the full Kelly fraction is ` +
      `${(kellyFraction * 100).toFixed(1)}% of your portfolio. ` +
      `In practice, traders often use "half-Kelly" (${(kellyFraction * 50).toFixed(1)}%) ` +
      `to reduce volatility while capturing most of the growth benefit.`,
  };
}

// ─── Fixed Percentage Risk (2% Rule) ─────────────────────────────────────────

export function fixedPercentRisk(
  portfolioValue: number,
  riskPercent: number,
  entryPrice: number,
  stopLoss: number,
): PositionSizeResult {
  const riskPerShare = Math.abs(entryPrice - stopLoss);
  const riskAmount = portfolioValue * (riskPercent / 100);
  const shares = riskPerShare > 0 ? Math.floor(riskAmount / riskPerShare) : 0;
  const dollarAmount = shares * entryPrice;

  return {
    method: "Fixed % Risk",
    shares,
    dollarAmount,
    riskAmount: shares * riskPerShare,
    percentOfPortfolio: portfolioValue > 0 ? (dollarAmount / portfolioValue) * 100 : 0,
    explanation:
      `The fixed percentage risk method limits your loss on any single trade to ` +
      `${riskPercent.toFixed(1)}% of your portfolio ($${riskAmount.toFixed(2)}). ` +
      `With a $${riskPerShare.toFixed(2)} risk per share ` +
      `(entry $${entryPrice.toFixed(2)} - stop $${stopLoss.toFixed(2)}), ` +
      `you can buy ${shares} shares. This is the most widely used position sizing ` +
      `method among professional traders because it ensures no single trade can ` +
      `cause catastrophic loss to your account.`,
  };
}

// ─── ATR-Based Position Sizing ───────────────────────────────────────────────

export function atrPositionSize(
  portfolioValue: number,
  riskPercent: number,
  currentPrice: number,
  atr: number,
  atrMultiple: number = 2,
): PositionSizeResult {
  const stopDistance = atr * atrMultiple;
  const riskAmount = portfolioValue * (riskPercent / 100);
  const shares = stopDistance > 0 ? Math.floor(riskAmount / stopDistance) : 0;
  const dollarAmount = shares * currentPrice;

  return {
    method: "ATR-Based",
    shares,
    dollarAmount,
    riskAmount: shares * stopDistance,
    percentOfPortfolio: portfolioValue > 0 ? (dollarAmount / portfolioValue) * 100 : 0,
    explanation:
      `ATR-based sizing uses the Average True Range ($${atr.toFixed(2)}) to set a ` +
      `volatility-adaptive stop loss at ${atrMultiple}x ATR = $${stopDistance.toFixed(2)} ` +
      `from the current price. Risking ${riskPercent.toFixed(1)}% of your portfolio ` +
      `($${riskAmount.toFixed(2)}), you can take ${shares} shares. This method ` +
      `automatically sizes positions smaller for volatile stocks and larger for ` +
      `calm ones, adapting to current market conditions.`,
  };
}

// ─── Volatility-Adjusted ─────────────────────────────────────────────────────

export function volatilityAdjustedSize(
  portfolioValue: number,
  targetVolatility: number,
  assetVolatility: number,
  currentPrice: number,
): PositionSizeResult {
  // Weight = target vol / asset vol (capped at 100%)
  const weight = assetVolatility > 0
    ? Math.min(1, targetVolatility / assetVolatility)
    : 0;
  const dollarAmount = portfolioValue * weight;
  const shares = currentPrice > 0 ? Math.floor(dollarAmount / currentPrice) : 0;
  const actualDollar = shares * currentPrice;
  // Risk estimated as 2-sigma daily loss
  const dailyRisk = actualDollar * assetVolatility / Math.sqrt(252);

  return {
    method: "Volatility-Adjusted",
    shares,
    dollarAmount: actualDollar,
    riskAmount: dailyRisk * 2,
    percentOfPortfolio: portfolioValue > 0 ? (actualDollar / portfolioValue) * 100 : 0,
    explanation:
      `Volatility targeting sizes positions so each contributes equally to portfolio ` +
      `risk. With a target volatility of ${(targetVolatility * 100).toFixed(1)}% and ` +
      `the asset's annualized volatility of ${(assetVolatility * 100).toFixed(1)}%, ` +
      `the position weight is ${(weight * 100).toFixed(1)}%. High-volatility assets ` +
      `get smaller allocations and low-volatility assets get larger ones, equalizing ` +
      `risk contribution across your portfolio.`,
  };
}

// ─── Equal Risk Contribution ─────────────────────────────────────────────────

export function equalRiskContribution(
  portfolioValue: number,
  numPositions: number,
  currentPrice: number,
): PositionSizeResult {
  const safeNum = Math.max(1, numPositions);
  const allocation = portfolioValue / safeNum;
  const shares = currentPrice > 0 ? Math.floor(allocation / currentPrice) : 0;
  const actualDollar = shares * currentPrice;
  const riskAmount = actualDollar * 0.02; // Assume 2% max loss per position

  return {
    method: "Equal Risk Contribution",
    shares,
    dollarAmount: actualDollar,
    riskAmount,
    percentOfPortfolio: portfolioValue > 0 ? (actualDollar / portfolioValue) * 100 : 0,
    explanation:
      `Equal risk contribution divides your portfolio equally across ${safeNum} ` +
      `positions, allocating $${allocation.toFixed(2)} each ` +
      `(${(100 / safeNum).toFixed(1)}% per position). This is the simplest ` +
      `diversification method and works well when you don't have strong conviction ` +
      `differences between positions. The key principle: no single position should ` +
      `dominate your portfolio risk.`,
  };
}
