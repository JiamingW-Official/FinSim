"use client";

import { useState, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  BarChart3,
  Shield,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Zap,
  Target,
  Award,
  Crown,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Mulberry32 seeded PRNG ─────────────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Formatting helpers ────────────────────────────────────────────────────────

function fmt(n: number, d = 2): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

function fmtK(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${fmt(n, 0)}`;
}

function fmtMoney(n: number): string {
  return `$${fmt(n, 0)}`;
}

// ── Sector colors ─────────────────────────────────────────────────────────────

const SECTOR_COLORS_SVG: Record<string, string> = {
  Healthcare:    "rgb(74,222,128)",
  Consumer:      "rgb(96,165,250)",
  Telecom:       "rgb(251,191,36)",
  Energy:        "rgb(251,146,60)",
  Retail:        "rgb(34,211,238)",
  "Real Estate": "rgb(167,139,250)",
  Utilities:     "rgb(248,113,113)",
  Financials:    "rgb(52,211,153)",
};

const SECTOR_COLORS_CSS: Record<string, { text: string; bg: string; border: string }> = {
  Healthcare:    { text: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/30" },
  Consumer:      { text: "text-primary",   bg: "bg-primary/10",   border: "border-border" },
  Telecom:       { text: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/30" },
  Energy:        { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  Retail:        { text: "text-muted-foreground",   bg: "bg-cyan-500/10",   border: "border-cyan-500/30" },
  "Real Estate": { text: "text-primary", bg: "bg-primary/10", border: "border-border" },
  Utilities:     { text: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/30" },
  Financials:    { text: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/30" },
};

// ── Dividend Safety Stock Data ─────────────────────────────────────────────────

interface SafetyStock {
  ticker: string;
  name: string;
  sector: string;
  yield: number;
  payoutRatio: number;
  fcfPerShare: number;
  annualDivPerShare: number;
  consecutiveYears: number;
  debtEbitda: number;
  cyclicality: "Low" | "Moderate" | "High";
  portfolioWeight: number; // % of hypothetical $100k portfolio
}

const SAFETY_STOCKS: SafetyStock[] = [
  { ticker: "JNJ",  name: "Johnson & Johnson",   sector: "Healthcare",    yield: 3.1,  payoutRatio: 68,  fcfPerShare: 8.20,  annualDivPerShare: 4.76, consecutiveYears: 62, debtEbitda: 1.1, cyclicality: "Low",      portfolioWeight: 9.0 },
  { ticker: "PG",   name: "Procter & Gamble",     sector: "Consumer",     yield: 2.3,  payoutRatio: 61,  fcfPerShare: 5.50,  annualDivPerShare: 3.76, consecutiveYears: 68, debtEbitda: 1.3, cyclicality: "Low",      portfolioWeight: 8.5 },
  { ticker: "KO",   name: "Coca-Cola",             sector: "Consumer",     yield: 3.1,  payoutRatio: 73,  fcfPerShare: 2.10,  annualDivPerShare: 1.94, consecutiveYears: 62, debtEbitda: 2.8, cyclicality: "Low",      portfolioWeight: 7.0 },
  { ticker: "MCD",  name: "McDonald's",            sector: "Consumer",     yield: 2.3,  payoutRatio: 67,  fcfPerShare: 9.20,  annualDivPerShare: 6.68, consecutiveYears: 48, debtEbitda: 3.5, cyclicality: "Moderate", portfolioWeight: 6.5 },
  { ticker: "T",    name: "AT&T",                  sector: "Telecom",      yield: 6.7,  payoutRatio: 52,  fcfPerShare: 3.20,  annualDivPerShare: 1.11, consecutiveYears: 3,  debtEbitda: 4.2, cyclicality: "Low",      portfolioWeight: 5.0 },
  { ticker: "VZ",   name: "Verizon",               sector: "Telecom",      yield: 6.2,  payoutRatio: 61,  fcfPerShare: 4.80,  annualDivPerShare: 2.66, consecutiveYears: 18, debtEbitda: 3.8, cyclicality: "Low",      portfolioWeight: 5.0 },
  { ticker: "XOM",  name: "ExxonMobil",            sector: "Energy",       yield: 3.4,  payoutRatio: 44,  fcfPerShare: 9.70,  annualDivPerShare: 3.80, consecutiveYears: 42, debtEbitda: 0.9, cyclicality: "High",     portfolioWeight: 7.0 },
  { ticker: "CVX",  name: "Chevron",               sector: "Energy",       yield: 4.1,  payoutRatio: 56,  fcfPerShare: 11.80, annualDivPerShare: 6.52, consecutiveYears: 37, debtEbitda: 0.8, cyclicality: "High",     portfolioWeight: 6.0 },
  { ticker: "WMT",  name: "Walmart",               sector: "Retail",       yield: 1.2,  payoutRatio: 35,  fcfPerShare: 5.80,  annualDivPerShare: 0.83, consecutiveYears: 51, debtEbitda: 1.0, cyclicality: "Low",      portfolioWeight: 7.0 },
  { ticker: "HD",   name: "Home Depot",             sector: "Retail",       yield: 2.2,  payoutRatio: 56,  fcfPerShare: 17.20, annualDivPerShare: 8.90, consecutiveYears: 15, debtEbitda: 2.1, cyclicality: "Moderate", portfolioWeight: 6.5 },
  { ticker: "O",    name: "Realty Income",          sector: "Real Estate",  yield: 5.8,  payoutRatio: 75,  fcfPerShare: 3.50,  annualDivPerShare: 3.09, consecutiveYears: 30, debtEbitda: 5.2, cyclicality: "Low",      portfolioWeight: 6.0 },
  { ticker: "NEE",  name: "NextEra Energy",         sector: "Utilities",    yield: 3.2,  payoutRatio: 60,  fcfPerShare: 4.80,  annualDivPerShare: 1.87, consecutiveYears: 28, debtEbitda: 4.8, cyclicality: "Low",      portfolioWeight: 6.5 },
  { ticker: "ABT",  name: "Abbott Laboratories",    sector: "Healthcare",   yield: 1.9,  payoutRatio: 44,  fcfPerShare: 6.40,  annualDivPerShare: 2.12, consecutiveYears: 52, debtEbitda: 1.4, cyclicality: "Low",      portfolioWeight: 7.0 },
  { ticker: "BLK",  name: "BlackRock",              sector: "Financials",   yield: 2.8,  payoutRatio: 50,  fcfPerShare: 38.00, annualDivPerShare: 20.00,consecutiveYears: 14, debtEbitda: 1.2, cyclicality: "High",     portfolioWeight: 5.5 },
  { ticker: "PEP",  name: "PepsiCo",                sector: "Consumer",     yield: 3.0,  payoutRatio: 69,  fcfPerShare: 6.20,  annualDivPerShare: 5.06, consecutiveYears: 52, debtEbitda: 2.9, cyclicality: "Low",      portfolioWeight: 6.5 },
];

// ── Compute safety scores ──────────────────────────────────────────────────────

interface SafetyResult {
  stock: SafetyStock;
  score: number; // 0-100
  grade: "A" | "B" | "C" | "D" | "F";
  coverageRatio: number;
  atRisk: boolean;
  riskReasons: string[];
}

function computeSafetyScore(s: SafetyStock): SafetyResult {
  let score = 0;
  const riskReasons: string[] = [];

  // Payout ratio (0-25 pts)
  if (s.payoutRatio < 40) score += 25;
  else if (s.payoutRatio < 55) score += 20;
  else if (s.payoutRatio < 70) score += 14;
  else if (s.payoutRatio < 80) score += 7;
  else { score += 0; riskReasons.push(`High payout ratio ${s.payoutRatio}%`); }

  // FCF coverage (0-25 pts)
  const coverageRatio = s.fcfPerShare / (s.annualDivPerShare || 1);
  if (coverageRatio > 3.0) score += 25;
  else if (coverageRatio > 2.0) score += 20;
  else if (coverageRatio > 1.5) score += 14;
  else if (coverageRatio > 1.0) score += 7;
  else { score += 0; riskReasons.push(`Weak FCF coverage ${fmt(coverageRatio, 1)}x`); }

  // Consecutive years (0-20 pts)
  if (s.consecutiveYears >= 50) score += 20;
  else if (s.consecutiveYears >= 25) score += 16;
  else if (s.consecutiveYears >= 10) score += 10;
  else if (s.consecutiveYears >= 5) score += 5;
  else score += 0;

  // Debt/EBITDA (0-15 pts)
  if (s.debtEbitda < 1.0) score += 15;
  else if (s.debtEbitda < 2.0) score += 11;
  else if (s.debtEbitda < 3.5) score += 6;
  else if (s.debtEbitda < 5.0) score += 2;
  else { score += 0; riskReasons.push(`High leverage ${fmt(s.debtEbitda, 1)}x Debt/EBITDA`); }

  // Cyclicality (0-15 pts)
  if (s.cyclicality === "Low") score += 15;
  else if (s.cyclicality === "Moderate") score += 8;
  else score += 2;

  const atRisk = s.payoutRatio > 80 || coverageRatio < 1.0;

  const grade: "A" | "B" | "C" | "D" | "F" =
    score >= 85 ? "A" :
    score >= 70 ? "B" :
    score >= 55 ? "C" :
    score >= 40 ? "D" : "F";

  return { stock: s, score, grade, coverageRatio, atRisk, riskReasons };
}

// ── Ex-Dividend Calendar Data ──────────────────────────────────────────────────

interface ExDivEvent {
  ticker: string;
  name: string;
  sector: string;
  exDivDate: string;
  payDate: string;
  divPerShare: number;
  yield: number;
  isQualified: boolean;
  priceAction: number[]; // 5-day relative price change %, day -4 to exDiv day
}

function buildExDivCalendar(rng: () => number): ExDivEvent[] {
  const base = [
    { ticker: "JNJ",  name: "Johnson & Johnson", sector: "Healthcare",   exDivDate: "2026-04-18", payDate: "2026-05-10", divPerShare: 1.19, yield: 3.1, isQualified: true },
    { ticker: "PG",   name: "Procter & Gamble",  sector: "Consumer",    exDivDate: "2026-04-22", payDate: "2026-05-15", divPerShare: 0.94, yield: 2.3, isQualified: true },
    { ticker: "KO",   name: "Coca-Cola",          sector: "Consumer",    exDivDate: "2026-04-30", payDate: "2026-06-01", divPerShare: 0.485,yield: 3.1, isQualified: true },
    { ticker: "XOM",  name: "ExxonMobil",         sector: "Energy",      exDivDate: "2026-05-10", payDate: "2026-06-10", divPerShare: 0.95, yield: 3.4, isQualified: true },
    { ticker: "VZ",   name: "Verizon",            sector: "Telecom",     exDivDate: "2026-05-14", payDate: "2026-06-01", divPerShare: 0.665,yield: 6.2, isQualified: true },
    { ticker: "O",    name: "Realty Income",      sector: "Real Estate", exDivDate: "2026-05-20", payDate: "2026-06-15", divPerShare: 0.258,yield: 5.8, isQualified: false },
    { ticker: "NEE",  name: "NextEra Energy",     sector: "Utilities",   exDivDate: "2026-05-28", payDate: "2026-06-15", divPerShare: 0.467,yield: 3.2, isQualified: true },
    { ticker: "CVX",  name: "Chevron",            sector: "Energy",      exDivDate: "2026-06-05", payDate: "2026-06-10", divPerShare: 1.63, yield: 4.1, isQualified: true },
    { ticker: "T",    name: "AT&T",               sector: "Telecom",     exDivDate: "2026-06-09", payDate: "2026-07-01", divPerShare: 0.2775,yield:6.7, isQualified: true },
    { ticker: "WMT",  name: "Walmart",            sector: "Retail",      exDivDate: "2026-06-13", payDate: "2026-07-02", divPerShare: 0.235,yield: 1.2, isQualified: true },
    { ticker: "PEP",  name: "PepsiCo",            sector: "Consumer",    exDivDate: "2026-06-20", payDate: "2026-06-30", divPerShare: 1.265,yield: 3.0, isQualified: true },
    { ticker: "MCD",  name: "McDonald's",         sector: "Consumer",    exDivDate: "2026-06-25", payDate: "2026-07-17", divPerShare: 1.67, yield: 2.3, isQualified: true },
  ];

  return base.map((b) => {
    // Generate 5-day price action: tends to rise into ex-div, drops on ex-div day
    const priceAction = [
      (rng() - 0.3) * 0.8,
      (rng() - 0.2) * 0.6,
      (rng() - 0.3) * 0.5,
      (rng() - 0.4) * 0.7,
      -(b.yield / 4) * (0.7 + rng() * 0.6), // ex-div day drop
    ];
    return { ...b, priceAction };
  });
}

// ── DGI Model Stocks ──────────────────────────────────────────────────────────

interface DGIStock {
  ticker: string;
  name: string;
  sector: string;
  currentYield: number;
  divGrowthRate: number; // 5Y CAGR %
  payoutRatio: number;
  fcfCoverage: number;
  consecutiveYears: number;
  yoc20: number; // yield on cost after 20 years at current growth rate
}

const DGI_STOCKS: DGIStock[] = [
  { ticker: "MSFT", name: "Microsoft",          sector: "Technology",  currentYield: 0.8, divGrowthRate: 10.2, payoutRatio: 25, fcfCoverage: 8.1,  consecutiveYears: 22, yoc20: 5.4  },
  { ticker: "AAPL", name: "Apple",              sector: "Technology",  currentYield: 0.5, divGrowthRate: 8.5,  payoutRatio: 16, fcfCoverage: 12.0, consecutiveYears: 12, yoc20: 2.6  },
  { ticker: "JNJ",  name: "Johnson & Johnson",  sector: "Healthcare",  currentYield: 3.1, divGrowthRate: 5.9,  payoutRatio: 68, fcfCoverage: 1.7,  consecutiveYears: 62, yoc20: 9.9  },
  { ticker: "PG",   name: "Procter & Gamble",   sector: "Consumer",   currentYield: 2.3, divGrowthRate: 5.4,  payoutRatio: 61, fcfCoverage: 1.5,  consecutiveYears: 68, yoc20: 6.6  },
  { ticker: "V",    name: "Visa",               sector: "Financials",  currentYield: 0.8, divGrowthRate: 15.0, payoutRatio: 21, fcfCoverage: 7.2,  consecutiveYears: 15, yoc20: 12.9 },
  { ticker: "LOW",  name: "Lowe's",             sector: "Retail",     currentYield: 2.0, divGrowthRate: 14.5, payoutRatio: 34, fcfCoverage: 4.6,  consecutiveYears: 51, yoc20: 28.4 },
  { ticker: "TGT",  name: "Target",             sector: "Retail",     currentYield: 3.8, divGrowthRate: 9.0,  payoutRatio: 55, fcfCoverage: 2.8,  consecutiveYears: 55, yoc20: 21.3 },
  { ticker: "ABT",  name: "Abbott Labs",        sector: "Healthcare",  currentYield: 1.9, divGrowthRate: 8.0,  payoutRatio: 44, fcfCoverage: 3.0,  consecutiveYears: 52, yoc20: 8.9  },
  { ticker: "NEE",  name: "NextEra Energy",     sector: "Utilities",  currentYield: 3.2, divGrowthRate: 10.0, payoutRatio: 60, fcfCoverage: 1.8,  consecutiveYears: 28, yoc20: 21.5 },
  { ticker: "BRO",  name: "Brown & Brown",      sector: "Financials",  currentYield: 0.7, divGrowthRate: 11.5, payoutRatio: 18, fcfCoverage: 9.5,  consecutiveYears: 30, yoc20: 5.7  },
];

// ── Section 1: Income Dashboard ───────────────────────────────────────────────

function IncomeDashboard() {
  const rng = useMemo(() => mulberry32(1357), []);

  // Generate synthetic monthly income data for heatmap
  // Simulate a $100k portfolio with the 15 stocks
  const portfolioIncome = useMemo(() => {
    const r = mulberry32(1357);
    // Annual income = $100k * weighted avg yield
    const totalWeightedYield = SAFETY_STOCKS.reduce((sum, s) => sum + (s.portfolioWeight / 100) * (s.yield / 100), 0);
    const annualIncome = 100000 * totalWeightedYield;
    // Month-by-month breakdown (stocks pay quarterly)
    const monthly: number[] = Array(12).fill(0);
    SAFETY_STOCKS.forEach((s) => {
      const annualDiv = 100000 * (s.portfolioWeight / 100) * (s.yield / 100);
      // Quarterly payments — distribute in months 0,3,6,9 with some variation
      const baseMonth = Math.floor(r() * 3);
      [baseMonth, baseMonth + 3, baseMonth + 6, baseMonth + 9].forEach((m) => {
        monthly[m % 12] += annualDiv / 4;
      });
    });
    // Prior year income (7% less)
    const priorAnnual = annualIncome * 0.93;
    const growthRate = ((annualIncome / priorAnnual) - 1) * 100;
    return { annualIncome, monthly, priorAnnual, growthRate };
  }, [rng]);

  // Calendar heatmap data — distribute income across days
  const calendarData = useMemo(() => {
    const r = mulberry32(2468);
    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const DAYS_IN_MONTH = [31,28,31,30,31,30,31,31,30,31,30,31];

    return MONTHS.map((month, mi) => {
      const monthlyTotal = portfolioIncome.monthly[mi];
      // Pick 3-6 pay days per month for dividend payments
      const numPayDays = 3 + Math.floor(r() * 4);
      const payDays: Map<number, number> = new Map();
      const days = DAYS_IN_MONTH[mi];
      let remaining = monthlyTotal;
      for (let i = 0; i < numPayDays; i++) {
        const day = 1 + Math.floor(r() * (days - 1));
        const amount = i === numPayDays - 1 ? remaining : remaining * (0.15 + r() * 0.35);
        remaining -= amount;
        payDays.set(day, (payDays.get(day) || 0) + amount);
      }
      return { month, days, payDays, total: monthlyTotal };
    });
  }, [portfolioIncome]);

  // Sector income breakdown
  const sectorIncome = useMemo(() => {
    const bySecetor: Record<string, number> = {};
    SAFETY_STOCKS.forEach((s) => {
      const inc = 100000 * (s.portfolioWeight / 100) * (s.yield / 100);
      bySecetor[s.sector] = (bySecetor[s.sector] || 0) + inc;
    });
    return Object.entries(bySecetor).sort((a, b) => b[1] - a[1]);
  }, []);

  // Income milestones
  const monthlyIncome = portfolioIncome.annualIncome / 12;
  const milestones = [
    { label: "$100/mo",  threshold: 100 },
    { label: "$500/mo",  threshold: 500 },
    { label: "$1k/mo",   threshold: 1000 },
    { label: "$2k/mo",   threshold: 2000 },
    { label: "$5k/mo",   threshold: 5000 },
  ];

  // Donut chart for sectors
  const totalSectorIncome = sectorIncome.reduce((sum, [, v]) => sum + v, 0);
  const donutR = 60, donutCx = 90, donutCy = 80, strokeW = 22;
  const circumference = 2 * Math.PI * donutR;
  let cumulativeAngle = -Math.PI / 2;
  const donutSegments = sectorIncome.map(([sector, value]) => {
    const fraction = value / totalSectorIncome;
    const angle = fraction * 2 * Math.PI;
    const x1 = donutCx + donutR * Math.cos(cumulativeAngle);
    const y1 = donutCy + donutR * Math.sin(cumulativeAngle);
    cumulativeAngle += angle;
    const x2 = donutCx + donutR * Math.cos(cumulativeAngle);
    const y2 = donutCy + donutR * Math.sin(cumulativeAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    return { sector, value, fraction, x1, y1, x2, y2, largeArc };
  });

  const maxMonthly = Math.max(...portfolioIncome.monthly);

  return (
    <div className="space-y-5">
      {/* KPI chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Annual Income",     value: fmtK(portfolioIncome.annualIncome), color: "text-green-400",  sub: "forward projection" },
          { label: "Monthly Average",   value: fmtK(monthlyIncome),               color: "text-primary",   sub: "$100k portfolio" },
          { label: "YoY Income Growth", value: `+${fmt(portfolioIncome.growthRate, 1)}%`, color: "text-emerald-400", sub: "vs prior year" },
          { label: "Weighted Yield",    value: `${fmt((portfolioIncome.annualIncome / 100000) * 100, 2)}%`, color: "text-amber-400", sub: "portfolio average" },
        ].map((chip) => (
          <div key={chip.label} className="bg-muted/30 border border-border/40 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">{chip.label}</p>
            <p className={cn("text-lg font-semibold mt-0.5", chip.color)}>{chip.value}</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">{chip.sub}</p>
          </div>
        ))}
      </div>

      {/* Monthly income bar chart (simple) */}
      <div className="bg-muted/20 border border-border/40 rounded-lg p-4">
        <h4 className="text-sm font-medium mb-3">Monthly Dividend Income Distribution</h4>
        <div className="flex items-end gap-1.5 h-24">
          {portfolioIncome.monthly.map((v, i) => {
            const height = maxMonthly > 0 ? (v / maxMonthly) * 100 : 0;
            const months = ["J","F","M","A","M","J","J","A","S","O","N","D"];
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col justify-end" style={{ height: 80 }}>
                  <div
                    className="w-full rounded-sm bg-primary/70 transition-all"
                    style={{ height: `${height}%` }}
                    title={`${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i]}: ${fmtK(v)}`}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground">{months[i]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar heatmap + sector donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 12-month income calendar */}
        <div className="lg:col-span-2 bg-muted/20 border border-border/40 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-3">Income Calendar Heatmap (2026)</h4>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
            {calendarData.map(({ month, days, payDays, total }) => {
              const maxDay = Math.max(...Array.from(payDays.values()), 1);
              return (
                <div key={month} className="space-y-1">
                  <div className="text-xs text-muted-foreground font-medium text-center">{month}</div>
                  <div className="text-[11px] text-green-400 text-center font-mono">{fmtK(total)}</div>
                  <div className="grid grid-cols-7 gap-px">
                    {Array.from({ length: days }).map((_, d) => {
                      const inc = payDays.get(d + 1) || 0;
                      const intensity = inc / maxDay;
                      const opacity = inc > 0 ? 0.2 + intensity * 0.8 : 0.05;
                      return (
                        <div
                          key={d}
                          className="aspect-square rounded-[1px]"
                          style={{ backgroundColor: inc > 0 ? `rgba(52,211,153,${opacity})` : "rgba(150,150,150,0.06)" }}
                          title={inc > 0 ? `Day ${d+1}: ${fmtK(inc)}` : ""}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground/60 mt-2">Darker green = more dividend income received that day</p>
        </div>

        {/* Sector donut */}
        <div className="bg-muted/20 border border-border/40 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-2">Income by Sector</h4>
          <svg viewBox="0 0 180 160" className="w-full" style={{ height: 160 }}>
            {donutSegments.map(({ sector, x1, y1, x2, y2, largeArc, fraction }, i) => (
              <path
                key={sector}
                d={`M ${donutCx} ${donutCy} L ${x1} ${y1} A ${donutR} ${donutR} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={SECTOR_COLORS_SVG[sector] || "rgb(150,150,150)"}
                fillOpacity={0.75}
                stroke="rgba(0,0,0,0.3)"
                strokeWidth={1}
              />
            ))}
            {/* Center hole */}
            <circle cx={donutCx} cy={donutCy} r={donutR - strokeW} fill="rgba(0,0,0,0.6)" />
            <text x={donutCx} y={donutCy - 5} fontSize={10} fill="white" textAnchor="middle" fontWeight="600">
              {fmtK(totalSectorIncome)}
            </text>
            <text x={donutCx} y={donutCy + 8} fontSize={7} fill="rgba(255,255,255,0.5)" textAnchor="middle">annual</text>
          </svg>
          <div className="space-y-1">
            {sectorIncome.slice(0, 5).map(([sector, value]) => {
              const sc = SECTOR_COLORS_CSS[sector] ?? SECTOR_COLORS_CSS["Consumer"];
              return (
                <div key={sector} className="flex items-center justify-between text-xs">
                  <span className={cn("px-1.5 py-0.5 rounded text-xs font-medium border", sc.bg, sc.text, sc.border)}>{sector}</span>
                  <span className="text-muted-foreground font-mono">{fmtK(value)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Income milestones */}
      <div className="bg-muted/20 border border-border/40 rounded-lg p-4">
        <h4 className="text-sm font-medium mb-3">Income Milestones</h4>
        <div className="flex flex-wrap gap-3">
          {milestones.map((m) => {
            const achieved = monthlyIncome >= m.threshold;
            return (
              <div
                key={m.label}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                  achieved
                    ? "bg-green-500/10 border-green-500/40 text-green-400"
                    : "bg-muted/20 border-border/30 text-muted-foreground"
                )}
              >
                {achieved ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Target className="w-4 h-4 opacity-40" />
                )}
                {m.label}
                {achieved && <span className="text-xs opacity-70">Achieved</span>}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Current monthly income: <span className="text-foreground font-medium">{fmtK(monthlyIncome)}</span> — based on $100k model portfolio
        </p>
      </div>
    </div>
  );
}

// ── Section 2: Dividend Safety Scoring ────────────────────────────────────────

function DividendSafetyScoring() {
  const results = useMemo(() => SAFETY_STOCKS.map(computeSafetyScore).sort((a, b) => b.score - a.score), []);
  const [selected, setSelected] = useState<string | null>(null);

  const selectedResult = results.find((r) => r.stock.ticker === selected);
  const atRiskCount = results.filter((r) => r.atRisk).length;

  const gradeColor = (g: string) =>
    g === "A" ? "text-green-400 bg-green-500/10 border-green-500/30" :
    g === "B" ? "text-muted-foreground bg-cyan-500/10 border-cyan-500/30" :
    g === "C" ? "text-amber-400 bg-amber-500/10 border-amber-500/30" :
    g === "D" ? "text-orange-400 bg-orange-500/10 border-orange-500/30" :
    "text-red-400 bg-red-500/10 border-red-500/30";

  const scoreBarColor = (score: number) =>
    score >= 85 ? "bg-green-500" :
    score >= 70 ? "bg-cyan-500" :
    score >= 55 ? "bg-amber-500" :
    score >= 40 ? "bg-orange-500" : "bg-red-500";

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-muted/30 border border-border/40 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Avg Safety Score</p>
          <p className="text-lg font-semibold text-muted-foreground mt-0.5">
            {fmt(results.reduce((s, r) => s + r.score, 0) / results.length, 0)}/100
          </p>
        </div>
        <div className="bg-muted/30 border border-border/40 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Grade A Stocks</p>
          <p className="text-lg font-semibold text-green-400 mt-0.5">{results.filter((r) => r.grade === "A").length}</p>
        </div>
        <div className={cn("rounded-lg p-3 border", atRiskCount > 0 ? "bg-red-500/10 border-red-500/30" : "bg-muted/30 border-border/40")}>
          <p className="text-xs text-muted-foreground">At-Risk Dividends</p>
          <p className={cn("text-lg font-semibold mt-0.5", atRiskCount > 0 ? "text-red-400" : "text-muted-foreground")}>{atRiskCount}</p>
        </div>
      </div>

      {/* Stock table */}
      <div className="rounded-lg border border-border/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Stock</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Safety Score</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">Grade</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Payout</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">FCF Cov.</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Consec.</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">D/EBITDA</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {results.map((r) => (
                <tr
                  key={r.stock.ticker}
                  onClick={() => setSelected(selected === r.stock.ticker ? null : r.stock.ticker)}
                  className={cn("cursor-pointer transition-colors", selected === r.stock.ticker ? "bg-primary/5" : "hover:bg-muted/20")}
                >
                  <td className="px-3 py-2.5">
                    <div className="font-semibold text-foreground">{r.stock.ticker}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[120px]">{r.stock.name}</div>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", scoreBarColor(r.score))} style={{ width: `${r.score}%` }} />
                      </div>
                      <span className="font-mono text-xs text-foreground w-7 text-right">{r.score}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={cn("px-2 py-0.5 rounded text-xs font-bold border", gradeColor(r.grade))}>{r.grade}</span>
                  </td>
                  <td className={cn("px-3 py-2.5 text-right font-mono text-xs", r.stock.payoutRatio > 80 ? "text-red-400" : r.stock.payoutRatio > 65 ? "text-amber-400" : "text-green-400")}>
                    {r.stock.payoutRatio}%
                  </td>
                  <td className={cn("px-3 py-2.5 text-right font-mono text-xs", r.coverageRatio < 1.0 ? "text-red-400" : r.coverageRatio < 1.5 ? "text-amber-400" : "text-green-400")}>
                    {fmt(r.coverageRatio, 1)}x
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs text-muted-foreground">
                    {r.stock.consecutiveYears}y
                    {r.stock.consecutiveYears >= 50 && <Crown className="inline w-3 h-3 ml-1 text-yellow-400" />}
                    {r.stock.consecutiveYears >= 25 && r.stock.consecutiveYears < 50 && <Award className="inline w-3 h-3 ml-1 text-primary" />}
                  </td>
                  <td className={cn("px-3 py-2.5 text-right font-mono text-xs", r.stock.debtEbitda > 4 ? "text-red-400" : r.stock.debtEbitda > 2.5 ? "text-amber-400" : "text-green-400")}>
                    {fmt(r.stock.debtEbitda, 1)}x
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {r.atRisk ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
                        <AlertTriangle className="w-3 h-3" /> At Risk
                      </span>
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-green-400/40 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel for selected stock */}
      {selectedResult && (
        <div className={cn("rounded-lg border p-4 space-y-3", selectedResult.atRisk ? "bg-red-500/5 border-red-500/30" : "bg-muted/20 border-border/40")}>
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-semibold">{selectedResult.stock.name} ({selectedResult.stock.ticker})</h4>
              <p className="text-xs text-muted-foreground">{selectedResult.stock.sector} · Cyclicality: {selectedResult.stock.cyclicality}</p>
            </div>
            <div className="text-right">
              <div className={cn("text-2xl font-bold", selectedResult.score >= 85 ? "text-green-400" : selectedResult.score >= 70 ? "text-muted-foreground" : selectedResult.score >= 55 ? "text-amber-400" : "text-red-400")}>
                {selectedResult.score}<span className="text-sm text-muted-foreground">/100</span>
              </div>
              <span className={cn("px-2 py-0.5 rounded text-xs font-bold border", gradeColor(selectedResult.grade))}>Grade {selectedResult.grade}</span>
            </div>
          </div>
          {/* Metric breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              { label: "Yield",        value: `${fmt(selectedResult.stock.yield, 1)}%`,       good: selectedResult.stock.yield > 2 },
              { label: "Payout Ratio", value: `${selectedResult.stock.payoutRatio}%`,         good: selectedResult.stock.payoutRatio < 65 },
              { label: "FCF Coverage", value: `${fmt(selectedResult.coverageRatio, 1)}x`,    good: selectedResult.coverageRatio > 1.5 },
              { label: "D/EBITDA",     value: `${fmt(selectedResult.stock.debtEbitda, 1)}x`, good: selectedResult.stock.debtEbitda < 2.5 },
            ].map((m) => (
              <div key={m.label} className="bg-muted/30 rounded p-2">
                <p className="text-muted-foreground">{m.label}</p>
                <p className={cn("font-semibold mt-0.5", m.good ? "text-green-400" : "text-amber-400")}>{m.value}</p>
              </div>
            ))}
          </div>
          {selectedResult.riskReasons.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Risk Factors</p>
              {selectedResult.riskReasons.map((r, i) => (
                <p key={i} className="text-xs text-muted-foreground pl-4">— {r}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>Score = Payout (25) + FCF Coverage (25) + Streak (20) + Leverage (15) + Cyclicality (15)</span>
        <span className="text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> At Risk = Payout &gt;80% OR FCF Coverage &lt;1x</span>
      </div>
    </div>
  );
}

// ── Section 3: DRIP Simulator ─────────────────────────────────────────────────

function DripSimulator() {
  const [startAmount, setStartAmount]   = useState(25000);
  const [divYield, setDivYield]         = useState(3.5);
  const [divGrowth, setDivGrowth]       = useState(6);
  const [priceAppreciation, setPriceAppreciation] = useState(4);
  const [years, setYears]               = useState(20);

  // DRIP calculation
  const dripData = useMemo(() => {
    const rows: { year: number; withDrip: number; withoutDrip: number; totalDivReinvested: number; annualIncome: number; shares: number }[] = [];
    let shares = startAmount; // treat $1 = 1 "unit" for simplicity
    let divPerUnit = divYield / 100;
    let pricePerUnit = 1.0;
    let totalDivReinvested = 0;

    const noReinvest = { value: startAmount };

    for (let y = 1; y <= years; y++) {
      // Price grows
      pricePerUnit *= (1 + priceAppreciation / 100);
      // Dividend grows
      divPerUnit *= (1 + divGrowth / 100);
      // Annual income from current shares
      const annualIncome = shares * divPerUnit;
      // Buy new shares with dividends
      const newShares = annualIncome / pricePerUnit;
      shares += newShares;
      totalDivReinvested += annualIncome;
      // Without DRIP: price return only
      noReinvest.value *= (1 + priceAppreciation / 100);

      rows.push({
        year: y,
        withDrip: shares * pricePerUnit,
        withoutDrip: noReinvest.value,
        totalDivReinvested,
        annualIncome: shares * divPerUnit, // next year's income
        shares,
      });
    }
    return rows;
  }, [startAmount, divYield, divGrowth, priceAppreciation, years]);

  const final = dripData[dripData.length - 1] ?? { withDrip: 0, withoutDrip: 0, totalDivReinvested: 0, annualIncome: 0, shares: 0 };
  const totalReturn = ((final.withDrip - startAmount) / startAmount) * 100;
  const priceOnlyReturn = ((final.withoutDrip - startAmount) / startAmount) * 100;
  const dripBonus = final.withDrip - final.withoutDrip;

  // SVG chart
  const W = 560, H = 200, padL = 64, padR = 16, padT = 16, padB = 32;
  const maxVal = Math.max(...dripData.map((d) => d.withDrip)) * 1.05;
  const toX = (i: number) => padL + (i / (dripData.length - 1)) * (W - padL - padR);
  const toY = (v: number) => padT + ((maxVal - v) / maxVal) * (H - padT - padB);

  const dripPoints = dripData.map((d, i) => `${toX(i)},${toY(d.withDrip)}`).join(" ");
  const noDripPoints = dripData.map((d, i) => `${toX(i)},${toY(d.withoutDrip)}`).join(" ");

  // Snowball table — first 5 and last 2 years
  const snowballRows = [
    ...dripData.slice(0, 5),
    ...(years > 7 ? dripData.slice(-2) : []),
  ];

  return (
    <div className="space-y-5">
      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {[
          {
            label: "Starting Investment",
            value: startAmount,
            min: 10000, max: 100000, step: 5000,
            display: fmtK(startAmount),
            setter: setStartAmount,
            color: "text-primary",
          },
          {
            label: "Dividend Yield",
            value: divYield,
            min: 2, max: 8, step: 0.5,
            display: `${fmt(divYield, 1)}%`,
            setter: setDivYield,
            color: "text-green-400",
          },
          {
            label: "Annual Dividend Growth",
            value: divGrowth,
            min: 0, max: 15, step: 1,
            display: `${divGrowth}%`,
            setter: setDivGrowth,
            color: "text-emerald-400",
          },
          {
            label: "Annual Price Appreciation",
            value: priceAppreciation,
            min: 0, max: 12, step: 1,
            display: `${priceAppreciation}%`,
            setter: setPriceAppreciation,
            color: "text-muted-foreground",
          },
          {
            label: "Time Horizon",
            value: years,
            min: 5, max: 30, step: 5,
            display: `${years} years`,
            setter: setYears,
            color: "text-amber-400",
          },
        ].map((s) => (
          <div key={s.label}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-muted-foreground">{s.label}</label>
              <span className={cn("text-sm font-semibold tabular-nums", s.color)}>{s.display}</span>
            </div>
            <Slider
              value={[s.value]}
              onValueChange={([v]) => s.setter(v)}
              min={s.min}
              max={s.max}
              step={s.step}
              className="w-full"
            />
          </div>
        ))}
      </div>

      {/* Results chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Portfolio with DRIP",     value: fmtK(final.withDrip),              color: "text-green-400" },
          { label: "Price Return Only",        value: fmtK(final.withoutDrip),           color: "text-primary" },
          { label: "DRIP Bonus",               value: fmtK(dripBonus),                   color: "text-emerald-400" },
          { label: `Yr ${years} Annual Income`,value: fmtK(final.annualIncome),          color: "text-amber-400" },
        ].map((chip) => (
          <div key={chip.label} className="bg-muted/30 border border-border/40 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">{chip.label}</p>
            <p className={cn("text-base font-semibold mt-0.5", chip.color)}>{chip.value}</p>
          </div>
        ))}
      </div>

      {/* SVG compound growth chart */}
      <div className="bg-muted/20 border border-border/40 rounded-lg p-4">
        <h4 className="text-sm font-medium mb-1">Portfolio Value: DRIP vs Price Return Only</h4>
        <div className="flex gap-4 mb-2">
          <span className="flex items-center gap-1.5 text-xs text-green-400"><span className="w-4 h-0.5 bg-green-400 inline-block" /> With DRIP (+{fmt(totalReturn, 0)}%)</span>
          <span className="flex items-center gap-1.5 text-xs text-primary"><span className="w-4 h-0.5 bg-primary inline-block border-dashed border-b border-primary bg-transparent border" /> Price Only (+{fmt(priceOnlyReturn, 0)}%)</span>
        </div>
        {dripData.length > 1 && (
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
            {/* Grid */}
            {[0, 0.25, 0.5, 0.75, 1.0].map((frac, i) => {
              const v = maxVal * frac;
              const y = toY(v);
              return (
                <g key={i}>
                  <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="currentColor" strokeOpacity={0.06} strokeWidth={1} />
                  <text x={padL - 5} y={y + 4} fontSize={9} fill="currentColor" fillOpacity={0.4} textAnchor="end">{fmtK(v)}</text>
                </g>
              );
            })}
            {/* X-axis labels */}
            {dripData.filter((_, i) => i % Math.max(1, Math.floor(years / 5)) === 0 || i === years - 1).map((d, idx) => {
              const i = dripData.indexOf(d);
              return (
                <text key={idx} x={toX(i)} y={H - padB + 12} fontSize={9} fill="currentColor" fillOpacity={0.4} textAnchor="middle">
                  Yr {d.year}
                </text>
              );
            })}
            {/* Fill under DRIP curve */}
            <polygon
              points={`${toX(0)},${toY(0)} ${dripPoints} ${toX(dripData.length - 1)},${toY(0)}`}
              fill="rgb(52,211,153)"
              fillOpacity={0.08}
            />
            {/* Price-only line */}
            <polyline points={noDripPoints} fill="none" stroke="rgb(96,165,250)" strokeWidth={2} strokeDasharray="5,3" strokeLinejoin="round" />
            {/* DRIP line */}
            <polyline points={dripPoints} fill="none" stroke="rgb(52,211,153)" strokeWidth={2.5} strokeLinejoin="round" />
            {/* Start point */}
            <circle cx={toX(0)} cy={toY(startAmount)} r={4} fill="rgb(52,211,153)" />
            {/* End points */}
            <circle cx={toX(dripData.length - 1)} cy={toY(final.withDrip)} r={4} fill="rgb(52,211,153)" />
            <circle cx={toX(dripData.length - 1)} cy={toY(final.withoutDrip)} r={3} fill="rgb(96,165,250)" />
          </svg>
        )}
      </div>

      {/* Snowball effect table */}
      <div className="bg-muted/20 border border-border/40 rounded-lg p-4">
        <h4 className="text-sm font-medium mb-3">Snowball Effect — Dividends Buying More Shares</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/40">
                <th className="pb-2 text-left text-muted-foreground">Year</th>
                <th className="pb-2 text-right text-muted-foreground">Portfolio Value</th>
                <th className="pb-2 text-right text-muted-foreground">Annual Income</th>
                <th className="pb-2 text-right text-muted-foreground">Divs Reinvested (cumul.)</th>
                <th className="pb-2 text-right text-muted-foreground">Shares (units)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {snowballRows.map((row, i) => {
                const isLast = i === snowballRows.length - 1 && years > 7;
                return (
                  <tr key={row.year} className={cn(isLast ? "bg-green-500/5" : "")}>
                    <td className="py-1.5 text-muted-foreground">Yr {row.year}</td>
                    <td className="py-1.5 text-right font-mono text-foreground">{fmtK(row.withDrip)}</td>
                    <td className="py-1.5 text-right font-mono text-green-400">{fmtK(row.annualIncome)}</td>
                    <td className="py-1.5 text-right font-mono text-emerald-400">{fmtK(row.totalDivReinvested)}</td>
                    <td className="py-1.5 text-right font-mono text-muted-foreground">{fmt(row.shares, 0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground/60 mt-2">
          Each year, dividends buy new shares which generate even more dividends — the snowball effect accelerates over time.
        </p>
      </div>
    </div>
  );
}

// ── Section 4: Ex-Dividend Calendar ───────────────────────────────────────────

function ExDivCalendar() {
  const rng = useMemo(() => mulberry32(9753), []);
  const events = useMemo(() => buildExDivCalendar(mulberry32(9753)), []);
  const [showTaxInfo, setShowTaxInfo] = useState(false);

  // Group by month
  const byMonth: Record<string, ExDivEvent[]> = {};
  events.forEach((e) => {
    const month = e.exDivDate.slice(0, 7);
    (byMonth[month] = byMonth[month] || []).push(e);
  });

  const months = Object.keys(byMonth).sort();

  const monthName = (ym: string) => {
    const [y, m] = ym.split("-");
    return `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m) - 1]} ${y}`;
  };

  return (
    <div className="space-y-5">
      {/* Strategy overview chips */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-muted/30 border border-border/40 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Events (3 months)</p>
          <p className="text-lg font-semibold text-primary mt-0.5">{events.length}</p>
        </div>
        <div className="bg-muted/30 border border-border/40 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Qualified Dividends</p>
          <p className="text-lg font-semibold text-green-400 mt-0.5">{events.filter((e) => e.isQualified).length}/{events.length}</p>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/30 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Avg Yield</p>
          <p className="text-lg font-semibold text-amber-400 mt-0.5">{fmt(events.reduce((s, e) => s + e.yield, 0) / events.length, 1)}%</p>
        </div>
      </div>

      {/* Monthly calendar */}
      {months.map((ym) => (
        <div key={ym} className="bg-muted/20 border border-border/40 rounded-lg overflow-hidden">
          <div className="bg-muted/30 px-4 py-2 border-b border-border/40">
            <h4 className="text-sm font-medium">{monthName(ym)}</h4>
          </div>
          <div className="divide-y divide-border/20">
            {byMonth[ym].sort((a, b) => a.exDivDate.localeCompare(b.exDivDate)).map((e) => {
              const sc = SECTOR_COLORS_CSS[e.sector] ?? SECTOR_COLORS_CSS["Consumer"];
              const exDivDrop = e.priceAction[4];
              const preRunup = e.priceAction.slice(0, 4).reduce((s, v) => s + v, 0);
              const netCaptureAfterDrop = (e.divPerShare / (e.yield / 100 * 100 / 4)) * 100 + exDivDrop;
              const strategyProfitable = netCaptureAfterDrop > 0;

              return (
                <div key={e.ticker} className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-foreground text-sm w-10 flex-shrink-0">{e.ticker}</span>
                      <span className={cn("px-1.5 py-0.5 rounded text-xs font-medium border flex-shrink-0", sc.bg, sc.text, sc.border)}>{e.sector}</span>
                      <span className="text-xs text-muted-foreground truncate">{e.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {e.isQualified ? (
                        <span className="px-1.5 py-0.5 rounded text-xs bg-green-500/10 border border-green-500/30 text-green-400">Qualified</span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400">Ordinary</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Ex-Div Date</p>
                      <p className="font-mono text-foreground">{e.exDivDate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pay Date</p>
                      <p className="font-mono text-foreground">{e.payDate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Dividend/Share</p>
                      <p className="font-semibold text-green-400">${fmt(e.divPerShare, 4)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Yield</p>
                      <p className="font-semibold text-amber-400">{fmt(e.yield, 1)}%</p>
                    </div>
                  </div>
                  {/* 5-day price action mini chart */}
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-1">5-Day Price Action into Ex-Div (Pre-Run → Drop)</p>
                    <div className="flex items-center gap-0.5">
                      {e.priceAction.map((v, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                          <div
                            className={cn("w-full rounded-sm", v >= 0 ? "bg-green-500/60" : "bg-red-500/60")}
                            style={{ height: Math.abs(v) * 12 + 3, minHeight: 3 }}
                          />
                          <span className={cn("text-[11px]", v >= 0 ? "text-green-400" : "text-red-400")}>
                            {v >= 0 ? "+" : ""}{fmt(v, 2)}%
                          </span>
                          <span className="text-[8px] text-muted-foreground/50">{i === 4 ? "Ex" : `D-${4 - i}`}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Capture strategy profitability */}
                  <div className={cn("mt-2 px-2 py-1.5 rounded text-xs border", strategyProfitable ? "bg-green-500/5 border-green-500/20 text-green-400" : "bg-red-500/5 border-red-500/20 text-red-400")}>
                    Dividend Capture Strategy: {strategyProfitable ? "May be profitable" : "Likely unprofitable"} (pre-runup {preRunup >= 0 ? "+" : ""}{fmt(preRunup, 2)}% vs ex-div drop {fmt(exDivDrop, 2)}% + div yield)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Tax treatment explainer */}
      <div className="bg-muted/20 border border-border/40 rounded-lg p-4 space-y-3">
        <button
          onClick={() => setShowTaxInfo(!showTaxInfo)}
          className="flex items-center gap-2 text-sm font-medium w-full text-left"
        >
          <Info className="w-4 h-4 text-primary" />
          Tax Treatment: Qualified vs. Ordinary Dividends
          <ChevronRight className={cn("w-4 h-4 text-muted-foreground ml-auto transition-transform", showTaxInfo && "rotate-90")} />
        </button>
        {showTaxInfo && (
          <div className="space-y-2 text-xs text-muted-foreground pl-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-green-500/5 border border-green-500/20 rounded p-2.5">
                <p className="font-medium text-green-400 mb-1">Qualified Dividends</p>
                <ul className="space-y-1">
                  <li>Taxed at long-term capital gains rates (0%, 15%, or 20%)</li>
                  <li>Requires 60-day holding period (61 days for preferred)</li>
                  <li>Must be from US corporation or qualifying foreign corp.</li>
                  <li>REITs and MLPs often do NOT qualify</li>
                </ul>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/20 rounded p-2.5">
                <p className="font-medium text-amber-400 mb-1">Ordinary Dividends</p>
                <ul className="space-y-1">
                  <li>Taxed at ordinary income rates (up to 37%)</li>
                  <li>Includes REIT, MLP, and money market dividends</li>
                  <li>Also applies when holding period not met</li>
                  <li>Dividend capture strategy often results in ordinary treatment</li>
                </ul>
              </div>
            </div>
            <p className="text-xs">Note: DRIP shares have cost basis = FMV on reinvestment date. Each reinvestment creates a new holding period lot.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Section 5: Dividend Growth Strategy ───────────────────────────────────────

function DividendGrowthStrategy() {
  const [yocYield, setYocYield] = useState(3.0);
  const [yocGrowth, setYocGrowth] = useState(7.0);
  const [yocYears, setYocYears] = useState(20);

  // YOC projection
  const yocData = useMemo(() => {
    const rows: { year: number; yoc: number; highYieldYoc: number }[] = [];
    for (let y = 1; y <= yocYears; y++) {
      const yoc = yocYield * Math.pow(1 + yocGrowth / 100, y);
      const highYieldYoc = 6.5 * Math.pow(1.015, y); // high yield with 1.5% growth
      rows.push({ year: y, yoc, highYieldYoc });
    }
    return rows;
  }, [yocYield, yocGrowth, yocYears]);

  const finalYoc = yocData[yocData.length - 1] ?? { yoc: 0, highYieldYoc: 0 };

  // DGI vs High-Yield wealth accumulation SVG
  const W = 560, H = 200, padL = 56, padR = 16, padT = 16, padB = 32;

  // Wealth accumulation: $10k invested, different return assumptions
  const dgiWealth = useMemo(() => {
    const rows: { year: number; dgi: number; highYield: number }[] = [];
    let dgiVal = 10000, hyVal = 10000;
    const dgiYield = yocYield / 100;
    const dgiPriceGrowth = 0.07; // typical growth stock appreciation
    const hyYield = 0.065;
    const hyPriceGrowth = 0.01; // high yield tends to have low growth
    for (let y = 1; y <= yocYears; y++) {
      dgiVal *= (1 + dgiPriceGrowth + dgiYield * (1 + yocGrowth / 100) * (y / yocYears));
      hyVal *= (1 + hyPriceGrowth + hyYield);
      rows.push({ year: y, dgi: dgiVal, highYield: hyVal });
    }
    return rows;
  }, [yocYield, yocGrowth, yocYears]);

  const maxWealth = Math.max(...dgiWealth.map((d) => Math.max(d.dgi, d.highYield))) * 1.05;
  const toX = (i: number) => padL + (i / (dgiWealth.length - 1)) * (W - padL - padR);
  const toY = (v: number) => padT + ((maxWealth - v) / maxWealth) * (H - padT - padB);

  const dgiPoints = dgiWealth.map((d, i) => `${toX(i)},${toY(d.dgi)}`).join(" ");
  const hyPoints  = dgiWealth.map((d, i) => `${toX(i)},${toY(d.highYield)}`).join(" ");

  // DGI screen filters — which DGI_STOCKS pass
  const dgiFilter = { minYield: 0.5, maxYield: 5, minGrowth: 5, maxPayout: 70, minFcfCoverage: 1.5 };
  const passingStocks = DGI_STOCKS.filter((s) =>
    s.currentYield >= dgiFilter.minYield &&
    s.currentYield <= dgiFilter.maxYield &&
    s.divGrowthRate >= dgiFilter.minGrowth &&
    s.payoutRatio <= dgiFilter.maxPayout &&
    s.fcfCoverage >= dgiFilter.minFcfCoverage
  );

  return (
    <div className="space-y-5">
      {/* YOC Calculator */}
      <div className="bg-muted/20 border border-border/40 rounded-lg p-4 space-y-4">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
          Yield on Cost (YOC) Calculator
        </h4>
        <p className="text-xs text-muted-foreground">
          YOC measures the dividend yield relative to your original purchase price — it grows each year as dividends increase even if the share price stays flat.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Purchase Yield",     value: yocYield,  min: 1,  max: 6,  step: 0.5, display: `${fmt(yocYield, 1)}%`,  setter: setYocYield,  color: "text-green-400" },
            { label: "Annual Div Growth",  value: yocGrowth, min: 1,  max: 15, step: 0.5, display: `${fmt(yocGrowth, 1)}%`, setter: setYocGrowth, color: "text-primary" },
            { label: "Years to Hold",      value: yocYears,  min: 5,  max: 30, step: 5,   display: `${yocYears} yrs`,        setter: setYocYears,  color: "text-amber-400" },
          ].map((s) => (
            <div key={s.label}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-muted-foreground">{s.label}</label>
                <span className={cn("text-sm font-semibold", s.color)}>{s.display}</span>
              </div>
              <Slider value={[s.value]} onValueChange={([v]) => s.setter(v)} min={s.min} max={s.max} step={s.step} className="w-full" />
            </div>
          ))}
        </div>

        {/* YOC result */}
        <div className="flex flex-wrap gap-3">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground">YOC after {yocYears} years</p>
            <p className="text-2xl font-bold text-green-400">{fmt(finalYoc.yoc, 1)}%</p>
            <p className="text-xs text-muted-foreground mt-0.5">vs {fmt(yocYield, 1)}% purchase yield</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground">High-yield ({fmt(6.5, 1)}% + 1.5% growth) YOC</p>
            <p className="text-2xl font-bold text-amber-400">{fmt(finalYoc.highYieldYoc, 1)}%</p>
            <p className="text-xs text-muted-foreground mt-0.5">often stagnates over time</p>
          </div>
          <div className="bg-primary/10 border border-border rounded-lg px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground">DGI Advantage</p>
            <p className={cn("text-2xl font-bold", finalYoc.yoc > finalYoc.highYieldYoc ? "text-primary" : "text-muted-foreground")}>
              {finalYoc.yoc > finalYoc.highYieldYoc ? "+" : ""}{fmt(finalYoc.yoc - finalYoc.highYieldYoc, 1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">DGI vs high-yield</p>
          </div>
        </div>

        {/* YOC over time chart (bar chart) */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">YOC trajectory over {yocYears} years</p>
          <div className="flex items-end gap-px h-16">
            {yocData.filter((_, i) => i % Math.max(1, Math.floor(yocYears / 20)) === 0 || i === yocYears - 1).map((d, i) => {
              const maxYoc = Math.max(...yocData.map((r) => Math.max(r.yoc, r.highYieldYoc)));
              const dgiH = (d.yoc / maxYoc) * 100;
              const hyH = (d.highYieldYoc / maxYoc) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col justify-end gap-px">
                  <div className="w-full flex items-end gap-px">
                    <div className="flex-1 bg-green-500/60 rounded-t-sm" style={{ height: `${dgiH}%`, minHeight: 2 }} title={`YOC: ${fmt(d.yoc, 1)}%`} />
                    <div className="flex-1 bg-amber-500/40 rounded-t-sm" style={{ height: `${hyH}%`, minHeight: 2 }} title={`HY YOC: ${fmt(d.highYieldYoc, 1)}%`} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-1">
            <span className="flex items-center gap-1 text-xs text-green-400"><span className="w-3 h-2 bg-green-500/60 inline-block rounded" /> DGI ({fmt(yocYield, 1)}% + {fmt(yocGrowth, 1)}% growth)</span>
            <span className="flex items-center gap-1 text-xs text-amber-400"><span className="w-3 h-2 bg-amber-500/40 inline-block rounded" /> High Yield (6.5% + 1.5% growth)</span>
          </div>
        </div>
      </div>

      {/* DGI vs High-Yield Wealth Accumulation */}
      <div className="bg-muted/20 border border-border/40 rounded-lg p-4">
        <h4 className="text-sm font-semibold mb-1">Wealth Accumulation: DGI vs High-Yield ($10k invested)</h4>
        <div className="flex gap-4 mb-2">
          <span className="flex items-center gap-1.5 text-xs text-green-400"><span className="w-4 h-0.5 bg-green-400 inline-block" /> DGI (growth + rising div)</span>
          <span className="flex items-center gap-1.5 text-xs text-amber-400"><span className="w-4 h-0.5 border-b border-dashed border-amber-400 inline-block" /> High-Yield (high income, low growth)</span>
        </div>
        {dgiWealth.length > 1 && (
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
            {[0, 0.25, 0.5, 0.75, 1.0].map((frac, i) => {
              const v = maxWealth * frac;
              const y = toY(v);
              return (
                <g key={i}>
                  <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="currentColor" strokeOpacity={0.06} strokeWidth={1} />
                  <text x={padL - 5} y={y + 4} fontSize={9} fill="currentColor" fillOpacity={0.4} textAnchor="end">{fmtK(v)}</text>
                </g>
              );
            })}
            {dgiWealth.filter((_, i) => i % Math.max(1, Math.floor(yocYears / 5)) === 0 || i === yocYears - 1).map((d, idx) => {
              const i = dgiWealth.indexOf(d);
              return (
                <text key={idx} x={toX(i)} y={H - padB + 12} fontSize={9} fill="currentColor" fillOpacity={0.4} textAnchor="middle">
                  Yr {d.year}
                </text>
              );
            })}
            <polyline points={hyPoints}  fill="none" stroke="rgb(251,191,36)" strokeWidth={2} strokeDasharray="5,3" strokeLinejoin="round" />
            <polyline points={dgiPoints} fill="none" stroke="rgb(52,211,153)"  strokeWidth={2.5} strokeLinejoin="round" />
            <circle cx={toX(dgiWealth.length - 1)} cy={toY(dgiWealth[dgiWealth.length - 1]?.dgi || 0)} r={4} fill="rgb(52,211,153)" />
            <circle cx={toX(dgiWealth.length - 1)} cy={toY(dgiWealth[dgiWealth.length - 1]?.highYield || 0)} r={3} fill="rgb(251,191,36)" />
          </svg>
        )}
      </div>

      {/* DGI Screen */}
      <div className="bg-muted/20 border border-border/40 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            DGI Stock Screen
          </h4>
          <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
            <span className="px-1.5 py-0.5 bg-muted/40 rounded border border-border/40">Yield 0.5–5%</span>
            <span className="px-1.5 py-0.5 bg-muted/40 rounded border border-border/40">Growth &gt;5%</span>
            <span className="px-1.5 py-0.5 bg-muted/40 rounded border border-border/40">Payout &lt;70%</span>
            <span className="px-1.5 py-0.5 bg-muted/40 rounded border border-border/40">FCF &gt;1.5x</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{passingStocks.length} of {DGI_STOCKS.length} model stocks pass the DGI screen</p>

        <div className="rounded-lg border border-border/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-3 py-2 text-left text-muted-foreground">Stock</th>
                  <th className="px-3 py-2 text-right text-muted-foreground">Yield</th>
                  <th className="px-3 py-2 text-right text-muted-foreground">Div Growth</th>
                  <th className="px-3 py-2 text-right text-muted-foreground">Payout</th>
                  <th className="px-3 py-2 text-right text-muted-foreground">FCF Cov.</th>
                  <th className="px-3 py-2 text-right text-muted-foreground">Streak</th>
                  <th className="px-3 py-2 text-right text-muted-foreground">20yr YOC</th>
                  <th className="px-3 py-2 text-center text-muted-foreground">DGI Pass</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {DGI_STOCKS.map((s) => {
                  const passes = passingStocks.includes(s);
                  const sc = SECTOR_COLORS_CSS[s.sector] ?? SECTOR_COLORS_CSS["Consumer"];
                  return (
                    <tr key={s.ticker} className={cn("transition-colors", passes ? "hover:bg-green-500/5" : "hover:bg-muted/20 opacity-60")}>
                      <td className="px-3 py-2">
                        <div className="font-semibold text-foreground">{s.ticker}</div>
                        <div className="text-muted-foreground/70 truncate max-w-[100px]">{s.name}</div>
                        <span className={cn("px-1 py-0.5 rounded text-[11px] font-medium border mt-0.5 inline-block", sc.bg, sc.text, sc.border)}>{s.sector}</span>
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-green-400">{fmt(s.currentYield, 1)}%</td>
                      <td className={cn("px-3 py-2 text-right font-mono", s.divGrowthRate >= 10 ? "text-primary" : "text-muted-foreground")}>+{fmt(s.divGrowthRate, 1)}%</td>
                      <td className={cn("px-3 py-2 text-right font-mono", s.payoutRatio < 40 ? "text-green-400" : s.payoutRatio < 60 ? "text-muted-foreground" : "text-amber-400")}>{s.payoutRatio}%</td>
                      <td className={cn("px-3 py-2 text-right font-mono", s.fcfCoverage >= 3 ? "text-green-400" : s.fcfCoverage >= 1.5 ? "text-muted-foreground" : "text-amber-400")}>{fmt(s.fcfCoverage, 1)}x</td>
                      <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                        {s.consecutiveYears}y
                        {s.consecutiveYears >= 50 && <Crown className="inline w-2.5 h-2.5 ml-0.5 text-yellow-400" />}
                        {s.consecutiveYears >= 25 && s.consecutiveYears < 50 && <Award className="inline w-2.5 h-2.5 ml-0.5 text-primary" />}
                      </td>
                      <td className={cn("px-3 py-2 text-right font-mono font-semibold", s.yoc20 >= 10 ? "text-green-400" : s.yoc20 >= 5 ? "text-muted-foreground" : "text-muted-foreground")}>
                        {fmt(s.yoc20, 1)}%
                      </td>
                      <td className="px-3 py-2 text-center">
                        {passes ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto" />
                        ) : (
                          <span className="text-muted-foreground/40 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-xs text-muted-foreground/60">
          DGI philosophy: favor consistent dividend GROWTH over high current yield. A 1% yield growing 15%/year becomes 16% YOC after 20 years.
        </p>
      </div>

      {/* DGI Framework */}
      <div className="bg-muted/20 border border-border/40 rounded-lg p-4 space-y-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          DGI Framework Principles
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
          {[
            { title: "10+ Year Streak", desc: "Companies that have raised dividends for 10+ consecutive years demonstrate commitment through multiple economic cycles." },
            { title: "Yield on Cost Mindset", desc: "The relevant metric is not today's yield but your yield on original cost basis 10–20 years from now." },
            { title: "FCF Over EPS", desc: "Prefer FCF-based payout ratios. Dividends come from cash, not accounting earnings." },
            { title: "Dividend Growth Rate > Inflation", desc: "Target at least 5% annual dividend growth to maintain real purchasing power of your income stream." },
            { title: "Reinvest in the Dip", desc: "When quality DGI stocks dip, your DRIP buys more shares at lower cost — enhancing future YOC." },
            { title: "Quality > Quantity", desc: "10 high-quality DGI compounders will outperform 50 mediocre high-yielders over a 20-year horizon." },
          ].map((p) => (
            <div key={p.title} className="bg-muted/30 rounded-lg p-2.5">
              <p className="font-medium text-foreground mb-0.5">{p.title}</p>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function DividendIncomeTracker() {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="dashboard">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center gap-1 text-xs">
            <DollarSign className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="safety" className="flex items-center gap-1 text-xs">
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Safety</span>
          </TabsTrigger>
          <TabsTrigger value="drip" className="flex items-center gap-1 text-xs">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">DRIP</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-1 text-xs">
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ex-Div</span>
          </TabsTrigger>
          <TabsTrigger value="dgi" className="flex items-center gap-1 text-xs">
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">DGI</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4">
          <IncomeDashboard />
        </TabsContent>
        <TabsContent value="safety" className="mt-4">
          <DividendSafetyScoring />
        </TabsContent>
        <TabsContent value="drip" className="mt-4">
          <DripSimulator />
        </TabsContent>
        <TabsContent value="calendar" className="mt-4">
          <ExDivCalendar />
        </TabsContent>
        <TabsContent value="dgi" className="mt-4">
          <DividendGrowthStrategy />
        </TabsContent>
      </Tabs>
    </div>
  );
}
