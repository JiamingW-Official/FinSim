"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { useTradingStore } from "@/stores/trading-store";
import {
  computeBehavioralProfile,
  getArchetype,
  type BehavioralAxis,
  type BehavioralProfile,
} from "@/services/analytics/behavioral-profile";

// ─── Radar Chart (pure SVG, hexagonal, 6 axes) ───────────────────────────────

const AXIS_LABELS = [
  "Discipline",
  "Patience",
  "Risk Control",
  "Consistency",
  "Adaptability",
  "Conviction",
];

const N = AXIS_LABELS.length;
const CX = 150;
const CY = 150;
const R = 100;

/** Polar to Cartesian for axis i at a given fraction (0–1) of R. */
function polarPoint(i: number, fraction: number): { x: number; y: number } {
  const angle = (Math.PI * 2 * i) / N - Math.PI / 2;
  return {
    x: CX + R * fraction * Math.cos(angle),
    y: CY + R * fraction * Math.sin(angle),
  };
}

/** Build polygon points string for 5 grid hexagons at given scale. */
function hexagonPoints(scale: number): string {
  return Array.from({ length: N }, (_, i) => {
    const pt = polarPoint(i, scale);
    return `${pt.x},${pt.y}`;
  }).join(" ");
}

/** Build polygon points string from array of 0–100 scores. */
function scorePolygonPoints(scores: number[]): string {
  return scores
    .map((score, i) => {
      const pt = polarPoint(i, score / 100);
      return `${pt.x},${pt.y}`;
    })
    .join(" ");
}

interface RadarChartProps {
  profile: BehavioralProfile;
}

/**
 * Interpolates each score between 0 and its actual value at `t` (0–1).
 * Used for the mount animation.
 */
function interpolatedPolygonPoints(scores: number[], t: number): string {
  return scores
    .map((score, i) => {
      const pt = polarPoint(i, (score / 100) * t);
      return `${pt.x},${pt.y}`;
    })
    .join(" ");
}

function RadarChart({ profile }: RadarChartProps) {
  const gridScales = [0.2, 0.4, 0.6, 0.8, 1.0];
  const scores = profile.axes.map((a) => a.score);

  // Animate from 0 → 1 on mount using requestAnimationFrame.
  const [animT, setAnimT] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const DURATION = 650; // ms

  useEffect(() => {
    startRef.current = null;
    setAnimT(0);

    function step(ts: number) {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const raw = Math.min(elapsed / DURATION, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - raw, 3);
      setAnimT(eased);
      if (raw < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  // Run once on mount (profile identity change is fine to ignore here).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <svg
      viewBox="0 0 300 300"
      width={300}
      height={300}
      aria-label="Trader DNA radar chart"
    >
      {/* Concentric hexagon grid lines */}
      {gridScales.map((scale) => (
        <polygon
          key={scale}
          points={hexagonPoints(scale)}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="0.75"
          opacity="0.7"
        />
      ))}

      {/* Axis spoke lines from center to each vertex */}
      {AXIS_LABELS.map((_, i) => {
        const outer = polarPoint(i, 1);
        return (
          <line
            key={i}
            x1={CX}
            y1={CY}
            x2={outer.x}
            y2={outer.y}
            stroke="hsl(var(--border))"
            strokeWidth="0.75"
            opacity="0.6"
          />
        );
      })}

      {/* Score polygon — animated from center */}
      <polygon
        points={interpolatedPolygonPoints(scores, animT)}
        fill="#2d9cdb"
        fillOpacity="0.30"
        stroke="#2d9cdb"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Data point dots at each axis vertex — fade + scale with animT */}
      {scores.map((score, i) => {
        const pt = polarPoint(i, (score / 100) * animT);
        return (
          <circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r="3.5"
            fill="#2d9cdb"
            stroke="hsl(var(--background))"
            strokeWidth="1.5"
            opacity={animT}
          />
        );
      })}

      {/* Axis labels at each vertex */}
      {AXIS_LABELS.map((label, i) => {
        const labelPt = polarPoint(i, 1.28);
        return (
          <text
            key={i}
            x={labelPt.x}
            y={labelPt.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9"
            fontFamily="system-ui, sans-serif"
            fontWeight="600"
            fill="hsl(var(--foreground))"
            opacity="0.85"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Axis Card ────────────────────────────────────────────────────────────────

function AxisCard({ axis }: { axis: BehavioralAxis }) {
  const { label, score, description, insight } = axis;

  const barColor =
    score >= 70
      ? "#22c55e"
      : score >= 40
      ? "#f59e0b"
      : "#ef4444";

  const scoreTextColor =
    score >= 70
      ? "text-green-500"
      : score >= 40
      ? "text-amber-500"
      : "text-red-500";

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground">{label}</p>
          <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
            {description}
          </p>
        </div>
        <span
          className={`shrink-0 text-base font-black tabular-nums leading-none ${scoreTextColor}`}
        >
          {score}
        </span>
      </div>

      {/* Score bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: barColor }}
        />
      </div>

      {/* Insight text */}
      <p className="mt-2 text-[10px] leading-snug text-muted-foreground">
        {insight}
      </p>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border bg-card p-8 text-center">
      <div className="h-8 w-8 rounded-full border-2 border-border" />
      <div>
        <p className="text-sm font-semibold text-foreground">No trade data yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Complete at least 3 sell trades to see your behavioral profile.
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TraderDNA() {
  const tradeHistory = useTradingStore((s) => s.tradeHistory);

  const profile: BehavioralProfile = useMemo(
    () => computeBehavioralProfile(tradeHistory),
    [tradeHistory],
  );

  const archetype = useMemo(() => getArchetype(profile), [profile]);

  if (profile.tradeCount < 3) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Trader DNA</h3>
          <p className="text-[10px] text-muted-foreground">
            Based on {profile.tradeCount} closed trade
            {profile.tradeCount !== 1 ? "s" : ""}
          </p>
        </div>
        <span
          className="shrink-0 rounded-md px-2.5 py-1 text-xs font-black tabular-nums text-white"
          style={{ backgroundColor: "#2d9cdb" }}
        >
          {profile.overallScore}
        </span>
      </div>

      {/* Radar chart */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex justify-center">
          <RadarChart profile={profile} />
        </div>

        {/* DNA Summary — archetype label */}
        <div className="mt-3 border-t border-border pt-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Your trader archetype
          </p>
          <p className="mt-0.5 text-sm font-black text-foreground">
            {archetype}
          </p>
          <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
            Dominant axis:{" "}
            <span className="font-semibold text-foreground">
              {profile.dominantTrait}
            </span>
            &nbsp;&middot;&nbsp;Growth area:{" "}
            <span className="font-semibold text-foreground">
              {profile.growthArea}
            </span>
          </p>
        </div>
      </div>

      {/* Axis cards grid */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {profile.axes.map((axis) => (
          <AxisCard key={axis.name} axis={axis} />
        ))}
      </div>

      {/* Growth area callout */}
      <div className="rounded-lg border bg-card p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Growth Area
        </p>
        <p className="mt-1 text-sm font-bold" style={{ color: "#2d9cdb" }}>
          {profile.growthArea}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {profile.axes.find((a) => a.label === profile.growthArea)?.insight}
        </p>
      </div>
    </div>
  );
}
