"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronUp, Check, Activity, Calculator, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SimulatedTrade } from "./SimulatedTrade";
import { OptionsPricingExercise } from "./OptionsPricingExercise";
import { TechnicalAnalysisQuiz } from "./TechnicalAnalysisQuiz";

// ─── Storage keys ─────────────────────────────────────────────────────────────

const SIMTRADE_KEY   = "finsim-exercise-simtrade-v1";
const BSPRICING_KEY  = "finsim-exercise-bspricing-v1";
const TAQUIZ_KEY     = "finsim-exercise-taquiz-v1";

// ─── Exercise metadata ────────────────────────────────────────────────────────

type ExerciseId = "simulated-trade" | "options-pricing" | "ta-quiz";

interface ExerciseDef {
  id: ExerciseId;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedMin: number;
  storageKey: string;
}

const EXERCISES: ExerciseDef[] = [
  {
    id: "simulated-trade",
    title: "Simulated Trade",
    description: "Make Buy / Sell / Wait decisions bar by bar. Learn entry and exit timing from real chart patterns.",
    difficulty: "Beginner",
    estimatedMin: 5,
    storageKey: SIMTRADE_KEY,
  },
  {
    id: "ta-quiz",
    title: "Pattern Recognition",
    description: "Identify candlestick and chart patterns from pure SVG charts. 10 questions, 30 seconds each.",
    difficulty: "Intermediate",
    estimatedMin: 5,
    storageKey: TAQUIZ_KEY,
  },
  {
    id: "options-pricing",
    title: "Black-Scholes Drill",
    description: "Estimate call option prices before seeing the full Black-Scholes calculation. 5 rounds of varying parameters.",
    difficulty: "Advanced",
    estimatedMin: 8,
    storageKey: BSPRICING_KEY,
  },
];

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner:     "text-green-400 bg-green-500/10 border-green-500/20",
  Intermediate: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Advanced:     "text-red-400 bg-red-500/10 border-red-500/20",
};

function ExerciseIcon({ id }: { id: ExerciseId }) {
  if (id === "simulated-trade")  return <Activity className="h-3.5 w-3.5 text-muted-foreground" />;
  if (id === "options-pricing")  return <Calculator className="h-3.5 w-3.5 text-muted-foreground" />;
  return <BarChart2 className="h-3.5 w-3.5 text-muted-foreground" />;
}

// ─── Hook: completion state from localStorage ─────────────────────────────────

function useCompletionState(): Record<ExerciseId, boolean> {
  const [state, setState] = useState<Record<ExerciseId, boolean>>({
    "simulated-trade": false,
    "options-pricing": false,
    "ta-quiz":         false,
  });

  useEffect(() => {
    function read() {
      const result: Record<ExerciseId, boolean> = {
        "simulated-trade": false,
        "options-pricing": false,
        "ta-quiz":         false,
      };
      try {
        const simData = JSON.parse(localStorage.getItem(SIMTRADE_KEY) ?? "null");
        if (simData && typeof simData === "object") result["simulated-trade"] = true;
        const bsData  = JSON.parse(localStorage.getItem(BSPRICING_KEY) ?? "null");
        if (bsData && typeof bsData === "object" && bsData.completedAt) result["options-pricing"] = true;
        const taData  = JSON.parse(localStorage.getItem(TAQUIZ_KEY) ?? "null");
        if (taData && typeof taData === "object" && taData.completedAt) result["ta-quiz"] = true;
      } catch { /* ignore */ }
      return result;
    }
    setState(read());

    // Re-read on storage events (cross-tab sync)
    const handler = () => setState(read());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return state;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PracticeExercises() {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<ExerciseId | null>(null);
  const completion = useCompletionState();

  function handleComplete(id: ExerciseId) {
    // Force re-read from localStorage (the exercise component has already written it)
    setActiveId(null);
    // Re-mount completion state by toggling a dummy state (storage event fires for other tabs but not self)
    window.dispatchEvent(new Event("storage"));
  }

  return (
    <div className="mt-6">
      {/* Section header — collapsible */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-border/50 bg-card px-3 py-2.5 text-left transition-colors hover:bg-accent/30"
      >
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">Practice Exercises</span>
          <span className="rounded-full border border-border/50 bg-muted px-1.5 py-px text-[9px] font-mono text-muted-foreground">
            {Object.values(completion).filter(Boolean).length}/{EXERCISES.length} done
          </span>
        </div>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-3">
              {/* Exercise cards */}
              {!activeId && (
                <div className="space-y-2">
                  {EXERCISES.map((ex) => {
                    const done = completion[ex.id];
                    return (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => setActiveId(ex.id)}
                        className="group flex w-full items-start gap-3 rounded-lg border border-border/50 bg-card p-3 text-left transition-colors hover:border-border hover:bg-accent/30"
                      >
                        {/* Icon */}
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                          <ExerciseIcon id={ex.id} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-semibold">{ex.title}</span>
                            <span className={cn(
                              "rounded border px-1.5 py-px text-[9px] font-medium",
                              DIFFICULTY_COLOR[ex.difficulty]
                            )}>
                              {ex.difficulty}
                            </span>
                            {done && (
                              <span className="flex items-center gap-0.5 rounded border border-green-500/30 bg-green-500/10 px-1.5 py-px text-[9px] font-medium text-green-400">
                                <Check className="h-2.5 w-2.5" />
                                Done
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-[10px] text-muted-foreground leading-relaxed">{ex.description}</p>
                          <p className="mt-1 text-[9px] text-muted-foreground">~{ex.estimatedMin} min</p>
                        </div>

                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Active exercise panel */}
              <AnimatePresence>
                {activeId && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="rounded-lg border border-border/50 bg-card p-4"
                  >
                    {/* Back button */}
                    <button
                      type="button"
                      onClick={() => setActiveId(null)}
                      className="mb-3 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronRight className="h-3 w-3 rotate-180" />
                      Back to exercises
                    </button>

                    {/* Exercise content */}
                    {activeId === "simulated-trade" && (
                      <SimulatedTrade onComplete={() => handleComplete("simulated-trade")} />
                    )}
                    {activeId === "options-pricing" && (
                      <OptionsPricingExercise onComplete={() => handleComplete("options-pricing")} />
                    )}
                    {activeId === "ta-quiz" && (
                      <TechnicalAnalysisQuiz onComplete={() => handleComplete("ta-quiz")} />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
