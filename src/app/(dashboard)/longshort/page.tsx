"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  Activity,
  ShieldAlert,
  Scale,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 752001;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
function resetSeed() {
  s = 752001;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Position {
  ticker: string;
  name: string;
  sector: string;
  side: "long" | "short";
  weight: number; // % of NAV
  beta: number;
  entryPrice: number;
  currentPrice: number;
  shares: number;
}

interface FactorExposure {
  factor: string;
  portfolio: number;
  benchmark: number;
  neutral: boolean;
}

interface PairDef {
  longTicker: string;
  shortTicker: string;
  longSector: string;
  shortSector: string;
  correlation: number;
  pnl: number;
  spreadHistory: number[];
}

interface StressResult {
  scenario: string;
  longPnl: number;
  shortPnl: number;
  netPnl: number;
}

// ── Data generation ───────────────────────────────────────────────────────────

const TICKERS_LONG = [
  { ticker: "AAPL", name: "Apple", sector: "Technology" },
  { ticker: "MSFT", name: "Microsoft", sector: "Technology" },
  { ticker: "AMZN", name: "Amazon", sector: "Consumer Disc." },
  { ticker: "NVDA", name: "NVIDIA", sector: "Technology" },
  { ticker: "META", name: "Meta Platforms", sector: "Comm. Services" },
  { ticker: "LLY",  name: "Eli Lilly", sector: "Healthcare" },
  { ticker: "JPM",  name: "JPMorgan", sector: "Financials" },
  { ticker: "V",    name: "Visa", sector: "Financials" },
  { ticker: "UNH",  name: "UnitedHealth", sector: "Healthcare" },
  { ticker: "XOM",  name: "ExxonMobil", sector: "Energy" },
];

const TICKERS_SHORT = [
  { ticker: "INTC", name: "Intel", sector: "Technology" },
  { ticker: "WBA",  name: "Walgreens", sector: "Healthcare" },
  { ticker: "VFC",  name: "VF Corp", sector: "Consumer Disc." },
  { ticker: "PFE",  name: "Pfizer", sector: "Healthcare" },
  { ticker: "T",    name: "AT&T", sector: "Comm. Services" },
  { ticker: "CVS",  name: "CVS Health", sector: "Healthcare" },
  { ticker: "MPW",  name: "Med Properties", sector: "Real Estate" },
  { ticker: "PARA", name: "Paramount", sector: "Comm. Services" },
  { ticker: "NWL",  name: "Newell Brands", sector: "Consumer Staples" },
  { ticker: "ALK",  name: "Alaska Air", sector: "Industrials" },
];

function generatePositions(): Position[] {
  resetSeed();
  const positions: Position[] = [];
  let longWeightRemaining = 100;
  let shortWeightRemaining = 100;

  for (let i = 0; i < 10; i++) {
    const isLast = i === 9;
    const rawW = rand() * 14 + 4;
    const longW = isLast ? longWeightRemaining : Math.min(rawW, longWeightRemaining - (9 - i) * 4);
    longWeightRemaining -= longW;

    const entry = 50 + rand() * 450;
    const chg = (rand() - 0.42) * 0.35;
    const current = entry * (1 + chg);
    const beta = 0.7 + rand() * 1.2;

    positions.push({
      ...TICKERS_LONG[i],
      side: "long",
      weight: parseFloat(longW.toFixed(1)),
      beta: parseFloat(beta.toFixed(2)),
      entryPrice: parseFloat(entry.toFixed(2)),
      currentPrice: parseFloat(current.toFixed(2)),
      shares: Math.floor(1000 + rand() * 9000),
    });
  }

  for (let i = 0; i < 10; i++) {
    const isLast = i === 9;
    const rawW = rand() * 14 + 4;
    const shortW = isLast ? shortWeightRemaining : Math.min(rawW, shortWeightRemaining - (9 - i) * 4);
    shortWeightRemaining -= shortW;

    const entry = 20 + rand() * 200;
    const chg = (rand() - 0.58) * 0.35;
    const current = entry * (1 + chg);
    const beta = 0.5 + rand() * 1.0;

    positions.push({
      ...TICKERS_SHORT[i],
      side: "short",
      weight: parseFloat(shortW.toFixed(1)),
      beta: parseFloat(beta.toFixed(2)),
      entryPrice: parseFloat(entry.toFixed(2)),
      currentPrice: parseFloat(current.toFixed(2)),
      shares: Math.floor(500 + rand() * 5000),
    });
  }

  return positions;
}

function generateSpreadHistory(seed: number, n = 60): number[] {
  let ss = seed;
  const r = () => { ss = (ss * 1103515245 + 12345) & 0x7fffffff; return ss / 0x7fffffff; };
  const history: number[] = [0];
  for (let i = 1; i < n; i++) {
    const prev = history[i - 1];
    const revert = -0.08 * prev;
    const shock = (r() - 0.5) * 2.4;
    history.push(parseFloat((prev + revert + shock).toFixed(3)));
  }
  return history;
}

function generatePairs(): PairDef[] {
  return [
    { longTicker: "AAPL", shortTicker: "INTC", longSector: "Technology", shortSector: "Technology", correlation: 0.74, pnl: 18400, spreadHistory: generateSpreadHistory(11) },
    { longTicker: "LLY",  shortTicker: "PFE",  longSector: "Healthcare",  shortSector: "Healthcare",  correlation: 0.68, pnl: 12300, spreadHistory: generateSpreadHistory(22) },
    { longTicker: "META", shortTicker: "PARA", longSector: "Comm. Services", shortSector: "Comm. Services", correlation: 0.71, pnl: 9800,  spreadHistory: generateSpreadHistory(33) },
    { longTicker: "JPM",  shortTicker: "CVS",  longSector: "Financials",  shortSector: "Healthcare",  correlation: 0.52, pnl: 6200,  spreadHistory: generateSpreadHistory(44) },
    { longTicker: "AMZN", shortTicker: "WBA",  longSector: "Consumer Disc.", shortSector: "Healthcare", correlation: 0.61, pnl: -3100, spreadHistory: generateSpreadHistory(55) },
  ];
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatChip({ label, value, variant = "default" }: { label: string; value: string; variant?: "default" | "green" | "red" | "amber" }) {
  return (
    <div className={cn(
      "flex flex-col items-center px-3 py-2 rounded-lg border text-center",
      variant === "green" && "border-emerald-500/30 bg-emerald-500/10",
      variant === "red"   && "border-red-500/30 bg-red-500/10",
      variant === "amber" && "border-amber-500/30 bg-amber-500/10",
      variant === "default" && "border-border bg-muted/30",
    )}>
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className={cn(
        "text-sm font-semibold mt-0.5",
        variant === "green" && "text-emerald-400",
        variant === "red"   && "text-red-400",
        variant === "amber" && "text-amber-400",
        variant === "default" && "text-foreground",
      )}>{value}</span>
    </div>
  );
}

function TrafficLight({ status }: { status: "ok" | "warn" | "fail" }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
      status === "ok"   && "bg-emerald-500/15 text-emerald-400",
      status === "warn" && "bg-amber-500/15 text-amber-400",
      status === "fail" && "bg-red-500/15 text-red-400",
    )}>
      {status === "ok"   && <CheckCircle2 className="w-3 h-3" />}
      {status === "warn" && <AlertTriangle className="w-3 h-3" />}
      {status === "fail" && <XCircle className="w-3 h-3" />}
      {status === "ok" ? "Pass" : status === "warn" ? "Warn" : "Fail"}
    </span>
  );
}

// ── Donut SVG ─────────────────────────────────────────────────────────────────

function DonutChart({ longGross, shortGross }: { longGross: number; shortGross: number }) {
  const total = longGross + shortGross;
  const longAngle = (longGross / total) * 360;
  const r = 54;
  const cx = 70;
  const cy = 70;
  const strokeW = 20;

  function describeArc(startDeg: number, endDeg: number) {
    const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg));
    const y2 = cy + r * Math.sin(toRad(endDeg));
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  }

  return (
    <svg viewBox="0 0 140 140" width={140} height={140} className="mx-auto">
      <path d={describeArc(0, longAngle)} fill="none" stroke="#10b981" strokeWidth={strokeW} strokeLinecap="butt" />
      <path d={describeArc(longAngle, 360)} fill="none" stroke="#f87171" strokeWidth={strokeW} strokeLinecap="butt" />
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#e5e7eb" fontSize="11" fontWeight="600">Long/Short</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#10b981" fontSize="10">{longGross.toFixed(0)}%</text>
      <text x={cx} y={cy + 24} textAnchor="middle" fill="#f87171" fontSize="10">{shortGross.toFixed(0)}%</text>
    </svg>
  );
}

// ── Factor Bar Chart SVG ───────────────────────────────────────────────────────

function FactorBarChart({ factors }: { factors: FactorExposure[] }) {
  const w = 420;
  const h = 190;
  const marginLeft = 90;
  const marginRight = 16;
  const marginTop = 16;
  const marginBottom = 24;
  const innerW = w - marginLeft - marginRight;
  const innerH = h - marginTop - marginBottom;
  const barH = 14;
  const gap = (innerH - factors.length * barH * 2) / (factors.length + 1);

  const maxVal = 1.6;
  const xScale = (v: number) => marginLeft + ((v + maxVal) / (2 * maxVal)) * innerW;
  const midX = xScale(0);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" className="text-[11px]">
      <line x1={midX} y1={marginTop} x2={midX} y2={h - marginBottom} stroke="#374151" strokeWidth={1} />
      {[-1.5, -1, -0.5, 0, 0.5, 1, 1.5].map((v) => (
        <g key={v}>
          <line x1={xScale(v)} y1={marginTop} x2={xScale(v)} y2={h - marginBottom} stroke="#1f2937" strokeWidth={1} />
          <text x={xScale(v)} y={h - marginBottom + 12} textAnchor="middle" fill="#6b7280" fontSize="9">{v}</text>
        </g>
      ))}
      {factors.map((f, i) => {
        const y0 = marginTop + gap + i * (barH * 2 + gap);
        return (
          <g key={f.factor}>
            <text x={marginLeft - 6} y={y0 + barH + 2} textAnchor="end" fill="#9ca3af" fontSize="10">{f.factor}</text>
            {/* portfolio bar */}
            <rect
              x={f.portfolio >= 0 ? midX : xScale(f.portfolio)}
              y={y0}
              width={Math.abs(xScale(f.portfolio) - midX)}
              height={barH}
              fill={f.portfolio >= 0 ? "#3b82f6" : "#f87171"}
              rx={2}
            />
            {/* benchmark bar */}
            <rect
              x={f.benchmark >= 0 ? midX : xScale(f.benchmark)}
              y={y0 + barH + 1}
              width={Math.abs(xScale(f.benchmark) - midX)}
              height={barH - 2}
              fill="#6b7280"
              rx={2}
              opacity={0.5}
            />
          </g>
        );
      })}
      <g>
        <rect x={w - 110} y={marginTop} width={10} height={8} fill="#3b82f6" rx={1} />
        <text x={w - 96} y={marginTop + 7} fill="#9ca3af" fontSize="9">Portfolio</text>
        <rect x={w - 110} y={marginTop + 14} width={10} height={8} fill="#6b7280" rx={1} opacity={0.5} />
        <text x={w - 96} y={marginTop + 21} fill="#9ca3af" fontSize="9">Benchmark</text>
      </g>
    </svg>
  );
}

// ── Waterfall SVG ─────────────────────────────────────────────────────────────

function WaterfallChart({ items }: { items: { label: string; value: number; cumulative: number }[] }) {
  const w = 440;
  const h = 200;
  const marginLeft = 60;
  const marginBottom = 40;
  const marginTop = 20;
  const innerW = w - marginLeft - 20;
  const innerH = h - marginBottom - marginTop;

  const allVals = items.flatMap((it) => [it.cumulative, it.cumulative - it.value]);
  const minV = Math.min(...allVals) * 1.15;
  const maxV = Math.max(...allVals) * 1.15;
  const range = maxV - minV || 1;

  const yScale = (v: number) => marginTop + ((maxV - v) / range) * innerH;
  const barW = innerW / items.length - 6;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%">
      <line x1={marginLeft} y1={yScale(0)} x2={w - 20} y2={yScale(0)} stroke="#374151" strokeWidth={1} strokeDasharray="4 3" />
      {items.map((it, i) => {
        const x = marginLeft + i * (barW + 6);
        const base = it.cumulative - it.value;
        const top = it.cumulative;
        const y = yScale(Math.max(top, base));
        const barHeight = Math.abs(yScale(base) - yScale(top));
        const positive = it.value >= 0;
        return (
          <g key={it.label}>
            <rect x={x} y={y} width={barW} height={Math.max(barHeight, 2)} fill={positive ? "#10b981" : "#f87171"} rx={2} opacity={0.85} />
            <text x={x + barW / 2} y={h - marginBottom + 14} textAnchor="middle" fill="#9ca3af" fontSize="9">{it.label}</text>
            <text x={x + barW / 2} y={y - 4} textAnchor="middle" fill={positive ? "#10b981" : "#f87171"} fontSize="9">
              {positive ? "+" : ""}{(it.value / 1000).toFixed(0)}k
            </text>
          </g>
        );
      })}
      {[-40000, -20000, 0, 20000, 40000].map((v) => (
        <g key={v}>
          <line x1={marginLeft - 4} y1={yScale(v)} x2={w - 20} y2={yScale(v)} stroke="#1f2937" strokeWidth={1} />
          <text x={marginLeft - 6} y={yScale(v) + 4} textAnchor="end" fill="#6b7280" fontSize="9">{v >= 0 ? "+" : ""}{v / 1000}k</text>
        </g>
      ))}
    </svg>
  );
}

// ── Spread Time Series SVG ────────────────────────────────────────────────────

function SpreadChart({ data, pairLabel }: { data: number[]; pairLabel: string }) {
  const w = 380;
  const h = 120;
  const mL = 36;
  const mB = 22;
  const mT = 12;
  const innerW = w - mL - 12;
  const innerH = h - mB - mT;

  const minV = Math.min(...data);
  const maxV = Math.max(...data);
  const range = maxV - minV || 1;
  const yScale = (v: number) => mT + ((maxV - v) / range) * innerH;
  const xScale = (i: number) => mL + (i / (data.length - 1)) * innerW;

  const points = data.map((v, i) => `${xScale(i)},${yScale(v)}`).join(" ");
  const y0 = yScale(0);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%">
      <text x={mL} y={mT - 2} fill="#6b7280" fontSize="9">{pairLabel} spread</text>
      <line x1={mL} y1={y0} x2={w - 12} y2={y0} stroke="#374151" strokeWidth={1} strokeDasharray="4 3" />
      <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth={1.5} />
      {data.map((v, i) => (
        i === data.length - 1 ? (
          <circle key={i} cx={xScale(i)} cy={yScale(v)} r={3} fill={v >= 0 ? "#10b981" : "#f87171"} />
        ) : null
      ))}
      {[minV, 0, maxV].map((v, i) => (
        <text key={i} x={mL - 4} y={yScale(v) + 4} textAnchor="end" fill="#6b7280" fontSize="8">{v.toFixed(1)}</text>
      ))}
      <text x={mL} y={h - 6} fill="#6b7280" fontSize="8">0</text>
      <text x={w - 12} y={h - 6} fill="#6b7280" fontSize="8" textAnchor="end">60d</text>
    </svg>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function LongShortPage() {
  const [activeTab, setActiveTab] = useState("builder");
  const [refreshKey, setRefreshKey] = useState(0);

  const positions = useMemo(() => {
    void refreshKey;
    return generatePositions();
  }, [refreshKey]);

  const pairs = useMemo(() => generatePairs(), []);

  // ── Portfolio metrics ────────────────────────────────────────────────────────

  const metrics = useMemo(() => {
    const longs = positions.filter((p) => p.side === "long");
    const shorts = positions.filter((p) => p.side === "short");

    const longGross = longs.reduce((s, p) => s + p.weight, 0);
    const shortGross = shorts.reduce((s, p) => s + p.weight, 0);
    const grossExposure = longGross + shortGross;
    const netExposure = longGross - shortGross;

    const longBetaContrib = longs.reduce((s, p) => s + (p.weight / 100) * p.beta, 0);
    const shortBetaContrib = shorts.reduce((s, p) => s + (p.weight / 100) * p.beta, 0);
    const betaAdjustedNet = longBetaContrib - shortBetaContrib;

    const longPnl = longs.reduce((s, p) => s + p.shares * (p.currentPrice - p.entryPrice), 0);
    const shortPnl = shorts.reduce((s, p) => s + p.shares * (p.entryPrice - p.currentPrice), 0);
    const totalPnl = longPnl + shortPnl;

    const longBeta = longBetaContrib / (longGross / 100);
    const shortBeta = shortBetaContrib / (shortGross / 100);

    return {
      longGross,
      shortGross,
      grossExposure,
      netExposure,
      betaAdjustedNet,
      longPnl,
      shortPnl,
      totalPnl,
      longBeta,
      shortBeta,
    };
  }, [positions]);

  // ── Factor exposures ──────────────────────────────────────────────────────────

  const factorExposures: FactorExposure[] = useMemo(() => [
    { factor: "Market",   portfolio: parseFloat((metrics.betaAdjustedNet).toFixed(2)),   benchmark: 1.0,  neutral: Math.abs(metrics.betaAdjustedNet) < 0.2 },
    { factor: "Size",     portfolio: 0.18,  benchmark: 0.0,  neutral: Math.abs(0.18) < 0.3 },
    { factor: "Value",    portfolio: -0.31, benchmark: 0.0,  neutral: Math.abs(-0.31) < 0.3 },
    { factor: "Momentum", portfolio: 0.55,  benchmark: 0.0,  neutral: Math.abs(0.55) < 0.3 },
    { factor: "Quality",  portfolio: 0.72,  benchmark: 0.0,  neutral: Math.abs(0.72) < 0.3 },
  ], [metrics.betaAdjustedNet]);

  // ── Attribution data ──────────────────────────────────────────────────────────

  const waterfallItems = useMemo(() => {
    const factorPnl   = 14200;
    const alphaLong   = 28700;
    const alphaShort  = 12400;
    const costs       = -3100;
    return [
      { label: "Factor β",    value: factorPnl,  cumulative: factorPnl },
      { label: "Long α",      value: alphaLong,  cumulative: factorPnl + alphaLong },
      { label: "Short α",     value: alphaShort, cumulative: factorPnl + alphaLong + alphaShort },
      { label: "Costs",       value: costs,      cumulative: factorPnl + alphaLong + alphaShort + costs },
    ];
  }, []);

  // ── Risk metrics ──────────────────────────────────────────────────────────────

  const riskMetrics = useMemo(() => {
    const portfolioVol = 0.124;
    const navM = 10; // $10M NAV
    const varPct = portfolioVol * 1.645 / Math.sqrt(252);
    const cvarPct = varPct * 1.3;
    const varDollar = navM * varPct;
    const cvarDollar = navM * cvarPct;

    const sectorMap: Record<string, number> = {};
    for (const p of positions) {
      sectorMap[p.sector] = (sectorMap[p.sector] || 0) + p.weight;
    }
    const maxSectorConc = Math.max(...Object.values(sectorMap));
    const maxSectorName = Object.entries(sectorMap).sort((a, b) => b[1] - a[1])[0][0];

    const maxPositionWeight = Math.max(...positions.map((p) => p.weight));
    const maxPositionTicker = positions.sort((a, b) => b.weight - a.weight)[0].ticker;

    const stressResults: StressResult[] = [
      { scenario: "Market -10%", longPnl: -navM * 0.1 * metrics.longBeta * (metrics.longGross / 100),  shortPnl: navM * 0.1 * metrics.shortBeta * (metrics.shortGross / 100), netPnl: 0 },
      { scenario: "Market -20%", longPnl: -navM * 0.2 * metrics.longBeta * (metrics.longGross / 100),  shortPnl: navM * 0.2 * metrics.shortBeta * (metrics.shortGross / 100), netPnl: 0 },
      { scenario: "Rates +100bp", longPnl: -navM * 0.03, shortPnl: navM * 0.015, netPnl: 0 },
      { scenario: "Tech Selloff -15%", longPnl: -navM * 0.08, shortPnl: navM * 0.04, netPnl: 0 },
    ];
    for (const r of stressResults) r.netPnl = r.longPnl + r.shortPnl;

    return {
      varPct: varPct * 100,
      cvarPct: cvarPct * 100,
      varDollar,
      cvarDollar,
      sectorMap,
      maxSectorConc,
      maxSectorName,
      maxPositionWeight,
      maxPositionTicker,
      stressResults,
      sharpe: 1.42,
      sortino: 1.88,
    };
  }, [positions, metrics]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Scale className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Long/Short Portfolio</h1>
            <p className="text-xs text-muted-foreground">Equity long/short construction &amp; management simulator</p>
          </div>
        </div>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border hover:border-foreground/20 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Regenerate
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        <StatChip label="Gross Exp." value={`${metrics.grossExposure.toFixed(0)}%`} />
        <StatChip label="Net Exp." value={`${metrics.netExposure > 0 ? "+" : ""}${metrics.netExposure.toFixed(0)}%`} variant={metrics.netExposure > 0 ? "green" : metrics.netExposure < -10 ? "red" : "default"} />
        <StatChip label="β-Adj Net" value={`${metrics.betaAdjustedNet > 0 ? "+" : ""}${metrics.betaAdjustedNet.toFixed(2)}`} variant={Math.abs(metrics.betaAdjustedNet) < 0.15 ? "green" : "amber"} />
        <StatChip label="Long Gross" value={`${metrics.longGross.toFixed(0)}%`} variant="green" />
        <StatChip label="Short Gross" value={`${metrics.shortGross.toFixed(0)}%`} variant="red" />
        <StatChip label="Total P&L" value={`${metrics.totalPnl >= 0 ? "+" : ""}$${(metrics.totalPnl / 1000).toFixed(0)}k`} variant={metrics.totalPnl >= 0 ? "green" : "red"} />
        <StatChip label="Sharpe" value={riskMetrics.sharpe.toFixed(2)} variant="green" />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/30 p-1">
          <TabsTrigger value="builder" className="text-xs">Portfolio Builder</TabsTrigger>
          <TabsTrigger value="factor"  className="text-xs">Factor Exposure</TabsTrigger>
          <TabsTrigger value="pnl"     className="text-xs">P&L Attribution</TabsTrigger>
          <TabsTrigger value="pairs"   className="text-xs">Pair Analysis</TabsTrigger>
          <TabsTrigger value="risk"    className="text-xs">Risk Dashboard</TabsTrigger>
        </TabsList>

        {/* ── TAB 1: Portfolio Builder ────────────────────────────────────────── */}
        <TabsContent value="builder" className="data-[state=inactive]:hidden mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Long Book */}
            <div className="lg:col-span-1">
              <Card className="border-emerald-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Long Book
                    <Badge variant="outline" className="ml-auto text-emerald-400 border-emerald-500/30 text-xs">{metrics.longGross.toFixed(0)}% gross</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left px-3 py-2 text-muted-foreground font-medium">Ticker</th>
                          <th className="text-left px-3 py-2 text-muted-foreground font-medium">Sector</th>
                          <th className="text-right px-3 py-2 text-muted-foreground font-medium">Wt%</th>
                          <th className="text-right px-3 py-2 text-muted-foreground font-medium">Beta</th>
                          <th className="text-right px-3 py-2 text-muted-foreground font-medium">P&L</th>
                        </tr>
                      </thead>
                      <tbody>
                        {positions.filter((p) => p.side === "long").map((p) => {
                          const pnl = p.shares * (p.currentPrice - p.entryPrice);
                          return (
                            <motion.tr
                              key={p.ticker}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                            >
                              <td className="px-3 py-1.5 font-medium text-foreground">{p.ticker}</td>
                              <td className="px-3 py-1.5 text-muted-foreground truncate max-w-[80px]">{p.sector}</td>
                              <td className="px-3 py-1.5 text-right">{p.weight.toFixed(1)}</td>
                              <td className="px-3 py-1.5 text-right text-amber-400">{p.beta.toFixed(2)}</td>
                              <td className={cn("px-3 py-1.5 text-right font-medium", pnl >= 0 ? "text-emerald-400" : "text-red-400")}>
                                {pnl >= 0 ? "+" : ""}${(pnl / 1000).toFixed(1)}k
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Short Book */}
            <div className="lg:col-span-1">
              <Card className="border-red-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    Short Book
                    <Badge variant="outline" className="ml-auto text-red-400 border-red-500/30 text-xs">{metrics.shortGross.toFixed(0)}% gross</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left px-3 py-2 text-muted-foreground font-medium">Ticker</th>
                          <th className="text-left px-3 py-2 text-muted-foreground font-medium">Sector</th>
                          <th className="text-right px-3 py-2 text-muted-foreground font-medium">Wt%</th>
                          <th className="text-right px-3 py-2 text-muted-foreground font-medium">Beta</th>
                          <th className="text-right px-3 py-2 text-muted-foreground font-medium">P&L</th>
                        </tr>
                      </thead>
                      <tbody>
                        {positions.filter((p) => p.side === "short").map((p) => {
                          const pnl = p.shares * (p.entryPrice - p.currentPrice);
                          return (
                            <motion.tr
                              key={p.ticker}
                              initial={{ opacity: 0, x: 8 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                            >
                              <td className="px-3 py-1.5 font-medium text-foreground">{p.ticker}</td>
                              <td className="px-3 py-1.5 text-muted-foreground truncate max-w-[80px]">{p.sector}</td>
                              <td className="px-3 py-1.5 text-right">{p.weight.toFixed(1)}</td>
                              <td className="px-3 py-1.5 text-right text-amber-400">{p.beta.toFixed(2)}</td>
                              <td className={cn("px-3 py-1.5 text-right font-medium", pnl >= 0 ? "text-emerald-400" : "text-red-400")}>
                                {pnl >= 0 ? "+" : ""}${(pnl / 1000).toFixed(1)}k
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Exposure Summary */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-primary" />
                    Exposure Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <DonutChart longGross={metrics.longGross} shortGross={metrics.shortGross} />
                  <div className="space-y-2 text-xs">
                    {[
                      { label: "Gross Exposure",       value: `${metrics.grossExposure.toFixed(1)}%`, color: "text-foreground" },
                      { label: "Net Exposure",          value: `${metrics.netExposure > 0 ? "+" : ""}${metrics.netExposure.toFixed(1)}%`, color: metrics.netExposure > 0 ? "text-emerald-400" : "text-red-400" },
                      { label: "Beta-Adj Net Exp.",     value: `${metrics.betaAdjustedNet > 0 ? "+" : ""}${metrics.betaAdjustedNet.toFixed(3)}`, color: Math.abs(metrics.betaAdjustedNet) < 0.15 ? "text-emerald-400" : "text-amber-400" },
                      { label: "Long Book Beta",        value: metrics.longBeta.toFixed(2), color: "text-emerald-400" },
                      { label: "Short Book Beta",       value: metrics.shortBeta.toFixed(2), color: "text-red-400" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-muted-foreground">{label}</span>
                        <span className={cn("font-semibold", color)}>{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── TAB 2: Factor Exposure ──────────────────────────────────────────── */}
        <TabsContent value="factor" className="data-[state=inactive]:hidden mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-primary" />
                    Factor Betas vs Benchmark
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FactorBarChart factors={factorExposures} />
                  <p className="text-xs text-muted-foreground mt-2">Blue = portfolio, gray = benchmark (S&P 500 factors)</p>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Neutrality Check</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {factorExposures.map((f) => (
                    <div key={f.factor} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground w-20">{f.factor}</span>
                      <span className={cn("font-mono", f.portfolio >= 0 ? "text-blue-400" : "text-red-400")}>
                        {f.portfolio > 0 ? "+" : ""}{f.portfolio.toFixed(2)}
                      </span>
                      <TrafficLight status={f.neutral ? "ok" : Math.abs(f.portfolio) < 0.5 ? "warn" : "fail"} />
                    </div>
                  ))}
                  <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-400" />Pass: |β| &lt; 0.3</div>
                    <div className="flex items-center gap-1.5"><AlertTriangle className="w-3 h-3 text-amber-400" />Warn: 0.3 ≤ |β| &lt; 0.5</div>
                    <div className="flex items-center gap-1.5"><XCircle className="w-3 h-3 text-red-400" />Fail: |β| ≥ 0.5</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
                    Factor Interpretation
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-1.5">
                  <p><span className="text-foreground font-medium">Market:</span> Net beta exposure to market moves.</p>
                  <p><span className="text-foreground font-medium">Size:</span> Tilt toward small (+) or large (-) caps.</p>
                  <p><span className="text-foreground font-medium">Value:</span> Cheap (+) vs expensive (-) stocks.</p>
                  <p><span className="text-foreground font-medium">Momentum:</span> Recent winners (+) vs losers (-).</p>
                  <p><span className="text-foreground font-medium">Quality:</span> High (+) vs low (-) quality balance sheets.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── TAB 3: P&L Attribution ──────────────────────────────────────────── */}
        <TabsContent value="pnl" className="data-[state=inactive]:hidden mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-primary" />
                    P&L Attribution Waterfall
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <WaterfallChart items={waterfallItems} />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                    {waterfallItems.map((it) => (
                      <div key={it.label} className={cn(
                        "text-center px-2 py-1.5 rounded-lg border text-xs",
                        it.value >= 0 ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5",
                      )}>
                        <div className="text-muted-foreground text-xs">{it.label}</div>
                        <div className={cn("font-semibold", it.value >= 0 ? "text-emerald-400" : "text-red-400")}>
                          {it.value >= 0 ? "+" : ""}${(it.value / 1000).toFixed(1)}k
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Book Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="text-muted-foreground flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-emerald-400" />Long Book P&L</span>
                    <span className={cn("font-semibold", metrics.longPnl >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {metrics.longPnl >= 0 ? "+" : ""}${(metrics.longPnl / 1000).toFixed(1)}k
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="text-muted-foreground flex items-center gap-1.5"><TrendingDown className="w-3.5 h-3.5 text-red-400" />Short Book P&L</span>
                    <span className={cn("font-semibold", metrics.shortPnl >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {metrics.shortPnl >= 0 ? "+" : ""}${(metrics.shortPnl / 1000).toFixed(1)}k
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground font-medium">Total P&L</span>
                    <span className={cn("font-semibold text-sm", metrics.totalPnl >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {metrics.totalPnl >= 0 ? "+" : ""}${(metrics.totalPnl / 1000).toFixed(1)}k
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Sharpe Decomposition</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {[
                    { label: "Total Sharpe",      value: "1.42",  color: "text-emerald-400" },
                    { label: "Factor Sharpe",     value: "0.48",  color: "text-blue-400" },
                    { label: "Alpha Sharpe",      value: "0.94",  color: "text-primary" },
                    { label: "Sortino Ratio",     value: "1.88",  color: "text-emerald-400" },
                    { label: "Calmar Ratio",      value: "2.14",  color: "text-emerald-400" },
                    { label: "Information Ratio", value: "0.73",  color: "text-amber-400" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-muted-foreground">{label}</span>
                      <span className={cn("font-semibold", color)}>{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── TAB 4: Pair Analysis ────────────────────────────────────────────── */}
        <TabsContent value="pairs" className="data-[state=inactive]:hidden mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pairs.map((pair) => (
              <motion.div
                key={`${pair.longTicker}-${pair.shortTicker}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={cn(
                  "border",
                  pair.pnl >= 0 ? "border-emerald-500/20" : "border-red-500/20",
                )}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>
                        <span className="text-emerald-400">{pair.longTicker}</span>
                        <span className="text-muted-foreground mx-1">/</span>
                        <span className="text-red-400">{pair.shortTicker}</span>
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          pair.pnl >= 0 ? "text-emerald-400 border-emerald-500/30" : "text-red-400 border-red-500/30",
                        )}
                      >
                        {pair.pnl >= 0 ? "+" : ""}${(pair.pnl / 1000).toFixed(1)}k
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <SpreadChart data={pair.spreadHistory} pairLabel={`${pair.longTicker}/${pair.shortTicker}`} />
                    <div className="grid grid-cols-2 gap-x-4 text-xs text-muted-foreground">
                      <div>Correlation: <span className="text-foreground">{pair.correlation.toFixed(2)}</span></div>
                      <div>Long sector: <span className="text-foreground">{pair.longSector}</span></div>
                      <div>Short sector: <span className="text-foreground">{pair.shortSector}</span></div>
                      <div>P&L: <span className={pair.pnl >= 0 ? "text-emerald-400" : "text-red-400"}>{pair.pnl >= 0 ? "+" : ""}${(pair.pnl / 1000).toFixed(1)}k</span></div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Summary table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Pairs Summary Table</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left px-3 py-2 text-muted-foreground font-medium">Long</th>
                      <th className="text-left px-3 py-2 text-muted-foreground font-medium">Short</th>
                      <th className="text-left px-3 py-2 text-muted-foreground font-medium">L Sector</th>
                      <th className="text-left px-3 py-2 text-muted-foreground font-medium">S Sector</th>
                      <th className="text-right px-3 py-2 text-muted-foreground font-medium">Corr</th>
                      <th className="text-right px-3 py-2 text-muted-foreground font-medium">P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pairs.map((p) => (
                      <tr key={`${p.longTicker}${p.shortTicker}`} className="border-b border-border/30 hover:bg-muted/20">
                        <td className="px-3 py-1.5 font-medium text-emerald-400">{p.longTicker}</td>
                        <td className="px-3 py-1.5 font-medium text-red-400">{p.shortTicker}</td>
                        <td className="px-3 py-1.5 text-muted-foreground">{p.longSector}</td>
                        <td className="px-3 py-1.5 text-muted-foreground">{p.shortSector}</td>
                        <td className="px-3 py-1.5 text-right text-amber-400">{p.correlation.toFixed(2)}</td>
                        <td className={cn("px-3 py-1.5 text-right font-medium", p.pnl >= 0 ? "text-emerald-400" : "text-red-400")}>
                          {p.pnl >= 0 ? "+" : ""}${(p.pnl / 1000).toFixed(1)}k
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 5: Risk Dashboard ───────────────────────────────────────────── */}
        <TabsContent value="risk" className="data-[state=inactive]:hidden mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* VaR / CVaR */}
            <Card className="border-red-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  VaR &amp; CVaR (95%)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {[
                  { label: "Daily VaR (%)",   value: `${riskMetrics.varPct.toFixed(2)}%`,  color: "text-amber-400" },
                  { label: "Daily VaR ($)",   value: `$${(riskMetrics.varDollar * 1e6).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, color: "text-amber-400" },
                  { label: "CVaR (%)",        value: `${riskMetrics.cvarPct.toFixed(2)}%`, color: "text-red-400" },
                  { label: "CVaR ($)",        value: `$${(riskMetrics.cvarDollar * 1e6).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, color: "text-red-400" },
                  { label: "Ann. Vol",        value: "12.4%",  color: "text-foreground" },
                  { label: "Max Drawdown",    value: "-7.8%",  color: "text-red-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className={cn("font-semibold", color)}>{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Sector Concentration */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Sector Concentration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(riskMetrics.sectorMap)
                  .sort((a, b) => b[1] - a[1])
                  .map(([sector, weight]) => (
                    <div key={sector} className="space-y-0.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground truncate max-w-[120px]">{sector}</span>
                        <span className={cn("font-medium", weight > 35 ? "text-red-400" : weight > 25 ? "text-amber-400" : "text-foreground")}>
                          {weight.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", weight > 35 ? "bg-red-500" : weight > 25 ? "bg-amber-500" : "bg-primary")}
                          style={{ width: `${Math.min(weight, 50) * 2}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Traffic Light Risk System */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Risk Checks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {[
                  {
                    label: "Max Position Size",
                    detail: `${riskMetrics.maxPositionTicker} at ${riskMetrics.maxPositionWeight.toFixed(1)}%`,
                    status: (riskMetrics.maxPositionWeight > 20 ? "fail" : riskMetrics.maxPositionWeight > 15 ? "warn" : "ok") as "ok" | "warn" | "fail",
                  },
                  {
                    label: "Net Beta Exposure",
                    detail: `β-adj net = ${metrics.betaAdjustedNet.toFixed(2)}`,
                    status: (Math.abs(metrics.betaAdjustedNet) > 0.4 ? "fail" : Math.abs(metrics.betaAdjustedNet) > 0.2 ? "warn" : "ok") as "ok" | "warn" | "fail",
                  },
                  {
                    label: "Sector Concentration",
                    detail: `${riskMetrics.maxSectorName}: ${riskMetrics.maxSectorConc.toFixed(1)}%`,
                    status: (riskMetrics.maxSectorConc > 40 ? "fail" : riskMetrics.maxSectorConc > 30 ? "warn" : "ok") as "ok" | "warn" | "fail",
                  },
                  {
                    label: "Gross Leverage",
                    detail: `${metrics.grossExposure.toFixed(0)}% of NAV`,
                    status: (metrics.grossExposure > 250 ? "fail" : metrics.grossExposure > 200 ? "warn" : "ok") as "ok" | "warn" | "fail",
                  },
                  {
                    label: "Momentum Tilt",
                    detail: "β_mom = 0.55",
                    status: "warn" as "ok" | "warn" | "fail",
                  },
                  {
                    label: "VaR vs Limit",
                    detail: `${riskMetrics.varPct.toFixed(2)}% vs 2.0% limit`,
                    status: (riskMetrics.varPct > 2.0 ? "fail" : riskMetrics.varPct > 1.5 ? "warn" : "ok") as "ok" | "warn" | "fail",
                  },
                ].map(({ label, detail, status }) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-medium text-foreground">{label}</div>
                      <div className="text-xs text-muted-foreground">{detail}</div>
                    </div>
                    <TrafficLight status={status} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Stress Tests */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Stress Test Results
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Scenario</th>
                      <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Long P&L</th>
                      <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Short P&L</th>
                      <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Net P&L</th>
                      <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">NAV Impact</th>
                      <th className="text-center px-4 py-2.5 text-muted-foreground font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riskMetrics.stressResults.map((r) => {
                      const navImpact = (r.netPnl / 10) * 100;
                      return (
                        <tr key={r.scenario} className="border-b border-border/30 hover:bg-muted/20">
                          <td className="px-4 py-2 font-medium text-foreground">{r.scenario}</td>
                          <td className={cn("px-4 py-2 text-right", r.longPnl >= 0 ? "text-emerald-400" : "text-red-400")}>
                            {r.longPnl >= 0 ? "+" : ""}${(r.longPnl / 1e6).toFixed(2)}M
                          </td>
                          <td className={cn("px-4 py-2 text-right", r.shortPnl >= 0 ? "text-emerald-400" : "text-red-400")}>
                            {r.shortPnl >= 0 ? "+" : ""}${(r.shortPnl / 1e6).toFixed(2)}M
                          </td>
                          <td className={cn("px-4 py-2 text-right font-semibold", r.netPnl >= 0 ? "text-emerald-400" : "text-red-400")}>
                            {r.netPnl >= 0 ? "+" : ""}${(r.netPnl / 1e6).toFixed(2)}M
                          </td>
                          <td className={cn("px-4 py-2 text-right", navImpact >= 0 ? "text-emerald-400" : "text-red-400")}>
                            {navImpact >= 0 ? "+" : ""}{navImpact.toFixed(1)}%
                          </td>
                          <td className="px-4 py-2 text-center">
                            <TrafficLight status={navImpact < -5 ? "fail" : navImpact < -2 ? "warn" : "ok"} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Beta Exposure Bar */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Beta Exposure by Position</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {positions
                  .slice()
                  .sort((a, b) => (b.side === "long" ? b.beta : -b.beta) - (a.side === "long" ? a.beta : -a.beta))
                  .slice(0, 12)
                  .map((p) => {
                    const betaContrib = (p.weight / 100) * p.beta * (p.side === "long" ? 1 : -1);
                    const barPct = Math.abs(betaContrib) / 0.3 * 100;
                    return (
                      <div key={`${p.ticker}-${p.side}`} className="flex items-center gap-2 text-xs">
                        <span className={cn("w-12 font-medium", p.side === "long" ? "text-emerald-400" : "text-red-400")}>{p.ticker}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", betaContrib >= 0 ? "bg-emerald-500" : "bg-red-500")}
                            style={{ width: `${Math.min(barPct, 100)}%` }}
                          />
                        </div>
                        <span className={cn("w-16 text-right font-mono", betaContrib >= 0 ? "text-emerald-400" : "text-red-400")}>
                          {betaContrib >= 0 ? "+" : ""}{betaContrib.toFixed(3)}β
                        </span>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer note */}
      <AnimatePresence>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-muted-foreground text-center pt-2 border-t border-border/30"
        >
          Simulated portfolio — seed 752001. All prices, P&L, and risk metrics are synthetic for educational purposes only.
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
