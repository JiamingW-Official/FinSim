"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
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

const TABS: Array<{ id: Tab; label: string }> = [
 { id: "active", label: "Active" },
 { id: "map", label: "Map" },
 { id: "tree", label: "Skill Tree" },
 { id: "monthly", label: "Monthly" },
 { id: "season", label: "Season" },
];

// ── Active Quests sub-tabs ────────────────────────────────────

type ActiveSubTab = "daily" | "weekly" | "monthly_quests" | "milestones";

// ── Simple Quest Card ─────────────────────────────────────────

function SimpleQuestCard({
 quest,
 progress,
}: {
 quest: SimpleQuest;
 progress: number;
 delay: number;
}) {
 const pct = Math.min(100, (progress / quest.target) * 100);
 const isComplete = progress >= quest.target;

 const progressLabel = quest.id === "daily_60_winrate"
 ? `${progress}% / ${quest.target}%`
 : `${progress} / ${quest.target}`;

 return (
 <div
 className={cn(
 "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
 isComplete
 ? "opacity-50"
 : "hover:bg-muted/40",
 )}
 >
 {/* Completion dot */}
 <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", isComplete ? "bg-muted-foreground/30" : "border border-muted-foreground/20")} />

 {/* Title */}
 <span className={cn("text-xs truncate min-w-0 flex-shrink-0", isComplete ? "line-through text-muted-foreground" : "text-foreground")}>
 {quest.title}
 </span>

 {/* Thin progress bar */}
 <div className="flex-1 min-w-[80px]">
 <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
 <div
 className={cn("h-full rounded-full transition-colors", isComplete ? "bg-muted-foreground/30" : "bg-muted-foreground/40")}
 style={{ width: `${pct}%` }}
 />
 </div>
 </div>

 {/* Progress text */}
 <span className="text-[11px] font-mono tabular-nums text-muted-foreground shrink-0">
 {progressLabel}
 </span>

 {/* Reward */}
 <span className={cn("text-[11px] font-mono tabular-nums shrink-0", isComplete ? "text-muted-foreground" : "text-muted-foreground")}>
 +{quest.xpReward}
 </span>
 </div>
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
 {/* Sub-tabs — plain text, not pills */}
 <div className="flex gap-4 border-b border-border pb-1">
 {SUB_TABS.map((t) => (
 <button
 key={t.id}
 type="button"
 onClick={() => setSub(t.id)}
 className={cn(
 "pb-1.5 text-xs font-medium transition-colors border-b-2",
 sub === t.id
 ? "border-foreground text-foreground"
 : "border-transparent text-muted-foreground hover:text-foreground",
 )}
 >
 {t.label}
 </button>
 ))}
 </div>

 {/* Content */}
 <div>
 {sub === "daily" && <QuestDailyTab />}
 {sub === "weekly" && <QuestWeeklyTab />}
 {sub === "monthly_quests" && (
 <MonthlyQuestsSection gameSnapshot={gameSnapshot} />
 )}
 {sub === "milestones" && <QuestMilestoneTab />}
 </div>
 </div>
 );
}

// ── Quest Map Tab ─────────────────────────────────────────────

function QuestMapTab() {
 return (
 <div className="space-y-4">
 <QuestMap />
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
 <div className="border-b border-border px-4 py-3">
 <div className="flex items-center gap-3">
 <div>
 <h1 className="text-sm font-serif font-medium tracking-tight">Objectives</h1>
 <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
 Daily and weekly objectives
 </p>
 </div>
 <div className="flex-1" />
 {/* Stats inline */}
 <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
 <span className="font-mono tabular-nums">{completedDailyCount}/{DAILY_QUESTS.length} daily</span>
 <span className="font-mono tabular-nums">{completedWeeklyCount}/{WEEKLY_QUESTS.length} weekly</span>
 {dailyStreak > 0 && (
 <span className="font-mono tabular-nums">{dailyStreak}d streak</span>
 )}
 <span className="font-mono tabular-nums">{totalCompleted} total</span>
 </div>
 </div>
 </div>

 {/* Tabs */}
 <div className="flex border-b border-border">
 {TABS.map(({ id, label }) => (
 <button
 key={id}
 type="button"
 onClick={() => setTab(id)}
 className={cn(
 "border-b-2 px-4 py-2 text-xs font-medium transition-colors",
 tab === id
 ? "border-foreground text-foreground"
 : "border-transparent text-muted-foreground hover:text-foreground",
 )}
 >
 {label}
 </button>
 ))}
 </div>

 {/* Content */}
 <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
 <div className="mx-auto max-w-2xl">
 {tab === "active" && <ActiveQuestsTab />}
 {tab === "map" && <QuestMapTab />}
 {tab === "tree" && <QuestTree />}
 {tab === "monthly" && <MonthlyChallenges />}
 {tab === "season" && <SeasonPreview />}
 </div>
 </div>
 </div>
 );
}

