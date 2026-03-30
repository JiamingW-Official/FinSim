"use client";

import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils";

interface RiskRewardChartProps {
  entry: number;
  stopLoss: number;
  takeProfit: number;
  shares: number;
}

const WIDTH = 340;
const HEIGHT = 72;
const PADDING_X = 72;
const LINE_Y = HEIGHT / 2;
const MARKER_R = 5;

export function RiskRewardChart({ entry, stopLoss, takeProfit, shares }: RiskRewardChartProps) {
  const calc = useMemo(() => {
    const risk = entry - stopLoss;
    const reward = takeProfit - entry;
    if (risk <= 0 || reward <= 0) return null;

    const rr = reward / risk;
    const riskDollars = risk * shares;
    const rewardDollars = reward * shares;

    // Map prices to x coordinates within the drawable area
    const minPrice = stopLoss;
    const maxPrice = takeProfit;
    const range = maxPrice - minPrice;

    const toX = (price: number) =>
      PADDING_X + ((price - minPrice) / range) * (WIDTH - PADDING_X * 2);

    const stopX = toX(stopLoss);
    const entryX = toX(entry);
    const targetX = toX(takeProfit);

    return { rr, riskDollars, rewardDollars, stopX, entryX, targetX };
  }, [entry, stopLoss, takeProfit, shares]);

  if (!calc) return null;

  const { rr, riskDollars, rewardDollars, stopX, entryX, targetX } = calc;

  return (
    <div className="rounded-md border border-border/40 bg-muted/30 p-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">
        Risk / Reward
      </div>
      <svg
        width="100%"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="overflow-visible"
        aria-label="Risk reward chart"
      >
        {/* Risk zone: stopLoss → entry */}
        <rect
          x={stopX}
          y={LINE_Y - 10}
          width={entryX - stopX}
          height={20}
          fill="rgb(239 68 68 / 0.15)"
          rx={2}
        />

        {/* Reward zone: entry → takeProfit */}
        <rect
          x={entryX}
          y={LINE_Y - 10}
          width={targetX - entryX}
          height={20}
          fill="rgb(34 197 94 / 0.15)"
          rx={2}
        />

        {/* Horizontal line */}
        <line
          x1={stopX}
          y1={LINE_Y}
          x2={targetX}
          y2={LINE_Y}
          stroke="hsl(var(--border))"
          strokeWidth={1.5}
        />

        {/* Stop loss tick */}
        <line
          x1={stopX}
          y1={LINE_Y - 12}
          x2={stopX}
          y2={LINE_Y + 12}
          stroke="rgb(239 68 68)"
          strokeWidth={1.5}
        />

        {/* Take profit tick */}
        <line
          x1={targetX}
          y1={LINE_Y - 12}
          x2={targetX}
          y2={LINE_Y + 12}
          stroke="rgb(34 197 94)"
          strokeWidth={1.5}
        />

        {/* Entry marker */}
        <circle
          cx={entryX}
          cy={LINE_Y}
          r={MARKER_R}
          fill="hsl(var(--background))"
          stroke="hsl(var(--foreground))"
          strokeWidth={1.5}
        />

        {/* Risk label */}
        <text
          x={stopX}
          y={LINE_Y - 17}
          textAnchor="middle"
          fontSize={9}
          fill="rgb(239 68 68)"
          fontFamily="inherit"
          fontWeight={600}
        >
          -{formatCurrency(riskDollars)}
        </text>

        {/* Reward label */}
        <text
          x={targetX}
          y={LINE_Y - 17}
          textAnchor="middle"
          fontSize={9}
          fill="rgb(34 197 94)"
          fontFamily="inherit"
          fontWeight={600}
        >
          +{formatCurrency(rewardDollars)}
        </text>

        {/* Stop price label */}
        <text
          x={stopX}
          y={LINE_Y + 22}
          textAnchor="middle"
          fontSize={8}
          fill="rgb(239 68 68)"
          fontFamily="inherit"
        >
          {formatCurrency(stopLoss)}
        </text>

        {/* Entry price label */}
        <text
          x={entryX}
          y={LINE_Y + 22}
          textAnchor="middle"
          fontSize={8}
          fill="hsl(var(--muted-foreground))"
          fontFamily="inherit"
        >
          {formatCurrency(entry)}
        </text>

        {/* Target price label */}
        <text
          x={targetX}
          y={LINE_Y + 22}
          textAnchor="middle"
          fontSize={8}
          fill="rgb(34 197 94)"
          fontFamily="inherit"
        >
          {formatCurrency(takeProfit)}
        </text>

        {/* R:R ratio centered between entry and target */}
        <text
          x={(entryX + targetX) / 2}
          y={LINE_Y + 5}
          textAnchor="middle"
          fontSize={9}
          fill="rgb(34 197 94)"
          fontFamily="inherit"
          fontWeight={700}
        >
          {rr.toFixed(2)}R
        </text>

        {/* Risk label in risk zone */}
        <text
          x={(stopX + entryX) / 2}
          y={LINE_Y + 5}
          textAnchor="middle"
          fontSize={9}
          fill="rgb(239 68 68)"
          fontFamily="inherit"
          fontWeight={700}
        >
          1R
        </text>
      </svg>
    </div>
  );
}
