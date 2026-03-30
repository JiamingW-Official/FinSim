export interface RebalanceAction {
  ticker: string;
  currentWeight: number;
  targetWeight: number;
  deviation: number;
  action: "buy" | "sell" | "hold";
  shares: number;
  dollarAmount: number;
}

export interface RebalanceResult {
  actions: RebalanceAction[];
  totalTurnover: number;
  estimatedCost: number;
  needsRebalance: boolean;
  educationalNote: string;
}

export function calculateRebalance(
  currentPositions: { ticker: string; value: number }[],
  targetWeights: Record<string, number>,
  portfolioValue: number,
  threshold: number = 5,
): RebalanceResult {
  const COMMISSION_PER_TRADE = 0;
  const SLIPPAGE_BPS = 5; // 0.05% slippage per trade

  // Calculate current weights
  const totalValue =
    portfolioValue > 0
      ? portfolioValue
      : currentPositions.reduce((s, p) => s + p.value, 0);

  if (totalValue === 0) {
    return {
      actions: [],
      totalTurnover: 0,
      estimatedCost: 0,
      needsRebalance: false,
      educationalNote:
        "No portfolio value to rebalance. Add positions first.",
    };
  }

  const actions: RebalanceAction[] = [];
  let maxDeviation = 0;
  let sumAbsDeviation = 0;

  // Process all tickers from both current positions and targets
  const allTickers = new Set([
    ...currentPositions.map((p) => p.ticker),
    ...Object.keys(targetWeights),
  ]);

  for (const ticker of allTickers) {
    const currentPos = currentPositions.find((p) => p.ticker === ticker);
    const currentValue = currentPos?.value ?? 0;
    const currentWeight = (currentValue / totalValue) * 100;
    const targetWeight = (targetWeights[ticker] ?? 0) * 100; // Convert from decimal to %

    const deviation = currentWeight - targetWeight;
    const absDeviation = Math.abs(deviation);

    if (absDeviation > maxDeviation) {
      maxDeviation = absDeviation;
    }
    sumAbsDeviation += absDeviation;

    const dollarDelta = (targetWeight / 100) * totalValue - currentValue;
    const absDollarDelta = Math.abs(dollarDelta);

    let action: "buy" | "sell" | "hold";
    if (absDeviation < 0.5) {
      action = "hold";
    } else if (dollarDelta > 0) {
      action = "buy";
    } else {
      action = "sell";
    }

    // Estimate shares (approximate, using current value as proxy for price)
    // For display purposes, assume $1 per share as placeholder
    const estimatedSharePrice =
      currentPos && currentPos.value > 0
        ? currentPos.value
        : totalValue * (targetWeight / 100);
    const shares =
      estimatedSharePrice > 0
        ? Math.abs(dollarDelta / (estimatedSharePrice > 100 ? estimatedSharePrice / 10 : 100))
        : 0;

    actions.push({
      ticker,
      currentWeight: Math.round(currentWeight * 100) / 100,
      targetWeight: Math.round(targetWeight * 100) / 100,
      deviation: Math.round(deviation * 100) / 100,
      action,
      shares: Math.round(shares * 10) / 10,
      dollarAmount: Math.round(absDollarDelta * 100) / 100,
    });
  }

  // Sort: sells first, then buys, then holds
  const actionOrder = { sell: 0, buy: 1, hold: 2 };
  actions.sort((a, b) => actionOrder[a.action] - actionOrder[b.action]);

  // Turnover = sum of |current - target| / 2 (as percentage)
  const totalTurnover = Math.round((sumAbsDeviation / 2) * 100) / 100;

  // Estimated cost: commissions + slippage on traded dollar amount
  const tradedAmount = actions
    .filter((a) => a.action !== "hold")
    .reduce((s, a) => s + a.dollarAmount, 0);
  const estimatedCost =
    Math.round(
      (actions.filter((a) => a.action !== "hold").length *
        COMMISSION_PER_TRADE +
        tradedAmount * (SLIPPAGE_BPS / 10000)) *
        100,
    ) / 100;

  const needsRebalance = maxDeviation > threshold;

  // Educational note based on situation
  let educationalNote: string;
  if (!needsRebalance) {
    educationalNote = `Portfolio is within the ${threshold}% deviation threshold. No rebalancing needed. Over-rebalancing increases costs and tax events.`;
  } else if (totalTurnover > 20) {
    educationalNote =
      "High turnover rebalance. Consider implementing gradually to minimize market impact and spread tax events across periods.";
  } else {
    educationalNote = `Rebalancing restores your target allocation and controls risk drift. The ${threshold}% threshold avoids unnecessary trading while keeping allocations on track.`;
  }

  return {
    actions,
    totalTurnover,
    estimatedCost,
    needsRebalance,
    educationalNote,
  };
}
