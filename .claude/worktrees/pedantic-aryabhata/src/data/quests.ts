// ── Quests data and progress computation ──────────────────────
// Exports simplified quest definitions and a progress helper that
// reads directly from game/learn store state snapshots.

// ── Types ─────────────────────────────────────────────────────

export type QuestTimeframe = "daily" | "weekly" | "monthly";

export interface SimpleQuest {
 id: string;
 title: string;
 description: string;
 category: QuestTimeframe;
 /** Numeric target for progress (e.g. 3 for "make 3 trades") */
 target: number;
 xpReward: number;
 /** Minimum player level required to see this quest */
 unlockLevel: number;
}

/** Minimal game-state snapshot used by computeQuestProgress */
export interface QuestGameState {
 // From game-store
 xp: number;
 level: number;
 stats: {
 totalTrades: number;
 profitableTrades: number;
 totalPnL: number;
 consecutiveWins: number;
 optionsTradesCount: number;
 uniqueTickersTraded: string[];
 limitOrdersUsed: number;
 dailyStreak: number;
 };
 // From learn-store
 completedLessons: string[];
 dailyLessonsCompleted: number;
 // From backtest-store
 totalBacktestsRun: number;
 // Session counters (from quest-store) — used for daily/weekly
 sessionTradesCount: number;
 sessionProfitableTrades: number;
 sessionXPEarned: number;
 sessionLessonsCompleted: number;
 sessionBacktestsRun: number;
}

// ── Daily Quests ───────────────────────────────────────────────

export const DAILY_QUESTS: SimpleQuest[] = [
 {
 id: "daily_3_trades",
 title: "Make 3 Trades",
 description: "Execute at least 3 trades today to sharpen your execution skills.",
 category: "daily",
 target: 3,
 xpReward: 50,
 unlockLevel: 1,
 },
 {
 id: "daily_earn_50xp",
 title: "Earn 50 XP",
 description: "Earn 50 XP through any activity today.",
 category: "daily",
 target: 50,
 xpReward: 30,
 unlockLevel: 1,
 },
 {
 id: "daily_study_1_lesson",
 title: "Study 1 Lesson",
 description: "Complete at least one lesson in the Learn section.",
 category: "daily",
 target: 1,
 xpReward: 40,
 unlockLevel: 1,
 },
 {
 id: "daily_60_winrate",
 title: "60% Win Rate Today",
 description: "Maintain a win rate above 60% across all trades made today.",
 category: "daily",
 target: 60,
 xpReward: 75,
 unlockLevel: 3,
 },
];

// ── Weekly Quests ──────────────────────────────────────────────

export const WEEKLY_QUESTS: SimpleQuest[] = [
 {
 id: "weekly_2_units",
 title: "Complete 2 Lesson Units",
 description: "Finish two full lessons this week to build your trading knowledge.",
 category: "weekly",
 target: 2,
 xpReward: 150,
 unlockLevel: 1,
 },
 {
 id: "weekly_15_profitable",
 title: "15 Profitable Trades",
 description: "Close 15 trades in the green this week.",
 category: "weekly",
 target: 15,
 xpReward: 250,
 unlockLevel: 2,
 },
 {
 id: "weekly_options_trade",
 title: "Try Options Trading",
 description: "Place at least one options trade on the options page.",
 category: "weekly",
 target: 1,
 xpReward: 200,
 unlockLevel: 5,
 },
 {
 id: "weekly_backtest_strategy",
 title: "Backtest a Strategy",
 description: "Run at least one backtest in the Backtest Lab this week.",
 category: "weekly",
 target: 1,
 xpReward: 175,
 unlockLevel: 3,
 },
];

// ── Monthly Quests ─────────────────────────────────────────────

export const MONTHLY_QUESTS: SimpleQuest[] = [
 {
 id: "monthly_grow_5pct",
 title: "Grow Portfolio 5%",
 description: "Achieve a 5% total return on your portfolio this month.",
 category: "monthly",
 target: 5,
 xpReward: 500,
 unlockLevel: 2,
 },
 {
 id: "monthly_full_lesson_path",
 title: "Complete a Full Lesson Path",
 description: "Finish 5 or more lessons to complete a full learning path.",
 category: "monthly",
 target: 5,
 xpReward: 400,
 unlockLevel: 1,
 },
 {
 id: "monthly_10_win_streak",
 title: "10-Trade Win Streak",
 description: "Achieve a consecutive win streak of 10 or more trades.",
 category: "monthly",
 target: 10,
 xpReward: 600,
 unlockLevel: 4,
 },
 {
 id: "monthly_5_indicators",
 title: "Use 5 Different Indicators",
 description: "Trade with at least 5 unique tickers this month.",
 category: "monthly",
 target: 5,
 xpReward: 350,
 unlockLevel: 3,
 },
];

// ── Progress computation ───────────────────────────────────────

/**
 * Compute the current numeric progress value for a given quest.
 * Returns a value from 0 to quest.target.
 */
export function computeQuestProgress(
 quest: SimpleQuest,
 state: QuestGameState,
): number {
 switch (quest.id) {
 // Daily
 case "daily_3_trades":
 return Math.min(quest.target, state.sessionTradesCount);

 case "daily_earn_50xp":
 return Math.min(quest.target, state.sessionXPEarned);

 case "daily_study_1_lesson":
 return Math.min(quest.target, state.dailyLessonsCompleted);

 case "daily_60_winrate": {
 if (state.sessionTradesCount === 0) return 0;
 const rate =
 (state.sessionProfitableTrades / state.sessionTradesCount) * 100;
 return Math.min(quest.target, Math.round(rate));
 }

 // Weekly
 case "weekly_2_units":
 return Math.min(quest.target, state.sessionLessonsCompleted);

 case "weekly_15_profitable":
 return Math.min(quest.target, state.sessionProfitableTrades);

 case "weekly_options_trade":
 return Math.min(quest.target, state.stats.optionsTradesCount);

 case "weekly_backtest_strategy":
 return Math.min(quest.target, state.sessionBacktestsRun);

 // Monthly
 case "monthly_grow_5pct": {
 const returnPct = (state.stats.totalPnL / 10000) * 100;
 return Math.min(quest.target, Math.max(0, Math.round(returnPct * 10) / 10));
 }

 case "monthly_full_lesson_path":
 return Math.min(quest.target, state.completedLessons.length);

 case "monthly_10_win_streak":
 return Math.min(quest.target, state.stats.consecutiveWins);

 case "monthly_5_indicators":
 return Math.min(quest.target, state.stats.uniqueTickersTraded.length);

 default:
 return 0;
 }
}

/** All quests combined for convenience */
export const ALL_SIMPLE_QUESTS: SimpleQuest[] = [
 ...DAILY_QUESTS,
 ...WEEKLY_QUESTS,
 ...MONTHLY_QUESTS,
];
