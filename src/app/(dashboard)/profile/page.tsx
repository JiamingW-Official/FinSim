"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { useTradingStore } from "@/stores/trading-store";
import { useLearnStore } from "@/stores/learn-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Brain,
  Target,
  BookOpen,
  BarChart3,
  Trophy,
  CheckCircle2,
  ChevronRight,
  Flame,
  TrendingUp,
  TrendingDown,
  Star,
  Zap,
  Shield,
  Clock,
  DollarSign,
  Activity,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { ACHIEVEMENT_DEFS, getLevelForXP, LEVEL_THRESHOLDS } from "@/types/game";

// ─── Types ───────────────────────────────────────────────────────────────────

interface QuizAnswer {
  questionIndex: number;
  answerIndex: number;
}

interface ArchetypeResult {
  name: string;
  icon: string;
  color: string;
  description: string;
  strengths: string[];
  blindSpots: string[];
  strategies: string[];
  radarScores: number[]; // 8 axes: Patience, RiskAppetite, ResearchDepth, TechAnalysis, FundAnalysis, MacroAwareness, Discipline, Adaptability
}

// ─── Constants ────────────────────────────────────────────────────────────────

const QUIZ_QUESTIONS = [
  {
    question: "What's your preferred time horizon?",
    icon: Clock,
    options: ["Day trading (intraday)", "Swing trading (days–weeks)", "Long-term investing (months+)"],
  },
  {
    question: "How do you handle risk?",
    icon: Shield,
    options: ["Conservative — preserve capital", "Moderate — balanced risk/reward", "Aggressive — high risk, high reward"],
  },
  {
    question: "What drives your research?",
    icon: Brain,
    options: ["Fundamental analysis (earnings, valuation)", "Technical analysis (charts, patterns)", "Macro trends (rates, geopolitics)"],
  },
  {
    question: "How often do you trade?",
    icon: Activity,
    options: ["1–2 times per week", "Daily", "10+ times per week"],
  },
  {
    question: "Preferred asset class?",
    icon: DollarSign,
    options: ["Stocks only", "Options & derivatives", "Crypto & DeFi", "Diversified across all"],
  },
  {
    question: "Portfolio drops 20%. You…",
    icon: TrendingDown,
    options: ["Buy more — great opportunity", "Hold — stick to the plan", "Reduce — cut losses"],
  },
  {
    question: "Primary information source?",
    icon: BookOpen,
    options: ["News, earnings, and fundamentals", "Charts and price action", "Both equally"],
  },
  {
    question: "Annual return objective?",
    icon: Target,
    options: ["Under 10% (steady, safe)", "10–20% (market-beating)", "20%+ (outperformer)"],
  },
];

const ARCHETYPES: ArchetypeResult[] = [
  {
    name: "The Value Hunter",
    icon: "🔍",
    color: "text-primary",
    description: "You seek undervalued assets with strong fundamentals. Patient and research-driven, you buy when others sell.",
    strengths: ["Deep fundamental research", "Long-term conviction", "Contrarian thinking"],
    blindSpots: ["May miss momentum opportunities", "Overanalyzing can cause hesitation"],
    strategies: ["Value investing", "Dividend reinvestment", "Earnings plays"],
    radarScores: [90, 30, 95, 30, 95, 60, 85, 40],
  },
  {
    name: "The Momentum Rider",
    icon: "🚀",
    color: "text-emerald-400",
    description: "You ride trends and capitalize on momentum. Fast-moving, data-reactive, always looking for the next breakout.",
    strengths: ["Pattern recognition", "Quick execution", "Trend following"],
    blindSpots: ["Can be caught in reversals", "FOMO-driven entries"],
    strategies: ["Breakout trading", "Momentum plays", "Trend following"],
    radarScores: [30, 80, 60, 90, 40, 50, 50, 90],
  },
  {
    name: "The Income Builder",
    icon: "💰",
    color: "text-amber-400",
    description: "Steady, methodical, and yield-focused. You build wealth through compounding dividends and covered calls.",
    strengths: ["Consistent income generation", "Low emotional trading", "Portfolio stability"],
    blindSpots: ["Misses high-growth opportunities", "Lower ceiling on returns"],
    strategies: ["Covered calls", "Dividend stocks", "Bond laddering"],
    radarScores: [95, 20, 70, 50, 80, 50, 90, 30],
  },
  {
    name: "The Risk-Taker",
    icon: "🎯",
    color: "text-red-400",
    description: "You live for asymmetric bets. High conviction, concentrated positions, and big swings define your style.",
    strengths: ["High risk/reward setups", "Bold conviction", "Options expertise"],
    blindSpots: ["Overexposure to drawdowns", "May lack diversification"],
    strategies: ["Options speculation", "Concentrated bets", "Earnings volatility"],
    radarScores: [40, 95, 70, 80, 60, 60, 40, 85],
  },
  {
    name: "The Swing Trader",
    icon: "📈",
    color: "text-primary",
    description: "You capture multi-day moves using a blend of technical and fundamental triggers. Balanced and adaptive.",
    strengths: ["Balanced approach", "Good timing", "Adapts to market conditions"],
    blindSpots: ["Can be whipsawed", "Requires constant monitoring"],
    strategies: ["Swing setups", "Catalyst plays", "Mean reversion"],
    radarScores: [60, 65, 75, 80, 70, 55, 70, 80],
  },
  {
    name: "The Macro Strategist",
    icon: "🌍",
    color: "text-muted-foreground",
    description: "Big-picture thinker. You position around macro themes: rates, currencies, geopolitical shifts, and sectors.",
    strengths: ["Top-down thinking", "Sector rotation", "Macro foresight"],
    blindSpots: ["Macro timing is notoriously hard", "Individual stock selection"],
    strategies: ["Sector ETFs", "FX & commodity plays", "Rate-sensitive positions"],
    radarScores: [70, 55, 80, 50, 65, 95, 75, 70],
  },
];

const SKILL_BRANCHES = [
  { id: "technical", name: "Technical Analysis", icon: BarChart3, color: "#6366f1" },
  { id: "fundamental", name: "Fundamental Analysis", icon: BookOpen, color: "#10b981" },
  { id: "options", name: "Options", icon: Target, color: "#f59e0b" },
  { id: "macro", name: "Macro", icon: TrendingUp, color: "#3b82f6" },
  { id: "risk", name: "Risk Management", icon: Shield, color: "#ef4444" },
  { id: "quant", name: "Quantitative", icon: Brain, color: "#8b5cf6" },
  { id: "defi", name: "DeFi/Crypto", icon: Zap, color: "#f97316" },
  { id: "behavioral", name: "Behavioral", icon: Activity, color: "#ec4899" },
];

const SKILL_LEVELS = ["Novice", "Apprentice", "Practitioner", "Expert", "Master"];

const NEXT_LESSONS = [
  { title: "Advanced Candlestick Patterns", branch: "technical", eta: "~25 min" },
  { title: "DCF Valuation Fundamentals", branch: "fundamental", eta: "~30 min" },
  { title: "Options Greeks Deep Dive", branch: "options", eta: "~40 min" },
];

// ─── Helper functions ─────────────────────────────────────────────────────────

function computeArchetype(answers: QuizAnswer[]): ArchetypeResult {
  if (answers.length < 8) return ARCHETYPES[4]; // default: Swing Trader

  const scores: Record<string, number> = {
    value: 0, momentum: 0, income: 0, risk: 0, swing: 0, macro: 0,
  };

  const a = answers.map((q) => q.answerIndex);

  // Time horizon
  if (a[0] === 0) { scores.momentum += 2; scores.risk += 1; }
  if (a[0] === 1) { scores.swing += 2; }
  if (a[0] === 2) { scores.value += 2; scores.income += 2; }

  // Risk tolerance
  if (a[1] === 0) { scores.income += 2; scores.value += 1; }
  if (a[1] === 1) { scores.swing += 2; }
  if (a[1] === 2) { scores.risk += 3; scores.momentum += 1; }

  // Research style
  if (a[2] === 0) { scores.value += 3; scores.income += 1; }
  if (a[2] === 1) { scores.momentum += 2; scores.swing += 2; }
  if (a[2] === 2) { scores.macro += 3; }

  // Trading frequency
  if (a[3] === 0) { scores.swing += 2; scores.value += 1; }
  if (a[3] === 1) { scores.momentum += 1; scores.swing += 1; }
  if (a[3] === 2) { scores.momentum += 3; scores.risk += 2; }

  // Asset preference
  if (a[4] === 0) { scores.value += 1; scores.income += 1; }
  if (a[4] === 1) { scores.risk += 3; }
  if (a[4] === 2) { scores.momentum += 2; scores.risk += 1; }
  if (a[4] === 3) { scores.macro += 2; scores.swing += 1; }

  // Drawdown reaction
  if (a[5] === 0) { scores.value += 3; }
  if (a[5] === 1) { scores.income += 2; scores.swing += 1; }
  if (a[5] === 2) { scores.risk -= 1; scores.momentum += 1; }

  // Information source
  if (a[6] === 0) { scores.value += 2; scores.macro += 1; }
  if (a[6] === 1) { scores.momentum += 2; scores.risk += 1; }
  if (a[6] === 2) { scores.swing += 2; }

  // Return objective
  if (a[7] === 0) { scores.income += 2; }
  if (a[7] === 1) { scores.value += 1; scores.swing += 1; }
  if (a[7] === 2) { scores.risk += 2; scores.momentum += 1; }

  const map: Record<string, number> = {
    value: 0, momentum: 1, income: 2, risk: 3, swing: 4, macro: 5,
  };
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  return ARCHETYPES[map[best]];
}

function getSkillLevel(branchId: string, completedLessons: string[], totalTrades: number): number {
  // Simulate skill levels based on completed lessons and trades
  const branchLessonMap: Record<string, string[]> = {
    technical: ["technical-analysis", "candlesticks", "chart-patterns", "indicators", "advanced-ta"],
    fundamental: ["fundamentals-basics", "valuation", "earnings", "dcf", "financial-statements"],
    options: ["options-basics", "options-strategies", "greeks", "volatility", "advanced-options"],
    macro: ["macro-basics", "fed-policy", "global-macro", "sector-rotation", "currency-trading"],
    risk: ["risk-management", "position-sizing", "stop-losses", "portfolio-theory", "risk-advanced"],
    quant: ["quant-basics", "statistics", "backtesting", "algo-trading", "ml-trading"],
    defi: ["crypto-basics", "defi-protocols", "yield-farming", "on-chain-analysis", "defi-advanced"],
    behavioral: ["behavioral-basics", "cognitive-biases", "trading-psychology", "discipline", "mindset"],
  };

  const lessons = branchLessonMap[branchId] ?? [];
  let count = completedLessons.filter((l) =>
    lessons.some((lesson) => l.includes(lesson))
  ).length;

  // Add trade-based skill for technical/risk
  if (branchId === "technical" && totalTrades > 0) count += Math.min(2, Math.floor(totalTrades / 10));
  if (branchId === "risk" && totalTrades > 0) count += Math.min(1, Math.floor(totalTrades / 20));

  return Math.min(4, count); // 0–4 (maps to Novice–Master)
}

function getCurrentLevelProgress(xp: number): { current: number; needed: number; pct: number } {
  const level = getLevelForXP(xp);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? currentThreshold + 100;
  const current = xp - currentThreshold;
  const needed = nextThreshold - currentThreshold;
  return { current, needed, pct: needed > 0 ? (current / needed) * 100 : 100 };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RadarChart({ scores, archetype }: { scores: number[]; archetype: ArchetypeResult }) {
  const labels = ["Patience", "Risk", "Research", "Tech", "Fundamentals", "Macro", "Discipline", "Adaptability"];
  const cx = 120;
  const cy = 120;
  const maxR = 90;
  const n = 8;

  function polarToXY(index: number, value: number) {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const r = (value / 100) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  function getLabelXY(index: number) {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const r = maxR + 18;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  // Build polygon points
  const polyPoints = scores.map((s, i) => {
    const p = polarToXY(i, s);
    return `${p.x},${p.y}`;
  }).join(" ");

  // Grid rings at 25%, 50%, 75%, 100%
  const rings = [25, 50, 75, 100];

  return (
    <svg width="240" height="240" viewBox="0 0 240 240" className="mx-auto">
      {/* Grid rings */}
      {rings.map((r) => {
        const pts = Array.from({ length: n }, (_, i) => {
          const p = polarToXY(i, r);
          return `${p.x},${p.y}`;
        }).join(" ");
        return (
          <polygon
            key={r}
            points={pts}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        );
      })}
      {/* Spokes */}
      {Array.from({ length: n }, (_, i) => {
        const p = polarToXY(i, 100);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        );
      })}
      {/* Data polygon */}
      <polygon
        points={polyPoints}
        fill={archetype.color.replace("text-", "").includes("blue") ? "rgba(99,102,241,0.25)" :
              archetype.color.includes("emerald") ? "rgba(16,185,129,0.25)" :
              archetype.color.includes("amber") ? "rgba(245,158,11,0.25)" :
              archetype.color.includes("red") ? "rgba(239,68,68,0.25)" :
              archetype.color.includes("violet") ? "rgba(139,92,246,0.25)" :
              "rgba(6,182,212,0.25)"}
        stroke={archetype.color.includes("blue") ? "#6366f1" :
                archetype.color.includes("emerald") ? "#10b981" :
                archetype.color.includes("amber") ? "#f59e0b" :
                archetype.color.includes("red") ? "#ef4444" :
                archetype.color.includes("violet") ? "#8b5cf6" :
                "#06b6d4"}
        strokeWidth="2"
      />
      {/* Data dots */}
      {scores.map((s, i) => {
        const p = polarToXY(i, s);
        return <circle key={i} cx={p.x} cy={p.y} r="3" fill="white" opacity="0.8" />;
      })}
      {/* Labels */}
      {labels.map((label, i) => {
        const { x, y } = getLabelXY(i);
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="8"
            fill="rgba(255,255,255,0.55)"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

function SkillTreeSVG({
  branchIndex,
  currentLevel,
  color,
}: {
  branchIndex: number;
  currentLevel: number;
  color: string;
}) {
  const nodes = SKILL_LEVELS.map((label, i) => ({
    label,
    unlocked: i <= currentLevel,
    active: i === currentLevel,
  }));

  return (
    <svg width="100%" height="36" viewBox="0 0 200 36">
      {/* Connector line */}
      <line x1="16" y1="18" x2="184" y2="18" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
      {/* Filled connector up to current level */}
      <line
        x1="16"
        y1="18"
        x2={16 + currentLevel * 42}
        y2="18"
        stroke={color}
        strokeWidth="2"
        opacity="0.6"
      />
      {nodes.map((node, i) => {
        const cx = 16 + i * 42;
        return (
          <g key={i}>
            <circle
              cx={cx}
              cy={18}
              r={node.active ? 9 : 7}
              fill={node.unlocked ? color : "rgba(255,255,255,0.08)"}
              opacity={node.unlocked ? 1 : 0.4}
            />
            {!node.unlocked && (
              <text x={cx} y={22} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.3)">
                🔒
              </text>
            )}
            {node.active && (
              <circle cx={cx} cy={18} r={12} fill="none" stroke={color} strokeWidth="1.5" opacity="0.4" />
            )}
          </g>
        );
      })}
    </svg>
  );
}

function HeatmapCalendar({ tradeHistory }: { tradeHistory: { timestamp: number }[] }) {
  const days = 30;
  const today = Date.now();
  const dayMs = 86400000;

  const activityMap = new Map<string, number>();
  tradeHistory.forEach((t) => {
    const key = new Date(t.timestamp).toISOString().slice(0, 10);
    activityMap.set(key, (activityMap.get(key) ?? 0) + 1);
  });

  const cells = Array.from({ length: days }, (_, i) => {
    const d = new Date(today - (days - 1 - i) * dayMs);
    const key = d.toISOString().slice(0, 10);
    const count = activityMap.get(key) ?? 0;
    return { key, count, day: d.getDate() };
  });

  const maxCount = Math.max(1, ...cells.map((c) => c.count));

  return (
    <div className="flex gap-1 flex-wrap">
      {cells.map((cell) => {
        const intensity = cell.count / maxCount;
        const opacity = cell.count === 0 ? 0.08 : 0.2 + intensity * 0.75;
        return (
          <div
            key={cell.key}
            title={`${cell.key}: ${cell.count} trades`}
            className="w-5 h-5 rounded-sm flex items-center justify-center text-[11px] text-foreground/40"
            style={{
              backgroundColor: `rgba(16, 185, 129, ${opacity})`,
              border: cell.count > 0 ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {cell.day}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { xp, level, achievements, stats, loginStreak } = useGameStore();
  const { tradeHistory, cash, portfolioValue } = useTradingStore();
  const { completedLessons, learningStreak, lessonScores } = useLearnStore();

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Learning path state
  const [timeCommitment, setTimeCommitment] = useState([30]);
  const [learningStyle, setLearningStyle] = useState<"read" | "practice" | "deep">("read");

  // Goals state
  const [portfolioGoal, setPortfolioGoal] = useState(150000);

  const archetype = useMemo(() => computeArchetype(quizAnswers), [quizAnswers]);

  // ── Trade stats computed ──
  const trades = tradeHistory.filter((t) => t.side === "sell");
  const wins = trades.filter((t) => t.realizedPnL > 0);
  const losses = trades.filter((t) => t.realizedPnL <= 0);
  const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;
  const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.realizedPnL, 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + t.realizedPnL, 0) / losses.length) : 0;
  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0;

  const bestTicker = useMemo(() => {
    const byTicker: Record<string, number> = {};
    trades.forEach((t) => {
      byTicker[t.ticker] = (byTicker[t.ticker] ?? 0) + t.realizedPnL;
    });
    const sorted = Object.entries(byTicker).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] ?? "—";
  }, [trades]);

  const worstTrade = useMemo(() => {
    if (trades.length === 0) return null;
    return trades.reduce((w, t) => (t.realizedPnL < w.realizedPnL ? t : w), trades[0]);
  }, [trades]);

  // Level progress
  const levelProgress = getCurrentLevelProgress(xp);
  const nextLevel = level + 1;

  // Skill levels per branch
  const skillLevels = useMemo(
    () =>
      SKILL_BRANCHES.map((b) => ({
        ...b,
        level: getSkillLevel(b.id, completedLessons, stats.totalTrades),
      })),
    [completedLessons, stats.totalTrades],
  );

  // Top 3 achievements not yet unlocked
  const unlockedIds = new Set(achievements.map((a) => a.id));
  const upcomingAchievements = ACHIEVEMENT_DEFS.filter((a) => !unlockedIds.has(a.id)).slice(0, 3);

  // Lesson total estimate
  const TOTAL_LESSONS_ESTIMATE = 60;
  const lessonPct = Math.min(100, (completedLessons.length / TOTAL_LESSONS_ESTIMATE) * 100);

  // Community percentile (simulated)
  const communityPercentile = Math.min(99, Math.round(winRate * 0.8 + level * 1.2));

  // Week curriculum
  const curriculum = [
    {
      week: 1,
      theme: "Foundations",
      days: [
        { day: "Mon", lesson: "Market Structure Basics", duration: timeCommitment[0] },
        { day: "Wed", lesson: "Reading Candlestick Charts", duration: timeCommitment[0] },
        { day: "Fri", lesson: "Support & Resistance", duration: timeCommitment[0] },
      ],
    },
    {
      week: 2,
      theme: "Technical Deep Dive",
      days: [
        { day: "Mon", lesson: "Moving Averages & Trends", duration: timeCommitment[0] },
        { day: "Tue", lesson: "RSI & Momentum", duration: timeCommitment[0] },
        { day: "Thu", lesson: "Volume Analysis", duration: timeCommitment[0] },
        { day: "Fri", lesson: "Breakout Strategies", duration: timeCommitment[0] },
      ],
    },
    {
      week: 3,
      theme: "Risk & Position Sizing",
      days: [
        { day: "Mon", lesson: "Risk/Reward Ratios", duration: timeCommitment[0] },
        { day: "Wed", lesson: "Portfolio Allocation", duration: timeCommitment[0] },
        { day: "Fri", lesson: "Stop-Loss Placement", duration: timeCommitment[0] },
      ],
    },
    {
      week: 4,
      theme: "Advanced Strategies",
      days: [
        { day: "Mon", lesson: "Options Basics", duration: timeCommitment[0] },
        { day: "Tue", lesson: "Fundamental Catalysts", duration: timeCommitment[0] },
        { day: "Thu", lesson: "Macro Context", duration: timeCommitment[0] },
        { day: "Fri", lesson: "Paper Trading Review", duration: timeCommitment[0] },
      ],
    },
  ];

  // Recent achievements (milestones)
  const recentAchievements = achievements
    .slice()
    .sort((a, b) => b.unlockedAt - a.unlockedAt)
    .slice(0, 5);

  function handleQuizAnswer(qIdx: number, aIdx: number) {
    const updated = [...quizAnswers.filter((q) => q.questionIndex !== qIdx), { questionIndex: qIdx, answerIndex: aIdx }];
    setQuizAnswers(updated);
    if (qIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(qIdx + 1);
    } else {
      setQuizComplete(true);
    }
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 280, damping: 26 } },
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background">
      <div className="mx-auto w-full max-w-3xl space-y-4 p-4 pb-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight">Investor Profile</h1>
            <p className="text-xs text-muted-foreground">Personalized analysis & learning path</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1 text-xs">
              <Zap className="h-3 w-3 text-amber-400" />
              Level {level}
            </Badge>
            <Badge variant="outline" className="gap-1 text-xs">
              <Flame className="h-3 w-3 text-orange-400" />
              {loginStreak}d streak
            </Badge>
          </div>
        </motion.div>

        <Tabs defaultValue="dna">
          <TabsList className="grid w-full grid-cols-5 mb-4 h-9">
            <TabsTrigger value="dna" className="text-xs px-1">
              <Brain className="h-3 w-3 mr-1" />
              DNA
            </TabsTrigger>
            <TabsTrigger value="skills" className="text-xs px-1">
              <Star className="h-3 w-3 mr-1" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="path" className="text-xs px-1">
              <BookOpen className="h-3 w-3 mr-1" />
              Path
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs px-1">
              <BarChart3 className="h-3 w-3 mr-1" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="goals" className="text-xs px-1">
              <Trophy className="h-3 w-3 mr-1" />
              Goals
            </TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Trading DNA ── */}
          <TabsContent value="dna" className="space-y-4 data-[state=inactive]:hidden">
            <AnimatePresence mode="wait">
              {!quizComplete ? (
                <motion.div key="quiz" variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                  <Card className="border-border bg-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold">Trading DNA Assessment</CardTitle>
                        <span className="text-xs text-muted-foreground">
                          {currentQuestion + 1} / {QUIZ_QUESTIONS.length}
                        </span>
                      </div>
                      <Progress value={((currentQuestion) / QUIZ_QUESTIONS.length) * 100} className="h-1" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentQuestion}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                        >
                          {(() => {
                            const q = QUIZ_QUESTIONS[currentQuestion];
                            const Icon = q.icon;
                            return (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                                    <Icon className="h-3.5 w-3.5 text-primary" />
                                  </div>
                                  <p className="text-sm font-medium">{q.question}</p>
                                </div>
                                <div className="space-y-2">
                                  {q.options.map((option, i) => {
                                    const answered = quizAnswers.find((a) => a.questionIndex === currentQuestion);
                                    const isSelected = answered?.answerIndex === i;
                                    return (
                                      <button
                                        key={i}
                                        onClick={() => handleQuizAnswer(currentQuestion, i)}
                                        className={`w-full text-left rounded-lg border px-3 py-2.5 text-sm transition-all ${
                                          isSelected
                                            ? "border-primary/60 bg-primary/10 text-foreground"
                                            : "border-border bg-background/50 text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
                                        }`}
                                      >
                                        <span className="mr-2 text-xs opacity-50">{["A", "B", "C"][i]}.</span>
                                        {option}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                        </motion.div>
                      </AnimatePresence>

                      {currentQuestion > 0 && (
                        <button
                          onClick={() => setCurrentQuestion(currentQuestion - 1)}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Back to previous question
                        </button>
                      )}
                    </CardContent>
                  </Card>

                  {/* Progress dots */}
                  <div className="flex justify-center gap-1.5">
                    {QUIZ_QUESTIONS.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all ${
                          i < quizAnswers.length ? "w-4 bg-primary" : i === currentQuestion ? "w-4 bg-primary/50" : "w-1.5 bg-border"
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="result" variants={fadeUp} initial="hidden" animate="show" className="space-y-4">
                  {/* Archetype card */}
                  <Card className="border-border bg-card overflow-hidden">
                    <div className="h-1 w-full bg-primary" />
                    <CardContent className="pt-5 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="text-2xl">{archetype.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-base font-bold">{archetype.name}</h2>
                            <Badge variant="secondary" className="text-xs">Your Archetype</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{archetype.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-emerald-500/8 border border-emerald-500/20 p-3">
                          <p className="text-xs text-emerald-400 font-semibold uppercase mb-2">Strengths</p>
                          <ul className="space-y-1">
                            {archetype.strengths.map((s) => (
                              <li key={s} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-lg bg-amber-500/8 border border-amber-500/20 p-3">
                          <p className="text-xs text-amber-400 font-semibold uppercase mb-2">Blind Spots</p>
                          <ul className="space-y-1">
                            {archetype.blindSpots.map((s) => (
                              <li key={s} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="rounded-lg bg-primary/5 border border-primary/15 p-3">
                        <p className="text-xs text-primary font-semibold uppercase mb-2">Recommended Strategies</p>
                        <div className="flex flex-wrap gap-1.5">
                          {archetype.strategies.map((s) => (
                            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Radar chart */}
                  <Card className="border-border bg-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Trait Radar</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RadarChart scores={archetype.radarScores} archetype={archetype} />
                    </CardContent>
                  </Card>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      setQuizAnswers([]);
                      setQuizComplete(false);
                      setCurrentQuestion(0);
                    }}
                  >
                    Retake Assessment
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* ── Tab 2: Skill Progression ── */}
          <TabsContent value="skills" className="space-y-4 data-[state=inactive]:hidden">
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-4">
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Skill Tree</CardTitle>
                  <p className="text-xs text-muted-foreground">Progress across 8 trading disciplines</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {skillLevels.map((branch) => {
                    const Icon = branch.icon;
                    return (
                      <div key={branch.id} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5" style={{ color: branch.color }} />
                            <span className="text-xs font-medium">{branch.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">
                              {SKILL_LEVELS[branch.level]}
                            </span>
                            {branch.level === 4 && (
                              <Badge className="text-[11px] py-0 px-1.5 h-4" style={{ backgroundColor: branch.color + "30", color: branch.color, border: `1px solid ${branch.color}40` }}>
                                Master
                              </Badge>
                            )}
                          </div>
                        </div>
                        <SkillTreeSVG branchIndex={0} currentLevel={branch.level} color={branch.color} />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Learning recommendations */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Next Lessons Recommended</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {NEXT_LESSONS.map((lesson, i) => {
                    return (
                      <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-3 py-2.5 hover:border-primary/30 transition-colors cursor-pointer">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold text-foreground/70 bg-foreground/[0.08]">
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-xs font-medium">{lesson.title}</p>
                            <p className="text-xs text-muted-foreground capitalize">{lesson.branch} · {lesson.eta}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Skill gap vs average */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Skill Gap Analysis</CardTitle>
                  <p className="text-xs text-muted-foreground">vs. average user at Level {level}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2.5">
                    {skillLevels.slice(0, 5).map((branch) => {
                      const avgLevel = Math.min(4, Math.floor(level / 8)); // simulated avg
                      const gap = branch.level - avgLevel;
                      return (
                        <div key={branch.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{branch.name}</span>
                            <span className={gap >= 0 ? "text-emerald-400" : "text-red-400"}>
                              {gap >= 0 ? "+" : ""}{gap} levels vs avg
                            </span>
                          </div>
                          <div className="flex gap-1.5 items-center">
                            <div className="flex-1 h-1.5 rounded-full bg-foreground/[0.08]">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${(branch.level / 4) * 100}%`, backgroundColor: branch.color }}
                              />
                            </div>
                            <div className="flex-1 h-1.5 rounded-full bg-foreground/[0.08]">
                              <div
                                className="h-full rounded-full bg-foreground/25 transition-all"
                                style={{ width: `${(avgLevel / 4) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex gap-3 mt-2 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-1.5 rounded-full bg-primary" />
                        You
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-1.5 rounded-full bg-foreground/25" />
                        Avg user
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ── Tab 3: Learning Path ── */}
          <TabsContent value="path" className="space-y-4 data-[state=inactive]:hidden">
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-4">
              {/* Course progress summary */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Lessons Done", value: completedLessons.length, icon: CheckCircle2, color: "text-emerald-400" },
                  { label: "Learn Streak", value: `${learningStreak}d`, icon: Flame, color: "text-orange-400" },
                  { label: "Completion", value: `${Math.round(lessonPct)}%`, icon: Target, color: "text-primary" },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={stat.label} className="border-border bg-card">
                      <CardContent className="pt-3 pb-3 text-center">
                        <Icon className={`h-4 w-4 mx-auto mb-1 ${stat.color}`} />
                        <div className="text-base font-bold">{stat.value}</div>
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Overall progress */}
              <Card className="border-border bg-card">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">Overall Course Progress</span>
                    <span className="text-muted-foreground">{completedLessons.length} / {TOTAL_LESSONS_ESTIMATE} lessons</span>
                  </div>
                  <Progress value={lessonPct} className="h-2" />
                  <p className="text-xs text-muted-foreground">{TOTAL_LESSONS_ESTIMATE - completedLessons.length} lessons remaining</p>
                </CardContent>
              </Card>

              {/* Time commitment & style */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Learning Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Daily time commitment</span>
                      <span className="font-medium text-primary">{timeCommitment[0]} min/day</span>
                    </div>
                    <Slider
                      value={timeCommitment}
                      onValueChange={setTimeCommitment}
                      min={15}
                      max={60}
                      step={15}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>15 min</span>
                      <span>30 min</span>
                      <span>45 min</span>
                      <span>60 min</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium">Learning style</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: "read", label: "Read + Quiz" },
                        { id: "practice", label: "Video + Practice" },
                        { id: "deep", label: "Deep Dive" },
                      ].map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setLearningStyle(style.id as typeof learningStyle)}
                          className={`rounded-lg border py-2 text-xs font-medium transition-all ${
                            learningStyle === style.id
                              ? "border-primary/60 bg-primary/10 text-foreground"
                              : "border-border bg-background/50 text-muted-foreground hover:border-primary/30"
                          }`}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 4-week curriculum */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Your 4-Week Curriculum</CardTitle>
                  <p className="text-xs text-muted-foreground">Personalized based on your profile</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {curriculum.map((week, wi) => (
                    <div key={wi} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
                          {week.week}
                        </div>
                        <span className="text-xs font-semibold">Week {week.week}: {week.theme}</span>
                      </div>
                      <div className="ml-7 space-y-1.5">
                        {week.days.map((d, di) => (
                          <div key={di} className="flex items-center justify-between rounded-md bg-foreground/[0.03] px-2.5 py-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-medium text-muted-foreground w-6">{d.day}</span>
                              <span className="text-[11px]">{d.lesson}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{d.duration}m</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Achievements grid */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Earned Badges</CardTitle>
                  <p className="text-xs text-muted-foreground">{achievements.length} unlocked</p>
                </CardHeader>
                <CardContent>
                  {achievements.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">Complete trades and lessons to earn badges</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {achievements.map((a) => (
                        <div
                          key={a.id}
                          title={`${a.name}: ${a.description}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-lg"
                        >
                          {a.icon === "Zap" ? "⚡" : a.icon === "TrendingUp" ? "📈" : a.icon === "Flame" ? "🔥" : a.icon === "Trophy" ? "🏆" : a.icon === "Star" ? "⭐" : "🎯"}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming milestones */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Upcoming Milestones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingAchievements.map((def) => {
                    const current = def.id === "ten_trades" ? stats.totalTrades
                      : def.id === "fifty_trades" ? stats.totalTrades
                      : def.id === "five_streak" ? stats.consecutiveWins
                      : def.id === "diversified" ? stats.uniqueTickersTraded.length
                      : 0;
                    const target = def.id === "ten_trades" ? 10
                      : def.id === "fifty_trades" ? 50
                      : def.id === "five_streak" ? 5
                      : def.id === "diversified" ? 5
                      : 1;
                    const pct = Math.min(100, (current / target) * 100);
                    return (
                      <div key={def.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">{def.name}</span>
                          <span className="text-muted-foreground">{current} / {target}</span>
                        </div>
                        <Progress value={pct} className="h-1.5" />
                        <p className="text-xs text-muted-foreground">{def.description}</p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ── Tab 4: Performance Analytics ── */}
          <TabsContent value="analytics" className="space-y-4 data-[state=inactive]:hidden">
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-4">
              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Win Rate", value: `${winRate.toFixed(1)}%`, icon: TrendingUp, color: winRate >= 50 ? "text-emerald-400" : "text-red-400" },
                  { label: "Total Trades", value: stats.totalTrades, icon: Activity, color: "text-primary" },
                  { label: "Avg Win", value: `$${avgWin.toFixed(0)}`, icon: DollarSign, color: "text-emerald-400" },
                  { label: "Avg Loss", value: `$${avgLoss.toFixed(0)}`, icon: TrendingDown, color: "text-red-400" },
                  { label: "Profit Factor", value: isFinite(profitFactor) ? profitFactor.toFixed(2) : "∞", icon: BarChart3, color: profitFactor >= 1.5 ? "text-emerald-400" : "text-amber-400" },
                  { label: "Best Asset", value: bestTicker, icon: Star, color: "text-amber-400" },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={stat.label} className="border-border bg-card">
                      <CardContent className="pt-3 pb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`h-3.5 w-3.5 ${stat.color}`} />
                          <span className="text-xs text-muted-foreground">{stat.label}</span>
                        </div>
                        <div className="text-sm font-bold">{stat.value}</div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Community percentile */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Community Standing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Overall Percentile</span>
                      <span className="font-bold text-primary">Top {100 - communityPercentile}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-foreground/[0.08] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${communityPercentile}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                  </div>
                  {[
                    { label: "Win Rate Rank", pct: Math.min(99, winRate * 0.9) },
                    { label: "Trade Volume Rank", pct: Math.min(99, stats.totalTrades * 2) },
                    { label: "Learning Rank", pct: Math.min(99, completedLessons.length * 4) },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span>Top {100 - Math.round(item.pct)}%</span>
                      </div>
                      <Progress value={item.pct} className="h-1" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Strategy breakdown */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Performance by Style</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { style: "Buy & Hold", trades: Math.max(0, stats.totalTrades - stats.shortTradesCount - stats.optionsTradesCount), winRate: Math.min(100, winRate + 5), pnl: stats.totalPnL * 0.6 },
                      { style: "Short Selling", trades: stats.shortTradesCount, winRate: Math.max(0, winRate - 8), pnl: stats.totalPnL * 0.2 },
                      { style: "Options", trades: stats.optionsTradesCount, winRate: Math.max(0, winRate - 3), pnl: stats.optionsTotalPnL },
                    ].map((row) => (
                      <div key={row.style} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <div>
                          <p className="text-xs font-medium">{row.style}</p>
                          <p className="text-xs text-muted-foreground">{row.trades} trades</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs font-medium ${row.winRate >= 50 ? "text-emerald-400" : "text-red-400"}`}>
                            {row.winRate.toFixed(0)}% WR
                          </p>
                          <p className={`text-xs ${row.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {row.pnl >= 0 ? "+" : ""}${row.pnl.toFixed(0)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Psychological stats */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Psychological Profile</CardTitle>
                  <p className="text-xs text-muted-foreground">Behavioral patterns from your trade history</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      label: "Avg Hold Time",
                      value: trades.length > 1
                        ? `${Math.round((trades[0].timestamp - trades[trades.length - 1].timestamp) / trades.length / 3600000)}h avg`
                        : "N/A",
                      icon: Clock,
                      note: "Time between entry and exit",
                    },
                    {
                      label: "Consecutive Wins Best",
                      value: `${stats.consecutiveWins} trades`,
                      icon: Flame,
                      note: "Longest winning streak",
                    },
                    {
                      label: "Discipline Score",
                      value: `${Math.min(100, stats.limitOrdersUsed * 10 + (stats.maxDrawdownStreak * 5))}%`,
                      icon: Shield,
                      note: "Based on limit orders & drawdown control",
                    },
                    {
                      label: "Diversification",
                      value: `${stats.uniqueTickersTraded.length} assets`,
                      icon: Activity,
                      note: "Unique tickers traded",
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                          <div>
                            <p className="text-xs font-medium">{item.label}</p>
                            <p className="text-xs text-muted-foreground">{item.note}</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold">{item.value}</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Activity heatmap */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">30-Day Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <HeatmapCalendar tradeHistory={tradeHistory} />
                  <p className="text-xs text-muted-foreground mt-2">Each cell = trading activity intensity</p>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ── Tab 5: Goals & Milestones ── */}
          <TabsContent value="goals" className="space-y-4 data-[state=inactive]:hidden">
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-4">
              {/* Level progression */}
              <Card className="border-border bg-card overflow-hidden">
                <div className="h-0.5 w-full bg-primary" />
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 border border-primary/25">
                        <span className="text-sm font-bold text-primary">{level}</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold">Current Level</p>
                        <p className="text-xs text-muted-foreground">{xp.toLocaleString()} XP total</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-xs font-semibold text-right">Level {nextLevel}</p>
                        <p className="text-xs text-muted-foreground">{levelProgress.needed - levelProgress.current} XP needed</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 border border-border">
                        <span className="text-sm font-bold text-primary">{nextLevel}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{levelProgress.current} XP</span>
                      <span>{levelProgress.needed} XP</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-foreground/[0.08] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${levelProgress.pct}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Goal setter */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Active Goals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Portfolio target */}
                  <div className="space-y-2 rounded-lg border border-border bg-background/40 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-xs font-medium">Portfolio Target</span>
                      </div>
                      <Badge variant="secondary" className="text-[11px]">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Current: ${portfolioValue.toLocaleString()}</span>
                      <span className="font-medium">Target: ${portfolioGoal.toLocaleString()}</span>
                    </div>
                    <Progress
                      value={Math.min(100, (portfolioValue / portfolioGoal) * 100)}
                      className="h-1.5"
                    />
                    <p className="text-xs text-muted-foreground">
                      {portfolioValue >= portfolioGoal
                        ? "Goal achieved!"
                        : `$${(portfolioGoal - portfolioValue).toLocaleString()} remaining`}
                    </p>
                  </div>

                  {/* Learning goal */}
                  <div className="space-y-2 rounded-lg border border-border bg-background/40 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-medium">Learning Goal</span>
                      </div>
                      <Badge variant="secondary" className="text-[11px]">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Completed: {completedLessons.length}</span>
                      <span className="font-medium">Target: 20 lessons</span>
                    </div>
                    <Progress value={Math.min(100, (completedLessons.length / 20) * 100)} className="h-1.5" />
                    <p className="text-xs text-muted-foreground">
                      {completedLessons.length >= 20 ? "Goal achieved!" : `${20 - completedLessons.length} lessons to go`}
                    </p>
                  </div>

                  {/* Trading win rate goal */}
                  <div className="space-y-2 rounded-lg border border-border bg-background/40 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-medium">Win Rate Goal</span>
                      </div>
                      <Badge variant="secondary" className="text-[11px]">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Current: {winRate.toFixed(1)}%</span>
                      <span className="font-medium">Target: 60%</span>
                    </div>
                    <Progress value={Math.min(100, (winRate / 60) * 100)} className="h-1.5" />
                    <p className="text-xs text-muted-foreground">
                      {winRate >= 60 ? "Goal achieved!" : `${(60 - winRate).toFixed(1)}% improvement needed`}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Recent achievements */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Achievement History</CardTitle>
                  <p className="text-xs text-muted-foreground">Last 5 milestones reached</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recentAchievements.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No achievements yet — start trading!</p>
                  ) : (
                    recentAchievements.map((a) => (
                      <div key={a.id} className="flex items-center gap-3 rounded-lg bg-amber-500/5 border border-amber-500/15 px-3 py-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-base shrink-0">
                          {a.icon === "Zap" ? "⚡" : a.icon === "TrendingUp" ? "📈" : a.icon === "Flame" ? "🔥" : a.icon === "Trophy" ? "🏆" : "🎯"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium">{a.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{a.description}</p>
                        </div>
                        <span className="text-[11px] text-muted-foreground shrink-0">
                          {new Date(a.unlockedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Streak calendar */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">30-Day Streak Calendar</CardTitle>
                    <div className="flex items-center gap-1.5">
                      <Flame className="h-3.5 w-3.5 text-orange-400" />
                      <span className="text-xs font-semibold text-orange-400">{loginStreak} day streak</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <HeatmapCalendar tradeHistory={tradeHistory} />
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Less active</span>
                    <div className="flex gap-1">
                      {[0.1, 0.3, 0.5, 0.7, 0.95].map((o, i) => (
                        <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: `rgba(16, 185, 129, ${o})` }} />
                      ))}
                    </div>
                    <span>More active</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
