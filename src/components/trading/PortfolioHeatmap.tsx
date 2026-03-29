"use client";

import { useMemo, useState } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { formatCurrency, formatPercent } from "@/lib/utils";

// ── Treemap layout (squarified) ──────────────────────────────────────────────

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface TreemapItem {
  ticker: string;
  value: number;    // position $ value
  pct: number;      // unrealizedPnLPercent
  pnlDollar: number;
  rect: Rect;
}

/**
 * Simple row-based treemap layout.
 * Items are sorted by value (descending). Layout fills left→right, row-by-row.
 */
function computeTreemap(
  items: { ticker: string; value: number; pct: number; pnlDollar: number }[],
  width: number,
  height: number,
): TreemapItem[] {
  if (items.length === 0 || width <= 0 || height <= 0) return [];

  const total = items.reduce((s, i) => s + i.value, 0);
  if (total === 0) return [];

  // Sort descending by value
  const sorted = [...items].sort((a, b) => b.value - a.value);

  const result: TreemapItem[] = [];

  // Row-based layout: fill rows greedily
  let y = 0;
  let remaining = [...sorted];

  while (remaining.length > 0 && y < height) {
    const rowHeight = height - y;
    const rowItems: typeof sorted = [];
    let rowValue = 0;
    let rowWidth = 0;

    // Add items to row until aspect ratio worsens
    for (let i = 0; i < remaining.length; i++) {
      const item = remaining[i];
      const testItems = [...rowItems, item];
      const testValue = rowValue + item.value;
      const rowW = (testValue / total) * width;
      // Distribute heights within the row
      let worst = 0;
      for (const ri of testItems) {
        const cellH = (ri.value / testValue) * rowHeight;
        const ar = rowW / cellH > 1 ? rowW / cellH : cellH / rowW;
        if (ar > worst) worst = ar;
      }
      // Accept if it improves or row is empty
      if (rowItems.length === 0 || worst < 4) {
        rowItems.push(item);
        rowValue += item.value;
        rowWidth = rowW;
      } else {
        break;
      }
    }

    if (rowItems.length === 0) {
      // Fallback: just take the next item
      rowItems.push(remaining[0]);
      rowValue = remaining[0].value;
      rowWidth = (rowValue / total) * width;
    }

    // Place row items left-to-right within rowWidth
    let x = 0;
    for (const item of rowItems) {
      const cellW = (item.value / rowValue) * rowWidth;
      const cellH = rowHeight * (rowValue / total) + (rowItems.length === sorted.length ? rowHeight : 0);
      // Simple approach: all items in this row share the same height chunk
      const chunkH = (rowValue / total) * height;
      result.push({
        ...item,
        rect: { x, y, w: cellW, h: chunkH },
      });
      x += cellW;
    }

    y += (rowValue / total) * height;
    remaining = remaining.filter((r) => !rowItems.includes(r));
  }

  return result;
}

// ── Color mapping ─────────────────────────────────────────────────────────────

function pctToColor(pct: number): string {
  if (pct >= 10) return "#059669"; // emerald-600
  if (pct >= 5) return "#10b981";  // emerald-500
  if (pct >= 2) return "#34d399";  // emerald-400
  if (pct >= 0) return "#6ee7b7";  // emerald-300
  if (pct >= -2) return "#fca5a5"; // red-300
  if (pct >= -5) return "#ef4444"; // red-500
  return "#b91c1c";                // red-700
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PortfolioHeatmap() {
  const positions = useTradingStore((s) => s.positions);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);

  const [hovered, setHovered] = useState<string | null>(null);

  const WIDTH = 260;
  const HEIGHT = 140;

  const items = useMemo(
    () =>
      positions.map((p) => ({
        ticker: p.ticker,
        value: p.quantity * p.currentPrice,
        pct: p.unrealizedPnLPercent,
        pnlDollar: p.unrealizedPnL,
      })),
    [positions],
  );

  const cells = useMemo(
    () => computeTreemap(items, WIDTH, HEIGHT),
    [items],
  );

  const totalPnL = positions.reduce((s, p) => s + p.unrealizedPnL, 0);

  if (positions.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
        No open positions
      </div>
    );
  }

  const hoveredPos = hovered ? positions.find((p) => p.ticker === hovered) : null;

  return (
    <div className="px-2 pb-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Portfolio Heatmap
        </span>
        <span
          className={
            totalPnL >= 0 ? "text-xs text-profit" : "text-xs text-loss"
          }
        >
          {totalPnL >= 0 ? "+" : ""}{formatCurrency(totalPnL)}
        </span>
      </div>

      <div className="relative">
        <svg
          width={WIDTH}
          height={HEIGHT}
          className="rounded overflow-hidden border border-border/40"
        >
          {cells.map((cell) => {
            const isHovered = hovered === cell.ticker;
            return (
              <g key={cell.ticker}>
                <rect
                  x={cell.rect.x + 0.5}
                  y={cell.rect.y + 0.5}
                  width={Math.max(0, cell.rect.w - 1)}
                  height={Math.max(0, cell.rect.h - 1)}
                  fill={pctToColor(cell.pct)}
                  fillOpacity={isHovered ? 1 : 0.85}
                  stroke={isHovered ? "#fff" : "rgba(0,0,0,0.3)"}
                  strokeWidth={isHovered ? 1.5 : 0.5}
                  rx={2}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHovered(cell.ticker)}
                  onMouseLeave={() => setHovered(null)}
                />
                {/* Ticker label if cell is big enough */}
                {cell.rect.w > 32 && cell.rect.h > 20 && (
                  <text
                    x={cell.rect.x + cell.rect.w / 2}
                    y={cell.rect.y + cell.rect.h / 2 - (cell.rect.h > 32 ? 6 : 0)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={Math.min(11, Math.max(8, cell.rect.w / 5))}
                    fontWeight="600"
                    fill="rgba(255,255,255,0.95)"
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {cell.ticker}
                  </text>
                )}
                {/* P&L% label if tall enough */}
                {cell.rect.w > 32 && cell.rect.h > 32 && (
                  <text
                    x={cell.rect.x + cell.rect.w / 2}
                    y={cell.rect.y + cell.rect.h / 2 + 8}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={Math.min(9, Math.max(7, cell.rect.w / 6))}
                    fill="rgba(255,255,255,0.8)"
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {cell.pct >= 0 ? "+" : ""}{cell.pct.toFixed(1)}%
                  </text>
                )}
              </g>
            );
          })}
          {/* Total portfolio label bottom-left */}
          <text
            x={4}
            y={HEIGHT - 4}
            fontSize={8}
            fill="rgba(255,255,255,0.4)"
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            Total {formatCurrency(portfolioValue)}
          </text>
        </svg>

        {/* Hover tooltip */}
        {hoveredPos && (
          <div className="absolute top-1 right-0 z-10 rounded border border-border bg-card px-2 py-1 text-xs shadow-sm min-w-[110px]">
            <div className="font-bold">{hoveredPos.ticker}</div>
            <div className="text-muted-foreground">
              Value: {formatCurrency(hoveredPos.quantity * hoveredPos.currentPrice)}
            </div>
            <div
              className={
                hoveredPos.unrealizedPnL >= 0
                  ? "text-profit"
                  : "text-loss"
              }
            >
              P&L: {formatCurrency(hoveredPos.unrealizedPnL)}{" "}
              ({formatPercent(hoveredPos.unrealizedPnLPercent)})
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
