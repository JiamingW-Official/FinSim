"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { QuizRace } from "@/components/education/QuizRace";
import { AdaptiveFlashcards } from "@/components/education/AdaptiveFlashcards";
import { BrowseCards } from "@/components/education/BrowseCards";
import { DeckManager } from "@/components/education/DeckManager";
import { FlashcardStats } from "@/components/education/FlashcardStats";
import { FLASHCARDS } from "@/data/flashcards";
import { useFlashcardStore } from "@/stores/flashcard-store";
import type { Deck } from "@/stores/flashcard-store";
import { BookOpen, Flame, Target, CheckSquare, BarChart2, Layers } from "lucide-react";

type FlashcardsTab = "adaptive" | "decks" | "quiz" | "browse" | "stats";

const TABS: { value: FlashcardsTab; label: string }[] = [
  { value: "adaptive", label: "Adaptive Review" },
  { value: "decks", label: "Decks" },
  { value: "quiz", label: "Quiz Race" },
  { value: "browse", label: "Browse" },
  { value: "stats", label: "Statistics" },
];

// ─── Stats bar ────────────────────────────────────────────────────────────────

function StatsBar() {
  const [mounted, setMounted] = useState(false);
  const dailyCardsReviewed = useFlashcardStore((s) => s.dailyCardsReviewed);
  const totalReviewed = useFlashcardStore((s) => s.totalReviewed);
  const totalCorrect = useFlashcardStore((s) => s.totalCorrect);
  const sm2 = useFlashcardStore((s) => s.sm2);
  const studyStreak = useFlashcardStore((s) => s.studyStreak);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dueCount = (() => {
    if (!mounted) return FLASHCARDS.length;
    const now = Date.now();
    let due = 0;
    for (const card of FLASHCARDS) {
      const rec = sm2[card.id];
      if (!rec || rec.interval === 0 || rec.nextReview <= now) due++;
    }
    return due;
  })();

  const accuracy =
    totalReviewed > 0 ? Math.round((totalCorrect / totalReviewed) * 100) : null;

  const statItems = [
    {
      icon: CheckSquare,
      label: "Reviewed today",
      value: String(dailyCardsReviewed),
      color: "text-primary",
    },
    {
      icon: Target,
      label: "Accuracy",
      value: accuracy !== null ? `${accuracy}%` : "—",
      color: accuracy !== null && accuracy >= 80 ? "text-green-400" : "text-amber-400",
    },
    {
      icon: BookOpen,
      label: "Cards due",
      value: String(dueCount),
      color: dueCount > 0 ? "text-orange-400" : "text-green-400",
    },
    {
      icon: Flame,
      label: "Streak",
      value: studyStreak > 0 ? `${studyStreak}d` : "—",
      color: studyStreak > 0 ? "text-orange-400" : "text-muted-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-0 border-b border-border/50">
      {statItems.map(({ icon: Icon, label, value, color }, idx) => (
        <div
          key={label}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 py-2.5",
            idx < statItems.length - 1 && "border-r border-border/40",
          )}
        >
          <div className="flex items-center gap-1">
            <Icon className={cn("h-3 w-3", color)} />
            <span className={cn("font-mono text-sm font-semibold tabular-nums", color)}>
              {value}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FlashcardsPage() {
  const [activeTab, setActiveTab] = useState<FlashcardsTab>("adaptive");
  // Active deck for studying (null = study all)
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);

  const handleStudyDeck = (deck: Deck) => {
    setActiveDeck(deck);
    setActiveTab("adaptive");
  };

  const handleExitDeck = () => {
    setActiveDeck(null);
    setActiveTab("decks");
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Page header */}
      <div className="border-b border-border/50 px-4 py-3">
        <h1 className="text-sm font-semibold">Flashcards</h1>
        <p className="text-xs text-muted-foreground">
          Learn and test your trading knowledge
        </p>
      </div>

      {/* Stats bar */}
      <StatsBar />

      {/* Tab bar */}
      <div className="flex gap-0.5 border-b border-border/50 px-4 pt-2 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              setActiveTab(tab.value);
              if (tab.value !== "adaptive") setActiveDeck(null);
            }}
            className={cn(
              "relative flex-shrink-0 rounded-t-md px-3 py-2 text-xs font-medium transition-colors",
              activeTab === tab.value
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            {activeTab === tab.value && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-6">
        <div className="mx-auto max-w-2xl">
          {activeTab === "adaptive" && (
            activeDeck ? (
              <AdaptiveFlashcards
                cardIds={activeDeck.cardIds}
                deckName={activeDeck.name}
                onExit={handleExitDeck}
              />
            ) : (
              <AdaptiveFlashcards />
            )
          )}
          {activeTab === "decks" && (
            <DeckManager onStudyDeck={handleStudyDeck} />
          )}
          {activeTab === "quiz" && <QuizRace />}
          {activeTab === "browse" && <BrowseCards />}
          {activeTab === "stats" && <FlashcardStats />}
        </div>
      </div>
    </div>
  );
}
