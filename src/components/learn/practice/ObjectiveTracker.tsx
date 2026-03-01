"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { soundEngine } from "@/services/audio/sound-engine";
import { useEffect, useRef } from "react";
import type { PracticeObjective } from "@/data/lessons/types";

interface ObjectiveTrackerProps {
  objectives: PracticeObjective[];
  completedObjectives: boolean[];
  allComplete: boolean;
  onContinue: () => void;
}

function objectiveLabel(obj: PracticeObjective): string {
  switch (obj.kind) {
    case "buy":
      return `Buy at least ${obj.minQuantity} share${obj.minQuantity > 1 ? "s" : ""}`;
    case "sell":
      return `Sell at least ${obj.minQuantity} share${obj.minQuantity > 1 ? "s" : ""}`;
    case "advance-time":
      return `Advance ${obj.bars} bar${obj.bars > 1 ? "s" : ""} forward`;
    case "toggle-indicator":
      return `Toggle on ${obj.indicator.toUpperCase()}`;
    default:
      return "Complete objective";
  }
}

export function ObjectiveTracker({
  objectives,
  completedObjectives,
  allComplete,
  onContinue,
}: ObjectiveTrackerProps) {
  const prevCompleted = useRef(completedObjectives.map(() => false));

  // Play sound when an objective newly completes
  useEffect(() => {
    completedObjectives.forEach((done, i) => {
      if (done && !prevCompleted.current[i]) {
        soundEngine.playCorrect();
      }
    });
    prevCompleted.current = [...completedObjectives];
  }, [completedObjectives]);

  return (
    <div className="space-y-2">
      {/* Objectives list */}
      <div className="flex flex-wrap items-center gap-2">
        {objectives.map((obj, i) => {
          const done = completedObjectives[i];
          return (
            <motion.div
              key={i}
              layout
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                done
                  ? "bg-[#10b981]/10 text-[#10b981]"
                  : "bg-muted/30 text-muted-foreground",
              )}
            >
              <AnimatePresence mode="wait">
                {done ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    <Check className="h-3 w-3" />
                  </motion.span>
                ) : (
                  <motion.span key="target" initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}>
                    <Target className="h-3 w-3" />
                  </motion.span>
                )}
              </AnimatePresence>
              <span className={done ? "line-through opacity-70" : ""}>
                {objectiveLabel(obj)}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Success banner */}
      <AnimatePresence>
        {allComplete && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 px-3 py-2">
              <div className="flex items-center gap-2">
                <motion.div
                  initial={{ rotate: -30, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 12, delay: 0.1 }}
                  className="text-sm"
                >
                  ✓
                </motion.div>
                <span className="text-xs font-semibold text-[#10b981]">
                  All objectives complete!
                </span>
              </div>
              <button
                type="button"
                onClick={onContinue}
                className="rounded-lg bg-[#10b981] px-3 py-1.5 text-xs font-bold text-white transition-all hover:brightness-110 active:scale-[0.97]"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
