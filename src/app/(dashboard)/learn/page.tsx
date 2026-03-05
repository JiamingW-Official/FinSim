"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, BookOpen, Flame, Star, Brain, TrendingUp, Check, Zap } from "lucide-react";
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
  { emoji: "🧠", text: "Diversification reduces risk — don't put all your eggs in one basket!" },
  { emoji: "📈", text: "Buy low, sell high sounds simple — but patience is the real skill." },
  { emoji: "💡", text: "A stop-loss is your safety net. Always have an exit plan before you enter a trade." },
  { emoji: "🎯", text: "Focus on the process, not the profits. Good habits lead to great results." },
  { emoji: "📊", text: "Volume confirms trends — high volume means strong conviction behind the move." },
  { emoji: "🛡️", text: "Never risk more than 2% of your portfolio on a single trade. Protect the capital first!" },
  { emoji: "⏳", text: "Time in the market beats timing the market. Consistency compounds beautifully." },
  { emoji: "🔍", text: "Always do your research before investing. Know what you own and why." },
  { emoji: "🚀", text: "Your best trade is staying disciplined when emotions are screaming the loudest." },
  { emoji: "💎", text: "Successful traders focus on risk management first, profit second." },
  { emoji: "🌊", text: "Markets move in trends. Trade with the trend, not against it." },
  { emoji: "🔥", text: "Losses are tuition. Every great trader has learned more from losing than winning." },
  { emoji: "⭐", text: "The best setup is one you fully understand — avoid trading what you don't know." },
  { emoji: "🎓", text: "Learning one new concept a day compounds into mastery over time. Keep showing up!" },
  { emoji: "🐢", text: "Slow and steady wins the race. -5% today is recoverable. Blowing up is not." },
  { emoji: "📉", text: "Red days are part of the game. Even Warren Buffett's portfolio goes down sometimes!" },
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

  // suppress unused variable warning — level is used for potential future UI
  void level;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2.5">
          <motion.div
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20"
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.4 } }}
          >
            <GraduationCap className="h-4 w-4 text-amber-400" />
          </motion.div>
          <div>
            <h1 className="text-sm font-black">Trading Academy</h1>
            <p className="text-[9px] text-muted-foreground">Level up your skills, one lesson at a time</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {learningStreak > 0 && (
            <motion.div
              className="flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              whileHover={{ scale: 1.08 }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2, type: "tween" }}
              >
                <Flame className="h-3.5 w-3.5 text-amber-500" />
              </motion.div>
              <span className="text-[11px] font-black text-amber-500">{learningStreak}</span>
            </motion.div>
          )}
          <DailyGoal compact />
          <HeartsDisplay compact />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-md">

          {/* Welcome card */}
          <motion.div
            className="glass mb-4 flex items-center gap-3 rounded-xl border border-border/60 p-4"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <motion.div
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shrink-0"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <BookOpen className="h-5 w-5 text-primary" />
            </motion.div>
            <div className="flex-1">
              <h2 className="text-sm font-black">Your Learning Path 🗺️</h2>
              <p className="text-[10px] text-muted-foreground">
                Complete lessons to unlock new units. Earn stars for mastery!
              </p>
            </div>
            <DailyGoal />
          </motion.div>

          {/* Streak celebration */}
          {learningStreak >= 3 && (
            <motion.div
              className="mb-4 flex items-center justify-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/8 py-2.5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.5 }}
              >
                <Star className="h-4 w-4 text-amber-400" />
              </motion.div>
              <span className="text-[11px] font-bold text-amber-400">
                🔥 {learningStreak} day streak — you&apos;re on a roll!
              </span>
            </motion.div>
          )}

          {/* Motivational tip */}
          <motion.div
            className="mb-5 flex items-start gap-3 rounded-xl border border-primary/12 bg-primary/5 px-4 py-3"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 }}
          >
            <motion.span
              className="text-xl mt-0.5 shrink-0"
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
            >
              {tip.emoji}
            </motion.span>
            <p className="text-[11px] text-primary/80 leading-relaxed font-medium">{tip.text}</p>
          </motion.div>

          {/* Mini-game cards */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            {/* Flashcards */}
            <motion.button
              type="button"
              onClick={() => setActiveGame("flashcards")}
              className="group flex flex-col items-start gap-2 rounded-xl border border-purple-500/25 bg-purple-500/5 p-3.5 text-left transition-all hover:bg-purple-500/10 hover:border-purple-500/40 hover:shadow-[0_0_16px_rgba(168,85,247,0.12)]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ delay: 0.22 }}
            >
              <div className="flex items-center gap-2 w-full">
                <motion.div
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15 border border-purple-500/25"
                  whileHover={{ rotate: [-5, 5, 0] }}
                >
                  <Brain className="h-4 w-4 text-purple-400" />
                </motion.div>
                <span className="text-xs font-black text-purple-300">Flashcards</span>
              </div>
              <div className="flex items-center gap-2 w-full">
                <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-purple-400 transition-all"
                    style={{ width: `${Math.min((flashcardToday / 10) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-[9px] font-bold tabular-nums text-muted-foreground">
                  {flashcardToday}/10
                </span>
                {flashcardToday >= 10 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <Check className="h-3 w-3 text-emerald-400" />
                  </motion.div>
                )}
              </div>
              <span className="text-[9px] text-muted-foreground">
                {overallMastery}% mastery · tap to review ✨
              </span>
            </motion.button>

            {/* Prediction */}
            <motion.button
              type="button"
              onClick={() => setActiveGame("prediction")}
              className="group flex flex-col items-start gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3.5 text-left transition-all hover:bg-emerald-500/10 hover:border-emerald-500/40 hover:shadow-[0_0_16px_rgba(16,185,129,0.12)]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ delay: 0.28 }}
            >
              <div className="flex items-center gap-2 w-full">
                <motion.div
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/25"
                  whileHover={{ scale: 1.1 }}
                >
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                </motion.div>
                <span className="text-xs font-black text-emerald-300">Prediction</span>
              </div>
              <div className="flex items-center gap-2 w-full">
                {predictionStreak > 0 && (
                  <div className="flex items-center gap-1">
                    <Flame className="h-3 w-3 text-amber-400" />
                    <span className="text-[9px] font-black text-amber-400">{predictionStreak}</span>
                  </div>
                )}
                <span className="text-[9px] text-muted-foreground flex-1">
                  {predictionAccuracy > 0 ? `${predictionAccuracy}% accuracy` : "Predict next candle 🕯️"}
                </span>
              </div>
              <span className="text-[9px] text-muted-foreground">
                {predictionToday > 0 ? `${predictionToday} played today · tap for more` : "Tap to start playing ▶"}
              </span>
            </motion.button>
          </div>

          {/* Quick stats row */}
          <motion.div
            className="mb-5 flex items-center gap-2 rounded-xl border border-border/40 bg-card/50 px-3 py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-[10px] text-muted-foreground">
              Complete lessons to earn XP, unlock achievements, and climb the leaderboard! 🏆
            </span>
          </motion.div>

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
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setActiveGame(null)}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 20 }}
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
