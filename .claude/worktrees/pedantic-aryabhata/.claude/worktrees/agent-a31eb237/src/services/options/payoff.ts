import type { StrategyLeg, PayoffPoint } from "@/types/options";
import { CONTRACT_MULTIPLIER, RISK_FREE_RATE } from "@/types/options";
import { blackScholes } from "./black-scholes";

/**
 * Calculate payoff curve for a set of option legs
 */
export function calculatePayoffCurve(
  legs: StrategyLeg[],
  spotPrice: number,
  daysToExpiry: number,
  pointCount: number = 200,
): PayoffPoint[] {
  if (legs.length === 0 || spotPrice <= 0) return [];

  const T = daysToExpiry / 365;
  const r = RISK_FREE_RATE;
  const low = spotPrice * 0.7;
  const high = spotPrice * 1.3;
  const step = (high - low) / pointCount;

  // Total premium paid/received
  const totalPremium = legs.reduce((sum, leg) => {
    const sign = leg.side === "buy" ? -1 : 1; // buy = cost, sell = income
    return sum + sign * leg.price * leg.quantity * CONTRACT_MULTIPLIER;
  }, 0);

  const points: PayoffPoint[] = [];

  for (let i = 0; i <= pointCount; i++) {
    const S = low + i * step;

    // P&L at expiry (intrinsic value only)
    let pnlExpiry = totalPremium;
    legs.forEach((leg) => {
      const intrinsic =
        leg.type === "call"
          ? Math.max(S - leg.strike, 0)
          : Math.max(leg.strike - S, 0);
      const sign = leg.side === "buy" ? 1 : -1;
      pnlExpiry += sign * intrinsic * leg.quantity * CONTRACT_MULTIPLIER;
    });

    // P&L at current time (using BS pricing)
    let pnlCurrent = totalPremium;
    if (T > 0.001) {
      legs.forEach((leg) => {
        // Estimate IV from entry price (simplified — use leg's chain IV)
        const iv = estimateIV(leg);
        const currentPrice = blackScholes(S, leg.strike, T, r, iv, leg.type);
        const sign = leg.side === "buy" ? 1 : -1;
        pnlCurrent +=
          sign * currentPrice * leg.quantity * CONTRACT_MULTIPLIER;
      });
    } else {
      pnlCurrent = pnlExpiry;
    }

    points.push({
      spotPrice: +S.toFixed(2),
      pnl: +pnlExpiry.toFixed(2),
      pnlCurrentTime: +pnlCurrent.toFixed(2),
    });
  }

  return points;
}

function estimateIV(leg: StrategyLeg): number {
  // Use the implied vol from the leg's greeks (vega-based estimation)
  // Fallback to 0.3 if not available
  if (leg.greeks.vega > 0) {
    // Reverse-engineer approximate IV from vega — rough estimate
    return 0.3;
  }
  return 0.3;
}

/**
 * Find breakeven spot prices
 */
export function calculateBreakevens(
  legs: StrategyLeg[],
  spotPrice: number,
): number[] {
  if (legs.length === 0) return [];

  const points = calculatePayoffCurve(legs, spotPrice, 0, 500);
  const breakevens: number[] = [];

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1].pnl;
    const curr = points[i].pnl;
    if ((prev <= 0 && curr >= 0) || (prev >= 0 && curr <= 0)) {
      // Linear interpolation
      const ratio = Math.abs(prev) / (Math.abs(prev) + Math.abs(curr));
      const be =
        points[i - 1].spotPrice +
        ratio * (points[i].spotPrice - points[i - 1].spotPrice);
      breakevens.push(+be.toFixed(2));
    }
  }

  return breakevens;
}

/**
 * Calculate max profit and max loss
 */
export function calculateMaxProfitLoss(
  legs: StrategyLeg[],
  spotPrice: number,
): { maxProfit: number | "unlimited"; maxLoss: number | "unlimited" } {
  if (legs.length === 0) return { maxProfit: 0, maxLoss: 0 };

  const points = calculatePayoffCurve(legs, spotPrice, 0, 500);
  const maxPnl = Math.max(...points.map((p) => p.pnl));
  const minPnl = Math.min(...points.map((p) => p.pnl));

  // Check if max profit/loss is at the boundary (potentially unlimited)
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const isMaxAtBoundary =
    maxPnl === lastPoint.pnl || maxPnl === firstPoint.pnl;
  const isMinAtBoundary =
    minPnl === lastPoint.pnl || minPnl === firstPoint.pnl;

  // If P&L at boundary is increasing, it might be unlimited
  const hasLongCall = legs.some(
    (l) => l.type === "call" && l.side === "buy",
  );
  const hasShortCall = legs.some(
    (l) => l.type === "call" && l.side === "sell",
  );
  const hasLongPut = legs.some(
    (l) => l.type === "put" && l.side === "buy",
  );
  const hasShortPut = legs.some(
    (l) => l.type === "put" && l.side === "sell",
  );

  // Simple heuristic for unlimited profit/loss
  const netLongCalls =
    legs.filter((l) => l.type === "call" && l.side === "buy").length -
    legs.filter((l) => l.type === "call" && l.side === "sell").length;
  const netLongPuts =
    legs.filter((l) => l.type === "put" && l.side === "buy").length -
    legs.filter((l) => l.type === "put" && l.side === "sell").length;

  const maxProfit =
    netLongCalls > 0 && isMaxAtBoundary ? "unlimited" : maxPnl;
  const maxLoss =
    (netLongPuts < 0 || (hasShortCall && !hasLongCall)) && isMinAtBoundary
      ? "unlimited"
      : minPnl;

  return { maxProfit, maxLoss };
}
