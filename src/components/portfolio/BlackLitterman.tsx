"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Lightbulb, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

const ASSETS = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "JPM", "JNJ", "XOM"] as const;
type Asset = (typeof ASSETS)[number];

type ViewType = "absolute" | "relative";

interface View {
  id: string;
  type: ViewType;
  asset1: Asset;
  asset2: Asset; // used only for relative views
  expectedReturn: number; // % annualized
  confidence: number; // 0–100
}

interface BLResult {
  equilibriumReturns: number[];
  blReturns: number[];
  priorWeights: number[];
  blWeights: number[];
  marketCapWeights: number[];
  covMatrix: number[][];
  stats: {
    label: string;
    ret: number;
    vol: number;
    sharpe: number;
  }[];
}

// ─── Seeded PRNG (seed = 9090) ────────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Market caps (seeded): rough relative sizes
function computeMarketCapWeights(): number[] {
  const rng = mulberry32(9090);
  // Generate rough market caps in order: AAPL, MSFT, GOOGL, AMZN, NVDA, META, TSLA, JPM, JNJ, XOM
  const rawCaps = [3.0, 2.8, 1.9, 1.8, 1.7, 1.2, 0.6, 0.55, 0.42, 0.38].map(
    (v) => v + (rng() - 0.5) * 0.1,
  );
  const total = rawCaps.reduce((s, x) => s + x, 0);
  return rawCaps.map((x) => x / total);
}

// Asset volatilities (annualized, as decimals)
const ASSET_VOLS: number[] = [0.28, 0.26, 0.27, 0.30, 0.40, 0.31, 0.55, 0.22, 0.18, 0.24];

// Pairwise correlation matrix (seeded, symmetric, PSD-ish)
function buildCorrelationMatrix(): number[][] {
  const n = ASSETS.length;
  const rng = mulberry32(9090 + 1);
  const corr: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => {
      if (i === j) return 1;
      // Tech cluster: indices 0–5, JPM=7, JNJ=8, XOM=9
      const techA = i <= 5;
      const techB = j <= 5;
      const base = techA && techB ? 0.55 : 0.2;
      return base + (rng() - 0.5) * 0.15;
    }),
  );
  // Symmetrize
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      corr[j][i] = corr[i][j];
    }
  }
  return corr;
}

// ─── Matrix helpers ───────────────────────────────────────────────────────────

function matMul(A: number[][], B: number[][]): number[][] {
  const rows = A.length;
  const cols = B[0].length;
  const inner = B.length;
  const C: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let i = 0; i < rows; i++)
    for (let k = 0; k < inner; k++)
      for (let j = 0; j < cols; j++) C[i][j] += A[i][k] * B[k][j];
  return C;
}

function matVec(A: number[][], v: number[]): number[] {
  return A.map((row) => row.reduce((s, a, j) => s + a * v[j], 0));
}

function vecAdd(a: number[], b: number[]): number[] {
  return a.map((x, i) => x + b[i]);
}

function vecScale(a: number[], s: number): number[] {
  return a.map((x) => x * s);
}

function transpose(A: number[][]): number[][] {
  const rows = A.length;
  const cols = A[0].length;
  return Array.from({ length: cols }, (_, j) => Array.from({ length: rows }, (_, i) => A[i][j]));
}

// Gauss-Jordan matrix inverse
function matInv(M: number[][]): number[][] {
  const n = M.length;
  const A: number[][] = M.map((row) => [...row]);
  const I: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  );
  for (let col = 0; col < n; col++) {
    // Find pivot
    let pivotRow = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(A[r][col]) > Math.abs(A[pivotRow][col])) pivotRow = r;
    }
    [A[col], A[pivotRow]] = [A[pivotRow], A[col]];
    [I[col], I[pivotRow]] = [I[pivotRow], I[col]];
    const pivot = A[col][col];
    if (Math.abs(pivot) < 1e-12) continue; // singular
    for (let j = 0; j < n; j++) {
      A[col][j] /= pivot;
      I[col][j] /= pivot;
    }
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = A[r][col];
      for (let j = 0; j < n; j++) {
        A[r][j] -= factor * A[col][j];
        I[r][j] -= factor * I[col][j];
      }
    }
  }
  return I;
}

function diagMatrix(values: number[]): number[][] {
  const n = values.length;
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? values[i] : 0)),
  );
}

// Build covariance matrix from vols + correlation
function buildCovMatrix(): number[][] {
  const corr = buildCorrelationMatrix();
  const n = ASSETS.length;
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => ASSET_VOLS[i] * ASSET_VOLS[j] * corr[i][j]),
  );
}

function portfolioVariance(w: number[], cov: number[][]): number {
  const wCov = matVec(cov, w);
  return w.reduce((s, wi, i) => s + wi * wCov[i], 0);
}

// ─── Black-Litterman core ─────────────────────────────────────────────────────

/**
 * Builds the pick matrix P (k×n) and view vector Q (k) from investor views.
 * Also builds the uncertainty diagonal Ω (k).
 */
function buildPQOmega(
  views: View[],
  assetIdx: Map<string, number>,
  cov: number[][],
  tau: number,
): { P: number[][]; Q: number[]; omega: number[] } {
  const k = views.length;
  const n = ASSETS.length;
  const P: number[][] = Array.from({ length: k }, () => Array(n).fill(0));
  const Q: number[] = [];
  const omega: number[] = [];

  views.forEach((view, vi) => {
    const i1 = assetIdx.get(view.asset1) ?? 0;
    const q = view.expectedReturn / 100;
    Q.push(q);

    if (view.type === "absolute") {
      P[vi][i1] = 1;
    } else {
      const i2 = assetIdx.get(view.asset2) ?? 1;
      P[vi][i1] = 1;
      P[vi][i2] = -1;
    }

    // Ω_ii = (1 - confidence/100) * p_i' * τΣ * p_i
    const piRow = P[vi];
    const tauCov = cov.map((row) => row.map((x) => x * tau));
    const tauCovPi = matVec(tauCov, piRow);
    const pTauCovP = piRow.reduce((s, x, j) => s + x * tauCovPi[j], 0);
    const uncertainty = Math.max(0.001, 1 - view.confidence / 100);
    omega.push(uncertainty * pTauCovP + 1e-6); // add small jitter for stability
  });

  return { P, Q, omega };
}

/**
 * Black-Litterman posterior return:
 * μ_BL = [(τΣ)⁻¹ + PᵀΩ⁻¹P]⁻¹ × [(τΣ)⁻¹Π + PᵀΩ⁻¹Q]
 */
function computeBLReturns(
  equilibriumReturns: number[],
  cov: number[][],
  P: number[][],
  Q: number[],
  omega: number[],
  tau: number,
): number[] {
  const n = ASSETS.length;

  const tauCov = cov.map((row) => row.map((x) => x * tau));
  const tauCovInv = matInv(tauCov);

  if (P.length === 0) {
    // No views: return equilibrium
    return [...equilibriumReturns];
  }

  const Pt = transpose(P);
  const omegaInv = diagMatrix(omega.map((o) => 1 / o));

  // PᵀΩ⁻¹
  const PtOmegaInv = matMul(Pt, omegaInv);
  // PᵀΩ⁻¹P  (n×n)
  const PtOmegaInvP = matMul(PtOmegaInv, P);

  // M = (τΣ)⁻¹ + PᵀΩ⁻¹P
  const M: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => tauCovInv[i][j] + PtOmegaInvP[i][j]),
  );
  const Minv = matInv(M);

  // (τΣ)⁻¹Π
  const tauCovInvPi = matVec(tauCovInv, equilibriumReturns);

  // PᵀΩ⁻¹Q
  const PtOmegaInvQ = matVec(PtOmegaInv, Q);

  // RHS = (τΣ)⁻¹Π + PᵀΩ⁻¹Q
  const rhs = vecAdd(tauCovInvPi, PtOmegaInvQ);

  return matVec(Minv, rhs);
}

/**
 * Mean-variance optimal weights: w* ∝ Σ⁻¹μ, then long-only + 30% cap.
 */
function computeMVWeights(returns: number[], cov: number[][]): number[] {
  const covInv = matInv(cov);
  const raw = matVec(covInv, returns);
  // Long-only: clip negatives
  const clipped = raw.map((x) => Math.max(0, x));
  // Cap at 30%
  const sum = clipped.reduce((s, x) => s + x, 0);
  if (sum < 1e-10) return ASSETS.map(() => 1 / ASSETS.length);
  let w = clipped.map((x) => x / sum);
  // Iterative cap enforcement
  for (let iter = 0; iter < 20; iter++) {
    let capped = false;
    for (let i = 0; i < w.length; i++) {
      if (w[i] > 0.3) {
        w[i] = 0.3;
        capped = true;
      }
    }
    if (!capped) break;
    const s = w.reduce((a, x) => a + x, 0);
    w = w.map((x) => x / s);
  }
  return w;
}

function portfolioReturn(w: number[], returns: number[]): number {
  return w.reduce((s, wi, i) => s + wi * returns[i], 0);
}

function portfolioSharpe(ret: number, vol: number, rf = 0.05): number {
  return vol > 1e-6 ? (ret - rf) / vol : 0;
}

// ─── Main computation ─────────────────────────────────────────────────────────

function computeBL(views: View[], delta: number, tau: number): BLResult {
  const marketCapWeights = computeMarketCapWeights();
  const cov = buildCovMatrix();
  const assetIdx = new Map(ASSETS.map((a, i) => [a, i]));

  // Equilibrium returns: Π = δ × Σ × w_mkt
  const equilibriumReturns = vecScale(matVec(cov, marketCapWeights), delta);

  // Prior MV weights (using equilibrium returns)
  const priorWeights = computeMVWeights(equilibriumReturns, cov);

  // Build P, Q, Ω from views
  const { P, Q, omega } = buildPQOmega(views, assetIdx, cov, tau);

  // BL posterior returns
  const blReturns = computeBLReturns(equilibriumReturns, cov, P, Q, omega, tau);

  // BL optimal weights
  const blWeights = computeMVWeights(blReturns, cov);

  // Portfolio stats
  const rf = 0.05;
  const compStats = (label: string, w: number[], rets: number[]) => {
    const ret = portfolioReturn(w, rets);
    const vol = Math.sqrt(Math.max(0, portfolioVariance(w, cov)));
    return { label, ret, vol, sharpe: portfolioSharpe(ret, vol, rf) };
  };

  const eqWeights = ASSETS.map(() => 1 / ASSETS.length);
  const stats = [
    compStats("Equal Weight", eqWeights, blReturns),
    compStats("Market Cap", marketCapWeights, blReturns),
    compStats("Prior Optimal", priorWeights, equilibriumReturns),
    compStats("BL Optimal", blWeights, blReturns),
  ];

  return { equilibriumReturns, blReturns, priorWeights, blWeights, marketCapWeights, covMatrix: cov, stats };
}

// ─── SVG Charts ───────────────────────────────────────────────────────────────

const CHART_COLORS = [
  "#6366f1", "#22d3ee", "#a3e635", "#f97316", "#f43f5e",
  "#8b5cf6", "#14b8a6", "#fb923c", "#34d399", "#fbbf24",
];

function DonutChart({ weights, labels }: { weights: number[]; labels: string[] }) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 68;
  const innerR = 40;

  let cumulative = 0;
  const slices = weights.map((w, i) => {
    const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    cumulative += w;
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    const x1 = cx + outerR * Math.cos(startAngle);
    const y1 = cy + outerR * Math.sin(startAngle);
    const x2 = cx + outerR * Math.cos(endAngle);
    const y2 = cy + outerR * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);
    const d = `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2} Z`;
    return { d, color: CHART_COLORS[i % CHART_COLORS.length], weight: w, label: labels[i] };
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => (
          <path key={i} d={s.d} fill={s.color} opacity={0.85} />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="600">
          Market
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#94a3b8" fontSize="9">
          Cap Wts
        </text>
      </svg>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px]">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="text-muted-foreground font-medium">{s.label}</span>
            <span className="ml-auto text-foreground/80 tabular-nums">{(s.weight * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChartSVG({
  values,
  labels,
  color = "#6366f1",
  title,
}: {
  values: number[];
  labels: string[];
  color?: string;
  title?: string;
}) {
  const W = 340;
  const H = 140;
  const pad = { top: 12, right: 10, bottom: 28, left: 44 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const n = values.length;
  const barW = (innerW / n) * 0.65;
  const gap = innerW / n;
  const minVal = Math.min(0, ...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 0.01;
  const yScale = (v: number) => innerH - ((v - minVal) / range) * innerH;
  const zeroY = yScale(0);
  const yTicks = [minVal, (minVal + maxVal) / 2, maxVal];

  return (
    <div>
      {title && <p className="text-[10px] text-muted-foreground mb-1 font-medium">{title}</p>}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        {/* Grid lines */}
        {yTicks.map((tick, i) => {
          const y = pad.top + yScale(tick);
          return (
            <g key={i}>
              <line x1={pad.left} x2={W - pad.right} y1={y} y2={y} stroke="#334155" strokeDasharray="3,3" />
              <text x={pad.left - 4} y={y + 3} textAnchor="end" fill="#64748b" fontSize="8">
                {(tick * 100).toFixed(1)}%
              </text>
            </g>
          );
        })}
        {/* Zero line */}
        <line x1={pad.left} x2={W - pad.right} y1={pad.top + zeroY} y2={pad.top + zeroY} stroke="#475569" />
        {/* Bars */}
        {values.map((v, i) => {
          const x = pad.left + i * gap + gap / 2 - barW / 2;
          const barH = Math.abs(((v - 0) / range) * innerH);
          const y = v >= 0 ? pad.top + zeroY - barH : pad.top + zeroY;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={Math.max(1, barH)} fill={color} opacity={0.8} rx={2} />
              <text
                x={x + barW / 2}
                y={H - pad.bottom + 10}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="8"
                fontWeight="500"
              >
                {labels[i]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function DualBarChart({
  valuesA,
  valuesB,
  labels,
  colorA,
  colorB,
  labelA,
  labelB,
}: {
  valuesA: number[];
  valuesB: number[];
  labels: string[];
  colorA: string;
  colorB: string;
  labelA: string;
  labelB: string;
}) {
  const W = 360;
  const H = 160;
  const pad = { top: 16, right: 10, bottom: 30, left: 44 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const n = labels.length;
  const groupW = innerW / n;
  const barW = (groupW * 0.38);
  const allVals = [...valuesA, ...valuesB];
  const minVal = Math.min(0, ...allVals);
  const maxVal = Math.max(...allVals);
  const range = maxVal - minVal || 0.01;
  const yScale = (v: number) => innerH - ((v - minVal) / range) * innerH;
  const zeroY = yScale(0);
  const yTicks = [minVal, maxVal / 2, maxVal];

  return (
    <div>
      {/* Legend */}
      <div className="flex gap-4 mb-2 text-[10px]">
        <span className="flex items-center gap-1"><span className="h-2 w-3 rounded inline-block" style={{ background: colorA }} />{labelA}</span>
        <span className="flex items-center gap-1"><span className="h-2 w-3 rounded inline-block" style={{ background: colorB }} />{labelB}</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        {yTicks.map((tick, i) => {
          const y = pad.top + yScale(tick);
          return (
            <g key={i}>
              <line x1={pad.left} x2={W - pad.right} y1={y} y2={y} stroke="#334155" strokeDasharray="3,3" />
              <text x={pad.left - 4} y={y + 3} textAnchor="end" fill="#64748b" fontSize="8">
                {(tick * 100).toFixed(1)}%
              </text>
            </g>
          );
        })}
        <line x1={pad.left} x2={W - pad.right} y1={pad.top + zeroY} y2={pad.top + zeroY} stroke="#475569" />
        {labels.map((lbl, i) => {
          const cx = pad.left + i * groupW + groupW / 2;
          const xA = cx - barW - 1;
          const xB = cx + 1;
          const renderBar = (v: number, x: number, col: string) => {
            const bH = Math.abs((v / range) * innerH);
            const y = v >= 0 ? pad.top + zeroY - bH : pad.top + zeroY;
            return <rect key={col + i} x={x} y={y} width={barW} height={Math.max(1, bH)} fill={col} opacity={0.8} rx={1} />;
          };
          return (
            <g key={i}>
              {renderBar(valuesA[i], xA, colorA)}
              {renderBar(valuesB[i], xB, colorB)}
              <text x={cx} y={H - pad.bottom + 10} textAnchor="middle" fill="#94a3b8" fontSize="8">{lbl}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function StackedBarChart({
  before,
  after,
  labels,
}: {
  before: number[];
  after: number[];
  labels: string[];
}) {
  const W = 360;
  const H = 120;
  const pad = { top: 12, right: 12, bottom: 26, left: 60 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const n = labels.length;
  const barH = (innerH / n) * 0.6;
  const gap = innerH / n;
  const maxW = Math.max(...before, ...after, 0.001);

  return (
    <div>
      <div className="flex gap-4 mb-2 text-[10px]">
        <span className="flex items-center gap-1"><span className="h-2 w-3 rounded inline-block bg-indigo-500/80" />Before Views</span>
        <span className="flex items-center gap-1"><span className="h-2 w-3 rounded inline-block bg-cyan-400/80" />After Views</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        {labels.map((lbl, i) => {
          const yA = pad.top + i * gap + gap / 2 - barH;
          const yB = pad.top + i * gap + gap / 2;
          const wA = (before[i] / maxW) * innerW;
          const wB = (after[i] / maxW) * innerW;
          const change = after[i] - before[i];
          const changeColor = change > 0.001 ? "#34d399" : change < -0.001 ? "#f87171" : "#94a3b8";
          return (
            <g key={i}>
              <text x={pad.left - 4} y={pad.top + i * gap + gap / 2 + 3} textAnchor="end" fill="#94a3b8" fontSize="8" fontWeight="500">{lbl}</text>
              <rect x={pad.left} y={yA} width={Math.max(1, wA)} height={barH - 1} fill="#6366f1" opacity={0.7} rx={1} />
              <rect x={pad.left} y={yB} width={Math.max(1, wB)} height={barH - 1} fill="#22d3ee" opacity={0.7} rx={1} />
              <text x={pad.left + Math.max(wA, wB) + 4} y={pad.top + i * gap + gap / 2 + 3} fill={changeColor} fontSize="8" fontWeight="600">
                {change > 0.001 ? "+" : ""}{(change * 100).toFixed(1)}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function EfficientFrontierDot({
  stats,
}: {
  stats: { label: string; ret: number; vol: number; sharpe: number }[];
}) {
  const W = 340;
  const H = 160;
  const pad = { top: 16, right: 16, bottom: 30, left: 48 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const vols = stats.map((s) => s.vol * 100);
  const rets = stats.map((s) => s.ret * 100);
  const minVol = Math.max(0, Math.min(...vols) - 2);
  const maxVol = Math.max(...vols) + 2;
  const minRet = Math.min(...rets) - 1;
  const maxRet = Math.max(...rets) + 1;

  const xScale = (v: number) => pad.left + ((v - minVol) / (maxVol - minVol)) * innerW;
  const yScale = (r: number) => H - pad.bottom - ((r - minRet) / (maxRet - minRet)) * innerH;

  const COLORS = ["#94a3b8", "#f97316", "#8b5cf6", "#22d3ee"];
  const xTicks = [minVol, (minVol + maxVol) / 2, maxVol];
  const yTicks = [minRet, (minRet + maxRet) / 2, maxRet];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      {xTicks.map((t, i) => (
        <text key={"x" + i} x={xScale(t)} y={H - pad.bottom + 10} textAnchor="middle" fill="#64748b" fontSize="8">
          {t.toFixed(1)}%
        </text>
      ))}
      {yTicks.map((t, i) => (
        <g key={"y" + i}>
          <line x1={pad.left} x2={W - pad.right} y1={yScale(t)} y2={yScale(t)} stroke="#1e293b" />
          <text x={pad.left - 4} y={yScale(t) + 3} textAnchor="end" fill="#64748b" fontSize="8">
            {t.toFixed(1)}%
          </text>
        </g>
      ))}
      <text x={W / 2} y={H - 2} textAnchor="middle" fill="#475569" fontSize="8">Volatility (%)</text>
      {stats.map((s, i) => (
        <g key={i}>
          <circle cx={xScale(s.vol * 100)} cy={yScale(s.ret * 100)} r={6} fill={COLORS[i]} opacity={0.85} />
          <text x={xScale(s.vol * 100) + 8} y={yScale(s.ret * 100) + 3} fill={COLORS[i]} fontSize="8" fontWeight="600">
            {s.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const EXAMPLE_VIEWS: View[] = [
  { id: "v1", type: "absolute", asset1: "AAPL", asset2: "MSFT", expectedReturn: 15, confidence: 75 },
  { id: "v2", type: "relative", asset1: "NVDA", asset2: "TSLA", expectedReturn: 8, confidence: 60 },
  { id: "v3", type: "absolute", asset1: "JPM", asset2: "JNJ", expectedReturn: 10, confidence: 50 },
];

let viewCounter = 4;

export function BlackLitterman() {
  const [delta, setDelta] = useState(2.5);
  const [tau, setTau] = useState(0.05);
  const [views, setViews] = useState<View[]>([]);

  const result = useMemo(() => computeBL(views, delta, tau), [views, delta, tau]);

  const assetLabels = ASSETS.map((a) => a.replace("GOOGL", "GOOG"));

  function addView() {
    if (views.length >= 5) return;
    setViews((prev) => [
      ...prev,
      {
        id: `v${viewCounter++}`,
        type: "absolute",
        asset1: "AAPL",
        asset2: "MSFT",
        expectedReturn: 12,
        confidence: 60,
      },
    ]);
  }

  function removeView(id: string) {
    setViews((prev) => prev.filter((v) => v.id !== id));
  }

  function updateView(id: string, patch: Partial<View>) {
    setViews((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }

  function loadExamples() {
    setViews(EXAMPLE_VIEWS);
    viewCounter = 10;
  }

  const tilts = result.blReturns.map((bl, i) => bl - result.equilibriumReturns[i]);

  return (
    <div className="space-y-5 text-[12px]">
      {/* ── Section 1: Market Equilibrium ─────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-foreground">Section 1: Market Equilibrium (CAPM Prior)</h3>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <label className="flex items-center gap-1.5">
              <span>δ (risk aversion)</span>
              <input
                type="range"
                min={0.5}
                max={6}
                step={0.1}
                value={delta}
                onChange={(e) => setDelta(parseFloat(e.target.value))}
                className="w-20 accent-indigo-500"
              />
              <span className="tabular-nums font-semibold text-foreground w-6">{delta.toFixed(1)}</span>
            </label>
            <label className="flex items-center gap-1.5">
              <span>τ (uncertainty)</span>
              <input
                type="range"
                min={0.01}
                max={0.3}
                step={0.01}
                value={tau}
                onChange={(e) => setTau(parseFloat(e.target.value))}
                className="w-20 accent-indigo-500"
              />
              <span className="tabular-nums font-semibold text-foreground w-8">{tau.toFixed(2)}</span>
            </label>
          </div>
        </div>

        <div className="text-[10px] text-muted-foreground bg-muted/30 rounded px-3 py-2 font-mono">
          Π = δ × Σ × w<sub>mkt</sub> &nbsp;|&nbsp; δ = {delta.toFixed(1)}, τ = {tau.toFixed(2)}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <DonutChart weights={result.marketCapWeights} labels={ASSETS as unknown as string[]} />
          <BarChartSVG
            values={result.equilibriumReturns}
            labels={assetLabels}
            color="#6366f1"
            title="Equilibrium Expected Returns (Π)"
          />
        </div>
      </div>

      {/* ── Section 2: Investor Views ─────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-foreground">Section 2: Investor Views (P, Q, Ω)</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadExamples}
              className="flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[10px] hover:bg-muted transition-colors"
            >
              <Lightbulb className="h-3 w-3 text-amber-400" />
              Example Views
            </button>
            <button
              type="button"
              onClick={() => setViews([])}
              className="flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[10px] hover:bg-muted transition-colors"
            >
              <X className="h-3 w-3 text-muted-foreground" />
              Clear All
            </button>
            <button
              type="button"
              onClick={addView}
              disabled={views.length >= 5}
              className={cn(
                "flex items-center gap-1 rounded-md px-2 py-1 text-[10px] transition-colors",
                views.length >= 5
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-500",
              )}
            >
              <Plus className="h-3 w-3" />
              Add View
            </button>
          </div>
        </div>

        {views.length === 0 && (
          <p className="text-[11px] text-muted-foreground/60 italic py-3 text-center">
            No views added. Click "Add View" or load examples to start.
          </p>
        )}

        <div className="space-y-2">
          {views.map((view, vi) => (
            <div key={view.id} className="rounded-md border border-border bg-background/60 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-muted-foreground">View {vi + 1}</span>
                <button type="button" onClick={() => removeView(view.id)} className="text-muted-foreground/50 hover:text-red-400 transition-colors">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {/* Type toggle */}
                <div className="flex rounded-md overflow-hidden border border-border text-[10px]">
                  {(["absolute", "relative"] as ViewType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => updateView(view.id, { type: t })}
                      className={cn(
                        "px-2 py-1 capitalize transition-colors",
                        view.type === t ? "bg-indigo-600 text-white" : "bg-background text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Asset 1 */}
                <select
                  value={view.asset1}
                  onChange={(e) => updateView(view.id, { asset1: e.target.value as Asset })}
                  className="rounded border border-border bg-background px-1.5 py-1 text-[10px] text-foreground"
                >
                  {ASSETS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>

                {view.type === "relative" && (
                  <>
                    <span className="text-muted-foreground text-[10px]">outperforms</span>
                    <select
                      value={view.asset2}
                      onChange={(e) => updateView(view.id, { asset2: e.target.value as Asset })}
                      className="rounded border border-border bg-background px-1.5 py-1 text-[10px] text-foreground"
                    >
                      {ASSETS.filter((a) => a !== view.asset1).map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                    <span className="text-muted-foreground text-[10px]">by</span>
                  </>
                )}

                {view.type === "absolute" && (
                  <span className="text-muted-foreground text-[10px]">returns</span>
                )}

                {/* Return expectation */}
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={-50}
                    max={100}
                    step={0.5}
                    value={view.expectedReturn}
                    onChange={(e) => updateView(view.id, { expectedReturn: parseFloat(e.target.value) || 0 })}
                    className="w-14 rounded border border-border bg-background px-1.5 py-1 text-[10px] text-foreground text-right tabular-nums"
                  />
                  <span className="text-muted-foreground text-[10px]">%</span>
                </div>

                {/* Confidence */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-muted-foreground text-[10px]">Confidence</span>
                  <input
                    type="range"
                    min={1}
                    max={99}
                    value={view.confidence}
                    onChange={(e) => updateView(view.id, { confidence: parseInt(e.target.value) })}
                    className="w-16 accent-indigo-500"
                  />
                  <span className="tabular-nums font-semibold text-foreground text-[10px] w-7">{view.confidence}%</span>
                </div>
              </div>

              {/* Inline summary */}
              <p className="text-[9px] text-muted-foreground/70 italic">
                {view.type === "absolute"
                  ? `${view.asset1} will return ${view.expectedReturn}% annually — Ω uncertainty: ${(1 - view.confidence / 100).toFixed(2)}`
                  : `${view.asset1} outperforms ${view.asset2} by ${view.expectedReturn}% — Ω uncertainty: ${(1 - view.confidence / 100).toFixed(2)}`}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 3: BL Combined Returns ───────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <h3 className="text-xs font-semibold text-foreground">Section 3: Black-Litterman Combined Returns</h3>

        <div className="text-[10px] text-muted-foreground bg-muted/30 rounded px-3 py-2 font-mono space-y-0.5">
          <div>μ<sub>BL</sub> = [(τΣ)⁻¹ + PᵀΩ⁻¹P]⁻¹ × [(τΣ)⁻¹Π + PᵀΩ⁻¹Q]</div>
          {views.length === 0 && <div className="text-amber-400/70 mt-1">No views → μ_BL = Π (equilibrium)</div>}
        </div>

        <DualBarChart
          valuesA={result.equilibriumReturns}
          valuesB={result.blReturns}
          labels={assetLabels}
          colorA="#6366f1"
          colorB="#22d3ee"
          labelA="Prior (Π)"
          labelB="BL Posterior"
        />

        {/* Tilt table */}
        <div>
          <p className="text-[10px] font-medium text-muted-foreground mb-2">Return Tilt: BL Posterior − Prior Equilibrium</p>
          <div className="grid grid-cols-5 gap-1">
            {ASSETS.map((a, i) => {
              const tilt = tilts[i];
              const isPos = tilt > 0.0001;
              const isNeg = tilt < -0.0001;
              return (
                <div key={a} className="rounded border border-border bg-background/50 px-2 py-1.5 text-center">
                  <div className="text-[9px] text-muted-foreground font-medium">{a}</div>
                  <div
                    className={cn(
                      "text-[10px] font-bold tabular-nums",
                      isPos ? "text-emerald-400" : isNeg ? "text-red-400" : "text-muted-foreground",
                    )}
                  >
                    {isPos ? "+" : ""}
                    {(tilt * 100).toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Section 4: Optimal Portfolio Weights ─────────────────────────── */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <h3 className="text-xs font-semibold text-foreground">Section 4: Optimal Portfolio Weights</h3>
        <div className="text-[10px] text-muted-foreground bg-muted/30 rounded px-3 py-2 font-mono">
          w* ∝ Σ⁻¹ × μ_BL &nbsp;|&nbsp; constraints: long-only, max 30% per asset
        </div>

        <StackedBarChart
          before={result.priorWeights}
          after={result.blWeights}
          labels={ASSETS as unknown as string[]}
        />

        {/* Weight table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-1.5 pr-3 text-muted-foreground font-medium">Asset</th>
                <th className="text-right py-1.5 px-2 text-muted-foreground font-medium">Market Cap</th>
                <th className="text-right py-1.5 px-2 text-muted-foreground font-medium">Before Views</th>
                <th className="text-right py-1.5 px-2 text-muted-foreground font-medium">After Views</th>
                <th className="text-right py-1.5 pl-2 text-muted-foreground font-medium">Change</th>
              </tr>
            </thead>
            <tbody>
              {ASSETS.map((a, i) => {
                const change = result.blWeights[i] - result.priorWeights[i];
                const isPos = change > 0.001;
                const isNeg = change < -0.001;
                return (
                  <tr key={a} className="border-b border-border/30 hover:bg-muted/20">
                    <td className="py-1.5 pr-3 font-semibold text-foreground">{a}</td>
                    <td className="text-right px-2 tabular-nums text-muted-foreground">
                      {(result.marketCapWeights[i] * 100).toFixed(1)}%
                    </td>
                    <td className="text-right px-2 tabular-nums">{(result.priorWeights[i] * 100).toFixed(1)}%</td>
                    <td className="text-right px-2 tabular-nums font-semibold">{(result.blWeights[i] * 100).toFixed(1)}%</td>
                    <td
                      className={cn(
                        "text-right pl-2 tabular-nums font-bold",
                        isPos ? "text-emerald-400" : isNeg ? "text-red-400" : "text-muted-foreground",
                      )}
                    >
                      {isPos ? "+" : ""}
                      {(change * 100).toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 5: Portfolio Statistics ──────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <h3 className="text-xs font-semibold text-foreground">Section 5: Portfolio Statistics Comparison</h3>

        {/* Stats table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-1.5 pr-3 text-muted-foreground font-medium">Portfolio</th>
                <th className="text-right py-1.5 px-2 text-muted-foreground font-medium">Exp. Return</th>
                <th className="text-right py-1.5 px-2 text-muted-foreground font-medium">Volatility</th>
                <th className="text-right py-1.5 pl-2 text-muted-foreground font-medium">Sharpe</th>
              </tr>
            </thead>
            <tbody>
              {result.stats.map((s, i) => {
                const isBL = s.label === "BL Optimal";
                return (
                  <tr
                    key={s.label}
                    className={cn(
                      "border-b border-border/30",
                      isBL ? "bg-indigo-500/8 font-semibold" : "hover:bg-muted/20",
                    )}
                  >
                    <td className={cn("py-1.5 pr-3", isBL ? "text-indigo-300" : "text-foreground")}>
                      {isBL ? "★ " : ""}{s.label}
                    </td>
                    <td className="text-right px-2 tabular-nums text-emerald-400 font-semibold">
                      {(s.ret * 100).toFixed(2)}%
                    </td>
                    <td className="text-right px-2 tabular-nums text-amber-400">
                      {(s.vol * 100).toFixed(2)}%
                    </td>
                    <td
                      className={cn(
                        "text-right pl-2 tabular-nums font-bold",
                        s.sharpe > 0.5 ? "text-emerald-400" : s.sharpe > 0 ? "text-amber-400" : "text-red-400",
                      )}
                    >
                      {s.sharpe.toFixed(3)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Efficient frontier scatter */}
        <div>
          <p className="text-[10px] font-medium text-muted-foreground mb-2">Portfolio Placement (Return vs Volatility)</p>
          <EfficientFrontierDot stats={result.stats} />
        </div>
      </div>
    </div>
  );
}
