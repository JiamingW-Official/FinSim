"use client";

import type { BacktestResult } from "@/types/backtest";

// Synthetic SPY annual returns (historical approximations)
const SPY_RETURNS: Record<number, number> = {
  2020: 18.4,
  2021: 28.7,
  2022: -18.1,
  2023: 26.3,
  2024: 25.0,
  2025: 12.1,
};

interface YearReturn {
  year: number;
  strategy: number;
  spy: number;
}

function computeAnnualReturns(result: BacktestResult): YearReturn[] {
  const { equityCurve, config } = result;
  if (equityCurve.length === 0) return [];

  const baseTimestamp = Date.now() - config.barCount * 86_400_000;

  // Group equity points by year
  const yearMap = new Map<number, { first: number; last: number }>();
  for (const pt of equityCurve) {
    const ts = baseTimestamp + pt.bar * 86_400_000;
    const year = new Date(ts).getFullYear();
    const entry = yearMap.get(year);
    if (!entry) {
      yearMap.set(year, { first: pt.value, last: pt.value });
    } else {
      entry.last = pt.value;
    }
  }

  const years = Array.from(yearMap.keys()).sort();
  let prevValue = config.startingCapital;

  return years.map((year) => {
    const entry = yearMap.get(year)!;
    const strategy = prevValue > 0 ? ((entry.last - prevValue) / prevValue) * 100 : 0;
    prevValue = entry.last;
    return {
      year,
      strategy: +strategy.toFixed(2),
      spy: SPY_RETURNS[year] ?? 0,
    };
  });
}

interface Props {
  result: BacktestResult;
}

export default function AnnualReturnsChart({ result }: Props) {
  const data = computeAnnualReturns(result);

  if (data.length === 0) {
    return <div className="py-4 text-center text-xs text-muted-foreground/70">No annual data available</div>;
  }

  const allValues = data.flatMap((d) => [d.strategy, d.spy]);
  const maxAbs = Math.max(Math.abs(Math.min(...allValues)), Math.abs(Math.max(...allValues)), 5);
  const scale = maxAbs;

  const svgW = 320;
  const svgH = 140;
  const padLeft = 34;
  const padBottom = 24;
  const padTop = 8;
  const plotW = svgW - padLeft - 8;
  const plotH = svgH - padBottom - padTop;
  const zeroY = padTop + plotH * (scale / (2 * scale));

  const barGroupW = plotW / data.length;
  const barW = Math.max(4, barGroupW * 0.35);

  const yToSvg = (v: number) => zeroY - (v / scale) * (plotH / 2);

  // Y ticks
  const tickVals = [-scale * 0.66, 0, scale * 0.66].map((v) => Math.round(v / 5) * 5);

  // Best/worst years
  const bestYear = data.reduce((b, d) => (d.strategy > b.strategy ? d : b), data[0]);
  const worstYear = data.reduce((w, d) => (d.strategy < w.strategy ? d : w), data[0]);

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-lg border border-border/20 bg-black/20 p-2">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: 145 }}>
          {/* Horizontal grid */}
          {tickVals.map((v) => {
            const y = yToSvg(v);
            return (
              <g key={v}>
                <line x1={padLeft} y1={y} x2={svgW - 8} y2={y} stroke="#1f2937" strokeWidth={0.5} strokeDasharray="2,3" />
                <text x={padLeft - 3} y={y + 3} textAnchor="end" fontSize={6} fill="#6b7280">{v > 0 ? `+${v}` : v}%</text>
              </g>
            );
          })}

          {/* Zero axis */}
          <line x1={padLeft} y1={zeroY} x2={svgW - 8} y2={zeroY} stroke="#374151" strokeWidth={0.7} />

          {/* Y-axis */}
          <line x1={padLeft} y1={padTop} x2={padLeft} y2={svgH - padBottom} stroke="#374151" strokeWidth={0.5} />

          {/* Bars */}
          {data.map((d, i) => {
            const groupX = padLeft + i * barGroupW;
            const centerX = groupX + barGroupW / 2;

            // Strategy bar
            const stratY = yToSvg(Math.max(0, d.strategy));
            const stratH = Math.abs(yToSvg(0) - yToSvg(d.strategy));
            const isBest = d.year === bestYear.year;
            const isWorst = d.year === worstYear.year;
            const stratColor = isBest
              ? "rgba(251,191,36,0.85)"
              : isWorst
              ? "rgba(239,68,68,0.85)"
              : d.strategy >= 0
              ? "rgba(16,185,129,0.7)"
              : "rgba(239,68,68,0.55)";

            // SPY bar
            const spyY = yToSvg(Math.max(0, d.spy));
            const spyH = Math.abs(yToSvg(0) - yToSvg(d.spy));

            return (
              <g key={d.year}>
                {/* Strategy bar */}
                <rect
                  x={centerX - barW - 1}
                  y={d.strategy >= 0 ? stratY : zeroY}
                  width={barW}
                  height={Math.max(1, stratH)}
                  fill={stratColor}
                  rx={1}
                />
                {/* SPY bar */}
                <rect
                  x={centerX + 1}
                  y={d.spy >= 0 ? spyY : zeroY}
                  width={barW}
                  height={Math.max(1, spyH)}
                  fill="rgba(99,102,241,0.5)"
                  rx={1}
                />
                {/* Year label */}
                <text
                  x={centerX}
                  y={svgH - padBottom + 12}
                  textAnchor="middle"
                  fontSize={7}
                  fill={isBest ? "#fbbf24" : isWorst ? "#ef4444" : "#6b7280"}
                >
                  {String(d.year).slice(2)}
                </text>
                {/* Value labels for best/worst */}
                {(isBest || isWorst) && (
                  <text
                    x={centerX - barW / 2 - 1}
                    y={d.strategy >= 0 ? stratY - 2 : zeroY + stratH + 8}
                    textAnchor="middle"
                    fontSize={5.5}
                    fill={isBest ? "#fbbf24" : "#ef4444"}
                    fontWeight="600"
                  >
                    {d.strategy > 0 ? "+" : ""}{d.strategy.toFixed(1)}%
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-1 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500/70" />Strategy
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-indigo-500/50" />SPY Benchmark
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-400/85" />Best year
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-rose-500/85" />Worst year
        </span>
      </div>

      {/* Best/worst summary */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
          <div className="text-[11px] text-amber-500/70">Best Year</div>
          <div className="text-sm font-semibold text-amber-400">{bestYear.year}</div>
          <div className="text-xs text-muted-foreground">
            +{bestYear.strategy.toFixed(1)}% vs SPY {bestYear.spy > 0 ? "+" : ""}{bestYear.spy.toFixed(1)}%
          </div>
        </div>
        <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2">
          <div className="text-[11px] text-rose-500/70">Worst Year</div>
          <div className="text-sm font-semibold text-rose-400">{worstYear.year}</div>
          <div className="text-xs text-muted-foreground">
            {worstYear.strategy.toFixed(1)}% vs SPY {worstYear.spy > 0 ? "+" : ""}{worstYear.spy.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}
