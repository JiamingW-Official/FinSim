"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useGameStore } from "@/stores/game-store";
import { useTradingStore } from "@/stores/trading-store";
import { useLearnStore } from "@/stores/learn-store";
import { useQuestStore } from "@/stores/quest-store";
import { INITIAL_CAPITAL } from "@/types/trading";
import { getXPForNextLevel, LEVEL_THRESHOLDS } from "@/types/game";
import { formatCurrency, cn } from "@/lib/utils";
import { UNITS } from "@/data/lessons";
import {
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
  PieChart,
  CircleDot,
} from "lucide-react";
import { mulberry32, simulateTickerPrice, BASE_PRICES, ALL_TICKERS } from "@/services/market-data/simulate-price";

// Tickers for the market overview strip
const OVERVIEW_TICKERS = ["SPY", "QQQ", "AAPL", "BTC", "Gold", "VIX"];

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
  "Market digesting Thursday's CPI print \u2014 core inflation slightly above expectations. Rotation from tech into financials and industrials accelerating.",
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

const NAV_SHORTCUTS = [
  { label: "Trade", href: "/trade", Icon: BarChart3 },
  { label: "Learn", href: "/learn", Icon: BookOpen },
  { label: "Backtest", href: "/backtest", Icon: Activity },
  { label: "Options", href: "/options", Icon: Zap },
  { label: "Arena", href: "/arena", Icon: Swords },
  { label: "Portfolio", href: "/portfolio", Icon: Shield },
];

const ECONOMIC_EVENTS = [
  { name: "FOMC Minutes", impact: "HIGH", daysFromNow: 1, time: "2:00 PM ET" },
  { name: "CPI (YoY)", impact: "HIGH", daysFromNow: 2, time: "8:30 AM ET" },
  { name: "Initial Jobless Claims", impact: "MED", daysFromNow: 3, time: "8:30 AM ET" },
  { name: "Retail Sales MoM", impact: "HIGH", daysFromNow: 4, time: "8:30 AM ET" },
  { name: "Fed Chair Speech", impact: "HIGH", daysFromNow: 5, time: "10:00 AM ET" },
  { name: "PCE Price Index", impact: "HIGH", daysFromNow: 6, time: "8:30 AM ET" },
  { name: "Non-Farm Payrolls", impact: "HIGH", daysFromNow: 7, time: "8:30 AM ET" },
];

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
  const daySeed = Math.floor(Date.now() / 86400000);

  const marketPulse = useMemo(() => {
    const rand = mulberry32(daySeed ^ 0xbeefdead);
    const vix = +(rand() * 18 + 12).toFixed(2);
    const vixNorm = Math.max(0, Math.min(1, (vix - 12) / 18));
    const baseFG = Math.round((1 - vixNorm) * 80 + 10);
    const noise = Math.round((rand() - 0.5) * 16);
    const fg = Math.max(0, Math.min(100, baseFG + noise));
    const regime = vix < 16 && fg > 55 ? "Bull" : vix > 25 || fg < 30 ? "Bear" : "Sideways";
    const fgLabel = fg >= 75 ? "Extreme Greed" : fg >= 55 ? "Greed" : fg >= 45 ? "Neutral" : fg >= 25 ? "Fear" : "Extreme Fear";
    return { vix, fg, fgLabel, regime };
  }, [daySeed]);

  const overviewPrices = useMemo(() => {
    return OVERVIEW_TICKERS.map((ticker) => {
      if (ticker === "VIX") {
        const baseVix = BASE_PRICES["VIX"];
        const changePct = ((marketPulse.vix - baseVix) / baseVix) * 100;
        return { ticker, price: marketPulse.vix, changePct };
      }
      return { ticker, ...simulateTickerPrice(ticker, daySeed) };
    });
  }, [daySeed, marketPulse.vix]);

  const totalPnL = portfolioValue - INITIAL_CAPITAL;
  const totalPnLPct = (totalPnL / INITIAL_CAPITAL) * 100;
  const winRate = stats.totalTrades > 0 ? (stats.profitableTrades / stats.totalTrades) * 100 : 0;
  const currentLevelXP = level > 1 ? LEVEL_THRESHOLDS[level - 2] : 0;
  const nextLevelXP = getXPForNextLevel(level);
  const xpProgress = level >= 50 ? 100 : Math.min(((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100, 100);
  const xpToNext = level >= 50 ? 0 : nextLevelXP - xp;
  const recentTrades = tradeHistory.slice(-5).reverse();

  const dailyPnL = useMemo(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return tradeHistory.filter((t) => t.timestamp >= startOfDay.getTime()).reduce((sum, t) => sum + t.realizedPnL, 0);
  }, [tradeHistory]);

  const optionsVolume = useMemo(() => {
    const rand = mulberry32(daySeed ^ 0xf00dface);
    return ALL_TICKERS.map((ticker) => ({
      ticker,
      volume: Math.floor(rand() * 900000 + 100000),
      callPutRatio: +(rand() * 1.8 + 0.4).toFixed(2),
      iv: +(rand() * 60 + 15).toFixed(1),
    })).sort((a, b) => b.volume - a.volume).slice(0, 5);
  }, [daySeed]);

  const dayIndex = new Date().getDay();
  const marketBrief = MARKET_BRIEFS[dayIndex % MARKET_BRIEFS.length];
  const topOpportunity = TOP_OPPORTUNITIES[dayIndex % TOP_OPPORTUNITIES.length];

  const todayFocus = useMemo(() => {
    const insights = [
      `Watch ${topOpportunity.ticker} for a potential ${topOpportunity.direction} entry near current levels.`,
      "Focus on high-quality setups with 2:1 R/R minimum \u2014 avoid chasing gaps.",
      "VIX is elevated \u2014 consider reducing position size by 25% to manage volatility.",
      "Options expiration week: expect intraday vol spikes in SPY and QQQ.",
      "Earnings season: wait for post-earnings price stabilization before entering.",
      "Trend following outperforming in current regime \u2014 avoid counter-trend bets.",
      "Macro headwinds persist \u2014 stay disciplined with stops, protect capital first.",
    ];
    return insights[dayIndex % insights.length];
  }, [dayIndex, topOpportunity]);

  const learnProgress = useMemo(() => {
    let total = 0;
    let completed = 0;
    for (const unit of UNITS) {
      total += unit.lessons.length;
      completed += unit.lessons.filter((l) => completedLessons.includes(l.id)).length;
    }
    const xpEarnedThisWeek = tradeHistory.filter((t) => t.timestamp >= Date.now() - 7 * 86400000).length * 15;
    const sRankCount = Object.values(lessonScores).filter((s) => s.grade === "S" || s.grade === "A").length;
    return { total, completed, pct: total > 0 ? Math.round((completed / total) * 100) : 0, xpEarnedThisWeek, sRankCount };
  }, [completedLessons, lessonScores, tradeHistory]);

  const dailyGoals = useMemo(() => {
    const todayTrades = tradeHistory.filter((t) => {
      const d = new Date(t.timestamp);
      const today = new Date();
      return d.toDateString() === today.toDateString();
    });
    const todayWins = todayTrades.filter((t) => t.realizedPnL > 0).length;
    const todayWinRate = todayTrades.length > 0 ? (todayWins / todayTrades.length) * 100 : 0;
    return [
      { label: "Make 3 trades today", current: Math.min(todayTrades.length, 3), target: 3, done: todayTrades.length >= 3 },
      { label: "Earn 100 XP", current: Math.min(xp % 500, 100), target: 100, done: xp >= 100 },
      { label: "Win rate above 60%", current: Math.round(todayWinRate), target: 60, done: todayTrades.length >= 3 && todayWinRate >= 60, suffix: "%" },
    ];
  }, [tradeHistory, xp]);

  const nextLesson = useMemo(() => {
    for (const unit of UNITS) {
      for (const lesson of unit.lessons) {
        if (!completedLessons.includes(lesson.id)) return { lesson, unit };
      }
    }
    return null;
  }, [completedLessons]);

  type FeedItem = { id: string; type: "trade" | "achievement" | "lesson" | "levelup" | "quest"; label: string; sub: string; ts: number; pnl?: number };

  const activityFeed = useMemo((): FeedItem[] => {
    const items: FeedItem[] = [];
    tradeHistory.slice(-10).forEach((t) => {
      items.push({ id: `trade-${t.id}`, type: "trade", label: `${t.side === "buy" ? "Bought" : "Sold"} ${t.ticker}`, sub: `${t.quantity} shares @ $${t.price.toFixed(2)}`, ts: t.timestamp, pnl: t.realizedPnL });
    });
    achievements.slice(-5).forEach((a) => {
      items.push({ id: `ach-${a.id}`, type: "achievement", label: `Achievement: ${a.name}`, sub: a.description, ts: a.unlockedAt });
    });
    completedLessons.slice(-5).forEach((lessonId) => {
      let lessonName = lessonId;
      for (const unit of UNITS) { const found = unit.lessons.find((l) => l.id === lessonId); if (found) { lessonName = found.title; break; } }
      items.push({ id: `lesson-${lessonId}`, type: "lesson", label: "Lesson complete", sub: lessonName, ts: Date.now() - Math.random() * 86400000 * 3 });
    });
    return items.sort((a, b) => b.ts - a.ts).slice(0, 12);
  }, [tradeHistory, achievements, completedLessons]);

  const morningBullets = useMemo(() => [
    `${marketPulse.regime} regime detected \u2014 VIX at ${marketPulse.vix}, bias ${marketPulse.fg > 50 ? "bullish" : "cautious"}.`,
    `${topOpportunity.ticker} showing ${topOpportunity.direction} signal with ${topOpportunity.confidence}% confidence. ${topOpportunity.reason}.`,
    marketBrief.split(".")[0] + ".",
    todayFocus,
  ], [marketPulse, topOpportunity, marketBrief, todayFocus]);

  const yesterdaySummary = useMemo(() => {
    const cutoff = Date.now() - 24 * 3600000;
    const recent = tradeHistory.filter((t) => t.timestamp >= cutoff);
    return { count: recent.length, pnl: recent.reduce((s, t) => s + t.realizedPnL, 0) };
  }, [tradeHistory]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const TIER2_ACTIONS = [
    { label: "Trade", href: "/trade", Icon: BarChart3 },
    { label: "Learn", href: "/learn", Icon: BookOpen },
    { label: "Predictions", href: "/predictions", Icon: Target },
    { label: "Portfolio", href: "/portfolio", Icon: PieChart },
  ] as const;

  // Hydration: Zustand persisted stores aren't ready on first render
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl space-y-5 p-6">

        {/* ═══════ TIER 1 — HERO ZONE ═══════ */}
        <div className="rounded-lg border-l-4 border-primary bg-card overflow-hidden">
          {/* Hero header */}
          <div className="border-b border-border/30 px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-base font-semibold">{greeting}, Trader</p>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                <span className="mx-1.5 text-border">|</span>
                Lv.{level} {title}
              </p>
            </div>
            <span className="rounded bg-muted/40 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">Simulated</span>
          </div>

          {/* Market state strip */}
          <div className="border-b border-border/20 px-6 py-3 flex items-center gap-4 overflow-x-auto scrollbar-none">
            {!mounted ? (
              /* Skeleton while stores hydrate */
              <>
                <Skeleton className="h-5 w-12 shrink-0" />
                <Skeleton className="h-4 w-14 shrink-0" />
                <Skeleton className="h-4 w-12 shrink-0" />
                <div className="h-3 w-px bg-border/40 shrink-0" />
                {OVERVIEW_TICKERS.map((t) => (
                  <div key={t} className="flex shrink-0 items-center gap-1.5">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </>
            ) : (
              <>
                <span className={cn("shrink-0 rounded px-2 py-0.5 text-xs font-bold", marketPulse.regime === "Bull" ? "bg-emerald-500/15 text-emerald-400" : marketPulse.regime === "Bear" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400")}>
                  {marketPulse.regime}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  VIX <span className={cn("font-bold tabular-nums", marketPulse.vix > 25 ? "text-red-400" : marketPulse.vix > 18 ? "text-amber-400" : "text-emerald-400")}>{marketPulse.vix}</span>
                </span>
                <span className={cn("shrink-0 text-xs font-medium", marketPulse.fg >= 55 ? "text-emerald-400" : marketPulse.fg <= 35 ? "text-red-400" : "text-amber-400")}>
                  F&G {marketPulse.fg}
                </span>
                <div className="h-3 w-px bg-border/40 shrink-0" />
                {overviewPrices.map(({ ticker, price, changePct }) => {
                  const isUp = changePct >= 0;
                  return (
                    <div key={ticker} className="flex shrink-0 items-center gap-1.5">
                      <span className="text-xs font-bold">{ticker}</span>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {ticker === "BTC" ? `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : ticker === "VIX" ? price.toFixed(2) : `$${price.toFixed(2)}`}
                      </span>
                      <span className={cn("text-xs font-semibold tabular-nums", isUp ? "text-emerald-400" : "text-red-400")}>
                        {isUp ? "+" : ""}{changePct.toFixed(2)}%
                      </span>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Main hero body */}
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-3">
            <div className="border-b border-border/20 p-6 lg:border-b-0 lg:border-r lg:border-border/20 lg:col-span-2">
              <p className="mb-3 text-sm font-semibold flex items-center gap-1.5">
                Key Insights
                <span className="rounded bg-primary/10 px-1 py-0.5 text-[11px] font-semibold text-primary">AI</span>
              </p>
              <ul className="space-y-2.5">
                {morningBullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                    <span className="text-sm leading-relaxed text-foreground/90">{bullet}</span>
                  </li>
                ))}
              </ul>

              {/* TODAY'S FOCUS -- most prominent text */}
              <div className="mt-5 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                <p className="text-base font-medium text-foreground">{todayFocus}</p>
              </div>

              {/* Your Next Step CTA -- inside hero */}
              <div className="mt-4">
                {completedLessons.length === 0 ? (
                  <Link href="/learn">
                    <div className="group flex items-center gap-3 rounded-lg bg-muted/20 px-4 py-3 transition-colors hover:bg-muted/40">
                      <div className="flex-1">
                        <p className="text-sm font-semibold">Start your first lesson</p>
                        <p className="text-xs text-muted-foreground">Learn the basics of trading with interactive lessons.</p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ) : stats.totalTrades === 0 ? (
                  <Link href="/trade">
                    <div className="group flex items-center gap-3 rounded-lg bg-muted/20 px-4 py-3 transition-colors hover:bg-muted/40">
                      <div className="flex-1">
                        <p className="text-sm font-semibold">Place your first practice trade</p>
                        <p className="text-xs text-muted-foreground">Apply what you learned. No real money at risk.</p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ) : (
                  <Link href="/portfolio">
                    <div className="group flex items-center gap-3 rounded-lg bg-muted/20 px-4 py-3 transition-colors hover:bg-muted/40">
                      <div className="flex-1">
                        <p className="text-sm font-semibold">Review your performance</p>
                        <p className="text-xs text-muted-foreground">{stats.totalTrades} trade{stats.totalTrades !== 1 ? "s" : ""} completed — check analytics and journal.</p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                )}
              </div>
            </div>

            {/* Right: Yesterday summary */}
            <div className="p-6">
              <p className="mb-3 text-xs font-medium">Yesterday&apos;s Summary</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Trades made</span><span className="text-sm font-bold tabular-nums">{yesterdaySummary.count}</span></div>
                <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Session P&L</span><span className={cn("text-sm font-bold tabular-nums", yesterdaySummary.pnl >= 0 ? "text-emerald-400" : "text-red-400")}>{yesterdaySummary.pnl >= 0 ? "+" : ""}{formatCurrency(yesterdaySummary.pnl)}</span></div>
                <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Win rate</span><span className="text-sm font-bold tabular-nums">{winRate.toFixed(1)}%</span></div>
                <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Streak</span><span className="text-sm font-bold tabular-nums">{dailyStreakCount}d</span></div>
              </div>
              <div className="mt-5 border-t border-border/20 pt-3">
                <div className="mb-1.5 flex items-center justify-between"><span className="text-xs text-muted-foreground">Level {level}</span><span className="text-xs text-muted-foreground">{xpToNext > 0 ? `${xpToNext} XP to next` : "Max"}</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted/30"><div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${xpProgress}%` }} /></div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ TIER 2 — ACTION ZONE ═══════ */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-md border border-border bg-card p-3"><p className="text-xs text-muted-foreground">Portfolio</p><p className="text-sm font-bold tabular-nums">{formatCurrency(portfolioValue)}</p><span className={cn("text-xs tabular-nums", totalPnLPct >= 0 ? "text-emerald-400" : "text-red-400")}>{totalPnLPct >= 0 ? "+" : ""}{totalPnLPct.toFixed(2)}%</span></div>
          <div className="rounded-md border border-border bg-card p-3"><p className="text-xs text-muted-foreground">Daily P&amp;L</p><p className={cn("text-sm font-bold tabular-nums", dailyPnL >= 0 ? "text-emerald-400" : "text-red-400")}>{dailyPnL >= 0 ? "+" : ""}{formatCurrency(dailyPnL)}</p></div>
          <div className="rounded-md border border-border bg-card p-3"><p className="text-xs text-muted-foreground">Level</p><p className="text-sm font-bold tabular-nums">{level}</p><span className="text-xs text-muted-foreground tabular-nums">{xp.toLocaleString()} XP</span></div>
          <div className="rounded-md border border-border bg-card p-3"><p className="text-xs text-muted-foreground">Win Rate</p><p className="text-sm font-bold tabular-nums">{winRate.toFixed(1)}%</p><span className="text-xs text-muted-foreground tabular-nums">{stats.totalTrades} trades</span></div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TIER2_ACTIONS.map(({ label, href, Icon }) => (
            <Link key={href} href={href}>
              <div className="group flex items-center justify-center gap-2 rounded-md border border-border bg-card p-4 transition-colors hover:bg-accent/50">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium">{label}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* ═══════ TIER 3 — REFERENCE ZONE ═══════ */}
        <div>
          <p className="mb-2 text-xs font-medium">Market Intelligence</p>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="rounded-md border border-border/30 bg-card p-3">
              <p className="mb-2 text-xs text-muted-foreground">Market Pulse</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Regime</span><span className={cn("rounded px-1.5 py-0.5 text-[11px] font-bold", marketPulse.regime === "Bull" ? "bg-emerald-500/15 text-emerald-400" : marketPulse.regime === "Bear" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400")}>{marketPulse.regime}</span></div>
                <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">VIX</span><span className={cn("text-xs font-bold tabular-nums", marketPulse.vix > 25 ? "text-red-400" : marketPulse.vix > 18 ? "text-amber-400" : "text-emerald-400")}>{marketPulse.vix}</span></div>
                <div>
                  <div className="mb-1 flex items-center justify-between"><span className="text-xs text-muted-foreground">Fear &amp; Greed</span><span className={cn("text-xs font-bold tabular-nums", marketPulse.fg >= 55 ? "text-emerald-400" : marketPulse.fg <= 35 ? "text-red-400" : "text-amber-400")}>{marketPulse.fg} · {marketPulse.fgLabel}</span></div>
                  <div className="relative h-1.5 overflow-hidden rounded-full bg-muted/30"><div className={cn("absolute left-0 top-0 h-full rounded-full transition-all duration-700", marketPulse.fg >= 55 ? "bg-emerald-400" : marketPulse.fg <= 35 ? "bg-red-400" : "bg-amber-400")} style={{ width: `${marketPulse.fg}%` }} /></div>
                </div>
              </div>
            </div>
            <div className="rounded-md border border-border/30 bg-card p-3">
              <p className="mb-2 text-xs text-muted-foreground">Economic Calendar</p>
              <div className="space-y-2">
                {ECONOMIC_EVENTS.slice(dayIndex % 4, (dayIndex % 4) + 3).map((ev, i) => (
                  <div key={i} className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-1.5 min-w-0">
                      <span className={cn("mt-0.5 shrink-0 rounded px-1 py-0.5 text-[11px] font-bold", ev.impact === "HIGH" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400")}>{ev.impact}</span>
                      <div className="min-w-0"><p className="truncate text-xs font-medium">{ev.name}</p><p className="text-[11px] text-muted-foreground">{ev.time}</p></div>
                    </div>
                    <span className="shrink-0 text-[11px] text-muted-foreground whitespace-nowrap">{ev.daysFromNow === 1 ? "Tomorrow" : `In ${ev.daysFromNow}d`}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-border/30 bg-card p-3">
              <p className="mb-2 text-xs text-muted-foreground">Most Active Options</p>
              <div className="space-y-1.5">
                {optionsVolume.map((item) => (
                  <div key={item.ticker} className="flex items-center gap-2">
                    <span className="w-10 text-xs font-bold">{item.ticker}</span>
                    <div className="flex-1"><div className="h-1 overflow-hidden rounded-full bg-muted/30"><div className="h-full rounded-full bg-amber-500/60" style={{ width: `${(item.volume / optionsVolume[0].volume) * 100}%` }} /></div></div>
                    <span className="w-14 text-right text-[11px] font-mono text-muted-foreground tabular-nums">{(item.volume / 1000).toFixed(0)}K</span>
                    <span className={cn("w-10 text-right text-[11px] font-semibold tabular-nums", item.callPutRatio > 1 ? "text-emerald-400" : "text-red-400")}>{item.callPutRatio}C/P</span>
                  </div>
                ))}
              </div>
              <Link href="/options" className="mt-2 flex items-center gap-1 text-[11px] font-medium text-primary hover:underline">View options flow <ChevronRight className="h-3 w-3" /></Link>
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:col-span-3">
            <div className="rounded-md border border-border/30 bg-card">
              <div className="flex items-center justify-between px-3 py-2"><p className="text-xs text-muted-foreground">Portfolio Equity</p><Link href="/portfolio" className="flex items-center gap-0.5 text-[11px] font-medium text-primary hover:underline">View <ChevronRight className="h-3 w-3" /></Link></div>
              <div className="px-3 pb-3">
                <div className="mb-2 flex items-baseline gap-2"><span className="text-sm font-bold tabular-nums">{formatCurrency(portfolioValue)}</span><span className={cn("text-xs font-semibold tabular-nums", totalPnL >= 0 ? "text-emerald-400" : "text-red-400")}>{totalPnL >= 0 ? "+" : ""}{formatCurrency(totalPnL)}</span></div>
                <PortfolioEquityChart equityHistory={equityHistory} currentValue={portfolioValue} />
                {positions.length > 0 && (
                  <div className="mt-2 space-y-1 border-t border-border/20 pt-2">
                    {positions.slice(0, 3).map((pos) => (
                      <div key={pos.ticker} className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5"><div className={cn("h-1.5 w-1.5 rounded-full", pos.side === "long" ? "bg-emerald-400" : "bg-red-400")} /><span className="font-semibold">{pos.ticker}</span><span className="text-muted-foreground">{pos.side}</span></div>
                        <span className={cn("font-semibold tabular-nums", pos.unrealizedPnL >= 0 ? "text-emerald-400" : "text-red-400")}>{pos.unrealizedPnL >= 0 ? "+" : ""}{formatCurrency(pos.unrealizedPnL)}</span>
                      </div>
                    ))}
                    {positions.length > 3 && <p className="text-[11px] text-muted-foreground">+{positions.length - 3} more</p>}
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-md border border-border/30 bg-card">
              <div className="flex items-center justify-between px-3 py-2"><p className="text-xs text-muted-foreground">Recent Trades</p>{tradeHistory.length > 0 && <Link href="/portfolio" className="text-[11px] font-medium text-primary hover:underline">View All</Link>}</div>
              <div>
                {recentTrades.length === 0 ? (
                  <div className="flex flex-col items-center gap-1.5 py-6 text-center"><p className="text-xs text-muted-foreground">No trades yet</p><Link href="/trade" className="text-[11px] font-medium text-primary hover:underline">Start trading</Link></div>
                ) : (
                  <div className="divide-y divide-border/20">
                    {recentTrades.map((trade, i) => (
                      <div key={`${trade.timestamp}-${i}`} className="flex items-center justify-between px-3 py-2">
                        <div className="flex items-center gap-1.5"><div className={cn("h-1.5 w-1.5 shrink-0 rounded-full", trade.side === "buy" ? "bg-emerald-400" : "bg-red-400")} /><div><p className="text-xs font-semibold">{trade.ticker}</p><p className="text-[11px] uppercase text-muted-foreground">{trade.side} &times; {trade.quantity}</p></div></div>
                        <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-bold tabular-nums", trade.realizedPnL >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400")}>{trade.realizedPnL >= 0 ? "+" : ""}{formatCurrency(trade.realizedPnL)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-md border border-border/30 bg-card">
              <div className="flex items-center justify-between px-3 py-2"><p className="text-xs text-muted-foreground">Daily Goals</p><span className="text-[11px] text-muted-foreground">{dailyStreakCount}d streak</span></div>
              <div className="space-y-3 px-3 py-3">
                {dailyGoals.map((goal) => {
                  const pct = Math.min((goal.current / goal.target) * 100, 100);
                  return (
                    <div key={goal.label}>
                      <div className="mb-1 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">{goal.done ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <div className="h-3 w-3 rounded-full border border-border/60" />}<span className="text-xs text-foreground">{goal.label}</span></div>
                        <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">{goal.current}{"suffix" in goal ? (goal as { suffix?: string }).suffix ?? "" : ""}/{goal.target}{"suffix" in goal ? (goal as { suffix?: string }).suffix ?? "" : ""}</span>
                      </div>
                      <div className="h-1 overflow-hidden rounded-full bg-muted/30"><div className={cn("h-full rounded-full transition-all duration-500", goal.done ? "bg-emerald-400" : "bg-primary")} style={{ width: `${pct}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="rounded-md border border-border/30 bg-card lg:col-span-1">
            <div className="px-3 py-2"><p className="text-xs text-muted-foreground">Activity Timeline</p></div>
            <div className="max-h-[380px] overflow-y-auto">
              {activityFeed.length === 0 ? (
                <div className="flex flex-col items-center gap-1.5 py-8 text-center"><p className="text-xs text-muted-foreground">No recent activity</p><p className="text-[11px] text-muted-foreground/60">Trades, lessons, and achievements will appear here.</p></div>
              ) : (
                <div className="relative px-3 py-2">
                  <div className="absolute left-[22px] top-3 bottom-3 w-px bg-border/30" />
                  <div className="space-y-2.5">
                    {activityFeed.map((item) => {
                      const iconEl = item.type === "trade" ? <BarChart3 className="h-2.5 w-2.5 text-muted-foreground" /> : item.type === "achievement" ? <Award className="h-2.5 w-2.5 text-muted-foreground" /> : item.type === "quest" ? <CircleDot className="h-2.5 w-2.5 text-muted-foreground" /> : item.type === "levelup" ? <Star className="h-2.5 w-2.5 text-muted-foreground" /> : <BookOpen className="h-2.5 w-2.5 text-muted-foreground" />;
                      return (
                        <div key={item.id} className="flex items-start gap-2">
                          <div className="relative z-10 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-border/40 bg-card">{iconEl}</div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-1"><p className="truncate text-[11px] font-medium">{item.label}</p><span className="shrink-0 text-[11px] text-muted-foreground">{relativeTime(item.ts)}</span></div>
                            <p className="truncate text-[11px] text-muted-foreground">{item.sub}</p>
                            {item.pnl !== undefined && item.pnl !== 0 && <span className={cn("text-[11px] font-semibold tabular-nums", item.pnl >= 0 ? "text-emerald-400" : "text-red-400")}>{item.pnl >= 0 ? "+" : ""}{formatCurrency(item.pnl)}</span>}
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

        {/* Learning + Nav */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="rounded-md border border-border/30 bg-card p-3 lg:col-span-2">
            <div className="mb-3 flex items-center justify-between"><p className="text-xs font-medium">Learning Progress</p><Link href="/learn" className="flex items-center gap-0.5 text-[11px] font-medium text-primary hover:underline">Continue <ArrowRight className="h-3 w-3" /></Link></div>
            <div className="flex items-center gap-5 mb-3">
              <div className="relative shrink-0"><ProgressRing pct={learnProgress.pct} size={60} /><div className="absolute inset-0 flex items-center justify-center"><span className="text-xs font-bold">{learnProgress.pct}%</span></div></div>
              <div className="flex-1">
                <p className="mb-1 text-sm font-semibold">{learnProgress.completed} / {learnProgress.total} lessons</p>
                {nextLesson ? <div className="rounded border border-border/30 bg-muted/10 px-2.5 py-1.5"><p className="text-[11px] text-muted-foreground">Next: <span className="font-medium text-foreground">{nextLesson.lesson.title}</span></p></div> : <p className="text-xs text-emerald-400 font-medium">All complete!</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { val: learnProgress.sRankCount, label: "A/S Ranks" },
                { val: learningStreak > 0 ? `${learningStreak}d` : "--", label: "Streak" },
                { val: learnProgress.xpEarnedThisWeek, label: "XP/week" },
                { val: level, label: "Level" },
              ].map((s) => (
                <div key={s.label} className="rounded border border-border/30 bg-muted/10 px-2 py-1.5 text-center"><p className="text-xs font-bold tabular-nums">{s.val}</p><p className="text-[11px] text-muted-foreground">{s.label}</p></div>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-border/30 bg-card p-3">
            <p className="mb-3 text-xs text-muted-foreground">Quick Navigation</p>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {NAV_SHORTCUTS.map(({ label, href, Icon }) => (
                <Link key={href} href={href}><div className="flex flex-col items-center gap-1.5 rounded border border-border/30 bg-muted/10 px-1.5 py-2 text-center transition-colors hover:bg-accent/20"><Icon className="h-4 w-4 text-muted-foreground" /><span className="text-[11px] font-medium">{label}</span></div></Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border/20 pt-3 pb-2 text-center">
          <p className="text-[11px] text-muted-foreground/50">All market data is simulated for educational purposes. Not financial advice.</p>
        </div>
      </div>
    </div>
  );
}
