"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { QuizMCStep, QuizTFStep, QuizScenarioStep } from "@/data/lessons/types";
import { soundEngine } from "@/services/audio/sound-engine";

type QuizStepData = QuizMCStep | QuizTFStep | QuizScenarioStep;

interface QuizStepProps {
  step: QuizStepData;
  onCorrect: () => void;
  onWrong: () => void;
  heartsLeft: number;
}

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
  return step.question;
}

export function QuizStepComponent({ step, onCorrect, onWrong, heartsLeft }: QuizStepProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const options = getOptions(step);
  const correctIndex = getCorrectIndex(step);
  const question = getQuestion(step);
  const isCorrect = selected === correctIndex;
  const noHearts = heartsLeft <= 0;

  const handleSelect = (index: number) => {
    if (showResult || noHearts) return;
    setSelected(index);
    setShowResult(true);

    if (index === correctIndex) {
      soundEngine.playCorrect();
    } else {
      soundEngine.playWrong();
    }
  };

  const handleContinue = () => {
    if (isCorrect) onCorrect();
    else onWrong();
  };

  return (
    <div className="flex flex-col gap-4">
      {step.type === "quiz-scenario" && (
        <motion.div
          className="rounded-lg bg-muted/50 border border-border/50 p-3"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Scenario</p>
          <p className="text-sm text-foreground/90">{step.scenario}</p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: step.type === "quiz-scenario" ? 0.15 : 0 }}
      >
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
          {step.type === "quiz-tf" ? "True or False" : "Question"}
        </p>
        <h2 className="text-base font-bold">{question}</h2>
      </motion.div>

      <div className={cn(
        "grid gap-2",
        step.type === "quiz-tf" ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2",
      )}>
        {options.map((opt, i) => {
          const isThis = selected === i;
          const isRight = i === correctIndex;

          let borderColor = "border-border";
          let bg = "bg-card";
          if (showResult && isThis && isCorrect) {
            borderColor = "border-[#10b981]";
            bg = "bg-[#10b981]/10";
          } else if (showResult && isThis && !isCorrect) {
            borderColor = "border-[#ef4444]";
            bg = "bg-[#ef4444]/10";
          } else if (showResult && isRight) {
            borderColor = "border-[#10b981]/50";
            bg = "bg-[#10b981]/5";
          }

          return (
            <motion.button
              key={i}
              type="button"
              onClick={() => handleSelect(i)}
              disabled={showResult || noHearts}
              initial={{ opacity: 0, y: 8 }}
              animate={{
                opacity: 1,
                y: 0,
                x: showResult && isThis && !isCorrect ? [0, -4, 4, -4, 4, 0] : 0,
              }}
              transition={{
                opacity: { duration: 0.2, delay: i * 0.08 },
                y: { duration: 0.2, delay: i * 0.08 },
                x: { duration: 0.4, delay: 0 },
              }}
              className={cn(
                "relative rounded-xl border-2 p-3 text-left text-sm font-medium transition-colors",
                borderColor,
                bg,
                !showResult && !noHearts && "hover:border-primary/50 hover:bg-accent/50 cursor-pointer",
                (showResult || noHearts) && "cursor-default",
              )}
            >
              <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                {step.type === "quiz-tf" ? (i === 0 ? "T" : "F") : String.fromCharCode(65 + i)}
              </span>
              {opt}
              {showResult && isThis && isCorrect && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#10b981] text-lg"
                >
                  ✓
                </motion.span>
              )}
              {showResult && isThis && !isCorrect && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ef4444] text-lg"
                >
                  ✗
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      {showResult && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.25 }}
          className={cn(
            "rounded-lg border p-3 border-l-4",
            isCorrect
              ? "border-[#10b981]/30 border-l-[#10b981] bg-[#10b981]/5"
              : "border-[#ef4444]/30 border-l-[#ef4444] bg-[#ef4444]/5",
          )}
        >
          <p className={cn(
            "text-xs font-bold mb-1",
            isCorrect ? "text-[#10b981]" : "text-[#ef4444]",
          )}>
            {isCorrect ? "Correct!" : "Not quite!"}
          </p>
          <p className="text-xs text-muted-foreground">{step.explanation}</p>
        </motion.div>
      )}

      {showResult && (
        <motion.button
          type="button"
          onClick={handleContinue}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "w-full rounded-xl py-3 text-sm font-bold transition-all active:scale-[0.98]",
            isCorrect
              ? "bg-[#10b981] text-white hover:brightness-110"
              : "bg-[#ef4444] text-white hover:brightness-110",
          )}
        >
          Continue
        </motion.button>
      )}
    </div>
  );
}
