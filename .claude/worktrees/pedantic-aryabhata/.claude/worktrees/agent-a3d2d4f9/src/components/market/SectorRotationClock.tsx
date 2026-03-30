"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  analyzeSectorRotation,
  type BusinessCycle,
} from "@/services/market/sector-rotation";

// ── Static macro conditions (matching SectorRotationPanel defaults) ──────────
const GDP_GROWTH = 2.1;
const INFLATION_RATE = 3.2;
const YIELD_CURVE_SLOPE = 15;
const UNEMPLOYMENT_TREND = "stable" as const;

// ── Phase definitions ordered clockwise starting at top-right ────────────────

interface ClockPhase {
  id: BusinessCycle;
  label: string;
  shortLabel: string;
  description: string;
  sectors: string[];
  // Angle (degrees) for the CENTER of this quadrant, 0=top, clockwise
  angleDeg: number;
  // Quadrant index for layout (0=top-right, 1=bottom-right, 2=bottom-left, 3=top-left)
  quadrant: 0 | 1 | 2 | 3;
  strokeColor: string;
  fillColor: string;
  textColor: string;
  badgeColor: string;
}

const CLOCK_PHASES: ClockPhase[] = [
  {
    id: "early_expansion",
    label: "Recovery",
    shortLabel: "Recovery",
    description: "GDP rebounds, credit loosens, unemployment starts falling",
    sectors: ["Financials", "Technology", "Consumer Disc.", "Industrials"],
    angleDeg: 45,
    quadrant: 0,
    strokeColor: "#22c55e",
    fillColor: "rgba(34,197,94,0.08)",
    textColor: "text-green-500",
    badgeColor: "bg-green-500",
  },
  {
    id: "mid_expansion",
    label: "Expansion",
    shortLabel: "Expansion",
    description: "Goldilocks phase — steady growth, low inflation, rising earnings",
    sectors: ["Materials", "Energy", "Financials", "Comm. Services"],
    angleDeg: 135,
    quadrant: 1,
    strokeColor: "#3b82f6",
    fillColor: "rgba(59,130,246,0.08)",
    textColor: "text-blue-500",
    badgeColor: "bg-blue-500",
  },
  {
    id: "late_expansion",
    label: "Slowdown",
    shortLabel: "Slowdown",
    description: "Inflation rises, Fed tightens, margins compress",
    sectors: ["Staples", "Health Care", "Utilities", "Energy"],
    angleDeg: 225,
    quadrant: 2,
    strokeColor: "#f59e0b",
    fillColor: "rgba(245,158,11,0.08)",
    textColor: "text-amber-500",
    badgeColor: "bg-amber-500",
  },
  {
    id: "recession",
    label: "Recession",
    shortLabel: "Recession",
    description: "GDP contracts, earnings fall, risk-off environment",
    sectors: ["Utilities", "Staples", "Health Care", "Bonds / Cash"],
    angleDeg: 315,
    quadrant: 3,
    strokeColor: "#ef4444",
    fillColor: "rgba(239,68,68,0.08)",
    textColor: "text-red-500",
    badgeColor: "bg-red-500",
  },
];

// ── SVG clock helpers ────────────────────────────────────────────────────────

const CX = 140;
const CY = 140;
const OUTER_R = 128;
const INNER_R = 52;
const LABEL_R = 96; // midpoint radius for sector labels

function polarToXY(angleDeg: number, r: number) {
  // 0 deg = top (12 o'clock), clockwise
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

/** Arc path for a quadrant (90-degree sweep) */
function arcPath(startAngle: number, endAngle: number, innerR: number, outerR: number) {
  const s1 = polarToXY(startAngle, outerR);
  const e1 = polarToXY(endAngle, outerR);
  const s2 = polarToXY(endAngle, innerR);
  const e2 = polarToXY(startAngle, innerR);
  return [
    `M ${s1.x} ${s1.y}`,
    `A ${outerR} ${outerR} 0 0 1 ${e1.x} ${e1.y}`,
    `L ${s2.x} ${s2.y}`,
    `A ${innerR} ${innerR} 0 0 0 ${e2.x} ${e2.y}`,
    "Z",
  ].join(" ");
}

/** Straight spoke from inner to outer */
function spokePath(angleDeg: number) {
  const inner = polarToXY(angleDeg, INNER_R);
  const outer = polarToXY(angleDeg, OUTER_R);
  return `M ${inner.x} ${inner.y} L ${outer.x} ${outer.y}`;
}

// ── Arrow indicator pointing at current phase ────────────────────────────────

function ClockArrow({ angleDeg, color }: { angleDeg: number; color: string }) {
  const arrowLen = 36;
  const arrowBase = 8;
  const tip = polarToXY(angleDeg, INNER_R - 4);
  const base = polarToXY(angleDeg + 180, arrowBase);
  const leftWing = polarToXY(angleDeg + 90, 5);
  const rightWing = polarToXY(angleDeg - 90, 5);
  const points = [
    `${tip.x},${tip.y}`,
    `${leftWing.x},${leftWing.y}`,
    `${base.x},${base.y}`,
    `${rightWing.x},${rightWing.y}`,
  ].join(" ");
  void arrowLen;
  return (
    <polygon
      points={points}
      fill={color}
      opacity={0.9}
      stroke="none"
    />
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function SectorRotationClock() {
  const model = useMemo(
    () =>
      analyzeSectorRotation(
        GDP_GROWTH,
        INFLATION_RATE,
        YIELD_CURVE_SLOPE,
        UNEMPLOYMENT_TREND,
      ),
    [],
  );

  const currentPhase = CLOCK_PHASES.find((p) => p.id === model.currentCycle)!;
  const svgWidth = CX * 2;
  const svgHeight = CY * 2;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4 hover:border-border/60 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Sector Rotation Clock</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Fidelity-style business cycle framework
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "text-[10px] font-medium px-2 py-0.5 rounded-full text-white",
              currentPhase.badgeColor,
            )}
          >
            {currentPhase.label}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {(model.confidence * 100).toFixed(0)}% conf.
          </span>
        </div>
      </div>

      {/* Clock + legend row */}
      <div className="flex flex-col sm:flex-row items-start gap-6">
        {/* SVG clock */}
        <div className="shrink-0 mx-auto sm:mx-0">
          <svg
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            aria-label="Sector rotation clock diagram"
          >
            {/* Quadrant arcs */}
            {CLOCK_PHASES.map((phase, i) => {
              const startAngle = i * 90;
              const endAngle = (i + 1) * 90;
              const isActive = phase.id === model.currentCycle;
              return (
                <path
                  key={phase.id}
                  d={arcPath(startAngle, endAngle, INNER_R, OUTER_R)}
                  fill={isActive ? phase.fillColor.replace("0.08", "0.18") : phase.fillColor}
                  stroke={phase.strokeColor}
                  strokeWidth={isActive ? 2.5 : 1}
                  strokeOpacity={isActive ? 1 : 0.4}
                />
              );
            })}

            {/* Spoke dividers at 0, 90, 180, 270 */}
            {[0, 90, 180, 270].map((angle) => (
              <path
                key={angle}
                d={spokePath(angle)}
                stroke="hsl(var(--border))"
                strokeWidth={1}
                strokeDasharray="3 2"
                strokeOpacity={0.6}
              />
            ))}

            {/* Center hub */}
            <circle
              cx={CX}
              cy={CY}
              r={INNER_R}
              fill="hsl(var(--card))"
              stroke="hsl(var(--border))"
              strokeWidth={1}
            />

            {/* Outer ring outline */}
            <circle
              cx={CX}
              cy={CY}
              r={OUTER_R}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth={1}
            />

            {/* Phase labels inside quadrants */}
            {CLOCK_PHASES.map((phase, i) => {
              const midAngle = i * 90 + 45;
              const pos = polarToXY(midAngle, LABEL_R);
              const isActive = phase.id === model.currentCycle;
              return (
                <text
                  key={phase.id}
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={isActive ? 10 : 9}
                  fontWeight={isActive ? "700" : "400"}
                  fill={isActive ? phase.strokeColor : "hsl(var(--muted-foreground))"}
                >
                  {phase.shortLabel}
                </text>
              );
            })}

            {/* Arrow pointing to current phase center */}
            <ClockArrow
              angleDeg={currentPhase.angleDeg}
              color={currentPhase.strokeColor}
            />

            {/* Center dot */}
            <circle cx={CX} cy={CY} r={5} fill={currentPhase.strokeColor} />

            {/* Cycle direction label */}
            <text
              x={CX}
              y={CY - 16}
              textAnchor="middle"
              fontSize={7}
              fill="hsl(var(--muted-foreground))"
            >
              cycle direction
            </text>
            {/* Clockwise arrow arc hint */}
            <path
              d={`M ${CX + 8} ${CY + 4} A 12 12 0 0 1 ${CX - 4} ${CY + 11}`}
              fill="none"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={1}
              strokeLinecap="round"
            />
            <polygon
              points={`${CX - 4},${CY + 11} ${CX - 9},${CY + 9} ${CX - 3},${CY + 6}`}
              fill="hsl(var(--muted-foreground))"
            />

            {/* Cardinal direction ticks */}
            {[0, 90, 180, 270].map((angle) => {
              const outer = polarToXY(angle, OUTER_R + 6);
              const inner2 = polarToXY(angle, OUTER_R + 1);
              return (
                <line
                  key={`tick-${angle}`}
                  x1={inner2.x}
                  y1={inner2.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="hsl(var(--border))"
                  strokeWidth={1}
                />
              );
            })}
          </svg>
        </div>

        {/* Phase legend */}
        <div className="flex-1 space-y-3 min-w-0">
          {CLOCK_PHASES.map((phase) => {
            const isActive = phase.id === model.currentCycle;
            return (
              <div
                key={phase.id}
                className={cn(
                  "rounded-lg border p-2.5 transition-colors",
                  isActive
                    ? "border-border/60 bg-muted/40"
                    : "border-transparent bg-transparent",
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: phase.strokeColor, opacity: isActive ? 1 : 0.4 }}
                  />
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      isActive ? phase.textColor : "text-muted-foreground",
                    )}
                  >
                    {phase.label}
                    {isActive && (
                      <span className="ml-1.5 text-[10px] font-normal opacity-70">
                        — current
                      </span>
                    )}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-snug mb-1.5">
                  {phase.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {phase.sectors.map((s) => (
                    <span
                      key={s}
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded font-medium",
                        isActive
                          ? phase.textColor
                          : "text-muted-foreground",
                      )}
                      style={{
                        backgroundColor: isActive
                          ? `${phase.strokeColor}18`
                          : "transparent",
                        border: `1px solid ${isActive ? phase.strokeColor + "40" : "transparent"}`,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current phase rationale */}
      <div
        className="rounded-lg px-3 py-2 text-xs leading-relaxed"
        style={{
          backgroundColor: `${currentPhase.strokeColor}0f`,
          borderLeft: `3px solid ${currentPhase.strokeColor}`,
        }}
      >
        <span className={cn("font-medium", currentPhase.textColor)}>
          Current phase:{" "}
        </span>
        {model.rationale}
      </div>
    </div>
  );
}
