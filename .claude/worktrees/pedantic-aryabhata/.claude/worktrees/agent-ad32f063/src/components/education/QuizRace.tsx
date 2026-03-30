"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FLASHCARDS, CATEGORY_LABELS, type FlashcardItem } from "@/data/flashcards";
import { cn } from "@/lib/utils";
import { Timer, Trophy, RotateCcw, Zap, ChevronRight } from "lucide-react";

type Phase = "ready" | "racing" | "results";
type Difficulty = "easy" | "medium" | "hard" | "mixed";
type AnswerState = "correct" | "wrong" | null;

const OPTION_MAX_CHARS = 100;

function truncateOption(text: string): string {
  if (text.length <= OPTION_MAX_CHARS) return text;
  return text.slice(0, OPTION_MAX_CHARS) + "…";
}

// Speed bonus: +5 pts if answered within 2 seconds
const SPEED_BONUS_MS = 2000;
const BASE_CORRECT_PTS = 10;
const SPEED_BONUS_PTS = 5;

const DIFFICULTY_CATEGORIES: Record<Difficulty, string[] | null> = {
  easy: ["basics", "orders"],
  medium: ["indicators", "risk", "fundamental"],
  hard: ["quant", "predictions", "personal-finance"],
  mixed: null, // all categories
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  mixed: "Mixed",
};

interface QuestionWithOptions {
  card: FlashcardItem;
  options: string[]; // 4 options: options[correctIndex] is the real answer
  correctIndex: number;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function buildQuestions(difficulty: Difficulty, seed: number): QuestionWithOptions[] {
  const rng = seededRandom(seed);

  const pool = difficulty === "mixed"
    ? [...FLASHCARDS]
    : FLASHCARDS.filter((c) => {
        const cats = DIFFICULTY_CATEGORIES[difficulty];
        return cats ? cats.includes(c.category) : true;
      });

  if (pool.length < 4) return [];

  // Shuffle pool
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const selected = pool.slice(0, Math.min(10, pool.length));

  return selected.map((card) => {
    // Pick 3 wrong answers from the remaining pool
    const wrongPool = FLASHCARDS.filter((c) => c.id !== card.id);
    for (let i = wrongPool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [wrongPool[i], wrongPool[j]] = [wrongPool[j], wrongPool[i]];
    }
    const wrongs = wrongPool.slice(0, 3).map((c) => c.back);

    const options = [...wrongs, card.back];
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    const correctIndex = options.indexOf(card.back);
    return { card, options, correctIndex };
  });
}

function gradeResult(correct: number, totalMs: number): { grade: string; color: string } {
  const seconds = totalMs / 1000;
  if (correct === 10 && seconds < 30) return { grade: "S", color: "text-yellow-400" };
  if (correct >= 9 && seconds < 60) return { grade: "A", color: "text-green-400" };
  if (correct >= 8 && seconds < 90) return { grade: "B", color: "text-blue-400" };
  if (correct >= 6) return { grade: "C", color: "text-orange-400" };
  if (correct >= 4) return { grade: "D", color: "text-red-400" };
  return { grade: "F", color: "text-red-600" };
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const ds = Math.floor((ms % 1000) / 100);
  return `${s}.${ds}s`;
}

export function QuizRace() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [difficulty, setDifficulty] = useState<Difficulty>("mixed");
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<AnswerState[]>(new Array(10).fill(null));
  const [selectedOptions, setSelectedOptions] = useState<(number | null)[]>(new Array(10).fill(null));
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [timePerQ, setTimePerQ] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [flashState, setFlashState] = useState<"correct" | "wrong" | null>(null);
  const [locked, setLocked] = useState(false);
  const [speedBonuses, setSpeedBonuses] = useState<boolean[]>([]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const qStartRef = useRef<number>(0);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const startRace = useCallback(() => {
    const seed = Date.now();
    const qs = buildQuestions(difficulty, seed);
    if (qs.length === 0) return;

    const now = Date.now();
    setQuestions(qs);
    setCurrentQ(0);
    setAnswers(new Array(qs.length).fill(null));
    setSelectedOptions(new Array(qs.length).fill(null));
    setTimePerQ([]);
    setSpeedBonuses([]);
    setStartTime(now);
    setEndTime(null);
    setElapsed(0);
    setFlashState(null);
    setLocked(false);
    qStartRef.current = now;

    intervalRef.current = setInterval(() => {
      setElapsed(Date.now() - now);
    }, 100);

    setPhase("racing");
  }, [difficulty]);

  const advance = useCallback(
    (qIdx: number, isCorrect: boolean, qMs: number) => {
      setAnswers((prev) => {
        const next = [...prev];
        next[qIdx] = isCorrect ? "correct" : "wrong";
        return next;
      });
      setTimePerQ((prev) => [...prev, qMs]);
      setSpeedBonuses((prev) => [...prev, isCorrect && qMs <= SPEED_BONUS_MS]);

      const nextQ = qIdx + 1;
      if (nextQ >= questions.length) {
        stopTimer();
        const now = Date.now();
        setEndTime(now);
        setElapsed(now - startTime);
        setPhase("results");
      } else {
        setCurrentQ(nextQ);
        qStartRef.current = Date.now();
        setFlashState(null);
        setLocked(false);
      }
    },
    [questions.length, startTime, stopTimer],
  );

  const handleAnswer = useCallback(
    (optionIndex: number) => {
      if (locked || phase !== "racing") return;
      setLocked(true);

      const qMs = Date.now() - qStartRef.current;
      const isCorrect = optionIndex === questions[currentQ].correctIndex;

      setSelectedOptions((prev) => {
        const next = [...prev];
        next[currentQ] = optionIndex;
        return next;
      });

      setFlashState(isCorrect ? "correct" : "wrong");

      const delay = isCorrect ? 300 : 800;
      setTimeout(() => advance(currentQ, isCorrect, qMs), delay);
    },
    [locked, phase, currentQ, questions, advance],
  );

  // Keyboard 1-4
  useEffect(() => {
    if (phase !== "racing") return;
    const handler = (e: KeyboardEvent) => {
      const idx = ["1", "2", "3", "4"].indexOf(e.key);
      if (idx !== -1) handleAnswer(idx);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, handleAnswer]);

  const correctCount = answers.filter((a) => a === "correct").length;

  // ─── READY PHASE ───────────────────────────────────────────────
  if (phase === "ready") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] gap-8 py-10">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-primary mb-1">
            <Zap className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Speed Quiz
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Quiz Race</h2>
          <p className="text-sm text-muted-foreground max-w-xs text-center">
            Answer 10 questions as fast as possible. Earn XP for speed and accuracy.
          </p>
        </div>

        <div className="space-y-2 w-full max-w-xs">
          <p className="text-xs font-medium text-muted-foreground text-center uppercase tracking-wider">
            Difficulty
          </p>
          <div className="grid grid-cols-4 gap-2">
            {(["easy", "medium", "hard", "mixed"] as Difficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={cn(
                  "rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                  difficulty === d
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-border/60 hover:text-foreground",
                )}
              >
                {DIFFICULTY_LABELS[d]}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={startRace}
          className="inline-flex items-center gap-2 rounded-lg border border-primary bg-primary/10 px-6 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
        >
          <Zap className="h-4 w-4" />
          Start Race
        </button>

        <div className="grid grid-cols-3 gap-4 text-center text-xs text-muted-foreground max-w-xs">
          <div className="space-y-0.5">
            <p className="font-mono text-base font-semibold text-foreground">10</p>
            <p>Questions</p>
          </div>
          <div className="space-y-0.5">
            <p className="font-mono text-base font-semibold text-foreground">4</p>
            <p>Choices</p>
          </div>
          <div className="space-y-0.5">
            <p className="font-mono text-base font-semibold text-foreground">100</p>
            <p>Max XP</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── RESULTS PHASE ──────────────────────────────────────────────
  if (phase === "results") {
    const totalMs = endTime !== null ? endTime - startTime : elapsed;
    const { grade, color } = gradeResult(correctCount, totalMs);
    const speedBonusCount = speedBonuses.filter(Boolean).length;
    const xp = correctCount * BASE_CORRECT_PTS + speedBonusCount * SPEED_BONUS_PTS;
    const q = questions;

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 py-4"
      >
        {/* Summary */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className={cn("text-5xl font-bold", color)}>{grade}</p>
              <p className="text-xs text-muted-foreground mt-1">Grade</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <p className="text-3xl font-bold tabular-nums">{correctCount}/{q.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Correct</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <p className="font-mono text-2xl font-bold tabular-nums">{formatTime(totalMs)}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Time</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-primary tabular-nums">+{xp}</p>
              <p className="text-xs text-muted-foreground mt-1">XP Earned</p>
              {speedBonusCount > 0 && (
                <p className="text-[10px] text-amber-400 mt-0.5">
                  +{speedBonusCount} speed bonus{speedBonusCount !== 1 ? "es" : ""}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Per-question breakdown */}
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="border-b border-border/50 bg-muted/30 px-4 py-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Question Breakdown
            </p>
          </div>
          <div className="divide-y divide-border/50">
            {q.map((item, i) => {
              const ans = answers[i];
              const chosen = selectedOptions[i];
              const ms = timePerQ[i] ?? 0;
              const catLabel = CATEGORY_LABELS[item.card.category]?.label ?? item.card.category;

              return (
                <div key={item.card.id} className="px-4 py-3 grid grid-cols-[24px_1fr_auto] gap-3 items-start">
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                      ans === "correct"
                        ? "bg-green-500/15 text-green-500"
                        : "bg-red-500/15 text-red-500",
                    )}
                  >
                    {i + 1}
                  </span>
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-medium leading-snug line-clamp-2">
                      {item.card.front.split("\n")[0]}
                    </p>
                    {ans === "wrong" && chosen !== null && (
                      <p className="text-[10px] text-red-400 line-clamp-1">
                        Your answer: {item.options[chosen].slice(0, 60)}
                        {item.options[chosen].length > 60 ? "..." : ""}
                      </p>
                    )}
                    <p
                      className={cn(
                        "text-[10px] line-clamp-1",
                        ans === "correct" ? "text-green-400" : "text-muted-foreground",
                      )}
                    >
                      {ans === "wrong" ? "Correct: " : ""}
                      {item.options[item.correctIndex].slice(0, 70)}
                      {item.options[item.correctIndex].length > 70 ? "..." : ""}
                    </p>
                    <span className="inline-block rounded-full bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
                      {catLabel}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                    {formatTime(ms)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={startRace}
            className="inline-flex items-center gap-2 rounded-lg border border-primary bg-primary/10 px-5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Play Again
          </button>
          <button
            type="button"
            onClick={() => setPhase("ready")}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Change Difficulty
          </button>
        </div>
      </motion.div>
    );
  }

  // ─── RACING PHASE ────────────────────────────────────────────────
  const current = questions[currentQ];
  if (!current) return null;

  const OPTION_KEYS = ["1", "2", "3", "4"];

  return (
    <div className="space-y-5 py-4">
      {/* Header: progress + timer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-muted-foreground">
            Q {currentQ + 1}/{questions.length}
          </span>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 w-5 rounded-full transition-colors",
                  i < currentQ
                    ? answers[i] === "correct"
                      ? "bg-green-500"
                      : "bg-red-500"
                    : i === currentQ
                    ? "bg-primary"
                    : "bg-muted",
                )}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono font-semibold tabular-nums">
          <Timer className="h-3.5 w-3.5 text-muted-foreground" />
          {formatTime(elapsed)}
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`q-${currentQ}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.18 }}
          className={cn(
            "rounded-lg border bg-card p-5 transition-colors",
            flashState === "correct" && "border-green-500/50 bg-green-500/5",
            flashState === "wrong" && "border-red-500/50 bg-red-500/5",
          )}
        >
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {CATEGORY_LABELS[current.card.category]?.label ?? current.card.category}
            </span>
          </div>
          <p className="text-base font-semibold leading-snug whitespace-pre-line">
            {current.card.front}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Answer options */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`opts-${currentQ}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="grid grid-cols-1 gap-2"
        >
          {current.options.map((opt, i) => {
            const chosen = selectedOptions[currentQ];
            const isChosen = chosen === i;
            const isCorrect = i === current.correctIndex;
            const showResult = locked;
            const displayText = truncateOption(opt);
            const isTruncated = opt.length > OPTION_MAX_CHARS;

            let variant = "";
            if (showResult && isChosen && isCorrect) variant = "correct-chosen";
            else if (showResult && isChosen && !isCorrect) variant = "wrong-chosen";
            else if (showResult && isCorrect) variant = "correct-unchosen";

            return (
              <button
                key={i}
                type="button"
                disabled={locked}
                onClick={() => handleAnswer(i)}
                title={isTruncated ? opt : undefined}
                className={cn(
                  "flex items-start gap-3 rounded-lg border bg-card px-4 py-3 text-left text-sm transition-colors",
                  !locked && "hover:border-border/60 hover:bg-accent/20 cursor-pointer",
                  locked && "cursor-default",
                  variant === "correct-chosen" && "border-green-500/60 bg-green-500/10 text-green-400",
                  variant === "wrong-chosen" && "border-red-500/60 bg-red-500/10 text-red-400",
                  variant === "correct-unchosen" && "border-green-500/30 bg-green-500/5 text-green-500/80",
                )}
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-[10px] font-bold text-muted-foreground">
                  {OPTION_KEYS[i]}
                </span>
                <span className="flex-1 leading-snug">{displayText}</span>
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <p className="text-center text-[10px] text-muted-foreground">
        Press 1 / 2 / 3 / 4 to answer with keyboard
      </p>
    </div>
  );
}
