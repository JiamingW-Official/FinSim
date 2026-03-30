"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, RotateCcw, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Black-Scholes ────────────────────────────────────────────────────────────

function normCDF(x: number): number {
  // Abramowitz & Stegun approximation — accurate to 7 decimal places
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1 / (1 + p * absX);
  const poly = ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t;
  const erf = 1 - poly * Math.exp(-absX * absX);
  return 0.5 * (1 + sign * erf);
}

interface BSResult {
  call: number;
  put: number;
  d1: number;
  d2: number;
  delta: number;
  nd1: number;
  nd2: number;
}

function blackScholes(S: number, K: number, T: number, sigma: number, r: number): BSResult {
  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;
  const nd1 = normCDF(d1);
  const nd2 = normCDF(d2);
  const call = S * nd1 - K * Math.exp(-r * T) * nd2;
  const put  = K * Math.exp(-r * T) * normCDF(-d2) - S * normCDF(-d1);
  return { call, put, d1, d2, delta: nd1, nd1, nd2 };
}

// ─── Round Definitions ────────────────────────────────────────────────────────

interface Round {
  S: number;     // spot price
  K: number;     // strike
  days: number;  // days to expiry
  ivPct: number; // IV as percentage (e.g. 25)
  rPct: number;  // risk-free rate as percentage (e.g. 5)
  hint: string;
}

// Hardcoded rounds with educational variety
const ROUNDS: Round[] = [
  { S: 100, K: 105, days: 30,  ivPct: 25, rPct: 5,  hint: "OTM call. 30 days. Moderate IV." },
  { S: 150, K: 150, days: 60,  ivPct: 30, rPct: 4,  hint: "ATM call. 60 days. Slightly higher IV." },
  { S: 200, K: 190, days: 14,  ivPct: 40, rPct: 5,  hint: "ITM call. Only 2 weeks left. High IV." },
  { S: 50,  K: 55,  days: 90,  ivPct: 20, rPct: 3,  hint: "OTM call. 90 days. Low IV — time value dominates." },
  { S: 300, K: 300, days: 7,   ivPct: 50, rPct: 5,  hint: "ATM call. Only 1 week. Very high IV crush risk." },
];

function toYears(days: number) { return days / 365; }
function toDecimal(pct: number) { return pct / 100; }

// ─── Storage ──────────────────────────────────────────────────────────────────

const EXERCISE_STORAGE_KEY = "finsim-exercise-bspricing-v1";

// ─── Step display helpers ─────────────────────────────────────────────────────

function fmt(n: number, dp = 4) { return n.toFixed(dp); }

// ─── Main Component ───────────────────────────────────────────────────────────

interface OptionsPricingExerciseProps {
  onComplete?: (score: number, max: number) => void;
}

type Phase = "input" | "revealed" | "results";

export function OptionsPricingExercise({ onComplete }: OptionsPricingExerciseProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [phase, setPhase] = useState<Phase>("input");
  const [scores, setScores] = useState<number[]>([]); // 2=exact, 1=close, 0=off
  const [guesses, setGuesses] = useState<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const round  = ROUNDS[roundIndex];
  const T      = toYears(round.days);
  const sigma  = toDecimal(round.ivPct);
  const r      = toDecimal(round.rPct);
  const result = blackScholes(round.S, round.K, T, sigma, r);
  const correct = result.call;

  const isLastRound = roundIndex === ROUNDS.length - 1;
  const totalScore  = scores.reduce((a, b) => a + b, 0);
  const maxScore    = ROUNDS.length * 2;

  useEffect(() => {
    if (phase === "input") inputRef.current?.focus();
  }, [phase, roundIndex]);

  const handleReveal = useCallback(() => {
    const g = parseFloat(guess);
    if (isNaN(g) || g < 0) return;
    const diff = Math.abs(g - correct);
    const pctOff = diff / correct;
    const s = pctOff < 0.05 ? 2 : pctOff < 0.15 ? 1 : 0;
    setGuesses((prev) => [...prev, g]);
    setScores((prev)  => [...prev, s]);
    setPhase("revealed");
  }, [guess, correct]);

  const handleNext = useCallback(() => {
    if (isLastRound) {
      // persist
      try {
        const prev = JSON.parse(localStorage.getItem(EXERCISE_STORAGE_KEY) ?? "{}");
        const best = Math.max(prev.best ?? 0, totalScore + scores[scores.length - 1]);
        localStorage.setItem(EXERCISE_STORAGE_KEY, JSON.stringify({ best, completedAt: Date.now() }));
      } catch { /* ignore */ }
      setPhase("results");
    } else {
      setRoundIndex((i) => i + 1);
      setGuess("");
      setPhase("input");
    }
  }, [isLastRound, totalScore, scores]);

  const handleRestart = useCallback(() => {
    setRoundIndex(0);
    setGuess("");
    setScores([]);
    setGuesses([]);
    setPhase("input");
  }, []);

  const lastScore = scores[scores.length - 1] ?? 0;
  const lastGuess = guesses[guesses.length - 1] ?? 0;
  const diff      = Math.abs(lastGuess - correct);
  const pctOff    = correct > 0 ? (diff / correct * 100) : 0;

  function scoreLabel(s: number) {
    if (s === 2) return "Exact (within 5%)";
    if (s === 1) return "Close (within 15%)";
    return "Off by more than 15%";
  }
  function scoreColor(s: number) {
    if (s === 2) return "text-green-400";
    if (s === 1) return "text-amber-400";
    return "text-red-400";
  }

  const gradeLabel = totalScore >= maxScore * 0.8 ? "Expert" : totalScore >= maxScore * 0.5 ? "Proficient" : "Needs Practice";
  const gradeColor = totalScore >= maxScore * 0.8 ? "text-green-400" : totalScore >= maxScore * 0.5 ? "text-amber-400" : "text-red-400";

  if (phase === "results") {
    return (
      <div className="flex flex-col gap-3">
        <div className="text-center">
          <p className="text-xs font-semibold">Black-Scholes Drill Complete</p>
          <p className={cn("text-lg font-bold tabular-nums", gradeColor)}>{gradeLabel}</p>
          <p className="text-[10px] text-muted-foreground">{totalScore} / {maxScore} pts</p>
        </div>
        <div className="space-y-1.5">
          {ROUNDS.map((rnd, i) => {
            const T2 = toYears(rnd.days);
            const s2 = toDecimal(rnd.ivPct);
            const r2 = toDecimal(rnd.rPct);
            const res = blackScholes(rnd.S, rnd.K, T2, s2, r2);
            return (
              <div key={i} className="flex items-center gap-2 text-[10px]">
                <span className="font-mono text-muted-foreground w-6">#{i+1}</span>
                <span className={cn("font-semibold w-4", scoreColor(scores[i] ?? 0))}>
                  {scores[i] === 2 ? "+" : scores[i] === 1 ? "~" : "x"}
                </span>
                <span className="text-muted-foreground">
                  Guess: <span className="font-mono">${(guesses[i] ?? 0).toFixed(2)}</span>
                </span>
                <span className="text-muted-foreground">
                  Actual: <span className="font-mono text-foreground/70">${res.call.toFixed(2)}</span>
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleRestart}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border/50 px-3 py-2 text-[10px] font-medium hover:bg-muted/40 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Try Again
          </button>
          {onComplete && (
            <button
              type="button"
              onClick={() => onComplete(totalScore, maxScore)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-[10px] font-medium text-background hover:opacity-80 transition-opacity"
            >
              Done
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-muted-foreground">Round {roundIndex + 1}/{ROUNDS.length}</span>
        <div className="flex-1 h-1 rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-foreground/40 transition-all"
            style={{ width: `${(roundIndex / ROUNDS.length) * 100}%` }}
          />
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">Score: {totalScore}</span>
      </div>

      {/* Parameters */}
      <div className="rounded-md border border-border/50 bg-muted/10 p-3">
        <p className="text-[9px] text-muted-foreground mb-2 font-medium uppercase tracking-wide">Parameters</p>
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground">Spot (S)</span>
            <span className="font-mono font-semibold">${round.S}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground">Strike (K)</span>
            <span className="font-mono font-semibold">${round.K}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground">Days (T)</span>
            <span className="font-mono font-semibold">{round.days}d</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground">IV (σ)</span>
            <span className="font-mono font-semibold">{round.ivPct}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground">Rate (r)</span>
            <span className="font-mono font-semibold">{round.rPct}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground">Type</span>
            <span className="font-mono font-semibold">Call</span>
          </div>
        </div>
        <p className="mt-2 text-[9px] text-muted-foreground italic">{round.hint}</p>
      </div>

      {/* Input phase */}
      {phase === "input" && (
        <div className="flex flex-col gap-2">
          <label className="text-[10px] text-muted-foreground">Your estimate for the call price:</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">$</span>
              <input
                ref={inputRef}
                type="number"
                min={0}
                step={0.01}
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleReveal(); }}
                placeholder="0.00"
                className="w-full rounded-md border border-border/50 bg-muted/20 pl-6 pr-3 py-2 text-[11px] font-mono focus:outline-none focus:ring-1 focus:ring-foreground/20"
              />
            </div>
            <button
              type="button"
              onClick={handleReveal}
              disabled={!guess || isNaN(parseFloat(guess))}
              className="flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-[10px] font-semibold text-background disabled:opacity-40 transition-opacity hover:opacity-80"
            >
              Reveal
            </button>
          </div>
        </div>
      )}

      {/* Reveal phase */}
      <AnimatePresence>
        {phase === "revealed" && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
          >
            {/* Score banner */}
            <div className={cn(
              "flex items-center gap-2 rounded-md border px-3 py-2",
              lastScore === 2 ? "border-green-500/30 bg-green-500/10" :
              lastScore === 1 ? "border-amber-500/30 bg-amber-500/10" :
              "border-red-500/30 bg-red-500/10"
            )}>
              {lastScore >= 1 ? (
                <Check className="h-3.5 w-3.5 text-green-400 shrink-0" />
              ) : (
                <X className="h-3.5 w-3.5 text-red-400 shrink-0" />
              )}
              <div>
                <p className={cn("text-[10px] font-semibold", scoreColor(lastScore))}>
                  {scoreLabel(lastScore)}
                </p>
                <p className="text-[9px] text-muted-foreground">
                  Your guess: <span className="font-mono">${lastGuess.toFixed(2)}</span>
                  {" "}— Actual: <span className="font-mono font-semibold">${correct.toFixed(2)}</span>
                  {" "}({pctOff.toFixed(1)}% off)
                </p>
              </div>
            </div>

            {/* Step-by-step calculation */}
            <div className="rounded-md border border-border/50 bg-muted/10 p-3 space-y-2">
              <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wide">Black-Scholes Step-by-Step</p>

              <div className="space-y-1 text-[10px] font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">T = {round.days} / 365 =</span>
                  <span>{fmt(T)} yrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">σ = {round.ivPct}% =</span>
                  <span>{fmt(sigma)}</span>
                </div>
                <div className="border-t border-border/30 pt-1 flex justify-between">
                  <span className="text-muted-foreground">d1 = [ln(S/K) + (r+σ²/2)T] / (σ√T)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground pl-2">ln({round.S}/{round.K}) = {fmt(Math.log(round.S / round.K))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground pl-2">d1 =</span>
                  <span>{fmt(result.d1, 4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground pl-2">d2 = d1 - σ√T =</span>
                  <span>{fmt(result.d2, 4)}</span>
                </div>
                <div className="border-t border-border/30 pt-1 flex justify-between">
                  <span className="text-muted-foreground">N(d1) =</span>
                  <span>{fmt(result.nd1, 4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">N(d2) =</span>
                  <span>{fmt(result.nd2, 4)}</span>
                </div>
                <div className="border-t border-border/30 pt-1 flex justify-between font-semibold">
                  <span className="text-muted-foreground">Call = S·N(d1) - K·e^(-rT)·N(d2) =</span>
                  <span className="text-foreground">${fmt(result.call, 2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Put = K·e^(-rT)·N(-d2) - S·N(-d1) =</span>
                  <span>${fmt(result.put, 2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delta =</span>
                  <span>{fmt(result.delta, 4)}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center justify-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-[10px] font-semibold text-background hover:opacity-80 transition-opacity"
            >
              {isLastRound ? "See Results" : "Next Round"}
              <ChevronRight className="h-3 w-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
