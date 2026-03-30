"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Copy,
  Check,
  BarChart3,
  BookOpen,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  HISTORICAL_EVENTS,
  EVENT_DIFFICULTY_COLOR,
  EVENT_CATEGORY_LABEL,
  type HistoricalEvent,
  type EventDifficulty,
} from "@/data/historical-events";
import type { OHLCVBar } from "@/types/market";

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

type TradeDirection = "bullish" | "bearish" | "neutral";
type ReplayPhase = "select" | "replay" | "decision" | "resolution" | "result";

interface UserDecision {
  direction: TradeDirection;
  size: number; // 1x / 2x / 3x leverage
  probabilityEstimate: number; // 0-100: how confident bullish
}

interface ReplayResult {
  event: HistoricalEvent;
  decision: UserDecision;
  pnl: number;
  pnlPct: number;
  calibrationScore: number; // 0-100, Brier-like
  correct: boolean;
}

// ────────────────────────────────────────────────────────────────
// Utility helpers
// ────────────────────────────────────────────────────────────────

function formatPrice(p: number): string {
  if (p >= 1000) return p.toFixed(2);
  if (p >= 10) return p.toFixed(2);
  return p.toFixed(4);
}

function formatPct(p: number, decimals = 1): string {
  const sign = p >= 0 ? "+" : "";
  return `${sign}${p.toFixed(decimals)}%`;
}

/** Compute calibration score (0-100): 100 = perfect, penalise Brier-style */
function calibrationScore(
  userProbabilityBullish: number,
  outcome: "bullish" | "bearish" | "neutral",
): number {
  const p = userProbabilityBullish / 100;
  const actual = outcome === "bullish" ? 1 : outcome === "bearish" ? 0 : 0.5;
  const brier = Math.pow(p - actual, 2);
  return Math.round((1 - brier) * 100);
}

// ────────────────────────────────────────────────────────────────
// Sub-component: mini OHLCV candlestick chart (pure SVG)
// ────────────────────────────────────────────────────────────────

function MiniCandlestickChart({
  bars,
  highlightIndex,
  keyPrices,
}: {
  bars: OHLCVBar[];
  highlightIndex?: number;
  keyPrices?: number[];
}) {
  const W = 600;
  const H = 180;
  const padLeft = 46;
  const padRight = 12;
  const padTop = 12;
  const padBottom = 24;
  const plotW = W - padLeft - padRight;
  const plotH = H - padTop - padBottom;

  if (bars.length === 0) return null;

  const allPrices = bars.flatMap((b) => [b.high, b.low]);
  const minP = Math.min(...allPrices);
  const maxP = Math.max(...allPrices);
  const priceRange = maxP - minP || 1;

  const py = (p: number) => padTop + ((maxP - p) / priceRange) * plotH;
  const bw = Math.max(1, Math.min(8, plotW / bars.length - 1));
  const xOf = (i: number) =>
    padLeft + (i / Math.max(bars.length - 1, 1)) * plotW;

  // Y-axis labels
  const yTicks = 4;
  const yTickVals = Array.from(
    { length: yTicks + 1 },
    (_, i) => minP + (priceRange * i) / yTicks,
  );

  // X-axis dates (show 5 labels)
  const xTickCount = Math.min(5, bars.length);
  const xTickIndices = Array.from({ length: xTickCount }, (_, i) =>
    Math.floor((i / (xTickCount - 1)) * (bars.length - 1)),
  );

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className="w-full select-none"
      aria-hidden="true"
    >
      {/* Grid */}
      {yTickVals.map((v, i) => (
        <line
          key={`grid-${i}`}
          x1={padLeft}
          x2={padLeft + plotW}
          y1={py(v)}
          y2={py(v)}
          stroke="currentColor"
          strokeOpacity={0.08}
          strokeWidth={1}
        />
      ))}

      {/* Key price levels */}
      {(keyPrices ?? []).map((kp, i) => (
        <line
          key={`kp-${i}`}
          x1={padLeft}
          x2={padLeft + plotW}
          y1={py(kp)}
          y2={py(kp)}
          stroke="#2d9cdb"
          strokeOpacity={0.35}
          strokeWidth={1}
          strokeDasharray="4 3"
        />
      ))}

      {/* Highlight zone after decision */}
      {highlightIndex !== undefined && highlightIndex < bars.length - 1 && (
        <rect
          x={xOf(highlightIndex)}
          y={padTop}
          width={xOf(bars.length - 1) - xOf(highlightIndex)}
          height={plotH}
          fill="hsl(var(--primary))"
          fillOpacity={0.06}
        />
      )}

      {/* Candles */}
      {bars.map((bar, i) => {
        const x = xOf(i);
        const isBull = bar.close >= bar.open;
        const color = isBull ? "#22c55e" : "#ef4444";
        const bodyTop = py(Math.max(bar.open, bar.close));
        const bodyBot = py(Math.min(bar.open, bar.close));
        const bodyH = Math.max(1, bodyBot - bodyTop);
        return (
          <g key={i}>
            {/* Wick */}
            <line
              x1={x}
              x2={x}
              y1={py(bar.high)}
              y2={py(bar.low)}
              stroke={color}
              strokeWidth={1}
              strokeOpacity={0.8}
            />
            {/* Body */}
            <rect
              x={x - bw / 2}
              y={bodyTop}
              width={bw}
              height={bodyH}
              fill={color}
              fillOpacity={isBull ? 0.75 : 0.85}
            />
          </g>
        );
      })}

      {/* Decision marker */}
      {highlightIndex !== undefined && (
        <line
          x1={xOf(highlightIndex)}
          x2={xOf(highlightIndex)}
          y1={padTop}
          y2={padTop + plotH}
          stroke="#2d9cdb"
          strokeWidth={1.5}
          strokeDasharray="3 2"
        />
      )}

      {/* Y-axis labels */}
      {yTickVals.map((v, i) => (
        <text
          key={`ylabel-${i}`}
          x={padLeft - 4}
          y={py(v) + 3}
          textAnchor="end"
          className="fill-muted-foreground"
          fontSize={9}
        >
          {formatPrice(v)}
        </text>
      ))}

      {/* X-axis date labels */}
      {xTickIndices.map((idx) => {
        const d = new Date(bars[idx].timestamp);
        const label = d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        return (
          <text
            key={`xlabel-${idx}`}
            x={xOf(idx)}
            y={H - 6}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={9}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

// ────────────────────────────────────────────────────────────────
// Sub-component: probability curve chart (SVG line)
// ────────────────────────────────────────────────────────────────

function ProbabilityCurveChart({
  data,
  revealedCount,
}: {
  data: number[];
  revealedCount: number;
}) {
  const W = 300;
  const H = 80;
  const padL = 28;
  const padB = 18;
  const padT = 8;
  const padR = 8;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const visible = data.slice(0, Math.min(revealedCount, data.length));
  if (visible.length < 2) return null;

  const points = visible
    .map((v, i) => {
      const x = padL + (i / (data.length - 1)) * plotW;
      const y = padT + (1 - v / 100) * plotH;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      aria-hidden="true"
    >
      {[0, 50, 100].map((v) => (
        <line
          key={v}
          x1={padL}
          x2={padL + plotW}
          y1={padT + (1 - v / 100) * plotH}
          y2={padT + (1 - v / 100) * plotH}
          stroke="currentColor"
          strokeOpacity={0.1}
          strokeWidth={1}
        />
      ))}
      <polyline
        points={points}
        fill="none"
        stroke="#2d9cdb"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {[0, 50, 100].map((v) => (
        <text
          key={`y-${v}`}
          x={padL - 3}
          y={padT + (1 - v / 100) * plotH + 3}
          textAnchor="end"
          className="fill-muted-foreground"
          fontSize={8}
        >
          {v}%
        </text>
      ))}
      <text
        x={padL + plotW / 2}
        y={H - 3}
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={8}
      >
        Bullish probability over time
      </text>
    </svg>
  );
}

// ────────────────────────────────────────────────────────────────
// Sub-component: Event selection grid
// ────────────────────────────────────────────────────────────────

function EventCard({
  event,
  onSelect,
}: {
  event: HistoricalEvent;
  onSelect: () => void;
}) {
  const firstBar = event.bars[0];
  const lastBar = event.bars[event.bars.length - 1];
  const totalMove =
    ((lastBar.close - firstBar.open) / firstBar.open) * 100;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/30 active:scale-[0.98]"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span
          className={cn(
            "shrink-0 rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-medium",
            EVENT_DIFFICULTY_COLOR[event.difficulty as EventDifficulty],
          )}
        >
          {event.difficulty}
        </span>
        <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
          {EVENT_CATEGORY_LABEL[event.category]}
        </span>
      </div>

      <h3 className="mb-1 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
        {event.title}
      </h3>

      <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
        {event.description}
      </p>

      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground font-mono">{event.assetLabel}</span>
        <span
          className={cn(
            "font-mono font-semibold tabular-nums",
            totalMove >= 0 ? "text-green-400" : "text-red-400",
          )}
        >
          {formatPct(totalMove)}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
        <span>{event.bars.length} bars</span>
        <span className="mx-1 opacity-40">·</span>
        <span>{event.educationalPoints.length} lessons</span>
        <span className="mx-1 opacity-40">·</span>
        <span>{new Date(event.date).getFullYear()}</span>
      </div>

      <div className="mt-2 flex items-center gap-1 text-[10px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="h-3 w-3" />
        Start replay
      </div>
    </button>
  );
}

// ────────────────────────────────────────────────────────────────
// Sub-component: Decision panel
// ────────────────────────────────────────────────────────────────

function DecisionPanel({
  event,
  onSubmit,
}: {
  event: HistoricalEvent;
  onSubmit: (d: UserDecision) => void;
}) {
  const [direction, setDirection] = useState<TradeDirection | null>(null);
  const [size, setSize] = useState(1);
  const [probability, setProbability] = useState(50);

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Target className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">
          Decision Point
        </span>
      </div>

      <p className="mb-4 text-[12px] leading-relaxed text-muted-foreground">
        {event.decisionContext}
      </p>

      {/* Direction */}
      <div className="mb-3">
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Direction
        </div>
        <div className="flex gap-2">
          {(
            [
              {
                value: "bullish" as TradeDirection,
                label: "Bullish",
                Icon: TrendingUp,
                activeClass: "bg-green-500/15 border-green-500/30 text-green-400",
              },
              {
                value: "neutral" as TradeDirection,
                label: "Neutral",
                Icon: Minus,
                activeClass: "bg-muted border-border text-foreground",
              },
              {
                value: "bearish" as TradeDirection,
                label: "Bearish",
                Icon: TrendingDown,
                activeClass: "bg-red-500/15 border-red-500/30 text-red-400",
              },
            ] as const
          ).map(({ value, label, Icon, activeClass }) => (
            <button
              key={value}
              type="button"
              onClick={() => setDirection(value)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium transition-colors active:scale-95",
                direction === value
                  ? activeClass
                  : "border-border/60 text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Position size */}
      <div className="mb-3">
        <div className="mb-1.5 flex items-center justify-between text-[10px]">
          <span className="font-semibold uppercase tracking-wider text-muted-foreground">
            Position Size
          </span>
          <span className="font-semibold text-foreground">{size}x</span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={cn(
                "flex-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors active:scale-95",
                size === s
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-border/60 text-muted-foreground hover:text-foreground",
              )}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Probability estimate */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-[10px]">
          <span className="font-semibold uppercase tracking-wider text-muted-foreground">
            Bullish probability estimate
          </span>
          <span className="font-mono font-semibold text-foreground">
            {probability}%
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={99}
          step={1}
          value={probability}
          onChange={(e) => setProbability(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
        />
        <div className="mt-0.5 flex justify-between text-[9px] text-muted-foreground">
          <span>Strongly bearish</span>
          <span>Strongly bullish</span>
        </div>
      </div>

      {/* Submit */}
      <button
        type="button"
        disabled={direction === null}
        onClick={() => {
          if (direction === null) return;
          onSubmit({ direction, size, probabilityEstimate: probability });
        }}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Confirm Decision
      </button>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Sub-component: Result panel
// ────────────────────────────────────────────────────────────────

function ResultPanel({
  result,
  onRestart,
  onSelectNew,
}: {
  result: ReplayResult;
  onRestart: () => void;
  onSelectNew: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const { event, decision, pnl, pnlPct, calibrationScore: score, correct } = result;

  const handleCopy = () => {
    const text = [
      `FinSim Historical Replay: ${event.title}`,
      `Direction: ${decision.direction} ${decision.size}x`,
      `Result: ${pnl >= 0 ? "+" : ""}${pnl.toFixed(0)} pts (${formatPct(pnlPct)})`,
      `Calibration score: ${score}/100`,
      correct ? "Correct call!" : "Wrong direction",
      "https://finsim.app",
    ].join(" | ");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const gradeColor =
    score >= 80
      ? "text-green-400"
      : score >= 60
        ? "text-amber-400"
        : "text-red-400";

  return (
    <div className="space-y-4">
      {/* Score banner */}
      <div
        className={cn(
          "rounded-lg border p-4 text-center",
          correct
            ? "border-green-500/20 bg-green-500/5"
            : "border-red-500/20 bg-red-500/5",
        )}
      >
        <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {correct ? "Correct Direction" : "Wrong Direction"}
        </div>
        <div
          className={cn(
            "text-3xl font-bold tabular-nums",
            pnl >= 0 ? "text-green-400" : "text-red-400",
          )}
        >
          {pnl >= 0 ? "+" : ""}
          {pnl.toFixed(0)} pts
        </div>
        <div className="mt-0.5 text-sm text-muted-foreground font-mono">
          {formatPct(pnlPct)} return · {decision.size}x size
        </div>
      </div>

      {/* Calibration */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">
            Calibration Score
          </span>
          <span className={cn("text-2xl font-bold tabular-nums", gradeColor)}>
            {score}/100
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              score >= 80
                ? "bg-green-500"
                : score >= 60
                  ? "bg-amber-400"
                  : "bg-red-500",
            )}
            style={{ width: `${score}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Your probability estimate was{" "}
          <span className="font-semibold text-foreground">
            {decision.probabilityEstimate}% bullish
          </span>
          . Actual outcome:{" "}
          <span className="font-semibold text-foreground">
            {event.correctAnswer}
          </span>
          . Calibration measures how well your confidence matches reality.
        </p>
      </div>

      {/* Key stats */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          What Happened
        </div>
        <div className="grid grid-cols-2 gap-2">
          {event.stats.map((s, i) => (
            <div
              key={i}
              className="rounded-md bg-muted/40 px-2.5 py-2"
            >
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
              <div className="mt-0.5 text-xs font-semibold text-foreground">
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Educational points */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5" />
          Key Lessons
        </div>
        <ul className="space-y-2">
          {event.educationalPoints.map((pt, i) => (
            <li
              key={i}
              className="flex gap-2 text-[11px] leading-relaxed text-muted-foreground"
            >
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/50" />
              {pt}
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onRestart}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted active:scale-95"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Replay
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted active:scale-95"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? "Copied" : "Share"}
        </button>
        <button
          type="button"
          onClick={onSelectNew}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95"
        >
          New Event
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Main component
// ────────────────────────────────────────────────────────────────

export function HistoricalEventReplay() {
  const [phase, setPhase] = useState<ReplayPhase>("select");
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent | null>(
    null,
  );
  const [revealedCount, setRevealedCount] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [decision, setDecision] = useState<UserDecision | null>(null);
  const [result, setResult] = useState<ReplayResult | null>(null);
  const [filterDiff, setFilterDiff] = useState<EventDifficulty | "All">("All");

  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Auto-play logic ─────────────────────────────────────────
  const stopPlay = useCallback(() => {
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying || !selectedEvent) return;

    playIntervalRef.current = setInterval(() => {
      setRevealedCount((prev) => {
        const decisionIdx = selectedEvent.decisionBarIndex;
        const maxBars = selectedEvent.bars.length;

        // Pause at decision point
        if (prev === decisionIdx && phase === "replay") {
          stopPlay();
          setPhase("decision");
          return prev;
        }
        // Stop at end
        if (prev >= maxBars) {
          stopPlay();
          return maxBars;
        }
        return prev + 1;
      });
    }, 600);

    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, selectedEvent, phase, stopPlay]);

  // ── Derived state ────────────────────────────────────────────
  const visibleBars = useMemo(() => {
    if (!selectedEvent) return [];
    return selectedEvent.bars.slice(0, revealedCount);
  }, [selectedEvent, revealedCount]);

  const currentBar = visibleBars[visibleBars.length - 1];
  const firstBar = selectedEvent?.bars[0];
  const totalMove =
    currentBar && firstBar
      ? ((currentBar.close - firstBar.open) / firstBar.open) * 100
      : 0;

  // ── Handlers ────────────────────────────────────────────────
  const handleSelectEvent = (event: HistoricalEvent) => {
    setSelectedEvent(event);
    setRevealedCount(1);
    setIsPlaying(false);
    setDecision(null);
    setResult(null);
    setPhase("replay");
  };

  const handleStep = () => {
    if (!selectedEvent) return;
    const decisionIdx = selectedEvent.decisionBarIndex;
    const maxBars = selectedEvent.bars.length;
    setRevealedCount((prev) => {
      if (prev === decisionIdx && phase === "replay") {
        setPhase("decision");
        return prev;
      }
      return Math.min(prev + 1, maxBars);
    });
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopPlay();
    } else {
      setIsPlaying(true);
    }
  };

  const handleDecision = (d: UserDecision) => {
    if (!selectedEvent) return;
    setDecision(d);
    setPhase("resolution");
    // Reveal remaining bars
    setRevealedCount(selectedEvent.bars.length);
  };

  const handleShowResult = () => {
    if (!selectedEvent || !decision) return;
    const lastBar = selectedEvent.bars[selectedEvent.bars.length - 1];
    const decisionBar =
      selectedEvent.bars[selectedEvent.decisionBarIndex - 1] ??
      selectedEvent.bars[0];

    const priceMove =
      (lastBar.close - decisionBar.close) / decisionBar.close;
    const dirMultiplier =
      decision.direction === "bullish"
        ? 1
        : decision.direction === "bearish"
          ? -1
          : 0;
    const pnlPct = priceMove * dirMultiplier * decision.size * 100;
    const pnl = 1000 * (pnlPct / 100) * decision.size;

    const correct =
      (priceMove > 0 && decision.direction === "bullish") ||
      (priceMove < 0 && decision.direction === "bearish") ||
      (Math.abs(priceMove) < 0.01 && decision.direction === "neutral");

    const calScore = calibrationScore(
      decision.probabilityEstimate,
      selectedEvent.correctAnswer,
    );

    setResult({
      event: selectedEvent,
      decision,
      pnl,
      pnlPct,
      calibrationScore: calScore,
      correct,
    });
    setPhase("result");
  };

  const handleRestart = () => {
    if (!selectedEvent) return;
    handleSelectEvent(selectedEvent);
  };

  const handleSelectNew = () => {
    setPhase("select");
    setSelectedEvent(null);
    setResult(null);
    setDecision(null);
  };

  // ── Filtered events ─────────────────────────────────────────
  const filteredEvents = useMemo(
    () =>
      filterDiff === "All"
        ? HISTORICAL_EVENTS
        : HISTORICAL_EVENTS.filter((e) => e.difficulty === filterDiff),
    [filterDiff],
  );

  // ── Render: Select phase ────────────────────────────────────
  if (phase === "select") {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
            <BarChart3 className="h-4 w-4 text-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Historical Event Replay
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Relive 8 defining market moments bar-by-bar
            </p>
          </div>
        </div>

        {/* Difficulty filter */}
        <div className="flex gap-1.5">
          {(["All", "Beginner", "Intermediate", "Expert"] as const).map(
            (d) => (
              <button
                key={d}
                type="button"
                onClick={() => setFilterDiff(d)}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors active:scale-95",
                  filterDiff === d
                    ? "bg-primary/15 border-primary/30 text-primary"
                    : "border-border/40 text-muted-foreground hover:text-foreground",
                )}
              >
                {d}
              </button>
            ),
          )}
        </div>

        {/* Event grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onSelect={() => handleSelectEvent(event)}
            />
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>No events match this filter</span>
            <button
              type="button"
              onClick={() => setFilterDiff("All")}
              className="text-xs text-primary hover:underline"
            >
              Show all events
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Render: Replay / Decision / Resolution / Result ─────────
  if (!selectedEvent) return null;

  return (
    <div className="space-y-4">
      {/* Back + event title */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSelectNew}
          className="rounded-md border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground active:scale-95"
        >
          Back
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="truncate text-sm font-semibold text-foreground">
            {selectedEvent.title}
          </h2>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span>{selectedEvent.assetLabel}</span>
            <span className="opacity-40">·</span>
            <span
              className={cn(
                "font-medium",
                EVENT_DIFFICULTY_COLOR[
                  selectedEvent.difficulty as EventDifficulty
                ],
              )}
            >
              {selectedEvent.difficulty}
            </span>
          </div>
        </div>
      </div>

      {/* Price chart */}
      <div className="rounded-lg border border-border bg-card p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-foreground">
              {selectedEvent.ticker}
            </span>
            {currentBar && (
              <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
                {formatPrice(currentBar.close)}
              </span>
            )}
            <span
              className={cn(
                "font-mono text-xs font-medium tabular-nums",
                totalMove >= 0 ? "text-green-400" : "text-red-400",
              )}
            >
              {formatPct(totalMove)}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground">
            Bar {revealedCount}/{selectedEvent.bars.length}
          </span>
        </div>

        <MiniCandlestickChart
          bars={visibleBars}
          highlightIndex={
            phase === "resolution" || phase === "result"
              ? selectedEvent.decisionBarIndex
              : undefined
          }
          keyPrices={selectedEvent.keyLevels.map((kl) => kl.price)}
        />

        {/* Key levels legend */}
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedEvent.keyLevels.map((kl, i) => (
            <span
              key={i}
              className="rounded bg-muted/50 px-1.5 py-0.5 text-[9px] text-muted-foreground"
            >
              {kl.label}: {formatPrice(kl.price)}
            </span>
          ))}
        </div>
      </div>

      {/* Controls (replay phase) */}
      {(phase === "replay" || phase === "decision") && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTogglePlay}
            disabled={phase === "decision"}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95 disabled:opacity-40"
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={handleStep}
            disabled={phase === "decision" || revealedCount >= selectedEvent.bars.length}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95 disabled:opacity-40"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleRestart}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <div className="flex-1 px-2">
            <input
              type="range"
              min={1}
              max={selectedEvent.decisionBarIndex}
              step={1}
              value={Math.min(revealedCount, selectedEvent.decisionBarIndex)}
              onChange={(e) => {
                stopPlay();
                const v = Number(e.target.value);
                setRevealedCount(v);
                if (v >= selectedEvent.decisionBarIndex) {
                  setPhase("decision");
                } else {
                  setPhase("replay");
                }
              }}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
            />
          </div>

          {phase === "decision" && (
            <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              Decision time
            </span>
          )}
        </div>
      )}

      {/* Probability curve (if available) */}
      {selectedEvent.probabilityCurve && (
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Market Probability Curve
          </div>
          <ProbabilityCurveChart
            data={selectedEvent.probabilityCurve}
            revealedCount={
              phase === "resolution" || phase === "result"
                ? selectedEvent.probabilityCurve.length
                : Math.round(
                    (revealedCount / selectedEvent.decisionBarIndex) *
                      selectedEvent.probabilityCurve.length,
                  )
            }
          />
        </div>
      )}

      {/* Decision panel */}
      {phase === "decision" && (
        <DecisionPanel event={selectedEvent} onSubmit={handleDecision} />
      )}

      {/* Resolution reveal */}
      {phase === "resolution" && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Resolution
          </div>
          <p className="mb-4 text-[12px] leading-relaxed text-muted-foreground">
            {selectedEvent.description}
          </p>
          <button
            type="button"
            onClick={handleShowResult}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]"
          >
            See My Results
          </button>
        </div>
      )}

      {/* Result panel */}
      {phase === "result" && result && (
        <ResultPanel
          result={result}
          onRestart={handleRestart}
          onSelectNew={handleSelectNew}
        />
      )}
    </div>
  );
}
