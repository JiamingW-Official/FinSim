/**
 * Execution engine — simulates realistic trade execution with slippage and commissions.
 */

export type InstrumentType = "stock" | "option" | "crypto" | "future";
export type OrderType = "market" | "limit" | "stop" | "stop_limit";

export interface ExecutionParams {
  price: number;
  quantity: number;
  side: "buy" | "sell";
  orderType?: OrderType;
  proMode?: boolean;
  instrumentType?: InstrumentType;
}

export interface ExecutionResult {
  actualFillPrice: number;
  slippageAmount: number;
  slippagePercent: number;
  commissionAmount: number;
  totalCost: number;
}

function mulberry32(seed: number): () => number {
  let s = seed;
  return () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function simulateExecution(params: ExecutionParams): ExecutionResult {
  const { price, quantity, side, orderType = "market", proMode = false, instrumentType = "stock" } = params;
  const seed = (Math.floor(price * 1000) ^ quantity ^ Date.now()) >>> 0;
  const rng = mulberry32(seed);

  if (orderType === "limit" || orderType === "stop_limit") {
    const commission = proMode ? computeCommission(quantity, proMode, instrumentType) : 0;
    return { actualFillPrice: price, slippageAmount: 0, slippagePercent: 0, commissionAmount: commission, totalCost: quantity * price + commission };
  }

  const baseSlippagePct = instrumentType === "crypto" ? 0.002 : instrumentType === "option" ? 0.001 : 0.0005;
  const slippagePct = baseSlippagePct + rng() * baseSlippagePct;
  const slippageAmount = price * slippagePct;
  const actualFillPrice = side === "buy" ? price + slippageAmount : price - slippageAmount;
  const slippagePercent = slippagePct * 100;
  const commissionAmount = proMode ? computeCommission(quantity, proMode, instrumentType) : 0;
  return { actualFillPrice, slippageAmount, slippagePercent, commissionAmount, totalCost: quantity * actualFillPrice + commissionAmount };
}

export function computeCommission(quantity: number, proMode: boolean, instrument: InstrumentType = "stock"): number {
  if (!proMode) return 0;
  switch (instrument) {
    case "option":  return quantity * 0.65;
    case "crypto":  return quantity * 0.001;
    case "stock":   return quantity * 0.005;
    default:        return 0;
  }
}

export function estimateCommission(quantity: number, instrument: InstrumentType = "stock"): number {
  return computeCommission(quantity, true, instrument);
}
