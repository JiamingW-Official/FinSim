/**
 * behavioral-coach.ts
 * AI Copilot Behavioral Intervention Engine
 *
 * Detects cognitive biases in trading patterns and generates
 * context-aware coaching interventions.
 */

import type { TradeRecord } from "@/types/trading";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RevengeTradingResult {
  detected: boolean;
  instances: number;
  avgBarsAfterLoss: number;
}

export interface DispositionEffectResult {
  score: number; // 0–100, higher = worse disposition effect
  description: string;
  avgWinnerHoldBars: number;
  avgLoserHoldBars: number;
  ratio: number; // loser/winner hold time ratio
}

export interface OverconfidenceResult {
  score: number; // 0–100
  avgPositionSizePct: number;
  recentTrend: "increasing" | "decreasing" | "stable";
  description: string;
}

export interface AnchorBiasResult {
  score: number; // 0–100
  instances: number;
  description: string;
}

export interface IndicatorSnapshot {
  volatility?: number; // implied/realized vol estimate 0–1
  trend?: "bullish" | "bearish" | "neutral";
  recentLosses: number; // consecutive losses in last N trades
  recentWins?: number;
}

export interface WeeklyReport {
  overallScore: number; // 0–100 behavioral health
  behavioralWins: string[];
  behavioralRegressions: string[];
  revengeTrading: RevengeTradingResult;
  dispositionEffect: DispositionEffectResult;
  overconfidence: OverconfidenceResult;
  anchorBias: AnchorBiasResult;
  improvementTargets: string[];
  radarAxes: RadarAxis[]; // 5 axes for SVG radar chart
}

export interface RadarAxis {
  label: string;
  value: number; // 0–100, higher = better
  color: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Estimate hold time in "bars" based on timestamp delta. Assumes ~24h bars. */
function estimateHoldBars(
  buyTimestamp: number,
  sellTimestamp: number,
): number {
  const ms = Math.abs(sellTimestamp - buyTimestamp);
  const bars = Math.round(ms / (24 * 60 * 60 * 1000));
  return Math.max(1, bars);
}

/** Return the most recent N trades */
function recent(trades: TradeRecord[], n: number): TradeRecord[] {
  return trades.slice(0, n);
}

/** Get buy record for a given sell */
function findMatchingBuy(
  sell: TradeRecord,
  trades: TradeRecord[],
): TradeRecord | null {
  // Find the latest buy for the same ticker before this sell
  const sellIdx = trades.indexOf(sell);
  for (let i = sellIdx + 1; i < trades.length; i++) {
    const t = trades[i];
    if (t.ticker === sell.ticker && t.side === "buy") return t;
  }
  return null;
}

// ─── Pattern Detectors ───────────────────────────────────────────────────────

/**
 * Detect revenge trading: re-entry within 2 bars of a loss.
 * Looks at sell trades with negative P&L, then checks if the next
 * buy for the same ticker occurred within ~2 bars (48h).
 */
export function detectRevengeTrading(
  trades: TradeRecord[],
): RevengeTradingResult {
  if (trades.length < 3) {
    return { detected: false, instances: 0, avgBarsAfterLoss: 0 };
  }

  const TWO_BAR_MS = 2 * 24 * 60 * 60 * 1000;
  let instances = 0;
  let totalBarsAfterLoss = 0;

  // trades are newest-first; iterate reversed to go chronologically
  const chrono = [...trades].reverse();

  for (let i = 0; i < chrono.length - 1; i++) {
    const t = chrono[i];
    if (t.side !== "sell" || t.realizedPnL >= 0) continue;

    // This was a losing sell. Look for next buy of same ticker within 2 bars
    for (let j = i + 1; j < chrono.length; j++) {
      const next = chrono[j];
      if (next.side !== "buy") continue;
      if (next.ticker !== t.ticker) continue;

      const delta = next.timestamp - t.timestamp;
      if (delta <= TWO_BAR_MS) {
        instances++;
        const bars = Math.max(1, Math.round(delta / (24 * 60 * 60 * 1000)));
        totalBarsAfterLoss += bars;
      }
      break; // only check the immediately following buy
    }
  }

  const avgBarsAfterLoss =
    instances > 0 ? Math.round(totalBarsAfterLoss / instances) : 0;

  return {
    detected: instances > 0,
    instances,
    avgBarsAfterLoss,
  };
}

/**
 * Detect disposition effect: holding losers longer than winners.
 * Score 0 = no effect, 100 = severe (losers held 4× longer than winners).
 */
export function detectDispositionEffect(
  trades: TradeRecord[],
): DispositionEffectResult {
  const sells = trades.filter((t) => t.side === "sell");

  const winnerHolds: number[] = [];
  const loserHolds: number[] = [];

  for (const sell of sells) {
    const buy = findMatchingBuy(sell, trades);
    if (!buy) continue;

    const holdBars = estimateHoldBars(buy.timestamp, sell.timestamp);

    if (sell.realizedPnL > 0) {
      winnerHolds.push(holdBars);
    } else if (sell.realizedPnL < 0) {
      loserHolds.push(holdBars);
    }
  }

  if (winnerHolds.length === 0 || loserHolds.length === 0) {
    return {
      score: 0,
      description: "Not enough data to detect disposition effect yet.",
      avgWinnerHoldBars: 0,
      avgLoserHoldBars: 0,
      ratio: 1,
    };
  }

  const avgWinner =
    winnerHolds.reduce((a, b) => a + b, 0) / winnerHolds.length;
  const avgLoser =
    loserHolds.reduce((a, b) => a + b, 0) / loserHolds.length;

  const ratio = avgWinner > 0 ? avgLoser / avgWinner : 1;

  // Score: ratio 1 = 0, ratio 3+ = 100
  const score = Math.min(100, Math.round(Math.max(0, (ratio - 1) / 2) * 100));

  let description: string;
  if (ratio < 1.2) {
    description =
      "Your exit discipline looks solid — you exit losers and winners at similar speeds.";
  } else if (ratio < 2) {
    description = `You hold losing trades ${ratio.toFixed(1)}× longer than winners. Try setting a maximum hold time for losers.`;
  } else if (ratio < 3) {
    description = `Significant disposition effect detected. Losers held ${ratio.toFixed(1)}× longer than winners — you may be hoping they recover.`;
  } else {
    description = `Strong disposition effect: losers held ${ratio.toFixed(1)}× longer than winners. This is a critical pattern to break.`;
  }

  return {
    score,
    description,
    avgWinnerHoldBars: Math.round(avgWinner),
    avgLoserHoldBars: Math.round(avgLoser),
    ratio: parseFloat(ratio.toFixed(2)),
  };
}

/**
 * Detect overconfidence: position sizing relative to account value.
 * Score escalates when recent average position size > 20% of portfolio
 * or when size is growing after wins.
 */
export function detectOverconfidence(
  trades: TradeRecord[],
  accountValue: number,
): OverconfidenceResult {
  const buys = trades.filter((t) => t.side === "buy").slice(0, 20);

  if (buys.length === 0) {
    return {
      score: 0,
      avgPositionSizePct: 0,
      recentTrend: "stable",
      description: "No recent trades to analyze.",
    };
  }

  const sizePcts = buys.map((t) => {
    const notional = t.price * t.quantity;
    return accountValue > 0 ? (notional / accountValue) * 100 : 0;
  });

  const avgSizePct = sizePcts.reduce((a, b) => a + b, 0) / sizePcts.length;

  // Trend: compare first half vs second half of recent trades
  const half = Math.ceil(sizePcts.length / 2);
  const older = sizePcts.slice(half);
  const newer = sizePcts.slice(0, half);
  const olderAvg =
    older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : 0;
  const newerAvg =
    newer.length > 0 ? newer.reduce((a, b) => a + b, 0) / newer.length : 0;

  let recentTrend: "increasing" | "decreasing" | "stable";
  if (newerAvg > olderAvg * 1.2) {
    recentTrend = "increasing";
  } else if (newerAvg < olderAvg * 0.8) {
    recentTrend = "decreasing";
  } else {
    recentTrend = "stable";
  }

  // Score: 5% is safe, 25% is moderate, 50%+ is high
  const score = Math.min(
    100,
    Math.round(Math.max(0, (avgSizePct - 5) / 45) * 100),
  );

  let description: string;
  if (avgSizePct < 10) {
    description = `Position sizing looks disciplined at ${avgSizePct.toFixed(1)}% of account per trade.`;
  } else if (avgSizePct < 20) {
    description = `Average position size is ${avgSizePct.toFixed(1)}% of account — moderate. Consider keeping to 5–10% for better risk management.`;
  } else {
    description = `High concentration risk: averaging ${avgSizePct.toFixed(1)}% per position. A few bad trades can seriously damage your account.`;
  }

  if (recentTrend === "increasing") {
    description += " Sizes are growing recently — watch for overconfidence after wins.";
  }

  return {
    score,
    avgPositionSizePct: parseFloat(avgSizePct.toFixed(2)),
    recentTrend,
    description,
  };
}

/**
 * Detect anchor bias: frequency of moves that look like stop-widening.
 * Heuristic: buy at price P, then sell at a loss significantly below P
 * when the loss is more than 10% (suggesting stop was moved or absent).
 */
export function detectAnchorBias(
  trades: TradeRecord[],
): AnchorBiasResult {
  const sells = trades.filter((t) => t.side === "sell" && t.realizedPnL < 0);

  if (sells.length === 0) {
    return {
      score: 0,
      instances: 0,
      description: "No losing exits to analyze yet.",
    };
  }

  let instances = 0;

  for (const sell of sells) {
    const buy = findMatchingBuy(sell, trades);
    if (!buy) continue;

    // If loss > 8%, likely stop was moved (anchored to entry)
    const lossPct = buy.price > 0
      ? Math.abs((sell.price - buy.price) / buy.price) * 100
      : 0;

    if (lossPct > 8) {
      instances++;
    }
  }

  const ratio = sells.length > 0 ? instances / sells.length : 0;
  const score = Math.min(100, Math.round(ratio * 100));

  let description: string;
  if (instances === 0) {
    description = "No evidence of anchor bias — your stop discipline looks solid.";
  } else if (ratio < 0.3) {
    description = `Occasional anchor bias detected (${instances} instances). You sometimes allow losses to run well past a reasonable stop.`;
  } else {
    description = `Significant anchor bias: ${instances} out of ${sells.length} losing trades exceeded an 8% loss. You may be moving stops to avoid taking the loss.`;
  }

  return { score, instances, description };
}

/**
 * Generate a pre-trade warning based on detected behavioral patterns
 * and current market context.
 */
export function generatePreTradeWarning(
  snapshot: IndicatorSnapshot,
  trades: TradeRecord[],
  accountValue: number,
): string | null {
  const revenge = detectRevengeTrading(trades);
  const overconf = detectOverconfidence(trades, accountValue);
  const anchor = detectAnchorBias(trades);

  const warnings: string[] = [];

  // Revenge trading warning
  if (revenge.detected && snapshot.recentLosses >= 2) {
    warnings.push(
      `You've had ${snapshot.recentLosses} consecutive losses. Historically you re-enter too quickly after losses — wait for a clean setup before trading again.`,
    );
  }

  // High volatility + overconfidence
  if (
    snapshot.volatility !== undefined &&
    snapshot.volatility > 0.6 &&
    overconf.avgPositionSizePct > 15
  ) {
    const reducedSize = Math.round(overconf.avgPositionSizePct * 0.7);
    warnings.push(
      `Current volatility is elevated. Given your recent position sizes (avg ${overconf.avgPositionSizePct.toFixed(0)}%), consider reducing to ~${reducedSize}% to manage risk.`,
    );
  }

  // Anchor bias: remind to set a clear stop
  if (anchor.score > 40) {
    warnings.push(
      `You've let losses run past 8% in ${anchor.instances} recent trades. Define your stop price before entering this trade.`,
    );
  }

  // Overconfidence trending up
  if (
    overconf.recentTrend === "increasing" &&
    overconf.score > 30
  ) {
    warnings.push(
      `Your position sizes have been growing. After a winning streak, overconfidence can lead to larger losses — stay with your plan.`,
    );
  }

  if (warnings.length === 0) return null;

  // Return the highest priority warning
  return warnings[0];
}

/**
 * Generate a full post-session behavioral report.
 */
export function generatePostSessionReport(
  trades: TradeRecord[],
  accountValue: number,
): WeeklyReport {
  const revenge = detectRevengeTrading(trades);
  const disposition = detectDispositionEffect(trades);
  const overconf = detectOverconfidence(trades, accountValue);
  const anchor = detectAnchorBias(trades);

  const behavioralWins: string[] = [];
  const behavioralRegressions: string[] = [];
  const improvementTargets: string[] = [];

  // Evaluate each dimension
  if (!revenge.detected) {
    behavioralWins.push("No revenge trading detected — good emotional control after losses.");
  } else {
    behavioralRegressions.push(
      `Revenge trading in ${revenge.instances} instance(s) — re-entered within 2 bars of a loss.`,
    );
    improvementTargets.push(
      "After a loss, wait at least 3 bars before re-entering the same ticker.",
    );
  }

  if (disposition.score < 25) {
    behavioralWins.push("Exit discipline is solid — cutting losers at a similar pace to winners.");
  } else {
    behavioralRegressions.push(disposition.description);
    improvementTargets.push(
      `Set a maximum hold time for losing positions: if a trade is down for ${Math.round(disposition.avgWinnerHoldBars * 1.5)} bars, reassess or exit.`,
    );
  }

  if (overconf.score < 25) {
    behavioralWins.push(`Position sizing is disciplined at avg ${overconf.avgPositionSizePct.toFixed(1)}% per trade.`);
  } else {
    behavioralRegressions.push(overconf.description);
    improvementTargets.push(
      "Cap individual position size at 10% of account value.",
    );
  }

  if (anchor.score < 20) {
    behavioralWins.push("Stop-loss discipline looks healthy — no signs of anchor bias.");
  } else {
    behavioralRegressions.push(anchor.description);
    improvementTargets.push(
      "Set a hard stop before entering any trade, and commit to not moving it against you.",
    );
  }

  // Compute consistency score (win pattern)
  const recentSells = trades.filter((t) => t.side === "sell").slice(0, 10);
  const winRate =
    recentSells.length > 0
      ? recentSells.filter((t) => t.realizedPnL > 0).length /
        recentSells.length
      : 0.5;
  const consistencyScore = Math.round(winRate * 100);

  if (consistencyScore >= 55) {
    behavioralWins.push(`Win rate of ${consistencyScore}% in recent trades — consistent execution.`);
  }

  // Overall behavioral health
  const rawScore =
    (revenge.detected ? 80 : 100) * 0.05 +
    (100 - disposition.score) * 0.25 +
    (100 - overconf.score) * 0.25 +
    (100 - anchor.score) * 0.25 +
    consistencyScore * 0.25;

  const overallScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        ((revenge.detected ? 60 : 100) * 0.2 +
          (100 - disposition.score) * 0.2 +
          (100 - overconf.score) * 0.2 +
          (100 - anchor.score) * 0.2 +
          consistencyScore * 0.2),
      ),
    ),
  );

  // Radar chart axes (higher = better on all axes)
  const radarAxes: RadarAxis[] = [
    {
      label: "Patience",
      value: revenge.detected
        ? Math.max(20, 100 - revenge.instances * 25)
        : 90,
      color: "#22c55e",
    },
    {
      label: "Exit Discipline",
      value: Math.max(10, 100 - disposition.score),
      color: "#2d9cdb",
    },
    {
      label: "Sizing",
      value: Math.max(10, 100 - overconf.score),
      color: "#a855f7",
    },
    {
      label: "Stop Respect",
      value: Math.max(10, 100 - anchor.score),
      color: "#f59e0b",
    },
    {
      label: "Consistency",
      value: consistencyScore,
      color: "#ec4899",
    },
  ];

  void rawScore; // suppress unused warning

  return {
    overallScore,
    behavioralWins,
    behavioralRegressions,
    revengeTrading: revenge,
    dispositionEffect: disposition,
    overconfidence: overconf,
    anchorBias: anchor,
    improvementTargets,
    radarAxes,
  };
}
