"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Brain, RotateCcw, Check, X, Flame, Trophy, ChevronRight, Sparkles,
} from "lucide-react";
import { useFlashcardStore } from "@/stores/flashcard-store";
import { CATEGORY_LABELS, type FlashcardItem } from "@/data/flashcards";
import { soundEngine } from "@/services/audio/sound-engine";

const DAILY_GOAL = 10;

interface FlashcardGameProps {
  onClose: () => void;
}

type Phase = "playing" | "summary";

export function FlashcardGame({ onClose }: FlashcardGameProps) {
  const getDueCards = useFlashcardStore((s) => s.getDueCards);
  const reviewCard = useFlashcardStore((s) => s.reviewCard);
  const dailyCardsReviewed = useFlashcardStore((s) => s.dailyCardsReviewed);
  const lastReviewDate = useFlashcardStore((s) => s.lastReviewDate);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayReviewed = lastReviewDate === todayStr ? dailyCardsReviewed : 0;

  const cards = useMemo(() => getDueCards(DAILY_GOAL), [getDueCards]);

  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);
  const [phase, setPhase] = useState<Phase>("playing");
  const answerTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Cleanup answer animation timer on unmount
  useEffect(() => {
    return () => {
      if (answerTimerRef.current) clearTimeout(answerTimerRef.current);
    };
  }, []);

  const [slideDir, setSlideDir]  = useState<"left" | "right">("right");

  const currentCard = cards[cardIndex] as FlashcardItem | undefined;

  const handleFlip = useCallback(() => {
    if (!flipped) {
      setFlipped(true);
      soundEngine.playClick();
    }
  }, [flipped]);

  const handleAnswer = useCallback(
    (correct: boolean) => {
      if (!currentCard) return;

      const xp = reviewCard(currentCard.id, correct);
      setSessionXP((prev) => prev + xp);
      setSessionTotal((prev) => prev + 1);

      if (correct) {
        setSessionCorrect((prev) => prev + 1);
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak > bestStreak) setBestStreak(newStreak);
        soundEngine.playCorrect();
        if (newStreak > 0 && newStreak % 5 === 0) {
          soundEngine.playCombo(newStreak);
        }
      } else {
        setStreak(0);
        soundEngine.playWrong();
      }

      setSlideDir(correct ? "right" : "left");

      // Next card or summary
      answerTimerRef.current = setTimeout(() => {
        setFlipped(false);
        if (cardIndex + 1 >= cards.length) {
          setPhase("summary");
          soundEngine.playLessonComplete();
        } else {
          setCardIndex((prev) => prev + 1);
        }
      }, 300);
    },
    [currentCard, reviewCard, streak, bestStreak, cardIndex, cards.length],
  );

  if (phase === "summary") {
    const accuracy = sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0;
    return (
      <motion.div
        className="flex flex-col items-center gap-5 p-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <motion.div
          className="flex h-16 w-16 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/30"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
        >
          <Trophy className="h-8 w-8 text-amber-400" />
        </motion.div>

        <div className="text-center">
          <h3 className="text-lg font-black">Session Complete!</h3>
          <p className="text-[11px] text-muted-foreground mt-1">Great practice session</p>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
          <StatBox label="Reviewed" value={`${sessionTotal}`} color="text-blue-400" />
          <StatBox label="Accuracy" value={`${accuracy}%`} color={accuracy >= 80 ? "text-green-400" : "text-amber-400"} />
          <StatBox label="XP Earned" value={`+${sessionXP}`} color="text-purple-400" />
        </div>

        {bestStreak >= 3 && (
          <motion.div
            className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Flame className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-400">Best streak: {bestStreak}</span>
          </motion.div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-primary/90 active:scale-95"
        >
          Done
        </button>
      </motion.div>
    );
  }

  if (!currentCard) {
    return (
      <div className="flex flex-col items-center gap-3 p-6">
        <Sparkles className="h-8 w-8 text-amber-400" />
        <p className="text-sm font-bold">No cards available</p>
        <button type="button" onClick={onClose} className="text-xs text-primary hover:underline">
          Go back
        </button>
      </div>
    );
  }

  const cat = CATEGORY_LABELS[currentCard.category];
  const progress = ((cardIndex + 1) / cards.length) * 100;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-black">Flashcards</span>
        </div>
        <div className="flex items-center gap-3">
          {streak > 0 && (
            <motion.div
              className="flex items-center gap-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              key={streak}
            >
              <Flame className="h-3.5 w-3.5 text-amber-400 streak-fire" />
              <span className="text-xs font-black tabular-nums text-amber-400">{streak}</span>
            </motion.div>
          )}
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-accent/30">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-purple-400"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-[10px] font-bold tabular-nums text-muted-foreground">
          {cardIndex + 1}/{cards.length}
        </span>
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard.id}
          initial={{ opacity: 0, x: slideDir === "right" ? 60 : -60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: slideDir === "right" ? -60 : 60 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="perspective-1000"
        >
          <div
            className={cn("card-flip-container cursor-pointer", flipped && "flipped")}
            onClick={handleFlip}
          >
            {/* Front */}
            <div className="card-flip-front rounded-lg border border-border bg-card p-6 min-h-[220px] flex flex-col items-center justify-center gap-3">
              {cat && (
                <span className={cn("text-[9px] font-bold uppercase tracking-widest", cat.color)}>
                  {cat.label}
                </span>
              )}
              <p className="text-center text-lg font-black whitespace-pre-line">
                {currentCard.front}
              </p>
              {!flipped && (
                <motion.div
                  className="flex items-center gap-1 mt-2"
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, type: "tween" }}
                >
                  <RotateCcw className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Tap to reveal</span>
                </motion.div>
              )}
            </div>

            {/* Back */}
            <div className="card-flip-back rounded-lg border border-primary/20 bg-card p-6 min-h-[220px] flex flex-col justify-center gap-3">
              {cat && (
                <span className={cn("text-[9px] font-bold uppercase tracking-widest", cat.color)}>
                  {cat.label}
                </span>
              )}
              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                {currentCard.back}
              </p>
              {currentCard.hint && (
                <p className="text-[10px] text-muted-foreground italic mt-1">
                  💡 {currentCard.hint}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Answer buttons — only visible when flipped */}
      <AnimatePresence>
        {flipped && (
          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <button
              type="button"
              onClick={() => handleAnswer(false)}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 py-3 text-sm font-bold text-rose-400 transition-all hover:bg-rose-500/20 active:scale-95"
            >
              <RotateCcw className="h-4 w-4" />
              Still Learning
            </button>
            <button
              type="button"
              onClick={() => handleAnswer(true)}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 py-3 text-sm font-bold text-green-400 transition-all hover:bg-green-500/20 active:scale-95"
            >
              <Check className="h-4 w-4" />
              Got It
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily progress */}
      <div className="flex items-center justify-center gap-2 mt-1">
        <span className="text-[10px] text-muted-foreground">
          Today: {todayReviewed + sessionTotal} / {DAILY_GOAL} cards
        </span>
        {todayReviewed + sessionTotal >= DAILY_GOAL && (
          <Check className="h-3 w-3 text-green-400" />
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-0.5 rounded-lg bg-muted/15 px-3 py-2.5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <span className={cn("text-lg font-black tabular-nums", color)}>{value}</span>
      <span className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground/60">
        {label}
      </span>
    </motion.div>
  );
}
