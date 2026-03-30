"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Lock, ChevronRight } from "lucide-react";
import type { ScenarioDefinition, ScenarioResult } from "@/types/challenges";

interface ScenarioCardProps {
  scenario: ScenarioDefinition;
  bestResult?: ScenarioResult;
  playerLevel: number;
  index: number;
  onSelect: () => void;
}

const GRADE_CONFIG = {
  S: { bg: "bg-amber-400/15", text: "text-amber-400", border: "border-amber-400/30", glow: "shadow-[0_0_12px_rgba(251,191,36,0.2)]" },
  A: { bg: "bg-green-400/15", text: "text-green-400", border: "border-green-400/30", glow: "shadow-[0_0_10px_rgba(52,211,153,0.15)]" },
  B: { bg: "bg-blue-400/15", text: "text-blue-400", border: "border-blue-400/30", glow: "" },
  C: { bg: "bg-muted/30", text: "text-muted-foreground", border: "border-border", glow: "" },
};

const DIFFICULTY_LABEL = ["", "Easy", "Normal", "Hard", "Expert", "Legendary"];

export function ScenarioCard({
  scenario,
  bestResult,
  playerLevel,
  index,
  onSelect,
}: ScenarioCardProps) {
  const isLocked = playerLevel < scenario.unlockLevel;
  const gradeConfig = bestResult ? GRADE_CONFIG[bestResult.grade] : null;

  return (
    <motion.button
      type="button"
      onClick={isLocked ? undefined : onSelect}
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 300, damping: 25 }}
      whileHover={isLocked ? undefined : { scale: 1.02 }}
      whileTap={isLocked ? undefined : { scale: 0.98 }}
      disabled={isLocked}
      className={cn(
        "relative w-full rounded-xl border-2 p-4 text-left transition-all overflow-hidden",
        isLocked
          ? "border-border/50 bg-muted/10 cursor-not-allowed"
          : gradeConfig
            ? `${gradeConfig.border} ${gradeConfig.glow} hover:bg-accent/30 cursor-pointer`
            : "border-border hover:border-primary/50 hover:bg-accent/30 cursor-pointer",
      )}
    >
      {/* Lock overlay */}
      {isLocked && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/70 backdrop-blur-[3px] z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex flex-col items-center gap-1.5">
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Lock className="h-6 w-6 text-muted-foreground" />
            </motion.div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Level {scenario.unlockLevel}
            </span>
          </div>
        </motion.div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <h3 className="text-sm font-black truncate">{scenario.name}</h3>
          <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">
            {scenario.subtitle}
          </p>

          {/* Difficulty stars + label */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.08 + i * 0.05 + 0.2 }}
                  className={cn(
                    "text-xs",
                    i < scenario.difficulty ? "text-amber-400" : "text-muted-foreground/20",
                  )}
                >
                  ★
                </motion.span>
              ))}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              {DIFFICULTY_LABEL[scenario.difficulty]}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">
              +{scenario.xpReward} XP
            </span>
            {bestResult && (
              <span className={cn(
                "rounded-full px-2 py-0.5 text-[9px] font-bold tabular-nums",
                bestResult.pnl >= 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400",
              )}>
                Best: {bestResult.pnl >= 0 ? "+" : ""}{bestResult.pnl.toFixed(0)}
              </span>
            )}
          </div>
        </div>

        {/* Grade badge or arrow */}
        <div className="shrink-0 flex flex-col items-center gap-1">
          {bestResult ? (
            <motion.div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl border-2 text-xl font-black",
                gradeConfig?.border,
                gradeConfig?.bg,
                gradeConfig?.text,
                bestResult.grade === "S" && "shimmer-gold",
              )}
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: index * 0.08 + 0.3 }}
            >
              {bestResult.grade}
            </motion.div>
          ) : !isLocked ? (
            <ChevronRight className="h-5 w-5 text-muted-foreground mt-3" />
          ) : null}
        </div>
      </div>

      <p className="mt-2 text-[11px] text-muted-foreground/80 line-clamp-2 leading-relaxed">
        {scenario.description}
      </p>
    </motion.button>
  );
}
