"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Layers,
  Target,
  Zap,
  Brain,
  GitBranch,
  Shuffle,
  SlidersHorizontal,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 622002;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed() {
  s = 622002;
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface FactorModel {
  name: string;
  shortName: string;
  factors: string[];
  alpha: number;
  beta: number;
  rSquared: number;
  sharpe: number;
  description: string;
  color: string;
}

interface MomentumStrategy {
  name: string;
  formation: number;
  holding: number;
  annualReturn: number;
  sharpe: number;
  maxDrawdown: number;
  winRate: number;
  color: string;
}

interface PairEntry {
  ticker1: string;
  ticker2: string;
  correlation: number;
  cointegrationP: number;
  halfLife: number;
  annualReturn: number;
  sharpe: number;
}

interface StatArbResult {
  name: string;
  pairs: number;
  annualReturn: number;
  sharpe: number;
  maxDrawdown: number;
  beta: number;
  color: string;
}

interface MLFeature {
  name: string;
  importance: number;
  ic: number;
  icir: number;
  category: string;
}

// ── Static data ────────────────────────────────────────────────────────────────

const FACTOR_MODELS: FactorModel[] = [
  {
    name: "Capital Asset Pricing Model",
    shortName: "CAPM",
    factors: ["Market (Mkt-RF)"],
    alpha: 0.21,
    beta: 1.04,
    rSquared: 0.71,
    sharpe: 0.42,
    description: "Single-factor model relating expected return to systematic market risk (beta).",
    color: "#6366f1",
  },
  {
    name: "Fama-French 3-Factor",
    shortName: "FF3",
    factors: ["Market", "SMB", "HML"],
    alpha: 0.48,
    beta: 0.97,
    rSquared: 0.86,
    sharpe: 0.68,
    description: "Adds size (SMB) and value (HML) factors to explain cross-sectional return variation.",
    color: "#22c55e",
  },
  {
    name: "Carhart 4-Factor",
    shortName: "Carhart",
    factors: ["Market", "SMB", "HML", "MOM"],
    alpha: 0.55,
    beta: 0.94,
    rSquared: 0.89,
    sharpe: 0.76,
    description: "Extends FF3 with a momentum factor (WML) to capture trend persistence.",
    color: "#f59e0b",
  },
  {
    name: "Fama-French 5-Factor",
    shortName: "FF5",
    factors: ["Market", "SMB", "HML", "RMW", "CMA"],
    alpha: 0.61,
    beta: 0.91,
    rSquared: 0.92,
    sharpe: 0.83,
    description: "Adds profitability (RMW) and investment (CMA) factors for broader explanatory power.",
    color: "#ec4899",
  },
];

const MOMENTUM_STRATEGIES: MomentumStrategy[] = [
  {
    name: "Classic 12-1 Momentum",
    formation: 12,
    holding: 1,
    annualReturn: 11.4,
    sharpe: 0.71,
    maxDrawdown: -38.2,
    winRate: 58.3,
    color: "#6366f1",
  },
  {
    name: "Short-Term Reversal",
    formation: 1,
    holding: 1,
    annualReturn: 7.8,
    sharpe: 0.59,
    maxDrawdown: -22.6,
    winRate: 54.1,
    color: "#22c55e",
  },
  {
    name: "Intermediate Momentum",
    formation: 6,
    holding: 3,
    annualReturn: 9.6,
    sharpe: 0.65,
    maxDrawdown: -31.4,
    winRate: 56.7,
    color: "#f59e0b",
  },
  {
    name: "Time-Series Momentum",
    formation: 12,
    holding: 1,
    annualReturn: 14.2,
    sharpe: 0.88,
    maxDrawdown: -19.3,
    winRate: 62.4,
    color: "#ec4899",
  },
];

const PAIRS: PairEntry[] = [
  { ticker1: "KO", ticker2: "PEP", correlation: 0.91, cointegrationP: 0.02, halfLife: 18, annualReturn: 8.4, sharpe: 1.42 },
  { ticker1: "XOM", ticker2: "CVX", correlation: 0.94, cointegrationP: 0.01, halfLife: 12, annualReturn: 9.1, sharpe: 1.58 },
  { ticker1: "JPM", ticker2: "BAC", correlation: 0.89, cointegrationP: 0.03, halfLife: 22, annualReturn: 7.6, sharpe: 1.29 },
  { ticker1: "MSFT", ticker2: "GOOGL", correlation: 0.87, cointegrationP: 0.04, halfLife: 31, annualReturn: 6.9, sharpe: 1.11 },
  { ticker1: "GLD", ticker2: "SLV", correlation: 0.95, cointegrationP: 0.01, halfLife: 9, annualReturn: 11.3, sharpe: 1.74 },
];

const STAT_ARB_RESULTS: StatArbResult[] = [
  { name: "Sector-Neutral L/S", pairs: 40, annualReturn: 12.6, sharpe: 1.31, maxDrawdown: -8.4, beta: 0.04, color: "#6366f1" },
  { name: "Country-Neutral ETF", pairs: 25, annualReturn: 9.8, sharpe: 1.08, maxDrawdown: -11.2, beta: 0.02, color: "#22c55e" },
  { name: "Index Arb", pairs: 15, annualReturn: 7.4, sharpe: 0.94, maxDrawdown: -6.1, beta: 0.01, color: "#f59e0b" },
];

const ML_FEATURES: MLFeature[] = [
  { name: "12-Month Price Momentum", importance: 0.18, ic: 0.062, icir: 1.41, category: "Momentum" },
  { name: "RSI(14)", importance: 0.14, ic: 0.048, icir: 1.09, category: "Technical" },
  { name: "EPS Surprise %", importance: 0.13, ic: 0.071, icir: 1.62, category: "Fundamental" },
  { name: "Short Interest Ratio", importance: 0.11, ic: -0.041, icir: -0.93, category: "Sentiment" },
  { name: "Book-to-Market", importance: 0.10, ic: 0.038, icir: 0.87, category: "Fundamental" },
  { name: "Volume Trend (30d)", importance: 0.09, ic: 0.029, icir: 0.66, category: "Technical" },
  { name: "MACD Signal", importance: 0.08, ic: 0.031, icir: 0.71, category: "Technical" },
  { name: "Analyst Revision", importance: 0.07, ic: 0.054, icir: 1.23, category: "Sentiment" },
  { name: "Operating Margin", importance: 0.06, ic: 0.026, icir: 0.59, category: "Fundamental" },
  { name: "Beta (60d)", importance: 0.04, ic: -0.018, icir: -0.41, category: "Risk" },
];

// ── Chart helpers ──────────────────────────────────────────────────────────────

function generateCumulativeReturns(
  length: number,
  annualReturn: number,
  sharpe: number,
  seed: number
): number[] {
  let ls = seed;
  const prng = () => {
    ls = (ls * 1103515245 + 12345) & 0x7fffffff;
    return ls / 0x7fffffff;
  };
  const dailyMu = annualReturn / 100 / 252;
  const dailySigma = (annualReturn / 100) / (sharpe * Math.sqrt(252));
  const points: number[] = [100];
  for (let i = 1; i < length; i++) {
    const u1 = prng();
    const u2 = prng();
    const z = Math.sqrt(-2 * Math.log(u1 + 0.0001)) * Math.cos(2 * Math.PI * u2);
    const ret = dailyMu + dailySigma * z;
    points.push(points[i - 1] * (1 + ret));
  }
  return points;
}

function generateSpreadSeries(length: number, halfLife: number, seed: number): number[] {
  let ls = seed;
  const prng = () => {
    ls = (ls * 1103515245 + 12345) & 0x7fffffff;
    return ls / 0x7fffffff;
  };
  const theta = Math.log(2) / halfLife;
  const spread: number[] = [0];
  for (let i = 1; i < length; i++) {
    const z = (prng() - 0.5) * 2;
    spread.push(spread[i - 1] * (1 - theta) + z * 0.3);
  }
  return spread;
}

// ── SVG Charts ─────────────────────────────────────────────────────────────────

function LineChart({
  series,
  colors,
  width = 600,
  height = 220,
  labels,
}: {
  series: number[][];
  colors: string[];
  width?: number;
  height?: number;
  labels?: string[];
}) {
  const pad = { top: 16, right: 24, bottom: 32, left: 48 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;

  const allVals = series.flat();
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);
  const range = maxV - minV || 1;

  const toX = (i: number, len: number) => pad.left + (i / (len - 1)) * w;
  const toY = (v: number) => pad.top + h - ((v - minV) / range) * h;

  const buildPath = (pts: number[]) =>
    pts.map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i, pts.length).toFixed(1)} ${toY(v).toFixed(1)}`).join(" ");

  const yTicks = 5;
  const yStep = range / (yTicks - 1);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: height }}>
      {/* grid */}
      {Array.from({ length: yTicks }).map((_, i) => {
        const val = minV + i * yStep;
        const y = toY(val);
        return (
          <g key={i}>
            <line x1={pad.left} y1={y} x2={pad.left + w} y2={y} stroke="#334155" strokeWidth={0.5} />
            <text x={pad.left - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#64748b">
              {val.toFixed(0)}
            </text>
          </g>
        );
      })}
      {/* x axis labels */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
        const idx = Math.round(frac * (series[0].length - 1));
        return (
          <text key={i} x={toX(idx, series[0].length)} y={height - 6} textAnchor="middle" fontSize={9} fill="#64748b">
            {Math.round(frac * 100)}%
          </text>
        );
      })}
      {/* lines */}
      {series.map((pts, si) => (
        <path key={si} d={buildPath(pts)} fill="none" stroke={colors[si]} strokeWidth={1.5} />
      ))}
      {/* legend */}
      {labels &&
        labels.map((lbl, i) => (
          <g key={i} transform={`translate(${pad.left + (i % 2) * 140}, ${height - pad.bottom + (Math.floor(i / 2)) * 12 + 4})`}>
            <rect width={8} height={3} y={-2} fill={colors[i]} rx={1} />
            <text x={11} fontSize={8} fill="#94a3b8">
              {lbl}
            </text>
          </g>
        ))}
    </svg>
  );
}

function SpreadChart({ spread, height = 200 }: { spread: number[]; height?: number }) {
  const pad = { top: 16, right: 16, bottom: 28, left: 44 };
  const width = 600;
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;

  const minV = Math.min(...spread);
  const maxV = Math.max(...spread);
  const range = maxV - minV || 1;

  const toX = (i: number) => pad.left + (i / (spread.length - 1)) * w;
  const toY = (v: number) => pad.top + h - ((v - minV) / range) * h;

  const zeroY = toY(0);
  const upperY = toY(2 * ((maxV - minV) / 6));
  const lowerY = toY(-2 * ((maxV - minV) / 6));

  const pathD = spread.map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: height }}>
      {/* bands */}
      <rect x={pad.left} y={upperY} width={w} height={lowerY - upperY} fill="#22c55e11" />
      <line x1={pad.left} y1={upperY} x2={pad.left + w} y2={upperY} stroke="#22c55e" strokeWidth={0.8} strokeDasharray="4 3" />
      <line x1={pad.left} y1={lowerY} x2={pad.left + w} y2={lowerY} stroke="#22c55e" strokeWidth={0.8} strokeDasharray="4 3" />
      <line x1={pad.left} y1={zeroY} x2={pad.left + w} y2={zeroY} stroke="#94a3b8" strokeWidth={0.8} />
      {/* area fill */}
      <path
        d={`${pathD} L ${toX(spread.length - 1)} ${zeroY} L ${toX(0)} ${zeroY} Z`}
        fill="#6366f133"
      />
      <path d={pathD} fill="none" stroke="#6366f1" strokeWidth={1.5} />
      {/* y labels */}
      {[-2, -1, 0, 1, 2].map((sd) => {
        const norm = (sd - (-3)) / 6;
        const y = pad.top + h - norm * h;
        return (
          <text key={sd} x={pad.left - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#64748b">
            {sd}σ
          </text>
        );
      })}
      <text x={pad.left + 4} y={upperY - 3} fontSize={8} fill="#22c55e">
        +2σ entry
      </text>
      <text x={pad.left + 4} y={lowerY + 9} fontSize={8} fill="#22c55e">
        -2σ entry
      </text>
    </svg>
  );
}

function EquityCurveChart({
  curves,
  colors,
  names,
  height = 220,
}: {
  curves: number[][];
  colors: string[];
  names: string[];
  height?: number;
}) {
  const pad = { top: 16, right: 24, bottom: 44, left: 52 };
  const width = 600;
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;

  const allVals = curves.flat();
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);
  const range = maxV - minV || 1;

  const toX = (i: number, len: number) => pad.left + (i / (len - 1)) * w;
  const toY = (v: number) => pad.top + h - ((v - minV) / range) * h;
  const buildPath = (pts: number[]) =>
    pts.map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i, pts.length).toFixed(1)} ${toY(v).toFixed(1)}`).join(" ");

  const yTicks = 5;
  const yStep = range / (yTicks - 1);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: height }}>
      {Array.from({ length: yTicks }).map((_, i) => {
        const val = minV + i * yStep;
        const y = toY(val);
        return (
          <g key={i}>
            <line x1={pad.left} y1={y} x2={pad.left + w} y2={y} stroke="#334155" strokeWidth={0.5} />
            <text x={pad.left - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#64748b">
              {val.toFixed(0)}
            </text>
          </g>
        );
      })}
      {curves.map((pts, si) => (
        <path key={si} d={buildPath(pts)} fill="none" stroke={colors[si]} strokeWidth={1.5} />
      ))}
      {names.map((name, i) => (
        <g key={i} transform={`translate(${pad.left + (i % 3) * 160}, ${height - pad.bottom + 10 + Math.floor(i / 3) * 12})`}>
          <rect width={8} height={3} y={-2} fill={colors[i]} rx={1} />
          <text x={11} fontSize={8} fill="#94a3b8">
            {name}
          </text>
        </g>
      ))}
    </svg>
  );
}

function FactorBarChart({ model }: { model: FactorModel }) {
  resetSeed();
  const factorNames = ["Mkt-RF", "SMB", "HML", "MOM", "RMW", "CMA"];
  const modelLoadings: Record<string, number[]> = {
    CAPM: [1.04, 0, 0, 0, 0, 0],
    FF3: [0.97, 0.34, 0.28, 0, 0, 0],
    Carhart: [0.94, 0.31, 0.25, 0.18, 0, 0],
    FF5: [0.91, 0.29, 0.22, 0, 0.19, 0.14],
  };
  const loadings = modelLoadings[model.shortName] || [0, 0, 0, 0, 0, 0];
  const maxAbs = Math.max(...loadings.map(Math.abs), 0.01);

  const barW = 44;
  const gap = 18;
  const chartW = factorNames.length * (barW + gap) + 40;
  const chartH = 180;
  const midY = chartH / 2;
  const barMaxH = 70;

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" style={{ maxHeight: chartH }}>
      <line x1={20} y1={midY} x2={chartW - 10} y2={midY} stroke="#475569" strokeWidth={0.8} />
      {factorNames.map((fn, i) => {
        const loading = loadings[i];
        const barH = (Math.abs(loading) / maxAbs) * barMaxH;
        const positive = loading >= 0;
        const x = 20 + i * (barW + gap);
        const y = positive ? midY - barH : midY;
        const barColor = loading === 0 ? "#1e293b" : positive ? model.color : "#ef4444";
        return (
          <g key={fn}>
            <rect x={x} y={y} width={barW} height={barH || 1} fill={barColor} rx={3} opacity={loading === 0 ? 0.2 : 1} />
            <text x={x + barW / 2} textAnchor="middle" y={chartH - 4} fontSize={9} fill="#94a3b8">
              {fn}
            </text>
            {loading !== 0 && (
              <text
                x={x + barW / 2}
                textAnchor="middle"
                y={positive ? y - 4 : y + barH + 11}
                fontSize={9}
                fill="#e2e8f0"
              >
                {loading.toFixed(2)}
              </text>
            )}
          </g>
        );
      })}
      <text x={10} y={midY - barMaxH - 6} textAnchor="middle" fontSize={9} fill="#64748b" transform={`rotate(-90, 10, ${midY})`}>
        Loading
      </text>
    </svg>
  );
}

function ConfusionMatrix({ seed }: { seed: number }) {
  let ls = seed;
  const prng = () => {
    ls = (ls * 1103515245 + 12345) & 0x7fffffff;
    return ls / 0x7fffffff;
  };
  const tp = Math.round(280 + prng() * 40);
  const tn = Math.round(260 + prng() * 40);
  const fp = Math.round(80 + prng() * 30);
  const fn = Math.round(90 + prng() * 30);
  const total = tp + tn + fp + fn;
  const accuracy = ((tp + tn) / total) * 100;
  const precision = (tp / (tp + fp)) * 100;
  const recall = (tp / (tp + fn)) * 100;
  const f1 = (2 * precision * recall) / (precision + recall);

  const cells = [
    { label: "TP", val: tp, bg: "#16a34a33", border: "#16a34a" },
    { label: "FP", val: fp, bg: "#dc262633", border: "#dc2626" },
    { label: "FN", val: fn, bg: "#dc262633", border: "#dc2626" },
    { label: "TN", val: tn, bg: "#16a34a33", border: "#16a34a" },
  ];

  const size = 180;
  const cell = size / 2;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox={`0 0 ${size + 60} ${size + 60}`} className="w-full max-w-xs">
        <text x={30 + cell / 2} textAnchor="middle" y={18} fontSize={9} fill="#94a3b8">
          Predicted +
        </text>
        <text x={30 + cell + cell / 2} textAnchor="middle" y={18} fontSize={9} fill="#94a3b8">
          Predicted −
        </text>
        <text x={14} y={30 + cell / 2 + 4} textAnchor="middle" fontSize={9} fill="#94a3b8" transform={`rotate(-90, 14, ${30 + cell / 2})`}>
          Actual +
        </text>
        <text x={14} y={30 + cell + cell / 2 + 4} textAnchor="middle" fontSize={9} fill="#94a3b8" transform={`rotate(-90, 14, ${30 + cell + cell / 2})`}>
          Actual −
        </text>
        {cells.map((cell_, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          return (
            <g key={cell_.label}>
              <rect
                x={30 + col * cell}
                y={30 + row * cell}
                width={cell}
                height={cell}
                fill={cell_.bg}
                stroke={cell_.border}
                strokeWidth={1}
              />
              <text
                x={30 + col * cell + cell / 2}
                y={30 + row * cell + cell / 2 - 6}
                textAnchor="middle"
                fontSize={8}
                fill="#94a3b8"
              >
                {cell_.label}
              </text>
              <text
                x={30 + col * cell + cell / 2}
                y={30 + row * cell + cell / 2 + 10}
                textAnchor="middle"
                fontSize={16}
                fontWeight="bold"
                fill="#e2e8f0"
              >
                {cell_.val}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="grid grid-cols-2 gap-2 w-full text-xs">
        {[
          { label: "Accuracy", val: accuracy.toFixed(1) + "%" },
          { label: "Precision", val: precision.toFixed(1) + "%" },
          { label: "Recall", val: recall.toFixed(1) + "%" },
          { label: "F1 Score", val: f1.toFixed(1) + "%" },
        ].map((m) => (
          <div key={m.label} className="bg-card/80 rounded p-2">
            <div className="text-muted-foreground">{m.label}</div>
            <div className="text-white font-semibold">{m.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function MetricChip({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="bg-card/80 rounded-lg px-3 py-2 flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold ${positive === undefined ? "text-white" : positive ? "text-green-400" : "text-red-400"}`}>
        {value}
      </span>
    </div>
  );
}

function SectionBadge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
      style={{ background: color + "22", color }}
    >
      {children}
    </span>
  );
}

// ── Tab: Factor Models ─────────────────────────────────────────────────────────

function FactorModelsTab() {
  const [selected, setSelected] = useState<FactorModel>(FACTOR_MODELS[1]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {FACTOR_MODELS.map((model) => (
          <button
            key={model.shortName}
            onClick={() => setSelected(model)}
            className={`text-left rounded-xl border p-3 transition-all ${
              selected.shortName === model.shortName
                ? "border-opacity-100 bg-card/80"
                : "border-border bg-card hover:border-border/60"
            }`}
            style={{ borderColor: selected.shortName === model.shortName ? model.color : undefined }}
          >
            <div className="font-semibold text-sm text-white">{model.shortName}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{model.factors.length} factor{model.factors.length > 1 ? "s" : ""}</div>
            <div className="text-xs font-medium mt-1" style={{ color: model.color }}>
              Sharpe {model.sharpe.toFixed(2)}
            </div>
          </button>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-white">{selected.name}</CardTitle>
            <SectionBadge color={selected.color}>R² = {(selected.rSquared * 100).toFixed(0)}%</SectionBadge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{selected.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <MetricChip label="Alpha (ann.)" value={`+${selected.alpha.toFixed(2)}%`} positive={true} />
            <MetricChip label="Market Beta" value={selected.beta.toFixed(2)} />
            <MetricChip label="R-Squared" value={(selected.rSquared * 100).toFixed(0) + "%"} />
            <MetricChip label="Sharpe Ratio" value={selected.sharpe.toFixed(2)} positive={selected.sharpe > 0.6} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-2">Factor Loadings</div>
            <FactorBarChart model={selected} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selected.factors.map((f) => (
              <Badge key={f} variant="outline" className="border-border/60 text-muted-foreground text-xs">
                {f}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Alpha / Beta Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {["Model", "Factors", "Alpha", "Beta", "R²", "Sharpe"].map((h) => (
                    <th key={h} className="text-left text-muted-foreground pb-2 pr-4 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FACTOR_MODELS.map((m) => (
                  <tr
                    key={m.shortName}
                    className={`border-b border-border/40 cursor-pointer hover:bg-card/80/50 transition-colors ${
                      selected.shortName === m.shortName ? "bg-card/80/30" : ""
                    }`}
                    onClick={() => setSelected(m)}
                  >
                    <td className="py-2 pr-4">
                      <span className="font-semibold" style={{ color: m.color }}>
                        {m.shortName}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground">{m.factors.length}</td>
                    <td className="py-2 pr-4 text-green-400">+{m.alpha.toFixed(2)}%</td>
                    <td className="py-2 pr-4 text-muted-foreground">{m.beta.toFixed(2)}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{(m.rSquared * 100).toFixed(0)}%</td>
                    <td className="py-2 pr-4 text-muted-foreground">{m.sharpe.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Tab: Momentum ──────────────────────────────────────────────────────────────

function MomentumTab() {
  const [selected, setSelected] = useState(0);

  const curves = useMemo(() => {
    return MOMENTUM_STRATEGIES.map((strat, i) =>
      generateCumulativeReturns(252, strat.annualReturn, strat.sharpe, 622002 + i * 1000)
    );
  }, []);

  const strat = MOMENTUM_STRATEGIES[selected];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-4"
    >
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Momentum Concepts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {[
              {
                title: "Cross-Sectional",
                color: "#6366f1",
                desc: "Rank stocks by past return. Long top decile, short bottom decile. Captures relative performance differences.",
              },
              {
                title: "Time-Series (TSMOM)",
                color: "#22c55e",
                desc: "Each asset goes long/short based on its own past return sign. Scales with signal strength. Better in volatile regimes.",
              },
              {
                title: "12-1 Formation",
                color: "#f59e0b",
                desc: "Use 12-month lookback, skip most recent month to avoid microstructure reversal. Standard academic definition.",
              },
            ].map((c) => (
              <div key={c.title} className="bg-card/80 rounded-lg p-3 space-y-1">
                <div className="font-semibold" style={{ color: c.color }}>
                  {c.title}
                </div>
                <p className="text-muted-foreground leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {MOMENTUM_STRATEGIES.map((s, i) => (
          <button
            key={s.name}
            onClick={() => setSelected(i)}
            className={`text-left rounded-xl border p-3 transition-all ${
              selected === i ? "bg-card/80" : "border-border bg-card hover:border-border/60"
            }`}
            style={{ borderColor: selected === i ? s.color : undefined }}
          >
            <div className="text-xs text-muted-foreground">{s.formation}m / {s.holding}m</div>
            <div className="font-medium text-sm text-white mt-0.5 truncate">{s.name}</div>
            <div className="text-xs mt-1" style={{ color: s.color }}>
              {s.annualReturn.toFixed(1)}% ann.
            </div>
          </button>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-white">{strat.name}</CardTitle>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span>Formation: <strong className="text-foreground">{strat.formation}m</strong></span>
              <span>Holding: <strong className="text-foreground">{strat.holding}m</strong></span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <MetricChip label="Annual Return" value={`+${strat.annualReturn.toFixed(1)}%`} positive={true} />
            <MetricChip label="Sharpe Ratio" value={strat.sharpe.toFixed(2)} positive={strat.sharpe > 0.65} />
            <MetricChip label="Max Drawdown" value={`${strat.maxDrawdown.toFixed(1)}%`} positive={false} />
            <MetricChip label="Win Rate" value={`${strat.winRate.toFixed(1)}%`} positive={strat.winRate > 55} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-2">Cumulative Return (1-year simulation)</div>
            <LineChart
              series={[curves[selected]]}
              colors={[strat.color]}
              labels={[strat.name]}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">All Strategies Compared</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart
            series={curves}
            colors={MOMENTUM_STRATEGIES.map((s) => s.color)}
            labels={MOMENTUM_STRATEGIES.map((s) => s.name)}
            height={240}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Tab: Mean Reversion ────────────────────────────────────────────────────────

function MeanReversionTab() {
  const [selectedPair, setSelectedPair] = useState(0);

  const pair = PAIRS[selectedPair];

  const spread = useMemo(
    () => generateSpreadSeries(200, pair.halfLife, 622002 + selectedPair * 7777),
    [selectedPair, pair.halfLife]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Cointegration Concepts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed">
            <p>
              Two assets are <strong className="text-foreground">cointegrated</strong> when their price spread is stationary (mean-reverting) even
              though each individually follows a random walk.
            </p>
            <p>
              The <strong className="text-foreground">Engle-Granger test</strong> fits a linear regression of asset A on B, then tests residuals
              for a unit root via ADF. A p-value &lt; 0.05 suggests cointegration.
            </p>
            <p>
              <strong className="text-foreground">Half-life</strong> measures mean-reversion speed: the expected time for the spread to revert
              halfway to its mean. Shorter = faster trades.
            </p>
            <div className="bg-card/80 rounded-lg p-3">
              <div className="text-muted-foreground font-medium mb-1">Z-Score Entry Rules</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">Enter Long</span>
                  <span>when z-score &lt; -2σ</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-400">Enter Short</span>
                  <span>when z-score &gt; +2σ</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Exit</span>
                  <span>when z-score crosses 0</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Pairs Universe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {PAIRS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedPair(i)}
                  className={`w-full text-left rounded-lg p-2.5 transition-colors ${
                    selectedPair === i ? "bg-primary/15 border border-primary/40" : "bg-card/80 hover:bg-card/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-white">
                      {p.ticker1} / {p.ticker2}
                    </span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">corr:</span>
                      <span className="text-green-400">{p.correlation.toFixed(2)}</span>
                      <span className="text-muted-foreground">p:</span>
                      <span className="text-primary">{p.cointegrationP.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                    <span>Half-life: {p.halfLife}d</span>
                    <span>Return: {p.annualReturn.toFixed(1)}%</span>
                    <span>Sharpe: {p.sharpe.toFixed(2)}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-white">
              {pair.ticker1}/{pair.ticker2} Spread Z-Score
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="border-border/60 text-muted-foreground text-xs">
                Half-life: {pair.halfLife}d
              </Badge>
              <Badge variant="outline" className="border-green-700 text-green-300 text-xs">
                Sharpe {pair.sharpe.toFixed(2)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <SpreadChart spread={spread} height={200} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricChip label="Correlation" value={pair.correlation.toFixed(2)} positive={true} />
        <MetricChip label="Cointegration p" value={pair.cointegrationP.toFixed(2)} positive={pair.cointegrationP < 0.05} />
        <MetricChip label="Annual Return" value={`+${pair.annualReturn.toFixed(1)}%`} positive={true} />
        <MetricChip label="Sharpe Ratio" value={pair.sharpe.toFixed(2)} positive={pair.sharpe > 1} />
      </div>
    </motion.div>
  );
}

// ── Tab: Stat Arb ──────────────────────────────────────────────────────────────

function StatArbTab() {
  const curves = useMemo(
    () =>
      STAT_ARB_RESULTS.map((r, i) =>
        generateCumulativeReturns(252, r.annualReturn, r.sharpe, 622002 + i * 3333)
      ),
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {STAT_ARB_RESULTS.map((r, i) => (
          <Card key={r.name} className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold" style={{ color: r.color }}>
                {r.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <MetricChip label="Annual Return" value={`+${r.annualReturn.toFixed(1)}%`} positive={true} />
                <MetricChip label="Sharpe" value={r.sharpe.toFixed(2)} positive={true} />
                <MetricChip label="Max DD" value={`${r.maxDrawdown.toFixed(1)}%`} positive={false} />
                <MetricChip label="Net Beta" value={r.beta.toFixed(2)} />
              </div>
              <div className="text-xs text-muted-foreground">{r.pairs} active pairs</div>
              <Progress value={(r.sharpe / 1.5) * 100} className="h-1.5" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Equity Curves (Market-Neutral)</CardTitle>
        </CardHeader>
        <CardContent>
          <EquityCurveChart
            curves={curves}
            colors={STAT_ARB_RESULTS.map((r) => r.color)}
            names={STAT_ARB_RESULTS.map((r) => r.name)}
            height={240}
          />
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Market Neutrality & Risk Factors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3">
              <div className="text-muted-foreground font-medium">Risk Controls</div>
              {[
                { label: "Net market exposure", val: "< 5% notional", ok: true },
                { label: "Sector concentration", val: "< 20% per sector", ok: true },
                { label: "Factor loading (Mkt-RF)", val: "β < 0.05", ok: true },
                { label: "Single pair weight", val: "< 3% NAV", ok: true },
                { label: "Max position size", val: "2% per leg", ok: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between bg-card/80 rounded p-2">
                  <div className="flex items-center gap-2">
                    {item.ok ? (
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-red-400" />
                    )}
                    <span className="text-muted-foreground">{item.label}</span>
                  </div>
                  <span className="text-muted-foreground">{item.val}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="text-muted-foreground font-medium">Correlation-Based Pair Selection</div>
              <p className="text-muted-foreground leading-relaxed">
                Pairs are screened for rolling 6-month correlation &gt; 0.8, cointegration p &lt; 0.05, and minimum
                trading history of 252 days. Pairs are re-tested monthly and rotated if conditions break.
              </p>
              <div className="bg-card/80 rounded-lg p-3 space-y-2">
                {[
                  { label: "Correlation screen", pct: 85 },
                  { label: "Cointegration pass", pct: 62 },
                  { label: "Liquidity filter", pct: 91 },
                  { label: "Final selection", pct: 48 },
                ].map((f) => (
                  <div key={f.label}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-muted-foreground">{f.label}</span>
                      <span className="text-muted-foreground">{f.pct}%</span>
                    </div>
                    <Progress value={f.pct} className="h-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Tab: ML Signals ────────────────────────────────────────────────────────────

function MLSignalsTab() {
  const maxImportance = Math.max(...ML_FEATURES.map((f) => f.importance));

  const categoryColors: Record<string, string> = {
    Momentum: "#6366f1",
    Technical: "#22c55e",
    Fundamental: "#f59e0b",
    Sentiment: "#ec4899",
    Risk: "#64748b",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Feature Importance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ML_FEATURES.map((f) => (
              <div key={f.name} className="space-y-0.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{ background: categoryColors[f.category] }}
                    />
                    <span className="text-muted-foreground truncate max-w-[160px]">{f.name}</span>
                  </div>
                  <span className="text-muted-foreground">{(f.importance * 100).toFixed(0)}%</span>
                </div>
                <div className="relative h-1.5 bg-card/80 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(f.importance / maxImportance) * 100}%`,
                      background: categoryColors[f.category],
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">IC Metrics Table</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    {["Feature", "IC", "ICIR", "Cat."].map((h) => (
                      <th key={h} className="text-left text-muted-foreground pb-2 pr-3 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ML_FEATURES.map((f) => (
                    <tr key={f.name} className="border-b border-border/40 hover:bg-card/80/40 transition-colors">
                      <td className="py-1.5 pr-3 text-muted-foreground truncate max-w-[120px]">{f.name}</td>
                      <td className={`py-1.5 pr-3 font-medium ${f.ic > 0 ? "text-green-400" : "text-red-400"}`}>
                        {f.ic > 0 ? "+" : ""}{f.ic.toFixed(3)}
                      </td>
                      <td className={`py-1.5 pr-3 font-medium ${f.icir > 0 ? "text-green-400" : "text-red-400"}`}>
                        {f.icir > 0 ? "+" : ""}{f.icir.toFixed(2)}
                      </td>
                      <td className="py-1.5">
                        <span
                          className="px-1.5 py-0.5 rounded text-xs"
                          style={{ background: categoryColors[f.category] + "22", color: categoryColors[f.category] }}
                        >
                          {f.category}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Signal Combination (Ensemble)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Features Used", val: "10", color: "#6366f1" },
                { label: "Model Type", val: "XGBoost", color: "#22c55e" },
                { label: "Train Period", val: "2010-2020", color: "#f59e0b" },
                { label: "Test Period", val: "2021-2024", color: "#ec4899" },
              ].map((m) => (
                <div key={m.label} className="bg-card/80 rounded p-2">
                  <div className="text-muted-foreground">{m.label}</div>
                  <div className="font-semibold mt-0.5" style={{ color: m.color }}>
                    {m.val}
                  </div>
                </div>
              ))}
            </div>
            <p className="leading-relaxed">
              Signals are combined using gradient-boosted trees, trained to predict next-month excess return.
              Features are ranked by IC and only those with ICIR &gt; 0.5 pass. Final score is the model output
              mapped to a percentile rank across the universe.
            </p>
            <div className="bg-card/80 rounded-lg p-3 space-y-1">
              {[
                { label: "Out-of-sample Sharpe", val: "1.18" },
                { label: "Out-of-sample IC", val: "0.058" },
                { label: "Hit Rate (top decile)", val: "63.4%" },
                { label: "Turnover (monthly)", val: "22%" },
              ].map((m) => (
                <div key={m.label} className="flex justify-between">
                  <span className="text-muted-foreground">{m.label}</span>
                  <span className="text-white font-medium">{m.val}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Confusion Matrix (Directional)</CardTitle>
          </CardHeader>
          <CardContent>
            <ConfusionMatrix seed={622002} />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Category Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryColors).map(([cat, color]) => (
              <div
                key={cat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: color + "22", color }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                {cat}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

const TAB_ICONS: Record<string, React.ReactNode> = {
  factors: <Layers className="w-3.5 h-3.5" />,
  momentum: <TrendingUp className="w-3.5 h-3.5" />,
  meanrev: <Activity className="w-3.5 h-3.5" />,
  statarb: <GitBranch className="w-3.5 h-3.5" />,
  mlsignals: <Brain className="w-3.5 h-3.5" />,
};

export default function QuantStrategiesPage() {
  resetSeed();
  rand(); // consume one to warm up

  return (
    <div className="min-h-screen bg-background text-white p-4 md:p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/15 rounded-lg">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Quantitative Strategies</h1>
            <p className="text-sm text-muted-foreground">Factor models, momentum, mean reversion, stat arb & ML signals</p>
          </div>
          <span className="ml-4 rounded bg-muted/40 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            Educational simulation
          </span>
        </div>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-2 pt-2">
          {[
            { icon: <Layers className="w-3 h-3" />, label: "4 Factor Models", color: "#6366f1" },
            { icon: <TrendingUp className="w-3 h-3" />, label: "4 Momentum Strategies", color: "#22c55e" },
            { icon: <Shuffle className="w-3 h-3" />, label: "5 Cointegrated Pairs", color: "#f59e0b" },
            { icon: <Target className="w-3 h-3" />, label: "Market-Neutral Arb", color: "#ec4899" },
            { icon: <Brain className="w-3 h-3" />, label: "10 ML Features", color: "#64748b" },
          ].map((chip) => (
            <span
              key={chip.label}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: chip.color + "22", color: chip.color }}
            >
              {chip.icon}
              {chip.label}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="factors">
        <TabsList className="bg-card border border-border h-auto p-1 flex flex-wrap gap-1">
          {[
            { value: "factors", label: "Factor Models" },
            { value: "momentum", label: "Momentum" },
            { value: "meanrev", label: "Mean Reversion" },
            { value: "statarb", label: "Stat Arb" },
            { value: "mlsignals", label: "ML Signals" },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary/15 data-[state=active]:text-primary text-muted-foreground"
            >
              {TAB_ICONS[tab.value]}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="factors" className="mt-4 data-[state=inactive]:hidden">
          <FactorModelsTab />
        </TabsContent>
        <TabsContent value="momentum" className="mt-4 data-[state=inactive]:hidden">
          <MomentumTab />
        </TabsContent>
        <TabsContent value="meanrev" className="mt-4 data-[state=inactive]:hidden">
          <MeanReversionTab />
        </TabsContent>
        <TabsContent value="statarb" className="mt-4 data-[state=inactive]:hidden">
          <StatArbTab />
        </TabsContent>
        <TabsContent value="mlsignals" className="mt-4 data-[state=inactive]:hidden">
          <MLSignalsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
