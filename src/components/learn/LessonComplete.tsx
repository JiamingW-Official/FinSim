"use client";

import { motion } from "framer-motion";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { soundEngine } from "@/services/audio/sound-engine";
import { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Confetti } from "./Confetti";
import type { LessonScoreBreakdown } from "@/types/game";

interface LessonCompleteProps {
  breakdown: LessonScoreBreakdown;
  xpEarned: number;
  onContinue: () => void;
}

const GRADE_CONFIG = {
  S: { color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30", label: "Outstanding!", glow: "shadow-[0_0_40px_rgba(251,191,36,0.3)]" },
  A: { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30", label: "Excellent!", glow: "shadow-[0_0_30px_rgba(52,211,153,0.2)]" },
  B: { color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/30", label: "Good job!", glow: "" },
  C: { color: "text-muted-foreground", bg: "bg-muted/10", border: "border-border", label: "Keep practicing!", glow: "" },
} as const;

const xpFormat = (n: number) => `+${Math.round(n)} XP`;

export function LessonComplete({ breakdown, xpEarned, onContinue }: LessonCompleteProps) {
  const config = GRADE_CONFIG[breakdown.grade];
  const gradeMultiplier = breakdown.grade === "S" ? 1.5 : breakdown.grade === "A" ? 1.2 : 1;
  const adjustedXP = Math.round(xpEarned * gradeMultiplier);

  useEffect(() => {
    if (breakdown.grade === "S" || breakdown.grade === "A") {
      soundEngine.playLessonComplete();
    } else {
      soundEngine.playXP();
    }
  }, [breakdown.grade]);

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
      <Confetti show={breakdown.grade === "S" || breakdown.grade === "A"} />

      <motion.div
        className={cn(
          "glass mx-4 flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl border p-8",
          config.border,
          config.glow,
        )}
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {/* Grade letter */}
        <motion.div
          className={cn(
            "flex h-20 w-20 items-center justify-center rounded-2xl border-2 text-4xl font-black",
            config.border,
            config.bg,
            config.color,
            breakdown.grade === "S" && "shimmer-gold",
          )}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.15 }}
        >
          {breakdown.grade}
        </motion.div>

        {/* Message */}
        <motion.h2
          className="text-xl font-black"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {config.label}
        </motion.h2>

        {/* Score breakdown */}
        <motion.div
          className="w-full space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <ScoreRow label="Quiz Accuracy" value={`${breakdown.accuracy}%`} delay={0.55} />
          {breakdown.speedBonus > 0 && (
            <ScoreRow label="Speed Bonus" value={`+${breakdown.speedBonus}`} icon="⚡" delay={0.6} />
          )}
          {breakdown.bestCombo >= 3 && (
            <ScoreRow label="Best Combo" value={`x${breakdown.bestCombo}`} icon="🔥" delay={0.65} />
          )}
          {breakdown.comboBonus > 0 && (
            <ScoreRow label="Combo Bonus" value={`+${breakdown.comboBonus}`} delay={0.7} />
          )}
          {breakdown.practiceBonus > 0 && (
            <ScoreRow label="Practice" value={`+${breakdown.practiceBonus}`} icon="📈" delay={0.75} />
          )}

          <motion.div
            className="flex items-center justify-between border-t border-border/50 pt-2 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span className="text-sm font-bold">Total Score</span>
            <span className={cn("text-sm font-bold tabular-nums", config.color)}>
              {breakdown.totalPoints}/{breakdown.maxPoints}
            </span>
          </motion.div>
        </motion.div>

        {/* XP */}
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
        >
          <AnimatedNumber
            value={adjustedXP}
            format={xpFormat}
            className="text-lg font-bold text-primary"
          />
          {gradeMultiplier > 1 && (
            <span className={cn("text-[10px] font-bold rounded-full px-1.5 py-0.5", config.bg, config.color)}>
              {gradeMultiplier === 1.5 ? "+50%" : "+20%"} bonus
            </span>
          )}
        </motion.div>

        {/* Continue */}
        <motion.button
          type="button"
          onClick={handleContinue}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
        >
          Continue
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

function ScoreRow({ label, value, icon, delay }: { label: string; value: string; icon?: string; delay: number }) {
  return (
    <motion.div
      className="flex items-center justify-between text-sm"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">
        {icon && <span className="mr-1">{icon}</span>}
        {value}
      </span>
    </motion.div>
  );
}
