import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FLASHCARDS, type FlashcardItem } from "@/data/flashcards";
import { useGameStore } from "./game-store";

interface CardMastery {
  correct: number;
  incorrect: number;
  lastSeen: number;
}

interface FlashcardState {
  mastery: Record<string, CardMastery>;
  dailyCardsReviewed: number;
  lastReviewDate: string;
  totalReviewed: number;
  totalCorrect: number;

  /** Record a card review result. Returns XP earned. */
  reviewCard: (cardId: string, correct: boolean) => number;
  /** Get cards sorted by priority (new > weak > due for review) */
  getDueCards: (count: number) => FlashcardItem[];
  /** Get mastery percentage (0-100) for a card */
  getMastery: (cardId: string) => number;
  /** Get overall mastery percentage across all cards */
  getOverallMastery: () => number;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export const useFlashcardStore = create<FlashcardState>()(
  persist(
    (set, get) => ({
      mastery: {},
      dailyCardsReviewed: 0,
      lastReviewDate: "",
      totalReviewed: 0,
      totalCorrect: 0,

      reviewCard: (cardId, correct) => {
        const state = get();
        const today = todayStr();
        const isNewDay = state.lastReviewDate !== today;

        const prev = state.mastery[cardId] ?? { correct: 0, incorrect: 0, lastSeen: 0 };
        const updated: CardMastery = {
          correct: prev.correct + (correct ? 1 : 0),
          incorrect: prev.incorrect + (correct ? 0 : 1),
          lastSeen: Date.now(),
        };

        const xp = correct ? 5 : 2;

        set({
          mastery: { ...state.mastery, [cardId]: updated },
          dailyCardsReviewed: isNewDay ? 1 : state.dailyCardsReviewed + 1,
          lastReviewDate: today,
          totalReviewed: state.totalReviewed + 1,
          totalCorrect: state.totalCorrect + (correct ? 1 : 0),
        });

        const gameStore = useGameStore.getState();
        gameStore.awardXP(xp);

        // Check flashcard achievements
        const newTotal = state.totalReviewed + 1;
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

        // Check 80% mastery on all cards
        const newMastery = { ...state.mastery, [cardId]: updated };
        let masteredAll = true;
        for (const card of FLASHCARDS) {
          const m = newMastery[card.id];
          if (!m) { masteredAll = false; break; }
          const t = m.correct + m.incorrect;
          if (t === 0 || m.correct / t < 0.8) { masteredAll = false; break; }
        }
        if (masteredAll && !existingIds.has("flashcard_master")) {
          const pending = {
            id: "flashcard_master",
            name: "Walking Encyclopedia",
            description: "Reach 80% mastery on all cards",
            icon: "GraduationCap",
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
        } catch { /* not loaded yet */ }
        try {
          const { useSeasonStore } = require("./season-store");
          useSeasonStore.getState().awardSeasonXP("flashcard_session");
        } catch { /* not loaded yet */ }

        return xp;
      },

      getDueCards: (count) => {
        const state = get();
        const now = Date.now();

        // Score each card: lower score = higher priority
        const scored = FLASHCARDS.map((card) => {
          const m = state.mastery[card.id];
          if (!m) return { card, score: 0 }; // Never seen — highest priority

          const total = m.correct + m.incorrect;
          const masteryRatio = total > 0 ? m.correct / total : 0;
          const hoursSinceLastSeen = (now - m.lastSeen) / (1000 * 60 * 60);

          // Low mastery = lower score (higher priority)
          // More time since seen = lower score
          const score = masteryRatio * 100 - hoursSinceLastSeen * 0.5;
          return { card, score };
        });

        scored.sort((a, b) => a.score - b.score);
        return scored.slice(0, count).map((s) => s.card);
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
          const m = state.mastery[card.id];
          if (m) {
            const t = m.correct + m.incorrect;
            if (t > 0 && m.correct / t >= 0.8) masteredCount++;
          }
        }
        return Math.round((masteredCount / total) * 100);
      },
    }),
    {
      name: "alpha-deck-flashcards",
      partialize: (state) => ({
        mastery: state.mastery,
        dailyCardsReviewed: state.dailyCardsReviewed,
        lastReviewDate: state.lastReviewDate,
        totalReviewed: state.totalReviewed,
        totalCorrect: state.totalCorrect,
      }),
    },
  ),
);
