"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignalItem {
  shortLabel: string;
  direction: "bullish" | "bearish" | "neutral";
  strength: number;
}

interface QuantSignalsBarProps {
  ticker: string;
  score: number;
  bias: "bullish" | "neutral" | "bearish";
  signals: SignalItem[];
}

const DIRECTION_COLOR: Record<SignalItem["direction"], string> = {
  bullish: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  bearish: "bg-red-500/15 text-red-400 border-red-500/30",
  neutral: "bg-muted/50 text-muted-foreground border-border",
};

const BIAS_COLOR: Record<QuantSignalsBarProps["bias"], string> = {
  bullish: "text-emerald-400",
  bearish: "text-red-400",
  neutral: "text-muted-foreground",
};

const BIAS_DOT: Record<QuantSignalsBarProps["bias"], string> = {
  bullish: "bg-emerald-400",
  bearish: "bg-red-400",
  neutral: "bg-muted-foreground",
};

function StrengthBar({ score }: { score: number }) {
  // score is -100 to +100
  // Bar: left half = bearish (red), right half = bullish (green)
  // Center = 0
  const clampedScore = Math.max(-100, Math.min(100, score));
  const isPositive = clampedScore >= 0;
  const fillPct = Math.abs(clampedScore) / 100; // 0..1

  return (
    <div className="relative flex h-2 w-24 items-center overflow-hidden rounded-full bg-muted/40">
      {/* Left half track */}
      <div className="h-full w-1/2 overflow-hidden flex justify-end">
        {!isPositive && (
          <div
            className="h-full bg-red-500 rounded-l-full"
            style={{ width: `${fillPct * 100}%` }}
          />
        )}
      </div>
      {/* Center divider */}
      <div className="h-3 w-px shrink-0 bg-border" />
      {/* Right half track */}
      <div className="h-full w-1/2 overflow-hidden">
        {isPositive && (
          <div
            className="h-full bg-emerald-500 rounded-r-full"
            style={{ width: `${fillPct * 100}%` }}
          />
        )}
      </div>
    </div>
  );
}

function SignalPill({ signal }: { signal: SignalItem }) {
  const dotColor =
    signal.direction === "bullish"
      ? "bg-emerald-400"
      : signal.direction === "bearish"
        ? "bg-red-400"
        : "bg-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium leading-none overflow-hidden",
        DIRECTION_COLOR[signal.direction],
      )}
      style={{ maxWidth: "80px" }}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColor)} />
      <span className="truncate">{signal.shortLabel}</span>
    </span>
  );
}

function StrengthMiniBar({ value, max = 3 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 w-3 rounded-sm",
            i < value ? "bg-primary" : "bg-muted/50",
          )}
        />
      ))}
    </div>
  );
}

export function QuantSignalsBar({
  ticker,
  score,
  bias,
  signals,
}: QuantSignalsBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const previewSignals = signals.slice(0, 4);
  const hasMore = signals.length > 4;

  return (
    <div className="border-b border-border bg-card text-xs">
      {/* Compact bar */}
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-3 py-1.5 hover:bg-accent/30 transition-colors focus-visible:outline-none focus-visible:bg-accent/30"
        aria-expanded={isExpanded}
        aria-label="Toggle signal summary"
      >
        {/* Left: bias + score */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={cn("h-2 w-2 rounded-full shrink-0", BIAS_DOT[bias])} />
          <span className={cn("font-semibold capitalize", BIAS_COLOR[bias])}>
            {bias}
          </span>
          <span className="text-muted-foreground font-mono">
            {score > 0 ? "+" : ""}
            {score}
          </span>
          <span className="text-muted-foreground/50 text-[10px]">{ticker}</span>
        </div>

        {/* Center: strength bar */}
        <div className="flex items-center gap-1 mx-auto">
          <StrengthBar score={score} />
        </div>

        {/* Right: preview pills + toggle */}
        <div className="flex items-center gap-1 shrink-0">
          {signals.length === 0 && (
            <span className="text-muted-foreground text-[10px]">No signals</span>
          )}
          {previewSignals.map((sig) => (
            <SignalPill key={sig.shortLabel} signal={sig} />
          ))}
          {hasMore && (
            <span className="text-muted-foreground text-[10px]">
              +{signals.length - 4}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="h-3 w-3 text-muted-foreground ml-1" />
          ) : (
            <ChevronDown className="h-3 w-3 text-muted-foreground ml-1" />
          )}
        </div>
      </button>

      {/* Expanded: full signal grid — CSS max-height transition for smooth animation */}
      <div
        className="overflow-hidden border-border bg-background/50"
        style={{
          maxHeight: isExpanded ? "400px" : "0px",
          transition: "max-height 250ms ease-in-out",
          borderTopWidth: isExpanded ? "1px" : "0px",
        }}
      >
        <div className="px-3 py-2">
          {signals.length === 0 ? (
            <p className="text-center text-muted-foreground py-1">
              No active signals — enable indicators in the toolbar
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
              {signals.map((sig) => (
                <div
                  key={sig.shortLabel + sig.direction}
                  className="flex items-center justify-between rounded border border-border bg-card px-2 py-1"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full shrink-0",
                        sig.direction === "bullish"
                          ? "bg-emerald-400"
                          : sig.direction === "bearish"
                            ? "bg-red-400"
                            : "bg-muted-foreground",
                      )}
                    />
                    <span className="truncate font-medium text-[11px]">
                      {sig.shortLabel}
                    </span>
                  </div>
                  <StrengthMiniBar value={sig.strength} max={3} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
