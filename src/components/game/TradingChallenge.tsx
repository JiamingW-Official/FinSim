"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Zap, TrendingUp, TrendingDown, Shield, Target,
  Timer, Star, BarChart2, RefreshCw, Play, ChevronRight,
  Award, Flame, CheckCircle, XCircle, Clock, Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// PRNG
// ---------------------------------------------------------------------------
function makePrng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type ChallengeId =
  | "crash_survival"
  | "bull_run"
  | "choppy_market"
  | "earnings_roulette"
  | "options_income";

type AppScreen =
  | "lobby"
  | "rapid_fire"
  | "pattern_quiz"
  | "strategy_battle"
  | "leaderboard";

interface ChallengeConfig {
  id: ChallengeId;
  name: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Expert";
  timeLimitSec: number;
  icon: React.ReactNode;
  screen: AppScreen;
  highScore: number;
}

interface Bar {
  open: number;
  high: number;
  low: number;
  close: number;
}

interface PatternQuiz {
  bars: Bar[];
  correctLabel: string;
  label: string;
}

type BotId = "momentum_mo" | "value_vera" | "trend_tommy";

interface BotResult {
  id: BotId;
  name: string;
  strategy: string;
  color: string;
  finalReturn: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  badge: string;
}

// ---------------------------------------------------------------------------
// Helpers — price series generation
// ---------------------------------------------------------------------------
function generateCrashBars(rand: () => number): Bar[] {
  const bars: Bar[] = [];
  let price = 100;
  for (let i = 0; i < 20; i++) {
    const phase = i < 8 ? 1 : i < 14 ? -2.5 : -0.5;
    const change = (rand() - 0.45 + phase * 0.05) * 4;
    const open = price;
    const close = Math.max(40, price + change);
    const high = Math.max(open, close) + rand() * 2;
    const low = Math.min(open, close) - rand() * 2;
    bars.push({ open, high, low, close });
    price = close;
  }
  return bars;
}

function generateBullBars(rand: () => number): Bar[] {
  const bars: Bar[] = [];
  let price = 100;
  for (let i = 0; i < 20; i++) {
    const change = (rand() - 0.35) * 5;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + rand() * 2;
    const low = Math.min(open, close) - rand() * 2;
    bars.push({ open, high, low, close });
    price = close;
  }
  return bars;
}

function generateChoppyBars(rand: () => number): Bar[] {
  const bars: Bar[] = [];
  let price = 100;
  for (let i = 0; i < 20; i++) {
    const change = (rand() - 0.5) * 7;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + rand() * 3;
    const low = Math.min(open, close) - rand() * 3;
    bars.push({ open, high, low, close });
    price = close;
  }
  return bars;
}

function generateBarsForChallenge(id: ChallengeId, seed: number): Bar[] {
  const rand = makePrng(seed);
  if (id === "crash_survival") return generateCrashBars(rand);
  if (id === "bull_run") return generateBullBars(rand);
  return generateChoppyBars(rand);
}

// ---------------------------------------------------------------------------
// Helpers — pattern generation
// ---------------------------------------------------------------------------
const PATTERN_LABELS = ["Hammer", "Shooting Star", "Engulfing", "Doji", "None"];

function buildHammer(): Bar[] {
  return [
    { open: 105, high: 107, low: 100, close: 104 },
    { open: 103, high: 105, low: 98, close: 102 },
    { open: 101, high: 103, low: 96, close: 100 },
    { open: 100, high: 101, low: 95, close: 99 },
    { open: 98, high: 99.5, low: 91, close: 98.8 }, // hammer: long lower wick
  ];
}

function buildShootingStar(): Bar[] {
  return [
    { open: 95, high: 97, low: 93, close: 96 },
    { open: 96, high: 99, low: 95, close: 98 },
    { open: 98, high: 101, low: 97, close: 99 },
    { open: 100, high: 103, low: 99, close: 102 },
    { open: 102, high: 109, low: 101.5, close: 102.3 }, // shooting star: long upper wick
  ];
}

function buildEngulfing(): Bar[] {
  return [
    { open: 105, high: 107, low: 103, close: 104 },
    { open: 104, high: 105, low: 102, close: 103 },
    { open: 103, high: 104, low: 101, close: 102 },
    { open: 102, high: 103, low: 100, close: 101 },
    { open: 100, high: 106, low: 99.5, close: 105.5 }, // bullish engulfing
  ];
}

function buildDoji(): Bar[] {
  return [
    { open: 100, high: 102, low: 98, close: 101 },
    { open: 101, high: 103, low: 99, close: 102 },
    { open: 102, high: 104, low: 100, close: 103 },
    { open: 103, high: 105, low: 101, close: 104 },
    { open: 104, high: 107, low: 101, close: 104.05 }, // doji: open ≈ close
  ];
}

function buildNone(rand: () => number): Bar[] {
  const bars: Bar[] = [];
  let p = 100;
  for (let i = 0; i < 5; i++) {
    const c = p + (rand() - 0.5) * 3;
    bars.push({ open: p, high: Math.max(p, c) + rand(), low: Math.min(p, c) - rand(), close: c });
    p = c;
  }
  return bars;
}

function generatePatternQuizzes(seed: number): PatternQuiz[] {
  const rand = makePrng(seed + 77);
  const templates: Array<{ label: string; bars: Bar[] }> = [
    { label: "Hammer", bars: buildHammer() },
    { label: "Shooting Star", bars: buildShootingStar() },
    { label: "Engulfing", bars: buildEngulfing() },
    { label: "Doji", bars: buildDoji() },
    { label: "None", bars: buildNone(rand) },
  ];

  const quizzes: PatternQuiz[] = [];
  for (let i = 0; i < 10; i++) {
    const t = templates[Math.floor(rand() * templates.length)];
    quizzes.push({
      bars: t.bars,
      correctLabel: t.label,
      label: t.label,
    });
  }
  return quizzes;
}

// ---------------------------------------------------------------------------
// Helpers — bot strategy simulation
// ---------------------------------------------------------------------------
function simulateBotReturn(strategy: BotId, seed: number): number {
  const rand = makePrng(seed + (strategy === "momentum_mo" ? 11 : strategy === "value_vera" ? 22 : 33));
  let capital = 100;
  for (let i = 0; i < 30; i++) {
    let chg = (rand() - 0.5) * 6;
    if (strategy === "momentum_mo") chg *= 1.3; // more volatile
    if (strategy === "value_vera") chg *= 0.7; // less volatile
    capital *= 1 + chg / 100;
  }
  return parseFloat(((capital - 100)).toFixed(2));
}

// ---------------------------------------------------------------------------
// Helpers — leaderboard
// ---------------------------------------------------------------------------
const NAMES = [
  "AlphaBot99", "TrendMaster", "QuantKing", "IronHands", "BullRider",
  "SilverFox", "NightTrader", "RiskZero", "MoonShot", "BearSlayer",
];

function generateLeaderboard(seed: number, playerScore: number): LeaderboardEntry[] {
  const rand = makePrng(seed + 500);
  const entries: LeaderboardEntry[] = NAMES.map((name, i) => ({
    rank: i + 1,
    name,
    score: Math.floor(rand() * 8000 + 2000),
    badge: i < 3 ? ["gold", "silver", "bronze"][i] : "none",
  }));
  entries.push({ rank: 0, name: "You", score: playerScore, badge: "player" });
  entries.sort((a, b) => b.score - a.score);
  entries.forEach((e, i) => { e.rank = i + 1; });
  return entries;
}

// ---------------------------------------------------------------------------
// SVG Mini Chart
// ---------------------------------------------------------------------------
function MiniCandleChart({ bars, width = 200, height = 80 }: { bars: Bar[]; width?: number; height?: number }) {
  const pad = 6;
  const allPrices = bars.flatMap((b) => [b.high, b.low]);
  const minP = Math.min(...allPrices);
  const maxP = Math.max(...allPrices);
  const range = maxP - minP || 1;
  const scaleY = (p: number) => pad + ((maxP - p) / range) * (height - pad * 2);
  const barW = Math.floor((width - pad * 2) / bars.length) - 2;
  const barX = (i: number) => pad + i * ((width - pad * 2) / bars.length) + 1;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {bars.map((b, i) => {
        const x = barX(i);
        const cx = x + barW / 2;
        const isUp = b.close >= b.open;
        const bodyTop = scaleY(Math.max(b.open, b.close));
        const bodyH = Math.max(1, Math.abs(scaleY(b.open) - scaleY(b.close)));
        return (
          <g key={i}>
            <line x1={cx} y1={scaleY(b.high)} x2={cx} y2={scaleY(b.low)} stroke={isUp ? "#22c55e" : "#ef4444"} strokeWidth={1} />
            <rect x={x} y={bodyTop} width={barW} height={bodyH} fill={isUp ? "#22c55e" : "#ef4444"} rx={1} />
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Rapid Fire Price Chart
// ---------------------------------------------------------------------------
function PriceLineChart({ bars, revealed, width = 340, height = 100 }: { bars: Bar[]; revealed: number; width?: number; height?: number }) {
  const visible = bars.slice(0, revealed + 1);
  if (visible.length < 2) return null;
  const prices = visible.map((b) => b.close);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;
  const pad = 8;
  const scaleX = (i: number) => pad + (i / (bars.length - 1)) * (width - pad * 2);
  const scaleY = (p: number) => pad + ((maxP - p) / range) * (height - pad * 2);
  const pts = prices.map((p, i) => `${scaleX(i)},${scaleY(p)}`).join(" ");
  const last = visible[visible.length - 1];
  const isUp = last.close >= visible[0].close;

  return (
    <svg width={width} height={height}>
      <polyline points={pts} fill="none" stroke={isUp ? "#22c55e" : "#ef4444"} strokeWidth={2} strokeLinejoin="round" />
      <circle cx={scaleX(visible.length - 1)} cy={scaleY(last.close)} r={4} fill={isUp ? "#22c55e" : "#ef4444"} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// CHALLENGE CONFIGS
// ---------------------------------------------------------------------------
const CHALLENGE_CONFIGS: ChallengeConfig[] = [
  {
    id: "crash_survival",
    name: "Market Crash Survival",
    description: "Start with $100K. Survive a market crash without losing more than 30%.",
    difficulty: "Hard",
    timeLimitSec: 60,
    icon: <Shield className="h-5 w-5" />,
    screen: "rapid_fire",
    highScore: 0,
  },
  {
    id: "bull_run",
    name: "Bull Run Rider",
    description: "Maximize returns during a 20-bar bull market run.",
    difficulty: "Easy",
    timeLimitSec: 60,
    icon: <TrendingUp className="h-5 w-5" />,
    screen: "rapid_fire",
    highScore: 0,
  },
  {
    id: "choppy_market",
    name: "Choppy Market Massacre",
    description: "Preserve capital in a sideways, volatile market.",
    difficulty: "Expert",
    timeLimitSec: 60,
    icon: <BarChart2 className="h-5 w-5" />,
    screen: "rapid_fire",
    highScore: 0,
  },
  {
    id: "earnings_roulette",
    name: "Earnings Roulette",
    description: "Trade 5 stocks around earnings releases for maximum gains.",
    difficulty: "Medium",
    timeLimitSec: 60,
    icon: <Zap className="h-5 w-5" />,
    screen: "pattern_quiz",
    highScore: 0,
  },
  {
    id: "options_income",
    name: "Options Income Generator",
    description: "Generate 2% monthly income using paper options strategies.",
    difficulty: "Expert",
    timeLimitSec: 60,
    icon: <Target className="h-5 w-5" />,
    screen: "strategy_battle",
    highScore: 0,
  },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  Medium: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  Hard: "text-orange-400 bg-orange-400/10 border-orange-400/30",
  Expert: "text-red-400 bg-red-400/10 border-red-400/30",
};

// ---------------------------------------------------------------------------
// LOBBY SCREEN
// ---------------------------------------------------------------------------
function LobbyScreen({
  onSelect,
  onShowLeaderboard,
  highScores,
}: {
  onSelect: (cfg: ChallengeConfig) => void;
  onShowLeaderboard: () => void;
  highScores: Record<ChallengeId, number>;
}) {
  const dailySeed = Math.floor(Date.now() / 86400000);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Trading Challenges</h2>
          <p className="text-sm text-zinc-400">Test your skills across 5 challenge modes</p>
        </div>
        <button
          onClick={onShowLeaderboard}
          className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 text-sm text-amber-400 hover:bg-amber-500/20 transition-colors"
        >
          <Trophy className="h-4 w-4" />
          Leaderboard
        </button>
      </div>

      {/* Daily Challenge */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <Flame className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-semibold text-amber-400">Daily Challenge</span>
          <span className="ml-auto text-xs text-zinc-500">Seed #{dailySeed}</span>
        </div>
        <p className="text-sm text-zinc-300">
          Today's unique scenario — resets at midnight. Earn 3× bonus XP!
        </p>
        <button
          onClick={() => onSelect({ ...CHALLENGE_CONFIGS[1], id: "bull_run" })}
          className="mt-3 flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-semibold text-black hover:bg-amber-400 transition-colors"
        >
          <Play className="h-4 w-4" />
          Start Daily
        </button>
      </motion.div>

      {/* Challenge Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CHALLENGE_CONFIGS.map((cfg, i) => (
          <motion.div
            key={cfg.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 hover:border-zinc-600 hover:bg-zinc-800/60 transition-all"
            onClick={() => onSelect(cfg)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-zinc-800 p-2 text-zinc-300 group-hover:bg-zinc-700 transition-colors">
                  {cfg.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-tight">{cfg.name}</p>
                  <span className={cn("text-xs border rounded px-1.5 py-0.5 font-medium", DIFFICULTY_COLORS[cfg.difficulty])}>
                    {cfg.difficulty}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 mt-1 transition-colors" />
            </div>
            <p className="text-xs text-zinc-500 mb-3 leading-relaxed">{cfg.description}</p>
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <div className="flex items-center gap-1">
                <Timer className="h-3 w-3" />
                {cfg.timeLimitSec}s
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-amber-400" />
                Best: {highScores[cfg.id] > 0 ? highScores[cfg.id].toLocaleString() : "—"}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RAPID FIRE SCREEN
// ---------------------------------------------------------------------------
function RapidFireScreen({
  challenge,
  onFinish,
}: {
  challenge: ChallengeConfig;
  onFinish: (score: number) => void;
}) {
  const seed = 91;
  const bars = generateBarsForChallenge(challenge.id, seed);

  const [currentBar, setCurrentBar] = useState(0);
  const [position, setPosition] = useState<"none" | "long" | "short">("none");
  const [entryPrice, setEntryPrice] = useState(0);
  const [capital, setCapital] = useState(100000);
  const [pnl, setPnl] = useState(0);
  const [timeLeft, setTimeLeft] = useState(challenge.timeLimitSec);
  const [done, setDone] = useState(false);
  const [decisionTimes, setDecisionTimes] = useState<number[]>([]);
  const lastActionTime = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setDone(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const currentPrice = bars[currentBar]?.close ?? 100;
  const returnPct = ((capital - 100000) / 100000) * 100;

  const advance = useCallback(() => {
    setCurrentBar((b) => {
      const next = b + 1;
      if (next >= bars.length) {
        setDone(true);
        return b;
      }
      return next;
    });
  }, [bars.length]);

  const handleAction = useCallback((action: "buy" | "hold" | "sell") => {
    const now = Date.now();
    const elapsed = (now - lastActionTime.current) / 1000;
    setDecisionTimes((prev) => [...prev, elapsed]);
    lastActionTime.current = now;

    if (action === "buy" && position === "none") {
      setPosition("long");
      setEntryPrice(currentPrice);
    } else if (action === "sell" && position === "long") {
      const gain = ((currentPrice - entryPrice) / entryPrice) * capital;
      setCapital((c) => c + gain);
      setPnl((p) => p + gain);
      setPosition("none");
      setEntryPrice(0);
    } else if (action === "sell" && position === "none") {
      setPosition("short");
      setEntryPrice(currentPrice);
    } else if (action === "buy" && position === "short") {
      const gain = ((entryPrice - currentPrice) / entryPrice) * capital;
      setCapital((c) => c + gain);
      setPnl((p) => p + gain);
      setPosition("none");
      setEntryPrice(0);
    }

    advance();
  }, [advance, capital, currentPrice, entryPrice, position]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (done) return;
      if (e.key === "b" || e.key === "B") handleAction("buy");
      if (e.key === "h" || e.key === "H") handleAction("hold");
      if (e.key === "s" || e.key === "S") handleAction("sell");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [done, handleAction]);

  const avgDecisionTime = decisionTimes.length > 0
    ? decisionTimes.reduce((a, b) => a + b, 0) / decisionTimes.length
    : 5;
  const speedBonus = Math.max(1, 5 / avgDecisionTime);
  const score = Math.round(Math.max(0, returnPct) * speedBonus * 100);

  if (done) {
    return (
      <ResultsSummary
        title="Rapid Fire Complete"
        returnPct={returnPct}
        score={score}
        speedBonus={speedBonus}
        onFinish={() => onFinish(score)}
      />
    );
  }

  const urgency = timeLeft <= 10;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">{challenge.name}</h3>
          <p className="text-xs text-zinc-500">Bar {currentBar + 1} / {bars.length}</p>
        </div>
        <motion.div
          animate={{ scale: urgency ? [1, 1.05, 1] : 1 }}
          transition={{ repeat: urgency ? Infinity : 0, duration: 0.5 }}
          className={cn(
            "flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-bold",
            urgency ? "bg-red-500/20 text-red-400 border border-red-500/40" : "bg-zinc-800 text-zinc-300"
          )}
        >
          <Clock className="h-4 w-4" />
          {timeLeft}s
        </motion.div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <PriceLineChart bars={bars} revealed={currentBar} width={340} height={100} />
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-zinc-400">Price: <span className="font-mono text-white">${currentPrice.toFixed(2)}</span></span>
          <span className={cn("font-mono font-bold", returnPct >= 0 ? "text-emerald-400" : "text-red-400")}>
            {returnPct >= 0 ? "+" : ""}{returnPct.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Position status */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-zinc-500">Position:</span>
        <span className={cn(
          "rounded px-2 py-0.5 font-semibold",
          position === "long" ? "bg-emerald-500/20 text-emerald-400" :
          position === "short" ? "bg-red-500/20 text-red-400" :
          "bg-zinc-800 text-zinc-400"
        )}>
          {position === "none" ? "FLAT" : position === "long" ? "LONG" : "SHORT"}
        </span>
        {position !== "none" && (
          <span className="text-zinc-500">@ ${entryPrice.toFixed(2)}</span>
        )}
        <span className="ml-auto text-zinc-500">Capital: <span className="font-mono text-white">${capital.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></span>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        {([
          { action: "buy", label: "BUY", key: "B", color: "bg-emerald-600 hover:bg-emerald-500 text-white" },
          { action: "hold", label: "HOLD", key: "H", color: "bg-zinc-700 hover:bg-zinc-600 text-white" },
          { action: "sell", label: "SELL", key: "S", color: "bg-red-600 hover:bg-red-500 text-white" },
        ] as const).map(({ action, label, key, color }) => (
          <motion.button
            key={action}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAction(action)}
            className={cn("rounded-xl py-4 font-bold text-lg transition-colors relative", color)}
          >
            {label}
            <span className="absolute bottom-1.5 right-2 text-xs opacity-50 font-normal">[{key}]</span>
          </motion.button>
        ))}
      </div>

      <p className="text-center text-xs text-zinc-600">Keyboard: B = Buy / H = Hold / S = Sell</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PATTERN QUIZ SCREEN
// ---------------------------------------------------------------------------
function PatternQuizScreen({ onFinish }: { onFinish: (score: number) => void }) {
  const quizzes = generatePatternQuizzes(91);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const quiz = quizzes[index];
  const isAnswered = selected !== null;

  const submitAnswer = useCallback((answer: string) => {
    if (isAnswered) return;
    setSelected(answer);
    const correct = answer === quiz.correctLabel;
    setResults((r) => [...r, correct]);
    setStreak((s) => correct ? s + 1 : 0);
  }, [isAnswered, quiz.correctLabel]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          if (!isAnswered) submitAnswer("__timeout__");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [index, isAnswered, submitAnswer]);

  const handleNext = () => {
    if (index + 1 >= quizzes.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
      setTimeLeft(5);
    }
  };

  if (done) {
    const correct = results.filter(Boolean).length;
    const accuracy = Math.round((correct / quizzes.length) * 100);
    const score = Math.round(accuracy * 100 + streak * 50);
    return (
      <ResultsSummary
        title="Pattern Quiz Complete"
        returnPct={accuracy - 50}
        score={score}
        extra={`${correct}/${quizzes.length} correct — ${accuracy}% accuracy`}
        onFinish={() => onFinish(score)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Pattern Recognition</h3>
          <p className="text-xs text-zinc-500">Question {index + 1} / {quizzes.length}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-amber-400 text-sm">
            <Flame className="h-4 w-4" />
            <span className="font-bold">{streak}</span>
          </div>
          <motion.div
            animate={{ scale: timeLeft <= 2 ? [1, 1.1, 1] : 1 }}
            transition={{ repeat: timeLeft <= 2 ? Infinity : 0, duration: 0.4 }}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-bold",
              timeLeft <= 2 ? "bg-red-500/20 text-red-400" : "bg-zinc-800 text-zinc-300"
            )}
          >
            {timeLeft}s
          </motion.div>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1">
        {quizzes.map((_, i) => (
          <div key={i} className={cn(
            "h-1.5 flex-1 rounded-full",
            i < results.length ? (results[i] ? "bg-emerald-500" : "bg-red-500") :
            i === index ? "bg-zinc-500" : "bg-zinc-800"
          )} />
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 flex justify-center">
        <MiniCandleChart bars={quiz.bars} width={220} height={100} />
      </div>

      <p className="text-center text-sm text-zinc-400">What pattern is this?</p>

      {/* Answer buttons */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {PATTERN_LABELS.map((label) => {
          const isCorrect = label === quiz.correctLabel;
          const isSelected = label === selected;
          return (
            <motion.button
              key={label}
              whileTap={{ scale: 0.96 }}
              onClick={() => submitAnswer(label)}
              disabled={isAnswered}
              className={cn(
                "rounded-lg py-2.5 text-sm font-semibold transition-colors border",
                !isAnswered
                  ? "border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                  : isCorrect
                  ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                  : isSelected
                  ? "border-red-500 bg-red-500/20 text-red-400"
                  : "border-zinc-800 bg-zinc-900 text-zinc-600"
              )}
            >
              {isAnswered && isCorrect && <CheckCircle className="h-3.5 w-3.5 inline mr-1" />}
              {isAnswered && isSelected && !isCorrect && <XCircle className="h-3.5 w-3.5 inline mr-1" />}
              {label}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              "rounded-lg p-3 text-sm border",
              selected === quiz.correctLabel
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-red-500/10 border-red-500/30 text-red-300"
            )}
          >
            {selected === quiz.correctLabel
              ? "Correct! Well spotted."
              : `Incorrect. The pattern was: ${quiz.correctLabel}`}
          </motion.div>
        )}
      </AnimatePresence>

      {isAnswered && (
        <button
          onClick={handleNext}
          className="w-full rounded-xl bg-zinc-700 hover:bg-zinc-600 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          {index + 1 >= quizzes.length ? "See Results" : "Next Pattern"}
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// STRATEGY BATTLE SCREEN
// ---------------------------------------------------------------------------
const BOT_CONFIGS: Array<{ id: BotId; name: string; strategy: string; color: string }> = [
  { id: "momentum_mo", name: "Momentum Mo", strategy: "Chases trends aggressively", color: "#f59e0b" },
  { id: "value_vera", name: "Value Vera", strategy: "Buys undervalued, holds patiently", color: "#3b82f6" },
  { id: "trend_tommy", name: "Trend Tommy", strategy: "Follows moving average crossovers", color: "#a855f7" },
];

function StrategyBattleScreen({ onFinish }: { onFinish: (score: number) => void }) {
  const [seed, setSeed] = useState(91);
  const [playerStrategy, setPlayerStrategy] = useState<BotId | null>(null);
  const [running, setRunning] = useState(false);
  const [bar, setBar] = useState(0);
  const [done, setDone] = useState(false);
  const [botReturns, setBotReturns] = useState<Record<BotId, number>>({
    momentum_mo: 0, value_vera: 0, trend_tommy: 0,
  });

  const playerReturn = playerStrategy ? simulateBotReturn(playerStrategy, seed + 99) : 0;
  const allResults: Array<{ name: string; ret: number; isPlayer: boolean }> = [
    ...BOT_CONFIGS.map((b) => ({ name: b.name, ret: botReturns[b.id], isPlayer: false })),
    { name: "You", ret: playerReturn, isPlayer: true },
  ].sort((a, b) => b.ret - a.ret);

  const handleStart = () => {
    if (!playerStrategy) return;
    setRunning(true);
    setBar(0);
    setBotReturns({ momentum_mo: 0, value_vera: 0, trend_tommy: 0 });
    setDone(false);
  };

  useEffect(() => {
    if (!running) return;
    if (bar >= 30) {
      setBotReturns({
        momentum_mo: simulateBotReturn("momentum_mo", seed),
        value_vera: simulateBotReturn("value_vera", seed),
        trend_tommy: simulateBotReturn("trend_tommy", seed),
      });
      setDone(true);
      setRunning(false);
      return;
    }
    const t = setTimeout(() => setBar((b) => b + 1), 80);
    return () => clearTimeout(t);
  }, [running, bar, seed]);

  const score = done ? Math.max(0, Math.round((playerReturn + 20) * 100)) : 0;

  const handleReplay = () => {
    setSeed((s) => s + 7);
    setPlayerStrategy(null);
    setDone(false);
    setBar(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Strategy Battle</h3>
          <p className="text-xs text-zinc-500">30-bar simulation across strategies</p>
        </div>
        {done && (
          <button
            onClick={handleReplay}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white rounded-lg bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Replay
          </button>
        )}
      </div>

      {/* Progress bar */}
      {running && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Simulating...</span>
            <span>Bar {bar}/30</span>
          </div>
          <div className="h-2 rounded-full bg-zinc-800">
            <motion.div
              className="h-2 rounded-full bg-blue-500"
              animate={{ width: `${(bar / 30) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Bot cards */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Competitors</p>
        {BOT_CONFIGS.map((bot) => (
          <div key={bot.id} className="flex items-center gap-3 rounded-lg bg-zinc-900 border border-zinc-800 p-3">
            <div className="h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs"
              style={{ backgroundColor: bot.color + "22", color: bot.color }}>
              {bot.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{bot.name}</p>
              <p className="text-xs text-zinc-500 truncate">{bot.strategy}</p>
            </div>
            {done && (
              <span className={cn("text-sm font-mono font-bold", botReturns[bot.id] >= 0 ? "text-emerald-400" : "text-red-400")}>
                {botReturns[bot.id] >= 0 ? "+" : ""}{botReturns[bot.id].toFixed(1)}%
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Strategy selector */}
      {!running && !done && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Choose Your Strategy</p>
          <div className="grid grid-cols-3 gap-2">
            {BOT_CONFIGS.map((bot) => (
              <button
                key={bot.id}
                onClick={() => setPlayerStrategy(bot.id)}
                className={cn(
                  "rounded-lg border p-2.5 text-xs font-semibold transition-all",
                  playerStrategy === bot.id
                    ? "border-white/40 bg-white/10 text-white"
                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                )}
              >
                {bot.name.split(" ")[1]}
              </button>
            ))}
          </div>
          <button
            disabled={!playerStrategy}
            onClick={handleStart}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 py-2.5 text-sm font-bold text-white transition-colors"
          >
            Battle!
          </button>
        </div>
      )}

      {/* Final leaderboard */}
      {done && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Final Results</p>
          {allResults.map((r, i) => (
            <div key={r.name} className={cn(
              "flex items-center gap-3 rounded-lg border p-3",
              r.isPlayer ? "border-amber-500/40 bg-amber-500/10" : "border-zinc-800 bg-zinc-900"
            )}>
              <span className="text-xs font-bold text-zinc-500 w-4">#{i + 1}</span>
              <span className={cn("flex-1 text-sm font-semibold", r.isPlayer ? "text-amber-400" : "text-zinc-300")}>{r.name}</span>
              <span className={cn("font-mono font-bold text-sm", r.ret >= 0 ? "text-emerald-400" : "text-red-400")}>
                {r.ret >= 0 ? "+" : ""}{r.ret.toFixed(1)}%
              </span>
            </div>
          ))}
          <button
            onClick={() => onFinish(score)}
            className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 py-2.5 text-sm font-bold text-black transition-colors"
          >
            Submit Score
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// LEADERBOARD SCREEN
// ---------------------------------------------------------------------------
function LeaderboardScreen({ playerScore, onBack }: { playerScore: number; onBack: () => void }) {
  const entries = generateLeaderboard(91, playerScore);
  const playerEntry = entries.find((e) => e.name === "You");

  const ACHIEVEMENTS = [
    { id: "speed_trader", label: "Speed Trader", desc: "Avg decision < 1s", icon: <Zap className="h-4 w-4" />, color: "text-yellow-400" },
    { id: "pattern_master", label: "Pattern Master", desc: "10/10 quiz accuracy", icon: <Star className="h-4 w-4" />, color: "text-purple-400" },
    { id: "crash_survivor", label: "Crash Survivor", desc: "Survived market crash", icon: <Shield className="h-4 w-4" />, color: "text-blue-400" },
    { id: "income_ace", label: "Income Ace", desc: "Generated 2% income", icon: <Award className="h-4 w-4" />, color: "text-emerald-400" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white">Leaderboard</h3>
        <button onClick={onBack} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          Back
        </button>
      </div>

      {/* Achievement Badges */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ACHIEVEMENTS.map((a) => (
          <div key={a.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-center">
            <div className={cn("flex justify-center mb-1", a.color)}>{a.icon}</div>
            <p className="text-xs font-semibold text-zinc-300 leading-tight">{a.label}</p>
            <p className="text-xs text-zinc-600 mt-0.5 leading-tight">{a.desc}</p>
          </div>
        ))}
      </div>

      {/* Player rank */}
      {playerEntry && playerEntry.score > 0 && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 flex items-center gap-3">
          <Crown className="h-5 w-5 text-amber-400" />
          <div>
            <p className="text-sm font-bold text-amber-400">Your Rank: #{playerEntry.rank}</p>
            <p className="text-xs text-zinc-400">Score: {playerEntry.score.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="space-y-1.5">
        {entries.slice(0, 10).map((e) => (
          <motion.div
            key={e.name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: e.rank * 0.03 }}
            className={cn(
              "flex items-center gap-3 rounded-lg border px-3 py-2",
              e.name === "You" ? "border-amber-500/40 bg-amber-500/10" : "border-zinc-800 bg-zinc-900"
            )}
          >
            <span className="text-xs font-bold w-5 text-zinc-500">
              {e.rank === 1 ? "🥇" : e.rank === 2 ? "🥈" : e.rank === 3 ? "🥉" : `#${e.rank}`}
            </span>
            <span className={cn("flex-1 text-sm font-semibold", e.name === "You" ? "text-amber-400" : "text-zinc-300")}>
              {e.name}
            </span>
            <span className="font-mono text-sm font-bold text-white">{e.score.toLocaleString()}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RESULTS SUMMARY
// ---------------------------------------------------------------------------
function ResultsSummary({
  title,
  returnPct,
  score,
  speedBonus,
  extra,
  onFinish,
}: {
  title: string;
  returnPct: number;
  score: number;
  speedBonus?: number;
  extra?: string;
  onFinish: () => void;
}) {
  const grade =
    returnPct >= 15 ? "A" :
    returnPct >= 5 ? "B" :
    returnPct >= 0 ? "C" :
    returnPct >= -5 ? "D" : "F";

  const gradeColor =
    grade === "A" ? "text-emerald-400" :
    grade === "B" ? "text-blue-400" :
    grade === "C" ? "text-amber-400" :
    grade === "D" ? "text-orange-400" : "text-red-400";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-5 text-center"
    >
      <div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <motion.p
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className={cn("text-6xl font-black mt-3", gradeColor)}
        >
          {grade}
        </motion.p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
          <p className="text-xs text-zinc-500 mb-1">Return</p>
          <p className={cn("text-xl font-bold font-mono", returnPct >= 0 ? "text-emerald-400" : "text-red-400")}>
            {returnPct >= 0 ? "+" : ""}{returnPct.toFixed(2)}%
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
          <p className="text-xs text-zinc-500 mb-1">Score</p>
          <p className="text-xl font-bold text-white">{score.toLocaleString()}</p>
        </div>
        {speedBonus !== undefined && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
            <p className="text-xs text-zinc-500 mb-1">Speed Bonus</p>
            <p className="text-xl font-bold text-amber-400">{speedBonus.toFixed(2)}×</p>
          </div>
        )}
        {extra && (
          <div className={cn("rounded-xl border border-zinc-800 bg-zinc-900 p-3", speedBonus !== undefined ? "" : "col-span-2")}>
            <p className="text-xs text-zinc-500 mb-1">Result</p>
            <p className="text-sm font-semibold text-zinc-300">{extra}</p>
          </div>
        )}
      </div>

      <button
        onClick={onFinish}
        className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 py-3 text-sm font-bold text-black transition-colors"
      >
        Submit to Leaderboard
      </button>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// ROOT COMPONENT
// ---------------------------------------------------------------------------
export default function TradingChallenge() {
  const [screen, setScreen] = useState<AppScreen>("lobby");
  const [activeChallenge, setActiveChallenge] = useState<ChallengeConfig | null>(null);
  const [lastScore, setLastScore] = useState(0);
  const [highScores, setHighScores] = useState<Record<ChallengeId, number>>({
    crash_survival: 0,
    bull_run: 0,
    choppy_market: 0,
    earnings_roulette: 0,
    options_income: 0,
  });

  const handleSelectChallenge = (cfg: ChallengeConfig) => {
    setActiveChallenge(cfg);
    setScreen(cfg.screen);
  };

  const handleFinish = (score: number) => {
    setLastScore(score);
    if (activeChallenge) {
      setHighScores((prev) => ({
        ...prev,
        [activeChallenge.id]: Math.max(prev[activeChallenge.id], score),
      }));
    }
    setScreen("leaderboard");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-xl px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-xl bg-amber-500/20 p-2">
            <Trophy className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Trading Challenge</h1>
            <p className="text-sm text-zinc-500">Arena — Compete &amp; Improve</p>
          </div>
          {screen !== "lobby" && (
            <button
              onClick={() => setScreen("lobby")}
              className="ml-auto text-xs text-zinc-500 hover:text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg px-3 py-1.5 transition-colors"
            >
              Exit
            </button>
          )}
        </div>

        {/* Screen */}
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {screen === "lobby" && (
              <LobbyScreen
                onSelect={handleSelectChallenge}
                onShowLeaderboard={() => setScreen("leaderboard")}
                highScores={highScores}
              />
            )}
            {screen === "rapid_fire" && activeChallenge && (
              <RapidFireScreen challenge={activeChallenge} onFinish={handleFinish} />
            )}
            {screen === "pattern_quiz" && (
              <PatternQuizScreen onFinish={handleFinish} />
            )}
            {screen === "strategy_battle" && (
              <StrategyBattleScreen onFinish={handleFinish} />
            )}
            {screen === "leaderboard" && (
              <LeaderboardScreen playerScore={lastScore} onBack={() => setScreen("lobby")} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
