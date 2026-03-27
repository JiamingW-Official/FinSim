"use client";

import { useMemo } from "react";
import { Target, TrendingUp, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePredictionMarketStore } from "@/stores/prediction-market-store";
import type { PredictionBet } from "@/stores/prediction-market-store";

function getGrade(accuracy: number): {
  label: string;
  color: string;
  description: string;
} {
  if (accuracy >= 70)
    return {
      label: "Superforecaster",
      color: "text-green-400",
      description: "Top-tier probabilistic reasoner",
    };
  if (accuracy >= 60)
    return {
      label: "Expert",
      color: "text-blue-400",
      description: "Well above average forecaster",
    };
  if (accuracy >= 50)
    return {
      label: "Good",
      color: "text-amber-400",
      description: "Above chance accuracy",
    };
  return {
    label: "Learning",
    color: "text-muted-foreground",
    description: "Building forecasting skills",
  };
}

// ── Brier Score Trend Chart (SVG) ────────────────────────────────────────────
// Brier score per prediction = (forecast - outcome)^2
// Perfect = 0, no skill = 0.25, worst = 1

function BrierTrendChart({ bets }: { bets: PredictionBet[] }) {
  const resolvedBets = useMemo(
    () => bets.filter((b) => b.resolved),
    [bets],
  );

  // Compute rolling mean Brier score for last 10 resolved bets
  const trendData = useMemo(() => {
    if (resolvedBets.length === 0) return [];

    // Sort ascending by timestamp
    const sorted = [...resolvedBets].sort((a, b) => a.timestamp - b.timestamp);

    // Use up to last 10 bets; compute cumulative mean as we go
    const window = sorted.slice(-10);

    return window.map((bet, i) => {
      // Running mean from index 0 to i
      const slice = window.slice(0, i + 1);
      const sum = slice.reduce((acc, b) => {
        const forecast =
          b.position === "yes" ? b.probability : 1 - b.probability;
        const outcome = b.outcome ? 1 : 0;
        return acc + (forecast - outcome) ** 2;
      }, 0);
      return sum / slice.length;
    });
  }, [resolvedBets]);

  if (trendData.length < 2) {
    return (
      <div className="flex h-24 items-center justify-center rounded-lg border border-border bg-card text-[11px] text-muted-foreground">
        Resolve at least 2 bets to see the Brier score trend.
      </div>
    );
  }

  const w = 320;
  const h = 80;
  const pad = { top: 8, right: 12, bottom: 20, left: 36 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;

  // Y axis range: 0 (best) to 0.5 (worst rendered)
  const yMax = 0.5;
  const yMin = 0;

  const toX = (i: number) =>
    pad.left + (i / (trendData.length - 1)) * plotW;
  const toY = (v: number) =>
    pad.top + (1 - (v - yMin) / (yMax - yMin)) * plotH;

  const points = trendData
    .map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`)
    .join(" ");

  const latest = trendData[trendData.length - 1];
  const first = trendData[0];
  const improving = latest < first; // lower Brier = better
  const strokeColor = improving ? "#22c55e" : "#ef4444";

  // Reference lines at 0 (perfect) and 0.25 (no skill)
  const yPerfect = toY(0);
  const yNoSkill = toY(0.25);

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Brier Score Trend (last 10 predictions)
        </span>
        <span
          className={cn(
            "font-mono tabular-nums text-xs font-semibold",
            improving ? "text-green-400" : "text-red-400",
          )}
        >
          {latest.toFixed(3)}
        </span>
      </div>

      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        className="w-full"
        aria-hidden="true"
      >
        {/* Perfect line (y = 0) */}
        <line
          x1={pad.left}
          x2={pad.left + plotW}
          y1={yPerfect}
          y2={yPerfect}
          stroke="#22c55e"
          strokeOpacity={0.25}
          strokeDasharray="3 3"
          strokeWidth={1}
        />
        {/* No-skill line (y = 0.25) */}
        <line
          x1={pad.left}
          x2={pad.left + plotW}
          y1={yNoSkill}
          y2={yNoSkill}
          stroke="#f59e0b"
          strokeOpacity={0.25}
          strokeDasharray="3 3"
          strokeWidth={1}
        />

        {/* Trend line */}
        <polyline
          points={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data point dots */}
        {trendData.map((v, i) => (
          <circle
            key={i}
            cx={toX(i)}
            cy={toY(v)}
            r={2.5}
            fill={strokeColor}
            fillOpacity={0.7}
          />
        ))}

        {/* Y-axis labels */}
        <text
          x={pad.left - 4}
          y={yPerfect + 3}
          textAnchor="end"
          fontSize={8}
          className="fill-muted-foreground"
        >
          0
        </text>
        <text
          x={pad.left - 4}
          y={yNoSkill + 3}
          textAnchor="end"
          fontSize={8}
          className="fill-muted-foreground"
        >
          .25
        </text>
        <text
          x={pad.left - 4}
          y={toY(0.5) + 3}
          textAnchor="end"
          fontSize={8}
          className="fill-muted-foreground"
        >
          .50
        </text>

        {/* Reference labels */}
        <text
          x={pad.left + plotW + 2}
          y={yPerfect + 3}
          fontSize={7}
          className="fill-green-400/60"
        >
          perfect
        </text>
        <text
          x={pad.left + plotW + 2}
          y={yNoSkill + 3}
          fontSize={7}
          className="fill-amber-400/60"
        >
          avg
        </text>

        {/* X-axis: sequence labels */}
        {trendData.map((_, i) => (
          <text
            key={i}
            x={toX(i)}
            y={h - 4}
            textAnchor="middle"
            fontSize={8}
            className="fill-muted-foreground"
          >
            {trendData.length - trendData.length + i + 1}
          </text>
        ))}
      </svg>

      <p className="mt-1 text-[9px] text-muted-foreground">
        Lower is better. 0 = perfect calibration. 0.25 = no skill (random guessing).
      </p>
    </div>
  );
}

// ── Calibration by confidence (from bet probability buckets) ─────────────────

function CalibrationSection({ bets }: { bets: PredictionBet[] }) {
  const resolvedBets = useMemo(() => bets.filter((b) => b.resolved), [bets]);

  const bucketData = useMemo(() => {
    const buckets = [
      { label: "0–20%", lo: 0, hi: 0.2, count: 0, correct: 0 },
      { label: "20–40%", lo: 0.2, hi: 0.4, count: 0, correct: 0 },
      { label: "40–60%", lo: 0.4, hi: 0.6, count: 0, correct: 0 },
      { label: "60–80%", lo: 0.6, hi: 0.8, count: 0, correct: 0 },
      { label: "80–100%", lo: 0.8, hi: 1.01, count: 0, correct: 0 },
    ];

    for (const bet of resolvedBets) {
      const prob =
        bet.position === "yes" ? bet.probability : 1 - bet.probability;
      const bucket = buckets.find((b) => prob >= b.lo && prob < b.hi);
      if (!bucket) continue;
      bucket.count += 1;
      const isCorrect =
        (bet.position === "yes" && bet.outcome === true) ||
        (bet.position === "no" && bet.outcome === false);
      if (isCorrect) bucket.correct += 1;
    }

    return buckets.filter((b) => b.count > 0);
  }, [resolvedBets]);

  if (bucketData.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Calibration by Confidence
      </h3>
      <div className="space-y-2">
        {bucketData.map(({ label, count, correct }) => {
          const pct = Math.round((correct / count) * 100);
          return (
            <div key={label} className="flex items-center gap-3">
              <div className="w-16 shrink-0 text-[10px] font-mono text-muted-foreground">
                {label}
              </div>
              <div className="flex-1">
                <div className="mb-0.5 flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">
                    {correct}/{count} correct
                  </span>
                  <span className="font-mono font-semibold text-foreground">
                    {pct}%
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-muted/40">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      pct >= 60
                        ? "bg-green-500/60"
                        : pct >= 40
                          ? "bg-amber-500/60"
                          : "bg-red-500/60",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[10px] text-muted-foreground">
        Well-calibrated: when you say 80% confident, you should be right ~80% of the time.
      </p>
    </div>
  );
}

// ── Main AccuracyTracker ──────────────────────────────────────────────────────

export function AccuracyTracker() {
  const bets = usePredictionMarketStore((s) => s.bets);
  const totalResolved = usePredictionMarketStore((s) => s.totalResolved);
  const correctPredictions = usePredictionMarketStore(
    (s) => s.correctPredictions,
  );
  const getBrierScore = usePredictionMarketStore((s) => s.getBrierScore);

  const stats = useMemo(() => {
    if (totalResolved === 0) return null;
    const accuracy = Math.round((correctPredictions / totalResolved) * 100);
    const brierScore = getBrierScore();
    return { accuracy, brierScore, totalResolved, correctPredictions };
  }, [bets, totalResolved, correctPredictions, getBrierScore]);

  if (!stats) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card text-center">
        <Target className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm font-medium text-muted-foreground">
          No resolved predictions yet
        </p>
        <p className="max-w-xs text-xs text-muted-foreground/60">
          Place bets in the Markets tab and resolve them as events settle to
          track your accuracy here.
        </p>
      </div>
    );
  }

  const grade = getGrade(stats.accuracy);

  return (
    <div className="space-y-4">
      {/* Grade banner */}
      <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
          <Award className={cn("h-5 w-5", grade.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className={cn("text-base font-semibold", grade.color)}>
            {grade.label}
          </div>
          <div className="text-xs text-muted-foreground">{grade.description}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-mono text-2xl font-bold tabular-nums text-foreground">
            {stats.accuracy}%
          </div>
          <div className="text-[10px] text-muted-foreground">
            {stats.correctPredictions}/{stats.totalResolved} correct
          </div>
        </div>
      </div>

      {/* Brier score trend chart (new) */}
      <BrierTrendChart bets={bets} />

      {/* Brier score summary */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">
              Mean Brier Score
            </span>
          </div>
          <span className="font-mono tabular-nums text-sm font-bold text-foreground">
            {stats.brierScore.toFixed(3)}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              stats.brierScore <= 0.15
                ? "bg-green-500/60"
                : stats.brierScore <= 0.25
                  ? "bg-amber-500/60"
                  : "bg-red-500/60",
            )}
            style={{
              width: `${Math.max(0, Math.min(100, (1 - stats.brierScore) * 100))}%`,
            }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[9px] text-muted-foreground">
          <span>0 = perfect</span>
          <span>0.25 = no skill</span>
          <span>1.0 = worst</span>
        </div>
      </div>

      {/* Calibration by confidence bucket */}
      <CalibrationSection bets={bets} />
    </div>
  );
}
