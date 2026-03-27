"use client";

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
                <TabsTrigger value="journal" className="flex-1 rounded-md text-[11px] h-7 whitespace-nowrap">
                  Journal
                </TabsTrigger>
                <TabsTrigger value="achievements" className="flex-1 rounded-md text-[11px] h-7 whitespace-nowrap">
                  Awards
                </TabsTrigger>
                <TabsTrigger value="deep" className="flex-1 rounded-md text-[11px] h-7 whitespace-nowrap">
                  Deep
                </TabsTrigger>
              </TabsList>
            </div>

            {/* ── Overview tab ── */}
            <TabsContent value="overview" className="space-y-4">
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

              <div>
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                  Performance Metrics
                </div>
                <PerformanceMetrics />
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

            {/* ── Journal tab ── */}
            <TabsContent value="journal">
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5 text-violet-400" />
                  Trade Journal
                </div>
                <TradeJournal />
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
