"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { StrategyLeg } from "@/types/options";
import {
  calculatePayoffCurve,
  calculateBreakevens,
  calculateMaxProfitLoss,
} from "@/services/options/payoff";
import { formatCurrency, cn } from "@/lib/utils";
import { Activity } from "lucide-react";

interface PayoffDiagramProps {
  legs: StrategyLeg[];
  spotPrice: number;
}

const SVG_W = 600;
const SVG_H = 200;
const PAD = { top: 20, right: 20, bottom: 30, left: 55 };
const CHART_W = SVG_W - PAD.left - PAD.right;
const CHART_H = SVG_H - PAD.top - PAD.bottom;

export function PayoffDiagram({ legs, spotPrice }: PayoffDiagramProps) {
  const [hoverX, setHoverX] = useState<number | null>(null);

  const daysToExpiry = legs.length > 0 ? getDaysToExpiry(legs[0].expiry) : 30;
  const [timeSlider, setTimeSlider] = useState(daysToExpiry);

  const expiryPoints = useMemo(
    () => calculatePayoffCurve(legs, spotPrice, 0, 200),
    [legs, spotPrice],
  );

  const currentPoints = useMemo(
    () => calculatePayoffCurve(legs, spotPrice, timeSlider, 200),
    [legs, spotPrice, timeSlider],
  );

  const breakevens = useMemo(
    () => calculateBreakevens(legs, spotPrice),
    [legs, spotPrice],
  );

  const { maxProfit, maxLoss } = useMemo(
    () => calculateMaxProfitLoss(legs, spotPrice),
    [legs, spotPrice],
  );

  if (legs.length === 0 || expiryPoints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1.5 py-8 text-muted-foreground">
        <Activity className="h-5 w-5 opacity-30" />
        <p className="text-[10px]">Select options to see payoff diagram</p>
      </div>
    );
  }

  // Scale calculations
  const allPnls = [
    ...expiryPoints.map((p) => p.pnl),
    ...currentPoints.map((p) => p.pnlCurrentTime),
  ];
  const minPnl = Math.min(...allPnls);
  const maxPnl = Math.max(...allPnls);
  const pnlRange = Math.max(maxPnl - minPnl, 1);
  const pnlPad = pnlRange * 0.1;

  const xMin = expiryPoints[0].spotPrice;
  const xMax = expiryPoints[expiryPoints.length - 1].spotPrice;
  const xRange = xMax - xMin;

  const toX = (s: number) => PAD.left + ((s - xMin) / xRange) * CHART_W;
  const toY = (pnl: number) =>
    PAD.top +
    CHART_H -
    ((pnl - (minPnl - pnlPad)) / (pnlRange + 2 * pnlPad)) * CHART_H;

  const zeroY = toY(0);

  // Build SVG paths
  const expiryPath = expiryPoints
    .map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.spotPrice)},${toY(p.pnl)}`)
    .join(" ");
  const currentPath = currentPoints
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"}${toX(p.spotPrice)},${toY(p.pnlCurrentTime)}`,
    )
    .join(" ");

  // Fill areas (green above zero, red below)
  const fillAbove = buildFillPath(expiryPoints, "pnl", toX, toY, zeroY, true);
  const fillBelow = buildFillPath(
    expiryPoints,
    "pnl",
    toX,
    toY,
    zeroY,
    false,
  );

  // Hover info
  const hoverIdx =
    hoverX !== null
      ? Math.round(
          ((hoverX - PAD.left) / CHART_W) * (expiryPoints.length - 1),
        )
      : null;
  const hoverPoint =
    hoverIdx !== null && hoverIdx >= 0 && hoverIdx < expiryPoints.length
      ? expiryPoints[hoverIdx]
      : null;

  return (
    <div className="px-3 py-2">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * SVG_W;
          setHoverX(x >= PAD.left && x <= SVG_W - PAD.right ? x : null);
        }}
        onMouseLeave={() => setHoverX(null)}
      >
        {/* Zero line */}
        <line
          x1={PAD.left}
          y1={zeroY}
          x2={SVG_W - PAD.right}
          y2={zeroY}
          stroke="#6b7280"
          strokeWidth={0.5}
          strokeDasharray="4 2"
        />

        {/* Fill areas */}
        {fillAbove && (
          <path d={fillAbove} fill="#10b981" fillOpacity={0.08} />
        )}
        {fillBelow && (
          <path d={fillBelow} fill="#ef4444" fillOpacity={0.08} />
        )}

        {/* Current-time P&L (dashed gray) */}
        <path
          d={currentPath}
          fill="none"
          stroke="#6b7280"
          strokeWidth={1}
          strokeDasharray="4 2"
        />

        {/* At-expiry P&L (solid orange) */}
        <path
          d={expiryPath}
          fill="none"
          stroke="#f97316"
          strokeWidth={1.5}
        />

        {/* Current spot line */}
        <line
          x1={toX(spotPrice)}
          y1={PAD.top}
          x2={toX(spotPrice)}
          y2={SVG_H - PAD.bottom}
          stroke="#e2e8f0"
          strokeWidth={0.5}
          strokeDasharray="3 2"
        />
        <text
          x={toX(spotPrice)}
          y={SVG_H - PAD.bottom + 12}
          textAnchor="middle"
          className="fill-muted-foreground text-[8px]"
        >
          ${spotPrice.toFixed(0)}
        </text>

        {/* Breakeven markers */}
        {breakevens.map((be, i) => (
          <g key={i}>
            <line
              x1={toX(be)}
              y1={PAD.top}
              x2={toX(be)}
              y2={SVG_H - PAD.bottom}
              stroke="#f59e0b"
              strokeWidth={0.5}
              strokeDasharray="2 2"
            />
            <text
              x={toX(be)}
              y={PAD.top - 4}
              textAnchor="middle"
              className="fill-amber-400 text-[7px] font-bold"
            >
              BE ${be.toFixed(0)}
            </text>
          </g>
        ))}

        {/* Y-axis labels */}
        {[...new Set([minPnl, 0, maxPnl])].map((val, i) => (
          <text
            key={`y-${i}`}
            x={PAD.left - 4}
            y={toY(val) + 3}
            textAnchor="end"
            className="fill-muted-foreground text-[7px] tabular-nums"
          >
            {val >= 0 ? "+" : ""}
            {formatCurrency(val).replace("$", "")}
          </text>
        ))}

        {/* X-axis labels */}
        {[...new Set([xMin, spotPrice * 0.85, spotPrice, spotPrice * 1.15, xMax].map((v) => +v.toFixed(0)))].map(
          (val, i) => (
            <text
              key={`x-${i}`}
              x={toX(val)}
              y={SVG_H - PAD.bottom + 12}
              textAnchor="middle"
              className="fill-muted-foreground text-[7px] tabular-nums"
            >
              ${val}
            </text>
          ),
        )}

        {/* Hover crosshair */}
        {hoverPoint && hoverX !== null && (
          <>
            <line
              x1={hoverX}
              y1={PAD.top}
              x2={hoverX}
              y2={SVG_H - PAD.bottom}
              stroke="#e2e8f0"
              strokeWidth={0.5}
              strokeOpacity={0.3}
            />
            <circle
              cx={hoverX}
              cy={toY(hoverPoint.pnl)}
              r={3}
              fill="#f97316"
            />
            <rect
              x={hoverX + 5}
              y={toY(hoverPoint.pnl) - 16}
              width={80}
              height={24}
              rx={3}
              fill="#0f1420"
              stroke="#1e293b"
              strokeWidth={0.5}
            />
            <text
              x={hoverX + 10}
              y={toY(hoverPoint.pnl) - 4}
              className="fill-foreground text-[8px] font-bold"
            >
              ${hoverPoint.spotPrice} → {hoverPoint.pnl >= 0 ? "+" : ""}
              {formatCurrency(hoverPoint.pnl).replace("$", "")}
            </text>
          </>
        )}
      </svg>

      {/* Bottom info bar */}
      <div className="mt-1 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[9px]">
          <div className="flex items-center gap-1">
            <div className="h-0.5 w-3 bg-orange-500" />
            <span className="text-muted-foreground">At Expiry</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-0.5 w-3 border-t border-dashed border-gray-500" />
            <span className="text-muted-foreground">Current</span>
          </div>
          <span className="text-muted-foreground">
            Max Profit:{" "}
            <span className="font-bold text-emerald-400">
              {maxProfit === "unlimited"
                ? "Unlimited"
                : formatCurrency(maxProfit as number)}
            </span>
          </span>
          <span className="text-muted-foreground">
            Max Loss:{" "}
            <span className="font-bold text-red-400">
              {maxLoss === "unlimited"
                ? "Unlimited"
                : formatCurrency(maxLoss as number)}
            </span>
          </span>
        </div>

        {/* Time slider */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-muted-foreground">
            DTE: {timeSlider}d
          </span>
          <input
            aria-label="Days to expiry"
            type="range"
            min={0}
            max={daysToExpiry}
            value={timeSlider}
            onChange={(e) => setTimeSlider(Number(e.target.value))}
            className="time-slider w-20"
          />
        </div>
      </div>
    </div>
  );
}

function getDaysToExpiry(expiry: string): number {
  const diff =
    new Date(expiry + "T12:00:00").getTime() - Date.now();
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
}

function buildFillPath(
  points: { spotPrice: number; pnl: number }[],
  _key: string,
  toX: (s: number) => number,
  toY: (p: number) => number,
  zeroY: number,
  above: boolean,
): string | null {
  const segments: string[] = [];
  let inRegion = false;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const isInRegion = above ? p.pnl > 0 : p.pnl < 0;

    if (isInRegion && !inRegion) {
      segments.push(`M${toX(p.spotPrice)},${zeroY}`);
      segments.push(`L${toX(p.spotPrice)},${toY(p.pnl)}`);
      inRegion = true;
    } else if (isInRegion && inRegion) {
      segments.push(`L${toX(p.spotPrice)},${toY(p.pnl)}`);
    } else if (!isInRegion && inRegion) {
      segments.push(`L${toX(p.spotPrice)},${zeroY}`);
      segments.push("Z");
      inRegion = false;
    }
  }

  if (inRegion) {
    segments.push(
      `L${toX(points[points.length - 1].spotPrice)},${zeroY}`,
    );
    segments.push("Z");
  }

  return segments.length > 0 ? segments.join(" ") : null;
}
