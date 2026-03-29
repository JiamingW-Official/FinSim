"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Target,
  AlertTriangle,
  Info,
  ArrowRight,
  Layers,
  RefreshCw,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 770;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed(seed: number = 770) {
  s = seed;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface YieldPoint {
  tenor: string;
  months: number;
  yield: number;
  prevYield: number;
}

interface CurveMetric {
  label: string;
  spread: number;
  prev: number;
  description: string;
}

interface HistoricalInversion {
  period: string;
  start: string;
  end: string;
  depth: number;
  recessionStart: string;
  lag: number;
  severity: "mild" | "moderate" | "severe";
}

interface TradeIdea {
  name: string;
  type: "steepener" | "flattener" | "butterfly" | "condor";
  description: string;
  legs: string[];
  entry: number;
  target: number;
  stop: number;
  conviction: "high" | "medium" | "low";
  rationale: string;
}

interface CurveRegime {
  name: string;
  description: string;
  currentBps: number;
  historicalFreq: number;
  avgDuration: number;
  color: string;
}

// ── Data generation ───────────────────────────────────────────────────────────

function generateYieldCurve(): YieldPoint[] {
  resetSeed(770);
  const tenors: { tenor: string; months: number }[] = [
    { tenor: "3M", months: 3 },
    { tenor: "6M", months: 6 },
    { tenor: "1Y", months: 12 },
    { tenor: "2Y", months: 24 },
    { tenor: "3Y", months: 36 },
    { tenor: "5Y", months: 60 },
    { tenor: "7Y", months: 84 },
    { tenor: "10Y", months: 120 },
    { tenor: "20Y", months: 240 },
    { tenor: "30Y", months: 360 },
  ];

  // Base curve: slight inversion at front, gradual steepening at back
  const baseYields = [5.32, 5.28, 5.05, 4.72, 4.55, 4.42, 4.48, 4.58, 4.72, 4.81];
  const prevYields = [5.18, 5.22, 5.01, 4.88, 4.76, 4.65, 4.70, 4.75, 4.85, 4.92];

  return tenors.map((t, i) => ({
    ...t,
    yield: baseYields[i] + (rand() - 0.5) * 0.04,
    prevYield: prevYields[i] + (rand() - 0.5) * 0.04,
  }));
}

function generateCurveMetrics(curve: YieldPoint[]): CurveMetric[] {
  const get = (tenor: string) => curve.find((p) => p.tenor === tenor);
  const getPrev = (tenor: string) => curve.find((p) => p.tenor === tenor);

  const y2 = get("2Y")!;
  const y10 = get("10Y")!;
  const y5 = get("5Y")!;
  const y30 = get("30Y")!;
  const y3m = get("3M")!;

  const spread2s10s = (y10.yield - y2.yield) * 100;
  const spread5s30s = (y30.yield - y5.yield) * 100;
  const spread3m10y = (y10.yield - y3m.yield) * 100;

  const prev2s10s = (getPrev("10Y")!.prevYield - getPrev("2Y")!.prevYield) * 100;
  const prev5s30s = (getPrev("30Y")!.prevYield - getPrev("5Y")!.prevYield) * 100;
  const prev3m10y = (getPrev("10Y")!.prevYield - getPrev("3M")!.prevYield) * 100;

  return [
    {
      label: "2s10s Spread",
      spread: spread2s10s,
      prev: prev2s10s,
      description: "Key recession predictor — negative signals inversion",
    },
    {
      label: "5s30s Spread",
      spread: spread5s30s,
      prev: prev5s30s,
      description: "Long-end steepness; driven by term premium",
    },
    {
      label: "3m10y Spread",
      spread: spread3m10y,
      prev: prev3m10y,
      description: "NY Fed preferred recession indicator",
    },
    {
      label: "Curve Shape",
      spread: spread2s10s,
      prev: prev2s10s,
      description:
        spread2s10s < -25
          ? "Deeply Inverted"
          : spread2s10s < 0
          ? "Inverted"
          : spread2s10s < 30
          ? "Flat"
          : "Normal / Steep",
    },
  ];
}

const HISTORICAL_INVERSIONS: HistoricalInversion[] = [
  {
    period: "1989–1990",
    start: "Dec 1988",
    end: "Feb 1990",
    depth: -52,
    recessionStart: "Jul 1990",
    lag: 17,
    severity: "mild",
  },
  {
    period: "1998–2000",
    start: "Jun 1998",
    end: "Jan 2001",
    depth: -110,
    recessionStart: "Mar 2001",
    lag: 26,
    severity: "moderate",
  },
  {
    period: "2005–2007",
    start: "Dec 2005",
    end: "Jun 2007",
    depth: -75,
    recessionStart: "Dec 2007",
    lag: 18,
    severity: "severe",
  },
  {
    period: "2019",
    start: "Mar 2019",
    end: "Oct 2019",
    depth: -58,
    recessionStart: "Feb 2020",
    lag: 16,
    severity: "severe",
  },
  {
    period: "2022–2024",
    start: "Jul 2022",
    end: "Sep 2024",
    depth: -189,
    recessionStart: "TBD",
    lag: 0,
    severity: "moderate",
  },
];

const TRADE_IDEAS: TradeIdea[] = [
  {
    name: "2s10s Steepener",
    type: "steepener",
    description: "Long 10Y / Short 2Y DV01-neutral",
    legs: ["Long $100M 10Y UST (DV01 +$8,800)", "Short $20M 2Y UST (DV01 -$1,900)"],
    entry: -14,
    target: 25,
    stop: -45,
    conviction: "high",
    rationale: "Fed rate cuts expected; short-end to rally faster, curve to steepen off historic inversion",
  },
  {
    name: "5s30s Flattener",
    type: "flattener",
    description: "Long 5Y / Short 30Y DV01-neutral",
    legs: ["Long $100M 5Y UST (DV01 +$4,500)", "Short $28M 30Y UST (DV01 -$4,500)"],
    entry: 39,
    target: 10,
    stop: 65,
    conviction: "medium",
    rationale: "30Y term premium elevated; fiscal supply absorbs long-end demand, compressing spread",
  },
  {
    name: "Belly-Rich Butterfly",
    type: "butterfly",
    description: "Long 2Y+30Y wings / Short 10Y belly",
    legs: [
      "Long $50M 2Y UST (DV01 +$950)",
      "Short $100M 10Y UST (DV01 -$8,800)",
      "Long $35M 30Y UST (DV01 +$7,850)",
    ],
    entry: -8,
    target: 15,
    stop: -25,
    conviction: "medium",
    rationale: "10Y belly rich relative to wings on butterfly metric; Fed repricing compresses belly yield",
  },
];

// ── Chart components ──────────────────────────────────────────────────────────

function YieldCurveChart({ curve }: { curve: YieldPoint[] }) {
  const W = 560;
  const H = 220;
  const PAD = { top: 16, right: 24, bottom: 40, left: 48 };

  const minY = Math.min(...curve.map((p) => Math.min(p.yield, p.prevYield))) - 0.05;
  const maxY = Math.max(...curve.map((p) => Math.max(p.yield, p.prevYield))) + 0.05;
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const xScale = (i: number) => PAD.left + (i / (curve.length - 1)) * chartW;
  const yScale = (y: number) => PAD.top + chartH - ((y - minY) / (maxY - minY)) * chartH;

  const currentPath = curve
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(i).toFixed(1)} ${yScale(p.yield).toFixed(1)}`)
    .join(" ");

  const prevPath = curve
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(i).toFixed(1)} ${yScale(p.prevYield).toFixed(1)}`)
    .join(" ");

  // Y-axis ticks
  const yTicks: number[] = [];
  const step = 0.25;
  const tStart = Math.ceil(minY / step) * step;
  for (let v = tStart; v <= maxY + 0.01; v += step) {
    yTicks.push(parseFloat(v.toFixed(2)));
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Grid */}
      {yTicks.map((v) => (
        <line
          key={v}
          x1={PAD.left}
          y1={yScale(v)}
          x2={W - PAD.right}
          y2={yScale(v)}
          stroke="currentColor"
          strokeOpacity={0.08}
          strokeWidth={1}
        />
      ))}

      {/* Y-axis labels */}
      {yTicks.map((v) => (
        <text
          key={v}
          x={PAD.left - 6}
          y={yScale(v) + 4}
          textAnchor="end"
          fontSize={9}
          fill="currentColor"
          fillOpacity={0.5}
        >
          {v.toFixed(2)}%
        </text>
      ))}

      {/* X-axis labels */}
      {curve.map((p, i) => (
        <text
          key={p.tenor}
          x={xScale(i)}
          y={H - 6}
          textAnchor="middle"
          fontSize={9}
          fill="currentColor"
          fillOpacity={0.6}
        >
          {p.tenor}
        </text>
      ))}

      {/* Zero-change area fill for current curve */}
      <defs>
        <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Previous curve */}
      <path
        d={prevPath}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.3}
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />

      {/* Current curve */}
      <path d={currentPath} fill="none" stroke="#3b82f6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Data points */}
      {curve.map((p, i) => (
        <circle
          key={p.tenor}
          cx={xScale(i)}
          cy={yScale(p.yield)}
          r={3}
          fill="#3b82f6"
          stroke="#1e3a5f"
          strokeWidth={1}
        />
      ))}

      {/* Legend */}
      <line x1={W - 120} y1={14} x2={W - 100} y2={14} stroke="#3b82f6" strokeWidth={2.5} />
      <text x={W - 96} y={18} fontSize={9} fill="#3b82f6">
        Current
      </text>
      <line x1={W - 55} y1={14} x2={W - 35} y2={14} stroke="currentColor" strokeOpacity={0.4} strokeWidth={1.5} strokeDasharray="4 3" />
      <text x={W - 31} y={18} fontSize={9} fill="currentColor" fillOpacity={0.5}>
        Prev
      </text>
    </svg>
  );
}

function SpreadPayoffChart({
  type,
  entry,
  target,
  stop,
}: {
  type: TradeIdea["type"];
  entry: number;
  target: number;
  stop: number;
}) {
  const W = 320;
  const H = 160;
  const PAD = { top: 16, right: 20, bottom: 36, left: 52 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  // Spread range
  const spreadMin = Math.min(stop, entry, target) - 20;
  const spreadMax = Math.max(stop, entry, target) + 20;

  const xScale = (x: number) =>
    PAD.left + ((x - spreadMin) / (spreadMax - spreadMin)) * chartW;

  // P&L: for steepener/butterfly, pnl = spread - entry (bps * dv01 scaled)
  // For flattener, pnl = entry - spread
  const dv01 = 10000; // $10,000/bp per $100M DV01-neutral
  const pnlScale = (pnl: number) =>
    PAD.top + chartH / 2 - (pnl / ((spreadMax - spreadMin) * dv01 * 0.5)) * (chartH / 2);

  const isLong = type === "steepener" || type === "butterfly";
  const spreads: number[] = [];
  for (let x = spreadMin; x <= spreadMax; x += 2) spreads.push(x);

  const pnlPath = spreads
    .map((x, i) => {
      const pnl = isLong ? (x - entry) * dv01 : (entry - x) * dv01;
      return `${i === 0 ? "M" : "L"} ${xScale(x).toFixed(1)} ${pnlScale(pnl).toFixed(1)}`;
    })
    .join(" ");

  const zeroPnl = PAD.top + chartH / 2;
  const entryX = xScale(entry);
  const targetX = xScale(target);
  const stopX = xScale(stop);

  const yTicks = [-3, -2, -1, 0, 1, 2, 3].map((t) => t * 100000);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Grid */}
      <line x1={PAD.left} y1={zeroPnl} x2={W - PAD.right} y2={zeroPnl} stroke="currentColor" strokeOpacity={0.2} strokeWidth={1} />
      {yTicks.map((v) => (
        <line
          key={v}
          x1={PAD.left}
          y1={pnlScale(v)}
          x2={W - PAD.right}
          y2={pnlScale(v)}
          stroke="currentColor"
          strokeOpacity={0.05}
          strokeWidth={1}
        />
      ))}

      {/* Y-axis labels */}
      {yTicks
        .filter((v) => v !== 0)
        .map((v) => (
          <text
            key={v}
            x={PAD.left - 4}
            y={pnlScale(v) + 4}
            textAnchor="end"
            fontSize={8}
            fill="currentColor"
            fillOpacity={0.4}
          >
            {v > 0 ? `+${(v / 1000).toFixed(0)}k` : `${(v / 1000).toFixed(0)}k`}
          </text>
        ))}

      {/* Stop zone */}
      {isLong ? (
        <rect
          x={stopX}
          y={PAD.top}
          width={entryX - stopX}
          height={chartH}
          fill="#ef4444"
          fillOpacity={0.07}
        />
      ) : (
        <rect
          x={entryX}
          y={PAD.top}
          width={stopX - entryX}
          height={chartH}
          fill="#ef4444"
          fillOpacity={0.07}
        />
      )}

      {/* Target zone */}
      {isLong ? (
        <rect
          x={entryX}
          y={PAD.top}
          width={targetX - entryX}
          height={chartH}
          fill="#22c55e"
          fillOpacity={0.07}
        />
      ) : (
        <rect
          x={targetX}
          y={PAD.top}
          width={entryX - targetX}
          height={chartH}
          fill="#22c55e"
          fillOpacity={0.07}
        />
      )}

      {/* P&L line */}
      <path d={pnlPath} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" />

      {/* Entry line */}
      <line x1={entryX} y1={PAD.top} x2={entryX} y2={H - PAD.bottom} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 2" />
      <text x={entryX} y={PAD.top - 3} textAnchor="middle" fontSize={8} fill="#f59e0b">
        Entry {entry > 0 ? `+${entry}` : entry}
      </text>

      {/* Target line */}
      <line x1={targetX} y1={PAD.top} x2={targetX} y2={H - PAD.bottom} stroke="#22c55e" strokeWidth={1.5} strokeDasharray="3 2" />
      <text x={targetX} y={H - PAD.bottom + 12} textAnchor="middle" fontSize={8} fill="#22c55e">
        T {target > 0 ? `+${target}` : target}
      </text>

      {/* Stop line */}
      <line x1={stopX} y1={PAD.top} x2={stopX} y2={H - PAD.bottom} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="3 2" />
      <text x={stopX} y={H - PAD.bottom + 12} textAnchor="middle" fontSize={8} fill="#ef4444">
        SL {stop > 0 ? `+${stop}` : stop}
      </text>

      {/* X-axis label */}
      <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={9} fill="currentColor" fillOpacity={0.4}>
        Spread (bps)
      </text>
    </svg>
  );
}

function RegimeGauge({ spread }: { spread: number }) {
  const W = 260;
  const H = 80;
  // -200 bps to +150 bps range
  const min = -200;
  const max = 150;
  const clamp = Math.max(min, Math.min(max, spread));
  const pct = (clamp - min) / (max - min);

  const cx = W / 2;
  const cy = H - 10;
  const r = 60;
  const startAngle = Math.PI; // 180 deg
  const endAngle = 0; // 0 deg

  const arc = (angle: number) => ({
    x: cx + r * Math.cos(angle),
    y: cy - r * Math.sin(angle),
  });

  const needleAngle = Math.PI - pct * Math.PI;
  const needleTip = {
    x: cx + (r - 8) * Math.cos(needleAngle),
    y: cy - (r - 8) * Math.sin(needleAngle),
  };

  // Zone colors (inverted → flat → normal → steep)
  const zones = [
    { from: 0, to: 0.25, color: "#ef4444", label: "Inverted" },
    { from: 0.25, to: 0.45, color: "#f59e0b", label: "Flat" },
    { from: 0.45, to: 0.7, color: "#22c55e", label: "Normal" },
    { from: 0.7, to: 1.0, color: "#3b82f6", label: "Steep" },
  ];

  const arcPath = (from: number, to: number) => {
    const a1 = Math.PI - from * Math.PI;
    const a2 = Math.PI - to * Math.PI;
    const p1 = arc(a1);
    const p2 = arc(a2);
    return `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} A ${r} ${r} 0 0 1 ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {zones.map((z) => (
        <path
          key={z.label}
          d={arcPath(z.from, z.to)}
          fill="none"
          stroke={z.color}
          strokeWidth={10}
          strokeLinecap="butt"
          opacity={0.7}
        />
      ))}
      {/* Needle */}
      <line
        x1={cx}
        y1={cy}
        x2={needleTip.x.toFixed(1)}
        y2={needleTip.y.toFixed(1)}
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={4} fill="white" />
      {/* Labels */}
      <text x={12} y={H - 2} fontSize={8} fill="#ef4444" opacity={0.8}>
        Inv
      </text>
      <text x={W - 28} y={H - 2} fontSize={8} fill="#3b82f6" opacity={0.8}>
        Steep
      </text>
      <text x={cx} y={cy - r - 6} textAnchor="middle" fontSize={10} fill="white" fontWeight="600">
        {spread > 0 ? `+${spread.toFixed(0)}` : spread.toFixed(0)} bps
      </text>
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function spreadColor(bps: number): string {
  if (bps < -50) return "text-red-400";
  if (bps < 0) return "text-orange-400";
  if (bps < 50) return "text-yellow-400";
  return "text-green-400";
}

function convictionColor(c: TradeIdea["conviction"]): string {
  if (c === "high") return "bg-green-500/20 text-green-400 border-green-500/30";
  if (c === "medium") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  return "bg-red-500/20 text-red-400 border-red-500/30";
}

function typeColor(t: TradeIdea["type"]): string {
  if (t === "steepener") return "bg-primary/20 text-primary border-border";
  if (t === "flattener") return "bg-primary/20 text-primary border-border";
  if (t === "butterfly") return "bg-teal-500/20 text-emerald-400 border-teal-500/30";
  return "bg-orange-500/20 text-orange-400 border-orange-500/30";
}

function severityColor(s: HistoricalInversion["severity"]): string {
  if (s === "severe") return "text-red-400";
  if (s === "moderate") return "text-orange-400";
  return "text-yellow-400";
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function YieldCurvePage() {
  const [activeTab, setActiveTab] = useState("shape");
  const [showInfo, setShowInfo] = useState<string | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<number>(0);

  const curve = useMemo(() => generateYieldCurve(), []);
  const metrics = useMemo(() => generateCurveMetrics(curve), [curve]);

  const spread2s10s = metrics[0].spread;
  const spread5s30s = metrics[1].spread;
  const spread3m10y = metrics[2].spread;

  const curveRegime: CurveRegime = useMemo(() => {
    if (spread2s10s < -50)
      return {
        name: "Deeply Inverted",
        description: "Short rates exceed long rates by >50bps — historically the strongest recession signal",
        currentBps: spread2s10s,
        historicalFreq: 8,
        avgDuration: 14,
        color: "text-red-400",
      };
    if (spread2s10s < 0)
      return {
        name: "Inverted",
        description: "2Y yield above 10Y — classic inversion; Fed likely overtightened",
        currentBps: spread2s10s,
        historicalFreq: 15,
        avgDuration: 10,
        color: "text-orange-400",
      };
    if (spread2s10s < 50)
      return {
        name: "Flat",
        description: "Spread within 0–50bps; often a transition regime between inversion and steepening",
        currentBps: spread2s10s,
        historicalFreq: 22,
        avgDuration: 8,
        color: "text-yellow-400",
      };
    return {
      name: "Normal / Steep",
      description: "Upward-sloping curve — typical economic expansion environment",
      currentBps: spread2s10s,
      historicalFreq: 55,
      avgDuration: 36,
      color: "text-green-400",
    };
  }, [spread2s10s]);

  const macroSignals = useMemo(() => {
    return [
      {
        signal: "Fed Funds Rate",
        value: "5.25–5.50%",
        implication: "Near peak; markets pricing 3–4 cuts in next 12 months",
        impact: "bullish" as const,
      },
      {
        signal: "CPI Inflation",
        value: "3.2% YoY",
        implication: "Above target but falling; supports eventual cuts",
        impact: "neutral" as const,
      },
      {
        signal: "10Y Term Premium",
        value: "+42 bps",
        implication: "Rising supply + fiscal deficit pressure long end",
        impact: "bearish" as const,
      },
      {
        signal: "ISM Manufacturing",
        value: "49.1",
        implication: "Sub-50 contraction; supports front-end rally (steepener)",
        impact: "bullish" as const,
      },
      {
        signal: "Unemployment Rate",
        value: "3.9%",
        implication: "Slight softening; no alarm but trend worth watching",
        impact: "neutral" as const,
      },
      {
        signal: "10Y Real Yield",
        value: "+1.82%",
        implication: "Elevated real rates; headwind for risk assets",
        impact: "bearish" as const,
      },
    ];
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-4 space-y-4">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-3.5 w-3.5 text-muted-foreground/50" />
            <h1 className="text-xl font-bold tracking-tight">Yield Curve Strategies</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Steepeners · Flatteners · Butterflies · Relative Value Curve Trades
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("text-xs text-muted-foreground", spreadColor(spread2s10s))}>
            2s10s: {spread2s10s > 0 ? "+" : ""}{spread2s10s.toFixed(0)} bps
          </Badge>
          <Badge variant="outline" className="text-xs text-muted-foreground">
            Updated: Mar 28, 2026
          </Badge>
        </div>
      </motion.div>

      {/* ── Metric Cards ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 border-l-4 border-l-primary p-6 rounded-lg bg-card/40"
      >
        {[
          { label: "2s10s Spread", value: spread2s10s, prev: metrics[0].prev, unit: "bps", icon: TrendingUp },
          { label: "5s30s Spread", value: spread5s30s, prev: metrics[1].prev, unit: "bps", icon: BarChart3 },
          { label: "3m10y Spread", value: spread3m10y, prev: metrics[2].prev, unit: "bps", icon: Activity },
          {
            label: "Curve Regime",
            value: null,
            regime: curveRegime.name,
            regimeColor: curveRegime.color,
            icon: Layers,
          },
        ].map((m, i) => (
          <Card key={m.label} className="border-border">
            <CardContent className="p-3">
              <div className="flex items-start justify-between mb-1">
                <span className="text-xs text-muted-foreground">{m.label}</span>
                <m.icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              {m.value !== null && m.value !== undefined ? (
                <>
                  <div className={cn("text-lg font-bold tabular-nums", spreadColor(m.value))}>
                    {m.value > 0 ? "+" : ""}{m.value.toFixed(0)} bps
                  </div>
                  {m.prev !== undefined && (
                    <div className="flex items-center gap-1 mt-0.5">
                      {m.value > m.prev ? (
                        <TrendingUp className="h-3 w-3 text-green-400" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-400" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {m.value > m.prev ? "+" : ""}{(m.value - m.prev).toFixed(0)} bps vs prior
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className={cn("text-base font-medium mt-1", m.regimeColor)}>
                  {m.regime}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* ── Tabs ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full md:w-auto grid grid-cols-4 md:flex">
            <TabsTrigger value="shape">Curve Shape</TabsTrigger>
            <TabsTrigger value="strategies">Strategies</TabsTrigger>
            <TabsTrigger value="historical">Historical</TabsTrigger>
            <TabsTrigger value="macro">Macro Signals</TabsTrigger>
          </TabsList>

          {/* ── Tab: Curve Shape ── */}
          <TabsContent value="shape" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2 border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-muted-foreground/50" />
                    US Treasury Yield Curve
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <YieldCurveChart curve={curve} />
                  <div className="mt-3 grid grid-cols-5 gap-1">
                    {curve.map((p) => {
                      const chg = (p.yield - p.prevYield) * 100;
                      return (
                        <div key={p.tenor} className="text-center">
                          <div className="text-xs font-medium text-muted-foreground">{p.tenor}</div>
                          <div className="text-sm font-medium tabular-nums">{p.yield.toFixed(2)}%</div>
                          <div className={cn("text-xs tabular-nums", chg >= 0 ? "text-green-400" : "text-red-400")}>
                            {chg >= 0 ? "+" : ""}{chg.toFixed(1)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Regime Gauge</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RegimeGauge spread={spread2s10s} />
                    <div className="mt-2 text-center">
                      <div className={cn("text-sm font-medium", curveRegime.color)}>
                        {curveRegime.name}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {curveRegime.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Regime Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { label: "Historical Frequency", value: `${curveRegime.historicalFreq}% of time` },
                      { label: "Avg Duration", value: `${curveRegime.avgDuration} months` },
                      { label: "Current 2s10s", value: `${spread2s10s > 0 ? "+" : ""}${spread2s10s.toFixed(0)} bps` },
                      { label: "Current 5s30s", value: `${spread5s30s > 0 ? "+" : ""}${spread5s30s.toFixed(0)} bps` },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between items-center text-xs text-muted-foreground">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="font-medium">{row.value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Spread metrics detail */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Key Spread Definitions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {metrics.slice(0, 3).map((m) => (
                    <div key={m.label} className="p-3 rounded-lg bg-muted/30 border border-border space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-medium">{m.label}</span>
                        <span className={cn("text-sm font-medium tabular-nums", spreadColor(m.spread))}>
                          {m.spread > 0 ? "+" : ""}{m.spread.toFixed(0)} bps
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{m.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab: Strategies ── */}
          <TabsContent value="strategies" className="mt-4 space-y-4">
            {/* Strategy selector */}
            <div className="flex gap-2 flex-wrap">
              {TRADE_IDEAS.map((t, i) => (
                <Button
                  key={t.name}
                  variant={selectedTrade === i ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTrade(i)}
                  className="text-xs text-muted-foreground"
                >
                  {t.name}
                </Button>
              ))}
            </div>

            {TRADE_IDEAS.map((trade, idx) =>
              selectedTrade !== idx ? null : (
                <motion.div
                  key={trade.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                >
                  <Card className="border-border">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{trade.name}</CardTitle>
                        <Badge variant="outline" className={cn("text-xs text-muted-foreground", typeColor(trade.type))}>
                          {trade.type}
                        </Badge>
                        <Badge variant="outline" className={cn("text-xs text-muted-foreground", convictionColor(trade.conviction))}>
                          {trade.conviction} conviction
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{trade.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Trade legs */}
                      <div>
                        <div className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                          Trade Legs
                        </div>
                        <div className="space-y-1.5">
                          {trade.legs.map((leg, li) => (
                            <div key={li} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <ArrowRight className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
                              <span>{leg}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Entry / Target / Stop */}
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: "Entry", value: trade.entry, color: "text-yellow-400" },
                          { label: "Target", value: trade.target, color: "text-green-400" },
                          { label: "Stop", value: trade.stop, color: "text-red-400" },
                        ].map((item) => (
                          <div key={item.label} className="p-2 rounded bg-muted/30 border border-border text-center">
                            <div className="text-xs text-muted-foreground">{item.label}</div>
                            <div className={cn("text-sm font-medium tabular-nums", item.color)}>
                              {item.value > 0 ? "+" : ""}{item.value} bps
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* R:R */}
                      <div className="p-3 rounded-lg bg-primary/10 border border-border">
                        <div className="flex items-start gap-2">
                          <Info className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-xs font-medium text-primary mb-0.5">Rationale</div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{trade.rationale}</p>
                          </div>
                        </div>
                      </div>

                      {/* R:R calc */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="text-muted-foreground">Reward/Risk</span>
                        <span className="font-medium text-green-400">
                          {Math.abs((trade.target - trade.entry) / (trade.entry - trade.stop)).toFixed(1)}:1
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Target className="h-3.5 w-3.5 text-muted-foreground/50" />
                        P&L Profile (vs Spread Level)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SpreadPayoffChart
                        type={trade.type}
                        entry={trade.entry}
                        target={trade.target}
                        stop={trade.stop}
                      />
                      <div className="mt-3 p-3 rounded bg-muted/30 border border-border">
                        <div className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wide">
                          DV01 Neutral Structure
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Position sized so each basis point move in the target spread = $10,000 P&L per $100M notional,
                          insulating from parallel shifts.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            )}

            {/* Strategy explainer */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Strategy Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    {
                      name: "Steepener",
                      desc: "Long longer tenor / Short shorter tenor. Profits when the curve steepens (spread widens). Typical in rate cut cycles.",
                      color: "border-border bg-primary/5",
                    },
                    {
                      name: "Flattener",
                      desc: "Long shorter tenor / Short longer tenor. Profits when the curve flattens. Common in late-cycle tightening phases.",
                      color: "border-border bg-primary/5",
                    },
                    {
                      name: "Butterfly",
                      desc: "Long wings (short & long maturity) / Short belly (intermediate). Profits when belly richens relative to wings.",
                      color: "border-teal-500/30 bg-teal-500/5",
                    },
                    {
                      name: "Condor",
                      desc: "Four-leg spread: profit from convergence of two intermediate spreads. More precise, lower carry, narrower range.",
                      color: "border-orange-500/30 bg-orange-500/5",
                    },
                  ].map((s) => (
                    <div key={s.name} className={cn("p-3 rounded-lg border", s.color)}>
                      <div className="text-xs text-muted-foreground font-medium mb-1">{s.name}</div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab: Historical ── */}
          <TabsContent value="historical" className="mt-4 space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                  Major Yield Curve Inversions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-muted-foreground">
                    <thead>
                      <tr className="border-b border-border">
                        {["Period", "Start", "End", "Peak Depth", "Recession", "Lead Time", "Severity"].map(
                          (h) => (
                            <th key={h} className="text-left py-2 pr-4 text-muted-foreground font-medium">
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {HISTORICAL_INVERSIONS.map((inv) => (
                        <tr key={inv.period} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                          <td className="py-2 pr-4 font-medium">{inv.period}</td>
                          <td className="py-2 pr-4 text-muted-foreground">{inv.start}</td>
                          <td className="py-2 pr-4 text-muted-foreground">{inv.end}</td>
                          <td className="py-2 pr-4 text-red-400 font-mono tabular-nums">{inv.depth} bps</td>
                          <td className="py-2 pr-4 text-muted-foreground">{inv.recessionStart}</td>
                          <td className="py-2 pr-4 font-mono tabular-nums">
                            {inv.lag > 0 ? `+${inv.lag} mo` : "TBD"}
                          </td>
                          <td className="py-2">
                            <Badge
                              variant="outline"
                              className={cn("text-xs text-muted-foreground capitalize", severityColor(inv.severity))}
                            >
                              {inv.severity}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Inversion bar chart */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Inversion Depth Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {HISTORICAL_INVERSIONS.map((inv) => {
                    const maxDepth = 200;
                    const pct = Math.abs(inv.depth) / maxDepth;
                    return (
                      <div key={inv.period} className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span className="font-medium">{inv.period}</span>
                          <span className={cn("tabular-nums", severityColor(inv.severity))}>
                            {inv.depth} bps
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct * 100}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className={cn(
                              "h-full rounded-full",
                              inv.severity === "severe"
                                ? "bg-red-500"
                                : inv.severity === "moderate"
                                ? "bg-orange-500"
                                : "bg-yellow-500"
                            )}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  All 5 modern inversions were followed by recessions (2020 was pandemic-driven). Average lead time: ~19 months.
                  Deeper inversions correlated with more severe downturns.
                </p>
              </CardContent>
            </Card>

            {/* Regime base rates */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Curve Regime Base Rates (Since 1976)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { regime: "Normal / Steep", pct: 55, months: 36, color: "bg-green-500" },
                    { regime: "Flat (0–50 bps)", pct: 22, months: 8, color: "bg-yellow-500" },
                    { regime: "Inverted", pct: 15, months: 10, color: "bg-orange-500" },
                    { regime: "Deeply Inverted", pct: 8, months: 14, color: "bg-red-500" },
                  ].map((r) => (
                    <div key={r.regime} className="p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={cn("h-2 w-2 rounded-full", r.color)} />
                        <span className="text-xs text-muted-foreground font-medium">{r.regime}</span>
                      </div>
                      <div className="text-lg font-medium tabular-nums">{r.pct}%</div>
                      <div className="text-xs text-muted-foreground">Avg {r.months} months</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab: Macro Signals ── */}
          <TabsContent value="macro" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BarChart3 className="h-3.5 w-3.5 text-muted-foreground/50" />
                    Macro Drivers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {macroSignals.map((sig) => (
                    <div
                      key={sig.signal}
                      className="p-3 rounded-lg border border-border bg-muted/20 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-medium">{sig.signal}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-medium tabular-nums">{sig.value}</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs text-muted-foreground",
                              sig.impact === "bullish"
                                ? "text-green-400 border-green-500/30 bg-green-500/10"
                                : sig.impact === "bearish"
                                ? "text-red-400 border-red-500/30 bg-red-500/10"
                                : "text-yellow-400 border-yellow-500/30 bg-yellow-500/10"
                            )}
                          >
                            {sig.impact === "bullish" ? "Steepener" : sig.impact === "bearish" ? "Flattener" : "Neutral"}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{sig.implication}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Target className="h-3.5 w-3.5 text-muted-foreground/50" />
                      Signal Scorecard
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const steepeners = macroSignals.filter((s) => s.impact === "bullish").length;
                      const flatteners = macroSignals.filter((s) => s.impact === "bearish").length;
                      const neutrals = macroSignals.filter((s) => s.impact === "neutral").length;
                      const total = macroSignals.length;
                      return (
                        <div className="space-y-3">
                          {[
                            { label: "Steepener signals", count: steepeners, color: "bg-green-500", textColor: "text-green-400" },
                            { label: "Flattener signals", count: flatteners, color: "bg-red-500", textColor: "text-red-400" },
                            { label: "Neutral signals", count: neutrals, color: "bg-yellow-500", textColor: "text-yellow-400" },
                          ].map((row) => (
                            <div key={row.label} className="space-y-1">
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span className="text-muted-foreground">{row.label}</span>
                                <span className={cn("font-medium", row.textColor)}>{row.count}/{total}</span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(row.count / total) * 100}%` }}
                                  transition={{ duration: 0.5, ease: "easeOut" }}
                                  className={cn("h-full rounded-full", row.color)}
                                />
                              </div>
                            </div>
                          ))}
                          <div className="pt-2 border-t border-border">
                            <div className="text-xs font-medium text-muted-foreground mb-1">Net Bias</div>
                            <div className={cn(
                              "text-sm font-medium",
                              steepeners > flatteners ? "text-green-400" : steepeners < flatteners ? "text-red-400" : "text-yellow-400"
                            )}>
                              {steepeners > flatteners ? "Steepener Bias" : steepeners < flatteners ? "Flattener Bias" : "Mixed Signals"}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <RefreshCw className="h-3.5 w-3.5 text-muted-foreground/50" />
                      Key Risk Factors
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { risk: "Re-acceleration of inflation forces Fed to stay higher-for-longer", level: "high" },
                      { risk: "Term premium compression on recession fears flattens long end", level: "medium" },
                      { risk: "Treasury supply surge overwhelms demand at long end", level: "medium" },
                      { risk: "Geopolitical flight-to-quality compresses 10Y yield", level: "low" },
                      { risk: "Soft landing delays curve normalization timeline", level: "medium" },
                    ].map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <div
                          className={cn(
                            "h-1.5 w-1.5 rounded-full mt-1.5 flex-shrink-0",
                            r.level === "high"
                              ? "bg-red-400"
                              : r.level === "medium"
                              ? "bg-orange-400"
                              : "bg-yellow-400"
                          )}
                        />
                        <span className="text-muted-foreground leading-relaxed">{r.risk}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Fed path */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Fed Rate Path Scenarios & Curve Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    {
                      scenario: "Soft Landing",
                      prob: 45,
                      cuts: "3–4 cuts in 2026",
                      impact2s10s: "+60 to +90 bps",
                      bestTrade: "2s10s Steepener",
                      color: "border-green-500/30 bg-green-500/5",
                    },
                    {
                      scenario: "Hard Landing",
                      prob: 30,
                      cuts: "5–7 cuts, emergency pace",
                      impact2s10s: "+100 to +150 bps",
                      bestTrade: "2s10s Bull Steepener",
                      color: "border-orange-500/30 bg-orange-500/5",
                    },
                    {
                      scenario: "No Landing",
                      prob: 25,
                      cuts: "0–1 cuts, possible hike",
                      impact2s10s: "-30 to -60 bps",
                      bestTrade: "5s30s Flattener",
                      color: "border-red-500/30 bg-red-500/5",
                    },
                  ].map((sc) => (
                    <div key={sc.scenario} className={cn("p-3 rounded-lg border space-y-2", sc.color)}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-medium">{sc.scenario}</span>
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          {sc.prob}%
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="text-muted-foreground">{sc.cuts}</div>
                        <div>
                          <span className="text-muted-foreground">2s10s → </span>
                          <span className="font-medium text-green-400">{sc.impact2s10s}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Best trade: </span>
                          <span className="font-medium">{sc.bestTrade}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* ── Info tooltip handler ── */}
      {showInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowInfo(null)}
        >
          <div className="bg-card border border-border rounded-md p-4 max-w-sm mx-4">
            <p className="text-sm text-muted-foreground">{showInfo}</p>
          </div>
        </div>
      )}
    </div>
  );
}
