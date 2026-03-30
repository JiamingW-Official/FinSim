"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, RotateCcw, ChevronRight, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Bar {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  rsi: number; // pre-computed so we can show it
}

type Action = "buy" | "sell" | "wait";

interface IdealPlay {
  action: Action;
  reason: string; // shown on reveal
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  bars: Bar[];
  idealPlays: IdealPlay[]; // one per bar
}

// ─── Seeded PRNG ─────────────────────────────────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ─── Hardcoded Scenarios ──────────────────────────────────────────────────────

const SCENARIOS: Scenario[] = [
  {
    id: "rsi-oversold-bounce",
    name: "RSI Oversold Bounce",
    description: "Price has been falling hard. Watch the RSI for a reversal signal.",
    bars: [
      { open: 100, high: 102, low: 94,  close: 95,  volume: 1800, rsi: 28 },
      { open: 95,  high: 97,  low: 91,  close: 92,  volume: 2100, rsi: 22 },
      { open: 92,  high: 96,  low: 91,  close: 95,  volume: 2400, rsi: 31 }, // buy signal
      { open: 95,  high: 101, low: 94,  close: 100, volume: 1900, rsi: 45 },
      { open: 100, high: 108, low: 99,  close: 107, volume: 1600, rsi: 62 }, // take profit
    ],
    idealPlays: [
      { action: "wait", reason: "RSI at 28 — approaching oversold but no reversal candle yet. Wait for confirmation." },
      { action: "wait", reason: "RSI at 22 — deeply oversold, but the candle is still bearish. No entry yet." },
      { action: "buy",  reason: "RSI at 31 and bouncing — the candle closed higher after testing the low. Classic oversold reversal entry." },
      { action: "wait", reason: "Holding the position. RSI still has room to run. No reason to sell yet." },
      { action: "sell", reason: "RSI at 62 — approaching overbought. Lock in gains near resistance. Good exit." },
    ],
  },
  {
    id: "breakout-flag",
    name: "Bull Flag Breakout",
    description: "Price rallied, then consolidated. Identify when the breakout resumes.",
    bars: [
      { open: 50,  high: 60,  low: 49,  close: 58,  volume: 3200, rsi: 65 },
      { open: 58,  high: 60,  low: 55,  close: 56,  volume: 1200, rsi: 58 }, // flag
      { open: 56,  high: 58,  low: 54,  close: 55,  volume: 900,  rsi: 52 }, // flag
      { open: 55,  high: 63,  low: 55,  close: 62,  volume: 3800, rsi: 68 }, // breakout — buy
      { open: 62,  high: 70,  low: 61,  close: 69,  volume: 2900, rsi: 74 }, // hold/sell
    ],
    idealPlays: [
      { action: "wait", reason: "Strong momentum candle — the breakout just happened. Chasing after a big move is risky. Wait for a pullback." },
      { action: "wait", reason: "Price is consolidating (flag). Volume dropped — that is healthy. Wait for the breakout candle." },
      { action: "wait", reason: "Still in the flag. Do not buy before confirmation — a breakdown is equally possible." },
      { action: "buy",  reason: "Volume surged to 3800 and price cleared the flag high. This is the breakout entry. RSI confirms momentum." },
      { action: "sell", reason: "RSI at 74 — overbought. Price has reached the measured move target. Sell into strength." },
    ],
  },
  {
    id: "failed-breakdown",
    name: "Failed Breakdown / Reversal",
    description: "A support breakdown that traps bears and reverses sharply.",
    bars: [
      { open: 80,  high: 81,  low: 74,  close: 75,  volume: 2000, rsi: 38 },
      { open: 75,  high: 76,  low: 70,  close: 71,  volume: 2800, rsi: 30 }, // breakdown attempt
      { open: 71,  high: 79,  low: 70,  close: 78,  volume: 4100, rsi: 48 }, // reversal — buy
      { open: 78,  high: 85,  low: 77,  close: 84,  volume: 2600, rsi: 60 },
      { open: 84,  high: 88,  low: 82,  close: 83,  volume: 1400, rsi: 63 }, // sell — momentum fading
    ],
    idealPlays: [
      { action: "wait", reason: "Price is breaking a support zone but not confirmed. Do not short yet — wait to see if support holds." },
      { action: "wait", reason: "Breakdown looked real, but the candle has a long lower wick. Possible trap. Stay flat." },
      { action: "buy",  reason: "Massive volume bullish engulfing after the failed breakdown. Bears are trapped — this is the reversal entry." },
      { action: "wait", reason: "Price is trending up. Hold the position. RSI at 60 means room to run." },
      { action: "sell", reason: "Volume dried up, RSI stalling at 63. Price is losing momentum near resistance. Exit here." },
    ],
  },
];

// ─── Scoring ──────────────────────────────────────────────────────────────────

function scoreAction(chosen: Action, ideal: Action): number {
  if (chosen === ideal) return 2;
  if (chosen === "wait" && ideal !== "wait") return 0; // missed opportunity
  return -1; // wrong direction
}

// ─── Chart SVG ───────────────────────────────────────────────────────────────

interface ChartProps {
  bars: Bar[];
  revealedCount: number; // how many bars to draw
  activeIndex: number;
  decisions: (Action | null)[];
}

function MiniChart({ bars, revealedCount, activeIndex, decisions }: ChartProps) {
  const padding = { top: 8, bottom: 24, left: 4, right: 4 };
  const width = 280;
  const height = 110;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const visible = bars.slice(0, revealedCount);
  if (visible.length === 0) return null;

  const allHigh = visible.map((b) => b.high);
  const allLow  = visible.map((b) => b.low);
  const minP = Math.min(...allLow) * 0.998;
  const maxP = Math.max(...allHigh) * 1.002;
  const range = maxP - minP;

  const barW = chartW / bars.length;
  const candleW = Math.max(barW * 0.55, 4);

  function toY(price: number) {
    return padding.top + chartH * (1 - (price - minP) / range);
  }
  function toX(index: number) {
    return padding.left + barW * index + barW / 2;
  }

  return (
    <svg width={width} height={height} className="w-full">
      {/* Grid lines */}
      {[0, 0.5, 1].map((t) => {
        const y = padding.top + chartH * t;
        const price = maxP - range * t;
        return (
          <g key={t}>
            <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="currentColor" strokeOpacity={0.08} strokeWidth={1} />
            <text x={padding.left + 2} y={y - 2} fontSize={7} fill="currentColor" opacity={0.35} fontFamily="monospace">
              {price.toFixed(0)}
            </text>
          </g>
        );
      })}

      {/* Candles */}
      {visible.map((bar, i) => {
        const x   = toX(i);
        const oy  = toY(bar.open);
        const cy  = toY(bar.close);
        const hy  = toY(bar.high);
        const ly  = toY(bar.low);
        const bull = bar.close >= bar.open;
        const color = bull ? "#4ade80" : "#f87171";
        const bodyTop = Math.min(oy, cy);
        const bodyH   = Math.max(Math.abs(cy - oy), 1);
        const isActive = i === activeIndex;
        const decision = decisions[i];

        return (
          <g key={i}>
            {/* Highlight active bar */}
            {isActive && (
              <rect
                x={x - barW / 2}
                y={padding.top}
                width={barW}
                height={chartH}
                fill="white"
                fillOpacity={0.04}
                rx={2}
              />
            )}
            {/* Wick */}
            <line x1={x} x2={x} y1={hy} y2={ly} stroke={color} strokeWidth={1} />
            {/* Body */}
            <rect
              x={x - candleW / 2}
              y={bodyTop}
              width={candleW}
              height={bodyH}
              fill={color}
              rx={1}
            />
            {/* Decision indicator */}
            {decision && (
              <g>
                <circle cx={x} cy={ly - 6} r={5} fill={
                  decision === "buy" ? "#4ade80" : decision === "sell" ? "#f87171" : "#94a3b8"
                } opacity={0.9} />
                <text x={x} y={ly - 3} textAnchor="middle" fontSize={6} fill="white" fontWeight="bold">
                  {decision === "buy" ? "B" : decision === "sell" ? "S" : "W"}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* RSI label at bottom */}
      {visible.length > 0 && (
        <text x={width / 2} y={height - 4} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.4} fontFamily="monospace">
          RSI: {visible[visible.length - 1].rsi}
        </text>
      )}
    </svg>
  );
}

// ─── RSI Mini-gauge ───────────────────────────────────────────────────────────

function RSIGauge({ value }: { value: number }) {
  const pct = value / 100;
  const color = value <= 30 ? "#4ade80" : value >= 70 ? "#f87171" : "#94a3b8";
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-mono text-muted-foreground">RSI</span>
      <div className="relative h-1.5 w-20 rounded-full bg-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all"
          style={{ width: `${pct * 100}%`, backgroundColor: color }}
        />
        {/* Oversold / overbought markers */}
        <div className="absolute inset-y-0 left-[30%] w-px bg-green-400 opacity-50" />
        <div className="absolute inset-y-0 left-[70%] w-px bg-red-400 opacity-50" />
      </div>
      <span className="text-[9px] font-mono" style={{ color }}>{value}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface SimulatedTradeProps {
  onComplete?: (score: number, max: number) => void;
}

type Phase = "intro" | "trading" | "results";

const EXERCISE_STORAGE_KEY = "finsim-exercise-simtrade-v1";

export function SimulatedTrade({ onComplete }: SimulatedTradeProps) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [barIndex, setBarIndex] = useState(0);
  const [decisions, setDecisions] = useState<(Action | null)[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAction, setLastAction] = useState<Action | null>(null);

  const scenario = SCENARIOS[scenarioIndex];
  const currentBar = scenario.bars[barIndex];
  const idealPlay  = scenario.idealPlays[barIndex];
  const totalBars  = scenario.bars.length;

  const totalScore = scores.reduce((a, b) => a + b, 0);
  const maxScore   = totalBars * 2;

  // Persist completion
  useEffect(() => {
    if (phase === "results") {
      try {
        const prev = JSON.parse(localStorage.getItem(EXERCISE_STORAGE_KEY) ?? "{}");
        const best = Math.max(prev[scenario.id] ?? 0, totalScore);
        localStorage.setItem(EXERCISE_STORAGE_KEY, JSON.stringify({ ...prev, [scenario.id]: best }));
      } catch { /* ignore */ }
    }
  }, [phase, scenario.id, totalScore]);

  const handleAction = useCallback((action: Action) => {
    if (showFeedback) return;
    setLastAction(action);
    setShowFeedback(true);
    const s = scoreAction(action, idealPlay.action);
    setDecisions((d) => {
      const next = [...d];
      next[barIndex] = action;
      return next;
    });
    setScores((sc) => {
      const next = [...sc];
      next[barIndex] = s;
      return next;
    });
  }, [showFeedback, idealPlay, barIndex]);

  const handleNext = useCallback(() => {
    setShowFeedback(false);
    setLastAction(null);
    if (barIndex + 1 >= totalBars) {
      setPhase("results");
    } else {
      setBarIndex((i) => i + 1);
    }
  }, [barIndex, totalBars]);

  const handleRestart = useCallback((nextScenario?: number) => {
    const idx = nextScenario ?? 0;
    setScenarioIndex(idx);
    setBarIndex(0);
    setDecisions([]);
    setScores([]);
    setShowFeedback(false);
    setLastAction(null);
    setPhase("intro");
  }, []);

  const handleStart = useCallback(() => {
    setPhase("trading");
  }, []);

  // Score color
  function scoreColor(s: number) {
    if (s === 2) return "text-green-400";
    if (s === 0) return "text-amber-400";
    return "text-red-400";
  }

  function scoreLabel(s: number) {
    if (s === 2) return "Correct";
    if (s === 0) return "Missed";
    return "Wrong";
  }

  const gradeLabel = totalScore >= maxScore * 0.8 ? "Excellent" : totalScore >= maxScore * 0.5 ? "Good" : "Needs Work";
  const gradeColor = totalScore >= maxScore * 0.8 ? "text-green-400" : totalScore >= maxScore * 0.5 ? "text-amber-400" : "text-red-400";

  return (
    <div className="flex flex-col gap-3">
      {/* Intro phase */}
      {phase === "intro" && (
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs font-semibold">{scenario.name}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{scenario.description}</p>
          </div>
          <div className="rounded-md border border-border/50 bg-muted/20 px-3 py-2 text-[10px] text-muted-foreground space-y-1">
            <p className="font-medium text-foreground/70">How it works</p>
            <p>At each bar you decide: Buy, Sell, or Wait. After your choice the ideal action is revealed with an explanation.</p>
            <p>Scoring: Correct = +2 pts, Missed = 0 pts, Wrong = -1 pt.</p>
          </div>
          {/* Scenario selector */}
          <div className="flex gap-2 flex-wrap">
            {SCENARIOS.map((sc, i) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => setScenarioIndex(i)}
                className={cn(
                  "rounded px-2 py-1 text-[10px] border transition-colors",
                  scenarioIndex === i
                    ? "border-foreground/30 bg-muted text-foreground"
                    : "border-border/50 text-muted-foreground hover:border-border"
                )}
              >
                {sc.name}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleStart}
            className="flex items-center justify-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-[11px] font-semibold text-background transition-opacity hover:opacity-80"
          >
            Start Exercise
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Trading phase */}
      {phase === "trading" && (
        <div className="flex flex-col gap-3">
          {/* Progress */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground font-mono">Bar {barIndex + 1}/{totalBars}</span>
            <div className="flex-1 h-1 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground/40 transition-all"
                style={{ width: `${((barIndex) / totalBars) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">Score: {totalScore}</span>
          </div>

          {/* Chart */}
          <div className="rounded-md border border-border/50 bg-muted/10 p-2">
            <MiniChart
              bars={scenario.bars}
              revealedCount={showFeedback ? barIndex + 1 : barIndex + 1}
              activeIndex={barIndex}
              decisions={decisions}
            />
            <div className="mt-1.5 flex items-center justify-between px-1">
              <RSIGauge value={currentBar.rsi} />
              <span className="text-[9px] font-mono text-muted-foreground">
                O:{currentBar.open} H:{currentBar.high} L:{currentBar.low} C:{currentBar.close}
              </span>
            </div>
          </div>

          {/* Decision buttons */}
          {!showFeedback && (
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleAction("buy")}
                className="flex flex-col items-center gap-1 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2.5 text-green-400 transition-colors hover:bg-green-500/20"
              >
                <TrendingUp className="h-4 w-4" />
                <span className="text-[10px] font-semibold">Buy</span>
              </button>
              <button
                type="button"
                onClick={() => handleAction("wait")}
                className="flex flex-col items-center gap-1 rounded-md border border-border/50 bg-muted/20 px-3 py-2.5 text-muted-foreground transition-colors hover:bg-muted/40"
              >
                <Minus className="h-4 w-4" />
                <span className="text-[10px] font-semibold">Wait</span>
              </button>
              <button
                type="button"
                onClick={() => handleAction("sell")}
                className="flex flex-col items-center gap-1 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-red-400 transition-colors hover:bg-red-500/20"
              >
                <TrendingDown className="h-4 w-4" />
                <span className="text-[10px] font-semibold">Sell</span>
              </button>
            </div>
          )}

          {/* Feedback */}
          <AnimatePresence>
            {showFeedback && lastAction && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "rounded-md border px-3 py-2.5 text-[11px]",
                  lastAction === idealPlay.action
                    ? "border-green-500/30 bg-green-500/10"
                    : lastAction === "wait"
                    ? "border-amber-500/30 bg-amber-500/10"
                    : "border-red-500/30 bg-red-500/10"
                )}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {lastAction === idealPlay.action ? (
                    <Check className="h-3.5 w-3.5 text-green-400 shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-red-400 shrink-0" />
                  )}
                  <span className="font-semibold">
                    {lastAction === idealPlay.action
                      ? "Correct"
                      : lastAction === "wait"
                      ? "Missed opportunity"
                      : `Ideal: ${idealPlay.action}`}
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{idealPlay.reason}</p>
                <button
                  type="button"
                  onClick={handleNext}
                  className="mt-2 flex items-center gap-1 text-foreground/70 hover:text-foreground transition-colors"
                >
                  <span className="text-[10px] font-medium">
                    {barIndex + 1 >= totalBars ? "See results" : "Next bar"}
                  </span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Results phase */}
      {phase === "results" && (
        <div className="flex flex-col gap-3">
          <div className="text-center">
            <p className="text-sm font-semibold">{gradeLabel}</p>
            <p className={cn("text-lg font-bold tabular-nums", gradeColor)}>
              {totalScore} / {maxScore}
            </p>
          </div>
          {/* Per-bar breakdown */}
          <div className="space-y-1.5">
            {scenario.idealPlays.map((play, i) => (
              <div key={i} className="flex items-start gap-2 text-[10px]">
                <span className="font-mono text-muted-foreground shrink-0 w-10">Bar {i + 1}</span>
                <span className={cn("font-semibold shrink-0 w-14", scoreColor(scores[i] ?? -1))}>
                  {scoreLabel(scores[i] ?? -1)}
                </span>
                <span className="text-muted-foreground leading-relaxed">{play.reason}</span>
              </div>
            ))}
          </div>
          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleRestart(scenarioIndex)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border/50 px-3 py-2 text-[10px] font-medium transition-colors hover:bg-muted/40"
            >
              <RotateCcw className="h-3 w-3" />
              Retry
            </button>
            <button
              type="button"
              onClick={() => handleRestart((scenarioIndex + 1) % SCENARIOS.length)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-[10px] font-medium text-background transition-opacity hover:opacity-80"
            >
              Next Scenario
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          {onComplete && (
            <button
              type="button"
              onClick={() => onComplete(totalScore, maxScore)}
              className="text-[10px] text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Done
            </button>
          )}
        </div>
      )}
    </div>
  );
}
