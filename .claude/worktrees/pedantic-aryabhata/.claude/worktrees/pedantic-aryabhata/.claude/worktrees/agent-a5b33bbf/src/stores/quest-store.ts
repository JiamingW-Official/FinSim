import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { QuestConditionSnapshot, QuestProgress, QuestCategory } from "@/types/quests";
import { MILESTONE_QUESTS } from "@/data/quests/quest-pool";
import { getDailyQuests, getWeeklyQuests, getCurrentMonday } from "@/data/quests/quest-seed";
import { useGameStore } from "./game-store";
import { useLearnStore } from "./learn-store";
import { useChallengeStore } from "./challenge-store";
import { useBacktestStore } from "./backtest-store";
import { useFlashcardStore } from "./flashcard-store";
import { usePredictionStore } from "./prediction-store";

// ── Helpers ────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function evaluateCondition(
  field: keyof QuestConditionSnapshot,
  operator: ">=" | ">" | "==" | "<=",
  target: number,
  snapshot: QuestConditionSnapshot,
): boolean {
  const val = snapshot[field];
  switch (operator) {
    case ">=": return val >= target;
    case ">":  return val > target;
    case "==": return val === target;
    case "<=": return val <= target;
  }
}

// ── Session counters (reset daily/weekly) ──────────────────────

interface SessionCounters {
  sessionTradesCount: number;
  sessionProfitableTrades: number;
  sessionPnL: number;
  sessionLessonsCompleted: number;
  sessionSRankLessons: number;
  sessionChallengesCompleted: number;
  sessionBacktestsRun: number;
  sessionCardsReviewed: number;
  sessionPredictions: number;
  sessionCorrectPredictions: number;
  sessionArenaWins: number;
  sessionArenaMatches: number;
  sessionXPEarned: number;
}

const EMPTY_SESSION: SessionCounters = {
  sessionTradesCount: 0,
  sessionProfitableTrades: 0,
  sessionPnL: 0,
  sessionLessonsCompleted: 0,
  sessionSRankLessons: 0,
  sessionChallengesCompleted: 0,
  sessionBacktestsRun: 0,
  sessionCardsReviewed: 0,
  sessionPredictions: 0,
  sessionCorrectPredictions: 0,
  sessionArenaWins: 0,
  sessionArenaMatches: 0,
  sessionXPEarned: 0,
};

// ── Store interface ────────────────────────────────────────────

interface QuestState {
  dailyDate: string;
  weeklyMonday: string;
  dailySession: SessionCounters;
  weeklySession: SessionCounters;
  dailyProgress: Record<string, QuestProgress>;
  weeklyProgress: Record<string, QuestProgress>;
  milestoneProgress: Record<string, QuestProgress>;
  totalQuestsCompleted: number;
  dailyStreakCount: number;
  lastDailyAllClearedDate: string;

  // Actions
  incrementSession: (field: keyof SessionCounters, amount?: number) => void;
  checkQuests: () => void;
  claimQuest: (questId: string, category: QuestCategory) => void;
  buildSnapshot: () => QuestConditionSnapshot;
  resetDailyIfNeeded: () => void;
  resetWeeklyIfNeeded: () => void;
}

export const useQuestStore = create<QuestState>()(
  persist(
    (set, get) => ({
      dailyDate: "",
      weeklyMonday: "",
      dailySession: { ...EMPTY_SESSION },
      weeklySession: { ...EMPTY_SESSION },
      dailyProgress: {},
      weeklyProgress: {},
      milestoneProgress: {},
      totalQuestsCompleted: 0,
      dailyStreakCount: 0,
      lastDailyAllClearedDate: "",

      incrementSession: (field, amount = 1) => {
        set((state) => ({
          dailySession: {
            ...state.dailySession,
            [field]: state.dailySession[field] + amount,
          },
          weeklySession: {
            ...state.weeklySession,
            [field]: state.weeklySession[field] + amount,
          },
        }));

        // Auto-check quests after incrementing
        get().checkQuests();
      },

      buildSnapshot: () => {
        const state = get();
        const gameState = useGameStore.getState();
        const learnState = useLearnStore.getState();
        const challengeState = useChallengeStore.getState();
        const backtestState = useBacktestStore.getState();
        const flashcardState = useFlashcardStore.getState();
        const predictionState = usePredictionStore.getState();

        // Count S-rank lessons
        let sRankLessons = 0;
        for (const score of Object.values(learnState.lessonScores)) {
          if (typeof score === "object" && score.grade === "S") sRankLessons++;
        }

        // Count S-rank scenarios
        let sRankScenarios = 0;
        for (const result of Object.values(challengeState.scenarioResults)) {
          if (result.grade === "S") sRankScenarios++;
        }

        return {
          // GameStore cumulative
          totalTrades: gameState.stats.totalTrades,
          profitableTrades: gameState.stats.profitableTrades,
          totalPnL: gameState.stats.totalPnL,
          consecutiveWins: gameState.stats.consecutiveWins,
          uniqueTickersTraded: gameState.stats.uniqueTickersTraded.length,
          shortTradesCount: gameState.stats.shortTradesCount,
          limitOrdersUsed: gameState.stats.limitOrdersUsed,
          dailyStreak: gameState.stats.dailyStreak,
          comboCount: gameState.stats.comboCount,
          xp: gameState.xp,
          level: gameState.level,
          achievementCount: gameState.achievements.length,

          // LearnStore cumulative
          completedLessonsCount: learnState.completedLessons.length,
          sRankLessons,
          learningStreak: learnState.learningStreak,

          // TradingStore (skip import — just use 0, actual portfolio value tracked via game store)
          portfolioValue: 0,
          tradeHistoryCount: gameState.stats.totalTrades,

          // ChallengeStore cumulative
          totalDailyChallengesCompleted: challengeState.totalDailyChallengesCompleted,
          scenariosCompleted: Object.keys(challengeState.scenarioResults).length,
          sRankScenarios,

          // BacktestStore cumulative
          totalBacktestsRun: backtestState.totalBacktestsRun,
          savedStrategiesCount: backtestState.savedStrategies.length,

          // FlashcardStore cumulative
          totalCardsReviewed: flashcardState.totalReviewed,
          overallMastery: flashcardState.getOverallMastery(),

          // PredictionStore cumulative
          totalPredictions: predictionState.totalPredictions,
          correctPredictions: predictionState.correctPredictions,
          predictionBestStreak: predictionState.bestStreak,

          // Session-scoped
          ...state.dailySession,
        };
      },

      checkQuests: () => {
        const state = get();
        const snapshot = get().buildSnapshot();
        const today = todayStr();
        const monday = getCurrentMonday();

        // Check daily quests
        if (state.dailyDate === today) {
          const dailyQuests = getDailyQuests(today);
          const updates: Record<string, QuestProgress> = {};
          let changed = false;

          for (const quest of dailyQuests) {
            const existing = state.dailyProgress[quest.id];
            if (existing?.claimedAt) continue; // Already claimed

            // Use daily session for daily quests
            const dailySnapshot = { ...snapshot, ...state.dailySession };
            const conditions = quest.conditions.map((c) =>
              evaluateCondition(c.field, c.operator, c.target, dailySnapshot),
            );
            const isComplete = conditions.every(Boolean);

            if (
              !existing ||
              existing.isComplete !== isComplete ||
              existing.conditions.some((v, i) => v !== conditions[i])
            ) {
              updates[quest.id] = {
                questId: quest.id,
                conditions,
                isComplete,
                claimedAt: existing?.claimedAt ?? null,
              };
              changed = true;
            }
          }

          if (changed) {
            set((s) => ({
              dailyProgress: { ...s.dailyProgress, ...updates },
            }));
          }
        }

        // Check weekly quests
        if (state.weeklyMonday === monday) {
          const weeklyQuests = getWeeklyQuests(today);
          const updates: Record<string, QuestProgress> = {};
          let changed = false;

          for (const quest of weeklyQuests) {
            const existing = state.weeklyProgress[quest.id];
            if (existing?.claimedAt) continue;

            // Use weekly session for weekly quests
            const weeklySnapshot = { ...snapshot, ...state.weeklySession };
            const conditions = quest.conditions.map((c) =>
              evaluateCondition(c.field, c.operator, c.target, weeklySnapshot),
            );
            const isComplete = conditions.every(Boolean);

            if (
              !existing ||
              existing.isComplete !== isComplete ||
              existing.conditions.some((v, i) => v !== conditions[i])
            ) {
              updates[quest.id] = {
                questId: quest.id,
                conditions,
                isComplete,
                claimedAt: existing?.claimedAt ?? null,
              };
              changed = true;
            }
          }

          if (changed) {
            set((s) => ({
              weeklyProgress: { ...s.weeklyProgress, ...updates },
            }));
          }
        }

        // Check milestone quests
        {
          const updates: Record<string, QuestProgress> = {};
          let changed = false;

          for (const quest of MILESTONE_QUESTS) {
            const existing = state.milestoneProgress[quest.id];
            if (existing?.claimedAt) continue;

            // Check if previous chain step is completed
            if (quest.chainIndex !== undefined && quest.chainIndex > 0 && quest.chainId) {
              const prevQuest = MILESTONE_QUESTS.find(
                (q) => q.chainId === quest.chainId && q.chainIndex === quest.chainIndex! - 1,
              );
              if (prevQuest) {
                const prevProgress = state.milestoneProgress[prevQuest.id];
                if (!prevProgress?.claimedAt) continue; // Previous step not claimed
              }
            }

            const conditions = quest.conditions.map((c) =>
              evaluateCondition(c.field, c.operator, c.target, snapshot),
            );
            const isComplete = conditions.every(Boolean);

            if (
              !existing ||
              existing.isComplete !== isComplete ||
              existing.conditions.some((v, i) => v !== conditions[i])
            ) {
              updates[quest.id] = {
                questId: quest.id,
                conditions,
                isComplete,
                claimedAt: existing?.claimedAt ?? null,
              };
              changed = true;
            }
          }

          if (changed) {
            set((s) => ({
              milestoneProgress: { ...s.milestoneProgress, ...updates },
            }));
          }
        }
      },

      claimQuest: (questId, category) => {
        const state = get();
        const progressMap =
          category === "daily"
            ? state.dailyProgress
            : category === "weekly"
              ? state.weeklyProgress
              : state.milestoneProgress;

        const progress = progressMap[questId];
        if (!progress || !progress.isComplete || progress.claimedAt) return;

        // Find quest definition
        const allQuests =
          category === "daily"
            ? getDailyQuests(state.dailyDate)
            : category === "weekly"
              ? getWeeklyQuests(state.dailyDate)
              : MILESTONE_QUESTS;

        const quest = allQuests.find((q) => q.id === questId);
        if (!quest) return;

        // Mark as claimed
        const progressKey =
          category === "daily"
            ? "dailyProgress"
            : category === "weekly"
              ? "weeklyProgress"
              : "milestoneProgress";

        const newTotal = state.totalQuestsCompleted + 1;

        // Check daily streak: all 3 dailies claimed today?
        let newStreakCount = state.dailyStreakCount;
        let newLastClearedDate = state.lastDailyAllClearedDate;
        if (category === "daily") {
          const dailyQuests = getDailyQuests(state.dailyDate);
          const updatedProgress = {
            ...state.dailyProgress,
            [questId]: { ...progress, claimedAt: Date.now() },
          };
          const allClaimed = dailyQuests.every(
            (q) => updatedProgress[q.id]?.claimedAt,
          );
          if (allClaimed && state.lastDailyAllClearedDate !== state.dailyDate) {
            const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
            newStreakCount =
              state.lastDailyAllClearedDate === yesterday
                ? state.dailyStreakCount + 1
                : 1;
            newLastClearedDate = state.dailyDate;
          }
        }

        set((s) => ({
          [progressKey]: {
            ...s[progressKey as keyof Pick<QuestState, "dailyProgress" | "weeklyProgress" | "milestoneProgress">],
            [questId]: { ...progress, claimedAt: Date.now() },
          },
          totalQuestsCompleted: newTotal,
          dailyStreakCount: newStreakCount,
          lastDailyAllClearedDate: newLastClearedDate,
        }));

        // Award XP
        useGameStore.getState().awardXP(quest.xpReward);

        // Notify quest claimed
        try {
          const { useNotificationStore } = require("./notification-store");
          useNotificationStore.getState().addNotification({
            type: "quest",
            title: `Quest complete — ${quest.name}`,
            message: `+${quest.xpReward} XP earned.`,
            icon: "CheckCircle",
            color: "text-cyan-400",
            priority: "medium",
          });
        } catch { /* notification store not loaded yet */ }

        // Award season XP for quest completion
        try {
          const { useSeasonStore } = require("./season-store");
          const seasonSource = category === "daily" ? "quest_daily_completed" : category === "weekly" ? "quest_weekly_completed" : "quest_daily_completed";
          useSeasonStore.getState().awardSeasonXP(seasonSource);
        } catch { /* season store not loaded */ }

        // Check quest achievements
        checkQuestAchievements(newTotal, newStreakCount);
      },

      resetDailyIfNeeded: () => {
        const state = get();
        const today = todayStr();
        if (state.dailyDate !== today) {
          set({
            dailyDate: today,
            dailySession: { ...EMPTY_SESSION },
            dailyProgress: {},
          });
          // Re-check quests after reset so milestone + initial progress evaluates
          setTimeout(() => get().checkQuests(), 0);

          // Notify that new daily missions are available (only after the very first day)
          if (state.dailyDate !== "") {
            try {
              const { useNotificationStore } = require("./notification-store");
              useNotificationStore.getState().addNotification({
                type: "system",
                title: "New daily missions available",
                message: "3 fresh daily quests are ready. Complete them all for a streak bonus.",
                icon: "CheckCircle",
                color: "text-cyan-400",
                priority: "low",
              });
            } catch { /* notification store not loaded yet */ }
          }
        }
      },

      resetWeeklyIfNeeded: () => {
        const state = get();
        const monday = getCurrentMonday();
        if (state.weeklyMonday !== monday) {
          set({
            weeklyMonday: monday,
            weeklySession: { ...EMPTY_SESSION },
            weeklyProgress: {},
          });
          setTimeout(() => get().checkQuests(), 0);
        }
      },
    }),
    {
      name: "alpha-deck-quests",
      partialize: (state) => ({
        dailyDate: state.dailyDate,
        weeklyMonday: state.weeklyMonday,
        dailySession: state.dailySession,
        weeklySession: state.weeklySession,
        dailyProgress: state.dailyProgress,
        weeklyProgress: state.weeklyProgress,
        milestoneProgress: state.milestoneProgress,
        totalQuestsCompleted: state.totalQuestsCompleted,
        dailyStreakCount: state.dailyStreakCount,
        lastDailyAllClearedDate: state.lastDailyAllClearedDate,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Auto-reset if date/week changed
        const today = todayStr();
        const monday = getCurrentMonday();
        const updates: Record<string, unknown> = {};

        if (state.dailyDate !== today) {
          updates.dailyDate = today;
          updates.dailySession = { ...EMPTY_SESSION };
          updates.dailyProgress = {};
        }
        if (state.weeklyMonday !== monday) {
          updates.weeklyMonday = monday;
          updates.weeklySession = { ...EMPTY_SESSION };
          updates.weeklyProgress = {};
        }

        if (Object.keys(updates).length > 0) {
          useQuestStore.setState(updates);
        }

        // Always check quests after rehydration (handles first load too)
        setTimeout(() => useQuestStore.getState().checkQuests(), 0);
      },
    },
  ),
);

// ── Quest achievements ─────────────────────────────────────────

function checkQuestAchievements(totalCompleted: number, dailyStreakCount: number) {
  const gameState = useGameStore.getState();
  const existingIds = new Set(gameState.achievements.map((a) => a.id));
  const pending: Array<{ id: string; name: string; description: string; icon: string; unlockedAt: number }> = [];

  if (totalCompleted >= 1 && !existingIds.has("quest_first")) {
    pending.push({
      id: "quest_first",
      name: "Quest Seeker",
      description: "Complete your first quest",
      icon: "ScrollText",
      unlockedAt: Date.now(),
    });
  }

  if (dailyStreakCount >= 7 && !existingIds.has("quest_daily_streak_7")) {
    pending.push({
      id: "quest_daily_streak_7",
      name: "Daily Devotion",
      description: "Complete all daily quests 7 days in a row",
      icon: "Flame",
      unlockedAt: Date.now(),
    });
  }

  if (pending.length > 0) {
    useGameStore.setState((s) => ({
      achievements: [...s.achievements, ...pending],
      pendingAchievements: [...s.pendingAchievements, ...pending],
    }));
  }
}
