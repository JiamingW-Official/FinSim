"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  TrendingUp,
  DollarSign,
  Target,
  Shield,
  BarChart3,
  PieChart,
  Layers,
  Flame,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  ArrowRight,
  Zap,
  Home,
  Building2,
  Briefcase,
  CreditCard,
  Star,
  ChevronRight,
  TreePine,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── PRNG ──────────────────────────────────────────────────────────────────────
let s = 29;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number, digits = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

function fmtK(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return fmt(n);
}

function fmtPct(n: number, d = 1): string {
  return `${n.toFixed(d)}%`;
}

function calcFV(pv: number, pmt: number, rAnnual: number, years: number): number {
  if (rAnnual === 0) return pv + pmt * 12 * years;
  const r = rAnnual / 100 / 12;
  const n = years * 12;
  return pv * Math.pow(1 + r, n) + pmt * ((Math.pow(1 + r, n) - 1) / r);
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 1: Wealth Accumulation Calculator
// ─────────────────────────────────────────────────────────────────────────────

function StackedAreaChart({
  contributions,
  growth,
  years,
  width = 600,
  height = 200,
}: {
  contributions: number[];
  growth: number[];
  years: number;
  width?: number;
  height?: number;
}) {
  const vw = width;
  const vh = height;
  const pad = { top: 16, right: 16, bottom: 28, left: 60 };
  const cw = vw - pad.left - pad.right;
  const ch = vh - pad.top - pad.bottom;

  const maxVal = Math.max(...contributions.map((c, i) => c + growth[i]), 1);

  const toX = (i: number) => pad.left + (i / (contributions.length - 1)) * cw;
  const toY = (v: number) => pad.top + ch - (v / maxVal) * ch;

  const contribPoints = contributions.map((c, i) => `${toX(i)},${toY(c)}`).join(" ");
  const totalPoints = contributions.map((c, i) => `${toX(i)},${toY(c + growth[i])}`).join(" ");
  const baselineLeft = `${pad.left},${toY(0)}`;
  const baselineRight = `${pad.left + cw},${toY(0)}`;

  // Growth area: top line (total) + reversed contrib line
  const growthArea =
    `M ${totalPoints.split(" ")[0]} L ${totalPoints} L ${contribPoints.split(" ").reverse().join(" ")} Z`;
  const contribArea = `M ${baselineLeft} L ${contribPoints} L ${baselineRight} Z`;

  // Y-axis labels
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({ v: t * maxVal, y: toY(t * maxVal) }));
  // X-axis labels
  const xStep = Math.ceil(years / 4);
  const xTicks: { label: string; x: number }[] = [];
  for (let y = 0; y <= years; y += xStep) {
    const idx = Math.round((y / years) * (contributions.length - 1));
    xTicks.push({ label: `Yr ${y}`, x: toX(idx) });
  }

  return (
    <svg viewBox={`0 0 ${vw} ${vh}`} className="w-full" style={{ height: vh }}>
      <defs>
        <linearGradient id="wbContribGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="wbGrowthGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={pad.left} y1={t.y} x2={pad.left + cw} y2={t.y} stroke="#374151" strokeWidth="1" strokeDasharray="3 3" />
          <text x={pad.left - 6} y={t.y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">
            {fmtK(t.v)}
          </text>
        </g>
      ))}

      {/* Areas */}
      <path d={contribArea} fill="url(#wbContribGrad)" />
      <path d={growthArea} fill="url(#wbGrowthGrad)" />

      {/* Lines */}
      <polyline points={contribPoints} fill="none" stroke="#3b82f6" strokeWidth="2" />
      <polyline points={totalPoints} fill="none" stroke="#10b981" strokeWidth="2" />

      {/* X ticks */}
      {xTicks.map((t, i) => (
        <text key={i} x={t.x} y={vh - 6} textAnchor="middle" fontSize="10" fill="#9ca3af">
          {t.label}
        </text>
      ))}
    </svg>
  );
}

function EarlyStartChart() {
  const scenarios = [
    { label: "Start at 22", startAge: 22, color: "#10b981" },
    { label: "Start at 32", startAge: 32, color: "#f59e0b" },
    { label: "Start at 42", startAge: 42, color: "#ef4444" },
  ];
  const retireAge = 65;
  const monthly = 500;
  const rate = 8;

  const series = scenarios.map((sc) => {
    const years = retireAge - sc.startAge;
    const fv = calcFV(0, monthly, rate, years);
    return { ...sc, fv, years };
  });

  const maxFV = Math.max(...series.map((s) => s.fv));

  const vw = 520;
  const vh = 180;
  const pad = { top: 16, right: 16, bottom: 36, left: 72 };
  const cw = vw - pad.left - pad.right;
  const ch = vh - pad.top - pad.bottom;
  const barH = 36;
  const barGap = 10;

  return (
    <svg viewBox={`0 0 ${vw} ${vh}`} className="w-full" style={{ height: vh }}>
      {series.map((sc, i) => {
        const bw = (sc.fv / maxFV) * cw;
        const y = pad.top + i * (barH + barGap);
        return (
          <g key={i}>
            <rect x={pad.left} y={y} width={bw} height={barH} rx="4" fill={sc.color} fillOpacity="0.8" />
            <text x={pad.left - 6} y={y + barH / 2 + 4} textAnchor="end" fontSize="11" fill="#d1d5db">
              {sc.label}
            </text>
            <text x={pad.left + bw + 6} y={y + barH / 2 + 4} fontSize="11" fill={sc.color} fontWeight="600">
              {fmtK(sc.fv)}
            </text>
          </g>
        );
      })}
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + ch + 16} stroke="#4b5563" strokeWidth="1" />
    </svg>
  );
}

function WealthAccumulationTab() {
  const [startingCapital, setStartingCapital] = useState(10000);
  const [monthlyContrib, setMonthlyContrib] = useState(500);
  const [returnRate, setReturnRate] = useState(8);
  const [years, setYears] = useState(20);
  const [inflationAdj, setInflationAdj] = useState(false);
  const inflation = 3;

  const scenarios = useMemo(
    () => [
      { label: "Conservative", rate: 6, color: "#3b82f6" },
      { label: "Moderate", rate: 8, color: "#10b981" },
      { label: "Aggressive", rate: 11, color: "#f59e0b" },
    ],
    []
  );

  const fvMain = useMemo(() => calcFV(startingCapital, monthlyContrib, returnRate, years), [startingCapital, monthlyContrib, returnRate, years]);
  const totalContribs = startingCapital + monthlyContrib * 12 * years;
  const growthAmount = fvMain - totalContribs;
  const inflFV = inflationAdj ? fvMain / Math.pow(1 + inflation / 100, years) : fvMain;

  // Build data series for stacked area (yearly)
  const dataPoints = useMemo(() => {
    const contribs: number[] = [];
    const growth: number[] = [];
    for (let yr = 0; yr <= years; yr++) {
      const fv = calcFV(startingCapital, monthlyContrib, returnRate, yr);
      const totalC = startingCapital + monthlyContrib * 12 * yr;
      contribs.push(totalC);
      growth.push(Math.max(0, fv - totalC));
    }
    return { contribs, growth };
  }, [startingCapital, monthlyContrib, returnRate, years]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Controls */}
        <Card className="lg:col-span-1 p-5 bg-card border-border space-y-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Parameters</h3>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Starting Capital</span>
              <span className="text-foreground font-semibold">{fmt(startingCapital)}</span>
            </div>
            <Slider min={0} max={500000} step={1000} value={[startingCapital]} onValueChange={([v]) => setStartingCapital(v)} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monthly Contribution</span>
              <span className="text-foreground font-semibold">{fmt(monthlyContrib)}</span>
            </div>
            <Slider min={0} max={5000} step={50} value={[monthlyContrib]} onValueChange={([v]) => setMonthlyContrib(v)} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Annual Return</span>
              <span className="text-foreground font-medium">{fmtPct(returnRate)}</span>
            </div>
            <Slider min={1} max={15} step={0.5} value={[returnRate]} onValueChange={([v]) => setReturnRate(v)} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Time Horizon</span>
              <span className="text-foreground font-medium">{years} years</span>
            </div>
            <Slider min={1} max={40} step={1} value={[years]} onValueChange={([v]) => setYears(v)} />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-sm text-muted-foreground">Inflation-Adjusted (3%)</span>
            <Switch checked={inflationAdj} onCheckedChange={setInflationAdj} />
          </div>
        </Card>

        {/* Results */}
        <Card className="lg:col-span-2 p-5 bg-card border-border space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-muted rounded-md p-4 text-center">
              <div className="text-xs text-muted-foreground mb-1">Future Value</div>
              <div className="text-xl font-bold text-green-400">{fmtK(inflFV)}</div>
              {inflationAdj && <div className="text-xs text-muted-foreground mt-1">real dollars</div>}
            </div>
            <div className="bg-muted rounded-md p-4 text-center">
              <div className="text-xs text-muted-foreground mb-1">Total Contributions</div>
              <div className="text-xl font-bold text-primary">{fmtK(totalContribs)}</div>
            </div>
            <div className="bg-muted rounded-md p-4 text-center">
              <div className="text-xs text-muted-foreground mb-1">Market Growth</div>
              <div className="text-xl font-medium text-emerald-400">{fmtK(growthAmount)}</div>
            </div>
          </div>

          {/* Stacked Area Chart */}
          <div className="bg-muted/60 rounded-md p-3">
            <div className="flex gap-4 text-xs text-muted-foreground mb-2">
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded bg-primary/70" /> Contributions</span>
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded bg-emerald-500/70" /> Growth</span>
            </div>
            <StackedAreaChart contributions={dataPoints.contribs} growth={dataPoints.growth} years={years} height={160} />
          </div>

          {/* 3 Scenarios */}
          <div>
            <div className="text-xs text-muted-foreground mb-2 font-medium">Scenario Comparison (same inputs, different return rates)</div>
            <div className="grid grid-cols-3 gap-2">
              {scenarios.map((sc) => {
                const fv = calcFV(startingCapital, monthlyContrib, sc.rate, years);
                return (
                  <div key={sc.label} className="bg-muted rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground">{sc.label} ({sc.rate}%)</div>
                    <div className="text-sm font-medium mt-1" style={{ color: sc.color }}>{fmtK(fv)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Power of Starting Early */}
      <Card className="p-5 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} className="text-yellow-400" />
          <h3 className="text-sm font-medium text-foreground">Power of Starting Early — $500/month at 8%</h3>
        </div>
        <EarlyStartChart />
        <p className="text-xs text-muted-foreground mt-2">Starting 10 years earlier can more than double your retirement wealth due to compound interest.</p>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 2: Net Worth Tracker
// ─────────────────────────────────────────────────────────────────────────────

interface AssetLiability {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}

const NET_WORTH_MILESTONES = [
  { label: "$100K", value: 100_000, emoji: "🌱" },
  { label: "$250K", value: 250_000, emoji: "🌿" },
  { label: "$500K", value: 500_000, emoji: "🌳" },
  { label: "$1M", value: 1_000_000, emoji: "💎" },
  { label: "$5M", value: 5_000_000, emoji: "🏆" },
];

// Percentile table: [networth_by_age_bracket]
const PERCENTILE_DATA: Record<string, { p25: number; p50: number; p75: number; p90: number }> = {
  "20-29": { p25: 2_000, p50: 8_000, p75: 40_000, p90: 100_000 },
  "30-39": { p25: 15_000, p50: 55_000, p75: 180_000, p90: 450_000 },
  "40-49": { p25: 30_000, p50: 130_000, p75: 400_000, p90: 900_000 },
  "50-59": { p25: 50_000, p50: 230_000, p75: 640_000, p90: 1_500_000 },
  "60-69": { p25: 80_000, p50: 350_000, p75: 900_000, p90: 2_200_000 },
};

function getPercentileLabel(nw: number, ageBracket: string): string {
  const data = PERCENTILE_DATA[ageBracket];
  if (!data) return "N/A";
  if (nw < data.p25) return "Below 25th";
  if (nw < data.p50) return "25th–50th";
  if (nw < data.p75) return "50th–75th";
  if (nw < data.p90) return "75th–90th";
  return "Top 10%";
}

function DonutChart({ assets, liabilities }: { assets: number; liabilities: number }) {
  const total = assets + liabilities || 1;
  const assetPct = assets / total;
  const cx = 70;
  const cy = 70;
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const assetArc = assetPct * circumference;

  return (
    <svg viewBox="0 0 140 140" className="w-full" style={{ maxWidth: 160 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#374151" strokeWidth="18" />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#ef4444"
        strokeWidth="18"
        strokeDasharray={`${circumference - assetArc} ${assetArc}`}
        strokeDashoffset={0}
        transform={`rotate(${-90 + assetPct * 360} ${cx} ${cy})`}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#10b981"
        strokeWidth="18"
        strokeDasharray={`${assetArc} ${circumference - assetArc}`}
        strokeDashoffset={0}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="9" fill="#9ca3af">Net Worth</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize="9" fill="#9ca3af">Assets vs Liabilities</text>
    </svg>
  );
}

function NetWorthTab() {
  const [assets, setAssets] = useState<Record<string, number>>({
    cash: 25000,
    investments: 80000,
    realEstate: 300000,
    retirement: 120000,
    other: 15000,
  });

  const [liabilities, setLiabilities] = useState<Record<string, number>>({
    mortgage: 220000,
    carLoans: 18000,
    studentLoans: 35000,
    creditCards: 5000,
    other: 3000,
  });

  const [ageBracket, setAgeBracket] = useState("30-39");

  const totalAssets = Object.values(assets).reduce((a, b) => a + b, 0);
  const totalLiabilities = Object.values(liabilities).reduce((a, b) => a + b, 0);
  const netWorth = totalAssets - totalLiabilities;

  const assetItems: AssetLiability[] = [
    { label: "Cash / Savings", value: assets.cash, color: "#3b82f6", icon: <DollarSign size={12} /> },
    { label: "Investments", value: assets.investments, color: "#10b981", icon: <TrendingUp size={12} /> },
    { label: "Real Estate", value: assets.realEstate, color: "#8b5cf6", icon: <Home size={12} /> },
    { label: "Retirement (401k/IRA)", value: assets.retirement, color: "#f59e0b", icon: <Star size={12} /> },
    { label: "Other Assets", value: assets.other, color: "#6b7280", icon: <Layers size={12} /> },
  ];

  const assetKeys = ["cash", "investments", "realEstate", "retirement", "other"];
  const liabilityKeys = ["mortgage", "carLoans", "studentLoans", "creditCards", "other"];

  const liabilityItems: AssetLiability[] = [
    { label: "Mortgage", value: liabilities.mortgage, color: "#ef4444", icon: <Home size={12} /> },
    { label: "Car Loans", value: liabilities.carLoans, color: "#f97316", icon: <Briefcase size={12} /> },
    { label: "Student Loans", value: liabilities.studentLoans, color: "#eab308", icon: <Briefcase size={12} /> },
    { label: "Credit Cards", value: liabilities.creditCards, color: "#ec4899", icon: <CreditCard size={12} /> },
    { label: "Other Debt", value: liabilities.other, color: "#6b7280", icon: <Layers size={12} /> },
  ];

  const nextMilestone = NET_WORTH_MILESTONES.find((m) => m.value > netWorth);
  const prevMilestone = NET_WORTH_MILESTONES.filter((m) => m.value <= netWorth).pop();
  const milestoneProgress = nextMilestone
    ? ((netWorth - (prevMilestone?.value ?? 0)) / (nextMilestone.value - (prevMilestone?.value ?? 0))) * 100
    : 100;

  const percentileLabel = getPercentileLabel(netWorth, ageBracket);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Assets column */}
        <Card className="p-5 bg-card border-border space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Assets</h3>
            <Badge className="bg-green-900/50 text-green-400 border-green-800">{fmt(totalAssets)}</Badge>
          </div>
          {assetItems.map((item, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1 text-muted-foreground">{item.icon}{item.label}</span>
                <span className="text-foreground font-medium">{fmt(item.value)}</span>
              </div>
              <Slider
                min={0}
                max={500000}
                step={1000}
                value={[item.value]}
                onValueChange={([v]) => setAssets((prev) => ({ ...prev, [assetKeys[i]]: v }))}
              />
            </div>
          ))}
        </Card>

        {/* Liabilities column */}
        <Card className="p-5 bg-card border-border space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Liabilities</h3>
            <Badge className="bg-red-900/50 text-red-400 border-red-800">{fmt(totalLiabilities)}</Badge>
          </div>
          {liabilityItems.map((item, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1 text-muted-foreground">{item.icon}{item.label}</span>
                <span className="text-foreground font-medium">{fmt(item.value)}</span>
              </div>
              <Slider
                min={0}
                max={400000}
                step={1000}
                value={[item.value]}
                onValueChange={([v]) => setLiabilities((prev) => ({ ...prev, [liabilityKeys[i]]: v }))}
              />
            </div>
          ))}
        </Card>

        {/* Summary column */}
        <Card className="p-5 bg-card border-border space-y-4">
          <div className="flex justify-center">
            <DonutChart assets={totalAssets} liabilities={totalLiabilities} />
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Net Worth</div>
            <div className={cn("text-2xl font-bold", netWorth >= 0 ? "text-green-400" : "text-red-400")}>{fmtK(netWorth)}</div>
          </div>

          {/* Age Bracket Selector */}
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Your Age Group</div>
            <div className="flex flex-wrap gap-1">
              {Object.keys(PERCENTILE_DATA).map((bracket) => (
                <button
                  key={bracket}
                  onClick={() => setAgeBracket(bracket)}
                  className={cn(
                    "px-2 py-0.5 rounded text-xs text-muted-foreground border transition-colors",
                    ageBracket === bracket
                      ? "bg-primary border-primary text-foreground"
                      : "bg-muted border-border text-muted-foreground hover:border-border"
                  )}
                >
                  {bracket}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-muted rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground">Wealth Percentile</div>
            <div className="text-lg font-medium text-primary">{percentileLabel}</div>
            <div className="text-xs text-muted-foreground">among {ageBracket} age group</div>
          </div>
        </Card>
      </div>

      {/* Milestones */}
      <Card className="p-5 bg-card border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Net Worth Milestones</h3>
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {NET_WORTH_MILESTONES.map((m, i) => {
            const achieved = netWorth >= m.value;
            return (
              <div key={i} className="flex flex-col items-center gap-1 min-w-[72px]">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-lg border-2 transition-all",
                  achieved ? "border-green-500 bg-green-900/40" : "border-border bg-muted opacity-40"
                )}>
                  {m.emoji}
                </div>
                <div className={cn("text-xs font-medium", achieved ? "text-green-400" : "text-muted-foreground")}>{m.label}</div>
                {achieved && <CheckCircle size={10} className="text-green-500" />}
              </div>
            );
          })}
        </div>
        {nextMilestone && (
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress to {nextMilestone.label}</span>
              <span>{fmtK(nextMilestone.value - netWorth)} remaining</span>
            </div>
            <Progress value={Math.max(0, milestoneProgress)} className="h-2" />
          </div>
        )}
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 3: Passive Income Builder
// ─────────────────────────────────────────────────────────────────────────────

interface PassiveStream {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  yield: number;
  invested: number;
  growthRate: number;
}

function PassiveIncomeGaugeBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
      <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function PassiveIncomeTab() {
  const [streams, setStreams] = useState<PassiveStream[]>([
    { id: "dividends", label: "Dividend Stocks", icon: <TrendingUp size={14} />, color: "#10b981", yield: 3, invested: 100000, growthRate: 7 },
    { id: "reits", label: "REITs", icon: <Building2 size={14} />, color: "#3b82f6", yield: 5, invested: 50000, growthRate: 4 },
    { id: "rental", label: "Rental Income", icon: <Home size={14} />, color: "#8b5cf6", yield: 6, invested: 200000, growthRate: 3 },
    { id: "bonds", label: "Bond Interest", icon: <Layers size={14} />, color: "#f59e0b", yield: 4, invested: 60000, growthRate: 0 },
    { id: "onlinebiz", label: "Online Business", icon: <Zap size={14} />, color: "#ec4899", yield: 15, invested: 20000, growthRate: 10 },
    { id: "royalties", label: "Royalties", icon: <Star size={14} />, color: "#a78bfa", yield: 8, invested: 30000, growthRate: 5 },
  ]);

  const [activeIncome, setActiveIncome] = useState(8000);
  const [yearsGrowth, setYearsGrowth] = useState(10);

  const updateStream = (id: string, key: keyof PassiveStream, value: number) => {
    setStreams((prev) => prev.map((s) => (s.id === id ? { ...s, [key]: value } : s)));
  };

  const monthlyIncomes = useMemo(() =>
    streams.map((s) => (s.invested * (s.yield / 100)) / 12),
    [streams]
  );

  const totalMonthlyPassive = monthlyIncomes.reduce((a, b) => a + b, 0);
  const fiThreshold = activeIncome;
  const fiPct = Math.min((totalMonthlyPassive / fiThreshold) * 100, 100);

  // Dividend growth: $100K at 3% growing 7%/yr
  const divGrowth = useMemo(() => {
    const rows: { yr: number; monthly: number }[] = [];
    for (let yr = 0; yr <= yearsGrowth; yr++) {
      const annualIncome = 100000 * 0.03 * Math.pow(1.07, yr);
      rows.push({ yr, monthly: annualIncome / 12 });
    }
    return rows;
  }, [yearsGrowth]);

  // Capital needed to achieve $5K/month at various yields
  const capitalNeeded = [2, 3, 4, 5, 6, 8].map((y) => ({
    yield: y,
    capital: (5000 * 12) / (y / 100),
  }));

  // SVG for dividend growth
  const dvW = 480;
  const dvH = 140;
  const dvPad = { top: 12, right: 12, bottom: 28, left: 60 };
  const dvCw = dvW - dvPad.left - dvPad.right;
  const dvCh = dvH - dvPad.top - dvPad.bottom;
  const maxDvMonthly = Math.max(...divGrowth.map((d) => d.monthly));
  const dvPoints = divGrowth
    .map((d, i) => `${dvPad.left + (i / (divGrowth.length - 1)) * dvCw},${dvPad.top + dvCh - (d.monthly / maxDvMonthly) * dvCh}`)
    .join(" ");
  const dvAreaPath = `M ${dvPad.left},${dvPad.top + dvCh} L ${dvPoints} L ${dvPad.left + dvCw},${dvPad.top + dvCh} Z`;

  return (
    <div className="space-y-5">
      {/* FI progress */}
      <Card className="p-5 bg-card border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-orange-400" />
            <span className="text-sm font-medium text-foreground">Financial Independence Progress</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Active Income Target: {fmt(activeIncome)}/mo
            <input
              type="range" min={1000} max={20000} step={500} value={activeIncome}
              onChange={(e) => setActiveIncome(Number(e.target.value))}
              className="ml-2 w-24 accent-orange-500"
            />
          </div>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Monthly Passive: <span className="text-foreground font-medium">{fmt(totalMonthlyPassive)}</span></span>
          <span className="text-muted-foreground">FI Target: <span className="text-foreground font-medium">{fmt(fiThreshold)}</span></span>
        </div>
        <Progress value={fiPct} className="h-3 mb-1" />
        <div className="text-xs text-muted-foreground">{fmtPct(fiPct)} of FI threshold reached</div>
      </Card>

      {/* Streams */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {streams.map((stream, i) => (
          <Card key={stream.id} className="p-4 bg-card border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2" style={{ color: stream.color }}>
                {stream.icon}
                <span className="text-sm font-medium text-foreground">{stream.label}</span>
              </div>
              <Badge style={{ background: stream.color + "20", color: stream.color, borderColor: stream.color + "40" }}>
                {fmt(monthlyIncomes[i])}/mo
              </Badge>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invested</span>
                <span className="text-foreground">{fmt(stream.invested)}</span>
              </div>
              <Slider min={0} max={500000} step={5000} value={[stream.invested]}
                onValueChange={([v]) => updateStream(stream.id, "invested", v)} />

              <div className="flex justify-between">
                <span className="text-muted-foreground">Yield</span>
                <span className="text-foreground">{fmtPct(stream.yield)}</span>
              </div>
              <Slider min={0.5} max={20} step={0.5} value={[stream.yield]}
                onValueChange={([v]) => updateStream(stream.id, "yield", v)} />
            </div>

            <PassiveIncomeGaugeBar value={monthlyIncomes[i]} max={fiThreshold} color={stream.color} />
          </Card>
        ))}
      </div>

      {/* Dividend Growth Chart */}
      <Card className="p-5 bg-card border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-foreground">Dividend Growth Investing — $100K at 3% Yield Growing 7%/yr</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            Years: {yearsGrowth}
            <input type="range" min={5} max={30} step={1} value={yearsGrowth}
              onChange={(e) => setYearsGrowth(Number(e.target.value))}
              className="w-20 accent-green-500" />
          </div>
        </div>
        <svg viewBox={`0 0 ${dvW} ${dvH}`} className="w-full" style={{ height: dvH }}>
          <defs>
            <linearGradient id="wbDivGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          {[0, 0.5, 1].map((t, i) => {
            const y = dvPad.top + dvCh - t * dvCh;
            return (
              <g key={i}>
                <line x1={dvPad.left} y1={y} x2={dvPad.left + dvCw} y2={y} stroke="#374151" strokeWidth="1" strokeDasharray="3 3" />
                <text x={dvPad.left - 4} y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">
                  {fmt(t * maxDvMonthly, 0)}/mo
                </text>
              </g>
            );
          })}
          <path d={dvAreaPath} fill="url(#wbDivGrad)" />
          <polyline points={dvPoints} fill="none" stroke="#10b981" strokeWidth="2" />
          {divGrowth.filter((_, i) => i % Math.ceil(divGrowth.length / 5) === 0).map((d, i) => (
            <text key={i} x={dvPad.left + (d.yr / yearsGrowth) * dvCw} y={dvH - 6} textAnchor="middle" fontSize="10" fill="#9ca3af">
              Yr {d.yr}
            </text>
          ))}
        </svg>
        <div className="text-xs text-muted-foreground mt-1">
          After {yearsGrowth} years: {fmt(divGrowth[divGrowth.length - 1]?.monthly ?? 0)}/month
        </div>
      </Card>

      {/* Capital Needed for $5K/month */}
      <Card className="p-5 bg-card border-border">
        <h3 className="text-sm font-medium text-foreground mb-3">Capital Required for $5,000/month Passive Income</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {capitalNeeded.map((row) => (
            <div key={row.yield} className="bg-muted rounded-lg p-3 text-center">
              <div className="text-xs text-muted-foreground">{row.yield}% yield</div>
              <div className="text-sm font-medium text-primary mt-1">{fmtK(row.capital)}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">Higher yield = less capital needed, but usually means higher risk or lower growth.</p>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 4: Tax Optimization
// ─────────────────────────────────────────────────────────────────────────────

const TAX_BRACKETS_2024 = [
  { min: 0, max: 11600, rate: 10 },
  { min: 11600, max: 47150, rate: 12 },
  { min: 47150, max: 100525, rate: 22 },
  { min: 100525, max: 191950, rate: 24 },
  { min: 191950, max: 243725, rate: 32 },
  { min: 243725, max: 609350, rate: 35 },
  { min: 609350, max: Infinity, rate: 37 },
];

function calcTax(income: number): { marginalRate: number; effectiveRate: number; totalTax: number } {
  let totalTax = 0;
  let marginalRate = 10;
  for (const bracket of TAX_BRACKETS_2024) {
    if (income <= bracket.min) break;
    const taxable = Math.min(income, bracket.max) - bracket.min;
    totalTax += taxable * (bracket.rate / 100);
    if (income >= bracket.min) marginalRate = bracket.rate;
  }
  const effectiveRate = income > 0 ? (totalTax / income) * 100 : 0;
  return { marginalRate, effectiveRate, totalTax };
}

function TaxBracketSVG({ income }: { income: number }) {
  const vw = 520;
  const vh = 160;
  const pad = { top: 12, right: 12, bottom: 28, left: 52 };
  const cw = vw - pad.left - pad.right;
  const ch = vh - pad.top - pad.bottom;

  const maxIncome = Math.max(income * 1.1, TAX_BRACKETS_2024[3].max);
  const colors = ["#3b82f6", "#22d3ee", "#10b981", "#f59e0b", "#f97316", "#ef4444", "#7c3aed"];

  const bars = TAX_BRACKETS_2024.filter((b) => b.min < maxIncome).map((b, i) => {
    const x = pad.left + (b.min / maxIncome) * cw;
    const w = ((Math.min(b.max, maxIncome) - b.min) / maxIncome) * cw;
    const barH = (b.rate / 37) * ch;
    return { x, w, h: barH, rate: b.rate, color: colors[i] };
  });

  const incomeX = pad.left + Math.min((income / maxIncome), 1) * cw;

  return (
    <svg viewBox={`0 0 ${vw} ${vh}`} className="w-full" style={{ height: vh }}>
      {bars.map((bar, i) => (
        <g key={i}>
          <rect x={bar.x} y={pad.top + ch - bar.h} width={Math.max(bar.w - 1, 0)} height={bar.h} fill={bar.color} fillOpacity="0.7" rx="2" />
          {bar.w > 28 && (
            <text x={bar.x + bar.w / 2} y={pad.top + ch - bar.h - 4} textAnchor="middle" fontSize="9" fill={bar.color}>
              {bar.rate}%
            </text>
          )}
        </g>
      ))}
      {/* Income line */}
      <line x1={incomeX} y1={pad.top} x2={incomeX} y2={pad.top + ch} stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 2" />
      <text x={incomeX + 4} y={pad.top + 10} fontSize="9" fill="#fbbf24">Your Income</text>
      {/* Axis */}
      <line x1={pad.left} y1={pad.top + ch} x2={pad.left + cw} y2={pad.top + ch} stroke="#4b5563" strokeWidth="1" />
      {[0, 0.5, 1].map((t, i) => (
        <text key={i} x={pad.left + t * cw} y={vh - 6} textAnchor="middle" fontSize="9" fill="#9ca3af">
          {fmtK(t * maxIncome)}
        </text>
      ))}
    </svg>
  );
}

const ACCOUNT_TYPES = [
  {
    type: "Taxable Brokerage",
    best: ["Growth stocks (low div)", "Tax-loss harvesting", "Index ETFs"],
    avoid: ["High-yield bonds", "REITs", "Frequent trading"],
    color: "#3b82f6",
  },
  {
    type: "Traditional IRA / 401k",
    best: ["Bonds / Fixed income", "REITs", "High-dividend stocks"],
    avoid: ["Municipal bonds", "Already tax-efficient assets"],
    color: "#f59e0b",
  },
  {
    type: "Roth IRA",
    best: ["Highest growth assets", "Small-cap stocks", "Crypto (if allowed)"],
    avoid: ["Low-return stable assets", "Bonds"],
    color: "#10b981",
  },
];

function TaxOptimizationTab() {
  const [income, setIncome] = useState(120000);
  const [annualContrib, setAnnualContrib] = useState(23000);
  const { marginalRate, effectiveRate, totalTax } = useMemo(() => calcTax(income), [income]);
  const taxSaved = annualContrib * (marginalRate / 100);

  // Tax savings over 30 years with tax-deferred growth
  const taxAdvYears = 30;
  const taxAdvData = useMemo(() => {
    const rows: { yr: number; taxable: number; deferred: number }[] = [];
    for (let yr = 0; yr <= taxAdvYears; yr++) {
      const r = 8 / 100 / 12;
      const n = yr * 12;
      const fv = annualContrib / 12 * ((Math.pow(1 + r, n) - 1) / r);
      const afterTaxContrib = (annualContrib * (1 - marginalRate / 100)) / 12;
      const taxableFv = afterTaxContrib * ((Math.pow(1 + r * (1 - 0.15), n) - 1) / (r * (1 - 0.15)));
      rows.push({ yr, taxable: taxableFv, deferred: fv });
    }
    return rows;
  }, [annualContrib, marginalRate]);

  const maxTaxAdv = Math.max(...taxAdvData.map((d) => d.deferred));
  const taxAdvW = 480;
  const taxAdvH = 140;
  const taxAdvPad = { top: 12, right: 12, bottom: 28, left: 60 };
  const taCw = taxAdvW - taxAdvPad.left - taxAdvPad.right;
  const taCh = taxAdvH - taxAdvPad.top - taxAdvPad.bottom;
  const toTaX = (i: number) => taxAdvPad.left + (i / taxAdvYears) * taCw;
  const toTaY = (v: number) => taxAdvPad.top + taCh - (v / maxTaxAdv) * taCh;
  const deferredPts = taxAdvData.map((d) => `${toTaX(d.yr)},${toTaY(d.deferred)}`).join(" ");
  const taxablePts = taxAdvData.map((d) => `${toTaX(d.yr)},${toTaY(d.taxable)}`).join(" ");

  // Roth conversion ladder: show optimal amounts to convert per year
  const rothConversionRanges = TAX_BRACKETS_2024.slice(0, 4).map((b) => ({
    bracket: `${b.rate}%`,
    maxConvert: Math.min(b.max, 500000) - b.min,
    color: ["#3b82f6", "#22d3ee", "#10b981", "#f59e0b"][TAX_BRACKETS_2024.indexOf(b)],
  }));

  return (
    <div className="space-y-5">
      {/* Income & bracket */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5 bg-card border-border space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Tax Bracket Calculator</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Annual Income</span>
              <span className="text-foreground font-medium">{fmt(income)}</span>
            </div>
            <Slider min={10000} max={600000} step={5000} value={[income]} onValueChange={([v]) => setIncome(v)} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted rounded-lg p-3 text-center">
              <div className="text-xs text-muted-foreground">Marginal Rate</div>
              <div className="text-xl font-medium text-red-400">{marginalRate}%</div>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <div className="text-xs text-muted-foreground">Effective Rate</div>
              <div className="text-xl font-medium text-yellow-400">{fmtPct(effectiveRate)}</div>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <div className="text-xs text-muted-foreground">Total Tax</div>
              <div className="text-xl font-medium text-orange-400">{fmtK(calcTax(income).totalTax)}</div>
            </div>
          </div>

          <TaxBracketSVG income={income} />
        </Card>

        <Card className="p-5 bg-card border-border space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Tax-Advantaged Account Optimizer</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Annual 401k Contribution</span>
              <span className="text-foreground font-medium">{fmt(annualContrib)}</span>
            </div>
            <Slider min={1000} max={23000} step={500} value={[annualContrib]} onValueChange={([v]) => setAnnualContrib(v)} />
          </div>

          <div className="bg-emerald-900/30 border border-emerald-800/50 rounded-lg p-3">
            <div className="text-xs text-emerald-400 font-medium">Annual Tax Savings</div>
            <div className="text-lg font-medium text-emerald-400">{fmt(taxSaved)}</div>
            <div className="text-xs text-muted-foreground mt-1">at {marginalRate}% marginal rate on {fmt(annualContrib)} contribution</div>
          </div>

          <div className="text-xs text-muted-foreground font-medium mb-1">Tax-Deferred vs Taxable Growth (30 years)</div>
          <svg viewBox={`0 0 ${taxAdvW} ${taxAdvH}`} className="w-full" style={{ height: taxAdvH }}>
            <defs>
              <linearGradient id="wbDeferGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            {[0, 0.5, 1].map((t, i) => (
              <g key={i}>
                <line x1={taxAdvPad.left} y1={toTaY(t * maxTaxAdv)} x2={taxAdvPad.left + taCw} y2={toTaY(t * maxTaxAdv)} stroke="#374151" strokeWidth="1" strokeDasharray="3 3" />
                <text x={taxAdvPad.left - 4} y={toTaY(t * maxTaxAdv) + 4} textAnchor="end" fontSize="10" fill="#9ca3af">{fmtK(t * maxTaxAdv)}</text>
              </g>
            ))}
            <path d={`M ${toTaX(0)},${toTaY(0)} L ${deferredPts} L ${toTaX(taxAdvYears)},${toTaY(0)} Z`} fill="url(#wbDeferGrad)" />
            <polyline points={deferredPts} fill="none" stroke="#10b981" strokeWidth="2" />
            <polyline points={taxablePts} fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="5 3" />
            {[0, 10, 20, 30].map((yr) => (
              <text key={yr} x={toTaX(yr)} y={taxAdvH - 6} textAnchor="middle" fontSize="10" fill="#9ca3af">Yr {yr}</text>
            ))}
          </svg>
          <div className="flex gap-4 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-green-500" /> Tax-Deferred</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-red-500 border-dashed border-t border-red-500" /> Taxable</span>
          </div>
        </Card>
      </div>

      {/* Asset Location */}
      <Card className="p-5 bg-card border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Asset Location Strategy</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ACCOUNT_TYPES.map((acct) => (
            <div key={acct.type} className="bg-muted rounded-md p-4 space-y-3">
              <div className="text-sm font-medium" style={{ color: acct.color }}>{acct.type}</div>
              <div>
                <div className="text-xs text-green-400 mb-1 font-medium">Best for:</div>
                {acct.best.map((item, i) => (
                  <div key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle size={10} className="text-green-500 flex-shrink-0" />{item}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-xs text-red-400 mb-1 font-medium">Avoid:</div>
                {acct.avoid.map((item, i) => (
                  <div key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertTriangle size={10} className="text-red-500 flex-shrink-0" />{item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Roth Conversion + Estate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5 bg-card border-border space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Roth Conversion Ladder</h3>
          <p className="text-xs text-muted-foreground">Convert traditional IRA funds to Roth up to the top of each bracket. Ideal strategy for early retirees with low current income.</p>
          {rothConversionRanges.map((r, i) => (
            <div key={i} className="flex items-center gap-3">
              <Badge style={{ background: r.color + "20", color: r.color, borderColor: r.color + "40", minWidth: 36 }}>{r.bracket}</Badge>
              <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                <div className="h-full rounded" style={{ width: `${Math.min((r.maxConvert / 200000) * 100, 100)}%`, background: r.color, opacity: 0.7 }} />
              </div>
              <span className="text-xs text-muted-foreground w-16 text-right">{fmtK(r.maxConvert)}</span>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">Fill up to top of 12% or 22% bracket for optimal Roth conversion while income is low.</p>
        </Card>

        <Card className="p-5 bg-card border-border space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Estate Planning Basics</h3>
          <div className="space-y-2">
            {[
              { label: "Annual Gift Exclusion", value: "$18,000 per person", note: "Gift tax-free to any number of individuals", color: "#3b82f6" },
              { label: "Step-Up in Basis", value: "Reset to market value", note: "Inherited assets avoid capital gains on appreciation", color: "#10b981" },
              { label: "Estate Tax Exemption", value: "$13.61M (2024)", note: "Federal exemption per individual; $27.22M for couples", color: "#f59e0b" },
              { label: "Donor-Advised Fund", value: "Bunch deductions", note: "Immediate deduction, distribute to charities over time", color: "#8b5cf6" },
            ].map((item, i) => (
              <div key={i} className="bg-muted rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span className="text-xs font-medium" style={{ color: item.color }}>{item.value}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{item.note}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 5: Risk & Insurance
// ─────────────────────────────────────────────────────────────────────────────

function RiskInsuranceTab() {
  const [age, setAge] = useState(35);
  const [annualIncome, setAnnualIncome] = useState(100000);
  const [retirementAge, setRetirementAge] = useState(65);
  const [assets, setAssets] = useState(200000);
  const [debts, setDebts] = useState(150000);
  const [dependents, setDependents] = useState(2);
  const [portfolioValue, setPortfolioValue] = useState(300000);

  const yearsToRetirement = Math.max(retirementAge - age, 0);
  const humanCapital = useMemo(() => {
    // PV of future earnings discounted at 5%
    let pv = 0;
    for (let i = 1; i <= yearsToRetirement; i++) {
      pv += annualIncome / Math.pow(1.05, i);
    }
    return pv;
  }, [annualIncome, yearsToRetirement]);

  // Income replacement method: 10-12× income
  const lifeInsNeed_income = annualIncome * 12;
  // DIME method: Debt + Income + Mortgage + Education
  const lifeInsNeed_dime = debts + annualIncome * yearsToRetirement + 200000 + dependents * 50000;

  const lifeInsNeed = Math.max(lifeInsNeed_income, lifeInsNeed_dime);

  // Disability: 65% of income
  const disabilityMonthly = (annualIncome * 0.65) / 12;

  // Portfolio insurance cost (approximate: 1% of portfolio)
  const portfolioInsuranceCost = portfolioValue * 0.01;

  const coverageItems = [
    {
      label: "Life Insurance Need",
      value: fmtK(lifeInsNeed),
      detail: `Income method: ${fmtK(lifeInsNeed_income)} | DIME: ${fmtK(lifeInsNeed_dime)}`,
      color: "#3b82f6",
      icon: <Shield size={16} />,
    },
    {
      label: "Disability Insurance",
      value: `${fmt(disabilityMonthly)}/mo`,
      detail: `60-70% income replacement for long-term disability (avg claim 34 months)`,
      color: "#f59e0b",
      icon: <AlertTriangle size={16} />,
    },
    {
      label: "Umbrella Policy",
      value: assets > 500000 ? "$2M–$5M" : "$1M–$2M",
      detail: `Your net worth: ${fmtK(assets - debts)}. Coverage should exceed total assets.`,
      color: "#10b981",
      icon: <Shield size={16} />,
    },
    {
      label: "Portfolio Insurance (Annual)",
      value: `~${fmtK(portfolioInsuranceCost)}`,
      detail: `Protective puts, collars, or hedging strategies on ${fmtK(portfolioValue)} portfolio`,
      color: "#8b5cf6",
      icon: <BarChart3 size={16} />,
    },
  ];

  // Human capital SVG: declining over time
  const hcData = useMemo(() => {
    const rows: { yr: number; hc: number }[] = [];
    for (let a = age; a <= retirementAge; a++) {
      let pv = 0;
      for (let i = 1; i <= retirementAge - a; i++) {
        pv += annualIncome / Math.pow(1.05, i);
      }
      rows.push({ yr: a, hc: pv });
    }
    return rows;
  }, [age, retirementAge, annualIncome]);

  const maxHC = hcData[0]?.hc ?? 1;
  const hcW = 480;
  const hcH = 130;
  const hcPad = { top: 12, right: 12, bottom: 28, left: 60 };
  const hcCw = hcW - hcPad.left - hcPad.right;
  const hcCh = hcH - hcPad.top - hcPad.bottom;
  const hcPts = hcData.map((d, i) => `${hcPad.left + (i / (hcData.length - 1 || 1)) * hcCw},${hcPad.top + hcCh - (d.hc / maxHC) * hcCh}`).join(" ");
  const hcArea = `M ${hcPad.left},${hcPad.top + hcCh} L ${hcPts} L ${hcPad.left + hcCw},${hcPad.top + hcCh} Z`;

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <Card className="p-5 bg-card border-border">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Age", value: age, min: 20, max: 64, step: 1, set: setAge },
            { label: "Annual Income", value: annualIncome, min: 20000, max: 500000, step: 5000, set: setAnnualIncome },
            { label: "Retire Age", value: retirementAge, min: 50, max: 75, step: 1, set: setRetirementAge },
            { label: "Total Assets", value: assets, min: 0, max: 5000000, step: 10000, set: setAssets },
            { label: "Total Debts", value: debts, min: 0, max: 1000000, step: 5000, set: setDebts },
            { label: "Dependents", value: dependents, min: 0, max: 6, step: 1, set: setDependents },
          ].map((field) => (
            <div key={field.label} className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="text-muted-foreground">{field.label}</span>
                <span className="text-foreground font-medium">{field.value >= 10000 ? fmtK(field.value) : field.value}</span>
              </div>
              <Slider min={field.min} max={field.max} step={field.step} value={[field.value]} onValueChange={([v]) => field.set(v)} />
            </div>
          ))}
        </div>
      </Card>

      {/* Human Capital */}
      <Card className="p-5 bg-card border-border">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} className="text-muted-foreground/50" />
          <h3 className="text-sm font-medium text-foreground">Human Capital — Your Most Valuable Asset</h3>
          <Badge className="bg-muted/70 text-primary border-border">{fmtK(humanCapital)}</Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Present value of all future earnings at 5% discount rate. This is what life &amp; disability insurance protects.</p>
        <svg viewBox={`0 0 ${hcW} ${hcH}`} className="w-full" style={{ height: hcH }}>
          <defs>
            <linearGradient id="wbHCGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          {[0, 0.5, 1].map((t, i) => (
            <g key={i}>
              <line x1={hcPad.left} y1={hcPad.top + hcCh - t * hcCh} x2={hcPad.left + hcCw} y2={hcPad.top + hcCh - t * hcCh} stroke="#374151" strokeWidth="1" strokeDasharray="3 3" />
              <text x={hcPad.left - 4} y={hcPad.top + hcCh - t * hcCh + 4} textAnchor="end" fontSize="10" fill="#9ca3af">{fmtK(t * maxHC)}</text>
            </g>
          ))}
          <path d={hcArea} fill="url(#wbHCGrad)" />
          <polyline points={hcPts} fill="none" stroke="#3b82f6" strokeWidth="2" />
          <text x={hcPad.left} y={hcH - 6} textAnchor="middle" fontSize="10" fill="#9ca3af">Age {age}</text>
          <text x={hcPad.left + hcCw} y={hcH - 6} textAnchor="middle" fontSize="10" fill="#9ca3af">Age {retirementAge}</text>
        </svg>
      </Card>

      {/* Coverage Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coverageItems.map((item, i) => (
          <Card key={i} className="p-4 bg-card border-border">
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: item.color }}>{item.icon}</span>
              <span className="text-sm font-medium text-foreground">{item.label}</span>
              <Badge className="ml-auto" style={{ background: item.color + "20", color: item.color, borderColor: item.color + "40" }}>
                {item.value}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{item.detail}</p>
          </Card>
        ))}
      </div>

      {/* Property / Deductible Optimization */}
      <Card className="p-5 bg-card border-border">
        <h3 className="text-sm font-medium text-foreground mb-3">Deductible Optimization: Pay yourself to self-insure</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: "Low Deductible ($500)", premium: 2400, savings: 0, note: "Highest annual cost, pays for small claims" },
            { label: "Medium Deductible ($1,500)", premium: 1800, savings: 600, note: "Sweet spot for most homeowners" },
            { label: "High Deductible ($5,000)", premium: 1200, savings: 1200, note: "Best if you have emergency fund, insure catastrophe only" },
          ].map((opt, i) => (
            <div key={i} className={cn("bg-muted rounded-md p-4 border", i === 1 ? "border-border" : "border-border")}>
              {i === 1 && <Badge className="bg-muted/70 text-primary border-border text-xs mb-2">Recommended</Badge>}
              <div className="text-sm font-medium text-foreground">{opt.label}</div>
              <div className="text-lg font-medium text-foreground mt-1">{fmt(opt.premium)}/yr</div>
              {opt.savings > 0 && <div className="text-xs text-green-400">Save {fmt(opt.savings)}/yr</div>}
              <div className="text-xs text-muted-foreground mt-2">{opt.note}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 6: Financial Independence Roadmap
// ─────────────────────────────────────────────────────────────────────────────

const FIRE_MILESTONES = [
  { label: "F-You Money", multiplier: 1, desc: "1 year of expenses — enough to walk away from a bad job", color: "#3b82f6", emoji: "💪" },
  { label: "Lean FIRE", multiplier: 17, desc: "17× — minimal lifestyle, $30K/yr or less", color: "#22d3ee", emoji: "🌿" },
  { label: "FIRE", multiplier: 25, desc: "25× — 4% withdrawal rate, standard FI", color: "#10b981", emoji: "🔥" },
  { label: "Fat FIRE", multiplier: 40, desc: "40× — comfortable lifestyle, $100K+/yr expenses", color: "#f59e0b", emoji: "🏝" },
];

function SWRHistoricalChart() {
  // Simulate 100 30-year periods testing 4% SWR
  const periods: { startYr: number; survived: boolean; finalValue: number }[] = [];
  s = 29; // reset PRNG for deterministic output
  for (let i = 0; i < 100; i++) {
    const startPortfolio = 1_000_000;
    const annualWithdrawal = 40_000; // 4%
    let portfolio = startPortfolio;
    let survived = true;
    for (let yr = 0; yr < 30; yr++) {
      const return_ = 0.07 + (rand() - 0.5) * 0.4; // ~7% avg with volatility
      portfolio = portfolio * (1 + return_) - annualWithdrawal;
      if (portfolio <= 0) {
        survived = false;
        portfolio = 0;
        break;
      }
    }
    periods.push({ startYr: 1920 + i, survived, finalValue: portfolio });
  }

  const survivedCount = periods.filter((p) => p.survived).length;

  const vw = 560;
  const vh = 160;
  const pad = { top: 12, right: 12, bottom: 28, left: 52 };
  const cw = vw - pad.left - pad.right;
  const ch = vh - pad.top - pad.bottom;
  const barW = cw / periods.length - 1;
  const maxFV = Math.max(...periods.map((p) => p.finalValue));

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="text-sm text-muted-foreground">Success Rate: <span className="text-green-400 font-medium">{survivedCount}%</span></div>
        <Badge className="bg-green-900/50 text-green-400 border-green-800">100 historical 30-year periods</Badge>
      </div>
      <svg viewBox={`0 0 ${vw} ${vh}`} className="w-full" style={{ height: vh }}>
        {periods.map((p, i) => {
          const x = pad.left + i * (barW + 1);
          const barH = p.survived ? (p.finalValue / (maxFV || 1)) * ch : 4;
          const y = pad.top + ch - barH;
          return (
            <rect key={i} x={x} y={y} width={barW} height={barH} fill={p.survived ? "#10b981" : "#ef4444"} fillOpacity="0.75" rx="1" />
          );
        })}
        <line x1={pad.left} y1={pad.top + ch} x2={pad.left + cw} y2={pad.top + ch} stroke="#4b5563" />
        <text x={pad.left} y={vh - 6} fontSize="10" fill="#9ca3af">1920</text>
        <text x={pad.left + cw} y={vh - 6} textAnchor="end" fontSize="10" fill="#9ca3af">2020</text>
      </svg>
      <div className="flex gap-4 text-xs text-muted-foreground mt-1">
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded bg-green-500/75" /> Portfolio survived</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded bg-red-500/75" /> Ran out of money</span>
      </div>
    </div>
  );
}

function FIRoadmapTab() {
  const [annualExpenses, setAnnualExpenses] = useState(60000);
  const [currentSavings, setCurrentSavings] = useState(150000);
  const [annualSavingsRate, setAnnualSavingsRate] = useState(30);
  const [annualIncome, setAnnualIncome] = useState(100000);
  const [baristaEarnings, setBaristaEarnings] = useState(20000);

  const fiNumber = annualExpenses * 25;
  const fiBaristaNumber = (annualExpenses - baristaEarnings) * 25;
  const annualSavings = annualIncome * (annualSavingsRate / 100);

  // Years to FI: solve for n in FV = fiNumber
  const yearsToFI = useMemo(() => {
    const r = 0.07 / 12;
    const pmt = annualSavings / 12;
    const pv = currentSavings;
    const target = fiNumber;
    // Numerical solve
    for (let n = 1; n <= 600; n++) {
      const fv = pv * Math.pow(1 + r, n) + pmt * ((Math.pow(1 + r, n) - 1) / r);
      if (fv >= target) return Math.ceil(n / 12);
    }
    return 50;
  }, [currentSavings, annualSavings, fiNumber]);

  const yearsToBarista = useMemo(() => {
    const r = 0.07 / 12;
    const pmt = annualSavings / 12;
    const pv = currentSavings;
    const target = fiBaristaNumber;
    for (let n = 1; n <= 600; n++) {
      const fv = pv * Math.pow(1 + r, n) + pmt * ((Math.pow(1 + r, n) - 1) / r);
      if (fv >= target) return Math.ceil(n / 12);
    }
    return 50;
  }, [currentSavings, annualSavings, fiBaristaNumber]);

  const milestoneProgress = FIRE_MILESTONES.map((m) => ({
    ...m,
    target: annualExpenses * m.multiplier,
    pct: Math.min((currentSavings / (annualExpenses * m.multiplier)) * 100, 100),
    achieved: currentSavings >= annualExpenses * m.multiplier,
  }));

  // Progress chart: current → FI
  const progressPct = Math.min((currentSavings / fiNumber) * 100, 100);

  // One more year syndrome analysis
  const oneMoreYear = useMemo(() => {
    const r = 0.07;
    const swr = 0.04;
    const fia = fiNumber; // already at FI
    const workMore = 1;
    const addSavings = annualSavings;
    const addGrowth = fia * r;
    const extraCapital = fia + addSavings + addGrowth;
    const extraWithdrawal = extraCapital * swr;
    const standardWithdrawal = fia * swr;
    return { extraWithdrawal, standardWithdrawal, diff: extraWithdrawal - standardWithdrawal, extraCapital };
  }, [fiNumber, annualSavings]);

  return (
    <div className="space-y-5">
      {/* FIRE Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 bg-card border-border space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">FIRE Calculator</h3>

          {[
            { label: "Annual Expenses", value: annualExpenses, min: 10000, max: 200000, step: 2500, set: setAnnualExpenses },
            { label: "Current Savings", value: currentSavings, min: 0, max: 5000000, step: 10000, set: setCurrentSavings },
            { label: "Annual Income", value: annualIncome, min: 30000, max: 500000, step: 5000, set: setAnnualIncome },
            { label: "Savings Rate", value: annualSavingsRate, min: 5, max: 80, step: 5, set: setAnnualSavingsRate, isPercent: true },
          ].map((field) => (
            <div key={field.label} className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="text-muted-foreground">{field.label}</span>
                <span className="text-foreground font-medium">
                  {field.isPercent ? fmtPct(field.value) : fmtK(field.value)}
                </span>
              </div>
              <Slider min={field.min} max={field.max} step={field.step} value={[field.value]}
                onValueChange={([v]) => field.set(v)} />
            </div>
          ))}
        </Card>

        <Card className="lg:col-span-2 p-5 bg-card border-border space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted rounded-md p-4 text-center">
              <div className="text-xs text-muted-foreground">FI Number (25×)</div>
              <div className="text-lg font-medium text-green-400">{fmtK(fiNumber)}</div>
              <div className="text-xs text-muted-foreground mt-1">{fmt(annualExpenses)}/yr × 25</div>
            </div>
            <div className="bg-muted rounded-md p-4 text-center">
              <div className="text-xs text-muted-foreground">Years to FI</div>
              <div className="text-lg font-medium text-primary">{yearsToFI}</div>
              <div className="text-xs text-muted-foreground mt-1">at {fmtPct(annualSavingsRate)} savings rate</div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress to FI</span>
              <span>{fmtK(currentSavings)} / {fmtK(fiNumber)}</span>
            </div>
            <div className="relative h-4 bg-muted rounded-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }} />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-foreground">
                {fmtPct(progressPct)}
              </div>
            </div>
          </div>

          {/* FIRE Milestones */}
          <div className="space-y-2">
            {milestoneProgress.map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="text-lg w-6">{m.emoji}</div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span style={{ color: m.color }} className="font-medium">{m.label}</span>
                    <span className="text-muted-foreground">{fmtK(m.target)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${m.pct}%`, background: m.color }} />
                  </div>
                </div>
                {m.achieved && <CheckCircle size={14} className="text-green-500 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* SWR Historical Analysis */}
      <Card className="p-5 bg-card border-border">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={14} className="text-green-400" />
          <h3 className="text-sm font-medium text-foreground">4% Safe Withdrawal Rate — Historical Analysis</h3>
        </div>
        <SWRHistoricalChart />
      </Card>

      {/* Barista FIRE + One More Year */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5 bg-card border-border space-y-3">
          <h3 className="text-sm font-medium text-foreground">Barista FIRE Calculator</h3>
          <p className="text-xs text-muted-foreground">Work part-time to cover some expenses — retire with less capital needed.</p>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="text-muted-foreground">Part-Time Earnings/yr</span>
              <span className="text-foreground font-medium">{fmt(baristaEarnings)}</span>
            </div>
            <Slider min={0} max={60000} step={1000} value={[baristaEarnings]} onValueChange={([v]) => setBaristaEarnings(v)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted rounded-md p-3 text-center">
              <div className="text-xs text-muted-foreground">Standard FIRE</div>
              <div className="text-lg font-medium text-primary">{fmtK(fiNumber)}</div>
              <div className="text-xs text-muted-foreground">{yearsToFI} years</div>
            </div>
            <div className="bg-muted rounded-md p-3 text-center">
              <div className="text-xs text-muted-foreground">Barista FIRE</div>
              <div className="text-lg font-medium text-green-400">{fmtK(fiBaristaNumber)}</div>
              <div className="text-xs text-muted-foreground">{yearsToBarista} years</div>
            </div>
          </div>

          <div className="bg-muted/40 border border-border rounded-lg p-3 text-xs text-primary">
            Part-time income of {fmt(baristaEarnings)}/yr saves{" "}
            <span className="font-medium">{fmtK(fiNumber - fiBaristaNumber)}</span> in required capital and reaches FI{" "}
            <span className="font-medium">{yearsToFI - yearsToBarista} years earlier</span>.
          </div>
        </Card>

        <Card className="p-5 bg-card border-border space-y-3">
          <h3 className="text-sm font-medium text-foreground">One More Year Syndrome</h3>
          <p className="text-xs text-muted-foreground">
            Working one extra year after reaching FI adds capital but costs you irreplaceable time.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted rounded-md p-3 text-center">
              <div className="text-xs text-muted-foreground">Current Withdrawal</div>
              <div className="text-lg font-medium text-green-400">{fmt(oneMoreYear.standardWithdrawal)}/yr</div>
              <div className="text-xs text-muted-foreground">4% of {fmtK(fiNumber)}</div>
            </div>
            <div className="bg-muted rounded-md p-3 text-center">
              <div className="text-xs text-muted-foreground">After 1 More Year</div>
              <div className="text-lg font-medium text-yellow-400">{fmt(oneMoreYear.extraWithdrawal)}/yr</div>
              <div className="text-xs text-muted-foreground">+{fmt(oneMoreYear.diff)}/yr gain</div>
            </div>
          </div>
          <div className="bg-amber-900/20 border border-amber-800/40 rounded-lg p-3 text-xs text-amber-300">
            <AlertTriangle size={12} className="inline mr-1" />
            One extra year of work yields only {fmt(oneMoreYear.diff)}/yr more spending — is that worth a year of your life?
          </div>

          {/* Legacy / Charitable */}
          <div className="pt-1 space-y-2">
            <div className="text-xs text-muted-foreground font-medium">Legacy Planning Options</div>
            {[
              { label: "Annual Gift Exclusion", value: "$18K/person/yr" },
              { label: "Charitable Remainder Trust", value: "Income + deduction + legacy" },
              { label: "Donor-Advised Fund", value: "Immediate deduction, flexible giving" },
              { label: "Leave to heirs", value: "Step-up in basis eliminates capital gains" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1 text-muted-foreground"><ChevronRight size={10} className="text-muted-foreground" />{item.label}</span>
                <span className="text-muted-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "accumulation", label: "Accumulation", icon: <TrendingUp size={14} /> },
  { id: "networth", label: "Net Worth", icon: <BarChart3 size={14} /> },
  { id: "passive", label: "Passive Income", icon: <Flame size={14} /> },
  { id: "tax", label: "Tax Optimization", icon: <DollarSign size={14} /> },
  { id: "risk", label: "Risk & Insurance", icon: <Shield size={14} /> },
  { id: "fire", label: "FI Roadmap", icon: <TreePine size={14} /> },
];

export default function WealthBuilderPage() {
  const [activeTab, setActiveTab] = useState("accumulation");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10 border-l-4 border-l-primary">
        <div className="max-w-screen-2xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-emerald-600 flex items-center justify-center">
                <TrendingUp size={18} className="text-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-medium text-foreground">Wealth Builder</h1>
                <p className="text-xs text-muted-foreground">Comprehensive financial independence planning toolkit</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-900/50 text-green-400 border-green-800">
                <Star size={10} className="mr-1" />
                Planning Mode
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-2xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border mb-6 flex flex-wrap gap-1 h-auto p-1">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-1.5 text-xs data-[state=active]:bg-muted data-[state=active]:text-foreground"
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <TabsContent value="accumulation" className="mt-0 data-[state=inactive]:hidden">
                <WealthAccumulationTab />
              </TabsContent>
              <TabsContent value="networth" className="mt-0 data-[state=inactive]:hidden">
                <NetWorthTab />
              </TabsContent>
              <TabsContent value="passive" className="mt-0 data-[state=inactive]:hidden">
                <PassiveIncomeTab />
              </TabsContent>
              <TabsContent value="tax" className="mt-0 data-[state=inactive]:hidden">
                <TaxOptimizationTab />
              </TabsContent>
              <TabsContent value="risk" className="mt-0 data-[state=inactive]:hidden">
                <RiskInsuranceTab />
              </TabsContent>
              <TabsContent value="fire" className="mt-0 data-[state=inactive]:hidden">
                <FIRoadmapTab />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
