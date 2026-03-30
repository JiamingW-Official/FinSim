/**
 * Realistic trade execution simulation engine.
 *
 * Models slippage, market impact, and commission in a way that mirrors
 * how real brokers and exchanges operate at a simplified level.
 */

export type InstrumentType = "stock" | "option";

export interface ExecutionInput {
  /** Nominal reference price (last/mark price) */
  price: number;
  quantity: number;
  side: "buy" | "sell";
  orderType: "market" | "limit" | "stop_loss" | "take_profit";
  /** Limit/stop trigger price — used for limit and stop fills */
  triggerPrice?: number;
  /** Average daily volume for the symbol (shares) — used for market-impact calc */
  avgDailyVolume?: number;
  /** Whether the account is in pro (paid commission) mode */
  proMode?: boolean;
  instrumentType?: InstrumentType;
}

export interface ExecutionResult {
  /** Actual fill price after slippage */
  actualFillPrice: number;
  /** Absolute dollar slippage per share (always positive) */
  slippageAmount: number;
  /** Slippage as a fraction of the reference price */
  slippagePercent: number;
  /** Total commission for the order in dollars */
  commissionAmount: number;
  /** Additional market-impact cost in dollars (for large orders) */
  marketImpactAmount: number;
  /** Gap-risk adjustment applied to stop orders when price jumps past stop */
  gapRiskAmount: number;
  /** Total all-in cost for the order: quantity * actualFillPrice + commission */
  totalCost: number;
}

// ---------------------------------------------------------------------------
// Seeded PRNG — deterministic per session tick so results are reproducible
// within a bar but still vary across bars.
// ---------------------------------------------------------------------------
let _seed = Date.now() & 0xffffffff;

function seededRand(): number {
  _seed = (_seed * 1103515245 + 12345) & 0x7fffffff;
  return _seed / 0x7fffffff;
}

// ---------------------------------------------------------------------------
// Slippage model
//
// Market orders: slippage = (BASE + rand() * RANGE) * price
//   BASE  = 0.10%   (10 bps floor)
//   RANGE = 0.20%   (up to 30 bps total)
//
// Limit/stop fills: fill at the trigger price — no extra slippage, as the
// investor already named their price.  The only exception is stop orders that
// "gap" past the stop (handled separately).
// ---------------------------------------------------------------------------
const MARKET_SLIPPAGE_BASE = 0.001; // 0.10 %
const MARKET_SLIPPAGE_RANGE = 0.002; // up to 0.20 % additional

function computeSlippage(
  price: number,
  side: "buy" | "sell",
  orderType: "market" | "limit" | "stop_loss" | "take_profit",
): { slippageAmount: number; slippagePercent: number; executionPrice: number } {
  if (orderType !== "market") {
    return { slippageAmount: 0, slippagePercent: 0, executionPrice: price };
  }

  const slippagePct = MARKET_SLIPPAGE_BASE + seededRand() * MARKET_SLIPPAGE_RANGE;
  // Buys fill higher, sells fill lower
  const direction = side === "buy" ? 1 : -1;
  const slippageAmount = price * slippagePct;
  const executionPrice = price + direction * slippageAmount;

  return {
    slippageAmount: Math.round(slippageAmount * 10000) / 10000,
    slippagePercent: slippagePct,
    executionPrice: Math.round(executionPrice * 100) / 100,
  };
}

// ---------------------------------------------------------------------------
// Gap-risk model for stop orders
//
// When a price bar opens well past the stop level (e.g., after overnight news),
// the actual fill is the open price, not the stop price.  We simulate this by
// randomly applying a gap of 0.5%–2.0% past the stop ~15% of the time.
// ---------------------------------------------------------------------------
const GAP_PROBABILITY = 0.15;
const GAP_MIN_PCT = 0.005;
const GAP_MAX_PCT = 0.02;

function computeGapRisk(
  stopPrice: number,
  side: "buy" | "sell",
): { gapAmount: number; effectivePrice: number } {
  if (seededRand() > GAP_PROBABILITY) {
    return { gapAmount: 0, effectivePrice: stopPrice };
  }
  const gapPct = GAP_MIN_PCT + seededRand() * (GAP_MAX_PCT - GAP_MIN_PCT);
  // For a long stop-loss the fill is below the stop; for a short stop it's above.
  const direction = side === "sell" ? -1 : 1;
  const gapAmount = stopPrice * gapPct;
  const effectivePrice = Math.round((stopPrice + direction * gapAmount) * 100) / 100;
  return { gapAmount: Math.round(gapAmount * 10000) / 10000, effectivePrice };
}

// ---------------------------------------------------------------------------
// Market-impact model for large orders
//
// If the order represents > 5 % of average daily volume we apply an additional
// impact cost proportional to the participation rate.
//
//   impact_pct = 0.1 * sqrt(participation_rate - 0.05)
//
// e.g. 10% participation → impact ≈ 0.22%
//      20% participation → impact ≈ 0.39%
// ---------------------------------------------------------------------------
const IMPACT_THRESHOLD = 0.05; // 5% of ADV

function computeMarketImpact(
  quantity: number,
  price: number,
  avgDailyVolume: number | undefined,
): number {
  if (!avgDailyVolume || avgDailyVolume <= 0) return 0;

  const participation = quantity / avgDailyVolume;
  if (participation <= IMPACT_THRESHOLD) return 0;

  const excessParticipation = participation - IMPACT_THRESHOLD;
  const impactPct = 0.1 * Math.sqrt(excessParticipation);
  const impactPerShare = price * impactPct;
  return Math.round(impactPerShare * quantity * 100) / 100;
}

// ---------------------------------------------------------------------------
// Commission model
//
// Free mode (default / Robinhood-style): $0 commission.
// Pro mode:
//   Stocks  — $0.005 / share, minimum $1.00
//   Options — $0.65 / contract (100 shares per contract)
// ---------------------------------------------------------------------------
const PRO_STOCK_PER_SHARE = 0.005;
const PRO_STOCK_MIN = 1.0;
const PRO_OPTIONS_PER_CONTRACT = 0.65;

export function computeCommission(
  quantity: number,
  proMode: boolean,
  instrumentType: InstrumentType = "stock",
): number {
  if (!proMode) return 0;

  if (instrumentType === "option") {
    // quantity is number of contracts
    return quantity * PRO_OPTIONS_PER_CONTRACT;
  }

  return Math.max(PRO_STOCK_MIN, quantity * PRO_STOCK_PER_SHARE);
}

// ---------------------------------------------------------------------------
// Estimate commission for display in OrderEntry (before execution)
// ---------------------------------------------------------------------------
export function estimateCommission(
  quantity: number,
  proMode: boolean,
  instrumentType: InstrumentType = "stock",
): number {
  return computeCommission(quantity, proMode, instrumentType);
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------
export function simulateExecution(input: ExecutionInput): ExecutionResult {
  const {
    price,
    quantity,
    side,
    orderType,
    triggerPrice,
    avgDailyVolume,
    proMode = false,
    instrumentType = "stock",
  } = input;

  // Determine base fill price
  let baseFillPrice = price;
  if (
    (orderType === "limit" ||
      orderType === "stop_loss" ||
      orderType === "take_profit") &&
    triggerPrice !== undefined
  ) {
    baseFillPrice = triggerPrice;
  }

  // Slippage (market orders only)
  const { slippageAmount, slippagePercent, executionPrice } = computeSlippage(
    baseFillPrice,
    side,
    orderType,
  );

  // Gap risk (stop orders only)
  let gapRiskAmount = 0;
  let finalFillPrice = executionPrice;
  if (orderType === "stop_loss" && triggerPrice !== undefined) {
    const { gapAmount, effectivePrice } = computeGapRisk(triggerPrice, side);
    gapRiskAmount = gapAmount;
    if (gapAmount > 0) {
      finalFillPrice = effectivePrice;
    }
  }

  // Market impact (additional cost, separate from fill price)
  const marketImpactAmount = computeMarketImpact(
    quantity,
    finalFillPrice,
    avgDailyVolume,
  );

  // Commission
  const commissionAmount = computeCommission(quantity, proMode, instrumentType);

  // Total cost of the order (buy = outflow, sell = inflow before commission)
  const totalCost =
    quantity * finalFillPrice + commissionAmount + marketImpactAmount;

  return {
    actualFillPrice: finalFillPrice,
    slippageAmount,
    slippagePercent,
    commissionAmount,
    marketImpactAmount,
    gapRiskAmount,
    totalCost,
  };
}
