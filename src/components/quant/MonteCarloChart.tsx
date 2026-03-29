"use client";

import { useMemo } from "react";
import type { MonteCarloResult } from "@/services/quant/monte-carlo";

// ─── Props ───────────────────────────────────────────────────────────────────

interface MonteCarloChartProps {
  result: MonteCarloResult;
  years: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function formatPercent(v: number): string {
  return `${(v * 100).toFixed(1)}%`;
}

// ─── Chart ───────────────────────────────────────────────────────────────────

const CHART_W = 600;
const CHART_H = 320;
const PAD = { top: 20, right: 20, bottom: 40, left: 70 };
const INNER_W = CHART_W - PAD.left - PAD.right;
const INNER_H = CHART_H - PAD.top - PAD.bottom;

export default function MonteCarloChart({ result, years }: MonteCarloChartProps) {
  const { percentiles } = result;
  const p5 = percentiles[5];
  const p25 = percentiles[25];
  const p50 = percentiles[50];
  const p75 = percentiles[75];
  const p95 = percentiles[95];

  const totalSteps = p50.length;

  const { yMin, yMax, xScale, yScale, yTicks, xTicks } = useMemo(() => {
    const allMin = Math.min(...(percentiles[5] ?? p50));
    const allMax = Math.max(...(percentiles[95] ?? p50));
    const margin = (allMax - allMin) * 0.05 || 1;
    const mn = Math.max(0, allMin - margin);
    const mx = allMax + margin;

    const xs = (i: number) => PAD.left + (i / (totalSteps - 1)) * INNER_W;
    const ys = (v: number) => PAD.top + INNER_H - ((v - mn) / (mx - mn)) * INNER_H;

    // Y-axis ticks (5 ticks)
    const yTs: number[] = [];
    for (let i = 0; i <= 4; i++) {
      yTs.push(mn + (i / 4) * (mx - mn));
    }

    // X-axis ticks (every year or every 2 years if > 10)
    const xTs: { idx: number; label: string }[] = [];
    const step = years > 10 ? 24 : 12; // months
    for (let m = 0; m < totalSteps; m += step) {
      xTs.push({ idx: m, label: `${Math.round(m / 12)}y` });
    }
    // Always include the last point
    if (xTs.length === 0 || xTs[xTs.length - 1].idx !== totalSteps - 1) {
      xTs.push({ idx: totalSteps - 1, label: `${years}y` });
    }

    return { yMin: mn, yMax: mx, xScale: xs, yScale: ys, yTicks: yTs, xTicks: xTs };
  }, [percentiles, p50, totalSteps, years]);

  // Build SVG paths
  const buildPath = (data: number[]): string => {
    return data.map((v, i) => `${i === 0 ? "M" : "L"}${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`).join(" ");
  };

  const buildArea = (upper: number[], lower: number[]): string => {
    const top = upper.map((v, i) => `${i === 0 ? "M" : "L"}${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`).join(" ");
    const bottom = [...lower].reverse().map((v, i) => {
      const origIdx = lower.length - 1 - i;
      return `L${xScale(origIdx).toFixed(1)},${yScale(v).toFixed(1)}`;
    }).join(" ");
    return `${top} ${bottom} Z`;
  };

  return (
    <div className="space-y-4">
      {/* Chart */}
      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="w-full h-auto"
        role="img"
        aria-label="Monte Carlo simulation fan chart"
      >
        {/* Grid lines */}
        {yTicks.map((v, i) => (
          <line
            key={`yg-${i}`}
            x1={PAD.left}
            x2={CHART_W - PAD.right}
            y1={yScale(v)}
            y2={yScale(v)}
            stroke="currentColor"
            strokeOpacity={0.08}
          />
        ))}

        {/* P5-P95 band (lightest) */}
        <path
          d={buildArea(p95, p5)}
          fill="currentColor"
          className="text-primary/10 dark:text-primary/10"
        />

        {/* P25-P75 band (darker) */}
        <path
          d={buildArea(p75, p25)}
          fill="currentColor"
          className="text-primary/20 dark:text-primary/20"
        />

        {/* P50 median line */}
        <path
          d={buildPath(p50)}
          fill="none"
          stroke="currentColor"
          className="text-primary dark:text-primary"
          strokeWidth={2}
        />

        {/* Starting value marker */}
        <circle
          cx={xScale(0)}
          cy={yScale(p50[0])}
          r={4}
          fill="currentColor"
          className="text-primary dark:text-primary"
        />

        {/* End value marker */}
        <circle
          cx={xScale(totalSteps - 1)}
          cy={yScale(p50[totalSteps - 1])}
          r={4}
          fill="currentColor"
          className="text-primary dark:text-primary"
        />

        {/* Y-axis labels */}
        {yTicks.map((v, i) => (
          <text
            key={`yl-${i}`}
            x={PAD.left - 8}
            y={yScale(v)}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-muted-foreground text-xs font-mono"
          >
            {formatCurrency(v)}
          </text>
        ))}

        {/* X-axis labels */}
        {xTicks.map((t, i) => (
          <text
            key={`xl-${i}`}
            x={xScale(t.idx)}
            y={CHART_H - PAD.bottom + 18}
            textAnchor="middle"
            className="fill-muted-foreground text-xs font-mono"
          >
            {t.label}
          </text>
        ))}

        {/* Axis lines */}
        <line
          x1={PAD.left}
          x2={PAD.left}
          y1={PAD.top}
          y2={CHART_H - PAD.bottom}
          stroke="currentColor"
          strokeOpacity={0.15}
        />
        <line
          x1={PAD.left}
          x2={CHART_W - PAD.right}
          y1={CHART_H - PAD.bottom}
          y2={CHART_H - PAD.bottom}
          stroke="currentColor"
          strokeOpacity={0.15}
        />

        {/* Legend */}
        <rect x={CHART_W - PAD.right - 130} y={PAD.top} width={120} height={52} rx={4} fill="currentColor" className="text-background/80" />
        <line x1={CHART_W - PAD.right - 120} x2={CHART_W - PAD.right - 100} y1={PAD.top + 14} y2={PAD.top + 14} stroke="currentColor" className="text-primary dark:text-primary" strokeWidth={2} />
        <text x={CHART_W - PAD.right - 94} y={PAD.top + 18} className="fill-foreground text-[11px]">Median (P50)</text>
        <rect x={CHART_W - PAD.right - 120} y={PAD.top + 24} width={20} height={8} rx={1} fill="currentColor" className="text-primary/20 dark:text-primary/20" />
        <text x={CHART_W - PAD.right - 94} y={PAD.top + 33} className="fill-foreground text-[11px]">P25-P75</text>
        <rect x={CHART_W - PAD.right - 120} y={PAD.top + 38} width={20} height={8} rx={1} fill="currentColor" className="text-primary/10 dark:text-primary/10" />
        <text x={CHART_W - PAD.right - 94} y={PAD.top + 47} className="fill-foreground text-[11px]">P5-P95</text>
      </svg>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Expected Value" value={formatCurrency(result.expectedValue)} />
        <StatCard label="Median Return" value={formatPercent(result.medianReturn)} />
        <StatCard
          label="Prob. of Loss"
          value={formatPercent(result.probabilityOfLoss)}
          negative={result.probabilityOfLoss > 0.3}
        />
        <StatCard
          label="Prob. of 2x"
          value={formatPercent(result.probabilityOfDoubling)}
          positive={result.probabilityOfDoubling > 0.3}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Worst Case (P1)" value={formatCurrency(result.worstCase)} negative />
        <StatCard label="Best Case (P99)" value={formatCurrency(result.bestCase)} positive />
      </div>
    </div>
  );
}

// ─── Stat Card Sub-component ─────────────────────────────────────────────────

function StatCard({
  label,
  value,
  positive,
  negative,
}: {
  label: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
      <div className="text-[11px] text-muted-foreground font-medium">{label}</div>
      <div
        className={`font-mono tabular-nums text-sm font-semibold ${
          positive ? "text-emerald-600 dark:text-emerald-400" :
          negative ? "text-red-600 dark:text-red-400" :
          "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
