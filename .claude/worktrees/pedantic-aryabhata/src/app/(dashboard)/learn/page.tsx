"use client";

import { useState, useMemo, useRef, useCallback } from "react";
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
 Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
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

/* ── Node status for a lesson ── */
type NodeStatus = "completed" | "current" | "locked";

function getNodeStatus(
 lessonId: string,
 lessonIdx: number,
 unitLessons: { id: string }[],
 completedLessons: string[],
): NodeStatus {
 if (completedLessons.includes(lessonId)) return "completed";
 // Current = first incomplete in the unit (or first if unit just unlocked)
 const firstIncompleteIdx = unitLessons.findIndex(
 (l) => !completedLessons.includes(l.id),
 );
 if (lessonIdx === firstIncompleteIdx) return "current";
 return "locked";
}

/* ── Tooltip on hover ── */
function NodeTooltip({ title, status, duration }: { title: string; status: NodeStatus; duration: number }) {
 return (
 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none z-20">
 <div className="rounded-md border border-border bg-card px-2.5 py-1.5 shadow-sm whitespace-nowrap">
 <p className="text-[11px] font-medium text-foreground">{title}</p>
 <p className="text-[10px] text-muted-foreground">
 {status === "completed" ? "Completed" : status === "current" ? "Up next" : "Locked"}
 {" / "}{duration}m
 </p>
 </div>
 </div>
 );
}

/* ── Single lesson node (circle) ── */
function LessonCircle({
 lessonId,
 lessonIndex,
 status,
 title,
 duration,
}: {
 lessonId: string;
 lessonIndex: number;
 status: NodeStatus;
 title: string;
 duration: number;
}) {
 const [hovered, setHovered] = useState(false);

 const circle = (
 <div
 className="relative flex flex-col items-center"
 onMouseEnter={() => setHovered(true)}
 onMouseLeave={() => setHovered(false)}
 >
 {hovered && <NodeTooltip title={title} status={status} duration={duration} />}
 <div
 className={cn(
 "relative flex h-10 w-10 items-center justify-center rounded-full transition-colors",
 status === "completed" && "bg-emerald-500 text-white",
 status === "current" && "border-2 border-emerald-500 bg-card",
 status === "locked" && "border border-border bg-muted",
 )}
 >
 {/* Pulsing ring for current */}
 {status === "current" && (
 <span className="absolute inset-0 rounded-full border-2 border-emerald-500 animate-pulse" />
 )}

 {status === "completed" ? (
 <Check className="h-4 w-4" />
 ) : status === "current" ? (
 <span className="text-[10px] font-mono font-medium text-emerald-600">
 {lessonIndex + 1}
 </span>
 ) : (
 <Lock className="h-3 w-3 text-muted-foreground" />
 )}
 </div>
 </div>
 );

 if (status === "locked") {
 return circle;
 }

 return (
 <Link href={`/learn/${lessonId}`} className="block">
 {circle}
 </Link>
 );
}

/* ── SVG connector line between two vertically stacked nodes ── */
function ConnectorLine({ status }: { status: "completed" | "pending" }) {
 return (
 <div className="flex justify-center h-5 w-10">
 <svg width="2" height="20" className="overflow-visible">
 <line
 x1="1"
 y1="0"
 x2="1"
 y2="20"
 strokeWidth={1.5}
 className={cn(
 status === "completed" ? "stroke-emerald-500" : "stroke-border",
 )}
 />
 </svg>
 </div>
 );
}

/* ── Horizontal connector between unit clusters ── */
function UnitConnectorSVG({ completed }: { completed: boolean }) {
 return (
 <svg width="40" height="2" className="shrink-0 my-auto mx-1">
 <line
 x1="0"
 y1="1"
 x2="40"
 y2="1"
 strokeWidth={1.5}
 strokeDasharray={completed ? "none" : "4 3"}
 className={cn(
 completed ? "stroke-emerald-500" : "stroke-border",
 )}
 />
 </svg>
 );
}

/* ── Unit cluster ── */
function UnitCluster({
 unit,
 completedLessons,
 searchMode,
 visibleLessonIds,
}: {
 unit: (typeof UNITS)[number];
 completedLessons: string[];
 searchMode: boolean;
 visibleLessonIds: Set<string> | null;
}) {
 const UnitIconComp = getUnitIcon(unit.icon);
 const unitCompletedCount = unit.lessons.filter((l) =>
 completedLessons.includes(l.id),
 ).length;
 const unitPct =
 unit.lessons.length > 0
 ? Math.round((unitCompletedCount / unit.lessons.length) * 100)
 : 0;

 const lessons = visibleLessonIds
 ? unit.lessons.filter((l) => visibleLessonIds.has(l.id))
 : unit.lessons;

 if (lessons.length === 0) return null;

 return (
 <div className="flex flex-col items-center min-w-[80px]">
 {/* Unit header */}
 <div className="flex flex-col items-center mb-3 max-w-[120px]">
 <div className="flex items-center justify-center h-7 w-7 rounded-md border border-border bg-card mb-1.5">
 <UnitIconComp className="h-3.5 w-3.5 text-muted-foreground" />
 </div>
 <span className="text-sm font-serif tracking-tight text-foreground text-center leading-tight line-clamp-2">
 {unit.title}
 </span>
 <div className="flex items-center gap-1.5 mt-1">
 <div className="w-10 h-[2px] rounded-full bg-border overflow-hidden">
 <div
 className="h-full rounded-full bg-emerald-500 transition-all duration-500"
 style={{ width: `${unitPct}%` }}
 />
 </div>
 <span className="text-[10px] font-mono text-muted-foreground/60 tabular-nums">
 {unitCompletedCount}/{unit.lessons.length}
 </span>
 </div>
 </div>

 {/* Lesson nodes stacked vertically */}
 {lessons.map((lesson, li) => {
 const originalIdx = unit.lessons.indexOf(lesson);
 const status = getNodeStatus(
 lesson.id,
 originalIdx,
 unit.lessons,
 completedLessons,
 );
 const prevCompleted =
 li > 0 &&
 completedLessons.includes(
 (visibleLessonIds ? lessons : unit.lessons)[li - 1]?.id ?? "",
 );

 return (
 <div key={lesson.id} className="flex flex-col items-center">
 {/* Connector from previous node */}
 {li > 0 && (
 <ConnectorLine
 status={prevCompleted ? "completed" : "pending"}
 />
 )}
 <LessonCircle
 lessonId={lesson.id}
 lessonIndex={originalIdx}
 status={status}
 title={lesson.title}
 duration={lesson.duration ?? 10}
 />
 </div>
 );
 })}
 </div>
 );
}

/* ── Overall progress arc (kept from original) ── */
function ProgressArc({
 completed,
 total,
}: {
 completed: number;
 total: number;
}) {
 const size = 96;
 const stroke = 3;
 const r = (size - stroke) / 2;
 const circumference = 2 * Math.PI * r;
 const pct = total > 0 ? completed / total : 0;
 const offset = circumference * (1 - pct);

 return (
 <div className="relative inline-flex items-center justify-center">
 <svg width={size} height={size} className="-rotate-90">
 <circle
 cx={size / 2}
 cy={size / 2}
 r={r}
 fill="none"
 stroke="currentColor"
 strokeWidth={stroke}
 className="text-muted/30"
 />
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
 <span className="text-xl font-mono font-light tabular-nums tracking-tight">
 {completed}
 </span>
 <span className="text-[9px] uppercase tracking-widest text-muted-foreground/50">
 of {total}
 </span>
 </div>
 </div>
 );
}

/* ── Row of units with horizontal connectors ── */
const UNITS_PER_ROW = 5;

function SkillTreeRow({
 units,
 completedLessons,
 searchMode,
 visibleLessonIdsByUnit,
 reverse,
}: {
 units: (typeof UNITS)[number][];
 completedLessons: string[];
 searchMode: boolean;
 visibleLessonIdsByUnit: Map<string, Set<string>> | null;
 reverse: boolean;
}) {
 const orderedUnits = reverse ? [...units].reverse() : units;

 return (
 <div className="flex items-start justify-center">
 {orderedUnits.map((unit, i) => {
 const isUnitComplete = unit.lessons.every((l) =>
 completedLessons.includes(l.id),
 );

 return (
 <div key={unit.id} className="flex items-start">
 {i > 0 && <UnitConnectorSVG completed={isUnitComplete} />}
 <UnitCluster
 unit={unit}
 completedLessons={completedLessons}
 searchMode={searchMode}
 visibleLessonIds={visibleLessonIdsByUnit?.get(unit.id) ?? null}
 />
 </div>
 );
 })}
 </div>
 );
}

/* ── Vertical connector between rows ── */
function RowConnectorSVG({ reverse }: { reverse: boolean }) {
 // Draws a curved path from bottom of previous row to top of next row
 // If reverse, the turn goes right-to-left; otherwise left-to-right
 return (
 <div className="flex justify-center py-2">
 <svg width="60" height="32" className="overflow-visible">
 <path
 d="M30 0 C30 12, 30 20, 30 32"
 fill="none"
 strokeWidth={1.5}
 className="stroke-border"
 />
 </svg>
 </div>
 );
}

export default function LearnPage() {
 const completedLessons = useLearnStore((s) => s.completedLessons);
 const flashcardDaily = useFlashcardStore((s) => s.dailyCardsReviewed);
 const flashcardLastDate = useFlashcardStore((s) => s.lastReviewDate);
 const predictionDaily = usePredictionStore((s) => s.dailyPlayed);
 const predictionLastDate = usePredictionStore((s) => s.lastPlayDate);

 const [activeGame, setActiveGame] = useState<
 "flashcards" | "prediction" | null
 >(null);
 const [activeTool, setActiveTool] = useState<
 "scenario" | "calculator" | null
 >(null);
 const [searchQuery, setSearchQuery] = useState("");
 const [difficultyFilter, setDifficultyFilter] =
 useState<DifficultyFilter>("all");

 const todayStr = new Date().toISOString().slice(0, 10);
 const flashcardToday = flashcardLastDate === todayStr ? flashcardDaily : 0;
 const predictionToday = predictionLastDate === todayStr ? predictionDaily : 0;

 const totalLessons = useMemo(
 () => UNITS.reduce((acc, u) => acc + u.lessons.length, 0),
 [],
 );

 const completedCount = useMemo(
 () =>
 UNITS.reduce(
 (acc, u) =>
 acc + u.lessons.filter((l) => completedLessons.includes(l.id)).length,
 0,
 ),
 [completedLessons],
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

 /* ── Filtering ── */
 const isSearching = searchQuery.length > 0 || difficultyFilter !== "all";

 const filteredData = useMemo(() => {
 if (!isSearching) return null;
 const q = searchQuery.toLowerCase();
 const byUnit = new Map<string, Set<string>>();
 const matchingUnitIds: string[] = [];

 for (const unit of UNITS) {
 const matchingIds = new Set<string>();
 for (const lesson of unit.lessons) {
 const matchesSearch =
 !q ||
 lesson.title.toLowerCase().includes(q) ||
 lesson.description.toLowerCase().includes(q) ||
 unit.title.toLowerCase().includes(q);

 const matchesDifficulty =
 difficultyFilter === "all" ||
 (lesson.difficulty ?? "beginner") === difficultyFilter;

 if (matchesSearch && matchesDifficulty) {
 matchingIds.add(lesson.id);
 }
 }
 if (matchingIds.size > 0) {
 byUnit.set(unit.id, matchingIds);
 matchingUnitIds.push(unit.id);
 }
 }
 return { byUnit, matchingUnitIds };
 }, [searchQuery, difficultyFilter, isSearching]);

 /* ── Chunk units into rows ── */
 const unitRows = useMemo(() => {
 const sourceUnits = filteredData
 ? UNITS.filter((u) => filteredData.matchingUnitIds.includes(u.id))
 : UNITS;

 const rows: (typeof UNITS)[] = [];
 for (let i = 0; i < sourceUnits.length; i += UNITS_PER_ROW) {
 rows.push(sourceUnits.slice(i, i + UNITS_PER_ROW));
 }
 return rows;
 }, [filteredData]);

 return (
 <div className="flex h-full flex-col overflow-hidden">
 <div className="flex-1 overflow-y-auto">
 <div className="mx-auto max-w-4xl px-5 py-6">
 {/* ── Hero: Progress arc + continue ── */}
 <div className="flex items-center gap-8 mb-10">
 <ProgressArc completed={completedCount} total={totalLessons} />
 <div className="flex-1 min-w-0">
 <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1">
 Curriculum
 </p>
 <h1 className="text-3xl font-serif tracking-tight mb-1.5">
 Learn
 </h1>
 <p className="text-xs text-muted-foreground/60 leading-relaxed mb-4">
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
 <div className="flex items-center gap-3 mb-8">
 <div className="relative flex-1 max-w-[220px]">
 <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/50" />
 <input
 type="text"
 placeholder="Search lessons..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full rounded-md border border-border bg-transparent pl-7 pr-2 py-1.5 text-xs placeholder:text-muted-foreground/40 focus:outline-none focus:border-border transition-colors"
 />
 </div>
 <div className="flex items-center gap-0.5">
 {(
 [
 "all",
 "beginner",
 "intermediate",
 "advanced",
 ] as DifficultyFilter[]
 ).map((d) => (
 <button
 key={d}
 type="button"
 onClick={() => setDifficultyFilter(d)}
 className={cn(
 "px-2 py-1 text-[11px] rounded transition-colors capitalize",
 difficultyFilter === d
 ? "bg-foreground/5 text-foreground"
 : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-foreground/[0.03]",
 )}
 >
 {d === "all" ? "All" : d}
 </button>
 ))}
 </div>
 </div>

 {/* ── Skill Tree ── */}
 <div className="relative">
 <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-5">
 Skill Tree
 </p>

 {unitRows.length === 0 ? (
 <p className="text-xs text-muted-foreground py-8 text-center">
 No lessons match your search.
 </p>
 ) : (
 <div className="flex flex-col items-center gap-0">
 {unitRows.map((row, rowIdx) => (
 <div key={rowIdx}>
 {rowIdx > 0 && <RowConnectorSVG reverse={rowIdx % 2 === 1} />}
 <SkillTreeRow
 units={row}
 completedLessons={completedLessons}
 searchMode={isSearching}
 visibleLessonIdsByUnit={filteredData?.byUnit ?? null}
 reverse={rowIdx % 2 === 1}
 />
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Practice tools */}
 <div className="mt-10 pt-8 border-t border-border">
 <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-4">
 Practice
 </p>
 <div className="flex items-center gap-2">
 {[
 {
 label: "Flashcards",
 action: () => setActiveGame("flashcards"),
 extra: flashcardToday > 0 ? `${flashcardToday}/10` : null,
 },
 {
 label: "Predictions",
 action: () => setActiveGame("prediction"),
 extra: predictionToday > 0 ? `${predictionToday}` : null,
 },
 {
 label: "Scenarios",
 action: () =>
 setActiveTool(
 activeTool === "scenario" ? null : "scenario",
 ),
 extra: null,
 },
 {
 label: "Calculator",
 action: () =>
 setActiveTool(
 activeTool === "calculator" ? null : "calculator",
 ),
 extra: null,
 },
 ].map(({ label, action, extra }) => (
 <button
 key={label}
 type="button"
 onClick={action}
 className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-colors"
 >
 {label}
 {extra && (
 <span className="text-muted-foreground/40 ml-1">
 {extra}
 </span>
 )}
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
 <div className="rounded-lg border border-border p-4">
 {activeTool === "scenario" ? (
 <ScenarioSimulator />
 ) : (
 <CompoundCalculator />
 )}
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
 className="w-full max-w-md rounded-lg border border-border bg-card overflow-hidden"
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
