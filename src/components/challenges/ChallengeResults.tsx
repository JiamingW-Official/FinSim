"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { Confetti } from "@/components/learn/Confetti";
import { soundEngine } from "@/services/audio/sound-engine";
import type { ScenarioGrade } from "@/types/challenges";

interface ChallengeResultsProps {
  grade: ScenarioGrade;
  pnl: number;
  pnlPercent: number;
  objectivesCompleted: number;
  objectivesTotal: number;
  timeTakenMs: number;
  xpEarned: number;
  onContinue: () => void;
}

const GRADE_CONFIG = {
  S: { color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30", label: "Outstanding!", glow: "", emoji: "🏆" },
  A: { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30", label: "Excellent!", glow: "", emoji: "⭐" },
  B: { color: "text-primary", bg: "bg-primary/10", border: "border-border", label: "Good job!", glow: "", emoji: "👍" },
  C: { color: "text-muted-foreground", bg: "bg-muted/10", border: "border-border", label: "Keep practicing!", glow: "", emoji: "💪" },
} as const;

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

const pnlFormat = (n: number) => `$${n >= 0 ? "+" : ""}${n.toFixed(2)}`;
const xpFormat = (n: number) => `+${Math.round(n)} XP`;

export function ChallengeResults({
  grade,
  pnl,
  pnlPercent,
  objectivesCompleted,
  objectivesTotal,
  timeTakenMs,
  xpEarned,
  onContinue,
}: ChallengeResultsProps) {
  const config = GRADE_CONFIG[grade];

  useEffect(() => {
    if (grade === "S" || grade === "A") {
      soundEngine.playLessonComplete();
    } else {
      soundEngine.playXP();
    }
  }, [grade]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Confetti show={grade === "S" || grade === "A"} />

      <motion.div
        className={cn(
          "glass mx-4 flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl border p-8",
          config.border,
          config.glow,
        )}
        initial={{ scale: 0.7, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
      >
        {/* Grade letter — big dramatic reveal */}
        <motion.div
          className={cn(
            "flex h-24 w-24 items-center justify-center rounded-2xl border-2 text-5xl font-bold",
            config.border,
            config.bg,
            config.color,
            grade === "S" && "shimmer-gold",
          )}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 250, damping: 12, delay: 0.15 }}
        >
          {grade}
        </motion.div>

        {/* Message with emoji */}
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.span
            className="text-2xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 400, damping: 12 }}
          >
            {config.emoji}
          </motion.span>
          <h2 className="text-xl font-bold">{config.label}</h2>
        </motion.div>

        {/* Stats — card style */}
        <motion.div
          className="w-full space-y-1 rounded-xl border border-border/50 bg-card/50 p-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <ResultRow label="P&L" icon="💰" delay={0.55}>
            <AnimatedNumber
              value={pnl}
              format={pnlFormat}
              className={cn(
                "font-bold tabular-nums",
                pnl >= 0 ? "text-emerald-400" : "text-red-400",
              )}
            />
          </ResultRow>

          <ResultRow label="Return" icon="📊" delay={0.6}>
            <span className={cn(
              "font-bold tabular-nums",
              pnlPercent >= 0 ? "text-emerald-400" : "text-red-400",
            )}>
              {pnlPercent >= 0 ? "+" : ""}{pnlPercent.toFixed(1)}%
            </span>
          </ResultRow>

          <ResultRow label="Objectives" icon="🎯" delay={0.65}>
            <span className={cn(
              "font-bold tabular-nums",
              objectivesCompleted === objectivesTotal ? "text-emerald-400" : "text-foreground",
            )}>
              {objectivesCompleted}/{objectivesTotal}
            </span>
          </ResultRow>

          <ResultRow label="Time" icon="⏱️" delay={0.7}>
            <span className="font-bold tabular-nums text-foreground">
              {formatTime(timeTakenMs)}
            </span>
          </ResultRow>
        </motion.div>

        {/* XP earned — prominent */}
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 300, damping: 15 }}
        >
          <AnimatedNumber
            value={xpEarned}
            format={xpFormat}
            className="text-xl font-bold text-primary"
          />
          {grade === "S" && (
            <motion.span
              className={cn("text-xs font-bold rounded-full px-2 py-0.5", config.bg, config.color)}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9, type: "spring", stiffness: 400 }}
            >
              +50% bonus
            </motion.span>
          )}
          {grade === "A" && (
            <motion.span
              className={cn("text-xs font-bold rounded-full px-2 py-0.5", config.bg, config.color)}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9, type: "spring", stiffness: 400 }}
            >
              +20% bonus
            </motion.span>
          )}
        </motion.div>

        {/* Insight tip based on performance */}
        <motion.div
          className="w-full rounded-lg bg-card/30 px-3 py-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <p className="text-xs text-muted-foreground leading-relaxed text-center">
            {grade === "S" || grade === "A"
              ? "Great execution! Your timing and risk management were on point."
              : pnl < 0
                ? "Don't worry — every loss is a lesson. Try using stop-losses next time!"
                : "Solid effort! Focus on timing your entries for higher returns."
            }
          </p>
        </motion.div>

        {/* Continue button */}
        <motion.button
          type="button"
          onClick={onContinue}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-all hover:brightness-110"
        >
          Continue
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

function ResultRow({
  label,
  icon,
  delay,
  children,
}: {
  label: string;
  icon: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="flex items-center justify-between text-sm py-1"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <span className="text-xs">{icon}</span>
        {label}
      </span>
      {children}
    </motion.div>
  );
}
