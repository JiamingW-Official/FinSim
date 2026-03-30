// Behavioral profile analytics service
// Computes 6 axes of trader psychology from trade history

import { TradeRecord } from "@/types/trading";

// ─── Archetype derivation ─────────────────────────────────────────────────────

/**
 * Returns one of 6 trader archetypes based on the dominant behavioral axis.
 *
 * Axis name → archetype mapping:
 *   conviction   → Risk-Taker          (bets big, high conviction)
 *   patience     → Disciplined Swing Trader (waits for setups)
 *   discipline   → Scalper             (tight discipline, quick exits)
 *   adaptability → Contrarian          (adjusts against the trend)
 *   consistency  → Momentum Chaser     (consistent directional bets)
 *   risk         → Income Collector    (tight sizing, low variance)
 */
export function getArchetype(profile: BehavioralProfile): string {
  const sorted = [...profile.axes].sort((a, b) => b.score - a.score);
  const dominant = sorted[0].name;
  switch (dominant) {
    case "conviction":
      return "Risk-Taker";
    case "patience":
      return "Disciplined Swing Trader";
    case "discipline":
      return "Scalper";
    case "adaptability":
      return "Contrarian";
    case "consistency":
      return "Momentum Chaser";
    case "risk":
      return "Income Collector";
    default:
      return "Developing Trader";
  }
}

// ─── Behavioral insight helpers ───────────────────────────────────────────────

export type InsightSeverity = "info" | "warning" | "danger";

export interface BehavioralInsight {
  id: string;
  title: string;
  body: string;
  severity: InsightSeverity;
}

/**
 * Derives up to 3 personalised insights from a BehavioralProfile and raw
 * sell trade list.  Each insight has a severity level for colour coding.
 */
export function getBehavioralInsights(
  profile: BehavioralProfile,
  sells: TradeRecord[],
): BehavioralInsight[] {
  const insights: BehavioralInsight[] = [];

  const winners = sells.filter((t) => (t.realizedPnL ?? 0) > 0);
  const losers = sells.filter((t) => (t.realizedPnL ?? 0) < 0);

  const avgWin =
    winners.length > 0
      ? winners.reduce((s, t) => s + (t.realizedPnL ?? 0), 0) / winners.length
      : 0;
  const avgLoss =
    losers.length > 0
      ? Math.abs(
          losers.reduce((s, t) => s + (t.realizedPnL ?? 0), 0) / losers.length,
        )
      : 0;
  const winRate = sells.length > 0 ? winners.length / sells.length : 0;

  // ── 1. Revenge trading detection ─────────────────────────────────────────
  // Heuristic: if more than 40 % of losing trades are immediately followed
  // by another trade (within the same simulation day), flag it.
  if (sells.length >= 4) {
    let revengeCount = 0;
    for (let i = 0; i < sells.length - 1; i++) {
      const curr = sells[i];
      const next = sells[i + 1];
      if (
        (curr.realizedPnL ?? 0) < 0 &&
        next.simulationDate === curr.simulationDate
      ) {
        revengeCount++;
      }
    }
    const revengeRate = revengeCount / Math.max(losers.length, 1);
    if (revengeRate >= 0.35) {
      insights.push({
        id: "revenge_trading",
        title: "Potential revenge trading detected",
        body: "You tend to trade again immediately after a loss on the same day. Consider a mandatory 30-minute break after any losing trade.",
        severity: "danger",
      });
    }
  }

  // ── 2. Cutting winners too early ─────────────────────────────────────────
  if (winRate >= 0.55 && avgWin < avgLoss * 0.8 && avgWin > 0) {
    insights.push({
      id: "cut_winners_early",
      title: "You may be cutting winners too early",
      body: "Your win rate is solid but average gains are smaller than average losses. Try trailing stops to let profitable trades breathe.",
      severity: "warning",
    });
  }

  // ── 3. Loss-to-win ratio needs improvement ────────────────────────────────
  if (avgLoss > 0 && avgWin > 0 && avgLoss / avgWin > 1.5) {
    insights.push({
      id: "rratio",
      title: "Loss-to-win ratio needs work",
      body: `Your average loss (${avgLoss.toFixed(0)}) is more than 1.5× your average win (${avgWin.toFixed(0)}). Aim for an R:R ratio above 1.5 before entering any trade.`,
      severity: "danger",
    });
  }

  // ── 4. Low discipline score ───────────────────────────────────────────────
  const disciplineAxis = profile.axes.find((a) => a.name === "discipline");
  if (disciplineAxis && disciplineAxis.score < 40 && insights.length < 3) {
    insights.push({
      id: "low_discipline",
      title: "Discipline score is low",
      body: "You are letting losses run longer than winners. Set a hard stop-loss on every trade before entry to protect capital.",
      severity: "warning",
    });
  }

  // ── 5. Low consistency ───────────────────────────────────────────────────
  const consistencyAxis = profile.axes.find((a) => a.name === "consistency");
  if (consistencyAxis && consistencyAxis.score < 40 && insights.length < 3) {
    insights.push({
      id: "low_consistency",
      title: "Inconsistent results across sessions",
      body: "Your win rate varies a lot between sessions. Stick to one strategy and review your process after each session.",
      severity: "info",
    });
  }

  // ── 6. Positive reinforcement ─────────────────────────────────────────────
  if (insights.length === 0 && profile.overallScore >= 65) {
    insights.push({
      id: "well_rounded",
      title: "Well-rounded behavioral profile",
      body: "Your scores across all axes are healthy. Keep following your process and focus on scaling position size gradually.",
      severity: "info",
    });
  }

  return insights.slice(0, 3);
}

export interface BehavioralAxis {
  name: string;
  label: string;
  score: number; // 0-100
  description: string;
  insight: string;
}

export interface BehavioralProfile {
  axes: BehavioralAxis[];
  dominantTrait: string;
  growthArea: string;
  overallScore: number;
  tradeCount: number;
  computed: number; // timestamp
}

export function computeBehavioralProfile(trades: TradeRecord[]): BehavioralProfile {
  const sells = trades.filter(t => t.side === "sell" && t.realizedPnL !== undefined);
  const n = sells.length;

  // 1. Discipline (holds winners, cuts losers early)
  const dispositionScore = computeDispositionScore(sells);

  // 2. Patience (avg hold time relative to optimal)
  const patienceScore = computePatienceScore(sells);

  // 3. Risk Control (position sizing consistency)
  const riskScore = computeRiskScore(sells);

  // 4. Consistency (win rate + streak stability)
  const consistencyScore = computeConsistencyScore(sells);

  // 5. Adaptability (performance across market regimes)
  const adaptabilityScore = computeAdaptabilityScore(sells);

  // 6. Conviction (holds high-conviction trades through noise)
  const convictionScore = computeConvictionScore(sells);

  const axes: BehavioralAxis[] = [
    {
      name: "discipline",
      label: "Discipline",
      score: dispositionScore,
      description: "Cuts losers quickly, lets winners run",
      insight:
        dispositionScore > 60
          ? "You manage the disposition effect well."
          : "Watch for holding losers too long.",
    },
    {
      name: "patience",
      label: "Patience",
      score: patienceScore,
      description: "Waits for high-probability setups",
      insight:
        patienceScore > 60
          ? "You show good trade selectivity."
          : "Consider waiting for stronger signals.",
    },
    {
      name: "risk",
      label: "Risk Control",
      score: riskScore,
      description: "Consistent position sizing",
      insight:
        riskScore > 60
          ? "Position sizing is consistent."
          : "Size variation suggests emotional trading.",
    },
    {
      name: "consistency",
      label: "Consistency",
      score: consistencyScore,
      description: "Stable win rate over time",
      insight:
        consistencyScore > 60
          ? "Win rate is stable across sessions."
          : "Results vary — review your process.",
    },
    {
      name: "adaptability",
      label: "Adaptability",
      score: adaptabilityScore,
      description: "Adjusts to market conditions",
      insight:
        adaptabilityScore > 60
          ? "You adapt well to changing conditions."
          : "Struggling in certain market regimes.",
    },
    {
      name: "conviction",
      label: "Conviction",
      score: convictionScore,
      description: "Holds high-conviction trades through noise",
      insight:
        convictionScore > 60
          ? "Strong conviction on your best setups."
          : "Consider holding winners longer.",
    },
  ];

  const overallScore = Math.round(axes.reduce((s, a) => s + a.score, 0) / 6);
  const sorted = [...axes].sort((a, b) => b.score - a.score);
  const dominantTrait = sorted[0].label;
  const growthArea = sorted[sorted.length - 1].label;

  return {
    axes,
    dominantTrait,
    growthArea,
    overallScore,
    tradeCount: n,
    computed: Date.now(),
  };
}

function computeDispositionScore(sells: TradeRecord[]): number {
  if (sells.length < 3) return 50;
  const winners = sells.filter(t => (t.realizedPnL ?? 0) > 0);
  const losers = sells.filter(t => (t.realizedPnL ?? 0) <= 0);
  if (!winners.length || !losers.length) return 55;
  // Good: avg winner P&L > avg loser P&L in absolute terms
  const avgWin = winners.reduce((s, t) => s + (t.realizedPnL ?? 0), 0) / winners.length;
  const avgLoss = Math.abs(
    losers.reduce((s, t) => s + (t.realizedPnL ?? 0), 0) / losers.length,
  );
  const ratio = avgWin / (avgLoss || 1);
  return Math.min(100, Math.max(10, Math.round(ratio * 33)));
}

function computePatienceScore(sells: TradeRecord[]): number {
  if (sells.length < 3) return 50;
  // Proxy: higher win rate = more patient (selective)
  const winRate = sells.filter(t => (t.realizedPnL ?? 0) > 0).length / sells.length;
  return Math.min(100, Math.max(10, Math.round(winRate * 80 + 20)));
}

function computeRiskScore(sells: TradeRecord[]): number {
  if (sells.length < 3) return 50;
  const pnls = sells.map(t => Math.abs(t.realizedPnL ?? 0));
  const mean = pnls.reduce((s, v) => s + v, 0) / pnls.length;
  if (mean === 0) return 50;
  const variance = pnls.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / pnls.length;
  const cv = Math.sqrt(variance) / mean; // coefficient of variation
  return Math.min(100, Math.max(10, Math.round(100 - cv * 30)));
}

function computeConsistencyScore(sells: TradeRecord[]): number {
  if (sells.length < 4) return 50;
  const half = Math.floor(sells.length / 2);
  const firstHalf = sells.slice(0, half);
  const secondHalf = sells.slice(half);
  const wr1 = firstHalf.filter(t => (t.realizedPnL ?? 0) > 0).length / firstHalf.length;
  const wr2 = secondHalf.filter(t => (t.realizedPnL ?? 0) > 0).length / secondHalf.length;
  const diff = Math.abs(wr1 - wr2);
  return Math.min(100, Math.max(10, Math.round(100 - diff * 100)));
}

function computeAdaptabilityScore(sells: TradeRecord[]): number {
  if (sells.length < 3) return 50;
  // Check if later trades are better than earlier ones (learning curve)
  const half = Math.floor(sells.length / 2);
  const first = sells.slice(0, half);
  const second = sells.slice(half);
  const avgFirst =
    first.reduce((s, t) => s + (t.realizedPnL ?? 0), 0) / (first.length || 1);
  const avgSecond =
    second.reduce((s, t) => s + (t.realizedPnL ?? 0), 0) / (second.length || 1);
  if (avgFirst === 0) return 50;
  const improvement = (avgSecond - avgFirst) / Math.abs(avgFirst);
  return Math.min(100, Math.max(10, Math.round(50 + improvement * 25)));
}

function computeConvictionScore(sells: TradeRecord[]): number {
  if (sells.length < 3) return 50;
  // Winners with larger absolute P&L = higher conviction = held longer
  const winners = sells.filter(t => (t.realizedPnL ?? 0) > 0);
  if (!winners.length) return 30;
  const avgWin = winners.reduce((s, t) => s + (t.realizedPnL ?? 0), 0) / winners.length;
  // Normalize: $50 avg win = 70 score
  return Math.min(100, Math.max(10, Math.round(40 + avgWin / 2)));
}
