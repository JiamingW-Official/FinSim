"use client";

import { useMemo } from "react";
import Link from "next/link";
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
  ArrowRight,
  Shield,
  Zap,
  Star,
  Award,
  PlayCircle,
  PieChart,
  MessageSquare,
  Newspaper,
  ScanSearch,
  NotebookPen,
  CalendarClock,
  Gauge,
  Radio,
  Globe,
  CircleDot,
} from "lucide-react";

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
  BTC: 68420,
  Gold: 2340,
  VIX: 14.8,
};

// Tickers for the market overview strip
const OVERVIEW_TICKERS = ["SPY", "QQQ", "AAPL", "BTC", "Gold", "VIX"];

function simulateTickerPrice(ticker: string, timeSeed: number): { price: number; changePct: number } {
  const base = BASE_PRICES[ticker] ?? 100;
  const seed = tickerHash(ticker) ^ timeSeed;
  const rand = mulberry32(seed);
  const volatility = ticker === "VIX" ? 6 : ticker === "BTC" ? 5 : 4;
  const changePct = (rand() - 0.5) * volatility; // ±volatility/2 %
  const price = base * (1 + changePct / 100);
  return { price: Math.max(price, 0.01), changePct };
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
   Progress ring SVG
───────────────────────────────────────────── */
function ProgressRing({ pct, size = 64 }: { pct: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#10b981"
        strokeWidth="6"
        strokeDasharray={`${circ.toFixed(2)} ${circ.toFixed(2)}`}
        strokeDashoffset={offset.toFixed(2)}
        strokeLinecap="round"
      />
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


/* ─────────────────────────────────────────────
   Quick Nav shortcuts
───────────────────────────────────────────── */
const NAV_SHORTCUTS = [
  { label: "Trade", href: "/trade", Icon: BarChart3, color: "text-orange-400" },
  { label: "Learn", href: "/learn", Icon: BookOpen, color: "text-orange-400" },
  { label: "Backtest", href: "/backtest", Icon: Activity, color: "text-orange-400" },
  { label: "Options", href: "/options", Icon: Zap, color: "text-orange-400" },
  { label: "Arena", href: "/arena", Icon: Swords, color: "text-orange-400" },
  { label: "Portfolio", href: "/portfolio", Icon: Shield, color: "text-orange-400" },
];

/* ─────────────────────────────────────────────
   Quick Actions Grid (8 buttons, 4×2)
───────────────────────────────────────────── */
const QUICK_ACTIONS = [
  { label: "New Trade", href: "/trade", Icon: PlayCircle, color: "text-orange-400", bg: "bg-orange-500/10", hover: "hover:border-orange-500/40 hover:bg-orange-500/5" },
  { label: "Portfolio", href: "/portfolio", Icon: PieChart, color: "text-orange-400", bg: "bg-orange-500/10", hover: "hover:border-orange-500/40 hover:bg-orange-500/5" },
  { label: "Today's Quiz", href: "/quiz", Icon: Star, color: "text-amber-500", bg: "bg-amber-500/10", hover: "hover:border-amber-500/40 hover:bg-amber-500/5" },
  { label: "Earnings", href: "/learn", Icon: Newspaper, color: "text-orange-400", bg: "bg-orange-500/10", hover: "hover:border-orange-500/40 hover:bg-orange-500/5" },
  { label: "Scan Markets", href: "/backtest", Icon: ScanSearch, color: "text-orange-400", bg: "bg-orange-500/10", hover: "hover:border-orange-500/40 hover:bg-orange-500/5" },
  { label: "Journal", href: "/journal", Icon: NotebookPen, color: "text-orange-400", bg: "bg-orange-500/10", hover: "hover:border-orange-500/40 hover:bg-orange-500/5" },
  { label: "Options Flow", href: "/options", Icon: Zap, color: "text-orange-400", bg: "bg-orange-500/10", hover: "hover:border-orange-500/40 hover:bg-orange-500/5" },
  { label: "Macro Update", href: "/learn", Icon: Globe, color: "text-orange-400", bg: "bg-orange-500/10", hover: "hover:border-orange-500/40 hover:bg-orange-500/5" },
] as const;

/* ─────────────────────────────────────────────
   Economic calendar events (seeded)
───────────────────────────────────────────── */
const ECONOMIC_EVENTS = [
  { name: "FOMC Minutes", impact: "HIGH", daysFromNow: 1, time: "2:00 PM ET" },
  { name: "CPI (YoY)", impact: "HIGH", daysFromNow: 2, time: "8:30 AM ET" },
  { name: "Initial Jobless Claims", impact: "MED", daysFromNow: 3, time: "8:30 AM ET" },
  { name: "Retail Sales MoM", impact: "HIGH", daysFromNow: 4, time: "8:30 AM ET" },
  { name: "Fed Chair Speech", impact: "HIGH", daysFromNow: 5, time: "10:00 AM ET" },
  { name: "PCE Price Index", impact: "HIGH", daysFromNow: 6, time: "8:30 AM ET" },
  { name: "Non-Farm Payrolls", impact: "HIGH", daysFromNow: 7, time: "8:30 AM ET" },
];

/* ─────────────────────────────────────────────
   Format relative timestamp
───────────────────────────────────────────── */
function relativeTime(ts: number): string {
  const diffMs = Date.now() - ts;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

/* ─────────────────────────────────────────────
   Main Page Component
───────────────────────────────────────────── */
export default function HomePage() {
  /* ── Store state ── */
  const level = useGameStore((s) => s.level);
  const title = useGameStore((s) => s.title);
  const xp = useGameStore((s) => s.xp);
  const stats = useGameStore((s) => s.stats);
  const achievements = useGameStore((s) => s.achievements);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const equityHistory = useTradingStore((s) => s.equityHistory);
  const positions = useTradingStore((s) => s.positions);
  const learningStreak = useLearnStore((s) => s.learningStreak);
  const completedLessons = useLearnStore((s) => s.completedLessons);
  const lessonScores = useLearnStore((s) => s.lessonScores);
  const dailyStreakCount = useQuestStore((s) => s.dailyStreakCount);
  /* ── Single daySeed for all simulated prices (consistent across entire page) ── */
  const daySeed = Math.floor(Date.now() / 86400000);

  /* ── Market Pulse (VIX + regime + Fear & Greed) — computed early so VIX is available for overview strip ── */
  const marketPulse = useMemo(() => {
    const rand = mulberry32(daySeed ^ 0xbeefdead);
    const vix = +(rand() * 18 + 12).toFixed(2);
    // Fear & Greed is inversely correlated with VIX to avoid contradictions:
    // High VIX (fear) → low F&G, Low VIX (calm) → high F&G
    const vixNorm = Math.max(0, Math.min(1, (vix - 12) / 18)); // 0 = low VIX, 1 = high VIX
    const baseFG = Math.round((1 - vixNorm) * 80 + 10); // range ~10-90, inversely correlated
    // Add small daily noise (±8) but clamp to 0-100
    const noise = Math.round((rand() - 0.5) * 16);
    const fg = Math.max(0, Math.min(100, baseFG + noise));
    const regime =
      vix < 16 && fg > 55 ? "Bull" :
      vix > 25 || fg < 30 ? "Bear" :
      "Sideways";
    const fgLabel =
      fg >= 75 ? "Extreme Greed" :
      fg >= 55 ? "Greed" :
      fg >= 45 ? "Neutral" :
      fg >= 25 ? "Fear" :
      "Extreme Fear";
    return { vix, fg, fgLabel, regime };
  }, [daySeed]);

  /* ── Market overview strip — uses same daySeed as rest of page for consistency ── */
  const overviewPrices = useMemo(() => {
    return OVERVIEW_TICKERS.map((ticker) => {
      if (ticker === "VIX") {
        // VIX comes from marketPulse to ensure consistency across the page
        const baseVix = BASE_PRICES["VIX"];
        const changePct = ((marketPulse.vix - baseVix) / baseVix) * 100;
        return { ticker, price: marketPulse.vix, changePct };
      }
      return { ticker, ...simulateTickerPrice(ticker, daySeed) };
    });
  }, [daySeed, marketPulse.vix]);

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

  /* ── Options volume (seeded daily) ── */
  const optionsVolume = useMemo(() => {
    const rand = mulberry32(daySeed ^ 0xf00dface);
    return ALL_TICKERS.map((ticker) => ({
      ticker,
      volume: Math.floor(rand() * 900000 + 100000),
      callPutRatio: +(rand() * 1.8 + 0.4).toFixed(2),
      iv: +(rand() * 60 + 15).toFixed(1),
    })).sort((a, b) => b.volume - a.volume).slice(0, 5);
  }, [daySeed]);

  /* ── AI brief (day of week) ── */
  const dayIndex = new Date().getDay(); // 0=Sun
  const marketBrief = MARKET_BRIEFS[dayIndex % MARKET_BRIEFS.length];
  const topOpportunity = TOP_OPPORTUNITIES[dayIndex % TOP_OPPORTUNITIES.length];

  /* ── Today's focus insight ── */
  const todayFocus = useMemo(() => {
    const insights = [
      `Watch ${topOpportunity.ticker} for a potential ${topOpportunity.direction} entry near current levels.`,
      "Focus on high-quality setups with 2:1 R/R minimum — avoid chasing gaps.",
      "VIX is elevated — consider reducing position size by 25% to manage volatility.",
      "Options expiration week: expect intraday vol spikes in SPY and QQQ.",
      "Earnings season: wait for post-earnings price stabilization before entering.",
      "Trend following outperforming in current regime — avoid counter-trend bets.",
      "Macro headwinds persist — stay disciplined with stops, protect capital first.",
    ];
    return insights[dayIndex % insights.length];
  }, [dayIndex, topOpportunity]);

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

  /* ── Next lesson to continue ── */
  const nextLesson = useMemo(() => {
    for (const unit of UNITS) {
      for (const lesson of unit.lessons) {
        if (!completedLessons.includes(lesson.id)) {
          return { lesson, unit };
        }
      }
    }
    return null;
  }, [completedLessons]);

  /* ── Activity feed ── */
  type FeedItem = {
    id: string;
    type: "trade" | "achievement" | "lesson" | "levelup" | "quest";
    label: string;
    sub: string;
    ts: number;
    pnl?: number;
  };

  const activityFeed = useMemo((): FeedItem[] => {
    const items: FeedItem[] = [];

    // Recent trades
    tradeHistory.slice(-10).forEach((t) => {
      items.push({
        id: `trade-${t.id}`,
        type: "trade",
        label: `${t.side === "buy" ? "Bought" : "Sold"} ${t.ticker}`,
        sub: `${t.quantity} shares @ $${t.price.toFixed(2)}`,
        ts: t.timestamp,
        pnl: t.realizedPnL,
      });
    });

    // Achievements (use unlockedAt timestamp)
    achievements.slice(-5).forEach((a) => {
      items.push({
        id: `ach-${a.id}`,
        type: "achievement",
        label: `Achievement: ${a.name}`,
        sub: a.description,
        ts: a.unlockedAt,
      });
    });

    // Completed lessons
    completedLessons.slice(-5).forEach((lessonId) => {
      let lessonName = lessonId;
      for (const unit of UNITS) {
        const found = unit.lessons.find((l) => l.id === lessonId);
        if (found) { lessonName = found.title; break; }
      }
      items.push({
        id: `lesson-${lessonId}`,
        type: "lesson",
        label: `Lesson complete`,
        sub: lessonName,
        ts: Date.now() - Math.random() * 86400000 * 3, // approximate
      });
    });

    return items
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 12);
  }, [tradeHistory, achievements, completedLessons]);

  /* ── Morning AI brief bullets ── */
  const morningBullets = useMemo(() => {
    const bullets = [
      `${marketPulse.regime} regime detected — VIX at ${marketPulse.vix}, bias ${marketPulse.fg > 50 ? "bullish" : "cautious"}.`,
      `${topOpportunity.ticker} showing ${topOpportunity.direction} signal with ${topOpportunity.confidence}% confidence. ${topOpportunity.reason}.`,
      marketBrief.split(".")[0] + ".",
      todayFocus,
    ];
    return bullets;
  }, [marketPulse, topOpportunity, marketBrief, todayFocus]);

  /* ── Today's trades summary for morning brief ── */
  const yesterdaySummary = useMemo(() => {
    const cutoff = Date.now() - 24 * 3600000;
    const recent = tradeHistory.filter((t) => t.timestamp >= cutoff);
    const pnl = recent.reduce((s, t) => s + t.realizedPnL, 0);
    return { count: recent.length, pnl };
  }, [tradeHistory]);

  /* ── Hour of day greeting ── */
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div
        className="mx-auto w-full max-w-6xl space-y-5 p-6"
      >
        {/* ═══════════════════════════════════════
            Section 0 — Market Overview Strip
        ═══════════════════════════════════════ */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-muted-foreground">
                Market Overview
              </p>
              <span className="rounded bg-muted/40 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                Simulated
              </span>
            </div>
            <span className="text-xs text-muted-foreground">Daily snapshot</span>
          </div>
          {/* Scrollable row */}
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
            {overviewPrices.map(({ ticker, price, changePct }) => {
              const isUp = changePct >= 0;
              return (
                <div
                  key={ticker}
                  className="flex min-w-[110px] shrink-0 flex-col gap-0.5 rounded-lg border border-border bg-card px-3 py-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-foreground">{ticker}</span>
                    <span
                      className={cn(
                        "text-[11px] font-semibold",
                        isUp ? "text-emerald-400" : "text-red-400",
                      )}
                    >
                      {isUp ? "▲" : "▼"}
                    </span>
                  </div>
                  <p className="text-sm font-bold tabular-nums">
                    {ticker === "BTC"
                      ? `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                      : ticker === "VIX"
                      ? price.toFixed(2)
                      : `$${price.toFixed(2)}`}
                  </p>
                  <span
                    className={cn(
                      "text-xs font-semibold tabular-nums",
                      isUp ? "text-emerald-400" : "text-red-400",
                    )}
                  >
                    {isUp ? "+" : ""}
                    {changePct.toFixed(2)}%
                  </span>
                </div>
              );
            })}

            {/* Market Pulse chip — appended to strip */}
            <div className="flex min-w-[140px] shrink-0 flex-col gap-1 rounded-lg border border-border bg-card px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                <Gauge className="h-3 w-3 text-primary" />
                <span className="text-xs font-semibold text-muted-foreground">
                  Market Pulse
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-xs font-bold",
                    marketPulse.regime === "Bull" ? "bg-emerald-500/15 text-emerald-400" :
                    marketPulse.regime === "Bear" ? "bg-red-500/15 text-red-400" :
                    "bg-amber-500/15 text-amber-400",
                  )}
                >
                  {marketPulse.regime}
                </span>
                <span className="text-xs text-muted-foreground">VIX {marketPulse.vix}</span>
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  marketPulse.fg >= 55 ? "text-emerald-400" : marketPulse.fg <= 35 ? "text-red-400" : "text-amber-400",
                )}
              >
                F&G: {marketPulse.fg} · {marketPulse.fgLabel}
              </span>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════
            NEW Section A — AI Morning Brief Card
        ═══════════════════════════════════════ */}
        <div>
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            {/* Header bar */}
            <div className="border-b border-border/50 bg-muted/10 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                  <Radio className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {greeting}, Trader
                  </p>
                  <p className="text-xs text-muted-foreground">AlphaBot Morning Brief · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold border border-primary/30 bg-primary/10 text-primary">
                  AI Brief
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-0 lg:grid-cols-3">
              {/* Left: AI bullets */}
              <div className="border-b border-border/40 p-5 lg:border-b-0 lg:border-r lg:col-span-2">
                <p className="mb-3 text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <MessageSquare className="h-3 w-3 text-primary" />
                  Key Insights
                  <span className="rounded bg-primary/10 px-1 py-0.5 text-[11px] font-semibold text-primary">AI</span>
                </p>
                <ul className="space-y-2">
                  {morningBullets.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                      <span className="text-xs leading-relaxed text-foreground/90">{bullet}</span>
                    </li>
                  ))}
                </ul>

                {/* Today's focus */}
                <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-3.5 py-2.5">
                  <p className="mb-1 text-xs font-semibold text-primary/70">
                    Today&apos;s Focus
                  </p>
                  <p className="text-xs font-medium text-foreground">{todayFocus}</p>
                </div>
              </div>

              {/* Right: Yesterday summary + streak */}
              <div className="p-5">
                <p className="mb-3 text-xs font-semibold text-muted-foreground">
                  Yesterday&apos;s Summary
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Trades made</span>
                    <span className="text-xs font-bold tabular-nums">{yesterdaySummary.count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Session P&L</span>
                    <span
                      className={cn(
                        "text-xs font-bold tabular-nums",
                        yesterdaySummary.pnl >= 0 ? "text-emerald-400" : "text-red-400",
                      )}
                    >
                      {yesterdaySummary.pnl >= 0 ? "+" : ""}{formatCurrency(yesterdaySummary.pnl)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Win rate</span>
                    <span className="text-xs font-bold tabular-nums">{winRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Streak</span>
                    <div className="flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5 text-orange-400" />
                      <span className="text-xs font-bold tabular-nums">{dailyStreakCount}d</span>
                    </div>
                  </div>
                </div>

                {/* XP bar */}
                <div className="mt-4 border-t border-border/40 pt-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Level {level}</span>
                    <span className="text-xs text-muted-foreground">
                      {xpToNext > 0 ? `${xpToNext} XP to next` : "Max"}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted/30">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700"
                      style={{ width: `${xpProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════
            Your Next Step — contextual CTA card
        ═══════════════════════════════════════ */}
        <div>
          {completedLessons.length === 0 ? (
            <Link href="/learn">
              <div className="group flex items-center gap-4 rounded-xl border-2 border-primary/30 bg-primary/5 px-5 py-4 transition-colors hover:border-primary/50 hover:bg-primary/10">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Start your first lesson</p>
                  <p className="text-xs text-muted-foreground">Learn the basics of trading with interactive lessons and quizzes.</p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-primary opacity-60 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ) : stats.totalTrades === 0 ? (
            <Link href="/trade">
              <div className="group flex items-center gap-4 rounded-xl border-2 border-orange-500/30 bg-orange-500/5 px-5 py-4 transition-colors hover:border-orange-500/50 hover:bg-orange-500/10">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/15">
                  <BarChart3 className="h-5 w-5 text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Place your first practice trade</p>
                  <p className="text-xs text-muted-foreground">Apply what you learned with simulated trading. No real money at risk.</p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-orange-400 opacity-60 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ) : (
            <Link href="/portfolio">
              <div className="group flex items-center gap-4 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5 px-5 py-4 transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/10">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15">
                  <PieChart className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Review your performance</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalTrades} trade{stats.totalTrades !== 1 ? "s" : ""} completed — check your portfolio analytics and trade journal.
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-emerald-400 opacity-60 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          )}
        </div>

        {/* ═══════════════════════════════════════
            Section 1 — Hero Stats Row (4 cards)
        ═══════════════════════════════════════ */}
        <div>
          <div className="mb-3">
            <h1 className="text-base font-semibold">Dashboard</h1>
            <p className="text-xs text-muted-foreground">
              Lv.{level} {title}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Portfolio Value */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Wallet className="h-3 w-3 text-orange-400" />
                Portfolio Value
              </div>
              <p className="text-lg font-bold tabular-nums">{formatCurrency(portfolioValue)}</p>
              <div className="mt-1 flex items-center justify-between">
                <span
                  className={cn(
                    "text-xs font-semibold tabular-nums",
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
              <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
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
                  "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold mt-1",
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
              <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Trophy className="h-3 w-3 text-amber-400" />
                Level &amp; XP
              </div>
              <p className="text-lg font-bold tabular-nums">Level {level}</p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
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
              <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Target className="h-3 w-3 text-orange-400" />
                Win Rate
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-lg font-bold tabular-nums">{winRate.toFixed(1)}%</p>
                {weeklyStats && (
                  <span className="text-xs text-muted-foreground">
                    ({weeklyStats.rate.toFixed(0)}% this week)
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                {winRate >= 50 ? (
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-400" />
                )}
                <span>{stats.totalTrades} total trades</span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════
            NEW Section B — Quick Actions Grid (4×2)
        ═══════════════════════════════════════ */}
        <div>
          <p className="mb-3 text-xs font-semibold text-muted-foreground">
            Quick Actions
          </p>
          <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-8">
            {QUICK_ACTIONS.map(({ label, href, Icon, color, bg, hover }) => (
              <Link key={href + label} href={href}>
                <div
                  className={cn(
                    "group flex flex-col items-center gap-2 rounded-lg border border-border bg-card px-2 py-3.5 text-center transition-colors",
                    hover,
                  )}
                >
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", bg)}>
                    <Icon className={cn("h-4 w-4", color)} />
                  </div>
                  <span className="text-xs font-medium leading-tight">{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════
            NEW Section C — Market Intelligence Strip
        ═══════════════════════════════════════ */}
        <div>
          <p className="mb-3 text-xs font-semibold text-muted-foreground">
            Market Intelligence
          </p>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Market Pulse card */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-3 flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5 text-primary" />
                <p className="text-xs font-semibold text-muted-foreground">
                  Market Pulse
                </p>
              </div>
              <div className="space-y-3">
                {/* Regime */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Regime</span>
                  <span
                    className={cn(
                      "rounded px-2 py-0.5 text-[11px] font-bold",
                      marketPulse.regime === "Bull" ? "bg-emerald-500/15 text-emerald-400" :
                      marketPulse.regime === "Bear" ? "bg-red-500/15 text-red-400" :
                      "bg-amber-500/15 text-amber-400",
                    )}
                  >
                    {marketPulse.regime}
                  </span>
                </div>
                {/* VIX */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">VIX Level</span>
                  <span
                    className={cn(
                      "text-xs font-bold tabular-nums",
                      marketPulse.vix > 25 ? "text-red-400" : marketPulse.vix > 18 ? "text-amber-400" : "text-emerald-400",
                    )}
                  >
                    {marketPulse.vix}
                  </span>
                </div>
                {/* Fear & Greed */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Fear &amp; Greed</span>
                    <span
                      className={cn(
                        "text-xs font-bold tabular-nums",
                        marketPulse.fg >= 55 ? "text-emerald-400" : marketPulse.fg <= 35 ? "text-red-400" : "text-amber-400",
                      )}
                    >
                      {marketPulse.fg} · {marketPulse.fgLabel}
                    </span>
                  </div>
                  <div className="relative h-2 overflow-hidden rounded-full bg-muted/30">
                    {/* gradient track: red → amber → green */}
                    <div className="absolute inset-0 rounded-full bg-muted/40" />
                    <div
                      className={cn(
                        "absolute left-0 top-0 h-full rounded-full transition-all duration-700",
                        marketPulse.fg >= 55 ? "bg-emerald-400" : marketPulse.fg <= 35 ? "bg-red-400" : "bg-amber-400",
                      )}
                      style={{ width: `${marketPulse.fg}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Economic Calendar */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-3 flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs font-semibold text-muted-foreground">
                  Economic Calendar
                </p>
              </div>
              <div className="space-y-2">
                {ECONOMIC_EVENTS.slice(dayIndex % 4, (dayIndex % 4) + 3).map((ev, i) => (
                  <div key={i} className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <span
                        className={cn(
                          "mt-0.5 shrink-0 rounded px-1 py-0.5 text-[11px] font-bold",
                          ev.impact === "HIGH" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400",
                        )}
                      >
                        {ev.impact}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium">{ev.name}</p>
                        <p className="text-xs text-muted-foreground">{ev.time}</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                      {ev.daysFromNow === 1 ? "Tomorrow" : `In ${ev.daysFromNow}d`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Active Options */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-3 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <p className="text-xs font-semibold text-muted-foreground">
                  Most Active Options
                </p>
              </div>
              <div className="space-y-2">
                {optionsVolume.map((item) => (
                  <div key={item.ticker} className="flex items-center gap-2">
                    <span className="w-10 text-xs font-bold">{item.ticker}</span>
                    <div className="flex-1">
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted/30">
                        <div
                          className="h-full rounded-full bg-amber-500/60"
                          style={{ width: `${(item.volume / optionsVolume[0].volume) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-16 text-right text-xs font-mono text-muted-foreground tabular-nums">
                      {(item.volume / 1000).toFixed(0)}K
                    </span>
                    <span
                      className={cn(
                        "w-10 text-right text-xs font-semibold tabular-nums",
                        item.callPutRatio > 1 ? "text-emerald-400" : "text-red-400",
                      )}
                    >
                      {item.callPutRatio}C/P
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/options" className="mt-3 flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                View options flow
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Section 1b and Section 2 (Market Prices/Status) removed — redundant with overview strip */}

        {/* Market Movers section removed — filler below the fold */}

        {/* ═══════════════════════════════════════
            Section 3 — Main Content + Activity Feed (3+1 grid)
        ═══════════════════════════════════════ */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {/* Left 3 cols: Portfolio chart + Recent Trades + Daily Goals */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-3">
            {/* Portfolio mini-chart */}
            <div className="rounded-lg border border-border bg-card">
              <div className="border-b border-border px-4 py-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Portfolio Equity
                  </p>
                  <Link
                    href="/portfolio"
                    className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
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
                <p className="mt-2 text-xs text-muted-foreground">Last 30 trading days</p>

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
                      <p className="text-xs text-muted-foreground">+{positions.length - 3} more</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Trades */}
            <div className="rounded-lg border border-border bg-card">
              <div className="border-b border-border px-4 py-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Recent Trades
                  </p>
                  {tradeHistory.length > 0 && (
                    <Link
                      href="/portfolio"
                      className="text-xs font-medium text-primary hover:underline"
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
                            <p className="text-xs uppercase text-muted-foreground">
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

            {/* Daily Goals */}
            <div className="rounded-lg border border-border bg-card">
              <div className="border-b border-border px-4 py-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Daily Goals
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
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
                        <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                          {goal.current}{"suffix" in goal ? (goal as { suffix?: string }).suffix ?? "" : ""}/{goal.target}{"suffix" in goal ? (goal as { suffix?: string }).suffix ?? "" : ""}
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
          </div>

          {/* Right col: Activity Feed — enhanced with quest/timeline */}
          <div className="rounded-lg border border-border bg-card lg:col-span-1">
            <div className="border-b border-border px-4 py-2.5">
              <p className="text-xs font-semibold text-muted-foreground">
                Activity Timeline
              </p>
            </div>
            <div className="max-h-[420px] overflow-y-auto">
              {activityFeed.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <Activity className="h-6 w-6 text-muted-foreground/20" />
                  <p className="text-xs text-muted-foreground">No recent activity</p>
                  <p className="text-xs text-muted-foreground/60">
                    Trades, lessons, and achievements<br />will appear here.
                  </p>
                </div>
              ) : (
                <div className="relative px-4 py-3">
                  {/* Timeline line */}
                  <div className="absolute left-[26px] top-4 bottom-4 w-px bg-border/40" />
                  <div className="space-y-3">
                    {activityFeed.map((item) => {
                      const dotColor =
                        item.type === "trade" ? "border-orange-500/50 bg-orange-500/10" :
                        item.type === "achievement" ? "border-amber-500/50 bg-amber-500/10" :
                        item.type === "quest" ? "border-orange-500/50 bg-orange-500/10" :
                        "border-emerald-500/50 bg-emerald-500/10";

                      const iconEl =
                        item.type === "trade" ? (
                          <BarChart3 className="h-3 w-3 text-orange-400" />
                        ) : item.type === "achievement" ? (
                          <Award className="h-3 w-3 text-amber-500" />
                        ) : item.type === "quest" ? (
                          <CircleDot className="h-3 w-3 text-orange-400" />
                        ) : item.type === "levelup" ? (
                          <Star className="h-3 w-3 text-orange-400" />
                        ) : (
                          <BookOpen className="h-3 w-3 text-emerald-400" />
                        );

                      return (
                        <div key={item.id} className="flex items-start gap-2.5">
                          <div
                            className={cn(
                              "relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                              dotColor,
                            )}
                          >
                            {iconEl}
                          </div>
                          <div className="min-w-0 flex-1 pt-0.5">
                            <div className="flex items-baseline justify-between gap-1">
                              <p className="truncate text-[11px] font-medium">{item.label}</p>
                              <span className="shrink-0 text-[11px] text-muted-foreground">
                                {relativeTime(item.ts)}
                              </span>
                            </div>
                            <p className="truncate text-xs text-muted-foreground">{item.sub}</p>
                            {item.pnl !== undefined && item.pnl !== 0 && (
                              <span
                                className={cn(
                                  "text-xs font-semibold tabular-nums",
                                  item.pnl >= 0 ? "text-emerald-400" : "text-red-400",
                                )}
                              >
                                {item.pnl >= 0 ? "+" : ""}
                                {formatCurrency(item.pnl)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sections 3b (duplicate AI brief) and 4 (AI Insights) removed — consolidated in morning brief above */}

        {/* ═══════════════════════════════════════
            Learning Progress Widget + Quick Navigation
        ═══════════════════════════════════════ */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Learning Progress — enhanced with ring */}
          <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <BookOpen className="h-3 w-3" />
                Learning Progress
              </div>
              <Link
                href="/learn"
                className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
              >
                Continue
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="flex items-center gap-6 mb-4">
              {/* Progress ring */}
              <div className="relative shrink-0">
                <ProgressRing pct={learnProgress.pct} size={72} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold">{learnProgress.pct}%</span>
                </div>
              </div>

              {/* Progress details */}
              <div className="flex-1">
                <p className="mb-1 text-sm font-semibold">
                  {learnProgress.completed} / {learnProgress.total} lessons complete
                </p>
                {nextLesson ? (
                  <div className="rounded-md border border-border/50 bg-muted/10 px-3 py-2">
                    <p className="text-xs text-muted-foreground mb-0.5">Next recommended</p>
                    <p className="text-xs font-medium truncate">{nextLesson.lesson.title}</p>
                    <p className="text-xs text-muted-foreground">{nextLesson.unit.title}</p>
                  </div>
                ) : (
                  <p className="text-xs text-emerald-400 font-medium">All lessons complete!</p>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-md border border-border/50 bg-muted/10 px-3 py-2 text-center">
                <p className="text-sm font-bold tabular-nums">{learnProgress.sRankCount}</p>
                <p className="text-xs text-muted-foreground">A/S Ranks</p>
              </div>
              <div className="rounded-md border border-border/50 bg-muted/10 px-3 py-2 text-center">
                <p className="text-sm font-bold tabular-nums">
                  {learningStreak > 0 ? `${learningStreak}d` : "--"}
                </p>
                <p className="text-xs text-muted-foreground">Streak</p>
              </div>
              <div className="rounded-md border border-border/50 bg-muted/10 px-3 py-2 text-center">
                <p className="text-sm font-bold tabular-nums">{learnProgress.xpEarnedThisWeek}</p>
                <p className="text-xs text-muted-foreground">XP this week</p>
              </div>
              <div className="rounded-md border border-border/50 bg-muted/10 px-3 py-2 text-center">
                <p className="text-sm font-bold tabular-nums">{level}</p>
                <p className="text-xs text-muted-foreground">Level</p>
              </div>
            </div>
          </div>

          {/* Right: Quick Navigation */}
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="mb-4 text-xs font-semibold text-muted-foreground">
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
        </div>

        {/* ═══════════════════════════════════════
            Educational Disclaimer
        ═══════════════════════════════════════ */}
        <div className="border-t border-border/30 pt-4 pb-2 text-center">
          <p className="text-xs text-muted-foreground/60">
            All market data is simulated for educational purposes. Not financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}
