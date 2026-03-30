import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LearningProgress {
  lessonsCompleted: number;
  flashcardsReviewed: number;
  quizzesAttempted: number;
  avgScore: number; // 0–100
}

export interface RetentionEvents {
  day1: boolean;
  day7: boolean;
  day30: boolean;
}

interface AnalyticsState {
  // Session tracking
  sessionCount: number;
  totalTimeSpent: number; // minutes
  lastSessionDate: string; // ISO date YYYY-MM-DD
  sessionStartTimestamp: number | null;

  // Session metrics (rolling)
  tradesPerSession: number[]; // last N sessions, trade count each
  avgSessionDuration: number; // minutes, rolling average

  // Feature usage
  featureUsage: Record<string, number>;

  // Streaks
  weeklyActiveStreak: number; // weeks in a row with at least 1 session
  longestStreak: number;
  lastActiveWeek: string; // ISO week string YYYY-Www

  // Learning
  learningProgress: LearningProgress;

  // Retention
  retentionEvents: RetentionEvents;

  // First seen date for retention day calculation
  firstSeenDate: string; // ISO date

  // Actions
  startSession: () => void;
  endSession: (tradesThisSession: number) => void;
  trackFeatureUse: (feature: string) => void;
  updateLearningProgress: (update: Partial<LearningProgress>) => void;
  checkRetention: () => void;
}

function getISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

function getISOWeek(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7,
  );
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

function daysBetween(a: string, b: string): number {
  const msA = new Date(a).getTime();
  const msB = new Date(b).getTime();
  return Math.abs(Math.round((msB - msA) / 86400000));
}

const INITIAL_LEARNING: LearningProgress = {
  lessonsCompleted: 0,
  flashcardsReviewed: 0,
  quizzesAttempted: 0,
  avgScore: 0,
};

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      sessionCount: 0,
      totalTimeSpent: 0,
      lastSessionDate: "",
      sessionStartTimestamp: null,
      tradesPerSession: [],
      avgSessionDuration: 0,
      featureUsage: {},
      weeklyActiveStreak: 0,
      longestStreak: 0,
      lastActiveWeek: "",
      learningProgress: { ...INITIAL_LEARNING },
      retentionEvents: { day1: false, day7: false, day30: false },
      firstSeenDate: getISODate(),

      startSession: () => {
        const now = Date.now();
        const today = getISODate();
        const currentWeek = getISOWeek();

        set((s) => {
          // Update weekly streak
          let weeklyActiveStreak = s.weeklyActiveStreak;
          const prevWeek = s.lastActiveWeek;

          if (prevWeek !== currentWeek) {
            // Check if last active week was immediately prior
            const prevWeekDate = new Date();
            prevWeekDate.setDate(prevWeekDate.getDate() - 7);
            const prevExpected = getISOWeekForDate(prevWeekDate);
            if (prevWeek === prevExpected) {
              weeklyActiveStreak += 1;
            } else if (prevWeek === "") {
              weeklyActiveStreak = 1;
            } else {
              weeklyActiveStreak = 1; // streak broken
            }
          }

          const longestStreak = Math.max(s.longestStreak, weeklyActiveStreak);

          return {
            sessionCount: s.sessionCount + 1,
            lastSessionDate: today,
            sessionStartTimestamp: now,
            weeklyActiveStreak,
            longestStreak,
            lastActiveWeek: currentWeek,
          };
        });
      },

      endSession: (tradesThisSession: number) => {
        set((s) => {
          if (s.sessionStartTimestamp === null) return {};

          const durationMs = Date.now() - s.sessionStartTimestamp;
          const durationMin = Math.max(1, Math.round(durationMs / 60000));

          const newTrades = [...s.tradesPerSession, tradesThisSession].slice(-20);
          const newTotal = s.totalTimeSpent + durationMin;
          const newAvg = Math.round(
            (s.avgSessionDuration * (s.sessionCount - 1) + durationMin) /
              Math.max(1, s.sessionCount),
          );

          return {
            totalTimeSpent: newTotal,
            sessionStartTimestamp: null,
            tradesPerSession: newTrades,
            avgSessionDuration: newAvg,
          };
        });
      },

      trackFeatureUse: (feature: string) => {
        set((s) => ({
          featureUsage: {
            ...s.featureUsage,
            [feature]: (s.featureUsage[feature] ?? 0) + 1,
          },
        }));
      },

      updateLearningProgress: (update: Partial<LearningProgress>) => {
        set((s) => ({
          learningProgress: { ...s.learningProgress, ...update },
        }));
      },

      checkRetention: () => {
        set((s) => {
          const today = getISODate();
          const first = s.firstSeenDate || today;
          const days = daysBetween(first, today);

          const updated = { ...s.retentionEvents };
          if (days >= 1) updated.day1 = true;
          if (days >= 7) updated.day7 = true;
          if (days >= 30) updated.day30 = true;

          return { retentionEvents: updated };
        });
      },
    }),
    { name: "analytics-store" },
  ),
);

// Helper used inside startSession
function getISOWeekForDate(date: Date): string {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const weekNum = Math.ceil(
    ((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7,
  );
  return `${date.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}
