"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  type IChartApi,
  type UTCTimestamp,
  AreaSeries,
  HistogramSeries,
  ColorType,
} from "lightweight-charts";
import type { BacktestResult } from "@/types/backtest";

interface AnalyticsPanelProps {
  result: BacktestResult;
}

export default function AnalyticsPanel({ result }: AnalyticsPanelProps) {
  const { metrics, drawdownCurve, periodReturns, trades } = result;

  return (
    <div className="space-y-4 p-4">
      {/* Advanced Metrics Grid */}
      <div>
        <h3 className="mb-2 text-xs font-semibold text-muted-foreground">Risk-Adjusted Metrics</h3>
        <div className="grid grid-cols-3 gap-2">
          <MiniMetric label="Sortino" value={metrics.sortinoRatio} good={metrics.sortinoRatio > 1} />
          <MiniMetric label="Calmar" value={metrics.calmarRatio} good={metrics.calmarRatio > 0.5} />
          <MiniMetric label="Payoff" value={metrics.payoffRatio > 100 ? "∞" : metrics.payoffRatio.toFixed(2)} good={metrics.payoffRatio > 1.5} />
          <MiniMetric label="Expectancy" value={`$${metrics.expectancy.toFixed(0)}`} good={metrics.expectancy > 0} />
          <MiniMetric label="Recovery" value={metrics.recoveryFactor.toFixed(2)} good={metrics.recoveryFactor > 1} />
          <MiniMetric label="Ulcer Idx" value={metrics.ulcerIndex.toFixed(1)} good={metrics.ulcerIndex < 5} />
          <MiniMetric label="Time in Mkt" value={`${metrics.timeInMarket.toFixed(0)}%`} />
          <MiniMetric label="Edge Capture" value={`${(metrics.edgeCaptureRatio * 100).toFixed(0)}%`} good={metrics.edgeCaptureRatio > 0.5} />
          <MiniMetric label="Skewness" value={metrics.skewness.toFixed(2)} good={metrics.skewness > 0} />
        </div>
      </div>

      {/* Drawdown Chart */}
      <div>
        <h3 className="mb-2 text-xs font-semibold text-muted-foreground">Drawdown</h3>
        <DrawdownChart
          data={drawdownCurve}
          baseTimestamp={result.bars[0]?.timestamp ?? Date.now()}
        />
      </div>

      {/* Period Returns Heatmap */}
      <div>
        <h3 className="mb-2 text-xs font-semibold text-muted-foreground">Period Returns (20-bar periods)</h3>
        <div className="flex flex-wrap gap-1">
          {periodReturns.map((p) => {
            const intensity = Math.min(Math.abs(p.returnPercent) / 10, 1);
            const isPositive = p.returnPercent >= 0;
            return (
              <div
                key={p.period}
                className="group relative flex h-10 w-10 flex-col items-center justify-center rounded-md border border-border/50 text-[11px]"
                style={{
                  backgroundColor: isPositive
                    ? `rgba(16, 185, 129, ${0.1 + intensity * 0.4})`
                    : `rgba(239, 68, 68, ${0.1 + intensity * 0.4})`,
                }}
              >
                <span className="font-mono font-semibold text-foreground">
                  {p.returnPercent > 0 ? "+" : ""}{p.returnPercent.toFixed(1)}
                </span>
                <span className="text-[7px] text-muted-foreground">{p.label}</span>
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 rounded bg-muted px-2 py-1 text-xs text-muted-foreground shadow-sm group-hover:block whitespace-nowrap">
                  {p.trades} trades
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trade P&L Distribution */}
      <div>
        <h3 className="mb-2 text-xs font-semibold text-muted-foreground">Trade P&L Distribution</h3>
        <TradeDistribution trades={trades} />
      </div>

      {/* MAE/MFE scatter summary */}
      <div>
        <h3 className="mb-2 text-xs font-semibold text-muted-foreground">Trade Quality (MAE / MFE)</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border/40 bg-muted/30 p-3">
            <div className="text-xs text-muted-foreground">Avg Max Adverse</div>
            <div className="text-sm font-bold text-rose-400">-{metrics.avgMAE.toFixed(2)}%</div>
            <div className="text-[11px] text-muted-foreground/70">Avg worst drawdown per trade</div>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/30 p-3">
            <div className="text-xs text-muted-foreground">Avg Max Favorable</div>
            <div className="text-sm font-bold text-emerald-400">+{metrics.avgMFE.toFixed(2)}%</div>
            <div className="text-[11px] text-muted-foreground/70">Avg best unrealized gain per trade</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniMetric({ label, value, good }: { label: string; value: string | number; good?: boolean }) {
  return (
    <div className="rounded-lg border border-border/40 bg-muted/30 px-2 py-1.5">
      <div className="text-[11px] text-muted-foreground/70">{label}</div>
      <div className={`text-sm font-bold ${good === undefined ? "text-foreground" : good ? "text-emerald-400" : "text-rose-400"}`}>
        {typeof value === "number" ? value.toFixed(2) : value}
      </div>
    </div>
  );
}

// ── Drawdown Chart ─────────────────────────────────────────

function DrawdownChart({ data, baseTimestamp }: { data: { bar: number; drawdownPercent: number }[]; baseTimestamp: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    const chart = createChart(containerRef.current, {
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: "#6b7280", fontSize: 9 },
      grid: { vertLines: { visible: false }, horzLines: { color: "#1e293b" } },
      timeScale: { visible: false },
      rightPriceScale: { borderColor: "#1e293b" },
      width: containerRef.current.clientWidth,
      height: 100,
      handleScale: false,
      handleScroll: false,
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor: "#ef4444",
      topColor: "rgba(239, 68, 68, 0.01)",
      bottomColor: "rgba(239, 68, 68, 0.3)",
      lineWidth: 1,
      invertFilledArea: true,
    });

    const baseTime = Math.floor(baseTimestamp / 1000);
    series.setData(data.map((pt) => ({
      time: (baseTime + pt.bar * 86400) as UTCTimestamp,
      value: -pt.drawdownPercent,
    })));

    chart.timeScale().fitContent();

    const observer = new ResizeObserver((entries) => {
      chart.applyOptions({ width: entries[0].contentRect.width });
    });
    observer.observe(containerRef.current);

    return () => { observer.disconnect(); chart.remove(); };
  }, [data, baseTimestamp]);

  return <div ref={containerRef} className="h-[100px] w-full rounded-lg" />;
}

// ── Trade P&L Distribution Histogram ───────────────────────

function TradeDistribution({ trades }: { trades: { pnl: number }[] }) {
  if (trades.length === 0) return <div className="py-2 text-center text-xs text-muted-foreground/70">No trades</div>;

  const pnls = trades.map((t) => t.pnl);
  const min = Math.min(...pnls);
  const max = Math.max(...pnls);
  const range = max - min || 1;
  const BINS = 15;
  const binWidth = range / BINS;
  const bins: number[] = new Array(BINS).fill(0);

  for (const p of pnls) {
    const idx = Math.min(Math.floor((p - min) / binWidth), BINS - 1);
    bins[idx]++;
  }

  const maxCount = Math.max(...bins);

  return (
    <div className="flex h-16 items-end gap-px">
      {bins.map((count, i) => {
        const binStart = min + i * binWidth;
        const isPositive = binStart + binWidth / 2 >= 0;
        const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
        return (
          <div
            key={i}
            className="group relative flex-1 rounded-t-sm transition-all hover:opacity-80"
            style={{
              height: `${Math.max(height, 2)}%`,
              backgroundColor: isPositive ? "rgba(16, 185, 129, 0.5)" : "rgba(239, 68, 68, 0.5)",
            }}
          >
            {count > 0 && (
              <div className="absolute -top-6 left-1/2 z-10 hidden -translate-x-1/2 rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground shadow group-hover:block whitespace-nowrap">
                ${binStart.toFixed(0)} ({count})
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
