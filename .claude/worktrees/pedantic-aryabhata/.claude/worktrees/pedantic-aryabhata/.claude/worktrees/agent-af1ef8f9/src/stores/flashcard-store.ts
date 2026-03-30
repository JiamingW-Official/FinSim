import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FLASHCARDS, type FlashcardItem } from "@/data/flashcards";
import { useGameStore } from "./game-store";

// ─── SM-2 Types ────────────────────────────────────────────────────────────────

export interface SM2Record {
  easiness: number;      // ease factor, min 1.3
  interval: number;      // days until next review
  repetitions: number;   // consecutive correct reviews
  nextReview: number;    // unix ms timestamp
}

export interface Deck {
  id: string;
  name: string;
  cardIds: string[];
  createdAt: number;
  isBuiltIn: boolean;
}

// ─── Built-in decks ────────────────────────────────────────────────────────────

export const BUILTIN_DECKS: Deck[] = [
  {
    id: "builtin-options",
    name: "Options",
    cardIds: FLASHCARDS.filter((c) => c.category === "options-greeks").map((c) => c.id),
    createdAt: 0,
    isBuiltIn: true,
  },
  {
    id: "builtin-risk",
    name: "Risk Management",
    cardIds: FLASHCARDS.filter((c) => c.category === "risk-mgmt" || c.category === "risk").map((c) => c.id),
    createdAt: 0,
    isBuiltIn: true,
  },
  {
    id: "builtin-technical",
    name: "Technical Analysis",
    cardIds: FLASHCARDS.filter((c) => c.category === "tech-patterns" || c.category === "indicators").map((c) => c.id),
    createdAt: 0,
    isBuiltIn: true,
  },
  {
    id: "builtin-macro",
    name: "Macro",
    cardIds: FLASHCARDS.filter((c) => c.category === "macro").map((c) => c.id),
    createdAt: 0,
    isBuiltIn: true,
  },
  {
    id: "builtin-crypto",
    name: "Crypto",
    cardIds: FLASHCARDS.filter((c) => c.category === "crypto").map((c) => c.id),
    createdAt: 0,
    isBuiltIn: true,
  },
];

// ─── Legacy CardMastery (kept for backward-compat reads) ──────────────────────

interface CardMastery {
  correct: number;
  incorrect: number;
  lastSeen: number;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── SM-2 helper ──────────────────────────────────────────────────────────────

const DAY_MS = 86_400_000;

export type Rating = 0 | 1 | 2 | 3 | 4 | 5;

export function defaultSM2(): SM2Record {
  return { easiness: 2.5, interval: 0, repetitions: 0, nextReview: Date.now() };
}

export function sm2Update(rec: SM2Record, rating: Rating): SM2Record {
  const q = rating;
  const { easiness: ef, interval, repetitions } = rec;

  const newEf = Math.max(1.3, ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

  let newInterval: number;
  let newReps: number;

  if (q < 3) {
    newReps = 0;
    newInterval = 0; // reset to "new"
  } else {
    newReps = repetitions + 1;
    if (newReps === 1) newInterval = 1;
    else if (newReps === 2) newInterval = 6;
    else newInterval = Math.round(interval * newEf);
  }

  const nextReview = Date.now() + newInterval * DAY_MS;

  return {
    easiness: newEf,
    interval: newInterval,
    repetitions: newReps,
    nextReview,
  };
}

// ─── Store interface ───────────────────────────────────────────────────────────

interface FlashcardState {
  // SM-2 records keyed by card ID
  sm2: Record<string, SM2Record>;

  // Legacy mastery (preserved for backward compat)
  mastery: Record<string, CardMastery>;

  // Daily session tracking
  dailyCardsReviewed: number;
  lastReviewDate: string;
  totalReviewed: number;
  totalCorrect: number;

  // Streak tracking
  studyStreak: number;
  lastStudyDate: string; // YYYY-MM-DD

  // Custom decks (built-ins derived at runtime)
  customDecks: Deck[];

  // ─── Actions ────────────────────────────────────────────────────
  reviewCard: (cardId: string, correct: boolean) => number;
  rateSM2: (cardId: string, rating: Rating) => void;
  getDueCards: (count: number, cardIds?: string[]) => FlashcardItem[];
  getMastery: (cardId: string) => number;
  getOverallMastery: () => number;
  getSM2: (cardId: string) => SM2Record;
  createDeck: (name: string, cardIds: string[]) => Deck;
  deleteDeck: (deckId: string) => void;
  getDeckDueCount: (deck: Deck) => number;
  getDeckMasteryPct: (deck: Deck) => number;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useFlashcardStore = create<FlashcardState>()(
  persist(
    (set, get) => ({
      sm2: {},
      mastery: {},
      dailyCardsReviewed: 0,
      lastReviewDate: "",
      totalReviewed: 0,
      totalCorrect: 0,
      studyStreak: 0,
      lastStudyDate: "",
      customDecks: [],

      getSM2: (cardId) => {
        return get().sm2[cardId] ?? defaultSM2();
      },

      rateSM2: (cardId, rating) => {
        const state = get();
        const rec = state.sm2[cardId] ?? defaultSM2();
        const updated = sm2Update(rec, rating);
        const correct = rating >= 3;

        // Update legacy mastery too
        const prevMastery = state.mastery[cardId] ?? { correct: 0, incorrect: 0, lastSeen: 0 };
        const updatedMastery: CardMastery = {
          correct: prevMastery.correct + (correct ? 1 : 0),
          incorrect: prevMastery.incorrect + (correct ? 0 : 1),
          lastSeen: Date.now(),
        };

        const today = todayStr();
        const isNewDay = state.lastReviewDate !== today;
        const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
        const streakContinues = state.lastStudyDate === yesterday || state.lastStudyDate === today;
        const newStreak = streakContinues ? (state.lastStudyDate === today ? state.studyStreak : state.studyStreak + 1) : 1;

        set((s) => ({
          sm2: { ...s.sm2, [cardId]: updated },
          mastery: { ...s.mastery, [cardId]: updatedMastery },
          dailyCardsReviewed: isNewDay ? 1 : s.dailyCardsReviewed + 1,
          lastReviewDate: today,
          totalReviewed: s.totalReviewed + 1,
          totalCorrect: s.totalCorrect + (correct ? 1 : 0),
          studyStreak: newStreak,
          lastStudyDate: today,
        }));

        // XP
        const xp = correct ? 5 : 2;
        useGameStore.getState().awardXP(xp);

        // Achievements
        const newTotal = get().totalReviewed;
        const gameStore = useGameStore.getState();
        const existingIds = new Set(gameStore.achievements.map((a) => a.id));

        if (newTotal >= 10 && !existingIds.has("flashcard_starter")) {
          const pending = {
            id: "flashcard_starter",
            name: "Card Sharp",
            description: "Review 10 flashcards",
            icon: "Brain",
            unlockedAt: Date.now(),
          };
          useGameStore.setState((s) => ({
            achievements: [...s.achievements, pending],
            pendingAchievements: [...s.pendingAchievements, pending],
          }));
        }

        // Quest + Season hooks
        try {
          const { useQuestStore } = require("./quest-store");
          useQuestStore.getState().incrementSession("sessionCardsReviewed");
        } catch { /* not loaded */ }
        try {
          const { useSeasonStore } = require("./season-store");
          useSeasonStore.getState().awardSeasonXP("flashcard_session");
        } catch { /* not loaded */ }
      },

      reviewCard: (cardId, correct) => {
        const rating: Rating = correct ? 4 : 0;
        get().rateSM2(cardId, rating);
        return correct ? 5 : 2;
      },

      getDueCards: (count, cardIds) => {
        const state = get();
        const now = Date.now();
        const pool = cardIds
          ? FLASHCARDS.filter((c) => cardIds.includes(c.id))
          : FLASHCARDS;

        // Priority: new (interval=0) > overdue > not yet due
        const scored = pool.map((card) => {
          const rec = state.sm2[card.id];
          if (!rec || rec.interval === 0) return { card, score: 0 }; // new/reset — highest priority

          const overdueDays = (now - rec.nextReview) / DAY_MS;
          // Due cards (overdueDays >= 0) get negative scores, not-due get positive
          const score = -overdueDays;
          return { card, score };
        });

        // Filter out well-mastered cards not yet due (interval > 30, nextReview in future)
        const eligible = scored.filter(({ card, score }) => {
          const rec = state.sm2[card.id];
          if (!rec || rec.interval === 0) return true; // always include new
          if (rec.interval > 30 && rec.nextReview > now) return false; // skip mastered future
          return rec.nextReview <= now; // only due
        });

        eligible.sort((a, b) => a.score - b.score);
        return eligible.slice(0, count).map((s) => s.card);
      },

      getMastery: (cardId) => {
        const m = get().mastery[cardId];
        if (!m) return 0;
        const total = m.correct + m.incorrect;
        return total > 0 ? Math.round((m.correct / total) * 100) : 0;
      },

      getOverallMastery: () => {
        const state = get();
        const total = FLASHCARDS.length;
        if (total === 0) return 0;
        let masteredCount = 0;
        for (const card of FLASHCARDS) {
          const rec = state.sm2[card.id];
          if (rec && rec.interval > 21) masteredCount++;
        }
        return Math.round((masteredCount / total) * 100);
      },

      createDeck: (name, cardIds) => {
        const deck: Deck = {
          id: `custom-${Date.now()}`,
          name,
          cardIds,
          createdAt: Date.now(),
          isBuiltIn: false,
        };
        set((s) => ({ customDecks: [...s.customDecks, deck] }));
        return deck;
      },

      deleteDeck: (deckId) => {
        set((s) => ({ customDecks: s.customDecks.filter((d) => d.id !== deckId) }));
      },

      getDeckDueCount: (deck) => {
        const state = get();
        const now = Date.now();
        let due = 0;
        for (const cardId of deck.cardIds) {
          const rec = state.sm2[cardId];
          if (!rec || rec.interval === 0 || rec.nextReview <= now) due++;
        }
        return due;
      },

      getDeckMasteryPct: (deck) => {
        const state = get();
        if (deck.cardIds.length === 0) return 0;
        let mastered = 0;
        for (const cardId of deck.cardIds) {
          const rec = state.sm2[cardId];
          if (rec && rec.interval > 21) mastered++;
        }
        return Math.round((mastered / deck.cardIds.length) * 100);
      },
    }),
    {
      name: "alpha-deck-flashcards-v2",
      partialize: (state) => ({
        sm2: state.sm2,
        mastery: state.mastery,
        dailyCardsReviewed: state.dailyCardsReviewed,
        lastReviewDate: state.lastReviewDate,
        totalReviewed: state.totalReviewed,
        totalCorrect: state.totalCorrect,
        studyStreak: state.studyStreak,
        lastStudyDate: state.lastStudyDate,
        customDecks: state.customDecks,
      }),
    },
  ),
);
