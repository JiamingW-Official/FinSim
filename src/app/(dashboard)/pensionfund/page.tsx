"use client";

import { useState, useMemo } from "react";
import {
  Shield,
  Building2,
  BarChart3,
  TrendingUp,
  FileText,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Info,
  Target,
  Layers,
  BookOpen,
  Scale,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 67;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed(seed = 67) {
  s = seed;
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface StatePension {
  state: string;
  fundedRatio: number;
  unfundedLiability: number; // $B
  pctGDP: number;
  trend: "improving" | "stable" | "deteriorating";
}

interface InstitutionProfile {
  name: string;
  returnTarget: string;
  riskTolerance: string;
  liquidity: string;
  horizon: string;
  taxStatus: string;
  allocation: {
    equities: number;
    bonds: number;
    alternatives: number;
    realAssets: number;
    cash: number;
  };
}

interface ManagerScore {
  name: string;
  strategy: string;
  process: number;
  team: number;
  trackRecord: number;
  riskMgmt: number;
  fees: number;
  overall: number;
  quartile: 1 | 2 | 3 | 4;
  annualReturn: number;
  benchmark: number;
}

// ── Static Data ────────────────────────────────────────────────────────────────

const STATE_PENSIONS: StatePension[] = [
  { state: "Illinois", fundedRatio: 43.3, unfundedLiability: 317, pctGDP: 15.1, trend: "deteriorating" },
  { state: "New Jersey", fundedRatio: 38.4, unfundedLiability: 214, pctGDP: 9.8, trend: "improving" },
  { state: "Kentucky", fundedRatio: 44.8, unfundedLiability: 84, pctGDP: 10.4, trend: "stable" },
  { state: "Connecticut", fundedRatio: 50.1, unfundedLiability: 77, pctGDP: 10.2, trend: "improving" },
  { state: "Colorado", fundedRatio: 62.7, unfundedLiability: 56, pctGDP: 6.1, trend: "stable" },
];

const INSTITUTIONS: InstitutionProfile[] = [
  {
    name: "Pension Fund",
    returnTarget: "7-8%",
    riskTolerance: "Moderate",
    liquidity: "Low",
    horizon: "30+ years",
    taxStatus: "Tax-exempt",
    allocation: { equities: 50, bonds: 30, alternatives: 10, realAssets: 7, cash: 3 },
  },
  {
    name: "Endowment",
    returnTarget: "CPI+5%",
    riskTolerance: "High",
    liquidity: "Very Low",
    horizon: "Perpetual",
    taxStatus: "Tax-exempt",
    allocation: { equities: 35, bonds: 10, alternatives: 30, realAssets: 20, cash: 5 },
  },
  {
    name: "Sovereign Wealth",
    returnTarget: "6-7%",
    riskTolerance: "High",
    liquidity: "Low",
    horizon: "Generational",
    taxStatus: "Sovereign",
    allocation: { equities: 55, bonds: 25, alternatives: 10, realAssets: 8, cash: 2 },
  },
  {
    name: "Insurance",
    returnTarget: "Liability+1%",
    riskTolerance: "Low",
    liquidity: "Moderate",
    horizon: "10-20 years",
    taxStatus: "Taxable",
    allocation: { equities: 20, bonds: 55, alternatives: 8, realAssets: 12, cash: 5 },
  },
  {
    name: "Foundation",
    returnTarget: "CPI+5%",
    riskTolerance: "Moderate",
    liquidity: "Low",
    horizon: "Perpetual",
    taxStatus: "Tax-exempt",
    allocation: { equities: 45, bonds: 20, alternatives: 20, realAssets: 10, cash: 5 },
  },
];

const MANAGERS: ManagerScore[] = [
  { name: "Wellington Mgmt", strategy: "Large Cap Blend", process: 88, team: 90, trackRecord: 85, riskMgmt: 87, fees: 82, overall: 87, quartile: 1, annualReturn: 12.4, benchmark: 11.1 },
  { name: "BlackRock Alpha", strategy: "Core Fixed Income", process: 84, team: 86, trackRecord: 80, riskMgmt: 89, fees: 90, overall: 86, quartile: 1, annualReturn: 5.8, benchmark: 5.1 },
  { name: "Bridgewater All Weather", strategy: "Global Macro", process: 92, team: 95, trackRecord: 78, riskMgmt: 94, fees: 60, overall: 84, quartile: 1, annualReturn: 9.2, benchmark: 7.8 },
  { name: "Vanguard Index", strategy: "Passive Equity", process: 95, team: 80, trackRecord: 92, riskMgmt: 85, fees: 98, overall: 90, quartile: 1, annualReturn: 11.8, benchmark: 11.9 },
  { name: "Ariel Capital", strategy: "Small Cap Value", process: 78, team: 82, trackRecord: 72, riskMgmt: 75, fees: 74, overall: 76, quartile: 2, annualReturn: 10.1, benchmark: 9.4 },
  { name: "Third Point", strategy: "Event Driven", process: 72, team: 78, trackRecord: 68, riskMgmt: 70, fees: 55, overall: 69, quartile: 3, annualReturn: 8.4, benchmark: 9.1 },
];

const YALE_HISTORY = [
  { year: 2000, equities: 32, bonds: 10, alternatives: 25, realAssets: 20, cash: 13 },
  { year: 2005, equities: 28, bonds: 8, alternatives: 32, realAssets: 25, cash: 7 },
  { year: 2010, equities: 18, bonds: 4, alternatives: 38, realAssets: 30, cash: 10 },
  { year: 2015, equities: 20, bonds: 5, alternatives: 40, realAssets: 28, cash: 7 },
  { year: 2020, equities: 18, bonds: 6, alternatives: 42, realAssets: 30, cash: 4 },
  { year: 2024, equities: 14, bonds: 4, alternatives: 44, realAssets: 35, cash: 3 },
];

const ALT_ALLOCATIONS = [
  { category: "Private Equity", pct: 25, color: "#6366f1", annualReturn: 14.2, illiquidity: "7-10 yr" },
  { category: "Venture Capital", pct: 10, color: "#8b5cf6", annualReturn: 18.5, illiquidity: "10-12 yr" },
  { category: "Real Estate", pct: 15, color: "#10b981", annualReturn: 9.8, illiquidity: "5-7 yr" },
  { category: "Infrastructure", pct: 10, color: "#3b82f6", annualReturn: 8.4, illiquidity: "15-20 yr" },
  { category: "Hedge Funds", pct: 15, color: "#f59e0b", annualReturn: 7.6, illiquidity: "1-3 yr" },
  { category: "Private Credit", pct: 10, color: "#ef4444", annualReturn: 10.2, illiquidity: "3-5 yr" },
  { category: "Commodities", pct: 15, color: "#64748b", annualReturn: 5.9, illiquidity: "Liquid" },
];

// ── Utility components ─────────────────────────────────────────────────────────

function SectionCard({ title, subtitle, children, className }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("bg-[#0f1117] border border-white/8 rounded-xl p-5", className)}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-white/50 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}

function MetricChip({ label, value, sub, color = "blue" }: {
  label: string;
  value: string;
  sub?: string;
  color?: "blue" | "green" | "amber" | "red" | "purple";
}) {
  const colorMap = {
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    green: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    red: "bg-red-500/10 border-red-500/20 text-red-400",
    purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
  };
  return (
    <div className={cn("border rounded-lg p-3 text-center", colorMap[color])}>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs font-medium">{label}</div>
      {sub && <div className="text-xs opacity-60 mt-0.5">{sub}</div>}
    </div>
  );
}

// ── SVG Charts ─────────────────────────────────────────────────────────────────

function AllocationPie({ data, radius = 80 }: {
  data: { label: string; value: number; color: string }[];
  radius?: number;
}) {
  const cx = radius + 10;
  const cy = radius + 10;
  const total = data.reduce((a, b) => a + b.value, 0);
  let cumAngle = -Math.PI / 2;

  const slices = data.map((d) => {
    const angle = (d.value / total) * 2 * Math.PI;
    const x1 = cx + radius * Math.cos(cumAngle);
    const y1 = cy + radius * Math.sin(cumAngle);
    cumAngle += angle;
    const x2 = cx + radius * Math.cos(cumAngle);
    const y2 = cy + radius * Math.sin(cumAngle);
    const midAngle = cumAngle - angle / 2;
    const lx = cx + (radius * 0.65) * Math.cos(midAngle);
    const ly = cy + (radius * 0.65) * Math.sin(midAngle);
    const large = angle > Math.PI ? 1 : 0;
    const path = `M${cx},${cy} L${x1},${y1} A${radius},${radius} 0 ${large},1 ${x2},${y2} Z`;
    return { ...d, path, lx, ly, angle };
  });

  return (
    <svg width={cx * 2} height={cy * 2} viewBox={`0 0 ${cx * 2} ${cy * 2}`}>
      {slices.map((sl, i) => (
        <g key={i}>
          <path d={sl.path} fill={sl.color} stroke="#0f1117" strokeWidth={1.5} />
          {sl.angle > 0.35 && (
            <text x={sl.lx} y={sl.ly} textAnchor="middle" dominantBaseline="middle"
              fontSize={9} fill="#fff" fontWeight="600">
              {Math.round(sl.value)}%
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

function FundedGauge({ ratio }: { ratio: number }) {
  const clamped = Math.min(Math.max(ratio, 0), 150);
  const r = 70;
  const cx = 90;
  const cy = 85;
  const startAngle = Math.PI;
  const endAngle = 2 * Math.PI;
  const arcAngle = startAngle + (clamped / 150) * Math.PI;
  const ax = cx + r * Math.cos(arcAngle);
  const ay = cy + r * Math.sin(arcAngle);
  const bgPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const fgPath = `M ${cx - r} ${cy} A ${r} ${r} 0 ${clamped > 75 ? 1 : 0} 1 ${ax} ${ay}`;
  const color = ratio < 60 ? "#ef4444" : ratio < 80 ? "#f59e0b" : "#10b981";

  return (
    <svg width={180} height={110} viewBox="0 0 180 110">
      <path d={bgPath} fill="none" stroke="#ffffff15" strokeWidth={14} strokeLinecap="round" />
      <path d={fgPath} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" />
      <text x={cx} y={cy - 10} textAnchor="middle" fontSize={22} fontWeight="700" fill={color}>
        {ratio.toFixed(1)}%
      </text>
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize={10} fill="#ffffff80">
        Funded Ratio
      </text>
      <text x={cx - r + 2} y={cy + 18} fontSize={8} fill="#ffffff50">0%</text>
      <text x={cx + r - 14} y={cy + 18} fontSize={8} fill="#ffffff50">150%</text>
      <text x={cx - 8} y={cy + 18} fontSize={8} fill="#ffffff50">75%</text>
    </svg>
  );
}

function SurplusEfficientFrontier() {
  resetSeed(67);
  const w = 440;
  const h = 220;
  const pad = { top: 20, right: 20, bottom: 40, left: 50 };
  const iw = w - pad.left - pad.right;
  const ih = h - pad.top - pad.bottom;

  // Generate frontier: surplus vol 2-12%, return 0-8%
  const points: { x: number; y: number }[] = [];
  for (let vol = 2; vol <= 12; vol += 0.5) {
    const ret = -0.15 * vol * vol + 3.2 * vol - 5 + (rand() - 0.5) * 0.3;
    points.push({ x: vol, y: Math.max(0, ret) });
  }
  const sortedPts = [...points].sort((a, b) => a.x - b.x);
  const px = (v: number) => pad.left + ((v - 2) / 10) * iw;
  const py = (v: number) => pad.top + (1 - v / 8) * ih;

  const pathD = sortedPts.map((p, i) => `${i === 0 ? "M" : "L"}${px(p.x).toFixed(1)},${py(p.y).toFixed(1)}`).join(" ");

  const currentPt = { x: 6.5, y: 3.8 };
  const optPt = { x: 8.2, y: 6.1 };

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full">
      {/* Grid */}
      {[0, 2, 4, 6, 8].map((v) => (
        <g key={v}>
          <line x1={pad.left} x2={w - pad.right} y1={py(v)} y2={py(v)} stroke="#ffffff0a" strokeWidth={1} />
          <text x={pad.left - 6} y={py(v) + 4} textAnchor="end" fontSize={9} fill="#ffffff50">{v}%</text>
        </g>
      ))}
      {[2, 4, 6, 8, 10, 12].map((v) => (
        <g key={v}>
          <line x1={px(v)} x2={px(v)} y1={pad.top} y2={h - pad.bottom} stroke="#ffffff0a" strokeWidth={1} />
          <text x={px(v)} y={h - pad.bottom + 14} textAnchor="middle" fontSize={9} fill="#ffffff50">{v}%</text>
        </g>
      ))}
      {/* Axis labels */}
      <text x={w / 2} y={h - 4} textAnchor="middle" fontSize={10} fill="#ffffff60">Surplus Volatility</text>
      <text x={14} y={h / 2} textAnchor="middle" fontSize={10} fill="#ffffff60" transform={`rotate(-90,14,${h / 2})`}>Expected Return</text>
      {/* Frontier curve */}
      <path d={pathD} fill="none" stroke="#6366f1" strokeWidth={2} />
      {/* Current allocation */}
      <circle cx={px(currentPt.x)} cy={py(currentPt.y)} r={6} fill="#f59e0b" opacity={0.9} />
      <text x={px(currentPt.x) + 8} y={py(currentPt.y) - 6} fontSize={9} fill="#f59e0b">Current</text>
      {/* Optimal */}
      <circle cx={px(optPt.x)} cy={py(optPt.y)} r={6} fill="#10b981" opacity={0.9} />
      <text x={px(optPt.x) + 8} y={py(optPt.y) - 6} fontSize={9} fill="#10b981">Optimal</text>
    </svg>
  );
}

function RadarChart({ institution }: { institution: InstitutionProfile }) {
  const cx = 110;
  const cy = 110;
  const r = 80;
  const axes = ["Equities", "Bonds", "Alternatives", "Real Assets", "Cash"];
  const values = [
    institution.allocation.equities,
    institution.allocation.bonds,
    institution.allocation.alternatives,
    institution.allocation.realAssets,
    institution.allocation.cash,
  ];
  const n = axes.length;
  const pts = values.map((v, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    const frac = v / 60;
    return {
      x: cx + r * frac * Math.cos(angle),
      y: cy + r * frac * Math.sin(angle),
      lx: cx + (r + 18) * Math.cos(angle),
      ly: cy + (r + 18) * Math.sin(angle),
      label: axes[i],
      value: v,
    };
  });
  const polyPts = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  return (
    <svg width={220} height={220} viewBox="0 0 220 220">
      {[20, 40, 60].map((ring) => {
        const ringPts = axes.map((_, i) => {
          const angle = (2 * Math.PI * i) / n - Math.PI / 2;
          return `${(cx + r * (ring / 60) * Math.cos(angle)).toFixed(1)},${(cy + r * (ring / 60) * Math.sin(angle)).toFixed(1)}`;
        });
        return <polygon key={ring} points={ringPts.join(" ")} fill="none" stroke="#ffffff10" strokeWidth={1} />;
      })}
      {pts.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos((2 * Math.PI * i) / n - Math.PI / 2)} y2={cy + r * Math.sin((2 * Math.PI * i) / n - Math.PI / 2)} stroke="#ffffff15" strokeWidth={1} />
      ))}
      <polygon points={polyPts} fill="#6366f130" stroke="#6366f1" strokeWidth={2} />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3} fill="#6366f1" />
          <text x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle" fontSize={8} fill="#ffffff80">
            {p.label}
          </text>
          <text x={p.lx} y={p.ly + 10} textAnchor="middle" dominantBaseline="middle" fontSize={8} fill="#ffffff50">
            {p.value}%
          </text>
        </g>
      ))}
    </svg>
  );
}

function YaleStackedBar() {
  const w = 440;
  const h = 200;
  const pad = { top: 20, right: 20, bottom: 40, left: 50 };
  const iw = w - pad.left - pad.right;
  const ih = h - pad.top - pad.bottom;
  const barW = (iw / YALE_HISTORY.length) * 0.7;
  const barGap = iw / YALE_HISTORY.length;
  const colors = ["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#94a3b8"];
  const keys: (keyof (typeof YALE_HISTORY)[0])[] = ["equities", "bonds", "alternatives", "realAssets", "cash"];
  const labels = ["Equities", "Bonds", "Alternatives", "Real Assets", "Cash"];

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full">
      {[0, 25, 50, 75, 100].map((v) => {
        const y = pad.top + (1 - v / 100) * ih;
        return (
          <g key={v}>
            <line x1={pad.left} x2={w - pad.right} y1={y} y2={y} stroke="#ffffff0a" strokeWidth={1} />
            <text x={pad.left - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#ffffff50">{v}%</text>
          </g>
        );
      })}
      {YALE_HISTORY.map((yr, xi) => {
        const bx = pad.left + xi * barGap + (barGap - barW) / 2;
        let cumY = 0;
        return (
          <g key={yr.year}>
            {keys.map((k, ki) => {
              const val = yr[k] as number;
              const barH = (val / 100) * ih;
              const ry = pad.top + ih - cumY * ih / 100 - barH;
              cumY += val;
              return <rect key={ki} x={bx} y={ry} width={barW} height={barH} fill={colors[ki]} opacity={0.85} rx={ki === keys.length - 1 ? 2 : 0} />;
            })}
            <text x={bx + barW / 2} y={h - pad.bottom + 14} textAnchor="middle" fontSize={9} fill="#ffffff60">{yr.year}</text>
          </g>
        );
      })}
      {/* Legend */}
      {labels.map((lbl, i) => (
        <g key={i} transform={`translate(${pad.left + i * 84}, ${h - 4})`}>
          <rect x={0} y={0} width={8} height={8} fill={colors[i]} rx={1} />
          <text x={11} y={8} fontSize={8} fill="#ffffff60">{lbl}</text>
        </g>
      ))}
    </svg>
  );
}

function JCurveChart() {
  const w = 440;
  const h = 200;
  const pad = { top: 20, right: 20, bottom: 40, left: 60 };
  const iw = w - pad.left - pad.right;
  const ih = h - pad.top - pad.bottom;
  const years = 12;

  // J-curve: negative early, positive later
  const jValues = [-0.05, -0.12, -0.18, -0.15, -0.05, 0.08, 0.22, 0.40, 0.62, 0.85, 1.10, 1.35, 1.60];
  const minV = -0.2;
  const maxV = 1.7;
  const range = maxV - minV;

  const px = (i: number) => pad.left + (i / years) * iw;
  const py = (v: number) => pad.top + (1 - (v - minV) / range) * ih;
  const zeroY = py(0);

  const pathD = jValues.map((v, i) => `${i === 0 ? "M" : "L"}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
  const areaAbove = `M${px(0)},${zeroY} ` + jValues.map((v, i) => `L${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ") + ` L${px(years)},${zeroY} Z`;
  const areaBelowD = `M${px(0)},${zeroY} ` + jValues.map((v, i) => `L${px(i).toFixed(1)},${py(Math.min(v, 0)).toFixed(1)}`).join(" ") + ` L${px(years)},${zeroY} Z`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full">
      {[-0.2, 0, 0.5, 1.0, 1.5].map((v) => (
        <g key={v}>
          <line x1={pad.left} x2={w - pad.right} y1={py(v)} y2={py(v)} stroke={v === 0 ? "#ffffff30" : "#ffffff0a"} strokeWidth={v === 0 ? 1.5 : 1} />
          <text x={pad.left - 6} y={py(v) + 4} textAnchor="end" fontSize={9} fill="#ffffff50">{(v * 100).toFixed(0)}%</text>
        </g>
      ))}
      {Array.from({ length: years + 1 }, (_, i) => (
        <g key={i}>
          <line x1={px(i)} x2={px(i)} y1={pad.top} y2={h - pad.bottom} stroke="#ffffff06" strokeWidth={1} />
          <text x={px(i)} y={h - pad.bottom + 14} textAnchor="middle" fontSize={9} fill="#ffffff50">Y{i}</text>
        </g>
      ))}
      <path d={areaBelowD} fill="#ef444418" />
      <path d={areaAbove} fill="#10b98118" />
      <path d={pathD} fill="none" stroke="#6366f1" strokeWidth={2.5} />
      {jValues.map((v, i) => (
        <circle key={i} cx={px(i)} cy={py(v)} r={3} fill={v < 0 ? "#ef4444" : "#10b981"} />
      ))}
      <text x={pad.left + 30} y={zeroY - 10} fontSize={9} fill="#ef4444">Capital calls / fees</text>
      <text x={pad.left + iw * 0.55} y={zeroY - 18} fontSize={9} fill="#10b981">Returns / distributions</text>
    </svg>
  );
}

function PerformanceBarChart({ managers }: { managers: ManagerScore[] }) {
  const w = 440;
  const h = 200;
  const pad = { top: 20, right: 20, bottom: 50, left: 50 };
  const iw = w - pad.left - pad.right;
  const ih = h - pad.top - pad.bottom;
  const barW = (iw / managers.length) * 0.35;
  const barGap = iw / managers.length;
  const maxV = 22;

  const px = (i: number, offset = 0) => pad.left + i * barGap + (barGap - barW * 2 - 2) / 2 + offset;
  const ph = (v: number) => (v / maxV) * ih;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full">
      {[0, 5, 10, 15, 20].map((v) => {
        const y = pad.top + (1 - v / maxV) * ih;
        return (
          <g key={v}>
            <line x1={pad.left} x2={w - pad.right} y1={y} y2={y} stroke="#ffffff0a" strokeWidth={1} />
            <text x={pad.left - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#ffffff50">{v}%</text>
          </g>
        );
      })}
      {managers.map((m, i) => {
        const retH = ph(m.annualReturn);
        const bmH = ph(m.benchmark);
        const ry = pad.top + ih - retH;
        const by = pad.top + ih - bmH;
        const bx = px(i);
        const nameWords = m.name.split(" ");
        return (
          <g key={i}>
            <rect x={bx} y={ry} width={barW} height={retH} fill="#6366f1" rx={2} opacity={0.85} />
            <rect x={bx + barW + 2} y={by} width={barW} height={bmH} fill="#ffffff20" rx={2} />
            <text x={bx + barW} y={h - pad.bottom + 14} textAnchor="middle" fontSize={8} fill="#ffffff60">{nameWords[0]}</text>
            <text x={bx + barW} y={h - pad.bottom + 24} textAnchor="middle" fontSize={7} fill="#ffffff40">{nameWords[1] ?? ""}</text>
          </g>
        );
      })}
      {/* Legend */}
      <rect x={pad.left} y={pad.top - 14} width={8} height={8} fill="#6366f1" rx={1} />
      <text x={pad.left + 12} y={pad.top - 7} fontSize={9} fill="#ffffff70">Manager Return</text>
      <rect x={pad.left + 100} y={pad.top - 14} width={8} height={8} fill="#ffffff20" rx={1} />
      <text x={pad.left + 114} y={pad.top - 7} fontSize={9} fill="#ffffff70">Benchmark</text>
    </svg>
  );
}

// ── Tab 1: Overview ────────────────────────────────────────────────────────────

function OverviewTab() {
  const assetAlloc = [
    { label: "Public Equities", value: 30, color: "#6366f1" },
    { label: "Fixed Income", value: 28, color: "#3b82f6" },
    { label: "Private Equity", value: 12, color: "#8b5cf6" },
    { label: "Real Estate", value: 10, color: "#10b981" },
    { label: "Infrastructure", value: 8, color: "#f59e0b" },
    { label: "Hedge Funds", value: 7, color: "#ef4444" },
    { label: "Cash", value: 5, color: "#64748b" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* DB vs DC comparison */}
      <SectionCard title="DB vs DC Pension Plans" subtitle="Defined Benefit vs Defined Contribution" className="lg:col-span-2">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left py-2 pr-4 text-white/60 font-medium">Feature</th>
                <th className="text-left py-2 pr-4 text-blue-400 font-semibold">Defined Benefit (DB)</th>
                <th className="text-left py-2 text-purple-400 font-semibold">Defined Contribution (DC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                ["Benefit promise", "Guaranteed monthly income based on formula", "No guaranteed benefit — depends on contributions + returns"],
                ["Investment risk bearer", "Employer / Fund sponsor", "Employee / Participant"],
                ["Contribution", "Employer contributes to fund; employee sometimes matches", "Employee contributes; employer may match"],
                ["Formula", "Final salary × years × accrual rate", "Account balance at retirement"],
                ["Portability", "Low — vesting schedule required", "High — account moves with employee"],
                ["Longevity risk", "Fund absorbs longevity risk", "Retiree bears longevity risk"],
                ["Examples", "Government pensions, CalPERS, PBGC plans", "401(k), 403(b), IRA, superannuation"],
                ["Prevalence (US)", "~35% of workers in private sector (declining)", "~65% of workers in private sector (growing)"],
              ].map(([feat, db, dc], i) => (
                <tr key={i} className="hover:bg-white/3 transition-colors">
                  <td className="py-2 pr-4 text-white/70 font-medium w-40">{feat}</td>
                  <td className="py-2 pr-4 text-white/60">{db}</td>
                  <td className="py-2 text-white/60">{dc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Asset allocation pie */}
      <SectionCard title="$500B Example Fund — Asset Allocation">
        <div className="flex gap-6 items-center">
          <AllocationPie data={assetAlloc} radius={80} />
          <div className="space-y-1.5 flex-1">
            {assetAlloc.map((a, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: a.color }} />
                  <span className="text-xs text-white/70">{a.label}</span>
                </div>
                <span className="text-xs font-semibold text-white">{a.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Funded ratio gauge */}
      <SectionCard title="Funded Status Gauge">
        <div className="flex flex-col items-center gap-4">
          <FundedGauge ratio={82.4} />
          <div className="grid grid-cols-3 gap-3 w-full">
            <MetricChip label="PV Assets" value="$412B" color="green" />
            <MetricChip label="PV Liabilities" value="$500B" color="blue" />
            <MetricChip label="Unfunded Gap" value="$88B" color="red" />
          </div>
          <div className="w-full grid grid-cols-3 gap-2 text-xs text-white/60">
            <div className="bg-red-500/10 rounded p-2 text-center border border-red-500/20">
              <span className="text-red-400 font-semibold block">&lt; 70%</span>
              <span>Critically underfunded</span>
            </div>
            <div className="bg-amber-500/10 rounded p-2 text-center border border-amber-500/20">
              <span className="text-amber-400 font-semibold block">70–90%</span>
              <span>Underfunded — action needed</span>
            </div>
            <div className="bg-emerald-500/10 rounded p-2 text-center border border-emerald-500/20">
              <span className="text-emerald-400 font-semibold block">&gt; 90%</span>
              <span>Well-funded</span>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Actuarial assumptions */}
      <SectionCard title="Actuarial Assumptions">
        <div className="space-y-3">
          {[
            { label: "Discount Rate", value: "7.25%", note: "Expected return on assets; higher rate = lower liability", color: "blue" as const },
            { label: "Salary Growth", value: "3.50%", note: "Projected annual wage increases for active employees", color: "purple" as const },
            { label: "Mortality Table", value: "RP-2014", note: "SOA mortality projection; longevity risk embedded", color: "green" as const },
            { label: "Inflation Assumption", value: "2.50%", note: "CPI growth embedded in benefit COLAs", color: "amber" as const },
            { label: "Liability Duration", value: "15.2 yr", note: "Weighted avg time to pay benefits; drives rate sensitivity", color: "red" as const },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/3 border border-white/5">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-semibold text-white">{item.label}</span>
                  <Badge variant="outline" className={cn("text-xs", {
                    "border-blue-500/30 text-blue-400": item.color === "blue",
                    "border-purple-500/30 text-purple-400": item.color === "purple",
                    "border-emerald-500/30 text-emerald-400": item.color === "green",
                    "border-amber-500/30 text-amber-400": item.color === "amber",
                    "border-red-500/30 text-red-400": item.color === "red",
                  })}>{item.value}</Badge>
                </div>
                <p className="text-xs text-white/50">{item.note}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* State pension unfunded liabilities */}
      <SectionCard title="Top 5 State Pension Unfunded Liabilities" subtitle="As % of state GDP">
        <div className="space-y-3">
          {STATE_PENSIONS.map((sp, i) => {
            const barW = (sp.fundedRatio / 100) * 100;
            const trendColor = sp.trend === "improving" ? "text-emerald-400" : sp.trend === "deteriorating" ? "text-red-400" : "text-amber-400";
            const trendLabel = sp.trend === "improving" ? "↑ Improving" : sp.trend === "deteriorating" ? "↓ Deteriorating" : "→ Stable";
            return (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/80 font-medium">{sp.state}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-white/50">${sp.unfundedLiability}B unfunded</span>
                    <span className="text-white/50">{sp.pctGDP}% of GDP</span>
                    <span className={trendColor}>{trendLabel}</span>
                  </div>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2">
                  <div
                    className={cn("h-2 rounded-full transition-all", sp.fundedRatio < 50 ? "bg-red-500" : sp.fundedRatio < 70 ? "bg-amber-500" : "bg-emerald-500")}
                    style={{ width: `${barW}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-white/40">
                  <span>{sp.fundedRatio}% funded</span>
                  <span>{(100 - sp.fundedRatio).toFixed(1)}% gap</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs text-amber-400/90">
            <AlertTriangle className="inline w-3 h-3 mr-1" />
            Total US public pension underfunding estimated at $4.7 trillion. A 1% drop in discount rate adds ~$500B to liabilities.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}

// ── Tab 2: ALM ─────────────────────────────────────────────────────────────────

function ALMTab() {
  const [hedgeRatio, setHedgeRatio] = useState(65);
  const [discountShift, setDiscountShift] = useState(0);

  const assetDuration = 8.5 + discountShift * 0.2;
  const liabilityDuration = 15.2 + discountShift * (-0.3);
  const durationGap = liabilityDuration - assetDuration;

  const assetImpact = -(assetDuration * 0.01 * 500).toFixed(1);
  const liabilityImpact = -(liabilityDuration * 0.01 * 500).toFixed(1);
  const surplusImpact = (parseFloat(assetImpact) - parseFloat(liabilityImpact)).toFixed(1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* LDI Explainer */}
      <SectionCard title="Liability-Driven Investing (LDI)" subtitle="Match asset duration to liability duration" className="lg:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <h4 className="text-xs font-semibold text-blue-400 mb-2">Liability Benchmark</h4>
            <p className="text-xs text-white/60">
              PV of all future pension cash flows discounted at the plan&apos;s assumed discount rate. Changes as interest rates move.
            </p>
            <div className="mt-3 text-sm font-semibold text-white">PV = Σ CFt / (1+r)^t</div>
          </div>
          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <h4 className="text-xs font-semibold text-purple-400 mb-2">Hedging Portfolio</h4>
            <p className="text-xs text-white/60">
              Long-duration bonds (Treasuries + IG corporates) designed to move in-line with liabilities. Duration-matched.
            </p>
            <div className="mt-3 text-sm font-semibold text-white">Target: 15+ year duration</div>
          </div>
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <h4 className="text-xs font-semibold text-emerald-400 mb-2">Growth Portfolio</h4>
            <p className="text-xs text-white/60">
              Return-seeking assets (equities, PE, real estate) to close funding gaps and generate excess returns.
            </p>
            <div className="mt-3 text-sm font-semibold text-white">Target: 7-8% annual return</div>
          </div>
        </div>
      </SectionCard>

      {/* Duration mismatch */}
      <SectionCard title="Duration Mismatch Analysis">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <MetricChip label="Asset Duration" value={`${assetDuration.toFixed(1)} yr`} color="blue" />
            <MetricChip label="Liability Duration" value={`${liabilityDuration.toFixed(1)} yr`} color="purple" />
            <MetricChip label="Duration Gap" value={`${durationGap.toFixed(1)} yr`} color={durationGap > 3 ? "red" : "green"} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/60">
              <span>Asset Portfolio Duration</span>
              <span>{assetDuration.toFixed(1)} years</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2">
              <div className="h-2 rounded-full bg-blue-500" style={{ width: `${(assetDuration / 20) * 100}%` }} />
            </div>
            <div className="flex justify-between text-xs text-white/60">
              <span>Liability Duration</span>
              <span>{liabilityDuration.toFixed(1)} years</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2">
              <div className="h-2 rounded-full bg-purple-500" style={{ width: `${(liabilityDuration / 20) * 100}%` }} />
            </div>
          </div>
          <p className="text-xs text-white/50">
            A {durationGap.toFixed(1)}-year gap means a 1% rate rise reduces liability by ~${Math.abs(liabilityDuration * 5).toFixed(0)}B more than assets — causing surplus improvement.
          </p>
        </div>
      </SectionCard>

      {/* Hedge ratio */}
      <SectionCard title="Hedge Ratio Configuration">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-white/60">Hedge Ratio</span>
              <span className="text-white font-semibold">{hedgeRatio}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={hedgeRatio}
              onChange={(e) => setHedgeRatio(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-white/40">
              <span>0% (Growth only)</span>
              <span>100% (Full hedge)</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-white/3 border border-white/5">
              <div className="text-xs text-white/60">Liability hedged</div>
              <div className="text-lg font-bold text-white">${(hedgeRatio * 5).toFixed(0)}B</div>
              <div className="text-xs text-white/40">of $500B total</div>
            </div>
            <div className="p-3 rounded-lg bg-white/3 border border-white/5">
              <div className="text-xs text-white/60">Growth portfolio</div>
              <div className="text-lg font-bold text-white">${((100 - hedgeRatio) * 5).toFixed(0)}B</div>
              <div className="text-xs text-white/40">return-seeking</div>
            </div>
          </div>
          <div className={cn("p-3 rounded-lg text-xs border", hedgeRatio < 40
            ? "bg-red-500/10 border-red-500/20 text-red-400"
            : hedgeRatio > 80
              ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400")}>
            {hedgeRatio < 40
              ? "Low hedge ratio: significant interest rate risk. Surplus highly volatile."
              : hedgeRatio > 80
                ? "High hedge ratio: low return potential. May struggle to close funding gap."
                : "Balanced LDI: moderate rate protection with sufficient return-seeking exposure."}
          </div>
        </div>
      </SectionCard>

      {/* Interest rate sensitivity */}
      <SectionCard title="Interest Rate Sensitivity (1% Parallel Shift)">
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-white/50 mb-1">
            <span>+100 bps shift in discount rate</span>
          </div>
          {[
            { label: "Impact on Assets", value: assetImpact, pct: ((parseFloat(assetImpact) / 500) * 100).toFixed(1) },
            { label: "Impact on Liabilities", value: liabilityImpact, pct: ((parseFloat(liabilityImpact) / 500) * 100).toFixed(1) },
            { label: "Net Surplus Impact", value: surplusImpact, pct: ((parseFloat(surplusImpact) / 500) * 100).toFixed(1) },
          ].map((item, i) => {
            const isPositive = parseFloat(item.value) > 0;
            return (
              <div key={i} className={cn("p-3 rounded-lg border", isPositive
                ? "bg-emerald-500/10 border-emerald-500/20"
                : "bg-red-500/10 border-red-500/20")}>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/70">{item.label}</span>
                  <div className="text-right">
                    <span className={cn("text-sm font-bold", isPositive ? "text-emerald-400" : "text-red-400")}>
                      {isPositive ? "+" : ""}{item.value}B
                    </span>
                    <span className={cn("text-xs ml-2", isPositive ? "text-emerald-400/70" : "text-red-400/70")}>
                      ({isPositive ? "+" : ""}{item.pct}%)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          <p className="text-xs text-white/50 mt-2">
            Rising rates hurt asset values but reduce liability PV more (due to duration gap). Net effect: surplus improvement.
          </p>
        </div>
      </SectionCard>

      {/* Efficient frontier */}
      <SectionCard title="Surplus Optimization — Efficient Frontier" className="lg:col-span-2">
        <SurplusEfficientFrontier />
        <p className="text-xs text-white/50 mt-2">
          Each point represents a different asset-liability mix. Moving right increases expected return but also surplus volatility. The optimal point maximizes return per unit of surplus risk.
        </p>
      </SectionCard>
    </div>
  );
}

// ── Tab 3: Institutional Allocation ──────────────────────────────────────────

function InstitutionalTab() {
  const [selectedInst, setSelectedInst] = useState(0);
  const inst = INSTITUTIONS[selectedInst];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Comparison table */}
      <SectionCard title="Institutional Investor Profiles" className="lg:col-span-2">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/8">
                {["Institution", "Return Target", "Risk Tolerance", "Liquidity Needs", "Investment Horizon", "Tax Status"].map((h) => (
                  <th key={h} className="text-left py-2 pr-4 text-white/50 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {INSTITUTIONS.map((inst, i) => (
                <tr
                  key={i}
                  className={cn("hover:bg-white/3 cursor-pointer transition-colors", selectedInst === i && "bg-blue-500/5")}
                  onClick={() => setSelectedInst(i)}
                >
                  <td className="py-2 pr-4 font-semibold text-white">{inst.name}</td>
                  <td className="py-2 pr-4 text-blue-400">{inst.returnTarget}</td>
                  <td className={cn("py-2 pr-4", inst.riskTolerance === "High" ? "text-amber-400" : inst.riskTolerance === "Low" ? "text-emerald-400" : "text-white/60")}>{inst.riskTolerance}</td>
                  <td className={cn("py-2 pr-4", inst.liquidity === "Very Low" || inst.liquidity === "Low" ? "text-red-400" : "text-white/60")}>{inst.liquidity}</td>
                  <td className="py-2 pr-4 text-white/60">{inst.horizon}</td>
                  <td className="py-2 text-white/60">{inst.taxStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-white/40 mt-2">Click a row to view allocation radar chart</p>
      </SectionCard>

      {/* Radar chart */}
      <SectionCard title={`${inst.name} — Allocation Radar`}>
        <div className="flex justify-center">
          <RadarChart institution={inst} />
        </div>
        <div className="grid grid-cols-5 gap-2 mt-2">
          {(["equities", "bonds", "alternatives", "realAssets", "cash"] as const).map((k) => {
            const labels = { equities: "Equities", bonds: "Bonds", alternatives: "Alts", realAssets: "Real", cash: "Cash" };
            return (
              <div key={k} className="text-center p-2 rounded-lg bg-white/3 border border-white/5">
                <div className="text-xs font-bold text-white">{inst.allocation[k]}%</div>
                <div className="text-xs text-white/50">{labels[k]}</div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Yale endowment */}
      <SectionCard title="Yale Endowment Model — 2000–2024 Evolution">
        <YaleStackedBar />
        <div className="mt-3 space-y-2">
          <p className="text-xs text-white/60">
            David Swensen&apos;s pioneering model shifted Yale away from stocks/bonds toward illiquid alternatives. Results: 9.9% annualized over 20 years, vs 6.5% for 60/40.
          </p>
          <div className="grid grid-cols-3 gap-2">
            <MetricChip label="2024 Endowment" value="$40.7B" color="green" />
            <MetricChip label="20yr Ann. Return" value="9.9%" color="blue" />
            <MetricChip label="Alternatives" value="44%" sub="of portfolio" color="purple" />
          </div>
        </div>
      </SectionCard>

      {/* Norway GPFG */}
      <SectionCard title="Norway Government Pension Fund (GPFG)" subtitle="$1.6 trillion — world's largest sovereign wealth fund" className="lg:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white/80">Structure</h4>
            {[
              { label: "AUM", value: "$1.6 trillion" },
              { label: "Fund type", value: "Sovereign Wealth" },
              { label: "Manager", value: "Norges Bank (NBIM)" },
              { label: "Owner", value: "Norwegian Ministry of Finance" },
              { label: "Beneficiary", value: "Future Norwegian generations" },
            ].map((item, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-white/50">{item.label}</span>
                <span className="text-white/80 font-medium">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white/80">Allocation Strategy</h4>
            {[
              { label: "Equities", value: "70%", color: "#6366f1" },
              { label: "Fixed Income", value: "27%", color: "#3b82f6" },
              { label: "Real Estate", value: "3%", color: "#10b981" },
            ].map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">{item.label}</span>
                  <span className="text-white font-semibold">{item.value}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full" style={{ width: item.value, background: item.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white/80">Key Facts</h4>
            {[
              "Owns ~1.5% of all listed global equities",
              "Invests in 70+ countries, 9,000+ companies",
              "Strict ethical guidelines — excludes weapons, tobacco, severe environmental harm",
              "Fiscal rule: spend only the expected 3% real annual return",
              "Transparent: publishes all holdings, votes, and exclusions",
            ].map((fact, i) => (
              <div key={i} className="flex gap-2 text-xs text-white/60">
                <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{fact}</span>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ── Tab 4: Alternatives ────────────────────────────────────────────────────────

function AlternativesTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Allocation overview */}
      <SectionCard title="Alternatives Portfolio Allocation" subtitle="$150B alternatives sleeve of $500B pension">
        <div className="space-y-3">
          {ALT_ALLOCATIONS.map((alt, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: alt.color }} />
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/80 font-medium">{alt.category}</span>
                  <div className="flex gap-3 text-white/50">
                    <span>{alt.pct}%</span>
                    <span className="text-emerald-400">{alt.annualReturn}% ret</span>
                    <span className="text-amber-400">{alt.illiquidity}</span>
                  </div>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full" style={{ width: `${alt.pct * 4}%`, background: alt.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <MetricChip label="Total AUM" value="$150B" color="blue" />
          <MetricChip label="Avg Return" value="10.7%" color="green" />
          <MetricChip label="Avg Illiquidity" value="6.2 yr" color="amber" />
        </div>
      </SectionCard>

      {/* J-Curve */}
      <SectionCard title="J-Curve Effect — Private Equity Cash Flows">
        <JCurveChart />
        <p className="text-xs text-white/50 mt-2">
          Early years show negative IRR due to management fees and capital deployment before value creation. Years 5-7 typically see breakeven; distributions dominate years 7-12.
        </p>
      </SectionCard>

      {/* Vintage year diversification */}
      <SectionCard title="Vintage Year Diversification">
        <div className="space-y-3">
          <p className="text-xs text-white/60">
            Spreading commitments across multiple vintage years reduces exposure to any single market environment at entry.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left py-1.5 pr-3 text-white/50">Vintage</th>
                  <th className="text-left py-1.5 pr-3 text-white/50">Market Env.</th>
                  <th className="text-left py-1.5 pr-3 text-white/50">Avg IRR</th>
                  <th className="text-left py-1.5 text-white/50">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { vintage: 2015, env: "Post-QE recovery", irr: "18.2%", status: "Harvesting" },
                  { vintage: 2017, env: "Late cycle growth", irr: "14.8%", status: "Harvesting" },
                  { vintage: 2019, env: "Pre-COVID peak", irr: "11.2%", status: "Mature" },
                  { vintage: 2021, env: "ZIRP / stimulus", irr: "8.1%", status: "Mid-life" },
                  { vintage: 2023, env: "Rate normalization", irr: "5.4%*", status: "Early" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-white/3">
                    <td className="py-1.5 pr-3 text-white font-semibold">{row.vintage}</td>
                    <td className="py-1.5 pr-3 text-white/60">{row.env}</td>
                    <td className="py-1.5 pr-3 text-emerald-400">{row.irr}</td>
                    <td className="py-1.5">
                      <Badge variant="outline" className={cn("text-xs", {
                        "border-emerald-500/30 text-emerald-400": row.status === "Harvesting",
                        "border-blue-500/30 text-blue-400": row.status === "Mature",
                        "border-amber-500/30 text-amber-400": row.status === "Mid-life",
                        "border-white/20 text-white/50": row.status === "Early",
                      })}>{row.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-white/40">* Early-stage estimate; J-curve still in effect</p>
        </div>
      </SectionCard>

      {/* Commitment pacing */}
      <SectionCard title="Commitment Pacing to Steady State">
        <div className="space-y-3">
          <p className="text-xs text-white/60">
            To maintain a 20% PE allocation in a growing fund, annual commitments must account for capital calls, distributions, and asset growth.
          </p>
          <div className="space-y-2">
            {[
              { year: "Year 1", commit: "$3.0B", nav: "$1.2B", pctFund: "4.0%", note: "Building exposure" },
              { year: "Year 3", commit: "$4.5B", nav: "$8.6B", pctFund: "11.5%", note: "Scaling up" },
              { year: "Year 5", commit: "$5.2B", nav: "$17.4B", pctFund: "17.2%", note: "Approaching target" },
              { year: "Year 7", commit: "$5.8B", nav: "$22.1B", pctFund: "20.1%", note: "Steady state" },
              { year: "Year 10", commit: "$6.5B", nav: "$26.8B", pctFund: "20.3%", note: "Maintaining" },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/3 border border-white/5 text-xs">
                <span className="text-white/50 w-12">{row.year}</span>
                <span className="text-blue-400 w-14">{row.commit}</span>
                <span className="text-white/70 w-14">NAV: {row.nav}</span>
                <span className={cn("w-12 font-semibold", parseFloat(row.pctFund) >= 20 ? "text-emerald-400" : "text-amber-400")}>{row.pctFund}</span>
                <span className="text-white/40">{row.note}</span>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Liquidity waterfall */}
      <SectionCard title="Liquidity Waterfall — Emergency Liquidation Order" className="lg:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          {[
            { tier: "1", label: "Cash & T-Bills", timeline: "Immediate", color: "#10b981", size: "$25B" },
            { tier: "2", label: "Liquid Bonds", timeline: "1–5 days", color: "#3b82f6", size: "$80B" },
            { tier: "3", label: "Public Equities", timeline: "1–3 weeks", color: "#6366f1", size: "$150B" },
            { tier: "4", label: "Hedge Funds", timeline: "30–90 days", color: "#f59e0b", size: "$35B" },
            { tier: "5", label: "Real Estate", timeline: "3–12 months", color: "#ef4444", size: "$50B" },
            { tier: "6", label: "PE / VC", timeline: "2–7 years", color: "#64748b", size: "$160B" },
          ].map((tier, i) => (
            <div key={i} className="p-3 rounded-lg border border-white/8 text-center" style={{ background: `${tier.color}15` }}>
              <div className="text-lg font-bold mb-0.5" style={{ color: tier.color }}>Tier {tier.tier}</div>
              <div className="text-xs font-semibold text-white mb-1">{tier.label}</div>
              <div className="text-xs text-white/50 mb-1">{tier.timeline}</div>
              <div className="text-xs font-bold text-white/80">{tier.size}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-white/50 mt-3">
          Pensions must maintain sufficient liquid assets to meet benefit payments. Rule of thumb: 3–5 years of expected benefit payments in Tier 1–3 assets.
        </p>
      </SectionCard>
    </div>
  );
}

// ── Tab 5: Manager Selection ──────────────────────────────────────────────────

function ManagerSelectionTab() {
  const [selectedMgr, setSelectedMgr] = useState(0);
  const mgr = MANAGERS[selectedMgr];

  const scoreBarColor = (score: number) =>
    score >= 85 ? "#10b981" : score >= 70 ? "#3b82f6" : score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Due diligence */}
      <SectionCard title="Due Diligence Framework" subtitle="4-pillar evaluation process" className="lg:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              pillar: "Investment",
              color: "blue" as const,
              items: ["Investment philosophy & process", "Research methodology", "Portfolio construction", "Risk management system", "Return attribution history"],
            },
            {
              pillar: "Operational",
              color: "purple" as const,
              items: ["Business continuity plan", "Technology infrastructure", "Back-office & custody", "Valuation procedures", "Disaster recovery"],
            },
            {
              pillar: "Legal / Compliance",
              color: "amber" as const,
              items: ["Regulatory history & filings", "SEC/CFTC registrations", "Side letters & terms", "Key-man provisions", "Redemption rights"],
            },
            {
              pillar: "ESG",
              color: "green" as const,
              items: ["ESG integration in process", "Proxy voting record", "Diversity & inclusion metrics", "Carbon footprint reporting", "UNPRI signatory status"],
            },
          ].map((p) => {
            const colorMap = {
              blue: "border-blue-500/20 bg-blue-500/10 text-blue-400",
              purple: "border-purple-500/20 bg-purple-500/10 text-purple-400",
              amber: "border-amber-500/20 bg-amber-500/10 text-amber-400",
              green: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
            };
            return (
              <div key={p.pillar} className={cn("p-4 rounded-lg border", colorMap[p.color])}>
                <h4 className="text-xs font-semibold mb-2">{p.pillar} Due Diligence</h4>
                <ul className="space-y-1">
                  {p.items.map((item, j) => (
                    <li key={j} className="text-xs text-white/60 flex gap-1.5">
                      <span className="opacity-50">•</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Manager scorecard */}
      <SectionCard title="Manager Evaluation Scorecard">
        <div className="flex gap-2 flex-wrap mb-4">
          {MANAGERS.map((m, i) => (
            <button
              key={i}
              onClick={() => setSelectedMgr(i)}
              className={cn("px-2.5 py-1 rounded-full text-xs border transition-colors", selectedMgr === i
                ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                : "border-white/10 text-white/50 hover:border-white/20")}
            >
              {m.name.split(" ")[0]}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-sm font-semibold text-white">{mgr.name}</div>
              <div className="text-xs text-white/50">{mgr.strategy}</div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className={cn("text-xs", mgr.quartile === 1 ? "border-emerald-500/40 text-emerald-400" : mgr.quartile === 2 ? "border-blue-500/40 text-blue-400" : "border-amber-500/40 text-amber-400")}>
                Q{mgr.quartile} Quartile
              </Badge>
            </div>
          </div>
          {[
            { label: "Investment Process", score: mgr.process },
            { label: "Team Quality", score: mgr.team },
            { label: "Track Record", score: mgr.trackRecord },
            { label: "Risk Management", score: mgr.riskMgmt },
            { label: "Fees (value)", score: mgr.fees },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/60">{item.label}</span>
                <span className="text-white font-semibold">{item.score}/100</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5">
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${item.score}%`, background: scoreBarColor(item.score) }} />
              </div>
            </div>
          ))}
          <div className="mt-3 p-3 rounded-lg bg-white/3 border border-white/8 flex justify-between items-center">
            <span className="text-xs text-white/60">Overall Score</span>
            <span className="text-xl font-bold text-white">{mgr.overall}<span className="text-sm text-white/40">/100</span></span>
          </div>
        </div>
      </SectionCard>

      {/* Performance comparison */}
      <SectionCard title="Manager Performance vs Benchmark">
        <PerformanceBarChart managers={MANAGERS} />
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left py-1.5 pr-3 text-white/50">Manager</th>
                <th className="text-left py-1.5 pr-3 text-white/50">Return</th>
                <th className="text-left py-1.5 pr-3 text-white/50">Benchmark</th>
                <th className="text-left py-1.5 text-white/50">Alpha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MANAGERS.map((m, i) => {
                const alpha = m.annualReturn - m.benchmark;
                return (
                  <tr key={i} className="hover:bg-white/3">
                    <td className="py-1.5 pr-3 text-white/80">{m.name.split(" ")[0]}</td>
                    <td className="py-1.5 pr-3 text-blue-400">{m.annualReturn}%</td>
                    <td className="py-1.5 pr-3 text-white/50">{m.benchmark}%</td>
                    <td className={cn("py-1.5 font-semibold", alpha > 0 ? "text-emerald-400" : "text-red-400")}>
                      {alpha > 0 ? "+" : ""}{alpha.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Style analysis */}
      <SectionCard title="Returns-Based Style Analysis" subtitle="Equity / Bond / Cash factor loadings (Sharpe style)">
        <div className="space-y-3">
          {MANAGERS.map((m, i) => {
            resetSeed(67 + i * 13);
            const eqLoad = 40 + Math.round(rand() * 50);
            const bondLoad = 5 + Math.round(rand() * 35);
            const cashLoad = Math.max(0, 100 - eqLoad - bondLoad);
            const alpha = (rand() * 4 - 1).toFixed(1);
            const r2 = (0.7 + rand() * 0.28).toFixed(2);
            return (
              <div key={i} className="p-3 rounded-lg bg-white/3 border border-white/5">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="text-white/80 font-medium">{m.name}</span>
                  <div className="flex gap-3 text-white/50">
                    <span>α={alpha}%</span>
                    <span>R²={r2}</span>
                  </div>
                </div>
                <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                  <div className="bg-blue-500 transition-all" style={{ width: `${eqLoad}%` }} title={`Equity ${eqLoad}%`} />
                  <div className="bg-emerald-500 transition-all" style={{ width: `${bondLoad}%` }} title={`Bond ${bondLoad}%`} />
                  <div className="bg-white/20 transition-all" style={{ width: `${cashLoad}%` }} title={`Cash ${cashLoad}%`} />
                </div>
                <div className="flex justify-between text-xs text-white/40 mt-1">
                  <span>Equity {eqLoad}%</span>
                  <span>Bond {bondLoad}%</span>
                  <span>Cash {cashLoad}%</span>
                </div>
              </div>
            );
          })}
          <div className="flex gap-3 text-xs text-white/50 mt-1">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />Equity loading</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />Bond loading</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-white/20" />Cash loading</div>
          </div>
        </div>
      </SectionCard>

      {/* Capacity constraints */}
      <SectionCard title="Capacity Constraints & Peer Universe">
        <div className="space-y-3">
          {[
            { strategy: "Large Cap Blend", aum: "$50B+", capacity: "Unconstrained", alpha: "Low" },
            { strategy: "Small Cap Value", aum: "$2–5B", capacity: "Limited", alpha: "Medium" },
            { strategy: "Micro Cap", aum: "$200M–1B", capacity: "Highly constrained", alpha: "High" },
            { strategy: "EM Frontier", aum: "$500M–2B", capacity: "Constrained", alpha: "High" },
            { strategy: "Global Macro HF", aum: "$10B+", capacity: "Moderate", alpha: "Variable" },
          ].map((row, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white/3 border border-white/5 text-xs">
              <span className="text-white/80 font-medium w-36">{row.strategy}</span>
              <span className="text-white/50 w-24">Max AUM: {row.aum}</span>
              <Badge variant="outline" className={cn("text-xs", {
                "border-emerald-500/30 text-emerald-400": row.capacity === "Unconstrained",
                "border-blue-500/30 text-blue-400": row.capacity === "Moderate",
                "border-amber-500/30 text-amber-400": row.capacity === "Limited" || row.capacity === "Variable",
                "border-red-500/30 text-red-400": row.capacity.includes("Highly") || row.capacity === "Constrained",
              })}>{row.capacity}</Badge>
              <span className={cn("text-xs font-medium w-12 text-right", {
                "text-white/40": row.alpha === "Low",
                "text-amber-400": row.alpha === "Medium",
                "text-emerald-400": row.alpha === "High",
                "text-blue-400": row.alpha === "Variable",
              })}>α: {row.alpha}</span>
            </div>
          ))}
          <p className="text-xs text-white/50">
            Small/niche strategies have higher alpha potential but cannot absorb large institutional mandates without significant market impact.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}

// ── Tab 6: Governance ──────────────────────────────────────────────────────────

function GovernanceTab() {
  const [expandedSection, setExpandedSection] = useState<string | null>("ips");

  const sections = [
    {
      id: "ips",
      title: "Investment Policy Statement (IPS)",
      icon: <FileText className="w-4 h-4" />,
      color: "blue" as const,
      content: [
        { heading: "Purpose & Scope", text: "Defines investment objectives, risk tolerance, and constraints for the fund. Serves as the governing document for all investment decisions." },
        { heading: "Return Objective", text: "Target actuarial return (e.g., 7.25%) to meet benefit obligations. Specifies real return vs nominal and peer comparison benchmarks." },
        { heading: "Risk Parameters", text: "Maximum tracking error vs policy benchmark, VaR limits, drawdown thresholds, concentration limits by asset class, sector, and issuer." },
        { heading: "Asset Allocation", text: "Strategic asset allocation (SAA) with target weights and rebalancing ranges (e.g., Equities 45–55%, Bonds 25–35%). Permitted asset classes listed." },
        { heading: "Liquidity Requirements", text: "Minimum liquid asset thresholds based on benefit payment projections. Typically 3 years of benefit payments in Tier 1–2 assets." },
        { heading: "Prohibited Investments", text: "Excluded securities (e.g., tobacco, weapons, companies in violation of UN Global Compact), leverage limits, derivatives use policy." },
      ],
    },
    {
      id: "governance",
      title: "Board Governance & Fiduciary Duty",
      icon: <Scale className="w-4 h-4" />,
      color: "purple" as const,
      content: [
        { heading: "Trustee Responsibilities", text: "Board of trustees holds ultimate fiduciary responsibility. Must act in the sole interest of beneficiaries — the 'exclusive benefit rule'." },
        { heading: "Prudent Expert Standard", text: "Trustees must act as a 'prudent expert' with investment knowledge, not merely a 'prudent person.' Requires delegation to qualified staff or consultants." },
        { heading: "Conflicts of Interest", text: "Board members must disclose and recuse from decisions where conflicts exist. No self-dealing; related-party transactions require independent review." },
        { heading: "Committee Structure", text: "Investment Committee (strategy), Audit Committee (oversight), Risk Committee (monitoring). Each with defined mandates and reporting requirements." },
        { heading: "Policy Review Cycle", text: "IPS reviewed annually; SAA reviewed every 3 years or after significant market events. Manager mandates reviewed quarterly." },
      ],
    },
    {
      id: "reporting",
      title: "Quarterly Reporting Standards",
      icon: <BarChart3 className="w-4 h-4" />,
      color: "green" as const,
      content: [
        { heading: "Performance vs Benchmark", text: "Total fund return vs policy benchmark. Asset class returns vs sub-benchmarks. Attribution: allocation effect, selection effect, interaction effect." },
        { heading: "Risk Metrics", text: "Realized volatility, Sharpe ratio, tracking error, information ratio, max drawdown, VaR at 95% and 99% confidence. Stress test results." },
        { heading: "Funded Status Update", text: "Current funded ratio, estimated liability change, contribution requirements, projected funding trajectory under different scenarios." },
        { heading: "Manager Performance", text: "Each manager vs benchmark net of fees. Peer universe ranking. Watchlist status. Manager ratings (Buy/Hold/Sell based on process changes)." },
        { heading: "Compliance Report", text: "Policy compliance — any breaches and remediation. Cash flow summary. Fee transparency. Proxy voting activity. ESG metrics update." },
      ],
    },
    {
      id: "gips",
      title: "GIPS Compliance",
      icon: <CheckCircle className="w-4 h-4" />,
      color: "amber" as const,
      content: [
        { heading: "What is GIPS?", text: "Global Investment Performance Standards — a set of ethical principles for investment managers to standardize performance reporting for institutional clients." },
        { heading: "Composites", text: "All actual, fee-paying, discretionary portfolios must be included in at least one composite. Cherry-picking winners is prohibited." },
        { heading: "Calculation Requirements", text: "Time-weighted return (TWR) for portfolios; money-weighted return (MWR) allowed for private equity. Net of fees vs gross of fees must be disclosed." },
        { heading: "Verification", text: "Firms may hire independent verifiers to confirm GIPS compliance. Not mandatory but increases credibility with institutional allocators." },
        { heading: "Presentation", text: "Minimum 5 years (or since inception) of GIPS-compliant performance. Must include dispersion of composite returns and 3-year annualized standard deviation." },
      ],
    },
    {
      id: "esg",
      title: "ESG Integration & Stewardship",
      icon: <Target className="w-4 h-4" />,
      color: "green" as const,
      content: [
        { heading: "ESG Integration", text: "Systematic inclusion of environmental, social, governance factors into investment analysis and portfolio construction. Not exclusion — active engagement." },
        { heading: "Proxy Voting", text: "Pension funds exercise shareholder rights via proxy voting on executive compensation, board independence, climate disclosures, and capital allocation." },
        { heading: "Engagement", text: "Direct dialogue with company management on ESG issues. Co-filing shareholder resolutions. Collaborative engagement via PRI, ICGN, Climate Action 100+." },
        { heading: "Reporting", text: "TCFD-aligned climate risk disclosure. SASB-based ESG reporting to beneficiaries. Annual stewardship report on voting record and engagement outcomes." },
        { heading: "Impact Measurement", text: "Carbon footprint (Scope 1, 2, 3), weighted average carbon intensity, green revenue, board diversity metrics, ESG scores (MSCI, Sustainalytics)." },
      ],
    },
    {
      id: "regulatory",
      title: "Regulatory Environment",
      icon: <Shield className="w-4 h-4" />,
      color: "red" as const,
      content: [
        { heading: "ERISA (US)", text: "Employee Retirement Income Security Act (1974). Governs private pension plans. Sets fiduciary standards, vesting rules, funding requirements, PBGC insurance." },
        { heading: "PBGC Insurance", text: "Pension Benefit Guaranty Corporation insures defined benefit plans up to ~$81,000/yr per participant (2024). Premiums paid by plan sponsors." },
        { heading: "IORP Directive (EU)", text: "Institutions for Occupational Retirement Provision. EU framework requiring member states to regulate occupational pensions with prudent person rules." },
        { heading: "Superannuation (Australia)", text: "Mandatory 11% employer contributions. $3.5T+ system. APRA-regulated. Recent reforms: performance test, stapling, merger pressure on underperformers." },
        { heading: "Global Convergence", text: "IOSCO, FSB, IAIS working toward consistent global standards. Climate risk disclosures (ISSB IFRS S2) becoming mandatory in many jurisdictions." },
      ],
    },
  ];

  const colorConfig = {
    blue: { border: "border-blue-500/20", bg: "bg-blue-500/10", text: "text-blue-400", icon: "text-blue-400" },
    purple: { border: "border-purple-500/20", bg: "bg-purple-500/10", text: "text-purple-400", icon: "text-purple-400" },
    green: { border: "border-emerald-500/20", bg: "bg-emerald-500/10", text: "text-emerald-400", icon: "text-emerald-400" },
    amber: { border: "border-amber-500/20", bg: "bg-amber-500/10", text: "text-amber-400", icon: "text-amber-400" },
    red: { border: "border-red-500/20", bg: "bg-red-500/10", text: "text-red-400", icon: "text-red-400" },
  };

  return (
    <div className="space-y-3">
      {sections.map((sec) => {
        const cfg = colorConfig[sec.color];
        const isOpen = expandedSection === sec.id;
        return (
          <motion.div key={sec.id} className={cn("rounded-xl border overflow-hidden", cfg.border, cfg.bg)}>
            <button
              className="w-full flex items-center justify-between p-4 text-left"
              onClick={() => setExpandedSection(isOpen ? null : sec.id)}
            >
              <div className="flex items-center gap-3">
                <span className={cfg.icon}>{sec.icon}</span>
                <span className={cn("text-sm font-semibold", cfg.text)}>{sec.title}</span>
              </div>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className={cfg.text}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-white/5 pt-3">
                    {sec.content.map((item, i) => (
                      <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/5">
                        <div className={cn("text-xs font-semibold mb-1", cfg.text)}>{item.heading}</div>
                        <p className="text-xs text-white/60 leading-relaxed">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Summary metrics */}
      <SectionCard title="Governance Quality Indicators">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricChip label="GIPS Compliant" value="Yes" color="green" />
          <MetricChip label="Board Independence" value="75%" sub="independent trustees" color="blue" />
          <MetricChip label="Reporting Cycle" value="Quarterly" sub="+ annual audit" color="purple" />
          <MetricChip label="ESG Score" value="A-" sub="MSCI rating" color="amber" />
        </div>
      </SectionCard>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

const TABS = [
  { id: "overview", label: "Overview", icon: <Building2 className="w-4 h-4" /> },
  { id: "alm", label: "Asset-Liability", icon: <Layers className="w-4 h-4" /> },
  { id: "institutional", label: "Institutional", icon: <BarChart3 className="w-4 h-4" /> },
  { id: "alternatives", label: "Alternatives", icon: <TrendingUp className="w-4 h-4" /> },
  { id: "managers", label: "Manager Selection", icon: <Users className="w-4 h-4" /> },
  { id: "governance", label: "Governance", icon: <Shield className="w-4 h-4" /> },
];

export default function PensionFundPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-[#080a0e] text-white">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-blue-400" />
              <h1 className="text-xl font-bold text-white">Pension Fund & Institutional Investing</h1>
            </div>
            <p className="text-sm text-white/50">
              Comprehensive guide to pension fund management, asset-liability matching, and institutional portfolio strategies
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <div className="text-center">
              <div className="text-lg font-bold text-white">$500B</div>
              <div className="text-xs text-white/50">Example Fund</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-amber-400">82.4%</div>
              <div className="text-xs text-white/50">Funded Ratio</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-400">$88B</div>
              <div className="text-xs text-white/50">Funding Gap</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-5">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 gap-1 h-auto bg-white/5 p-1 rounded-xl mb-6">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-1.5 py-2 px-2 text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=inactive]:text-white/40 rounded-lg transition-all"
              >
                <span className="hidden sm:inline">{tab.icon}</span>
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="data-[state=inactive]:hidden">
            <OverviewTab />
          </TabsContent>
          <TabsContent value="alm" className="data-[state=inactive]:hidden">
            <ALMTab />
          </TabsContent>
          <TabsContent value="institutional" className="data-[state=inactive]:hidden">
            <InstitutionalTab />
          </TabsContent>
          <TabsContent value="alternatives" className="data-[state=inactive]:hidden">
            <AlternativesTab />
          </TabsContent>
          <TabsContent value="managers" className="data-[state=inactive]:hidden">
            <ManagerSelectionTab />
          </TabsContent>
          <TabsContent value="governance" className="data-[state=inactive]:hidden">
            <GovernanceTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom padding */}
      <div className="h-12" />
    </div>
  );
}
