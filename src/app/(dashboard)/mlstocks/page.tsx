"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  BarChart3,
  GitBranch,
  Activity,
  Layers,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Target,
  SlidersHorizontal,
  Database,
  Cpu,
  FlaskConical,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 884;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
function resetSeed() { s = 884; }

// ── Types ──────────────────────────────────────────────────────────────────────
interface FeatureCategory {
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  features: string[];
  importance: number;
  count: number;
}

interface ModelSpec {
  name: string;
  shortName: string;
  sharpe: number;
  ic: number;
  trainTime: string;
  interpretability: number;
  dataNeed: string;
  type: string;
  color: string;
}

interface Pitfall {
  name: string;
  severity: "high" | "medium" | "low";
  description: string;
  solution: string;
  icon: React.ReactNode;
}

interface StockSignal {
  ticker: string;
  sector: string;
  score: number;
  momentum: number;
  value: number;
  quality: number;
  sentiment: number;
  signal: "Strong Buy" | "Buy" | "Neutral" | "Sell" | "Strong Sell";
}

// ── Static data (deterministic from PRNG) ─────────────────────────────────────
resetSeed();

const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    name: "Price & Returns",
    icon: <TrendingUp className="w-4 h-4" />,
    color: "text-primary",
    bgColor: "bg-primary/10",
    importance: 0.28,
    count: 24,
    features: [
      "1/5/20/60-day momentum",
      "52-week high/low ratio",
      "Price-to-moving-average ratios",
      "Return volatility (realized)",
      "Skewness & kurtosis of returns",
      "Max drawdown (rolling)",
    ],
  },
  {
    name: "Volume & Market Microstructure",
    icon: <BarChart3 className="w-4 h-4" />,
    color: "text-primary",
    bgColor: "bg-primary/10",
    importance: 0.19,
    count: 18,
    features: [
      "Volume-to-average ratio",
      "Amihud illiquidity measure",
      "Bid-ask spread proxy",
      "On-balance volume trend",
      "Volume-weighted momentum",
      "Short interest ratio",
    ],
  },
  {
    name: "Fundamental Factors",
    icon: <Database className="w-4 h-4" />,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    importance: 0.25,
    count: 32,
    features: [
      "P/E, P/B, EV/EBITDA ratios",
      "Revenue & earnings growth",
      "ROE, ROIC, gross margin",
      "Debt-to-equity, current ratio",
      "Earnings surprise (SUE)",
      "Free cash flow yield",
    ],
  },
  {
    name: "Sentiment & News",
    icon: <Activity className="w-4 h-4" />,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    importance: 0.15,
    count: 14,
    features: [
      "NLP news sentiment score",
      "Analyst revision momentum",
      "Social media mention velocity",
      "Put/call ratio",
      "Insider buying/selling",
      "ESG controversy score",
    ],
  },
  {
    name: "Alternative Data",
    icon: <Zap className="w-4 h-4" />,
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    importance: 0.13,
    count: 11,
    features: [
      "Satellite imagery (parking lots, ships)",
      "Credit card transaction trends",
      "Web traffic & app downloads",
      "Job posting velocity",
      "Patent filing activity",
      "Supply chain network signals",
    ],
  },
];

const MODELS: ModelSpec[] = [
  { name: "Linear Regression", shortName: "OLS", sharpe: 0.42, ic: 0.031, trainTime: "< 1s", interpretability: 95, dataNeed: "Low", type: "Linear", color: "#60a5fa" },
  { name: "Ridge Regression", shortName: "Ridge", sharpe: 0.51, ic: 0.038, trainTime: "< 1s", interpretability: 90, dataNeed: "Low", type: "Linear", color: "#818cf8" },
  { name: "Lasso Regression", shortName: "Lasso", sharpe: 0.55, ic: 0.042, trainTime: "< 1s", interpretability: 88, dataNeed: "Low", type: "Linear", color: "#a78bfa" },
  { name: "Random Forest", shortName: "RF", sharpe: 0.78, ic: 0.061, trainTime: "~30s", interpretability: 60, dataNeed: "Medium", type: "Tree", color: "#34d399" },
  { name: "XGBoost", shortName: "XGB", sharpe: 0.92, ic: 0.074, trainTime: "~2m", interpretability: 55, dataNeed: "Medium", type: "Tree", color: "#86efac" },
  { name: "LSTM", shortName: "LSTM", sharpe: 0.85, ic: 0.068, trainTime: "~15m", interpretability: 20, dataNeed: "High", type: "Neural", color: "#fb923c" },
  { name: "Transformer", shortName: "TXF", sharpe: 0.97, ic: 0.081, trainTime: "~1h", interpretability: 15, dataNeed: "Very High", type: "Neural", color: "#f472b6" },
  { name: "Ensemble Stack", shortName: "ENS", sharpe: 1.08, ic: 0.089, trainTime: "~2h", interpretability: 30, dataNeed: "High", type: "Ensemble", color: "#facc15" },
];

const PITFALLS: Pitfall[] = [
  {
    name: "Look-Ahead Bias",
    severity: "high",
    description: "Using future data to predict past returns. Even millisecond leakage destroys live performance.",
    solution: "Point-in-time data snapshots, strict temporal train/test splits, event study alignment.",
    icon: <Eye className="w-4 h-4" />,
  },
  {
    name: "Survivorship Bias",
    severity: "high",
    description: "Training only on stocks that survived causes massive optimistic overfit — delisted stocks disappear.",
    solution: "Use survivorship-bias-free databases (CRSP, Compustat with delisting returns).",
    icon: <AlertTriangle className="w-4 h-4" />,
  },
  {
    name: "Transaction Cost Neglect",
    severity: "medium",
    description: "Models generating high turnover appear profitable but fail after bid-ask spreads and market impact.",
    solution: "Apply realistic cost models: half-spread + 5–15 bps impact for large orders.",
    icon: <Target className="w-4 h-4" />,
  },
  {
    name: "Regime Change",
    severity: "medium",
    description: "Factors that worked in low-rate environments collapse in inflation regimes (2022 growth-factor crash).",
    solution: "Regime-conditional models, HMM regime detection, stress-testing on historical breaks.",
    icon: <GitBranch className="w-4 h-4" />,
  },
  {
    name: "Multiple Testing Problem",
    severity: "medium",
    description: "Backtesting 1000 feature combinations guarantees finding spurious alphas with p-value < 0.05.",
    solution: "Bonferroni/BH corrections, out-of-sample holdout, deflated Sharpe ratio (Harvey & Liu).",
    icon: <FlaskConical className="w-4 h-4" />,
  },
];

const TICKERS_DATA: StockSignal[] = (() => {
  resetSeed();
  const tickers = ["AAPL","MSFT","NVDA","GOOGL","AMZN","META","TSLA","JPM","JNJ","XOM"];
  const sectors = ["Tech","Tech","Tech","Tech","Tech","Tech","Auto","Finance","Healthcare","Energy"];
  return tickers.map((ticker, i) => {
    const momentum = Math.round((rand() * 200 - 100) * 10) / 10;
    const value = Math.round((rand() * 200 - 100) * 10) / 10;
    const quality = Math.round((rand() * 200 - 100) * 10) / 10;
    const sentiment = Math.round((rand() * 200 - 100) * 10) / 10;
    const score = Math.round((momentum * 0.3 + value * 0.25 + quality * 0.25 + sentiment * 0.2) * 10) / 10;
    let signal: StockSignal["signal"] = "Neutral";
    if (score > 40) signal = "Strong Buy";
    else if (score > 10) signal = "Buy";
    else if (score < -40) signal = "Strong Sell";
    else if (score < -10) signal = "Sell";
    return { ticker, sector: sectors[i], score, momentum, value, quality, sentiment, signal };
  });
})();

const SORTED_SIGNALS = [...TICKERS_DATA].sort((a, b) => b.score - a.score);

// ── Correlation heatmap data (8x8) ─────────────────────────────────────────────
const FEATURE_LABELS_8 = ["Mom1M","Mom12M","Vol20D","PE","ROE","Sent","AltD","OBV"];
const CORR_MATRIX: number[][] = (() => {
  resetSeed();
  return Array.from({ length: 8 }, (_, i) =>
    Array.from({ length: 8 }, (_, j) => {
      if (i === j) return 1.0;
      const v = (rand() * 2 - 1) * 0.65;
      return Math.round(v * 100) / 100;
    })
  );
})();

// ── Bias-variance curve data ───────────────────────────────────────────────────
const COMPLEXITY_POINTS = (() => {
  resetSeed();
  return Array.from({ length: 10 }, (_, i) => {
    const x = i / 9;
    const trainErr = Math.max(0.02, 0.35 * Math.exp(-x * 3.5) + 0.01 + rand() * 0.01);
    const testErr = 0.30 * Math.exp(-x * 2) + 0.08 * Math.exp(x * 1.5) + 0.05 + rand() * 0.015;
    return { x, trainErr, testErr };
  });
})();

// ── Signal decay data ──────────────────────────────────────────────────────────
const DECAY_SERIES = (() => {
  resetSeed();
  return Array.from({ length: 20 }, (_, i) => {
    const days = i * 5;
    return {
      days,
      momentum: Math.max(0, 0.074 * Math.exp(-days / 60) + rand() * 0.004),
      value: Math.max(0, 0.072 * Math.exp(-days / 180) + rand() * 0.004),
      alt: Math.max(0, 0.068 * Math.exp(-days / 30) + rand() * 0.004),
    };
  });
})();

// ── Helpers ────────────────────────────────────────────────────────────────────
function corrColor(v: number): string {
  if (v > 0.6) return "#ef4444";
  if (v > 0.3) return "#f97316";
  if (v > 0.0) return "#fbbf24";
  if (v > -0.3) return "#34d399";
  if (v > -0.6) return "#22d3ee";
  return "#3b82f6";
}

function signalColor(sig: StockSignal["signal"]): string {
  if (sig === "Strong Buy") return "text-green-400";
  if (sig === "Buy") return "text-emerald-400";
  if (sig === "Neutral") return "text-muted-foreground";
  if (sig === "Sell") return "text-orange-400";
  return "text-red-400";
}

function signalBadgeVariant(sig: StockSignal["signal"]): "default" | "secondary" | "destructive" | "outline" {
  if (sig === "Strong Buy" || sig === "Buy") return "default";
  if (sig === "Strong Sell" || sig === "Sell") return "destructive";
  return "secondary";
}

function severityColor(s: Pitfall["severity"]): string {
  if (s === "high") return "text-red-400 bg-red-500/10 border-red-500/30";
  if (s === "medium") return "text-amber-400 bg-amber-500/10 border-amber-500/30";
  return "text-green-400 bg-green-500/10 border-green-500/30";
}

// ── FeatureImportanceChart ─────────────────────────────────────────────────────
function FeatureImportanceChart() {
  const W = 420, H = 200, pad = { l: 140, r: 20, t: 16, b: 32 };
  const chartW = W - pad.l - pad.r;
  const chartH = H - pad.t - pad.b;
  const cats = FEATURE_CATEGORIES;
  const barH = Math.floor(chartH / cats.length) - 6;
  const maxImp = Math.max(...cats.map(c => c.importance));
  const colors = ["#60a5fa","#a78bfa","#34d399","#fbbf24","#f472b6"];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 210 }}>
      <text x={W / 2} y={12} textAnchor="middle" fill="#9ca3af" fontSize={10}>Feature Category Importance (%)</text>
      {cats.map((cat, i) => {
        const y = pad.t + i * (chartH / cats.length);
        const bw = (cat.importance / maxImp) * chartW;
        return (
          <g key={cat.name}>
            <text x={pad.l - 6} y={y + barH / 2 + 4} textAnchor="end" fill="#d1d5db" fontSize={9}>{cat.name}</text>
            <rect x={pad.l} y={y} width={bw} height={barH} rx={3} fill={colors[i]} fillOpacity={0.85} />
            <text x={pad.l + bw + 4} y={y + barH / 2 + 4} fill={colors[i]} fontSize={9}>{(cat.importance * 100).toFixed(0)}%</text>
          </g>
        );
      })}
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={H - pad.b} stroke="#374151" strokeWidth={1} />
    </svg>
  );
}

// ── CorrelationHeatmap ─────────────────────────────────────────────────────────
function CorrelationHeatmap() {
  const N = 8;
  const cell = 38;
  const labelW = 50;
  const labelH = 50;
  const W = labelW + N * cell + 10;
  const H = labelH + N * cell + 10;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 360 }}>
      <text x={W / 2} y={12} textAnchor="middle" fill="#9ca3af" fontSize={10}>Feature Correlation Matrix</text>
      {FEATURE_LABELS_8.map((lbl, i) => (
        <g key={`col-${i}`}>
          <text
            x={labelW + i * cell + cell / 2}
            y={labelH - 4}
            textAnchor="middle"
            fill="#9ca3af"
            fontSize={8}
            transform={`rotate(-30, ${labelW + i * cell + cell / 2}, ${labelH - 4})`}
          >{lbl}</text>
          <text x={labelW - 4} y={labelH + i * cell + cell / 2 + 4} textAnchor="end" fill="#9ca3af" fontSize={8}>{lbl}</text>
        </g>
      ))}
      {CORR_MATRIX.map((row, i) =>
        row.map((v, j) => (
          <g key={`${i}-${j}`}>
            <rect
              x={labelW + j * cell}
              y={labelH + i * cell}
              width={cell - 1}
              height={cell - 1}
              fill={corrColor(v)}
              fillOpacity={Math.abs(v) * 0.8 + 0.15}
              rx={2}
            />
            <text
              x={labelW + j * cell + cell / 2}
              y={labelH + i * cell + cell / 2 + 4}
              textAnchor="middle"
              fill={Math.abs(v) > 0.5 ? "#fff" : "#d1d5db"}
              fontSize={8}
            >{v.toFixed(2)}</text>
          </g>
        ))
      )}
    </svg>
  );
}

// ── BiasVarianceCurve ──────────────────────────────────────────────────────────
function BiasVarianceCurve() {
  const W = 400, H = 200;
  const pad = { l: 40, r: 20, t: 24, b: 36 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;
  const maxErr = 0.40;

  const toX = (x: number) => pad.l + x * cW;
  const toY = (e: number) => pad.t + cH - (e / maxErr) * cH;

  const trainPath = COMPLEXITY_POINTS.map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.x).toFixed(1)},${toY(p.trainErr).toFixed(1)}`).join(" ");
  const testPath = COMPLEXITY_POINTS.map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.x).toFixed(1)},${toY(p.testErr).toFixed(1)}`).join(" ");

  // sweet spot: min test error
  const minIdx = COMPLEXITY_POINTS.reduce((best, p, i) => p.testErr < COMPLEXITY_POINTS[best].testErr ? i : best, 0);
  const sweetX = toX(COMPLEXITY_POINTS[minIdx].x);
  const sweetY = toY(COMPLEXITY_POINTS[minIdx].testErr);

  const yTicks = [0, 0.1, 0.2, 0.3, 0.4];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }}>
      <text x={W / 2} y={14} textAnchor="middle" fill="#9ca3af" fontSize={10}>Bias-Variance Tradeoff (Model Complexity)</text>
      {yTicks.map(t => (
        <g key={t}>
          <line x1={pad.l} y1={toY(t)} x2={W - pad.r} y2={toY(t)} stroke="#1f2937" strokeWidth={1} />
          <text x={pad.l - 4} y={toY(t) + 4} textAnchor="end" fill="#6b7280" fontSize={8}>{t.toFixed(1)}</text>
        </g>
      ))}
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={H - pad.b} stroke="#374151" strokeWidth={1} />
      <line x1={pad.l} y1={H - pad.b} x2={W - pad.r} y2={H - pad.b} stroke="#374151" strokeWidth={1} />
      <text x={pad.l + cW / 2} y={H - 4} textAnchor="middle" fill="#6b7280" fontSize={9}>Model Complexity →</text>
      <text x={14} y={pad.t + cH / 2} textAnchor="middle" fill="#6b7280" fontSize={9} transform={`rotate(-90,14,${pad.t + cH / 2})`}>Error</text>

      {/* Underfitting / Overfitting labels */}
      <text x={pad.l + 12} y={pad.t + 16} fill="#6b7280" fontSize={8}>High Bias</text>
      <text x={W - pad.r - 50} y={pad.t + 16} fill="#6b7280" fontSize={8}>High Variance</text>

      <path d={trainPath} fill="none" stroke="#60a5fa" strokeWidth={2} />
      <path d={testPath} fill="none" stroke="#f472b6" strokeWidth={2} />

      {/* Sweet spot marker */}
      <line x1={sweetX} y1={pad.t} x2={sweetX} y2={H - pad.b} stroke="#34d399" strokeWidth={1} strokeDasharray="3,2" />
      <circle cx={sweetX} cy={sweetY} r={5} fill="#34d399" />
      <text x={sweetX + 6} y={sweetY - 6} fill="#34d399" fontSize={8}>Sweet Spot</text>

      {/* Legend */}
      <line x1={W - 120} y1={H - 18} x2={W - 106} y2={H - 18} stroke="#60a5fa" strokeWidth={2} />
      <text x={W - 103} y={H - 14} fill="#60a5fa" fontSize={8}>Train error</text>
      <line x1={W - 55} y1={H - 18} x2={W - 41} y2={H - 18} stroke="#f472b6" strokeWidth={2} />
      <text x={W - 38} y={H - 14} fill="#f472b6" fontSize={8}>Test error</text>
    </svg>
  );
}

// ── WalkForwardDiagram ─────────────────────────────────────────────────────────
function WalkForwardDiagram() {
  const W = 420, H = 140;
  const pad = { l: 16, r: 16, t: 28, b: 24 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;
  const folds = 5;
  const rowH = cH / folds;
  const totalSegments = folds + 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 155 }}>
      <text x={W / 2} y={14} textAnchor="middle" fill="#9ca3af" fontSize={10}>Walk-Forward Cross-Validation</text>
      {Array.from({ length: folds }, (_, fold) => {
        const trainEnd = fold + 2;
        const testStart = fold + 2;
        const testEnd = fold + 3;
        const segW = cW / totalSegments;
        const y = pad.t + fold * rowH;
        return (
          <g key={fold}>
            <text x={pad.l - 2} y={y + rowH / 2 + 4} textAnchor="start" fill="#6b7280" fontSize={8}>Fold {fold + 1}</text>
            {Array.from({ length: totalSegments }, (_, seg) => {
              let fill = "#1f2937";
              let label = "";
              if (seg < trainEnd) { fill = "#3b82f6"; label = seg === 0 ? "Train" : ""; }
              else if (seg >= testStart && seg < testEnd) { fill = "#f472b6"; label = "Test"; }
              return (
                <g key={seg}>
                  <rect x={pad.l + 28 + seg * segW} y={y + 3} width={segW - 2} height={rowH - 8} rx={2} fill={fill} fillOpacity={0.8} />
                  {label && (
                    <text x={pad.l + 28 + seg * segW + segW / 2} y={y + rowH / 2 + 4} textAnchor="middle" fill="#fff" fontSize={7}>{label}</text>
                  )}
                </g>
              );
            })}
          </g>
        );
      })}
      {/* Legend */}
      <rect x={pad.l} y={H - pad.b + 6} width={10} height={8} rx={1} fill="#3b82f6" fillOpacity={0.8} />
      <text x={pad.l + 13} y={H - pad.b + 13} fill="#9ca3af" fontSize={8}>Training window</text>
      <rect x={120} y={H - pad.b + 6} width={10} height={8} rx={1} fill="#f472b6" fillOpacity={0.8} />
      <text x={133} y={H - pad.b + 13} fill="#9ca3af" fontSize={8}>Out-of-sample test</text>
    </svg>
  );
}

// ── OvefittingChart ────────────────────────────────────────────────────────────
function OverfittingChart() {
  const W = 400, H = 180;
  const pad = { l: 44, r: 16, t: 24, b: 36 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;

  const inSample = [0.62, 0.75, 0.84, 0.91, 0.95, 0.97, 0.98, 0.99];
  const outSample = [0.55, 0.63, 0.68, 0.70, 0.63, 0.52, 0.38, 0.22];
  const n = inSample.length;
  const minV = 0, maxV = 1.0;

  const toX = (i: number) => pad.l + (i / (n - 1)) * cW;
  const toY = (v: number) => pad.t + cH - ((v - minV) / (maxV - minV)) * cH;

  const inPath = inSample.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");
  const outPath = outSample.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");

  const yTicks = [0.2, 0.4, 0.6, 0.8, 1.0];
  const complexityLabels = ["Simple", "", "", "", "Medium", "", "", "Complex"];

  // Cliff annotation
  const cliffX = toX(4);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 200 }}>
      <text x={W / 2} y={14} textAnchor="middle" fill="#9ca3af" fontSize={10}>In-Sample vs Out-of-Sample Sharpe (Overfitting Cliff)</text>
      {yTicks.map(t => (
        <g key={t}>
          <line x1={pad.l} y1={toY(t)} x2={W - pad.r} y2={toY(t)} stroke="#1f2937" strokeWidth={1} />
          <text x={pad.l - 4} y={toY(t) + 4} textAnchor="end" fill="#6b7280" fontSize={8}>{t.toFixed(1)}</text>
        </g>
      ))}
      {complexityLabels.map((lbl, i) => lbl && (
        <text key={i} x={toX(i)} y={H - pad.b + 14} textAnchor="middle" fill="#6b7280" fontSize={8}>{lbl}</text>
      ))}
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={H - pad.b} stroke="#374151" strokeWidth={1} />
      <line x1={pad.l} y1={H - pad.b} x2={W - pad.r} y2={H - pad.b} stroke="#374151" strokeWidth={1} />
      <text x={14} y={pad.t + cH / 2} textAnchor="middle" fill="#6b7280" fontSize={9} transform={`rotate(-90,14,${pad.t + cH / 2})`}>Sharpe Ratio</text>

      <path d={inPath} fill="none" stroke="#60a5fa" strokeWidth={2.5} />
      <path d={outPath} fill="none" stroke="#f87171" strokeWidth={2.5} />

      {/* Cliff marker */}
      <line x1={cliffX} y1={pad.t} x2={cliffX} y2={H - pad.b} stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="4,3" />
      <text x={cliffX + 4} y={pad.t + 12} fill="#fbbf24" fontSize={8}>Overfit begins</text>

      {/* Divergence arrow */}
      <path d={`M${cliffX + 10},${toY(0.63)} L${cliffX + 30},${toY(0.38)}`} stroke="#f87171" strokeWidth={1} markerEnd="url(#arr)" />

      <defs>
        <marker id="arr" markerWidth="5" markerHeight="5" refX="3" refY="2.5" orient="auto">
          <polygon points="0,0 5,2.5 0,5" fill="#f87171" />
        </marker>
      </defs>

      {/* Legend */}
      <line x1={pad.l + 4} y1={H - 10} x2={pad.l + 18} y2={H - 10} stroke="#60a5fa" strokeWidth={2} />
      <text x={pad.l + 21} y={H - 6} fill="#60a5fa" fontSize={8}>In-sample</text>
      <line x1={pad.l + 85} y1={H - 10} x2={pad.l + 99} y2={H - 10} stroke="#f87171" strokeWidth={2} />
      <text x={pad.l + 102} y={H - 6} fill="#f87171" fontSize={8}>Out-of-sample</text>
    </svg>
  );
}

// ── SignalPipelineSVG ──────────────────────────────────────────────────────────
function SignalPipelineSVG() {
  const W = 480, H = 100;
  const stages = [
    { label: "Raw Data", icon: "DB", color: "#60a5fa" },
    { label: "Feature Eng.", icon: "FE", color: "#a78bfa" },
    { label: "ML Model", icon: "ML", color: "#fb923c" },
    { label: "Signal", icon: "SG", color: "#34d399" },
    { label: "Portfolio", icon: "PF", color: "#fbbf24" },
    { label: "Execution", icon: "EX", color: "#f472b6" },
  ];
  const n = stages.length;
  const boxW = 58, boxH = 44;
  const gap = (W - n * boxW) / (n + 1);
  const cy = H / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 110 }}>
      {stages.map((st, i) => {
        const x = gap + i * (boxW + gap);
        return (
          <g key={st.label}>
            {i > 0 && (
              <line
                x1={x - gap + 2}
                y1={cy}
                x2={x - 2}
                y2={cy}
                stroke="#374151"
                strokeWidth={2}
                markerEnd="url(#parr)"
              />
            )}
            <rect x={x} y={cy - boxH / 2} width={boxW} height={boxH} rx={6} fill={st.color} fillOpacity={0.15} stroke={st.color} strokeWidth={1.5} />
            <text x={x + boxW / 2} y={cy - 5} textAnchor="middle" fill={st.color} fontSize={10} fontWeight="bold">{st.icon}</text>
            <text x={x + boxW / 2} y={cy + 10} textAnchor="middle" fill="#d1d5db" fontSize={7.5}>{st.label}</text>
          </g>
        );
      })}
      <defs>
        <marker id="parr" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
          <polygon points="0,0 6,3 0,6" fill="#374151" />
        </marker>
      </defs>
    </svg>
  );
}

// ── SignalDecayChart ───────────────────────────────────────────────────────────
function SignalDecayChart() {
  const W = 400, H = 180;
  const pad = { l: 40, r: 20, t: 24, b: 36 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;
  const maxV = 0.085;

  const toX = (i: number) => pad.l + (i / (DECAY_SERIES.length - 1)) * cW;
  const toY = (v: number) => pad.t + cH - (v / maxV) * cH;

  const mkPath = (key: "momentum" | "value" | "alt") =>
    DECAY_SERIES.map((p, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(p[key]).toFixed(1)}`).join(" ");

  const halfLifeX = (halfIC: number) => {
    const target = 0.074 * 0.5 * (halfIC / 0.074);
    return target;
  };

  const series = [
    { key: "momentum" as const, color: "#60a5fa", label: "Momentum (60d half-life)" },
    { key: "value" as const, color: "#34d399", label: "Value (180d half-life)" },
    { key: "alt" as const, color: "#f472b6", label: "Alt Data (30d half-life)" },
  ];

  const yTicks = [0, 0.02, 0.04, 0.06, 0.08];
  const xTicks = [0, 25, 50, 75, 95];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 200 }}>
      <text x={W / 2} y={14} textAnchor="middle" fill="#9ca3af" fontSize={10}>Signal Decay (IC vs Days Since Signal)</text>
      {yTicks.map(t => (
        <g key={t}>
          <line x1={pad.l} y1={toY(t)} x2={W - pad.r} y2={toY(t)} stroke="#1f2937" strokeWidth={1} />
          <text x={pad.l - 4} y={toY(t) + 4} textAnchor="end" fill="#6b7280" fontSize={8}>{t.toFixed(2)}</text>
        </g>
      ))}
      {xTicks.map(day => {
        const idx = Math.round(day / 5);
        if (idx >= DECAY_SERIES.length) return null;
        return (
          <text key={day} x={toX(idx)} y={H - pad.b + 12} textAnchor="middle" fill="#6b7280" fontSize={8}>{day}d</text>
        );
      })}
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={H - pad.b} stroke="#374151" strokeWidth={1} />
      <line x1={pad.l} y1={H - pad.b} x2={W - pad.r} y2={H - pad.b} stroke="#374151" strokeWidth={1} />
      <text x={14} y={pad.t + cH / 2} textAnchor="middle" fill="#6b7280" fontSize={9} transform={`rotate(-90,14,${pad.t + cH / 2})`}>IC</text>
      <text x={pad.l + cW / 2} y={H - 4} textAnchor="middle" fill="#6b7280" fontSize={9}>Days since signal</text>

      {series.map(s => (
        <path key={s.key} d={mkPath(s.key)} fill="none" stroke={s.color} strokeWidth={2} />
      ))}

      {/* Half-life marker: alt data at ~30d = idx 6 */}
      <line x1={toX(6)} y1={pad.t} x2={toX(6)} y2={H - pad.b} stroke="#f472b6" strokeWidth={1} strokeDasharray="3,2" opacity={0.5} />

      {/* Legend */}
      {series.map((s, i) => (
        <g key={s.key}>
          <line x1={pad.l + i * 130} y1={H - 8} x2={pad.l + i * 130 + 14} y2={H - 8} stroke={s.color} strokeWidth={2} />
          <text x={pad.l + i * 130 + 17} y={H - 4} fill={s.color} fontSize={7}>{s.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ── EnsembleCombiningSVG ───────────────────────────────────────────────────────
function EnsembleCombiningSVG() {
  const W = 360, H = 130;
  const models = [
    { name: "XGBoost", color: "#86efac", w: 0.40 },
    { name: "LSTM", color: "#fb923c", w: 0.30 },
    { name: "Ridge", color: "#818cf8", w: 0.18 },
    { name: "Transformer", color: "#f472b6", w: 0.12 },
  ];
  const leftX = 24, rightX = W - 80, combineX = (leftX + rightX) / 2;
  const modelSpacing = 22;
  const startY = H / 2 - ((models.length - 1) * modelSpacing) / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 145 }}>
      <text x={W / 2} y={13} textAnchor="middle" fill="#9ca3af" fontSize={10}>Ensemble Stacking (Weighted Combination)</text>
      {models.map((m, i) => {
        const y = startY + i * modelSpacing;
        return (
          <g key={m.name}>
            <rect x={leftX} y={y - 9} width={68} height={18} rx={4} fill={m.color} fillOpacity={0.15} stroke={m.color} strokeWidth={1.2} />
            <text x={leftX + 34} y={y + 5} textAnchor="middle" fill={m.color} fontSize={8.5}>{m.name}</text>
            <line x1={leftX + 68} y1={y} x2={combineX - 18} y2={H / 2} stroke={m.color} strokeWidth={1.5} strokeOpacity={0.7} />
            <text x={leftX + 74} y={y + 4} fill="#6b7280" fontSize={7.5}>{(m.w * 100).toFixed(0)}%</text>
          </g>
        );
      })}

      {/* Combiner node */}
      <circle cx={combineX} cy={H / 2} r={16} fill="#fbbf24" fillOpacity={0.15} stroke="#fbbf24" strokeWidth={1.5} />
      <text x={combineX} y={H / 2 + 4} textAnchor="middle" fill="#fbbf24" fontSize={8} fontWeight="bold">STACK</text>

      {/* Output */}
      <line x1={combineX + 16} y1={H / 2} x2={rightX} y2={H / 2} stroke="#fbbf24" strokeWidth={2} />
      <rect x={rightX} y={H / 2 - 13} width={72} height={26} rx={5} fill="#34d399" fillOpacity={0.15} stroke="#34d399" strokeWidth={1.5} />
      <text x={rightX + 36} y={H / 2 - 2} textAnchor="middle" fill="#34d399" fontSize={8} fontWeight="bold">Ensemble</text>
      <text x={rightX + 36} y={H / 2 + 10} textAnchor="middle" fill="#34d399" fontSize={8}>IC: 0.089</text>
    </svg>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function MLStocksPage() {
  const [activeTab, setActiveTab] = useState("features");
  const [expandedPitfall, setExpandedPitfall] = useState<number | null>(null);
  const [expandedModel, setExpandedModel] = useState<number | null>(null);

  const totalFeatures = useMemo(() => FEATURE_CATEGORIES.reduce((s, c) => s + c.count, 0), []);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10 border border-border">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Machine Learning in Stock Selection</h1>
            <p className="text-xs text-muted-foreground">Factor models, feature engineering, model architectures, backtesting &amp; live signal generation</p>
          </div>
        </div>

        {/* KPI chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            { label: `${totalFeatures} Features`, color: "text-primary bg-primary/10 border-border" },
            { label: "8 Model Types", color: "text-primary bg-primary/10 border-border" },
            { label: "5 Pitfalls", color: "text-red-400 bg-red-500/10 border-red-500/20" },
            { label: "IC/ICIR Framework", color: "text-green-400 bg-green-500/10 border-green-500/20" },
            { label: "10-Stock Ranking", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
          ].map(chip => (
            <span key={chip.label} className={`text-xs px-2 py-1 rounded-full border ${chip.color}`}>{chip.label}</span>
          ))}
        </div>
      </motion.div>

      {/* Hero */}
      <div className="rounded-xl border border-border bg-card border-l-4 border-l-primary p-6">
        <h2 className="text-lg font-medium text-foreground mb-1">ML Stock Selection Engine</h2>
        <p className="text-sm text-muted-foreground">Factor models, feature engineering, model architectures, backtesting framework, and live signal generation.</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList className="bg-card border border-border mb-4 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="features" className="text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Database className="w-3 h-3 mr-1" />Feature Engineering
          </TabsTrigger>
          <TabsTrigger value="models" className="text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Cpu className="w-3 h-3 mr-1" />Model Zoo
          </TabsTrigger>
          <TabsTrigger value="backtest" className="text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <FlaskConical className="w-3 h-3 mr-1" />Backtesting
          </TabsTrigger>
          <TabsTrigger value="signals" className="text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Zap className="w-3 h-3 mr-1" />Live Signals
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: Feature Engineering ─────────────────────────────────── */}
        <TabsContent value="features" className="data-[state=inactive]:hidden space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Feature categories */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground">Feature Categories ({totalFeatures} total features)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {FEATURE_CATEGORIES.map(cat => (
                  <div key={cat.name} className={`rounded-lg p-3 border border-border/50 ${cat.bgColor}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={cat.color}>{cat.icon}</span>
                        <span className={`text-sm font-medium ${cat.color}`}>{cat.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{cat.count} features</span>
                    </div>
                    <div className="mb-2">
                      <Progress value={cat.importance * 100 / 0.28 * 100} className="h-1.5" />
                      <span className="text-xs text-muted-foreground mt-1 block">Importance: {(cat.importance * 100).toFixed(0)}%</span>
                    </div>
                    <ul className="grid grid-cols-2 gap-0.5">
                      {cat.features.map(f => (
                        <li key={f} className="text-xs text-muted-foreground flex items-start gap-1">
                          <span className="text-muted-foreground mt-0.5">•</span>{f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Right column: importance chart + heatmap + concepts */}
            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-foreground">Feature Importance</CardTitle>
                </CardHeader>
                <CardContent>
                  <FeatureImportanceChart />
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-foreground">8×8 Correlation Matrix</CardTitle>
                </CardHeader>
                <CardContent>
                  <CorrelationHeatmap />
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    {[
                      { label: "High +corr", color: "#ef4444" },
                      { label: "Low corr", color: "#fbbf24" },
                      { label: "Low −corr", color: "#34d399" },
                      { label: "High −corr", color: "#3b82f6" },
                    ].map(l => (
                      <div key={l.label} className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.color, opacity: 0.8 }} />
                        <span className="text-xs text-muted-foreground">{l.label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-foreground">Key Preprocessing Concepts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    {
                      title: "Stationarity Requirements",
                      desc: "Price levels are non-stationary (random walk). Use returns, z-scores, or log differences. Augmented Dickey-Fuller test for each feature.",
                      color: "text-primary",
                    },
                    {
                      title: "Dimensionality Reduction",
                      desc: "With 100+ features, use PCA (retain 95% variance), autoencoders, or L1 regularization (Lasso) to avoid the curse of dimensionality.",
                      color: "text-primary",
                    },
                    {
                      title: "Look-Ahead Bias Prevention",
                      desc: "Point-in-time accounting data only. Quarterly reports available 45–60 days after quarter end. Use as-reported, not restated, values.",
                      color: "text-amber-400",
                    },
                    {
                      title: "Cross-Sectional Normalization",
                      desc: "Winsorize at 1st/99th percentile, then rank-normalize within each universe cross-section daily. Removes outlier contamination.",
                      color: "text-green-400",
                    },
                  ].map(item => (
                    <div key={item.title} className="bg-muted/50 rounded-lg p-3">
                      <p className={`text-xs font-semibold mb-1 ${item.color}`}>{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── TAB 2: Model Zoo ───────────────────────────────────────────── */}
        <TabsContent value="models" className="data-[state=inactive]:hidden space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Model comparison table */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground">Model Comparison Table</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-muted-foreground font-medium">Model</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">Sharpe</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">IC</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">Train</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">Interp.</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MODELS.map((m, i) => (
                        <tr
                          key={m.name}
                          className="border-b border-border/50 cursor-pointer hover:bg-muted/30 transition-colors"
                          onClick={() => setExpandedModel(expandedModel === i ? null : i)}
                        >
                          <td className="py-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                              <span style={{ color: m.color }} className="font-medium">{m.shortName}</span>
                              <Badge variant="outline" className="text-muted-foreground border-border text-xs py-0">{m.type}</Badge>
                            </div>
                          </td>
                          <td className="text-right py-2 text-foreground">{m.sharpe.toFixed(2)}</td>
                          <td className="text-right py-2 text-foreground">{m.ic.toFixed(3)}</td>
                          <td className="text-right py-2 text-muted-foreground">{m.trainTime}</td>
                          <td className="text-right py-2">
                            <div className="flex items-center justify-end gap-1">
                              <div className="w-12 bg-muted rounded-full h-1.5">
                                <div className="h-1.5 rounded-full" style={{ width: `${m.interpretability}%`, backgroundColor: m.color }} />
                              </div>
                            </div>
                          </td>
                          <td className="text-right py-2 text-muted-foreground">{m.dataNeed}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <AnimatePresence>
                  {expandedModel !== null && (
                    <motion.div
                      key={expandedModel}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 rounded-lg p-3 border border-border bg-muted/40"
                    >
                      <p className="text-xs font-semibold mb-1" style={{ color: MODELS[expandedModel].color }}>
                        {MODELS[expandedModel].name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Sharpe {MODELS[expandedModel].sharpe.toFixed(2)} · IC {MODELS[expandedModel].ic.toFixed(3)} · {MODELS[expandedModel].dataNeed} data requirement · Training: {MODELS[expandedModel].trainTime}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Charts */}
            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-foreground">Bias-Variance Tradeoff</CardTitle>
                </CardHeader>
                <CardContent>
                  <BiasVarianceCurve />
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-foreground">Walk-Forward Validation</CardTitle>
                </CardHeader>
                <CardContent>
                  <WalkForwardDiagram />
                  <p className="text-xs text-muted-foreground mt-2">
                    Each fold expands the training window while the test window rolls forward. Prevents data leakage and tests generalization across time regimes.
                  </p>
                </CardContent>
              </Card>

              {/* Model selection guidance */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-foreground">Model Selection Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { cond: "Small dataset (< 5yrs)", rec: "Ridge/Lasso — regularized linear models generalize better", color: "text-primary" },
                    { cond: "Tabular features, medium data", rec: "XGBoost — best risk-adjusted Sharpe per compute hour", color: "text-green-400" },
                    { cond: "Sequential price patterns", rec: "LSTM — captures temporal dependencies in time series", color: "text-orange-400" },
                    { cond: "Rich cross-asset context", rec: "Transformer — attention mechanism handles long-range deps", color: "text-pink-400" },
                    { cond: "Production deployment", rec: "Ensemble — diversification reduces model-specific drawdowns", color: "text-amber-400" },
                  ].map(g => (
                    <div key={g.cond} className="flex gap-2 text-xs">
                      <span className="text-muted-foreground shrink-0">{g.cond}:</span>
                      <span className={g.color}>{g.rec}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── TAB 3: Backtesting ─────────────────────────────────────────── */}
        <TabsContent value="backtest" className="data-[state=inactive]:hidden space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Overfitting chart + transaction costs */}
            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-foreground">Overfitting Cliff</CardTitle>
                </CardHeader>
                <CardContent>
                  <OverfittingChart />
                  <p className="text-xs text-muted-foreground mt-2">
                    In-sample Sharpe climbs with complexity but out-of-sample collapses after the overfit threshold. The gap between curves measures overfit severity.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-foreground">Walk-Forward Optimization</CardTitle>
                </CardHeader>
                <CardContent>
                  <WalkForwardDiagram />
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-foreground">Realistic Transaction Cost Model</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { cost: "Commission", est: "0–1 bps", note: "Effectively zero at most brokers" },
                      { cost: "Bid-Ask Spread", est: "1–5 bps", note: "2 bps for large-caps, 20 bps for small-caps" },
                      { cost: "Market Impact", est: "5–15 bps", note: "Square-root law: impact ∝ √(trade size / ADV)" },
                      { cost: "Slippage", est: "1–3 bps", note: "Signal delay between decision and execution" },
                      { cost: "Total (round-trip)", est: "14–48 bps", note: "Must be earned by alpha signal daily" },
                    ].map(row => (
                      <div key={row.cost} className="flex items-start justify-between text-xs py-1.5 border-b border-border/50">
                        <div>
                          <span className="text-foreground font-medium">{row.cost}</span>
                          <span className="text-muted-foreground ml-2">{row.note}</span>
                        </div>
                        <Badge variant="outline" className="border-border text-muted-foreground ml-2 shrink-0">{row.est}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pitfalls + regime */}
            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-foreground">5 Common Backtesting Pitfalls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {PITFALLS.map((p, i) => (
                    <div
                      key={p.name}
                      className={`rounded-lg border cursor-pointer transition-all ${severityColor(p.severity)}`}
                      onClick={() => setExpandedPitfall(expandedPitfall === i ? null : i)}
                    >
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-2">
                          {p.icon}
                          <span className="text-sm font-medium">{p.name}</span>
                          <Badge
                            variant="outline"
                            className={`text-xs border-current ${
                              p.severity === "high" ? "text-red-400" : p.severity === "medium" ? "text-amber-400" : "text-green-400"
                            }`}
                          >{p.severity}</Badge>
                        </div>
                        {expandedPitfall === i ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                      <AnimatePresence>
                        {expandedPitfall === i && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="px-3 pb-3 space-y-1"
                          >
                            <p className="text-xs text-muted-foreground">{p.description}</p>
                            <div className="flex items-start gap-1 mt-1">
                              <CheckCircle className="w-3 h-3 text-green-400 shrink-0 mt-0.5" />
                              <p className="text-xs text-green-400">{p.solution}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-foreground">Regime Identification (HMM)</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Simple HMM diagram */}
                  <svg viewBox="0 0 340 110" className="w-full" style={{ maxHeight: 120 }}>
                    <text x={170} y={12} textAnchor="middle" fill="#9ca3af" fontSize={10}>Hidden Markov Model — 3 Market Regimes</text>
                    {[
                      { label: "Bull", subLabel: "Low vol, trend", x: 60, y: 65, color: "#34d399" },
                      { label: "Bear", subLabel: "High vol, down", x: 170, y: 65, color: "#f87171" },
                      { label: "Sideways", subLabel: "Mean revert", x: 280, y: 65, color: "#fbbf24" },
                    ].map(node => (
                      <g key={node.label}>
                        <circle cx={node.x} cy={node.y} r={28} fill={node.color} fillOpacity={0.12} stroke={node.color} strokeWidth={1.5} />
                        <text x={node.x} y={node.y - 2} textAnchor="middle" fill={node.color} fontSize={10} fontWeight="bold">{node.label}</text>
                        <text x={node.x} y={node.y + 10} textAnchor="middle" fill="#9ca3af" fontSize={7}>{node.subLabel}</text>
                      </g>
                    ))}
                    {/* Transition arrows */}
                    <path d="M90,58 Q125,42 140,58" fill="none" stroke="#6b7280" strokeWidth={1} markerEnd="url(#hmmarr)" />
                    <path d="M140,72 Q125,88 90,72" fill="none" stroke="#6b7280" strokeWidth={1} markerEnd="url(#hmmarr)" />
                    <path d="M200,58 Q235,42 252,58" fill="none" stroke="#6b7280" strokeWidth={1} markerEnd="url(#hmmarr)" />
                    <path d="M252,72 Q235,88 200,72" fill="none" stroke="#6b7280" strokeWidth={1} markerEnd="url(#hmmarr)" />
                    <path d="M90,54 Q170,20 252,54" fill="none" stroke="#6b7280" strokeWidth={1} markerEnd="url(#hmmarr)" strokeDasharray="3,2" />
                    <defs>
                      <marker id="hmmarr" markerWidth="5" markerHeight="5" refX="3" refY="2.5" orient="auto">
                        <polygon points="0,0 5,2.5 0,5" fill="#6b7280" />
                      </marker>
                    </defs>
                  </svg>
                  <p className="text-xs text-muted-foreground mt-2">
                    Train separate models per regime. HMM infers hidden state from volatility, trend strength, and correlation. Switch factor weights dynamically.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── TAB 4: Live Signals ────────────────────────────────────────── */}
        <TabsContent value="signals" className="data-[state=inactive]:hidden space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left column */}
            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-foreground">Signal Generation Pipeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <SignalPipelineSVG />
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {[
                      { label: "Data Latency", val: "< 500ms", color: "text-primary" },
                      { label: "Feature Calc", val: "~ 50ms", color: "text-primary" },
                      { label: "Model Infer", val: "< 10ms", color: "text-orange-400" },
                    ].map(m => (
                      <div key={m.label} className="bg-muted/50 rounded-lg p-2 text-center">
                        <p className={`text-sm font-bold ${m.color}`}>{m.val}</p>
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-foreground">IC / ICIR Framework</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs space-y-1">
                    <p className="text-green-400">IC = rank_corr(predictions_t, returns_{"{t+1}"})</p>
                    <p className="text-primary">ICIR = mean(IC) / std(IC)</p>
                    <p className="text-amber-400">IC_t2: IR ≥ 0.5 for live deployment</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Ensemble IC", val: "0.089", note: "Top quartile", color: "text-green-400" },
                      { label: "ICIR", val: "1.34", note: "Production-ready", color: "text-green-400" },
                      { label: "XGBoost IC", val: "0.074", note: "Deployable", color: "text-primary" },
                      { label: "LSTM IC", val: "0.068", note: "Borderline", color: "text-amber-400" },
                    ].map(m => (
                      <div key={m.label} className="bg-muted/50 rounded-lg p-2">
                        <p className={`text-sm font-bold ${m.color}`}>{m.val}</p>
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                        <p className="text-xs text-muted-foreground">{m.note}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-foreground">Signal Decay (Alpha Half-Life)</CardTitle>
                </CardHeader>
                <CardContent>
                  <SignalDecayChart />
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-foreground">Ensemble Combining</CardTitle>
                </CardHeader>
                <CardContent>
                  <EnsembleCombiningSVG />
                  <p className="text-xs text-muted-foreground mt-2">
                    Weights optimized by minimizing IC correlation (maximize diversification). Rebalanced monthly via rolling 60-day IC covariance matrix.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right column: signal table + monitoring */}
            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-foreground">10-Stock Signal Rankings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-1.5 text-muted-foreground">Ticker</th>
                          <th className="text-left py-1.5 text-muted-foreground">Sector</th>
                          <th className="text-right py-1.5 text-muted-foreground">Score</th>
                          <th className="text-right py-1.5 text-muted-foreground">Mom</th>
                          <th className="text-right py-1.5 text-muted-foreground">Val</th>
                          <th className="text-right py-1.5 text-muted-foreground">Qual</th>
                          <th className="text-right py-1.5 text-muted-foreground">Sent</th>
                          <th className="text-right py-1.5 text-muted-foreground">Signal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {SORTED_SIGNALS.map((sig, i) => {
                          const scoreColor = sig.score > 20 ? "text-green-400" : sig.score > 0 ? "text-emerald-400" : sig.score > -20 ? "text-muted-foreground" : "text-red-400";
                          const fmtScore = (v: number) => (v >= 0 ? "+" : "") + v.toFixed(1);
                          return (
                            <tr key={sig.ticker} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                              <td className="py-1.5">
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground w-4">{i + 1}</span>
                                  <span className="text-foreground font-semibold">{sig.ticker}</span>
                                </div>
                              </td>
                              <td className="py-1.5 text-muted-foreground">{sig.sector}</td>
                              <td className={`py-1.5 text-right font-bold ${scoreColor}`}>{fmtScore(sig.score)}</td>
                              <td className={`py-1.5 text-right ${sig.momentum >= 0 ? "text-green-400" : "text-red-400"}`}>{fmtScore(sig.momentum)}</td>
                              <td className={`py-1.5 text-right ${sig.value >= 0 ? "text-green-400" : "text-red-400"}`}>{fmtScore(sig.value)}</td>
                              <td className={`py-1.5 text-right ${sig.quality >= 0 ? "text-green-400" : "text-red-400"}`}>{fmtScore(sig.quality)}</td>
                              <td className={`py-1.5 text-right ${sig.sentiment >= 0 ? "text-green-400" : "text-red-400"}`}>{fmtScore(sig.sentiment)}</td>
                              <td className="py-1.5 text-right">
                                <Badge variant={signalBadgeVariant(sig.signal)} className={`text-xs ${signalColor(sig.signal)}`}>
                                  {sig.signal}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Score = weighted sum of factor z-scores (Mom 30%, Val 25%, Qual 25%, Sent 20%)</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-foreground">Model Monitoring — Drift Detection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    {
                      metric: "Feature Distribution Drift",
                      status: "Normal",
                      value: 0.12,
                      threshold: 0.30,
                      note: "KS test p-value vs training distribution",
                      ok: true,
                    },
                    {
                      metric: "IC Rolling 20-day",
                      status: "Warning",
                      value: 0.041,
                      threshold: 0.050,
                      note: "Below minimum threshold — review model",
                      ok: false,
                    },
                    {
                      metric: "Prediction Volatility",
                      status: "Normal",
                      value: 0.68,
                      threshold: 1.00,
                      note: "Std of daily score output",
                      ok: true,
                    },
                    {
                      metric: "Factor Correlation Stability",
                      status: "Normal",
                      value: 0.21,
                      threshold: 0.50,
                      note: "Cross-factor avg Pearson r vs baseline",
                      ok: true,
                    },
                  ].map(row => (
                    <div key={row.metric} className="bg-muted/50 rounded-lg p-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-foreground">{row.metric}</span>
                        <div className="flex items-center gap-1">
                          {row.ok
                            ? <CheckCircle className="w-3 h-3 text-green-400" />
                            : <AlertTriangle className="w-3 h-3 text-amber-400" />
                          }
                          <Badge variant={row.ok ? "outline" : "secondary"} className={`text-xs ${row.ok ? "text-green-400 border-green-500/30" : "text-amber-400"}`}>
                            {row.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${Math.min(100, (row.value / row.threshold) * 100)}%`,
                              backgroundColor: row.ok ? "#34d399" : "#fbbf24",
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{row.value.toFixed(3)} / {row.threshold.toFixed(3)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{row.note}</p>
                    </div>
                  ))}
                  <div className="bg-muted/30 rounded-lg p-3 mt-1">
                    <p className="text-xs text-muted-foreground">
                      <span className="text-amber-400 font-semibold">Action required:</span> IC Rolling 20-day dropped below threshold. Retrain on last 252 trading days or activate Ridge fallback model until recovery confirmed.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
