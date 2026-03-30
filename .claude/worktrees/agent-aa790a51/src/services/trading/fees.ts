/**
 * Fee calculation facade.
 *
 * Previously this module contained the entire slippage + commission model.
 * Now it delegates to the execution-engine and reads proMode from the
 * trading-preferences store so all call-sites remain unchanged.
 */

import {
  simulateExecution,
  computeCommission,
  estimateCommission,
} from "./execution-engine";

export type { InstrumentType } from "./execution-engine";
export { computeCommission, estimateCommission };

export interface FeeResult {
  executionPrice: number;
  slippageAmount: number;
  slippagePercent: number;
  commission: number;
  totalCost: number;
}

function getProMode(): boolean {
  try {
    // Lazy-read from persisted zustand store without creating a React subscription
    const raw = localStorage.getItem("alpha-deck-trading-prefs");
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { state?: { proMode?: boolean } };
    return parsed?.state?.proMode ?? false;
  } catch {
    return false;
  }
}

export function calculateSlippage(
  price: number,
  side: "buy" | "sell",
): { executionPrice: number; slippageAmount: number; slippagePercent: number } {
  const result = simulateExecution({
    price,
    quantity: 1,
    side,
    orderType: "market",
    proMode: false, // commission is separate
  });
  return {
    executionPrice: result.actualFillPrice,
    slippageAmount: result.slippageAmount,
    slippagePercent: result.slippagePercent,
  };
}

export function calculateCommission(quantity: number): number {
  const proMode = getProMode();
  return computeCommission(quantity, proMode, "stock");
}

export function calculateFees(
  price: number,
  quantity: number,
  side: "buy" | "sell",
): FeeResult {
  const proMode = getProMode();

  const result = simulateExecution({
    price,
    quantity,
    side,
    orderType: "market",
    proMode,
    instrumentType: "stock",
  });

  const commission = result.commissionAmount;
  const totalCost = quantity * result.actualFillPrice + commission;

  return {
    executionPrice: result.actualFillPrice,
    slippageAmount: result.slippageAmount,
    slippagePercent: result.slippagePercent,
    commission,
    totalCost,
  };
}

/**
 * Calculate fees for a limit/stop fill at a known trigger price.
 * No slippage is applied — the investor specified the price.
 */
export function calculateLimitFees(
  triggerPrice: number,
  quantity: number,
  side: "buy" | "sell",
): FeeResult {
  const proMode = getProMode();
  const commission = computeCommission(quantity, proMode, "stock");

  return {
    executionPrice: triggerPrice,
    slippageAmount: 0,
    slippagePercent: 0,
    commission,
    totalCost: quantity * triggerPrice + commission,
  };
}
