"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  PRNG — mulberry32                                                   */
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

type SentimentZone = "Extreme Fear" | "Fear" | "Greed" | "Extreme Greed";

interface Factor {
  label: string;
  value: string;
  signal: string;
  contribution: number; // -1 to +1 directional (positive = greed)
}

/* ------------------------------------------------------------------ */
/*  Segment definitions                                                 */
/* ------------------------------------------------------------------ */

interface Segment {
  label: SentimentZone;
  min: number;
  max: number;
  color: string;       // fill color for arc
  textColor: string;   // Tailwind text class
  bgColor: string;     // Tailwind bg for badge
}

const SEGMENTS: Segment[] = [
  {
    label: "Extreme Fear",
    min: 0,
    max: 25,
    color: "#ef4444",
    textColor: "text-red-500",
    bgColor: "bg-red-500/15 border-red-500/30 text-red-500",
  },
  {
    label: "Fear",
    min: 25,
    max: 50,
    color: "#f97316",
    textColor: "text-orange-500",
    bgColor: "bg-orange-500/15 border-orange-500/30 text-orange-500",
  },
  {
    label: "Greed",
    min: 50,
    max: 75,
    color: "#84cc16",
    textColor: "text-lime-500",
    bgColor: "bg-lime-500/15 border-lime-500/30 text-lime-500",
  },
  {
    label: "Extreme Greed",
    min: 75,
    max: 100,
    color: "#22c55e",
    textColor: "text-green-500",
    bgColor: "bg-green-500/15 border-green-500/30 text-green-500",
  },
];

function getSegment(value: number): Segment {
  return SEGMENTS.find((s) => value >= s.min && value < s.max) ?? SEGMENTS[SEGMENTS.length - 1];
}

/* ------------------------------------------------------------------ */
/*  Data generation                                                     */
/* ------------------------------------------------------------------ */

interface IndexData {
  value: number;
  zone: SentimentZone;
  factors: Factor[];
  history: number[]; // 30-day readings
}

function generateIndexData(seed: number): IndexData {
  const rng = mulberry32(seed);

  // Main index value — weighted toward middle range
  const raw = rng(); // 0–1
  // skew toward fear/greed middle zone: slightly bearish market environment
  const value = Math.round(20 + raw * 60); // 20–80 range, centered at ~50

  // Factor values derived from rng chain
  const vixLevel = 14 + rng() * 20; // 14–34
  const vixSignal = vixLevel > 25 ? "Elevated (Fear)" : vixLevel > 18 ? "Moderate" : "Low (Greed)";
  const vixContrib = vixLevel > 22 ? -0.8 : vixLevel > 18 ? -0.2 : 0.6;

  const pcRatio = 0.6 + rng() * 0.7; // 0.6–1.3
  const pcSignal = pcRatio > 1.0 ? "High Put Buying (Fear)" : pcRatio < 0.8 ? "Call Heavy (Greed)" : "Neutral";
  const pcContrib = pcRatio > 1.0 ? -0.7 : pcRatio < 0.8 ? 0.7 : 0.1;

  const spyVs125 = (rng() * 2 - 1) * 8; // -8% to +8%
  const momentumSignal = spyVs125 > 2 ? "Above 125-day MA (Bullish)" : spyVs125 < -2 ? "Below 125-day MA (Bearish)" : "Near 125-day MA";
  const momentumContrib = spyVs125 > 2 ? 0.8 : spyVs125 < -2 ? -0.8 : 0;

  const yieldSpread = -0.5 + rng() * 2; // -0.5 to +1.5
  const havenSignal = yieldSpread > 0.5 ? "Rotating to Stocks (Greed)" : yieldSpread < 0 ? "Rotating to Bonds (Fear)" : "Balanced";
  const havenContrib = yieldSpread > 0.5 ? 0.6 : yieldSpread < 0 ? -0.6 : 0;

  const pctAbove200 = 30 + rng() * 45; // 30–75%
  const breadthSignal = pctAbove200 > 60 ? "Strong Breadth (Greed)" : pctAbove200 < 45 ? "Weak Breadth (Fear)" : "Moderate";
  const breadthContrib = pctAbove200 > 60 ? 0.7 : pctAbove200 < 45 ? -0.7 : 0.1;

  const zone = getSegment(value).label;

  // Generate 30-day history using further rng draws
  const history: number[] = Array.from({ length: 30 }, () =>
    Math.round(Math.max(5, Math.min(95, value + (rng() * 30 - 15))))
  );

  return {
    value,
    zone,
    history,
    factors: [
      {
        label: "VIX (Volatility)",
        value: vixLevel.toFixed(2),
        signal: vixSignal,
        contribution: vixContrib,
      },
      {
        label: "Put/Call Ratio",
        value: pcRatio.toFixed(2),
        signal: pcSignal,
        contribution: pcContrib,
      },
      {
        label: "Market Momentum",
        value: `${spyVs125 >= 0 ? "+" : ""}${spyVs125.toFixed(1)}%`,
        signal: momentumSignal,
        contribution: momentumContrib,
      },
      {
        label: "Safe Haven Demand",
        value: `${yieldSpread >= 0 ? "+" : ""}${yieldSpread.toFixed(2)}`,
        signal: havenSignal,
        contribution: havenContrib,
      },
      {
        label: "Market Breadth",
        value: `${pctAbove200.toFixed(1)}%`,
        signal: breadthSignal,
        contribution: breadthContrib,
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  SVG Gauge                                                           */
/* ------------------------------------------------------------------ */

// The gauge is a 180-degree semicircle drawn in an SVG viewBox.
// Center = (110, 110), radius = 90. Arc goes from left (180°) to right (0°).

const CX = 110;
const CY = 110;
const R = 88;
const STROKE = 18;

function polarToXY(angleDeg: number, r: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CX + r * Math.cos(rad),
    y: CY + r * Math.sin(rad),
  };
}

// Build an SVG arc path for a segment of the semicircle.
// Angles: 180° (left) → 0° (right) for values 0 → 100
function arcPath(startVal: number, endVal: number): string {
  // Map 0–100 to 180°–0° (counterclockwise in standard SVG coords, but we
  // draw left-to-right so map 0→180°, 100→0°)
  const startAngle = 180 - (startVal / 100) * 180;
  const endAngle = 180 - (endVal / 100) * 180;

  const start = polarToXY(startAngle, R);
  const end = polarToXY(endAngle, R);

  // large-arc-flag: 0 for arcs < 180 degrees
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  // Sweep direction: going from higher angle to lower (counterclockwise in math),
  // which is clockwise in SVG (y-axis flipped).
  const sweep = startAngle > endAngle ? 0 : 1;

  return `M ${start.x} ${start.y} A ${R} ${R} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;
}

function NeedlePath({ value }: { value: number }) {
  // Needle angle: value=0 → 180°, value=100 → 0°
  const angle = 180 - (value / 100) * 180;
  const tip = polarToXY(angle, R - STROKE / 2 - 4);
  const base1 = polarToXY(angle + 90, 8);
  const base2 = polarToXY(angle - 90, 8);
  return (
    <polygon
      points={`${tip.x},${tip.y} ${base1.x},${base1.y} ${base2.x},${base2.y}`}
      fill="currentColor"
      className="text-foreground"
    />
  );
}

function Gauge({ value }: { value: number }) {
  const seg = getSegment(value);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 220 120" className="w-full max-w-[260px]" aria-label="Fear and Greed Gauge">
        {/* Background track */}
        <path
          d={arcPath(0, 100)}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={STROKE}
          strokeLinecap="butt"
        />

        {/* Colored segments */}
        {SEGMENTS.map((s) => (
          <path
            key={s.label}
            d={arcPath(s.min, s.max)}
            fill="none"
            stroke={s.color}
            strokeWidth={STROKE}
            strokeLinecap="butt"
            opacity={0.85}
          />
        ))}

        {/* Needle */}
        <NeedlePath value={value} />

        {/* Center pivot dot */}
        <circle cx={CX} cy={CY} r={5} fill="hsl(var(--foreground))" />

        {/* Value text */}
        <text
          x={CX}
          y={CY - 18}
          textAnchor="middle"
          fontSize="28"
          fontWeight="700"
          fill="currentColor"
          className="fill-foreground font-mono"
        >
          {value}
        </text>

        {/* Zone label */}
        <text
          x={CX}
          y={CY - 4}
          textAnchor="middle"
          fontSize="8"
          fill={seg.color}
          fontWeight="600"
        >
          {seg.label.toUpperCase()}
        </text>

        {/* Scale labels */}
        <text x={14} y={116} fontSize="7" fill="hsl(var(--muted-foreground))" textAnchor="middle">
          0
        </text>
        <text x={CX} y={24} fontSize="7" fill="hsl(var(--muted-foreground))" textAnchor="middle">
          50
        </text>
        <text x={206} y={116} fontSize="7" fill="hsl(var(--muted-foreground))" textAnchor="middle">
          100
        </text>
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Factor row                                                          */
/* ------------------------------------------------------------------ */

function FactorRow({ factor }: { factor: Factor }) {
  const isPositive = factor.contribution > 0.1;
  const isNegative = factor.contribution < -0.1;

  return (
    <div className="flex items-start justify-between gap-2 py-2 border-b border-border/40 last:border-0">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[11px] font-medium truncate">{factor.label}</span>
        <span className="text-[10px] text-muted-foreground leading-tight">{factor.signal}</span>
      </div>
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <span className="font-mono text-[11px] font-semibold tabular-nums">{factor.value}</span>
        <span
          className={cn(
            "text-[9px] font-medium px-1.5 py-0.5 rounded-full border",
            isPositive
              ? "bg-green-500/10 border-green-500/20 text-green-500"
              : isNegative
              ? "bg-red-500/10 border-red-500/20 text-red-500"
              : "bg-muted border-border text-muted-foreground",
          )}
        >
          {isPositive ? "Greed" : isNegative ? "Fear" : "Neutral"}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */

export function FearGreedIndex() {
  const dailySeed = useMemo(() => Math.floor(Date.now() / 86400000), []);
  const data = useMemo(() => generateIndexData(dailySeed), [dailySeed]);
  const seg = getSegment(data.value);

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Fear &amp; Greed Index</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Daily market sentiment composite</p>
        </div>
        <span
          className={cn(
            "text-[10px] font-semibold px-2 py-1 rounded-full border",
            seg.bgColor,
          )}
        >
          {seg.label}
        </span>
      </div>

      {/* Gauge */}
      <Gauge value={data.value} />

      {/* Zone scale bar */}
      <div className="flex rounded overflow-hidden h-1.5">
        {SEGMENTS.map((s) => (
          <div
            key={s.label}
            className="flex-1"
            style={{ backgroundColor: s.color, opacity: data.value >= s.min ? 1 : 0.25 }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground">
        <span>Extreme Fear</span>
        <span>Fear</span>
        <span>Greed</span>
        <span>Extreme Greed</span>
      </div>

      {/* Contributing factors */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
          Contributing Factors
        </p>
        <div className="divide-y divide-border/40">
          {data.factors.map((f) => (
            <FactorRow key={f.label} factor={f} />
          ))}
        </div>
      </div>
    </div>
  );
}
