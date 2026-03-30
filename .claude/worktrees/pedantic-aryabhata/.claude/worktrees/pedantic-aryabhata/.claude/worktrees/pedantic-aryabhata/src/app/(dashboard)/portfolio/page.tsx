"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { PerformanceMetrics } from "@/components/portfolio/PerformanceMetrics";
import { TradeJournal } from "@/components/portfolio/TradeJournal";
import { QuantDashboard } from "@/components/portfolio/QuantDashboard";
import { useTradingStore } from "@/stores/trading-store";
import { INITIAL_CAPITAL } from "@/types/trading";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
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
  const portfolioValue = useTradingStore((s) => s.portfolioValue);
  const cash = useTradingStore((s) => s.cash);
  const positions = useTradingStore((s) => s.positions);
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const equityHistory = useTradingStore((s) => s.equityHistory);
  const totalPnL = portfolioValue - INITIAL_CAPITAL;
  const totalPnLPct = (totalPnL / INITIAL_CAPITAL) * 100;

  const hasTrades = tradeHistory.length > 0;
  const hasPositions = positions.length > 0;

  // Compute stats
  const stats = useMemo(() => {
    const sellTrades = tradeHistory.filter((t) => t.side === "sell");
    const winningTrades = sellTrades.filter((t) => t.realizedPnL > 0);
    const winRate =
      sellTrades.length > 0
        ? (winningTrades.length / sellTrades.length) * 100
        : 0;

    let maxDrawdown = 0;
    let peak = INITIAL_CAPITAL;
    for (const snap of equityHistory) {
      if (snap.portfolioValue > peak) peak = snap.portfolioValue;
      const dd = ((peak - snap.portfolioValue) / peak) * 100;
      if (dd > maxDrawdown) maxDrawdown = dd;
    }

    const returns: number[] = [];
    for (let i = 1; i < equityHistory.length; i++) {
      const prev = equityHistory[i - 1].portfolioValue;
      if (prev > 0) {
        returns.push((equityHistory[i].portfolioValue - prev) / prev);
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

    return { winRate, sharpe, maxDrawdown, totalTrades: sellTrades.length };
  }, [tradeHistory, equityHistory]);

  // Holdings with weight calculation
  const holdings = useMemo(() => {
    const totalMarketValue = positions.reduce(
      (sum, p) => sum + p.currentPrice * p.quantity,
      0,
    );
    return positions.map((p) => ({
      ...p,
      marketValue: p.currentPrice * p.quantity,
      costBasis: p.avgPrice * p.quantity,
      weight:
        totalMarketValue > 0
          ? ((p.currentPrice * p.quantity) / totalMarketValue) * 100
          : 0,
    }));
  }, [positions]);

  // ── Market tickers for empty state ──
  const marketTickers = [
    { symbol: "AAPL", name: "Apple", price: 178.72, change: +1.34 },
    { symbol: "GOOGL", name: "Alphabet", price: 141.80, change: -0.56 },
    { symbol: "MSFT", name: "Microsoft", price: 378.91, change: +2.18 },
    { symbol: "AMZN", name: "Amazon", price: 178.25, change: +0.89 },
    { symbol: "TSLA", name: "Tesla", price: 175.34, change: -2.41 },
    { symbol: "SPY", name: "S&P 500 ETF", price: 511.42, change: +1.07 },
  ];

  // ── EMPTY STATE ──
  if (!hasTrades && !hasPositions) {
    return (
      <div className="flex h-full flex-col overflow-y-auto">
        {/* Hero — starting balance */}
        <div className="px-6 pt-8 pb-8 text-center">
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-3">
            Portfolio Value
          </p>
          <p className="text-4xl font-serif font-light tabular-nums tracking-tight">
            $100,000.00
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Starting balance &middot; Simulated
          </p>
        </div>

        {/* Getting Started */}
        <div className="px-6 pb-6">
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-4">Getting Started</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { href: "/trade", title: "Make your first trade", desc: "Buy and sell stocks with simulated capital. Track your P&L in real time." },
              { href: "/learn", title: "Learn the basics", desc: "Interactive lessons on markets, indicators, and portfolio management." },
              { href: "/backtest", title: "Explore strategies", desc: "Backtest trading strategies against historical data before risking capital." },
            ].map((card, i) => (
              <motion.div
                key={card.href}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.07, ease: "easeOut" }}
              >
                <Link
                  href={card.href}
                  className="group block bg-card rounded-lg border border-border p-5 hover:bg-muted/30 transition-colors"
                >
                  <p className="text-sm font-medium mb-1 group-hover:text-foreground transition-colors">
                    {card.title}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {card.desc}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Market Overview */}
        <div className="px-6 pb-8">
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-4">Market Overview</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {marketTickers.map((t) => (
              <div
                key={t.symbol}
                className="bg-card rounded-lg border border-border p-3"
              >
                <p className="text-xs font-medium">{t.symbol}</p>
                <p className="text-[10px] text-muted-foreground mb-2 truncate">
                  {t.name}
                </p>
                <p className="text-sm font-mono tabular-nums">
                  ${t.price.toFixed(2)}
                </p>
                <p
                  className={cn(
                    "text-[11px] font-mono tabular-nums mt-0.5",
                    t.change >= 0 ? "text-emerald-500" : "text-red-500",
                  )}
                >
                  {t.change >= 0 ? "+" : ""}
                  {t.change.toFixed(2)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* ── HERO: Portfolio Value ── */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-1.5">
              Total Portfolio Value
            </p>
            <p className="text-4xl font-serif font-light tabular-nums tracking-tight">
              {formatCurrency(portfolioValue)}
            </p>
          </div>
          <ExportMenu />
        </div>

        {/* Day change + Total return line */}
        <div className="flex items-center gap-3 mt-1">
          <span
            className={cn(
              "text-sm font-mono tabular-nums font-medium",
              totalPnL >= 0 ? "text-emerald-500" : "text-red-500",
            )}
          >
            {totalPnL >= 0 ? "+" : ""}
            {formatCurrency(totalPnL)}
          </span>
          <span
            className={cn(
              "text-sm font-mono tabular-nums",
              totalPnLPct >= 0 ? "text-emerald-500/80" : "text-red-500/80",
            )}
          >
            ({totalPnLPct >= 0 ? "+" : ""}
            {totalPnLPct.toFixed(2)}%)
          </span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
            all time
          </span>
        </div>

        {/* Quick stats row */}
        {hasTrades && (
          <div className="flex items-center gap-4 mt-3 text-[11px] font-mono tabular-nums text-muted-foreground">
            <span>
              Cash{" "}
              <span className="text-foreground/70">
                {formatCurrency(cash)}
              </span>
            </span>
            <span>
              Win rate{" "}
              <span className="text-foreground/70">
                {stats.winRate.toFixed(0)}%
              </span>
            </span>
            <span>
              Sharpe{" "}
              <span className="text-foreground/70">
                {stats.sharpe.toFixed(2)}
              </span>
            </span>
            <span>
              Max DD{" "}
              <span className="text-foreground/70">
                -{stats.maxDrawdown.toFixed(1)}%
              </span>
            </span>
            <span>
              Trades{" "}
              <span className="text-foreground/70">{stats.totalTrades}</span>
            </span>
          </div>
        )}
      </div>

      {/* ── TABS ── */}
      <div className="px-6 pb-6 flex-1">
        <Tabs defaultValue="overview">
          <div className="mb-3">
            <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
              {["overview", "holdings", "performance", "analytics"].map(
                (tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground capitalize"
                  >
                    {tab}
                  </TabsTrigger>
                ),
              )}
            </TabsList>
          </div>

          {/* ── Overview tab ── */}
          <TabsContent value="overview" className="space-y-6 mt-0 pt-4">
            {/* Equity curve — contained */}
            {hasTrades && (
              <div className="bg-card rounded-lg border border-border p-5">
                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-3">
                  Equity Curve
                </p>
                <div className="h-[240px]">
                  <EquityCurve />
                </div>
              </div>
            )}

            <LivePnLDashboard />

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <div className="bg-card rounded-lg border border-border p-5 sm:col-span-3">
                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-3">
                  Win Rate (Rolling 10)
                </p>
                <div className="h-[160px]">
                  <WinRateChart />
                </div>
              </div>
              <div className="bg-card rounded-lg border border-border p-5 sm:col-span-2">
                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-3">
                  Trade Calendar
                </p>
                <div className="h-[160px]">
                  <TradeCalendar />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-5">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-3">
                Portfolio Attribution
              </p>
              <PortfolioAttribution />
            </div>

            <div className="bg-card rounded-lg border border-border p-5">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-3">
                Performance Metrics
              </p>
              <PerformanceMetrics />
            </div>

            <WeeklyReview />
          </TabsContent>

          {/* ── Holdings tab ── */}
          <TabsContent value="holdings" className="mt-0 pt-4">
            {hasPositions ? (
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                      <th className="text-left py-2.5 px-3">Ticker</th>
                      <th className="text-right py-2.5 px-3">Shares</th>
                      <th className="text-right py-2.5 px-3">Avg Cost</th>
                      <th className="text-right py-2.5 px-3">Price</th>
                      <th className="text-right py-2.5 px-3">P&L</th>
                      <th className="text-right py-2.5 px-3">Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((h, i) => (
                      <tr
                        key={h.ticker}
                        className={cn(
                          "border-b border-border hover:bg-foreground/[0.02] transition-colors",
                          i % 2 === 1 && "bg-muted/10",
                        )}
                      >
                        <td className="py-2.5 px-3 font-medium">{h.ticker}</td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                          {h.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                          {formatCurrency(h.avgPrice)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                          {formatCurrency(h.currentPrice)}
                        </td>
                        <td
                          className={cn(
                            "py-2.5 px-3 text-right font-mono tabular-nums font-medium",
                            h.unrealizedPnL >= 0
                              ? "text-emerald-500"
                              : "text-red-500",
                          )}
                        >
                          {h.unrealizedPnL >= 0 ? "+" : ""}
                          {formatCurrency(h.unrealizedPnL)}
                          <span className="text-[10px] ml-1 opacity-60">
                            {h.unrealizedPnLPercent >= 0 ? "+" : ""}
                            {h.unrealizedPnLPercent.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-muted-foreground">
                          {h.weight.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border bg-muted/20 text-[11px] font-medium">
                      <td className="py-2.5 px-3 text-muted-foreground">
                        {holdings.length} position{holdings.length !== 1 && "s"}
                      </td>
                      <td />
                      <td />
                      <td />
                      <td
                        className={cn(
                          "py-2.5 px-3 text-right font-mono tabular-nums",
                          totalPnL >= 0 ? "text-emerald-500" : "text-red-500",
                        )}
                      >
                        {totalPnL >= 0 ? "+" : ""}
                        {formatCurrency(
                          holdings.reduce((s, h) => s + h.unrealizedPnL, 0),
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-muted-foreground">
                        100%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="bg-card rounded-lg border border-border p-8 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  No open positions
                </p>
                <Link
                  href="/trade"
                  className="text-sm font-medium text-foreground hover:underline inline-flex items-center gap-1"
                >
                  Open a trade to get started
                </Link>
              </div>
            )}

            {/* Trade journal below holdings */}
            {hasTrades && (
              <div className="mt-6 bg-card rounded-lg border border-border p-5">
                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-3">
                  Trade Journal
                </p>
                <TradeJournal />
              </div>
            )}

            {/* Rebalancing & tax tools */}
            {hasPositions && (
              <div className="mt-6 space-y-4">
                <div className="bg-card rounded-lg border border-border p-5">
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-3">
                    Rebalancing
                  </p>
                  <RebalancingPanel />
                </div>
                <div className="bg-card rounded-lg border border-border p-5">
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-3">
                    Tax Loss Harvesting
                  </p>
                  <TaxHarvestingPanel />
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── Performance tab ── */}
          <TabsContent value="performance" className="space-y-6 mt-0 pt-4">
            <div className="bg-card rounded-lg border border-border p-5">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-3">
                Quantitative Dashboard
              </p>
              <QuantDashboard />
            </div>

            <div className="bg-card rounded-lg border border-border p-5">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-3">
                Rolling Sharpe Ratio (30-trade)
              </p>
              <div className="h-[200px]">
                <RollingSharpeChart />
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-5">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-3">
                Rolling Win Rate (20-trade)
              </p>
              <div className="h-[200px]">
                <RollingWinRateChart />
              </div>
            </div>

            {/* Optimizer tools */}
            <div className="bg-card rounded-lg border border-border p-5">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-3">
                MPT Optimizer
              </p>
              <PortfolioOptimizer />
            </div>

            <div className="bg-card rounded-lg border border-border p-5">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-3">
                Efficient Frontier
              </p>
              <EfficientFrontier />
            </div>

            <div className="bg-card rounded-lg border border-border p-5">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-3">
                Dividend Income Tracker
              </p>
              <DividendTracker />
            </div>

            <div className="bg-card rounded-lg border border-border p-5">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-3">
                Stress Testing
              </p>
              <StressTester />
            </div>

            <div className="bg-card rounded-lg border border-border p-5">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-3">
                Black-Litterman Optimizer
              </p>
              <BlackLitterman />
            </div>

            <div className="bg-card rounded-lg border border-border p-5">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-3">
                Rebalancing Tool
              </p>
              <RebalancingTool />
            </div>
          </TabsContent>

          {/* ── Analytics tab ── */}
          <TabsContent value="analytics" className="space-y-6 mt-0 pt-4">
            <AdvancedAnalytics />

            <AttributionAnalysis />

            <div className="bg-card rounded-lg border border-border p-5">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-3">
                Win/Loss Distribution
              </p>
              <div className="h-[200px]">
                <WinLossDistribution />
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-5">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-3">
                Holding Period Analysis
              </p>
              <div className="h-[200px]">
                <HoldingPeriodAnalysis />
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-5">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-3">
                Day-of-Week Heatmap
              </p>
              <TradeHeatmap />
            </div>

            <div className="bg-card rounded-lg border border-border p-5">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-3">
                MAE/MFE Scatter
              </p>
              <div className="h-[200px]">
                <MAEMFEScatter />
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-5">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-3">
                Streak Analysis
              </p>
              <StreakAnalysis />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
