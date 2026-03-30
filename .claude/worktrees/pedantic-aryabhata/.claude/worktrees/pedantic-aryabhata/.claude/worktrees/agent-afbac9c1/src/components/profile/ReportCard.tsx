"use client";

import { useMemo } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { useGameStore } from "@/stores/game-store";
import { cn } from "@/lib/utils";

// ─── Grade types ──────────────────────────────────────────────────────────────

type LetterGrade = "A" | "B" | "C" | "D" | "F";

interface MetricGrade {
  label: string;
  grade: LetterGrade;
  score: number; // 0–100
  description: string;
  detail: string;
}

// ─── Grade helpers ────────────────────────────────────────────────────────────

function scoreToGrade(score: number): LetterGrade {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}

const GRADE_COLOR: Record<LetterGrade, string> = {
  A: "text-green-500",
  B: "text-teal-500",
  C: "text-amber-500",
  D: "text-orange-500",
  F: "text-red-500",
};

const GRADE_BG: Record<LetterGrade, string> = {
  A: "bg-green-500/8 border-green-500/20",
  B: "bg-teal-500/8 border-teal-500/20",
  C: "bg-amber-500/8 border-amber-500/20",
  D: "bg-orange-500/8 border-orange-500/20",
  F: "bg-red-500/8 border-red-500/20",
};

// ─── Compute metrics from trade history ───────────────────────────────────────

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function computeMetrics(
  tradeHistory: ReturnType<typeof useTradingStore.getState>["tradeHistory"],
  uniqueTickersTraded: string[],
): MetricGrade[] {
  const sells = tradeHistory.filter(
    (t) => t.side === "sell" && t.realizedPnL !== undefined,
  );

  if (sells.length === 0) {
    return [];
  }

  const returns = sells.map((t) => t.realizedPnL);
  const wins = sells.filter((t) => t.realizedPnL > 0);
  const losses = sells.filter((t) => t.realizedPnL < 0);

  // ── 1. Consistency: std-dev of returns (lower = better) ──────────────────
  const sd = stdDev(returns);
  const avgAbsReturn = returns.reduce((a, b) => a + Math.abs(b), 0) / returns.length;
  // CV = sd / avgAbsReturn; 0 = perfect consistency, higher = worse
  const cv = avgAbsReturn > 0 ? sd / avgAbsReturn : 1;
  // Map CV to score: CV=0 → 100, CV=1 → 50, CV=2 → 20
  const consistencyScore = Math.max(0, Math.min(100, Math.round(100 - cv * 50)));

  // ── 2. Risk Management: |avgLoss| / avgWin (closer to 1 or below = better) ─
  let riskScore = 50;
  if (wins.length > 0 && losses.length > 0) {
    const avgWin = wins.reduce((a, t) => a + t.realizedPnL, 0) / wins.length;
    const avgLoss = Math.abs(
      losses.reduce((a, t) => a + t.realizedPnL, 0) / losses.length,
    );
    const ratio = avgLoss / avgWin; // ideal < 1
    // ratio=0 → 100, ratio=1 → 70, ratio=2 → 40, ratio=3+ → 10
    riskScore = Math.max(0, Math.min(100, Math.round(100 - ratio * 30)));
  } else if (wins.length > 0 && losses.length === 0) {
    riskScore = 100;
  } else if (wins.length === 0) {
    riskScore = 10;
  }

  // ── 3. Timing: % of trades profitable ─────────────────────────────────────
  const winRate = wins.length / sells.length; // 0–1
  const timingScore = Math.round(winRate * 100);

  // ── 4. Diversification: unique tickers ────────────────────────────────────
  // 1 ticker → 20, 3 → 55, 5 → 80, 8+ → 100
  const tickers = uniqueTickersTraded.length;
  const diversificationScore = Math.min(
    100,
    Math.round(20 + (tickers - 1) * 12),
  );

  // ── 5. Discipline: ratio of trades not cut too early (proxy via avg hold) ─
  // Estimate: trades with PnL > -5% of price entry are "disciplined exits"
  // We use a simpler proxy: trades where |loss| < 2 * avgWin = disciplined
  let disciplineScore = 70; // default moderate
  if (wins.length > 0 && losses.length > 0) {
    const avgWin = wins.reduce((a, t) => a + t.realizedPnL, 0) / wins.length;
    const maxAcceptableLoss = avgWin * 2;
    const disciplinedSells = sells.filter(
      (t) =>
        t.realizedPnL >= 0 || Math.abs(t.realizedPnL) <= maxAcceptableLoss,
    );
    const disciplineRatio = disciplinedSells.length / sells.length;
    disciplineScore = Math.round(disciplineRatio * 100);
  } else if (losses.length === 0) {
    disciplineScore = 95;
  }

  // ── 6. Profitability: overall win rate ────────────────────────────────────
  const profitabilityScore = Math.round(winRate * 100);

  const metrics: MetricGrade[] = [
    {
      label: "Consistency",
      grade: scoreToGrade(consistencyScore),
      score: consistencyScore,
      description: "Variance of trade returns",
      detail:
        consistencyScore >= 70
          ? "Returns are stable across trades."
          : "High variance — results fluctuate widely.",
    },
    {
      label: "Risk Management",
      grade: scoreToGrade(riskScore),
      score: riskScore,
      description: "Avg loss vs avg win ratio",
      detail:
        riskScore >= 70
          ? "Losses are well contained relative to wins."
          : "Losses are large compared to wins — tighten stops.",
    },
    {
      label: "Timing",
      grade: scoreToGrade(timingScore),
      score: timingScore,
      description: "Win rate across all trades",
      detail:
        timingScore >= 70
          ? "Entry timing is strong."
          : "More than half of entries miss the move.",
    },
    {
      label: "Diversification",
      grade: scoreToGrade(diversificationScore),
      score: diversificationScore,
      description: `${tickers} unique ticker${tickers !== 1 ? "s" : ""} traded`,
      detail:
        diversificationScore >= 70
          ? "Portfolio spread across multiple names."
          : "Heavy concentration risk — trade more tickers.",
    },
    {
      label: "Discipline",
      grade: scoreToGrade(disciplineScore),
      score: disciplineScore,
      description: "Adherence to risk limits",
      detail:
        disciplineScore >= 70
          ? "Exits are disciplined and within risk tolerance."
          : "Some exits breach acceptable loss thresholds.",
    },
    {
      label: "Profitability",
      grade: scoreToGrade(profitabilityScore),
      score: profitabilityScore,
      description: "Overall win rate",
      detail:
        profitabilityScore >= 70
          ? "Majority of trades are profitable."
          : profitabilityScore >= 50
          ? "Slight edge — more wins than losses."
          : "More losing trades than winning ones.",
    },
  ];

  return metrics;
}

// ─── GPA helper ───────────────────────────────────────────────────────────────

const GRADE_POINTS: Record<LetterGrade, number> = {
  A: 4,
  B: 3,
  C: 2,
  D: 1,
  F: 0,
};

function computeGPA(metrics: MetricGrade[]): string {
  if (metrics.length === 0) return "—";
  const total = metrics.reduce((a, m) => a + GRADE_POINTS[m.grade], 0);
  return (total / metrics.length).toFixed(1);
}

// ─── Score bar ────────────────────────────────────────────────────────────────

function ScoreBar({ score, grade }: { score: number; grade: LetterGrade }) {
  const color =
    grade === "A"
      ? "bg-green-500"
      : grade === "B"
      ? "bg-teal-500"
      : grade === "C"
      ? "bg-amber-500"
      : grade === "D"
      ? "bg-orange-500"
      : "bg-red-500";

  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn("h-full rounded-full transition-all duration-500", color)}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

// ─── Metric Row ───────────────────────────────────────────────────────────────

function MetricRow({ metric }: { metric: MetricGrade }) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-colors",
        GRADE_BG[metric.grade],
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground">{metric.label}</p>
          <p className="text-[10px] text-muted-foreground">{metric.description}</p>
        </div>
        <span
          className={cn(
            "shrink-0 text-2xl font-black leading-none tabular-nums",
            GRADE_COLOR[metric.grade],
          )}
        >
          {metric.grade}
        </span>
      </div>
      <ScoreBar score={metric.score} grade={metric.grade} />
      <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground">
        {metric.detail}
      </p>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-8 text-center">
      <p className="text-sm font-semibold text-foreground">No report yet</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Complete at least 1 sell trade to generate your Report Card.
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ReportCard() {
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const stats = useGameStore((s) => s.stats);

  const metrics = useMemo(
    () => computeMetrics(tradeHistory, stats.uniqueTickersTraded),
    [tradeHistory, stats.uniqueTickersTraded],
  );

  const gpa = computeGPA(metrics);

  if (metrics.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {/* GPA header */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Trader Report Card
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            Based on {tradeHistory.filter((t) => t.side === "sell").length} closed trades
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black tabular-nums text-foreground">
            {gpa}
          </p>
          <p className="text-[9px] text-muted-foreground">GPA / 4.0</p>
        </div>
      </div>

      {/* Grade grid */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {metrics.map((m) => (
          <MetricRow key={m.label} metric={m} />
        ))}
      </div>
    </div>
  );
}
