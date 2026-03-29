"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, Flame, Trophy, X, Timer, ChevronRight, Sparkles,
} from "lucide-react";
import { usePredictionStore } from "@/stores/prediction-store";
import { generateRealisticBars } from "@/data/lessons/practice-data";
import { soundEngine } from "@/services/audio/sound-engine";

const ROUNDS = 10;
const VISIBLE_BARS = 18;
const COUNTDOWN_SECONDS = 5;

interface PredictionGameProps {
  onClose: () => void;
}

type Phase = "predict" | "reveal" | "summary";

export function PredictionGame({ onClose }: PredictionGameProps) {
  const recordPrediction = usePredictionStore((s) => s.recordPrediction);
  const currentStreak = usePredictionStore((s) => s.currentStreak);
  const bestStreak = usePredictionStore((s) => s.bestStreak);

  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>("predict");
  const [prediction, setPrediction] = useState<"green" | "red" | null>(null);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);

  // Generate all chart data upfront (seeded per session)
  const sessionSeed = useMemo(() => Math.floor(Date.now() / 60000), []);
  const allBars = useMemo(() => {
    return Array.from({ length: ROUNDS }, (_, i) => {
      const sp = 100 + Math.sin(i * 1.7) * 30;
      const driftDir = Math.sin(i * 2.3 + sessionSeed) > 0 ? 0.002 : -0.002;
      const bars = generateRealisticBars({
        count: VISIBLE_BARS + 1,
        startPrice: sp,
        seed: sessionSeed + i * 1337,
        drift: driftDir,
        volatility: 0.018,
        meanReversion: 0.04,
        target: sp + driftDir * 800,
        momentumBias: 0.55,
        support: [sp * 0.96],
        resistance: [sp * 1.06],
      });
      return bars;
    });
  }, [sessionSeed]);

  const currentBars = allBars[round];
  const visibleBars = currentBars?.slice(0, VISIBLE_BARS);
  const hiddenBar = currentBars?.[VISIBLE_BARS];
  const isGreen = hiddenBar ? hiddenBar.close >= hiddenBar.open : true;

  // Countdown timer
  useEffect(() => {
    if (phase !== "predict") return;
    if (countdown <= 0) {
      // Time's up — auto-select wrong
      handlePredict(isGreen ? "red" : "green");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, phase]);

  const handlePredict = useCallback(
    (guess: "green" | "red") => {
      if (phase !== "predict") return;
      setPrediction(guess);
      setPhase("reveal");

      const correct = (guess === "green") === isGreen;
      const xp = recordPrediction(correct);
      setResult(correct ? "correct" : "wrong");
      setSessionXP((prev) => prev + xp);
      if (correct) setSessionCorrect((prev) => prev + 1);

      if (correct) {
        soundEngine.playCorrect();
      } else {
        soundEngine.playWrong();
      }

      // Auto advance
      setTimeout(() => {
        if (round + 1 >= ROUNDS) {
          setPhase("summary");
          soundEngine.playLessonComplete();
        } else {
          setRound((r) => r + 1);
          setPhase("predict");
          setPrediction(null);
          setResult(null);
          setCountdown(COUNTDOWN_SECONDS);
        }
      }, 1500);
    },
    [phase, isGreen, recordPrediction, round],
  );

  // Summary screen
  if (phase === "summary") {
    const accuracy = ROUNDS > 0 ? Math.round((sessionCorrect / ROUNDS) * 100) : 0;
    return (
      <motion.div
        className="flex flex-col items-center gap-5 p-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.div
          className="flex h-16 w-16 items-center justify-center rounded-md bg-emerald-500/15 border border-emerald-500/30"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
        >
          <Trophy className="h-8 w-8 text-emerald-400" />
        </motion.div>

        <div className="text-center">
          <h3 className="text-lg font-bold">
            {accuracy >= 80 ? "Amazing!" : accuracy >= 60 ? "Nice job!" : "Keep Practicing!"}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-1">{ROUNDS} rounds completed</p>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
          <SummaryStatBox label="Correct" value={`${sessionCorrect}/${ROUNDS}`} color="text-emerald-400" />
          <SummaryStatBox label="Accuracy" value={`${accuracy}%`} color={accuracy >= 70 ? "text-emerald-400" : "text-amber-400"} />
          <SummaryStatBox label="XP Earned" value={`+${sessionXP}`} color="text-primary" />
        </div>

        {bestStreak >= 3 && (
          <motion.div
            className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Flame className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-400">Best streak: {bestStreak}</span>
          </motion.div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-2 rounded-md bg-primary px-6 py-2.5 text-sm font-bold text-foreground transition-all hover:bg-primary/90 active:scale-95"
        >
          Done
        </button>
      </motion.div>
    );
  }

  if (!visibleBars || !hiddenBar) return null;

  // Mini candlestick chart
  const allPrices = visibleBars.flatMap((b) => [b.high, b.low]);
  const chartHigh = Math.max(...allPrices);
  const chartLow = Math.min(...allPrices);
  const chartRange = chartHigh - chartLow || 1;

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-bold">Price Prediction</span>
          <span className="text-xs text-muted-foreground">Round {round + 1}/{ROUNDS}</span>
        </div>
        <div className="flex items-center gap-3">
          {currentStreak > 0 && (
            <motion.div
              className="flex items-center gap-1"
              key={currentStreak}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <Flame className="h-3.5 w-3.5 text-amber-400 streak-fire" />
              <span className="text-xs font-bold tabular-nums text-amber-400">{currentStreak}</span>
            </motion.div>
          )}
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-muted/30 transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Countdown timer (predict phase only) */}
      {phase === "predict" && (
        <div className="flex items-center justify-center gap-2">
          <Timer className={cn("h-3.5 w-3.5", countdown <= 2 ? "text-rose-400" : "text-muted-foreground")} />
          <span className={cn(
            "text-xs font-bold tabular-nums",
            countdown <= 2 ? "text-rose-400" : "text-muted-foreground",
          )}>
            {countdown}s
          </span>
        </div>
      )}

      {/* Chart */}
      <div className="relative h-48 rounded-md border border-border bg-card/50 overflow-hidden">
        <div className="flex items-end h-full px-2 py-3 gap-px">
          {visibleBars.map((bar, i) => {
            const isUp = bar.close >= bar.open;
            const bodyTop = ((chartHigh - Math.max(bar.open, bar.close)) / chartRange) * 100;
            const bodyBottom = ((chartHigh - Math.min(bar.open, bar.close)) / chartRange) * 100;
            const wickTop = ((chartHigh - bar.high) / chartRange) * 100;
            const wickBottom = ((chartHigh - bar.low) / chartRange) * 100;

            return (
              <div key={i} className="flex-1 relative h-full">
                {/* Wick */}
                <div
                  className={cn("absolute left-1/2 -translate-x-1/2 w-px", isUp ? "bg-emerald-400/60" : "bg-rose-400/60")}
                  style={{ top: `${wickTop}%`, bottom: `${100 - wickBottom}%` }}
                />
                {/* Body */}
                <div
                  className={cn(
                    "absolute left-[15%] right-[15%] rounded-[1px] min-h-[1px]",
                    isUp ? "bg-emerald-400" : "bg-rose-400",
                  )}
                  style={{ top: `${bodyTop}%`, bottom: `${100 - bodyBottom}%` }}
                />
              </div>
            );
          })}

          {/* Hidden bar slot */}
          <div className="flex-1 relative h-full">
            <AnimatePresence>
              {phase === "reveal" ? (
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {(() => {
                    const bar = hiddenBar;
                    const isUp = bar.close >= bar.open;
                    const bodyTop = ((chartHigh - Math.max(bar.open, bar.close)) / chartRange) * 100;
                    const bodyBottom = ((chartHigh - Math.min(bar.open, bar.close)) / chartRange) * 100;
                    const wickTop = ((chartHigh - bar.high) / chartRange) * 100;
                    const wickBottom = ((chartHigh - bar.low) / chartRange) * 100;

                    return (
                      <>
                        <div
                          className={cn("absolute left-1/2 -translate-x-1/2 w-px", isUp ? "bg-emerald-400/60" : "bg-rose-400/60")}
                          style={{ top: `${wickTop}%`, bottom: `${100 - wickBottom}%` }}
                        />
                        <div
                          className={cn(
                            "absolute left-[15%] right-[15%] rounded-[1px] min-h-[1px]",
                            isUp ? "bg-emerald-400" : "bg-rose-400",
                          )}
                          style={{ top: `${bodyTop}%`, bottom: `${100 - bodyBottom}%` }}
                        />
                      </>
                    );
                  })()}
                </motion.div>
              ) : (
                <motion.div
                  className="absolute inset-x-[15%] top-[30%] bottom-[30%] rounded border border-dashed border-muted-foreground/30 flex items-center justify-center"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, type: "tween" }}
                >
                  <span className="text-[11px] font-bold text-muted-foreground">?</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Result overlay */}
        <AnimatePresence>
          {result && (
            <motion.div
              className={cn(
                "absolute inset-0 flex items-center justify-center",
                result === "correct" ? "prediction-correct" : "prediction-wrong",
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className={cn(
                  "rounded-md px-4 py-2 font-bold text-sm",
                  result === "correct"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30",
                )}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                {result === "correct" ? "Correct! 🎯" : "Wrong 😓"}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Prediction buttons */}
      <AnimatePresence>
        {phase === "predict" && (
          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <button
              type="button"
              onClick={() => handlePredict("green")}
              className="flex-1 flex items-center justify-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 py-3.5 text-sm font-bold text-emerald-400 transition-all hover:bg-emerald-500/20 active:scale-95"
            >
              <TrendingUp className="h-5 w-5" />
              Green (Up)
            </button>
            <button
              type="button"
              onClick={() => handlePredict("red")}
              className="flex-1 flex items-center justify-center gap-2 rounded-md border border-rose-500/30 bg-rose-500/10 py-3.5 text-sm font-bold text-rose-400 transition-all hover:bg-rose-500/20 active:scale-95"
            >
              <TrendingDown className="h-5 w-5" />
              Red (Down)
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5">
        {Array.from({ length: ROUNDS }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-colors",
              i < round ? "bg-primary" : i === round ? "bg-primary/50" : "bg-muted/30",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function SummaryStatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-0.5 rounded-lg bg-muted/15 px-3 py-2.5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span className={cn("text-lg font-bold tabular-nums", color)}>{value}</span>
      <span className="text-[11px] font-bold text-muted-foreground/60">
        {label}
      </span>
    </motion.div>
  );
}
