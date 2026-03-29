"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ScrollText,
  Map,
  CalendarDays,
  Zap,
  Trophy,
  Flame,
  Star,
  GitBranch,
} from "lucide-react";

// Existing quest system tabs
import { QuestDailyTab } from "@/components/quests/QuestDailyTab";
import { QuestWeeklyTab } from "@/components/quests/QuestWeeklyTab";
import { MonthlyChallenges } from "@/components/quests/MonthlyChallenges";
import { SeasonPreview } from "@/components/quests/SeasonPreview";
import { QuestMap } from "@/components/quests/QuestMap";
import { QuestMilestoneTab } from "@/components/quests/QuestMilestoneTab";
import { QuestTree } from "@/components/quests/QuestTree";

// New simple quests data
import {
  DAILY_QUESTS,
  WEEKLY_QUESTS,
  MONTHLY_QUESTS,
  computeQuestProgress,
  type SimpleQuest,
  type QuestGameState,
} from "@/data/quests";

import { useQuestStore } from "@/stores/quest-store";
import { useGameStore } from "@/stores/game-store";
import { useLearnStore } from "@/stores/learn-store";
import { useBacktestStore } from "@/stores/backtest-store";

// ── Tabs ──────────────────────────────────────────────────────

type Tab = "active" | "map" | "tree" | "monthly" | "season";

const TABS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
  { id: "active", label: "Active Quests", icon: <ScrollText className="h-3.5 w-3.5" /> },
  { id: "map", label: "Quest Map", icon: <Map className="h-3.5 w-3.5" /> },
  { id: "tree", label: "Skill Tree", icon: <GitBranch className="h-3.5 w-3.5" /> },
  { id: "monthly", label: "Monthly", icon: <CalendarDays className="h-3.5 w-3.5" /> },
  { id: "season", label: "Season", icon: <Star className="h-3.5 w-3.5" /> },
];

// ── Active Quests sub-tabs ────────────────────────────────────

type ActiveSubTab = "daily" | "weekly" | "monthly_quests" | "milestones";

// ── Simple Quest Card ─────────────────────────────────────────

function SimpleQuestCard({
  quest,
  progress,
  delay,
}: {
  quest: SimpleQuest;
  progress: number;
  delay: number;
}) {
  const pct = Math.min(100, (progress / quest.target) * 100);
  const isComplete = progress >= quest.target;

  const timeLabel =
    quest.category === "daily"
      ? "Daily"
      : quest.category === "weekly"
        ? "Weekly"
        : "Monthly";

  const timeBadgeClass =
    quest.category === "daily"
      ? "bg-primary/10 text-primary border-border"
      : quest.category === "weekly"
        ? "bg-primary/10 text-primary border-border"
        : "bg-amber-500/10 text-amber-400 border-amber-500/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25 }}
      className={cn(
        "rounded-lg cursor-pointer transition-colors",
        isComplete
          ? "bg-card/30 opacity-60 p-2"
          : pct > 0
            ? "border-l-4 border-l-primary bg-card p-4 hover:bg-muted/50"
            : "bg-card/50 p-3 hover:bg-muted/50",
      )}
    >
      {isComplete ? (
        /* Crushed completed quest — single-line */
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-emerald-400/70 truncate flex-1">{quest.title}</span>
          <span className="text-[11px] text-muted-foreground/50">{timeLabel}</span>
          <span className="text-[11px] text-emerald-400/50 tabular-nums">{quest.xpReward} XP</span>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={cn(
                  "truncate",
                  pct > 0 ? "text-sm font-medium" : "text-xs font-normal text-foreground",
                )}
              >
                {quest.title}
              </h3>
              <span
                className={cn(
                  "shrink-0 rounded border px-1.5 py-0.5 text-[11px] font-medium",
                  timeBadgeClass,
                )}
              >
                {timeLabel}
              </span>
            </div>

            <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">
              {quest.description}
            </p>

            {/* Progress bar */}
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">
                  {quest.id === "daily_60_winrate"
                    ? `${progress}% / ${quest.target}%`
                    : `${progress} / ${quest.target}`}
                </span>
                <span className="font-medium tabular-nums text-muted-foreground">
                  {Math.round(pct)}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: delay + 0.1 }}
                />
              </div>
            </div>
          </div>

          {/* XP chip */}
          <div className="shrink-0 flex items-center gap-1 rounded-full border border-border bg-muted/30 px-2 py-1">
            <Zap className="h-3 w-3 text-amber-400" />
            <span className="text-[11px] font-medium tabular-nums text-amber-400">
              {quest.xpReward} XP
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ── Active Quests — Monthly section ──────────────────────────

function MonthlyQuestsSection({ gameSnapshot }: { gameSnapshot: QuestGameState }) {
  return (
    <div className="space-y-2">
      {MONTHLY_QUESTS.map((quest, i) => {
        const progress = computeQuestProgress(quest, gameSnapshot);
        return (
          <SimpleQuestCard
            key={quest.id}
            quest={quest}
            progress={progress}
            delay={i * 0.06}
          />
        );
      })}
    </div>
  );
}

// ── Active Quests Tab ─────────────────────────────────────────

function ActiveQuestsTab() {
  const [sub, setSub] = useState<ActiveSubTab>("daily");

  // Build game snapshot for simple quests
  const gameStats = useGameStore((s) => s.stats);
  const xp = useGameStore((s) => s.xp);
  const level = useGameStore((s) => s.level);
  const completedLessons = useLearnStore((s) => s.completedLessons);
  const dailyLessonsCompleted = useLearnStore((s) => s.dailyLessonsCompleted);
  const totalBacktestsRun = useBacktestStore((s) => s.totalBacktestsRun);
  const dailySession = useQuestStore((s) => s.dailySession);
  const weeklySession = useQuestStore((s) => s.weeklySession);

  const gameSnapshot = useMemo<QuestGameState>(
    () => ({
      xp,
      level,
      stats: gameStats,
      completedLessons,
      dailyLessonsCompleted,
      totalBacktestsRun,
      sessionTradesCount: dailySession.sessionTradesCount,
      sessionProfitableTrades: dailySession.sessionProfitableTrades,
      sessionXPEarned: dailySession.sessionXPEarned,
      sessionLessonsCompleted: weeklySession.sessionLessonsCompleted,
      sessionBacktestsRun: weeklySession.sessionBacktestsRun,
    }),
    [
      xp,
      level,
      gameStats,
      completedLessons,
      dailyLessonsCompleted,
      totalBacktestsRun,
      dailySession,
      weeklySession,
    ],
  );

  const SUB_TABS: Array<{ id: ActiveSubTab; label: string }> = [
    { id: "daily", label: "Daily" },
    { id: "weekly", label: "Weekly" },
    { id: "monthly_quests", label: "Monthly" },
    { id: "milestones", label: "Milestones" },
  ];

  return (
    <div className="space-y-3">
      {/* Sub-tab pills */}
      <div className="flex gap-1.5 flex-wrap">
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSub(t.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              sub === t.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={sub}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {sub === "daily" && <QuestDailyTab />}
          {sub === "weekly" && <QuestWeeklyTab />}
          {sub === "monthly_quests" && (
            <MonthlyQuestsSection gameSnapshot={gameSnapshot} />
          )}
          {sub === "milestones" && <QuestMilestoneTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Quest Map Tab ─────────────────────────────────────────────

function QuestMapTab() {
  return (
    <div>
      {/* Skill tree header — hero card (dominant, accent) */}
      <div className="border-l-4 border-primary bg-card p-6 rounded-lg">
        <p className="text-xs font-medium text-foreground mb-0.5">Skill Tree</p>
        <p className="text-[11px] text-muted-foreground">
          Complete quests to unlock new branches and milestones on your journey.
        </p>
      </div>

      {/* Buffer — breathing after hero */}
      <div className="mt-10" />

      {/* QuestMap component */}
      <QuestMap />

      {/* Buffer — breathing before branch grid */}
      <div className="mt-8" />

      {/* Branch overview grid */}
      <BranchGrid />
    </div>
  );
}

// ── Branch grid (skill tree branches) ────────────────────────

interface Branch {
  id: string;
  name: string;
  description: string;
  unlockAt: number; // total quests completed
  nodes: Array<{ label: string; xp: number }>;
  color: string;
  borderColor: string;
}

const BRANCHES: Branch[] = [
  {
    id: "beginner",
    name: "Beginner",
    description: "Learn the basics of trading and the platform.",
    unlockAt: 0,
    color: "text-emerald-400",
    borderColor: "border-emerald-500/20",
    nodes: [
      { label: "First Trade", xp: 25 },
      { label: "First Lesson", xp: 25 },
      { label: "Trade x10", xp: 100 },
    ],
  },
  {
    id: "trading",
    name: "Trading Journey",
    description: "Master order execution and market reading.",
    unlockAt: 1,
    color: "text-muted-foreground",
    borderColor: "border-cyan-500/20",
    nodes: [
      { label: "50 Trades", xp: 200 },
      { label: "Profitable Week", xp: 250 },
      { label: "100 Trades", xp: 400 },
    ],
  },
  {
    id: "indicators",
    name: "Indicators Mastery",
    description: "Use technical indicators to drive decisions.",
    unlockAt: 5,
    color: "text-primary",
    borderColor: "border-border",
    nodes: [
      { label: "5 Tickers", xp: 150 },
      { label: "Backtest x5", xp: 200 },
      { label: "Save Strategy", xp: 300 },
    ],
  },
  {
    id: "options",
    name: "Derivatives Mastery",
    description: "Navigate options strategies and complex trades.",
    unlockAt: 15,
    color: "text-amber-400",
    borderColor: "border-amber-500/20",
    nodes: [
      { label: "First Options", xp: 200 },
      { label: "Spread Trade", xp: 300 },
      { label: "Options Expert", xp: 750 },
    ],
  },
];

function BranchGrid() {
  const totalCompleted = useQuestStore((s) => s.totalQuestsCompleted);

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {BRANCHES.map((branch, bi) => {
        const isUnlocked = totalCompleted >= branch.unlockAt;

        return (
          <motion.div
            key={branch.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: bi * 0.07 }}
            className={cn(
              "bg-card/50 rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors",
              !isUnlocked && "opacity-50",
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("text-xs font-medium", isUnlocked ? branch.color : "text-muted-foreground")}>
                {branch.name}
              </span>
              {!isUnlocked && (
                <span className="text-[11px] font-medium text-muted-foreground border border-border rounded px-1 py-0.5">
                  {branch.unlockAt} quests to unlock
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mb-2.5">
              {branch.description}
            </p>

            {/* Node row with SVG connections */}
            <div className="flex items-center gap-0">
              {branch.nodes.map((node, ni) => (
                <div key={ni} className="flex items-center">
                  {ni > 0 && (
                    <div
                      className={cn(
                        "h-px w-6",
                        isUnlocked ? "bg-border" : "bg-muted",
                      )}
                    />
                  )}
                  <div
                    className={cn(
                      "flex flex-col items-center gap-0.5",
                    )}
                  >
                    <div
                      className={cn(
                        "h-5 w-5 rounded-full border flex items-center justify-center text-[11px] font-medium",
                        isUnlocked
                          ? cn("border-current", branch.color)
                          : "border-border text-muted-foreground",
                      )}
                    >
                      {ni + 1}
                    </div>
                    <span className="text-[11px] text-muted-foreground text-center w-14 truncate">
                      {node.label}
                    </span>
                    <span
                      className={cn(
                        "text-[11px] font-medium",
                        isUnlocked ? "text-amber-400" : "text-muted-foreground",
                      )}
                    >
                      +{node.xp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────

export default function QuestsPage() {
  const [tab, setTab] = useState<Tab>("active");
  const totalCompleted = useQuestStore((s) => s.totalQuestsCompleted);
  const dailyStreak = useQuestStore((s) => s.dailyStreakCount);

  // Count today's completed simple daily quests (for badge)
  const gameStats = useGameStore((s) => s.stats);
  const xp = useGameStore((s) => s.xp);
  const level = useGameStore((s) => s.level);
  const completedLessons = useLearnStore((s) => s.completedLessons);
  const dailyLessonsCompleted = useLearnStore((s) => s.dailyLessonsCompleted);
  const totalBacktestsRun = useBacktestStore((s) => s.totalBacktestsRun);
  const dailySession = useQuestStore((s) => s.dailySession);
  const weeklySession = useQuestStore((s) => s.weeklySession);

  const gameSnapshot = useMemo<QuestGameState>(
    () => ({
      xp,
      level,
      stats: gameStats,
      completedLessons,
      dailyLessonsCompleted,
      totalBacktestsRun,
      sessionTradesCount: dailySession.sessionTradesCount,
      sessionProfitableTrades: dailySession.sessionProfitableTrades,
      sessionXPEarned: dailySession.sessionXPEarned,
      sessionLessonsCompleted: weeklySession.sessionLessonsCompleted,
      sessionBacktestsRun: weeklySession.sessionBacktestsRun,
    }),
    [
      xp,
      level,
      gameStats,
      completedLessons,
      dailyLessonsCompleted,
      totalBacktestsRun,
      dailySession,
      weeklySession,
    ],
  );

  const completedDailyCount = useMemo(
    () =>
      DAILY_QUESTS.filter(
        (q) => computeQuestProgress(q, gameSnapshot) >= q.target,
      ).length,
    [gameSnapshot],
  );

  const completedWeeklyCount = useMemo(
    () =>
      WEEKLY_QUESTS.filter(
        (q) => computeQuestProgress(q, gameSnapshot) >= q.target,
      ).length,
    [gameSnapshot],
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <ScrollText className="h-4.5 w-4.5 text-primary" />
          </motion.div>
          <div>
            <h1 className="text-sm font-medium">Quest Board</h1>
            <p className="text-[11px] text-muted-foreground">
              Complete quests across all game modes to earn XP and unlock rewards
            </p>
          </div>
          <div className="flex-1" />
          <motion.div
            className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 400, damping: 15 }}
          >
            <Trophy className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium text-primary">
              {totalCompleted} completed
            </span>
          </motion.div>
        </div>

        {/* Stats strip — flow cards (borderless, content-like) */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <motion.div
            className="flex items-center gap-1.5 bg-transparent p-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[11px] font-medium tabular-nums text-amber-400">
              {completedDailyCount}/{DAILY_QUESTS.length}
            </span>
            <span className="text-[11px] text-muted-foreground">daily</span>
          </motion.div>

          <motion.div
            className="flex items-center gap-1.5 bg-transparent p-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.13 }}
          >
            <CalendarDays className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-medium tabular-nums text-primary">
              {completedWeeklyCount}/{WEEKLY_QUESTS.length}
            </span>
            <span className="text-[11px] text-muted-foreground">weekly</span>
          </motion.div>

          {dailyStreak > 0 && (
            <motion.div
              className="flex items-center gap-1.5 bg-transparent p-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
            >
              <Flame className="h-3.5 w-3.5 text-orange-400" />
              <span className="text-[11px] font-medium tabular-nums text-orange-400">
                {dailyStreak}
              </span>
              <span className="text-[11px] text-muted-foreground">day streak</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border px-4">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide">
          {TABS.map(({ id, label, icon }) => (
            <TabButton
              key={id}
              label={label}
              icon={icon}
              active={tab === id}
              onClick={() => setTab(id)}
            />
          ))}
        </div>
      </div>

      {/* Content — generous top padding for breathing after tab bar */}
      <div className="flex-1 overflow-y-auto px-4 pt-8 pb-6">
        <div className="mx-auto max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {tab === "active" && <ActiveQuestsTab />}
              {tab === "map" && <QuestMapTab />}
              {tab === "tree" && <QuestTree />}
              {tab === "monthly" && <MonthlyChallenges />}
              {tab === "season" && <SeasonPreview />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── Tab button ────────────────────────────────────────────────

function TabButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-1.5 whitespace-nowrap px-4 py-2.5 text-xs font-medium transition-colors",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
      {active && (
        <motion.span
          layoutId="quest-tab-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
    </button>
  );
}
