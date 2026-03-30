"use client";

import { useRouter } from "next/navigation";
import { Clock, Calendar } from "lucide-react";
import { useLearnStore } from "@/stores/learn-store";
import { UNITS } from "@/data/lessons";
import type { Lesson, Unit } from "@/data/lessons";

// mulberry32 seeded PRNG — same pattern used elsewhere in the codebase
function mulberry32(seed: number): () => number {
  let s = seed;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface DailyLesson {
  lesson: Lesson;
  unit: Unit;
}

function pickDailyLesson(): DailyLesson {
  // Flatten all lessons across all units
  const allLessons: Array<{ lesson: Lesson; unit: Unit }> = [];
  for (const unit of UNITS) {
    for (const lesson of unit.lessons) {
      allLessons.push({ lesson, unit });
    }
  }

  if (allLessons.length === 0) {
    // Fallback — should never happen
    return { lesson: UNITS[0].lessons[0], unit: UNITS[0] };
  }

  const seed = Math.floor(Date.now() / 86400000); // changes once per day
  const rand = mulberry32(seed);
  const index = Math.floor(rand() * allLessons.length);
  return allLessons[index];
}

export function DailyLessonCard() {
  const router = useRouter();
  const learningStreak = useLearnStore((s) => s.learningStreak);
  const lastLearnDate = useLearnStore((s) => s.lastLearnDate);

  const { lesson, unit } = pickDailyLesson();

  const todayStr = new Date().toISOString().slice(0, 10);
  const learnedToday = lastLearnDate === todayStr;

  return (
    <div className="rounded-lg border bg-card p-4">
      {/* Header row */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 items-center rounded-md bg-primary/10 px-2">
            <Calendar className="mr-1 h-3 w-3 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
              Daily Lesson
            </span>
          </div>
        </div>
        {/* Streak indicator */}
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <span className="font-medium tabular-nums">
            {learningStreak > 0 ? `Day ${learningStreak}` : "Start streak"}
          </span>
          <span className="text-muted-foreground/50">of your learning streak</span>
        </div>
      </div>

      {/* Lesson info */}
      <div className="mb-3">
        <h3 className="text-sm font-semibold leading-snug">{lesson.title}</h3>
        <p className="mt-0.5 text-[11px] text-muted-foreground leading-tight">
          {lesson.description}
        </p>
      </div>

      {/* Meta row */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>3 min</span>
        </div>
        <span className="text-muted-foreground/40">·</span>
        <span className="text-[11px] text-muted-foreground">{unit.title}</span>
        {learnedToday && (
          <>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-[11px] text-green-500 font-medium">Studied today</span>
          </>
        )}
      </div>

      {/* CTA button */}
      <button
        type="button"
        onClick={() => router.push(`/learn/${lesson.id}`)}
        className="w-full rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 active:opacity-80"
      >
        Start Today&apos;s Lesson
      </button>
    </div>
  );
}
