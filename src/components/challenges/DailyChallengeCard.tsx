"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import type { DailyChallengeDefinition, DailyChallengeProgress } from "@/types/challenges";

interface DailyChallengeCardProps {
  definition: DailyChallengeDefinition;
  progress?: DailyChallengeProgress;
  index: number;
  onSelect: () => void;
}

const DIFFICULTY_CONFIG = {
  beginner: { bg: "bg-emerald-500/15", text: "text-emerald-500", glow: "shadow-[0_0_8px_rgba(16,185,129,0.15)]", label: "Beginner" },
  intermediate: { bg: "bg-amber-500/15", text: "text-amber-500", glow: "shadow-[0_0_8px_rgba(245,158,11,0.15)]", label: "Intermediate" },
  advanced: { bg: "bg-red-500/15", text: "text-red-500", glow: "shadow-[0_0_8px_rgba(239,68,68,0.15)]", label: "Advanced" },
};

export function DailyChallengeCard({
  definition,
  progress,
  index,
  onSelect,
}: DailyChallengeCardProps) {
  const isComplete = progress?.isComplete ?? false;
  const config = DIFFICULTY_CONFIG[definition.difficulty];

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.12, type: "spring", stiffness: 300, damping: 25 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative w-full rounded-xl border-2 p-4 text-left transition-all",
        isComplete
          ? "border-emerald-500/30 bg-emerald-500/5"
          : `border-border hover:border-primary/50 hover:bg-accent/30 ${config.glow}`,
        "cursor-pointer",
      )}
    >
      {/* Sparkle indicator for uncompleted */}
      {!isComplete && (
        <motion.div
          className="absolute -top-1.5 -right-1.5"
          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <Sparkles className="h-4 w-4 text-amber-400" />
        </motion.div>
      )}

      <div className="flex items-center gap-3">
        {/* Number badge */}
        <motion.div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl text-lg font-black shrink-0",
            isComplete
              ? "bg-emerald-500/10 text-emerald-500"
              : `${config.bg} ${config.text}`,
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.12 + 0.1, type: "spring", stiffness: 400, damping: 15 }}
        >
          {isComplete ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <span>{index + 1}</span>
          )}
        </motion.div>

        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black truncate">{definition.name}</h3>
          </div>

          <p className="text-[11px] text-muted-foreground line-clamp-1">
            {definition.description}
          </p>

          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn(
              "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest",
              config.bg, config.text,
            )}>
              {config.label}
            </span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">
              +{definition.xpReward} XP
            </span>
          </div>
        </div>

        {/* Arrow or result */}
        <div className="shrink-0">
          {isComplete && progress?.finalPnL != null ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className={cn(
                "rounded-lg px-2 py-1 text-[11px] font-bold tabular-nums",
                progress.finalPnL >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400",
              )}
            >
              {progress.finalPnL >= 0 ? "+" : ""}{progress.finalPnL.toFixed(0)}
            </motion.div>
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
    </motion.button>
  );
}
