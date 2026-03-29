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

  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3 shrink-0">
        <div>
          <h1 className="text-sm font-medium">Learn</h1>
          <p className="text-xs text-muted-foreground">
            {completedCount} of {totalLessons} lessons
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Overall progress — shown once, thin */}
          <div className="flex items-center gap-2">
            <div className="w-24 h-1 rounded-full bg-muted/40 overflow-hidden">
              <div
                className="h-full rounded-full bg-muted-foreground/40 transition-colors"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[11px] text-muted-foreground tabular-nums">{progressPct}%</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-5 py-4">

          {/* Continue learning — subtle inline link */}
          {recommendedLesson && (
            <div className="mb-3">
              <Link
                href={`/learn/${recommendedLesson.lesson.id}`}
                className="group inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>
                  {completedCount > 0 ? "Continue" : "Start"} &mdash; {recommendedLesson.lesson.title}
                </span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          )}

          {/* Search + filters — compact inline row */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-[200px]">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/50" />
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded border border-border/20 bg-transparent pl-6 pr-2 py-1 text-xs placeholder:text-muted-foreground/40 focus:outline-none focus:border-border"
              />
            </div>
            <div className="flex items-center gap-1">
              {(["all", "beginner", "intermediate", "advanced"] as DifficultyFilter[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficultyFilter(d)}
                  className={`px-1.5 py-0.5 text-[11px] transition-colors capitalize ${
                    difficultyFilter === d
                      ? "text-foreground"
                      : "text-muted-foreground/50 hover:text-muted-foreground"
                  }`}
                >
                  {d === "all" ? "All" : d}
                </button>
              ))}
            </div>
          </div>

          {/* Unit list — book table-of-contents style */}
          {filteredUnits.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">No lessons match your search.</p>
          ) : (
            <div className="space-y-4">
              {filteredUnits.map((unit) => {
                const unitCompletedCount = unit.lessons.filter((l) =>
                  completedLessons.includes(l.id)
                ).length;
                const UnitIconComp = getUnitIcon(unit.icon);

                return (
                  <div key={unit.id}>
                    {/* Unit label — just text and spacing, no card */}
                    <div className="flex items-center gap-2 mb-2">
                      <UnitIconComp className="h-3.5 w-3.5 text-muted-foreground/40" />
                      <span className="text-xs text-muted-foreground">
                        {unit.title}
                      </span>
                      <span className="text-[11px] text-muted-foreground/40 tabular-nums ml-auto">
                        {unitCompletedCount}/{unit.lessons.length}
                      </span>
                    </div>

                    {/* Lesson rows */}
                    <div className="space-y-px">
                      {unit.lessons.map((lesson) => {
                        const isCompleted = completedLessons.includes(lesson.id);
                        const LessonIcon = UNIT_ICON_MAP[lesson.icon] ?? BookOpen;

                        return (
                          <Link
                            key={lesson.id}
                            href={`/learn/${lesson.id}`}
                            className={`flex items-center gap-3 rounded px-2 py-2 transition-colors hover:bg-muted/30 group ${
                              isCompleted ? "opacity-50" : ""
                            }`}
                          >
                            {/* Icon — tiny, muted */}
                            <div className="shrink-0">
                              {isCompleted ? (
                                <Check className="h-3.5 w-3.5 text-muted-foreground/40" />
                              ) : (
                                <LessonIcon className="h-3.5 w-3.5 text-muted-foreground/30" />
                              )}
                            </div>

                            {/* Title + description */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{lesson.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{lesson.description}</p>
                            </div>

                            {/* Right side — duration + progress dot */}
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] text-muted-foreground/40 tabular-nums">
                                {lesson.duration ?? 10}m
                              </span>
                              {isCompleted ? (
                                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                              ) : (
                                <div className="h-1.5 w-1.5 rounded-full border border-muted-foreground/20" />
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Practice tools — minimal footer section */}
          <div className="mt-4 pt-4 border-t border-border/20">
            <p className="text-[11px] text-muted-foreground/40 mb-3">Practice</p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setActiveGame("flashcards")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Flashcards{flashcardToday > 0 && <span className="text-muted-foreground/40 ml-1">{flashcardToday}/10</span>}
              </button>
              <button
                type="button"
                onClick={() => setActiveGame("prediction")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Predictions{predictionToday > 0 && <span className="text-muted-foreground/40 ml-1">{predictionToday} today</span>}
              </button>
              <button
                type="button"
                onClick={() => setActiveTool(activeTool === "scenario" ? null : "scenario")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Scenarios
              </button>
              <button
                type="button"
                onClick={() => setActiveTool(activeTool === "calculator" ? null : "calculator")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Calculator
              </button>
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
                <div className="rounded border border-border/20 p-4">
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
