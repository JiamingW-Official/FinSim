"use client";

import { useState, useMemo } from "react";
import {
  Brain,
  CheckCircle2,
  Circle,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  BookOpen,
  BarChart2,
  Activity,
  Heart,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Star,
  XCircle,
  Clock,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 17;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed(seed: number) {
  s = seed;
}

// ── Types ──────────────────────────────────────────────────────────────────────

type BiasType =
  | "overconfidence"
  | "loss_aversion"
  | "anchoring"
  | "herding"
  | "recency";

interface QuizQuestion {
  id: number;
  scenario: string;
  choices: { text: string; bias: BiasType }[];
}

interface BiasResult {
  bias: BiasType;
  count: number;
  severity: "mild" | "moderate" | "strong";
  label: string;
  description: string;
  tip: string;
  color: string;
}

interface ChecklistItem {
  id: number;
  question: string;
  category: string;
}

interface JournalEntry {
  date: string;
  ticker: string;
  thesis: string;
  outcome: "win" | "loss" | "pending";
  pnl: number;
}

interface MonthData {
  month: string;
  returnPct: number;
  moodScore: number;
}

interface MistakeEntry {
  date: string;
  ticker: string;
  loss: number;
  category: "bad_thesis" | "poor_sizing" | "emotional_exit" | "premature_entry";
}

// ── Static data ────────────────────────────────────────────────────────────────

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    scenario:
      "You've done extensive research on a stock. The CEO interview you watched made a compelling case. You're about to allocate 25% of your portfolio.",
    choices: [
      { text: "25% feels right — my research is thorough", bias: "overconfidence" },
      { text: "Everyone on Reddit seems to agree, so it must be good", bias: "herding" },
      { text: "I'll hold off — what if I lose 25%?", bias: "loss_aversion" },
      { text: "The stock is near its all-time high — probably overvalued", bias: "anchoring" },
    ],
  },
  {
    id: 2,
    scenario:
      "A stock you own is down 18% from your purchase price. New data suggests the thesis may be broken.",
    choices: [
      { text: "I'll hold — it'll come back, it always does", bias: "recency" },
      { text: "I can't sell at a loss, I need to break even first", bias: "loss_aversion" },
      { text: "The original thesis is still valid despite the data", bias: "overconfidence" },
      { text: "Everyone else is holding too, so I'll wait", bias: "herding" },
    ],
  },
  {
    id: 3,
    scenario:
      "A stock you're watching ran up 40% last month. You're considering entering now.",
    choices: [
      { text: "It went up 40%, so momentum is on my side", bias: "recency" },
      { text: "Other investors are piling in, it must be worth it", bias: "herding" },
      { text: "I bought it at $50 last year — now at $90 it seems high", bias: "anchoring" },
      { text: "I've seen this pattern before — I know it'll keep going", bias: "overconfidence" },
    ],
  },
  {
    id: 4,
    scenario:
      "You see an analyst set a price target of $200 for a stock currently trading at $150.",
    choices: [
      { text: "If the analyst says $200, that's probably where it's going", bias: "herding" },
      { text: "The $200 target is now anchoring my expectations", bias: "anchoring" },
      { text: "I'm worried about downside more than excited about upside", bias: "loss_aversion" },
      { text: "I can probably predict the movement better than the analyst", bias: "overconfidence" },
    ],
  },
  {
    id: 5,
    scenario:
      "The market has been bullish for 18 months. You're feeling confident about adding leverage.",
    choices: [
      { text: "18 months of gains — it will continue", bias: "recency" },
      { text: "Most investors are adding leverage, so it's probably fine", bias: "herding" },
      { text: "I've made good calls recently — my judgment is sharp", bias: "overconfidence" },
      { text: "What if I lose money on the leveraged position?", bias: "loss_aversion" },
    ],
  },
  {
    id: 6,
    scenario:
      "You hear about a hot IPO at a cocktail party. Three friends who've made money before are excited about it.",
    choices: [
      { text: "Three smart people are in — it must be a good opportunity", bias: "herding" },
      { text: "The IPO price of $30 is the reference point for all my thinking", bias: "anchoring" },
      { text: "My friends have been right before — they'll be right again", bias: "recency" },
      { text: "I understand the business — I'll do well with this", bias: "overconfidence" },
    ],
  },
  {
    id: 7,
    scenario:
      "You made 30% last quarter using a momentum strategy. You're doubling down on the same approach.",
    choices: [
      { text: "It worked last quarter — it will work next quarter too", bias: "recency" },
      { text: "I've proven I can beat the market consistently", bias: "overconfidence" },
      { text: "Many traders follow momentum — so it's validated", bias: "herding" },
      { text: "I need to recover my previous losses before trying new strategies", bias: "loss_aversion" },
    ],
  },
  {
    id: 8,
    scenario:
      "A stock you sold at $100 is now trading at $140. You're contemplating buying back in.",
    choices: [
      { text: "I sold at $100, so $140 feels like I'm overpaying", bias: "anchoring" },
      { text: "It rose 40% since I sold — it'll keep going up", bias: "recency" },
      { text: "All the original buyers are sitting on big gains", bias: "herding" },
      { text: "I missed the initial move but I know where this is headed", bias: "overconfidence" },
    ],
  },
  {
    id: 9,
    scenario:
      "The market drops 5% in a week. You're considering selling your entire portfolio to cash.",
    choices: [
      { text: "I can't stand seeing my portfolio fall further", bias: "loss_aversion" },
      { text: "Everyone is selling — there must be something seriously wrong", bias: "herding" },
      { text: "It dropped 5% last week so it'll drop more this week", bias: "recency" },
      { text: "My read on the market is better than most — I'll time the bottom", bias: "overconfidence" },
    ],
  },
  {
    id: 10,
    scenario:
      "A biotech stock you own is up 200%. You're deciding whether to take profits.",
    choices: [
      { text: "It's already gone up so much — it can't go much higher", bias: "anchoring" },
      { text: "If I sell and it keeps going up, I'll feel terrible", bias: "loss_aversion" },
      { text: "It's been going up every week — why would it stop now?", bias: "recency" },
      { text: "My due diligence tells me this will 3x again", bias: "overconfidence" },
    ],
  },
];

const BIAS_INFO: Record<BiasType, Omit<BiasResult, "count" | "severity" | "bias">> = {
  overconfidence: {
    label: "Overconfidence",
    description:
      "You overestimate the accuracy of your forecasts and the quality of your information, leading to excessive risk-taking and under-diversification.",
    tip: "Keep a prediction journal. Record all your predictions with confidence levels, then review accuracy monthly. Most investors are right only 52–55% of the time, far below their self-assessed accuracy.",
    color: "#f97316",
  },
  loss_aversion: {
    label: "Loss Aversion",
    description:
      "Losses feel twice as painful as gains feel pleasurable. This causes holding losers too long, selling winners too early, and avoiding necessary risks.",
    tip: "Before entering a trade, pre-define your maximum acceptable loss in dollar terms, not percentage. This removes emotional recalibration and forces process-based decisions.",
    color: "#ef4444",
  },
  anchoring: {
    label: "Anchoring",
    description:
      "You rely too heavily on the first price you encountered (purchase price, 52-week high, analyst target) when making subsequent judgments.",
    tip: "Ask yourself: if you didn't own this stock, would you buy it today at the current price? The purchase price is irrelevant to future returns. Only forward prospects matter.",
    color: "#a855f7",
  },
  herding: {
    label: "Herding",
    description:
      "You follow the crowd rather than your independent analysis, creating a false sense of validation from social proof and consensus behavior.",
    tip: "Before acting on any trade idea you heard from others, write a 3-sentence thesis in your own words. If you can't, you're herding. Wait 48 hours before acting on social media tips.",
    color: "#3b82f6",
  },
  recency: {
    label: "Recency Bias",
    description:
      "You overweight recent events and extrapolate recent trends indefinitely into the future, ignoring base rates and long-term mean reversion.",
    tip: "When evaluating any trend, look up the 10-year base rate. Ask: historically, how often does a 6-month bull run continue for another 6 months? Base rates will anchor you to reality.",
    color: "#22c55e",
  },
};

const CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: 1, question: "Do I have a clear, written thesis explaining why this trade will work?", category: "Thesis" },
  { id: 2, question: "Have I identified the specific catalyst that will unlock value?", category: "Catalyst" },
  { id: 3, question: "Is my position size within my pre-defined risk parameters (≤5% for single names)?", category: "Sizing" },
  { id: 4, question: "Do I know exactly where I will exit if the trade goes against me?", category: "Exit Plan" },
  { id: 5, question: "Have I checked the earnings calendar and macro events for this week?", category: "Risk" },
  { id: 6, question: "Does this trade correlate with existing positions in my portfolio?", category: "Correlation" },
  { id: 7, question: "Have I considered the opposite view — why this trade could fail?", category: "Thesis" },
  { id: 8, question: "Is my profit target defined with a clear R:R ratio (minimum 2:1)?", category: "Exit Plan" },
  { id: 9, question: "Am I entering based on analysis, not because I fear missing out?", category: "Psychology" },
  { id: 10, question: "Would I be comfortable explaining this trade to a skeptical peer?", category: "Process" },
];

const EMOTION_CYCLE = [
  { label: "Euphoria", angle: 0, color: "#f59e0b", description: "Maximum financial risk" },
  { label: "Anxiety", angle: 51.4, color: "#f97316", description: "First signs of concern" },
  { label: "Denial", angle: 102.8, color: "#ef4444", description: "This is temporary" },
  { label: "Panic", angle: 154.2, color: "#dc2626", description: "Capitulation imminent" },
  { label: "Capitulation", angle: 205.7, color: "#991b1b", description: "Maximum financial opportunity" },
  { label: "Despondency", angle: 257.1, color: "#7c3aed", description: "No point in trying" },
  { label: "Hope", angle: 308.5, color: "#6366f1", description: "Markets improve" },
];

const TRADING_RULES = [
  { priority: 1, rule: "Never trade within 1 hour of an emotional event (anger, fear, excitement)", icon: Heart },
  { priority: 2, rule: "Reduce position size by 50% when on a 3+ trade losing streak", icon: TrendingDown },
  { priority: 3, rule: "Do not check your portfolio more than twice per day", icon: Clock },
  { priority: 4, rule: "Write the trade thesis before looking at the current price", icon: BookOpen },
  { priority: 5, rule: "If you cannot explain the trade risk clearly, do not enter it", icon: AlertTriangle },
];

const MENTAL_MODELS = [
  {
    name: "Base Rates",
    icon: "📊",
    definition: "The historical frequency of an outcome occurring in a reference class of similar situations.",
    application: "Before buying a speculative biotech, check: what % of phase-2 trials historically succeed? (about 33%).",
    example: "MRNA: check approval rates before predicting success.",
    breakdown: "Breaks down when your situation is genuinely novel (e.g., first-mover disruptor).",
  },
  {
    name: "Inversion",
    icon: "🔄",
    definition: "Think about what could go wrong rather than just what could go right.",
    application: "Instead of 'how can this stock double?', ask 'what would cause this to fall 50%?'",
    example: "For TSLA, inversion: what if EV adoption stalls and margins compress?",
    breakdown: "Over-inverting leads to never making investments — some risk is always present.",
  },
  {
    name: "Second-Order Effects",
    icon: "🌊",
    definition: "The consequences of the consequences — thinking beyond the immediate outcome.",
    application: "Rising rates hurt growth stocks directly (order 1), but also increase discount rates for all future cash flows (order 2).",
    example: "Rate hike → tech sell-off → institutional rebalancing into value.",
    breakdown: "Second-order thinking can lead to over-analysis paralysis in fast-moving markets.",
  },
  {
    name: "Margin of Safety",
    icon: "🛡️",
    definition: "Only buy assets when they trade at a significant discount to intrinsic value.",
    application: "If you estimate intrinsic value at $100, only buy at $70 or less — the 30% buffer absorbs errors.",
    example: "BRK.B: Buffett applies 20–30% MoS to every acquisition.",
    breakdown: "Can cause you to miss growth stocks that never trade at a discount.",
  },
  {
    name: "Circle of Competence",
    icon: "⭕",
    definition: "Only invest in businesses you genuinely understand — know the boundaries of your knowledge.",
    application: "If you cannot explain how a company makes money in one sentence, you're outside your circle.",
    example: "Munger's refusal to invest in most tech companies until he deeply understood them.",
    breakdown: "Can become an excuse for not expanding your knowledge base.",
  },
  {
    name: "Mr. Market",
    icon: "🎭",
    definition: "The market is a manic-depressive partner who offers prices daily — sometimes rational, often not.",
    application: "When Mr. Market is panicking, buy. When euphoric, be cautious. Ignore his mood swings.",
    example: "March 2020 crash: Mr. Market panicked. Patient investors bought AMZN, AAPL at 30–40% discounts.",
    breakdown: "Hard to apply when you are also experiencing the same emotions as Mr. Market.",
  },
  {
    name: "Moat",
    icon: "🏰",
    definition: "A durable competitive advantage that protects a company's market share and pricing power.",
    application: "Prefer businesses with switching costs, network effects, or cost advantages — they compound better.",
    example: "MSFT Azure has deep enterprise switching costs; COST has price advantage through membership model.",
    breakdown: "Technology disruption can erode moats faster than historical base rates suggest.",
  },
  {
    name: "Regression to Mean",
    icon: "📈",
    definition: "Extreme performance tends to revert toward historical averages over time.",
    application: "High P/E sectors often mean-revert; turnaround stories in beaten-down sectors can outperform.",
    example: "Energy sector: underperformed 2015–2020, mean-reverted strongly 2021–2022.",
    breakdown: "Some high-quality businesses sustain above-average returns for decades (AAPL, MSFT).",
  },
  {
    name: "Network Effects",
    icon: "🕸️",
    definition: "Each additional user adds value to all existing users, creating a compounding moat.",
    application: "Identify early network-effect businesses before they reach critical mass for exponential returns.",
    example: "META (Facebook): every new user makes the platform more valuable for existing users.",
    breakdown: "Network effects can reverse rapidly (MySpace effect) — scale doesn't guarantee permanence.",
  },
  {
    name: "Optionality",
    icon: "🎯",
    definition: "Investments that have limited downside but asymmetric upside potential through future choices.",
    application: "Small allocations to speculative ideas with large TAM; lose 1x if wrong, gain 10–50x if right.",
    example: "Early NFLX, AMZN: small positions in companies with multiple future optionalities.",
    breakdown: "Too many speculative positions dilutes returns and requires time you may not have.",
  },
  {
    name: "Kelly Criterion",
    icon: "🎲",
    definition: "Optimal position sizing formula: f* = (bp - q) / b where b=odds, p=win probability, q=loss probability.",
    application: "Use half-Kelly in practice (25% of calculated Kelly) to reduce variance while preserving growth.",
    example: "60% win rate, 2:1 payoff: Kelly = (2×0.6 - 0.4)/2 = 0.4 → invest 20% (half-Kelly).",
    breakdown: "Requires accurate probability estimates — garbage in, garbage out.",
  },
  {
    name: "Incentives",
    icon: "💰",
    definition: "People act in their own interest — follow the incentives to predict behavior.",
    application: "Align with management whose comp is tied to long-term value creation, not short-term stock price.",
    example: "CEO with 5-year vesting cliff is more aligned than one with annual cash bonuses.",
    breakdown: "Incentives don't fully explain behavior — conviction, culture, and ethics also matter.",
  },
];

// ── Synthetic data generation ──────────────────────────────────────────────────

function generateMonthlyData(): MonthData[] {
  resetSeed(42);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return months.map((m) => ({
    month: m,
    returnPct: (rand() - 0.42) * 12,
    moodScore: Math.round(rand() * 7 + 2),
  }));
}

function generateJournalEntries(): JournalEntry[] {
  resetSeed(99);
  const tickers = ["NVDA", "META", "TSLA", "AMZN", "AAPL", "MSFT", "GOOG", "AMD"];
  const theses = [
    "AI chip demand accelerating — revenue guidance raised",
    "Ad revenue recovery + cost cuts improving margins",
    "FSD regulatory approval catalyst approaching",
    "AWS margin expansion + ad business acceleration",
    "Services mix shift driving multiple expansion",
    "Azure AI workloads growing 3x YoY",
    "Search moat undervalued vs AI narrative",
    "Data center GPU share gains from NVDA",
  ];
  const outcomes: ("win" | "loss" | "pending")[] = ["win", "loss", "win", "pending", "win", "loss", "win", "pending"];
  return tickers.map((ticker, i) => ({
    date: `2026-0${Math.min(i + 1, 9)}-${String(Math.round(rand() * 20 + 5)).padStart(2, "0")}`,
    ticker,
    thesis: theses[i],
    outcome: outcomes[i],
    pnl: outcomes[i] === "win" ? rand() * 18 + 3 : outcomes[i] === "loss" ? -(rand() * 12 + 2) : 0,
  }));
}

function generateMistakes(): MistakeEntry[] {
  resetSeed(77);
  const tickers = ["RIVN", "LCID", "SPCE", "HOOD", "COIN", "BBBY"];
  const categories: MistakeEntry["category"][] = [
    "bad_thesis",
    "emotional_exit",
    "poor_sizing",
    "premature_entry",
    "bad_thesis",
    "emotional_exit",
  ];
  return tickers.map((t, i) => ({
    date: `2026-0${i + 1}-15`,
    ticker: t,
    loss: rand() * 800 + 200,
    category: categories[i],
  }));
}

// ── Radar chart (pentagon) ─────────────────────────────────────────────────────

function BiasRadarChart({ scores }: { scores: Record<BiasType, number> }) {
  const biases: BiasType[] = ["overconfidence", "loss_aversion", "anchoring", "herding", "recency"];
  const labels = ["Overconfidence", "Loss Aversion", "Anchoring", "Herding", "Recency"];
  const colors = ["#f97316", "#ef4444", "#a855f7", "#3b82f6", "#22c55e"];
  const cx = 120;
  const cy = 120;
  const r = 90;
  const levels = [0.25, 0.5, 0.75, 1.0];

  function getPoint(index: number, radius: number) {
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  }

  const gridPolygons = levels.map((lvl) => {
    const pts = biases.map((_, i) => {
      const p = getPoint(i, r * lvl);
      return `${p.x},${p.y}`;
    });
    return pts.join(" ");
  });

  const dataPoints = biases.map((b, i) => {
    const norm = Math.min(scores[b] / 3, 1);
    return getPoint(i, r * norm);
  });

  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg width={240} height={240} viewBox="0 0 240 240">
      {gridPolygons.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke="#374151"
          strokeWidth={0.8}
        />
      ))}
      {biases.map((_, i) => {
        const outer = getPoint(i, r);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={outer.x}
            y2={outer.y}
            stroke="#374151"
            strokeWidth={0.8}
          />
        );
      })}
      <polygon
        points={dataPolygon}
        fill="rgba(99,102,241,0.25)"
        stroke="#6366f1"
        strokeWidth={1.5}
      />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill={colors[i]} />
      ))}
      {biases.map((_, i) => {
        const labelPt = getPoint(i, r + 18);
        return (
          <text
            key={i}
            x={labelPt.x}
            y={labelPt.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={8}
            fill="#9ca3af"
          >
            {labels[i]}
          </text>
        );
      })}
    </svg>
  );
}

// ── Trade quality meter SVG ────────────────────────────────────────────────────

function QualityMeter({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const color =
    pct >= 80 ? "#22c55e" : pct >= 60 ? "#84cc16" : pct >= 40 ? "#eab308" : "#ef4444";
  const label =
    pct >= 80 ? "Excellent" : pct >= 60 ? "Good" : pct >= 40 ? "Fair" : "Poor";

  const circumference = 2 * Math.PI * 50;
  const dashoffset = circumference * (1 - pct / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={140} height={140} viewBox="0 0 140 140">
        <circle cx={70} cy={70} r={50} fill="none" stroke="#1f2937" strokeWidth={12} />
        <circle
          cx={70}
          cy={70}
          r={50}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
        />
        <text x={70} y={66} textAnchor="middle" fontSize={22} fontWeight="bold" fill="white">
          {score}
        </text>
        <text x={70} y={84} textAnchor="middle" fontSize={10} fill="#9ca3af">
          / 10
        </text>
      </svg>
      <span className="text-sm font-medium" style={{ color }}>{label}</span>
    </div>
  );
}

// ── Emotion cycle SVG ──────────────────────────────────────────────────────────

function EmotionCycleSVG({ currentIndex }: { currentIndex: number }) {
  const cx = 160;
  const cy = 160;
  const r = 110;

  return (
    <svg width={320} height={320} viewBox="0 0 320 320">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1f2937" strokeWidth={2} />
      {EMOTION_CYCLE.map((phase, i) => {
        const angle = (phase.angle * Math.PI) / 180;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        const labelX = cx + (r + 24) * Math.cos(angle);
        const labelY = cy + (r + 24) * Math.sin(angle);
        const isActive = i === currentIndex;
        return (
          <g key={i}>
            <circle
              cx={x}
              cy={y}
              r={isActive ? 10 : 7}
              fill={phase.color}
              opacity={isActive ? 1 : 0.5}
            />
            {isActive && (
              <circle
                cx={x}
                cy={y}
                r={16}
                fill="none"
                stroke={phase.color}
                strokeWidth={2}
                opacity={0.5}
              />
            )}
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={9}
              fill={isActive ? "white" : "#6b7280"}
              fontWeight={isActive ? "bold" : "normal"}
            >
              {phase.label}
            </text>
          </g>
        );
      })}
      <text x={cx} y={cy - 12} textAnchor="middle" fontSize={11} fill="#9ca3af">
        Market Cycle
      </text>
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize={13} fontWeight="bold" fill="white">
        {EMOTION_CYCLE[currentIndex].label}
      </text>
      <text x={cx} y={cy + 22} textAnchor="middle" fontSize={8} fill="#6b7280">
        {EMOTION_CYCLE[currentIndex].description}
      </text>
    </svg>
  );
}

// ── Scatter plot SVG ───────────────────────────────────────────────────────────

function ScatterPlot({
  data,
  xLabel,
  yLabel,
  xKey,
  yKey,
}: {
  data: Record<string, number>[];
  xLabel: string;
  yLabel: string;
  xKey: string;
  yKey: string;
}) {
  const w = 280;
  const h = 180;
  const pad = { top: 10, right: 10, bottom: 30, left: 36 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;

  const xs = data.map((d) => d[xKey]);
  const ys = data.map((d) => d[yKey]);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);

  const toX = (v: number) => pad.left + ((v - xMin) / (xMax - xMin || 1)) * innerW;
  const toY = (v: number) => pad.top + innerH - ((v - yMin) / (yMax - yMin || 1)) * innerH;

  // simple linear regression
  const n = data.length;
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = ys.reduce((a, b) => a + b, 0) / n;
  const slope =
    xs.reduce((acc, x, i) => acc + (x - xMean) * (ys[i] - yMean), 0) /
    (xs.reduce((acc, x) => acc + (x - xMean) ** 2, 0) || 1);
  const intercept = yMean - slope * xMean;

  const lineX1 = xMin;
  const lineY1 = slope * lineX1 + intercept;
  const lineX2 = xMax;
  const lineY2 = slope * lineX2 + intercept;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {/* axes */}
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + innerH} stroke="#374151" strokeWidth={1} />
      <line x1={pad.left} y1={pad.top + innerH} x2={pad.left + innerW} y2={pad.top + innerH} stroke="#374151" strokeWidth={1} />
      {/* trend line */}
      <line
        x1={toX(lineX1)}
        y1={toY(lineY1)}
        x2={toX(lineX2)}
        y2={toY(lineY2)}
        stroke="#6366f1"
        strokeWidth={1.5}
        strokeDasharray="4 2"
        opacity={0.7}
      />
      {/* points */}
      {data.map((d, i) => (
        <circle key={i} cx={toX(d[xKey])} cy={toY(d[yKey])} r={4} fill="#6366f1" opacity={0.7} />
      ))}
      {/* axis labels */}
      <text x={pad.left + innerW / 2} y={h - 2} textAnchor="middle" fontSize={8} fill="#6b7280">
        {xLabel}
      </text>
      <text
        x={10}
        y={pad.top + innerH / 2}
        textAnchor="middle"
        fontSize={8}
        fill="#6b7280"
        transform={`rotate(-90, 10, ${pad.top + innerH / 2})`}
      >
        {yLabel}
      </text>
    </svg>
  );
}

// ── Process-outcome matrix ─────────────────────────────────────────────────────

const MATRIX_QUADRANTS = [
  {
    process: "Good",
    outcome: "Good",
    label: "Deserved Success",
    sublabel: "Skill was the primary driver",
    color: "#22c55e",
    bg: "bg-green-950/40",
    border: "border-green-800/40",
    icon: Star,
    description:
      "Good process + good outcome is skill-driven. Maintain the process. Over 30+ trades, this is the signal you want to repeat.",
  },
  {
    process: "Good",
    outcome: "Bad",
    label: "Bad Break",
    sublabel: "Right decision, bad luck",
    color: "#3b82f6",
    bg: "bg-muted/50",
    border: "border-border",
    icon: RefreshCw,
    description:
      "Good process + bad outcome happens regularly even to professionals. Do NOT change your process based on a single bad outcome. Evaluate over 20+ samples.",
  },
  {
    process: "Bad",
    outcome: "Good",
    label: "Dumb Luck",
    sublabel: "Dangerous pattern",
    color: "#f97316",
    bg: "bg-orange-950/40",
    border: "border-orange-800/40",
    icon: AlertTriangle,
    description:
      "Bad process + good outcome is the most dangerous quadrant. It reinforces bad habits. You will pay later when the same luck doesn't repeat.",
  },
  {
    process: "Bad",
    outcome: "Bad",
    label: "Obvious Fix",
    sublabel: "Process and execution both failed",
    color: "#ef4444",
    bg: "bg-red-950/40",
    border: "border-red-800/40",
    icon: XCircle,
    description:
      "Bad process + bad outcome. The root cause is clear. Identify whether the process failure was a knowledge gap, discipline failure, or external factor.",
  },
];

// ── 90-day improvement plan ────────────────────────────────────────────────────

const IMPROVEMENT_AREAS = [
  {
    focus: "Position Sizing Discipline",
    weeks: [
      "Read 'The Kelly Criterion in Blackjack, Sports Betting and the Stock Market'",
      "Back-calculate optimal size for last 10 trades using Kelly formula",
      "Implement a pre-trade sizing checklist — never deviate without justification",
      "Review all sized positions vs outcomes — measure improvement",
    ],
  },
  {
    focus: "Thesis Documentation",
    weeks: [
      "Set up a trade journal template with required fields (thesis, catalyst, exit)",
      "Write 3-sentence thesis for every existing position",
      "Do not enter any new trade without a written thesis first",
      "Review rejected trade ideas to evaluate missed opportunities vs avoided losses",
    ],
  },
  {
    focus: "Emotional Regulation",
    weeks: [
      "Define personal 'circuit breakers': conditions to stop trading for 24 hours",
      "Track emotion score (1–10) before every trade decision",
      "Correlate emotion scores with trade outcomes at week end",
      "Build 3 personal rules based on emotion pattern findings",
    ],
  },
];

// ── Tab 1: Bias Assessment ─────────────────────────────────────────────────────

function BiasAssessment() {
  const [answers, setAnswers] = useState<Record<number, BiasType>>({});
  const [submitted, setSubmitted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  const totalAnswered = Object.keys(answers).length;

  const results = useMemo<BiasResult[]>(() => {
    if (!submitted) return [];
    const counts: Record<BiasType, number> = {
      overconfidence: 0,
      loss_aversion: 0,
      anchoring: 0,
      herding: 0,
      recency: 0,
    };
    Object.values(answers).forEach((b) => {
      counts[b]++;
    });
    return (Object.keys(counts) as BiasType[])
      .map((b) => ({
        bias: b,
        count: counts[b],
        severity:
          (counts[b] >= 4 ? "strong" : counts[b] >= 2 ? "moderate" : "mild") as "mild" | "moderate" | "strong",
        ...BIAS_INFO[b],
      }))
      .sort((a, b) => b.count - a.count);
  }, [submitted, answers]);

  const radarScores = useMemo(() => {
    const sc: Record<BiasType, number> = {
      overconfidence: 0,
      loss_aversion: 0,
      anchoring: 0,
      herding: 0,
      recency: 0,
    };
    results.forEach((r) => {
      sc[r.bias] = r.count;
    });
    return sc;
  }, [results]);

  if (submitted && results.length > 0) {
    const top2 = results.slice(0, 2);
    const top3 = results.slice(0, 3);
    const severityColor = (s: string) =>
      s === "strong" ? "text-red-400" : s === "moderate" ? "text-amber-400" : "text-green-400";

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card/60 border-border">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">
                Your Bias Radar
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <BiasRadarChart scores={radarScores} />
            </CardContent>
          </Card>

          <Card className="bg-card/60 border-border">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">
                Top 3 Dominant Biases
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {top3.map((r, i) => (
                <div key={r.bias} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-4">#{i + 1}</span>
                      <span className="text-sm font-medium text-foreground">{r.label}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("text-xs border-0 bg-transparent", severityColor(r.severity))}
                    >
                      {r.severity}
                    </Badge>
                  </div>
                  <Progress value={(r.count / 10) * 100} className="h-1.5" />
                  <p className="text-xs text-muted-foreground">{r.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card/60 border-border">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">
              Personalized Debiasing Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {top2.map((r) => (
              <div
                key={r.bias}
                className="rounded-lg border border-border/50 p-4 space-y-2"
                style={{ borderLeftColor: r.color, borderLeftWidth: 3 }}
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" style={{ color: r.color }} />
                  <span className="text-sm font-semibold text-foreground">{r.label}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{r.tip}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setAnswers({});
            setSubmitted(false);
            setCurrentQ(0);
          }}
          className="border-border text-muted-foreground"
        >
          <RefreshCw className="h-3 w-3 mr-2" />
          Retake Assessment
        </Button>
      </motion.div>
    );
  }

  const q = QUIZ_QUESTIONS[currentQ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Question {currentQ + 1} of {QUIZ_QUESTIONS.length}
        </span>
        <span className="text-xs text-muted-foreground">{totalAnswered} answered</span>
      </div>
      <Progress value={((currentQ) / QUIZ_QUESTIONS.length) * 100} className="h-1" />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="bg-card/60 border-border">
            <CardContent className="pt-6 space-y-5">
              <p className="text-sm text-foreground leading-relaxed">{q.scenario}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.choices.map((choice, ci) => {
                  const selected = answers[q.id] === choice.bias;
                  return (
                    <button
                      key={ci}
                      onClick={() => {
                        setAnswers((prev) => ({ ...prev, [q.id]: choice.bias }));
                        if (currentQ < QUIZ_QUESTIONS.length - 1) {
                          setTimeout(() => setCurrentQ((c) => c + 1), 300);
                        }
                      }}
                      className={cn(
                        "text-left p-3 rounded-lg border text-xs transition-all",
                        selected
                          ? "border-indigo-500 bg-indigo-900/30 text-indigo-200"
                          : "border-border bg-muted/40 text-muted-foreground hover:border-gray-600 hover:text-muted-foreground"
                      )}
                    >
                      <span className="font-medium text-muted-foreground mr-2">
                        {["A", "B", "C", "D"][ci]}.
                      </span>
                      {choice.text}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          disabled={currentQ === 0}
          onClick={() => setCurrentQ((c) => c - 1)}
          className="border-border text-muted-foreground"
        >
          Previous
        </Button>
        <div className="flex gap-1">
          {QUIZ_QUESTIONS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                i === currentQ
                  ? "bg-indigo-500"
                  : answers[QUIZ_QUESTIONS[i].id]
                  ? "bg-green-600"
                  : "bg-gray-700"
              )}
            />
          ))}
        </div>
        {currentQ === QUIZ_QUESTIONS.length - 1 ? (
          <Button
            size="sm"
            disabled={totalAnswered < QUIZ_QUESTIONS.length}
            onClick={() => setSubmitted(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            See Results
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled={!answers[q.id]}
            onClick={() => setCurrentQ((c) => c + 1)}
            className="border-border text-muted-foreground"
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Tab 2: Decision Framework ──────────────────────────────────────────────────

function DecisionFramework() {
  const [checks, setChecks] = useState<Record<number, boolean>>({});
  const [thesisFields, setThesisFields] = useState({
    ticker: "",
    catalyst: "",
    timeline: "",
    target: "",
    stop: "",
    size: "",
  });
  const [showJournal, setShowJournal] = useState(false);

  const journalEntries = useMemo(() => generateJournalEntries(), []);
  const score = Object.values(checks).filter(Boolean).length;

  const toggle = (id: number) =>
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-card/60 border-border">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">
                Pre-Trade Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {CHECKLIST_ITEMS.map((item) => {
                const checked = !!checks[item.id];
                return (
                  <button
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all",
                      checked
                        ? "border-green-800/60 bg-green-950/30"
                        : "border-border/50 bg-muted/20 hover:border-gray-600/50"
                    )}
                  >
                    {checked ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{item.question}</p>
                      <span className="text-xs text-muted-foreground">{item.category}</span>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-card/60 border-border">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">
                Trade Quality
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              <QualityMeter score={score} />
              <p className="text-xs text-muted-foreground text-center">
                {score >= 8
                  ? "Strong process. Execute with conviction."
                  : score >= 6
                  ? "Good process. Review weak areas before entry."
                  : score >= 4
                  ? "Borderline. Address gaps before trading."
                  : "Insufficient process. Do not trade yet."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="bg-card/60 border-border">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-foreground">
            Investment Thesis Builder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(
              [
                ["ticker", "Ticker"],
                ["catalyst", "Specific Catalyst"],
                ["timeline", "Timeline"],
                ["target", "Price Target"],
                ["stop", "Stop Loss"],
                ["size", "Position Size"],
              ] as [keyof typeof thesisFields, string][]
            ).map(([key, label]) => (
              <div key={key} className="space-y-1">
                <label className="text-xs text-muted-foreground">{label}</label>
                <input
                  value={thesisFields[key]}
                  onChange={(e) =>
                    setThesisFields((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  placeholder={label}
                  className="w-full bg-muted border border-border rounded-md px-3 py-1.5 text-xs text-foreground placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            ))}
          </div>
          {thesisFields.ticker && thesisFields.catalyst && (
            <div className="mt-4 rounded-lg border border-indigo-800/40 bg-indigo-950/20 p-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-indigo-300">{thesisFields.ticker}</span>
                {thesisFields.catalyst && ` — catalyst: ${thesisFields.catalyst}`}
                {thesisFields.timeline && ` over ${thesisFields.timeline}`}
                {thesisFields.target && `, targeting ${thesisFields.target}`}
                {thesisFields.stop && ` with stop at ${thesisFields.stop}`}
                {thesisFields.size && ` (${thesisFields.size} position size)`}.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border">
        <CardHeader>
          <button
            onClick={() => setShowJournal((v) => !v)}
            className="flex items-center justify-between w-full"
          >
            <CardTitle className="text-sm font-semibold text-foreground">
              Decision Journal
            </CardTitle>
            {showJournal ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </CardHeader>
        {showJournal && (
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    {["Date", "Ticker", "Thesis", "Outcome", "P&L"].map((h) => (
                      <th key={h} className="text-left py-2 pr-4 text-muted-foreground font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {journalEntries.map((e, i) => (
                    <tr key={i} className="border-b border-border/40">
                      <td className="py-2 pr-4 text-muted-foreground">{e.date}</td>
                      <td className="py-2 pr-4 font-medium text-foreground">{e.ticker}</td>
                      <td className="py-2 pr-4 text-muted-foreground max-w-[200px] truncate">{e.thesis}</td>
                      <td className="py-2 pr-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs border-0",
                            e.outcome === "win"
                              ? "bg-green-900/30 text-green-400"
                              : e.outcome === "loss"
                              ? "bg-red-900/30 text-red-400"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {e.outcome}
                        </Badge>
                      </td>
                      <td
                        className={cn(
                          "py-2 font-medium",
                          e.pnl > 0 ? "text-green-400" : e.pnl < 0 ? "text-red-400" : "text-muted-foreground"
                        )}
                      >
                        {e.pnl !== 0
                          ? `${e.pnl > 0 ? "+" : ""}${e.pnl.toFixed(1)}%`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// ── Tab 3: Emotional Intelligence ──────────────────────────────────────────────

function EmotionalIntelligence() {
  const [cycleIndex, setCycleIndex] = useState(1); // Anxiety = current market mood
  const [emotionScore, setEmotionScore] = useState(5);

  const monthlyData = useMemo(() => generateMonthlyData(), []);
  const scatterData = useMemo(
    () =>
      monthlyData.map((d) => ({
        mood: d.moodScore,
        ret: d.returnPct,
      })),
    [monthlyData]
  );

  const emotionLabel =
    emotionScore <= 2
      ? "Extreme Fear"
      : emotionScore <= 4
      ? "Fear"
      : emotionScore <= 6
      ? "Neutral"
      : emotionScore <= 8
      ? "Greed"
      : "Extreme Greed";

  const emotionColor =
    emotionScore <= 2
      ? "#ef4444"
      : emotionScore <= 4
      ? "#f97316"
      : emotionScore <= 6
      ? "#eab308"
      : emotionScore <= 8
      ? "#84cc16"
      : "#22c55e";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/60 border-border">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">
              Market Emotion Cycle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-center">
              <EmotionCycleSVG currentIndex={cycleIndex} />
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {EMOTION_CYCLE.map((phase, i) => (
                <button
                  key={i}
                  onClick={() => setCycleIndex(i)}
                  className={cn(
                    "px-2 py-1 rounded text-xs transition-all border",
                    i === cycleIndex
                      ? "border-transparent text-white"
                      : "border-border text-muted-foreground hover:border-gray-600"
                  )}
                  style={i === cycleIndex ? { backgroundColor: phase.color + "40", borderColor: phase.color } : {}}
                >
                  {phase.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-card/60 border-border">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">
                How Am I Feeling Today?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Fearful</span>
                <span>Greedy</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={emotionScore}
                onChange={(e) => setEmotionScore(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold" style={{ color: emotionColor }}>
                  {emotionScore}/10
                </span>
                <Badge
                  variant="outline"
                  className="text-xs border-0"
                  style={{ color: emotionColor, backgroundColor: emotionColor + "20" }}
                >
                  {emotionLabel}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {emotionScore <= 3
                  ? "You are in fear territory. Fear-driven trades tend to underperform. Consider waiting 24 hours before major decisions."
                  : emotionScore <= 6
                  ? "Neutral zone. Good conditions for objective decision-making. Proceed with your normal process."
                  : "You are in greed territory. Greed-driven trades tend to ignore downside risks. Apply extra checklist scrutiny."}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/60 border-border">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">
                Rules for Trading While Emotional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {TRADING_RULES.map((rule) => {
                const Icon = rule.icon;
                return (
                  <div
                    key={rule.priority}
                    className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/40"
                  >
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-muted-foreground w-4">
                        {rule.priority}
                      </span>
                      <Icon className="h-3.5 w-3.5 text-indigo-400" />
                    </div>
                    <p className="text-xs text-muted-foreground">{rule.rule}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="bg-card/60 border-border">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-foreground">
            Emotion Score vs Monthly Return
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Do higher mood scores correlate with better or worse performance? The regression line suggests
            {" "}<span className="text-indigo-300">overconfident greed tends to precede underperformance</span>.
          </p>
          <div className="flex justify-center">
            <ScatterPlot
              data={scatterData}
              xLabel="Mood Score (1=Fear, 10=Greed)"
              yLabel="Return %"
              xKey="mood"
              yKey="ret"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 4: Process vs Outcome ──────────────────────────────────────────────────

function ProcessOutcome() {
  const [processRatings, setProcessRatings] = useState<Record<number, number>>({});

  const avgProcess =
    Object.values(processRatings).length > 0
      ? Object.values(processRatings).reduce((a, b) => a + b, 0) /
        Object.values(processRatings).length
      : 0;

  const recentTrades = useMemo(() => {
    resetSeed(55);
    return Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      ticker: ["NVDA", "AAPL", "TSLA", "META", "AMZN"][i],
      date: `2026-03-${String(20 - i * 3).padStart(2, "0")}`,
      outcome: (rand() > 0.4 ? "win" : "loss") as "win" | "loss",
    }));
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MATRIX_QUADRANTS.map((q) => {
          const Icon = q.icon;
          return (
            <motion.div
              key={q.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "rounded-xl border p-5 space-y-3",
                q.bg,
                q.border
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" style={{ color: q.color }} />
                  <span className="font-semibold text-sm text-foreground">{q.label}</span>
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant="outline"
                    className="text-xs border-0"
                    style={{ color: q.color, backgroundColor: q.color + "20" }}
                  >
                    Process: {q.process}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs border-0"
                    style={{ color: q.color, backgroundColor: q.color + "20" }}
                  >
                    Outcome: {q.outcome}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{q.description}</p>
              <p className="text-xs font-medium" style={{ color: q.color }}>
                {q.sublabel}
              </p>
            </motion.div>
          );
        })}
      </div>

      <Card className="bg-card/60 border-border">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-foreground">
            Luck vs Skill Separator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            You need at least <span className="text-indigo-300 font-semibold">30 trades</span> to distinguish
            skill from luck. With fewer trades, a 60% win rate could easily be explained by random variation.
            At 100 trades, a 55% win rate with consistent process is statistically meaningful.
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { trades: 10, confidence: "~20%", label: "Sample too small" },
              { trades: 30, confidence: "~70%", label: "Minimum signal" },
              { trades: 100, confidence: "~95%", label: "High confidence" },
            ].map((item) => (
              <div key={item.trades} className="rounded-lg bg-muted/40 p-3 space-y-1">
                <div className="text-xl font-bold text-foreground">{item.trades}</div>
                <div className="text-xs text-indigo-400 font-medium">{item.confidence}</div>
                <div className="text-xs text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-foreground">
            Process Scorecard — Last 5 Trades
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentTrades.map((trade) => {
            const rating = processRatings[trade.id] ?? 5;
            return (
              <div
                key={trade.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 border border-border/40"
              >
                <div className="w-16 shrink-0">
                  <span className="text-sm font-semibold text-foreground">{trade.ticker}</span>
                  <div className="text-xs text-muted-foreground">{trade.date}</div>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs border-0 shrink-0",
                    trade.outcome === "win"
                      ? "bg-green-900/30 text-green-400"
                      : "bg-red-900/30 text-red-400"
                  )}
                >
                  {trade.outcome}
                </Badge>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Process Quality</span>
                    <span className="text-xs font-medium text-muted-foreground">{rating}/10</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={rating}
                    onChange={(e) =>
                      setProcessRatings((prev) => ({
                        ...prev,
                        [trade.id]: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>
            );
          })}
          {Object.keys(processRatings).length > 0 && (
            <div className="rounded-lg border border-indigo-800/40 bg-indigo-950/20 p-3 text-xs text-muted-foreground">
              Average process score:{" "}
              <span className="font-bold text-indigo-300">{avgProcess.toFixed(1)}/10</span>.{" "}
              {avgProcess >= 7
                ? "Good process discipline. Focus on improving execution consistency."
                : avgProcess >= 5
                ? "Moderate process. Identify the 2 checklist items you most often skip."
                : "Process needs significant work. Consider paper trading until score improves."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 5: Mental Models ───────────────────────────────────────────────────────

function MentalModelsTab() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [selectedCombo, setSelectedCombo] = useState<number[]>([]);

  const comboInsight = useMemo(() => {
    if (selectedCombo.length < 2) return null;
    const names = selectedCombo.map((i) => MENTAL_MODELS[i].name).join(" + ");
    return `Combining ${names}: apply each model as a filter. If all models support the investment, conviction increases. If they conflict, investigate why before proceeding.`;
  }, [selectedCombo]);

  const toggleCombo = (i: number) => {
    setSelectedCombo((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {MENTAL_MODELS.map((model, i) => {
          const isOpen = expanded === i;
          const inCombo = selectedCombo.includes(i);
          return (
            <Card
              key={i}
              className={cn(
                "bg-card/60 border-border transition-all",
                isOpen && "border-indigo-700/60"
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{model.icon}</span>
                    <CardTitle className="text-sm font-semibold text-foreground">
                      {model.name}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleCombo(i)}
                      className={cn(
                        "p-1 rounded text-xs transition-colors",
                        inCombo
                          ? "bg-indigo-700/40 text-indigo-300"
                          : "text-muted-foreground hover:text-muted-foreground"
                      )}
                      title="Add to combination"
                    >
                      <Zap className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setExpanded(isOpen ? null : i)}
                      className="p-1 rounded text-muted-foreground hover:text-muted-foreground transition-colors"
                    >
                      {isOpen ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground leading-relaxed">{model.definition}</p>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 pt-2 border-t border-border/40">
                        <div>
                          <span className="text-xs font-medium text-indigo-400">Investing Application</span>
                          <p className="text-xs text-muted-foreground mt-0.5">{model.application}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-green-400">Example</span>
                          <p className="text-xs text-muted-foreground mt-0.5">{model.example}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-amber-400">When It Breaks Down</span>
                          <p className="text-xs text-muted-foreground mt-0.5">{model.breakdown}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedCombo.length >= 2 && comboInsight && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-indigo-950/30 border-indigo-700/40">
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-medium text-indigo-300">Model Combination Insight</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {selectedCombo.map((i) => (
                  <Badge key={i} className="bg-indigo-800/40 text-indigo-300 border-0 text-xs">
                    {MENTAL_MODELS[i].icon} {MENTAL_MODELS[i].name}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{comboInsight}</p>
              <button
                onClick={() => setSelectedCombo([])}
                className="text-xs text-muted-foreground hover:text-muted-foreground"
              >
                Clear selection
              </button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

// ── Tab 6: Performance Review ──────────────────────────────────────────────────

function PerformanceReview() {
  const [selectedFocus, setSelectedFocus] = useState<number | null>(null);
  const [weekChecks, setWeekChecks] = useState<Record<string, boolean>>({});

  const monthlyData = useMemo(() => generateMonthlyData(), []);
  const mistakes = useMemo(() => generateMistakes(), []);

  const mistakeLabels: Record<MistakeEntry["category"], string> = {
    bad_thesis: "Bad Thesis",
    emotional_exit: "Emotional Exit",
    poor_sizing: "Poor Sizing",
    premature_entry: "Premature Entry",
  };

  const mistakeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      bad_thesis: 0,
      emotional_exit: 0,
      poor_sizing: 0,
      premature_entry: 0,
    };
    mistakes.forEach((m) => counts[m.category]++);
    return counts;
  }, [mistakes]);

  const scatterData = useMemo(
    () =>
      monthlyData.map((d) => ({
        mood: d.moodScore,
        ret: d.returnPct,
      })),
    [monthlyData]
  );

  const totalLoss = mistakes.reduce((a, b) => a + b.loss, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/60 border-border">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">
              12-Month Performance Journal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {monthlyData.map((d) => {
                const isPos = d.returnPct >= 0;
                const intensity = Math.min(Math.abs(d.returnPct) / 8, 1);
                const bg = isPos
                  ? `rgba(34,197,94,${0.15 + intensity * 0.5})`
                  : `rgba(239,68,68,${0.15 + intensity * 0.5})`;
                return (
                  <div
                    key={d.month}
                    className="rounded-lg p-2 text-center space-y-1"
                    style={{ backgroundColor: bg }}
                  >
                    <div className="text-xs text-muted-foreground font-medium">{d.month}</div>
                    <div
                      className={cn(
                        "text-sm font-bold",
                        isPos ? "text-green-300" : "text-red-400"
                      )}
                    >
                      {isPos ? "+" : ""}
                      {d.returnPct.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Mood {d.moodScore}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">
              Mood vs Next Month Return
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              A negative slope suggests that high mood scores (greed) predict lower future returns — the contrarian signal.
            </p>
            <div className="flex justify-center">
              <ScatterPlot
                data={scatterData}
                xLabel="Mood Score"
                yLabel="Return %"
                xKey="mood"
                yKey="ret"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/60 border-border">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">
              Mistake Tracker
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {(Object.entries(mistakeCounts) as [MistakeEntry["category"], number][]).map(
                ([cat, count]) => {
                  const pct = (count / mistakes.length) * 100;
                  return (
                    <div key={cat} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{mistakeLabels[cat]}</span>
                        <span className="text-xs font-medium text-muted-foreground">{count}x</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  );
                }
              )}
            </div>
            <div className="mt-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    {["Date", "Ticker", "Loss", "Category"].map((h) => (
                      <th key={h} className="text-left py-1.5 pr-3 text-muted-foreground font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mistakes.map((m, i) => (
                    <tr key={i} className="border-b border-border/30">
                      <td className="py-1.5 pr-3 text-muted-foreground">{m.date}</td>
                      <td className="py-1.5 pr-3 font-medium text-muted-foreground">{m.ticker}</td>
                      <td className="py-1.5 pr-3 text-red-400">
                        -${m.loss.toFixed(0)}
                      </td>
                      <td className="py-1.5">
                        <Badge
                          variant="outline"
                          className="text-xs border-border text-muted-foreground"
                        >
                          {mistakeLabels[m.category]}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2 text-xs text-muted-foreground text-right">
                Total tracked losses:{" "}
                <span className="text-red-400 font-medium">${totalLoss.toFixed(0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">
              Learning Velocity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Are you making the same mistakes repeatedly? Track mistake recurrence below.
            </p>
            {(Object.entries(mistakeCounts) as [MistakeEntry["category"], number][]).map(
              ([cat, count]) => {
                const isRepeating = count >= 2;
                return (
                  <div
                    key={cat}
                    className={cn(
                      "flex items-center justify-between p-2.5 rounded-lg",
                      isRepeating ? "bg-red-950/30 border border-red-900/40" : "bg-muted/30 border border-border/30"
                    )}
                  >
                    <span className="text-xs text-muted-foreground">{mistakeLabels[cat]}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{count}x</span>
                      {isRepeating ? (
                        <Badge className="bg-red-900/30 text-red-400 border-0 text-xs">
                          Repeating
                        </Badge>
                      ) : (
                        <Badge className="bg-green-900/30 text-green-400 border-0 text-xs">
                          Isolated
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/60 border-border">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-foreground">
            90-Day Improvement Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Select a focus area and track weekly check-ins.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {IMPROVEMENT_AREAS.map((area, ai) => (
              <button
                key={ai}
                onClick={() => setSelectedFocus(selectedFocus === ai ? null : ai)}
                className={cn(
                  "text-left p-3 rounded-lg border transition-all",
                  selectedFocus === ai
                    ? "border-indigo-600 bg-indigo-950/40"
                    : "border-border bg-muted/20 hover:border-gray-600"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="text-xs font-semibold text-foreground">{area.focus}</span>
                </div>
                <p className="text-xs text-muted-foreground">4-week structured program</p>
              </button>
            ))}
          </div>

          <AnimatePresence>
            {selectedFocus !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-2 pt-2">
                  {IMPROVEMENT_AREAS[selectedFocus].weeks.map((task, wi) => {
                    const key = `${selectedFocus}-${wi}`;
                    const done = !!weekChecks[key];
                    return (
                      <button
                        key={wi}
                        onClick={() =>
                          setWeekChecks((prev) => ({ ...prev, [key]: !prev[key] }))
                        }
                        className={cn(
                          "w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all",
                          done
                            ? "border-green-800/40 bg-green-950/20"
                            : "border-border/40 bg-muted/20 hover:border-gray-600/40"
                        )}
                      >
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        )}
                        <div>
                          <span className="text-xs text-muted-foreground font-medium">Week {wi + 1}:</span>
                          <p className="text-xs text-muted-foreground mt-0.5">{task}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function MindsetPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-indigo-400" />
            <h1 className="text-2xl font-bold text-foreground">Investment Psychology</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Understand your biases, sharpen your decision-making process, and build mental resilience.
          </p>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="bias" className="space-y-6">
          <TabsList className="bg-card border border-border flex-wrap h-auto gap-1 p-1">
            {[
              { value: "bias", label: "Bias Assessment", icon: Brain },
              { value: "framework", label: "Decision Framework", icon: CheckCircle2 },
              { value: "emotion", label: "Emotional Intelligence", icon: Heart },
              { value: "process", label: "Process vs Outcome", icon: Activity },
              { value: "models", label: "Mental Models", icon: Lightbulb },
              { value: "review", label: "Performance Review", icon: BarChart2 },
            ].map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-muted-foreground"
              >
                <Icon className="h-3 w-3 mr-1.5" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="bias" className="data-[state=inactive]:hidden">
            <BiasAssessment />
          </TabsContent>
          <TabsContent value="framework" className="data-[state=inactive]:hidden">
            <DecisionFramework />
          </TabsContent>
          <TabsContent value="emotion" className="data-[state=inactive]:hidden">
            <EmotionalIntelligence />
          </TabsContent>
          <TabsContent value="process" className="data-[state=inactive]:hidden">
            <ProcessOutcome />
          </TabsContent>
          <TabsContent value="models" className="data-[state=inactive]:hidden">
            <MentalModelsTab />
          </TabsContent>
          <TabsContent value="review" className="data-[state=inactive]:hidden">
            <PerformanceReview />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
