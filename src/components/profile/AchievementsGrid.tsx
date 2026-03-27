"use client";

import { useMemo } from "react";
import { useGameStore } from "@/stores/game-store";
import { ACHIEVEMENT_DEFS } from "@/types/game";
import { Lock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

// Lucide icon registry for rendering achievement icons by string name
import {
  Zap, TrendingUp, Flame, Activity, Award, TrendingDown, Target,
  DollarSign, Layers, Shield, GitBranch, LineChart, Eye, Trophy as TrophyIcon,
  BarChart3, BookOpen, GraduationCap, Sun, BarChart2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_REGISTRY: Record<string, LucideIcon> = {
  Zap, TrendingUp, Flame, Activity, Award, TrendingDown, Target,
  DollarSign, Layers, Shield, GitBranch, LineChart, Eye, Trophy: TrophyIcon,
  BarChart3, BookOpen, GraduationCap, Sun, BarChart2,
};

const CATEGORY_LABELS: Record<string, string> = {
  trading: "Trading",
  learning: "Learning",
  social: "Social",
  milestones: "Milestones",
};

const CATEGORY_ORDER = ["trading", "learning", "milestones", "social"];

interface AchievementCardProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward?: number;
  unlocked: boolean;
  progress?: number;   // 0-100 for locked achievements
  progressMax?: number;
}

function AchievementCard({
  name, description, icon, xpReward, unlocked, progress, progressMax,
}: AchievementCardProps) {
  const IconComp = ICON_REGISTRY[icon] ?? Trophy;
  const hasProgress = !unlocked && typeof progress === "number" && typeof progressMax === "number" && progressMax > 0;
  const pct = hasProgress ? Math.min(100, Math.round((progress! / progressMax!) * 100)) : 0;

  return (
    <div
      className={cn(
        "relative rounded-lg border p-3 space-y-2 transition-colors",
        unlocked
          ? "border-border bg-card"
          : "border-border/40 bg-card/30 opacity-60",
      )}
    >
      {/* Lock overlay */}
      {!unlocked && (
        <div className="absolute right-2 top-2">
          <Lock className="h-3 w-3 text-muted-foreground/50" />
        </div>
      )}

      {/* Icon */}
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md",
          unlocked ? "bg-primary/10" : "bg-muted/30",
        )}
      >
        <IconComp
          className={cn(
            "h-4 w-4",
            unlocked ? "text-primary" : "text-muted-foreground/50",
          )}
        />
      </div>

      {/* Text */}
      <div className="space-y-0.5">
        <p className={cn("text-[11px] font-bold leading-tight", !unlocked && "text-muted-foreground")}>
          {name}
        </p>
        <p className="text-[9px] leading-snug text-muted-foreground line-clamp-2">
          {description}
        </p>
      </div>

      {/* XP reward badge */}
      {xpReward && (
        <div className="flex items-center gap-1">
          <Zap className="h-2.5 w-2.5 text-amber-400/70" />
          <span className="text-[9px] font-bold text-amber-400/70">
            {xpReward} XP
          </span>
        </div>
      )}

      {/* Progress bar for locked */}
      {hasProgress && (
        <div className="space-y-0.5">
          <div className="h-1 w-full rounded-full bg-muted/40 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary/40 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[9px] text-muted-foreground/70">
            {progress} / {progressMax}
          </p>
        </div>
      )}
    </div>
  );
}

export function AchievementsGrid() {
  const achievements = useGameStore((s) => s.achievements);
  const achievementProgress = useGameStore((s) => s.achievementProgress);

  const unlockedIds = useMemo(
    () => new Set(achievements.map((a) => a.id)),
    [achievements],
  );

  const unlockedCount = unlockedIds.size;
  const totalCount = ACHIEVEMENT_DEFS.length;

  // Group defs by category
  const grouped = useMemo(() => {
    const map: Record<string, typeof ACHIEVEMENT_DEFS> = {};
    for (const def of ACHIEVEMENT_DEFS) {
      const cat = def.category ?? "trading";
      if (!map[cat]) map[cat] = [];
      map[cat].push(def);
    }
    return map;
  }, []);

  // Progress targets per achievement id
  const PROGRESS_TARGETS: Record<string, number> = {
    first_profit: 1,
    ten_trades: 10,
    fifty_trades: 50,
    win_streak_5: 5,
    five_streak: 5,
    perfect_day: 3,
    risk_master: 20,
    options_explorer: 10,
    lesson_complete_5: 5,
    lesson_complete_20: 20,
    prediction_correct_5: 5,
    diversified: 5,
    limit_master: 5,
    dedicated: 7,
  };

  return (
    <div className="space-y-5">
      {/* Header stat */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-card/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-bold">Achievements</span>
        </div>
        <span className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">{unlockedCount}</span>
          {" / "}
          {totalCount} unlocked
        </span>
      </div>

      {/* Overall progress bar */}
      <div className="space-y-1.5">
        <div className="h-2 w-full rounded-full bg-muted/30 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary/60 transition-all"
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground text-right">
          {Math.round((unlockedCount / totalCount) * 100)}% complete
        </p>
      </div>

      {/* Categories */}
      {CATEGORY_ORDER.filter((cat) => grouped[cat]?.length).map((cat) => {
        const defs = grouped[cat];
        const catUnlocked = defs.filter((d) => unlockedIds.has(d.id)).length;
        return (
          <div key={cat} className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {CATEGORY_LABELS[cat] ?? cat}
              </p>
              <span className="text-[10px] text-muted-foreground">
                {catUnlocked}/{defs.length}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {defs.map((def) => {
                const progressVal = achievementProgress[def.id];
                const progressMax = PROGRESS_TARGETS[def.id];
                return (
                  <AchievementCard
                    key={def.id}
                    id={def.id}
                    name={def.name}
                    description={def.description}
                    icon={def.icon}
                    xpReward={def.xpReward}
                    unlocked={unlockedIds.has(def.id)}
                    progress={typeof progressVal === "number" ? progressVal : undefined}
                    progressMax={progressMax}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
