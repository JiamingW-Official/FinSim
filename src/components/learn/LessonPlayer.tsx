"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
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

interface LessonPlayerProps {
  lesson: Lesson;
}

export function LessonPlayer({ lesson }: LessonPlayerProps) {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [showComplete, setShowComplete] = useState(false);

  const hearts = useLearnStore((s) => s.hearts);
  const loseHeart = useLearnStore((s) => s.loseHeart);
  const completeLesson = useLearnStore((s) => s.completeLesson);
  const [outOfHearts, setOutOfHearts] = useState(false);

  const steps = lesson.steps;
  const step = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !showComplete && !outOfHearts) {
        // Enter to continue only works on teach steps
        if (step?.type === "teach") {
          advance();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  const advance = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((i) => i + 1);
    } else {
      // Lesson complete
      const accuracy = totalQuizzes > 0 ? Math.round((correctCount / totalQuizzes) * 100) : 100;
      const score = accuracy;
      completeLesson(lesson.id, score, lesson.xpReward);
      setShowComplete(true);
    }
  }, [currentStepIndex, steps.length, totalQuizzes, correctCount, completeLesson, lesson]);

  const handleQuizCorrect = useCallback(() => {
    setCorrectCount((c) => c + 1);
    setTotalQuizzes((t) => t + 1);
    advance();
  }, [advance]);

  const handleQuizWrong = useCallback(() => {
    setTotalQuizzes((t) => t + 1);
    loseHeart();
    // Check if out of hearts after losing one
    const currentHearts = useLearnStore.getState().hearts;
    if (currentHearts <= 0) {
      setOutOfHearts(true);
    } else {
      advance();
    }
  }, [advance, loseHeart]);

  const handleClose = () => {
    router.push("/learn");
  };

  const renderStep = (s: LessonStep) => {
    switch (s.type) {
      case "teach":
        return <TeachStepComponent step={s} onContinue={advance} />;
      case "quiz-mc":
      case "quiz-tf":
      case "quiz-scenario":
        return (
          <QuizStepComponent
            step={s}
            onCorrect={handleQuizCorrect}
            onWrong={handleQuizWrong}
            heartsLeft={hearts}
          />
        );
      case "practice":
        return <PracticeStepComponent step={s} onContinue={advance} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Top bar: progress + hearts + close */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button
          type="button"
          onClick={handleClose}
          className="rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Segmented progress bar — colored by step type */}
        <div className="flex flex-1 items-center gap-0.5">
          {steps.map((s, i) => {
            const color =
              s.type === "teach"
                ? "bg-emerald-500"
                : s.type === "practice"
                  ? "bg-amber-500"
                  : "bg-blue-500";
            return (
              <div key={i} className="h-2 flex-1 rounded-full overflow-hidden bg-muted/50">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    i < currentStepIndex
                      ? `${color} w-full`
                      : i === currentStepIndex
                        ? `${color}/60 w-1/2`
                        : "w-0",
                  )}
                />
              </div>
            );
          })}
        </div>

        <HeartsDisplay />
      </div>

      {/* Main content */}
      <div className="flex flex-1 items-start justify-center overflow-y-auto px-4 py-6">
        <div className="w-full max-w-lg">
          {!showComplete && !outOfHearts && (
            <StepTransition stepKey={`step-${currentStepIndex}`}>
              <div className="glass rounded-2xl border border-border/50 p-5">
                {/* Step type badge */}
                <div className="mb-3">
                  <span className={cn(
                    "step-badge",
                    step.type === "teach" && "step-badge-teach",
                    (step.type === "quiz-mc" || step.type === "quiz-tf" || step.type === "quiz-scenario") && "step-badge-quiz",
                    step.type === "practice" && "step-badge-practice",
                  )}>
                    {step.type === "teach" ? "TEACH" : step.type === "practice" ? "PRACTICE" : "QUIZ"}
                  </span>
                </div>
                {renderStep(step)}
              </div>
            </StepTransition>
          )}

          {outOfHearts && (
            <div className="flex flex-col items-center gap-6 py-12">
              <div className="text-5xl">💔</div>
              <h2 className="text-xl font-bold">Out of Hearts!</h2>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Hearts regenerate 1 per hour. Come back later to continue learning!
              </p>
              <HeartsDisplay />
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground transition-all hover:brightness-110"
              >
                Back to Learn
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lesson complete overlay */}
      <AnimatePresence>
        {showComplete && (
          <LessonComplete
            score={totalQuizzes > 0 ? Math.round((correctCount / totalQuizzes) * 100) : 100}
            xpEarned={lesson.xpReward}
            onContinue={handleClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
