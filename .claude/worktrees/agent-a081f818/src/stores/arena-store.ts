import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ArenaType, ArenaMatchResult, ArenaRank, ArenaNPC, ArenaTypeConfig } from "@/types/arena";
import { getArenaRankForElo, calculateEloChange } from "@/types/arena";
import { simulateOpponentResult } from "@/data/arena/arena-npcs";
import { useGameStore } from "./game-store";

// ── Per-type stats ─────────────────────────────────────────────

interface ArenaTypeStats {
  matches: number;
  wins: number;
  bestScore: number;
}

// ── Active match (transient, not persisted) ────────────────────

interface ActiveMatch {
  arenaType: ArenaType;
  opponent: ArenaNPC;
  config: ArenaTypeConfig;
  matchSeed: number;
  startedAt: number;
}

// ── Store interface ────────────────────────────────────────────

interface ArenaState {
  elo: number;
  rank: ArenaRank;
  totalMatches: number;
  totalWins: number;
  matchHistory: ArenaMatchResult[];
  currentStreak: number;
  bestStreak: number;
  typeStats: Partial<Record<ArenaType, ArenaTypeStats>>;
  activeMatch: ActiveMatch | null;

  // Actions
  startMatch: (arenaType: ArenaType, opponent: ArenaNPC, config: ArenaTypeConfig) => void;
  completeMatch: (playerResult: {
    pnl: number;
    pnlPercent: number;
    maxDrawdown: number;
    tradesCount: number;
    winRate: number;
    score: number;
    timeUsedSeconds: number;
  }) => ArenaMatchResult | null;
  cancelMatch: () => void;
}

const MAX_HISTORY = 50;

export const useArenaStore = create<ArenaState>()(
  persist(
    (set, get) => ({
      elo: 600,
      rank: "bronze",
      totalMatches: 0,
      totalWins: 0,
      matchHistory: [],
      currentStreak: 0,
      bestStreak: 0,
      typeStats: {},
      activeMatch: null,

      startMatch: (arenaType, opponent, config) => {
        set({
          activeMatch: {
            arenaType,
            opponent,
            config,
            matchSeed: Math.floor(Math.random() * 1_000_000),
            startedAt: Date.now(),
          },
        });
      },

      completeMatch: (playerResult) => {
        const state = get();
        if (!state.activeMatch) return null;

        const { arenaType, opponent, config, matchSeed } = state.activeMatch;

        // Simulate opponent result
        const opponentResult = simulateOpponentResult(opponent, matchSeed, config);

        // Determine winner
        const playerWon = playerResult.score > opponentResult.score;

        // Calculate ELO change
        const eloChange = calculateEloChange(state.elo, opponent.elo, playerWon);
        const newElo = Math.max(0, state.elo + eloChange);
        const newRank = getArenaRankForElo(newElo);

        // XP: win = 40 base + bonus, loss = 15
        let xpEarned = playerWon ? 40 : 15;
        // Bonus for beating higher-rated opponents
        if (playerWon && opponent.elo > state.elo + 100) xpEarned += 20;
        // Bonus for streak
        const newStreak = playerWon ? state.currentStreak + 1 : 0;
        if (newStreak >= 3) xpEarned += 10;

        const newBestStreak = Math.max(state.bestStreak, newStreak);
        const newTotalMatches = state.totalMatches + 1;
        const newTotalWins = state.totalWins + (playerWon ? 1 : 0);

        // Build match result
        const matchResult: ArenaMatchResult = {
          matchId: `match_${Date.now()}`,
          arenaType,
          opponentId: opponent.id,
          opponentName: opponent.name,
          playerPnL: playerResult.pnl,
          playerPnLPercent: playerResult.pnlPercent,
          playerMaxDrawdown: playerResult.maxDrawdown,
          playerTradesCount: playerResult.tradesCount,
          playerWinRate: playerResult.winRate,
          playerScore: playerResult.score,
          opponentPnL: opponentResult.pnl,
          opponentPnLPercent: opponentResult.pnlPercent,
          opponentScore: opponentResult.score,
          playerWon,
          eloBefore: state.elo,
          eloAfter: newElo,
          eloChange,
          xpEarned,
          timeLimitSeconds: config.timeLimitSeconds,
          timeUsedSeconds: playerResult.timeUsedSeconds,
          completedAt: Date.now(),
        };

        // Update per-type stats
        const prevTypeStats = state.typeStats[arenaType] ?? { matches: 0, wins: 0, bestScore: 0 };
        const newTypeStats: ArenaTypeStats = {
          matches: prevTypeStats.matches + 1,
          wins: prevTypeStats.wins + (playerWon ? 1 : 0),
          bestScore: Math.max(prevTypeStats.bestScore, playerResult.score),
        };

        // Trim history
        const newHistory = [matchResult, ...state.matchHistory].slice(0, MAX_HISTORY);

        set({
          elo: newElo,
          rank: newRank,
          totalMatches: newTotalMatches,
          totalWins: newTotalWins,
          matchHistory: newHistory,
          currentStreak: newStreak,
          bestStreak: newBestStreak,
          typeStats: { ...state.typeStats, [arenaType]: newTypeStats },
          activeMatch: null,
        });

        // Award XP
        useGameStore.getState().awardXP(xpEarned);

        // Check arena achievements
        checkArenaAchievements(newTotalWins, newElo, newBestStreak);

        return matchResult;
      },

      cancelMatch: () => {
        set({ activeMatch: null });
      },
    }),
    {
      name: "alpha-deck-arena",
      partialize: (state) => ({
        elo: state.elo,
        rank: state.rank,
        totalMatches: state.totalMatches,
        totalWins: state.totalWins,
        matchHistory: state.matchHistory,
        currentStreak: state.currentStreak,
        bestStreak: state.bestStreak,
        typeStats: state.typeStats,
      }),
    },
  ),
);

// ── Arena achievements ─────────────────────────────────────────

function checkArenaAchievements(totalWins: number, elo: number, bestStreak: number) {
  const gameState = useGameStore.getState();
  const existingIds = new Set(gameState.achievements.map((a) => a.id));
  const pending: Array<{ id: string; name: string; description: string; icon: string; unlockedAt: number }> = [];

  if (totalWins >= 1 && !existingIds.has("arena_first_win")) {
    pending.push({
      id: "arena_first_win",
      name: "Gladiator",
      description: "Win your first arena match",
      icon: "Swords",
      unlockedAt: Date.now(),
    });
  }

  if (elo >= 1200 && !existingIds.has("arena_gold")) {
    pending.push({
      id: "arena_gold",
      name: "Golden Fighter",
      description: "Reach Gold rank in Arena",
      icon: "Medal",
      unlockedAt: Date.now(),
    });
  }

  if (bestStreak >= 5 && !existingIds.has("arena_streak_5")) {
    pending.push({
      id: "arena_streak_5",
      name: "Unstoppable Force",
      description: "Win 5 arena matches in a row",
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
