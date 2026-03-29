"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { FLASHCARDS, type FlashcardItem } from "@/data/flashcards";
import { CheckCircle, XCircle, Clock, Trophy, ChevronRight, RotateCcw } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface QuizQuestion {
  card: FlashcardItem;
  /** The correct answer text */
  correct: string;
  /** 3 distractor options + 1 correct, shuffled */
  options: string[];
}

type AnswerState = "idle" | "correct" | "wrong";

interface QuizResult {
  score: number;
  total: number;
  xpEarned: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

const QUESTION_COUNT = 5;
const SECONDS_PER_QUESTION = 30;
const XP_PER_CORRECT = 20;

const GRADE_THRESHOLDS: { min: number; grade: string; label: string }[] = [
  { min: 5, grade: "A", label: "Outstanding" },
  { min: 4, grade: "B", label: "Great job" },
  { min: 3, grade: "C", label: "Good effort" },
  { min: 2, grade: "D", label: "Keep practicing" },
  { min: 0, grade: "F", label: "Keep studying" },
];

function getGrade(score: number) {
  return (
    GRADE_THRESHOLDS.find((t) => score >= t.min) ?? GRADE_THRESHOLDS[GRADE_THRESHOLDS.length - 1]
  );
}

// ── Utility ──────────────────────────────────────────────────────────────────

/** Seeded pseudo-random shuffle (Fisher-Yates) using Date.now() as seed. */
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Pick N random cards, optionally filtered by category. */
function pickCards(count: number, category?: string): FlashcardItem[] {
  const pool = category
    ? FLASHCARDS.filter((c) => c.category === category)
    : FLASHCARDS;
  return shuffleArray(pool).slice(0, count);
}

/** Truncate long text for use as an answer option. */
function truncateOption(text: string, maxLen = 90): string {
  const firstLine = text.split("\n")[0];
  return firstLine.length > maxLen ? firstLine.slice(0, maxLen) + "…" : firstLine;
}

/** Build 4 options (1 correct + 3 distractors from other cards). */
function buildOptions(card: FlashcardItem, allCards: FlashcardItem[]): string[] {
  const correct = truncateOption(card.back);
  const distractors = shuffleArray(
    allCards.filter((c) => c.id !== card.id),
  )
    .slice(0, 3)
    .map((c) => truncateOption(c.back));
  return shuffleArray([correct, ...distractors]);
}

/** Build quiz questions from a set of cards. */
function buildQuestions(cards: FlashcardItem[], allCards: FlashcardItem[]): QuizQuestion[] {
  return cards.map((card) => ({
    card,
    correct: truncateOption(card.back),
    options: buildOptions(card, allCards),
  }));
}

// ── Sub-components ───────────────────────────────────────────────────────────

function TimerBar({ seconds, total }: { seconds: number; total: number }) {
  const pct = (seconds / total) * 100;
  const color =
    seconds > total * 0.5
      ? "bg-primary"
      : seconds > total * 0.25
        ? "bg-amber-400"
        : "bg-red-500";

  return (
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <motion.div
        className={`h-full rounded-full transition-colors ${color}`}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.4, ease: "linear" }}
      />
    </div>
  );
}

function ResultScreen({
  result,
  onRestart,
}: {
  result: QuizResult;
  onRestart: () => void;
}) {
  const { grade, label } = getGrade(result.score);

  const gradeColors: Record<string, string> = {
    A: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
    B: "text-primary border-border/40 bg-primary/10",
    C: "text-amber-400 border-amber-400/30 bg-amber-400/10",
    D: "text-orange-400 border-orange-400/30 bg-orange-400/10",
    F: "text-red-400 border-red-400/30 bg-red-400/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 py-8 text-center"
    >
      <Trophy className="h-10 w-10 text-primary" />

      {/* Grade badge */}
      <div
        className={`rounded-md border px-6 py-3 ${gradeColors[grade] ?? ""}`}
      >
        <div className="text-4xl font-bold">{grade}</div>
        <div className="text-sm mt-0.5 font-medium">{label}</div>
      </div>

      {/* Score */}
      <div className="space-y-1">
        <p className="text-2xl font-semibold">
          {result.score} / {result.total}
        </p>
        <p className="text-sm text-muted-foreground">correct answers</p>
      </div>

      {/* XP earned */}
      {result.xpEarned > 0 && (
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          +{result.xpEarned} XP earned
        </div>
      )}

      <button
        type="button"
        onClick={onRestart}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <RotateCcw className="h-4 w-4" />
        Play again
      </button>
    </motion.div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

interface TradingQuizProps {
  onComplete?: (score: number) => void;
  category?: string;
}

export function TradingQuiz({ onComplete, category }: TradingQuizProps) {
  const awardXP = useGameStore((s) => s.awardXP);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [direction, setDirection] = useState(1); // slide direction

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Initialise / restart quiz
  function startQuiz() {
    const cards = pickCards(QUESTION_COUNT, category);
    const qs = buildQuestions(cards, FLASHCARDS);
    setQuestions(qs);
    setCurrentIndex(0);
    setSelected(null);
    setAnswerState("idle");
    setScore(0);
    setTimeLeft(SECONDS_PER_QUESTION);
    setResult(null);
    setDirection(1);
  }

  // Start on mount
  useEffect(() => {
    startQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  // Timer
  useEffect(() => {
    if (result !== null || answerState !== "idle") return;
    clearTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearTimer();
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, answerState, result]);

  function handleTimeout() {
    setAnswerState("wrong");
    setSelected(null);
    scheduleAdvance();
  }

  function handleSelect(option: string) {
    if (answerState !== "idle") return;
    clearTimer();
    setSelected(option);
    const q = questions[currentIndex];
    if (option === q.correct) {
      setAnswerState("correct");
      setScore((s) => s + 1);
    } else {
      setAnswerState("wrong");
    }
    scheduleAdvance();
  }

  function scheduleAdvance() {
    setTimeout(() => {
      advance();
    }, 1200);
  }

  function advance() {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      finishQuiz();
    } else {
      setDirection(1);
      setCurrentIndex(nextIndex);
      setSelected(null);
      setAnswerState("idle");
      setTimeLeft(SECONDS_PER_QUESTION);
    }
  }

  function finishQuiz() {
    const finalScore = score + (answerState === "correct" ? 0 : 0); // score already updated
    const xp = score * XP_PER_CORRECT;
    if (xp > 0) awardXP(xp);
    const res: QuizResult = { score, total: QUESTION_COUNT, xpEarned: xp };
    setResult(res);
    onComplete?.(score);
  }

  // Guard: no questions yet
  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        Loading quiz...
      </div>
    );
  }

  if (result !== null) {
    return <ResultScreen result={result} onRestart={startQuiz} />;
  }

  const question = questions[currentIndex];
  const progressPct = ((currentIndex) / QUESTION_COUNT) * 100;

  return (
    <div className="space-y-4">
      {/* Progress bar + counter */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Question {currentIndex + 1} of {QUESTION_COUNT}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {timeLeft}s
        </span>
      </div>

      {/* Dual progress bars */}
      <div className="space-y-1">
        {/* Overall progress */}
        <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary/40"
            animate={{ width: `${progressPct}%` }}
          />
        </div>
        {/* Timer bar */}
        <TimerBar seconds={timeLeft} total={SECONDS_PER_QUESTION} />
      </div>

      {/* Question card with slide animation */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: direction * 48 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -direction * 48 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="rounded-lg border border-border/40 bg-card p-4 space-y-4"
        >
          {/* Question front */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-primary/70">
              {question.card.category}
            </span>
            <p className="text-sm font-medium leading-relaxed whitespace-pre-line">
              {question.card.front}
            </p>
            {question.card.hint && (
              <p className="text-xs text-muted-foreground italic">
                Hint: {question.card.hint}
              </p>
            )}
          </div>

          {/* Answer options */}
          <div className="space-y-2">
            {question.options.map((opt, i) => {
              const isSelected = selected === opt;
              const isCorrect = opt === question.correct;
              let optionClass =
                "w-full rounded-lg border px-3 py-2.5 text-left text-xs leading-relaxed transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary";

              if (answerState === "idle") {
                optionClass +=
                  " border-border/40 bg-muted/20 hover:border-primary/50 hover:bg-muted/40 cursor-pointer";
              } else if (isCorrect) {
                optionClass += " border-emerald-500/50 bg-emerald-500/10 text-emerald-400 cursor-default";
              } else if (isSelected && !isCorrect) {
                optionClass += " border-red-500/50 bg-red-500/10 text-red-400 cursor-default";
              } else {
                optionClass += " border-border/40 bg-muted/10 text-muted-foreground/50 cursor-default";
              }

              return (
                <button
                  key={i}
                  type="button"
                  className={optionClass}
                  onClick={() => handleSelect(opt)}
                  disabled={answerState !== "idle"}
                >
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 text-xs font-bold text-muted-foreground/50 mt-0.5">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {answerState !== "idle" && isCorrect && (
                      <CheckCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-400" />
                    )}
                    {answerState !== "idle" && isSelected && !isCorrect && (
                      <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-red-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback message */}
          <AnimatePresence>
            {answerState !== "idle" && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium ${
                  answerState === "correct"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                {answerState === "correct" ? (
                  <>
                    <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                    Correct! +{XP_PER_CORRECT} XP
                  </>
                ) : selected === null ? (
                  <>
                    <XCircle className="h-3.5 w-3.5 shrink-0" />
                    Time&apos;s up — the correct answer is highlighted above.
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5 shrink-0" />
                    Not quite — the correct answer is highlighted above.
                  </>
                )}
                <ChevronRight className="h-3.5 w-3.5 ml-auto shrink-0 opacity-50" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Score tracker */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Score:{" "}
          <span className="font-semibold text-foreground">{score}</span> /{" "}
          {currentIndex + (answerState !== "idle" ? 1 : 0)}
        </span>
        <span>
          {score * XP_PER_CORRECT} XP earned so far
        </span>
      </div>
    </div>
  );
}
