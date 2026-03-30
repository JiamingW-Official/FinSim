"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, CheckCircle2, XCircle, AlertTriangle, ShieldAlert } from "lucide-react";
import {
  BLACK_SWAN_SCENARIOS,
  getSeverityColor,
  getSeverityLabel,
  type BlackSwanScenario,
} from "@/data/black-swan-scenarios";
import { useGameStore } from "@/stores/game-store";

// ---------------------------------------------------------------------------
// PRNG — mulberry32
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Synthetic price series
// ---------------------------------------------------------------------------
function generateCrashSeries(scenario: BlackSwanScenario, idx: number): number[] {
  const seed = (idx + 1) * 777;
  const rng = mulberry32(seed);
  const bars = 60;
  const prices: number[] = [100];

  // Phase 1: calm (first 15 bars)
  for (let i = 1; i <= 15; i++) {
    const drift = (rng() - 0.5) * 0.8;
    prices.push(prices[i - 1] * (1 + drift / 100));
  }

  // Phase 2: crash (bars 16–35), magnitude driven by priceShock
  const crashTotal = scenario.priceShock; // negative %
  const crashBars = 20;
  for (let i = 0; i < crashBars; i++) {
    const progress = (i + 1) / crashBars;
    // Accelerating then decelerating curve (sine-ish)
    const wave = Math.sin(progress * Math.PI);
    const dailyChange = (crashTotal / crashBars) * (1 + wave * scenario.volatilityMultiplier * 0.15);
    const noise = (rng() - 0.5) * Math.abs(crashTotal) * 0.05;
    const prev = prices[prices.length - 1];
    prices.push(prev * (1 + (dailyChange + noise) / 100));
  }

  // Phase 3: stabilise / partial recovery (remaining bars)
  const recoveryBars = bars - prices.length + 1;
  const recoveryPct = Math.abs(crashTotal) * 0.35; // partial recovery
  for (let i = 0; i < recoveryBars; i++) {
    const drift = recoveryPct / recoveryBars + (rng() - 0.5) * 1.2;
    prices.push(prices[prices.length - 1] * (1 + drift / 100));
  }

  return prices.slice(0, bars);
}

// ---------------------------------------------------------------------------
// Challenge questions — 5 per scenario
// ---------------------------------------------------------------------------
interface ChallengeQuestion {
  bar: number; // which price bar (0-indexed) this question appears at
  prompt: string;
  options: { key: "A" | "B" | "C" | "D"; label: string }[];
  correctKey: "A" | "B" | "C" | "D";
  explanation: string;
  xp: number;
}

function buildQuestions(scenario: BlackSwanScenario): ChallengeQuestion[] {
  const drop = Math.abs(scenario.priceShock);
  return [
    {
      bar: 14,
      prompt: `VIX just hit ${scenario.initialVIX}. Market is calm but elevated. What do you do?`,
      options: [
        { key: "A", label: "Add to longs — high VIX = buying opportunity" },
        { key: "B", label: "Trim risk, move to 30–40% cash as a precaution" },
        { key: "C", label: "Do nothing — VIX spikes are noise" },
        { key: "D", label: "Go full short immediately" },
      ],
      correctKey: "B",
      explanation: `Elevated VIX signals institutional hedging. ${scenario.tagline} — trimming exposure early is the disciplined response without over-reacting.`,
      xp: 100,
    },
    {
      bar: 19,
      prompt: `Market drops ${Math.round(drop * 0.4)}% in the first wave. What's your move?`,
      options: [
        { key: "A", label: "Panic sell everything at market price" },
        { key: "B", label: "Hold — it will bounce back" },
        { key: "C", label: "Buy more — averaging down" },
        { key: "D", label: "Hedge with puts or reduce exposure by 50%" },
      ],
      correctKey: "D",
      explanation: `In a ${getSeverityLabel(scenario.severity).toLowerCase()}-severity event, the first wave is rarely the last. Hedging preserves optionality. ${scenario.commonMistakes[0]}`,
      xp: 100,
    },
    {
      bar: 25,
      prompt: `Down ${Math.round(drop * 0.7)}% total. Your portfolio is bleeding. A friend says "just hold, markets always recover." What do you do?`,
      options: [
        { key: "A", label: "Listen and hold everything" },
        { key: "B", label: "De-lever: close margin positions immediately" },
        { key: "C", label: "Buy more to lower cost basis" },
        { key: "D", label: "Transfer to crypto to diversify" },
      ],
      correctKey: "B",
      explanation: `Margin amplifies losses in a crash. The correct action: de-leverage first, survive second, profit third. "${scenario.whatWorked[0]}"`,
      xp: 100,
    },
    {
      bar: 30,
      prompt: `At the bottom — down ${Math.round(drop)}%. Rumours of a policy response. What now?`,
      options: [
        { key: "A", label: "All-in immediately — once in a lifetime buying opportunity" },
        { key: "B", label: "Wait for confirmation (2+ up bars) before adding exposure" },
        { key: "C", label: "Sell remaining holdings — expect lower lows" },
        { key: "D", label: "Short aggressively — ride the panic down" },
      ],
      correctKey: "B",
      explanation: `Bottoms are only clear in hindsight. Waiting for a confirmed reversal avoids catching a falling knife. "${scenario.whatWorked[1] ?? scenario.whatWorked[0]}"`,
      xp: 100,
    },
    {
      bar: 45,
      prompt: `Market has recovered ${Math.round(drop * 0.35)}% off the low. You survived. What's the key lesson?`,
      options: [
        { key: "A", label: "Diversification always works — just hold more assets" },
        { key: "B", label: "Timing the market is easy if you read the news" },
        { key: "C", label: "Capital preservation + hedging = survival in tail events" },
        { key: "D", label: "Black swan events can be reliably predicted" },
      ],
      correctKey: "C",
      explanation: `${scenario.educationalFocus[0]}. Survival in extreme events requires pre-positioned hedges and strict capital discipline — not prediction.`,
      xp: 100,
    },
  ];
}

// ---------------------------------------------------------------------------
// Mini SVG price chart
// ---------------------------------------------------------------------------
function MiniCrashChart({
  prices,
  width = 260,
  height = 80,
  highlightBar,
}: {
  prices: number[];
  width?: number;
  height?: number;
  highlightBar?: number;
}) {
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const pad = 6;
  const w = width - pad * 2;
  const h = height - pad * 2;

  const toX = (i: number) => pad + (i / (prices.length - 1)) * w;
  const toY = (v: number) => pad + h - ((v - min) / range) * h;

  const pathD = prices
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(p).toFixed(1)}`)
    .join(" ");

  // Crash zone shading (bars 15–35)
  const crashX1 = toX(15);
  const crashX2 = toX(Math.min(35, prices.length - 1));

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Crash zone */}
      <rect
        x={crashX1}
        y={pad}
        width={crashX2 - crashX1}
        height={h}
        fill="rgba(239,68,68,0.08)"
      />
      {/* Price line */}
      <path d={pathD} fill="none" stroke="#6366f1" strokeWidth={1.5} />
      {/* Highlighted bar vertical line */}
      {highlightBar !== undefined && highlightBar < prices.length && (
        <line
          x1={toX(highlightBar)}
          y1={pad}
          x2={toX(highlightBar)}
          y2={pad + h}
          stroke="#f59e0b"
          strokeWidth={1}
          strokeDasharray="3,2"
        />
      )}
      {/* Start / current dots */}
      <circle cx={toX(0)} cy={toY(prices[0])} r={2.5} fill="#6366f1" />
      <circle
        cx={toX(prices.length - 1)}
        cy={toY(prices[prices.length - 1])}
        r={2.5}
        fill={prices[prices.length - 1] < prices[0] ? "#ef4444" : "#22c55e"}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Severity badge
// ---------------------------------------------------------------------------
function SeverityBadge({ severity }: { severity: number }) {
  const colors = getSeverityColor(severity);
  const label = getSeverityLabel(severity);
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide border ${colors.text} ${colors.bg} ${colors.border}`}
    >
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Scenario card
// ---------------------------------------------------------------------------
function ScenarioCard({
  scenario,
  idx,
  onSelect,
}: {
  scenario: BlackSwanScenario;
  idx: number;
  onSelect: (s: BlackSwanScenario) => void;
}) {
  const prices = useMemo(() => generateCrashSeries(scenario, idx), [scenario, idx]);
  const colors = getSeverityColor(scenario.severity);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className={`flex flex-col gap-3 rounded-lg border bg-card p-4 cursor-pointer hover:border-primary/50 transition-colors ${colors.border}`}
      onClick={() => onSelect(scenario)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight truncate">{scenario.name}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug line-clamp-1">{scenario.tagline}</p>
        </div>
        <SeverityBadge severity={scenario.severity} />
      </div>

      <MiniCrashChart prices={prices} width={220} height={64} />

      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">{scenario.description}</p>

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            Shock: {scenario.priceShock}%
          </span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            Vol {scenario.volatilityMultiplier}x
          </span>
        </div>
        <button
          className="rounded bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(scenario);
          }}
        >
          Enter Arena
        </button>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Challenge mode
// ---------------------------------------------------------------------------
type AnswerRecord = { questionIdx: number; chosen: "A" | "B" | "C" | "D"; correct: boolean };

function ChallengeMode({
  scenario,
  idx,
  onFinish,
  onBack,
}: {
  scenario: BlackSwanScenario;
  idx: number;
  onFinish: (score: number, answers: AnswerRecord[]) => void;
  onBack: () => void;
}) {
  const prices = useMemo(() => generateCrashSeries(scenario, idx), [scenario, idx]);
  const questions = useMemo(() => buildQuestions(scenario), [scenario]);

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [chosen, setChosen] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [revealed, setRevealed] = useState(false);

  const question = questions[currentQ];
  const highlightBar = question?.bar;

  const visiblePrices = useMemo(() => {
    if (!question) return prices;
    return prices.slice(0, question.bar + 1);
  }, [prices, question]);

  const totalScore = answers.filter((a) => a.correct).length * 100;

  function handleChoose(key: "A" | "B" | "C" | "D") {
    if (revealed) return;
    setChosen(key);
    setRevealed(true);
  }

  function handleNext() {
    if (!chosen || !question) return;
    const record: AnswerRecord = {
      questionIdx: currentQ,
      chosen,
      correct: chosen === question.correctKey,
    };
    const newAnswers = [...answers, record];
    setAnswers(newAnswers);

    if (currentQ + 1 >= questions.length) {
      const finalScore = newAnswers.filter((a) => a.correct).length * 100;
      onFinish(finalScore, newAnswers);
    } else {
      setCurrentQ((q) => q + 1);
      setChosen(null);
      setRevealed(false);
    }
  }

  const colors = getSeverityColor(scenario.severity);

  return (
    <div className="flex h-full flex-col gap-0">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          onClick={onBack}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <div className="h-4 w-px bg-border" />
        <ShieldAlert className={`h-4 w-4 ${colors.text}`} />
        <span className="text-sm font-semibold">{scenario.name}</span>
        <SeverityBadge severity={scenario.severity} />
        <div className="flex-1" />
        <span className="text-xs tabular-nums text-muted-foreground">
          Q {currentQ + 1}/{questions.length}
        </span>
        <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
          {totalScore + (revealed && chosen === question?.correctKey ? 100 : 0)} XP
        </span>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        {/* Left: chart */}
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:w-[340px] lg:border-b-0 lg:border-r lg:overflow-y-auto">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Price Action</p>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <MiniCrashChart prices={visiblePrices} width={292} height={120} highlightBar={highlightBar} />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
              <span>T+0</span>
              <span className="text-amber-400">
                {visiblePrices.length > 0
                  ? `${((visiblePrices[visiblePrices.length - 1] / visiblePrices[0] - 1) * 100).toFixed(1)}%`
                  : ""}
              </span>
              <span>T+{visiblePrices.length}</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Scenario Context</p>
            <p className="text-[11px] text-muted-foreground leading-snug">{scenario.description}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Educational Focus</p>
            <ul className="space-y-0.5">
              {scenario.educationalFocus.slice(0, 3).map((focus, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                  <span className="mt-0.5 text-primary">&#x2023;</span>
                  {focus}
                </li>
              ))}
            </ul>
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {questions.map((_, i) => {
              const ans = answers[i];
              return (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i < answers.length
                      ? ans.correct
                        ? "bg-green-500"
                        : "bg-red-500"
                      : i === currentQ
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Right: question */}
        <div className="flex flex-1 flex-col gap-4 p-4 lg:overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              {/* Prompt */}
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">
                  Market Event — Bar {question?.bar ?? 0}
                </p>
                <p className="text-sm font-semibold leading-snug">{question?.prompt}</p>
              </div>

              {/* Options */}
              <div className="flex flex-col gap-2">
                {question?.options.map((opt) => {
                  let variant = "default";
                  if (revealed) {
                    if (opt.key === question.correctKey) variant = "correct";
                    else if (opt.key === chosen) variant = "wrong";
                  } else if (opt.key === chosen) {
                    variant = "selected";
                  }

                  return (
                    <button
                      key={opt.key}
                      disabled={revealed}
                      onClick={() => handleChoose(opt.key)}
                      className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors disabled:cursor-default ${
                        variant === "correct"
                          ? "border-green-500/60 bg-green-500/10 text-green-400"
                          : variant === "wrong"
                          ? "border-red-500/60 bg-red-500/10 text-red-400"
                          : variant === "selected"
                          ? "border-primary/60 bg-primary/10 text-foreground"
                          : "border-border bg-card hover:border-primary/40 hover:bg-muted/40 text-foreground"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold ${
                          variant === "correct"
                            ? "bg-green-500 text-white"
                            : variant === "wrong"
                            ? "bg-red-500 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span className="leading-snug">{opt.label}</span>
                      {revealed && opt.key === question.correctKey && (
                        <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-green-500 mt-0.5" />
                      )}
                      {revealed && opt.key === chosen && opt.key !== question.correctKey && (
                        <XCircle className="ml-auto h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {revealed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className={`rounded-lg border p-3 text-[12px] leading-relaxed ${
                        chosen === question?.correctKey
                          ? "border-green-500/30 bg-green-500/5 text-green-300"
                          : "border-red-500/30 bg-red-500/5 text-red-300"
                      }`}
                    >
                      <p className="font-semibold mb-0.5">
                        {chosen === question?.correctKey ? "Correct" : "Incorrect"}
                        {chosen === question?.correctKey ? " +100 XP" : " +0 XP"}
                      </p>
                      <p className="text-muted-foreground">{question?.explanation}</p>
                    </div>

                    <button
                      onClick={handleNext}
                      className="mt-3 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      {currentQ + 1 >= questions.length ? "See Results" : "Next Question"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Results modal
// ---------------------------------------------------------------------------
function ResultsModal({
  scenario,
  score,
  answers,
  onReplay,
  onBack,
}: {
  scenario: BlackSwanScenario;
  score: number;
  answers: AnswerRecord[];
  onReplay: () => void;
  onBack: () => void;
}) {
  const maxScore = answers.length * 100;
  const pct = maxScore > 0 ? score / maxScore : 0;

  const grade =
    pct >= 0.9 ? "S"
    : pct >= 0.7 ? "A"
    : pct >= 0.5 ? "B"
    : "C";

  const gradeColor =
    grade === "S" ? "text-primary"
    : grade === "A" ? "text-green-400"
    : grade === "B" ? "text-amber-400"
    : "text-red-400";

  const correct = answers.filter((a) => a.correct).length;
  const keyLesson = scenario.whatWorked[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl"
      >
        {/* Grade */}
        <div className="mb-4 text-center">
          <span className={`text-6xl font-black ${gradeColor}`}>{grade}</span>
          <p className="mt-1 text-sm text-muted-foreground">
            {grade === "S" ? "Perfect — Survivor Elite"
              : grade === "A" ? "Excellent — Crisis Aware"
              : grade === "B" ? "Good — Learning the Ropes"
              : "Keep Practicing — Losses Happen"}
          </p>
        </div>

        {/* Score bar */}
        <div className="mb-4">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Score</span>
            <span className="tabular-nums font-semibold text-foreground">{score} / {maxScore} XP</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${pct * 100}%` }}
              transition={{ delay: 0.3, duration: 0.6 }}
            />
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground text-right">
            {correct}/{answers.length} correct
          </p>
        </div>

        {/* Answers breakdown */}
        <div className="mb-4 flex gap-2">
          {answers.map((a, i) => (
            <div
              key={i}
              className={`flex h-7 w-7 items-center justify-center rounded text-[10px] font-bold ${
                a.correct ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
              }`}
            >
              {a.correct ? "+" : "-"}
            </div>
          ))}
        </div>

        {/* Key lesson */}
        <div className="mb-5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
            <div>
              <p className="text-[11px] font-semibold text-amber-400 mb-0.5">Key Lesson</p>
              <p className="text-[11px] text-muted-foreground leading-snug">{keyLesson}</p>
            </div>
          </div>
        </div>

        {/* XP earned */}
        <div className="mb-5 rounded-lg border border-primary/30 bg-primary/5 p-3 text-center">
          <p className="text-xs text-muted-foreground">XP Awarded to Account</p>
          <p className="mt-0.5 text-2xl font-black text-primary">+{score}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onReplay}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted/50 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Replay
          </button>
          <button
            onClick={onBack}
            className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Back to Arena
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
type ArenaView = "grid" | "challenge" | "results";

export function BlackSwanArena() {
  const awardXP = useGameStore((s) => s.awardXP);

  const [view, setView] = useState<ArenaView>("grid");
  const [selectedScenario, setSelectedScenario] = useState<BlackSwanScenario | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [finalAnswers, setFinalAnswers] = useState<AnswerRecord[]>([]);

  const handleSelectScenario = useCallback((scenario: BlackSwanScenario) => {
    const idx = BLACK_SWAN_SCENARIOS.findIndex((s) => s.id === scenario.id);
    setSelectedScenario(scenario);
    setSelectedIdx(idx);
    setView("challenge");
  }, []);

  const handleFinish = useCallback(
    (score: number, answers: AnswerRecord[]) => {
      setFinalScore(score);
      setFinalAnswers(answers);
      awardXP(score);
      setView("results");
    },
    [awardXP],
  );

  const handleReplay = useCallback(() => {
    setView("challenge");
    setFinalScore(0);
    setFinalAnswers([]);
  }, []);

  const handleBack = useCallback(() => {
    setView("grid");
    setSelectedScenario(null);
    setFinalScore(0);
    setFinalAnswers([]);
  }, []);

  // Challenge mode is full-height within the arena content area
  if (view === "challenge" && selectedScenario) {
    return (
      <div className="flex h-full flex-col">
        <ChallengeMode
          scenario={selectedScenario}
          idx={selectedIdx}
          onFinish={handleFinish}
          onBack={handleBack}
        />
      </div>
    );
  }

  // Results overlay (on top of grid)
  if (view === "results" && selectedScenario) {
    return (
      <ResultsModal
        scenario={selectedScenario}
        score={finalScore}
        answers={finalAnswers}
        onReplay={handleReplay}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="flex h-full flex-col">

      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-red-400" />
          <h2 className="text-sm font-semibold">Black Swan Arena</h2>
          <span className="rounded bg-red-500/15 border border-red-500/40 px-1.5 py-0.5 text-[10px] font-bold text-red-400">
            TAIL RISK
          </span>
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          8 extreme market scenarios. Test your capital preservation instincts.
        </p>
      </div>

      {/* 2x4 scenario grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {BLACK_SWAN_SCENARIOS.map((scenario, idx) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              idx={idx}
              onSelect={handleSelectScenario}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
