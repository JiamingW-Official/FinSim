"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  type IChartApi,
  type UTCTimestamp,
  AreaSeries,
  LineSeries,
  ColorType,
} from "lightweight-charts";
import type { MonteCarloResult } from "@/types/backtest";

interface MonteCarloPanelProps {
  result: MonteCarloResult;
  startingCapital: number;
}

export default function MonteCarloPanel({ result, startingCapital }: MonteCarloPanelProps) {
  const { runs, percentiles, returnDistribution: dist } = result;

  return (
    <div className="space-y-4 p-4">
      {/* Probability Stats */}
      <div>
        <h3 className="mb-2 text-xs font-semibold text-muted-foreground">
          Monte Carlo Analysis ({runs.length} Simulations)
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Profit Probability" value={`${dist.profitProbability}%`} good={dist.profitProbability > 50} />
          <StatCard label="Mean Return" value={`${dist.mean > 0 ? "+" : ""}${dist.mean}%`} good={dist.mean > 0} />
          <StatCard label="Median Return" value={`${dist.median > 0 ? "+" : ""}${dist.median}%`} good={dist.median > 0} />
          <StatCard label="Std Dev" value={`${dist.stdDev}%`} />
          <StatCard label="Tail Risk (>10% loss)" value={`${dist.tailRisk10}%`} good={dist.tailRisk10 < 20} />
          <StatCard label="Upside (>20% gain)" value={`${dist.upside20}%`} good={dist.upside20 > 20} />
        </div>
      </div>

      {/* Range */}
      <div className="flex items-center gap-3 rounded-lg border border-border/20 bg-muted/30 px-4 py-3">
        <div className="flex-1 text-center">
          <div className="text-[11px] text-muted-foreground/70">Worst Case</div>
          <div className="text-sm font-semibold text-rose-400">{dist.min > 0 ? "+" : ""}{dist.min}%</div>
        </div>
        <div className="h-8 w-px bg-foreground/10" />
        <div className="flex-1 text-center">
          <div className="text-[11px] text-muted-foreground/70">Median</div>
          <div className="text-sm font-semibold text-foreground">{dist.median > 0 ? "+" : ""}{dist.median}%</div>
        </div>
        <div className="h-8 w-px bg-foreground/10" />
        <div className="flex-1 text-center">
          <div className="text-[11px] text-muted-foreground/70">Best Case</div>
          <div className="text-sm font-semibold text-emerald-400">{dist.max > 0 ? "+" : ""}{dist.max}%</div>
        </div>
      </div>

      {/* Equity Fan Chart (Confidence Bands) */}
      <div>
        <h3 className="mb-2 text-xs font-semibold text-muted-foreground">
          Equity Confidence Bands
        </h3>
        <EquityFanChart percentiles={percentiles} startingCapital={startingCapital} />
        <div className="mt-1 flex items-center justify-center gap-4 text-[11px]">
          <span className="flex items-center gap-1"><span className="h-2 w-4 rounded-sm bg-primary/20" /> 5th-95th</span>
          <span className="flex items-center gap-1"><span className="h-2 w-4 rounded-sm bg-primary/40" /> 25th-75th</span>
          <span className="flex items-center gap-1"><span className="h-0.5 w-4 bg-primary" /> Median</span>
        </div>
      </div>

      {/* Return Distribution Histogram */}
      <div>
        <h3 className="mb-2 text-xs font-semibold text-muted-foreground">
          Return Distribution
        </h3>
        <ReturnHistogram runs={runs} />
      </div>

      {/* Drawdown Distribution */}
      <div>
        <h3 className="mb-2 text-xs font-semibold text-muted-foreground">
          Max Drawdown Distribution
        </h3>
        <div className="grid grid-cols-5 gap-1">
          {[10, 25, 50, 75, 90].map((pct) => {
            const sorted = [...runs.map((r) => r.maxDrawdownPercent)].sort((a, b) => a - b);
            const idx = Math.floor((pct / 100) * (sorted.length - 1));
            const val = sorted[idx] ?? 0;
            return (
              <div key={pct} className="rounded-lg border border-border/20 bg-muted/30 p-2 text-center">
                <div className="text-[11px] text-muted-foreground/70">P{pct}</div>
                <div className="text-xs font-semibold text-rose-400">{val.toFixed(1)}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="rounded-lg border border-border/20 bg-muted/30 px-3 py-2">
      <div className="text-[11px] text-muted-foreground/70">{label}</div>
      <div className={`text-sm font-semibold ${good === undefined ? "text-foreground" : good ? "text-emerald-400" : "text-rose-400"}`}>
        {value}
      </div>
    </div>
  );
}

// ── Equity Fan Chart ─────────────────────────────────────────

function EquityFanChart({
  percentiles,
  startingCapital,
}: {
  percentiles: { p5: number[]; p25: number[]; p50: number[]; p75: number[]; p95: number[] };
  startingCapital: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || percentiles.p50.length === 0) return;

    const chart = createChart(containerRef.current, {
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: "#6b7280", fontSize: 9 },
      grid: { vertLines: { visible: false }, horzLines: { color: "#1e293b" } },
      timeScale: { visible: false },
      rightPriceScale: { borderColor: "#1e293b" },
      width: containerRef.current.clientWidth,
      height: 160,
      handleScale: false,
      handleScroll: false,
    });

    const baseTime = Math.floor(Date.now() / 1000) - percentiles.p50.length * 86400;
    const toData = (arr: number[]) => arr.map((v, i) => ({ time: (baseTime + i * 86400) as UTCTimestamp, value: v }));

    // Outer band (5-95)
    chart.addSeries(AreaSeries, {
      lineColor: "transparent",
      topColor: "rgba(139, 92, 246, 0.15)",
      bottomColor: "rgba(139, 92, 246, 0.02)",
      lineWidth: 1,
    }).setData(toData(percentiles.p95));

    chart.addSeries(AreaSeries, {
      lineColor: "transparent",
      topColor: "rgba(10, 14, 23, 1)",
      bottomColor: "rgba(10, 14, 23, 1)",
      lineWidth: 1,
    }).setData(toData(percentiles.p5));

    // Inner band (25-75)
    chart.addSeries(AreaSeries, {
      lineColor: "transparent",
      topColor: "rgba(139, 92, 246, 0.3)",
      bottomColor: "rgba(139, 92, 246, 0.05)",
      lineWidth: 1,
    }).setData(toData(percentiles.p75));

    // Median line
    chart.addSeries(LineSeries, {
      color: "#8b5cf6",
      lineWidth: 2,
    }).setData(toData(percentiles.p50));

    // Starting capital reference
    chart.addSeries(LineSeries, {
      color: "#374151",
      lineWidth: 1,
      lineStyle: 2,
    }).setData(toData(new Array(percentiles.p50.length).fill(startingCapital)));

    chart.timeScale().fitContent();

    const observer = new ResizeObserver((entries) => {
      chart.applyOptions({ width: entries[0].contentRect.width });
    });
    observer.observe(containerRef.current);

    return () => { observer.disconnect(); chart.remove(); };
  }, [percentiles, startingCapital]);

  return <div ref={containerRef} className="h-[160px] w-full rounded-lg" />;
}

// ── Return Histogram ─────────────────────────────────────────

function ReturnHistogram({ runs }: { runs: { totalReturnPercent: number }[] }) {
  if (runs.length === 0) return null;

  const returns = runs.map((r) => r.totalReturnPercent);
  const min = Math.min(...returns);
  const max = Math.max(...returns);
  const range = max - min || 1;
  const BINS = 20;
  const binWidth = range / BINS;
  const bins: number[] = new Array(BINS).fill(0);

  for (const r of returns) {
    const idx = Math.min(Math.floor((r - min) / binWidth), BINS - 1);
    bins[idx]++;
  }

  const maxCount = Math.max(...bins);

  return (
    <div className="flex h-20 items-end gap-px">
      {bins.map((count, i) => {
        const binCenter = min + (i + 0.5) * binWidth;
        const isPositive = binCenter >= 0;
        const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
        return (
          <div
            key={i}
            className="group relative flex-1 rounded-t-sm transition-colors hover:brightness-125"
            style={{
              height: `${Math.max(height, 1)}%`,
              backgroundColor: isPositive
                ? `rgba(139, 92, 246, ${0.3 + (count / maxCount) * 0.5})`
                : `rgba(239, 68, 68, ${0.3 + (count / maxCount) * 0.5})`,
            }}
          >
            {count > 0 && (
              <div className="absolute -top-6 left-1/2 z-10 hidden -translate-x-1/2 rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground shadow group-hover:block whitespace-nowrap">
                {binCenter.toFixed(1)}% ({count})
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
