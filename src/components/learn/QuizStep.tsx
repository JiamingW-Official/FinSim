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

const CORRECT_HEADERS = ["Brilliant!", "Nailed it!", "Perfect!", "You're on fire!", "Outstanding!", "Spot on!", "Incredible!"];
const WRONG_HEADERS = ["Not quite!", "Oops!", "Almost there!", "Good try!", "Don't worry!"];

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

  const correctHeader = CORRECT_HEADERS[Math.floor(Date.now() / 3000) % CORRECT_HEADERS.length];
  const wrongHeader = WRONG_HEADERS[Math.floor(Date.now() / 2700) % WRONG_HEADERS.length];

  const handleSelect = (index: number) => {
    if (showResult) return;
    setAnswerTimeMs(Date.now() - mountTime.current);
    setSelected(index);
    setShowResult(true);
    if (index === correctIndex) soundEngine.playCorrect();
    else soundEngine.playWrong();
  };

  const handleContinue = () => {
    if (isCorrect) onCorrect(answerTimeMs, difficulty);
    else onWrong(answerTimeMs, difficulty);
  };

  const speedTier = answerTimeMs > 0 ? (answerTimeMs < 2000 ? "lightning" : answerTimeMs < 4000 ? "fast" : null) : null;

  const letterLabel = (i: number) =>
    step.type === "quiz-tf" ? (i === 0 ? "T" : "F") : String.fromCharCode(65 + i);

  return (
    <div className="flex flex-col gap-5">
      {/* Scenario context box */}
      {step.type === "quiz-scenario" && (
        <motion.div
          className="rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-4 py-4"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-400/60 mb-2">Scenario</p>
          <p className="text-sm text-foreground/85 leading-relaxed">{step.scenario}</p>
        </motion.div>
      )}

      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: step.type === "quiz-scenario" ? 0.1 : 0 }}
      >
        <h2 className="font-serif text-2xl font-bold leading-snug text-foreground">{question}</h2>
      </motion.div>

      {/* Options */}
      <div className={cn("flex flex-col gap-2", step.type === "quiz-tf" && "grid grid-cols-2 flex-none")}>
        {options.map((opt, i) => {
          const isThis = selected === i;
          const isRight = i === correctIndex;
          const dimmed = showResult && !isThis && !isRight;

          let borderCls = "border-border/60";
          let bgCls = "bg-transparent";
          let textCls = "text-foreground/75";
          let letterBg = "bg-foreground/[0.08] text-muted-foreground/50";

          if (showResult && isThis && isCorrect) {
            borderCls = "border-emerald-500/60";
            bgCls = "bg-emerald-500/10";
            textCls = "text-emerald-300";
            letterBg = "bg-emerald-500/25 text-emerald-300";
          } else if (showResult && isThis && !isCorrect) {
            borderCls = "border-red-500/60";
            bgCls = "bg-red-500/10";
            textCls = "text-red-300";
            letterBg = "bg-red-500/25 text-red-300";
          } else if (showResult && isRight) {
            borderCls = "border-emerald-500/35";
            bgCls = "bg-emerald-500/5";
            textCls = "text-emerald-400/70";
            letterBg = "bg-emerald-500/15 text-emerald-400/70";
          }

          return (
            <motion.button
              key={i}
              type="button"
              onClick={() => handleSelect(i)}
              disabled={showResult}
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: dimmed ? 0.35 : 1,
                y: 0,
                scale: dimmed ? 0.985 : 1,
                x: showResult && isThis && !isCorrect ? [0, -6, 6, -5, 5, 0] : 0,
              }}
              whileHover={!showResult ? { x: 3, borderColor: "rgba(200,209,219,0.25)" } : undefined}
              whileTap={!showResult ? { scale: 0.97 } : undefined}
              transition={{
                opacity: { duration: 0.18, delay: i * 0.06 },
                y: { duration: 0.18, delay: i * 0.06 },
                scale: { duration: 0.2 },
                x: { duration: 0.35 },
              }}
              className={cn(
                "relative flex items-center gap-3.5 rounded-xl border-2 px-4 py-3.5 text-left min-h-[3.5rem] transition-colors duration-150",
                borderCls, bgCls,
                !showResult && "hover:bg-foreground/[0.04] cursor-pointer",
                showResult && "cursor-default",
              )}
            >
              <span className={cn(
                "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold transition-colors",
                letterBg,
              )}>
                {letterLabel(i)}
              </span>
              <span className={cn("text-[13px] font-medium leading-snug flex-1", textCls)}>
                {opt}
              </span>
              <AnimatePresence>
                {showResult && isThis && isCorrect && (
                  <motion.span
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 14 }}
                    className="text-emerald-400 text-lg font-bold shrink-0"
                  >✓</motion.span>
                )}
                {showResult && isThis && !isCorrect && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 14 }}
                    className="text-red-400 text-lg font-bold shrink-0"
                  >✗</motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Result feedback */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className={cn(
              "rounded-xl border px-5 py-4",
              isCorrect ? "border-emerald-500/25 bg-emerald-500/[0.07]" : "border-red-500/25 bg-red-500/[0.07]",
            )}>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <p className={cn(
                  "font-serif text-xl font-bold leading-none",
                  isCorrect ? "text-emerald-400" : "text-red-400",
                )}>
                  {isCorrect ? correctHeader : wrongHeader}
                </p>
                {isCorrect && speedTier && (
                  <motion.span
                    initial={{ scale: 0, rotate: -12 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 12, delay: 0.08 }}
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-[0.1em] uppercase border",
                      speedTier === "lightning"
                        ? "bg-amber-400/15 text-amber-400 border-amber-400/25"
                        : "bg-primary/15 text-primary border-primary/25",
                    )}
                  >
                    {speedTier === "lightning" ? "Lightning" : "Fast"}
                  </motion.span>
                )}
              </div>
              <p className="text-xs text-muted-foreground/70 leading-relaxed">{step.explanation}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continue */}
      {showResult && (
        <motion.button
          type="button"
          onClick={handleContinue}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          transition={{ delay: 0.1 }}
          className={cn(
            "w-full rounded-full py-3 text-[11px] font-bold tracking-[0.12em] uppercase transition-all",
            isCorrect
              ? "bg-emerald-500 text-background hover:bg-emerald-400"
              : "bg-foreground text-background hover:bg-foreground/90",
          )}
        >
          {isCorrect ? "Keep going →" : "Got it →"}
        </motion.button>
      )}
    </div>
  );
}
