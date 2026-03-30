import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  BacktestConfig,
  BacktestResult,
  SavedStrategy,
  StrategyConfig,
  MonteCarloResult,
} from "@/types/backtest";
import { runBacktest, runMonteCarlo } from "@/services/backtest/engine";
import { useGameStore } from "./game-store";

type BacktestStatus = "idle" | "configuring" | "running" | "complete";

const MAX_HISTORY = 20;

interface BacktestState {
  status: BacktestStatus;
  currentConfig: BacktestConfig | null;
  currentResult: BacktestResult | null;
  monteCarloResult: MonteCarloResult | null;
  resultHistory: BacktestResult[];
  savedStrategies: SavedStrategy[];
  totalBacktestsRun: number;

  setStatus: (status: BacktestStatus) => void;
  executeBacktest: (config: BacktestConfig) => BacktestResult;
  saveStrategy: (strategy: StrategyConfig) => void;
  deleteStrategy: (id: string) => void;
  clearHistory: () => void;
}

export const useBacktestStore = create<BacktestState>()(
  persist(
    (set, get) => ({
      status: "idle",
      currentConfig: null,
      currentResult: null,
      monteCarloResult: null,
      resultHistory: [],
      savedStrategies: [],
      totalBacktestsRun: 0,

      setStatus: (status) => set({ status }),

      executeBacktest: (config) => {
        set({ status: "running", currentConfig: config, currentResult: null, monteCarloResult: null });

        const result = runBacktest(config);
        const state = get();
        const newTotal = state.totalBacktestsRun + 1;

        // Run Monte Carlo if configured
        let mcResult: MonteCarloResult | null = null;
        if (config.monteCarloRuns > 0) {
          mcResult = runMonteCarlo(config, config.monteCarloRuns);
        }

        const history = [result, ...state.resultHistory].slice(0, MAX_HISTORY);

        set({
          status: "complete",
          currentResult: result,
          monteCarloResult: mcResult,
          resultHistory: history,
          totalBacktestsRun: newTotal,
        });

        // Award XP
        const gameStore = useGameStore.getState();
        let xp = 20;
        if (result.metrics.totalReturn > 0) xp += 30;
        if (result.metrics.sharpeRatio > 1) xp += 50;
        if (result.metrics.sortinoRatio > 1.5) xp += 25;
        if (config.monteCarloRuns > 0) xp += 15;
        gameStore.awardXP(xp);

        // Check achievements
        const existingIds = new Set(gameStore.achievements.map((a) => a.id));
        const check = (id: string, name: string, desc: string, icon: string, cond: boolean) => {
          if (cond && !existingIds.has(id)) {
            const pending = { id, name, description: desc, icon, unlockedAt: Date.now() };
            useGameStore.setState((s) => ({
              achievements: [...s.achievements, pending],
              pendingAchievements: [...s.pendingAchievements, pending],
            }));
          }
        };

        check("first_backtest", "Lab Rat", "Run your first backtest", "FlaskConical", true);
        check("profitable_strategy", "Alpha Found", "Create a profitable strategy", "TrendingUp", result.metrics.totalReturn > 0);
        check("sharpe_above_1", "Risk Adjusted", "Achieve Sharpe ratio above 1.0", "Shield", result.metrics.sharpeRatio > 1);
        check("ten_backtests", "Systematic Thinker", "Run 10 backtests", "BarChart3", newTotal >= 10);
        check("s_rank_backtest", "Master Strategist", "Get S grade on a backtest", "Crown", result.grade === "S");

        // Quest + Season hooks
        try {
          const { useQuestStore } = require("./quest-store");
          useQuestStore.getState().incrementSession("sessionBacktestsRun");
        } catch { /* not loaded yet */ }
        try {
          const { useSeasonStore } = require("./season-store");
          useSeasonStore.getState().awardSeasonXP("backtest_run");
          if (result.metrics.totalReturn > 0) useSeasonStore.getState().awardSeasonXP("backtest_profitable");
        } catch { /* not loaded yet */ }

        return result;
      },

      saveStrategy: (strategy) => {
        const state = get();
        const existing = state.savedStrategies.find((s) => s.id === strategy.id);
        const currentResult = state.currentResult;

        if (existing) {
          const newGrade = currentResult?.grade ?? existing.bestGrade;
          const newReturn = currentResult?.metrics.totalReturnPercent ?? existing.bestReturn;
          set({
            savedStrategies: state.savedStrategies.map((s) =>
              s.id === strategy.id
                ? {
                    ...s,
                    strategy,
                    bestGrade: gradeRank(newGrade) > gradeRank(s.bestGrade) ? newGrade : s.bestGrade,
                    bestReturn: Math.max(newReturn, s.bestReturn),
                    savedAt: Date.now(),
                  }
                : s,
            ),
          });
        } else {
          set({
            savedStrategies: [
              ...state.savedStrategies,
              {
                id: strategy.id,
                strategy,
                bestGrade: currentResult?.grade ?? "C",
                bestReturn: currentResult?.metrics.totalReturnPercent ?? 0,
                savedAt: Date.now(),
              },
            ],
          });
        }
      },

      deleteStrategy: (id) => {
        set((s) => ({
          savedStrategies: s.savedStrategies.filter((st) => st.id !== id),
        }));
      },

      clearHistory: () => set({ resultHistory: [] }),
    }),
    {
      name: "alpha-deck-backtest",
      partialize: (state) => ({
        resultHistory: state.resultHistory.map((r) => ({
          ...r,
          bars: [],
          equityCurve: r.equityCurve.filter((_, i) => i % 5 === 0),
          drawdownCurve: [],
        })),
        savedStrategies: state.savedStrategies,
        totalBacktestsRun: state.totalBacktestsRun,
      }),
    },
  ),
);

function gradeRank(grade: string): number {
  switch (grade) {
    case "S": return 4;
    case "A": return 3;
    case "B": return 2;
    case "C": return 1;
    default: return 0;
  }
}
