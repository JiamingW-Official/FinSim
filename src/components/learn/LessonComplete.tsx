"use client";

import { motion } from "framer-motion";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { soundEngine } from "@/services/audio/sound-engine";
import { useEffect, useCallback } from "react";
import { Confetti } from "./Confetti";

interface LessonCompleteProps {
  score: number; // 0-100 accuracy
  xpEarned: number;
  onContinue: () => void;
}

function getStars(score: number): number {
  if (score >= 90) return 3;
  if (score >= 60) return 2;
  return 1;
}

function getMessage(stars: number): string {
  if (stars === 3) return "Perfect!";
  if (stars === 2) return "Great job!";
  return "Good effort!";
}

const xpFormat = (n: number) => `+${Math.round(n)} XP`;

export function LessonComplete({ score, xpEarned, onContinue }: LessonCompleteProps) {
  const stars = getStars(score);
  const message = getMessage(stars);

  useEffect(() => {
    if (stars === 3) {
      soundEngine.playLessonComplete();
    } else {
      soundEngine.playXP();
    }
  }, [stars]);

  const handleContinue = useCallback(() => {
    onContinue();
  }, [onContinue]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Confetti show={stars >= 2} />

      <motion.div
        className="glass mx-4 flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl border border-border p-8"
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {/* Stars */}
        <div className="flex items-end gap-2">
          {[1, 2, 3].map((s) => (
            <motion.svg
              key={s}
              width={s === 2 ? 52 : 40}
              height={s === 2 ? 52 : 40}
              viewBox="0 0 24 24"
              initial={{ scale: 0, rotate: -30 }}
              animate={{
                scale: s <= stars ? 1 : 0.6,
                rotate: 0,
                opacity: s <= stars ? 1 : 0.2,
              }}
              transition={{ delay: s * 0.15, type: "spring", stiffness: 300, damping: 15 }}
            >
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={s <= stars ? "#f59e0b" : "none"}
                stroke={s <= stars ? "#f59e0b" : "currentColor"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={s > stars ? "text-muted-foreground" : ""}
              />
            </motion.svg>
          ))}
        </div>

        {/* Message */}
        <motion.h2
          className="text-2xl font-black"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {message}
        </motion.h2>

        {/* Stats */}
        <motion.div
          className="flex w-full flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Accuracy</span>
            <span className="text-lg font-bold tabular-nums">{score}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">XP Earned</span>
            <AnimatedNumber
              value={xpEarned}
              format={xpFormat}
              className="text-lg font-bold text-primary"
            />
          </div>
        </motion.div>

        {/* Continue */}
        <motion.button
          type="button"
          onClick={handleContinue}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
        >
          Continue
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
