"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, BookOpen, Flame, Sparkles, Star, Brain, TrendingUp, Check } from "lucide-react";
import { useLearnStore } from "@/stores/learn-store";
import { useGameStore } from "@/stores/game-store";
import { useFlashcardStore } from "@/stores/flashcard-store";
import { usePredictionStore } from "@/stores/prediction-store";
import { HeartsDisplay } from "@/components/learn/HeartsDisplay";
import { DailyGoal } from "@/components/learn/DailyGoal";
import { SkillPath } from "@/components/learn/SkillPath";
import { FlashcardGame } from "@/components/learn/FlashcardGame";
import { PredictionGame } from "@/components/learn/PredictionGame";

const MOTIVATIONAL_TIPS = [
  { emoji: "🧠", text: "Tip: Diversification reduces risk — don't put all your eggs in one basket!" },
  { emoji: "📈", text: "Tip: Buy low, sell high sounds simple — but patience is the real skill." },
  { emoji: "💡", text: "Tip: A stop-loss is your safety net. Always have an exit plan!" },
  { emoji: "🎯", text: "Tip: Focus on the process, not the profits. Good habits lead to good results." },
  { emoji: "📊", text: "Tip: Volume confirms trends — high volume = strong conviction." },
  { emoji: "🛡️", text: "Tip: Never risk more than 2% of your portfolio on a single trade." },
  { emoji: "⏳", text: "Tip: Time in the market beats timing the market." },
  { emoji: "🔍", text: "Tip: Always do your research before investing in any stock." },
];

export default function LearnPage() {
  const learningStreak = useLearnStore((s) => s.learningStreak);
  const level = useGameStore((s) => s.level);
  const flashcardDaily = useFlashcardStore((s) => s.dailyCardsReviewed);
  const flashcardLastDate = useFlashcardStore((s) => s.lastReviewDate);
  const overallMastery = useFlashcardStore((s) => s.getOverallMastery());
  const predictionStreak = usePredictionStore((s) => s.currentStreak);
  const predictionAccuracy = usePredictionStore((s) => s.getAccuracy());
  const predictionDaily = usePredictionStore((s) => s.dailyPlayed);
  const predictionLastDate = usePredictionStore((s) => s.lastPlayDate);

  const [activeGame, setActiveGame] = useState<"flashcards" | "prediction" | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const flashcardToday = flashcardLastDate === todayStr ? flashcardDaily : 0;
  const predictionToday = predictionLastDate === todayStr ? predictionDaily : 0;

  const tip = useMemo(() => {
    const idx = Math.floor(Date.now() / (1000 * 60 * 30)) % MOTIVATIONAL_TIPS.length;
    return MOTIVATIONAL_TIPS[idx];
  }, []);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header — enhanced */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2.5">
          <motion.div
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10"
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <GraduationCap className="h-4.5 w-4.5 text-amber-400" />
          </motion.div>
          <div>
            <h1 className="text-sm font-black">Trading Academy</h1>
            <p className="text-[9px] text-muted-foreground">Level up your trading skills</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Learning streak */}
          {learningStreak > 0 && (
            <motion.div
              className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-[11px] font-black text-amber-500">{learningStreak}</span>
            </motion.div>
          )}
          <DailyGoal compact />
          <HeartsDisplay compact />
        </div>
      </div>

      {/* Skill path content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-md">
          {/* Welcome card — enhanced */}
          <motion.div
            className="glass mb-4 flex items-center gap-3 rounded-xl border border-border p-4"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <motion.div
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 shrink-0"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <BookOpen className="h-5 w-5 text-primary" />
            </motion.div>
            <div className="flex-1">
              <h2 className="text-sm font-black">Your Learning Path</h2>
              <p className="text-[10px] text-muted-foreground">
                Complete lessons to unlock new units. Master quizzes for more stars!
              </p>
            </div>
            <DailyGoal />
          </motion.div>

          {/* Motivational tip card */}
          <motion.div
            className="mb-6 flex items-start gap-2.5 rounded-xl border border-primary/15 bg-primary/5 px-3.5 py-2.5"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <span className="text-sm mt-0.5">{tip.emoji}</span>
            <p className="text-[11px] text-primary/80 leading-relaxed font-medium">{tip.text}</p>
          </motion.div>

          {/* Streak celebration */}
          {learningStreak >= 3 && (
            <motion.div
              className="mb-4 flex items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 py-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
              >
                <Star className="h-4 w-4 text-amber-400" />
              </motion.div>
              <span className="text-[11px] font-bold text-amber-400">
                {learningStreak} day streak! Keep it up!
              </span>
              <Sparkles className="h-3.5 w-3.5 text-amber-400/50" />
            </motion.div>
          )}

          {/* Mini-game cards */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            {/* Flashcards card */}
            <motion.button
              type="button"
              onClick={() => setActiveGame("flashcards")}
              className="flex flex-col items-start gap-2 rounded-xl border border-purple-500/20 bg-purple-500/5 p-3.5 text-left transition-all hover:bg-purple-500/10 hover:border-purple-500/30 active:scale-[0.98]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <div className="flex items-center gap-2 w-full">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15">
                  <Brain className="h-4 w-4 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-black text-purple-300">Flashcards</span>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full">
                <div className="flex-1 h-1 rounded-full bg-muted/30 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-purple-400 transition-all"
                    style={{ width: `${Math.min((flashcardToday / 10) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-[9px] font-bold tabular-nums text-muted-foreground">
                  {flashcardToday}/10
                </span>
                {flashcardToday >= 10 && <Check className="h-3 w-3 text-emerald-400" />}
              </div>
              <span className="text-[9px] text-muted-foreground">
                {overallMastery}% mastery
              </span>
            </motion.button>

            {/* Prediction card */}
            <motion.button
              type="button"
              onClick={() => setActiveGame("prediction")}
              className="flex flex-col items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-left transition-all hover:bg-emerald-500/10 hover:border-emerald-500/30 active:scale-[0.98]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 w-full">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-black text-emerald-300">Prediction</span>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full">
                {predictionStreak > 0 && (
                  <div className="flex items-center gap-1">
                    <Flame className="h-3 w-3 text-amber-400" />
                    <span className="text-[9px] font-black text-amber-400">{predictionStreak}</span>
                  </div>
                )}
                <span className="text-[9px] text-muted-foreground flex-1">
                  {predictionAccuracy > 0 ? `${predictionAccuracy}% accuracy` : "Predict candles"}
                </span>
              </div>
              <span className="text-[9px] text-muted-foreground">
                {predictionToday} played today
              </span>
            </motion.button>
          </div>

          {/* Skill tree */}
          <SkillPath />
        </div>
      </div>

      {/* Game overlays */}
      <AnimatePresence>
        {activeGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setActiveGame(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {activeGame === "flashcards" ? (
                <FlashcardGame onClose={() => setActiveGame(null)} />
              ) : (
                <PredictionGame onClose={() => setActiveGame(null)} />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
