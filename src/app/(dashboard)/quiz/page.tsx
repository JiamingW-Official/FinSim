"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
  Flame,
  BarChart2,
  CalendarDays,
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
  0: ["indicators", "advanced-technical-analysis"],
  1: ["indicators", "advanced-technical-analysis"],
  2: ["fundamentals", "personal-finance-fundamentals"],
  3: ["options-strategies-practice", "derivatives-basics"],
  4: ["risk", "portfolio-construction"],
  5: ["macro-trading", "crypto-trading"],
  6: ["basics", "orders"],
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
  { name: "QuanthLord", streak: 35 },
  { name: "BullishBeth", streak: 29 },
  { name: "DerivDave", streak: 22 },
  { name: "MomentumMike", streak: 18 },
  { name: "ValueVera", streak: 14 },
  { name: "TechTom", streak: 11 },
];

// ── FLASHCARD CATEGORIES ──────────────────────────────────────────────────────

const CARD_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "basics", label: "Basics" },
  { id: "technical", label: "Technical" },
  { id: "indicators", label: "Indicators" },
  { id: "options-advanced", label: "Options" },
  { id: "fundamental", label: "Fundamental" },
  { id: "crypto", label: "Crypto" },
  { id: "risk", label: "Risk" },
  { id: "quant", label: "Quant" },
];

// ── Option button helper ──────────────────────────────────────────────────────

function optionCls(variant: string): string {
  const base = "w-full text-left rounded-lg border px-4 py-3 text-sm transition-all flex items-start gap-3";
  if (variant === "correct") return `${base} border-emerald-500/50 bg-emerald-500/[0.04]`;
  if (variant === "wrong")   return `${base} border-rose-500/30 bg-rose-500/[0.03] opacity-70`;
  if (variant === "selected") return `${base} border-foreground/30 bg-foreground/[0.03]`;
  if (variant === "dim")     return `${base} border-transparent opacity-25 pointer-events-none`;
  return `${base} border-border/50 hover:border-foreground/20 hover:bg-foreground/[0.02] cursor-pointer`;
}

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
    () => topicFilter === "all" ? extractQuestions() : extractQuestions([topicFilter]),
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

  useEffect(() => {
    if (phase !== "active" || !timerEnabled || revealed) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleReveal(null);
          return 30;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
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
    const score = answers.filter((ans, i) => ans === questions[i]?.correctIndex).length;
    const { xp } = gradeFromScore(score, questions.length);
    recordQuizResult({ score, totalQuestions: questions.length, xpEarned: xp, timestamp: Date.now(), topicFilter });
    setPhase("result");
  }

  // ── Setup ──
  if (phase === "setup") {
    return (
      <div className="max-w-lg mx-auto py-10 flex flex-col gap-8">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Quick Quiz</h2>
          <p className="text-sm text-muted-foreground mt-1">10 questions · shuffled · instant feedback</p>
        </div>

        <div className="flex flex-col gap-5">
          {/* Topic */}
          <div>
            <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-widest mb-3">Topic</p>
            <div className="flex flex-wrap gap-1.5">
              {unitOptions.slice(0, 8).map((u) => (
                <button
                  key={u.id}
                  onClick={() => setTopicFilter(u.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all border ${
                    topicFilter === u.id
                      ? "border-foreground/30 bg-foreground/[0.06] text-foreground"
                      : "border-border/40 text-muted-foreground/50 hover:text-muted-foreground hover:border-border/70"
                  }`}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center justify-between py-3 border-t border-b border-border/40">
            <div className="flex items-center gap-2.5">
              <Timer className="h-3.5 w-3.5 text-muted-foreground/40" />
              <span className="text-sm text-muted-foreground/80">30-second timer</span>
            </div>
            <button
              onClick={() => setTimerEnabled((t) => !t)}
              className={`relative h-5 w-9 rounded-full transition-colors ${timerEnabled ? "bg-foreground/80" : "bg-border"}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform ${timerEnabled ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
          </div>

          {allQuestions.length === 0 && (
            <p className="text-xs text-amber-400/80">No questions found for this topic. Try &quot;All Topics&quot;.</p>
          )}

          <Button onClick={startQuiz} disabled={allQuestions.length === 0} className="w-full">
            Start Quiz
          </Button>
        </div>

        {/* Topic accuracy */}
        {Object.keys(topicStats).length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground/40 uppercase tracking-widest mb-3">Your accuracy</p>
            <div className="flex flex-col gap-2.5">
              {Object.entries(topicStats)
                .filter(([, v]) => v.total > 0)
                .slice(0, 5)
                .map(([topic, stats]) => {
                  const pct = Math.round((stats.correct / stats.total) * 100);
                  const unitLabel = unitOptions.find((u) => u.id === topic)?.label ?? topic;
                  return (
                    <div key={topic} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground/50 w-32 truncate">{unitLabel}</span>
                      <div className="flex-1 h-px rounded-full bg-border/50 overflow-hidden">
                        <div className="h-full rounded-full bg-foreground/30 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground/40 font-mono w-9 text-right">{pct}%</span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Result ──
  if (phase === "result") {
    const score = answers.filter((ans, i) => ans === questions[i]?.correctIndex).length;
    const { grade, color, xp } = gradeFromScore(score, questions.length);
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto py-10 flex flex-col gap-8"
      >
        <div className="flex items-end gap-5">
          <span className={`text-7xl font-bold leading-none ${color}`}>{grade}</span>
          <div className="pb-2">
            <p className="text-2xl font-semibold">{score}<span className="text-muted-foreground/40 font-normal"> / {questions.length}</span></p>
            <p className="text-xs text-muted-foreground/50 mt-0.5">
              {score >= 8 ? "Excellent work!" : score >= 6 ? "Good effort!" : "Keep practicing!"}
            </p>
          </div>
          <div className="ml-auto pb-2 flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-muted-foreground/30" />
            <span className="text-sm font-medium text-muted-foreground/70">+{xp} pts</span>
          </div>
        </div>

        {/* Answer review */}
        <div className="divide-y divide-border/30">
          {questions.map((q, i) => {
            const ans = answers[i];
            const correct = ans === q.correctIndex;
            return (
              <div key={q.id} className="flex items-start gap-3 py-3">
                {correct
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-400/80 shrink-0 mt-0.5" />
                  : <XCircle className="h-4 w-4 text-rose-400/70 shrink-0 mt-0.5" />
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground/80 line-clamp-1">{q.question.split("\n")[0]}</p>
                  {!correct && (
                    <p className="text-xs text-muted-foreground/50 mt-0.5 line-clamp-2">{q.explanation}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setPhase("setup")}>
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> New Quiz
          </Button>
          <Button className="flex-1" onClick={startQuiz}>
            <Shuffle className="h-3.5 w-3.5 mr-1.5" /> Retry
          </Button>
        </div>
      </motion.div>
    );
  }

  // ── Active quiz ──
  const q = questions[current];
  if (!q) return null;
  const isCorrect = revealed && selected === q.correctIndex;

  return (
    <div className="max-w-lg mx-auto py-8 flex flex-col gap-6">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-muted-foreground/40 tabular-nums w-12">{current + 1} / {questions.length}</span>
        <div className="flex-1 h-px bg-border/40 overflow-hidden rounded-full">
          <div
            className="h-full bg-foreground/40 transition-all duration-500 rounded-full"
            style={{ width: `${((current + (revealed ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
        {timerEnabled && !revealed && (
          <span className={`text-xs font-mono tabular-nums w-8 text-right ${timeLeft <= 10 ? "text-rose-400" : "text-muted-foreground/40"}`}>
            {timeLeft}s
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-wider">{q.unitTitle}</span>
        <span className="text-[10px] font-mono text-muted-foreground/25">·</span>
        <span className={`text-[10px] font-mono uppercase tracking-wider ${q.difficulty === 1 ? "text-emerald-400/50" : q.difficulty === 2 ? "text-amber-400/50" : "text-rose-400/50"}`}>
          {q.difficulty === 1 ? "Easy" : q.difficulty === 2 ? "Medium" : "Hard"}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          className="flex flex-col gap-5"
        >
          {/* Question */}
          <p className="text-base font-medium leading-relaxed whitespace-pre-line">{q.question}</p>

          {/* Options */}
          <div className="flex flex-col gap-2">
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
                  className={optionCls(variant)}
                >
                  <span className="text-[11px] font-mono text-muted-foreground/30 shrink-0 mt-0.5 w-4">
                    {["A", "B", "C", "D"][idx]}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {revealed && idx === q.correctIndex && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400/70 shrink-0 mt-0.5" />
                  )}
                  {revealed && idx === selected && selected !== q.correctIndex && (
                    <XCircle className="h-4 w-4 text-rose-400/60 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border-l-2 pl-4 py-0.5 ${isCorrect ? "border-l-emerald-500/50" : "border-l-rose-500/40"}`}
            >
              <p className="text-xs font-medium text-muted-foreground/50 mb-1">
                {isCorrect ? "Correct" : "Not quite"}
              </p>
              <p className="text-sm text-muted-foreground/70 leading-relaxed">{q.explanation}</p>
            </motion.div>
          )}

          {revealed && (
            <Button onClick={handleNext} variant="outline" className="w-full">
              {current + 1 >= questions.length ? "See Results" : "Next"}
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
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
  const [sessionDone, setSessionDone] = useState<string[]>([]);

  const now = Date.now();

  const filteredCards = useMemo(() => {
    const base = categoryFilter === "all" ? FLASHCARDS : FLASHCARDS.filter((c) => c.category === categoryFilter);
    return [...base].sort((a, b) => {
      const srA = cardSR[a.id];
      const srB = cardSR[b.id];
      const dueA = srA ? srA.nextDue : 0;
      const dueB = srB ? srB.nextDue : 0;
      const aDue = !srA || dueA <= now;
      const bDue = !srB || dueB <= now;
      if (aDue && !bDue) return -1;
      if (!aDue && bDue) return 1;
      return dueA - dueB;
    });
  }, [categoryFilter, cardSR, now]);

  const card = filteredCards[cardIndex];
  const masteredCount = getMasteredCount();
  const dueCount = filteredCards.filter((c) => !cardSR[c.id] || cardSR[c.id].nextDue <= now).length;

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

  function handlePrev() { setFlipped(false); setCardIndex((i) => Math.max(0, i - 1)); }
  function handleNext() { setFlipped(false); setCardIndex((i) => Math.min(i + 1, filteredCards.length - 1)); }

  const sr = card ? cardSR[card.id] : undefined;
  const cardMasteryPct = sr ? Math.min(100, Math.round((sr.repetitions / 5) * 100)) : 0;

  return (
    <div className="max-w-lg mx-auto py-8 flex flex-col gap-6">
      {/* Stats row */}
      <div className="flex gap-px border border-border/40 rounded-lg overflow-hidden">
        {[
          { label: "Mastered", value: masteredCount, cls: "text-foreground/70" },
          { label: "Due Today", value: dueCount, cls: "text-amber-400/80" },
          { label: "Total", value: FLASHCARDS.length, cls: "text-muted-foreground/50" },
        ].map(({ label, value, cls }) => (
          <div key={label} className="flex-1 flex flex-col items-center py-3 gap-0.5 bg-muted/10">
            <span className={`text-lg font-semibold tabular-nums ${cls}`}>{value}</span>
            <span className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-wider">{label}</span>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-1 flex-wrap">
        {CARD_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setCategoryFilter(cat.id); setCardIndex(0); setFlipped(false); }}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all border ${
              categoryFilter === cat.id
                ? "border-foreground/30 bg-foreground/[0.06] text-foreground"
                : "border-border/30 text-muted-foreground/40 hover:text-muted-foreground/70 hover:border-border/60"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-muted-foreground/35 tabular-nums">{cardIndex + 1} / {filteredCards.length}</span>
        <div className="flex-1 h-px bg-border/40 overflow-hidden rounded-full">
          <div
            className="h-full bg-foreground/30 transition-all rounded-full"
            style={{ width: `${filteredCards.length > 0 ? ((cardIndex + 1) / filteredCards.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Card */}
      {card ? (
        <div className="relative" style={{ perspective: 1000 }}>
          <motion.div
            onClick={() => setFlipped((f) => !f)}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 30 }}
            style={{ transformStyle: "preserve-3d", cursor: "pointer" }}
            className="relative min-h-[200px]"
          >
            {/* Front */}
            <div
              style={{ backfaceVisibility: "hidden" }}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card px-8 py-8 text-center"
            >
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/30 mb-4">{card.category}</span>
              <p className="text-lg font-medium leading-snug">{card.front}</p>
              {card.hint && <p className="mt-3 text-xs text-muted-foreground/40 italic">{card.hint}</p>}
              <p className="mt-6 text-[10px] text-muted-foreground/25 font-mono uppercase tracking-widest">tap to reveal</p>
            </div>

            {/* Back */}
            <div
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-foreground/10 bg-foreground/[0.02] px-8 py-8 text-center"
            >
              <p className="text-sm leading-relaxed text-foreground/85">{card.back}</p>
              {sr && (
                <div className="mt-5 flex items-center gap-2">
                  <div className="h-px w-20 bg-border/50 overflow-hidden rounded-full">
                    <div className="h-full bg-foreground/30 rounded-full" style={{ width: `${cardMasteryPct}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground/30">{cardMasteryPct}%</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground/50 text-center py-10">No cards in this category.</p>
      )}

      {/* Action buttons */}
      {flipped && card && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
          <button
            onClick={handleReviewAgain}
            className="flex-1 py-3 text-sm rounded-lg border border-border/40 text-muted-foreground/60 hover:text-foreground/70 hover:border-border/70 transition-all"
          >
            Review Again
          </button>
          <button
            onClick={handleKnow}
            className="flex-1 py-3 text-sm rounded-lg border border-foreground/20 font-medium text-foreground/80 hover:bg-foreground/[0.03] hover:border-foreground/30 transition-all"
          >
            Know It
          </button>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={handlePrev} disabled={cardIndex === 0} className="flex items-center gap-1 text-xs text-muted-foreground/40 disabled:opacity-20 hover:text-muted-foreground/70 transition-colors">
          <ChevronLeft className="h-3.5 w-3.5" /> Prev
        </button>
        <button onClick={() => setFlipped((f) => !f)} className="text-xs text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors font-mono">
          flip
        </button>
        <button onClick={handleNext} disabled={cardIndex >= filteredCards.length - 1} className="flex items-center gap-1 text-xs text-muted-foreground/40 disabled:opacity-20 hover:text-muted-foreground/70 transition-colors">
          Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {sessionDone.length > 0 && (
        <p className="text-center text-xs text-muted-foreground/30 font-mono">
          {sessionDone.length} reviewed this session
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
    if (alreadyDone) setRevealed(true);
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

  const leaderboard = useMemo(() => {
    return [
      ...NPC_LEADERS,
      { name: "You", streak: currentStreak },
    ].sort((a, b) => b.streak - a.streak);
  }, [currentStreak]);

  return (
    <div className="max-w-lg mx-auto py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/30 mb-1">Daily Challenge</p>
          <h2 className="text-base font-semibold">{categoryLabel}</h2>
          <p className="text-xs text-muted-foreground/40 mt-0.5">{today}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Flame className="h-3.5 w-3.5 text-amber-400/70" />
          <span className="text-sm font-semibold text-amber-400/80">{currentStreak}</span>
          <span className="text-xs text-muted-foreground/40">day streak</span>
        </div>
      </div>

      {alreadyDone && (
        <div className={`flex items-center gap-2 text-sm border-l-2 pl-3 py-0.5 ${todayRecord?.correct ? "border-l-emerald-500/50 text-emerald-400/70" : "border-l-rose-500/40 text-rose-400/60"}`}>
          {todayRecord?.correct
            ? <><CheckCircle2 className="h-4 w-4 shrink-0" /> Completed · +{todayRecord.xpEarned} pts earned</>
            : <><XCircle className="h-4 w-4 shrink-0" /> Completed — better luck tomorrow</>
          }
        </div>
      )}

      {/* Question */}
      {dailyQuestion ? (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400/50">Hard</span>
            <span className="text-[10px] font-mono text-muted-foreground/30">·</span>
            <span className="text-[10px] font-mono text-muted-foreground/30">{dailyQuestion.unitTitle}</span>
            {!alreadyDone && (
              <span className="ml-auto text-xs text-primary/60 font-mono">+50 pts if correct</span>
            )}
          </div>

          <p className="text-base font-medium leading-relaxed whitespace-pre-line">{dailyQuestion.question}</p>

          <div className="flex flex-col gap-2">
            {dailyQuestion.options?.map((opt, idx) => {
              let variant = "default";
              if (revealed) {
                if (idx === dailyQuestion.correctIndex) variant = "correct";
                else if (idx === selected && selected !== dailyQuestion.correctIndex) variant = "wrong";
                else variant = "dim";
              }
              return (
                <button
                  key={idx}
                  disabled={revealed}
                  onClick={() => handleAnswer(idx)}
                  className={optionCls(variant)}
                >
                  <span className="text-[11px] font-mono text-muted-foreground/30 shrink-0 mt-0.5 w-4">
                    {["A", "B", "C", "D"][idx]}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {revealed && idx === dailyQuestion.correctIndex && <CheckCircle2 className="h-4 w-4 text-emerald-400/70 shrink-0 mt-0.5" />}
                  {revealed && idx === selected && selected !== dailyQuestion.correctIndex && <XCircle className="h-4 w-4 text-rose-400/60 shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>

          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border-l-2 pl-4 py-0.5 ${selected === dailyQuestion.correctIndex ? "border-l-emerald-500/50" : "border-l-rose-500/40"}`}
            >
              <p className="text-sm text-muted-foreground/65 leading-relaxed">{dailyQuestion.explanation}</p>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="border border-border/40 rounded-lg p-8 text-center">
          <p className="text-sm text-muted-foreground/50">No challenge available today. Complete some lessons first!</p>
        </div>
      )}

      {/* Leaderboard */}
      <div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/30 mb-4">Streak Leaderboard</p>
        <div className="flex flex-col gap-0">
          {leaderboard.map((entry, i) => {
            const isYou = entry.name === "You";
            return (
              <div key={entry.name} className={`flex items-center gap-4 py-2.5 border-b border-border/30 last:border-0 ${isYou ? "text-foreground" : ""}`}>
                <span className={`text-xs font-mono w-5 text-right tabular-nums ${i === 0 ? "text-yellow-400/70" : "text-muted-foreground/25"}`}>{i + 1}</span>
                <span className={`flex-1 text-sm ${isYou ? "font-semibold" : "text-muted-foreground/70"}`}>{entry.name}</span>
                <div className="flex items-center gap-1.5">
                  <Flame className="h-3 w-3 text-amber-400/50" />
                  <span className="text-xs font-mono tabular-nums text-muted-foreground/50">{entry.streak}</span>
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

  const overallCorrect = useMemo(() => Object.values(topicStats).reduce((acc, s) => acc + s.correct, 0), [topicStats]);
  const overallTotal = useMemo(() => Object.values(topicStats).reduce((acc, s) => acc + s.total, 0), [topicStats]);
  const overallAccuracy = overallTotal > 0 ? Math.round((overallCorrect / overallTotal) * 100) : 0;

  const dueCardIds = useMemo(
    () => Object.entries(cardSR).filter(([, sr]) => sr.nextDue <= now).map(([id]) => id),
    [cardSR, now],
  );

  const unitLabelMap = useMemo(() => {
    const m: Record<string, string> = { all: "All Topics" };
    for (const u of UNITS) m[u.id] = u.title;
    return m;
  }, []);

  const sortedTopics = useMemo(
    () => Object.entries(topicStats).filter(([, v]) => v.total >= 3).sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total),
    [topicStats],
  );
  const weakestTopics = sortedTopics.slice(0, 3);
  const chartTopics = sortedTopics.slice(0, 8);
  const chartHeight = 100;
  const barWidth = chartTopics.length > 0 ? Math.min(36, Math.floor(300 / chartTopics.length) - 6) : 36;
  const chartWidth = chartTopics.length * (barWidth + 6);

  return (
    <div className="max-w-lg mx-auto py-8 flex flex-col gap-8">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-px border border-border/40 rounded-lg overflow-hidden">
        {[
          { label: "Accuracy", value: `${overallAccuracy}%`, cls: "text-foreground/70" },
          { label: "Quiz Pts", value: totalQuizXP, cls: "text-muted-foreground/60" },
          { label: "Cards Due", value: dueCardIds.length, cls: "text-muted-foreground/60" },
          { label: "Streak", value: currentStreak, cls: "text-amber-400/70" },
        ].map(({ label, value, cls }) => (
          <div key={label} className="flex flex-col items-center py-4 gap-0.5 bg-muted/10">
            <span className={`text-xl font-semibold tabular-nums ${cls}`}>{value}</span>
            <span className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-wider">{label}</span>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      {chartTopics.length > 0 && (
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/30 mb-4">Accuracy by Topic</p>
          <div className="overflow-x-auto">
            <svg width={Math.max(chartWidth, 260)} height={chartHeight + 28} className="overflow-visible">
              {[0, 50, 100].map((pct) => (
                <line key={pct} x1={0} y1={chartHeight - (pct / 100) * chartHeight} x2={Math.max(chartWidth, 260)} y2={chartHeight - (pct / 100) * chartHeight} stroke="currentColor" strokeOpacity={0.06} strokeWidth={1} />
              ))}
              {chartTopics.map(([topicId, stats], i) => {
                const pct = stats.total > 0 ? stats.correct / stats.total : 0;
                const barH = pct * chartHeight;
                const x = i * (barWidth + 6);
                const color = pct >= 0.8 ? "#10b981" : pct >= 0.6 ? "#f59e0b" : "#f43f5e";
                const label = unitLabelMap[topicId] ?? topicId;
                return (
                  <g key={topicId}>
                    <rect x={x} y={chartHeight - barH} width={barWidth} height={barH} rx={3} fill={color} fillOpacity={0.5} />
                    <text x={x + barWidth / 2} y={chartHeight - barH - 4} textAnchor="middle" fontSize={8} fill="currentColor" fillOpacity={0.5}>{Math.round(pct * 100)}%</text>
                    <text x={x + barWidth / 2} y={chartHeight + 14} textAnchor="middle" fontSize={7} fill="currentColor" fillOpacity={0.35}>{label.split(" ")[0]}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* Weakest topics */}
      {weakestTopics.length > 0 && (
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/30 mb-3">Needs Work</p>
          <div className="flex flex-col gap-2.5">
            {weakestTopics.map(([topicId, stats]) => {
              const pct = Math.round((stats.correct / stats.total) * 100);
              const label = unitLabelMap[topicId] ?? topicId;
              return (
                <div key={topicId} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground/50 flex-1">{label}</span>
                  <div className="w-24 h-px bg-border/50 overflow-hidden rounded-full">
                    <div className="h-full bg-rose-400/40 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground/40 w-9 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent quizzes */}
      {quizSessions.length > 0 && (
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/30 mb-3">Recent Quizzes</p>
          <div className="divide-y divide-border/30">
            {quizSessions.slice(0, 5).map((session, i) => {
              const { grade, color } = gradeFromScore(session.score, session.totalQuestions);
              const label = unitLabelMap[session.topicFilter] ?? session.topicFilter;
              const dateStr = new Date(session.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
              return (
                <div key={i} className="flex items-center gap-4 py-2.5">
                  <span className={`text-base font-bold w-5 text-center ${color}`}>{grade}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground/70 font-medium truncate">{label}</p>
                    <p className="text-xs text-muted-foreground/35">{session.score}/{session.totalQuestions} correct</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-muted-foreground/50">+{session.xpEarned}</p>
                    <p className="text-xs text-muted-foreground/30 font-mono">{dateStr}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {quizSessions.length === 0 && overallTotal === 0 && (
        <div className="border border-border/30 rounded-xl p-10 text-center">
          <Brain className="h-7 w-7 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground/40">Complete a quiz to see your stats here.</p>
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
      {/* Header */}
      <div className="shrink-0 border-b border-border px-6 py-5">
        <h1 className="text-base font-semibold tracking-tight">Quiz &amp; Flashcards</h1>
        <p className="text-xs text-muted-foreground/50 mt-0.5">Test knowledge · Master concepts · Build streaks</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="quiz" className="flex flex-col flex-1 overflow-hidden">
        <div className="shrink-0 border-b border-border/50 px-6">
          <TabsList className="h-10 bg-transparent gap-0 p-0">
            {[
              { value: "quiz", label: "Quick Quiz" },
              { value: "flashcards", label: "Flashcards" },
              { value: "daily", label: "Daily" },
              { value: "stats", label: "Stats" },
            ].map(({ value, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="h-9 rounded-none border-b-2 border-transparent px-4 text-xs text-muted-foreground/50 font-medium data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent bg-transparent"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="quiz" className="flex-1 overflow-y-auto px-6 data-[state=inactive]:hidden">
          <QuickQuizTab />
        </TabsContent>
        <TabsContent value="flashcards" className="flex-1 overflow-y-auto px-6 data-[state=inactive]:hidden">
          <FlashcardsTab />
        </TabsContent>
        <TabsContent value="daily" className="flex-1 overflow-y-auto px-6 data-[state=inactive]:hidden">
          <DailyChallengeTab />
        </TabsContent>
        <TabsContent value="stats" className="flex-1 overflow-y-auto px-6 data-[state=inactive]:hidden">
          <MyStatsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
