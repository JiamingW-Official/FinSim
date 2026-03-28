"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  BarChart3,
  Target,
  Shield,
  Sliders,
  PieChart,
  Activity,
  Info,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Layers,
  Lock,
  Unlock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 782;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed() {
  s = 782;
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface PortfolioPoint {
  risk: number;
  ret: number;
  sharpe: number;
  label?: string;
  color?: string;
}

interface Asset {
  ticker: string;
  name: string;
  sector: string;
  weightBefore: number;
  weightAfter: number;
  expReturn: number;
  blReturn: number;
  vol: number;
  color: string;
}

interface BLView {
  assets: string[];
  direction: string;
  confidence: number;
  priorReturn: number;
  posteriorReturn: number;
}

interface ConstraintPoint {
  maxWeight: number;
  sharpe: number;
  numActive: number;
}

interface AttributionBucket {
  label: string;
  value: number;
  color: string;
}

// ── Static Data ────────────────────────────────────────────────────────────────

const ASSETS: Asset[] = [
  { ticker: "AAPL", name: "Apple Inc.", sector: "Technology", weightBefore: 0.22, weightAfter: 0.18, expReturn: 0.14, blReturn: 0.16, vol: 0.28, color: "#6366f1" },
  { ticker: "MSFT", name: "Microsoft Corp.", sector: "Technology", weightBefore: 0.18, weightAfter: 0.15, expReturn: 0.13, blReturn: 0.15, vol: 0.24, color: "#8b5cf6" },
  { ticker: "JPM",  name: "JPMorgan Chase", sector: "Financials", weightBefore: 0.10, weightAfter: 0.14, expReturn: 0.10, blReturn: 0.12, vol: 0.22, color: "#a78bfa" },
  { ticker: "XOM",  name: "Exxon Mobil", sector: "Energy", weightBefore: 0.08, weightAfter: 0.12, expReturn: 0.09, blReturn: 0.11, vol: 0.30, color: "#f59e0b" },
  { ticker: "JNJ",  name: "Johnson & Johnson", sector: "Healthcare", weightBefore: 0.12, weightAfter: 0.13, expReturn: 0.08, blReturn: 0.09, vol: 0.18, color: "#10b981" },
  { ticker: "PG",   name: "Procter & Gamble", sector: "Staples", weightBefore: 0.10, weightAfter: 0.11, expReturn: 0.07, blReturn: 0.08, vol: 0.15, color: "#06b6d4" },
  { ticker: "BRK",  name: "Berkshire Hathaway", sector: "Financials", weightBefore: 0.12, weightAfter: 0.10, expReturn: 0.11, blReturn: 0.10, vol: 0.20, color: "#f97316" },
  { ticker: "TLT",  name: "iShares 20Y Treasury", sector: "Bonds", weightBefore: 0.08, weightAfter: 0.07, expReturn: 0.05, blReturn: 0.06, vol: 0.14, color: "#ec4899" },
];

const BL_VIEWS: BLView[] = [
  { assets: ["AAPL", "MSFT"], direction: "Outperform market by 2%", confidence: 75, priorReturn: 0.135, posteriorReturn: 0.155 },
  { assets: ["XOM"], direction: "Energy sector rally on supply cuts", confidence: 60, priorReturn: 0.090, posteriorReturn: 0.110 },
  { assets: ["TLT"], direction: "Rate cuts boost bond prices", confidence: 80, priorReturn: 0.050, posteriorReturn: 0.065 },
  { assets: ["JPM", "BRK"], direction: "Financials underperform due to credit risk", confidence: 55, priorReturn: 0.105, posteriorReturn: 0.095 },
];

// ── Data Generation ────────────────────────────────────────────────────────────

function generateFrontierPoints(): PortfolioPoint[] {
  resetSeed();
  const pts: PortfolioPoint[] = [];
  // Generate 300 random portfolio simulations
  for (let i = 0; i < 300; i++) {
    const risk = 0.08 + rand() * 0.22;
    // Returns follow a concave relationship with risk (frontier)
    const maxRet = -0.6 * risk * risk + 0.28 * risk + 0.01;
    const ret = maxRet * (0.5 + rand() * 0.5);
    const sharpe = (ret - 0.045) / risk;
    pts.push({ risk, ret, sharpe });
  }
  return pts;
}

function generateCorrelationMatrix(): number[][] {
  resetSeed();
  const n = ASSETS.length;
  const mat: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  // Predefined realistic correlations
  const baseCorrs = [
    [1.00, 0.82, 0.45, 0.28, 0.32, 0.25, 0.52, -0.18],
    [0.82, 1.00, 0.41, 0.22, 0.35, 0.28, 0.48, -0.22],
    [0.45, 0.41, 1.00, 0.38, 0.30, 0.22, 0.72, -0.15],
    [0.28, 0.22, 0.38, 1.00, 0.18, 0.12, 0.35, -0.08],
    [0.32, 0.35, 0.30, 0.18, 1.00, 0.55, 0.28, 0.05],
    [0.25, 0.28, 0.22, 0.12, 0.55, 1.00, 0.24, 0.12],
    [0.52, 0.48, 0.72, 0.35, 0.28, 0.24, 1.00, -0.12],
    [-0.18, -0.22, -0.15, -0.08, 0.05, 0.12, -0.12, 1.00],
  ];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      mat[i][j] = baseCorrs[i][j];
    }
  }
  return mat;
}

function generateConstraintSensitivity(): ConstraintPoint[] {
  resetSeed();
  const pts: ConstraintPoint[] = [];
  for (let maxW = 0.05; maxW <= 0.40; maxW += 0.025) {
    const base = 1.45;
    const penalty = maxW < 0.10 ? (0.10 - maxW) * 8 : 0;
    const bonus = maxW > 0.30 ? (maxW - 0.30) * 2 : 0;
    const sharpe = base - penalty - bonus + (rand() - 0.5) * 0.08;
    const numActive = Math.max(3, Math.round(1 / (maxW + 0.02)));
    pts.push({ maxWeight: maxW, sharpe: Math.max(0.5, sharpe), numActive });
  }
  return pts;
}

function generateAttributionData(): AttributionBucket[] {
  return [
    { label: "Selection", value: 2.8, color: "#6366f1" },
    { label: "Allocation", value: 1.6, color: "#8b5cf6" },
    { label: "Interaction", value: 0.4, color: "#a78bfa" },
    { label: "Factor Risk", value: -0.9, color: "#f59e0b" },
    { label: "Idio. Risk", value: -0.3, color: "#f97316" },
    { label: "Net Alpha", value: 3.6, color: "#10b981" },
  ];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function corrColor(v: number): string {
  if (v >= 0.7) return "rgba(239,68,68,0.85)";
  if (v >= 0.4) return "rgba(251,146,60,0.75)";
  if (v >= 0.1) return "rgba(234,179,8,0.60)";
  if (v >= -0.1) return "rgba(100,116,139,0.4)";
  if (v >= -0.4) return "rgba(34,211,238,0.55)";
  return "rgba(99,102,241,0.75)";
}

// ── Sub-Charts ─────────────────────────────────────────────────────────────────

function EfficientFrontierChart({ points }: { points: PortfolioPoint[] }) {
  const W = 560, H = 320;
  const pad = { left: 48, right: 20, top: 16, bottom: 36 };

  const minRisk = 0.07, maxRisk = 0.32;
  const minRet = 0.00, maxRet = 0.22;

  const toX = (r: number) => pad.left + ((r - minRisk) / (maxRisk - minRisk)) * (W - pad.left - pad.right);
  const toY = (r: number) => H - pad.bottom - ((r - minRet) / (maxRet - minRet)) * (H - pad.top - pad.bottom);

  // Identify key portfolios
  const minVarPt = points.reduce((a, b) => a.risk < b.risk ? a : b);
  const maxSharpePt = points.reduce((a, b) => a.sharpe > b.sharpe ? a : b);
  const currentPt: PortfolioPoint = { risk: 0.185, ret: 0.112, sharpe: (0.112 - 0.045) / 0.185, label: "Current", color: "#f59e0b" };

  // Build frontier curve path
  const frontierPts = [...points].sort((a, b) => a.risk - b.risk);
  // Rolling max return per risk bucket for the frontier line
  const buckets: Record<number, number> = {};
  frontierPts.forEach(p => {
    const k = Math.round(p.risk * 40);
    buckets[k] = Math.max(buckets[k] ?? 0, p.ret);
  });
  const frontierLine = Object.entries(buckets)
    .map(([k, ret]) => ({ risk: parseInt(k) / 40, ret }))
    .sort((a, b) => a.risk - b.risk);

  const pathD = frontierLine.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.risk).toFixed(1)} ${toY(p.ret).toFixed(1)}`).join(" ");

  const yTicks = [0.00, 0.05, 0.10, 0.15, 0.20];
  const xTicks = [0.08, 0.12, 0.16, 0.20, 0.24, 0.28, 0.32];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 320 }}>
      {/* Grid */}
      {yTicks.map(v => (
        <g key={v}>
          <line x1={pad.left} x2={W - pad.right} y1={toY(v)} y2={toY(v)} stroke="rgba(148,163,184,0.12)" strokeWidth={1} />
          <text x={pad.left - 6} y={toY(v) + 4} textAnchor="end" fontSize={9} fill="#94a3b8">{(v * 100).toFixed(0)}%</text>
        </g>
      ))}
      {xTicks.map(v => (
        <g key={v}>
          <line x1={toX(v)} x2={toX(v)} y1={pad.top} y2={H - pad.bottom} stroke="rgba(148,163,184,0.12)" strokeWidth={1} />
          <text x={toX(v)} y={H - pad.bottom + 14} textAnchor="middle" fontSize={9} fill="#94a3b8">{(v * 100).toFixed(0)}%</text>
        </g>
      ))}

      {/* Axis labels */}
      <text x={W / 2} y={H - 2} textAnchor="middle" fontSize={10} fill="#64748b">Volatility (σ)</text>
      <text x={10} y={H / 2} textAnchor="middle" fontSize={10} fill="#64748b" transform={`rotate(-90, 10, ${H / 2})`}>Expected Return</text>

      {/* Scatter dots */}
      {points.map((p, i) => (
        <circle key={i} cx={toX(p.risk)} cy={toY(p.ret)} r={2.2}
          fill={p.sharpe > 1.3 ? "#6366f1" : p.sharpe > 0.9 ? "#8b5cf6" : "rgba(148,163,184,0.35)"}
          opacity={0.7} />
      ))}

      {/* Frontier line */}
      <path d={pathD} fill="none" stroke="#6366f1" strokeWidth={2} opacity={0.8} strokeLinejoin="round" />

      {/* Min Variance */}
      <circle cx={toX(minVarPt.risk)} cy={toY(minVarPt.ret)} r={6} fill="#10b981" stroke="#fff" strokeWidth={1.5} />
      <text x={toX(minVarPt.risk) + 9} y={toY(minVarPt.ret) - 4} fontSize={9} fill="#10b981" fontWeight="600">Min Var</text>

      {/* Max Sharpe */}
      <circle cx={toX(maxSharpePt.risk)} cy={toY(maxSharpePt.ret)} r={6} fill="#f59e0b" stroke="#fff" strokeWidth={1.5} />
      <text x={toX(maxSharpePt.risk) + 9} y={toY(maxSharpePt.ret) - 4} fontSize={9} fill="#f59e0b" fontWeight="600">Max Sharpe</text>

      {/* Current portfolio */}
      <circle cx={toX(currentPt.risk)} cy={toY(currentPt.ret)} r={7} fill="none" stroke="#ec4899" strokeWidth={2} strokeDasharray="3 2" />
      <circle cx={toX(currentPt.risk)} cy={toY(currentPt.ret)} r={3.5} fill="#ec4899" />
      <text x={toX(currentPt.risk) + 10} y={toY(currentPt.ret) + 4} fontSize={9} fill="#ec4899" fontWeight="600">Current</text>

      {/* Capital Market Line */}
      <line
        x1={toX(0.0)} y1={toY(0.045)}
        x2={toX(maxSharpePt.risk * 1.6)} y2={toY(0.045 + maxSharpePt.sharpe * maxSharpePt.risk * 1.6)}
        stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 3" opacity={0.5}
      />
      <text x={toX(0.27)} y={toY(0.145)} fontSize={8} fill="#f59e0b" opacity={0.8}>CML</text>
    </svg>
  );
}

function CorrelationHeatmap({ matrix }: { matrix: number[][] }) {
  const n = ASSETS.length;
  const cellSize = 44;
  const labelPad = 40;
  const W = labelPad + n * cellSize;
  const H = labelPad + n * cellSize;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 420 }}>
      {/* Column labels */}
      {ASSETS.map((a, j) => (
        <text key={j} x={labelPad + j * cellSize + cellSize / 2} y={labelPad - 6}
          textAnchor="middle" fontSize={9} fill="#94a3b8" fontWeight="600">{a.ticker}</text>
      ))}
      {/* Row labels */}
      {ASSETS.map((a, i) => (
        <text key={i} x={labelPad - 5} y={labelPad + i * cellSize + cellSize / 2 + 4}
          textAnchor="end" fontSize={9} fill="#94a3b8" fontWeight="600">{a.ticker}</text>
      ))}
      {/* Cells */}
      {ASSETS.map((_a, i) =>
        ASSETS.map((_b, j) => {
          const v = matrix[i][j];
          const x = labelPad + j * cellSize;
          const y = labelPad + i * cellSize;
          return (
            <g key={`${i}-${j}`}>
              <rect x={x + 1} y={y + 1} width={cellSize - 2} height={cellSize - 2}
                rx={3} fill={corrColor(v)} />
              <text x={x + cellSize / 2} y={y + cellSize / 2 + 4}
                textAnchor="middle" fontSize={9} fill="#fff" fontWeight={i === j ? "700" : "400"}>
                {v.toFixed(2)}
              </text>
            </g>
          );
        })
      )}
      {/* Legend */}
      <text x={W / 2} y={H - 2} textAnchor="middle" fontSize={9} fill="#64748b">Pairwise Pearson Correlation (trailing 3Y)</text>
    </svg>
  );
}

function ConstraintChart({ points }: { points: ConstraintPoint[] }) {
  const W = 500, H = 220;
  const pad = { left: 48, right: 24, top: 16, bottom: 40 };

  const minSharpe = Math.min(...points.map(p => p.sharpe)) - 0.1;
  const maxSharpe = Math.max(...points.map(p => p.sharpe)) + 0.1;

  const toX = (w: number) => pad.left + ((w - 0.05) / (0.40 - 0.05)) * (W - pad.left - pad.right);
  const toY = (v: number) => H - pad.bottom - ((v - minSharpe) / (maxSharpe - minSharpe)) * (H - pad.top - pad.bottom);

  const lineD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.maxWeight).toFixed(1)} ${toY(p.sharpe).toFixed(1)}`).join(" ");
  const areaD = lineD + ` L ${toX(points[points.length - 1].maxWeight)} ${H - pad.bottom} L ${toX(points[0].maxWeight)} ${H - pad.bottom} Z`;

  const yTicks = [0.8, 1.0, 1.2, 1.4, 1.6];
  const xTicks = [0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40];

  const optPt = points.reduce((a, b) => a.sharpe > b.sharpe ? a : b);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }}>
      {yTicks.map(v => (
        <g key={v}>
          <line x1={pad.left} x2={W - pad.right} y1={toY(v)} y2={toY(v)} stroke="rgba(148,163,184,0.1)" strokeWidth={1} />
          <text x={pad.left - 6} y={toY(v) + 4} textAnchor="end" fontSize={9} fill="#94a3b8">{v.toFixed(1)}</text>
        </g>
      ))}
      {xTicks.map(v => (
        <g key={v}>
          <line x1={toX(v)} x2={toX(v)} y1={pad.top} y2={H - pad.bottom} stroke="rgba(148,163,184,0.08)" strokeWidth={1} />
          <text x={toX(v)} y={H - pad.bottom + 14} textAnchor="middle" fontSize={9} fill="#94a3b8">{(v * 100).toFixed(0)}%</text>
        </g>
      ))}
      <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={10} fill="#64748b">Max Position Limit</text>
      <text x={10} y={H / 2 + 4} textAnchor="middle" fontSize={10} fill="#64748b" transform={`rotate(-90, 10, ${H / 2})`}>Sharpe Ratio</text>

      {/* Area fill */}
      <path d={areaD} fill="rgba(99,102,241,0.08)" />
      {/* Line */}
      <path d={lineD} fill="none" stroke="#6366f1" strokeWidth={2} strokeLinejoin="round" />
      {/* Optimal marker */}
      <line x1={toX(optPt.maxWeight)} x2={toX(optPt.maxWeight)} y1={pad.top} y2={H - pad.bottom}
        stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.8} />
      <circle cx={toX(optPt.maxWeight)} cy={toY(optPt.sharpe)} r={5} fill="#f59e0b" stroke="#fff" strokeWidth={1.5} />
      <text x={toX(optPt.maxWeight) + 8} y={toY(optPt.sharpe) - 4} fontSize={9} fill="#f59e0b" fontWeight="600">
        Opt {(optPt.maxWeight * 100).toFixed(0)}%
      </text>
    </svg>
  );
}

function WeightComparisonChart() {
  const W = 560, H = 240;
  const pad = { left: 56, right: 20, top: 16, bottom: 24 };
  const barH = (H - pad.top - pad.bottom) / ASSETS.length - 4;
  const maxW = 0.25;

  const toX = (w: number) => pad.left + (w / maxW) * (W - pad.left - pad.right);

  const xTicks = [0, 0.05, 0.10, 0.15, 0.20, 0.25];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 260 }}>
      {xTicks.map(v => (
        <g key={v}>
          <line x1={toX(v)} x2={toX(v)} y1={pad.top} y2={H - pad.bottom} stroke="rgba(148,163,184,0.12)" strokeWidth={1} />
          <text x={toX(v)} y={H - pad.bottom + 12} textAnchor="middle" fontSize={9} fill="#94a3b8">{(v * 100).toFixed(0)}%</text>
        </g>
      ))}

      {ASSETS.map((a, i) => {
        const y = pad.top + i * ((H - pad.top - pad.bottom) / ASSETS.length) + 2;
        const halfH = (barH - 2) / 2;
        return (
          <g key={a.ticker}>
            {/* Ticker label */}
            <text x={pad.left - 6} y={y + barH / 2 + 4} textAnchor="end" fontSize={9} fill="#94a3b8" fontWeight="600">{a.ticker}</text>
            {/* Before bar */}
            <rect x={pad.left} y={y} width={toX(a.weightBefore) - pad.left} height={halfH} rx={2}
              fill="rgba(148,163,184,0.35)" />
            {/* After bar */}
            <rect x={pad.left} y={y + halfH + 1} width={toX(a.weightAfter) - pad.left} height={halfH} rx={2}
              fill={a.color} opacity={0.85} />
            {/* Values */}
            <text x={toX(a.weightBefore) + 3} y={y + halfH - 1} fontSize={8} fill="#94a3b8">
              {(a.weightBefore * 100).toFixed(0)}%
            </text>
            <text x={toX(a.weightAfter) + 3} y={y + barH - 1} fontSize={8} fill={a.color}>
              {(a.weightAfter * 100).toFixed(0)}%
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <rect x={W - 110} y={pad.top} width={10} height={8} rx={2} fill="rgba(148,163,184,0.35)" />
      <text x={W - 96} y={pad.top + 8} fontSize={9} fill="#94a3b8">Before Opt.</text>
      <rect x={W - 110} y={pad.top + 14} width={10} height={8} rx={2} fill="#6366f1" opacity={0.85} />
      <text x={W - 96} y={pad.top + 22} fontSize={9} fill="#94a3b8">After Opt.</text>
    </svg>
  );
}

function AttributionChart({ data }: { data: AttributionBucket[] }) {
  const W = 400, H = 200;
  const pad = { left: 90, right: 24, top: 20, bottom: 24 };
  const barH = 22;
  const maxAbsVal = Math.max(...data.map(d => Math.abs(d.value)));
  const midX = pad.left + (W - pad.left - pad.right) / 2;

  const toWidth = (v: number) => (Math.abs(v) / maxAbsVal) * ((W - pad.left - pad.right) / 2);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 200 }}>
      {/* Zero line */}
      <line x1={midX} x2={midX} y1={pad.top} y2={H - pad.bottom} stroke="rgba(148,163,184,0.3)" strokeWidth={1} />

      {data.map((d, i) => {
        const y = pad.top + i * (barH + 4);
        const w = toWidth(d.value);
        const x = d.value >= 0 ? midX : midX - w;
        return (
          <g key={d.label}>
            <text x={pad.left - 8} y={y + barH / 2 + 4} textAnchor="end" fontSize={9} fill="#94a3b8">{d.label}</text>
            <rect x={x} y={y} width={w} height={barH} rx={3}
              fill={d.value >= 0 ? d.color : "#ef4444"} opacity={0.85} />
            <text x={d.value >= 0 ? x + w + 4 : x - 4} y={y + barH / 2 + 4}
              textAnchor={d.value >= 0 ? "start" : "end"}
              fontSize={9} fill={d.value >= 0 ? d.color : "#ef4444"} fontWeight="600">
              {d.value >= 0 ? "+" : ""}{d.value.toFixed(1)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function QuantPortfolioPage() {
  const [constraintMaxWeight, setConstraintMaxWeight] = useState(0.20);
  const [blConfidenceScale, setBlConfidenceScale] = useState(1.0);
  const [viewsEnabled, setViewsEnabled] = useState<boolean[]>(BL_VIEWS.map(() => true));

  const frontierPoints = useMemo(() => generateFrontierPoints(), []);
  const correlationMatrix = useMemo(() => generateCorrelationMatrix(), []);
  const constraintPoints = useMemo(() => generateConstraintSensitivity(), []);
  const attributionData = useMemo(() => generateAttributionData(), []);

  // Key metrics (derived from frontier & weights)
  const optSharpe = useMemo(() => {
    const maxS = frontierPoints.reduce((a, b) => a.sharpe > b.sharpe ? a : b);
    return maxS.sharpe;
  }, [frontierPoints]);

  const optVol = useMemo(() => {
    const maxS = frontierPoints.reduce((a, b) => a.sharpe > b.sharpe ? a : b);
    return maxS.risk;
  }, [frontierPoints]);

  const optReturn = useMemo(() => {
    const maxS = frontierPoints.reduce((a, b) => a.sharpe > b.sharpe ? a : b);
    return maxS.ret;
  }, [frontierPoints]);

  const metrics = [
    { label: "Optimal Sharpe", value: optSharpe.toFixed(2), icon: Target, color: "text-violet-400", desc: "Risk-adj. return" },
    { label: "Portfolio Vol", value: `${(optVol * 100).toFixed(1)}%`, icon: Activity, color: "text-blue-400", desc: "Annual σ" },
    { label: "Expected Return", value: `${(optReturn * 100).toFixed(1)}%`, icon: TrendingUp, color: "text-emerald-400", desc: "Annualized" },
    { label: "Max Weight", value: `${(constraintMaxWeight * 100).toFixed(0)}%`, icon: Lock, color: "text-amber-400", desc: "Position limit" },
  ];

  const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-6">
      {/* Header */}
      <motion.div {...fadeIn} transition={{ duration: 0.4 }}>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-6 h-6 text-violet-400" />
              <h1 className="text-2xl font-bold tracking-tight">Quantitative Portfolio Optimization</h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Mean-variance efficient frontier, Black-Litterman views, and constraint-aware allocation
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-violet-400 border-violet-400/40 text-xs">Markowitz 1952</Badge>
            <Badge variant="outline" className="text-amber-400 border-amber-400/40 text-xs">Black-Litterman</Badge>
            <Badge variant="outline" className="text-emerald-400 border-emerald-400/40 text-xs">Live Optimization</Badge>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <Card key={i} className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${m.color}`} />
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                </div>
                <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{m.desc}</div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Main Tabs */}
      <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.1 }}>
        <Tabs defaultValue="frontier">
          <TabsList className="grid grid-cols-4 w-full max-w-xl mb-4">
            <TabsTrigger value="frontier">Efficient Frontier</TabsTrigger>
            <TabsTrigger value="bl">Black-Litterman</TabsTrigger>
            <TabsTrigger value="constraints">Constraints</TabsTrigger>
            <TabsTrigger value="attribution">Attribution</TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Efficient Frontier ── */}
          <TabsContent value="frontier" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <Card className="border-border bg-card lg:col-span-3">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-violet-400" />
                    Mean-Variance Efficient Frontier
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EfficientFrontierChart points={frontierPoints} />
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-xs text-muted-foreground">Min Variance</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="text-xs text-muted-foreground">Max Sharpe</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-pink-500" />
                      <span className="text-xs text-muted-foreground">Current Portfolio</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-violet-500" />
                      <span className="text-xs text-muted-foreground">High Sharpe (&gt;1.3)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    Correlation Heatmap
                  </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <CorrelationHeatmap matrix={correlationMatrix} />
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    {[
                      { label: ">0.7 Strong+", color: "rgba(239,68,68,0.85)" },
                      { label: "0.4–0.7", color: "rgba(251,146,60,0.75)" },
                      { label: "0.1–0.4", color: "rgba(234,179,8,0.60)" },
                      { label: "<-0.1 Neg.", color: "rgba(99,102,241,0.75)" },
                    ].map(l => (
                      <div key={l.label} className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm" style={{ background: l.color }} />
                        <span className="text-[9px] text-muted-foreground">{l.label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weight Comparison */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-emerald-400" />
                  Portfolio Weight Breakdown: Before vs After Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WeightComparisonChart />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab 2: Black-Litterman ── */}
          <TabsContent value="bl" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="border-border bg-card lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Brain className="w-4 h-4 text-amber-400" />
                    Investor Views &amp; Return Shifts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Confidence scale slider (simple buttons) */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-muted-foreground">View Confidence Scale:</span>
                    {[0.5, 0.75, 1.0, 1.25, 1.5].map(v => (
                      <Button key={v} size="sm" variant={blConfidenceScale === v ? "default" : "outline"}
                        className="h-6 px-2 text-xs"
                        onClick={() => setBlConfidenceScale(v)}>
                        {(v * 100).toFixed(0)}%
                      </Button>
                    ))}
                  </div>

                  {BL_VIEWS.map((view, i) => {
                    const enabled = viewsEnabled[i];
                    const scaledPost = view.priorReturn + (view.posteriorReturn - view.priorReturn) * blConfidenceScale;
                    const delta = scaledPost - view.priorReturn;
                    return (
                      <div key={i} className={`border rounded-lg p-3 transition-all ${enabled ? "border-border" : "border-border/30 opacity-40"}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0"
                              onClick={() => {
                                const nv = [...viewsEnabled];
                                nv[i] = !nv[i];
                                setViewsEnabled(nv);
                              }}>
                              {enabled ? <Unlock className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-muted-foreground" />}
                            </Button>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {view.assets.map(a => (
                                  <Badge key={a} variant="outline" className="text-[10px] px-1 py-0 text-violet-400 border-violet-400/40">{a}</Badge>
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">{view.direction}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-xs text-muted-foreground">Confidence</div>
                            <div className="text-sm font-semibold text-amber-400">{(view.confidence * blConfidenceScale).toFixed(0)}%</div>
                          </div>
                        </div>

                        {/* Return bar */}
                        <div className="mt-3 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground w-20">Prior Return</span>
                            <div className="flex-1 bg-muted/30 rounded-full h-2">
                              <div className="h-2 rounded-full bg-slate-500" style={{ width: `${(view.priorReturn / 0.20) * 100}%` }} />
                            </div>
                            <span className="text-[10px] text-muted-foreground w-10 text-right">{(view.priorReturn * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground w-20">Posterior</span>
                            <div className="flex-1 bg-muted/30 rounded-full h-2">
                              <div className="h-2 rounded-full bg-violet-500" style={{ width: `${(scaledPost / 0.20) * 100}%` }} />
                            </div>
                            <span className="text-[10px] w-10 text-right font-semibold" style={{ color: delta >= 0 ? "#10b981" : "#ef4444" }}>
                              {delta >= 0 ? "+" : ""}{(delta * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-400" />
                      BL Model Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs text-muted-foreground">
                    <p>Black-Litterman combines <span className="text-foreground font-medium">market equilibrium returns</span> (implied by CAPM) with <span className="text-foreground font-medium">investor views</span> via Bayesian updating.</p>
                    <div className="bg-muted/30 rounded p-2 font-mono text-[10px] leading-relaxed">
                      μ_BL = [(τΣ)⁻¹ + Pᵀ Ω⁻¹ P]⁻¹<br />
                      × [(τΣ)⁻¹ Π + Pᵀ Ω⁻¹ Q]
                    </div>
                    <ul className="space-y-1">
                      <li><span className="text-foreground">Π</span> — equilibrium returns from market caps</li>
                      <li><span className="text-foreground">P</span> — pick matrix (which assets each view covers)</li>
                      <li><span className="text-foreground">Q</span> — vector of view returns</li>
                      <li><span className="text-foreground">Ω</span> — uncertainty diagonal of views</li>
                      <li><span className="text-foreground">τ</span> — scaling parameter (~1/T)</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      BL Return Estimates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {ASSETS.map((a) => {
                        const delta = a.blReturn - a.expReturn;
                        return (
                          <div key={a.ticker} className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold w-8" style={{ color: a.color }}>{a.ticker}</span>
                            <div className="flex-1 bg-muted/30 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full" style={{ width: `${(a.blReturn / 0.20) * 100}%`, background: a.color }} />
                            </div>
                            <span className="text-[10px] text-muted-foreground w-8 text-right">{(a.blReturn * 100).toFixed(1)}%</span>
                            <span className={`text-[10px] w-8 text-right font-semibold ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {delta >= 0 ? "+" : ""}{(delta * 100).toFixed(1)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ── Tab 3: Constraints ── */}
          <TabsContent value="constraints" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    Constraint Sensitivity: Sharpe vs Max Weight
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Interactive constraint slider */}
                  <div className="mb-4 flex items-center gap-3 flex-wrap">
                    <span className="text-xs text-muted-foreground">Max Position Limit:</span>
                    {[0.10, 0.15, 0.20, 0.25, 0.30, 0.35].map(v => (
                      <Button key={v} size="sm"
                        variant={constraintMaxWeight === v ? "default" : "outline"}
                        className="h-6 px-2 text-xs"
                        onClick={() => setConstraintMaxWeight(v)}>
                        {(v * 100).toFixed(0)}%
                      </Button>
                    ))}
                  </div>
                  <ConstraintChart points={constraintPoints} />
                  <p className="text-xs text-muted-foreground mt-2">
                    Overly tight constraints (&lt;10%) force suboptimal diversification, reducing Sharpe.
                    Very loose constraints (&gt;30%) allow concentration risk.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    Constraint Types &amp; Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      name: "Long-Only",
                      desc: "w_i ≥ 0 for all assets",
                      impact: "Prevents short selling; eliminates some efficient portfolios",
                      sharpeImpact: -0.12,
                      color: "#6366f1",
                    },
                    {
                      name: "Max Weight",
                      desc: `w_i ≤ ${(constraintMaxWeight * 100).toFixed(0)}% per asset`,
                      impact: "Limits concentration; forces diversification",
                      sharpeImpact: constraintMaxWeight < 0.15 ? -0.22 : -0.05,
                      color: "#f59e0b",
                    },
                    {
                      name: "Sector Cap",
                      desc: "Σ sector weights ≤ 40%",
                      impact: "Reduces sector-specific risk and benchmark tracking error",
                      sharpeImpact: -0.08,
                      color: "#10b981",
                    },
                    {
                      name: "Turnover Limit",
                      desc: "Σ |Δw_i| ≤ 20% per rebalance",
                      impact: "Reduces transaction costs; may delay optimal allocation",
                      sharpeImpact: -0.04,
                      color: "#ec4899",
                    },
                    {
                      name: "ESG Screen",
                      desc: "ESG score ≥ 60 required",
                      impact: "Excludes low-ESG assets; may reduce universe efficiency",
                      sharpeImpact: -0.09,
                      color: "#06b6d4",
                    },
                    {
                      name: "Benchmark Relative",
                      desc: "|w_i - w_bench| ≤ 5%",
                      impact: "Controls active share; suitable for index-relative mandates",
                      sharpeImpact: -0.18,
                      color: "#8b5cf6",
                    },
                  ].map((c, i) => (
                    <div key={i} className="border border-border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-semibold" style={{ color: c.color }}>{c.name}</span>
                            <code className="text-[10px] bg-muted/40 px-1 rounded text-muted-foreground">{c.desc}</code>
                          </div>
                          <p className="text-[10px] text-muted-foreground">{c.impact}</p>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <div className="text-[10px] text-muted-foreground">Sharpe Cost</div>
                          <div className="text-xs font-semibold text-red-400">{c.sharpeImpact.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Tab 4: Attribution ── */}
          <TabsContent value="attribution" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-violet-400" />
                    Brinson-Hood-Beebower Attribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AttributionChart data={attributionData} />
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {attributionData.map((d) => (
                      <div key={d.label} className="bg-muted/20 rounded p-2 text-center">
                        <div className="text-lg font-bold" style={{ color: d.value >= 0 ? d.color : "#ef4444" }}>
                          {d.value >= 0 ? "+" : ""}{d.value.toFixed(1)}%
                        </div>
                        <div className="text-[10px] text-muted-foreground">{d.label}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-emerald-400" />
                      Optimization Solver Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    {[
                      { label: "Solver", value: "Sequential QP (Interior Point)", color: "text-foreground" },
                      { label: "Objective", value: "Max Sharpe Ratio", color: "text-violet-400" },
                      { label: "Covariance Est.", value: "Ledoit-Wolf Shrinkage", color: "text-blue-400" },
                      { label: "Rebalance Freq.", value: "Monthly + Threshold 2%", color: "text-amber-400" },
                      { label: "Lookback", value: "3 Years (756 trading days)", color: "text-foreground" },
                      { label: "Risk-Free Rate", value: "4.50% (3M T-Bill)", color: "text-emerald-400" },
                      { label: "Constraints", value: "Long-only, 20% max weight", color: "text-foreground" },
                      { label: "Iterations", value: "247 (converged)", color: "text-emerald-400" },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-border/30 pb-1">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className={`font-medium ${row.color}`}>{row.value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="w-4 h-4 text-amber-400" />
                      Risk Decomposition
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { label: "Systematic (β) Risk", pct: 62, color: "#6366f1" },
                      { label: "Idiosyncratic Risk", pct: 24, color: "#f59e0b" },
                      { label: "Factor Exposure", pct: 10, color: "#10b981" },
                      { label: "Residual", pct: 4, color: "#94a3b8" },
                    ].map((r) => (
                      <div key={r.label} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{r.label}</span>
                          <span style={{ color: r.color }} className="font-semibold">{r.pct}%</span>
                        </div>
                        <div className="w-full bg-muted/30 rounded-full h-2">
                          <div className="h-2 rounded-full" style={{ width: `${r.pct}%`, background: r.color }} />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

// suppress unused import warning — Brain is used in BL tab JSX
function Brain({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  );
}
