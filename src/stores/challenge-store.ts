import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useGameStore } from "./game-store";
import type { Achievement } from "@/types/game";
import type {
  DailyChallengeProgress,
  ScenarioResult,
} from "@/types/challenges";

interface ChallengeState {
  dailyDate: string; // "YYYY-MM-DD"
  dailyProgress: Record<string, DailyChallengeProgress>;
  totalDailyChallengesCompleted: number;
  scenarioResults: Record<string, ScenarioResult>; // best per scenario

  startDailyChallenge: (id: string, objectiveCount: number) => void;
  completeDailyChallenge: (id: string, pnl: number, xpReward: number) => void;
  completeScenario: (result: ScenarioResult) => void;
  resetDaily: (date: string) => void;
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

// Challenge-specific achievements
const CHALLENGE_ACHIEVEMENT_DEFS = [
  {
    id: "daily_grinder",
    name: "Daily Grinder",
    description: "Complete 7 daily challenges",
    icon: "Calendar",
    condition: (totalDaily: number, _scenarios: Record<string, ScenarioResult>) =>
      totalDaily >= 7,
  },
  {
    id: "history_buff",
    name: "History Buff",
    description: "Complete all 8 scenario missions",
    icon: "BookOpen",
    condition: (_totalDaily: number, scenarios: Record<string, ScenarioResult>) =>
      Object.keys(scenarios).length >= 8,
  },
  {
    id: "s_rank_trader",
    name: "S-Rank Trader",
    description: "Get S grade on any scenario",
    icon: "Crown",
    condition: (_totalDaily: number, scenarios: Record<string, ScenarioResult>) =>
      Object.values(scenarios).some((r) => r.grade === "S"),
  },
];

export const useChallengeStore = create<ChallengeState>()(
  persist(
    (set, get) => ({
      dailyDate: "",
      dailyProgress: {},
      totalDailyChallengesCompleted: 0,
      scenarioResults: {},

      startDailyChallenge: (id, objectiveCount) => {
        const state = get();
        const today = getToday();

        // Auto-reset if date changed
        if (state.dailyDate !== today) {
          set({
            dailyDate: today,
            dailyProgress: {},
          });
        }

        const existing = state.dailyProgress[id];
        if (existing?.isComplete) return; // already done

        set((s) => ({
          dailyProgress: {
            ...s.dailyProgress,
            [id]: {
              definitionId: id,
              completedObjectives: new Array(objectiveCount).fill(false),
              isComplete: false,
              startedAt: Date.now(),
              completedAt: null,
              finalPnL: null,
            },
          },
        }));
      },

      completeDailyChallenge: (id, pnl, xpReward) => {
        const state = get();
        const progress = state.dailyProgress[id];
        if (!progress || progress.isComplete) return;

        const newTotal = state.totalDailyChallengesCompleted + 1;

        set((s) => ({
          dailyProgress: {
            ...s.dailyProgress,
            [id]: {
              ...progress,
              completedObjectives: progress.completedObjectives.map(() => true),
              isComplete: true,
              completedAt: Date.now(),
              finalPnL: pnl,
            },
          },
          totalDailyChallengesCompleted: newTotal,
        }));

        // Award XP
        useGameStore.getState().awardXP(xpReward);

        // Check challenge achievements
        checkAchievements(newTotal, state.scenarioResults);
      },

      completeScenario: (result) => {
        const state = get();
        const prev = state.scenarioResults[result.scenarioId];

        // Keep best: higher grade wins; same grade → higher P&L wins
        const gradeRank = { S: 4, A: 3, B: 2, C: 1 } as const;
        if (
          prev &&
          (gradeRank[prev.grade] > gradeRank[result.grade] ||
            (prev.grade === result.grade && prev.pnl >= result.pnl))
        ) {
          return; // existing result is better
        }

        const newScenarios = {
          ...state.scenarioResults,
          [result.scenarioId]: result,
        };

        set({ scenarioResults: newScenarios });

        // Award XP
        useGameStore.getState().awardXP(result.xpEarned);

        // Check challenge achievements
        checkAchievements(state.totalDailyChallengesCompleted, newScenarios);
      },

      resetDaily: (date) => {
        set({
          dailyDate: date,
          dailyProgress: {},
        });
      },
    }),
    {
      name: "alpha-deck-challenges",
      partialize: (state) => ({
        dailyDate: state.dailyDate,
        dailyProgress: state.dailyProgress,
        totalDailyChallengesCompleted: state.totalDailyChallengesCompleted,
        scenarioResults: state.scenarioResults,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Auto-reset daily progress if date changed
        const today = getToday();
        if (state.dailyDate !== today) {
          useChallengeStore.setState({
            dailyDate: today,
            dailyProgress: {},
          });
        }
      },
    },
  ),
);

function checkAchievements(
  totalDaily: number,
  scenarios: Record<string, ScenarioResult>,
) {
  const gameState = useGameStore.getState();
  const existingIds = new Set(gameState.achievements.map((a: Achievement) => a.id));
  const newAchievements: Achievement[] = [];

  for (const def of CHALLENGE_ACHIEVEMENT_DEFS) {
    if (!existingIds.has(def.id) && def.condition(totalDaily, scenarios)) {
      newAchievements.push({
        id: def.id,
        name: def.name,
        description: def.description,
        icon: def.icon,
        unlockedAt: Date.now(),
      });
    }
  }

  if (newAchievements.length > 0) {
    useGameStore.setState((gs) => ({
      achievements: [...gs.achievements, ...newAchievements],
      pendingAchievements: [...gs.pendingAchievements, ...newAchievements],
    }));
  }
}
