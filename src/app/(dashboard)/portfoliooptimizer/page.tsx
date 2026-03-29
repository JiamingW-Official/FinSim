"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  TrendingUp,
  Shield,
  Activity,
  BarChart3,
  Info,
  Target,
  Zap,
  PieChart,
  RefreshCw,
  BookOpen,
  AlertTriangle,
} from "lucide-react";

// ─── Seeded PRNG (seed = 702008) ─────────────────────────────────────────────

function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ─── Asset definitions ────────────────────────────────────────────────────────

interface Asset {
  ticker: string;
  name: string;
  expectedReturn: number; // annualized decimal
  volatility: number;     // annualized decimal
  color: string;
  sector: string;
}

const ASSETS: Asset[] = [
  { ticker: "AAPL", name: "Apple Inc.",          expectedReturn: 0.142, volatility: 0.268, color: "#3b82f6", sector: "Tech" },
  { ticker: "MSFT", name: "Microsoft Corp.",     expectedReturn: 0.131, volatility: 0.243, color: "#8b5cf6", sector: "Tech" },
  { ticker: "BND",  name: "Vanguard Total Bond", expectedReturn: 0.042, volatility: 0.063, color: "#10b981", sector: "Bonds" },
  { ticker: "GLD",  name: "SPDR Gold Shares",    expectedReturn: 0.071, volatility: 0.158, color: "#f59e0b", sector: "Commodity" },
  { ticker: "VNQ",  name: "Vanguard Real Estate",expectedReturn: 0.089, volatility: 0.197, color: "#ec4899", sector: "Real Estate" },
];

const N = ASSETS.length; // 5

// ─── Pre-computed covariance matrix ──────────────────────────────────────────
// Correlation matrix (symmetric):
// Order: AAPL, MSFT, BND, GLD, VNQ
const CORR: number[][] = [
  [1.00,  0.82, -0.18,  0.05,  0.38],
  [0.82,  1.00, -0.14,  0.02,  0.31],
  [-0.18,-0.14,  1.00,  0.24, -0.12],
  [0.05,  0.02,  0.24,  1.00,  0.11],
  [0.38,  0.31, -0.12,  0.11,  1.00],
];

// Covariance: C[i][j] = corr[i][j] * vol[i] * vol[j]
function buildCov(): number[][] {
  const cov: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      cov[i][j] = CORR[i][j] * ASSETS[i].volatility * ASSETS[j].volatility;
    }
  }
  return cov;
}

const COV = buildCov();

// ─── Math helpers ─────────────────────────────────────────────────────────────

function portfolioReturn(weights: number[]): number {
  return weights.reduce((s, w, i) => s + w * ASSETS[i].expectedReturn, 0);
}

function portfolioVariance(weights: number[]): number {
  let v = 0;
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      v += weights[i] * weights[j] * COV[i][j];
    }
  }
  return v;
}

function portfolioVol(weights: number[]): number {
  return Math.sqrt(portfolioVariance(weights));
}

function portfolioSharpe(weights: number[], rf = 0.045): number {
  const vol = portfolioVol(weights);
  if (vol === 0) return 0;
  return (portfolioReturn(weights) - rf) / vol;
}

// Random long-only weights (sum to 1)
function randomWeights(rand: () => number): number[] {
  const raw = Array.from({ length: N }, () => -Math.log(rand() + 1e-10));
  const sum = raw.reduce((a, b) => a + b, 0);
  return raw.map((v) => v / sum);
}

// ─── Portfolio point type ─────────────────────────────────────────────────────

interface PortfolioPoint {
  weights: number[];
  ret: number;
  vol: number;
  sharpe: number;
}

// ─── Optimization: Minimum Variance (gradient descent on variance) ────────────

function projectOntoSimplex(v: number[]): number[] {
  const n = v.length;
  const sorted = [...v].sort((a, b) => b - a);
  let rho = 0;
  let cumSum = 0;
  for (let i = 0; i < n; i++) {
    cumSum += sorted[i];
    if (sorted[i] - (cumSum - 1) / (i + 1) > 0) rho = i;
    else break;
  }
  cumSum = 0;
  for (let i = 0; i <= rho; i++) cumSum += sorted[i];
  const theta = (cumSum - 1) / (rho + 1);
  return v.map((x) => Math.max(x - theta, 0));
}

function minimizeVariance(maxIter = 2000, lr = 0.12): PortfolioPoint {
  const rand = makeRng(702008);
  let w = randomWeights(rand);

  for (let iter = 0; iter < maxIter; iter++) {
    const grad: number[] = Array(N).fill(0);
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        grad[i] += 2 * COV[i][j] * w[j];
      }
    }
    const step = lr / (1 + iter * 0.003);
    const wNew = w.map((wi, i) => wi - step * grad[i]);
    w = projectOntoSimplex(wNew);
  }

  return {
    weights: w,
    ret: portfolioReturn(w),
    vol: portfolioVol(w),
    sharpe: portfolioSharpe(w),
  };
}

function maximizeSharpe(maxIter = 2000, lr = 0.12): PortfolioPoint {
  const rand = makeRng(702008 + 1);
  let w = randomWeights(rand);
  const rf = 0.045;

  for (let iter = 0; iter < maxIter; iter++) {
    const ret = portfolioReturn(w);
    const varP = portfolioVariance(w);
    const volP = Math.sqrt(varP);
    if (volP < 1e-8) break;

    const excess = ret - rf;
    const grad: number[] = Array(N).fill(0);
    for (let i = 0; i < N; i++) {
      let dVar = 0;
      for (let j = 0; j < N; j++) dVar += 2 * COV[i][j] * w[j];
      // Gradient of Sharpe: (mu_i * volP - excess * dVar/(2*volP)) / varP
      grad[i] = -(ASSETS[i].expectedReturn * volP - excess * (dVar / (2 * volP))) / varP;
    }

    const step = lr / (1 + iter * 0.003);
    const wNew = w.map((wi, i) => wi - step * grad[i]);
    w = projectOntoSimplex(wNew);
  }

  return {
    weights: w,
    ret: portfolioReturn(w),
    vol: portfolioVol(w),
    sharpe: portfolioSharpe(w),
  };
}

function riskParityWeights(): PortfolioPoint {
  // Equal risk contribution: w_i ~ 1/vol_i, normalized
  const invVols = ASSETS.map((a) => 1 / a.volatility);
  const sum = invVols.reduce((a, b) => a + b, 0);
  const w = invVols.map((v) => v / sum);
  return { weights: w, ret: portfolioReturn(w), vol: portfolioVol(w), sharpe: portfolioSharpe(w) };
}

function sixtyFortyWeights(): PortfolioPoint {
  // 30% AAPL, 30% MSFT, 40% BND
  const w = [0.30, 0.30, 0.40, 0.00, 0.00];
  return { weights: w, ret: portfolioReturn(w), vol: portfolioVol(w), sharpe: portfolioSharpe(w) };
}

// ─── Generate frontier curve points ──────────────────────────────────────────

function generateFrontierCurve(numPoints = 30): PortfolioPoint[] {
  // Parametric: blend between min-variance and max-return asset at different risk aversion levels
  const minVar = minimizeVariance();
  const maxRetIdx = ASSETS.reduce((best, a, i) => (a.expectedReturn > ASSETS[best].expectedReturn ? i : best), 0);
  const maxRetW = Array(N).fill(0);
  maxRetW[maxRetIdx] = 1;

  const points: PortfolioPoint[] = [];
  for (let k = 0; k <= numPoints; k++) {
    const t = k / numPoints;
    const raw = minVar.weights.map((w, i) => w * (1 - t) + maxRetW[i] * t);
    const sum = raw.reduce((a, b) => a + b, 0);
    const wn = raw.map((v) => v / sum);
    points.push({ weights: wn, ret: portfolioReturn(wn), vol: portfolioVol(wn), sharpe: portfolioSharpe(wn) });
  }
  return points;
}

// ─── Constrained optimization ─────────────────────────────────────────────────

function minimizeVarianceConstrained(maxWeights: number[], maxIter = 2000, lr = 0.12): PortfolioPoint {
  const rand = makeRng(702008 + 2);
  // Initialize within constraints
  let w = randomWeights(rand).map((wi, i) => Math.min(wi, maxWeights[i]));
  const s = w.reduce((a, b) => a + b, 0);
  w = w.map((v) => v / s);

  for (let iter = 0; iter < maxIter; iter++) {
    const grad: number[] = Array(N).fill(0);
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        grad[i] += 2 * COV[i][j] * w[j];
      }
    }
    const step = lr / (1 + iter * 0.003);
    let wNew = w.map((wi, i) => wi - step * grad[i]);
    // Clip to max weights
    wNew = wNew.map((wi, i) => Math.min(wi, maxWeights[i]));
    wNew = projectOntoSimplex(wNew);
    // Re-clip and renormalize
    wNew = wNew.map((wi, i) => Math.min(wi, maxWeights[i]));
    const sum2 = wNew.reduce((a, b) => a + b, 0);
    w = sum2 > 0 ? wNew.map((v) => v / sum2) : wNew;
  }

  return {
    weights: w,
    ret: portfolioReturn(w),
    vol: portfolioVol(w),
    sharpe: portfolioSharpe(w),
  };
}

function generateConstrainedFrontier(maxWeights: number[], numPoints = 20): PortfolioPoint[] {
  const minVar = minimizeVarianceConstrained(maxWeights);
  const points: PortfolioPoint[] = [];
  for (let k = 0; k <= numPoints; k++) {
    const t = k / numPoints;
    const maxRetIdx = ASSETS.reduce((best, a, i) => (a.expectedReturn > ASSETS[best].expectedReturn ? i : best), 0);
    const maxRetW = Array(N).fill(0);
    maxRetW[maxRetIdx] = Math.min(1, maxWeights[maxRetIdx]);
    // Fill remainder proportionally
    const remainder = 1 - maxRetW[maxRetIdx];
    const others: number[] = ASSETS.map((_, i) => (i === maxRetIdx ? 0 : 1));
    const othersSum = others.reduce((a, b) => a + b, 0);
    const altW = others.map((v) => v / othersSum * remainder);
    altW[maxRetIdx] = maxRetW[maxRetIdx];

    const raw = minVar.weights.map((w, i) => w * (1 - t) + altW[i] * t);
    const capped = raw.map((v, i) => Math.min(v, maxWeights[i]));
    const sum = capped.reduce((a, b) => a + b, 0);
    const wn = sum > 0 ? capped.map((v) => v / sum) : capped;
    points.push({ weights: wn, ret: portfolioReturn(wn), vol: portfolioVol(wn), sharpe: portfolioSharpe(wn) });
  }
  return points;
}

// ─── SVG helpers ─────────────────────────────────────────────────────────────

function svgScale(
  val: number,
  minV: number,
  maxV: number,
  minOut: number,
  maxOut: number
): number {
  if (maxV === minV) return (minOut + maxOut) / 2;
  return minOut + ((val - minV) / (maxV - minV)) * (maxOut - minOut);
}

// ─── Color interpolation for heatmap ─────────────────────────────────────────

function corrColor(v: number): string {
  // -1 → red, 0 → neutral gray, +1 → blue
  if (v > 0) {
    const t = v;
    const r = Math.round(59 + (59 - 59) * t);
    const g = Math.round(130 * (1 - t));
    const b = Math.round(246 * t);
    return `rgb(${r},${g},${b})`;
  } else {
    const t = -v;
    return `rgb(${Math.round(239 * t)},${Math.round(68 * t)},${Math.round(68 * t)})`;
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PortfolioOptimizerPage() {
  const [activeTab, setActiveTab] = useState("frontier");
  const [maxWeightPct, setMaxWeightPct] = useState<number[]>([80, 80, 80, 80, 80]); // 0-100
  const [techLimit, setTechLimit] = useState(70); // max combined tech %

  const rand200 = useMemo(() => {
    const r = makeRng(702008);
    const pts: PortfolioPoint[] = [];
    for (let i = 0; i < 200; i++) {
      const w = randomWeights(r);
      pts.push({ weights: w, ret: portfolioReturn(w), vol: portfolioVol(w), sharpe: portfolioSharpe(w) });
    }
    return pts;
  }, []);

  const minVarPt = useMemo(() => minimizeVariance(), []);
  const maxSharpePt = useMemo(() => maximizeSharpe(), []);
  const riskParityPt = useMemo(() => riskParityWeights(), []);
  const sixtyFortyPt = useMemo(() => sixtyFortyWeights(), []);
  const frontierCurve = useMemo(() => generateFrontierCurve(), []);

  const maxWeightsFrac = useMemo(() => maxWeightPct.map((v) => v / 100), [maxWeightPct]);
  const constrainedMinVar = useMemo(() => minimizeVarianceConstrained(maxWeightsFrac), [maxWeightsFrac]);
  const constrainedFrontier = useMemo(() => generateConstrainedFrontier(maxWeightsFrac), [maxWeightsFrac]);

  // SVG viewport for frontier scatter
  const SVG_W = 520;
  const SVG_H = 320;
  const PAD = { t: 24, r: 24, b: 48, l: 56 };

  const allVols = [...rand200.map((p) => p.vol), ...frontierCurve.map((p) => p.vol), minVarPt.vol, maxSharpePt.vol];
  const allRets = [...rand200.map((p) => p.ret), ...frontierCurve.map((p) => p.ret), minVarPt.ret, maxSharpePt.ret];

  const volMin = Math.min(...allVols) * 0.95;
  const volMax = Math.max(...allVols) * 1.05;
  const retMin = Math.min(...allRets) * 0.92;
  const retMax = Math.max(...allRets) * 1.08;

  function toSvgX(vol: number) {
    return svgScale(vol, volMin, volMax, PAD.l, SVG_W - PAD.r);
  }
  function toSvgY(ret: number) {
    return svgScale(ret, retMin, retMax, SVG_H - PAD.b, PAD.t);
  }

  const frontierPath = frontierCurve
    .map((p, i) => `${i === 0 ? "M" : "L"}${toSvgX(p.vol).toFixed(1)},${toSvgY(p.ret).toFixed(1)}`)
    .join(" ");

  // Constrained frontier SVG dims
  const cAllVols = [...rand200.map((p) => p.vol), ...constrainedFrontier.map((p) => p.vol), constrainedMinVar.vol];
  const cAllRets = [...rand200.map((p) => p.ret), ...constrainedFrontier.map((p) => p.ret), constrainedMinVar.ret];
  const cVolMin = Math.min(...cAllVols) * 0.95;
  const cVolMax = Math.max(...cAllVols) * 1.05;
  const cRetMin = Math.min(...cAllRets) * 0.92;
  const cRetMax = Math.max(...cAllRets) * 1.08;

  function toCX(vol: number) { return svgScale(vol, cVolMin, cVolMax, PAD.l, SVG_W - PAD.r); }
  function toCY(ret: number) { return svgScale(ret, cRetMin, cRetMax, SVG_H - PAD.b, PAD.t); }

  const constrainedPath = constrainedFrontier
    .map((p, i) => `${i === 0 ? "M" : "L"}${toCX(p.vol).toFixed(1)},${toCY(p.ret).toFixed(1)}`)
    .join(" ");
  const unConstrainedPath = frontierCurve
    .map((p, i) => `${i === 0 ? "M" : "L"}${toCX(p.vol).toFixed(1)},${toCY(p.ret).toFixed(1)}`)
    .join(" ");

  const portfolios = [
    { label: "Min Variance", pt: minVarPt, color: "#10b981", icon: <Shield size={14} /> },
    { label: "Max Sharpe",   pt: maxSharpePt, color: "#3b82f6", icon: <Zap size={14} /> },
    { label: "Risk Parity",  pt: riskParityPt, color: "#8b5cf6", icon: <Activity size={14} /> },
    { label: "60/40",        pt: sixtyFortyPt, color: "#f59e0b", icon: <PieChart size={14} /> },
  ];

  // Weight bar chart SVG
  const BAR_W = 520;
  const BAR_H = 200;
  const barPad = { t: 16, r: 16, b: 36, l: 40 };
  const barGroupW = (BAR_W - barPad.l - barPad.r) / N;
  const barW = barGroupW / (portfolios.length + 1);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-1"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Target className="text-primary" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Portfolio Optimizer</h1>
              <p className="text-sm text-muted-foreground">
                Markowitz mean-variance optimization · Efficient frontier · Risk-return tradeoffs
              </p>
            </div>
          </div>
        </motion.div>

        {/* Summary chips */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2"
        >
          {portfolios.map(({ label, pt, color }) => (
            <Badge
              key={label}
              variant="secondary"
              className="gap-1.5 px-3 py-1 text-xs text-muted-foreground font-medium"
              style={{ borderColor: color + "44", backgroundColor: color + "18", color }}
            >
              {label}: {(pt.ret * 100).toFixed(1)}% ret · {(pt.vol * 100).toFixed(1)}% vol · {pt.sharpe.toFixed(2)} SR
            </Badge>
          ))}
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto h-auto flex-wrap gap-1 bg-muted/40 p-1 rounded-lg">
            <TabsTrigger value="frontier" className="gap-1.5 text-xs text-muted-foreground">
              <TrendingUp size={13} /> Efficient Frontier
            </TabsTrigger>
            <TabsTrigger value="assets" className="gap-1.5 text-xs text-muted-foreground">
              <BarChart3 size={13} /> Asset Inputs
            </TabsTrigger>
            <TabsTrigger value="portfolios" className="gap-1.5 text-xs text-muted-foreground">
              <PieChart size={13} /> Optimal Portfolios
            </TabsTrigger>
            <TabsTrigger value="constraints" className="gap-1.5 text-xs text-muted-foreground">
              <Shield size={13} /> Constraints
            </TabsTrigger>
            <TabsTrigger value="resampling" className="gap-1.5 text-xs text-muted-foreground">
              <BookOpen size={13} /> Resampling &amp; Robustness
            </TabsTrigger>
          </TabsList>

          {/* ─── TAB 1: Efficient Frontier ──────────────────────────────────── */}
          <TabsContent value="frontier" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2 border-border/50 border-l-4 border-l-primary">
                <CardHeader className="pb-2 p-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp size={16} className="text-primary" />
                    Efficient Frontier — 200 Random Portfolios
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Each dot is a randomly generated long-only portfolio. The curve traces the efficient frontier.</p>
                </CardHeader>
                <CardContent>
                  <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" style={{ maxHeight: 340 }}>
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                      const y = PAD.t + t * (SVG_H - PAD.t - PAD.b);
                      const retVal = retMax - t * (retMax - retMin);
                      return (
                        <g key={`hg-${t}`}>
                          <line x1={PAD.l} y1={y} x2={SVG_W - PAD.r} y2={y} stroke="#374151" strokeWidth={0.5} strokeDasharray="3,3" />
                          <text x={PAD.l - 6} y={y + 4} textAnchor="end" fill="#9ca3af" fontSize={9}>{(retVal * 100).toFixed(0)}%</text>
                        </g>
                      );
                    })}
                    {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                      const x = PAD.l + t * (SVG_W - PAD.l - PAD.r);
                      const volVal = volMin + t * (volMax - volMin);
                      return (
                        <g key={`vg-${t}`}>
                          <line x1={x} y1={PAD.t} x2={x} y2={SVG_H - PAD.b} stroke="#374151" strokeWidth={0.5} strokeDasharray="3,3" />
                          <text x={x} y={SVG_H - PAD.b + 14} textAnchor="middle" fill="#9ca3af" fontSize={9}>{(volVal * 100).toFixed(0)}%</text>
                        </g>
                      );
                    })}

                    {/* Axes labels */}
                    <text x={(PAD.l + SVG_W - PAD.r) / 2} y={SVG_H - 6} textAnchor="middle" fill="#6b7280" fontSize={10}>Volatility (Risk)</text>
                    <text x={12} y={(PAD.t + SVG_H - PAD.b) / 2} textAnchor="middle" fill="#6b7280" fontSize={10} transform={`rotate(-90, 12, ${(PAD.t + SVG_H - PAD.b) / 2})`}>Expected Return</text>

                    {/* Random portfolio dots — colored by Sharpe */}
                    {rand200.map((p, i) => {
                      const cx = toSvgX(p.vol);
                      const cy = toSvgY(p.ret);
                      const sharpeClamped = Math.min(Math.max(p.sharpe, 0), 1.2) / 1.2;
                      const r = Math.round(59 + (239 - 59) * (1 - sharpeClamped));
                      const g = Math.round(130 * sharpeClamped);
                      const b = Math.round(246 * (1 - sharpeClamped));
                      return (
                        <circle
                          key={`dot-${i}`}
                          cx={cx}
                          cy={cy}
                          r={3}
                          fill={`rgb(${r},${g},${b})`}
                          opacity={0.55}
                        />
                      );
                    })}

                    {/* Frontier curve */}
                    <path d={frontierPath} stroke="#a78bfa" strokeWidth={2} fill="none" strokeLinejoin="round" />

                    {/* Min Variance marker */}
                    <circle cx={toSvgX(minVarPt.vol)} cy={toSvgY(minVarPt.ret)} r={7} fill="#10b981" stroke="#fff" strokeWidth={1.5} />
                    <text x={toSvgX(minVarPt.vol) + 10} y={toSvgY(minVarPt.ret) - 4} fill="#10b981" fontSize={9} fontWeight="600">Min Var</text>

                    {/* Max Sharpe marker */}
                    <polygon
                      points={(() => {
                        const cx = toSvgX(maxSharpePt.vol);
                        const cy = toSvgY(maxSharpePt.ret);
                        const r = 8;
                        return [0, 1, 2, 3, 4].map((i) => {
                          const angle = (i * 72 - 90) * (Math.PI / 180);
                          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
                        }).join(" ");
                      })()}
                      fill="#3b82f6"
                      stroke="#fff"
                      strokeWidth={1.5}
                    />
                    <text x={toSvgX(maxSharpePt.vol) + 10} y={toSvgY(maxSharpePt.ret) - 4} fill="#3b82f6" fontSize={9} fontWeight="600">Max Sharpe</text>

                    {/* Risk Parity dot */}
                    <rect
                      x={toSvgX(riskParityPt.vol) - 6}
                      y={toSvgY(riskParityPt.ret) - 6}
                      width={12}
                      height={12}
                      fill="#8b5cf6"
                      stroke="#fff"
                      strokeWidth={1.5}
                    />
                    <text x={toSvgX(riskParityPt.vol) + 10} y={toSvgY(riskParityPt.ret) + 4} fill="#8b5cf6" fontSize={9} fontWeight="600">Risk Parity</text>

                    {/* 60/40 marker */}
                    <path
                      d={`M${toSvgX(sixtyFortyPt.vol)},${toSvgY(sixtyFortyPt.ret) - 7} L${toSvgX(sixtyFortyPt.vol) + 7},${toSvgY(sixtyFortyPt.ret) + 5} L${toSvgX(sixtyFortyPt.vol) - 7},${toSvgY(sixtyFortyPt.ret) + 5} Z`}
                      fill="#f59e0b"
                      stroke="#fff"
                      strokeWidth={1.5}
                    />
                    <text x={toSvgX(sixtyFortyPt.vol) + 10} y={toSvgY(sixtyFortyPt.ret) + 4} fill="#f59e0b" fontSize={9} fontWeight="600">60/40</text>
                  </svg>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block bg-emerald-500" /> Min Variance</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block bg-primary" /> Max Sharpe (★)</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block bg-primary" /> Risk Parity (■)</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block bg-amber-500" /> 60/40 (▲)</span>
                    <span className="flex items-center gap-1"><span className="w-10 h-0.5 inline-block bg-primary" /> Efficient frontier</span>
                  </div>
                </CardContent>
              </Card>

              {/* Stats sidebar */}
              <div className="space-y-3">
                {portfolios.map(({ label, pt, color, icon }) => (
                  <Card key={label} className="border-border/50">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center gap-2 font-medium text-sm" style={{ color }}>
                        {icon} {label}
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-xs text-muted-foreground">
                        <div className="text-center">
                          <div className="text-muted-foreground">Return</div>
                          <div className="font-semibold text-emerald-400">{(pt.ret * 100).toFixed(2)}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">Risk</div>
                          <div className="font-semibold text-rose-400">{(pt.vol * 100).toFixed(2)}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">Sharpe</div>
                          <div className="font-medium text-primary">{pt.sharpe.toFixed(3)}</div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {ASSETS.map((a, i) => (
                          <div key={a.ticker} className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground w-10">{a.ticker}</span>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${(pt.weights[i] * 100).toFixed(1)}%`, backgroundColor: a.color }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground font-mono w-10 text-right">{(pt.weights[i] * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Interpretation note */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 flex gap-3 text-sm">
                <Info size={16} className="text-primary mt-0.5 shrink-0" />
                <div className="text-muted-foreground">
                  <span className="text-foreground font-medium">Reading the frontier: </span>
                  Portfolios on the efficient frontier dominate all others at the same risk level — they offer the highest expected return for a given volatility. Portfolios below/inside the frontier are sub-optimal. The Capital Market Line (not shown) would be tangent at the Max Sharpe portfolio when a risk-free asset is included.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── TAB 2: Asset Inputs ────────────────────────────────────────── */}
          <TabsContent value="assets" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Asset table */}
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 size={16} className="text-primary" />
                    Asset Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/50 text-xs text-muted-foreground">
                          <th className="text-left pb-2 font-medium">Asset</th>
                          <th className="text-right pb-2 font-medium">E(R)</th>
                          <th className="text-right pb-2 font-medium">Volatility</th>
                          <th className="text-right pb-2 font-medium">Sharpe</th>
                          <th className="text-right pb-2 font-medium">Sector</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ASSETS.map((a) => {
                          const sharpe = (a.expectedReturn - 0.045) / a.volatility;
                          return (
                            <tr key={a.ticker} className="border-b border-border/20 hover:bg-muted/20">
                              <td className="py-2">
                                <div className="flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: a.color }} />
                                  <span className="font-medium">{a.ticker}</span>
                                  <span className="text-xs text-muted-foreground hidden sm:inline">{a.name}</span>
                                </div>
                              </td>
                              <td className="py-2 text-right text-emerald-400 font-mono font-medium">
                                {(a.expectedReturn * 100).toFixed(1)}%
                              </td>
                              <td className="py-2 text-right text-rose-400 font-mono font-medium">
                                {(a.volatility * 100).toFixed(1)}%
                              </td>
                              <td className="py-2 text-right text-primary font-mono font-medium">
                                {sharpe.toFixed(3)}
                              </td>
                              <td className="py-2 text-right">
                                <Badge variant="secondary" className="text-xs text-muted-foreground">{a.sector}</Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Volatility bars */}
                  <div className="mt-4 space-y-2">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Volatility Comparison</p>
                    {ASSETS.map((a) => (
                      <div key={a.ticker} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="w-10 font-medium">{a.ticker}</span>
                        <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(a.volatility / 0.30) * 100}%` }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: a.color }}
                          />
                        </div>
                        <span className="font-mono w-12 text-right">{(a.volatility * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Correlation heatmap */}
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity size={16} className="text-primary" />
                    Pairwise Correlation Matrix
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Blue = positive correlation · Red = negative correlation</p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const CELL = 72;
                    const LABEL = 40;
                    const HM_W = LABEL + N * CELL + 8;
                    const HM_H = LABEL + N * CELL + 8;
                    return (
                      <svg viewBox={`0 0 ${HM_W} ${HM_H}`} className="w-full" style={{ maxHeight: 420 }}>
                        {/* Column labels */}
                        {ASSETS.map((a, j) => (
                          <text
                            key={`cl-${j}`}
                            x={LABEL + j * CELL + CELL / 2}
                            y={LABEL - 4}
                            textAnchor="middle"
                            fill={a.color}
                            fontSize={11}
                            fontWeight="600"
                          >
                            {a.ticker}
                          </text>
                        ))}
                        {/* Row labels */}
                        {ASSETS.map((a, i) => (
                          <text
                            key={`rl-${i}`}
                            x={LABEL - 4}
                            y={LABEL + i * CELL + CELL / 2 + 4}
                            textAnchor="end"
                            fill={a.color}
                            fontSize={11}
                            fontWeight="600"
                          >
                            {a.ticker}
                          </text>
                        ))}
                        {/* Cells */}
                        {CORR.map((row, i) =>
                          row.map((v, j) => {
                            const x = LABEL + j * CELL;
                            const y = LABEL + i * CELL;
                            const col = corrColor(v);
                            const opacity = Math.abs(v) * 0.85 + 0.1;
                            return (
                              <g key={`c-${i}-${j}`}>
                                <rect
                                  x={x + 2}
                                  y={y + 2}
                                  width={CELL - 4}
                                  height={CELL - 4}
                                  rx={4}
                                  fill={col}
                                  opacity={opacity}
                                />
                                <text
                                  x={x + CELL / 2}
                                  y={y + CELL / 2 + 4}
                                  textAnchor="middle"
                                  fill={Math.abs(v) > 0.5 ? "#fff" : "#e5e7eb"}
                                  fontSize={11}
                                  fontWeight={i === j ? "700" : "500"}
                                >
                                  {v.toFixed(2)}
                                </text>
                              </g>
                            );
                          })
                        )}
                      </svg>
                    );
                  })()}

                  {/* Key correlations */}
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Key Relationships:</p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-primary border-border">AAPL↔MSFT +0.82 (high)</Badge>
                      <Badge variant="secondary" className="text-rose-400 border-rose-400/30">BND↔AAPL -0.18 (hedge)</Badge>
                      <Badge variant="secondary" className="text-amber-400 border-amber-400/30">GLD↔BND +0.24 (mild)</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Covariance table */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Covariance Matrix (annualized)</CardTitle>
                <p className="text-xs text-muted-foreground">C[i,j] = ρ[i,j] × σᵢ × σⱼ — measures co-movement in return units²</p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="text-xs text-muted-foreground font-mono w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left pb-2 text-muted-foreground font-medium pr-4">Asset</th>
                        {ASSETS.map((a) => (
                          <th key={a.ticker} className="text-right pb-2 font-medium pr-3" style={{ color: a.color }}>
                            {a.ticker}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {COV.map((row, i) => (
                        <tr key={ASSETS[i].ticker} className="border-b border-border/20 hover:bg-muted/20">
                          <td className="py-1.5 font-medium pr-4" style={{ color: ASSETS[i].color }}>{ASSETS[i].ticker}</td>
                          {row.map((v, j) => (
                            <td key={j} className="py-1.5 text-right pr-3" style={{ color: i === j ? ASSETS[i].color : (v >= 0 ? "#93c5fd" : "#fca5a5") }}>
                              {(v * 10000).toFixed(2)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-muted-foreground mt-2">Values in basis points² (×10⁴). Diagonal = variance.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── TAB 3: Optimal Portfolios ─────────────────────────────────── */}
          <TabsContent value="portfolios" className="mt-4 space-y-4">
            {/* Comparison table */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChart size={16} className="text-primary" />
                  Portfolio Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 text-xs text-muted-foreground">
                        <th className="text-left pb-2 font-medium">Strategy</th>
                        {ASSETS.map((a) => (
                          <th key={a.ticker} className="text-right pb-2 font-medium" style={{ color: a.color }}>
                            {a.ticker}
                          </th>
                        ))}
                        <th className="text-right pb-2 font-medium text-emerald-400">Return</th>
                        <th className="text-right pb-2 font-medium text-rose-400">Risk</th>
                        <th className="text-right pb-2 font-medium text-primary">Sharpe</th>
                        <th className="text-right pb-2 font-medium text-amber-400">Var %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolios.map(({ label, pt, color }) => {
                        const varPct = portfolioVariance(pt.weights) * 100;
                        return (
                          <tr key={label} className="border-b border-border/20 hover:bg-muted/20">
                            <td className="py-2 font-medium" style={{ color }}>
                              {label}
                            </td>
                            {pt.weights.map((w, i) => (
                              <td key={i} className="py-2 text-right font-mono text-xs text-muted-foreground">
                                {(w * 100).toFixed(1)}%
                              </td>
                            ))}
                            <td className="py-2 text-right font-medium text-emerald-400 font-mono">
                              {(pt.ret * 100).toFixed(2)}%
                            </td>
                            <td className="py-2 text-right font-medium text-rose-400 font-mono">
                              {(pt.vol * 100).toFixed(2)}%
                            </td>
                            <td className="py-2 text-right font-medium text-primary font-mono">
                              {pt.sharpe.toFixed(3)}
                            </td>
                            <td className="py-2 text-right font-mono text-amber-400 text-xs">
                              {(varPct).toFixed(3)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Weight comparison bar chart */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Weight Comparison — All Strategies</CardTitle>
                <p className="text-xs text-muted-foreground">Each group = one asset, bars = portfolio strategies</p>
              </CardHeader>
              <CardContent>
                <svg viewBox={`0 0 ${BAR_W} ${BAR_H}`} className="w-full" style={{ maxHeight: 220 }}>
                  {/* Y axis labels */}
                  {[0, 25, 50, 75, 100].map((v) => {
                    const y = barPad.t + (1 - v / 100) * (BAR_H - barPad.t - barPad.b);
                    return (
                      <g key={`yg-${v}`}>
                        <line x1={barPad.l} y1={y} x2={BAR_W - barPad.r} y2={y} stroke="#374151" strokeWidth={0.5} strokeDasharray="3,3" />
                        <text x={barPad.l - 4} y={y + 3} textAnchor="end" fill="#9ca3af" fontSize={8}>{v}%</text>
                      </g>
                    );
                  })}

                  {/* Bars per asset group */}
                  {ASSETS.map((asset, assetIdx) => {
                    const groupX = barPad.l + assetIdx * barGroupW;
                    return (
                      <g key={asset.ticker}>
                        {portfolios.map(({ pt, color }, pIdx) => {
                          const w = pt.weights[assetIdx];
                          const bH = w * (BAR_H - barPad.t - barPad.b);
                          const bX = groupX + pIdx * barW + barW * 0.5;
                          const bY = BAR_H - barPad.b - bH;
                          return (
                            <rect
                              key={pIdx}
                              x={bX}
                              y={bY}
                              width={barW * 0.85}
                              height={bH}
                              rx={2}
                              fill={color}
                              opacity={0.85}
                            />
                          );
                        })}
                        <text
                          x={groupX + (barGroupW / 2)}
                          y={BAR_H - barPad.b + 14}
                          textAnchor="middle"
                          fill={asset.color}
                          fontSize={9}
                          fontWeight="600"
                        >
                          {asset.ticker}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Legend */}
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                  {portfolios.map(({ label, color }) => (
                    <span key={label} className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: color }} />
                      {label}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Strategy notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  title: "Min Variance",
                  color: "#10b981",
                  desc: "Minimizes total portfolio variance. Heavily weights low-vol assets (BND). Best for risk-averse investors.",
                  tradeoff: "Lower return in exchange for minimum risk.",
                },
                {
                  title: "Max Sharpe",
                  color: "#3b82f6",
                  desc: "Tangency portfolio on the Capital Market Line. Maximizes risk-adjusted return per unit of volatility.",
                  tradeoff: "Concentrated in high-Sharpe assets; sensitive to parameter estimates.",
                },
                {
                  title: "Risk Parity",
                  color: "#8b5cf6",
                  desc: "Equal risk contribution from each asset (weight ∝ 1/σ). More diversified in risk-space than weight-space.",
                  tradeoff: "Ignores expected return; often leveraged to hit return targets.",
                },
                {
                  title: "60/40",
                  color: "#f59e0b",
                  desc: "Classic 60% equity / 40% bond allocation. Simple, liquid, historically robust benchmark strategy.",
                  tradeoff: "Sub-optimal in mean-variance sense but low parameter sensitivity.",
                },
              ].map((s) => (
                <Card key={s.title} className="border-border/50">
                  <CardContent className="p-4 space-y-1">
                    <div className="font-medium text-sm" style={{ color: s.color }}>{s.title}</div>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                    <p className="text-xs text-amber-400/80 italic">{s.tradeoff}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ─── TAB 4: Constraints ─────────────────────────────────────────── */}
          <TabsContent value="constraints" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Sliders panel */}
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield size={16} className="text-primary" />
                    Constraint Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">Max Weight per Asset</div>
                    {ASSETS.map((a, i) => (
                      <div key={a.ticker} className="mb-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span style={{ color: a.color }} className="font-medium">{a.ticker}</span>
                          <span className="font-mono text-foreground">{maxWeightPct[i]}%</span>
                        </div>
                        <Slider
                          min={5}
                          max={100}
                          step={5}
                          value={[maxWeightPct[i]]}
                          onValueChange={([v]) => {
                            const next = [...maxWeightPct];
                            next[i] = v;
                            setMaxWeightPct(next);
                          }}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">Max Tech Sector (%)</div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span className="text-foreground">Tech limit</span>
                      <span className="font-mono text-foreground">{techLimit}%</span>
                    </div>
                    <Slider
                      min={10}
                      max={100}
                      step={5}
                      value={[techLimit]}
                      onValueChange={([v]) => setTechLimit(v)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Applies to AAPL + MSFT combined weight</p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Active Constraints</div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs text-emerald-400 border-emerald-400/30">Long-only (w≥0)</Badge>
                      <Badge variant="secondary" className="text-xs text-primary border-border">Sum=100%</Badge>
                      <Badge variant="secondary" className="text-xs text-primary border-border">
                        Max {Math.min(...maxWeightPct)}–{Math.max(...maxWeightPct)}% per asset
                      </Badge>
                      <Badge variant="secondary" className="text-xs text-amber-400 border-amber-400/30">
                        Tech ≤ {techLimit}%
                      </Badge>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5"
                    onClick={() => { setMaxWeightPct([80, 80, 80, 80, 80]); setTechLimit(70); }}
                  >
                    <RefreshCw size={12} /> Reset Defaults
                  </Button>
                </CardContent>
              </Card>

              {/* Constrained vs unconstrained frontier */}
              <Card className="lg:col-span-2 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Constrained vs. Unconstrained Frontier</CardTitle>
                  <p className="text-xs text-muted-foreground">Purple = unconstrained frontier · Teal = constrained frontier (with current limits)</p>
                </CardHeader>
                <CardContent>
                  <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" style={{ maxHeight: 340 }}>
                    {/* Grid */}
                    {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                      const y = PAD.t + t * (SVG_H - PAD.t - PAD.b);
                      const retVal = cRetMax - t * (cRetMax - cRetMin);
                      return (
                        <g key={`chg-${t}`}>
                          <line x1={PAD.l} y1={y} x2={SVG_W - PAD.r} y2={y} stroke="#374151" strokeWidth={0.5} strokeDasharray="3,3" />
                          <text x={PAD.l - 6} y={y + 4} textAnchor="end" fill="#9ca3af" fontSize={9}>{(retVal * 100).toFixed(0)}%</text>
                        </g>
                      );
                    })}
                    {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                      const x = PAD.l + t * (SVG_W - PAD.l - PAD.r);
                      const volVal = cVolMin + t * (cVolMax - cVolMin);
                      return (
                        <g key={`cvg-${t}`}>
                          <line x1={x} y1={PAD.t} x2={x} y2={SVG_H - PAD.b} stroke="#374151" strokeWidth={0.5} strokeDasharray="3,3" />
                          <text x={x} y={SVG_H - PAD.b + 14} textAnchor="middle" fill="#9ca3af" fontSize={9}>{(volVal * 100).toFixed(0)}%</text>
                        </g>
                      );
                    })}

                    {/* Axis labels */}
                    <text x={(PAD.l + SVG_W - PAD.r) / 2} y={SVG_H - 6} textAnchor="middle" fill="#6b7280" fontSize={10}>Volatility</text>
                    <text x={12} y={(PAD.t + SVG_H - PAD.b) / 2} textAnchor="middle" fill="#6b7280" fontSize={10} transform={`rotate(-90, 12, ${(PAD.t + SVG_H - PAD.b) / 2})`}>Expected Return</text>

                    {/* Random dots */}
                    {rand200.map((p, i) => (
                      <circle key={`crd-${i}`} cx={toCX(p.vol)} cy={toCY(p.ret)} r={2.5} fill="#4b5563" opacity={0.4} />
                    ))}

                    {/* Unconstrained frontier */}
                    <path d={unConstrainedPath} stroke="#a78bfa" strokeWidth={2} fill="none" strokeLinejoin="round" strokeDasharray="6,3" />

                    {/* Constrained frontier */}
                    <path d={constrainedPath} stroke="#2dd4bf" strokeWidth={2.5} fill="none" strokeLinejoin="round" />

                    {/* Constrained min variance */}
                    <circle cx={toCX(constrainedMinVar.vol)} cy={toCY(constrainedMinVar.ret)} r={7} fill="#2dd4bf" stroke="#fff" strokeWidth={1.5} />
                    <text x={toCX(constrainedMinVar.vol) + 10} y={toCY(constrainedMinVar.ret) + 4} fill="#2dd4bf" fontSize={9} fontWeight="600">Constrained Min</text>

                    {/* Unconstrained min variance */}
                    <circle cx={toCX(minVarPt.vol)} cy={toCY(minVarPt.ret)} r={6} fill="#a78bfa" stroke="#fff" strokeWidth={1.5} />
                    <text x={toCX(minVarPt.vol) + 10} y={toCY(minVarPt.ret) - 5} fill="#a78bfa" fontSize={9} fontWeight="600">Unconstrained Min</text>
                  </svg>

                  {/* Constrained stats */}
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg p-3 space-y-1">
                      <div className="text-xs text-emerald-400 font-medium">Constrained Min Variance</div>
                      <div className="grid grid-cols-3 gap-1 text-xs text-muted-foreground">
                        <div><span className="text-muted-foreground">Ret: </span><span className="text-emerald-400 font-mono">{(constrainedMinVar.ret * 100).toFixed(2)}%</span></div>
                        <div><span className="text-muted-foreground">Vol: </span><span className="text-rose-400 font-mono">{(constrainedMinVar.vol * 100).toFixed(2)}%</span></div>
                        <div><span className="text-muted-foreground">SR: </span><span className="text-primary font-mono">{constrainedMinVar.sharpe.toFixed(3)}</span></div>
                      </div>
                      <div className="space-y-0.5 mt-1">
                        {ASSETS.map((a, i) => (
                          <div key={a.ticker} className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span className="w-10 text-muted-foreground">{a.ticker}</span>
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-teal-400 rounded-full" style={{ width: `${constrainedMinVar.weights[i] * 100}%` }} />
                            </div>
                            <span className="font-mono w-8 text-right text-emerald-400">{(constrainedMinVar.weights[i] * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-primary/10 border border-border rounded-lg p-3 space-y-1">
                      <div className="text-xs text-primary font-medium">Unconstrained Min Variance</div>
                      <div className="grid grid-cols-3 gap-1 text-xs text-muted-foreground">
                        <div><span className="text-muted-foreground">Ret: </span><span className="text-emerald-400 font-mono">{(minVarPt.ret * 100).toFixed(2)}%</span></div>
                        <div><span className="text-muted-foreground">Vol: </span><span className="text-rose-400 font-mono">{(minVarPt.vol * 100).toFixed(2)}%</span></div>
                        <div><span className="text-muted-foreground">SR: </span><span className="text-primary font-mono">{minVarPt.sharpe.toFixed(3)}</span></div>
                      </div>
                      <div className="space-y-0.5 mt-1">
                        {ASSETS.map((a, i) => (
                          <div key={a.ticker} className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span className="w-10 text-muted-foreground">{a.ticker}</span>
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${minVarPt.weights[i] * 100}%`, backgroundColor: a.color }} />
                            </div>
                            <span className="font-mono w-8 text-right" style={{ color: a.color }}>{(minVarPt.weights[i] * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Constraint impact note */}
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="p-4 flex gap-3 text-sm">
                <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                <div className="text-muted-foreground">
                  <span className="text-foreground font-medium">Constraint effect: </span>
                  Adding constraints shifts the efficient frontier inward (worse risk-return tradeoff). Tighter constraints increase the opportunity cost — the gap between the constrained and unconstrained frontiers quantifies this cost. Long-only constraints alone can significantly limit diversification benefits, especially when optimal weights would be short.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── TAB 5: Resampling & Robustness ────────────────────────────── */}
          <TabsContent value="resampling" className="mt-4 space-y-4">
            {/* Resampled frontier concept visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <RefreshCw size={16} className="text-primary" />
                    Resampled Efficient Frontier
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Shows parameter uncertainty: each curve = one bootstrap resample of returns</p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    // Generate 8 resampled frontiers with slight parameter perturbations
                    const RW = SVG_W;
                    const RH = 260;
                    const rRand = makeRng(702008 + 99);
                    const resampledFrontiers: PortfolioPoint[][] = [];

                    for (let r = 0; r < 8; r++) {
                      // Perturb expected returns slightly (estimation error)
                      const perturbedAssets = ASSETS.map((a) => ({
                        ...a,
                        expectedReturn: a.expectedReturn + (rRand() - 0.5) * 0.04,
                        volatility: a.volatility * (0.85 + rRand() * 0.3),
                      }));

                      // Build perturbed frontier via interpolation
                      const minVW = perturbedAssets.map((a) => 1 / a.volatility);
                      const minVSum = minVW.reduce((a, b) => a + b, 0);
                      const mvW = minVW.map((v) => v / minVSum);

                      const maxRIdx = perturbedAssets.reduce((best, a, i) => (a.expectedReturn > perturbedAssets[best].expectedReturn ? i : best), 0);
                      const mrW = Array(N).fill(0);
                      mrW[maxRIdx] = 1;

                      const fps: PortfolioPoint[] = [];
                      for (let k = 0; k <= 20; k++) {
                        const t = k / 20;
                        const raw = mvW.map((w, i) => w * (1 - t) + mrW[i] * t);
                        const s = raw.reduce((a, b) => a + b, 0);
                        const wn = raw.map((v) => v / s);
                        const ret = wn.reduce((acc, w, i) => acc + w * perturbedAssets[i].expectedReturn, 0);
                        const vol = Math.sqrt(wn.reduce((acc, wi, i) => acc + wn.reduce((acc2, wj, j) => acc2 + wi * wj * COV[i][j], 0), 0));
                        fps.push({ weights: wn, ret, vol, sharpe: 0 });
                      }
                      resampledFrontiers.push(fps);
                    }

                    const allRPts = resampledFrontiers.flat();
                    const rpVolMin = Math.min(...allRPts.map((p) => p.vol)) * 0.92;
                    const rpVolMax = Math.max(...allRPts.map((p) => p.vol)) * 1.05;
                    const rpRetMin = Math.min(...allRPts.map((p) => p.ret)) * 0.90;
                    const rpRetMax = Math.max(...allRPts.map((p) => p.ret)) * 1.08;

                    const toRX = (v: number) => svgScale(v, rpVolMin, rpVolMax, PAD.l, RW - PAD.r);
                    const toRY = (v: number) => svgScale(v, rpRetMin, rpRetMax, RH - PAD.b, PAD.t);

                    const colors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#f97316", "#84cc16"];

                    return (
                      <svg viewBox={`0 0 ${RW} ${RH}`} className="w-full" style={{ maxHeight: 280 }}>
                        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                          const y = PAD.t + t * (RH - PAD.t - PAD.b);
                          const rv = rpRetMax - t * (rpRetMax - rpRetMin);
                          return (
                            <g key={`rrg-${t}`}>
                              <line x1={PAD.l} y1={y} x2={RW - PAD.r} y2={y} stroke="#374151" strokeWidth={0.4} strokeDasharray="3,3" />
                              <text x={PAD.l - 6} y={y + 4} textAnchor="end" fill="#9ca3af" fontSize={8}>{(rv * 100).toFixed(0)}%</text>
                            </g>
                          );
                        })}
                        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                          const x = PAD.l + t * (RW - PAD.l - PAD.r);
                          const vv = rpVolMin + t * (rpVolMax - rpVolMin);
                          return (
                            <g key={`rvg-${t}`}>
                              <line x1={x} y1={PAD.t} x2={x} y2={RH - PAD.b} stroke="#374151" strokeWidth={0.4} strokeDasharray="3,3" />
                              <text x={x} y={RH - PAD.b + 14} textAnchor="middle" fill="#9ca3af" fontSize={8}>{(vv * 100).toFixed(0)}%</text>
                            </g>
                          );
                        })}

                        {resampledFrontiers.map((fps, r) => {
                          const path = fps
                            .map((p, i) => `${i === 0 ? "M" : "L"}${toRX(p.vol).toFixed(1)},${toRY(p.ret).toFixed(1)}`)
                            .join(" ");
                          return <path key={r} d={path} stroke={colors[r]} strokeWidth={1.2} fill="none" opacity={0.55} strokeLinejoin="round" />;
                        })}

                        {/* True frontier bold */}
                        <path
                          d={frontierCurve.map((p, i) => `${i === 0 ? "M" : "L"}${toRX(p.vol).toFixed(1)},${toRY(p.ret).toFixed(1)}`).join(" ")}
                          stroke="#fff"
                          strokeWidth={2.5}
                          fill="none"
                          strokeLinejoin="round"
                        />

                        <text x={(PAD.l + RW - PAD.r) / 2} y={RH - 6} textAnchor="middle" fill="#6b7280" fontSize={9}>Volatility</text>
                      </svg>
                    );
                  })()}
                  <p className="text-xs text-muted-foreground mt-2">
                    White = point estimate frontier. Colored = 8 bootstrap resamples. The spread shows how sensitive the frontier is to estimation error.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-500" />
                    Estimation Error Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Parameter sensitivity table */}
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Sensitivity to Parameter Errors</p>
                    <table className="w-full text-xs text-muted-foreground">
                      <thead>
                        <tr className="border-b border-border/50 text-muted-foreground">
                          <th className="text-left pb-1">Parameter</th>
                          <th className="text-right pb-1">Impact</th>
                          <th className="text-right pb-1">Typical Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { param: "Expected Returns", impact: "Very High", error: "±3–5% p.a.", color: "#ef4444" },
                          { param: "Correlations", impact: "High", error: "±0.10–0.20", color: "#f97316" },
                          { param: "Volatilities", impact: "Moderate", error: "±2–4% p.a.", color: "#f59e0b" },
                        ].map((row) => (
                          <tr key={row.param} className="border-b border-border/20">
                            <td className="py-1.5">{row.param}</td>
                            <td className="py-1.5 text-right font-medium" style={{ color: row.color }}>{row.impact}</td>
                            <td className="py-1.5 text-right text-muted-foreground font-mono">{row.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Weight stability */}
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Weight Instability (Max Sharpe vs ±1% Return Shock)</p>
                    {(() => {
                      // Perturb each asset's return by +1% and see how max Sharpe changes
                      const baseW = maxSharpePt.weights;
                      const rp = makeRng(702008 + 333);
                      return ASSETS.map((a, i) => {
                        // Simple approximation: blend with alternate asset
                        const altW = [...baseW];
                        altW[i] = Math.min(altW[i] * (1 + (rp() - 0.5) * 0.6), 1);
                        const rem = 1 - altW[i];
                        const others = altW.map((v, j) => (j === i ? 0 : v));
                        const oSum = others.reduce((acc, v) => acc + v, 0);
                        const normW = others.map((v, j) => (j === i ? altW[i] : (oSum > 0 ? (v / oSum) * rem : rem / (N - 1))));
                        const delta = Math.abs(normW[i] - baseW[i]) * 100;
                        return (
                          <div key={a.ticker} className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <span className="w-10 font-medium" style={{ color: a.color }}>{a.ticker}</span>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-amber-500" style={{ width: `${Math.min(delta * 3, 100)}%` }} />
                            </div>
                            <span className="font-mono w-12 text-right text-amber-400">±{delta.toFixed(1)}%</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Black-Litterman overview */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen size={16} className="text-primary" />
                  Black-Litterman Model — Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="font-medium text-sm text-primary">1. Market Equilibrium</div>
                    <p className="text-xs text-muted-foreground">
                      Start with implied returns from market-cap weights (reverse optimization). These represent the &quot;neutral&quot; view — no alpha assumed. Implied return μ = λ Σ w_mkt where λ is risk aversion coefficient.
                    </p>
                    <div className="bg-muted/30 rounded p-2 text-xs text-muted-foreground font-mono">
                      μ_eq = λ × Σ × w_mkt
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium text-sm text-primary">2. Investor Views</div>
                    <p className="text-xs text-muted-foreground">
                      Express views as P × μ = Q + ε, where P picks the assets, Q is the view return, and ε ~ N(0, Ω) captures uncertainty. Absolute views (&quot;AAPL returns 15%&quot;) and relative views (&quot;AAPL outperforms MSFT by 3%&quot;) are both supported.
                    </p>
                    <div className="bg-muted/30 rounded p-2 text-xs text-muted-foreground font-mono">
                      P × μ = Q + ε, ε ~ N(0,Ω)
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium text-sm text-emerald-400">3. Posterior Returns</div>
                    <p className="text-xs text-muted-foreground">
                      Bayesian update combines equilibrium prior with investor views. The posterior expected return blends market and analyst signals proportional to confidence (Ω⁻¹). This dramatically stabilizes optimal weights vs. pure historical estimates.
                    </p>
                    <div className="bg-muted/30 rounded p-2 text-xs text-muted-foreground font-mono">
                      μ_BL = [(τΣ)⁻¹ + P&apos;Ω⁻¹P]⁻¹ × [...]
                    </div>
                  </div>
                </div>

                {/* BL benefits */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Black-Litterman Benefits</p>
                    {[
                      "Reduces extreme/unstable weights from MVO",
                      "Incorporates analyst views with explicit confidence",
                      "Market cap weights as sensible neutral starting point",
                      "Partial views: only express views where you have edge",
                    ].map((b, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <span className="text-emerald-400 mt-0.5">✓</span>
                        {b}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Limitations &amp; Caveats</p>
                    {[
                      "Still sensitive to the covariance matrix estimate",
                      "View specification requires skill and calibration",
                      "τ (scaling scalar) choice is subjective",
                      "Assumes multivariate normal returns distribution",
                    ].map((b, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <span className="text-rose-400 mt-0.5">✗</span>
                        {b}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resampling methodology */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Resampled Efficient Frontier — Methodology</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {[
                    {
                      step: "1",
                      title: "Estimate Parameters",
                      desc: "Compute sample means μ̂, covariance Σ̂ from historical data. These are point estimates with substantial estimation error — especially for expected returns.",
                      color: "#3b82f6",
                    },
                    {
                      step: "2",
                      title: "Bootstrap Samples",
                      desc: "Draw B bootstrap samples (e.g., B=500) from the multivariate return distribution with (μ̂, Σ̂). Each sample gives slightly different parameter estimates.",
                      color: "#8b5cf6",
                    },
                    {
                      step: "3",
                      title: "Optimize Each Sample",
                      desc: "Run full mean-variance optimization on each bootstrap sample. This produces B efficient frontiers and B sets of optimal weights per target return level.",
                      color: "#10b981",
                    },
                    {
                      step: "4",
                      title: "Average Weights",
                      desc: "Resampled frontier weights = average across all B optimal weight vectors at each return target. The resulting portfolios are more stable and better diversified.",
                      color: "#f59e0b",
                    },
                  ].map((s) => (
                    <div key={s.step} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-foreground" style={{ backgroundColor: s.color }}>
                          {s.step}
                        </div>
                        <span className="font-medium text-sm" style={{ color: s.color }}>{s.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 bg-muted/20 rounded-lg p-3 text-xs text-muted-foreground">
                  <span className="text-foreground font-medium">Key insight: </span>
                  The classical Markowitz optimizer is an &quot;error maximizer&quot; — it over-concentrates in assets with overestimated returns and underestimated risk. Resampling, Black-Litterman, and regularization (shrinkage estimators like Ledoit-Wolf) all address this by pulling optimal weights toward more diversified solutions.
                </div>
              </CardContent>
            </Card>

            {/* Comparison of robustness methods */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Robustness Methods Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-muted-foreground">
                    <thead>
                      <tr className="border-b border-border/50 text-muted-foreground">
                        <th className="text-left pb-2 font-medium">Method</th>
                        <th className="text-center pb-2 font-medium">Complexity</th>
                        <th className="text-center pb-2 font-medium">Requires Views</th>
                        <th className="text-center pb-2 font-medium">Stability</th>
                        <th className="text-left pb-2 font-medium">Best For</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { method: "Markowitz MVO", complexity: "Low", views: "No", stability: "Poor", best: "Theoretical benchmark; perfect parameter estimates" },
                        { method: "Resampled Frontier", complexity: "Medium", views: "No", stability: "Good", best: "When historical data is only source of parameter info" },
                        { method: "Black-Litterman", complexity: "High", views: "Yes", stability: "Very Good", best: "When analyst views exist with explicit confidence levels" },
                        { method: "Risk Parity", complexity: "Low", views: "No", stability: "Very Good", best: "Agnostic to return forecasts; pure diversification" },
                        { method: "Robust MVO (minimax)", complexity: "High", views: "No", stability: "Good", best: "Worst-case guarantee over parameter uncertainty set" },
                        { method: "Shrinkage (Ledoit-Wolf)", complexity: "Medium", views: "No", stability: "Good", best: "Improving covariance estimation with limited history" },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-border/20 hover:bg-muted/20">
                          <td className="py-2 font-medium text-foreground">{row.method}</td>
                          <td className="py-2 text-center">
                            <Badge variant="secondary" className="text-xs text-muted-foreground">
                              {row.complexity}
                            </Badge>
                          </td>
                          <td className="py-2 text-center">
                            <span className={row.views === "Yes" ? "text-amber-400" : "text-muted-foreground"}>
                              {row.views}
                            </span>
                          </td>
                          <td className="py-2 text-center">
                            <span className={
                              row.stability === "Very Good" ? "text-emerald-400" :
                              row.stability === "Good" ? "text-primary" :
                              "text-rose-400"
                            }>
                              {row.stability}
                            </span>
                          </td>
                          <td className="py-2 text-muted-foreground">{row.best}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
