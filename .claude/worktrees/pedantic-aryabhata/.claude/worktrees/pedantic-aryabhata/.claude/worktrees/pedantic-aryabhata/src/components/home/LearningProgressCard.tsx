"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Target,
  Flame,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLearnStore } from "@/stores/learn-store";
import { UNITS } from "@/data/lessons";

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const RING_SIZE = 64;
const RING_STROKE = 5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const CATEGORY_COLORS: Record<string, string> = {
  basics: "bg-emerald-500",
  orders: "bg-primary",
  indicators: "bg-primary",
  risk: "bg-amber-500",
  fundamentals: "bg-rose-500",
};

const CATEGORY_TRACK: Record<string, string> = {
  basics: "bg-emerald-500/20",
  orders: "bg-primary/20",
  indicators: "bg-primary/20",
  risk: "bg-amber-500/20",
  fundamentals: "bg-rose-500/20",
};

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export function LearningProgressCard() {
  const completedLessons = useLearnStore((s) => s.completedLessons);
  const learningStreak = useLearnStore((s) => s.learningStreak);
  const lessonScores = useLearnStore((s) => s.lessonScores);

  /* Derive progress data */
  const { totalLessons, totalCompleted, categories, skillsMastered } =
    useMemo(() => {
      let total = 0;
      let completed = 0;
      const cats: {
        id: string;
        label: string;
        total: number;
        completed: number;
      }[] = [];

      for (const unit of UNITS) {
        const unitCompleted = unit.lessons.filter((l) =>
          completedLessons.includes(l.id),
        ).length;
        total += unit.lessons.length;
        completed += unitCompleted;
        cats.push({
          id: unit.id,
          label: unit.title,
          total: unit.lessons.length,
          completed: unitCompleted,
        });
      }

      // Skills mastered = lessons where the user scored grade A or S
      const mastered = Object.values(lessonScores).filter(
        (s) => s.grade === "S" || s.grade === "A",
      ).length;

      return {
        totalLessons: total,
        totalCompleted: completed,
        categories: cats,
        skillsMastered: mastered,
      };
    }, [completedLessons, lessonScores]);

  const progressPct =
    totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;
  const strokeDashoffset =
    RING_CIRCUMFERENCE - (progressPct / 100) * RING_CIRCUMFERENCE;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <BookOpen className="h-3 w-3" />
          Learning Progress
        </div>
        <Link
          href="/learn"
          className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
        >
          Continue
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Top section: ring + stats */}
      <div className="mb-3 flex items-center gap-4">
        {/* Progress Ring */}
        <div className="relative flex-shrink-0">
          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            className="-rotate-90"
          >
            {/* Track */}
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth={RING_STROKE}
              className="text-muted/30"
            />
            {/* Progress */}
            <motion.circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              stroke="#10b981"
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-semibold tabular-nums text-primary">
              {progressPct}%
            </span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid flex-1 grid-cols-2 gap-2">
          <MiniStat
            icon={<CheckCircle2 className="h-3 w-3 text-primary" />}
            label="Completed"
            value={`${totalCompleted}/${totalLessons}`}
          />
          <MiniStat
            icon={<Target className="h-3 w-3 text-muted-foreground" />}
            label="Skills Mastered"
            value={String(skillsMastered)}
          />
          <MiniStat
            icon={<Flame className="h-3 w-3 text-orange-400" />}
            label="Streak"
            value={learningStreak > 0 ? `${learningStreak}d` : "--"}
          />
          <MiniStat
            icon={<BookOpen className="h-3 w-3 text-primary" />}
            label="Categories"
            value={`${categories.filter((c) => c.completed === c.total && c.total > 0).length}/${categories.length}`}
          />
        </div>
      </div>

      {/* Category breakdown */}
      <div className="space-y-1.5">
        {categories.map((cat) => {
          const pct =
            cat.total > 0
              ? Math.round((cat.completed / cat.total) * 100)
              : 0;
          return (
            <div key={cat.id} className="flex items-center gap-2">
              <span className="w-[72px] truncate text-xs text-muted-foreground">
                {cat.label}
              </span>
              <div
                className={cn(
                  "relative h-1.5 flex-1 overflow-hidden rounded-full",
                  CATEGORY_TRACK[cat.id] ?? "bg-muted/20",
                )}
              >
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    CATEGORY_COLORS[cat.id] ?? "bg-primary",
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <span className="w-7 text-right text-xs tabular-nums font-semibold text-muted-foreground">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mini stat helper                                                  */
/* ------------------------------------------------------------------ */

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-[11px] font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  );
}
