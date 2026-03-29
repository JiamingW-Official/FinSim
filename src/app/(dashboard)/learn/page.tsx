"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  BookOpen,
  Brain,
  TrendingUp,
  Check,
  Search,
  BarChart2,
  PieChart,
  Globe,
  Coins,
  BookMarked,
  ShieldCheck,
  Layers,
  DollarSign,
  BarChart,
  ArrowRight,
  GraduationCap,
  Zap,
  ChevronDown,
} from "lucide-react";
import { useLearnStore } from "@/stores/learn-store";
import { useFlashcardStore } from "@/stores/flashcard-store";
import { usePredictionStore } from "@/stores/prediction-store";
import { FlashcardGame } from "@/components/learn/FlashcardGame";
import { PredictionGame } from "@/components/learn/PredictionGame";
import { ScenarioSimulator } from "@/components/learn/ScenarioSimulator";
import { CompoundCalculator } from "@/components/learn/CompoundCalculator";
import { UNITS } from "@/data/lessons";

const UNIT_ICON_MAP: Record<string, React.ElementType> = {
  BookOpen,
  TrendingUp,
  BarChart2,
  ShieldCheck,
  BarChart,
  DollarSign,
  BookMarked,
  Layers,
  Globe,
  Coins,
  PieChart,
  Brain,
  GraduationCap,
  Zap,
};

function getUnitIcon(iconName: string): React.ElementType {
  return UNIT_ICON_MAP[iconName] ?? BookOpen;
}

type DifficultyFilter = "all" | "beginner" | "intermediate" | "advanced";

/* ── SVG Progress Arc ── */
function ProgressArc({ completed, total }: { completed: number; total: number }) {
  const size = 120;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = total > 0 ? completed / total : 0;
  const offset = circumference * (1 - pct);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted/30"
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-foreground/60 transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-light tabular-nums tracking-tight">{completed}</span>
        <span className="text-[10px] text-muted-foreground">of {total}</span>
      </div>
    </div>
  );
}

const INITIAL_VISIBLE = 4;

export default function LearnPage() {
  const completedLessons = useLearnStore((s) => s.completedLessons);
  const flashcardDaily = useFlashcardStore((s) => s.dailyCardsReviewed);
  const flashcardLastDate = useFlashcardStore((s) => s.lastReviewDate);
  const predictionDaily = usePredictionStore((s) => s.dailyPlayed);
  const predictionLastDate = usePredictionStore((s) => s.lastPlayDate);

  const [activeGame, setActiveGame] = useState<"flashcards" | "prediction" | null>(null);
  const [activeTool, setActiveTool] = useState<"scenario" | "calculator" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  const todayStr = new Date().toISOString().slice(0, 10);
  const flashcardToday = flashcardLastDate === todayStr ? flashcardDaily : 0;
  const predictionToday = predictionLastDate === todayStr ? predictionDaily : 0;

  const totalLessons = useMemo(
    () => UNITS.reduce((acc, u) => acc + u.lessons.length, 0),
    []
  );

  const completedCount = useMemo(
    () =>
      UNITS.reduce(
        (acc, u) =>
          acc + u.lessons.filter((l) => completedLessons.includes(l.id)).length,
        0
      ),
    [completedLessons]
  );

  const recommendedLesson = useMemo(() => {
    for (const unit of UNITS) {
      for (const lesson of unit.lessons) {
        if (!completedLessons.includes(lesson.id)) {
          return { lesson, unit };
        }
      }
    }
    return null;
  }, [completedLessons]);

  const filteredUnits = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return UNITS.map((unit) => {
      const matchingLessons = unit.lessons.filter((lesson) => {
        const matchesSearch =
          !q ||
          lesson.title.toLowerCase().includes(q) ||
          lesson.description.toLowerCase().includes(q) ||
          unit.title.toLowerCase().includes(q);

        const matchesDifficulty =
          difficultyFilter === "all" ||
          (lesson.difficulty ?? "beginner") === difficultyFilter;

        return matchesSearch && matchesDifficulty;
      });
      return { ...unit, lessons: matchingLessons };
    }).filter((unit) => unit.lessons.length > 0);
  }, [searchQuery, difficultyFilter]);

  const isSearching = searchQuery.length > 0 || difficultyFilter !== "all";

  const toggleUnit = (unitId: string) => {
    setExpandedUnits((prev) => {
      const next = new Set(prev);
      if (next.has(unitId)) next.delete(unitId);
      else next.add(unitId);
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-5 py-6">

          {/* ── Hero: Progress arc + continue ── */}
          <div className="flex items-center gap-6 mb-8">
            <ProgressArc completed={completedCount} total={totalLessons} />
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-serif tracking-tight mb-1">Learn</h1>
              <p className="text-xs text-muted-foreground/70 leading-relaxed mb-3">
                {completedCount === 0
                  ? "Start your journey through finance fundamentals."
                  : `${totalLessons - completedCount} lessons remaining`}
              </p>
              {recommendedLesson && (
                <Link
                  href={`/learn/${recommendedLesson.lesson.id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
                >
                  {completedCount > 0 ? "Continue" : "Start learning"}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>

          {/* Search + filters */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-[220px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/50" />
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-border/30 bg-transparent pl-7 pr-2 py-1.5 text-xs placeholder:text-muted-foreground/40 focus:outline-none focus:border-border/60 transition-colors"
              />
            </div>
            <div className="flex items-center gap-0.5">
              {(["all", "beginner", "intermediate", "advanced"] as DifficultyFilter[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficultyFilter(d)}
                  className={`px-2 py-1 text-[11px] rounded transition-colors capitalize ${
                    difficultyFilter === d
                      ? "bg-foreground/5 text-foreground"
                      : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-foreground/[0.03]"
                  }`}
                >
                  {d === "all" ? "All" : d}
                </button>
              ))}
            </div>
          </div>

          {/* ── Unit list ── */}
          {filteredUnits.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">No lessons match your search.</p>
          ) : (
            <div className="space-y-1">
              {filteredUnits.map((unit, unitIdx) => {
                const unitCompletedCount = unit.lessons.filter((l) =>
                  completedLessons.includes(l.id)
                ).length;
                const UnitIconComp = getUnitIcon(unit.icon);
                const isExpanded = expandedUnits.has(unit.id) || isSearching;
                const visibleLessons = isExpanded
                  ? unit.lessons
                  : unit.lessons.slice(0, INITIAL_VISIBLE);
                const hiddenCount = unit.lessons.length - INITIAL_VISIBLE;
                const unitPct = unit.lessons.length > 0
                  ? Math.round((unitCompletedCount / unit.lessons.length) * 100)
                  : 0;

                return (
                  <div key={unit.id}>
                    {/* Divider between units */}
                    {unitIdx > 0 && (
                      <div className="h-px bg-border/15 my-4" />
                    )}

                    {/* Unit header with left accent */}
                    <div className="flex items-center gap-3 mb-2 pl-3 border-l-2 border-foreground/10">
                      <UnitIconComp className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-foreground">
                          {unit.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Thin unit progress bar */}
                        <div className="w-12 h-1 rounded-full bg-muted/30 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-foreground/20 transition-all duration-500"
                            style={{ width: `${unitPct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground/40 tabular-nums w-8 text-right">
                          {unitCompletedCount}/{unit.lessons.length}
                        </span>
                      </div>
                    </div>

                    {/* Lesson rows with subtle bg */}
                    <div className="rounded-lg bg-muted/[0.03] ml-1">
                      {visibleLessons.map((lesson) => {
                        const isCompleted = completedLessons.includes(lesson.id);

                        return (
                          <Link
                            key={lesson.id}
                            href={`/learn/${lesson.id}`}
                            className={`flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-muted/30 group ${
                              isCompleted ? "opacity-45" : ""
                            }`}
                          >
                            {/* Completion indicator */}
                            <div className="shrink-0">
                              {isCompleted ? (
                                <div className="h-4 w-4 rounded-full bg-foreground/15 flex items-center justify-center">
                                  <Check className="h-2.5 w-2.5 text-foreground/50" />
                                </div>
                              ) : (
                                <div className="h-4 w-4 rounded-full border border-border/40" />
                              )}
                            </div>

                            {/* Title + description */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{lesson.title}</p>
                              <p className="text-[11px] leading-relaxed text-muted-foreground/70 truncate mt-0.5">{lesson.description}</p>
                            </div>

                            {/* Duration */}
                            <span className="text-[11px] text-muted-foreground/30 tabular-nums shrink-0">
                              {lesson.duration ?? 10}m
                            </span>
                          </Link>
                        );
                      })}

                      {/* Show all / collapse toggle */}
                      {!isSearching && hiddenCount > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleUnit(unit.id)}
                          className="flex items-center gap-1.5 px-3 py-2 text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors w-full"
                        >
                          <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          {isExpanded
                            ? "Show less"
                            : `Show all ${unit.lessons.length} lessons`}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Practice tools */}
          <div className="mt-8 pt-6 border-t border-border/15">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/30 mb-3">Practice</p>
            <div className="flex items-center gap-2">
              {[
                { label: "Flashcards", action: () => setActiveGame("flashcards"), extra: flashcardToday > 0 ? `${flashcardToday}/10` : null },
                { label: "Predictions", action: () => setActiveGame("prediction"), extra: predictionToday > 0 ? `${predictionToday}` : null },
                { label: "Scenarios", action: () => setActiveTool(activeTool === "scenario" ? null : "scenario"), extra: null },
                { label: "Calculator", action: () => setActiveTool(activeTool === "calculator" ? null : "calculator"), extra: null },
              ].map(({ label, action, extra }) => (
                <button
                  key={label}
                  type="button"
                  onClick={action}
                  className="rounded-full border border-border/20 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-border/40 transition-colors"
                >
                  {label}
                  {extra && <span className="text-muted-foreground/40 ml-1">{extra}</span>}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {activeTool && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="overflow-hidden mt-4"
              >
                <div className="rounded-lg border border-border/20 p-4">
                  {activeTool === "scenario" ? <ScenarioSimulator /> : <CompoundCalculator />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* Game overlays */}
      <AnimatePresence>
        {activeGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setActiveGame(null)}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-md rounded-md border border-border bg-card shadow-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {activeGame === "flashcards" ? (
                <FlashcardGame onClose={() => setActiveGame(null)} />
              ) : (
                <PredictionGame onClose={() => setActiveGame(null)} />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
