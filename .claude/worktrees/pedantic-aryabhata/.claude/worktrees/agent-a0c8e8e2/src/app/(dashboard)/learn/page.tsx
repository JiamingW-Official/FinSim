"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, BookOpen, Flame, Brain, TrendingUp, Check, Calculator, History } from "lucide-react";
import { useLearnStore } from "@/stores/learn-store";
import { useGameStore } from "@/stores/game-store";
import { useFlashcardStore } from "@/stores/flashcard-store";
import { usePredictionStore } from "@/stores/prediction-store";
import { HeartsDisplay } from "@/components/learn/HeartsDisplay";
import { DailyGoal } from "@/components/learn/DailyGoal";
import { SkillPath } from "@/components/learn/SkillPath";
import { FlashcardGame } from "@/components/learn/FlashcardGame";
import { PredictionGame } from "@/components/learn/PredictionGame";
import { ScenarioSimulator } from "@/components/learn/ScenarioSimulator";
import { CompoundCalculator } from "@/components/learn/CompoundCalculator";

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
  const [activeTool, setActiveTool] = useState<"scenario" | "calculator" | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const flashcardToday = flashcardLastDate === todayStr ? flashcardDaily : 0;
  const predictionToday = predictionLastDate === todayStr ? predictionDaily : 0;

  // suppress unused variable warning — level is used for potential future UI
  void level;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 bg-card px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
            <GraduationCap className="h-4 w-4 text-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Trading Academy</h1>
            <p className="text-muted-foreground text-xs">Interactive lessons and practice tools</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {learningStreak > 0 && (
            <div className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-[11px] font-bold text-amber-500">{learningStreak}</span>
            </div>
          )}
          <DailyGoal compact />
          <HeartsDisplay compact />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-md">

          {/* Learning path header — compact */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium">Your Learning Path</h2>
            </div>
            <DailyGoal />
          </div>

          {/* Streak celebration — compact */}
          {learningStreak >= 3 && (
            <div className="mb-4 flex items-center justify-center gap-2 rounded-lg border border-border/50 bg-muted/30 py-2">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[11px] font-medium text-muted-foreground">
                {learningStreak} day streak
              </span>
            </div>
          )}

          {/* Mini-game cards — clean, no colored borders or shadows */}
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Flashcards */}
            <button
              type="button"
              onClick={() => setActiveGame("flashcards")}
              className="group flex flex-col items-start gap-2 rounded-lg border border-border/50 bg-card p-3.5 text-left transition-colors hover:border-border hover:bg-accent/30"
            >
              <div className="flex items-center gap-2 w-full">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
                  <Brain className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <span className="text-xs font-semibold">Flashcards</span>
              </div>
              <div className="flex items-center gap-2 w-full">
                <div className="flex-1 h-1 rounded-full bg-muted/30 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-purple-400 transition-all"
                    style={{ width: `${Math.min((flashcardToday / 10) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-[9px] font-mono tabular-nums text-muted-foreground">
                  {flashcardToday}/10
                </span>
                {flashcardToday >= 10 && (
                  <Check className="h-3 w-3 text-green-400" />
                )}
              </div>
              <span className="text-[9px] font-mono tabular-nums text-muted-foreground">
                {overallMastery}% mastery
              </span>
            </button>

            {/* Prediction */}
            <button
              type="button"
              onClick={() => setActiveGame("prediction")}
              className="group flex flex-col items-start gap-2 rounded-lg border border-border/50 bg-card p-3.5 text-left transition-colors hover:border-border hover:bg-accent/30"
            >
              <div className="flex items-center gap-2 w-full">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
                  <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <span className="text-xs font-semibold">Prediction</span>
              </div>
              <div className="flex items-center gap-2 w-full">
                {predictionStreak > 0 && (
                  <div className="flex items-center gap-1">
                    <Flame className="h-3 w-3 text-amber-400" />
                    <span className="text-[9px] font-bold text-amber-400">{predictionStreak}</span>
                  </div>
                )}
                <span className="text-[9px] text-muted-foreground flex-1">
                  {predictionAccuracy > 0 ? `${predictionAccuracy}% accuracy` : "Predict next candle"}
                </span>
              </div>
              <span className="text-[9px] text-muted-foreground">
                {predictionToday > 0 ? `${predictionToday} played today` : "Start playing"}
              </span>
            </button>
          </div>

          {/* Spacer */}

          {/* Interactive Tools */}
          <div className="mb-6 space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
              Interactive Tools
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setActiveTool(activeTool === "scenario" ? null : "scenario")}
                className="group flex flex-col items-start gap-2 rounded-lg border border-border/50 bg-card p-3.5 text-left hover:bg-accent/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 w-full">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
                    <History className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-xs font-semibold">Scenarios</span>
                </div>
                <span className="text-[9px] text-muted-foreground">
                  Simulate 2008, COVID & dot-com crashes
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTool(activeTool === "calculator" ? null : "calculator")}
                className="group flex flex-col items-start gap-2 rounded-lg border border-border/50 bg-card p-3.5 text-left hover:bg-accent/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 w-full">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
                    <Calculator className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-xs font-semibold">Calculator</span>
                </div>
                <span className="text-[9px] text-muted-foreground">
                  Compound interest & wealth growth
                </span>
              </button>
            </div>

            <AnimatePresence>
              {activeTool && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-lg border border-border/50 bg-card/50 p-4">
                    {activeTool === "scenario" ? <ScenarioSimulator /> : <CompoundCalculator />}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Skill tree */}
          <SkillPath />
        </div>
      </div>

      {/* Game overlays — bottom sheet on mobile, centered modal on sm+ */}
      <AnimatePresence>
        {activeGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setActiveGame(null)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-h-[calc(100dvh-3.5rem)] sm:max-h-[90dvh] sm:max-w-md overflow-hidden rounded-t-2xl sm:rounded-lg border border-border bg-card shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1 overflow-y-auto">
                {activeGame === "flashcards" ? (
                  <FlashcardGame onClose={() => setActiveGame(null)} />
                ) : (
                  <PredictionGame onClose={() => setActiveGame(null)} />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
