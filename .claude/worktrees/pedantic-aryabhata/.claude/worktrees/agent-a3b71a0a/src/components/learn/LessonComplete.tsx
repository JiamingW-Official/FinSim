"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { soundEngine } from "@/services/audio/sound-engine";
import { useEffect, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Confetti } from "./Confetti";
import type { LessonScoreBreakdown } from "@/types/game";

interface LessonCompleteProps {
  breakdown: LessonScoreBreakdown;
  xpEarned: number;
  onContinue: () => void;
}

const GRADE_CONFIG = {
  S: {
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/40",
    label: "Outstanding! 🏆",
    sublabel: "You're a natural trader!",
    glow: "shadow-[0_0_50px_rgba(251,191,36,0.3)]",
    emoji: "🌟",
  },
  A: {
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/30",
    label: "Excellent! ⭐",
    sublabel: "Great work, keep it up!",
    glow: "shadow-[0_0_30px_rgba(52,211,153,0.2)]",
    emoji: "🎉",
  },
  B: {
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/30",
    label: "Good job! 👍",
    sublabel: "Solid understanding!",
    glow: "",
    emoji: "😊",
  },
  C: {
    color: "text-muted-foreground",
    bg: "bg-muted/10",
    border: "border-border",
    label: "Keep going! 💪",
    sublabel: "Practice makes perfect!",
    glow: "",
    emoji: "📖",
  },
} as const;

const xpFormat = (n: number) => `+${Math.round(n)} XP`;

// Floating celebration emojis for S/A grades
const CELEBRATE_EMOJIS = ["🌟", "✨", "🎊", "🏆", "💎", "🚀", "⭐", "🎯"];

interface FloatEmoji { id: number; emoji: string; x: number; delay: number }

export function LessonComplete({ breakdown, xpEarned, onContinue }: LessonCompleteProps) {
  const config = GRADE_CONFIG[breakdown.grade];
  const gradeMultiplier = breakdown.grade === "S" ? 1.5 : breakdown.grade === "A" ? 1.2 : 1;
  const adjustedXP = Math.round(xpEarned * gradeMultiplier);
  const [floatEmojis] = useState<FloatEmoji[]>(() =>
    (breakdown.grade === "S" || breakdown.grade === "A")
      ? Array.from({ length: 8 }, (_, i) => ({
          id: i,
          emoji: CELEBRATE_EMOJIS[i % CELEBRATE_EMOJIS.length],
          x: 10 + (i * 11) % 80,
          delay: i * 0.12,
        }))
      : []
  );

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

      {/* Floating celebration emojis */}
      <AnimatePresence>
        {floatEmojis.map((fe) => (
          <motion.span
            key={fe.id}
            className="pointer-events-none fixed bottom-16 text-2xl select-none"
            style={{ left: `${fe.x}%` }}
            initial={{ y: 0, opacity: 1, scale: 0.5 }}
            animate={{ y: -180, opacity: 0, scale: 1.4 }}
            exit={{}}
            transition={{ duration: 2, delay: fe.delay, ease: "easeOut" }}
          >
            {fe.emoji}
          </motion.span>
        ))}
      </AnimatePresence>

      <motion.div
        className={cn(
          "glass mx-4 flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl border p-8",
          config.border,
          config.glow,
        )}
        initial={{ scale: 0.75, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
      >
        {/* Grade letter with bounce */}
        <motion.div
          className={cn(
            "relative flex h-24 w-24 items-center justify-center rounded-2xl border-2 text-5xl font-black",
            config.border,
            config.bg,
            config.color,
            breakdown.grade === "S" && "shimmer-gold",
          )}
          initial={{ scale: 0, rotate: -25 }}
          animate={{ scale: [0, 1.2, 0.9, 1.05, 1], rotate: 0 }}
          transition={{ duration: 0.7, delay: 0.15, type: "tween" }}
        >
          {breakdown.grade}
          {/* Emoji badge in corner */}
          <motion.span
            className="absolute -top-3 -right-3 text-xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 400, damping: 12 }}
          >
            {config.emoji}
          </motion.span>
        </motion.div>

        {/* Message */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <h2 className="text-xl font-black">{config.label}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{config.sublabel}</p>
        </motion.div>

        {/* Score breakdown */}
        <motion.div
          className="w-full space-y-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <ScoreRow label="Quiz Accuracy" value={`${breakdown.accuracy}%`} delay={0.52} />
          {breakdown.speedBonus > 0 && (
            <ScoreRow label="⚡ Speed Bonus" value={`+${breakdown.speedBonus}`} delay={0.58} highlight />
          )}
          {breakdown.bestCombo >= 3 && (
            <ScoreRow label="🔥 Best Combo" value={`x${breakdown.bestCombo}`} delay={0.63} highlight />
          )}
          {breakdown.comboBonus > 0 && (
            <ScoreRow label="Combo Bonus" value={`+${breakdown.comboBonus}`} delay={0.68} />
          )}
          {breakdown.practiceBonus > 0 && (
            <ScoreRow label="📈 Practice" value={`+${breakdown.practiceBonus}`} delay={0.73} highlight />
          )}

          <motion.div
            className="flex items-center justify-between border-t border-border/50 pt-2 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.78 }}
          >
            <span className="text-sm font-bold">Total Score</span>
            <span className={cn("text-sm font-bold tabular-nums", config.color)}>
              {breakdown.totalPoints} / {breakdown.maxPoints}
            </span>
          </motion.div>
        </motion.div>

        {/* XP earned */}
        <motion.div
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-1.5",
            config.bg, config.border, "border",
          )}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.82, type: "spring", stiffness: 400, damping: 15 }}
        >
          <AnimatedNumber
            value={adjustedXP}
            format={xpFormat}
            className={cn("text-lg font-black", config.color)}
          />
          {gradeMultiplier > 1 && (
            <span className={cn("text-[10px] font-bold rounded-full px-1.5 py-0.5 border", config.bg, config.color, config.border)}>
              {gradeMultiplier === 1.5 ? "×1.5 BONUS 🎁" : "×1.2 BONUS 🎁"}
            </span>
          )}
        </motion.div>

        {/* Continue button */}
        <motion.button
          type="button"
          onClick={handleContinue}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ delay: 0.9 }}
          className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-all hover:brightness-110 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
        >
          Continue 🚀
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

function ScoreRow({
  label, value, delay, highlight,
}: {
  label: string; value: string; delay: number; highlight?: boolean;
}) {
  return (
    <motion.div
      className={cn(
        "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm",
        highlight ? "bg-primary/5 border border-primary/10" : "",
      )}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-bold tabular-nums", highlight && "text-primary")}>
        {value}
      </span>
    </motion.div>
  );
}
