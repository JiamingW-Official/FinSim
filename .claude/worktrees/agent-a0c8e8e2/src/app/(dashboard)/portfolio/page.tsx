"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { PerformanceMetrics } from "@/components/portfolio/PerformanceMetrics";
import { TradeJournal } from "@/components/portfolio/TradeJournal";
import { QuantDashboard } from "@/components/portfolio/QuantDashboard";
import { CorrelationHeatmap } from "@/components/portfolio/CorrelationHeatmap";
import { SectorHeatmap } from "@/components/portfolio/SectorHeatmap";
import { PairsTradingPanel } from "@/components/quant/PairsTradingPanel";
import { MomentumTable } from "@/components/quant/MomentumTable";
import { MeanReversionPanel } from "@/components/quant/MeanReversionPanel";
import { RebalancingPanel } from "@/components/quant/RebalancingPanel";
import { TaxHarvestingPanel } from "@/components/quant/TaxHarvestingPanel";
import { useGameStore } from "@/stores/game-store";
import { useTradingStore } from "@/stores/trading-store";
import { INITIAL_CAPITAL } from "@/types/trading";
import { WATCHLIST_STOCKS } from "@/types/market";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Shield, BarChart3, BookOpen, TrendingUp, TrendingDown, Trophy, Wallet, Briefcase, Award, Target, Calendar, Activity, Loader2 } from "lucide-react";
import { AchievementGallery } from "@/components/game/AchievementGallery";
import { ExportMenu } from "@/components/portfolio/ExportMenu";
import { calculateCorrelationMatrix } from "@/services/quant/correlation";
import { runMonteCarloSimulation } from "@/services/quant/monte-carlo";
import { calculateEfficientFrontier } from "@/services/quant/efficient-frontier";

const ChartLoadingFallback = () => (
  <div className="flex h-64 items-center justify-center gap-2 text-xs text-muted-foreground">
    <Loader2 className="h-4 w-4 animate-spin" />Loading chart...
  </div>
);

const EquityCurve = dynamic(
  () =>
    import("@/components/portfolio/EquityCurve").then(
      (mod) => mod.EquityCurve,
    ),
  { ssr: false, loading: ChartLoadingFallback },
);

const WinRateChart = dynamic(
  () =>
    import("@/components/portfolio/WinRateChart").then(
      (mod) => mod.WinRateChart,
    ),
  { ssr: false, loading: ChartLoadingFallback },
);

const TradeCalendar = dynamic(
  () =>
    import("@/components/portfolio/TradeCalendar").then(
      (mod) => mod.TradeCalendar,
    ),
  { ssr: false, loading: ChartLoadingFallback },
);

const MonteCarloChart = dynamic(
  () => import("@/components/quant/MonteCarloChart"),
  { ssr: false, loading: ChartLoadingFallback },
);

const EfficientFrontierChart = dynamic(
  () => import("@/components/quant/EfficientFrontierChart"),
  { ssr: false, loading: ChartLoadingFallback },
);

const PositionSizingPanel = dynamic(
  () => import("@/components/quant/PositionSizingPanel"),
  { ssr: false, loading: ChartLoadingFallback },
);

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
} as const;
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 25 } },
};

type PortfolioTab =
  | "overview"
  | "risk-metrics"
  | "correlation"
  | "monte-carlo"
  | "efficient-frontier"
  | "position-sizing"
  | "pairs-trading"
  | "momentum"
  | "mean-reversion"
  | "rebalancing"
  | "tax-harvesting";

const TABS: { value: PortfolioTab; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "risk-metrics", label: "Risk Metrics" },
  { value: "correlation", label: "Correlation" },
  { value: "monte-carlo", label: "Monte Carlo" },
  { value: "efficient-frontier", label: "Efficient Frontier" },
  { value: "position-sizing", label: "Position Sizing" },
  { value: "pairs-trading", label: "Pairs Trading" },
  { value: "momentum", label: "Momentum" },
  { value: "mean-reversion", label: "Mean Reversion" },
  { value: "rebalancing", label: "Rebalancing" },
  { value: "tax-harvesting", label: "Tax Harvesting" },
];

// Synthetic price generator for quant tools
function generatePrices(ticker: string, bars: number = 252): number[] {
  let seed = 0;
  for (let i = 0; i < ticker.length; i++) {
    seed = (seed * 31 + ticker.charCodeAt(i)) | 0;
  }
  const prices: number[] = [];
  let price = 80 + (Math.abs(seed) % 200);
  for (let i = 0; i < bars; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const change = ((seed / 0x7fffffff) - 0.5) * 3;
    price = Math.max(10, price + change);
    prices.push(Math.round(price * 100) / 100);
  }
  return prices;
}

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState<PortfolioTab>("overview");
  const level = useGameStore((s) => s.level);
  const title = useGameStore((s) => s.title);
  const achievements = useGameStore((s) => s.achievements);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);
  const cash = useTradingStore((s) => s.cash);
  const positions = useTradingStore((s) => s.positions);
  const totalPnL = portfolioValue - INITIAL_CAPITAL;
  const totalPnLPct = (totalPnL / INITIAL_CAPITAL) * 100;

  // Correlation matrix data
  const correlations = useMemo(() => {
    const priceHistories: Record<string, number[]> = {};
    for (const stock of WATCHLIST_STOCKS) {
      priceHistories[stock.ticker] = generatePrices(stock.ticker);
    }
    return calculateCorrelationMatrix(priceHistories);
  }, []);

  // Monte Carlo data
  const monteCarloResult = useMemo(() => {
    return runMonteCarloSimulation(portfolioValue, 0.08, 0.18, 10);
  }, [portfolioValue]);

  // Efficient Frontier data
  const efficientFrontierResult = useMemo(() => {
    const tickers = WATCHLIST_STOCKS.slice(0, 6).map((s) => s.ticker);
    const expectedReturns: Record<string, number> = {};
    const priceHistories: Record<string, number[]> = {};
    for (const t of tickers) {
      const prices = generatePrices(t);
      priceHistories[t] = prices;
      // Annualized return from price series
      const totalReturn = prices[prices.length - 1] / prices[0] - 1;
      expectedReturns[t] = totalReturn;
    }
    // Simple covariance matrix from returns
    const returns: number[][] = tickers.map((t) => {
      const p = priceHistories[t];
      return p.slice(1).map((v, i) => Math.log(v / p[i]));
    });
    const n = tickers.length;
    const len = Math.min(...returns.map((r) => r.length));
    const means = returns.map((r) => r.slice(0, len).reduce((s, v) => s + v, 0) / len);
    const cov: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let sum = 0;
        for (let k = 0; k < len; k++) {
          sum += (returns[i][k] - means[i]) * (returns[j][k] - means[j]);
        }
        cov[i][j] = (sum / (len - 1)) * 252; // annualize
      }
    }
    return calculateEfficientFrontier(expectedReturns, cov, tickers);
  }, []);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="space-y-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
              <Briefcase className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight">Portfolio</h1>
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
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg border border-border bg-card/50 p-3 hover:border-border/60 transition-colors">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground mb-1">
              <Wallet className="h-3 w-3" />
              Portfolio Value
            </div>
            <p className="font-mono tabular-nums text-base font-semibold">{formatCurrency(portfolioValue)}</p>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-3 hover:border-border/60 transition-colors">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground mb-1">
              {totalPnL >= 0 ? <TrendingUp className="h-3 w-3 text-green-400" /> : <TrendingDown className="h-3 w-3 text-red-400" />}
              Total P&L
            </div>
            <p className={cn("font-mono tabular-nums text-base font-semibold", totalPnL >= 0 ? "text-green-400" : "text-red-400")}>
              {totalPnL >= 0 ? "+" : ""}{formatCurrency(totalPnL)}
            </p>
            <p className={cn("font-mono tabular-nums text-[10px] font-semibold", totalPnLPct >= 0 ? "text-green-400/70" : "text-red-400/70")}>
              {totalPnLPct >= 0 ? "+" : ""}{totalPnLPct.toFixed(2)}%
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-3 hover:border-border/60 transition-colors">
            <div className="text-[10px] font-medium text-muted-foreground mb-1">Positions</div>
            <p className="font-mono tabular-nums text-base font-semibold">{positions.length}</p>
            <p className="text-[10px] text-muted-foreground">
              Cash: {formatCurrency(cash)}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-border overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium border-b-2 transition-colors -mb-px whitespace-nowrap",
                activeTab === tab.value
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <motion.div
            className="space-y-4"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {/* Equity Curve */}
            <motion.div variants={fadeUp} className="rounded-lg border border-border bg-card p-3">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <BarChart3 className="h-3.5 w-3.5 text-blue-400" />
                Equity Curve
              </div>
              <EquityCurve />
            </motion.div>

            {/* Win Rate Chart + Trade Calendar */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-card p-3 hover:border-border/60 transition-colors">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Target className="h-3.5 w-3.5 text-cyan-400" />
                  Win Rate (Rolling 10)
                </div>
                <WinRateChart />
              </div>
              <div className="rounded-lg border border-border bg-card p-3 hover:border-border/60 transition-colors">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 text-green-400" />
                  Trade Calendar
                </div>
                <TradeCalendar />
              </div>
            </motion.div>

            {/* Performance Metrics */}
            <motion.div variants={fadeUp}>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5 text-green-400" />
                Performance Metrics
              </div>
              <PerformanceMetrics />
            </motion.div>

            {/* Trade Journal */}
            <motion.div variants={fadeUp} className="rounded-lg border border-border bg-card p-3">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <BookOpen className="h-3.5 w-3.5 text-violet-400" />
                Trade Journal
              </div>
              <TradeJournal />
            </motion.div>

            {/* Achievement Gallery */}
            <motion.div variants={fadeUp} className="rounded-lg border border-border bg-card p-3">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Award className="h-3.5 w-3.5 text-amber-400" />
                Achievements
              </div>
              <AchievementGallery />
            </motion.div>
          </motion.div>
        )}

        {activeTab === "risk-metrics" && (
          <div className="space-y-4">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Activity className="h-3.5 w-3.5 text-blue-400" />
              Quantitative Analytics
            </div>
            <QuantDashboard />
            <SectorHeatmap />
          </div>
        )}

        {activeTab === "correlation" && (
          <div className="rounded-lg border border-border bg-card p-4 hover:border-border/60 transition-colors">
            <h2 className="text-sm font-semibold mb-3">Asset Correlation Matrix</h2>
            <CorrelationHeatmap correlations={correlations} />
          </div>
        )}

        {activeTab === "monte-carlo" && (
          <div className="rounded-lg border border-border bg-card p-4 hover:border-border/60 transition-colors">
            <h2 className="text-sm font-semibold mb-3">Monte Carlo Simulation (10-Year Projection)</h2>
            <MonteCarloChart result={monteCarloResult} years={10} />
          </div>
        )}

        {activeTab === "efficient-frontier" && (
          <div className="rounded-lg border border-border bg-card p-4 hover:border-border/60 transition-colors">
            <h2 className="text-sm font-semibold mb-3">Markowitz Efficient Frontier</h2>
            <EfficientFrontierChart result={efficientFrontierResult} />
          </div>
        )}

        {activeTab === "position-sizing" && (
          <div className="rounded-lg border border-border bg-card p-4 hover:border-border/60 transition-colors">
            <h2 className="text-sm font-semibold mb-3">Position Sizing Calculator</h2>
            <PositionSizingPanel defaultPortfolioValue={portfolioValue} />
          </div>
        )}

        {activeTab === "pairs-trading" && (
          <div className="rounded-lg border border-border bg-card p-4 hover:border-border/60 transition-colors">
            <PairsTradingPanel />
          </div>
        )}

        {activeTab === "momentum" && (
          <div className="rounded-lg border border-border bg-card p-4 hover:border-border/60 transition-colors">
            <MomentumTable />
          </div>
        )}

        {activeTab === "mean-reversion" && (
          <div className="rounded-lg border border-border bg-card p-4 hover:border-border/60 transition-colors">
            <MeanReversionPanel />
          </div>
        )}

        {activeTab === "rebalancing" && (
          <div className="rounded-lg border border-border bg-card p-4 hover:border-border/60 transition-colors">
            <RebalancingPanel />
          </div>
        )}

        {activeTab === "tax-harvesting" && (
          <div className="rounded-lg border border-border bg-card p-4 hover:border-border/60 transition-colors">
            <TaxHarvestingPanel />
          </div>
        )}
      </div>
    </div>
  );
}
