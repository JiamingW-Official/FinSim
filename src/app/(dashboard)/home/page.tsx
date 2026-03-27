"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { useTradingStore } from "@/stores/trading-store";
import { useLearnStore } from "@/stores/learn-store";
import { useQuestStore } from "@/stores/quest-store";
import { INITIAL_CAPITAL } from "@/types/trading";
import { getXPForNextLevel, LEVEL_THRESHOLDS } from "@/types/game";
import { formatCurrency, cn } from "@/lib/utils";
import { UNITS } from "@/data/lessons";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Flame,
  Trophy,
  Target,
  BookOpen,
  BarChart3,
  Activity,
  Swords,
  ChevronRight,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Zap,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Animation variants
───────────────────────────────────────────── */
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
} as const;

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: "easeOut" as const },
  },
};

/* ─────────────────────────────────────────────
   Seeded PRNG (mulberry32)
───────────────────────────────────────────── */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function tickerHash(ticker: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < ticker.length; i++) {
    h ^= ticker.charCodeAt(i);
    h = (Math.imul(h, 0x01000193)) >>> 0;
  }
  return h;
}

/* ─────────────────────────────────────────────
   Market data constants
───────────────────────────────────────────── */
const ALL_TICKERS = ["AAPL", "MSFT", "GOOG", "AMZN", "NVDA", "TSLA", "JPM", "SPY", "QQQ", "META"];

const BASE_PRICES: Record<string, number> = {
  AAPL: 213,
  MSFT: 415,
  GOOG: 178,
  AMZN: 204,
  NVDA: 870,
  TSLA: 248,
  JPM: 225,
  SPY: 548,
  QQQ: 468,
  META: 568,
};

function simulateTickerPrice(ticker: string, daySeed: number): { price: number; changePct: number } {
  const base = BASE_PRICES[ticker] ?? 100;
  const seed = tickerHash(ticker) ^ daySeed;
  const rand = mulberry32(seed);
  const changePct = (rand() - 0.5) * 4; // ±2%
  const price = base * (1 + changePct / 100);
  return { price: Math.max(price, 0.01), changePct };
}

/* ─────────────────────────────────────────────
   Market status helpers (ET timezone)
───────────────────────────────────────────── */
interface MarketStatus {
  isOpen: boolean;
  countdownLabel: string;
  timeStr: string;
}

function getMarketStatus(): MarketStatus {
  const now = new Date();
  const etFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    weekday: "long",
  });
  const parts = etFormatter.formatToParts(now);
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";

  const isWeekend = weekday === "Saturday" || weekday === "Sunday";
  const minutesFromMidnight = hour * 60 + minute;
  const marketOpen = 9 * 60 + 30;
  const marketClose = 16 * 60;

  const isOpen = !isWeekend && minutesFromMidnight >= marketOpen && minutesFromMidnight < marketClose;

  let countdownLabel = "";
  if (!isOpen) {
    if (isWeekend) {
      countdownLabel = "Opens Monday 9:30 AM ET";
    } else if (minutesFromMidnight < marketOpen) {
      const minsLeft = marketOpen - minutesFromMidnight;
      countdownLabel = `Opens in ${Math.floor(minsLeft / 60)}h ${minsLeft % 60}m`;
    } else {
      countdownLabel = "Opens tomorrow 9:30 AM ET";
    }
  } else {
    const minsLeft = marketClose - minutesFromMidnight;
    countdownLabel = `Closes in ${Math.floor(minsLeft / 60)}h ${minsLeft % 60}m`;
  }

  const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ET`;

  return { isOpen, countdownLabel, timeStr };
}

/* ─────────────────────────────────────────────
   Mini sparkline for portfolio / hero
───────────────────────────────────────────── */
function MiniSparkline({
  data,
  color,
  width = 64,
  height = 24,
}: {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const polyline = pts.join(" ");
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Portfolio equity area chart (30 bars)
───────────────────────────────────────────── */
function PortfolioEquityChart({
  equityHistory,
  currentValue,
}: {
  equityHistory: { timestamp: number; portfolioValue: number }[];
  currentValue: number;
}) {
  const W = 320;
  const H = 100;

  const data = useMemo(() => {
    if (equityHistory.length >= 2) {
      return equityHistory.slice(-30).map((e) => e.portfolioValue);
    }
    // Synthetic: generate 30 bars around INITIAL_CAPITAL
    const daySeed = Math.floor(Date.now() / 86400000);
    const rand = mulberry32(daySeed ^ 0xdeadbeef);
    const pts: number[] = [INITIAL_CAPITAL];
    for (let i = 1; i < 30; i++) {
      const prev = pts[i - 1];
      const delta = (rand() - 0.48) * prev * 0.015;
      pts.push(Math.max(prev + delta, INITIAL_CAPITAL * 0.5));
    }
    pts[pts.length - 1] = currentValue;
    return pts;
  }, [equityHistory, currentValue]);

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const toX = (i: number) => (i / (data.length - 1)) * W;
  const toY = (v: number) => H - ((v - min) / range) * (H - 8);

  const linePts = data.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");
  const areaPath = `M${toX(0).toFixed(1)},${H} ` +
    data.map((v, i) => `L${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ") +
    ` L${toX(data.length - 1).toFixed(1)},${H} Z`;

  const isUp = data[data.length - 1] >= data[0];
  const lineColor = isUp ? "#10b981" : "#ef4444";
  const fillColor = isUp ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)";

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="overflow-visible">
      <path d={areaPath} fill={fillColor} />
      <polyline points={linePts} fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   AI insight text (day-of-week rotation)
───────────────────────────────────────────── */
const MARKET_BRIEFS = [
  "Equity markets opened mixed as investors weigh Fed commentary on rate trajectory. Technology sector leads with moderate gains while energy pulls back on inventory data.",
  "Strong labor market data pushed yields higher, pressuring growth stocks. Defensive sectors outperform as traders seek quality amid macro uncertainty.",
  "Risk-on sentiment dominates mid-week as earnings reports broadly beat estimates. Semiconductors and cloud software driving the tape higher.",
  "Market digesting Thursday's CPI print — core inflation slightly above expectations. Rotation from tech into financials and industrials accelerating.",
  "Pre-market futures point to a quiet Friday session. Options expiration may introduce intraday volatility in heavily-traded names like SPY and QQQ.",
  "Weekend effect visible as volumes thin into Friday close. Traders position cautiously ahead of next week's FOMC minutes release.",
  "Monday gap-up after positive weekend macro headlines. Watch for follow-through or fade as institutional desks come back online.",
];

const TOP_OPPORTUNITIES: { ticker: string; direction: "long" | "short"; confidence: number; reason: string }[] = [
  { ticker: "NVDA", direction: "long", confidence: 78, reason: "Momentum breakout above 20-day MA, vol expanding" },
  { ticker: "AAPL", direction: "long", confidence: 71, reason: "Support hold near $210, RSI recovering from oversold" },
  { ticker: "TSLA", direction: "short", confidence: 65, reason: "Bearish engulfing at resistance, IV elevated" },
  { ticker: "META", direction: "long", confidence: 74, reason: "Earnings catalyst + strong free cash flow trend" },
  { ticker: "QQQ", direction: "long", confidence: 68, reason: "Broad tech recovery on rate cut expectations" },
  { ticker: "AMZN", direction: "long", confidence: 72, reason: "AWS re-acceleration thesis playing out in options flow" },
  { ticker: "GOOG", direction: "short", confidence: 60, reason: "Ad revenue headwinds, AI capex drag on margins" },
];

const RISK_TIPS = [
  "Position sizing tip: never risk more than 2% of portfolio on a single trade.",
  "Diversification: spread exposure across at least 3-5 uncorrelated assets.",
  "Use stop-loss orders to define your maximum loss before entering a position.",
  "Volatility clusters — wider stops are needed during high-VIX environments.",
  "The Kelly Criterion suggests betting a fraction proportional to your edge over the odds.",
  "Drawdown management: reduce position size after losing 10% from peak equity.",
  "Correlation risk: multiple 'diversified' positions can move together in a crisis.",
];

/* ─────────────────────────────────────────────
   Quick Nav shortcuts
───────────────────────────────────────────── */
const NAV_SHORTCUTS = [
  { label: "Trade", href: "/trade", Icon: BarChart3, color: "text-blue-400" },
  { label: "Learn", href: "/learn", Icon: BookOpen, color: "text-emerald-400" },
  { label: "Backtest", href: "/backtest", Icon: Activity, color: "text-violet-400" },
  { label: "Options", href: "/options", Icon: Zap, color: "text-amber-400" },
  { label: "Arena", href: "/arena", Icon: Swords, color: "text-red-400" },
  { label: "Portfolio", href: "/portfolio", Icon: Shield, color: "text-cyan-400" },
];

/* ─────────────────────────────────────────────
   Main Page Component
───────────────────────────────────────────── */
export default function HomePage() {
  /* ── Store state ── */
  const level = useGameStore((s) => s.level);
  const title = useGameStore((s) => s.title);
  const xp = useGameStore((s) => s.xp);
  const stats = useGameStore((s) => s.stats);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const equityHistory = useTradingStore((s) => s.equityHistory);
  const positions = useTradingStore((s) => s.positions);
  const learningStreak = useLearnStore((s) => s.learningStreak);
  const completedLessons = useLearnStore((s) => s.completedLessons);
  const lessonScores = useLearnStore((s) => s.lessonScores);
  const dailyStreakCount = useQuestStore((s) => s.dailyStreakCount);

  /* ── Derived values ── */
  const totalPnL = portfolioValue - INITIAL_CAPITAL;
  const totalPnLPct = (totalPnL / INITIAL_CAPITAL) * 100;

  const winRate =
    stats.totalTrades > 0
      ? (stats.profitableTrades / stats.totalTrades) * 100
      : 0;

  const currentLevelXP = level > 1 ? LEVEL_THRESHOLDS[level - 2] : 0;
  const nextLevelXP = getXPForNextLevel(level);
  const xpProgress =
    level >= 50
      ? 100
      : Math.min(((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100, 100);
  const xpToNext = level >= 50 ? 0 : nextLevelXP - xp;

  const recentTrades = tradeHistory.slice(-5).reverse();

  /* ── Weekly win rate (last 7 days) ── */
  const weeklyStats = useMemo(() => {
    const cutoff = Date.now() - 7 * 86400000;
    const recent = tradeHistory.filter((t) => t.timestamp >= cutoff);
    if (recent.length === 0) return null;
    const wins = recent.filter((t) => t.realizedPnL > 0).length;
    return { wins, total: recent.length, rate: (wins / recent.length) * 100 };
  }, [tradeHistory]);

  /* ── Daily P&L (today's trades) ── */
  const dailyPnL = useMemo(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return tradeHistory
      .filter((t) => t.timestamp >= startOfDay.getTime())
      .reduce((sum, t) => sum + t.realizedPnL, 0);
  }, [tradeHistory]);

  /* ── Synthetic sparkline for portfolio ── */
  const sparklineData = useMemo(() => {
    if (equityHistory.length >= 5) {
      return equityHistory.slice(-10).map((e) => e.portfolioValue);
    }
    const daySeed = Math.floor(Date.now() / 86400000);
    const rand = mulberry32(daySeed ^ 0xabcdef12);
    return Array.from({ length: 10 }, (_, i) => {
      const base = INITIAL_CAPITAL;
      return base + (rand() - 0.5) * base * 0.05 * (i + 1);
    });
  }, [equityHistory]);

  /* ── Market prices ── */
  const daySeed = Math.floor(Date.now() / 86400000);
  const marketPrices = useMemo(() => {
    return ALL_TICKERS.map((ticker) => ({
      ticker,
      ...simulateTickerPrice(ticker, daySeed),
    }));
  }, [daySeed]);

  /* ── Market status ── */
  const marketStatus = useMemo(() => getMarketStatus(), []);

  /* ── AI brief (day of week) ── */
  const dayIndex = new Date().getDay(); // 0=Sun
  const marketBrief = MARKET_BRIEFS[dayIndex % MARKET_BRIEFS.length];
  const topOpportunity = TOP_OPPORTUNITIES[dayIndex % TOP_OPPORTUNITIES.length];
  const riskTip = RISK_TIPS[dayIndex % RISK_TIPS.length];

  /* ── Learning progress ── */
  const learnProgress = useMemo(() => {
    let total = 0;
    let completed = 0;
    for (const unit of UNITS) {
      total += unit.lessons.length;
      completed += unit.lessons.filter((l) => completedLessons.includes(l.id)).length;
    }
    const xpEarnedThisWeek = tradeHistory
      .filter((t) => t.timestamp >= Date.now() - 7 * 86400000)
      .length * 15; // approximate
    const sRankCount = Object.values(lessonScores).filter((s) => s.grade === "S" || s.grade === "A").length;
    return { total, completed, pct: total > 0 ? Math.round((completed / total) * 100) : 0, xpEarnedThisWeek, sRankCount };
  }, [completedLessons, lessonScores, tradeHistory]);

  /* ── Daily goals ── */
  const dailyGoals = useMemo(() => {
    const todayTrades = tradeHistory.filter((t) => {
      const d = new Date(t.timestamp);
      const today = new Date();
      return d.toDateString() === today.toDateString();
    });
    const todayWins = todayTrades.filter((t) => t.realizedPnL > 0).length;
    const todayWinRate = todayTrades.length > 0 ? (todayWins / todayTrades.length) * 100 : 0;

    return [
      {
        label: "Make 3 trades today",
        current: Math.min(todayTrades.length, 3),
        target: 3,
        done: todayTrades.length >= 3,
      },
      {
        label: "Earn 100 XP",
        current: Math.min(xp % 500, 100), // approximate daily XP as last session
        target: 100,
        done: xp >= 100,
      },
      {
        label: "Win rate above 60%",
        current: Math.round(todayWinRate),
        target: 60,
        done: todayTrades.length >= 3 && todayWinRate >= 60,
        suffix: "%",
      },
    ];
  }, [tradeHistory, xp]);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <motion.div
        className="mx-auto w-full max-w-6xl space-y-5 p-6"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* ═══════════════════════════════════════
            Section 1 — Hero Stats Row (4 cards)
        ═══════════════════════════════════════ */}
        <motion.div variants={fadeUp}>
          <div className="mb-3">
            <h1 className="text-base font-semibold">Dashboard</h1>
            <p className="text-xs text-muted-foreground">
              Lv.{level} {title}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Portfolio Value */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                <Wallet className="h-3 w-3 text-blue-400" />
                Portfolio Value
              </div>
              <p className="text-lg font-bold tabular-nums">{formatCurrency(portfolioValue)}</p>
              <div className="mt-1 flex items-center justify-between">
                <span
                  className={cn(
                    "text-[10px] font-semibold tabular-nums",
                    totalPnLPct >= 0 ? "text-emerald-400" : "text-red-400",
                  )}
                >
                  {totalPnLPct >= 0 ? "+" : ""}
                  {totalPnLPct.toFixed(2)}% all-time
                </span>
                <MiniSparkline
                  data={sparklineData}
                  color={totalPnL >= 0 ? "#10b981" : "#ef4444"}
                />
              </div>
            </div>

            {/* Daily P&L */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                {dailyPnL >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-400" />
                )}
                Daily P&amp;L
              </div>
              <p
                className={cn(
                  "text-lg font-bold tabular-nums",
                  dailyPnL >= 0 ? "text-emerald-400" : "text-red-400",
                )}
              >
                {dailyPnL >= 0 ? "+" : ""}
                {formatCurrency(dailyPnL)}
              </p>
              <span
                className={cn(
                  "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold mt-1",
                  dailyPnL >= 0
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400",
                )}
              >
                {dailyPnL >= 0 ? "Profitable day" : "Down today"}
              </span>
            </div>

            {/* Level & XP */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                <Trophy className="h-3 w-3 text-amber-400" />
                Level &amp; XP
              </div>
              <p className="text-lg font-bold tabular-nums">Level {level}</p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{xp.toLocaleString()} XP</span>
                  <span>{xpToNext > 0 ? `${xpToNext} to next` : "Max level"}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted/30">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Win Rate */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                <Target className="h-3 w-3 text-cyan-400" />
                Win Rate
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-lg font-bold tabular-nums">{winRate.toFixed(1)}%</p>
                {weeklyStats && (
                  <span className="text-[10px] text-muted-foreground">
                    ({weeklyStats.rate.toFixed(0)}% this week)
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                {winRate >= 50 ? (
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-400" />
                )}
                <span>{stats.totalTrades} total trades</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════
            Section 2 — Market Overview (2-col)
        ═══════════════════════════════════════ */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Left: Mini market ticker strip */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Market Prices
              </p>
            </div>
            <div className="divide-y divide-border/40">
              {marketPrices.map(({ ticker, price, changePct }) => (
                <div key={ticker} className="flex items-center justify-between px-4 py-1.5">
                  <span className="w-12 text-xs font-semibold text-foreground">{ticker}</span>
                  <span className="flex-1 text-right text-xs font-mono tabular-nums text-foreground">
                    ${price.toFixed(2)}
                  </span>
                  <span
                    className={cn(
                      "ml-4 w-16 text-right text-[11px] font-semibold tabular-nums",
                      changePct >= 0 ? "text-emerald-400" : "text-red-400",
                    )}
                  >
                    {changePct >= 0 ? "+" : ""}
                    {changePct.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Market status card */}
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Market Status
            </p>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "h-3 w-3 rounded-full",
                  marketStatus.isOpen ? "bg-emerald-400" : "bg-red-400",
                )}
              />
              <p className="text-base font-semibold">
                US Markets: {marketStatus.isOpen ? "Open" : "Closed"}
              </p>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span className="font-mono tabular-nums">{marketStatus.timeStr}</span>
              </div>
              <p className="text-xs text-muted-foreground">{marketStatus.countdownLabel}</p>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border/50 pt-4">
              <div>
                <p className="text-[10px] text-muted-foreground">Open</p>
                <p className="text-xs font-semibold tabular-nums">9:30 AM</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Close</p>
                <p className="text-xs font-semibold tabular-nums">4:00 PM</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Timezone</p>
                <p className="text-xs font-semibold">ET</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {["Pre-market 4AM–9:30AM", "After-hours 4PM–8PM"].map((label) => (
                <span
                  key={label}
                  className="rounded bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════
            Section 3 — Main Content (3-col grid)
        ═══════════════════════════════════════ */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Column 1 (wide): Portfolio mini-chart */}
          <div className="rounded-lg border border-border bg-card lg:col-span-1">
            <div className="border-b border-border px-4 py-2.5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Portfolio Equity
                </p>
                <Link
                  href="/portfolio"
                  className="flex items-center gap-0.5 text-[10px] font-medium text-primary hover:underline"
                >
                  View
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
            <div className="px-4 pb-4 pt-3">
              <div className="mb-3 flex items-baseline gap-2">
                <span className="text-lg font-bold tabular-nums">{formatCurrency(portfolioValue)}</span>
                <span
                  className={cn(
                    "text-xs font-semibold tabular-nums",
                    totalPnL >= 0 ? "text-emerald-400" : "text-red-400",
                  )}
                >
                  {totalPnL >= 0 ? "+" : ""}
                  {formatCurrency(totalPnL)}
                </span>
              </div>
              <PortfolioEquityChart equityHistory={equityHistory} currentValue={portfolioValue} />
              <p className="mt-2 text-[10px] text-muted-foreground">Last 30 trading days</p>

              {/* Open positions summary */}
              {positions.length > 0 && (
                <div className="mt-3 space-y-1 border-t border-border/50 pt-3">
                  {positions.slice(0, 3).map((pos) => (
                    <div key={pos.ticker} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            pos.side === "long" ? "bg-emerald-400" : "bg-red-400",
                          )}
                        />
                        <span className="font-semibold">{pos.ticker}</span>
                        <span className="text-muted-foreground">{pos.side}</span>
                      </div>
                      <span
                        className={cn(
                          "font-semibold tabular-nums",
                          pos.unrealizedPnL >= 0 ? "text-emerald-400" : "text-red-400",
                        )}
                      >
                        {pos.unrealizedPnL >= 0 ? "+" : ""}
                        {formatCurrency(pos.unrealizedPnL)}
                      </span>
                    </div>
                  ))}
                  {positions.length > 3 && (
                    <p className="text-[10px] text-muted-foreground">+{positions.length - 3} more</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Recent Trades */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-2.5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Recent Trades
                </p>
                {tradeHistory.length > 0 && (
                  <Link
                    href="/portfolio"
                    className="text-[10px] font-medium text-primary hover:underline"
                  >
                    View All
                  </Link>
                )}
              </div>
            </div>
            <div>
              {recentTrades.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <BarChart3 className="h-6 w-6 text-muted-foreground/20" />
                  <p className="text-xs text-muted-foreground">No trades yet</p>
                  <Link href="/trade" className="text-[11px] font-medium text-primary hover:underline">
                    Start trading
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {recentTrades.map((trade, i) => (
                    <div
                      key={`${trade.timestamp}-${i}`}
                      className="flex items-center justify-between px-4 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "h-1.5 w-1.5 shrink-0 rounded-full",
                            trade.side === "buy" ? "bg-emerald-400" : "bg-red-400",
                          )}
                        />
                        <div>
                          <p className="text-xs font-semibold">{trade.ticker}</p>
                          <p className="text-[10px] uppercase text-muted-foreground">
                            {trade.side} &times; {trade.quantity}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[11px] font-bold tabular-nums",
                          trade.realizedPnL >= 0
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400",
                        )}
                      >
                        {trade.realizedPnL >= 0 ? "+" : ""}
                        {formatCurrency(trade.realizedPnL)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Daily Goals */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-2.5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Daily Goals
                </p>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Flame className="h-3 w-3 text-orange-400" />
                  <span>{dailyStreakCount}d streak</span>
                </div>
              </div>
            </div>
            <div className="space-y-4 px-4 py-4">
              {dailyGoals.map((goal) => {
                const pct = Math.min((goal.current / goal.target) * 100, 100);
                return (
                  <div key={goal.label}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {goal.done ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <div className="h-3.5 w-3.5 rounded-full border border-border/60" />
                        )}
                        <span className="text-xs text-foreground">{goal.label}</span>
                      </div>
                      <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">
                        {goal.current}{goal.suffix ?? ""}/{goal.target}{goal.suffix ?? ""}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted/30">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          goal.done ? "bg-emerald-400" : "bg-primary",
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════
            Section 4 — AI Insights Row (3 cards)
        ═══════════════════════════════════════ */}
        <motion.div variants={fadeUp}>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            AI Insights
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Market Brief */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Activity className="h-3 w-3 text-primary" />
                Market Brief
              </div>
              <p className="text-xs leading-relaxed text-foreground">{marketBrief}</p>
            </div>

            {/* Top Opportunity */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                Top Opportunity
              </div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold">{topOpportunity.ticker}</p>
                  <span
                    className={cn(
                      "inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold",
                      topOpportunity.direction === "long"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400",
                    )}
                  >
                    {topOpportunity.direction.toUpperCase()}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">Confidence</p>
                  <p className="text-sm font-bold text-primary">{topOpportunity.confidence}%</p>
                </div>
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                {topOpportunity.reason}
              </p>
            </div>

            {/* Risk Alert / Tip */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Shield className="h-3 w-3 text-amber-400" />
                {positions.length > 0 ? "Portfolio Risk" : "Risk Education"}
              </div>
              {positions.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium">
                    {positions.length} open position{positions.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Unrealized P&amp;L:{" "}
                    <span
                      className={cn(
                        "font-semibold tabular-nums",
                        positions.reduce((s, p) => s + p.unrealizedPnL, 0) >= 0
                          ? "text-emerald-400"
                          : "text-red-400",
                      )}
                    >
                      {positions.reduce((s, p) => s + p.unrealizedPnL, 0) >= 0 ? "+" : ""}
                      {formatCurrency(positions.reduce((s, p) => s + p.unrealizedPnL, 0))}
                    </span>
                  </p>
                  <p className="text-[10px] leading-relaxed text-muted-foreground">{riskTip}</p>
                </div>
              ) : (
                <p className="text-xs leading-relaxed text-muted-foreground">{riskTip}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════
            Section 5 — Learning + Quick Nav
        ═══════════════════════════════════════ */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Left: Learning Progress */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <BookOpen className="h-3 w-3" />
                Learning Progress
              </div>
              <Link
                href="/learn"
                className="flex items-center gap-0.5 text-[10px] font-medium text-primary hover:underline"
              >
                Continue
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-bold">{learnProgress.pct}% Complete</span>
                <span className="text-[10px] text-muted-foreground">
                  {learnProgress.completed}/{learnProgress.total} lessons
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted/30">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${learnProgress.pct}%` }}
                />
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-md border border-border/50 bg-muted/10 px-3 py-2 text-center">
                <p className="text-sm font-bold tabular-nums">{learnProgress.sRankCount}</p>
                <p className="text-[10px] text-muted-foreground">A/S Ranks</p>
              </div>
              <div className="rounded-md border border-border/50 bg-muted/10 px-3 py-2 text-center">
                <p className="text-sm font-bold tabular-nums">
                  {learningStreak > 0 ? `${learningStreak}d` : "--"}
                </p>
                <p className="text-[10px] text-muted-foreground">Streak</p>
              </div>
              <div className="rounded-md border border-border/50 bg-muted/10 px-3 py-2 text-center">
                <p className="text-sm font-bold tabular-nums">{learnProgress.xpEarnedThisWeek}</p>
                <p className="text-[10px] text-muted-foreground">XP this week</p>
              </div>
            </div>
          </div>

          {/* Right: Quick Navigation */}
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Quick Navigation
            </p>
            <div className="grid grid-cols-3 gap-2">
              {NAV_SHORTCUTS.map(({ label, href, Icon, color }) => (
                <Link key={href} href={href}>
                  <div className="flex flex-col items-center gap-2 rounded-lg border border-border/50 bg-muted/10 px-2 py-3 text-center transition-colors hover:border-border hover:bg-accent/20">
                    <Icon className={cn("h-5 w-5", color)} />
                    <span className="text-[11px] font-medium">{label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
