"use client";

// ── 3D Volatility Surface (Isometric projection, pure SVG) ────────────────

interface VolSurface3DProps {
  baseIV: number;   // e.g. 0.30
  spotPrice: number;
}

// Moneyness X-axis: 7 points from 0.85 to 1.15
const MONEYNESS_POINTS = [0.85, 0.90, 0.95, 1.00, 1.05, 1.10, 1.15];
// DTE Y-axis: 6 points
const DTE_POINTS = [7, 14, 30, 60, 90, 120];

const NX = MONEYNESS_POINTS.length; // 7
const NY = DTE_POINTS.length;       // 6

// IV surface formula:
//   IV(moneyness, dte) = baseIV + skew*(1 - moneyness)*2 + termPremium*(1/dte^0.3 - 0.5)
//   Clamped to [0.20, 0.80]
function surfaceIV(baseIV: number, moneyness: number, dte: number): number {
  const skew = 0.05;
  const termPremium = 0.03;
  const raw = baseIV + skew * (1 - moneyness) * 2 + termPremium * (1 / Math.pow(dte, 0.3) - 0.5);
  return Math.min(0.80, Math.max(0.20, raw));
}

// Isometric projection:
//   xi = moneyness index (0..NX-1)  → screen-right / screen-left
//   yi = expiry index (0..NY-1)     → screen-right / screen-down (depth axis)
//   iv = implied volatility 0.20–0.80 → screen-up
const CELL_W = 36;   // horizontal cell width in iso
const CELL_H = 18;   // vertical cell half-height in iso
const IV_SCALE = 160; // pixels for full IV range (0.20 to 0.80)
const ORIGIN_X = 280; // SVG origin (center of grid)
const ORIGIN_Y = 220; // SVG origin

function isoProject(
  xi: number,
  yi: number,
  iv: number,
): { sx: number; sy: number } {
  // Normalise IV to 0-1 within 0.20–0.80 range
  const ivNorm = (iv - 0.20) / 0.60;
  const sx = ORIGIN_X + (xi - yi) * (CELL_W / 2);
  const sy = ORIGIN_Y + (xi + yi) * (CELL_H / 2) - ivNorm * IV_SCALE;
  return { sx, sy };
}

// Interpolate HSL: low IV (0.20) = blue (hue 220), high IV (0.80) = red (hue 0)
function ivColor(iv: number, opacity: number = 0.82): string {
  const t = Math.max(0, Math.min(1, (iv - 0.20) / 0.60));
  const hue = Math.round(220 - t * 220); // 220 (blue) → 0 (red)
  const sat = 70 + t * 15;
  const lit = 45 + (1 - t) * 15;
  return `hsla(${hue},${sat}%,${lit}%,${opacity})`;
}

interface Quad {
  points: string;    // SVG polygon points
  fill: string;
  stroke: string;
  sortKey: number;   // painter's algorithm key (draw low first)
  iv: number;        // for label
  xi: number;
  yi: number;
}

export function VolSurface3D({ baseIV, spotPrice }: VolSurface3DProps) {
  // Pre-compute IV grid
  const ivGrid: number[][] = MONEYNESS_POINTS.map((m) =>
    DTE_POINTS.map((d) => surfaceIV(baseIV, m, d)),
  );

  // Build quads — each quad covers (xi, yi) → (xi+1, yi+1)
  // painter's algorithm: sort by xi + yi ascending (back-to-front)
  const quads: Quad[] = [];

  for (let yi = 0; yi < NY - 1; yi++) {
    for (let xi = 0; xi < NX - 1; xi++) {
      const iv00 = ivGrid[xi][yi];
      const iv10 = ivGrid[xi + 1][yi];
      const iv11 = ivGrid[xi + 1][yi + 1];
      const iv01 = ivGrid[xi][yi + 1];

      const avgIV = (iv00 + iv10 + iv11 + iv01) / 4;

      const p00 = isoProject(xi, yi, iv00);
      const p10 = isoProject(xi + 1, yi, iv10);
      const p11 = isoProject(xi + 1, yi + 1, iv11);
      const p01 = isoProject(xi, yi + 1, iv01);

      const pts = [p00, p10, p11, p01]
        .map((p) => `${p.sx.toFixed(1)},${p.sy.toFixed(1)}`)
        .join(" ");

      quads.push({
        points: pts,
        fill: ivColor(avgIV, 0.78),
        stroke: ivColor(avgIV, 0.35),
        sortKey: xi + yi,
        iv: avgIV,
        xi,
        yi,
      });
    }
  }

  // Sort back-to-front (lowest xi+yi first = farthest from viewer)
  quads.sort((a, b) => a.sortKey - b.sortKey);

  // Axis labels — X (moneyness) along xi=0 edge, Y (DTE) along yi=0 edge
  const moneynessLabels = MONEYNESS_POINTS.map((m, xi) => {
    const { sx, sy } = isoProject(xi, NY - 1, 0.20);
    return { label: `${(m * 100).toFixed(0)}%`, sx, sy: sy + 12 };
  });

  const dteLabels = DTE_POINTS.map((d, yi) => {
    const { sx, sy } = isoProject(0, yi, 0.20);
    return { label: `${d}D`, sx: sx - 14, sy: sy + 3 };
  });

  // IV Z-axis tick marks on the left edge (xi=0, yi=0)
  const ivTicks = [0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80];
  const ivAxisTicks = ivTicks.map((iv) => {
    const { sx, sy } = isoProject(0, 0, iv);
    return { iv, sx, sy };
  });

  // ATM moneyness index (index 3 = 1.00)
  const atmXi = 3;

  return (
    <div className="flex flex-col rounded-lg border border-border/50 bg-card hover:border-border/60 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-3 py-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          Vol Surface 3D
        </span>
        <div className="flex items-center gap-2">
          <span className="rounded bg-muted/30 px-1.5 py-0.5 text-[9px] text-muted-foreground">
            Spot ${spotPrice.toFixed(0)}
          </span>
          <span className="rounded bg-muted/30 px-1.5 py-0.5 text-[9px] text-muted-foreground">
            Base IV {(baseIV * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* SVG surface */}
      <div className="flex-1 px-1 py-1">
        <svg
          viewBox="0 0 560 310"
          className="w-full"
          aria-label="3D implied volatility surface"
          role="img"
        >
          {/* ── Quads ────────────────────────────────────────────────── */}
          {quads.map((q, i) => (
            <polygon
              key={i}
              points={q.points}
              fill={q.fill}
              stroke={q.stroke}
              strokeWidth={0.6}
            />
          ))}

          {/* ── ATM column vertical lines (ghost) ──────────────────── */}
          {Array.from({ length: NY }, (_, yi) => {
            const bot = isoProject(atmXi, yi, 0.20);
            const top = isoProject(atmXi, yi, ivGrid[atmXi][yi]);
            return (
              <line
                key={`atm-v-${yi}`}
                x1={bot.sx}
                y1={bot.sy}
                x2={top.sx}
                y2={top.sy}
                stroke="#f97316"
                strokeWidth={0.8}
                strokeOpacity={0.4}
                strokeDasharray="2 2"
              />
            );
          })}

          {/* ── Floor grid lines ───────────────────────────────────── */}
          {/* Along xi direction (moneyness axis lines) */}
          {Array.from({ length: NY }, (_, yi) => {
            const start = isoProject(0, yi, 0.20);
            const end = isoProject(NX - 1, yi, 0.20);
            return (
              <line
                key={`floor-xi-${yi}`}
                x1={start.sx}
                y1={start.sy}
                x2={end.sx}
                y2={end.sy}
                stroke="currentColor"
                strokeOpacity={0.12}
                strokeWidth={0.5}
                className="text-muted-foreground"
              />
            );
          })}
          {/* Along yi direction (DTE axis lines) */}
          {Array.from({ length: NX }, (_, xi) => {
            const start = isoProject(xi, 0, 0.20);
            const end = isoProject(xi, NY - 1, 0.20);
            return (
              <line
                key={`floor-yi-${xi}`}
                x1={start.sx}
                y1={start.sy}
                x2={end.sx}
                y2={end.sy}
                stroke="currentColor"
                strokeOpacity={0.12}
                strokeWidth={0.5}
                className="text-muted-foreground"
              />
            );
          })}

          {/* ── Z-axis (IV) ticks ──────────────────────────────────── */}
          {/* Vertical axis line */}
          {(() => {
            const bot = isoProject(0, 0, 0.20);
            const top = isoProject(0, 0, 0.80);
            return (
              <line
                x1={bot.sx}
                y1={bot.sy}
                x2={top.sx}
                y2={top.sy}
                stroke="currentColor"
                strokeOpacity={0.3}
                strokeWidth={0.8}
                className="text-muted-foreground"
              />
            );
          })()}
          {ivAxisTicks.map(({ iv, sx, sy }) => (
            <g key={`iv-tick-${iv}`}>
              <line
                x1={sx - 3}
                y1={sy}
                x2={sx}
                y2={sy}
                stroke="currentColor"
                strokeOpacity={0.35}
                strokeWidth={0.7}
                className="text-muted-foreground"
              />
              <text
                x={sx - 5}
                y={sy + 3}
                textAnchor="end"
                fontSize={6.5}
                fill="currentColor"
                className="text-muted-foreground"
                opacity={0.55}
              >
                {(iv * 100).toFixed(0)}%
              </text>
            </g>
          ))}

          {/* ── Moneyness (X) axis labels ──────────────────────────── */}
          {moneynessLabels.map(({ label, sx, sy }) => (
            <text
              key={label}
              x={sx}
              y={sy}
              textAnchor="middle"
              fontSize={6.5}
              fill="currentColor"
              className="text-muted-foreground"
              opacity={0.55}
            >
              {label}
            </text>
          ))}

          {/* ── DTE (Y) axis labels ────────────────────────────────── */}
          {dteLabels.map(({ label, sx, sy }) => (
            <text
              key={label}
              x={sx}
              y={sy}
              textAnchor="end"
              fontSize={6.5}
              fill="currentColor"
              className="text-muted-foreground"
              opacity={0.55}
            >
              {label}
            </text>
          ))}

          {/* ── Axis title labels ──────────────────────────────────── */}
          {/* Moneyness axis title */}
          {(() => {
            const midMon = isoProject(Math.floor(NX / 2), NY - 1, 0.20);
            return (
              <text
                x={midMon.sx}
                y={midMon.sy + 22}
                textAnchor="middle"
                fontSize={7}
                fontWeight="600"
                fill="currentColor"
                className="text-muted-foreground"
                opacity={0.45}
              >
                Moneyness
              </text>
            );
          })()}
          {/* DTE axis title */}
          {(() => {
            const midDTE = isoProject(0, Math.floor(NY / 2), 0.20);
            return (
              <text
                x={midDTE.sx - 20}
                y={midDTE.sy}
                textAnchor="end"
                fontSize={7}
                fontWeight="600"
                fill="currentColor"
                className="text-muted-foreground"
                opacity={0.45}
              >
                DTE
              </text>
            );
          })()}
          {/* IV axis title */}
          {(() => {
            const top = isoProject(0, 0, 0.80);
            return (
              <text
                x={top.sx - 6}
                y={top.sy - 4}
                textAnchor="end"
                fontSize={7}
                fontWeight="600"
                fill="currentColor"
                className="text-muted-foreground"
                opacity={0.45}
              >
                IV
              </text>
            );
          })()}

          {/* ── Color legend bar ───────────────────────────────────── */}
          {(() => {
            const barX = 490;
            const barY = 40;
            const barH = 120;
            const barW = 10;
            const steps = 20;

            const rects = Array.from({ length: steps }, (_, i) => {
              const t = i / (steps - 1);
              const iv = 0.20 + t * 0.60;
              const y = barY + (1 - t) * barH; // top = high IV
              const h = barH / steps + 0.5;
              return (
                <rect
                  key={i}
                  x={barX}
                  y={y}
                  width={barW}
                  height={h}
                  fill={ivColor(iv, 0.85)}
                />
              );
            });

            return (
              <g>
                {rects}
                <rect x={barX} y={barY} width={barW} height={barH} fill="none" stroke="currentColor" strokeOpacity={0.2} strokeWidth={0.5} className="text-muted-foreground" />
                <text x={barX + barW + 3} y={barY + 4} fontSize={6.5} fill="currentColor" className="text-muted-foreground" opacity={0.55}>80%</text>
                <text x={barX + barW + 3} y={barY + barH / 2 + 4} fontSize={6.5} fill="currentColor" className="text-muted-foreground" opacity={0.55}>50%</text>
                <text x={barX + barW + 3} y={barY + barH + 4} fontSize={6.5} fill="currentColor" className="text-muted-foreground" opacity={0.55}>20%</text>
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}
