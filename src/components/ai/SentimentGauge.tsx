"use client";

import { useMemo } from "react";
import type { Signal } from "@/services/ai/signals";
import { cn } from "@/lib/utils";

// ─── Props ───────────────────────────────────────────────────────────────────

interface SentimentGaugeProps {
  score: number;
  bias: "bullish" | "bearish" | "neutral";
  signals: Signal[];
}

// ─── Zone labels (fixed positions along the arc) ─────────────────────────────

const ZONES = [
  { label: "Strong Bear", angleDeg: 160, align: "end" as const },
  { label: "Bear", angleDeg: 130, align: "end" as const },
  { label: "Neutral", angleDeg: 90, align: "middle" as const },
  { label: "Bull", angleDeg: 50, align: "start" as const },
  { label: "Strong Bull", angleDeg: 20, align: "start" as const },
];

// ─── SVG arc helpers ─────────────────────────────────────────────────────────

const W = 200;
const H = 120;
const CX = W / 2;
const CY = 110; // center point sits near the bottom of the viewBox
const R_TRACK = 80; // outer track radius
const R_FILL = 80;
const R_NEEDLE = 74;
const R_LABEL = 96;

function arcPoint(angleDeg: number, radius = R_TRACK) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CX + radius * Math.cos(rad),
    y: CY - radius * Math.sin(rad),
  };
}

/** Build an SVG arc path from startAngle to endAngle (CCW) */
function arcPath(startDeg: number, endDeg: number, radius = R_FILL): string {
  const s = arcPoint(startDeg, radius);
  const e = arcPoint(endDeg, radius);
  const sweep = startDeg > endDeg ? 0 : 1; // 0 = counterclockwise, 1 = clockwise
  const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${radius} ${radius} 0 ${large} ${sweep} ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

// ─── Needle ──────────────────────────────────────────────────────────────────

/** Map score (-100..+100) → angle (180..0 deg). Center neutral = 90°. */
function scoreToAngle(score: number): number {
  // score -100 → 180°, 0 → 90°, +100 → 0°
  return 90 - (score / 100) * 90;
}

// ─── Segment colors ───────────────────────────────────────────────────────────

// The gauge track is divided into 5 colored segments:
// 0° – 36° → Strong Bull (emerald)
// 36° – 72° → Bull (green)
// 72° – 108° → Neutral (amber)
// 108° – 144° → Bear (orange)
// 144° – 180° → Strong Bear (red)
const SEGMENTS = [
  { from: 0, to: 36, color: "#34d399" },   // strong bull
  { from: 36, to: 72, color: "#4ade80" },  // bull
  { from: 72, to: 108, color: "#fbbf24" }, // neutral
  { from: 108, to: 144, color: "#fb923c" },// bear
  { from: 144, to: 180, color: "#f87171" },// strong bear
];

// ─── Component ───────────────────────────────────────────────────────────────

export function SentimentGauge({ score, bias, signals }: SentimentGaugeProps) {
  const needleAngle = scoreToAngle(Math.max(-100, Math.min(100, score)));

  // Needle tip
  const tip = arcPoint(needleAngle, R_NEEDLE);
  // Needle base: small perpendicular spread
  const baseFan = 4;
  const perpAngle = needleAngle + 90;
  const perpRad = (perpAngle * Math.PI) / 180;
  const baseLeft = {
    x: CX + baseFan * Math.cos(perpRad),
    y: CY - baseFan * Math.sin(perpRad),
  };
  const baseRight = {
    x: CX - baseFan * Math.cos(perpRad),
    y: CY + baseFan * Math.sin(perpRad),
  };

  // Gauge fill arc — from center angle (90°) toward needle
  const fillFrom = 90;
  const fillTo = needleAngle;
  const hasFill = Math.abs(score) >= 5;
  const fillColor =
    score >= 30
      ? "#34d399"
      : score > 0
      ? "#4ade80"
      : score <= -30
      ? "#f87171"
      : score < 0
      ? "#fb923c"
      : "#fbbf24";

  // Signal breakdown counts
  const { bullCount, bearCount, neutCount } = useMemo(() => {
    let b = 0, br = 0, n = 0;
    for (const s of signals) {
      if (s.direction === "bullish") b++;
      else if (s.direction === "bearish") br++;
      else n++;
    }
    return { bullCount: b, bearCount: br, neutCount: n };
  }, [signals]);

  const biasLabel =
    bias === "bullish" ? "Bullish" : bias === "bearish" ? "Bearish" : "Neutral";

  const scoreColor =
    score >= 30
      ? "text-emerald-400"
      : score <= -30
      ? "text-red-400"
      : "text-amber-400";

  return (
    <div className="space-y-2">
      {/* SVG Gauge */}
      <div className="flex justify-center">
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          className="overflow-visible"
          aria-label={`Sentiment gauge: ${biasLabel}, score ${score}`}
        >
          {/* Background track segments */}
          {SEGMENTS.map((seg, i) => (
            <path
              key={i}
              d={arcPath(seg.from, seg.to)}
              fill="none"
              stroke={seg.color}
              strokeWidth="8"
              strokeLinecap="butt"
              opacity="0.18"
            />
          ))}

          {/* Fill arc (from neutral center toward needle) */}
          {hasFill && (
            <path
              d={
                score > 0
                  ? arcPath(fillFrom, fillTo) // CCW toward right
                  : arcPath(fillTo, fillFrom)  // CW toward left
              }
              fill="none"
              stroke={fillColor}
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.7"
              style={{ transition: "d 0.4s ease" }}
            />
          )}

          {/* Zone labels */}
          {ZONES.map((z) => {
            const pt = arcPoint(z.angleDeg, R_LABEL);
            return (
              <text
                key={z.label}
                x={pt.x.toFixed(1)}
                y={pt.y.toFixed(1)}
                textAnchor={z.align}
                dominantBaseline="middle"
                fontSize="6"
                fontWeight="600"
                fill="currentColor"
                className="fill-muted-foreground/40"
              >
                {z.label}
              </text>
            );
          })}

          {/* Needle */}
          <polygon
            points={`${tip.x.toFixed(1)},${tip.y.toFixed(1)} ${baseLeft.x.toFixed(1)},${baseLeft.y.toFixed(1)} ${baseRight.x.toFixed(1)},${baseRight.y.toFixed(1)}`}
            fill={fillColor}
            opacity="0.9"
            style={{ transition: "all 0.4s ease" }}
          />

          {/* Center pivot */}
          <circle cx={CX} cy={CY} r="5" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
          <circle cx={CX} cy={CY} r="2.5" fill={fillColor} opacity="0.9" />

          {/* Score label in center of arc */}
          <text
            x={CX}
            y={CY - 38}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="15"
            fontWeight="900"
            fontFamily="monospace"
            fill={fillColor}
          >
            {score > 0 ? "+" : ""}
            {score}
          </text>
          <text
            x={CX}
            y={CY - 24}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="7"
            fontWeight="700"
            fill="currentColor"
            className="fill-muted-foreground/50"
          >
            {biasLabel.toUpperCase()}
          </text>
        </svg>
      </div>

      {/* Signal breakdown chips */}
      {signals.length > 0 && (
        <div className="flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
            Bullish{" "}
            <span className="font-black">{bullCount}</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded border border-border bg-muted px-2 py-0.5 text-[9px] font-bold text-muted-foreground">
            Neutral{" "}
            <span className="font-black">{neutCount}</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[9px] font-bold text-red-400">
            Bearish{" "}
            <span className="font-black">{bearCount}</span>
          </span>
        </div>
      )}

      {/* Caption */}
      <p className="text-center text-[7.5px] text-muted-foreground/40">
        As of last 50 bars
      </p>
    </div>
  );
}
