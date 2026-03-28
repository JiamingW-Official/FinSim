"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useTradingStore } from "@/stores/trading-store";

// ─── Types ────────────────────────────────────────────────────────────────────

type Objective = "maxSharpe" | "minVariance" | "maxReturn" | "riskParity";

interface TickerStats {
  ticker: string;
  annReturn: number; // decimal
  annVol: number;    // decimal
}

interface PortfolioPoint {
  vol: number;       // decimal
  ret: number;       // decimal
  sharpe: number;
  weights: number[]; // one per selected ticker
}

interface OptResult {
  weights: number[];
  vol: number;
  ret: number;
  sharpe: number;
}

// ─── All 10 tickers ───────────────────────────────────────────────────────────

const ALL_TICKERS = ["AAPL", "MSFT", "GOOG", "AMZN", "TSLA", "NVDA", "SPY", "QQQ", "BND", "GLD"];

// ─── Seeded PRNG (mulberry32) ─────────────────────────────────────────────────

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function tickerSeed(ticker: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < ticker.length; i++) {
    h ^= ticker.charCodeAt(i);
    h = Math.imul(h, 0x01000193) | 0;
  }
  return h >>> 0;
}

// ─── Synthetic historical stats (from seeded PRNG) ───────────────────────────

const TICKER_BASES: Record<string, { ret: number; vol: number }> = {
  AAPL: { ret: 0.145, vol: 0.28 },
  MSFT: { ret: 0.138, vol: 0.255 },
  GOOG: { ret: 0.120, vol: 0.270 },
  AMZN: { ret: 0.152, vol: 0.300 },
  TSLA: { ret: 0.180, vol: 0.550 },
  NVDA: { ret: 0.220, vol: 0.480 },
  SPY:  { ret: 0.102, vol: 0.165 },
  QQQ:  { ret: 0.120, vol: 0.200 },
  BND:  { ret: 0.035, vol: 0.045 },
  GLD:  { ret: 0.060, vol: 0.140 },
};

// Generate synthetic 252-day return series from seeded PRNG
function generateReturnSeries(ticker: string, days = 504): number[] {
  const base = TICKER_BASES[ticker] ?? { ret: 0.08, vol: 0.25 };
  const dailyRet = base.ret / 252;
  const dailyVol = base.vol / Math.sqrt(252);
  const rand = mulberry32(tickerSeed(ticker));
  const series: number[] = [];
  for (let i = 0; i < days; i++) {
    // Box-Muller normal
    const u1 = rand();
    const u2 = rand();
    const z = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2);
    series.push(dailyRet + dailyVol * z);
  }
  return series;
}

// Compute annualized return and vol from series
function computeStats(series: number[]): { annReturn: number; annVol: number } {
  const mean = series.reduce((a, b) => a + b, 0) / series.length;
  const variance = series.reduce((a, b) => a + (b - mean) ** 2, 0) / (series.length - 1);
  return {
    annReturn: mean * 252,
    annVol: Math.sqrt(variance * 252),
  };
}

// Compute correlation matrix from return series
function computeCorrelationMatrix(
  tickers: string[],
  seriesMap: Record<string, number[]>,
): number[][] {
  const n = tickers.length;
  const corr: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) { corr[i][j] = 1; continue; }
      const a = seriesMap[tickers[i]];
      const b = seriesMap[tickers[j]];
      const len = Math.min(a.length, b.length);
      const meanA = a.slice(0, len).reduce((s, v) => s + v, 0) / len;
      const meanB = b.slice(0, len).reduce((s, v) => s + v, 0) / len;
      let cov = 0, varA = 0, varB = 0;
      for (let k = 0; k < len; k++) {
        cov  += (a[k] - meanA) * (b[k] - meanB);
        varA += (a[k] - meanA) ** 2;
        varB += (b[k] - meanB) ** 2;
      }
      const denom = Math.sqrt(varA * varB);
      corr[i][j] = denom > 0 ? cov / denom : 0;
    }
  }
  return corr;
}

// Build covariance matrix from vols + correlation
function buildCovMatrix(stats: TickerStats[], corrMatrix: number[][]): number[][] {
  const n = stats.length;
  const cov: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      cov[i][j] = corrMatrix[i][j] * stats[i].annVol * stats[j].annVol;
    }
  }
  return cov;
}

// Portfolio return / vol / sharpe
function portfolioMetrics(
  weights: number[],
  stats: TickerStats[],
  cov: number[][],
  rfRate: number,
): { vol: number; ret: number; sharpe: number } {
  const n = stats.length;
  let ret = 0;
  for (let i = 0; i < n; i++) ret += weights[i] * stats[i].annReturn;
  let varP = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      varP += weights[i] * weights[j] * cov[i][j];
    }
  }
  const vol = Math.sqrt(Math.max(varP, 0));
  const sharpe = vol > 0 ? (ret - rfRate) / vol : 0;
  return { vol, ret, sharpe };
}

function normalizeWeights(w: number[], minW: number, maxW: number): number[] {
  // Clamp to [minW, maxW] then normalize
  const clamped = w.map((x) => Math.min(maxW, Math.max(minW, x)));
  const sum = clamped.reduce((s, x) => s + x, 0);
  return sum > 0 ? clamped.map((x) => x / sum) : clamped.map(() => 1 / clamped.length);
}

// ─── Monte Carlo + Optimization ───────────────────────────────────────────────

function generateScatterPoints(
  stats: TickerStats[],
  cov: number[][],
  rfRate: number,
  minW: number,
  maxW: number,
  samples = 500,
): PortfolioPoint[] {
  const n = stats.length;
  const points: PortfolioPoint[] = [];

  // mulberry32 seeded with a fixed seed so SSR-safe
  const rand = mulberry32(0xdeadbeef);

  for (let s = 0; s < samples; s++) {
    const raw = Array.from({ length: n }, () => rand());
    const weights = normalizeWeights(raw, minW, maxW);
    const m = portfolioMetrics(weights, stats, cov, rfRate);
    points.push({ vol: m.vol, ret: m.ret, sharpe: m.sharpe, weights });
  }
  return points;
}

function optimizePortfolio(
  objective: Objective,
  stats: TickerStats[],
  cov: number[][],
  rfRate: number,
  minW: number,
  maxW: number,
): OptResult {
  const n = stats.length;
  if (n === 0) return { weights: [], vol: 0, ret: 0, sharpe: 0 };

  let weights = Array(n).fill(1 / n);

  const ITERS = 3000;

  if (objective === "riskParity") {
    // Risk parity: equalize marginal risk contributions
    for (let iter = 0; iter < ITERS; iter++) {
      const lr = 0.01;
      // Marginal risk contribution for each asset
      const grad = Array(n).fill(0);
      const { vol } = portfolioMetrics(weights, stats, cov, rfRate);
      if (vol === 0) break;
      for (let i = 0; i < n; i++) {
        let mrc = 0;
        for (let j = 0; j < n; j++) mrc += cov[i][j] * weights[j];
        mrc /= vol;
        const rc = weights[i] * mrc; // risk contribution
        const targetRc = vol / n;    // equal risk contribution
        grad[i] = rc - targetRc;
      }
      weights = weights.map((w, i) => Math.max(minW, w - lr * grad[i]));
      weights = normalizeWeights(weights, minW, maxW);
    }
  } else if (objective === "minVariance") {
    for (let iter = 0; iter < ITERS; iter++) {
      const lr = 0.01;
      const grad = Array(n).fill(0);
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          grad[i] += 2 * weights[j] * cov[i][j];
        }
      }
      weights = weights.map((w, i) => Math.max(minW, w - lr * grad[i]));
      weights = normalizeWeights(weights, minW, maxW);
    }
  } else if (objective === "maxSharpe") {
    for (let iter = 0; iter < ITERS; iter++) {
      const lr = 0.008;
      const { ret, vol } = portfolioMetrics(weights, stats, cov, rfRate);
      const grad = Array(n).fill(0);
      for (let i = 0; i < n; i++) {
        const dRet = stats[i].annReturn;
        let dVar = 0;
        for (let j = 0; j < n; j++) dVar += 2 * weights[j] * cov[i][j];
        const dVol = vol > 0 ? dVar / (2 * vol) : 0;
        grad[i] = (dRet * vol - (ret - rfRate) * dVol) / (vol * vol + 1e-12);
      }
      weights = weights.map((w, i) => Math.max(minW, w + lr * grad[i]));
      weights = normalizeWeights(weights, minW, maxW);
    }
  } else {
    // maxReturn: maximize weighted return
    for (let iter = 0; iter < ITERS; iter++) {
      const lr = 0.02;
      const grad = stats.map((s) => s.annReturn);
      weights = weights.map((w, i) => Math.max(minW, w + lr * grad[i]));
      weights = normalizeWeights(weights, minW, maxW);
    }
  }

  const m = portfolioMetrics(weights, stats, cov, rfRate);
  return { weights, vol: m.vol, ret: m.ret, sharpe: m.sharpe };
}

// Efficient frontier envelope (min-vol per return bucket)
function extractFrontierCurve(points: PortfolioPoint[]): PortfolioPoint[] {
  const sorted = [...points].sort((a, b) => a.ret - b.ret);
  if (sorted.length === 0) return [];
  const minR = sorted[0].ret;
  const maxR = sorted[sorted.length - 1].ret;
  const buckets = 30;
  const range = maxR - minR;
  const curve: PortfolioPoint[] = [];
  for (let b = 0; b < buckets; b++) {
    const lo = minR + (b / buckets) * range;
    const hi = minR + ((b + 1) / buckets) * range;
    const bucket = sorted.filter((p) => p.ret >= lo && p.ret < hi);
    if (bucket.length > 0) {
      curve.push(bucket.reduce((best, p) => (p.vol < best.vol ? p : best)));
    }
  }
  return curve;
}

// ─── SVG: Efficient Frontier Scatter Chart ────────────────────────────────────

function sharpeToColor(sharpe: number, minS: number, maxS: number): string {
  const t = maxS > minS ? (sharpe - minS) / (maxS - minS) : 0.5;
  const clamped = Math.max(0, Math.min(1, t));
  if (clamped < 0.5) {
    // blue → yellow
    const f = clamped * 2;
    const r = Math.round(59 + f * (234 - 59));
    const g = Math.round(130 + f * (179 - 130));
    const b = Math.round(246 + f * (8 - 246));
    return `rgb(${r},${g},${b})`;
  } else {
    // yellow → green
    const f = (clamped - 0.5) * 2;
    const r = Math.round(234 + f * (16 - 234));
    const g = Math.round(179 + f * (185 - 179));
    const b = Math.round(8 + f * (129 - 8));
    return `rgb(${r},${g},${b})`;
  }
}

// Diamond SVG path centered at cx,cy with size r
function diamondPath(cx: number, cy: number, r: number): string {
  return `M${cx},${cy - r} L${cx + r},${cy} L${cx},${cy + r} L${cx - r},${cy} Z`;
}

// Star SVG path centered at cx,cy with outer radius r
function starPath(cx: number, cy: number, r: number): string {
  const inner = r * 0.45;
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : inner;
    pts.push(`${(cx + Math.cos(angle) * rad).toFixed(1)},${(cy + Math.sin(angle) * rad).toFixed(1)}`);
  }
  return `M${pts.join("L")}Z`;
}

interface FrontierChartProps {
  points: PortfolioPoint[];
  frontierCurve: PortfolioPoint[];
  optimal: PortfolioPoint;
  minVar: PortfolioPoint;
  currentPoint: PortfolioPoint | null;
  objective: Objective;
}

function FrontierChart({
  points,
  frontierCurve,
  optimal,
  minVar,
  currentPoint,
  objective,
}: FrontierChartProps) {
  const W = 340;
  const H = 220;
  const PAD = { top: 20, right: 20, bottom: 38, left: 48 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const allVols = [
    ...points.map((p) => p.vol),
    optimal.vol, minVar.vol,
    ...(currentPoint ? [currentPoint.vol] : []),
  ];
  const allRets = [
    ...points.map((p) => p.ret),
    optimal.ret, minVar.ret,
    ...(currentPoint ? [currentPoint.ret] : []),
  ];

  const minVol = Math.max(0, Math.min(...allVols) * 0.95);
  const maxVol = Math.max(...allVols) * 1.05;
  const minRet = Math.min(...allRets) - Math.abs(Math.min(...allRets)) * 0.05 - 0.002;
  const maxRet = Math.max(...allRets) * 1.05;

  const toX = (v: number) => PAD.left + ((v - minVol) / (maxVol - minVol || 1)) * chartW;
  const toY = (r: number) => PAD.top + chartH - ((r - minRet) / (maxRet - minRet || 1)) * chartH;

  const minS = Math.min(...points.map((p) => p.sharpe));
  const maxS = Math.max(...points.map((p) => p.sharpe));

  // Build frontier path
  const curvePts = [...frontierCurve].sort((a, b) => a.ret - b.ret);
  const lineD = curvePts.length >= 2
    ? curvePts
        .map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.vol).toFixed(1)},${toY(p.ret).toFixed(1)}`)
        .join(" ")
    : "";

  // Grid ticks
  const xTicks = 4;
  const yTicks = 4;
  const xTickVals = Array.from({ length: xTicks + 1 }, (_, i) => minVol + (i / xTicks) * (maxVol - minVol));
  const yTickVals = Array.from({ length: yTicks + 1 }, (_, i) => minRet + (i / yTicks) * (maxRet - minRet));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {/* Grid */}
      {yTickVals.map((r, i) => (
        <line
          key={`ygrid-${i}`}
          x1={PAD.left} x2={W - PAD.right}
          y1={toY(r)} y2={toY(r)}
          stroke="currentColor" strokeOpacity={0.06} strokeDasharray="3,3"
        />
      ))}
      {xTickVals.map((v, i) => (
        <line
          key={`xgrid-${i}`}
          x1={toX(v)} x2={toX(v)}
          y1={PAD.top} y2={H - PAD.bottom}
          stroke="currentColor" strokeOpacity={0.06} strokeDasharray="3,3"
        />
      ))}

      {/* Scatter points colored by Sharpe */}
      {points.map((p, i) => (
        <circle
          key={`dot-${i}`}
          cx={toX(p.vol)} cy={toY(p.ret)}
          r={2}
          fill={sharpeToColor(p.sharpe, minS, maxS)}
          fillOpacity={0.55}
        />
      ))}

      {/* Frontier curve */}
      {lineD && (
        <path d={lineD} fill="none" stroke="#60a5fa" strokeWidth={2} strokeOpacity={0.8} />
      )}

      {/* Current portfolio — star */}
      {currentPoint && (
        <g>
          <path
            d={starPath(toX(currentPoint.vol), toY(currentPoint.ret), 7)}
            fill="#f59e0b"
            stroke="#fcd34d"
            strokeWidth={0.8}
          />
          <text
            x={toX(currentPoint.vol) + 10}
            y={toY(currentPoint.ret) + 4}
            fontSize={8} fill="#f59e0b" fontWeight={600}
          >
            Current
          </text>
        </g>
      )}

      {/* Optimal portfolio — diamond */}
      <g>
        <path
          d={diamondPath(toX(optimal.vol), toY(optimal.ret), 7)}
          fill="#a78bfa"
          stroke="#c4b5fd"
          strokeWidth={0.8}
        />
        <text
          x={toX(optimal.vol) + 10}
          y={toY(optimal.ret) + 4}
          fontSize={8} fill="#a78bfa" fontWeight={600}
        >
          {objective === "minVariance" ? "Min-Var" :
           objective === "maxReturn" ? "Max-Ret" :
           objective === "riskParity" ? "Parity" : "Max-Sharpe"}
        </text>
      </g>

      {/* Min variance — circle */}
      {objective !== "minVariance" && (
        <g>
          <circle
            cx={toX(minVar.vol)} cy={toY(minVar.ret)}
            r={5}
            fill="#10b981" stroke="#34d399" strokeWidth={0.8}
          />
          <text
            x={toX(minVar.vol) + 8}
            y={toY(minVar.ret) + 4}
            fontSize={8} fill="#10b981" fontWeight={600}
          >
            Min-Var
          </text>
        </g>
      )}

      {/* Axes */}
      <line x1={PAD.left} x2={W - PAD.right} y1={H - PAD.bottom} y2={H - PAD.bottom}
        stroke="currentColor" strokeOpacity={0.2} />
      <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={H - PAD.bottom}
        stroke="currentColor" strokeOpacity={0.2} />

      {/* X ticks */}
      {xTickVals.map((v, i) => (
        <text key={`xt-${i}`} x={toX(v)} y={H - PAD.bottom + 14}
          textAnchor="middle" fontSize={7} fill="currentColor" fillOpacity={0.5}>
          {(v * 100).toFixed(0)}%
        </text>
      ))}

      {/* Y ticks */}
      {yTickVals.map((r, i) => (
        <text key={`yt-${i}`} x={PAD.left - 5} y={toY(r) + 3}
          textAnchor="end" fontSize={7} fill="currentColor" fillOpacity={0.5}>
          {(r * 100).toFixed(1)}%
        </text>
      ))}

      {/* Axis labels */}
      <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={7.5}
        fill="currentColor" fillOpacity={0.4}>
        Portfolio Volatility (%)
      </text>
      <text x={11} y={H / 2} textAnchor="middle" fontSize={7.5}
        fill="currentColor" fillOpacity={0.4}
        transform={`rotate(-90, 11, ${H / 2})`}>
        Expected Return (%)
      </text>

      {/* Sharpe color legend */}
      <defs>
        <linearGradient id="sharpeGrad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%"   stopColor="rgb(59,130,246)" />
          <stop offset="50%"  stopColor="rgb(234,179,8)" />
          <stop offset="100%" stopColor="rgb(16,185,129)" />
        </linearGradient>
      </defs>
      <rect x={PAD.left} y={PAD.top - 12} width={60} height={5} rx={2}
        fill="url(#sharpeGrad)" />
      <text x={PAD.left} y={PAD.top - 14} fontSize={6.5} fill="currentColor" fillOpacity={0.4}>
        Low Sharpe
      </text>
      <text x={PAD.left + 63} y={PAD.top - 14} fontSize={6.5} fill="currentColor" fillOpacity={0.4}>
        High
      </text>
    </svg>
  );
}

// ─── SVG: Correlation Heatmap ─────────────────────────────────────────────────

function corrColor(v: number): string {
  // red=+1, white=0, blue=-1
  if (v >= 0) {
    const t = Math.min(1, v);
    const r = Math.round(220 - t * 20);
    const g = Math.round(220 - t * 150);
    const b = Math.round(220 - t * 160);
    return `rgb(${r},${g},${b})`;
  } else {
    const t = Math.min(1, -v);
    const r = Math.round(220 - t * 160);
    const g = Math.round(220 - t * 150);
    const b = Math.round(220 - t * 20);
    return `rgb(${r},${g},${b})`;
  }
}

function corrTextColor(v: number): string {
  return Math.abs(v) > 0.55 ? "#fff" : "#6b7280";
}

function CorrelationHeatmapSVG({
  tickers,
  corrMatrix,
}: {
  tickers: string[];
  corrMatrix: number[][];
}) {
  const n = tickers.length;
  const cell = 38;
  const labelW = 38;
  const labelH = 30;
  const svgW = labelW + n * cell;
  const svgH = labelH + n * cell;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        width={svgW}
        height={svgH}
        className="block mx-auto"
      >
        {/* Column labels */}
        {tickers.map((t, i) => (
          <text
            key={`col-${t}`}
            x={labelW + i * cell + cell / 2}
            y={labelH - 5}
            textAnchor="middle"
            fontSize={8}
            fontFamily="monospace"
            fontWeight={500}
            fill="currentColor"
            fillOpacity={0.6}
          >
            {t}
          </text>
        ))}
        {/* Row labels */}
        {tickers.map((t, i) => (
          <text
            key={`row-${t}`}
            x={labelW - 3}
            y={labelH + i * cell + cell / 2 + 3}
            textAnchor="end"
            fontSize={8}
            fontFamily="monospace"
            fontWeight={500}
            fill="currentColor"
            fillOpacity={0.6}
          >
            {t}
          </text>
        ))}
        {/* Cells */}
        {corrMatrix.map((row, i) =>
          row.map((val, j) => {
            const x = labelW + j * cell;
            const y = labelH + i * cell;
            return (
              <g key={`${i}-${j}`}>
                <rect
                  x={x + 0.5} y={y + 0.5}
                  width={cell - 1} height={cell - 1}
                  rx={2}
                  fill={corrColor(val)}
                />
                <text
                  x={x + cell / 2}
                  y={y + cell / 2 + 3}
                  textAnchor="middle"
                  fontSize={7.5}
                  fontFamily="monospace"
                  fill={corrTextColor(val)}
                >
                  {val.toFixed(2)}
                </text>
              </g>
            );
          }),
        )}
      </svg>
    </div>
  );
}

// ─── Weights Table with buy/sell recommendation ───────────────────────────────

interface WeightRow {
  ticker: string;
  targetWeight: number;   // decimal
  currentWeight: number;  // decimal
  currentShares: number;
  targetShares: number;
  action: "buy" | "sell" | "hold";
  delta: number;          // shares delta
}

function buildWeightTable(
  tickers: string[],
  optWeights: number[],
  positions: Array<{ ticker: string; quantity: number; currentPrice: number }>,
  portfolioValue: number,
): WeightRow[] {
  return tickers.map((ticker, i) => {
    const pos = positions.find((p) => p.ticker === ticker);
    const currentShares = pos?.quantity ?? 0;
    const price = pos?.currentPrice ?? 100;
    const currentValue = currentShares * price;
    const currentWeight = portfolioValue > 0 ? currentValue / portfolioValue : 0;
    const targetWeight = optWeights[i] ?? 0;
    const targetValue = targetWeight * portfolioValue;
    const targetShares = price > 0 ? Math.round(targetValue / price) : 0;
    const delta = targetShares - currentShares;
    const action: "buy" | "sell" | "hold" =
      delta > 0 ? "buy" : delta < 0 ? "sell" : "hold";
    return { ticker, targetWeight, currentWeight, currentShares, targetShares, action, delta };
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function EfficientFrontier() {
  const positions = useTradingStore((s) => s.positions);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);

  // Controls
  const [selectedTickers, setSelectedTickers] = useState<string[]>([
    "AAPL", "MSFT", "GOOG", "AMZN", "SPY",
  ]);
  const [minWeight, setMinWeight] = useState(0);    // %
  const [maxWeight, setMaxWeight] = useState(60);   // %
  const [rfRate, setRfRate] = useState(5.25);       // %
  const [objective, setObjective] = useState<Objective>("maxSharpe");

  const toggleTicker = useCallback((ticker: string) => {
    setSelectedTickers((prev) => {
      if (prev.includes(ticker)) {
        if (prev.length <= 2) return prev; // keep at least 2
        return prev.filter((t) => t !== ticker);
      }
      return [...prev, ticker];
    });
  }, []);

  // Compute synthetic series and stats
  const seriesMap = useMemo<Record<string, number[]>>(() => {
    const map: Record<string, number[]> = {};
    for (const t of ALL_TICKERS) map[t] = generateReturnSeries(t, 504);
    return map;
  }, []);

  const statsMap = useMemo<Record<string, TickerStats>>(() => {
    const map: Record<string, TickerStats> = {};
    for (const t of ALL_TICKERS) {
      const s = computeStats(seriesMap[t]);
      map[t] = { ticker: t, annReturn: s.annReturn, annVol: s.annVol };
    }
    return map;
  }, [seriesMap]);

  const selStats = useMemo(
    () => selectedTickers.map((t) => statsMap[t]),
    [selectedTickers, statsMap],
  );

  const corrMatrix = useMemo(
    () => computeCorrelationMatrix(selectedTickers, seriesMap),
    [selectedTickers, seriesMap],
  );

  const cov = useMemo(
    () => buildCovMatrix(selStats, corrMatrix),
    [selStats, corrMatrix],
  );

  const rf = rfRate / 100;
  const minW = minWeight / 100;
  const maxW = maxWeight / 100;

  // Monte Carlo scatter
  const scatterPoints = useMemo(
    () => generateScatterPoints(selStats, cov, rf, minW, maxW, 500),
    [selStats, cov, rf, minW, maxW],
  );

  // Efficient frontier curve
  const frontierCurve = useMemo(
    () => extractFrontierCurve(scatterPoints),
    [scatterPoints],
  );

  // Optimize for chosen objective
  const optimal = useMemo(
    () => optimizePortfolio(objective, selStats, cov, rf, minW, maxW),
    [objective, selStats, cov, rf, minW, maxW],
  );

  const optimalPoint: PortfolioPoint = {
    vol: optimal.vol, ret: optimal.ret, sharpe: optimal.sharpe, weights: optimal.weights,
  };

  // Min-variance (always compute as reference)
  const minVarOpt = useMemo(
    () => optimizePortfolio("minVariance", selStats, cov, rf, minW, maxW),
    [selStats, cov, rf, minW, maxW],
  );
  const minVarPoint: PortfolioPoint = {
    vol: minVarOpt.vol, ret: minVarOpt.ret, sharpe: minVarOpt.sharpe, weights: minVarOpt.weights,
  };

  // Current portfolio point from actual positions
  const currentPoint = useMemo<PortfolioPoint | null>(() => {
    const selPositions = selectedTickers.map((t) => positions.find((p) => p.ticker === t));
    const hasPositions = selPositions.some(Boolean);
    if (!hasPositions) return null;

    const total = portfolioValue || 1;
    const weights: number[] = selectedTickers.map((t) => {
      const pos = positions.find((p) => p.ticker === t);
      if (!pos) return 0;
      return (pos.quantity * pos.currentPrice) / total;
    });
    const sum = weights.reduce((s, w) => s + w, 0);
    const norm = sum > 0 ? weights.map((w) => w / sum) : weights.map(() => 1 / weights.length);
    const m = portfolioMetrics(norm, selStats, cov, rf);
    return { vol: m.vol, ret: m.ret, sharpe: m.sharpe, weights: norm };
  }, [selectedTickers, positions, portfolioValue, selStats, cov, rf]);

  // Weight rows for table
  const weightRows = useMemo(
    () => buildWeightTable(selectedTickers, optimal.weights, positions, portfolioValue),
    [selectedTickers, optimal.weights, positions, portfolioValue],
  );

  // Equal-weight current stats for comparison
  const eqWeights = useMemo(
    () => selStats.map(() => 1 / selStats.length),
    [selStats],
  );
  const eqStats = useMemo(
    () => portfolioMetrics(eqWeights, selStats, cov, rf),
    [eqWeights, selStats, cov, rf],
  );

  return (
    <div className="space-y-4">
      {/* ── Controls ── */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <h3 className="text-sm font-semibold">Efficient Frontier Optimizer</h3>

        {/* Asset Universe */}
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground mb-2">
            Asset Universe
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_TICKERS.map((ticker) => {
              const selected = selectedTickers.includes(ticker);
              const s = statsMap[ticker];
              return (
                <button
                  key={ticker}
                  type="button"
                  onClick={() => toggleTicker(ticker)}
                  className={cn(
                    "flex flex-col items-center rounded-md border px-2.5 py-1.5 text-[10px] font-semibold transition-colors",
                    selected
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/30",
                  )}
                >
                  <span>{ticker}</span>
                  {s && (
                    <span className={cn(
                      "text-[8px] font-normal mt-0.5",
                      s.annReturn >= 0 ? "text-emerald-400" : "text-red-400",
                    )}>
                      {(s.annReturn * 100).toFixed(1)}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-[9px] text-muted-foreground mt-1">
            {selectedTickers.length} selected (min 2)
          </p>
        </div>

        {/* Constraints row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Min Weight */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-medium text-muted-foreground">Min Weight</label>
              <span className="text-[10px] font-mono text-foreground">{minWeight}%</span>
            </div>
            <input
              type="range" min={0} max={20} step={1}
              value={minWeight}
              onChange={(e) => {
                const v = Number(e.target.value);
                setMinWeight(v);
                if (v >= maxWeight) setMaxWeight(Math.min(100, v + 10));
              }}
              className="w-full h-1 accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[8px] text-muted-foreground/60">
              <span>0%</span><span>20%</span>
            </div>
          </div>

          {/* Max Weight */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-medium text-muted-foreground">Max Weight</label>
              <span className="text-[10px] font-mono text-foreground">{maxWeight}%</span>
            </div>
            <input
              type="range" min={20} max={100} step={5}
              value={maxWeight}
              onChange={(e) => setMaxWeight(Number(e.target.value))}
              className="w-full h-1 accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[8px] text-muted-foreground/60">
              <span>20%</span><span>100%</span>
            </div>
          </div>

          {/* Risk-free rate */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-medium text-muted-foreground">Risk-Free Rate</label>
              <span className="text-[10px] font-mono text-foreground">{rfRate.toFixed(2)}%</span>
            </div>
            <input
              type="range" min={0} max={10} step={0.25}
              value={rfRate}
              onChange={(e) => setRfRate(Number(e.target.value))}
              className="w-full h-1 accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[8px] text-muted-foreground/60">
              <span>0%</span><span>10%</span>
            </div>
          </div>
        </div>

        {/* Objective */}
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground mb-2">
            Optimization Objective
          </p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { value: "maxSharpe",    label: "Max Sharpe",    color: "text-violet-400" },
                { value: "minVariance",  label: "Min Variance",  color: "text-emerald-400" },
                { value: "maxReturn",    label: "Max Return",    color: "text-amber-400" },
                { value: "riskParity",   label: "Risk Parity",   color: "text-cyan-400" },
              ] as { value: Objective; label: string; color: string }[]
            ).map(({ value, label, color }) => (
              <label key={value} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="objective"
                  checked={objective === value}
                  onChange={() => setObjective(value)}
                  className="accent-primary"
                />
                <span className={cn(
                  "text-[11px] font-medium",
                  objective === value ? color : "text-muted-foreground",
                )}>
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ── Efficient Frontier Chart ── */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Efficient Frontier — {scatterPoints.length} random portfolios
          </p>
        </div>
        <div className="rounded-lg border border-border/50 bg-muted/20 p-2">
          <FrontierChart
            points={scatterPoints}
            frontierCurve={frontierCurve}
            optimal={optimalPoint}
            minVar={minVarPoint}
            currentPoint={currentPoint}
            objective={objective}
          />
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-3 justify-center">
          <div className="flex items-center gap-1">
            <svg width={14} height={14} viewBox="0 0 14 14">
              <path d={starPath(7, 7, 6)} fill="#f59e0b" />
            </svg>
            <span className="text-[9px] text-muted-foreground">Current Portfolio</span>
          </div>
          <div className="flex items-center gap-1">
            <svg width={14} height={14} viewBox="0 0 14 14">
              <path d={diamondPath(7, 7, 6)} fill="#a78bfa" />
            </svg>
            <span className="text-[9px] text-muted-foreground">Optimal Portfolio</span>
          </div>
          {objective !== "minVariance" && (
            <div className="flex items-center gap-1">
              <svg width={14} height={14} viewBox="0 0 14 14">
                <circle cx={7} cy={7} r={5} fill="#10b981" />
              </svg>
              <span className="text-[9px] text-muted-foreground">Min Variance</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <div className="w-6 h-1 rounded-full bg-blue-400" />
            <span className="text-[9px] text-muted-foreground">Frontier curve</span>
          </div>
        </div>
      </div>

      {/* ── Optimal Portfolio Results ── */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <h4 className="text-sm font-semibold">Optimal Portfolio Results</h4>

        {/* Stats comparison */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Expected Return", curr: eqStats.ret * 100, opt: optimal.ret * 100, fmt: (v: number) => `${v.toFixed(1)}%`, up: true },
            { label: "Volatility",      curr: eqStats.vol * 100, opt: optimal.vol * 100, fmt: (v: number) => `${v.toFixed(1)}%`, up: false },
            { label: "Sharpe Ratio",    curr: eqStats.sharpe,    opt: optimal.sharpe,    fmt: (v: number) => v.toFixed(2),        up: true },
          ].map(({ label, curr, opt, fmt, up }) => {
            const better = up ? opt > curr : opt < curr;
            const diff = opt - curr;
            return (
              <div key={label} className="space-y-2">
                <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-muted-foreground">Current</span>
                    <span className="text-[10px] font-mono tabular-nums text-muted-foreground">
                      {fmt(curr)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-medium text-primary">Optimal</span>
                    <span className={cn(
                      "text-[10px] font-mono tabular-nums font-semibold",
                      better ? "text-emerald-400" : "text-red-400",
                    )}>
                      {fmt(opt)}
                    </span>
                  </div>
                  <div className={cn(
                    "text-[9px] font-mono text-right",
                    better ? "text-emerald-400/70" : "text-red-400/70",
                  )}>
                    {diff > 0 ? "+" : ""}{fmt(diff)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Weight table */}
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground mb-2">
            Recommended Weights
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/60 text-[10px] text-muted-foreground">
                  <th className="text-left py-1.5 px-1 font-medium">Ticker</th>
                  <th className="text-right py-1.5 px-1 font-medium">Target %</th>
                  <th className="text-right py-1.5 px-1 font-medium">Current %</th>
                  <th className="text-right py-1.5 px-1 font-medium">Action</th>
                  <th className="text-right py-1.5 px-1 font-medium">Shares Delta</th>
                </tr>
              </thead>
              <tbody>
                {weightRows.map((row) => (
                  <tr key={row.ticker} className="border-b border-border/30">
                    <td className="py-1.5 px-1 font-semibold">{row.ticker}</td>
                    <td className="py-1.5 px-1 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-violet-500/70"
                            style={{ width: `${Math.min(100, row.targetWeight * 100).toFixed(1)}%` }}
                          />
                        </div>
                        <span className="font-mono tabular-nums w-8 text-right">
                          {(row.targetWeight * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-1.5 px-1 text-right font-mono tabular-nums text-muted-foreground">
                      {(row.currentWeight * 100).toFixed(1)}%
                    </td>
                    <td className="py-1.5 px-1 text-right">
                      <span className={cn(
                        "rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase",
                        row.action === "buy"
                          ? "bg-emerald-500/12 text-emerald-400"
                          : row.action === "sell"
                          ? "bg-red-500/12 text-red-400"
                          : "bg-muted text-muted-foreground",
                      )}>
                        {row.action}
                      </span>
                    </td>
                    <td className={cn(
                      "py-1.5 px-1 text-right font-mono tabular-nums text-[11px]",
                      row.delta > 0 ? "text-emerald-400" : row.delta < 0 ? "text-red-400" : "text-muted-foreground",
                    )}>
                      {row.delta > 0 ? "+" : ""}{row.delta}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Correlation Matrix ── */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Correlation Matrix</h4>
          <span className="text-[10px] text-muted-foreground">
            {selectedTickers.length}×{selectedTickers.length} — synthetic 2-year returns
          </span>
        </div>
        <CorrelationHeatmapSVG tickers={selectedTickers} corrMatrix={corrMatrix} />
        {/* Color legend */}
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-[8px] text-muted-foreground">-1 (blue)</span>
          <div className="flex h-2 w-24 rounded-sm overflow-hidden">
            {Array.from({ length: 21 }, (_, i) => {
              const v = -1 + i * 0.1;
              return (
                <div key={i} className="flex-1 h-full" style={{ backgroundColor: corrColor(v) }} />
              );
            })}
          </div>
          <span className="text-[8px] text-muted-foreground">+1 (red)</span>
        </div>
        <p className="text-[9px] text-muted-foreground leading-relaxed">
          Correlation measures how assets move together. Values near +1 (red) indicate assets
          move in tandem — poor diversification. Values near -1 (blue) indicate inverse movement —
          excellent hedging. Target a mix of low/negative correlations for a well-diversified portfolio.
        </p>
      </div>

      <p className="text-[9px] text-muted-foreground leading-relaxed px-1">
        Efficient Frontier based on Modern Portfolio Theory (Markowitz, 1952). Returns and
        volatilities derived from synthetic 2-year daily return series. Optimization uses
        gradient-based iterative solvers (3,000 iterations). Results are illustrative —
        past/simulated performance does not guarantee future results.
      </p>
    </div>
  );
}
