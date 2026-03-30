"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  PRNG — same mulberry32 used across codebase                        */
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
/*  Types                                                               */
/* ------------------------------------------------------------------ */

type Quadrant = "Reflation" | "Goldilocks" | "Stagflation" | "Deflation";

interface QuadrantConfig {
  id: Quadrant;
  // position in 2x2 grid: [col 0-1, row 0-1]
  col: 0 | 1;
  row: 0 | 1;
  description: string;
  growthLabel: string;
  inflationLabel: string;
  favored: string[];
  avoid: string[];
  color: string;       // border / accent color class
  bgColor: string;     // background class
  textColor: string;   // text class
}

interface RegimeData {
  // Normalized coordinates on the quadrant diagram: 0-1 in each axis
  // x-axis: 0 = low growth, 1 = high growth
  // y-axis: 0 = low inflation, 1 = high inflation
  x: number;
  y: number;
  currentQuadrant: Quadrant;
  trendingToward: Quadrant | null;
  // Trend vector (normalized)
  trendDx: number;
  trendDy: number;
  // Current readings
  gdpGrowth: number;
  inflation: number;
}

/* ------------------------------------------------------------------ */
/*  Quadrant config                                                     */
/* ------------------------------------------------------------------ */

const QUADRANTS: QuadrantConfig[] = [
  {
    id: "Stagflation",
    col: 0,
    row: 0, // top-left: low growth, high inflation
    description: "Slow growth + high inflation — worst of both worlds",
    growthLabel: "Low Growth",
    inflationLabel: "High Inflation",
    favored: ["Commodities", "TIPS", "Energy", "Gold"],
    avoid: ["Long Bonds", "Growth Stocks", "Real Estate"],
    color: "border-red-500/40",
    bgColor: "bg-red-500/5",
    textColor: "text-red-500",
  },
  {
    id: "Reflation",
    col: 1,
    row: 0, // top-right: high growth, high inflation
    description: "Accelerating growth + rising prices — early cycle recovery",
    growthLabel: "High Growth",
    inflationLabel: "High Inflation",
    favored: ["Equities", "Commodities", "Real Assets", "Energy"],
    avoid: ["Long Bonds", "Utilities", "Defensives"],
    color: "border-amber-500/40",
    bgColor: "bg-amber-500/5",
    textColor: "text-amber-500",
  },
  {
    id: "Deflation",
    col: 0,
    row: 1, // bottom-left: low growth, low inflation
    description: "Falling prices + weak growth — recession risk elevated",
    growthLabel: "Low Growth",
    inflationLabel: "Low Inflation",
    favored: ["Long Bonds", "Defensive Equities", "USD", "Gold"],
    avoid: ["Commodities", "High Yield", "Financials"],
    color: "border-blue-500/40",
    bgColor: "bg-blue-500/5",
    textColor: "text-blue-400",
  },
  {
    id: "Goldilocks",
    col: 1,
    row: 1, // bottom-right: high growth, low inflation
    description: "Strong growth + contained inflation — ideal for risk assets",
    growthLabel: "High Growth",
    inflationLabel: "Low Inflation",
    favored: ["Equities", "Corporate Bonds", "Real Estate", "Crypto"],
    avoid: ["Safe Havens", "Gold", "Long USD"],
    color: "border-green-500/40",
    bgColor: "bg-green-500/5",
    textColor: "text-green-500",
  },
];

const QUADRANT_MAP: Record<Quadrant, QuadrantConfig> = Object.fromEntries(
  QUADRANTS.map((q) => [q.id, q]),
) as Record<Quadrant, QuadrantConfig>;

/* ------------------------------------------------------------------ */
/*  Data generation (seeded daily)                                      */
/* ------------------------------------------------------------------ */

function classifyQuadrant(x: number, y: number): Quadrant {
  // x: growth (0=low, 1=high), y: inflation (0=low, 1=high)
  // Grid: top-left = Stagflation (low growth, high inflation)
  //       top-right = Reflation
  //       bottom-left = Deflation
  //       bottom-right = Goldilocks
  const highGrowth = x > 0.5;
  const highInflation = y > 0.5;
  if (highGrowth && highInflation) return "Reflation";
  if (!highGrowth && highInflation) return "Stagflation";
  if (highGrowth && !highInflation) return "Goldilocks";
  return "Deflation";
}

function generateRegimeData(seed: number): RegimeData {
  const rng = mulberry32(seed);

  // Position in the quadrant: biased toward Goldilocks / Reflation
  // (2026 context: growth positive, inflation moderating)
  const x = 0.55 + (rng() - 0.5) * 0.4; // 0.35–0.75, centered around 0.55
  const y = 0.42 + (rng() - 0.5) * 0.4; // 0.22–0.62, centered around 0.42

  const clampedX = Math.max(0.05, Math.min(0.95, x));
  const clampedY = Math.max(0.05, Math.min(0.95, y));

  const currentQuadrant = classifyQuadrant(clampedX, clampedY);

  // Trend vector — small drift toward the adjacent quadrant
  // Use next rng values for direction
  const trendAngle = rng() * 2 * Math.PI;
  const trendMag = 0.08 + rng() * 0.12; // 8-20% magnitude
  const trendDx = Math.cos(trendAngle) * trendMag;
  const trendDy = Math.sin(trendAngle) * trendMag;

  const projX = Math.max(0.05, Math.min(0.95, clampedX + trendDx));
  const projY = Math.max(0.05, Math.min(0.95, clampedY + trendDy));
  const projQuadrant = classifyQuadrant(projX, projY);
  const trendingToward =
    projQuadrant !== currentQuadrant ? projQuadrant : null;

  // Human-readable values
  const gdpGrowth = 1.0 + clampedX * 5.0; // 1.0–6.0%
  const inflation = 1.0 + clampedY * 8.0; // 1.0–9.0%

  return {
    x: clampedX,
    y: clampedY,
    currentQuadrant,
    trendingToward,
    trendDx,
    trendDy,
    gdpGrowth,
    inflation,
  };
}

/* ------------------------------------------------------------------ */
/*  SVG quadrant diagram                                                */
/* ------------------------------------------------------------------ */

const SVG_W = 280;
const SVG_H = 280;
const PADDING = 28;
const INNER_W = SVG_W - PADDING * 2;
const INNER_H = SVG_H - PADDING * 2;

function QuadrantSVG({ regime }: { regime: RegimeData }) {
  const dotX = PADDING + regime.x * INNER_W;
  // y is inverted in SVG (0 = top = high inflation)
  const dotY = PADDING + (1 - regime.y) * INNER_H;

  // Trend arrow endpoint
  const arrowScale = 60;
  const arrowX = dotX + regime.trendDx * arrowScale;
  const arrowY = dotY - regime.trendDy * arrowScale; // y inverted

  const currentConfig = QUADRANT_MAP[regime.currentQuadrant];

  // Arrow color — muted foreground
  const arrowColor = "hsl(var(--muted-foreground))";

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="w-full max-w-[280px] mx-auto"
      aria-label="Macro regime quadrant"
    >
      {/* Quadrant backgrounds */}
      {/* Top-left: Stagflation */}
      <rect
        x={PADDING}
        y={PADDING}
        width={INNER_W / 2}
        height={INNER_H / 2}
        fill="#ef444408"
        stroke="#ef444420"
        strokeWidth={0.5}
      />
      {/* Top-right: Reflation */}
      <rect
        x={PADDING + INNER_W / 2}
        y={PADDING}
        width={INNER_W / 2}
        height={INNER_H / 2}
        fill="#f9731608"
        stroke="#f9731620"
        strokeWidth={0.5}
      />
      {/* Bottom-left: Deflation */}
      <rect
        x={PADDING}
        y={PADDING + INNER_H / 2}
        width={INNER_W / 2}
        height={INNER_H / 2}
        fill="#3b82f608"
        stroke="#3b82f620"
        strokeWidth={0.5}
      />
      {/* Bottom-right: Goldilocks */}
      <rect
        x={PADDING + INNER_W / 2}
        y={PADDING + INNER_H / 2}
        width={INNER_W / 2}
        height={INNER_H / 2}
        fill="#22c55e08"
        stroke="#22c55e20"
        strokeWidth={0.5}
      />

      {/* Center crosshair */}
      <line
        x1={PADDING + INNER_W / 2}
        y1={PADDING}
        x2={PADDING + INNER_W / 2}
        y2={PADDING + INNER_H}
        stroke="hsl(var(--border))"
        strokeWidth={1}
      />
      <line
        x1={PADDING}
        y1={PADDING + INNER_H / 2}
        x2={PADDING + INNER_W}
        y2={PADDING + INNER_H / 2}
        stroke="hsl(var(--border))"
        strokeWidth={1}
      />

      {/* Quadrant labels */}
      <text x={PADDING + 4} y={PADDING + 14} fontSize={8} fill="#ef4444" fontWeight="600" opacity={0.9}>
        Stagflation
      </text>
      <text x={PADDING + INNER_W - 4} y={PADDING + 14} fontSize={8} fill="#f97316" fontWeight="600" opacity={0.9} textAnchor="end">
        Reflation
      </text>
      <text x={PADDING + 4} y={PADDING + INNER_H - 4} fontSize={8} fill="#60a5fa" fontWeight="600" opacity={0.9}>
        Deflation
      </text>
      <text x={PADDING + INNER_W - 4} y={PADDING + INNER_H - 4} fontSize={8} fill="#22c55e" fontWeight="600" opacity={0.9} textAnchor="end">
        Goldilocks
      </text>

      {/* Axis labels */}
      {/* X-axis: Growth */}
      <text x={PADDING} y={SVG_H - 4} fontSize={7} fill="hsl(var(--muted-foreground))" textAnchor="start">
        Low Growth
      </text>
      <text x={PADDING + INNER_W} y={SVG_H - 4} fontSize={7} fill="hsl(var(--muted-foreground))" textAnchor="end">
        High Growth
      </text>
      <text x={SVG_W / 2} y={SVG_H - 4} fontSize={7} fill="hsl(var(--muted-foreground))" textAnchor="middle">
        GDP Growth →
      </text>

      {/* Y-axis: Inflation (rotated) */}
      <text
        x={10}
        y={SVG_H / 2}
        fontSize={7}
        fill="hsl(var(--muted-foreground))"
        textAnchor="middle"
        transform={`rotate(-90, 10, ${SVG_H / 2})`}
      >
        Inflation →
      </text>
      <text x={10} y={PADDING + 4} fontSize={7} fill="hsl(var(--muted-foreground))" textAnchor="middle">
        High
      </text>
      <text x={10} y={PADDING + INNER_H} fontSize={7} fill="hsl(var(--muted-foreground))" textAnchor="middle">
        Low
      </text>

      {/* Trend arrow */}
      <line
        x1={dotX}
        y1={dotY}
        x2={arrowX}
        y2={arrowY}
        stroke={arrowColor}
        strokeWidth={1.5}
        strokeDasharray="3,2"
        markerEnd="url(#arrowhead)"
      />
      <defs>
        <marker
          id="arrowhead"
          markerWidth={6}
          markerHeight={4}
          refX={3}
          refY={2}
          orient="auto"
        >
          <polygon
            points="0 0, 6 2, 0 4"
            fill={arrowColor}
            opacity={0.7}
          />
        </marker>
      </defs>

      {/* Current position dot */}
      <circle
        cx={dotX}
        cy={dotY}
        r={7}
        fill={currentConfig.textColor.replace("text-", "")}
        opacity={0.15}
      />
      <circle cx={dotX} cy={dotY} r={4} fill="hsl(var(--foreground))" />
      <circle cx={dotX} cy={dotY} r={2} fill="hsl(var(--background))" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */

export function MacroCalibrationPanel() {
  const dailySeed = useMemo(() => Math.floor(Date.now() / 86400000), []);
  const regime = useMemo(() => generateRegimeData(dailySeed), [dailySeed]);

  const currentConfig = QUADRANT_MAP[regime.currentQuadrant];
  const trendConfig = regime.trendingToward
    ? QUADRANT_MAP[regime.trendingToward]
    : null;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Macro Regime Calibration</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Current positioning on the 4-quadrant regime framework
          </p>
        </div>
        <span
          className={cn(
            "text-[10px] font-semibold px-2 py-1 rounded-full border",
            currentConfig.color,
            currentConfig.bgColor,
            currentConfig.textColor,
          )}
        >
          {regime.currentQuadrant}
        </span>
      </div>

      {/* Main content: SVG diagram + details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        {/* Diagram */}
        <div>
          <QuadrantSVG regime={regime} />
          {/* Coordinates */}
          <div className="flex justify-center gap-4 text-[10px] text-muted-foreground mt-1">
            <span>
              GDP Growth:{" "}
              <span className="font-mono font-semibold text-foreground">
                +{regime.gdpGrowth.toFixed(1)}%
              </span>
            </span>
            <span>
              Inflation:{" "}
              <span className="font-mono font-semibold text-foreground">
                {regime.inflation.toFixed(1)}%
              </span>
            </span>
          </div>
        </div>

        {/* Details panel */}
        <div className="space-y-3">
          {/* Current regime card */}
          <div
            className={cn(
              "rounded-lg border p-3 space-y-2",
              currentConfig.color,
              currentConfig.bgColor,
            )}
          >
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full bg-current", currentConfig.textColor)} />
              <span className={cn("text-[11px] font-semibold", currentConfig.textColor)}>
                Current: {regime.currentQuadrant}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              {currentConfig.description}
            </p>
            <div className="space-y-1.5">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">
                  Favored Assets
                </p>
                <div className="flex flex-wrap gap-1">
                  {currentConfig.favored.map((a) => (
                    <span
                      key={a}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-green-500"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">
                  Avoid
                </p>
                <div className="flex flex-wrap gap-1">
                  {currentConfig.avoid.map((a) => (
                    <span
                      key={a}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-500"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Trending toward */}
          {trendConfig && (
            <div className={cn("rounded-lg border p-3 space-y-2", trendConfig.color, trendConfig.bgColor)}>
              <div className="flex items-center gap-2">
                <svg
                  className="h-3 w-3 text-muted-foreground"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 6h8M7 3l3 3-3 3"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className={cn("text-[11px] font-semibold", trendConfig.textColor)}>
                  Trending toward: {regime.trendingToward}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {trendConfig.description}
              </p>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">
                  Watch for
                </p>
                <div className="flex flex-wrap gap-1">
                  {trendConfig.favored.slice(0, 3).map((a) => (
                    <span
                      key={a}
                      className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded border",
                        trendConfig.color,
                        trendConfig.bgColor,
                        trendConfig.textColor,
                      )}
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* All 4 quadrants summary */}
          <div className="rounded-lg border border-border/40 overflow-hidden">
            <div className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted/30 px-3 py-1.5">
              Quadrant Reference
            </div>
            {QUADRANTS.map((q) => (
              <div
                key={q.id}
                className={cn(
                  "px-3 py-2 border-t border-border/20 flex items-start gap-2",
                  q.id === regime.currentQuadrant && q.bgColor,
                )}
              >
                <div className={cn("w-1.5 h-1.5 rounded-full mt-1 shrink-0", q.textColor.replace("text-", "bg-"))} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "text-[10px] font-semibold",
                        q.id === regime.currentQuadrant
                          ? q.textColor
                          : "text-muted-foreground",
                      )}
                    >
                      {q.id}
                    </span>
                    {q.id === regime.currentQuadrant && (
                      <span className="text-[8px] bg-primary/15 text-primary px-1 py-0.5 rounded">
                        current
                      </span>
                    )}
                    {q.id === regime.trendingToward && (
                      <span className="text-[8px] bg-muted text-muted-foreground px-1 py-0.5 rounded">
                        trending
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] text-muted-foreground leading-tight mt-0.5 truncate">
                    {q.growthLabel} / {q.inflationLabel}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
