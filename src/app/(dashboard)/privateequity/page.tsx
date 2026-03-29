"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Building2,
  Users,
  Target,
  Layers,
  ArrowRight,
  Info,
  CheckCircle,
  AlertTriangle,
  Briefcase,
  Calculator,
  FileText,
  Search,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 167;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-generate random values deterministically
const RAND_POOL: number[] = [];
for (let i = 0; i < 200; i++) RAND_POOL.push(rand());
let randIdx = 0;
const r = () => RAND_POOL[randIdx++ % RAND_POOL.length];

// ── Formatting helpers ────────────────────────────────────────────────────────

function fmtB(n: number): string {
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}T`;
  if (Math.abs(n) >= 1) return `$${n.toFixed(1)}B`;
  return `$${(n * 1000).toFixed(0)}M`;
}

function fmtPct(n: number, d = 1): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(d)}%`;
}

function fmtMult(n: number): string {
  return `${n.toFixed(2)}x`;
}

function fmtIRR(n: number): string {
  return `${n.toFixed(1)}%`;
}

// ── Shared components ─────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: "pos" | "neg" | "neutral";
}) {
  const valClass =
    highlight === "pos"
      ? "text-emerald-400"
      : highlight === "neg"
      ? "text-rose-400"
      : "text-foreground";
  return (
    <div className="rounded-md border border-border bg-foreground/5 p-4 flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("text-xl font-bold", valClass)}>{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
      {children}
    </h3>
  );
}

function InfoBox({
  children,
  variant = "blue",
}: {
  children: React.ReactNode;
  variant?: "blue" | "amber" | "emerald" | "violet";
}) {
  const colors = {
    blue: "bg-primary/10 border-border text-primary",
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-200",
    emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-200",
    violet: "bg-primary/10 border-border text-primary",
  };
  return (
    <div className={cn("rounded-lg border p-3 text-xs leading-relaxed", colors[variant])}>
      {children}
    </div>
  );
}

function SliderInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground font-medium">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-violet-500"
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1 — PE Industry Overview
// ══════════════════════════════════════════════════════════════════════════════

const PE_FIRMS = [
  { name: "Blackstone", aum: 1050, focus: "Real estate, credit, PE" },
  { name: "KKR", aum: 553, focus: "PE, infra, credit, real assets" },
  { name: "Carlyle", aum: 426, focus: "Corporate PE, credit, real assets" },
  { name: "Apollo", aum: 651, focus: "Credit-focused, PE, real assets" },
  { name: "Ares", aum: 392, focus: "Credit, PE, real estate" },
  { name: "TPG", aum: 224, focus: "PE, impact, real estate" },
];

const BUYOUT_DATA = [
  { year: "2016", volume: 346, avgMultiple: 10.2 },
  { year: "2017", volume: 412, avgMultiple: 10.8 },
  { year: "2018", volume: 457, avgMultiple: 11.1 },
  { year: "2019", volume: 489, avgMultiple: 11.6 },
  { year: "2020", volume: 318, avgMultiple: 11.0 },
  { year: "2021", volume: 684, avgMultiple: 13.1 },
  { year: "2022", volume: 527, avgMultiple: 12.4 },
  { year: "2023", volume: 374, avgMultiple: 11.8 },
  { year: "2024", volume: 421, avgMultiple: 12.2 },
];

const VINTAGE_DATA = [
  { year: "2009", irr: 22.4 },
  { year: "2010", irr: 18.7 },
  { year: "2011", irr: 16.1 },
  { year: "2012", irr: 19.3 },
  { year: "2013", irr: 17.8 },
  { year: "2014", irr: 14.2 },
  { year: "2015", irr: 12.6 },
  { year: "2016", irr: 15.9 },
  { year: "2017", irr: 18.4 },
  { year: "2018", irr: 13.7 },
  { year: "2019", irr: 16.2 },
  { year: "2020", irr: 21.8 },
  { year: "2021", irr: 11.3 },
  { year: "2022", irr: 8.4 },
  { year: "2023", irr: 7.1 },
];

const STRATEGY_COMPARISON = [
  { name: "Buyout PE", risk: 65, return: 82, stage: "Mature", minInvest: "$5M+" },
  { name: "Venture Capital", risk: 90, return: 95, stage: "Early", minInvest: "$250K+" },
  { name: "Growth Equity", risk: 60, return: 72, stage: "Expansion", minInvest: "$1M+" },
  { name: "Distressed Debt", risk: 75, return: 68, stage: "Turnaround", minInvest: "$10M+" },
  { name: "Mezzanine", risk: 45, return: 52, stage: "Mature", minInvest: "$5M+" },
];

function IndustryOverview() {
  const maxVol = Math.max(...BUYOUT_DATA.map((d) => d.volume));

  // IRR color for heatmap
  function irrColor(irr: number): string {
    if (irr >= 20) return "#10b981"; // emerald
    if (irr >= 16) return "#34d399";
    if (irr >= 12) return "#6ee7b7";
    if (irr >= 9) return "#fbbf24";
    return "#f87171";
  }

  return (
    <div className="space-y-8">
      {/* Header stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Global PE AUM" value="$7.0T" sub="2024 estimate" highlight="pos" />
        <StatCard label="Annual Buyout Vol" value="$421B" sub="2024 deal value" highlight="neutral" />
        <StatCard label="Avg Entry Multiple" value="12.2x" sub="EV/EBITDA" highlight="neutral" />
        <StatCard label="PE 10-yr Net IRR" value="~15%" sub="vs 12% S&P 500" highlight="pos" />
      </div>

      {/* Major firms */}
      <div>
        <SectionTitle><Building2 className="w-4 h-4" /> Major PE Firms by AUM</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PE_FIRMS.map((f) => (
            <div key={f.name} className="rounded-lg border border-border bg-foreground/5 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-foreground">{f.name}</span>
                <Badge className="bg-primary/20 text-primary border-border text-xs">
                  ${f.aum}B
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{f.focus}</p>
              <div className="mt-2 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(f.aum / 1050) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buyout volume bar chart */}
      <div>
        <SectionTitle><BarChart3 className="w-4 h-4" /> Global Buyout Volume ($B) & Avg Entry Multiple</SectionTitle>
        <div className="rounded-md border border-border border-l-4 border-l-primary bg-foreground/5 p-6">
          <svg viewBox="0 0 700 200" className="w-full" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
              <line
                key={t}
                x1={50}
                y1={10 + (1 - t) * 160}
                x2={690}
                y2={10 + (1 - t) * 160}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={1}
              />
            ))}
            {/* Volume bars */}
            {BUYOUT_DATA.map((d, i) => {
              const barW = 52;
              const gap = 26;
              const x = 60 + i * (barW + gap);
              const barH = (d.volume / maxVol) * 140;
              const y = 170 - barH;
              return (
                <g key={d.year}>
                  <rect x={x} y={y} width={barW} height={barH} rx={3} fill="#8b5cf6" opacity={0.75} />
                  <text x={x + barW / 2} y={185} textAnchor="middle" fontSize={9} fill="#a1a1aa">
                    {d.year}
                  </text>
                  <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize={8} fill="#c4b5fd">
                    {d.volume}
                  </text>
                </g>
              );
            })}
            {/* Entry multiple line */}
            {BUYOUT_DATA.map((d, i) => {
              const barW = 52;
              const gap = 26;
              const cx = 60 + barW / 2 + i * (barW + gap);
              const cy = 170 - ((d.avgMultiple - 9) / 5) * 130;
              return i === 0 ? null : (
                <line
                  key={d.year}
                  x1={60 + barW / 2 + (i - 1) * (barW + gap)}
                  y1={170 - ((BUYOUT_DATA[i - 1].avgMultiple - 9) / 5) * 130}
                  x2={cx}
                  y2={cy}
                  stroke="#f59e0b"
                  strokeWidth={2}
                />
              );
            })}
            {BUYOUT_DATA.map((d, i) => {
              const barW = 52;
              const gap = 26;
              const cx = 60 + barW / 2 + i * (barW + gap);
              const cy = 170 - ((d.avgMultiple - 9) / 5) * 130;
              return (
                <circle key={`dot-${d.year}`} cx={cx} cy={cy} r={4} fill="#f59e0b" />
              );
            })}
            {/* Y axis label */}
            <text x={10} y={170} textAnchor="middle" fontSize={8} fill="#71717a">0</text>
            <text x={10} y={90} textAnchor="middle" fontSize={8} fill="#71717a">{(maxVol / 2).toFixed(0)}</text>
            <text x={10} y={18} textAnchor="middle" fontSize={8} fill="#71717a">{maxVol}</text>
          </svg>
          <div className="flex gap-6 justify-center mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-primary inline-block" /> Volume ($B)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-2 rounded bg-amber-400 inline-block" /> Avg Entry Multiple (x)
            </span>
          </div>
        </div>
      </div>

      {/* Vintage year heatmap */}
      <div>
        <SectionTitle><TrendingUp className="w-4 h-4" /> Vintage Year IRR Heatmap</SectionTitle>
        <div className="rounded-md border border-border bg-foreground/5 p-4">
          <div className="flex flex-wrap gap-2">
            {VINTAGE_DATA.map((v) => (
              <div key={v.year} className="flex flex-col items-center gap-1">
                <div
                  className="w-14 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-black"
                  style={{ backgroundColor: irrColor(v.irr) }}
                >
                  {v.irr.toFixed(1)}%
                </div>
                <span className="text-xs text-muted-foreground">{v.year}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded inline-block bg-emerald-400" /> 20%+
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded inline-block bg-emerald-300" /> 16–20%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded inline-block bg-emerald-200 opacity-60" /> 12–16%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded inline-block bg-amber-400" /> 9–12%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded inline-block bg-rose-400" /> &lt;9%
            </span>
          </div>
          <InfoBox variant="blue" >
            <strong>Key insight:</strong> 2009–2010 vintages delivered exceptional returns as firms bought assets cheaply in the aftermath of the GFC. 2021–2023 vintages face headwinds from elevated entry multiples and rising interest rates compressing exit valuations.
          </InfoBox>
        </div>
      </div>

      {/* PE vs VC vs Growth comparison */}
      <div>
        <SectionTitle><Layers className="w-4 h-4" /> Strategy Comparison: Buyout PE vs VC vs Growth Equity</SectionTitle>
        <div className="space-y-3">
          {STRATEGY_COMPARISON.map((s) => (
            <div key={s.name} className="rounded-md border border-border bg-foreground/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">{s.name}</span>
                <div className="flex gap-2">
                  <Badge className="bg-muted text-foreground text-xs">{s.stage}</Badge>
                  <Badge className="bg-primary/20 text-primary border-border text-xs">{s.minInvest}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Risk</span>
                    <span className="text-rose-400">{s.risk}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
                    <div className="h-full rounded-full bg-rose-500" style={{ width: `${s.risk}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Return Potential</span>
                    <span className="text-emerald-400">{s.return}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${s.return}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <InfoBox variant="violet">
          <strong>PME (Public Market Equivalent):</strong> PE buyout funds have historically delivered ~300–500 bps of outperformance vs the S&P 500 on a PME basis, though this alpha has compressed in recent years due to increased competition and higher entry multiples. Net returns of 12–18% IRR over 10-year periods remain the industry benchmark.
        </InfoBox>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2 — LBO Modeling
// ══════════════════════════════════════════════════════════════════════════════

const LBO_TARGETS = [
  {
    name: "MidWest HVAC Corp",
    sector: "HVAC Services",
    revenue: 280,
    ebitda: 56,
    ebitdaMargin: 20,
    capex: 8.4,
    growth: 6.5,
  },
  {
    name: "PackageCo Solutions",
    sector: "Packaging",
    revenue: 510,
    ebitda: 92,
    ebitdaMargin: 18,
    capex: 18.4,
    growth: 4.2,
  },
  {
    name: "TechServ Systems",
    sector: "B2B SaaS",
    revenue: 195,
    ebitda: 58,
    ebitdaMargin: 29.7,
    capex: 3.9,
    growth: 14.0,
  },
  {
    name: "HealthPath Labs",
    sector: "Healthcare Services",
    revenue: 340,
    ebitda: 75,
    ebitdaMargin: 22.1,
    capex: 11.2,
    growth: 8.3,
  },
  {
    name: "FleetPro Logistics",
    sector: "3PL/Logistics",
    revenue: 720,
    ebitda: 108,
    ebitdaMargin: 15,
    capex: 28.8,
    growth: 5.8,
  },
];

function calcLBO(
  ebitda: number,
  growth: number,
  entryMult: number,
  leverageRatio: number,
  mgmtFee: number,
  exitMult: number,
  holdYears: number
) {
  const entryEV = ebitda * entryMult;
  const totalDebt = ebitda * leverageRatio;
  const entryEquity = entryEV - totalDebt;

  // Debt schedule: assume 5% interest rate, cash sweep
  const interestRate = 0.055;
  const schedule: { year: number; ebitda: number; debt: number; interest: number; cashSweep: number }[] = [];
  let debt = totalDebt;
  let currentEBITDA = ebitda;

  for (let yr = 1; yr <= holdYears; yr++) {
    currentEBITDA *= 1 + growth / 100;
    const interest = debt * interestRate;
    const fcf = currentEBITDA * 0.55 - interest - mgmtFee; // ~55% conversion after taxes/capex
    const cashSweep = Math.min(Math.max(0, fcf), debt);
    debt = Math.max(0, debt - cashSweep);
    schedule.push({
      year: yr,
      ebitda: currentEBITDA,
      debt,
      interest,
      cashSweep,
    });
  }

  const exitEBITDA = schedule[schedule.length - 1].ebitda;
  const exitDebt = schedule[schedule.length - 1].debt;
  const exitEV = exitEBITDA * exitMult;
  const exitEquity = Math.max(0, exitEV - exitDebt);
  const moic = exitEquity / entryEquity;
  // IRR: solve moic = (1+irr)^holdYears
  const irr = (Math.pow(moic, 1 / holdYears) - 1) * 100;

  return { entryEV, totalDebt, entryEquity, exitEV, exitDebt, exitEquity, moic, irr, schedule };
}

function LBOModeling() {
  const [targetIdx, setTargetIdx] = useState(0);
  const [entryMult, setEntryMult] = useState(10.0);
  const [leverageRatio, setLeverageRatio] = useState(5.0);
  const [mgmtFee, setMgmtFee] = useState(2.0);
  const [exitMult, setExitMult] = useState(11.0);
  const [holdYears, setHoldYears] = useState(5);

  const target = LBO_TARGETS[targetIdx];

  const result = useMemo(
    () =>
      calcLBO(
        target.ebitda,
        target.growth,
        entryMult,
        leverageRatio,
        mgmtFee,
        exitMult,
        holdYears
      ),
    [target, entryMult, leverageRatio, mgmtFee, exitMult, holdYears]
  );

  // IRR sensitivity: 3×3 (entry mult rows × exit mult cols)
  const entryMults = [entryMult - 1.5, entryMult, entryMult + 1.5];
  const exitMults = [exitMult - 1.5, exitMult, exitMult + 1.5];

  function irrSensColor(irr: number): string {
    if (irr >= 25) return "bg-emerald-500/30 text-emerald-300";
    if (irr >= 20) return "bg-emerald-500/20 text-emerald-400";
    if (irr >= 15) return "bg-amber-500/20 text-amber-300";
    if (irr >= 10) return "bg-orange-500/20 text-orange-300";
    return "bg-rose-500/20 text-rose-400";
  }

  return (
    <div className="space-y-8">
      {/* Target selector */}
      <div>
        <SectionTitle><Target className="w-4 h-4" /> Select LBO Target</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {LBO_TARGETS.map((t, i) => (
            <button
              key={t.name}
              onClick={() => setTargetIdx(i)}
              className={cn(
                "rounded-lg border p-3 text-left transition-colors",
                i === targetIdx
                  ? "border-primary bg-primary/15"
                  : "border-border bg-foreground/5 hover:bg-muted/50"
              )}
            >
              <p className="text-xs font-medium text-foreground truncate">{t.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t.sector}</p>
              <div className="flex gap-2 mt-2 text-xs">
                <span className="text-muted-foreground">Rev: <strong className="text-foreground">${t.revenue}M</strong></span>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                EBITDA: <strong className="text-primary">${t.ebitda}M</strong>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Company snapshot */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Revenue" value={`$${target.revenue}M`} sub={target.sector} />
        <StatCard label="EBITDA" value={`$${target.ebitda}M`} sub={`${target.ebitdaMargin.toFixed(1)}% margin`} highlight="pos" />
        <StatCard label="CapEx / Revenue" value={`${((target.capex / target.revenue) * 100).toFixed(1)}%`} sub="Annual capex" />
        <StatCard label="Revenue Growth" value={fmtPct(target.growth)} sub="Projected CAGR" highlight="pos" />
      </div>

      {/* LBO Inputs */}
      <div>
        <SectionTitle><Calculator className="w-4 h-4" /> LBO Model Inputs</SectionTitle>
        <div className="rounded-md border border-border bg-foreground/5 p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <SliderInput
            label="Entry Multiple (EV/EBITDA)"
            value={entryMult}
            min={6}
            max={18}
            step={0.5}
            onChange={setEntryMult}
            format={(v) => `${v.toFixed(1)}x`}
          />
          <SliderInput
            label="Leverage (Debt/EBITDA)"
            value={leverageRatio}
            min={2}
            max={8}
            step={0.5}
            onChange={setLeverageRatio}
            format={(v) => `${v.toFixed(1)}x`}
          />
          <SliderInput
            label="Annual Management Fee ($M)"
            value={mgmtFee}
            min={0.5}
            max={5}
            step={0.5}
            onChange={setMgmtFee}
            format={(v) => `$${v.toFixed(1)}M`}
          />
          <SliderInput
            label="Exit Multiple (EV/EBITDA)"
            value={exitMult}
            min={6}
            max={18}
            step={0.5}
            onChange={setExitMult}
            format={(v) => `${v.toFixed(1)}x`}
          />
          <SliderInput
            label="Holding Period (Years)"
            value={holdYears}
            min={3}
            max={7}
            step={1}
            onChange={setHoldYears}
            format={(v) => `${v} years`}
          />
        </div>
      </div>

      {/* LBO Output */}
      <div>
        <SectionTitle><DollarSign className="w-4 h-4" /> LBO Model Output</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Entry EV" value={`$${result.entryEV.toFixed(0)}M`} sub={`${entryMult.toFixed(1)}x EBITDA`} />
          <StatCard label="Entry Equity" value={`$${result.entryEquity.toFixed(0)}M`} sub="Equity check" />
          <StatCard
            label="MOIC"
            value={fmtMult(result.moic)}
            sub={`${holdYears}-year hold`}
            highlight={result.moic >= 2.5 ? "pos" : result.moic >= 1.5 ? "neutral" : "neg"}
          />
          <StatCard
            label="IRR"
            value={fmtIRR(result.irr)}
            sub="Net equity return"
            highlight={result.irr >= 20 ? "pos" : result.irr >= 12 ? "neutral" : "neg"}
          />
        </div>

        {/* Equity bridge */}
        <div className="mt-4 rounded-md border border-border bg-foreground/5 p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3">Equity Bridge</p>
          <svg viewBox="0 0 600 120" className="w-full">
            {[
              { label: "Entry Equity", value: result.entryEquity, color: "#8b5cf6" },
              { label: "EBITDA Growth", value: (result.exitEquity - result.entryEquity) * 0.5, color: "#10b981" },
              { label: "Debt Paydown", value: (result.totalDebt - result.exitDebt), color: "#3b82f6" },
              { label: "Mult Expansion", value: (result.exitEquity - result.entryEquity) * 0.3, color: "#f59e0b" },
              { label: "Exit Equity", value: result.exitEquity, color: "#6366f1" },
            ].map((seg, i) => {
              const maxV = Math.max(result.entryEquity, result.exitEquity) * 1.1;
              const barH = (seg.value / maxV) * 90;
              const x = 30 + i * 110;
              const y = 100 - barH;
              return (
                <g key={seg.label}>
                  <rect x={x} y={y} width={80} height={barH} rx={4} fill={seg.color} opacity={0.8} />
                  <text x={x + 40} y={y - 4} textAnchor="middle" fontSize={8} fill="#e4e4e7">
                    ${seg.value.toFixed(0)}M
                  </text>
                  <text x={x + 40} y={115} textAnchor="middle" fontSize={7.5} fill="#71717a">
                    {seg.label.length > 12 ? seg.label.substring(0, 11) + "…" : seg.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Debt schedule */}
      <div>
        <SectionTitle><BarChart3 className="w-4 h-4" /> Debt Schedule</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-2 pr-4">Year</th>
                <th className="text-right py-2 pr-4">EBITDA</th>
                <th className="text-right py-2 pr-4">Interest</th>
                <th className="text-right py-2 pr-4">Cash Sweep</th>
                <th className="text-right py-2">Debt Outstanding</th>
              </tr>
            </thead>
            <tbody>
              {result.schedule.map((row) => (
                <tr key={row.year} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-2 pr-4 text-muted-foreground">Year {row.year}</td>
                  <td className="text-right py-2 pr-4 text-emerald-400">${row.ebitda.toFixed(1)}M</td>
                  <td className="text-right py-2 pr-4 text-rose-400">${row.interest.toFixed(1)}M</td>
                  <td className="text-right py-2 pr-4 text-primary">${row.cashSweep.toFixed(1)}M</td>
                  <td className="text-right py-2 text-amber-400">${row.debt.toFixed(1)}M</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* IRR sensitivity table */}
      <div>
        <SectionTitle><BarChart3 className="w-4 h-4" /> IRR Sensitivity: Entry Multiple × Exit Multiple</SectionTitle>
        <div className="rounded-md border border-border bg-foreground/5 p-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left py-2 pr-4">Entry \ Exit</th>
                {exitMults.map((em) => (
                  <th key={em} className="text-center py-2 px-3">{em.toFixed(1)}x</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entryMults.map((ent) => (
                <tr key={ent} className="border-t border-border">
                  <td className="py-2 pr-4 text-muted-foreground font-medium">{ent.toFixed(1)}x</td>
                  {exitMults.map((ex) => {
                    const res = calcLBO(
                      target.ebitda,
                      target.growth,
                      ent,
                      leverageRatio,
                      mgmtFee,
                      ex,
                      holdYears
                    );
                    return (
                      <td key={ex} className="py-2 px-3">
                        <span
                          className={cn(
                            "block text-center rounded px-2 py-1 font-medium",
                            irrSensColor(res.irr)
                          )}
                        >
                          {fmtIRR(res.irr)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-muted-foreground mt-2">Color: green ≥25%, light green ≥20%, amber ≥15%, orange ≥10%, red &lt;10%</p>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3 — Value Creation
// ══════════════════════════════════════════════════════════════════════════════

const VALUE_DRIVERS = [
  { label: "Revenue Growth", contribution: 38, color: "#10b981", description: "Organic growth + bolt-on revenue synergies" },
  { label: "Margin Expansion", contribution: 22, color: "#3b82f6", description: "Cost-out programs, procurement, overhead reduction" },
  { label: "Leverage Paydown", contribution: 25, color: "#8b5cf6", description: "FCF used to repay acquisition debt" },
  { label: "Multiple Expansion", contribution: 15, color: "#f59e0b", description: "Exit at higher EV/EBITDA vs entry" },
];

const BOLT_ONS = [
  { name: "Regional HVAC Co A", price: 28, revenue: 42, synergyEBITDA: 3.2, year: 2 },
  { name: "Southwest Services LLC", price: 35, revenue: 55, synergyEBITDA: 4.8, year: 3 },
  { name: "MidAtlantic Comfort", price: 22, revenue: 31, synergyEBITDA: 2.1, year: 4 },
];

const EXIT_OPTIONS = [
  {
    route: "Strategic Sale",
    avgMOIC: 3.2,
    timeToClose: "3–6 months",
    pros: ["Premium control value", "Immediate liquidity", "Synergy premium from buyer"],
    cons: ["Tax implications", "Cultural integration risk", "No upside post-close"],
    highlight: true,
  },
  {
    route: "IPO / Public Market",
    avgMOIC: 2.8,
    timeToClose: "6–18 months",
    pros: ["Price discovery via market", "Partial liquidity", "Currency for acquisitions"],
    cons: ["Market timing dependency", "Lock-up periods", "Ongoing compliance costs"],
    highlight: false,
  },
  {
    route: "Secondary PE Sale",
    avgMOIC: 2.5,
    timeToClose: "2–4 months",
    pros: ["Clean exit process", "Sponsor familiarity", "Faster than IPO"],
    cons: ["Lower multiple vs strategic", "PE buyer scrutiny", "Less synergy premium"],
    highlight: false,
  },
];

function ValueCreation() {
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const total = VALUE_DRIVERS.reduce((a, b) => a + b.contribution, 0);
  let cumulative = 0;

  return (
    <div className="space-y-8">
      {/* Value creation waterfall */}
      <div>
        <SectionTitle><BarChart3 className="w-4 h-4" /> Sources of Return — Equity Value Waterfall</SectionTitle>
        <div className="rounded-md border border-border bg-foreground/5 p-4">
          <svg viewBox="0 0 600 200" className="w-full">
            {/* Entry equity base */}
            <rect x={20} y={60} width={80} height={120} rx={4} fill="#6366f1" opacity={0.8} />
            <text x={60} y={55} textAnchor="middle" fontSize={9} fill="#c7d2fe">Entry Equity</text>
            <text x={60} y={195} textAnchor="middle" fontSize={8} fill="#a1a1aa">$100M</text>

            {/* Additive blocks */}
            {VALUE_DRIVERS.map((d, i) => {
              const blockH = (d.contribution / total) * 120;
              const blockY = 180 - (blockH + (VALUE_DRIVERS.slice(0, i).reduce((a, b) => a + b.contribution, 0) / total) * 120);
              const x = 130 + i * 110;
              cumulative += d.contribution;
              return (
                <g key={d.label}>
                  <rect
                    x={x}
                    y={blockY}
                    width={80}
                    height={blockH}
                    rx={4}
                    fill={d.color}
                    opacity={selectedDriver === i ? 1 : 0.75}
                    className="cursor-pointer"
                    onClick={() => setSelectedDriver(selectedDriver === i ? null : i)}
                  />
                  <text x={x + 40} y={blockY - 4} textAnchor="middle" fontSize={8} fill="#e4e4e7">
                    +{d.contribution}%
                  </text>
                  <text x={x + 40} y={195} textAnchor="middle" fontSize={8} fill="#71717a">
                    {d.label.length > 10 ? d.label.substring(0, 9) + "…" : d.label}
                  </text>
                </g>
              );
            })}

            {/* Exit equity */}
            <rect x={570} y={20} width={20} height={160} rx={4} fill="#10b981" opacity={0.8} />
            <text x={580} y={16} textAnchor="middle" fontSize={9} fill="#6ee7b7">Exit</text>
            <text x={580} y={195} textAnchor="middle" fontSize={7} fill="#a1a1aa">2.3x</text>
          </svg>
          <AnimatePresence>
            {selectedDriver !== null && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="mt-3"
              >
                <InfoBox variant="blue">
                  <strong>{VALUE_DRIVERS[selectedDriver].label} ({VALUE_DRIVERS[selectedDriver].contribution}% of total return):</strong>{" "}
                  {VALUE_DRIVERS[selectedDriver].description}
                </InfoBox>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex flex-wrap gap-4 mt-3 justify-center">
            {VALUE_DRIVERS.map((d, i) => (
              <button
                key={d.label}
                onClick={() => setSelectedDriver(selectedDriver === i ? null : i)}
                className={cn(
                  "flex items-center gap-1.5 text-xs transition-opacity",
                  selectedDriver !== null && selectedDriver !== i ? "opacity-40" : "opacity-100"
                )}
              >
                <span className="w-3 h-3 rounded" style={{ backgroundColor: d.color }} />
                {d.label} ({d.contribution}%)
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Operational improvements */}
      <div>
        <SectionTitle><TrendingUp className="w-4 h-4" /> Operational Improvement Levers</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Margin Expansion",
              items: ["Procurement / rebate renegotiation", "Overhead right-sizing & back-office consolidation", "Pricing optimization via analytics", "Shift to recurring service contracts"],
              color: "text-primary",
            },
            {
              title: "Revenue Growth",
              items: ["Geographic expansion into new markets", "Cross-sell adjacent product lines", "Digital channel buildout", "Increase wallet share in existing accounts"],
              color: "text-emerald-400",
            },
            {
              title: "Working Capital",
              items: ["DSO reduction (faster collections)", "DPO extension with suppliers", "Inventory lean / JIT implementation", "Cash conversion cycle optimization"],
              color: "text-amber-400",
            },
          ].map((section) => (
            <div key={section.title} className="rounded-md border border-border bg-foreground/5 p-4">
              <p className={cn("text-sm font-medium mb-3", section.color)}>{section.title}</p>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Buy and Build */}
      <div>
        <SectionTitle><Building2 className="w-4 h-4" /> Buy &amp; Build Strategy — Bolt-On Acquisitions</SectionTitle>
        <div className="space-y-3">
          {BOLT_ONS.map((bo) => (
            <div key={bo.name} className="rounded-md border border-border bg-foreground/5 p-4 flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{bo.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Acquired Year {bo.year}</p>
              </div>
              <div className="flex flex-wrap gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Price: </span>
                  <span className="text-foreground font-medium">${bo.price}M</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Revenue: </span>
                  <span className="text-foreground font-medium">${bo.revenue}M</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Synergy EBITDA: </span>
                  <span className="text-emerald-400 font-medium">+${bo.synergyEBITDA}M</span>
                </div>
              </div>
              <Badge className="bg-primary/20 text-primary border-border text-xs">
                {(bo.price / (bo.synergyEBITDA + bo.revenue * 0.15)).toFixed(1)}x adj. EV/EBITDA
              </Badge>
            </div>
          ))}
        </div>
        <InfoBox variant="emerald">
          <strong>Buy &amp; Build thesis:</strong> Platform + bolt-on strategy allows the PE fund to acquire smaller businesses at 5–7x EBITDA and realize a multiple arbitrage at exit as the enlarged platform commands 10–14x. Synergies from shared infrastructure, cross-selling, and overhead elimination accelerate EBITDA growth.
        </InfoBox>
      </div>

      {/* Management incentives */}
      <div>
        <SectionTitle><Users className="w-4 h-4" /> Management Incentive Plan (MIP)</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-md border border-border bg-foreground/5 p-4">
            <p className="text-sm font-medium text-amber-400 mb-2">Sweet Equity</p>
            <p className="text-xs text-muted-foreground leading-relaxed">Management co-invests at same entry price but receives disproportionate upside above hurdle. Typical pool: 15–20% of equity. Vesting: 20% per year over 5 years.</p>
          </div>
          <div className="rounded-md border border-border bg-foreground/5 p-4">
            <p className="text-sm font-medium text-primary mb-2">IRR Hurdles</p>
            <p className="text-xs text-muted-foreground leading-relaxed">Management equity kicks in above 8% preferred return. Accelerated participation above 20% IRR. Full vesting on change-of-control event regardless of time served.</p>
          </div>
          <div className="rounded-md border border-border bg-foreground/5 p-4">
            <p className="text-sm font-medium text-emerald-400 mb-2">Annual Bonus</p>
            <p className="text-xs text-muted-foreground leading-relaxed">Cash bonus tied to EBITDA, revenue, and cash conversion targets. Typically 30–100% of base salary. Clawback if restatement within 3 years.</p>
          </div>
        </div>
      </div>

      {/* Exit options */}
      <div>
        <SectionTitle><ArrowRight className="w-4 h-4" /> Exit Routes — Maximizing Value for LPs</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {EXIT_OPTIONS.map((opt) => (
            <div
              key={opt.route}
              className={cn(
                "rounded-md border p-4",
                opt.highlight
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-border bg-foreground/5"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <p className={cn("text-sm font-medium", opt.highlight ? "text-emerald-300" : "text-foreground")}>
                  {opt.route}
                </p>
                {opt.highlight && (
                  <Badge className="bg-emerald-500/30 text-emerald-200 text-xs border-emerald-500/30">Best</Badge>
                )}
              </div>
              <div className="flex gap-4 text-xs mb-3">
                <span className="text-muted-foreground">Avg MOIC: <strong className="text-foreground">{opt.avgMOIC}x</strong></span>
                <span className="text-muted-foreground">Timeline: <strong className="text-foreground">{opt.timeToClose}</strong></span>
              </div>
              <div className="space-y-1 text-xs">
                {opt.pros.map((p) => (
                  <p key={p} className="flex items-start gap-1.5 text-muted-foreground">
                    <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" /> {p}
                  </p>
                ))}
                {opt.cons.map((c) => (
                  <p key={c} className="flex items-start gap-1.5 text-muted-foreground">
                    <AlertTriangle className="w-3 h-3 text-rose-500 mt-0.5 flex-shrink-0" /> {c}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 4 — Fund Economics
// ══════════════════════════════════════════════════════════════════════════════

function calcFundEconomics(committedCapital: number, targetIRR: number) {
  const mgmtFee = committedCapital * 0.02; // 2% per year × 10yr
  const totalFees = mgmtFee * 5 + committedCapital * 0.015 * 5; // commitment + invested period
  const investedCapital = committedCapital - totalFees * 0.1;

  const years = 10;
  const grossValue = investedCapital * Math.pow(1 + targetIRR / 100, years);
  const grossProfit = grossValue - committedCapital;
  const hurdle = committedCapital * (Math.pow(1.08, years) - 1); // 8% pref
  const carryableProfit = Math.max(0, grossProfit - hurdle);
  const gpCarry = carryableProfit * 0.20;
  const lpProfit = grossProfit - gpCarry;
  const netIRR = (Math.pow((committedCapital + lpProfit) / committedCapital, 1 / years) - 1) * 100;

  return {
    committedCapital,
    investedCapital,
    totalFees,
    grossValue,
    grossProfit,
    hurdle,
    carryableProfit,
    gpCarry,
    lpProfit,
    netIRR,
    moic: (committedCapital + lpProfit) / committedCapital,
  };
}

function FundEconomics() {
  const [committedCapital, setCommittedCapital] = useState(1000); // $M
  const [targetIRR, setTargetIRR] = useState(20);

  const econ = useMemo(() => calcFundEconomics(committedCapital, targetIRR), [committedCapital, targetIRR]);

  // Waterfall scenarios
  const scenarios = [12, 15, 20, 25, 30].map((irr) => ({
    irr,
    econ: calcFundEconomics(committedCapital, irr),
  }));

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="rounded-md border border-border bg-foreground/5 p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        <SliderInput
          label="Fund Size (Committed Capital $M)"
          value={committedCapital}
          min={100}
          max={5000}
          step={100}
          onChange={setCommittedCapital}
          format={(v) => `$${v.toFixed(0)}M`}
        />
        <SliderInput
          label="Target Gross IRR"
          value={targetIRR}
          min={8}
          max={35}
          step={1}
          onChange={setTargetIRR}
          format={(v) => `${v.toFixed(0)}%`}
        />
      </div>

      {/* Output stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="LP Net IRR" value={fmtIRR(econ.netIRR)} highlight={econ.netIRR >= 15 ? "pos" : "neutral"} />
        <StatCard label="LP Net MOIC" value={fmtMult(econ.moic)} highlight={econ.moic >= 2 ? "pos" : "neutral"} />
        <StatCard label="GP Carry ($M)" value={`$${econ.gpCarry.toFixed(0)}M`} sub="20% above 8% hurdle" highlight="pos" />
        <StatCard label="LP Profit ($M)" value={`$${econ.lpProfit.toFixed(0)}M`} highlight="pos" />
      </div>

      {/* Fee structure explanation */}
      <div>
        <SectionTitle><DollarSign className="w-4 h-4" /> Management Fee Structure</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-md border border-border bg-foreground/5 p-4">
            <p className="text-sm font-medium text-foreground mb-2">Commitment Period (Years 1–5)</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              2.0% × <strong className="text-primary">${committedCapital}M committed capital</strong> ={" "}
              <strong className="text-amber-300">${(committedCapital * 0.02).toFixed(0)}M/yr</strong> management fee.
              Fee base is full committed capital regardless of deployment pace.
            </p>
          </div>
          <div className="rounded-md border border-border bg-foreground/5 p-4">
            <p className="text-sm font-medium text-foreground mb-2">Harvest Period (Years 6–10)</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Fee step-down to 1.5% × <strong className="text-primary">invested capital</strong>.
              As realizations return capital, fee base shrinks. GPs typically reduce to 1.5% after commitment period ends.
            </p>
          </div>
        </div>
      </div>

      {/* Waterfall structures */}
      <div>
        <SectionTitle><Layers className="w-4 h-4" /> Distribution Waterfall Structures</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="text-sm font-medium text-amber-300 mb-2">European (Whole-Fund)</p>
            <ol className="space-y-2 text-xs text-muted-foreground">
              <li className="flex gap-2"><span className="text-amber-400 font-medium">1.</span> Return 100% of invested capital to LPs</li>
              <li className="flex gap-2"><span className="text-amber-400 font-medium">2.</span> Return 100% of management fees and fund expenses</li>
              <li className="flex gap-2"><span className="text-amber-400 font-medium">3.</span> Pay 8% preferred return (compounded annually) to LPs</li>
              <li className="flex gap-2"><span className="text-amber-400 font-medium">4.</span> GP catch-up: GP receives 20% until 20/80 split on all profits</li>
              <li className="flex gap-2"><span className="text-amber-400 font-medium">5.</span> 80% LP / 20% GP on remaining profits (carried interest)</li>
            </ol>
            <p className="text-xs text-muted-foreground mt-2 italic">LP-friendly: GP only gets carry after full fund returns hurdle</p>
          </div>
          <div className="rounded-md border border-border bg-primary/10 p-4">
            <p className="text-sm font-medium text-primary mb-2">American (Deal-by-Deal)</p>
            <ol className="space-y-2 text-xs text-muted-foreground">
              <li className="flex gap-2"><span className="text-primary font-medium">1.</span> Return invested capital for <em>that specific deal</em></li>
              <li className="flex gap-2"><span className="text-primary font-medium">2.</span> 8% pref on capital invested in that deal</li>
              <li className="flex gap-2"><span className="text-primary font-medium">3.</span> GP catch-up on deal profits</li>
              <li className="flex gap-2"><span className="text-primary font-medium">4.</span> 80/20 split on remaining deal profits</li>
              <li className="flex gap-2"><span className="text-primary font-medium">5.</span> Clawback provision applies if later deals underperform</li>
            </ol>
            <p className="text-xs text-muted-foreground mt-2 italic">GP-friendly: early carry on winning deals before full fund close</p>
          </div>
        </div>
      </div>

      {/* LP/GP economics at various IRR levels */}
      <div>
        <SectionTitle><BarChart3 className="w-4 h-4" /> LP vs GP Economics at Various Fund IRR Levels</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-2 pr-4">Gross IRR</th>
                <th className="text-right py-2 pr-4">Gross Value</th>
                <th className="text-right py-2 pr-4">GP Carry</th>
                <th className="text-right py-2 pr-4">LP Profit</th>
                <th className="text-right py-2 pr-4">LP Net IRR</th>
                <th className="text-right py-2">LP Net MOIC</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map(({ irr, econ: sc }) => (
                <tr key={irr} className={cn(
                  "border-b border-border/50 hover:bg-muted/30 transition-colors",
                  irr === targetIRR ? "bg-primary/10" : ""
                )}>
                  <td className="py-2 pr-4 font-medium text-foreground">{irr}%</td>
                  <td className="text-right py-2 pr-4 text-muted-foreground">${sc.grossValue.toFixed(0)}M</td>
                  <td className="text-right py-2 pr-4 text-amber-400">${sc.gpCarry.toFixed(0)}M</td>
                  <td className="text-right py-2 pr-4 text-emerald-400">${sc.lpProfit.toFixed(0)}M</td>
                  <td className="text-right py-2 pr-4 text-primary">{fmtIRR(sc.netIRR)}</td>
                  <td className="text-right py-2 text-primary">{fmtMult(sc.moic)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clawback */}
      <div>
        <SectionTitle><AlertTriangle className="w-4 h-4" /> Clawback Provisions</SectionTitle>
        <InfoBox variant="amber">
          <strong>Clawback obligation:</strong> Under deal-by-deal waterfall, if the GP has received carry on early winning deals but the overall fund IRR falls below the preferred return, the GP must <em>return</em> excess carry to LPs. In practice, GPs hold 30–50% of carry in escrow accounts to fund potential clawback obligations. Most PE fund LPAs require clawback resolution within 30–60 days of final fund wind-down. GPs typically establish personal guarantees from individual partners to backstop clawback risk.
        </InfoBox>
      </div>

      {/* High water mark */}
      <div>
        <SectionTitle><Info className="w-4 h-4" /> High Water Mark</SectionTitle>
        <InfoBox variant="blue">
          <strong>High water mark in PE context:</strong> Unlike hedge funds (annual mark-to-market), PE funds use a <em>lifetime high water mark</em> on net asset value across the entire fund life. The GP cannot earn new carry on a deal until all prior losses have been recouped across the portfolio. This is enforced via the whole-fund waterfall — LPs must receive full capital return + preferred return before any carry distribution, regardless of individual deal winners.
        </InfoBox>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 5 — Deal Sourcing & Diligence
// ══════════════════════════════════════════════════════════════════════════════

const DEAL_FUNNEL = [
  { stage: "Initial Opportunities", count: 1000, pct: 100, color: "#6366f1" },
  { stage: "Serious Reviews", count: 100, pct: 10, color: "#8b5cf6" },
  { stage: "Management Meetings", count: 25, pct: 2.5, color: "#a78bfa" },
  { stage: "Term Sheets / LOIs", count: 10, pct: 1, color: "#c4b5fd" },
  { stage: "Signed / Exclusivity", count: 3, pct: 0.3, color: "#ddd6fe" },
  { stage: "Closed Deals", count: 1, pct: 0.1, color: "#10b981" },
];

const DEAL_PROCESS = [
  { step: "CIM Release", days: "Day 1", description: "Confidential Information Memorandum distributed to shortlisted PE firms by banker" },
  { step: "Indication of Interest (IOI)", days: "Day 14–21", description: "Non-binding 2-page letter with valuation range, equity check, and proposed structure" },
  { step: "Management Presentation", days: "Day 28–42", description: "2–3 hour deep dive with CEO/CFO. Business plan, competitive positioning, growth strategy" },
  { step: "Letter of Intent (LOI)", days: "Day 45–60", description: "Binding price, key terms, exclusivity period (45–60 days), break fee provisions" },
  { step: "Exclusivity & Full Diligence", days: "Day 60–120", description: "Commercial, financial, legal, IT, environmental, management DD. QofE report from Big 4" },
  { step: "SPA Negotiation", days: "Day 100–140", description: "Stock/asset purchase agreement, reps & warranties, escrow, MAE definitions, closing conditions" },
  { step: "Close", days: "Day 140–160", description: "Regulatory approvals cleared, financing funded, legal close, wire transfer, board change" },
];

const SOURCING_CHANNELS = [
  {
    channel: "Investment Bank (Sell-Side)",
    dealShare: 55,
    avgCompetitors: 8,
    winRate: 12,
    color: "#8b5cf6",
  },
  {
    channel: "Direct / Proprietary",
    dealShare: 25,
    avgCompetitors: 1,
    winRate: 45,
    color: "#10b981",
  },
  {
    channel: "Portfolio Co. Referrals",
    dealShare: 12,
    avgCompetitors: 2,
    winRate: 38,
    color: "#3b82f6",
  },
  {
    channel: "M&A Advisors",
    dealShare: 8,
    avgCompetitors: 5,
    winRate: 20,
    color: "#f59e0b",
  },
];

function DealSourcing() {
  const maxCount = DEAL_FUNNEL[0].count;

  return (
    <div className="space-y-8">
      {/* Deal funnel */}
      <div>
        <SectionTitle><Search className="w-4 h-4" /> Deal Conversion Funnel</SectionTitle>
        <div className="rounded-md border border-border bg-foreground/5 p-4">
          <div className="space-y-2">
            {DEAL_FUNNEL.map((stage) => (
              <div key={stage.stage} className="flex items-center gap-3">
                <div className="w-40 text-xs text-muted-foreground text-right flex-shrink-0">{stage.stage}</div>
                <div className="flex-1 h-8 bg-foreground/5 rounded-lg overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(stage.count / maxCount) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-lg flex items-center justify-end pr-2"
                    style={{ backgroundColor: stage.color }}
                  >
                    <span className="text-xs font-medium text-foreground">{stage.count}</span>
                  </motion.div>
                </div>
                <div className="w-12 text-xs text-muted-foreground text-right flex-shrink-0">{stage.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sourcing channels */}
      <div>
        <SectionTitle><Briefcase className="w-4 h-4" /> Deal Sourcing Channels</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SOURCING_CHANNELS.map((ch) => (
            <div key={ch.channel} className="rounded-md border border-border bg-foreground/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-foreground">{ch.channel}</p>
                <Badge className="text-xs" style={{ backgroundColor: ch.color + "33", color: ch.color, borderColor: ch.color + "55" }}>
                  {ch.dealShare}% of deals
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Avg Competitors: </span>
                  <span className="text-foreground font-medium">{ch.avgCompetitors}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Win Rate: </span>
                  <span className={cn("font-medium", ch.winRate >= 30 ? "text-emerald-400" : "text-amber-400")}>
                    {ch.winRate}%
                  </span>
                </div>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${ch.winRate}%`, backgroundColor: ch.color }}
                />
              </div>
            </div>
          ))}
        </div>
        <InfoBox variant="emerald">
          <strong>Proprietary advantage:</strong> Firms with strong operating partner networks and CEO communities generate 3–4x higher win rates on directly sourced deals. Firms like KKR (Industry Councils), Carlyle (Global Advisory Board), and Blackstone (portfolio company CEOs) invest heavily in proprietary sourcing infrastructure to escape auction dynamics.
        </InfoBox>
      </div>

      {/* Deal anatomy / process */}
      <div>
        <SectionTitle><FileText className="w-4 h-4" /> Deal Anatomy — CIM to Close</SectionTitle>
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-foreground/10" />
          <div className="space-y-4">
            {DEAL_PROCESS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="relative flex gap-4 pl-14"
              >
                <div className="absolute left-3 top-2 w-6 h-6 rounded-full bg-primary border-2 border-border flex items-center justify-center text-xs font-medium text-foreground z-10">
                  {i + 1}
                </div>
                <div className="rounded-md border border-border bg-foreground/5 p-3 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-foreground">{step.step}</p>
                    <Badge className="bg-muted text-muted-foreground text-xs border-border">{step.days}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Commercial due diligence */}
      <div>
        <SectionTitle><Target className="w-4 h-4" /> Commercial Due Diligence Framework</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: "Market Assessment",
              items: [
                "TAM/SAM/SOM sizing — bottom-up and top-down",
                "Market growth drivers and secular tailwinds",
                "Regulatory environment and barriers to entry",
                "Competitive intensity: HHI, Porter's 5 Forces",
              ],
              icon: BarChart3,
              color: "text-primary",
            },
            {
              title: "Competitive Position",
              items: [
                "Win/loss analysis and NPS benchmarking",
                "Pricing power vs. competitor set",
                "Customer churn and retention dynamics",
                "Technology moat and R&D intensity",
              ],
              icon: TrendingUp,
              color: "text-primary",
            },
            {
              title: "Customer Analysis",
              items: [
                "Revenue concentration: top-10 customer %",
                "Contract duration and renewal rates",
                "Upsell/cross-sell potential within accounts",
                "Key customer dependency risk (>10% = red flag)",
              ],
              icon: Users,
              color: "text-emerald-400",
            },
            {
              title: "Management 100-Day Plan",
              items: [
                "Quick wins: cost actions and pricing improvements",
                "Growth initiatives: new geographies, products",
                "Organizational changes: C-suite hires",
                "Reporting improvements: dashboards, KPIs",
              ],
              icon: Briefcase,
              color: "text-amber-400",
            },
          ].map((section) => (
            <div key={section.title} className="rounded-md border border-border bg-foreground/5 p-4">
              <p className={cn("text-sm font-medium mb-3 flex items-center gap-2", section.color)}>
                <section.icon className="w-4 h-4" />
                {section.title}
              </p>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <ArrowRight className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Post-close */}
      <div>
        <SectionTitle><CheckCircle className="w-4 h-4" /> Post-Close: 100-Day Plan &amp; Value Creation Roadmap</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              phase: "Days 1–30",
              title: "Foundation",
              color: "border-primary/40 bg-primary/10",
              titleColor: "text-primary",
              items: [
                "Onboard new board / operating partners",
                "Establish weekly management cadence",
                "Lock in quick-win cost actions",
                "Assess management team capabilities",
                "Confirm data room assumptions",
              ],
            },
            {
              phase: "Days 31–70",
              title: "Acceleration",
              color: "border-amber-500/40 bg-amber-500/10",
              titleColor: "text-amber-300",
              items: [
                "Launch procurement renegotiations",
                "Implement KPI dashboard / reporting",
                "Begin bolt-on acquisition pipeline",
                "Execute pricing optimization study",
                "Finalize org structure changes",
              ],
            },
            {
              phase: "Days 71–100",
              title: "Scale",
              color: "border-emerald-500/40 bg-emerald-500/10",
              titleColor: "text-emerald-300",
              items: [
                "Present full 5-year value creation plan to board",
                "Launch first bolt-on exclusivity process",
                "Close initial cost savings initiatives",
                "Hire key C-suite additions",
                "Establish ESG framework and reporting",
              ],
            },
          ].map((phase) => (
            <div key={phase.phase} className={cn("rounded-md border p-4", phase.color)}>
              <div className="mb-3">
                <Badge className="bg-muted text-muted-foreground text-xs border-border mb-1">{phase.phase}</Badge>
                <p className={cn("text-sm font-medium", phase.titleColor)}>{phase.title}</p>
              </div>
              <ul className="space-y-1.5">
                {phase.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE ROOT
// ══════════════════════════════════════════════════════════════════════════════

export default function PrivateEquityPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-1"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-primary/20 border border-border flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Private Equity &amp; LBO Analysis</h1>
              <p className="text-sm text-muted-foreground">Industry overview, LBO modeling, value creation, fund economics, deal sourcing</p>
            </div>
          </div>
          <div className="flex gap-3 mt-2">
            <Badge className="bg-primary/20 text-primary border-border">$7T Global AUM</Badge>
            <Badge className="bg-muted text-muted-foreground border-border">Buyout | VC | Growth</Badge>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">IRR Modeling</Badge>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-foreground/5 border border-border flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-foreground text-xs">
              Industry Overview
            </TabsTrigger>
            <TabsTrigger value="lbo" className="data-[state=active]:bg-primary data-[state=active]:text-foreground text-xs">
              LBO Modeling
            </TabsTrigger>
            <TabsTrigger value="value" className="data-[state=active]:bg-primary data-[state=active]:text-foreground text-xs">
              Value Creation
            </TabsTrigger>
            <TabsTrigger value="fundeconomics" className="data-[state=active]:bg-primary data-[state=active]:text-foreground text-xs">
              Fund Economics
            </TabsTrigger>
            <TabsTrigger value="sourcing" className="data-[state=active]:bg-primary data-[state=active]:text-foreground text-xs">
              Deal Sourcing &amp; Diligence
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <IndustryOverview />
            </motion.div>
          </TabsContent>

          <TabsContent value="lbo" className="mt-6 data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <LBOModeling />
            </motion.div>
          </TabsContent>

          <TabsContent value="value" className="mt-6 data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <ValueCreation />
            </motion.div>
          </TabsContent>

          <TabsContent value="fundeconomics" className="mt-6 data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <FundEconomics />
            </motion.div>
          </TabsContent>

          <TabsContent value="sourcing" className="mt-6 data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <DealSourcing />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
