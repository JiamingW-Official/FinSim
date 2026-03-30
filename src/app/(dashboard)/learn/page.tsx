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
 {/* Pulsing ring for current */}
 {status === "current" && (
 <span className="absolute -inset-2 rounded-full border border-emerald-500/25 animate-pulse pointer-events-none" />
 )}
 <div
 className={cn(
 "relative flex items-center justify-center rounded-full transition-all duration-200",
 status === "completed" && "h-11 w-11 bg-emerald-500 text-white shadow-[0_0_12px_rgba(34,197,94,0.25)]",
 status === "current" && "h-14 w-14 border-2 border-emerald-500 bg-emerald-500/5",
 status === "locked" && "h-9 w-9 border border-border/40 bg-transparent",
 )}
 >
 {status === "completed" ? (
 <Check className="h-4 w-4" strokeWidth={2.5} />
 ) : status === "current" ? (
 <span className="font-serif text-base font-bold text-emerald-500">
 {lessonIndex + 1}
 </span>
 ) : (
 <Lock className="h-2.5 w-2.5 text-muted-foreground/15" />
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
 <div className="flex justify-center h-6 w-12">
 <svg width="2" height="24" className="overflow-visible">
 <line
 x1="1"
 y1="0"
 x2="1"
 y2="24"
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
 <svg width="48" height="2" className="shrink-0 my-auto mx-2">
 <line
 x1="0"
 y1="1"
 x2="48"
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

 const isComplete = unitPct === 100;
 const hasActive = unit.lessons.some((l) => !completedLessons.includes(l.id));
 const isLocked = unitCompletedCount === 0 && unit.lessons[0] && !completedLessons.includes(unit.lessons[0].id);

 return (
 <div className="flex flex-col items-center min-w-[100px]">
 {/* Unit header */}
 <div className="flex flex-col items-center mb-3 max-w-[120px]">
 <div className={cn(
 "flex items-center justify-center h-8 w-8 rounded-lg border mb-2 transition-colors",
 isComplete ? "border-emerald-500/30 bg-emerald-500/10" : hasActive ? "border-foreground/15 bg-foreground/[0.05]" : "border-border/30 bg-transparent",
 )}>
 <UnitIconComp className={cn(
 "h-3.5 w-3.5 transition-colors",
 isComplete ? "text-emerald-500/70" : hasActive ? "text-foreground/60" : "text-muted-foreground/20",
 )} />
 </div>
 <span className={cn(
 "text-[11px] tracking-wide text-center leading-tight line-clamp-2 transition-colors",
 isComplete ? "font-medium text-emerald-500/60" : hasActive ? "font-semibold text-foreground/80" : "font-normal text-muted-foreground/25",
 )}>
 {unit.title}
 </span>
 <div className="flex items-center gap-1.5 mt-1.5">
 <div className="w-14 h-[2px] rounded-full bg-border/40 overflow-hidden">
 <div
 className={cn("h-full rounded-full transition-all duration-500", isComplete ? "bg-emerald-500" : "bg-foreground/40")}
 style={{ width: `${unitPct}%` }}
 />
 </div>
 <span className={cn(
 "text-[10px] font-mono tabular-nums",
 isComplete ? "text-emerald-500/50" : hasActive ? "text-muted-foreground/50" : "text-muted-foreground/20",
 )}>
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
 {/* ── Hero section ── */}
 <div className="mb-10 pb-8 border-b border-border">
 <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/30 font-mono mb-4">
 Curriculum
 </p>
 <div className="flex items-end justify-between gap-4">
 <div className="min-w-0">
 <h1 className="font-serif text-6xl sm:text-7xl font-bold tracking-tight leading-[0.9] mb-4 text-foreground">
 Learn.
 </h1>
 <p className="text-sm text-muted-foreground/45 leading-relaxed">
 {completedCount === 0
 ? "Start your journey through finance fundamentals."
 : `${completedCount} of ${totalLessons} lessons complete`}
 </p>
 </div>
 {/* Big ghost progress watermark */}
 <div className="text-right shrink-0 select-none">
 <span className="font-serif tabular-nums font-bold leading-none"
 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", color: "hsl(var(--foreground) / 0.05)" }}>
 {Math.round((completedCount / totalLessons) * 100)}
 </span>
 <span className="text-muted-foreground/8 text-xl font-serif font-bold">%</span>
 </div>
 </div>
 {recommendedLesson && (
 <Link
 href={`/learn/${recommendedLesson.lesson.id}`}
 className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-2.5 text-[11px] font-semibold tracking-wide uppercase transition-all hover:bg-foreground/90 hover:scale-[1.02]"
 >
 {completedCount > 0 ? "Continue" : "Start Learning"}
 <ArrowRight className="h-3 w-3" />
 </Link>
 )}
 </div>

 {/* Search + filters */}
 <div className="flex items-center gap-2 mb-8">
 <div className="relative flex-1 max-w-xs">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/40" />
 <input
 type="text"
 placeholder="Search lessons..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full border border-border bg-transparent pl-8 pr-3 py-2 text-xs rounded-lg focus:outline-none focus:border-foreground/20 placeholder:text-muted-foreground/30 transition-colors"
 />
 </div>
 {/* Difficulty filters */}
 <div className="flex items-center gap-0.5 border border-border rounded-lg p-0.5">
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
 "px-2.5 py-1 text-[11px] rounded-md transition-colors capitalize",
 difficultyFilter === d
 ? "bg-foreground text-background"
 : "text-muted-foreground/50 hover:text-foreground",
 )}
 >
 {d === "all" ? "All" : d === "beginner" ? "Beg" : d === "intermediate" ? "Int" : "Adv"}
 </button>
 ))}
 </div>
 </div>

 {/* ── Skill Tree ── */}
 <div className="relative">
 <div className="flex items-end justify-between mb-8">
 <div>
 <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/30 font-mono mb-1.5">Skill Tree</p>
 <p className="font-serif text-2xl font-bold text-foreground/90 leading-none">{UNITS.length} <span className="font-light text-muted-foreground/40">units</span></p>
 </div>
 <div className="text-right">
 <p className="font-mono text-sm tabular-nums leading-none text-muted-foreground/40">{completedCount}<span className="text-muted-foreground/25">/{totalLessons}</span></p>
 <p className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-wide mt-0.5">completed</p>
 </div>
 </div>

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
 <div className="flex items-end justify-between mb-5">
 <div>
 <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/30 font-mono mb-1.5">Practice</p>
 <p className="font-serif text-xl font-bold text-foreground/80 leading-none">Tools &amp; <span className="font-light text-muted-foreground/50">Drills</span></p>
 </div>
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
 {[
 {
 label: "Flashcards",
 action: () => setActiveGame("flashcards"),
 extra: flashcardToday > 0 ? `${flashcardToday}/10 today` : null,
 },
 {
 label: "Predictions",
 action: () => setActiveGame("prediction"),
 extra: predictionToday > 0 ? `${predictionToday} played` : null,
 },
 {
 label: "Scenarios",
 action: () =>
 setActiveTool(
 activeTool === "scenario" ? null : "scenario",
 ),
 extra: "Simulate market moves",
 },
 {
 label: "Calculator",
 action: () =>
 setActiveTool(
 activeTool === "calculator" ? null : "calculator",
 ),
 extra: "Compound growth",
 },
 ].map(({ label, action, extra }) => (
 <button
 key={label}
 type="button"
 onClick={action}
 className="group border border-border rounded-xl p-4 text-left hover:border-foreground/30 hover:bg-foreground/[0.03] transition-all duration-200"
 >
 <p className="font-serif text-base font-semibold text-foreground/80 group-hover:text-foreground leading-tight mb-1">
 {label}
 </p>
 {extra && (
 <p className="text-[10px] font-mono text-muted-foreground/30 leading-snug">
 {extra}
 </p>
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
