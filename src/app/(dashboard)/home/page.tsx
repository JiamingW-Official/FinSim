"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useGameStore } from "@/stores/game-store";
import { useTradingStore } from "@/stores/trading-store";
import { useLearnStore } from "@/stores/learn-store";
import { INITIAL_CAPITAL } from "@/types/trading";
import { formatCurrency, cn } from "@/lib/utils";
import { UNITS } from "@/data/lessons";
import { ArrowRight } from "lucide-react";
import { mulberry32, simulateTickerPrice, BASE_PRICES } from "@/services/market-data/simulate-price";

const OVERVIEW_TICKERS = ["SPY", "QQQ", "AAPL", "BTC", "Gold", "VIX"];

/* ── Portfolio sparkline (30 bars) ── */
function PortfolioSparkline({
  equityHistory,
  currentValue,
}: {
  equityHistory: { timestamp: number; portfolioValue: number }[];
  currentValue: number;
}) {
  const W = 200;
  const H = 48;

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
  const toY = (v: number) => H - ((v - min) / range) * (H - 4);

  const linePts = data.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");
  const isUp = data[data.length - 1] >= data[0];
  const lineColor = isUp ? "#10b981" : "#ef4444";

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="overflow-visible">
      <polyline points={linePts} fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* ── Market insight rotation ── */
const MARKET_BRIEFS = [
  "Equity markets opened mixed as investors weigh Fed commentary on rate trajectory. Technology sector leads with moderate gains while energy pulls back on inventory data.",
  "Strong labor market data pushed yields higher, pressuring growth stocks. Defensive sectors outperform as traders seek quality amid macro uncertainty.",
  "Risk-on sentiment dominates mid-week as earnings reports broadly beat estimates. Semiconductors and cloud software driving the tape higher.",
  "Market digesting Thursday's CPI print — core inflation slightly above expectations. Rotation from tech into financials and industrials accelerating.",
  "Pre-market futures point to a quiet Friday session. Options expiration may introduce intraday volatility in heavily-traded names like SPY and QQQ.",
  "Weekend effect visible as volumes thin into Friday close. Traders position cautiously ahead of next week's FOMC minutes release.",
  "Monday gap-up after positive weekend macro headlines. Watch for follow-through or fade as institutional desks come back online.",
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

/* ── Main ── */
export default function HomePage() {
  const level = useGameStore((s) => s.level);
  const stats = useGameStore((s) => s.stats);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const equityHistory = useTradingStore((s) => s.equityHistory);
  const completedLessons = useLearnStore((s) => s.completedLessons);
  const daySeed = Math.floor(Date.now() / 86400000);
  const dayIndex = new Date().getDay();

  const marketPulse = useMemo(() => {
    const rand = mulberry32(daySeed ^ 0xbeefdead);
    const vix = +(rand() * 18 + 12).toFixed(2);
    const vixNorm = Math.max(0, Math.min(1, (vix - 12) / 18));
    const baseFG = Math.round((1 - vixNorm) * 80 + 10);
    const noise = Math.round((rand() - 0.5) * 16);
    const fg = Math.max(0, Math.min(100, baseFG + noise));
    const regime = vix < 16 && fg > 55 ? "Bull" : vix > 25 || fg < 30 ? "Bear" : "Sideways";
    return { vix, fg, regime };
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
  const recentTrades = tradeHistory.slice(-5).reverse();
  const marketBrief = MARKET_BRIEFS[dayIndex % MARKET_BRIEFS.length];

  const learnProgress = useMemo(() => {
    let total = 0;
    let completed = 0;
    for (const unit of UNITS) {
      total += unit.lessons.length;
      completed += unit.lessons.filter((l) => completedLessons.includes(l.id)).length;
    }
    return { total, completed, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [completedLessons]);

  const nextLesson = useMemo(() => {
    for (const unit of UNITS) {
      for (const lesson of unit.lessons) {
        if (!completedLessons.includes(lesson.id)) return { lesson, unit };
      }
    }
    return null;
  }, [completedLessons]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-6 py-6">

        {/* Page label */}
        <p className="text-xs text-muted-foreground mb-6">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
        </p>

        {/* ── Market ticker strip ── */}
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-none mb-4">
          {!mounted ? (
            OVERVIEW_TICKERS.map((t) => (
              <div key={t} className="flex shrink-0 items-center gap-2">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-4 w-14" />
              </div>
            ))
          ) : (
            <>
              <span className={cn(
                "shrink-0 rounded px-2 py-0.5 text-[11px] font-medium",
                marketPulse.regime === "Bull" ? "bg-emerald-500/5 text-emerald-400" :
                marketPulse.regime === "Bear" ? "bg-red-500/5 text-red-400" :
                "bg-amber-500/10 text-amber-400"
              )}>
                {marketPulse.regime}
              </span>
              <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                VIX {marketPulse.vix}
              </span>
              <div className="h-3 w-px bg-border/30 shrink-0" />
              {overviewPrices.map(({ ticker, price, changePct }) => (
                <div key={ticker} className="flex shrink-0 items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground">{ticker}</span>
                  <span className="text-[11px] tabular-nums">
                    {ticker === "BTC" ? `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : ticker === "VIX" ? price.toFixed(2) : `$${price.toFixed(2)}`}
                  </span>
                  <span className={cn("text-[11px] tabular-nums", changePct >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {changePct >= 0 ? "+" : ""}{changePct.toFixed(2)}%
                  </span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* ── Primary: Portfolio + Market Brief (2/3 + 1/3) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

          {/* Portfolio — dominant card */}
          <div className="lg:col-span-2 rounded-lg border border-border/20 bg-card p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[11px] text-muted-foreground mb-1">Portfolio Value</p>
                <p className="text-2xl tabular-nums tracking-tight">{formatCurrency(portfolioValue)}</p>
                <p className={cn("text-sm tabular-nums mt-0.5", totalPnLPct >= 0 ? "text-emerald-400" : "text-red-400")}>
                  {totalPnLPct >= 0 ? "+" : ""}{totalPnLPct.toFixed(2)}% ({totalPnL >= 0 ? "+" : ""}{formatCurrency(totalPnL)})
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-muted-foreground mb-1">Stats</p>
                <p className="text-xs tabular-nums">{stats.totalTrades} trades</p>
                <p className="text-xs tabular-nums text-muted-foreground">{winRate.toFixed(1)}% win rate</p>
              </div>
            </div>
            <PortfolioSparkline equityHistory={equityHistory} currentValue={portfolioValue} />
          </div>

          {/* Market brief — secondary */}
          <div className="rounded-lg border border-border/20 bg-card p-4 flex flex-col justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground mb-3">Market Brief</p>
              <p className="text-xs leading-relaxed text-foreground/80">{marketBrief}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/20">
              <p className="text-[11px] text-muted-foreground mb-2">Upcoming</p>
              <div className="space-y-1">
                {ECONOMIC_EVENTS.slice(dayIndex % 4, (dayIndex % 4) + 3).map((ev, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={cn("shrink-0 h-1 w-1 rounded-full", ev.impact === "HIGH" ? "bg-red-400" : "bg-amber-400")} />
                      <span className="truncate text-[11px]">{ev.name}</span>
                    </div>
                    <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">{ev.daysFromNow === 1 ? "Tmrw" : `${ev.daysFromNow}d`}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Secondary row: Recent Trades + Learning (2/3 + 1/3) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

          {/* Recent trades */}
          <div className="lg:col-span-2 rounded-lg border border-border/20 bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] text-muted-foreground">Recent Trades</p>
              {tradeHistory.length > 0 && <Link href="/portfolio" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">View all</Link>}
            </div>
            {recentTrades.length === 0 ? (
              <p className="text-xs text-muted-foreground/60">
                No trades yet.{" "}
                <Link href="/trade" className="text-foreground hover:underline">Start trading</Link>
              </p>
            ) : (
              <div className="space-y-1">
                {recentTrades.slice(0, 5).map((trade, i) => (
                  <div key={`${trade.timestamp}-${i}`} className="flex items-center justify-between text-xs py-0.5">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", trade.side === "buy" ? "bg-emerald-400" : "bg-red-400")} />
                      <span className="tabular-nums">{trade.ticker}</span>
                      <span className="text-muted-foreground">{trade.side} x{trade.quantity}</span>
                    </div>
                    <span className={cn("tabular-nums", trade.realizedPnL >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {trade.realizedPnL >= 0 ? "+" : ""}{formatCurrency(trade.realizedPnL)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Learning progress */}
          <div className="rounded-lg border border-border/20 bg-card p-4 flex flex-col justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground mb-3">Learning</p>
              <p className="text-lg tabular-nums">{learnProgress.completed}<span className="text-muted-foreground text-sm">/{learnProgress.total}</span></p>
              <p className="text-[11px] text-muted-foreground mt-0.5">lessons completed</p>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted/30">
                <div className="h-full rounded-full bg-foreground/20 transition-colors duration-300" style={{ width: `${learnProgress.pct}%` }} />
              </div>
            </div>
            {nextLesson && (
              <div className="mt-4 pt-3 border-t border-border/20">
                <p className="text-[11px] text-muted-foreground mb-1">Next</p>
                <Link href={`/learn/${nextLesson.lesson.id}`} className="group flex items-center justify-between">
                  <span className="text-xs truncate">{nextLesson.lesson.title}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Quick navigation ── */}
        <div className="flex items-center gap-4">
          {[
            { label: "Trade", href: "/trade" },
            { label: "Learn", href: "/learn" },
            { label: "Options", href: "/options" },
            { label: "Portfolio", href: "/portfolio" },
            { label: "Predictions", href: "/predictions" },
            { label: "Backtest", href: "/backtest" },
          ].map(({ label, href }) => (
            <Link key={href} href={href} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
              {label}
            </Link>
          ))}
        </div>

        <p className="mt-4 text-[11px] text-muted-foreground/30">All market data is simulated for educational purposes.</p>

      </div>
    </div>
  );
}
