"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, RotateCcw, ChevronRight, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OHLC { open: number; high: number; low: number; close: number; }

interface Question {
  id: string;
  label: string;           // The pattern name shown after answer
  options: string[];       // 4 choices
  correctIndex: number;
  explanation: string;
  bars: OHLC[];            // 6–10 bars of OHLC for chart
}

// ─── Question Bank ────────────────────────────────────────────────────────────
// Each scenario is carefully crafted OHLC data + explanation.

const QUESTIONS: Question[] = [
  {
    id: "head-shoulders",
    label: "Head and Shoulders",
    options: ["Head and Shoulders", "Triple Top", "Bull Flag", "Ascending Triangle"],
    correctIndex: 0,
    explanation: "Three peaks where the middle peak (head) is highest, flanked by two lower shoulders. The neckline break signals a bearish reversal.",
    bars: [
      { open: 100, high: 104, low: 99, close: 103 },  // left shoulder up
      { open: 103, high: 108, low: 102, close: 106 }, // head up
      { open: 106, high: 106, low: 100, close: 101 }, // head down
      { open: 101, high: 105, low: 100, close: 104 }, // right shoulder up
      { open: 104, high: 104, low: 98,  close: 99 },  // right shoulder down
      { open: 99,  high: 100, low: 93,  close: 94 },  // neckline break
    ],
  },
  {
    id: "bull-flag",
    label: "Bull Flag",
    options: ["Bear Flag", "Bull Flag", "Falling Wedge", "Cup and Handle"],
    correctIndex: 1,
    explanation: "A sharp rally (pole) followed by a tight, slightly downward consolidation (flag) on low volume. The breakout from the flag resumes the uptrend.",
    bars: [
      { open: 50,  high: 53,  low: 49,  close: 52  }, // start of pole
      { open: 52,  high: 58,  low: 51,  close: 57  }, // pole
      { open: 57,  high: 60,  low: 56,  close: 59  }, // pole top
      { open: 59,  high: 59,  low: 55,  close: 57  }, // flag
      { open: 57,  high: 58,  low: 54,  close: 55  }, // flag lower
      { open: 55,  high: 63,  low: 55,  close: 62  }, // breakout
    ],
  },
  {
    id: "double-top",
    label: "Double Top",
    options: ["Double Bottom", "Double Top", "Head and Shoulders", "Broadening Top"],
    correctIndex: 1,
    explanation: "Two peaks at approximately the same price level separated by a trough. Break below the trough (neckline) confirms a bearish reversal.",
    bars: [
      { open: 80,  high: 90,  low: 79,  close: 89  }, // first peak
      { open: 89,  high: 90,  low: 82,  close: 83  }, // retreat
      { open: 83,  high: 85,  low: 81,  close: 84  }, // consolidation
      { open: 84,  high: 91,  low: 83,  close: 90  }, // second peak
      { open: 90,  high: 90,  low: 82,  close: 83  }, // fail
      { open: 83,  high: 83,  low: 75,  close: 76  }, // breakdown
    ],
  },
  {
    id: "double-bottom",
    label: "Double Bottom",
    options: ["Double Bottom", "Double Top", "Bear Flag", "Wedge"],
    correctIndex: 0,
    explanation: "Two troughs at the same price level. The rally between them shows buying interest. Break above the high between the two troughs is the buy signal.",
    bars: [
      { open: 100, high: 101, low: 88,  close: 89  }, // first bottom
      { open: 89,  high: 97,  low: 88,  close: 95  }, // rally
      { open: 95,  high: 96,  low: 87,  close: 89  }, // second bottom
      { open: 89,  high: 96,  low: 88,  close: 95  }, // bounce
      { open: 95,  high: 99,  low: 94,  close: 98  }, // recovery
      { open: 98,  high: 105, low: 97,  close: 104 }, // breakout
    ],
  },
  {
    id: "ascending-triangle",
    label: "Ascending Triangle",
    options: ["Symmetrical Triangle", "Descending Triangle", "Ascending Triangle", "Rectangle"],
    correctIndex: 2,
    explanation: "Horizontal resistance with rising lows — buyers are increasingly aggressive. The breakout above resistance is typically bullish with a measured move equal to the triangle height.",
    bars: [
      { open: 60,  high: 70,  low: 59,  close: 68  }, // first touch resistance
      { open: 68,  high: 70,  low: 63,  close: 65  }, // pull back (higher low)
      { open: 65,  high: 70,  low: 64,  close: 69  }, // touch resistance again
      { open: 69,  high: 70,  low: 66,  close: 67  }, // pull back (higher low)
      { open: 67,  high: 71,  low: 66,  close: 70  }, // squeeze
      { open: 70,  high: 77,  low: 70,  close: 76  }, // breakout
    ],
  },
  {
    id: "bearish-engulfing",
    label: "Bearish Engulfing",
    options: ["Bullish Engulfing", "Bearish Engulfing", "Evening Star", "Dark Cloud Cover"],
    correctIndex: 1,
    explanation: "A large red candle that fully engulfs the prior green candle's body. Signals a shift in momentum from buyers to sellers, especially after an uptrend.",
    bars: [
      { open: 100, high: 104, low: 99,  close: 103 },
      { open: 103, high: 107, low: 102, close: 106 },
      { open: 106, high: 109, low: 105, close: 108 }, // uptrend
      { open: 110, high: 113, low: 109, close: 112 }, // bullish
      { open: 113, high: 114, low: 106, close: 107 }, // bearish engulfing
      { open: 107, high: 108, low: 100, close: 101 }, // follow-through
    ],
  },
  {
    id: "morning-star",
    label: "Morning Star",
    options: ["Evening Star", "Morning Star", "Three White Soldiers", "Hammer"],
    correctIndex: 1,
    explanation: "Three-candle reversal pattern: large red candle, small-bodied indecision candle (star), then large green candle. Signals the end of a downtrend.",
    bars: [
      { open: 110, high: 111, low: 104, close: 105 }, // downtrend
      { open: 105, high: 106, low: 100, close: 101 }, // large bear candle
      { open: 100, high: 102, low: 99,  close: 101 }, // small doji star
      { open: 101, high: 109, low: 101, close: 108 }, // large bull candle
      { open: 108, high: 113, low: 107, close: 112 }, // confirmation
    ],
  },
  {
    id: "hammer",
    label: "Hammer",
    options: ["Shooting Star", "Hammer", "Doji", "Spinning Top"],
    correctIndex: 1,
    explanation: "A candle with a small body near the top and a long lower wick (at least 2x the body). Appears at the end of a downtrend. Shows buyers regained control after an intraday selloff.",
    bars: [
      { open: 100, high: 101, low: 95,  close: 96  }, // downtrend
      { open: 96,  high: 97,  low: 90,  close: 95  }, // downtrend
      { open: 95,  high: 96,  low: 88,  close: 94  }, // downtrend
      { open: 93,  high: 94,  low: 84,  close: 93  }, // hammer — small body, long lower wick
      { open: 93,  high: 99,  low: 92,  close: 98  }, // confirmation
    ],
  },
  {
    id: "shooting-star",
    label: "Shooting Star",
    options: ["Shooting Star", "Inverted Hammer", "Pin Bar", "Hanging Man"],
    correctIndex: 0,
    explanation: "Small body near the bottom with a long upper wick. Appears after an uptrend. Buyers pushed price high but sellers drove it back — a bearish reversal warning.",
    bars: [
      { open: 80,  high: 85,  low: 79,  close: 84  }, // uptrend
      { open: 84,  high: 89,  low: 83,  close: 88  }, // uptrend
      { open: 88,  high: 97,  low: 87,  close: 89  }, // shooting star
      { open: 89,  high: 90,  low: 83,  close: 84  }, // confirmation
    ],
  },
  {
    id: "cup-handle",
    label: "Cup and Handle",
    options: ["Rounding Bottom", "Cup and Handle", "Inverted Head & Shoulders", "Saucer"],
    correctIndex: 1,
    explanation: "A rounded U-shaped recovery (cup) followed by a brief downward drift (handle) on lower volume. Breakout above the cup rim is a bullish signal with strong measured-move potential.",
    bars: [
      { open: 100, high: 101, low: 90,  close: 91  }, // left edge of cup
      { open: 91,  high: 92,  low: 84,  close: 85  }, // bottom of cup
      { open: 85,  high: 88,  low: 84,  close: 87  }, // rounding up
      { open: 87,  high: 95,  low: 86,  close: 94  }, // right edge of cup
      { open: 94,  high: 95,  low: 89,  close: 90  }, // handle pullback
      { open: 90,  high: 104, low: 90,  close: 103 }, // breakout
    ],
  },
];

// ─── Seeded shuffle ───────────────────────────────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function shuffleWithSeed<T>(arr: T[], seed: number): T[] {
  const rng = seededRandom(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Chart SVG ────────────────────────────────────────────────────────────────

function PatternChart({ bars }: { bars: OHLC[] }) {
  const width  = 220;
  const height = 90;
  const padL   = 4;
  const padR   = 4;
  const padT   = 6;
  const padB   = 6;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  const allH = bars.map((b) => b.high);
  const allL = bars.map((b) => b.low);
  const minP = Math.min(...allL) * 0.995;
  const maxP = Math.max(...allH) * 1.005;
  const range = maxP - minP;

  const bw    = chartW / bars.length;
  const candW = Math.max(bw * 0.55, 4);

  function toY(p: number) { return padT + chartH * (1 - (p - minP) / range); }
  function toX(i: number) { return padL + bw * i + bw / 2; }

  return (
    <svg width={width} height={height} className="w-full max-w-[220px] mx-auto">
      {/* Subtle grid */}
      {[0, 0.5, 1].map((t) => (
        <line
          key={t}
          x1={padL} x2={width - padR}
          y1={padT + chartH * t}
          y2={padT + chartH * t}
          stroke="currentColor" strokeOpacity={0.07} strokeWidth={1}
        />
      ))}

      {bars.map((bar, i) => {
        const x   = toX(i);
        const oy  = toY(bar.open);
        const cy  = toY(bar.close);
        const hy  = toY(bar.high);
        const ly  = toY(bar.low);
        const bull = bar.close >= bar.open;
        const col  = bull ? "#4ade80" : "#f87171";
        const bodyTop = Math.min(oy, cy);
        const bodyH   = Math.max(Math.abs(cy - oy), 1.5);
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={hy} y2={ly} stroke={col} strokeWidth={1.2} />
            <rect x={x - candW / 2} y={bodyTop} width={candW} height={bodyH} fill={col} rx={1} />
          </g>
        );
      })}
    </svg>
  );
}

// ─── Storage ──────────────────────────────────────────────────────────────────

const EXERCISE_STORAGE_KEY = "finsim-exercise-taquiz-v1";

// ─── Timer hook ───────────────────────────────────────────────────────────────

const TIMER_SECONDS = 30;

// ─── Main Component ───────────────────────────────────────────────────────────

interface TechnicalAnalysisQuizProps {
  onComplete?: (score: number, max: number) => void;
}

type Phase = "ready" | "playing" | "feedback" | "results";

export function TechnicalAnalysisQuiz({ onComplete }: TechnicalAnalysisQuizProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timedOutRef = useRef(false);

  const totalScore = scores.reduce((a, b) => a + b, 0);
  const maxScore   = 10; // 10 questions × 1 pt each

  // Build question set on mount
  useEffect(() => {
    const seed = Math.floor(Date.now() / (1000 * 60 * 60)); // changes every hour
    const shuffled = shuffleWithSeed(QUESTIONS, seed).slice(0, 10);
    setQuestions(shuffled);
  }, []);

  // Timer management
  function startTimer() {
    timedOutRef.current = false;
    setTimeLeft(TIMER_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          if (!timedOutRef.current) {
            timedOutRef.current = true;
            handleTimeout();
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(() => {
    return () => stopTimer();
  }, []);

  const handleTimeout = useCallback(() => {
    stopTimer();
    setSelected(-1); // -1 = timeout, no selection
    setScores((prev) => [...prev, 0]);
    setPhase("feedback");
  }, []);

  const handleStart = useCallback(() => {
    setQIndex(0);
    setScores([]);
    setSelected(null);
    setPhase("playing");
    startTimer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = useCallback((optIndex: number) => {
    if (phase !== "playing") return;
    stopTimer();
    setSelected(optIndex);
    const q = questions[qIndex];
    const pts = optIndex === q.correctIndex ? 1 : 0;
    setScores((prev) => [...prev, pts]);
    setPhase("feedback");
  }, [phase, questions, qIndex]);

  const handleNext = useCallback(() => {
    const nextQ = qIndex + 1;
    if (nextQ >= questions.length) {
      // persist completion
      try {
        const prev = JSON.parse(localStorage.getItem(EXERCISE_STORAGE_KEY) ?? "{}");
        const best = Math.max(prev.best ?? 0, totalScore);
        localStorage.setItem(EXERCISE_STORAGE_KEY, JSON.stringify({ best, completedAt: Date.now() }));
      } catch { /* ignore */ }
      setPhase("results");
    } else {
      setQIndex(nextQ);
      setSelected(null);
      timedOutRef.current = false;
      setPhase("playing");
      startTimer();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIndex, questions.length, totalScore]);

  const handleRestart = useCallback(() => {
    stopTimer();
    const seed = Math.floor(Date.now() / 1000);
    const shuffled = shuffleWithSeed(QUESTIONS, seed).slice(0, 10);
    setQuestions(shuffled);
    setQIndex(0);
    setScores([]);
    setSelected(null);
    timedOutRef.current = false;
    setPhase("ready");
  }, []);

  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor = timeLeft > 15 ? "bg-green-400" : timeLeft > 8 ? "bg-amber-400" : "bg-red-400";

  if (questions.length === 0) return null;

  const q = questions[qIndex];
  const gradeLabel = totalScore >= 8 ? "Expert" : totalScore >= 6 ? "Proficient" : totalScore >= 4 ? "Developing" : "Beginner";
  const gradeColor = totalScore >= 8 ? "text-green-400" : totalScore >= 6 ? "text-amber-400" : "text-red-400";

  return (
    <div className="flex flex-col gap-3">
      {/* Ready state */}
      {phase === "ready" && (
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs font-semibold">Chart Pattern Recognition</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              10 questions. 30 seconds each. Identify the pattern from the candlestick chart.
            </p>
          </div>
          <div className="rounded-md border border-border/50 bg-muted/20 px-3 py-2 text-[10px] text-muted-foreground space-y-1">
            <p className="font-medium text-foreground/70">Patterns covered</p>
            <p>Head and Shoulders, Double Top/Bottom, Bull/Bear Flag, Triangles, Hammer, Shooting Star, Engulfing, Morning Star, Cup and Handle</p>
          </div>
          <button
            type="button"
            onClick={handleStart}
            className="flex items-center justify-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-[11px] font-semibold text-background hover:opacity-80 transition-opacity"
          >
            Start Quiz
          </button>
        </div>
      )}

      {/* Playing + Feedback */}
      {(phase === "playing" || phase === "feedback") && (
        <div className="flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground">Q{qIndex + 1}/10</span>
            <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", timerColor)}
                style={{ width: `${timerPct}%`, transition: "width 1s linear" }}
              />
            </div>
            <div className="flex items-center gap-1">
              <Timer className="h-3 w-3 text-muted-foreground" />
              <span className={cn("text-[10px] font-mono tabular-nums", timeLeft <= 8 ? "text-red-400" : "text-muted-foreground")}>
                {timeLeft}s
              </span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">{totalScore} pts</span>
          </div>

          {/* Chart */}
          <div className="rounded-md border border-border/50 bg-muted/10 p-3">
            <PatternChart bars={q.bars} />
          </div>

          <p className="text-[11px] font-medium">What pattern is shown?</p>

          {/* Options */}
          <div className="grid grid-cols-2 gap-2">
            {q.options.map((opt, i) => {
              let variant: "default" | "correct" | "wrong" = "default";
              if (phase === "feedback") {
                if (i === q.correctIndex) variant = "correct";
                else if (i === selected) variant = "wrong";
              }
              return (
                <button
                  key={i}
                  type="button"
                  disabled={phase === "feedback"}
                  onClick={() => handleSelect(i)}
                  className={cn(
                    "flex items-center gap-2 rounded-md border px-3 py-2 text-left text-[10px] font-medium transition-colors",
                    variant === "default" && "border-border/50 bg-muted/10 hover:bg-muted/30 hover:border-border",
                    variant === "correct" && "border-green-500/50 bg-green-500/15 text-green-400",
                    variant === "wrong"   && "border-red-500/50 bg-red-500/15 text-red-400",
                    phase === "feedback" && variant === "default" && "opacity-50",
                  )}
                >
                  {phase === "feedback" && i === q.correctIndex && <Check className="h-3 w-3 shrink-0 text-green-400" />}
                  {phase === "feedback" && i === selected && i !== q.correctIndex && <X className="h-3 w-3 shrink-0 text-red-400" />}
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback explanation */}
          <AnimatePresence>
            {phase === "feedback" && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "rounded-md border px-3 py-2.5 text-[10px]",
                  selected === q.correctIndex
                    ? "border-green-500/30 bg-green-500/10"
                    : "border-amber-500/30 bg-amber-500/10"
                )}
              >
                <p className="font-semibold mb-0.5">
                  {selected === -1 ? "Time is up!" : selected === q.correctIndex ? "Correct!" : `Correct answer: ${q.label}`}
                </p>
                <p className="text-muted-foreground leading-relaxed">{q.explanation}</p>
                <button
                  type="button"
                  onClick={handleNext}
                  className="mt-2 flex items-center gap-1 text-foreground/70 hover:text-foreground transition-colors"
                >
                  <span className="text-[10px] font-medium">
                    {qIndex + 1 >= questions.length ? "See results" : "Next question"}
                  </span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Results */}
      {phase === "results" && (
        <div className="flex flex-col gap-3">
          <div className="text-center">
            <p className="text-xs font-semibold">Quiz Complete</p>
            <p className={cn("text-2xl font-bold tabular-nums", gradeColor)}>{totalScore}/10</p>
            <p className={cn("text-[11px] font-medium", gradeColor)}>{gradeLabel}</p>
          </div>
          {/* Per-question dots */}
          <div className="flex gap-1.5 justify-center flex-wrap">
            {scores.map((s, i) => (
              <div
                key={i}
                className={cn(
                  "h-5 w-5 rounded-full border text-[8px] font-bold flex items-center justify-center",
                  s === 1 ? "bg-green-500/20 border-green-500/50 text-green-400" : "bg-red-500/20 border-red-500/50 text-red-400"
                )}
              >
                {i + 1}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRestart}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border/50 px-3 py-2 text-[10px] font-medium hover:bg-muted/40 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Try Again
            </button>
            {onComplete && (
              <button
                type="button"
                onClick={() => onComplete(totalScore, maxScore)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-[10px] font-medium text-background hover:opacity-80 transition-opacity"
              >
                Done
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
