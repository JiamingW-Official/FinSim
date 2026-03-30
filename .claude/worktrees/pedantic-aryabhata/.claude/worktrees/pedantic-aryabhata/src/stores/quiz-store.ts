import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useGameStore } from "./game-store";

// ── Spaced repetition card state ──────────────────────────────────────────────

export interface CardSRState {
 interval: number; // days until next review
 easeFactor: number; // SM-2 ease factor (starts at 2.5)
 repetitions: number; // consecutive correct answers
 nextDue: number; // timestamp ms when next review is due
 lastSeen: number; // timestamp ms
 mastered: boolean; // true when interval >= 21 days
}

// ── Quiz stats by topic ────────────────────────────────────────────────────────

export interface TopicStats {
 correct: number;
 total: number;
}

// ── Daily challenge state ──────────────────────────────────────────────────────

export interface DailyChallengeRecord {
 date: string; // YYYY-MM-DD
 correct: boolean;
 xpEarned: number;
}

// ── Quiz session result ────────────────────────────────────────────────────────

export interface QuizSessionResult {
 score: number; // 0–10
 totalQuestions: number;
 xpEarned: number;
 timestamp: number;
 topicFilter: string;
}

interface QuizState {
 // Flashcard spaced repetition
 cardSR: Record<string, CardSRState>;

 // Quiz stats
 topicStats: Record<string, TopicStats>;
 totalQuizXP: number;
 quizSessions: QuizSessionResult[];

 // Daily challenge
 dailyChallengeHistory: DailyChallengeRecord[];
 currentStreak: number;

 // Actions
 recordCardReview: (cardId: string, quality: 0 | 1 | 2 | 3 | 4 | 5) => void;
 recordQuizResult: (result: QuizSessionResult) => void;
 recordDailyChallenge: (date: string, correct: boolean) => void;
 getDueCardIds: () => string[];
 getMasteredCount: () => number;
}

/** SM-2 algorithm: returns updated interval, ease factor, repetitions */
function sm2(
 quality: number,
 repetitions: number,
 interval: number,
 easeFactor: number,
): { interval: number; easeFactor: number; repetitions: number } {
 let newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
 if (newEF < 1.3) newEF = 1.3;

 let newInterval: number;
 let newReps: number;

 if (quality < 3) {
 // Failed — reset
 newReps = 0;
 newInterval = 1;
 } else {
 newReps = repetitions + 1;
 if (newReps === 1) newInterval = 1;
 else if (newReps === 2) newInterval = 6;
 else newInterval = Math.round(interval * newEF);
 }

 return { interval: newInterval, easeFactor: newEF, repetitions: newReps };
}

export const useQuizStore = create<QuizState>()(
 persist(
 (set, get) => ({
 cardSR: {},
 topicStats: {},
 totalQuizXP: 0,
 quizSessions: [],
 dailyChallengeHistory: [],
 currentStreak: 0,

 recordCardReview: (cardId, quality) => {
 const state = get();
 const prev = state.cardSR[cardId] ?? {
 interval: 0,
 easeFactor: 2.5,
 repetitions: 0,
 nextDue: 0,
 lastSeen: 0,
 mastered: false,
 };

 const { interval, easeFactor, repetitions } = sm2(
 quality,
 prev.repetitions,
 prev.interval,
 prev.easeFactor,
 );

 const nextDue = Date.now() + interval * 24 * 60 * 60 * 1000;
 const mastered = interval >= 21;

 set({
 cardSR: {
 ...state.cardSR,
 [cardId]: {
 interval,
 easeFactor,
 repetitions,
 nextDue,
 lastSeen: Date.now(),
 mastered,
 },
 },
 });
 },

 recordQuizResult: (result) => {
 const state = get();
 set({
 quizSessions: [result, ...state.quizSessions].slice(0, 50),
 totalQuizXP: state.totalQuizXP + result.xpEarned,
 topicStats: {
 ...state.topicStats,
 [result.topicFilter]: {
 correct:
 (state.topicStats[result.topicFilter]?.correct ?? 0) +
 result.score,
 total:
 (state.topicStats[result.topicFilter]?.total ?? 0) +
 result.totalQuestions,
 },
 },
 });
 useGameStore.getState().awardXP(result.xpEarned);
 },

 recordDailyChallenge: (date, correct) => {
 const state = get();
 // Don't double-record the same date
 if (state.dailyChallengeHistory.some((r) => r.date === date)) return;

 const xpEarned = correct ? 50 : 0;
 if (correct) useGameStore.getState().awardXP(xpEarned);

 // Compute streak
 const sortedHistory = [...state.dailyChallengeHistory].sort((a, b) =>
 b.date.localeCompare(a.date),
 );
 const yesterday = new Date(Date.now() - 86400000)
 .toISOString()
 .slice(0, 10);
 const lastRecord = sortedHistory[0];
 let newStreak = state.currentStreak;
 if (correct) {
 if (!lastRecord || lastRecord.date === yesterday) {
 newStreak += 1;
 } else if (lastRecord.date !== date) {
 newStreak = 1;
 }
 }

 set({
 dailyChallengeHistory: [
 { date, correct, xpEarned },
 ...state.dailyChallengeHistory,
 ].slice(0, 365),
 currentStreak: correct ? newStreak : 0,
 });
 },

 getDueCardIds: () => {
 const now = Date.now();
 return Object.entries(get().cardSR)
 .filter(([, sr]) => sr.nextDue <= now)
 .map(([id]) => id);
 },

 getMasteredCount: () => {
 return Object.values(get().cardSR).filter((sr) => sr.mastered).length;
 },
 }),
 {
 name: "alpha-deck-quiz",
 partialize: (state) => ({
 cardSR: state.cardSR,
 topicStats: state.topicStats,
 totalQuizXP: state.totalQuizXP,
 quizSessions: state.quizSessions,
 dailyChallengeHistory: state.dailyChallengeHistory,
 currentStreak: state.currentStreak,
 }),
 },
 ),
);
