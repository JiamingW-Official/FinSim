"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { QuizMCStep, QuizTFStep, QuizScenarioStep } from "@/data/lessons/types";
import { soundEngine } from "@/services/audio/sound-engine";

type QuizStepData = QuizMCStep | QuizTFStep | QuizScenarioStep;

interface QuizStepProps {
  step: QuizStepData;
  onCorrect: (timeMs: number, difficulty: number) => void;
  onWrong: (timeMs: number, difficulty: number) => void;
}

const CORRECT_HEADERS = [
  "Brilliant! 🎉",
  "Nailed it! ✨",
  "Perfect! 🎯",
  "You're on fire! 🔥",
  "Outstanding! 💎",
  "Spot on! 🌟",
  "Incredible! 🚀",
];

const WRONG_HEADERS = [
  "Not quite! 😅",
  "Oops! 🤔",
  "Almost there! 💪",
  "Good try! 📖",
  "Don't worry! 🌱",
];

function getOptions(step: QuizStepData): string[] {
  if (step.type === "quiz-tf") return ["True", "False"];
  return step.options;
}

function getCorrectIndex(step: QuizStepData): number {
  if (step.type === "quiz-tf") return step.correct ? 0 : 1;
  return step.correctIndex;
}

function getQuestion(step: QuizStepData): string {
  if (step.type === "quiz-tf") return step.statement;
  return step.question ?? (step.type === "quiz-scenario" ? step.scenario : "") ?? "";
}

function getDifficulty(step: QuizStepData): number {
  if (step.difficulty) return step.difficulty;
  if (step.type === "quiz-tf") return 1;
  if (step.type === "quiz-scenario") return 3;
  return 2;
}

export function QuizStepComponent({ step, onCorrect, onWrong }: QuizStepProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const mountTime = useRef(Date.now());
  const [answerTimeMs, setAnswerTimeMs] = useState(0);

  const options = getOptions(step);
  const correctIndex = getCorrectIndex(step);
  const question = getQuestion(step);
  const isCorrect = selected === correctIndex;
  const difficulty = getDifficulty(step);

  // Pick a header message deterministically from elapsed time bucket
  const correctHeader = CORRECT_HEADERS[Math.floor(Date.now() / 3000) % CORRECT_HEADERS.length];
  const wrongHeader = WRONG_HEADERS[Math.floor(Date.now() / 2700) % WRONG_HEADERS.length];

  const handleSelect = (index: number) => {
    if (showResult) return;
    const elapsed = Date.now() - mountTime.current;
    setAnswerTimeMs(elapsed);
    setSelected(index);
    setShowResult(true);

    if (index === correctIndex) {
      soundEngine.playCorrect();
    } else {
      soundEngine.playWrong();
    }
  };

  const handleContinue = () => {
    if (isCorrect) onCorrect(answerTimeMs, difficulty);
    else onWrong(answerTimeMs, difficulty);
  };

  const speedTier =
    answerTimeMs > 0
      ? answerTimeMs < 2000
        ? "lightning"
        : answerTimeMs < 4000
          ? "fast"
          : null
      : null;

  const speedLabel =
    speedTier === "lightning" ? "⚡ LIGHTNING!" :
    speedTier === "fast" ? "💨 FAST!" : null;

  return (
    <div className="flex flex-col gap-4">
      {step.type === "quiz-scenario" && (
        <motion.div
          className="rounded-xl bg-amber-500/8 border border-amber-500/20 p-3.5"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1.5">
            📋 Scenario
          </p>
          <p className="text-sm text-foreground/90 leading-relaxed">{step.scenario}</p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: step.type === "quiz-scenario" ? 0.12 : 0 }}
      >
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
          {step.type === "quiz-tf" ? "True or False?" : "Question"}
        </p>
        <h2 className="text-base font-bold leading-snug">{question}</h2>
      </motion.div>

      <div className={cn(
        "grid gap-2",
        step.type === "quiz-tf" ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2",
      )}>
        {options.map((opt, i) => {
          const isThis = selected === i;
          const isRight = i === correctIndex;

          let borderCls = "border-border/60";
          let bgCls = "bg-card/80";
          let textCls = "";
          if (showResult && isThis && isCorrect) {
            borderCls = "border-emerald-500/70";
            bgCls = "bg-emerald-500/10";
            textCls = "text-emerald-300";
          } else if (showResult && isThis && !isCorrect) {
            borderCls = "border-red-500/70";
            bgCls = "bg-red-500/10";
            textCls = "text-red-300";
          } else if (showResult && isRight) {
            borderCls = "border-emerald-500/40";
            bgCls = "bg-emerald-500/5";
            textCls = "text-emerald-400/80";
          }

          const letterLabel = step.type === "quiz-tf"
            ? (i === 0 ? "T" : "F")
            : String.fromCharCode(65 + i);

          return (
            <motion.button
              key={i}
              type="button"
              onClick={() => handleSelect(i)}
              disabled={showResult}
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: 1,
                y: 0,
                x: showResult && isThis && !isCorrect ? [0, -5, 5, -5, 5, 0] : 0,
              }}
              whileHover={!showResult ? { y: -1, scale: 1.01 } : undefined}
              whileTap={!showResult ? { scale: 0.97 } : undefined}
              transition={{
                opacity: { duration: 0.2, delay: i * 0.07 },
                y: { duration: 0.2, delay: i * 0.07 },
                x: { duration: 0.35 },
              }}
              className={cn(
                "relative rounded-xl border-2 p-3.5 text-left text-sm font-medium transition-colors",
                borderCls, bgCls, textCls,
                !showResult && "hover:border-primary/40 hover:bg-accent/60 cursor-pointer",
                showResult && "cursor-default",
              )}
            >
              <span className={cn(
                "mr-2.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shrink-0",
                showResult && isThis && isCorrect ? "bg-emerald-500/30 text-emerald-300"
                  : showResult && isThis && !isCorrect ? "bg-red-500/30 text-red-300"
                  : showResult && isRight ? "bg-emerald-500/20 text-emerald-400/80"
                  : "bg-muted text-muted-foreground",
              )}>
                {letterLabel}
              </span>
              {opt}

              <AnimatePresence>
                {showResult && isThis && isCorrect && (
                  <motion.span
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 text-xl"
                  >
                    ✓
                  </motion.span>
                )}
                {showResult && isThis && !isCorrect && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-xl"
                  >
                    ✗
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "overflow-hidden rounded-xl border-l-4 p-3.5",
              isCorrect
                ? "border-l-emerald-500 border-emerald-500/20 bg-emerald-500/5"
                : "border-l-red-500 border-red-500/20 bg-red-500/5",
            )}
          >
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <p className={cn(
                "text-sm font-black",
                isCorrect ? "text-emerald-400" : "text-red-400",
              )}>
                {isCorrect ? correctHeader : wrongHeader}
              </p>
              {isCorrect && speedLabel && (
                <motion.span
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 12, delay: 0.1 }}
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-black",
                    speedTier === "lightning"
                      ? "bg-amber-400/20 text-amber-400"
                      : "bg-blue-400/20 text-blue-400",
                  )}
                >
                  {speedLabel}
                </motion.span>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{step.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {showResult && (
        <motion.button
          type="button"
          onClick={handleContinue}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          transition={{ delay: 0.15 }}
          className={cn(
            "w-full rounded-xl py-3.5 text-sm font-bold transition-all",
            isCorrect
              ? "bg-emerald-500 text-white hover:bg-emerald-400"
              : "bg-red-500 text-white hover:bg-red-400",
          )}
        >
          {isCorrect ? "Keep going! →" : "Got it, continue →"}
        </motion.button>
      )}
    </div>
  );
}
