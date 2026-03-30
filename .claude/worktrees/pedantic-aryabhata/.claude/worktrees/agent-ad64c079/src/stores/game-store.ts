import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Achievement, PlayerStats } from "@/types/game";
import {
  ACHIEVEMENT_DEFS,
  INITIAL_STATS,
  getLevelForXP,
  getTitleForLevel,
} from "@/types/game";

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

  awardXP: (amount: number) => void;
  recordTrade: (
    pnL: number,
    ticker: string,
    isShort: boolean,
    isLimitOrder: boolean,
  ) => Achievement[];
  recordOptionsTrade: (
    pnL: number,
    ticker: string,
    strategyName: string,
    legCount: number,
  ) => Achievement[];
  recordAnalyticsView: (type: "analysis" | "unusual") => void;
  dismissAchievement: () => void;
  clearXPGain: () => void;
  clearLevelUp: () => void;
  clearCombo: () => void;
  clearStreakMilestone: () => void;
  resetGame: () => void;
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

      awardXP: (amount) => {
        set((state) => {
          const newXP = state.xp + amount;
          const newLevel = getLevelForXP(newXP);
          const leveledUp = newLevel > state.level;
          return {
            xp: newXP,
            level: newLevel,
            title: getTitleForLevel(newLevel),
            lastXPGain: amount,
            lastLevelUp: leveledUp ? newLevel : state.lastLevelUp,
          };
        });
      },

      recordTrade: (pnL, ticker, isShort, isLimitOrder) => {
        const state = get();
        const isProfitable = pnL > 0;

        // Daily streak logic
        const today = new Date().toISOString().slice(0, 10);
        const lastDate = state.stats.lastTradeDate;
        let dailyStreak = state.stats.dailyStreak;
        if (lastDate !== today) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
          dailyStreak = lastDate === yesterday ? dailyStreak + 1 : 1;
        }

        // Combo logic: consecutive profitable trades
        const newComboCount = isProfitable ? state.stats.comboCount + 1 : 0;
        const comboMultiplier = Math.min(1 + newComboCount * 0.25, 3);

        // Update stats
        const newStats: PlayerStats = {
          ...state.stats,
          totalTrades: state.stats.totalTrades + 1,
          profitableTrades: state.stats.profitableTrades + (isProfitable ? 1 : 0),
          totalPnL: state.stats.totalPnL + pnL,
          consecutiveWins: isProfitable ? state.stats.consecutiveWins + 1 : 0,
          consecutiveLosses: isProfitable ? 0 : state.stats.consecutiveLosses + 1,
          largestWin: Math.max(state.stats.largestWin, pnL),
          largestLoss: Math.min(state.stats.largestLoss, pnL),
          uniqueTickersTraded: state.stats.uniqueTickersTraded.includes(ticker)
            ? state.stats.uniqueTickersTraded
            : [...state.stats.uniqueTickersTraded, ticker],
          shortTradesCount: state.stats.shortTradesCount + (isShort ? 1 : 0),
          limitOrdersUsed: state.stats.limitOrdersUsed + (isLimitOrder ? 1 : 0),
          dailyStreak,
          lastTradeDate: today,
          comboCount: newComboCount,
        };

        // Calculate XP with combo multiplier and streak bonus
        let xpGain = 10; // base XP for any trade
        if (isProfitable) xpGain += 25;
        else xpGain += 5;
        if (isLimitOrder) xpGain += 15;
        if (isShort) xpGain += 10;
        // Streak bonus (5 per streak day, cap 50)
        xpGain += Math.min(dailyStreak * 5, 50);
        // Apply combo multiplier
        xpGain = Math.floor(xpGain * comboMultiplier);

        const newXP = state.xp + xpGain;
        const newLevel = getLevelForXP(newXP);

        // Check achievements
        const existingIds = new Set(state.achievements.map((a) => a.id));
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

        const leveledUp = newLevel > state.level;

        // Streak milestone detection
        const STREAK_MILESTONES = [3, 7, 14, 30];
        const prevStreak = state.stats.dailyStreak;
        const streakMilestone = STREAK_MILESTONES.find(
          (m) => dailyStreak >= m && prevStreak < m,
        ) ?? null;

        set({
          xp: newXP,
          level: newLevel,
          title: getTitleForLevel(newLevel),
          stats: newStats,
          achievements: [...state.achievements, ...newAchievements],
          pendingAchievements: [
            ...state.pendingAchievements,
            ...newAchievements,
          ],
          lastXPGain: xpGain,
          lastLevelUp: leveledUp ? newLevel : null,
          comboMultiplier,
          lastCombo: newComboCount >= 2 ? newComboCount : null,
          lastStreakMilestone: streakMilestone,
        });

        // Quest + Season hooks (lazy imports to avoid circular deps)
        try {
          const { useQuestStore } = require("./quest-store");
          useQuestStore.getState().incrementSession("sessionTradesCount");
          if (isProfitable) useQuestStore.getState().incrementSession("sessionProfitableTrades");
          useQuestStore.getState().incrementSession("sessionPnL", pnL);
          useQuestStore.getState().incrementSession("sessionXPEarned", xpGain);
        } catch { /* quest store not loaded yet */ }

        try {
          const { useSeasonStore } = require("./season-store");
          useSeasonStore.getState().awardSeasonXP("trade_completed");
          if (isProfitable) useSeasonStore.getState().awardSeasonXP("profitable_trade");
        } catch { /* season store not loaded yet */ }

        // Notification hooks
        try {
          const { useNotificationStore } = require("./notification-store");
          const addNotif = useNotificationStore.getState().addNotification;
          for (const a of newAchievements) {
            addNotif({ type: "achievement", title: a.name, description: a.description, icon: "Trophy", color: "text-amber-400" });
          }
          if (leveledUp) {
            addNotif({ type: "level_up", title: `Level ${newLevel}!`, description: `You've reached ${getTitleForLevel(newLevel)}`, icon: "Sparkles", color: "text-purple-400" });
          }
        } catch { /* notification store not loaded yet */ }

        return newAchievements;
      },

      recordOptionsTrade: (pnL, ticker, strategyName, legCount) => {
        const state = get();
        const isProfitable = pnL > 0;
        const isSpread = legCount >= 2;
        const isCondor = strategyName.toLowerCase().includes("condor") ||
          strategyName.toLowerCase().includes("butterfly");

        // Update stats
        const newStats: PlayerStats = {
          ...state.stats,
          optionsTradesCount: state.stats.optionsTradesCount + 1,
          optionsSpreadsCount: state.stats.optionsSpreadsCount + (isSpread ? 1 : 0),
          optionsCondorsCount: state.stats.optionsCondorsCount + (isCondor ? 1 : 0),
          optionsTotalPnL: state.stats.optionsTotalPnL + pnL,
          uniqueTickersTraded: state.stats.uniqueTickersTraded.includes(ticker)
            ? state.stats.uniqueTickersTraded
            : [...state.stats.uniqueTickersTraded, ticker],
        };

        // XP: 15 base + 10 per extra leg + 20 if profitable
        let xpGain = 15;
        xpGain += Math.max(0, legCount - 1) * 10;
        if (isProfitable) xpGain += 20;

        const newXP = state.xp + xpGain;
        const newLevel = getLevelForXP(newXP);

        // Check achievements
        const existingIds = new Set(state.achievements.map((a) => a.id));
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

        const leveledUp = newLevel > state.level;

        set({
          xp: newXP,
          level: newLevel,
          title: getTitleForLevel(newLevel),
          stats: newStats,
          achievements: [...state.achievements, ...newAchievements],
          pendingAchievements: [
            ...state.pendingAchievements,
            ...newAchievements,
          ],
          lastXPGain: xpGain,
          lastLevelUp: leveledUp ? newLevel : null,
        });

        // Quest + Season hooks
        try {
          const { useQuestStore } = require("./quest-store");
          useQuestStore.getState().incrementSession("sessionTradesCount");
          if (isProfitable) useQuestStore.getState().incrementSession("sessionProfitableTrades");
          useQuestStore.getState().incrementSession("sessionPnL", pnL);
          useQuestStore.getState().incrementSession("sessionXPEarned", xpGain);
        } catch { /* quest store not loaded yet */ }

        try {
          const { useSeasonStore } = require("./season-store");
          useSeasonStore.getState().awardSeasonXP("trade_completed");
          if (isProfitable) useSeasonStore.getState().awardSeasonXP("profitable_trade");
        } catch { /* season store not loaded yet */ }

        // Notification hooks
        try {
          const { useNotificationStore } = require("./notification-store");
          const addNotif = useNotificationStore.getState().addNotification;
          for (const a of newAchievements) {
            addNotif({ type: "achievement", title: a.name, description: a.description, icon: "Trophy", color: "text-amber-400" });
          }
          if (leveledUp) {
            addNotif({ type: "level_up", title: `Level ${newLevel}!`, description: `You've reached ${getTitleForLevel(newLevel)}`, icon: "Sparkles", color: "text-purple-400" });
          }
        } catch { /* notification store not loaded yet */ }

        return newAchievements;
      },

      recordAnalyticsView: (type) => {
        const state = get();
        const field = type === "analysis" ? "optionsAnalysisViewed" : "unusualActivityViewed";
        if (state.stats[field]) return; // already viewed

        const newStats = { ...state.stats, [field]: true };
        const existingIds = new Set(state.achievements.map((a) => a.id));
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

        set({
          stats: newStats,
          achievements: [...state.achievements, ...newAchievements],
          pendingAchievements: [...state.pendingAchievements, ...newAchievements],
          lastXPGain: newAchievements.length > 0 ? 25 : null,
          xp: state.xp + (newAchievements.length > 0 ? 25 : 0),
        });

        try {
          const { useNotificationStore } = require("./notification-store");
          const addNotif = useNotificationStore.getState().addNotification;
          for (const a of newAchievements) {
            addNotif({ type: "achievement", title: a.name, description: a.description, icon: "Trophy", color: "text-amber-400" });
          }
        } catch { /* notification store not loaded yet */ }
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
      }),
    },
  ),
);
