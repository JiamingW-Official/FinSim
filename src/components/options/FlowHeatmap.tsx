"use client";

import { useState, useId } from "react";
import { cn } from "@/lib/utils";
import type { UnusualActivityItem } from "@/types/options";

// ── Props ─────────────────────────────────────────────────────────────────────

interface FlowHeatmapProps {
  items: UnusualActivityItem[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TICKERS = ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "GOOG", "META", "JPM", "SPY", "QQQ"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toFixed(0);
}

/** Map a net flow value to a green/red/neutral color with opacity. */
function flowColor(net: number, maxAbs: number): string {
  if (maxAbs === 0) return "hsl(var(--muted))";
  const ratio = Math.min(1, Math.abs(net) / maxAbs);
  if (net > 0) {
    // green: emerald-500 with opacity
    const alpha = 0.15 + ratio * 0.7;
    return `rgba(52, 211, 153, ${alpha.toFixed(2)})`;
  }
  if (net < 0) {
    // red: rose-500 with opacity
    const alpha = 0.15 + ratio * 0.7;
    return `rgba(251, 113, 133, ${alpha.toFixed(2)})`;
  }
  return "rgba(100,100,100,0.15)";
}

function textColorClass(net: number): string {
  if (net > 0) return "fill-emerald-400";
  if (net < 0) return "fill-red-400";
  return "fill-muted-foreground";
}

// ── Component ─────────────────────────────────────────────────────────────────

export function FlowHeatmap({ items }: FlowHeatmapProps) {
  const uid = useId();
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    ticker: string;
    expiry: string;
    callFlow: number;
    putFlow: number;
    netFlow: number;
    totalVol: number;
  } | null>(null);

  // Build 4 nearest expiries across all items
  const expiries = Array.from(new Set(items.map((i) => i.expiry)))
    .sort()
    .slice(0, 4);

  // Aggregate net flow per (ticker, expiry)
  // net flow = call premium bought - put premium bought (bullish bias > 0)
  type CellData = {
    callFlow: number;
    putFlow: number;
    netFlow: number;
    totalVol: number;
  };

  const grid: Record<string, Record<string, CellData>> = {};
  for (const ticker of TICKERS) {
    grid[ticker] = {};
    for (const expiry of expiries) {
      grid[ticker][expiry] = { callFlow: 0, putFlow: 0, netFlow: 0, totalVol: 0 };
    }
  }

  for (const item of items) {
    const cell = grid[item.ticker]?.[item.expiry];
    if (!cell) continue;
    const flow = item.side === "ask" ? item.premium : -item.premium;
    if (item.type === "call") {
      cell.callFlow += flow;
    } else {
      cell.putFlow += flow;
    }
    cell.totalVol += item.size;
  }

  // Compute net flow and find max absolute value for color scaling
  let maxAbs = 0;
  let maxVol = 0;
  for (const ticker of TICKERS) {
    for (const expiry of expiries) {
      const cell = grid[ticker][expiry];
      cell.netFlow = cell.callFlow + cell.putFlow;
      const abs = Math.abs(cell.netFlow);
      if (abs > maxAbs) maxAbs = abs;
      if (cell.totalVol > maxVol) maxVol = cell.totalVol;
    }
  }

  // SVG layout
  const MARGIN_LEFT = 52;
  const MARGIN_TOP = 28;
  const MARGIN_BOTTOM = 16;
  const LEGEND_HEIGHT = 24;
  const COL_W = 80;
  const BASE_ROW_H = 28;
  const svgWidth = MARGIN_LEFT + expiries.length * COL_W + 4;
  const svgHeight = MARGIN_TOP + TICKERS.length * BASE_ROW_H + MARGIN_BOTTOM + LEGEND_HEIGHT;

  // Legend gradient stops
  const LEGEND_W = 160;
  const LEGEND_X = MARGIN_LEFT;
  const LEGEND_Y = MARGIN_TOP + TICKERS.length * BASE_ROW_H + 6;

  return (
    <div className="relative">
      <svg
        width="100%"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="overflow-visible"
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id={`${uid}-legend`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="rgba(251,113,133,0.85)" />
            <stop offset="50%" stopColor="rgba(100,100,100,0.2)" />
            <stop offset="100%" stopColor="rgba(52,211,153,0.85)" />
          </linearGradient>
        </defs>

        {/* Column headers (expiry labels) */}
        {expiries.map((expiry, ci) => (
          <text
            key={expiry}
            x={MARGIN_LEFT + ci * COL_W + COL_W / 2}
            y={MARGIN_TOP - 8}
            textAnchor="middle"
            fontSize={9}
            className="fill-muted-foreground font-medium"
          >
            {expiry.slice(5)}
          </text>
        ))}

        {/* Rows */}
        {TICKERS.map((ticker, ri) => {
          const y = MARGIN_TOP + ri * BASE_ROW_H;
          return (
            <g key={ticker}>
              {/* Ticker label */}
              <text
                x={MARGIN_LEFT - 4}
                y={y + BASE_ROW_H / 2 + 4}
                textAnchor="end"
                fontSize={9}
                className="fill-muted-foreground font-medium"
              >
                {ticker}
              </text>

              {expiries.map((expiry, ci) => {
                const cell = grid[ticker][expiry];
                const cellX = MARGIN_LEFT + ci * COL_W + 2;
                const cellY = y + 2;
                const cellW = COL_W - 4;
                const cellH = BASE_ROW_H - 4;

                // Size proportional to total volume
                const volRatio = maxVol > 0 ? Math.min(1, cell.totalVol / maxVol) : 0;
                const pad = cellH * (1 - volRatio) * 0.35;
                const rX = cellX + pad;
                const rY = cellY + pad;
                const rW = Math.max(4, cellW - pad * 2);
                const rH = Math.max(4, cellH - pad * 2);

                const bg = flowColor(cell.netFlow, maxAbs);
                const hasFlow = cell.netFlow !== 0 || cell.totalVol > 0;

                return (
                  <g
                    key={expiry}
                    onMouseEnter={(e) => {
                      if (!hasFlow) return;
                      const svgEl = (e.currentTarget as SVGElement).ownerSVGElement;
                      const rect = svgEl?.getBoundingClientRect();
                      if (!rect) return;
                      setTooltip({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top - 8,
                        ticker,
                        expiry,
                        callFlow: cell.callFlow,
                        putFlow: cell.putFlow,
                        netFlow: cell.netFlow,
                        totalVol: cell.totalVol,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    className="cursor-pointer"
                  >
                    {/* Background full cell (hover target) */}
                    <rect
                      x={cellX}
                      y={cellY}
                      width={cellW}
                      height={cellH}
                      fill="transparent"
                    />
                    {/* Sized rect */}
                    <rect
                      x={rX}
                      y={rY}
                      width={rW}
                      height={rH}
                      rx={3}
                      fill={bg}
                      stroke={hasFlow ? "rgba(255,255,255,0.06)" : "none"}
                      strokeWidth={0.5}
                    />
                    {/* Net flow label */}
                    {hasFlow && (
                      <text
                        x={cellX + cellW / 2}
                        y={cellY + cellH / 2 + 3}
                        textAnchor="middle"
                        fontSize={8}
                        className={textColorClass(cell.netFlow)}
                        fontWeight={500}
                      >
                        {formatCompact(cell.netFlow)}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Legend bar */}
        <rect
          x={LEGEND_X}
          y={LEGEND_Y}
          width={LEGEND_W}
          height={10}
          rx={3}
          fill={`url(#${uid}-legend)`}
        />
        <text x={LEGEND_X} y={LEGEND_Y + 20} fontSize={8} className="fill-muted-foreground">
          Put flow
        </text>
        <text
          x={LEGEND_X + LEGEND_W / 2}
          y={LEGEND_Y + 20}
          textAnchor="middle"
          fontSize={8}
          className="fill-muted-foreground"
        >
          Neutral
        </text>
        <text
          x={LEGEND_X + LEGEND_W}
          y={LEGEND_Y + 20}
          textAnchor="end"
          fontSize={8}
          className="fill-muted-foreground"
        >
          Call flow
        </text>
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-20 rounded-md border border-border bg-popover p-2 shadow-lg"
          style={{
            left: Math.min(tooltip.x + 8, (svgWidth * 0.75)),
            top: tooltip.y - 60,
            minWidth: 160,
          }}
        >
          <div className="mb-1 flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold">{tooltip.ticker}</span>
            <span className="text-xs text-muted-foreground">{tooltip.expiry.slice(5)}</span>
          </div>
          <div className="space-y-0.5 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Call flow</span>
              <span className={cn(tooltip.callFlow >= 0 ? "text-emerald-400" : "text-red-400")}>
                {formatCompact(tooltip.callFlow)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Put flow</span>
              <span className={cn(tooltip.putFlow >= 0 ? "text-emerald-400" : "text-red-400")}>
                {formatCompact(tooltip.putFlow)}
              </span>
            </div>
            <div className="flex justify-between gap-4 border-t border-border/50 pt-0.5 font-medium">
              <span className="text-muted-foreground">Net</span>
              <span className={cn(tooltip.netFlow > 0 ? "text-emerald-400" : tooltip.netFlow < 0 ? "text-red-400" : "text-foreground")}>
                {formatCompact(tooltip.netFlow)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Total Vol</span>
              <span>{tooltip.totalVol.toLocaleString()} contracts</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
