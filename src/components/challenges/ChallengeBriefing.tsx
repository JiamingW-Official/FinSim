"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Target, Zap } from "lucide-react";
import type { PracticeObjective } from "@/data/lessons/types";

interface ChallengeBriefingProps {
  name: string;
  description: string;
  difficulty: string | number;
  xpReward: number;
  objectives: PracticeObjective[];
  onStart: () => void;
}

function objectiveLabel(obj: PracticeObjective): string {
  switch (obj.kind) {
    case "buy": return `Buy at least ${obj.minQuantity} shares`;
    case "sell": return `Sell at least ${obj.minQuantity} shares`;
    case "advance-time": return `Observe ${obj.bars} candles`;
    case "toggle-indicator": return `Enable ${obj.indicator}`;
    case "profit-target": return `Reach $${obj.minProfit} profit`;
    case "stop-loss": return `Cut losses above $${Math.abs(obj.maxLoss)}`;
    default: return "Complete objective";
  }
}

function objectiveIcon(obj: PracticeObjective): string {
  switch (obj.kind) {
    case "buy": return "📈";
    case "sell": return "📉";
    case "advance-time": return "⏳";
    case "toggle-indicator": return "📊";
    case "profit-target": return "💰";
    case "stop-loss": return "🛡️";
    default: return "🎯";
  }
}

function difficultyDisplay(difficulty: string | number) {
  if (typeof difficulty === "number") {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 400, damping: 15 }}
            className={cn(
              "text-sm",
              i < difficulty ? "text-amber-400" : "text-muted-foreground/20",
            )}
          >
            ★
          </motion.span>
        ))}
      </div>
    );
  }
  const colors = {
    beginner: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    intermediate: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    advanced: "bg-red-500/15 text-red-500 border-red-500/30",
  };
  return (
    <span className={cn(
      "rounded-full border px-3 py-1 text-xs font-bold",
      colors[difficulty as keyof typeof colors] ?? "bg-muted text-muted-foreground border-border",
    )}>
      {difficulty}
    </span>
  );
}

export function ChallengeBriefing({
  name,
  description,
  difficulty,
  xpReward,
  objectives,
  onStart,
}: ChallengeBriefingProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-8 px-4 max-w-md mx-auto">
      {/* Mission icon */}
      <motion.div
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <Target className="h-8 w-8 text-primary" />
      </motion.div>

      {/* Title */}
      <motion.h1
        className="text-2xl font-bold text-center"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {name}
      </motion.h1>

      {/* Difficulty + XP */}
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        {difficultyDisplay(difficulty)}
        <motion.span
          className="flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[11px] font-bold text-primary"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 400, damping: 15 }}
        >
          <Zap className="h-3 w-3" />
          +{xpReward} XP
        </motion.span>
      </motion.div>

      {/* Description — narrative box */}
      <motion.div
        className="w-full rounded-xl border border-border/50 bg-card/50 p-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <p className="text-xs font-bold text-muted-foreground mb-2">
          Mission Briefing
        </p>
        <p className="text-sm text-foreground/90 leading-relaxed">
          {description}
        </p>
      </motion.div>

      {/* Objectives — checklist style */}
      <motion.div
        className="w-full rounded-xl border border-border/50 bg-card p-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <p className="text-xs font-bold text-muted-foreground mb-3">
          Objectives
        </p>
        <div className="flex flex-col gap-2.5">
          {objectives.map((obj, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2.5"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
            >
              <span className="text-base">{objectiveIcon(obj)}</span>
              <span className="text-sm font-medium">{objectiveLabel(obj)}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick tip */}
      <motion.div
        className="w-full max-w-xs flex items-start gap-2 rounded-lg bg-card/30 px-3 py-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
      >
        <span className="text-xs mt-0.5">💡</span>
        <p className="text-xs text-muted-foreground/80 leading-relaxed">
          Use the play/pause controls to advance time. Buy low, sell high — watch for patterns!
        </p>
      </motion.div>

      {/* Start button — pulsing CTA */}
      <motion.button
        type="button"
        onClick={onStart}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="relative w-full max-w-xs rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-all hover:brightness-110"
      >
        {/* Pulse ring */}
        <motion.span
          className="absolute inset-0 rounded-xl border-2 border-primary"
          animate={{ scale: [1, 1.08], opacity: [0.5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
        />
        Start Mission
      </motion.button>
    </div>
  );
}
