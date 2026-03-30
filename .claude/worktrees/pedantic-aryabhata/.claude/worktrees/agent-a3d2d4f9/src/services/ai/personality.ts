import type { TradeRecord } from "@/types/trading";

export type TradingStyle =
  | "momentum"
  | "mean_reversion"
  | "swing"
  | "scalper"
  | "unknown";

export interface TraderProfile {
  style: TradingStyle;
  totalTrades: number;
  winRate: number;
  avgWinPct: number;
  avgLossPct: number;
  riskRewardRatio: number;
  profitFactor: number;
  bestSide: "long" | "short" | "balanced";
  strengthMessage: string;
  improvementMessage: string;
}

export function analyzeTraderPersonality(
  tradeHistory: TradeRecord[],
): TraderProfile | null {
  // Only analyze sell trades with realized P&L
  const sells = tradeHistory.filter(
    (t) => t.side === "sell" && t.realizedPnL !== undefined,
  );

  if (sells.length < 3) return null;

  const wins = sells.filter((t) => (t.realizedPnL ?? 0) > 0);
  const losses = sells.filter((t) => (t.realizedPnL ?? 0) <= 0);

  const winRate = wins.length / sells.length;

  // Compute average win/loss percent using price as basis
  const winPcts = wins.map((t) => {
    const pnl = t.realizedPnL ?? 0;
    const basis = t.price * t.quantity;
    return basis > 0 ? (pnl / basis) * 100 : 0;
  });

  const lossPcts = losses.map((t) => {
    const pnl = t.realizedPnL ?? 0;
    const basis = t.price * t.quantity;
    return basis > 0 ? (Math.abs(pnl) / basis) * 100 : 0;
  });

  const avgWinPct =
    winPcts.length > 0 ? winPcts.reduce((s, v) => s + v, 0) / winPcts.length : 0;
  const avgLossPct =
    lossPcts.length > 0
      ? lossPcts.reduce((s, v) => s + v, 0) / lossPcts.length
      : 0;

  const riskRewardRatio = avgLossPct > 0 ? avgWinPct / avgLossPct : avgWinPct;

  const totalWinAmount = wins.reduce((s, t) => s + (t.realizedPnL ?? 0), 0);
  const totalLossAmount = Math.abs(
    losses.reduce((s, t) => s + (t.realizedPnL ?? 0), 0),
  );
  const profitFactor =
    totalLossAmount > 0 ? totalWinAmount / totalLossAmount : totalWinAmount > 0 ? 9.9 : 0;

  // Classify side preference
  // Since TradeRecord.side is "buy" | "sell", check if the trades are from shorts
  // We can infer: positive P&L from a sell likely means it was a long; negative could be either
  // For simplicity, use note/tag if available, else classify as balanced
  const bestSide: "long" | "short" | "balanced" = "balanced";

  // ─── Style Classification ────────────────────────────────────────────────
  let style: TradingStyle;

  if (avgWinPct > 12 && winRate >= 0.45) {
    style = "momentum";
  } else if (winRate > 0.62 && avgWinPct < 8) {
    style = "mean_reversion";
  } else if (sells.length > 20 && avgWinPct < 4) {
    style = "scalper";
  } else {
    style = "swing";
  }

  // ─── Personalized Messages ───────────────────────────────────────────────
  let strengthMessage: string;
  let improvementMessage: string;

  // Strength
  if (riskRewardRatio >= 2.0) {
    strengthMessage = `Strong R/R discipline at ${riskRewardRatio.toFixed(1)}:1 — let winners run.`;
  } else if (winRate >= 0.6) {
    strengthMessage = `High win rate of ${(winRate * 100).toFixed(0)}% — good setup selection.`;
  } else if (profitFactor >= 1.5) {
    strengthMessage = `Profit factor ${profitFactor.toFixed(1)} — winning trades outweigh losses.`;
  } else {
    strengthMessage = `${sells.length} trades logged. Building pattern recognition.`;
  }

  // Improvement
  if (winRate < 0.45) {
    improvementMessage = `Win rate ${(winRate * 100).toFixed(0)}% below target — be more selective with entries.`;
  } else if (riskRewardRatio < 1.0) {
    improvementMessage = `R/R ratio ${riskRewardRatio.toFixed(1)}:1 — cut losses sooner and let winners breathe.`;
  } else if (avgLossPct > avgWinPct * 1.5) {
    improvementMessage = `Avg loss (${avgLossPct.toFixed(1)}%) exceeds avg win (${avgWinPct.toFixed(1)}%) — tighten stop-losses.`;
  } else if (profitFactor < 1.0) {
    improvementMessage = `Profit factor below 1.0 — overall unprofitable. Review entry criteria.`;
  } else {
    improvementMessage = `Maintain discipline — consistency builds edge over time.`;
  }

  return {
    style,
    totalTrades: sells.length,
    winRate,
    avgWinPct: parseFloat(avgWinPct.toFixed(2)),
    avgLossPct: parseFloat(avgLossPct.toFixed(2)),
    riskRewardRatio: parseFloat(riskRewardRatio.toFixed(2)),
    profitFactor: parseFloat(profitFactor.toFixed(2)),
    bestSide,
    strengthMessage,
    improvementMessage,
  };
}
