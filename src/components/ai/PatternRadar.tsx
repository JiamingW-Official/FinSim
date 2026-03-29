"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { CandlePattern } from "@/services/ai/patterns";

// ─── Pattern SVG Illustrations ───────────────────────────────────────────────

// Each illustration draws 3-5 simplified candles in a 60×36 viewbox.
// Candles are rendered as [x, open%, close%, high%, low%] in 0-1 space.
// Green = close > open; red = close < open.

interface CandleSpec {
  x: number;       // center x in [0,60]
  openY: number;   // 0=top, 1=bottom (price axis is inverted)
  closeY: number;
  highY: number;
  lowY: number;
  green: boolean;
}

function toY(pct: number): number {
  return 4 + pct * 28; // maps 0-1 → 4-32 within 36px viewbox
}

function CandleIllustration({ pattern }: { pattern: string }) {
  const specs = useMemo((): CandleSpec[] => PATTERN_CANDLES[pattern] ?? PATTERN_CANDLES["Default"], [pattern]);

  return (
    <svg
      width="60"
      height="36"
      viewBox="0 0 60 36"
      className="shrink-0"
      aria-label={`${pattern} illustration`}
    >
      {specs.map((c, i) => {
        const bodyTop = toY(Math.min(c.openY, c.closeY));
        const bodyBot = toY(Math.max(c.openY, c.closeY));
        const bodyH = Math.max(bodyBot - bodyTop, 1.5);
        const color = c.green ? "#22c55e" : "#ef4444";
        const cx = c.x;
        return (
          <g key={i}>
            {/* Wick */}
            <line
              x1={cx}
              y1={toY(c.highY)}
              x2={cx}
              y2={toY(c.lowY)}
              stroke={color}
              strokeWidth={1}
            />
            {/* Body */}
            <rect
              x={cx - 4}
              y={bodyTop}
              width={8}
              height={bodyH}
              fill={color}
              rx={0.5}
            />
          </g>
        );
      })}
    </svg>
  );
}

// ─── Pattern candle shapes ────────────────────────────────────────────────────
// openY / closeY: fraction from 0 (top/high price) to 1 (bottom/low price)
// highY ≤ min(openY, closeY) and lowY ≥ max(openY, closeY)

const PATTERN_CANDLES: Record<string, CandleSpec[]> = {
  Hammer: [
    { x: 12, openY: 0.3, closeY: 0.4, highY: 0.25, lowY: 0.85, green: true },  // context down
    { x: 26, openY: 0.5, closeY: 0.6, highY: 0.45, lowY: 0.9, green: false }, // context down
    { x: 42, openY: 0.55, closeY: 0.45, highY: 0.42, lowY: 0.95, green: true }, // hammer
  ],
  "Shooting Star": [
    { x: 12, openY: 0.6, closeY: 0.5, highY: 0.45, lowY: 0.65, green: true },
    { x: 26, openY: 0.5, closeY: 0.4, highY: 0.35, lowY: 0.55, green: true },
    { x: 42, openY: 0.38, closeY: 0.48, highY: 0.05, lowY: 0.52, green: false }, // shooting star
  ],
  "Bullish Engulfing": [
    { x: 20, openY: 0.35, closeY: 0.55, highY: 0.3, lowY: 0.6, green: false }, // small red
    { x: 40, openY: 0.6, closeY: 0.2, highY: 0.15, lowY: 0.65, green: true },  // large green
  ],
  "Bearish Engulfing": [
    { x: 20, openY: 0.55, closeY: 0.35, highY: 0.3, lowY: 0.6, green: true },  // small green
    { x: 40, openY: 0.25, closeY: 0.65, highY: 0.2, lowY: 0.7, green: false }, // large red
  ],
  Doji: [
    { x: 12, openY: 0.35, closeY: 0.25, highY: 0.2, lowY: 0.45, green: true },
    { x: 30, openY: 0.4, closeY: 0.41, highY: 0.1, lowY: 0.85, green: true }, // doji: tiny body, long wicks
    { x: 48, openY: 0.38, closeY: 0.28, highY: 0.23, lowY: 0.45, green: true },
  ],
  "Three White Soldiers": [
    { x: 12, openY: 0.7, closeY: 0.5, highY: 0.45, lowY: 0.75, green: true },
    { x: 30, openY: 0.55, closeY: 0.35, highY: 0.3, lowY: 0.6, green: true },
    { x: 48, openY: 0.38, closeY: 0.15, highY: 0.1, lowY: 0.43, green: true },
  ],
  "Three Black Crows": [
    { x: 12, openY: 0.2, closeY: 0.4, highY: 0.15, lowY: 0.45, green: false },
    { x: 30, openY: 0.35, closeY: 0.6, highY: 0.3, lowY: 0.65, green: false },
    { x: 48, openY: 0.55, closeY: 0.8, highY: 0.5, lowY: 0.85, green: false },
  ],
  "Morning Star": [
    { x: 12, openY: 0.25, closeY: 0.55, highY: 0.2, lowY: 0.6, green: false },  // large red
    { x: 30, openY: 0.65, closeY: 0.7, highY: 0.55, lowY: 0.8, green: false },   // small doji-like
    { x: 48, openY: 0.68, closeY: 0.35, highY: 0.3, lowY: 0.73, green: true },  // large green
  ],
  "Evening Star": [
    { x: 12, openY: 0.65, closeY: 0.35, highY: 0.3, lowY: 0.7, green: true },  // large green
    { x: 30, openY: 0.28, closeY: 0.22, highY: 0.15, lowY: 0.38, green: true }, // small
    { x: 48, openY: 0.18, closeY: 0.6, highY: 0.14, lowY: 0.65, green: false }, // large red
  ],
  "Bullish Pin Bar": [
    { x: 20, openY: 0.45, closeY: 0.35, highY: 0.3, lowY: 0.6, green: false },
    { x: 40, openY: 0.42, closeY: 0.38, highY: 0.35, lowY: 0.9, green: true }, // long lower wick
  ],
  "Bearish Pin Bar": [
    { x: 20, openY: 0.45, closeY: 0.55, highY: 0.35, lowY: 0.6, green: true },
    { x: 40, openY: 0.55, closeY: 0.6, highY: 0.08, lowY: 0.65, green: false }, // long upper wick
  ],
  Default: [
    { x: 15, openY: 0.4, closeY: 0.3, highY: 0.25, lowY: 0.5, green: true },
    { x: 30, openY: 0.35, closeY: 0.5, highY: 0.3, lowY: 0.55, green: false },
    { x: 45, openY: 0.45, closeY: 0.35, highY: 0.3, lowY: 0.55, green: true },
  ],
};

// ─── One-line implications per pattern ───────────────────────────────────────

const IMPLICATIONS: Record<string, string> = {
  Hammer: "Buyers absorbed selling pressure; potential upswing ahead.",
  "Shooting Star": "Sellers rejected higher prices; watch for a pullback.",
  "Bullish Engulfing": "Green candle swallowed prior red body; momentum shift up.",
  "Bearish Engulfing": "Red candle swallowed prior green body; momentum shift down.",
  Doji: "Buyer-seller standoff; breakout direction TBD.",
  "Three White Soldiers": "Three consecutive higher closes; strong bullish continuation.",
  "Three Black Crows": "Three consecutive lower closes; strong bearish continuation.",
  "Morning Star": "Low, pause, recovery sequence; classic bottom reversal.",
  "Evening Star": "High, pause, drop sequence; classic top reversal.",
  "Bullish Pin Bar": "Price quickly rejected lows; bulls in control.",
  "Bearish Pin Bar": "Price quickly rejected highs; bears in control.",
};

// ─── Strength dots ────────────────────────────────────────────────────────────

function StrengthDots({ strength }: { strength: 1 | 2 | 3 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className={cn(
            "h-1 w-1 rounded-full",
            n <= strength ? "bg-foreground/60" : "bg-border",
          )}
        />
      ))}
    </div>
  );
}

// ─── Pattern History ──────────────────────────────────────────────────────────

export interface PatternHistoryEntry {
  pattern: CandlePattern;
  barIndex: number;
}

function PatternHistoryLog({ history }: { history: PatternHistoryEntry[] }) {
  if (history.length === 0) return null;

  return (
    <div className="space-y-0.5">
      <div className="text-[11px] font-bold text-foreground/40 px-1">
        Recent Pattern History
      </div>
      <div className="max-h-28 overflow-y-auto scrollbar-hide space-y-px">
        {history.map((entry, i) => {
          const isBull = entry.pattern.direction === "bullish";
          const isBear = entry.pattern.direction === "bearish";
          return (
            <div
              key={`${entry.barIndex}-${entry.pattern.name}-${i}`}
              className={cn(
                "flex items-center justify-between rounded px-1.5 py-0.5",
                isBull
                  ? "bg-green-500/8"
                  : isBear
                  ? "bg-red-500/8"
                  : "bg-amber-500/8",
              )}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className={cn(
                    "text-[8px] font-bold shrink-0 w-3 text-center",
                    isBull
                      ? "text-green-400"
                      : isBear
                      ? "text-red-400"
                      : "text-amber-400",
                  )}
                >
                  {entry.pattern.name[0]}
                </span>
                <span className="text-[11px] text-foreground/70 truncate">
                  {entry.pattern.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={cn(
                    "text-[8px] font-bold",
                    isBull
                      ? "text-green-400/70"
                      : isBear
                      ? "text-red-400/70"
                      : "text-amber-400/70",
                  )}
                >
                  {isBull ? "bull" : isBear ? "bear" : "neut"}
                </span>
                <span className="text-[8px] text-muted-foreground/50 font-mono">
                  b{entry.barIndex}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Pattern Card ────────────────────────────────────────────────────────

function PatternCard({ pattern }: { pattern: CandlePattern }) {
  const isBull = pattern.direction === "bullish";
  const isBear = pattern.direction === "bearish";
  const confidence = pattern.strength === 3 ? 90 : pattern.strength === 2 ? 65 : 40;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-md border px-2 py-1.5 space-y-1",
        isBull
          ? "border-green-500/25 bg-green-500/5"
          : isBear
          ? "border-red-500/25 bg-red-500/5"
          : "border-amber-500/25 bg-amber-500/5",
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={cn(
              "text-[8px] font-bold rounded px-1 py-0.5 leading-none shrink-0",
              isBull
                ? "bg-green-500/20 text-green-400"
                : isBear
                ? "bg-red-500/20 text-red-400"
                : "bg-amber-500/20 text-amber-400",
            )}
          >
            {isBull ? "BULL" : isBear ? "BEAR" : "NEUT"}
          </span>
          <span className="text-xs font-bold text-foreground/90 truncate">
            {pattern.name}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <StrengthDots strength={pattern.strength} />
          <span className="text-[11px] font-mono text-muted-foreground">
            {confidence}%
          </span>
        </div>
      </div>

      {/* SVG + implication */}
      <div className="flex items-center gap-2">
        <CandleIllustration pattern={pattern.name} />
        <p className="text-[8.5px] text-muted-foreground/80 leading-tight">
          {IMPLICATIONS[pattern.name] ?? pattern.description}
        </p>
      </div>
    </motion.div>
  );
}

// ─── PatternRadar Export ──────────────────────────────────────────────────────

export interface PatternRadarProps {
  patterns: CandlePattern[];
  history: PatternHistoryEntry[];
}

export function PatternRadar({ patterns, history }: PatternRadarProps) {
  const hasPatterns = patterns.length > 0;
  const hasHistory = history.length > 0;

  if (!hasPatterns && !hasHistory) {
    return (
      <div className="rounded-md border border-border/40 bg-muted/20 px-2 py-3 text-center">
        <p className="text-[11px] text-muted-foreground/60">
          No candlestick patterns detected in current bars.
        </p>
        <p className="text-[8.5px] text-muted-foreground/40 mt-0.5">
          Advance more bars to detect patterns.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-foreground/40">
          Pattern Radar
        </span>
        {hasPatterns && (
          <span className="text-[8px] text-muted-foreground/50">
            {patterns.length} detected
          </span>
        )}
      </div>

      {/* Active patterns */}
      <AnimatePresence mode="popLayout">
        {hasPatterns ? (
          <div className="space-y-1.5">
            {patterns.map((p, i) => (
              <PatternCard key={`${p.name}-${i}`} pattern={p} />
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground/50 px-1">
            No patterns on current bar.
          </p>
        )}
      </AnimatePresence>

      {/* History log */}
      {hasHistory && <PatternHistoryLog history={history} />}
    </div>
  );
}
