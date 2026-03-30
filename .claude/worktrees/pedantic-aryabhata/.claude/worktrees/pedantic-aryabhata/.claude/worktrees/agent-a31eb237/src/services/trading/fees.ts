export interface FeeResult {
  executionPrice: number;
  slippageAmount: number;
  slippagePercent: number;
  commission: number;
  totalCost: number;
}

const SLIPPAGE_MAX_PERCENT = 0.0005; // 0.05%
const COMMISSION_PER_SHARE = 0.01; // $0.01/share
const MIN_COMMISSION = 1.0; // $1 minimum

export function calculateSlippage(
  price: number,
  side: "buy" | "sell",
): { executionPrice: number; slippageAmount: number; slippagePercent: number } {
  const slippagePct = Math.random() * SLIPPAGE_MAX_PERCENT;
  const direction = side === "buy" ? 1 : -1;
  const slippageAmount = price * slippagePct * direction;
  const executionPrice = price + slippageAmount;

  return {
    executionPrice: Math.round(executionPrice * 100) / 100,
    slippageAmount: Math.round(Math.abs(slippageAmount) * 100) / 100,
    slippagePercent: slippagePct * 100,
  };
}

export function calculateCommission(quantity: number): number {
  return Math.max(MIN_COMMISSION, quantity * COMMISSION_PER_SHARE);
}

export function calculateFees(
  price: number,
  quantity: number,
  side: "buy" | "sell",
): FeeResult {
  const slippage = calculateSlippage(price, side);
  const commission = calculateCommission(quantity);
  const totalCost = quantity * slippage.executionPrice + commission;

  return {
    executionPrice: slippage.executionPrice,
    slippageAmount: slippage.slippageAmount,
    slippagePercent: slippage.slippagePercent,
    commission,
    totalCost,
  };
}
