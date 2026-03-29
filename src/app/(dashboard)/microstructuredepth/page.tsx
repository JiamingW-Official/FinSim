"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Clock,
  DollarSign,
  Info,
  Layers,
  Scale,
  Shield,
  TrendingDown,
  TrendingUp,
  Zap,
  Target,
  GitBranch,
  Eye,
  Cpu,
  Waves,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 825;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
const _r: number[] = [];
for (let i = 0; i < 400; i++) _r.push(rand());
let _ri = 0;
const rnd = () => _r[_ri++ % _r.length];

// ── Pre-generate all seeded data ──────────────────────────────────────────────

// Spread decomposition (sums to 100)
const adverseSelectionPct = Math.round(rnd() * 20 + 35); // 35–55%
const inventoryPct = Math.round(rnd() * 15 + 20); // 20–35%
const orderProcessingPct = 100 - adverseSelectionPct - inventoryPct;

// Realized vs effective spreads (basis points) across 10 symbols
const spreadSymbols = ["AAPL", "MSFT", "SPY", "AMZN", "TSLA", "META", "NVDA", "QQQ", "GOOG", "BRK.B"];
const realizedSpreads = spreadSymbols.map(() => +(rnd() * 2 + 0.5).toFixed(2));
const effectiveSpreads = realizedSpreads.map((r) => +(r * (rnd() * 0.4 + 0.8)).toFixed(2));

// Roll model implied spreads
const rollAutocovariances = Array.from({ length: 8 }, () => -(rnd() * 0.0004 + 0.0001));
const rollImpliedSpreads = rollAutocovariances.map((cov) => +(2 * Math.sqrt(Math.abs(cov)) * 100).toFixed(3));

// Quote lifetime distribution (ms buckets)
const quoteLifetimeBuckets = [0, 1, 5, 10, 50, 100, 500, 1000];
const quoteLifetimeCounts = quoteLifetimeBuckets.map(() => Math.round(rnd() * 800 + 50));
// Make very short-lived quotes dominate (HFT effect)
quoteLifetimeCounts[0] = Math.round(rnd() * 3000 + 2000);
quoteLifetimeCounts[1] = Math.round(rnd() * 1500 + 800);

// Order flow imbalance (buy vs sell volumes across 12 intervals)
const ofiIntervals = Array.from({ length: 12 }, (_, i) => i * 5);
const buyVolumes = ofiIntervals.map(() => Math.round(rnd() * 5000 + 2000));
const sellVolumes = ofiIntervals.map(() => Math.round(rnd() * 5000 + 2000));
const ofiValues = buyVolumes.map((b, i) => +((b - sellVolumes[i]) / (b + sellVolumes[i])).toFixed(3));

// Toxic flow classification
const toxicFlowRows: Array<{ symbol: string; advSelComp: number; toxicPct: number; normalPct: number; vpinScore: number; classification: string }> = spreadSymbols.slice(0, 8).map((sym) => {
  const adv = +(rnd() * 40 + 20).toFixed(1);
  const toxic = +(rnd() * 30 + 15).toFixed(1);
  const vpin = +(rnd() * 0.5 + 0.3).toFixed(3);
  return {
    symbol: sym,
    advSelComp: adv,
    toxicPct: toxic,
    normalPct: +(100 - toxic).toFixed(1),
    vpinScore: vpin,
    classification: vpin > 0.65 ? "High Toxic" : vpin > 0.5 ? "Elevated" : "Normal",
  };
});

// Price impact data (permanent vs temporary)
const impactPoints = Array.from({ length: 20 }, (_, i) => {
  const tradeSize = (i + 1) * 100000;
  const sqrtSize = Math.sqrt(tradeSize / 1000000);
  const permanent = +(sqrtSize * (rnd() * 0.003 + 0.006)).toFixed(4);
  const temporary = +(sqrtSize * (rnd() * 0.004 + 0.004)).toFixed(4);
  return { tradeSize, permanent, temporary, total: +(permanent + temporary).toFixed(4) };
});

// Kyle lambda estimates per asset class
const kyleLambdaAssets = [
  { name: "Large-cap equity", lambda: +(rnd() * 0.002 + 0.001).toFixed(4), liquidity: "High" },
  { name: "Small-cap equity", lambda: +(rnd() * 0.015 + 0.008).toFixed(4), liquidity: "Low" },
  { name: "S&P 500 futures", lambda: +(rnd() * 0.0005 + 0.0002).toFixed(4), liquidity: "Very High" },
  { name: "IG Corporate bonds", lambda: +(rnd() * 0.008 + 0.004).toFixed(4), liquidity: "Medium" },
  { name: "HY Corporate bonds", lambda: +(rnd() * 0.025 + 0.015).toFixed(4), liquidity: "Very Low" },
  { name: "EUR/USD spot", lambda: +(rnd() * 0.0003 + 0.0001).toFixed(4), liquidity: "Very High" },
];

// TWAP vs VWAP vs IS comparison (cost in bps across 10 slices)
const executionSlices = Array.from({ length: 10 }, (_, i) => i + 1);
const twapCosts = executionSlices.map(() => +(rnd() * 3 + 1).toFixed(2));
const vwapCosts = executionSlices.map(() => +(rnd() * 2.5 + 0.8).toFixed(2));
const isCosts = executionSlices.map(() => +(rnd() * 4 + 1.5).toFixed(2));

// Almgren-Chriss optimal trajectory
const acSlices = Array.from({ length: 10 }, (_, i) => i);
const acRemaining = acSlices.map((i) => +(Math.exp(-0.3 * i) * 100).toFixed(1));
const acLinear = acSlices.map((i) => +(100 - i * 10).toFixed(1));

// Intraday volume profile (9:30 to 16:00, 13 half-hour buckets)
const intradayHours = ["9:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"];
const intradayVolume = intradayHours.map((h, i) => {
  // U-shaped intraday pattern
  const t = i / (intradayHours.length - 1);
  const uShape = 1 - 4 * (t - 0.5) ** 2 + 2 * (t < 0.5 ? (0.5 - t) : (t - 0.5)) ** 2;
  return Math.round((uShape * 0.5 + 0.5) * (rnd() * 0.4 + 0.8) * 1000);
});
// Boost open and close
intradayVolume[0] = Math.round(intradayVolume[0] * 2.5);
intradayVolume[intradayHours.length - 1] = Math.round(intradayVolume[intradayHours.length - 1] * 2.2);

// ── Helper utilities ──────────────────────────────────────────────────────────
function lerp(arr: number[]): [number, number] {
  return [Math.min(...arr), Math.max(...arr)];
}

function normalizeTo(arr: number[], lo: number, hi: number): number[] {
  const [min, max] = lerp(arr);
  return arr.map((v) => lo + ((v - min) / (max - min || 1)) * (hi - lo));
}

// ── Sub-components ────────────────────────────────────────────────────────────

// Pie chart for spread decomposition
function SpreadPieChart() {
  const segments = [
    { label: "Adverse Selection", value: adverseSelectionPct, color: "#ef4444" },
    { label: "Inventory Risk", value: inventoryPct, color: "#f59e0b" },
    { label: "Order Processing", value: orderProcessingPct, color: "#3b82f6" },
  ];
  const cx = 110;
  const cy = 110;
  const r = 85;
  let cumAngle = -Math.PI / 2;

  const paths = segments.map((seg) => {
    const angle = (seg.value / 100) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(cumAngle);
    const y1 = cy + r * Math.sin(cumAngle);
    cumAngle += angle;
    const x2 = cx + r * Math.cos(cumAngle);
    const y2 = cy + r * Math.sin(cumAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const midAngle = cumAngle - angle / 2;
    const lx = cx + (r + 18) * Math.cos(midAngle);
    const ly = cy + (r + 18) * Math.sin(midAngle);
    return { d: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`, lx, ly, ...seg };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={220} height={220} viewBox="0 0 220 220">
        {paths.map((p) => (
          <path key={p.label} d={p.d} fill={p.color} opacity={0.85} stroke="#1e293b" strokeWidth={2} />
        ))}
        <circle cx={cx} cy={cy} r={42} fill="#0f172a" />
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#94a3b8" fontSize={10}>Bid-Ask</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fill="#94a3b8" fontSize={10}>Spread</text>
        <text x={cx} y={cy + 20} textAnchor="middle" fill="#f1f5f9" fontSize={12} fontWeight="bold">100%</text>
      </svg>
      <div className="flex flex-wrap justify-center gap-3">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-xs text-slate-300">{seg.label}</span>
            <Badge variant="outline" className="text-xs px-1 py-0 border-slate-600 text-slate-400">{seg.value}%</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

// Realized vs Effective Spread bar chart
function SpreadComparisonChart() {
  const maxSpread = Math.max(...realizedSpreads, ...effectiveSpreads);
  const barH = 14;
  const gap = 6;
  const rowH = barH * 2 + gap + 10;
  const labelW = 52;
  const chartW = 320;
  const svgH = spreadSymbols.length * rowH + 20;

  return (
    <svg width={chartW + labelW + 30} height={svgH} viewBox={`0 0 ${chartW + labelW + 30} ${svgH}`} className="overflow-visible">
      {spreadSymbols.map((sym, i) => {
        const ry = 10 + i * rowH;
        const rw = (realizedSpreads[i] / maxSpread) * chartW;
        const ew = (effectiveSpreads[i] / maxSpread) * chartW;
        return (
          <g key={sym}>
            <text x={labelW - 4} y={ry + barH / 2 + 4} textAnchor="end" fill="#94a3b8" fontSize={10}>{sym}</text>
            <rect x={labelW} y={ry} width={rw} height={barH} rx={2} fill="#3b82f6" opacity={0.8} />
            <text x={labelW + rw + 3} y={ry + barH / 2 + 4} fill="#94a3b8" fontSize={9}>{realizedSpreads[i]}</text>
            <rect x={labelW} y={ry + barH + 2} width={ew} height={barH} rx={2} fill="#f59e0b" opacity={0.8} />
            <text x={labelW + ew + 3} y={ry + barH * 1.5 + 6} fill="#94a3b8" fontSize={9}>{effectiveSpreads[i]}</text>
          </g>
        );
      })}
      <g transform={`translate(${labelW}, ${svgH - 14})`}>
        <rect x={0} y={0} width={10} height={8} rx={1} fill="#3b82f6" />
        <text x={13} y={8} fill="#94a3b8" fontSize={9}>Realized</text>
        <rect x={70} y={0} width={10} height={8} rx={1} fill="#f59e0b" />
        <text x={83} y={8} fill="#94a3b8" fontSize={9}>Effective (bps)</text>
      </g>
    </svg>
  );
}

// Quote lifetime distribution
function QuoteLifetimeChart() {
  const maxCount = Math.max(...quoteLifetimeCounts);
  const w = 320;
  const h = 120;
  const pad = { l: 40, r: 10, t: 10, b: 30 };
  const barW = (w - pad.l - pad.r) / quoteLifetimeCounts.length - 3;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {quoteLifetimeCounts.map((cnt, i) => {
        const bh = ((cnt / maxCount) * (h - pad.t - pad.b));
        const bx = pad.l + i * ((w - pad.l - pad.r) / quoteLifetimeCounts.length);
        const by = h - pad.b - bh;
        const label = i === 0 ? "<1ms" : `${quoteLifetimeBuckets[i]}ms`;
        return (
          <g key={i}>
            <rect x={bx} y={by} width={barW} height={bh} rx={2} fill={i < 2 ? "#ef4444" : "#3b82f6"} opacity={0.8} />
            <text x={bx + barW / 2} y={h - pad.b + 12} textAnchor="middle" fill="#64748b" fontSize={8}>{label}</text>
          </g>
        );
      })}
      <line x1={pad.l - 4} y1={h - pad.b} x2={w - pad.r} y2={h - pad.b} stroke="#334155" strokeWidth={1} />
      <text x={pad.l - 6} y={h - pad.b} textAnchor="end" fill="#64748b" fontSize={8}>0</text>
      <text x={pad.l - 6} y={pad.t + 8} textAnchor="end" fill="#64748b" fontSize={8}>{(maxCount / 1000).toFixed(1)}k</text>
      <text x={w / 2} y={h - 2} textAnchor="middle" fill="#64748b" fontSize={9}>Quote Lifetime</text>
    </svg>
  );
}

// Order Flow Imbalance SVG bar chart
function OFIChart() {
  const w = 380;
  const h = 130;
  const pad = { l: 48, r: 10, t: 10, b: 28 };
  const barW = (w - pad.l - pad.r) / ofiValues.length - 3;
  const midY = h / 2;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <line x1={pad.l} y1={midY} x2={w - pad.r} y2={midY} stroke="#334155" strokeWidth={1} />
      {ofiValues.map((v, i) => {
        const bh = Math.abs(v) * (h / 2 - pad.t - 5);
        const bx = pad.l + i * ((w - pad.l - pad.r) / ofiValues.length);
        const by = v >= 0 ? midY - bh : midY;
        const fill = v >= 0 ? "#22c55e" : "#ef4444";
        return (
          <g key={i}>
            <rect x={bx} y={by} width={barW} height={bh} rx={1} fill={fill} opacity={0.8} />
            <text x={bx + barW / 2} y={h - pad.b + 12} textAnchor="middle" fill="#64748b" fontSize={8}>{ofiIntervals[i]}m</text>
          </g>
        );
      })}
      <text x={pad.l - 4} y={midY + 4} textAnchor="end" fill="#64748b" fontSize={8}>0</text>
      <text x={pad.l - 4} y={pad.t + 8} textAnchor="end" fill="#22c55e" fontSize={8}>+1</text>
      <text x={pad.l - 4} y={h - pad.b - 2} textAnchor="end" fill="#ef4444" fontSize={8}>-1</text>
      <text x={w / 2} y={h - 2} textAnchor="middle" fill="#64748b" fontSize={9}>OFI by Interval (minutes)</text>
    </svg>
  );
}

// VPIN Gauge
function VPINGauge({ value }: { value: number }) {
  const angle = -130 + (value / 1) * 260;
  const r = 52;
  const cx = 70;
  const cy = 70;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const gx = cx + r * Math.cos(toRad(angle));
  const gy = cy + r * Math.sin(toRad(angle));

  const zones = [
    { start: -130, end: -43, color: "#22c55e", label: "Low" },
    { start: -43, end: 43, color: "#f59e0b", label: "Elevated" },
    { start: 43, end: 130, color: "#ef4444", label: "High" },
  ];

  function arcPath(startDeg: number, endDeg: number, radius: number) {
    const s = toRad(startDeg);
    const e = toRad(endDeg);
    const x1 = cx + radius * Math.cos(s);
    const y1 = cy + radius * Math.sin(s);
    const x2 = cx + radius * Math.cos(e);
    const y2 = cy + radius * Math.sin(e);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
  }

  return (
    <svg width={140} height={100} viewBox="0 0 140 100">
      {zones.map((z) => (
        <path key={z.label} d={arcPath(z.start, z.end, r)} fill="none" stroke={z.color} strokeWidth={10} opacity={0.7} />
      ))}
      <line x1={cx} y1={cy} x2={gx} y2={gy} stroke="#f1f5f9" strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={4} fill="#f1f5f9" />
      <text x={cx} y={cy + 22} textAnchor="middle" fill="#f1f5f9" fontSize={14} fontWeight="bold">{value.toFixed(2)}</text>
      <text x={cx} y={cy + 34} textAnchor="middle" fill="#94a3b8" fontSize={8}>VPIN Score</text>
    </svg>
  );
}

// Price Impact SVG chart
function PriceImpactChart() {
  const w = 380;
  const h = 180;
  const pad = { l: 48, r: 12, t: 14, b: 36 };
  const maxImpact = Math.max(...impactPoints.map((p) => p.total));
  const maxSize = impactPoints[impactPoints.length - 1].tradeSize;

  function px(tradeSize: number) {
    return pad.l + ((tradeSize / maxSize) * (w - pad.l - pad.r));
  }
  function py(impact: number) {
    return h - pad.b - (impact / maxImpact) * (h - pad.t - pad.b);
  }

  const permPath = impactPoints.map((p, i) => `${i === 0 ? "M" : "L"}${px(p.tradeSize)},${py(p.permanent)}`).join(" ");
  const tempPath = impactPoints.map((p, i) => `${i === 0 ? "M" : "L"}${px(p.tradeSize)},${py(p.temporary)}`).join(" ");
  const totalPath = impactPoints.map((p, i) => `${i === 0 ? "M" : "L"}${px(p.tradeSize)},${py(p.total)}`).join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <line x1={pad.l} y1={h - pad.b} x2={w - pad.r} y2={h - pad.b} stroke="#334155" strokeWidth={1} />
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={h - pad.b} stroke="#334155" strokeWidth={1} />
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
        const val = frac * maxImpact;
        const y = py(val);
        return (
          <g key={frac}>
            <line x1={pad.l} y1={y} x2={w - pad.r} y2={y} stroke="#1e293b" strokeWidth={1} strokeDasharray="4,4" />
            <text x={pad.l - 4} y={y + 4} textAnchor="end" fill="#64748b" fontSize={8}>{(val * 100).toFixed(1)}bp</text>
          </g>
        );
      })}
      {[0.25, 0.5, 0.75, 1].map((frac) => {
        const sz = frac * maxSize;
        const x = px(sz);
        return (
          <g key={frac}>
            <text x={x} y={h - pad.b + 12} textAnchor="middle" fill="#64748b" fontSize={8}>${(sz / 1000000).toFixed(1)}M</text>
          </g>
        );
      })}
      <path d={permPath} fill="none" stroke="#3b82f6" strokeWidth={2} />
      <path d={tempPath} fill="none" stroke="#f59e0b" strokeWidth={2} />
      <path d={totalPath} fill="none" stroke="#ef4444" strokeWidth={2} strokeDasharray="6,3" />
      <g transform={`translate(${pad.l + 8}, ${pad.t + 4})`}>
        <line x1={0} y1={4} x2={14} y2={4} stroke="#3b82f6" strokeWidth={2} />
        <text x={16} y={8} fill="#94a3b8" fontSize={9}>Permanent</text>
        <line x1={80} y1={4} x2={94} y2={4} stroke="#f59e0b" strokeWidth={2} />
        <text x={96} y={8} fill="#94a3b8" fontSize={9}>Temporary</text>
        <line x1={166} y1={4} x2={180} y2={4} stroke="#ef4444" strokeWidth={2} strokeDasharray="4,2" />
        <text x={182} y={8} fill="#94a3b8" fontSize={9}>Total</text>
      </g>
      <text x={w / 2} y={h - 2} textAnchor="middle" fill="#64748b" fontSize={9}>Trade Size</text>
    </svg>
  );
}

// Execution Strategy Comparison SVG
function ExecutionComparisonChart() {
  const w = 380;
  const h = 170;
  const pad = { l: 42, r: 12, t: 14, b: 34 };
  const allCosts = [...twapCosts, ...vwapCosts, ...isCosts];
  const maxCost = Math.max(...allCosts);

  function px(slice: number) {
    return pad.l + ((slice / (executionSlices.length - 1)) * (w - pad.l - pad.r));
  }
  function py(cost: number) {
    return h - pad.b - (cost / maxCost) * (h - pad.t - pad.b);
  }

  const twapPath = twapCosts.map((c, i) => `${i === 0 ? "M" : "L"}${px(i)},${py(c)}`).join(" ");
  const vwapPath = vwapCosts.map((c, i) => `${i === 0 ? "M" : "L"}${px(i)},${py(c)}`).join(" ");
  const isPath = isCosts.map((c, i) => `${i === 0 ? "M" : "L"}${px(i)},${py(c)}`).join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <line x1={pad.l} y1={h - pad.b} x2={w - pad.r} y2={h - pad.b} stroke="#334155" strokeWidth={1} />
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={h - pad.b} stroke="#334155" strokeWidth={1} />
      {[0, 0.5, 1].map((frac) => {
        const val = frac * maxCost;
        const y = py(val);
        return (
          <g key={frac}>
            <line x1={pad.l} y1={y} x2={w - pad.r} y2={y} stroke="#1e293b" strokeWidth={1} strokeDasharray="4,4" />
            <text x={pad.l - 4} y={y + 4} textAnchor="end" fill="#64748b" fontSize={8}>{val.toFixed(1)}bp</text>
          </g>
        );
      })}
      {executionSlices.map((_, i) => {
        if (i % 3 !== 0) return null;
        return (
          <text key={i} x={px(i)} y={h - pad.b + 12} textAnchor="middle" fill="#64748b" fontSize={8}>S{i + 1}</text>
        );
      })}
      <path d={twapPath} fill="none" stroke="#3b82f6" strokeWidth={2} />
      <path d={vwapPath} fill="none" stroke="#22c55e" strokeWidth={2} />
      <path d={isPath} fill="none" stroke="#a855f7" strokeWidth={2} />
      <g transform={`translate(${pad.l + 8}, ${pad.t + 2})`}>
        <line x1={0} y1={4} x2={14} y2={4} stroke="#3b82f6" strokeWidth={2} />
        <text x={16} y={8} fill="#94a3b8" fontSize={9}>TWAP</text>
        <line x1={56} y1={4} x2={70} y2={4} stroke="#22c55e" strokeWidth={2} />
        <text x={72} y={8} fill="#94a3b8" fontSize={9}>VWAP</text>
        <line x1={112} y1={4} x2={126} y2={4} stroke="#a855f7" strokeWidth={2} />
        <text x={128} y={8} fill="#94a3b8" fontSize={9}>IS (bps)</text>
      </g>
      <text x={w / 2} y={h - 2} textAnchor="middle" fill="#64748b" fontSize={9}>Execution Slices</text>
    </svg>
  );
}

// Almgren-Chriss trajectory SVG
function ACTrajectoryChart() {
  const w = 320;
  const h = 140;
  const pad = { l: 36, r: 12, t: 12, b: 28 };

  function px(i: number) {
    return pad.l + (i / (acSlices.length - 1)) * (w - pad.l - pad.r);
  }
  function py(pct: number) {
    return h - pad.b - (pct / 100) * (h - pad.t - pad.b);
  }

  const optPath = acRemaining.map((v, i) => `${i === 0 ? "M" : "L"}${px(i)},${py(v)}`).join(" ");
  const linPath = acLinear.map((v, i) => `${i === 0 ? "M" : "L"}${px(i)},${py(v)}`).join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <line x1={pad.l} y1={h - pad.b} x2={w - pad.r} y2={h - pad.b} stroke="#334155" strokeWidth={1} />
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={h - pad.b} stroke="#334155" strokeWidth={1} />
      {[0, 50, 100].map((v) => {
        const y = py(v);
        return (
          <g key={v}>
            <line x1={pad.l} y1={y} x2={w - pad.r} y2={y} stroke="#1e293b" strokeWidth={1} strokeDasharray="3,3" />
            <text x={pad.l - 4} y={y + 4} textAnchor="end" fill="#64748b" fontSize={8}>{v}%</text>
          </g>
        );
      })}
      <path d={linPath} fill="none" stroke="#64748b" strokeWidth={1.5} strokeDasharray="5,3" />
      <path d={optPath} fill="none" stroke="#22c55e" strokeWidth={2.5} />
      <g transform={`translate(${pad.l + 8}, ${pad.t + 2})`}>
        <line x1={0} y1={4} x2={14} y2={4} stroke="#22c55e" strokeWidth={2.5} />
        <text x={16} y={8} fill="#94a3b8" fontSize={9}>AC Optimal</text>
        <line x1={86} y1={4} x2={100} y2={4} stroke="#64748b" strokeWidth={1.5} strokeDasharray="4,2" />
        <text x={102} y={8} fill="#94a3b8" fontSize={9}>Linear</text>
      </g>
      <text x={w / 2} y={h - 2} textAnchor="middle" fill="#64748b" fontSize={9}>Shares Remaining (%)</text>
    </svg>
  );
}

// Intraday Volume Profile SVG
function IntradayVolumeChart() {
  const w = 380;
  const h = 130;
  const pad = { l: 36, r: 10, t: 10, b: 28 };
  const maxVol = Math.max(...intradayVolume);
  const barW = (w - pad.l - pad.r) / intradayHours.length - 2;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <line x1={pad.l} y1={h - pad.b} x2={w - pad.r} y2={h - pad.b} stroke="#334155" strokeWidth={1} />
      {intradayVolume.map((v, i) => {
        const bh = (v / maxVol) * (h - pad.t - pad.b);
        const bx = pad.l + i * ((w - pad.l - pad.r) / intradayHours.length);
        const by = h - pad.b - bh;
        const isOpen = i === 0 || i === 1;
        const isClose = i >= intradayHours.length - 2;
        const fill = isOpen || isClose ? "#f59e0b" : "#3b82f6";
        return (
          <g key={i}>
            <rect x={bx} y={by} width={barW} height={bh} rx={1} fill={fill} opacity={0.8} />
            {i % 2 === 0 && (
              <text x={bx + barW / 2} y={h - pad.b + 11} textAnchor="middle" fill="#64748b" fontSize={7}>{intradayHours[i]}</text>
            )}
          </g>
        );
      })}
      <text x={w / 2} y={h - 2} textAnchor="middle" fill="#64748b" fontSize={9}>Intraday Volume Profile (U-shape)</text>
    </svg>
  );
}

// ── Info Cards ────────────────────────────────────────────────────────────────
interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  body: string;
  color: string;
}
function InfoCard({ icon, title, body, color }: InfoCardProps) {
  return (
    <div className={cn("rounded-lg border p-4 flex gap-3", color)}>
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-slate-200 mb-1">{title}</p>
        <p className="text-xs text-slate-400 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

// ── Main Page Component ───────────────────────────────────────────────────────
export default function MicrostructureDepthPage() {
  const [impactTradeSize, setImpactTradeSize] = useState<number[]>([1]);
  const [selectedSymbol, setSelectedSymbol] = useState(0);
  const [showRollDetail, setShowRollDetail] = useState(false);

  // Square-root impact model: impact(bps) = sigma * sqrt(Q/ADV) * kappa
  const sigma = 0.015;
  const kappa = 0.3;
  const adv = 50; // $50M ADV
  const qm = impactTradeSize[0]; // $M
  const sqrtImpact = useMemo(
    () => +(sigma * Math.sqrt(qm / adv) * kappa * 10000).toFixed(2),
    [qm]
  );

  // Slippage estimate
  const slippageBps = useMemo(() => +(sqrtImpact * (rnd() * 0.2 + 0.85)).toFixed(2), [sqrtImpact]);
  const slippageDollar = useMemo(() => +(qm * 1_000_000 * slippageBps / 10000).toFixed(0), [qm, slippageBps]);

  const avgOFI = useMemo(() => (ofiValues.reduce((a, b) => a + b, 0) / ofiValues.length).toFixed(3), []);
  const avgVPIN = useMemo(() => (toxicFlowRows.reduce((a, b) => a + b.vpinScore, 0) / toxicFlowRows.length).toFixed(3), []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Layers className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Market Microstructure Deep Dive</h1>
            <p className="text-sm text-slate-400">Bid-ask decomposition · Adverse selection · Inventory risk · Optimal execution</p>
          </div>
        </div>
        {/* KPI chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            { label: "Adverse Selection", value: `${adverseSelectionPct}%`, color: "text-red-400 border-red-500/30 bg-red-500/5" },
            { label: "Avg VPIN", value: avgVPIN, color: "text-amber-400 border-amber-500/30 bg-amber-500/5" },
            { label: "Avg OFI", value: avgOFI, color: Number(avgOFI) >= 0 ? "text-green-400 border-green-500/30 bg-green-500/5" : "text-red-400 border-red-500/30 bg-red-500/5" },
            { label: "Kyle λ (large-cap)", value: kyleLambdaAssets[0].lambda, color: "text-blue-400 border-blue-500/30 bg-blue-500/5" },
            { label: "√-Impact @$1M", value: `${(sigma * Math.sqrt(1 / adv) * kappa * 10000).toFixed(2)}bp`, color: "text-purple-400 border-purple-500/30 bg-purple-500/5" },
          ].map((chip) => (
            <div key={chip.label} className={cn("flex items-center gap-1.5 border rounded-full px-3 py-1", chip.color)}>
              <span className="text-xs text-slate-400">{chip.label}</span>
              <span className="text-xs font-semibold">{chip.value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="spread" className="w-full">
        <TabsList className="bg-slate-900 border border-slate-800 flex-wrap h-auto gap-1 p-1 mb-4">
          <TabsTrigger value="spread" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 text-xs sm:text-sm">
            <BarChart3 className="w-3.5 h-3.5 mr-1.5" />Spread Analysis
          </TabsTrigger>
          <TabsTrigger value="orderflow" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 text-xs sm:text-sm">
            <Activity className="w-3.5 h-3.5 mr-1.5" />Order Flow
          </TabsTrigger>
          <TabsTrigger value="impact" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 text-xs sm:text-sm">
            <TrendingDown className="w-3.5 h-3.5 mr-1.5" />Price Impact
          </TabsTrigger>
          <TabsTrigger value="execution" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 text-xs sm:text-sm">
            <Target className="w-3.5 h-3.5 mr-1.5" />Execution Models
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Spread Analysis ─────────────────────────────────────────── */}
        <TabsContent value="spread" className="data-[state=inactive]:hidden space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Spread Decomposition Pie */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-200 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-400" />
                  Bid-Ask Spread Decomposition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SpreadPieChart />
                <div className="mt-4 space-y-2">
                  <InfoCard
                    icon={<AlertTriangle className="w-4 h-4 text-red-400" />}
                    title={`Adverse Selection (${adverseSelectionPct}%)`}
                    body="Compensation for trading against informed traders. Higher for stocks with significant private information—earnings leakage, insider knowledge, or institutional flow."
                    color="border-red-500/20 bg-red-500/5"
                  />
                  <InfoCard
                    icon={<Shield className="w-4 h-4 text-amber-400" />}
                    title={`Inventory Risk (${inventoryPct}%)`}
                    body="Dealers demand compensation for holding undesired inventory positions. Driven by price volatility and difficulty of hedging—wider in illiquid or volatile markets."
                    color="border-amber-500/20 bg-amber-500/5"
                  />
                  <InfoCard
                    icon={<Zap className="w-4 h-4 text-blue-400" />}
                    title={`Order Processing (${orderProcessingPct}%)`}
                    body="Fixed operational costs: infrastructure, clearing, regulatory fees. Relatively constant—dominant for liquid, low-volatility assets like on-the-run Treasuries."
                    color="border-blue-500/20 bg-blue-500/5"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Realized vs Effective Spread */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-200 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  Realized vs Effective Spread (bps)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <SpreadComparisonChart />
                </div>
                <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <span className="text-blue-400 font-medium">Realized spread</span> measures actual dealer revenue after mid-quote reversion.
                    <span className="text-amber-400 font-medium ml-1">Effective spread</span> is twice the distance from trade price to mid — the true round-trip cost.
                    When effective &gt; realized, dealers capture positive profits; the gap equals adverse selection cost.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Roll Model + Quote Lifetime */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-slate-200 flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-green-400" />
                    Roll Model Implied Spread
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-slate-400 hover:text-slate-200"
                    onClick={() => setShowRollDetail((v) => !v)}
                  >
                    {showRollDetail ? "Hide" : "Formula"} <Info className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <AnimatePresence>
                  {showRollDetail && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-3 overflow-hidden"
                    >
                      <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                        <p className="text-xs text-slate-300 font-mono mb-1">Roll (1984) Model:</p>
                        <p className="text-xs text-blue-300 font-mono">S = 2√(-Cov(Δp_t, Δp_t-1))</p>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                          Negative serial covariance in trade-to-trade price changes implies a bid-ask bounce. The Roll measure estimates the effective half-spread from observable price data without requiring quote data.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="space-y-2">
                  {rollAutocovariances.map((cov, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-12 shrink-0">Asset {i + 1}</span>
                      <div className="flex-1 bg-slate-800 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-green-500 opacity-80"
                          style={{ width: `${Math.min(rollImpliedSpreads[i] / Math.max(...rollImpliedSpreads) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-green-400 w-14 text-right">{rollImpliedSpreads[i]} bps</span>
                      <span className="text-xs text-slate-600 font-mono w-24 text-right">cov={cov.toFixed(5)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-200 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  Quote Lifetime Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <QuoteLifetimeChart />
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  <span className="text-red-400 font-medium">&lt;1ms quotes</span> dominate — a hallmark of HFT quote stuffing. Markets see millions of sub-millisecond quotes daily, the majority never executed. This creates latency arbitrage opportunities for co-located participants.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 2: Order Flow ──────────────────────────────────────────────── */}
        <TabsContent value="orderflow" className="data-[state=inactive]:hidden space-y-4">
          {/* OFI Bar Chart */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Order Flow Imbalance (OFI) by Interval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <OFIChart />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "Avg OFI", value: avgOFI, sub: "−1 bearish / +1 bullish" },
                  { label: "Buy Pressure", value: `${(buyVolumes.reduce((a, b) => a + b, 0) / 1000).toFixed(0)}k`, sub: "total buy volume" },
                  { label: "Sell Pressure", value: `${(sellVolumes.reduce((a, b) => a + b, 0) / 1000).toFixed(0)}k`, sub: "total sell volume" },
                ].map((s) => (
                  <div key={s.label} className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/50">
                    <p className="text-xs text-slate-400">{s.label}</p>
                    <p className="text-base font-bold text-slate-100">{s.value}</p>
                    <p className="text-xs text-slate-500">{s.sub}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Toxic Flow Identifier */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  Toxic Flow Identifier
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {toxicFlowRows.map((row) => (
                    <div
                      key={row.symbol}
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/40 border border-slate-700/30 cursor-pointer hover:border-slate-600/50 transition-colors"
                      onClick={() => setSelectedSymbol(spreadSymbols.indexOf(row.symbol))}
                    >
                      <span className="text-xs font-mono font-semibold text-slate-200 w-12 shrink-0">{row.symbol}</span>
                      <div className="flex-1">
                        <div className="flex gap-0.5 h-3">
                          <div className="rounded-l bg-red-500 opacity-80" style={{ width: `${row.toxicPct}%` }} title="Toxic" />
                          <div className="rounded-r bg-slate-600 opacity-60" style={{ width: `${row.normalPct}%` }} title="Normal" />
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 w-10 text-right">{row.toxicPct}%</span>
                      <Badge
                        className={cn(
                          "text-xs px-1.5 py-0 shrink-0",
                          row.classification === "High Toxic" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                          row.classification === "Elevated" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                          "bg-green-500/20 text-green-400 border-green-500/30"
                        )}
                        variant="outline"
                      >
                        {row.classification}
                      </Badge>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-3">Toxic flow = high adverse-selection component. Dealers widen spreads or refuse to quote when toxic flow exceeds 40%.</p>
              </CardContent>
            </Card>

            {/* VPIN Gauge + Lee-Ready */}
            <div className="space-y-4">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-200 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-amber-400" />
                    VPIN Metric (Volume-Synchronized PIN)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <VPINGauge value={Number(avgVPIN)} />
                    <div className="space-y-2 flex-1">
                      <p className="text-xs text-slate-400 leading-relaxed">
                        VPIN estimates the probability of informed trading by comparing buy vs sell volume in equal-sized volume buckets. Values &gt;0.65 historically precede major price dislocations (e.g., 2010 Flash Crash VPIN exceeded 0.75).
                      </p>
                      <div className="flex gap-2">
                        {[
                          { range: "0–0.50", label: "Normal", color: "bg-green-500/20 text-green-400 border-green-500/30" },
                          { range: "0.50–0.65", label: "Elevated", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
                          { range: ">0.65", label: "High Risk", color: "bg-red-500/20 text-red-400 border-red-500/30" },
                        ].map((z) => (
                          <div key={z.range} className={cn("text-center px-2 py-1 rounded border", z.color)}>
                            <p className="text-xs font-mono">{z.range}</p>
                            <p className="text-xs">{z.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-200 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-green-400" />
                    Lee-Ready Trade Classification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs">
                    {[
                      { rule: "Quote Rule", desc: "Trade price > ask → buyer-initiated; < bid → seller-initiated", accuracy: 82 },
                      { rule: "Tick Rule", desc: "Price uptick vs last different price → buy; downtick → sell", accuracy: 74 },
                      { rule: "Lee-Ready (combined)", desc: "Quote rule primary; tick rule for midpoint trades", accuracy: 88 },
                      { rule: "Bulk Volume Classification", desc: "σ-normalized price changes map to [0,1] buy probability", accuracy: 91 },
                    ].map((r) => (
                      <div key={r.rule} className="p-2 rounded bg-slate-800/40 border border-slate-700/30">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-slate-200 font-medium">{r.rule}</span>
                          <Badge variant="outline" className="text-xs px-1.5 border-green-500/30 text-green-400">{r.accuracy}%</Badge>
                        </div>
                        <p className="text-slate-500">{r.desc}</p>
                        <Progress value={r.accuracy} className="h-1 mt-1.5 bg-slate-700" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 3: Price Impact ────────────────────────────────────────────── */}
        <TabsContent value="impact" className="data-[state=inactive]:hidden space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Permanent vs Temporary Impact chart */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-200 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  Permanent vs Temporary Price Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <PriceImpactChart />
                </div>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex gap-2">
                    <div className="flex-1 p-2 rounded bg-slate-800/40 border border-blue-500/20">
                      <p className="text-blue-400 font-medium mb-0.5">Permanent Impact</p>
                      <p className="text-slate-400">Reflects the informational content of the trade — causes a lasting price update. Related to Kyle λ and information asymmetry.</p>
                    </div>
                    <div className="flex-1 p-2 rounded bg-slate-800/40 border border-amber-500/20">
                      <p className="text-amber-400 font-medium mb-0.5">Temporary Impact</p>
                      <p className="text-slate-400">Liquidity provision cost that reverts after the trade. Market makers widen quotes to absorb large flow, then normalize.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Square-root model + slider */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-200 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  Square-Root Market Impact Model
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 mb-4 bg-blue-500/5 border border-blue-500/20 rounded-lg font-mono text-xs text-blue-300">
                  Impact(bps) = σ · √(Q / ADV) · κ
                  <p className="text-slate-400 mt-1 font-sans">σ={sigma} · κ={kappa} · ADV=$50M · Q=$<span className="text-blue-300 font-mono">{qm}M</span></p>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span>Trade Size: <span className="text-slate-200 font-semibold">${qm}M</span></span>
                    <span>Impact: <span className="text-red-400 font-semibold">{sqrtImpact} bps</span></span>
                  </div>
                  <Slider
                    value={impactTradeSize}
                    onValueChange={setImpactTradeSize}
                    min={0.1}
                    max={50}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-600 mt-1">
                    <span>$0.1M</span><span>$50M</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Impact (bps)", value: `${sqrtImpact}bp`, color: "text-red-400" },
                    { label: "Slippage ($)", value: `$${Number(slippageDollar).toLocaleString()}`, color: "text-amber-400" },
                    { label: "% of Trade", value: `${(slippageBps / 100).toFixed(3)}%`, color: "text-orange-400" },
                    { label: "√(Q/ADV)", value: `${Math.sqrt(qm / adv).toFixed(3)}`, color: "text-blue-400" },
                  ].map((s) => (
                    <div key={s.label} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
                      <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                      <p className={cn("text-sm font-bold", s.color)}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Kyle Lambda table */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-200 flex items-center gap-2">
                <Waves className="w-4 h-4 text-purple-400" />
                Kyle Lambda (λ) — Price Impact per Unit Order Flow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg text-xs font-mono text-purple-300">
                Δp = λ · (Q_buy − Q_sell) + ε
                <span className="text-slate-400 font-sans ml-2">— Kyle (1985) linear impact model</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {kyleLambdaAssets.map((asset) => {
                  const maxLambda = Math.max(...kyleLambdaAssets.map((a) => a.lambda));
                  const pct = (asset.lambda / maxLambda) * 100;
                  return (
                    <div key={asset.name} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-200">{asset.name}</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs px-1.5",
                            asset.liquidity === "Very High" ? "border-green-500/30 text-green-400" :
                            asset.liquidity === "High" ? "border-blue-500/30 text-blue-400" :
                            asset.liquidity === "Medium" ? "border-amber-500/30 text-amber-400" :
                            "border-red-500/30 text-red-400"
                          )}
                        >
                          {asset.liquidity}
                        </Badge>
                      </div>
                      <p className="text-base font-bold text-purple-400 font-mono">{asset.lambda}</p>
                      <div className="mt-1.5 bg-slate-700 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-purple-500" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">λ × order flow = price Δ</p>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Higher λ = steeper price impact per unit of net order flow. HY bonds have 10–15× higher λ than EUR/USD, reflecting illiquidity premium and wider information asymmetry.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 4: Execution Models ────────────────────────────────────────── */}
        <TabsContent value="execution" className="data-[state=inactive]:hidden space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* TWAP vs VWAP vs IS */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-200 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  TWAP vs VWAP vs Implementation Shortfall
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <ExecutionComparisonChart />
                </div>
                <div className="mt-3 space-y-2">
                  {[
                    {
                      name: "TWAP",
                      color: "text-blue-400 border-blue-500/20",
                      desc: "Time-Weighted Average Price — executes uniform slices over horizon. Simple, predictable, but ignores volume patterns. Best for transparent, low-impact orders.",
                    },
                    {
                      name: "VWAP",
                      color: "text-green-400 border-green-500/20",
                      desc: "Volume-Weighted Average Price — aligns execution with intraday volume profile (U-shape). Reduces market impact by trading more during high-volume periods.",
                    },
                    {
                      name: "Implementation Shortfall (IS)",
                      color: "text-purple-400 border-purple-500/20",
                      desc: "Almgren-Chriss framework minimizes total execution cost = impact cost + timing risk. Front-loads in volatile markets; back-loads when mean-reverting.",
                    },
                  ].map((s) => (
                    <div key={s.name} className={cn("p-2.5 rounded-lg border bg-slate-800/30 text-xs", s.color)}>
                      <p className={cn("font-semibold mb-0.5", s.color.split(" ")[0])}>{s.name}</p>
                      <p className="text-slate-400">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AC Trajectory + Intraday Volume */}
            <div className="space-y-4">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-200 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    Almgren-Chriss Optimal Trajectory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <ACTrajectoryChart />
                  </div>
                  <div className="mt-2 p-2 bg-slate-800/40 border border-slate-700/30 rounded text-xs text-slate-400">
                    The AC model trades off <span className="text-green-400">price impact cost</span> (prefers slow execution) vs <span className="text-amber-400">price risk</span> (prefers fast execution). The concave optimal path front-loads execution versus a linear schedule, especially at high risk-aversion γ.
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-200 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    Intraday Volume Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <IntradayVolumeChart />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    <span className="text-amber-400 font-medium">Open & close</span> account for ~35% of daily volume — VWAP algos concentrate here. Midday (11:30–13:30) is optimal for minimizing market impact cost.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Slippage Estimator */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-200 flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-orange-400" />
                Slippage Estimator — Cost per $1M Traded
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { strategy: "TWAP", bps: (twapCosts.reduce((a, b) => a + b) / twapCosts.length).toFixed(2), icon: "⏱" },
                  { strategy: "VWAP", bps: (vwapCosts.reduce((a, b) => a + b) / vwapCosts.length).toFixed(2), icon: "📊" },
                  { strategy: "IS", bps: (isCosts.reduce((a, b) => a + b) / isCosts.length).toFixed(2), icon: "🎯" },
                  { strategy: "Market Order", bps: (rnd() * 5 + 6).toFixed(2), icon: "⚡" },
                  { strategy: "Limit + Cancel", bps: (rnd() * 1.5 + 0.5).toFixed(2), icon: "📋" },
                  { strategy: "Dark Pool", bps: (rnd() * 2 + 0.8).toFixed(2), icon: "🌑" },
                ].map((s) => {
                  const bpsNum = Number(s.bps);
                  const costPerM = (bpsNum * 100).toFixed(0);
                  return (
                    <div key={s.strategy} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
                      <p className="text-lg mb-0.5">{s.icon}</p>
                      <p className="text-[11px] text-slate-400 font-medium mb-1">{s.strategy}</p>
                      <p className={cn("text-sm font-bold", bpsNum < 2 ? "text-green-400" : bpsNum < 4 ? "text-amber-400" : "text-red-400")}>{s.bps} bps</p>
                      <p className="text-xs text-slate-500">${costPerM} / $1M</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {[
                  {
                    icon: <Shield className="w-4 h-4 text-blue-400" />,
                    title: "Glosten-Milgrom Model",
                    body: "Sequential trade model where each trade updates dealer beliefs about asset value. Spreads widen with probability of informed trading (α) and gain from informational trade (δ). Spread = 2αδ / (2αδ + (1−α)).",
                    color: "border-blue-500/20 bg-blue-500/5",
                  },
                  {
                    icon: <Layers className="w-4 h-4 text-amber-400" />,
                    title: "Quote Stuffing Defense",
                    body: "Quote-to-trade ratio >100:1 signals potential stuffing — deliberate message flooding to degrade competitors' data feeds. Regulators flag bursts >50k quotes/sec in a single security.",
                    color: "border-amber-500/20 bg-amber-500/5",
                  },
                  {
                    icon: <Zap className="w-4 h-4 text-red-400" />,
                    title: "Latency Arbitrage",
                    body: "Co-location advantage: 1μs latency edge can capture 0.1–0.3 bps on fast-moving securities. Diminishing returns below 100μs as co-location closes the gap to network physics.",
                    color: "border-red-500/20 bg-red-500/5",
                  },
                ].map((card) => (
                  <div key={card.title} className={cn("rounded-lg border p-3 flex gap-2", card.color)}>
                    <div className="mt-0.5 shrink-0">{card.icon}</div>
                    <div>
                      <p className="font-semibold text-slate-200 mb-0.5">{card.title}</p>
                      <p className="text-slate-400 leading-relaxed">{card.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
