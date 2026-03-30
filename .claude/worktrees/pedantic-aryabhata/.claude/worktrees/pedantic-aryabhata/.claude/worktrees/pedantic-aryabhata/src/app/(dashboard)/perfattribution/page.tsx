"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Layers,
  Activity,
  DollarSign,
  Percent,
  Clock,
  Users,
  Shield,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 902;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed() {
  s = 902;
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface SectorAttribution {
  sector: string;
  portfolioWeight: number;
  benchmarkWeight: number;
  portfolioReturn: number;
  benchmarkReturn: number;
  allocationEffect: number;
  selectionEffect: number;
  interactionEffect: number;
  totalEffect: number;
  color: string;
}

interface FactorContribution {
  factor: string;
  exposure: number;
  factorReturn: number;
  contribution: number;
  tStat: number;
  description: string;
  color: string;
}

interface RiskMetric {
  name: string;
  formula: string;
  value: number;
  benchmark: number;
  interpretation: string;
  higher_is_better: boolean;
  color: string;
}

interface DrawdownPeriod {
  start: number;
  trough: number;
  end: number;
  depth: number;
  recovery: number;
}

interface ManagerRecord {
  name: string;
  alpha: number;
  tStat: number;
  ir: number;
  years: number;
  aum: number;
  fees: string;
  quartile: number;
  skill: "high" | "moderate" | "low" | "luck";
  color: string;
}

// ── Static Data ────────────────────────────────────────────────────────────────

const SECTOR_COLORS: Record<string, string> = {
  Technology: "#6366f1",
  Healthcare: "#22c55e",
  Financials: "#f59e0b",
  Energy: "#ef4444",
  "Consumer Disc.": "#8b5cf6",
  Industrials: "#06b6d4",
  Materials: "#ec4899",
  Utilities: "#84cc16",
};

const SECTORS = [
  "Technology",
  "Healthcare",
  "Financials",
  "Energy",
  "Consumer Disc.",
  "Industrials",
  "Materials",
  "Utilities",
];

const FF5_FACTORS = [
  {
    factor: "Market (Mkt-RF)",
    description: "Excess return of market over risk-free rate",
    color: "#6366f1",
  },
  {
    factor: "Size (SMB)",
    description: "Small minus big — small-cap premium",
    color: "#22c55e",
  },
  {
    factor: "Value (HML)",
    description: "High minus low — value vs. growth premium",
    color: "#f59e0b",
  },
  {
    factor: "Profitability (RMW)",
    description: "Robust minus weak — operating profitability",
    color: "#ec4899",
  },
  {
    factor: "Investment (CMA)",
    description: "Conservative minus aggressive investment",
    color: "#06b6d4",
  },
];

const FIXED_INCOME_FACTORS = [
  { factor: "Duration", description: "Interest rate sensitivity", color: "#6366f1" },
  { factor: "Spread", description: "Credit spread contribution", color: "#ef4444" },
  { factor: "Curve", description: "Yield curve shape positioning", color: "#22c55e" },
  { factor: "Carry", description: "Coupon income minus financing", color: "#f59e0b" },
  { factor: "Roll", description: "Roll-down return along curve", color: "#8b5cf6" },
];

const RED_FLAGS = [
  {
    flag: "Cherry-picked start dates",
    detail: "Manager starts track record from a recent low to inflate returns",
    severity: "high",
  },
  {
    flag: "Benchmark mismatch",
    detail: "Using a low-risk benchmark to inflate alpha vs. a high-beta portfolio",
    severity: "high",
  },
  {
    flag: "Survivorship bias",
    detail: "Reporting only funds that survived, excluding closed/failed strategies",
    severity: "high",
  },
  {
    flag: "Return smoothing",
    detail: "Illiquid assets marked at stale prices, understating true volatility",
    severity: "medium",
  },
  {
    flag: "Style drift",
    detail: "Consistent style-box drift to chase performance without disclosure",
    severity: "medium",
  },
  {
    flag: "Fee layering",
    detail: "Funds of funds charging 2+2 on top of underlying 2+20 structures",
    severity: "medium",
  },
  {
    flag: "Window dressing",
    detail: "Buying winners and selling losers near quarter-end for appearance",
    severity: "low",
  },
  {
    flag: "GIPS non-compliance",
    detail: "Performance presented without composite definitions or disclosures",
    severity: "low",
  },
];

// ── Computed Data (seeded) ──────────────────────────────────────────────────────

function computeSectorAttribution(): SectorAttribution[] {
  resetSeed();
  const totalBenchReturn = 0.112; // 11.2% benchmark

  return SECTORS.map((sector) => {
    const bw = 0.06 + rand() * 0.16; // benchmark weight
    const pw = bw + (rand() - 0.5) * 0.08; // portfolio weight deviation
    const br = -0.05 + rand() * 0.28; // benchmark return
    const pr = br + (rand() - 0.4) * 0.12; // portfolio return

    // BHB formula
    const allocation = (pw - bw) * (br - totalBenchReturn);
    const selection = bw * (pr - br);
    const interaction = (pw - bw) * (pr - br);
    const total = allocation + selection + interaction;

    return {
      sector,
      portfolioWeight: Math.max(0.02, pw),
      benchmarkWeight: Math.max(0.02, bw),
      portfolioReturn: pr,
      benchmarkReturn: br,
      allocationEffect: allocation,
      selectionEffect: selection,
      interactionEffect: interaction,
      totalEffect: total,
      color: SECTOR_COLORS[sector],
    };
  });
}

function computeFF5Contributions(): FactorContribution[] {
  resetSeed();
  rand(); rand(); rand(); rand(); rand(); rand(); rand(); rand(); // advance past sector data

  return FF5_FACTORS.map(({ factor, description, color }) => {
    const exposure = -0.3 + rand() * 1.6;
    const factorReturn = -0.04 + rand() * 0.12;
    const contribution = exposure * factorReturn;
    const tStat = (rand() - 0.1) * 4.0;
    return { factor, exposure, factorReturn, contribution, tStat, description, color };
  });
}

function computeFIFactorContributions(): FactorContribution[] {
  resetSeed();
  // advance seed
  for (let i = 0; i < 40; i++) rand();

  return FIXED_INCOME_FACTORS.map(({ factor, description, color }) => {
    const exposure = 0.5 + rand() * 2.0;
    const factorReturn = -0.02 + rand() * 0.06;
    const contribution = exposure * factorReturn;
    const tStat = (rand() - 0.1) * 3.0;
    return { factor, exposure, factorReturn, contribution, tStat, description, color };
  });
}

function generateRollingSharpeSeries(): { x: number; y: number }[] {
  resetSeed();
  for (let i = 0; i < 60; i++) rand(); // advance
  const points: { x: number; y: number }[] = [];
  let level = 0.6 + rand() * 0.4;
  for (let i = 0; i < 24; i++) {
    level = level + (rand() - 0.48) * 0.3;
    level = Math.max(-0.5, Math.min(2.2, level));
    points.push({ x: i, y: level });
  }
  return points;
}

function generateDrawdownSeries(): { x: number; y: number }[] {
  resetSeed();
  for (let i = 0; i < 80; i++) rand();
  let price = 100;
  let peak = 100;
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < 60; i++) {
    price *= 1 + (rand() - 0.49) * 0.06;
    if (price > peak) peak = price;
    points.push({ x: i, y: ((price - peak) / peak) * 100 });
  }
  return points;
}

function computeManagerRecords(): ManagerRecord[] {
  resetSeed();
  for (let i = 0; i < 100; i++) rand();

  const managers = [
    "Alpha Capital", "Sigma Partners", "Quant Vision", "Meridian AM", "Vertex Growth",
  ];
  const skillLevels: Array<"high" | "moderate" | "low" | "luck"> = ["high", "moderate", "low", "luck"];
  const colors = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

  return managers.map((name, i) => {
    const alpha = -0.5 + rand() * 4.0;
    const years = 3 + Math.floor(rand() * 17);
    const tStat = alpha / (1.5 / Math.sqrt(years));
    const ir = alpha / (2 + rand() * 4);
    const aum = 200 + rand() * 4800;
    const fees = rand() > 0.5 ? "2 & 20" : "1 & 10";
    const quartile = 1 + Math.floor(rand() * 4);
    let skill: "high" | "moderate" | "low" | "luck";
    if (tStat > 2.0) skill = "high";
    else if (tStat > 1.0) skill = "moderate";
    else if (tStat > 0) skill = "low";
    else skill = "luck";
    void skillLevels; // suppress unused warning
    return { name, alpha, tStat, ir, years, aum, fees, quartile, skill, color: colors[i] };
  });
}

function computeFeeImpact(): { year: number; gross: number; net1: number; net2: number }[] {
  const results = [];
  let gross = 100, net1 = 100, net2 = 100;
  const annualReturn = 0.08;
  for (let y = 0; y <= 30; y++) {
    results.push({ year: y, gross, net1, net2 });
    gross *= 1 + annualReturn;
    net1 *= 1 + annualReturn - 0.01;
    net2 *= 1 + annualReturn - 0.02;
  }
  return results;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function FormulaCard({
  title,
  formula,
  description,
  color,
}: {
  title: string;
  formula: string;
  description: string;
  color: string;
}) {
  return (
    <div
      className="rounded-lg border p-4"
      style={{ borderColor: color + "40", background: color + "08" }}
    >
      <div className="text-xs font-semibold mb-1" style={{ color }}>
        {title}
      </div>
      <div
        className="font-mono text-sm bg-black/30 rounded px-2 py-1 mb-2"
        style={{ color: color + "ee" }}
      >
        {formula}
      </div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </div>
  );
}

function StatChip({
  label,
  value,
  color,
  up,
}: {
  label: string;
  value: string;
  color?: string;
  up?: boolean;
}) {
  return (
    <div className="flex flex-col items-center bg-muted/60 rounded-lg px-4 py-2 min-w-[90px]">
      <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
      <div
        className="text-base font-bold"
        style={{ color: color ?? (up === undefined ? "#e4e4e7" : up ? "#22c55e" : "#ef4444") }}
      >
        {value}
      </div>
    </div>
  );
}

function pct(v: number, decimals = 2) {
  return (v * 100).toFixed(decimals) + "%";
}
function bps(v: number) {
  return (v * 10000).toFixed(1) + "bp";
}
function fmt2(v: number) {
  return v.toFixed(2);
}

// ── Tab 1: BHB Attribution ─────────────────────────────────────────────────────

function BHBTab() {
  const sectors = useMemo(() => computeSectorAttribution(), []);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  const portfolioReturn = sectors.reduce((a, s) => a + s.portfolioWeight * s.portfolioReturn, 0);
  const benchmarkReturn = sectors.reduce((a, s) => a + s.benchmarkWeight * s.benchmarkReturn, 0);
  const activeReturn = portfolioReturn - benchmarkReturn;
  const totalAlloc = sectors.reduce((a, s) => a + s.allocationEffect, 0);
  const totalSel = sectors.reduce((a, s) => a + s.selectionEffect, 0);
  const totalInt = sectors.reduce((a, s) => a + s.interactionEffect, 0);

  const sel = selectedSector ? sectors.find((s) => s.sector === selectedSector) : null;

  // SVG waterfall
  const W = 620, H = 180;
  const barW = 52;
  const barGap = 18;
  const midY = H / 2;
  const scale = 1200; // pixels per unit return

  const bars = [
    { label: "Benchmark", value: benchmarkReturn, absolute: true, color: "#6366f1" },
    { label: "Allocation", value: totalAlloc, absolute: false, color: "#22c55e" },
    { label: "Selection", value: totalSel, absolute: false, color: "#f59e0b" },
    { label: "Interaction", value: totalInt, absolute: false, color: "#06b6d4" },
    { label: "Portfolio", value: portfolioReturn, absolute: true, color: "#8b5cf6" },
  ];

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="flex flex-wrap gap-3">
        <StatChip label="Portfolio Return" value={pct(portfolioReturn)} color="#8b5cf6" />
        <StatChip label="Benchmark Return" value={pct(benchmarkReturn)} color="#6366f1" />
        <StatChip
          label="Active Return"
          value={bps(activeReturn)}
          up={activeReturn > 0}
        />
        <StatChip
          label="Allocation Effect"
          value={bps(totalAlloc)}
          up={totalAlloc > 0}
        />
        <StatChip
          label="Selection Effect"
          value={bps(totalSel)}
          up={totalSel > 0}
        />
        <StatChip
          label="Interaction Effect"
          value={bps(totalInt)}
          up={totalInt > 0}
        />
      </div>

      {/* Waterfall SVG */}
      <Card className="border-border bg-card/60 border-l-4 border-l-primary">
        <CardHeader className="pb-2 p-4">
          <CardTitle className="text-lg font-semibold text-foreground">
            Return Decomposition — Waterfall
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox={`0 0 ${W} ${H + 40}`} className="w-full" style={{ maxHeight: 220 }}>
            {/* Grid */}
            {[-0.08, -0.04, 0, 0.04, 0.08, 0.12].map((v) => {
              const y = midY - v * scale;
              return (
                <g key={v}>
                  <line x1={20} x2={W - 10} y1={y} y2={y} stroke="#27272a" strokeWidth={1} />
                  <text x={18} y={y + 4} textAnchor="end" fill="#71717a" fontSize={9}>
                    {(v * 100).toFixed(0)}%
                  </text>
                </g>
              );
            })}
            {bars.map((bar, i) => {
              const x = 30 + i * (barW + barGap);
              let barY: number, barH: number;
              if (bar.absolute) {
                barH = Math.abs(bar.value) * scale;
                barY = bar.value >= 0 ? midY - barH : midY;
              } else {
                barH = Math.abs(bar.value) * scale;
                barY = bar.value >= 0 ? midY - barH : midY;
              }
              return (
                <g key={bar.label}>
                  <rect
                    x={x}
                    y={barY}
                    width={barW}
                    height={Math.max(2, barH)}
                    fill={bar.color}
                    opacity={0.85}
                    rx={3}
                  />
                  <text
                    x={x + barW / 2}
                    y={H + 30}
                    textAnchor="middle"
                    fill="#a1a1aa"
                    fontSize={9}
                  >
                    {bar.label}
                  </text>
                  <text
                    x={x + barW / 2}
                    y={barY - 4}
                    textAnchor="middle"
                    fill={bar.color}
                    fontSize={9}
                    fontWeight="bold"
                  >
                    {bps(bar.value)}
                  </text>
                </g>
              );
            })}
          </svg>
        </CardContent>
      </Card>

      {/* Sector breakdown table */}
      <Card className="border-border bg-card/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">
            Sector-Level Attribution — Click a row to inspect
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-muted-foreground">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-2 pr-3">Sector</th>
                  <th className="text-right py-2 px-2">Port Wt</th>
                  <th className="text-right py-2 px-2">Bmk Wt</th>
                  <th className="text-right py-2 px-2">Port Ret</th>
                  <th className="text-right py-2 px-2">Bmk Ret</th>
                  <th className="text-right py-2 px-2">Alloc</th>
                  <th className="text-right py-2 px-2">Select</th>
                  <th className="text-right py-2 px-2">Interact</th>
                  <th className="text-right py-2 px-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {sectors.map((s) => (
                  <tr
                    key={s.sector}
                    className="border-b border-border hover:bg-muted/40 cursor-pointer transition-colors"
                    style={
                      selectedSector === s.sector
                        ? { background: s.color + "18" }
                        : {}
                    }
                    onClick={() =>
                      setSelectedSector(selectedSector === s.sector ? null : s.sector)
                    }
                  >
                    <td className="py-2 pr-3">
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-2"
                        style={{ background: s.color }}
                      />
                      {s.sector}
                    </td>
                    <td className="text-right px-2">{pct(s.portfolioWeight)}</td>
                    <td className="text-right px-2 text-muted-foreground">{pct(s.benchmarkWeight)}</td>
                    <td
                      className="text-right px-2 font-medium"
                      style={{ color: s.portfolioReturn >= 0 ? "#22c55e" : "#ef4444" }}
                    >
                      {pct(s.portfolioReturn)}
                    </td>
                    <td className="text-right px-2 text-muted-foreground">{pct(s.benchmarkReturn)}</td>
                    <td
                      className="text-right px-2"
                      style={{ color: s.allocationEffect >= 0 ? "#22c55e" : "#ef4444" }}
                    >
                      {bps(s.allocationEffect)}
                    </td>
                    <td
                      className="text-right px-2"
                      style={{ color: s.selectionEffect >= 0 ? "#22c55e" : "#ef4444" }}
                    >
                      {bps(s.selectionEffect)}
                    </td>
                    <td
                      className="text-right px-2 text-muted-foreground"
                    >
                      {bps(s.interactionEffect)}
                    </td>
                    <td
                      className="text-right px-2 font-bold"
                      style={{ color: s.totalEffect >= 0 ? "#22c55e" : "#ef4444" }}
                    >
                      {bps(s.totalEffect)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-border font-medium text-foreground">
                  <td className="py-2 pr-3">TOTAL</td>
                  <td className="text-right px-2">{pct(sectors.reduce((a, s) => a + s.portfolioWeight, 0))}</td>
                  <td className="text-right px-2">{pct(sectors.reduce((a, s) => a + s.benchmarkWeight, 0))}</td>
                  <td className="text-right px-2" style={{ color: portfolioReturn >= 0 ? "#22c55e" : "#ef4444" }}>
                    {pct(portfolioReturn)}
                  </td>
                  <td className="text-right px-2">{pct(benchmarkReturn)}</td>
                  <td className="text-right px-2" style={{ color: totalAlloc >= 0 ? "#22c55e" : "#ef4444" }}>
                    {bps(totalAlloc)}
                  </td>
                  <td className="text-right px-2" style={{ color: totalSel >= 0 ? "#22c55e" : "#ef4444" }}>
                    {bps(totalSel)}
                  </td>
                  <td className="text-right px-2 text-muted-foreground">{bps(totalInt)}</td>
                  <td className="text-right px-2" style={{ color: activeReturn >= 0 ? "#22c55e" : "#ef4444" }}>
                    {bps(activeReturn)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Selected sector detail */}
      <AnimatePresence>
        {sel && (
          <motion.div
            key={sel.sector}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-border bg-card/80" style={{ borderColor: sel.color + "60" }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm" style={{ color: sel.color }}>
                  {sel.sector} — Worked Example
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="text-muted-foreground font-medium uppercase tracking-wide">Allocation Effect</div>
                    <div className="font-mono text-muted-foreground">
                      = (w_p − w_b) × (R_b,sector − R_b,total)
                    </div>
                    <div className="font-mono" style={{ color: sel.color }}>
                      = ({pct(sel.portfolioWeight)} − {pct(sel.benchmarkWeight)}) × ({pct(sel.benchmarkReturn)} − {pct(benchmarkReturn)})
                    </div>
                    <div className="font-medium text-sm" style={{ color: sel.allocationEffect >= 0 ? "#22c55e" : "#ef4444" }}>
                      = {bps(sel.allocationEffect)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-muted-foreground font-medium uppercase tracking-wide">Selection Effect</div>
                    <div className="font-mono text-muted-foreground">
                      = w_b × (R_p,sector − R_b,sector)
                    </div>
                    <div className="font-mono" style={{ color: sel.color }}>
                      = {pct(sel.benchmarkWeight)} × ({pct(sel.portfolioReturn)} − {pct(sel.benchmarkReturn)})
                    </div>
                    <div className="font-medium text-sm" style={{ color: sel.selectionEffect >= 0 ? "#22c55e" : "#ef4444" }}>
                      = {bps(sel.selectionEffect)}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-muted-foreground font-medium uppercase tracking-wide">Interaction Effect</div>
                  <div className="font-mono text-muted-foreground">
                    = (w_p − w_b) × (R_p,sector − R_b,sector) — combined active decisions
                  </div>
                  <div className="font-medium text-sm" style={{ color: "#06b6d4" }}>
                    = {bps(sel.interactionEffect)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formula cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormulaCard
          title="Allocation Effect"
          formula="(w_p − w_b) × (R_b,s − R_b)"
          description="Did the manager over/underweight sectors with good/bad relative benchmark performance?"
          color="#22c55e"
        />
        <FormulaCard
          title="Selection Effect"
          formula="w_b × (R_p,s − R_b,s)"
          description="Did the manager pick better securities within each sector than the benchmark?"
          color="#f59e0b"
        />
        <FormulaCard
          title="Interaction Effect"
          formula="(w_p − w_b) × (R_p,s − R_b,s)"
          description="Joint impact of active allocation AND selection decisions simultaneously."
          color="#06b6d4"
        />
      </div>

      {/* Currency attribution add-on */}
      <Card className="border-border bg-card/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            Currency Attribution Add-On (Global Portfolios)
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div className="space-y-2">
            <div className="text-muted-foreground font-medium uppercase tracking-wide">Currency Effect</div>
            <div className="font-mono bg-muted rounded px-3 py-2 text-amber-300">
              Currency = w_b × (FX_local − FX_base)
            </div>
            <p className="text-muted-foreground">
              Isolates the return contribution from currency movements independently from local asset returns.
              A manager can deliver strong local returns but negative total returns when the base currency strengthens.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-muted-foreground font-medium uppercase tracking-wide">Hedging Overlay Impact</div>
            <div className="font-mono bg-muted rounded px-3 py-2 text-primary">
              Overlay = Σ hedge_notional × (F_locked − spot)
            </div>
            <p className="text-muted-foreground">
              Measures the P&L from currency forwards and options used to hedge or express views.
              Reported separately to avoid contaminating security selection attribution.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 2: Factor Attribution ──────────────────────────────────────────────────

function FactorTab() {
  const ff5 = useMemo(() => computeFF5Contributions(), []);
  const fi = useMemo(() => computeFIFactorContributions(), []);

  const totalActiveReturn = ff5.reduce((a, f) => a + f.contribution, 0);
  const alpha = 0.024 - totalActiveReturn;
  const rSquared = 0.87;

  const maxAbs = Math.max(...ff5.map((f) => Math.abs(f.contribution)));
  const fiMaxAbs = Math.max(...fi.map((f) => Math.abs(f.contribution)));

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex flex-wrap gap-3">
        <StatChip label="Total Active Return" value={pct(totalActiveReturn)} up={totalActiveReturn > 0} />
        <StatChip label="Idiosyncratic Alpha" value={pct(alpha)} up={alpha > 0} />
        <StatChip label="R-Squared" value={(rSquared * 100).toFixed(1) + "%"} color="#6366f1" />
        <StatChip label="# Factors" value="5" color="#f59e0b" />
      </div>

      {/* FF5 bar chart */}
      <Card className="border-border bg-card/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Fama-French 5-Factor Contributions to Active Return
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox="0 0 600 200" className="w-full" style={{ maxHeight: 200 }}>
            {/* Zero line */}
            <line x1={200} x2={590} y1={0} y2={200} stroke="transparent" />
            {ff5.map((f, i) => {
              const y = 20 + i * 34;
              const barScale = 160 / maxAbs;
              const barLen = Math.abs(f.contribution) * barScale;
              const positive = f.contribution >= 0;
              return (
                <g key={f.factor}>
                  <text x={195} y={y + 12} textAnchor="end" fill="#a1a1aa" fontSize={10}>
                    {f.factor}
                  </text>
                  <rect
                    x={200}
                    y={y}
                    width={positive ? barLen : 0}
                    height={24}
                    fill={f.color}
                    opacity={0.85}
                    rx={3}
                  />
                  {!positive && (
                    <rect
                      x={200 - barLen}
                      y={y}
                      width={barLen}
                      height={24}
                      fill={f.color}
                      opacity={0.5}
                      rx={3}
                    />
                  )}
                  <text
                    x={positive ? 200 + barLen + 4 : 200 - barLen - 4}
                    y={y + 12}
                    textAnchor={positive ? "start" : "end"}
                    fill={f.color}
                    fontSize={10}
                    fontWeight="bold"
                  >
                    {bps(f.contribution)}
                  </text>
                  <text
                    x={positive ? 200 + barLen + 54 : 200 - barLen - 54}
                    y={y + 12}
                    textAnchor="middle"
                    fill="#71717a"
                    fontSize={9}
                  >
                    β={fmt2(f.exposure)} t={fmt2(f.tStat)}
                  </text>
                </g>
              );
            })}
            {/* Alpha row */}
            <g>
              <text x={195} y={190} textAnchor="end" fill="#f59e0b" fontSize={10}>
                Alpha (α)
              </text>
              {(() => {
                const barLen = Math.abs(alpha) * (160 / maxAbs);
                const positive = alpha >= 0;
                return (
                  <>
                    <rect
                      x={positive ? 200 : 200 - barLen}
                      y={175}
                      width={barLen}
                      height={18}
                      fill="#f59e0b"
                      opacity={positive ? 0.9 : 0.5}
                      rx={3}
                    />
                    <text
                      x={positive ? 200 + barLen + 4 : 200 - barLen - 4}
                      y={188}
                      textAnchor={positive ? "start" : "end"}
                      fill="#f59e0b"
                      fontSize={10}
                      fontWeight="bold"
                    >
                      {bps(alpha)}
                    </text>
                  </>
                );
              })()}
            </g>
          </svg>
        </CardContent>
      </Card>

      {/* Factor details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {ff5.map((f) => (
          <div
            key={f.factor}
            className="rounded-lg border p-3"
            style={{ borderColor: f.color + "40", background: f.color + "08" }}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="text-xs font-medium" style={{ color: f.color }}>
                {f.factor}
              </div>
              <Badge
                className="text-xs text-muted-foreground"
                style={{
                  background: f.contribution >= 0 ? "#22c55e30" : "#ef444430",
                  color: f.contribution >= 0 ? "#22c55e" : "#ef4444",
                  border: "none",
                }}
              >
                {bps(f.contribution)}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mb-2">{f.description}</div>
            <div className="grid grid-cols-3 gap-1 text-xs text-muted-foreground">
              <div>
                <div className="text-muted-foreground">Exposure</div>
                <div className="font-mono text-foreground">{fmt2(f.exposure)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Fac Ret</div>
                <div className="font-mono text-foreground">{pct(f.factorReturn)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">t-stat</div>
                <div
                  className="font-mono font-medium"
                  style={{
                    color: Math.abs(f.tStat) > 2 ? "#22c55e" : Math.abs(f.tStat) > 1 ? "#f59e0b" : "#ef4444",
                  }}
                >
                  {fmt2(f.tStat)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* R-squared and style box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Model Quality — R² = {(rSquared * 100).toFixed(1)}%
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>
              <span className="text-indigo-400 font-medium">R² = 0.87</span> means 87% of the
              portfolio&apos;s return variation is explained by the 5 systematic factors.
              The remaining 13% is idiosyncratic alpha or unmodeled risk.
            </p>
            <div className="space-y-1.5 mt-2">
              {[
                { range: "R² > 0.95", label: "Closet index — excessive factor overlap", color: "#ef4444" },
                { range: "R² 0.80–0.95", label: "Well-diversified active management", color: "#22c55e" },
                { range: "R² 0.60–0.80", label: "High conviction / concentrated strategy", color: "#f59e0b" },
                { range: "R² < 0.60", label: "Alternative / tail risk strategy", color: "#8b5cf6" },
              ].map(({ range, label, color }) => (
                <div key={range} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                  <span className="font-mono text-xs" style={{ color }}>{range}</span>
                  <span className="text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Style Box Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <svg viewBox="0 0 200 180" className="w-full max-w-xs mx-auto">
              {/* 3x3 grid */}
              {["Value", "Blend", "Growth"].map((col, ci) =>
                ["Large", "Mid", "Small"].map((row, ri) => {
                  const isActive = ci === 1 && ri === 0; // large blend portfolio
                  return (
                    <g key={`${col}-${row}`}>
                      <rect
                        x={10 + ci * 55}
                        y={30 + ri * 45}
                        width={52}
                        height={42}
                        fill={isActive ? "#6366f130" : "#27272a"}
                        stroke={isActive ? "#6366f1" : "#3f3f46"}
                        strokeWidth={isActive ? 2 : 1}
                        rx={3}
                      />
                      {isActive && (
                        <circle
                          cx={10 + ci * 55 + 26}
                          cy={30 + ri * 45 + 21}
                          r={12}
                          fill="#6366f1"
                          opacity={0.9}
                        />
                      )}
                    </g>
                  );
                })
              )}
              {/* Column labels */}
              {["Value", "Blend", "Growth"].map((col, ci) => (
                <text key={col} x={10 + ci * 55 + 26} y={22} textAnchor="middle" fill="#71717a" fontSize={9}>
                  {col}
                </text>
              ))}
              {["Large", "Mid", "Small"].map((row, ri) => (
                <text key={row} x={8} y={30 + ri * 45 + 24} textAnchor="end" fill="#71717a" fontSize={9}>
                  {row}
                </text>
              ))}
              <text x={100} y={170} textAnchor="middle" fill="#6366f1" fontSize={10} fontWeight="bold">
                Large-Cap Blend
              </text>
            </svg>
          </CardContent>
        </Card>
      </div>

      {/* Fixed income factor attribution */}
      <Card className="border-border bg-card/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-muted-foreground/50" />
            Fixed Income Factor Attribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox="0 0 600 160" className="w-full" style={{ maxHeight: 160 }}>
            {fi.map((f, i) => {
              const y = 15 + i * 28;
              const barScale = 140 / fiMaxAbs;
              const barLen = Math.abs(f.contribution) * barScale;
              const positive = f.contribution >= 0;
              return (
                <g key={f.factor}>
                  <text x={100} y={y + 12} textAnchor="end" fill="#a1a1aa" fontSize={10}>
                    {f.factor}
                  </text>
                  <rect
                    x={positive ? 105 : 105 - barLen}
                    y={y}
                    width={barLen}
                    height={20}
                    fill={f.color}
                    opacity={positive ? 0.85 : 0.5}
                    rx={3}
                  />
                  <text
                    x={positive ? 105 + barLen + 4 : 105 - barLen - 4}
                    y={y + 13}
                    textAnchor={positive ? "start" : "end"}
                    fill={f.color}
                    fontSize={10}
                    fontWeight="bold"
                  >
                    {bps(f.contribution)}
                  </text>
                  <text x={430} y={y + 13} fill="#52525b" fontSize={9}>
                    Exp: {fmt2(f.exposure)} | Fac: {pct(f.factorReturn)} | t: {fmt2(f.tStat)}
                  </text>
                </g>
              );
            })}
          </svg>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 3: Risk-Adjusted Metrics ──────────────────────────────────────────────

function RiskTab() {
  const rollingSharp = useMemo(() => generateRollingSharpeSeries(), []);
  const drawdown = useMemo(() => generateDrawdownSeries(), []);

  const metrics: RiskMetric[] = [
    {
      name: "Sharpe Ratio",
      formula: "(Rp − Rf) / σp",
      value: 1.24,
      benchmark: 0.87,
      interpretation: "Risk-adjusted return per unit of total volatility. >1.0 is good.",
      higher_is_better: true,
      color: "#6366f1",
    },
    {
      name: "Sortino Ratio",
      formula: "(Rp − Rf) / σ_downside",
      value: 1.87,
      benchmark: 1.21,
      interpretation: "Like Sharpe but penalizes only downside volatility. Favors asymmetric returns.",
      higher_is_better: true,
      color: "#22c55e",
    },
    {
      name: "Calmar Ratio",
      formula: "CAGR / |Max Drawdown|",
      value: 0.92,
      benchmark: 0.58,
      interpretation: "Annual return per unit of maximum drawdown. Key for trend-following strategies.",
      higher_is_better: true,
      color: "#f59e0b",
    },
    {
      name: "Information Ratio",
      formula: "(Rp − Rb) / TE",
      value: 0.71,
      benchmark: 0.0,
      interpretation: "Active return per unit of tracking error. >0.5 is strong consistent outperformance.",
      higher_is_better: true,
      color: "#8b5cf6",
    },
    {
      name: "Treynor Ratio",
      formula: "(Rp − Rf) / βp",
      value: 0.094,
      benchmark: 0.068,
      interpretation: "Return per unit of systematic (market) risk only. Useful for well-diversified portfolios.",
      higher_is_better: true,
      color: "#06b6d4",
    },
  ];

  // Drawdown analysis
  const maxDD = Math.min(...drawdown.map((p) => p.y));
  const ddDuration = drawdown.filter((p) => p.y < -1).length;

  const ddW = 580, ddH = 120;
  const ddXScale = ddW / (drawdown.length - 1);
  const ddYScale = ddH / 30; // -30% to 0%
  const ddPath = drawdown
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * ddXScale} ${ddH + p.y * ddYScale}`)
    .join(" ");

  const sharpW = 580, sharpH = 120;
  const sharpXScale = sharpW / (rollingSharp.length - 1);
  const sharpYMin = -0.5, sharpYMax = 2.5;
  const sharpYScale = sharpH / (sharpYMax - sharpYMin);
  const sharpPath = rollingSharp
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${i * sharpXScale} ${sharpH - (p.y - sharpYMin) * sharpYScale}`
    )
    .join(" ");

  return (
    <div className="space-y-4">
      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <Card key={m.name} className="border-border bg-card/60" style={{ borderColor: m.color + "30" }}>
            <CardContent className="pt-4 pb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium text-foreground">{m.name}</div>
                <div className="text-xl font-medium" style={{ color: m.color }}>
                  {m.value.toFixed(2)}
                </div>
              </div>
              <div
                className="font-mono text-xs text-muted-foreground rounded px-2 py-1 mb-2"
                style={{ background: m.color + "15", color: m.color + "cc" }}
              >
                {m.formula}
              </div>
              <div className="text-xs text-muted-foreground mb-3">{m.interpretation}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="text-muted-foreground">vs Benchmark:</span>
                <span
                  className="font-medium"
                  style={{
                    color:
                      m.value > m.benchmark
                        ? "#22c55e"
                        : m.value === m.benchmark
                        ? "#a1a1aa"
                        : "#ef4444",
                  }}
                >
                  {m.benchmark.toFixed(2)}
                </span>
                {m.value > m.benchmark ? (
                  <TrendingUp className="w-3 h-3 text-green-400" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                )}
              </div>
              {/* Bar comparison */}
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground w-12">Port</div>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (m.value / (m.value + m.benchmark + 0.1)) * 100)}%`,
                        background: m.color,
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground w-12">Bmk</div>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, (m.benchmark / (m.value + m.benchmark + 0.1)) * 100)}%`,
                        background: "#52525b",
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Drawdown chart */}
      <Card className="border-border bg-card/60">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-foreground">
              Drawdown Analysis
            </CardTitle>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <StatChip label="Max Drawdown" value={maxDD.toFixed(1) + "%"} up={false} />
              <StatChip label="DD Duration" value={ddDuration + " bars"} color="#f59e0b" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <svg viewBox={`0 0 ${ddW} ${ddH + 20}`} className="w-full" style={{ maxHeight: 140 }}>
            {/* Zero line */}
            <line x1={0} x2={ddW} y1={ddH} y2={ddH} stroke="#3f3f46" strokeWidth={1} />
            {/* Area fill */}
            <path
              d={`${ddPath} L ${(drawdown.length - 1) * ddXScale} ${ddH} L 0 ${ddH} Z`}
              fill="#ef444420"
            />
            <path d={ddPath} fill="none" stroke="#ef4444" strokeWidth={1.5} />
            {/* Y labels */}
            {[0, -5, -10, -15, -20].map((v) => (
              <g key={v}>
                <line x1={0} x2={ddW} y1={ddH + v * ddYScale} y2={ddH + v * ddYScale} stroke="#27272a" strokeWidth={0.5} />
                <text x={ddW - 2} y={ddH + v * ddYScale - 2} textAnchor="end" fill="#52525b" fontSize={8}>
                  {v}%
                </text>
              </g>
            ))}
          </svg>
        </CardContent>
      </Card>

      {/* Rolling Sharpe */}
      <Card className="border-border bg-card/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Rolling 12-Month Sharpe Ratio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox={`0 0 ${sharpW} ${sharpH + 20}`} className="w-full" style={{ maxHeight: 140 }}>
            {/* Grid */}
            {[0, 0.5, 1.0, 1.5, 2.0].map((v) => {
              const y = sharpH - (v - sharpYMin) * sharpYScale;
              return (
                <g key={v}>
                  <line x1={0} x2={sharpW} y1={y} y2={y} stroke="#27272a" strokeWidth={0.5} />
                  <text x={sharpW - 2} y={y - 2} textAnchor="end" fill="#52525b" fontSize={8}>
                    {v.toFixed(1)}
                  </text>
                </g>
              );
            })}
            {/* Sharpe=1 reference */}
            <line
              x1={0}
              x2={sharpW}
              y1={sharpH - (1.0 - sharpYMin) * sharpYScale}
              y2={sharpH - (1.0 - sharpYMin) * sharpYScale}
              stroke="#22c55e"
              strokeWidth={1}
              strokeDasharray="4 4"
              opacity={0.5}
            />
            <path d={sharpPath} fill="none" stroke="#6366f1" strokeWidth={2} />
            {rollingSharp.map((p, i) => (
              <circle
                key={i}
                cx={i * sharpXScale}
                cy={sharpH - (p.y - sharpYMin) * sharpYScale}
                r={2.5}
                fill={p.y >= 1.0 ? "#22c55e" : p.y >= 0 ? "#f59e0b" : "#ef4444"}
              />
            ))}
          </svg>
        </CardContent>
      </Card>

      {/* Benchmark impact note */}
      <Card className="border-border bg-card/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-muted-foreground/50" />
            Benchmark Selection Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-2">
          <p>
            All risk-adjusted metrics are highly sensitive to benchmark choice.
            A manager with beta 1.2 who uses a low-volatility benchmark will appear to have
            superior Sharpe and Information Ratios artificially.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
            {[
              { bmk: "S&P 500 (β≈1.0)", ir: "0.71", sharpe: "1.24", color: "#6366f1" },
              { bmk: "Russell 2000 (β≈1.3)", ir: "0.42", sharpe: "0.98", color: "#f59e0b" },
              { bmk: "T-Bill (β≈0)", ir: "2.10", sharpe: "1.24", color: "#22c55e" },
            ].map(({ bmk, ir, sharpe, color }) => (
              <div key={bmk} className="rounded-lg border border-border p-3" style={{ borderColor: color + "40" }}>
                <div className="font-medium text-xs mb-1" style={{ color }}>{bmk}</div>
                <div>IR: <span className="font-medium text-foreground">{ir}</span></div>
                <div>Sharpe: <span className="font-medium text-foreground">{sharpe}</span></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 4: Manager Evaluation ─────────────────────────────────────────────────

function ManagerTab() {
  const managers = useMemo(() => computeManagerRecords(), []);
  const feeData = useMemo(() => computeFeeImpact(), []);
  const [expandedFlag, setExpandedFlag] = useState<string | null>(null);

  const minTrackRecord = (alpha: number, ir: number) => {
    // Minimum years for t-stat > 2 at given IR
    return Math.ceil((2 / ir) ** 2);
  };

  // Quartile persistence SVG
  const flowW = 320, flowH = 200;
  const quartileColors = ["#22c55e", "#84cc16", "#f59e0b", "#ef4444"];

  // Fee chart
  const feeW = 560, feeH = 160;
  const maxFee = feeData[feeData.length - 1].gross;
  const feeXScale = feeW / 30;
  const feeYScale = feeH / maxFee;

  const grossPath = feeData
    .map((d, i) => `${i === 0 ? "M" : "L"} ${i * feeXScale} ${feeH - d.gross * feeYScale}`)
    .join(" ");
  const net1Path = feeData
    .map((d, i) => `${i === 0 ? "M" : "L"} ${i * feeXScale} ${feeH - d.net1 * feeYScale}`)
    .join(" ");
  const net2Path = feeData
    .map((d, i) => `${i === 0 ? "M" : "L"} ${i * feeXScale} ${feeH - d.net2 * feeYScale}`)
    .join(" ");

  const gipsRequirements = [
    "Define and maintain composites of similar mandates",
    "Include all discretionary fee-paying portfolios in at least one composite",
    "Present performance for minimum 5 years (or since inception)",
    "Calculate returns using time-weighted rate of return",
    "Calculate and disclose dispersion of composite returns",
    "Present compliant history with >= 1 composite in every presented period",
    "Disclose composite creation date and number of portfolios",
    "List and describe all composites available upon request",
  ];

  return (
    <div className="space-y-4">
      {/* Manager comparison table */}
      <Card className="border-border bg-card/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            Peer Group Comparison — Manager Universe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-muted-foreground">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-2 pr-3">Manager</th>
                  <th className="text-right py-2 px-2">Alpha</th>
                  <th className="text-right py-2 px-2">t-stat</th>
                  <th className="text-right py-2 px-2">IR</th>
                  <th className="text-right py-2 px-2">Years</th>
                  <th className="text-right py-2 px-2">Min Track Rec</th>
                  <th className="text-right py-2 px-2">AUM ($M)</th>
                  <th className="text-right py-2 px-2">Fees</th>
                  <th className="text-right py-2 px-2">Quartile</th>
                  <th className="text-right py-2 px-2">Skill Verdict</th>
                </tr>
              </thead>
              <tbody>
                {managers.map((m) => {
                  const mtr = minTrackRecord(m.alpha, Math.abs(m.ir) + 0.01);
                  const hasSufficientTrack = m.years >= mtr;
                  const skillColor = {
                    high: "#22c55e",
                    moderate: "#f59e0b",
                    low: "#f59e0b",
                    luck: "#ef4444",
                  }[m.skill];
                  return (
                    <tr key={m.name} className="border-b border-border hover:bg-muted/40">
                      <td className="py-2 pr-3">
                        <span
                          className="inline-block w-2 h-2 rounded-full mr-2"
                          style={{ background: m.color }}
                        />
                        {m.name}
                      </td>
                      <td
                        className="text-right px-2 font-medium"
                        style={{ color: m.alpha >= 0 ? "#22c55e" : "#ef4444" }}
                      >
                        {pct(m.alpha / 100)}
                      </td>
                      <td
                        className="text-right px-2 font-mono"
                        style={{
                          color:
                            Math.abs(m.tStat) > 2
                              ? "#22c55e"
                              : Math.abs(m.tStat) > 1
                              ? "#f59e0b"
                              : "#ef4444",
                        }}
                      >
                        {m.tStat.toFixed(2)}
                      </td>
                      <td className="text-right px-2">{m.ir.toFixed(2)}</td>
                      <td className="text-right px-2">{m.years}y</td>
                      <td
                        className="text-right px-2"
                        style={{ color: hasSufficientTrack ? "#22c55e" : "#f59e0b" }}
                      >
                        {mtr}y {hasSufficientTrack ? "✓" : "—"}
                      </td>
                      <td className="text-right px-2 text-muted-foreground">${m.aum.toFixed(0)}M</td>
                      <td className="text-right px-2 text-muted-foreground">{m.fees}</td>
                      <td className="text-right px-2">
                        <Badge
                          className="text-xs text-muted-foreground"
                          style={{
                            background: quartileColors[m.quartile - 1] + "30",
                            color: quartileColors[m.quartile - 1],
                            border: "none",
                          }}
                        >
                          Q{m.quartile}
                        </Badge>
                      </td>
                      <td className="text-right px-2">
                        <Badge
                          className="text-xs text-muted-foreground capitalize"
                          style={{
                            background: skillColor + "20",
                            color: skillColor,
                            border: "none",
                          }}
                        >
                          {m.skill}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            Skill verdict requires t-stat &gt; 2.0 (statistically significant at 95% confidence).
            Minimum track record = (2 / IR)² years required to distinguish skill from noise.
          </div>
        </CardContent>
      </Card>

      {/* Performance persistence SVG */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Performance Persistence — Quartile Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <svg viewBox={`0 0 ${flowW} ${flowH}`} className="w-full" style={{ maxHeight: 200 }}>
              {/* Period 1 quartiles */}
              {[0, 1, 2, 3].map((q) => (
                <g key={q}>
                  <rect x={10} y={10 + q * 45} width={80} height={38} fill={quartileColors[q]} opacity={0.7} rx={4} />
                  <text x={50} y={34 + q * 45} textAnchor="middle" fill="white" fontSize={11} fontWeight="bold">
                    Q{q + 1}
                  </text>
                </g>
              ))}
              {/* Period 2 quartiles */}
              {[0, 1, 2, 3].map((q) => (
                <g key={q}>
                  <rect x={230} y={10 + q * 45} width={80} height={38} fill={quartileColors[q]} opacity={0.7} rx={4} />
                  <text x={270} y={34 + q * 45} textAnchor="middle" fill="white" fontSize={11} fontWeight="bold">
                    Q{q + 1}
                  </text>
                </g>
              ))}
              {/* Period labels */}
              <text x={50} y={8} textAnchor="middle" fill="#71717a" fontSize={9}>Period 1</text>
              <text x={270} y={8} textAnchor="middle" fill="#71717a" fontSize={9}>Period 2</text>
              {/* Flow lines (persistence = random) */}
              {[
                { fromQ: 0, toQ: 0, pct: 28 },
                { fromQ: 0, toQ: 1, pct: 25 },
                { fromQ: 0, toQ: 2, pct: 24 },
                { fromQ: 0, toQ: 3, pct: 23 },
                { fromQ: 1, toQ: 0, pct: 26 },
                { fromQ: 1, toQ: 1, pct: 27 },
                { fromQ: 1, toQ: 2, pct: 24 },
                { fromQ: 1, toQ: 3, pct: 23 },
                { fromQ: 2, toQ: 0, pct: 24 },
                { fromQ: 2, toQ: 1, pct: 24 },
                { fromQ: 2, toQ: 2, pct: 27 },
                { fromQ: 2, toQ: 3, pct: 25 },
                { fromQ: 3, toQ: 0, pct: 22 },
                { fromQ: 3, toQ: 1, pct: 24 },
                { fromQ: 3, toQ: 2, pct: 25 },
                { fromQ: 3, toQ: 3, pct: 29 },
              ].map(({ fromQ, toQ, pct: p }, idx) => (
                <line
                  key={idx}
                  x1={90}
                  y1={29 + fromQ * 45}
                  x2={230}
                  y2={29 + toQ * 45}
                  stroke={quartileColors[toQ]}
                  strokeWidth={p / 8}
                  opacity={0.4}
                />
              ))}
              <text x={160} y={195} textAnchor="middle" fill="#52525b" fontSize={9}>
                Near-random flow → little persistence evidence
              </text>
            </svg>
          </CardContent>
        </Card>

        {/* Skill vs luck framework */}
        <Card className="border-border bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              Skill vs Luck Framework
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-3">
            <div className="rounded-lg border border-border p-3 space-y-1">
              <div className="font-medium text-foreground">Alpha t-statistic</div>
              <div className="font-mono text-indigo-300">t = α / (σ_α / √T)</div>
              <p>Measures statistical significance. Need t &gt; 2.0 for 95% confidence that alpha is not zero.</p>
            </div>
            <div className="rounded-lg border border-border p-3 space-y-1">
              <div className="font-medium text-foreground">Minimum Track Record (MTR)</div>
              <div className="font-mono text-indigo-300">MTR = (z_α / IR)² years</div>
              <p>A manager with IR = 0.5 needs (2/0.5)² = 16 years of track record to confirm skill with 95% confidence.</p>
            </div>
            <div className="rounded-lg border border-border p-3 space-y-1">
              <div className="font-medium text-foreground">Luck Threshold</div>
              <p>
                Given 1,000 managers all with zero skill, ~23 will have t-stat &gt; 2.0 purely by chance in any 5-year period.
                Universe-relative evaluation is essential.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee impact SVG */}
      <Card className="border-border bg-card/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-red-400" />
            Fee Impact — 8% Gross Return, 30-Year Compound
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-green-400" />
              <span className="text-muted-foreground">Gross: ${feeData[30].gross.toFixed(0)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-yellow-400" />
              <span className="text-muted-foreground">1% fee: ${feeData[30].net1.toFixed(0)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-red-400" />
              <span className="text-muted-foreground">2% fee: ${feeData[30].net2.toFixed(0)}</span>
            </div>
          </div>
          <svg viewBox={`0 0 ${feeW} ${feeH + 20}`} className="w-full" style={{ maxHeight: 180 }}>
            {/* Grid */}
            {[0, 250, 500, 750, 1000].map((v) => {
              const y = feeH - v * feeYScale;
              return (
                <g key={v}>
                  <line x1={0} x2={feeW} y1={y} y2={y} stroke="#27272a" strokeWidth={0.5} />
                  <text x={feeW - 2} y={y - 2} textAnchor="end" fill="#52525b" fontSize={8}>
                    ${v}
                  </text>
                </g>
              );
            })}
            <path d={grossPath} fill="none" stroke="#22c55e" strokeWidth={2} />
            <path d={net1Path} fill="none" stroke="#f59e0b" strokeWidth={2} />
            <path d={net2Path} fill="none" stroke="#ef4444" strokeWidth={2} />
            {/* Fill area between gross and net2 */}
            <path
              d={`${grossPath} ${net2Path.replace("M", "L").split("").reverse().join("")}`}
              fill="#ef444415"
            />
            {/* Year labels */}
            {[0, 5, 10, 15, 20, 25, 30].map((y) => (
              <text
                key={y}
                x={y * feeXScale}
                y={feeH + 14}
                textAnchor="middle"
                fill="#52525b"
                fontSize={8}
              >
                Y{y}
              </text>
            ))}
          </svg>
          <div className="mt-2 text-xs text-muted-foreground">
            A 2% fee drag reduces terminal wealth by{" "}
            <span className="text-red-400 font-medium">
              ${(feeData[30].gross - feeData[30].net2).toFixed(0)}
            </span>{" "}
            on a $100 initial investment over 30 years — nearly{" "}
            <span className="text-red-400 font-medium">
              {(((feeData[30].gross - feeData[30].net2) / feeData[30].gross) * 100).toFixed(0)}%
            </span>{" "}
            of gross terminal wealth.
          </div>
        </CardContent>
      </Card>

      {/* GIPS compliance */}
      <Card className="border-border bg-card/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            GIPS Compliance Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {gipsRequirements.map((req, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>{req}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Red flags */}
      <Card className="border-border bg-card/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Red Flags in Performance Reporting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {RED_FLAGS.map((flag) => {
            const isExpanded = expandedFlag === flag.flag;
            const severityColor =
              flag.severity === "high"
                ? "#ef4444"
                : flag.severity === "medium"
                ? "#f59e0b"
                : "#84cc16";
            return (
              <div
                key={flag.flag}
                className="rounded-lg border cursor-pointer overflow-hidden"
                style={{ borderColor: severityColor + "40" }}
                onClick={() => setExpandedFlag(isExpanded ? null : flag.flag)}
              >
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: severityColor }} />
                    <span className="text-xs font-medium text-foreground">{flag.flag}</span>
                    <Badge
                      className="text-xs text-muted-foreground capitalize"
                      style={{
                        background: severityColor + "20",
                        color: severityColor,
                        border: "none",
                      }}
                    >
                      {flag.severity}
                    </Badge>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <div className="px-3 pb-3 text-xs text-muted-foreground border-t border-border pt-2">
                        {flag.detail}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function PerfAttributionPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-medium text-foreground">Investment Performance Attribution</h1>
            <p className="text-xs text-muted-foreground">
              BHB decomposition · Factor attribution · Risk metrics · Manager evaluation
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            { label: "BHB Model", color: "#6366f1" },
            { label: "Fama-French 5", color: "#22c55e" },
            { label: "Sharpe/Sortino/Calmar", color: "#f59e0b" },
            { label: "GIPS", color: "#06b6d4" },
          ].map(({ label, color }) => (
            <Badge
              key={label}
              className="text-xs text-muted-foreground"
              style={{ background: color + "20", color, border: "none" }}
            >
              {label}
            </Badge>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="bhb">
        <TabsList className="bg-card border border-border mb-6">
          <TabsTrigger value="bhb" className="data-[state=active]:bg-muted text-xs text-muted-foreground">
            <Layers className="w-3.5 h-3.5 mr-1.5" />
            BHB Attribution
          </TabsTrigger>
          <TabsTrigger value="factor" className="data-[state=active]:bg-muted text-xs text-muted-foreground">
            <Activity className="w-3.5 h-3.5 mr-1.5" />
            Factor Attribution
          </TabsTrigger>
          <TabsTrigger value="risk" className="data-[state=active]:bg-muted text-xs text-muted-foreground">
            <Percent className="w-3.5 h-3.5 mr-1.5" />
            Risk-Adjusted Metrics
          </TabsTrigger>
          <TabsTrigger value="manager" className="data-[state=active]:bg-muted text-xs text-muted-foreground">
            <Award className="w-3.5 h-3.5 mr-1.5" />
            Manager Evaluation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bhb" className="data-[state=inactive]:hidden">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <BHBTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="factor" className="data-[state=inactive]:hidden">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FactorTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="risk" className="data-[state=inactive]:hidden">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <RiskTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="manager" className="data-[state=inactive]:hidden">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ManagerTab />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
