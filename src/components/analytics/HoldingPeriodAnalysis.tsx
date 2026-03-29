"use client";

import { useMemo } from "react";
import { useTradingStore } from "@/stores/trading-store";
import {
  filterClosedTrades,
  computeTradeStats,
  computeTrendLine,
} from "@/services/analytics/trade-analytics";

const W = 480;
const H = 220;
const MARGIN = { top: 16, right: 20, bottom: 40, left: 52 };
const DOT_R = 4;

function fmt(v: number, decimals = 2): string {
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(decimals)}%`;
}

export function HoldingPeriodAnalysis() {
  const tradeHistory = useTradingStore((s) => s.tradeHistory);

  const { stats, trendLine, optimalBars, chartW, chartH } = useMemo(() => {
    const closed = filterClosedTrades(tradeHistory);
    const stats = computeTradeStats(closed);
    const chartW = W - MARGIN.left - MARGIN.right;
    const chartH = H - MARGIN.top - MARGIN.bottom;

    // Trend line from scatter data
    const points = stats.scatterData.map((d) => ({
      x: d.holdingBars,
      y: d.pnlPct,
    }));
    const trendLine = computeTrendLine(points);

    // Find "optimal" holding period: x where trend line crosses 0 or peaks
    let optimalBars: number | null = null;
    if (trendLine) {
      if (Math.abs(trendLine.slope) > 0.001) {
        // Crossing point of trend line and y=0
        const crossing = -trendLine.intercept / trendLine.slope;
        if (crossing > 0 && crossing < 500) optimalBars = Math.round(crossing);
      }
    }

    return { stats, trendLine, optimalBars, chartW, chartH };
  }, [tradeHistory]);

  const hasTrades = stats.totalTrades > 0;

  if (!hasTrades) {
    return (
      <div className="flex h-32 flex-col items-center justify-center gap-1 text-muted-foreground">
        <p className="text-sm">No closed trades yet</p>
        <p className="text-xs opacity-60">Close some trades to see holding period analysis</p>
      </div>
    );
  }

  const scatter = stats.scatterData;
  const allX = scatter.map((d) => d.holdingBars);
  const allY = scatter.map((d) => d.pnlPct);

  const minX = Math.max(0, Math.min(...allX));
  const maxX = Math.max(1, Math.max(...allX));
  const rawMinY = Math.min(...allY);
  const rawMaxY = Math.max(...allY);
  const yPad = (rawMaxY - rawMinY) * 0.12 || 1;
  const minY = rawMinY - yPad;
  const maxY = rawMaxY + yPad;
  const xRange = maxX - minX || 1;
  const yRange = maxY - minY || 1;

  function toSVGX(bars: number) {
    return MARGIN.left + ((bars - minX) / xRange) * chartW;
  }
  function toSVGY(pct: number) {
    return MARGIN.top + (1 - (pct - minY) / yRange) * chartH;
  }

  // Zero line
  const zeroY = toSVGY(0);

  // Trend line endpoints
  let trendPath = "";
  if (trendLine) {
    const x1 = minX;
    const x2 = maxX;
    const y1 = trendLine.slope * x1 + trendLine.intercept;
    const y2 = trendLine.slope * x2 + trendLine.intercept;
    trendPath = `M ${toSVGX(x1).toFixed(1)} ${toSVGY(y1).toFixed(1)} L ${toSVGX(x2).toFixed(1)} ${toSVGY(y2).toFixed(1)}`;
  }

  // Optimal bars annotation
  const optX = optimalBars !== null ? toSVGX(optimalBars) : null;

  // X-axis ticks (5 evenly spaced)
  const xTicks = [0, 0.25, 0.5, 0.75, 1].map(
    (f) => Math.round(minX + f * xRange),
  );

  // Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(
    (f) => minY + f * yRange,
  );

  return (
    <div className="space-y-3">
      {/* Summary chips */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded border border-border bg-card/60 px-2 py-0.5">
          Avg hold{" "}
          <span className="font-mono text-foreground">
            {stats.avgHoldingPeriod.toFixed(1)} bars
          </span>
        </span>
        <span className="rounded border border-border bg-card/60 px-2 py-0.5">
          Avg win hold{" "}
          <span className="font-mono text-green-400">
            {stats.avgWinHoldingPeriod.toFixed(1)} bars
          </span>
        </span>
        <span className="rounded border border-border bg-card/60 px-2 py-0.5">
          Avg loss hold{" "}
          <span className="font-mono text-red-400">
            {stats.avgLossHoldingPeriod.toFixed(1)} bars
          </span>
        </span>
        {optimalBars !== null && (
          <span className="rounded border border-border bg-card/60 px-2 py-0.5">
            Trend break-even{" "}
            <span className="font-mono text-primary">{optimalBars} bars</span>
          </span>
        )}
      </div>

      {/* SVG scatter chart */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full max-w-full"
          style={{ minWidth: 280 }}
          aria-label="Holding period vs return scatter"
        >
          {/* Grid lines (Y) */}
          {yTicks.map((v, i) => {
            const y = toSVGY(v);
            return (
              <g key={i}>
                <line
                  x1={MARGIN.left}
                  x2={MARGIN.left + chartW}
                  y1={y}
                  y2={y}
                  stroke={v === 0 ? "hsl(220 13% 35%)" : "hsl(220 13% 20%)"}
                  strokeWidth={v === 0 ? 1 : 0.5}
                  strokeDasharray={v === 0 ? "none" : "3 4"}
                />
                <text
                  x={MARGIN.left - 5}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize={9}
                  fill="hsl(215 20% 50%)"
                >
                  {fmt(v, 1)}
                </text>
              </g>
            );
          })}

          {/* X grid + ticks */}
          {xTicks.map((v, i) => {
            const x = toSVGX(v);
            return (
              <g key={i}>
                <line
                  x1={x}
                  x2={x}
                  y1={MARGIN.top}
                  y2={MARGIN.top + chartH}
                  stroke="hsl(220 13% 18%)"
                  strokeWidth={0.5}
                  strokeDasharray="3 4"
                />
                <text
                  x={x}
                  y={MARGIN.top + chartH + 14}
                  textAnchor="middle"
                  fontSize={9}
                  fill="hsl(215 20% 50%)"
                >
                  {v}
                </text>
              </g>
            );
          })}

          {/* Trend line */}
          {trendPath && (
            <path
              d={trendPath}
              fill="none"
              stroke="hsl(220 70% 65%)"
              strokeWidth={1.5}
              strokeDasharray="5 3"
              opacity={0.75}
            />
          )}

          {/* Optimal bars annotation */}
          {optX !== null && (
            <>
              <line
                x1={optX}
                x2={optX}
                y1={MARGIN.top}
                y2={MARGIN.top + chartH}
                stroke="hsl(220 70% 65%)"
                strokeWidth={1}
                strokeDasharray="3 2"
                opacity={0.5}
              />
              <text
                x={optX + 4}
                y={MARGIN.top + 12}
                fontSize={8}
                fill="hsl(220 70% 65%)"
              >
                break-even
              </text>
            </>
          )}

          {/* Scatter dots */}
          {scatter.map((d, i) => {
            const cx = toSVGX(d.holdingBars);
            const cy = toSVGY(d.pnlPct);
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={DOT_R}
                fill={d.isWin ? "hsl(142 55% 45%)" : "hsl(0 65% 45%)"}
                fillOpacity={0.8}
                stroke={d.isWin ? "hsl(142 55% 60%)" : "hsl(0 65% 60%)"}
                strokeWidth={0.75}
              />
            );
          })}

          {/* Axes */}
          <line
            x1={MARGIN.left}
            x2={MARGIN.left + chartW}
            y1={MARGIN.top + chartH}
            y2={MARGIN.top + chartH}
            stroke="hsl(220 13% 30%)"
            strokeWidth={1}
          />
          <line
            x1={MARGIN.left}
            x2={MARGIN.left}
            y1={MARGIN.top}
            y2={MARGIN.top + chartH}
            stroke="hsl(220 13% 30%)"
            strokeWidth={1}
          />

          {/* Axis labels */}
          <text
            x={MARGIN.left + chartW / 2}
            y={H - 4}
            textAnchor="middle"
            fontSize={9}
            fill="hsl(215 20% 45%)"
          >
            Holding period (bars)
          </text>
          <text
            x={14}
            y={MARGIN.top + chartH / 2}
            textAnchor="middle"
            fontSize={9}
            fill="hsl(215 20% 45%)"
            transform={`rotate(-90, 14, ${MARGIN.top + chartH / 2})`}
          >
            P&L %
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-600/80" />
          Win
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-600/80" />
          Loss
        </div>
        <div className="flex items-center gap-1.5">
          <svg width={16} height={8}>
            <line x1={0} y1={4} x2={16} y2={4} stroke="hsl(220 70% 65%)" strokeWidth={1.5} strokeDasharray="5 3" />
          </svg>
          Trend line
        </div>
      </div>
    </div>
  );
}
