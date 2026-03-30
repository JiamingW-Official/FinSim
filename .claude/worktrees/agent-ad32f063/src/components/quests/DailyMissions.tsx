"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  BarChart2,
  TrendingUp,
  BookOpen,
  CreditCard,
  Layers,
  Brain,
  Flame,
  Shield,
  Book,
  Sparkles,
  CheckCircle2,
  Clock,
  Zap,
} from "lucide-react";
import {
  getDailyMissions,
  loadDailyProgress,
  saveDailyProgress,
  type DailyMission,
} from "@/data/daily-missions";

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getResetMs(): number {
  const now = new Date();
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );
  return tomorrow.getTime() - now.getTime();
}

function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  return `${h}h ${m}m`;
}

function MissionIcon({ icon, type }: { icon: string; type: DailyMission["type"] }) {
  const colorMap: Record<DailyMission["type"], string> = {
    trade: "text-cyan-400",
    learn: "text-violet-400",
    explore: "text-amber-400",
    social: "text-emerald-400",
  };
  const cls = cn("h-4 w-4", colorMap[type]);

  switch (icon) {
    case "chart":
      return <BarChart2 className={cls} />;
    case "trend-up":
      return <TrendingUp className={cls} />;
    case "book":
      return <Book className={cls} />;
    case "book-open":
      return <BookOpen className={cls} />;
    case "cards":
      return <CreditCard className={cls} />;
    case "options":
      return <Layers className={cls} />;
    case "brain":
      return <Brain className={cls} />;
    case "fire":
      return <Flame className={cls} />;
    case "shield":
      return <Shield className={cls} />;
    case "crystal":
      return <Sparkles className={cls} />;
    default:
      return <Zap className={cls} />;
  }
}

const DIFFICULTY_LABEL: Record<DailyMission["difficulty"], string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

const DIFFICULTY_COLOR: Record<DailyMission["difficulty"], string> = {
  easy: "text-emerald-400 bg-emerald-400/10",
  medium: "text-amber-400 bg-amber-400/10",
  hard: "text-red-400 bg-red-400/10",
};

const TYPE_BG: Record<DailyMission["type"], string> = {
  trade: "bg-cyan-500/10",
  learn: "bg-violet-500/10",
  explore: "bg-amber-500/10",
  social: "bg-emerald-500/10",
};

// ------------------------------------------------------------------
// Mission card
// ------------------------------------------------------------------

function MissionCard({
  mission,
  progress,
  onIncrement,
  index,
}: {
  mission: DailyMission;
  progress: number;
  onIncrement: (id: string) => void;
  index: number;
}) {
  const completed = progress >= mission.target;
  const pct = Math.min(1, progress / mission.target) * 100;

  return (
    <motion.div
      className={cn(
        "rounded-lg border bg-card p-3 flex flex-col gap-2 transition-colors",
        completed
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-border hover:border-border/80",
      )}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      {/* Top row */}
      <div className="flex items-start gap-2">
        <div
          className={cn(
            "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
            completed ? "bg-emerald-500/10" : TYPE_BG[mission.type],
          )}
        >
          {completed ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : (
            <MissionIcon icon={mission.icon} type={mission.type} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-[13px] font-bold leading-tight",
              completed && "line-through text-muted-foreground",
            )}
          >
            {mission.title}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
            {mission.description}
          </p>
        </div>
        {/* XP badge */}
        <div className="flex items-center gap-0.5 rounded-full bg-cyan-500/10 px-2 py-0.5 flex-shrink-0">
          <Zap className="h-2.5 w-2.5 text-cyan-400" />
          <span className="text-[10px] font-black text-cyan-400">
            +{mission.xpReward}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <div className="relative h-1.5 flex-1 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full",
              completed ? "bg-emerald-400" : "bg-cyan-400",
            )}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <span className="text-[10px] tabular-nums text-muted-foreground whitespace-nowrap">
          {progress}/{mission.target}
        </span>
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-[9px] font-bold",
            DIFFICULTY_COLOR[mission.difficulty],
          )}
        >
          {DIFFICULTY_LABEL[mission.difficulty]}
        </span>
      </div>

      {/* Dev helper: click to increment (only visible in dev, harmless in prod) */}
      {!completed && process.env.NODE_ENV === "development" && (
        <button
          type="button"
          onClick={() => onIncrement(mission.id)}
          className="text-[9px] text-muted-foreground/40 hover:text-muted-foreground text-left"
        >
          [dev: +1 progress]
        </button>
      )}
    </motion.div>
  );
}

// ------------------------------------------------------------------
// Main component
// ------------------------------------------------------------------

export function DailyMissions() {
  const [dateStr] = useState<string>(getTodayStr);
  const [missions] = useState<DailyMission[]>(() => getDailyMissions(getTodayStr()));
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [countdown, setCountdown] = useState<string>("");

  // Load progress from localStorage on mount
  useEffect(() => {
    setProgress(loadDailyProgress(dateStr));
  }, [dateStr]);

  // Countdown timer
  useEffect(() => {
    function update() {
      setCountdown(formatCountdown(getResetMs()));
    }
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  const handleIncrement = useCallback(
    (id: string) => {
      setProgress((prev) => {
        const mission = missions.find((m) => m.id === id);
        if (!mission) return prev;
        const current = prev[id] ?? 0;
        if (current >= mission.target) return prev;
        const next = { ...prev, [id]: current + 1 };
        saveDailyProgress(dateStr, next);
        return next;
      });
    },
    [dateStr, missions],
  );

  const completedCount = missions.filter(
    (m) => (progress[m.id] ?? 0) >= m.target,
  ).length;

  return (
    <div className="mb-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-black">Daily Missions</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {dateStr}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-1">
            <span className="text-[10px] font-bold tabular-nums">
              {completedCount}/{missions.length}
            </span>
            <span className="text-[10px] text-muted-foreground">done</span>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-border bg-card px-2 py-1">
            <Clock className="h-2.5 w-2.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">
              Resets in {countdown}
            </span>
          </div>
        </div>
      </div>

      {/* 2-column mission grid */}
      <div className="grid grid-cols-2 gap-2">
        {missions.map((mission, i) => (
          <MissionCard
            key={mission.id}
            mission={mission}
            progress={progress[mission.id] ?? 0}
            onIncrement={handleIncrement}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
