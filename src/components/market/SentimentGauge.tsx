"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { MarketSentiment, SentimentLevel } from "@/services/market/sentiment";

const LEVEL_LABELS: Record<SentimentLevel, string> = {
  extreme_fear: "Extreme Fear",
  fear: "Fear",
  neutral: "Neutral",
  greed: "Greed",
  extreme_greed: "Extreme Greed",
};

const LEVEL_COLORS: Record<SentimentLevel, string> = {
  extreme_fear: "text-red-500",
  fear: "text-orange-500",
  neutral: "text-yellow-500",
  greed: "text-emerald-500",
  extreme_greed: "text-green-500",
};

function GaugeArc({ value }: { value: number }) {
  // Semi-circular arc from 180deg to 0deg
  const cx = 100;
  const cy = 95;
  const r = 75;
  // Angle: 180 (left) to 0 (right), mapped from 0-100
  const needleAngle = Math.PI - (value / 100) * Math.PI;
  const needleX = cx + r * 0.85 * Math.cos(needleAngle);
  const needleY = cy - r * 0.85 * Math.sin(needleAngle);

  // Create gradient arc segments
  const segments = [
    { start: 180, end: 144, color: "#ef4444" }, // extreme fear (red)
    { start: 144, end: 108, color: "#f97316" }, // fear (orange)
    { start: 108, end: 72, color: "#eab308" },  // neutral (yellow)
    { start: 72, end: 36, color: "#22c55e" },   // greed (green)
    { start: 36, end: 0, color: "#16a34a" },    // extreme greed (dark green)
  ];

  return (
    <svg viewBox="0 0 200 110" className="w-full max-w-[280px] mx-auto">
      {/* Arc segments */}
      {segments.map((seg, i) => {
        const startRad = (seg.start * Math.PI) / 180;
        const endRad = (seg.end * Math.PI) / 180;
        const x1 = cx + r * Math.cos(startRad);
        const y1 = cy - r * Math.sin(startRad);
        const x2 = cx + r * Math.cos(endRad);
        const y2 = cy - r * Math.sin(endRad);
        return (
          <path
            key={i}
            d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
            fill="none"
            stroke={seg.color}
            strokeWidth={12}
            strokeLinecap="round"
            opacity={0.8}
          />
        );
      })}
      {/* Inner arc (background) */}
      <path
        d={`M ${cx - r * 0.6} ${cy} A ${r * 0.6} ${r * 0.6} 0 0 1 ${cx + r * 0.6} ${cy}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        className="text-muted-foreground/10"
      />
      {/* Needle */}
      <line
        x1={cx}
        y1={cy}
        x2={needleX}
        y2={needleY}
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        className="text-foreground"
      />
      {/* Center dot */}
      <circle cx={cx} cy={cy} r={4} className="fill-foreground" />
      {/* Value text */}
      <text
        x={cx}
        y={cy - 20}
        textAnchor="middle"
        className="fill-foreground text-2xl font-semibold"
        fontSize="28"
        fontFamily="monospace"
      >
        {value}
      </text>
      {/* Scale labels */}
      <text x={15} y={105} className="fill-muted-foreground" fontSize="9">0</text>
      <text x={93} y={12} className="fill-muted-foreground" fontSize="9">50</text>
      <text x={178} y={105} className="fill-muted-foreground" fontSize="9">100</text>
    </svg>
  );
}

function ComponentBar({ name, value, signal }: { name: string; value: number; signal: string }) {
  const barColor =
    value <= 25
      ? "bg-red-500"
      : value <= 40
        ? "bg-orange-500"
        : value <= 60
          ? "bg-yellow-500"
          : value <= 80
            ? "bg-emerald-500"
            : "bg-green-500";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{name}</span>
        <span className="font-mono tabular-nums font-medium">{value.toFixed(0)}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-300", barColor)}
          style={{ width: `${Math.max(2, value)}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground leading-tight">{signal}</p>
    </div>
  );
}

interface SentimentGaugeProps {
  sentiment: MarketSentiment;
}

export function SentimentGauge({ sentiment }: SentimentGaugeProps) {
  const [showNote, setShowNote] = useState(false);

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Fear & Greed Index</h3>
        <span
          className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            sentiment.level === "extreme_fear" && "bg-red-500/5 text-red-500",
            sentiment.level === "fear" && "bg-orange-500/10 text-orange-500",
            sentiment.level === "neutral" && "bg-yellow-500/10 text-yellow-500",
            sentiment.level === "greed" && "bg-emerald-500/5 text-emerald-500",
            sentiment.level === "extreme_greed" && "bg-green-500/10 text-green-500",
          )}
        >
          {LEVEL_LABELS[sentiment.level]}
        </span>
      </div>

      <GaugeArc value={sentiment.overall} />

      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
        <span>Historical Avg:</span>
        <span className="font-mono tabular-nums font-medium">
          {sentiment.historicalAvg}
        </span>
        <span className={cn("ml-1", LEVEL_COLORS[sentiment.level])}>
          ({sentiment.overall > sentiment.historicalAvg ? "Above" : sentiment.overall < sentiment.historicalAvg ? "Below" : "At"} avg)
        </span>
      </div>

      {/* Component breakdown */}
      <div className="space-y-3 pt-2 border-t">
        <p className="text-xs font-medium text-muted-foreground">Components</p>
        {sentiment.components.map((c) => (
          <ComponentBar key={c.name} name={c.name} value={c.value} signal={c.signal} />
        ))}
      </div>

      {/* Educational note */}
      <div className="pt-2 border-t">
        <button
          onClick={() => setShowNote(!showNote)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <svg
            className={cn("w-3 h-3 transition-transform", showNote && "rotate-90")}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          What does this mean?
        </button>
        {showNote && (
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            {sentiment.educationalNote}
          </p>
        )}
      </div>
    </div>
  );
}
