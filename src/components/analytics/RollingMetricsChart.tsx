"use client";

import { useMemo } from "react";
import { useTradingStore } from "@/stores/trading-store";
import {
  filterClosedTrades,
  computeRollingSharpe,
  computeRollingWinRate,
} from "@/services/analytics/trade-analytics";

const W = 480;
const H = 160;
const MARGIN = { top: 16, right: 20, bottom: 32, left: 48 };

interface LinePoint {
  x: number;
  y: number;
  value: number;
}

function buildLinePath(points: LinePoint[]): string {
  if (points.length < 2) return "";
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
}

// ------------------------------------------------------------------
// Rolling Sharpe Chart
// ------------------------------------------------------------------
export function RollingSharpeChart() {
  const tradeHistory = useTradingStore((s) => s.tradeHistory);

  const { svgPoints, chartW, chartH, minY, maxY, zeroY } = useMemo(() => {
    const closed = filterClosedTrades(tradeHistory);
    const data = computeRollingSharpe(closed, 30);
    const chartW = W - MARGIN.left - MARGIN.right;
    const chartH = H - MARGIN.top - MARGIN.bottom;

    if (data.length === 0) {
      return { svgPoints: [], chartW, chartH, minY: 0, maxY: 1, zeroY: MARGIN.top + chartH };
    }

    const values = data.map((d) => d.sharpe);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const pad = (rawMax - rawMin) * 0.12 || 0.5;
    const minY = rawMin - pad;
    const maxY = rawMax + pad;
    const yRange = maxY - minY || 1;

    const svgPoints: LinePoint[] = data.map((d, i) => ({
      x: MARGIN.left + (i / Math.max(1, data.length - 1)) * chartW,
      y: MARGIN.top + (1 - (d.sharpe - minY) / yRange) * chartH,
      value: d.sharpe,
    }));

    const zeroFrac = (0 - minY) / yRange;
    const zeroY = MARGIN.top + (1 - zeroFrac) * chartH;

    return { svgPoints, chartW, chartH, minY, maxY, zeroY };
  }, [tradeHistory]);

  if (svgPoints.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center text-xs text-muted-foreground">
        Need 30+ trades for rolling Sharpe
      </div>
    );
  }

  const yRange = maxY - minY || 1;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => minY + f * yRange);
  const path = buildLinePath(svgPoints);
  const lastVal = svgPoints[svgPoints.length - 1]?.value ?? 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>30-trade rolling window</span>
        <span className={`font-mono font-semibold ${lastVal >= 1 ? "text-green-400" : lastVal >= 0 ? "text-blue-400" : "text-red-400"}`}>
          Current: {lastVal.toFixed(2)}
        </span>
      </div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full max-w-full"
          style={{ minWidth: 260 }}
          aria-label="Rolling Sharpe ratio"
        >
          {/* Grid */}
          {yTicks.map((v, i) => {
            const y = MARGIN.top + (1 - (v - minY) / yRange) * (H - MARGIN.top - MARGIN.bottom);
            return (
              <g key={i}>
                <line
                  x1={MARGIN.left} x2={MARGIN.left + chartW}
                  y1={y} y2={y}
                  stroke={v === 0 ? "hsl(220 13% 35%)" : "hsl(220 13% 20%)"}
                  strokeWidth={v === 0 ? 1 : 0.5}
                  strokeDasharray={v === 0 ? undefined : "3 4"}
                />
                <text x={MARGIN.left - 5} y={y + 3.5} textAnchor="end" fontSize={9} fill="hsl(215 20% 50%)">
                  {v.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Sharpe >= 1 reference */}
          {(() => {
            const refY = MARGIN.top + (1 - (1 - minY) / yRange) * chartH;
            if (refY >= MARGIN.top && refY <= MARGIN.top + chartH) {
              return (
                <line
                  x1={MARGIN.left} x2={MARGIN.left + chartW}
                  y1={refY} y2={refY}
                  stroke="hsl(142 50% 40%)"
                  strokeWidth={1}
                  strokeDasharray="4 3"
                  opacity={0.6}
                />
              );
            }
            return null;
          })()}

          {/* Line */}
          <path d={path} fill="none" stroke="hsl(220 80% 65%)" strokeWidth={1.5} />

          {/* Axes */}
          <line x1={MARGIN.left} x2={MARGIN.left + chartW} y1={MARGIN.top + chartH} y2={MARGIN.top + chartH} stroke="hsl(220 13% 30%)" strokeWidth={1} />
          <line x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={MARGIN.top + chartH} stroke="hsl(220 13% 30%)" strokeWidth={1} />

          {/* X label */}
          <text x={MARGIN.left + chartW / 2} y={H - 4} textAnchor="middle" fontSize={9} fill="hsl(215 20% 45%)">
            Trade index
          </text>
          <text x={12} y={MARGIN.top + chartH / 2} textAnchor="middle" fontSize={9} fill="hsl(215 20% 45%)" transform={`rotate(-90, 12, ${MARGIN.top + chartH / 2})`}>
            Sharpe
          </text>
        </svg>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Rolling Win Rate Chart
// ------------------------------------------------------------------
export function RollingWinRateChart() {
  const tradeHistory = useTradingStore((s) => s.tradeHistory);

  const { svgPoints, chartW, chartH } = useMemo(() => {
    const closed = filterClosedTrades(tradeHistory);
    const data = computeRollingWinRate(closed, 20);
    const chartW = W - MARGIN.left - MARGIN.right;
    const chartH = H - MARGIN.top - MARGIN.bottom;

    const svgPoints: LinePoint[] = data.map((d, i) => ({
      x: MARGIN.left + (i / Math.max(1, data.length - 1)) * chartW,
      y: MARGIN.top + (1 - d.winRate) * chartH,
      value: d.winRate,
    }));

    return { svgPoints, chartW, chartH };
  }, [tradeHistory]);

  if (svgPoints.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center text-xs text-muted-foreground">
        Need 20+ trades for rolling win rate
      </div>
    );
  }

  const path = buildLinePath(svgPoints);
  const lastVal = svgPoints[svgPoints.length - 1]?.value ?? 0;
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>20-trade rolling window</span>
        <span className={`font-mono font-semibold ${lastVal >= 0.5 ? "text-green-400" : "text-red-400"}`}>
          Current: {(lastVal * 100).toFixed(0)}%
        </span>
      </div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full max-w-full"
          style={{ minWidth: 260 }}
          aria-label="Rolling win rate"
        >
          {/* Grid */}
          {yTicks.map((v, i) => {
            const y = MARGIN.top + (1 - v) * chartH;
            return (
              <g key={i}>
                <line
                  x1={MARGIN.left} x2={MARGIN.left + chartW}
                  y1={y} y2={y}
                  stroke={v === 0.5 ? "hsl(220 13% 35%)" : "hsl(220 13% 20%)"}
                  strokeWidth={v === 0.5 ? 1 : 0.5}
                  strokeDasharray={v === 0.5 ? undefined : "3 4"}
                />
                <text x={MARGIN.left - 5} y={y + 3.5} textAnchor="end" fontSize={9} fill="hsl(215 20% 50%)">
                  {Math.round(v * 100)}%
                </text>
              </g>
            );
          })}

          {/* 50% reference */}
          <line
            x1={MARGIN.left} x2={MARGIN.left + chartW}
            y1={MARGIN.top + 0.5 * chartH} y2={MARGIN.top + 0.5 * chartH}
            stroke="hsl(220 13% 40%)"
            strokeWidth={1}
            opacity={0.6}
          />

          {/* Filled area above 50% */}
          {svgPoints.length > 1 && (() => {
            const midY = MARGIN.top + 0.5 * chartH;
            const areaPath =
              svgPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") +
              ` L ${svgPoints[svgPoints.length - 1].x.toFixed(1)} ${midY.toFixed(1)}` +
              ` L ${svgPoints[0].x.toFixed(1)} ${midY.toFixed(1)} Z`;
            return (
              <path d={areaPath} fill="hsl(142 55% 45%)" fillOpacity={0.12} />
            );
          })()}

          {/* Line */}
          <path d={path} fill="none" stroke="hsl(142 60% 55%)" strokeWidth={1.5} />

          {/* Axes */}
          <line x1={MARGIN.left} x2={MARGIN.left + chartW} y1={MARGIN.top + chartH} y2={MARGIN.top + chartH} stroke="hsl(220 13% 30%)" strokeWidth={1} />
          <line x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={MARGIN.top + chartH} stroke="hsl(220 13% 30%)" strokeWidth={1} />

          {/* Labels */}
          <text x={MARGIN.left + chartW / 2} y={H - 4} textAnchor="middle" fontSize={9} fill="hsl(215 20% 45%)">
            Trade index
          </text>
          <text x={12} y={MARGIN.top + chartH / 2} textAnchor="middle" fontSize={9} fill="hsl(215 20% 45%)" transform={`rotate(-90, 12, ${MARGIN.top + chartH / 2})`}>
            Win Rate
          </text>
        </svg>
      </div>
    </div>
  );
}
