import type { Position, TradeRecord } from "@/types/trading";
import { FUNDAMENTALS } from "@/data/fundamentals";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PortfolioAnalytics {
  // Allocation
  sectorWeights: Record<string, number>;
  topHoldings: { ticker: string; weight: number; pnl: number }[];
  concentrationIndex: number;

  // Correlation
  diversificationRatio: number;

  // Performance attribution
  totalPnL: number;
  realizedPnL: number;
  unrealizedPnL: number;

  // Risk budget
  portfolioBeta: number;
  portfolioVolatility: number;
  riskContributions: { ticker: string; riskContrib: number }[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getSector(ticker: string): string {
  const f = FUNDAMENTALS[ticker];
  return f?.sector ?? "Unknown";
}

function getBeta(ticker: string): number {
  const f = FUNDAMENTALS[ticker];
  return f?.beta ?? 1.0;
}

// ─── Main Function ──────────────────────────────────────────────────────────

/**
 * Analyze the current portfolio: allocation, concentration, risk attribution.
 *
 * @param positions - Current open positions
 * @param tradeHistory - All completed trades
 * @param equityHistory - Equity time series
 */
export function analyzePortfolio(
  positions: Position[],
  tradeHistory: TradeRecord[],
  equityHistory: { timestamp: number; value: number }[],
): PortfolioAnalytics {
  // ── Position values & total ───────────────────────────────────────────
  const positionValues: { ticker: string; value: number; pnl: number }[] = [];
  let totalPositionValue = 0;

  for (const pos of positions) {
    const value = pos.quantity * pos.currentPrice;
    totalPositionValue += value;
    positionValues.push({
      ticker: pos.ticker,
      value,
      pnl: pos.unrealizedPnL,
    });
  }

  // ── Sector weights ────────────────────────────────────────────────────
  const sectorWeights: Record<string, number> = {};
  for (const pv of positionValues) {
    const sector = getSector(pv.ticker);
    const weight = totalPositionValue > 0 ? (pv.value / totalPositionValue) * 100 : 0;
    sectorWeights[sector] = (sectorWeights[sector] ?? 0) + weight;
  }

  // ── Top holdings by weight ────────────────────────────────────────────
  const topHoldings = positionValues
    .map((pv) => ({
      ticker: pv.ticker,
      weight: totalPositionValue > 0 ? (pv.value / totalPositionValue) * 100 : 0,
      pnl: pv.pnl,
    }))
    .sort((a, b) => b.weight - a.weight);

  // ── Herfindahl concentration index ────────────────────────────────────
  // Sum of squared weights (as fractions). 1/n for equal weight, 1.0 for single stock.
  let concentrationIndex = 0;
  for (const h of topHoldings) {
    const w = h.weight / 100;
    concentrationIndex += w * w;
  }

  // ── Diversification ratio ─────────────────────────────────────────────
  // Simplified: 1 - concentration. For n equal positions: 1 - 1/n.
  // More concentrated = lower diversification.
  const n = positions.length;
  const diversificationRatio =
    n > 0 ? Math.max(0, Math.min(1, 1 - concentrationIndex)) : 0;

  // ── P&L attribution ───────────────────────────────────────────────────
  const unrealizedPnL = positions.reduce((s, p) => s + p.unrealizedPnL, 0);
  const realizedPnL = tradeHistory.reduce((s, t) => s + t.realizedPnL, 0);
  const totalPnL = realizedPnL + unrealizedPnL;

  // ── Portfolio beta (value-weighted) ───────────────────────────────────
  let portfolioBeta = 0;
  if (totalPositionValue > 0) {
    for (const pv of positionValues) {
      const w = pv.value / totalPositionValue;
      portfolioBeta += w * getBeta(pv.ticker);
    }
  } else {
    portfolioBeta = 1;
  }

  // ── Portfolio volatility estimate (simplified) ────────────────────────
  // Approximate from equity curve if available
  let portfolioVolatility = 0;
  if (equityHistory.length >= 10) {
    const returns: number[] = [];
    for (let i = 1; i < equityHistory.length; i++) {
      if (equityHistory[i - 1].value > 0) {
        returns.push(
          (equityHistory[i].value - equityHistory[i - 1].value) /
            equityHistory[i - 1].value,
        );
      }
    }
    if (returns.length > 1) {
      let sum = 0;
      for (const r of returns) sum += r;
      const mu = sum / returns.length;
      let sumSq = 0;
      for (const r of returns) {
        const d = r - mu;
        sumSq += d * d;
      }
      const dailyVol = Math.sqrt(sumSq / (returns.length - 1));
      portfolioVolatility = dailyVol * Math.sqrt(252) * 100; // annualized %
    }
  }

  // ── Risk contributions (proportional to weight * beta) ────────────────
  const riskContributions: { ticker: string; riskContrib: number }[] = [];
  let totalRiskBudget = 0;
  const riskBudgets: { ticker: string; budget: number }[] = [];

  for (const pv of positionValues) {
    const w = totalPositionValue > 0 ? pv.value / totalPositionValue : 0;
    const beta = getBeta(pv.ticker);
    const budget = w * beta;
    totalRiskBudget += budget;
    riskBudgets.push({ ticker: pv.ticker, budget });
  }

  for (const rb of riskBudgets) {
    riskContributions.push({
      ticker: rb.ticker,
      riskContrib:
        totalRiskBudget > 0 ? (rb.budget / totalRiskBudget) * 100 : 0,
    });
  }

  return {
    sectorWeights,
    topHoldings,
    concentrationIndex,
    diversificationRatio,
    totalPnL,
    realizedPnL,
    unrealizedPnL,
    portfolioBeta,
    portfolioVolatility,
    riskContributions,
  };
}
