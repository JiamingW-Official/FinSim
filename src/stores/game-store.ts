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

  awardXP: (amount: number) => void;
  recordTrade: (
    pnL: number,
    ticker: string,
    isShort: boolean,
    isLimitOrder: boolean,
  ) => Achievement[];
  dismissAchievement: () => void;
  clearXPGain: () => void;
  clearLevelUp: () => void;
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
        };

        // Calculate XP
        let xpGain = 10; // base XP for any trade
        if (isProfitable) xpGain += 25;
        else xpGain += 5;
        if (isLimitOrder) xpGain += 15;
        if (isShort) xpGain += 10;

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

        return newAchievements;
      },

      dismissAchievement: () => {
        set((state) => ({
          pendingAchievements: state.pendingAchievements.slice(1),
        }));
      },

      clearXPGain: () => set({ lastXPGain: null }),
      clearLevelUp: () => set({ lastLevelUp: null }),

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
