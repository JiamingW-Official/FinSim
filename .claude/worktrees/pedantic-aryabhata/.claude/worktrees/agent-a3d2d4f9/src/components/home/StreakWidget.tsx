"use client";

import { useMemo } from "react";
import { Flame, BookOpen, CheckCircle2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/stores/game-store";
import { useLearnStore } from "@/stores/learn-store";
import { useQuestStore } from "@/stores/quest-store";
import { getDailyQuests } from "@/data/quests/quest-seed";
import { LEVEL_THRESHOLDS, getXPForNextLevel } from "@/types/game";

/* ------------------------------------------------------------------ */
/*  XP progress helper                                                 */
/* ------------------------------------------------------------------ */

function getXPProgress(xp: number, level: number): { earned: number; needed: number; pct: number } {
  const currentLevelXP = level > 1 ? LEVEL_THRESHOLDS[level - 2] : 0;
  const nextLevelXP = getXPForNextLevel(level);
  const range = nextLevelXP - currentLevelXP;
  const earned = xp - currentLevelXP;
  const pct = range > 0 ? Math.min(100, Math.round((earned / range) * 100)) : 100;
  return { earned, needed: range, pct };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function StreakWidget() {
  const level = useGameStore((s) => s.level);
  const xp = useGameStore((s) => s.xp);
  const dailyStreakCount = useQuestStore((s) => s.dailyStreakCount);
  const learningStreak = useLearnStore((s) => s.learningStreak);
  const dailyProgress = useQuestStore((s) => s.dailyProgress);
  const dailyDate = useQuestStore((s) => s.dailyDate);

  const { pct: xpPct, earned: xpEarned, needed: xpNeeded } = useMemo(
    () => getXPProgress(xp, level),
    [xp, level],
  );

  // Count completed daily quests
  const { totalQuests, completedQuests } = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const quests = getDailyQuests(dailyDate || today);
    const completed = quests.filter(
      (q) => dailyProgress[q.id]?.claimedAt != null,
    ).length;
    return { totalQuests: quests.length, completedQuests: completed };
  }, [dailyProgress, dailyDate]);

  return (
    <div className="surface-card p-4">
      <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Your Progress
      </h2>

      {/* XP bar */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star className="h-3 w-3 text-primary" />
            <span className="text-[11px] font-semibold">Level {level}</span>
          </div>
          <span className="text-[10px] tabular-nums text-muted-foreground">
            {xpEarned.toLocaleString()} / {xpNeeded.toLocaleString()} XP
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted/20">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700"
            style={{ width: `${xpPct}%` }}
          />
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">
          {xpNeeded - xpEarned > 0
            ? `${(xpNeeded - xpEarned).toLocaleString()} XP to next level`
            : "Max level reached"}
        </p>
      </div>

      {/* Streak row */}
      <div className="grid grid-cols-3 gap-2">
        <StreakCell
          icon={<Flame className="h-4 w-4 text-orange-400" />}
          label="Trading"
          value={dailyStreakCount > 0 ? `${dailyStreakCount}d` : "--"}
          sub="Quest streak"
          active={dailyStreakCount > 0}
        />
        <StreakCell
          icon={<BookOpen className="h-4 w-4 text-blue-400" />}
          label="Learning"
          value={learningStreak > 0 ? `${learningStreak}d` : "--"}
          sub="Daily lessons"
          active={learningStreak > 0}
        />
        <StreakCell
          icon={<CheckCircle2 className="h-4 w-4 text-green-400" />}
          label="Missions"
          value={`${completedQuests}/${totalQuests}`}
          sub="Today"
          active={completedQuests > 0}
          highlight={completedQuests === totalQuests && totalQuests > 0}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Streak cell                                                        */
/* ------------------------------------------------------------------ */

function StreakCell({
  icon,
  label,
  value,
  sub,
  active,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  active: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 rounded-lg border py-2.5 text-center transition-colors",
        highlight
          ? "border-green-500/30 bg-green-500/6"
          : active
            ? "border-border/50 bg-muted/10"
            : "border-border/20 bg-muted/5",
      )}
    >
      {icon}
      <p
        className={cn(
          "text-sm font-bold tabular-nums leading-none",
          active ? "" : "text-muted-foreground",
        )}
      >
        {value}
      </p>
      <p className="text-[9px] text-muted-foreground">{label}</p>
      <p className="text-[9px] text-muted-foreground/60">{sub}</p>
    </div>
  );
}
