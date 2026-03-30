import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OHLCVBar } from "@/types/market";
import {
  generateAIPlayers,
  type AIPlayer,
} from "@/services/ai-players/player-factory";
import {
  simulateDay,
  createInitialPortfolio,
  type AIPortfolio,
} from "@/services/ai-players/strategy-engine";

// ── Leaderboard entry (competition-specific) ─────────────────────────────────

export interface CompetitionEntry {
  id: string;
  name: string;
  isUser: boolean;
  portfolioValue: number;
  dailyPnL: number;
  totalReturn: number;
  strategy: string;
  tradeCount: number;
  rank: number;
}

// ── Store ────────────────────────────────────────────────────────────────────

interface CompetitionState {
  // Season
  seasonId: string;
  isSeasonActive: boolean;
  lobbyName: string;

  // Players
  aiPlayers: AIPlayer[];
  aiPortfolios: Record<string, AIPortfolio>;

  // User
  userRank: number;

  // Leaderboard
  leaderboard: CompetitionEntry[];

  // Last processed day
  lastProcessedDay: number;

  // Actions
  initializeSeason: (lobbyName?: string) => void;
  advanceDay: (
    dailyBars: Record<string, OHLCVBar>,
    tradingDayIndex: number,
  ) => void;
  updateLeaderboard: (userPortfolioValue: number) => void;
  resetSeason: () => void;
}

const LOBBY_ADJECTIVES = [
  "Alpha",
  "Sigma",
  "Delta",
  "Quantum",
  "Prime",
  "Apex",
  "Vanguard",
  "Titan",
];
const LOBBY_NOUNS = [
  "Trading Room",
  "Capital",
  "Markets",
  "Exchange",
  "Floor",
  "Arena",
  "Desk",
  "Fund",
];

function randomLobbyName(seed: number): string {
  const adj = LOBBY_ADJECTIVES[seed % LOBBY_ADJECTIVES.length];
  const noun =
    LOBBY_NOUNS[Math.floor(seed / LOBBY_ADJECTIVES.length) % LOBBY_NOUNS.length];
  return `${adj} ${noun}`;
}

export const useCompetitionStore = create<CompetitionState>()(
  persist(
    (set, get) => ({
      seasonId: "",
      isSeasonActive: false,
      lobbyName: "",
      aiPlayers: [],
      aiPortfolios: {},
      userRank: 0,
      leaderboard: [],
      lastProcessedDay: -1,

      initializeSeason: (lobbyName?: string) => {
        const seed = Date.now() & 0x7fffffff;
        const seasonId = `season-${seed}`;
        const name = lobbyName || randomLobbyName(seed);
        const players = generateAIPlayers(25, seed);

        const portfolios: Record<string, AIPortfolio> = {};
        for (const player of players) {
          portfolios[player.id] = createInitialPortfolio(player.id);
        }

        set({
          seasonId,
          isSeasonActive: true,
          lobbyName: name,
          aiPlayers: players,
          aiPortfolios: portfolios,
          userRank: 0,
          leaderboard: [],
          lastProcessedDay: -1,
        });
      },

      advanceDay: (
        dailyBars: Record<string, OHLCVBar>,
        tradingDayIndex: number,
      ) => {
        const state = get();
        if (!state.isSeasonActive) return;
        if (tradingDayIndex <= state.lastProcessedDay) return;

        const updatedPortfolios = { ...state.aiPortfolios };

        for (const player of state.aiPlayers) {
          const portfolio = updatedPortfolios[player.id];
          if (portfolio) {
            updatedPortfolios[player.id] = simulateDay(
              player,
              portfolio,
              dailyBars,
              tradingDayIndex,
            );
          }
        }

        set({
          aiPortfolios: updatedPortfolios,
          lastProcessedDay: tradingDayIndex,
        });
      },

      updateLeaderboard: (userPortfolioValue: number) => {
        const state = get();
        if (!state.isSeasonActive) return;

        // Skip expensive sort if user's portfolio value hasn't moved by more than $1
        const existingUser = state.leaderboard.find((e) => e.isUser);
        if (
          existingUser &&
          Math.abs(existingUser.portfolioValue - userPortfolioValue) < 1
        ) {
          return;
        }

        const userReturn =
          ((userPortfolioValue - 100_000) / 100_000) * 100;

        const entries: CompetitionEntry[] = [
          {
            id: "user",
            name: "You",
            isUser: true,
            portfolioValue: userPortfolioValue,
            dailyPnL: 0, // Caller can update if needed
            totalReturn: userReturn,
            strategy: "Manual",
            tradeCount: 0,
            rank: 0,
          },
        ];

        for (const player of state.aiPlayers) {
          const portfolio = state.aiPortfolios[player.id];
          if (portfolio) {
            entries.push({
              id: player.id,
              name: player.name,
              isUser: false,
              portfolioValue: portfolio.totalValue,
              dailyPnL: portfolio.dailyPnL,
              totalReturn: portfolio.totalReturn,
              strategy: player.strategy,
              tradeCount: portfolio.tradeCount,
              rank: 0,
            });
          }
        }

        // Sort by portfolio value descending
        entries.sort((a, b) => b.portfolioValue - a.portfolioValue);

        // Assign ranks
        entries.forEach((e, i) => {
          e.rank = i + 1;
        });

        const userEntry = entries.find((e) => e.isUser);
        set({
          leaderboard: entries,
          userRank: userEntry?.rank ?? 0,
        });
      },

      resetSeason: () => {
        set({
          seasonId: "",
          isSeasonActive: false,
          lobbyName: "",
          aiPlayers: [],
          aiPortfolios: {},
          userRank: 0,
          leaderboard: [],
          lastProcessedDay: -1,
        });
      },
    }),
    {
      name: "finsim-competition-v1",
      partialize: (state) => ({
        seasonId: state.seasonId,
        isSeasonActive: state.isSeasonActive,
        lobbyName: state.lobbyName,
        aiPlayers: state.aiPlayers,
        aiPortfolios: state.aiPortfolios,
        lastProcessedDay: state.lastProcessedDay,
      }),
    },
  ),
);
