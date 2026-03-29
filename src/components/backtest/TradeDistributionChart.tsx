"use client";

import type { BacktestTrade } from "@/types/backtest";

interface Props {
  trades: BacktestTrade[];
}

function normalPDF(x: number, mean: number, std: number): number {
  if (std === 0) return 0;
  return (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mean) / std) ** 2);
}

export default function TradeDistributionChart({ trades }: Props) {
  if (trades.length < 3) {
    return <div className="py-4 text-center text-xs text-muted-foreground/70">Not enough trades for distribution analysis</div>;
  }

  const pcts = trades.map((t) => t.pnlPercent);
  const n = pcts.length;

  // Statistics
  const mean = pcts.reduce((s, v) => s + v, 0) / n;
  const sorted = [...pcts].sort((a, b) => a - b);
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
  const variance = pcts.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1);
  const std = Math.sqrt(variance);

  // Skewness and kurtosis
  let m3 = 0, m4 = 0;
  for (const v of pcts) {
    const d = v - mean;
    m3 += d ** 3;
    m4 += d ** 4;
  }
  const skewness = std > 0 ? (m3 / n) / std ** 3 : 0;
  const kurtosis = std > 0 ? (m4 / n) / std ** 4 - 3 : 0;

  // Bins of ~1% width, capped to reasonable range
  const rawMin = sorted[0];
  const rawMax = sorted[n - 1];
  const BIN_SIZE = 1; // 1% per bin
  const binMin = Math.floor(rawMin / BIN_SIZE) * BIN_SIZE;
  const binMax = Math.ceil(rawMax / BIN_SIZE) * BIN_SIZE;
  const numBins = Math.max(5, Math.min(30, (binMax - binMin) / BIN_SIZE));
  const actualBinSize = (binMax - binMin) / numBins;

  const binCounts: number[] = new Array(numBins).fill(0);
  for (const v of pcts) {
    const idx = Math.min(Math.floor((v - binMin) / actualBinSize), numBins - 1);
    if (idx >= 0) binCounts[idx]++;
  }

  const maxCount = Math.max(...binCounts, 1);

  // Normal PDF overlay points
  const svgW = 300;
  const svgH = 120;
  const padLeft = 30;
  const padBottom = 20;
  const padTop = 8;
  const plotW = svgW - padLeft - 8;
  const plotH = svgH - padBottom - padTop;

  const xToSvg = (x: number) => padLeft + ((x - binMin) / (binMax - binMin)) * plotW;
  const yToSvg = (y: number) => padTop + plotH - y * plotH;

  // Normal PDF points (normalized to max bar height)
  const pdfPoints: string[] = [];
  const pdfSteps = 60;
  const maxPdf = normalPDF(mean, mean, std);
  for (let k = 0; k <= pdfSteps; k++) {
    const x = binMin + (k / pdfSteps) * (binMax - binMin);
    const rawPdf = normalPDF(x, mean, std);
    const normPdf = maxPdf > 0 ? rawPdf / maxPdf : 0;
    pdfPoints.push(`${xToSvg(x).toFixed(1)},${yToSvg(normPdf).toFixed(1)}`);
  }

  // Y-axis labels
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="space-y-2">
      {/* SVG Chart */}
      <div className="overflow-hidden rounded-lg border border-white/5 bg-black/20 p-2">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: 130 }}>
          {/* Y-axis ticks */}
          {yTicks.map((tick) => {
            const y = yToSvg(tick);
            const count = Math.round(tick * maxCount);
            return (
              <g key={tick}>
                <line x1={padLeft - 3} y1={y} x2={padLeft} y2={y} stroke="#374151" strokeWidth={0.5} />
                <text x={padLeft - 5} y={y + 3} textAnchor="end" fontSize={6} fill="#6b7280">{count}</text>
                <line x1={padLeft} y1={y} x2={svgW - 8} y2={y} stroke="#1f2937" strokeWidth={0.5} strokeDasharray="2,3" />
              </g>
            );
          })}

          {/* X-axis */}
          <line x1={padLeft} y1={yToSvg(0)} x2={svgW - 8} y2={yToSvg(0)} stroke="#374151" strokeWidth={0.5} />
          {/* Zero line (0% return) */}
          {binMin < 0 && binMax > 0 && (
            <line
              x1={xToSvg(0)} y1={padTop}
              x2={xToSvg(0)} y2={yToSvg(0)}
              stroke="#6b7280" strokeWidth={0.8} strokeDasharray="2,2"
            />
          )}

          {/* Histogram bars */}
          {binCounts.map((count, i) => {
            const x0 = xToSvg(binMin + i * actualBinSize);
            const x1 = xToSvg(binMin + (i + 1) * actualBinSize);
            const barW = Math.max(1, x1 - x0 - 0.5);
            const barH = maxCount > 0 ? (count / maxCount) * plotH : 0;
            const midX = binMin + (i + 0.5) * actualBinSize;
            const isPos = midX >= 0;
            return (
              <rect
                key={i}
                x={x0}
                y={yToSvg(count / maxCount)}
                width={barW}
                height={barH}
                fill={isPos ? "rgba(16,185,129,0.55)" : "rgba(239,68,68,0.55)"}
                rx={1}
              />
            );
          })}

          {/* Normal distribution overlay */}
          {std > 0 && (
            <polyline
              points={pdfPoints.join(" ")}
              fill="none"
              stroke="rgba(139,92,246,0.8)"
              strokeWidth={1.2}
            />
          )}

          {/* Mean line */}
          <line
            x1={xToSvg(mean)} y1={padTop}
            x2={xToSvg(mean)} y2={yToSvg(0)}
            stroke="#f59e0b" strokeWidth={1} strokeDasharray="2,1"
          />
          <text x={xToSvg(mean) + 2} y={padTop + 8} fontSize={6.5} fill="#f59e0b">μ</text>

          {/* Median line */}
          <line
            x1={xToSvg(median)} y1={padTop}
            x2={xToSvg(median)} y2={yToSvg(0)}
            stroke="#38bdf8" strokeWidth={1} strokeDasharray="1,2"
          />
          <text x={xToSvg(median) + 2} y={padTop + 16} fontSize={6.5} fill="#38bdf8">Med</text>

          {/* ±1σ lines */}
          {std > 0 && [mean - std, mean + std].map((x, si) => (
            <line key={si}
              x1={xToSvg(x)} y1={padTop + 4}
              x2={xToSvg(x)} y2={yToSvg(0)}
              stroke="rgba(139,92,246,0.4)" strokeWidth={0.8} strokeDasharray="1,3"
            />
          ))}

          {/* X-axis labels */}
          {[binMin, mean, binMax].map((v, i) => (
            <text key={i} x={xToSvg(v)} y={svgH - 4} textAnchor="middle" fontSize={6} fill="#4b5563">
              {v.toFixed(1)}%
            </text>
          ))}

          {/* Y-axis line */}
          <line x1={padLeft} y1={padTop} x2={padLeft} y2={yToSvg(0)} stroke="#374151" strokeWidth={0.5} />
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 px-1 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-4 bg-amber-400/80 rounded-full" />Mean {mean.toFixed(2)}%</span>
        <span className="flex items-center gap-1"><span className="inline-block h-0.5 w-4 border-t border-dashed border-sky-400" />Median {median.toFixed(2)}%</span>
        <span className="flex items-center gap-1"><span className="inline-block h-1 w-4 bg-primary/80 rounded-sm" />Normal dist.</span>
        <span className="text-muted-foreground/70">σ={std.toFixed(2)}%</span>
      </div>

      {/* Skewness / Kurtosis */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-white/5 bg-white/5 px-3 py-2">
          <div className="text-[11px] text-muted-foreground/70">Skewness</div>
          <div className={`text-sm font-bold ${skewness > 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {skewness.toFixed(3)}
          </div>
          <div className="text-[8px] text-muted-foreground/70">
            {Math.abs(skewness) < 0.5 ? "Roughly symmetric" : skewness > 0 ? "Right-tailed (positive)" : "Left-tailed (negative)"}
          </div>
        </div>
        <div className="rounded-lg border border-white/5 bg-white/5 px-3 py-2">
          <div className="text-[11px] text-muted-foreground/70">Excess Kurtosis</div>
          <div className={`text-sm font-bold ${kurtosis > 0 ? "text-amber-400" : "text-foreground"}`}>
            {kurtosis.toFixed(3)}
          </div>
          <div className="text-[8px] text-muted-foreground/70">
            {kurtosis > 1 ? "Fat tails (leptokurtic)" : kurtosis < -1 ? "Thin tails (platykurtic)" : "Near-normal tails"}
          </div>
        </div>
      </div>
    </div>
  );
}
