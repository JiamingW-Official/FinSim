"use client";

import { cn } from "@/lib/utils";
import type { CandlePattern } from "@/services/ai/patterns";

export interface PatternHistoryEntry {
  pattern: CandlePattern;
  barIndex: number;
}

interface Props {
  patterns: CandlePattern[];
  history: PatternHistoryEntry[];
  className?: string;
}

const PATTERN_ILLUSTRATIONS: Record<string, string> = {
  Hammer:                 "Small body, long lower wick — bullish reversal",
  "Shooting Star":        "Small body, long upper wick — bearish reversal",
  "Bullish Engulfing":    "Large green candle engulfs prior red",
  "Bearish Engulfing":    "Large red candle engulfs prior green",
  Doji:                   "Open ≈ Close, indecision signal",
  "Morning Star":         "3-bar reversal at a bottom",
  "Evening Star":         "3-bar reversal at a top",
  "Pin Bar":              "Long tail rejection at key level",
  "Three White Soldiers": "3 consecutive higher green closes",
  "Three Black Crows":    "3 consecutive lower red closes",
};

export function PatternRadar({ patterns, history, className }: Props) {
  if (patterns.length === 0 && history.length === 0) {
    return (
      <div className={cn("text-xs text-muted-foreground italic py-1.5", className)}>
        No patterns detected in recent bars.
      </div>
    );
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      {/* Current patterns */}
      {patterns.map((p, i) => (
        <div
          key={`cur-${i}`}
          className={cn(
            "flex items-start gap-2 rounded-md border px-2.5 py-1.5 text-xs",
            p.direction === "bullish"
              ? "border-green-500/20 bg-green-500/5"
              : p.direction === "bearish"
              ? "border-red-500/20 bg-red-500/5"
              : "border-border bg-muted/20",
          )}
        >
          <span
            className={cn(
              "mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full",
              p.direction === "bullish" ? "bg-green-500" :
              p.direction === "bearish" ? "bg-red-500" : "bg-muted-foreground",
            )}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-foreground">{p.name}</span>
              <span
                className={cn(
                  "shrink-0 text-[10px] font-semibold uppercase",
                  p.direction === "bullish" ? "text-green-500" :
                  p.direction === "bearish" ? "text-red-500" : "text-muted-foreground",
                )}
              >
                {p.direction}
              </span>
            </div>
            {PATTERN_ILLUSTRATIONS[p.name] && (
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {PATTERN_ILLUSTRATIONS[p.name]}
              </p>
            )}
          </div>
        </div>
      ))}

      {/* Pattern history (last 5) */}
      {history.length > 0 && (
        <div className="mt-2 border-t pt-2">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Pattern History
          </p>
          {history.slice(0, 5).map((h, i) => (
            <div key={`hist-${i}`} className="flex items-center gap-2 py-0.5 text-[11px]">
              <span
                className={cn(
                  "inline-block h-1.5 w-1.5 shrink-0 rounded-full",
                  h.pattern.direction === "bullish" ? "bg-green-500" :
                  h.pattern.direction === "bearish" ? "bg-red-500" : "bg-muted-foreground",
                )}
              />
              <span className="text-muted-foreground">{h.pattern.name}</span>
              <span className="ml-auto text-muted-foreground/60">bar {h.barIndex}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
