"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
} from "lucide-react";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
  AreaSeries,
  ColorType,
} from "lightweight-charts";
import type { BacktestResult, MonteCarloResult } from "@/types/backtest";
import AnalyticsPanel from "./AnalyticsPanel";
import MonteCarloPanel from "./MonteCarloPanel";

const GRADE_CONFIG = {
  S: { color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30", glow: "shadow-[0_0_40px_rgba(251,191,36,0.3)]", icon: Trophy, label: "Outstanding!" },
  A: { color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/30", glow: "shadow-[0_0_30px_rgba(52,211,153,0.2)]", icon: Star, label: "Excellent!" },
  B: { color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/30", glow: "", icon: ThumbsUp, label: "Good job!" },
  C: { color: "text-zinc-400", bg: "bg-zinc-400/10", border: "border-zinc-400/30", glow: "", icon: Dumbbell, label: "Keep trying!" },
} as const;

type Tab = "overview" | "analytics" | "montecarlo" | "trades";

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

  const TABS = useMemo<{ id: Tab; label: string; icon: React.ReactNode }[]>(() => [
    { id: "overview", label: "Overview", icon: <BarChart3 className="h-3 w-3" /> },
    { id: "analytics", label: "Analytics", icon: <LineChart className="h-3 w-3" /> },
    ...(monteCarloResult ? [{ id: "montecarlo" as Tab, label: "Monte Carlo", icon: <Dice5 className="h-3 w-3" /> }] : []),
    { id: "trades", label: "Trades", icon: <List className="h-3 w-3" /> },
  ], []);

  return (
    <div className="flex h-full w-[360px] flex-col border-l border-white/5 bg-black/20">
      {/* Tab Bar */}
      <div className="flex border-b border-white/5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-1 items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-all ${
              tab === t.id
                ? "border-b-2 border-violet-500 text-violet-300"
                : "text-zinc-500 hover:text-zinc-300"
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
          <div className="space-y-3 p-4">
            {/* Grade Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12, stiffness: 200 }}
              className={`grade-reveal flex flex-col items-center gap-2 rounded-xl border p-4 ${config.bg} ${config.border} ${config.glow}`}
            >
              <GradeIcon className={`h-8 w-8 ${config.color}`} />
              <div className={`text-3xl font-black ${config.color}`}>{grade}</div>
              <div className="text-xs text-zinc-400">{config.label}</div>
              <div className="mt-1 rounded-full bg-violet-500/20 px-3 py-1 text-xs font-semibold text-violet-300">
                +{xpEarned} XP
              </div>
            </motion.div>

            {/* Core Metrics */}
            <div className="grid grid-cols-2 gap-2">
              <MetricCard icon={<TrendingUp className="h-3.5 w-3.5" />} label="Total Return" value={`${metrics.totalReturn >= 0 ? "+" : ""}$${metrics.totalReturn.toFixed(0)}`} sub={`${metrics.totalReturnPercent >= 0 ? "+" : ""}${metrics.totalReturnPercent.toFixed(1)}%`} positive={metrics.totalReturn >= 0} />
              <MetricCard icon={<Target className="h-3.5 w-3.5" />} label="Win Rate" value={`${metrics.winRate.toFixed(0)}%`} sub={`${metrics.totalTrades} trades`} />
              <MetricCard icon={<BarChart3 className="h-3.5 w-3.5" />} label="Profit Factor" value={metrics.profitFactor > 100 ? "∞" : metrics.profitFactor.toFixed(2)} positive={metrics.profitFactor > 1} />
              <MetricCard icon={<ShieldAlert className="h-3.5 w-3.5" />} label="Max Drawdown" value={`${metrics.maxDrawdownPercent.toFixed(1)}%`} sub={`$${metrics.maxDrawdown.toFixed(0)}`} positive={false} />
              <MetricCard icon={<TrendingDown className="h-3.5 w-3.5" />} label="Sharpe" value={metrics.sharpeRatio.toFixed(2)} positive={metrics.sharpeRatio > 0} />
              <MetricCard icon={<Clock className="h-3.5 w-3.5" />} label="Sortino" value={metrics.sortinoRatio.toFixed(2)} positive={metrics.sortinoRatio > 0} />
              <MetricCard icon={<DollarSign className="h-3.5 w-3.5" />} label="Avg Win" value={`$${metrics.avgWin.toFixed(0)}`} positive />
              <MetricCard icon={<DollarSign className="h-3.5 w-3.5" />} label="Avg Loss" value={`$${metrics.avgLoss.toFixed(0)}`} positive={false} />
            </div>

            {/* Equity Curve */}
            <div className="space-y-1">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Equity Curve</h3>
              <MiniEquityCurve equityCurve={equityCurve} startingCapital={result.config.startingCapital} />
            </div>
          </div>
        )}

        {tab === "analytics" && <AnalyticsPanel result={result} />}

        {tab === "montecarlo" && monteCarloResult && (
          <MonteCarloPanel result={monteCarloResult} startingCapital={result.config.startingCapital} />
        )}

        {tab === "trades" && (
          <div className="space-y-1 p-4">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              All Trades ({trades.length})
            </h3>
            <div className="space-y-1">
              {trades.map((t) => (
                <div key={t.id} className="rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300">Bar {t.entryBar} → {t.exitBar}</span>
                    <span className={`font-mono font-semibold ${t.pnl >= 0 ? "text-green-400" : "text-rose-400"}`}>
                      {t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[10px] text-zinc-500">
                    <span>{t.exitReason}</span>
                    <span>{t.holdingBars} bars</span>
                    <span>${t.entryPrice.toFixed(2)} → ${t.exitPrice.toFixed(2)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[10px]">
                    <span className="text-rose-400/70">MAE -{t.mae.toFixed(1)}%</span>
                    <span className="text-green-400/70">MFE +{t.mfe.toFixed(1)}%</span>
                    <span className="text-zinc-600">Fee ${t.commission.toFixed(2)}</span>
                  </div>
                </div>
              ))}
              {trades.length === 0 && (
                <div className="py-4 text-center text-xs text-muted-foreground">No trades were executed during this backtest period</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions (always visible) */}
      <div className="flex gap-2 border-t border-white/5 p-3">
        <button onClick={onSave} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 py-2 text-xs font-medium text-violet-300 transition-colors hover:bg-violet-500/20">
          <Save className="h-3.5 w-3.5" /> Save
        </button>
        <button onClick={onRerun} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/10">
          <RefreshCw className="h-3.5 w-3.5" /> Rerun
        </button>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, sub, positive }: { icon: React.ReactNode; label: string; value: string; sub?: string; positive?: boolean }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/5 px-3 py-2">
      <div className="flex items-center gap-1.5 text-zinc-500">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <div className={`mt-0.5 text-sm font-bold ${positive === undefined ? "text-zinc-200" : positive ? "text-green-400" : "text-rose-400"}`}>
        {value}
      </div>
      {sub && <div className="text-[10px] text-zinc-500">{sub}</div>}
    </div>
  );
}

function MiniEquityCurve({ equityCurve, startingCapital }: { equityCurve: { bar: number; value: number }[]; startingCapital: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || equityCurve.length === 0) return;

    const chart = createChart(containerRef.current, {
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: "#6b7280", fontFamily: "Inter, sans-serif", fontSize: 9 },
      grid: { vertLines: { visible: false }, horzLines: { color: "#1e293b" } },
      timeScale: { visible: false },
      rightPriceScale: { borderColor: "#1e293b" },
      width: containerRef.current.clientWidth,
      height: 100,
      handleScale: false,
      handleScroll: false,
    });

    const finalValue = equityCurve[equityCurve.length - 1]?.value ?? startingCapital;
    const isProfit = finalValue >= startingCapital;

    const series = chart.addSeries(AreaSeries, {
      lineColor: isProfit ? "#8b5cf6" : "#ef4444",
      topColor: isProfit ? "rgba(139,92,246,0.3)" : "rgba(239,68,68,0.3)",
      bottomColor: isProfit ? "rgba(139,92,246,0.02)" : "rgba(239,68,68,0.02)",
      lineWidth: 2,
    });

    const baseTime = Math.floor(Date.now() / 1000) - equityCurve.length * 86400;
    series.setData(equityCurve.map((pt) => ({ time: (baseTime + pt.bar * 86400) as UTCTimestamp, value: pt.value })));
    chart.timeScale().fitContent();

    const observer = new ResizeObserver((entries) => { chart.applyOptions({ width: entries[0].contentRect.width }); });
    observer.observe(containerRef.current);
    return () => { observer.disconnect(); chart.remove(); };
  }, [equityCurve, startingCapital]);

  return <div ref={containerRef} className="h-[100px] w-full rounded-lg" />;
}
