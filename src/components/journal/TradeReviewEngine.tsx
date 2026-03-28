"use client";

import { useMemo, useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Brain,
  BarChart2,
  Clock,
  Calendar,
  Smile,
  Frown,
  Meh,
  Zap,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import type { TradeRow } from "@/app/(dashboard)/journal/JournalPageClient";

// ── Mulberry32 PRNG ──────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Interfaces ────────────────────────────────────────────────────────────────

interface GradedTrade {
  id: string;
  ticker: string;
  side: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  realizedPnL: number;
  pnlPct: number;
  durationMs: number;
  timestamp: number;
  // Grading
  processScore: number;  // 0-100: did you follow rules?
  outcomeScore: number;  // 0-100: actual result
  grade: string;
  category: "good-good" | "good-bad" | "bad-good" | "bad-bad";
  // MFE / MAE
  mfe: number;           // max favorable excursion (%)
  mae: number;           // max adverse excursion (%)
  efficiency: number;    // (exit - entry) / (MFE - entry) %
  // Context
  hour: number;          // 0-23
  dow: number;           // 0=Sun
  conditionLabel: "trending" | "choppy" | "volatile";
  emotionLabel: EmotionState;
  emotionScore: number;  // 1-5 (calm=5, frustrated=1)
}

type EmotionState = "calm" | "excited" | "anxious" | "frustrated" | "bored";

interface ImprovementTarget {
  id: string;
  title: string;
  description: string;
  currentMetric: string;
  goalMetric: string;
  actionItems: string[];
  progress: number[];   // 30 data points
  color: string;
}

const EMOTION_COLORS: Record<EmotionState, string> = {
  calm:       "text-green-400",
  excited:    "text-amber-400",
  anxious:    "text-orange-400",
  frustrated: "text-red-400",
  bored:      "text-blue-400",
};

const EMOTION_SCORES: Record<EmotionState, number> = {
  calm: 5,
  excited: 4,
  bored: 3,
  anxious: 2,
  frustrated: 1,
};

const EMOTIONS: EmotionState[] = ["calm", "excited", "anxious", "frustrated", "bored"];
const TICKERS = ["AAPL", "TSLA", "NVDA", "MSFT", "AMZN", "META", "GOOGL", "AMD"];
const CONDITIONS: GradedTrade["conditionLabel"][] = ["trending", "choppy", "volatile"];
const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const GRADE_COLORS: Record<string, string> = {
  A: "text-green-400",
  B: "text-teal-400",
  C: "text-amber-400",
  D: "text-orange-400",
  F: "text-red-400",
};
const GRADE_BG: Record<string, string> = {
  A: "bg-green-400/20",
  B: "bg-teal-400/20",
  C: "bg-amber-400/20",
  D: "bg-orange-400/20",
  F: "bg-red-400/20",
};

// ── Synthetic Trade Generator ─────────────────────────────────────────────────

function generateSyntheticTrades(seed: number, count = 20): GradedTrade[] {
  const rng = mulberry32(seed);
  const trades: GradedTrade[] = [];
  const baseTs = Date.now() - count * 3 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < count; i++) {
    const ticker = TICKERS[Math.floor(rng() * TICKERS.length)];
    const entryPrice = 50 + rng() * 450;
    const durationMs = (0.5 + rng() * 5) * 60 * 60 * 1000;
    const timestamp = baseTs + i * 3 * 24 * 60 * 60 * 1000 + rng() * 8 * 60 * 60 * 1000;

    // MAE and MFE as % of entry
    const mae = -(rng() * 4 + 0.5);  // -0.5% to -4.5%
    const mfeRaw = rng() * 8 + 0.5;  // +0.5% to +8.5%

    // Actual exit somewhere between MAE and MFE
    const exitPct = mae + rng() * (mfeRaw - mae);
    const exitPrice = entryPrice * (1 + exitPct / 100);
    const quantity = Math.floor(10 + rng() * 90);
    const realizedPnL = (exitPrice - entryPrice) * quantity;
    const pnlPct = exitPct;

    // Process score: higher if trade followed good rules (independent of outcome)
    const processScore = Math.floor(20 + rng() * 80);
    // Outcome score: based on actual P&L
    const outcomeScore = Math.min(100, Math.max(0, 50 + pnlPct * 6));

    const category: GradedTrade["category"] =
      processScore >= 50 && outcomeScore >= 50 ? "good-good" :
      processScore >= 50 && outcomeScore < 50  ? "good-bad"  :
      processScore < 50  && outcomeScore >= 50 ? "bad-good"  :
                                                  "bad-bad";

    // Combined grade
    const combined = processScore * 0.6 + outcomeScore * 0.4;
    const grade =
      combined >= 80 ? "A" :
      combined >= 65 ? "B" :
      combined >= 50 ? "C" :
      combined >= 35 ? "D" : "F";

    // Efficiency: how much of MFE was captured
    const efficiency = mfeRaw > 0
      ? Math.min(100, Math.max(0, ((exitPct - mae) / (mfeRaw - mae)) * 100))
      : 0;

    const hour = 9 + Math.floor(rng() * 7);  // 9am-4pm
    const dow = 1 + Math.floor(rng() * 5);   // Mon-Fri
    const conditionLabel = CONDITIONS[Math.floor(rng() * CONDITIONS.length)];
    const emotionLabel = EMOTIONS[Math.floor(rng() * EMOTIONS.length)];

    trades.push({
      id: `synth-${i}`,
      ticker,
      side: rng() > 0.3 ? "sell" : "buy",
      entryPrice,
      exitPrice,
      quantity,
      realizedPnL,
      pnlPct,
      durationMs,
      timestamp,
      processScore,
      outcomeScore,
      grade,
      category,
      mfe: mfeRaw,
      mae,
      efficiency,
      hour,
      dow,
      conditionLabel,
      emotionLabel,
      emotionScore: EMOTION_SCORES[emotionLabel],
    });
  }

  return trades;
}

function realRowsToGraded(rows: TradeRow[], seed: number): GradedTrade[] {
  const rng = mulberry32(seed);
  return rows.slice(0, 20).map((r): GradedTrade => {
    const entryPrice = r.entryPrice;
    const exitPrice = r.trade.price;
    const pnlPct = r.pnlPct;

    const mae = -(rng() * 3 + 0.5);
    const mfeRaw = Math.max(pnlPct + rng() * 3, 0.1);
    const efficiency = mfeRaw > 0
      ? Math.min(100, Math.max(0, ((pnlPct - mae) / (mfeRaw - mae)) * 100))
      : 0;

    const processScore = Math.floor(20 + rng() * 80);
    const outcomeScore = Math.min(100, Math.max(0, 50 + pnlPct * 6));
    const category: GradedTrade["category"] =
      processScore >= 50 && outcomeScore >= 50 ? "good-good" :
      processScore >= 50 && outcomeScore < 50  ? "good-bad"  :
      processScore < 50  && outcomeScore >= 50 ? "bad-good"  :
                                                  "bad-bad";
    const combined = processScore * 0.6 + outcomeScore * 0.4;
    const grade =
      combined >= 80 ? "A" :
      combined >= 65 ? "B" :
      combined >= 50 ? "C" :
      combined >= 35 ? "D" : "F";

    const ts = new Date(r.trade.timestamp);
    const hour = ts.getHours();
    const dow = ts.getDay();
    const conditionLabel = CONDITIONS[Math.floor(rng() * CONDITIONS.length)];
    const emotionLabel = EMOTIONS[Math.floor(rng() * EMOTIONS.length)];

    return {
      id: r.id,
      ticker: r.trade.ticker,
      side: r.trade.side,
      entryPrice,
      exitPrice,
      quantity: r.trade.quantity,
      realizedPnL: r.trade.realizedPnL,
      pnlPct,
      durationMs: r.durationMs,
      timestamp: r.trade.timestamp,
      processScore,
      outcomeScore,
      grade,
      category,
      mfe: mfeRaw,
      mae,
      efficiency,
      hour,
      dow,
      conditionLabel,
      emotionLabel,
      emotionScore: EMOTION_SCORES[emotionLabel],
    };
  });
}

// ── Improvement targets (seeded) ─────────────────────────────────────────────

function buildImprovementTargets(trades: GradedTrade[]): ImprovementTarget[] {
  const rng = mulberry32(2718 + 1);

  // Generate 30 days of simulated progress
  function progressSeries(start: number, end: number): number[] {
    const pts: number[] = [];
    let v = start;
    for (let i = 0; i < 30; i++) {
      v = v + (end - start) / 30 + (rng() - 0.5) * 5;
      v = Math.max(0, Math.min(100, v));
      pts.push(v);
    }
    return pts;
  }

  // Compute real stats
  const winners = trades.filter((t) => t.realizedPnL > 0);
  const losers = trades.filter((t) => t.realizedPnL < 0);

  const avgWinDur = winners.length > 0
    ? winners.reduce((s, t) => s + t.durationMs, 0) / winners.length
    : 1;
  const avgLossDur = losers.length > 0
    ? losers.reduce((s, t) => s + t.durationMs, 0) / losers.length
    : 1;
  const holdRatio = avgLossDur / avgWinDur;

  const earlyTrades = trades.filter((t) => t.hour < 10);
  const earlyAvgPnL = earlyTrades.length > 0
    ? earlyTrades.reduce((s, t) => s + t.pnlPct, 0) / earlyTrades.length
    : 0;

  const fridayTrades = trades.filter((t) => t.dow === 5);
  const fridayWinRate = fridayTrades.length > 0
    ? (fridayTrades.filter((t) => t.realizedPnL > 0).length / fridayTrades.length) * 100
    : 45;
  const overallWinRate =
    trades.length > 0
      ? (trades.filter((t) => t.realizedPnL > 0).length / trades.length) * 100
      : 55;
  const fridayGap = overallWinRate - fridayWinRate;

  return [
    {
      id: "cut-losers",
      title: "Cut Losers Earlier",
      description: `Avg losing trade held ${holdRatio.toFixed(1)}× longer than winners`,
      currentMetric: `${holdRatio.toFixed(1)}× ratio`,
      goalMetric: "< 1.5× ratio",
      color: "text-red-400",
      actionItems: [
        "Set a hard stop at 2× ATR below entry before entering",
        "Review exit rules: if down >2%, exit immediately",
        "Use time-based stop: max 4h in any losing position",
      ],
      progress: progressSeries(30, 60),
    },
    {
      id: "morning-size",
      title: "Size Down Pre-10am",
      description: `Pre-10am trades underperform by ${Math.abs(earlyAvgPnL).toFixed(1)}% on average`,
      currentMetric: `${earlyAvgPnL.toFixed(1)}% avg P&L`,
      goalMetric: "> 0.5% avg",
      color: "text-amber-400",
      actionItems: [
        "Halve position size for first 30 min after open",
        "Wait for first 15-min candle to close before entering",
        "No entries before 9:45am unless high-conviction setup",
      ],
      progress: progressSeries(25, 55),
    },
    {
      id: "friday-avoid",
      title: "Avoid Friday Trading",
      description: `Win rate drops ${Math.abs(fridayGap).toFixed(0)}% on Fridays vs rest of week`,
      currentMetric: `${fridayWinRate.toFixed(0)}% Friday win rate`,
      goalMetric: `> ${(overallWinRate - 5).toFixed(0)}% or skip`,
      color: "text-orange-400",
      actionItems: [
        "Only take A-grade setups on Fridays",
        "Cut position size by 50% on Fridays",
        "Consider trading-free Fridays as a rule",
      ],
      progress: progressSeries(20, 50),
    },
  ];
}

// ── Emotional check state ─────────────────────────────────────────────────────

interface EmotionalEntry {
  confidence: number;
  focus: number;
  emotion: EmotionState;
  clarity: number;
  postNotes: string;
  lesson: string;
  emotionAfter: EmotionState;
}

const DEFAULT_EMOTIONAL: EmotionalEntry = {
  confidence: 3,
  focus: 3,
  emotion: "calm",
  clarity: 3,
  postNotes: "",
  lesson: "",
  emotionAfter: "calm",
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  rows: TradeRow[];
}

// ── Main Component ────────────────────────────────────────────────────────────

export function TradeReviewEngine({ rows }: Props) {
  const [activeSection, setActiveSection] = useState<
    "grades" | "reconstruction" | "patterns" | "emotional" | "targets"
  >("grades");
  const [selectedTradeIdx, setSelectedTradeIdx] = useState<number>(0);
  const [emotionalEntry, setEmotionalEntry] = useState<EmotionalEntry>(DEFAULT_EMOTIONAL);
  const [submittedEmotion, setSubmittedEmotion] = useState(false);
  const [expandedTarget, setExpandedTarget] = useState<string | null>(null);

  const trades = useMemo<GradedTrade[]>(() => {
    if (rows.length >= 5) return realRowsToGraded(rows, 2718);
    return generateSyntheticTrades(2718);
  }, [rows]);

  const selectedTrade = trades[selectedTradeIdx] ?? trades[0];

  const avgProcess = useMemo(
    () => trades.reduce((s, t) => s + t.processScore, 0) / Math.max(trades.length, 1),
    [trades],
  );
  const avgOutcome = useMemo(
    () => trades.reduce((s, t) => s + t.outcomeScore, 0) / Math.max(trades.length, 1),
    [trades],
  );
  const consistencyScore = useMemo(() => {
    const scores = trades.map((t) => t.processScore);
    const mean = scores.reduce((a, b) => a + b, 0) / Math.max(scores.length, 1);
    const variance = scores.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / Math.max(scores.length, 1);
    return Math.max(0, 100 - Math.sqrt(variance));
  }, [trades]);

  const improvements = useMemo(() => buildImprovementTargets(trades), [trades]);

  // Rolling 20-trade win rate
  const rollingWinRate = useMemo(() => {
    const wins = trades.map((t) => t.realizedPnL > 0 ? 1 : 0);
    const rates: number[] = [];
    for (let i = 0; i < wins.length; i++) {
      const window = wins.slice(0, i + 1);
      rates.push((window.reduce((a, b) => a + b, 0) / window.length) * 100);
    }
    return rates;
  }, [trades]);

  const isSynthetic = rows.length < 5;

  const SECTIONS = [
    { id: "grades" as const,         label: "Grade Engine",    icon: <Target className="h-3 w-3" /> },
    { id: "reconstruction" as const, label: "Reconstruction",  icon: <TrendingUp className="h-3 w-3" /> },
    { id: "patterns" as const,       label: "Patterns",        icon: <BarChart2 className="h-3 w-3" /> },
    { id: "emotional" as const,      label: "Emotional",       icon: <Smile className="h-3 w-3" /> },
    { id: "targets" as const,        label: "Targets",         icon: <Zap className="h-3 w-3" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Synthetic data notice */}
      {isSynthetic && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Showing demo data (seed 2718) — make at least 5 real trades to see your actual analysis.
          </span>
        </div>
      )}

      {/* Section nav */}
      <div className="flex flex-wrap items-center gap-1">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              activeSection === s.id
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Section 1: Grade Engine ── */}
      {activeSection === "grades" && (
        <GradeEngineSection
          trades={trades}
          avgProcess={avgProcess}
          avgOutcome={avgOutcome}
          consistencyScore={consistencyScore}
          rollingWinRate={rollingWinRate}
        />
      )}

      {/* ── Section 2: Trade Reconstruction ── */}
      {activeSection === "reconstruction" && (
        <ReconstructionSection
          trades={trades}
          selectedIdx={selectedTradeIdx}
          onSelect={setSelectedTradeIdx}
          selectedTrade={selectedTrade}
        />
      )}

      {/* ── Section 3: Pattern Recognition ── */}
      {activeSection === "patterns" && (
        <PatternSection trades={trades} />
      )}

      {/* ── Section 4: Emotional Journal ── */}
      {activeSection === "emotional" && (
        <EmotionalSection
          trades={trades}
          entry={emotionalEntry}
          onChange={setEmotionalEntry}
          submitted={submittedEmotion}
          onSubmit={() => setSubmittedEmotion(true)}
        />
      )}

      {/* ── Section 5: Improvement Targets ── */}
      {activeSection === "targets" && (
        <TargetsSection
          targets={improvements}
          trades={trades}
          rollingWinRate={rollingWinRate}
          expandedId={expandedTarget}
          onToggle={(id) => setExpandedTarget((p) => (p === id ? null : id))}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section 1 — Grade Engine
// ═══════════════════════════════════════════════════════════════════════════════

function GradeEngineSection({
  trades,
  avgProcess,
  avgOutcome,
  consistencyScore,
  rollingWinRate,
}: {
  trades: GradedTrade[];
  avgProcess: number;
  avgOutcome: number;
  consistencyScore: number;
  rollingWinRate: number[];
}) {
  const lucky = trades.filter((t) => t.category === "bad-good");
  const unlucky = trades.filter((t) => t.category === "good-bad");

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2">
        <ScoreChip label="Avg Process" value={avgProcess.toFixed(0)} max={100} color="text-blue-400" />
        <ScoreChip label="Avg Outcome" value={avgOutcome.toFixed(0)} max={100} color="text-purple-400" />
        <ScoreChip label="Consistency" value={consistencyScore.toFixed(0)} max={100} color="text-teal-400" />
      </div>

      {/* Scatter plot */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-1 text-xs font-semibold">Process vs Outcome Scatter</p>
        <p className="mb-3 text-[10px] text-muted-foreground">
          Ideal trades: top-right. Lucky: top-left. Unlucky: bottom-right.
        </p>
        <ProcessOutcomeScatter trades={trades} />
        {/* Quadrant legend */}
        <div className="mt-3 grid grid-cols-2 gap-1 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-green-400" />
            <span className="text-muted-foreground">Good Process + Good Outcome</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="text-muted-foreground">Bad Process + Good Outcome (Lucky)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-blue-400" />
            <span className="text-muted-foreground">Good Process + Bad Outcome (Unlucky)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-red-400" />
            <span className="text-muted-foreground">Bad Process + Bad Outcome</span>
          </div>
        </div>
      </div>

      {/* Lucky / Unlucky callouts */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5" />
            Lucky Trades ({lucky.length})
          </div>
          <p className="text-[10px] text-amber-200/70">
            Good outcome from bad process. Don&apos;t repeat these — luck runs out.
          </p>
          {lucky.slice(0, 3).map((t) => (
            <div key={t.id} className="text-[10px] text-amber-300 font-medium">
              {t.ticker} +{t.pnlPct.toFixed(1)}% (process: {t.processScore})
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-300">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Unlucky Trades ({unlucky.length})
          </div>
          <p className="text-[10px] text-blue-200/70">
            Good process, bad outcome. Stay the course — edge shows over time.
          </p>
          {unlucky.slice(0, 3).map((t) => (
            <div key={t.id} className="text-[10px] text-blue-300 font-medium">
              {t.ticker} {t.pnlPct.toFixed(1)}% (process: {t.processScore})
            </div>
          ))}
        </div>
      </div>

      {/* Trade grade list */}
      <div className="rounded-lg border border-border bg-card p-3">
        <p className="mb-3 text-xs font-semibold">All Trade Grades</p>
        <div className="space-y-1.5">
          {trades.map((t, i) => (
            <div key={t.id} className="flex items-center gap-2 text-[11px]">
              <span className="w-4 text-right tabular-nums text-muted-foreground/50">{i + 1}</span>
              <span className="w-10 font-semibold text-foreground/80">{t.ticker}</span>
              <span className={cn("w-6 rounded px-1 text-center font-bold text-[10px]", GRADE_COLORS[t.grade], GRADE_BG[t.grade])}>
                {t.grade}
              </span>
              <div className="flex-1">
                <div className="flex gap-1">
                  <div className="h-1.5 rounded-full bg-blue-400/40" style={{ width: `${t.processScore * 0.6}%` }} title={`Process: ${t.processScore}`} />
                </div>
                <div className="flex gap-1 mt-0.5">
                  <div className={cn("h-1.5 rounded-full", t.outcomeScore >= 50 ? "bg-green-400/60" : "bg-red-400/50")} style={{ width: `${t.outcomeScore * 0.6}%` }} />
                </div>
              </div>
              <span className={cn("w-16 text-right tabular-nums font-medium", t.realizedPnL >= 0 ? "text-green-400" : "text-red-400")}>
                {t.realizedPnL >= 0 ? "+" : ""}{formatCurrency(t.realizedPnL)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-3 text-[9px] text-muted-foreground/50">
          <div className="flex items-center gap-1"><div className="h-1.5 w-4 rounded-full bg-blue-400/40" /> Process</div>
          <div className="flex items-center gap-1"><div className="h-1.5 w-4 rounded-full bg-green-400/60" /> Outcome</div>
        </div>
      </div>
    </div>
  );
}

// ── Process vs Outcome SVG Scatter ────────────────────────────────────────────

function ProcessOutcomeScatter({ trades }: { trades: GradedTrade[] }) {
  const W = 320;
  const H = 200;
  const PAD = 30;
  const IW = W - PAD * 2;
  const IH = H - PAD * 2;

  const CATEGORY_COLORS: Record<GradedTrade["category"], string> = {
    "good-good": "#4ade80",
    "good-bad":  "#60a5fa",
    "bad-good":  "#fbbf24",
    "bad-bad":   "#f87171",
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 200 }}>
      {/* Quadrant shading */}
      <rect x={PAD} y={PAD} width={IW / 2} height={IH / 2} fill="rgba(248,113,113,0.05)" />
      <rect x={PAD + IW / 2} y={PAD} width={IW / 2} height={IH / 2} fill="rgba(251,191,36,0.05)" />
      <rect x={PAD} y={PAD + IH / 2} width={IW / 2} height={IH / 2} fill="rgba(96,165,250,0.05)" />
      <rect x={PAD + IW / 2} y={PAD + IH / 2} width={IW / 2} height={IH / 2} fill="rgba(74,222,128,0.06)" />

      {/* Center dividers */}
      <line x1={PAD + IW / 2} y1={PAD} x2={PAD + IW / 2} y2={PAD + IH} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
      <line x1={PAD} y1={PAD + IH / 2} x2={PAD + IW} y2={PAD + IH / 2} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />

      {/* Axes */}
      <line x1={PAD} y1={PAD + IH} x2={PAD + IW} y2={PAD + IH} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
      <line x1={PAD} y1={PAD} x2={PAD} y2={PAD + IH} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />

      {/* Axis labels */}
      <text x={PAD + IW / 2} y={H - 4} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)">
        Process Score →
      </text>
      <text x={10} y={PAD + IH / 2} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)" transform={`rotate(-90, 10, ${PAD + IH / 2})`}>
        Outcome →
      </text>

      {/* Dots */}
      {trades.map((t) => {
        const cx = PAD + (t.processScore / 100) * IW;
        const cy = PAD + IH - (t.outcomeScore / 100) * IH;
        const color = CATEGORY_COLORS[t.category];
        return (
          <circle
            key={t.id}
            cx={cx}
            cy={cy}
            r={4}
            fill={color}
            fillOpacity={0.75}
            stroke={color}
            strokeWidth={1}
          />
        );
      })}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section 2 — Trade Reconstruction
// ═══════════════════════════════════════════════════════════════════════════════

function ReconstructionSection({
  trades,
  selectedIdx,
  onSelect,
  selectedTrade,
}: {
  trades: GradedTrade[];
  selectedIdx: number;
  onSelect: (i: number) => void;
  selectedTrade: GradedTrade;
}) {
  return (
    <div className="space-y-4">
      {/* Trade picker */}
      <div className="rounded-lg border border-border bg-card p-3">
        <p className="mb-2 text-xs font-semibold">Select Trade</p>
        <div className="flex flex-wrap gap-1.5">
          {trades.map((t, i) => (
            <button
              key={t.id}
              onClick={() => onSelect(i)}
              className={cn(
                "rounded px-2 py-1 text-[10px] font-medium border transition-colors",
                i === selectedIdx
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              <span className={GRADE_COLORS[t.grade]}>{t.grade}</span> {t.ticker}
            </button>
          ))}
        </div>
      </div>

      {/* Mini chart: entry, MFE, MAE, exit */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-1 text-xs font-semibold">
          {selectedTrade.ticker} — Trade Timeline
        </p>
        <p className="mb-3 text-[10px] text-muted-foreground">
          Entry {formatCurrency(selectedTrade.entryPrice)} → Exit {formatCurrency(selectedTrade.exitPrice)}
        </p>
        <TradeTimelineSVG trade={selectedTrade} />
        {/* Excursion stats */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">MAE</p>
            <p className="text-sm font-bold text-red-400">{selectedTrade.mae.toFixed(2)}%</p>
            <p className="text-[9px] text-muted-foreground">Worst unrealized</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">MFE</p>
            <p className="text-sm font-bold text-green-400">+{selectedTrade.mfe.toFixed(2)}%</p>
            <p className="text-[9px] text-muted-foreground">Best unrealized</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Efficiency</p>
            <p className={cn("text-sm font-bold", selectedTrade.efficiency >= 70 ? "text-green-400" : selectedTrade.efficiency >= 40 ? "text-amber-400" : "text-red-400")}>
              {selectedTrade.efficiency.toFixed(0)}%
            </p>
            <p className="text-[9px] text-muted-foreground">Profit captured</p>
          </div>
        </div>
        {selectedTrade.efficiency < 50 && selectedTrade.realizedPnL > 0 && (
          <p className="mt-2 text-[10px] text-amber-400">
            You captured only {selectedTrade.efficiency.toFixed(0)}% of available profit — consider trailing stops.
          </p>
        )}
        {selectedTrade.realizedPnL < 0 && Math.abs(selectedTrade.pnlPct) > Math.abs(selectedTrade.mae) * 0.7 && (
          <p className="mt-2 text-[10px] text-red-400">
            Loss exceeded your typical MAE — this position could have been cut earlier.
          </p>
        )}
      </div>

      {/* MFE/MAE Scatter */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-1 text-xs font-semibold">MFE vs MAE Scatter (All Trades)</p>
        <p className="mb-3 text-[10px] text-muted-foreground">
          Dots near top-left: exiting too early. Dots near bottom-right: holding losers too long.
        </p>
        <MfeMaeScatter trades={trades} selectedId={selectedTrade.id} />
      </div>
    </div>
  );
}

// ── Trade Timeline SVG ────────────────────────────────────────────────────────

function TradeTimelineSVG({ trade }: { trade: GradedTrade }) {
  const W = 400;
  const H = 120;
  const PAD = { top: 15, right: 20, bottom: 20, left: 20 };
  const IW = W - PAD.left - PAD.right;
  const IH = H - PAD.top - PAD.bottom;

  // Price range: entry, exit, MFE price, MAE price
  const mfePrice = trade.entryPrice * (1 + trade.mfe / 100);
  const maePrice = trade.entryPrice * (1 + trade.mae / 100);
  const exitPrice = trade.exitPrice;

  const minP = Math.min(maePrice, exitPrice, trade.entryPrice) * 0.998;
  const maxP = Math.max(mfePrice, exitPrice, trade.entryPrice) * 1.002;
  const range = maxP - minP || 1;

  function yForPrice(p: number) {
    return PAD.top + IH - ((p - minP) / range) * IH;
  }

  // Simulated price path: entry → dip to MAE → rise to MFE → exit
  const pts: [number, number][] = [
    [0, trade.entryPrice],
    [0.25, maePrice],
    [0.65, mfePrice],
    [1.0, exitPrice],
  ];

  const pathD = pts
    .map(([t, p], i) => {
      const x = PAD.left + t * IW;
      const y = yForPrice(p);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(" ");

  const isProfit = exitPrice >= trade.entryPrice;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 120 }}>
      {/* Price path */}
      <path d={pathD} fill="none" stroke={isProfit ? "#4ade80" : "#f87171"} strokeWidth={1.5} />

      {/* Entry marker */}
      <circle cx={PAD.left} cy={yForPrice(trade.entryPrice)} r={4} fill="#a78bfa" />
      <text x={PAD.left + 5} y={yForPrice(trade.entryPrice) - 4} fontSize="8" fill="#a78bfa">Entry</text>

      {/* MAE marker */}
      <circle cx={PAD.left + 0.25 * IW} cy={yForPrice(maePrice)} r={3} fill="#f87171" />
      <text x={PAD.left + 0.25 * IW + 4} y={yForPrice(maePrice) + 4} fontSize="8" fill="#f87171">MAE {trade.mae.toFixed(1)}%</text>

      {/* MFE marker */}
      <circle cx={PAD.left + 0.65 * IW} cy={yForPrice(mfePrice)} r={3} fill="#4ade80" />
      <text x={PAD.left + 0.65 * IW + 4} y={yForPrice(mfePrice) - 4} fontSize="8" fill="#4ade80">MFE +{trade.mfe.toFixed(1)}%</text>

      {/* Exit marker */}
      <circle cx={PAD.left + IW} cy={yForPrice(exitPrice)} r={4} fill={isProfit ? "#4ade80" : "#f87171"} />
      <text x={PAD.left + IW - 20} y={yForPrice(exitPrice) - 4} fontSize="8" fill={isProfit ? "#4ade80" : "#f87171"}>Exit</text>

      {/* Entry horizontal reference */}
      <line x1={PAD.left} y1={yForPrice(trade.entryPrice)} x2={PAD.left + IW} y2={yForPrice(trade.entryPrice)}
        stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray="3,3" />
    </svg>
  );
}

// ── MFE vs MAE Scatter ────────────────────────────────────────────────────────

function MfeMaeScatter({ trades, selectedId }: { trades: GradedTrade[]; selectedId: string }) {
  const W = 320;
  const H = 200;
  const PAD = 30;
  const IW = W - PAD * 2;
  const IH = H - PAD * 2;

  const maxMfe = Math.max(...trades.map((t) => t.mfe), 1);
  const maxMae = Math.max(...trades.map((t) => Math.abs(t.mae)), 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 200 }}>
      {/* Axes */}
      <line x1={PAD} y1={PAD} x2={PAD} y2={PAD + IH} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
      <line x1={PAD} y1={PAD + IH} x2={PAD + IW} y2={PAD + IH} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
      <text x={PAD + IW / 2} y={H - 4} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)">MAE (loss magnitude) →</text>
      <text x={10} y={PAD + IH / 2} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)" transform={`rotate(-90, 10, ${PAD + IH / 2})`}>MFE →</text>

      {/* 45-degree guide */}
      <line x1={PAD} y1={PAD + IH} x2={PAD + IW} y2={PAD} stroke="rgba(255,255,255,0.07)" strokeWidth={1} strokeDasharray="4,4" />

      {trades.map((t) => {
        const cx = PAD + (Math.abs(t.mae) / maxMae) * IW;
        const cy = PAD + IH - (t.mfe / maxMfe) * IH;
        const isSelected = t.id === selectedId;
        const isWinner = t.realizedPnL >= 0;
        return (
          <circle
            key={t.id}
            cx={cx}
            cy={cy}
            r={isSelected ? 6 : 4}
            fill={isWinner ? "#4ade80" : "#f87171"}
            fillOpacity={isSelected ? 1 : 0.65}
            stroke={isSelected ? "#fff" : "none"}
            strokeWidth={isSelected ? 1.5 : 0}
          />
        );
      })}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section 3 — Pattern Recognition
// ═══════════════════════════════════════════════════════════════════════════════

function PatternSection({ trades }: { trades: GradedTrade[] }) {
  // Hour performance
  const hourStats = useMemo(() => {
    const map = new Map<number, { sum: number; count: number }>();
    for (let h = 9; h <= 15; h++) map.set(h, { sum: 0, count: 0 });
    for (const t of trades) {
      const h = Math.min(15, Math.max(9, t.hour));
      const s = map.get(h)!;
      s.sum += t.pnlPct;
      s.count++;
    }
    return Array.from(map.entries()).map(([hour, { sum, count }]) => ({
      hour,
      avg: count > 0 ? sum / count : 0,
      count,
    }));
  }, [trades]);

  // Day of week performance
  const dowStats = useMemo(() => {
    const map = new Map<number, { sum: number; count: number }>();
    for (let d = 1; d <= 5; d++) map.set(d, { sum: 0, count: 0 });
    for (const t of trades) {
      const d = Math.min(5, Math.max(1, t.dow));
      const s = map.get(d)!;
      s.sum += t.pnlPct;
      s.count++;
    }
    return Array.from(map.entries()).map(([dow, { sum, count }]) => ({
      dow,
      label: DOW_LABELS[dow],
      avg: count > 0 ? sum / count : 0,
      count,
    }));
  }, [trades]);

  // Duration distribution (buckets: <30m, 30-60m, 1-2h, 2-4h, >4h)
  const durationBuckets = useMemo(() => {
    const buckets = [
      { label: "<30m", min: 0, max: 30 * 60 * 1000, count: 0, winCount: 0 },
      { label: "30-60m", min: 30 * 60 * 1000, max: 60 * 60 * 1000, count: 0, winCount: 0 },
      { label: "1-2h", min: 60 * 60 * 1000, max: 2 * 60 * 60 * 1000, count: 0, winCount: 0 },
      { label: "2-4h", min: 2 * 60 * 60 * 1000, max: 4 * 60 * 60 * 1000, count: 0, winCount: 0 },
      { label: ">4h", min: 4 * 60 * 60 * 1000, max: Infinity, count: 0, winCount: 0 },
    ];
    for (const t of trades) {
      for (const b of buckets) {
        if (t.durationMs >= b.min && t.durationMs < b.max) {
          b.count++;
          if (t.realizedPnL > 0) b.winCount++;
        }
      }
    }
    return buckets;
  }, [trades]);

  // Market condition performance
  const condStats = useMemo(() => {
    const map = new Map<string, { sum: number; count: number; wins: number }>();
    for (const c of CONDITIONS) map.set(c, { sum: 0, count: 0, wins: 0 });
    for (const t of trades) {
      const s = map.get(t.conditionLabel)!;
      s.sum += t.pnlPct;
      s.count++;
      if (t.realizedPnL > 0) s.wins++;
    }
    return Array.from(map.entries()).map(([label, { sum, count, wins }]) => ({
      label,
      avg: count > 0 ? sum / count : 0,
      winRate: count > 0 ? (wins / count) * 100 : 0,
      count,
    }));
  }, [trades]);

  // Insights
  const bestHour = hourStats.reduce((a, b) => (b.avg > a.avg ? b : a), hourStats[0]);
  const worstDow = dowStats.reduce((a, b) => (b.avg < a.avg ? b : a), dowStats[0]);
  const bestDow = dowStats.reduce((a, b) => (b.avg > a.avg ? b : a), dowStats[0]);
  const bestDuration = durationBuckets.reduce((a, b) => (b.count > 0 && b.winCount / b.count > a.winCount / Math.max(a.count, 1) ? b : a), durationBuckets[0]);

  const maxHourAbs = Math.max(...hourStats.map((h) => Math.abs(h.avg)), 0.1);
  const maxDowAbs = Math.max(...dowStats.map((d) => Math.abs(d.avg)), 0.1);
  const maxDurCount = Math.max(...durationBuckets.map((b) => b.count), 1);

  return (
    <div className="space-y-4">
      {/* Insight cards */}
      <div className="space-y-2">
        {[
          {
            text: `Best trading hour: ${bestHour.hour}:00 — avg ${bestHour.avg >= 0 ? "+" : ""}${bestHour.avg.toFixed(2)}%`,
            icon: <TrendingUp className="h-3.5 w-3.5 text-green-400 shrink-0" />,
          },
          {
            text: `${worstDow.label} is your worst day — avg ${worstDow.avg >= 0 ? "+" : ""}${worstDow.avg.toFixed(2)}%`,
            icon: <TrendingDown className="h-3.5 w-3.5 text-red-400 shrink-0" />,
          },
          {
            text: `Best win rate in ${bestDuration.label} trades (${bestDuration.count > 0 ? ((bestDuration.winCount / bestDuration.count) * 100).toFixed(0) : 0}%)`,
            icon: <Clock className="h-3.5 w-3.5 text-blue-400 shrink-0" />,
          },
          {
            text: `${bestDow.label} is your best day — avg ${bestDow.avg >= 0 ? "+" : ""}${bestDow.avg.toFixed(2)}%`,
            icon: <Calendar className="h-3.5 w-3.5 text-teal-400 shrink-0" />,
          },
        ].map((ins, i) => (
          <div key={i} className="flex items-start gap-2 rounded-md border border-border bg-card/60 p-2.5 text-xs">
            {ins.icon}
            <span className="text-muted-foreground">{ins.text}</span>
          </div>
        ))}
      </div>

      {/* Hour-of-day bar chart */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-3 text-xs font-semibold">Time of Day Performance (Avg P&L %)</p>
        <HourBarChart stats={hourStats} maxAbs={maxHourAbs} />
      </div>

      {/* Day of week bar chart */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-3 text-xs font-semibold">Day of Week Performance (Avg P&L %)</p>
        <DowBarChart stats={dowStats} maxAbs={maxDowAbs} />
      </div>

      {/* Trade duration distribution */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-3 text-xs font-semibold">Trade Duration Distribution</p>
        <div className="flex items-end gap-2 h-20">
          {durationBuckets.map((b) => {
            const pct = (b.count / maxDurCount) * 100;
            const wr = b.count > 0 ? (b.winCount / b.count) * 100 : 0;
            return (
              <div key={b.label} className="flex flex-1 flex-col items-center gap-1 h-full justify-end">
                <span className="text-[9px] text-muted-foreground tabular-nums">{b.count}</span>
                <div
                  className="w-full rounded-sm transition-all"
                  style={{
                    height: `${Math.max(pct > 0 ? 6 : 0, pct * 0.65)}px`,
                    background: `linear-gradient(to top, rgba(74,222,128,${wr / 100}), rgba(96,165,250,0.3))`,
                  }}
                />
                <span className="text-[9px] text-muted-foreground">{b.label}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-1 text-[9px] text-muted-foreground/50">Bar height = trade count. Color = win rate.</p>
      </div>

      {/* Market condition performance */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-3 text-xs font-semibold">Market Condition Performance</p>
        <div className="space-y-2">
          {condStats.map((c) => (
            <div key={c.label} className="flex items-center gap-3">
              <span className="w-16 text-[11px] capitalize font-medium text-foreground/80">{c.label}</span>
              <div className="flex-1 h-4 rounded bg-muted/20 overflow-hidden">
                <div
                  className={cn("h-full rounded transition-all", c.avg >= 0 ? "bg-green-500/50" : "bg-red-500/40")}
                  style={{ width: `${Math.min(100, Math.abs(c.avg) / 5 * 100)}%` }}
                />
              </div>
              <span className={cn("w-14 text-right text-[10px] font-medium tabular-nums", c.avg >= 0 ? "text-green-400" : "text-red-400")}>
                {c.avg >= 0 ? "+" : ""}{c.avg.toFixed(2)}%
              </span>
              <span className="w-10 text-right text-[10px] text-muted-foreground tabular-nums">{c.winRate.toFixed(0)}%W</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Hour Bar Chart SVG ────────────────────────────────────────────────────────

function HourBarChart({ stats, maxAbs }: { stats: { hour: number; avg: number; count: number }[]; maxAbs: number }) {
  const H = 80;
  const W = 320;
  const BAR_W = Math.floor(W / stats.length) - 2;
  const ZERO_Y = H / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 80 }}>
      <line x1={0} y1={ZERO_Y} x2={W} y2={ZERO_Y} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
      {stats.map((s, i) => {
        const barH = maxAbs > 0 ? (Math.abs(s.avg) / maxAbs) * (H / 2 - 4) : 0;
        const isPos = s.avg >= 0;
        const x = i * (W / stats.length) + 2;
        const y = isPos ? ZERO_Y - barH : ZERO_Y;
        return (
          <g key={s.hour}>
            <rect
              x={x}
              y={y}
              width={BAR_W}
              height={Math.max(barH, 1)}
              fill={isPos ? "rgba(74,222,128,0.6)" : "rgba(248,113,113,0.55)"}
              rx={1}
            />
            <text x={x + BAR_W / 2} y={H - 1} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.4)">
              {s.hour}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Day-of-week Bar Chart SVG ─────────────────────────────────────────────────

function DowBarChart({ stats, maxAbs }: { stats: { dow: number; label: string; avg: number; count: number }[]; maxAbs: number }) {
  const H = 80;
  const W = 280;
  const BAR_W = Math.floor(W / stats.length) - 4;
  const ZERO_Y = H / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 80 }}>
      <line x1={0} y1={ZERO_Y} x2={W} y2={ZERO_Y} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
      {stats.map((s, i) => {
        const barH = maxAbs > 0 ? (Math.abs(s.avg) / maxAbs) * (H / 2 - 6) : 0;
        const isPos = s.avg >= 0;
        const x = i * (W / stats.length) + 4;
        const y = isPos ? ZERO_Y - barH : ZERO_Y;
        return (
          <g key={s.dow}>
            <rect
              x={x}
              y={y}
              width={BAR_W}
              height={Math.max(barH, 1)}
              fill={isPos ? "rgba(74,222,128,0.6)" : "rgba(248,113,113,0.55)"}
              rx={1}
            />
            <text x={x + BAR_W / 2} y={H - 1} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.4)">
              {s.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section 4 — Emotional Journal
// ═══════════════════════════════════════════════════════════════════════════════

function EmotionalSection({
  trades,
  entry,
  onChange,
  submitted,
  onSubmit,
}: {
  trades: GradedTrade[];
  entry: EmotionalEntry;
  onChange: (e: EmotionalEntry) => void;
  submitted: boolean;
  onSubmit: () => void;
}) {
  // Emotion vs outcome correlation (scatter)
  const emotionStats = useMemo(() => {
    const map = new Map<EmotionState, { sum: number; count: number; wins: number }>();
    for (const e of EMOTIONS) map.set(e, { sum: 0, count: 0, wins: 0 });
    for (const t of trades) {
      const s = map.get(t.emotionLabel)!;
      s.sum += t.pnlPct;
      s.count++;
      if (t.realizedPnL > 0) s.wins++;
    }
    return EMOTIONS.map((e) => {
      const { sum, count, wins } = map.get(e)!;
      return { emotion: e, avg: count > 0 ? sum / count : 0, winRate: count > 0 ? (wins / count) * 100 : 0, count };
    });
  }, [trades]);

  // Anxious/frustrated warning
  const recentNegative = trades.slice(-5).filter((t) => t.emotionLabel === "anxious" || t.emotionLabel === "frustrated");

  // Mood calendar (30 days, seeded)
  const moodCalendar = useMemo(() => {
    const rng2 = mulberry32(2718 + 42);
    return Array.from({ length: 30 }, (_, i) => {
      const emotion = EMOTIONS[Math.floor(rng2() * EMOTIONS.length)];
      return { day: i + 1, emotion };
    });
  }, []);

  const MOOD_BG: Record<EmotionState, string> = {
    calm: "bg-green-500/60",
    excited: "bg-amber-500/60",
    anxious: "bg-orange-500/60",
    frustrated: "bg-red-500/60",
    bored: "bg-blue-500/40",
  };

  const SliderInput = ({
    label,
    value,
    onVal,
  }: {
    label: string;
    value: number;
    onVal: (v: number) => void;
  }) => (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[11px] text-muted-foreground">{label}</label>
        <span className="text-[11px] font-bold text-foreground">{value}/5</span>
      </div>
      <input
        type="range" min={1} max={5} step={1} value={value}
        onChange={(e) => onVal(Number(e.target.value))}
        className="w-full accent-primary h-1.5"
      />
      <div className="flex justify-between text-[9px] text-muted-foreground/50 mt-0.5">
        <span>Low</span><span>High</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Warning */}
      {recentNegative.length >= 2 && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>
            <strong>Caution:</strong> {recentNegative.length} of your last 5 trades were logged under anxious or frustrated state.
            Consider stepping away before your next trade.
          </span>
        </div>
      )}

      {/* Pre-trade checklist */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <p className="text-xs font-semibold flex items-center gap-1.5">
          <Brain className="h-3.5 w-3.5 text-primary" />
          Pre-Trade Checklist
        </p>

        <SliderInput label="Confidence" value={entry.confidence} onVal={(v) => onChange({ ...entry, confidence: v })} />
        <SliderInput label="Focus" value={entry.focus} onVal={(v) => onChange({ ...entry, focus: v })} />
        <SliderInput label="Market Clarity" value={entry.clarity} onVal={(v) => onChange({ ...entry, clarity: v })} />

        <div>
          <label className="text-[11px] text-muted-foreground block mb-1">Emotional State</label>
          <div className="flex flex-wrap gap-1.5">
            {EMOTIONS.map((e) => (
              <button
                key={e}
                onClick={() => onChange({ ...entry, emotion: e })}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-medium border capitalize transition-colors",
                  entry.emotion === e
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Post-trade review */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <p className="text-xs font-semibold flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
          Post-Trade Review
        </p>

        <div>
          <label className="text-[11px] text-muted-foreground block mb-1">What happened vs expected?</label>
          <textarea
            value={entry.postNotes}
            onChange={(e) => onChange({ ...entry, postNotes: e.target.value })}
            placeholder="Price moved differently than expected because..."
            className="w-full rounded-md border border-border bg-background p-2 text-xs resize-none h-16 placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="text-[11px] text-muted-foreground block mb-1">Lesson learned</label>
          <textarea
            value={entry.lesson}
            onChange={(e) => onChange({ ...entry, lesson: e.target.value })}
            placeholder="Next time I will..."
            className="w-full rounded-md border border-border bg-background p-2 text-xs resize-none h-12 placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="text-[11px] text-muted-foreground block mb-1">Emotion after trade</label>
          <div className="flex flex-wrap gap-1.5">
            {EMOTIONS.map((e) => (
              <button
                key={e}
                onClick={() => onChange({ ...entry, emotionAfter: e })}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-medium border capitalize transition-colors",
                  entry.emotionAfter === e
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onSubmit}
          className={cn(
            "rounded-md px-4 py-1.5 text-xs font-medium transition-colors",
            submitted
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          {submitted ? "Saved" : "Save Entry"}
        </button>
      </div>

      {/* Emotion vs performance */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-3 text-xs font-semibold">Emotional State vs Performance</p>
        <div className="space-y-2">
          {emotionStats.map((s) => (
            <div key={s.emotion} className="flex items-center gap-3">
              <span className={cn("w-20 capitalize text-[11px] font-medium", EMOTION_COLORS[s.emotion])}>{s.emotion}</span>
              <div className="flex-1 h-3 rounded bg-muted/20 overflow-hidden">
                <div
                  className={cn("h-full rounded transition-all", s.avg >= 0 ? "bg-green-500/50" : "bg-red-500/40")}
                  style={{ width: `${Math.min(100, Math.abs(s.avg) * 15 + 5)}%` }}
                />
              </div>
              <span className={cn("w-14 text-right text-[10px] font-medium tabular-nums", s.avg >= 0 ? "text-green-400" : "text-red-400")}>
                {s.avg >= 0 ? "+" : ""}{s.avg.toFixed(2)}%
              </span>
              <span className="w-8 text-right text-[10px] text-muted-foreground tabular-nums">{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mood calendar */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-3 text-xs font-semibold">30-Day Mood Calendar</p>
        <div className="grid grid-cols-10 gap-1">
          {moodCalendar.map((d) => (
            <div
              key={d.day}
              title={`Day ${d.day}: ${d.emotion}`}
              className={cn("h-6 rounded-sm flex items-center justify-center text-[8px] text-white/60", MOOD_BG[d.emotion])}
            >
              {d.day}
            </div>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {EMOTIONS.map((e) => (
            <div key={e} className="flex items-center gap-1 text-[9px] text-muted-foreground">
              <div className={cn("h-2 w-2 rounded-sm", MOOD_BG[e])} />
              {e}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section 5 — Improvement Targets
// ═══════════════════════════════════════════════════════════════════════════════

function TargetsSection({
  targets,
  trades,
  rollingWinRate,
  expandedId,
  onToggle,
}: {
  targets: ImprovementTarget[];
  trades: GradedTrade[];
  rollingWinRate: number[];
  expandedId: string | null;
  onToggle: (id: string) => void;
}) {
  const [commitment, setCommitment] = useState("");
  const [savedCommitment, setSavedCommitment] = useState("");

  return (
    <div className="space-y-4">
      {/* Rolling win rate chart */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-1 text-xs font-semibold">Rolling Win Rate (Trade-by-Trade)</p>
        <p className="mb-3 text-[10px] text-muted-foreground">
          Trend shows if your consistency is improving over last {trades.length} trades.
        </p>
        <RollingWinRateChart rates={rollingWinRate} />
      </div>

      {/* Improvement targets */}
      {targets.map((t) => (
        <ImprovementCard
          key={t.id}
          target={t}
          expanded={expandedId === t.id}
          onToggle={() => onToggle(t.id)}
        />
      ))}

      {/* Accountability commitment */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <p className="text-xs font-semibold flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
          Weekly Commitment
        </p>
        <p className="text-[10px] text-muted-foreground">
          Write one specific rule you will follow in every trade next week:
        </p>
        <textarea
          value={commitment}
          onChange={(e) => setCommitment(e.target.value)}
          placeholder="e.g. I will set a hard stop at 2% below entry on every trade"
          className="w-full rounded-md border border-border bg-background p-2 text-xs resize-none h-16 placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setSavedCommitment(commitment); }}
            disabled={!commitment.trim()}
            className="rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
          >
            Commit
          </button>
          {savedCommitment && (
            <p className="text-[10px] text-green-400">
              Committed: &quot;{savedCommitment}&quot;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Rolling Win Rate Line Chart ───────────────────────────────────────────────

function RollingWinRateChart({ rates }: { rates: number[] }) {
  const W = 340;
  const H = 80;
  const PAD = { top: 8, right: 8, bottom: 18, left: 30 };
  const IW = W - PAD.left - PAD.right;
  const IH = H - PAD.top - PAD.bottom;

  if (rates.length < 2) {
    return (
      <div className="flex h-20 items-center justify-center text-[10px] text-muted-foreground">
        Not enough data
      </div>
    );
  }

  const pts = rates.map((r, i) => {
    const x = PAD.left + (i / (rates.length - 1)) * IW;
    const y = PAD.top + IH - (r / 100) * IH;
    return `${x},${y}`;
  });
  const polyline = pts.join(" ");

  const lastRate = rates[rates.length - 1];
  const trend = rates.length >= 4
    ? rates[rates.length - 1] - rates[Math.floor(rates.length / 2)]
    : 0;

  return (
    <div className="space-y-1">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 80 }}>
        {/* 50% guide line */}
        <line
          x1={PAD.left}
          y1={PAD.top + IH / 2}
          x2={PAD.left + IW}
          y2={PAD.top + IH / 2}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={1}
          strokeDasharray="3,3"
        />
        <text x={PAD.left - 2} y={PAD.top + IH / 2 + 3} textAnchor="end" fontSize="8" fill="rgba(255,255,255,0.3)">50</text>
        <text x={PAD.left - 2} y={PAD.top + 4} textAnchor="end" fontSize="8" fill="rgba(255,255,255,0.3)">100</text>
        <text x={PAD.left - 2} y={PAD.top + IH + 3} textAnchor="end" fontSize="8" fill="rgba(255,255,255,0.3)">0</text>

        {/* Axes */}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + IH} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
        <line x1={PAD.left} y1={PAD.top + IH} x2={PAD.left + IW} y2={PAD.top + IH} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />

        {/* Line */}
        <polyline
          points={polyline}
          fill="none"
          stroke={lastRate >= 50 ? "#4ade80" : "#f87171"}
          strokeWidth={1.5}
        />

        {/* End dot */}
        <circle
          cx={PAD.left + IW}
          cy={PAD.top + IH - (lastRate / 100) * IH}
          r={3}
          fill={lastRate >= 50 ? "#4ade80" : "#f87171"}
        />

        <text x={PAD.left + IW / 2} y={H - 2} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.3)">
          Trades →
        </text>
      </svg>
      <div className="flex items-center justify-between text-[10px]">
        <span className={cn("font-semibold", lastRate >= 50 ? "text-green-400" : "text-red-400")}>
          Current: {lastRate.toFixed(0)}%
        </span>
        <span className={cn(trend >= 0 ? "text-green-400" : "text-red-400")}>
          {trend >= 0 ? "+" : ""}{trend.toFixed(0)}% trend
        </span>
      </div>
    </div>
  );
}

// ── Improvement Card ──────────────────────────────────────────────────────────

function ImprovementCard({
  target,
  expanded,
  onToggle,
}: {
  target: ImprovementTarget;
  expanded: boolean;
  onToggle: () => void;
}) {
  const W = 300;
  const H = 50;
  const PAD = { left: 4, right: 4, top: 4, bottom: 14 };
  const IW = W - PAD.left - PAD.right;
  const IH = H - PAD.top - PAD.bottom;
  const maxVal = Math.max(...target.progress, 1);

  const pts = target.progress.map((v, i) => {
    const x = PAD.left + (i / (target.progress.length - 1)) * IW;
    const y = PAD.top + IH - (v / maxVal) * IH;
    return `${x},${y}`;
  });

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-3 p-4 hover:bg-muted/10 transition-colors text-left"
      >
        <div className="mt-0.5">
          <TrendingUp className={cn("h-4 w-4", target.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground">{target.title}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{target.description}</p>
          <div className="flex items-center gap-3 mt-2 text-[10px]">
            <span className="text-muted-foreground">Now: <span className={cn("font-medium", target.color)}>{target.currentMetric}</span></span>
            <span className="text-muted-foreground">Goal: <span className="font-medium text-green-400">{target.goalMetric}</span></span>
          </div>
        </div>
        <div className="shrink-0">
          {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
          {/* 30-day progress chart */}
          <div>
            <p className="mb-1.5 text-[10px] text-muted-foreground">30-Day Progress</p>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: H }}>
              <polyline points={pts.join(" ")} fill="none" stroke="rgba(99,102,241,0.8)" strokeWidth={1.5} />
              {target.progress.map((v, i) => (
                i === target.progress.length - 1 ? (
                  <circle
                    key={i}
                    cx={PAD.left + (i / (target.progress.length - 1)) * IW}
                    cy={PAD.top + IH - (v / maxVal) * IH}
                    r={3}
                    fill="#818cf8"
                  />
                ) : null
              ))}
              {/* Day labels */}
              {[0, 14, 29].map((di) => (
                <text
                  key={di}
                  x={PAD.left + (di / (target.progress.length - 1)) * IW}
                  y={H - 2}
                  textAnchor="middle"
                  fontSize="8"
                  fill="rgba(255,255,255,0.3)"
                >
                  Day {di + 1}
                </text>
              ))}
            </svg>
          </div>

          {/* Action items */}
          <div>
            <p className="mb-1.5 text-[10px] font-medium text-foreground/80">Action Items</p>
            <ul className="space-y-1">
              {target.actionItems.map((a, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                  <span className="mt-0.5 text-primary">•</span>
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Score Chip ─────────────────────────────────────────────────────────────────

function ScoreChip({ label, value, max, color }: { label: string; value: string; max: number; color: string }) {
  const pct = (parseFloat(value) / max) * 100;
  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-1.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
      <p className={cn("text-xl font-bold tabular-nums", color)}>{value}</p>
      <div className="h-1 w-full rounded-full bg-muted/30">
        <div className={cn("h-1 rounded-full transition-all", color.replace("text-", "bg-"))} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
