"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Star,
  ThumbsUp,
  Dumbbell,
  Save,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  ShieldAlert,
  Clock,
  DollarSign,
  LineChart,
  Dice5,
  List,
  GitCompare,
} from "lucide-react";
import {
  createChart,
  type UTCTimestamp,
  AreaSeries,
  ColorType,
} from "lightweight-charts";
import type { BacktestResult, MonteCarloResult } from "@/types/backtest";
import AnalyticsPanel from "./AnalyticsPanel";
import MonteCarloPanel from "./MonteCarloPanel";
import TradeDistributionChart from "./TradeDistributionChart";
import AnnualReturnsChart from "./AnnualReturnsChart";
import StrategyComparison from "./StrategyComparison";
import RiskReturnScatter from "./RiskReturnScatter";

const GRADE_CONFIG = {
  S: { color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30", icon: Trophy, label: "Outstanding!" },
  A: { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30", icon: Star, label: "Excellent!" },
  B: { color: "text-primary", bg: "bg-primary/10", border: "border-primary/30", icon: ThumbsUp, label: "Good job!" },
  C: { color: "text-muted-foreground", bg: "bg-muted/50", border: "border-border/20", icon: Dumbbell, label: "Keep trying!" },
} as const;

type Tab = "overview" | "analytics" | "montecarlo" | "trades" | "compare";

interface ResultsPanelProps {
  result: BacktestResult;
  monteCarloResult: MonteCarloResult | null;
  xpEarned: number;
  onSave: () => void;
  onRerun: () => void;
}

export default function ResultsPanel({ result, monteCarloResult, xpEarned, onSave, onRerun }: ResultsPanelProps) {
  const [tab, setTab] = useState<Tab>("overview");
  const { metrics, grade, trades, equityCurve } = result;
  const config = GRADE_CONFIG[grade];
  const GradeIcon = config.icon;

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <BarChart3 className="h-3 w-3" /> },
    { id: "analytics", label: "Analytics", icon: <LineChart className="h-3 w-3" /> },
    ...(monteCarloResult ? [{ id: "montecarlo" as Tab, label: "Monte Carlo", icon: <Dice5 className="h-3 w-3" /> }] : []),
    { id: "trades", label: "Trades", icon: <List className="h-3 w-3" /> },
    { id: "compare", label: "Compare", icon: <GitCompare className="h-3 w-3" /> },
  ];

  return (
    <div className="flex h-full flex-col bg-card/30">
      {/* Tab Bar */}
      <div className="flex border-b border-border/20">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-1 items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors ${
              tab === t.id
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === "overview" && (
          <div className="p-6">
            {/* ── Hero zone: Grade + Total Return — HERO card ─── */}
            <div className="flex items-start gap-5 border-l-4 border-l-primary rounded-lg bg-card p-4">
              {/* Grade badge — large and prominent */}
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12, stiffness: 200 }}
                className={`flex flex-col items-center gap-1 rounded-md border p-4 ${config.bg} ${config.border}`}
              >
                <GradeIcon className={`h-8 w-8 ${config.color}`} />
                <div className={`text-lg font-semibold ${config.color}`}>{grade}</div>
                <div className="text-[11px] text-muted-foreground">{config.label}</div>
                <div className="mt-1 rounded-full bg-primary/20 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                  +{xpEarned} XP
                </div>
              </motion.div>

              {/* Total return — the hero number */}
              <div className="flex-1 pt-1">
                <div className="text-[11px] font-medium text-muted-foreground">Total Return</div>
                <div className={`text-2xl font-semibold tracking-tight ${metrics.totalReturn >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {metrics.totalReturnPercent >= 0 ? "+" : ""}{metrics.totalReturnPercent.toFixed(1)}%
                </div>
                <div className={`text-xs font-medium ${metrics.totalReturn >= 0 ? "text-emerald-400/70" : "text-rose-400/70"}`}>
                  {metrics.totalReturn >= 0 ? "+" : ""}${metrics.totalReturn.toFixed(0)}
                </div>

                {/* Key metrics row — compact */}
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    Sharpe <span className={`font-semibold ${metrics.sharpeRatio > 0 ? "text-foreground" : "text-rose-400"}`}>{metrics.sharpeRatio.toFixed(2)}</span>
                  </span>
                  <span>
                    Win Rate <span className="font-semibold text-foreground">{metrics.winRate.toFixed(0)}%</span>
                  </span>
                  <span>
                    Max DD <span className="font-semibold text-rose-400">{metrics.maxDrawdownPercent.toFixed(1)}%</span>
                  </span>
                  <span>
                    Trades <span className="font-semibold text-foreground">{metrics.totalTrades}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* ── Equity Curve — prominent ──────────────────────── */}
            <div className="mt-8">
              <h3 className="mb-1.5 text-xs font-semibold text-muted-foreground">Equity Curve</h3>
              <EquityCurveChart equityCurve={equityCurve} startingCapital={result.config.startingCapital} height={160} />
            </div>

            {/* ── Detailed metrics grid — CONSOLE card ─────────── */}
            <div className="mt-8 rounded-lg bg-card border border-border/20 p-3">
              <h3 className="mb-2 text-[10px] font-semibold text-muted-foreground">Performance Metrics</h3>
              <div className="grid grid-cols-4 gap-2">
                <CompactMetric label="Profit Factor" value={metrics.profitFactor > 100 ? "\u221e" : metrics.profitFactor.toFixed(2)} positive={metrics.profitFactor > 1} />
                <CompactMetric label="Sortino" value={metrics.sortinoRatio.toFixed(2)} positive={metrics.sortinoRatio > 0} />
                <CompactMetric label="Avg Win" value={`$${metrics.avgWin.toFixed(0)}`} positive />
                <CompactMetric label="Avg Loss" value={`$${metrics.avgLoss.toFixed(0)}`} positive={false} />
                <CompactMetric label="Calmar" value={metrics.calmarRatio.toFixed(2)} positive={metrics.calmarRatio > 0.5} />
                <CompactMetric label="Omega" value={computeOmegaRatio(trades).toFixed(2)} positive={computeOmegaRatio(trades) > 1} />
                <CompactMetric label="Ulcer Idx" value={metrics.ulcerIndex.toFixed(2)} positive={metrics.ulcerIndex < 5} />
                <CompactMetric label="Max Loss Streak" value={`${metrics.consecutiveLosses}`} positive={metrics.consecutiveLosses < 4} />
              </div>
            </div>

            {/* ── Annual Returns ────────────────────────────────── */}
            <div className="mt-6">
              <h3 className="mb-1.5 text-xs font-semibold text-muted-foreground">Annual Returns vs SPY</h3>
              <AnnualReturnsChart result={result} />
            </div>

            {/* Disclaimer */}
            <p className="mt-6 text-center text-[10px] text-muted-foreground/70">
              Backtested on simulated data &mdash; past performance is not indicative of future results
            </p>
          </div>
        )}

        {tab === "analytics" && (
          <div>
            <AnalyticsPanel result={result} />
            <div className="space-y-4 px-4 pb-4">
              <div>
                <h3 className="mb-2 text-xs font-semibold text-muted-foreground">
                  Trade Return Distribution
                </h3>
                <TradeDistributionChart trades={result.trades} />
              </div>
              <div>
                <h3 className="mb-2 text-xs font-semibold text-muted-foreground">
                  Risk-Adjusted Scatter
                </h3>
                <RiskReturnScatter baseConfig={result.config} />
              </div>
            </div>
          </div>
        )}

        {tab === "montecarlo" && monteCarloResult && (
          <MonteCarloPanel result={monteCarloResult} startingCapital={result.config.startingCapital} />
        )}

        {tab === "trades" && (
          <div className="p-4 bg-transparent">
            <h3 className="mb-2 text-xs font-semibold text-muted-foreground">
              All Trades ({trades.length})
            </h3>
            {trades.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-muted-foreground">
                  <thead>
                    <tr className="border-b border-border/20 text-left text-muted-foreground">
                      <th className="pb-1.5 pr-3 font-medium">Entry</th>
                      <th className="pb-1.5 pr-3 font-medium">Exit</th>
                      <th className="pb-1.5 pr-3 font-medium">Bars</th>
                      <th className="pb-1.5 pr-3 font-medium">Reason</th>
                      <th className="pb-1.5 pr-3 text-right font-medium">P&L</th>
                      <th className="pb-1.5 pr-3 text-right font-medium">MAE</th>
                      <th className="pb-1.5 text-right font-medium">MFE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((t) => (
                      <tr key={t.id} className="border-b border-border/20">
                        <td className="py-1.5 pr-3 text-muted-foreground">${t.entryPrice.toFixed(2)}</td>
                        <td className="py-1.5 pr-3 text-muted-foreground">${t.exitPrice.toFixed(2)}</td>
                        <td className="py-1.5 pr-3 text-muted-foreground">{t.holdingBars}</td>
                        <td className="py-1.5 pr-3 text-muted-foreground">{t.exitReason}</td>
                        <td className={`py-1.5 pr-3 text-right font-mono font-semibold ${t.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}
                        </td>
                        <td className="py-1.5 pr-3 text-right text-rose-400/70">-{t.mae.toFixed(1)}%</td>
                        <td className="py-1.5 text-right text-emerald-400/70">+{t.mfe.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-muted-foreground/70">No trades executed</div>
            )}
          </div>
        )}

        {tab === "compare" && (
          <div className="space-y-4 p-4">
            <div>
              <h3 className="mb-0.5 text-xs font-semibold text-foreground">Strategy Comparison</h3>
              <p className="mb-3 text-xs text-muted-foreground">RSI-7 / RSI-14 / RSI-21 on identical market data</p>
              <StrategyComparison baseConfig={result.config} />
            </div>
          </div>
        )}
      </div>

      {/* Actions (always visible) */}
      <div className="flex gap-2 border-t border-border/20 p-3">
        <button onClick={onSave} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20">
          <Save className="h-3.5 w-3.5" /> Save
        </button>
        <button onClick={onRerun} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border/20 bg-muted/50 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted">
          <RefreshCw className="h-3.5 w-3.5" /> Rerun
        </button>
      </div>
    </div>
  );
}

// ── Derived metric helpers ──────────────────────────────────────────────────

function computeOmegaRatio(trades: { pnl: number }[]): number {
  const gains = trades.filter((t) => t.pnl > 0).reduce((s, t) => s + t.pnl, 0);
  const losses = Math.abs(trades.filter((t) => t.pnl <= 0).reduce((s, t) => s + t.pnl, 0));
  return losses > 0 ? gains / losses : gains > 0 ? 999 : 0;
}

// ── CompactMetric ─────────────────────────────────────────────────────────

function CompactMetric({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="rounded-lg border border-border/20 bg-card/40 px-2.5 py-2">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className={`text-xs font-semibold ${positive === undefined ? "text-foreground" : positive ? "text-emerald-400" : "text-rose-400"}`}>
        {value}
      </div>
    </div>
  );
}

// ── Equity Curve Chart ────────────────────────────────────────────────────

function EquityCurveChart({ equityCurve, startingCapital, height = 100 }: { equityCurve: { bar: number; value: number }[]; startingCapital: number; height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || equityCurve.length === 0) return;

    const chart = createChart(containerRef.current, {
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: "#6b7280", fontFamily: "Inter, sans-serif", fontSize: 9 },
      grid: { vertLines: { visible: false }, horzLines: { color: "#1e293b" } },
      timeScale: { visible: false },
      rightPriceScale: { borderColor: "#1e293b" },
      width: containerRef.current.clientWidth,
      height,
      handleScale: false,
      handleScroll: false,
    });

    const finalValue = equityCurve[equityCurve.length - 1]?.value ?? startingCapital;
    const isProfit = finalValue >= startingCapital;

    const series = chart.addSeries(AreaSeries, {
      lineColor: isProfit ? "#10b981" : "#ef4444",
      topColor: isProfit ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)",
      bottomColor: isProfit ? "rgba(16,185,129,0.02)" : "rgba(239,68,68,0.02)",
      lineWidth: 2,
    });

    const baseTime = Math.floor(Date.now() / 1000) - equityCurve.length * 86400;
    series.setData(equityCurve.map((pt) => ({ time: (baseTime + pt.bar * 86400) as UTCTimestamp, value: pt.value })));
    chart.timeScale().fitContent();

    const observer = new ResizeObserver((entries) => { chart.applyOptions({ width: entries[0].contentRect.width }); });
    observer.observe(containerRef.current);
    return () => { observer.disconnect(); chart.remove(); };
  }, [equityCurve, startingCapital, height]);

  return <div ref={containerRef} className="w-full rounded-lg" style={{ height }} />;
}
