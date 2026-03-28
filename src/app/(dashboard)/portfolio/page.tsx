"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { PerformanceMetrics } from "@/components/portfolio/PerformanceMetrics";
import { TradeJournal } from "@/components/portfolio/TradeJournal";
import { QuantDashboard } from "@/components/portfolio/QuantDashboard";
import { useGameStore } from "@/stores/game-store";
import { useTradingStore } from "@/stores/trading-store";
import { INITIAL_CAPITAL } from "@/types/trading";
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
} from "lucide-react";
import { AchievementGallery } from "@/components/game/AchievementGallery";
import { ExportMenu } from "@/components/portfolio/ExportMenu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WinLossDistribution } from "@/components/analytics/WinLossDistribution";
import { HoldingPeriodAnalysis } from "@/components/analytics/HoldingPeriodAnalysis";
import { TradeHeatmap } from "@/components/analytics/TradeHeatmap";
import { MAEMFEScatter } from "@/components/analytics/MAEMFEScatter";
import { StreakAnalysis } from "@/components/analytics/StreakAnalysis";
import { RollingSharpeChart, RollingWinRateChart } from "@/components/analytics/RollingMetricsChart";
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

const EquityCurve = dynamic(
  () =>
    import("@/components/portfolio/EquityCurve").then(
      (mod) => mod.EquityCurve,
    ),
  { ssr: false },
);

const WinRateChart = dynamic(
  () =>
    import("@/components/portfolio/WinRateChart").then(
      (mod) => mod.WinRateChart,
    ),
  { ssr: false },
);

const TradeCalendar = dynamic(
  () =>
    import("@/components/portfolio/TradeCalendar").then(
      (mod) => mod.TradeCalendar,
    ),
  { ssr: false },
);

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
} as const;
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 25 } },
};

export default function PortfolioPage() {
  const level = useGameStore((s) => s.level);
  const title = useGameStore((s) => s.title);
  const achievements = useGameStore((s) => s.achievements);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);
  const cash = useTradingStore((s) => s.cash);
  const positions = useTradingStore((s) => s.positions);
  const totalPnL = portfolioValue - INITIAL_CAPITAL;
  const totalPnLPct = (totalPnL / INITIAL_CAPITAL) * 100;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <motion.div
        className="space-y-4 p-4"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
              <Briefcase className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <h1 className="text-base font-semibold">Portfolio</h1>
              <p className="text-[10px] text-muted-foreground">Performance and analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ExportMenu />
            <div className="flex items-center gap-1.5 rounded-md bg-primary/8 px-2 py-1">
              <Shield className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-medium text-primary">Lv.{level} {title}</span>
            </div>
            {achievements.length > 0 && (
              <div className="flex items-center gap-1 rounded-md bg-amber-500/8 px-2 py-1">
                <Trophy className="h-3 w-3 text-amber-400" />
                <span className="text-[10px] font-medium text-amber-400">{achievements.length}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Stats Row */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-border bg-card/50 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground mb-1">
              <Wallet className="h-3 w-3" />
              Portfolio Value
            </div>
            <p className="text-base font-semibold tabular-nums">{formatCurrency(portfolioValue)}</p>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground mb-1">
              {totalPnL >= 0 ? <TrendingUp className="h-3 w-3 text-emerald-400" /> : <TrendingDown className="h-3 w-3 text-red-400" />}
              Total P&L
            </div>
            <p className={cn("text-base font-semibold tabular-nums", totalPnL >= 0 ? "text-emerald-400" : "text-red-400")}>
              {totalPnL >= 0 ? "+" : ""}{formatCurrency(totalPnL)}
            </p>
            <p className={cn("text-[10px] font-bold tabular-nums", totalPnLPct >= 0 ? "text-emerald-400/70" : "text-red-400/70")}>
              {totalPnLPct >= 0 ? "+" : ""}{totalPnLPct.toFixed(2)}%
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-3">
            <div className="text-[10px] font-medium text-muted-foreground mb-1">Positions</div>
            <p className="text-base font-semibold tabular-nums">{positions.length}</p>
            <p className="text-[10px] text-muted-foreground">
              Cash: {formatCurrency(cash)}
            </p>
          </div>
        </motion.div>

        {/* Tabbed content */}
        <motion.div variants={fadeUp}>
          <Tabs defaultValue="overview">
            <div className="mb-4 overflow-x-auto">
              <TabsList className="flex h-8 min-w-max w-full gap-0.5 rounded-lg bg-card/60 p-0.5">
                <TabsTrigger value="overview" className="flex-1 rounded-md text-[11px] h-7 whitespace-nowrap">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex-1 rounded-md text-[11px] h-7 whitespace-nowrap">
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="rebalance" className="flex-1 rounded-md text-[11px] h-7 whitespace-nowrap">
                  Rebalance
                </TabsTrigger>
                <TabsTrigger value="optimize" className="flex-1 rounded-md text-[11px] h-7 whitespace-nowrap">
                  Optimize
                </TabsTrigger>
                <TabsTrigger value="frontier" className="flex-1 rounded-md text-[11px] h-7 whitespace-nowrap">
                  Frontier
                </TabsTrigger>
                <TabsTrigger value="income" className="flex-1 rounded-md text-[11px] h-7 whitespace-nowrap">
                  Income
                </TabsTrigger>
                <TabsTrigger value="journal" className="flex-1 rounded-md text-[11px] h-7 whitespace-nowrap">
                  Journal
                </TabsTrigger>
                <TabsTrigger value="achievements" className="flex-1 rounded-md text-[11px] h-7 whitespace-nowrap">
                  Awards
                </TabsTrigger>
                <TabsTrigger value="deep" className="flex-1 rounded-md text-[11px] h-7 whitespace-nowrap">
                  Deep
                </TabsTrigger>
                <TabsTrigger value="attribution" className="flex-1 rounded-md text-[11px] h-7 whitespace-nowrap">
                  Attribution
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex-1 rounded-md text-[11px] h-7 whitespace-nowrap">
                  Analytics+
                </TabsTrigger>
                <TabsTrigger value="stress" className="flex-1 rounded-md text-[11px] h-7 whitespace-nowrap">
                  Stress Test
                </TabsTrigger>
                <TabsTrigger value="bl-optimizer" className="flex-1 rounded-md text-[11px] h-7 whitespace-nowrap">
                  BL Optimizer
                </TabsTrigger>
              </TabsList>
            </div>

            {/* ── Overview tab ── */}
            <TabsContent value="overview" className="space-y-4">
              {/* Live P&L Dashboard — prominent first widget */}
              <LivePnLDashboard />

              <div className="rounded-lg border border-border bg-card p-3">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <BarChart3 className="h-3.5 w-3.5 text-blue-400" />
                  Equity Curve
                </div>
                <EquityCurve />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-card p-3">
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Target className="h-3.5 w-3.5 text-cyan-400" />
                    Win Rate (Rolling 10)
                  </div>
                  <WinRateChart />
                </div>
                <div className="rounded-lg border border-border bg-card p-3">
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 text-green-400" />
                    Trade Calendar
                  </div>
                  <TradeCalendar />
                </div>
              </div>

              {/* Portfolio Attribution — new in overview */}
              <div>
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <PieChart className="h-3.5 w-3.5 text-violet-400" />
                  Portfolio Attribution
                </div>
                <PortfolioAttribution />
              </div>

              <div>
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                  Performance Metrics
                </div>
                <PerformanceMetrics />
              </div>

              {/* Weekly Review card */}
              <div>
                <WeeklyReview />
              </div>
            </TabsContent>

            {/* ── Analytics tab ── */}
            <TabsContent value="analytics" className="space-y-4">
              <div>
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Activity className="h-3.5 w-3.5 text-blue-400" />
                  Quantitative Analytics
                </div>
                <QuantDashboard />
              </div>

              <div className="rounded-lg border border-border bg-card p-3">
                <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
                  Rolling Sharpe Ratio (30-trade window)
                </div>
                <RollingSharpeChart />
              </div>

              <div className="rounded-lg border border-border bg-card p-3">
                <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Target className="h-3.5 w-3.5 text-green-400" />
                  Rolling Win Rate (20-trade window)
                </div>
                <RollingWinRateChart />
              </div>
            </TabsContent>

            {/* ── Rebalance tab ── */}
            <TabsContent value="rebalance" className="space-y-4">
              <div>
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <RefreshCw className="h-3.5 w-3.5 text-blue-400" />
                  Portfolio Rebalancing
                </div>
                <RebalancingPanel />
              </div>

              <div>
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Scissors className="h-3.5 w-3.5 text-amber-400" />
                  Tax Loss Harvesting
                </div>
                <TaxHarvestingPanel />
              </div>
            </TabsContent>

            {/* ── Optimize tab ── */}
            <TabsContent value="optimize" className="space-y-4">
              <div>
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <LineChart className="h-3.5 w-3.5 text-violet-400" />
                  Efficient Frontier &amp; MPT Optimizer
                </div>
                <PortfolioOptimizer />
              </div>
            </TabsContent>

            {/* ── Frontier tab ── */}
            <TabsContent value="frontier" className="space-y-4">
              <div>
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <LineChart className="h-3.5 w-3.5 text-cyan-400" />
                  Efficient Frontier &amp; Portfolio Optimizer
                </div>
                <EfficientFrontier />
              </div>
            </TabsContent>

            {/* ── Income tab ── */}
            <TabsContent value="income" className="space-y-4">
              <div>
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                  Dividend Income Tracker
                </div>
                <DividendTracker />
              </div>
            </TabsContent>

            {/* ── Journal tab ── */}
            <TabsContent value="journal" className="space-y-3">
              {/* Recent 5 trades with notes */}
              <RecentTradesPreview />

              {/* Full journal link */}
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5 text-violet-400" />
                  Trade Journal
                </div>
                <TradeJournal />
                <div className="mt-3 border-t border-border/40 pt-3">
                  <a
                    href="/journal"
                    className="flex items-center gap-1.5 text-[11px] font-medium text-primary hover:underline"
                  >
                    View Full Journal
                    <span className="text-muted-foreground">→</span>
                  </a>
                </div>
              </div>
            </TabsContent>

            {/* ── Achievements tab ── */}
            <TabsContent value="achievements">
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Award className="h-3.5 w-3.5 text-amber-400" />
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
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Flame className="h-3.5 w-3.5 text-rose-400" />
                Portfolio Stress Testing &amp; Scenario Analysis
              </div>
              <StressTester />
            </TabsContent>

            {/* ── BL Optimizer tab ── */}
            <TabsContent value="bl-optimizer" className="space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                <Target className="h-3.5 w-3.5 text-indigo-400" />
                Black-Litterman Portfolio Optimizer
              </div>
              <BlackLitterman />
            </TabsContent>

            {/* ── Deep Analytics tab ── */}
            <TabsContent value="deep" className="space-y-4">
              {/* Trade Distribution */}
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <BarChart3 className="h-3.5 w-3.5 text-blue-400" />
                  Trade Distribution
                </div>
                <WinLossDistribution />
              </div>

              {/* Holding Period Analysis */}
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                  Holding Period Analysis
                </div>
                <HoldingPeriodAnalysis />
              </div>

              {/* Trade Heatmap */}
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Activity className="h-3.5 w-3.5 text-green-400" />
                  Day-of-Week Heatmap
                </div>
                <TradeHeatmap />
              </div>

              {/* MAE/MFE Scatter */}
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <FlaskConical className="h-3.5 w-3.5 text-violet-400" />
                  MAE/MFE Scatter — Trade Efficiency
                </div>
                <MAEMFEScatter />
              </div>

              {/* Streak Analysis */}
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                  Streak Analysis
                </div>
                <StreakAnalysis />
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ── RecentTradesPreview ──────────────────────────────────────────────────────

function RecentTradesPreview() {
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Only closed trades (realizedPnL !== 0)
  const closedTrades = tradeHistory
    .filter((t) => t.realizedPnL !== 0)
    .slice(0, 5);

  if (closedTrades.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5 text-teal-400" />
          Recent Trades
        </div>
        <span className="text-[10px] text-muted-foreground/60">Last 5 closed</span>
      </div>

      <div className="space-y-1">
        {closedTrades.map((trade) => {
          const isExpanded = expandedId === trade.id;
          const hasNotes = !!(trade.notes && trade.notes.trim());
          const tags = trade.tags ?? [];
          const date = new Date(trade.simulationDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          return (
            <div key={trade.id} className="rounded border border-border/40 bg-background/50">
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : trade.id)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[11px]"
              >
                <span className="font-semibold w-10 shrink-0">{trade.ticker}</span>
                <span className={cn(
                  "rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase",
                  trade.side === "sell" ? "bg-green-500/12 text-green-400" : "bg-red-500/12 text-red-400",
                )}>
                  {trade.side === "sell" ? "long" : "short"}
                </span>
                <span className="text-muted-foreground shrink-0">{date}</span>
                <span className={cn(
                  "ml-auto font-semibold tabular-nums shrink-0",
                  trade.realizedPnL > 0 ? "text-green-400" : trade.realizedPnL < 0 ? "text-red-400" : "text-muted-foreground",
                )}>
                  {trade.realizedPnL > 0 ? "+" : ""}
                  {formatCurrency(trade.realizedPnL)}
                </span>
                {hasNotes && <MessageSquare className="h-3 w-3 shrink-0 text-muted-foreground/40" />}
                {tags.length > 0 && (
                  <div className="flex gap-1 shrink-0">
                    {tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="rounded-full bg-primary/10 px-1.5 text-[9px] text-primary/70">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <ChevronDown className={cn(
                  "h-3 w-3 shrink-0 text-muted-foreground/40 transition-transform",
                  isExpanded && "rotate-180",
                )} />
              </button>

              {/* Expanded notes */}
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
                        <span key={tag} className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] text-primary/70">
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
