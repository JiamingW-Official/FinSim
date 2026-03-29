"use client";

import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SurfaceCell {
  strikeIndex: number;
  expiryIndex: number;
  strike: number;
  expiry: string;
  iv: number;
}

interface TooltipState {
  cell: SurfaceCell;
  x: number;
  y: number;
}

type ViewAngle = "front-left" | "front-right" | "top-down";

// ── PRNG ─────────────────────────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 0xffffffff;
  };
}

// ── Constants ────────────────────────────────────────────────────────────────

const EXPIRY_LABELS = ["1W", "2W", "1M", "2M", "3M", "6M", "1Y"];
const EXPIRY_DAYS = [7, 14, 30, 60, 90, 180, 365];
const NUM_STRIKES = 10;
const NUM_EXPIRIES = 7;

// ── Color interpolation: dark blue → green → orange/red ──────────────────────

function ivToColor(iv: number, minIV: number, maxIV: number): string {
  const t = Math.max(0, Math.min(1, (iv - minIV) / Math.max(1, maxIV - minIV)));
  // HSL: 220 (blue) → 140 (green) → 30 (orange) → 0 (red)
  let h: number;
  let s: number;
  let l: number;
  if (t < 0.5) {
    const tt = t * 2;
    h = 220 - tt * 80; // 220 → 140
    s = 70 + tt * 10;
    l = 25 + tt * 15;
  } else {
    const tt = (t - 0.5) * 2;
    h = 140 - tt * 140; // 140 → 0
    s = 80 + tt * 10;
    l = 40 - tt * 10;
  }
  return `hsl(${h.toFixed(0)},${s.toFixed(0)}%,${l.toFixed(0)}%)`;
}

// ── Isometric projection helpers ──────────────────────────────────────────────

type IsoConfig = {
  cx: number;
  cy: number;
  cellW: number;
  cellH: number;
  zScale: number;
  angle: ViewAngle;
};

function isoProject(
  xi: number,
  yi: number,
  z: number,
  cfg: IsoConfig,
): { x: number; y: number } {
  const { cx, cy, cellW, cellH, zScale, angle } = cfg;

  if (angle === "top-down") {
    return {
      x: cx + (xi - NUM_STRIKES / 2) * cellW * 0.8,
      y: cy + (yi - NUM_EXPIRIES / 2) * cellH * 1.1,
    };
  }

  // Front-left: X axis goes lower-right, Y axis goes lower-left
  // Front-right: X axis goes lower-left, Y axis goes lower-right
  const flip = angle === "front-right" ? -1 : 1;

  const px =
    cx +
    flip * (xi - NUM_STRIKES / 2) * cellW * Math.cos(Math.PI / 6) -
    (yi - NUM_EXPIRIES / 2) * cellH * Math.cos(Math.PI / 6);
  const py =
    cy +
    (xi - NUM_STRIKES / 2) * cellW * Math.sin(Math.PI / 6) +
    (yi - NUM_EXPIRIES / 2) * cellH * Math.sin(Math.PI / 6) -
    z * zScale;

  return { x: px, y: py };
}

function cellParallelogram(
  xi: number,
  yi: number,
  zVal: number,
  cfg: IsoConfig,
): string {
  const p0 = isoProject(xi, yi, zVal, cfg);
  const p1 = isoProject(xi + 1, yi, zVal, cfg);
  const p2 = isoProject(xi + 1, yi + 1, zVal, cfg);
  const p3 = isoProject(xi, yi + 1, zVal, cfg);
  return `${p0.x},${p0.y} ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`;
}

// ── Surface data generation ───────────────────────────────────────────────────

function generateSurface(
  spotPrice: number,
  skew: number,
  termSlope: "normal" | "inverted" | "flat",
  volShift: number,
): SurfaceCell[][] {
  const rand = mulberry32(Math.round(spotPrice * 100));
  const seed2 = rand;

  const baseIV = 0.25 + (seed2() - 0.5) * 0.1 + volShift / 100;

  // Term structure base ATM IVs per expiry
  const atmIVs: number[] = EXPIRY_DAYS.map((dte) => {
    let tv: number;
    if (termSlope === "normal") {
      // contango-like: shorter = higher
      tv = baseIV * (1 + 0.4 * Math.exp(-dte / 60));
    } else if (termSlope === "inverted") {
      tv = baseIV * (1 + 0.3 * (dte / 365));
    } else {
      tv = baseIV;
    }
    // Small noise per expiry
    return Math.max(0.05, tv + (rand() - 0.5) * 0.03);
  });

  const strikes: number[] = Array.from({ length: NUM_STRIKES }, (_, i) => {
    const pct = -0.3 + (i / (NUM_STRIKES - 1)) * 0.6;
    return spotPrice * (1 + pct);
  });

  const cells: SurfaceCell[][] = [];

  for (let yi = 0; yi < NUM_EXPIRIES; yi++) {
    const row: SurfaceCell[] = [];
    const atmIV = atmIVs[yi];
    const dte = EXPIRY_DAYS[yi];

    for (let xi = 0; xi < NUM_STRIKES; xi++) {
      const strike = strikes[xi];
      const moneyness = Math.log(strike / spotPrice); // ln(K/S)

      // Vol smile: U-shape with skew
      // skew param: positive = put skew higher (negative moneyness gets higher IV)
      const smileBase = atmIV + 0.8 * moneyness * moneyness;
      const skewAdjust = -(skew / 100) * moneyness;
      // Shorter expiry = more pronounced smile
      const smileAmplitude = 1 + 0.5 * Math.exp(-dte / 30);

      const iv =
        Math.max(0.03, smileBase * smileAmplitude + skewAdjust + (rand() - 0.5) * 0.01);

      row.push({
        strikeIndex: xi,
        expiryIndex: yi,
        strike,
        expiry: EXPIRY_LABELS[yi],
        iv,
      });
    }
    cells.push(row);
  }

  return cells;
}

// ── Vol Smile Cross-Section ───────────────────────────────────────────────────

function SmileChart({
  cells,
  spotPrice,
  selectedExpiry,
}: {
  cells: SurfaceCell[][];
  spotPrice: number;
  selectedExpiry: number;
}) {
  const row = cells[selectedExpiry];
  if (!row || row.length === 0) return null;

  const W = 480;
  const H = 160;
  const padL = 44;
  const padR = 16;
  const padT = 16;
  const padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const ivs = row.map((c) => c.iv);
  const strikes = row.map((c) => c.strike);
  const minStrike = strikes[0];
  const maxStrike = strikes[strikes.length - 1];
  const minIV = Math.min(...ivs) * 0.95;
  const maxIV = Math.max(...ivs) * 1.05;

  const sx = (s: number) => padL + ((s - minStrike) / (maxStrike - minStrike)) * chartW;
  const sy = (v: number) => padT + chartH - ((v - minIV) / (maxIV - minIV)) * chartH;

  // Historical average: slightly lower, flatter smile
  const histRow = row.map((c) => ({ ...c, iv: c.iv * 0.9 + 0.02 }));

  // Key strikes
  const atmIdx = row.reduce(
    (best, c, i) => (Math.abs(c.strike - spotPrice) < Math.abs(row[best].strike - spotPrice) ? i : best),
    0,
  );

  // Approx delta markers: 25d put ~0.85*spot, 25d call ~1.15*spot, 10d ~0.75/1.25
  const markers = [
    { label: "10d P", ratio: 0.75 },
    { label: "25d P", ratio: 0.875 },
    { label: "ATM", ratio: 1.0 },
    { label: "25d C", ratio: 1.125 },
    { label: "10d C", ratio: 1.25 },
  ];

  const getIVAtRatio = (ratio: number) => {
    const targetStrike = spotPrice * ratio;
    // Interpolate
    for (let i = 0; i < row.length - 1; i++) {
      if (row[i].strike <= targetStrike && row[i + 1].strike >= targetStrike) {
        const t = (targetStrike - row[i].strike) / (row[i + 1].strike - row[i].strike);
        return row[i].iv + t * (row[i + 1].iv - row[i].iv);
      }
    }
    return row[atmIdx].iv;
  };

  const iv25dCall = getIVAtRatio(1.125);
  const iv25dPut = getIVAtRatio(0.875);
  const ivAtm = row[atmIdx].iv;

  const riskReversal = (iv25dCall - iv25dPut) * 100;
  const butterfly = (iv25dCall + iv25dPut - 2 * ivAtm) * 100;

  // Polyline points
  const smilePts = row.map((c) => `${sx(c.strike)},${sy(c.iv)}`).join(" ");
  const histPts = histRow.map((c) => `${sx(c.strike)},${sy(c.iv)}`).join(" ");

  return (
    <div className="flex flex-col gap-2">
      {/* Stat chips */}
      <div className="flex items-center gap-3 px-3">
        <div className="flex items-center gap-1.5 rounded bg-muted/40 px-2 py-1">
          <span className="text-[11px] text-muted-foreground">Risk Reversal</span>
          <span className={cn("text-xs font-bold", riskReversal >= 0 ? "text-emerald-400" : "text-red-400")}>
            {riskReversal >= 0 ? "+" : ""}{riskReversal.toFixed(1)}pp
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded bg-muted/40 px-2 py-1">
          <span className="text-[11px] text-muted-foreground">Butterfly</span>
          <span className="text-xs font-bold text-amber-400">
            {butterfly.toFixed(1)}pp
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded bg-muted/40 px-2 py-1">
          <span className="text-[11px] text-muted-foreground">ATM IV</span>
          <span className="text-xs font-bold text-foreground">
            {(ivAtm * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* SVG chart */}
      <div className="overflow-x-auto px-3">
        <svg width={W} height={H} className="block">
          {/* Grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const yv = minIV + t * (maxIV - minIV);
            const yy = sy(yv);
            return (
              <g key={t}>
                <line x1={padL} y1={yy} x2={W - padR} y2={yy} stroke="#ffffff10" strokeWidth={1} />
                <text x={padL - 4} y={yy + 3} fontSize={8} fill="#888" textAnchor="end">
                  {(yv * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}

          {/* Historical smile (dashed) */}
          <polyline
            points={histPts}
            fill="none"
            stroke="#6b7280"
            strokeWidth={1.5}
            strokeDasharray="4,3"
          />

          {/* Current smile (solid) */}
          <polyline
            points={smilePts}
            fill="none"
            stroke="#fb923c"
            strokeWidth={2}
          />

          {/* Delta markers */}
          {markers.map((m) => {
            const ts = spotPrice * m.ratio;
            if (ts < minStrike || ts > maxStrike) return null;
            const xm = sx(ts);
            const iv = getIVAtRatio(m.ratio);
            const ym = sy(iv);
            const isAtm = m.label === "ATM";
            return (
              <g key={m.label}>
                <line
                  x1={xm}
                  y1={padT}
                  x2={xm}
                  y2={padT + chartH}
                  stroke={isAtm ? "#fb923c" : "#ffffff20"}
                  strokeWidth={isAtm ? 1.5 : 1}
                  strokeDasharray={isAtm ? undefined : "2,2"}
                />
                <circle cx={xm} cy={ym} r={3} fill={isAtm ? "#fb923c" : "#60a5fa"} />
                <text
                  x={xm}
                  y={padT + chartH + 12}
                  fontSize={7}
                  fill={isAtm ? "#fb923c" : "#9ca3af"}
                  textAnchor="middle"
                >
                  {m.label}
                </text>
              </g>
            );
          })}

          {/* X-axis labels (strike prices) */}
          {row
            .filter((_, i) => i % 3 === 0 || i === row.length - 1)
            .map((c) => (
              <text
                key={c.strike}
                x={sx(c.strike)}
                y={H - 4}
                fontSize={7}
                fill="#6b7280"
                textAnchor="middle"
              >
                {(c.strike / spotPrice * 100).toFixed(0)}%
              </text>
            ))}

          {/* Legend */}
          <line x1={W - 120} y1={padT + 6} x2={W - 104} y2={padT + 6} stroke="#fb923c" strokeWidth={2} />
          <text x={W - 100} y={padT + 9} fontSize={8} fill="#fb923c">Current</text>
          <line
            x1={W - 120}
            y1={padT + 18}
            x2={W - 104}
            y2={padT + 18}
            stroke="#6b7280"
            strokeWidth={1.5}
            strokeDasharray="4,3"
          />
          <text x={W - 100} y={padT + 21} fontSize={8} fill="#6b7280">Hist Avg</text>
        </svg>
      </div>
    </div>
  );
}

// ── Term Structure Panel ──────────────────────────────────────────────────────

function TermStructurePanel({ cells }: { cells: SurfaceCell[][] }) {
  const W = 400;
  const H = 130;
  const padL = 44;
  const padR = 16;
  const padT = 14;
  const padB = 32;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const atmIVs = cells.map((row) => {
    const atmIdx = Math.floor(row.length / 2);
    return row[atmIdx]?.iv ?? 0;
  });

  const minIV = Math.min(...atmIVs) * 0.9;
  const maxIV = Math.max(...atmIVs) * 1.1;

  const sx = (i: number) => padL + (i / (NUM_EXPIRIES - 1)) * chartW;
  const sy = (v: number) => padT + chartH - ((v - minIV) / (maxIV - minIV)) * chartH;

  const pts = atmIVs.map((iv, i) => `${sx(i)},${sy(iv)}`).join(" ");

  // Calendar spread warning: front > back by >5pp
  const frontIV = atmIVs[0];
  const backIV = atmIVs[3] ?? atmIVs[atmIVs.length - 1];
  const spread = (frontIV - backIV) * 100;
  const isBackwardation = spread > 5;

  const slopeLabel =
    atmIVs[0] > atmIVs[atmIVs.length - 1]
      ? "Backwardation (near-term elevated)"
      : "Contango (term premium)";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 px-3">
        <div className={cn(
          "flex items-center gap-1.5 rounded px-2 py-1 text-[11px]",
          isBackwardation ? "bg-amber-500/20 text-amber-400" : "bg-muted/40 text-muted-foreground",
        )}>
          {slopeLabel}
        </div>
        {isBackwardation && (
          <div className="flex items-center gap-1.5 rounded bg-amber-500/20 px-2 py-1">
            <span className="text-[11px] text-amber-300">Calendar opp: front–back</span>
            <span className="text-xs font-bold text-amber-400">
              +{spread.toFixed(1)}pp
            </span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto px-3">
        <svg width={W} height={H} className="block">
          {/* Grid */}
          {[0, 0.5, 1].map((t) => {
            const yv = minIV + t * (maxIV - minIV);
            const yy = sy(yv);
            return (
              <g key={t}>
                <line x1={padL} y1={yy} x2={W - padR} y2={yy} stroke="#ffffff10" strokeWidth={1} />
                <text x={padL - 4} y={yy + 3} fontSize={8} fill="#888" textAnchor="end">
                  {(yv * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <polyline
            points={[`${sx(0)},${padT + chartH}`, ...atmIVs.map((iv, i) => `${sx(i)},${sy(iv)}`), `${sx(NUM_EXPIRIES - 1)},${padT + chartH}`].join(" ")}
            fill="url(#tsGrad)"
            opacity={0.3}
          />
          <defs>
            <linearGradient id="tsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#fb923c" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Line */}
          <polyline points={pts} fill="none" stroke="#fb923c" strokeWidth={2} />

          {/* Points */}
          {atmIVs.map((iv, i) => (
            <g key={i}>
              <circle cx={sx(i)} cy={sy(iv)} r={3.5} fill="#fb923c" />
              <text x={sx(i)} y={padT + chartH + 14} fontSize={8} fill="#9ca3af" textAnchor="middle">
                {EXPIRY_LABELS[i]}
              </text>
              <text x={sx(i)} y={sy(iv) - 7} fontSize={8} fill="#fb923c" textAnchor="middle">
                {(iv * 100).toFixed(0)}%
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ── Color Legend ──────────────────────────────────────────────────────────────

function ColorLegend({ minIV, maxIV }: { minIV: number; maxIV: number }) {
  const stops = [0, 0.25, 0.5, 0.75, 1];
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-muted-foreground">IV</span>
      <div className="relative h-3 w-40 overflow-hidden rounded-full">
        <svg width={160} height={12} className="block">
          <defs>
            <linearGradient id="ivLegendGrad" x1="0" y1="0" x2="1" y2="0">
              {stops.map((t) => (
                <stop key={t} offset={`${t * 100}%`} stopColor={ivToColor(minIV + t * (maxIV - minIV), minIV, maxIV)} />
              ))}
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={160} height={12} fill="url(#ivLegendGrad)" rx={6} />
        </svg>
      </div>
      <span className="text-[11px] text-muted-foreground">
        {(minIV * 100).toFixed(0)}% → {(maxIV * 100).toFixed(0)}%
      </span>
    </div>
  );
}

// ── 3D Isometric Grid ─────────────────────────────────────────────────────────

function IsoGrid({
  cells,
  spotPrice,
  viewAngle,
  onHover,
}: {
  cells: SurfaceCell[][];
  spotPrice: number;
  viewAngle: ViewAngle;
  onHover: (cell: SurfaceCell | null, svgX: number, svgY: number) => void;
}) {
  const W = 560;
  const H = 340;

  const allIVs = cells.flat().map((c) => c.iv);
  const minIV = Math.min(...allIVs);
  const maxIV = Math.max(...allIVs);
  const ivRange = maxIV - minIV;

  const cfg: IsoConfig =
    viewAngle === "top-down"
      ? { cx: W / 2, cy: H / 2, cellW: 42, cellH: 30, zScale: 0, angle: viewAngle }
      : { cx: W / 2, cy: H * 0.58, cellW: 40, cellH: 36, zScale: 90, angle: viewAngle };

  // For isometric, we need to draw in correct back-to-front order
  const drawOrder: [number, number][] = [];
  if (viewAngle === "top-down") {
    for (let yi = 0; yi < NUM_EXPIRIES; yi++) {
      for (let xi = 0; xi < NUM_STRIKES; xi++) {
        drawOrder.push([xi, yi]);
      }
    }
  } else if (viewAngle === "front-left") {
    // Draw far first (high xi, high yi)
    for (let xi = NUM_STRIKES - 1; xi >= 0; xi--) {
      for (let yi = NUM_EXPIRIES - 1; yi >= 0; yi--) {
        drawOrder.push([xi, yi]);
      }
    }
  } else {
    // front-right: far first (low xi, high yi)
    for (let xi = 0; xi < NUM_STRIKES; xi++) {
      for (let yi = NUM_EXPIRIES - 1; yi >= 0; yi--) {
        drawOrder.push([xi, yi]);
      }
    }
  }

  // Axis labels
  const strikePcts = Array.from({ length: NUM_STRIKES }, (_, i) => {
    const pct = -30 + (i / (NUM_STRIKES - 1)) * 60;
    return `${pct >= 0 ? "+" : ""}${pct.toFixed(0)}%`;
  });

  return (
    <svg
      width={W}
      height={H}
      className="block cursor-crosshair"
      onMouseLeave={() => onHover(null, 0, 0)}
    >
      {/* Grid cells */}
      {drawOrder.map(([xi, yi]) => {
        const cell = cells[yi][xi];
        const z = ((cell.iv - minIV) / Math.max(ivRange, 0.01)) * 1.0;
        const color = ivToColor(cell.iv, minIV, maxIV);
        const pts = cellParallelogram(xi, yi, z, cfg);

        // Slight shading for depth
        const shade =
          viewAngle === "top-down"
            ? 0
            : xi % 2 === 0
            ? 0.05
            : 0;

        return (
          <polygon
            key={`${xi}-${yi}`}
            points={pts}
            fill={color}
            fillOpacity={1 - shade}
            stroke="#000"
            strokeWidth={0.5}
            strokeOpacity={0.5}
            onMouseMove={(e) => {
              const rect = (e.target as SVGElement).closest("svg")!.getBoundingClientRect();
              onHover(cell, e.clientX - rect.left, e.clientY - rect.top);
            }}
          />
        );
      })}

      {/* Strike axis labels */}
      {viewAngle !== "top-down" &&
        [0, 3, 6, 9].map((xi) => {
          const p = isoProject(xi + 0.5, NUM_EXPIRIES, 0, cfg);
          return (
            <text
              key={xi}
              x={p.x}
              y={p.y + 13}
              fontSize={8}
              fill="#9ca3af"
              textAnchor="middle"
            >
              {strikePcts[xi]}
            </text>
          );
        })}

      {/* Expiry axis labels */}
      {viewAngle !== "top-down" &&
        viewAngle === "front-left" &&
        EXPIRY_LABELS.map((label, yi) => {
          const p = isoProject(0, yi + 0.5, 0, cfg);
          return (
            <text key={yi} x={p.x - 6} y={p.y + 3} fontSize={8} fill="#9ca3af" textAnchor="end">
              {label}
            </text>
          );
        })}

      {viewAngle === "front-right" &&
        EXPIRY_LABELS.map((label, yi) => {
          const p = isoProject(NUM_STRIKES, yi + 0.5, 0, cfg);
          return (
            <text key={yi} x={p.x + 6} y={p.y + 3} fontSize={8} fill="#9ca3af" textAnchor="start">
              {label}
            </text>
          );
        })}

      {/* Axis title hints */}
      {viewAngle !== "top-down" && (
        <>
          {(() => {
            const p = isoProject(NUM_STRIKES / 2, NUM_EXPIRIES + 0.5, 0, cfg);
            return (
              <text x={p.x} y={p.y + 10} fontSize={8} fill="#6b7280" textAnchor="middle">
                Strike (% of spot)
              </text>
            );
          })()}
        </>
      )}
    </svg>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface VolSurfaceProps {
  spotPrice: number;
  hv?: number;
  ivRank?: number;
}

export function VolSurface({ spotPrice, hv = 0.25, ivRank = 50 }: VolSurfaceProps) {
  const [viewAngle, setViewAngle] = useState<ViewAngle>("front-left");
  const [skew, setSkew] = useState(0);
  const [termSlope, setTermSlope] = useState<"normal" | "inverted" | "flat">("normal");
  const [volShift, setVolShift] = useState(0);
  const [selectedSmileExpiry, setSelectedSmileExpiry] = useState(2); // default 1M
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const cells = useMemo(
    () => generateSurface(spotPrice, skew, termSlope, volShift),
    [spotPrice, skew, termSlope, volShift],
  );

  const allIVs = useMemo(() => cells.flat().map((c) => c.iv), [cells]);
  const minIV = Math.min(...allIVs);
  const maxIV = Math.max(...allIVs);

  const atmIV = cells[2]?.[Math.floor(NUM_STRIKES / 2)]?.iv ?? 0;

  const cycleView = useCallback(() => {
    setViewAngle((v) => {
      if (v === "front-left") return "front-right";
      if (v === "front-right") return "top-down";
      return "front-left";
    });
  }, []);

  const handleHover = useCallback(
    (cell: SurfaceCell | null, x: number, y: number) => {
      setTooltip(cell ? { cell, x, y } : null);
    },
    [],
  );

  const resetToMarket = useCallback(() => {
    setSkew(0);
    setTermSlope("normal");
    setVolShift(0);
  }, []);

  return (
    <div className="flex h-full flex-col overflow-auto">
      {/* Header bar */}
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border/50 bg-card px-3 py-2">
        {/* Spot + IV Rank */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Spot</span>
          <span className="text-xs font-bold">${spotPrice.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded bg-amber-500/20 px-2 py-0.5">
          <span className="text-[11px] text-amber-300">IV Rank</span>
          <span className="text-xs font-bold text-amber-400">{ivRank.toFixed(0)}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded bg-muted/40 px-2 py-0.5">
          <span className="text-[11px] text-muted-foreground">ATM IV (1M)</span>
          <span className="text-xs font-bold">{(atmIV * 100).toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-1.5 rounded bg-muted/40 px-2 py-0.5">
          <span className="text-[11px] text-muted-foreground">HV</span>
          <span className="text-xs font-bold">{(hv * 100).toFixed(1)}%</span>
        </div>

        <div className="ml-auto">
          <ColorLegend minIV={minIV} maxIV={maxIV} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-0 overflow-auto">
        {/* 3D surface + controls row */}
        <div className="flex shrink-0 flex-wrap gap-0">
          {/* 3D Grid */}
          <div className="relative min-w-0 flex-1">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/30">
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Volatility Surface — {viewAngle === "front-left" ? "Front Left" : viewAngle === "front-right" ? "Front Right" : "Top Down"}
              </span>
              <button
                onClick={cycleView}
                className="rounded border border-border px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Rotate View
              </button>
            </div>

            <div className="relative overflow-hidden px-2 py-2">
              <IsoGrid
                cells={cells}
                spotPrice={spotPrice}
                viewAngle={viewAngle}
                onHover={handleHover}
              />

              {/* Hover tooltip */}
              {tooltip && (
                <div
                  className="pointer-events-none absolute z-10 rounded border border-border/40 bg-card/95 px-2 py-1.5 shadow-sm"
                  style={{
                    left: tooltip.x + 10,
                    top: tooltip.y - 30,
                    maxWidth: 140,
                  }}
                >
                  <div className="text-[11px] text-muted-foreground">Strike</div>
                  <div className="text-xs font-bold">
                    ${tooltip.cell.strike.toFixed(2)} ({((tooltip.cell.strike / spotPrice - 1) * 100).toFixed(1)}%)
                  </div>
                  <div className="text-[11px] text-muted-foreground">Expiry</div>
                  <div className="text-xs font-bold">{tooltip.cell.expiry}</div>
                  <div className="text-[11px] text-muted-foreground">IV</div>
                  <div
                    className="text-[11px] font-bold"
                    style={{ color: ivToColor(tooltip.cell.iv, minIV, maxIV) }}
                  >
                    {(tooltip.cell.iv * 100).toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controls panel */}
          <div className="w-56 shrink-0 border-l border-border/50 bg-card">
            <div className="border-b border-border/30 px-3 py-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Surface Controls
              </span>
            </div>

            <div className="flex flex-col gap-4 p-3">
              {/* Skew slider */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-[11px] text-muted-foreground">Skew (put/call)</label>
                  <span className="text-[11px] font-bold text-foreground">
                    {skew >= 0 ? "+" : ""}{skew}
                  </span>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  value={skew}
                  onChange={(e) => setSkew(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-orange-400"
                />
                <div className="mt-0.5 flex justify-between text-[11px] text-muted-foreground/60">
                  <span>Call skew</span>
                  <span>Put skew</span>
                </div>
              </div>

              {/* Term structure */}
              <div>
                <label className="mb-1 block text-[11px] text-muted-foreground">Term Structure</label>
                <div className="flex flex-col gap-1">
                  {(["normal", "inverted", "flat"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setTermSlope(s)}
                      className={cn(
                        "rounded px-2 py-1 text-left text-[11px] transition-colors",
                        termSlope === s
                          ? "bg-orange-400/20 text-orange-400"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {s === "normal" ? "Normal (contango)" : s === "inverted" ? "Inverted (backwardation)" : "Flat"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vol shift */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-[11px] text-muted-foreground">Vol Level Shift</label>
                  <span className="text-[11px] font-bold text-foreground">
                    {volShift >= 0 ? "+" : ""}{volShift}%
                  </span>
                </div>
                <input
                  type="range"
                  min={-20}
                  max={20}
                  value={volShift}
                  onChange={(e) => setVolShift(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-orange-400"
                />
                <div className="mt-0.5 flex justify-between text-[11px] text-muted-foreground/60">
                  <span>-20%</span>
                  <span>+20%</span>
                </div>
              </div>

              {/* Reset button */}
              <button
                onClick={resetToMarket}
                className="mt-1 w-full rounded border border-border py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
              >
                Reset to Market
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/50" />

        {/* Vol Smile Cross-Section */}
        <div className="shrink-0">
          <div className="flex items-center justify-between border-b border-border/30 px-3 py-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Vol Smile Cross-Section
            </span>
            <div className="flex gap-1">
              {EXPIRY_LABELS.map((label, i) => (
                <button
                  key={label}
                  onClick={() => setSelectedSmileExpiry(i)}
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[11px] transition-colors",
                    selectedSmileExpiry === i
                      ? "bg-orange-400/20 text-orange-400"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="py-2">
            <SmileChart
              cells={cells}
              spotPrice={spotPrice}
              selectedExpiry={selectedSmileExpiry}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/50" />

        {/* Term Structure Panel */}
        <div className="shrink-0">
          <div className="border-b border-border/30 px-3 py-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              ATM Term Structure
            </span>
          </div>
          <div className="py-2">
            <TermStructurePanel cells={cells} />
          </div>
        </div>
      </div>
    </div>
  );
}
