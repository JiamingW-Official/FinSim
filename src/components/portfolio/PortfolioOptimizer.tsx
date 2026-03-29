"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

// ─── mulberry32 PRNG ──────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return function () {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) >>> 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Asset Universe ───────────────────────────────────────────────────────────

const TICKERS = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA",
  "META", "TSLA", "JPM",  "JNJ",  "XOM",
  "GLD",  "TLT",  "AGG",  "VNQ",  "BTC",
];

// Sector mapping
const TICKER_SECTOR: Record<string, string> = {
  AAPL: "Tech", MSFT: "Tech", GOOGL: "Tech", AMZN: "Tech", NVDA: "Tech",
  META: "Tech", TSLA: "Consumer", JPM: "Finance", JNJ: "Healthcare",
  XOM: "Energy", GLD: "Commodity", TLT: "Bond", AGG: "Bond",
  VNQ: "REIT", BTC: "Crypto",
};

// Factor loadings (Value P/B proxy, Momentum, Quality, Beta)
const TICKER_FACTORS: Record<string, { pb: number; momentum12m: number; roe: number; beta: number }> = {
  AAPL:  { pb: 9.2,  momentum12m: 0.14,  roe: 1.47, beta: 1.20 },
  MSFT:  { pb: 11.5, momentum12m: 0.11,  roe: 0.38, beta: 0.90 },
  GOOGL: { pb: 6.3,  momentum12m: 0.08,  roe: 0.28, beta: 1.05 },
  AMZN:  { pb: 8.1,  momentum12m: 0.22,  roe: 0.21, beta: 1.25 },
  NVDA:  { pb: 30.0, momentum12m: 1.10,  roe: 0.55, beta: 1.65 },
  META:  { pb: 7.4,  momentum12m: 0.35,  roe: 0.30, beta: 1.15 },
  TSLA:  { pb: 12.0, momentum12m: -0.08, roe: 0.17, beta: 2.10 },
  JPM:   { pb: 1.8,  momentum12m: 0.12,  roe: 0.15, beta: 1.05 },
  JNJ:   { pb: 5.2,  momentum12m: -0.03, roe: 0.24, beta: 0.55 },
  XOM:   { pb: 2.1,  momentum12m: 0.05,  roe: 0.14, beta: 0.85 },
  GLD:   { pb: 1.0,  momentum12m: 0.18,  roe: 0.00, beta: 0.10 },
  TLT:   { pb: 1.0,  momentum12m: -0.06, roe: 0.00, beta: -0.20 },
  AGG:   { pb: 1.0,  momentum12m: -0.02, roe: 0.00, beta: -0.10 },
  VNQ:   { pb: 2.3,  momentum12m: 0.04,  roe: 0.08, beta: 0.70 },
  BTC:   { pb: 3.5,  momentum12m: 0.85,  roe: 0.00, beta: 1.80 },
};

// Dividend yields for income section
const TICKER_DIV_YIELD: Record<string, number> = {
  AAPL: 0.5, MSFT: 0.7, GOOGL: 0.0, AMZN: 0.0, NVDA: 0.1,
  META: 0.4, TSLA: 0.0, JPM: 2.4, JNJ: 2.9, XOM: 3.5,
  GLD: 0.0, TLT: 3.8, AGG: 3.2, VNQ: 4.1, BTC: 0.0,
};

// ─── Seeded synthetic data generation ────────────────────────────────────────

function generateSyntheticData(seed = 9999) {
  const rng = mulberry32(seed);

  // Expected annual returns (%)
  const expectedReturns: Record<string, number> = {
    AAPL:  12 + rng() * 6,
    MSFT:  11 + rng() * 5,
    GOOGL: 10 + rng() * 5,
    AMZN:  13 + rng() * 6,
    NVDA:  18 + rng() * 10,
    META:  14 + rng() * 7,
    TSLA:  8  + rng() * 15,
    JPM:   9  + rng() * 4,
    JNJ:   6  + rng() * 3,
    XOM:   8  + rng() * 4,
    GLD:   5  + rng() * 4,
    TLT:   3  + rng() * 2,
    AGG:   3  + rng() * 1.5,
    VNQ:   7  + rng() * 4,
    BTC:   20 + rng() * 25,
  };

  // Volatilities (%)
  const vols: Record<string, number> = {
    AAPL:  22 + rng() * 8,
    MSFT:  20 + rng() * 7,
    GOOGL: 23 + rng() * 8,
    AMZN:  27 + rng() * 9,
    NVDA:  42 + rng() * 15,
    META:  30 + rng() * 10,
    TSLA:  55 + rng() * 15,
    JPM:   22 + rng() * 7,
    JNJ:   14 + rng() * 5,
    XOM:   20 + rng() * 7,
    GLD:   12 + rng() * 5,
    TLT:   13 + rng() * 4,
    AGG:   5  + rng() * 2,
    VNQ:   20 + rng() * 7,
    BTC:   70 + rng() * 25,
  };

  // Build 15x15 covariance matrix
  const n = TICKERS.length;
  // First generate a base correlation structure
  const corrMatrix: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => {
      if (i === j) return 1;
      const ti = TICKERS[i];
      const tj = TICKERS[j];
      const si = TICKER_SECTOR[ti];
      const sj = TICKER_SECTOR[tj];
      // Same sector: higher correlation
      const baseCor = si === sj ? 0.55 + rng() * 0.25 : 0.05 + rng() * 0.30;
      return baseCor;
    })
  );
  // Make symmetric
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      corrMatrix[j][i] = corrMatrix[i][j];
    }
  }

  const covMatrix: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => {
      const si = (vols[TICKERS[i]] / 100);
      const sj = (vols[TICKERS[j]] / 100);
      return i === j ? si * si : corrMatrix[i][j] * si * sj;
    })
  );

  return { expectedReturns, vols, covMatrix };
}

const SYNTH = generateSyntheticData(9999);

// ─── Math helpers ─────────────────────────────────────────────────────────────

function portfolioStats(
  weights: number[],
  returns: number[], // already decimal
  cov: number[][],
  riskFreeRate = 0.05,
): { vol: number; ret: number; sharpe: number } {
  const n = weights.length;
  let ret = 0;
  for (let i = 0; i < n; i++) ret += weights[i] * returns[i];
  let varP = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      varP += weights[i] * weights[j] * cov[i][j];
    }
  }
  const vol = Math.sqrt(Math.max(varP, 0));
  const sharpe = vol > 0 ? (ret - riskFreeRate) / vol : 0;
  return { vol: vol * 100, ret: ret * 100, sharpe };
}

function normalizeWeights(w: number[], noShort = true): number[] {
  const clamped = noShort ? w.map((x) => Math.max(0, x)) : w;
  const sum = clamped.reduce((s, x) => s + x, 0);
  return sum > 0 ? clamped.map((x) => x / sum) : clamped.map(() => 1 / clamped.length);
}

function findMinVariance(returns: number[], cov: number[][], n: number): number[] {
  let weights = Array(n).fill(1 / n);
  for (let iter = 0; iter < 3000; iter++) {
    const lr = 0.005;
    const grad = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        grad[i] += 2 * weights[j] * cov[i][j];
      }
    }
    weights = normalizeWeights(weights.map((w, i) => w - lr * grad[i]));
  }
  return weights;
}

function findMaxSharpe(returns: number[], cov: number[][], n: number, rfr = 0.05): number[] {
  let weights = Array(n).fill(1 / n);
  for (let iter = 0; iter < 3000; iter++) {
    const lr = 0.006;
    const s = portfolioStats(weights, returns, cov, rfr);
    const retP = s.ret / 100;
    const volP = s.vol / 100;
    const grad = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      const dRet = returns[i];
      let dVar = 0;
      for (let j = 0; j < n; j++) dVar += 2 * weights[j] * cov[i][j];
      const dVol = volP > 1e-8 ? dVar / (2 * volP) : 0;
      grad[i] = (dRet * volP - (retP - rfr) * dVol) / (volP * volP + 1e-10);
    }
    weights = normalizeWeights(weights.map((w, i) => w + lr * grad[i]));
  }
  return weights;
}

function findRiskParity(cov: number[][], n: number): number[] {
  let weights = Array(n).fill(1 / n);
  for (let iter = 0; iter < 3000; iter++) {
    const lr = 0.005;
    // Portfolio variance
    let varP = 0;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) varP += weights[i] * weights[j] * cov[i][j];
    if (varP < 1e-14) break;
    const volP = Math.sqrt(varP);
    // Marginal contribution to risk
    const mcr = Array(n).fill(0);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) mcr[i] += weights[j] * cov[i][j];
    const rc = mcr.map((m, i) => weights[i] * m / volP); // risk contribution
    const targetRC = volP / n; // equal risk contribution = sigma / n
    // Gradient: drive rc[i] towards target
    const grad = rc.map((r) => r - targetRC);
    weights = normalizeWeights(weights.map((w, i) => Math.max(1e-6, w - lr * grad[i])));
  }
  return weights;
}

function computeMCR(weights: number[], cov: number[][], n: number): number[] {
  let varP = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) varP += weights[i] * weights[j] * cov[i][j];
  const volP = Math.sqrt(Math.max(varP, 1e-14));
  const mcr = Array(n).fill(0);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) mcr[i] += weights[j] * cov[i][j];
  // Risk contribution %
  return mcr.map((m, i) => (weights[i] * m / volP) / volP * 100);
}

// Generate efficient frontier: 50 points from min-var to max-return
function generateEfficientFrontier(
  returns: number[], cov: number[][], n: number
): { vol: number; ret: number }[] {
  const rng = mulberry32(9999);
  const points: { vol: number; ret: number }[] = [];
  for (let s = 0; s < 400; s++) {
    const rawW = Array.from({ length: n }, () => rng());
    const w = normalizeWeights(rawW);
    const st = portfolioStats(w, returns, cov);
    points.push({ vol: st.vol, ret: st.ret });
  }
  return points;
}

// Historical 5-year simulation for a given weight vector
function simulateHistorical5yr(weights: number[], returns: number[], seed = 9999): number[] {
  const rng = mulberry32(seed);
  const years = 5;
  const paths: number[] = [100];
  // Compute blended annual return and vol
  const n = weights.length;
  let blendedRet = 0;
  for (let i = 0; i < n; i++) blendedRet += weights[i] * returns[i];

  for (let y = 0; y < years * 12; y++) {
    const monthlyRet = blendedRet / 12;
    const noise = (rng() - 0.5) * 0.04;
    const prev = paths[paths.length - 1];
    paths.push(prev * (1 + monthlyRet + noise));
  }
  return paths;
}

// ─── SVG Efficient Frontier Plot ──────────────────────────────────────────────

function EfficientFrontierSVG({
  points,
  minVarPt,
  maxSharpePt,
  riskParityPt,
  currentPt,
  selectedAssets,
}: {
  points: { vol: number; ret: number }[];
  minVarPt: { vol: number; ret: number };
  maxSharpePt: { vol: number; ret: number };
  riskParityPt: { vol: number; ret: number };
  currentPt: { vol: number; ret: number };
  selectedAssets: string[];
}) {
  const W = 340, H = 200;
  const PAD = { top: 16, right: 20, bottom: 32, left: 42 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const allVols = [...points.map(p => p.vol), minVarPt.vol, maxSharpePt.vol, riskParityPt.vol, currentPt.vol];
  const allRets = [...points.map(p => p.ret), minVarPt.ret, maxSharpePt.ret, riskParityPt.ret, currentPt.ret];
  const minV = Math.max(0, Math.min(...allVols) - 1);
  const maxV = Math.max(...allVols) + 2;
  const minR = Math.min(...allRets) - 0.5;
  const maxR = Math.max(...allRets) + 0.5;

  const toX = (v: number) => PAD.left + ((v - minV) / (maxV - minV)) * chartW;
  const toY = (r: number) => PAD.top + chartH - ((r - minR) / (maxR - minR)) * chartH;

  // Build frontier line
  const sorted = [...points].sort((a, b) => a.ret - b.ret);
  const buckets = 25;
  const retRange = maxR - minR;
  const frontierPts: { vol: number; ret: number }[] = [];
  for (let b = 0; b < buckets; b++) {
    const lo = minR + (b / buckets) * retRange;
    const hi = minR + ((b + 1) / buckets) * retRange;
    const bucket = sorted.filter(p => p.ret >= lo && p.ret < hi);
    if (bucket.length > 0) frontierPts.push(bucket.reduce((best, p) => p.vol < best.vol ? p : best));
  }
  frontierPts.push(minVarPt, maxSharpePt);
  frontierPts.sort((a, b) => a.ret - b.ret);
  const lineD = frontierPts.map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.vol).toFixed(1)},${toY(p.ret).toFixed(1)}`).join(" ");

  const yTicks = [minR, (minR + maxR) / 2, maxR];
  const xTicks = [minV, (minV + maxV) / 2, maxV];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {yTicks.map((r, i) => (
        <line key={i} x1={PAD.left} x2={W - PAD.right} y1={toY(r)} y2={toY(r)}
          stroke="currentColor" strokeOpacity={0.07} strokeDasharray="3,3" />
      ))}
      {points.map((p, i) => (
        <circle key={i} cx={toX(p.vol)} cy={toY(p.ret)} r={1.5} fill="#3b82f6" fillOpacity={0.18} />
      ))}
      <path d={lineD} fill="none" stroke="#3b82f6" strokeWidth={1.5} strokeOpacity={0.5} />

      {/* Risk Parity */}
      <circle cx={toX(riskParityPt.vol)} cy={toY(riskParityPt.ret)} r={4.5} fill="#f97316" stroke="#fb923c" strokeWidth={1} />
      <text x={toX(riskParityPt.vol) + 6} y={toY(riskParityPt.ret) + 4} fontSize={7} fill="#f97316">Risk Parity</text>

      {/* Min Variance */}
      <circle cx={toX(minVarPt.vol)} cy={toY(minVarPt.ret)} r={4.5} fill="#10b981" stroke="#34d399" strokeWidth={1} />
      <text x={toX(minVarPt.vol) + 6} y={toY(minVarPt.ret) + 4} fontSize={7} fill="#10b981">Min-Var</text>

      {/* Max Sharpe */}
      <circle cx={toX(maxSharpePt.vol)} cy={toY(maxSharpePt.ret)} r={4.5} fill="#8b5cf6" stroke="#a78bfa" strokeWidth={1} />
      <text x={toX(maxSharpePt.vol) + 6} y={toY(maxSharpePt.ret) + 4} fontSize={7} fill="#8b5cf6">Max Sharpe</text>

      {/* Current */}
      <circle cx={toX(currentPt.vol)} cy={toY(currentPt.ret)} r={4.5} fill="#f59e0b" stroke="#fcd34d" strokeWidth={1} />
      <text x={toX(currentPt.vol) + 6} y={toY(currentPt.ret) + 4} fontSize={7} fill="#f59e0b">Equal-Wt</text>

      {/* Axes */}
      <line x1={PAD.left} x2={W - PAD.right} y1={H - PAD.bottom} y2={H - PAD.bottom} stroke="currentColor" strokeOpacity={0.2} />
      {xTicks.map((v, i) => (
        <text key={i} x={toX(v)} y={H - PAD.bottom + 12} textAnchor="middle" fontSize={7} fill="currentColor" fillOpacity={0.45}>
          {v.toFixed(0)}%
        </text>
      ))}
      <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={H - PAD.bottom} stroke="currentColor" strokeOpacity={0.2} />
      {yTicks.map((r, i) => (
        <text key={i} x={PAD.left - 4} y={toY(r) + 3} textAnchor="end" fontSize={7} fill="currentColor" fillOpacity={0.45}>
          {r.toFixed(1)}%
        </text>
      ))}
      <text x={W / 2} y={H - 2} textAnchor="middle" fontSize={7} fill="currentColor" fillOpacity={0.35}>Volatility (%)</text>
      <text x={8} y={H / 2} textAnchor="middle" fontSize={7} fill="currentColor" fillOpacity={0.35}
        transform={`rotate(-90, 8, ${H / 2})`}>Return (%)</text>
    </svg>
  );
}

// ─── SVG Bar Chart ────────────────────────────────────────────────────────────

function RiskContributionBarChart({
  labels,
  series,
}: {
  labels: string[];
  series: { name: string; values: number[]; color: string }[];
}) {
  const W = 340, H = 180;
  const PAD = { top: 16, right: 10, bottom: 46, left: 32 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const n = labels.length;
  const groupW = chartW / n;
  const barW = Math.max(3, (groupW / series.length) - 1.5);
  const maxVal = Math.max(...series.flatMap(s => s.values), 1);

  const toY = (v: number) => PAD.top + chartH - (v / maxVal) * chartH;
  const barHeight = (v: number) => (v / maxVal) * chartH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {[0, maxVal / 2, maxVal].map((v, i) => (
        <line key={i} x1={PAD.left} x2={W - PAD.right} y1={toY(v)} y2={toY(v)}
          stroke="currentColor" strokeOpacity={0.07} strokeDasharray="3,3" />
      ))}
      {labels.map((lbl, li) => (
        <g key={li}>
          {series.map((s, si) => {
            const x = PAD.left + li * groupW + si * (barW + 1) + 2;
            const v = s.values[li];
            const bh = barHeight(v);
            return (
              <rect key={si} x={x} y={toY(v)} width={barW} height={bh}
                fill={s.color} rx={1} opacity={0.85} />
            );
          })}
          <text x={PAD.left + li * groupW + groupW / 2} y={H - PAD.bottom + 10}
            textAnchor="middle" fontSize={6.5} fill="currentColor" fillOpacity={0.6}>
            {lbl}
          </text>
        </g>
      ))}
      {[0, maxVal / 2, maxVal].map((v, i) => (
        <text key={i} x={PAD.left - 3} y={toY(v) + 3} textAnchor="end" fontSize={6.5} fill="currentColor" fillOpacity={0.45}>
          {v.toFixed(0)}%
        </text>
      ))}
      <line x1={PAD.left} x2={W - PAD.right} y1={H - PAD.bottom} y2={H - PAD.bottom}
        stroke="currentColor" strokeOpacity={0.2} />
    </svg>
  );
}

// ─── SVG Line / Fan chart ─────────────────────────────────────────────────────

function FanChart({
  percentiles,
  labels,
}: {
  percentiles: { p10: number[]; p25: number[]; p50: number[]; p75: number[]; p90: number[] };
  labels: string[];
}) {
  const W = 340, H = 180;
  const PAD = { top: 16, right: 10, bottom: 28, left: 52 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const allVals = [
    ...percentiles.p10, ...percentiles.p90,
  ];
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);
  const nPts = percentiles.p50.length;

  const toX = (i: number) => PAD.left + (i / (nPts - 1)) * chartW;
  const toY = (v: number) => PAD.top + chartH - ((v - minV) / (maxV - minV + 1)) * chartH;

  const buildPath = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");

  const buildArea = (upper: number[], lower: number[]) =>
    upper.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ") +
    " " +
    lower.map((v, i) => `${i === 0 ? "" : "L"}${toX(lower.length - 1 - i).toFixed(1)},${toY(lower[lower.length - 1 - i]).toFixed(1)}`).join(" ") +
    " Z";

  const yTicks = [minV, (minV + maxV) / 2, maxV];

  // X-axis ticks: show subset of labels
  const xStep = Math.max(1, Math.floor(nPts / 5));
  const xTickIndices = Array.from({ length: Math.ceil(nPts / xStep) }, (_, i) => Math.min(i * xStep, nPts - 1));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {yTicks.map((v, i) => (
        <line key={i} x1={PAD.left} x2={W - PAD.right} y1={toY(v)} y2={toY(v)}
          stroke="currentColor" strokeOpacity={0.07} strokeDasharray="3,3" />
      ))}
      {/* Fan bands */}
      <path d={buildArea(percentiles.p90, percentiles.p10)} fill="#3b82f6" fillOpacity={0.08} />
      <path d={buildArea(percentiles.p75, percentiles.p25)} fill="#3b82f6" fillOpacity={0.12} />
      {/* Median */}
      <path d={buildPath(percentiles.p50)} fill="none" stroke="#3b82f6" strokeWidth={1.5} />
      {/* p10/p90 dashed */}
      <path d={buildPath(percentiles.p10)} fill="none" stroke="#ef4444" strokeWidth={0.8} strokeDasharray="3,2" />
      <path d={buildPath(percentiles.p90)} fill="none" stroke="#10b981" strokeWidth={0.8} strokeDasharray="3,2" />

      {yTicks.map((v, i) => (
        <text key={i} x={PAD.left - 4} y={toY(v) + 3} textAnchor="end" fontSize={6.5} fill="currentColor" fillOpacity={0.45}>
          ${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(0)}
        </text>
      ))}
      <line x1={PAD.left} x2={W - PAD.right} y1={H - PAD.bottom} y2={H - PAD.bottom}
        stroke="currentColor" strokeOpacity={0.2} />
      {xTickIndices.map((idx) => (
        <text key={idx} x={toX(idx)} y={H - PAD.bottom + 10} textAnchor="middle" fontSize={6.5} fill="currentColor" fillOpacity={0.45}>
          {labels[idx]}
        </text>
      ))}
    </svg>
  );
}

// SVG funding ratio chart (LDI)
function FundingRatioChart({
  bull,
  base,
  bear,
  years,
}: {
  bull: number[];
  base: number[];
  bear: number[];
  years: number;
}) {
  const W = 340, H = 160;
  const PAD = { top: 12, right: 10, bottom: 28, left: 40 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const nPts = bull.length;

  const allVals = [...bull, ...base, ...bear];
  const minV = Math.max(0, Math.min(...allVals) - 0.05);
  const maxV = Math.min(2.0, Math.max(...allVals) + 0.05);

  const toX = (i: number) => PAD.left + (i / (nPts - 1)) * chartW;
  const toY = (v: number) => PAD.top + chartH - ((v - minV) / (maxV - minV)) * chartH;

  const buildPath = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");

  const yTicks = [minV, 1.0, maxV].filter((v, i, arr) => arr.indexOf(v) === i);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {/* Fully funded line at 1.0 */}
      <line x1={PAD.left} x2={W - PAD.right} y1={toY(1.0)} y2={toY(1.0)}
        stroke="#10b981" strokeOpacity={0.4} strokeDasharray="4,3" />
      {yTicks.map((v, i) => (
        <line key={i} x1={PAD.left} x2={W - PAD.right} y1={toY(v)} y2={toY(v)}
          stroke="currentColor" strokeOpacity={0.06} strokeDasharray="3,3" />
      ))}
      <path d={buildPath(bull)} fill="none" stroke="#10b981" strokeWidth={1.5} />
      <path d={buildPath(base)} fill="none" stroke="#3b82f6" strokeWidth={1.5} />
      <path d={buildPath(bear)} fill="none" stroke="#ef4444" strokeWidth={1.5} />

      {/* Fully funded label */}
      <text x={W - PAD.right + 1} y={toY(1.0) + 3} fontSize={6} fill="#10b981" fillOpacity={0.7}>100%</text>

      {yTicks.map((v, i) => (
        <text key={i} x={PAD.left - 3} y={toY(v) + 3} textAnchor="end" fontSize={6.5} fill="currentColor" fillOpacity={0.45}>
          {(v * 100).toFixed(0)}%
        </text>
      ))}
      <line x1={PAD.left} x2={W - PAD.right} y1={H - PAD.bottom} y2={H - PAD.bottom}
        stroke="currentColor" strokeOpacity={0.2} />
      {[0, Math.floor(years / 2), years].map((yr) => {
        const idx = Math.round((yr / years) * (nPts - 1));
        return (
          <text key={yr} x={toX(idx)} y={H - PAD.bottom + 10} textAnchor="middle" fontSize={6.5} fill="currentColor" fillOpacity={0.45}>
            Yr {yr}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Section 1: Mean-Variance Optimizer ──────────────────────────────────────

function MeanVarianceSection() {
  const n = TICKERS.length;

  // Custom expected returns state (editable)
  const [customReturns, setCustomReturns] = useState<number[]>(
    TICKERS.map(t => parseFloat(SYNTH.expectedReturns[t].toFixed(1)))
  );
  const [noShort, setNoShort] = useState(true);
  const [maxWeightPct, setMaxWeightPct] = useState(40);
  const [showConstraints, setShowConstraints] = useState(false);
  const [objective, setObjective] = useState<"sharpe" | "minvar" | "riskparity">("sharpe");

  const returns = useMemo(() => customReturns.map(r => r / 100), [customReturns]);
  const cov = useMemo(() => SYNTH.covMatrix, []);

  const eqWeights = useMemo(() => Array(n).fill(1 / n), [n]);
  const eqStats = useMemo(() => portfolioStats(eqWeights, returns, cov), [eqWeights, returns, cov]);

  const minVarW = useMemo(() => findMinVariance(returns, cov, n), [returns, cov, n]);
  const maxSharpeW = useMemo(() => {
    const raw = findMaxSharpe(returns, cov, n);
    // Apply max weight constraint
    const constrained = raw.map(w => Math.min(w, maxWeightPct / 100));
    return normalizeWeights(constrained);
  }, [returns, cov, n, maxWeightPct]);
  const riskParityW = useMemo(() => findRiskParity(cov, n), [cov, n]);

  const optimalW = objective === "sharpe" ? maxSharpeW : objective === "minvar" ? minVarW : riskParityW;

  const minVarStats = useMemo(() => portfolioStats(minVarW, returns, cov), [minVarW, returns, cov]);
  const maxSharpeStats = useMemo(() => portfolioStats(maxSharpeW, returns, cov), [maxSharpeW, returns, cov]);
  const rpStats = useMemo(() => portfolioStats(riskParityW, returns, cov), [riskParityW, returns, cov]);

  const frontierPoints = useMemo(() => generateEfficientFrontier(returns, cov, n), [returns, cov, n]);

  const eqPt = { vol: eqStats.vol, ret: eqStats.ret };
  const minVarPt = { vol: minVarStats.vol, ret: minVarStats.ret };
  const maxSharpePt = { vol: maxSharpeStats.vol, ret: maxSharpeStats.ret };
  const rpPt = { vol: rpStats.vol, ret: rpStats.ret };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground font-medium">Objective:</span>
        {(["sharpe", "minvar", "riskparity"] as const).map((obj) => (
          <button
            key={obj}
            onClick={() => setObjective(obj)}
            className={cn(
              "text-xs px-2.5 py-1 rounded-md capitalize transition-colors",
              objective === obj ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {obj === "sharpe" ? "Max Sharpe" : obj === "minvar" ? "Min Variance" : "Risk Parity"}
          </button>
        ))}
      </div>

      {/* Efficient Frontier */}
      <div className="rounded-lg border border-border/20 bg-muted/20 p-2">
        <p className="text-xs font-medium text-muted-foreground mb-1.5">Efficient Frontier (15-Asset Universe)</p>
        <EfficientFrontierSVG
          points={frontierPoints}
          minVarPt={minVarPt}
          maxSharpePt={maxSharpePt}
          riskParityPt={rpPt}
          currentPt={eqPt}
          selectedAssets={TICKERS}
        />
        <div className="flex flex-wrap gap-2.5 mt-1 justify-center">
          {[
            { color: "bg-amber-500", label: "Equal-Weight" },
            { color: "bg-emerald-500", label: "Min Variance" },
            { color: "bg-primary", label: "Max Sharpe" },
            { color: "bg-orange-500", label: "Risk Parity" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div className={cn("w-2 h-2 rounded-full", color)} />
              <span className="text-[11px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats comparison */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Equal-Wt", stats: eqStats, color: "text-amber-400" },
          { label: "Min Var", stats: minVarStats, color: "text-emerald-400" },
          { label: "Max Sharpe", stats: maxSharpeStats, color: "text-primary" },
          { label: "Risk Parity", stats: rpStats, color: "text-orange-400" },
        ].map(({ label, stats, color }) => (
          <div key={label} className="rounded-lg border border-border/20 bg-card/50 p-2.5 space-y-1">
            <p className={cn("text-xs font-semibold", color)}>{label}</p>
            <div className="space-y-0.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Return</span>
                <span className="font-mono">{stats.ret.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Vol</span>
                <span className="font-mono">{stats.vol.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Sharpe</span>
                <span className={cn("font-mono font-semibold", color)}>{stats.sharpe.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Constraints toggle */}
      <div>
        <button
          onClick={() => setShowConstraints(v => !v)}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            className={cn("transition-transform", showConstraints ? "rotate-90" : "")}>
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Constraints &amp; Returns Editor
        </button>
        {showConstraints && (
          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input type="checkbox" checked={noShort} onChange={e => setNoShort(e.target.checked)} className="w-3 h-3" />
                <span className="text-muted-foreground">No Shorting</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Max Weight:</span>
                <input
                  type="range" min={10} max={100} step={5} value={maxWeightPct}
                  onChange={e => setMaxWeightPct(Number(e.target.value))}
                  className="w-20 h-1"
                />
                <span className="text-xs font-mono">{maxWeightPct}%</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/20 text-muted-foreground">
                    <th className="text-left py-1 px-1">Ticker</th>
                    <th className="text-right py-1 px-1">Exp. Ret %</th>
                    <th className="text-right py-1 px-1">Max-Sharpe Wt</th>
                    <th className="text-right py-1 px-1">Min-Var Wt</th>
                  </tr>
                </thead>
                <tbody>
                  {TICKERS.map((t, i) => (
                    <tr key={t} className="border-b border-border/20">
                      <td className="py-0.5 px-1 font-semibold">{t}</td>
                      <td className="py-0.5 px-1 text-right">
                        <input
                          type="number"
                          className="w-14 rounded bg-muted/40 px-1.5 py-0.5 font-mono text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          value={customReturns[i]}
                          step={0.1}
                          onChange={e => {
                            const next = [...customReturns];
                            next[i] = parseFloat(e.target.value) || 0;
                            setCustomReturns(next);
                          }}
                        />
                      </td>
                      <td className="py-0.5 px-1 text-right font-mono text-primary">{(maxSharpeW[i] * 100).toFixed(1)}%</td>
                      <td className="py-0.5 px-1 text-right font-mono text-emerald-400">{(minVarW[i] * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Optimal weights bar chart */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">
          {objective === "sharpe" ? "Max Sharpe" : objective === "minvar" ? "Min Variance" : "Risk Parity"} — Optimal Weights
        </p>
        <div className="space-y-1.5">
          {TICKERS.map((t, i) => (
            <div key={t} className="flex items-center gap-2">
              <span className="text-xs font-medium w-11 shrink-0">{t}</span>
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-colors duration-300"
                  style={{ width: `${(optimalW[i] * 100).toFixed(1)}%` }}
                />
              </div>
              <span className="text-xs font-mono tabular-nums text-muted-foreground w-10 text-right">
                {(optimalW[i] * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground/70 leading-relaxed">
        Based on Markowitz (1952) Mean-Variance Optimization. Covariance matrix uses seeded synthetic data (seed=9999) with sector-based correlation structure. Risk parity uses iterative gradient descent to equalize risk contribution across assets.
      </p>
    </div>
  );
}

// ─── Section 2: Risk Parity ───────────────────────────────────────────────────

function RiskParitySection() {
  const n = TICKERS.length;
  const returns = useMemo(() => TICKERS.map(t => SYNTH.expectedReturns[t] / 100), []);
  const cov = useMemo(() => SYNTH.covMatrix, []);

  const eqW = useMemo(() => Array(n).fill(1 / n), [n]);

  // Value-weight proxy (by market cap proxy via returns rank)
  const valueW = useMemo(() => {
    const vals = TICKERS.map((t, i) => ({ i, v: SYNTH.expectedReturns[t] }));
    vals.sort((a, b) => b.v - a.v);
    const total = vals.reduce((s, x, rank) => s + (n - rank), 0);
    const w = Array(n).fill(0);
    vals.forEach((x, rank) => { w[x.i] = (n - rank) / total; });
    return w;
  }, [n]);

  const rpW = useMemo(() => findRiskParity(cov, n), [cov, n]);
  const msW = useMemo(() => findMaxSharpe(returns, cov, n), [returns, cov, n]);

  const eqRC = useMemo(() => computeMCR(eqW, cov, n), [eqW, cov, n]);
  const valRC = useMemo(() => computeMCR(valueW, cov, n), [valueW, cov, n]);
  const rpRC = useMemo(() => computeMCR(rpW, cov, n), [rpW, cov, n]);
  const msRC = useMemo(() => computeMCR(msW, cov, n), [msW, cov, n]);

  const eqStats = useMemo(() => portfolioStats(eqW, returns, cov), [eqW, returns, cov]);
  const valStats = useMemo(() => portfolioStats(valueW, returns, cov), [valueW, returns, cov]);
  const rpStats = useMemo(() => portfolioStats(rpW, returns, cov), [rpW, returns, cov]);
  const msStats = useMemo(() => portfolioStats(msW, returns, cov), [msW, returns, cov]);

  // Historical 5yr sim
  const eqHist = useMemo(() => simulateHistorical5yr(eqW, returns, 9999), [eqW, returns]);
  const rpHist = useMemo(() => simulateHistorical5yr(rpW, returns, 1234), [rpW, returns]);
  const msHist = useMemo(() => simulateHistorical5yr(msW, returns, 4321), [msW, returns]);

  // Target volatility for risk parity with leverage
  const targetVol = 10;
  const rpVol = rpStats.vol;
  const leverage = rpVol > 0 ? targetVol / rpVol : 1;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Equal Weight", stats: eqStats, color: "text-primary" },
          { label: "Value Weight", stats: valStats, color: "text-amber-400" },
          { label: "Risk Parity", stats: rpStats, color: "text-orange-400" },
          { label: "Max Sharpe", stats: msStats, color: "text-primary" },
        ].map(({ label, stats, color }) => (
          <div key={label} className="rounded-lg border border-border/20 bg-card/50 p-2.5 space-y-1">
            <p className={cn("text-xs font-semibold", color)}>{label}</p>
            <div className="space-y-0.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Return</span>
                <span className="font-mono">{stats.ret.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Vol</span>
                <span className="font-mono">{stats.vol.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Sharpe</span>
                <span className={cn("font-mono font-semibold", color)}>{stats.sharpe.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Risk contribution chart */}
      <div className="rounded-lg border border-border/20 bg-muted/20 p-2">
        <p className="text-xs font-medium text-muted-foreground mb-1.5">Risk Contribution % by Asset</p>
        <RiskContributionBarChart
          labels={TICKERS}
          series={[
            { name: "Equal-Wt", values: eqRC, color: "#3b82f6" },
            { name: "Risk Parity", values: rpRC, color: "#f97316" },
            { name: "Max Sharpe", values: msRC, color: "#8b5cf6" },
          ]}
        />
        <div className="flex flex-wrap gap-2.5 mt-1 justify-center">
          {[
            { color: "bg-primary", label: "Equal-Weight" },
            { color: "bg-orange-500", label: "Risk Parity" },
            { color: "bg-primary", label: "Max Sharpe" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div className={cn("w-2 h-2 rounded-full", color)} />
              <span className="text-[11px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Leverage panel */}
      <div className="rounded-lg border border-border/20 bg-card/40 p-3">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Leverage Implications</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-[11px] text-muted-foreground">RP Unleveraged Vol</p>
            <p className="font-mono text-sm font-semibold text-orange-400">{rpVol.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Target Vol ({targetVol}%)</p>
            <p className="font-mono text-sm font-semibold text-primary">{targetVol}%</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Required Leverage</p>
            <p className={cn("font-mono text-sm font-semibold", leverage > 1 ? "text-amber-400" : "text-emerald-400")}>
              {leverage.toFixed(2)}x
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground/70 mt-2 leading-relaxed">
          Risk parity portfolios often have low intrinsic volatility (dominated by bonds). To achieve target returns, institutions apply {leverage.toFixed(2)}x leverage via futures or swaps.
        </p>
      </div>

      {/* Historical comparison */}
      <div className="rounded-lg border border-border/20 bg-muted/20 p-2">
        <p className="text-xs font-medium text-muted-foreground mb-1">5-Year Historical Comparison (simulated, $100 start)</p>
        <svg viewBox="0 0 340 130" className="w-full" style={{ height: 130 }}>
          {(() => {
            const W = 340, H = 130;
            const PAD = { top: 10, right: 10, bottom: 22, left: 40 };
            const all = [...eqHist, ...rpHist, ...msHist];
            const minV = Math.min(...all);
            const maxV = Math.max(...all);
            const nPts = eqHist.length;
            const toX = (i: number) => PAD.left + (i / (nPts - 1)) * (W - PAD.left - PAD.right);
            const toY = (v: number) => PAD.top + (H - PAD.top - PAD.bottom) - ((v - minV) / (maxV - minV + 1)) * (H - PAD.top - PAD.bottom);
            const buildPath = (vals: number[]) =>
              vals.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");
            const yTicks = [minV, maxV];
            return (
              <>
                {yTicks.map((v, i) => (
                  <g key={i}>
                    <line x1={PAD.left} x2={W - PAD.right} y1={toY(v)} y2={toY(v)}
                      stroke="currentColor" strokeOpacity={0.07} strokeDasharray="3,3" />
                    <text x={PAD.left - 3} y={toY(v) + 3} textAnchor="end" fontSize={6.5} fill="currentColor" fillOpacity={0.45}>
                      ${v.toFixed(0)}
                    </text>
                  </g>
                ))}
                <path d={buildPath(eqHist)} fill="none" stroke="#3b82f6" strokeWidth={1.2} />
                <path d={buildPath(rpHist)} fill="none" stroke="#f97316" strokeWidth={1.2} />
                <path d={buildPath(msHist)} fill="none" stroke="#8b5cf6" strokeWidth={1.2} />
                <line x1={PAD.left} x2={W - PAD.right} y1={H - PAD.bottom} y2={H - PAD.bottom}
                  stroke="currentColor" strokeOpacity={0.2} />
                {[0, 30, 60].map((mo, idx) => {
                  const ptIdx = Math.min(mo, nPts - 1);
                  return (
                    <text key={idx} x={toX(ptIdx)} y={H - PAD.bottom + 10} textAnchor="middle" fontSize={6.5} fill="currentColor" fillOpacity={0.45}>
                      {mo === 0 ? "Start" : `Mo ${mo}`}
                    </text>
                  );
                })}
                <text x={toX(nPts - 1)} y={H - PAD.bottom + 10} textAnchor="middle" fontSize={6.5} fill="currentColor" fillOpacity={0.45}>Yr5</text>
                <text x={toX(nPts - 1) + 3} y={toY(eqHist[nPts - 1]) + 3} fontSize={6.5} fill="#3b82f6">${eqHist[nPts - 1].toFixed(0)}</text>
                <text x={toX(nPts - 1) + 3} y={toY(rpHist[nPts - 1]) + 3} fontSize={6.5} fill="#f97316">${rpHist[nPts - 1].toFixed(0)}</text>
                <text x={toX(nPts - 1) + 3} y={toY(msHist[nPts - 1]) + 3} fontSize={6.5} fill="#8b5cf6">${msHist[nPts - 1].toFixed(0)}</text>
              </>
            );
          })()}
        </svg>
        <div className="flex gap-3 mt-1 justify-center">
          {[{ color: "bg-primary", label: "Equal-Wt" }, { color: "bg-orange-500", label: "Risk Parity" }, { color: "bg-primary", label: "Max Sharpe" }].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div className={cn("w-2 h-1.5 rounded-full", color)} />
              <span className="text-[11px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Section 3: Factor-Based Portfolio Construction ───────────────────────────

type FactorTilt = "value" | "momentum" | "quality" | "lowvol";

function FactorSection() {
  const n = TICKERS.length;
  const [tilt1, setTilt1] = useState<FactorTilt>("value");
  const [tilt2, setTilt2] = useState<FactorTilt>("momentum");
  const [blendRatio, setBlendRatio] = useState(50); // % of tilt1

  const returns = useMemo(() => TICKERS.map(t => SYNTH.expectedReturns[t] / 100), []);
  const cov = useMemo(() => SYNTH.covMatrix, []);

  function buildFactorWeights(tilt: FactorTilt): number[] {
    const scores = TICKERS.map(t => {
      const f = TICKER_FACTORS[t];
      switch (tilt) {
        case "value":    return 1 / (f.pb + 0.1);         // lower P/B = better value
        case "momentum": return Math.max(0, f.momentum12m + 0.1);
        case "quality":  return f.roe;
        case "lowvol":   return 1 / (f.beta + 0.1);       // lower beta = lower vol
      }
    });
    const sum = scores.reduce((s, x) => s + Math.max(x, 0), 0);
    return scores.map(s => Math.max(s, 0) / (sum || 1));
  }

  const w1 = useMemo(() => buildFactorWeights(tilt1), [tilt1]);
  const w2 = useMemo(() => buildFactorWeights(tilt2), [tilt2]);

  const blendW = useMemo(() => {
    const alpha = blendRatio / 100;
    return normalizeWeights(w1.map((v, i) => alpha * v + (1 - alpha) * w2[i]));
  }, [w1, w2, blendRatio]);

  const w1Stats = useMemo(() => portfolioStats(w1, returns, cov), [w1, returns, cov]);
  const w2Stats = useMemo(() => portfolioStats(w2, returns, cov), [w2, returns, cov]);
  const blendStats = useMemo(() => portfolioStats(blendW, returns, cov), [blendW, returns, cov]);

  // Factor exposure of resulting portfolio
  function computeFactorExposure(weights: number[]) {
    let valueTilt = 0, momentumTilt = 0, qualityTilt = 0, betaTilt = 0;
    TICKERS.forEach((t, i) => {
      const f = TICKER_FACTORS[t];
      valueTilt    += weights[i] * (1 / (f.pb + 0.1));
      momentumTilt += weights[i] * f.momentum12m;
      qualityTilt  += weights[i] * f.roe;
      betaTilt     += weights[i] * f.beta;
    });
    return { valueTilt, momentumTilt, qualityTilt, betaTilt };
  }

  const exp1 = useMemo(() => computeFactorExposure(w1), [w1]);
  const exp2 = useMemo(() => computeFactorExposure(w2), [w2]);
  const expBlend = useMemo(() => computeFactorExposure(blendW), [blendW]);

  const FACTOR_LABELS: Record<FactorTilt, string> = {
    value: "Value (Low P/B)",
    momentum: "Momentum (12M)",
    quality: "Quality (ROE)",
    lowvol: "Low Volatility",
  };

  const FACTOR_ETFS: Record<FactorTilt, { etf: string; desc: string }> = {
    value:    { etf: "VTV / VLUE", desc: "Vanguard Value / iShares MSCI USA Value Factor" },
    momentum: { etf: "MTUM / QMOM", desc: "iShares MSCI USA Momentum / Alpha Architect" },
    quality:  { etf: "QUAL / DGRW", desc: "iShares MSCI USA Quality / WisdomTree" },
    lowvol:   { etf: "USMV / SPLV", desc: "iShares MSCI Min Vol / Invesco S&P Low Vol" },
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Factor 1 */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Factor 1 (Primary)</p>
          <div className="flex flex-wrap gap-1">
            {(["value", "momentum", "quality", "lowvol"] as FactorTilt[]).map(f => (
              <button key={f} onClick={() => setTilt1(f)}
                className={cn("text-[11px] px-2 py-0.5 rounded capitalize transition-colors",
                  tilt1 === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
                {f}
              </button>
            ))}
          </div>
          <div className="rounded border border-border/20 bg-muted/20 p-2">
            <p className="text-[11px] text-muted-foreground mb-1">{FACTOR_LABELS[tilt1]}</p>
            <p className="text-xs font-semibold text-primary">
              Ret: {w1Stats.ret.toFixed(1)}% | Vol: {w1Stats.vol.toFixed(1)}% | SR: {w1Stats.sharpe.toFixed(2)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">ETF: {FACTOR_ETFS[tilt1].etf}</p>
          </div>
        </div>

        {/* Factor 2 */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Factor 2 (Blend)</p>
          <div className="flex flex-wrap gap-1">
            {(["value", "momentum", "quality", "lowvol"] as FactorTilt[]).map(f => (
              <button key={f} onClick={() => setTilt2(f)}
                className={cn("text-[11px] px-2 py-0.5 rounded capitalize transition-colors",
                  tilt2 === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
                {f}
              </button>
            ))}
          </div>
          <div className="rounded border border-border/20 bg-muted/20 p-2">
            <p className="text-[11px] text-muted-foreground mb-1">{FACTOR_LABELS[tilt2]}</p>
            <p className="text-xs font-semibold text-amber-400">
              Ret: {w2Stats.ret.toFixed(1)}% | Vol: {w2Stats.vol.toFixed(1)}% | SR: {w2Stats.sharpe.toFixed(2)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">ETF: {FACTOR_ETFS[tilt2].etf}</p>
          </div>
        </div>
      </div>

      {/* Blend slider */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{FACTOR_LABELS[tilt1]}</span>
          <span className="font-medium">Blend: {blendRatio}% / {100 - blendRatio}%</span>
          <span className="text-muted-foreground">{FACTOR_LABELS[tilt2]}</span>
        </div>
        <input type="range" min={0} max={100} step={5} value={blendRatio}
          onChange={e => setBlendRatio(Number(e.target.value))} className="w-full h-1" />
        <div className="rounded-lg border border-border/20 bg-card/50 p-2.5">
          <p className="text-xs font-semibold text-primary mb-1">Blended Portfolio</p>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div><span className="text-muted-foreground">Return: </span><span className="font-mono">{blendStats.ret.toFixed(1)}%</span></div>
            <div><span className="text-muted-foreground">Vol: </span><span className="font-mono">{blendStats.vol.toFixed(1)}%</span></div>
            <div><span className="text-muted-foreground">Sharpe: </span><span className="font-mono font-semibold text-primary">{blendStats.sharpe.toFixed(2)}</span></div>
          </div>
        </div>
      </div>

      {/* Factor exposures */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Factor Exposures Comparison</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/20 text-muted-foreground">
                <th className="text-left py-1">Portfolio</th>
                <th className="text-right py-1">Value Score</th>
                <th className="text-right py-1">Momentum</th>
                <th className="text-right py-1">Quality (ROE)</th>
                <th className="text-right py-1">Beta</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: FACTOR_LABELS[tilt1], exp: exp1, color: "text-primary" },
                { label: FACTOR_LABELS[tilt2], exp: exp2, color: "text-amber-400" },
                { label: "Blended", exp: expBlend, color: "text-primary" },
              ].map(({ label, exp, color }) => (
                <tr key={label} className="border-b border-border/20">
                  <td className={cn("py-1 font-semibold", color)}>{label}</td>
                  <td className="py-1 text-right font-mono">{exp.valueTilt.toFixed(3)}</td>
                  <td className={cn("py-1 text-right font-mono", exp.momentumTilt >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {exp.momentumTilt >= 0 ? "+" : ""}{exp.momentumTilt.toFixed(3)}
                  </td>
                  <td className="py-1 text-right font-mono">{exp.qualityTilt.toFixed(3)}</td>
                  <td className={cn("py-1 text-right font-mono", exp.betaTilt > 1 ? "text-amber-400" : "text-primary")}>
                    {exp.betaTilt.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blended weights */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Blended Portfolio Weights</p>
        <div className="space-y-1">
          {TICKERS.map((t, i) => (
            <div key={t} className="flex items-center gap-2">
              <span className="text-xs font-medium w-11 shrink-0">{t}</span>
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-colors duration-300"
                  style={{ width: `${(blendW[i] * 100).toFixed(1)}%` }} />
              </div>
              <span className="text-xs font-mono text-muted-foreground w-10 text-right">
                {(blendW[i] * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground/70 leading-relaxed">
        Factor ETFs provide similar exposures with lower complexity and transaction costs. Combining value + momentum (value with momentum filter) historically reduces value traps while maintaining premium capture.
      </p>
    </div>
  );
}

// ─── Section 4: Liability-Driven Investing ────────────────────────────────────

function LDISection() {
  const [monthlyIncome, setMonthlyIncome] = useState(5000);
  const [yearsNeeded, setYearsNeeded] = useState(25);
  const [inflationRate, setInflationRate] = useState(2.5);
  const [currentAssets, setCurrentAssets] = useState(800000);
  const [discountRate] = useState(4.0); // real rate

  // PV of liabilities (growing annuity)
  const liabilityPV = useMemo(() => {
    const annualIncome = monthlyIncome * 12;
    const r = discountRate / 100;
    const g = inflationRate / 100;
    if (Math.abs(r - g) < 1e-6) return annualIncome * yearsNeeded;
    return annualIncome * (1 - Math.pow((1 + g) / (1 + r), yearsNeeded)) / (r - g);
  }, [monthlyIncome, yearsNeeded, inflationRate, discountRate]);

  const fundingRatio = currentAssets / liabilityPV;

  // Duration of liabilities (approximate Macaulay duration)
  const liabilityDuration = useMemo(() => {
    let pv = 0, wSum = 0;
    const r = discountRate / 100;
    const g = inflationRate / 100;
    for (let t = 1; t <= yearsNeeded; t++) {
      const cashflow = monthlyIncome * 12 * Math.pow(1 + g, t - 1);
      const pvCF = cashflow / Math.pow(1 + r, t);
      pv += pvCF;
      wSum += t * pvCF;
    }
    return pv > 0 ? wSum / pv : yearsNeeded / 2;
  }, [monthlyIncome, yearsNeeded, inflationRate, discountRate]);

  // LDI split: hedge portfolio (bonds matching duration) vs growth portfolio
  const hedgeRatio = Math.min(1, fundingRatio); // hedge up to 100% funded
  const hedgePct = (hedgeRatio * 100).toFixed(0);
  const growthPct = ((1 - hedgeRatio) * 100).toFixed(0);

  // Glide path: funding ratio over 30 years under 3 scenarios
  const { bullPath, basePath, bearPath } = useMemo(() => {
    const years = 30;
    const bullPath: number[] = [fundingRatio];
    const basePath: number[] = [fundingRatio];
    const bearPath: number[] = [fundingRatio];
    const rngLocal = mulberry32(9999);
    for (let y = 0; y < years; y++) {
      const noise = (rngLocal() - 0.5) * 0.04;
      bullPath.push(Math.min(2, bullPath[y] * (1 + 0.08 + noise)));
      basePath.push(Math.min(2, basePath[y] * (1 + 0.05 + noise * 0.5)));
      bearPath.push(Math.max(0.1, bearPath[y] * (1 + 0.01 + noise)));
    }
    return { bullPath, basePath, bearPath };
  }, [fundingRatio]);

  const formatCur = (v: number) =>
    v >= 1e6 ? `$${(v / 1e6).toFixed(2)}M` : `$${(v / 1000).toFixed(0)}k`;

  return (
    <div className="space-y-4">
      {/* Inputs */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Monthly Income Needed", value: monthlyIncome, setter: setMonthlyIncome, min: 1000, max: 50000, step: 500, format: (v: number) => `$${v.toLocaleString()}` },
          { label: "Years of Income Needed", value: yearsNeeded, setter: setYearsNeeded, min: 5, max: 50, step: 1, format: (v: number) => `${v} yrs` },
          { label: "Inflation Rate %", value: inflationRate, setter: setInflationRate, min: 0, max: 8, step: 0.5, format: (v: number) => `${v.toFixed(1)}%` },
          { label: "Current Assets", value: currentAssets, setter: setCurrentAssets, min: 100000, max: 10000000, step: 50000, format: (v: number) => formatCur(v) },
        ].map(({ label, value, setter, min, max, step, format }) => (
          <div key={label} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-mono font-medium">{format(value)}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value}
              onChange={e => setter(Number(e.target.value))} className="w-full h-1" />
          </div>
        ))}
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="rounded-lg border border-border/20 bg-card/50 p-2.5">
          <p className="text-[11px] text-muted-foreground">Liability PV</p>
          <p className="font-mono text-sm font-semibold text-primary">{formatCur(liabilityPV)}</p>
        </div>
        <div className="rounded-lg border border-border/20 bg-card/50 p-2.5">
          <p className="text-[11px] text-muted-foreground">Funding Ratio</p>
          <p className={cn("font-mono text-sm font-semibold", fundingRatio >= 1 ? "text-emerald-400" : fundingRatio >= 0.8 ? "text-amber-400" : "text-red-400")}>
            {(fundingRatio * 100).toFixed(0)}%
          </p>
        </div>
        <div className="rounded-lg border border-border/20 bg-card/50 p-2.5">
          <p className="text-[11px] text-muted-foreground">Liability Duration</p>
          <p className="font-mono text-sm font-semibold text-primary">{liabilityDuration.toFixed(1)} yrs</p>
        </div>
        <div className="rounded-lg border border-border/20 bg-card/50 p-2.5">
          <p className="text-[11px] text-muted-foreground">Deficit / Surplus</p>
          <p className={cn("font-mono text-sm font-semibold", currentAssets >= liabilityPV ? "text-emerald-400" : "text-red-400")}>
            {currentAssets >= liabilityPV ? "+" : ""}{formatCur(currentAssets - liabilityPV)}
          </p>
        </div>
      </div>

      {/* LDI split */}
      <div className="rounded-lg border border-border/20 bg-card/40 p-3">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Asset Allocation Split</p>
        <div className="flex rounded-lg overflow-hidden h-5 mb-2">
          <div className="bg-primary/70 flex items-center justify-center text-[11px] font-semibold text-foreground transition-colors duration-300"
            style={{ width: `${hedgePct}%` }}>
            {parseInt(hedgePct) > 15 ? `Hedge ${hedgePct}%` : ""}
          </div>
          <div className="bg-primary/70 flex items-center justify-center text-[11px] font-semibold text-foreground transition-colors duration-300"
            style={{ width: `${growthPct}%` }}>
            {parseInt(growthPct) > 15 ? `Growth ${growthPct}%` : ""}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <p className="font-semibold text-primary">Liability-Matching (Hedge) Portfolio</p>
            <p className="text-muted-foreground">Long-duration bonds (TLT/AGG) matched to {liabilityDuration.toFixed(1)}-yr liability duration. Immunizes interest rate risk.</p>
          </div>
          <div>
            <p className="font-semibold text-primary">Return-Seeking (Growth) Portfolio</p>
            <p className="text-muted-foreground">Equities + alternatives targeting real returns to improve funding ratio over time.</p>
          </div>
        </div>
      </div>

      {/* Glide path SVG */}
      <div className="rounded-lg border border-border/20 bg-muted/20 p-2">
        <p className="text-xs font-medium text-muted-foreground mb-1">Funding Ratio Glide Path — 30-Year Projection</p>
        <FundingRatioChart bull={bullPath} base={basePath} bear={bearPath} years={30} />
        <div className="flex gap-3 mt-1 justify-center">
          {[{ color: "bg-emerald-500", label: "Bull" }, { color: "bg-primary", label: "Base" }, { color: "bg-red-500", label: "Bear" }].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div className={cn("w-3 h-1 rounded-full", color)} />
              <span className="text-[11px] text-muted-foreground">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 border-t border-dashed border-emerald-500/60" />
            <span className="text-[11px] text-muted-foreground">Fully Funded (100%)</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground/70 leading-relaxed">
        LDI (Liability-Driven Investing) is used by pension funds to match asset duration to liabilities, reducing funding ratio volatility. As funding ratio improves, the portfolio glides toward more hedging assets (de-risking).
      </p>
    </div>
  );
}

// ─── Section 5: Portfolio Simulation Lab ─────────────────────────────────────

type PortfolioPreset = "conservative" | "moderate" | "aggressive" | "custom";

// Preset blended annual return and volatility
const PRESET_PARAMS: Record<PortfolioPreset, { ret: number; vol: number; label: string }> = {
  conservative: { ret: 5.5,  vol: 7.0,  label: "Conservative (60/40)" },
  moderate:     { ret: 8.0,  vol: 12.0, label: "Moderate (80/20)" },
  aggressive:   { ret: 11.0, vol: 18.0, label: "Aggressive (100% Equity)" },
  custom:       { ret: 9.0,  vol: 14.0, label: "Custom" },
};

function runMonteCarlo(
  startCapital: number,
  monthlyContrib: number,
  months: number,
  annualRet: number,
  annualVol: number,
  nPaths = 1000,
  seed = 9999,
): number[][] {
  const rng = mulberry32(seed);
  const monthlyRet = annualRet / 12 / 100;
  const monthlyVol = (annualVol / 100) / Math.sqrt(12);

  const paths: number[][] = [];
  for (let p = 0; p < nPaths; p++) {
    const path: number[] = [startCapital];
    for (let m = 0; m < months; m++) {
      const r = rng();
      // Box-Muller
      const r2 = rng();
      const z = Math.sqrt(-2 * Math.log(r + 1e-10)) * Math.cos(2 * Math.PI * r2);
      const prev = path[path.length - 1];
      path.push(prev * (1 + monthlyRet + monthlyVol * z) + monthlyContrib);
    }
    paths.push(path);
  }
  return paths;
}

function computePercentiles(paths: number[][], timeIdx: number) {
  const vals = paths.map(p => p[timeIdx]).sort((a, b) => a - b);
  const n = vals.length;
  const p = (pct: number) => vals[Math.floor((pct / 100) * n)] ?? vals[n - 1];
  return { p10: p(10), p25: p(25), p50: p(50), p75: p(75), p90: p(90) };
}

function SimulationSection() {
  const [startCapital, setStartCapital] = useState(100000);
  const [monthlyContrib, setMonthlyContrib] = useState(1000);
  const [horizonYears, setHorizonYears] = useState(20);
  const [preset, setPreset] = useState<PortfolioPreset>("moderate");
  const [customRet, setCustomRet] = useState(9.0);
  const [customVol, setCustomVol] = useState(14.0);
  const [goalAmount, setGoalAmount] = useState(1000000);

  const params = preset === "custom"
    ? { ret: customRet, vol: customVol }
    : PRESET_PARAMS[preset];

  const months = horizonYears * 12;

  const paths = useMemo(() => {
    return runMonteCarlo(
      startCapital, monthlyContrib, months,
      params.ret, params.vol, 1000, 9999,
    );
  }, [startCapital, monthlyContrib, months, params.ret, params.vol]);

  // Build percentile fan chart data (sample every 6 months for performance)
  const sampleStep = Math.max(1, Math.floor(months / 60));
  const timePoints = Array.from({ length: Math.floor(months / sampleStep) + 1 }, (_, i) => i * sampleStep);

  const fanData = useMemo(() => {
    const p10: number[] = [], p25: number[] = [], p50: number[] = [], p75: number[] = [], p90: number[] = [];
    for (const t of timePoints) {
      const idx = Math.min(t, months);
      const pcts = computePercentiles(paths, idx);
      p10.push(pcts.p10); p25.push(pcts.p25); p50.push(pcts.p50);
      p75.push(pcts.p75); p90.push(pcts.p90);
    }
    return { p10, p25, p50, p75, p90 };
  }, [paths, timePoints, months]);

  const fanLabels = timePoints.map(t => {
    const yr = Math.floor(t / 12);
    return yr % 5 === 0 ? `Yr${yr}` : "";
  });

  // Probability metrics
  const finalVals = useMemo(() => paths.map(p => p[months]), [paths, months]);

  const probGoal = useMemo(() => {
    const above = finalVals.filter(v => v >= goalAmount).length;
    return (above / finalVals.length * 100).toFixed(1);
  }, [finalVals, goalAmount]);

  const prob1M  = useMemo(() => (finalVals.filter(v => v >= 1e6).length / finalVals.length * 100).toFixed(1), [finalVals]);
  const prob5M  = useMemo(() => (finalVals.filter(v => v >= 5e6).length / finalVals.length * 100).toFixed(1), [finalVals]);
  const prob10M = useMemo(() => (finalVals.filter(v => v >= 1e7).length / finalVals.length * 100).toFixed(1), [finalVals]);

  // Required monthly contribution to reach goal (approximation via binary search)
  const requiredContrib = useMemo(() => {
    // Use median path approximation: compound growth + annuity FV
    const n = months;
    const r = params.ret / 12 / 100;
    const fvCapital = startCapital * Math.pow(1 + r, n);
    const fvAnnuity = r > 0 ? ((Math.pow(1 + r, n) - 1) / r) : n;
    const needed = goalAmount - fvCapital;
    return Math.max(0, needed / fvAnnuity);
  }, [goalAmount, startCapital, months, params.ret]);

  const formatCur = (v: number) =>
    v >= 1e6 ? `$${(v / 1e6).toFixed(2)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(0)}k` : `$${v.toFixed(0)}`;

  const finalP50 = fanData.p50[fanData.p50.length - 1];
  const finalP10 = fanData.p10[fanData.p10.length - 1];
  const finalP90 = fanData.p90[fanData.p90.length - 1];

  return (
    <div className="space-y-4">
      {/* Inputs */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Starting Capital", value: startCapital, setter: setStartCapital, min: 10000, max: 5000000, step: 10000, fmt: formatCur },
          { label: "Monthly Contribution", value: monthlyContrib, setter: setMonthlyContrib, min: 0, max: 10000, step: 100, fmt: formatCur },
          { label: "Time Horizon", value: horizonYears, setter: setHorizonYears, min: 1, max: 40, step: 1, fmt: (v: number) => `${v} yrs` },
          { label: "Goal Amount", value: goalAmount, setter: setGoalAmount, min: 100000, max: 20000000, step: 100000, fmt: formatCur },
        ].map(({ label, value, setter, min, max, step, fmt }) => (
          <div key={label} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-mono font-medium">{fmt(value)}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value}
              onChange={e => setter(Number(e.target.value))} className="w-full h-1" />
          </div>
        ))}
      </div>

      {/* Portfolio type selector */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Portfolio Type</p>
        <div className="flex flex-wrap gap-1.5">
          {(["conservative", "moderate", "aggressive", "custom"] as PortfolioPreset[]).map(p => (
            <button key={p} onClick={() => setPreset(p)}
              className={cn("text-xs px-2.5 py-1 rounded-md capitalize transition-colors",
                preset === p ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
              {PRESET_PARAMS[p].label.split(" ")[0]}
            </button>
          ))}
        </div>
        {preset === "custom" && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Annual Return %", value: customRet, setter: setCustomRet, min: 1, max: 30, step: 0.5, fmt: (v: number) => `${v.toFixed(1)}%` },
              { label: "Annual Vol %", value: customVol, setter: setCustomVol, min: 1, max: 50, step: 0.5, fmt: (v: number) => `${v.toFixed(1)}%` },
            ].map(({ label, value, setter, min, max, step, fmt }) => (
              <div key={label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-mono">{fmt(value)}</span>
                </div>
                <input type="range" min={min} max={max} step={step} value={value}
                  onChange={e => setter(Number(e.target.value))} className="w-full h-1" />
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          {PRESET_PARAMS[preset].label}: {params.ret.toFixed(1)}% return / {params.vol.toFixed(1)}% vol
        </p>
      </div>

      {/* Fan chart */}
      <div className="rounded-lg border border-border/20 bg-muted/20 p-2">
        <p className="text-xs font-medium text-muted-foreground mb-1">
          Monte Carlo Fan Chart — 1,000 Paths over {horizonYears} Years
        </p>
        <FanChart percentiles={fanData} labels={fanLabels} />
        <div className="flex flex-wrap gap-2 mt-1 justify-center">
          {[
            { color: "bg-emerald-500", label: "90th pct" },
            { color: "bg-primary", label: "50th pct (median)" },
            { color: "bg-red-500", label: "10th pct" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div className={cn("w-2 h-1.5 rounded-full", color)} />
              <span className="text-[11px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Outcome summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-border/20 bg-card/50 p-2.5">
          <p className="text-[11px] text-muted-foreground">Median Outcome</p>
          <p className="font-mono text-sm font-semibold text-primary">{formatCur(finalP50)}</p>
        </div>
        <div className="rounded-lg border border-border/20 bg-card/50 p-2.5">
          <p className="text-[11px] text-muted-foreground">90th Percentile</p>
          <p className="font-mono text-sm font-semibold text-emerald-400">{formatCur(finalP90)}</p>
        </div>
        <div className="rounded-lg border border-border/20 bg-card/50 p-2.5">
          <p className="text-[11px] text-muted-foreground">10th Percentile</p>
          <p className="font-mono text-sm font-semibold text-red-400">{formatCur(finalP10)}</p>
        </div>
      </div>

      {/* Probability metrics */}
      <div className="rounded-lg border border-border/20 bg-card/40 p-3 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Probability of Reaching Milestones (from {formatCur(startCapital)} + {formatCur(monthlyContrib)}/mo)</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "$1M", prob: prob1M },
            { label: "$5M", prob: prob5M },
            { label: "$10M", prob: prob10M },
          ].map(({ label, prob }) => (
            <div key={label} className="text-center">
              <p className="text-[11px] text-muted-foreground">{label}</p>
              <p className={cn("font-mono font-semibold text-sm",
                parseFloat(prob) >= 50 ? "text-emerald-400" :
                parseFloat(prob) >= 20 ? "text-amber-400" : "text-red-400")}>
                {prob}%
              </p>
            </div>
          ))}
        </div>
        <div className="border-t border-border/20 pt-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Prob. of reaching goal ({formatCur(goalAmount)})</span>
            <span className={cn("font-mono font-semibold",
              parseFloat(probGoal) >= 50 ? "text-emerald-400" :
              parseFloat(probGoal) >= 25 ? "text-amber-400" : "text-red-400")}>
              {probGoal}%
            </span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-muted-foreground">Required monthly contribution to reach goal (median)</span>
            <span className="font-mono font-semibold text-primary">{formatCur(requiredContrib)}/mo</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground/70 leading-relaxed">
        Monte Carlo simulation uses 1,000 paths with normally distributed monthly returns (Box-Muller transform, seed=9999). Fan chart shows 10th/25th/50th/75th/90th percentile outcomes. Past performance does not guarantee future results.
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type OptimizerTab = "mean-variance" | "risk-parity" | "factor" | "ldi" | "simulation";

export function PortfolioOptimizer() {
  const [activeTab, setActiveTab] = useState<OptimizerTab>("mean-variance");

  const TABS: { id: OptimizerTab; label: string; shortLabel: string }[] = [
    { id: "mean-variance", label: "Mean-Variance Optimizer", shortLabel: "MV Optimizer" },
    { id: "risk-parity",   label: "Risk Parity",             shortLabel: "Risk Parity" },
    { id: "factor",        label: "Factor-Based",            shortLabel: "Factor" },
    { id: "ldi",           label: "Liability-Driven (LDI)",  shortLabel: "LDI" },
    { id: "simulation",    label: "Simulation Lab",          shortLabel: "Sim Lab" },
  ];

  return (
    <div className="rounded-lg border border-border/20 bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Advanced Portfolio Optimizer</h3>
          <p className="text-xs text-muted-foreground mt-0.5">15-asset universe — mulberry32 seed=9999</p>
        </div>
        <div className="flex flex-wrap gap-1 justify-end">
          {TICKERS.slice(0, 8).map(t => (
            <span key={t} className="text-[11px] rounded bg-muted/60 px-1.5 py-0.5 font-mono text-muted-foreground">{t}</span>
          ))}
          <span className="text-[11px] text-muted-foreground">+7</span>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 flex-wrap border-b border-border/20 pb-2">
        {TABS.map(({ id, shortLabel }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "text-xs px-2.5 py-1 rounded-md transition-colors font-medium",
              activeTab === id
                ? "bg-primary/15 text-primary border border-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
            )}
          >
            {shortLabel}
          </button>
        ))}
      </div>

      {/* Section heading */}
      <div className="text-[11px] font-semibold text-foreground">
        {TABS.find(t => t.id === activeTab)?.label}
      </div>

      {/* Section content */}
      {activeTab === "mean-variance" && <MeanVarianceSection />}
      {activeTab === "risk-parity"   && <RiskParitySection />}
      {activeTab === "factor"        && <FactorSection />}
      {activeTab === "ldi"           && <LDISection />}
      {activeTab === "simulation"    && <SimulationSection />}
    </div>
  );
}
