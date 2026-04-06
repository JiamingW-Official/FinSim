"use client";

import { useState, useMemo } from "react";
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
  ChevronUp,
  SortAsc,
  Play,
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
  BookOpen, TrendingUp, BarChart2, ShieldCheck, BarChart,
  DollarSign, BookMarked, Layers, Globe, Coins,
  PieChart, Brain, GraduationCap, Zap,
};

function getUnitIcon(iconName: string): React.ElementType {
  return UNIT_ICON_MAP[iconName] ?? BookOpen;
}

type DifficultyFilter = "all" | "beginner" | "intermediate" | "advanced";
type SortMode = "recommended" | "az" | "progress";
type StatusFilter = "all" | "new" | "started" | "done";
type Tier = "foundation" | "core" | "advanced";

/* ── Infer unit difficulty from its lessons ── */
function inferUnitDifficulty(unit: (typeof UNITS)[number]): Tier {
  const counts = { beginner: 0, intermediate: 0, advanced: 0 };
  for (const l of unit.lessons) {
    const d = (l as { difficulty?: string }).difficulty ?? "beginner";
    if (d === "beginner") counts.beginner++;
    else if (d === "intermediate") counts.intermediate++;
    else counts.advanced++;
  }
  const max = Math.max(counts.beginner, counts.intermediate, counts.advanced);
  if (max === counts.beginner) return "foundation";
  if (max === counts.advanced) return "advanced";
  return "core";
}

function getUnitProgress(unit: (typeof UNITS)[number], completedLessons: string[]) {
  const done = unit.lessons.filter((l) => completedLessons.includes(l.id)).length;
  const total = unit.lessons.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return { done, total, pct };
}

function getUnitStatus(pct: number): StatusFilter {
  if (pct === 100) return "done";
  if (pct > 0) return "started";
  return "new";
}

/* ── UnitCard ── */
function UnitCard({
  unit,
  completedLessons,
  index,
}: {
  unit: (typeof UNITS)[number];
  completedLessons: string[];
  index: number;
}) {
  const UnitIconComp = getUnitIcon(unit.icon);
  const { done, total, pct } = getUnitProgress(unit, completedLessons);
  const status = getUnitStatus(pct);

  const nextLesson = unit.lessons.find((l) => !completedLessons.includes(l.id));
  const ctaHref = nextLesson ? `/learn/${nextLesson.id}` : `/learn/${unit.lessons[0]?.id}`;
  const ctaLabel = status === "done" ? "Review" : status === "started" ? "Continue" : "Start";

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border p-4 transition-all duration-200",
        /* started — most prominent, glows subtly */
        status === "started" && "border-foreground/30 bg-foreground/[0.05] hover:border-foreground/45 hover:bg-foreground/[0.08]",
        /* done — emerald accent */
        status === "done" && "border-emerald-500/30 bg-emerald-950/20 hover:border-emerald-500/45",
        /* new — restrained */
        status === "new" && "border-border/60 bg-card hover:border-border hover:bg-foreground/[0.02]",
      )}
    >
      {/* Status chip — top right */}
      {status === "started" && (
        <span className="absolute top-3 right-3 h-1.5 w-1.5 rounded-full bg-foreground/60 ring-2 ring-foreground/10" />
      )}
      {status === "done" && (
        <span className="absolute top-3 right-3 flex items-center justify-center h-4 w-4 rounded-full bg-emerald-500/20 border border-emerald-500/30">
          <Check className="h-2 w-2 text-emerald-400" strokeWidth={3} />
        </span>
      )}

      {/* Icon + Title */}
      <div className="flex items-start gap-2.5 pr-5">
        <div className={cn(
          "flex items-center justify-center h-7 w-7 rounded-lg shrink-0 border",
          status === "done" && "border-emerald-500/25 bg-emerald-500/10",
          status === "started" && "border-foreground/20 bg-foreground/10",
          status === "new" && "border-border/50 bg-transparent",
        )}>
          <UnitIconComp className={cn(
            "h-3.5 w-3.5",
            status === "done" && "text-emerald-400/80",
            status === "started" && "text-foreground/80",
            status === "new" && "text-muted-foreground/30",
          )} />
        </div>
        <p className={cn(
          "text-[13px] font-semibold leading-snug line-clamp-2",
          status === "done" && "text-emerald-400/80",
          status === "started" && "text-foreground",
          status === "new" && "text-foreground/60",
        )}>
          {unit.title}
        </p>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 rounded-full overflow-hidden bg-border/50">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              status === "done" && "bg-emerald-500",
              status === "started" && "bg-foreground/70",
              status === "new" && "bg-transparent",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={cn(
          "text-[10px] font-mono tabular-nums shrink-0",
          status === "done" && "text-emerald-500/60",
          status === "started" && "text-foreground/50",
          status === "new" && "text-muted-foreground/25",
        )}>
          {done}/{total}
        </span>
      </div>

      {/* CTA */}
      <Link
        href={ctaHref}
        className={cn(
          "mt-auto rounded-lg py-1.5 text-[11px] font-bold tracking-[0.06em] uppercase text-center transition-all duration-200",
          status === "done"
            && "border border-emerald-500/25 text-emerald-500/60 hover:border-emerald-500/50 hover:text-emerald-400",
          status === "started"
            && "bg-foreground text-background hover:bg-foreground/90",
          status === "new"
            && "border border-border/70 text-muted-foreground/40 hover:border-foreground/30 hover:text-foreground/70",
        )}
      >
        {ctaLabel} →
      </Link>
    </div>
  );
}

/* ── Tier Section ── */
const TIER_META: Record<Tier, { num: string; label: string; sub: string }> = {
  foundation: { num: "01", label: "Foundation", sub: "Core concepts to build on" },
  core:       { num: "02", label: "Core",       sub: "Trading & investing toolkit" },
  advanced:   { num: "03", label: "Advanced",   sub: "Professional-grade depth" },
};

const INITIAL_SHOW = 8;

function TierSection({
  tier,
  units,
  completedLessons,
}: {
  tier: Tier;
  units: (typeof UNITS)[number][];
  completedLessons: string[];
}) {
  const [expanded, setExpanded] = useState(false);
  const { num, label, sub } = TIER_META[tier];
  const doneCount = units.filter((u) => getUnitProgress(u, completedLessons).pct === 100).length;
  const startedCount = units.filter((u) => {
    const { pct } = getUnitProgress(u, completedLessons);
    return pct > 0 && pct < 100;
  }).length;
  const visible = expanded ? units : units.slice(0, INITIAL_SHOW);
  const hasMore = units.length > INITIAL_SHOW;

  return (
    <div className="mb-12">
      {/* Tier header */}
      <div className="flex items-end justify-between mb-5 pb-4 border-b border-border/50">
        <div className="flex items-end gap-4">
          <span className="font-serif text-5xl font-bold leading-none text-foreground/8 select-none tabular-nums">
            {num}
          </span>
          <div>
            <p className="font-serif text-xl font-bold text-foreground leading-none tracking-tight">{label}</p>
            <p className="text-[11px] text-muted-foreground/40 mt-1 leading-none">{sub}</p>
          </div>
        </div>
        <div className="text-right flex items-end gap-3">
          {startedCount > 0 && (
            <div className="text-center">
              <p className="font-mono text-sm font-bold tabular-nums text-foreground/70 leading-none">{startedCount}</p>
              <p className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-wide mt-0.5">active</p>
            </div>
          )}
          <div className="text-center">
            <p className={cn("font-mono text-sm font-bold tabular-nums leading-none", doneCount > 0 ? "text-emerald-400/80" : "text-muted-foreground/30")}>
              {doneCount}<span className="font-normal text-muted-foreground/20">/{units.length}</span>
            </p>
            <p className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-wide mt-0.5">done</p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {visible.map((unit, i) => (
          <UnitCard key={unit.id} unit={unit} completedLessons={completedLessons} index={i} />
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-mono text-muted-foreground/35 hover:text-foreground/60 transition-colors border border-dashed border-border/40 rounded-lg hover:border-border/70"
        >
          {expanded
            ? <><ChevronUp className="h-3 w-3" /> Show less</>
            : <><ChevronDown className="h-3 w-3" /> Show {units.length - INITIAL_SHOW} more</>}
        </button>
      )}
    </div>
  );
}

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
  const [sortMode, setSortMode] = useState<SortMode>("recommended");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const todayStr = new Date().toISOString().slice(0, 10);
  const flashcardToday = flashcardLastDate === todayStr ? flashcardDaily : 0;
  const predictionToday = predictionLastDate === todayStr ? predictionDaily : 0;

  const totalLessons = useMemo(() => UNITS.reduce((acc, u) => acc + u.lessons.length, 0), []);
  const completedCount = useMemo(
    () => UNITS.reduce((acc, u) => acc + u.lessons.filter((l) => completedLessons.includes(l.id)).length, 0),
    [completedLessons],
  );
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const recommendedLesson = useMemo(() => {
    for (const unit of UNITS) {
      for (const lesson of unit.lessons) {
        if (!completedLessons.includes(lesson.id)) return { lesson, unit };
      }
    }
    return null;
  }, [completedLessons]);

  /* ── Next Up: in-progress first, then new ── */
  const nextUpUnits = useMemo(() => {
    const inProgress: (typeof UNITS)[number][] = [];
    const fresh: (typeof UNITS)[number][] = [];
    for (const unit of UNITS) {
      const { pct } = getUnitProgress(unit, completedLessons);
      if (pct > 0 && pct < 100) inProgress.push(unit);
      else if (pct === 0) fresh.push(unit);
    }
    return [...inProgress, ...fresh].slice(0, 3);
  }, [completedLessons]);

  /* ── Filter + sort ── */
  const processedUnits = useMemo(() => {
    let units = [...UNITS];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      units = units.filter(
        (u) =>
          u.title.toLowerCase().includes(q) ||
          u.description.toLowerCase().includes(q) ||
          u.lessons.some((l) => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q)),
      );
    }

    if (difficultyFilter !== "all") {
      units = units.filter((u) => {
        const tier = inferUnitDifficulty(u);
        return (
          (difficultyFilter === "beginner" && tier === "foundation") ||
          (difficultyFilter === "intermediate" && tier === "core") ||
          (difficultyFilter === "advanced" && tier === "advanced")
        );
      });
    }

    if (statusFilter !== "all") {
      units = units.filter((u) => {
        const { pct } = getUnitProgress(u, completedLessons);
        return getUnitStatus(pct) === statusFilter;
      });
    }

    if (sortMode === "az") units.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortMode === "progress") {
      units.sort((a, b) => getUnitProgress(b, completedLessons).pct - getUnitProgress(a, completedLessons).pct);
    }

    return units;
  }, [searchQuery, difficultyFilter, statusFilter, sortMode, completedLessons]);

  const tieredUnits = useMemo(() => {
    const groups: Record<Tier, (typeof UNITS)[number][]> = { foundation: [], core: [], advanced: [] };
    for (const u of processedUnits) groups[inferUnitDifficulty(u)].push(u);
    return groups;
  }, [processedUnits]);

  const isFiltered = searchQuery.length > 0 || difficultyFilter !== "all" || statusFilter !== "all";
  const flatMode = isFiltered || sortMode !== "recommended";

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-5 py-6">

          {/* ── Hero ── */}
          <div className="mb-10 pb-8 border-b border-border">
            <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground/25 font-mono mb-5">
              Curriculum
            </p>
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <h1 className="font-serif text-6xl sm:text-7xl font-bold tracking-tight leading-[0.88] mb-4 text-foreground">
                  Learn.
                </h1>
                <p className="text-sm text-muted-foreground/50 leading-relaxed">
                  {completedCount === 0
                    ? "Start your journey through finance fundamentals."
                    : <><span className="text-foreground/80 font-semibold">{completedCount}</span> of {totalLessons} lessons complete</>}
                </p>
              </div>
              {/* Ghost % watermark */}
              <div className="text-right shrink-0 select-none">
                <span
                  className="font-serif tabular-nums font-bold leading-none"
                  style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)", color: "hsl(var(--foreground) / 0.06)" }}
                >
                  {progressPct}
                </span>
                <span className="font-serif font-bold" style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)", color: "hsl(var(--foreground) / 0.04)" }}>%</span>
              </div>
            </div>
            {recommendedLesson && (
              <Link
                href={`/learn/${recommendedLesson.lesson.id}`}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-2.5 text-[11px] font-bold tracking-[0.1em] uppercase transition-all hover:bg-foreground/90 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="h-3 w-3 fill-current" />
                {completedCount > 0 ? "Continue Learning" : "Start Learning"}
              </Link>
            )}
          </div>

          {/* ── Next Up ── */}
          {nextUpUnits.length > 0 && !isFiltered && (
            <div className="mb-10">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground/30 mb-4">
                Next Up
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {nextUpUnits.map((unit) => {
                  const { done, total, pct } = getUnitProgress(unit, completedLessons);
                  const isActive = pct > 0;
                  const nextLesson = unit.lessons.find((l) => !completedLessons.includes(l.id));
                  const UnitIconComp = getUnitIcon(unit.icon);
                  return (
                    <Link
                      key={unit.id}
                      href={nextLesson ? `/learn/${nextLesson.id}` : `/learn/${unit.lessons[0]?.id}`}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl border p-3.5 transition-all duration-200",
                        isActive
                          ? "border-foreground/25 bg-foreground/[0.05] hover:border-foreground/40 hover:bg-foreground/[0.08]"
                          : "border-border/60 bg-card hover:border-border hover:bg-foreground/[0.02]",
                      )}
                    >
                      <div className={cn(
                        "flex items-center justify-center h-9 w-9 rounded-lg shrink-0 border",
                        isActive ? "border-foreground/20 bg-foreground/10" : "border-border/50",
                      )}>
                        <UnitIconComp className={cn("h-4 w-4", isActive ? "text-foreground/70" : "text-muted-foreground/30")} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn(
                          "text-xs font-semibold leading-tight truncate",
                          isActive ? "text-foreground/90" : "text-foreground/55",
                        )}>
                          {unit.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className="flex-1 h-1 rounded-full overflow-hidden bg-border/50">
                            <div
                              className={cn("h-full rounded-full", isActive ? "bg-foreground/60" : "bg-transparent")}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono tabular-nums text-muted-foreground/35 shrink-0">
                            {done}/{total}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className={cn(
                        "h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5",
                        isActive ? "text-foreground/40" : "text-muted-foreground/20",
                      )} />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Skill Tree header ── */}
          <div className="mb-6">
            <div className="flex items-end justify-between mb-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/25 font-mono mb-2">Skill Tree</p>
                <p className="font-serif text-2xl font-bold text-foreground leading-none">
                  {UNITS.length}{" "}
                  <span className="font-light text-muted-foreground/35">units</span>
                </p>
              </div>
              <div className="text-right">
                <p className="font-serif text-lg font-bold tabular-nums leading-none text-foreground/80">
                  {completedCount}
                  <span className="font-light text-muted-foreground/30 text-sm">/{totalLessons}</span>
                </p>
                <p className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-wide mt-0.5">lessons done</p>
              </div>
            </div>

            {/* Controls row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative flex-1 min-w-[150px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/35" />
                <input
                  type="text"
                  placeholder="Search units & lessons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-border/70 bg-transparent pl-8 pr-3 py-2 text-xs rounded-lg focus:outline-none focus:border-foreground/30 placeholder:text-muted-foreground/25 transition-colors"
                />
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-0.5 border border-border/70 rounded-lg p-0.5">
                {(["all", "new", "started", "done"] as StatusFilter[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={cn(
                      "px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors",
                      statusFilter === s
                        ? "bg-foreground text-background font-semibold"
                        : "text-muted-foreground/45 hover:text-foreground/70",
                    )}
                  >
                    {s === "all" ? "All" : s === "new" ? "New" : s === "started" ? "Active" : "Done"}
                  </button>
                ))}
              </div>

              {/* Difficulty */}
              <div className="flex items-center gap-0.5 border border-border/70 rounded-lg p-0.5">
                {(["all", "beginner", "intermediate", "advanced"] as DifficultyFilter[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficultyFilter(d)}
                    className={cn(
                      "px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors",
                      difficultyFilter === d
                        ? "bg-foreground text-background font-semibold"
                        : "text-muted-foreground/45 hover:text-foreground/70",
                    )}
                  >
                    {d === "all" ? "All" : d === "beginner" ? "Beg" : d === "intermediate" ? "Int" : "Adv"}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-0.5 border border-border/70 rounded-lg p-0.5 ml-auto">
                <SortAsc className="h-3 w-3 text-muted-foreground/25 ml-2 mr-0.5" />
                {(["recommended", "az", "progress"] as SortMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSortMode(m)}
                    className={cn(
                      "px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors",
                      sortMode === m
                        ? "bg-foreground text-background font-semibold"
                        : "text-muted-foreground/45 hover:text-foreground/70",
                    )}
                  >
                    {m === "recommended" ? "Smart" : m === "az" ? "A–Z" : "Progress"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Content ── */}
          {processedUnits.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-2xl font-serif font-bold text-foreground/15 mb-2">No results</p>
              <p className="text-xs text-muted-foreground/30">Try adjusting your filters</p>
            </div>
          ) : flatMode ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-12">
              {processedUnits.map((unit, i) => (
                <UnitCard key={unit.id} unit={unit} completedLessons={completedLessons} index={i} />
              ))}
            </div>
          ) : (
            <>
              {(["foundation", "core", "advanced"] as Tier[]).map((tier) =>
                tieredUnits[tier].length > 0 ? (
                  <TierSection key={tier} tier={tier} units={tieredUnits[tier]} completedLessons={completedLessons} />
                ) : null,
              )}
            </>
          )}

          {/* ── Practice Tools ── */}
          <div className="pt-8 border-t border-border">
            <div className="mb-5">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/25 font-mono mb-2">Practice</p>
              <p className="font-serif text-xl font-bold text-foreground leading-none">
                Tools &amp; <span className="font-light text-muted-foreground/40">Drills</span>
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "Flashcards",  action: () => setActiveGame("flashcards"),  extra: flashcardToday > 0 ? `${flashcardToday}/10 today` : "Daily review" },
                { label: "Predictions", action: () => setActiveGame("prediction"),  extra: predictionToday > 0 ? `${predictionToday} played` : "Market forecasting" },
                { label: "Scenarios",   action: () => setActiveTool(activeTool === "scenario" ? null : "scenario"),   extra: "Simulate market moves" },
                { label: "Calculator",  action: () => setActiveTool(activeTool === "calculator" ? null : "calculator"), extra: "Compound growth" },
              ].map(({ label, action, extra }) => (
                <button
                  key={label}
                  type="button"
                  onClick={action}
                  className="group border border-border/70 rounded-xl p-4 text-left hover:border-foreground/25 hover:bg-foreground/[0.03] transition-all duration-200"
                >
                  <p className="font-serif text-base font-bold text-foreground/75 group-hover:text-foreground leading-tight mb-1.5">
                    {label}
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground/30 leading-snug">
                    {extra}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {activeTool && (
              <div className="overflow-hidden mt-4">
                <div className="rounded-lg border border-border p-4">
                  {activeTool === "scenario" ? (
                    <ScenarioSimulator />
                  ) : (
                    <CompoundCalculator />
                  )}
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Game overlays */}
      {activeGame && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setActiveGame(null)}
          >
            <div
              className="w-full max-w-md rounded-lg border border-border bg-card overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {activeGame === "flashcards" ? (
                <FlashcardGame onClose={() => setActiveGame(null)} />
              ) : (
                <PredictionGame onClose={() => setActiveGame(null)} />
              )}
            </div>
          </div>
        )}
    </div>
  );
}
