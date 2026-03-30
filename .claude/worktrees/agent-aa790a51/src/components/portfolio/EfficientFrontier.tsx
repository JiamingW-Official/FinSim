"use client";

import { useMemo, useState } from "react";
import type { EfficientFrontierPoint } from "@/services/portfolio/optimizer";

// ─── Constants ────────────────────────────────────────────────────────────────

const W = 580;
const H = 340;
const PAD = { top: 28, right: 32, bottom: 52, left: 68 };
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;

const RISK_FREE_RATE = 0.045;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pct(v: number, decimals = 1): string {
  return `${(v * 100).toFixed(decimals)}%`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface EfficientFrontierProps {
  /** 20-point frontier from computeEfficientFrontier() */
  points: EfficientFrontierPoint[];
  /** Current portfolio position to plot as a dot */
  currentPortfolio?: { expectedReturn: number; risk: number; label?: string };
}

// ─── Main component ───────────────────────────────────────────────────────────

export function EfficientFrontier({ points, currentPortfolio }: EfficientFrontierProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const derived = useMemo(() => {
    if (points.length === 0) return null;

    const allRisks = points.map((p) => p.risk);
    const allRets = points.map((p) => p.expectedReturn);

    if (currentPortfolio) {
      allRisks.push(currentPortfolio.risk);
      allRets.push(currentPortfolio.expectedReturn);
    }

    const xMin = 0;
    const xMax = Math.max(...allRisks) * 1.18;
    const yMin = Math.min(RISK_FREE_RATE * 0.8, Math.min(...allRets) - 0.005);
    const yMax = Math.max(...allRets) * 1.18;

    const xScale = (v: number) => PAD.left + ((v - xMin) / (xMax - xMin)) * INNER_W;
    const yScale = (v: number) => PAD.top + INNER_H - ((v - yMin) / (yMax - yMin)) * INNER_H;

    // Axis ticks
    const xTicks: number[] = [];
    const xStep = (xMax - xMin) / 5;
    for (let i = 0; i <= 5; i++) xTicks.push(xMin + i * xStep);

    const yTicks: number[] = [];
    const yStep = (yMax - yMin) / 5;
    for (let i = 0; i <= 5; i++) yTicks.push(yMin + i * yStep);

    const maxSharpePoint = points.find((p) => p.isMaxSharpe) ?? points[points.length - 1];
    const minVarPoint = points.find((p) => p.isMinVariance) ?? points[0];

    // Capital Market Line end point y at xMax
    const cmlEndY = RISK_FREE_RATE + maxSharpePoint.sharpe * xMax;

    return { xScale, yScale, xTicks, yTicks, maxSharpePoint, minVarPoint, xMin, xMax, yMin, yMax, cmlEndY };
  }, [points, currentPortfolio]);

  if (!derived || points.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-xs text-muted-foreground">
        No frontier data available
      </div>
    );
  }

  const { xScale, yScale, xTicks, yTicks, maxSharpePoint, minVarPoint, cmlEndY } = derived;

  // Frontier path
  const frontierPath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${xScale(p.risk).toFixed(2)},${yScale(p.expectedReturn).toFixed(2)}`)
    .join(" ");

  // CML
  const cmlX1 = xScale(0);
  const cmlY1 = yScale(RISK_FREE_RATE);
  const cmlX2 = xScale(maxSharpePoint.risk * 2.2);
  const cmlY2 = yScale(Math.min(
    RISK_FREE_RATE + maxSharpePoint.sharpe * maxSharpePoint.risk * 2.2,
    cmlEndY * 1.2,
  ));

  const hovered = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <div className="space-y-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label="Mean-variance efficient frontier"
      >
        {/* Grid lines */}
        {yTicks.map((v, i) => (
          <line
            key={`yg-${i}`}
            x1={PAD.left}
            x2={W - PAD.right}
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
            y2={H - PAD.bottom}
            stroke="currentColor"
            strokeOpacity={0.06}
          />
        ))}

        {/* Axes */}
        <line
          x1={PAD.left} x2={PAD.left}
          y1={PAD.top} y2={H - PAD.bottom}
          stroke="currentColor" strokeOpacity={0.18}
        />
        <line
          x1={PAD.left} x2={W - PAD.right}
          y1={H - PAD.bottom} y2={H - PAD.bottom}
          stroke="currentColor" strokeOpacity={0.18}
        />

        {/* Y-axis labels */}
        {yTicks.map((v, i) => (
          <text
            key={`yl-${i}`}
            x={PAD.left - 8}
            y={yScale(v)}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize={9}
            fontFamily="monospace"
            fill="hsl(var(--muted-foreground))"
          >
            {pct(v)}
          </text>
        ))}

        {/* X-axis labels */}
        {xTicks.map((v, i) => (
          <text
            key={`xl-${i}`}
            x={xScale(v)}
            y={H - PAD.bottom + 16}
            textAnchor="middle"
            fontSize={9}
            fontFamily="monospace"
            fill="hsl(var(--muted-foreground))"
          >
            {pct(v)}
          </text>
        ))}

        {/* Axis titles */}
        <text
          x={PAD.left + INNER_W / 2}
          y={H - 6}
          textAnchor="middle"
          fontSize={10}
          fill="hsl(var(--muted-foreground))"
          fontWeight={500}
        >
          Portfolio Volatility (Annualised)
        </text>
        <text
          x={12}
          y={PAD.top + INNER_H / 2}
          textAnchor="middle"
          fontSize={10}
          fill="hsl(var(--muted-foreground))"
          fontWeight={500}
          transform={`rotate(-90, 12, ${PAD.top + INNER_H / 2})`}
        >
          Expected Return (Annualised)
        </text>

        {/* Capital Market Line */}
        <line
          x1={cmlX1} y1={cmlY1}
          x2={cmlX2} y2={cmlY2}
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={1}
          strokeDasharray="5 4"
          strokeOpacity={0.45}
        />
        <text
          x={cmlX2 - 4}
          y={cmlY2 - 6}
          textAnchor="end"
          fontSize={8}
          fill="hsl(var(--muted-foreground))"
          opacity={0.7}
        >
          CML (rf=4.5%)
        </text>

        {/* Risk-free rate dot on Y-axis */}
        <circle
          cx={PAD.left}
          cy={yScale(RISK_FREE_RATE)}
          r={3}
          fill="hsl(var(--muted-foreground))"
          opacity={0.5}
        />

        {/* Frontier curve */}
        <path
          d={frontierPath}
          fill="none"
          stroke="hsl(220, 70%, 55%)"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Frontier dots (interactive) */}
        {points.map((p, i) => {
          const isSpecial = p.isMinVariance || p.isMaxSharpe;
          if (isSpecial) return null; // drawn separately
          return (
            <circle
              key={`fp-${i}`}
              cx={xScale(p.risk)}
              cy={yScale(p.expectedReturn)}
              r={hoveredIdx === i ? 5 : 3}
              fill="hsl(220, 70%, 55%)"
              fillOpacity={hoveredIdx === i ? 1 : 0.55}
              style={{ cursor: "pointer", transition: "r 0.1s" }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          );
        })}

        {/* Min Variance point */}
        {minVarPoint && (
          <g>
            <circle
              cx={xScale(minVarPoint.risk)}
              cy={yScale(minVarPoint.expectedReturn)}
              r={6}
              fill="hsl(160, 65%, 45%)"
              stroke="hsl(var(--background))"
              strokeWidth={1.5}
            />
            <text
              x={xScale(minVarPoint.risk)}
              y={yScale(minVarPoint.expectedReturn) - 11}
              textAnchor="middle"
              fontSize={8}
              fontWeight={600}
              fill="hsl(160, 65%, 45%)"
            >
              Min Var
            </text>
          </g>
        )}

        {/* Max Sharpe point — star marker */}
        {maxSharpePoint && (
          <g>
            <StarMarker
              cx={xScale(maxSharpePoint.risk)}
              cy={yScale(maxSharpePoint.expectedReturn)}
              r={8}
              fill="hsl(35, 92%, 55%)"
            />
            <text
              x={xScale(maxSharpePoint.risk)}
              y={yScale(maxSharpePoint.expectedReturn) - 14}
              textAnchor="middle"
              fontSize={8}
              fontWeight={600}
              fill="hsl(35, 92%, 55%)"
            >
              Max Sharpe
            </text>
          </g>
        )}

        {/* Current portfolio dot */}
        {currentPortfolio && (
          <g>
            <circle
              cx={xScale(currentPortfolio.risk)}
              cy={yScale(currentPortfolio.expectedReturn)}
              r={7}
              fill="hsl(280, 60%, 55%)"
              stroke="hsl(var(--background))"
              strokeWidth={1.5}
            />
            <text
              x={xScale(currentPortfolio.risk)}
              y={yScale(currentPortfolio.expectedReturn) - 13}
              textAnchor="middle"
              fontSize={8}
              fontWeight={600}
              fill="hsl(280, 60%, 55%)"
            >
              {currentPortfolio.label ?? "Current"}
            </text>
          </g>
        )}

        {/* Hover tooltip */}
        {hovered && hoveredIdx !== null && (
          <g>
            <line
              x1={xScale(hovered.risk)}
              x2={xScale(hovered.risk)}
              y1={PAD.top}
              y2={H - PAD.bottom}
              stroke="hsl(var(--foreground))"
              strokeOpacity={0.12}
              strokeDasharray="3 3"
            />
            <rect
              x={xScale(hovered.risk) + 8}
              y={yScale(hovered.expectedReturn) - 22}
              width={120}
              height={40}
              rx={4}
              fill="hsl(var(--card))"
              stroke="hsl(var(--border))"
              strokeWidth={0.8}
            />
            <text
              x={xScale(hovered.risk) + 14}
              y={yScale(hovered.expectedReturn) - 8}
              fontSize={9}
              fontFamily="monospace"
              fill="hsl(var(--foreground))"
            >
              Ret: {pct(hovered.expectedReturn)}  Risk: {pct(hovered.risk)}
            </text>
            <text
              x={xScale(hovered.risk) + 14}
              y={yScale(hovered.expectedReturn) + 6}
              fontSize={9}
              fontFamily="monospace"
              fill="hsl(var(--muted-foreground))"
            >
              Sharpe: {hovered.sharpe.toFixed(2)}
            </text>
          </g>
        )}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-[11px]">
        <LegendItem color="hsl(220, 70%, 55%)" label="Efficient Frontier" dot />
        <LegendItem color="hsl(160, 65%, 45%)" label="Minimum Variance" dot />
        <LegendItem color="hsl(35, 92%, 55%)" label="Maximum Sharpe" star />
        {currentPortfolio && (
          <LegendItem color="hsl(280, 60%, 55%)" label={currentPortfolio.label ?? "Current Portfolio"} dot />
        )}
        <LegendItem color="hsl(var(--muted-foreground))" label="Capital Market Line" dashed />
      </div>

      {/* Key portfolio cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {minVarPoint && (
          <PointCard
            title="Minimum Variance Portfolio"
            point={minVarPoint}
            accentColor="hsl(160, 65%, 45%)"
            dotClass="bg-green-500"
          />
        )}
        {maxSharpePoint && (
          <PointCard
            title="Maximum Sharpe Portfolio"
            point={maxSharpePoint}
            accentColor="hsl(35, 92%, 55%)"
            dotClass="bg-amber-500"
          />
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarMarker({ cx, cy, r, fill }: { cx: number; cy: number; r: number; fill: string }) {
  // 5-pointed star path relative to (cx, cy)
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.42;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return (
    <polygon
      points={points.join(" ")}
      fill={fill}
      stroke="hsl(var(--background))"
      strokeWidth={1.2}
    />
  );
}

function LegendItem({
  color,
  label,
  dot,
  star,
  dashed,
}: {
  color: string;
  label: string;
  dot?: boolean;
  star?: boolean;
  dashed?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {dot && (
        <span
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
      )}
      {star && (
        <svg width={11} height={11} viewBox="0 0 11 11">
          <StarMarker cx={5.5} cy={5.5} r={5} fill={color} />
        </svg>
      )}
      {dashed && (
        <svg width={18} height={8} viewBox="0 0 18 8">
          <line
            x1={0} y1={4} x2={18} y2={4}
            stroke={color}
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
        </svg>
      )}
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function PointCard({
  title,
  point,
  accentColor,
  dotClass,
}: {
  title: string;
  point: EfficientFrontierPoint;
  accentColor: string;
  dotClass: string;
}) {
  const topHoldings = Object.entries(point.weights)
    .filter(([, w]) => w > 0.001)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${dotClass}`} />
        <span className="text-xs font-semibold">{title}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <div>
          <div className="text-muted-foreground">Return</div>
          <div className="font-mono font-semibold tabular-nums" style={{ color: accentColor }}>
            {pct(point.expectedReturn)}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">Risk</div>
          <div className="font-mono font-semibold tabular-nums">
            {pct(point.risk)}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">Sharpe</div>
          <div className="font-mono font-semibold tabular-nums">
            {point.sharpe.toFixed(2)}
          </div>
        </div>
      </div>
      <div className="space-y-1">
        {topHoldings.map(([t, w]) => (
          <div key={t} className="flex items-center gap-1.5">
            <span className="w-8 shrink-0 font-mono text-[10px] font-medium">{t}</span>
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(w * 100).toFixed(1)}%`,
                  backgroundColor: accentColor,
                  opacity: 0.8,
                }}
              />
            </div>
            <span className="w-9 text-right font-mono text-[10px] text-muted-foreground tabular-nums">
              {pct(w, 0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
