import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Achievement, PlayerStats } from "@/types/game";
import {
  ACHIEVEMENT_DEFS,
  INITIAL_STATS,
  getLevelForXP,
  getTitleForLevel,
} from "@/types/game";

// Daily XP cap
const DAILY_XP_CAP = 500;

// Trade milestone definitions: [tradeCount, xpReward, milestoneId]
const TRADE_MILESTONES: [number, number, string][] = [
  [1, 50, "milestone_trade_1"],
  [10, 100, "milestone_trade_10"],
  [50, 250, "milestone_trade_50"],
  [100, 500, "milestone_trade_100"],
  [500, 1000, "milestone_trade_500"],
];

interface GameState {
  xp: number;
  level: number;
  title: string;
  achievements: Achievement[];
  stats: PlayerStats;
  pendingAchievements: Achievement[];
  lastXPGain: number | null;
  lastLevelUp: number | null;
  comboMultiplier: number;
  lastCombo: number | null;
  lastStreakMilestone: number | null;

  // New: XP multiplier system
  xpMultiplier: number;

  // New: Login streak
  loginStreak: number;
  lastLoginDate: string | null;

  // New: Achievement progress tracking
  achievementProgress: Record<string, number>;

  // New: Daily XP tracking
  dailyXP: number;
  dailyXPDate: string;

  // New: Trade milestones claimed
  milestonesClaimed: string[];

  awardXP: (amount: number) => void;
  setXpMultiplier: (mult: number) => void;
  recordDailyLogin: () => void;
  updateAchievementProgress: (id: string, value: number) => void;
  recordTrade: (
    pnL: number,
    ticker: string,
    isShort: boolean,
    isLimitOrder: boolean,
    portfolioValue?: number,
  ) => Achievement[];
  recordOptionsTrade: (
    pnL: number,
    ticker: string,
    strategyName: string,
    legCount: number,
  ) => Achievement[];
  recordAnalyticsView: (type: "analysis" | "unusual") => void;
  recordOptionsChainView: () => void;
  recordLessonCompleted: () => void;
  recordPredictionCorrect: () => void;
  updatePortfolioValue: (value: number) => void;
  dismissAchievement: () => void;
  clearXPGain: () => void;
  clearLevelUp: () => void;
  clearCombo: () => void;
  clearStreakMilestone: () => void;
  resetGame: () => void;
}

/** Compute effective XP multiplier from login streak */
function streakMultiplier(streak: number): number {
  if (streak >= 7) return 1.5;
  if (streak >= 3) return 1.2;
  return 1.0;
}

/** Apply daily XP cap and multipliers, return actual XP added */
function applyXPCap(
  baseAmount: number,
  xpMultiplier: number,
  loginStreak: number,
  dailyXP: number,
  dailyXPDate: string,
): { actualXP: number; newDailyXP: number; newDailyXPDate: string } {
  const today = new Date().toISOString().slice(0, 10);
  const currentDailyXP = dailyXPDate === today ? dailyXP : 0;

  const fullMultiplier = xpMultiplier * streakMultiplier(loginStreak);
  const desired = Math.floor(baseAmount * fullMultiplier);
  const remaining = Math.max(0, DAILY_XP_CAP - currentDailyXP);
  const actualXP = Math.min(desired, remaining);

  return {
    actualXP,
    newDailyXP: currentDailyXP + actualXP,
    newDailyXPDate: today,
  };
}

/** Check new achievements against current stats */
function checkAchievements(
  newStats: PlayerStats,
  existingIds: Set<string>,
): Achievement[] {
  const newAchievements: Achievement[] = [];
  for (const def of ACHIEVEMENT_DEFS) {
    if (!existingIds.has(def.id) && def.condition(newStats)) {
      newAchievements.push({
        id: def.id,
        name: def.name,
        description: def.description,
        icon: def.icon,
        unlockedAt: Date.now(),
      });
    }
  }
  return newAchievements;
}

/** Fire notification store notifications for achievements and level-ups */
function notifyAchievementsAndLevel(
  newAchievements: Achievement[],
  leveledUp: boolean,
  newLevel: number,
) {
  try {
    const { useNotificationStore } = require("./notification-store");
    const addNotif = useNotificationStore.getState().addNotification;
    for (const a of newAchievements) {
      addNotif({
        type: "achievement",
        title: a.name,
        description: a.description,
        icon: "Trophy",
        color: "text-amber-400",
      });
    }
    if (leveledUp) {
      addNotif({
        type: "level_up",
        title: `Level ${newLevel}!`,
        description: `You've reached ${getTitleForLevel(newLevel)}`,
        icon: "Sparkles",
        color: "text-purple-400",
      });
    }
  } catch {
    /* notification store not loaded yet */
  }
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      title: "Rookie",
      achievements: [],
      stats: { ...INITIAL_STATS },
      pendingAchievements: [],
      lastXPGain: null,
      lastLevelUp: null,
      comboMultiplier: 1,
      lastCombo: null,
      lastStreakMilestone: null,
      xpMultiplier: 1.0,
      loginStreak: 0,
      lastLoginDate: null,
      achievementProgress: {},
      dailyXP: 0,
      dailyXPDate: "",
      milestonesClaimed: [],

      awardXP: (amount) => {
        const state = get();
        const { actualXP, newDailyXP, newDailyXPDate } = applyXPCap(
          amount,
          state.xpMultiplier,
          state.loginStreak,
          state.dailyXP,
          state.dailyXPDate,
        );
        if (actualXP <= 0) return;
        const newXP = state.xp + actualXP;
        const newLevel = getLevelForXP(newXP);
        const leveledUp = newLevel > state.level;
        set({
          xp: newXP,
          level: newLevel,
          title: getTitleForLevel(newLevel),
          lastXPGain: actualXP,
          lastLevelUp: leveledUp ? newLevel : state.lastLevelUp,
          dailyXP: newDailyXP,
          dailyXPDate: newDailyXPDate,
        });
      },

      setXpMultiplier: (mult) => {
        set({ xpMultiplier: Math.max(0.1, mult) });
      },

      recordDailyLogin: () => {
        const state = get();
        const today = new Date().toISOString().slice(0, 10);
        if (state.lastLoginDate === today) return; // already recorded today

        const yesterday = new Date(Date.now() - 86400000)
          .toISOString()
          .slice(0, 10);
        const newStreak =
          state.lastLoginDate === yesterday ? state.loginStreak + 1 : 1;

        // Streak multiplier is automatically applied through applyXPCap
        set({
          loginStreak: newStreak,
          lastLoginDate: today,
          // Update xpMultiplier based on new streak
          xpMultiplier: streakMultiplier(newStreak),
        });
      },

      updateAchievementProgress: (id, value) => {
        set((state) => ({
          achievementProgress: {
            ...state.achievementProgress,
            [id]: value,
          },
        }));
      },

      recordTrade: (pnL, ticker, isShort, isLimitOrder, portfolioValue) => {
        const state = get();
        const isProfitable = pnL > 0;

        // Daily streak logic
        const today = new Date().toISOString().slice(0, 10);
        const lastDate = state.stats.lastTradeDate;
        let dailyStreak = state.stats.dailyStreak;
        if (lastDate !== today) {
          const yesterday = new Date(Date.now() - 86400000)
            .toISOString()
            .slice(0, 10);
          dailyStreak = lastDate === yesterday ? dailyStreak + 1 : 1;
        }

        // Combo logic: consecutive profitable trades
        const newComboCount = isProfitable ? state.stats.comboCount + 1 : 0;
        const comboMultiplier = Math.min(1 + newComboCount * 0.25, 3);

        // Today's P&L list (for perfect_day achievement)
        const tradesTodayDate = state.stats.tradesTodayDate;
        const tradesTodayPnLs =
          tradesTodayDate === today
            ? [...state.stats.tradesTodayPnLs, pnL]
            : [pnL];

        // Risk master: track consecutive trades with drawdown < 5% of portfolio
        const portfolioRef = portfolioValue ?? state.stats.portfolioValue;
        const drawdownPct =
          pnL < 0 && portfolioRef > 0
            ? Math.abs(pnL) / portfolioRef
            : 0;
        const isLowDrawdown = drawdownPct < 0.05;
        const currentLowDrawdownStreak = isLowDrawdown
          ? state.stats.currentLowDrawdownStreak + 1
          : 0;
        const maxDrawdownStreak = Math.max(
          state.stats.maxDrawdownStreak,
          currentLowDrawdownStreak,
        );

        // Update stats
        const newStats: PlayerStats = {
          ...state.stats,
          totalTrades: state.stats.totalTrades + 1,
          profitableTrades: state.stats.profitableTrades + (isProfitable ? 1 : 0),
          totalPnL: state.stats.totalPnL + pnL,
          consecutiveWins: isProfitable ? state.stats.consecutiveWins + 1 : 0,
          consecutiveLosses: isProfitable
            ? 0
            : state.stats.consecutiveLosses + 1,
          largestWin: Math.max(state.stats.largestWin, pnL),
          largestLoss: Math.min(state.stats.largestLoss, pnL),
          uniqueTickersTraded: state.stats.uniqueTickersTraded.includes(ticker)
            ? state.stats.uniqueTickersTraded
            : [...state.stats.uniqueTickersTraded, ticker],
          shortTradesCount: state.stats.shortTradesCount + (isShort ? 1 : 0),
          limitOrdersUsed:
            state.stats.limitOrdersUsed + (isLimitOrder ? 1 : 0),
          dailyStreak,
          lastTradeDate: today,
          comboCount: newComboCount,
          tradesTodayPnLs,
          tradesTodayDate: today,
          currentLowDrawdownStreak,
          maxDrawdownStreak,
          portfolioValue: portfolioValue ?? state.stats.portfolioValue,
        };

        // Base XP calculation
        let baseXP = 10; // base XP for any trade
        if (isProfitable) baseXP += 25;
        else baseXP += 5;
        if (isLimitOrder) baseXP += 15;
        if (isShort) baseXP += 10;
        // Streak bonus (5 per streak day, cap 50)
        baseXP += Math.min(dailyStreak * 5, 50);
        // Apply combo multiplier (before daily cap)
        baseXP = Math.floor(baseXP * comboMultiplier);

        // Apply daily cap + multipliers
        const { actualXP, newDailyXP, newDailyXPDate } = applyXPCap(
          baseXP,
          1.0, // combo already folded in; only apply login streak via applyXPCap
          state.loginStreak,
          state.dailyXP,
          state.dailyXPDate,
        );

        // Check trade milestones
        const newTotalTrades = newStats.totalTrades;
        const milestoneBonuses: number[] = [];
        const newMilestonesClaimed = [...state.milestonesClaimed];
        for (const [count, reward, milestoneId] of TRADE_MILESTONES) {
          if (
            newTotalTrades >= count &&
            !newMilestonesClaimed.includes(milestoneId)
          ) {
            newMilestonesClaimed.push(milestoneId);
            milestoneBonuses.push(reward);
          }
        }
        const milestoneXP = milestoneBonuses.reduce((a, b) => a + b, 0);

        const totalXPGain = actualXP + milestoneXP;
        const newXP = state.xp + totalXPGain;
        const newLevel = getLevelForXP(newXP);

        // Check achievements
        const existingIds = new Set(state.achievements.map((a) => a.id));
        const newAchievements = checkAchievements(newStats, existingIds);

        // Award XP from achievements
        const achievementXP = newAchievements.reduce(
          (sum, a) =>
            sum +
            (ACHIEVEMENT_DEFS.find((d) => d.id === a.id)?.xpReward ?? 0),
          0,
        );

        const finalXP = state.xp + totalXPGain + achievementXP;
        const finalLevel = getLevelForXP(finalXP);
        const leveledUp = finalLevel > state.level;

        // Streak milestone detection
        const STREAK_MILESTONES = [3, 7, 14, 30];
        const prevStreak = state.stats.dailyStreak;
        const streakMilestone =
          STREAK_MILESTONES.find(
            (m) => dailyStreak >= m && prevStreak < m,
          ) ?? null;

        set({
          xp: finalXP,
          level: finalLevel,
          title: getTitleForLevel(finalLevel),
          stats: newStats,
          achievements: [...state.achievements, ...newAchievements],
          pendingAchievements: [
            ...state.pendingAchievements,
            ...newAchievements,
          ],
          lastXPGain: totalXPGain + achievementXP,
          lastLevelUp: leveledUp ? finalLevel : null,
          comboMultiplier,
          lastCombo: newComboCount >= 2 ? newComboCount : null,
          lastStreakMilestone: streakMilestone,
          dailyXP: newDailyXP + achievementXP,
          dailyXPDate: newDailyXPDate,
          milestonesClaimed: newMilestonesClaimed,
        });

        // Quest + Season hooks (lazy imports to avoid circular deps)
        try {
          const { useQuestStore } = require("./quest-store");
          useQuestStore.getState().incrementSession("sessionTradesCount");
          if (isProfitable)
            useQuestStore
              .getState()
              .incrementSession("sessionProfitableTrades");
          useQuestStore.getState().incrementSession("sessionPnL", pnL);
          useQuestStore
            .getState()
            .incrementSession("sessionXPEarned", totalXPGain);
        } catch {
          /* quest store not loaded yet */
        }

        try {
          const { useSeasonStore } = require("./season-store");
          useSeasonStore.getState().awardSeasonXP("trade_completed");
          if (isProfitable)
            useSeasonStore.getState().awardSeasonXP("profitable_trade");
        } catch {
          /* season store not loaded yet */
        }

        notifyAchievementsAndLevel(newAchievements, leveledUp, finalLevel);

        return newAchievements;
      },

      recordOptionsTrade: (pnL, ticker, strategyName, legCount) => {
        const state = get();
        const isProfitable = pnL > 0;
        const isSpread = legCount >= 2;
        const isCondor =
          strategyName.toLowerCase().includes("condor") ||
          strategyName.toLowerCase().includes("butterfly");

        // Update stats
        const newStats: PlayerStats = {
          ...state.stats,
          optionsTradesCount: state.stats.optionsTradesCount + 1,
          optionsSpreadsCount:
            state.stats.optionsSpreadsCount + (isSpread ? 1 : 0),
          optionsCondorsCount:
            state.stats.optionsCondorsCount + (isCondor ? 1 : 0),
          optionsTotalPnL: state.stats.optionsTotalPnL + pnL,
          uniqueTickersTraded: state.stats.uniqueTickersTraded.includes(ticker)
            ? state.stats.uniqueTickersTraded
            : [...state.stats.uniqueTickersTraded, ticker],
        };

        // XP: 15 base + 10 per extra leg + 20 if profitable
        let baseXP = 15;
        baseXP += Math.max(0, legCount - 1) * 10;
        if (isProfitable) baseXP += 20;

        const { actualXP, newDailyXP, newDailyXPDate } = applyXPCap(
          baseXP,
          state.xpMultiplier,
          state.loginStreak,
          state.dailyXP,
          state.dailyXPDate,
        );

        // Check achievements
        const existingIds = new Set(state.achievements.map((a) => a.id));
        const newAchievements = checkAchievements(newStats, existingIds);

        const achievementXP = newAchievements.reduce(
          (sum, a) =>
            sum +
            (ACHIEVEMENT_DEFS.find((d) => d.id === a.id)?.xpReward ?? 0),
          0,
        );

        const finalXP = state.xp + actualXP + achievementXP;
        const finalLevel = getLevelForXP(finalXP);
        const leveledUp = finalLevel > state.level;

        set({
          xp: finalXP,
          level: finalLevel,
          title: getTitleForLevel(finalLevel),
          stats: newStats,
          achievements: [...state.achievements, ...newAchievements],
          pendingAchievements: [
            ...state.pendingAchievements,
            ...newAchievements,
          ],
          lastXPGain: actualXP + achievementXP,
          lastLevelUp: leveledUp ? finalLevel : null,
          dailyXP: newDailyXP + achievementXP,
          dailyXPDate: newDailyXPDate,
        });

        // Quest + Season hooks
        try {
          const { useQuestStore } = require("./quest-store");
          useQuestStore.getState().incrementSession("sessionTradesCount");
          if (isProfitable)
            useQuestStore
              .getState()
              .incrementSession("sessionProfitableTrades");
          useQuestStore.getState().incrementSession("sessionPnL", pnL);
          useQuestStore.getState().incrementSession("sessionXPEarned", actualXP);
        } catch {
          /* quest store not loaded yet */
        }

        try {
          const { useSeasonStore } = require("./season-store");
          useSeasonStore.getState().awardSeasonXP("trade_completed");
          if (isProfitable)
            useSeasonStore.getState().awardSeasonXP("profitable_trade");
        } catch {
          /* season store not loaded yet */
        }

        notifyAchievementsAndLevel(newAchievements, leveledUp, finalLevel);

        return newAchievements;
      },

      recordAnalyticsView: (type) => {
        const state = get();
        const field =
          type === "analysis" ? "optionsAnalysisViewed" : "unusualActivityViewed";
        if (state.stats[field]) return; // already viewed

        const newStats = { ...state.stats, [field]: true };
        const existingIds = new Set(state.achievements.map((a) => a.id));
        const newAchievements = checkAchievements(newStats, existingIds);

        const achievementXP = newAchievements.reduce(
          (sum, a) =>
            sum +
            (ACHIEVEMENT_DEFS.find((d) => d.id === a.id)?.xpReward ?? 25),
          0,
        );

        const finalXP = state.xp + (achievementXP > 0 ? achievementXP : 0);

        set({
          stats: newStats,
          achievements: [...state.achievements, ...newAchievements],
          pendingAchievements: [
            ...state.pendingAchievements,
            ...newAchievements,
          ],
          lastXPGain: achievementXP > 0 ? achievementXP : null,
          xp: finalXP,
        });

        try {
          const { useNotificationStore } = require("./notification-store");
          const addNotif = useNotificationStore.getState().addNotification;
          for (const a of newAchievements) {
            addNotif({
              type: "achievement",
              title: a.name,
              description: a.description,
              icon: "Trophy",
              color: "text-amber-400",
            });
          }
        } catch {
          /* notification store not loaded yet */
        }
      },

      recordOptionsChainView: () => {
        const state = get();
        const newCount = state.stats.optionsChainViewed + 1;
        const newStats: PlayerStats = {
          ...state.stats,
          optionsChainViewed: newCount,
        };

        const existingIds = new Set(state.achievements.map((a) => a.id));
        const newAchievements = checkAchievements(newStats, existingIds);

        const achievementXP = newAchievements.reduce(
          (sum, a) =>
            sum +
            (ACHIEVEMENT_DEFS.find((d) => d.id === a.id)?.xpReward ?? 0),
          0,
        );

        set({
          stats: newStats,
          achievements: [...state.achievements, ...newAchievements],
          pendingAchievements: [
            ...state.pendingAchievements,
            ...newAchievements,
          ],
          xp: state.xp + achievementXP,
          lastXPGain: achievementXP > 0 ? achievementXP : state.lastXPGain,
          achievementProgress: {
            ...state.achievementProgress,
            options_explorer: newCount,
          },
        });

        try {
          const { useNotificationStore } = require("./notification-store");
          const addNotif = useNotificationStore.getState().addNotification;
          for (const a of newAchievements) {
            addNotif({
              type: "achievement",
              title: a.name,
              description: a.description,
              icon: "Trophy",
              color: "text-amber-400",
            });
          }
        } catch {
          /* notification store not loaded yet */
        }
      },

      recordLessonCompleted: () => {
        const state = get();
        const newCount = state.stats.lessonsCompleted + 1;
        const newStats: PlayerStats = {
          ...state.stats,
          lessonsCompleted: newCount,
        };

        const existingIds = new Set(state.achievements.map((a) => a.id));
        const newAchievements = checkAchievements(newStats, existingIds);

        const achievementXP = newAchievements.reduce(
          (sum, a) =>
            sum +
            (ACHIEVEMENT_DEFS.find((d) => d.id === a.id)?.xpReward ?? 0),
          0,
        );

        set({
          stats: newStats,
          achievements: [...state.achievements, ...newAchievements],
          pendingAchievements: [
            ...state.pendingAchievements,
            ...newAchievements,
          ],
          xp: state.xp + achievementXP,
          lastXPGain: achievementXP > 0 ? achievementXP : state.lastXPGain,
          achievementProgress: {
            ...state.achievementProgress,
            lesson_complete_5: newCount,
            lesson_complete_20: newCount,
          },
        });

        try {
          const { useNotificationStore } = require("./notification-store");
          const addNotif = useNotificationStore.getState().addNotification;
          for (const a of newAchievements) {
            addNotif({
              type: "achievement",
              title: a.name,
              description: a.description,
              icon: "Trophy",
              color: "text-amber-400",
            });
          }
        } catch {
          /* notification store not loaded yet */
        }
      },

      recordPredictionCorrect: () => {
        const state = get();
        const newCount = state.stats.predictionsCorrect + 1;
        const newStats: PlayerStats = {
          ...state.stats,
          predictionsCorrect: newCount,
        };

        const existingIds = new Set(state.achievements.map((a) => a.id));
        const newAchievements = checkAchievements(newStats, existingIds);

        const achievementXP = newAchievements.reduce(
          (sum, a) =>
            sum +
            (ACHIEVEMENT_DEFS.find((d) => d.id === a.id)?.xpReward ?? 0),
          0,
        );

        set({
          stats: newStats,
          achievements: [...state.achievements, ...newAchievements],
          pendingAchievements: [
            ...state.pendingAchievements,
            ...newAchievements,
          ],
          xp: state.xp + achievementXP,
          lastXPGain: achievementXP > 0 ? achievementXP : state.lastXPGain,
          achievementProgress: {
            ...state.achievementProgress,
            prediction_correct_5: newCount,
          },
        });

        try {
          const { useNotificationStore } = require("./notification-store");
          const addNotif = useNotificationStore.getState().addNotification;
          for (const a of newAchievements) {
            addNotif({
              type: "achievement",
              title: a.name,
              description: a.description,
              icon: "Trophy",
              color: "text-amber-400",
            });
          }
        } catch {
          /* notification store not loaded yet */
        }
      },

      updatePortfolioValue: (value) => {
        const state = get();
        const newStats: PlayerStats = {
          ...state.stats,
          portfolioValue: value,
        };

        const existingIds = new Set(state.achievements.map((a) => a.id));
        const newAchievements = checkAchievements(newStats, existingIds);

        const achievementXP = newAchievements.reduce(
          (sum, a) =>
            sum +
            (ACHIEVEMENT_DEFS.find((d) => d.id === a.id)?.xpReward ?? 0),
          0,
        );

        set({
          stats: newStats,
          achievements: [...state.achievements, ...newAchievements],
          pendingAchievements: [
            ...state.pendingAchievements,
            ...newAchievements,
          ],
          xp: state.xp + achievementXP,
          lastXPGain: achievementXP > 0 ? achievementXP : state.lastXPGain,
          achievementProgress: {
            ...state.achievementProgress,
            portfolio_10k: value,
          },
        });

        try {
          const { useNotificationStore } = require("./notification-store");
          const addNotif = useNotificationStore.getState().addNotification;
          for (const a of newAchievements) {
            addNotif({
              type: "achievement",
              title: a.name,
              description: a.description,
              icon: "Trophy",
              color: "text-amber-400",
            });
          }
        } catch {
          /* notification store not loaded yet */
        }
      },

      dismissAchievement: () => {
        set((state) => ({
          pendingAchievements: state.pendingAchievements.slice(1),
        }));
      },

      clearXPGain: () => set({ lastXPGain: null }),
      clearLevelUp: () => set({ lastLevelUp: null }),
      clearCombo: () => set({ lastCombo: null }),
      clearStreakMilestone: () => set({ lastStreakMilestone: null }),

      resetGame: () =>
        set({
          xp: 0,
          level: 1,
          title: "Rookie",
          achievements: [],
          stats: { ...INITIAL_STATS },
          pendingAchievements: [],
          lastXPGain: null,
          lastLevelUp: null,
          comboMultiplier: 1,
          lastCombo: null,
          lastStreakMilestone: null,
          xpMultiplier: 1.0,
          loginStreak: 0,
          lastLoginDate: null,
          achievementProgress: {},
          dailyXP: 0,
          dailyXPDate: "",
          milestonesClaimed: [],
        }),
    }),
    {
      name: "alpha-deck-game",
      partialize: (state) => ({
        xp: state.xp,
        level: state.level,
        title: state.title,
        achievements: state.achievements,
        stats: state.stats,
        xpMultiplier: state.xpMultiplier,
        loginStreak: state.loginStreak,
        lastLoginDate: state.lastLoginDate,
        achievementProgress: state.achievementProgress,
        dailyXP: state.dailyXP,
        dailyXPDate: state.dailyXPDate,
        milestonesClaimed: state.milestonesClaimed,
      }),
    },
  ),
);
