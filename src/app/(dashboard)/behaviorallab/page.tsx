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
  RefreshCw,
  ChevronRight,
  Star,
  Zap,
  Shield,
  Eye,
  BarChart2,
  Award,
  FlaskConical,
  Scale,
  Anchor,
  Users,
  ArrowUpDown,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 823;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed(seed: number) {
  s = seed;
}

// ── Types ──────────────────────────────────────────────────────────────────────
type BiasType = "lossAversion" | "overconfidence" | "anchoring" | "herding" | "recency";

interface BiasScore {
  bias: BiasType;
  label: string;
  score: number; // 0-100, higher = more biased
  color: string;
  icon: React.ReactNode;
  description: string;
}

interface QuizQuestion {
  id: number;
  scenario: string;
  choices: { text: string; biases: Partial<Record<BiasType, number>> }[];
}

interface ExperimentResult {
  userChoice: string;
  rationalChoice: string;
  biasDetected: string;
  explanation: string;
  userValue?: number;
  rationalValue?: number;
}

interface PortfolioPath {
  period: number;
  rational: number;
  biased: number;
}

interface DebiasTechnique {
  id: string;
  title: string;
  targetBias: BiasType;
  description: string;
  checklist: string[];
  resistanceBoost: number;
}

// ── Static Data ────────────────────────────────────────────────────────────────
const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    scenario:
      "You bought a stock at $50. It's now at $35. Analysts are mixed. What do you do?",
    choices: [
      {
        text: "Hold — it will bounce back to my purchase price",
        biases: { lossAversion: 2, anchoring: 2 },
      },
      {
        text: "Buy more to lower my cost basis",
        biases: { overconfidence: 1, lossAversion: 1 },
      },
      {
        text: "Sell and redeploy into a better opportunity",
        biases: {},
      },
      {
        text: "Everyone else is holding, so I will too",
        biases: { herding: 2 },
      },
    ],
  },
  {
    id: 2,
    scenario:
      "A coin flip: heads you win $150, tails you lose $100. Do you take the bet?",
    choices: [
      {
        text: "No — losing $100 feels too painful",
        biases: { lossAversion: 3 },
      },
      {
        text: "Yes — positive expected value",
        biases: {},
      },
      {
        text: "Only if I can flip multiple times",
        biases: { lossAversion: 1 },
      },
      {
        text: "Let me see what others are doing first",
        biases: { herding: 2 },
      },
    ],
  },
  {
    id: 3,
    scenario:
      "A pundit on TV says the S&P 500 will be at 6,500 by year-end. How does this affect your forecast?",
    choices: [
      {
        text: "My estimate shifts closer to 6,500 automatically",
        biases: { anchoring: 3 },
      },
      {
        text: "I use 6,500 as a starting point and adjust from there",
        biases: { anchoring: 2 },
      },
      {
        text: "I form my own estimate independently",
        biases: {},
      },
      {
        text: "If many pundits agree on 6,500 I believe it more",
        biases: { herding: 2, anchoring: 1 },
      },
    ],
  },
  {
    id: 4,
    scenario:
      "The market dropped 8% last month. You believe next month will also be negative.",
    choices: [
      {
        text: "Yes — the trend has momentum downward",
        biases: { recency: 3 },
      },
      {
        text: "I'll wait for it to recover before investing",
        biases: { recency: 2, lossAversion: 1 },
      },
      {
        text: "I focus on longer-term base rates, not last month",
        biases: {},
      },
      {
        text: "My friends are also worried so I trust the negative outlook",
        biases: { herding: 2, recency: 1 },
      },
    ],
  },
  {
    id: 5,
    scenario:
      "How confident are you that your stock picks will beat the index over 5 years?",
    choices: [
      {
        text: "Very confident — I do extensive research",
        biases: { overconfidence: 3 },
      },
      {
        text: "Somewhat confident — maybe 60-40",
        biases: { overconfidence: 2 },
      },
      {
        text: "Slightly below 50% — most active managers underperform",
        biases: {},
      },
      {
        text: "Almost certain — my past returns prove it",
        biases: { overconfidence: 3, recency: 1 },
      },
    ],
  },
  {
    id: 6,
    scenario:
      "A hot IPO everyone is talking about opens 40% above its IPO price. You:",
    choices: [
      {
        text: "Buy in — it's popular for a reason",
        biases: { herding: 3, recency: 1 },
      },
      {
        text: "Wait — momentum could continue",
        biases: { recency: 2 },
      },
      {
        text: "Skip — valuation no longer makes sense post-surge",
        biases: {},
      },
      {
        text: "Buy a small amount to not miss out completely",
        biases: { herding: 1, lossAversion: 1 },
      },
    ],
  },
];

const DEBIASING_TECHNIQUES: DebiasTechnique[] = [
  {
    id: "premortem",
    title: "Pre-Mortem Analysis",
    targetBias: "overconfidence",
    description:
      "Before any trade, imagine it has failed. Work backwards to identify all the ways it could go wrong. This forces you to stress-test your conviction and surface blind spots.",
    checklist: [
      "Assume the trade loses 30% in 3 months",
      "List 5 plausible reasons why",
      "Check if any of those reasons are currently plausible",
      "Adjust position size based on identified risks",
    ],
    resistanceBoost: 22,
  },
  {
    id: "reference_class",
    title: "Reference Class Forecasting",
    targetBias: "anchoring",
    description:
      "Instead of anchoring to a single number, look at the base rate. What happened to similar stocks in similar situations historically? Use the distribution, not a point estimate.",
    checklist: [
      "Find 10+ comparable situations historically",
      "Note the range of outcomes (not just average)",
      "Place your estimate within that distribution",
      "Weight your prior view by historical evidence",
    ],
    resistanceBoost: 18,
  },
  {
    id: "devil_advocate",
    title: "Devil's Advocate Protocol",
    targetBias: "herding",
    description:
      "When everyone agrees on a trade, assign someone (or yourself) to argue the strongest possible counter-case. Consensus is often a contrary indicator in markets.",
    checklist: [
      "Write out the bull case in detail",
      "Write an equally thorough bear case",
      "Quantify the scenario probabilities independently",
      "Make the decision based on your own weighting",
    ],
    resistanceBoost: 20,
  },
  {
    id: "long_run_chart",
    title: "Long-Run Chart Immersion",
    targetBias: "recency",
    description:
      "Zoom out to a 20-year chart before making any decisions based on recent price action. Recent months represent a tiny fraction of market history. Context neutralizes recency bias.",
    checklist: [
      "View 20-year price chart before deciding",
      "Note the current level vs. historical volatility",
      "Check the base rate of similar recent moves",
      "Anchor decisions to the long-run trend, not last month",
    ],
    resistanceBoost: 15,
  },
  {
    id: "loss_reframe",
    title: "Expected Value Reframing",
    targetBias: "lossAversion",
    description:
      "Reframe every decision in terms of expected value and portfolio-level impact. A 1% position that loses 50% is only a 0.5% portfolio drawdown — much less emotionally threatening than it feels.",
    checklist: [
      "Calculate the worst-case portfolio-level impact (not $ amount)",
      "Ask: would I take this bet 100 times?",
      "Separate the feeling of loss from the rational EV calculation",
      "Size positions so the worst case feels manageable",
    ],
    resistanceBoost: 25,
  },
];

const BIAS_META: Record<
  BiasType,
  { label: string; color: string; icon: React.ReactNode; description: string }
> = {
  lossAversion: {
    label: "Loss Aversion",
    color: "#ef4444",
    icon: <Scale className="w-4 h-4" />,
    description:
      "Feeling losses ~2× more intensely than equivalent gains, leading to holding losers too long and selling winners too early.",
  },
  overconfidence: {
    label: "Overconfidence",
    color: "#f97316",
    icon: <Award className="w-4 h-4" />,
    description:
      "Overestimating your ability to predict markets, leading to excessive trading, concentration risk, and under-hedging.",
  },
  anchoring: {
    label: "Anchoring",
    color: "#eab308",
    icon: <Anchor className="w-4 h-4" />,
    description:
      "Over-weighting an initial reference point (purchase price, analyst target) when making subsequent decisions.",
  },
  herding: {
    label: "Herding",
    color: "#8b5cf6",
    icon: <Users className="w-4 h-4" />,
    description:
      "Following the crowd rather than independent analysis, amplifying bubbles and panics.",
  },
  recency: {
    label: "Recency Bias",
    color: "#06b6d4",
    icon: <Activity className="w-4 h-4" />,
    description:
      "Overweighting recent events and extrapolating short-term trends, leading to buying high and selling low.",
  },
};

// ── Generate portfolio simulation paths ───────────────────────────────────────
function generatePortfolioPaths(biasScores: Record<BiasType, number>): PortfolioPath[] {
  resetSeed(823);
  const paths: PortfolioPath[] = [];
  let rational = 100;
  let biased = 100;

  // Compute total bias drag as annualised % cost
  const totalDrag =
    (biasScores.lossAversion / 100) * 1.8 +
    (biasScores.overconfidence / 100) * 2.2 +
    (biasScores.anchoring / 100) * 0.9 +
    (biasScores.herding / 100) * 1.4 +
    (biasScores.recency / 100) * 1.2;

  for (let i = 0; i <= 20; i++) {
    if (i > 0) {
      const mktReturn = (rand() - 0.42) * 0.08; // slightly positive drift
      const biasNoise = (rand() - 0.5) * 0.04;
      rational *= 1 + mktReturn;
      biased *= 1 + mktReturn - totalDrag / 100 / 2 + biasNoise;
    }
    paths.push({ period: i, rational: +rational.toFixed(2), biased: +biased.toFixed(2) });
  }
  return paths;
}

// ── SVG Radar Chart ────────────────────────────────────────────────────────────
function RadarChart({ scores }: { scores: BiasScore[] }) {
  const cx = 130;
  const cy = 130;
  const maxR = 100;
  const n = scores.length;

  const axes = scores.map((s, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    return {
      x: cx + maxR * Math.cos(angle),
      y: cy + maxR * Math.sin(angle),
      lx: cx + (maxR + 24) * Math.cos(angle),
      ly: cy + (maxR + 24) * Math.sin(angle),
    };
  });

  const polygonPoints = scores
    .map((s, i) => {
      const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
      const r = (s.score / 100) * maxR;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    })
    .join(" ");

  // Grid rings
  const rings = [25, 50, 75, 100];

  return (
    <svg viewBox="0 0 260 260" className="w-full max-w-[280px] mx-auto">
      {/* Grid rings */}
      {rings.map((r) => {
        const pts = Array.from({ length: n }, (_, i) => {
          const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
          const rr = (r / 100) * maxR;
          return `${cx + rr * Math.cos(angle)},${cy + rr * Math.sin(angle)}`;
        }).join(" ");
        return (
          <polygon
            key={r}
            points={pts}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
          />
        );
      })}

      {/* Axis lines */}
      {axes.map((a, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={a.x}
          y2={a.y}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={1}
        />
      ))}

      {/* Filled area */}
      <polygon
        points={polygonPoints}
        fill="rgba(239,68,68,0.18)"
        stroke="#ef4444"
        strokeWidth={2}
      />

      {/* Data points */}
      {scores.map((s, i) => {
        const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
        const r = (s.score / 100) * maxR;
        return (
          <circle
            key={i}
            cx={cx + r * Math.cos(angle)}
            cy={cy + r * Math.sin(angle)}
            r={4}
            fill={s.color}
            stroke="white"
            strokeWidth={1.5}
          />
        );
      })}

      {/* Labels */}
      {scores.map((s, i) => (
        <text
          key={i}
          x={axes[i].lx}
          y={axes[i].ly}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={9}
          fill="rgba(255,255,255,0.7)"
          style={{ fontWeight: 600 }}
        >
          {s.label.split(" ").map((word, wi) => (
            <tspan key={wi} x={axes[i].lx} dy={wi === 0 ? 0 : 11}>
              {word}
            </tspan>
          ))}
        </text>
      ))}

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={3} fill="rgba(255,255,255,0.3)" />
    </svg>
  );
}

// ── SVG Portfolio Paths ────────────────────────────────────────────────────────
function PortfolioChart({ paths }: { paths: PortfolioPath[] }) {
  const W = 480;
  const H = 200;
  const pad = { top: 16, right: 16, bottom: 28, left: 44 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const allVals = paths.flatMap((p) => [p.rational, p.biased]);
  const minV = Math.min(...allVals) * 0.98;
  const maxV = Math.max(...allVals) * 1.02;
  const maxP = paths.length - 1;

  const toX = (p: number) => pad.left + (p / maxP) * plotW;
  const toY = (v: number) =>
    pad.top + plotH - ((v - minV) / (maxV - minV)) * plotH;

  const rationalPath = paths
    .map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.period)},${toY(p.rational)}`)
    .join(" ");
  const biasedPath = paths
    .map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.period)},${toY(p.biased)}`)
    .join(" ");

  const yTicks = [minV, (minV + maxV) / 2, maxV].map((v) => ({
    v,
    y: toY(v),
    label: v.toFixed(0),
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Grid */}
      {yTicks.map((t) => (
        <g key={t.label}>
          <line
            x1={pad.left}
            y1={t.y}
            x2={W - pad.right}
            y2={t.y}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
          <text
            x={pad.left - 4}
            y={t.y}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize={9}
            fill="rgba(255,255,255,0.4)"
          >
            {t.label}
          </text>
        </g>
      ))}
      {/* X axis labels */}
      {[0, 5, 10, 15, 20].map((p) => (
        <text
          key={p}
          x={toX(p)}
          y={H - 6}
          textAnchor="middle"
          fontSize={9}
          fill="rgba(255,255,255,0.4)"
        >
          Y{p}
        </text>
      ))}
      {/* Rational line */}
      <path d={rationalPath} fill="none" stroke="#22c55e" strokeWidth={2} />
      {/* Biased line */}
      <path
        d={biasedPath}
        fill="none"
        stroke="#ef4444"
        strokeWidth={2}
        strokeDasharray="5 3"
      />
      {/* End labels */}
      <text
        x={toX(maxP) + 4}
        y={toY(paths[maxP].rational)}
        fontSize={9}
        fill="#22c55e"
        dominantBaseline="middle"
      >
        {paths[maxP].rational.toFixed(0)}
      </text>
      <text
        x={toX(maxP) + 4}
        y={toY(paths[maxP].biased) + 10}
        fontSize={9}
        fill="#ef4444"
        dominantBaseline="middle"
      >
        {paths[maxP].biased.toFixed(0)}
      </text>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════════════════════════════════
export default function BehavioralLabPage() {
  // ── Bias Detector ────────────────────────────────────────────────────────
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // ── Experiments ──────────────────────────────────────────────────────────
  const [exp1Choice, setExp1Choice] = useState<"accept" | "reject" | null>(null);
  const [exp1Revealed, setExp1Revealed] = useState(false);

  const [exp2Anchor, setExp2Anchor] = useState<number | null>(null);
  const [exp2Estimate, setExp2Estimate] = useState<number[]>([500]);
  const [exp2Submitted, setExp2Submitted] = useState(false);

  const [exp3Low, setExp3Low] = useState<number[]>([3800]);
  const [exp3High, setExp3High] = useState<number[]>([5200]);
  const [exp3Submitted, setExp3Submitted] = useState(false);

  // ── Debiasing ─────────────────────────────────────────────────────────────
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // ── Derived: bias scores from quiz ───────────────────────────────────────
  const biasScores = useMemo<BiasScore[]>(() => {
    const totals: Record<BiasType, number> = {
      lossAversion: 0,
      overconfidence: 0,
      anchoring: 0,
      herding: 0,
      recency: 0,
    };
    const maxPossible: Record<BiasType, number> = {
      lossAversion: 0,
      overconfidence: 0,
      anchoring: 0,
      herding: 0,
      recency: 0,
    };

    QUIZ_QUESTIONS.forEach((q) => {
      q.choices.forEach((c) => {
        (Object.keys(c.biases) as BiasType[]).forEach((b) => {
          const w = c.biases[b] ?? 0;
          if (w > (maxPossible[b] ?? 0)) maxPossible[b] = w;
        });
      });

      const answerIdx = quizAnswers[q.id];
      if (answerIdx !== undefined) {
        const chosen = q.choices[answerIdx];
        (Object.keys(chosen.biases) as BiasType[]).forEach((b) => {
          totals[b] += chosen.biases[b] ?? 0;
        });
      }
    });

    return (Object.keys(BIAS_META) as BiasType[]).map((b) => {
      const maxScore = QUIZ_QUESTIONS.reduce((acc, q) => {
        const max = Math.max(...q.choices.map((c) => c.biases[b] ?? 0));
        return acc + max;
      }, 0);
      const rawScore = maxScore > 0 ? (totals[b] / maxScore) * 100 : 0;
      return {
        bias: b,
        label: BIAS_META[b].label,
        score: Math.min(100, Math.round(rawScore)),
        color: BIAS_META[b].color,
        icon: BIAS_META[b].icon,
        description: BIAS_META[b].description,
      };
    });
  }, [quizAnswers]);

  const biasScoreMap = useMemo<Record<BiasType, number>>(() => {
    return Object.fromEntries(biasScores.map((s) => [s.bias, s.score])) as Record<
      BiasType,
      number
    >;
  }, [biasScores]);

  const portfolioPaths = useMemo(
    () => generatePortfolioPaths(biasScoreMap),
    [biasScoreMap]
  );

  const dominantBias = useMemo(
    () => biasScores.reduce((a, b) => (b.score > a.score ? b : a), biasScores[0]),
    [biasScores]
  );

  // ── Experiment 2: random anchors ──────────────────────────────────────────
  const anchors = useMemo(() => {
    resetSeed(823);
    return [Math.round(rand() * 900 + 100), Math.round(rand() * 900 + 100)];
  }, []);
  const TRUE_MARKET_CAP = 750; // $750B — shown after answer

  // ── Experiment 3: S&P 500 confidence interval ─────────────────────────────
  const SP500_ACTUAL = 4789; // reference value shown as "actual" post-answer

  // ── Debiasing resistance score ─────────────────────────────────────────────
  const resistanceScore = useMemo(() => {
    let total = 0;
    DEBIASING_TECHNIQUES.forEach((t) => {
      const checked = t.checklist.filter(
        (_, i) => checkedItems[`${t.id}-${i}`]
      ).length;
      total += (checked / t.checklist.length) * t.resistanceBoost;
    });
    const maxPossible = DEBIASING_TECHNIQUES.reduce((s, t) => s + t.resistanceBoost, 0);
    return Math.round((total / maxPossible) * 100);
  }, [checkedItems]);

  // ── Bias cost calculation ─────────────────────────────────────────────────
  const biasCosts: { bias: BiasType; label: string; costPct: number }[] = [
    { bias: "lossAversion", label: "Loss Aversion", costPct: (biasScoreMap.lossAversion / 100) * 1.8 },
    { bias: "overconfidence", label: "Overconfidence", costPct: (biasScoreMap.overconfidence / 100) * 2.2 },
    { bias: "anchoring", label: "Anchoring", costPct: (biasScoreMap.anchoring / 100) * 0.9 },
    { bias: "herding", label: "Herding", costPct: (biasScoreMap.herding / 100) * 1.4 },
    { bias: "recency", label: "Recency Bias", costPct: (biasScoreMap.recency / 100) * 1.2 },
  ];
  const totalCostPct = biasCosts.reduce((s, b) => s + b.costPct, 0);

  // ── Experiment result messages ─────────────────────────────────────────────
  const exp1Result: ExperimentResult | null = exp1Revealed
    ? {
        userChoice: exp1Choice === "accept" ? "Accept bet" : "Reject bet",
        rationalChoice: "Accept bet",
        biasDetected:
          exp1Choice === "reject" ? "Loss Aversion detected" : "Rational decision",
        explanation:
          exp1Choice === "reject"
            ? "The bet has a positive expected value: (+$150 × 0.5) + (−$100 × 0.5) = +$25. Rejecting it is irrational by EV — but loss aversion makes the $100 pain feel greater than the $150 gain."
            : "You correctly evaluated the bet on expected value. Most people reject this bet — loss aversion is powerful.",
      }
    : null;

  const exp2Result: ExperimentResult | null =
    exp2Submitted && exp2Anchor !== null
      ? {
          userChoice: `$${exp2Estimate[0]}B`,
          rationalChoice: `$${TRUE_MARKET_CAP}B`,
          biasDetected:
            Math.abs(exp2Estimate[0] - exp2Anchor) < Math.abs(exp2Estimate[0] - TRUE_MARKET_CAP)
              ? "Anchoring bias detected"
              : "Low anchoring",
          explanation: `The random number shown ($${exp2Anchor}B) was irrelevant to the actual market cap ($${TRUE_MARKET_CAP}B). Research shows people's estimates cluster around the anchor even when told it's random.`,
          userValue: exp2Estimate[0],
          rationalValue: TRUE_MARKET_CAP,
        }
      : null;

  const exp3Width = exp3High[0] - exp3Low[0];
  const exp3Result: ExperimentResult | null = exp3Submitted
    ? {
        userChoice: `$${exp3Low[0]}–$${exp3High[0]} (width: ${exp3Width})`,
        rationalChoice: `Interval containing ${SP500_ACTUAL}`,
        biasDetected:
          SP500_ACTUAL >= exp3Low[0] && SP500_ACTUAL <= exp3High[0]
            ? "Good calibration"
            : `Overconfidence detected — actual value ${SP500_ACTUAL} outside your range`,
        explanation:
          "For a 90% confidence interval, the true value should fall inside your range 90% of the time. Studies show investors give ranges that are far too narrow — a sign of overconfidence. The S&P 500 was at ~4,789 at end of 2023.",
        userValue: exp3Width,
        rationalValue: SP500_ACTUAL,
      }
    : null;

  const allAnswered = QUIZ_QUESTIONS.every((q) => quizAnswers[q.id] !== undefined);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10 border border-border">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Behavioral Economics Lab</h1>
            <p className="text-sm text-muted-foreground">
              Interactive experiments revealing cognitive biases in investing
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {(Object.keys(BIAS_META) as BiasType[]).map((b) => (
            <Badge
              key={b}
              variant="outline"
              className="text-xs border-border text-muted-foreground"
              style={{ borderColor: BIAS_META[b].color + "44", color: BIAS_META[b].color }}
            >
              {BIAS_META[b].label}
            </Badge>
          ))}
        </div>
      </div>

      <Tabs defaultValue="detector" className="space-y-4">
        <TabsList className="bg-card border border-border grid grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="detector" className="text-xs sm:text-sm">
            Bias Detector
          </TabsTrigger>
          <TabsTrigger value="experiments" className="text-xs sm:text-sm">
            Experiments
          </TabsTrigger>
          <TabsTrigger value="impact" className="text-xs sm:text-sm">
            Portfolio Impact
          </TabsTrigger>
          <TabsTrigger value="debiasing" className="text-xs sm:text-sm">
            Debiasing
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: Bias Detector ────────────────────────────────────────────── */}
        <TabsContent value="detector" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Questions */}
            <div className="lg:col-span-2 space-y-3">
              {QUIZ_QUESTIONS.map((q, qi) => (
                <Card key={q.id} className="bg-card border-border">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-sm font-medium text-foreground mb-3">
                      <span className="text-muted-foreground mr-2">Q{qi + 1}.</span>
                      {q.scenario}
                    </p>
                    <div className="space-y-2">
                      {q.choices.map((c, ci) => {
                        const selected = quizAnswers[q.id] === ci;
                        return (
                          <button
                            key={ci}
                            onClick={() =>
                              setQuizAnswers((prev) => ({ ...prev, [q.id]: ci }))
                            }
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-lg border text-sm transition-all",
                              selected
                                ? "border-primary bg-primary/10 text-foreground"
                                : "border-border bg-muted/50 text-muted-foreground hover:border-border hover:text-foreground"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              {selected ? (
                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                              )}
                              {c.text}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button
                className="w-full bg-primary hover:bg-primary/80"
                disabled={!allAnswered}
                onClick={() => setQuizSubmitted(true)}
              >
                {allAnswered ? "See My Bias Profile" : `Answer all ${QUIZ_QUESTIONS.length} questions`}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Results panel */}
            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-primary" />
                    Bias Radar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {quizSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <RadarChart scores={biasScores} />
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Brain className="w-10 h-10 text-muted-foreground mb-3" />
                      <p className="text-xs text-muted-foreground">
                        Complete the questionnaire to see your bias profile
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Score bars */}
              {quizSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-muted-foreground">
                        Bias Scores
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {biasScores
                        .slice()
                        .sort((a, b) => b.score - a.score)
                        .map((s) => (
                          <div key={s.bias}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <span style={{ color: s.color }}>{s.icon}</span>
                                {s.label}
                              </div>
                              <span
                                className="text-xs font-bold"
                                style={{ color: s.color }}
                              >
                                {s.score}%
                              </span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: s.color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${s.score}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        ))}

                      {/* Dominant bias callout */}
                      <div
                        className="mt-3 p-3 rounded-lg border text-xs"
                        style={{
                          borderColor: dominantBias.color + "44",
                          backgroundColor: dominantBias.color + "11",
                        }}
                      >
                        <p className="font-semibold mb-1" style={{ color: dominantBias.color }}>
                          Dominant Bias: {dominantBias.label}
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                          {dominantBias.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── TAB 2: Experiments ──────────────────────────────────────────────── */}
        <TabsContent value="experiments" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Three interactive experiments that reveal cognitive biases in action. Try each one before revealing the answer.
          </p>

          {/* Experiment 1: Loss Aversion Coin Flip */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="p-1.5 rounded bg-red-500/10">
                  <Scale className="w-4 h-4 text-red-400" />
                </div>
                Experiment 1 — The Coin Flip
                <Badge variant="outline" className="text-xs border-red-900 text-red-400 ml-auto">
                  Loss Aversion
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/60 border border-border">
                <p className="text-sm text-foreground font-medium mb-1">The Bet</p>
                <p className="text-sm text-muted-foreground">
                  I flip a fair coin. <span className="text-green-400 font-semibold">Heads: you win $150.</span>{" "}
                  <span className="text-red-400 font-semibold">Tails: you lose $100.</span>
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Expected value = (+$150 × 0.5) + (−$100 × 0.5) = <span className="text-green-400">+$25</span>
                </p>
              </div>

              <p className="text-sm text-muted-foreground font-medium">Do you accept the bet?</p>
              <div className="flex gap-3">
                <Button
                  variant={exp1Choice === "accept" ? "default" : "outline"}
                  className={cn(
                    "flex-1",
                    exp1Choice === "accept"
                      ? "bg-green-600 hover:bg-green-700 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => { setExp1Choice("accept"); setExp1Revealed(false); }}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Accept Bet
                </Button>
                <Button
                  variant={exp1Choice === "reject" ? "default" : "outline"}
                  className={cn(
                    "flex-1",
                    exp1Choice === "reject"
                      ? "bg-red-600 hover:bg-red-700 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => { setExp1Choice("reject"); setExp1Revealed(false); }}
                >
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Reject Bet
                </Button>
              </div>

              {exp1Choice && !exp1Revealed && (
                <Button
                  className="w-full bg-muted hover:bg-muted"
                  onClick={() => setExp1Revealed(true)}
                >
                  Reveal Analysis
                </Button>
              )}

              <AnimatePresence>
                {exp1Result && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div
                      className={cn(
                        "p-4 rounded-lg border text-sm space-y-2",
                        exp1Choice === "reject"
                          ? "border-red-900 bg-red-950/30"
                          : "border-green-900 bg-green-950/30"
                      )}
                    >
                      <div className="flex items-center gap-2 font-semibold">
                        {exp1Choice === "reject" ? (
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        )}
                        <span
                          className={exp1Choice === "reject" ? "text-red-400" : "text-green-400"}
                        >
                          {exp1Result.biasDetected}
                        </span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{exp1Result.explanation}</p>
                      <div className="flex gap-4 pt-1 text-xs text-muted-foreground">
                        <span>Your choice: <span className="text-foreground">{exp1Result.userChoice}</span></span>
                        <span>Rational: <span className="text-green-400">{exp1Result.rationalChoice}</span></span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Experiment 2: Anchoring */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="p-1.5 rounded bg-yellow-500/10">
                  <Anchor className="w-4 h-4 text-yellow-400" />
                </div>
                Experiment 2 — The Anchor
                <Badge variant="outline" className="text-xs border-yellow-900 text-yellow-400 ml-auto">
                  Anchoring
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {exp2Anchor === null ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    We&apos;ll show you a random number, then ask you to estimate a company&apos;s market cap.
                    The random number has no relation to the answer.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Choose an anchor group to see your random number:
                  </p>
                  <div className="flex gap-3">
                    {anchors.map((a, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        className="flex-1 border-border text-muted-foreground hover:text-foreground"
                        onClick={() => setExp2Anchor(a)}
                      >
                        Group {i + 1}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted border border-border text-center">
                    <p className="text-xs text-muted-foreground mb-1">Your random number is:</p>
                    <p className="text-2xl font-bold text-yellow-400">{exp2Anchor}</p>
                    <p className="text-xs text-muted-foreground mt-1">(This is irrelevant to the answer)</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground font-medium mb-1">
                      What is the market cap of a major semiconductor company (in $B)?
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Adjust the slider to your best estimate: $
                      <span className="text-foreground font-bold">{exp2Estimate[0]}B</span>
                    </p>
                    <Slider
                      min={50}
                      max={1500}
                      step={10}
                      value={exp2Estimate}
                      onValueChange={setExp2Estimate}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>$50B</span>
                      <span>$1,500B</span>
                    </div>
                  </div>
                  {!exp2Submitted && (
                    <Button
                      className="w-full bg-yellow-600 hover:bg-yellow-700"
                      onClick={() => setExp2Submitted(true)}
                    >
                      Submit Estimate &amp; Reveal
                    </Button>
                  )}
                </div>
              )}

              <AnimatePresence>
                {exp2Result && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 rounded-lg border border-yellow-900/50 bg-yellow-950/20 text-sm space-y-2">
                      <div className="flex items-center gap-2 font-semibold text-yellow-400">
                        <Anchor className="w-4 h-4" />
                        {exp2Result.biasDetected}
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{exp2Result.explanation}</p>
                      <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                        <div className="text-center p-2 bg-muted rounded">
                          <p className="text-muted-foreground">Your Anchor</p>
                          <p className="text-yellow-400 font-bold">${exp2Anchor}B</p>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <p className="text-muted-foreground">Your Estimate</p>
                          <p className="text-foreground font-bold">{exp2Result.userChoice}</p>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <p className="text-muted-foreground">Actual</p>
                          <p className="text-green-400 font-bold">${TRUE_MARKET_CAP}B</p>
                        </div>
                      </div>
                      <div className="mt-2 h-2 bg-muted rounded-full relative overflow-hidden">
                        <div
                          className="absolute top-0 h-full w-1 bg-yellow-400"
                          style={{ left: `${((exp2Anchor ?? 0) / 1500) * 100}%` }}
                          title="Anchor"
                        />
                        <div
                          className="absolute top-0 h-full w-1 bg-foreground"
                          style={{ left: `${((exp2Estimate[0]) / 1500) * 100}%` }}
                          title="Your estimate"
                        />
                        <div
                          className="absolute top-0 h-full w-1 bg-green-400"
                          style={{ left: `${(TRUE_MARKET_CAP / 1500) * 100}%` }}
                          title="Actual"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="text-yellow-400">Anchor</span>
                        <span className="text-foreground">Your est.</span>
                        <span className="text-green-400">Actual</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Experiment 3: Overconfidence CI */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="p-1.5 rounded bg-orange-500/10">
                  <Award className="w-4 h-4 text-orange-400" />
                </div>
                Experiment 3 — Confidence Intervals
                <Badge variant="outline" className="text-xs border-orange-900 text-orange-400 ml-auto">
                  Overconfidence
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/60 border border-border">
                <p className="text-sm text-foreground font-medium">
                  Provide a <span className="text-orange-400">90% confidence interval</span> for the S&P 500 closing level at end of 2023.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Set a low and high value such that you are 90% sure the truth lies between them.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Lower bound</span>
                    <span className="text-foreground font-bold">{exp3Low[0]}</span>
                  </div>
                  <Slider
                    min={3000}
                    max={6000}
                    step={50}
                    value={exp3Low}
                    onValueChange={(v) => {
                      if (v[0] < exp3High[0]) setExp3Low(v);
                    }}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Upper bound</span>
                    <span className="text-foreground font-bold">{exp3High[0]}</span>
                  </div>
                  <Slider
                    min={3000}
                    max={6000}
                    step={50}
                    value={exp3High}
                    onValueChange={(v) => {
                      if (v[0] > exp3Low[0]) setExp3High(v);
                    }}
                  />
                </div>

                {/* Visual range */}
                <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                  <div
                    className="absolute top-0 h-full bg-orange-500/20 border-l-2 border-r-2 border-orange-500/60"
                    style={{
                      left: `${((exp3Low[0] - 3000) / 3000) * 100}%`,
                      right: `${100 - ((exp3High[0] - 3000) / 3000) * 100}%`,
                    }}
                  />
                  {exp3Submitted && (
                    <div
                      className="absolute top-0 h-full w-0.5 bg-green-400"
                      style={{ left: `${((SP500_ACTUAL - 3000) / 3000) * 100}%` }}
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-between px-2 text-xs text-muted-foreground">
                    <span>3000</span>
                    <span className="font-semibold text-orange-300">
                      Width: {exp3Width}
                    </span>
                    <span>6000</span>
                  </div>
                </div>

                {!exp3Submitted && (
                  <Button
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    onClick={() => setExp3Submitted(true)}
                  >
                    Submit &amp; Reveal
                  </Button>
                )}
              </div>

              <AnimatePresence>
                {exp3Result && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div
                      className={cn(
                        "p-4 rounded-lg border text-sm space-y-2",
                        SP500_ACTUAL >= exp3Low[0] && SP500_ACTUAL <= exp3High[0]
                          ? "border-green-900/50 bg-green-950/20"
                          : "border-orange-900/50 bg-orange-950/20"
                      )}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-2 font-semibold",
                          SP500_ACTUAL >= exp3Low[0] && SP500_ACTUAL <= exp3High[0]
                            ? "text-green-400"
                            : "text-orange-400"
                        )}
                      >
                        {SP500_ACTUAL >= exp3Low[0] && SP500_ACTUAL <= exp3High[0] ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <AlertTriangle className="w-4 h-4" />
                        )}
                        {exp3Result.biasDetected}
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{exp3Result.explanation}</p>
                      <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                        <div className="p-2 bg-muted rounded">
                          <p className="text-muted-foreground">Your interval</p>
                          <p className="text-foreground font-bold">{exp3Low[0]} – {exp3High[0]}</p>
                        </div>
                        <div className="p-2 bg-muted rounded">
                          <p className="text-muted-foreground">S&P 500 end-2023</p>
                          <p className="text-green-400 font-bold">{SP500_ACTUAL}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 3: Portfolio Impact ─────────────────────────────────────────── */}
        <TabsContent value="impact" className="space-y-4">
          {!quizSubmitted && (
            <div className="p-4 rounded-lg border border-border bg-card text-sm text-muted-foreground flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
              Complete the Bias Detector questionnaire first to personalise your portfolio impact.
              Default scores are used until then.
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Simulation chart */}
            <Card className="bg-card border-border lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  20-Period Portfolio Simulation: Rational vs. Biased Investor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PortfolioChart paths={portfolioPaths} />
                <div className="flex gap-6 mt-3 justify-center text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-0.5 bg-green-500" />
                    <span className="text-muted-foreground">Rational investor</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-6 h-0.5 bg-red-500"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(to right, #ef4444 0 5px, transparent 5px 8px)",
                      }}
                    />
                    <span className="text-muted-foreground">Biased investor</span>
                  </div>
                </div>
                <div className="mt-3 p-3 rounded-lg bg-muted/60 border border-border text-center">
                  <p className="text-xs text-muted-foreground">20-period terminal gap</p>
                  <p className="text-2xl font-bold text-red-400 mt-0.5">
                    −
                    {(
                      portfolioPaths[portfolioPaths.length - 1].rational -
                      portfolioPaths[portfolioPaths.length - 1].biased
                    ).toFixed(1)}{" "}
                    pts
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Starting from 100. Rational ends at{" "}
                    <span className="text-green-400">
                      {portfolioPaths[portfolioPaths.length - 1].rational}
                    </span>
                    , biased at{" "}
                    <span className="text-red-400">
                      {portfolioPaths[portfolioPaths.length - 1].biased}
                    </span>
                    .
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Per-bias cost cards */}
            {biasCosts.map((bc) => (
              <Card key={bc.bias} className="bg-card border-border">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <span style={{ color: BIAS_META[bc.bias].color }}>
                        {BIAS_META[bc.bias].icon}
                      </span>
                      {bc.label}
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{
                        borderColor: BIAS_META[bc.bias].color + "44",
                        color: BIAS_META[bc.bias].color,
                      }}
                    >
                      −{bc.costPct.toFixed(2)}% / yr
                    </Badge>
                  </div>
                  <Progress
                    value={biasScoreMap[bc.bias]}
                    className="h-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {BIAS_META[bc.bias].description}
                  </p>
                </CardContent>
              </Card>
            ))}

            {/* Total cost summary */}
            <Card
              className="bg-card border-border lg:col-span-2"
              style={{ borderColor: totalCostPct > 3 ? "#ef444433" : "#22c55e33" }}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Estimated total annual drag from biases</p>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: totalCostPct > 3 ? "#ef4444" : "#22c55e" }}
                    >
                      −{totalCostPct.toFixed(2)}% / year
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Compounded over 20 years, this drag turns $100k into approximately $
                      {(100000 * Math.pow(1 - totalCostPct / 100, 20)).toFixed(0)}{" "}
                      vs. $
                      {(100000 * Math.pow(1.08, 20)).toFixed(0)} for a rational investor at 8% p.a.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Bias severity</p>
                    <Badge
                      className="mt-1"
                      style={{
                        backgroundColor:
                          totalCostPct > 4
                            ? "#ef444420"
                            : totalCostPct > 2
                            ? "#f9731620"
                            : "#22c55e20",
                        color:
                          totalCostPct > 4
                            ? "#ef4444"
                            : totalCostPct > 2
                            ? "#f97316"
                            : "#22c55e",
                        borderColor:
                          totalCostPct > 4
                            ? "#ef444440"
                            : totalCostPct > 2
                            ? "#f9731640"
                            : "#22c55e40",
                      }}
                    >
                      {totalCostPct > 4 ? "High" : totalCostPct > 2 ? "Moderate" : "Low"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── TAB 4: Debiasing ────────────────────────────────────────────────── */}
        <TabsContent value="debiasing" className="space-y-4">
          {/* Overall resistance score */}
          <Card className="bg-card border-border">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">Bias Resistance Score</p>
                  <p className="text-2xl font-bold text-foreground">{resistanceScore}%</p>
                </div>
                <div className="p-3 rounded-full border-2" style={{ borderColor: resistanceScore > 60 ? "#22c55e" : resistanceScore > 30 ? "#f97316" : "#ef4444" }}>
                  <Shield
                    className="w-6 h-6"
                    style={{ color: resistanceScore > 60 ? "#22c55e" : resistanceScore > 30 ? "#f97316" : "#ef4444" }}
                  />
                </div>
              </div>
              <Progress value={resistanceScore} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {resistanceScore < 20
                  ? "Start working through the debiasing checklists below to build your resistance."
                  : resistanceScore < 50
                  ? "Good start — keep completing the techniques to strengthen your process."
                  : resistanceScore < 80
                  ? "Strong resistance! You have solid debiasing habits in place."
                  : "Elite level. Your decision process is systematically debiased."}
              </p>
            </CardContent>
          </Card>

          {/* Technique cards */}
          <div className="space-y-3">
            {DEBIASING_TECHNIQUES.map((t) => {
              const completedCount = t.checklist.filter(
                (_, i) => checkedItems[`${t.id}-${i}`]
              ).length;
              const pct = (completedCount / t.checklist.length) * 100;
              const targetMeta = BIAS_META[t.targetBias];

              return (
                <Card key={t.id} className="bg-card border-border">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="p-2 rounded-lg shrink-0"
                        style={{ backgroundColor: targetMeta.color + "15" }}
                      >
                        <span style={{ color: targetMeta.color }}>{targetMeta.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-foreground">{t.title}</p>
                          <Badge
                            variant="outline"
                            className="text-xs shrink-0 ml-2"
                            style={{
                              borderColor: targetMeta.color + "44",
                              color: targetMeta.color,
                            }}
                          >
                            {targetMeta.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                          {t.description}
                        </p>

                        {/* Progress bar */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: targetMeta.color }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.4, ease: "easeOut" }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {completedCount}/{t.checklist.length}
                          </span>
                        </div>

                        {/* Checklist */}
                        <div className="space-y-2">
                          {t.checklist.map((item, i) => {
                            const key = `${t.id}-${i}`;
                            const done = !!checkedItems[key];
                            return (
                              <button
                                key={i}
                                onClick={() =>
                                  setCheckedItems((prev) => ({
                                    ...prev,
                                    [key]: !prev[key],
                                  }))
                                }
                                className="w-full text-left flex items-start gap-2 group"
                              >
                                <div className="mt-0.5 shrink-0">
                                  {done ? (
                                    <CheckCircle2
                                      className="w-4 h-4"
                                      style={{ color: targetMeta.color }}
                                    />
                                  ) : (
                                    <Circle className="w-4 h-4 text-muted-foreground group-hover:text-muted-foreground transition-colors" />
                                  )}
                                </div>
                                <span
                                  className={cn(
                                    "text-xs leading-relaxed transition-colors",
                                    done ? "text-muted-foreground line-through" : "text-muted-foreground group-hover:text-foreground"
                                  )}
                                >
                                  {item}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {pct === 100 && (
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 flex items-center gap-1.5 text-xs font-semibold"
                            style={{ color: targetMeta.color }}
                          >
                            <Star className="w-3.5 h-3.5" />
                            Technique mastered — +{t.resistanceBoost}pts resistance
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Educational summary */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                Why Debiasing Works
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2 leading-relaxed">
              <p>
                Cognitive biases are not moral failures — they are systematic patterns in how
                the human brain processes information under uncertainty. They evolved to help us make
                fast decisions, but in financial markets, they reliably destroy value.
              </p>
              <p>
                The key insight from behavioral economics is that awareness alone is insufficient.
                You must create <span className="text-foreground">structural interventions</span> — checklists,
                pre-commitment rules, reference-class databases — that constrain the biased fast-thinking
                system before it acts.
              </p>
              <p>
                Research by Kahneman, Thaler, and Shiller suggests that investors with structured
                debiasing processes outperform their unstructured peers by{" "}
                <span className="text-green-400 font-semibold">2–4% per year</span> on average,
                compounding dramatically over decades.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
