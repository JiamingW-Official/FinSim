"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FLASHCARDS, CATEGORY_LABELS, type FlashcardItem } from "@/data/flashcards";
import { useFlashcardStore, defaultSM2, sm2Update, type Rating } from "@/stores/flashcard-store";
import { cn } from "@/lib/utils";
import { RotateCcw, CheckCircle, Brain, ArrowLeft } from "lucide-react";

const DAY_MS = 86_400_000;

// ─── Rating Button Config ──────────────────────────────────────────────────────

interface RatingConfig {
  label: string;
  rating: Rating;
  description: string;
  className: string;
}

const RATINGS: RatingConfig[] = [
  {
    label: "Again",
    rating: 0,
    description: "Did not remember",
    className: "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20",
  },
  {
    label: "Hard",
    rating: 3,
    description: "Correct but difficult",
    className: "border-orange-500/40 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20",
  },
  {
    label: "Good",
    rating: 4,
    description: "Correct with effort",
    className: "border-blue-500/40 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20",
  },
  {
    label: "Easy",
    rating: 5,
    description: "Perfect recall",
    className: "border-green-500/40 bg-green-500/10 text-green-400 hover:bg-green-500/20",
  },
];

// ─── Next review label ─────────────────────────────────────────────────────────

function nextReviewLabel(interval: number): string {
  if (interval === 0) return "again soon";
  if (interval === 1) return "tomorrow";
  if (interval < 7) return `in ${interval} days`;
  if (interval < 14) return "in 1 week";
  if (interval < 30) return `in ${Math.round(interval / 7)} weeks`;
  return `in ${Math.round(interval / 30)} months`;
}

// ─── Flashcard face ────────────────────────────────────────────────────────────

interface FlashcardFaceProps {
  card: FlashcardItem;
  flipped: boolean;
  onFlip: () => void;
}

function FlashcardFace({ card, flipped, onFlip }: FlashcardFaceProps) {
  const catLabel = CATEGORY_LABELS[card.category]?.label ?? card.category;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onFlip}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? onFlip() : undefined)}
      className="relative cursor-pointer select-none rounded-lg border bg-card min-h-[200px] flex flex-col overflow-hidden hover:border-border/60 transition-colors"
    >
      <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-4 py-2">
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {catLabel}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {flipped ? "Answer" : "Tap to reveal answer"}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {!flipped ? (
          <motion.div
            key="front"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="flex-1 p-5 flex items-center"
          >
            <p className="text-base font-semibold leading-snug whitespace-pre-line">
              {card.front}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="flex-1 p-5 flex flex-col gap-3"
          >
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
              {card.back}
            </p>
            {card.hint && (
              <p className="text-[11px] text-muted-foreground border-l-2 border-border pl-2 leading-relaxed">
                {card.hint}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface AdaptiveFlashcardsProps {
  /** Optional subset of card IDs to study (e.g. from a deck). Defaults to all cards. */
  cardIds?: string[];
  /** Label shown in the header (e.g. deck name) */
  deckName?: string;
  /** Called when the user clicks back / finishes, if in deck mode */
  onExit?: () => void;
}

export function AdaptiveFlashcards({ cardIds, deckName, onExit }: AdaptiveFlashcardsProps) {
  const sm2Map = useFlashcardStore((s) => s.sm2);
  const rateSM2 = useFlashcardStore((s) => s.rateSM2);

  const [dueQueue, setDueQueue] = useState<FlashcardItem[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionDone, setSessionDone] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [phase, setPhase] = useState<"studying" | "done">("studying");
  const [initialized, setInitialized] = useState(false);
  const [lastRatedInterval, setLastRatedInterval] = useState<number | null>(null);

  // Pool of cards for this session
  const pool = useMemo(() => {
    if (cardIds) return FLASHCARDS.filter((c) => cardIds.includes(c.id));
    return FLASHCARDS;
  }, [cardIds]);

  // Build due queue on mount / when sm2Map changes
  useEffect(() => {
    const now = Date.now();

    // Priority: new (no record or interval=0) > overdue > skip mastered future
    type Scored = { card: FlashcardItem; priority: number };
    const scored: Scored[] = [];

    for (const card of pool) {
      const rec = sm2Map[card.id] ?? defaultSM2();
      if (rec.interval === 0) {
        // New / reset card — always include, top priority
        scored.push({ card, priority: 0 });
      } else if (rec.nextReview <= now) {
        // Due
        const overdueDays = (now - rec.nextReview) / DAY_MS;
        scored.push({ card, priority: 1 + 1 / (1 + overdueDays) }); // lower = more overdue
      }
      // Skip cards with interval > 30 whose nextReview is in the future
    }

    scored.sort((a, b) => a.priority - b.priority);
    const due = scored.map((s) => s.card);
    setDueQueue(due);
    setSessionTotal(due.length);
    setSessionDone(0);
    setQueueIndex(0);
    setFlipped(false);
    setLastRatedInterval(null);
    setPhase(due.length === 0 ? "done" : "studying");
    setInitialized(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool]);

  const currentCard = dueQueue[queueIndex] ?? null;

  const newCount = useMemo(
    () => pool.filter((c) => !sm2Map[c.id] || sm2Map[c.id].interval === 0).length,
    [pool, sm2Map],
  );

  const rate = useCallback(
    (rating: Rating) => {
      if (!currentCard) return;

      // Compute next interval for display
      const rec = sm2Map[currentCard.id] ?? defaultSM2();
      const updated = sm2Update(rec, rating);
      setLastRatedInterval(updated.interval);

      rateSM2(currentCard.id, rating);

      // If "Again", push card to end of queue so it repeats
      if (rating < 3) {
        setDueQueue((prev) => {
          const next = [...prev];
          next.push(currentCard);
          return next;
        });
      }

      setSessionDone((d) => d + 1);
      const nextIdx = queueIndex + 1;
      if (rating >= 3 && nextIdx >= dueQueue.length) {
        setPhase("done");
      }
      setQueueIndex(nextIdx);
      setFlipped(false);
    },
    [currentCard, dueQueue.length, queueIndex, sm2Map, rateSM2],
  );

  // ─── DONE PHASE ───────────────────────────────────────────────────

  if (phase === "done" || (initialized && dueQueue.length === 0)) {
    const reviewedCount = pool.filter((c) => sm2Map[c.id] && sm2Map[c.id].interval > 0).length;
    const nextReviewTimes = pool
      .map((c) => sm2Map[c.id]?.nextReview ?? 0)
      .filter((t) => t > Date.now())
      .sort((a, b) => a - b);
    const nextDueMs = nextReviewTimes[0];
    const nextDueHours = nextDueMs
      ? Math.ceil((nextDueMs - Date.now()) / 3600000)
      : null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[360px] gap-6 py-10"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10">
          <CheckCircle className="h-7 w-7 text-green-500" />
        </div>

        <div className="text-center space-y-1.5">
          <h3 className="text-xl font-bold">All caught up</h3>
          <p className="text-sm text-muted-foreground">
            {deckName ? `No cards due in "${deckName}".` : "No cards due for review right now."}
          </p>
          {nextDueHours !== null && (
            <p className="text-xs text-muted-foreground">
              Next review in {nextDueHours < 24 ? `${nextDueHours}h` : `${Math.ceil(nextDueHours / 24)}d`}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 text-center text-xs text-muted-foreground">
          <div className="rounded-lg border bg-card px-4 py-3 space-y-0.5">
            <p className="font-mono text-lg font-bold text-foreground">{pool.length}</p>
            <p>Total Cards</p>
          </div>
          <div className="rounded-lg border bg-card px-4 py-3 space-y-0.5">
            <p className="font-mono text-lg font-bold text-foreground">{reviewedCount}</p>
            <p>Reviewed</p>
          </div>
          <div className="rounded-lg border bg-card px-4 py-3 space-y-0.5">
            <p className="font-mono text-lg font-bold text-foreground">{newCount}</p>
            <p>New</p>
          </div>
        </div>

        {onExit && (
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to decks
          </button>
        )}
      </motion.div>
    );
  }

  if (!initialized || !currentCard) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-sm text-muted-foreground">Loading flashcards...</p>
      </div>
    );
  }

  // ─── STUDYING PHASE ───────────────────────────────────────────────

  const completedToday = Math.min(sessionDone, sessionTotal);
  const progressPct = sessionTotal > 0 ? (completedToday / sessionTotal) * 100 : 0;
  const dueToday = dueQueue.length;

  const currentRec = sm2Map[currentCard.id] ?? defaultSM2();
  const isNewCard = currentRec.interval === 0;

  return (
    <div className="space-y-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onExit ? (
            <button
              type="button"
              onClick={onExit}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{deckName ?? "All cards"}</span>
            </button>
          ) : (
            <>
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Adaptive Review</span>
            </>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          Due: <span className="font-semibold text-foreground">{dueToday}</span> cards
        </span>
      </div>

      {/* Due / New badge row */}
      <div className="flex items-center gap-2 text-[10px]">
        <span className="rounded-full border border-border bg-muted/30 px-2 py-0.5 text-muted-foreground">
          {newCount} new
        </span>
        {isNewCard && (
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-primary">
            New card
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{completedToday} completed</span>
          <span>{sessionTotal - completedToday} remaining</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard.id + queueIndex}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.18 }}
        >
          <FlashcardFace
            card={currentCard}
            flipped={flipped}
            onFlip={() => setFlipped(true)}
          />
        </motion.div>
      </AnimatePresence>

      {/* Next review label (shown after rating) */}
      <AnimatePresence>
        {lastRatedInterval !== null && !flipped && (
          <motion.p
            key="next-review"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-[10px] text-muted-foreground"
          >
            Next review: <span className="text-foreground font-medium">{nextReviewLabel(lastRatedInterval)}</span>
          </motion.p>
        )}
      </AnimatePresence>

      {/* Rating buttons — only shown after flip */}
      <AnimatePresence>
        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            <p className="text-center text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              How well did you remember?
            </p>
            <div className="grid grid-cols-4 gap-2">
              {RATINGS.map(({ label, rating, description, className }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => rate(rating)}
                  className={cn(
                    "flex flex-col items-center rounded-lg border px-2 py-2.5 text-center transition-colors",
                    className,
                  )}
                >
                  <span className="text-xs font-semibold">{label}</span>
                  <span className="text-[9px] text-current opacity-70 mt-0.5">{description}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!flipped && (
        <p className="text-center text-[10px] text-muted-foreground">
          Click the card to reveal the answer, then rate your recall
        </p>
      )}

      {/* SM-2 info footer */}
      <div className="rounded-lg border bg-muted/20 px-3 py-2 text-[10px] text-muted-foreground">
        <span className="font-medium text-foreground">Spaced Repetition (SM-2)</span>
        {" "}— Cards are scheduled based on how well you remember them.
        Rating "Easy" shows cards less often; "Again" brings them back sooner.
      </div>
    </div>
  );
}
