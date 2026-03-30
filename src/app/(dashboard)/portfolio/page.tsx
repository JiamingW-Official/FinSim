"use client";

import { useMemo } from "react";
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

function ChartSkeleton({ height = "h-40" }: { height?: string }) {
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
  { ssr: false, loading: () => <ChartSkeleton height="h-36" /> },
);

const TradeCalendar = dynamic(
  () =>
    import("@/components/portfolio/TradeCalendar").then(
      (mod) => mod.TradeCalendar,
    ),
  { ssr: false, loading: () => <ChartSkeleton height="h-36" /> },
);

/* ── Reusable card with padded body ── */
function Card({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/20 bg-card/30 overflow-hidden",
        className,
      )}
    >
      <div className="px-5 py-3 border-b border-border/10">
        <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/35">
          {label}
        </p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ── Chart card — no inner padding so charts fill edge-to-edge ── */
function ChartCard({
  label,
  height,
  children,
  className,
}: {
  label: string;
  height: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/20 bg-card/30 overflow-hidden",
        className,
      )}
    >
      <div className="px-5 py-3 border-b border-border/10">
        <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/35">
          {label}
        </p>
      </div>
      <div className={height}>{children}</div>
    </div>
  );
}

const marketTickers = [
  { symbol: "AAPL", name: "Apple", price: 178.72, change: +1.34 },
  { symbol: "GOOGL", name: "Alphabet", price: 141.8, change: -0.56 },
  { symbol: "MSFT", name: "Microsoft", price: 378.91, change: +2.18 },
  { symbol: "AMZN", name: "Amazon", price: 178.25, change: +0.89 },
  { symbol: "TSLA", name: "Tesla", price: 175.34, change: -2.41 },
  { symbol: "SPY", name: "S&P 500 ETF", price: 511.42, change: +1.07 },
];

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

  /* ── EMPTY STATE ── */
  if (!hasTrades && !hasPositions) {
    return (
      <div className="flex h-full flex-col overflow-y-auto">
        <div className="max-w-5xl mx-auto w-full px-8 py-8">
          {/* Hero */}
          <div className="mb-10 pb-8 border-b border-border/30">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/40 mb-4">
              Portfolio
            </p>
            <h1 className="text-3xl font-semibold tabular-nums text-foreground">
              $100,000.00
            </h1>
            <p className="text-sm text-muted-foreground/50 mt-1">
              Starting balance &middot; Simulated
            </p>
          </div>

          {/* Getting Started */}
          <div className="mb-6">
            <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/35 mb-4">
              Getting Started
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  href: "/trade",
                  title: "Make your first trade",
                  desc: "Buy and sell stocks with simulated capital. Track your P&L in real time.",
                },
                {
                  href: "/learn",
                  title: "Learn the basics",
                  desc: "Interactive lessons on markets, indicators, and portfolio management.",
                },
                {
                  href: "/backtest",
                  title: "Explore strategies",
                  desc: "Backtest trading strategies against historical data before risking capital.",
                },
              ].map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group block rounded-xl border border-border/20 bg-card/30 p-5 hover:border-border/40 hover:bg-card/50 transition-all duration-200"
                >
                  <p className="text-sm font-semibold mb-2 text-foreground/80 group-hover:text-foreground transition-colors">
                    {card.title}
                  </p>
                  <p className="text-xs text-muted-foreground/50 leading-relaxed">
                    {card.desc}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Market Overview */}
          <ChartCard label="Market Overview" height="">
            <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {marketTickers.map((t) => (
                <div
                  key={t.symbol}
                  className="rounded-lg border border-border/15 bg-background/30 p-3"
                >
                  <p className="text-xs font-semibold text-foreground/80">
                    {t.symbol}
                  </p>
                  <p className="text-[10px] text-muted-foreground/40 mb-2 truncate">
                    {t.name}
                  </p>
                  <p className="text-sm font-semibold tabular-nums text-foreground/90">
                    ${t.price.toFixed(2)}
                  </p>
                  <p
                    className={cn(
                      "text-[11px] font-mono tabular-nums mt-0.5",
                      t.change >= 0
                        ? "text-emerald-400/80"
                        : "text-rose-400/70",
                    )}
                  >
                    {t.change >= 0 ? "+" : ""}
                    {t.change.toFixed(2)}%
                  </p>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>
    );
  }

  /* ── Stats bar items ── */
  const statItems = [
    {
      label: "Cash",
      value: formatCurrency(cash),
      color: "text-foreground/80",
    },
    {
      label: "Win Rate",
      value: `${stats.winRate.toFixed(0)}%`,
      color:
        stats.winRate >= 50 ? "text-emerald-400/80" : "text-rose-400/70",
    },
    {
      label: "Sharpe",
      value: stats.sharpe.toFixed(2),
      color:
        stats.sharpe >= 1
          ? "text-emerald-400/80"
          : stats.sharpe >= 0
            ? "text-foreground/70"
            : "text-rose-400/70",
    },
    {
      label: "Max DD",
      value: `-${stats.maxDrawdown.toFixed(1)}%`,
      color:
        stats.maxDrawdown > 20 ? "text-rose-400/70" : "text-foreground/70",
    },
    {
      label: "Trades",
      value: String(stats.totalTrades),
      color: "text-foreground/80",
    },
  ];

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full px-8 py-8">

        {/* ── HERO ── */}
        <div className="mb-8">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/40 mb-1">
            Portfolio
          </p>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-semibold tabular-nums text-foreground">
                {formatCurrency(portfolioValue)}
              </h1>
              <p
                className={cn(
                  "text-sm tabular-nums mt-0.5",
                  totalPnL >= 0 ? "text-emerald-400/80" : "text-rose-400/70",
                )}
              >
                {totalPnL >= 0 ? "+" : ""}
                {formatCurrency(totalPnL)}{" "}
                <span className="opacity-70">
                  ({totalPnLPct >= 0 ? "+" : ""}
                  {totalPnLPct.toFixed(2)}%) all time
                </span>
              </p>
            </div>
            <ExportMenu />
          </div>
        </div>

        {/* ── STATS BAR ── */}
        {hasTrades && (
          <div className="grid grid-cols-5 divide-x divide-border/20 rounded-xl border border-border/20 bg-card/30 mb-6">
            {statItems.map((s) => (
              <div key={s.label} className="px-4 py-3">
                <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground/35 mb-1">
                  {s.label}
                </p>
                <p className={cn("text-sm font-semibold tabular-nums", s.color)}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── TABS ── */}
        <Tabs defaultValue="overview">
          <TabsList className="bg-transparent border-b border-border/20 rounded-none p-0 h-auto mb-6 gap-0 justify-start w-full">
            {["overview", "holdings", "performance", "analytics"].map(
              (tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="text-[10px] font-mono uppercase tracking-wider px-0 py-2 mr-6 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground/60 data-[state=active]:text-foreground/80 data-[state=inactive]:text-muted-foreground/35 data-[state=active]:bg-transparent data-[state=active]:shadow-none capitalize"
                >
                  {tab}
                </TabsTrigger>
              ),
            )}
          </TabsList>

          {/* ── Overview ── */}
          <TabsContent value="overview" className="space-y-5 mt-0">
            {hasTrades && (
              <ChartCard label="Equity Curve" height="h-52 p-1">
                <EquityCurve />
              </ChartCard>
            )}

            <LivePnLDashboard />

            <div className="grid grid-cols-2 gap-4">
              <ChartCard label="Win Rate (Rolling 10)" height="h-36">
                <WinRateChart />
              </ChartCard>
              <ChartCard label="Trade Calendar" height="h-36">
                <TradeCalendar />
              </ChartCard>
            </div>

            <Card label="Portfolio Attribution">
              <PortfolioAttribution />
            </Card>

            <Card label="Performance Metrics">
              <PerformanceMetrics />
            </Card>

            <WeeklyReview />
          </TabsContent>

          {/* ── Holdings ── */}
          <TabsContent value="holdings" className="mt-0 space-y-5">
            {hasPositions ? (
              <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
                <div className="px-5 py-3 border-b border-border/10">
                  <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/35">
                    Open Positions
                  </p>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/15 bg-muted/20">
                      {[
                        ["Ticker", "left"],
                        ["Shares", "right"],
                        ["Avg Cost", "right"],
                        ["Price", "right"],
                        ["P&L", "right"],
                        ["Weight", "right"],
                      ].map(([col, align]) => (
                        <th
                          key={col}
                          className={cn(
                            "py-2.5 px-5 text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground/35 font-normal",
                            align === "right" ? "text-right" : "text-left",
                          )}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((h, i) => (
                      <tr
                        key={h.ticker}
                        className={cn(
                          "border-b border-border/10 hover:bg-foreground/[0.015] transition-colors",
                          i % 2 === 1 && "bg-muted/5",
                        )}
                      >
                        <td className="py-3 px-5 font-semibold text-foreground/80">
                          {h.ticker}
                        </td>
                        <td className="py-3 px-5 text-right font-mono tabular-nums text-foreground/60">
                          {h.quantity}
                        </td>
                        <td className="py-3 px-5 text-right font-mono tabular-nums text-foreground/60">
                          {formatCurrency(h.avgPrice)}
                        </td>
                        <td className="py-3 px-5 text-right font-mono tabular-nums text-foreground/80">
                          {formatCurrency(h.currentPrice)}
                        </td>
                        <td
                          className={cn(
                            "py-3 px-5 text-right font-mono tabular-nums font-medium",
                            h.unrealizedPnL >= 0
                              ? "text-emerald-400/80"
                              : "text-rose-400/70",
                          )}
                        >
                          {h.unrealizedPnL >= 0 ? "+" : ""}
                          {formatCurrency(h.unrealizedPnL)}
                          <span className="text-[10px] ml-1 opacity-60">
                            {h.unrealizedPnLPercent >= 0 ? "+" : ""}
                            {h.unrealizedPnLPercent.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-5 text-right font-mono tabular-nums text-muted-foreground/40">
                          {h.weight.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border/20 bg-muted/10">
                      <td className="py-3 px-5 text-[10px] font-mono text-muted-foreground/35">
                        {holdings.length} position
                        {holdings.length !== 1 && "s"}
                      </td>
                      <td />
                      <td />
                      <td />
                      <td
                        className={cn(
                          "py-3 px-5 text-right font-mono tabular-nums font-semibold text-sm",
                          totalPnL >= 0
                            ? "text-emerald-400/80"
                            : "text-rose-400/70",
                        )}
                      >
                        {totalPnL >= 0 ? "+" : ""}
                        {formatCurrency(
                          holdings.reduce((s, h) => s + h.unrealizedPnL, 0),
                        )}
                      </td>
                      <td className="py-3 px-5 text-right font-mono tabular-nums text-muted-foreground/35">
                        100%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-border/20 bg-card/30 p-12 text-center">
                <p className="text-sm text-muted-foreground/50 mb-3">
                  No open positions
                </p>
                <Link
                  href="/trade"
                  className="text-sm font-semibold text-foreground/70 hover:text-foreground transition-colors"
                >
                  Open a trade to get started
                </Link>
              </div>
            )}

            {hasTrades && (
              <Card label="Trade Journal">
                <TradeJournal />
              </Card>
            )}

            {hasPositions && (
              <>
                <Card label="Rebalancing">
                  <RebalancingPanel />
                </Card>
                <Card label="Tax Loss Harvesting">
                  <TaxHarvestingPanel />
                </Card>
              </>
            )}
          </TabsContent>

          {/* ── Performance ── */}
          <TabsContent value="performance" className="space-y-5 mt-0">
            <Card label="Quantitative Dashboard">
              <QuantDashboard />
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <ChartCard label="Rolling Sharpe (30-trade)" height="h-44">
                <RollingSharpeChart />
              </ChartCard>
              <ChartCard label="Rolling Win Rate (20-trade)" height="h-44">
                <RollingWinRateChart />
              </ChartCard>
            </div>

            <Card label="MPT Optimizer">
              <PortfolioOptimizer />
            </Card>

            <Card label="Efficient Frontier">
              <EfficientFrontier />
            </Card>

            <Card label="Dividend Income Tracker">
              <DividendTracker />
            </Card>

            <Card label="Stress Testing">
              <StressTester />
            </Card>

            <Card label="Black-Litterman Optimizer">
              <BlackLitterman />
            </Card>

            <Card label="Rebalancing Tool">
              <RebalancingTool />
            </Card>
          </TabsContent>

          {/* ── Analytics ── */}
          <TabsContent value="analytics" className="space-y-5 mt-0">
            <AdvancedAnalytics />

            <AttributionAnalysis />

            <div className="grid grid-cols-2 gap-4">
              <ChartCard label="Win / Loss Distribution" height="h-44">
                <WinLossDistribution />
              </ChartCard>
              <ChartCard label="Holding Period Analysis" height="h-44">
                <HoldingPeriodAnalysis />
              </ChartCard>
            </div>

            <Card label="Day-of-Week Heatmap">
              <TradeHeatmap />
            </Card>

            <ChartCard label="MAE / MFE Scatter" height="h-44">
              <MAEMFEScatter />
            </ChartCard>

            <Card label="Streak Analysis">
              <StreakAnalysis />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
