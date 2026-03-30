"use client";

import { useMemo } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface YieldPoint {
  label: string;
  months: number; // months to maturity for interpolation
  current: number; // yield in %
  historical: number; // yield 3 months ago in %
}

// ── Seeded PRNG ────────────────────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Data Generation ────────────────────────────────────────────────────────────

const MATURITIES: { label: string; months: number }[] = [
  { label: "1M", months: 1 },
  { label: "3M", months: 3 },
  { label: "6M", months: 6 },
  { label: "1Y", months: 12 },
  { label: "2Y", months: 24 },
  { label: "3Y", months: 36 },
  { label: "5Y", months: 60 },
  { label: "7Y", months: 84 },
  { label: "10Y", months: 120 },
  { label: "20Y", months: 240 },
  { label: "30Y", months: 360 },
];

function generateYieldCurve(): { current: YieldPoint[]; isInverted: boolean; spread2y10y: number } {
  const daySeed = Math.floor(Date.now() / 86400000);
  const rand = mulberry32(daySeed);

  // Decide inversion: roughly 30% chance based on seed
  const inversionChance = rand();
  const isInverted = inversionChance < 0.30;

  // Base short-end yield (Fed funds range 4.0–5.5%)
  const shortEnd = 4.25 + rand() * 1.25;

  // Long-end premium or discount
  const longEndPremium = isInverted
    ? -(0.3 + rand() * 0.9)  // inverted: long end below short end
    : 0.5 + rand() * 1.2;   // normal: long end above short end

  // Generate current curve
  const current: YieldPoint[] = MATURITIES.map(({ label, months }, i) => {
    const t = months / 360; // normalized 0..1
    const noise = (rand() - 0.5) * 0.12;

    let yield_: number;
    if (isInverted) {
      // Inverted: starts high, dips in mid-term, slight recovery at long end
      yield_ = shortEnd + longEndPremium * (t * 0.6 - t * t * 0.3) + noise;
    } else {
      // Normal: smooth upward slope with flattening at the long end
      yield_ = shortEnd + longEndPremium * (1 - Math.exp(-t * 3.5)) + noise;
    }
    return { label, months, current: Math.max(0.1, yield_), historical: 0 };
  });

  // Generate historical curve (3 months ago): slight shift
  const histRand = mulberry32(daySeed - 90);
  const histShortEnd = shortEnd + (histRand() - 0.5) * 0.6;
  const histLongPremium = isInverted
    ? -(0.1 + histRand() * 0.6)
    : 0.3 + histRand() * 1.0;

  const points: YieldPoint[] = current.map(({ label, months, current: cur }) => {
    const t = months / 360;
    const noise = (histRand() - 0.5) * 0.10;
    let histYield: number;
    if (isInverted) {
      histYield = histShortEnd + histLongPremium * (t * 0.6 - t * t * 0.3) + noise;
    } else {
      histYield = histShortEnd + histLongPremium * (1 - Math.exp(-t * 3.5)) + noise;
    }
    return { label, months, current: cur, historical: Math.max(0.1, histYield) };
  });

  const y2 = points.find((p) => p.label === "2Y")!.current;
  const y10 = points.find((p) => p.label === "10Y")!.current;
  const spread2y10y = Math.round((y10 - y2) * 100); // bps

  return { current: points, isInverted, spread2y10y };
}

// ── SVG Chart ──────────────────────────────────────────────────────────────────

const SVG_W = 600;
const SVG_H = 220;
const PAD = { top: 20, right: 16, bottom: 36, left: 48 };
const CHART_W = SVG_W - PAD.left - PAD.right;
const CHART_H = SVG_H - PAD.top - PAD.bottom;

function toPath(points: YieldPoint[], key: "current" | "historical", yMin: number, yRange: number): string {
  return points
    .map((p, i) => {
      const x = PAD.left + (i / (points.length - 1)) * CHART_W;
      const y = PAD.top + CHART_H - ((p[key] - yMin) / yRange) * CHART_H;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function toFillPath(points: YieldPoint[], yMin: number, yRange: number): string {
  const line = points
    .map((p, i) => {
      const x = PAD.left + (i / (points.length - 1)) * CHART_W;
      const y = PAD.top + CHART_H - ((p.current - yMin) / yRange) * CHART_H;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  const baseY = (PAD.top + CHART_H).toFixed(1);
  const startX = PAD.left.toFixed(1);
  const endX = (PAD.left + CHART_W).toFixed(1);
  return `${line} L ${endX} ${baseY} L ${startX} ${baseY} Z`;
}

function YieldCurveChart({ points, isInverted }: { points: YieldPoint[]; isInverted: boolean }) {
  const allYields = points.flatMap((p) => [p.current, p.historical]);
  const yMin = Math.max(0, Math.min(...allYields) - 0.2);
  const yMax = Math.max(...allYields) + 0.2;
  const yRange = yMax - yMin;

  const currentPath = toPath(points, "current", yMin, yRange);
  const histPath = toPath(points, "historical", yMin, yRange);
  const fillPath = toFillPath(points, yMin, yRange);

  // Y-axis ticks
  const yTickCount = 5;
  const yTicks = Array.from({ length: yTickCount }, (_, i) =>
    yMin + (i / (yTickCount - 1)) * yRange,
  );

  const fillColor = isInverted ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)";
  const fillStroke = isInverted ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)";

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="w-full"
      style={{ maxHeight: "220px" }}
      aria-label="US Treasury yield curve"
    >
      {/* Grid lines */}
      {yTicks.map((tick, i) => {
        const y = PAD.top + CHART_H - ((tick - yMin) / yRange) * CHART_H;
        return (
          <g key={i}>
            <line
              x1={PAD.left}
              y1={y}
              x2={PAD.left + CHART_W}
              y2={y}
              stroke="currentColor"
              strokeWidth={0.5}
              strokeDasharray="4 4"
              className="text-muted-foreground/20"
            />
            <text
              x={PAD.left - 6}
              y={y + 4}
              textAnchor="end"
              fontSize="10"
              className="fill-muted-foreground"
            >
              {tick.toFixed(1)}%
            </text>
          </g>
        );
      })}

      {/* X-axis labels */}
      {points.map((p, i) => {
        const x = PAD.left + (i / (points.length - 1)) * CHART_W;
        return (
          <text
            key={p.label}
            x={x}
            y={SVG_H - 6}
            textAnchor="middle"
            fontSize="10"
            className="fill-muted-foreground"
          >
            {p.label}
          </text>
        );
      })}

      {/* Fill zone under current curve */}
      <path d={fillPath} fill={fillColor} stroke={fillStroke} strokeWidth={0} />

      {/* Historical curve (dashed grey) */}
      <path
        d={histPath}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeDasharray="5 3"
        className="text-muted-foreground/50"
      />

      {/* Current curve (blue) */}
      <path
        d={currentPath}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dots on current curve */}
      {points.map((p, i) => {
        const x = PAD.left + (i / (points.length - 1)) * CHART_W;
        const y = PAD.top + CHART_H - ((p.current - yMin) / yRange) * CHART_H;
        return (
          <circle
            key={p.label}
            cx={x}
            cy={y}
            r={3}
            fill="#3b82f6"
            stroke="white"
            strokeWidth={1}
          />
        );
      })}

      {/* Axes */}
      <line
        x1={PAD.left}
        y1={PAD.top}
        x2={PAD.left}
        y2={PAD.top + CHART_H}
        stroke="currentColor"
        strokeWidth={1}
        className="text-muted-foreground/30"
      />
      <line
        x1={PAD.left}
        y1={PAD.top + CHART_H}
        x2={PAD.left + CHART_W}
        y2={PAD.top + CHART_H}
        stroke="currentColor"
        strokeWidth={1}
        className="text-muted-foreground/30"
      />
    </svg>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function YieldCurve() {
  const { current: points, isInverted, spread2y10y } = useMemo(generateYieldCurve, []);

  const spreadAbs = Math.abs(spread2y10y);
  const spreadSign = spread2y10y >= 0 ? "+" : "-";

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3 hover:border-border/60 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">US Treasury Yield Curve</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Current vs. 3-month prior
          </p>
        </div>
        <span
          className={
            isInverted
              ? "text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded bg-red-500/10 text-red-500"
              : "text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded bg-green-500/10 text-green-500"
          }
        >
          {isInverted ? "Inverted" : "Normal"}
        </span>
      </div>

      {/* Chart */}
      <YieldCurveChart points={points} isInverted={isInverted} />

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-0.5 bg-blue-500 rounded" />
          Current
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-4 h-0"
            style={{
              borderTop: "1.5px dashed currentColor",
              opacity: 0.5,
            }}
          />
          3M ago
        </span>
        <span className="flex items-center gap-1.5 ml-auto font-mono tabular-nums font-medium text-foreground">
          2Y-10Y spread:&nbsp;
          <span className={isInverted ? "text-red-500" : "text-green-500"}>
            {spreadSign}{spreadAbs} bps
          </span>
        </span>
      </div>

      {/* Interpretation */}
      <div
        className={
          isInverted
            ? "rounded border border-red-500/20 bg-red-500/5 px-3 py-2 text-[11px] leading-relaxed text-red-400"
            : "rounded border border-green-500/20 bg-green-500/5 px-3 py-2 text-[11px] leading-relaxed text-green-400"
        }
      >
        {isInverted ? (
          <>
            <span className="font-semibold">INVERTED:</span> 2Y-10Y spread = -{spreadAbs} bps.
            Historically precedes recession by 12-24 months. The short end is pricing
            elevated near-term rates while markets anticipate eventual Fed easing.
          </>
        ) : (
          <>
            <span className="font-semibold">NORMAL:</span> Positive slope of{" "}
            {spreadSign}{spreadAbs} bps indicates healthy growth expectations.
            Markets are pricing in steady economic expansion and moderate long-run inflation.
          </>
        )}
      </div>
    </div>
  );
}
