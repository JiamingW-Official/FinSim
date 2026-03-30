"use client";

import { useMemo } from "react";
import { Target, TrendingUp, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PredictionRecord {
  eventId: string;
  eventName: string;
  prediction: "up" | "down" | "flat";
  actual: "up" | "down" | "flat";
  correct: boolean;
  date: number;
  confidence: number; // 1-5
}

const STORAGE_KEY = "finsim_prediction_accuracy";

function loadRecords(): PredictionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PredictionRecord[];
  } catch {
    return [];
  }
}

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

export function AccuracyTracker() {
  const records = useMemo(() => loadRecords(), []);

  const stats = useMemo(() => {
    if (records.length === 0) return null;

    const total = records.length;
    const correct = records.filter((r) => r.correct).length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    // Brier score: 1 - mean((predicted_prob - actual_outcome)^2)
    // predicted_prob = confidence/5 when correct=true (high confidence → higher prob they assigned)
    // actual_outcome = 1 if correct, 0 if not
    const brierComponents = records.map((r) => {
      const predictedProb = r.confidence / 5;
      const actual = r.correct ? 1 : 0;
      return Math.pow(predictedProb - actual, 2);
    });
    const meanBrier =
      brierComponents.reduce((a, b) => a + b, 0) / brierComponents.length;
    const brierScore = 1 - meanBrier;

    // Calibration by confidence level 1-5
    const calibration = [1, 2, 3, 4, 5].map((conf) => {
      const bucket = records.filter((r) => r.confidence === conf);
      const bucketCorrect = bucket.filter((r) => r.correct).length;
      const pct =
        bucket.length > 0 ? Math.round((bucketCorrect / bucket.length) * 100) : null;
      return { confidence: conf, total: bucket.length, correct: bucketCorrect, pct };
    });

    return { total, correct, accuracy, brierScore, calibration };
  }, [records]);

  if (!stats || stats.total === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card text-center">
        <Target className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm font-medium text-muted-foreground">No prediction records yet</p>
        <p className="max-w-xs text-xs text-muted-foreground/60">
          Prediction records are stored locally. Make forecasts via the API or
          prediction market bets to populate this tracker.
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
            {stats.correct}/{stats.total} correct
          </div>
        </div>
      </div>

      {/* Brier score */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">Brier Score (skill)</span>
          </div>
          <span className="font-mono tabular-nums text-sm font-bold text-foreground">
            {stats.brierScore.toFixed(3)}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              stats.brierScore >= 0.7
                ? "bg-green-500/60"
                : stats.brierScore >= 0.5
                  ? "bg-amber-500/60"
                  : "bg-red-500/60",
            )}
            style={{ width: `${Math.max(0, Math.min(100, stats.brierScore * 100))}%` }}
          />
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          Higher is better (1.0 = perfect). Penalizes both wrong direction and miscalibrated confidence.
        </p>
      </div>

      {/* Calibration by confidence */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Calibration by Confidence
        </h3>
        <div className="space-y-2">
          {stats.calibration.map(({ confidence, total, correct, pct }) => (
            <div key={confidence} className="flex items-center gap-3">
              <div className="w-20 shrink-0">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        i < confidence ? "bg-primary/70" : "bg-muted-foreground/20",
                      )}
                    />
                  ))}
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">
                  Level {confidence}
                </div>
              </div>
              <div className="flex-1">
                {pct !== null ? (
                  <>
                    <div className="mb-0.5 flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">{correct}/{total} correct</span>
                      <span className="font-mono font-semibold text-foreground">{pct}%</span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-muted/40">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          pct >= 60 ? "bg-green-500/60" : pct >= 40 ? "bg-amber-500/60" : "bg-red-500/60",
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-[10px] text-muted-foreground/40 italic">No data at this level</div>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[10px] text-muted-foreground">
          Well-calibrated: confidence 5 should correspond to ~100% accuracy, confidence 3 to ~60%.
        </p>
      </div>
    </div>
  );
}
