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
  S: { color: "text-amber-400", bg: "bg-amber-400/8", border: "border-amber-400/30", label: "Outstanding!", sublabel: "You're a natural!" },
  A: { color: "text-emerald-400", bg: "bg-emerald-400/8", border: "border-emerald-400/25", label: "Excellent!", sublabel: "Great work, keep it up!" },
  B: { color: "text-primary", bg: "bg-primary/8", border: "border-primary/25", label: "Good job!", sublabel: "Solid understanding!" },
  C: { color: "text-muted-foreground", bg: "bg-muted/10", border: "border-border", label: "Keep going!", sublabel: "Practice makes perfect!" },
} as const;

const xpFormat = (n: number) => `+${Math.round(n)}`;

interface FloatEmoji { id: number; emoji: string; x: number; delay: number; }

export function LessonComplete({ breakdown, xpEarned, onContinue }: LessonCompleteProps) {
  const config = GRADE_CONFIG[breakdown.grade];
  const gradeMultiplier = breakdown.grade === "S" ? 1.5 : breakdown.grade === "A" ? 1.2 : 1;
  const adjustedXP = Math.round(xpEarned * gradeMultiplier);

  const [floatEmojis] = useState<FloatEmoji[]>(() =>
    (breakdown.grade === "S" || breakdown.grade === "A")
      ? Array.from({ length: 8 }, (_, i) => ({ id: i, emoji: ["*", "+", "·", "*", "+", "·", "*", "+"][i], x: 10 + (i * 11) % 80, delay: i * 0.12 }))
      : []
  );

  useEffect(() => {
    if (breakdown.grade === "S" || breakdown.grade === "A") soundEngine.playLessonComplete();
    else soundEngine.playXP();
  }, [breakdown.grade]);

  const handleContinue = useCallback(() => onContinue(), [onContinue]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/92 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Confetti show={breakdown.grade === "S" || breakdown.grade === "A"} />

      {/* Floating particles */}
      <AnimatePresence>
        {floatEmojis.map((fe) => (
          <motion.span
            key={fe.id}
            className="pointer-events-none fixed bottom-20 text-xl select-none text-foreground/20 font-mono"
            style={{ left: `${fe.x}%` }}
            initial={{ y: 0, opacity: 0.6, scale: 0.6 }}
            animate={{ y: -220, opacity: 0, scale: 1.2 }}
            exit={{}}
            transition={{ duration: 2.2, delay: fe.delay, ease: "easeOut" }}
          >
            {fe.emoji}
          </motion.span>
        ))}
      </AnimatePresence>

      <motion.div
        className={cn(
          "mx-4 flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl border p-8",
          "bg-card/90",
          config.border,
        )}
        initial={{ scale: 0.8, y: 32, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.05 }}
      >
        {/* Grade — huge serif anchor */}
        <motion.div
          className="flex flex-col items-center gap-0"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: [0, 1.15, 0.92, 1.04, 1], rotate: 0 }}
          transition={{ duration: 0.65, delay: 0.12, type: "tween" }}
        >
          <span className={cn(
            "font-serif font-bold leading-none select-none tabular-nums",
            breakdown.grade === "S" || breakdown.grade === "A" ? "text-[8rem]" : "text-[6.5rem]",
            config.color,
          )}>
            {breakdown.grade}
          </span>
          <motion.div
            className="text-center -mt-2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-base font-semibold text-foreground/80">{config.label}</p>
            <p className="text-xs text-muted-foreground/40 mt-0.5">{config.sublabel}</p>
          </motion.div>
        </motion.div>

        {/* Score breakdown */}
        <motion.div
          className="w-full space-y-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.48 }}
        >
          <ScoreRow label="Accuracy" value={`${breakdown.accuracy}%`} delay={0.5} />
          {breakdown.speedBonus > 0 && <ScoreRow label="Speed bonus" value={`+${breakdown.speedBonus}`} delay={0.55} accent />}
          {breakdown.bestCombo >= 3 && <ScoreRow label="Best combo" value={`×${breakdown.bestCombo}`} delay={0.6} accent />}
          {breakdown.comboBonus > 0 && <ScoreRow label="Combo bonus" value={`+${breakdown.comboBonus}`} delay={0.65} />}
          {breakdown.practiceBonus > 0 && <ScoreRow label="Practice" value={`+${breakdown.practiceBonus}`} delay={0.7} accent />}
          <motion.div
            className="flex items-center justify-between border-t border-border/50 pt-3 mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75 }}
          >
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/40">Total</span>
            <span className={cn("font-serif text-lg font-bold tabular-nums", config.color)}>
              {breakdown.totalPoints}<span className="text-muted-foreground/30 font-light text-sm">/{breakdown.maxPoints}</span>
            </span>
          </motion.div>
        </motion.div>

        {/* XP earned */}
        <motion.div
          className={cn("flex items-center gap-2 rounded-full px-5 py-2 border", config.bg, config.border)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 400, damping: 15 }}
        >
          <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/40">XP</span>
          <AnimatedNumber
            value={adjustedXP}
            format={xpFormat}
            className={cn("font-serif text-2xl font-bold", config.color)}
          />
          {gradeMultiplier > 1 && (
            <span className={cn("text-[10px] font-mono font-bold rounded-full px-1.5 py-0.5 border", config.bg, config.color, config.border)}>
              ×{gradeMultiplier === 1.5 ? "1.5" : "1.2"}
            </span>
          )}
        </motion.div>

        {/* Continue */}
        <motion.button
          type="button"
          onClick={handleContinue}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ delay: 0.88 }}
          className="w-full rounded-full bg-foreground text-background py-3 text-[11px] font-bold tracking-[0.12em] uppercase transition-all hover:bg-foreground/90"
        >
          Continue →
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

function ScoreRow({ label, value, delay, accent }: { label: string; value: string; delay: number; accent?: boolean }) {
  return (
    <motion.div
      className="flex items-center justify-between py-1.5"
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground/35">{label}</span>
      <span className={cn("font-serif text-base font-bold tabular-nums", accent ? "text-primary" : "text-foreground/70")}>
        {value}
      </span>
    </motion.div>
  );
}
