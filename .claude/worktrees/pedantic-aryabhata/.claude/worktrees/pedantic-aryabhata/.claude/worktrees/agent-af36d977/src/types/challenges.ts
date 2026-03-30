import type { PracticeChallenge } from "@/data/lessons/types";

/* ============================================
   DAILY CHALLENGE TYPES
   ============================================ */

export type DailyDifficulty = "beginner" | "intermediate" | "advanced";

export interface DailyChallengeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: DailyDifficulty;
  xpReward: number;
  challenge: PracticeChallenge;
}

export interface DailyChallengeProgress {
  definitionId: string;
  completedObjectives: boolean[];
  isComplete: boolean;
  startedAt: number | null;
  completedAt: number | null;
  finalPnL: number | null;
}

/* ============================================
   SCENARIO MISSION TYPES
   ============================================ */

export type ScenarioGrade = "S" | "A" | "B" | "C";

export interface ScenarioDefinition {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  unlockLevel: number;
  xpReward: number;
  challenge: PracticeChallenge;
  gradingThresholds: { S: number; A: number; B: number };
}

export interface ScenarioResult {
  scenarioId: string;
  grade: ScenarioGrade;
  pnl: number;
  pnlPercent: number;
  objectivesCompleted: number;
  objectivesTotal: number;
  timeTakenMs: number;
  xpEarned: number;
  completedAt: number;
}

export function computeScenarioGrade(
  pnlPercent: number,
  thresholds: { S: number; A: number; B: number },
): ScenarioGrade {
  if (pnlPercent >= thresholds.S) return "S";
  if (pnlPercent >= thresholds.A) return "A";
  if (pnlPercent >= thresholds.B) return "B";
  return "C";
}
