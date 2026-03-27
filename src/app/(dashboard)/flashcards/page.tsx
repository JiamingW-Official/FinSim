"use client";

import { useState, useEffect } from "react";
import { Brain } from "lucide-react";
import { useFlashcardStore } from "@/stores/flashcard-store";
import { FLASHCARDS } from "@/data/flashcards";
import {
  AdaptiveFlashcards,
  SessionStatsPanel,
  type SessionStats,
} from "@/components/education/AdaptiveFlashcards";

export default function FlashcardsPage() {
  const overallMastery = useFlashcardStore((s) => s.getOverallMastery());
  const totalReviewed = useFlashcardStore((s) => s.totalReviewed);

  const [sessionStats, setSessionStats] = useState<SessionStats>({
    reviewed: 0,
    correct: 0,
    startTime: Date.now(),
    newCards: 0,
    reviewCards: 0,
  });

  // Tick every second to update elapsed time display
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  // tick is used only to force re-render; suppress lint
  void tick;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 bg-card px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
            <Brain className="h-4 w-4 text-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Flashcards</h1>
            <p className="text-muted-foreground text-xs">
              {FLASHCARDS.length} cards &middot; {overallMastery}% mastery &middot;{" "}
              {totalReviewed} lifetime reviews
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        {/* Session stats panel */}
        <SessionStatsPanel stats={sessionStats} />

        {/* Main flashcard component */}
        <div className="flex flex-1 flex-col">
          <AdaptiveFlashcards onSessionStats={setSessionStats} />
        </div>
      </div>
    </div>
  );
}
