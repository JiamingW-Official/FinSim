"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FlaskConical,
  TrendingUp,
  BarChart2,
  Database,
  Brain,
  Plus,
  X,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 995;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
const _vals = Array.from({ length: 2000 }, () => rand());
let _vi = 0;
const sv = () => _vals[_vi++ % _vals.length];

// ── Types ──────────────────────────────────────────────────────────────────────
type SignalCategory = "value" | "momentum" | "quality" | "sentiment" | "technical";
type DecaySpeed = "slow" | "medium" | "fast";
type Universe = "US Large Cap" | "Global" | "Small Cap";
type CostTier = "Low" | "Medium" | "High" | "Very High";

interface AlphaSignal {
  id: string;
  name: string;
  category: SignalCategory;
  ic: number;
  ir: number;
  decay: DecaySpeed;
  universe: Universe;
  description: string;
}

interface AltDataSource {
  name: string;
  leadTime: string;
  coverage: string;
  cost: CostTier;
  description: string;
  accuracy: number;
}

interface MLModel {
  name: string;
  r2InSample: number;
  r2OutOfSample: number;
  overfit: string;
  features: string[];
  risk: string;
}

// ── Static Data ────────────────────────────────────────────────────────────────
const ALPHA_SIGNALS: AlphaSignal[] = [
  {
    id: "bm",
    name: "Book-to-Market",
    category: "value",
    ic: 0.048,
    ir: 0.62,
    decay: "slow",
    universe: "US Large Cap",
    description: "Classic Fama-French value factor. High B/M stocks historically outperform low B/M, compensating for distress risk.",
  },
  {
    id: "mom12",
    name: "12-Month Momentum",
    category: "momentum",
    ic: 0.071,
    ir: 0.89,
    decay: "medium",
    universe: "US Large Cap",
    description: "Past 12-month return (skip 1 month). Jegadeesh & Titman (1993). Works across asset classes. Prone to sudden reversals.",
  },
  {
    id: "gp",
    name: "Gross Profitability",
    category: "quality",
    ic: 0.059,
    ir: 0.74,
    decay: "slow",
    universe: "Global",
    description: "Revenue minus COGS divided by total assets (Novy-Marx 2013). Robust quality signal uncorrelated with classic value.",
  },
  {
    id: "sa",
    name: "Short Interest Ratio",
    category: "sentiment",
    ic: 0.063,
    ir: 0.81,
    decay: "fast",
    universe: "US Large Cap",
    description: "High short interest predicts underperformance. Captures informed bearish views. Decays quickly with price discovery.",
  },
  {
    id: "rsi_rev",
    name: "RSI Mean Reversion",
    category: "technical",
    ic: 0.034,
    ir: 0.44,
    decay: "fast",
    universe: "Small Cap",
    description: "Contrarian signal: buy oversold (RSI < 30), sell overbought (RSI > 70). Works in low-momentum regimes.",
  },
  {
    id: "accruals",
    name: "Accrual Anomaly",
    category: "quality",
    ic: 0.052,
    ir: 0.67,
    decay: "slow",
    universe: "Global",
    description: "Low accruals (high cash earnings) predict outperformance. Sloan (1996). Reflects earnings quality and persistence.",
  },
  {
    id: "ep",
    name: "Earnings-to-Price",
    category: "value",
    ic: 0.045,
    ir: 0.58,
    decay: "slow",
    universe: "Global",
    description: "Forward earnings yield. Combines cheapness with near-term earnings visibility. Higher IC in value-friendly regimes.",
  },
  {
    id: "vol",
    name: "Low Volatility",
    category: "technical",
    ic: 0.042,
    ir: 0.55,
    decay: "medium",
    universe: "US Large Cap",
    description: "Low realized volatility stocks outperform on risk-adjusted basis (Black 1972). Exploits leverage aversion.",
  },
];

const ALT_DATA_SOURCES: AltDataSource[] = [
  {
    name: "Satellite Imagery",
    leadTime: "2–4 weeks",
    coverage: "Global (retail, energy)",
    cost: "Very High",
    description: "Parking lot fill rates, oil tanker movements, crop yields. Requires proprietary ML pipelines.",
    accuracy: 0.71,
  },
  {
    name: "Credit Card Transactions",
    leadTime: "1–2 weeks",
    coverage: "US Consumer (70% spend)",
    cost: "High",
    description: "Real-time consumer spending by merchant category. Predict retail earnings 10–14 days before release.",
    accuracy: 0.84,
  },
  {
    name: "Job Postings",
    leadTime: "4–8 weeks",
    coverage: "Global (indeed, LinkedIn)",
    cost: "Medium",
    description: "Hiring velocity signals business confidence and revenue expectations. Negative hires = cost-cutting signal.",
    accuracy: 0.66,
  },
  {
    name: "Patent Filings",
    leadTime: "3–6 months",
    coverage: "Global",
    cost: "Low",
    description: "IP activity as proxy for R&D spend and innovation pipeline. Long lead time limits tactical use.",
    accuracy: 0.58,
  },
  {
    name: "Social Sentiment",
    leadTime: "1–3 days",
    coverage: "US Large Cap (noisy)",
    cost: "Medium",
    description: "NLP on Twitter/Reddit/news flow. Captures retail crowd behavior. Very noisy; best as contrarian overlay.",
    accuracy: 0.52,
  },
  {
    name: "Web Traffic",
    leadTime: "2–4 weeks",
    coverage: "Global (SaaS, e-commerce)",
    cost: "Medium",
    description: "SimilarWeb-style traffic data predicts SaaS ARR growth and e-commerce GMV. High alpha in tech sector.",
    accuracy: 0.77,
  },
];

const ML_MODELS: MLModel[] = [
  {
    name: "Linear Regression",
    r2InSample: 0.12,
    r2OutOfSample: 0.09,
    overfit: "Low",
    features: ["5 factors", "No interactions"],
    risk: "Underfits complex non-linear relationships. Misses interaction effects between signals.",
  },
  {
    name: "Random Forest",
    r2InSample: 0.38,
    r2OutOfSample: 0.11,
    overfit: "High",
    features: ["50 features", "500 trees", "Depth 8"],
    risk: "Severe overfitting to training sample. Feature importance unstable across time periods.",
  },
  {
    name: "Gradient Boosting",
    r2InSample: 0.45,
    r2OutOfSample: 0.13,
    overfit: "Very High",
    features: ["100 features", "1000 rounds", "LR 0.01"],
    risk: "Highest in-sample fit but catastrophic degradation out-of-sample. Regime sensitive.",
  },
  {
    name: "LSTM Network",
    r2InSample: 0.41,
    r2OutOfSample: 0.08,
    overfit: "Extreme",
    features: ["Sequential bars", "128 hidden units", "3 layers"],
    risk: "Learns spurious temporal patterns. Very sensitive to look-ahead bias. Requires massive data.",
  },
];

const CATEGORY_COLORS: Record<SignalCategory, string> = {
  value: "bg-primary/20 text-primary border-border",
  momentum: "bg-primary/20 text-primary border-border",
  quality: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  sentiment: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  technical: "bg-rose-500/20 text-rose-300 border-rose-500/30",
};

const COST_COLORS: Record<CostTier, string> = {
  Low: "text-emerald-400",
  Medium: "text-amber-400",
  High: "text-orange-400",
  "Very High": "text-red-400",
};

const DECAY_LABELS: Record<DecaySpeed, string> = {
  slow: "Slow (1Y+)",
  medium: "Medium (3M)",
  fast: "Fast (<1M)",
};

// ── Rolling IC generator ────────────────────────────────────────────────────────
function generateRollingIC(base: number, seed: number): number[] {
  let ls = seed;
  const lr = () => {
    ls = (ls * 1103515245 + 12345) & 0x7fffffff;
    return ls / 0x7fffffff;
  };
  return Array.from({ length: 12 }, () => base * (0.5 + lr()) + (lr() - 0.5) * 0.04);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ── Factor Momentum Data ────────────────────────────────────────────────────────
function generateFactorReturns(name: string, seed: number): { month: string; ret: number }[] {
  let ls = seed;
  const lr = () => {
    ls = (ls * 1103515245 + 12345) & 0x7fffffff;
    return ls / 0x7fffffff;
  };
  let cum = 0;
  return MONTHS.map((month) => {
    const r = (lr() - 0.48) * 8;
    cum += r;
    void month;
    return { month, ret: parseFloat(cum.toFixed(2)) };
  });
}

const FACTOR_SERIES = [
  { label: "Value", color: "#60a5fa", data: generateFactorReturns("value", 1001) },
  { label: "Momentum", color: "#c084fc", data: generateFactorReturns("mom", 1002) },
  { label: "Quality", color: "#34d399", data: generateFactorReturns("qual", 1003) },
  { label: "Low Vol", color: "#fb923c", data: generateFactorReturns("lv", 1004) },
];

// ── SVG: Rolling IC Chart ───────────────────────────────────────────────────────
function RollingICChart({ signals }: { signals: AlphaSignal[] }) {
  const W = 520;
  const H = 180;
  const PAD = { l: 44, r: 16, t: 16, b: 32 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;
  const top3 = signals.slice(0, 3);
  const COLORS = ["#60a5fa", "#c084fc", "#34d399"];
  const allSeries = top3.map((sig, i) => ({
    sig,
    color: COLORS[i],
    vals: generateRollingIC(sig.ic, i * 997 + 123),
  }));
  const allVals = allSeries.flatMap((s) => s.vals);
  const minV = Math.min(...allVals) - 0.005;
  const maxV = Math.max(...allVals) + 0.005;
  const toX = (i: number) => PAD.l + (i / 11) * cW;
  const toY = (v: number) => PAD.t + cH - ((v - minV) / (maxV - minV)) * cH;
  const zeroY = toY(0);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-44">
      {[minV, 0, maxV].map((v, i) => (
        <line key={`gl-${i}`} x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke="#27272a" strokeWidth="1" />
      ))}
      {[minV, 0, maxV].map((v, i) => (
        <text key={`gy-${i}`} x={PAD.l - 4} y={toY(v) + 4} textAnchor="end" fill="#71717a" fontSize="9">
          {v.toFixed(2)}
        </text>
      ))}
      <line x1={PAD.l} x2={W - PAD.r} y1={zeroY} y2={zeroY} stroke="#52525b" strokeWidth="1" strokeDasharray="4,3" />
      {allSeries.map(({ vals, color }, si) => {
        const pts = vals.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
        return <polyline key={`s-${si}`} points={pts} fill="none" stroke={color} strokeWidth="2" />;
      })}
      {MONTHS.map((m, i) => (
        <text key={`mx-${i}`} x={toX(i)} y={H - 6} textAnchor="middle" fill="#71717a" fontSize="9">
          {m.slice(0, 1)}
        </text>
      ))}
      {allSeries.map(({ sig, color }, si) => (
        <g key={`leg-${si}`}>
          <rect x={PAD.l + si * 130} y={4} width={8} height={8} rx="1" fill={color} />
          <text x={PAD.l + si * 130 + 11} y={12} fill="#a1a1aa" fontSize="9">{sig.name.slice(0, 16)}</text>
        </g>
      ))}
    </svg>
  );
}

// ── SVG: ICIR Heatmap by Decile ─────────────────────────────────────────────────
function ICIRHeatmap({ signals }: { signals: AlphaSignal[] }) {
  const top4 = signals.slice(0, 4);
  const DECILES = ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10"];
  // Generate decile ICIR values per signal
  const rows = top4.map((sig, si) => ({
    sig,
    vals: DECILES.map((_, di) => {
      const base = sig.ir;
      const idx = si * 10 + di;
      return parseFloat((base * (0.6 + _vals[(idx * 7 + 11) % _vals.length] * 0.8)).toFixed(2));
    }),
  }));
  const cellW = 44;
  const cellH = 24;
  const padL = 80;
  const padT = 30;
  const W = padL + DECILES.length * cellW + 8;
  const H = padT + top4.length * cellH + 4;
  const colorCell = (v: number) => {
    const t = Math.min(1, Math.max(0, (v - 0.3) / 0.8));
    const r = Math.round(255 * (1 - t));
    const g = Math.round(200 * t);
    return `rgba(${r},${g},60,0.55)`;
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {DECILES.map((d, di) => (
        <text key={`dh-${di}`} x={padL + di * cellW + cellW / 2} y={20} textAnchor="middle" fill="#71717a" fontSize="9">
          {d}
        </text>
      ))}
      {rows.map(({ sig, vals }, ri) =>
        vals.map((v, di) => (
          <g key={`cell-${ri}-${di}`}>
            <rect
              x={padL + di * cellW + 1}
              y={padT + ri * cellH + 1}
              width={cellW - 2}
              height={cellH - 2}
              rx="2"
              fill={colorCell(v)}
            />
            <text
              x={padL + di * cellW + cellW / 2}
              y={padT + ri * cellH + cellH / 2 + 4}
              textAnchor="middle"
              fill="#e4e4e7"
              fontSize="8"
            >
              {v.toFixed(2)}
            </text>
          </g>
        ))
      )}
      {rows.map(({ sig }, ri) => (
        <text key={`rl-${ri}`} x={padL - 4} y={padT + ri * cellH + cellH / 2 + 4} textAnchor="end" fill="#a1a1aa" fontSize="9">
          {sig.name.slice(0, 12)}
        </text>
      ))}
    </svg>
  );
}

// ── SVG: Factor Momentum Chart ─────────────────────────────────────────────────
function FactorMomentumChart() {
  const W = 520;
  const H = 200;
  const PAD = { l: 44, r: 16, t: 24, b: 32 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;
  const allVals = FACTOR_SERIES.flatMap((s) => s.data.map((d) => d.ret));
  const minV = Math.min(...allVals) - 1;
  const maxV = Math.max(...allVals) + 1;
  const toX = (i: number) => PAD.l + (i / 11) * cW;
  const toY = (v: number) => PAD.t + cH - ((v - minV) / (maxV - minV)) * cH;
  const zeroY = toY(0);
  const gridVals = [minV, Math.round(minV / 2), 0, Math.round(maxV / 2), maxV];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48">
      {gridVals.map((v, i) => (
        <line key={`fg-${i}`} x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke="#27272a" strokeWidth="1" />
      ))}
      {gridVals.map((v, i) => (
        <text key={`fgy-${i}`} x={PAD.l - 4} y={toY(v) + 4} textAnchor="end" fill="#71717a" fontSize="9">
          {v.toFixed(0)}%
        </text>
      ))}
      <line x1={PAD.l} x2={W - PAD.r} y1={zeroY} y2={zeroY} stroke="#52525b" strokeWidth="1" strokeDasharray="4,3" />
      {FACTOR_SERIES.map(({ data, color, label }) => {
        const pts = data.map((d, i) => `${toX(i)},${toY(d.ret)}`).join(" ");
        return <polyline key={`fs-${label}`} points={pts} fill="none" stroke={color} strokeWidth="2" />;
      })}
      {MONTHS.map((m, i) => (
        <text key={`fm-${i}`} x={toX(i)} y={H - 6} textAnchor="middle" fill="#71717a" fontSize="9">
          {m.slice(0, 3)}
        </text>
      ))}
      {FACTOR_SERIES.map(({ label, color }, fi) => (
        <g key={`fleg-${fi}`}>
          <rect x={PAD.l + fi * 100} y={6} width={8} height={8} rx="1" fill={color} />
          <text x={PAD.l + fi * 100 + 11} y={14} fill="#a1a1aa" fontSize="9">{label}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Signal combination state ───────────────────────────────────────────────────
function CompositeScore({ selected }: { selected: AlphaSignal[] }) {
  const composite = useMemo(() => {
    if (selected.length === 0) return null;
    const avgIC = selected.reduce((a, s) => a + s.ic, 0) / selected.length;
    const avgIR = selected.reduce((a, s) => a + s.ir, 0) / selected.length;
    // Diversification benefit: correlation discount
    const cats = new Set(selected.map((s) => s.category)).size;
    const divBenefit = Math.min(0.25, (cats - 1) * 0.07);
    const expectedIC = parseFloat((avgIC * (1 + divBenefit)).toFixed(4));
    const expectedIR = parseFloat((avgIR * (1 + divBenefit)).toFixed(3));
    return { avgIC, avgIR, expectedIC, expectedIR, divBenefit, cats };
  }, [selected]);
  if (!composite) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        Add signals from the library below
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[
        { label: "Avg Raw IC", val: composite.avgIC.toFixed(4), color: "text-muted-foreground" },
        { label: "Composite IC", val: composite.expectedIC.toFixed(4), color: "text-primary" },
        { label: "Composite IR", val: composite.expectedIR.toFixed(3), color: "text-primary" },
        { label: "Div Benefit", val: "+" + (composite.divBenefit * 100).toFixed(1) + "%", color: "text-emerald-400" },
      ].map(({ label, val, color }) => (
        <div key={label} className="rounded-lg bg-muted/60 p-3 text-center">
          <p className={cn("text-xl font-semibold tabular-nums", color)}>{val}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function QuantResearchPage() {
  const [selectedSignals, setSelectedSignals] = useState<AlphaSignal[]>([]);
  const [activeTab, setActiveTab] = useState("signals");

  void sv; // suppress unused warning

  const toggleSignal = (sig: AlphaSignal) => {
    setSelectedSignals((prev) =>
      prev.find((s) => s.id === sig.id)
        ? prev.filter((s) => s.id !== sig.id)
        : prev.length < 6
        ? [...prev, sig]
        : prev
    );
  };

  const isSelected = (sig: AlphaSignal) => selectedSignals.some((s) => s.id === sig.id);

  // Factor momentum: identify top/bottom performer for signal
  const lastReturns = FACTOR_SERIES.map((s) => ({
    label: s.label,
    color: s.color,
    ret: s.data[s.data.length - 1].ret,
  })).sort((a, b) => b.ret - a.ret);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background text-foreground p-4 md:p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Quantitative Research & Signal Generation</h1>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Explore the mechanics of systematic alpha generation — from raw factor signals and IC analysis to alternative data and machine learning.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card border border-border flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="signals" className="text-xs">Alpha Library</TabsTrigger>
          <TabsTrigger value="combo" className="text-xs">Signal Combo</TabsTrigger>
          <TabsTrigger value="ic" className="text-xs">IC / ICIR</TabsTrigger>
          <TabsTrigger value="factor" className="text-xs">Factor Momentum</TabsTrigger>
          <TabsTrigger value="altdata" className="text-xs">Alt Data</TabsTrigger>
          <TabsTrigger value="ml" className="text-xs">ML in Quant</TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Alpha Signal Library ── */}
        <TabsContent value="signals" className="data-[state=inactive]:hidden mt-4 space-y-4">
          <Card className="bg-card/60 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-primary" />
                Alpha Signal Library
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                IC = Information Coefficient (rank correlation of signal with forward returns). IR = IC / std(IC).
                Select signals to add to the combo framework.
              </p>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 pr-3 font-medium">Signal</th>
                    <th className="text-left py-2 pr-3 font-medium">Category</th>
                    <th className="text-right py-2 pr-3 font-medium">IC</th>
                    <th className="text-right py-2 pr-3 font-medium">IR</th>
                    <th className="text-left py-2 pr-3 font-medium">Decay</th>
                    <th className="text-left py-2 pr-3 font-medium">Universe</th>
                    <th className="py-2 font-medium text-center">Add</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {ALPHA_SIGNALS.map((sig) => (
                    <tr key={sig.id} className="group hover:bg-muted/30 transition-colors">
                      <td className="py-2 pr-3 font-medium text-foreground">{sig.name}</td>
                      <td className="py-2 pr-3">
                        <span className={cn("px-2 py-0.5 rounded text-xs border font-medium capitalize", CATEGORY_COLORS[sig.category])}>
                          {sig.category}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-right font-mono text-emerald-400">{sig.ic.toFixed(3)}</td>
                      <td className="py-2 pr-3 text-right font-mono text-primary">{sig.ir.toFixed(2)}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{DECAY_LABELS[sig.decay]}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{sig.universe}</td>
                      <td className="py-2 text-center">
                        <button
                          onClick={() => toggleSignal(sig)}
                          className={cn(
                            "rounded-full w-6 h-6 flex items-center justify-center mx-auto transition-colors",
                            isSelected(sig)
                              ? "bg-primary/20 text-primary hover:bg-red-500/20 hover:text-red-400"
                              : "bg-muted text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          {isSelected(sig) ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Signal cards with descriptions */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ALPHA_SIGNALS.map((sig) => (
              <Card key={sig.id} className="bg-card/40 border-border">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-medium text-foreground leading-tight">{sig.name}</span>
                    <span className={cn("px-1.5 py-0.5 rounded text-[11px] border font-medium capitalize shrink-0", CATEGORY_COLORS[sig.category])}>
                      {sig.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{sig.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Tab 2: Signal Combination Framework ── */}
        <TabsContent value="combo" className="data-[state=inactive]:hidden mt-4 space-y-4">
          <Card className="bg-card/60 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Signal Combination Framework
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Combine up to 6 signals. Diversification benefit grows as you add signals from different categories.
                IC formula: IC_composite = mean(IC_i) × (1 + div_benefit).
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <CompositeScore selected={selectedSignals} />

              <div>
                <p className="text-xs text-muted-foreground mb-2">Selected signals ({selectedSignals.length}/6):</p>
                <div className="flex flex-wrap gap-2 min-h-[2rem]">
                  {selectedSignals.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">None selected — go to Alpha Library to add signals</span>
                  )}
                  {selectedSignals.map((sig) => (
                    <div
                      key={sig.id}
                      className="flex items-center gap-1 bg-muted rounded-full px-2.5 py-1 text-xs text-foreground"
                    >
                      <span className={cn("w-2 h-2 rounded-full shrink-0", {
                        "bg-primary": sig.category === "value" || sig.category === "momentum",
                        "bg-emerald-400": sig.category === "quality",
                        "bg-amber-400": sig.category === "sentiment",
                        "bg-rose-400": sig.category === "technical",
                      })} />
                      {sig.name}
                      <button onClick={() => toggleSignal(sig)} className="ml-1 text-muted-foreground hover:text-red-400">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Quick-add from library:</p>
                <div className="flex flex-wrap gap-2">
                  {ALPHA_SIGNALS.map((sig) => (
                    <button
                      key={sig.id}
                      onClick={() => toggleSignal(sig)}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs border transition-colors",
                        isSelected(sig)
                          ? "bg-primary/20 border-primary/50 text-primary"
                          : "bg-muted/50 border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground"
                      )}
                    >
                      {isSelected(sig) && <CheckCircle className="h-3 w-3 inline mr-1" />}
                      {sig.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-muted/40 border border-border/50 p-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Grinold-Kahn Fundamental Law</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-muted-foreground">IR = IC × √N</strong> — where N is breadth (independent bets per year). Combining uncorrelated
                  signals increases breadth and improves the information ratio linearly with √N. The diversification benefit
                  shown above approximates the correlation discount when signals share category exposure.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 3: IC / ICIR Analysis ── */}
        <TabsContent value="ic" className="data-[state=inactive]:hidden mt-4 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="bg-card/60 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Rolling 12-Month IC — Top 3 Signals</CardTitle>
                <p className="text-xs text-muted-foreground">Monthly rank-IC of signal scores vs. next-month returns.</p>
              </CardHeader>
              <CardContent>
                <RollingICChart signals={ALPHA_SIGNALS} />
              </CardContent>
            </Card>

            <Card className="bg-card/60 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">IC Significance Test</CardTitle>
                <p className="text-xs text-muted-foreground">t-stat = IC_mean / (IC_std / √N). t &gt; 2 → statistically significant at 95%.</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {ALPHA_SIGNALS.map((sig) => {
                  const tstat = parseFloat((sig.ir * Math.sqrt(12)).toFixed(2));
                  const sig_flag = tstat >= 2;
                  return (
                    <div key={sig.id} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-32 shrink-0">{sig.name}</span>
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", sig_flag ? "bg-emerald-500" : "bg-amber-500")}
                          style={{ width: `${Math.min(100, (tstat / 5) * 100)}%` }}
                        />
                      </div>
                      <span className={cn("text-xs font-mono w-10 text-right", sig_flag ? "text-emerald-400" : "text-amber-400")}>
                        {tstat}
                      </span>
                      {sig_flag ? (
                        <CheckCircle className="h-3 w-3 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/60 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">ICIR Heatmap by Decile (Top 4 Signals)</CardTitle>
              <p className="text-xs text-muted-foreground">
                Per-decile Information Ratio. D1 = lowest signal score, D10 = highest. Strong signals show monotonic spread.
              </p>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <ICIRHeatmap signals={ALPHA_SIGNALS} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 4: Factor Momentum ── */}
        <TabsContent value="factor" className="data-[state=inactive]:hidden mt-4 space-y-4">
          <Card className="bg-card/60 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                12-Month Factor Cumulative Returns
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Factor momentum: buy (go long) factors with strong trailing performance, short recent laggards. Asness et al. (2013) documented this across equities, bonds, FX.
              </p>
            </CardHeader>
            <CardContent>
              <FactorMomentumChart />
            </CardContent>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {lastReturns.map((f, i) => (
              <Card key={f.label} className={cn("border", i === 0 ? "bg-emerald-950/30 border-emerald-800/50" : i === lastReturns.length - 1 ? "bg-red-950/30 border-red-800/50" : "bg-card/40 border-border")}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
                    <span className="text-xs font-medium text-foreground">{f.label}</span>
                    {i === 0 && <Badge className="text-[11px] px-1 py-0 bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Momentum Buy</Badge>}
                    {i === lastReturns.length - 1 && <Badge className="text-[11px] px-1 py-0 bg-red-500/20 text-red-300 border-red-500/30">Momentum Sell</Badge>}
                  </div>
                  <p className={cn("text-xl font-semibold tabular-nums", f.ret >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {f.ret >= 0 ? "+" : ""}{f.ret.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">12M cumulative return</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-card/40 border-border">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Factor Momentum Signal Construction</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Compute each factor's 12-month minus 1-month trailing return (skip last month to avoid reversal)</li>
                <li>Rank factors from best to worst performing</li>
                <li>Long top tercile factors, short bottom tercile factors</li>
                <li>Rebalance monthly; position size proportional to rank score</li>
                <li>Combine with cross-sectional momentum signal for diversification</li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 5: Alternative Data Signals ── */}
        <TabsContent value="altdata" className="data-[state=inactive]:hidden mt-4 space-y-4">
          <Card className="bg-card/60 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="h-4 w-4 text-amber-400" />
                Alternative Data Sources
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Non-traditional datasets that generate alpha by providing informational edge before public disclosure.
              </p>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ALT_DATA_SOURCES.map((src) => (
                <div key={src.name} className="rounded-lg bg-muted/50 border border-border/50 p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">{src.name}</span>
                    <span className={cn("text-xs font-medium shrink-0", COST_COLORS[src.cost])}>{src.cost} cost</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{src.description}</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Predictive accuracy</span>
                      <span className="font-mono text-muted-foreground">{(src.accuracy * 100).toFixed(0)}%</span>
                    </div>
                    <div className="bg-muted rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{ width: `${src.accuracy * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Lead time: {src.leadTime}</span>
                      <span>{src.coverage}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card/40 border-border">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">Due Diligence Checklist for Alt Data</p>
              <div className="grid gap-1.5 sm:grid-cols-2 text-[11px] text-muted-foreground">
                {[
                  "Verify no look-ahead bias in data delivery timestamps",
                  "Check survivorship bias in historical backtest panels",
                  "Confirm data vendor legal compliance (MNPI, GDPR)",
                  "Assess coverage universe vs. investment universe overlap",
                  "Evaluate signal decay: is alpha structural or temporary?",
                  "Stress-test across different market regimes (2008, 2020)",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <CheckCircle className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 6: Machine Learning in Quant ── */}
        <TabsContent value="ml" className="data-[state=inactive]:hidden mt-4 space-y-4">
          <Card className="bg-card/60 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-4 w-4 text-rose-400" />
                ML Model Comparison for Return Prediction
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                In-sample vs. out-of-sample R². Higher in-sample R² does not predict better out-of-sample performance.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {ML_MODELS.map((m) => {
                const degradation = parseFloat((((m.r2InSample - m.r2OutOfSample) / m.r2InSample) * 100).toFixed(1));
                const overfitColor =
                  m.overfit === "Low" ? "text-emerald-400" :
                  m.overfit === "High" ? "text-amber-400" :
                  m.overfit === "Very High" ? "text-orange-400" : "text-red-400";
                return (
                  <div key={m.name} className="rounded-lg bg-muted/50 border border-border/50 p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">{m.name}</span>
                      <span className={cn("text-xs font-medium", overfitColor)}>Overfit: {m.overfit}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground text-xs">In-Sample R²</p>
                        <p className="text-primary font-mono font-semibold">{m.r2InSample.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">OOS R²</p>
                        <p className="text-emerald-400 font-mono font-semibold">{m.r2OutOfSample.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Degradation</p>
                        <p className="text-red-400 font-mono font-semibold">-{degradation}%</p>
                      </div>
                    </div>
                    {/* R² bar comparison */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-20">In-sample</span>
                        <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${m.r2InSample * 100}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-20">Out-of-sample</span>
                        <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${m.r2OutOfSample * 100}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {m.features.map((f) => (
                        <span key={f} className="text-xs bg-muted/50 border border-border/50 text-muted-foreground rounded px-1.5 py-0.5">{f}</span>
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground flex items-start gap-1">
                      <AlertTriangle className="h-3 w-3 text-amber-400 mt-0.5 shrink-0" />
                      {m.risk}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Feature Importance SVG */}
          <Card className="bg-card/60 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Feature Importance — Gradient Boosting (Illustrative)</CardTitle>
              <p className="text-xs text-muted-foreground">Relative importance of input features. High importance ≠ economic significance. Beware of spurious correlations.</p>
            </CardHeader>
            <CardContent>
              {(() => {
                const features = [
                  { name: "12M Momentum", imp: 0.22 },
                  { name: "Book-to-Market", imp: 0.17 },
                  { name: "Gross Profit", imp: 0.14 },
                  { name: "Short Interest", imp: 0.13 },
                  { name: "Accruals", imp: 0.11 },
                  { name: "Earnings Yield", imp: 0.10 },
                  { name: "Low Vol", imp: 0.08 },
                  { name: "RSI Rev.", imp: 0.05 },
                ];
                return (
                  <div className="space-y-1.5">
                    {features.map((f) => (
                      <div key={f.name} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-28 shrink-0">{f.name}</span>
                        <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-rose-500/70"
                            style={{ width: `${f.imp * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground w-10 text-right">{(f.imp * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          <Card className="bg-card/40 border-border">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground">Preventing ML Overfitting in Quant Strategies</p>
              <div className="grid gap-2 sm:grid-cols-2 text-[11px] text-muted-foreground">
                {[
                  { title: "Walk-forward testing", desc: "Train on expanding window, test on unseen future period. Never allow future data to leak into training." },
                  { title: "Cross-sectional CV", desc: "Use time-series splits only — K-fold shuffling leaks future data and produces false alpha." },
                  { title: "Regularization", desc: "L1/L2 penalty or dropout in neural nets reduces free parameters and shrinks spurious coefficients." },
                  { title: "Feature reduction", desc: "Limit to economically motivated features. More features → more multiple comparison problems." },
                ].map(({ title, desc }) => (
                  <div key={title} className="rounded bg-muted/50 p-2 space-y-0.5">
                    <p className="text-muted-foreground font-medium">{title}</p>
                    <p>{desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
