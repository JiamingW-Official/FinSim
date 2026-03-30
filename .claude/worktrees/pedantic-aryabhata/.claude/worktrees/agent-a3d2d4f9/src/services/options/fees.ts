export interface OptionFeeResult {
  commission: number;
  totalCost: number;
}

/**
 * Calculate options trading fees
 * @param totalContracts Total number of contracts in the trade
 * @returns Commission and total cost
 */
export function calculateOptionFees(
  totalContracts: number,
): OptionFeeResult {
  const commission = Math.max(1.0, totalContracts * 0.65);
  return { commission, totalCost: commission };
}
