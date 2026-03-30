export interface TaxHarvestingOpportunity {
  ticker: string;
  currentPrice: number;
  costBasis: number;
  unrealizedLoss: number;
  taxSavings: number;
  washSaleRisk: boolean;
  recommendation: string;
  educationalNote: string;
}

export function findTaxHarvestingOpportunities(
  positions: {
    ticker: string;
    quantity: number;
    avgCost: number;
    currentPrice: number;
  }[],
  taxRate: number = 0.37,
): TaxHarvestingOpportunity[] {
  const opportunities: TaxHarvestingOpportunity[] = [];

  for (const pos of positions) {
    const totalCostBasis = pos.avgCost * pos.quantity;
    const currentValue = pos.currentPrice * pos.quantity;
    const unrealizedPnL = currentValue - totalCostBasis;

    // Only consider positions with unrealized losses
    if (unrealizedPnL >= 0) continue;

    const unrealizedLoss = Math.abs(unrealizedPnL);
    const taxSavings = unrealizedLoss * taxRate;
    const lossPct = (unrealizedPnL / totalCostBasis) * 100;

    // Determine wash sale risk (simplified — flag if loss is small,
    // suggesting recent purchase near current levels)
    const washSaleRisk = Math.abs(lossPct) < 5;

    // Generate recommendation based on loss magnitude
    let recommendation: string;
    if (lossPct < -20) {
      recommendation =
        "Strong harvesting candidate. Significant loss offers meaningful tax offset. Consider selling and replacing with a correlated but non-identical ETF.";
    } else if (lossPct < -10) {
      recommendation =
        "Good harvesting candidate. Moderate loss provides tax benefit. Ensure you have a replacement position to maintain market exposure.";
    } else if (lossPct < -5) {
      recommendation =
        "Marginal candidate. Small loss may not justify transaction costs. Consider waiting for a larger loss or year-end.";
    } else {
      recommendation =
        "Minimal benefit. Loss is too small relative to trading costs. Monitor for further decline.";
    }

    // Educational note varies by situation
    let educationalNote: string;
    if (washSaleRisk) {
      educationalNote =
        "Wash Sale Rule: If you repurchase a substantially identical security within 30 days before or after selling at a loss, the loss is disallowed for tax purposes. Use a similar but non-identical replacement (e.g., swap SPY for VOO).";
    } else if (lossPct < -20) {
      educationalNote =
        "Tax loss harvesting lets you offset capital gains with realized losses. Up to $3,000 in net losses can also offset ordinary income annually. Unused losses carry forward indefinitely.";
    } else {
      educationalNote =
        "Even small harvested losses compound over time. The key is maintaining market exposure by reinvesting in a correlated asset while avoiding the 30-day wash sale window.";
    }

    opportunities.push({
      ticker: pos.ticker,
      currentPrice: pos.currentPrice,
      costBasis: Math.round(totalCostBasis * 100) / 100,
      unrealizedLoss: Math.round(unrealizedLoss * 100) / 100,
      taxSavings: Math.round(taxSavings * 100) / 100,
      washSaleRisk,
      recommendation,
      educationalNote,
    });
  }

  // Sort by tax savings descending (best opportunities first)
  opportunities.sort((a, b) => b.taxSavings - a.taxSavings);

  return opportunities;
}
