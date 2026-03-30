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
import { PortfolioHeatmap } from "@/components/trading/PortfolioHeatmap";

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
 <div className="max-w-3xl mx-auto w-full px-6 py-8 space-y-6">
 {/* Hero — starting balance */}
 <div className="text-center py-4">
 <p className="text-[11px] font-mono text-muted-foreground/40 uppercase tracking-widest mb-3">
 Portfolio Value
 </p>
 <p className="text-[18px] font-semibold tabular-nums tracking-tight">
 $100,000.00
 </p>
 <p className="text-xs text-muted-foreground mt-2">
 Starting balance &middot; Simulated
 </p>
 </div>

 {/* Getting Started */}
 <div className="rounded-lg border border-border/30 bg-card/50 overflow-hidden">
 <div className="px-4 py-3 border-b border-border/20">
 <h2 className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/40">Getting Started</h2>
 </div>
 <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
 {[
 { href: "/trade", title: "Make your first trade", desc: "Buy and sell stocks with simulated capital. Track your P&L in real time." },
 { href: "/learn", title: "Learn the basics", desc: "Interactive lessons on markets, indicators, and portfolio management." },
 { href: "/backtest", title: "Explore strategies", desc: "Backtest trading strategies against historical data before risking capital." },
 ].map((card) => (
 <Link
 key={card.href}
 href={card.href}
 className="group block bg-background/50 rounded-lg border border-border/30 p-4 hover:bg-muted/30 transition-colors"
 >
 <p className="text-sm font-medium mb-1 group-hover:text-foreground transition-colors">
 {card.title}
 </p>
 <p className="text-xs text-muted-foreground leading-relaxed">
 {card.desc}
 </p>
 </Link>
 ))}
 </div>
 </div>

 {/* Market Overview */}
 <div className="rounded-lg border border-border/30 bg-card/50 overflow-hidden">
 <div className="px-4 py-3 border-b border-border/20">
 <h2 className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/40">Market Overview</h2>
 </div>
 <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
 {marketTickers.map((t) => (
 <div
 key={t.symbol}
 className="bg-background/50 rounded-lg border border-border/30 p-3"
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
 </div>
 );
 }

 return (
 <div className="flex h-full flex-col overflow-y-auto">
 <div className="max-w-3xl mx-auto w-full px-6 py-6 space-y-6">
 {/* ── HERO: Portfolio Value ── */}
 <div>
 <div className="flex items-start justify-between mb-1">
 <div>
 <p className="text-[11px] font-mono text-muted-foreground/40 uppercase tracking-widest mb-2">
 Total Portfolio Value
 </p>
 <p className="text-[18px] font-semibold tabular-nums tracking-tight">
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
 <span className="text-[11px] font-mono text-muted-foreground/50 uppercase tracking-widest">
 all time
 </span>
 </div>
 </div>

 {/* Quick stats row */}
 {hasTrades && (
 <div className="rounded-lg border border-border/30 bg-card/50 overflow-hidden">
 <div className="px-4 py-3 border-b border-border/20">
 <h2 className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/40">Performance Summary</h2>
 </div>
 <div className="px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] font-mono tabular-nums text-muted-foreground/60">
 <span>Cash <span className="text-foreground/70">{formatCurrency(cash)}</span></span>
 <span className="text-border/30">|</span>
 <span>Win rate <span className="text-foreground/70">{stats.winRate.toFixed(0)}%</span></span>
 <span className="text-border/30">|</span>
 <span>Sharpe <span className="text-foreground/70">{stats.sharpe.toFixed(2)}</span></span>
 <span className="text-border/30">|</span>
 <span>Max DD <span className="text-foreground/70">-{stats.maxDrawdown.toFixed(1)}%</span></span>
 <span className="text-border/30">|</span>
 <span>Trades <span className="text-foreground/70">{stats.totalTrades}</span></span>
 </div>
 </div>
 )}

 {/* ── TABS ── */}
 <div>
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
 <div className="h-48">
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
 <div className="h-36">
 <WinRateChart />
 </div>
 </div>
 <div className="bg-card rounded-lg border border-border p-5 sm:col-span-2">
 <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-3">
 Trade Calendar
 </p>
 <div className="h-36">
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
 <TabsContent value="holdings" className="mt-0 pt-4 space-y-4">
 {/* Positions table */}
 <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
 <div className="px-5 py-3 border-b border-border/10 flex items-center justify-between">
 <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/35">Open Positions</p>
 <p className="text-[9px] font-mono text-muted-foreground/25">{positions.length} position{positions.length !== 1 && "s"}</p>
 </div>
 {positions.length === 0 ? (
 <div className="flex flex-col items-center justify-center h-24 gap-2">
 <p className="text-[10px] font-mono text-muted-foreground/25 uppercase tracking-wider">No open positions</p>
 <Link href="/trade" className="text-[10px] font-mono text-muted-foreground/40 hover:text-muted-foreground/60 uppercase tracking-wider transition-colors">
 Go to trade
 </Link>
 </div>
 ) : (
 <table className="w-full">
 <thead>
 <tr className="border-b border-border/10">
 {["Ticker", "Qty", "Avg Entry", "Current", "P&L", "%", "Weight"].map((col) => (
 <th key={col} className="px-4 py-2 text-left text-[8px] font-mono uppercase tracking-[0.15em] text-muted-foreground/30">{col}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {holdings.map((h) => (
 <tr key={h.ticker} className="border-b border-border/[0.06] hover:bg-foreground/[0.015] transition-colors">
 <td className="px-4 py-2.5 text-[11px] font-semibold">{h.ticker}</td>
 <td className="px-4 py-2.5 text-[11px] font-mono tabular-nums text-foreground/70">{h.quantity}</td>
 <td className="px-4 py-2.5 text-[11px] font-mono tabular-nums text-foreground/70">{formatCurrency(h.avgPrice)}</td>
 <td className="px-4 py-2.5 text-[11px] font-mono tabular-nums text-foreground/70">{formatCurrency(h.currentPrice)}</td>
 <td className={cn(
 "px-4 py-2.5 text-[11px] font-mono tabular-nums font-medium",
 h.unrealizedPnL >= 0 ? "text-emerald-500" : "text-red-500",
 )}>
 {h.unrealizedPnL >= 0 ? "+" : ""}{formatCurrency(h.unrealizedPnL)}
 </td>
 <td className={cn(
 "px-4 py-2.5 text-[11px] font-mono tabular-nums",
 h.unrealizedPnLPercent >= 0 ? "text-emerald-500/70" : "text-red-500/70",
 )}>
 {h.unrealizedPnLPercent >= 0 ? "+" : ""}{h.unrealizedPnLPercent.toFixed(1)}%
 </td>
 <td className="px-4 py-2.5 text-[11px] font-mono tabular-nums text-muted-foreground/50">{h.weight.toFixed(1)}%</td>
 </tr>
 ))}
 </tbody>
 <tfoot>
 <tr className="border-t border-border/10">
 <td className="px-4 py-2.5 text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground/30" colSpan={3}>Total</td>
 <td />
 <td className={cn(
 "px-4 py-2.5 text-[11px] font-mono tabular-nums font-medium",
 holdings.reduce((s, h) => s + h.unrealizedPnL, 0) >= 0 ? "text-emerald-500" : "text-red-500",
 )}>
 {holdings.reduce((s, h) => s + h.unrealizedPnL, 0) >= 0 ? "+" : ""}
 {formatCurrency(holdings.reduce((s, h) => s + h.unrealizedPnL, 0))}
 </td>
 <td />
 <td className="px-4 py-2.5 text-[11px] font-mono tabular-nums text-muted-foreground/50">100%</td>
 </tr>
 </tfoot>
 </table>
 )}
 </div>

 {/* Portfolio Heatmap */}
 <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
 <div className="px-5 py-3 border-b border-border/10">
 <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/35">Portfolio Heatmap</p>
 </div>
 <div className="p-4">
 <PortfolioHeatmap />
 </div>
 </div>

 {/* Trade journal */}
 {hasTrades && (
 <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
 <div className="px-5 py-3 border-b border-border/10">
 <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/35">Trade Journal</p>
 </div>
 <div className="p-4">
 <TradeJournal />
 </div>
 </div>
 )}

 {/* Rebalancing & tax tools */}
 {hasPositions && (
 <>
 <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
 <div className="px-5 py-3 border-b border-border/10">
 <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/35">Rebalancing</p>
 </div>
 <div className="p-4">
 <RebalancingPanel />
 </div>
 </div>
 <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
 <div className="px-5 py-3 border-b border-border/10">
 <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/35">Tax Loss Harvesting</p>
 </div>
 <div className="p-4">
 <TaxHarvestingPanel />
 </div>
 </div>
 </>
 )}
 </TabsContent>

 {/* ── Performance tab ── */}
 <TabsContent value="performance" className="mt-0 pt-4 space-y-4">
 {/* Rolling charts side-by-side */}
 <div className="grid grid-cols-2 gap-4">
 <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
 <div className="px-4 py-2.5 border-b border-border/10">
 <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/35">Rolling Sharpe</p>
 </div>
 <div className="h-40">
 <RollingSharpeChart />
 </div>
 </div>
 <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
 <div className="px-4 py-2.5 border-b border-border/10">
 <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/35">Rolling Win Rate</p>
 </div>
 <div className="h-40">
 <RollingWinRateChart />
 </div>
 </div>
 </div>

 {/* Quant dashboard */}
 <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
 <div className="px-5 py-3 border-b border-border/10">
 <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/35">Quantitative Dashboard</p>
 </div>
 <div className="p-4">
 <QuantDashboard />
 </div>
 </div>

 {/* Performance metrics */}
 <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
 <div className="px-5 py-3 border-b border-border/10">
 <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/35">Performance Metrics</p>
 </div>
 <div className="p-4">
 <PerformanceMetrics />
 </div>
 </div>

 {/* Weekly review */}
 <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
 <div className="px-5 py-3 border-b border-border/10">
 <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/35">Weekly Review</p>
 </div>
 <div className="p-4">
 <WeeklyReview />
 </div>
 </div>

 {/* Optimizer tools — 2-col grid */}
 <div className="grid grid-cols-2 gap-4">
 <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
 <div className="px-4 py-2.5 border-b border-border/10">
 <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/35">MPT Optimizer</p>
 </div>
 <div className="p-4">
 <PortfolioOptimizer />
 </div>
 </div>
 <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
 <div className="px-4 py-2.5 border-b border-border/10">
 <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/35">Efficient Frontier</p>
 </div>
 <div className="p-4">
 <EfficientFrontier />
 </div>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
 <div className="px-4 py-2.5 border-b border-border/10">
 <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/35">Dividend Tracker</p>
 </div>
 <div className="p-4">
 <DividendTracker />
 </div>
 </div>
 <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
 <div className="px-4 py-2.5 border-b border-border/10">
 <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/35">Stress Testing</p>
 </div>
 <div className="p-4">
 <StressTester />
 </div>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
 <div className="px-4 py-2.5 border-b border-border/10">
 <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/35">Black-Litterman</p>
 </div>
 <div className="p-4">
 <BlackLitterman />
 </div>
 </div>
 <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
 <div className="px-4 py-2.5 border-b border-border/10">
 <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/35">Rebalancing Tool</p>
 </div>
 <div className="p-4">
 <RebalancingTool />
 </div>
 </div>
 </div>
 </TabsContent>

 {/* ── Analytics tab ── */}
 <TabsContent value="analytics" className="mt-0 pt-4 space-y-4">
 {/* Advanced analytics */}
 <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
 <div className="px-5 py-3 border-b border-border/10">
 <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/35">Advanced Analytics</p>
 </div>
 <div className="p-4">
 <AdvancedAnalytics />
 </div>
 </div>

 {/* Attribution analysis */}
 <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
 <div className="px-5 py-3 border-b border-border/10">
 <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/35">Attribution Analysis</p>
 </div>
 <div className="p-4">
 <AttributionAnalysis />
 </div>
 </div>

 {/* Win/Loss + Holding Period — side-by-side */}
 <div className="grid grid-cols-2 gap-4">
 <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
 <div className="px-4 py-2.5 border-b border-border/10">
 <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/35">Win / Loss Distribution</p>
 </div>
 <div className="h-40">
 <WinLossDistribution />
 </div>
 </div>
 <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
 <div className="px-4 py-2.5 border-b border-border/10">
 <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/35">Holding Period</p>
 </div>
 <div className="h-40">
 <HoldingPeriodAnalysis />
 </div>
 </div>
 </div>

 {/* Trade Heatmap — full-width */}
 <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
 <div className="px-5 py-3 border-b border-border/10">
 <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/35">Day-of-Week Heatmap</p>
 </div>
 <div className="p-4">
 <TradeHeatmap />
 </div>
 </div>

 {/* MAE/MFE + Streak — side-by-side */}
 <div className="grid grid-cols-2 gap-4">
 <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
 <div className="px-4 py-2.5 border-b border-border/10">
 <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/35">MAE / MFE Scatter</p>
 </div>
 <div className="h-48">
 <MAEMFEScatter />
 </div>
 </div>
 <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
 <div className="px-4 py-2.5 border-b border-border/10">
 <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/35">Streak Analysis</p>
 </div>
 <div className="p-4">
 <StreakAnalysis />
 </div>
 </div>
 </div>
 </TabsContent>
 </Tabs>
 </div>
 </div>
 </div>
 );
}
