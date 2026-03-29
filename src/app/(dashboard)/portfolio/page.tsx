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
  Wallet,
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

function ChartSkeleton({ height = "h-[200px]" }: { height?: string }) {
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
  const completedLessons = useLearnStore((s) => s.completedLessons);
  const totalPnL = portfolioValue - INITIAL_CAPITAL;
  const totalPnLPct = (totalPnL / INITIAL_CAPITAL) * 100;

  const hasTrades = tradeHistory.length > 0;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="space-y-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            <div>
              <h1 className="text-base font-semibold">Portfolio</h1>
              <p className="text-xs text-muted-foreground">
                Track your practice performance
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ExportMenu />
            <div className="flex items-center gap-1.5 rounded-md bg-primary/8 px-2 py-1">
              <Shield className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium text-primary">
                Lv.{level} {title}
              </span>
            </div>
            {achievements.length > 0 && (
              <div className="flex items-center gap-1 rounded-md bg-muted/50 px-2 py-1">
                <Trophy className="h-3 w-3 text-amber-400" />
                <span className="text-xs font-medium text-amber-400">
                  {achievements.length}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-muted/30 p-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
              <Wallet className="h-3 w-3" />
              Portfolio Value
            </div>
            <div className="flex items-center gap-1.5">
              <p className="text-base font-semibold tabular-nums">
                {formatCurrency(portfolioValue)}
              </p>
              <span className="rounded bg-muted/40 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                Simulated
              </span>
            </div>
          </div>
          <div className="rounded-lg bg-muted/30 p-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
              {totalPnL >= 0 ? (
                <TrendingUp className="h-3 w-3 text-emerald-400" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-400" />
              )}
              Total P&L
            </div>
            <p
              className={cn(
                "text-base font-semibold tabular-nums",
                totalPnL >= 0 ? "text-emerald-400" : "text-red-400",
              )}
            >
              {totalPnL >= 0 ? "+" : ""}
              {formatCurrency(totalPnL)}
            </p>
            <p
              className={cn(
                "text-xs font-medium tabular-nums",
                totalPnLPct >= 0
                  ? "text-emerald-400/70"
                  : "text-red-400/70",
              )}
            >
              {totalPnLPct >= 0 ? "+" : ""}
              {totalPnLPct.toFixed(2)}%
            </p>
          </div>
          <div className="rounded-lg bg-muted/30 p-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
              <Briefcase className="h-3 w-3" />
              Positions
            </div>
            <p className="text-base font-semibold tabular-nums">
              {positions.length}
            </p>
            <p className="text-xs tabular-nums text-muted-foreground">
              Cash: {formatCurrency(cash)}
            </p>
          </div>
        </div>

        {/* Empty state when no trades exist */}
        {!hasTrades && (
          <div className="rounded-lg border border-dashed border-border bg-card/30 p-6 text-center">
            <BarChart3 className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm font-medium text-foreground mb-1">
              No trades yet — start practicing!
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Place your first simulated trade to begin tracking performance and building your portfolio history.
            </p>
            <Link
              href="/trade"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Go to Trading
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}

        {/* Learning Progress section */}
        <LearningProgress completedLessons={completedLessons} />

        {/* Tabbed content */}
        <div>
          <Tabs defaultValue="overview">
            <div className="mb-4 overflow-x-auto">
              <TabsList className="flex h-8 min-w-max w-full gap-0.5 rounded-lg bg-card/60 p-0.5">
                <TabsTrigger
                  value="overview"
                  className="flex-1 rounded-md text-[11px] h-7 whitespace-nowrap"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="flex-1 rounded-md text-[11px] h-7 whitespace-nowrap"
                >
                  Analytics
                </TabsTrigger>
                <TabsTrigger
                  value="rebalance"
                  className="flex-1 rounded-md text-[11px] h-7 whitespace-nowrap"
                >
                  Rebalance
                </TabsTrigger>
                <TabsTrigger
                  value="optimize"
                  className="flex-1 rounded-md text-[11px] h-7 whitespace-nowrap"
                >
                  Optimizer
                </TabsTrigger>
                <TabsTrigger
                  value="frontier"
                  className="flex-1 rounded-md text-[11px] h-7 whitespace-nowrap"
                >
                  Frontier
                </TabsTrigger>
                <TabsTrigger
                  value="income"
                  className="flex-1 rounded-md text-[11px] h-7 whitespace-nowrap"
                >
                  Income
                </TabsTrigger>
                <TabsTrigger
                  value="journal"
                  className="flex-1 rounded-md text-[11px] h-7 whitespace-nowrap"
                >
                  Journal
                </TabsTrigger>
                <TabsTrigger
                  value="achievements"
                  className="flex-1 rounded-md text-[11px] h-7 whitespace-nowrap"
                >
                  Awards
                </TabsTrigger>
                <TabsTrigger
                  value="deep"
                  className="flex-1 rounded-md text-[11px] h-7 whitespace-nowrap"
                >
                  Deep
                </TabsTrigger>
                <TabsTrigger
                  value="attribution"
                  className="flex-1 rounded-md text-[11px] h-7 whitespace-nowrap"
                >
                  Attribution
                </TabsTrigger>
                <TabsTrigger
                  value="advanced"
                  className="flex-1 rounded-md text-[11px] h-7 whitespace-nowrap"
                >
                  Analytics+
                </TabsTrigger>
                <TabsTrigger
                  value="stress"
                  className="flex-1 rounded-md text-[11px] h-7 whitespace-nowrap"
                >
                  Stress Test
                </TabsTrigger>
                <TabsTrigger
                  value="bl-optimizer"
                  className="flex-1 rounded-md text-[11px] h-7 whitespace-nowrap"
                >
                  BL Optimizer
                </TabsTrigger>
                <TabsTrigger
                  value="rebalance-tool"
                  className="flex-1 rounded-md text-[11px] h-7 whitespace-nowrap"
                >
                  Rebalance+
                </TabsTrigger>
                <TabsTrigger
                  value="attribution-plus"
                  className="flex-1 rounded-md text-[11px] h-7 whitespace-nowrap"
                >
                  Attribution+
                </TabsTrigger>
              </TabsList>
            </div>

            {/* ── Overview tab ── */}
            <TabsContent value="overview" className="space-y-4">
              <LivePnLDashboard />

              {/* Hero: Equity Curve */}
              <div className="border-l-4 border-primary rounded-lg bg-card p-6">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Equity Curve
                </div>
                <EquityCurve />
              </div>

              {/* Action: Charts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/30 p-4">
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Target className="h-3.5 w-3.5" />
                    Win Rate (Rolling 10)
                  </div>
                  <WinRateChart />
                </div>
                <div className="rounded-lg bg-muted/30 p-4">
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    Trade Calendar
                  </div>
                  <TradeCalendar />
                </div>
              </div>

              {/* Reference: Attribution */}
              <div className="rounded-lg bg-muted/30 p-3">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <PieChart className="h-3.5 w-3.5" />
                  Portfolio Attribution
                </div>
                <PortfolioAttribution />
              </div>

              {/* Reference: Performance Metrics */}
              <div className="rounded-lg bg-muted/30 p-3">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Performance Metrics
                </div>
                <PerformanceMetrics />
              </div>

              <div>
                <WeeklyReview />
              </div>
            </TabsContent>

            {/* ── Analytics tab ── */}
            <TabsContent value="analytics" className="space-y-4">
              <div className="rounded-lg bg-muted/30 p-4">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Activity className="h-3.5 w-3.5" />
                  Quantitative Analytics
                </div>
                <QuantDashboard />
              </div>

              <div className="rounded-lg bg-muted/30 p-3">
                <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Rolling Sharpe Ratio (30-trade window)
                </div>
                <RollingSharpeChart />
              </div>

              <div className="rounded-lg bg-muted/30 p-3">
                <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Target className="h-3.5 w-3.5" />
                  Rolling Win Rate (20-trade window)
                </div>
                <RollingWinRateChart />
              </div>
            </TabsContent>

            {/* ── Rebalance tab ── */}
            <TabsContent value="rebalance" className="space-y-4">
              <div className="rounded-lg bg-muted/30 p-4">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Portfolio Rebalancing
                </div>
                <RebalancingPanel />
              </div>

              <div className="rounded-lg bg-muted/30 p-4">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Scissors className="h-3.5 w-3.5" />
                  Tax Loss Harvesting
                </div>
                <TaxHarvestingPanel />
              </div>
            </TabsContent>

            {/* ── Optimize tab ── */}
            <TabsContent value="optimize" className="space-y-4">
              <div className="rounded-lg bg-muted/30 p-4">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <LineChart className="h-3.5 w-3.5" />
                  Efficient Frontier &amp; MPT Optimizer
                </div>
                <PortfolioOptimizer />
              </div>
            </TabsContent>

            {/* ── Frontier tab ── */}
            <TabsContent value="frontier" className="space-y-4">
              <div className="rounded-lg bg-muted/30 p-4">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <LineChart className="h-3.5 w-3.5" />
                  Efficient Frontier &amp; Portfolio Optimizer
                </div>
                <EfficientFrontier />
              </div>
            </TabsContent>

            {/* ── Income tab ── */}
            <TabsContent value="income" className="space-y-4">
              <div className="rounded-lg bg-muted/30 p-4">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5" />
                  Dividend Income Tracker
                </div>
                <DividendTracker />
              </div>
            </TabsContent>

            {/* ── Journal tab ── */}
            <TabsContent value="journal" className="space-y-3">
              <RecentTradesPreview />

              <div className="rounded-lg bg-muted/30 p-3">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5" />
                  Trade Journal
                </div>
                <TradeJournal />
                <div className="mt-3 border-t border-border/40 pt-3">
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
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Award className="h-3.5 w-3.5" />
                  Achievements
                </div>
                <AchievementGallery />
              </div>
            </TabsContent>

            {/* ── Attribution tab ── */}
            <TabsContent value="attribution" className="space-y-4">
              <PortfolioAttribution />
            </TabsContent>

            {/* ── Analytics+ tab ── */}
            <TabsContent value="advanced" className="space-y-4">
              <AdvancedAnalytics />
            </TabsContent>

            {/* ── Stress Test tab ── */}
            <TabsContent value="stress" className="space-y-4">
              <div className="rounded-lg bg-muted/30 p-4">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Flame className="h-3.5 w-3.5" />
                  Portfolio Stress Testing &amp; Scenario Analysis
                </div>
                <StressTester />
              </div>
            </TabsContent>

            {/* ── BL Optimizer tab ── */}
            <TabsContent value="bl-optimizer" className="space-y-4">
              <div className="rounded-lg bg-muted/30 p-4">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Target className="h-3.5 w-3.5" />
                  Black-Litterman Portfolio Optimizer
                </div>
                <BlackLitterman />
              </div>
            </TabsContent>

            {/* ── Rebalance+ tab ── */}
            <TabsContent value="rebalance-tool" className="space-y-4">
              <div className="rounded-lg bg-muted/30 p-4">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Comprehensive Rebalancing Tool
                </div>
                <RebalancingTool />
              </div>
            </TabsContent>

            {/* ── Attribution+ tab ── */}
            <TabsContent value="attribution-plus" className="space-y-4">
              <AttributionAnalysis />
            </TabsContent>

            {/* ── Deep Analytics tab ── */}
            <TabsContent value="deep" className="space-y-4">
              <div className="rounded-lg bg-muted/30 p-3">
                <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Trade Distribution
                </div>
                <WinLossDistribution />
              </div>

              <div className="rounded-lg bg-muted/30 p-3">
                <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Holding Period Analysis
                </div>
                <HoldingPeriodAnalysis />
              </div>

              <div className="rounded-lg bg-muted/30 p-3">
                <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Activity className="h-3.5 w-3.5" />
                  Day-of-Week Heatmap
                </div>
                <TradeHeatmap />
              </div>

              <div className="rounded-lg bg-muted/30 p-3">
                <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <FlaskConical className="h-3.5 w-3.5" />
                  MAE/MFE Scatter &mdash; Trade Efficiency
                </div>
                <MAEMFEScatter />
              </div>

              <div className="rounded-lg bg-muted/30 p-3">
                <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Streak Analysis
                </div>
                <StreakAnalysis />
              </div>
            </TabsContent>
          </Tabs>
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
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5" />
          Recent Trades
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BarChart3 className="h-8 w-8 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No closed trades yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Your completed trades will appear here for review</p>
          <Link href="/trade" className="mt-3">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors">
              Start trading
              <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-muted/30 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5" />
          Recent Trades
        </div>
        <span className="text-xs text-muted-foreground/60">
          Last 5 closed
        </span>
      </div>

      <div className="space-y-1">
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
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[11px]"
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
                <div className="border-t border-border/30 px-3 py-2">
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
                    <div className="mt-1.5 flex flex-wrap gap-1">
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
