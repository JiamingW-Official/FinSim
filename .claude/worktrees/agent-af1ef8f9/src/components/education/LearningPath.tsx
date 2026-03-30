"use client";

import { useRouter } from "next/navigation";
import { useLearnStore } from "@/stores/learn-store";
import { UNITS } from "@/data/lessons";
import type { Unit } from "@/data/lessons";
import { CheckCircle2, Circle, Lock } from "lucide-react";

// Hard-coded prerequisite map: unitId → unitIds that must be fully complete first
const UNIT_PREREQUISITES: Record<string, string[]> = {
  basics: [],
  orders: ["basics"],
  indicators: ["basics"],
  risk: ["basics"],
  fundamentals: ["orders", "indicators"],
  "personal-finance": ["basics"],
};

type UnitStatus = "locked" | "in-progress" | "completed";

interface UnitProgressInfo {
  unit: Unit;
  status: UnitStatus;
  completedCount: number;
  totalCount: number;
  firstIncompleteLesson: string | null;
  firstIncompleteLessonTitle: string | null;
}

function computeUnitStatus(
  unit: Unit,
  completedLessons: string[],
  allUnits: Unit[],
): UnitStatus {
  const allCompleted = unit.lessons.every((l) => completedLessons.includes(l.id));
  if (allCompleted) return "completed";

  const prereqs = UNIT_PREREQUISITES[unit.id] ?? [];
  const prereqsMet = prereqs.every((prereqId) => {
    const prereqUnit = allUnits.find((u) => u.id === prereqId);
    if (!prereqUnit) return true;
    return prereqUnit.lessons.every((l) => completedLessons.includes(l.id));
  });

  if (!prereqsMet) return "locked";
  return "in-progress";
}

const STATUS_CIRCLE_COLOR: Record<UnitStatus, string> = {
  locked: "text-muted-foreground/40",
  "in-progress": "text-primary",
  completed: "text-green-500",
};

const STATUS_LABEL_CLASS: Record<UnitStatus, string> = {
  locked: "text-muted-foreground/50",
  "in-progress": "text-primary text-[10px] font-medium",
  completed: "text-green-500 text-[10px] font-medium",
};

const STATUS_LABEL_TEXT: Record<UnitStatus, string> = {
  locked: "Locked",
  "in-progress": "In Progress",
  completed: "Completed",
};

export function LearningPath() {
  const router = useRouter();
  const completedLessons = useLearnStore((s) => s.completedLessons);

  const progressInfos: UnitProgressInfo[] = UNITS.map((unit) => {
    const status = computeUnitStatus(unit, completedLessons, UNITS);
    const completedCount = unit.lessons.filter((l) =>
      completedLessons.includes(l.id),
    ).length;
    const totalCount = unit.lessons.length;

    const firstIncomplete = unit.lessons.find(
      (l) => !completedLessons.includes(l.id),
    );

    return {
      unit,
      status,
      completedCount,
      totalCount,
      firstIncompleteLesson: firstIncomplete?.id ?? null,
      firstIncompleteLessonTitle: firstIncomplete?.title ?? null,
    };
  });

  return (
    <div className="relative flex flex-col">
      {/* Vertical timeline line */}
      <div
        className="pointer-events-none absolute left-4 top-4 bottom-4 w-px bg-border/50"
        aria-hidden="true"
      />

      {progressInfos.map((info, i) => {
        const { unit, status, completedCount, totalCount, firstIncompleteLesson, firstIncompleteLessonTitle } = info;
        const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        const isLast = i === progressInfos.length - 1;

        return (
          <div key={unit.id} className={`relative flex gap-4 ${isLast ? "" : "pb-5"}`}>
            {/* Timeline node */}
            <div className="relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-card border border-border">
              {status === "completed" ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : status === "locked" ? (
                <Lock className="h-3.5 w-3.5 text-muted-foreground/40" />
              ) : (
                <Circle className={`h-4 w-4 ${STATUS_CIRCLE_COLOR[status]}`} />
              )}
            </div>

            {/* Unit card */}
            <div
              className={`flex-1 rounded-lg border bg-card p-3 ${
                status === "locked" ? "opacity-50" : ""
              }`}
            >
              {/* Card header */}
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-medium leading-snug">{unit.title}</h3>
                  <p className="mt-0.5 text-[11px] text-muted-foreground leading-tight">
                    {unit.description}
                  </p>
                </div>
                <span className={`flex-shrink-0 text-[10px] ${STATUS_LABEL_CLASS[status]}`}>
                  {STATUS_LABEL_TEXT[status]}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mb-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/40">
                  <div
                    className={`h-full rounded-full transition-all ${
                      status === "completed"
                        ? "bg-green-500"
                        : status === "in-progress"
                        ? "bg-primary"
                        : "bg-muted-foreground/20"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="flex-shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
                  {completedCount}/{totalCount}
                </span>
              </div>

              {/* Next lesson button */}
              {status !== "locked" && status !== "completed" && firstIncompleteLesson && (
                <button
                  type="button"
                  onClick={() => router.push(`/learn/${firstIncompleteLesson}`)}
                  className="mt-1 w-full rounded-md border border-border/60 bg-muted/30 px-2.5 py-1.5 text-left transition-colors hover:bg-accent/40"
                >
                  <span className="block text-[10px] text-muted-foreground">Next lesson</span>
                  <span className="block truncate text-[11px] font-medium leading-snug">
                    {firstIncompleteLessonTitle}
                  </span>
                </button>
              )}

              {status === "completed" && (
                <button
                  type="button"
                  onClick={() => router.push(`/learn/${unit.lessons[0].id}`)}
                  className="mt-1 w-full rounded-md border border-border/60 bg-muted/30 px-2.5 py-1.5 text-left transition-colors hover:bg-accent/40"
                >
                  <span className="block text-[11px] text-green-500 font-medium">Review unit</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
