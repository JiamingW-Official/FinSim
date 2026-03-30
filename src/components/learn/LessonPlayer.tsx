"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLearnStore } from "@/stores/learn-store";
import type { Lesson, LessonStep } from "@/data/lessons/types";
import { calculateGrade } from "@/types/game";
import type { LessonScoreBreakdown } from "@/types/game";
import { HeartsDisplay } from "./HeartsDisplay";
import { StepTransition } from "./StepTransition";
import { TeachStepComponent } from "./TeachStep";
import { QuizStepComponent } from "./QuizStep";
import { PracticeStepComponent } from "./PracticeStep";
import { LessonComplete } from "./LessonComplete";

interface LessonPlayerProps { lesson: Lesson; }
interface QuizResult { correct: boolean; timeMs: number; difficulty: number; }

const STEP_LABELS: Record<string, string> = {
  "teach": "Learn",
  "quiz-mc": "Quiz",
  "quiz-tf": "True / False",
  "quiz-scenario": "Scenario",
  "practice": "Practice",
};

export function LessonPlayer({ lesson }: LessonPlayerProps) {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [currentCombo, setCurrentCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [practiceProfit, setPracticeProfit] = useState(0);
  const [finalBreakdown, setFinalBreakdown] = useState<LessonScoreBreakdown | null>(null);

  const loseHeart = useLearnStore((s) => s.loseHeart);
  const completeLesson = useLearnStore((s) => s.completeLesson);

  const steps = lesson.steps;
  const step = steps[currentStepIndex];

  const advance = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((i) => i + 1);
    } else {
      const accuracy = totalQuizzes > 0 ? Math.round((correctCount / totalQuizzes) * 100) : 100;
      let quizPts = 0, quizMax = 0;
      for (const r of quizResults) {
        quizMax += r.difficulty * 10;
        if (r.correct) quizPts += r.difficulty * 10;
      }
      const speedBns = quizResults.reduce((sum, r) => {
        if (!r.correct) return sum;
        return sum + Math.max(0, Math.round((5000 - r.timeMs) / 100));
      }, 0);
      const comboBns = bestCombo >= 3 ? (bestCombo - 2) * 10 : 0;
      const practiceBns = practiceProfit > 0 ? 30 : 0;
      const totalPts = quizPts + speedBns + comboBns + practiceBns;
      const maxPts = Math.max(quizMax + 50 + 30 + 30, 1);
      const breakdown: LessonScoreBreakdown = {
        quizPoints: quizPts, quizMaxPoints: quizMax, speedBonus: speedBns,
        comboBonus: comboBns, practiceBonus: practiceBns,
        totalPoints: totalPts, maxPoints: maxPts,
        grade: calculateGrade(totalPts / maxPts), accuracy, bestCombo,
      };
      setFinalBreakdown(breakdown);
      completeLesson(lesson.id, breakdown, lesson.xpReward);
      setShowComplete(true);
    }
  }, [currentStepIndex, steps.length, totalQuizzes, correctCount, completeLesson, lesson, quizResults, bestCombo, practiceProfit]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !showComplete && step?.type === "teach") advance();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  const handleQuizCorrect = useCallback((timeMs: number, difficulty: number) => {
    setCorrectCount((c) => c + 1);
    setTotalQuizzes((t) => t + 1);
    setQuizResults((r) => [...r, { correct: true, timeMs, difficulty }]);
    setCurrentCombo((c) => { const next = c + 1; setBestCombo((b) => Math.max(b, next)); return next; });
    advance();
  }, [advance]);

  const handleQuizWrong = useCallback((timeMs: number, difficulty: number) => {
    setTotalQuizzes((t) => t + 1);
    setQuizResults((r) => [...r, { correct: false, timeMs, difficulty }]);
    setCurrentCombo(0);
    loseHeart();
    advance();
  }, [advance, loseHeart]);

  const handleClose = () => router.push("/learn");

  const stepLabel = STEP_LABELS[step?.type ?? "teach"] ?? "Learn";

  const renderStep = (s: LessonStep) => {
    switch (s.type) {
      case "teach": return <TeachStepComponent step={s} onContinue={advance} />;
      case "quiz-mc": case "quiz-tf": case "quiz-scenario":
        return <QuizStepComponent step={s} onCorrect={handleQuizCorrect} onWrong={handleQuizWrong} />;
      case "practice": return <PracticeStepComponent step={s} onContinue={advance} />;
      default: return null;
    }
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* ── Top chrome ── */}
      <div className="shrink-0 px-4 pt-3 pb-0 border-b border-border/50">
        {/* Row 1: close | progress | combo | hearts */}
        <div className="flex items-center gap-3 mb-2.5">
          <button type="button" onClick={handleClose}
            className="shrink-0 text-muted-foreground/40 hover:text-foreground transition-colors p-0.5"
            title="Back to lessons">
            <X className="h-4 w-4" />
          </button>

          {/* Segmented progress bar */}
          <div className="flex-1 flex gap-0.5 h-1.5 min-w-0">
            {steps.map((s, i) => {
              const color = s.type === "teach" ? "bg-emerald-500" : s.type === "practice" ? "bg-amber-400" : "bg-blue-400";
              return (
                <div key={i} className="flex-1 rounded-full overflow-hidden bg-border/40">
                  <motion.div
                    className={cn("h-full rounded-full", color)}
                    initial={{ width: "0%" }}
                    animate={{ width: i < currentStepIndex ? "100%" : i === currentStepIndex ? "55%" : "0%" }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
              );
            })}
          </div>

          {/* Combo badge */}
          {currentCombo >= 2 && (
            <motion.div
              key={currentCombo}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 12 }}
              className="shrink-0 flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/25 px-2 py-0.5"
            >
              <span className="text-[10px] font-bold text-amber-400 font-mono">×{currentCombo}</span>
            </motion.div>
          )}

          <HeartsDisplay />
        </div>

        {/* Row 2: lesson title + step count */}
        <div className="flex items-center justify-between pb-2.5">
          <span className="text-[10px] font-mono text-muted-foreground/30 truncate max-w-[70%]">{lesson.title}</span>
          <span className="text-[10px] font-mono tabular-nums text-muted-foreground/25 shrink-0">
            {currentStepIndex + 1}<span className="text-muted-foreground/15">/{steps.length}</span>
          </span>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-5 py-8">
          {!showComplete && (
            <StepTransition stepKey={`step-${currentStepIndex}`}>
              {/* Step type editorial overline */}
              <div className="flex items-center gap-3 mb-7">
                <span className={cn(
                  "font-mono text-[10px] uppercase tracking-[0.35em] font-bold shrink-0",
                  step?.type === "teach" && "text-emerald-500/60",
                  (step?.type === "quiz-mc" || step?.type === "quiz-tf" || step?.type === "quiz-scenario") && "text-blue-400/60",
                  step?.type === "practice" && "text-amber-400/60",
                )}>
                  {stepLabel}
                </span>
                <span className="h-px flex-1 bg-border/35" />
              </div>
              {renderStep(step)}
            </StepTransition>
          )}
        </div>
      </div>

      {/* Lesson complete overlay */}
      <AnimatePresence>
        {showComplete && finalBreakdown && (
          <LessonComplete breakdown={finalBreakdown} xpEarned={lesson.xpReward} onContinue={handleClose} />
        )}
      </AnimatePresence>
    </div>
  );
}
