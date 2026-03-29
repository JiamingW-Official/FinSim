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
  ArrowRight,
  Shield,
  Zap,
  Award,
  PieChart,
  CircleDot,
  Star,
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

  const morningBullets = useMemo(() => [
    `${marketPulse.regime} regime detected \u2014 VIX at ${marketPulse.vix}, bias ${marketPulse.fg > 50 ? "bullish" : "cautious"}.`,
    `${topOpportunity.ticker} showing ${topOpportunity.direction} signal with ${topOpportunity.confidence}% confidence. ${topOpportunity.reason}.`,
    marketBrief.split(".")[0] + ".",
  ], [marketPulse, topOpportunity, marketBrief]);

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

  // Hydration: Zustand persisted stores aren't ready on first render
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl p-6">

        {/* ═══════════════════════════════════════════
            TIER 1 — DOMINANT HERO (60%+ viewport)
        ═══════════════════════════════════════════ */}
        <div className="rounded-lg border-l-4 border-primary bg-card overflow-hidden">
          {/* Hero header — generous padding */}
          <div className="border-b border-border/30 px-8 py-6 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold tracking-tight">{greeting}, Trader</p>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                <span className="mx-2 text-border">|</span>
                Lv.{level} {title}
              </p>
            </div>
            <span className="rounded bg-muted/40 px-2 py-0.5 text-xs font-medium text-muted-foreground">Simulated</span>
          </div>

          {/* Market state strip — prominent */}
          <div className="border-b border-border/20 px-8 py-4 flex items-center gap-5 overflow-x-auto scrollbar-none">
            {!mounted ? (
              <>
                <Skeleton className="h-6 w-14 shrink-0" />
                <Skeleton className="h-5 w-16 shrink-0" />
                <Skeleton className="h-5 w-14 shrink-0" />
                <div className="h-4 w-px bg-border/40 shrink-0" />
                {OVERVIEW_TICKERS.map((t) => (
                  <div key={t} className="flex shrink-0 items-center gap-2">
                    <Skeleton className="h-5 w-10" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-14" />
                  </div>
                ))}
              </>
            ) : (
              <>
                <span className={cn("shrink-0 rounded px-2.5 py-1 text-sm font-medium", marketPulse.regime === "Bull" ? "bg-emerald-500/15 text-emerald-400" : marketPulse.regime === "Bear" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400")}>
                  {marketPulse.regime}
                </span>
                <span className="shrink-0 text-sm text-muted-foreground">
                  VIX <span className={cn("font-normal tabular-nums", marketPulse.vix > 25 ? "text-red-400" : marketPulse.vix > 18 ? "text-amber-400" : "text-emerald-400")}>{marketPulse.vix}</span>
                </span>
                <span className={cn("shrink-0 text-sm font-normal", marketPulse.fg >= 55 ? "text-emerald-400" : marketPulse.fg <= 35 ? "text-red-400" : "text-amber-400")}>
                  F&G {marketPulse.fg}
                </span>
                <div className="h-4 w-px bg-border/40 shrink-0" />
                {overviewPrices.map(({ ticker, price, changePct }) => {
                  const isUp = changePct >= 0;
                  return (
                    <div key={ticker} className="flex shrink-0 items-center gap-2">
                      <span className="text-sm font-medium">{ticker}</span>
                      <span className="text-sm font-normal tabular-nums text-muted-foreground">
                        {ticker === "BTC" ? `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : ticker === "VIX" ? price.toFixed(2) : `$${price.toFixed(2)}`}
                      </span>
                      <span className={cn("text-sm font-normal tabular-nums", isUp ? "text-emerald-400" : "text-red-400")}>
                        {isUp ? "+" : ""}{changePct.toFixed(2)}%
                      </span>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Main hero body — generous py-8 */}
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-3">
            <div className="border-b border-border/20 px-8 py-8 lg:border-b-0 lg:border-r lg:border-border/20 lg:col-span-2">
              <p className="mb-4 text-xs text-muted-foreground">
                Key insights
              </p>
              <ul className="space-y-3">
                {morningBullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                    <span className="text-base font-normal leading-relaxed text-foreground/90">{bullet}</span>
                  </li>
                ))}
              </ul>

              {/* TODAY'S FOCUS */}
              <div className="mt-6 border-l-2 border-primary/30 pl-4">
                <p className="text-sm font-medium leading-relaxed text-foreground/80">{todayFocus}</p>
              </div>

              {/* CTA — subtle, not a giant green banner */}
              <div className="mt-6">
                {completedLessons.length === 0 ? (
                  <Link href="/learn" className="group inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                    Start your first lesson
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ) : stats.totalTrades === 0 ? (
                  <Link href="/trade" className="group inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                    Place your first practice trade
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ) : (
                  <Link href="/trade" className="group inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                    Open trading terminal
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Right column: Yesterday + Level — inside the hero */}
            <div className="px-8 py-8">
              <p className="mb-4 text-xs text-muted-foreground">Yesterday</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Trades</span><span className="text-xs tabular-nums">{yesterdaySummary.count}</span></div>
                <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Session P&L</span><span className={cn("text-xs tabular-nums", yesterdaySummary.pnl >= 0 ? "text-emerald-400" : "text-red-400")}>{yesterdaySummary.pnl >= 0 ? "+" : ""}{formatCurrency(yesterdaySummary.pnl)}</span></div>
                <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Win rate</span><span className="text-xs tabular-nums">{winRate.toFixed(1)}%</span></div>
                <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Streak</span><span className="text-xs tabular-nums">{dailyStreakCount}d</span></div>
              </div>

              {/* Portfolio equity mini chart */}
              <div className="mt-6 border-t border-border/20 pt-4">
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-xs font-normal text-muted-foreground">Portfolio</span>
                  <span className="text-xs tabular-nums">{formatCurrency(portfolioValue)}</span>
                </div>
                <PortfolioEquityChart equityHistory={equityHistory} currentValue={portfolioValue} />
              </div>

              {/* XP bar */}
              <div className="mt-4 border-t border-border/20 pt-3">
                <div className="mb-1.5 flex items-center justify-between"><span className="text-xs text-muted-foreground">Level {level}</span><span className="text-xs text-muted-foreground">{xpToNext > 0 ? `${xpToNext} XP to next` : "Max"}</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted/30"><div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${xpProgress}%` }} /></div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            QUIET ZONE — breathing room after dense hero
        ═══════════════════════════════════════════ */}
        <div className="mt-16" />

        {/* TIER 2 — ACTION ZONE (crushed — metadata level) */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[11px] text-muted-foreground/50 tabular-nums">
          <span>{formatCurrency(portfolioValue)}</span>
          <span className="text-border/40">·</span>
          <span className={totalPnLPct >= 0 ? "text-emerald-400/50" : "text-red-400/50"}>{totalPnLPct >= 0 ? "+" : ""}{totalPnLPct.toFixed(2)}%</span>
          <span className="text-border/40">·</span>
          <span>Daily {dailyPnL >= 0 ? "+" : ""}{formatCurrency(dailyPnL)}</span>
          <span className="text-border/40">·</span>
          <span>Lv.{level} {xp.toLocaleString()} XP</span>
          <span className="text-border/40">·</span>
          <span>Win {winRate.toFixed(1)}% ({stats.totalTrades})</span>
        </div>

        {/* Quick actions — text-xs, crushed */}
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
          {[
            { label: "Trade", href: "/trade", Icon: BarChart3 },
            { label: "Learn", href: "/learn", Icon: BookOpen },
            { label: "Predictions", href: "/predictions", Icon: Target },
            { label: "Portfolio", href: "/portfolio", Icon: PieChart },
          ].map(({ label, href, Icon }) => (
            <Link key={href} href={href} className="group flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground active:scale-[0.98] cursor-pointer">
              <Icon className="h-3 w-3" />
              <span>{label}</span>
            </Link>
          ))}
        </div>

        {/* ═══════════════════════════════════════════
            QUIET ZONE — visual rest between action & reference
        ═══════════════════════════════════════════ */}
        <div className="my-10" />

        {/* ═══════════════════════════════════════════
            TIER 3 — REFERENCE: Market Intelligence (nearly invisible)
        ═══════════════════════════════════════════ */}
        <div className="grid grid-cols-1 gap-1.5 lg:grid-cols-3 opacity-50">
          {/* Market Pulse — hero reference card, spans 2 cols */}
          <div className="rounded bg-muted/20 px-5 py-4 lg:col-span-2">
            <p className="mb-2 text-xs font-normal text-muted-foreground">Market Pulse</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span className="text-muted-foreground">Regime <span className={cn("tabular-nums", marketPulse.regime === "Bull" ? "text-emerald-400" : marketPulse.regime === "Bear" ? "text-red-400" : "text-amber-400")}>{marketPulse.regime}</span></span>
              <span className="text-border/30">·</span>
              <span className="text-muted-foreground">VIX <span className={cn("tabular-nums", marketPulse.vix > 25 ? "text-red-400" : marketPulse.vix > 18 ? "text-amber-400" : "text-emerald-400")}>{marketPulse.vix}</span></span>
              <span className="text-border/30">·</span>
              <span className="text-muted-foreground">F&G <span className={cn("tabular-nums", marketPulse.fg >= 55 ? "text-emerald-400" : marketPulse.fg <= 35 ? "text-red-400" : "text-amber-400")}>{marketPulse.fg} {marketPulse.fgLabel}</span></span>
            </div>
          </div>

          {/* Economic Calendar — compact secondary */}
          <div className="rounded bg-muted/20 px-3 py-2">
            <p className="mb-2 text-xs font-normal text-muted-foreground">Economic Calendar</p>
            <div className="space-y-1">
              {ECONOMIC_EVENTS.slice(dayIndex % 4, (dayIndex % 4) + 3).map((ev, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className={cn("shrink-0 text-[10px] font-medium", ev.impact === "HIGH" ? "text-red-400" : "text-amber-400")}>{ev.impact}</span>
                    <span className="truncate text-xs">{ev.name}</span>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{ev.daysFromNow === 1 ? "Tmrw" : `${ev.daysFromNow}d`}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Options Volume — dense */}
          <div className="rounded bg-muted/20 px-4 py-3">
            <p className="mb-2 text-xs font-normal text-muted-foreground">Active Options</p>
            <div className="space-y-0.5">
              {optionsVolume.slice(0, 4).map((item) => (
                <div key={item.ticker} className="flex items-center gap-2 text-xs">
                  <span className="w-10 font-medium">{item.ticker}</span>
                  <div className="flex-1"><div className="h-0.5 overflow-hidden rounded-full bg-muted/30"><div className="h-full rounded-full bg-amber-500/60" style={{ width: `${(item.volume / optionsVolume[0].volume) * 100}%` }} /></div></div>
                  <span className="w-10 text-right font-mono text-[11px] text-muted-foreground tabular-nums">{(item.volume / 1000).toFixed(0)}K</span>
                  <span className={cn("w-8 text-right text-[11px] tabular-nums", item.callPutRatio > 1 ? "text-emerald-400" : "text-red-400")}>{item.callPutRatio}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* QUIET ZONE — rest between market intelligence and personal data */}
        <div className="my-10" />

        {/* Personal data — nearly invisible reference, asymmetric */}
        <div className="grid grid-cols-1 gap-1.5 lg:grid-cols-3 opacity-50">
          <div className="rounded bg-muted/20 px-5 py-4 lg:col-span-2">
            <div className="flex items-center justify-between mb-1.5"><p className="text-xs text-muted-foreground">Recent Trades</p>{tradeHistory.length > 0 && <Link href="/portfolio" className="text-[11px] text-primary hover:underline">All</Link>}</div>
            {recentTrades.length === 0 ? (
              <p className="text-xs text-muted-foreground/60">No trades yet. <Link href="/trade" className="text-primary hover:underline">Start</Link></p>
            ) : (
              <div className="space-y-0.5">
                {recentTrades.slice(0, 4).map((trade, i) => (
                  <div key={`${trade.timestamp}-${i}`} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <div className={cn("h-1 w-1 rounded-full", trade.side === "buy" ? "bg-emerald-400" : "bg-red-400")} />
                      <span className="font-medium">{trade.ticker}</span>
                      <span className="text-[11px] text-muted-foreground">{trade.side} x{trade.quantity}</span>
                    </div>
                    <span className={cn("text-[11px] tabular-nums", trade.realizedPnL >= 0 ? "text-emerald-400" : "text-red-400")}>{trade.realizedPnL >= 0 ? "+" : ""}{formatCurrency(trade.realizedPnL)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Learning + Activity stacked in single column */}
          <div className="flex flex-col gap-1.5">
            <div className="rounded bg-muted/20 px-3 py-2">
              <div className="flex items-center justify-between mb-1"><p className="text-xs text-muted-foreground">Learning</p><Link href="/learn" className="text-[11px] text-primary hover:underline">Continue</Link></div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                <span className="tabular-nums">{learnProgress.completed}/{learnProgress.total} lessons</span>
                <span className="text-border/30">·</span>
                <span>{learnProgress.sRankCount} A/S</span>
                <span className="text-border/30">·</span>
                <span>{learningStreak > 0 ? `${learningStreak}d streak` : "--"}</span>
              </div>
              {nextLesson && <p className="mt-1 text-[11px] text-muted-foreground truncate">Next: <span className="text-foreground">{nextLesson.lesson.title}</span></p>}
            </div>

            <div className="rounded bg-muted/20 px-3 py-2">
              <p className="text-xs text-muted-foreground mb-1">Activity</p>
            {activityFeed.length === 0 ? (
              <p className="text-[11px] text-muted-foreground/60">No recent activity</p>
            ) : (
              <div className="space-y-0.5">
                {activityFeed.slice(0, 5).map((item) => {
                  const iconEl = item.type === "trade" ? <BarChart3 className="h-2 w-2" /> : item.type === "achievement" ? <Award className="h-2 w-2" /> : item.type === "quest" ? <CircleDot className="h-2 w-2" /> : item.type === "levelup" ? <Star className="h-2 w-2" /> : <BookOpen className="h-2 w-2" />;
                  return (
                    <div key={item.id} className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-muted-foreground shrink-0">{iconEl}</span>
                      <span className="truncate">{item.label}</span>
                      <span className="shrink-0 text-muted-foreground ml-auto">{relativeTime(item.ts)}</span>
                    </div>
                  );
                })}
              </div>
            )}
            </div>
          </div>{/* end stacked column */}
        </div>

        {/* Quick nav — smallest possible */}
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 px-1">
          {NAV_SHORTCUTS.map(({ label, href }) => (
            <Link key={href} href={href} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
          ))}
        </div>

        <div className="mt-4 text-center">
          <p className="text-[11px] text-muted-foreground/40">All market data is simulated for educational purposes. Not financial advice.</p>
        </div>
      </div>
    </div>
  );
}
