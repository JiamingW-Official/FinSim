"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Shield,
  BarChart3,
  PieChart,
  Activity,
  Lock,
  Unlock,
  RefreshCw,
  Zap,
  Calendar,
  Info,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── mulberry32 PRNG (seed=1618) ───────────────────────────────────────────────

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtPct(n: number, d = 1): string {
  return `${n >= 0 ? "" : ""}${n.toFixed(d)}%`;
}

function fmtK(n: number): string {
  if (Math.abs(n) >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function normalCDF(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const t = 1 / (1 + p * Math.abs(x) / Math.SQRT2);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x / 2);
  return 0.5 * (1 + sign * y);
}

// ── Asset Classes ─────────────────────────────────────────────────────────────

interface AssetClass {
  id: string;
  name: string;
  shortName: string;
  expectedReturn: number; // %
  volatility: number;     // %
  beta: number;
  sharpe: number;
  color: string;
  category: "equity" | "fixed" | "alternative" | "cash";
}

const ASSET_CLASSES: AssetClass[] = [
  { id: "us_large",  name: "US Large Cap Equities",    shortName: "US Large",    expectedReturn: 10.5, volatility: 15.0, beta: 1.0,  sharpe: 0.70, color: "#6366f1", category: "equity" },
  { id: "us_small",  name: "US Small Cap",             shortName: "US Small",    expectedReturn: 11.2, volatility: 20.0, beta: 1.1,  sharpe: 0.56, color: "#8b5cf6", category: "equity" },
  { id: "intl_dev",  name: "International Developed",  shortName: "Intl Dev",    expectedReturn: 8.5,  volatility: 16.0, beta: 0.8,  sharpe: 0.53, color: "#a78bfa", category: "equity" },
  { id: "em",        name: "Emerging Markets",         shortName: "Emerg Mkts",  expectedReturn: 9.5,  volatility: 22.0, beta: 0.9,  sharpe: 0.43, color: "#c4b5fd", category: "equity" },
  { id: "us_bonds",  name: "US Aggregate Bonds",       shortName: "US Bonds",    expectedReturn: 4.5,  volatility: 6.0,  beta: -0.1, sharpe: 0.75, color: "#3b82f6", category: "fixed" },
  { id: "tips",      name: "TIPS",                     shortName: "TIPS",        expectedReturn: 4.0,  volatility: 7.0,  beta: -0.1, sharpe: 0.57, color: "#60a5fa", category: "fixed" },
  { id: "hy_bonds",  name: "High Yield Bonds",         shortName: "High Yield",  expectedReturn: 6.5,  volatility: 10.0, beta: 0.4,  sharpe: 0.65, color: "#93c5fd", category: "fixed" },
  { id: "reits",     name: "REITs",                    shortName: "REITs",       expectedReturn: 8.0,  volatility: 18.0, beta: 0.7,  sharpe: 0.44, color: "#10b981", category: "alternative" },
  { id: "commodities",name: "Commodities",             shortName: "Commodities", expectedReturn: 5.5,  volatility: 20.0, beta: 0.0,  sharpe: 0.28, color: "#f59e0b", category: "alternative" },
  { id: "gold",      name: "Gold",                     shortName: "Gold",        expectedReturn: 6.0,  volatility: 15.0, beta: -0.2, sharpe: 0.40, color: "#fbbf24", category: "alternative" },
  { id: "private_eq",name: "Private Equity",           shortName: "Private Eq",  expectedReturn: 12.0, volatility: 25.0, beta: 0.9,  sharpe: 0.48, color: "#ef4444", category: "alternative" },
  { id: "cash",      name: "Cash / T-Bills",           shortName: "Cash",        expectedReturn: 5.25, volatility: 0.5,  beta: 0.0,  sharpe: 1.00, color: "#6b7280", category: "cash" },
];

// ── 12×12 Correlation Matrix ──────────────────────────────────────────────────
// Order matches ASSET_CLASSES array

const CORRELATIONS: number[][] = [
  // us_large us_small intl_dev  em    us_bonds tips   hy_bonds reits  commod gold  priv_eq  cash
  [1.00, 0.82, 0.75, 0.65,  -0.10, -0.05,  0.35,  0.65,  0.10,  -0.05, 0.80,   0.00], // us_large
  [0.82, 1.00, 0.68, 0.60,  -0.08, -0.04,  0.38,  0.60,  0.12,  -0.03, 0.75,   0.00], // us_small
  [0.75, 0.68, 1.00, 0.75,  -0.05, -0.02,  0.30,  0.55,  0.15,  0.02,  0.70,   0.00], // intl_dev
  [0.65, 0.60, 0.75, 1.00,  -0.05, -0.01,  0.35,  0.50,  0.20,  0.05,  0.65,   0.00], // em
  [-0.10,-0.08,-0.05,-0.05,  1.00,  0.85,  0.25, -0.05, -0.10,  0.10, -0.08,   0.05], // us_bonds
  [-0.05,-0.04,-0.02,-0.01,  0.85,  1.00,  0.20, -0.02, -0.05,  0.15, -0.05,   0.05], // tips
  [0.35, 0.38, 0.30, 0.35,   0.25,  0.20,  1.00,  0.40,  0.05,  0.00,  0.40,   0.00], // hy_bonds
  [0.65, 0.60, 0.55, 0.50,  -0.05, -0.02,  0.40,  1.00,  0.10,  0.05,  0.60,   0.00], // reits
  [0.10, 0.12, 0.15, 0.20,  -0.10, -0.05,  0.05,  0.10,  1.00,  0.30,  0.10,  -0.02], // commodities
  [-0.05,-0.03,0.02,  0.05,   0.10,  0.15,  0.00,  0.05,  0.30,  1.00, -0.02,   0.00], // gold
  [0.80, 0.75, 0.70, 0.65,  -0.08, -0.05,  0.40,  0.60,  0.10, -0.02,  1.00,   0.00], // private_eq
  [0.00, 0.00, 0.00, 0.00,   0.05,  0.05,  0.00,  0.00, -0.02,  0.00,  0.00,   1.00], // cash
];

// ── Portfolio Metrics Computation ─────────────────────────────────────────────

function computePortfolioMetrics(weights: number[]) {
  const w = weights.map(v => v / 100);
  const n = ASSET_CLASSES.length;

  // Expected return
  let expectedReturn = 0;
  for (let i = 0; i < n; i++) {
    expectedReturn += w[i] * ASSET_CLASSES[i].expectedReturn;
  }

  // Portfolio variance via covariance matrix
  let variance = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const cov = CORRELATIONS[i][j] * (ASSET_CLASSES[i].volatility / 100) * (ASSET_CLASSES[j].volatility / 100);
      variance += w[i] * w[j] * cov;
    }
  }
  const volatility = Math.sqrt(variance) * 100;

  // Beta
  let beta = 0;
  for (let i = 0; i < n; i++) {
    beta += w[i] * ASSET_CLASSES[i].beta;
  }

  // Sharpe (using 5.25% risk-free)
  const rf = 5.25;
  const sharpe = volatility > 0 ? (expectedReturn - rf) / volatility : 0;

  // Max drawdown estimate: ~2.5× annual vol (rule of thumb)
  const maxDrawdown = volatility * 2.5;

  return { expectedReturn, volatility, beta, sharpe, maxDrawdown };
}

// ── Preset Portfolios ─────────────────────────────────────────────────────────

interface Preset {
  name: string;
  description: string;
  weights: number[]; // length 12, matching ASSET_CLASSES order
}

const PRESETS: Preset[] = [
  {
    name: "60/40",
    description: "Classic balanced: 60% stocks, 40% bonds",
    weights: [36, 12, 8, 4, 24, 8, 8, 0, 0, 0, 0, 0],
  },
  {
    name: "All-Weather",
    description: "Ray Dalio's all-season portfolio",
    weights: [30, 0, 0, 0, 40, 15, 0, 0, 7.5, 7.5, 0, 0],
  },
  {
    name: "Risk Parity",
    description: "Equal risk contribution across asset classes",
    weights: [12, 6, 8, 5, 22, 12, 10, 8, 7, 6, 0, 4],
  },
  {
    name: "Growth",
    description: "Aggressive equity-heavy growth portfolio",
    weights: [45, 15, 15, 10, 5, 0, 5, 5, 0, 0, 0, 0],
  },
  {
    name: "Conservative",
    description: "Capital preservation with modest growth",
    weights: [15, 5, 5, 0, 30, 15, 10, 5, 0, 5, 0, 10],
  },
  {
    name: "Endowment",
    description: "Yale-style endowment with alternatives",
    weights: [15, 5, 10, 10, 5, 0, 5, 10, 5, 5, 20, 10],
  },
];

// ── Efficient Frontier Points (precomputed) ───────────────────────────────────

function generateEfficientFrontier(): { risk: number; ret: number }[] {
  const points: { risk: number; ret: number }[] = [];
  // Parameterize along risk levels 3% to 20%
  for (let risk = 3; risk <= 20; risk += 0.5) {
    // Approximate efficient return at each risk level
    const rf = 5.25;
    const sharpeMax = 0.75;
    const ret = rf + sharpeMax * risk;
    points.push({ risk: Math.min(risk, 20), ret: Math.min(ret, 15) });
  }
  return points;
}

const FRONTIER_POINTS = generateEfficientFrontier();

// ── Tab 1: Asset Class Overview ───────────────────────────────────────────────

function AssetClassOverview() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", "equity", "fixed", "alternative", "cash"];

  const filtered = selectedCategory === "all"
    ? ASSET_CLASSES
    : ASSET_CLASSES.filter(a => a.category === selectedCategory);

  // SVG scatter plot dimensions
  const W = 520, H = 320, pad = { top: 20, right: 20, bottom: 50, left: 60 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const minRisk = 0, maxRisk = 28;
  const minRet = 3, maxRet = 14;

  const toX = (risk: number) => pad.left + (risk - minRisk) / (maxRisk - minRisk) * plotW;
  const toY = (ret: number) => pad.top + (1 - (ret - minRet) / (maxRet - minRet)) * plotH;

  // Correlation heatmap color
  function corrColor(v: number): string {
    if (v >= 0.7) return "#ef4444";
    if (v >= 0.4) return "#f97316";
    if (v >= 0.1) return "#fbbf24";
    if (v >= -0.1) return "#6b7280";
    if (v >= -0.3) return "#60a5fa";
    return "#3b82f6";
  }

  return (
    <div className="space-y-4">
      {/* Asset Class Table */}
      <Card className="bg-card border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Asset Class Characteristics</h3>
          <div className="flex gap-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-2 py-1 rounded text-xs text-muted-foreground capitalize transition-colors",
                  selectedCategory === cat
                    ? "bg-indigo-600 text-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 text-muted-foreground font-medium">Asset Class</th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium">Exp. Return</th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium">Volatility</th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium">Beta</th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium">Sharpe</th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium w-32">Risk/Return</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((asset) => (
                <motion.tr
                  key={asset.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onMouseEnter={() => setHovered(asset.id)}
                  onMouseLeave={() => setHovered(null)}
                  className={cn(
                    "border-b border-border/20 transition-colors cursor-default",
                    hovered === asset.id ? "bg-muted/60" : "hover:bg-muted/30"
                  )}
                >
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: asset.color }} />
                      <span className="text-foreground">{asset.name}</span>
                      <Badge className="text-xs px-1 py-0 capitalize" style={{ background: asset.color + "22", color: asset.color, borderColor: asset.color + "44" }}>
                        {asset.category}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-right text-emerald-400 font-medium">{fmtPct(asset.expectedReturn)}</td>
                  <td className="py-2 px-2 text-right text-amber-400">{fmtPct(asset.volatility)}</td>
                  <td className="py-2 px-2 text-right">
                    <span className={cn("font-medium", asset.beta < 0 ? "text-primary" : asset.beta < 0.3 ? "text-muted-foreground" : "text-foreground")}>
                      {asset.beta.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right">
                    <span className={cn("font-medium", asset.sharpe >= 0.65 ? "text-emerald-400" : asset.sharpe >= 0.45 ? "text-amber-400" : "text-red-400")}>
                      {asset.sharpe.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-1">
                      <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.min(asset.sharpe / 1.2 * 100, 100)}%`, background: asset.color }}
                        />
                      </div>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Scatter Plot */}
      <Card className="bg-card border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Return vs. Risk (Efficient Frontier)</h3>
        <div className="overflow-x-auto">
          <svg width={W} height={H} className="text-muted-foreground">
            {/* Grid lines */}
            {[4, 6, 8, 10, 12, 14].map(ret => (
              <line key={ret} x1={pad.left} y1={toY(ret)} x2={W - pad.right} y2={toY(ret)} stroke="#262626" strokeWidth={1} />
            ))}
            {[0, 5, 10, 15, 20, 25].map(risk => (
              <line key={risk} x1={toX(risk)} y1={pad.top} x2={toX(risk)} y2={H - pad.bottom} stroke="#262626" strokeWidth={1} />
            ))}

            {/* Efficient Frontier curve */}
            <polyline
              points={FRONTIER_POINTS.map(p => `${toX(p.risk)},${toY(p.ret)}`).join(" ")}
              fill="none"
              stroke="#6366f1"
              strokeWidth={2}
              strokeDasharray="6,3"
              opacity={0.5}
            />

            {/* Frontier label */}
            <text x={toX(16)} y={toY(FRONTIER_POINTS[FRONTIER_POINTS.length - 1].ret) - 8} fill="#6366f1" fontSize={10} opacity={0.7}>
              Efficient Frontier
            </text>

            {/* Asset class dots */}
            {ASSET_CLASSES.map(asset => {
              const cx = toX(asset.volatility);
              const cy = toY(asset.expectedReturn);
              const isHov = hovered === asset.id;
              return (
                <g key={asset.id} onMouseEnter={() => setHovered(asset.id)} onMouseLeave={() => setHovered(null)} style={{ cursor: "default" }}>
                  <circle cx={cx} cy={cy} r={isHov ? 9 : 6} fill={asset.color} opacity={isHov ? 1 : 0.8} />
                  {isHov && (
                    <g>
                      <rect x={cx + 10} y={cy - 22} width={90} height={36} rx={4} fill="#1c1c1c" stroke={asset.color} strokeWidth={0.5} />
                      <text x={cx + 14} y={cy - 8} fill="white" fontSize={10} fontWeight="600">{asset.shortName}</text>
                      <text x={cx + 14} y={cy + 6} fill="#9ca3af" fontSize={9}>
                        Ret: {fmtPct(asset.expectedReturn)} | Vol: {fmtPct(asset.volatility)}
                      </text>
                    </g>
                  )}
                  {!isHov && (
                    <text x={cx} y={cy - 10} textAnchor="middle" fill={asset.color} fontSize={9} opacity={0.8}>
                      {asset.shortName}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Axes */}
            <line x1={pad.left} y1={pad.top} x2={pad.left} y2={H - pad.bottom} stroke="#404040" strokeWidth={1} />
            <line x1={pad.left} y1={H - pad.bottom} x2={W - pad.right} y2={H - pad.bottom} stroke="#404040" strokeWidth={1} />

            {/* Y-axis labels */}
            {[4, 6, 8, 10, 12, 14].map(ret => (
              <text key={ret} x={pad.left - 8} y={toY(ret) + 4} textAnchor="end" fill="#6b7280" fontSize={10}>
                {ret}%
              </text>
            ))}
            {/* X-axis labels */}
            {[0, 5, 10, 15, 20, 25].map(risk => (
              <text key={risk} x={toX(risk)} y={H - pad.bottom + 16} textAnchor="middle" fill="#6b7280" fontSize={10}>
                {risk}%
              </text>
            ))}

            {/* Axis titles */}
            <text x={W / 2} y={H - 4} textAnchor="middle" fill="#6b7280" fontSize={11}>Volatility (Risk)</text>
            <text x={14} y={H / 2} textAnchor="middle" fill="#6b7280" fontSize={11} transform={`rotate(-90, 14, ${H / 2})`}>
              Expected Return
            </text>
          </svg>
        </div>
      </Card>

      {/* Correlation Matrix */}
      <Card className="bg-card border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Correlation Matrix</h3>
        <p className="text-xs text-muted-foreground mb-4">Red = high positive correlation, Blue = negative (diversifying)</p>
        <div className="overflow-x-auto">
          <svg width={600} height={360}>
            {CORRELATIONS.map((row, i) =>
              row.map((val, j) => {
                const cellSize = 44;
                const labelW = 72;
                const x = labelW + j * cellSize;
                const y = 24 + i * cellSize;
                return (
                  <g key={`${i}-${j}`}>
                    <rect x={x} y={y} width={cellSize - 1} height={cellSize - 1} fill={corrColor(val)} opacity={0.8} rx={2} />
                    <text x={x + cellSize / 2} y={y + cellSize / 2 + 4} textAnchor="middle" fill="white" fontSize={9} fontWeight="600">
                      {val.toFixed(2)}
                    </text>
                  </g>
                );
              })
            )}
            {/* Row labels */}
            {ASSET_CLASSES.map((a, i) => (
              <text key={a.id} x={68} y={24 + i * 44 + 26} textAnchor="end" fill="#9ca3af" fontSize={10}>
                {a.shortName}
              </text>
            ))}
            {/* Col labels */}
            {ASSET_CLASSES.map((a, j) => (
              <text
                key={a.id + "_col"}
                x={72 + j * 44 + 22}
                y={18}
                textAnchor="middle"
                fill="#9ca3af"
                fontSize={9}
                transform={`rotate(-40, ${72 + j * 44 + 22}, 18)`}
              >
                {a.shortName}
              </text>
            ))}
            {/* Legend */}
            {[-0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8, 1.0].map((v, i) => (
              <g key={v}>
                <rect x={72 + i * 60} y={320} width={56} height={14} fill={corrColor(v)} opacity={0.8} rx={2} />
                <text x={72 + i * 60 + 28} y={348} textAnchor="middle" fill="#6b7280" fontSize={9}>{v.toFixed(1)}</text>
              </g>
            ))}
          </svg>
        </div>
      </Card>
    </div>
  );
}

// ── Tab 2: Portfolio Builder ───────────────────────────────────────────────────

function PortfolioBuilder() {
  const [weights, setWeights] = useState<number[]>(PRESETS[0].weights.map(w => w));
  const [locked, setLocked] = useState<boolean[]>(new Array(12).fill(false));
  const [activePreset, setActivePreset] = useState<string>("60/40");

  const total = weights.reduce((s, w) => s + w, 0);
  const metrics = useMemo(() => computePortfolioMetrics(weights), [weights]);

  const applyPreset = (preset: Preset) => {
    setWeights([...preset.weights]);
    setLocked(new Array(12).fill(false));
    setActivePreset(preset.name);
  };

  const normalize = () => {
    const lockedTotal = weights.reduce((s, w, i) => s + (locked[i] ? w : 0), 0);
    const freeTotal = weights.reduce((s, w, i) => s + (locked[i] ? 0 : w), 0);
    const target = 100 - lockedTotal;
    if (freeTotal === 0) return;
    const scale = target / freeTotal;
    setWeights(prev => prev.map((w, i) => locked[i] ? w : Math.round(w * scale * 10) / 10));
  };

  const handleWeightChange = (idx: number, newVal: number) => {
    const old = weights[idx];
    const diff = newVal - old;
    const newWeights = [...weights];
    newWeights[idx] = newVal;

    // Adjust other unlocked weights proportionally
    const freeIndices = weights.map((_, i) => i).filter(i => i !== idx && !locked[i]);
    const freeTotal = freeIndices.reduce((s, i) => s + weights[i], 0);
    if (freeTotal > 0 && diff !== 0) {
      const scale = 1 - diff / freeTotal;
      freeIndices.forEach(i => {
        newWeights[i] = Math.max(0, Math.round(weights[i] * scale * 10) / 10);
      });
    }
    setWeights(newWeights);
    setActivePreset("");
  };

  // Donut chart
  const DONUT_R = 70, DONUT_INNER = 44;
  let cumAngle = -Math.PI / 2;
  const slices = weights.map((w, i) => {
    const angle = (w / 100) * 2 * Math.PI;
    const startAngle = cumAngle;
    cumAngle += angle;
    const endAngle = cumAngle;
    const asset = ASSET_CLASSES[i];
    const x1 = DONUT_R * Math.cos(startAngle);
    const y1 = DONUT_R * Math.sin(startAngle);
    const x2 = DONUT_R * Math.cos(endAngle);
    const y2 = DONUT_R * Math.sin(endAngle);
    const xi1 = DONUT_INNER * Math.cos(startAngle);
    const yi1 = DONUT_INNER * Math.sin(startAngle);
    const xi2 = DONUT_INNER * Math.cos(endAngle);
    const yi2 = DONUT_INNER * Math.sin(endAngle);
    const large = angle > Math.PI ? 1 : 0;
    const path = w > 0.5 ? `M ${x1} ${y1} A ${DONUT_R} ${DONUT_R} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${DONUT_INNER} ${DONUT_INNER} 0 ${large} 0 ${xi1} ${yi1} Z` : "";
    return { path, color: asset.color, name: asset.shortName, weight: w };
  });

  // Efficient frontier SVG
  const EW = 340, EH = 200, ePad = { top: 15, right: 15, bottom: 35, left: 45 };
  const ePlotW = EW - ePad.left - ePad.right;
  const ePlotH = EH - ePad.top - ePad.bottom;
  const eMinRisk = 0, eMaxRisk = 26, eMinRet = 3, eMaxRet = 14;
  const eX = (r: number) => ePad.left + (r - eMinRisk) / (eMaxRisk - eMinRisk) * ePlotW;
  const eY = (r: number) => ePad.top + (1 - (r - eMinRet) / (eMaxRet - eMinRet)) * ePlotH;

  const totalOk = Math.abs(total - 100) < 0.5;

  return (
    <div className="space-y-5">
      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map(p => (
          <Button
            key={p.name}
            size="sm"
            variant="outline"
            onClick={() => applyPreset(p)}
            className={cn(
              "text-xs text-muted-foreground border-border",
              activePreset === p.name
                ? "bg-indigo-600 border-indigo-500 text-foreground hover:bg-indigo-700"
                : "bg-muted text-muted-foreground hover:bg-muted"
            )}
          >
            {p.name}
          </Button>
        ))}
        <Button
          size="sm"
          variant="outline"
          onClick={normalize}
          className="text-xs border-border bg-muted text-muted-foreground hover:bg-muted ml-auto"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Normalize to 100%
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sliders */}
        <div className="lg:col-span-2 space-y-3">
          <Card className="bg-card border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">Allocation Sliders</h3>
              <Badge className={cn("text-xs", totalOk ? "bg-emerald-900/50 text-emerald-400 border-emerald-800" : "bg-red-900/50 text-red-400 border-red-800")}>
                Total: {total.toFixed(1)}%
              </Badge>
            </div>
            <div className="space-y-3">
              {ASSET_CLASSES.map((asset, i) => (
                <div key={asset.id} className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const next = [...locked];
                      next[i] = !next[i];
                      setLocked(next);
                    }}
                    className="flex-shrink-0 text-muted-foreground hover:text-muted-foreground transition-colors"
                    title={locked[i] ? "Unlock" : "Lock"}
                  >
                    {locked[i] ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3" />}
                  </button>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: asset.color }} />
                  <span className="text-xs text-muted-foreground w-32 flex-shrink-0">{asset.shortName}</span>
                  <div className="flex-1">
                    <Slider
                      value={[weights[i]]}
                      onValueChange={([v]) => !locked[i] && handleWeightChange(i, v)}
                      min={0}
                      max={60}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground w-10 text-right flex-shrink-0">
                    {weights[i].toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right panel: donut + metrics */}
        <div className="space-y-4">
          {/* Donut */}
          <Card className="bg-card border-border p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">Allocation</h3>
            <div className="flex justify-center">
              <svg width={160} height={160} viewBox="-80 -80 160 160">
                {slices.map((s, i) => (
                  <path key={i} d={s.path} fill={s.color} opacity={0.85} />
                ))}
                <text x={0} y={-6} textAnchor="middle" fill="white" fontSize={11} fontWeight="700">Portfolio</text>
                <text x={0} y={10} textAnchor="middle" fill="#9ca3af" fontSize={9}>
                  {metrics.expectedReturn.toFixed(1)}% exp
                </text>
              </svg>
            </div>
            {/* Legend (top weights only) */}
            <div className="mt-2 space-y-1">
              {slices
                .map((s, i) => ({ ...s, i }))
                .filter(s => s.weight >= 2)
                .sort((a, b) => b.weight - a.weight)
                .slice(0, 6)
                .map(s => (
                  <div key={s.i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    <span className="text-muted-foreground flex-1">{s.name}</span>
                    <span className="text-foreground">{s.weight.toFixed(1)}%</span>
                  </div>
                ))}
            </div>
          </Card>

          {/* Metrics */}
          <Card className="bg-card border-border p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">Portfolio Metrics</h3>
            <div className="space-y-3">
              {[
                { label: "Expected Return", value: fmtPct(metrics.expectedReturn), color: "text-emerald-400", icon: TrendingUp },
                { label: "Volatility", value: fmtPct(metrics.volatility), color: "text-amber-400", icon: Activity },
                { label: "Sharpe Ratio", value: metrics.sharpe.toFixed(2), color: metrics.sharpe >= 0.5 ? "text-emerald-400" : "text-amber-400", icon: Zap },
                { label: "Max Drawdown", value: `-${fmtPct(metrics.maxDrawdown)}`, color: "text-red-400", icon: TrendingDown },
                { label: "Beta", value: metrics.beta.toFixed(2), color: "text-primary", icon: BarChart3 },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                  <span className={cn("text-sm font-medium", item.color)}>{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Efficient Frontier overlay */}
      <Card className="bg-card border-border p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">Your Portfolio on the Efficient Frontier</h3>
        <svg width={EW} height={EH}>
          {/* Grid */}
          {[4, 6, 8, 10, 12, 14].map(r => (
            <line key={r} x1={ePad.left} y1={eY(r)} x2={EW - ePad.right} y2={eY(r)} stroke="#262626" strokeWidth={1} />
          ))}
          {[0, 5, 10, 15, 20, 25].map(r => (
            <line key={r} x1={eX(r)} y1={ePad.top} x2={eX(r)} y2={EH - ePad.bottom} stroke="#262626" strokeWidth={1} />
          ))}

          {/* Frontier */}
          <polyline
            points={FRONTIER_POINTS.map(p => `${eX(p.risk)},${eY(p.ret)}`).join(" ")}
            fill="none"
            stroke="#6366f1"
            strokeWidth={2}
            strokeDasharray="5,3"
            opacity={0.6}
          />

          {/* All asset classes (small dots) */}
          {ASSET_CLASSES.map(a => (
            <circle key={a.id} cx={eX(a.volatility)} cy={eY(a.expectedReturn)} r={3} fill={a.color} opacity={0.4} />
          ))}

          {/* Your portfolio */}
          <circle cx={eX(metrics.volatility)} cy={eY(metrics.expectedReturn)} r={8} fill="#ffffff" opacity={0.95} />
          <circle cx={eX(metrics.volatility)} cy={eY(metrics.expectedReturn)} r={10} fill="none" stroke="#ffffff" strokeWidth={1.5} opacity={0.4} />
          <text x={eX(metrics.volatility)} y={eY(metrics.expectedReturn) - 14} textAnchor="middle" fill="white" fontSize={10} fontWeight="700">
            Your Portfolio
          </text>

          {/* Axes */}
          <line x1={ePad.left} y1={ePad.top} x2={ePad.left} y2={EH - ePad.bottom} stroke="#404040" />
          <line x1={ePad.left} y1={EH - ePad.bottom} x2={EW - ePad.right} y2={EH - ePad.bottom} stroke="#404040" />

          {[4, 6, 8, 10, 12, 14].map(r => (
            <text key={r} x={ePad.left - 6} y={eY(r) + 4} textAnchor="end" fill="#6b7280" fontSize={9}>{r}%</text>
          ))}
          {[0, 5, 10, 15, 20, 25].map(r => (
            <text key={r} x={eX(r)} y={EH - ePad.bottom + 14} textAnchor="middle" fill="#6b7280" fontSize={9}>{r}%</text>
          ))}
          <text x={EW / 2} y={EH - 2} textAnchor="middle" fill="#6b7280" fontSize={10}>Volatility</text>
          <text x={12} y={EH / 2} textAnchor="middle" fill="#6b7280" fontSize={10} transform={`rotate(-90, 12, ${EH / 2})`}>Return</text>
        </svg>
      </Card>
    </div>
  );
}

// ── Tab 3: Return Scenarios ───────────────────────────────────────────────────

const HISTORICAL_SCENARIOS = [
  { name: "GFC 2008-09",    spReturn: -51.0, assetReturns: [-50, -55, -53, -60, 5.2, 8.5, -28, -45, -35, 5.5, -60, 1.2] },
  { name: "COVID Crash '20",spReturn: -33.8, assetReturns: [-33, -38, -31, -32, 8.0, 10.2,-14, -30, -25, 14.0,-40, 0.5] },
  { name: "70s Stagflation", spReturn: -43.0, assetReturns: [-43, -48, -35, -40, -15, 20, -20, -30, 85, 180, -45, 5.5] },
  { name: "Dot-com '00-02",  spReturn: -49.0, assetReturns: [-48, -55, -44, -40, 22, 15, 5, 30, 10, 15, -65, 3.0] },
  { name: "Japan '90-00",    spReturn: -62.0, assetReturns: [-5, -6, -62, -20, 10, 8, 5, 5, 5, 8, -15, 4.0] },
];

function ReturnScenarios({ weights }: { weights: number[] }) {
  const [running, setRunning] = useState(false);
  const [simDone, setSimDone] = useState(false);

  const metrics = useMemo(() => computePortfolioMetrics(weights), [weights]);

  // Monte Carlo simulation
  const mcResult = useMemo(() => {
    const rng = mulberry32(1618);
    const SCENARIOS = 500;
    const YEARS = 30;
    const START = 100_000;
    const mu = metrics.expectedReturn / 100;
    const sigma = metrics.volatility / 100;

    const endValues: number[][] = [];
    for (let s = 0; s < SCENARIOS; s++) {
      const path: number[] = [START];
      let val = START;
      for (let y = 0; y < YEARS; y++) {
        // Log-normal return
        const z = (rng() + rng() + rng() + rng() + rng() + rng() - 3) / Math.sqrt(3); // approx normal
        const annualReturn = Math.exp((mu - 0.5 * sigma * sigma) + sigma * z) - 1;
        val *= (1 + annualReturn);
        path.push(val);
      }
      endValues.push(path);
    }

    // Sort by ending value
    const sorted = endValues.slice().sort((a, b) => a[YEARS] - b[YEARS]);
    const p10 = sorted[Math.floor(SCENARIOS * 0.10)];
    const p25 = sorted[Math.floor(SCENARIOS * 0.25)];
    const p50 = sorted[Math.floor(SCENARIOS * 0.50)];
    const p75 = sorted[Math.floor(SCENARIOS * 0.75)];
    const p90 = sorted[Math.floor(SCENARIOS * 0.90)];

    const endVals = sorted.map(p => p[YEARS]);
    const probMillion = endVals.filter(v => v >= 1_000_000).length / SCENARIOS;
    const worst5th = endVals[Math.floor(SCENARIOS * 0.05)];

    return { p10, p25, p50, p75, p90, probMillion, worst5th, YEARS, START };
  }, [metrics]);

  // Historical scenario returns for current portfolio
  const historicalReturns = useMemo(() => {
    const w = weights.map(v => v / 100);
    return HISTORICAL_SCENARIOS.map(sc => {
      const portReturn = sc.assetReturns.reduce((s, r, i) => s + w[i] * r, 0);
      return { ...sc, portReturn };
    });
  }, [weights]);

  // Fan chart
  const FCW = 560, FCH = 260, fPad = { top: 15, right: 20, bottom: 40, left: 70 };
  const fPlotW = FCW - fPad.left - fPad.right;
  const fPlotH = FCH - fPad.top - fPad.bottom;
  const maxVal = Math.max(...mcResult.p90) * 1.05;
  const fX = (yr: number) => fPad.left + (yr / mcResult.YEARS) * fPlotW;
  const fY = (v: number) => fPad.top + (1 - v / maxVal) * fPlotH;

  const fanBands: { top: number[]; bot: number[]; fill: string }[] = [
    { top: mcResult.p90, bot: mcResult.p75, fill: "#6366f122" },
    { top: mcResult.p75, bot: mcResult.p50, fill: "#6366f133" },
    { top: mcResult.p50, bot: mcResult.p25, fill: "#6366f133" },
    { top: mcResult.p25, bot: mcResult.p10, fill: "#6366f122" },
  ];

  const toPath = (arr: number[]) =>
    arr.map((v, i) => `${i === 0 ? "M" : "L"} ${fX(i)} ${fY(v)}`).join(" ");

  const toAreaPath = (top: number[], bot: number[]) =>
    top.map((v, i) => `${i === 0 ? "M" : "L"} ${fX(i)} ${fY(v)}`).join(" ") +
    [...bot].reverse().map((v, i) => ` L ${fX(bot.length - 1 - i)} ${fY(v)}`).join("") +
    " Z";

  // Y-axis ticks
  const yTicks = [100_000, 250_000, 500_000, 1_000_000, 2_000_000].filter(v => v <= maxVal * 1.1);

  // Bar chart for historical
  const BW = 560, BH = 220, bPad = { top: 15, right: 15, bottom: 50, left: 70 };
  const bPlotW = BW - bPad.left - bPad.right;
  const bPlotH = BH - bPad.top - bPad.bottom;
  const barW = bPlotW / (HISTORICAL_SCENARIOS.length * 2 + 1);
  const maxAbs = Math.max(...historicalReturns.map(h => Math.max(Math.abs(h.portReturn), Math.abs(h.spReturn)))) + 5;
  const bZero = bPad.top + (1 - 0 / (maxAbs * 2)) * bPlotH * (maxAbs / (maxAbs));
  // Center zero
  const bY = (v: number) => bPad.top + bPlotH / 2 - (v / maxAbs) * (bPlotH / 2);

  return (
    <div className="space-y-4">
      {/* Monte Carlo Fan Chart */}
      <Card className="bg-card border-border p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium text-foreground">Monte Carlo Simulation — 500 Scenarios, 30 Years</h3>
          <Badge className="bg-indigo-900/50 text-indigo-300 border-indigo-800 text-xs">
            Starting: $100K
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Shaded bands show 10th–25th, 25th–50th, 50th–75th, 75th–90th percentile outcomes</p>

        <div className="overflow-x-auto">
          <svg width={FCW} height={FCH}>
            {/* Grid */}
            {yTicks.map(v => (
              <line key={v} x1={fPad.left} y1={fY(v)} x2={FCW - fPad.right} y2={fY(v)} stroke="#262626" strokeWidth={1} />
            ))}

            {/* Fan bands */}
            {fanBands.map((band, i) => (
              <path key={i} d={toAreaPath(band.top, band.bot)} fill={band.fill} />
            ))}

            {/* Percentile lines */}
            {[
              { data: mcResult.p10, color: "#ef4444", label: "P10" },
              { data: mcResult.p25, color: "#f97316", label: "P25" },
              { data: mcResult.p50, color: "#6366f1", label: "Median" },
              { data: mcResult.p75, color: "#10b981", label: "P75" },
              { data: mcResult.p90, color: "#22c55e", label: "P90" },
            ].map(({ data, color, label }) => (
              <g key={label}>
                <path d={toPath(data)} fill="none" stroke={color} strokeWidth={label === "Median" ? 2 : 1} opacity={0.8} />
                <text x={FCW - fPad.right + 2} y={fY(data[mcResult.YEARS]) + 4} fill={color} fontSize={9}>{label}</text>
              </g>
            ))}

            {/* $1M line */}
            {maxVal >= 1_000_000 && (
              <line x1={fPad.left} y1={fY(1_000_000)} x2={FCW - fPad.right} y2={fY(1_000_000)} stroke="#fbbf24" strokeWidth={1} strokeDasharray="4,3" opacity={0.5} />
            )}

            {/* Axes */}
            <line x1={fPad.left} y1={fPad.top} x2={fPad.left} y2={FCH - fPad.bottom} stroke="#404040" />
            <line x1={fPad.left} y1={FCH - fPad.bottom} x2={FCW - fPad.right} y2={FCH - fPad.bottom} stroke="#404040" />

            {yTicks.map(v => (
              <text key={v} x={fPad.left - 6} y={fY(v) + 4} textAnchor="end" fill="#6b7280" fontSize={9}>
                {fmtK(v)}
              </text>
            ))}
            {[0, 5, 10, 15, 20, 25, 30].map(yr => (
              <text key={yr} x={fX(yr)} y={FCH - fPad.bottom + 14} textAnchor="middle" fill="#6b7280" fontSize={9}>
                Yr {yr}
              </text>
            ))}
            <text x={FCW / 2} y={FCH - 2} textAnchor="middle" fill="#6b7280" fontSize={10}>Year</text>
            <text x={12} y={FCH / 2} textAnchor="middle" fill="#6b7280" fontSize={10} transform={`rotate(-90, 12, ${FCH / 2})`}>Portfolio Value</text>
          </svg>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Prob. of $1M+</p>
            <p className="text-xl font-semibold text-emerald-400">{fmtPct(mcResult.probMillion * 100, 0)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Median Outcome</p>
            <p className="text-xl font-semibold text-indigo-400">{fmtK(mcResult.p50[mcResult.YEARS])}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Worst 5th %ile</p>
            <p className="text-xl font-medium text-red-400">{fmtK(mcResult.worst5th)}</p>
          </div>
        </div>
      </Card>

      {/* Historical Scenarios */}
      <Card className="bg-card border-border p-5">
        <h3 className="text-sm font-medium text-foreground mb-1">Historical Stress Test</h3>
        <p className="text-xs text-muted-foreground mb-4">Portfolio return vs S&P 500 in each historical scenario</p>

        <div className="overflow-x-auto">
          <svg width={BW} height={BH}>
            {/* Zero line */}
            <line x1={bPad.left} y1={bPad.top + bPlotH / 2} x2={BW - bPad.right} y2={bPad.top + bPlotH / 2} stroke="#404040" strokeWidth={1.5} />

            {/* Grid lines */}
            {[-50, -25, 0, 25, 50].map(v => (
              <line key={v} x1={bPad.left} y1={bY(v)} x2={BW - bPad.right} y2={bY(v)} stroke="#262626" strokeWidth={1} />
            ))}

            {historicalReturns.map((sc, i) => {
              const groupX = bPad.left + (i + 0.5) * (bPlotW / HISTORICAL_SCENARIOS.length);
              const bw = barW * 1.4;
              const portH = Math.abs(bY(sc.portReturn) - bY(0));
              const spH = Math.abs(bY(sc.spReturn) - bY(0));
              const portY = sc.portReturn >= 0 ? bY(sc.portReturn) : bY(0);
              const spY = sc.spReturn >= 0 ? bY(sc.spReturn) : bY(0);
              return (
                <g key={sc.name}>
                  {/* Portfolio bar */}
                  <rect x={groupX - bw - 2} y={portY} width={bw} height={portH} fill={sc.portReturn >= 0 ? "#10b981" : "#ef4444"} opacity={0.85} rx={2} />
                  {/* S&P bar */}
                  <rect x={groupX + 2} y={spY} width={bw} height={spH} fill={sc.spReturn >= 0 ? "#6366f1" : "#6366f166"} opacity={0.7} rx={2} />

                  {/* Value labels */}
                  <text x={groupX - bw / 2 - 2} y={sc.portReturn >= 0 ? portY - 3 : portY + portH + 10} textAnchor="middle" fill={sc.portReturn >= 0 ? "#10b981" : "#ef4444"} fontSize={9} fontWeight="600">
                    {sc.portReturn.toFixed(1)}%
                  </text>
                  <text x={groupX + bw / 2 + 2} y={sc.spReturn >= 0 ? spY - 3 : spY + spH + 10} textAnchor="middle" fill={sc.spReturn >= 0 ? "#6366f1" : "#a78bfa"} fontSize={9} fontWeight="600">
                    {sc.spReturn.toFixed(1)}%
                  </text>

                  {/* Scenario label */}
                  <text x={groupX} y={BH - bPad.bottom + 14} textAnchor="middle" fill="#9ca3af" fontSize={9}>
                    {sc.name}
                  </text>
                </g>
              );
            })}

            {/* Y-axis labels */}
            {[-50, -25, 0, 25, 50].map(v => (
              <text key={v} x={bPad.left - 6} y={bY(v) + 4} textAnchor="end" fill="#6b7280" fontSize={9}>
                {v}%
              </text>
            ))}

            {/* Legend */}
            <rect x={bPad.left} y={BH - bPad.bottom + 30} width={10} height={10} fill="#10b981" opacity={0.85} rx={2} />
            <text x={bPad.left + 14} y={BH - bPad.bottom + 39} fill="#9ca3af" fontSize={10}>Your Portfolio</text>
            <rect x={bPad.left + 110} y={BH - bPad.bottom + 30} width={10} height={10} fill="#6366f1" opacity={0.7} rx={2} />
            <text x={bPad.left + 124} y={BH - bPad.bottom + 39} fill="#9ca3af" fontSize={10}>S&P 500</text>
          </svg>
        </div>

        {/* Table summary */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground">Scenario</th>
                <th className="text-right py-2 text-muted-foreground">Your Portfolio</th>
                <th className="text-right py-2 text-muted-foreground">S&P 500</th>
                <th className="text-right py-2 text-muted-foreground">Difference</th>
              </tr>
            </thead>
            <tbody>
              {historicalReturns.map(sc => {
                const diff = sc.portReturn - sc.spReturn;
                return (
                  <tr key={sc.name} className="border-b border-border/20">
                    <td className="py-2 text-muted-foreground">{sc.name}</td>
                    <td className={cn("py-2 text-right font-medium", sc.portReturn >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {sc.portReturn.toFixed(1)}%
                    </td>
                    <td className={cn("py-2 text-right", sc.spReturn >= 0 ? "text-indigo-400" : "text-red-400")}>
                      {sc.spReturn.toFixed(1)}%
                    </td>
                    <td className={cn("py-2 text-right font-medium", diff >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {diff >= 0 ? "+" : ""}{diff.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Tab 4: Rebalancing Simulator ──────────────────────────────────────────────

type RebalanceStrategy = "none" | "annual" | "threshold" | "quarterly";

const REBALANCE_STRATEGIES: { key: RebalanceStrategy; label: string; desc: string }[] = [
  { key: "none",      label: "No Rebalancing",       desc: "Let portfolio drift freely" },
  { key: "annual",    label: "Annual",                desc: "Rebalance once per year" },
  { key: "threshold", label: "Threshold 5%",         desc: "Rebalance when any asset drifts >5%" },
  { key: "quarterly", label: "Quarterly",            desc: "Rebalance every 3 months" },
];

function RebalancingSimulator({ weights }: { weights: number[] }) {
  const [selected, setSelected] = useState<Set<RebalanceStrategy>>(new Set(["none", "annual", "threshold", "quarterly"]));

  const results = useMemo(() => {
    const MONTHS = 240; // 20 years
    const START = 100_000;
    const metrics = computePortfolioMetrics(weights);
    const mu = metrics.expectedReturn / 100 / 12;
    const sigma = metrics.volatility / 100 / Math.sqrt(12);
    const TAX_RATE = 0.15;
    const TRANSACTION_COST = 0.001; // 0.1% per trade

    const simulate = (strategy: RebalanceStrategy): { values: number[]; rebalCount: number; totalCost: number } => {
      const rng = mulberry32(1618 + strategy.charCodeAt(0));
      const targetWeights = weights.map(w => w / 100);
      let assetValues = ASSET_CLASSES.map((_, i) => START * targetWeights[i]);
      const values: number[] = [START];
      let rebalCount = 0;
      let totalCost = 0;
      let monthsToNextRebal = strategy === "quarterly" ? 3 : strategy === "annual" ? 12 : Infinity;
      let monthsSinceRebal = 0;

      for (let m = 0; m < MONTHS; m++) {
        // Each asset grows
        assetValues = assetValues.map(v => {
          const z = (rng() - 0.5) * Math.sqrt(12);
          return v * (1 + mu + sigma * z);
        });

        const total = assetValues.reduce((s, v) => s + v, 0);
        values.push(total);
        monthsSinceRebal++;

        // Check rebalancing trigger
        let shouldRebal = false;
        if (strategy === "annual" && monthsSinceRebal >= 12) shouldRebal = true;
        if (strategy === "quarterly" && monthsSinceRebal >= 3) shouldRebal = true;
        if (strategy === "threshold") {
          const currentWeights = assetValues.map(v => v / total);
          const maxDrift = Math.max(...currentWeights.map((w, i) => Math.abs(w - targetWeights[i])));
          if (maxDrift >= 0.05) shouldRebal = true;
        }

        if (shouldRebal) {
          // Cost = transaction + taxes on gains
          let cost = 0;
          assetValues.forEach((v, i) => {
            const target = total * targetWeights[i];
            const diff = Math.abs(v - target);
            cost += diff * TRANSACTION_COST;
            if (v > target) {
              const gain = (v - target) * 0.5; // rough cost basis assumption
              cost += gain * TAX_RATE * 0.3; // only 30% of gains taxed (long-term mix)
            }
          });
          assetValues = assetValues.map((_, i) => total * targetWeights[i]);
          totalCost += cost;
          rebalCount++;
          monthsSinceRebal = 0;
        }
      }

      return { values, rebalCount, totalCost };
    };

    const stratResults: Record<RebalanceStrategy, { values: number[]; rebalCount: number; totalCost: number; color: string }> = {
      none:      { ...simulate("none"),      color: "#ef4444" },
      annual:    { ...simulate("annual"),    color: "#6366f1" },
      threshold: { ...simulate("threshold"), color: "#f59e0b" },
      quarterly: { ...simulate("quarterly"), color: "#10b981" },
    };

    return stratResults;
  }, [weights]);

  const W = 560, H = 280, pad = { top: 15, right: 80, bottom: 40, left: 75 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;
  const MONTHS = 240;

  const allVals = Object.values(results).flatMap(r => r.values);
  const minVal = Math.min(...allVals) * 0.95;
  const maxVal = Math.max(...allVals) * 1.05;

  const toX = (m: number) => pad.left + (m / MONTHS) * plotW;
  const toY = (v: number) => pad.top + (1 - (v - minVal) / (maxVal - minVal)) * plotH;

  const toPath = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(v)}`).join(" ");

  const yTicks = [100_000, 200_000, 300_000, 500_000, 750_000, 1_000_000].filter(v => v >= minVal && v <= maxVal);

  return (
    <div className="space-y-4">
      {/* Strategy toggles */}
      <div className="flex flex-wrap gap-3">
        {REBALANCE_STRATEGIES.map(s => (
          <button
            key={s.key}
            onClick={() => {
              const next = new Set(selected);
              if (next.has(s.key)) next.delete(s.key);
              else next.add(s.key);
              setSelected(next);
            }}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs text-muted-foreground transition-colors",
              selected.has(s.key)
                ? "border-transparent text-foreground"
                : "border-border bg-muted/50 text-muted-foreground"
            )}
            style={selected.has(s.key) ? { background: results[s.key].color + "22", borderColor: results[s.key].color + "88", color: results[s.key].color } : {}}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: selected.has(s.key) ? results[s.key].color : "#4b5563" }} />
            <span className="font-medium">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Chart */}
      <Card className="bg-card border-border p-5">
        <h3 className="text-sm font-medium text-foreground mb-1">Portfolio Value Over 20 Years — $100K Starting</h3>
        <div className="overflow-x-auto">
          <svg width={W} height={H}>
            {/* Grid */}
            {yTicks.map(v => (
              <line key={v} x1={pad.left} y1={toY(v)} x2={W - pad.right} y2={toY(v)} stroke="#262626" strokeWidth={1} />
            ))}
            {[0, 5, 10, 15, 20].map(yr => (
              <line key={yr} x1={toX(yr * 12)} y1={pad.top} x2={toX(yr * 12)} y2={H - pad.bottom} stroke="#262626" strokeWidth={1} />
            ))}

            {/* Strategy lines */}
            {(Object.keys(results) as RebalanceStrategy[]).map(key => {
              if (!selected.has(key)) return null;
              const r = results[key];
              return (
                <g key={key}>
                  <path d={toPath(r.values)} fill="none" stroke={r.color} strokeWidth={2} opacity={0.85} />
                  <text x={W - pad.right + 4} y={toY(r.values[MONTHS]) + 4} fill={r.color} fontSize={9}>
                    {fmtK(r.values[MONTHS])}
                  </text>
                </g>
              );
            })}

            {/* Axes */}
            <line x1={pad.left} y1={pad.top} x2={pad.left} y2={H - pad.bottom} stroke="#404040" />
            <line x1={pad.left} y1={H - pad.bottom} x2={W - pad.right} y2={H - pad.bottom} stroke="#404040" />

            {yTicks.map(v => (
              <text key={v} x={pad.left - 6} y={toY(v) + 4} textAnchor="end" fill="#6b7280" fontSize={9}>{fmtK(v)}</text>
            ))}
            {[0, 5, 10, 15, 20].map(yr => (
              <text key={yr} x={toX(yr * 12)} y={H - pad.bottom + 14} textAnchor="middle" fill="#6b7280" fontSize={9}>Yr {yr}</text>
            ))}
          </svg>
        </div>
      </Card>

      {/* Results table */}
      <Card className="bg-card border-border p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">Strategy Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground">Strategy</th>
                <th className="text-right py-2 text-muted-foreground">Ending Value</th>
                <th className="text-right py-2 text-muted-foreground">Total Return</th>
                <th className="text-right py-2 text-muted-foreground">Rebalances</th>
                <th className="text-right py-2 text-muted-foreground">Total Cost</th>
                <th className="text-right py-2 text-muted-foreground">Rebal Premium</th>
              </tr>
            </thead>
            <tbody>
              {REBALANCE_STRATEGIES.map(s => {
                const r = results[s.key];
                const endVal = r.values[MONTHS];
                const totalReturn = ((endVal - 100_000) / 100_000) * 100;
                const baseReturn = ((results.none.values[MONTHS] - 100_000) / 100_000) * 100;
                const premium = totalReturn - baseReturn;
                return (
                  <tr key={s.key} className="border-b border-border/20">
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                        <span className="text-foreground">{s.label}</span>
                      </div>
                    </td>
                    <td className="py-2 text-right font-medium" style={{ color: r.color }}>{fmtK(endVal)}</td>
                    <td className={cn("py-2 text-right font-medium", totalReturn >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {totalReturn.toFixed(1)}%
                    </td>
                    <td className="py-2 text-right text-muted-foreground">{r.rebalCount}×</td>
                    <td className="py-2 text-right text-amber-400">{fmtK(r.totalCost)}</td>
                    <td className={cn("py-2 text-right font-medium", premium >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {s.key === "none" ? "—" : `${premium >= 0 ? "+" : ""}${premium.toFixed(1)}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <span className="text-amber-400 font-medium">Cost assumptions:</span> 0.1% transaction cost per trade, 15% long-term capital gains tax on 30% of rebalanced gains.
            Rebalancing premium shows excess return vs. no-rebalancing strategy.
          </p>
        </div>
      </Card>
    </div>
  );
}

// ── Tab 5: Lifecycle Planning ─────────────────────────────────────────────────

const TARGET_DATE_FUNDS: { name: string; year: number; stockPct: number; bondPct: number; altPct: number }[] = [
  { name: "Target 2030", year: 2030, stockPct: 50, bondPct: 42, altPct: 8 },
  { name: "Target 2040", year: 2040, stockPct: 65, bondPct: 28, altPct: 7 },
  { name: "Target 2050", year: 2050, stockPct: 78, bondPct: 17, altPct: 5 },
  { name: "Target 2060", year: 2060, stockPct: 88, bondPct: 9,  altPct: 3 },
];

const GLIDE_PATH_AGES = [25, 35, 45, 55, 65, 70, 75, 80];

function glidePathStockPct(age: number, riskTolerance: number): number {
  // Base: 110 - age, adjusted by risk tolerance (0-2)
  const base = Math.max(20, Math.min(95, 110 - age + (riskTolerance - 1) * 10));
  return base;
}

function LifecyclePlanning() {
  const [currentAge, setCurrentAge] = useState(35);
  const [retirementAge, setRetirementAge] = useState(65);
  const [riskTolerance, setRiskTolerance] = useState(1); // 0=conservative, 1=moderate, 2=aggressive
  const [portfolioVal, setPortfolioVal] = useState(500_000);
  const [swr, setSwr] = useState(4.0); // safe withdrawal rate

  const glidePath = useMemo(() => {
    return GLIDE_PATH_AGES.map(age => ({
      age,
      stockPct: glidePathStockPct(age, riskTolerance),
      bondPct: Math.max(5, 100 - glidePathStockPct(age, riskTolerance) - 5),
      altPct: 5,
    }));
  }, [riskTolerance]);

  // Sequence of returns simulation
  const sorResult = useMemo(() => {
    const YEARS = 30;
    const START = portfolioVal;
    const annualWithdrawal = START * (swr / 100);
    const avgReturn = 0.07;

    // Good years first
    const rng = mulberry32(1618);
    const returns: number[] = [];
    for (let i = 0; i < YEARS; i++) {
      returns.push(0.04 + rng() * 0.08); // random returns avg ~8%
    }
    const goodFirst = [...returns].sort((a, b) => b - a);
    const badFirst = [...returns].sort((a, b) => a - b);
    const avg = returns.map(() => avgReturn);

    const simulate = (rets: number[]): number[] => {
      const vals: number[] = [START];
      let v = START;
      for (let y = 0; y < YEARS; y++) {
        v = v * (1 + rets[y]) - annualWithdrawal;
        vals.push(Math.max(0, v));
      }
      return vals;
    };

    return {
      goodFirst: simulate(goodFirst),
      badFirst: simulate(badFirst),
      average: simulate(avg),
      annualWithdrawal,
    };
  }, [portfolioVal, swr]);

  // SWR probability simulation (Monte Carlo)
  const swrProb = useMemo(() => {
    const rng = mulberry32(9999);
    const SIMS = 300;
    const YEARS = 30;
    const annualWithdrawal = portfolioVal * (swr / 100);
    let successes = 0;
    for (let s = 0; s < SIMS; s++) {
      let v = portfolioVal;
      let ok = true;
      for (let y = 0; y < YEARS; y++) {
        const z = (rng() + rng() + rng() - 1.5) / Math.sqrt(0.75);
        v = v * (1 + 0.05 + 0.12 * z) - annualWithdrawal;
        if (v <= 0) { ok = false; break; }
      }
      if (ok) successes++;
    }
    return successes / SIMS;
  }, [portfolioVal, swr]);

  // Glide path chart
  const GW = 480, GH = 220, gPad = { top: 15, right: 15, bottom: 35, left: 45 };
  const gPlotW = GW - gPad.left - gPad.right;
  const gPlotH = GH - gPad.top - gPad.bottom;
  const minAge = 25, maxAge = 80;
  const gX = (age: number) => gPad.left + (age - minAge) / (maxAge - minAge) * gPlotW;
  const gY = (pct: number) => gPad.top + (1 - pct / 100) * gPlotH;

  const stockLine = glidePath.map((p, i) => `${i === 0 ? "M" : "L"} ${gX(p.age)} ${gY(p.stockPct)}`).join(" ");
  const bondLine = glidePath.map((p, i) => `${i === 0 ? "M" : "L"} ${gX(p.age)} ${gY(p.bondPct)}`).join(" ");
  const stockArea = glidePath.map((p, i) => `${i === 0 ? "M" : "L"} ${gX(p.age)} ${gY(p.stockPct)}`).join(" ") +
    ` L ${gX(80)} ${gY(0)} L ${gX(25)} ${gY(0)} Z`;

  // Current age indicator
  const curAgeX = gX(Math.min(Math.max(currentAge, 25), 80));
  const curStockPct = glidePathStockPct(currentAge, riskTolerance);

  // SoR chart
  const SW = 480, SH = 200, sPad = { top: 15, right: 80, bottom: 35, left: 70 };
  const sPlotW = SW - sPad.left - sPad.right;
  const sPlotH = SH - sPad.top - sPad.bottom;
  const YEARS = 30;
  const maxSorVal = Math.max(...sorResult.goodFirst) * 1.05;
  const sX = (yr: number) => sPad.left + (yr / YEARS) * sPlotW;
  const sY = (v: number) => sPad.top + (1 - Math.max(0, v) / maxSorVal) * sPlotH;
  const sorPath = (vals: number[]) => vals.map((v, i) => `${i === 0 ? "M" : "L"} ${sX(i)} ${sY(v)}`).join(" ");

  const toleranceLabels = ["Conservative", "Moderate", "Aggressive"];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card className="bg-card border-border p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">Personal Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-2">Current Age: <span className="text-foreground font-medium">{currentAge}</span></label>
            <Slider value={[currentAge]} onValueChange={([v]) => setCurrentAge(v)} min={20} max={75} step={1} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-2">Retirement Age: <span className="text-foreground font-medium">{retirementAge}</span></label>
            <Slider value={[retirementAge]} onValueChange={([v]) => setRetirementAge(v)} min={50} max={75} step={1} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-2">Portfolio Value: <span className="text-foreground font-medium">{fmtK(portfolioVal)}</span></label>
            <Slider value={[portfolioVal]} onValueChange={([v]) => setPortfolioVal(v)} min={100_000} max={5_000_000} step={50_000} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-2">Safe Withdrawal Rate: <span className="text-foreground font-medium">{swr.toFixed(1)}%</span></label>
            <Slider value={[swr]} onValueChange={([v]) => setSwr(v)} min={2} max={7} step={0.1} />
          </div>
        </div>
        <div className="mt-4">
          <label className="text-xs text-muted-foreground block mb-2">Risk Tolerance: <span className="text-foreground font-medium">{toleranceLabels[riskTolerance]}</span></label>
          <div className="flex gap-2">
            {toleranceLabels.map((label, i) => (
              <button
                key={label}
                onClick={() => setRiskTolerance(i)}
                className={cn(
                  "px-3 py-1.5 rounded text-xs text-muted-foreground transition-colors",
                  riskTolerance === i ? "bg-indigo-600 text-foreground" : "bg-muted text-muted-foreground hover:bg-muted"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Glide Path Chart */}
      <Card className="bg-card border-border p-5">
        <h3 className="text-sm font-medium text-foreground mb-1">Asset Allocation Glide Path</h3>
        <p className="text-xs text-muted-foreground mb-4">Recommended stock allocation at each age for your risk tolerance</p>
        <div className="overflow-x-auto">
          <svg width={GW} height={GH}>
            {/* Grid */}
            {[20, 40, 60, 80, 100].map(pct => (
              <line key={pct} x1={gPad.left} y1={gY(pct)} x2={GW - gPad.right} y2={gY(pct)} stroke="#262626" strokeWidth={1} />
            ))}
            {GLIDE_PATH_AGES.map(age => (
              <line key={age} x1={gX(age)} y1={gPad.top} x2={gX(age)} y2={GH - gPad.bottom} stroke="#262626" strokeWidth={1} />
            ))}

            {/* Stock area fill */}
            <path d={stockArea} fill="#6366f118" />
            <path d={stockLine} fill="none" stroke="#6366f1" strokeWidth={2.5} />
            <path d={bondLine} fill="none" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5,3" opacity={0.7} />

            {/* Current age line */}
            <line x1={curAgeX} y1={gPad.top} x2={curAgeX} y2={GH - gPad.bottom} stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="4,3" />
            <circle cx={curAgeX} cy={gY(curStockPct)} r={5} fill="#fbbf24" />
            <text x={curAgeX + 6} y={gY(curStockPct) - 6} fill="#fbbf24" fontSize={9} fontWeight="600">
              Age {currentAge}: {curStockPct.toFixed(0)}% stocks
            </text>

            {/* Data points */}
            {glidePath.map(p => (
              <g key={p.age}>
                <circle cx={gX(p.age)} cy={gY(p.stockPct)} r={3} fill="#6366f1" />
                <text x={gX(p.age)} y={gY(p.stockPct) - 8} textAnchor="middle" fill="#6366f1" fontSize={9}>
                  {p.stockPct.toFixed(0)}%
                </text>
              </g>
            ))}

            {/* Retirement age line */}
            {retirementAge >= 25 && retirementAge <= 80 && (
              <g>
                <line x1={gX(retirementAge)} y1={gPad.top} x2={gX(retirementAge)} y2={GH - gPad.bottom} stroke="#10b981" strokeWidth={1.5} strokeDasharray="4,3" />
                <text x={gX(retirementAge) + 4} y={gPad.top + 10} fill="#10b981" fontSize={9}>Retire {retirementAge}</text>
              </g>
            )}

            {/* Axes */}
            <line x1={gPad.left} y1={gPad.top} x2={gPad.left} y2={GH - gPad.bottom} stroke="#404040" />
            <line x1={gPad.left} y1={GH - gPad.bottom} x2={GW - gPad.right} y2={GH - gPad.bottom} stroke="#404040" />

            {[20, 40, 60, 80, 100].map(pct => (
              <text key={pct} x={gPad.left - 6} y={gY(pct) + 4} textAnchor="end" fill="#6b7280" fontSize={9}>{pct}%</text>
            ))}
            {GLIDE_PATH_AGES.map(age => (
              <text key={age} x={gX(age)} y={GH - gPad.bottom + 14} textAnchor="middle" fill="#6b7280" fontSize={9}>{age}</text>
            ))}
            <text x={GW / 2} y={GH - 2} textAnchor="middle" fill="#6b7280" fontSize={10}>Age</text>
            <text x={12} y={GH / 2} textAnchor="middle" fill="#6b7280" fontSize={10} transform={`rotate(-90, 12, ${GH / 2})`}>Stock %</text>

            {/* Legend */}
            <line x1={gPad.left + 10} y1={GH - 4} x2={gPad.left + 30} y2={GH - 4} stroke="#6366f1" strokeWidth={2} />
            <text x={gPad.left + 34} y={GH - 1} fill="#6b7280" fontSize={9}>Stocks</text>
            <line x1={gPad.left + 80} y1={GH - 4} x2={gPad.left + 100} y2={GH - 4} stroke="#3b82f6" strokeWidth={2} strokeDasharray="4,3" />
            <text x={gPad.left + 104} y={GH - 1} fill="#6b7280" fontSize={9}>Bonds</text>
          </svg>
        </div>

        {/* Age-based table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground">Age</th>
                {GLIDE_PATH_AGES.map(age => (
                  <th key={age} className={cn("text-center py-2 text-muted-foreground", age === currentAge && "text-amber-400")}>{age}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/20">
                <td className="py-2 text-muted-foreground">Stocks</td>
                {glidePath.map(p => (
                  <td key={p.age} className={cn("py-2 text-center font-medium", p.age === currentAge ? "text-amber-400" : "text-indigo-400")}>
                    {p.stockPct.toFixed(0)}%
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-2 text-muted-foreground">Bonds</td>
                {glidePath.map(p => (
                  <td key={p.age} className={cn("py-2 text-center", p.age === currentAge ? "text-amber-400" : "text-primary")}>
                    {p.bondPct.toFixed(0)}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 text-muted-foreground">Alts</td>
                {glidePath.map(p => (
                  <td key={p.age} className="py-2 text-center text-muted-foreground">
                    {p.altPct}%
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Target Date Fund Comparison */}
      <Card className="bg-card border-border p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">Target Date Fund Comparison</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TARGET_DATE_FUNDS.map(fund => {
            const DONUT_R = 44, INNER = 28;
            const segments = [
              { pct: fund.stockPct, color: "#6366f1", label: "Stocks" },
              { pct: fund.bondPct,  color: "#3b82f6", label: "Bonds" },
              { pct: fund.altPct,   color: "#10b981", label: "Alts" },
            ];
            let cumAngle = -Math.PI / 2;
            return (
              <div key={fund.name} className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs font-medium text-foreground mb-2">{fund.name}</p>
                <svg width={100} height={100} className="mx-auto">
                  <g transform="translate(50,50)">
                    {segments.map(seg => {
                      const angle = (seg.pct / 100) * 2 * Math.PI;
                      const sa = cumAngle;
                      cumAngle += angle;
                      const ea = cumAngle;
                      const x1 = DONUT_R * Math.cos(sa), y1 = DONUT_R * Math.sin(sa);
                      const x2 = DONUT_R * Math.cos(ea), y2 = DONUT_R * Math.sin(ea);
                      const xi1 = INNER * Math.cos(sa), yi1 = INNER * Math.sin(sa);
                      const xi2 = INNER * Math.cos(ea), yi2 = INNER * Math.sin(ea);
                      const lg = angle > Math.PI ? 1 : 0;
                      return (
                        <path
                          key={seg.label}
                          d={`M ${x1} ${y1} A ${DONUT_R} ${DONUT_R} 0 ${lg} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${INNER} ${INNER} 0 ${lg} 0 ${xi1} ${yi1} Z`}
                          fill={seg.color}
                          opacity={0.85}
                        />
                      );
                    })}
                    <text x={0} y={-4} textAnchor="middle" fill="white" fontSize={10} fontWeight="700">{fund.stockPct}%</text>
                    <text x={0} y={8} textAnchor="middle" fill="#9ca3af" fontSize={8}>stocks</text>
                  </g>
                </svg>
                <div className="space-y-0.5 text-xs text-muted-foreground mt-1">
                  {segments.map(seg => (
                    <div key={seg.label} className="flex justify-between">
                      <span style={{ color: seg.color }}>{seg.label}</span>
                      <span className="text-muted-foreground">{seg.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Sequence of Returns */}
      <Card className="bg-card border-border p-5">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="text-sm font-medium text-foreground">Sequence of Returns Risk</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Same average return, different order — dramatically different outcomes.
              Annual withdrawal: {fmtK(sorResult.annualWithdrawal)}
            </p>
          </div>
          <Badge className={cn(
            "text-xs text-muted-foreground",
            swrProb >= 0.9 ? "bg-emerald-900/50 text-emerald-400 border-emerald-800"
            : swrProb >= 0.7 ? "bg-amber-900/50 text-amber-400 border-amber-800"
            : "bg-red-900/50 text-red-400 border-red-800"
          )}>
            {fmtPct(swrProb * 100, 0)} success
          </Badge>
        </div>

        <div className="overflow-x-auto mt-4">
          <svg width={SW} height={SH}>
            {/* Grid */}
            {[0, 0.25, 0.5, 0.75, 1].map(f => (
              <line key={f} x1={sPad.left} y1={sPad.top + f * sPlotH} x2={SW - sPad.right} y2={sPad.top + f * sPlotH} stroke="#262626" strokeWidth={1} />
            ))}

            {/* Lines */}
            <path d={sorPath(sorResult.goodFirst)} fill="none" stroke="#10b981" strokeWidth={2} opacity={0.9} />
            <path d={sorPath(sorResult.badFirst)} fill="none" stroke="#ef4444" strokeWidth={2} opacity={0.9} />
            <path d={sorPath(sorResult.average)} fill="none" stroke="#6366f1" strokeWidth={2} strokeDasharray="6,3" opacity={0.8} />

            {/* End labels */}
            {[
              { data: sorResult.goodFirst, color: "#10b981", label: "Good first" },
              { data: sorResult.badFirst,  color: "#ef4444", label: "Bad first" },
              { data: sorResult.average,   color: "#6366f1", label: "Average" },
            ].map(({ data, color, label }) => (
              <g key={label}>
                <text x={SW - sPad.right + 4} y={sY(data[YEARS]) + 4} fill={color} fontSize={9}>{fmtK(data[YEARS])}</text>
              </g>
            ))}

            {/* Axes */}
            <line x1={sPad.left} y1={sPad.top} x2={sPad.left} y2={SH - sPad.bottom} stroke="#404040" />
            <line x1={sPad.left} y1={SH - sPad.bottom} x2={SW - sPad.right} y2={SH - sPad.bottom} stroke="#404040" />

            {[0, 0.25, 0.5, 0.75, 1].map(f => {
              const v = maxSorVal * (1 - f);
              return (
                <text key={f} x={sPad.left - 6} y={sPad.top + f * sPlotH + 4} textAnchor="end" fill="#6b7280" fontSize={9}>
                  {fmtK(v)}
                </text>
              );
            })}
            {[0, 5, 10, 15, 20, 25, 30].map(yr => (
              <text key={yr} x={sX(yr)} y={SH - sPad.bottom + 14} textAnchor="middle" fill="#6b7280" fontSize={9}>Yr {yr}</text>
            ))}

            {/* Legend */}
            <line x1={sPad.left} y1={SH - 4} x2={sPad.left + 20} y2={SH - 4} stroke="#10b981" strokeWidth={2} />
            <text x={sPad.left + 24} y={SH - 1} fill="#6b7280" fontSize={9}>Returns good first</text>
            <line x1={sPad.left + 140} y1={SH - 4} x2={sPad.left + 160} y2={SH - 4} stroke="#ef4444" strokeWidth={2} />
            <text x={sPad.left + 164} y={SH - 1} fill="#6b7280" fontSize={9}>Returns bad first</text>
            <line x1={sPad.left + 280} y1={SH - 4} x2={sPad.left + 300} y2={SH - 4} stroke="#6366f1" strokeWidth={2} strokeDasharray="5,3" />
            <text x={sPad.left + 304} y={SH - 1} fill="#6b7280" fontSize={9}>Steady avg</text>
          </svg>
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <span className="text-amber-400 font-medium">Key insight:</span> A {swr.toFixed(1)}% withdrawal rate from a {fmtK(portfolioVal)} portfolio
            ({fmtK(sorResult.annualWithdrawal)}/yr) has a <span className="text-foreground font-medium">{fmtPct(swrProb * 100, 0)} probability</span> of lasting 30 years.
            Early sequence risk is the greatest threat to retirement security — avoid large early withdrawals in down markets.
          </p>
        </div>
      </Card>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AllocationPage() {
  const [tab, setTab] = useState("overview");
  // Shared weights state for cross-tab usage
  const [sharedWeights, setSharedWeights] = useState<number[]>(PRESETS[0].weights.map(w => w));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-start justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <PieChart className="w-4 h-4 text-indigo-400" />
              </div>
              <h1 className="text-xl font-medium text-foreground">Multi-Asset Allocation Simulator</h1>
              <Badge className="bg-indigo-900/50 text-indigo-300 border-indigo-800 text-xs">12 Asset Classes</Badge>
            </div>
            <p className="text-sm text-muted-foreground ml-11">
              Build, analyze, and optimize portfolios across equities, fixed income, and alternatives
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="w-3.5 h-3.5" />
            <span>Educational simulation only</span>
          </div>
        </motion.div>

        {/* HERO — Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 border-l-4 border-l-primary rounded-md bg-card p-6"
        >
          {(() => {
            const m = computePortfolioMetrics(sharedWeights);
            return [
              { label: "Expected Return", value: fmtPct(m.expectedReturn), color: "text-emerald-400", icon: TrendingUp, bg: "bg-emerald-500/5" },
              { label: "Portfolio Volatility", value: fmtPct(m.volatility), color: "text-amber-400", icon: Activity, bg: "bg-amber-500/10" },
              { label: "Sharpe Ratio", value: m.sharpe.toFixed(2), color: m.sharpe >= 0.5 ? "text-emerald-400" : "text-amber-400", icon: Zap, bg: "bg-indigo-500/10" },
              { label: "Market Beta", value: m.beta.toFixed(2), color: "text-primary", icon: BarChart3, bg: "bg-muted/10" },
            ];
          })().map(item => (
            <Card key={item.label} className="bg-card border-border p-3">
              <div className="flex items-center gap-2">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", item.bg)}>
                  <item.icon className={cn("w-3.5 h-3.5", item.color)} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className={cn("text-base font-medium", item.color)}>{item.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="bg-card border border-border mb-6 flex flex-wrap h-auto gap-1 p-1">
              {[
                { value: "overview",    label: "Asset Classes",      icon: Layers },
                { value: "builder",     label: "Portfolio Builder",   icon: PieChart },
                { value: "scenarios",   label: "Return Scenarios",    icon: Activity },
                { value: "rebalancing", label: "Rebalancing",         icon: RefreshCw },
                { value: "lifecycle",   label: "Lifecycle Planning",  icon: Calendar },
              ].map(t => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="flex items-center gap-1.5 text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground"
                >
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="data-[state=inactive]:hidden">
              <AnimatePresence mode="wait">
                {tab === "overview" && (
                  <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    <AssetClassOverview />
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="builder" className="data-[state=inactive]:hidden">
              <AnimatePresence mode="wait">
                {tab === "builder" && (
                  <motion.div key="builder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    <PortfolioBuilder />
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="scenarios" className="data-[state=inactive]:hidden">
              <AnimatePresence mode="wait">
                {tab === "scenarios" && (
                  <motion.div key="scenarios" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    <ReturnScenarios weights={sharedWeights} />
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="rebalancing" className="data-[state=inactive]:hidden">
              <AnimatePresence mode="wait">
                {tab === "rebalancing" && (
                  <motion.div key="rebalancing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    <RebalancingSimulator weights={sharedWeights} />
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="lifecycle" className="data-[state=inactive]:hidden">
              <AnimatePresence mode="wait">
                {tab === "lifecycle" && (
                  <motion.div key="lifecycle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    <LifecyclePlanning />
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
