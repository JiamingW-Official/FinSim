"use client";

import { useMemo } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { INITIAL_CAPITAL } from "@/types/trading";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { TradeRecord } from "@/types/trading";

interface Props {
  /** Closed trades used to annotate key events (optional). */
  trades?: TradeRecord[];
  height?: number;
}

interface Point {
  x: number;
  y: number;
  value: number;
  label?: string;
  pnl?: number;
}

function polyline(pts: Point[]): string {
  return pts.map((p) => `${p.x},${p.y}`).join(" ");
}

export function JournalEquityCurve({ trades = [], height = 240 }: Props) {
  const equityHistory = useTradingStore((s) => s.equityHistory);

  const {
    points,
    drawdownRanges,
    maxDrawdownPct,
    finalValue,
    minVal,
    maxVal,
    annotations,
  } = useMemo(() => {
    if (equityHistory.length < 2) {
      return {
        points: [],
        drawdownRanges: [],
        maxDrawdownPct: 0,
        finalValue: INITIAL_CAPITAL,
        minVal: INITIAL_CAPITAL,
        maxVal: INITIAL_CAPITAL,
        annotations: [],
      };
    }

    const sorted = [...equityHistory]
      .sort((a, b) => a.timestamp - b.timestamp)
      .filter((s, i, arr) => i === 0 || s.timestamp !== arr[i - 1].timestamp);

    const values = sorted.map((s) => s.portfolioValue);
    const minVal = Math.min(...values, INITIAL_CAPITAL);
    const maxVal = Math.max(...values, INITIAL_CAPITAL);
    const range = maxVal - minVal || 1;

    const W = 600;
    const H = height;
    const PAD_TOP = 16;
    const PAD_BOT = 28;
    const PAD_L = 52;
    const PAD_R = 12;
    const chartW = W - PAD_L - PAD_R;
    const chartH = H - PAD_TOP - PAD_BOT;

    function toX(i: number) {
      return PAD_L + (i / (sorted.length - 1)) * chartW;
    }
    function toY(val: number) {
      return PAD_TOP + chartH - ((val - minVal) / range) * chartH;
    }

    const points: Point[] = sorted.map((s, i) => ({
      x: toX(i),
      y: toY(s.portfolioValue),
      value: s.portfolioValue,
    }));

    // Detect max drawdown ranges
    type DDRange = { startIdx: number; endIdx: number; depth: number };
    const drawdownRanges: DDRange[] = [];
    let peak = values[0];
    let peakIdx = 0;
    let inDD = false;
    let ddStartIdx = 0;
    let maxDD = 0;

    for (let i = 1; i < values.length; i++) {
      if (values[i] >= peak) {
        if (inDD) {
          const depth = (peak - Math.min(...values.slice(ddStartIdx, i))) / peak;
          drawdownRanges.push({ startIdx: ddStartIdx, endIdx: i, depth });
          if (depth > maxDD) maxDD = depth;
          inDD = false;
        }
        peak = values[i];
        peakIdx = i;
      } else {
        if (!inDD) {
          ddStartIdx = peakIdx;
          inDD = true;
        }
      }
    }
    if (inDD) {
      const depth = (peak - Math.min(...values.slice(ddStartIdx))) / peak;
      drawdownRanges.push({ startIdx: ddStartIdx, endIdx: values.length - 1, depth });
      if (depth > maxDD) maxDD = depth;
    }

    // Keep only the largest drawdown for highlighting
    const topDD = [...drawdownRanges].sort((a, b) => b.depth - a.depth).slice(0, 1);

    // Annotations: best and worst closed trades
    const closedTrades = trades.filter((t) => t.realizedPnL !== 0 && t.side === "sell");
    const sorted2 = [...closedTrades].sort((a, b) => b.realizedPnL - a.realizedPnL);
    const best = sorted2[0];
    const worst = sorted2[sorted2.length - 1];

    const annotations: { x: number; y: number; label: string; color: string }[] = [];

    function findClosestIdx(timestamp: number): number {
      let best = 0;
      let bestDiff = Infinity;
      for (let i = 0; i < sorted.length; i++) {
        const diff = Math.abs(sorted[i].timestamp - timestamp);
        if (diff < bestDiff) { bestDiff = diff; best = i; }
      }
      return best;
    }

    if (best) {
      const idx = findClosestIdx(best.timestamp);
      annotations.push({
        x: toX(idx),
        y: toY(sorted[idx].portfolioValue) - 8,
        label: `Best: ${best.ticker} +${formatCurrency(best.realizedPnL)}`,
        color: "#22c55e",
      });
    }
    if (worst && worst !== best) {
      const idx = findClosestIdx(worst.timestamp);
      annotations.push({
        x: toX(idx),
        y: toY(sorted[idx].portfolioValue) + 14,
        label: `Worst: ${worst.ticker} ${formatCurrency(worst.realizedPnL)}`,
        color: "#ef4444",
      });
    }

    // Y-axis labels
    const labelsY = [minVal, (minVal + maxVal) / 2, maxVal].map((v) => ({
      value: v,
      y: toY(v),
    }));

    // X-axis labels (first and last date)
    const dateLabels = [
      { x: PAD_L, label: new Date(sorted[0].timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }) },
      { x: W - PAD_R, label: new Date(sorted[sorted.length - 1].timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }) },
    ];

    return {
      points,
      drawdownRanges: topDD.map((r) => ({
        x1: toX(r.startIdx),
        x2: toX(r.endIdx),
        y1: PAD_TOP,
        y2: H - PAD_BOT,
      })),
      maxDrawdownPct: maxDD * 100,
      finalValue: values[values.length - 1],
      minVal,
      maxVal,
      annotations,
      labelsY,
      dateLabels,
      PAD_L,
      PAD_BOT,
      W,
      H,
    };
  }, [equityHistory, trades, height]);

  if (equityHistory.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground" style={{ height }}>
        <p className="text-sm">No equity history yet</p>
        <Link
          href="/trade"
          className="flex items-center gap-1 rounded-md bg-primary/10 px-3 py-1.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
        >
          Start Trading <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  const W = 600;
  const H = height;
  const PAD_TOP = 16;
  const PAD_BOT = 28;
  const PAD_L = 52;

  const gain = finalValue - INITIAL_CAPITAL;
  const lineColor = gain >= 0 ? "#22c55e" : "#ef4444";
  const areaFill = gain >= 0 ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)";

  // Build area path (close back along bottom)
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const lastPt = points[points.length - 1];
  const firstPt = points[0];
  const areaPath = `${linePath} L${lastPt.x},${H - PAD_BOT} L${firstPt.x},${H - PAD_BOT} Z`;

  // Y-axis ticks
  const range = maxVal - minVal || 1;
  const tickCount = 4;
  const yTicks = Array.from({ length: tickCount }, (_, i) => {
    const val = minVal + (range / (tickCount - 1)) * i;
    const y = PAD_TOP + (H - PAD_TOP - PAD_BOT) - ((val - minVal) / range) * (H - PAD_TOP - PAD_BOT);
    return { val, y };
  });

  return (
    <div className="space-y-1.5">
      {/* Header row */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Portfolio Value</span>
        <div className="flex items-center gap-3">
          <span className={gain >= 0 ? "text-green-400 font-semibold tabular-nums" : "text-red-400 font-semibold tabular-nums"}>
            {gain >= 0 ? "+" : ""}{formatCurrency(gain)} ({gain >= 0 ? "+" : ""}{((gain / INITIAL_CAPITAL) * 100).toFixed(2)}%)
          </span>
          {maxDrawdownPct > 0 && (
            <span className="text-red-400/70 tabular-nums text-[10px]">
              Max DD: -{maxDrawdownPct.toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="none"
      >
        <defs>
          <clipPath id="equity-clip">
            <rect x={PAD_L} y={PAD_TOP} width={W - PAD_L - 12} height={H - PAD_TOP - PAD_BOT} />
          </clipPath>
        </defs>

        {/* Drawdown highlight */}
        {drawdownRanges.map((r, i) => (
          <rect
            key={i}
            x={r.x1}
            y={r.y1}
            width={r.x2 - r.x1}
            height={r.y2 - r.y1}
            fill="rgba(239,68,68,0.08)"
            clipPath="url(#equity-clip)"
          />
        ))}

        {/* Grid lines */}
        {yTicks.map((tick, i) => (
          <line
            key={i}
            x1={PAD_L}
            y1={tick.y}
            x2={W - 12}
            y2={tick.y}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={1}
          />
        ))}

        {/* Y-axis labels */}
        {yTicks.map((tick, i) => (
          <text
            key={i}
            x={PAD_L - 4}
            y={tick.y + 3}
            textAnchor="end"
            fontSize={8}
            fill="#6b7280"
            fontFamily="monospace"
          >
            {tick.val >= 1000
              ? `$${(tick.val / 1000).toFixed(0)}k`
              : `$${tick.val.toFixed(0)}`}
          </text>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill={areaFill} clipPath="url(#equity-clip)" />

        {/* Baseline (initial capital) */}
        {(() => {
          const baseY =
            PAD_TOP +
            (H - PAD_TOP - PAD_BOT) -
            ((INITIAL_CAPITAL - minVal) / range) * (H - PAD_TOP - PAD_BOT);
          return (
            <line
              x1={PAD_L}
              y1={baseY}
              x2={W - 12}
              y2={baseY}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={1}
              strokeDasharray="4 3"
            />
          );
        })()}

        {/* Equity line */}
        <path
          d={linePath}
          fill="none"
          stroke={lineColor}
          strokeWidth={1.5}
          clipPath="url(#equity-clip)"
        />

        {/* Annotations */}
        {annotations.map((ann, i) => (
          <g key={i}>
            <circle cx={ann.x} cy={ann.y + (ann.color === "#22c55e" ? 8 : -14)} r={3} fill={ann.color} opacity={0.8} />
            <text
              x={ann.x}
              y={ann.y}
              textAnchor="middle"
              fontSize={7.5}
              fill={ann.color}
              fontFamily="monospace"
              opacity={0.9}
            >
              {ann.label}
            </text>
          </g>
        ))}

        {/* X-axis date labels */}
        <text x={PAD_L} y={H - 4} fontSize={8} fill="#6b7280" fontFamily="monospace">
          {equityHistory.length > 0 && new Date(
            Math.min(...equityHistory.map((s) => s.timestamp))
          ).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </text>
        <text x={W - 12} y={H - 4} fontSize={8} fill="#6b7280" textAnchor="end" fontFamily="monospace">
          {equityHistory.length > 0 && new Date(
            Math.max(...equityHistory.map((s) => s.timestamp))
          ).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </text>
      </svg>
    </div>
  );
}
