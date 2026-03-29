"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronRight,
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
  Star,
  Filter,
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
  const lessonScores = useLearnStore((s) => s.lessonScores);
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

  // Recently completed lessons (last 3)
  const recentlyCompleted = useMemo(() => {
    const results: Array<{ lesson: (typeof UNITS)[0]["lessons"][0]; unit: (typeof UNITS)[0]; score: { grade: string; totalPoints: number } | null }> = [];
    // Walk in reverse through UNITS and their lessons to find completed ones
    const allLessons: Array<{ lesson: (typeof UNITS)[0]["lessons"][0]; unit: (typeof UNITS)[0] }> = [];
    for (const unit of UNITS) {
      for (const lesson of unit.lessons) {
        allLessons.push({ lesson, unit });
      }
    }
    // Return last N completed in the order they appear (no timestamp, so use completedLessons order)
    const completedInOrder = completedLessons.slice().reverse();
    for (const id of completedInOrder) {
      const found = allLessons.find((x) => x.lesson.id === id);
      if (found) {
        const score = lessonScores[id] ?? null;
        results.push({ ...found, score });
      }
      if (results.length >= 3) break;
    }
    return results;
  }, [completedLessons, lessonScores]);

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
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <GraduationCap className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold">Trading Academy</h1>
            <p className="text-[11px] text-muted-foreground">
              {completedCount}/{totalLessons} lessons complete
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {learningStreak > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-[11px] font-bold text-amber-500">{learningStreak}</span>
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
        <div className="mx-auto max-w-md space-y-4">

          {/* ============ LEARNING PATH TAB ============ */}
          {activeTab === "path" && (
            <>
              {/* Progress Overview Card */}
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold">Overall Progress</span>
                  <span className="text-xs text-muted-foreground">
                    {completedCount}/{totalLessons} lessons
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted/30 mb-3">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center gap-1 rounded-md bg-muted/20 py-2">
                    <Zap className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[11px] font-bold">{xp.toLocaleString()}</span>
                    <span className="text-[11px] text-muted-foreground">Total XP</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 rounded-md bg-muted/20 py-2">
                    <Flame className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-[11px] font-bold">{learningStreak}</span>
                    <span className="text-[11px] text-muted-foreground">Day Streak</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 rounded-md bg-muted/20 py-2">
                    <Trophy className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-[11px] font-bold">{completedCount}</span>
                    <span className="text-[11px] text-muted-foreground">Completed</span>
                  </div>
                </div>
              </div>

              {/* Recommended next lesson */}
              {recommendedLesson && (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <ChevronRight className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wide">Up Next</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold">{recommendedLesson.lesson.title}</p>
                      <p className="text-[11px] text-muted-foreground">{recommendedLesson.unit.title}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Zap className="h-3 w-3 text-primary" />
                      <span className="text-xs font-bold text-primary">+{recommendedLesson.lesson.xpReward} XP</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Learning path sections */}
              {LEARNING_PATHS.map((path) => {
                const pathUnits = UNITS.filter((u) => path.unitIds.includes(u.id));
                const pathLessons = pathUnits.flatMap((u) => u.lessons);
                const pathCompleted = pathLessons.filter((l) => completedLessons.includes(l.id)).length;
                const colorMap: Record<string, string> = {
                  emerald: "text-emerald-500 border-emerald-500/30 bg-emerald-500/5",
                  amber: "text-amber-500 border-amber-500/30 bg-amber-500/5",
                  red: "text-red-500 border-red-500/30 bg-red-500/5",
                };
                const barColorMap: Record<string, string> = {
                  emerald: "bg-emerald-500",
                  amber: "bg-amber-500",
                  red: "bg-red-500",
                };
                return (
                  <div key={path.label} className={`rounded-lg border p-3 ${colorMap[path.color]}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold">{path.label}</span>
                      <span className="text-[11px] font-medium">
                        {pathCompleted}/{pathLessons.length}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted/20 mb-2">
                      <div
                        className={`h-full rounded-full transition-all ${barColorMap[path.color]}`}
                        style={{ width: `${pathLessons.length > 0 ? (pathCompleted / pathLessons.length) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {pathUnits.map((u) => {
                        const unitCompleted = u.lessons.filter((l) => completedLessons.includes(l.id)).length;
                        const unitDone = unitCompleted === u.lessons.length;
                        const UnitIconComp = getUnitIcon(u.icon);
                        return (
                          <div
                            key={u.id}
                            className="flex items-center gap-1 rounded-md border border-border/40 bg-card/60 px-2 py-1"
                          >
                            {unitDone ? (
                              <Check className="h-2.5 w-2.5 text-emerald-400" />
                            ) : (
                              <UnitIconComp className="h-2.5 w-2.5 text-muted-foreground" />
                            )}
                            <span className="text-[11px] text-muted-foreground">{u.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Recently Completed */}
              {recentlyCompleted.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    Recently Completed
                  </h3>
                  {recentlyCompleted.map(({ lesson, unit, score }) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between rounded-lg border border-border/60 bg-card/50 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-400/10 border border-emerald-400/20">
                          <Check className="h-3 w-3 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-[11px] font-medium">{lesson.title}</p>
                          <p className="text-[11px] text-muted-foreground">{unit.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {score && (
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                            score.grade === "S" ? "text-amber-400 bg-amber-400/10" :
                            score.grade === "A" ? "text-emerald-400 bg-emerald-400/10" :
                            "text-muted-foreground bg-muted/20"
                          }`}>
                            {score.grade}
                          </span>
                        )}
                        <span className="text-[11px] text-primary">+{lesson.xpReward} XP</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Mini-game cards */}
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Star className="h-3 w-3" />
                Practice Games
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setActiveGame("flashcards")}
                  className="flex flex-col items-start gap-2 rounded-lg border border-orange-500/25 bg-orange-500/5 p-3 text-left transition-colors hover:bg-orange-500/10"
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-500/15 border border-orange-500/25">
                      <Brain className="h-3.5 w-3.5 text-orange-400" />
                    </div>
                    <span className="text-xs font-semibold text-orange-400">Flashcards</span>
                  </div>
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-orange-400 transition-all"
                        style={{ width: `${Math.min((flashcardToday / 10) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold tabular-nums text-muted-foreground">
                      {flashcardToday}/10
                    </span>
                    {flashcardToday >= 10 && <Check className="h-3 w-3 text-emerald-400" />}
                  </div>
                  <span className="text-[11px] text-muted-foreground">{overallMastery}% mastery</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveGame("prediction")}
                  className="flex flex-col items-start gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-3 text-left transition-colors hover:bg-emerald-500/10"
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/15 border border-emerald-500/25">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-300">Prediction</span>
                  </div>
                  <div className="flex items-center gap-2 w-full">
                    {predictionStreak > 0 && (
                      <div className="flex items-center gap-1">
                        <Flame className="h-3 w-3 text-amber-400" />
                        <span className="text-[11px] font-bold text-amber-400">{predictionStreak}</span>
                      </div>
                    )}
                    <span className="text-[11px] text-muted-foreground flex-1">
                      {predictionAccuracy > 0 ? `${predictionAccuracy}% accuracy` : "Predict next candle"}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {predictionToday > 0 ? `${predictionToday} played today` : "Start playing"}
                  </span>
                </button>
              </div>

              {/* Interactive Tools */}
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Zap className="h-3 w-3" />
                Interactive Tools
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTool(activeTool === "scenario" ? null : "scenario")}
                  className="flex flex-col items-start gap-2 rounded-lg border border-orange-500/25 bg-orange-500/5 p-3 text-left transition-colors hover:bg-orange-500/10"
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-500/15 border border-orange-500/25">
                      <History className="h-3.5 w-3.5 text-orange-400" />
                    </div>
                    <span className="text-xs font-semibold text-orange-300">Scenarios</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">Simulate historical crashes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTool(activeTool === "calculator" ? null : "calculator")}
                  className="flex flex-col items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-500/15 border border-orange-500/25">
                      <Calculator className="h-3.5 w-3.5 text-orange-400" />
                    </div>
                    <span className="text-xs font-semibold text-orange-400">Calculator</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">Compound interest growth</span>
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
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search lessons and units..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card pl-8 pr-3 py-2 text-[12px] placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>

              {/* Difficulty filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="h-3 w-3 text-muted-foreground shrink-0" />
                {(["all", "beginner", "intermediate", "advanced"] as DifficultyFilter[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficultyFilter(d)}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors capitalize ${
                      difficultyFilter === d
                        ? d === "all"
                          ? "bg-primary/15 text-primary border-primary/30"
                          : DIFFICULTY_COLORS[d]
                        : "bg-muted/10 text-muted-foreground border-border hover:bg-muted/20"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              {/* Unit cards */}
              <div className="space-y-3">
                {filteredUnits.length === 0 ? (
                  <div className="rounded-lg border border-border bg-card/50 px-4 py-8 text-center">
                    <Search className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">No units match your search</p>
                  </div>
                ) : (
                  filteredUnits.map((unit, i) => {
                    const isUnlocked = i === 0 || UNITS.slice(0, UNITS.indexOf(unit)).every((u) =>
                      u.lessons.every((l) => completedLessons.includes(l.id))
                    );
                    const unitCompletedCount = unit.lessons.filter((l) => completedLessons.includes(l.id)).length;
                    const isComplete = unitCompletedCount === unit.lessons.length;
                    const isInProgress = unitCompletedCount > 0 && !isComplete;
                    const totalDuration = unit.lessons.reduce((acc, l) => acc + (l.duration ?? 10), 0);
                    const totalXP = unit.lessons.reduce((acc, l) => acc + l.xpReward, 0);

                    // Get primary difficulty from lessons
                    const difficulties = unit.lessons.map((l) => l.difficulty ?? "beginner");
                    const primaryDifficulty = difficulties.includes("advanced")
                      ? "advanced"
                      : difficulties.includes("intermediate")
                      ? "intermediate"
                      : "beginner";

                    const UnitIconComp = getUnitIcon(unit.icon);

                    return (
                      <motion.div
                        key={unit.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={`rounded-lg border bg-card p-3 ${
                          isUnlocked ? "border-border" : "border-border/40 opacity-60"
                        }`}
                      >
                        {/* Unit header */}
                        <div className="flex items-start gap-3 mb-3">
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
                            style={{ background: `${unit.color}15`, border: `1px solid ${unit.color}30` }}
                          >
                            <UnitIconComp className="h-4 w-4" style={{ color: unit.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <span className="text-xs font-semibold truncate">{unit.title}</span>
                              <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full border capitalize ${DIFFICULTY_COLORS[primaryDifficulty]}`}>
                                {primaryDifficulty}
                              </span>
                              {isComplete && (
                                <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400">
                                  Complete
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">{unit.description}</p>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${unit.lessons.length > 0 ? (unitCompletedCount / unit.lessons.length) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-[11px] tabular-nums text-muted-foreground">
                            {unitCompletedCount}/{unit.lessons.length}
                          </span>
                        </div>

                        {/* Meta row */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Clock className="h-2.5 w-2.5" />
                            <span>{totalDuration}m</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Zap className="h-2.5 w-2.5" />
                            <span>{totalXP} XP</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <BookOpen className="h-2.5 w-2.5" />
                            <span>{unit.lessons.length} lessons</span>
                          </div>
                          <div className="ml-auto">
                            {!isUnlocked ? (
                              <span className="text-[11px] text-muted-foreground">Locked</span>
                            ) : isComplete ? (
                              <span className="rounded-md bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-[11px] font-semibold px-2 py-0.5">
                                Review
                              </span>
                            ) : isInProgress ? (
                              <span className="rounded-md bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold px-2 py-0.5">
                                Continue
                              </span>
                            ) : (
                              <span className="rounded-md bg-muted/20 border border-border text-muted-foreground text-[11px] font-semibold px-2 py-0.5">
                                Start
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* ============ MY PROGRESS TAB ============ */}
          {activeTab === "progress" && (
            <>
              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-4 w-4 text-amber-400" />
                    <span className="text-[11px] font-semibold">Lessons</span>
                  </div>
                  <p className="text-xl font-bold">{completedCount}</p>
                  <p className="text-[11px] text-muted-foreground">of {totalLessons} completed</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-[11px] font-semibold">XP Earned</span>
                  </div>
                  <p className="text-xl font-bold">{xp.toLocaleString()}</p>
                  <p className="text-[11px] text-muted-foreground">total experience</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="h-4 w-4 text-amber-500" />
                    <span className="text-[11px] font-semibold">Streak</span>
                  </div>
                  <p className="text-xl font-bold">{learningStreak}</p>
                  <p className="text-[11px] text-muted-foreground">days in a row</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-orange-400" />
                    <span className="text-[11px] font-semibold">Mastery</span>
                  </div>
                  <p className="text-xl font-bold">{overallMastery}%</p>
                  <p className="text-[11px] text-muted-foreground">flashcard mastery</p>
                </div>
              </div>

              {/* Unit-by-unit breakdown */}
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <BarChart2 className="h-3 w-3" />
                Unit Breakdown
              </h3>
              <div className="space-y-2">
                {UNITS.map((unit) => {
                  const done = unit.lessons.filter((l) => completedLessons.includes(l.id)).length;
                  const pct = unit.lessons.length > 0 ? Math.round((done / unit.lessons.length) * 100) : 0;
                  const UnitIconComp = getUnitIcon(unit.icon);
                  return (
                    <div key={unit.id} className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/50 px-3 py-2">
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
                      <span className="text-xs font-bold text-muted-foreground shrink-0 w-8 text-right">
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Full skill tree below */}
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
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
