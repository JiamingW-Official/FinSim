"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Clock, TrendingUp, TrendingDown, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMiniSimulator } from "@/components/learn/practice/useMiniSimulator";
import { MiniChart } from "@/components/learn/practice/MiniChart";
import { MiniTradePanel } from "@/components/learn/practice/MiniTradePanel";
import { ObjectiveTracker } from "@/components/learn/practice/ObjectiveTracker";
import { ChallengeBriefing } from "./ChallengeBriefing";
import { ChallengeResults } from "./ChallengeResults";
import { useChallengeStore } from "@/stores/challenge-store";
import { computeScenarioGrade } from "@/types/challenges";
import type { PracticeChallenge } from "@/data/lessons/types";
import type { ScenarioGrade } from "@/types/challenges";

type ChallengeMode = "daily" | "scenario";
type Phase = "briefing" | "playing" | "results";

interface ChallengePlayerProps {
  mode: ChallengeMode;
  id: string;
  name: string;
  description: string;
  difficulty: string | number;
  xpReward: number;
  challenge: PracticeChallenge;
  gradingThresholds?: { S: number; A: number; B: number };
  onClose: () => void;
}

function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function ChallengePlayer({
  mode,
  id,
  name,
  description,
  difficulty,
  xpReward,
  challenge,
  gradingThresholds,
  onClose,
}: ChallengePlayerProps) {
  const [phase, setPhase] = useState<Phase>("briefing");
  const startTimeRef = useRef(0);
  const [elapsed, setElapsed] = useState(0);

  // Results state
  const [resultGrade, setResultGrade] = useState<ScenarioGrade>("C");
  const [resultPnl, setResultPnl] = useState(0);
  const [resultPnlPercent, setResultPnlPercent] = useState(0);
  const [resultObjectives, setResultObjectives] = useState(0);
  const [resultTime, setResultTime] = useState(0);
  const [resultXP, setResultXP] = useState(0);

  const completeDailyChallenge = useChallengeStore((s) => s.completeDailyChallenge);
  const startDailyChallenge = useChallengeStore((s) => s.startDailyChallenge);
  const completeScenario = useChallengeStore((s) => s.completeScenario);

  const sim = useMiniSimulator(challenge);

  // Live timer
  useEffect(() => {
    if (phase !== "playing") return;
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTimeRef.current);
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const totalPnl = sim.realizedPnL + sim.unrealizedPnL;
  const startingCash = challenge.startingCash ?? 10000;
  const pnlPercent = startingCash > 0 ? (totalPnl / startingCash) * 100 : 0;
  const completedCount = sim.completedObjectives.filter(Boolean).length;
  const barsExhausted = sim.revealedCount >= sim.totalBars;
  const canFinish = sim.allComplete || barsExhausted;

  const handleStart = useCallback(() => {
    startTimeRef.current = Date.now();
    if (mode === "daily") {
      startDailyChallenge(id, challenge.objectives.length);
    }
    setPhase("playing");
  }, [mode, id, challenge.objectives.length, startDailyChallenge]);

  const handleComplete = useCallback(() => {
    const timeTaken = Date.now() - startTimeRef.current;
    const pnlPct = (totalPnl / startingCash) * 100;

    // Compute grade
    let grade: ScenarioGrade = "C";
    if (mode === "scenario" && gradingThresholds) {
      grade = computeScenarioGrade(pnlPct, gradingThresholds);
    } else {
      if (pnlPct >= 3) grade = "S";
      else if (pnlPct >= 1.5) grade = "A";
      else if (pnlPct >= 0) grade = "B";
      else grade = "C";
    }

    // XP with grade multiplier
    const gradeMultiplier = grade === "S" ? 1.5 : grade === "A" ? 1.2 : 1;
    const adjustedXP = Math.round(xpReward * gradeMultiplier);

    // Save to store
    if (mode === "daily") {
      completeDailyChallenge(id, totalPnl, adjustedXP);
    } else {
      completeScenario({
        scenarioId: id,
        grade,
        pnl: totalPnl,
        pnlPercent: pnlPct,
        objectivesCompleted: completedCount,
        objectivesTotal: challenge.objectives.length,
        timeTakenMs: timeTaken,
        xpEarned: adjustedXP,
        completedAt: Date.now(),
      });
    }

    setResultGrade(grade);
    setResultPnl(totalPnl);
    setResultPnlPercent(pnlPct);
    setResultObjectives(completedCount);
    setResultTime(timeTaken);
    setResultXP(adjustedXP);
    setPhase("results");
  }, [totalPnl, startingCash, sim, challenge, mode, id, xpReward, gradingThresholds, completeDailyChallenge, completeScenario, completedCount]);

  if (phase === "briefing") {
    return (
      <div className="flex h-full flex-col bg-background">
        <div className="flex items-center border-b border-border px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/30"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-1 items-center justify-center overflow-y-auto">
          <ChallengeBriefing
            name={name}
            description={description}
            difficulty={difficulty}
            xpReward={xpReward}
            objectives={challenge.objectives}
            onStart={handleStart}
          />
        </div>
      </div>
    );
  }

  if (phase === "playing") {
    return (
      <div className="flex h-full flex-col bg-background">
        {/* ===== ENHANCED TOP BAR with live stats ===== */}
        <div className="border-b border-border px-4 py-2.5">
          {/* Row 1: Close + Name */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              title="Close challenge"
              className="rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/30"
            >
              <X className="h-5 w-5" />
            </button>
            <span className="text-sm font-bold truncate flex-1">{name}</span>

            {/* Mode badge */}
            <span className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-bold",
              mode === "scenario"
                ? "bg-amber-500/10 text-amber-400"
                : "bg-primary/10 text-primary",
            )}>
              {mode === "scenario" ? "Scenario" : "Daily"}
            </span>
          </div>

          {/* Row 2: Live stats strip */}
          <div className="flex items-center gap-3 mt-2">
            {/* Timer */}
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span className="tabular-nums font-medium">{formatElapsed(elapsed)}</span>
            </div>

            {/* Live P&L */}
            <motion.div
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold",
                totalPnl > 0
                  ? "bg-emerald-500/5 text-emerald-400"
                  : totalPnl < 0
                    ? "bg-red-500/5 text-red-400"
                    : "bg-muted/30 text-muted-foreground",
              )}
            >
              {totalPnl > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : totalPnl < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : null}
              <span className="tabular-nums">
                {totalPnl >= 0 ? "+" : ""}{totalPnl.toFixed(2)}
              </span>
              <span className="text-[11px] opacity-70">
                ({pnlPercent >= 0 ? "+" : ""}{pnlPercent.toFixed(1)}%)
              </span>
            </motion.div>

            <div className="flex-1" />

            {/* Objectives count */}
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Target className="h-3 w-3" />
              <span className="tabular-nums font-medium">
                {completedCount}/{challenge.objectives.length}
              </span>
            </div>
          </div>

          {/* Objective progress bar */}
          <div className="flex items-center gap-1 mt-2">
            {challenge.objectives.map((_, i) => (
              <motion.div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors duration-300",
                  sim.completedObjectives[i] ? "bg-primary" : "bg-muted/50",
                )}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: i * 0.05 }}
              />
            ))}
          </div>
        </div>

        {/* Simulator */}
        <div className="flex flex-1 items-start justify-center overflow-y-auto px-4 py-4">
          <div className="w-full max-w-lg flex flex-col gap-3">
            <MiniChart
              bars={challenge.priceData}
              revealedCount={sim.revealedCount}
              trades={sim.trades}
              activeIndicators={sim.activeIndicators}
              currentPrice={sim.currentPrice}
              maxVisibleBars={60}
            />

            <MiniTradePanel
              actionType="buy"
              currentPrice={sim.currentPrice}
              cash={sim.cash}
              position={sim.position}
              unrealizedPnL={sim.unrealizedPnL}
              revealedCount={sim.revealedCount}
              totalBars={sim.totalBars}
              isPlaying={sim.isPlaying}
              activeIndicators={sim.activeIndicators}
              allComplete={sim.allComplete}
              availableIndicators={challenge.availableIndicators}
              onBuy={sim.buy}
              onSell={sim.sell}
              onAdvance={sim.advance}
              onPlay={sim.play}
              onPause={sim.pause}
              onToggleIndicator={sim.toggleIndicator}
            />

            {/* Hint with engaging styling */}
            {challenge.hint && !sim.allComplete && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-2 rounded-lg border border-border bg-primary/5 px-3 py-2"
              >
                <span className="text-primary text-sm mt-0.5">💡</span>
                <p className="text-[11px] text-muted-foreground">{challenge.hint}</p>
              </motion.div>
            )}

            <ObjectiveTracker
              objectives={challenge.objectives}
              completedObjectives={sim.completedObjectives}
              allComplete={sim.allComplete}
              barsExhausted={barsExhausted}
              onContinue={handleComplete}
            />
          </div>
        </div>
      </div>
    );
  }

  // Results phase
  return (
    <AnimatePresence>
      <ChallengeResults
        grade={resultGrade}
        pnl={resultPnl}
        pnlPercent={resultPnlPercent}
        objectivesCompleted={resultObjectives}
        objectivesTotal={challenge.objectives.length}
        timeTakenMs={resultTime}
        xpEarned={resultXP}
        onContinue={onClose}
      />
    </AnimatePresence>
  );
}
