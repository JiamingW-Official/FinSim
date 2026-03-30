"use client";

import { useMemo } from "react";
import { runBacktest } from "@/services/backtest/engine";
import type { BacktestConfig, BacktestResult } from "@/types/backtest";

// ── Three RSI configurations to compare ─────────────────────────────────────

const RSI_CONFIGS: { label: string; period: number; oversold: number; overbought: number }[] = [
  { label: "RSI-7 (Fast)", period: 7, oversold: 25, overbought: 75 },
  { label: "RSI-14 (Default)", period: 14, oversold: 30, overbought: 70 },
  { label: "RSI-21 (Slow)", period: 21, oversold: 35, overbought: 65 },
];

const COLORS = [
  { line: "#8b5cf6", label: "violet" },
  { line: "#22d3ee", label: "cyan" },
  { line: "#f59e0b", label: "amber" },
];

function buildRsiConfig(
  base: BacktestConfig,
  cfg: { oversold: number; overbought: number },
  idx: number,
): BacktestConfig {
  return {
    ...base,
    strategy: {
      ...base.strategy,
      id: `rsi-compare-${idx}`,
      name: RSI_CONFIGS[idx].label,
      entryRules: [
        {
          id: `rsi_entry_${idx}`,
          source: "rsi14",
          operator: "less_than",
          target: cfg.oversold,
          label: `RSI < ${cfg.oversold}`,
        },
      ],
      exitRules: [
        {
          kind: "condition",
          rule: {
            id: `rsi_exit_${idx}`,
            source: "rsi14",
            operator: "greater_than",
            target: cfg.overbought,
            label: `RSI > ${cfg.overbought}`,
          },
        },
      ],
    },
  };
}

interface MetricRowProps {
  label: string;
  values: (string | number)[];
  winnerIdx: number;
  higherIsBetter?: boolean;
}

function MetricRow({ label, values, winnerIdx, higherIsBetter = true }: MetricRowProps) {
  return (
    <tr className="border-b border-border">
      <td className="py-1.5 pr-2 text-xs text-muted-foreground">{label}</td>
      {values.map((v, i) => (
        <td
          key={i}
          className={`py-1.5 text-center text-xs font-mono font-semibold ${
            i === winnerIdx
              ? "text-emerald-400"
              : "text-muted-foreground"
          }`}
        >
          {typeof v === "number" ? v.toFixed(2) : v}
          {i === winnerIdx && (
            <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          )}
        </td>
      ))}
    </tr>
  );
}

interface OverlayEquityCurveProps {
  results: BacktestResult[];
  startingCapital: number;
}

function OverlayEquityCurve({ results, startingCapital }: OverlayEquityCurveProps) {
  const svgW = 320;
  const svgH = 110;
  const padLeft = 36;
  const padBottom = 18;
  const padTop = 6;
  const plotW = svgW - padLeft - 8;
  const plotH = svgH - padBottom - padTop;

  const allValues = results.flatMap((r) => r.equityCurve.map((pt) => pt.value));
  const minV = Math.min(...allValues, startingCapital);
  const maxV = Math.max(...allValues, startingCapital);
  const vRange = maxV - minV || 1;

  const maxLen = Math.max(...results.map((r) => r.equityCurve.length));
  const xToSvg = (bar: number) => padLeft + (bar / (maxLen - 1)) * plotW;
  const yToSvg = (v: number) => padTop + plotH - ((v - minV) / vRange) * plotH;

  // Y-axis ticks
  const yTicks = [minV, startingCapital, maxV].map((v) => ({
    v,
    y: yToSvg(v),
    label: v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(0)}`,
  }));

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: 115 }}>
      {/* Grid */}
      {yTicks.map(({ v, y, label }) => (
        <g key={v}>
          <line x1={padLeft} y1={y} x2={svgW - 8} y2={y} stroke="#1f2937" strokeWidth={0.5} strokeDasharray="2,3" />
          <text x={padLeft - 3} y={y + 3} textAnchor="end" fontSize={6} fill="#6b7280">{label}</text>
        </g>
      ))}

      {/* Y axis */}
      <line x1={padLeft} y1={padTop} x2={padLeft} y2={svgH - padBottom} stroke="#374151" strokeWidth={0.5} />

      {/* Starting capital baseline */}
      <line
        x1={padLeft} y1={yToSvg(startingCapital)}
        x2={svgW - 8} y2={yToSvg(startingCapital)}
        stroke="#374151" strokeWidth={0.7} strokeDasharray="3,2"
      />

      {/* Equity curves */}
      {results.map((r, ri) => {
        const pts = r.equityCurve
          .map((pt) => `${xToSvg(pt.bar).toFixed(1)},${yToSvg(pt.value).toFixed(1)}`)
          .join(" ");
        return (
          <polyline
            key={ri}
            points={pts}
            fill="none"
            stroke={COLORS[ri].line}
            strokeWidth={1.2}
            opacity={0.9}
          />
        );
      })}

      {/* X axis labels */}
      {[0, Math.floor(maxLen / 2), maxLen - 1].map((bar, i) => (
        <text key={i} x={xToSvg(bar)} y={svgH - padBottom + 11} textAnchor="middle" fontSize={6} fill="#4b5563">
          B{bar}
        </text>
      ))}
    </svg>
  );
}

interface Props {
  baseConfig: BacktestConfig | null;
}

export default function StrategyComparison({ baseConfig }: Props) {
  const results = useMemo<BacktestResult[]>(() => {
    if (!baseConfig) return [];
    return RSI_CONFIGS.map((cfg, i) => {
      const config = buildRsiConfig(baseConfig, cfg, i);
      return runBacktest(config);
    });
  }, [baseConfig]);

  if (!baseConfig || results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <div className="text-xs text-muted-foreground">Run a backtest first to enable strategy comparison.</div>
        <div className="text-xs text-muted-foreground/70">This panel will automatically compare RSI-7, RSI-14, and RSI-21 on the same market data.</div>
      </div>
    );
  }

  // Helper: pick winner index (higher is better by default)
  const winnerIdx = (vals: number[], higherBetter = true) => {
    let best = higherBetter ? -Infinity : Infinity;
    let idx = 0;
    vals.forEach((v, i) => {
      if (higherBetter ? v > best : v < best) { best = v; idx = i; }
    });
    return idx;
  };

  const metrics = {
    totalReturn: results.map((r) => r.metrics.totalReturnPercent),
    sharpe: results.map((r) => r.metrics.sharpeRatio),
    sortino: results.map((r) => r.metrics.sortinoRatio),
    calmar: results.map((r) => r.metrics.calmarRatio),
    winRate: results.map((r) => r.metrics.winRate),
    profitFactor: results.map((r) => r.metrics.profitFactor),
    maxDD: results.map((r) => r.metrics.maxDrawdownPercent),
    ulcer: results.map((r) => r.metrics.ulcerIndex),
    trades: results.map((r) => r.metrics.totalTrades),
    expectancy: results.map((r) => r.metrics.expectancy),
  };

  return (
    <div className="space-y-4">
      {/* Header with color keys */}
      <div className="flex flex-wrap items-center gap-3">
        {RSI_CONFIGS.map((cfg, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            <span
              className="inline-block h-2 w-6 rounded-full"
              style={{ backgroundColor: COLORS[i].line }}
            />
            <span className="text-muted-foreground font-medium">{cfg.label}</span>
            <span className={`rounded-sm px-1 text-[11px] font-semibold ${results[i].grade === "S" ? "bg-amber-400/20 text-amber-400" : results[i].grade === "A" ? "bg-emerald-400/20 text-emerald-400" : results[i].grade === "B" ? "bg-primary/20 text-primary" : "bg-muted-foreground/20 text-muted-foreground"}`}>
              {results[i].grade}
            </span>
          </div>
        ))}
      </div>

      {/* Overlay equity curves */}
      <div>
        <h4 className="mb-1.5 text-xs font-semibold text-muted-foreground">Equity Curves (Overlay)</h4>
        <div className="overflow-hidden rounded-lg border border-border bg-black/20 p-2">
          <OverlayEquityCurve results={results} startingCapital={baseConfig.startingCapital} />
        </div>
      </div>

      {/* Metrics comparison table */}
      <div>
        <h4 className="mb-1.5 text-xs font-semibold text-muted-foreground">Metrics Comparison</h4>
        <div className="overflow-hidden rounded-lg border border-border bg-black/20">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-2 text-left text-[11px] font-medium text-muted-foreground/70">Metric</th>
                {RSI_CONFIGS.map((cfg, i) => (
                  <th key={i} className="py-2 text-center text-[11px] font-medium" style={{ color: COLORS[i].line }}>
                    {cfg.label.split(" ")[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="px-2">
              <MetricRow label="Return %" values={metrics.totalReturn.map((v) => v.toFixed(1) + "%")} winnerIdx={winnerIdx(metrics.totalReturn)} />
              <MetricRow label="Sharpe" values={metrics.sharpe} winnerIdx={winnerIdx(metrics.sharpe)} />
              <MetricRow label="Sortino" values={metrics.sortino} winnerIdx={winnerIdx(metrics.sortino)} />
              <MetricRow label="Calmar" values={metrics.calmar} winnerIdx={winnerIdx(metrics.calmar)} />
              <MetricRow label="Win Rate" values={metrics.winRate.map((v) => v.toFixed(1) + "%")} winnerIdx={winnerIdx(metrics.winRate)} />
              <MetricRow label="Profit Factor" values={metrics.profitFactor} winnerIdx={winnerIdx(metrics.profitFactor)} />
              <MetricRow label="Max DD %" values={metrics.maxDD.map((v) => v.toFixed(1) + "%")} winnerIdx={winnerIdx(metrics.maxDD, false)} higherIsBetter={false} />
              <MetricRow label="Ulcer Index" values={metrics.ulcer} winnerIdx={winnerIdx(metrics.ulcer, false)} higherIsBetter={false} />
              <MetricRow label="Trades" values={metrics.trades} winnerIdx={0} />
              <MetricRow label="Expectancy $" values={metrics.expectancy.map((v) => `$${v.toFixed(0)}`)} winnerIdx={winnerIdx(metrics.expectancy)} />
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-[11px] text-muted-foreground/70">
        Winner highlighted with green dot per row. All three strategies tested on identical market data (same seed).
      </div>
    </div>
  );
}
