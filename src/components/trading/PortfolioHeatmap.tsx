"use client";

import { useMemo } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { formatCurrency } from "@/lib/utils";

// ── Treemap layout (row-based) ───────────────────────────────────────────────

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface TreemapItem {
  ticker: string;
  value: number;
  pct: number;
  pnlDollar: number;
  rect: Rect;
}

function computeTreemap(
  items: { ticker: string; value: number; pct: number; pnlDollar: number }[],
  width: number,
  height: number,
): TreemapItem[] {
  if (items.length === 0 || width <= 0 || height <= 0) return [];

  const total = items.reduce((s, i) => s + i.value, 0);
  if (total === 0) return [];

  // Single item: full rect
  if (items.length === 1) {
    return [{ ...items[0], rect: { x: 0, y: 0, w: width, h: height } }];
  }

  const sorted = [...items].sort((a, b) => b.value - a.value);
  const result: TreemapItem[] = [];

  let y = 0;
  let remaining = [...sorted];

  while (remaining.length > 0 && y < height) {
    const rowItems: typeof sorted = [];
    let rowValue = 0;

    for (let i = 0; i < remaining.length; i++) {
      const item = remaining[i];
      const testItems = [...rowItems, item];
      const testValue = rowValue + item.value;
      const rowW = (testValue / total) * width;
      const rowH = height - y;

      let worst = 0;
      for (const ri of testItems) {
        const cellH = (ri.value / testValue) * rowH;
        const ar = rowW > 0 && cellH > 0 ? Math.max(rowW / cellH, cellH / rowW) : 999;
        if (ar > worst) worst = ar;
      }

      if (rowItems.length === 0 || worst < 4) {
        rowItems.push(item);
        rowValue += item.value;
      } else {
        break;
      }
    }

    if (rowItems.length === 0) {
      rowItems.push(remaining[0]);
      rowValue = remaining[0].value;
    }

    const chunkH = (rowValue / total) * height;
    const rowW = (rowValue / total) * width;
    let x = 0;

    for (const item of rowItems) {
      const cellW = (item.value / rowValue) * rowW;
      result.push({ ...item, rect: { x, y, w: cellW, h: chunkH } });
      x += cellW;
    }

    y += chunkH;
    remaining = remaining.filter((r) => !rowItems.includes(r));
  }

  return result;
}

// ── Color mapping ─────────────────────────────────────────────────────────────

function pctToColor(pct: number): string {
  if (pct > 5)  return "#10b981";               // emerald-500
  if (pct > 2)  return "#34d399";               // emerald-400
  if (pct >= 0) return "rgba(16,185,129,0.3)";  // subtle green
  if (pct > -2) return "rgba(239,68,68,0.3)";   // subtle red
  if (pct > -5) return "#f87171";               // red-400
  return "#ef4444";                             // red-500
}

// ── Component ─────────────────────────────────────────────────────────────────

const WIDTH = 260;
const HEIGHT = 100;

export function PortfolioHeatmap() {
  const positions = useTradingStore((s) => s.positions);

  const items = useMemo(
    () =>
      positions.map((p) => ({
        ticker: p.ticker,
        value: Math.max(p.quantity * p.currentPrice, 0.01),
        pct: p.unrealizedPnLPercent,
        pnlDollar: p.unrealizedPnL,
      })),
    [positions],
  );

  const cells = useMemo(
    () => computeTreemap(items, WIDTH, HEIGHT),
    [items],
  );

  if (positions.length === 0) return null;

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between px-2 py-1 border-t border-border/20">
        <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/30">
          Portfolio Map
        </span>
      </div>

      {/* Heatmap */}
      <div className="px-2 pb-2">
        <svg
          width={WIDTH}
          height={HEIGHT}
          className="rounded overflow-hidden"
          style={{ display: "block" }}
        >
          {cells.map((cell) => {
            const gx = cell.rect.x;
            const gy = cell.rect.y;
            const gw = cell.rect.w;
            const gh = cell.rect.h;
            const showTicker = gw > 32 && gh > 20;
            const showPct   = gw > 32 && gh > 34;
            const showDollar = gw > 40 && gh > 50;
            const sign = cell.pct >= 0 ? "+" : "";

            return (
              <g key={cell.ticker}>
                {/* Cell background */}
                <rect
                  x={gx + 0.5}
                  y={gy + 0.5}
                  width={Math.max(0, gw - 1)}
                  height={Math.max(0, gh - 1)}
                  fill={pctToColor(cell.pct)}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth={1}
                  rx={2}
                />

                {/* Ticker: top-left */}
                {showTicker && (
                  <text
                    x={gx + 5}
                    y={gy + 11}
                    fontSize={11}
                    fontFamily="monospace"
                    fontWeight="600"
                    fill="rgba(255,255,255,0.95)"
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {cell.ticker}
                  </text>
                )}

                {/* P&L% centered */}
                {showPct && (
                  <text
                    x={gx + gw / 2}
                    y={gy + gh / 2 + (showDollar ? -5 : 0)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={13}
                    fontWeight="700"
                    fill="rgba(255,255,255,0.97)"
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {sign}{cell.pct.toFixed(1)}%
                  </text>
                )}

                {/* Dollar P&L below center */}
                {showDollar && (
                  <text
                    x={gx + gw / 2}
                    y={gy + gh / 2 + 10}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={9}
                    fontFamily="monospace"
                    fill="rgba(255,255,255,0.65)"
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {cell.pnlDollar >= 0 ? "+" : ""}{formatCurrency(cell.pnlDollar)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
