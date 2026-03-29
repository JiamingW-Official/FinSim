"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  RotateCcw,
  Check,
  X,
  Flame,
  ChevronLeft,
  ChevronRight,
  Keyboard,
} from "lucide-react";
import { useFlashcardStore } from "@/stores/flashcard-store";
import { CATEGORY_LABELS, FLASHCARDS, type FlashcardItem } from "@/data/flashcards";
import { soundEngine } from "@/services/audio/sound-engine";

// ─── Filter categories ──────────────────────────────────────────────────────

const FILTER_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "options-greeks", label: "Options" },
  { id: "risk-mgmt", label: "Risk" },
  { id: "tech-patterns", label: "Technical" },
  { id: "macro", label: "Macro" },
  { id: "crypto", label: "Crypto" },
  { id: "quant", label: "Quant" },
  { id: "indicators", label: "Indicators" },
  { id: "basics", label: "Basics" },
] as const;

// SM-2 ratings
type SM2Rating = 1 | 2 | 3;

const RATING_LABELS: Record<SM2Rating, { label: string; color: string }> = {
  1: { label: "Again", color: "text-rose-400" },
  2: { label: "Hard", color: "text-amber-400" },
  3: { label: "Easy", color: "text-green-400" },
};

// ─── Session stats state ────────────────────────────────────────────────────

export interface SessionStats {
  reviewed: number;
  correct: number;
  startTime: number;
  newCards: number;
  reviewCards: number;
}

interface AdaptiveFlashcardsProps {
  onSessionStats?: (stats: SessionStats) => void;
}

export function AdaptiveFlashcards({ onSessionStats }: AdaptiveFlashcardsProps) {
  const getDueCards = useFlashcardStore((s) => s.getDueCards);
  const getMastery = useFlashcardStore((s) => s.getMastery);
  const reviewCard = useFlashcardStore((s) => s.reviewCard);
  const mastery = useFlashcardStore((s) => s.mastery);

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [slideDir, setSlideDir] = useState<"left" | "right">("right");
  const [streak, setStreak] = useState(0);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    reviewed: 0,
    correct: 0,
    startTime: Date.now(),
    newCards: 0,
    reviewCards: 0,
  });
  const [showKeyHint, setShowKeyHint] = useState(false);

  const answerTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (answerTimerRef.current) clearTimeout(answerTimerRef.current);
    };
  }, []);

  // Filtered card pool
  const filteredCards: FlashcardItem[] = useMemo(() => {
    const pool =
      activeCategory === "all"
        ? FLASHCARDS
        : FLASHCARDS.filter((c) => c.category === activeCategory);

    // Sort: new cards first, then by score (weakest first)
    const now = Date.now();
    return [...pool].sort((a, b) => {
      const ma = mastery[a.id];
      const mb = mastery[b.id];
      if (!ma && !mb) return 0;
      if (!ma) return -1;
      if (!mb) return 1;
      const scoreA =
        (ma.correct / (ma.correct + ma.incorrect)) * 100 -
        ((now - ma.lastSeen) / (1000 * 60 * 60)) * 0.5;
      const scoreB =
        (mb.correct / (mb.correct + mb.incorrect)) * 100 -
        ((now - mb.lastSeen) / (1000 * 60 * 60)) * 0.5;
      return scoreA - scoreB;
    });
  }, [activeCategory, mastery]);

  // Reset to start when category changes
  useEffect(() => {
    setCardIndex(0);
    setFlipped(false);
    setSlideDir("right");
  }, [activeCategory]);

  const currentCard = filteredCards[cardIndex] as FlashcardItem | undefined;
  const totalCards = filteredCards.length;

  const handleFlip = useCallback(() => {
    if (!flipped) {
      setFlipped(true);
      soundEngine.playClick();
    }
  }, [flipped]);

  const advance = useCallback(
    (rating: SM2Rating) => {
      if (!currentCard) return;

      const isCorrect = rating >= 2;
      const xp = reviewCard(currentCard.id, isCorrect);
      void xp;

      const isNew = !mastery[currentCard.id];

      setSessionStats((prev) => {
        const next: SessionStats = {
          ...prev,
          reviewed: prev.reviewed + 1,
          correct: isCorrect ? prev.correct + 1 : prev.correct,
          newCards: isNew ? prev.newCards + 1 : prev.newCards,
          reviewCards: isNew ? prev.reviewCards : prev.reviewCards + 1,
        };
        onSessionStats?.(next);
        return next;
      });

      if (isCorrect) {
        setStreak((s) => s + 1);
        soundEngine.playCorrect();
      } else {
        setStreak(0);
        soundEngine.playWrong();
      }

      setSlideDir(isCorrect ? "right" : "left");

      answerTimerRef.current = setTimeout(() => {
        setFlipped(false);
        if (cardIndex + 1 < totalCards) {
          setCardIndex((i) => i + 1);
        } else {
          // Wrap around for infinite review
          setCardIndex(0);
        }
      }, 280);
    },
    [currentCard, reviewCard, mastery, onSessionStats, cardIndex, totalCards],
  );

  const handlePrev = useCallback(() => {
    if (cardIndex > 0) {
      setSlideDir("left");
      setFlipped(false);
      setCardIndex((i) => i - 1);
    }
  }, [cardIndex]);

  const handleNext = useCallback(() => {
    if (cardIndex + 1 < totalCards) {
      setSlideDir("right");
      setFlipped(false);
      setCardIndex((i) => i + 1);
    }
  }, [cardIndex, totalCards]);

  // ─── Keyboard shortcuts ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't fire when typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          handleFlip();
          break;
        case "ArrowRight":
          if (!flipped) handleNext();
          break;
        case "ArrowLeft":
          if (!flipped) handlePrev();
          break;
        case "1":
          if (flipped) advance(1);
          break;
        case "2":
          if (flipped) advance(2);
          break;
        case "3":
          if (flipped) advance(3);
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleFlip, handleNext, handlePrev, advance, flipped]);

  // ─── Derived ────────────────────────────────────────────────────────────
  const cat = currentCard ? CATEGORY_LABELS[currentCard.category] : undefined;
  const cardMastery = currentCard ? getMastery(currentCard.id) : 0;
  const isNew = currentCard ? !mastery[currentCard.id] : false;

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Category filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {FILTER_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
              activeCategory === cat.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/20 bg-muted/30 text-muted-foreground hover:border-border hover:text-foreground",
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Header row: streak + card counter + keyboard hint */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {streak >= 3 && (
            <motion.div
              key={streak}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5"
            >
              <Flame className="h-3 w-3 text-amber-400" />
              <span className="text-[11px] font-semibold text-amber-400">
                Streak: {streak}
              </span>
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono tabular-nums text-muted-foreground">
            Card {cardIndex + 1}/{totalCards}
          </span>
          <button
            type="button"
            onClick={() => setShowKeyHint((v) => !v)}
            className="rounded p-0.5 hover:bg-muted/30 transition-colors"
            title="Keyboard shortcuts"
          >
            <Keyboard className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Keyboard shortcut hint */}
      <AnimatePresence>
        {showKeyHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-md border border-border/20 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                <span>
                  <kbd className="rounded border border-border/20 bg-muted px-1 font-mono">Space</kbd> flip card
                </span>
                <span>
                  <kbd className="rounded border border-border/20 bg-muted px-1 font-mono">←</kbd>
                  <kbd className="rounded border border-border/20 bg-muted px-1 font-mono">→</kbd> navigate
                </span>
                <span>
                  <kbd className="rounded border border-border/20 bg-muted px-1 font-mono">1</kbd> Again
                </span>
                <span>
                  <kbd className="rounded border border-border/20 bg-muted px-1 font-mono">2</kbd> Hard
                </span>
                <span>
                  <kbd className="rounded border border-border/20 bg-muted px-1 font-mono">3</kbd> Easy
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted/30">
        <motion.div
          className="h-full rounded-full bg-primary"
          animate={{ width: `${((cardIndex + 1) / Math.max(totalCards, 1)) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Card */}
      {currentCard ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id + String(flipped)}
            initial={{ opacity: 0, x: slideDir === "right" ? 48 : -48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: slideDir === "right" ? -48 : 48 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="flex-1"
          >
            <div
              className={cn(
                "card-flip-container cursor-pointer",
                flipped && "flipped",
              )}
              onClick={handleFlip}
            >
              {/* Front */}
              <div className="card-flip-front min-h-[220px] rounded-md border border-border/20 bg-card p-5 flex flex-col items-center justify-center gap-3">
                <div className="flex w-full items-center justify-between">
                  {cat && (
                    <span
                      className={cn(
                        "text-[11px] font-semibold",
                        cat.color,
                      )}
                    >
                      {cat.label}
                    </span>
                  )}
                  <div className="ml-auto flex items-center gap-1.5">
                    {isNew && (
                      <span className="rounded-sm bg-primary/10 px-1.5 py-0.5 text-[11px] font-semibold text-primary">
                        New
                      </span>
                    )}
                    {!isNew && cardMastery > 0 && (
                      <span className="text-[11px] tabular-nums text-muted-foreground">
                        {cardMastery}% mastery
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-center text-base font-semibold leading-snug whitespace-pre-line">
                  {currentCard.front}
                </p>

                {!flipped && (
                  <motion.div
                    className="flex items-center gap-1 mt-1"
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 2.2, repeat: Infinity, type: "tween" }}
                  >
                    <RotateCcw className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Click or press Space to flip
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Back */}
              <div className="card-flip-back min-h-[220px] rounded-md border border-primary/20 bg-card p-5 flex flex-col justify-center gap-3">
                {cat && (
                  <span
                    className={cn(
                      "text-[11px] font-semibold",
                      cat.color,
                    )}
                  >
                    {cat.label}
                  </span>
                )}
                <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                  {currentCard.back}
                </p>
                {currentCard.hint && (
                  <p className="text-xs text-muted-foreground italic border-t border-border/20 pt-2 mt-1">
                    {currentCard.hint}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-muted-foreground">No cards in this category</p>
        </div>
      )}

      {/* SM-2 rating buttons (shown after flip) */}
      <AnimatePresence>
        {flipped && currentCard && (
          <motion.div
            className="flex gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {([1, 2, 3] as SM2Rating[]).map((rating) => {
              const { label, color } = RATING_LABELS[rating];
              const isEasy = rating === 3;
              const isHard = rating === 1;
              return (
                <button
                  key={rating}
                  type="button"
                  onClick={() => advance(rating)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2.5 text-xs font-semibold transition-colors hover:brightness-110 active:scale-95",
                    isEasy &&
                      "border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20",
                    rating === 2 &&
                      "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20",
                    isHard &&
                      "border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20",
                  )}
                >
                  {isEasy && <Check className="h-3.5 w-3.5" />}
                  {isHard && <RotateCcw className="h-3.5 w-3.5" />}
                  <span className={color}>{label}</span>
                  <span className="text-[11px] font-mono text-muted-foreground/60">({rating})</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation row (shown before flip) */}
      {!flipped && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={cardIndex === 0}
            className="flex items-center gap-1 rounded-md border border-border/20 bg-muted/20 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Prev
          </button>

          <span className="text-xs text-muted-foreground">
            {filteredCards.filter((c) => !mastery[c.id]).length} new
          </span>

          <button
            type="button"
            onClick={handleNext}
            disabled={cardIndex + 1 >= totalCards}
            className="flex items-center gap-1 rounded-md border border-border/20 bg-muted/20 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Session Stats Panel ────────────────────────────────────────────────────

interface SessionStatsPanelProps {
  stats: SessionStats;
}

export function SessionStatsPanel({ stats }: SessionStatsPanelProps) {
  const elapsed = Math.floor((Date.now() - stats.startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const accuracy =
    stats.reviewed > 0 ? Math.round((stats.correct / stats.reviewed) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <StatTile label="Reviewed" value={String(stats.reviewed)} sub="cards" />
      <StatTile
        label="Accuracy"
        value={`${accuracy}%`}
        sub={`${stats.correct} correct`}
        valueColor={accuracy >= 80 ? "text-green-400" : accuracy >= 60 ? "text-amber-400" : "text-rose-400"}
      />
      <StatTile
        label="Time"
        value={`${minutes}m ${String(seconds).padStart(2, "0")}s`}
        sub="this session"
      />
      <StatTile
        label="New / Review"
        value={`${stats.newCards}/${stats.reviewCards}`}
        sub="cards seen"
      />
    </div>
  );
}

function StatTile({
  label,
  value,
  sub,
  valueColor = "text-foreground",
}: {
  label: string;
  value: string;
  sub: string;
  valueColor?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-border/20 bg-card px-3 py-2.5">
      <span className="text-[11px] font-semibold text-muted-foreground">
        {label}
      </span>
      <span className={cn("text-sm font-semibold tabular-nums", valueColor)}>{value}</span>
      <span className="text-[11px] text-muted-foreground">{sub}</span>
    </div>
  );
}
