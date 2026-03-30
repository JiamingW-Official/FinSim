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

interface LessonPlayerProps {
 lesson: Lesson;
}

interface QuizResult {
 correct: boolean;
 timeMs: number;
 difficulty: number;
}

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

 // Keyboard shortcuts
 useEffect(() => {
 const handleKey = (e: KeyboardEvent) => {
 if (e.key === "Enter" && !showComplete) {
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
 // Lesson complete — compute full score breakdown
 const accuracy = totalQuizzes > 0 ? Math.round((correctCount / totalQuizzes) * 100) : 100;

 // Quiz points: weighted by difficulty (TF=1, MC=2, Scenario=3)
 let quizPts = 0;
 let quizMax = 0;
 for (const r of quizResults) {
 const weight = r.difficulty;
 quizMax += weight * 10;
 if (r.correct) quizPts += weight * 10;
 }

 // Speed bonus: faster answers earn more (max 50 per question for <1s)
 const speedBns = quizResults.reduce((sum, r) => {
 if (!r.correct) return sum;
 return sum + Math.max(0, Math.round((5000 - r.timeMs) / 100));
 }, 0);

 // Combo bonus: reward long correct streaks
 const comboBns = bestCombo >= 3 ? (bestCombo - 2) * 10 : 0;

 // Practice bonus
 const practiceBns = practiceProfit > 0 ? 30 : 0;

 const totalPts = quizPts + speedBns + comboBns + practiceBns;
 const maxPts = Math.max(quizMax + 50 + 30 + 30, 1); // theoretical max: quiz + speed + combo + practice

 const breakdown: LessonScoreBreakdown = {
 quizPoints: quizPts,
 quizMaxPoints: quizMax,
 speedBonus: speedBns,
 comboBonus: comboBns,
 practiceBonus: practiceBns,
 totalPoints: totalPts,
 maxPoints: maxPts,
 grade: calculateGrade(totalPts / maxPts),
 accuracy,
 bestCombo,
 };
 setFinalBreakdown(breakdown);
 completeLesson(lesson.id, breakdown, lesson.xpReward);
 setShowComplete(true);
 }
 }, [currentStepIndex, steps.length, totalQuizzes, correctCount, completeLesson, lesson]);

 const handleQuizCorrect = useCallback((timeMs: number, difficulty: number) => {
 setCorrectCount((c) => c + 1);
 setTotalQuizzes((t) => t + 1);
 setQuizResults((r) => [...r, { correct: true, timeMs, difficulty }]);
 setCurrentCombo((c) => {
 const next = c + 1;
 setBestCombo((b) => Math.max(b, next));
 return next;
 });
 advance();
 }, [advance]);

 const handleQuizWrong = useCallback((timeMs: number, difficulty: number) => {
 setTotalQuizzes((t) => t + 1);
 setQuizResults((r) => [...r, { correct: false, timeMs, difficulty }]);
 setCurrentCombo(0);
 loseHeart();
 advance();
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
 <div className="flex flex-col border-b border-border px-5 pt-3.5 pb-3 gap-2.5">
 {/* Row 1: close | title | combo | hearts */}
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={handleClose}
 className="rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/30 shrink-0"
 title="Back to lessons"
 >
 <X className="h-5 w-5" />
 </button>

 <span className="flex-1 min-w-0 text-xs font-semibold text-foreground/55 truncate">
 {lesson.title}
 </span>

 {currentCombo >= 2 && (
 <motion.div
 key={currentCombo}
 initial={{ scale: 0, rotate: -15 }}
 animate={{ scale: 1, rotate: 0 }}
 transition={{ type: "spring", stiffness: 500, damping: 12 }}
 className="flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 shrink-0"
 >
 
 <span className="text-xs font-semibold text-amber-400">x{currentCombo}</span>
 </motion.div>
 )}

 <HeartsDisplay />
 </div>

 {/* Row 2: step-type segmented progress bar */}
 <div className="flex items-center gap-0.5">
 {steps.map((s, i) => {
 const color =
 s.type === "teach"
 ? "bg-emerald-500"
 : s.type === "practice"
 ? "bg-amber-400"
 : "bg-blue-400";
 return (
 <div key={i} className="h-1 flex-1 rounded-full overflow-hidden bg-border/60">
 <motion.div
 className={cn("h-full rounded-full", color)}
 initial={{ width: "0%" }}
 animate={{
 width: i < currentStepIndex ? "100%" : i === currentStepIndex ? "50%" : "0%",
 }}
 transition={{ duration: 0.4, ease: "easeOut" }}
 />
 </div>
 );
 })}
 <span className="ml-2 text-[11px] font-mono tabular-nums text-muted-foreground/35 shrink-0">
 {currentStepIndex + 1}/{steps.length}
 </span>
 </div>
 </div>

 {/* Main content */}
 <div className="flex flex-1 items-start justify-center overflow-y-auto px-4 py-6">
 <div className="w-full max-w-lg">
 {!showComplete && (
 <StepTransition stepKey={`step-${currentStepIndex}`}>
 <div className="rounded-xl border border-border bg-card p-6">
 {/* Step type badge */}
 <div className="mb-4">
 <span className={cn(
 "step-badge",
 step.type === "teach" && "step-badge-teach",
 (step.type === "quiz-mc" || step.type === "quiz-tf" || step.type === "quiz-scenario") && "step-badge-quiz",
 step.type === "practice" && "step-badge-practice",
 )}>
 {step.type === "teach" ? "LEARN"
 : step.type === "practice" ? "PRACTICE"
 : step.type === "quiz-scenario" ? "SCENARIO"
 : step.type === "quiz-tf" ? "TRUE / FALSE"
 : "QUIZ"}
 </span>
 </div>
 {renderStep(step)}
 </div>
 </StepTransition>
 )}
 </div>
 </div>

 {/* Lesson complete overlay */}
 <AnimatePresence>
 {showComplete && finalBreakdown && (
 <LessonComplete
 breakdown={finalBreakdown}
 xpEarned={lesson.xpReward}
 onContinue={handleClose}
 />
 )}
 </AnimatePresence>
 </div>
 );
}
