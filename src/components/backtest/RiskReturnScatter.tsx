"use client";

import { useMemo } from "react";
import { runBacktest } from "@/services/backtest/engine";
import type { BacktestConfig, BacktestResult } from "@/types/backtest";

// ── Varied strategy configurations for scatter plot ─────────────────────────

const SCATTER_STRATEGIES: { label: string; oversold: number; overbought: number; exitPct: number; stopLoss: number }[] = [
  { label: "Conservative RSI-7", oversold: 25, overbought: 75, exitPct: 5, stopLoss: 5 },
  { label: "RSI-14 + Tight Stop", oversold: 30, overbought: 70, exitPct: 8, stopLoss: 4 },
  { label: "RSI-14 + Wide Stop", oversold: 30, overbought: 70, exitPct: 15, stopLoss: 10 },
  { label: "Aggressive RSI-7", oversold: 20, overbought: 80, exitPct: 12, stopLoss: 8 },
  { label: "RSI-21 + Wide", oversold: 35, overbought: 65, exitPct: 20, stopLoss: 12 },
  { label: "RSI-21 + Tight", oversold: 35, overbought: 65, exitPct: 6, stopLoss: 3 },
  { label: "RSI-14 No Stop", oversold: 30, overbought: 70, exitPct: 25, stopLoss: 20 },
  { label: "RSI-7 + PT5%", oversold: 25, overbought: 75, exitPct: 5, stopLoss: 3 },
];

function buildScatterConfig(
  base: BacktestConfig,
  s: (typeof SCATTER_STRATEGIES)[0],
  idx: number,
): BacktestConfig {
  return {
    ...base,
    seed: base.seed + idx * 1337,
    strategy: {
      ...base.strategy,
      id: `scatter-${idx}`,
      name: s.label,
      entryRules: [
        {
          id: `entry_${idx}`,
          source: "rsi14",
          operator: "less_than",
          target: s.oversold,
          label: `RSI < ${s.oversold}`,
        },
      ],
      exitRules: [
        { kind: "profit_target", percent: s.exitPct },
        { kind: "stop_loss", percent: s.stopLoss },
      ],
    },
  };
}

function computeVolatility(result: BacktestResult): number {
  const curve = result.equityCurve;
  const returns: number[] = [];
  for (let i = 1; i < curve.length; i++) {
    const prev = curve[i - 1].value;
    if (prev > 0) returns.push((curve[i].value - prev) / prev);
  }
  if (returns.length < 2) return 0;
  const avg = returns.reduce((s, v) => s + v, 0) / returns.length;
  const variance = returns.reduce((s, v) => s + (v - avg) ** 2, 0) / (returns.length - 1);
  return Math.sqrt(variance) * Math.sqrt(252) * 100;
}

interface BubblePoint {
  label: string;
  volatility: number;
  returnPct: number;
  sharpe: number;
}

interface Props {
  baseConfig: BacktestConfig | null;
}

export default function RiskReturnScatter({ baseConfig }: Props) {
  const points = useMemo<BubblePoint[]>(() => {
    if (!baseConfig) return [];
    return SCATTER_STRATEGIES.map((s, i) => {
      const config = buildScatterConfig(baseConfig, s, i);
      const result = runBacktest(config);
      return {
        label: s.label,
        volatility: computeVolatility(result),
        returnPct: result.metrics.totalReturnPercent,
        sharpe: result.metrics.sharpeRatio,
      };
    });
  }, [baseConfig]);

  if (!baseConfig || points.length === 0) {
    return (
      <div className="flex items-center justify-center py-10 text-center">
        <div className="text-xs text-muted-foreground">Run a backtest first to see the risk-return scatter.</div>
      </div>
    );
  }

  // SVG dimensions
  const svgW = 320;
  const svgH = 180;
  const padLeft = 40;
  const padBottom = 28;
  const padTop = 10;
  const plotW = svgW - padLeft - 16;
  const plotH = svgH - padBottom - padTop;

  const vols = points.map((p) => p.volatility);
  const rets = points.map((p) => p.returnPct);
  const sharpes = points.map((p) => p.sharpe);

  const minVol = Math.max(0, Math.min(...vols) - 2);
  const maxVol = Math.max(...vols) + 2;
  const minRet = Math.min(...rets) - 3;
  const maxRet = Math.max(...rets) + 3;
  const minSharpe = Math.min(...sharpes);
  const maxSharpe = Math.max(...sharpes);

  const xToSvg = (v: number) => padLeft + ((v - minVol) / (maxVol - minVol)) * plotW;
  const yToSvg = (r: number) => padTop + plotH - ((r - minRet) / (maxRet - minRet)) * plotH;

  // Bubble radius: proportional to Sharpe (min 5, max 14)
  const bubbleR = (sharpe: number) => {
    const norm = maxSharpe > minSharpe ? (sharpe - minSharpe) / (maxSharpe - minSharpe) : 0.5;
    return 5 + norm * 9;
  };

  // Bubble color: green = high Sharpe, red = low
  const bubbleColor = (sharpe: number) => {
    const norm = maxSharpe > minSharpe ? (sharpe - minSharpe) / (maxSharpe - minSharpe) : 0.5;
    if (norm > 0.66) return "rgba(16,185,129,0.7)";
    if (norm > 0.33) return "rgba(251,191,36,0.7)";
    return "rgba(239,68,68,0.6)";
  };

  // Efficient frontier: convex hull upper-left (higher return, lower vol)
  // Sort by vol ascending, pick "best return so far" points
  const sortedByVol = [...points].sort((a, b) => a.volatility - b.volatility);
  let maxRetSoFar = -Infinity;
  const frontierPoints = sortedByVol.filter((p) => {
    if (p.returnPct > maxRetSoFar) { maxRetSoFar = p.returnPct; return true; }
    return false;
  });

  // Grid ticks
  const xTicks = [minVol, (minVol + maxVol) / 2, maxVol].map((v) => Math.round(v));
  const yTicks = [minRet, 0, (minRet + maxRet) / 2, maxRet].map((v) => Math.round(v));

  // Zero line
  const zeroY = yToSvg(0);
  const zeroX = xToSvg(0);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-white/5 bg-black/20 p-2">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: 185 }}>
          {/* Grid lines */}
          {yTicks.map((v) => {
            const y = yToSvg(v);
            return (
              <g key={v}>
                <line x1={padLeft} y1={y} x2={svgW - 16} y2={y} stroke="#1f2937" strokeWidth={0.5} strokeDasharray="2,3" />
                <text x={padLeft - 3} y={y + 3} textAnchor="end" fontSize={6} fill="#6b7280">
                  {v > 0 ? `+${v}` : v}%
                </text>
              </g>
            );
          })}
          {xTicks.map((v) => {
            const x = xToSvg(v);
            return (
              <g key={v}>
                <line x1={x} y1={padTop} x2={x} y2={svgH - padBottom} stroke="#1f2937" strokeWidth={0.5} strokeDasharray="2,3" />
                <text x={x} y={svgH - padBottom + 10} textAnchor="middle" fontSize={6} fill="#6b7280">{v.toFixed(0)}%</text>
              </g>
            );
          })}

          {/* Axes */}
          <line x1={padLeft} y1={padTop} x2={padLeft} y2={svgH - padBottom} stroke="#374151" strokeWidth={0.5} />
          <line x1={padLeft} y1={svgH - padBottom} x2={svgW - 16} y2={svgH - padBottom} stroke="#374151" strokeWidth={0.5} />

          {/* Zero return line */}
          {zeroY > padTop && zeroY < svgH - padBottom && (
            <line x1={padLeft} y1={zeroY} x2={svgW - 16} y2={zeroY} stroke="#6b7280" strokeWidth={0.7} strokeDasharray="3,2" />
          )}

          {/* Efficient frontier line */}
          {frontierPoints.length > 1 && (
            <polyline
              points={frontierPoints.map((p) => `${xToSvg(p.volatility).toFixed(1)},${yToSvg(p.returnPct).toFixed(1)}`).join(" ")}
              fill="none"
              stroke="rgba(139,92,246,0.5)"
              strokeWidth={1.2}
              strokeDasharray="3,2"
            />
          )}

          {/* Bubbles */}
          {points.map((p, i) => {
            const cx = xToSvg(p.volatility);
            const cy = yToSvg(p.returnPct);
            const r = bubbleR(p.sharpe);
            return (
              <g key={i}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={bubbleColor(p.sharpe)}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth={0.5}
                />
                {/* Label for top 2 Sharpe */}
                {p.sharpe >= [...sharpes].sort((a, b) => b - a)[1] && (
                  <text
                    x={cx + r + 2}
                    y={cy - r}
                    fontSize={5.5}
                    fill="#a1a1aa"
                    textAnchor="start"
                  >
                    {p.label.split(" ").slice(0, 2).join(" ")}
                  </text>
                )}
              </g>
            );
          })}

          {/* Axis labels */}
          <text x={padLeft + plotW / 2} y={svgH - 3} textAnchor="middle" fontSize={7} fill="#6b7280">
            Volatility (Ann. %)
          </text>
          <text
            x={8}
            y={padTop + plotH / 2}
            textAnchor="middle"
            fontSize={7}
            fill="#6b7280"
            transform={`rotate(-90, 8, ${padTop + plotH / 2})`}
          >
            Return %
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 px-1 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500/70" />High Sharpe
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400/70" />Mid Sharpe
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500/60" />Low Sharpe
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-5 border-t border-dashed border-primary/60" />Efficient frontier
        </span>
        <span className="text-muted-foreground/70">Bubble size = Sharpe ratio</span>
      </div>

      {/* Top Sharpe table */}
      <div>
        <h4 className="mb-1 text-xs font-semibold text-muted-foreground">Top Strategies by Sharpe</h4>
        <div className="overflow-hidden rounded-lg border border-white/5 bg-black/20">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="py-1.5 pl-3 text-left text-[11px] font-medium text-muted-foreground/70">Strategy</th>
                <th className="py-1.5 text-center text-[11px] font-medium text-muted-foreground/70">Vol %</th>
                <th className="py-1.5 text-center text-[11px] font-medium text-muted-foreground/70">Return %</th>
                <th className="py-1.5 pr-3 text-center text-[11px] font-medium text-muted-foreground/70">Sharpe</th>
              </tr>
            </thead>
            <tbody>
              {[...points]
                .sort((a, b) => b.sharpe - a.sharpe)
                .slice(0, 4)
                .map((p, i) => (
                  <tr key={i} className={`border-b border-white/5 ${i === 0 ? "bg-emerald-500/5" : ""}`}>
                    <td className="py-1.5 pl-3 text-xs text-muted-foreground">{p.label}</td>
                    <td className="py-1.5 text-center font-mono text-xs text-muted-foreground">{p.volatility.toFixed(1)}</td>
                    <td className={`py-1.5 text-center font-mono text-xs font-semibold ${p.returnPct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {p.returnPct > 0 ? "+" : ""}{p.returnPct.toFixed(1)}
                    </td>
                    <td className="py-1.5 pr-3 text-center font-mono text-xs font-semibold text-primary">
                      {p.sharpe.toFixed(2)}
                      {i === 0 && <span className="ml-1 text-[8px] text-emerald-400">best</span>}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
