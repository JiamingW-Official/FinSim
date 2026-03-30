"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Flame,
  Target,
  BarChart3,
  BookOpen,
  ChevronRight,
  Award,
  Zap,
  ArrowRight,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useAnalyticsStore } from "@/stores/analytics-store";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useTradingStore } from "@/stores/trading-store";
import { useGameStore } from "@/stores/game-store";
import { useLearnStore } from "@/stores/learn-store";
import { INITIAL_CAPITAL } from "@/types/trading";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
}

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon: React.ReactNode;
  badge?: { label: string; color: "green" | "amber" | "muted" };
}

interface MilestoneItem {
  id: string;
  label: string;
  current: number;
  target: number;
  unit: string;
}

/* ------------------------------------------------------------------ */
/*  Sparkline SVG                                                      */
/* ------------------------------------------------------------------ */

function Sparkline({ values, width = 72, height = 24, color = "#2d9cdb" }: SparklineProps) {
  if (values.length < 2) {
    return (
      <svg width={width} height={height}>
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={color}
          strokeWidth={1.5}
          strokeOpacity={0.3}
        />
      </svg>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const polyline = points.join(" ");

  // Build fill path: close under the line
  const firstX = 0;
  const lastX = width;
  const fillPath = `M ${firstX} ${height} L ${polyline.split(" ").join(" L ")} L ${lastX} ${height} Z`;

  return (
    <svg width={width} height={height} aria-hidden="true">
      <defs>
        <linearGradient id={`spark-fill-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d={fillPath}
        fill={`url(#spark-fill-${color.replace("#", "")})`}
      />
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Metric Card                                                        */
/* ------------------------------------------------------------------ */

function MetricCard({ label, value, sub, trend, trendValue, icon, badge }: MetricCardProps) {
  return (
    <div className="surface-card p-3 flex flex-col gap-1.5 hover:border-border/60 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          {icon}
          <span>{label}</span>
        </div>
        {badge && (
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
              badge.color === "green" && "bg-green-500/15 text-green-400",
              badge.color === "amber" && "bg-amber-500/15 text-amber-400",
              badge.color === "muted" && "bg-muted/30 text-muted-foreground",
            )}
          >
            {badge.label}
          </span>
        )}
      </div>
      <p className="text-sm font-semibold tabular-nums tracking-tight">{value}</p>
      <div className="flex items-center gap-1.5">
        {sub && (
          <span className="text-[10px] text-muted-foreground tabular-nums">{sub}</span>
        )}
        {trend && trendValue && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-[10px] font-medium tabular-nums",
              trend === "up" && "text-green-400",
              trend === "down" && "text-red-400",
              trend === "neutral" && "text-muted-foreground",
            )}
          >
            {trend === "up" && <TrendingUp className="h-2.5 w-2.5" />}
            {trend === "down" && <TrendingDown className="h-2.5 w-2.5" />}
            {trendValue}
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function KPIDashboard() {
  const { getPersonalizedSuggestion } = useAnalytics();

  // Analytics store
  const sessionCount = useAnalyticsStore((s) => s.sessionCount);
  const avgSessionDuration = useAnalyticsStore((s) => s.avgSessionDuration);
  const weeklyActiveStreak = useAnalyticsStore((s) => s.weeklyActiveStreak);
  const tradesPerSession = useAnalyticsStore((s) => s.tradesPerSession);

  // Trading store
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);
  const equityHistory = useTradingStore((s) => s.equityHistory);

  // Game store
  const stats = useGameStore((s) => s.stats);
  const achievements = useGameStore((s) => s.achievements);
  const level = useGameStore((s) => s.level);

  // Learn store
  const completedLessons = useLearnStore((s) => s.completedLessons);
  const learningStreak = useLearnStore((s) => s.learningStreak);

  /* ---- Derived metrics ---- */
  const totalPnL = portfolioValue - INITIAL_CAPITAL;

  // Trades this week
  const now = Date.now();
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  const tradesThisWeek = tradeHistory.filter(
    (t) => t.timestamp > now - oneWeekMs,
  ).length;
  const isActiveTrader = tradesThisWeek >= 1;

  // Win rate this month
  const oneMonthMs = 30 * 24 * 60 * 60 * 1000;
  const monthTrades = tradeHistory.filter(
    (t) => t.timestamp > now - oneMonthMs && t.realizedPnL !== 0,
  );
  const monthWins = monthTrades.filter((t) => t.realizedPnL > 0).length;
  const monthWinRate =
    monthTrades.length > 0
      ? ((monthWins / monthTrades.length) * 100).toFixed(1)
      : null;

  // Best strategy type — determined by ticker frequency of profitable trades
  const profitByTicker = useMemo(() => {
    const map: Record<string, number> = {};
    tradeHistory.forEach((t) => {
      if (t.realizedPnL > 0) {
        map[t.ticker] = (map[t.ticker] ?? 0) + t.realizedPnL;
      }
    });
    return map;
  }, [tradeHistory]);

  const bestTicker = useMemo(() => {
    const entries = Object.entries(profitByTicker);
    if (entries.length === 0) return null;
    return entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
  }, [profitByTicker]);

  // Last 7 days daily trade counts for sparkline
  const dailyTradeCounts = useMemo(() => {
    const counts: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = now - i * 86400000;
      const dayEnd = dayStart + 86400000;
      counts.push(tradeHistory.filter((t) => t.timestamp >= dayStart && t.timestamp < dayEnd).length);
    }
    return counts;
  }, [tradeHistory, now]);

  // Last 7 days daily P&L for sparkline
  const dailyPnL = useMemo(() => {
    const pnls: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = now - i * 86400000;
      const dayEnd = dayStart + 86400000;
      const dayPnL = tradeHistory
        .filter((t) => t.timestamp >= dayStart && t.timestamp < dayEnd && t.realizedPnL !== 0)
        .reduce((sum, t) => sum + t.realizedPnL, 0);
      pnls.push(dayPnL);
    }
    return pnls;
  }, [tradeHistory, now]);

  // Milestones
  const milestones: MilestoneItem[] = useMemo(
    () => [
      {
        id: "trades",
        label: "Total Trades",
        current: stats.totalTrades,
        target: 100,
        unit: "trades",
      },
      {
        id: "lessons",
        label: "Lessons Completed",
        current: completedLessons.length,
        target: 30,
        unit: "lessons",
      },
      {
        id: "sessions",
        label: "Sessions",
        current: sessionCount,
        target: 50,
        unit: "sessions",
      },
      {
        id: "achievements",
        label: "Achievements",
        current: achievements.length,
        target: 20,
        unit: "unlocked",
      },
      {
        id: "level",
        label: "Trader Level",
        current: level,
        target: 10,
        unit: "/ 10",
      },
    ],
    [stats.totalTrades, completedLessons.length, sessionCount, achievements.length, level],
  );

  const suggestion = getPersonalizedSuggestion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="space-y-4"
    >
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Your Trading Stats
        </h2>
        <Link
          href="/portfolio"
          className="flex items-center gap-0.5 text-[10px] font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Full Portfolio
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* 6 Metric Cards */}
      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          label="Weekly Activity"
          value={isActiveTrader ? "Active" : "Inactive"}
          sub={`${tradesThisWeek} trade${tradesThisWeek !== 1 ? "s" : ""} this week`}
          icon={<Zap className="h-3.5 w-3.5" />}
          badge={
            isActiveTrader
              ? { label: "Active", color: "green" }
              : { label: "No trades", color: "muted" }
          }
        />

        <MetricCard
          label="Avg Session"
          value={avgSessionDuration > 0 ? `${avgSessionDuration}m` : "--"}
          sub={`${sessionCount} session${sessionCount !== 1 ? "s" : ""} total`}
          icon={<Clock className="h-3.5 w-3.5" />}
          trend={avgSessionDuration >= 10 ? "up" : "neutral"}
          trendValue={avgSessionDuration >= 10 ? "engaged" : undefined}
        />

        <MetricCard
          label="Learn Streak"
          value={learningStreak > 0 ? `${learningStreak}d` : "0d"}
          sub={weeklyActiveStreak > 0 ? `${weeklyActiveStreak}wk active` : "Start a streak"}
          icon={<Flame className="h-3.5 w-3.5" />}
          trend={learningStreak >= 3 ? "up" : "neutral"}
          trendValue={learningStreak >= 3 ? `${learningStreak} days` : undefined}
          badge={
            learningStreak >= 7
              ? { label: "Hot", color: "amber" }
              : undefined
          }
        />

        <MetricCard
          label="Win Rate (30d)"
          value={monthWinRate !== null ? `${monthWinRate}%` : "--"}
          sub={monthTrades.length > 0 ? `${monthWins}/${monthTrades.length} trades` : "No closed trades"}
          icon={<Target className="h-3.5 w-3.5" />}
          trend={
            monthWinRate !== null
              ? parseFloat(monthWinRate) >= 50
                ? "up"
                : "down"
              : "neutral"
          }
          trendValue={
            monthWinRate !== null
              ? parseFloat(monthWinRate) >= 50
                ? "Profitable"
                : "Below 50%"
              : undefined
          }
        />

        <MetricCard
          label="Best Ticker"
          value={bestTicker ?? "--"}
          sub={
            bestTicker
              ? `${formatCurrency(profitByTicker[bestTicker] ?? 0)} P&L`
              : "No winning trades yet"
          }
          icon={<BarChart3 className="h-3.5 w-3.5" />}
          trend={bestTicker ? "up" : "neutral"}
          trendValue={bestTicker ? "Top performer" : undefined}
        />

        <MetricCard
          label="Total P&L"
          value={`${totalPnL >= 0 ? "+" : ""}${formatCurrency(totalPnL)}`}
          sub={`${((totalPnL / INITIAL_CAPITAL) * 100).toFixed(1)}% return`}
          icon={totalPnL >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          trend={totalPnL >= 0 ? "up" : "down"}
          trendValue={totalPnL >= 0 ? "Profit" : "Loss"}
        />
      </div>

      {/* Sparklines row */}
      {tradeHistory.length > 0 && (
        <div className="surface-card p-3">
          <p className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Last 7 Days
          </p>
          <div className="flex items-start gap-6">
            <div>
              <p className="mb-1 text-[9px] text-muted-foreground">Daily Trades</p>
              <Sparkline values={dailyTradeCounts} color="#2d9cdb" />
            </div>
            <div>
              <p className="mb-1 text-[9px] text-muted-foreground">Daily P&L</p>
              <Sparkline
                values={dailyPnL}
                color={
                  dailyPnL[dailyPnL.length - 1] >= 0 ? "#22c55e" : "#ef4444"
                }
              />
            </div>
            <div className="ml-auto grid grid-cols-1 gap-1 text-right">
              <div>
                <p className="text-[9px] text-muted-foreground">Trades/week</p>
                <p className="text-[11px] font-semibold tabular-nums">
                  {dailyTradeCounts.reduce((a, b) => a + b, 0)}
                </p>
              </div>
              <div>
                <p className="text-[9px] text-muted-foreground">7d P&L</p>
                <p
                  className={cn(
                    "text-[11px] font-semibold tabular-nums",
                    dailyPnL.reduce((a, b) => a + b, 0) >= 0 ? "text-green-400" : "text-red-400",
                  )}
                >
                  {dailyPnL.reduce((a, b) => a + b, 0) >= 0 ? "+" : ""}
                  {formatCurrency(dailyPnL.reduce((a, b) => a + b, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Milestones */}
      <div className="surface-card p-3">
        <div className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          <Award className="h-3 w-3" />
          Milestones
        </div>
        <div className="space-y-2">
          {milestones.map((m) => {
            const pct = Math.min(100, Math.round((m.current / m.target) * 100));
            const done = m.current >= m.target;
            return (
              <div key={m.id} className="flex items-center gap-2">
                <span className="w-[100px] truncate text-[10px] text-muted-foreground" title={m.label}>
                  {m.label}
                </span>
                <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted/20">
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      done ? "bg-green-500" : "bg-primary",
                    )}
                    initial={{ width: "0%" }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <span className="w-14 text-right text-[10px] tabular-nums font-medium text-muted-foreground">
                  {m.current}/{m.target}
                  {" "}{m.unit}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggested Next Step */}
      <div className="surface-card p-3">
        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          <BookOpen className="h-3 w-3" />
          Suggested Next Step
        </div>
        <p className="mb-2 text-[11px] leading-relaxed text-foreground/80">{suggestion}</p>
        <Link
          href="/learn"
          className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-3 py-1.5 text-[11px] font-medium text-primary hover:bg-primary/20 transition-colors"
        >
          Get started
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </motion.div>
  );
}
