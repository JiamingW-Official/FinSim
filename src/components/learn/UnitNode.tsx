"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Unit } from "@/data/lessons/types";
import type { LessonScoreBreakdown } from "@/types/game";
import { LessonNode, gradeToStars } from "./LessonNode";
import { isLessonUnlocked } from "@/data/lessons";

interface UnitNodeProps {
  unit: Unit;
  unitIndex: number;
  completedLessons: string[];
  lessonScores: Record<string, LessonScoreBreakdown>;
  isUnitUnlocked: boolean;
  delay: number;
}

function getMasteryLevel(
  unit: Unit,
  completedLessons: string[],
  lessonScores: Record<string, LessonScoreBreakdown>,
): "none" | "bronze" | "silver" | "gold" {
  const allDone = unit.lessons.every((l) => completedLessons.includes(l.id));
  if (!allDone) return "none";

  const allGold = unit.lessons.every((l) => {
    const s = lessonScores[l.id];
    return s && (s.grade === "S" || s.grade === "A");
  });
  if (allGold) return "gold";

  const allSilver = unit.lessons.every((l) => {
    const s = lessonScores[l.id];
    return s && (s.grade === "S" || s.grade === "A" || s.grade === "B");
  });
  if (allSilver) return "silver";

  return "bronze";
}

const MASTERY_COLORS = {
  none: "",
  bronze: "#cd7f32",
  silver: "#c0c0c0",
  gold: "#ffd700",
};

const MASTERY_LABELS = {
  none: "",
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
};

export function UnitNode({
  unit,
  unitIndex,
  completedLessons,
  lessonScores,
  isUnitUnlocked,
  delay,
}: UnitNodeProps) {
  const [expanded, setExpanded] = useState(isUnitUnlocked);
  const mastery = getMasteryLevel(unit, completedLessons, lessonScores);
  const completedCount = unit.lessons.filter((l) =>
    completedLessons.includes(l.id),
  ).length;

  const isRight = unitIndex % 2 === 1;
  const progressPct = (completedCount / unit.lessons.length) * 100;

  return (
    <motion.div
      className={cn(
        "flex flex-col",
        isRight ? "items-end" : "items-start",
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      {/* Unit header */}
      <button
        type="button"
        onClick={() => isUnitUnlocked && setExpanded(!expanded)}
        disabled={!isUnitUnlocked}
        className={cn(
          "group relative flex items-center gap-3 rounded-2xl border-2 p-4 transition-all overflow-hidden",
          isUnitUnlocked
            ? "cursor-pointer hover:bg-accent/50"
            : "cursor-not-allowed opacity-40",
          mastery !== "none"
            ? "border-[var(--mastery-color)]"
            : isUnitUnlocked
              ? "border-[var(--unit-color)]/50"
              : "border-border/30",
        )}
        style={{
          "--unit-color": unit.color,
          "--mastery-color": MASTERY_COLORS[mastery] || unit.color,
        } as React.CSSProperties}
      >
        {/* Gradient glow at top edge */}
        {isUnitUnlocked && (
          <div
            className="absolute inset-x-0 top-0 h-px opacity-60"
            style={{
              background: `linear-gradient(90deg, transparent, ${mastery !== "none" ? MASTERY_COLORS[mastery] : unit.color}, transparent)`,
            }}
          />
        )}

        {/* Icon circle with radial gradient */}
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 text-lg transition-all",
            isUnitUnlocked
              ? mastery !== "none"
                ? "border-[var(--mastery-color)] shadow-[0_0_12px_var(--mastery-color)]"
                : "border-[var(--unit-color)] shadow-[0_0_12px_var(--unit-color)]"
              : "border-muted bg-muted/30",
          )}
          style={{
            background: isUnitUnlocked
              ? `radial-gradient(circle at 30% 30%, ${mastery !== "none" ? MASTERY_COLORS[mastery] : unit.color}25, ${mastery !== "none" ? MASTERY_COLORS[mastery] : unit.color}08)`
              : undefined,
          }}
        >
          {!isUnitUnlocked ? (
            <Lock className="h-5 w-5 text-muted-foreground" />
          ) : (
            <span className="text-xl">
              {unitIndex === 0 ? "📚" : unitIndex === 1 ? "📋" : unitIndex === 2 ? "📈" : unitIndex === 3 ? "🛡️" : "💰"}
            </span>
          )}
        </div>

        <div className="text-left flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={cn(
              "text-sm font-bold",
              !isUnitUnlocked && "text-muted-foreground",
            )}>
              {unit.title}
            </h3>
            {mastery !== "none" && (
              <span
                className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase"
                style={{
                  color: MASTERY_COLORS[mastery],
                  background: `${MASTERY_COLORS[mastery]}20`,
                }}
              >
                {MASTERY_LABELS[mastery]}
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground">
            {unit.description}
          </p>
          {/* Progress bar */}
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1 flex-1 rounded-full bg-muted/50 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: unit.color }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.6, delay: delay + 0.2 }}
              />
            </div>
            <span className="text-[9px] tabular-nums text-muted-foreground">
              {completedCount}/{unit.lessons.length}
            </span>
          </div>
        </div>

        {isUnitUnlocked && (
          <ChevronDown
            className={cn(
              "ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              expanded && "rotate-180",
            )}
          />
        )}
      </button>

      {/* Lesson list */}
      <AnimatePresence>
        {expanded && isUnitUnlocked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className={cn(
              "flex flex-col gap-2 overflow-hidden pt-2",
              isRight ? "items-end pr-6" : "items-start pl-6",
            )}
          >
            {/* Connecting line */}
            <div
              className={cn(
                "absolute h-full w-0.5 bg-border/30",
                isRight ? "right-10" : "left-10",
              )}
              style={{ top: 0 }}
            />

            {unit.lessons.map((lesson, li) => {
              const unlocked = isLessonUnlocked(lesson.id, completedLessons);
              const completed = completedLessons.includes(lesson.id);
              const scoreData = lessonScores[lesson.id];
              const stars = scoreData ? gradeToStars(scoreData.grade) : 0;

              return (
                <LessonNode
                  key={lesson.id}
                  lesson={lesson}
                  isUnlocked={unlocked}
                  isCompleted={completed}
                  stars={stars}
                  unitColor={unit.color}
                  delay={li * 0.08}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
