"use client";

import { useMemo } from "react";
import type { EfficientFrontierResult, EfficientFrontierPoint } from "@/services/quant/efficient-frontier";

// ─── Props ───────────────────────────────────────────────────────────────────

interface EfficientFrontierChartProps {
  result: EfficientFrontierResult;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CHART_W = 600;
const CHART_H = 380;
const PAD = { top: 24, right: 24, bottom: 48, left: 70 };
const INNER_W = CHART_W - PAD.left - PAD.right;
const INNER_H = CHART_H - PAD.top - PAD.bottom;

const COLORS = {
  frontier: "hsl(220, 70%, 55%)",
  minVar: "hsl(160, 65%, 45%)",
  maxSharpe: "hsl(35, 90%, 55%)",
  equalWeight: "hsl(280, 60%, 55%)",
  cml: "hsl(0, 0%, 55%)",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPct(v: number): string {
  return `${(v * 100).toFixed(1)}%`;
}

function topWeights(weights: Record<string, number>, n: number = 3): string {
  return Object.entries(weights)
    .filter(([, w]) => w > 0.001)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([t, w]) => `${t} ${(w * 100).toFixed(0)}%`)
    .join(", ");
}

// ─── Chart ───────────────────────────────────────────────────────────────────

export default function EfficientFrontierChart({ result }: EfficientFrontierChartProps) {
  const { frontier, minVariance, maxSharpe, equalWeight } = result;

  const { xMin, xMax, yMin, yMax, xScale, yScale, xTicks, yTicks, riskFreeRate } = useMemo(() => {
    const allPoints: EfficientFrontierPoint[] = [...frontier, minVariance, maxSharpe, equalWeight];
    const risks = allPoints.map((p) => p.risk);
    const rets = allPoints.map((p) => p.return);

    const xMn = 0;
    const xMx = Math.max(...risks) * 1.15;
    const yMn = Math.min(0, Math.min(...rets) - 0.01);
    const yMx = Math.max(...rets) * 1.15;

    const xs = (v: number) => PAD.left + ((v - xMn) / (xMx - xMn)) * INNER_W;
    const ys = (v: number) => PAD.top + INNER_H - ((v - yMn) / (yMx - yMn)) * INNER_H;

    // Ticks
    const xTs: number[] = [];
    const xStep = (xMx - xMn) / 5;
    for (let i = 0; i <= 5; i++) xTs.push(xMn + i * xStep);

    const yTs: number[] = [];
    const yStep = (yMx - yMn) / 5;
    for (let i = 0; i <= 5; i++) yTs.push(yMn + i * yStep);

    // Infer risk-free rate from Sharpe of maxSharpe
    const rf = maxSharpe.risk > 0
      ? maxSharpe.return - maxSharpe.sharpe * maxSharpe.risk
      : 0.05;

    return { xMin: xMn, xMax: xMx, yMin: yMn, yMax: yMx, xScale: xs, yScale: ys, xTicks: xTs, yTicks: yTs, riskFreeRate: rf };
  }, [frontier, minVariance, maxSharpe, equalWeight]);

  // Frontier path
  const frontierPath = frontier
    .map((p, i) => `${i === 0 ? "M" : "L"}${xScale(p.risk).toFixed(1)},${yScale(p.return).toFixed(1)}`)
    .join(" ");

  // Capital Market Line: from risk-free rate through maxSharpe and beyond
  const cmlX1 = 0;
  const cmlY1 = riskFreeRate;
  const cmlX2 = xMax;
  const cmlY2 = riskFreeRate + maxSharpe.sharpe * cmlX2;

  return (
    <div className="space-y-4">
      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="w-full h-auto"
        role="img"
        aria-label="Efficient frontier scatter plot"
      >
        {/* Grid */}
        {yTicks.map((v, i) => (
          <line
            key={`yg-${i}`}
            x1={PAD.left}
            x2={CHART_W - PAD.right}
            y1={yScale(v)}
            y2={yScale(v)}
            stroke="currentColor"
            strokeOpacity={0.06}
          />
        ))}
        {xTicks.map((v, i) => (
          <line
            key={`xg-${i}`}
            x1={xScale(v)}
            x2={xScale(v)}
            y1={PAD.top}
            y2={CHART_H - PAD.bottom}
            stroke="currentColor"
            strokeOpacity={0.06}
          />
        ))}

        {/* Axes */}
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

        {/* Axis labels */}
        {yTicks.map((v, i) => (
          <text
            key={`yl-${i}`}
            x={PAD.left - 8}
            y={yScale(v)}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-muted-foreground text-xs font-mono"
          >
            {formatPct(v)}
          </text>
        ))}
        {xTicks.map((v, i) => (
          <text
            key={`xl-${i}`}
            x={xScale(v)}
            y={CHART_H - PAD.bottom + 18}
            textAnchor="middle"
            className="fill-muted-foreground text-xs font-mono"
          >
            {formatPct(v)}
          </text>
        ))}

        {/* Axis titles */}
        <text
          x={PAD.left + INNER_W / 2}
          y={CHART_H - 4}
          textAnchor="middle"
          className="fill-muted-foreground text-[11px] font-medium"
        >
          Risk (Annualized Std Dev)
        </text>
        <text
          x={14}
          y={PAD.top + INNER_H / 2}
          textAnchor="middle"
          transform={`rotate(-90, 14, ${PAD.top + INNER_H / 2})`}
          className="fill-muted-foreground text-[11px] font-medium"
        >
          Expected Return
        </text>

        {/* Capital Market Line */}
        <line
          x1={xScale(cmlX1)}
          y1={yScale(cmlY1)}
          x2={xScale(cmlX2)}
          y2={yScale(Math.min(yMax, cmlY2))}
          stroke={COLORS.cml}
          strokeWidth={1}
          strokeDasharray="6 4"
          strokeOpacity={0.5}
        />

        {/* Frontier curve */}
        <path
          d={frontierPath}
          fill="none"
          stroke={COLORS.frontier}
          strokeWidth={2.5}
        />

        {/* Frontier dots */}
        {frontier.map((p, i) => (
          <circle
            key={`fp-${i}`}
            cx={xScale(p.risk)}
            cy={yScale(p.return)}
            r={3}
            fill={COLORS.frontier}
            fillOpacity={0.6}
          />
        ))}

        {/* Min Variance point */}
        <SpecialPoint
          x={xScale(minVariance.risk)}
          y={yScale(minVariance.return)}
          color={COLORS.minVar}
          label="Min Var"
        />

        {/* Max Sharpe point */}
        <SpecialPoint
          x={xScale(maxSharpe.risk)}
          y={yScale(maxSharpe.return)}
          color={COLORS.maxSharpe}
          label="Max Sharpe"
        />

        {/* Equal weight point */}
        <SpecialPoint
          x={xScale(equalWeight.risk)}
          y={yScale(equalWeight.return)}
          color={COLORS.equalWeight}
          label="Equal Wt"
        />
      </svg>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <PortfolioCard
          title="Min Variance"
          point={minVariance}
          dotColor="bg-emerald-500"
        />
        <PortfolioCard
          title="Max Sharpe"
          point={maxSharpe}
          dotColor="bg-amber-500"
        />
        <PortfolioCard
          title="Equal Weight"
          point={equalWeight}
          dotColor="bg-purple-500"
        />
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SpecialPoint({
  x,
  y,
  color,
  label,
}: {
  x: number;
  y: number;
  color: string;
  label: string;
}) {
  return (
    <g>
      <circle cx={x} cy={y} r={6} fill={color} stroke="white" strokeWidth={1.5} />
      <text
        x={x}
        y={y - 12}
        textAnchor="middle"
        className="text-[11px] font-semibold"
        fill={color}
      >
        {label}
      </text>
    </g>
  );
}

function PortfolioCard({
  title,
  point,
  dotColor,
}: {
  title: string;
  point: EfficientFrontierPoint;
  dotColor: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 space-y-1.5">
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
        <span className="text-xs font-semibold text-foreground">{title}</span>
      </div>
      <div className="grid grid-cols-3 gap-1 text-[11px]">
        <div>
          <div className="text-muted-foreground">Return</div>
          <div className="font-mono tabular-nums font-medium text-foreground">
            {formatPct(point.return)}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">Risk</div>
          <div className="font-mono tabular-nums font-medium text-foreground">
            {formatPct(point.risk)}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">Sharpe</div>
          <div className="font-mono tabular-nums font-medium text-foreground">
            {point.sharpe.toFixed(2)}
          </div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground truncate">
        {topWeights(point.weights)}
      </div>
    </div>
  );
}
