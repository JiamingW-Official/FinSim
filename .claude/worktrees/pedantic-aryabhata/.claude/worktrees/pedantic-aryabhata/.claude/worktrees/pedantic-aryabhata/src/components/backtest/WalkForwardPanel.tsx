"use client";

import { useMemo } from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────

interface WalkForwardFold {
  foldIndex: number;
  inSampleReturn: number;
  outOfSampleReturn: number;
  inSampleSharpe: number;
  outOfSampleSharpe: number;
  inSampleBars: number;
  outOfSampleBars: number;
  degradationPct: number; // (OOS - IS) / IS * 100
  efficiencyRatio: number; // OOS Sharpe / IS Sharpe
}

interface WalkForwardResult {
  folds: WalkForwardFold[];
  inSampleAvgSharpe: number;
  outOfSampleAvgSharpe: number;
  efficiencyScore: number; // avg of efficiencyRatios
  robustnessScore: number; // 0-100
}

interface Props {
  result: WalkForwardResult | null;
  isRunning: boolean;
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function WalkForwardPanel({ result, isRunning }: Props) {
  if (isRunning) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Running walk-forward analysis...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm text-muted-foreground">Run a backtest with Walk-Forward enabled</p>
        <p className="text-xs text-muted-foreground/70">Configure via the Strategy panel and enable Monte Carlo / Walk-Forward</p>
      </div>
    );
  }

  const { folds, inSampleAvgSharpe, outOfSampleAvgSharpe, efficiencyScore, robustnessScore } = result;
  const isOverfit = efficiencyScore < 0.5;
  const totalBars = folds.reduce((s, f) => s + f.inSampleBars + f.outOfSampleBars, 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-2">
        <MetricChip label="IS Avg Sharpe" value={inSampleAvgSharpe.toFixed(2)} positive={inSampleAvgSharpe > 0} />
        <MetricChip label="OOS Avg Sharpe" value={outOfSampleAvgSharpe.toFixed(2)} positive={outOfSampleAvgSharpe > 0} />
        <MetricChip label="Efficiency" value={`${(efficiencyScore * 100).toFixed(0)}%`} positive={!isOverfit} />
        <MetricChip label="Robustness" value={`${robustnessScore.toFixed(0)}/100`} positive={robustnessScore > 60} />
      </div>

      {/* Overfitting warning */}
      {isOverfit ? (
        <div className="flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-400" />
          <div className="text-xs text-rose-200">
            <span className="font-semibold">Overfitting Warning:</span> Out-of-sample performance is less than 50% of
            in-sample ({(efficiencyScore * 100).toFixed(0)}% efficiency). This strategy may be curve-fit to historical
            data and is unlikely to generalize to live trading.
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
          <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
          <div className="text-xs text-emerald-200">
            Efficiency score of {(efficiencyScore * 100).toFixed(0)}% suggests this strategy generalizes reasonably well.
            Out-of-sample performance retains significant proportion of in-sample results.
          </div>
        </div>
      )}

      {/* Timeline visualization */}
      <div>
        <h3 className="mb-2 text-xs font-semibold text-muted-foreground">
          IS / OOS Timeline
        </h3>
        <TimelineBar folds={folds} totalBars={totalBars} />
        <div className="mt-2 flex items-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-5 rounded-sm bg-primary/60" /> In-Sample
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-5 rounded-sm bg-teal-600/60" /> Out-of-Sample
          </span>
        </div>
      </div>

      {/* Fold detail table */}
      <div>
        <h3 className="mb-2 text-xs font-semibold text-muted-foreground">
          Fold Performance
        </h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/10">
                <th className="px-3 py-2 text-left text-muted-foreground font-medium">Fold</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">IS Sharpe</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">OOS Sharpe</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">IS Return</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">OOS Return</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">Degradation</th>
                <th className="px-3 py-2 text-right text-muted-foreground font-medium">Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {folds.map((fold) => {
                const goodEfficiency = fold.efficiencyRatio >= 0.5;
                return (
                  <tr key={fold.foldIndex} className="border-b border-border hover:bg-muted/30">
                    <td className="px-3 py-2 font-medium text-muted-foreground">Fold {fold.foldIndex + 1}</td>
                    <td className={`px-3 py-2 text-right font-mono ${fold.inSampleSharpe > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {fold.inSampleSharpe.toFixed(2)}
                    </td>
                    <td className={`px-3 py-2 text-right font-mono ${fold.outOfSampleSharpe > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {fold.outOfSampleSharpe.toFixed(2)}
                    </td>
                    <td className={`px-3 py-2 text-right font-mono ${fold.inSampleReturn >= 0 ? "text-emerald-300/70" : "text-rose-300/70"}`}>
                      {fold.inSampleReturn >= 0 ? "+" : ""}{fold.inSampleReturn.toFixed(1)}%
                    </td>
                    <td className={`px-3 py-2 text-right font-mono ${fold.outOfSampleReturn >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {fold.outOfSampleReturn >= 0 ? "+" : ""}{fold.outOfSampleReturn.toFixed(1)}%
                    </td>
                    <td className={`px-3 py-2 text-right font-mono ${fold.degradationPct <= 0 ? "text-rose-400" : "text-emerald-400"}`}>
                      {fold.degradationPct >= 0 ? "+" : ""}{fold.degradationPct.toFixed(1)}%
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        goodEfficiency
                          ? "bg-emerald-500/5 text-emerald-400"
                          : "bg-rose-500/10 text-rose-400"
                      }`}>
                        {(fold.efficiencyRatio * 100).toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Efficiency bar chart (pure SVG) */}
      <div>
        <h3 className="mb-2 text-xs font-semibold text-muted-foreground">
          Fold Efficiency Scores
        </h3>
        <EfficiencyBarChart folds={folds} />
        <div className="mt-1 text-[11px] text-muted-foreground/70">
          Dashed line = 0.5 efficiency threshold (overfitting warning)
        </div>
      </div>
    </div>
  );
}

// ── Timeline Bar ──────────────────────────────────────────────────────────

function TimelineBar({ folds, totalBars }: { folds: WalkForwardFold[]; totalBars: number }) {
  if (totalBars === 0) return null;
  return (
    <div className="flex h-8 w-full overflow-hidden rounded-lg border border-border">
      {folds.map((fold) => {
        const isPct = (fold.inSampleBars / totalBars) * 100;
        const oosPct = (fold.outOfSampleBars / totalBars) * 100;
        return (
          <div key={fold.foldIndex} className="flex h-full" style={{ width: `${isPct + oosPct}%` }}>
            <div
              className="flex h-full items-center justify-center bg-primary/60 text-[11px] text-primary overflow-hidden"
              style={{ width: `${(isPct / (isPct + oosPct)) * 100}%` }}
              title={`Fold ${fold.foldIndex + 1} IS: ${fold.inSampleBars} bars`}
            >
              {isPct > 5 ? `F${fold.foldIndex + 1} IS` : ""}
            </div>
            <div
              className="flex h-full items-center justify-center bg-teal-600/60 text-[11px] text-emerald-100 overflow-hidden border-l border-black/20"
              style={{ width: `${(oosPct / (isPct + oosPct)) * 100}%` }}
              title={`Fold ${fold.foldIndex + 1} OOS: ${fold.outOfSampleBars} bars`}
            >
              {oosPct > 5 ? "OOS" : ""}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Efficiency Bar Chart (pure SVG) ──────────────────────────────────────

function EfficiencyBarChart({ folds }: { folds: WalkForwardFold[] }) {
  const W = 480;
  const H = 100;
  const PAD_L = 32;
  const PAD_R = 8;
  const PAD_T = 8;
  const PAD_B = 20;

  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  // Normalize efficiency 0-1.5 range
  const maxEff = 1.5;
  const barW = (chartW / Math.max(folds.length, 1)) * 0.6;
  const spacing = chartW / Math.max(folds.length, 1);

  // 0.5 threshold line y position
  const thresholdY = PAD_T + chartH * (1 - 0.5 / maxEff);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg" style={{ height: H }}>
      {/* Background */}
      <rect x={PAD_L} y={PAD_T} width={chartW} height={chartH} fill="rgba(255,255,255,0.01)" rx={4} />

      {/* Threshold dashed line at 0.5 */}
      <line
        x1={PAD_L} y1={thresholdY} x2={W - PAD_R} y2={thresholdY}
        stroke="#ef4444" strokeWidth={1} strokeDasharray="4 3" opacity={0.6}
      />
      <text x={PAD_L + 2} y={thresholdY - 2} fontSize={7} fill="#ef4444" opacity={0.8}>0.5</text>

      {/* Y axis labels */}
      <text x={PAD_L - 4} y={PAD_T + 6} textAnchor="end" fontSize={8} fill="#52525b">1.5</text>
      <text x={PAD_L - 4} y={PAD_T + chartH / 2 + 4} textAnchor="end" fontSize={8} fill="#52525b">0.75</text>
      <text x={PAD_L - 4} y={PAD_T + chartH + 2} textAnchor="end" fontSize={8} fill="#52525b">0</text>

      {/* Bars */}
      {folds.map((fold, i) => {
        const eff = Math.min(fold.efficiencyRatio, maxEff);
        const barH = Math.max((eff / maxEff) * chartH, 1);
        const cx = PAD_L + i * spacing + spacing / 2;
        const y = PAD_T + chartH - barH;
        const color = fold.efficiencyRatio >= 0.5 ? "#0d9488" : "#ef4444";
        return (
          <g key={fold.foldIndex}>
            <rect x={cx - barW / 2} y={y} width={barW} height={barH} fill={color} opacity={0.7} rx={2} />
            <text x={cx} y={H - 6} textAnchor="middle" fontSize={8} fill="#71717a">
              F{fold.foldIndex + 1}
            </text>
            <text x={cx} y={y - 2} textAnchor="middle" fontSize={7} fill="#a1a1aa">
              {(fold.efficiencyRatio * 100).toFixed(0)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Metric Chip ─────────────────────────────────────────────────────────

function MetricChip({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-muted/15 px-3 py-2">
      <div className="text-[11px] text-muted-foreground/70">{label}</div>
      <div className={`mt-0.5 text-sm font-semibold ${positive === undefined ? "text-foreground" : positive ? "text-emerald-400" : "text-rose-400"}`}>
        {value}
      </div>
    </div>
  );
}

// ── Synthetic walk-forward data generator ─────────────────────────────────

function mulberry32(seed: number) {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateWalkForwardResult(seed: number, numFolds: number = 5): WalkForwardResult {
  const rng = mulberry32(seed + 0xabc123);

  const folds: WalkForwardFold[] = Array.from({ length: numFolds }, (_, i) => {
    const inSampleSharpe = 0.5 + rng() * 1.5;
    // OOS is noisier and typically lower
    const effRatio = 0.2 + rng() * 1.0;
    const outOfSampleSharpe = inSampleSharpe * effRatio;
    const inSampleReturn = 5 + rng() * 20;
    const outOfSampleReturn = inSampleReturn * (0.3 + rng() * 0.9);
    const degradationPct = ((outOfSampleReturn - inSampleReturn) / Math.abs(inSampleReturn)) * 100;

    return {
      foldIndex: i,
      inSampleReturn: parseFloat(inSampleReturn.toFixed(1)),
      outOfSampleReturn: parseFloat(outOfSampleReturn.toFixed(1)),
      inSampleSharpe: parseFloat(inSampleSharpe.toFixed(2)),
      outOfSampleSharpe: parseFloat(outOfSampleSharpe.toFixed(2)),
      inSampleBars: 100 + Math.floor(rng() * 50),
      outOfSampleBars: 40 + Math.floor(rng() * 20),
      degradationPct: parseFloat(degradationPct.toFixed(1)),
      efficiencyRatio: parseFloat(effRatio.toFixed(2)),
    };
  });

  const inSampleAvgSharpe = folds.reduce((s, f) => s + f.inSampleSharpe, 0) / folds.length;
  const outOfSampleAvgSharpe = folds.reduce((s, f) => s + f.outOfSampleSharpe, 0) / folds.length;
  const efficiencyScore = folds.reduce((s, f) => s + f.efficiencyRatio, 0) / folds.length;
  const robustnessScore = Math.min(100, Math.max(0, efficiencyScore * 70 + (outOfSampleAvgSharpe > 0 ? 20 : 0)));

  return {
    folds,
    inSampleAvgSharpe: parseFloat(inSampleAvgSharpe.toFixed(2)),
    outOfSampleAvgSharpe: parseFloat(outOfSampleAvgSharpe.toFixed(2)),
    efficiencyScore: parseFloat(efficiencyScore.toFixed(2)),
    robustnessScore: parseFloat(robustnessScore.toFixed(1)),
  };
}
