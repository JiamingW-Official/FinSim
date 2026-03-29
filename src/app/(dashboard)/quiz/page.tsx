"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Shuffle,
  Timer,
  Trophy,
  Zap,
  Target,
  ChevronRight,
  ChevronLeft,
  ThumbsUp,
  ThumbsDown,
  Flame,
  BarChart2,
  Star,
  CalendarDays,
  Filter,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useQuizStore } from "@/stores/quiz-store";
import { useGameStore } from "@/stores/game-store";
import { UNITS } from "@/data/lessons";
import { FLASHCARDS } from "@/data/flashcards";
import type { QuizMCStep, QuizTFStep, QuizScenarioStep } from "@/data/lessons/types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface QuizQuestion {
  id: string;
  unitId: string;
  unitTitle: string;
  type: "mc" | "tf" | "scenario";
  question: string;
  options?: string[];
  correctIndex?: number;
  correct?: boolean;
  explanation: string;
  difficulty: 1 | 2 | 3;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function dateSeed(dateStr: string): number {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) {
    h = (Math.imul(31, h) + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// ── Extract quiz questions from lessons ───────────────────────────────────────

function extractQuestions(unitIds?: string[]): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  for (const unit of UNITS) {
    if (unitIds && !unitIds.includes(unit.id)) continue;
    for (const lesson of unit.lessons) {
      for (const step of lesson.steps) {
        if (step.type === "quiz-mc") {
          const s = step as QuizMCStep;
          questions.push({
            id: `${lesson.id}-${questions.length}`,
            unitId: unit.id,
            unitTitle: unit.title,
            type: "mc",
            question: s.question,
            options: [...s.options],
            correctIndex: s.correctIndex,
            explanation: s.explanation,
            difficulty: s.difficulty ?? 1,
          });
        } else if (step.type === "quiz-tf") {
          const s = step as QuizTFStep;
          questions.push({
            id: `${lesson.id}-${questions.length}`,
            unitId: unit.id,
            unitTitle: unit.title,
            type: "tf",
            question: s.statement,
            options: ["True", "False"],
            correctIndex: s.correct ? 0 : 1,
            explanation: s.explanation,
            difficulty: s.difficulty ?? 1,
          });
        } else if (step.type === "quiz-scenario") {
          const s = step as QuizScenarioStep;
          questions.push({
            id: `${lesson.id}-${questions.length}`,
            unitId: unit.id,
            unitTitle: unit.title,
            type: "scenario",
            question: `${s.scenario}\n\n${s.question}`,
            options: [...s.options],
            correctIndex: s.correctIndex,
            explanation: s.explanation,
            difficulty: s.difficulty ?? 2,
          });
        }
      }
    }
  }
  return questions;
}

function gradeFromScore(score: number, total: number): { grade: string; color: string; xp: number } {
  const pct = score / total;
  if (pct >= 0.9) return { grade: "S", color: "text-yellow-400", xp: 150 };
  if (pct >= 0.8) return { grade: "A", color: "text-emerald-400", xp: 100 };
  if (pct >= 0.7) return { grade: "B", color: "text-primary", xp: 75 };
  if (pct >= 0.6) return { grade: "C", color: "text-amber-400", xp: 50 };
  return { grade: "D", color: "text-rose-400", xp: 25 };
}

// ── DAY-OF-WEEK CATEGORY mapping for daily challenge ─────────────────────────

const DOW_UNIT_IDS: Record<number, string[]> = {
  0: ["indicators", "advanced-technical-analysis"],   // Sunday  = Technical
  1: ["indicators", "advanced-technical-analysis"],   // Monday  = Technical
  2: ["fundamentals", "personal-finance-fundamentals"], // Tuesday = Fundamental
  3: ["options-strategies-practice", "derivatives-basics"], // Wednesday = Options
  4: ["risk", "portfolio-construction"],              // Thursday = Risk/Portfolio
  5: ["macro-trading", "crypto-trading"],             // Friday  = Macro/Crypto
  6: ["basics", "orders"],                            // Saturday = Basics
};

const DOW_LABELS: Record<number, string> = {
  0: "Technical Analysis",
  1: "Technical Analysis",
  2: "Fundamental Analysis",
  3: "Options",
  4: "Risk & Portfolio",
  5: "Macro & Crypto",
  6: "Basics",
};

// ── NPC leaderboard ───────────────────────────────────────────────────────────

const NPC_LEADERS = [
  { name: "AlphaTrader_99", streak: 47 },
  { name: "QuanthLord",     streak: 35 },
  { name: "BullishBeth",    streak: 29 },
  { name: "DerivDave",      streak: 22 },
  { name: "MomentumMike",   streak: 18 },
  { name: "ValueVera",      streak: 14 },
  { name: "TechTom",        streak: 11 },
];

// ── FLASHCARD CATEGORIES ──────────────────────────────────────────────────────

const CARD_CATEGORIES = [
  { id: "all",          label: "All" },
  { id: "basics",       label: "Basics" },
  { id: "technical",    label: "Technical" },
  { id: "indicators",   label: "Indicators" },
  { id: "options-advanced", label: "Options" },
  { id: "fundamental",  label: "Fundamental" },
  { id: "crypto",       label: "Crypto" },
  { id: "risk",         label: "Risk" },
  { id: "quant",        label: "Quant" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1: QUICK QUIZ
// ═══════════════════════════════════════════════════════════════════════════════

type QuizPhase = "setup" | "active" | "result";

function QuickQuizTab() {
  const recordQuizResult = useQuizStore((s) => s.recordQuizResult);
  const topicStats = useQuizStore((s) => s.topicStats);

  const [phase, setPhase] = useState<QuizPhase>("setup");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const unitOptions = useMemo(
    () => [
      { id: "all", label: "All Topics" },
      ...UNITS.map((u) => ({ id: u.id, label: u.title })),
    ],
    [],
  );

  const allQuestions = useMemo(
    () =>
      topicFilter === "all"
        ? extractQuestions()
        : extractQuestions([topicFilter]),
    [topicFilter],
  );

  function startQuiz() {
    const shuffled = seededShuffle(allQuestions, Date.now());
    setQuestions(shuffled.slice(0, 10));
    setAnswers(new Array(10).fill(null));
    setCurrent(0);
    setSelected(null);
    setRevealed(false);
    setTimeLeft(30);
    setPhase("active");
  }

  // Timer
  useEffect(() => {
    if (phase !== "active" || !timerEnabled || revealed) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // Time's up — auto-advance with no answer
          handleReveal(null);
          return 30;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timerEnabled, revealed, current]);

  function handleReveal(sel: number | null) {
    if (timerRef.current) clearInterval(timerRef.current);
    setSelected(sel);
    setRevealed(true);
    const newAnswers = [...answers];
    newAnswers[current] = sel;
    setAnswers(newAnswers);
  }

  function handleNext() {
    if (current + 1 >= questions.length) {
      finishQuiz();
      return;
    }
    setCurrent((c) => c + 1);
    setSelected(null);
    setRevealed(false);
    setTimeLeft(30);
  }

  function finishQuiz() {
    const score = answers.filter(
      (ans, i) => ans === questions[i]?.correctIndex,
    ).length;
    const { xp } = gradeFromScore(score, questions.length);
    recordQuizResult({
      score,
      totalQuestions: questions.length,
      xpEarned: xp,
      timestamp: Date.now(),
      topicFilter,
    });
    setPhase("result");
  }

  if (phase === "setup") {
    return (
      <div className="flex flex-col items-center gap-3 py-8 max-w-xl mx-auto">
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-md bg-primary/10 mb-3">
            <Brain className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Quick Quiz</h2>
          <p className="text-sm text-muted-foreground mt-1">
            10 questions from your completed lessons
          </p>
        </div>

        <div className="w-full space-y-4">
          {/* Topic filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Topic
            </label>
            <div className="flex flex-wrap gap-2">
              {unitOptions.slice(0, 8).map((u) => (
                <button
                  key={u.id}
                  onClick={() => setTopicFilter(u.id)}
                  className={`px-3 py-1.5 rounded-full text-xs text-muted-foreground font-medium transition-colors ${
                    topicFilter === u.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timer toggle */}
          <div className="flex items-center justify-between rounded-md border border-border/50 bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">30-second timer</span>
            </div>
            <button
              onClick={() => setTimerEnabled((t) => !t)}
              className={`relative h-5 w-9 rounded-full transition-colors ${
                timerEnabled ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  timerEnabled ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {allQuestions.length === 0 && (
            <p className="text-sm text-amber-400 text-center">
              No questions found for this topic yet. Try &quot;All Topics&quot;.
            </p>
          )}

          <Button
            onClick={startQuiz}
            disabled={allQuestions.length === 0}
            className="w-full h-11 text-sm font-semibold"
          >
            Start Quiz
          </Button>
        </div>

        {/* Recent results */}
        {Object.keys(topicStats).length > 0 && (
          <div className="w-full space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Your accuracy by topic
            </p>
            {Object.entries(topicStats)
              .filter(([, v]) => v.total > 0)
              .slice(0, 5)
              .map(([topic, stats]) => {
                const pct = Math.round((stats.correct / stats.total) * 100);
                const unitLabel =
                  unitOptions.find((u) => u.id === topic)?.label ?? topic;
                return (
                  <div key={topic} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-32 truncate">
                      {unitLabel}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium w-10 text-right">
                      {pct}%
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    );
  }

  if (phase === "result") {
    const score = answers.filter(
      (ans, i) => ans === questions[i]?.correctIndex,
    ).length;
    const { grade, color, xp } = gradeFromScore(score, questions.length);
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-3 py-8 max-w-md mx-auto"
      >
        <div className="text-center">
          <div
            className={`text-7xl font-bold mb-1 ${color}`}
          >
            {grade}
          </div>
          <div className="text-2xl font-bold">
            {score} / {questions.length}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {score >= 8 ? "Excellent work!" : score >= 6 ? "Good effort!" : "Keep practicing!"}
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-md bg-primary/10 px-5 py-3">
          <Zap className="h-3.5 w-3.5 text-muted-foreground/50" />
          <span className="text-sm font-semibold text-primary">+{xp} XP earned</span>
        </div>

        {/* Answer review */}
        <div className="w-full space-y-2">
          {questions.map((q, i) => {
            const ans = answers[i];
            const correct = ans === q.correctIndex;
            return (
              <div
                key={q.id}
                className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 text-sm ${
                  correct
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : "border-rose-500/20 bg-rose-500/5"
                }`}
              >
                {correct ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="line-clamp-1 font-medium">
                    {q.question.split("\n")[0]}
                  </p>
                  {!correct && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {q.explanation}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 w-full">
          <Button variant="outline" className="flex-1" onClick={() => setPhase("setup")}>
            <RotateCcw className="h-4 w-4 mr-1.5" />
            New Quiz
          </Button>
          <Button className="flex-1" onClick={startQuiz}>
            <Shuffle className="h-4 w-4 mr-1.5" />
            Retry
          </Button>
        </div>
      </motion.div>
    );
  }

  // Active quiz
  const q = questions[current];
  if (!q) return null;
  const isCorrect = revealed && selected === q.correctIndex;

  return (
    <div className="flex flex-col gap-4 max-w-xl mx-auto py-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-muted-foreground">
          {current + 1} / {questions.length}
        </span>
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((current + (revealed ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
        {timerEnabled && !revealed && (
          <div
            className={`flex items-center gap-1 text-xs text-muted-foreground font-medium tabular-nums ${
              timeLeft <= 10 ? "text-rose-400" : "text-muted-foreground"
            }`}
          >
            <Timer className="h-3.5 w-3.5" />
            {timeLeft}s
          </div>
        )}
      </div>

      {/* Badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
          {q.unitTitle}
        </span>
        <span
          className={`text-xs text-muted-foreground px-2 py-0.5 rounded-full ${
            q.difficulty === 1
              ? "bg-emerald-500/5 text-emerald-400"
              : q.difficulty === 2
              ? "bg-amber-500/10 text-amber-400"
              : "bg-rose-500/10 text-rose-400"
          }`}
        >
          {q.difficulty === 1 ? "Easy" : q.difficulty === 2 ? "Medium" : "Hard"}
        </span>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          className="space-y-4"
        >
          <p className="text-base font-semibold leading-snug whitespace-pre-line">
            {q.question}
          </p>

          {/* Options */}
          <div className="space-y-2">
            {q.options?.map((opt, idx) => {
              let variant = "default";
              if (revealed) {
                if (idx === q.correctIndex) variant = "correct";
                else if (idx === selected && selected !== q.correctIndex) variant = "wrong";
                else variant = "dim";
              } else if (selected === idx) {
                variant = "selected";
              }

              return (
                <button
                  key={idx}
                  disabled={revealed}
                  onClick={() => !revealed && handleReveal(idx)}
                  className={`w-full text-left rounded-md border px-4 py-3 text-sm font-medium transition-all ${
                    variant === "correct"
                      ? "border-emerald-500 bg-emerald-500/5 text-emerald-300"
                      : variant === "wrong"
                      ? "border-rose-500 bg-rose-500/10 text-rose-300"
                      : variant === "selected"
                      ? "border-primary bg-primary/10 text-primary"
                      : variant === "dim"
                      ? "border-border/30 bg-transparent text-muted-foreground/40"
                      : "border-border/50 bg-muted/30 hover:bg-muted/40 hover:border-border"
                  }`}
                >
                  <span className="mr-2 font-mono text-xs text-muted-foreground opacity-60">
                    {["A", "B", "C", "D"][idx]}.
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-md border px-4 py-3 text-sm ${
                isCorrect
                  ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-200"
                  : "border-rose-500/20 bg-rose-500/5 text-rose-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-1 font-medium">
                {isCorrect ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-400" />
                )}
                {isCorrect ? "Correct!" : "Not quite"}
              </div>
              <p className="text-muted-foreground leading-snug">{q.explanation}</p>
            </motion.div>
          )}

          {revealed && (
            <Button onClick={handleNext} className="w-full h-11">
              {current + 1 >= questions.length ? "See Results" : "Next Question"}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2: FLASHCARDS
// ═══════════════════════════════════════════════════════════════════════════════

function FlashcardsTab() {
  const cardSR = useQuizStore((s) => s.cardSR);
  const recordCardReview = useQuizStore((s) => s.recordCardReview);
  const getMasteredCount = useQuizStore((s) => s.getMasteredCount);

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionDone, setSessionDone] = useState<string[]>([]); // card ids done this session

  const now = Date.now();

  const filteredCards = useMemo(() => {
    const base =
      categoryFilter === "all"
        ? FLASHCARDS
        : FLASHCARDS.filter((c) => c.category === categoryFilter);

    // Sort: due first (nextDue <= now), then new (unseen), then by nextDue asc
    return [...base].sort((a, b) => {
      const srA = cardSR[a.id];
      const srB = cardSR[b.id];
      const dueA = srA ? srA.nextDue : 0;
      const dueB = srB ? srB.nextDue : 0;
      // Due or new = priority
      const aDue = !srA || dueA <= now;
      const bDue = !srB || dueB <= now;
      if (aDue && !bDue) return -1;
      if (!aDue && bDue) return 1;
      return dueA - dueB;
    });
  }, [categoryFilter, cardSR, now]);

  const card = filteredCards[cardIndex];
  const masteredCount = getMasteredCount();
  const dueCount = filteredCards.filter(
    (c) => !cardSR[c.id] || cardSR[c.id].nextDue <= now,
  ).length;

  function handleKnow() {
    if (!card) return;
    recordCardReview(card.id, 5);
    setSessionDone((d) => [...d, card.id]);
    setFlipped(false);
    setCardIndex((i) => Math.min(i + 1, filteredCards.length - 1));
  }

  function handleReviewAgain() {
    if (!card) return;
    recordCardReview(card.id, 1);
    setSessionDone((d) => [...d, card.id]);
    setFlipped(false);
    setCardIndex((i) => Math.min(i + 1, filteredCards.length - 1));
  }

  function handlePrev() {
    setFlipped(false);
    setCardIndex((i) => Math.max(0, i - 1));
  }

  function handleNext() {
    setFlipped(false);
    setCardIndex((i) => Math.min(i + 1, filteredCards.length - 1));
  }

  const sr = card ? cardSR[card.id] : undefined;
  const cardMasteryPct = sr
    ? Math.min(100, Math.round((sr.repetitions / 5) * 100))
    : 0;

  return (
    <div className="flex flex-col gap-4 max-w-xl mx-auto py-4">
      {/* Stats row */}
      <div className="flex gap-3">
        <div className="flex-1 rounded-md border border-border/50 bg-muted/20 px-3 py-2 text-center">
          <div className="text-lg font-medium text-primary">{masteredCount}</div>
          <div className="text-xs text-muted-foreground">Mastered</div>
        </div>
        <div className="flex-1 rounded-md border border-border/50 bg-muted/20 px-3 py-2 text-center">
          <div className="text-lg font-medium text-amber-400">{dueCount}</div>
          <div className="text-xs text-muted-foreground">Due Today</div>
        </div>
        <div className="flex-1 rounded-md border border-border/50 bg-muted/20 px-3 py-2 text-center">
          <div className="text-lg font-medium">{FLASHCARDS.length}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 flex-wrap">
        {CARD_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setCategoryFilter(cat.id);
              setCardIndex(0);
              setFlipped(false);
            }}
            className={`px-2.5 py-1 rounded-full text-xs text-muted-foreground font-medium transition-colors ${
              categoryFilter === cat.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/40"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {cardIndex + 1} / {filteredCards.length}
        </span>
        <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: `${filteredCards.length > 0 ? ((cardIndex + 1) / filteredCards.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Card */}
      {card ? (
        <div className="relative" style={{ perspective: 1000 }}>
          <motion.div
            onClick={() => setFlipped((f) => !f)}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.45, type: "spring", stiffness: 300, damping: 30 }}
            style={{ transformStyle: "preserve-3d", cursor: "pointer" }}
            className="relative min-h-[220px]"
          >
            {/* Front */}
            <div
              style={{ backfaceVisibility: "hidden" }}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-md border border-border/60 bg-card px-6 py-8 text-center"
            >
              <span className="mb-3 text-xs font-medium text-muted-foreground">
                {card.category}
              </span>
              <p className="text-lg font-medium leading-snug whitespace-pre-line">{card.front}</p>
              {card.hint && (
                <p className="mt-3 text-xs text-muted-foreground italic">{card.hint}</p>
              )}
              <p className="mt-4 text-xs text-muted-foreground/50">tap to flip</p>
            </div>

            {/* Back */}
            <div
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-md border border-primary/30 bg-primary/5 px-6 py-8 text-center"
            >
              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                {card.back}
              </p>
              {sr && (
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${cardMasteryPct}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {cardMasteryPct}% mastery
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="rounded-md border border-border/40 bg-muted/20 p-12 text-center">
          <p className="text-muted-foreground text-sm">No cards in this category.</p>
        </div>
      )}

      {/* Action buttons */}
      {flipped && card && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3"
        >
          <button
            onClick={handleReviewAgain}
            className="flex-1 flex items-center justify-center gap-2 rounded-md border border-rose-500/30 bg-rose-500/10 py-3 text-sm font-medium text-rose-400 hover:bg-rose-500/20 transition-colors"
          >
            <ThumbsDown className="h-4 w-4" />
            Review Again
          </button>
          <button
            onClick={handleKnow}
            className="flex-1 flex items-center justify-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 py-3 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
          >
            <ThumbsUp className="h-4 w-4" />
            Know It
          </button>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={cardIndex === 0}
          className="flex items-center gap-1 text-xs text-muted-foreground disabled:opacity-30 hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </button>
        <button
          onClick={() => setFlipped((f) => !f)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Flip card
        </button>
        <button
          onClick={handleNext}
          disabled={cardIndex >= filteredCards.length - 1}
          className="flex items-center gap-1 text-xs text-muted-foreground disabled:opacity-30 hover:text-foreground transition-colors"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Session summary */}
      {sessionDone.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Reviewed {sessionDone.length} card{sessionDone.length !== 1 ? "s" : ""} this session
        </p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3: DAILY CHALLENGE
// ═══════════════════════════════════════════════════════════════════════════════

function DailyChallengeTab() {
  const dailyChallengeHistory = useQuizStore((s) => s.dailyChallengeHistory);
  const currentStreak = useQuizStore((s) => s.currentStreak);
  const recordDailyChallenge = useQuizStore((s) => s.recordDailyChallenge);

  const today = getToday();
  const todayRecord = dailyChallengeHistory.find((r) => r.date === today);
  const alreadyDone = Boolean(todayRecord);

  // Build today's question
  const dailyQuestion = useMemo<QuizQuestion | null>(() => {
    const dow = new Date().getDay();
    const unitIds = DOW_UNIT_IDS[dow] ?? ["basics"];
    const pool = extractQuestions(unitIds).filter((q) => q.difficulty >= 2);
    if (pool.length === 0) return null;
    const seed = dateSeed(today);
    const shuffled = seededShuffle(pool, seed);
    return shuffled[0] ?? null;
  }, [today]);

  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (alreadyDone) {
      setRevealed(true);
    }
  }, [alreadyDone]);

  function handleAnswer(idx: number) {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    const correct = idx === dailyQuestion?.correctIndex;
    recordDailyChallenge(today, correct);
  }

  const dow = new Date().getDay();
  const categoryLabel = DOW_LABELS[dow] ?? "General";

  // Build leaderboard with user's streak inserted
  const leaderboard = useMemo(() => {
    const entries = [
      ...NPC_LEADERS,
      { name: "You", streak: currentStreak },
    ].sort((a, b) => b.streak - a.streak);
    return entries;
  }, [currentStreak]);

  return (
    <div className="flex flex-col gap-5 max-w-xl mx-auto py-4">
      {/* Header */}
      <div className="rounded-md border border-border/50 bg-muted/20 px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground/50" />
              <span className="text-sm font-medium">Daily Challenge</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Today: {categoryLabel}
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-1.5">
            <Flame className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">
              {currentStreak}
            </span>
            <span className="text-xs text-muted-foreground">day streak</span>
          </div>
        </div>
        {alreadyDone && (
          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
              todayRecord?.correct
                ? "bg-emerald-500/5 text-emerald-400"
                : "bg-rose-500/10 text-rose-400"
            }`}
          >
            {todayRecord?.correct ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {todayRecord?.correct
              ? `Completed! +${todayRecord.xpEarned} XP earned`
              : "Completed — better luck tomorrow!"}
          </div>
        )}
      </div>

      {/* Question */}
      {dailyQuestion ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400">
              Hard
            </span>
            <span className="text-xs text-muted-foreground">
              {dailyQuestion.unitTitle}
            </span>
            {!alreadyDone && (
              <span className="ml-auto text-xs font-medium text-primary">
                +50 XP if correct
              </span>
            )}
          </div>

          <p className="text-base font-medium leading-snug whitespace-pre-line">
            {dailyQuestion.question}
          </p>

          <div className="space-y-2">
            {dailyQuestion.options?.map((opt, idx) => {
              let cls = "border-border/50 bg-muted/30 hover:bg-muted/40 hover:border-border";
              if (revealed) {
                if (idx === dailyQuestion.correctIndex)
                  cls = "border-emerald-500 bg-emerald-500/5 text-emerald-300";
                else if (idx === selected && selected !== dailyQuestion.correctIndex)
                  cls = "border-rose-500 bg-rose-500/10 text-rose-300";
                else cls = "border-border/30 bg-transparent text-muted-foreground/40";
              }

              return (
                <button
                  key={idx}
                  disabled={revealed}
                  onClick={() => handleAnswer(idx)}
                  className={`w-full text-left rounded-md border px-4 py-3 text-sm font-medium transition-all ${cls}`}
                >
                  <span className="mr-2 font-mono text-xs text-muted-foreground opacity-60">
                    {["A", "B", "C", "D"][idx]}.
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-md border px-4 py-3 text-sm ${
                selected === dailyQuestion.correctIndex
                  ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-200"
                  : "border-rose-500/20 bg-rose-500/5 text-rose-200"
              }`}
            >
              <p className="text-muted-foreground leading-snug">
                {dailyQuestion.explanation}
              </p>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="rounded-md border border-border/40 bg-muted/20 p-8 text-center">
          <p className="text-muted-foreground text-sm">
            No challenge available for today&apos;s topic. Check back after completing some lessons!
          </p>
        </div>
      )}

      {/* Leaderboard */}
      <div className="rounded-md border border-border/50 bg-muted/10 px-4 py-4">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-400" />
          Streak Leaderboard
        </h3>
        <div className="space-y-1.5">
          {leaderboard.map((entry, i) => {
            const isYou = entry.name === "You";
            return (
              <div
                key={entry.name}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                  isYou
                    ? "bg-primary/10 border border-primary/20"
                    : "bg-transparent"
                }`}
              >
                <span
                  className={`w-5 text-xs text-muted-foreground font-medium text-center ${
                    i === 0
                      ? "text-yellow-400"
                      : i === 1
                      ? "text-muted-foreground"
                      : i === 2
                      ? "text-amber-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className={`flex-1 font-medium ${
                    isYou ? "text-primary" : "text-foreground/80"
                  }`}
                >
                  {entry.name}
                </span>
                <div className="flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs text-muted-foreground font-medium tabular-nums">
                    {entry.streak}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4: MY STATS
// ═══════════════════════════════════════════════════════════════════════════════

function MyStatsTab() {
  const quizSessions = useQuizStore((s) => s.quizSessions);
  const topicStats = useQuizStore((s) => s.topicStats);
  const totalQuizXP = useQuizStore((s) => s.totalQuizXP);
  const cardSR = useQuizStore((s) => s.cardSR);
  const currentStreak = useQuizStore((s) => s.currentStreak);

  const now = Date.now();

  const overallCorrect = useMemo(
    () => Object.values(topicStats).reduce((acc, s) => acc + s.correct, 0),
    [topicStats],
  );
  const overallTotal = useMemo(
    () => Object.values(topicStats).reduce((acc, s) => acc + s.total, 0),
    [topicStats],
  );
  const overallAccuracy = overallTotal > 0 ? Math.round((overallCorrect / overallTotal) * 100) : 0;

  const dueCardIds = useMemo(
    () =>
      Object.entries(cardSR)
        .filter(([, sr]) => sr.nextDue <= now)
        .map(([id]) => id),
    [cardSR, now],
  );

  const unitLabelMap = useMemo(() => {
    const m: Record<string, string> = { all: "All Topics" };
    for (const u of UNITS) m[u.id] = u.title;
    return m;
  }, []);

  // Sort topics by accuracy ascending (weakest first)
  const sortedTopics = useMemo(
    () =>
      Object.entries(topicStats)
        .filter(([, v]) => v.total >= 3)
        .sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total),
    [topicStats],
  );

  const weakestTopics = sortedTopics.slice(0, 3);

  // SVG bar chart
  const chartTopics = sortedTopics.slice(0, 8);
  const chartHeight = 120;
  const barWidth = chartTopics.length > 0 ? Math.min(40, Math.floor(320 / chartTopics.length) - 8) : 40;
  const chartWidth = chartTopics.length * (barWidth + 8);

  return (
    <div className="flex flex-col gap-5 max-w-xl mx-auto py-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-md border border-border/50 bg-muted/20 px-4 py-3">
          <div className="text-lg font-medium text-primary">{overallAccuracy}%</div>
          <div className="text-xs text-muted-foreground mt-0.5">Overall Accuracy</div>
        </div>
        <div className="rounded-md border border-border/50 bg-muted/20 px-4 py-3">
          <div className="text-lg font-medium text-amber-400">{totalQuizXP}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Total Quiz XP</div>
        </div>
        <div className="rounded-md border border-border/50 bg-muted/20 px-4 py-3">
          <div className="text-lg font-medium text-emerald-400">{dueCardIds.length}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Cards Due Today</div>
        </div>
        <div className="rounded-md border border-border/50 bg-muted/20 px-4 py-3">
          <div className="text-lg font-medium">{currentStreak}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Daily Streak</div>
        </div>
      </div>

      {/* Accuracy by topic (SVG bar chart) */}
      {chartTopics.length > 0 && (
        <div className="rounded-md border border-border/50 bg-muted/10 px-4 py-4">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <BarChart2 className="h-3.5 w-3.5 text-muted-foreground/50" />
            Accuracy by Topic
          </h3>
          <div className="overflow-x-auto">
            <svg
              width={Math.max(chartWidth, 280)}
              height={chartHeight + 32}
              className="overflow-visible"
            >
              {/* Y-axis gridlines */}
              {[0, 25, 50, 75, 100].map((pct) => (
                <line
                  key={pct}
                  x1={0}
                  y1={chartHeight - (pct / 100) * chartHeight}
                  x2={Math.max(chartWidth, 280)}
                  y2={chartHeight - (pct / 100) * chartHeight}
                  stroke="currentColor"
                  strokeOpacity={0.06}
                  strokeWidth={1}
                />
              ))}
              {/* Bars */}
              {chartTopics.map(([topicId, stats], i) => {
                const pct = stats.total > 0 ? stats.correct / stats.total : 0;
                const barH = pct * chartHeight;
                const x = i * (barWidth + 8);
                const color =
                  pct >= 0.8
                    ? "#10b981"
                    : pct >= 0.6
                    ? "#f59e0b"
                    : "#f43f5e";
                const label = unitLabelMap[topicId] ?? topicId;
                const shortLabel = label.split(" ")[0];
                return (
                  <g key={topicId}>
                    <rect
                      x={x}
                      y={chartHeight - barH}
                      width={barWidth}
                      height={barH}
                      rx={4}
                      fill={color}
                      fillOpacity={0.7}
                    />
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight - barH - 4}
                      textAnchor="middle"
                      fontSize={9}
                      fill="currentColor"
                      fillOpacity={0.7}
                    >
                      {Math.round(pct * 100)}%
                    </text>
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight + 14}
                      textAnchor="middle"
                      fontSize={8}
                      fill="currentColor"
                      fillOpacity={0.5}
                    >
                      {shortLabel}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* Weakest topics */}
      {weakestTopics.length > 0 && (
        <div className="rounded-md border border-rose-500/20 bg-rose-500/5 px-4 py-4">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2 text-rose-400">
            <Target className="h-4 w-4" />
            Needs Work
          </h3>
          <div className="space-y-2.5">
            {weakestTopics.map(([topicId, stats]) => {
              const pct = Math.round((stats.correct / stats.total) * 100);
              const label = unitLabelMap[topicId] ?? topicId;
              return (
                <div key={topicId} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground flex-1">{label}</span>
                  <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-rose-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-rose-400 w-10 text-right">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent quiz sessions */}
      {quizSessions.length > 0 && (
        <div className="rounded-md border border-border/50 bg-muted/10 px-4 py-4">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground/50" />
            Recent Quizzes
          </h3>
          <div className="space-y-2">
            {quizSessions.slice(0, 5).map((session, i) => {
              const { grade, color } = gradeFromScore(session.score, session.totalQuestions);
              const label = unitLabelMap[session.topicFilter] ?? session.topicFilter;
              const dateStr = new Date(session.timestamp).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg bg-muted/20 px-3 py-2"
                >
                  <span className={`text-base font-medium w-6 text-center ${color}`}>
                    {grade}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground font-medium truncate">{label}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.score}/{session.totalQuestions} correct
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-primary">+{session.xpEarned} XP</p>
                    <p className="text-xs text-muted-foreground">{dateStr}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {quizSessions.length === 0 && overallTotal === 0 && (
        <div className="rounded-md border border-border/40 bg-muted/10 p-8 text-center">
          <Brain className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Complete a quiz to see your stats here.
          </p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function QuizPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page header */}
      <div className="shrink-0 border-b border-border/50 border-l-4 border-l-primary px-6 py-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-medium leading-tight">Quiz &amp; Flashcards</h1>
            <p className="text-xs text-muted-foreground">
              Test your knowledge, master concepts, build streaks
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="quiz" className="flex flex-col flex-1 overflow-hidden">
        <div className="shrink-0 border-b border-border/50 px-6">
          <TabsList className="h-10 bg-transparent gap-1 p-0">
            {[
              { value: "quiz",      label: "Quick Quiz",       icon: Target },
              { value: "flashcards", label: "Flashcards",      icon: BookOpen },
              { value: "daily",     label: "Daily Challenge",  icon: CalendarDays },
              { value: "stats",     label: "My Stats",         icon: BarChart2 },
            ].map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="h-9 rounded-none border-b-2 border-transparent px-3 text-xs font-medium data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent bg-transparent"
              >
                <Icon className="h-3.5 w-3.5 mr-1.5" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent
          value="quiz"
          className="flex-1 overflow-y-auto px-6 data-[state=inactive]:hidden"
        >
          <QuickQuizTab />
        </TabsContent>

        <TabsContent
          value="flashcards"
          className="flex-1 overflow-y-auto px-6 data-[state=inactive]:hidden"
        >
          <FlashcardsTab />
        </TabsContent>

        <TabsContent
          value="daily"
          className="flex-1 overflow-y-auto px-6 data-[state=inactive]:hidden"
        >
          <DailyChallengeTab />
        </TabsContent>

        <TabsContent
          value="stats"
          className="flex-1 overflow-y-auto px-6 data-[state=inactive]:hidden"
        >
          <MyStatsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
