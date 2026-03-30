"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  PRNG — mulberry32 (seed = 99999)                                   */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number): () => number {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/*  Sector data                                                         */
/* ------------------------------------------------------------------ */

interface SectorData {
  name: string;
  abbr: string;
  weight: number; // market cap weight, sum = 100
  returnPct: number;
}

const SECTOR_WEIGHTS: { name: string; abbr: string; weight: number }[] = [
  { name: "Technology",              abbr: "Tech",     weight: 28 },
  { name: "Financials",              abbr: "Fin",      weight: 13 },
  { name: "Healthcare",              abbr: "Health",   weight: 12 },
  { name: "Consumer Discretionary",  abbr: "Cons D",   weight: 11 },
  { name: "Communication Services",  abbr: "Comm",     weight: 9  },
  { name: "Industrials",             abbr: "Indust",   weight: 8  },
  { name: "Consumer Staples",        abbr: "Staples",  weight: 7  },
  { name: "Energy",                  abbr: "Energy",   weight: 4  },
  { name: "Utilities",               abbr: "Util",     weight: 3  },
  { name: "Real Estate",             abbr: "RE",       weight: 3  },
  { name: "Materials",               abbr: "Mat",      weight: 2  },
];

/* ------------------------------------------------------------------ */
/*  Layout helpers                                                      */
/* ------------------------------------------------------------------ */

const TOTAL_W = 600;
const TOTAL_H = 300;
const ROW_TOP_H = 160;
const ROW_BOT_H = TOTAL_H - ROW_TOP_H;
const GAP = 2;

interface Cell {
  sector: SectorData;
  x: number;
  y: number;
  w: number;
  h: number;
}

function buildLayout(sectors: SectorData[]): Cell[] {
  // Top row: 5 largest sectors (index 0-4 already sorted by weight descending)
  const topSectors = sectors.slice(0, 5);
  const botSectors = sectors.slice(5);

  const topWeightSum = topSectors.reduce((s, d) => s + d.weight, 0);
  const botWeightSum = botSectors.reduce((s, d) => s + d.weight, 0);

  const cells: Cell[] = [];

  // Top row
  let curX = 0;
  topSectors.forEach((s, i) => {
    const isLast = i === topSectors.length - 1;
    const rawW = (s.weight / topWeightSum) * TOTAL_W;
    const w = isLast
      ? TOTAL_W - curX - (i > 0 ? GAP : 0)
      : rawW - GAP;
    cells.push({ sector: s, x: curX, y: 0, w: Math.max(w, 1), h: ROW_TOP_H - GAP });
    curX += w + GAP;
  });

  // Bottom row
  curX = 0;
  botSectors.forEach((s, i) => {
    const isLast = i === botSectors.length - 1;
    const rawW = (s.weight / botWeightSum) * TOTAL_W;
    const w = isLast
      ? TOTAL_W - curX - (i > 0 ? GAP : 0)
      : rawW - GAP;
    cells.push({
      sector: s,
      x: curX,
      y: ROW_TOP_H + GAP,
      w: Math.max(w, 1),
      h: ROW_BOT_H - GAP,
    });
    curX += w + GAP;
  });

  return cells;
}

/* ------------------------------------------------------------------ */
/*  Color helper                                                        */
/* ------------------------------------------------------------------ */

function cellColor(ret: number): string {
  // Clamp intensity so even near-zero returns have a legible dark background.
  // Minimum saturation 20% ensures the cell is never a flat, ambiguous grey.
  const intensity = Math.max(20, Math.min(85, Math.abs(ret) * 32));
  const lightness = ret > 0 ? 30 : 26;
  const hue = ret > 0 ? 142 : 0;
  return `hsl(${hue}, ${intensity}%, ${lightness}%)`;
}

/* ------------------------------------------------------------------ */
/*  Tooltip                                                             */
/* ------------------------------------------------------------------ */

interface TooltipState {
  sector: SectorData;
  x: number;
  y: number;
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export function SectorHeatmap() {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const sectors: SectorData[] = useMemo(() => {
    const rng = mulberry32(99999);
    return SECTOR_WEIGHTS.map((s) => ({
      ...s,
      returnPct: parseFloat(((rng() * 6 - 3)).toFixed(2)),
    }));
  }, []);

  const cells = useMemo(() => buildLayout(sectors), [sectors]);

  // Weighted average return for the "index"
  const avgReturn = useMemo(() => {
    const total = sectors.reduce((sum, s) => sum + s.weight, 0);
    return sectors.reduce((sum, s) => sum + (s.returnPct * s.weight) / total, 0);
  }, [sectors]);

  return (
    <div className="space-y-2">
      {/* Sub-header: index return + portfolio heat score */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>S&amp;P 500 sectors — simulated daily return</span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded border px-2 py-0.5 font-semibold tabular-nums",
            avgReturn >= 0
              ? "border-green-500/30 bg-green-500/10 text-green-400"
              : "border-red-500/30 bg-red-500/10 text-red-400",
          )}
        >
          Heat Score: {avgReturn >= 0 ? "+" : ""}{avgReturn.toFixed(2)}%
        </span>
      </div>

      {/* SVG heatmap */}
      <div className="relative overflow-hidden rounded-md">
        <svg
          viewBox={`0 0 ${TOTAL_W} ${TOTAL_H}`}
          width="100%"
          style={{ display: "block" }}
          onMouseLeave={() => setTooltip(null)}
        >
          {cells.map((cell) => {
            const { sector, x, y, w, h } = cell;
            const color = cellColor(sector.returnPct);
            const showFull = w > 80 && h > 40;
            const showAbbr = !showFull && w > 36 && h > 26;
            const showRet = h > 26;
            const label = showFull ? sector.name : showAbbr ? sector.abbr : "";
            const retLabel =
              showRet
                ? `${sector.returnPct >= 0 ? "+" : ""}${sector.returnPct.toFixed(2)}%`
                : "";

            return (
              <g
                key={sector.name}
                style={{ cursor: "pointer" }}
                onMouseEnter={(e) => {
                  const svgRect = (e.currentTarget.closest("svg") as SVGSVGElement).getBoundingClientRect();
                  const scale = svgRect.width / TOTAL_W;
                  setTooltip({
                    sector,
                    x: (x + w / 2) * scale,
                    y: (y + h / 2) * scale,
                  });
                }}
              >
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  fill={color}
                  stroke="hsl(var(--background))"
                  strokeWidth={1}
                  rx={2}
                />
                {label && (
                  <text
                    x={x + w / 2}
                    y={showFull ? y + h / 2 - 7 : y + h / 2 - 4}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="rgba(255,255,255,0.9)"
                    fontSize={showFull ? 11 : 9}
                    fontWeight="600"
                    fontFamily="inherit"
                  >
                    {label}
                  </text>
                )}
                {retLabel && (
                  <text
                    x={x + w / 2}
                    y={label ? (showFull ? y + h / 2 + 8 : y + h / 2 + 8) : y + h / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="rgba(255,255,255,0.75)"
                    fontSize={showFull ? 10 : 8}
                    fontFamily="inherit"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {retLabel}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover tooltip */}
        {tooltip && (
          <div
            className="pointer-events-none absolute z-10 rounded-md border border-border bg-popover px-2.5 py-2 text-[11px] shadow-lg"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: "translate(-50%, -110%)",
            }}
          >
            <p className="font-semibold text-foreground">{tooltip.sector.name}</p>
            <p
              className={
                tooltip.sector.returnPct >= 0 ? "text-green-400" : "text-red-400"
              }
            >
              {tooltip.sector.returnPct >= 0 ? "+" : ""}
              {tooltip.sector.returnPct.toFixed(2)}% today
            </p>
            <p className="text-muted-foreground">
              Weight: {tooltip.sector.weight}%
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <span
            className="inline-block h-2 w-4 rounded-sm"
            style={{ background: cellColor(-2) }}
          />
          &lt; -1%
        </div>
        <div className="flex items-center gap-1">
          <span
            className="inline-block h-2 w-4 rounded-sm"
            style={{ background: cellColor(-0.5) }}
          />
          -1% to 0%
        </div>
        <div className="flex items-center gap-1">
          <span
            className="inline-block h-2 w-4 rounded-sm"
            style={{ background: cellColor(0.5) }}
          />
          0% to +1%
        </div>
        <div className="flex items-center gap-1">
          <span
            className="inline-block h-2 w-4 rounded-sm"
            style={{ background: cellColor(2) }}
          />
          &gt; +1%
        </div>
      </div>
    </div>
  );
}
