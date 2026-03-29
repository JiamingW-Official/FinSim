"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Flame,
  Brain,
  TrendingUp,
  Check,
  Zap,
  Calculator,
  History,
  Search,
  Trophy,
  BarChart2,
  PieChart,
  Globe,
  Coins,
  BookMarked,
  ShieldCheck,
  Layers,
  DollarSign,
  BarChart,
  Clock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useLearnStore } from "@/stores/learn-store";
import { useGameStore } from "@/stores/game-store";
import { useFlashcardStore } from "@/stores/flashcard-store";
import { usePredictionStore } from "@/stores/prediction-store";
import { HeartsDisplay } from "@/components/learn/HeartsDisplay";
import { DailyGoal } from "@/components/learn/DailyGoal";
import { SkillPath } from "@/components/learn/SkillPath";
import { FlashcardGame } from "@/components/learn/FlashcardGame";
import { PredictionGame } from "@/components/learn/PredictionGame";
import { ScenarioSimulator } from "@/components/learn/ScenarioSimulator";
import { CompoundCalculator } from "@/components/learn/CompoundCalculator";
import { UNITS } from "@/data/lessons";

// Map unit icon string to lucide-react component
const UNIT_ICON_MAP: Record<string, React.ElementType> = {
  BookOpen: BookOpen,
  TrendingUp: TrendingUp,
  BarChart2: BarChart2,
  ShieldCheck: ShieldCheck,
  BarChart: BarChart,
  DollarSign: DollarSign,
  BookMarked: BookMarked,
  Layers: Layers,
  Globe: Globe,
  Coins: Coins,
  PieChart: PieChart,
  Brain: Brain,
  GraduationCap: GraduationCap,
  Zap: Zap,
};

function getUnitIcon(iconName: string): React.ElementType {
  return UNIT_ICON_MAP[iconName] ?? BookOpen;
}

type DifficultyFilter = "all" | "beginner" | "intermediate" | "advanced";

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  intermediate: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  advanced: "text-red-500 bg-red-500/10 border-red-500/20",
};

// Learning path groupings
const LEARNING_PATHS = [
  {
    label: "Beginner Path",
    color: "emerald",
    unitIds: ["basics", "orders", "risk"],
  },
  {
    label: "Intermediate Path",
    color: "amber",
    unitIds: ["indicators", "fundamentals", "personal-finance", "personal-finance-fundamentals", "options-strategies-practice"],
  },
  {
    label: "Advanced Path",
    color: "red",
    unitIds: ["macro-trading", "crypto-trading", "advanced-technical-analysis", "portfolio-construction"],
  },
];

export default function LearnPage() {
  const completedLessons = useLearnStore((s) => s.completedLessons);
  const learningStreak = useLearnStore((s) => s.learningStreak);
  const xp = useGameStore((s) => s.xp);
  const flashcardDaily = useFlashcardStore((s) => s.dailyCardsReviewed);
  const flashcardLastDate = useFlashcardStore((s) => s.lastReviewDate);
  const overallMastery = useFlashcardStore((s) => s.getOverallMastery());
  const predictionStreak = usePredictionStore((s) => s.currentStreak);
  const predictionAccuracy = usePredictionStore((s) => s.getAccuracy());
  const predictionDaily = usePredictionStore((s) => s.dailyPlayed);
  const predictionLastDate = usePredictionStore((s) => s.lastPlayDate);

  const [activeGame, setActiveGame] = useState<"flashcards" | "prediction" | null>(null);
  const [activeTool, setActiveTool] = useState<"scenario" | "calculator" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [activeTab, setActiveTab] = useState<"path" | "units" | "progress">("path");

  const todayStr = new Date().toISOString().slice(0, 10);
  const flashcardToday = flashcardLastDate === todayStr ? flashcardDaily : 0;
  const predictionToday = predictionLastDate === todayStr ? predictionDaily : 0;

  // Aggregate stats
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

  // Find recommended next lesson (first incomplete lesson globally)
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

  // Filtered units for unit browser
  const filteredUnits = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return UNITS.filter((unit) => {
      // Filter lessons inside the unit
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
      return matchingLessons.length > 0;
    });
  }, [searchQuery, difficultyFilter]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header — quiet zone, generous vertical space */}
      <div className="flex items-center justify-between border-b border-border bg-card px-5 py-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <GraduationCap className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-medium">Trading Academy</h1>
            <p className="text-[11px] text-muted-foreground">
              {completedCount}/{totalLessons} lessons complete
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {learningStreak > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-[11px] font-medium text-amber-500">{learningStreak}</span>
            </div>
          )}
          <DailyGoal compact />
          <HeartsDisplay compact />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-border bg-card px-4 shrink-0">
        {(["path", "units", "progress"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-[11px] font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "path" ? "Learning Path" : tab === "units" ? "All Units" : "My Progress"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-2xl space-y-4">

          {/* ============ LEARNING PATH TAB ============ */}
          {activeTab === "path" && (
            <>
              {/* === DOMINANT "Up Next" hero card === */}
              {recommendedLesson ? (
                <div className="rounded-xl border-2 border-primary/40 bg-card p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="relative flex h-3 w-3 items-center justify-center">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-[11px] font-medium text-primary uppercase tracking-widest">Up Next</span>
                  </div>
                  <p className="text-xl font-bold mb-1">{recommendedLesson.lesson.title}</p>
                  <p className="text-base font-normal text-muted-foreground mb-4">{recommendedLesson.lesson.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6">
                    <span className="font-medium">{recommendedLesson.unit.title}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{recommendedLesson.lesson.duration ?? 10} min</span>
                    <span className="flex items-center gap-1 text-primary font-semibold"><Zap className="h-3 w-3" />+{recommendedLesson.lesson.xpReward} XP</span>
                  </div>
                  <Link
                    href={`/learn/${recommendedLesson.lesson.id}`}
                    className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary h-12 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {completedCount > 0 ? "Continue Learning" : "Begin Your Journey"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-emerald-500/40 bg-card p-8 text-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
                  <p className="text-xl font-bold mb-2">All Lessons Complete</p>
                  <p className="text-base text-muted-foreground">You have finished every lesson. Try a practice trade to reinforce your skills.</p>
                </div>
              )}

              {/* Learning journey dots — prominent */}
              {(() => {
                const progressPct = totalLessons > 0 ? completedCount / totalLessons : 0;
                const currentStep = progressPct >= 0.8 ? 2 : progressPct >= 0.1 ? 1 : 0;
                const steps = [
                  { label: "Learn", href: "/learn" },
                  { label: "Practice", href: "/trade" },
                  { label: "Review", href: "/portfolio" },
                ];
                return (
                  <div className="flex items-center justify-center gap-0 py-3">
                    {steps.map((step, idx) => {
                      const isActive = idx === currentStep;
                      const isDone = idx < currentStep;
                      return (
                        <div key={step.label} className="flex items-center gap-0">
                          <Link href={step.href} className="flex flex-col items-center gap-1">
                            <div className={`relative flex items-center justify-center rounded-full transition-transform ${
                              isActive ? "h-5 w-5 scale-125 ring-2 ring-primary ring-offset-2 ring-offset-background" : "h-4 w-4"
                            } ${
                              isActive ? "bg-primary" : isDone ? "bg-emerald-400" : "bg-muted-foreground/20"
                            }`}>
                              {isActive && (
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-30" />
                              )}
                              {isDone && <Check className="h-2.5 w-2.5 text-white" />}
                            </div>
                            <span className={`text-xs font-normal ${
                              isActive ? "text-primary" : isDone ? "text-emerald-400" : "text-muted-foreground"
                            }`}>{step.label}</span>
                          </Link>
                          {idx < steps.length - 1 && (
                            <div className={`w-12 h-0.5 mx-3 rounded-full ${
                              idx < currentStep ? "bg-emerald-400" : "bg-muted-foreground/15"
                            }`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Inline stats as a single text line */}
              <p className="text-xs text-muted-foreground text-center">
                {completedCount}/{totalLessons} lessons
                {" \u00b7 "}
                {xp.toLocaleString()} XP
                {learningStreak > 0 && <>{" \u00b7 "}{learningStreak}-day streak</>}
              </p>

              {/* === Large visual buffer === */}
              <div className="mb-10" />

              {/* Learning path sections — compact catalog */}
              {(() => {
                let foundNextIncomplete = false;
                return LEARNING_PATHS.map((path) => {
                  const pathUnits = UNITS.filter((u) => path.unitIds.includes(u.id));
                  const pathLessons = pathUnits.flatMap((u) => u.lessons);
                  const pathCompleted = pathLessons.filter((l) => completedLessons.includes(l.id)).length;
                  const pathDone = pathCompleted === pathLessons.length && pathLessons.length > 0;
                  const isNextIncomplete = !pathDone && !foundNextIncomplete;
                  if (isNextIncomplete) foundNextIncomplete = true;
                  const pathPct = pathLessons.length > 0 ? Math.round((pathCompleted / pathLessons.length) * 100) : 0;
                  const barColorMap: Record<string, string> = {
                    emerald: "bg-emerald-500",
                    amber: "bg-amber-500",
                    red: "bg-red-500",
                  };
                  return (
                    <div key={path.label} className={`rounded-lg border bg-card p-3 transition-colors ${
                      isNextIncomplete ? "border-primary hover:border-primary/80" : pathDone ? "border-emerald-500/30 opacity-60" : "border-border hover:border-primary/50"
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {pathDone && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                          <span className="text-sm font-semibold">{path.label}</span>
                          {isNextIncomplete && <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">Current</span>}
                        </div>
                        <span className="text-[11px] font-normal tabular-nums text-muted-foreground">
                          {pathCompleted}/{pathLessons.length}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted/20">
                        <div
                          className={`h-full rounded-full transition-all ${barColorMap[path.color]}`}
                          style={{ width: `${pathPct}%` }}
                        />
                      </div>
                    </div>
                  );
                });
              })()}

              {/* Practice & Tools — compact row */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setActiveGame("flashcards")}
                  className="flex items-center gap-2 rounded-md border border-orange-500/20 bg-orange-500/5 p-2 text-left transition-colors hover:bg-orange-500/10"
                >
                  <Brain className="h-4 w-4 text-orange-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-medium text-orange-400 block">Flashcards</span>
                    <span className="text-[10px] text-muted-foreground">{flashcardToday}/10 today</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGame("prediction")}
                  className="flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/5 p-2 text-left transition-colors hover:bg-emerald-500/10"
                >
                  <TrendingUp className="h-4 w-4 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-medium text-emerald-400 block">Prediction</span>
                    <span className="text-[10px] text-muted-foreground">{predictionToday > 0 ? `${predictionToday} today` : "Start playing"}</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTool(activeTool === "scenario" ? null : "scenario")}
                  className="flex items-center gap-2 rounded-md border border-border bg-muted/20 p-2 text-left transition-colors hover:bg-muted/30"
                >
                  <History className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-medium block">Scenarios</span>
                    <span className="text-[10px] text-muted-foreground">Historical crashes</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTool(activeTool === "calculator" ? null : "calculator")}
                  className="flex items-center gap-2 rounded-md border border-border bg-muted/20 p-2 text-left transition-colors hover:bg-muted/30"
                >
                  <Calculator className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-medium block">Calculator</span>
                    <span className="text-[10px] text-muted-foreground">Compound interest</span>
                  </div>
                </button>
              </div>

              <AnimatePresence>
                {activeTool && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-lg border border-border bg-card/50 p-4">
                      {activeTool === "scenario" ? <ScenarioSimulator /> : <CompoundCalculator />}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* ============ ALL UNITS TAB ============ */}
          {activeTab === "units" && (
            <>
              {/* Search + filter row */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card pl-8 pr-3 py-1.5 text-[12px] placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
                {(["all", "beginner", "intermediate", "advanced"] as DifficultyFilter[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficultyFilter(d)}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium border transition-colors capitalize shrink-0 ${
                      difficultyFilter === d
                        ? d === "all"
                          ? "bg-primary/15 text-primary border-primary/30"
                          : DIFFICULTY_COLORS[d]
                        : "bg-muted/10 text-muted-foreground border-border hover:bg-muted/20"
                    }`}
                  >
                    {d === "all" ? "All" : d.slice(0, 3)}
                  </button>
                ))}
              </div>

              {/* Crushed unit grid — small catalog feel */}
              {filteredUnits.length === 0 ? (
                <div className="rounded-md border border-border bg-card/50 px-4 py-6 text-center">
                  <Search className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-[11px] text-muted-foreground">No units match</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {filteredUnits.map((unit, i) => {
                    const isUnlocked = i === 0 || UNITS.slice(0, UNITS.indexOf(unit)).every((u) =>
                      u.lessons.every((l) => completedLessons.includes(l.id))
                    );
                    const unitCompletedCount = unit.lessons.filter((l) => completedLessons.includes(l.id)).length;
                    const isComplete = unitCompletedCount === unit.lessons.length;
                    const unitPct = unit.lessons.length > 0 ? Math.round((unitCompletedCount / unit.lessons.length) * 100) : 0;
                    const UnitIconComp = getUnitIcon(unit.icon);

                    return (
                      <div
                        key={unit.id}
                        className={`rounded-md border bg-card p-2 transition-colors cursor-pointer ${
                          isComplete ? "border-emerald-400/20 opacity-60" : isUnlocked ? "border-border hover:border-primary/50" : "border-border/40 opacity-40"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <div
                            className="flex h-5 w-5 items-center justify-center rounded shrink-0"
                            style={{ background: `${unit.color}12`, border: `1px solid ${unit.color}25` }}
                          >
                            {isComplete ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <UnitIconComp className="h-3 w-3" style={{ color: unit.color }} />
                            )}
                          </div>
                          <span className="text-xs font-medium truncate">{unit.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 h-1 rounded-full bg-muted/30 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${unitPct}%`, background: isComplete ? "#34d399" : unit.color }}
                            />
                          </div>
                          <span className="text-[10px] tabular-nums text-muted-foreground">{unitCompletedCount}/{unit.lessons.length}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ============ MY PROGRESS TAB ============ */}
          {activeTab === "progress" && (
            <>
              {/* Empty state when nothing completed */}
              {completedCount === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <GraduationCap className="h-8 w-8 text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No progress yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Complete your first lesson to start tracking progress</p>
                </div>
              )}

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-muted/30 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-4 w-4 text-amber-400" />
                    <span className="text-[11px] font-normal text-muted-foreground/70">Lessons</span>
                  </div>
                  <p className="text-xl font-bold">{completedCount}</p>
                  <p className="text-[11px] font-normal text-muted-foreground">of {totalLessons} completed</p>
                </div>
                <div className="rounded-md bg-muted/30 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-[11px] font-normal text-muted-foreground/70">XP Earned</span>
                  </div>
                  <p className="text-xl font-normal tabular-nums">{xp.toLocaleString()}</p>
                  <p className="text-[11px] font-normal text-muted-foreground">total experience</p>
                </div>
                <div className="rounded-md bg-muted/30 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="h-4 w-4 text-amber-500" />
                    <span className="text-[11px] font-normal text-muted-foreground/70">Streak</span>
                  </div>
                  <p className="text-xl font-normal tabular-nums">{learningStreak}</p>
                  <p className="text-[11px] font-normal text-muted-foreground">days in a row</p>
                </div>
                <div className="rounded-md bg-muted/30 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-orange-400" />
                    <span className="text-[11px] font-normal text-muted-foreground/70">Mastery</span>
                  </div>
                  <p className="text-xl font-normal tabular-nums">{overallMastery}%</p>
                  <p className="text-[11px] font-normal text-muted-foreground">flashcard mastery</p>
                </div>
              </div>

              {/* Unit-by-unit breakdown */}
              <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <BarChart2 className="h-3 w-3" />
                Unit Breakdown
              </h3>
              <div className="space-y-2">
                {UNITS.map((unit) => {
                  const done = unit.lessons.filter((l) => completedLessons.includes(l.id)).length;
                  const pct = unit.lessons.length > 0 ? Math.round((done / unit.lessons.length) * 100) : 0;
                  const UnitIconComp = getUnitIcon(unit.icon);
                  return (
                    <div key={unit.id} className="flex items-center gap-3 rounded-md border border-border/30 px-3 py-2">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-md shrink-0"
                        style={{ background: `${unit.color}12`, border: `1px solid ${unit.color}25` }}
                      >
                        <UnitIconComp className="h-3.5 w-3.5" style={{ color: unit.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-medium truncate">{unit.title}</span>
                          <span className="text-[11px] text-muted-foreground ml-2 shrink-0">{done}/{unit.lessons.length}</span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-muted/30 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: unit.color }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-normal tabular-nums text-muted-foreground shrink-0 w-8 text-right">
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Full skill tree below */}
              <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <GraduationCap className="h-3 w-3" />
                Skill Tree
              </h3>
              <SkillPath />
            </>
          )}
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
              className="w-full max-w-md rounded-xl border border-border bg-card shadow-sm overflow-hidden"
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
