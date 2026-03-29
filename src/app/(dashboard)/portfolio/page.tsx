"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { PerformanceMetrics } from "@/components/portfolio/PerformanceMetrics";
import { TradeJournal } from "@/components/portfolio/TradeJournal";
import { QuantDashboard } from "@/components/portfolio/QuantDashboard";
import { useGameStore } from "@/stores/game-store";
import { useLearnStore } from "@/stores/learn-store";
import { useTradingStore } from "@/stores/trading-store";
import { INITIAL_CAPITAL } from "@/types/trading";
import { UNITS } from "@/data/lessons";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Shield,
  BarChart3,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Trophy,
  Briefcase,
  Award,
  Target,
  Calendar,
  Activity,
  FlaskConical,
  Flame,
  ChevronDown,
  MessageSquare,
  RefreshCw,
  Scissors,
  LineChart,
  DollarSign,
  PieChart,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { AchievementGallery } from "@/components/game/AchievementGallery";
import { ExportMenu } from "@/components/portfolio/ExportMenu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WinLossDistribution } from "@/components/analytics/WinLossDistribution";
import { HoldingPeriodAnalysis } from "@/components/analytics/HoldingPeriodAnalysis";
import { TradeHeatmap } from "@/components/analytics/TradeHeatmap";
import { MAEMFEScatter } from "@/components/analytics/MAEMFEScatter";
import { StreakAnalysis } from "@/components/analytics/StreakAnalysis";
import {
  RollingSharpeChart,
  RollingWinRateChart,
} from "@/components/analytics/RollingMetricsChart";
import { RebalancingPanel } from "@/components/quant/RebalancingPanel";
import { TaxHarvestingPanel } from "@/components/quant/TaxHarvestingPanel";
import { PortfolioOptimizer } from "@/components/portfolio/PortfolioOptimizer";
import { EfficientFrontier } from "@/components/portfolio/EfficientFrontier";
import { DividendTracker } from "@/components/portfolio/DividendTracker";
import { PortfolioAttribution } from "@/components/portfolio/PortfolioAttribution";
import { LivePnLDashboard } from "@/components/portfolio/LivePnLDashboard";
import { WeeklyReview } from "@/components/analytics/WeeklyReview";
import { AdvancedAnalytics } from "@/components/portfolio/AdvancedAnalytics";
import { StressTester } from "@/components/portfolio/StressTester";
import { BlackLitterman } from "@/components/portfolio/BlackLitterman";
import { RebalancingTool } from "@/components/portfolio/RebalancingTool";
import { AttributionAnalysis } from "@/components/portfolio/AttributionAnalysis";

function ChartSkeleton({ height = "h-[340px]" }: { height?: string }) {
  return (
    <div className={`${height} flex flex-col gap-2 p-2`}>
      <div className="flex justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
      <div className="flex flex-1 items-end gap-[3px]">
        {Array.from({ length: 24 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-sm"
            style={{ height: `${30 + Math.sin(i * 0.5) * 25 + 20}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-2.5 w-10" />
        ))}
      </div>
    </div>
  );
}

const EquityCurve = dynamic(
  () =>
    import("@/components/portfolio/EquityCurve").then(
      (mod) => mod.EquityCurve,
    ),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

const WinRateChart = dynamic(
  () =>
    import("@/components/portfolio/WinRateChart").then(
      (mod) => mod.WinRateChart,
    ),
  { ssr: false, loading: () => <ChartSkeleton height="h-[160px]" /> },
);

const TradeCalendar = dynamic(
  () =>
    import("@/components/portfolio/TradeCalendar").then(
      (mod) => mod.TradeCalendar,
    ),
  { ssr: false, loading: () => <ChartSkeleton height="h-[160px]" /> },
);

export default function PortfolioPage() {
  const level = useGameStore((s) => s.level);
  const title = useGameStore((s) => s.title);
  const achievements = useGameStore((s) => s.achievements);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);
  const cash = useTradingStore((s) => s.cash);
  const positions = useTradingStore((s) => s.positions);
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const equityHistory = useTradingStore((s) => s.equityHistory);
  const completedLessons = useLearnStore((s) => s.completedLessons);
  const totalPnL = portfolioValue - INITIAL_CAPITAL;
  const totalPnLPct = (totalPnL / INITIAL_CAPITAL) * 100;

  const hasTrades = tradeHistory.length > 0;

  // Compute inline stats
  const inlineStats = useMemo(() => {
    const sellTrades = tradeHistory.filter((t) => t.side === "sell");
    const winningTrades = sellTrades.filter((t) => t.realizedPnL > 0);
    const winRate =
      sellTrades.length > 0
        ? (winningTrades.length / sellTrades.length) * 100
        : 0;

    // Max drawdown
    let maxDrawdown = 0;
    let peak = INITIAL_CAPITAL;
    for (const snap of equityHistory) {
      if (snap.portfolioValue > peak) peak = snap.portfolioValue;
      const dd = ((peak - snap.portfolioValue) / peak) * 100;
      if (dd > maxDrawdown) maxDrawdown = dd;
    }

    // Sharpe (annualized from daily returns approximation)
    const returns: number[] = [];
    for (let i = 1; i < equityHistory.length; i++) {
      const prev = equityHistory[i - 1].portfolioValue;
      if (prev > 0) {
        returns.push(
          (equityHistory[i].portfolioValue - prev) / prev,
        );
      }
    }
    let sharpe = 0;
    if (returns.length > 1) {
      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance =
        returns.reduce((a, r) => a + (r - mean) ** 2, 0) /
        (returns.length - 1);
      const std = Math.sqrt(variance);
      sharpe = std > 0 ? (mean / std) * Math.sqrt(252) : 0;
    }

    return {
      winRate,
      sharpe,
      maxDrawdown,
      totalTrades: sellTrades.length,
    };
  }, [tradeHistory, equityHistory]);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="p-4 pb-0">
        {/* Header — compact */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold">Portfolio</h1>
            <div className="flex items-center gap-1.5 rounded-md bg-primary/8 px-2 py-0.5">
              <Shield className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium text-primary">
                Lv.{level} {title}
              </span>
            </div>
            {achievements.length > 0 && (
              <div className="flex items-center gap-1 rounded-md bg-muted/50 px-2 py-0.5">
                <Trophy className="h-3 w-3 text-amber-400" />
                <span className="text-xs font-medium text-amber-400">
                  {achievements.length}
                </span>
              </div>
            )}
          </div>
          <ExportMenu />
        </div>

        {/* ── HERO: Equity Curve ── */}
        {hasTrades ? (
          <div className="border-l-4 border-primary rounded-lg bg-card p-6 mb-3">
            {/* Value + P&L headline */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-bold tabular-nums">
                {formatCurrency(portfolioValue)}
              </span>
              <span
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  totalPnL >= 0 ? "text-emerald-400" : "text-red-400",
                )}
              >
                {totalPnL >= 0 ? "+" : ""}
                {formatCurrency(totalPnL)}
              </span>
              <span
                className={cn(
                  "text-xs font-medium tabular-nums",
                  totalPnLPct >= 0 ? "text-emerald-400/70" : "text-red-400/70",
                )}
              >
                ({totalPnLPct >= 0 ? "+" : ""}
                {totalPnLPct.toFixed(2)}%)
              </span>
              <span className="rounded bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground ml-1">
                Simulated
              </span>
            </div>
            {/* Chart — dominant */}
            <div className="min-h-[340px]">
              <EquityCurve />
            </div>
          </div>
        ) : (
          /* ── EMPTY STATE: dominant fill ── */
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/30 py-20 px-6 text-center mb-3">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted/40">
              <BarChart3 className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <p className="text-lg font-semibold text-foreground mb-2">
              Your portfolio story starts here
            </p>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Place your first simulated trade and watch your equity curve grow.
              Every win and loss will be tracked here.
            </p>
            <Link
              href="/trade"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Start Trading
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* ── INLINE STATS LINE ── */}
        {hasTrades && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground tabular-nums mb-8 px-1 flex-wrap">
            <span>
              Win Rate:{" "}
              <span className="font-medium text-foreground">
                {inlineStats.winRate.toFixed(0)}%
              </span>
            </span>
            <span className="text-border">·</span>
            <span>
              Sharpe:{" "}
              <span className="font-medium text-foreground">
                {inlineStats.sharpe.toFixed(2)}
              </span>
            </span>
            <span className="text-border">·</span>
            <span>
              Max DD:{" "}
              <span className="font-medium text-foreground">
                -{inlineStats.maxDrawdown.toFixed(1)}%
              </span>
            </span>
            <span className="text-border">·</span>
            <span>
              <span className="font-medium text-foreground">
                {inlineStats.totalTrades}
              </span>{" "}
              Trades
            </span>
            <span className="text-border">·</span>
            <span>
              Cash:{" "}
              <span className="font-medium text-foreground">
                {formatCurrency(cash)}
              </span>
            </span>
            <span className="text-border">·</span>
            <span>
              <span className="font-medium text-foreground">
                {positions.length}
              </span>{" "}
              Open
            </span>
          </div>
        )}
      </div>

      {/* Buffer between equity curve hero and tabs */}
      <div className="mb-8 border-t border-border/10" />

      {/* ── TABS: compact, subdued ── */}
      <div className="px-4 pb-4">
        <Tabs defaultValue="overview">
          <div className="mb-3 overflow-x-auto">
            <TabsList className="flex h-7 min-w-max w-full gap-0.5 rounded-md bg-muted/30 p-0.5">
              <TabsTrigger
                value="overview"
                className="flex-1 rounded text-[11px] h-6 whitespace-nowrap"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex-1 rounded text-[11px] h-6 whitespace-nowrap"
              >
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="rebalance"
                className="flex-1 rounded text-[11px] h-6 whitespace-nowrap"
              >
                Rebalance
              </TabsTrigger>
              <TabsTrigger
                value="optimize"
                className="flex-1 rounded text-[11px] h-6 whitespace-nowrap"
              >
                Optimizer
              </TabsTrigger>
              <TabsTrigger
                value="frontier"
                className="flex-1 rounded text-[11px] h-6 whitespace-nowrap"
              >
                Frontier
              </TabsTrigger>
              <TabsTrigger
                value="income"
                className="flex-1 rounded text-[11px] h-6 whitespace-nowrap"
              >
                Income
              </TabsTrigger>
              <TabsTrigger
                value="journal"
                className="flex-1 rounded text-[11px] h-6 whitespace-nowrap"
              >
                Journal
              </TabsTrigger>
              <TabsTrigger
                value="achievements"
                className="flex-1 rounded text-[11px] h-6 whitespace-nowrap"
              >
                Awards
              </TabsTrigger>
              <TabsTrigger
                value="deep"
                className="flex-1 rounded text-[11px] h-6 whitespace-nowrap"
              >
                Deep
              </TabsTrigger>
              <TabsTrigger
                value="attribution"
                className="flex-1 rounded text-[11px] h-6 whitespace-nowrap"
              >
                Attribution
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                className="flex-1 rounded text-[11px] h-6 whitespace-nowrap"
              >
                Analytics+
              </TabsTrigger>
              <TabsTrigger
                value="stress"
                className="flex-1 rounded text-[11px] h-6 whitespace-nowrap"
              >
                Stress Test
              </TabsTrigger>
              <TabsTrigger
                value="bl-optimizer"
                className="flex-1 rounded text-[11px] h-6 whitespace-nowrap"
              >
                BL Optimizer
              </TabsTrigger>
              <TabsTrigger
                value="rebalance-tool"
                className="flex-1 rounded text-[11px] h-6 whitespace-nowrap"
              >
                Rebalance+
              </TabsTrigger>
              <TabsTrigger
                value="attribution-plus"
                className="flex-1 rounded text-[11px] h-6 whitespace-nowrap"
              >
                Attribution+
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── Overview tab ── */}
          <TabsContent value="overview" className="space-y-3">
            <LivePnLDashboard />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/30 p-3">
                <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                  <Target className="h-3 w-3" />
                  Win Rate (Rolling 10)
                </div>
                <WinRateChart />
              </div>
              <div className="rounded-lg bg-muted/30 p-3">
                <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Trade Calendar
                </div>
                <TradeCalendar />
              </div>
            </div>

            <div className="rounded-lg bg-muted/30 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <PieChart className="h-3 w-3" />
                Portfolio Attribution
              </div>
              <PortfolioAttribution />
            </div>

            <div className="rounded-lg bg-muted/30 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                Performance Metrics
              </div>
              <PerformanceMetrics />
            </div>

            <WeeklyReview />
          </TabsContent>

          {/* ── Analytics tab ── */}
          <TabsContent value="analytics" className="space-y-3">
            <div className="rounded-lg bg-muted/30 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Activity className="h-3 w-3" />
                Quantitative Analytics
              </div>
              <QuantDashboard />
            </div>

            <div className="rounded-lg bg-muted/30 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                Rolling Sharpe Ratio (30-trade window)
              </div>
              <RollingSharpeChart />
            </div>

            <div className="rounded-lg bg-muted/30 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Target className="h-3 w-3" />
                Rolling Win Rate (20-trade window)
              </div>
              <RollingWinRateChart />
            </div>
          </TabsContent>

          {/* ── Rebalance tab ── */}
          <TabsContent value="rebalance" className="space-y-3">
            <div className="rounded-lg bg-muted/30 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <RefreshCw className="h-3 w-3" />
                Portfolio Rebalancing
              </div>
              <RebalancingPanel />
            </div>

            <div className="rounded-lg bg-muted/30 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Scissors className="h-3 w-3" />
                Tax Loss Harvesting
              </div>
              <TaxHarvestingPanel />
            </div>
          </TabsContent>

          {/* ── Optimize tab ── */}
          <TabsContent value="optimize" className="space-y-3">
            <div className="rounded-lg bg-muted/30 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <LineChart className="h-3 w-3" />
                Efficient Frontier &amp; MPT Optimizer
              </div>
              <PortfolioOptimizer />
            </div>
          </TabsContent>

          {/* ── Frontier tab ── */}
          <TabsContent value="frontier" className="space-y-3">
            <div className="rounded-lg bg-muted/30 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <LineChart className="h-3 w-3" />
                Efficient Frontier &amp; Portfolio Optimizer
              </div>
              <EfficientFrontier />
            </div>
          </TabsContent>

          {/* ── Income tab ── */}
          <TabsContent value="income" className="space-y-3">
            <div className="rounded-lg bg-muted/30 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                Dividend Income Tracker
              </div>
              <DividendTracker />
            </div>
          </TabsContent>

          {/* ── Journal tab ── */}
          <TabsContent value="journal" className="space-y-3">
            <RecentTradesPreview />

            <div className="rounded-lg bg-muted/30 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <BookOpen className="h-3 w-3" />
                Trade Journal
              </div>
              <TradeJournal />
              <div className="mt-2 border-t border-border/40 pt-2">
                <a
                  href="/journal"
                  className="flex items-center gap-1.5 text-[11px] font-medium text-primary hover:underline"
                >
                  View Full Journal
                  <span className="text-muted-foreground">&rarr;</span>
                </a>
              </div>
            </div>
          </TabsContent>

          {/* ── Achievements tab ── */}
          <TabsContent value="achievements">
            <div className="rounded-lg bg-muted/30 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Award className="h-3 w-3" />
                Achievements
              </div>
              <AchievementGallery />
            </div>
          </TabsContent>

          {/* ── Attribution tab ── */}
          <TabsContent value="attribution" className="space-y-3">
            <PortfolioAttribution />
          </TabsContent>

          {/* ── Analytics+ tab ── */}
          <TabsContent value="advanced" className="space-y-3">
            <AdvancedAnalytics />
          </TabsContent>

          {/* ── Stress Test tab ── */}
          <TabsContent value="stress" className="space-y-3">
            <div className="rounded-lg bg-muted/30 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Flame className="h-3 w-3" />
                Portfolio Stress Testing &amp; Scenario Analysis
              </div>
              <StressTester />
            </div>
          </TabsContent>

          {/* ── BL Optimizer tab ── */}
          <TabsContent value="bl-optimizer" className="space-y-3">
            <div className="rounded-lg bg-muted/30 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Target className="h-3 w-3" />
                Black-Litterman Portfolio Optimizer
              </div>
              <BlackLitterman />
            </div>
          </TabsContent>

          {/* ── Rebalance+ tab ── */}
          <TabsContent value="rebalance-tool" className="space-y-3">
            <div className="rounded-lg bg-muted/30 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <RefreshCw className="h-3 w-3" />
                Comprehensive Rebalancing Tool
              </div>
              <RebalancingTool />
            </div>
          </TabsContent>

          {/* ── Attribution+ tab ── */}
          <TabsContent value="attribution-plus" className="space-y-3">
            <AttributionAnalysis />
          </TabsContent>

          {/* ── Deep Analytics tab ── */}
          <TabsContent value="deep" className="space-y-3">
            <div className="rounded-lg bg-muted/30 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <BarChart3 className="h-3 w-3" />
                Trade Distribution
              </div>
              <WinLossDistribution />
            </div>

            <div className="rounded-lg bg-muted/30 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Holding Period Analysis
              </div>
              <HoldingPeriodAnalysis />
            </div>

            <div className="rounded-lg bg-muted/30 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Activity className="h-3 w-3" />
                Day-of-Week Heatmap
              </div>
              <TradeHeatmap />
            </div>

            <div className="rounded-lg bg-muted/30 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <FlaskConical className="h-3 w-3" />
                MAE/MFE Scatter &mdash; Trade Efficiency
              </div>
              <MAEMFEScatter />
            </div>

            <div className="rounded-lg bg-muted/30 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                Streak Analysis
              </div>
              <StreakAnalysis />
            </div>
          </TabsContent>
        </Tabs>

        {/* Learning Progress — below tabs */}
        <div className="mt-4">
          <LearningProgress completedLessons={completedLessons} />
        </div>
      </div>
    </div>
  );
}

// ── LearningProgress ──────────────────────────────────────────────────────────

function LearningProgress({
  completedLessons,
}: {
  completedLessons: string[];
}) {
  const progress = useMemo(() => {
    const totalLessons = UNITS.reduce(
      (sum, u) => sum + u.lessons.length,
      0,
    );
    const completedCount = completedLessons.length;

    const completedUnits = UNITS.filter((unit) =>
      unit.lessons.every((l) => completedLessons.includes(l.id)),
    );

    const inProgressUnits = UNITS.filter((unit) => {
      const done = unit.lessons.filter((l) =>
        completedLessons.includes(l.id),
      ).length;
      return done > 0 && done < unit.lessons.length;
    });

    return { totalLessons, completedCount, completedUnits, inProgressUnits };
  }, [completedLessons]);

  if (progress.completedCount === 0) return null;

  const pct = Math.round(
    (progress.completedCount / progress.totalLessons) * 100,
  );

  return (
    <div className="rounded-lg bg-muted/30 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <GraduationCap className="h-3.5 w-3.5" />
          Learning Progress
        </div>
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {progress.completedCount}/{progress.totalLessons} lessons
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-2.5 h-1.5 rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Completed units */}
      {progress.completedUnits.length > 0 && (
        <div className="mb-1.5">
          <p className="text-[11px] font-medium text-muted-foreground mb-1">
            Completed units
          </p>
          <div className="flex flex-wrap gap-1">
            {progress.completedUnits.slice(0, 6).map((unit) => (
              <span
                key={unit.id}
                className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400"
              >
                {unit.title}
              </span>
            ))}
            {progress.completedUnits.length > 6 && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                +{progress.completedUnits.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* In-progress units */}
      {progress.inProgressUnits.length > 0 && (
        <div>
          <p className="text-[11px] font-medium text-muted-foreground mb-1">
            In progress
          </p>
          <div className="flex flex-wrap gap-1">
            {progress.inProgressUnits.slice(0, 4).map((unit) => {
              const done = unit.lessons.filter((l) =>
                completedLessons.includes(l.id),
              ).length;
              return (
                <span
                  key={unit.id}
                  className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                >
                  {unit.title} ({done}/{unit.lessons.length})
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Link to learn */}
      <div className="mt-2 border-t border-border/40 pt-2">
        <Link
          href="/learn"
          className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
        >
          Continue learning
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

// ── RecentTradesPreview ──────────────────────────────────────────────────────

function RecentTradesPreview() {
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const closedTrades = tradeHistory
    .filter((t) => t.realizedPnL !== 0)
    .slice(0, 5);

  if (closedTrades.length === 0) {
    return (
      <div className="rounded-lg bg-muted/30 p-3">
        <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <BookOpen className="h-3 w-3" />
          Recent Trades
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <BarChart3 className="h-6 w-6 text-muted-foreground/50 mb-2" />
          <p className="text-xs font-medium text-muted-foreground">No closed trades yet</p>
          <p className="text-[11px] text-muted-foreground/70 mt-1">Your completed trades will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-muted/30 p-3">
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <BookOpen className="h-3 w-3" />
          Recent Trades
        </div>
        <span className="text-[11px] text-muted-foreground/60">
          Last 5 closed
        </span>
      </div>

      <div className="space-y-0.5">
        {closedTrades.map((trade) => {
          const isExpanded = expandedId === trade.id;
          const hasNotes = !!(trade.notes && trade.notes.trim());
          const tags = trade.tags ?? [];
          const date = new Date(
            trade.simulationDate,
          ).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          return (
            <div
              key={trade.id}
              className="rounded border border-border/40 bg-background/50"
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedId(isExpanded ? null : trade.id)
                }
                className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[11px]"
              >
                <span className="font-semibold w-10 shrink-0">
                  {trade.ticker}
                </span>
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase",
                    trade.side === "sell"
                      ? "bg-emerald-500/12 text-emerald-400"
                      : "bg-red-500/12 text-red-400",
                  )}
                >
                  {trade.side === "sell" ? "long" : "short"}
                </span>
                <span className="text-muted-foreground shrink-0">
                  {date}
                </span>
                <span
                  className={cn(
                    "ml-auto font-semibold tabular-nums shrink-0",
                    trade.realizedPnL > 0
                      ? "text-emerald-400"
                      : trade.realizedPnL < 0
                        ? "text-red-400"
                        : "text-muted-foreground",
                  )}
                >
                  {trade.realizedPnL > 0 ? "+" : ""}
                  {formatCurrency(trade.realizedPnL)}
                </span>
                {hasNotes && (
                  <MessageSquare className="h-3 w-3 shrink-0 text-muted-foreground/40" />
                )}
                {tags.length > 0 && (
                  <div className="flex gap-1 shrink-0">
                    {tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-primary/10 px-1.5 text-[11px] text-primary/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <ChevronDown
                  className={cn(
                    "h-3 w-3 shrink-0 text-muted-foreground/40 transition-transform",
                    isExpanded && "rotate-180",
                  )}
                />
              </button>

              {isExpanded && (
                <div className="border-t border-border/30 px-2.5 py-1.5">
                  {hasNotes ? (
                    <p className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {trade.notes}
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground/50 italic">
                      No notes for this trade.
                    </p>
                  )}
                  {tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary/70"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
