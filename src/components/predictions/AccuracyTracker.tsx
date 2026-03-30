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
      color: "text-emerald-400",
      description: "Top-tier probabilistic reasoner",
    };
  if (accuracy >= 60)
    return {
      label: "Expert",
      color: "text-primary",
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
    color: "text-muted-foreground/60",
    description: "Building forecasting skills",
  };
}

// ── Brier Score Trend Chart (SVG) ─────────────────────────────────────────────

function BrierTrendChart({ bets }: { bets: PredictionBet[] }) {
  const resolvedBets = useMemo(
    () => bets.filter((b) => b.resolved),
    [bets],
  );

  const trendData = useMemo(() => {
    if (resolvedBets.length === 0) return [];
    const sorted = [...resolvedBets].sort((a, b) => a.timestamp - b.timestamp);
    const window = sorted.slice(-10);
    return window.map((bet, i) => {
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
      <div className="flex h-24 items-center justify-center rounded-xl border border-border/20 bg-card/30 text-[9px] font-mono text-muted-foreground/35">
        Resolve at least 2 bets to see trend
      </div>
    );
  }

  const w = 320;
  const h = 80;
  const pad = { top: 8, right: 12, bottom: 20, left: 36 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;

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
  const improving = latest < first;
  const strokeColor = improving ? "#22c55e" : "#ef4444";

  const yPerfect = toY(0);
  const yNoSkill = toY(0.25);

  return (
    <div className="rounded-xl border border-border/20 bg-card/30 p-3">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35">
          Brier Score Trend (last 10)
        </span>
        <span
          className={cn(
            "text-[11px] font-mono font-semibold tabular-nums",
            improving ? "text-emerald-400" : "text-rose-400",
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
        {/* Perfect line */}
        <line
          x1={pad.left}
          x2={pad.left + plotW}
          y1={yPerfect}
          y2={yPerfect}
          stroke="#22c55e"
          strokeOpacity={0.2}
          strokeDasharray="3 3"
          strokeWidth={1}
        />
        {/* No-skill line */}
        <line
          x1={pad.left}
          x2={pad.left + plotW}
          y1={yNoSkill}
          y2={yNoSkill}
          stroke="#f59e0b"
          strokeOpacity={0.2}
          strokeDasharray="3 3"
          strokeWidth={1}
        />

        {/* Trend line */}
        <polyline
          points={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeOpacity={0.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data point dots */}
        {trendData.map((v, i) => (
          <circle
            key={i}
            cx={toX(i)}
            cy={toY(v)}
            r={2}
            fill={strokeColor}
            fillOpacity={0.6}
          />
        ))}

        {/* Y-axis labels */}
        <text
          x={pad.left - 4}
          y={yPerfect + 3}
          textAnchor="end"
          fontSize={7}
          className="fill-muted-foreground/40"
        >
          0
        </text>
        <text
          x={pad.left - 4}
          y={yNoSkill + 3}
          textAnchor="end"
          fontSize={7}
          className="fill-muted-foreground/40"
        >
          .25
        </text>
        <text
          x={pad.left - 4}
          y={toY(0.5) + 3}
          textAnchor="end"
          fontSize={7}
          className="fill-muted-foreground/40"
        >
          .50
        </text>

        {/* Reference labels */}
        <text
          x={pad.left + plotW + 2}
          y={yPerfect + 3}
          fontSize={7}
          className="fill-emerald-400/50"
        >
          perfect
        </text>
        <text
          x={pad.left + plotW + 2}
          y={yNoSkill + 3}
          fontSize={7}
          className="fill-amber-400/50"
        >
          avg
        </text>

        {/* X-axis sequence labels */}
        {trendData.map((_, i) => (
          <text
            key={i}
            x={toX(i)}
            y={h - 4}
            textAnchor="middle"
            fontSize={7}
            className="fill-muted-foreground/30"
          >
            {i + 1}
          </text>
        ))}
      </svg>

      <p className="mt-1 text-[9px] font-mono text-muted-foreground/35">
        Lower is better. 0 = perfect. 0.25 = random.
      </p>
    </div>
  );
}

// ── Calibration by confidence ─────────────────────────────────────────────────

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
    <div className="rounded-xl border border-border/20 bg-card/30 p-3">
      <h3 className="mb-2.5 text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35">
        Calibration by Confidence
      </h3>
      <div className="space-y-2">
        {bucketData.map(({ label, count, correct }) => {
          const pct = Math.round((correct / count) * 100);
          return (
            <div key={label} className="flex items-center gap-2.5">
              <div className="w-14 shrink-0 text-[9px] font-mono tabular-nums text-muted-foreground/35">
                {label}
              </div>
              <div className="flex-1">
                <div className="mb-0.5 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-muted-foreground/35">
                    {correct}/{count}
                  </span>
                  <span
                    className={cn(
                      "text-[9px] font-mono font-semibold tabular-nums",
                      pct >= 60
                        ? "text-emerald-400"
                        : pct >= 40
                        ? "text-amber-400"
                        : "text-rose-400",
                    )}
                  >
                    {pct}%
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-foreground/10">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      pct >= 60
                        ? "bg-emerald-500/50"
                        : pct >= 40
                        ? "bg-amber-500/50"
                        : "bg-rose-500/50",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2.5 text-[9px] font-mono text-muted-foreground/35">
        At 80% confidence, you should be right ~80% of the time.
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
      <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-border/20 bg-card/30 text-center">
        <Target className="h-6 w-6 text-muted-foreground/20" />
        <p className="text-[11px] font-medium text-muted-foreground/50">
          No resolved predictions yet
        </p>
        <p className="max-w-xs text-[9px] font-mono text-muted-foreground/35">
          Place bets and resolve them as events settle to track accuracy here.
        </p>
      </div>
    );
  }

  const grade = getGrade(stats.accuracy);

  return (
    <div className="space-y-3">
      {/* Grade banner */}
      <div className="flex items-center gap-3 rounded-xl border border-border/20 bg-card/30 p-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground/5">
          <Award className={cn("h-4 w-4", grade.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className={cn("text-[11px] font-semibold", grade.color)}>
            {grade.label}
          </div>
          <div className="text-[9px] font-mono text-muted-foreground/35">
            {grade.description}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[20px] font-mono font-bold tabular-nums text-foreground">
            {stats.accuracy}%
          </div>
          <div className="text-[9px] font-mono tabular-nums text-muted-foreground/35">
            {stats.correctPredictions}/{stats.totalResolved} correct
          </div>
        </div>
      </div>

      {/* Summary metrics grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-border/20 bg-card/30 p-2">
          <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35 mb-1">
            Accuracy
          </div>
          <div
            className={cn(
              "text-[13px] font-mono font-semibold tabular-nums",
              grade.color,
            )}
          >
            {stats.accuracy}%
          </div>
        </div>
        <div className="rounded-lg border border-border/20 bg-card/30 p-2">
          <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35 mb-1">
            Brier Score
          </div>
          <div
            className={cn(
              "text-[13px] font-mono font-semibold tabular-nums",
              stats.brierScore <= 0.15
                ? "text-emerald-400"
                : stats.brierScore <= 0.25
                ? "text-amber-400"
                : "text-rose-400",
            )}
          >
            {stats.brierScore.toFixed(3)}
          </div>
        </div>
        <div className="rounded-lg border border-border/20 bg-card/30 p-2">
          <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35 mb-1">
            Total Resolved
          </div>
          <div className="text-[13px] font-mono font-semibold tabular-nums text-foreground">
            {stats.totalResolved}
          </div>
        </div>
        <div className="rounded-lg border border-border/20 bg-card/30 p-2">
          <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35 mb-1">
            Correct
          </div>
          <div className="text-[13px] font-mono font-semibold tabular-nums text-foreground">
            {stats.correctPredictions}
          </div>
        </div>
      </div>

      {/* Brier score bar */}
      <div className="rounded-xl border border-border/20 bg-card/30 p-3">
        <div className="mb-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3 text-muted-foreground/35" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35">
              Mean Brier Score
            </span>
          </div>
          <span
            className={cn(
              "text-[11px] font-mono font-semibold tabular-nums",
              stats.brierScore <= 0.15
                ? "text-emerald-400"
                : stats.brierScore <= 0.25
                ? "text-amber-400"
                : "text-rose-400",
            )}
          >
            {stats.brierScore.toFixed(3)}
          </span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-foreground/10">
          <div
            className={cn(
              "h-full rounded-full transition-colors",
              stats.brierScore <= 0.15
                ? "bg-emerald-500/50"
                : stats.brierScore <= 0.25
                ? "bg-amber-500/50"
                : "bg-rose-500/50",
            )}
            style={{
              width: `${Math.max(0, Math.min(100, (1 - stats.brierScore) * 100))}%`,
            }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[9px] font-mono text-muted-foreground/35">
          <span>0 = perfect</span>
          <span>0.25 = no skill</span>
          <span>1.0 = worst</span>
        </div>
      </div>

      {/* Brier score trend chart */}
      <BrierTrendChart bets={bets} />

      {/* Calibration by confidence bucket */}
      <CalibrationSection bets={bets} />
    </div>
  );
}
