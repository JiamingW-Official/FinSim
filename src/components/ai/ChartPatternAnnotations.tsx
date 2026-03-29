"use client";

import { cn } from "@/lib/utils";
import type { CandlePattern } from "@/services/ai/patterns";
import type { PatternHistoryEntry } from "./PatternRadar";

// ─── Pattern abbreviations ────────────────────────────────────────────────────

const PATTERN_ABBR: Record<string, string> = {
  Hammer: "H",
  "Shooting Star": "SS",
  "Bullish Engulfing": "BE",
  "Bearish Engulfing": "BE",
  Doji: "D",
  "Three White Soldiers": "3W",
  "Three Black Crows": "3C",
  "Morning Star": "MS",
  "Evening Star": "ES",
  "Bullish Pin Bar": "PB",
  "Bearish Pin Bar": "PB",
};

function getAbbr(name: string): string {
  return PATTERN_ABBR[name] ?? name.slice(0, 2).toUpperCase();
}

// ─── Current-bar annotation legend ───────────────────────────────────────────

interface CurrentAnnotationsProps {
  patterns: CandlePattern[];
  barIndex: number;
}

function CurrentAnnotations({ patterns, barIndex }: CurrentAnnotationsProps) {
  if (patterns.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {patterns.map((p, i) => {
        const isBull = p.direction === "bullish";
        const isBear = p.direction === "bearish";
        return (
          <div
            key={`${p.name}-${i}`}
            title={`${p.name} at bar ${barIndex}`}
            className={cn(
              "flex items-center gap-1 rounded border px-1.5 py-0.5",
              isBull
                ? "border-green-500/40 bg-green-500/10"
                : isBear
                ? "border-red-500/40 bg-red-500/10"
                : "border-amber-500/40 bg-amber-500/10",
            )}
          >
            <span
              className={cn(
                "font-bold text-[11px] leading-none w-4 text-center",
                isBull
                  ? "text-green-400"
                  : isBear
                  ? "text-red-400"
                  : "text-amber-400",
              )}
            >
              {getAbbr(p.name)}
            </span>
            <span className="text-[8.5px] text-muted-foreground/80 leading-none">
              {p.name}
            </span>
            <span
              className={cn(
                "text-[11px] font-bold leading-none",
                isBull
                  ? "text-green-400/60"
                  : isBear
                  ? "text-red-400/60"
                  : "text-amber-400/60",
              )}
            >
              {isBull ? "bull" : isBear ? "bear" : "neut"}
            </span>
            <span className="text-[7px] text-muted-foreground/40 font-mono leading-none">
              @{barIndex}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── History annotation list ──────────────────────────────────────────────────

interface HistoryAnnotationsProps {
  history: PatternHistoryEntry[];
}

function HistoryAnnotations({ history }: HistoryAnnotationsProps) {
  if (history.length === 0) return null;

  // Show up to 5 most recent past patterns (exclude the very latest = current bar)
  const past = history.slice(1, 6);
  if (past.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {past.map((entry, i) => {
        const isBull = entry.pattern.direction === "bullish";
        const isBear = entry.pattern.direction === "bearish";
        return (
          <div
            key={`hist-${entry.barIndex}-${i}`}
            title={`${entry.pattern.name} at bar ${entry.barIndex}`}
            className="flex items-center gap-1 rounded border border-border/30 bg-muted/20 px-1.5 py-0.5"
          >
            <span
              className={cn(
                "font-bold text-[11px] leading-none w-3 text-center",
                isBull
                  ? "text-green-400/70"
                  : isBear
                  ? "text-red-400/70"
                  : "text-amber-400/70",
              )}
            >
              {getAbbr(entry.pattern.name)}
            </span>
            <span className="text-[11px] text-muted-foreground/60 leading-none truncate max-w-16">
              {entry.pattern.name}
            </span>
            <span className="text-[7px] text-muted-foreground/40 font-mono leading-none">
              b{entry.barIndex}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface ChartPatternAnnotationsProps {
  /** Patterns detected on the current (latest revealed) bar */
  currentPatterns: CandlePattern[];
  /** Full pattern history for this session */
  history: PatternHistoryEntry[];
  /** The current bar index (revealedCount - 1) */
  currentBarIndex: number;
}

/**
 * ChartPatternAnnotations
 *
 * A UI-only component that renders a legend below the chart area showing:
 * - Pattern labels detected on the current bar ("Detected: Hammer (bull) at bar 42")
 * - A dimmed row of recent historical pattern detections
 *
 * This component does not modify the TradingView/SVG chart directly.
 * It renders as an overlay strip meant to sit just beneath the chart.
 */
export function ChartPatternAnnotations({
  currentPatterns,
  history,
  currentBarIndex,
}: ChartPatternAnnotationsProps) {
  const hasAnything = currentPatterns.length > 0 || history.length > 1;

  if (!hasAnything) return null;

  return (
    <div className="border-t border-border/30 bg-card/60 backdrop-blur-sm px-3 py-1.5 space-y-1">
      {currentPatterns.length > 0 && (
        <div className="flex items-start gap-1.5">
          <span className="text-[11px] font-bold text-primary/60 shrink-0 mt-0.5 w-14">
            Detected
          </span>
          <CurrentAnnotations
            patterns={currentPatterns}
            barIndex={currentBarIndex}
          />
        </div>
      )}

      {history.length > 1 && (
        <div className="flex items-start gap-1.5">
          <span className="text-[11px] font-bold text-muted-foreground/40 shrink-0 mt-0.5 w-14">
            Prior
          </span>
          <HistoryAnnotations history={history} />
        </div>
      )}
    </div>
  );
}
