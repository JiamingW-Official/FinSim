"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { MarketBreadth } from "@/services/market/breadth";

function RatioBar({
  label,
  leftValue,
  rightValue,
  leftLabel,
  rightLabel,
  leftColor,
  rightColor,
}: {
  label: string;
  leftValue: number;
  rightValue: number;
  leftLabel: string;
  rightLabel: string;
  leftColor: string;
  rightColor: string;
}) {
  const total = leftValue + rightValue || 1;
  const leftPct = (leftValue / total) * 100;

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2 text-xs">
        <span className={cn("font-mono tabular-nums font-medium w-10 text-right", leftColor)}>
          {leftValue}
        </span>
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden flex">
          <div
            className={cn("h-full transition-all duration-300", leftColor.replace("text-", "bg-"))}
            style={{ width: `${leftPct}%` }}
          />
          <div
            className={cn("h-full flex-1", rightColor.replace("text-", "bg-"))}
          />
        </div>
        <span className={cn("font-mono tabular-nums font-medium w-10", rightColor)}>
          {rightValue}
        </span>
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

function ProgressBar({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  const color =
    value >= 60
      ? "bg-emerald-500"
      : value >= 40
        ? "bg-yellow-500"
        : "bg-red-500";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono tabular-nums font-medium">
          {value.toFixed(1)}%{suffix ? ` ${suffix}` : ""}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-300", color)}
          style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

interface MarketBreadthPanelProps {
  breadth: MarketBreadth;
}

export function MarketBreadthPanel({ breadth }: MarketBreadthPanelProps) {
  const [showNote, setShowNote] = useState(false);

  const mcclellanColor =
    breadth.mcclellanOscillator > 0
      ? "text-emerald-500"
      : breadth.mcclellanOscillator < 0
        ? "text-red-500"
        : "text-muted-foreground";

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Market Breadth</h3>
        <span
          className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            breadth.advanceDeclineRatio >= 1.5
              ? "bg-emerald-500/10 text-emerald-500"
              : breadth.advanceDeclineRatio >= 0.8
                ? "bg-yellow-500/10 text-yellow-500"
                : "bg-red-500/10 text-red-500",
          )}
        >
          A/D: {breadth.advanceDeclineRatio.toFixed(2)}
        </span>
      </div>

      {/* Advance / Decline ratio bar */}
      <RatioBar
        label="Advancing vs Declining"
        leftValue={breadth.advancingCount}
        rightValue={breadth.decliningCount}
        leftLabel="Advancing"
        rightLabel="Declining"
        leftColor="text-emerald-500"
        rightColor="text-red-500"
      />

      {/* New Highs vs Lows */}
      <RatioBar
        label="New Highs vs Lows"
        leftValue={breadth.newHighs}
        rightValue={breadth.newLows}
        leftLabel="52W Highs"
        rightLabel="52W Lows"
        leftColor="text-emerald-500"
        rightColor="text-red-500"
      />

      {/* % Above MAs */}
      <div className="space-y-2 pt-2 border-t">
        <ProgressBar label="% Above 200-day MA" value={breadth.percentAbove200MA} />
        <ProgressBar label="% Above 50-day MA" value={breadth.percentAbove50MA} />
      </div>

      {/* McClellan Oscillator */}
      <div className="pt-2 border-t">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">McClellan Oscillator</span>
          <span className={cn("font-mono tabular-nums text-sm font-medium", mcclellanColor)}>
            {breadth.mcclellanOscillator > 0 ? "+" : ""}
            {breadth.mcclellanOscillator.toFixed(2)}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          {breadth.mcclellanOscillator > 50
            ? "Strong positive momentum in market breadth"
            : breadth.mcclellanOscillator > 0
              ? "Positive breadth momentum"
              : breadth.mcclellanOscillator > -50
                ? "Negative breadth momentum"
                : "Strong negative breadth momentum"}
        </p>
      </div>

      {/* Breadth Thrust */}
      {breadth.breadthThrust && (
        <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-xs font-medium text-emerald-500">Breadth Thrust Detected</p>
          <p className="text-[10px] text-emerald-400 mt-0.5">
            Rare bullish signal: advancing issues exceed 61.5% threshold
          </p>
        </div>
      )}

      {/* Interpretation */}
      <div className="pt-2 border-t">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {breadth.interpretation}
        </p>
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
          Learn about market breadth
        </button>
        {showNote && (
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            {breadth.educationalNote}
          </p>
        )}
      </div>
    </div>
  );
}
