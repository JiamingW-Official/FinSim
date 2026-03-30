export interface DividendProjection {
  year: number;
  shares: number;
  annualDividend: number;
  totalValue: number;
  yieldOnCost: number;
  cumulativeDividends: number;
}

export interface DRIPResult {
  projections: DividendProjection[];
  totalDividendsReceived: number;
  finalValue: number;
  finalYieldOnCost: number;
  effectiveCAGR: number;
}

export function simulateDRIP(
  initialInvestment: number,
  sharePrice: number,
  annualDividend: number,
  dividendGrowthRate: number,
  priceGrowthRate: number,
  years: number,
  monthlyContribution: number = 0,
): DRIPResult {
  const projections: DividendProjection[] = [];
  const originalCostBasis = initialInvestment;

  let currentShares = initialInvestment / sharePrice;
  let currentPrice = sharePrice;
  let currentDividend = annualDividend;
  let totalCostBasis = initialInvestment;
  let cumulativeDividends = 0;

  for (let year = 1; year <= years; year++) {
    // Apply monthly contributions throughout the year
    if (monthlyContribution > 0) {
      for (let month = 0; month < 12; month++) {
        // Price grows gradually through the year
        const monthlyPriceGrowth = Math.pow(1 + priceGrowthRate, 1 / 12);
        currentPrice *= monthlyPriceGrowth;
        const newShares = monthlyContribution / currentPrice;
        currentShares += newShares;
        totalCostBasis += monthlyContribution;
      }
    } else {
      // Price grows at end of year if no monthly contributions
      currentPrice *= 1 + priceGrowthRate;
    }

    // Grow dividend per share
    currentDividend *= 1 + dividendGrowthRate;

    // Calculate annual dividend income
    const annualDividendIncome = currentShares * currentDividend;
    cumulativeDividends += annualDividendIncome;

    // Reinvest dividends (DRIP) — buy more shares at current price
    const dripShares = annualDividendIncome / currentPrice;
    currentShares += dripShares;

    // Calculate portfolio value
    const totalValue = currentShares * currentPrice;

    // Yield on original cost
    const yieldOnCost =
      originalCostBasis > 0
        ? (annualDividendIncome / originalCostBasis) * 100
        : 0;

    projections.push({
      year,
      shares: Math.round(currentShares * 1000) / 1000,
      annualDividend: Math.round(annualDividendIncome * 100) / 100,
      totalValue: Math.round(totalValue * 100) / 100,
      yieldOnCost: Math.round(yieldOnCost * 100) / 100,
      cumulativeDividends: Math.round(cumulativeDividends * 100) / 100,
    });
  }

  const finalValue =
    projections.length > 0
      ? projections[projections.length - 1].totalValue
      : initialInvestment;

  const finalYieldOnCost =
    projections.length > 0
      ? projections[projections.length - 1].yieldOnCost
      : 0;

  // Calculate CAGR: (FV / PV)^(1/n) - 1
  // PV includes all contributions
  const totalInvested =
    initialInvestment + monthlyContribution * 12 * years;
  const effectiveCAGR =
    totalInvested > 0 && years > 0
      ? (Math.pow(finalValue / totalInvested, 1 / years) - 1) * 100
      : 0;

  return {
    projections,
    totalDividendsReceived: Math.round(cumulativeDividends * 100) / 100,
    finalValue: Math.round(finalValue * 100) / 100,
    finalYieldOnCost: Math.round(finalYieldOnCost * 100) / 100,
    effectiveCAGR: Math.round(effectiveCAGR * 100) / 100,
  };
}
